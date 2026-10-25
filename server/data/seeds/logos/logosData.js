// server/data/seeds/logos/logosData.js
import { LOGOS_PARTE_1 } from './parte1.js';
import { LOGOS_PARTE_2 } from './parte2.js';
import { LOGOS_PARTE_3 } from './parte3.js';
import { LOGOS_PARTE_4 } from './parte4.js';
import { LOGOS_DISPONIBLES } from './disponibles.js';

// Catálogo completo (incluye marcas sin imagen disponible)
export const LOGOS_SIN_FILTRAR = [
  ...LOGOS_PARTE_1,
  ...LOGOS_PARTE_2,
  ...LOGOS_PARTE_3,
  ...LOGOS_PARTE_4
];

// Solo se juega con los logos que tienen imagen real (ver disponibles.js; se regenera con `npm run sync:logos`)
const CON_IMAGEN = new Set(LOGOS_DISPONIBLES);
export const TODOS_LOS_LOGOS = LOGOS_SIN_FILTRAR.filter((l) => CON_IMAGEN.has(l.id));

export const getLogoAleatorio = (usados = []) => {
  const disponibles = TODOS_LOS_LOGOS.filter(l => !usados.includes(l.id));
  const pool = disponibles.length > 0 ? disponibles : TODOS_LOS_LOGOS;
  return pool[Math.floor(Math.random() * pool.length)];
};