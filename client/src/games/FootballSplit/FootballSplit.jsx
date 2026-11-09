// client/src/games/FootballSplit/FootballSplit.jsx
// Menú inicial común (online / un dispositivo) y paso a cada modo.
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MenuInicioJuego } from '../../components/MenuJuego.jsx';
import FootballSplitLocal from './FootballSplitLocal.jsx';
import FootballSplitOnline, { CLAVE_SESION_FOOTBALLSPLIT } from './FootballSplitOnline.jsx';
import { Ayuda } from './Vistas.jsx';
import './FootballSplit.css';
import { metaDe } from '../meta.js';

const { titulo: TITULO, descripcion: DESCRIPCION } = metaDe('footballsplit');

const haySesion = () => {
  try {
    return Boolean(sessionStorage.getItem(CLAVE_SESION_FOOTBALLSPLIT));
  } catch {
    return false;
  }
};

export default function FootballSplit({ onExit }) {
  const [modo, setModo] = useState(() => (haySesion() ? 'online' : 'menu'));
  const [ayuda, setAyuda] = useState(false);
  const navigate = useNavigate();
  const irAPortada = () => (typeof onExit === 'function' ? onExit() : navigate('/'));

  return (
    <>
      {modo === 'menu' && (
        <MenuInicioJuego juegoId="footballsplit" onOnline={() => setModo('online')} onLocal={() => setModo('local')} onAyuda={() => setAyuda(true)} />
      )}
      {modo === 'local' && <FootballSplitLocal onVolver={() => setModo('menu')} onExit={irAPortada} onAbrirAyuda={() => setAyuda(true)} />}
      {modo === 'online' && <FootballSplitOnline onVolver={() => setModo('menu')} onSalir={irAPortada} onAbrirAyuda={() => setAyuda(true)} />}
      {ayuda && <Ayuda titulo={TITULO} descripcion={DESCRIPCION} onCerrar={() => setAyuda(false)} />}
    </>
  );
}
