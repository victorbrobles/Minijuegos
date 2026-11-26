// client/src/games/Draft/Draft.jsx
// «El Draft de Estrellas»: categoría y criterio claros; todos fichan a la vez (el más rápido se lo queda) hasta tener
// 4 famosos, y al final se desvelan los datos. Comodines: robar, cambiar y chivato. Online o en un móvil (por turnos).
import React, { useState } from 'react';
import JuegoPulsador from '../Pulsador/JuegoPulsador.jsx';
import LocalPorTurnos from '../comun/LocalPorTurnos.jsx';
import { useReloj } from '../comun/Lienzo2D.jsx';
import { Hero, Pildoras, useLatido, colorDe } from '../Pulsador/Vistas.jsx';
import { BloqueConfig } from '../../components/MenuJuego.jsx';
import * as E from './engine.js';
import { CATEGORIAS } from './famosos.js';
import './Draft.css';

function Restante({ v }) {
  useLatido(500);
  const ahora = useReloj(v);
  const s = Math.max(0, Math.ceil((v.limite - ahora()) / 1000));
  return <b className={s <= 10 ? 'dr-urgente' : ''}>{s}s</b>;
}

const apellido = (n) => n.split(' ').slice(-1)[0];

function Ultimo({ v }) {
  const u = v.ultimo;
  if (!u || u.tipo === 'fichar') return null;
  const nombre = (id) => v.jugadores.find((j) => j.id === id)?.nombre;
  const f = v.pool[u.idx]?.n;
  const texto = u.tipo === 'robar' ? `🦹 ${nombre(u.id)} le ha robado ${f} a ${nombre(u.victima)}` : `🔁 ${nombre(u.id)} ha devuelto a ${f}`;
  return <p className="dr-ultimo" key={u.t}>{texto}</p>;
}

function Partida({ v, enviar, onSalir, local }) {
  const [modo, setModo] = useState(null); // null (fichar) | 'robar' | 'cambiar' | 'chivato'
  const cat = CATEGORIAS[v.categoria];
  const cr = E.CRITERIOS[v.criterio];
  const yoId = local ? v.turno : v.yo?.id;
  const yo = v.jugadores.find((j) => j.id === yoId);
  const lleno = yo && yo.equipo.length >= v.porJugador;
  const extra = (j) => <small className="dr-mini">{j.equipo.length}/{v.porJugador} · {j.equipo.map((i) => apellido(v.pool[i]?.n || '')).join(', ') || '—'}</small>;

  if (v.fase === 'revelar' && v.resultado) {
    const sumas = Object.fromEntries(v.resultado.sumas.map((s) => [s.id, s.suma]));
    const orden = [...v.jugadores].filter((j) => !j.fuera).sort((a, b) => (sumas[b.id] - sumas[a.id]) * cr.mejor);
    const mejor = v.pool[v.resultado.mejor];
    return (
      <>
        <Hero v={v} juego={JUEGO} onSalir={onSalir} chip={`${cat.emoji} Ronda ${v.ronda}/${v.rondas}`} etiqueta={`${cat.nombre} · ${cr.emoji} ${cr.nombre}`} titulo="¡Se desvelan los datos!" clase="fin" />
        <div className="dr-equipos">
          {orden.map((j, n) => (
            <div key={j.id} className={`pzp-tarjeta dr-equipo${n === 0 ? ' gana' : ''}`} style={{ '--c': colorDe(j.id) }}>
              <p className="dr-equipo-nombre">{['🥇', '🥈', '🥉'][n] || `${n + 1}.º`} {j.nombre} <em>+{v.resultado.puntos[j.id] ?? 0}</em></p>
              <ul>{j.equipo.map((i) => { const f = v.pool[i]; return <li key={i}>{f.n}<b>{f.dato}</b></li>; })}</ul>
              <p className="dr-suma">{v.criterio === 'antes' || v.criterio === 'despues' ? `Media: ${Math.round(sumas[j.id] / Math.max(1, j.equipo.length))}` : `${sumas[j.id]} ${cr.unidad}`}</p>
            </div>
          ))}
        </div>
        {mejor && <p className="pzp-nota dr-mejor">⭐ El mejor de la lista era <b>{mejor.n}</b> ({mejor.dato}){mejor.de != null ? ` y lo tenía ${v.jugadores.find((j) => j.id === mejor.de)?.nombre}` : ', ¡y nadie lo fichó!'}</p>}
        <div className="dr-pool dr-pool-fin">
          {v.pool.map((f, i) => <span key={i} className={`dr-famoso${f.de != null ? ' cogido' : ''}`} style={f.de != null ? { '--c': colorDe(f.de) } : undefined}><b>{f.n}</b><small>{f.dato}</small></span>)}
        </div>
        <p className="pzp-esperando">Siguiente ronda en <Restante v={v} /></p>
      </>
    );
  }

  const pulsar = (i, f) => {
    if (!yo) return;
    if (modo === 'robar') { if (f.de != null && f.de !== yoId) { enviar('robar', { idx: i }); setModo(null); } return; }
    if (modo === 'cambiar') { if (f.de === yoId) { enviar('cambiar', { idx: i }); setModo(null); } return; }
    if (modo === 'chivato') { if (f.de == null) { enviar('chivato', { idx: i }); setModo(null); } return; }
    if (f.de == null && !lleno) enviar('fichar', { idx: i });
  };
  const usable = (k) => yo && !yo.usados?.[k] && (k !== 'robar' || !lleno) && (k !== 'cambiar' || yo.equipo.length > 0);
  const activo = (f) => {
    if (!yo) return false;
    if (modo === 'robar') return f.de != null && f.de !== yoId;
    if (modo === 'cambiar') return f.de === yoId;
    if (modo === 'chivato') return f.de == null && !f.dato;
    return f.de == null && !lleno;
  };
  const etiqueta = local ? `Le toca a ${yo?.nombre ?? '…'}` : lleno ? '¡Equipo completo! Esperando a los demás…' : `Ficha ${v.porJugador - (yo?.equipo.length || 0)} más · ¡el más rápido se lo queda!`;

  return (
    <>
      <Hero v={v} juego={JUEGO} onSalir={onSalir} chip={`${cat.emoji} Ronda ${v.ronda}/${v.rondas}`} turno={v.turno} extra={extra} etiqueta={etiqueta}
        titulo={<>{cat.emoji} {cat.nombre}<span className="dr-criterio-titulo">{cr.emoji} {cr.nombre}</span></>} />
      <Ultimo v={v} />
      <div className="dr-barra">
        <span className="dr-reloj">⏱️ <Restante v={v} /></span>
        {yo && (
          <div className="dr-extras">
            {Object.entries(E.EXTRAS).map(([k, x]) => (
              <button key={k} type="button" title={x.texto} className={`dr-extra${modo === k ? ' activo' : ''}`} disabled={!usable(k) && modo !== k}
                onClick={() => setModo((m) => (m === k ? null : k))}>
                {x.emoji} {x.nombre}{yo.usados?.[k] ? ' ✓' : ''}
              </button>
            ))}
          </div>
        )}
      </div>
      {modo && <p className="dr-modo">{E.EXTRAS[modo].emoji} {modo === 'robar' ? 'Toca un famoso de otro jugador para robárselo.' : modo === 'cambiar' ? 'Toca uno de tus famosos para devolverlo.' : 'Toca un famoso libre para ver su dato.'} <button type="button" onClick={() => setModo(null)}>Cancelar</button></p>}
      <div className="dr-pool">
        {v.pool.map((f, i) => {
          const dueño = v.jugadores.find((j) => j.id === f.de);
          const mio = f.de != null && f.de === yoId;
          return (
            <button key={f.n} type="button" className={`dr-famoso${dueño ? ' cogido' : ''}${mio ? ' mio' : ''}${activo(f) ? '' : ' apagado'}${modo && activo(f) ? ' objetivo' : ''}`}
              style={dueño ? { '--c': colorDe(dueño.id) } : undefined} disabled={!activo(f)} onClick={() => pulsar(i, f)}>
              <b>{f.n}</b>
              {f.dato && <em className="dr-dato">👁️ {f.dato}</em>}
              {dueño && <small>{mio ? 'Tuyo' : dueño.nombre}</small>}
            </button>
          );
        })}
      </div>
      <p className="pzp-nota dr-nota">{local ? 'Por turnos: cada uno ficha uno cada vez. Los datos se desvelan al final.' : 'Todos a la vez: el primero que toca un famoso se lo queda. Si se acaba el tiempo, los huecos se rellenan al azar.'}</p>
    </>
  );
}

function Config({ config, onCambiar }) {
  return (
    <BloqueConfig titulo="Rondas">
      <Pildoras opciones={E.OPCIONES_RONDAS.map((n) => [n, `${n} rondas`])} valor={config.rondas} onCambiar={onCambiar && ((rondas) => onCambiar({ rondas }))} />
    </BloqueConfig>
  );
}

// En un móvil se ficha por turnos (no hay «el más rápido»)
const E_LOCAL = { ...E, crearPartida: (j, items, reglas, ahora) => E.crearPartida(j, items, { ...reglas, local: true }, ahora) };

const JUEGO = {
  id: 'draft',
  api: '/api/draft',
  emoji: '🌟',
  config: { rondas: 5 },
  tiempoReal: true,
  Partida: (props) => <Partida {...props} />,
  Config,
  Local: (props) => <LocalPorTurnos {...props} E={E_LOCAL} />,
  textoEmpezar: '¡Empieza el draft!',
  notaSala: '🌟 Cada ronda: una categoría y un criterio. Todos fichan a la vez (el más rápido se lo queda) hasta tener 4 famosos.',
  ganador: (n) => `¡${n.join(' y ')} ${n.length > 1 ? 'saben' : 'sabe'} más de famosos que nadie!`,
  detalleFin: (j) => `${j.puntos} ${j.puntos === 1 ? 'punto' : 'puntos'}`
};

export default function Draft({ onExit }) {
  return <JuegoPulsador juego={JUEGO} onExit={onExit} />;
}
