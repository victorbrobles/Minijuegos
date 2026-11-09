// client/src/games/Ciegas/Ciegas.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CiegasLocal from './CiegasLocal.jsx';
import CiegasOnline from './CiegasOnline.jsx';
import './Ciegas.css';
import { metaDe } from '../meta.js';

// Título y descripción: siempre los de meta.js
const { titulo: TITULO_JUEGO, descripcion: DESCRIPCION_JUEGO } = metaDe('ciegas');

export default function Ciegas({ onExit }) {
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
        <CiegasLocal
          onVolver={() => setModo('online')}
          onExit={irAPortada}
          onAbrirAyuda={() => setMostrarAyuda(true)}
        />
      ) : (
        <CiegasOnline
          tituloJuego={TITULO_JUEGO}
          descripcionJuego={DESCRIPCION_JUEGO}
          onLocal={() => setModo('local')}
          onSalir={irAPortada}
          onAbrirAyuda={() => setMostrarAyuda(true)}
        />
      )}

      {/* MODAL DE AYUDA UNIFICADO */}
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
                  <strong>Top 5 a ciegas:</strong> En cada ronda, el jugador activo recibe 5 elementos de uno en uno sin saber cuáles saldrán después.
                </li>
                <li>
                  <strong>Decisión definitiva:</strong> Cada elemento debe colocarse en un puesto libre del 1º al 5º y <strong>no se puede cambiar de posición</strong>.
                </li>
                <li>
                  <strong>Votación del grupo:</strong> Los demás ven el Top 5 final y votan (de 0 a 5) con qué nota o aciertos valoran el ranking armado.
                </li>
              </ul>

              <div className="ciegas-ayuda-puntos">
                <div className="ciegas-ayuda-fila protagonista">
                  <span>🎯 Jugador que arma el Top 5</span>
                  <strong>Suma los puntos otorgados por el grupo</strong>
                </div>
                <div className="ciegas-ayuda-fila rotacion">
                  <span>🔄 Turnos rotativos</span>
                  <strong>En la siguiente ronda arma el siguiente jugador</strong>
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