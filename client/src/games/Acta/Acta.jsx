// client/src/games/Acta/Acta.jsx
// «Acta del Partido»: juego de pulsador con pistas que se destapan solas. Las pantallas y el motor son comunes (../Pulsador).
import React from 'react';
import JuegoPulsador from '../Pulsador/JuegoPulsador.jsx';

export default function Acta({ onExit }) {
  return <JuegoPulsador juegoId="acta" onExit={onExit} />;
}
