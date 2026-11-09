// client/src/games/Jugadas/Jugadas.jsx
// Menú inicial común (online / un dispositivo) y paso a cada modo.
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MenuInicioJuego } from '../../components/MenuJuego.jsx';
import JugadasLocal from './JugadasLocal.jsx';
import JugadasOnline, { CLAVE_SESION_JUGADAS } from './JugadasOnline.jsx';
import { Ayuda } from './JugadasComun.jsx';
import './Jugadas.css';
import { metaDe } from '../meta.js';

const { titulo: TITULO, descripcion: DESCRIPCION } = metaDe('jugadas');

const haySesion = () => {
  try {
    return Boolean(sessionStorage.getItem(CLAVE_SESION_JUGADAS));
  } catch {
    return false;
  }
};

export default function Jugadas({ onExit }) {
  const [modo, setModo] = useState(() => (haySesion() ? 'online' : 'menu'));
  const [ayuda, setAyuda] = useState(false);
  const navigate = useNavigate();
  const irAPortada = () => (typeof onExit === 'function' ? onExit() : navigate('/'));

  return (
    <>
      {modo === 'menu' && (
        <MenuInicioJuego juegoId="jugadas" onOnline={() => setModo('online')} onLocal={() => setModo('local')} onAyuda={() => setAyuda(true)} />
      )}
      {modo === 'local' && <JugadasLocal onVolver={() => setModo('menu')} onExit={irAPortada} onAbrirAyuda={() => setAyuda(true)} />}
      {modo === 'online' && <JugadasOnline onVolver={() => setModo('menu')} onSalir={irAPortada} onAbrirAyuda={() => setAyuda(true)} />}
      {ayuda && <Ayuda titulo={TITULO} descripcion={DESCRIPCION} onCerrar={() => setAyuda(false)} />}
    </>
  );
}
