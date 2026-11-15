// client/src/games/CuatroClubes/CuatroClubes.jsx
// Menú inicial común (online / un dispositivo) y paso a cada modo.
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MenuInicioJuego } from '../../components/MenuJuego.jsx';
import CuatroClubesLocal from './CuatroClubesLocal.jsx';
import CuatroClubesOnline, { CLAVE_SESION_CUATROCLUBES } from './CuatroClubesOnline.jsx';
import './CuatroClubes.css';
import { useAbrirAyuda } from '../../lib/ayuda.js';


const haySesion = () => {
  try {
    return Boolean(sessionStorage.getItem(CLAVE_SESION_CUATROCLUBES));
  } catch {
    return false;
  }
};

export default function CuatroClubes({ onExit }) {
  const [modo, setModo] = useState(() => (haySesion() ? 'online' : 'menu'));
  const abrirAyuda = useAbrirAyuda();
  const navigate = useNavigate();
  const irAPortada = () => (typeof onExit === 'function' ? onExit() : navigate('/'));

  return (
    <>
      {modo === 'menu' && (
        <MenuInicioJuego juegoId="cuatroclubes" onOnline={() => setModo('online')} onLocal={() => setModo('local')} onAyuda={abrirAyuda} />
      )}
      {modo === 'local' && <CuatroClubesLocal onVolver={() => setModo('menu')} onExit={irAPortada} onAbrirAyuda={abrirAyuda} />}
      {modo === 'online' && <CuatroClubesOnline onVolver={() => setModo('menu')} onSalir={irAPortada} onAbrirAyuda={abrirAyuda} />}
    </>
  );
}
