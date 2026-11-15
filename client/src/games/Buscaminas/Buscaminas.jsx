// client/src/games/Buscaminas/Buscaminas.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BuscaminasLocal from './BuscaminasLocal.jsx';
import BuscaminasOnline from './BuscaminasOnline.jsx';
import './Buscaminas.css';
import { metaDe } from '../meta.js';
import { useAbrirAyuda } from '../../lib/ayuda.js';

// Título y descripción: siempre los de meta.js
const { titulo: TITULO_JUEGO, descripcion: DESCRIPCION_JUEGO } = metaDe('buscaminas');

export default function Buscaminas({ onExit }) {
  const [modo, setModo] = useState('online');
  const abrirAyuda = useAbrirAyuda();
  const navigate = useNavigate();

  // Redirección infalible a la portada
  const irAPortada = () => {
    if (typeof onExit === 'function') {
      onExit();
    } else {
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
        <BuscaminasLocal
          onVolver={() => setModo('online')}
          onExit={irAPortada}
          onAbrirAyuda={abrirAyuda}
        />
      ) : (
        <BuscaminasOnline
          tituloJuego={TITULO_JUEGO}
          descripcionJuego={DESCRIPCION_JUEGO}
          onLocal={() => setModo('local')}
          onSalir={irAPortada}
          onAbrirAyuda={abrirAyuda}
        />
      )}

      {/* MODAL DE AYUDA UNIFICADO CON QUIÉN ES QUIÉN */}
    </>
  );
}