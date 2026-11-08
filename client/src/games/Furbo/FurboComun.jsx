// client/src/games/Furbo/FurboComun.jsx
// Piezas compartidas por el modo local y el online: ayuda y configuración del partido.
import React from 'react';
import { FASES_INFO, DURACIONES_INFO, ORDEN_FASES, PUNTOS_INFO } from './FurboInfo.js';
import './Furbo.css';

/** Modal «Cómo jugar» (mismo formato que el resto de juegos). */
export function AyudaFurbo({ titulo, descripcion, onCerrar }) {
  return (
    <div className="rg-modal-fondo" onClick={onCerrar}>
      <div className="rg-modal qq-modal-ayuda" onClick={(e) => e.stopPropagation()}>
        <div className="qq-modal-ayuda-header">
          <span className="qq-ayuda-badge">❓ Cómo jugar</span>
          <h3>{titulo}</h3>
        </div>
        <div className="qq-modal-ayuda-body">
          <p>{descripcion}</p>
          <p>Online, cada jugador usa su móvil y el anfitrión marca el ritmo. En un solo dispositivo, la pantalla avisa de a quién pasar el móvil cuando toca responder en secreto (y no hay cuenta atrás salvo en la Prórroga).</p>
          {ORDEN_FASES.map((id, i) => {
            const f = FASES_INFO[id];
            return (
              <React.Fragment key={id}>
                <p className="fbp-ayuda-sub">{i + 1}. {f.emoji} {f.nombre} · {f.lema}</p>
                <ul>
                  {f.reglas.map((r, k) => (
                    // eslint-disable-next-line react/no-danger
                    <li key={k} dangerouslySetInnerHTML={{ __html: r }} />
                  ))}
                </ul>
              </React.Fragment>
            );
          })}
          <p className="fbp-ayuda-sub">🏆 Puntuación</p>
          <div className="fbp-tabla-puntos">
            {PUNTOS_INFO.map(([txt, pts]) => (
              <div key={txt}><span>{txt}</span><strong>{pts}</strong></div>
            ))}
          </div>
        </div>
        <button type="button" className="big full qq-btn-principal" onClick={onCerrar}>¡Entendido!</button>
      </div>
    </div>
  );
}

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

  const porJugador = { corto: 1, normal: 2, largo: 3 }[config.duracion] || 2;
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

      <span className="qq-label-destacado" style={{ marginTop: '1rem' }}>Duración</span>
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
