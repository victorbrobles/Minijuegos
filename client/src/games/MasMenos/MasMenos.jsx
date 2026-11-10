// client/src/games/MasMenos/MasMenos.jsx
// «Entre dos aguas»: dos cifras ocultas, elige la mayor y encadena aciertos. Usa la sala y las pantallas comunes de
// ../Pulsador; aquí van sus textos y su partida.
import React from 'react';
import JuegoPulsador from '../Pulsador/JuegoPulsador.jsx';
import MasMenosLocal from './MasMenosLocal.jsx';
import { PartidaOnline, Config } from './Partida.jsx';
import { AJUSTES } from './engine.js';

const JUEGO = {
  id: 'masmenos',
  api: '/api/masmenos',
  emoji: '🌊',
  config: { categoria: 'azar', vueltas: 1 },
  Local: MasMenosLocal,
  Partida: PartidaOnline,
  Config,
  notaSala: '🌊 Por turnos: cada uno juega su racha desde su móvil y los demás lo ven en directo.',
  unidadPuntos: 'de racha',
  detalleFin: (j) => (j.rachas.length > 1 ? `Rachas: ${j.rachas.join(', ')}` : 'Mejor racha'),
  ganador: (n) => (n.length > 1 ? `¡Empate entre ${n.join(' y ')}!` : `¡${n[0]} nada como pez en el agua!`),
  reglas: [
    'Elegid una categoría (o al azar). Cada jugador juega su turno.',
    `Salen dos elementos con su cifra oculta (población, taquilla, altura…). Toca el que tenga más: tienes ${AJUSTES.segEleccion} segundos.`,
    'Si aciertas, se revelan las cifras, sale el elemento que más tiempo llevaba y entra otro. Tu racha sigue hasta el primer fallo.',
    'Gana quien consiga la racha más larga. Nunca salen dos cifras casi iguales.'
  ]
};

export default function MasMenos({ onExit }) {
  return <JuegoPulsador juego={JUEGO} onExit={onExit} />;
}
