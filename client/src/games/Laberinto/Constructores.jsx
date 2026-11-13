// client/src/games/Laberinto/Constructores.jsx
// «El Laberinto · Constructores y corredores»: editor, carrera con niebla y resultados (online y en un dispositivo).
// Motor en ./constructores.js (copia del servidor).
import { useRegistrarPartida, resultadoDesdeFin } from '../../lib/registros.js';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import * as E from './constructores.js';
import { Cuenta, useRestante, Pildoras, colorDe, ModalSalir, TurnoDe, AvisoTurno } from '../Pulsador/Vistas.jsx';
import { BloqueConfig, SelectorJugadores } from '../../components/MenuJuego.jsx';
import { limitesLocal } from '../limites.js';

const LIM_JUG = limitesLocal('constructores');

const L = E.AJUSTES.lado;
const nombreDe = (v, id) => v.jugadores.find((j) => j.id === id)?.nombre ?? '¿?';
const FLECHA = { N: '⬆', E: '➡', S: '⬇', O: '⬅' };
const SIG = { N: 'E', E: 'S', S: 'O', O: 'N' };
const xy = (i) => [i % L, Math.floor(i / L)];
const s1 = (n) => `${(Math.round(n * 10) / 10).toLocaleString('es-ES')} s`;

/** Camino más corto (casillas) con la física del juego, para enseñar la solución. */
function caminoCorto(lab) {
  const prev = new Map([[E.INICIO, null]]); const cola = [E.INICIO];
  while (cola.length) {
    const c = cola.shift(); if (c === E.META) break;
    Object.keys(E.DIRS).forEach((d) => { const n = E.mover(lab, c, d); if (!prev.has(n)) { prev.set(n, c); cola.push(n); } });
  }
  if (!prev.has(E.META)) return [];
  const r = []; let c = E.META; while (c != null) { r.unshift(c); c = prev.get(c); } return r;
}

/** Tablero 9×9. ocultas: casillas en niebla. camino: casillas recorridas (se marcan). */
function Tablero({ lab, pos = null, ocultas = null, camino = null, onTocar, chico = false }) {
  const enCamino = useMemo(() => new Set(camino || []), [camino]);
  return (
    <div className={`lbc-tablero${chico ? ' chico' : ''}${onTocar ? ' editable' : ''}`}>
      {Array.from({ length: L * L }, (_, c) => {
        const t = lab[c];
        const oculta = ocultas?.has(c);
        const clase = oculta ? 'niebla' : t === 'muro' ? 'muro' : t === 'hielo' ? 'hielo' : t === 'portal' ? 'portal' : E.DIRS[t] ? 'flecha' : '';
        const contenido = oculta ? '' : c === pos ? '🏃' : c === E.INICIO ? '🚩' : c === E.META ? '🏁' : t === 'portal' ? '🌀' : E.DIRS[t] ? FLECHA[t] : t === 'hielo' ? '❄' : '';
        return (
          <button key={c} type="button" className={`lbc-celda ${clase}${enCamino.has(c) && !oculta ? ' camino' : ''}${c === pos ? ' yo' : ''}`}
            disabled={!onTocar} onClick={onTocar ? () => onTocar(c) : undefined} tabIndex={onTocar ? 0 : -1}>{contenido}</button>
        );
      })}
    </div>
  );
}

const HERRAMIENTAS = [
  ['muro', '🧱', 'Muro'], ['hielo', '🧊', 'Hielo'], ['flecha', '➡️', 'Flecha'], ['portal', '🌀', 'Portal'], ['borrar', '🧽', 'Borrar']
];

/** Editor: cada herramienta tiene su presupuesto; el laberinto tiene que tener salida. */
function Editor({ v, enviar, inicial }) {
  const [lab, setLab] = useState(() => ({ ...(inicial || {}) }));
  const [herr, setHerr] = useState('muro');
  const [verCamino, setVerCamino] = useState(false);
  const c = E.cuenta(lab);
  const val = E.validar(lab);
  const sinSalida = E.resolver(lab) == null;
  const tocar = (i) => {
    if (i === E.INICIO || i === E.META) return;
    setLab((l) => {
      const n = { ...l };
      const t = n[i];
      if (herr === 'borrar') { delete n[i]; return n; }
      if (herr === 'flecha' && E.DIRS[t]) { n[i] = SIG[t]; return n; } // girar la flecha
      if (t === (herr === 'flecha' ? null : herr)) { delete n[i]; return n; } // tocar de nuevo la misma pieza la quita
      const tipo = herr;
      const usadas = E.cuenta(n)[tipo] - (t && (E.DIRS[t] ? 'flecha' : t) === tipo ? 1 : 0);
      if (usadas >= v.presupuesto[tipo]) return l;
      n[i] = tipo === 'flecha' ? 'E' : tipo;
      return n;
    });
  };
  return (
    <>
      <div className="pzp-tarjeta lbc-editor">
        <p className="lbc-para">Construyes para <b style={{ color: colorDe(v.yo.construyePara) }}>{nombreDe(v, v.yo.construyePara)}</b>: hazlo sufrir 😈</p>
        <div className="lbc-herramientas">
          {HERRAMIENTAS.map(([k, e, n]) => (
            <button key={k} type="button" className={herr === k ? 'on' : ''} onClick={() => setHerr(k)}>
              <span>{e}</span><b>{n}</b>{k !== 'borrar' && <small>{v.presupuesto[k] - c[k]}</small>}
            </button>
          ))}
        </div>
        <Tablero lab={lab} camino={verCamino && !sinSalida ? caminoCorto(lab) : null} onTocar={tocar} />
        <p className="lbc-pista">{herr === 'flecha' ? 'Toca una flecha para girarla. ' : ''}🧊 resbalas hasta chocar · ➡️ te empuja · 🌀 te lleva al otro portal</p>
        <p className={`lbc-valido${val.ok ? ' ok' : ' mal'}`}>{val.ok ? `✅ Tiene salida: el camino más corto son ${val.pasos} movimientos` : `❌ ${val.error}`}</p>
        <div className="pzp-dos">
          <button type="button" className="pzp-boton secundario" onClick={() => setVerCamino((x) => !x)} disabled={sinSalida}>👁️ {verCamino ? 'Ocultar' : 'Ver'} camino</button>
          <button type="button" className="pzp-boton secundario" onClick={() => setLab({})}>🗑️ Vaciar</button>
        </div>
        <button type="button" className="pzp-boton grande" disabled={!val.ok} onClick={() => enviar('entregar', { lab })}><Icon name="check" size={20} /> Entregar laberinto</button>
      </div>
    </>
  );
}

const ATAJO = { ArrowUp: 'N', ArrowRight: 'E', ArrowDown: 'S', ArrowLeft: 'O' };

/** Carrera: niebla alrededor, movimiento por gestos, flechas o teclado. inicio: hora de salida (reloj de la sala). */
function Corredor({ v, lab, inicio, offset = 0, onLlegar, onPos, onRendirse }) {
  const [pos, setPos] = useState(E.INICIO);
  const [movs, setMovs] = useState([]);
  const [vistos, setVistos] = useState(() => new Set());
  const [ahora, setAhora] = useState(Date.now() + offset);
  const [fin, setFin] = useState(false);
  const toque = useRef(null);
  useEffect(() => { const t = setInterval(() => setAhora(Date.now() + offset), 100); return () => clearInterval(t); }, [offset]);
  const radio = v.niebla ? v.vision : 99;
  const cerca = useMemo(() => {
    const s = new Set(); const [px, py] = xy(pos);
    for (let c = 0; c < L * L; c++) { const [x, y] = xy(c); if (Math.abs(x - px) + Math.abs(y - py) <= radio) s.add(c); }
    return s;
  }, [pos, radio]);
  useEffect(() => { setVistos((s) => { const n = new Set(s); cerca.forEach((c) => n.add(c)); return n; }); }, [cerca]);
  const empezado = ahora >= inicio;
  const mover = (d) => {
    if (!empezado || fin) return;
    const n = E.mover(lab, pos, d);
    if (n === pos) return;
    const m = [...movs, d];
    setPos(n); setMovs(m);
    if (n === E.META) { setFin(true); onLlegar(m, (ahora - inicio) / 1000); }
  };
  useEffect(() => { onPos?.(pos); }, [pos]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const k = (e) => { if (ATAJO[e.key]) { e.preventDefault(); mover(ATAJO[e.key]); } };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  });
  const ocultas = new Set();
  for (let c = 0; c < L * L; c++) if (!vistos.has(c) && !cerca.has(c)) ocultas.add(c);
  const empezar = (e) => { const t = e.touches ? e.touches[0] : e; toque.current = [t.clientX, t.clientY]; };
  const soltar = (e) => {
    if (!toque.current) return;
    const t = e.changedTouches ? e.changedTouches[0] : e;
    const dx = t.clientX - toque.current[0]; const dy = t.clientY - toque.current[1];
    toque.current = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) return;
    mover(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'E' : 'O') : (dy > 0 ? 'S' : 'N'));
  };
  const cuenta = Math.ceil((inicio - ahora) / 1000);
  return (
    <div className="pzp-tarjeta lbc-carrera">
      <div className="lbc-crono"><span>⏱️ {empezado ? s1((ahora - inicio) / 1000) : '0 s'}</span><small>{movs.length} movimientos</small></div>
      <div className="lbc-pista-tactil" onTouchStart={empezar} onTouchEnd={soltar} onMouseDown={empezar} onMouseUp={soltar}>
        <Tablero lab={lab} pos={pos} ocultas={ocultas} />
        {!empezado && <div className="lbc-cuenta" key={cuenta}>{cuenta > 0 ? cuenta : '¡Ya!'}</div>}
      </div>
      <div className="lbc-mando">
        <span />
        <button type="button" onClick={() => mover('N')} aria-label="Arriba">⬆</button>
        <span />
        <button type="button" onClick={() => mover('O')} aria-label="Izquierda">⬅</button>
        <button type="button" onClick={() => mover('S')} aria-label="Abajo">⬇</button>
        <button type="button" onClick={() => mover('E')} aria-label="Derecha">➡</button>
      </div>
      <p className="lbc-pista">Desliza el dedo sobre el laberinto o usa las flechas. Llega a la 🏁.</p>
      {!fin && empezado && <button type="button" className="pzp-enlace oscuro" onClick={onRendirse}>🏳️ Me rindo</button>}
    </div>
  );
}

function Resultados({ v }) {
  return (
    <div className="lbc-resultados">
      {v.resultados.map((r) => (
        <article key={r.corredor} className="pzp-tarjeta lbc-res">
          <header>
            <span><b style={{ color: colorDe(r.constructor) }}>{nombreDe(v, r.constructor)}</b> construyó para <b style={{ color: colorDe(r.corredor) }}>{nombreDe(v, r.corredor)}</b>{r.auto ? ' (al azar: no entregó a tiempo)' : ''}</span>
          </header>
          <Tablero lab={r.lab} camino={r.camino} chico />
          <div className="lbc-res-datos">
            <span className={r.tiempo == null ? 'mal' : ''}>⏱️ {r.tiempo == null ? 'No llegó' : s1(r.tiempo)}</span>
            <span>📏 mínimo {r.pasos} mov.</span>
            <span className="pts">🏃 +{r.ptsCorredor} {nombreDe(v, r.corredor)}</span>
            <span className="pts">🧱 +{r.ptsConstructor} {nombreDe(v, r.constructor)}</span>
          </div>
        </article>
      ))}
    </div>
  );
}

function Marcador({ v }) {
  const t = [...v.jugadores].sort((a, b) => b.puntos - a.puntos);
  return <div className="lbc-marcador">{t.map((j) => <span key={j.id} style={{ '--c': colorDe(j.id) }}><b>{j.nombre}</b> {j.puntos}</span>)}</div>;
}

function Cabecera({ v, onSalir, titulo, etiqueta }) {
  return (
    <header className="pzp-hero lbc-hero">
      <span className="pzp-hero-fondo" aria-hidden="true">🧱</span>
      <div className="pzp-hero-top">
        <button type="button" className="pzp-salir" onClick={onSalir}><Icon name="door" size={15} /> Salir</button>
        <span className="pzp-chip">🧱 Ronda {v.ronda}/{v.rondas}</span>
      </div>
      <p className="pzp-hero-etiqueta">{etiqueta}</p>
      <h1 className="pzp-hero-titulo">{titulo}</h1>
      <Marcador v={v} />
    </header>
  );
}

/** La partida online (cada uno con su móvil). */
export function PartidaOnline({ v, sala, enviar, offset = 0, onSalir }) {
  const restante = useRestante(v.hasta, offset);
  const yo = v.yo;
  const ultimaPos = useRef({ pos: null, enviada: null, t: 0, timer: null });
  if (!yo) return null;
  let cuerpo; let titulo; let etiqueta;
  if (v.fase === 'construir') {
    etiqueta = 'Fase de construcción';
    if (yo.entregado) {
      titulo = '¡Laberinto entregado!';
      const faltan = v.entregas.filter((e) => !e.listo).map((e) => nombreDe(v, e.constructor));
      cuerpo = (
        <div className="pzp-tarjeta">
          <Tablero lab={yo.miLab} chico />
          <p className="pzp-esperando-txt">⏳ Esperando a: {faltan.join(', ')}</p>
          <button type="button" className="pzp-enlace oscuro" onClick={() => enviar('retirar')}>✏️ Seguir retocando</button>
        </div>
      );
    } else {
      titulo = 'Construye un laberinto';
      cuerpo = <Editor key={`e${v.ronda}`} v={v} enviar={enviar} inicial={yo.miLab} />;
    }
  } else if (v.fase === 'carrera') {
    etiqueta = 'Fase de carrera';
    const c = yo.corre;
    titulo = c?.llego ? (c.tiempo != null ? `¡Llegaste en ${s1(c.tiempo)}!` : 'Te has rendido') : '¡Corre!';
    cuerpo = (
      <>
        {c && !c.llego && (
          <Corredor key={`c${v.ronda}`} v={v} lab={c.lab} inicio={v.inicio} offset={offset}
            onLlegar={(movs) => enviar('llegar', { movs })}
            onPos={(pos) => {
              // Como mucho una vez cada medio segundo (y la última posición siempre llega)
              const u = ultimaPos.current;
              u.pos = pos;
              if (u.timer) return;
              const mandar = () => { u.timer = null; if (u.enviada !== u.pos) { u.enviada = u.pos; u.t = Date.now(); enviar('pos', { pos: u.pos }); } };
              const espera = 500 - (Date.now() - u.t);
              if (espera <= 0) mandar(); else u.timer = setTimeout(mandar, espera);
            }}
            onRendirse={() => enviar('rendirse')} />
        )}
        <div className="pzp-tarjeta">
          <p className="pzp-etiqueta">Cómo van los demás</p>
          <ul className="lbc-progreso">
            {v.carrera.map((e) => {
              const [x, y] = xy(e.pos);
              const pct = e.llego ? 100 : Math.round(((x + y) / (2 * (L - 1))) * 100);
              return (
                <li key={e.corredor} style={{ '--c': colorDe(e.corredor), '--p': `${pct}%` }}>
                  <b>{nombreDe(v, e.corredor)}</b>
                  <span className="barra"><i /></span>
                  <small>{e.llego ? (e.tiempo != null ? `🏁 ${s1(e.tiempo)}` : '🏳️') : `${pct} %`}</small>
                </li>
              );
            })}
          </ul>
        </div>
      </>
    );
  } else {
    etiqueta = `Resultados de la ronda ${v.ronda}`;
    titulo = 'Así ha ido';
    cuerpo = (
      <>
        <Resultados v={v} />
        <div className="pzp-barra estatica">
          {sala.esAdmin ? <button type="button" className="pzp-boton grande" onClick={() => enviar('siguiente')}><Icon name="play" size={20} /> {v.ronda >= v.rondas ? 'Ver la clasificación final' : 'Siguiente ronda'}</button>
            : <p className="pzp-esperando">⏳ El anfitrión pasará a la siguiente ronda…</p>}
        </div>
      </>
    );
  }
  return (
    <>
      <Cabecera v={v} onSalir={onSalir} titulo={titulo} etiqueta={etiqueta} />
      <AvisoTurno clave={v.fase === 'carrera' ? `c${v.ronda}` : v.fase === 'construir' ? `b${v.ronda}` : null} emoji={v.fase === 'carrera' ? '🏃' : '🧱'}
        texto={v.fase === 'carrera' ? '¡A correr!' : `Ronda ${v.ronda}`} sub={v.fase === 'carrera' ? 'Recorre el laberinto que te han hecho.' : 'Construye un laberinto para tu rival.'} />
      {v.hasta && v.fase !== 'resultados' && <Cuenta ms={restante} total={v.segundos * 1000} />}
      {cuerpo}
      {sala.esAdmin && v.fase !== 'resultados' && <div className="pzp-barra estatica"><button type="button" className="pzp-enlace" onClick={() => enviar('terminar')}>Terminar la partida ya</button></div>}
    </>
  );
}

export function Fin({ v, onSalir, children }) {
  useRegistrarPartida('laberinto', resultadoDesdeFin(v));
  const f = v.fin;
  const g = f.ganadores.map((id) => nombreDe(v, id));
  return (
    <>
      <header className="pzp-hero acierto lbc-hero">
        <span className="pzp-hero-fondo" aria-hidden="true">🏆</span>
        <div className="pzp-hero-top">
          <button type="button" className="pzp-salir" onClick={onSalir}><Icon name="door" size={15} /> Salir</button>
          <span className="pzp-chip">🧱 Fin</span>
        </div>
        <p className="pzp-hero-etiqueta">Constructores y corredores</p>
        <h1 className="pzp-hero-titulo">{g.length > 1 ? `¡Empate entre ${g.join(' y ')}!` : g.length ? `¡${g[0]} domina el laberinto!` : 'Fin de la partida'}</h1>
      </header>
      <div className="pzp-tarjeta">
        <p className="pzp-etiqueta">Clasificación · 🏃 como corredor · 🧱 como constructor</p>
        <ol className="lbc-final">
          {f.tabla.map((t) => (
            <li key={t.id} className={f.ganadores.includes(t.id) ? 'gana' : ''} style={{ '--c': colorDe(t.id) }}>
              <span className="pzp-pos">{t.puesto}</span><b>{t.nombre}</b>
              <small>🏃 {t.ptsCorredor} · 🧱 {t.ptsConstructor}</small><strong>{t.puntos}</strong>
            </li>
          ))}
        </ol>
      </div>
      {children}
    </>
  );
}

export function Config({ config, onCambiar }) {
  const c = (k) => onCambiar && ((x) => onCambiar({ [k]: x }));
  return (
    <>
      <BloqueConfig titulo="Rondas">
        <Pildoras opciones={E.OPCIONES.rondas.map((n) => [n, `${n} rondas`])} valor={config.rondas} onCambiar={c('rondas')} />
      </BloqueConfig>
      <BloqueConfig titulo="Tiempo para construir (online)">
        <Pildoras opciones={E.OPCIONES.segConstruir.map((n) => [n, `${n} s`])} valor={config.segConstruir} onCambiar={c('segConstruir')} />
      </BloqueConfig>
      <BloqueConfig titulo="Tiempo máximo de carrera">
        <Pildoras opciones={E.OPCIONES.segCarrera.map((n) => [n, `${n} s`])} valor={config.segCarrera} onCambiar={c('segCarrera')} />
      </BloqueConfig>
      <BloqueConfig titulo="Niebla al correr">
        <Pildoras opciones={[[true, '🌫️ Con niebla'], [false, '☀️ Sin niebla']]} valor={config.niebla} onCambiar={c('niebla')} />
      </BloqueConfig>
    </>
  );
}

/** Un solo dispositivo: se construye por turnos y luego cada uno corre su laberinto con el móvil en la mano. */
export function Local({ juego, onVolver, onExit, onAbrirAyuda }) {
  const [paso, setPaso] = useState('config');
  const [nombres, setNombres] = useState(() => Array(LIM_JUG.min).fill(''));
  const [config, setConfig] = useState({ rondas: 3, segConstruir: 90, segCarrera: 90, niebla: true });
  const [error, setError] = useState('');
  const [modal, setModal] = useState(false);
  const [confirmado, setConfirmado] = useState(null);
  const [salida, setSalida] = useState(null);
  const estRef = useRef(null);
  const [, setVer] = useState(0);
  const refrescar = () => setVer((x) => x + 1);
  const empezar = () => {
    const limpios = nombres.map((n) => n.trim());
    if (limpios.some((n) => !n)) return setError('Todos los jugadores necesitan un nombre.');
    if (new Set(limpios.map((n) => n.toLowerCase())).size !== limpios.length) return setError('Hay nombres repetidos.');
    setError('');
    estRef.current = E.crearPartida(limpios.map((nombre, i) => ({ id: i + 1, nombre })), { ...config, sinReloj: true }, Date.now());
    setConfirmado(null);
    setPaso('juego');
    return undefined;
  };
  if (paso === 'config') {
    return (
      <div className={`pzp-contenedor ${juego.id}`}>
        <SelectorJugadores onVolver={onVolver} onAyuda={onAbrirAyuda} min={LIM_JUG.min} max={LIM_JUG.max} numJugadores={nombres.length}
          onCambiarNum={(n) => setNombres((l) => (n > l.length ? [...l, ...Array(n - l.length).fill('')] : l.slice(0, n)))}
          nombres={nombres} onNombre={(i, valor) => setNombres((l) => l.map((x, k) => (k === i ? valor : x)))}
          onEmpezar={empezar} textoBoton="¡A construir!" error={error}>
          <Config config={config} onCambiar={(c) => setConfig((x) => ({ ...x, ...c }))} />
        </SelectorJugadores>
      </div>
    );
  }
  const est = estRef.current;
  const salir = modal && <ModalSalir titulo="¿Salir de la partida?" texto="Se perderá la partida en curso y volverás a la portada." onSeguir={() => setModal(false)} onSalir={() => { setModal(false); onExit?.(); }} />;
  const envoltorio = (c) => (
    <div className={`pzp-contenedor ${juego.id} qq-en-partida`}>
      <section className="game pzp-escena">{c}</section>
      {salir}
    </div>
  );
  const onSalir = () => setModal(true);
  if (est.fase === 'fin') {
    return envoltorio(
      <Fin v={E.vistaDe(est, -1)} onSalir={onSalir}>
        <div className="pzp-barra estatica">
          <button type="button" className="pzp-boton grande" onClick={() => setPaso('config')}><Icon name="refresh" size={20} /> Otra partida</button>
          <button type="button" className="pzp-boton secundario" onClick={() => onExit?.()}><Icon name="door" size={18} /> Salir a la portada</button>
        </div>
      </Fin>
    );
  }
  if (est.fase === 'resultados') {
    const v = E.vistaDe(est, -1);
    return envoltorio(
      <>
        <Cabecera v={v} onSalir={onSalir} titulo="Así ha ido" etiqueta={`Resultados de la ronda ${v.ronda}`} />
        <Resultados v={v} />
        <div className="pzp-barra estatica"><button type="button" className="pzp-boton grande" onClick={() => { E.siguiente(est); setConfirmado(null); refrescar(); }}><Icon name="play" size={20} /> {v.ronda >= v.rondas ? 'Ver la clasificación final' : 'Siguiente ronda'}</button></div>
      </>
    );
  }
  if (est.fase === 'construir') {
    const e = est.encargos.find((x) => !x.lab);
    const v = E.vistaDe(est, e.constructor);
    const clave = `b${est.ronda}-${e.constructor}`;
    if (confirmado !== clave) {
      return envoltorio(<TurnoDe juego={juego} onSalir={() => setModal(true)} v={v} id={e.constructor} puedo onListo={() => setConfirmado(clave)} boton={`Soy ${nombreDe(v, e.constructor)}`}
        texto={`Pásale el móvil: va a construir en secreto un laberinto para ${nombreDe(v, e.corredor)}. ¡Que no mire!`} />);
    }
    return envoltorio(
      <>
        <Cabecera v={v} onSalir={onSalir} titulo="Construye un laberinto" etiqueta="Fase de construcción" />
        <Editor key={clave} v={v} enviar={(tipo, d) => { if (tipo === 'entregar') { const r = E.entregar(est, e.constructor, d.lab); if (r.ok) refrescar(); } }} />
      </>
    );
  }
  // Carrera: de uno en uno
  const e = est.encargos.find((x) => !x.llego);
  const v = E.vistaDe(est, e.corredor);
  const clave = `c${est.ronda}-${e.corredor}`;
  if (confirmado !== clave) {
    return envoltorio(<TurnoDe juego={juego} onSalir={() => setModal(true)} v={v} id={e.corredor} puedo onListo={() => { setConfirmado(clave); setSalida(Date.now() + E.AJUSTES.segCuenta * 1000); }} boton={`Soy ${nombreDe(v, e.corredor)}: ¡a correr!`}
      texto={`Pásale el móvil: va a recorrer el laberinto que le ha hecho ${nombreDe(v, e.constructor)}. Tiene ${est.segCarrera} s.`} />);
  }
  return envoltorio(
    <>
      <Cabecera v={v} onSalir={onSalir} titulo="¡Corre!" etiqueta={`Laberinto de ${nombreDe(v, e.constructor)}`} />
      <CarreraLocal key={clave} v={v} est={est} e={e} salida={salida} onFin={refrescar} />
    </>
  );
}

function CarreraLocal({ v, est, e, salida, onFin }) {
  const restante = useRestante(salida + est.segCarrera * 1000, 0);
  useEffect(() => { if (restante <= 0 && !e.llego) { E.rendirse(est, e.corredor); onFin(); } }, [restante]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <>
      <Cuenta ms={restante} total={est.segCarrera * 1000} />
      <Corredor v={v} lab={e.lab} inicio={salida}
        onLlegar={(movs, t) => { E.llegar(est, e.corredor, movs, Date.now(), t); setTimeout(onFin, 900); }}
        onRendirse={() => { E.rendirse(est, e.corredor); onFin(); }} />
    </>
  );
}

export const JUEGO_CONSTRUCTORES = {
  id: 'constructores',
  api: '/api/constructores',
  emoji: '🧱',
  config: { rondas: 3, segConstruir: 90, segCarrera: 90, niebla: true },
  Local,
  Partida: PartidaOnline,
  Fin,
  Config,
  notaSala: '🧱 De 2 a 8 jugadores: cada ronda construyes para un rival y corres el laberinto que te hacen.',
  ganador: (n) => (n.length > 1 ? `¡Empate entre ${n.join(' y ')}!` : `¡${n[0]} domina el laberinto!`),
  reglas: [
    `Cada ronda tiene dos fases. Primero, CONSTRUIR: diseñas en secreto un laberinto de ${L}×${L} para otro jugador, de 🚩 a 🏁, con ${E.AJUSTES.presupuesto.muro} muros 🧱, ${E.AJUSTES.presupuesto.hielo} casillas de hielo 🧊, ${E.AJUSTES.presupuesto.flecha} flechas ➡️ y un par de portales 🌀. Tiene que tener salida (la pantalla te lo comprueba).`,
    'Hielo: al pisarlo resbalas hasta chocar. Flecha: te empuja en su dirección. Portal: apareces en el otro portal.',
    'Después, CARRERA: todos recorréis a la vez el laberinto que os han hecho, deslizando el dedo o con las flechas. Con niebla solo ves las casillas cercanas.',
    `Puntos por puestos (${E.AJUSTES.puntos.join(', ')}…): el corredor más rápido suma más, y el constructor cuyo laberinto más tarda en resolverse, también. Quien no llega cuenta con el tiempo máximo.`,
    'Cada ronda construyes para un rival distinto. Gana quien más puntos tenga al final.'
  ]
};
