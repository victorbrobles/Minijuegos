// client/src/games/Rankings/Rankings.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RankingsLocal from './RankingsLocal.jsx';
import RankingsOnline from './RankingsOnline.jsx';
import './Rankings.css';
import { metaDe } from '../meta.js';
import { useAbrirAyuda } from '../../lib/ayuda.js';

// Título y descripción: siempre los de meta.js
const { titulo: TITULO_JUEGO, descripcion: DESCRIPCION_JUEGO } = metaDe('rankings');

export default function Rankings({ onExit }) {
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
        <RankingsLocal
          onVolver={() => setModo('online')}
          onExit={irAPortada}
          onAbrirAyuda={abrirAyuda}
        />
      ) : (
        <RankingsOnline
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