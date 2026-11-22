// client/src/lib/salaViva.js
// Detecta en qué sala online estás (todas las salas se consultan con GET /api/<juego>/…/sala/<CÓDIGO>) sin tocar
// cada juego: se observa la respuesta, se guarda el marcador y se comparte con el servidor para el modo tele y
// las reacciones (/api/social/sala/<juego>/<código>).
import { useEffect, useState } from 'react';
import { nombreIdentidad, nombreCompleto } from './identidad.js';
import { conCabeceras } from './ocultos.js';

const RUTA = /^\/api\/([a-z0-9-]+)\/(?:[a-z-]+\/)?sala\/([A-Za-z0-9]{3,8})(?:\?|$)/;
// Cualquier petición a una sala (GET o POST): de ahí sale tu credencial en ella para poder salir al dejar el juego
const BASE_SALA = /^(\/api\/[a-z0-9-]+\/(?:[a-z-]+\/)?sala\/([A-Za-z0-9]{3,8}))(?:[/?]|$)/;
let credencial = null; // { juego, base, code, token }
const EVENTO = 'minijuegos-sala-viva';
let actual = null; // { juego, code, jugadores, estado, visto }
let ultimoEnvio = 0;

const juegoDeLaPagina = () => { const m = /^\/juego\/([^/?#]+)/.exec(window.location.pathname); return m ? m[1] : null; };
function normalizarEstado(e) {
  const x = String(e || '').toLowerCase();
  if (/lobby|espera|sala/.test(x)) return 'lobby';
  if (/fin|termin|acab/.test(x)) return 'fin';
  return x ? 'jugando' : '';
}
function extraer(d) {
  const s = d?.sala && typeof d.sala === 'object' ? d.sala : d;
  const lista = Array.isArray(s?.jugadores) ? s.jugadores : Array.isArray(d?.jugadores) ? d.jugadores : [];
  const jugadores = lista.filter((j) => j && typeof j === 'object' && j.nombre)
    .map((j) => ({ nombre: String(j.nombre), puntos: j.puntos ?? j.puntuacion ?? j.score ?? null }));
  return { jugadores, estado: normalizarEstado(s?.estado ?? d?.estado ?? d?.vista?.fase) };
}

function anotar(code, datos, api) {
  const juego = juegoDeLaPagina();
  if (!juego) return;
  const { jugadores, estado } = extraer(datos);
  const nuevo = !actual || actual.code !== code || actual.juego !== juego;
  const previo = nuevo ? {} : { creador: actual.creador, cerrada: actual.cerrada };
  actual = { ...previo, juego, api, code: code.toUpperCase(), jugadores, estado, visto: Date.now() };
  if (nuevo) window.dispatchEvent(new Event(EVENTO));
  const ahora = Date.now();
  if (ahora - ultimoEnvio > 3000) {
    ultimoEnvio = ahora;
    original(`/api/social/sala/${encodeURIComponent(juego)}/${actual.code}/estado`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: nombreIdentidad(), completo: nombreCompleto(), jugadores, estado })
    }).then((r) => r.json()).then((d) => {
      // Quién creó la sala y si la ha cerrado (al volver a la portada tras acabar): ver components/GrupoGlobal.jsx
      if (actual && actual.code === code.toUpperCase() && d) {
        const cerrada = Boolean(d.cerrada) && !actual.cerrada;
        actual.creador = d.creador || null; actual.cerrada = Boolean(d.cerrada);
        if (cerrada) window.dispatchEvent(new Event(EVENTO));
      }
    }).catch(() => {});
  }
}

function anotarCredencial(entrada, opciones) {
  const juego = juegoDeLaPagina(); if (!juego) return;
  const url = typeof entrada === 'string' ? entrada : entrada?.url || '';
  const u = new URL(url, window.location.origin);
  const m = BASE_SALA.exec(u.pathname); if (!m || /\/salir$/.test(u.pathname)) return;
  let token = u.searchParams.get('token');
  if (!token && typeof opciones?.body === 'string') { try { token = JSON.parse(opciones.body)?.token; } catch { /* nada */ } }
  if (typeof token !== 'string' || !token) return;
  credencial = { juego, base: m[1], code: m[2].toUpperCase(), token };
}
/** Al dejar un juego (portada, otro juego o cerrar la pestaña): sales de su sala online. Si eras el anfitrión, el
 *  puesto pasa a otro jugador y la partida sigue sin ti (cada juego lo resuelve en su ruta «…/salir»). */
export function salirDeSala(juego) {
  const c = credencial;
  if (!c || (juego && c.juego !== juego)) return;
  credencial = null;
  (original || window.fetch)(`${c.base}/salir`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: c.token }), keepalive: true }).catch(() => {});
}

let original = typeof window !== 'undefined' ? window.fetch.bind(window) : null;
let instalado = false;
export function instalarSalaViva() {
  if (instalado || typeof window === 'undefined') return;
  instalado = true;
  original = window.fetch.bind(window);
  window.fetch = async (entrada, opciones) => {
    opciones = conCabeceras(entrada, opciones); // quién eres, para los juegos ocultos
    try { anotarCredencial(entrada, opciones); } catch { /* nada */ }
    const res = await original(entrada, opciones);
    try {
      const url = typeof entrada === 'string' ? entrada : entrada?.url || '';
      const metodo = (opciones?.method || entrada?.method || 'GET').toUpperCase();
      const ruta = url.startsWith('http') ? new URL(url).pathname + new URL(url).search : url;
      const m = metodo === 'GET' && res.ok ? RUTA.exec(ruta) : null;
      if (m) res.clone().json().then((d) => anotar(m[2], d, m[1])).catch(() => {});
    } catch { /* nunca molesta al juego */ }
    return res;
  };
}

/** Sala online en la que estás ahora mismo en este juego (o null si hace rato que no se consulta). */
export function useSalaViva(juego) {
  const [, setN] = useState(0);
  useEffect(() => {
    const f = () => setN((n) => n + 1);
    window.addEventListener(EVENTO, f);
    const t = setInterval(f, 3000);
    return () => { window.removeEventListener(EVENTO, f); clearInterval(t); };
  }, []);
  if (!actual || actual.juego !== juego || Date.now() - actual.visto > 10000) return null;
  return actual;
}
/** Última sala online detectada (o null). */
export const salaActual = () => actual;
/** Sala online en la que estás ahora mismo (vista hace menos de `ms`), en cualquier juego. */
export const salaReciente = (ms = 10000) => (actual && Date.now() - actual.visto < ms ? actual : null);
/** Cierra la sala para todos (solo vale si la creaste tú). */
export function cerrarSalaParaTodos(sala) {
  if (!sala) return;
  original(`/api/social/sala/${encodeURIComponent(sala.juego)}/${sala.code}/cerrar`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ completo: nombreCompleto() }), keepalive: true
  }).catch(() => {});
}
export const EVENTO_SALA_VIVA = EVENTO;
export const fetchOriginal = (...a) => (original || window.fetch)(...a);
