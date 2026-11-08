// client/src/games/Trescientosuno/Trescientosuno.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TrescientosunoLocal from './TrescientosunoLocal.jsx';
import TrescientosunoOnline from './TrescientosunoOnline.jsx';
import './Trescientosuno.css';
import { metaDe } from '../meta.js';

// Título y descripción: siempre los de meta.js
const { titulo: TITULO_JUEGO, descripcion: DESCRIPCION_JUEGO } = metaDe('trescientosuno');

export default function Trescientosuno({ onExit }) {
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
        <TrescientosunoLocal
          onVolver={() => setModo('online')}
          onExit={irAPortada}
          onAbrirAyuda={() => setMostrarAyuda(true)}
        />
      ) : (
        <TrescientosunoOnline
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
                  <strong>Dinámica (60 s):</strong> Elige un club o selección y una estadística (Goles, Asistencias o Partidos). Por turnos, nombra futbolistas que hayan jugado en ese equipo para restar su cifra de tu marcador.
                </li>
                <li>
                  <strong>Comodines:</strong> Dispones de 4 comodines por partida (<strong>x2</strong>, <strong>x3</strong>, <strong>x5</strong> y <strong>🔍 Revelar</strong>) para multiplicar tu resta o elegir entre respuestas sugeridas.
                </li>
                <li>
                  <strong>Plantarse o eliminación:</strong> Puedes plantarte en cualquier turno para asegurar tu puntuación. Si te pasas de 0 o nombras a un jugador con 0 en esa estadística, quedas eliminado.
                </li>
              </ul>

              <div className="tcu-ayuda-chips">
                <span className="tcu-ayuda-chip ok">🎯 Objetivo: clavar el 0</span>
                <span className="tcu-ayuda-chip warn">🛑 Plantarse: conserva puntos</span>
                <span className="tcu-ayuda-chip danger">💀 &lt; 0 o estadística 0: eliminado</span>
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