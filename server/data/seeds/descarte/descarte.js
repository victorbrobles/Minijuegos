import { CATEGORIAS_PARTE_1 } from './parte1.js';
import { CATEGORIAS_PARTE_2 } from './parte2.js';

export const TODAS_LAS_CATEGORIAS = [...CATEGORIAS_PARTE_1, ...CATEGORIAS_PARTE_2];

export const getTresCategorias = () => {
  const barajadas = [...TODAS_LAS_CATEGORIAS].sort(() => Math.random() - 0.5);
  return barajadas.slice(0, 3);
};