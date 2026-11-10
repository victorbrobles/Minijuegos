// client/src/games/FrasesCelebres/FrasesCelebres.jsx
// «Frases Célebres»: juego de pulsador. Las pantallas y el motor son comunes (../Pulsador); aquí solo se elige el juego.
import React from 'react';
import JuegoPulsador from '../Pulsador/JuegoPulsador.jsx';

export default function FrasesCelebres({ onExit }) {
  return <JuegoPulsador juegoId="frasescelebres" onExit={onExit} />;
}
