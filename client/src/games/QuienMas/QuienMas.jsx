// client/src/games/QuienMas/QuienMas.jsx
import React, { useState } from 'react';
import QuienMasLocal from './QuienMasLocal.jsx';
import QuienMasOnline from './QuienMasOnline.jsx';

export default function QuienMas({ onExit }) {
  // 'online' muestra la entrada de salas (Crear partida / Unirse a partida / Jugar en un dispositivo)
  // 'local' lanza el modo de un solo dispositivo pasando el teléfono
  const [modo, setModo] = useState('online');

  if (modo === 'local') {
    return <QuienMasLocal onVolver={() => setModo('online')} onExit={onExit} />;
  }

  return <QuienMasOnline onLocal={() => setModo('local')} onSalir={onExit} />;
}