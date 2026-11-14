// client/src/lib/perfil.js
// Avatares de los jugadores (emoji + color), con una caché compartida y peticiones agrupadas.
import { useEffect, useState } from 'react';

const cache = new Map(); // nombre → { avatar, color } | null
const pendientes = new Set();
let temporizador = null;
const EVENTO = 'minijuegos-perfiles';
export let OPCIONES = { avatares: [], colores: [] };

function pedir() {
  temporizador = null;
  const nombres = [...pendientes]; pendientes.clear();
  if (!nombres.length) return;
  fetch(`/api/perfil?nombres=${encodeURIComponent(nombres.join(','))}`).then((r) => (r.ok ? r.json() : null)).then((d) => {
    if (!d) return;
    OPCIONES = { avatares: d.avatares, colores: d.colores };
    nombres.forEach((n) => cache.set(n, d.perfiles[n] || null));
    window.dispatchEvent(new Event(EVENTO));
  }).catch(() => {});
}
function encolar(nombres) {
  nombres.filter((n) => n && n.includes('#') && !cache.has(n)).forEach((n) => { pendientes.add(n); cache.set(n, null); });
  if (pendientes.size && !temporizador) temporizador = setTimeout(pedir, 30);
}
/** Perfiles de una lista de jugadores («Ana#1234»). */
export function usePerfiles(nombres) {
  const clave = (nombres || []).join(',');
  const [, setVer] = useState(0);
  useEffect(() => {
    encolar(nombres || []);
    const f = () => setVer((x) => x + 1);
    window.addEventListener(EVENTO, f);
    return () => window.removeEventListener(EVENTO, f);
  }, [clave]); // eslint-disable-line react-hooks/exhaustive-deps
  return Object.fromEntries((nombres || []).map((n) => [n, cache.get(n) || null]));
}
export async function cargarOpciones() {
  if (OPCIONES.avatares.length) return OPCIONES;
  const r = await fetch('/api/perfil'); const d = await r.json();
  OPCIONES = { avatares: d.avatares, colores: d.colores };
  return OPCIONES;
}
export async function guardarPerfil(jugador, avatar, color) {
  const r = await fetch('/api/perfil', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jugador, avatar, color }) });
  if (!r.ok) throw new Error('No se pudo guardar el perfil.');
  cache.set(jugador, { avatar, color });
  window.dispatchEvent(new Event(EVENTO));
}
