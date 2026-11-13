// client/src/components/SalonFama.jsx
// Salón de la fama de un juego (debajo de la cabecera del menú): las 3 mejores puntuaciones de siempre y dos podios
// de los últimos 30 días, el de quién más ha jugado y el de quién más ha ganado.
import React, { useState } from 'react';
import Icon from './Icon.jsx';
import { useSalon } from '../lib/registros.js';
import { NombreTag } from './Identidad.jsx';
import './SalonFama.css';

const MEDALLAS = ['🥇', '🥈', '🥉'];
const numero = (x) => (Number.isInteger(x) ? x : Math.round(x * 10) / 10).toLocaleString('es-ES');

function Podio({ titulo, icono, filas, unidad }) {
  // Orden visual: 2.º, 1.º, 3.º
  const col = [filas[1], filas[0], filas[2]];
  return (
    <div className="slf-bloque">
      <p className="slf-titulo"><Icon name={icono} size={14} /> {titulo}</p>
      {filas.length ? (
        <div className="slf-podio">
          {col.map((f, k) => {
            const puesto = [1, 0, 2][k];
            return (
              <div key={k} className={`slf-col p${puesto + 1}${f ? '' : ' vacia'}`}>
                {f ? (
                  <>
                    <span className="slf-medalla">{MEDALLAS[puesto]}</span>
                    <NombreTag texto={f.jugador} className="slf-nombre" />
                    <small>{numero(f.n)} {f.n === 1 ? unidad[0] : unidad[1]}</small>
                  </>
                ) : <span className="slf-medalla">·</span>}
                <span className="slf-base">{puesto + 1}</span>
              </div>
            );
          })}
        </div>
      ) : <p className="slf-vacio">Todavía nadie en los últimos 30 días.</p>}
    </div>
  );
}

export default function SalonFama({ juegoId }) {
  const salon = useSalon(juegoId);
  const [abierto, setAbierto] = useState(true);
  if (!salon) return null;
  const hayAlgo = salon.top.length || salon.partidas.length;
  if (!hayAlgo) {
    return <p className="slf-estreno"><Icon name="trophy" size={15} /> Aún no hay récords en este juego: ¡sé el primero!</p>;
  }
  return (
    <section className="slf">
      <button type="button" className="slf-cab" onClick={() => setAbierto((x) => !x)} aria-expanded={abierto}>
        <Icon name="trophy" size={16} /> Salón de la fama <span className="slf-flecha">{abierto ? '▲' : '▼'}</span>
      </button>
      {abierto && (
        <>
          {salon.top.length > 0 && (
            <div className="slf-bloque">
              <p className="slf-titulo"><Icon name="star" size={14} /> Mejores puntuaciones de siempre</p>
              <ol className="slf-top">
                {salon.top.map((t, i) => (
                  <li key={i}>
                    <span className="slf-medalla">{MEDALLAS[i]}</span>
                    <NombreTag texto={t.jugador} className="slf-nombre" />
                    <b>{numero(t.puntos)}</b>
                    <small>{new Date(t.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: '2-digit' })}</small>
                  </li>
                ))}
              </ol>
            </div>
          )}
          <div className="slf-dos">
            <Podio titulo="Más partidas · 30 días" icono="gamepad" filas={salon.partidas} unidad={['partida', 'partidas']} />
            <Podio titulo="Más victorias · 30 días" icono="crown" filas={salon.victorias} unidad={['victoria', 'victorias']} />
          </div>
        </>
      )}
    </section>
  );
}
