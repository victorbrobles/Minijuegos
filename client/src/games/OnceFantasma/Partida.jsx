// client/src/games/OnceFantasma/Partida.jsx
// Pantallas de «El Once Fantasma» (online y en un dispositivo) con las piezas comunes de ../Pulsador.
import React, { useEffect, useRef, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import { Hero, Cuenta, useRestante, Avatar, Pildoras, PantallaFin, colorDe, AvisoTurno } from '../Pulsador/Vistas.jsx';
import { BloqueConfig } from '../../components/MenuJuego.jsx';
import { AJUSTES, OPCIONES, POSICIONES } from './engine.js';
import './OnceFantasma.css';

const HERO = { emoji: '👻' };
const nombreDe = (v, id) => v.jugadores.find((j) => j.id === id)?.nombre ?? '¿?';
const LINEAS = ['DEL', 'MED', 'DEF', 'POR'];
const CAMISETA = ['#dc2626', '#1d4ed8'];
const apellido = (n) => { const p = n.split(' '); return p.length > 1 && p[p.length - 2].length <= 3 ? p.slice(-2).join(' ') : p[p.length - 1]; };

function Camiseta({ color, oculto, dorsal, id }) {
  const g = `ofx-g-${id}`;
  return (
    <svg className="ofx-camiseta" viewBox="0 0 48 44" aria-hidden="true">
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={oculto ? '#0f172a' : color} stopOpacity={oculto ? 0.35 : 1} />
          <stop offset="1" stopColor={oculto ? '#0f172a' : color} stopOpacity={oculto ? 0.6 : 0.78} />
        </linearGradient>
      </defs>
      <path d="M14 3 L4 9 L1 19 L9 22 L10 41 H38 L39 22 L47 19 L44 9 L34 3 Q24 10 14 3 Z"
        fill={`url(#${g})`} stroke={oculto ? 'rgba(255,255,255,0.85)' : '#ffffff'} strokeWidth="2" strokeDasharray={oculto ? '3.5 3' : 'none'} strokeLinejoin="round" />
      {!oculto && <path d="M18 4.5 Q24 9 30 4.5" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2" />}
      {!oculto && <path d="M9 22 L10 41 M39 22 L38 41" stroke="rgba(0,0,0,0.18)" strokeWidth="3" />}
      <text x="24" y="31" textAnchor="middle" fontSize="15" fontWeight="900" fill="#fff" fontFamily="'Bricolage Grotesque', sans-serif" style={{ paintOrder: 'stroke' }} stroke="rgba(0,0,0,0.25)" strokeWidth="1">{dorsal}</text>
    </svg>
  );
}

/** Líneas del campo (medio campo visto desde la propia portería, abajo). */
function Lineas() {
  return (
    <svg className="ofx-lineas" viewBox="0 0 100 150" preserveAspectRatio="none" aria-hidden="true">
      <g fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="0.6" vectorEffect="non-scaling-stroke">
        <rect x="2" y="2" width="96" height="146" rx="1" />
        <line x1="2" y1="75" x2="98" y2="75" />
        <ellipse cx="50" cy="75" rx="13" ry="9" />
        <rect x="22" y="2" width="56" height="20" />
        <rect x="36" y="2" width="28" height="7" />
        <path d="M40 22 Q50 29 60 22" />
        <rect x="22" y="128" width="56" height="20" />
        <rect x="36" y="141" width="28" height="7" />
        <path d="M40 128 Q50 121 60 128" />
        <path d="M2 5 Q5 5 5 2 M95 2 Q95 5 98 5 M2 145 Q5 145 5 148 M95 148 Q95 145 98 145" />
      </g>
      <g fill="rgba(255,255,255,0.75)"><circle cx="50" cy="75" r="0.9" /><circle cx="50" cy="16" r="0.7" /><circle cx="50" cy="134" r="0.7" /></g>
      <rect x="42" y="148" width="16" height="2" fill="rgba(255,255,255,0.85)" />
    </svg>
  );
}

/** El campo con los once huecos, por líneas (izquierda a derecha, vistos desde su portería), y el entrenador en la banda. */
function Campo({ v, marcado, onElegir }) {
  const color = CAMISETA[v.once.lado] || CAMISETA[0];
  const cazados = v.huecos.filter((h) => h.por || h.nombre).length;
  return (
    <div className="ofx-campo" role="list" aria-label={`Alineación de ${v.once.equipo}`} style={{ '--equipo': color }}>
      <Lineas />
      <span className="ofx-marcador-campo">✅ {cazados}/11</span>
      {LINEAS.map((l) => (
        <div key={l} className={`ofx-linea ${l}`}>
          {v.huecos.map((h, i) => [h, i]).filter(([h]) => h.pos === l).map(([h, i]) => (
            <button key={i} type="button" role="listitem" onClick={() => onElegir?.(i)}
              className={`ofx-hueco${h.nombre ? ' visto' : ''}${h.por ? ' cazado' : ''}${marcado === i ? ' marcado' : ''}`}
              style={h.por ? { '--c': colorDe(h.por) } : undefined}
              aria-label={h.nombre ? `${h.dorsal}, ${h.nombre}` : `Dorsal ${h.dorsal}, ${POSICIONES[h.pos]}, oculto`}>
              <span className="ofx-dorsal-chico">{h.dorsal}</span>
              <Camiseta color={color} oculto={!h.nombre} dorsal={h.dorsal} id={i} />
              <span className="ofx-nombre">{h.nombre ? apellido(h.nombre) : h.iniciales || POSICIONES[h.pos].slice(0, 3)}</span>
              {h.dato && !h.nombre && <span className="ofx-dato">{h.dato}</span>}
              {!h.nombre && <span className="ofx-nivel" aria-hidden="true">{[0, 1, 2].map((k) => <i key={k} className={h.nivel > k ? 'on' : ''} />)}</span>}
              {h.por && <span className="ofx-quien" title={nombreDe(v, h.por)}>{h.rebote ? '🔁' : ''}{nombreDe(v, h.por).slice(0, 1)}</span>}
            </button>
          ))}
        </div>
      ))}
      <div className="ofx-banquillo"><span>🧑‍💼</span><div><small>Entrenador</small><b>{v.once.entrenador}</b></div></div>
    </div>
  );
}

/** El partido como un marcador: competición, resultado y el equipo que hay que adivinar resaltado. */
function Partido({ v }) {
  const [comp, resultado] = v.once.partido.split(' · ');
  const m = /^(.*?) (\d+)-(\d+) (.*)$/.exec(resultado || '');
  const color = CAMISETA[v.once.lado] || CAMISETA[0];
  const equipo = (n) => n.trim() === v.once.equipo;
  return (
    <div className="ofx-partido" style={{ '--equipo': color }}>
      <p className="ofx-competicion">🏆 {comp}</p>
      {m ? (
        <div className="ofx-resultado">
          <span className={equipo(m[1]) ? 'adivinar' : ''}>{m[1]}</span>
          <b>{m[2]}<i>-</i>{m[3]}</b>
          <span className={equipo(m[4]) ? 'adivinar' : ''}>{m[4]}</span>
        </div>
      ) : <p className="ofx-resultado-txt">{resultado}</p>}
      <p className="ofx-objetivo">🎯 Adivina el once de <b>{v.once.equipo}</b></p>
    </div>
  );
}

/** Ficha del hueco elegido: todas sus pistas destapadas. */
function Ficha({ v, i, onCerrar }) {
  const h = v.huecos[i];
  if (!h) return null;
  return (
    <div className="pzp-tarjeta ofx-ficha">
      <button type="button" className="ofx-ficha-cerrar" onClick={onCerrar} aria-label="Cerrar">✕</button>
      <p className="pzp-etiqueta">Dorsal {h.dorsal} · {POSICIONES[h.pos]}</p>
      {h.nombre && <h2 className="ofx-ficha-nombre">{h.nombre}</h2>}
      <ul>
        <li className={h.dato ? '' : 'oculta'}><b>{v.once.tipo === 'club' ? '🌍 País' : '🏟️ Club'}</b>{h.dato || 'Se destapará pronto'}</li>
        <li className={h.pista ? '' : 'oculta'}><b>📜 Trayectoria</b>{h.pista || 'Oculta'}</li>
        <li className={h.iniciales ? '' : 'oculta'}><b>🔤 Iniciales</b>{h.iniciales || 'Ocultas'}</li>
      </ul>
      {h.por && <p className="pzp-nota">Lo descubrió {nombreDe(v, h.por)}{h.rebote ? ' en el rebote' : ''} (+{h.puntos})</p>}
    </div>
  );
}

function Buscador({ v, enviar, placeholder, jugadorLocal }) {
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
        placeholder={placeholder} autoComplete="off" autoCapitalize="words" enterKeyHint="send" />
      <button type="submit" className="pzp-boton" disabled={!texto.trim()}><Icon name="check" size={20} /> Probar</button>
    </form>
  );
}

function Resultado({ v, enviar, puedeSeguir }) {
  const cazados = v.huecos.filter((h) => h.por).length;
  const titulo = { pleno: `¡Once completo de ${nombreDe(v, v.turno)}! (+${AJUSTES.bonusPleno})`, completo: '¡Once completo!' }[v.motivo] || `${cazados}/11 descubiertos`;
  return (
    <div className="pzp-tarjeta">
      <p className="pzp-etiqueta">{titulo}</p>
      <div className="ofx-sumas">
        {v.jugadores.filter((j) => v.sumas[j.id]).sort((a, b) => v.sumas[b.id] - v.sumas[a.id]).map((j) => (
          <span key={j.id}><Avatar id={j.id} nombre={j.nombre} /> {j.nombre} <b>+{v.sumas[j.id]}</b></span>
        ))}
        {!Object.keys(v.sumas).length && <span>Nadie ha sumado en este once.</span>}
      </div>
      <p className="pzp-nota">Toca una camiseta para ver quién era y sus pistas.</p>
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

/**
 * Partida (todo salvo el final). En local, `jugadorLocal` es a quién se apunta el acierto en el rebote
 * (en el turno, siempre al del turno) y `onJugador` lo cambia.
 */
export function Partida({ v, enviar, offset = 0, onSalir, local = false, admin = true, jugadorLocal, onJugador }) {
  const [marcado, setMarcado] = useState(null);
  const restante = useRestante(v.hasta, offset);
  const proxima = useRestante(v.fase === 'turno' ? v.proximaPista : null, offset);
  useEffect(() => { setMarcado(null); }, [v.ronda]);
  const cazados = v.huecos.filter((h) => h.por).length;
  const quien = nombreDe(v, v.turno);
  const esMio = v.yo && v.turno === v.yo.id;
  const puedo = local || v.yo?.puedo;
  const rivales = v.jugadores.filter((j) => !j.fuera && j.id !== v.turno);
  return (
    <>
      <Hero v={v} juego={HERO} onSalir={onSalir} chip={`👻 Once ${v.ronda}/${v.rondas}`} etiqueta={v.fase === 'resultado' ? 'Resultado del once' : v.fase === 'rebote' ? '🔁 Rebote' : `Turno de ${quien}`} titulo={`Once de ${v.once.equipo}`} turno={v.fase === 'turno' ? v.turno : undefined} />
      <Partido v={v} />
      {!local && <AvisoTurno clave={v.fase === 'turno' && esMio ? `t${v.ronda}` : v.fase === 'rebote' && v.yo?.puedo ? `r${v.ronda}` : null}
        texto={v.fase === 'rebote' ? '¡Rebote!' : '¡Te toca!'} sub={v.fase === 'rebote' ? `A ${quien} le faltan ${11 - cazados}: adivínalos tú.` : `Reconstruye el once de ${v.once.equipo}.`} emoji={v.fase === 'rebote' ? '🔁' : '👻'} id={v.yo?.id} />}
      {v.fase === 'turno' && <p className="ofx-estado"><Avatar id={v.turno} nombre={quien} /> {local || !esMio ? `Turno de ${quien}: solo adivina él.` : 'Tu turno: solo adivinas tú.'} Si deja huecos, habrá rebote.</p>}
      {v.fase === 'rebote' && <p className="ofx-estado rebote">🔁 <span><b>¡Rebote!</b> A {quien} le faltan {11 - cazados}. {local ? 'Los demás pueden decirlos.' : esMio ? 'Ahora pueden adivinarlos los demás.' : 'Adivínalos antes que nadie (valen menos).'}</span></p>}
      {(v.fase === 'turno' || v.fase === 'rebote') && v.hasta && <Cuenta ms={restante} total={v.segundos * 1000} />}
      <Campo v={v} marcado={marcado} onElegir={(i) => setMarcado((m) => (m === i ? null : i))} />
      {marcado !== null ? <Ficha v={v} i={marcado} onCerrar={() => setMarcado(null)} /> : (
        <p className="ofx-ayuda">{v.fase === 'turno' ? `Toca una camiseta para ver sus pistas.${v.proximaPista ? ` Otra pista en ${Math.ceil(proxima / 1000)} s.` : ''}` : 'Toca una camiseta para ver sus pistas.'}</p>
      )}
      {(v.fase === 'turno' || v.fase === 'rebote') && (
        <>
          {local && v.fase === 'rebote' && (
            <div className="ofx-quien-lo-dice">
              <p className="pzp-etiqueta">¿Quién lo ha dicho?</p>
              <div className="ofx-quien-lista">
                {rivales.map((j) => (
                  <button key={j.id} type="button" className={jugadorLocal === j.id ? 'activo' : ''} onClick={() => onJugador(j.id)} style={{ '--c': colorDe(j.id) }}>{j.nombre}</button>
                ))}
              </div>
            </div>
          )}
          {puedo ? (
            <Buscador v={v} enviar={enviar} jugadorLocal={v.fase === 'turno' ? v.turno : jugadorLocal}
              placeholder={v.fase === 'turno' ? 'Escribe un futbolista…' : 'Un futbolista que falte…'} />
          ) : <p className="ofx-ayuda">{v.fase === 'turno' ? `Mira cómo lo hace ${quien}: si deja huecos, te tocará rebote.` : v.yo && v.jugadores.find((j) => j.id === v.yo.id)?.pasado ? 'Has pasado: esperando a los demás…' : ''}</p>}
          {v.registro.length > 0 && (
            <ul className="ofx-registro">
              {v.registro.slice(0, 3).map((r) => (
                <li key={`${r.hueco}`}>{r.rebote ? '🔁 ' : ''}<b style={{ color: colorDe(r.id) }}>{nombreDe(v, r.id)}</b> descubre a {v.huecos[r.hueco].nombre} (+{r.puntos}){r.pista !== null ? ` · pista del ${v.huecos[r.pista].dorsal}` : ''}</li>
              ))}
            </ul>
          )}
          <div className="pzp-barra estatica ofx-controles">
            {v.fase === 'turno' && (local || esMio) && (
              <>
                <button type="button" className="pzp-enlace" onClick={() => enviar('pista')}>💡 Otra pista</button>
                <button type="button" className="pzp-enlace" onClick={() => enviar('plantarse')}>✋ Me planto</button>
              </>
            )}
            {v.fase === 'turno' && !local && !esMio && admin && <button type="button" className="pzp-enlace" onClick={() => enviar('plantarse')}>⏭️ Pasar al rebote</button>}
            {v.fase === 'rebote' && !local && v.yo?.puedo && <button type="button" className="pzp-enlace" onClick={() => enviar('pasar')}>🤷 No sé más</button>}
            {v.fase === 'rebote' && (local || admin) && <button type="button" className="pzp-enlace" onClick={() => enviar('cerrarRebote')}>🏁 {local ? 'Nadie sabe más' : 'Cerrar el rebote'}</button>}
          </div>
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
      <BloqueConfig titulo="Onces por jugador">
        <Pildoras opciones={OPCIONES.onces.map((n) => [n, n === 1 ? '1 once' : `${n} onces`])} valor={config.onces} onCambiar={onCambiar && ((onces) => onCambiar({ onces }))} />
      </BloqueConfig>
      <BloqueConfig titulo="Tiempo por turno">
        <Pildoras opciones={OPCIONES.segundos.map((n) => [n, `${n / 60} min`])} valor={config.segundos} onCambiar={onCambiar && ((segundos) => onCambiar({ segundos }))} />
      </BloqueConfig>
    </>
  );
}
