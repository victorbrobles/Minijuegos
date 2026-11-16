// client/src/games/Logos/LogosComun.jsx
// Elección de las fases y de la duración (común al modo local y al online).
import React from 'react';
import { FASES_INFO, DURACIONES_INFO, fasesDe } from './LogosInfo.js';
import './Logos.css';

/** onChange === null  ->  solo lectura (jugadores que no son anfitrión) */
export function ConfigPartida({ config, onChange, numJugadores = null, local = false }) {
  const editable = typeof onChange === 'function';
  const disponibles = fasesDe(local);
  const activas = config.fases.filter((f) => disponibles.includes(f));

  const alternarFase = (id) => {
    if (!editable) return;
    const activa = activas.includes(id);
    if (activa && activas.length === 1) return; // al menos una fase
    onChange({ ...config, fases: disponibles.filter((f) => (f === id ? !activa : activas.includes(f))) });
  };
  const todas = () => editable && onChange({ ...config, fases: [...disponibles] });

  const porJugador = { corto: 2, normal: 3, largo: 5 }[config.duracion] || 3;
  const rondas = numJugadores ? numJugadores * porJugador * activas.length : null;

  return (
    <div className="lgm-config">
      <span className="qq-label-destacado">Fases de la partida ({activas.length}/{disponibles.length})</span>
      <div className="lgm-fases">
        {disponibles.map((id) => {
          const f = FASES_INFO[id];
          const activa = activas.includes(id);
          return (
            <button key={id} type="button" className={`lgm-fase ${activa ? 'activa' : ''}`} disabled={!editable} aria-pressed={activa} onClick={() => alternarFase(id)}>
              <span className="lgm-fase-emoji">{f.emoji}</span>
              <span className="lgm-fase-texto">
                <strong>{f.nombre}</strong>
                <small>{f.resumen}</small>
              </span>
              <span className="lgm-fase-check">{activa ? '✓' : ''}</span>
            </button>
          );
        })}
      </div>
      {editable && activas.length < disponibles.length && (
        <button type="button" className="lgm-enlace oscuro" onClick={todas}>Marcar todas</button>
      )}
      {local && <p className="hint small" style={{ margin: '0.4rem 0 0' }}>🎨 El pintor solo se juega online, cada uno con su móvil.</p>}

      <span className="qq-label-destacado" style={{ marginTop: '1rem' }}>Rondas por jugador en cada fase</span>
      <div className="lgm-pildoras">
        {Object.entries(DURACIONES_INFO).map(([id, d]) => (
          <button key={id} type="button" className={`lgm-pildora ${config.duracion === id ? 'activo' : ''}`} disabled={!editable} onClick={() => editable && onChange({ ...config, duracion: id })}>
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
