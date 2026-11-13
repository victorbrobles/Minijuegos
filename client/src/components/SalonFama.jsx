// client/src/components/SalonFama.jsx
// Salón de la fama de un juego: un botón bajo la cabecera del menú que abre una ventana con las 3 mejores
// puntuaciones de siempre y los podios de los últimos 30 días (más partidas y, si el juego tiene un ganador claro
// en partidas online, más victorias).
import React, { useState } from 'react';
import Icon from './Icon.jsx';
import { useSalon } from '../lib/registros.js';
import { NombreTag } from './Identidad.jsx';
import { LIMITES } from '../games/limites.js';
import { metaDe } from '../games/meta.js';
import './SalonFama.css';

// Juegos sin un ganador claro (por equipos, roles o sin final): sin podio de victorias
const SIN_GANADOR = new Set(['lobos', 'quien-es-quien', 'traiciones', 'impostor', 'golpe', 'futbolgrid', 'mus', 'laberinto']);
/** ¿Tiene sentido el podio de victorias? Solo en juegos con competición online y un ganador claro. */
export function conVictorias(juegoId) {
  const l = LIMITES[juegoId];
  const online = l && (l.online ? l.online.max > 1 : l.max > 1);
  return Boolean(online) && !SIN_GANADOR.has(juegoId);
}

const MEDALLAS = ['🥇', '🥈', '🥉'];
const numero = (x) => (Number.isInteger(x) ? x : Math.round(x * 10) / 10).toLocaleString('es-ES');
const fecha = (t) => new Date(t).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });

function Podio({ titulo, sub, icono, filas, unidad }) {
  const col = [filas[1], filas[0], filas[2]]; // 2.º, 1.º, 3.º
  return (
    <section className="slf-seccion">
      <h4><span className="slf-ico"><Icon name={icono} size={16} /></span>{titulo}<small>{sub}</small></h4>
      {filas.length ? (
        <div className="slf-podio">
          {col.map((f, k) => {
            const puesto = [1, 0, 2][k];
            return (
              <div key={k} className={`slf-col p${puesto + 1}${f ? '' : ' vacia'}`}>
                {f && (
                  <div className="slf-quien">
                    <span className="slf-medalla">{MEDALLAS[puesto]}</span>
                    <NombreTag texto={f.jugador} className="slf-nombre" />
                    <small>{numero(f.n)} {f.n === 1 ? unidad[0] : unidad[1]}</small>
                  </div>
                )}
                <span className="slf-peana">{puesto + 1}</span>
              </div>
            );
          })}
        </div>
      ) : <p className="slf-vacio">Nadie todavía en los últimos 30 días.</p>}
    </section>
  );
}

function Ventana({ juegoId, salon, onCerrar }) {
  const victorias = conVictorias(juegoId);
  const m = metaDe(juegoId);
  return (
    <div className="rg-modal-fondo slf-fondo" onClick={onCerrar}>
      <div className="rg-modal slf-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Salón de la fama">
        <header className="slf-modal-cab">
          <span className="slf-trofeo">🏆</span>
          <div>
            <p>Salón de la fama</p>
            <h3>{m.titulo}</h3>
          </div>
          <button type="button" className="slf-cerrar" onClick={onCerrar} aria-label="Cerrar"><Icon name="x" size={18} strokeWidth={2.6} /></button>
        </header>
        <div className="slf-modal-cuerpo">
          {!salon ? <p className="slf-vacio">Cargando…</p> : (
            <>
              <section className="slf-seccion">
                <h4><span className="slf-ico"><Icon name="star" size={16} /></span>Mejores puntuaciones<small>de siempre</small></h4>
                {salon.top.length ? (
                  <ol className="slf-top">
                    {salon.top.map((t, i) => (
                      <li key={i} className={`t${i + 1}`}>
                        <span className="slf-medalla">{MEDALLAS[i]}</span>
                        <span className="slf-top-quien"><NombreTag texto={t.jugador} className="slf-nombre" /><small>{fecha(t.fecha)}</small></span>
                        <b>{numero(t.puntos)}</b>
                      </li>
                    ))}
                  </ol>
                ) : <p className="slf-vacio">Aún no hay puntuaciones.</p>}
              </section>
              <Podio titulo="Más partidas jugadas" sub="últimos 30 días" icono="gamepad" filas={salon.partidas} unidad={['partida', 'partidas']} />
              {victorias && <Podio titulo="Más victorias" sub="últimos 30 días" icono="crown" filas={salon.victorias} unidad={['victoria', 'victorias']} />}
            </>
          )}
        </div>
        <button type="button" className="big full qq-btn-principal slf-ok" onClick={onCerrar}>Cerrar</button>
      </div>
    </div>
  );
}

export default function SalonFama({ juegoId }) {
  const [abierto, setAbierto] = useState(false);
  const salon = useSalon(abierto ? juegoId : null);
  return (
    <>
      <button type="button" className="slf-boton" onClick={() => setAbierto(true)}>
        <span>🏆</span> Salón de la fama
      </button>
      {abierto && <Ventana juegoId={juegoId} salon={salon} onCerrar={() => setAbierto(false)} />}
    </>
  );
}
