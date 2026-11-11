// client/src/games/UnaPieza/UnaPieza.jsx
// «Una Pieza Más»: rellenad entre todos una silueta con piezas geométricas, por turnos.
// Usa la sala y las pantallas comunes de ../Pulsador.
import React from 'react';
import JuegoPulsador from '../Pulsador/JuegoPulsador.jsx';
import UnaPiezaLocal from './UnaPiezaLocal.jsx';
import { PartidaOnline, Fin, Config } from './Partida.jsx';
import { AJUSTES } from './engine.js';

const JUEGO = {
  id: 'unapieza',
  api: '/api/unapieza',
  emoji: '🧩',
  config: { rondas: 3, segundos: 60 },
  Local: UnaPiezaLocal,
  Partida: PartidaOnline,
  Fin,
  Config,
  notaSala: '🧩 Cada uno ve el tablero y sus piezas en su móvil; se juega por turnos.',
  detalleFin: (j) => `${j.piezas} piezas · ${j.objetivos} ${j.objetivos === 1 ? 'objetivo' : 'objetivos'}`,
  ganador: (n) => (n.length > 1 ? `¡Empate entre ${n.join(' y ')}!` : `¡${n[0]} encaja como nadie!`),
  reglas: [
    'En el tablero hay una silueta incompleta (una casa, un cohete, un pez…). Cada jugador tiene tres piezas geométricas en la mano.',
    'En tu turno coloca una pieza entera dentro de los huecos libres: puedes girarla y darle la vuelta. Luego robas otra. También puedes pasar y cambiar una pieza.',
    `Sumas 1 punto por casilla, ${AJUSTES.ptsLinea} por cada fila o columna de la figura que cierres y ${AJUSTES.ptsUltima} si colocas la última pieza.`,
    `Cada figura tienes un objetivo secreto (arriba, se despliega al tocarlo): cerrar tú una fila o columna concreta. Si lo consigues, +${AJUSTES.ptsObjetivo}; si la figura acaba sin que lo hayas cerrado, −${AJUSTES.ptsObjetivoFallo}.`,
    `Si con tu pieza dejas al siguiente sin sitio para ninguna de las suyas, ganas ${AJUSTES.ptsBloqueo} puntos por bloquearle. Quien no puede colocar nada rellena una casilla suelta.`,
    'Gana quien más puntos sume al acabar todas las figuras.'
  ]
};

export default function UnaPieza({ onExit }) {
  return <JuegoPulsador juego={JUEGO} onExit={onExit} />;
}
