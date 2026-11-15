// client/src/games/Hipotesis/Hipotesis.jsx
// Menú inicial común (online / un dispositivo) y paso a cada modo.
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MenuInicioJuego } from '../../components/MenuJuego.jsx';
import HipotesisLocal from './HipotesisLocal.jsx';
import HipotesisOnline, { CLAVE_SESION_HIPOTESIS } from './HipotesisOnline.jsx';
import './Hipotesis.css';
import { useAbrirAyuda } from '../../lib/ayuda.js';


const haySesion = () => {
  try {
    return Boolean(sessionStorage.getItem(CLAVE_SESION_HIPOTESIS));
  } catch {
    return false;
  }
};

export default function Hipotesis({ onExit }) {
  const [modo, setModo] = useState(() => (haySesion() ? 'online' : 'menu'));
  const abrirAyuda = useAbrirAyuda();
  const navigate = useNavigate();
  const irAPortada = () => (typeof onExit === 'function' ? onExit() : navigate('/'));

  return (
    <>
      {modo === 'menu' && (
        <MenuInicioJuego juegoId="hipotesis" onOnline={() => setModo('online')} onLocal={() => setModo('local')} onAyuda={abrirAyuda} />
      )}
      {modo === 'local' && <HipotesisLocal onVolver={() => setModo('menu')} onExit={irAPortada} onAbrirAyuda={abrirAyuda} />}
      {modo === 'online' && <HipotesisOnline onVolver={() => setModo('menu')} onSalir={irAPortada} onAbrirAyuda={abrirAyuda} />}
    </>
  );
}
