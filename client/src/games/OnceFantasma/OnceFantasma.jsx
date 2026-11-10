// client/src/games/OnceFantasma/OnceFantasma.jsx
// «El Once Fantasma»: reconstruye el once titular de un partido histórico a partir de pistas.
// Usa la sala y las pantallas comunes de ../Pulsador.
import React from 'react';
import JuegoPulsador from '../Pulsador/JuegoPulsador.jsx';
import OnceFantasmaLocal from './OnceFantasmaLocal.jsx';
import { PartidaOnline, Fin, Config } from './Partida.jsx';
import { AJUSTES } from './engine.js';

const JUEGO = {
  id: 'oncefantasma',
  api: '/api/oncefantasma',
  emoji: '👻',
  config: { rondas: 2, segundos: 240 },
  Local: OnceFantasmaLocal,
  Partida: PartidaOnline,
  Fin,
  Config,
  menuLocal: { icono: 'users', titulo: 'En un dispositivo', texto: 'Todos miran la misma pantalla y gritan nombres; quien escribe apunta a quién se le ocurrió.' },
  notaSala: '👻 Todos escribís a la vez desde vuestro móvil: el primero que acierta un hueco se lo queda.',
  detalleFin: (j) => `${j.aciertos} ${j.aciertos === 1 ? 'futbolista' : 'futbolistas'}`,
  ganador: (n) => (n.length > 1 ? `¡Empate entre ${n.join(' y ')}!` : `¡${n[0]} ve fantasmas en el campo!`),
  reglas: [
    'Cada ronda sale un partido histórico con su entrenador y los once huecos de la alineación titular: solo se ve la posición y el dorsal.',
    'Escribid nombres a la vez. El primero que acierta un hueco se lo queda y su acierto destapa una pista de otro compañero (club o país, trayectoria e iniciales).',
    `Cuantas menos pistas tuviera el hueco, más puntos: ${AJUSTES.puntosNivel.join(', ')}. Fallar no resta, pero te hace esperar un segundo y medio.`,
    `Cada ${AJUSTES.segPista} segundos el reloj destapa otra pista. Si se completa el once, quien más huecos haya descubierto gana ${AJUSTES.bonusOnce} puntos extra.`,
    'El anfitrión puede destapar pistas o rendirse para ver el once completo.'
  ]
};

export default function OnceFantasma({ onExit }) {
  return <JuegoPulsador juego={JUEGO} onExit={onExit} />;
}
