// client/src/games/QuienEsQuien/QuienEsQuien.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QuienEsQuienLocal from './QuienEsQuienLocal.jsx';
import QuienEsQuienOnline from './QuienEsQuienOnline.jsx';
import './QuienEsQuien.css';

const TITULO_JUEGO = '¿Sabes quién soy?';
const DESCRIPCION_JUEGO =
  "Una categoría conjunta, un elemento a adivinar para cada uno de los jugadores. Cada jugador sabe el elemento de todos los demás menos el suyo. Adivina tu elemento antes que nadie haciendo preguntas de 'sí' o 'no'.";

export default function QuienEsQuien({ onExit }) {
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
        <QuienEsQuienLocal
          onVolver={() => setModo('online')}
          onExit={irAPortada}
          onAbrirAyuda={() => setMostrarAyuda(true)}
        />
      ) : (
        <QuienEsQuienOnline
          tituloJuego={TITULO_JUEGO}
          descripcionJuego={DESCRIPCION_JUEGO}
          onLocal={() => setModo('local')}
          onSalir={irAPortada}
          onAbrirAyuda={() => setMostrarAyuda(true)}
        />
      )}

      {/* MODAL DE AYUDA */}
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
                  <strong>Por turnos:</strong> Haz preguntas al grupo que solo puedan responderse con <strong>«Sí»</strong> o <strong>«No»</strong>.
                </li>
                <li>
                  <strong>Cubierta secreta:</strong> Mantén pulsada la cubierta en tu pantalla para consultar las tarjetas de tus compañeros y responder a sus preguntas.
                </li>
                <li>
                  <strong>Objetivo:</strong> Adivinar tu elemento antes que el resto.
                </li>
              </ul>
            </div>

            <button
              type="button"
              className="big full"
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