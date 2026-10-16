// client/src/games/Adivina/Adivina.jsx
import React, { useState } from 'react';
import AdivinaLocal from './AdivinaLocal.jsx';
import AdivinaOnline from './AdivinaOnline.jsx';

export default function Adivina({ onExit }) {
  // 'online' muestra la pantalla con las 3 opciones (Crear / Unirse / Local)
  // 'local' lanza el modo de un solo dispositivo con el pulsador rojo
  const [modo, setModo] = useState('online');

  if (modo === 'local') {
    return <AdivinaLocal onVolver={() => setModo('online')} onExit={onExit} />;
  }

  return <AdivinaOnline onLocal={() => setModo('local')} onSalir={onExit} />;
}