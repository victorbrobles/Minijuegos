// client/src/games/Ubicacion/Ubicacion.jsx
import React, { useState } from 'react';
import UbicacionLocal from './UbicacionLocal.jsx';
import UbicacionOnline from './UbicacionOnline.jsx';

export default function Ubicacion({ onExit }) {
  // 'online' muestra creación/unión a salas
  // 'local' lanza la modalidad de un solo dispositivo pasando el turno con señuelos
  const [modo, setModo] = useState('online');

  if (modo === 'local') {
    return <UbicacionLocal onVolver={() => setModo('online')} onExit={onExit} />;
  }

  return <UbicacionOnline onLocal={() => setModo('local')} onSalir={onExit} />;
}