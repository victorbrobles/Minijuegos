// server/data/seeds/conoce/conoceData.js
// Preguntas abiertas para amigos (ver preguntas.js). Las antiguas (parte1/parte2) quedan sin usar.
import { PREGUNTAS_CONOCE } from './preguntas.js';

export const TODAS_LAS_PREGUNTAS = [...new Set(PREGUNTAS_CONOCE)];

export const getPreguntaAleatoria = (usadas = []) => {
  const disponibles = TODAS_LAS_PREGUNTAS.filter((p) => !usadas.includes(p));
  const pool = disponibles.length > 0 ? disponibles : TODAS_LAS_PREGUNTAS;
  return pool[Math.floor(Math.random() * pool.length)];
};
