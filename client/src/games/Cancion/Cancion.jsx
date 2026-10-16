// client/src/games/Cancion/Cancion.jsx
import React, { useState } from 'react';
import CancionLocal from './CancionLocal.jsx';
import CancionOnline from './CancionOnline.jsx';

export default function Cancion({ onExit }) {
  // 'online' muestra la creación o unión a salas
  // 'local' lanza la modalidad de un solo dispositivo pasando el turno
  const [modo, setModo] = useState('online');

  if (modo === 'local') {
    return <CancionLocal onVolver={() => setModo('online')} onExit={onExit} />;
  }

  return <CancionOnline onLocal={() => setModo('local')} onSalir={onExit} />;
}