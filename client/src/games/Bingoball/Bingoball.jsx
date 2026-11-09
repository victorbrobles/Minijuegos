// client/src/games/Bingoball/Bingoball.jsx
// «Bingoball» es solo online (cada jugador tiene su propio cartón).
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BingoballOnline from './BingoballOnline.jsx';
import { Ayuda } from './Vistas.jsx';
import './Bingoball.css';
import { metaDe } from '../meta.js';

const { titulo: TITULO, descripcion: DESCRIPCION } = metaDe('bingoball');

export default function Bingoball({ onExit }) {
  const [ayuda, setAyuda] = useState(false);
  const navigate = useNavigate();
  const irAPortada = () => (typeof onExit === 'function' ? onExit() : navigate('/'));
  return (
    <>
      <BingoballOnline onSalir={irAPortada} onAbrirAyuda={() => setAyuda(true)} />
      {ayuda && <Ayuda titulo={TITULO} descripcion={DESCRIPCION} onCerrar={() => setAyuda(false)} />}
    </>
  );
}
