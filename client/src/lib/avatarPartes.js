// client/src/lib/avatarPartes.js
// Piezas del avatar personalizable. Lo comparten la web (para dibujarlo y editarlo) y el servidor (para validarlo).
// Un avatar se guarda como texto JSON con el número de opción de cada pieza: {"piel":2,"pelo":4,...}

export const PIELES = ['#fde7d9', '#f6d0b1', '#eab88f', '#d6a16f', '#b97a4f', '#8d5634', '#64391f', '#3f2414'];
export const COLORES_PELO = ['#1f1b18', '#3b2417', '#6b3f22', '#a0662f', '#d6a04a', '#f1d38a', '#b5462a', '#9ca3af', '#f3f4f6', '#3b82f6', '#ec4899', '#22c55e'];
export const COLORES_ROPA = ['#ef4444', '#f97316', '#facc15', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#f8fafc', '#334155'];

/** Piezas en el orden en que salen en el editor. `n` = cuántas opciones hay. */
export const PIEZAS = [
  { id: 'piel', nombre: 'Piel', emoji: '✋', n: PIELES.length, colores: PIELES },
  { id: 'pelo', nombre: 'Peinado', emoji: '💇', n: 12, opciones: ['Sin pelo', 'Corto', 'Flequillo', 'Rizado', 'Largo', 'Coleta', 'Moño', 'Cresta', 'Media melena', 'Pinchos', 'Raya al lado', 'Trenzas'] },
  { id: 'colorPelo', nombre: 'Color de pelo', emoji: '🎨', n: COLORES_PELO.length, colores: COLORES_PELO },
  { id: 'ojos', nombre: 'Ojos', emoji: '👀', n: 7, opciones: ['Normales', 'Alegres', 'Guiño', 'Grandes', 'Felices', 'Enfadados', 'Dormidos'] },
  { id: 'boca', nombre: 'Boca', emoji: '👄', n: 7, opciones: ['Sonrisa', 'Risa', 'Seria', 'Lengua', 'Sorpresa', 'Pícara', 'Triste'] },
  { id: 'barba', nombre: 'Barba', emoji: '🧔', n: 5, opciones: ['Sin barba', 'Bigote', 'Perilla', 'Barba corta', 'Barba larga'] },
  { id: 'gafas', nombre: 'Gafas', emoji: '👓', n: 5, opciones: ['Sin gafas', 'Redondas', 'Cuadradas', 'De sol', 'De pasta'] },
  { id: 'ropa', nombre: 'Ropa', emoji: '👕', n: 6, opciones: ['Camiseta', 'Sudadera', 'Camisa', 'Cuello alto', 'Tirantes', 'Traje'] },
  { id: 'colorRopa', nombre: 'Color de ropa', emoji: '🎨', n: COLORES_ROPA.length, colores: COLORES_ROPA },
  { id: 'extra', nombre: 'Complementos', emoji: '🧢', n: 8, opciones: ['Nada', 'Gorra', 'Gorro de lana', 'Corona', 'Auriculares', 'Pendientes', 'Lazo', 'Pecas'] }
];

export const AVATAR_INICIAL = { piel: 1, pelo: 1, colorPelo: 2, ojos: 0, boca: 0, barba: 0, gafas: 0, ropa: 0, colorRopa: 0, extra: 0 };

/** Lee un avatar guardado. Devuelve null si es un emoji (avatares antiguos) o no es válido. */
export function leerAvatar(texto) {
  if (typeof texto !== 'string' || texto[0] !== '{') return null;
  try { return validarAvatar(JSON.parse(texto)); } catch { return null; }
}

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

export const textoAvatar = (a) => JSON.stringify(validarAvatar(a));

export function avatarAleatorio(azar = Math.random) {
  const a = {};
  PIEZAS.forEach((p) => { a[p.id] = Math.floor(azar() * p.n); });
  // Que no salgan todos con barba, gafas o complementos
  if (azar() < 0.6) a.barba = 0;
  if (azar() < 0.55) a.gafas = 0;
  if (azar() < 0.5) a.extra = 0;
  if (azar() < 0.7) a.colorPelo = Math.floor(azar() * 7); // colores naturales más a menudo
  return a;
}
