import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';
import { metaDe } from '../games/meta.js';

// Tarjeta de la portada: degradado con el color del juego, icono grande y nombre
export default function GameCard({ game }) {
  const m = metaDe(game.id);
  return (
    <Link
      to={`/juego/${game.id}`}
      className="gc"
      style={{ '--g1': m.colores[0], '--g2': m.colores[1] }}
    >
      <Icon name={m.icono} size={120} strokeWidth={1.4} className="gc-bg" />
      <span className="gc-icon"><Icon name={m.icono} size={40} strokeWidth={1.9} /></span>
      <span className="gc-name">{game.name}</span>
    </Link>
  );
}
