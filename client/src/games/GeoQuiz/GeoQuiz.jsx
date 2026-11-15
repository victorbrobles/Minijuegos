// client/src/games/GeoQuiz/GeoQuiz.jsx
// Punto de entrada: modo online (por defecto, con el menú común) o un solo dispositivo.
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GeoQuizLocal from './GeoQuizLocal.jsx';
import GeoQuizOnline from './GeoQuizOnline.jsx';
import './GeoQuiz.css';
import { useAbrirAyuda } from '../../lib/ayuda.js';

export default function GeoQuiz({ onExit }) {
  const [modo, setModo] = useState('online');
  const abrirAyuda = useAbrirAyuda();
  const navigate = useNavigate();

  const irAPortada = () => {
    if (typeof onExit === 'function') onExit();
    else {
      try {
        navigate('/');
      } catch {
        window.location.href = '/';
      }
    }
  };

  return (
    <>
      {modo === 'local' ? (
        <GeoQuizLocal onVolver={() => setModo('online')} onExit={irAPortada} onAbrirAyuda={abrirAyuda} />
      ) : (
        <GeoQuizOnline onLocal={() => setModo('local')} onSalir={irAPortada} onAbrirAyuda={abrirAyuda} />
      )}

    </>
  );
}
