// client/src/games/Impostor/Impostor.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ImpostorLocal from './ImpostorLocal.jsx';
import ImpostorOnline from './ImpostorOnline.jsx';
import './Impostor.css';
import { metaDe } from '../meta.js';

// Título y descripción: siempre los de meta.js
const { titulo: TITULO_JUEGO, descripcion: DESCRIPCION_JUEGO } = metaDe('impostor');

export default function Impostor({ onExit }) {
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
        <ImpostorLocal
          onVolver={() => setModo('online')}
          onExit={irAPortada}
          onAbrirAyuda={() => setMostrarAyuda(true)}
        />
      ) : (
        <ImpostorOnline
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
                  <strong>Roles secretos:</strong> Todos los jugadores reciben la misma palabra secreta excepto uno, que será el <strong>Impostor</strong>.
                </li>
                <li>
                  <strong>4 Modos de juego:</strong> Antes de empezar podrás elegir entre <em>Clásico</em> (a ciegas), <em>Con Pista</em>, <em>Camuflado</em> (palabra similar) o <em>Preguntas</em> (turnos de Sí/No).
                </li>
                <li>
                  <strong>Debate y acusación:</strong> Dad pistas por turnos sin ser demasiado obvios para que el impostor no adivine la palabra, ¡y descubrid quién miente!
                </li>
              </ul>

              <div className="imp-ayuda-puntos">
                <div className="imp-ayuda-fila impostor">
                  <span>🎭 Victoria del Impostor</span>
                  <strong>+10 pts (+3 pts/ronda)</strong>
                </div>
                <div className="imp-ayuda-fila pueblo">
                  <span>👥 Victoria del Pueblo</span>
                  <strong>+3 pts cada inocente</strong>
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