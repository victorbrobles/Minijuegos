// client/src/games/Director/Director.jsx
// «Director Deportivo»: ficha con cabeza, cuadra el presupuesto y gana la liga. Usa la sala y las pantallas comunes
// de ../Pulsador.
import React from 'react';
import JuegoPulsador from '../Pulsador/JuegoPulsador.jsx';
import DirectorLocal from './DirectorLocal.jsx';
import { PartidaOnline, Fin, Config } from './Partida.jsx';
import { AJUSTES } from './engine.js';

const JUEGO = {
  id: 'director',
  api: '/api/director',
  emoji: '⚽',
  config: { presupuesto: 200, mercados: 4 },
  Local: DirectorLocal,
  Partida: PartidaOnline,
  Fin,
  Config,
  notaSala: `⚽ Cada uno dirige su club desde su móvil. Si sois menos de ${AJUSTES.minClubes}, la liga se completa con clubes de la máquina.`,
  ganador: (n) => `¡${n.join(' y ')} campeón!`,
};

export default function Director({ onExit }) {
  return <JuegoPulsador juego={JUEGO} onExit={onExit} />;
}
