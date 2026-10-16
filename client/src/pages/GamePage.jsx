import { useParams, Link } from 'react-router-dom';
import registry from '../games/registry.js';
import Icon from '../components/Icon.jsx';
import { metaDe } from '../games/meta.js';

export default function GamePage() {
  const { gameId } = useParams();
  const Game = registry[gameId];
  const m = metaDe(gameId);

  if (!Game) {
    return (
      <>
        <p>Este juego no existe.</p>
        <Link to="/" className="back"><Icon name="arrowLeft" size={20} strokeWidth={2.500} />Portada</Link>
      </>
    );
  }

  return (
    <div className="game-shell" style={{ '--g1': m.colores[0], '--g2': m.colores[1] }}>
      <Link to="/" className="back" aria-label="Volver a la portada">
        <Icon name="arrowLeft" size={20} strokeWidth={2.500} />
        <span>Portada</span>
      </Link>
      <Game />
    </div>
  );
}
