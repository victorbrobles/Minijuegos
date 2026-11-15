// client/src/games/Habilidad/Habilidad.jsx
// «Test de habilidad»: el anfitrión elige cuántos minijuegos y cuáles (en orden); se juegan a la vez (online) o por
// turnos (un móvil), y tras cada uno se ve su tabla. Los puntos por puesto se acumulan hasta el ganador global.
import React, { useRef, useState } from 'react';
import JuegoPulsador from '../Pulsador/JuegoPulsador.jsx';
import LocalPorTurnos from '../comun/LocalPorTurnos.jsx';
import { Hero, Pildoras, PantallaFin, useLatido, colorDe } from '../Pulsador/Vistas.jsx';
import { BloqueConfig } from '../../components/MenuJuego.jsx';
import Icon from '../../components/Icon.jsx';
import * as E from './engine.js';
import { OPCIONES_N } from './catalogo.js';
import { MINIJUEGOS, POR_ID } from './minijuegos/index.js';
import { Minijuego, formatear } from './comun.jsx';
import './Habilidad.css';

function Restante({ v }) {
  useLatido(500);
  const base = useRef({ ahora: v.ahora, local: Date.now() });
  if (base.current.ahora !== v.ahora) base.current = { ahora: v.ahora, local: Date.now() };
  if (!v.limite) return null;
  return <>{Math.max(0, Math.ceil((v.limite - (v.ahora + Date.now() - base.current.local)) / 1000))} s</>;
}

/* ───────── Configuración: cuántos y cuáles ───────── */
function Selector({ config, onCambiar, onCerrar }) {
  const [lista, setLista] = useState(config.juegos || []);
  const n = config.n;
  const alternar = (id) => setLista((l) => (l.includes(id) ? l.filter((x) => x !== id) : l.length >= n ? l : [...l, id]));
  const guardar = () => { onCambiar({ juegos: lista }); onCerrar(); };
  const lleno = lista.length >= n;
  return (
    <div className="rg-modal-fondo hb-sel-fondo" onClick={guardar}>
      <div className="hb-sel" role="dialog" aria-label="Elegir minijuegos" onClick={(e) => e.stopPropagation()}>
        <header className="hb-sel-cab">
          <div className="hb-sel-titulo">
            <div>
              <small>Test de habilidad</small>
              <h3>Elige {n} minijuegos</h3>
            </div>
            <button type="button" className="hb-sel-cerrar" onClick={guardar} aria-label="Cerrar"><Icon name="close" size={18} /></button>
          </div>
          <div className="hb-sel-huecos" aria-label="Orden elegido">
            {Array.from({ length: n }, (_, i) => {
              const id = lista[i];
              return id
                ? <button key={i} type="button" className="lleno" title={`Quitar ${POR_ID[id].nombre}`} onClick={() => alternar(id)}><i>{i + 1}</i>{POR_ID[id].emoji}</button>
                : <span key={i}><i>{i + 1}</i>?</span>;
            })}
          </div>
          <p>{lista.length}/{n} elegidos · tócalos en el orden en que se jugarán{lista.length < n ? ' · los huecos saldrán al azar' : ''}</p>
        </header>
        <div className="hb-sel-acc">
          <button type="button" onClick={() => setLista(E.completarLista([], n))}>🎲 Al azar</button>
          <button type="button" onClick={() => setLista(E.completarLista(lista, n))} disabled={lleno}>➕ Completar</button>
          <button type="button" onClick={() => setLista([])} disabled={!lista.length}>🧹 Vaciar</button>
        </div>
        <div className="hb-sel-grid">
          {MINIJUEGOS.map((j) => {
            const k = lista.indexOf(j.id);
            return (
              <button key={j.id} type="button" className={k >= 0 ? 'sel' : lleno ? 'apagado' : ''} onClick={() => alternar(j.id)} aria-pressed={k >= 0}>
                {k >= 0 && <i>{k + 1}</i>}
                <span>{j.emoji}</span>
                <b>{j.nombre}</b>
                <small>{j.como.split('.')[0]}.</small>
              </button>
            );
          })}
        </div>
        <footer className="hb-sel-pie">
          <button type="button" className="big full qq-btn-principal" onClick={guardar}>
            <Icon name="check" size={20} /> {lista.length ? `Listo (${lista.length}/${n})` : 'Listo: todos al azar'}
          </button>
        </footer>
      </div>
    </div>
  );
}

function Config({ config, onCambiar }) {
  const [abierto, setAbierto] = useState(false);
  const elegidos = (config.juegos || []).slice(0, config.n);
  return (
    <>
      <BloqueConfig titulo="¿A cuántos minijuegos?">
        <Pildoras opciones={OPCIONES_N.map((n) => [n, `${n}`])} valor={config.n} onCambiar={onCambiar && ((n) => onCambiar({ n, juegos: (config.juegos || []).slice(0, n) }))} />
      </BloqueConfig>
      <BloqueConfig titulo="Los minijuegos (en orden)">
        <div className="hb-elegidos">
          {elegidos.length ? elegidos.map((id, i) => <span key={id}>{i + 1}. {POR_ID[id]?.emoji} {POR_ID[id]?.nombre}</span>) : <small>Al azar</small>}
          {elegidos.length > 0 && elegidos.length < config.n && <small>+ {config.n - elegidos.length} al azar</small>}
        </div>
        {onCambiar && <button type="button" className="hb-abrir" onClick={() => setAbierto(true)}>🎮 Elegir juegos ({elegidos.length}/{config.n})</button>}
      </BloqueConfig>
      {abierto && onCambiar && <Selector config={config} onCambiar={onCambiar} onCerrar={() => setAbierto(false)} />}
    </>
  );
}

/* ───────── Partida ───────── */
function Tabla({ v }) {
  const u = v.ultimo; const juego = POR_ID[u.juego];
  return (
    <ol className="hb-tabla">
      {u.tabla.map((t) => (
        <li key={t.id} className={t.puesto === 1 ? 'primero' : ''} style={{ '--c': colorDe(t.id) }}>
          <span>{t.puesto ? (['🥇', '🥈', '🥉'][t.puesto - 1] || `${t.puesto}.º`) : '—'}</span>
          <b>{t.nombre}</b><small>{formatear(juego, t.valor)}</small><em>+{t.pts}</em>
          <strong>{v.jugadores.find((j) => j.id === t.id)?.puntos}</strong>
        </li>
      ))}
    </ol>
  );
}

function Partida({ v, enviar, onSalir, admin, local }) {
  const juego = POR_ID[v.actual?.id];
  if (v.fase === 'resultados') {
    const j = POR_ID[v.ultimo.juego];
    return (
      <>
        <Hero v={v} juego={JUEGO} onSalir={onSalir} chip={`🎮 Juego ${v.ronda}/${v.rondas}`} etiqueta="Resultados" titulo={`${j.emoji} ${j.nombre}`} clase="fin" />
        <div className="pzp-tarjeta">
          <p className="pzp-etiqueta">Puesto · resultado · puntos · total</p>
          <Tabla v={v} />
          {(local || admin) ? <button type="button" className="pzp-boton grande" onClick={() => enviar('siguiente')}>{v.ronda >= v.rondas ? '🏆 Ver el ganador' : `▶️ Siguiente: ${POR_ID[v.lista[v.i + 1]].emoji} ${POR_ID[v.lista[v.i + 1]].nombre}`}</button>
            : <p className="pzp-esperando">Esperando al anfitrión…</p>}
        </div>
      </>
    );
  }
  const yo = v.jugadores.find((x) => x.id === v.yo?.id);
  const jugando = v.yo && !v.yo.hecho;
  return (
    <>
      <div className="hb-barra">
        <button type="button" onClick={onSalir} aria-label="Salir"><Icon name="door" size={14} /></button>
        <span>🎮 {v.ronda}/{v.rondas} · {juego?.emoji} {juego?.nombre}</span>
        {!local && v.limite && <small>⏳ <Restante v={v} /></small>}
      </div>
      {jugando && juego ? (
        <Minijuego key={`${v.i}-${v.yo.id}`} juego={juego} semilla={v.actual.semilla} quien={local ? yo?.nombre : null} onFin={(valor) => enviar('resultado', { valor })} />
      ) : (
        <div className="pzp-tarjeta hb-espera">
          <span>⏳</span>
          <p className="pzp-etiqueta centrada">Esperando a que terminen…</p>
          <div className="hb-hechos">{v.jugadores.filter((x) => !x.fuera).map((x) => <span key={x.id} className={x.hecho ? 'si' : ''}>{x.hecho ? '✅' : '🎮'} {x.nombre}</span>)}</div>
          {admin && !local && <button type="button" className="pzp-enlace oscuro" onClick={() => enviar('forzar')}><Icon name="forward" size={15} /> No esperar más</button>}
        </div>
      )}
    </>
  );
}

function Fin(props) {
  return <PantallaFin {...props}>{props.children}</PantallaFin>;
}

const JUEGO = {
  id: 'habilidad',
  api: '/api/habilidad',
  emoji: '🎮',
  config: { n: 5, juegos: [] },
  Partida: (props) => <Partida {...props} admin={props.admin ?? props.sala?.esAdmin} />,
  Fin,
  Config,
  Local: (props) => <LocalPorTurnos {...props} E={E} />,
  textoPasar: (v, quien) => `Le toca jugar a ${v.jugadores.find((j) => j.id === quien)?.nombre} el minijuego «${POR_ID[v.actual?.id]?.nombre}».`,
  textoEmpezar: '¡Que empiece el test!',
  notaSala: '🎮 Todos juegan cada minijuego a la vez, cada uno en su móvil.',
  ganador: (n) => (n.length > 1 ? `¡${n.join(' y ')} empatan como los más hábiles!` : `¡${n[0]} es el más hábil!`),
  detalleFin: (j) => `${j.victorias} ${j.victorias === 1 ? 'minijuego ganado' : 'minijuegos ganados'}`,
};

export default function Habilidad({ onExit }) {
  return <JuegoPulsador juego={JUEGO} onExit={onExit} />;
}
