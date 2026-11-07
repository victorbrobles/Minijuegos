// client/src/games/Cancion/Cancion.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CancionLocal from './CancionLocal.jsx';
import CancionOnline from './CancionOnline.jsx';
import './Cancion.css';

const TITULO_JUEGO = 'Afina ese oído';
const DESCRIPCION_JUEGO =
  'Adivina una canción mediante su reproducción. La canción aumenta progresivamente de volumen, cuanto antes aciertes, más puntos podrás conseguir.';

export default function Cancion({ onExit }) {
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
        <CancionLocal
          onVolver={() => setModo('online')}
          onExit={irAPortada}
          onAbrirAyuda={() => setMostrarAyuda(true)}
        />
      ) : (
        <CancionOnline
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
              <h3>¿Cómo se juega a Afina ese oído?</h3>
            </div>

            <div className="aprox-modal-cuerpo">
              <p>{DESCRIPCION_JUEGO}</p>
              <p><strong>1. Dinámica musical:</strong></p>
              <ul>
                <li>Pulsa el reproductor para escuchar el tema. La canción dura un máximo de 30s.</li>
                <li>En cuanto reconozcas el tema, <strong>pulsa el botón rojo</strong> para detener la reproducción. Tienes <strong>60 segundos para responder</strong>.</li>
              </ul>
              <p><strong>2. Puntuación y rebote:</strong></p>
              <ul>
                <li>Si aciertas, sumas <strong>+10 puntos</strong>.</li>
                <li>Si fallas o se te acaba el tiempo de respuesta, restas <strong>-5 puntos</strong> y quedas bloqueado, reanudándose el audio y la ronda para el resto.</li>
              </ul>
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