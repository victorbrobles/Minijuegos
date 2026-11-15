// client/src/games/Descarte/Descarte.jsx
// Menú inicial común (online / un dispositivo) y paso a cada modo.
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MenuInicioJuego } from '../../components/MenuJuego.jsx';
import DescarteLocal from './DescarteLocal.jsx';
import DescarteOnline, { CLAVE_SESION_DESCARTE } from './DescarteOnline.jsx';
import './Descarte.css';
import { useAbrirAyuda } from '../../lib/ayuda.js';


const haySesion = () => {
  try {
    return Boolean(sessionStorage.getItem(CLAVE_SESION_DESCARTE));
  } catch {
    return false;
  }
};

export default function Descarte({ onExit }) {
  const [modo, setModo] = useState(() => (haySesion() ? 'online' : 'menu'));
  const abrirAyuda = useAbrirAyuda();
  const navigate = useNavigate();
  const irAPortada = () => (typeof onExit === 'function' ? onExit() : navigate('/'));

  return (
    <>
      {modo === 'menu' && (
        <MenuInicioJuego juegoId="descarte" onOnline={() => setModo('online')} onLocal={() => setModo('local')} onAyuda={abrirAyuda} />
      )}
      {modo === 'local' && <DescarteLocal onVolver={() => setModo('menu')} onExit={irAPortada} onAbrirAyuda={abrirAyuda} />}
      {modo === 'online' && <DescarteOnline onVolver={() => setModo('menu')} onSalir={irAPortada} onAbrirAyuda={abrirAyuda} />}
    </>
  );
}
