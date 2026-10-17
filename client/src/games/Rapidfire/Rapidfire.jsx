// client/src/games/Rapidfire/Rapidfire.jsx
import React, { useState } from 'react';
import RapidfireLocal from './RapidfireLocal.jsx';
import RapidfireOnline from './RapidfireOnline.jsx';

export default function Rapidfire({ onExit }) {
  const [modo, setModo] = useState('online');

  if (modo === 'local') {
    return <RapidfireLocal onVolver={() => setModo('online')} onExit={onExit} />;
  }

  return <RapidfireOnline onLocal={() => setModo('local')} onSalir={onExit} />;
}