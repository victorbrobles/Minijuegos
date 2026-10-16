// client/src/games/FrasesCelebres/FrasesCelebres.jsx
import React, { useState } from 'react';
import FrasesCelebresLocal from './FrasesCelebresLocal.jsx';
import FrasesCelebresOnline from './FrasesCelebresOnline.jsx';

export default function FrasesCelebres({ onExit }) {
  // 'online' muestra la entrada de salas (Crear partida / Unirse a partida / Jugar en un dispositivo)
  // 'local' lanza el modo de un solo dispositivo con el pulsador rojo
  const [modo, setModo] = useState('online');

  if (modo === 'local') {
    return <FrasesCelebresLocal onVolver={() => setModo('online')} onExit={onExit} />;
  }

  return <FrasesCelebresOnline onLocal={() => setModo('local')} onSalir={onExit} />;
}