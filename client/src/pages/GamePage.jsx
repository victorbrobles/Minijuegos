import { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import registry from '../games/registry.js';
import Icon from '../components/Icon.jsx';
import { metaDe } from '../games/meta.js';
import { marcarJugado } from '../lib/favoritos.js';
import { anotar } from '../lib/metricas.js';
import { useNoche } from '../lib/noche.js';
import { capturarInvitacion, leerInvitacion } from '../lib/invitacion.js';
import '../pages/Noche.css';
import BotonSonido from '../components/Sonido.jsx';
import Reacciones from '../components/Reacciones.jsx';
import '../components/MenuJuego.css';
import { AyudaContexto } from '../lib/ayuda.js';
import { usePilotoGrupo } from '../lib/salaGrupo.js';
import { esOculto, useAccesoOculto } from '../lib/ocultos.js';

// Ayuda común (se descarga solo al abrirla)
const AyudaJuego = lazy(() => import('../components/AyudaJuego.jsx'));
const BOTON_AYUDA = '.qq-btn-ayuda, [aria-label="Cómo jugar"], [title="Cómo jugar"]';

export default function GamePage() {
  const { gameId } = useParams();
  const acceso = useAccesoOculto();
  const bloqueado = esOculto(gameId) && acceso !== 'si';
  const Game = bloqueado ? null : registry[gameId];
  const m = metaDe(gameId);
  const noche = useNoche();
  const enNoche = noche && noche.juegos[noche.actual] === gameId;

  // Invitación a una sala por enlace/QR (?sala=CODIGO)
  // Cualquier botón «?» del juego abre la ayuda común (en vez de la ventana propia de cada juego)
  // Abierto desde la sala del grupo: crea o entra en la partida sin teclear el código
  // (cada navegación remonta el juego: así el grupo puede abrir otra partida del mismo juego)
  const { key: claveNavegacion } = useLocation();
  const avisoPiloto = usePilotoGrupo(gameId, claveNavegacion);
  const [ayuda, setAyuda] = useState(false);
  const abrirAyudaJuego = useCallback(() => setAyuda(true), []);
  const abrirAyuda = (e) => {
    if (!e.target.closest?.(BOTON_AYUDA) || e.target.closest('.ayj')) return;
    e.preventDefault(); e.stopPropagation(); setAyuda(true);
  };

  const [invitacion, setInvitacion] = useState(() => capturarInvitacion(gameId));
  useEffect(() => {
    const f = () => setInvitacion(leerInvitacion(gameId));
    const t = setInterval(f, 1000);
    return () => clearInterval(t);
  }, [gameId]);

  // «Seguir jugando» en la portada
  useEffect(() => { if (Game) { marcarJugado(gameId); anotar('abrir', gameId); } }, [gameId, Game]);

  // Copia los colores del juego en <body> para que el fondo de la página
  // use exactamente los colores asignados al juego en meta.js.
  useEffect(() => {
    const estilo = document.body.style;
    estilo.setProperty('--g1', m.colores[0]);
    estilo.setProperty('--g2', m.colores[1]);
    return () => {
      estilo.removeProperty('--g1');
      estilo.removeProperty('--g2');
    };
  }, [m.colores]);

  if (!Game) {
    return (
      <>
        <p>{!bloqueado ? 'Este juego no existe.' : acceso === 'comprobando' ? 'Comprobando…' : 'Este juego no está disponible.'}</p>
        <Link to="/" className="back"><Icon name="arrowLeft" size={20} strokeWidth={2.500} />Portada</Link>
      </>
    );
  }

  return (
    <div className="game-shell" style={{ '--g1': m.colores[0], '--g2': m.colores[1] }} onClickCapture={abrirAyuda}>
      <Link to="/" className="back" aria-label="Volver a la portada">
        <Icon name="arrowLeft" size={20} strokeWidth={2.500} />
        <span>Portada</span>
      </Link>
      <BotonSonido clase="en-juego" />
      {invitacion && (
        <div className="qq-invitacion">📲 Te han invitado a la sala <b>{invitacion}</b>: entra en <b>Online</b> → <b>Unirse con código</b> y ya lo tendrás puesto.</div>
      )}
      <AyudaContexto.Provider value={abrirAyudaJuego}>
        <Suspense fallback={<p className="loading">Cargando el juego…</p>}><Game key={claveNavegacion} /></Suspense>
      </AyudaContexto.Provider>
      <Reacciones juego={gameId} />
      {avisoPiloto && <p className="sgg-piloto" role="status">👥 {avisoPiloto}</p>}
      {ayuda && <Suspense fallback={null}><AyudaJuego juegoId={gameId} onCerrar={() => setAyuda(false)} /></Suspense>}
      {enNoche && (
        <Link to="/noche" className={`nch-banner${noche.resultados[noche.actual] ? ' hecho' : ''}`}>
          🎉 {noche.resultados[noche.actual] ? '¡Resultado apuntado! Ver marcador' : `Noche de juegos · ${noche.actual + 1}/${noche.juegos.length}`}
        </Link>
      )}
    </div>
  );
}
