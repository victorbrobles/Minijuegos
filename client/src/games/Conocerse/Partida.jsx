// client/src/games/Conocerse/Partida.jsx
// Pantallas de «Qué malo es conocerse» (online y en un dispositivo) con las piezas comunes de ../Pulsador.
import React, { useState } from 'react';
import Icon from '../../components/Icon.jsx';
import { Hero, Avatar, Pildoras, PantallaFin, AvisoTurno, colorDe } from '../Pulsador/Vistas.jsx';
import { BloqueConfig } from '../../components/MenuJuego.jsx';
import { AJUSTES, OPCIONES } from './engine.js';
import { TEMAS } from './preguntas.js';
import './Conocerse.css';

export const HERO = { id: 'conocerse', emoji: '🙈' };
const nombreDe = (v, id) => v.jugadores.find((j) => j.id === id)?.nombre ?? '¿?';

/** La pregunta, con el protagonista y el tema. */
function Pregunta({ v, pequena = false }) {
  return (
    <div className={`pzp-tarjeta cmc-pregunta${pequena ? ' pequena' : ''}`} style={{ '--c': colorDe(v.protagonista) }}>
      <div className="cmc-pregunta-cab">
        <Avatar id={v.protagonista} nombre={nombreDe(v, v.protagonista)} grande={!pequena} />
        <div>
          <span className="cmc-tema">{TEMAS[v.pregunta?.tema] ?? '❓ Pregunta'}</span>
          <small>Pregunta para <b>{nombreDe(v, v.protagonista)}</b></small>
        </div>
      </div>
      <h2>{v.enunciado}</h2>
    </div>
  );
}

function Listos({ v, texto }) {
  return (
    <div className="pzp-tarjeta">
      <p className="pzp-esperando-txt">⏳ {texto}</p>
      <div className="cmc-listos">
        {v.jugadores.filter((j) => !j.fuera && !(v.fase === 'responder' && j.id === v.protagonista)).map((j) => <span key={j.id} className={j.listo ? 'si' : ''}>{j.listo ? '✓' : '…'} {j.nombre}</span>)}
      </div>
    </div>
  );
}

function Responder({ v, enviar, local }) {
  const yo = v.yo;
  const [texto, setTexto] = useState(yo.respuesta || '');
  const prota = nombreDe(v, v.protagonista);
  if (yo.protagonista) {
    return (
      <>
        <Pregunta v={v} />
        <div className="pzp-tarjeta cmc-sobre-ti">
          <p className="cmc-grande">🙈 La pregunta es sobre ti</p>
          <p className="pzp-texto">Los demás están escribiendo lo que creen que contestarías. Luego elegirás la respuesta que más se acerque a la verdad.</p>
          {v.respondidas === 0 && <button type="button" className="pzp-boton secundario" onClick={() => enviar('otra')}>🔄 Otra pregunta</button>}
        </div>
        {!local && <Listos v={v} texto="Esperando las respuestas…" />}
      </>
    );
  }
  if (yo.respuesta) {
    return (
      <>
        <Pregunta v={v} pequena />
        <div className="pzp-tarjeta">
          <p className="pzp-etiqueta">Tu respuesta</p>
          <p className="cmc-mi-respuesta">«{yo.respuesta}»</p>
          {!local && <button type="button" className="pzp-enlace oscuro" onClick={() => enviar('retirar')}>✏️ Cambiar mi respuesta</button>}
        </div>
        {!local && <Listos v={v} texto="Esperando a que respondan los demás…" />}
      </>
    );
  }
  return (
    <>
      <Pregunta v={v} />
      <form className="pzp-tarjeta pzp-form" onSubmit={(e) => { e.preventDefault(); if (texto.trim()) enviar('responder', { texto }); }}>
        <p className="pzp-etiqueta">¿Qué contestaría {prota}?</p>
        <textarea className="pzp-input cmc-textarea" value={texto} maxLength={AJUSTES.maxRespuesta} rows={3} autoFocus onChange={(e) => setTexto(e.target.value)}
          placeholder={`Escribe lo que crees que diría ${prota}…`} />
        <p className="pzp-nota">Nadie sabrá que es tuya hasta el desglose · {texto.length}/{AJUSTES.maxRespuesta}</p>
        <button type="submit" className="pzp-boton" disabled={!texto.trim()}><Icon name="check" size={20} /> Enviar respuesta</button>
        {local && v.respondidas === 0 && <button type="button" className="pzp-enlace oscuro" onClick={() => enviar('otra')}>🔄 Cambiar la pregunta</button>}
      </form>
    </>
  );
}

function Elegir({ v, enviar, local }) {
  const yo = v.yo;
  const [sel, setSel] = useState(null);
  const prota = nombreDe(v, v.protagonista);
  if (yo.eleccion) {
    const r = v.respuestas.find((x) => x.letra === yo.eleccion);
    return (
      <>
        <Pregunta v={v} pequena />
        <div className="pzp-tarjeta">
          <p className="pzp-etiqueta">{yo.protagonista ? 'Has elegido como buena' : 'Tu apuesta'}</p>
          <p className="cmc-mi-respuesta"><b>{r?.letra}</b> «{r?.texto}»</p>
        </div>
        {!local && <Listos v={v} texto="Esperando a que elijan los demás…" />}
      </>
    );
  }
  return (
    <>
      <Pregunta v={v} pequena />
      <p className="cmc-instruccion">{yo.protagonista ? '👑 Elige la respuesta que más se acerca a la verdad (o la que más te guste)' : `🎲 ¿Cuál crees que elegirá ${prota}?`}</p>
      <div className="cmc-opciones">
        {v.respuestas.map((r) => (
          <button key={r.letra} type="button" className={`cmc-opcion${sel === r.letra ? ' sel' : ''}${r.mia ? ' mia' : ''}`} onClick={() => setSel(r.letra)}>
            <span className="cmc-letra">{r.letra}</span>
            <span className="cmc-texto">{r.texto}{r.mia && <small>Tu respuesta{yo.protagonista ? '' : ' · si la eliges y no es la buena, −1'}</small>}</span>
          </button>
        ))}
      </div>
      <div className="pzp-barra estatica">
        <button type="button" className="pzp-boton grande" disabled={!sel} onClick={() => enviar('elegir', { letra: sel })}><Icon name="check" size={20} /> {sel ? `Elegir la ${sel}` : 'Elige una respuesta'}</button>
      </div>
    </>
  );
}

function Desglose({ v, enviar, puedeSeguir }) {
  const prota = nombreDe(v, v.protagonista);
  const lista = [...v.respuestas].sort((a, b) => Number(b.correcta) - Number(a.correcta) || b.votantes.length - a.votantes.length);
  return (
    <>
      <Pregunta v={v} pequena />
      {v.resultado?.anulada && (
        <div className="pzp-tarjeta"><p className="pzp-texto">{v.resultado.seFue ? `${prota} se ha ido de la partida: esta ronda no cuenta.` : `${prota} no eligió ninguna respuesta: esta ronda no cuenta.`}</p></div>
      )}
      {lista.map((r) => (
        <div key={r.letra} className={`pzp-tarjeta cmc-desglose${r.correcta ? ' correcta' : ''}`}>
          {r.correcta && <span className="cmc-sello">👑 La elegida por {prota}</span>}
          <p className="cmc-desglose-texto"><span className="cmc-letra">{r.letra}</span> «{r.texto}»</p>
          <p className="cmc-autor"><Avatar id={r.autor} nombre={nombreDe(v, r.autor)} /> Respuesta de <b>{nombreDe(v, r.autor)}</b></p>
          <div className="cmc-votantes">
            {r.votantes.length ? r.votantes.map((id) => (
              <span key={id} className={`${id === v.protagonista ? 'prota' : ''}${id === r.autor ? ' propio' : ''}`} style={{ '--c': colorDe(id) }}>
                {id === v.protagonista ? '👑 ' : ''}{nombreDe(v, id)}{id === r.autor ? ' (se votó)' : ''}
              </span>
            )) : <em>Nadie la ha elegido</em>}
          </div>
        </div>
      ))}
      <div className="pzp-barra estatica">
        {puedeSeguir ? <button type="button" className="pzp-boton grande" onClick={() => enviar('siguiente')}><Icon name="play" size={20} /> Ver los puntos</button>
          : <p className="pzp-esperando">⏳ El anfitrión pasará a los puntos…</p>}
      </div>
    </>
  );
}

const MOTIVO = {
  elegida: (prota) => `🎯 ${prota} eligió su respuesta`,
  acierto: () => '✅ Acertó cuál elegiría',
  engaño: () => '🃏 Votos que se llevó',
  autovoto: () => '🙈 Se votó y no era la buena'
};
function Puntos({ v, enviar, puedeSeguir }) {
  const prota = nombreDe(v, v.protagonista);
  const pts = v.resultado?.puntos || {};
  const filas = v.jugadores.filter((j) => !j.fuera).map((j) => ({ ...j, delta: pts[j.id]?.total ?? 0, motivos: pts[j.id]?.motivos ?? [] }))
    .sort((a, b) => (a.id === v.protagonista) - (b.id === v.protagonista) || b.delta - a.delta || b.puntos - a.puntos);
  // Agrupa los motivos repetidos (varios votos «engañados» = una línea con su total)
  const agrupar = (ms) => Object.values(ms.reduce((acc, [m, p]) => { acc[m] = acc[m] || { m, p: 0, n: 0 }; acc[m].p += p; acc[m].n += 1; return acc; }, {}));
  const ultima = v.ronda >= v.rondas;
  return (
    <>
      <div className="pzp-tarjeta">
        <p className="pzp-etiqueta">Puntos de la ronda</p>
        <ul className="cmc-puntos">
          {filas.map((j) => (
            <li key={j.id} className={j.delta > 0 ? 'sube' : j.delta < 0 ? 'baja' : ''}>
              <Avatar id={j.id} nombre={j.nombre} />
              <div className="cmc-puntos-nombre">
                <b>{j.nombre}</b>
                <small>{j.id === v.protagonista ? `👑 Protagonista: esta ronda no suma` : j.motivos.length ? agrupar(j.motivos).map((x) => `${MOTIVO[x.m](prota)}${x.m === 'engaño' ? ` (${x.n})` : ''} ${x.p > 0 ? '+' : ''}${x.p}`).join(' · ') : 'Sin puntos esta ronda'}</small>
              </div>
              <span className="cmc-delta">{j.id === v.protagonista ? '—' : `${j.delta > 0 ? '+' : ''}${j.delta}`}</span>
              <strong className="cmc-total">{j.puntos}</strong>
            </li>
          ))}
        </ul>
      </div>
      <div className="pzp-barra estatica">
        {puedeSeguir ? <button type="button" className="pzp-boton grande" onClick={() => enviar('siguiente')}><Icon name="play" size={20} /> {ultima ? 'Ver el resultado final' : 'Siguiente pregunta'}</button>
          : <p className="pzp-esperando">⏳ El anfitrión pasará a la siguiente pregunta…</p>}
      </div>
    </>
  );
}

/** Partida (todo salvo el final). */
export function Partida({ v, enviar, onSalir, local = false, puedeSeguir = true, admin = false }) {
  const prota = nombreDe(v, v.protagonista);
  const titulo = { responder: v.yo?.protagonista ? 'Hablan de ti…' : `¿Qué diría ${prota}?`, elegir: v.yo?.protagonista ? '¿Cuál es la buena?' : `¿Qué elegirá ${prota}?`, desglose: 'El desglose', puntos: 'Puntos' }[v.fase];
  // En el desglose el marcador aún no enseña los puntos de la ronda: se ven en su pantalla aparte
  const vHero = v.fase === 'desglose' && v.resultado ? { ...v, jugadores: v.jugadores.map((j) => ({ ...j, puntos: j.puntos - (v.resultado.puntos?.[j.id]?.total ?? 0) })) } : v;
  const etiqueta = { responder: 'Respuestas secretas', elegir: 'Respuestas anónimas', desglose: `Pregunta ${v.ronda} de ${v.rondas}`, puntos: `Pregunta ${v.ronda} de ${v.rondas}` }[v.fase];
  return (
    <>
      <Hero v={vHero} juego={HERO} onSalir={onSalir} chip={`🙈 ${v.ronda}/${v.rondas}`} etiqueta={etiqueta} titulo={titulo} turno={v.protagonista} />
      {!local && v.yo && (v.fase === 'responder' || v.fase === 'elegir') && (
        <AvisoTurno clave={`${v.fase}-${v.ronda}`} emoji={v.fase === 'elegir' ? '🗳️' : v.yo.protagonista ? '🙈' : '✍️'}
          texto={v.fase === 'elegir' ? '¡A elegir!' : v.yo.protagonista ? '¡La pregunta es para ti!' : `Pregunta para ${prota}`}
          sub={v.fase === 'elegir' ? 'Elige una respuesta sin saber de quién es.' : v.yo.protagonista ? 'Los demás van a responder por ti.' : `Escribe lo que crees que contestaría ${prota}.`} />
      )}
      {v.fase === 'responder' && v.yo && <Responder key={`${v.ronda}-${v.yo.id}-${v.pregunta?.id}`} v={v} enviar={enviar} local={local} />}
      {v.fase === 'elegir' && v.yo && <Elegir key={`${v.ronda}-${v.yo.id}`} v={v} enviar={enviar} local={local} />}
      {v.fase === 'desglose' && <Desglose v={v} enviar={enviar} puedeSeguir={puedeSeguir} />}
      {v.fase === 'puntos' && <Puntos v={v} enviar={enviar} puedeSeguir={puedeSeguir} />}
      {admin && (v.fase === 'responder' || v.fase === 'elegir') && (
        <div className="pzp-barra estatica">
          <button type="button" className="pzp-enlace" onClick={() => enviar('forzar')}><Icon name="forward" size={15} /> {v.fase === 'responder' ? 'Cerrar respuestas y elegir' : 'Cerrar la elección'}</button>
          {v.fase === 'responder' && v.respondidas === 0 && !v.yo?.protagonista && <button type="button" className="pzp-enlace" onClick={() => enviar('otra')}>🔄 Otra pregunta</button>}
        </div>
      )}
    </>
  );
}

export function PartidaOnline({ v, sala, enviar, onSalir }) {
  return <Partida v={v} enviar={enviar} onSalir={onSalir} puedeSeguir={sala.esAdmin} admin={sala.esAdmin} />;
}

export function Fin({ v, juego, onSalir, children }) {
  const f = v.fin;
  const nombres = (ids) => ids.map((id) => nombreDe(v, id)).join(' y ');
  return (
    <PantallaFin v={v} juego={juego} onSalir={onSalir}>
      {(f.conocedores?.length > 0 || f.clavos?.length > 0) && (
        <div className="pzp-tarjeta cmc-premios">
          {f.conocedores?.length > 0 && <div><span>🧠</span><small>Quien mejor os conoce</small><strong>{nombres(f.conocedores)}</strong></div>}
          {f.clavos?.length > 0 && <div><span>🎯</span><small>Más respuestas elegidas</small><strong>{nombres(f.clavos)}</strong></div>}
        </div>
      )}
      {children}
    </PantallaFin>
  );
}

export function Config({ config, onCambiar, sala }) {
  const n = sala?.jugadores?.length;
  return (
    <BloqueConfig titulo="Rondas">
      <Pildoras opciones={OPCIONES.vueltas.map((k) => [k, `Jugadores ×${k}`])} valor={config.vueltas} onCambiar={onCambiar && ((vueltas) => onCambiar({ vueltas }))} />
      <p className="pzp-nota">Cada jugador será el protagonista {config.vueltas} veces{n ? ` (${n * config.vueltas} preguntas)` : ''}.</p>
    </BloqueConfig>
  );
}
