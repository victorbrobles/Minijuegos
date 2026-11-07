// client/src/games/Buscaminas/Buscaminas.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BuscaminasLocal from './BuscaminasLocal.jsx';
import BuscaminasOnline from './BuscaminasOnline.jsx';
import './Buscaminas.css';
import { metaDe } from '../meta.js';

// Título y descripción: siempre los de meta.js
const { titulo: TITULO_JUEGO, descripcion: DESCRIPCION_JUEGO } = metaDe('buscaminas');

export default function Buscaminas({ onExit }) {
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
        <BuscaminasLocal
          onVolver={() => setModo('online')}
          onExit={irAPortada}
          onAbrirAyuda={() => setMostrarAyuda(true)}
        />
      ) : (
        <BuscaminasOnline
          tituloJuego={TITULO_JUEGO}
          descripcionJuego={DESCRIPCION_JUEGO}
          onLocal={() => setModo('local')}
          onSalir={irAPortada}
          onAbrirAyuda={() => setMostrarAyuda(true)}
        />
      )}

      {/* MODAL DE AYUDA (disponible en todos los menús previos al juego) */}
      {mostrarAyuda && (
        <div className="rg-modal-fondo" onClick={() => setMostrarAyuda(false)}>
          <div className="rg-modal aprox-modal-ayuda" onClick={(e) => e.stopPropagation()}>
            <div className="aprox-modal-header">
              <span className="aprox-modal-signo-title">?</span>
              <h3>¿Cómo se juega a Cuidado que explota?</h3>
            </div>

            <div className="aprox-modal-cuerpo">
              <p><strong>1. Dinámica del tablero (15 casillas):</strong></p>
              <ul>
                <li>Se muestra una consigna y un tablero de 15 elementos (3 filas x 5 columnas).</li>
                <li>Exactamente <strong>10 casillas son correctas</strong> y <strong>5 son bombas</strong>.</li>
                <li>Por turnos, cada jugador selecciona una casilla en menos de <strong>30 segundos</strong> o perderá el turno.</li>
                <li>Si aciertas, ganas puntos y la casilla queda inhabilitada para los demás.</li>
                <li>Si fallas, <strong>¡la bomba explota!</strong> y quedas eliminado por el resto de la ronda.</li>
              </ul>

              <p><strong>2. Puntuación según dificultad:</strong></p>
              <div className="aprox-tabla-puntos">
                <div className="aprox-puntos-fila acierto">
                  <span>🟢 Elemento Fácil</span>
                  <strong>+1 punto</strong>
                </div>
                <div className="aprox-puntos-fila intermedia" style={{ background: '#fef3c7', color: '#92400e' }}>
                  <span>🟡 Elemento Medio</span>
                  <strong>+2 puntos</strong>
                </div>
                <div className="aprox-puntos-fila acierto" style={{ background: '#ede9fe', color: '#5b21b6' }}>
                  <span>🟣 Elemento Difícil</span>
                  <strong>+3 puntos</strong>
                </div>
              </div>
            </div>

            <div className="rg-modal-acciones">
              <button className="big full qq-btn-principal" onClick={() => setMostrarAyuda(false)}>
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}