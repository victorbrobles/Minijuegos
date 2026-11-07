// client/src/games/Colores/Colores.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ColoresLocal from './ColoresLocal.jsx';
import ColoresOnline from './ColoresOnline.jsx';
import './Colores.css';

const TITULO_JUEGO = 'La vida en colores';
const DESCRIPCION_JUEGO =
  'Algo que todo el mundo conoce, once colores disponibles. Adivina la combinación de colores presente en cada elemento.';

export default function Colores({ onExit }) {
  const [modo, setModo] = useState('online');
  const [mostrarAyuda, setMostrarAyuda] = useState(false);
  const navigate = useNavigate();

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
        <ColoresLocal
          onVolver={() => setModo('online')}
          onExit={irAPortada}
          onAbrirAyuda={() => setMostrarAyuda(true)}
        />
      ) : (
        <ColoresOnline
          tituloJuego={TITULO_JUEGO}
          descripcionJuego={DESCRIPCION_JUEGO}
          onLocal={() => setModo('local')}
          onSalir={irAPortada}
          onAbrirAyuda={() => setMostrarAyuda(true)}
        />
      )}

      {/* MODAL DE AYUDA */}
      {mostrarAyuda && (
        <div className="rg-modal-fondo" onClick={() => setMostrarAyuda(false)}>
          <div className="rg-modal aprox-modal-ayuda" onClick={(e) => e.stopPropagation()}>
            <div className="aprox-modal-header">
              <span className="aprox-modal-signo-title">?</span>
              <h3>¿Cómo se juega a La vida en colores?</h3>
            </div>

            <div className="aprox-modal-cuerpo">
              <p>{DESCRIPCION_JUEGO}</p>
              <p><strong>1. Dinámica del juego:</strong></p>
              <ul>
                <li>Participan de <strong>3 a 15 jugadores</strong>. La partida dura un máximo de <strong>25 rondas</strong>.</li>
                <li>Cada ronda muestra un elemento mítico y el <strong>número exacto de colores</strong> que debes adivinar.</li>
                <li>En modo online todos responden a la vez; en modo local os pasáis el dispositivo respondiendo en secreto.</li>
                <li>Tienes <strong>45 segundos</strong> para responder por turno.</li>
              </ul>
              <p><strong>2. Puntuación:</strong></p>
              <div className="aprox-tabla-puntos">
                <div className="aprox-puntos-fila acierto">
                  <span>🎯 Color acertado</span>
                  <strong>+1 punto por cada color correcto</strong>
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