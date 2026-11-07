// client/src/games/Furbo/Furbo.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FurboLocal from './FurboLocal.jsx';
import FurboOnline from './FurboOnline.jsx';
import { FASES_INFO, ORDEN_FASES } from './FurboInfo.js';
import './Furbo.css';
import { metaDe } from '../meta.js';

// Título y descripción: siempre los de meta.js
const { titulo: TITULO_JUEGO, descripcion: DESCRIPCION_JUEGO } = metaDe('furbo');

export default function Furbo({ onExit }) {
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
        <FurboLocal
          onVolver={() => setModo('online')}
          onExit={irAPortada}
          onAbrirAyuda={() => setMostrarAyuda(true)}
        />
      ) : (
        <FurboOnline
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
            style={{ maxWidth: '560px', textAlign: 'left', padding: '1.4rem' }}
          >
            <div className="aprox-modal-header" style={{ marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.6rem' }}>
              <span className="aprox-modal-signo-title">?</span>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#1e1b4b' }}>¿Cómo se juega a Furbo!?</h3>
            </div>

            <div className="aprox-modal-cuerpo" style={{ fontSize: '0.92rem', lineHeight: '1.5', color: '#334155' }}>
              <p style={{ marginTop: 0, marginBottom: '1rem' }}>{DESCRIPCION_JUEGO}</p>

              {ORDEN_FASES.map((id, index) => {
                const f = FASES_INFO[id];
                return (
                  <div key={id} style={{ marginBottom: '0.9rem' }}>
                    <p style={{ margin: '0 0 0.25rem 0', fontWeight: 800, color: '#0f172a' }}>
                      {index + 1}. {f.emoji} {f.nombre} ({f.lema}):
                    </p>
                    <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
                      {f.reglas.map((r, i) => (
                        <li key={i} dangerouslySetInnerHTML={{ __html: r }} style={{ marginBottom: '0.2rem' }} />
                      ))}
                    </ul>
                  </div>
                );
              })}

              <p style={{ fontWeight: 800, color: '#0f172a', margin: '1rem 0 0.4rem' }}>Resumen de puntuación:</p>
              <div className="aprox-tabla-puntos">
                <div className="aprox-puntos-fila acierto">
                  <span>🧤 Vestuario (coincidir respuesta)</span>
                  <strong>+2 puntos</strong>
                </div>
                <div className="aprox-puntos-fila intermedia" style={{ background: '#fef3c7', color: '#92400e' }}>
                  <span>🎯 Rebote (clavar dato / acertar rebote)</span>
                  <strong>+3 / +1 pt</strong>
                </div>
                <div className="aprox-puntos-fila acierto">
                  <span>📋 Quiniela 1X2 (acertar opción)</span>
                  <strong>+2 puntos</strong>
                </div>
                <div className="aprox-puntos-fila intermedia" style={{ background: '#e0e7ff', color: '#3730a3' }}>
                  <span>🗣️ Prórroga (palabra acertada / prohibida)</span>
                  <strong>+1 / −1 pt</strong>
                </div>
                <div className="aprox-puntos-fila acierto" style={{ background: '#ede9fe', color: '#5b21b6' }}>
                  <span>⚽ Penaltis (al centro / a la escuadra)</span>
                  <strong>+1 / +3 pts</strong>
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