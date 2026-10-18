import React, { useState } from 'react';
import ColeccionLocal from './ColeccionLocal.jsx';
import ColeccionOnline from './ColeccionOnline.jsx';

export default function Coleccion({ mode, onVolver, onLocal }) {
  const [modoInterno, setModoInterno] = useState(mode || 'online');

  if (modoInterno === 'local') {
    return <ColeccionLocal onSalir={() => setModoInterno('online')} />;
  }

  return (
    <ColeccionOnline 
      onLocal={() => setModoInterno('local')} 
      onSalir={onVolver} 
    />
  );
}