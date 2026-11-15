// client/src/games/FutbolGrid/FutbolGrid.jsx
// Menú inicial común (online / un dispositivo) y paso a cada modo.
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MenuInicioJuego } from '../../components/MenuJuego.jsx';
import FutbolGridLocal from './FutbolGridLocal.jsx';
import FutbolGridOnline, { CLAVE_SESION_FUTBOLGRID } from './FutbolGridOnline.jsx';
import './FutbolGrid.css';
import { useAbrirAyuda } from '../../lib/ayuda.js';


const haySesion = () => {
  try {
    return Boolean(sessionStorage.getItem(CLAVE_SESION_FUTBOLGRID));
  } catch {
    return false;
  }
};

export default function FutbolGrid({ onExit }) {
  const [modo, setModo] = useState(() => (haySesion() ? 'online' : 'menu'));
  const abrirAyuda = useAbrirAyuda();
  const navigate = useNavigate();
  const irAPortada = () => (typeof onExit === 'function' ? onExit() : navigate('/'));

  return (
    <>
      {modo === 'menu' && (
        <MenuInicioJuego juegoId="futbolgrid" onOnline={() => setModo('online')} onLocal={() => setModo('local')} onAyuda={abrirAyuda} />
      )}
      {modo === 'local' && <FutbolGridLocal onVolver={() => setModo('menu')} onExit={irAPortada} onAbrirAyuda={abrirAyuda} />}
      {modo === 'online' && <FutbolGridOnline onVolver={() => setModo('menu')} onSalir={irAPortada} onAbrirAyuda={abrirAyuda} />}
    </>
  );
}
