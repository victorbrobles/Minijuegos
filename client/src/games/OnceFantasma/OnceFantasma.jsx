// client/src/games/OnceFantasma/OnceFantasma.jsx
// «El Once Fantasma»: reconstruye el once titular de un partido histórico a partir de pistas.
// Usa la sala y las pantallas comunes de ../Pulsador.
import React from 'react';
import JuegoPulsador from '../Pulsador/JuegoPulsador.jsx';
import OnceFantasmaLocal from './OnceFantasmaLocal.jsx';
import { PartidaOnline, Fin, Config } from './Partida.jsx';

const JUEGO = {
  id: 'oncefantasma',
  api: '/api/oncefantasma',
  emoji: '👻',
  config: { onces: 3, segundos: 180 },
  Local: OnceFantasmaLocal,
  Partida: PartidaOnline,
  Fin,
  Config,
  menuLocal: { icono: 'users', titulo: 'En un dispositivo', texto: 'Por turnos, cada uno reconstruye su once; si deja huecos, los demás tienen rebote.' },
  notaSala: '👻 Por turnos, cada uno reconstruye un once desde su móvil; si deja huecos, los demás tienen rebote.',
  detalleFin: (j) => `${j.aciertos} en su turno · ${j.rebotes} de rebote${j.plenos ? ` · ${j.plenos} ${j.plenos === 1 ? 'once completo' : 'onces completos'}` : ''}`,
  ganador: (n) => (n.length > 1 ? `¡Empate entre ${n.join(' y ')}!` : `¡${n[0]} ve fantasmas en el campo!`),
};

export default function OnceFantasma({ onExit }) {
  return <JuegoPulsador juego={JUEGO} onExit={onExit} />;
}
