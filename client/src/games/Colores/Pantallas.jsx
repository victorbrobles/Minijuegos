// client/src/games/Colores/Pantallas.jsx
// Piezas visuales de «La vida en colores» (modo local y online), con el mismo lenguaje que
// Conecta o Test del viajero: cabecera con el degradado del juego, tarjetas blancas y botones en relieve.
import React, { useEffect, useRef } from 'react';
import Icon from '../../components/Icon.jsx';
import { centrarActivo } from '../../lib/centrarActivo.js';

export const PALETA = [
  { id: 'rojo', nombre: 'Rojo', hex: '#ef4444' },
  { id: 'azul', nombre: 'Azul', hex: '#2563eb' },
  { id: 'amarillo', nombre: 'Amarillo', hex: '#facc15', oscuro: true },
  { id: 'verde', nombre: 'Verde', hex: '#16a34a' },
  { id: 'naranja', nombre: 'Naranja', hex: '#f97316' },
  { id: 'morado', nombre: 'Morado', hex: '#9333ea' },
  { id: 'marron', nombre: 'Marrón', hex: '#7c3f12' },
  { id: 'blanco', nombre: 'Blanco', hex: '#ffffff', oscuro: true },
  { id: 'negro', nombre: 'Negro', hex: '#0f172a' },
  { id: 'gris', nombre: 'Gris', hex: '#64748b' },
  { id: 'rosa', nombre: 'Rosa', hex: '#ec4899' }
];
export const colorDe = (id) => PALETA.find((c) => c.id === id) || PALETA[0];

export const OPCIONES_RONDAS = [10, 15, 20];
export const SEGUNDOS_RESPUESTA = 45;

const COLORES_JUGADOR = ['#ef4444', '#2563eb', '#16a34a', '#f59e0b', '#9333ea', '#ec4899', '#0d9488', '#ea580c', '#475569', '#65a30d', '#6366f1', '#0ea5e9', '#e11d48', '#84cc16', '#a855f7'];
export const colorJugador = (id) => COLORES_JUGADOR[(Math.abs(Number(id) || 1) - 1) % COLORES_JUGADOR.length];
export const inicial = (n = '?') => String(n).trim().charAt(0).toUpperCase() || '?';

function BotonSalir({ onClick }) {
  return (
    <button type="button" className="clp-salir" onClick={onClick}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      <span>Portada</span>
    </button>
  );
}

/** Cabecera: ronda y marcador de jugadores (con ✓ para los que ya han respondido). */
export function Hero({ onSalir, ronda, total, jugadores = [], yoId, turnoId, listos = [], children }) {
  const ref = useRef(null);
  useEffect(() => {
    centrarActivo(ref.current);
  }, [turnoId]);
  return (
    <header className="clp-hero">
      <span className="clp-hero-gotas" aria-hidden="true">
        {['#ef4444', '#facc15', '#2563eb', '#16a34a', '#ec4899'].map((c, i) => <i key={i} style={{ background: c }} />)}
      </span>
      <div className="clp-hero-top">
        <BotonSalir onClick={onSalir} />
        {ronda != null && <span className="clp-chip"><Icon name="flagFinish" size={14} /> Ronda {ronda}/{total}</span>}
      </div>
      {jugadores.length > 0 && (
        <ol className="clp-marcador" ref={ref} aria-label="Jugadores">
          {jugadores.map((j) => {
            const listo = listos.includes(j.id);
            return (
              <li key={j.id} className={`clp-jugador${j.id === turnoId ? ' activo' : ''}${listo ? ' listo' : ''}`} style={{ '--c': colorJugador(j.id) }}>
                <span className="clp-avatar">{listo ? '✓' : inicial(j.nombre)}</span>
                <span className="clp-jugador-datos">
                  <span className="clp-jugador-nombre">{j.nombre}{j.id === yoId ? ' (tú)' : ''}</span>
                  <strong>{j.puntos ?? 0} pts</strong>
                </span>
              </li>
            );
          })}
        </ol>
      )}
      {children}
    </header>
  );
}

export function BarraTiempo({ segundos, total = SEGUNDOS_RESPUESTA }) {
  if (segundos == null) return null;
  const pct = Math.max(0, Math.min(100, (segundos / total) * 100));
  const nivel = segundos <= 8 ? 'critico' : segundos <= 18 ? 'aviso' : '';
  return (
    <div className={`clp-tiempo ${nivel}`} role="timer" aria-label={`${Math.ceil(segundos)} segundos`}>
      <div className="clp-tiempo-barra"><span style={{ width: `${pct}%` }} /></div>
      <span className="clp-tiempo-num"><Icon name="clock" size={15} /> {Math.ceil(segundos)}s</span>
    </div>
  );
}

/** Tarjeta con el elemento a adivinar y huecos para los colores elegidos. */
export function TarjetaElemento({ item, numColores, seleccion = [] }) {
  return (
    <div className="clp-tarjeta clp-elemento">
      <p className="clp-etiqueta">¿De qué colores es…?</p>
      <h2 className="clp-item">{item}</h2>
      <div className="clp-huecos" aria-label={`${seleccion.length} de ${numColores} colores elegidos`}>
        {Array.from({ length: numColores }, (_, i) => {
          const c = seleccion[i] ? colorDe(seleccion[i]) : null;
          return (
            <span key={i} className={`clp-hueco${c ? ' lleno' : ''}`} style={c ? { '--col': c.hex } : undefined}>
              {c ? '' : i + 1}
            </span>
          );
        })}
      </div>
      <p className="clp-pista">
        {seleccion.length < numColores
          ? `Elige ${numColores} ${numColores === 1 ? 'color' : 'colores'} · llevas ${seleccion.length}`
          : '¡Listo! Confirma tu respuesta'}
      </p>
    </div>
  );
}

/** Paleta de 11 colores para elegir. */
export function Paleta({ seleccion, max, onToggle, deshabilitada }) {
  return (
    <div className="clp-paleta">
      {PALETA.map((c) => {
        const activo = seleccion.includes(c.id);
        const lleno = !activo && seleccion.length >= max;
        return (
          <button
            key={c.id}
            type="button"
            className={`clp-color${activo ? ' activo' : ''}${lleno ? ' apagado' : ''}${c.oscuro ? ' claro' : ''}`}
            style={{ '--col': c.hex }}
            onClick={() => onToggle(c.id)}
            disabled={deshabilitada}
            aria-pressed={activo}
          >
            <span className="clp-gota" />
            <span className="clp-color-nombre">{c.nombre}</span>
            {activo && <span className="clp-check">✓</span>}
          </button>
        );
      })}
    </div>
  );
}

/** Lista de chips de colores (con acierto/fallo opcional). */
export function Chips({ colores, correctos }) {
  if (!colores?.length) return <span className="clp-sin">Sin respuesta</span>;
  return (
    <span className="clp-chips">
      {colores.map((id) => {
        const c = colorDe(id);
        const ok = correctos ? correctos.includes(id) : null;
        return (
          <span key={id} className={`clp-chip-color${ok === true ? ' ok' : ok === false ? ' mal' : ''}${c.oscuro ? ' claro' : ''}`} style={{ '--col': c.hex }}>
            {c.nombre}{ok === true ? ' ✓' : ok === false ? ' ✗' : ''}
          </span>
        );
      })}
    </span>
  );
}

/** Resultado de la ronda: solución y qué ha acertado cada jugador. */
export function ResultadoRonda({ resultado, yoId }) {
  const filas = [...resultado.desglose].sort((a, b) => b.aciertos - a.aciertos);
  return (
    <>
      <div className="clp-tarjeta clp-solucion">
        <p className="clp-etiqueta">La respuesta correcta</p>
        <h2 className="clp-item">{resultado.item}</h2>
        <div className="clp-muestras">
          {resultado.coloresCorrectos.map((id) => {
            const c = colorDe(id);
            return (
              <span key={id} className={`clp-muestra${c.oscuro ? ' claro' : ''}`} style={{ '--col': c.hex }}>
                <i />{c.nombre}
              </span>
            );
          })}
        </div>
      </div>
      <div className="clp-tarjeta">
        <p className="clp-etiqueta">Lo que ha dicho cada uno</p>
        <ul className="clp-respuestas">
          {filas.map((f) => (
            <li key={f.id} className={f.pleno ? 'pleno' : ''} style={{ '--c': colorJugador(f.id) }}>
              <span className="clp-avatar">{inicial(f.jugador)}</span>
              <span className="clp-respuesta-datos">
                <strong>
                  {f.jugador}{f.id === yoId ? ' (tú)' : ''}
                  {f.pleno && <em className="clp-pleno">¡Pleno!</em>}
                </strong>
                <Chips colores={f.elegidos} correctos={resultado.coloresCorrectos} />
              </span>
              <span className="clp-suma">+{f.aciertos}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

/** Clasificación general (de más a menos puntos). */
export function Clasificacion({ jugadores, sumadas = {}, yoId, titulo = 'Clasificación', subtitulo }) {
  const orden = [...jugadores].sort((a, b) => (b.puntos ?? 0) - (a.puntos ?? 0));
  const max = orden[0]?.puntos ?? 0;
  return (
    <div className="clp-tarjeta">
      {subtitulo && <p className="clp-etiqueta">{subtitulo}</p>}
      <h3 className="clp-titulo">{titulo}</h3>
      <ol className="clp-ranking">
        {orden.map((j, i) => {
          const lider = max > 0 && (j.puntos ?? 0) === max;
          return (
            <li key={j.id} className={lider ? 'lider' : ''} style={{ '--c': colorJugador(j.id) }}>
              <span className="clp-pos">{lider ? <Icon name="crown" size={18} /> : i + 1}</span>
              <span className="clp-avatar">{inicial(j.nombre)}</span>
              <span className="clp-ranking-nombre">{j.nombre}{j.id === yoId ? ' (tú)' : ''}</span>
              {sumadas[j.id] != null && <small className="clp-delta">+{sumadas[j.id]}</small>}
              <strong>{j.puntos ?? 0}</strong>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** Podio final. */
export function Podio({ jugadores, yoId }) {
  const orden = [...jugadores].sort((a, b) => (b.puntos ?? 0) - (a.puntos ?? 0));
  const max = orden[0]?.puntos ?? 0;
  const ganadores = max > 0 ? orden.filter((j) => (j.puntos ?? 0) === max) : [];
  const top = orden.slice(0, 3);
  const colocacion = top.length === 3 ? [top[1], top[0], top[2]] : top.length === 2 ? [top[1], top[0]] : top;
  const alturas = ['primero', 'segundo', 'tercero'];
  return (
    <div className="clp-tarjeta clp-podio-tarjeta">
      <p className="clp-etiqueta">Fin de la partida</p>
      <h2 className="clp-ganador">
        {ganadores.length === 0 ? 'Nadie ha sumado puntos' : ganadores.length > 1 ? `¡Empate entre ${ganadores.map((g) => g.nombre).join(' y ')}!` : `¡Gana ${ganadores[0].nombre}!`}
      </h2>
      <div className="clp-podio">
        {colocacion.map((j) => {
          const puesto = top.indexOf(j);
          return (
            <div key={j.id} className={`clp-podio-col ${alturas[puesto]}`} style={{ '--c': colorJugador(j.id) }}>
              <span className="clp-avatar grande">{inicial(j.nombre)}</span>
              <span className="clp-podio-nombre">{j.nombre}{j.id === yoId ? ' (tú)' : ''}</span>
              <span className="clp-podio-pts">{j.puntos ?? 0} pts</span>
              <span className="clp-podio-base">{puesto + 1}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ModalSalir({ titulo = '¿Salir de la partida?', texto, onSeguir, onSalir }) {
  return (
    <div className="rg-modal-fondo" onClick={onSeguir}>
      <div className="rg-modal clp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="clp-modal-icono">🚪</div>
        <h3>{titulo}</h3>
        <p className="hint">{texto}</p>
        <div className="clp-fila">
          <button type="button" className="clp-boton secundario" onClick={onSeguir}>Seguir</button>
          <button type="button" className="clp-boton peligro" onClick={onSalir}>Salir</button>
        </div>
      </div>
    </div>
  );
}

export function PildorasRondas({ valor, onCambiar }) {
  return (
    <div className="clp-pildoras">
      {OPCIONES_RONDAS.map((n) => (
        <button key={n} type="button" className={`clp-pildora${valor === n ? ' activo' : ''}`} onClick={() => onCambiar(n)}>
          {n} rondas
        </button>
      ))}
    </div>
  );
}
