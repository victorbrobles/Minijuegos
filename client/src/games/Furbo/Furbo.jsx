// client/src/games/Furbo/Furbo.jsx
// Menú inicial común (online / un dispositivo) y paso a cada modo.
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MenuInicioJuego } from '../../components/MenuJuego.jsx';
import FurboLocal from './FurboLocal.jsx';
import FurboOnline, { CLAVE_SESION_FURBO } from './FurboOnline.jsx';
import { AyudaFurbo } from './FurboComun.jsx';
import './Furbo.css';
import { metaDe } from '../meta.js';

const { titulo: TITULO_JUEGO, descripcion: DESCRIPCION_JUEGO } = metaDe('furbo');

const haySesion = () => {
  try {
    return Boolean(sessionStorage.getItem(CLAVE_SESION_FURBO));
  } catch {
    return false;
  }
};

export default function Furbo({ onExit }) {
  const [modo, setModo] = useState(() => (haySesion() ? 'online' : 'menu'));
  const [mostrarAyuda, setMostrarAyuda] = useState(false);
  const navigate = useNavigate();
  const irAPortada = () => (typeof onExit === 'function' ? onExit() : navigate('/'));

  return (
    <>
      {modo === 'menu' && (
        <MenuInicioJuego
          juegoId="furbo"
          onOnline={() => setModo('online')}
          onLocal={() => setModo('local')}
          onAyuda={() => setMostrarAyuda(true)}
        />
      )}
      {modo === 'local' && <FurboLocal onVolver={() => setModo('menu')} onExit={irAPortada} onAbrirAyuda={() => setMostrarAyuda(true)} />}
      {modo === 'online' && <FurboOnline onVolver={() => setModo('menu')} onSalir={irAPortada} onAbrirAyuda={() => setMostrarAyuda(true)} />}

      {mostrarAyuda && <AyudaFurbo titulo={TITULO_JUEGO} descripcion={DESCRIPCION_JUEGO} onCerrar={() => setMostrarAyuda(false)} />}
    </>
  );
}
