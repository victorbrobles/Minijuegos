// client/src/games/Conecta/Conecta.jsx
import React, { useState } from 'react';
import ConectaLocal from './ConectaLocal.jsx';
import ConectaOnline from './ConectaOnline.jsx';

export default function Conecta({ onExit }) {
  // 'online' muestra la entrada de salas (Crear partida / Unirse a partida / Jugar en un dispositivo)
  // 'local' lanza el modo de un solo dispositivo con el pulsador rojo
  const [modo, setModo] = useState('online');

  if (modo === 'local') {
    return <ConectaLocal onVolver={() => setModo('online')} onExit={onExit} />;
  }

  return <ConectaOnline onLocal={() => setModo('local')} onSalir={onExit} />;
}