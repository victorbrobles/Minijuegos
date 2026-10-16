import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';
import { metaDe } from '../games/meta.js';

export default function GameCard({ game }) {
  const m = metaDe(game.id);
  return (
    <Link
      to={`/juego/${game.id}`}
      className="game-card"
      style={{ '--g1': m.colores[0], '--g2': m.colores[1] }}
    >
      <span className="game-card-icon"><Icon name={m.icono} size={64} strokeWidth={1.500} /></span>
      <h2>{game.name}</h2>
    </Link>
  );
}
