// client/src/games/Buscaminas/Buscaminas.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BuscaminasLocal from './BuscaminasLocal.jsx';
import BuscaminasOnline from './BuscaminasOnline.jsx';
import './Buscaminas.css';
import { metaDe } from '../meta.js';

// Título y descripción: siempre los de meta.js
const { titulo: TITULO_JUEGO, descripcion: DESCRIPCION_JUEGO } = metaDe('buscaminas');

export default function Buscaminas({ onExit }) {
  const [modo, setModo] = useState('online');
  const [mostrarAyuda, setMostrarAyuda] = useState(false);
  const navigate = useNavigate();

  // Redirección infalible a la portada
  const irAPortada = () => {
    if (typeof onExit === 'function') {
      onExit();
    } else {
      try {
        navigate('/');
      } catch {
        window.location.href = '/';
      }
    }
  };

  return (
    <>
      {modo === 'local' ? (
        <BuscaminasLocal
          onVolver={() => setModo('online')}
          onExit={irAPortada}
          onAbrirAyuda={() => setMostrarAyuda(true)}
        />
      ) : (
        <BuscaminasOnline
          tituloJuego={TITULO_JUEGO}
          descripcionJuego={DESCRIPCION_JUEGO}
          onLocal={() => setModo('local')}
          onSalir={irAPortada}
          onAbrirAyuda={() => setMostrarAyuda(true)}
        />
      )}

      {/* MODAL DE AYUDA UNIFICADO CON QUIÉN ES QUIÉN */}
      {mostrarAyuda && (
        <div className="rg-modal-fondo" onClick={() => setMostrarAyuda(false)}>
          <div
            className="rg-modal qq-modal-ayuda"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="qq-modal-ayuda-header">
              <span className="qq-ayuda-badge">❓ Cómo jugar</span>
              <h3>{TITULO_JUEGO}</h3>
            </div>

            <div className="qq-modal-ayuda-body">
              <p>{DESCRIPCION_JUEGO}</p>
              <ul>
                <li>
                  <strong>Tablero de 15 casillas:</strong> En cada ronda hay exactamente <strong>10 respuestas correctas</strong> y <strong>5 bombas</strong>.
                </li>
                <li>
                  <strong>Por turnos (30 s):</strong> Elige una casilla que cumpla la consigna antes de que se agote el tiempo o perderás el turno.
                </li>
                <li>
                  <strong>¡Cuidado con las minas!:</strong> Si aciertas, sumas puntos según la dificultad; si pisas una bomba, quedas eliminado el resto de la ronda.
                </li>
              </ul>

              <div className="bm-ayuda-puntos">
                <div className="bm-ayuda-fila facil">
                  <span>🟢 Elemento fácil</span>
                  <strong>+1 punto</strong>
                </div>
                <div className="bm-ayuda-fila medio">
                  <span>🟡 Elemento medio</span>
                  <strong>+2 puntos</strong>
                </div>
                <div className="bm-ayuda-fila dificil">
                  <span>🟣 Elemento difícil</span>
                  <strong>+3 puntos</strong>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="big full qq-btn-principal"
              onClick={() => setMostrarAyuda(false)}
            >
              ¡Entendido!
            </button>
          </div>
        </div>
      )}
    </>
  );
}