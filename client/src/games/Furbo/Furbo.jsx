// client/src/games/Furbo/Furbo.jsx
// Punto de entrada del juego: alterna entre el modo Online y el modo local (un dispositivo).
import React, { useState } from 'react';
import FurboLocal from './FurboLocal.jsx';
import FurboOnline from './FurboOnline.jsx';

export default function Furbo({ onExit }) {
  const [modo, setModo] = useState('online'); // 'online' | 'local'

  return modo === 'online' ? (
    <FurboOnline onLocal={() => setModo('local')} />
  ) : (
    <FurboLocal onVolver={() => setModo('online')} onExit={onExit} />
  );
}
