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
  config: { onces: 3, segundos: 180 },
  Local: OnceFantasmaLocal,
  Partida: PartidaOnline,
  Fin,
  Config,
  menuLocal: { icono: 'users', titulo: 'En un dispositivo', texto: 'Por turnos, cada uno reconstruye su once; si deja huecos, los demás tienen rebote.' },
  notaSala: '👻 Por turnos, cada uno reconstruye un once desde su móvil; si deja huecos, los demás tienen rebote.',
  detalleFin: (j) => `${j.aciertos} en su turno · ${j.rebotes} de rebote${j.plenos ? ` · ${j.plenos} ${j.plenos === 1 ? 'once completo' : 'onces completos'}` : ''}`,
  ganador: (n) => (n.length > 1 ? `¡Empate entre ${n.join(' y ')}!` : `¡${n[0]} ve fantasmas en el campo!`),
  reglas: [
    'Cada partido histórico tiene sus dos onces titulares. Por turnos, a cada uno le toca reconstruir un once: los dos onces de un mismo partido van a jugadores seguidos.',
    `Al principio solo se ven la posición y el dorsal de cada hueco (y el entrenador). Durante tu turno solo adivinas tú: cada acierto destapa una pista de otro compañero (club o país, trayectoria e iniciales) y el reloj destapa otra cada ${AJUSTES.segPista} segundos.`,
    `Cuantas menos pistas tuviera el hueco, más puntos: ${AJUSTES.puntosNivel.join(', ')}. Si completas tú solo tu once, ${AJUSTES.bonusPleno} puntos extra.`,
    `Si se te acaba el tiempo o te plantas con huecos, hay REBOTE: los demás pueden adivinar los que faltan (${AJUSTES.puntosRebote.join(', ')} puntos).`,
    'Las alineaciones se ven como en la tele: el lateral izquierdo, a la izquierda.'
  ]
};

export default function OnceFantasma({ onExit }) {
  return <JuegoPulsador juego={JUEGO} onExit={onExit} />;
}
