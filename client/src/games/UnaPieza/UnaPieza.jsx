// client/src/games/UnaPieza/UnaPieza.jsx
// «Una Pieza Más»: rellenad entre todos una silueta con piezas geométricas, por turnos.
// Usa la sala y las pantallas comunes de ../Pulsador.
import React from 'react';
import JuegoPulsador from '../Pulsador/JuegoPulsador.jsx';
import UnaPiezaLocal from './UnaPiezaLocal.jsx';
import { PartidaOnline, Fin, Config } from './Partida.jsx';

const JUEGO = {
  id: 'unapieza',
  api: '/api/unapieza',
  emoji: '🧩',
  config: { rondas: 4, segundos: 60 },
  Local: UnaPiezaLocal,
  Partida: PartidaOnline,
  Fin,
  Config,
  notaSala: '🧩 Cada uno ve el tablero y sus piezas en su móvil; se juega por turnos.',
  detalleFin: (j) => `${j.piezas} piezas · ${j.objetivos} ${j.objetivos === 1 ? 'objetivo' : 'objetivos'}`,
  ganador: (n) => (n.length > 1 ? `¡Empate entre ${n.join(' y ')}!` : `¡${n[0]} encaja como nadie!`),
};

export default function UnaPieza({ onExit }) {
  return <JuegoPulsador juego={JUEGO} onExit={onExit} />;
}
