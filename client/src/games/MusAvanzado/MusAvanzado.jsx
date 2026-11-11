// client/src/games/MusAvanzado/MusAvanzado.jsx
// «Mus Avanzado»: el mus con 5 cartas y seis categorías, la mano se conserva entre categorías. Usa la sala de ../Pulsador.
import React from 'react';
import JuegoPulsador from '../Pulsador/JuegoPulsador.jsx';
import MusAvanzadoLocal from './MusAvanzadoLocal.jsx';
import { PartidaOnline, Fin, Config } from './Partida.jsx';
import { ORDEN_CATEGORIAS } from './engine.js';

const JUEGO = {
  id: 'musavanzado',
  api: '/api/musavanzado',
  emoji: '🂡',
  config: { modo: 'individual', objetivo: 30, categorias: [...ORDEN_CATEGORIAS], especiales: {} },
  Local: MusAvanzadoLocal,
  Partida: PartidaOnline,
  Fin,
  Config,
  unidadPuntos: 'puntos',
  notaSala: '🂡 Individual de 4 a 8 o por parejas (4 o 6). Cada uno ve sus cartas en su móvil; el anfitrión elige puntos, categorías y cartas especiales.',
  detalleFin: (j) => `${j.puntos} puntos`,
  ganador: (n) => (n.length > 1 ? `¡Ganan ${n.join(' y ')}!` : `¡${n[0]} se lleva la mesa!`),
  reglas: [
    'Baraja española de 40 cartas, a 8 reyes como en el mus: los treses valen como reyes y los doses como ases. Se juega individual o por parejas y gana quien llega antes a los puntos (20, 30 o 40).',
    'En cada mano se reparten 5 cartas y se juegan las categorías por orden: grande, chica, pares, escalera, color y juego (o las que elija el anfitrión).',
    'Antes de cada categoría puedes tirar de 0 a 5 cartas y robar otras tantas. Las que te quedas siguen contigo en la siguiente categoría: decide si vas a por la actual o te guardas cartas para las que vienen.',
    'Luego se habla como en el mus: pasar, envidar lo que quieras o echar un órdago. Los demás quieren, suben, no quieren (se retiran de esa categoría) u órdago. Si nadie quiere, el que envidó se lleva lo que había (1 si era el primer envite).',
    'Órdago querido: se enseñan las cartas y quien tenga la mejor jugada gana la partida entera. Cuidado: si vas perdiendo es tu oportunidad, pero si lo pierdes, se acabó.',
    'Al acabar la mano se enseñan, categoría a categoría, las cartas de quienes siguieron en la puja (tal como estaban en esa categoría). Gana el mejor según las reglas del mus; a igualdad, el más cercano a la mano.',
    'Cobros: lo querido; en paso, 1 punto en grande y chica. Extras para cada jugador del bando ganador: pares (pareja 1, medias 2, duples 3, full 4, póker 5), escalera (de 4: 2, de 5: 5; el orden es A-4-5-6-7-S-C-R), color (4 del mismo palo: 1, las 5: 5) y juego (31: 3, otro juego: 2, ganar a punto: 1).',
    'Juego: suma de las 5 cartas (figuras y treses 10, doses 1). De 31 a 40 es juego (31 > 32 > 40 > 37 > … > 33); por debajo, punto (lo más cerca de 30); más de 40, te pasas.'
  ]
};

export default function MusAvanzado({ onExit }) {
  return <JuegoPulsador juego={JUEGO} onExit={onExit} />;
}
