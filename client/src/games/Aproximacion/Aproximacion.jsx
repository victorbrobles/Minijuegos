// client/src/games/Aproximacion/Aproximacion.jsx
import React, { useState } from 'react';
import AproximacionLocal from './AproximacionLocal.jsx';
import AproximacionOnline from './AproximacionOnline.jsx';

export default function Aproximacion({ onExit }) {
  // 'online' muestra la creación o unión a salas
  // 'local' lanza la modalidad de un solo dispositivo pasando el turno
  const [modo, setModo] = useState('online');

  if (modo === 'local') {
    return <AproximacionLocal onVolver={() => setModo('online')} onExit={onExit} />;
  }

  return <AproximacionOnline onLocal={() => setModo('local')} onSalir={onExit} />;
}