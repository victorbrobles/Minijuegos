// client/src/games/Lobos/Lobos.jsx
import React, { useState } from 'react';
import LobosLocal from './LobosLocal.jsx';
import LobosOnline from './LobosOnline.jsx';

export default function Lobos({ onExit }) {
  // 'online' muestra la entrada de salas (Crear sala / Unirse con código / Jugar en un dispositivo)
  // 'local' carga el flujo de un solo teléfono pasando el móvil
  const [modo, setModo] = useState('online');

  if (modo === 'local') {
    return <LobosLocal onSalir={() => setModo('online')} />;
  }

  return <LobosOnline onLocal={() => setModo('local')} onSalir={onExit} />;
}