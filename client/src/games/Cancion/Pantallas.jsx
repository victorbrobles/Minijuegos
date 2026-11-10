// client/src/games/Cancion/Pantallas.jsx
// Piezas visuales de «Afina ese oído» (modo local y online), con el mismo lenguaje que
// los juegos renovados: cabecera con el degradado del juego, tarjetas blancas y botones en relieve.
import React, { useEffect, useRef, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import { DURACION_S, volumenEn } from './audioPlayerCancion.js';
import { centrarActivo } from '../../lib/centrarActivo.js';

export const OPCIONES_RONDAS = [5, 10, 15, 20];
export const SEGUNDOS_RESPUESTA = 20;
export const PUNTOS_MAX = 10;
export const PUNTOS_MIN = 3;
export const PUNTOS_FALLO = 3;
export const puntosEn = (s) => Math.max(PUNTOS_MIN, Math.round(PUNTOS_MAX - ((PUNTOS_MAX - PUNTOS_MIN) * Math.min(s, DURACION_S)) / DURACION_S));

const COLORES_JUGADOR = ['#ef4444', '#2563eb', '#16a34a', '#f59e0b', '#9333ea', '#ec4899', '#0d9488', '#ea580c', '#475569', '#65a30d', '#6366f1', '#0ea5e9', '#e11d48', '#84cc16', '#a855f7', '#14b8a6', '#f43f5e', '#8b5cf6', '#22c55e', '#facc15'];
export const colorJugador = (id) => COLORES_JUGADOR[(Math.abs(Number(id) || 1) - 1) % COLORES_JUGADOR.length];
export const inicial = (n = '?') => String(n).trim().charAt(0).toUpperCase() || '?';

function BotonSalir({ onClick }) {
  return (
    <button type="button" className="afp-salir" onClick={onClick}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      <span>Portada</span>
    </button>
  );
}

/** Cabecera con ronda y marcador. Los que ya han fallado en la ronda salen tachados. */
export function Hero({ onSalir, ronda, total, jugadores = [], yoId, turnoId }) {
  const ref = useRef(null);
  useEffect(() => {
    centrarActivo(ref.current);
  }, [turnoId]);
  return (
    <header className="afp-hero">
      <span className="afp-hero-notas" aria-hidden="true">♪ ♫ ♪</span>
      <div className="afp-hero-top">
        <BotonSalir onClick={onSalir} />
        {ronda != null && <span className="afp-chip"><Icon name="music" size={14} /> Canción {ronda}/{total}</span>}
      </div>
      {jugadores.length > 0 && (
        <ol className="afp-marcador" ref={ref} aria-label="Jugadores">
          {jugadores.map((j) => (
            <li key={j.id} className={`afp-jugador${j.id === turnoId ? ' activo' : ''}${j.bloqueado ? ' bloqueado' : ''}`} style={{ '--c': colorJugador(j.id) }}>
              <span className="afp-avatar">{j.bloqueado ? '✗' : inicial(j.nombre)}</span>
              <span className="afp-jugador-datos">
                <span className="afp-jugador-nombre">{j.nombre}{j.id === yoId ? ' (tú)' : ''}</span>
                <strong>{j.puntos ?? 0} pts</strong>
              </span>
            </li>
          ))}
        </ol>
      )}
    </header>
  );
}

/** Disco que gira con un anillo de progreso y el medidor de volumen. */
export function Disco({ segundo = 0, sonando, estado }) {
  const p = Math.min(1, segundo / DURACION_S);
  const vol = (volumenEn(segundo) - volumenEn(0)) / (volumenEn(DURACION_S) - volumenEn(0));
  const r = 92;
  const circ = 2 * Math.PI * r;
  const barras = 10;
  return (
    <div className="afp-tarjeta afp-disco-tarjeta">
      <div className="afp-disco-zona">
        <svg className="afp-anillo" viewBox="0 0 200 200" aria-hidden="true">
          <circle cx="100" cy="100" r={r} className="fondo" />
          <circle cx="100" cy="100" r={r} className="valor" strokeDasharray={circ} strokeDashoffset={circ * (1 - p)} />
        </svg>
        <div className={`afp-disco${sonando ? ' gira' : ''}`}>
          <span className="afp-disco-centro"><Icon name="music" size={26} /></span>
        </div>
      </div>
      <div className="afp-medidores">
        <span className="afp-tiempo-txt"><Icon name="clock" size={15} /> {Math.floor(segundo)}s / {DURACION_S}s</span>
        <span className="afp-volumen" aria-label={`Volumen ${Math.round(vol * 100)} %`}>
          <Icon name="music" size={14} />
          {Array.from({ length: barras }, (_, i) => (
            <i key={i} className={i < Math.ceil(vol * barras) ? 'on' : ''} style={{ height: `${6 + i * 1.6}px` }} />
          ))}
        </span>
      </div>
      <p className="afp-estado">
        {estado === 'espera' && 'La canción está lista. ¡Atentos!'}
        {estado === 'sonando' && <>Vale <strong>{puntosEn(segundo)}</strong> puntos si la aciertas ahora</>}
        {estado === 'pausa' && 'Canción en pausa'}
      </p>
    </div>
  );
}

/** Gran botón rojo para pulsar. */
export function Pulsador({ onPulsar, deshabilitado, texto = '¡La sé!' }) {
  return (
    <button type="button" className="afp-pulsador" onClick={onPulsar} disabled={deshabilitado}>
      <span className="afp-pulsador-cara">
        <Icon name="zap" size={30} />
        {texto}
      </span>
    </button>
  );
}

/** Formulario para escribir la respuesta con cuenta atrás. */
export function FormRespuesta({ nombre, valor, onCambiar, onEnviar, restante, enviando, onCancelar }) {
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus(); }, []);
  const pct = Math.max(0, Math.min(100, (restante / SEGUNDOS_RESPUESTA) * 100));
  return (
    <form className="afp-tarjeta afp-respuesta" onSubmit={(e) => { e.preventDefault(); if (valor.trim()) onEnviar(); }}>
      <p className="afp-etiqueta">{nombre ? `Responde, ${nombre}` : 'Tu respuesta'}</p>
      <div className={`afp-cuenta${restante <= 5 ? ' critico' : ''}`}>
        <div className="afp-cuenta-barra"><span style={{ width: `${pct}%` }} /></div>
        <strong>{Math.ceil(restante)}s</strong>
      </div>
      <input
        ref={ref}
        className="afp-input"
        type="text"
        value={valor}
        onChange={(e) => onCambiar(e.target.value)}
        placeholder="¿Cómo se titula la canción?"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        maxLength={80}
      />
      <p className="afp-pista">Basta con el título. Se perdonan tildes y pequeñas erratas.</p>
      <div className="afp-fila">
        {onCancelar && <button type="button" className="afp-boton secundario" onClick={onCancelar}>Cancelar</button>}
        <button type="submit" className="afp-boton" disabled={!valor.trim() || enviando}>
          <Icon name="check" size={20} /> Responder
        </button>
      </div>
    </form>
  );
}

/** Aviso flotante con el último suceso (fallo, rebote…). */
export function Aviso({ mensaje }) {
  const [visible, setVisible] = useState(null);
  const ultimo = useRef(null);
  useEffect(() => {
    const clave = mensaje ? `${mensaje.tipo}-${mensaje.texto}` : null;
    if (!mensaje || clave === ultimo.current) return undefined;
    ultimo.current = clave;
    setVisible(mensaje);
    const id = setTimeout(() => setVisible(null), 3500);
    return () => clearTimeout(id);
  }, [mensaje]);
  if (!visible) return null;
  return <div className={`afp-aviso ${visible.tipo}`} role="status">{visible.texto}</div>;
}

/** Solución de la ronda. */
export function Solucion({ titulo, artista, mensaje, sumas = {}, jugadores = [], yoId }) {
  const filas = jugadores.filter((j) => sumas[j.id] != null).sort((a, b) => sumas[b.id] - sumas[a.id]);
  return (
    <div className={`afp-tarjeta afp-solucion ${mensaje?.tipo || ''}`}>
      <span className="afp-solucion-icono" aria-hidden="true">{mensaje?.tipo === 'acierto' ? '🎉' : '🎧'}</span>
      <p className="afp-etiqueta centrada">Era…</p>
      <h2 className="afp-cancion">{titulo}</h2>
      <p className="afp-artista">{artista}</p>
      {mensaje && <p className={`afp-mensaje ${mensaje.tipo}`}>{mensaje.texto}</p>}
      {filas.length > 0 && (
        <ul className="afp-sumas">
          {filas.map((j) => (
            <li key={j.id} style={{ '--c': colorJugador(j.id) }}>
              <span className="afp-avatar">{inicial(j.nombre)}</span>
              <span>{j.nombre}{j.id === yoId ? ' (tú)' : ''}</span>
              <strong className={sumas[j.id] >= 0 ? 'mas' : 'menos'}>{sumas[j.id] >= 0 ? '+' : ''}{sumas[j.id]}</strong>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function Clasificacion({ jugadores, yoId, titulo = 'Clasificación', subtitulo }) {
  const orden = [...jugadores].sort((a, b) => (b.puntos ?? 0) - (a.puntos ?? 0));
  const max = orden[0]?.puntos ?? 0;
  return (
    <div className="afp-tarjeta">
      {subtitulo && <p className="afp-etiqueta">{subtitulo}</p>}
      <h3 className="afp-titulo">{titulo}</h3>
      <ol className="afp-ranking">
        {orden.map((j, i) => {
          const lider = max > 0 && (j.puntos ?? 0) === max;
          return (
            <li key={j.id} className={lider ? 'lider' : ''} style={{ '--c': colorJugador(j.id) }}>
              <span className="afp-pos">{lider ? <Icon name="crown" size={18} /> : i + 1}</span>
              <span className="afp-avatar">{inicial(j.nombre)}</span>
              <span className="afp-ranking-nombre">{j.nombre}{j.id === yoId ? ' (tú)' : ''}</span>
              <strong>{j.puntos ?? 0}</strong>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function Podio({ jugadores, yoId }) {
  const orden = [...jugadores].sort((a, b) => (b.puntos ?? 0) - (a.puntos ?? 0));
  const max = orden[0]?.puntos ?? 0;
  const ganadores = max > 0 ? orden.filter((j) => (j.puntos ?? 0) === max) : [];
  const top = orden.slice(0, 3);
  const colocacion = top.length === 3 ? [top[1], top[0], top[2]] : top.length === 2 ? [top[1], top[0]] : top;
  const alturas = ['primero', 'segundo', 'tercero'];
  return (
    <div className="afp-tarjeta afp-podio-tarjeta">
      <p className="afp-etiqueta centrada">Fin de la partida</p>
      <h2 className="afp-ganador">
        {ganadores.length === 0 ? 'Nadie ha sumado puntos' : ganadores.length > 1 ? `¡Empate entre ${ganadores.map((g) => g.nombre).join(' y ')}!` : `¡${ganadores[0].nombre} tiene el mejor oído!`}
      </h2>
      <div className="afp-podio">
        {colocacion.map((j) => {
          const puesto = top.indexOf(j);
          return (
            <div key={j.id} className={`afp-podio-col ${alturas[puesto]}`} style={{ '--c': colorJugador(j.id) }}>
              <span className="afp-avatar grande">{inicial(j.nombre)}</span>
              <span className="afp-podio-nombre">{j.nombre}{j.id === yoId ? ' (tú)' : ''}</span>
              <span className="afp-podio-pts">{j.puntos ?? 0} pts</span>
              <span className="afp-podio-base">{puesto + 1}</span>
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
      <div className="rg-modal afp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="afp-modal-icono">🚪</div>
        <h3>{titulo}</h3>
        <p className="hint">{texto}</p>
        <div className="afp-fila">
          <button type="button" className="afp-boton secundario" onClick={onSeguir}>Seguir</button>
          <button type="button" className="afp-boton peligro" onClick={onSalir}>Salir</button>
        </div>
      </div>
    </div>
  );
}

export function PildorasRondas({ valor, onCambiar }) {
  return (
    <div className="afp-pildoras">
      {OPCIONES_RONDAS.map((n) => (
        <button key={n} type="button" className={`afp-pildora${valor === n ? ' activo' : ''}`} onClick={() => onCambiar(n)}>
          {n} canciones
        </button>
      ))}
    </div>
  );
}

export function Cargando({ texto = 'Buscando una canción…' }) {
  return (
    <div className="afp-tarjeta afp-cargando">
      <span className="afp-ecualizador" aria-hidden="true"><i /><i /><i /><i /><i /></span>
      <p>{texto}</p>
    </div>
  );
}
