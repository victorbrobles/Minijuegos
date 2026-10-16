// client/src/games/ConfianzaCiega/ConfianzaCiega.jsx
import React, { useState } from 'react';
import ConfianzaCiegaLocal from './ConfianzaCiegaLocal.jsx';
import ConfianzaCiegaOnline from './ConfianzaCiegaOnline.jsx';

export default function ConfianzaCiega({ onExit }) {
  // 'online' muestra el menú con las 3 opciones (Crear partida / Unirse / Jugar en un dispositivo)
  // 'local' lanza el modo de un solo dispositivo pasando el teléfono
  const [modo, setModo] = useState('online');

  if (modo === 'local') {
    return <ConfianzaCiegaLocal onVolver={() => setModo('online')} onExit={onExit} />;
  }

  return <ConfianzaCiegaOnline onLocal={() => setModo('local')} onSalir={onExit} />;
}