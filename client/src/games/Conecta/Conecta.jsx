// client/src/games/Conecta/Conecta.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConectaLocal from './ConectaLocal.jsx';
import ConectaOnline from './ConectaOnline.jsx';
import './Conecta.css';
import { metaDe } from '../meta.js';
import { useAbrirAyuda } from '../../lib/ayuda.js';

// Título y descripción: siempre los de meta.js
const { titulo: TITULO_JUEGO, descripcion: DESCRIPCION_JUEGO } = metaDe('conecta');

export default function Conecta({ onExit }) {
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
        <ConectaLocal
          onVolver={() => setModo('online')}
          onExit={irAPortada}
          onAbrirAyuda={abrirAyuda}
        />
      ) : (
        <ConectaOnline
          tituloJuego={TITULO_JUEGO}
          descripcionJuego={DESCRIPCION_JUEGO}
          onLocal={() => setModo('local')}
          onSalir={irAPortada}
          onAbrirAyuda={abrirAyuda}
        />
      )}

      {/* MODAL DE AYUDA (disponible en menús previos al juego) */}
    </>
  );
}