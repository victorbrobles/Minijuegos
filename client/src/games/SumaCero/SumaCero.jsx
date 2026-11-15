// client/src/games/SumaCero/SumaCero.jsx
// Menú inicial común (online / un dispositivo) y paso a cada modo.
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MenuInicioJuego } from '../../components/MenuJuego.jsx';
import SumaCeroLocal from './SumaCeroLocal.jsx';
import SumaCeroOnline, { CLAVE_SESION_SUMACERO } from './SumaCeroOnline.jsx';
import './SumaCero.css';
import { useAbrirAyuda } from '../../lib/ayuda.js';


const haySesion = () => {
  try {
    return Boolean(sessionStorage.getItem(CLAVE_SESION_SUMACERO));
  } catch {
    return false;
  }
};

export default function SumaCero({ onExit }) {
  const [modo, setModo] = useState(() => (haySesion() ? 'online' : 'menu'));
  const abrirAyuda = useAbrirAyuda();
  const navigate = useNavigate();
  const irAPortada = () => (typeof onExit === 'function' ? onExit() : navigate('/'));

  return (
    <>
      {modo === 'menu' && (
        <MenuInicioJuego juegoId="sumacero" onOnline={() => setModo('online')} onLocal={() => setModo('local')} onAyuda={abrirAyuda} />
      )}
      {modo === 'local' && <SumaCeroLocal onVolver={() => setModo('menu')} onExit={irAPortada} onAbrirAyuda={abrirAyuda} />}
      {modo === 'online' && <SumaCeroOnline onVolver={() => setModo('menu')} onSalir={irAPortada} onAbrirAyuda={abrirAyuda} />}
    </>
  );
}
