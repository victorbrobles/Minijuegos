// client/src/games/Pistas/Pistas.jsx
import React, { useState } from 'react';
import PistasLocal from './PistasLocal.jsx';
import PistasOnline from './PistasOnline.jsx';

export default function Pistas({ onExit }) {
  // 'online' muestra la entrada de salas (Crear partida / Unirse a partida / Jugar en un dispositivo)
  // 'local' lanza el modo de un solo dispositivo con el pulsador rojo
  const [modo, setModo] = useState('online');

  if (modo === 'local') {
    return <PistasLocal onVolver={() => setModo('online')} onExit={onExit} />;
  }

  return <PistasOnline onLocal={() => setModo('local')} onSalir={onExit} />;
}