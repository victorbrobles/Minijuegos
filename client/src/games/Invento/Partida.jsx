// client/src/games/Invento/Partida.jsx
// Pantallas de «El Invento del Siglo» (online y en un dispositivo) con las piezas comunes de ../Pulsador.
import React, { useState } from 'react';
import Icon from '../../components/Icon.jsx';
import { Hero, Cuenta, useRestante, Avatar, Pildoras, PantallaFin, AvisoTurno } from '../Pulsador/Vistas.jsx';
import { BloqueConfig } from '../../components/MenuJuego.jsx';
import { CATEGORIAS, AJUSTES, OPCIONES } from './engine.js';
import './Invento.css';

const HERO = { emoji: '💡' };
const nombreDe = (v, id) => (id === 0 ? 'La casa 🏠' : v.jugadores.find((j) => j.id === id)?.nombre ?? '¿?');
const CARTA = { objeto: { t: 'El objeto', e: '📦' }, problema: { t: 'Tiene que', e: '🎯' }, rasgo: { t: 'Y además', e: '🤪' } };

export function Cartas({ cartas, onCambiar, chicas = false }) {
  return (
    <div className={`ivp-cartas${chicas ? ' chicas' : ''}`}>
      {Object.keys(CARTA).map((k) => (
        <div key={k} className={`ivp-carta ${k}`}>
          <span className="ivp-carta-tipo">{CARTA[k].e} {CARTA[k].t}</span>
          <strong>{cartas[k]}</strong>
          {onCambiar && <button type="button" className="ivp-cambiar" onClick={() => onCambiar(k)}>🔄 Cambiar</button>}
        </div>
      ))}
    </div>
  );
}

function Inventar({ v, enviar, offset, local }) {
  const yo = v.yo;
  const [nombre, setNombre] = useState(yo.invento?.nombre || '');
  const [desc, setDesc] = useState(yo.invento?.desc || '');
  const restante = useRestante(local ? null : v.hasta, offset);
  const puedeCambiar = !yo.invento && yo.cambios < AJUSTES.cambiosPorRonda;
  if (yo.invento) {
    return (
      <>
        <div className="pzp-tarjeta">
          <p className="pzp-etiqueta">Tu invento</p>
          <h2 className="ivp-nombre">{yo.invento.nombre}</h2>
          <p className="ivp-desc">{yo.invento.desc}</p>
          <Cartas cartas={yo.cartas} chicas />
          {!local && <button type="button" className="pzp-enlace oscuro" style={{ marginTop: '0.6rem' }} onClick={() => enviar('retirar')}>✏️ Seguir editando</button>}
        </div>
        {!local && <Espera v={v} restante={restante} texto="Esperando a que los demás terminen sus inventos…" />}
      </>
    );
  }
  return (
    <>
      <Cartas cartas={yo.cartas} onCambiar={puedeCambiar ? (k) => enviar('cambiar', { carta: k }) : null} />
      <p className="ivp-ayuda">{puedeCambiar ? 'Puedes cambiar una de las tres cartas esta ronda.' : 'Ya has cambiado tu carta.'}</p>
      <form className="pzp-tarjeta pzp-form" onSubmit={(e) => { e.preventDefault(); enviar('inventar', { nombre, desc }); }}>
        {!local && v.hasta && <Cuenta ms={restante} total={v.segundos * 1000} />}
        <p className="pzp-etiqueta">Nombre del invento</p>
        <input className="pzp-input" value={nombre} maxLength={AJUSTES.maxNombre} onChange={(e) => setNombre(e.target.value)} placeholder="La Tostinvisible 3000" />
        <p className="pzp-etiqueta" style={{ marginTop: '0.3rem' }}>¿Cómo funciona? ¿Por qué lo necesitas?</p>
        <textarea className="pzp-input ivp-textarea" value={desc} maxLength={AJUSTES.maxDesc} rows={4} onChange={(e) => setDesc(e.target.value)}
          placeholder="Véndelo como en la teletienda…" />
        <p className="pzp-nota">{desc.length}/{AJUSTES.maxDesc}</p>
        <button type="submit" className="pzp-boton" disabled={!nombre.trim() || desc.trim().length < 10}><Icon name="check" size={20} /> Presentar mi invento</button>
      </form>
    </>
  );
}

function Espera({ v, restante, texto }) {
  return (
    <div className="pzp-tarjeta">
      <p className="pzp-esperando-txt">⏳ {texto}</p>
      {restante > 0 && <Cuenta ms={restante} total={v.segundos * 1000} />}
      <div className="ivp-listos">
        {v.jugadores.filter((j) => !j.fuera).map((j) => <span key={j.id} className={j.listo ? 'si' : ''}>{j.listo ? '✓' : '…'} {j.nombre}</span>)}
      </div>
    </div>
  );
}

function Invento({ x, children, ganadas = [] }) {
  return (
    <div className={`pzp-tarjeta ivp-invento${x.mio ? ' mio' : ''}`}>
      <div className="ivp-invento-cab">
        <span className="ivp-letra">{x.letra}</span>
        <div><strong>{x.nombre}</strong>{x.mio && <small>Tu invento</small>}{x.casa && <small>🏠 Invento de la casa</small>}</div>
        {ganadas.length > 0 && <span className="ivp-medallas">{ganadas.map((c) => CATEGORIAS[c].e).join('')}</span>}
      </div>
      <p className="ivp-desc">{x.desc}</p>
      <Cartas cartas={x.cartas} chicas />
      {children}
    </div>
  );
}

function Votar({ v, enviar, local }) {
  const [votos, setVotos] = useState({});
  if (v.yo.votos) {
    return (
      <>
        <div className="pzp-tarjeta">
          <p className="pzp-etiqueta">Tus votos</p>
          {Object.entries(CATEGORIAS).map(([c, C]) => <p key={c} className="ivp-mi-voto">{C.e} {C.nombre}: <strong>{v.yo.votos[c]}</strong></p>)}
        </div>
        {!local && <Espera v={v} restante={0} texto="Esperando los votos de los demás…" />}
      </>
    );
  }
  const opciones = v.inventos.filter((x) => !x.mio).map((x) => [x.letra, x.letra]);
  const completo = Object.keys(CATEGORIAS).every((c) => votos[c]);
  return (
    <>
      {v.inventos.some((x) => x.casa) && <p className="pzp-nota">Sois dos: entra un invento de la casa para que cada voto sea una elección de verdad. Sus votos no dan puntos a nadie.</p>}
      {v.inventos.map((x) => <Invento key={x.letra} x={x} />)}
      <div className="pzp-tarjeta pzp-form ivp-votacion">
        <p className="pzp-etiqueta">Tus votos (no puedes votarte)</p>
        {Object.entries(CATEGORIAS).map(([c, C]) => (
          <BloqueConfig key={c} titulo={`${C.e} ${C.nombre}`}>
            <Pildoras opciones={opciones} valor={votos[c]} onCambiar={(l) => setVotos((x) => ({ ...x, [c]: l }))} />
          </BloqueConfig>
        ))}
        <button type="button" className="pzp-boton" disabled={!completo} onClick={() => enviar('votar', { votos })}><Icon name="check" size={20} /> Votar</button>
      </div>
    </>
  );
}

function Resultados({ v, enviar, puedeSeguir }) {
  const ganadas = (l) => Object.keys(CATEGORIAS).filter((c) => v.ganadores?.[c]?.includes(l));
  const lista = [...v.inventos].sort((a, b) => (b.votos?.puntos ?? 0) - (a.votos?.puntos ?? 0));
  return (
    <>
      <div className="pzp-tarjeta ivp-podio-cats">
        {Object.entries(CATEGORIAS).map(([c, C]) => {
          const ls = v.ganadores?.[c] || [];
          const nombres = ls.map((l) => v.inventos.find((x) => x.letra === l)).filter(Boolean);
          return (
            <div key={c}><span>{C.e}</span><small>{C.nombre}</small>
              <strong>{nombres.length ? nombres.map((x) => `${x.nombre} (${nombreDe(v, x.autor)})`).join(' · ') : 'Nadie'}</strong></div>
          );
        })}
      </div>
      {lista.map((x) => (
        <Invento key={x.letra} x={x} ganadas={ganadas(x.letra)}>
          <div className="ivp-votos">
            <span><Avatar id={x.autor} nombre={nombreDe(v, x.autor)} /> {nombreDe(v, x.autor)}</span>
            {Object.entries(CATEGORIAS).map(([c, C]) => <span key={c}>{C.e} {x.votos?.[c] ?? 0}</span>)}
            <b>+{x.votos?.puntos ?? 0}</b>
          </div>
        </Invento>
      ))}
      <div className="pzp-barra estatica">
        {puedeSeguir ? <button type="button" className="pzp-boton grande" onClick={() => enviar('siguiente')}><Icon name="play" size={20} /> {v.ronda >= v.rondas ? 'Ver el resultado final' : 'Siguiente ronda'}</button>
          : <p className="pzp-esperando">⏳ El anfitrión pasará a la siguiente ronda…</p>}
      </div>
    </>
  );
}

/** Partida (todo salvo el final). */
export function Partida({ v, enviar, offset = 0, onSalir, local = false, puedeSeguir = true, admin = false }) {
  const titulo = { inventar: '¡A inventar!', votar: 'Votación', resultados: 'Resultados' }[v.fase];
  const etiqueta = { inventar: v.yo?.invento ? 'Invento presentado' : 'Combina tus tres cartas', votar: 'Inventos anónimos', resultados: `Ronda ${v.ronda}` }[v.fase];
  return (
    <>
      <Hero v={v} juego={HERO} onSalir={onSalir} chip={`💡 Ronda ${v.ronda}/${v.rondas}`} etiqueta={etiqueta} titulo={titulo} />
      {!local && v.yo && v.fase !== 'resultados' && (
        <AvisoTurno clave={`${v.fase}-${v.ronda}`} emoji={v.fase === 'votar' ? '🗳️' : '💡'} texto={v.fase === 'votar' ? '¡A votar!' : `Ronda ${v.ronda}: ¡a inventar!`}
          sub={v.fase === 'votar' ? 'Vota los inventos sin saber de quién son.' : 'Mira tus tres cartas e inventa algo.'} />
      )}
      {v.fase === 'inventar' && v.yo && <Inventar key={`${v.ronda}-${v.yo.id}`} v={v} enviar={enviar} offset={offset} local={local} />}
      {v.fase === 'votar' && v.yo && <Votar key={`${v.ronda}-${v.yo.id}`} v={v} enviar={enviar} local={local} />}
      {v.fase === 'resultados' && <Resultados v={v} enviar={enviar} puedeSeguir={puedeSeguir} />}
      {admin && v.fase !== 'resultados' && (
        <div className="pzp-barra estatica">
          <button type="button" className="pzp-enlace" onClick={() => enviar('forzar')}><Icon name="forward" size={15} /> {v.fase === 'inventar' ? 'Cerrar inventos y votar' : 'Cerrar la votación'}</button>
        </div>
      )}
    </>
  );
}

export function PartidaOnline({ v, sala, enviar, offset, onSalir }) {
  return <Partida v={v} enviar={enviar} offset={offset} onSalir={onSalir} puedeSeguir={sala.esAdmin} admin={sala.esAdmin} />;
}

export function Fin({ v, juego, onSalir, children }) {
  const m = v.fin.mejor;
  return (
    <PantallaFin v={v} juego={juego} onSalir={onSalir}>
      {m && (
        <div className="pzp-tarjeta ivp-invento">
          <p className="pzp-etiqueta">🏆 El invento del siglo</p>
          <h2 className="ivp-nombre">{m.nombre}</h2>
          <p className="ivp-desc">{m.desc}</p>
          <Cartas cartas={m.cartas} chicas />
          <p className="pzp-nota" style={{ marginTop: '0.4rem' }}>De {nombreDe(v, m.autor)} · {m.puntos} puntos en su ronda</p>
        </div>
      )}
      {children}
    </PantallaFin>
  );
}

export function Config({ config, onCambiar }) {
  return (
    <>
      <BloqueConfig titulo="Rondas">
        <Pildoras opciones={OPCIONES.rondas.map((n) => [n, `${n} rondas`])} valor={config.rondas} onCambiar={onCambiar && ((rondas) => onCambiar({ rondas }))} />
      </BloqueConfig>
      <BloqueConfig titulo="Tiempo para inventar (online)">
        <Pildoras opciones={OPCIONES.segundos.map((n) => [n, `${n / 60} min`])} valor={config.segundos} onCambiar={onCambiar && ((segundos) => onCambiar({ segundos }))} />
      </BloqueConfig>
    </>
  );
}
