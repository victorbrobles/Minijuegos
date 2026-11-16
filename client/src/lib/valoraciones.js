// client/src/lib/valoraciones.js
// 👍/👎 de cada juego: tu voto se recuerda en este navegador y el resumen de todos viene del servidor.
import { useEffect, useState } from 'react';
import { nombreCompleto } from './identidad.js';

const MIOS = 'minijuegos_valoraciones';
let cache = null;
let pidiendo = null;
const oyentes = new Set();

export const misVotos = () => { try { return JSON.parse(localStorage.getItem(MIOS) || '{}'); } catch { return {}; } };
export const miVoto = (juego) => misVotos()[juego] || 0;

function cargar() {
  if (!pidiendo) {
    pidiendo = fetch('/api/valoraciones').then((r) => r.json()).then((d) => { cache = d.valoraciones || {}; oyentes.forEach((f) => f(cache)); })
      .catch(() => { pidiendo = null; });
  }
  return pidiendo;
}

/** { juego: { si, no } } de todos (o null mientras carga). */
export function useValoraciones() {
  const [v, setV] = useState(cache);
  useEffect(() => { oyentes.add(setV); if (!cache) cargar(); return () => oyentes.delete(setV); }, []);
  return v;
}

export function votar(juego, voto) {
  const antes = miVoto(juego);
  try { localStorage.setItem(MIOS, JSON.stringify({ ...misVotos(), [juego]: voto })); } catch { /* nada */ }
  if (cache) { // se ve al momento, sin esperar al servidor
    const r = { si: 0, no: 0, ...cache[juego] };
    if (antes === 1) r.si -= 1; if (antes === -1) r.no -= 1;
    if (voto === 1) r.si += 1; if (voto === -1) r.no += 1;
    cache = { ...cache, [juego]: r }; oyentes.forEach((f) => f(cache));
  }
  // Un voto por jugador (Nombre#1234); sin nombre, el voto solo se recuerda en este móvil
  const quien = nombreCompleto();
  if (!quien) return;
  fetch('/api/valoraciones', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ juego, voto, quien }) }).catch(() => {});
}

/** Porcentaje de 👍 (o null si hay pocos votos). */
export function porcentaje(r, minimo = 3) {
  const total = (r?.si || 0) + (r?.no || 0);
  return total >= minimo ? Math.round((r.si / total) * 100) : null;
}

/** Puntuación para ordenar «mejor valorados» sin premiar a los que tienen 1 solo voto (Wilson, 95 %). */
export function puntuacion(r) {
  const n = (r?.si || 0) + (r?.no || 0);
  if (!n) return 0;
  const p = r.si / n; const z = 1.96;
  return (p + (z * z) / (2 * n) - z * Math.sqrt((p * (1 - p) + (z * z) / (4 * n)) / n)) / (1 + (z * z) / n);
}
