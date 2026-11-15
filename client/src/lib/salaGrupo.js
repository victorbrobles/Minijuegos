// client/src/lib/salaGrupo.js
// Sala fija del grupo: estado compartido (un solo «latido» para toda la web), acciones del anfitrión y el
// piloto automático que, al abrir un juego desde la sala, crea la partida (anfitrión) o entra en ella (los demás)
// sin teclear el código. El piloto pulsa los botones comunes de los juegos («Jugar online», «Crear partida»,
// «Unirse con código», «Entrar en la partida»), así que funciona con cualquier juego sin tocarlo.
import { useEffect, useState } from 'react';
import { nombreCompleto } from './identidad.js';
import { salaActual, EVENTO_SALA_VIVA } from './salaViva.js';

const CLAVE = 'minijuegos_sala_grupo'; // { codigo, nombre } de la sala en la que estás
const PILOTO = 'minijuegos_piloto';     // { modo: 'crear' | 'unir', juego, codigo?, grupo, hasta }
const LATIDO_MS = 3000;
const post = (url, body) => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  .then(async (r) => ({ ok: r.ok, datos: await r.json().catch(() => ({})) }));

// ---------------------------------------------------------------- Sala activa (persistente en el navegador)
export function salaGrupoActiva() {
  try { const v = JSON.parse(localStorage.getItem(CLAVE)); return v?.codigo ? v : null; } catch { return null; }
}
function guardarActiva(v) {
  try { if (v) localStorage.setItem(CLAVE, JSON.stringify(v)); else localStorage.removeItem(CLAVE); } catch { /* sin almacenamiento */ }
  notificar();
}

// ---------------------------------------------------------------- Almacén compartido con suscripción
let estado = null; // respuesta del servidor
let error = '';
let temporizador = null;
const oyentes = new Set();
function notificar() { oyentes.forEach((f) => f()); }

async function latir() {
  const activa = salaGrupoActiva();
  if (!activa) { estado = null; return; }
  const { ok, datos } = await post(`/api/social/grupos/${activa.codigo}/sala/latido`, { jugador: nombreCompleto() }).catch(() => ({ ok: false, datos: {} }));
  if (ok) { estado = datos; error = ''; } else { error = datos.error || 'Sin conexión con la sala.'; if (datos.error) { /* ya no eres del grupo */ } }
  notificar();
}
function arrancar() {
  if (temporizador) return;
  latir();
  temporizador = setInterval(latir, LATIDO_MS);
}
function parar() { clearInterval(temporizador); temporizador = null; }

/** Estado de la sala del grupo activa (o null) y acciones. Comparte un único latido aunque se use en varios sitios. */
export function useSalaGrupo() {
  const [, setN] = useState(0);
  useEffect(() => {
    const f = () => setN((n) => n + 1);
    oyentes.add(f);
    if (salaGrupoActiva()) arrancar();
    return () => { oyentes.delete(f); if (!oyentes.size) parar(); };
  }, []);
  const activa = salaGrupoActiva();
  const yo = nombreCompleto();
  const s = activa && estado?.codigo === activa.codigo ? estado : null;
  return {
    activa, estado: s, error, yo,
    soyAnfitrion: Boolean(s && s.anfitrion === yo),
    entrar: (codigo, nombre) => { guardarActiva({ codigo, nombre }); estado = null; parar(); arrancar(); },
    salir: async () => { const a = salaGrupoActiva(); guardarActiva(null); parar(); estado = null; if (a) await post(`/api/social/grupos/${a.codigo}/sala/salir`, { jugador: yo }).catch(() => {}); notificar(); },
    pasarCorona: async (nuevo) => { const a = salaGrupoActiva(); const r = await post(`/api/social/grupos/${a.codigo}/sala/anfitrion`, { jugador: yo, nuevo }); if (r.ok) { estado = r.datos; notificar(); } return r; },
    cerrarJuego: async () => { const a = salaGrupoActiva(); const r = await post(`/api/social/grupos/${a.codigo}/sala/juego`, { jugador: yo, juego: null }); if (r.ok) { estado = r.datos; notificar(); } return r; }
  };
}

// ---------------------------------------------------------------- Partida del grupo en la que estás
// «juego:código» de la última partida del grupo en la que has entrado (o creado, si eres el anfitrión).
// Si estás en ella y el anfitrión abre otra, te pasa a la nueva sin preguntar.
const PARTIDA = 'minijuegos_partida_grupo';
export function partidaDelGrupo() { try { return sessionStorage.getItem(PARTIDA) || ''; } catch { return ''; } }
function recordarPartida(juego, codigo) { try { sessionStorage.setItem(PARTIDA, `${juego}:${codigo || ''}`); } catch { /* nada */ } }

// ---------------------------------------------------------------- Abrir juegos desde la sala
/** Anfitrión: abre un juego para el grupo. El piloto creará la partida y la anunciará en la sala. */
export async function abrirParaElGrupo(juego, navigate) {
  const a = salaGrupoActiva(); if (!a) return;
  // Se anuncia ya el juego (sin código): los demás ven «preparando…» mientras se crea la partida
  const r = await post(`/api/social/grupos/${a.codigo}/sala/juego`, { jugador: nombreCompleto(), juego: { id: juego } });
  if (r.ok) { estado = r.datos; notificar(); }
  recordarPartida(juego, '');
  ponerPiloto({ modo: 'crear', juego, grupo: a.codigo });
  navigate(`/juego/${juego}`);
}
/** Los demás: entrar en la partida que ha abierto el anfitrión. */
export function entrarEnPartida(juego, codigo, navigate, api) {
  const a = salaGrupoActiva(); if (!a) return;
  recordarPartida(juego, codigo);
  ponerPiloto({ modo: 'unir', juego, codigo, api, grupo: a.codigo });
  navigate(`/juego/${juego}?sala=${encodeURIComponent(codigo)}`);
}
// El piloto pulsa botones durante 25 s; el anfitrión puede tardar más en elegir opciones de la sala, así que su
// partida se sigue esperando (para anunciarla) hasta 5 minutos.
function ponerPiloto(p) {
  const ahora = Date.now();
  try { sessionStorage.setItem(PILOTO, JSON.stringify({ ...p, pulsarHasta: ahora + 25000, hasta: ahora + (p.modo === 'crear' ? 300000 : 25000) })); } catch { /* nada */ }
}
function leerPiloto(juego) {
  try { const p = JSON.parse(sessionStorage.getItem(PILOTO)); return p && p.juego === juego && Date.now() < p.hasta ? p : null; } catch { return null; }
}
const quitarPiloto = () => { try { sessionStorage.removeItem(PILOTO); } catch { /* nada */ } };

// ---------------------------------------------------------------- Piloto automático (en la página del juego)
const visible = (el) => Boolean(el && el.offsetParent !== null && !el.disabled);
function botonCon(re) {
  const candidatos = [...document.querySelectorAll('.game-shell button, .game-shell [role="button"]')];
  return candidatos.find((b) => visible(b) && !b.closest('.ayj, .rx-barra, .snd') && re.test((b.innerText || b.textContent).replace(/\s+/g, ' ').trim()));
}
function escribir(input, valor) {
  const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
  set.call(input, valor); input.dispatchEvent(new Event('input', { bubbles: true }));
}
function campoCodigo() {
  const c = [...document.querySelectorAll('.game-shell input')].filter(visible);
  return c.find((i) => i.id === 'qq-code-input') || c.find((i) => /c[oó]digo|abcd/i.test(`${i.placeholder} ${i.getAttribute('aria-label') || ''} ${i.id}`));
}

/** Código de la sala de espera que se ve en pantalla (para juegos que no consultan su sala con fetch, p. ej. por WebSocket). */
function codigoEnPantalla() {
  const c = document.querySelector('.game-shell .qq-codigo-btn, .game-shell [class*="codigo"]:not(input)');
  const t = c?.textContent?.replace(/[^A-Z0-9]/g, '') || '';
  return /^[A-Z0-9]{4,6}$/.test(t) ? t : null;
}

/** En GamePage: si se ha abierto el juego desde la sala del grupo, pulsa por ti hasta crear o entrar en la partida. */
export function usePilotoGrupo(juego, navegacion) {
  const [aviso, setAviso] = useState(null);
  useEffect(() => {
    const p = leerPiloto(juego);
    if (!p) return undefined;
    setAviso(p.modo === 'crear' ? 'Creando la partida para el grupo…' : 'Entrando en la partida del grupo…');
    const pulsados = new Set();
    let vivo = true;
    const anunciar = async (codigo, api) => {
      await post(`/api/social/grupos/${p.grupo}/sala/juego`, { jugador: nombreCompleto(), juego: { id: juego, codigo, api } }).catch(() => {});
      latir();
    };
    const listo = () => { quitarPiloto(); vivo = false; setAviso(null); };
    const paso = () => {
      if (!vivo) return;
      const sala = salaActual();
      if (sala && sala.juego === juego && (p.modo === 'crear' || sala.code === p.codigo)) {
        if (p.modo === 'crear') { recordarPartida(juego, sala.code); anunciar(sala.code, sala.api); }
        listo(); return;
      }
      // Respaldo: la sala de espera ya enseña el código (juegos por WebSocket)
      const enPantalla = codigoEnPantalla();
      if (enPantalla && (p.modo === 'crear' || enPantalla === p.codigo)) {
        if (p.modo === 'crear') { recordarPartida(juego, enPantalla); anunciar(enPantalla, null); }
        listo(); return;
      }
      if (Date.now() > p.hasta) { listo(); if (p.modo === 'unir') { setAviso(`No he podido entrar solo: únete con el código ${p.codigo}.`); setTimeout(() => setAviso(null), 8000); } return; }
      if (Date.now() > p.pulsarHasta) { setAviso(null); return; } // solo queda esperar a que el anfitrión cree la sala
      const pulsar = (re, clave) => { const b = botonCon(re); if (b && !pulsados.has(clave)) { pulsados.add(clave); b.click(); return true; } return false; };
      if (p.modo === 'crear') {
        // Si la sala necesita elegir opciones («Crear sala»), se deja al anfitrión: solo se navega por los menús
        pulsar(/^Crear partida\b/i, 'crear') || pulsar(/^Jugar online\b/i, 'online');
      } else {
        const campo = campoCodigo();
        if (campo) {
          if (!campo.value) escribir(campo, p.codigo);
          const b = botonCon(/^(Entrar en la partida|Unirse|Unirme|Entrar)\b/i);
          if (b && campo.value && !pulsados.has('entrar')) { pulsados.add('entrar'); setTimeout(() => b.click(), 150); }
        } else {
          pulsar(/^Unirse con c[oó]digo\b/i, 'unirse') || pulsar(/^Jugar online\b/i, 'online')
            // Juegos con varios juegos dentro (El Laberinto): se elige el mismo que el anfitrión, por su API
            || (p.api && p.api !== juego && pulsar(new RegExp(`\\b${p.api}\\b`, 'i'), 'subjuego'));
        }
      }
    };
    const t = setInterval(paso, 350);
    const f = () => paso();
    window.addEventListener(EVENTO_SALA_VIVA, f);
    return () => { vivo = false; clearInterval(t); window.removeEventListener(EVENTO_SALA_VIVA, f); };
  }, [juego, navegacion]);
  return aviso;
}
