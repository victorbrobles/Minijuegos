// client/src/lib/avatarPartes.js
// Datos del avatar: piezas, validación y conversión de los avatares de la primera versión (solo cara).
// Un avatar se guarda como texto JSON con el número de opción de cada pieza: {"v":2,"piel":2,"pelo":4,...}
import { PIEZAS, AVATAR_INICIAL as INICIAL, avatarAleatorio as aleatorio } from './avatarRealista.js';

export { PIEZAS };
export const AVATAR_INICIAL = { ...INICIAL };
export const PIEZAS_CARA = ['piel', 'caraTipo', 'pelo', 'colorPelo', 'ojos', 'colorOjos', 'cejas', 'nariz', 'boca', 'labios', 'rasgos', 'barba', 'gafas', 'extra', 'colorExtra'];
export const PIEZAS_ROPA = ['cuerpo', 'arriba', 'estampado', 'colorArriba', 'abajo', 'colorAbajo', 'calzado'];

/** Devuelve el avatar limpio (solo piezas conocidas y dentro de rango) o null. */
export function validarAvatar(a) {
  if (!a || typeof a !== 'object' || Array.isArray(a)) return null;
  const limpio = {};
  for (const p of PIEZAS) {
    // Piezas nuevas que los avatares antiguos no tienen: su valor por defecto
    const v = a[p.id] === undefined && p.def !== undefined ? p.def : a[p.id];
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

/** Texto para guardar. `auto`: avatar asignado al azar (se puede regenerar), no elegido por el jugador. */
export const textoAvatar = (a, { auto = false } = {}) => JSON.stringify({ v: 2, ...validarAvatar(a), ...(auto ? { auto: 1 } : {}) });
export function esAvatarAuto(texto) {
  try { return JSON.parse(texto)?.auto === 1; } catch { return false; }
}

/** Colores de fondo del avatar (los mismos que valida el servidor). */
export const COLORES_FONDO = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#ec4899', '#64748b', '#0f172a'];

// Generador de números al azar «con semilla»: el mismo nombre da siempre el mismo avatar
function azarDe(texto) {
  let h = 2166136261;
  for (const ch of String(texto)) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619); }
  let t = h >>> 0;
  return () => { t += 0x6D2B79F5; let r = Math.imul(t ^ (t >>> 15), 1 | t); r ^= r + Math.imul(r ^ (r >>> 7), 61 | r); return ((r ^ (r >>> 14)) >>> 0) / 4294967296; };
}
const cacheNombre = new Map();
/** Avatar (y color) inventado para un nombre: siempre el mismo para el mismo nombre y distinto para cada nombre. */
export function avatarDeNombre(nombre) {
  const clave = String(nombre || '').trim().toLowerCase();
  if (!cacheNombre.has(clave)) {
    const azar = azarDe(clave);
    const a = aleatorio(azar);
    cacheNombre.set(clave, { a, color: COLORES_FONDO[Math.floor(azar() * COLORES_FONDO.length)] });
  }
  return cacheNombre.get(clave);
}
export const avatarAleatorio = (azar) => aleatorio(azar);
