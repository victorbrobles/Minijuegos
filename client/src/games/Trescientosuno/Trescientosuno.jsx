import React, { useState } from 'react';
import TrescientosunoLocal from './TrescientosunoLocal.jsx';
import TrescientosunoOnline from './TrescientosunoOnline.jsx';

export default function Trescientosuno({ onExit }) {
  const [modo, setModo] = useState('online');

  if (modo === 'local') {
    return <TrescientosunoLocal onVolver={() => setModo('online')} onExit={onExit} />;
  }

  return <TrescientosunoOnline onLocal={() => setModo('local')} onSalir={onExit} />;
}