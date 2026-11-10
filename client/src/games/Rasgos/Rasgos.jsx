// client/src/games/Rasgos/Rasgos.jsx
// «El paparazzi»: juego de pulsador. Las pantallas y el motor son comunes (../Pulsador); aquí solo se elige el juego.
import React from 'react';
import JuegoPulsador from '../Pulsador/JuegoPulsador.jsx';

export default function Rasgos({ onExit }) {
  return <JuegoPulsador juegoId="rasgos" onExit={onExit} />;
}
