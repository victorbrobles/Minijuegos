// client/src/lib/caras.js
// ¿Quién es «Ana» en esta partida? Los juegos usan nombres sin número («Ana»); para enseñar su avatar hace falta su
// identidad completa («Ana#1234»). Se busca en la sala online en la que estás (cada móvil avisa de quién es) y en tu
// propio nombre. En un solo móvil, los demás jugadores llevan un avatar inventado (CaraJugador).
import { useSyncExternalStore } from 'react';
import { nombreCompleto, nombreIdentidad } from './identidad.js';
import { salaActual, EVENTO_SALA_VIVA } from './salaViva.js';

const norm = (t) => String(t || '').trim().toLowerCase();
let salaCaras = {};      // plano normalizado → completo (sala online actual)
let salaClave = '';
let version = 0;
const oyentes = new Set();
const avisar = () => { version += 1; oyentes.forEach((f) => f()); };

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
    cargarSala();
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
  return null;
}

export function useJugadorCompleto(nombre) {
  useSyncExternalStore(suscribir, () => version);
  return resolverJugador(nombre);
}
