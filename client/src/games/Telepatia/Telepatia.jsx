// client/src/games/Telepatia/Telepatia.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TelepatiaLocal from './TelepatiaLocal.jsx';
import TelepatiaOnline from './TelepatiaOnline.jsx';
import './Telepatia.css';
import { metaDe } from '../meta.js';

// Título y descripción: siempre los de meta.js
const { titulo: TITULO_JUEGO, descripcion: DESCRIPCION_JUEGO } = metaDe('telepatia');

export default function Telepatia({ mode, onExit }) {
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
        <TelepatiaLocal
          onVolver={() => setModo('online')}
          onExit={irAPortada}
          onAbrirAyuda={() => setMostrarAyuda(true)}
        />
      ) : (
        <TelepatiaOnline
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
                  <strong>Palabra Base:</strong> En cada ronda aparece una palabra común para todo el grupo (en online disponéis de <strong>5 segundos</strong> para escribir vuestra asociación).
                </li>
                <li>
                  <strong>Conexión mental:</strong> Si <strong>2 o más jugadores</strong> dicen o escriben exactamente la misma palabra, ¡conectan mentes y suman puntos!
                </li>
                <li>
                  <strong>Evolución de la partida:</strong> La palabra coincidente pasa a ser la palabra base de la siguiente ronda hasta completar las <strong>15 rondas</strong>.
                </li>
              </ul>

              <div className="tel-ayuda-puntos">
                <div className="tel-ayuda-fila match">
                  <span>⚡ 1ª Coincidencia</span>
                  <strong>+1 punto</strong>
                </div>
                <div className="tel-ayuda-fila racha">
                  <span>🔥 Racha consecutiva (2ª, 3ª…)</span>
                  <strong>+2 pts, +3 pts…</strong>
                </div>
                <div className="tel-ayuda-fila fallo">
                  <span>💔 Sin coincidir en la ronda</span>
                  <strong>0 pts (racha a 0)</strong>
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