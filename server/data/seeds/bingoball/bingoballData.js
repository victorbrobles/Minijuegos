// server/data/seeds/bingoball/bingoballData.js
import { BINGOS_INTERNACIONAL } from './parte1.js';
import { BINGOS_CHAMPIONS } from './parte2.js';
import { BINGOS_LALIGA } from './parte3.js';
import { BINGOS_GRANDES_LIGAS } from './parte4.js';
import { BINGOS_LEYENDAS } from './parte5.js';

// Grupos principales con sus 5 sub-bingos correspondientes
export const GRUPOS_BINGOS = [
  { id: 'internacional', nombre: 'Fútbol Internacional y Selecciones', bingos: BINGOS_INTERNACIONAL },
  { id: 'champions', nombre: 'UEFA Champions League', bingos: BINGOS_CHAMPIONS },
  { id: 'laliga', nombre: 'La Liga Española', bingos: BINGOS_LALIGA },
  { id: 'grandes_ligas', nombre: 'Grandes Ligas Europeas', bingos: BINGOS_GRANDES_LIGAS },
  { id: 'leyendas', nombre: 'Leyendas del Fútbol Histórico', bingos: BINGOS_LEYENDAS }
];

// Mapa indexado con los 25 bingos individuales
export const BINGOS = {
  ...Object.fromEntries(BINGOS_INTERNACIONAL.map(b => [b.id, b])),
  ...Object.fromEntries(BINGOS_CHAMPIONS.map(b => [b.id, b])),
  ...Object.fromEntries(BINGOS_LALIGA.map(b => [b.id, b])),
  ...Object.fromEntries(BINGOS_GRANDES_LIGAS.map(b => [b.id, b])),
  ...Object.fromEntries(BINGOS_LEYENDAS.map(b => [b.id, b]))
};

// Lista plana para selectores o listados de partidas
export const LISTA_BINGOS = Object.values(BINGOS).map(b => ({
  id: b.id,
  titulo: b.titulo,
  grupo: b.grupo
}));

export const getBingoPorId = (id) => BINGOS[id] || BINGOS.internacional_unico;

// Obtiene todos los jugadores únicos de cualquiera de los 25 bingos
export const getTodosJugadoresBingo = (bingoId) => {
  const bingo = getBingoPorId(bingoId);
  const set = new Set();
  bingo.categorias.forEach(cat => {
    cat.jugadores.forEach(j => set.add(j));
  });
  return Array.from(set);
};