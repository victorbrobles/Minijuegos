// client/src/lib/caras.js
// ¿Quién es «Ana» en esta partida? Los juegos usan nombres sin número («Ana»); para enseñar su avatar hace falta su
// identidad completa («Ana#1234»). Se busca en: la sala online en la que estás (cada móvil avisa de quién es),
// tu propio nombre y los jugadores de tus grupos.
import { useSyncExternalStore } from 'react';
import { nombreCompleto, nombreIdentidad } from './identidad.js';
import { salaActual, EVENTO_SALA_VIVA } from './salaViva.js';

const norm = (t) => String(t || '').trim().toLowerCase();
let salaCaras = {};      // plano normalizado → completo (sala online actual)
let salaClave = '';
let conocidos = {};      // plano normalizado → completo (solo si no hay dos con el mismo nombre)
let conocidosDe = '';
let version = 0;
const oyentes = new Set();
const avisar = () => { version += 1; oyentes.forEach((f) => f()); };

async function cargarConocidos() {
  const yo = nombreCompleto();
  if (!yo || conocidosDe === yo) return;
  conocidosDe = yo;
  try {
    const d = await fetch(`/api/social/conocidos?jugador=${encodeURIComponent(yo)}`).then((r) => r.json());
    const mapa = {}; const repetidos = new Set();
    (d.jugadores || []).forEach((c) => {
      const p = norm(c.replace(/#\d{4}$/, ''));
      if (mapa[p] && mapa[p] !== c) repetidos.add(p); else mapa[p] = c;
    });
    repetidos.forEach((p) => delete mapa[p]);
    conocidos = mapa;
    avisar();
  } catch { conocidosDe = ''; }
}

async function cargarSala() {
  const s = salaActual();
  if (!s?.juego || !s?.code) { if (salaClave) { salaClave = ''; salaCaras = {}; avisar(); } return; }
  try {
    const d = await fetch(`/api/social/sala/${encodeURIComponent(s.juego)}/${s.code}`).then((r) => r.json());
    const mapa = {};
    Object.entries(d.caras || {}).forEach(([p, c]) => { mapa[norm(p)] = c; });
    const clave = `${s.juego}:${s.code}:${JSON.stringify(mapa)}`;
    if (clave !== salaClave) { salaClave = clave; salaCaras = mapa; avisar(); }
  } catch { /* sin conexión: se queda lo que había */ }
}

let temporizador = null;
function suscribir(f) {
  oyentes.add(f);
  if (oyentes.size === 1) {
    cargarConocidos(); cargarSala();
    temporizador = setInterval(cargarSala, 8000);
    window.addEventListener(EVENTO_SALA_VIVA, cargarSala);
  }
  return () => {
    oyentes.delete(f);
    if (!oyentes.size) { clearInterval(temporizador); temporizador = null; window.removeEventListener(EVENTO_SALA_VIVA, cargarSala); }
  };
}

/** Identidad completa de un jugador por su nombre en la partida (o null si no se sabe). */
export function resolverJugador(nombre) {
  const n = String(nombre || '').trim();
  if (!n) return null;
  if (/^[^#]{1,15}#\d{4}$/.test(n)) return n;
  const p = norm(n);
  if (salaCaras[p]) return salaCaras[p];
  if (p === norm(nombreIdentidad()) && nombreCompleto()) return nombreCompleto();
  return conocidos[p] || null;
}

export function useJugadorCompleto(nombre) {
  useSyncExternalStore(suscribir, () => version);
  return resolverJugador(nombre);
}
