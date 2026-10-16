// client/src/games/Trayectoria/Trayectoria.jsx
import React, { useState } from 'react';
import TrayectoriaLocal from './TrayectoriaLocal.jsx';
import TrayectoriaOnline from './TrayectoriaOnline.jsx';

export default function Trayectoria({ onExit }) {
  // 'online' muestra la entrada idéntica a Lobos / Quién es quién (Crear / Unirse / Local)
  // 'local' lanza el modo de un solo dispositivo con el pulsador rojo
  const [modo, setModo] = useState('online');

  if (modo === 'local') {
    return <TrayectoriaLocal onVolver={() => setModo('online')} onExit={onExit} />;
  }

  return <TrayectoriaOnline onLocal={() => setModo('local')} onSalir={onExit} />;
}