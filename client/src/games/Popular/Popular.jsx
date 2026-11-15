// client/src/games/Popular/Popular.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PopularLocal from './PopularLocal.jsx';
import PopularOnline from './PopularOnline.jsx';
import './Popular.css';
import { metaDe } from '../meta.js';
import { useAbrirAyuda } from '../../lib/ayuda.js';

// Título y descripción: siempre los de meta.js
const { titulo: TITULO_JUEGO, descripcion: DESCRIPCION_JUEGO } = metaDe('popular');

export default function Popular({ onExit }) {
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
        <PopularLocal
          onVolver={() => setModo('online')}
          onExit={irAPortada}
          onAbrirAyuda={abrirAyuda}
        />
      ) : (
        <PopularOnline
          tituloJuego={TITULO_JUEGO}
          descripcionJuego={DESCRIPCION_JUEGO}
          onLocal={() => setModo('local')}
          onSalir={irAPortada}
          onAbrirAyuda={abrirAyuda}
        />
      )}

      {/* MODAL DE AYUDA UNIFICADO */}
    </>
  );
}