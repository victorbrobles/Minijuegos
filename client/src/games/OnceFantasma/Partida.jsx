// client/src/games/OnceFantasma/Partida.jsx
// Pantallas de «El Once Fantasma» (online y en un dispositivo) con las piezas comunes de ../Pulsador.
import React, { useEffect, useRef, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import { Hero, Cuenta, useRestante, Avatar, Pildoras, PantallaFin, colorDe } from '../Pulsador/Vistas.jsx';
import { BloqueConfig } from '../../components/MenuJuego.jsx';
import { AJUSTES, OPCIONES, POSICIONES } from './engine.js';
import './OnceFantasma.css';

const HERO = { emoji: '👻' };
const nombreDe = (v, id) => v.jugadores.find((j) => j.id === id)?.nombre ?? '¿?';
const LINEAS = ['DEL', 'MED', 'DEF', 'POR'];

/** El campo con los once huecos, por líneas. */
function Campo({ v, marcado, onElegir }) {
  return (
    <div className="ofx-campo" role="list" aria-label="Alineación">
      <span className="ofx-circulo" aria-hidden="true" />
      {LINEAS.map((l) => (
        <div key={l} className="ofx-linea">
          {v.huecos.map((h, i) => [h, i]).filter(([h]) => h.pos === l).map(([h, i]) => (
            <button key={i} type="button" role="listitem" onClick={() => onElegir?.(i)}
              className={`ofx-hueco${h.nombre ? ' visto' : ''}${h.por ? ' cazado' : ''}${marcado === i ? ' marcado' : ''}`}
              style={h.por ? { '--c': colorDe(h.por) } : undefined}
              aria-label={h.nombre ? `${h.dorsal}, ${h.nombre}` : `Dorsal ${h.dorsal}, ${POSICIONES[h.pos]}, oculto`}>
              <span className="ofx-camiseta">{h.dorsal}</span>
              <span className="ofx-nombre">{h.nombre ? h.nombre.split(' ').slice(-1)[0] : h.iniciales || '?'}</span>
              {h.dato && !h.nombre && <span className="ofx-dato">{h.dato}</span>}
              {!h.nombre && <span className="ofx-nivel" aria-hidden="true">{[0, 1, 2].map((k) => <i key={k} className={h.nivel > k ? 'on' : ''} />)}</span>}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

/** Ficha del hueco elegido: todas sus pistas destapadas. */
function Ficha({ v, i }) {
  const h = v.huecos[i];
  if (!h) return null;
  return (
    <div className="pzp-tarjeta ofx-ficha">
      <p className="pzp-etiqueta">Dorsal {h.dorsal} · {POSICIONES[h.pos]}</p>
      {h.nombre ? <h2 className="ofx-ficha-nombre">{h.nombre}</h2> : null}
      <ul>
        <li><b>{v.once.tipo === 'club' ? '🌍 País' : '🏟️ Club'}</b> {h.dato || '— oculto —'}</li>
        <li><b>📜 Trayectoria</b> {h.pista || '— oculta —'}</li>
        <li><b>🔤 Iniciales</b> {h.iniciales || '— ocultas —'}</li>
      </ul>
      {h.por && <p className="pzp-nota">Lo descubrió {nombreDe(v, h.por)} (+{h.puntos})</p>}
    </div>
  );
}

function Buscador({ v, enviar, local, jugadorLocal }) {
  const [texto, setTexto] = useState('');
  const campo = useRef(null);
  const ultimo = v.yo?.ultimo;
  const [aviso, setAviso] = useState(null);
  useEffect(() => {
    if (!ultimo) return undefined;
    setAviso(ultimo);
    const t = setTimeout(() => setAviso(null), 2600);
    return () => clearTimeout(t);
  }, [ultimo?.t]); // eslint-disable-line react-hooks/exhaustive-deps
  const mandar = (e) => {
    e.preventDefault();
    if (!texto.trim()) return;
    enviar('adivinar', { texto, jugador: jugadorLocal });
    setTexto('');
    campo.current?.focus();
  };
  return (
    <form className="ofx-buscador" onSubmit={mandar}>
      {aviso && <p className={`ofx-aviso ${aviso.acierto ? 'bien' : 'mal'}`} role="status">{aviso.mensaje}</p>}
      <input ref={campo} className="pzp-input" value={texto} onChange={(e) => setTexto(e.target.value)} maxLength={40}
        placeholder={local ? 'Nombre que ha dicho alguien…' : 'Escribe un futbolista…'} autoComplete="off" autoCapitalize="words" enterKeyHint="send" />
      <button type="submit" className="pzp-boton" disabled={!texto.trim()}><Icon name="check" size={20} /> {local ? '¿Está?' : 'Probar'}</button>
    </form>
  );
}

function Resultado({ v, enviar, puedeSeguir }) {
  const cazados = v.huecos.filter((h) => h.por).length;
  const motivo = { completo: '¡Once completo!', tiempo: 'Se acabó el tiempo', rendicion: 'Os habéis rendido' }[v.motivo] || '';
  return (
    <div className="pzp-tarjeta">
      <p className="pzp-etiqueta">{motivo} · {cazados}/11 descubiertos</p>
      <div className="ofx-sumas">
        {v.jugadores.filter((j) => v.sumas[j.id]).sort((a, b) => v.sumas[b.id] - v.sumas[a.id]).map((j) => (
          <span key={j.id}><Avatar id={j.id} nombre={j.nombre} /> {j.nombre} <b>+{v.sumas[j.id]}</b></span>
        ))}
        {!Object.keys(v.sumas).length && <span>Nadie ha sumado en esta ronda.</span>}
      </div>
      {v.motivo === 'completo' && <p className="pzp-nota">Quien más huecos descubre en un once completo se lleva {AJUSTES.bonusOnce} puntos extra.</p>}
      <div className="pzp-barra estatica">
        {puedeSeguir ? (
          <>
            <button type="button" className="pzp-boton grande" onClick={() => enviar('siguiente')}>
              <Icon name="play" size={20} /> {v.ronda >= v.rondas ? 'Ver resultado final' : 'Siguiente once'}
            </button>
            {v.ronda < v.rondas && <button type="button" className="pzp-enlace" onClick={() => enviar('terminar')}>Terminar la partida ya</button>}
          </>
        ) : <p className="pzp-esperando">⏳ El anfitrión pasará al siguiente once…</p>}
      </div>
    </div>
  );
}

/** Partida (todo salvo el final). En local, `jugadorLocal` es quien se lleva el acierto y `onJugador` lo cambia. */
export function Partida({ v, enviar, offset = 0, onSalir, local = false, admin = true, jugadorLocal, onJugador }) {
  const [marcado, setMarcado] = useState(null);
  const restante = useRestante(v.hasta, offset);
  const proxima = useRestante(v.proximaPista, offset);
  useEffect(() => { setMarcado(null); }, [v.ronda]);
  const cazados = v.huecos.filter((h) => h.por).length;
  return (
    <>
      <Hero v={v} juego={HERO} onSalir={onSalir} chip={`👻 Once ${v.ronda}/${v.rondas}`} etiqueta={v.once.partido} titulo={v.once.equipo}
        turno={local ? jugadorLocal : undefined} />
      <div className="pzp-tarjeta ofx-cabecera">
        <span>🧑‍💼 Entrenador: <b>{v.once.entrenador}</b></span>
        <span>{cazados}/11</span>
      </div>
      {v.fase === 'jugando' && v.hasta && <Cuenta ms={restante} total={v.segundos * 1000} />}
      <Campo v={v} marcado={marcado} onElegir={(i) => setMarcado((m) => (m === i ? null : i))} />
      {marcado !== null ? <Ficha v={v} i={marcado} /> : (
        <p className="ofx-ayuda">{v.fase === 'jugando' ? `Toca una camiseta para ver sus pistas. Próxima pista en ${Math.ceil(proxima / 1000)} s.` : 'Toca una camiseta para ver quién era.'}</p>
      )}
      {v.fase === 'jugando' && (
        <>
          {local && (
            <div className="ofx-quien">
              <p className="pzp-etiqueta">¿Quién lo ha dicho?</p>
              <div className="ofx-quien-lista">
                {v.jugadores.map((j) => (
                  <button key={j.id} type="button" className={jugadorLocal === j.id ? 'activo' : ''} onClick={() => onJugador(j.id)} style={{ '--c': colorDe(j.id) }}>
                    {j.nombre}
                  </button>
                ))}
              </div>
            </div>
          )}
          <Buscador v={v} enviar={enviar} local={local} jugadorLocal={jugadorLocal} />
          {v.registro.length > 0 && (
            <ul className="ofx-registro">
              {v.registro.slice(0, 3).map((r) => (
                <li key={`${r.hueco}`}><b style={{ color: colorDe(r.id) }}>{nombreDe(v, r.id)}</b> ha descubierto a {v.huecos[r.hueco].nombre} (+{r.puntos}){r.pista !== null ? ` y destapa una pista del ${v.huecos[r.pista].dorsal}` : ''}</li>
              ))}
            </ul>
          )}
          {admin && (
            <div className="pzp-barra estatica ofx-controles">
              <button type="button" className="pzp-enlace" onClick={() => enviar('pista')}>💡 Destapar otra pista</button>
              <button type="button" className="pzp-enlace" onClick={() => enviar('rendirse')}>🏳️ Rendirse</button>
            </div>
          )}
        </>
      )}
      {v.fase === 'resultado' && <Resultado v={v} enviar={enviar} puedeSeguir={admin} />}
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
      <BloqueConfig titulo="Onces">
        <Pildoras opciones={OPCIONES.rondas.map((n) => [n, n === 1 ? '1 once' : `${n} onces`])} valor={config.rondas} onCambiar={onCambiar && ((rondas) => onCambiar({ rondas }))} />
      </BloqueConfig>
      <BloqueConfig titulo="Tiempo por once">
        <Pildoras opciones={OPCIONES.segundos.map((n) => [n, `${n / 60} min`])} valor={config.segundos} onCambiar={onCambiar && ((segundos) => onCambiar({ segundos }))} />
      </BloqueConfig>
    </>
  );
}
