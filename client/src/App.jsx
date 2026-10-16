import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import GamePage from './pages/GamePage.jsx';

export default function App() {
  return (
    <main className="container">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/juego/:gameId" element={<GamePage />} />
        <Route path="*" element={<p>Página no encontrada.</p>} />
      </Routes>
    </main>
  );
}
