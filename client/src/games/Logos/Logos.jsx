// client/src/games/Logos/Logos.jsx
// «Logo Mania»: reconoce la marca antes de que se acabe el reloj. Usa la sala y las pantallas comunes de ../Pulsador;
// aquí van sus textos y su partida.
import React from 'react';
import JuegoPulsador from '../Pulsador/JuegoPulsador.jsx';
import LogosLocal from './LogosLocal.jsx';
import { PartidaOnline } from './Partida.jsx';
import { OPCIONES_RONDAS } from './engine.js';

const JUEGO = {
  id: 'logos',
  api: '/api/logos',
  emoji: '🏷️',
  unidad: 'logos',
  opcionesRondas: OPCIONES_RONDAS,
  config: { rondas: 15 },
  Local: LogosLocal,
  Partida: PartidaOnline,
  notaSala: '🏷️ Todos ven el mismo logo a la vez y cada uno responde desde su móvil.',
  ganador: (n) => (n.length > 1 ? `¡Empate entre ${n.join(' y ')}!` : `¡${n[0]} es el rey de las marcas!`),
};

export default function Logos({ onExit }) {
  return <JuegoPulsador juego={JUEGO} onExit={onExit} />;
}
