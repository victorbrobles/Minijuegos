// client/src/games/Lobos/Lobos.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LobosLocal from './LobosLocal.jsx';
import LobosOnline, { haySesionLobos } from './LobosOnline.jsx';
import { MenuInicioJuego } from '../../components/MenuJuego.jsx';
import './Lobos.css';
import { useAbrirAyuda } from '../../lib/ayuda.js';

// Título y descripción: siempre los de meta.js

export default function Lobos({ onExit }) {
  // 'menu' | 'local' | 'online' (si hay una sala guardada se vuelve directamente a ella)
  const [modo, setModo] = useState(() => (haySesionLobos() ? 'online' : 'menu'));
  const abrirAyuda = useAbrirAyuda();
  const navigate = useNavigate();

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
      {modo === 'menu' && (
        <MenuInicioJuego
          juegoId="lobos"
          onOnline={() => setModo('online')}
          onLocal={() => setModo('local')}
          onAyuda={abrirAyuda}
        />
      )}
      {modo === 'local' && (
        <LobosLocal
          onVolver={() => setModo('menu')}
          onExit={irAPortada}
          onAbrirAyuda={abrirAyuda}
        />
      )}
      {modo === 'online' && (
        <LobosOnline
          onVolver={() => setModo('menu')}
          onSalir={irAPortada}
          onAbrirAyuda={abrirAyuda}
        />
      )}

      {/* MODAL DE AYUDA (disponible en todos los menús previos al juego) */}
    </>
  );
}