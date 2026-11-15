// client/src/games/Rapidfire/Rapidfire.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RapidfireLocal from './RapidfireLocal.jsx';
import RapidfireOnline from './RapidfireOnline.jsx';
import './Rapidfire.css';
import { metaDe } from '../meta.js';
import { useAbrirAyuda } from '../../lib/ayuda.js';

// Título y descripción: siempre los de meta.js
const { titulo: TITULO_JUEGO, descripcion: DESCRIPCION_JUEGO } = metaDe('rapidfire');

export default function Rapidfire({ onExit }) {
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
        <RapidfireLocal
          onVolver={() => setModo('online')}
          onExit={irAPortada}
          onAbrirAyuda={abrirAyuda}
        />
      ) : (
        <RapidfireOnline
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