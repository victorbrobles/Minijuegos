// client/src/games/Bingoball/Bingoball.jsx
// «Bingoball» es solo online (cada jugador tiene su propio cartón).
import React from 'react';
import { useNavigate } from 'react-router-dom';
import BingoballOnline from './BingoballOnline.jsx';
import './Bingoball.css';
import { useAbrirAyuda } from '../../lib/ayuda.js';


export default function Bingoball({ onExit }) {
  const abrirAyuda = useAbrirAyuda();
  const navigate = useNavigate();
  const irAPortada = () => (typeof onExit === 'function' ? onExit() : navigate('/'));
  return (
    <>
      <BingoballOnline onSalir={irAPortada} onAbrirAyuda={abrirAyuda} />
    </>
  );
}
