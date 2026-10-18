import React, { useState } from 'react';
import DescarteLocal from './DescarteLocal.jsx';
import DescarteOnline from './DescarteOnline.jsx';

export default function Descarte({ mode, onExit }) {
  const [modoInterno, setModoInterno] = useState(mode || 'online');

  if (modoInterno === 'local') {
    return <DescarteLocal onSalir={() => setModoInterno('online')} />;
  }

  return (
    <DescarteOnline 
      onLocal={() => setModoInterno('local')} 
      onSalir={onExit} 
    />
  );
}