// client/src/games/Aproximacion/Aproximacion.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AproximacionLocal from './AproximacionLocal.jsx';
import AproximacionOnline from './AproximacionOnline.jsx';
import './Aproximacion.css';
import { metaDe } from '../meta.js';

// Título y descripción: siempre los de meta.js
const { titulo: TITULO_JUEGO, descripcion: DESCRIPCION_JUEGO } = metaDe('aproximacion');

export default function Aproximacion({ onExit }) {
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
        <AproximacionLocal
          onVolver={() => setModo('online')}
          onExit={irAPortada}
          onAbrirAyuda={() => setMostrarAyuda(true)}
        />
      ) : (
        <AproximacionOnline
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
                  <strong>Pregunta numérica (30 s):</strong> En cada ronda aparece una pregunta sobre récords, curiosidades o sobre los propios jugadores.
                </li>
                <li>
                  <strong>Cifra propia o confianza:</strong> El primer jugador dice una cifra. Los siguientes ven las cifras anteriores y pueden <strong>escribir otro número</strong> o <strong>confiar en el de un compañero</strong>.
                </li>
                <li>
                  <strong>Segunda oportunidad:</strong> Al cerrar la vuelta, el primer jugador dispone de 30 s para mantener su cifra o cambiar y confiar en la de otro.
                </li>
              </ul>

              <div className="aprox-ayuda-puntos">
                <div className="aprox-ayuda-fila acierto">
                  <span>🎯 Respuesta exacta</span>
                  <strong>+15 pts / +8 pts (confianza)</strong>
                </div>
                <div className="aprox-ayuda-fila cercana">
                  <span>🥇 Más cercana</span>
                  <strong>+6 pts / +3 pts (confianza)</strong>
                </div>
                <div className="aprox-ayuda-fila intermedio">
                  <span>⚖️ Intermedia (mitad sup. / inf.)</span>
                  <strong>+1 pt / -1 pt (autor)</strong>
                </div>
                <div className="aprox-ayuda-fila lejana">
                  <span>❌ Más lejana</span>
                  <strong>-5 pts (autor) / 0 pts</strong>
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