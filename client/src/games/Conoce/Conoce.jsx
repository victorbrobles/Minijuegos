// client/src/games/Conoce/Conoce.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConoceLocal from './ConoceLocal.jsx';
import ConoceOnline from './ConoceOnline.jsx';
import './Conoce.css';
import { metaDe } from '../meta.js';

// Título y descripción: siempre los de meta.js
const { titulo: TITULO_JUEGO, descripcion: DESCRIPCION_JUEGO } = metaDe('conoce');

export default function Conoce({ mode, onExit }) {
  const [modo, setModo] = useState(mode || 'online');
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
        <ConoceLocal
          onVolver={() => setModo('online')}
          onExit={irAPortada}
          onAbrirAyuda={() => setMostrarAyuda(true)}
        />
      ) : (
        <ConoceOnline
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
                  <strong>Pregunta sincera:</strong> En cada ronda aparece una pregunta cotidiana. Cada jugador escribe su respuesta en secreto.
                </li>
                <li>
                  <strong>Adivina quién dijo qué:</strong> Se muestran las respuestas desordenadas (si varios coinciden en la misma respuesta, aparece una sola vez y vale para cualquiera de ellos).
                </li>
                <li>
                  <strong>15 rondas:</strong> Empareja a cada amigo con su respuesta para sumar puntos por parejas.
                </li>
              </ul>

              <div className="cnc-ayuda-puntos">
                <div className="cnc-ayuda-fila mutuo">
                  <span>💚 ¡Os conocéis bien! (Acierto mutuo)</span>
                  <strong>+3 pts cada uno</strong>
                </div>
                <div className="cnc-ayuda-fila uno">
                  <span>💙 Uno acierta al otro</span>
                  <strong>+2 pts / -1 pt</strong>
                </div>
                <div className="cnc-ayuda-fila ninguno">
                  <span>💔 Ninguno acierta al otro</span>
                  <strong>-1 pt cada uno</strong>
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