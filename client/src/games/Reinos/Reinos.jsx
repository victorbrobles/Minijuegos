// client/src/games/Reinos/Reinos.jsx
// «Los Siete Reinos»: estrategia con órdenes secretas y simultáneas, diplomacia y traiciones.
// Usa la sala y las pantallas comunes de ../Pulsador.
import React from 'react';
import JuegoPulsador from '../Pulsador/JuegoPulsador.jsx';
import ReinosLocal from './ReinosLocal.jsx';
import { PartidaOnline, Fin, Config } from './Partida.jsx';

const JUEGO = {
  id: 'reinos',
  api: '/api/reinos',
  emoji: '👑',
  config: { rondas: 8 },
  Local: ReinosLocal,
  Partida: PartidaOnline,
  Fin,
  Config,
  notaSala: '👑 Cada reino da sus órdenes en secreto desde su móvil; se cumplen todas a la vez.',
  ganador: (n) => `¡${n.join(' y ')} gobierna los Siete Reinos!`,
};

export default function Reinos({ onExit }) {
  return <JuegoPulsador juego={JUEGO} onExit={onExit} />;
}
