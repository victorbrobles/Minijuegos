// client/src/games/Impostor/Impostor.jsx
import React, { useState } from 'react';
import ImpostorLocal from './ImpostorLocal.jsx';
import ImpostorOnline from './ImpostorOnline.jsx';

export default function Impostor({ onExit }) {
  // 'online' muestra la entrada de salas (Crear partida / Unirse a partida / Jugar en un dispositivo)
  // 'local' lanza el modo de un solo dispositivo pasando el móvil
  const [modo, setModo] = useState('online');

  if (modo === 'local') {
    return <ImpostorLocal onVolver={() => setModo('online')} onExit={onExit} />;
  }

  return <ImpostorOnline onLocal={() => setModo('local')} onSalir={onExit} />;
}