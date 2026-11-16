// server/lib/validar.js
// Comprobaciones comunes de lo que llega de los navegadores antes de guardarlo.

export const PUNTOS_MAX = 1e9;

/** Puntos como número razonable (o null si no es un número). Nada de Infinity, NaN ni cifras absurdas. */
export function puntosSeguros(x) {
  if (x === null || x === undefined || x === '') return null;
  const n = Number(x);
  if (!Number.isFinite(n)) return null;
  return Math.max(-PUNTOS_MAX, Math.min(PUNTOS_MAX, Math.round(n * 100) / 100));
}

/** Texto corto y limpio: sin caracteres de control y con un largo máximo. */
export const textoSeguro = (x, max = 120) => String(x ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
