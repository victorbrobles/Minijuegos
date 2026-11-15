// client/src/games/Ubicacion/Ubicacion.jsx
// «Test del viajero»: menú inicial común y paso a los modos local u online.
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MenuInicioJuego } from '../../components/MenuJuego.jsx';
import UbicacionLocal from './UbicacionLocal.jsx';
import UbicacionOnline, { CLAVE_SESION_UBICACION } from './UbicacionOnline.jsx';
import './Ubicacion.css';
import { useAbrirAyuda } from '../../lib/ayuda.js';


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
  const abrirAyuda = useAbrirAyuda();
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
          onAyuda={abrirAyuda}
        />
      )}
      {modo === 'local' && (
        <UbicacionLocal onVolver={() => setModo('menu')} onExit={irAPortada} onAbrirAyuda={abrirAyuda} />
      )}
      {modo === 'online' && (
        <UbicacionOnline onVolver={() => setModo('menu')} onSalir={irAPortada} onAbrirAyuda={abrirAyuda} />
      )}

    </>
  );
}
