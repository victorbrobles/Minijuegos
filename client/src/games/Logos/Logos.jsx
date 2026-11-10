// client/src/games/Logos/Logos.jsx
// «Logo Mania»: reconoce la marca antes de que se acabe el reloj. Usa la sala y las pantallas comunes de ../Pulsador;
// aquí van sus textos y su partida.
import React from 'react';
import JuegoPulsador from '../Pulsador/JuegoPulsador.jsx';
import LogosLocal from './LogosLocal.jsx';
import { PartidaOnline } from './Partida.jsx';
import { AJUSTES, OPCIONES_RONDAS } from './engine.js';

const JUEGO = {
  id: 'logos',
  api: '/api/logos',
  emoji: '🏷️',
  unidad: 'logos',
  opcionesRondas: OPCIONES_RONDAS,
  config: { rondas: 20 },
  Local: LogosLocal,
  Partida: PartidaOnline,
  notaSala: '🏷️ Todos ven el mismo logo a la vez y cada uno responde desde su móvil.',
  ganador: (n) => (n.length > 1 ? `¡Empate entre ${n.join(' y ')}!` : `¡${n[0]} es el rey de las marcas!`),
  reglas: [
    `Cada ronda sale un logo y un reloj de ${AJUSTES.segRonda} segundos. Cada jugador responde una sola vez.`,
    'Si aciertas, sumas los segundos que quedaban. Si fallas, los restas. Si no lo sabes, pasa y no arriesgas nada.',
    'Online respondéis todos a la vez; en un dispositivo, por turnos y cada uno con su reloj, sin ver lo que han dicho los demás.',
    'Se perdonan tildes, mayúsculas y erratas pequeñas.'
  ]
};

export default function Logos({ onExit }) {
  return <JuegoPulsador juego={JUEGO} onExit={onExit} />;
}
