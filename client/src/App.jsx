import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import GamePage from './pages/GamePage.jsx';
import { PuertaIdentidad } from './components/Identidad.jsx';

export default function App() {
  return (
    <main className="container">
      {/* Antes de nada, cada sesión elige su identidad (Nombre#1234) */}
      <PuertaIdentidad>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/juego/:gameId" element={<GamePage />} />
          <Route path="*" element={<p>Página no encontrada.</p>} />
        </Routes>
      </PuertaIdentidad>
    </main>
  );
}
