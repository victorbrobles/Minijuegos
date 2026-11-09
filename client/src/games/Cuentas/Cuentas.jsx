// client/src/games/Cuentas/Cuentas.jsx
// «Lleva la cuenta» es solo online (cada jugador necesita ver sus números en secreto todo el rato).
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CuentasOnline from './CuentasOnline.jsx';
import { Ayuda } from './Vistas.jsx';
import './Cuentas.css';
import { metaDe } from '../meta.js';

const { titulo: TITULO, descripcion: DESCRIPCION } = metaDe('cuentas');

export default function Cuentas({ onExit }) {
  const [ayuda, setAyuda] = useState(false);
  const navigate = useNavigate();
  const irAPortada = () => (typeof onExit === 'function' ? onExit() : navigate('/'));
  return (
    <>
      <CuentasOnline onSalir={irAPortada} onAbrirAyuda={() => setAyuda(true)} />
      {ayuda && <Ayuda titulo={TITULO} descripcion={DESCRIPCION} onCerrar={() => setAyuda(false)} />}
    </>
  );
}
