// client/src/games/Rankings/Rankings.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RankingsLocal from './RankingsLocal.jsx';
import RankingsOnline from './RankingsOnline.jsx';
import './Rankings.css';
import { metaDe } from '../meta.js';

// Título y descripción: siempre los de meta.js
const { titulo: TITULO_JUEGO, descripcion: DESCRIPCION_JUEGO } = metaDe('rankings');

export default function Rankings({ onExit }) {
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
        <RankingsLocal
          onVolver={() => setModo('online')}
          onExit={irAPortada}
          onAbrirAyuda={() => setMostrarAyuda(true)}
        />
      ) : (
        <RankingsOnline
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
                  <strong>Dinámica del ranking:</strong> Aparecerá un ranking real con varios puestos ocultos. Escribe cualquier elemento que creas que falta y se colocará en su posición automáticamente.
                </li>
                <li>
                  <strong>Turnos y rebotes (90 s):</strong> Si fallas o se agota el tiempo, el turno pasa por <strong>rebote</strong> al siguiente jugador. La siguiente ronda siempre la abre el jugador posterior a quien abrió la actual.
                </li>
                <li>
                  <strong>Pistas y bloqueo:</strong> Puedes pedir pista en un puesto antes de responder. Si un jugador falla o pasa turno sin haber pedido la pista de un puesto, esa pista queda <strong>bloqueada</strong> para los rebotes.
                </li>
              </ul>

              <div className="rk-ayuda-puntos">
                <div className="rk-ayuda-fila sin-pista">
                  <span>🎯 Acierto sin pista</span>
                  <strong>+3 puntos</strong>
                </div>
                <div className="rk-ayuda-fila con-pista">
                  <span>💡 Acierto con pista</span>
                  <strong>+1 punto</strong>
                </div>
                <div className="rk-ayuda-fila fallo">
                  <span>❌ Fallo o tiempo agotado</span>
                  <strong>0 puntos (Rebote)</strong>
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