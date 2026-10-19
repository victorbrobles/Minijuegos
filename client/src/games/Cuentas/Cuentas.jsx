// client/src/games/Cuentas/Cuentas.jsx
import React from 'react';
import CuentasOnline from './CuentasOnline.jsx';

export default function Cuentas({ onExit }) {
  return <CuentasOnline onSalir={onExit} />;
}