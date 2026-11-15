// client/src/games/Garabato/Garabato.jsx
// «Garabato Encadenado»: el teléfono escacharrado con dibujos. Online (cada uno en su móvil, a la vez) o en un
// solo móvil (cada uno hace su parte en secreto y lo pasa).
import React, { useEffect, useRef, useState } from 'react';
import JuegoPulsador from '../Pulsador/JuegoPulsador.jsx';
import LocalPorTurnos from '../comun/LocalPorTurnos.jsx';
import { Hero, Pildoras, AvisoTurno, PantallaFin, useLatido } from '../Pulsador/Vistas.jsx';
import { BloqueConfig } from '../../components/MenuJuego.jsx';
import Icon from '../../components/Icon.jsx';
import * as E from './engine.js';
import { FRASES } from './frases.js';
import './Garabato.css';

const API = '/api/garabato';
let salaActual = null; // código de la sala online (para pedir los dibujos)
const cache = new Map();
const nombreDe = (v, id) => v.jugadores.find((j) => j.id === id)?.nombre ?? '¿?';

/* ───────── Ver un dibujo ───────── */
function Trazos({ trazos }) {
  return (
    <svg viewBox="0 0 1000 1000" className="gbt-svg" aria-hidden="true">
      <rect width="1000" height="1000" fill="#ffffff" />
      {trazos.map((t, i) => {
        const pts = [];
        for (let k = 0; k < t.p.length; k += 2) pts.push(`${t.p[k]},${t.p[k + 1]}`);
        const color = E.COLORES[t.c]; const g = E.GROSORES[t.g];
        return pts.length === 1
          ? <circle key={i} cx={t.p[0]} cy={t.p[1]} r={g / 2} fill={color} />
          : <polyline key={i} points={pts.join(' ')} fill="none" stroke={color} strokeWidth={g} strokeLinecap="round" strokeLinejoin="round" />;
      })}
    </svg>
  );
}

export function VerDibujo({ dibujo, vacio = 'No dibujó nada… 🙈' }) {
  const [trazos, setTrazos] = useState(() => dibujo?.trazos || cache.get(dibujo?.id) || null);
  useEffect(() => {
    if (!dibujo) return undefined;
    if (dibujo.trazos) { setTrazos(dibujo.trazos); return undefined; }
    if (cache.has(dibujo.id)) { setTrazos(cache.get(dibujo.id)); return undefined; }
    let vivo = true;
    fetch(`${API}/online/sala/${salaActual}/dibujo/${dibujo.id}`).then((r) => (r.ok ? r.json() : null)).then((d) => {
      if (d?.trazos && vivo) { cache.set(dibujo.id, d.trazos); setTrazos(d.trazos); }
    }).catch(() => {});
    return () => { vivo = false; };
  }, [dibujo?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!trazos) return <div className="gbt-dibujo cargando"><span>Cargando dibujo…</span></div>;
  return <div className="gbt-dibujo">{trazos.length ? <Trazos trazos={trazos} /> : <span className="gbt-vacio">{vacio}</span>}</div>;
}

/* ───────── Lienzo para dibujar ───────── */
function Lienzo({ onEntregar, trazosRef }) {
  const canvas = useRef(null);
  const [trazos, setTrazos] = useState([]);
  const [color, setColor] = useState(0);
  const [grosor, setGrosor] = useState(1);
  const actual = useRef(null);
  trazosRef.current = trazos;

  const pintar = (lista) => {
    const c = canvas.current; if (!c) return;
    const ctx = c.getContext('2d');
    const k = c.width / 1000;
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, c.width, c.height);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const t of lista) {
      ctx.strokeStyle = E.COLORES[t.c]; ctx.fillStyle = E.COLORES[t.c]; ctx.lineWidth = E.GROSORES[t.g] * k;
      if (t.p.length === 2) { ctx.beginPath(); ctx.arc(t.p[0] * k, t.p[1] * k, (E.GROSORES[t.g] * k) / 2, 0, Math.PI * 2); ctx.fill(); continue; }
      ctx.beginPath(); ctx.moveTo(t.p[0] * k, t.p[1] * k);
      for (let i = 2; i < t.p.length; i += 2) ctx.lineTo(t.p[i] * k, t.p[i + 1] * k);
      ctx.stroke();
    }
  };
  useEffect(() => {
    const c = canvas.current;
    const ajustar = () => { const r = c.getBoundingClientRect(); const dpr = Math.min(2, window.devicePixelRatio || 1); c.width = Math.round(r.width * dpr); c.height = Math.round(r.width * dpr); pintar(trazosRef.current); };
    ajustar();
    window.addEventListener('resize', ajustar);
    return () => window.removeEventListener('resize', ajustar);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { pintar(trazos); }, [trazos]); // eslint-disable-line react-hooks/exhaustive-deps

  const punto = (e) => {
    const r = canvas.current.getBoundingClientRect();
    return [Math.round(((e.clientX - r.left) / r.width) * 1000), Math.round(((e.clientY - r.top) / r.height) * 1000)];
  };
  const bajar = (e) => {
    e.preventDefault();
    canvas.current.setPointerCapture?.(e.pointerId);
    actual.current = { c: color, g: grosor, p: punto(e) };
    pintar([...trazos, actual.current]);
  };
  const mover = (e) => {
    if (!actual.current) return;
    const [x, y] = punto(e); const p = actual.current.p;
    if (Math.hypot(x - p[p.length - 2], y - p[p.length - 1]) < 5) return; // menos puntos, mismo dibujo
    p.push(x, y);
    pintar([...trazos, actual.current]);
  };
  const subir = () => {
    if (!actual.current) return;
    const t = actual.current; actual.current = null;
    setTrazos((l) => [...l, t]);
  };
  return (
    <div className="gbt-lienzo">
      <canvas ref={canvas} className="gbt-canvas" onPointerDown={bajar} onPointerMove={mover} onPointerUp={subir} onPointerCancel={subir} onPointerLeave={subir} />
      <div className="gbt-herramientas">
        <div className="gbt-colores">
          {E.COLORES.map((c, i) => <button key={c} type="button" className={`gbt-color${color === i ? ' sel' : ''}${i === 9 ? ' goma' : ''}`} style={{ '--c': c }} onClick={() => setColor(i)} aria-label={i === 9 ? 'Goma (blanco)' : `Color ${i + 1}`} />)}
        </div>
        <div className="gbt-fila">
          {E.GROSORES.map((g, i) => <button key={g} type="button" className={`gbt-grosor${grosor === i ? ' sel' : ''}`} onClick={() => setGrosor(i)} aria-label={`Grosor ${i + 1}`}><i style={{ width: 4 + i * 6, height: 4 + i * 6 }} /></button>)}
          <button type="button" className="gbt-accion" disabled={!trazos.length} onClick={() => setTrazos((l) => l.slice(0, -1))}>↩ Deshacer</button>
          <button type="button" className="gbt-accion" disabled={!trazos.length} onClick={() => { if (window.confirm('¿Borrar todo el dibujo?')) setTrazos([]); }}>🗑️</button>
        </div>
      </div>
      <button type="button" className="pzp-boton grande" disabled={!trazos.length} onClick={() => onEntregar(trazos)}><Icon name="check" size={20} /> ¡Dibujo terminado!</button>
    </div>
  );
}

/* ───────── Reloj ───────── */
function Reloj({ v, alAcabar }) {
  useLatido(250);
  const desfase = useRef(null);
  if (desfase.current === null || Math.abs(desfase.current.ahora - v.ahora) > 0) desfase.current = { ahora: v.ahora, local: Date.now() };
  const restante = v.limite ? Math.max(0, v.limite - (v.ahora + (Date.now() - desfase.current.local))) : null;
  const avisado = useRef(false);
  useEffect(() => { avisado.current = false; }, [v.limite]);
  useEffect(() => { if (restante !== null && restante < 1200 && !avisado.current) { avisado.current = true; alAcabar?.(); } });
  if (restante === null) return null;
  const total = (E.TIEMPOS[v.tiempo]?.[v.tarea?.tipo] || 60) * 1000;
  return (
    <div className={`gbt-reloj${restante < 10000 ? ' urgente' : ''}`}>
      <span className="gbt-reloj-num">{Math.ceil(restante / 1000)}s</span>
      <i style={{ width: `${Math.min(100, (restante / total) * 100)}%` }} />
    </div>
  );
}

/* ───────── Pantallas ───────── */
function Esperando({ v }) {
  const faltan = v.jugadores.filter((j) => !j.fuera && !j.hecho);
  return (
    <div className="pzp-tarjeta gbt-espera">
      <span className="gbt-espera-ico">✅</span>
      <p className="pzp-etiqueta centrada">¡Entregado!</p>
      <p className="pzp-nota">{faltan.length ? `Esperando a: ${faltan.map((j) => j.nombre).join(', ')}` : 'Pasando al siguiente paso…'}</p>
    </div>
  );
}

function Tarea({ v, enviar }) {
  const t = v.tarea;
  const [texto, setTexto] = useState('');
  const trazosRef = useRef([]);
  const entregado = useRef(false);
  const mandar = (valor) => { if (entregado.current) return; entregado.current = true; enviar('entregar', { valor }); };
  // Si se acaba el tiempo, se entrega lo que haya
  const alAcabar = () => {
    if (t.tipo === 'dibujo' && trazosRef.current.length) mandar(trazosRef.current);
    else if (t.tipo !== 'dibujo' && texto.trim()) mandar(texto.trim());
  };
  if (t.tipo === 'frase') {
    return (
      <>
        <Reloj v={v} alAcabar={alAcabar} />
        <div className="pzp-tarjeta gbt-tarea">
          <p className="pzp-etiqueta">✍️ Escribe una frase para que la dibuje otro</p>
          <p className="pzp-nota">Cuanto más absurda, mejor. ¡Pero que se pueda dibujar!</p>
          <textarea className="gbt-texto" value={texto} maxLength={90} rows={2} onChange={(e) => setTexto(e.target.value)} placeholder="Un pulpo haciendo la declaración de la renta…" />
          <button type="button" className="gbt-sugerir" onClick={() => setTexto(t.sugerencia || FRASES[Math.floor(Math.random() * FRASES.length)])}>🎲 Dame una idea</button>
          <button type="button" className="pzp-boton grande" disabled={!texto.trim()} onClick={() => mandar(texto.trim())}><Icon name="check" size={20} /> Enviar frase</button>
        </div>
      </>
    );
  }
  if (t.tipo === 'dibujo') {
    return (
      <>
        <Reloj v={v} alAcabar={alAcabar} />
        <div className="pzp-tarjeta gbt-tarea">
          <p className="pzp-etiqueta">🎨 Dibuja esto (sin letras ni números):</p>
          <p className="gbt-frase">«{t.previo?.valor}»</p>
          <Lienzo onEntregar={(tr) => mandar(tr)} trazosRef={trazosRef} />
        </div>
      </>
    );
  }
  return (
    <>
      <Reloj v={v} alAcabar={alAcabar} />
      <div className="pzp-tarjeta gbt-tarea">
        <p className="pzp-etiqueta">🔍 ¿Qué es esto? Descríbelo en una frase</p>
        <VerDibujo dibujo={t.previo?.dibujo} vacio="No dibujó nada… ¡invéntatelo!" />
        <textarea className="gbt-texto" value={texto} maxLength={90} rows={2} onChange={(e) => setTexto(e.target.value)} placeholder="Creo que es…" />
        <button type="button" className="pzp-boton grande" disabled={!texto.trim()} onClick={() => mandar(texto.trim())}><Icon name="check" size={20} /> Enviar descripción</button>
      </div>
    </>
  );
}

function Entrada({ v, e, i }) {
  const quien = nombreDe(v, e.por);
  return (
    <div className={`gbt-entrada ${e.tipo}`} style={{ animationDelay: '0ms' }}>
      <p className="gbt-quien"><b>{quien}</b> {i === 0 ? 'empezó con' : e.tipo === 'dibujo' ? 'lo dibujó así' : 'creyó que era'}{e.pillado ? ' · 🎯 ¡lo pilló!' : ''}</p>
      {e.tipo === 'dibujo' ? <VerDibujo dibujo={e.dibujo} /> : <p className="gbt-bocadillo">«{e.valor}»</p>}
    </div>
  );
}

function Revelar({ v, enviar, puede }) {
  const ci = v.mostrar.cadena;
  const c = v.cadenas[ci];
  const fondo = useRef(null);
  useEffect(() => { fondo.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [v.mostrar.entrada, ci]);
  const ultima = ci === v.cadenas.length - 1 && v.mostrar.entrada === v.pasos - 1;
  return (
    <>
      <div className="pzp-tarjeta gbt-cadena">
        <p className="pzp-etiqueta centrada">La cadena de {nombreDe(v, c.autor)} ({ci + 1}/{v.n || v.pasos})</p>
        {c.entradas.map((e, i) => <Entrada key={`${ci}-${i}`} v={v} e={e} i={i} />)}
        <span ref={fondo} />
      </div>
      <div className="pzp-barra estatica">
        {puede
          ? <button type="button" className="pzp-boton grande" onClick={() => enviar('siguiente')}>{ultima ? '🗳️ ¡A votar!' : v.mostrar.entrada === v.pasos - 1 ? '➡️ Siguiente cadena' : '👀 Destapar el siguiente'}</button>
          : <p className="pzp-esperando">El anfitrión va destapando las cadenas…</p>}
      </div>
    </>
  );
}

function Votar({ v, enviar }) {
  const [dib, setDib] = useState(null);
  const [txt, setTxt] = useState(null);
  const yo = v.yo?.id;
  const dibujos = v.cadenas.flatMap((c) => c.entradas.filter((e) => e.tipo === 'dibujo' && e.por !== yo && !e.auto));
  const textos = v.cadenas.flatMap((c, ci) => c.entradas.map((e, ei) => ({ ...e, k: `${ci}-${ei}` }))).filter((e) => e.tipo === 'texto' && e.por !== yo && !e.auto);
  if (v.miVoto) {
    const faltan = v.jugadores.filter((j) => !j.fuera && !j.votado);
    return <div className="pzp-tarjeta gbt-espera"><span className="gbt-espera-ico">🗳️</span><p className="pzp-etiqueta centrada">¡Voto enviado!</p><p className="pzp-nota">Faltan: {faltan.map((j) => j.nombre).join(', ')}</p></div>;
  }
  return (
    <>
      <div className="pzp-tarjeta">
        <p className="pzp-etiqueta">🖼️ El mejor dibujo (+3)</p>
        <div className="gbt-galeria">
          {dibujos.map((e) => (
            <button key={e.dibujo.id} type="button" className={dib === e.dibujo.id ? 'sel' : ''} onClick={() => setDib(e.dibujo.id)}>
              <VerDibujo dibujo={e.dibujo} /><small>{nombreDe(v, e.por)}</small>
            </button>
          ))}
        </div>
      </div>
      <div className="pzp-tarjeta">
        <p className="pzp-etiqueta">💬 La mejor frase (+2)</p>
        <div className="gbt-frases">
          {textos.map((e) => <button key={e.k} type="button" className={txt === e.k ? 'sel' : ''} onClick={() => setTxt(e.k)}>«{e.valor}» <small>{nombreDe(v, e.por)}</small></button>)}
        </div>
      </div>
      <div className="pzp-barra estatica">
        <button type="button" className="pzp-boton grande" disabled={!dib || !txt} onClick={() => enviar('votar', { dibujo: dib, texto: txt })}><Icon name="check" size={20} /> Votar</button>
      </div>
    </>
  );
}

function Partida({ v, enviar, onSalir, admin, local, sala }) {
  if (sala?.code) salaActual = sala.code;
  const titulo = v.fase === 'revelar' ? '¡Se destapan las cadenas!' : v.fase === 'votar' ? 'Votad lo mejor'
    : v.tarea?.hecho ? 'Esperando al resto' : { frase: 'Escribe una frase', dibujo: '¡A dibujar!', texto: '¿Qué es esto?' }[v.tarea?.tipo] || 'Garabato Encadenado';
  const chip = v.fase === 'jugando' ? `✏️ Paso ${v.ronda}/${v.rondas}` : v.fase === 'revelar' ? '👀 Revelación' : '🗳️ Votación';
  const extra = (j) => (v.fase === 'jugando' && j.hecho ? <small className="gbt-ok">✓</small> : v.fase === 'votar' && j.votado ? <small className="gbt-ok">✓</small> : null);
  return (
    <>
      <Hero v={v} juego={JUEGO} onSalir={onSalir} chip={chip} etiqueta="Garabato Encadenado" titulo={titulo} extra={extra} />
      {!local && v.fase === 'jugando' && v.tarea && !v.tarea.hecho && <AvisoTurno clave={`p${v.paso}`} emoji="✏️" texto={titulo} sub="Todos a la vez: haz tu parte antes de que se acabe el tiempo." id={v.yo?.id} />}
      {v.fase === 'jugando' && (v.tarea && !v.tarea.hecho ? <Tarea key={`t${v.paso}-${v.yo?.id}`} v={v} enviar={enviar} /> : <Esperando v={v} />)}
      {v.fase === 'revelar' && <Revelar v={v} enviar={enviar} puede={local || admin} />}
      {v.fase === 'votar' && <Votar key={v.yo?.id} v={v} enviar={enviar} />}
      {admin && !local && v.fase !== 'revelar' && <div className="pzp-barra estatica"><button type="button" className="pzp-enlace" onClick={() => enviar('forzar')}><Icon name="forward" size={15} /> {v.fase === 'votar' ? 'Cerrar la votación' : 'No esperar más'}</button></div>}
    </>
  );
}

function Fin(props) {
  const { v } = props;
  return (
    <PantallaFin {...props}>
      <div className="pzp-tarjeta">
        <p className="pzp-etiqueta">Las cadenas completas</p>
        {v.cadenas?.map((c, ci) => (
          <details key={ci} className="gbt-final">
            <summary>La cadena de {nombreDe(v, c.autor)}: «{c.entradas[0]?.valor}»</summary>
            {c.entradas.map((e, i) => <Entrada key={i} v={v} e={e} i={i} />)}
          </details>
        ))}
      </div>
      {props.children}
    </PantallaFin>
  );
}

function Config({ config, onCambiar }) {
  return (
    <BloqueConfig titulo="Tiempo para cada paso (online)">
      <Pildoras opciones={E.OPCIONES_TIEMPO} valor={config.tiempo} onCambiar={onCambiar && ((tiempo) => onCambiar({ tiempo }))} />
    </BloqueConfig>
  );
}

const JUEGO = {
  id: 'garabato',
  api: API,
  emoji: '✏️',
  config: { tiempo: 'normal' },
  Partida: (props) => <Partida {...props} admin={props.admin ?? props.sala?.esAdmin} />,
  Fin,
  Config,
  Local: (props) => <LocalPorTurnos {...props} E={E} />,
  cargarItems: async () => FRASES,
  textoPasar: (v) => (v.fase === 'votar' ? 'Vota en secreto el mejor dibujo y la mejor frase.' : 'Haz tu parte en secreto: que nadie más mire.'),
  textoEmpezar: '¡A garabatear!',
  notaSala: '✏️ Mínimo 3 jugadores. Cada uno dibuja y escribe en su móvil, todos a la vez.',
  ganador: (n) => (n.length > 1 ? `¡${n.join(' y ')} empatan como artistas!` : `¡${n[0]} es el artista de la noche!`),
  detalleFin: (j) => `${j.dibujo} ${j.dibujo === 1 ? 'voto' : 'votos'} al dibujo · ${j.texto} a la frase${j.pillados ? ` · ${j.pillados} 🎯` : ''}`,
};

export default function Garabato({ onExit }) {
  return <JuegoPulsador juego={JUEGO} onExit={onExit} />;
}
