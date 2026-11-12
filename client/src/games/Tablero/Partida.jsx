// client/src/games/Tablero/Partida.jsx
// Pantallas de «El Tablero de Puntos» (online y en un dispositivo) con las piezas comunes de ../Pulsador.
import React, { useEffect, useRef, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import { Hero, Cuenta, useRestante, Pildoras, PantallaFin, colorDe, AvisoTurno } from '../Pulsador/Vistas.jsx';
import { BloqueConfig } from '../../components/MenuJuego.jsx';
import { OPCIONES, categoriasPara } from './engine.js';
import './Tablero.css';

const HERO = { emoji: '🎯' };
const nombreDe = (v, id) => v.jugadores.find((j) => j.id === id)?.nombre ?? '¿?';
const catDe = (v, id) => v.categorias.find((c) => c.id === id) || v.disponibles?.find((c) => c.id === id);
const LETRAS = ['A', 'B', 'C', 'D'];

/** Aviso emergente verde o rojo tras cada respuesta (se ve unos segundos). */
export function AvisoResultado({ v }) {
  const u = v.ultimo;
  const [visto, setVisto] = useState(null);
  const previo = useRef(u?.n ?? null);
  const [activo, setActivo] = useState(null);
  useEffect(() => {
    if (!u || u.n === previo.current) return undefined;
    previo.current = u.n;
    setActivo(u.n);
    const t = setTimeout(() => setVisto(u.n), 3200);
    return () => clearTimeout(t);
  }, [u?.n]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!u || activo !== u.n || visto === u.n) return null;
  const quien = nombreDe(v, u.id);
  let texto;
  if (u.bien) texto = `✅ ${quien} acierta${u.rebote ? ' el rebote' : ''}: +${u.puntos}`;
  else if (u.rebote) texto = `❌ ${quien} falla el rebote (no resta). Era: ${u.correcta}`;
  else texto = `❌ ${quien} ${u.elegida === null ? 'se queda sin tiempo' : 'falla'}: ${u.puntos}${u.reboteSiguiente ? ` · Rebote para ${nombreDe(v, u.reboteSiguiente)}` : `. Era: ${u.correcta}`}`;
  return <p className={`pzp-ultimo flotante${u.bien ? ' bien' : ''}`} role="alert" onClick={() => setVisto(u.n)}>{texto}</p>;
}

function Ultimo({ v }) {
  const u = v.ultimo;
  if (!u || u.correcta == null) return null;
  const c = catDe(v, u.cat);
  return (
    <div className={`tbx-ultimo ${u.bien ? 'bien' : 'mal'}`}>
      <p><b>{nombreDe(v, u.id)}</b> {u.bien ? `acierta${u.rebote ? ' el rebote' : ''}` : u.rebote ? 'falla el rebote' : u.elegida === null ? 'se queda sin tiempo' : 'falla'} {c?.emoji} {u.v}{u.doble ? ' ×2' : ''}: <b>{u.puntos > 0 ? '+' : ''}{u.puntos}</b></p>
      <small>{u.pregunta} → <b>{u.correcta}</b></small>
    </div>
  );
}

// ---------- Elección de categorías
function Categorias({ v, enviar, puedo }) {
  const quien = nombreDe(v, v.turno);
  return (
    <>
      <div className="tbx-elegidas">
        {Array.from({ length: v.necesarias }, (_, i) => {
          const e = v.elegidas[i];
          const c = e && catDe(v, e.cat);
          return (
            <span key={i} className={`tbx-hueco${c ? ' lleno' : ''}`} style={c ? { '--cat': c.color } : undefined}>
              {c ? <><b>{c.emoji}</b><small>{c.nombre}</small><i style={{ background: colorDe(e.por) }}>{nombreDe(v, e.por).charAt(0)}</i></> : <small>{i + 1}</small>}
            </span>
          );
        })}
      </div>
      <p className="tbx-ayuda">{puedo ? 'Elige una categoría que no haya elegido nadie.' : `Esperando a que ${quien} elija…`}</p>
      <div className="tbx-cats">
        {v.disponibles.map((c) => (
          <button key={c.id} type="button" className={`tbx-cat-op${c.por != null ? ' cogida' : ''}`} style={{ '--cat': c.color }}
            disabled={!puedo || c.por != null} onClick={() => enviar('categoria', { cat: c.id })}>
            <span>{c.emoji}</span><b>{c.nombre}</b>
            {c.por != null && <i style={{ background: colorDe(c.por) }}>{nombreDe(v, c.por).charAt(0)}</i>}
          </button>
        ))}
      </div>
    </>
  );
}

function Tablero({ v, onElegir }) {
  return (
    <div className="tbx-tablero">
      {v.categorias.map((c) => (
        <div key={c.id} className="tbx-fila" style={{ '--cat': c.color || '#7c3aed' }}>
          <span className="tbx-cat"><span>{c.emoji}</span>{c.nombre}</span>
          {c.celdas.map((x) => (
            <button key={x.v} type="button" disabled={x.usada || !onElegir} onClick={() => onElegir(c.id, x.v)}
              className={`tbx-celda${x.usada ? ` usada ${x.bien ? 'bien' : 'mal'}` : ''}`} style={x.usada ? { '--c': colorDe(x.por) } : undefined}
              aria-label={x.usada ? `${c.nombre} ${x.v}, jugada` : `${c.nombre} por ${x.v}`}>
              {x.usada ? (x.doble ? '×2' : x.bien ? '✓' : '✗') : x.v}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

function Pregunta({ v, enviar, puedo }) {
  const a = v.actual;
  const c = catDe(v, a.cat);
  const valor = a.doble ? a.v * 2 : a.v;
  const rebote = v.fase === 'rebote';
  return (
    <div className="pzp-tarjeta tbx-pregunta" style={{ '--cat': c.color || '#7c3aed' }}>
      <div className="tbx-pregunta-cab"><span>{c.emoji} {c.nombre}</span><b>{valor}</b></div>
      {rebote && <p className="tbx-rebote">🔁 Rebote para {nombreDe(v, v.rebote.id)}: si acierta suma {valor}; si falla, no resta.</p>}
      {!rebote && a.doble && <p className="tbx-doble">⭐ ¡Casilla doble! Vale {valor}… o resta {valor}</p>}
      <h2>{a.pregunta}</h2>
      <div className="tbx-opciones">
        {a.opciones.map((o, i) => {
          const quitada = rebote && v.rebote.quitada === o;
          return (
            <button key={o} type="button" className={`tbx-opcion${quitada ? ' quitada' : ''}`} disabled={!puedo || quitada} onClick={() => enviar('responder', { opcion: o })}>
              <i>{LETRAS[i]}</i><span>{o}</span>{quitada && <em>✗</em>}
            </button>
          );
        })}
      </div>
      {!puedo && <p className="pzp-nota">{rebote ? 'Responde el rebote' : 'Responde'} {nombreDe(v, v.responde)}…</p>}
    </div>
  );
}

export function Partida({ v, enviar, offset = 0, onSalir, local = false, admin = false }) {
  const restante = useRestante(v.hasta, offset);
  const quien = nombreDe(v, v.fase === 'rebote' ? v.responde : v.turno);
  const yo = v.yo?.id;
  const puedo = local || (yo != null && (v.fase === 'rebote' || v.fase === 'pregunta' ? v.responde === yo : v.turno === yo));
  const titulos = {
    categorias: puedo && !local ? 'Elige una categoría' : `${quien} elige categoría`,
    elegir: puedo && !local ? 'Elige casilla' : `${quien} elige casilla`,
    pregunta: puedo && !local ? '¡Responde!' : `Responde ${quien}`,
    rebote: puedo && !local ? '¡Rebote para ti!' : `Rebote para ${quien}`
  };
  const chip = v.fase === 'categorias' ? `🎯 ${v.elegidas.length}/${v.necesarias} categorías` : `🎯 Quedan ${v.quedan}`;
  const etiqueta = local ? `Turno de ${quien}` : v.fase === 'categorias' ? 'Elegid las categorías' : 'Arriesga lo justo';
  return (
    <>
      <Hero v={v} juego={HERO} onSalir={onSalir} chip={chip} etiqueta={etiqueta} titulo={titulos[v.fase]} turno={v.fase === 'rebote' ? v.responde : v.turno} />
      {!local && yo != null && (
        <AvisoTurno
          clave={(v.fase === 'elegir' && v.turno === yo) ? `t${v.ronda}` : (v.fase === 'rebote' && v.responde === yo) ? `r${v.ronda}` : (v.fase === 'categorias' && v.turno === yo) ? `c${v.elegidas.length}` : null}
          id={yo} emoji="🎯" texto={v.fase === 'rebote' ? '¡Rebote!' : '¡Te toca!'}
          sub={v.fase === 'rebote' ? 'Responde sin riesgo: si fallas, no restas.' : v.fase === 'categorias' ? 'Elige una categoría para el tablero.' : 'Elige casilla: cuanto más vale, más arriesgas.'} />
      )}
      {v.hasta && <Cuenta ms={restante} total={v.segundos * 1000} />}
      {v.fase === 'categorias' && <Categorias v={v} enviar={enviar} puedo={puedo} />}
      {v.fase === 'elegir' && (
        <>
          <Ultimo v={v} />
          <Tablero v={v} onElegir={puedo ? (cat, val) => enviar('elegir', { cat, v: val }) : null} />
          <p className="tbx-ayuda">{puedo ? 'Cuanto más vale la casilla, más difícil es la pregunta. Si fallas, restas su valor y el siguiente tiene rebote.' : `Esperando a que ${quien} elija…`}</p>
        </>
      )}
      {(v.fase === 'pregunta' || v.fase === 'rebote') && <Pregunta v={v} enviar={enviar} puedo={puedo} />}
      {admin && (
        <div className="pzp-barra estatica">
          <button type="button" className="pzp-enlace" onClick={() => enviar('terminar')}>Terminar la partida ya</button>
        </div>
      )}
    </>
  );
}

export function PartidaOnline({ v, sala, enviar, offset, onSalir }) {
  return (
    <>
      <AvisoResultado v={v} />
      <Partida v={v} enviar={enviar} offset={offset} onSalir={onSalir} admin={sala.esAdmin} />
    </>
  );
}

export function Fin({ v, juego, onSalir, children }) {
  return <PantallaFin v={v} juego={juego} onSalir={onSalir}>{children}</PantallaFin>;
}

export function Config({ config, onCambiar, nJugadores, sala }) {
  const m = config.porJugador || 1;
  const n = nJugadores || sala?.jugadores?.length || null;
  return (
    <>
      <BloqueConfig titulo="Categorías en el tablero">
        <Pildoras opciones={OPCIONES.porJugador.map((k) => [k, `×${k}`])} valor={m} onCambiar={onCambiar && ((porJugador) => onCambiar({ porJugador }))} />
        <p className="pzp-nota" style={{ marginTop: '0.4rem' }}>
          Cada jugador elige por turnos {m === 1 ? 'una categoría' : `${m} categorías`} de las 25
          {n ? `: ${categoriasPara(n, m)} categorías (${categoriasPara(n, m) * 5} casillas) con ${n} jugadores.` : ' (número de jugadores × ' + m + ', máximo 25).'}
        </p>
      </BloqueConfig>
      <BloqueConfig titulo="Tiempo para responder (online)">
        <Pildoras opciones={OPCIONES.segundos.map((n) => [n, `${n} s`])} valor={config.segundos} onCambiar={onCambiar && ((segundos) => onCambiar({ segundos }))} />
      </BloqueConfig>
    </>
  );
}
