// client/src/games/Tablero/Partida.jsx
// Pantallas de «El Tablero de Puntos» (online y en un dispositivo) con las piezas comunes de ../Pulsador.
import React from 'react';
import Icon from '../../components/Icon.jsx';
import { Hero, Cuenta, useRestante, Pildoras, PantallaFin, colorDe, AvisoTurno } from '../Pulsador/Vistas.jsx';
import { BloqueConfig } from '../../components/MenuJuego.jsx';
import { OPCIONES } from './engine.js';
import './Tablero.css';

const HERO = { emoji: '🎯' };
const nombreDe = (v, id) => v.jugadores.find((j) => j.id === id)?.nombre ?? '¿?';
const catDe = (v, id) => v.categorias.find((c) => c.id === id);
const COLOR_CAT = { cine: '#e11d48', historia: '#b45309', ciencia: '#0891b2', musica: '#9333ea', deporte: '#16a34a', geografia: '#2563eb' };
const LETRAS = ['A', 'B', 'C', 'D'];

function Ultimo({ v }) {
  const u = v.ultimo;
  if (!u) return null;
  const c = catDe(v, u.cat);
  return (
    <div className={`tbx-ultimo ${u.bien ? 'bien' : 'mal'}`}>
      <p><b>{nombreDe(v, u.id)}</b> {u.bien ? 'acierta' : u.elegida === null ? 'se queda sin tiempo' : 'falla'} {c?.emoji} {u.v}{u.doble ? ' ×2' : ''}: <b>{u.puntos > 0 ? '+' : ''}{u.puntos}</b></p>
      <small>{u.pregunta} → <b>{u.correcta}</b></small>
    </div>
  );
}

function Tablero({ v, onElegir }) {
  return (
    <div className="tbx-tablero">
      {v.categorias.map((c) => (
        <div key={c.id} className="tbx-fila" style={{ '--cat': COLOR_CAT[c.id] || '#7c3aed' }}>
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
  return (
    <div className="pzp-tarjeta tbx-pregunta" style={{ '--cat': COLOR_CAT[c.id] || '#7c3aed' }}>
      <div className="tbx-pregunta-cab"><span>{c.emoji} {c.nombre}</span><b>{a.doble ? a.v * 2 : a.v}</b></div>
      {a.doble && <p className="tbx-doble">⭐ ¡Casilla doble! Vale {a.v * 2}… o resta {a.v * 2}</p>}
      <h2>{a.pregunta}</h2>
      <div className="tbx-opciones">
        {a.opciones.map((o, i) => (
          <button key={o} type="button" className="tbx-opcion" disabled={!puedo} onClick={() => enviar('responder', { opcion: o })}><i>{LETRAS[i]}</i><span>{o}</span></button>
        ))}
      </div>
      {!puedo && <p className="pzp-nota">Responde {nombreDe(v, v.turno)}…</p>}
    </div>
  );
}

export function Partida({ v, enviar, offset = 0, onSalir, local = false, admin = false }) {
  const restante = useRestante(v.hasta, offset);
  const quien = nombreDe(v, v.turno);
  const puedo = local || (v.yo && v.yo.id === v.turno);
  const titulo = v.fase === 'elegir' ? (puedo && !local ? 'Elige casilla' : `${quien} elige casilla`) : (puedo && !local ? '¡Responde!' : `Responde ${quien}`);
  return (
    <>
      <Hero v={v} juego={HERO} onSalir={onSalir} chip={`🎯 Quedan ${v.quedan}`} etiqueta={local ? `Turno de ${quien}` : 'Arriesga lo justo'} titulo={titulo} turno={v.turno} />
      {!local && v.yo && <AvisoTurno clave={v.fase === 'elegir' && v.turno === v.yo.id ? `t${v.ronda}` : null} id={v.yo.id} emoji="🎯" texto="¡Te toca!" sub="Elige casilla: cuanto más vale, más arriesgas." />}
      {v.hasta && <Cuenta ms={restante} total={v.segundos * 1000} />}
      {v.fase === 'elegir' && (
        <>
          <Ultimo v={v} />
          <Tablero v={v} onElegir={puedo ? (cat, val) => enviar('elegir', { cat, v: val }) : null} />
          <p className="tbx-ayuda">{puedo ? 'Cuanto más vale la casilla, más difícil es la pregunta. Si fallas, se resta su valor.' : `Esperando a que ${quien} elija…`}</p>
        </>
      )}
      {v.fase === 'pregunta' && <Pregunta v={v} enviar={enviar} puedo={puedo} />}
      {admin && (
        <div className="pzp-barra estatica">
          <button type="button" className="pzp-enlace" onClick={() => enviar('terminar')}>Terminar la partida ya</button>
        </div>
      )}
    </>
  );
}

export function PartidaOnline({ v, sala, enviar, offset, onSalir }) {
  return <Partida v={v} enviar={enviar} offset={offset} onSalir={onSalir} admin={sala.esAdmin} />;
}

export function Fin({ v, juego, onSalir, children }) {
  return <PantallaFin v={v} juego={juego} onSalir={onSalir}>{children}</PantallaFin>;
}

export function Config({ config, onCambiar }) {
  return (
    <>
      <BloqueConfig titulo="Categorías en el tablero">
        <Pildoras opciones={OPCIONES.categorias.map((n) => [n, `${n} (${n * 4} casillas)`])} valor={config.categorias} onCambiar={onCambiar && ((categorias) => onCambiar({ categorias }))} />
      </BloqueConfig>
      <BloqueConfig titulo="Tiempo para responder (online)">
        <Pildoras opciones={OPCIONES.segundos.map((n) => [n, `${n} s`])} valor={config.segundos} onCambiar={onCambiar && ((segundos) => onCambiar({ segundos }))} />
      </BloqueConfig>
    </>
  );
}
