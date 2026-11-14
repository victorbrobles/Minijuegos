import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import GamePage from './pages/GamePage.jsx';
import RetoDiario from './pages/RetoDiario.jsx';
import Estadisticas from './pages/Estadisticas.jsx';
import Creditos from './pages/Creditos.jsx';
import PerfilJugador from './pages/PerfilJugador.jsx';
import Noche from './pages/Noche.jsx';
import { PuertaIdentidad } from './components/Identidad.jsx';
import AvisoLogros from './components/AvisoLogros.jsx';

export default function App() {
  return (
    <main className="container">
      {/* Antes de nada, cada sesión elige su identidad (Nombre#1234) */}
      <PuertaIdentidad>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/juego/:gameId" element={<GamePage />} />
          <Route path="/reto" element={<RetoDiario />} />
          <Route path="/estadisticas" element={<Estadisticas />} />
          <Route path="/creditos" element={<Creditos />} />
          <Route path="/jugador/:nombre" element={<PerfilJugador />} />
          <Route path="/noche" element={<Noche />} />
          <Route path="*" element={<p>Página no encontrada.</p>} />
        </Routes>
        <AvisoLogros />
      </PuertaIdentidad>
    </main>
  );
}
