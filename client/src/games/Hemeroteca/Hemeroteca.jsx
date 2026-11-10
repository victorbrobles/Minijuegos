// client/src/games/Hemeroteca/Hemeroteca.jsx
// «La Hemeroteca»: juego de pulsador con pistas que se destapan solas. Las pantallas y el motor son comunes (../Pulsador).
import React from 'react';
import JuegoPulsador from '../Pulsador/JuegoPulsador.jsx';

export default function Hemeroteca({ onExit }) {
  return <JuegoPulsador juegoId="hemeroteca" onExit={onExit} />;
}
