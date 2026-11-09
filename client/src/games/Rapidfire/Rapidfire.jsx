// client/src/games/Rapidfire/Rapidfire.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RapidfireLocal from './RapidfireLocal.jsx';
import RapidfireOnline from './RapidfireOnline.jsx';
import './Rapidfire.css';
import { metaDe } from '../meta.js';

// Título y descripción: siempre los de meta.js
const { titulo: TITULO_JUEGO, descripcion: DESCRIPCION_JUEGO } = metaDe('rapidfire');

export default function Rapidfire({ onExit }) {
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
        <RapidfireLocal
          onVolver={() => setModo('online')}
          onExit={irAPortada}
          onAbrirAyuda={() => setMostrarAyuda(true)}
        />
      ) : (
        <RapidfireOnline
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
                  <strong>Elige entre 3 temáticas:</strong> Al inicio de cada ronda se sortean 3 categorías y el jugador en turno escoge una.
                </li>
                <li>
                  <strong>Preparación y 60 segundos:</strong> Tienes <strong>3 segundos</strong> para prepararte antes de que empiece la cuenta atrás de <strong>60 segundos</strong> para decir los elementos en voz alta.
                </li>
                <li>
                  <strong>Rebote:</strong> Si fallas o se agota el tiempo, el turno pasa por rebote al siguiente jugador para que complete las respuestas que falten.
                </li>
              </ul>

              <div className="rf-ayuda-puntos">
                <div className="rf-ayuda-fila ok">
                  <span>🎯 Reto completado</span>
                  <strong>+2 pts por elemento</strong>
                </div>
                <div className="rf-ayuda-fila rebote">
                  <span>🔄 Completado en rebote</span>
                  <strong>Se lleva todos los puntos</strong>
                </div>
                <div className="rf-ayuda-fila danger">
                  <span>🏳️ Rendirse / Nadie acierta</span>
                  <strong>0 puntos en la ronda</strong>
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