// client/src/games/Lobos/Lobos.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LobosLocal from './LobosLocal.jsx';
import LobosOnline, { haySesionLobos } from './LobosOnline.jsx';
import { MenuInicioJuego } from '../../components/MenuJuego.jsx';
import './Lobos.css';
import { metaDe } from '../meta.js';

// Título y descripción: siempre los de meta.js
const { titulo: TITULO_JUEGO, descripcion: DESCRIPCION_JUEGO } = metaDe('lobos');

export default function Lobos({ onExit }) {
  // 'menu' | 'local' | 'online' (si hay una sala guardada se vuelve directamente a ella)
  const [modo, setModo] = useState(() => (haySesionLobos() ? 'online' : 'menu'));
  const [mostrarAyuda, setMostrarAyuda] = useState(false);
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
          onAyuda={() => setMostrarAyuda(true)}
        />
      )}
      {modo === 'local' && (
        <LobosLocal
          onVolver={() => setModo('menu')}
          onExit={irAPortada}
          onAbrirAyuda={() => setMostrarAyuda(true)}
        />
      )}
      {modo === 'online' && (
        <LobosOnline
          onVolver={() => setModo('menu')}
          onSalir={irAPortada}
          onAbrirAyuda={() => setMostrarAyuda(true)}
        />
      )}

      {/* MODAL DE AYUDA (disponible en todos los menús previos al juego) */}
      {mostrarAyuda && (
        <div className="rg-modal-fondo" onClick={() => setMostrarAyuda(false)}>
          <div
            className="rg-modal qq-modal-ayuda"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="qq-modal-ayuda-header">
              <span className="qq-ayuda-badge">❓ Cómo jugar</span>
              <h3>{TITULO_JUEGO}</h3>
            </div>

            <div className="qq-modal-ayuda-body">
              <p>{DESCRIPCION_JUEGO}</p>
              <ul>
                <li>
                  <strong>1. Reparto de roles:</strong> Cada jugador descubre su identidad en secreto. Existen tres bandos principales: <strong>Lobos</strong>, <strong>Pueblo</strong> y <strong>Solitarios</strong>.
                </li>
                <li>
                  <strong>2. Fase de Noche:</strong> Todos los jugadores vivos actúan en secreto (en su propio móvil o pasándose el dispositivo para no delatar quién tiene poder).
                </li>
                <li>
                  <strong>3. Fase de Día:</strong> Se revelan las víctimas de la noche, el pueblo debate quién miente y se vota en secreto a quién linchar.
                </li>
                <li>
                  <strong>4. Victoria:</strong> El <strong>Pueblo</strong> gana si elimina a todos los lobos (y al Pirómano). Los <strong>Lobos</strong> ganan en cuanto igualan en número al resto de supervivientes.
                </li>
              </ul>
            </div>

            <button
              type="button"
              className="big full qq-btn-principal"
              onClick={() => setMostrarAyuda(false)}
            >
              ¡Entendido!
            </button>
          </div>
        </div>
      )}
    </>
  );
}