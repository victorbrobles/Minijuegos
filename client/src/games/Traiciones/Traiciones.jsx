// client/src/games/Traiciones/Traiciones.jsx
// Traiciones es un juego en tiempo real y necesita un móvil por jugador, así que solo existe el modo online.
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TraicionesOnline from './TraicionesOnline.jsx';
import './Traiciones.css';
import { metaDe } from '../meta.js';

// Título y descripción: siempre los de meta.js
const { titulo: TITULO_JUEGO, descripcion: DESCRIPCION_JUEGO } = metaDe('traiciones');

export default function Traiciones({ onExit }) {
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
      <TraicionesOnline
        tituloJuego={TITULO_JUEGO}
        descripcionJuego={DESCRIPCION_JUEGO}
        onSalir={irAPortada}
        onAbrirAyuda={() => setMostrarAyuda(true)}
      />

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
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#1e1b4b' }}>¿Cómo se juega a Traiciones?</h3>
            </div>

            <div className="aprox-modal-cuerpo" style={{ fontSize: '0.92rem', lineHeight: '1.5', color: '#334155' }}>
              <p style={{ marginTop: 0, marginBottom: '1rem' }}>{DESCRIPCION_JUEGO}</p>
              
              <div style={{ marginBottom: '1.1rem' }}>
                <h4 style={{ color: '#0f172a', margin: '0 0 0.3rem', fontSize: '1rem' }}>👥 Bandos y Roles</h4>
                <ul style={{ paddingLeft: '1.2rem', margin: '0.3rem 0' }}>
                  <li style={{ marginBottom: '0.35rem' }}>
                    <strong>Leal:</strong> Muévete por las salas del campamento completando tareas para llenar la barra común y desenmascara a los traidores.
                  </li>
                  <li style={{ marginBottom: '0.35rem' }}>
                    <strong>Traidor:</strong> Sabotea tareas, finge coartadas y elimina sigilosamente a quien se quede a solas contigo.
                  </li>
                </ul>
              </div>

              <div style={{ marginBottom: '1.1rem' }}>
                <h4 style={{ color: '#0f172a', margin: '0 0 0.3rem', fontSize: '1rem' }}>⏳ Fases en tiempo real</h4>
                <ol style={{ paddingLeft: '1.2rem', margin: '0.3rem 0' }}>
                  <li style={{ marginBottom: '0.35rem' }}>
                    <strong>Campamento:</strong> Desplázate de sala en sala. Solo ves a quienes están contigo.
                  </li>
                  <li style={{ marginBottom: '0.35rem' }}>
                    <strong>Asamblea y Debate:</strong> Si alguien toca la campana o reporta un cuerpo, todos se reúnen en la hoguera.
                  </li>
                  <li style={{ marginBottom: '0.35rem' }}>
                    <strong>Votación y Veredicto:</strong> Se expulsa al más votado y se revela su rol.
                  </li>
                </ol>
              </div>

              <div>
                <h4 style={{ color: '#0f172a', margin: '0 0 0.3rem', fontSize: '1rem' }}>🏆 Condiciones de victoria</h4>
                <ul style={{ paddingLeft: '1.2rem', margin: '0.3rem 0' }}>
                  <li><strong>Leales:</strong> Completando todas las tareas o expulsando a todos los traidores.</li>
                  <li><strong>Traidores:</strong> Igualando en número a los leales vivos o si el campamento arde.</li>
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