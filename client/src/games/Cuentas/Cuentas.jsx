// client/src/games/Cuentas/Cuentas.jsx
// «Lleva la cuenta» es solo online (cada jugador necesita ver sus números en secreto todo el rato).
import React from 'react';
import { useNavigate } from 'react-router-dom';
import CuentasOnline from './CuentasOnline.jsx';
import './Cuentas.css';
import { useAbrirAyuda } from '../../lib/ayuda.js';


export default function Cuentas({ onExit }) {
  const abrirAyuda = useAbrirAyuda();
  const navigate = useNavigate();
  const irAPortada = () => (typeof onExit === 'function' ? onExit() : navigate('/'));
  return (
    <>
      <CuentasOnline onSalir={irAPortada} onAbrirAyuda={abrirAyuda} />
    </>
  );
}
