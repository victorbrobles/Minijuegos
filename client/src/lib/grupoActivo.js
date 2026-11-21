// client/src/lib/grupoActivo.js
// Grupo activo de tu cuenta: quién está online con él, quién hace de administrador y la partida del grupo.
// Un único sondeo (cada 3 s) para toda la web, solo con la sesión iniciada. Además:
//  - el «piloto», que mete a un miembro en la sala de espera del administrador sin teclear el código (pulsa los
//    botones comunes de los juegos: «Jugar online», «Unirse con código», «Entrar en la partida»…);
//  - el bloqueo de «Crear partida» para quien no es el administrador cuando sois 2 o más.
import { useEffect, useState } from 'react';
import { salaActual, EVENTO_SALA_VIVA } from './salaViva.js';
import { cuentaActual, useCuenta } from './cuenta.js';

const CADA_MS = 3000;
let estado = null; // respuesta de /api/social/grupo-activo
let temporizador = null;
const oyentes = new Set();
const notificar = () => oyentes.forEach((f) => f());

export async function refrescarGrupo() {
  if (!cuentaActual()) { if (estado) { estado = null; notificar(); } return null; }
  try {
    const r = await fetch('/api/social/grupo-activo', { credentials: 'same-origin' });
    const d = await r.json();
    estado = d?.grupo ? d : null;
  } catch { /* sin conexión: se mantiene el último */ }
  notificar();
  return estado;
}
function arrancar() { if (!temporizador) { refrescarGrupo(); temporizador = setInterval(refrescarGrupo, CADA_MS); } }
function parar() { clearInterval(temporizador); temporizador = null; }

/** Estado del grupo activo (o null si no hay grupo activo o no hay sesión). */
export function useGrupoActivo() {
  const { usuario } = useCuenta();
  const [, setN] = useState(0);
  useEffect(() => {
    const f = () => setN((n) => n + 1);
    oyentes.add(f); arrancar();
    return () => { oyentes.delete(f); if (!oyentes.size) parar(); };
  }, []);
  useEffect(() => { refrescarGrupo(); }, [usuario?.jugador]);
  return usuario ? estado : null;
}
export const grupoActivoAhora = () => (cuentaActual() ? estado : null);
/** ¿El grupo cambia cómo funciona la web? Solo con 2 o más miembros online con él activo. */
export const grupoEnJuego = (g = grupoActivoAhora()) => Boolean(g?.grupo && g.enGrupo);

const post = (url, body) => fetch(url, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  .then(async (r) => ({ ok: r.ok, datos: await r.json().catch(() => ({})) }));

/** El administrador anuncia la sala en la que está (o la cierra). */
export async function anunciarPartida(datos) {
  const r = await post('/api/social/grupo-activo/partida', datos).catch(() => null);
  if (r?.ok && r.datos?.grupo) { estado = r.datos; notificar(); }
  return r;
}
export const cerrarPartidaGrupo = (codigo) => anunciarPartida({ cerrar: true, codigo });

/* ───────── Piloto: entrar solo en la sala del administrador ───────── */
const PILOTO = 'minijuegos_piloto';
export function entrarEnPartida(juego, codigo, navigate, api) {
  try { sessionStorage.setItem(PILOTO, JSON.stringify({ juego, codigo, api, hasta: Date.now() + 25000 })); } catch { /* nada */ }
  navigate(`/juego/${juego}?sala=${encodeURIComponent(codigo)}`);
}
function leerPiloto(juego) {
  try { const p = JSON.parse(sessionStorage.getItem(PILOTO)); return p && p.juego === juego && Date.now() < p.hasta ? p : null; } catch { return null; }
}
export const pilotoActivo = (juego) => Boolean(leerPiloto(juego));
const quitarPiloto = () => { try { sessionStorage.removeItem(PILOTO); } catch { /* nada */ } };

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
/** Código de la sala de espera que se ve en pantalla (juegos que no consultan su sala con fetch, p. ej. por WebSocket). */
export function codigoEnPantalla() {
  const c = document.querySelector('.game-shell .qq-codigo-btn, .game-shell [class*="codigo"]:not(input)');
  const t = c?.textContent?.replace(/[^A-Z0-9]/g, '') || '';
  return /^[A-Z0-9]{4,6}$/.test(t) ? t : null;
}

/** En GamePage: si te han metido en la partida del grupo, pulsa por ti hasta entrar en la sala de espera. */
export function usePilotoGrupo(juego, navegacion) {
  const [aviso, setAviso] = useState(null);
  useEffect(() => {
    const p = leerPiloto(juego);
    if (!p) return undefined;
    setAviso('Entrando en la sala del grupo…');
    const pulsados = new Set();
    let vivo = true;
    const listo = () => { quitarPiloto(); vivo = false; setAviso(null); };
    const paso = () => {
      if (!vivo) return;
      const sala = salaActual();
      if ((sala && sala.juego === juego && sala.code === p.codigo) || codigoEnPantalla() === p.codigo) { listo(); return; }
      if (Date.now() > p.hasta) { listo(); setAviso(`No he podido entrar solo: únete con el código ${p.codigo}.`); setTimeout(() => setAviso(null), 9000); return; }
      const pulsar = (re, clave) => { const b = botonCon(re); if (b && !pulsados.has(clave)) { pulsados.add(clave); b.click(); return true; } return false; };
      const campo = campoCodigo();
      if (campo) {
        if (!campo.value) escribir(campo, p.codigo);
        const b = botonCon(/^(Entrar en la partida|Unirse|Unirme|Entrar)\b/i);
        if (b && campo.value && !pulsados.has('entrar')) { pulsados.add('entrar'); setTimeout(() => b.click(), 150); }
      } else {
        pulsar(/^Unirse con c[oó]digo\b/i, 'unirse') || pulsar(/^Jugar online\b/i, 'online')
          // Juegos con varios juegos dentro (El Laberinto): se elige el mismo que el administrador, por su API
          || (p.api && p.api !== juego && pulsar(new RegExp(`\\b${p.api}\\b`, 'i'), 'subjuego'));
      }
    };
    const t = setInterval(paso, 350);
    const f = () => paso();
    window.addEventListener(EVENTO_SALA_VIVA, f);
    return () => { vivo = false; clearInterval(t); window.removeEventListener(EVENTO_SALA_VIVA, f); };
  }, [juego, navegacion]);
  return aviso;
}

/** ¿Es un botón que crea una partida online? (solo el administrador del grupo puede) */
export const CREAR_PARTIDA = /^(Crear (una )?(partida|sala|nueva sala|la sala)|Crear$)/i;
