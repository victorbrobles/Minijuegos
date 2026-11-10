// client/src/games/Tablero/Tablero.jsx
// «El Tablero de Puntos»: elige casilla (100, 200, 300 o 500) y responde; si fallas, se resta.
// Usa la sala y las pantallas comunes de ../Pulsador.
import React from 'react';
import JuegoPulsador from '../Pulsador/JuegoPulsador.jsx';
import TableroLocal from './TableroLocal.jsx';
import { PartidaOnline, Fin, Config } from './Partida.jsx';

const JUEGO = {
  id: 'tablero',
  api: '/api/tablero',
  emoji: '🎯',
  config: { categorias: 5, segundos: 20 },
  Local: TableroLocal,
  Partida: PartidaOnline,
  Fin,
  Config,
  notaSala: '🎯 Por turnos, cada uno elige casilla y responde desde su móvil; los demás lo ven en directo.',
  detalleFin: (j) => `${j.aciertos} aciertos · ${j.fallos} fallos`,
  ganador: (n) => (n.length > 1 ? `¡Empate entre ${n.join(' y ')}!` : `¡${n[0]} domina el tablero!`),
  reglas: [
    'El tablero tiene varias categorías (cine, historia, ciencia, música, deporte, geografía) con casillas de 100, 200, 300 y 500 puntos.',
    'Por turnos, cada jugador elige una casilla libre y responde su pregunta con cuatro opciones. Cuanto más vale, más difícil es.',
    'Si aciertas, sumas su valor. Si fallas (o se acaba el tiempo), lo restas: elige bien cuánto arriesgar.',
    'Hay una casilla doble escondida: vale el doble… para bien y para mal.',
    'La partida termina cuando no quedan casillas. Gana quien más puntos tenga.'
  ]
};

export default function Tablero({ onExit }) {
  return <JuegoPulsador juego={JUEGO} onExit={onExit} />;
}
