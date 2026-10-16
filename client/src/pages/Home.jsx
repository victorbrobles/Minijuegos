import { useEffect, useState } from 'react';
import GameCard from '../components/GameCard.jsx';
import Icon from '../components/Icon.jsx';
import AdminPanel from '../components/AdminPanel.jsx';

export default function Home() {
  const [games, setGames] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/games')
      .then((r) => r.json())
      .then(setGames)
      .catch(() => setError('No se pudo cargar el catálogo. ¿Está arrancado el servidor?'));
  }, []);

  return (
    <>
      <header className="hero">
        <span className="hero-logo"><Icon name="gamepad" size={34} /></span>
        <h1 className="hero-title">Minigames Hub</h1>
        <p className="hero-sub">¡Elige un minijuego y a jugar!</p>
      </header>
      {error && <p className="error">{error}</p>}
      <div className="grid">
        {games.map((g) => <GameCard key={g.id} game={g} />)}
      </div>
      <AdminPanel />
    </>
  );
}
