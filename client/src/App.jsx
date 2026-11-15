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
const SalaGrupo = lazy(() => import('./pages/SalaGrupo.jsx'));
const Cargando = () => <p className="loading">Cargando…</p>;
// Solo en desarrollo: probar los minijuegos del Test de habilidad uno a uno
const PruebaHabilidad = import.meta.env.DEV ? lazy(() => import('./games/Habilidad/Prueba.jsx')) : null;
import { PuertaIdentidad } from './components/Identidad.jsx';
import AvisoLogros from './components/AvisoLogros.jsx';
import SalaGrupoGlobal from './components/SalaGrupo.jsx';
import { AvisoSinConexion } from './components/Ajustes.jsx';

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
          <Route path="/grupo/:codigo/sala" element={<SalaGrupo />} />
          <Route path="*" element={<p>Página no encontrada.</p>} />
        </Routes>
        </Suspense>
        <AvisoLogros />
        <SalaGrupoGlobal />
        <AvisoSinConexion />
      </PuertaIdentidad>
    </main>
  );
}
