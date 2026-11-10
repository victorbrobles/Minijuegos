// client/src/games/Adivina/Adivina.jsx
// «Luces, Cámara... ¡Música!»: juego de pulsador. Las pantallas y el motor son comunes (../Pulsador); aquí solo se elige el juego.
import React from 'react';
import JuegoPulsador from '../Pulsador/JuegoPulsador.jsx';

export default function Adivina({ onExit }) {
  return <JuegoPulsador juegoId="adivina" onExit={onExit} />;
}
