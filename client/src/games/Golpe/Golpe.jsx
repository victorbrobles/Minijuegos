// client/src/games/Golpe/Golpe.jsx
// «El Golpe» es solo online (cada jugador tiene pistas y un objetivo secretos).
import React from 'react';
import { useNavigate } from 'react-router-dom';
import GolpeOnline from './GolpeOnline.jsx';
import './Golpe.css';
import { useAbrirAyuda } from '../../lib/ayuda.js';


export default function Golpe({ onExit }) {
  const abrirAyuda = useAbrirAyuda();
  const navigate = useNavigate();
  const irAPortada = () => (typeof onExit === 'function' ? onExit() : navigate('/'));
  return (
    <>
      <GolpeOnline onSalir={irAPortada} onAbrirAyuda={abrirAyuda} />
    </>
  );
}
