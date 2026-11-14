import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home.jsx';
import GamePage from './pages/GamePage.jsx';
import RetoDiario from './pages/RetoDiario.jsx';
import Estadisticas from './pages/Estadisticas.jsx';
import Creditos from './pages/Creditos.jsx';
import PerfilJugador from './pages/PerfilJugador.jsx';
import Noche from './pages/Noche.jsx';
import Tele from './pages/Tele.jsx';
import Grupos, { GrupoDetalle } from './pages/Grupos.jsx';
import { PuertaIdentidad } from './components/Identidad.jsx';
import AvisoLogros from './components/AvisoLogros.jsx';

export default function App() {
  const { pathname } = useLocation();
  // El modo tele no pide identidad: es una pantalla para mirar
  if (pathname.startsWith('/tele/')) return <Routes><Route path="/tele/:juego/:code" element={<Tele />} /></Routes>;
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
          <Route path="/grupos" element={<Grupos />} />
          <Route path="/grupo/:codigo" element={<GrupoDetalle />} />
          <Route path="*" element={<p>Página no encontrada.</p>} />
        </Routes>
        <AvisoLogros />
      </PuertaIdentidad>
    </main>
  );
}
