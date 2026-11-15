// client/src/games/Cancion/Cancion.jsx
// «Afina ese oído»: menú inicial común y paso a los modos local u online.
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MenuInicioJuego } from '../../components/MenuJuego.jsx';
import CancionLocal from './CancionLocal.jsx';
import CancionOnline, { CLAVE_SESION_CANCION } from './CancionOnline.jsx';
import './Cancion.css';
import { useAbrirAyuda } from '../../lib/ayuda.js';


const haySesion = () => {
  try {
    return Boolean(sessionStorage.getItem(CLAVE_SESION_CANCION));
  } catch {
    return false;
  }
};

export default function Cancion({ onExit }) {
  const [modo, setModo] = useState(() => (haySesion() ? 'online' : 'menu'));
  const abrirAyuda = useAbrirAyuda();
  const navigate = useNavigate();
  const irAPortada = () => (typeof onExit === 'function' ? onExit() : navigate('/'));

  return (
    <>
      {modo === 'menu' && (
        <MenuInicioJuego
          juegoId="cancion"
          onOnline={() => setModo('online')}
          onLocal={() => setModo('local')}
          onAyuda={abrirAyuda}
        />
      )}
      {modo === 'local' && <CancionLocal onVolver={() => setModo('menu')} onExit={irAPortada} onAbrirAyuda={abrirAyuda} />}
      {modo === 'online' && <CancionOnline onVolver={() => setModo('menu')} onSalir={irAPortada} onAbrirAyuda={abrirAyuda} />}

    </>
  );
}
