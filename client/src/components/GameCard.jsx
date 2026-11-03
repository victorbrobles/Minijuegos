// client/src/components/GameCard.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon.jsx';
import { metaDe } from '../games/meta.js';

export default function GameCard({ game }) {
  const [mostrarDesc, setMostrarDesc] = useState(false);
  const [imgFallida, setImgFallida] = useState(false);
  const m = metaDe(game.id);
  const navigate = useNavigate();

  const descripcion = m?.descripcion || game?.description || 'Sin descripción disponible.';
  const tienePortada = Boolean(m?.imagen) && !imgFallida;

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

  return (
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

      {/* Capa desplegada con la descripción completa */}
      {mostrarDesc && (
        <div
          className="gc-desc-overlay"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onMouseDown={detenerInteraccion}
          onTouchStart={detenerInteraccion}
        >
          <div className="gc-desc-header">
            <span className="gc-desc-badge">¿De qué trata?</span>
            <button
              type="button"
              className="gc-desc-close"
              onClick={cerrarDesc}
              onMouseDown={detenerInteraccion}
              onTouchStart={detenerInteraccion}
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
              entrarAlJuego();
            }}
            onMouseDown={detenerInteraccion}
            onTouchStart={detenerInteraccion}
          >
            Jugar ahora
          </button>
        </div>
      )}
    </div>
  );
}