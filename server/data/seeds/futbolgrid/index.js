// server/data/seeds/futbolgrid/index.js
// Todos los grids y los que se pueden jugar: los que tienen al menos una respuesta en cada casilla
// (los grid_21 a grid_30 vienen sin respuestas y no se usan).
import GRIDS_VOL_1 from './categorias.js';
import GRIDS_VOL_2 from './categorias1.js';

export const TODOS_LOS_GRIDS = [...GRIDS_VOL_1, ...GRIDS_VOL_2];
export const GRIDS_JUGABLES = TODOS_LOS_GRIDS.filter((g) => g.respuestas?.length === 3
  && g.respuestas.every((f) => f.length === 3 && f.every((c) => Array.isArray(c) && c.length > 0)));
