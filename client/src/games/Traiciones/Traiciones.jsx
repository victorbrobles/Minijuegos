// client/src/games/Traiciones/Traiciones.jsx
// Traiciones es un juego en tiempo real y necesita un móvil por jugador, así que solo existe el modo online.
import React from 'react';
import TraicionesOnline from './TraicionesOnline.jsx';

export default function Traiciones() {
  return <TraicionesOnline />;
}
