// client/src/games/UnoADiez/UnoADiez.jsx
// «Del 1 al 10...»: adivina el número secreto con los ejemplos de los demás. Usa la sala y las pantallas comunes de
// ../Pulsador; aquí van sus textos y su partida.
import React from 'react';
import JuegoPulsador from '../Pulsador/JuegoPulsador.jsx';
import UnoADiezLocal from './UnoADiezLocal.jsx';
import { PartidaOnline, Config } from './Partida.jsx';
import { AJUSTES } from './engine.js';

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
  reglas: [
    'Por turnos, cada jugador intenta adivinar un número secreto del 1 al 10.',
    'Otro jugador ve el número y una categoría (series, frutas, futbolistas…) y pone un ejemplo que para él sea ese número: 1 lo que menos le gusta, 10 lo que más.',
    `El que adivina dice un número o pide otra pista (otra persona y otra categoría), hasta ${AJUSTES.maxPistas} pistas.`,
    'Puntuación de golf: si lo clavas, sumas tantos puntos como pistas usadas; a uno de distancia, uno más; más lejos, diez más. ¡Gana quien menos puntos tenga!'
  ]
};

export default function UnoADiez({ onExit }) {
  return <JuegoPulsador juego={JUEGO} onExit={onExit} />;
}
