// client/src/games/Encadenada/motor.js
// Cambia una letra cada vez hasta llegar a la palabra objetivo. Caminos mínimos con BFS.
import PALABRAS from './diccionario.js';

export const DICCIONARIO = new Set(PALABRAS);

export const difiereEnUna = (a, b) => {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) d++;
  return d === 1;
};

let vecinosCache = null;
function vecinos() {
  if (vecinosCache) return vecinosCache;
  vecinosCache = new Map(PALABRAS.map((p) => [p, PALABRAS.filter((q) => difiereEnUna(p, q))]));
  return vecinosCache;
}

/** Camino más corto entre dos palabras (incluye ambas) o null. */
export function caminoMinimo(desde, hasta) {
  if (!DICCIONARIO.has(desde) || !DICCIONARIO.has(hasta)) return null;
  const v = vecinos();
  const previo = new Map([[desde, null]]);
  const cola = [desde];
  while (cola.length) {
    const p = cola.shift();
    if (p === hasta) break;
    for (const q of v.get(p)) if (!previo.has(q)) { previo.set(q, p); cola.push(q); }
  }
  if (!previo.has(hasta)) return null;
  const camino = [];
  for (let p = hasta; p; p = previo.get(p)) camino.unshift(p);
  return camino;
}

/** Reto con un camino mínimo de `pasos` cambios. */
export function generarReto(pasos) {
  const v = vecinos();
  const conVecinos = PALABRAS.filter((p) => v.get(p).length >= 2);
  for (let k = 0; k < 400; k++) {
    const inicio = conVecinos[Math.floor(Math.random() * conVecinos.length)];
    // BFS por niveles desde el inicio
    const dist = new Map([[inicio, 0]]);
    const cola = [inicio];
    while (cola.length) {
      const p = cola.shift();
      if (dist.get(p) >= pasos) continue;
      for (const q of v.get(p)) if (!dist.has(q)) { dist.set(q, dist.get(p) + 1); cola.push(q); }
    }
    const destinos = [...dist.entries()].filter(([, d]) => d === pasos).map(([p]) => p);
    if (!destinos.length) continue;
    const fin = destinos[Math.floor(Math.random() * destinos.length)];
    return { inicio, fin, optimo: caminoMinimo(inicio, fin) };
  }
  return null;
}
