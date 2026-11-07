// client/src/games/Ubicacion/Ubicacion.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UbicacionLocal from './UbicacionLocal.jsx';
import UbicacionOnline from './UbicacionOnline.jsx';
import { RANGOS_PUNTOS } from './geo.js';
import './Ubicacion.css';
import { metaDe } from '../meta.js';

// Título y descripción: siempre los de meta.js
const { titulo: TITULO_JUEGO, descripcion: DESCRIPCION_JUEGO } = metaDe('ubicacion');

export default function Ubicacion({ onExit }) {
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
        <UbicacionLocal
          onVolver={() => setModo('online')}
          onExit={irAPortada}
          onAbrirAyuda={() => setMostrarAyuda(true)}
        />
      ) : (
        <UbicacionOnline
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
                  <strong>Observa la foto:</strong> Al inicio de cada ronda se muestra un lugar o monumento durante <strong>10 segundos</strong>.
                </li>
                <li>
                  <strong>Un dispositivo (por turnos):</strong> Coloca <strong>1 marcador real (★)</strong> y <strong>2 señuelos</strong> en 90 segundos. El siguiente jugador verá tus marcas con «?» sin saber cuál es la real. El último jugador solo coloca su marca real.
                </li>
                <li>
                  <strong>Modo Online (simultáneo):</strong> Todos sitúan su marcador a la vez. Cada 15 segundos se activa un <strong>radar de 1 segundo</strong> que revela las marcas aún no confirmadas.
                </li>
              </ul>

              <p style={{ marginTop: '0.9rem', marginBottom: '0.4rem', fontWeight: 800, color: '#0f172a' }}>
                Puntuación según distancia:
              </p>
              <div className="tabla-ayuda-puntos">
                {RANGOS_PUNTOS.map((r) => (
                  <div key={r.hasta} className="fila-ayuda-puntos verde">
                    <span>A {r.hasta.toLocaleString('es-ES')} km o menos</span>
                    <strong>+{r.puntos} {r.puntos === 1 ? 'punto' : 'puntos'}</strong>
                  </div>
                ))}
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