// client/src/games/Rasgos/Rasgos.jsx
import React, { useState } from 'react';
import RasgosLocal from './RasgosLocal.jsx';
import RasgosOnline from './RasgosOnline.jsx';

export default function Rasgos({ onExit }) {
  // 'online' muestra la entrada de salas (Crear sala / Unirse con código / Jugar en un dispositivo)
  // 'local' lanza el modo de un solo dispositivo con el nuevo pulsador rojo
  const [modo, setModo] = useState('online');

  if (modo === 'local') {
    return <RasgosLocal onVolver={() => setModo('online')} onExit={onExit} />;
  }

  return <RasgosOnline onLocal={() => setModo('local')} onSalir={onExit} />;
}