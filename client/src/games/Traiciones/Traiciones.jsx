// client/src/games/Traiciones/Traiciones.jsx
// Traiciones es un juego en tiempo real y necesita un móvil por jugador, así que solo existe el modo online.
import React from 'react';
import { useNavigate } from 'react-router-dom';
import TraicionesOnline from './TraicionesOnline.jsx';
import './Traiciones.css';
import { useAbrirAyuda } from '../../lib/ayuda.js';


export default function Traiciones({ onExit }) {
  const abrirAyuda = useAbrirAyuda();
  const navigate = useNavigate();
  const irAPortada = () => (typeof onExit === 'function' ? onExit() : navigate('/'));

  return (
    <>
      <TraicionesOnline onSalir={irAPortada} onAbrirAyuda={abrirAyuda} />
    </>
  );
}
