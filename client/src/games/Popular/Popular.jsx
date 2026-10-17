// client/src/games/Popular/Popular.jsx
import React, { useState } from 'react';
import PopularLocal from './PopularLocal.jsx';
import PopularOnline from './PopularOnline.jsx';

export default function Popular({ onExit }) {
  // 'online' muestra creación/unión a salas
  // 'local' lanza la modalidad de un solo dispositivo pasando el turno
  const [modo, setModo] = useState('online');

  if (modo === 'local') {
    return <PopularLocal onVolver={() => setModo('online')} onExit={onExit} />;
  }

  return <PopularOnline onLocal={() => setModo('local')} onSalir={onExit} />;
}