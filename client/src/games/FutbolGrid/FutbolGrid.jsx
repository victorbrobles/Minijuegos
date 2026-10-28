// client/src/games/FutbolGrid/FutbolGrid.jsx
import React, { useState } from 'react';
import FutbolGridLocal from './FutbolGridLocal.jsx';
import FutbolGridOnline from './FutbolGridOnline.jsx';

export default function FutbolGrid({ onExit }) {
  const [modo, setModo] = useState('online');

  if (modo === 'local') {
    return <FutbolGridLocal onVolver={() => setModo('online')} onExit={onExit} />;
  }

  return <FutbolGridOnline onLocal={() => setModo('local')} onSalir={onExit} />;
}
