// client/src/games/Bingoball/Bingoball.jsx
import React from 'react';
import BingoballOnline from './BingoballOnline.jsx';

export default function Bingoball({ onExit }) {
  // Al no contar con modo local, redirige directamente al juego online
  return <BingoballOnline onSalir={onExit} />;
}