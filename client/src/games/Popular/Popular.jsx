// client/src/games/Popular/Popular.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PopularLocal from './PopularLocal.jsx';
import PopularOnline from './PopularOnline.jsx';
import './Popular.css';
import { metaDe } from '../meta.js';

// Título y descripción: siempre los de meta.js
const { titulo: TITULO_JUEGO, descripcion: DESCRIPCION_JUEGO } = metaDe('popular');

export default function Popular({ onExit }) {
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
        <PopularLocal
          onVolver={() => setModo('online')}
          onExit={irAPortada}
          onAbrirAyuda={() => setMostrarAyuda(true)}
        />
      ) : (
        <PopularOnline
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
                  <strong>Las 5 más populares:</strong> En cada ronda se plantea una situación cotidiana y hay que descubrir las 5 respuestas más habituales de la gente.
                </li>
                <li>
                  <strong>Por turnos (45 s):</strong> Escribe cualquier idea que creas que está en el Top 5. Basta con la palabra clave o un sinónimo claro.
                </li>
                <li>
                  <strong>Pistas por puesto (-1 pt):</strong> Pulsa <strong>💡 Pista</strong> en cualquier fila oculta para ver sus huecos de letras, y <strong>🔤 +Letras</strong> para revelar letras iniciales.
                </li>
              </ul>

              <div className="pop-ayuda-puntos">
                <div className="pop-ayuda-fila top1">
                  <span>🥇 Puestos #1 y #2</span>
                  <strong>+2 pts / +4 pts</strong>
                </div>
                <div className="pop-ayuda-fila top3">
                  <span>🥈 Puestos #3 y #4</span>
                  <strong>+6 pts / +8 pts</strong>
                </div>
                <div className="pop-ayuda-fila top5">
                  <span>🏆 Puesto #5 (menos obvio)</span>
                  <strong>+10 puntos</strong>
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