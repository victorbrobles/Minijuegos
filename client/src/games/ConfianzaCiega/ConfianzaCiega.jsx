// client/src/games/ConfianzaCiega/ConfianzaCiega.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfianzaCiegaLocal from './ConfianzaCiegaLocal.jsx';
import ConfianzaCiegaOnline from './ConfianzaCiegaOnline.jsx';
import './ConfianzaCiega.css';
import { metaDe } from '../meta.js';

// Título y descripción: siempre los de meta.js
const { titulo: TITULO_JUEGO, descripcion: DESCRIPCION_JUEGO } = metaDe('confianzaciega');

export default function ConfianzaCiega({ onExit }) {
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
        <ConfianzaCiegaLocal
          onVolver={() => setModo('online')}
          onExit={irAPortada}
          onAbrirAyuda={() => setMostrarAyuda(true)}
        />
      ) : (
        <ConfianzaCiegaOnline
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
                  <strong>Elección secreta:</strong> El jugador activo recibe dos consignas y elige una en secreto.
                </li>
                <li>
                  <strong>Apuestas a ciegas:</strong> Los demás ven ambas opciones (sin saber cuál eligió) y apuestan un número y si dirá <strong>más de</strong> o <strong>menos de</strong> esa cantidad.
                </li>
                <li>
                  <strong>60 segundos de acción:</strong> Cuando el jugador activo pulse que está listo, tendrá <strong>60 segundos</strong> para decir en voz alta tantas respuestas válidas como pueda mientras el grupo lleva la cuenta.
                </li>
              </ul>

              <div className="cc-ayuda-puntos">
                <div className="cc-ayuda-fila exacto">
                  <span>🎯 Clavar el número exacto</span>
                  <strong>+N+5 puntos</strong>
                </div>
                <div className="cc-ayuda-fila acierto">
                  <span>✓ Acertar apuesta (más / menos)</span>
                  <strong>Puntos según cercanía</strong>
                </div>
                <div className="cc-ayuda-fila fallo">
                  <span>❌ Fallar la apuesta</span>
                  <strong>Resta puntos según lejanía</strong>
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