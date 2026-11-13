// client/src/games/Trayectoria/Vistas.jsx
// Pantallas de «Modo carrera» (online y un solo dispositivo) con el estilo de los juegos renovados.
// Reciben `v` (vista que genera engine.vistaDe).
import { useRegistrarPartida, resultadoDesdeFin } from '../../lib/registros.js';
import React, { useEffect, useRef, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import { AJUSTES, DIFICULTADES, OPCIONES_RONDAS } from './engine.js';
import './Trayectoria.css';

export const COLORES = ['#16a34a', '#2563eb', '#dc2626', '#f59e0b', '#9333ea', '#0d9488', '#ea580c', '#db2777', '#4f46e5', '#65a30d', '#0891b2', '#78716c', '#e11d48', '#7c3aed', '#0284c7'];
export const colorDe = (id) => COLORES[((Number(id) || 1) - 1) % COLORES.length];
const inicial = (n) => (n || '?').trim().charAt(0).toUpperCase();
const NOMBRE_DIF = { baja: 'Fácil', media: 'Media', alta: 'Difícil' };

export function Avatar({ id, nombre, grande = false }) {
  return <span className={`mcp-avatar${grande ? ' grande' : ''}`} style={{ '--c': colorDe(id) }}>{inicial(nombre)}</span>;
}

/** Texto oscuro o claro según lo claro que sea el color de fondo. */
function contraste(hex) {
  const h = String(hex || '#000').replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((x) => x + x).join('') : h, 16);
  const r = (n >> 16) & 255; const g = (n >> 8) & 255; const b = n & 255;
  return (r * 299 + g * 587 + b * 114) / 1000 > 165 ? '#0f172a' : '#ffffff';
}

/** Escudo dibujado con los colores del club (se usa si no hay imagen o no carga). */
function EscudoDibujado({ club }) {
  const [c1, c2] = club.colores || ['#475569', '#ffffff'];
  const texto = contraste(c1);
  const s = club.siglas || inicial(club.nombre);
  const tam = s.length >= 4 ? 15 : s.length === 3 ? 19 : 24;
  return (
    <svg viewBox="0 0 64 72" className="mcp-escudo-svg" role="img" aria-label={club.nombre}>
      <path d="M32 2 L60 10 V34 C60 52 47 64 32 70 C17 64 4 52 4 34 V10 Z" fill={c1} stroke="rgba(15,23,42,0.35)" strokeWidth="2" />
      <path d="M4 22 H60 V30 H4 Z" fill={c2} opacity="0.95" />
      <path d="M32 2 L60 10 V34 C60 52 47 64 32 70 C17 64 4 52 4 34 V10 Z" fill="url(#mcpBrillo)" />
      <defs>
        <linearGradient id="mcpBrillo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="0.55" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <text x="32" y="52" textAnchor="middle" fontFamily="Bricolage Grotesque, sans-serif" fontWeight="800" fontSize={tam} fill={texto}>{s}</text>
    </svg>
  );
}

export function Escudo({ club }) {
  const [fallo, setFallo] = useState(false);
  useEffect(() => setFallo(false), [club.logo]);
  if (!club.logo || fallo) return <EscudoDibujado club={club} />;
  return <img className="mcp-escudo-img" src={club.logo} alt={club.nombre} loading="lazy" referrerPolicy="no-referrer" onError={() => setFallo(true)} />;
}

/** Segundos que faltan hasta `hasta` (con el desfase del reloj del servidor). */
function useAhora(offset = 0, activo = true) {
  const [t, setT] = useState(() => Date.now() + offset);
  useEffect(() => {
    if (!activo) return undefined;
    const i = setInterval(() => setT(Date.now() + offset), 200);
    return () => clearInterval(i);
  }, [offset, activo]);
  return t;
}

// ---------------------------------------------------------------- Cabecera
function Hero({ v, onSalir, etiqueta, titulo, clase = '' }) {
  const turno = v.pulsado?.jugadorId;
  return (
    <header className={`mcp-hero ${clase}`}>
      <span className="mcp-campo-fondo" aria-hidden="true" />
      <div className="mcp-hero-top">
        <button type="button" className="mcp-salir" onClick={onSalir}><Icon name="door" size={15} /> Salir</button>
        <div className="mcp-chips">
          <span className="mcp-chip">⚽ {Math.min(v.ronda, v.rondas)}/{v.rondas}</span>
          {v.fase !== 'fin' && <span className={`mcp-chip dif-${v.reto.dificultad}`}>{NOMBRE_DIF[v.reto.dificultad]}</span>}
        </div>
      </div>
      <p className="mcp-hero-etiqueta">{etiqueta}</p>
      <h1 className="mcp-hero-titulo">{titulo}</h1>
      <div className="mcp-marcador">
        {[...v.jugadores].sort((a, b) => b.puntos - a.puntos).map((j) => (
          <span key={j.id} className={`mcp-marca${turno === j.id ? ' turno' : ''}${j.id === v.yo?.id ? ' yo' : ''}${j.fuera ? ' fuera' : ''}${v.bloqueados?.includes(j.id) && v.fase === 'jugando' ? ' bloqueado' : ''}`}>
            <Avatar id={j.id} nombre={j.nombre} />
            <span className="mcp-marca-nombre">{j.nombre}</span>
            <span className="mcp-marca-datos">{j.puntos}</span>
          </span>
        ))}
      </div>
    </header>
  );
}

// ---------------------------------------------------------------- Trayectoria
function Clubes({ v }) {
  const lista = useRef(null);
  useEffect(() => {
    const ultimo = lista.current?.querySelector('.mcp-club.nuevo');
    ultimo?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' });
  }, [v.reto.clubes.length]);
  return (
    <ol className="mcp-clubes" ref={lista}>
      {v.reto.clubes.map((c, k) => (
        <li key={`${k}-${c.nombre}`} className={`mcp-club${k === v.reto.clubes.length - 1 && v.fase === 'jugando' ? ' nuevo' : ''}`}>
          <span className="mcp-club-num">{k + 1}</span>
          <span className="mcp-escudo"><Escudo club={c} /></span>
          <span className="mcp-club-datos">
            <strong>{c.nombre}</strong>
            <small>{c.periodo}</small>
          </span>
        </li>
      ))}
    </ol>
  );
}

function Reloj({ v, offset }) {
  const ahora = useAhora(offset, v.fase === 'jugando' && !v.pausado);
  const ref = v.etapa.pausadoEn ?? ahora;
  const pasado = Math.max(0, ref - v.etapa.desde);
  const quedan = Math.max(0, Math.ceil((v.etapa.duracion - pasado) / 1000));
  const pct = Math.max(0, Math.min(100, 100 - (pasado / v.etapa.duracion) * 100));
  const todos = v.reto.todos;
  const texto = v.pausado ? '⏸ Reloj parado'
    : !todos ? `Siguiente club en ${quedan}s`
        : `Última oportunidad: ${quedan}s`;
  return (
    <div className={`mcp-reloj${v.pausado ? ' parado' : ''}${todos && quedan <= 5 && !v.pausado ? ' urgente' : ''}`}>
      <div className="mcp-reloj-barra"><span style={{ width: `${pct}%` }} /></div>
      <span className="mcp-reloj-txt">{texto}</span>
    </div>
  );
}

function Ficha({ v, offset }) {
  return (
    <div className="mcp-tarjeta mcp-ficha">
      <div className="mcp-ficha-top">
        <span className="mcp-silueta" aria-hidden="true">
          <svg viewBox="0 0 64 64"><circle cx="32" cy="22" r="12" /><path d="M10 60c2-14 11-22 22-22s20 8 22 22z" /></svg>
        </span>
        <div className="mcp-ficha-datos">
          <p className="mcp-etiqueta">¿Quién es?</p>
          <p className="mcp-ficha-nac">{v.fase === 'jugando' ? `${v.reto.clubes.length}º club de su carrera` : `🌍 ${v.reto.nacionalidad}`}</p>
          <p className="mcp-ficha-clubes">{v.fase !== 'jugando' ? `${v.reto.clubes.length} clubes en su carrera` : v.reto.todos ? 'Ya han salido todos sus clubes' : 'Irán saliendo más clubes…'}</p>
        </div>
        {v.fase === 'jugando' && <span className="mcp-vale"><b>{v.puntosAhora}</b><small>pts</small></span>}
      </div>
      {v.fase === 'jugando' && <Reloj v={v} offset={offset} />}
    </div>
  );
}

function Pista({ v }) {
  if (!v.reto.pista) return null;
  return (
    <div className="mcp-pista-caja">
      <span aria-hidden="true">💡</span>
      <p><strong>Pista:</strong> {v.reto.pista}</p>
    </div>
  );
}

export function Pulsador({ onPulsar, deshabilitado, texto = '¡Lo sé!' }) {
  return (
    <button type="button" className="mcp-pulsador" onClick={onPulsar} disabled={deshabilitado}>
      <span className="mcp-pulsador-cara">
        <Icon name="zap" size={30} />
        {texto}
      </span>
    </button>
  );
}

export function FormRespuesta({ v, nombre, offset = 0, onEnviar, onCancelar }) {
  const [texto, setTexto] = useState('');
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus(); }, []);
  const ahora = useAhora(offset);
  const restante = Math.max(0, (v.pulsado.hasta - ahora) / 1000);
  const pct = Math.max(0, Math.min(100, (restante / AJUSTES.segRespuesta) * 100));
  return (
    <form className="mcp-tarjeta mcp-respuesta" onSubmit={(e) => { e.preventDefault(); if (texto.trim()) onEnviar(texto); }}>
      <p className="mcp-etiqueta">{nombre ? `Responde, ${nombre}` : 'Tu respuesta'} · vale {v.puntosAhora} pts</p>
      <div className={`mcp-cuenta${restante <= 5 ? ' critico' : ''}`}>
        <div className="mcp-cuenta-barra"><span style={{ width: `${pct}%` }} /></div>
        <strong>{Math.ceil(restante)}s</strong>
      </div>
      <input ref={ref} className="mcp-input" type="text" value={texto} onChange={(e) => setTexto(e.target.value)}
        placeholder="¿Quién es el futbolista?" autoComplete="off" autoCorrect="off" spellCheck={false} maxLength={80} />
      <p className="mcp-pista">Vale con el nombre por el que se le conoce. Se perdonan tildes y pequeñas erratas.</p>
      <div className="mcp-dos">
        {onCancelar && <button type="button" className="mcp-boton secundario" onClick={onCancelar}>Cancelar</button>}
        <button type="submit" className="mcp-boton" disabled={!texto.trim()}><Icon name="check" size={20} /> Responder</button>
      </div>
    </form>
  );
}

/** Ronda en juego. `controles` es lo de abajo (pulsador, formulario…), distinto online y en un dispositivo. */
export function BotonPista({ v, onPista }) {
  if (v.fase !== 'jugando' || !v.reto.hayPista || v.pistaVisible || v.pulsado || !onPista) return null;
  return (
    <button type="button" className="mcp-boton-pista" onClick={onPista}>
      <span aria-hidden="true">💡</span>
      <span><strong>Desvelar pista</strong><small>Acertar con pista vale {AJUSTES.puntosPista} punto</small></span>
    </button>
  );
}

export function PantallaRonda({ v, onSalir, offset = 0, controles, etiqueta, titulo, mio = false, onPista }) {
  return (
    <>
      <Hero v={v} onSalir={onSalir} etiqueta={etiqueta} titulo={titulo} clase={mio ? 'mio' : ''} />
      <Ficha v={v} offset={offset} />
      <Clubes v={v} />
      <Pista v={v} />
      <BotonPista v={v} onPista={onPista} />
      {controles}
    </>
  );
}

export function PantallaResultado({ v, onSalir, children }) {
  const r = v.resultado;
  const quien = v.jugadores.find((j) => j.id === r?.jugadorId);
  const sumas = Object.entries(v.sumas || {}).map(([id, s]) => ({ id: Number(id), s })).sort((a, b) => b.s - a.s);
  return (
    <>
      <Hero v={v} onSalir={onSalir} etiqueta={r?.tipo === 'acierto' ? `¡Lo ha sacado ${quien?.nombre}!` : 'Nadie lo ha sacado'} titulo={v.reto.solucion} clase="fin" />
      <div className={`mcp-tarjeta mcp-solucion ${r?.tipo === 'acierto' ? 'bien' : ''}`}>
        <span className="mcp-solucion-icono" aria-hidden="true">{r?.tipo === 'acierto' ? '🎉' : '⚽'}</span>
        <p className="mcp-etiqueta centrada">Era…</p>
        <h2>{v.reto.solucion}</h2>
        <p className="mcp-texto">{r?.tipo === 'acierto' ? `${quien?.nombre} suma ${r.puntos} ${r.puntos === 1 ? 'punto' : 'puntos'}.` : 'Esta vez se ha resistido.'}</p>
        {sumas.length > 0 && (
          <ul className="mcp-sumas">
            {sumas.map(({ id, s }) => {
              const j = v.jugadores.find((x) => x.id === id);
              return (
                <li key={id}>
                  <Avatar id={id} nombre={j?.nombre} />
                  <span>{j?.nombre}{id === v.yo?.id ? ' (tú)' : ''}</span>
                  <strong className={s >= 0 ? 'mas' : 'menos'}>{s > 0 ? '+' : ''}{s}</strong>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <Pista v={v} />
      <Clubes v={v} />
      {children}
    </>
  );
}

export function PantallaFin({ v, onSalir, children }) {
  useRegistrarPartida('trayectoria', resultadoDesdeFin(v));
  const f = v.fin;
  const nombres = f.ganadores.map((id) => v.jugadores.find((j) => j.id === id)?.nombre).filter(Boolean);
  const top = f.tabla.filter((x) => !x.fuera).slice(0, 3);
  const orden = [top[1], top[0], top[2]].filter(Boolean);
  const clase = (x) => (x === top[0] ? 'primero' : x === top[1] ? 'segundo' : 'tercero');
  return (
    <>
      <Hero v={v} onSalir={onSalir} etiqueta="Fin de la partida" titulo={nombres.length ? `¡Gana ${nombres.join(' y ')}!` : 'Nadie ha puntuado'} clase="fin" />
      {top.length > 0 && f.max > 0 && (
        <div className="mcp-tarjeta">
          <div className="mcp-podio">
            {orden.map((x) => (
              <div key={x.id} className={`mcp-podio-col ${clase(x)}`}>
                <Avatar id={x.id} nombre={x.nombre} />
                <span className="mcp-podio-nombre">{x.nombre}</span>
                <span className="mcp-podio-pts">{x.puntos} pts</span>
                <div className="mcp-podio-base" style={{ '--c': colorDe(x.id) }}>{x.puesto}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="mcp-tarjeta">
        <p className="mcp-etiqueta">Clasificación</p>
        <ol className="mcp-ranking">
          {f.tabla.map((j, i) => (
            <li key={j.id} className={i === 0 && j.puntos > 0 && !j.fuera ? 'lider' : ''}>
              <span className="mcp-pos">{j.fuera ? '🚪' : j.puesto}</span>
              <Avatar id={j.id} nombre={j.nombre} />
              <span className="mcp-ranking-nombre">{j.nombre}{j.id === v.yo?.id ? ' (tú)' : ''}<small>{j.fuera ? 'abandonó' : `${j.aciertos} ${j.aciertos === 1 ? 'acierto' : 'aciertos'}`}</small></span>
              <strong>{j.puntos}</strong>
            </li>
          ))}
        </ol>
      </div>
      {children}
    </>
  );
}

// ---------------------------------------------------------------- Comunes
export function ModalSalir({ titulo, texto, onSeguir, onSalir }) {
  return (
    <div className="rg-modal-fondo" onClick={onSeguir}>
      <div className="rg-modal mcp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mcp-modal-icono">🚪</div>
        <h3>{titulo}</h3>
        <p className="hint">{texto}</p>
        <div className="mcp-dos">
          <button type="button" className="mcp-boton secundario" onClick={onSeguir}>Seguir</button>
          <button type="button" className="mcp-boton peligro" onClick={onSalir}>Salir</button>
        </div>
      </div>
    </div>
  );
}

export function SelectorRondas({ valor, onCambiar }) {
  return (
    <div className="mcp-pildoras">
      {OPCIONES_RONDAS.map((n) => (
        <button key={n} type="button" className={`mcp-pildora${valor === n ? ' activo' : ''}`} disabled={!onCambiar} onClick={() => onCambiar?.(n)}>{n} futbolistas</button>
      ))}
    </div>
  );
}

export function SelectorDificultad({ valor, onCambiar }) {
  return (
    <div className="mcp-pildoras">
      {DIFICULTADES.map((d) => (
        <button key={d.id} type="button" className={`mcp-pildora${valor === d.id ? ' activo' : ''}`} disabled={!onCambiar} onClick={() => onCambiar?.(d.id)}>{d.nombre}</button>
      ))}
    </div>
  );
}

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
            <li>Los clubes del futbolista aparecen uno a uno, cada {AJUSTES.segClub} segundos (no se sabe cuántos tiene hasta que salen todos).</li>
            <li>Si crees que lo sabes, pulsa <strong>«¡Lo sé!»</strong>: el reloj se para y tienes {AJUSTES.segRespuesta} segundos para escribirlo.</li>
            <li>Si fallas, pierdes {AJUSTES.puntosFallo} punto y quedas fuera de ese futbolista.</li>
            <li>Tras el último club quedan {AJUSTES.segTrasUltimo} segundos. En los retos difíciles se puede pulsar «Desvelar pista» (da {AJUSTES.segPista} segundos más, pero acertar vale menos).</li>
          </ul>
          <p className="mcp-ayuda-sub">Puntuación</p>
          <ul>
            <li>Cuantos menos clubes hayan salido, más puntos: hasta <strong>{AJUSTES.puntosMax}</strong>.</li>
            <li>Con todos los clubes a la vista, <strong>{AJUSTES.puntosTodos}</strong>; con la pista, <strong>{AJUSTES.puntosPista}</strong>.</li>
          </ul>
        </div>
        <button type="button" className="big full qq-btn-principal" onClick={onCerrar}>¡Entendido!</button>
      </div>
    </div>
  );
}
