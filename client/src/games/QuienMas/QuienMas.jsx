// client/src/games/QuienMas/QuienMas.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QuienMasLocal from './QuienMasLocal.jsx';
import QuienMasOnline from './QuienMasOnline.jsx';
import './QuienMas.css';
import { metaDe } from '../meta.js';

// Título y descripción: siempre los de meta.js
const { titulo: TITULO_JUEGO, descripcion: DESCRIPCION_JUEGO } = metaDe('quienmas');

export default function QuienMas({ onExit }) {
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
        <QuienMasLocal
          onVolver={() => setModo('online')}
          onExit={irAPortada}
          onAbrirAyuda={() => setMostrarAyuda(true)}
        />
      ) : (
        <QuienMasOnline
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
                  <strong>Pregunta para el grupo:</strong> En cada ronda aparece una pregunta sobre la personalidad o anécdotas de los jugadores.
                </li>
                <li>
                  <strong>Voto secreto (30 s):</strong> Cada jugador vota en secreto a la persona del grupo que mejor encaja con la pregunta antes de que se agote el tiempo.
                </li>
                <li>
                  <strong>Mayoría gana:</strong> Al terminar todos de votar se revelan los votos. Quienes hayan votado al jugador más votado suman puntos.
                </li>
              </ul>

              <div className="qm-ayuda-puntos">
                <div className="qm-ayuda-fila exito">
                  <span>🎯 Votar al jugador más votado</span>
                  <strong>+1 punto</strong>
                </div>
                <div className="qm-ayuda-fila empate">
                  <span>⚖️ Empate en primera posición</span>
                  <strong>0 puntos (nadie suma)</strong>
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