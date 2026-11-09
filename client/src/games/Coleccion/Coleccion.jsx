// client/src/games/Coleccion/Coleccion.jsx
// Menú inicial común (online / un dispositivo) y paso a cada modo.
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MenuInicioJuego } from '../../components/MenuJuego.jsx';
import ColeccionLocal from './ColeccionLocal.jsx';
import ColeccionOnline, { CLAVE_SESION_COLECCION } from './ColeccionOnline.jsx';
import { Ayuda } from './Vistas.jsx';
import './Coleccion.css';
import { metaDe } from '../meta.js';

const { titulo: TITULO, descripcion: DESCRIPCION } = metaDe('coleccion');

const haySesion = () => {
  try {
    return Boolean(sessionStorage.getItem(CLAVE_SESION_COLECCION));
  } catch {
    return false;
  }
};

export default function Coleccion({ onExit }) {
  const [modo, setModo] = useState(() => (haySesion() ? 'online' : 'menu'));
  const [ayuda, setAyuda] = useState(false);
  const navigate = useNavigate();
  const irAPortada = () => (typeof onExit === 'function' ? onExit() : navigate('/'));

  return (
    <>
      {modo === 'menu' && (
        <MenuInicioJuego juegoId="coleccion" onOnline={() => setModo('online')} onLocal={() => setModo('local')} onAyuda={() => setAyuda(true)} />
      )}
      {modo === 'local' && <ColeccionLocal onVolver={() => setModo('menu')} onExit={irAPortada} onAbrirAyuda={() => setAyuda(true)} />}
      {modo === 'online' && <ColeccionOnline onVolver={() => setModo('menu')} onSalir={irAPortada} onAbrirAyuda={() => setAyuda(true)} />}
      {ayuda && <Ayuda titulo={TITULO} descripcion={DESCRIPCION} onCerrar={() => setAyuda(false)} />}
    </>
  );
}
