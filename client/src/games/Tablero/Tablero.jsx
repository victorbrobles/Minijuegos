// client/src/games/Tablero/Tablero.jsx
// «El Tablero de Puntos»: se eligen categorías entre 25 y, por turnos, se elige casilla (100 a 500) y se responde.
// Usa la sala y las pantallas comunes de ../Pulsador.
import React from 'react';
import JuegoPulsador from '../Pulsador/JuegoPulsador.jsx';
import TableroLocal from './TableroLocal.jsx';
import { PartidaOnline, Fin, Config } from './Partida.jsx';

const JUEGO = {
  id: 'tablero',
  api: '/api/tablero',
  emoji: '🎯',
  config: { categorias: 4, segundos: 20 },
  Local: TableroLocal,
  Partida: PartidaOnline,
  Fin,
  Config,
  notaSala: '🎯 Por turnos, cada uno elige casilla y responde desde su móvil; los demás lo ven en directo.',
  detalleFin: (j) => `${j.aciertos} aciertos · ${j.fallos} fallos`,
  ganador: (n) => (n.length > 1 ? `¡Empate entre ${n.join(' y ')}!` : `¡${n[0]} domina el tablero!`),
  reglas: [
    'Hay 25 categorías (cine, historia, fútbol, literatura, arte, videojuegos, mitología, espacio…). Al empezar, cada jugador elige por turnos una que no haya elegido nadie hasta completar las del tablero (de 3 a 6).',
    'Cada categoría tiene casillas de 100, 200, 300, 400 y 500 puntos: cuanto más valen, más difíciles son.',
    'El primer turno es al azar y después van en orden. Quien tiene el turno elige casilla y responde entre cuatro opciones: si acierta suma su valor; si falla, lo resta.',
    'Si fallas, hay REBOTE solo para el siguiente jugador: responde la misma pregunta (sin la opción fallada); si acierta suma, y si falla no resta.',
    'Hay una casilla doble escondida: vale el doble… para bien y para mal.',
    'La partida termina cuando no quedan casillas. Gana quien más puntos tenga.'
  ]
};

export default function Tablero({ onExit }) {
  return <JuegoPulsador juego={JUEGO} onExit={onExit} />;
}
