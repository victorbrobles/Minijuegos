import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home.jsx';
import GamePage from './pages/GamePage.jsx';
import { lazy, Suspense } from 'react';
// Estilos de las páginas secundarias: siguen en la hoja global y en el mismo orden de antes;
// su JavaScript se descarga solo al abrirlas.
import './components/UnJugador.css';
import './reto/Reto.css';
import './components/SalonFama.css';
import './pages/Estadisticas.css';
import './pages/Creditos.css';
import './pages/Grupos.css';
import './pages/Noche.css';
import './pages/Tele.css';
const RetoDiario = lazy(() => import('./pages/RetoDiario.jsx'));
const Estadisticas = lazy(() => import('./pages/Estadisticas.jsx'));
const Creditos = lazy(() => import('./pages/Creditos.jsx'));
const PerfilJugador = lazy(() => import('./pages/PerfilJugador.jsx'));
const Noche = lazy(() => import('./pages/Noche.jsx'));
const Tele = lazy(() => import('./pages/Tele.jsx'));
const Grupos = lazy(() => import('./pages/Grupos.jsx'));
const GrupoDetalle = lazy(() => import('./pages/Grupos.jsx').then((m) => ({ default: m.GrupoDetalle })));
const PaginaAdmin = lazy(() => import('./components/AdminPanel.jsx').then((m) => ({ default: m.PaginaAdmin })));
const AdminEstadisticas = lazy(() => import('./pages/AdminEstadisticas.jsx'));
const AdminPanelPagina = lazy(() => import('./pages/AdminPanel.jsx'));
const Privacidad = lazy(() => import('./pages/Privacidad.jsx'));
const Cargando = () => <p className="loading">Cargando…</p>;
// Solo en desarrollo: probar los minijuegos del Test de habilidad uno a uno
const PruebaHabilidad = import.meta.env.DEV ? lazy(() => import('./games/Habilidad/Prueba.jsx')) : null;
import { PuertaIdentidad } from './components/Identidad.jsx';
import AvisoLogros from './components/AvisoLogros.jsx';
import GrupoGlobal from './components/GrupoGlobal.jsx';
import './components/Ajustes.css';
import { AvisoSinConexion } from './components/Ajustes.jsx';
import FinPartida from './components/FinPartida.jsx';

export default function App() {
  const { pathname } = useLocation();
  // El modo tele no pide identidad: es una pantalla para mirar
  if (pathname.startsWith('/tele/')) return <Suspense fallback={<Cargando />}><Routes><Route path="/tele/:juego/:code" element={<Tele />} /></Routes></Suspense>;
  return (
    <main className="container">
      {/* Antes de nada, cada sesión elige su identidad (Nombre#1234) */}
      <PuertaIdentidad>
        <Suspense fallback={<Cargando />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/juego/:gameId" element={<GamePage />} />
          <Route path="/reto" element={<RetoDiario />} />
          <Route path="/estadisticas" element={<Estadisticas />} />
          <Route path="/creditos" element={<Creditos />} />
          <Route path="/jugador/:nombre" element={<PerfilJugador />} />
          <Route path="/noche" element={<Noche />} />
          {PruebaHabilidad && <Route path="/prueba-habilidad/:id" element={<Suspense fallback={null}><PruebaHabilidad /></Suspense>} />}
          <Route path="/grupos" element={<Grupos />} />
          <Route path="/grupo/:codigo" element={<GrupoDetalle />} />
          <Route path="/admin" element={<PaginaAdmin />} />
          <Route path="/admin/estadisticas" element={<AdminEstadisticas />} />
          <Route path="/admin/panel" element={<AdminPanelPagina />} />
          <Route path="/privacidad" element={<Privacidad />} />
          <Route path="*" element={<p>Página no encontrada.</p>} />
        </Routes>
        </Suspense>
        <AvisoLogros />
        <GrupoGlobal />
        <AvisoSinConexion />
        <FinPartida />
      </PuertaIdentidad>
    </main>
  );
}
