// client/src/games/MasMenos/MasMenos.jsx
import React, { useState } from 'react';
import MasMenosLocal from './MasMenosLocal.jsx';
import MasMenosOnline from './MasMenosOnline.jsx';

export default function MasMenos({ onExit }) {
  // 'online' muestra creación/unión a salas
  // 'local' lanza la modalidad de un solo dispositivo pasando el turno
  const [modo, setModo] = useState('online');

  if (modo === 'local') {
    return <MasMenosLocal onVolver={() => setModo('online')} onExit={onExit} />;
  }

  return <MasMenosOnline onLocal={() => setModo('local')} onSalir={onExit} />;
}