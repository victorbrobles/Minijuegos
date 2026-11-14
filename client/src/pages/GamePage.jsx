import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import registry from '../games/registry.js';
import Icon from '../components/Icon.jsx';
import { metaDe } from '../games/meta.js';
import { marcarJugado } from '../lib/favoritos.js';
import { useNoche } from '../lib/noche.js';
import { capturarInvitacion, leerInvitacion } from '../lib/invitacion.js';
import '../pages/Noche.css';
import BotonSonido from '../components/Sonido.jsx';
import Reacciones from '../components/Reacciones.jsx';
import '../components/MenuJuego.css';

export default function GamePage() {
  const { gameId } = useParams();
  const Game = registry[gameId];
  const m = metaDe(gameId);
  const noche = useNoche();
  const enNoche = noche && noche.juegos[noche.actual] === gameId;

  // Invitación a una sala por enlace/QR (?sala=CODIGO)
  const [invitacion, setInvitacion] = useState(() => capturarInvitacion(gameId));
  useEffect(() => {
    const f = () => setInvitacion(leerInvitacion(gameId));
    const t = setInterval(f, 1000);
    return () => clearInterval(t);
  }, [gameId]);

  // «Seguir jugando» en la portada
  useEffect(() => { if (Game) marcarJugado(gameId); }, [gameId, Game]);

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
      <BotonSonido clase="en-juego" />
      {invitacion && (
        <div className="qq-invitacion">📲 Te han invitado a la sala <b>{invitacion}</b>: entra en <b>Online</b> → <b>Unirse con código</b> y ya lo tendrás puesto.</div>
      )}
      <Game />
      <Reacciones juego={gameId} />
      {enNoche && (
        <Link to="/noche" className={`nch-banner${noche.resultados[noche.actual] ? ' hecho' : ''}`}>
          🎉 {noche.resultados[noche.actual] ? '¡Resultado apuntado! Ver marcador' : `Noche de juegos · ${noche.actual + 1}/${noche.juegos.length}`}
        </Link>
      )}
    </div>
  );
}
