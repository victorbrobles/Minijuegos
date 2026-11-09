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
export function Cromo({ futbolista, hasta, offset = 0, pausadoEn = null }) {
  const vivo = useRestante(pausadoEn ? null : hasta, offset);
  const restante = pausadoEn ? Math.max(0, (hasta - pausadoEn) / 1000) : vivo;
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
          {v.fase !== 'preparacion' && v.fase !== 'fin' && (
            <span className={`bbp-chip${v.lineaCantada ? '' : ' libre'}`}>📣 {v.lineaCantada ? `Línea: ${v.jugadores.find((j) => j.id === v.lineaCantada)?.nombre ?? '—'}` : 'Línea libre'}</span>
          )}
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

function Carton({ v, onMarcar, activo, onLinea = null }) {
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
            {linea && onLinea && (
              <button type="button" className="bbp-cantar" onClick={() => onLinea(f)}>📣 Cantar línea</button>
            )}
            {linea && !onLinea && <span className="bbp-linea-tag">Fila completa</span>}
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

/** Aviso para todos de lo que ha pasado con la última línea (se ve unos segundos). */
function AvisoLinea({ v }) {
  const a = v.avisoLinea;
  const [visible, setVisible] = useState(null);
  useEffect(() => {
    if (!a) return undefined;
    setVisible(a);
    const t = setTimeout(() => setVisible(null), 4500);
    return () => clearTimeout(t);
  }, [a?.n]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!visible) return null;
  const quien = v.jugadores.find((j) => j.id === visible.jugadorId)?.nombre ?? 'Alguien';
  const yo = visible.jugadorId === v.yo?.id;
  return (
    <div className={`bbp-aviso-linea${visible.cantada ? ' cantada' : ''}`}>
      {visible.cantada
        ? (yo ? `📣 ¡Has cantado línea! +${AJUSTES.puntosLinea}. Tu fila tiene 3 categorías nuevas.` : `📣 ¡${quien} ha cantado línea! Ya no se puede cantar otra en este bingo.`)
        : (yo ? '▶️ No has cantado la línea. Sigue el bingo.' : `▶️ ${quien} no ha cantado la línea. Sigue el bingo.`)}
    </div>
  );
}

/** Pantalla de confirmación (para quien canta) o de pausa (para el resto). */
function PausaLinea({ v, offset, enviar }) {
  const s = useRestante(v.pausa?.hasta, offset);
  const quien = v.jugadores.find((j) => j.id === v.pausa.jugadorId)?.nombre ?? 'Un jugador';
  if (v.pausa.jugadorId === v.yo?.id) {
    const fila = v.yo.carton.filter((c) => c.fila === v.pausa.fila);
    return (
      <div className="rg-modal-fondo">
        <div className="rg-modal bbp-modal bbp-modal-linea">
          <div className="bbp-modal-icono">📣</div>
          <h3>¿Cantar línea?</h3>
          <div className="bbp-modal-fila">{fila.map((c) => <span key={c.id}>✓ {c.nombre}</span>)}</div>
          <p className="hint">Sumarás <strong>{AJUSTES.puntosLinea} puntos</strong> y esa fila se cambiará por <strong>3 categorías nuevas</strong> que tendrás que volver a rellenar para cantar bingo. Solo se puede cantar una línea por bingo.</p>
          <p className="bbp-modal-tiempo">El bingo está en pausa para todos · {Math.ceil(s)} s</p>
          <div className="bbp-dos">
            <button type="button" className="bbp-boton secundario" onClick={() => enviar('decidir', { cantar: false })}>No, seguir</button>
            <button type="button" className="bbp-boton" onClick={() => enviar('decidir', { cantar: true })}>¡Sí, cantar!</button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="bbp-tarjeta bbp-centro bbp-pausa">
      <span className="bbp-carga" aria-hidden="true">⏸️</span>
      <p className="bbp-texto"><strong>{quien}</strong> tiene línea y está decidiendo si la canta.</p>
      <p className="bbp-pista">El bingo está en pausa para todos ({Math.ceil(s)} s).</p>
    </div>
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
  const pausa = v.fase === 'linea';
  const puede = v.fase === 'jugando' && !v.yo.bloqueado && !v.yo.actuado;
  const puedeLinea = v.fase === 'jugando' && !v.lineaCantada;
  const estado = pausa ? '⏸️ Bingo en pausa'
    : v.yo.bloqueado ? '❌ Has fallado: espera al siguiente futbolista'
      : v.yo.actuado ? '✅ Ya has marcado con este futbolista'
        : 'Toca la casilla en la que encaja (si encaja en alguna)';
  return (
    <>
      <Hero v={v} onSalir={onSalir} etiqueta={v.titulo} titulo={pausa ? '¡Alguien tiene línea!' : '¿Dónde encaja?'} />
      {v.futbolista && <Cromo futbolista={v.futbolista} hasta={v.hasta} offset={offset} pausadoEn={v.pausadoEn} />}
      <AvisoLinea v={v} />
      {pausa && <PausaLinea v={v} offset={offset} enviar={enviar} />}
      {aviso && !pausa && <div className={`bbp-aviso ${aviso.ok ? 'bien' : 'mal'}`}>{aviso.texto}</div>}
      <p className={`bbp-estado${puede ? '' : ' parado'}`}>{estado}</p>
      <Carton v={v} activo={puede} onMarcar={(c) => enviar('marcar', { casillaId: c.id })}
        onLinea={puedeLinea ? (f) => enviar('linea', { fila: f }) : null} />
      {admin?.esAdmin && (
        <div className="bbp-barra estatica">
          <div className="bbp-dos">
            <button type="button" className="bbp-enlace" onClick={() => enviar('saltar')}><Icon name="forward" size={15} /> {pausa ? 'Seguir sin la línea' : 'Siguiente futbolista'}</button>
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

// Aspecto de cada tipo de bingo (los datos vienen del servidor)
const TIPOS = {
  internacional: { emoji: '🌍', color: ['#38bdf8', '#1d4ed8'], titulo: 'Selecciones', texto: 'Mundiales, Eurocopas, Copa América y grandes de cada país.' },
  champions: { emoji: '🏆', color: ['#818cf8', '#312e81'], titulo: 'Champions League', texto: 'Finales, goleadores y campeones de la Orejona.' },
  laliga: { emoji: '🇪🇸', color: ['#fb7185', '#b91c1c'], titulo: 'LaLiga', texto: 'Pichichis, Zamoras, clásicos y récords de Primera.' },
  grandes_ligas: { emoji: '⚽', color: ['#4ade80', '#15803d'], titulo: 'Grandes Ligas', texto: 'Premier, Serie A, Bundesliga y Ligue 1.' },
  leyendas: { emoji: '👑', color: ['#fcd34d', '#b45309'], titulo: 'Leyendas', texto: 'Mitos y récords de toda la historia del fútbol.' }
};

/** Elección del tipo de bingo (el anfitrión elige; el resto espera viendo las opciones). */
export function PantallaTipos({ grupos = [], inicial: elegidoInicial, esAdmin, anfitrion, onElegir, onVolver, onSalir }) {
  const [elegido, setElegido] = useState(elegidoInicial || grupos[0]?.id);
  const actual = grupos.find((g) => g.id === elegido);
  return (
    <>
      <header className="bbp-hero">
        <span className="bbp-bolas-fondo" aria-hidden="true">7 23 41</span>
        <div className="bbp-hero-top">
          <button type="button" className="bbp-salir" onClick={onSalir}><Icon name="door" size={15} /> Salir</button>
        </div>
        <p className="bbp-hero-etiqueta">{esAdmin ? 'Paso 2 de 2' : 'Un momento…'}</p>
        <h1 className="bbp-hero-titulo">{esAdmin ? '¿Qué bingo jugamos?' : `${anfitrion ?? 'El anfitrión'} está eligiendo el bingo`}</h1>
      </header>
      <div className="bbp-tipos">
        {grupos.map((g) => {
          const t = TIPOS[g.id] || { emoji: '⚽', color: ['#60a5fa', '#1d4ed8'], titulo: g.nombre, texto: '' };
          const sel = esAdmin && elegido === g.id;
          return (
            <button key={g.id} type="button" className={`bbp-tipo${sel ? ' sel' : ''}`} disabled={!esAdmin}
              style={{ '--t1': t.color[0], '--t2': t.color[1] }} onClick={() => setElegido(g.id)}>
              <span className="bbp-tipo-emoji" aria-hidden="true">{t.emoji}</span>
              <span className="bbp-tipo-cuerpo">
                <strong>{t.titulo}</strong>
                <small>{t.texto}</small>
                {sel && g.ejemplos?.length > 0 && (
                  <span className="bbp-tipo-ejemplos">
                    {g.ejemplos.map((e) => <i key={e}>{e}</i>)}
                    <i className="mas">y {Math.max(0, g.categorias - g.ejemplos.length)} categorías más</i>
                  </span>
                )}
              </span>
              {sel && <b className="bbp-tipo-check">✓</b>}
            </button>
          );
        })}
      </div>
      {esAdmin ? (
        <div className="bbp-barra estatica">
          <button type="button" className="bbp-boton grande" disabled={!actual} onClick={() => onElegir(elegido)}>
            <Icon name="play" size={20} /> Jugar a {TIPOS[elegido]?.titulo ?? 'este bingo'}
          </button>
          <button type="button" className="bbp-enlace" onClick={onVolver}><Icon name="arrowLeft" size={15} /> Volver</button>
        </div>
      ) : (
        <p className="bbp-esperando">⏳ En cuanto lo elija se repartirán los cartones.</p>
      )}
    </>
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
            <li>Con una fila completa aparece el botón <strong>«Cantar línea»</strong>. El bingo se para mientras decides: si la cantas sumas <strong>{AJUSTES.puntosLinea}</strong> y esa fila cambia por 3 categorías nuevas; si no, todo sigue igual. Solo hay <strong>una línea por bingo</strong>: la primera que se cante.</li>
            <li>Quien completa el cartón canta <strong>bingo</strong> (+{AJUSTES.puntosBingo}) y termina la partida.</li>
            <li>Los futbolistas salen al azar, pero salen más los que encajan en más casillas abiertas y los que hace más que no salen; los que no sirven a nadie ya no salen.</li>
          </ul>
        </div>
        <button type="button" className="big full qq-btn-principal" onClick={onCerrar}>¡Entendido!</button>
      </div>
    </div>
  );
}
