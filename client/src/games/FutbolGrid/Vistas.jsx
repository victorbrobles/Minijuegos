// client/src/games/FutbolGrid/Vistas.jsx
// Pantallas de «Fútbol en raya» (online y un solo dispositivo) con el estilo de los juegos renovados.
import React, { useEffect, useRef, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import { AJUSTES, EQUIPOS } from './engine.js';
import './FutbolGrid.css';

const inicial = (n) => (n || '?').trim().charAt(0).toUpperCase();
export const COLOR_EQUIPO = { X: '#2563eb', O: '#dc2626' };

export function Avatar({ nombre, equipo }) {
  return <span className="fgp-avatar" style={{ '--c': COLOR_EQUIPO[equipo] || '#64748b' }}>{inicial(nombre)}</span>;
}

function useRestante(hasta, offset = 0) {
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

function Hero({ v, onSalir, etiqueta, titulo, clase = '' }) {
  return (
    <header className={`fgp-hero ${clase}`}>
      <span className="fgp-xo-fondo" aria-hidden="true">✕◯</span>
      <div className="fgp-hero-top">
        <button type="button" className="fgp-salir" onClick={onSalir}><Icon name="door" size={15} /> Salir</button>
        <div className="fgp-chips">
          {v.dificultad && <span className="fgp-chip">{v.dificultad}</span>}
          {v.fase !== 'fin' && <span className={`fgp-chip turno-${v.turno}`}>Turno: {EQUIPOS[v.turno].simbolo} {EQUIPOS[v.turno].nombre}</span>}
        </div>
      </div>
      <p className="fgp-hero-etiqueta">{etiqueta}</p>
      <h1 className="fgp-hero-titulo">{titulo}</h1>
    </header>
  );
}

export function Equipos({ jugadores, turno, yoId, fase }) {
  return (
    <div className="fgp-equipos">
      {['X', 'O'].map((e) => (
        <div key={e} className={`fgp-equipo eq-${e}${turno === e && fase !== 'fin' ? ' activo' : ''}`}>
          <p className="fgp-equipo-nombre"><b>{EQUIPOS[e].simbolo}</b> {EQUIPOS[e].nombre}</p>
          <div className="fgp-equipo-lista">
            {jugadores.filter((j) => j.equipo === e).map((j) => (
              <span key={j.id} className={`fgp-equipo-jug${j.fuera ? ' fuera' : ''}${j.id === yoId ? ' yo' : ''}`}>{j.nombre}{j.id === yoId ? ' (tú)' : ''}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Tablero 3×3 con las categorías de filas y columnas. */
export function Tablero({ v, puedeElegir, onElegir }) {
  const linea = v.fin?.linea || [];
  return (
    <div className="fgp-tablero">
      <div className="fgp-esquina"><Icon name="futbolgrid" size={22} /></div>
      {v.columnas.map((c, k) => <div key={`c${k}`} className="fgp-cat col"><span>{c}</span></div>)}
      {v.filas.map((f, fi) => (
        <React.Fragment key={`f${fi}`}>
          <div className="fgp-cat fila"><span>{f}</span></div>
          {[0, 1, 2].map((ci) => {
            const i = fi * 3 + ci;
            const c = v.tablero[i];
            const activa = v.celda === i;
            const ejemplos = v.fin?.ejemplos?.[i];
            const cls = `fgp-celda${c ? ` eq-${c.equipo}` : ''}${activa ? ' activa' : ''}${linea.includes(i) ? ' ganadora' : ''}`;
            if (c) {
              return (
                <div key={i} className={cls}>
                  <b className="fgp-simbolo">{EQUIPOS[c.equipo].simbolo}</b>
                  <span className="fgp-celda-nombre">{c.futbolista}</span>
                </div>
              );
            }
            if (puedeElegir) {
              return <button key={i} type="button" className={`${cls} libre`} onClick={() => onElegir(i)}><span className="fgp-mas">+</span></button>;
            }
            return (
              <div key={i} className={cls}>
                {activa ? <span className="fgp-pensando">✍️</span> : ejemplos ? (
                  <span className="fgp-ejemplos">{ejemplos.nombres.slice(0, 2).join(', ')}{ejemplos.total > 2 ? ` +${ejemplos.total - 2}` : ''}</span>
                ) : null}
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
}

function Ultimo({ v }) {
  const u = v.ultimo;
  if (!u || v.fase === 'fin') return null;
  const eq = EQUIPOS[u.equipo]?.nombre;
  let texto;
  if (u.ok) texto = <>✅ <strong>{u.quien ?? `Equipo ${eq}`}</strong> acierta con <strong>{u.futbolista}</strong></>;
  else if (u.pasa) texto = <>⏭️ El equipo {eq} ha pasado</>;
  else if (u.tiempo) texto = <>⏰ Se le acabó el tiempo al equipo {eq}</>;
  else texto = <>❌ «{u.texto}» no vale para esa casilla</>;
  return <div className={`fgp-ultimo ${u.ok ? 'bien' : 'mal'}`}>{texto}</div>;
}

export function FormRespuesta({ v, offset = 0, onEnviar, onCancelar, onPasar, error }) {
  const [texto, setTexto] = useState('');
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus(); }, []);
  const fila = v.filas[Math.floor(v.celda / 3)];
  const col = v.columnas[v.celda % 3];
  return (
    <form className="fgp-tarjeta fgp-respuesta" onSubmit={(e) => { e.preventDefault(); if (texto.trim()) onEnviar(texto); }}>
      <p className="fgp-etiqueta">Un futbolista que cumpla…</p>
      <div className="fgp-requisitos"><span>{fila}</span><b>+</b><span>{col}</span></div>
      <input ref={ref} className="fgp-input" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Nombre del futbolista"
        autoComplete="off" autoCorrect="off" spellCheck={false} maxLength={60} />
      {error && <p className="fgp-error">{error}</p>}
      <p className="fgp-pista">Vale el apellido o el nombre por el que se le conoce. No se puede repetir un futbolista del tablero.</p>
      <div className="fgp-dos">
        <button type="button" className="fgp-boton secundario" onClick={onCancelar}>Otra casilla</button>
        <button type="submit" className="fgp-boton" disabled={!texto.trim()}><Icon name="check" size={20} /> Responder</button>
      </div>
      <button type="button" className="fgp-enlace oscuro" onClick={onPasar}>⏭️ No sé ninguno: pasar turno</button>
    </form>
  );
}

/** Reloj del turno: corre desde que empieza el turno, se elija casilla o no. */
function RelojTurno({ v, offset }) {
  const restante = useRestante(v.hasta, offset);
  const pct = Math.max(0, Math.min(100, (restante / AJUSTES.segTurno) * 100));
  return (
    <div className={`fgp-tarjeta fgp-reloj-turno fgp-cuenta${restante <= 15 ? ' critico' : ''}`}>
      <span>⏱️ Turno del equipo {EQUIPOS[v.turno].nombre}</span>
      <div className="fgp-cuenta-barra"><span style={{ width: `${pct}%` }} /></div>
      <strong>{Math.ceil(restante)}s</strong>
    </div>
  );
}

/**
 * Partida en juego. `miEquipo` dice si quien mira puede jugar ahora (en un dispositivo, siempre).
 */
export function PantallaJuego({ v, enviar, onSalir, offset = 0, miEquipo, nombreTurno, error, admin }) {
  const eq = EQUIPOS[v.turno];
  const fila = v.celda != null ? v.filas[Math.floor(v.celda / 3)] : null;
  const col = v.celda != null ? v.columnas[v.celda % 3] : null;
  const titulo = miEquipo
    ? (v.fase === 'elegir' ? 'Elige una casilla' : '¡Di un futbolista!')
    : `Juega el equipo ${eq.nombre}`;
  return (
    <>
      <Hero v={v} onSalir={onSalir} etiqueta={nombreTurno || `Turno del equipo ${eq.nombre}`} titulo={titulo} clase={miEquipo ? `mio eq-${v.turno}` : ''} />
      <RelojTurno v={v} offset={offset} />
      <Ultimo v={v} />
      <Tablero v={v} puedeElegir={miEquipo && v.fase === 'elegir'} onElegir={(i) => enviar('casilla', { celda: i })} />
      {v.fase === 'responder' && miEquipo && (
        <FormRespuesta key={`${v.hasta}-${v.celda}`} v={v} offset={offset} error={error}
          onEnviar={(t) => enviar('responder', { respuesta: t })}
          onCancelar={() => enviar('cancelar')} onPasar={() => enviar('pasar')} />
      )}
      {v.fase === 'responder' && !miEquipo && (
        <EsperaRival v={v} offset={offset} fila={fila} col={col} />
      )}
      {v.fase === 'elegir' && miEquipo && (
        <div className="fgp-barra estatica">
          <button type="button" className="fgp-enlace" onClick={() => enviar('pasar')}>⏭️ Pasar turno</button>
        </div>
      )}
      {v.fase === 'elegir' && !miEquipo && <p className="fgp-esperando">⏳ El equipo {eq.nombre} está eligiendo casilla…</p>}
      <Equipos jugadores={v.jugadores} turno={v.turno} yoId={v.yo?.id} fase={v.fase} />
      {admin?.esAdmin && (
        <div className="fgp-barra estatica">
          <div className="fgp-dos">
            {admin.atascado && <button type="button" className="fgp-enlace" onClick={admin.onForzar}><Icon name="forward" size={15} /> Saltar turno</button>}
            <button type="button" className="fgp-enlace" onClick={() => enviar('terminar')}>🏳️ Rendirse y ver soluciones</button>
          </div>
        </div>
      )}
    </>
  );
}

function EsperaRival({ v, fila, col }) {
  return (
    <div className="fgp-tarjeta fgp-centro">
      <span className="fgp-carga" aria-hidden="true">🤔</span>
      <p className="fgp-texto">El equipo <strong>{EQUIPOS[v.turno].nombre}</strong> busca un futbolista para <strong>{fila}</strong> + <strong>{col}</strong>.</p>
    </div>
  );
}

export function PantallaFin({ v, onSalir, children }) {
  const g = v.fin.ganador;
  return (
    <>
      <Hero v={v} onSalir={onSalir} etiqueta="Fin de la partida" titulo={g ? `¡Gana el equipo ${EQUIPOS[g].nombre}!` : v.fin.rendicion ? 'Os habéis rendido' : '¡Empate!'} clase={`fin${g ? ` eq-${g}` : ''}`} />
      <Tablero v={v} puedeElegir={false} onElegir={() => {}} />
      {v.fin.ejemplos.some(Boolean) && (
        <div className="fgp-tarjeta">
          <p className="fgp-etiqueta">{v.fin.rendicion ? '🏳️ Os habéis rendido · ' : ''}Respuestas posibles en las casillas libres</p>
          <ul className="fgp-soluciones">
            {v.fin.ejemplos.map((e, i) => e && (
              <li key={i}>
                <p className="fgp-sol-cats"><span>{v.filas[Math.floor(i / 3)]}</span><b>+</b><span>{v.columnas[i % 3]}</span></p>
                <p className="fgp-sol-nombres">
                  {e.nombres.length ? e.nombres.join(' · ') : 'Ya se habían usado todas las respuestas posibles.'}
                  {e.total > e.nombres.length && <small> y {e.total - e.nombres.length} más</small>}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
      <Equipos jugadores={v.jugadores} turno={null} yoId={v.yo?.id} fase="fin" />
      {children}
    </>
  );
}

export function ModalSalir({ titulo, texto, onSeguir, onSalir }) {
  return (
    <div className="rg-modal-fondo" onClick={onSeguir}>
      <div className="rg-modal fgp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="fgp-modal-icono">🚪</div>
        <h3>{titulo}</h3>
        <p className="hint">{texto}</p>
        <div className="fgp-dos">
          <button type="button" className="fgp-boton secundario" onClick={onSeguir}>Seguir</button>
          <button type="button" className="fgp-boton peligro" onClick={onSalir}>Salir</button>
        </div>
      </div>
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
            <li>Dos equipos: <strong>Azul ✕</strong> y <strong>Rojo ◯</strong>. Cada fila y cada columna del tablero es una categoría.</li>
            <li>Cada equipo tiene {AJUSTES.segTurno} segundos por turno para elegir una casilla libre y decir un futbolista que cumpla la categoría de su fila y la de su columna (puede cambiar de casilla sin que se pare el reloj).</li>
            <li>Si acierta, la casilla es suya. Acierte o falle, el turno pasa al otro equipo. Un futbolista no puede repetirse en el tablero.</li>
            <li>Gana el primero que hace <strong>tres en raya</strong>. Si se llena el tablero sin raya, es empate.</li>
            <li>Si nadie consigue la raya, podéis <strong>rendiros</strong>: se desvelan futbolistas válidos para cada casilla libre.</li>
            <li>Vale el apellido o el nombre por el que se conoce al jugador, y se perdonan tildes y pequeñas erratas.</li>
          </ul>
        </div>
        <button type="button" className="big full qq-btn-principal" onClick={onCerrar}>¡Entendido!</button>
      </div>
    </div>
  );
}
