// client/src/games/Logos/LogosPartida.jsx
// Pantalla de partida de «Logomanía», común al modo local y al online (mismo diseño que Furbo, en azul).
// Recibe la «vista» que prepara el motor del servidor y envía acciones con onAccion.
import { useRegistrarPartida, ganadoresPorPuntos } from '../../lib/registros.js';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Icon from '../../components/Icon.jsx';
import { FASES_INFO } from './LogosInfo.js';
import { COLORES as PINCEL, GROSORES } from '../Garabato/engine.js';
import './Logos.css';
import CaraJugador from '../../components/CaraJugador.jsx';

const LETRAS = ['A', 'B', 'C', 'D'];
const DIFICULTAD = { 1: 'Fácil', 2: 'Media', 3: 'Difícil' };
export const COLORES = ['#ef4444', '#2563eb', '#16a34a', '#f59e0b', '#9333ea', '#ec4899', '#0d9488', '#ea580c', '#475569', '#65a30d', '#0891b2', '#be123c'];
export const colorDe = (id) => COLORES[((Number(id) || 1) - 1) % COLORES.length];
const inicial = (n) => (n || '?').trim().charAt(0).toUpperCase();

export function Avatar({ id, nombre, grande = false }) {
  return <span className={`lgm-avatar${grande ? ' grande' : ''}`} style={{ '--c': colorDe(id) }}><CaraJugador nombre={nombre} /></span>;
}

/* ------------------------------------------------------------------ piezas */
function Reloj({ restante, total }) {
  if (restante == null) return null;
  const seg = Math.ceil(restante / 1000);
  const pct = total ? Math.max(0, Math.min(100, (restante / total) * 100)) : 100;
  return (
    <div className={`lgm-reloj ${seg <= 5 ? 'bajo' : ''}`} role="timer">
      <Icon name="clock" size={15} />
      <div className="lgm-reloj-barra"><div className="lgm-reloj-fill" style={{ width: `${pct}%` }} /></div>
      <strong>{seg} s</strong>
    </div>
  );
}

function Pregunta({ etiqueta, children }) {
  return (
    <div className="lgm-tarjeta lgm-pregunta">
      <p className="lgm-etiqueta">{etiqueta}</p>
      {typeof children === 'string' ? <h2>{children}</h2> : children}
    </div>
  );
}

const Aviso = ({ tipo = 'info', children }) => <div className={`lgm-aviso ${tipo}`}>{children}</div>;

function Gate({ id, nombre, motivo, onAbrir }) {
  return (
    <div className="lgm-tarjeta lgm-gate">
      <Avatar id={id} nombre={nombre} grande />
      <p className="lgm-etiqueta centrada">Pasa el móvil</p>
      <h2>Le toca a {nombre}</h2>
      <p className="lgm-texto">{motivo}</p>
      <button type="button" className="lgm-boton grande" onClick={onAbrir}>
        <Icon name="check" size={20} strokeWidth={2.5} /> Soy {nombre}
      </button>
    </div>
  );
}

function ChipsEspera({ jugadores, listos, excluir = null }) {
  return (
    <div className="lgm-espera">
      {jugadores.filter((j) => !j.ausente && j.id !== excluir).map((j) => {
        const listo = listos.includes(j.id);
        return (
          <span key={j.id} className={`lgm-espera-chip ${listo ? 'listo' : ''}`}>
            <Avatar id={j.id} nombre={j.nombre} /> {j.nombre} {listo ? '✓' : '…'}
          </span>
        );
      })}
    </div>
  );
}

const MOTIVO_GATE = {
  retrato: 'Va a escribir su respuesta en secreto. Que nadie más mire la pantalla.',
  eslogan: 'Va a escribir su respuesta en secreto. Que nadie más mire la pantalla.',
  pasaporte: 'Va a elegir el país en secreto. Que nadie más mire la pantalla.',
  mentiroso: 'Le toca responder (o votar) en secreto.',
  experto: 'Le toca elegir marca y responder.'
};

/** Formulario de respuesta escrita (retrato, eslogan) */
function Escribir({ ctx, placeholder = 'Escribe la marca…' }) {
  const [texto, setTexto] = useState('');
  useEffect(() => { setTexto(''); }, [ctx.claveRonda, ctx.actor]);
  const enviar = (e) => {
    e.preventDefault();
    if (texto.trim()) ctx.onAccion({ tipo: 'responder', jugadorId: ctx.actor, texto: texto.trim() });
  };
  return (
    <form onSubmit={enviar}>
      <input autoFocus type="text" className="lgm-input" placeholder={placeholder} maxLength={40} value={texto} onChange={(e) => setTexto(e.target.value)} autoComplete="off" autoCapitalize="off" spellCheck={false} />
      <button type="submit" className="lgm-boton" style={{ marginTop: '0.7rem' }} disabled={!texto.trim()}>
        <Icon name="check" size={20} strokeWidth={2.5} /> Enviar respuesta
      </button>
      {ctx.local && <p className="lgm-pista">{ctx.nombre(ctx.actor)}: que nadie más vea tu respuesta.</p>}
    </form>
  );
}

/* --------------------------------------------------------- El logomaníaco */
function Logomaniaco({ ronda, ctx }) {
  const activo = ctx.nombre(ronda.activoId);
  const soyActivo = !ctx.local && ctx.viewerId === ronda.activoId;
  const puedeEmpezar = ctx.local || soyActivo;
  const puedeJuzgar = ctx.local || (ctx.viewerId != null && ctx.viewerId !== ronda.activoId);
  const accion = (a) => ctx.onAccion({ jugadorId: ctx.actor ?? ctx.viewerId, ...a });

  const cabecera = (
    <Pregunta etiqueta={`${ronda.rebote ? 'Rebote' : 'Turno'} de ${activo}`}>
      <h2>{ronda.requisito}</h2>
      <div className="lgm-requisito">
        <span>🎯 Di {ronda.objetivo} marcas</span>
        <span>⏱️ 25 s</span>
        <span>{ronda.dificultad === 1 ? '🟢' : ronda.dificultad === 2 ? '🟡' : '🔴'} {DIFICULTAD[ronda.dificultad]}</span>
      </div>
    </Pregunta>
  );

  if (ronda.etapa === 'revelado') {
    const res = ronda.resultado || {};
    return (
      <>
        {cabecera}
        <div className="lgm-tarjeta">
          {ronda.saltada ? <Aviso>Ronda saltada por el anfitrión.</Aviso>
            : res.ganadorId ? <Aviso tipo="bien">¡{ctx.nombre(res.ganadorId)} lo ha conseguido{res.rebote ? ' en el rebote' : ''}! +{res.puntos}</Aviso>
              : <Aviso tipo="mal">{ronda.fallos?.length > 1 ? 'Ni el primero ni el rebote: nadie suma.' : 'No lo ha conseguido. Nadie suma.'}</Aviso>}
          {ronda.ejemplos?.length > 0 && <p className="lgm-ejemplos"><strong>Algunas que valían:</strong> {ronda.ejemplos.join(', ')}.</p>}
        </div>
      </>
    );
  }

  if (ronda.etapa === 'preparado') {
    return (
      <>
        {cabecera}
        <div className="lgm-tarjeta lgm-centro">
          {ronda.rebote && <Aviso tipo="mal">{ctx.nombre(ronda.primeroId)} no lo ha conseguido. ¡Rebote para {activo}, y solo para {activo}!</Aviso>}
          <Avatar id={ronda.activoId} nombre={activo} grande />
          {puedeEmpezar ? (
            <>
              <h2 className="lgm-titulo">{ctx.local ? `${activo}, ¿preparado?` : '¡Te toca!'}</h2>
              <p className="lgm-texto">Cuando pulses, tendrás 25 segundos para decir {ronda.objetivo} marcas en voz alta. Sin repetir.</p>
              <button type="button" className="lgm-boton grande" onClick={() => accion({ tipo: 'empezar' })}><Icon name="play" size={20} /> ¡Empezar!</button>
            </>
          ) : (
            <>
              <h2 className="lgm-titulo">{activo} se prepara…</h2>
              <p className="lgm-texto">Cuando empiece, escuchad y validad: ¿dice {ronda.objetivo} marcas que valgan?</p>
            </>
          )}
        </div>
      </>
    );
  }

  // jugando
  return (
    <>
      {cabecera}
      <div className="lgm-tarjeta">
        <Reloj restante={ctx.restante} total={ronda.totalMs} />
        {soyActivo && <Aviso>¡Dilas en voz alta! Los demás deciden si valen.</Aviso>}
        {puedeJuzgar && (
          <>
            <p className="lgm-texto">{ctx.local ? `¿Ha dicho ${activo} ${ronda.objetivo} marcas que valgan?` : `¿Ha dicho ${activo} ${ronda.objetivo} marcas que valgan? Cualquiera de vosotros puede decidirlo.`}</p>
            <div className="lgm-dos">
              <button type="button" className="lgm-boton grande" onClick={() => accion({ tipo: 'veredicto', conseguido: true })}>✅ Lo ha conseguido</button>
              <button type="button" className="lgm-boton peligro grande" onClick={() => accion({ tipo: 'veredicto', conseguido: false })}>❌ Ha fallado</button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- El pintor */
function Trazos({ trazos }) {
  return (
    <svg viewBox="0 0 1000 1000" aria-hidden="true">
      <rect width="1000" height="1000" fill="#ffffff" />
      {(trazos || []).map((t, i) => {
        const color = PINCEL[t.c] || '#0f172a';
        const g = GROSORES[t.g] || 6;
        if (t.p.length === 2) return <circle key={i} cx={t.p[0]} cy={t.p[1]} r={g / 2} fill={color} />;
        const pts = [];
        for (let k = 0; k < t.p.length; k += 2) pts.push(`${t.p[k]},${t.p[k + 1]}`);
        return <polyline key={i} points={pts.join(' ')} fill="none" stroke={color} strokeWidth={g} strokeLinecap="round" strokeLinejoin="round" />;
      })}
    </svg>
  );
}

function Lienzo({ marca, onTrazos }) {
  const canvas = useRef(null);
  const [trazos, setTrazos] = useState([]);
  const [color, setColor] = useState(0);
  const [grosor, setGrosor] = useState(1);
  const actual = useRef(null);
  const trazosRef = useRef(trazos);
  trazosRef.current = trazos;
  const envio = useRef({ t: 0, pendiente: null });

  // Marca nueva: lienzo en blanco
  useEffect(() => { setTrazos([]); }, [marca]);

  const enviar = useCallback((lista, ya = false) => {
    const e = envio.current;
    clearTimeout(e.pendiente);
    const falta = 650 - (Date.now() - e.t);
    if (ya || falta <= 0) { e.t = Date.now(); onTrazos(lista); } else e.pendiente = setTimeout(() => { e.t = Date.now(); onTrazos(trazosRef.current); }, falta);
  }, [onTrazos]);
  useEffect(() => () => clearTimeout(envio.current.pendiente), []);

  const pintar = (lista) => {
    const c = canvas.current; if (!c) return;
    const ctx = c.getContext('2d');
    const k = c.width / 1000;
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, c.width, c.height);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const t of lista) {
      ctx.strokeStyle = PINCEL[t.c]; ctx.fillStyle = PINCEL[t.c]; ctx.lineWidth = GROSORES[t.g] * k;
      if (t.p.length === 2) { ctx.beginPath(); ctx.arc(t.p[0] * k, t.p[1] * k, (GROSORES[t.g] * k) / 2, 0, Math.PI * 2); ctx.fill(); continue; }
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
    if (Math.hypot(x - p[p.length - 2], y - p[p.length - 1]) < 6) return;
    p.push(x, y);
    const lista = [...trazos, actual.current];
    pintar(lista);
    enviar(lista);
  };
  const subir = () => {
    if (!actual.current) return;
    const t = actual.current; actual.current = null;
    const lista = [...trazosRef.current, t];
    setTrazos(lista);
    enviar(lista, true);
  };
  const cambiar = (lista) => { setTrazos(lista); enviar(lista, true); };

  return (
    <>
      <div className="lgm-lienzo">
        <canvas ref={canvas} onPointerDown={bajar} onPointerMove={mover} onPointerUp={subir} onPointerCancel={subir} onPointerLeave={subir} />
      </div>
      <div className="lgm-herramientas">
        {PINCEL.map((c, i) => <button key={c} type="button" className={`lgm-color${color === i ? ' sel' : ''}`} style={{ '--c': c }} onClick={() => setColor(i)} aria-label={i === PINCEL.length - 1 ? 'Goma' : `Color ${i + 1}`} />)}
      </div>
      <div className="lgm-herramientas">
        {GROSORES.map((g, i) => <button key={g} type="button" className={`lgm-grosor${grosor === i ? ' sel' : ''}`} onClick={() => setGrosor(i)} aria-label={`Grosor ${i + 1}`}><i style={{ width: 4 + i * 6, height: 4 + i * 6 }} /></button>)}
        <button type="button" className="lgm-herr-btn" disabled={!trazos.length} onClick={() => cambiar(trazos.slice(0, -1))}>↩ Deshacer</button>
        <button type="button" className="lgm-herr-btn" disabled={!trazos.length} onClick={() => cambiar([])}>🗑️ Borrar</button>
      </div>
    </>
  );
}

function Pintor({ ronda, ctx }) {
  const pintor = ctx.nombre(ronda.pintorId);
  const soyPintor = ctx.viewerId === ronda.pintorId;
  const [texto, setTexto] = useState('');
  const [destello, setDestello] = useState(0);
  const aciertosPrevios = useRef(ronda.aciertos);
  useEffect(() => {
    if (ronda.aciertos > aciertosPrevios.current) setDestello((n) => n + 1);
    aciertosPrevios.current = ronda.aciertos;
  }, [ronda.aciertos]);
  const onTrazos = useCallback((trazos) => ctx.onAccion({ tipo: 'trazos', trazos }), [ctx.onAccion]); // eslint-disable-line react-hooks/exhaustive-deps

  const historial = (
    <div className="lgm-feed">
      {ronda.historial.map((h, i) => (
        <span key={`h${i}`} className={h.adivinoId ? 'bien' : ''}>{h.adivinoId ? `✅ ${h.marca} · ${ctx.nombre(h.adivinoId)}` : `⏭️ ${h.marca}`}</span>
      ))}
    </div>
  );

  if (ronda.etapa === 'revelado') {
    return (
      <div className="lgm-tarjeta">
        <p className="lgm-etiqueta">El pintor · turno de {pintor}</p>
        <h2 className="lgm-titulo izquierda">{ronda.saltada ? 'Turno saltado' : `¡${ronda.aciertos} ${ronda.aciertos === 1 ? 'logo adivinado' : 'logos adivinados'}!`}</h2>
        {ronda.historial.length ? historial : <p className="lgm-texto">No dio tiempo a adivinar ninguno.</p>}
      </div>
    );
  }

  if (ronda.etapa === 'preparado') {
    return (
      <div className="lgm-tarjeta lgm-centro">
        <Avatar id={ronda.pintorId} nombre={pintor} grande />
        {soyPintor ? (
          <>
            <h2 className="lgm-titulo">¡Te toca pintar!</h2>
            <p className="lgm-texto">Verás una marca: dibuja su logo para que la adivinen. Tienes <strong>60 segundos</strong> para colar todas las que puedas. Nada de escribir letras.</p>
            <button type="button" className="lgm-boton grande" onClick={() => ctx.onAccion({ tipo: 'empezar' })}><Icon name="play" size={20} /> ¡Empezar!</button>
          </>
        ) : (
          <>
            <h2 className="lgm-titulo">{pintor} va a pintar</h2>
            <p className="lgm-texto">Mira su dibujo y escribe la marca. ¡El primero que acierte se lleva el punto!</p>
          </>
        )}
      </div>
    );
  }

  // jugando
  const enviar = (e) => {
    e.preventDefault();
    if (!texto.trim()) return;
    ctx.onAccion({ tipo: 'adivinar', texto: texto.trim() });
    setTexto('');
  };
  return (
    <div className="lgm-tarjeta">
      <Reloj restante={ctx.restante} total={ronda.totalMs} />
      {soyPintor ? (
        <>
          <p className="lgm-etiqueta centrada">Dibuja el logo de</p>
          <p className="lgm-marca-grande">{ronda.actual}</p>
          <Lienzo marca={ronda.actual} onTrazos={onTrazos} />
          <button type="button" className="lgm-boton secundario" style={{ marginTop: '0.7rem' }} onClick={() => ctx.onAccion({ tipo: 'pasar' })}>⏭️ Pasar a otra marca</button>
        </>
      ) : (
        <>
          <div key={destello} className={`lgm-lienzo${destello ? ' lgm-destello' : ''}`}><Trazos trazos={ronda.trazos} /></div>
          {ronda.pista && <p className="lgm-pista-letras" aria-label="Letras de la marca">{ronda.pista}</p>}
          <form className="lgm-adivinar" onSubmit={enviar}>
            <input type="text" className="lgm-input" placeholder="¿Qué marca es?" maxLength={40} value={texto} onChange={(e) => setTexto(e.target.value)} autoComplete="off" autoCapitalize="off" spellCheck={false} />
            <button type="submit" className="lgm-boton" disabled={!texto.trim()}>Enviar</button>
          </form>
          {ronda.fallidas?.length > 0 && (
            <div className="lgm-feed">{ronda.fallidas.slice(-6).map((f, i) => <span key={`f${i}`}>❌ {ctx.nombre(f.id)}: {f.texto}</span>)}</div>
          )}
        </>
      )}
      <p className="lgm-etiqueta" style={{ marginTop: '0.8rem' }}>Adivinados: {ronda.aciertos}</p>
      {historial}
    </div>
  );
}

/* --------------------------------------------- Retrato robot y Eslogan */
function EscribirMarca({ ronda, ctx }) {
  const rev = ronda.etapa === 'revelado';
  const esEslogan = ronda.tipo === 'eslogan';
  const etiqueta = esEslogan ? '¿De qué marca es este eslogan?' : '¿De qué marca es este logo?';
  const enunciado = (
    <Pregunta etiqueta={etiqueta}>
      {esEslogan ? <p className="lgm-cita">«{ronda.texto}»</p> : <h2>{ronda.texto}</h2>}
    </Pregunta>
  );
  if (rev) {
    const ganadores = ronda.resultado?.ganadores || [];
    const respuestas = ronda.respuestas || {};
    return (
      <>
        {enunciado}
        <div className="lgm-tarjeta lgm-centro">
          <p className="lgm-etiqueta centrada">Era</p>
          <p className="lgm-marca-grande">{ronda.marca}</p>
          {ronda.saltada && <Aviso>Ronda saltada por el anfitrión.</Aviso>}
          <div className="lgm-respuestas">
            {ctx.jugadores.filter((j) => !j.ausente).map((j) => {
              const bien = ganadores.includes(j.id);
              return (
                <div key={j.id} className={`lgm-respuesta ${bien ? 'bien' : 'mal'}`}>
                  <span><Avatar id={j.id} nombre={j.nombre} /> {j.nombre}</span>
                  <strong>{respuestas[j.id] ? `«${respuestas[j.id]}»` : '—'} {bien ? `+${ronda.resultado.puntos}` : ''}</strong>
                </div>
              );
            })}
          </div>
        </div>
      </>
    );
  }
  return (
    <>
      {enunciado}
      <div className="lgm-tarjeta">
        <Reloj restante={ctx.restante} total={ronda.totalMs} />
        {ctx.soyPendiente ? <Escribir ctx={ctx} /> : <Aviso tipo="bien">Respuesta enviada. Esperando al resto…</Aviso>}
        <ChipsEspera jugadores={ctx.jugadores} listos={ronda.respondieron} />
      </div>
    </>
  );
}

/* --------------------------------------------------------------- Pasaporte */
function Pasaporte({ ronda, ctx }) {
  const rev = ronda.etapa === 'revelado';
  const respuestas = ronda.respuestas || {};
  const quien = (i) => Object.entries(respuestas).filter(([, op]) => op === i).map(([id]) => Number(id));
  return (
    <>
      <Pregunta etiqueta="¿De qué país es esta marca?">
        <p className="lgm-marca-grande">{ronda.marca}</p>
      </Pregunta>
      <div className="lgm-tarjeta">
        {!rev && <Reloj restante={ctx.restante} total={ronda.totalMs} />}
        <div className="lgm-opciones">
          {ronda.opciones.map((op, i) => {
            let clase = '';
            if (rev) clase = i === ronda.correcta ? 'correcta' : (quien(i).length ? 'incorrecta' : 'apagada');
            else if (ronda.miRespuesta === i) clase = 'elegida';
            return (
              <button key={op} type="button" className={`lgm-opcion ${clase}`} disabled={rev || !ctx.soyPendiente} onClick={() => ctx.onAccion({ tipo: 'responder', jugadorId: ctx.actor, opcion: i })}>
                <span className="lgm-letra">{LETRAS[i]}</span>
                <span className="lgm-opcion-texto">{op}</span>
                {rev && quien(i).length > 0 && <span className="lgm-quien">{quien(i).map((id) => <Avatar key={id} id={id} nombre={ctx.nombre(id)} />)}</span>}
              </button>
            );
          })}
        </div>
        {rev ? (
          ronda.saltada ? <Aviso>Ronda saltada por el anfitrión.</Aviso>
            : ronda.resultado?.ganadores?.length ? <Aviso tipo="bien">Aciertan {ronda.resultado.ganadores.map((id) => ctx.nombre(id)).join(', ')} (+{ronda.resultado.puntos})</Aviso>
              : <Aviso tipo="mal">Nadie ha acertado.</Aviso>
        ) : (
          <>
            {!ctx.soyPendiente && ronda.respondieron.includes(ctx.actor) && <Aviso tipo="bien">Elección enviada. Esperando al resto…</Aviso>}
            <ChipsEspera jugadores={ctx.jugadores} listos={ronda.respondieron} />
          </>
        )}
      </div>
    </>
  );
}

/* --------------------------------------------------------------- Mentiroso */
function Mentiroso({ ronda, ctx }) {
  const activo = ctx.nombre(ronda.activoId);
  const dice = ronda.respuesta === true ? '✅ VERDAD' : ronda.respuesta === false ? '❌ MENTIRA' : '— (no respondió)';
  const enunciado = (
    <Pregunta etiqueta={`Turno de ${activo} · ¿verdad o mentira?`}>
      <h2>{ronda.afirmacion}</h2>
    </Pregunta>
  );

  if (ronda.etapa === 'revelado') {
    const delta = ronda.resultado?.delta || {};
    const votos = ronda.votos || {};
    return (
      <>
        {enunciado}
        <div className="lgm-tarjeta lgm-centro">
          <p className="lgm-etiqueta centrada">Era</p>
          <p className="lgm-marca-grande">{ronda.verdad ? '✅ Verdad' : '❌ Mentira'}</p>
          {ronda.explicacion && <p className="lgm-texto">{ronda.explicacion}</p>}
          {ronda.saltada ? <Aviso>Ronda saltada por el anfitrión.</Aviso> : (
            <>
              <Aviso tipo={ronda.resultado?.acierta ? 'bien' : 'mal'}>{activo} dijo {dice}: {ronda.resultado?.acierta ? `¡acierta! +1` : 'falla.'}</Aviso>
              <div className="lgm-respuestas">
                {Object.entries(votos).map(([id, v]) => {
                  const d = delta[id] || 0;
                  return (
                    <div key={id} className={`lgm-respuesta ${d > 0 ? 'bien' : d < 0 ? 'mal' : ''}`}>
                      <span><Avatar id={Number(id)} nombre={ctx.nombre(Number(id))} /> {ctx.nombre(Number(id))}</span>
                      <strong>{v === 'confio' ? '🤝 Confió' : '🕵️ Desconfió'} {d ? `${d > 0 ? '+' : ''}${d}` : '0'}</strong>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </>
    );
  }

  if (ronda.etapa === 'responder') {
    return (
      <>
        {enunciado}
        <div className="lgm-tarjeta">
          <Reloj restante={ctx.restante} total={ronda.totalMs} />
          {ctx.soyPendiente ? (
            <>
              <p className="lgm-texto">{activo}, ¿es verdad o mentira? Si aciertas, +1. Luego los demás decidirán si se fían de ti.</p>
              <div className="lgm-vf">
                <button type="button" className="lgm-boton grande" onClick={() => ctx.onAccion({ tipo: 'responder', jugadorId: ctx.actor, verdad: true })}>✅ Verdad</button>
                <button type="button" className="lgm-boton peligro grande" onClick={() => ctx.onAccion({ tipo: 'responder', jugadorId: ctx.actor, verdad: false })}>❌ Mentira</button>
              </div>
            </>
          ) : <p className="lgm-texto">{activo} está decidiendo si es verdad o mentira… Pensad si os vais a fiar.</p>}
        </div>
      </>
    );
  }

  // votar
  const yaVoto = ronda.votaron.includes(ctx.actor);
  return (
    <>
      {enunciado}
      <div className="lgm-tarjeta">
        <Reloj restante={ctx.restante} total={ronda.totalMs} />
        <Aviso>{activo} dice: <strong>{dice}</strong></Aviso>
        {ctx.soyPendiente ? (
          <>
            <p className="lgm-texto" style={{ marginTop: '0.6rem' }}>¿Te fías? Confías y falla: −1 · Desconfías y falla: +1 · Si acierta: 0.</p>
            <div className="lgm-vf">
              <button type="button" className="lgm-boton secundario grande" onClick={() => ctx.onAccion({ tipo: 'votar', jugadorId: ctx.actor, voto: 'confio' })}>🤝 Confío</button>
              <button type="button" className="lgm-boton peligro grande" onClick={() => ctx.onAccion({ tipo: 'votar', jugadorId: ctx.actor, voto: 'desconfio' })}>🕵️ Desconfío</button>
            </div>
          </>
        ) : (
          <p className="lgm-texto" style={{ marginTop: '0.6rem' }}>{yaVoto ? 'Voto enviado. Esperando al resto…' : 'Los demás están decidiendo si se fían…'}</p>
        )}
        <ChipsEspera jugadores={ctx.jugadores} listos={ronda.votaron} excluir={ronda.activoId} />
      </div>
    </>
  );
}

/* ----------------------------------------------------------------- Experto */
function Experto({ ronda, ctx }) {
  const activo = ctx.nombre(ronda.activoId);
  const rev = ronda.etapa === 'revelado';

  const duelo = (
    <div className="lgm-duelo">
      {ronda.marcas.map((m, i) => {
        const elegida = ronda.lado === i;
        let nota = null;
        if (rev) nota = <small>{i === ronda.dificilLado ? 'Escondía la difícil (+3)' : 'Escondía la fácil (+1)'}</small>;
        return (
          <React.Fragment key={m}>
            {i === 1 && <span className="lgm-duelo-vs">VS</span>}
            <button type="button" className={`lgm-marca-btn${elegida ? ' elegida' : ''}`} disabled={ronda.etapa !== 'elegir' || !ctx.soyPendiente} onClick={() => ctx.onAccion({ tipo: 'elegir', jugadorId: ctx.actor, lado: i })}>
              <span>{m}{nota}</span>
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );

  if (ronda.etapa === 'elegir') {
    return (
      <div className="lgm-tarjeta">
        <p className="lgm-etiqueta">Turno de {activo}</p>
        <Reloj restante={ctx.restante} total={ronda.totalMs} />
        <p className="lgm-texto">{ctx.soyPendiente ? 'Elige una marca. Una esconde una pregunta muy difícil (+3) y la otra una fácil (+1).' : `${activo} está eligiendo marca…`}</p>
        {duelo}
      </div>
    );
  }

  const marca = ronda.marcas[ronda.lado];
  return (
    <>
      <Pregunta etiqueta={`${marca} · turno de ${activo}`}>
        <h2>{ronda.pregunta}</h2>
      </Pregunta>
      <div className="lgm-tarjeta">
        {!rev && <Reloj restante={ctx.restante} total={ronda.totalMs} />}
        <div className="lgm-opciones">
          {ronda.opciones.map((op, i) => {
            let clase = '';
            if (rev) clase = i === ronda.correcta ? 'correcta' : i === ronda.respuesta ? 'incorrecta' : 'apagada';
            return (
              <button key={op} type="button" className={`lgm-opcion ${clase}`} disabled={rev || !ctx.soyPendiente} onClick={() => ctx.onAccion({ tipo: 'responder', jugadorId: ctx.actor, opcion: i })}>
                <span className="lgm-letra">{LETRAS[i]}</span><span className="lgm-opcion-texto">{op}</span>
              </button>
            );
          })}
        </div>
        {!rev && !ctx.soyPendiente && <p className="lgm-pista">{activo} está respondiendo…</p>}
        {rev && (
          <>
            {ronda.saltada ? <Aviso>Turno saltado por el anfitrión.</Aviso>
              : ronda.resultado?.acierta ? <Aviso tipo="bien">¡{activo} acierta la {ronda.resultado.dificil ? 'difícil' : 'fácil'}! +{ronda.resultado.puntos}</Aviso>
                : <Aviso tipo="mal">{activo} falla la {ronda.resultado?.dificil ? 'difícil' : 'fácil'}. 0 puntos.</Aviso>}
            <div style={{ marginTop: '0.8rem' }}>{duelo}</div>
          </>
        )}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------- Final */
function Podio({ jugadores, yoId }) {
  const orden = [...jugadores].sort((a, b) => b.puntos - a.puntos);
  const maximo = orden[0]?.puntos ?? 0;
  const ganadores = maximo > 0 ? orden.filter((j) => j.puntos === maximo) : [];
  const top = orden.slice(0, 3);
  const alturas = ['primero', 'segundo', 'tercero'];
  const colocacion = top.length === 3 ? [top[1], top[0], top[2]] : top.length === 2 ? [top[1], top[0]] : top;
  return (
    <div className="lgm-tarjeta lgm-centro">
      <p className="lgm-etiqueta centrada">Final de la partida</p>
      <h2 className="lgm-ganador">
        {ganadores.length === 0 ? 'Nadie ha puntuado' : ganadores.length > 1 ? `¡Empate entre ${ganadores.map((g) => g.nombre).join(' y ')}!` : `¡${ganadores[0].nombre} es el rey de las marcas!`}
      </h2>
      {maximo > 0 && <p className="lgm-texto">Con <strong>{maximo} puntos</strong>.</p>}
      <div className="lgm-podio">
        {colocacion.map((j) => {
          const puesto = orden.filter((o) => o.puntos > j.puntos).length;
          return (
            <div key={j.id} className={`lgm-podio-col ${alturas[Math.min(puesto, 2)]}`} style={{ '--c': colorDe(j.id) }}>
              <Avatar id={j.id} nombre={j.nombre} grande />
              <span className="lgm-podio-nombre">{j.nombre}{j.id === yoId ? ' (tú)' : ''}</span>
              <span className="lgm-podio-pts">{j.puntos} pts</span>
              <span className="lgm-podio-base">{puesto + 1}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Clasificacion({ jugadores, yoId, deltas = null }) {
  const ranking = [...jugadores].sort((a, b) => b.puntos - a.puntos);
  const maximo = ranking[0]?.puntos ?? 0;
  return (
    <ol className="lgm-ranking">
      {ranking.map((j) => (
        <li key={j.id} className={maximo > 0 && j.puntos === maximo ? 'lider' : ''}>
          <span className="lgm-pos">{ranking.filter((o) => o.puntos > j.puntos).length + 1}</span>
          <Avatar id={j.id} nombre={j.nombre} />
          <span className="lgm-ranking-nombre">{j.nombre}{j.id === yoId ? ' (tú)' : ''}{j.ausente ? ' · salió' : ''}</span>
          {deltas && deltas[j.id] ? <span className={`lgm-delta ${deltas[j.id] > 0 ? 'mas' : 'menos'}`}>{deltas[j.id] > 0 ? '+' : ''}{deltas[j.id]}</span> : null}
          <strong>{j.puntos}</strong>
        </li>
      ))}
    </ol>
  );
}

/* --------------------------------------------------------------- Componente */
export default function LogosPartida({
  vista, viewerId = null, local = false, esHost = false, sostiene = null, setSostiene = () => {},
  onAccion, onTiempo, onSalir, finalAcciones = null
}) {
  const ronda = vista.ronda;
  const info = FASES_INFO[vista.fase] || FASES_INFO.logomaniaco;

  // --- cuenta atrás: el servidor envía los ms restantes y aquí se descuentan entre consultas
  const [, setTic] = useState(0);
  const vistaRef = useRef(null);
  const recibidoRef = useRef(Date.now());
  if (vistaRef.current !== vista) {
    vistaRef.current = vista;
    recibidoRef.current = Date.now();
  }
  const hayReloj = ronda?.restanteMs != null && vista.estado === 'ronda';
  useEffect(() => {
    if (!hayReloj) return undefined;
    const id = setInterval(() => setTic((t) => t + 1), 250);
    return () => clearInterval(id);
  }, [hayReloj]);
  const restante = hayReloj ? Math.max(0, ronda.restanteMs - (Date.now() - recibidoRef.current)) : null;
  const claveRonda = ronda ? `${vista.faseIdx}-${vista.rondaNum}-${ronda.etapa}` : `${vista.faseIdx}-${vista.estado}`;

  // Modo local: al llegar a 0 se avisa al motor (en online lo resuelve el servidor)
  const enviadoRef = useRef(null);
  useEffect(() => {
    if (!local || restante == null || restante > 0) return;
    if (enviadoRef.current === claveRonda) return;
    enviadoRef.current = claveRonda;
    if (onTiempo) onTiempo();
  }, [local, restante, claveRonda, onTiempo]);

  // Modo local: en cada ronda nueva hay que volver a «pasar el móvil»
  useEffect(() => {
    if (local) setSostiene(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [local, vista.faseIdx, vista.rondaNum, ronda?.etapa]);

  // Puntos al empezar cada ronda, para mostrar lo que ha sumado cada uno al terminarla
  const inicioRonda = useRef({ clave: null, puntos: {} });
  const claveBase = `${vista.faseIdx}-${vista.rondaNum}`;
  if (vista.estado === 'ronda' && inicioRonda.current.clave !== claveBase) {
    inicioRonda.current = { clave: claveBase, puntos: Object.fromEntries(vista.jugadores.map((j) => [j.id, j.puntos])) };
  }
  const deltas = vista.estado === 'resultado' && inicioRonda.current.clave === claveBase
    ? Object.fromEntries(vista.jugadores.map((j) => [j.id, j.puntos - (inicioRonda.current.puntos[j.id] ?? j.puntos)]))
    : null;

  // --- quién tiene que actuar ahora (para «pasar el móvil» en local)
  const jugadores = vista.jugadores;
  const presentes = jugadores.filter((j) => !j.ausente);
  const nombre = (id) => jugadores.find((j) => j.id === id)?.nombre ?? '—';

  let pendientes = [];
  let turno = null;
  if (vista.estado === 'ronda' && ronda && ronda.etapa !== 'revelado') {
    switch (ronda.tipo) {
      case 'retrato': case 'eslogan': case 'pasaporte':
        pendientes = presentes.filter((j) => !ronda.respondieron.includes(j.id)).map((j) => j.id);
        break;
      case 'mentiroso':
        turno = ronda.activoId;
        pendientes = ronda.etapa === 'responder' ? [ronda.activoId] : presentes.filter((j) => j.id !== ronda.activoId && !ronda.votaron.includes(j.id)).map((j) => j.id);
        break;
      case 'experto':
        turno = ronda.activoId;
        pendientes = [ronda.activoId];
        break;
      case 'logomaniaco':
        turno = ronda.activoId; // sin «pasar el móvil»: todos miran y validan
        break;
      case 'pintor':
        turno = ronda.pintorId;
        break;
      default:
        break;
    }
  }
  const actor = local ? sostiene : viewerId;
  const soyPendiente = pendientes.includes(actor);
  const hayGate = local && pendientes.length > 0 && !pendientes.includes(sostiene);

  const ctx = { local, actor, viewerId, soyPendiente, nombre, jugadores, restante, claveRonda, onAccion };

  const continuar = () => onAccion({ tipo: 'continuar' });
  const saltar = () => onAccion({ tipo: 'saltar' });
  const finalizar = () => onAccion({ tipo: 'finalizar' });

  const fin = vista.estado === 'fin';
  useRegistrarPartida('logos', fin ? ganadoresPorPuntos(jugadores.filter((j) => !j.ausente).map((j) => ({ nombre: j.nombre, puntos: j.puntos ?? null }))) : null);
  const maximo = Math.max(0, ...jugadores.map((j) => j.puntos));

  const hero = (
    <header className={`lgm-hero ${fin ? 'fin' : ''}`}>
      <div className="lgm-hero-top">
        <button type="button" className="lgm-salir" onClick={onSalir}><Icon name="door" size={15} /> Salir</button>
        <div className="lgm-chips">
          {!fin && <span className="lgm-chip">Fase {vista.faseIdx + 1}/{vista.fases.length}</span>}
          {!fin && vista.estado !== 'intro' && <span className="lgm-chip">Ronda {vista.rondaNum}/{vista.totalRondas}</span>}
          {restante != null && <span className={`lgm-chip ${restante <= 5000 ? 'urgente' : ''}`}><Icon name="clock" size={13} /> {Math.ceil(restante / 1000)} s</span>}
        </div>
      </div>
      <p className="lgm-hero-etiqueta">{fin ? 'Fin de la partida' : info.lema}</p>
      <h1 className="lgm-hero-titulo">{fin ? '🏆 Clasificación' : `${info.emoji} ${info.nombre}`}</h1>
      <div className="lgm-marcador">
        {jugadores.map((j) => (
          <span key={j.id} className={`lgm-marca${j.ausente ? ' fuera' : ''}${turno === j.id ? ' turno' : ''}${j.id === viewerId ? ' yo' : ''}${maximo > 0 && j.puntos === maximo ? ' lider' : ''}`}>
            <Avatar id={j.id} nombre={j.nombre} />
            <span className="lgm-marca-nombre">{j.nombre}</span>
            <strong>{j.puntos}</strong>
            {deltas && deltas[j.id] ? <em className={deltas[j.id] > 0 ? 'mas' : 'menos'}>{deltas[j.id] > 0 ? '+' : ''}{deltas[j.id]}</em> : null}
          </span>
        ))}
      </div>
    </header>
  );

  if (fin) {
    return (
      <section className="game lgm-escena">
        {hero}
        <Podio jugadores={jugadores} yoId={viewerId} />
        <div className="lgm-tarjeta">
          <p className="lgm-etiqueta">Clasificación</p>
          <Clasificacion jugadores={jugadores} yoId={viewerId} />
        </div>
        {finalAcciones}
      </section>
    );
  }

  if (vista.estado === 'intro') {
    const siguiente = vista.faseIdx + 1 < vista.fases.length ? FASES_INFO[vista.fases[vista.faseIdx + 1]] : null;
    return (
      <section className="game lgm-escena">
        {hero}
        <div className="lgm-tarjeta">
          <div className="lgm-intro-cab">
            <span className="lgm-intro-emoji">{info.emoji}</span>
            <div>
              <p className="lgm-etiqueta">Fase {vista.faseIdx + 1} · {vista.totalRondas} {vista.totalRondas === 1 ? 'ronda' : 'rondas'}</p>
              <h2 className="lgm-titulo izquierda">{info.nombre}</h2>
            </div>
          </div>
          <ul className="lgm-reglas">
            {/* eslint-disable-next-line react/no-danger */}
            {info.reglas.map((r, i) => <li key={i} dangerouslySetInnerHTML={{ __html: r }} />)}
          </ul>
          {siguiente && <p className="lgm-pista">Después: {siguiente.emoji} {siguiente.nombre}</p>}
        </div>
        <div className="lgm-barra">
          {esHost ? (
            <>
              <button type="button" className="lgm-boton grande" onClick={continuar}><Icon name="play" size={22} /> ¡Empezar {info.nombre}!</button>
              <button type="button" className="lgm-enlace" onClick={finalizar}><Icon name="flagFinish" size={15} /> Terminar la partida ahora</button>
            </>
          ) : <p className="lgm-esperando">⏳ Esperando a que el anfitrión empiece la fase…</p>}
        </div>
      </section>
    );
  }

  const enResultado = vista.estado === 'resultado';
  let textoSiguiente;
  if (vista.rondaNum < vista.totalRondas) textoSiguiente = `Siguiente ronda (${vista.rondaNum + 1}/${vista.totalRondas})`;
  else if (vista.faseIdx + 1 < vista.fases.length) textoSiguiente = `Siguiente fase: ${FASES_INFO[vista.fases[vista.faseIdx + 1]].nombre}`;
  else textoSiguiente = 'Ver la clasificación final';

  let contenido = null;
  if (ronda) {
    switch (ronda.tipo) {
      case 'logomaniaco': contenido = <Logomaniaco ronda={ronda} ctx={ctx} />; break;
      case 'pintor': contenido = <Pintor ronda={ronda} ctx={ctx} />; break;
      case 'retrato': case 'eslogan': contenido = <EscribirMarca ronda={ronda} ctx={ctx} />; break;
      case 'pasaporte': contenido = <Pasaporte ronda={ronda} ctx={ctx} />; break;
      case 'mentiroso': contenido = <Mentiroso ronda={ronda} ctx={ctx} />; break;
      case 'experto': contenido = <Experto ronda={ronda} ctx={ctx} />; break;
      default: break;
    }
  }

  return (
    <section className="game lgm-escena">
      {hero}
      {hayGate ? <Gate id={pendientes[0]} nombre={nombre(pendientes[0])} motivo={MOTIVO_GATE[ronda.tipo]} onAbrir={() => setSostiene(pendientes[0])} /> : contenido}

      {enResultado && (
        <div className="lgm-tarjeta">
          <p className="lgm-etiqueta">Clasificación</p>
          <Clasificacion jugadores={jugadores} yoId={viewerId} deltas={deltas} />
        </div>
      )}

      <div className={`lgm-barra${enResultado ? '' : ' estatica'}`}>
        {enResultado && (esHost ? (
          <>
            <button type="button" className="lgm-boton grande" onClick={continuar}><Icon name="play" size={20} /> {textoSiguiente}</button>
            <button type="button" className="lgm-enlace" onClick={finalizar}><Icon name="flagFinish" size={15} /> Terminar la partida ahora</button>
          </>
        ) : <p className="lgm-esperando">⏳ Esperando al anfitrión…</p>)}
        {!enResultado && esHost && (
          <button type="button" className="lgm-enlace" onClick={saltar}><Icon name="forward" size={15} /> Saltar esta ronda</button>
        )}
      </div>
    </section>
  );
}
