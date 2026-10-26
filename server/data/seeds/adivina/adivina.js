// server/data/seeds/adivina/adivina.seed.js
import { CANCIONES_1 } from './canciones1.js';
import { CANCIONES_2 } from './canciones2.js';
import { CANCIONES_3 } from './canciones3.js';
import { CANCIONES_4 } from './canciones4.js';
import { CANCIONES_5 } from './canciones5.js';
import { CANCIONES_6 } from './canciones6.js';
import { PELICULAS_1 } from './peliculas1.js';
import { PELICULAS_2 } from './peliculas2.js';

export const CANCIONES_MODERNAS = [...CANCIONES_1, ...CANCIONES_2, ...CANCIONES_5];
export const CANCIONES_ANTIGUAS = [...CANCIONES_3, ...CANCIONES_4, ...CANCIONES_6];
export const CANCIONES = [...CANCIONES_MODERNAS, ...CANCIONES_ANTIGUAS];
export const PELICULAS = [...PELICULAS_1, ...PELICULAS_2];