// client/src/games/Golpe/Golpe.jsx
// «El Golpe» es solo online (cada jugador tiene pistas y un objetivo secretos).
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GolpeOnline from './GolpeOnline.jsx';
import { Ayuda } from './Vistas.jsx';
import './Golpe.css';
import { metaDe } from '../meta.js';

const { titulo: TITULO, descripcion: DESCRIPCION } = metaDe('golpe');

export default function Golpe({ onExit }) {
  const [ayuda, setAyuda] = useState(false);
  const navigate = useNavigate();
  const irAPortada = () => (typeof onExit === 'function' ? onExit() : navigate('/'));
  return (
    <>
      <GolpeOnline onSalir={irAPortada} onAbrirAyuda={() => setAyuda(true)} />
      {ayuda && <Ayuda titulo={TITULO} descripcion={DESCRIPCION} onCerrar={() => setAyuda(false)} />}
    </>
  );
}
