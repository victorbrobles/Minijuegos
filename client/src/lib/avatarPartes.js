// client/src/lib/avatarPartes.js
// Datos del avatar: piezas, validación y conversión de los avatares de la primera versión (solo cara).
// Un avatar se guarda como texto JSON con el número de opción de cada pieza: {"v":2,"piel":2,"pelo":4,...}
import { PIEZAS, AVATAR_INICIAL as INICIAL, avatarAleatorio as aleatorio } from './avatarRealista.js';

export { PIEZAS };
export const AVATAR_INICIAL = { ...INICIAL };
export const PIEZAS_CARA = ['piel', 'pelo', 'colorPelo', 'ojos', 'colorOjos', 'boca', 'barba', 'gafas', 'extra'];
export const PIEZAS_ROPA = ['arriba', 'colorArriba', 'abajo', 'colorAbajo', 'calzado'];

/** Devuelve el avatar limpio (solo piezas conocidas y dentro de rango) o null. */
export function validarAvatar(a) {
  if (!a || typeof a !== 'object' || Array.isArray(a)) return null;
  const limpio = {};
  for (const p of PIEZAS) {
    const v = a[p.id];
    if (!Number.isInteger(v) || v < 0 || v >= p.n) return null;
    limpio[p.id] = v;
  }
  return limpio;
}

// Primera versión (solo cara): se pasa a la nueva conservando lo que se parece
const V1 = { piel: 8, pelo: 12, colorPelo: 12, ojos: 7, boca: 7, barba: 5, gafas: 5, ropa: 6, colorRopa: 12, extra: 8 };
const DE_V1 = {
  piel: [0, 1, 2, 3, 4, 6, 7, 9],
  pelo: [10, 1, 1, 11, 3, 6, 7, 0, 5, 1, 2, 9],
  colorPelo: [0, 1, 3, 4, 6, 7, 8, 10, 11, 12, 13, 12],
  ojos: [0, 3, 0, 1, 3, 0, 3],
  boca: [0, 1, 2, 1, 4, 3, 2],
  barba: [0, 3, 2, 4, 5],
  ropa: [0, 2, 1, 4, 5, 6],
  colorRopa: [3, 4, 5, 6, 7, 7, 8, 9, 10, 11, 0, 1],
  extra: [0, 1, 2, 0, 5, 3, 0, 0]
};
function desdeV1(o) {
  if (!Object.entries(V1).every(([k, n]) => Number.isInteger(o[k]) && o[k] >= 0 && o[k] < n)) return null;
  return validarAvatar({
    ...AVATAR_INICIAL,
    piel: DE_V1.piel[o.piel], pelo: DE_V1.pelo[o.pelo], colorPelo: DE_V1.colorPelo[o.colorPelo], ojos: DE_V1.ojos[o.ojos],
    boca: DE_V1.boca[o.boca], barba: DE_V1.barba[o.barba], gafas: o.gafas, arriba: DE_V1.ropa[o.ropa],
    colorArriba: DE_V1.colorRopa[o.colorRopa], extra: DE_V1.extra[o.extra]
  });
}

/** Lee un avatar guardado. Devuelve null si es un emoji (perfiles antiguos) o no es válido. */
export function leerAvatar(texto) {
  if (typeof texto !== 'string' || texto[0] !== '{') return null;
  try {
    const o = JSON.parse(texto);
    return o?.v === 2 ? validarAvatar(o) : desdeV1(o || {});
  } catch { return null; }
}

export const textoAvatar = (a) => JSON.stringify({ v: 2, ...validarAvatar(a) });
export const avatarAleatorio = (azar) => aleatorio(azar);
