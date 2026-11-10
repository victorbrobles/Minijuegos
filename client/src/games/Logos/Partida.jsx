// client/src/games/Logos/Partida.jsx
// Pantallas de «Logo Mania» (online a la vez y en un dispositivo por turnos) con las piezas comunes de ../Pulsador.
import React, { useEffect, useRef, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import { Hero, TurnoDe, Cuenta, useRestante, Avatar } from '../Pulsador/Vistas.jsx';

const nombreDe = (v, id) => v.jugadores.find((j) => j.id === id)?.nombre ?? '¿?';
const HERO = { emoji: '🏷️' };

function Logo({ src }) {
  const [error, setError] = useState(false);
  useEffect(() => setError(false), [src]);
  return (
    <div className="pzp-tarjeta" style={{ padding: '0.7rem' }}>
      <div className="pzp-logo">
        {error ? <span className="pzp-texto">No se ha podido cargar el logo.</span> : <img src={src} alt="Logo de una marca" draggable={false} onError={() => setError(true)} />}
      </div>
    </div>
  );
}

function Responder({ v, enviar, restante, nombre }) {
  const [texto, setTexto] = useState('');
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus(); }, []);
  const vale = Math.max(1, Math.ceil(restante / 1000));
  return (
    <form className="pzp-tarjeta pzp-form" onSubmit={(e) => { e.preventDefault(); if (texto.trim()) enviar('responder', { respuesta: texto.trim() }); }}>
      <p className="pzp-etiqueta">{nombre ? `${nombre}, ` : ''}acertar vale +{vale} · fallar −{vale}</p>
      <Cuenta ms={restante} total={v.reglas.segRonda * 1000} />
      <input ref={ref} className="pzp-input" value={texto} maxLength={60} onChange={(e) => setTexto(e.target.value)} placeholder="¿Qué marca es?" autoComplete="off" autoCorrect="off" spellCheck={false} />
      <div className="pzp-dos">
        <button type="button" className="pzp-boton secundario" onClick={() => enviar('pasar')}>Paso (0)</button>
        <button type="submit" className="pzp-boton" disabled={!texto.trim()}><Icon name="check" size={18} /> Responder</button>
      </div>
    </form>
  );
}

function MiJugada({ j }) {
  if (j.paso) return <p className="pzp-esperando">🤷 Has pasado: ni sumas ni restas.</p>;
  return (
    <p className="pzp-esperando" style={{ background: j.acierto ? '#dcfce7' : '#fee2e2' }}>
      {j.acierto ? `✅ ¡Correcto! +${j.delta}` : `❌ «${j.texto}» no es (${j.delta})`}
    </p>
  );
}

function Jugadas({ v }) {
  const lista = v.jugadores.filter((j) => !j.fuera);
  return (
    <div className="pzp-tarjeta">
      <p className="pzp-etiqueta">Lo que ha dicho cada uno</p>
      <ul className="pzp-jugadas">
        {lista.map((j) => {
          const x = v.jugadas[j.id] || { tiempo: true, delta: 0 };
          return (
            <li key={j.id} className={x.acierto ? 'bien' : x.delta < 0 ? 'mal' : ''}>
              <Avatar id={j.id} nombre={j.nombre} />
              <span>{j.nombre}<small>{x.paso ? 'Pasó' : x.tiempo ? 'Sin respuesta' : `«${x.texto}»`}</small></span>
              <strong className={x.delta > 0 ? 'mas' : x.delta < 0 ? 'menos' : ''}>{x.delta > 0 ? '+' : ''}{x.delta}</strong>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Partida (todo salvo el final). `local`: por turnos en el mismo móvil. */
export function Partida({ v, enviar, offset = 0, onSalir, local = false, puedeSeguir = true }) {
  const restante = useRestante(v.fase === 'jugando' && v.listo ? v.hasta : null, offset);
  const hero = (titulo, etiqueta) => (
    <Hero v={v} juego={HERO} onSalir={onSalir} chip={`🏷️ Logo ${v.ronda}/${v.rondas}`} titulo={titulo} etiqueta={etiqueta} turno={local ? v.turno : undefined} />
  );

  if (v.fase === 'resuelta') {
    return (
      <>
        {hero(v.solucion, 'Era…')}
        <Logo src={v.imagen} />
        <Jugadas v={v} />
        <div className="pzp-barra estatica">
          {puedeSeguir ? (
            <>
              <button type="button" className="pzp-boton grande" onClick={() => enviar('siguiente')}><Icon name="play" size={20} /> {v.ronda >= v.rondas ? 'Ver resultado final' : 'Siguiente logo'}</button>
              {v.ronda < v.rondas && <button type="button" className="pzp-enlace" onClick={() => enviar('terminar')}><Icon name="flagFinish" size={15} /> Terminar la partida ya</button>}
            </>
          ) : <p className="pzp-esperando">⏳ El anfitrión pasará al siguiente logo…</p>}
        </div>
      </>
    );
  }

  if (local) {
    if (!v.listo) {
      return (
        <>
          {hero('¿Qué marca es?', `Turno de ${nombreDe(v, v.turno)}`)}
          <TurnoDe v={v} id={v.turno} puedo onListo={() => enviar('listo')} texto={`Pásale el móvil. Tendrá ${v.reglas.segRonda} segundos y no verá lo que han dicho los demás.`} />
        </>
      );
    }
    return (
      <>
        {hero('¿Qué marca es?', `Responde ${nombreDe(v, v.turno)}`)}
        <Logo src={v.imagen} />
        <Responder key={v.turno} v={v} enviar={enviar} restante={restante} nombre={nombreDe(v, v.turno)} />
      </>
    );
  }

  const mia = v.jugadas[v.yo?.id];
  return (
    <>
      {hero('¿Qué marca es?', 'Responded todos a la vez')}
      <Logo src={v.imagen} />
      {mia ? (
        <>
          <MiJugada j={mia} />
          <div className="pzp-tarjeta">
            <Cuenta ms={restante} total={v.reglas.segRonda * 1000} />
            <div className="pzp-hecho" style={{ marginTop: '0.6rem' }}>
              {v.jugadores.filter((j) => !j.fuera).map((j) => <span key={j.id} className={v.jugadas[j.id] ? 'ya' : ''}>{v.jugadas[j.id] ? '✓' : '…'} {j.nombre}</span>)}
            </div>
          </div>
        </>
      ) : <Responder key={v.ronda} v={v} enviar={enviar} restante={restante} />}
    </>
  );
}

export function PartidaOnline({ v, sala, enviar, offset, onSalir }) {
  return <Partida v={v} enviar={enviar} offset={offset} onSalir={onSalir} puedeSeguir={sala.esAdmin} />;
}

