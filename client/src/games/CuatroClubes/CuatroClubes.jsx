// client/src/games/CuatroClubes/CuatroClubes.jsx
import React, { useState } from 'react';
import CuatroClubesLocal from './CuatroClubesLocal.jsx';
import CuatroClubesOnline from './CuatroClubesOnline.jsx';

export default function CuatroClubes({ onExit }) {
  const [modo, setModo] = useState('online');

  if (modo === 'local') {
    return <CuatroClubesLocal onVolver={() => setModo('online')} onExit={onExit} />;
  }

  return <CuatroClubesOnline onLocal={() => setModo('local')} onSalir={onExit} />;
}
