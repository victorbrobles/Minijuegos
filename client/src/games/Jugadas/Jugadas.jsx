// client/src/games/Jugadas/Jugadas.jsx
// Punto de entrada del juego: alterna entre el modo Online y el modo local (un dispositivo).
import React, { useState } from 'react';
import JugadasLocal from './JugadasLocal.jsx';
import JugadasOnline from './JugadasOnline.jsx';

export default function Jugadas({ onExit }) {
  const [modo, setModo] = useState('online'); // 'online' | 'local'

  return modo === 'online' ? (
    <JugadasOnline onLocal={() => setModo('local')} />
  ) : (
    <JugadasLocal onVolver={() => setModo('online')} onExit={onExit} />
  );
}