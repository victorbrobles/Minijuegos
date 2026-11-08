// client/src/games/Ubicacion/Ubicacion.jsx
// «Test del viajero»: menú inicial común y paso a los modos local u online.
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MenuInicioJuego } from '../../components/MenuJuego.jsx';
import UbicacionLocal from './UbicacionLocal.jsx';
import UbicacionOnline, { CLAVE_SESION_UBICACION } from './UbicacionOnline.jsx';
import { TextoAyuda } from './Pantallas.jsx';
import './Ubicacion.css';
import { metaDe } from '../meta.js';

const { titulo: TITULO_JUEGO, descripcion: DESCRIPCION_JUEGO } = metaDe('ubicacion');

const haySesionOnline = () => {
  try {
    return Boolean(sessionStorage.getItem(CLAVE_SESION_UBICACION));
  } catch {
    return false;
  }
};

export default function Ubicacion({ onExit }) {
  // 'menu' | 'local' | 'online' (si hay una sala guardada, se vuelve a ella)
  const [modo, setModo] = useState(() => (haySesionOnline() ? 'online' : 'menu'));
  const [mostrarAyuda, setMostrarAyuda] = useState(false);
  const navigate = useNavigate();

  const irAPortada = () => {
    if (typeof onExit === 'function') onExit();
    else navigate('/');
  };

  return (
    <>
      {modo === 'menu' && (
        <MenuInicioJuego
          juegoId="ubicacion"
          onOnline={() => setModo('online')}
          onLocal={() => setModo('local')}
          onAyuda={() => setMostrarAyuda(true)}
        />
      )}
      {modo === 'local' && (
        <UbicacionLocal onVolver={() => setModo('menu')} onExit={irAPortada} onAbrirAyuda={() => setMostrarAyuda(true)} />
      )}
      {modo === 'online' && (
        <UbicacionOnline onVolver={() => setModo('menu')} onSalir={irAPortada} onAbrirAyuda={() => setMostrarAyuda(true)} />
      )}

      {mostrarAyuda && (
        <div className="rg-modal-fondo" onClick={() => setMostrarAyuda(false)}>
          <div className="rg-modal qq-modal-ayuda" onClick={(e) => e.stopPropagation()}>
            <div className="qq-modal-ayuda-header">
              <span className="qq-ayuda-badge">❓ Cómo jugar</span>
              <h3>{TITULO_JUEGO}</h3>
            </div>
            <div className="qq-modal-ayuda-body">
              <p>{DESCRIPCION_JUEGO}</p>
              <TextoAyuda />
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
