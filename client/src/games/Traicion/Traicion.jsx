import React, { useState } from 'react';
import TraicionLocal from './TraicionLocal.jsx';
import TraicionOnline from './TraicionOnline.jsx';

export default function Traicion({ mode, onVolver, onLocal }) {
  // Manejo de enrutamiento idéntico al de Lobos
  const [modoInterno, setModoInterno] = useState(mode || 'online');

  if (modoInterno === 'local') {
    // Le pasamos a TraicionLocal una función para volver al online
    return <TraicionLocal onSalir={() => setModoInterno('online')} />;
  }

  // TraicionOnline recibe onLocal para cambiar a modo local, y onSalir para volver a la portada general
  return (
    <TraicionOnline 
      onLocal={() => setModoInterno('local')} 
      onSalir={onVolver} 
    />
  );
}