// client/src/games/QuienEsQuien/QuienEsQuien.jsx
import React, { useState } from 'react';
import QuienEsQuienLocal from './QuienEsQuienLocal.jsx';
import QuienEsQuienOnline from './QuienEsQuienOnline.jsx';

export default function QuienEsQuien({ onExit }) {
  // 'online' muestra directamente la pantalla de entrada con los 3 botones al estilo Lobos
  // 'local' activa el modo de un solo dispositivo pasándose el móvil
  const [modo, setModo] = useState('online');

  if (modo === 'local') {
    return <QuienEsQuienLocal onVolver={() => setModo('online')} onExit={onExit} />;
  }

  return <QuienEsQuienOnline onLocal={() => setModo('local')} onSalir={onExit} />;
}