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

      {/* MODAL DE AYUDA GLOBAL */}
      {mostrarAyuda && (
        <div className="rg-modal-fondo" onClick={() => setMostrarAyuda(false)}>
          <div
            className="rg-modal aprox-modal-ayuda"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '520px', textAlign: 'left', padding: '1.5rem' }}
          >
            <div className="aprox-modal-header" style={{ marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.6rem' }}>
              <span className="aprox-modal-signo-title">?</span>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#1e1b4b' }}>¿Cómo se juega a Rápido y certero?</h3>
            </div>

            <div className="aprox-modal-cuerpo" style={{ fontSize: '0.92rem', lineHeight: '1.5', color: '#334155' }}>
              <p style={{ marginTop: 0, marginBottom: '1rem' }}>{DESCRIPCION_JUEGO}</p>
              
              <p><strong>1. Dinámica del juego:</strong></p>
              <ul>
                <li>El jugador que tiene el turno elige 1 de las 3 categorías temáticas que se sortean al inicio de la ronda.</li>
                <li>Aparece un reto con el número de elementos requeridos (ej. <em>Di 5 películas de terror</em>).</li>
                <li>Cuentas con <strong>3 segundos de preparación</strong> antes de que comiencen los <strong>60 segundos</strong> para responder.</li>
                <li>Debes decir los elementos en voz alta. Si fallas o se agota el tiempo, el turno pasa por <strong>rebote</strong> al siguiente jugador para que complete los que faltan.</li>
                <li>La siguiente ronda la abrirá siempre de forma secuencial el jugador siguiente al que inició la ronda anterior.</li>
              </ul>

              <p style={{ marginTop: '0.9rem', marginBottom: '0.4rem', fontWeight: 800, color: '#0f172a' }}>Sistema de puntuación:</p>
              <div className="aprox-tabla-puntos">
                <div className="aprox-puntos-fila acierto">
                  <span>🎯 Reto completado con éxito</span>
                  <strong>+2 puntos por elemento pedido</strong>
                </div>
                <div className="aprox-puntos-fila intermedia" style={{ background: '#dbeafe', color: '#1e40af' }}>
                  <span>🔄 Completado en rebote</span>
                  <strong>Se lleva los puntos totales del reto</strong>
                </div>
                <div className="aprox-puntos-fila cercana" style={{ background: '#fee2e2', color: '#991b1b' }}>
                  <span>🏳️ Rendirse / Nadie lo logra</span>
                  <strong>0 puntos para todos en la ronda</strong>
                </div>
              </div>
            </div>

            <div className="rg-modal-acciones" style={{ marginTop: '1.2rem' }}>
              <button type="button" className="big full qq-btn-principal" onClick={() => setMostrarAyuda(false)}>
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}