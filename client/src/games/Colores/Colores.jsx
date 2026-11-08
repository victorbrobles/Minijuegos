// client/src/games/Colores/Colores.jsx
// «La vida en colores»: menú inicial común y paso a los modos local u online.
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MenuInicioJuego } from '../../components/MenuJuego.jsx';
import ColoresLocal from './ColoresLocal.jsx';
import ColoresOnline, { CLAVE_SESION_COLORES } from './ColoresOnline.jsx';
import { PALETA, SEGUNDOS_RESPUESTA } from './Pantallas.jsx';
import './Colores.css';
import { metaDe } from '../meta.js';

const { titulo: TITULO_JUEGO, descripcion: DESCRIPCION_JUEGO } = metaDe('colores');

const haySesion = () => {
  try {
    return Boolean(sessionStorage.getItem(CLAVE_SESION_COLORES));
  } catch {
    return false;
  }
};

export default function Colores({ onExit }) {
  const [modo, setModo] = useState(() => (haySesion() ? 'online' : 'menu'));
  const [mostrarAyuda, setMostrarAyuda] = useState(false);
  const navigate = useNavigate();
  const irAPortada = () => (typeof onExit === 'function' ? onExit() : navigate('/'));

  return (
    <>
      {modo === 'menu' && (
        <MenuInicioJuego
          juegoId="colores"
          onOnline={() => setModo('online')}
          onLocal={() => setModo('local')}
          onAyuda={() => setMostrarAyuda(true)}
        />
      )}
      {modo === 'local' && <ColoresLocal onVolver={() => setModo('menu')} onExit={irAPortada} onAbrirAyuda={() => setMostrarAyuda(true)} />}
      {modo === 'online' && <ColoresOnline onVolver={() => setModo('menu')} onSalir={irAPortada} onAbrirAyuda={() => setMostrarAyuda(true)} />}

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
                <li>Cada ronda aparece algo que todo el mundo conoce (un logotipo, una bandera, un personaje…) y <strong>cuántos colores</strong> tiene.</li>
                <li>Elige esos colores entre los 11 de la paleta: {PALETA.map((c) => c.nombre.toLowerCase()).join(', ')}.</li>
                <li>Tienes <strong>{SEGUNDOS_RESPUESTA} segundos</strong>. Si se acaba el tiempo, cuenta lo que lleves elegido.</li>
                <li>En el modo online todos responden a la vez; en un dispositivo, os pasáis el móvil en secreto.</li>
                <li>Partidas de 10, 15 o 25 rondas, de 2 a 15 jugadores.</li>
              </ul>
              <p style={{ marginTop: '0.8rem', fontWeight: 800, color: '#0f172a' }}>Puntuación</p>
              <ul>
                <li><strong>+1 punto</strong> por cada color acertado. Si los aciertas todos, ¡pleno!</li>
                <li>Gana quien más puntos tenga al final.</li>
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
