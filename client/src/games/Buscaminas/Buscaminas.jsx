// client/src/games/Buscaminas/Buscaminas.jsx
import React, { useState } from 'react';
import BuscaminasLocal from './BuscaminasLocal.jsx';
import BuscaminasOnline from './BuscaminasOnline.jsx';

export default function Buscaminas({ onExit }) {
  // 'online' muestra creación/unión a salas
  // 'local' lanza la modalidad de un solo dispositivo pasando el turno
  const [modo, setModo] = useState('online');

  if (modo === 'local') {
    return <BuscaminasLocal onVolver={() => setModo('online')} onExit={onExit} />;
  }

  return <BuscaminasOnline onLocal={() => setModo('local')} onSalir={onExit} />;
}