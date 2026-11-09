// client/src/games/CuatroClubes/CuatroClubes.jsx
// Menú inicial común (online / un dispositivo) y paso a cada modo.
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MenuInicioJuego } from '../../components/MenuJuego.jsx';
import CuatroClubesLocal from './CuatroClubesLocal.jsx';
import CuatroClubesOnline, { CLAVE_SESION_CUATROCLUBES } from './CuatroClubesOnline.jsx';
import { Ayuda } from './Vistas.jsx';
import './CuatroClubes.css';
import { metaDe } from '../meta.js';

const { titulo: TITULO, descripcion: DESCRIPCION } = metaDe('cuatroclubes');

const haySesion = () => {
  try {
    return Boolean(sessionStorage.getItem(CLAVE_SESION_CUATROCLUBES));
  } catch {
    return false;
  }
};

export default function CuatroClubes({ onExit }) {
  const [modo, setModo] = useState(() => (haySesion() ? 'online' : 'menu'));
  const [ayuda, setAyuda] = useState(false);
  const navigate = useNavigate();
  const irAPortada = () => (typeof onExit === 'function' ? onExit() : navigate('/'));

  return (
    <>
      {modo === 'menu' && (
        <MenuInicioJuego juegoId="cuatroclubes" onOnline={() => setModo('online')} onLocal={() => setModo('local')} onAyuda={() => setAyuda(true)} />
      )}
      {modo === 'local' && <CuatroClubesLocal onVolver={() => setModo('menu')} onExit={irAPortada} onAbrirAyuda={() => setAyuda(true)} />}
      {modo === 'online' && <CuatroClubesOnline onVolver={() => setModo('menu')} onSalir={irAPortada} onAbrirAyuda={() => setAyuda(true)} />}
      {ayuda && <Ayuda titulo={TITULO} descripcion={DESCRIPCION} onCerrar={() => setAyuda(false)} />}
    </>
  );
}
