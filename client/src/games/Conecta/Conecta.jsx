// client/src/games/Conecta/Conecta.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConectaLocal from './ConectaLocal.jsx';
import ConectaOnline from './ConectaOnline.jsx';
import './Conecta.css';

const TITULO_JUEGO = 'Conecta 4';
const DESCRIPCION_JUEGO =
  'Encuentra las 4 conexiones que existen entre los 16 elementos del tablero (de 4 en 4). Descubre qué conexión les une y gana puntos extra.';

export default function Conecta({ onExit }) {
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
        <ConectaLocal
          onVolver={() => setModo('online')}
          onExit={irAPortada}
          onAbrirAyuda={() => setMostrarAyuda(true)}
        />
      ) : (
        <ConectaOnline
          tituloJuego={TITULO_JUEGO}
          descripcionJuego={DESCRIPCION_JUEGO}
          onLocal={() => setModo('local')}
          onSalir={irAPortada}
          onAbrirAyuda={() => setMostrarAyuda(true)}
        />
      )}

      {/* MODAL DE AYUDA (disponible en menús previos al juego) */}
      {mostrarAyuda && (
        <div className="rg-modal-fondo" onClick={() => setMostrarAyuda(false)}>
          <div
            className="rg-modal aprox-modal-ayuda"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aprox-modal-header">
              <span className="aprox-modal-signo-title">?</span>
              <h3>¿Cómo se juega a Conecta 4?</h3>
            </div>

            <div className="aprox-modal-cuerpo">
              <p>{DESCRIPCION_JUEGO}</p>
              <p><strong>1. Dinámica del juego:</strong></p>
              <ul>
                <li>El tablero tiene <strong>16 elementos</strong> distribuidos en 4 conexiones secretas.</li>
                <li><strong>Pulsa el botón rojo</strong> cuando sepas una conexión y marca 4 casillas. Dispondrás de <strong>30 segundos</strong> para responder.</li>
                <li><strong>Ciclo de turnos:</strong> Tras responder (aciertes o falles), debes esperar a que respondan los demás jugadores vivos antes de poder volver a pulsar. Al responder todos, el turno se reinicia.</li>
                <li>Si fallas, pierdes 1 vida (3 vidas por ronda).</li>
                <li>Al acertar una conexión, puedes adivinar su temática para ganar <strong>+1 punto extra</strong>.</li>
              </ul>
              <p><strong>2. Puntuación por resolver:</strong></p>
              <div className="aprox-tabla-puntos">
                <div className="aprox-puntos-fila acierto">
                  <span>🥇 1ª conexión descubierta</span>
                  <strong>+5 puntos</strong>
                </div>
                <div className="aprox-puntos-fila intermedia" style={{ background: '#e0e7ff', color: '#4338ca' }}>
                  <span>🥈 2ª conexión descubierta</span>
                  <strong>+3 puntos</strong>
                </div>
                <div className="aprox-puntos-fila cercana">
                  <span>🥉 3ª conexión descubierta</span>
                  <strong>+1 punto</strong>
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