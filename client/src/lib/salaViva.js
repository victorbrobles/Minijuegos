// client/src/lib/salaViva.js
// Detecta en qué sala online estás (todas las salas se consultan con GET /api/<juego>/…/sala/<CÓDIGO>) sin tocar
// cada juego: se observa la respuesta, se guarda el marcador y se comparte con el servidor para el modo tele y
// las reacciones (/api/social/sala/<juego>/<código>).
import { useEffect, useState } from 'react';
import { nombreIdentidad } from './identidad.js';

const RUTA = /^\/api\/([a-z0-9-]+)\/(?:[a-z-]+\/)?sala\/([A-Za-z0-9]{3,8})(?:\?|$)/;
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
  actual = { juego, api, code: code.toUpperCase(), jugadores, estado, visto: Date.now() };
  if (nuevo) window.dispatchEvent(new Event(EVENTO));
  const ahora = Date.now();
  if (ahora - ultimoEnvio > 3000) {
    ultimoEnvio = ahora;
    original(`/api/social/sala/${encodeURIComponent(juego)}/${actual.code}/estado`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: nombreIdentidad(), jugadores, estado })
    }).catch(() => {});
  }
}

let original = typeof window !== 'undefined' ? window.fetch.bind(window) : null;
let instalado = false;
export function instalarSalaViva() {
  if (instalado || typeof window === 'undefined') return;
  instalado = true;
  original = window.fetch.bind(window);
  window.fetch = async (entrada, opciones) => {
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
export const EVENTO_SALA_VIVA = EVENTO;
export const fetchOriginal = (...a) => (original || window.fetch)(...a);
