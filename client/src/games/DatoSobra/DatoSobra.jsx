// client/src/games/DatoSobra/DatoSobra.jsx
// «El Dato que Sobra»: tres verdades y una mentira sobre un futbolista; los demás pueden desafiar tu respuesta.
// Usa la sala y las pantallas comunes de ../Pulsador.
import React from 'react';
import JuegoPulsador from '../Pulsador/JuegoPulsador.jsx';
import DatoSobraLocal from './DatoSobraLocal.jsx';
import { PartidaOnline, Fin, Config } from './Partida.jsx';

const JUEGO = {
  id: 'datosobra',
  api: '/api/datosobra',
  emoji: '🕵️',
  config: { rondas: 3 },
  Local: DatoSobraLocal,
  Partida: PartidaOnline,
  Fin,
  Config,
  notaSala: '🕵️ Por turnos, uno señala la mentira y los demás deciden en secreto si le desafían.',
  detalleFin: (j) => `${j.aciertos} ${j.aciertos === 1 ? 'mentira cazada' : 'mentiras cazadas'} · ${j.desafios} desafíos`,
  ganador: (n) => (n.length > 1 ? `¡Empate entre ${n.join(' y ')}!` : `¡A ${n[0]} no se le escapa una mentira!`),
};

export default function DatoSobra({ onExit }) {
  return <JuegoPulsador juego={JUEGO} onExit={onExit} />;
}
