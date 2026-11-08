// client/src/games/Cancion/Cancion.jsx
// «Afina ese oído»: menú inicial común y paso a los modos local u online.
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MenuInicioJuego } from '../../components/MenuJuego.jsx';
import CancionLocal from './CancionLocal.jsx';
import CancionOnline, { CLAVE_SESION_CANCION } from './CancionOnline.jsx';
import { PUNTOS_MAX, PUNTOS_MIN, PUNTOS_FALLO, SEGUNDOS_RESPUESTA } from './Pantallas.jsx';
import './Cancion.css';
import { metaDe } from '../meta.js';

const { titulo: TITULO_JUEGO, descripcion: DESCRIPCION_JUEGO } = metaDe('cancion');

const haySesion = () => {
  try {
    return Boolean(sessionStorage.getItem(CLAVE_SESION_CANCION));
  } catch {
    return false;
  }
};

export default function Cancion({ onExit }) {
  const [modo, setModo] = useState(() => (haySesion() ? 'online' : 'menu'));
  const [mostrarAyuda, setMostrarAyuda] = useState(false);
  const navigate = useNavigate();
  const irAPortada = () => (typeof onExit === 'function' ? onExit() : navigate('/'));

  return (
    <>
      {modo === 'menu' && (
        <MenuInicioJuego
          juegoId="cancion"
          onOnline={() => setModo('online')}
          onLocal={() => setModo('local')}
          onAyuda={() => setMostrarAyuda(true)}
        />
      )}
      {modo === 'local' && <CancionLocal onVolver={() => setModo('menu')} onExit={irAPortada} onAbrirAyuda={() => setMostrarAyuda(true)} />}
      {modo === 'online' && <CancionOnline onVolver={() => setModo('menu')} onSalir={irAPortada} onAbrirAyuda={() => setMostrarAyuda(true)} />}

      {mostrarAyuda && (
        <div className="rg-modal-fondo" onClick={() => setMostrarAyuda(false)}>
          <div className="rg-modal qq-modal-ayuda" onClick={(e) => e.stopPropagation()}>
            <div className="qq-modal-ayuda-header">
              <span className="qq-ayuda-badge">❓ Cómo jugar</span>
              <h3>{TITULO_JUEGO}</h3>
            </div>
            <div className="qq-modal-ayuda-body">
              <p>{DESCRIPCION_JUEGO}</p>
              <ul>
                <li>Suena un fragmento de 30 segundos que empieza casi en silencio y va subiendo de volumen.</li>
                <li>En cuanto la reconozcas, pulsa <strong>«¡La sé!»</strong>: la canción se para y tienes {SEGUNDOS_RESPUESTA} segundos para escribir el título.</li>
                <li>Si fallas, quedas fuera de esa canción y sigue sonando para el resto (rebote).</li>
                <li>Si se acaba el fragmento y nadie la sabe, se revela la solución.</li>
                <li>Online, todos escucháis la misma canción a la vez desde vuestro móvil. En un dispositivo, quien la sepa pulsa y elige su nombre.</li>
              </ul>
              <p style={{ marginTop: '0.8rem', fontWeight: 800, color: '#0f172a' }}>Puntuación</p>
              <ul>
                <li>Acertar vale de <strong>{PUNTOS_MAX} a {PUNTOS_MIN} puntos</strong>: cuanto antes pulses, más.</li>
                <li>Fallar resta <strong>{PUNTOS_FALLO} puntos</strong> (nunca baja de 0).</li>
              </ul>
            </div>
            <button type="button" className="big full qq-btn-principal" onClick={() => setMostrarAyuda(false)}>
              ¡Entendido!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
