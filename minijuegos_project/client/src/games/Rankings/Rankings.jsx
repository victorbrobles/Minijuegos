// client/src/games/Rankings/Rankings.jsx
import React, { useState } from 'react';
import RankingsLocal from './RankingsLocal.jsx';
import RankingsOnline from './RankingsOnline.jsx';

export default function Rankings({ onExit }) {
  // 'online' muestra la creación o unión a salas
  // 'local' lanza la modalidad de un solo dispositivo pasando el turno
  const [modo, setModo] = useState('online');

  if (modo === 'local') {
    return <RankingsLocal onVolver={() => setModo('online')} onExit={onExit} />;
  }

  return <RankingsOnline onLocal={() => setModo('local')} onSalir={onExit} />;
}