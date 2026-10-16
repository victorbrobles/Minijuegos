// client/src/games/Ciegas/Ciegas.jsx
import React, { useState } from 'react';
import CiegasLocal from './CiegasLocal.jsx';
import CiegasOnline from './CiegasOnline.jsx';

export default function Ciegas({ onExit }) {
  // 'online' muestra la creación o unión a salas
  // 'local' lanza la modalidad de un solo dispositivo pasando el turno
  const [modo, setModo] = useState('online');

  if (modo === 'local') {
    return <CiegasLocal onVolver={() => setModo('online')} onExit={onExit} />;
  }

  return <CiegasOnline onLocal={() => setModo('local')} onSalir={onExit} />;
}