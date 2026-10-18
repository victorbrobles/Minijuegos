import React, { useState } from 'react';
import UnoADiezLocal from './UnoADiezLocal.jsx';
import UnoADiezOnline from './UnoADiezOnline.jsx';

export default function UnoADiez({ mode, onExit }) {
  const [modoInterno, setModoInterno] = useState(mode || 'online');

  if (modoInterno === 'local') {
    return <UnoADiezLocal onSalir={() => setModoInterno('online')} />;
  }

  return (
    <UnoADiezOnline 
      onLocal={() => setModoInterno('local')} 
      onSalir={onExit} 
    />
  );
}