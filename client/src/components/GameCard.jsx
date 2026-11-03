// client/src/components/GameCard.jsx
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon.jsx';
import { metaDe } from '../games/meta.js';

export default function GameCard({ game }) {
  const [mostrarDesc, setMostrarDesc] = useState(false);
  const [imgFallida, setImgFallida] = useState(false);
  const m = metaDe(game.id);
  const navigate = useNavigate();

  const titulo = m?.titulo || game?.name || 'Juego';
  const descripcion = m?.descripcion || game?.description || 'Sin descripción disponible.';
  const tienePortada = Boolean(m?.imagen) && !imgFallida;

  const entrarAlJuego = () => {
    navigate(`/juego/${game.id}`);
  };

  const toggleDesc = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setMostrarDesc((prev) => !prev);
  };

  const cerrarDesc = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setMostrarDesc(false);
  };

  const detenerInteraccion = (e) => {
    e.stopPropagation();
  };

  useEffect(() => {
    if (!mostrarDesc) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setMostrarDesc(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mostrarDesc]);

  return (
    <>
      <div
        className={`gc${tienePortada ? ' con-portada' : ''}`}
        style={{ '--g1': m.colores[0], '--g2': m.colores[1], cursor: 'pointer' }}
        onClick={entrarAlJuego}
        role="button"
        tabIndex={0}
        aria-label={titulo}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            entrarAlJuego();
          }
        }}
      >
        {/* Tu botón 'i' original intacto */}
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
          <img
            src={m.imagen}
            alt={titulo}
            className="gc-cover-img"
            loading="lazy"
            draggable="false"
            onError={() => setImgFallida(true)}
          />
        ) : (
          <>
            <Icon name={m.icono} className="gc-bg" aria-hidden="true" />
            <span className="gc-icon">
              <Icon name={m.icono} size={44} />
            </span>
            <span className="gc-name">{titulo}</span>
          </>
        )}
      </div>

      {/* Ventana emergente centrada en mitad de la pantalla */}
      {mostrarDesc &&
        createPortal(
          <div
            className="gc-modal-backdrop"
            onClick={cerrarDesc}
            onMouseDown={detenerInteraccion}
            onTouchStart={detenerInteraccion}
          >
            <div
              className="gc-modal-window"
              style={{ '--g1': m.colores[0], '--g2': m.colores[1] }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              role="dialog"
              aria-modal="true"
              aria-label={`Información de ${titulo}`}
            >
              <div className="gc-desc-header">
                <div>
                  <span className="gc-desc-badge">¿De qué trata?</span>
                  <h3 className="gc-modal-title">{titulo}</h3>
                </div>
                <button
                  type="button"
                  className="gc-desc-close"
                  onClick={cerrarDesc}
                  aria-label="Cerrar descripción"
                  title="Cerrar"
                >
                  ✕
                </button>
              </div>

              <p className="gc-desc-texto">{descripcion}</p>

              <button
                type="button"
                className="gc-desc-play"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setMostrarDesc(false);
                  entrarAlJuego();
                }}
              >
                Jugar ahora
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}