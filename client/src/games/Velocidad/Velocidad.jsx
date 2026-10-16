// client/src/games/Velocidad/Velocidad.jsx
import React, { useState } from 'react';
import VelocidadLocal from './VelocidadLocal.jsx';
import VelocidadOnline from './VelocidadOnline.jsx';

export default function Velocidad({ onExit }) {
  // 'online' muestra la entrada de salas (Crear partida / Unirse a partida / Jugar en un dispositivo)
  // 'local' lanza el modo de un solo dispositivo
  const [modo, setModo] = useState('online');

  if (modo === 'local') {
    return <VelocidadLocal onVolver={() => setModo('online')} onExit={onExit} />;
  }

  return <VelocidadOnline onLocal={() => setModo('local')} onSalir={onExit} />;
}