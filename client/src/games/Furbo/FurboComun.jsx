// client/src/games/Furbo/FurboComun.jsx
// Piezas compartidas por el modo local y el online: ayuda y configuración del partido.
import React from 'react';
import { FASES_INFO, DURACIONES_INFO, ORDEN_FASES } from './FurboInfo.js';
import './Furbo.css';


/**
 * Selección de fases y duración del partido.
 * onChange === null  ->  solo lectura (jugadores que no son anfitrión)
 */
export function ConfigPartida({ config, onChange, numJugadores = null }) {
  const editable = typeof onChange === 'function';

  const alternarFase = (id) => {
    if (!editable) return;
    const activa = config.fases.includes(id);
    if (activa && config.fases.length === 1) return; // al menos una fase
    const fases = ORDEN_FASES.filter((f) => (f === id ? !activa : config.fases.includes(f)));
    onChange({ ...config, fases });
  };

  const porJugador = { corto: 2, normal: 3, largo: 5 }[config.duracion] || 3;
  const rondas = numJugadores ? numJugadores * porJugador * config.fases.length : null;

  return (
    <div className="fbp-config">
      <span className="qq-label-destacado">Fases del partido</span>
      <div className="fbp-fases">
        {ORDEN_FASES.map((id) => {
          const f = FASES_INFO[id];
          const activa = config.fases.includes(id);
          return (
            <button
              key={id}
              type="button"
              className={`fbp-fase ${activa ? 'activa' : ''}`}
              disabled={!editable}
              aria-pressed={activa}
              onClick={() => alternarFase(id)}
            >
              <span className="fbp-fase-emoji">{f.emoji}</span>
              <span className="fbp-fase-texto">
                <strong>{f.nombre}</strong>
                <small>{f.resumen}</small>
              </span>
              <span className="fbp-fase-check">{activa ? '✓' : ''}</span>
            </button>
          );
        })}
      </div>

      <span className="qq-label-destacado" style={{ marginTop: '1rem' }}>Rondas por jugador en cada fase</span>
      <div className="fbp-pildoras">
        {Object.entries(DURACIONES_INFO).map(([id, d]) => (
          <button
            key={id}
            type="button"
            className={`fbp-pildora ${config.duracion === id ? 'activo' : ''}`}
            disabled={!editable}
            onClick={() => editable && onChange({ ...config, duracion: id })}
          >
            {d.nombre}
          </button>
        ))}
      </div>
      <p className="hint small" style={{ margin: '0.5rem 0 0' }}>
        {DURACIONES_INFO[config.duracion]?.detalle}
        {rondas ? ` · unas ${rondas} rondas en total con ${numJugadores} jugadores.` : '.'}
      </p>
    </div>
  );
}
