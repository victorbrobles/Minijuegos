// server/data/seeds/bingoball/bingoballData.js
import { BINGO_INTERNACIONAL } from './parte1.js';
import { BINGO_CHAMPIONS } from './parte2.js';
import { BINGO_LALIGA } from './parte3.js';
import { BINGO_GRANDES_LIGAS } from './parte4.js';
import { BINGO_LEYENDAS } from './parte5.js';

export const BINGOS = {
  internacional: BINGO_INTERNACIONAL,
  champions: BINGO_CHAMPIONS,
  laliga: BINGO_LALIGA,
  grandes_ligas: BINGO_GRANDES_LIGAS,
  leyendas: BINGO_LEYENDAS
};

export const LISTA_BINGOS = [
  { id: 'internacional', titulo: BINGO_INTERNACIONAL.titulo },
  { id: 'champions', titulo: BINGO_CHAMPIONS.titulo },
  { id: 'laliga', titulo: BINGO_LALIGA.titulo },
  { id: 'grandes_ligas', titulo: BINGO_GRANDES_LIGAS.titulo },
  { id: 'leyendas', titulo: BINGO_LEYENDAS.titulo }
];

export const getBingoPorId = (id) => BINGOS[id] || BINGOS.internacional;

// Obtiene todos los jugadores únicos de un bingo específico
export const getTodosJugadoresBingo = (bingoId) => {
  const bingo = getBingoPorId(bingoId);
  const set = new Set();
  bingo.categorias.forEach(cat => {
    cat.jugadores.forEach(j => set.add(j));
  });
  return Array.from(set);
};