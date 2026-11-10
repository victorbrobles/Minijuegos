// client/src/games/Pulsador/JuegoPulsador.jsx
// Menú inicial común (online / un dispositivo) de los juegos de pulsador y paso a cada modo.
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MenuInicioJuego } from '../../components/MenuJuego.jsx';
import PulsadorLocal from './PulsadorLocal.jsx';
import PulsadorOnline, { claveSesion } from './PulsadorOnline.jsx';
import { Ayuda } from './Vistas.jsx';
import { JUEGOS } from './juegos.js';
import { metaDe } from '../meta.js';

const haySesion = (id) => {
  try {
    return Boolean(sessionStorage.getItem(claveSesion(id)));
  } catch {
    return false;
  }
};

export default function JuegoPulsador({ juegoId, onExit }) {
  const juego = JUEGOS[juegoId];
  const { titulo, descripcion } = metaDe(juegoId);
  const [modo, setModo] = useState(() => (haySesion(juegoId) ? 'online' : 'menu'));
  const [ayuda, setAyuda] = useState(false);
  const navigate = useNavigate();
  const irAPortada = () => (typeof onExit === 'function' ? onExit() : navigate('/'));

  return (
    <>
      {modo === 'menu' && (
        <MenuInicioJuego juegoId={juegoId} onOnline={() => setModo('online')} onLocal={() => setModo('local')} onAyuda={() => setAyuda(true)} />
      )}
      {modo === 'local' && <PulsadorLocal juego={juego} onVolver={() => setModo('menu')} onExit={irAPortada} onAbrirAyuda={() => setAyuda(true)} />}
      {modo === 'online' && <PulsadorOnline juego={juego} onVolver={() => setModo('menu')} onSalir={irAPortada} onAbrirAyuda={() => setAyuda(true)} />}
      {ayuda && <Ayuda titulo={titulo} descripcion={descripcion} reglas={juego.reglas} onCerrar={() => setAyuda(false)} />}
    </>
  );
}
