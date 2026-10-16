// client/src/games/Colores/Colores.jsx
import React, { useState } from 'react';
import ColoresLocal from './ColoresLocal.jsx';
import ColoresOnline from './ColoresOnline.jsx';

export default function Colores({ onExit }) {
  // 'online' muestra la entrada de salas (Crear partida / Unirse a partida / Jugar en un dispositivo)
  // 'local' lanza el modo de un solo dispositivo pasando el teléfono
  const [modo, setModo] = useState('online');

  if (modo === 'local') {
    return <ColoresLocal onVolver={() => setModo('online')} onExit={onExit} />;
  }

  return <ColoresOnline onLocal={() => setModo('local')} onSalir={onExit} />;
}