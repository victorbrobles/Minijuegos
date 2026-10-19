// server/data/seeds/conoce/conoceData.js
import { PREGUNTAS_PARTE_1 } from './parte1.js';
import { PREGUNTAS_PARTE_2 } from './parte2.js';

export const TODAS_LAS_PREGUNTAS = [
  ...PREGUNTAS_PARTE_1,
  ...PREGUNTAS_PARTE_2
];

export const getPreguntaAleatoria = (usadas = []) => {
  const disponibles = TODAS_LAS_PREGUNTAS.filter(p => !usadas.includes(p));
  const pool = disponibles.length > 0 ? disponibles : TODAS_LAS_PREGUNTAS;
  return pool[Math.floor(Math.random() * pool.length)];
};