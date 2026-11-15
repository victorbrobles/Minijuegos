// client/src/games/Colores/Colores.jsx
// «La vida en colores»: menú inicial común y paso a los modos local u online.
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MenuInicioJuego } from '../../components/MenuJuego.jsx';
import ColoresLocal from './ColoresLocal.jsx';
import ColoresOnline, { CLAVE_SESION_COLORES } from './ColoresOnline.jsx';
import './Colores.css';
import { useAbrirAyuda } from '../../lib/ayuda.js';


const haySesion = () => {
  try {
    return Boolean(sessionStorage.getItem(CLAVE_SESION_COLORES));
  } catch {
    return false;
  }
};

export default function Colores({ onExit }) {
  const [modo, setModo] = useState(() => (haySesion() ? 'online' : 'menu'));
  const abrirAyuda = useAbrirAyuda();
  const navigate = useNavigate();
  const irAPortada = () => (typeof onExit === 'function' ? onExit() : navigate('/'));

  return (
    <>
      {modo === 'menu' && (
        <MenuInicioJuego
          juegoId="colores"
          onOnline={() => setModo('online')}
          onLocal={() => setModo('local')}
          onAyuda={abrirAyuda}
        />
      )}
      {modo === 'local' && <ColoresLocal onVolver={() => setModo('menu')} onExit={irAPortada} onAbrirAyuda={abrirAyuda} />}
      {modo === 'online' && <ColoresOnline onVolver={() => setModo('menu')} onSalir={irAPortada} onAbrirAyuda={abrirAyuda} />}

    </>
  );
}
