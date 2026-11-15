// client/src/games/Tablero/Tablero.jsx
// «El Tablero de Puntos»: se eligen categorías entre 25 y, por turnos, se elige casilla (100 a 500) y se responde.
// Usa la sala y las pantallas comunes de ../Pulsador.
import React from 'react';
import JuegoPulsador from '../Pulsador/JuegoPulsador.jsx';
import TableroLocal from './TableroLocal.jsx';
import { PartidaOnline, Fin, Config } from './Partida.jsx';

const JUEGO = {
  id: 'tablero',
  api: '/api/tablero',
  emoji: '🎯',
  config: { porJugador: 1, segundos: 20 },
  Local: TableroLocal,
  Partida: PartidaOnline,
  Fin,
  Config,
  notaSala: '🎯 Por turnos, cada uno elige casilla y responde desde su móvil; los demás lo ven en directo.',
  detalleFin: (j) => `${j.aciertos} aciertos · ${j.fallos} fallos`,
  ganador: (n) => (n.length > 1 ? `¡Empate entre ${n.join(' y ')}!` : `¡${n[0]} domina el tablero!`),
};

export default function Tablero({ onExit }) {
  return <JuegoPulsador juego={JUEGO} onExit={onExit} />;
}
