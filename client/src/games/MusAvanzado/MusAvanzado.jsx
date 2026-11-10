// client/src/games/MusAvanzado/MusAvanzado.jsx
// «Mus Avanzado»: baraja pactada, categorías cambiantes y apuestas con faroles. Usa la sala de ../Pulsador.
import React from 'react';
import JuegoPulsador from '../Pulsador/JuegoPulsador.jsx';
import MusAvanzadoLocal from './MusAvanzadoLocal.jsx';
import { PartidaOnline, Fin, Config } from './Partida.jsx';
import { AJUSTES } from './engine.js';

const JUEGO = {
  id: 'musavanzado',
  api: '/api/musavanzado',
  emoji: '🂡',
  config: { modo: 'individual', fichas: 20 },
  Local: MusAvanzadoLocal,
  Partida: PartidaOnline,
  Fin,
  Config,
  unidadPuntos: 'fichas',
  notaSala: '🂡 Individual de 4 a 8 o por parejas (4 o 6). Cada uno ve sus cartas en su móvil.',
  detalleFin: (j) => `${j.fichas} fichas`,
  ganador: (n) => (n.length > 1 ? `¡Empate entre ${n.join(' y ')}!` : `¡${n[0]} se lleva la mesa!`),
  reglas: [
    'Antes de jugar se pacta la baraja: cartas especiales (comodines, bombas, espejos, dobles, mutantes, ases y reyes invertidos), reglas especiales y qué categorías se juegan. Cualquiera puede proponer cambios, pero solo se empieza cuando todos aceptan.',
    'Cada categoría (la grande, parejas, escalera, colores, la suma, la pequeña…) se juega con 5 cartas nuevas. Primero cada uno puede cambiar hasta 2 cartas en secreto.',
    `Todos ponen ${AJUSTES.ante} ficha al bote. Por turnos, cada uno puede anunciar lo que tiene (o lo que quiere que crean) poniendo fichas, subir con algo mejor, pasar o desafiar a quien lleva la apuesta.`,
    'Si desafías, igualas su apuesta y se miran sus cartas: si decía la verdad, el bote es suyo; si iba de farol, es tuyo. Si nadie le desafía, se lleva el bote sin enseñar nada.',
    'Por parejas, cada pareja comparte fichas y juega con la mejor combinación de 5 cartas entre las 10 de los dos (sin ver las del compañero). Hablan por turnos.',
    'Gana quien tenga más fichas al acabar las categorías.'
  ]
};

export default function MusAvanzado({ onExit }) {
  return <JuegoPulsador juego={JUEGO} onExit={onExit} />;
}
