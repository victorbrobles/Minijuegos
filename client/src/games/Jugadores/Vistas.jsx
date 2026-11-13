// client/src/games/Jugadores/Vistas.jsx
// Pantallas de «¿Con quién he jugado?» (online y un solo dispositivo) con el estilo de los juegos renovados.
import { useRegistrarPartida, resultadoDesdeFin } from '../../lib/registros.js';
import React, { useEffect, useRef, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import { AJUSTES, OPCIONES_RONDAS } from './engine.js';
import './Jugadores.css';

export const COLORES = ['#ea580c', '#2563eb', '#16a34a', '#dc2626', '#9333ea', '#0d9488', '#f59e0b', '#db2777', '#4f46e5', '#65a30d', '#0891b2', '#78716c', '#e11d48', '#7c3aed', '#0284c7'];
export const colorDe = (id) => COLORES[((Number(id) || 1) - 1) % COLORES.length];
const inicial = (n) => (n || '?').trim().charAt(0).toUpperCase();

export function Avatar({ id, nombre, grande = false }) {
  return <span className={`cqp-avatar${grande ? ' grande' : ''}`} style={{ '--c': colorDe(id) }}>{inicial(nombre)}</span>;
}

function useAhora(offset = 0, activo = true) {
  const [t, setT] = useState(() => Date.now() + offset);
  useEffect(() => {
    if (!activo) return undefined;
    const i = setInterval(() => setT(Date.now() + offset), 250);
    return () => clearInterval(i);
  }, [offset, activo]);
  return t;
}

function Hero({ v, onSalir, etiqueta, titulo, clase = '' }) {
  const turno = v.pulsado?.jugadorId ?? v.revision?.jugadorId;
  return (
    <header className={`cqp-hero ${clase}`}>
      <span className="cqp-enlace-fondo" aria-hidden="true">⚽ ⇄ ⚽</span>
      <div className="cqp-hero-top">
        <button type="button" className="cqp-salir" onClick={onSalir}><Icon name="door" size={15} /> Salir</button>
        <div className="cqp-chips"><span className="cqp-chip">🤝 {Math.min(v.ronda, v.rondas)}/{v.rondas}</span></div>
      </div>
      <p className="cqp-hero-etiqueta">{etiqueta}</p>
      <h1 className="cqp-hero-titulo">{titulo}</h1>
      <div className="cqp-marcador">
        {[...v.jugadores].sort((a, b) => b.puntos - a.puntos).map((j) => (
          <span key={j.id} className={`cqp-marca${turno === j.id ? ' turno' : ''}${j.id === v.yo?.id ? ' yo' : ''}${j.fuera ? ' fuera' : ''}${v.bloqueados?.includes(j.id) && v.fase === 'jugando' ? ' bloqueado' : ''}`}>
            <Avatar id={j.id} nombre={j.nombre} />
            <span className="cqp-marca-nombre">{j.nombre}</span>
            <span className="cqp-marca-datos">{j.puntos}</span>
          </span>
        ))}
      </div>
    </header>
  );
}

/** Los dos futbolistas de la ronda, unidos por la incógnita. */
function Pareja({ v, offset }) {
  const ahora = useAhora(offset, v.fase === 'jugando' && v.pausadoEn == null);
  const ref = v.pausadoEn ?? ahora;
  const quedan = Math.max(0, Math.ceil((v.hasta - ref) / 1000));
  const pct = Math.max(0, Math.min(100, (quedan / AJUSTES.segRonda) * 100));
  return (
    <div className="cqp-tarjeta cqp-pareja">
      <div className="cqp-pareja-fila">
        <div className="cqp-ficha"><span className="cqp-ficha-icono" aria-hidden="true">👤</span><strong>{v.pareja[0]}</strong></div>
        <div className="cqp-nexo" aria-hidden="true"><span>?</span></div>
        <div className="cqp-ficha"><span className="cqp-ficha-icono" aria-hidden="true">👤</span><strong>{v.pareja[1]}</strong></div>
      </div>
      <p className="cqp-pista">¿Quién ha coincidido en algún club con los dos? Puede ser en clubes distintos. La selección no cuenta.</p>
      {v.fase === 'jugando' && (
        <div className={`cqp-reloj${v.pausadoEn != null ? ' parado' : ''}${quedan <= 15 && v.pausadoEn == null ? ' urgente' : ''}`}>
          <div className="cqp-reloj-barra"><span style={{ width: `${pct}%` }} /></div>
          <strong>{v.pausadoEn != null ? '⏸' : `${quedan}s`}</strong>
        </div>
      )}
    </div>
  );
}

export function Pulsador({ onPulsar, deshabilitado, texto = '¡Lo sé!' }) {
  return (
    <button type="button" className="cqp-pulsador" onClick={onPulsar} disabled={deshabilitado}>
      <span className="cqp-pulsador-cara"><Icon name="zap" size={30} />{texto}</span>
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
    <form className="cqp-tarjeta cqp-respuesta" onSubmit={(e) => { e.preventDefault(); if (texto.trim()) onEnviar(texto); }}>
      <p className="cqp-etiqueta">{nombre ? `Responde, ${nombre}` : 'Tu respuesta'}</p>
      <div className={`cqp-cuenta${restante <= 8 ? ' critico' : ''}`}>
        <div className="cqp-cuenta-barra"><span style={{ width: `${pct}%` }} /></div>
        <strong>{Math.ceil(restante)}s</strong>
      </div>
      <input ref={ref} className="cqp-input" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Un compañero de los dos"
        autoComplete="off" autoCorrect="off" spellCheck={false} maxLength={60} />
      <p className="cqp-pista">Si no está en nuestra lista, decidirá el {onCancelar ? 'grupo' : 'anfitrión'}.</p>
      <div className="cqp-dos">
        {onCancelar && <button type="button" className="cqp-boton secundario" onClick={onCancelar}>Cancelar</button>}
        <button type="submit" className="cqp-boton" disabled={!texto.trim()}><Icon name="check" size={20} /> Responder</button>
      </div>
    </form>
  );
}

/** Respuesta que no está en la lista: decide el juez. */
export function Revision({ v, puedeJuzgar, onJuzgar, juez = 'el anfitrión' }) {
  const quien = v.jugadores.find((j) => j.id === v.revision.jugadorId)?.nombre;
  return (
    <div className="cqp-tarjeta cqp-revision">
      <p className="cqp-etiqueta centrada">🤔 No está en nuestra lista</p>
      <p className="cqp-texto"><strong>{quien}</strong> dice:</p>
      <p className="cqp-dicho">«{v.revision.texto}»</p>
      <p className="cqp-pista">¿Coincidió en algún club con {v.pareja[0]} y con {v.pareja[1]}?</p>
      {puedeJuzgar ? (
        <div className="cqp-dos">
          <button type="button" className="cqp-boton peligro" onClick={() => onJuzgar(false)}>❌ No vale</button>
          <button type="button" className="cqp-boton exito" onClick={() => onJuzgar(true)}>✅ Sí vale</button>
        </div>
      ) : <p className="cqp-esperando">⏳ Decide {juez}…</p>}
    </div>
  );
}

export function PantallaRonda({ v, onSalir, offset = 0, etiqueta, titulo, mio = false, children }) {
  return (
    <>
      <Hero v={v} onSalir={onSalir} etiqueta={etiqueta} titulo={titulo} clase={mio ? 'mio' : ''} />
      <Pareja v={v} offset={offset} />
      {children}
    </>
  );
}

export function PantallaResultado({ v, onSalir, children }) {
  const r = v.resultado;
  const quien = v.jugadores.find((j) => j.id === r?.jugadorId);
  const s = v.soluciones;
  return (
    <>
      <Hero v={v} onSalir={onSalir} etiqueta={r?.tipo === 'acierto' ? `¡Lo ha sacado ${quien?.nombre}!` : 'Nadie lo ha sacado'} titulo={`${v.pareja[0]} y ${v.pareja[1]}`} clase="fin" />
      <div className={`cqp-tarjeta cqp-solucion${r?.tipo === 'acierto' ? ' bien' : ''}`}>
        <span className="cqp-solucion-icono" aria-hidden="true">{r?.tipo === 'acierto' ? '🎉' : '🤝'}</span>
        {r?.tipo === 'acierto' && <p className="cqp-texto"><strong>{quien?.nombre}</strong> acertó con <strong>{r.respuesta}</strong> (+{r.puntos}){s?.aceptada ? ' (lo dio por bueno el juez)' : ''}.</p>}
        <p className="cqp-etiqueta centrada">Algunas respuestas que valían ({s?.total ?? 0} en total)</p>
        <div className="cqp-soluciones">{(s?.nombres || []).map((n) => <span key={n}>{n}</span>)}</div>
      </div>
      {children}
    </>
  );
}

export function PantallaFin({ v, onSalir, children }) {
  useRegistrarPartida('jugadores', resultadoDesdeFin(v));
  const f = v.fin;
  const nombres = f.ganadores.map((id) => v.jugadores.find((j) => j.id === id)?.nombre).filter(Boolean);
  return (
    <>
      <Hero v={v} onSalir={onSalir} etiqueta="Fin de la partida" titulo={nombres.length ? `¡Gana ${nombres.join(' y ')}!` : 'Nadie ha puntuado'} clase="fin" />
      <div className="cqp-tarjeta">
        <p className="cqp-etiqueta">Clasificación</p>
        <ol className="cqp-ranking">
          {f.tabla.map((j) => (
            <li key={j.id} className={j.puesto === 1 && j.puntos > 0 ? 'lider' : ''}>
              <span className="cqp-pos">{j.fuera ? '🚪' : j.puesto}</span>
              <Avatar id={j.id} nombre={j.nombre} />
              <span className="cqp-ranking-nombre">{j.nombre}{j.id === v.yo?.id ? ' (tú)' : ''}<small>{j.aciertos} {j.aciertos === 1 ? 'acierto' : 'aciertos'}</small></span>
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
      <div className="rg-modal cqp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cqp-modal-icono">🚪</div>
        <h3>{titulo}</h3>
        <p className="hint">{texto}</p>
        <div className="cqp-dos">
          <button type="button" className="cqp-boton secundario" onClick={onSeguir}>Seguir</button>
          <button type="button" className="cqp-boton peligro" onClick={onSalir}>Salir</button>
        </div>
      </div>
    </div>
  );
}

export function SelectorRondas({ valor, onCambiar }) {
  return (
    <div className="cqp-pildoras">
      {OPCIONES_RONDAS.map((n) => (
        <button key={n} type="button" className={`cqp-pildora${valor === n ? ' activo' : ''}`} disabled={!onCambiar} onClick={() => onCambiar?.(n)}>{n} parejas</button>
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
            <li>Cada ronda salen dos futbolistas. Busca un tercero que haya coincidido en algún <strong>club</strong> con los dos (con cada uno en un club distinto también vale). La selección no cuenta.</li>
            <li>Quien lo sepa pulsa <strong>«¡Lo sé!»</strong> y tiene {AJUSTES.segRespuesta} segundos para escribirlo. Hay {AJUSTES.segRonda} segundos por pareja.</li>
            <li>Si está en nuestra lista, acierto (+{AJUSTES.puntosAcierto}). Si no está, decide el anfitrión (o el grupo, en un dispositivo).</li>
            <li>Fallar resta {AJUSTES.puntosFallo} y deja fuera de esa pareja. Al acabar se ven ejemplos de respuestas válidas.</li>
          </ul>
        </div>
        <button type="button" className="big full qq-btn-principal" onClick={onCerrar}>¡Entendido!</button>
      </div>
    </div>
  );
}
