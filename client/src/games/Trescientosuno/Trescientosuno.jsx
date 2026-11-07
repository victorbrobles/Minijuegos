// client/src/games/Trescientosuno/Trescientosuno.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TrescientosunoLocal from './TrescientosunoLocal.jsx';
import TrescientosunoOnline from './TrescientosunoOnline.jsx';
import './Trescientosuno.css';

const TITULO_JUEGO = '301 Goles';
const DESCRIPCION_JUEGO =
  'Un club, un número objetivo y una estadística elegida (goles, asistencias o partidos). Di jugadores de ese club hasta llegar al número objetivo. Sé el primero en llegar a 0 o el que más cerca quede, pero ojo, no te pases.';

export default function Trescientosuno({ onExit }) {
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
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#1e1b4b' }}>¿Cómo se juega a 301 Goles?</h3>
            </div>

            <div className="aprox-modal-cuerpo" style={{ fontSize: '0.92rem', lineHeight: '1.5', color: '#334155' }}>
              <p style={{ marginTop: 0, marginBottom: '1rem' }}>{DESCRIPCION_JUEGO}</p>
              
              <div style={{ marginBottom: '1.1rem' }}>
                <h4 style={{ color: '#0f172a', margin: '0 0 0.3rem', fontSize: '1rem' }}>⚽ Dinámica</h4>
                <ul style={{ paddingLeft: '1.2rem', margin: '0.3rem 0' }}>
                  <li style={{ marginBottom: '0.35rem' }}>Se selecciona un equipo y una estadística a restar (Goles, Asistencias o Partidos jugados).</li>
                  <li style={{ marginBottom: '0.35rem' }}>Por turnos, introduce el nombre de un jugador que haya estado en ese club. Se restará su cifra histórica de tu marcador.</li>
                  <li style={{ marginBottom: '0.35rem' }}>Dispones de <strong>60 segundos</strong> por turno. Si no lo aciertas o el jugador no existe, conservarás tu turno para seguir probando.</li>
                </ul>
              </div>

              <div style={{ marginBottom: '1.1rem' }}>
                <h4 style={{ color: '#0f172a', margin: '0 0 0.3rem', fontSize: '1rem' }}>⭐ Comodines</h4>
                <ul style={{ paddingLeft: '1.2rem', margin: '0.3rem 0' }}>
                  <li style={{ marginBottom: '0.35rem' }}>Tienes 4 comodines (x2, x3, x5 y Revelar). Úsalos antes de escribir un jugador para multiplicar su valor o revelar una respuesta válida.</li>
                </ul>
              </div>

              <div>
                <h4 style={{ color: '#0f172a', margin: '0 0 0.3rem', fontSize: '1rem' }}>❌ Eliminación</h4>
                <ul style={{ paddingLeft: '1.2rem', margin: '0.3rem 0' }}>
                  <li>¡Cuidado! Si te pasas del 0 exacto, o nombras a un jugador con 0 en esa estadística, quedas eliminado.</li>
                </ul>
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