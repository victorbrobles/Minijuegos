// client/src/components/GameCard.jsx
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon.jsx';
import { metaDe } from '../games/meta.js';
import { LIMITES, textoJugadores } from '../games/limites.js';

export default function GameCard({ game }) {
  const [mostrarDesc, setMostrarDesc] = useState(false);
  const [imgFallida, setImgFallida] = useState(false);
  const m = metaDe(game.id);
  const navigate = useNavigate();

  const descripcion = m?.descripcion || game?.description || 'Sin descripción disponible.';
  const tienePortada = Boolean(m?.imagen) && !imgFallida;

  // Ventana de ayuda: Esc para cerrar y bloqueo del scroll de fondo
  useEffect(() => {
    if (!mostrarDesc) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setMostrarDesc(false); };
    const previo = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previo;
    };
  }, [mostrarDesc]);

  // Entrar al juego
  const entrarAlJuego = () => {
    navigate(`/juego/${game.id}`);
  };

  // Abrir o alternar la descripción
  const toggleDesc = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setMostrarDesc((prev) => !prev);
  };

  // Cerrar la descripción
  const cerrarDesc = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setMostrarDesc(false);
  };

  // Evitar que el clic o pulsación sobre los controles empiece el arrastre del carrusel
  const detenerInteraccion = (e) => {
    e.stopPropagation();
  };

  const nombre = m.titulo || game.name;

  return (
    <div className="gc-wrap">
    <div
      className={`gc${tienePortada ? ' con-portada' : ''}`}
      style={{ '--g1': m.colores[0], '--g2': m.colores[1], cursor: 'pointer' }}
      onClick={entrarAlJuego}
      role="button"
      tabIndex={0}
      aria-label={m.titulo || game.name}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          entrarAlJuego();
        }
      }}
    >
      {/* Botón 'i' para abrir la descripción */}
      <button
        type="button"
        className="gc-info-btn"
        onClick={toggleDesc}
        onMouseDown={detenerInteraccion}
        onTouchStart={detenerInteraccion}
        aria-label="Ver descripción del juego"
        title="Ver descripción"
      >
        <span className="gc-info-btn-text">i</span>
      </button>

      {tienePortada ? (
        /* Modo Portada Ilustrada (la imagen ya contiene el título del juego integrado) */
        <img
          src={m.imagen}
          alt={m.titulo || game.name}
          className="gc-cover-img"
          loading="lazy"
          draggable="false"
          onError={() => setImgFallida(true)}
        />
      ) : (
        /* Modo Icono + Degradado Único */
        <>
          <Icon name={m.icono} className="gc-bg" aria-hidden="true" />
          <span className="gc-icon">
            <Icon name={m.icono} size={44} />
          </span>
          <span className="gc-name">{m.titulo || game.name}</span>
        </>
      )}

      {/* Ventana emergente centrada con la descripción (portal: sale por encima de todo, no queda recortada por la tarjeta) */}
      {mostrarDesc && createPortal(
        <div
          className="gm-fondo"
          onClick={cerrarDesc}
          onMouseDown={detenerInteraccion}
          onTouchStart={detenerInteraccion}
          onKeyDown={detenerInteraccion}
        >
          <div
            className="gm-ventana"
            role="dialog"
            aria-modal="true"
            aria-label={`Ayuda: ${m.titulo || game.name}`}
            style={{ '--g1': m.colores[0], '--g2': m.colores[1] }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <button
              type="button"
              className="gm-cerrar"
              onClick={cerrarDesc}
              aria-label="Cerrar descripción"
              title="Cerrar"
            >
              ✕
            </button>

            <div className="gm-cabecera">
              {m?.imagen && !imgFallida ? (
                <img className="gm-img" src={m.imagen} alt="" width="512" height="512" />
              ) : (
                <span className="gm-img gm-img-icono"><Icon name={m.icono} size={40} /></span>
              )}
              <div>
                <span className="gm-badge">¿De qué trata?</span>
                <h2 className="gm-titulo">{m.titulo || game.name}</h2>
                {LIMITES[game.id] && <span className="gm-jugadores">👥 {textoJugadores(game.id)}</span>}
              </div>
            </div>

            <p className="gm-texto">{descripcion}</p>

            <button
              type="button"
              className="gm-jugar"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                entrarAlJuego();
              }}
            >
              Jugar ahora
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>

    {/* Nombre del juego bajo la tarjeta (también lleva al juego al pulsarlo) */}
    <p className="gc-caption" onClick={entrarAlJuego} aria-hidden="true">{nombre}</p>
    </div>
  );
}
