// client/src/games/Bingoball/Vistas.jsx
// Pantallas de «Bingoball» con el estilo de los juegos renovados. Reciben `v` (vista de engine.vistaDe).
import React, { useEffect, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import { AJUSTES } from './engine.js';
import './Bingoball.css';

export const COLORES = ['#2563eb', '#dc2626', '#16a34a', '#f59e0b', '#9333ea', '#0d9488', '#ea580c', '#db2777', '#4f46e5', '#65a30d', '#0891b2', '#78716c', '#e11d48', '#7c3aed', '#0284c7'];
export const colorDe = (id) => COLORES[((Number(id) || 1) - 1) % COLORES.length];
const inicial = (n) => (n || '?').trim().charAt(0).toUpperCase();

export function Avatar({ id, nombre, grande = false }) {
  return <span className={`bbp-avatar${grande ? ' grande' : ''}`} style={{ '--c': colorDe(id) }}>{inicial(nombre)}</span>;
}

// Equipaciones para el cromo del futbolista (siempre la misma para el mismo nombre)
const EQUIPACIONES = [
  ['#dc2626', '#ffffff'], ['#1d4ed8', '#facc15'], ['#ffffff', '#0f172a'], ['#16a34a', '#ffffff'], ['#0f172a', '#ffffff'],
  ['#7c3aed', '#fde047'], ['#f97316', '#0f172a'], ['#0ea5e9', '#ffffff'], ['#be123c', '#1e3a8a'], ['#facc15', '#1e3a8a']
];
const hash = (s) => [...String(s)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
const siglasDe = (nombre) => {
  const partes = String(nombre).split(/\s+/).filter(Boolean);
  return (partes.length > 1 ? partes[0][0] + partes[partes.length - 1][0] : partes[0]?.slice(0, 2) || '?').toUpperCase();
};

function useRestante(hasta, offset) {
  const calc = () => (hasta ? Math.max(0, (hasta - (Date.now() + offset)) / 1000) : 0);
  const [s, setS] = useState(calc);
  useEffect(() => {
    setS(calc());
    if (!hasta) return undefined;
    const i = setInterval(() => setS(calc()), 200);
    return () => clearInterval(i);
  }, [hasta, offset]); // eslint-disable-line react-hooks/exhaustive-deps
  return s;
}

/** Cromo del futbolista que acaba de salir (silueta con una equipación propia de cada nombre). */
export function Cromo({ futbolista, hasta, offset = 0 }) {
  const restante = useRestante(hasta, offset);
  const [c1, c2] = EQUIPACIONES[hash(futbolista.nombre) % EQUIPACIONES.length];
  const pct = Math.min(100, (restante / AJUSTES.segFutbolista) * 100);
  return (
    <div className="bbp-cromo" key={futbolista.n} style={{ '--k1': c1, '--k2': c2 }}>
      <div className="bbp-cromo-top">
        <span className="bbp-bola">{futbolista.n}</span>
        <span className={`bbp-cromo-tiempo${restante <= 5 ? ' urgente' : ''}`}><Icon name="clock" size={14} /> {Math.ceil(restante)}s</span>
      </div>
      <div className="bbp-cromo-foto" aria-hidden="true">
        <svg viewBox="0 0 120 110">
          <circle cx="60" cy="34" r="22" fill="#f1c9a5" />
          <path d="M38 30c0-14 10-22 22-22s22 8 22 22c-6-6-14-8-22-8s-16 2-22 8z" fill="#3f2a1d" />
          <path d="M14 110c2-30 20-46 46-46s44 16 46 46z" fill={c1} />
          <path d="M48 64h24l-12 14z" fill={c2} />
          <path d="M14 110c1-14 6-25 14-33l6 33z M106 110c-1-14-6-25-14-33l-6 33z" fill={c2} opacity="0.9" />
          <text x="60" y="102" textAnchor="middle" fontFamily="Bricolage Grotesque, sans-serif" fontWeight="800" fontSize="20" fill={c2}>{siglasDe(futbolista.nombre)}</text>
        </svg>
      </div>
      <div className="bbp-cromo-nombre"><span>{futbolista.nombre}</span></div>
      <div className="bbp-cromo-barra"><span style={{ width: `${pct}%` }} /></div>
    </div>
  );
}

function Hero({ v, onSalir, etiqueta, titulo, clase = '' }) {
  return (
    <header className={`bbp-hero ${clase}`}>
      <span className="bbp-bolas-fondo" aria-hidden="true">7 23 41</span>
      <div className="bbp-hero-top">
        <button type="button" className="bbp-salir" onClick={onSalir}><Icon name="door" size={15} /> Salir</button>
        <div className="bbp-chips">
          {v.futbolista && <span className="bbp-chip">⚽ Nº {v.futbolista.n}</span>}
        </div>
      </div>
      <p className="bbp-hero-etiqueta">{etiqueta}</p>
      <h1 className="bbp-hero-titulo">{titulo}</h1>
      <div className="bbp-marcador">
        {[...v.jugadores].sort((a, b) => b.puntos - a.puntos).map((j) => (
          <span key={j.id} className={`bbp-marca${j.id === v.yo?.id ? ' yo' : ''}${j.fuera ? ' fuera' : ''}`}>
            <Avatar id={j.id} nombre={j.nombre} />
            <span className="bbp-marca-nombre">{j.nombre}</span>
            <span className="bbp-marca-datos">{j.puntos} · {j.marcadas}/{v.total}</span>
          </span>
        ))}
      </div>
    </header>
  );
}

function Carton({ v, onMarcar, activo }) {
  const filas = Array.from({ length: AJUSTES.filas }, (_, f) => v.yo.carton.filter((c) => c.fila === f));
  return (
    <div className="bbp-carton">
      {filas.map((fila, f) => {
        const linea = fila.every((c) => c.marcada);
        return (
          <div key={f} className={`bbp-fila${linea ? ' linea' : ''}`}>
            {fila.map((c) => (
              <button key={c.id} type="button" className={`bbp-casilla${c.marcada ? ' marcada' : ''}`}
                disabled={!activo || c.marcada} onClick={() => onMarcar(c)}>
                <span className="bbp-casilla-txt">{c.nombre}</span>
                {c.marcada && <span className="bbp-sello"><b>✓</b><small>{c.futbolista}</small></span>}
              </button>
            ))}
            {linea && <span className="bbp-linea-tag">¡Línea!</span>}
          </div>
        );
      })}
    </div>
  );
}

export function PantallaPreparacion({ v, onSalir, offset }) {
  const s = useRestante(v.hasta, offset);
  return (
    <>
      <Hero v={v} onSalir={onSalir} etiqueta={v.titulo} titulo={`Empieza en ${Math.ceil(s)}…`} clase="mio" />
      <div className="bbp-tarjeta bbp-centro">
        <p className="bbp-etiqueta centrada">Tu cartón</p>
        <p className="bbp-texto">Léelo con calma: en cuanto empiece, irán saliendo futbolistas y tendrás {AJUSTES.segFutbolista} segundos para marcar cada uno.</p>
      </div>
      <Carton v={v} activo={false} onMarcar={() => {}} />
    </>
  );
}

export function PantallaJuego({ v, enviar, onSalir, offset = 0, admin = null }) {
  const [aviso, setAviso] = useState(null);
  const u = v.yo?.ultimo;
  useEffect(() => {
    if (!u) return undefined;
    setAviso(u);
    const t = setTimeout(() => setAviso(null), 3200);
    return () => clearTimeout(t);
  }, [u?.n]); // eslint-disable-line react-hooks/exhaustive-deps
  const puede = v.fase === 'jugando' && !v.yo.bloqueado && !v.yo.actuado;
  const estado = v.yo.bloqueado ? '❌ Has fallado: espera al siguiente futbolista'
    : v.yo.actuado ? '✅ Ya has marcado con este futbolista'
      : 'Toca la casilla en la que encaja (si encaja en alguna)';
  return (
    <>
      <Hero v={v} onSalir={onSalir} etiqueta={v.titulo} titulo="¿Dónde encaja?" />
      {v.futbolista && <Cromo futbolista={v.futbolista} hasta={v.hasta} offset={offset} />}
      {aviso && <div className={`bbp-aviso ${aviso.ok ? 'bien' : 'mal'}`}>{aviso.texto}</div>}
      <p className={`bbp-estado${puede ? '' : ' parado'}`}>{estado}</p>
      <Carton v={v} activo={puede} onMarcar={(c) => enviar('marcar', { casillaId: c.id })} />
      {admin?.esAdmin && (
        <div className="bbp-barra estatica">
          <div className="bbp-dos">
            <button type="button" className="bbp-enlace" onClick={() => enviar('saltar')}><Icon name="forward" size={15} /> Siguiente futbolista</button>
            <button type="button" className="bbp-enlace" onClick={() => enviar('terminar')}><Icon name="flagFinish" size={15} /> Terminar</button>
          </div>
        </div>
      )}
    </>
  );
}

export function PantallaFin({ v, onSalir, children }) {
  const f = v.fin;
  const quien = v.jugadores.find((j) => j.id === f.bingoId);
  const top = f.tabla.filter((x) => !x.fuera).slice(0, 3);
  const orden = [top[1], top[0], top[2]].filter(Boolean);
  const clase = (x) => (x === top[0] ? 'primero' : x === top[1] ? 'segundo' : 'tercero');
  return (
    <>
      <Hero v={v} onSalir={onSalir} etiqueta="Fin del bingo" titulo={quien ? `¡BINGO de ${quien.nombre}!` : 'Bingo terminado'} clase="fin" />
      {top.length > 0 && f.max > 0 && (
        <div className="bbp-tarjeta">
          <div className="bbp-podio">
            {orden.map((x) => (
              <div key={x.id} className={`bbp-podio-col ${clase(x)}`}>
                <Avatar id={x.id} nombre={x.nombre} />
                <span className="bbp-podio-nombre">{x.nombre}</span>
                <span className="bbp-podio-pts">{x.puntos} pts</span>
                <div className="bbp-podio-base" style={{ '--c': colorDe(x.id) }}>{x.puesto}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="bbp-tarjeta">
        <p className="bbp-etiqueta">Clasificación del bingo</p>
        <ol className="bbp-ranking">
          {f.tabla.map((j) => (
            <li key={j.id} className={j.puesto === 1 && j.puntos > 0 ? 'lider' : ''}>
              <span className="bbp-pos">{j.fuera ? '🚪' : j.puesto}</span>
              <Avatar id={j.id} nombre={j.nombre} />
              <span className="bbp-ranking-nombre">{j.nombre}{j.id === v.yo?.id ? ' (tú)' : ''}{j.id === f.bingoId ? ' 🎉' : ''}
                <small>{j.marcadas}/{v.total} casillas · {j.lineas} {j.lineas === 1 ? 'línea' : 'líneas'}</small>
              </span>
              <strong>{j.puntos}</strong>
            </li>
          ))}
        </ol>
      </div>
      {v.yo && (
        <div className="bbp-tarjeta">
          <p className="bbp-etiqueta">Tu cartón</p>
          <Carton v={v} activo={false} onMarcar={() => {}} />
        </div>
      )}
      {children}
    </>
  );
}

export function ModalSalir({ titulo, texto, onSeguir, onSalir }) {
  return (
    <div className="rg-modal-fondo" onClick={onSeguir}>
      <div className="rg-modal bbp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="bbp-modal-icono">🚪</div>
        <h3>{titulo}</h3>
        <p className="hint">{texto}</p>
        <div className="bbp-dos">
          <button type="button" className="bbp-boton secundario" onClick={onSeguir}>Seguir</button>
          <button type="button" className="bbp-boton peligro" onClick={onSalir}>Salir</button>
        </div>
      </div>
    </div>
  );
}

export function SelectorGrupo({ grupos = [], valor, onCambiar }) {
  return (
    <div className="bbp-grupos">
      {grupos.map((g) => (
        <button key={g.id} type="button" className={`bbp-grupo${valor === g.id ? ' activo' : ''}`} disabled={!onCambiar} onClick={() => onCambiar?.(g.id)}>{g.nombre}</button>
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
            <li>Cada jugador recibe un cartón con {AJUSTES.filas * AJUSTES.columnas} categorías ({AJUSTES.filas} filas de {AJUSTES.columnas}).</li>
            <li>Cada {AJUSTES.segFutbolista} segundos sale un futbolista. Si encaja en una casilla abierta de tu cartón, tócala (una por futbolista).</li>
            <li>Acertar suma <strong>{AJUSTES.puntosAcierto}</strong>. Fallar resta <strong>{AJUSTES.puntosFallo}</strong> y te deja sin marcar hasta el siguiente futbolista.</li>
            <li>Cada fila completa es una <strong>línea</strong> (+{AJUSTES.puntosLinea}). Quien completa el cartón canta <strong>bingo</strong> (+{AJUSTES.puntosBingo}) y termina la partida.</li>
          </ul>
        </div>
        <button type="button" className="big full qq-btn-principal" onClick={onCerrar}>¡Entendido!</button>
      </div>
    </div>
  );
}
