// client/src/games/Reinos/Reinos.jsx
// «Los Siete Reinos»: estrategia con órdenes secretas y simultáneas, diplomacia y traiciones.
// Usa la sala y las pantallas comunes de ../Pulsador.
import React from 'react';
import JuegoPulsador from '../Pulsador/JuegoPulsador.jsx';
import ReinosLocal from './ReinosLocal.jsx';
import { PartidaOnline, Fin, Config } from './Partida.jsx';
import { AJUSTES } from './engine.js';

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
  reglas: [
    'Cada jugador gobierna un reino: una capital, soldados, oro y alimento. El mapa tiene granjas (alimento), minas (oro), ciudades (de todo) y siete tronos.',
    'Al empezar cada ronda cobras lo que producen tus territorios, y cada 2 soldados comen 1 de alimento (si no hay, desertan).',
    `Cada ronda das ${AJUSTES.acciones} órdenes en secreto: conquistar (mover soldados a un vecino), entrenar tropas, fortificar (+2 de defensa por nivel de muralla), comerciar en el mercado o negociar con otro reino (alianza, intercambio o romper una alianza).`,
    'Cuando todos han terminado (y respondido a las propuestas), todo ocurre a la vez. En una batalla gana quien tiene más fuerza (soldados, y murallas si defiende); los aliados que atacan juntos suman fuerzas.',
    `Atacar a un aliado es una traición: rompe la alianza, todos lo ven y resta ${Math.abs(AJUSTES.puntos.traicion)} puntos.`,
    `Al final: ${AJUSTES.puntos.trono} puntos por trono, ${AJUSTES.puntos.territorio} por territorio y ${AJUSTES.puntos.objetivo} por cada objetivo secreto cumplido. Si alguien domina ${AJUSTES.tronosVictoria} tronos, gana en el acto.`
  ]
};

export default function Reinos({ onExit }) {
  return <JuegoPulsador juego={JUEGO} onExit={onExit} />;
}
