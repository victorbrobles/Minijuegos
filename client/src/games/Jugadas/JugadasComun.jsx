// client/src/games/Jugadas/JugadasComun.jsx
// Piezas comunes de «¡Qué jugadón!»: ayuda y modal de salir.
import React from 'react';
import { RONDAS_POR_JUGADOR, SEGUNDOS_JUGADA } from './constantes.js';
import './Jugadas.css';

export function Ayuda({ onCerrar, titulo, descripcion }) {
  return (
    <div className="rg-modal-fondo" onClick={onCerrar}>
      <div className="rg-modal qq-modal-ayuda" onClick={(e) => e.stopPropagation()}>
        <div className="qq-modal-ayuda-header">
          <span className="qq-ayuda-badge">❓ Cómo jugar</span>
          <h3>{titulo}</h3>
        </div>
        <div className="qq-modal-ayuda-body">
          {descripcion && <p>{descripcion}</p>}
          <ul>
            <li>En una pizarra táctica se recrea en bucle una jugada histórica, con los colores y dorsales reales.</li>
            <li>Por turnos, cada jugador tiene <strong>{SEGUNDOS_JUGADA} segundos</strong> para escribir qué jugada es (por ejemplo, «Iniesta a Holanda» o «Maradona a Inglaterra»).</li>
            <li>Si aciertas, sumas <strong>tantos puntos como segundos queden</strong> en el reloj.</li>
            <li>Si fallas, pasas o se acaba el tiempo, hay <strong>un único rebote</strong> para el siguiente jugador.</li>
            <li>Se juegan 5, 10 o 15 jugadas (lo elige el anfitrión), por turnos; tras cada jugada se puede terminar el partido antes.</li>
          </ul>
        </div>
        <button type="button" className="big full qq-btn-principal" onClick={onCerrar}>¡Entendido!</button>
      </div>
    </div>
  );
}

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
