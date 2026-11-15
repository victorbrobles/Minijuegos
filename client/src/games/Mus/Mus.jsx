// client/src/games/Mus/Mus.jsx
// Mus clásico: online (cuatro personas, dos parejas) o contra la máquina en tu móvil.
// Usa la sala y las pantallas comunes de ../Pulsador.
import React from 'react';
import JuegoPulsador from '../Pulsador/JuegoPulsador.jsx';
import MusLocal from './MusLocal.jsx';
import { PartidaOnline, Fin, Config } from './Mesa.jsx';

const JUEGO = {
  id: 'mus',
  api: '/api/mus',
  emoji: '🂡',
  config: { objetivo: 40, vacas: 1, companero: null },
  Local: MusLocal,
  menuLocal: { icono: 'gamepad', titulo: 'Jugar contra la máquina', texto: 'Tú y tu pareja 🤖 contra dos 🤖, en tu móvil' },
  Partida: PartidaOnline,
  Fin,
  Config,
  notaSala: '🂡 Dos parejas: el anfitrión y su compañero contra los otros dos. Hacen falta los cuatro jugadores para empezar.',
  ganador: (n) => `¡Gana ${n.join(' y ')}!`,
};

export default function Mus({ onExit }) {
  return <JuegoPulsador juego={JUEGO} onExit={onExit} />;
}
