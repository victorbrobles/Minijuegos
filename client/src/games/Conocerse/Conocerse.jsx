// client/src/games/Conocerse/Conocerse.jsx
// «Qué malo es conocerse»: preguntas entre amigos. Cada ronda una pregunta va dirigida a un jugador; el resto
// responde por él, todos eligen la respuesta buena sin saber de quién es y se desvela todo en el desglose.
// Usa la sala y las pantallas comunes de ../Pulsador.
import React from 'react';
import JuegoPulsador from '../Pulsador/JuegoPulsador.jsx';
import ConocerseLocal from './ConocerseLocal.jsx';
import { PartidaOnline, Fin, Config } from './Partida.jsx';

const JUEGO = {
  id: 'conocerse',
  api: '/api/conocerse',
  emoji: '🙈',
  config: { vueltas: 3 },
  Local: ConocerseLocal,
  Partida: PartidaOnline,
  Fin,
  Config,
  notaSala: '🙈 Cada uno responde y elige desde su móvil: nadie sabe de quién es cada respuesta hasta el desglose.',
  detalleFin: (j) => `${j.elegidas} ${j.elegidas === 1 ? 'respuesta elegida' : 'respuestas elegidas'} · ${j.aciertos} ${j.aciertos === 1 ? 'acierto' : 'aciertos'}`,
  ganador: (n) => (n.length > 1 ? `¡Empate entre ${n.join(' y ')}!` : `¡${n[0]} es quien mejor os conoce!`)
};

export default function Conocerse({ onExit }) {
  return <JuegoPulsador juego={JUEGO} onExit={onExit} />;
}
