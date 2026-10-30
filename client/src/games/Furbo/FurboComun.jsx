// client/src/games/Furbo/FurboComun.jsx
// Piezas compartidas por el modo local y el online: ayuda y configuración del partido.
import React, { useState } from 'react';
import { FASES_INFO, DURACIONES_INFO, ORDEN_FASES } from './FurboInfo.js';
import './Furbo.css';
import '../Adivina/Adivina.css';

/** Botón «?» + modal con las reglas de todas las fases (mismo estilo que Buscaminas) */
export function AyudaFurbo({ online = false }) {
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      <button
        type="button"
        className={online ? 'btn-ayuda-flotante' : 'aprox-btn-ayuda'}
        onClick={() => setAbierto(true)}
        title="Reglas del juego"
      >
        <span className={online ? 'btn-ayuda-flotante-signo' : 'aprox-btn-ayuda-signo'}>?</span>
      </button>

      {abierto && (
        <div className="rg-modal-fondo" onClick={() => setAbierto(false)}>
          <div className="rg-modal aprox-modal-ayuda" onClick={(e) => e.stopPropagation()}>
            <div className="aprox-modal-header">
              {online && <span className="aprox-modal-signo-title">?</span>}
              <h3>¿Cómo se juega a Furbo?</h3>
            </div>

            <div className="aprox-modal-cuerpo">
              <p>
                <strong>Furbo</strong> es un partido de preguntas y juegos de fútbol dividido en 5 fases.
                {online
                  ? ' Cada jugador usa su propio dispositivo y el anfitrión controla el ritmo de la partida.'
                  : ' Se juega con un solo dispositivo pasando el turno: cuando toque responder en secreto, la pantalla avisará de a quién pasárselo.'}
              </p>

              {ORDEN_FASES.map((id, index) => {
                const f = FASES_INFO[id];
                return (
                  <React.Fragment key={id}>
                    <p><strong>{index + 1}. {f.emoji} {f.nombre} ({f.lema}):</strong></p>
                    <ul>
                      {f.reglas.map((r, i) => (
                        // eslint-disable-next-line react/no-danger
                        <li key={i} dangerouslySetInnerHTML={{ __html: r }} />
                      ))}
                    </ul>
                  </React.Fragment>
                );
              })}

              <p><strong>Resumen de puntuación por fase:</strong></p>
              <div className="aprox-tabla-puntos">
                <div className="aprox-puntos-fila acierto">
                  <span>🧤 Vestuario (coincidir respuesta)</span>
                  <strong>+2 puntos</strong>
                </div>
                <div className="aprox-puntos-fila intermedia" style={{ background: '#fef3c7', color: '#92400e' }}>
                  <span>🎯 Rebote (clavar dato / acertar rebote)</span>
                  <strong>+3 / +1 pt</strong>
                </div>
                <div className="aprox-puntos-fila acierto">
                  <span>📋 Quiniela 1X2 (acertar opción)</span>
                  <strong>+2 puntos</strong>
                </div>
                <div className="aprox-puntos-fila intermedia" style={{ background: '#e0e7ff', color: '#3730a3' }}>
                  <span>🗣️ Prórroga (palabra acertada / prohibida)</span>
                  <strong>+1 / −1 pt</strong>
                </div>
                <div className="aprox-puntos-fila acierto" style={{ background: '#ede9fe', color: '#5b21b6' }}>
                  <span>⚽ Penaltis (al centro / a la escuadra)</span>
                  <strong>+1 / +3 pts</strong>
                </div>
              </div>
            </div>

            <div className="rg-modal-acciones">
              <button className="big full" onClick={() => setAbierto(false)}>
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Selección de fases y duración del partido.
 * onChange === null  ->  solo lectura (jugadores que no son anfitrión)
 */
export function ConfigPartida({ config, onChange }) {
  const editable = typeof onChange === 'function';

  const alternarFase = (id) => {
    if (!editable) return;
    const activa = config.fases.includes(id);
    if (activa && config.fases.length === 1) return; // al menos una fase
    const fases = ORDEN_FASES.filter((f) => (f === id ? !activa : config.fases.includes(f)));
    onChange({ ...config, fases });
  };

  return (
    <>
      <span className="field-label">Fases del partido</span>
      <div className="furbo-fases-config">
        {ORDEN_FASES.map((id) => {
          const f = FASES_INFO[id];
          const activa = config.fases.includes(id);
          return (
            <label
              key={id}
              className={`furbo-fase-check ${activa ? 'activa' : ''} ${editable ? '' : 'solo-lectura'}`}
            >
              <input
                type="checkbox"
                checked={activa}
                disabled={!editable}
                onChange={() => alternarFase(id)}
              />
              <div className="furbo-fase-texto">
                <strong>{f.emoji} {f.nombre}</strong>
                <small>{f.resumen}</small>
              </div>
            </label>
          );
        })}
      </div>

      <span className="field-label">Duración</span>
      <div className="furbo-duracion">
        {Object.entries(DURACIONES_INFO).map(([id, d]) => (
          <button
            key={id}
            type="button"
            className={`secondary ${config.duracion === id ? 'activa' : ''}`}
            disabled={!editable}
            onClick={() => editable && onChange({ ...config, duracion: id })}
            title={d.detalle}
          >
            {d.nombre}
          </button>
        ))}
      </div>
    </>
  );
}