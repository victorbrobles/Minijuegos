// client/src/games/CuatroClubes/Vistas.jsx
// Pantallas de «El club de los cuatro» (online y un solo dispositivo) con el estilo de los juegos renovados.
import { useRegistrarPartida, resultadoDesdeFin } from '../../lib/registros.js';
import React, { useEffect, useRef, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import { AJUSTES, OPCIONES_RONDAS } from './engine.js';
import { Escudo as EscudoClub } from '../Trayectoria/Vistas.jsx';
import './CuatroClubes.css';

export const COLORES = ['#c026d3', '#2563eb', '#16a34a', '#dc2626', '#f59e0b', '#0d9488', '#ea580c', '#4f46e5', '#65a30d', '#0891b2'];
export const colorDe = (id) => COLORES[((Number(id) || 1) - 1) % COLORES.length];
const inicial = (n) => (n || '?').trim().charAt(0).toUpperCase();

export function Avatar({ id, nombre, grande = false }) {
  return <span className={`c4p-avatar${grande ? ' grande' : ''}`} style={{ '--c': colorDe(id) }}>{inicial(nombre)}</span>;
}

const Escudo = ({ club }) => <EscudoClub club={{ nombre: club.nombre, logo: club.escudo, colores: club.colores, siglas: club.siglas }} />;

function useRestante(hasta, offset = 0) {
  const calc = () => (hasta ? Math.max(0, (hasta - (Date.now() + offset)) / 1000) : 0);
  const [s, setS] = useState(calc);
  useEffect(() => {
    setS(calc());
    if (!hasta) return undefined;
    const i = setInterval(() => setS(calc()), 250);
    return () => clearInterval(i);
  }, [hasta, offset]); // eslint-disable-line react-hooks/exhaustive-deps
  return s;
}

function Hero({ v, onSalir, etiqueta, titulo, clase = '' }) {
  return (
    <header className={`c4p-hero ${clase}`}>
      <span className="c4p-cuatro-fondo" aria-hidden="true">4</span>
      <div className="c4p-hero-top">
        <button type="button" className="c4p-salir" onClick={onSalir}><Icon name="door" size={15} /> Salir</button>
        <div className="c4p-chips"><span className="c4p-chip">🛡️ Ronda {Math.min(v.ronda, v.rondas)}/{v.rondas}</span></div>
      </div>
      <p className="c4p-hero-etiqueta">{etiqueta}</p>
      <h1 className="c4p-hero-titulo">{titulo}</h1>
      <div className="c4p-marcador">
        {[...v.jugadores].sort((a, b) => b.puntos - a.puntos).map((j) => (
          <span key={j.id} className={`c4p-marca${v.turno === j.id && v.fase === 'jugando' ? ' turno' : ''}${j.id === v.yo?.id ? ' yo' : ''}${j.fuera ? ' fuera' : ''}`}>
            <Avatar id={j.id} nombre={j.nombre} />
            <span className="c4p-marca-nombre">{j.nombre}</span>
            <span className="c4p-marca-datos">{j.puntos}</span>
          </span>
        ))}
      </div>
    </header>
  );
}

/** Los cuatro clubes de la ronda. Con `marcas` (4 booleanos) se resaltan los acertados. */
export function Clubes({ clubes, marcas = null, onToggle = null }) {
  return (
    <div className="c4p-clubes">
      {clubes.map((c, k) => {
        const Tag = onToggle ? 'button' : 'div';
        return (
          <Tag key={c.nombre} type={onToggle ? 'button' : undefined} onClick={onToggle ? () => onToggle(k) : undefined}
            className={`c4p-club${marcas ? (marcas[k] ? ' si' : ' no') : ''}${onToggle ? ' tocable' : ''}`}>
            <span className="c4p-club-escudo"><Escudo club={c} /></span>
            <strong>{c.nombre}</strong>
            {marcas && <b className="c4p-club-marca">{marcas[k] ? '✓' : '✗'}</b>}
          </Tag>
        );
      })}
    </div>
  );
}

function Puntos({ clubes }) {
  return <span className="c4p-puntos">{clubes.map((x, k) => <i key={k} className={x ? 'si' : ''} />)}</span>;
}

/** Lo que va respondiendo cada uno en la ronda. */
function RespuestasRonda({ v }) {
  if (!v.respuestas.length) return null;
  return (
    <div className="c4p-tarjeta">
      <p className="c4p-etiqueta">Respuestas de esta ronda</p>
      <ul className="c4p-respuestas">
        {v.respuestas.map((r, i) => {
          const j = v.jugadores.find((x) => x.id === r.jugadorId);
          return (
            <li key={i} className={r.puntos === 4 ? 'pleno' : ''}>
              <Avatar id={r.jugadorId} nombre={j?.nombre} />
              <span className="c4p-resp-texto"><small>{j?.nombre}</small>{r.pasa ? 'Pasó' : r.tiempo ? 'Se le acabó el tiempo' : r.futbolista}</span>
              <Puntos clubes={r.clubes} />
              <strong>{r.puntos === 4 ? '🎯 4' : `+${r.puntos}`}</strong>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function TurnoDe({ v, quien, local, puedo, onListo }) {
  return (
    <>
    <div className="c4p-tarjeta c4p-gate">
      <Avatar id={quien?.id} nombre={quien?.nombre} grande />
      <p className="c4p-etiqueta centrada">{local ? 'Pasa el móvil a' : puedo ? 'Te toca' : 'Turno de'}</p>
      <h2>{quien?.nombre}</h2>
      <p className="c4p-texto">{puedo ? `Tendrás ${AJUSTES.segTurno} segundos para decir un futbolista que haya jugado en el mayor número de estos cuatro clubes.` : `Esperando a que ${quien?.nombre} esté listo…`}</p>
    </div>
    {puedo && <div className="c4p-barra estatica"><button type="button" className="c4p-boton grande" onClick={onListo}><Icon name="check" size={20} /> ¡Listo!</button></div>}
    </>
  );
}

function FormRespuesta({ v, offset, enviar }) {
  const [texto, setTexto] = useState('');
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus(); }, []);
  const s = useRestante(v.hasta, offset);
  const pct = Math.max(0, Math.min(100, (s / AJUSTES.segTurno) * 100));
  return (
    <form className="c4p-tarjeta c4p-form" onSubmit={(e) => { e.preventDefault(); if (texto.trim()) enviar('responder', { respuesta: texto }); }}>
      <div className={`c4p-cuenta${s <= 15 ? ' critico' : ''}`}>
        <div className="c4p-cuenta-barra"><span style={{ width: `${pct}%` }} /></div>
        <strong>{Math.ceil(s)}s</strong>
      </div>
      <input ref={ref} className="c4p-input" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Un futbolista de estos clubes"
        autoComplete="off" autoCorrect="off" spellCheck={false} maxLength={60} />
      <p className="c4p-pista">Suma un punto por cada club de los cuatro en el que jugó. No se puede repetir uno ya dicho en la ronda.</p>
      <button type="submit" className="c4p-boton" disabled={!texto.trim()}><Icon name="check" size={20} /> Responder</button>
    </form>
  );
}

/** Futbolista que no está en la base: el juez marca en qué clubes jugó. */
function Revision({ v, puedeJuzgar, onJuzgar, juez }) {
  const [marcas, setMarcas] = useState(() => v.revision.sugerencia || [false, false, false, false]);
  const quien = v.jugadores.find((j) => j.id === v.revision.jugadorId)?.nombre;
  return (
    <div className="c4p-tarjeta c4p-revision">
      <p className="c4p-etiqueta centrada">🤔 {v.revision.futbolista ? 'Puede haber jugado en un club del que no tenemos datos' : 'No está en nuestra base'}</p>
      <p className="c4p-texto"><strong>{quien}</strong> dice <strong>«{v.revision.texto}»</strong></p>
      {puedeJuzgar ? (
        <>
          <p className="c4p-pista">Marca los clubes en los que jugó:</p>
          <Clubes clubes={v.clubes} marcas={marcas} onToggle={(k) => setMarcas((m) => m.map((x, i) => (i === k ? !x : x)))} />
          <button type="button" className="c4p-boton grande" onClick={() => onJuzgar(marcas)}>Dar {marcas.filter(Boolean).length} {marcas.filter(Boolean).length === 1 ? 'punto' : 'puntos'}</button>
        </>
      ) : <p className="c4p-esperando">⏳ Decide {juez}…</p>}
    </div>
  );
}

export function PantallaJuego({ v, enviar, onSalir, offset = 0, miTurno, local = false, admin }) {
  const quien = v.jugadores.find((j) => j.id === v.turno);
  const etiqueta = local || !miTurno ? `Turno de ${quien?.nombre}` : 'Tu turno';
  return (
    <>
      <Hero v={v} onSalir={onSalir} etiqueta={etiqueta} titulo="¿Quién pasó por los cuatro?" clase={miTurno && !local ? 'mio' : ''} />
      <Clubes clubes={v.clubes} />
      {v.revision ? (
        <Revision key={v.revision.texto} v={v} puedeJuzgar={local || admin?.esAdmin} juez={local ? 'el grupo' : 'el anfitrión'}
          onJuzgar={(clubes) => enviar('juzgar', { clubes })} />
      ) : !v.listo ? (
        <TurnoDe v={v} quien={quien} local={local} puedo={miTurno} onListo={() => enviar('listo')} />
      ) : miTurno ? (
        <>
          <FormRespuesta key={v.hasta} v={v} offset={offset} enviar={enviar} />
          <div className="c4p-barra estatica">
            <button type="button" className="c4p-boton secundario" onClick={() => enviar('pasar')}>⏭️ Pasar turno</button>
          </div>
        </>
      ) : <p className="c4p-esperando">⏳ {quien?.nombre} está pensando…</p>}
      <RespuestasRonda v={v} />
      {admin?.esAdmin && (
        <div className="c4p-barra estatica">
          <div className="c4p-dos">
            {admin.atascado && <button type="button" className="c4p-enlace" onClick={admin.onForzar}><Icon name="forward" size={15} /> Saltar turno</button>}
            <button type="button" className="c4p-enlace" onClick={() => enviar('terminar')}><Icon name="flagFinish" size={15} /> Terminar partida</button>
          </div>
        </div>
      )}
    </>
  );
}

export function PantallaResultado({ v, onSalir, children }) {
  return (
    <>
      <Hero v={v} onSalir={onSalir} etiqueta={`Fin de la ronda ${v.ronda}`} titulo="Así ha ido" clase="fin" />
      <Clubes clubes={v.clubes} />
      <RespuestasRonda v={v} />
      {v.mejores?.length > 0 && (
        <div className="c4p-tarjeta">
          <p className="c4p-etiqueta">Las mejores respuestas posibles</p>
          <ul className="c4p-respuestas">
            {v.mejores.map((m) => (
              <li key={m.nombre} className={m.clubes.every(Boolean) ? 'pleno' : ''}>
                <span className="c4p-resp-texto">{m.nombre}</span>
                <Puntos clubes={m.clubes} />
                <strong>{m.clubes.filter(Boolean).length}/4</strong>
              </li>
            ))}
          </ul>
        </div>
      )}
      {children}
    </>
  );
}

export function PantallaFin({ v, onSalir, children }) {
  useRegistrarPartida('cuatroclubes', resultadoDesdeFin(v));
  const f = v.fin;
  const nombres = f.ganadores.map((id) => v.jugadores.find((j) => j.id === id)?.nombre).filter(Boolean);
  return (
    <>
      <Hero v={v} onSalir={onSalir} etiqueta="Fin de la partida" titulo={nombres.length ? `¡Gana ${nombres.join(' y ')}!` : 'Nadie ha puntuado'} clase="fin" />
      <div className="c4p-tarjeta">
        <p className="c4p-etiqueta">Clasificación</p>
        <ol className="c4p-ranking">
          {f.tabla.map((j) => (
            <li key={j.id} className={j.puesto === 1 && j.puntos > 0 ? 'lider' : ''}>
              <span className="c4p-pos">{j.fuera ? '🚪' : j.puesto}</span>
              <Avatar id={j.id} nombre={j.nombre} />
              <span className="c4p-ranking-nombre">{j.nombre}{j.id === v.yo?.id ? ' (tú)' : ''}<small>{j.plenos} {j.plenos === 1 ? 'pleno' : 'plenos'}</small></span>
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
      <div className="rg-modal c4p-modal" onClick={(e) => e.stopPropagation()}>
        <div className="c4p-modal-icono">🚪</div>
        <h3>{titulo}</h3>
        <p className="hint">{texto}</p>
        <div className="c4p-dos">
          <button type="button" className="c4p-boton secundario" onClick={onSeguir}>Seguir</button>
          <button type="button" className="c4p-boton peligro" onClick={onSalir}>Salir</button>
        </div>
      </div>
    </div>
  );
}

export function SelectorRondas({ valor, onCambiar }) {
  return (
    <div className="c4p-pildoras">
      {OPCIONES_RONDAS.map((n) => (
        <button key={n} type="button" className={`c4p-pildora${valor === n ? ' activo' : ''}`} disabled={!onCambiar} onClick={() => onCambiar?.(n)}>{n} rondas</button>
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
            <li>Cada ronda salen cuatro clubes. Por turnos, cada jugador pulsa «¡Listo!» y tiene {AJUSTES.segTurno} segundos para decir un futbolista.</li>
            <li>Suma un punto por cada uno de los cuatro clubes en los que jugó: si jugó en los cuatro, ¡pleno!</li>
            <li>Si el futbolista está en nuestra base, se puntúa solo. Si no, el anfitrión (o el grupo, en un dispositivo) marca en qué clubes jugó.</li>
            <li>No se puede repetir un futbolista ya dicho en la ronda. Al acabarla se ven las mejores respuestas posibles.</li>
          </ul>
        </div>
        <button type="button" className="big full qq-btn-principal" onClick={onCerrar}>¡Entendido!</button>
      </div>
    </div>
  );
}
