// client/src/games/Invento/Invento.jsx
// «El Invento del Siglo»: combina un objeto, un problema y una característica absurda; el resto vota.
// Usa la sala y las pantallas comunes de ../Pulsador.
import React from 'react';
import JuegoPulsador from '../Pulsador/JuegoPulsador.jsx';
import InventoLocal from './InventoLocal.jsx';
import { PartidaOnline, Fin, Config } from './Partida.jsx';
import { CATEGORIAS } from './engine.js';

const JUEGO = {
  id: 'invento',
  api: '/api/invento',
  emoji: '💡',
  config: { rondas: 7, segundos: 180 },
  Local: InventoLocal,
  Partida: PartidaOnline,
  Fin,
  Config,
  notaSala: '💡 Cada uno inventa desde su móvil; luego se vota sin saber de quién es cada invento.',
  detalleFin: (j) => Object.entries(CATEGORIAS).map(([c, C]) => (j.titulos[c] ? `${C.e}×${j.titulos[c]}` : '')).filter(Boolean).join(' ') || 'Sin categorías ganadas',
  ganador: (n) => (n.length > 1 ? `¡Empate entre ${n.join(' y ')}!` : `¡${n[0]} es el inventor del siglo!`),
};

export default function Invento({ onExit }) {
  return <JuegoPulsador juego={JUEGO} onExit={onExit} />;
}
