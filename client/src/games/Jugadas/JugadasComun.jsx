// client/src/games/Jugadas/JugadasComun.jsx
// Piezas comunes de «¡Qué jugadón!»: ayuda y modal de salir.
import React from 'react';
import { RONDAS_POR_JUGADOR } from './constantes.js';
import './Jugadas.css';


export function ModalSalir({ titulo, texto, onSeguir, onSalir }) {
  return (
    <div className="rg-modal-fondo" onClick={onSeguir}>
      <div className="rg-modal jgp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="jgp-modal-icono">🚪</div>
        <h3>{titulo}</h3>
        <p className="hint">{texto}</p>
        <div className="jgp-dos">
          <button type="button" className="jgp-boton secundario" onClick={onSeguir}>Seguir</button>
          <button type="button" className="jgp-boton peligro" onClick={onSalir}>Salir</button>
        </div>
      </div>
    </div>
  );
}
