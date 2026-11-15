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
  notaSala: '🂡 Individual de 3 a 8 o por parejas (4 o 6). Cada uno ve sus cartas en su móvil; el anfitrión elige puntos, categorías y cartas especiales.',
  detalleFin: (j) => `${j.puntos} puntos`,
  ganador: (n) => (n.length > 1 ? `¡Ganan ${n.join(' y ')}!` : `¡${n[0]} se lleva la mesa!`),
};

export default function MusAvanzado({ onExit }) {
  return <JuegoPulsador juego={JUEGO} onExit={onExit} />;
}
