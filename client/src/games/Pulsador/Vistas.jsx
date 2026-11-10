// client/src/games/Pulsador/Vistas.jsx
// Pantallas comunes de los juegos de pulsador (El paparazzi, Luces, Cámara... ¡Música! y Frases Célebres), online y en
// un solo dispositivo, con el lenguaje de los juegos renovados. Cada juego cambia colores y textos (ver juegos.js).
import React, { useEffect, useRef, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import { OPCIONES_RONDAS } from './engine.js';
import './Pulsador.css';

export const COLORES = ['#ef4444', '#2563eb', '#16a34a', '#f59e0b', '#9333ea', '#ec4899', '#0d9488', '#ea580c', '#475569', '#65a30d', '#6366f1', '#0ea5e9', '#e11d48', '#84cc16', '#a855f7'];
export const colorDe = (id) => COLORES[((Number(id) || 1) - 1) % COLORES.length];
const inicial = (n) => (n || '?').trim().charAt(0).toUpperCase();
const nombreDe = (v, id) => v.jugadores.find((j) => j.id === id)?.nombre ?? '¿?';

export function Avatar({ id, nombre, grande = false }) {
  return <span className={`pzp-avatar${grande ? ' grande' : ''}`} style={{ '--c': colorDe(id) }}>{inicial(nombre)}</span>;
}

/** Se vuelve a pintar cada `ms` (relojes). */
function useLatido(ms = 200) {
  const [, set] = useState(0);
  useEffect(() => {
    const i = setInterval(() => set((x) => x + 1), ms);
    return () => clearInterval(i);
  }, [ms]);
}

/**
 * Reloj de la ronda en el tiempo del cliente. `t0` es el instante (del servidor) en el que se tomó la vista y
 * `offset` lo que va el servidor por delante del cliente.
 */
export function relojDe(v, t0, offset = 0) {
  const ahora = Date.now() + offset;
  const corrido = v.corriendo ? Math.max(0, ahora - Math.max(t0, v.inicio)) : 0;
  const t = v.transcurrido + corrido;
  return {
    cuenta: Math.max(0, v.inicio - ahora),
    restante: Math.max(0, v.reglas.segRonda * 1000 - t),
    transcurrido: t,
    respuesta: v.pulsado ? Math.max(0, v.pulsado.hasta - ahora) : 0
  };
}

export function Hero({ v, juego, onSalir, etiqueta, titulo, clase = '' }) {
  return (
    <header className={`pzp-hero ${clase}`}>
      <span className="pzp-hero-fondo" aria-hidden="true">{juego.emoji}</span>
      <div className="pzp-hero-top">
        <button type="button" className="pzp-salir" onClick={onSalir}><Icon name="door" size={15} /> Salir</button>
        <span className="pzp-chip">{juego.emoji} Ronda {Math.min(v.ronda, v.rondas)}/{v.rondas}</span>
      </div>
      <p className="pzp-hero-etiqueta">{etiqueta}</p>
      <h1 className="pzp-hero-titulo">{titulo}</h1>
      <div className="pzp-marcador">
        {[...v.jugadores].sort((a, b) => b.puntos - a.puntos).map((j) => {
          const pulsa = v.pulsado?.jugadorId === j.id;
          const fuera = v.fase === 'jugando' && v.bloqueados.includes(j.id);
          const suma = v.sumas?.[j.id];
          return (
            <span key={j.id} className={`pzp-marca${pulsa ? ' pulsa' : ''}${fuera ? ' bloqueado' : ''}${j.id === v.yo?.id ? ' yo' : ''}${j.fuera ? ' fuera' : ''}`}>
              {fuera ? <span className="pzp-avatar" style={{ '--c': '#64748b' }}>✗</span> : <Avatar id={j.id} nombre={j.nombre} />}
              <span className="pzp-marca-nombre">{j.nombre}{j.id === v.yo?.id ? ' (tú)' : ''}</span>
              <span className="pzp-marca-datos">{j.puntos}</span>
              {suma ? <b className={suma > 0 ? 'mas' : 'menos'}>{suma > 0 ? '+' : ''}{suma}</b> : null}
            </span>
          );
        })}
      </div>
    </header>
  );
}

/** Barra del reloj de la ronda y lo que vale acertar ahora. */
function Reloj({ v, reloj }) {
  const total = v.reglas.segRonda * 1000;
  const pct = Math.max(0, Math.min(100, (reloj.restante / total) * 100));
  const s = Math.ceil(reloj.restante / 1000);
  const parado = Boolean(v.pulsado);
  return (
    <div className={`pzp-reloj${s <= 10 ? ' critico' : ''}${parado ? ' parado' : ''}`}>
      <span className="pzp-reloj-s"><Icon name={parado ? 'pause' : 'clock'} size={15} /> {s}s</span>
      <div className="pzp-reloj-barra"><span style={{ width: `${pct}%` }} /></div>
      <span className="pzp-vale">Vale <strong>{v.vale}</strong></span>
    </div>
  );
}

// ---------------------------------------------------------------- Estímulos
function Imagen({ pista }) {
  const [estado, setEstado] = useState('cargando');
  const [intento, setIntento] = useState(0);
  useEffect(() => { setEstado('cargando'); setIntento(0); }, [pista.valor]);
  const src = intento ? `${pista.valor}${pista.valor.includes('?') ? '&' : '?'}i=${intento}` : pista.valor;
  return (
    <div className="pzp-foto">
      {estado !== 'error' && (
        <img key={src} src={src} alt="Recorte de la foto de un famoso" onLoad={() => setEstado('lista')} onError={() => setEstado('error')}
          className={estado === 'lista' ? 'lista' : ''} draggable={false} />
      )}
      {estado === 'cargando' && <span className="pzp-foto-aviso"><span className="pzp-giro" aria-hidden="true" /> Revelando la foto…</span>}
      {estado === 'error' && (
        <span className="pzp-foto-aviso">
          No se ha podido cargar la foto.
          <button type="button" className="pzp-enlace oscuro" onClick={() => { setIntento((x) => x + 1); setEstado('cargando'); }}><Icon name="refresh" size={14} /> Reintentar</button>
        </span>
      )}
    </div>
  );
}

/** Fragmento de audio: suena mientras corre el reloj y se para cuando alguien pulsa. */
function Audio({ pista, sonar }) {
  const ref = useRef(null);
  const [estado, setEstado] = useState('cargando'); // cargando | sonando | parado | bloqueado | error
  const [progreso, setProgreso] = useState(0);
  const quiere = useRef(sonar);
  quiere.current = sonar;
  const intentar = () => {
    const a = ref.current;
    if (!a) return;
    a.play().then(() => setEstado('sonando')).catch(() => setEstado((e) => (e === 'error' ? e : 'bloqueado')));
  };
  useEffect(() => {
    const a = ref.current;
    if (!a || estado === 'error') return;
    if (sonar) intentar();
    else { a.pause(); if (estado === 'sonando') setEstado('parado'); }
  }, [sonar]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => ref.current?.pause(), []);
  return (
    <div className="pzp-audio">
      <audio
        ref={ref} src={pista.valor} preload="auto"
        onCanPlay={() => { if (quiere.current && ref.current?.paused) intentar(); else setEstado((e) => (e === 'cargando' ? 'parado' : e)); }}
        onTimeUpdate={(e) => setProgreso(e.currentTarget.duration ? e.currentTarget.currentTime / e.currentTarget.duration : 0)}
        onEnded={() => setEstado('parado')}
        onError={() => setEstado('error')}
      />
      <button type="button" className={`pzp-disco${estado === 'sonando' ? ' gira' : ''}`} disabled={estado === 'error'}
        onClick={() => (estado === 'sonando' ? (ref.current?.pause(), setEstado('parado')) : intentar())}
        aria-label={estado === 'sonando' ? 'Pausar' : 'Reproducir'}>
        <Icon name={estado === 'sonando' ? 'pause' : 'play'} size={26} />
      </button>
      <div className="pzp-audio-datos">
        <strong>
          {estado === 'sonando' && 'Sonando…'}
          {estado === 'cargando' && 'Cargando el fragmento…'}
          {estado === 'parado' && (sonar ? 'Toca para escuchar' : 'En pausa')}
          {estado === 'bloqueado' && '¡Toca para escuchar!'}
          {estado === 'error' && 'No se ha podido cargar el audio'}
        </strong>
        <span className="pzp-audio-barra"><span style={{ width: `${progreso * 100}%` }} /></span>
      </div>
    </div>
  );
}

function Pista({ pista, n, sonar }) {
  if (pista.tipo === 'imagen') return <Imagen pista={pista} />;
  if (pista.tipo === 'frase') return <blockquote className="pzp-frase">{pista.valor}</blockquote>;
  return (
    <div className={`pzp-pista ${pista.tipo}`}>
      <span className="pzp-pista-n">{n}</span>
      <div className="pzp-pista-cuerpo">
        <span className="pzp-pista-etiqueta">{pista.etiqueta}</span>
        {pista.tipo === 'audio' ? <Audio pista={pista} sonar={sonar} />
          : <p className={pista.tipo === 'hueco' ? 'pzp-hueco' : ''}>{pista.valor}</p>}
      </div>
    </div>
  );
}

/** Pistas destapadas y las que faltan (con lo que queda para la siguiente). */
export function Estimulo({ v, reloj, pistas = v.pistas, todas = false }) {
  const seg = v.reglas.segPistas || [0];
  const total = todas ? pistas.length : v.totalPistas;
  const multiples = total > 1;
  const sonar = v.fase === 'jugando' && !v.pulsado && reloj?.cuenta === 0;
  if (!multiples) {
    return (
      <div className="pzp-tarjeta pzp-estimulo">
        {pistas[0]?.tipo === 'imagen' && <p className="pzp-etiqueta centrada">{pistas[0].etiqueta}</p>}
        <Pista pista={pistas[0]} n={1} sonar={sonar} />
      </div>
    );
  }
  const puntos = v.reglas.puntosPista || [];
  return (
    <div className="pzp-pistas">
      {pistas.map((p, i) => <Pista key={i} pista={p} n={i + 1} sonar={sonar} />)}
      {!todas && Array.from({ length: total - pistas.length }, (_, k) => {
        const i = pistas.length + k;
        const falta = reloj ? Math.max(0, Math.ceil((seg[i] * 1000 - reloj.transcurrido) / 1000)) : null;
        return (
          <div key={i} className="pzp-pista oculta">
            <span className="pzp-pista-n">{i + 1}</span>
            <div className="pzp-pista-cuerpo">
              <span className="pzp-pista-etiqueta">Pista {i + 1}{puntos[i] != null ? ` · ${puntos[i]} pts` : ''}</span>
              <p>{k === 0 && falta != null ? (v.pulsado ? 'En pausa' : `Se destapa en ${falta}s`) : 'Bloqueada'}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Los cuatro autores (Frases Célebres). `onElegir` solo para quien puede responder. */
export function Opciones({ v, onElegir, elegida }) {
  const resuelta = v.fase !== 'jugando';
  return (
    <div className="pzp-opciones">
      {v.opciones.map((o) => {
        const clase = resuelta ? (o === v.correcta ? ' bien' : o === elegida ? ' mal' : ' apagada') : onElegir ? ' activa' : '';
        return (
          <button key={o} type="button" className={`pzp-opcion${clase}`} disabled={!onElegir || resuelta} onClick={() => onElegir?.(o)}>
            {o}
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------- Pulsador y respuesta
export function Pulsador({ onPulsar, deshabilitado, texto = '¡Lo sé!', motivo }) {
  return (
    <div className="pzp-pulsador-zona">
      <button type="button" className="pzp-pulsador" onClick={onPulsar} disabled={deshabilitado}>
        <span className="pzp-pulsador-cara"><Icon name="zap" size={30} />{texto}</span>
      </button>
      {motivo && <p className="pzp-motivo">{motivo}</p>}
    </div>
  );
}

function Cuenta({ ms, total }) {
  const pct = Math.max(0, Math.min(100, (ms / total) * 100));
  const s = Math.ceil(ms / 1000);
  return (
    <div className={`pzp-cuenta${s <= 5 ? ' critico' : ''}`}>
      <div className="pzp-cuenta-barra"><span style={{ width: `${pct}%` }} /></div>
      <strong>{s}s</strong>
    </div>
  );
}

function FormRespuesta({ v, reloj, juego, onEnviar, onTeclear, onCancelar, nombre }) {
  const [texto, setTexto] = useState('');
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus(); }, []);
  return (
    <form className="pzp-tarjeta pzp-form" onSubmit={(e) => { e.preventDefault(); if (texto.trim()) onEnviar(texto.trim()); }}>
      <p className="pzp-etiqueta">{nombre ? `Responde, ${nombre}` : 'Tu respuesta'} · vale {v.pulsado.vale}</p>
      <Cuenta ms={reloj.respuesta} total={v.reglas.segRespuesta * 1000} />
      <input ref={ref} className="pzp-input" type="text" value={texto} maxLength={80} placeholder={juego.placeholder}
        autoComplete="off" autoCorrect="off" spellCheck={false}
        onChange={(e) => { setTexto(e.target.value); onTeclear?.(e.target.value); }} />
      <p className="pzp-nota">{juego.notaRespuesta}</p>
      <div className={onCancelar ? 'pzp-dos' : ''}>
        {onCancelar && <button type="button" className="pzp-boton secundario" onClick={onCancelar}>Cancelar</button>}
        <button type="submit" className="pzp-boton" disabled={!texto.trim()}><Icon name="check" size={20} /> Responder</button>
      </div>
    </form>
  );
}

/** Un solo dispositivo: ¿quién ha pulsado? */
function QuienPulso({ v, reloj, onElegir, onCancelar }) {
  return (
    <div className="pzp-tarjeta pzp-form">
      <p className="pzp-etiqueta">🔴 Reloj parado · ¿quién ha pulsado?</p>
      <Cuenta ms={reloj.respuesta} total={v.reglas.segRespuesta * 1000} />
      <div className="pzp-quien">
        {v.jugadores.filter((j) => !j.fuera).map((j) => {
          const fuera = v.bloqueados.includes(j.id);
          return (
            <button key={j.id} type="button" className="pzp-quien-btn" disabled={fuera} onClick={() => onElegir(j.id)} style={{ '--c': colorDe(j.id) }}>
              <Avatar id={j.id} nombre={j.nombre} /> <span>{j.nombre}</span>{fuera && <small>ya falló</small>}
            </button>
          );
        })}
      </div>
      <button type="button" className="pzp-boton secundario" onClick={onCancelar}>Ha sido sin querer</button>
    </div>
  );
}

function Respondiendo({ v, reloj }) {
  return (
    <div className="pzp-tarjeta pzp-respondiendo">
      <Avatar id={v.pulsado.jugadorId} nombre={nombreDe(v, v.pulsado.jugadorId)} grande />
      <div>
        <p className="pzp-etiqueta">🔴 Reloj parado</p>
        <strong>{nombreDe(v, v.pulsado.jugadorId)} está respondiendo…</strong>
        {v.reglas.respuesta === 'texto' && <p className="pzp-tecleo">{v.pulsado.texto ? `«${v.pulsado.texto}»` : '…'}</p>}
        <Cuenta ms={reloj.respuesta} total={v.reglas.segRespuesta * 1000} />
      </div>
    </div>
  );
}

function Ultimo({ v }) {
  const u = v.log[v.log.length - 1];
  if (!u || u.tipo !== 'fallo') return null;
  return <p className="pzp-ultimo" key={u.n}>{u.texto}</p>;
}

/**
 * Pantalla de la ronda en juego.
 * local: un solo dispositivo (se elige quién pulsó). yoId: online. controles: anfitrión / grupo (pista, rendirse).
 */
export function PantallaJuego({ v, juego, t0, offset = 0, enviar, onSalir, local = false, controles = false }) {
  useLatido(200);
  const reloj = relojDe(v, t0, offset);
  const yo = v.yo?.id;
  const bloqueado = !local && v.bloqueados.includes(yo);
  const opciones = v.reglas.respuesta === 'opciones';
  const p = v.pulsado;
  const respondoYo = p && (local ? p.jugadorId != null : p.jugadorId === yo);
  const quedan = v.pistas.length < v.totalPistas;

  let abajo;
  if (!p) {
    abajo = (
      <Pulsador onPulsar={() => enviar('pulsar')} deshabilitado={reloj.cuenta > 0 || bloqueado}
        texto={reloj.cuenta > 0 ? `Empieza en ${Math.ceil(reloj.cuenta / 1000)}…` : juego.textoPulsador}
        motivo={bloqueado ? 'Has fallado: quedas fuera de esta ronda.' : local ? 'Quien lo sepa, que pulse y diga quién es.' : null} />
    );
  } else if (local && p.jugadorId == null) {
    abajo = <QuienPulso v={v} reloj={reloj} onElegir={(id) => enviar('identificar', { id })} onCancelar={() => enviar('cancelar')} />;
  } else if (respondoYo && !opciones) {
    abajo = (
      <FormRespuesta key={`${v.ronda}-${p.hasta}`} v={v} reloj={reloj} juego={juego} nombre={local ? nombreDe(v, p.jugadorId) : null}
        onEnviar={(t) => enviar('responder', { respuesta: t })} onTeclear={local ? null : (t) => enviar('teclear', { texto: t }, true)} />
    );
  } else if (respondoYo && opciones) {
    abajo = (
      <div className="pzp-tarjeta pzp-form">
        <p className="pzp-etiqueta">{local ? `Elige, ${nombreDe(v, p.jugadorId)}` : '¡Elige el autor!'} · +{p.vale} / −{v.reglas.fallo}</p>
        <Cuenta ms={reloj.respuesta} total={v.reglas.segRespuesta * 1000} />
      </div>
    );
  } else {
    abajo = <Respondiendo v={v} reloj={reloj} />;
  }

  return (
    <>
      <Hero v={v} juego={juego} onSalir={onSalir} etiqueta={juego.etiqueta(v)} titulo={juego.pregunta(v)} />
      <Reloj v={v} reloj={reloj} />
      {reloj.cuenta > 0 && <div className="pzp-cuentaatras" key={Math.ceil(reloj.cuenta / 1000)}>{Math.ceil(reloj.cuenta / 1000)}</div>}
      <Estimulo v={v} reloj={reloj} />
      {opciones && <Opciones v={v} onElegir={respondoYo ? (o) => enviar('responder', { respuesta: o }) : null} />}
      <Ultimo v={v} />
      <div className="pzp-barra">
        {abajo}
        {controles && !p && reloj.cuenta === 0 && (
          <div className="pzp-controles">
            {quedan && <button type="button" className="pzp-enlace" onClick={() => enviar('pista')}><Icon name="forward" size={15} /> Siguiente pista</button>}
            <button type="button" className="pzp-enlace" onClick={() => enviar('rendirse')}><Icon name="flagFinish" size={15} /> Nos rendimos</button>
          </div>
        )}
      </div>
    </>
  );
}

/** Fin de la ronda: la solución, quién ha acertado y lo que ha sumado cada uno. */
export function PantallaResultado({ v, juego, onSalir, children }) {
  const r = v.resultado || {};
  const s = v.solucion || {};
  const titulo = r.tipo === 'acierto' ? `¡${nombreDe(v, r.ganadorId)} acierta!` : r.tipo === 'tiempo' ? '¡Se acabó el tiempo!' : r.tipo === 'todos' ? 'Nadie ha acertado' : 'Os habéis rendido';
  const sumas = v.jugadores.filter((j) => v.sumas[j.id]).sort((a, b) => v.sumas[b.id] - v.sumas[a.id]);
  return (
    <>
      <Hero v={v} juego={juego} onSalir={onSalir} etiqueta={`Fin de la ronda ${v.ronda}`} titulo={titulo} clase={r.tipo === 'acierto' ? 'acierto' : 'fin'} />
      <div className="pzp-tarjeta pzp-solucion">
        <p className="pzp-etiqueta centrada">{juego.era}</p>
        {s.imagen && <Foto src={s.imagen} alt={s.titulo} />}
        <h2 className="pzp-solucion-titulo">{s.titulo}</h2>
        {s.detalle && <p className="pzp-solucion-detalle">{s.detalle}</p>}
        {s.frase && <blockquote className="pzp-frase chica">{s.frase}</blockquote>}
        {s.atribucion && (
          <p className="pzp-atribucion">
            Foto: {s.atribucion.autor}{s.atribucion.licencia ? ` · ${s.atribucion.licencia}` : ''}{s.atribucion.fuenteUrl && <> · <a href={s.atribucion.fuenteUrl} target="_blank" rel="noreferrer">fuente</a></>}
          </p>
        )}
        {r.tipo === 'acierto' && <p className="pzp-mensaje bien">+{r.puntos} puntos para {nombreDe(v, r.ganadorId)}</p>}
      </div>
      {v.reglas.respuesta === 'opciones' && <Opciones v={v} />}
      {v.pistas.length > 1 && <Estimulo v={v} todas />}
      {sumas.length > 0 && (
        <div className="pzp-tarjeta">
          <p className="pzp-etiqueta">Puntos de la ronda</p>
          <ul className="pzp-sumas">
            {sumas.map((j) => (
              <li key={j.id}>
                <Avatar id={j.id} nombre={j.nombre} /><span>{j.nombre}{j.id === v.yo?.id ? ' (tú)' : ''}</span>
                <strong className={v.sumas[j.id] > 0 ? 'mas' : 'menos'}>{v.sumas[j.id] > 0 ? '+' : ''}{v.sumas[j.id]}</strong>
              </li>
            ))}
          </ul>
        </div>
      )}
      {children}
    </>
  );
}

function Foto({ src, alt }) {
  const [ok, setOk] = useState(true);
  if (!ok) return null;
  return <img className="pzp-foto-completa" src={src} alt={alt} onError={() => setOk(false)} />;
}

export function PantallaFin({ v, juego, onSalir, children }) {
  const f = v.fin;
  const nombres = f.ganadores.map((id) => nombreDe(v, id));
  const top = f.tabla.filter((j) => !j.fuera).slice(0, 3);
  const colocacion = top.length === 3 ? [top[1], top[0], top[2]] : top.length === 2 ? [top[1], top[0]] : top;
  const alturas = ['primero', 'segundo', 'tercero'];
  return (
    <>
      <Hero v={v} juego={juego} onSalir={onSalir} etiqueta="Fin de la partida" titulo={nombres.length ? juego.ganador(nombres) : 'Nadie ha sumado puntos'} clase="fin" />
      {top.length > 1 && f.max > 0 && (
        <div className="pzp-tarjeta">
          <div className="pzp-podio">
            {colocacion.map((j) => {
              const puesto = top.indexOf(j);
              return (
                <div key={j.id} className={`pzp-podio-col ${alturas[puesto]}`} style={{ '--c': colorDe(j.id) }}>
                  <Avatar id={j.id} nombre={j.nombre} grande />
                  <span className="pzp-podio-nombre">{j.nombre}</span>
                  <span className="pzp-podio-pts">{j.puntos} pts</span>
                  <span className="pzp-podio-base">{j.puesto}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <div className="pzp-tarjeta">
        <p className="pzp-etiqueta">Clasificación</p>
        <ol className="pzp-ranking">
          {f.tabla.map((j) => (
            <li key={j.id} className={j.puesto === 1 && j.puntos > 0 ? 'lider' : ''}>
              <span className="pzp-pos">{j.fuera ? '🚪' : j.puesto === 1 && j.puntos > 0 ? <Icon name="crown" size={16} /> : j.puesto}</span>
              <Avatar id={j.id} nombre={j.nombre} />
              <span className="pzp-ranking-nombre">{j.nombre}{j.id === v.yo?.id ? ' (tú)' : ''}<small>{j.aciertos} {j.aciertos === 1 ? 'acierto' : 'aciertos'}</small></span>
              <strong>{j.puntos}</strong>
            </li>
          ))}
        </ol>
      </div>
      {children}
    </>
  );
}

export function ModalSalir({ titulo, texto, onSeguir, onSalir }) {
  return (
    <div className="rg-modal-fondo" onClick={onSeguir}>
      <div className="rg-modal pzp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pzp-modal-icono">🚪</div>
        <h3>{titulo}</h3>
        <p className="hint">{texto}</p>
        <div className="pzp-dos">
          <button type="button" className="pzp-boton secundario" onClick={onSeguir}>Seguir</button>
          <button type="button" className="pzp-boton peligro" onClick={onSalir}>Salir</button>
        </div>
      </div>
    </div>
  );
}

export function Pildoras({ opciones, valor, onCambiar }) {
  return (
    <div className="pzp-pildoras">
      {opciones.map(([v, texto]) => (
        <button key={v} type="button" className={`pzp-pildora${valor === v ? ' activo' : ''}`} disabled={!onCambiar} onClick={() => onCambiar?.(v)}>{texto}</button>
      ))}
    </div>
  );
}
export const opcionesRondas = (unidad) => OPCIONES_RONDAS.map((n) => [n, `${n} ${unidad}`]);

export function Ayuda({ onCerrar, titulo, descripcion, reglas }) {
  return (
    <div className="rg-modal-fondo" onClick={onCerrar}>
      <div className="rg-modal qq-modal-ayuda" onClick={(e) => e.stopPropagation()}>
        <div className="qq-modal-ayuda-header">
          <span className="qq-ayuda-badge">❓ Cómo jugar</span>
          <h3>{titulo}</h3>
        </div>
        <div className="qq-modal-ayuda-body">
          {descripcion && <p>{descripcion}</p>}
          <ul>{reglas.map((r) => <li key={r}>{r}</li>)}</ul>
        </div>
        <button type="button" className="big full qq-btn-principal" onClick={onCerrar}>¡Entendido!</button>
      </div>
    </div>
  );
}
