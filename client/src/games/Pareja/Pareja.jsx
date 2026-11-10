// client/src/games/Pareja/Pareja.jsx
// «La Pareja Perfecta»: encuentra la pareja de cada elemento entre cuatro opciones. Usa el motor de ../Pulsador.
import React from 'react';
import JuegoPulsador from '../Pulsador/JuegoPulsador.jsx';

export default function Pareja({ onExit }) {
  return <JuegoPulsador juegoId="pareja" onExit={onExit} />;
}
