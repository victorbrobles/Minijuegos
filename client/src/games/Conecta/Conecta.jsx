// client/src/games/Conecta/Conecta.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConectaLocal from './ConectaLocal.jsx';
import ConectaOnline from './ConectaOnline.jsx';
import './Conecta.css';
import { metaDe } from '../meta.js';

// Título y descripción: siempre los de meta.js
const { titulo: TITULO_JUEGO, descripcion: DESCRIPCION_JUEGO } = metaDe('conecta');

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
              <p><strong>1. Por turnos:</strong></p>
              <ul>
                <li>Se sortea quién empieza; después el turno pasa en orden.</li>
                <li>Cuando es tu turno verás la pantalla <strong>«Turno de…»</strong>: pulsa <strong>Listo</strong> y tendrás <strong>90 segundos</strong>.</li>
                <li>Elige <strong>4 elementos</strong> que creas que forman una conexión y pulsa <strong>Comprobar</strong>.</li>
                <li>Si aciertas, sumas puntos y puedes adivinar <strong>qué los une</strong> (+1 punto extra).</li>
                <li>Si fallas o se acaba el tiempo, pierdes una vida (<strong>3 vidas</strong> por ronda). Sin vidas quedas eliminado.</li>
                <li>Aciertes o falles, el turno pasa al siguiente jugador.</li>
              </ul>
              <p><strong>2. La última conexión:</strong></p>
              <ul>
                <li>Con 3 conexiones descubiertas, solo queda adivinar qué une a los 4 últimos.</li>
                <li>Lo intenta quien tenga el turno: si acierta gana <strong>+2 puntos</strong> y termina la ronda; si falla, pasa al siguiente.</li>
                <li>Si nadie la adivina, la ronda termina y se muestran las soluciones.</li>
              </ul>
              <p><strong>3. Puntuación:</strong></p>
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
                <div className="aprox-puntos-fila intermedia" style={{ background: '#fef3c7', color: '#92400e' }}>
                  <span>💡 Adivinar qué los une</span>
                  <strong>+1 punto</strong>
                </div>
                <div className="aprox-puntos-fila intermedia" style={{ background: '#f3e8ff', color: '#6b21a8' }}>
                  <span>🏁 Última conexión</span>
                  <strong>+2 puntos</strong>
                </div>
              </div>
              <p className="hint small" style={{ marginTop: '0.6rem' }}>
                El anfitrión (o en un solo dispositivo, cualquiera) puede terminar la ronda en cualquier momento con las puntuaciones actuales.
              </p>
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