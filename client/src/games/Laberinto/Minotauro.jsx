// client/src/games/Laberinto/Minotauro.jsx
// «El Laberinto · El Minotauro»: pantallas online y en un dispositivo. Motor en ./minotauro.js (copia del servidor).
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import * as E from './minotauro.js';
import { Cuenta, useRestante, Pildoras, colorDe, ModalSalir, TurnoDe, AvisoTurno } from '../Pulsador/Vistas.jsx';
import { BloqueConfig, SelectorJugadores } from '../../components/MenuJuego.jsx';
import { limitesLocal } from '../limites.js';

const LIM_JUG = limitesLocal('minotauro');

const ROL = {
  explorador: { e: '🧭', n: 'Explorador', t: 'Busca las llaves y escapa' },
  minotauro: { e: '🐂', n: 'El Minotauro', t: 'Caza a los exploradores' },
  ayudante: { e: '👹', n: 'Ayudante del Minotauro', t: 'Te han atrapado: ahora cazas tú' }
};
const nombreDe = (v, id) => v.jugadores.find((j) => j.id === id)?.nombre ?? '¿?';
const C = 30; // tamaño de casilla en el SVG
const xy = (L, i) => [i % L, Math.floor(i / L)];

/** Mapa del laberinto con niebla: casillas conocidas, paredes, objetos, piezas y el recorrido que planeas. */
function Mapa({ v, ruta = [], onTocar, tocables = new Set() }) {
  const L = v.L;
  const conocidas = useMemo(() => new Set(v.celdas), [v.celdas]);
  const vistas = useMemo(() => (v.vistas ? new Set(v.vistas) : null), [v.vistas]);
  const yo = v.yo;
  const paredes = [];
  v.celdas.forEach((c) => {
    const [x, y] = xy(L, c);
    const ab = new Set(v.abiertos[c] || []);
    const X = x * C; const Y = y * C;
    if (!ab.has(c - L)) paredes.push(<line key={`n${c}`} x1={X} y1={Y} x2={X + C} y2={Y} />);
    if (!ab.has(c + L)) paredes.push(<line key={`s${c}`} x1={X} y1={Y + C} x2={X + C} y2={Y + C} />);
    if (x === 0 || !ab.has(c - 1)) paredes.push(<line key={`o${c}`} x1={X} y1={Y} x2={X} y2={Y + C} />);
    if (x === L - 1 || !ab.has(c + 1)) paredes.push(<line key={`e${c}`} x1={X + C} y1={Y} x2={X + C} y2={Y + C} />);
  });
  const centro = (c) => { const [x, y] = xy(L, c); return [x * C + C / 2, y * C + C / 2]; };
  const emoji = (c, e, tam = 17, k = e) => { const [cx, cy] = centro(c); return <text key={`${k}${c}`} x={cx} y={cy + tam * 0.36} textAnchor="middle" fontSize={tam}>{e}</text>; };
  const camino = [yo?.pos, ...ruta].filter((x) => x != null);
  return (
    <svg className="lbm-mapa" viewBox={`-3 -3 ${L * C + 6} ${L * C + 6}`} role="img" aria-label="Mapa del laberinto">
      <rect x="-3" y="-3" width={L * C + 6} height={L * C + 6} fill="#020617" rx="8" />
      {Array.from({ length: L * L }, (_, c) => {
        const [x, y] = xy(L, c);
        const conocida = conocidas.has(c);
        const viendo = !vistas || vistas.has(c);
        const toca = tocables.has(c);
        return (
          <rect key={c} x={x * C} y={y * C} width={C} height={C}
            className={`lbm-celda${conocida ? (viendo ? ' luz' : ' recuerdo') : ''}${toca ? ' toca' : ''}`}
            onClick={toca ? () => onTocar(c) : undefined} />
        );
      })}
      <g className="lbm-paredes">{paredes}</g>
      {v.salidas.map((c) => emoji(c, v.salidasAbiertas ? '🚪' : '🔒', 18, 's'))}
      {v.llaves.map((c) => emoji(c, '🔑', 17, 'k'))}
      {v.antorchas.map((c) => emoji(c, '🔦', 15, 'a'))}
      {v.trampas.map((c) => emoji(c, '🪤', 13, 't'))}
      {camino.length > 1 && (
        <polyline className="lbm-ruta" points={camino.map((c) => centro(c).join(',')).join(' ')} />
      )}
      {ruta.map((c, i) => { const [cx, cy] = centro(c); return <g key={`r${i}`}><circle cx={cx} cy={cy} r="8" className="lbm-paso" /><text x={cx} y={cy + 3.5} textAnchor="middle" fontSize="10" fontWeight="900" fill="#0f172a">{i + 1}</text></g>; })}
      {v.piezas.map((p) => {
        const [cx, cy] = centro(p.pos);
        const esYo = p.id === yo?.id;
        const e = p.rol === 'minotauro' ? '🐂' : p.rol === 'ayudante' ? '👹' : '🧭';
        return (
          <g key={`p${p.id}`} className={`lbm-pieza${esYo ? ' yo' : ''}${p.rol !== 'explorador' ? ' caza' : ''}`}>
            <circle cx={cx} cy={cy} r="12.5" fill={p.rol === 'explorador' ? colorDe(p.id) : p.rol === 'minotauro' ? '#7f1d1d' : '#581c87'} />
            <text x={cx} y={cy + 5} textAnchor="middle" fontSize="14">{p.aturdido ? '💫' : e}</text>
          </g>
        );
      })}
    </svg>
  );
}

function Cabecera({ v, onSalir, titulo }) {
  const yo = v.yo;
  const r = yo ? (yo.escapado ? { e: '🚪', n: 'Has escapado', t: 'Mira cómo acaba' } : ROL[yo.rol]) : { e: '👀', n: 'Mirando', t: '' };
  return (
    <header className={`pzp-hero lbm-hero ${yo?.rol || ''}`}>
      <span className="pzp-hero-fondo" aria-hidden="true">{r.e}</span>
      <div className="pzp-hero-top">
        <button type="button" className="pzp-salir" onClick={onSalir}><Icon name="door" size={15} /> Salir</button>
        <span className="pzp-chip">🕯️ Turno {v.turno}/{v.maxTurnos}</span>
      </div>
      <p className="pzp-hero-etiqueta">{r.e} {r.n}{r.t ? ` · ${r.t}` : ''}</p>
      <h1 className="pzp-hero-titulo">{titulo}</h1>
      <div className="lbm-estado">
        <span>🔑 <b>{v.llavesCogidas}/{v.totalLlaves}</b> llaves</span>
        <span>{v.salidasAbiertas ? '🚪 Salidas abiertas' : '🔒 Salidas cerradas'}</span>
        <span>🏃 <b>{v.escapados}/{v.necesarios}</b> deben escapar</span>
      </div>
    </header>
  );
}

function Mensajes({ v }) {
  const priv = v.yo?.mensajes || [];
  if (!v.eventos.length && !priv.length) return null;
  return (
    <div className="lbm-mensajes">
      {priv.map((t, i) => <p key={`p${i}`} className="privado">{t}</p>)}
      {v.eventos.map((e, i) => <p key={i} className={e.tipo}>{e.texto}</p>)}
    </div>
  );
}

/** Planificación del turno: se toca una casilla vecina tras otra (o la última para borrarla). */
function Planificar({ v, enviar }) {
  const yo = v.yo;
  const [ruta, setRuta] = useState([]);
  const [trampa, setTrampa] = useState(false);
  useEffect(() => { setRuta([]); setTrampa(false); }, [v.turno]);
  const ultima = ruta.length ? ruta[ruta.length - 1] : yo.pos;
  const tocables = new Set();
  if (ruta.length < yo.maxPasos) (v.abiertos[ultima] || []).forEach((n) => { if (n !== (ruta.length > 1 ? ruta[ruta.length - 2] : null)) tocables.add(n); });
  if (ruta.length) tocables.add(ultima);
  const tocar = (c) => setRuta((r) => (r.length && c === r[r.length - 1] ? r.slice(0, -1) : [...r, c]));
  const corre = yo.rol === 'explorador' && ruta.length > E.AJUSTES.pasos.explorador;
  return (
    <>
      <div className="pzp-tarjeta lbm-mapa-tarjeta"><Mapa v={v} ruta={ruta} onTocar={tocar} tocables={tocables} /></div>
      <div className="pzp-tarjeta lbm-plan">
        {yo.maxPasos === 0 ? <p className="lbm-aviso">💫 Estás aturdido: este turno no te mueves.</p> : (
          <p className="lbm-ayuda">Toca casillas vecinas para trazar tu recorrido ({ruta.length}/{yo.maxPasos} pasos).{yo.rol === 'explorador' ? ` Con ${E.AJUSTES.pasos.correr} pasos corres… y haces ruido.` : ' Si pisas a un explorador o te cruzas con él, lo atrapas.'}</p>
        )}
        {corre && <p className="lbm-aviso">🏃 ¡Corres! El Minotauro te oirá.</p>}
        {yo.rol === 'explorador' && yo.trampas > 0 && (
          <label className="lbm-check"><input type="checkbox" checked={trampa} onChange={(e) => setTrampa(e.target.checked)} /> 🪤 Dejar una trampa donde estoy (te queda {yo.trampas})</label>
        )}
        <div className="pzp-dos">
          <button type="button" className="pzp-boton secundario" disabled={!ruta.length} onClick={() => setRuta([])}>Borrar</button>
          <button type="button" className="pzp-boton" onClick={() => enviar('planificar', { pasos: ruta, trampa })}>
            <Icon name="check" size={18} /> {ruta.length ? `Moverme ${ruta.length}` : 'Quedarme quieto'}
          </button>
        </div>
      </div>
    </>
  );
}

export function Partida({ v, enviar, onSalir, local = false, admin = false, offset = 0 }) {
  const restante = useRestante(v.hasta, offset);
  const yo = v.yo;
  if (!yo) return null;
  const pendientes = v.jugadores.filter((j) => !j.fuera && !j.escapado && !j.listo).length;
  let cuerpo;
  let titulo;
  if (yo.escapado) {
    titulo = '¡Estás fuera!';
    cuerpo = <div className="pzp-tarjeta lbm-mapa-tarjeta"><Mapa v={v} /></div>;
  } else if (yo.listo) {
    titulo = 'Movimiento decidido';
    cuerpo = (
      <>
        <div className="pzp-tarjeta lbm-mapa-tarjeta"><Mapa v={v} ruta={yo.plan?.pasos || []} /></div>
        <div className="pzp-tarjeta">
          <p className="pzp-esperando-txt">⏳ Esperando a {pendientes} {pendientes === 1 ? 'jugador' : 'jugadores'}…</p>
          {!local && <button type="button" className="pzp-enlace oscuro" onClick={() => enviar('deshacer')}>✏️ Cambiar mi movimiento</button>}
        </div>
      </>
    );
  } else {
    titulo = yo.rol === 'explorador' ? '¿Hacia dónde vas?' : '¿Por dónde cazas?';
    cuerpo = <Planificar v={v} enviar={enviar} />;
  }
  return (
    <>
      <Cabecera v={v} onSalir={onSalir} titulo={titulo} />
      {!local && <AvisoTurno clave={`t${v.turno}`} emoji={ROL[yo.rol]?.e || '🕯️'} texto={`Turno ${v.turno}`} sub="Todos movéis a la vez." />}
      {v.hasta && <Cuenta ms={restante} total={v.segundos * 1000} />}
      <Mensajes v={v} />
      {cuerpo}
      <p className="lbm-leyenda">🧭 explorador · 🐂 Minotauro · 👹 ayudante · 🔑 llave · 🔦 antorcha · 🪤 trampa · 🔒/🚪 salida</p>
      {admin && <div className="pzp-barra estatica"><button type="button" className="pzp-enlace" onClick={() => enviar('terminar')}>Terminar la partida ya</button></div>}
    </>
  );
}

export function PartidaOnline({ v, sala, enviar, offset, onSalir }) {
  return <Partida v={v} enviar={enviar} offset={offset} onSalir={onSalir} admin={sala.esAdmin} />;
}

export function Fin({ v, onSalir, children }) {
  const f = v.fin;
  const mino = v.jugadores.find((j) => j.id === f.minotauro);
  return (
    <>
      <header className={`pzp-hero ${f.ganan === 'exploradores' ? 'acierto' : 'fin'} lbm-hero`}>
        <span className="pzp-hero-fondo" aria-hidden="true">{f.ganan === 'exploradores' ? '🚪' : '🐂'}</span>
        <div className="pzp-hero-top">
          <button type="button" className="pzp-salir" onClick={onSalir}><Icon name="door" size={15} /> Salir</button>
          <span className="pzp-chip">🕯️ Fin</span>
        </div>
        <p className="pzp-hero-etiqueta">El Minotauro era… {mino?.nombre}</p>
        <h1 className="pzp-hero-titulo">{f.ganan === 'exploradores' ? '¡Los exploradores escapan!' : '¡Gana el Minotauro!'}</h1>
      </header>
      <div className="pzp-tarjeta">
        <p className="pzp-etiqueta">Escapan {f.escapados} de {f.necesarios} necesarios</p>
        <ul className="lbm-final">
          {f.tabla.map((t) => (
            <li key={t.id} className={f.ganadores.includes(t.id) ? 'gana' : ''}>
              <span className="lbm-av" style={{ background: colorDe(t.id) }}>{t.nombre.charAt(0)}</span>
              <b>{t.nombre}</b>
              <small>{t.rol === 'minotauro' ? '🐂 Minotauro' : t.final === 'escapado' ? '🚪 Escapó' : t.final === 'ayudante' ? '👹 Atrapado (ayudante)' : '🧭 Se quedó dentro'}</small>
              {f.ganadores.includes(t.id) && <em>🏆</em>}
            </li>
          ))}
        </ul>
      </div>
      <div className="pzp-tarjeta lbm-mapa-tarjeta"><Mapa v={v} /></div>
      {children}
    </>
  );
}

export function Config({ config, onCambiar }) {
  return (
    <BloqueConfig titulo="Turnos como máximo">
      <Pildoras opciones={E.OPCIONES.turnos.map((n) => [n, `${n} turnos`])} valor={config.turnos} onCambiar={onCambiar && ((turnos) => onCambiar({ turnos }))} />
    </BloqueConfig>
  );
}

/** Un solo dispositivo: el móvil pasa de jugador en jugador cada turno (lo que ve cada uno es secreto). */
export function Local({ juego, onVolver, onExit, onAbrirAyuda }) {
  const [paso, setPaso] = useState('config');
  const [nombres, setNombres] = useState(() => Array(LIM_JUG.min).fill(''));
  const [config, setConfig] = useState({ turnos: 25 });
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState(null);
  const [modal, setModal] = useState(false);
  const [confirmado, setConfirmado] = useState(null);
  const [visto, setVisto] = useState(null);
  const estRef = useRef(null);
  const [, setVer] = useState(0);
  const refrescar = () => setVer((x) => x + 1);
  const empezar = () => {
    const limpios = nombres.map((n) => n.trim());
    if (limpios.some((n) => !n)) return setError('Todos los jugadores necesitan un nombre.');
    if (new Set(limpios.map((n) => n.toLowerCase())).size !== limpios.length) return setError('Hay nombres repetidos.');
    setError('');
    estRef.current = E.crearPartida(limpios.map((nombre, i) => ({ id: i + 1, nombre })), { ...config, sinReloj: true }, Date.now());
    setConfirmado(null); setVisto(null);
    setPaso('juego');
    return undefined;
  };
  if (paso === 'config') {
    return (
      <div className={`pzp-contenedor ${juego.id}`}>
        <SelectorJugadores onVolver={onVolver} onAyuda={onAbrirAyuda} min={LIM_JUG.min} max={LIM_JUG.max} numJugadores={nombres.length}
          onCambiarNum={(n) => setNombres((l) => (n > l.length ? [...l, ...Array(n - l.length).fill('')] : l.slice(0, n)))}
          nombres={nombres} onNombre={(i, valor) => setNombres((l) => l.map((x, k) => (k === i ? valor : x)))}
          onEmpezar={empezar} textoBoton="¡Entrar en el laberinto!" error={error}>
          <Config config={config} onCambiar={(c) => setConfig((x) => ({ ...x, ...c }))} />
        </SelectorJugadores>
      </div>
    );
  }
  const est = estRef.current;
  const salir = modal && <ModalSalir titulo="¿Salir de la partida?" texto="Se perderá la partida en curso y volverás a la portada." onSeguir={() => setModal(false)} onSalir={() => { setModal(false); onExit?.(); }} />;
  const envoltorio = (c) => (
    <div className={`pzp-contenedor ${juego.id} qq-en-partida`}>
      {aviso && <p className="pzp-toast" role="alert">{aviso}</p>}
      <section className="game pzp-escena">{c}</section>
      {salir}
    </div>
  );
  if (est.fase === 'fin') {
    return envoltorio(
      <Fin v={E.vistaDe(est, -1)} onSalir={() => setModal(true)}>
        <div className="pzp-barra estatica">
          <button type="button" className="pzp-boton grande" onClick={() => setPaso('config')}><Icon name="refresh" size={20} /> Otra partida</button>
          <button type="button" className="pzp-boton secundario" onClick={() => onExit?.()}><Icon name="door" size={18} /> Salir a la portada</button>
        </div>
      </Fin>
    );
  }
  // Resumen público del turno anterior antes de seguir
  if (est.turno > 1 && visto !== est.turno) {
    const pub = E.vistaDe(est, -1);
    return envoltorio(
      <div className="pzp-tarjeta pzp-gate lbm-resumen">
        <p className="pzp-etiqueta centrada">Lo que ha pasado en el turno {est.turno - 1}</p>
        <div className="lbm-mensajes">{pub.eventos.map((e, i) => <p key={i} className={e.tipo}>{e.texto}</p>)}</div>
        <p className="pzp-texto">🔑 {pub.llavesCogidas}/{pub.totalLlaves} llaves · 🏃 escapados {pub.escapados}/{pub.necesarios}</p>
        <button type="button" className="pzp-boton grande" onClick={() => setVisto(est.turno)}><Icon name="play" size={20} /> Turno {est.turno}</button>
      </div>
    );
  }
  const quien = est.jugadores.find((j) => !j.fuera && !j.escapado && !j.listo);
  if (!quien) return envoltorio(<p className="pzp-esperando-txt">…</p>);
  const clave = `${est.turno}-${quien.id}`;
  const v = E.vistaDe(est, quien.id);
  if (confirmado !== clave) {
    return envoltorio(
      <TurnoDe v={v} id={quien.id} puedo onListo={() => setConfirmado(clave)} boton={`Soy ${quien.nombre}`}
        texto={est.turno === 1 ? 'Pásale el móvil: va a descubrir en secreto si es explorador… o el Minotauro.' : 'Pásale el móvil: lo que ve en el laberinto es secreto.'} />
    );
  }
  const enviar = (tipo, d = {}) => {
    let r;
    if (tipo === 'planificar') r = E.planificar(est, quien.id, d.pasos, d.trampa, Date.now());
    if (r && !r.ok) { setAviso(r.error); setTimeout(() => setAviso(null), 2500); }
    refrescar();
  };
  return envoltorio(<Partida v={v} enviar={enviar} onSalir={() => setModal(true)} local />);
}

export const JUEGO_MINOTAURO = {
  id: 'minotauro',
  api: '/api/minotauro',
  emoji: '🐂',
  config: { turnos: 25 },
  Local,
  Partida: PartidaOnline,
  Fin,
  Config,
  notaSala: '🐂 De 2 a 8 jugadores. Al empezar, a uno le tocará en secreto ser el Minotauro.',
  ganador: (n) => `¡Ganan ${n.join(' y ')}!`,
  reglas: [
    `Laberinto de ${E.AJUSTES.lado}×${E.AJUSTES.lado} casillas con niebla: cada uno solo ve lo que tiene cerca (a ${E.AJUSTES.vista.explorador} casillas por los pasillos) y recuerda lo que ya ha visto.`,
    'Al empezar, a un jugador le toca en secreto ser el Minotauro: conoce todo el laberinto pero no ve a nadie que no tenga cerca. Los demás son exploradores y salen del centro.',
    `Cada turno todos trazáis a la vez vuestro recorrido tocando casillas: los exploradores, ${E.AJUSTES.pasos.explorador} pasos (o ${E.AJUSTES.pasos.correr} corriendo, pero hace ruido); el Minotauro, ${E.AJUSTES.pasos.minotauro}. Luego os movéis a la vez, paso a paso.`,
    'Si el Minotauro pisa la casilla de un explorador o se cruzan, lo atrapa: ese jugador pasa a ser su ayudante (👹) y también caza.',
    `Las ${E.AJUSTES.llaves} llaves brillan: los exploradores saben dónde están (el Minotauro no, hasta que las ve). Cuando se han recogido todas, se abren las dos salidas 🚪.`,
    `Los exploradores ganan si escapa al menos un tercio de ellos (mínimo uno). Si no, gana el Minotauro con sus ayudantes.`,
    `Ayudas: cada explorador tiene ${E.AJUSTES.trampas} trampa 🪤 (el cazador que la pisa se queda quieto y aturdido un turno) y hay antorchas 🔦 que dejan ver más lejos. El Minotauro oye a quien corre o abre un candado, y los exploradores oyen sus pasos cuando está cerca.`
  ]
};
