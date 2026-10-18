import React, { useState } from 'react';
import TelepatiaLocal from './TelepatiaLocal.jsx';
import TelepatiaOnline from './TelepatiaOnline.jsx';

export default function Telepatia({ mode, onExit }) {
  const [modoInterno, setModoInterno] = useState(mode || 'online');

  if (modoInterno === 'local') {
    return <TelepatiaLocal onSalir={() => setModoInterno('online')} />;
  }

  return (
    <TelepatiaOnline 
      onLocal={() => setModoInterno('local')} 
      onSalir={onExit} 
    />
  );
}