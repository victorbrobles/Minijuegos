// client/src/games/Jugadores/Jugadores.jsx
import React, { useState } from 'react';
import JugadoresLocal from './JugadoresLocal.jsx';
import JugadoresOnline from './JugadoresOnline.jsx';

export default function Jugadores({ onExit }) {
  const [modo, setModo] = useState('online');

  if (modo === 'local') {
    return <JugadoresLocal onVolver={() => setModo('online')} onExit={onExit} />;
  }

  return <JugadoresOnline onLocal={() => setModo('local')} onSalir={onExit} />;
}