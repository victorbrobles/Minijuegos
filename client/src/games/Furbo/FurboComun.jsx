// client/src/games/Furbo/FurboComun.jsx
// Piezas compartidas por el modo local y el online: ayuda y configuración del partido.
import React, { useState } from 'react';
import { FASES_INFO, DURACIONES_INFO, ORDEN_FASES } from './FurboInfo.js';
import './Furbo.css';
import '../Adivina/Adivina.css';

/** Botón flotante «?» + modal con las reglas de todas las fases */
export function AyudaFurbo({ online = false }) {
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      <button
        type="button"
        className="btn-ayuda-flotante"
        onClick={() => setAbierto(true)}
        title="Reglas del juego"
      >
        <span className="btn-ayuda-flotante-signo">?</span>
      </button>

      {abierto && (
        <div className="rg-modal-fondo" onClick={() => setAbierto(false)}>
          <div className="rg-modal" onClick={(e) => e.stopPropagation()}>
            <div className="furbo-ayuda-header">
              <span className="furbo-ayuda-signo">?</span>
              <h3>¿Cómo se juega a Furbo?</h3>
            </div>

            <div className="furbo-ayuda-cuerpo">
              <p>
                <strong>Furbo</strong> es un partido de preguntas y juegos de fútbol dividido en fases.
                {online
                  ? ' Cada jugador usa su propio móvil y el anfitrión controla el ritmo de la partida.'
                  : ' Se juega con un solo dispositivo que se van pasando: cuando toque responder en secreto, la app te avisará de a quién pasárselo.'}
                {' '}Gana quien tenga más puntos al final.
              </p>

              {ORDEN_FASES.map((id) => {
                const f = FASES_INFO[id];
                return (
                  <div key={id}>
                    <p><strong>{f.emoji} {f.nombre} · {f.lema}</strong></p>
                    <ul>
                      {f.reglas.map((r, i) => (
                        // eslint-disable-next-line react/no-danger
                        <li key={i} dangerouslySetInnerHTML={{ __html: r }} />
                      ))}
                    </ul>
                  </div>
                );
              })}

              <p><strong>⏱️ Tiempo</strong></p>
              <ul>
                <li>Cada ronda tiene su cuenta atrás. Si se acaba, se resuelve con lo que haya.</li>
                <li>{online ? 'El anfitrión puede saltar un turno si alguien se queda atascado.' : 'Puedes saltar un turno con el botón «Saltar turno».'}</li>
              </ul>
            </div>

            <div className="rg-modal-acciones">
              <button className="big full" onClick={() => setAbierto(false)}>Entendido</button>
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
              <span>
                <strong>{f.emoji} {f.nombre}</strong>
                <small>{f.resumen}</small>
              </span>
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
