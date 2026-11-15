// client/src/games/UnoADiez/UnoADiez.jsx
// «Del 1 al 10...»: adivina el número secreto con los ejemplos de los demás. Usa la sala y las pantallas comunes de
// ../Pulsador; aquí van sus textos y su partida.
import React from 'react';
import JuegoPulsador from '../Pulsador/JuegoPulsador.jsx';
import UnoADiezLocal from './UnoADiezLocal.jsx';
import { PartidaOnline, Config } from './Partida.jsx';

const JUEGO = {
  id: 'unoadiez',
  api: '/api/unoadiez',
  emoji: '🔢',
  config: { vueltas: 3 },
  Local: UnoADiezLocal,
  Partida: PartidaOnline,
  Config,
  menosEsMejor: true,
  notaSala: '🔢 Cada uno adivina por turnos; los demás van dando ejemplos por escrito desde su móvil.',
  detalleFin: (j) => (j.turnos.length ? `Turnos: ${j.turnos.join(' + ')}` : 'Sin turnos'),
  ganador: (n) => (n.length > 1 ? `¡Empate entre ${n.join(' y ')}!` : `¡${n[0]} os lee la mente!`),
};

export default function UnoADiez({ onExit }) {
  return <JuegoPulsador juego={JUEGO} onExit={onExit} />;
}
