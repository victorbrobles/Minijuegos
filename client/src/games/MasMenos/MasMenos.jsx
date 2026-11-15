// client/src/games/MasMenos/MasMenos.jsx
// «Entre dos aguas»: dos cifras ocultas, elige la mayor y encadena aciertos. Usa la sala y las pantallas comunes de
// ../Pulsador; aquí van sus textos y su partida.
import React from 'react';
import JuegoPulsador from '../Pulsador/JuegoPulsador.jsx';
import MasMenosLocal from './MasMenosLocal.jsx';
import { PartidaOnline, Config } from './Partida.jsx';

const JUEGO = {
  id: 'masmenos',
  api: '/api/masmenos',
  emoji: '🌊',
  config: { categoria: 'azar', turnos: 10 },
  Local: MasMenosLocal,
  Partida: PartidaOnline,
  Config,
  notaSala: '🌊 Por turnos: cada uno juega su racha desde su móvil y los demás lo ven en directo.',
  unidadPuntos: 'de racha',
  detalleFin: (j) => (j.rachas.length > 1 ? `Rachas: ${j.rachas.join(', ')}` : 'Mejor racha'),
  ganador: (n) => (n.length > 1 ? `¡Empate entre ${n.join(' y ')}!` : `¡${n[0]} nada como pez en el agua!`),
};

export default function MasMenos({ onExit }) {
  return <JuegoPulsador juego={JUEGO} onExit={onExit} />;
}
