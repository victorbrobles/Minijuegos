// client/src/games/FootballSplit/Vistas.jsx
// Pantallas de «FrankensFootball» (online y un solo dispositivo) con el estilo de los juegos renovados.
import { useRegistrarPartida, resultadoDesdeFin } from '../../lib/registros.js';
import React, { useEffect, useRef, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import { AJUSTES, PARTES, OPCIONES_RONDAS } from './engine.js';
import './FootballSplit.css';

export const COLORES = ['#6366f1', '#dc2626', '#16a34a', '#f59e0b', '#9333ea', '#0d9488', '#ea580c', '#db2777', '#2563eb', '#65a30d', '#0891b2', '#78716c'];
export const colorDe = (id) => COLORES[((Number(id) || 1) - 1) % COLORES.length];
const inicial = (n) => (n || '?').trim().charAt(0).toUpperCase();

export function Avatar({ id, nombre, grande = false }) {
  return <span className={`ffp-avatar${grande ? ' grande' : ''}`} style={{ '--c': colorDe(id) }}>{inicial(nombre)}</span>;
}

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
    <header className={`ffp-hero ${clase}`}>
      <span className="ffp-cosido" aria-hidden="true" />
      <div className="ffp-hero-top">
        <button type="button" className="ffp-salir" onClick={onSalir}><Icon name="door" size={15} /> Salir</button>
        <div className="ffp-chips"><span className="ffp-chip">🧟 Futbolista {Math.min(v.ronda, v.rondas)}/{v.rondas}</span></div>
      </div>
      <p className="ffp-hero-etiqueta">{etiqueta}</p>
      <h1 className="ffp-hero-titulo">{titulo}</h1>
      <div className="ffp-marcador">
        {[...v.jugadores].sort((a, b) => b.puntos - a.puntos).map((j) => (
          <span key={j.id} className={`ffp-marca${v.turno === j.id && v.fase === 'jugando' ? ' turno' : ''}${j.id === v.yo?.id ? ' yo' : ''}${j.fuera ? ' fuera' : ''}`}>
            <Avatar id={j.id} nombre={j.nombre} />
            <span className="ffp-marca-nombre">{j.nombre}</span>
            <span className="ffp-marca-datos">{j.puntos}</span>
          </span>
        ))}
      </div>
    </header>
  );
}

/** Un trozo dibujado (sin fotos): silueta con los colores del club, bandera, edad y puesto. */
function Trozo({ parte, d }) {
  const [c1, c2] = d?.colores || ['#64748b', '#ffffff'];
  const borde = '#0f172a';
  const piel = '#334155';
  return (
    <svg className="ffp-dibujo" viewBox="0 0 300 100" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      {parte === 'top' && (
        <>
          <rect x="132" y="78" width="36" height="22" fill={piel} />
          <ellipse cx="150" cy="52" rx="38" ry="44" fill={piel} />
          <path d="M112 40 Q150 2 188 40 L188 33 Q150 -6 112 33 Z" fill="#111827" />
          <rect x="111" y="36" width="78" height="11" rx="5" fill={c1} stroke={borde} strokeWidth="2" />
          <rect x="111" y="40" width="78" height="3" fill={c2} />
          <ellipse cx="111" cy="56" rx="6" ry="10" fill={piel} />
          <ellipse cx="189" cy="56" rx="6" ry="10" fill={piel} />
        </>
      )}
      {parte === 'middle' && (
        <>
          <path d="M80 0 L132 0 Q150 16 168 0 L220 0 L262 46 L234 66 L214 44 L214 100 L86 100 L86 44 L66 66 L38 46 Z" fill={c1} stroke={borde} strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M132 0 Q150 16 168 0" fill="none" stroke={c2} strokeWidth="7" />
          <path d="M38 46 L66 66 L72 59 L45 40 Z M262 46 L234 66 L228 59 L255 40 Z" fill={c2} />
          <rect x="136" y="0" width="28" height="10" fill={piel} />
          <rect x="146" y="30" width="8" height="70" fill={c2} opacity="0.35" />
        </>
      )}
      {parte === 'bottom' && (
        <>
          <path d="M90 0 L210 0 L216 38 L156 38 L150 26 L144 38 L84 38 Z" fill={c2} stroke={borde} strokeWidth="2.5" strokeLinejoin="round" />
          <rect x="104" y="38" width="30" height="20" fill={piel} />
          <rect x="166" y="38" width="30" height="20" fill={piel} />
          <rect x="102" y="56" width="34" height="30" rx="4" fill={c1} stroke={borde} strokeWidth="2" />
          <rect x="164" y="56" width="34" height="30" rx="4" fill={c1} stroke={borde} strokeWidth="2" />
          <rect x="102" y="62" width="34" height="5" fill={c2} />
          <rect x="164" y="62" width="34" height="5" fill={c2} />
          <path d="M98 86 L140 86 L146 98 L92 98 Z M160 86 L202 86 L208 98 L154 98 Z" fill="#111827" />
        </>
      )}
    </svg>
  );
}

/** El futbolista dibujado con tres trozos de tres futbolistas distintos (cabeza, camiseta y piernas). */
export function Cara({ v, seleccion, onElegir }) {
  return (
    <div className="ffp-cara">
      {PARTES.map((pt) => {
        const x = v.partes[pt.id];
        const puede = onElegir && !x.resuelta && v.fase === 'jugando';
        const Tag = puede ? 'button' : 'div';
        const d = x.dibujo;
        return (
          <Tag key={pt.id} type={puede ? 'button' : undefined} onClick={puede ? () => onElegir(pt.id) : undefined}
            className={`ffp-franja${x.resuelta ? ' resuelta' : ''}${seleccion === pt.id ? ' sel' : ''}${puede ? ' elegible' : ''}`}>
            <Trozo parte={pt.id} d={d} />
            <span className="ffp-franja-tag">{pt.nombre}</span>
            {d && <span className="ffp-franja-datos"><b>{d.bandera}</b> {d.edad} años · {d.puesto}</span>}
            {x.futbolista && (
              <span className={`ffp-franja-nombre${x.resuelta ? '' : ' nadie'}`}>
                {x.resuelta ? '✓ ' : ''}{x.futbolista}
              </span>
            )}
          </Tag>
        );
      })}
    </div>
  );
}

function Pistas({ v }) {
  const con = PARTES.filter((pt) => v.partes[pt.id].pista && !v.partes[pt.id].resuelta && v.fase === 'jugando');
  if (!con.length) return null;
  return (
    <div className="ffp-pistas">
      {con.map((pt) => <p key={pt.id}><b>💡 {pt.nombre}:</b> {v.partes[pt.id].pista}</p>)}
    </div>
  );
}

function Ultimo({ v }) {
  const u = v.ultimo;
  if (!u) return null;
  const quien = v.jugadores.find((j) => j.id === u.jugadorId)?.nombre;
  const parte = PARTES.find((x) => x.id === u.parte)?.nombre?.toLowerCase();
  let t;
  if (u.ok) t = <>✅ <strong>{quien}</strong> acierta el {parte}: <strong>{u.futbolista}</strong> (+{u.puntos})</>;
  else if (u.pasa) t = <>⏭️ {quien} ha pasado</>;
  else if (u.tiempo) t = <>⏰ A {quien} se le acabó el tiempo</>;
  else t = <>❌ {quien} falla con «{u.texto}»</>;
  return <div className={`ffp-ultimo ${u.ok ? 'bien' : 'mal'}`}>{t}</div>;
}

function FormRespuesta({ v, parte, enviar, onCambiarParte }) {
  const [texto, setTexto] = useState('');
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus(); setTexto(''); }, [parte]);
  const x = v.partes[parte];
  const nombre = PARTES.find((p) => p.id === parte)?.nombre;
  return (
    <form className="ffp-tarjeta ffp-respuesta" onSubmit={(e) => { e.preventDefault(); if (texto.trim()) { enviar('responder', { parte, respuesta: texto }); setTexto(''); } }}>
      <p className="ffp-etiqueta">{nombre === 'Piernas' ? '¿De quién son las piernas?' : `¿De quién es la ${nombre.toLowerCase()}?`}</p>
      <input ref={ref} className="ffp-input" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Nombre del futbolista"
        autoComplete="off" autoCorrect="off" spellCheck={false} maxLength={60} />
      <div className="ffp-dos">
        <button type="button" className="ffp-boton secundario" disabled={Boolean(x?.pista)} onClick={() => enviar('pista', { parte })}>
          💡 {x?.pista ? 'Pista vista' : `Pista (vale ${AJUSTES.puntosPista})`}
        </button>
        <button type="submit" className="ffp-boton" disabled={!texto.trim()}><Icon name="check" size={20} /> Responder</button>
      </div>
      <button type="button" className="ffp-enlace oscuro" onClick={() => onCambiarParte(null)}>Elegir otro trozo</button>
    </form>
  );
}

function Reloj({ v, offset }) {
  const s = useRestante(v.hasta, offset);
  const pct = Math.max(0, Math.min(100, (s / AJUSTES.segTurno) * 100));
  return (
    <div className={`ffp-reloj${s <= 10 ? ' critico' : ''}`}>
      <div className="ffp-reloj-barra"><span style={{ width: `${pct}%` }} /></div>
      <strong>{Math.ceil(s)}s</strong>
    </div>
  );
}

/** Pantalla de «turno de…» antes de que empiece a correr el reloj del jugador. */
function TurnoDe({ v, quien, local, puedo, onListo }) {
  return (
    <>
    <div className="ffp-tarjeta ffp-gate">
      <Avatar id={quien?.id} nombre={quien?.nombre} grande />
      <p className="ffp-etiqueta centrada">{local ? 'Pasa el móvil a' : puedo ? 'Te toca' : 'Turno de'}</p>
      <h2>{quien?.nombre}</h2>
      <p className="ffp-texto">{puedo ? `Tendrás ${AJUSTES.segTurno} segundos: toca un trozo del futbolista y di de quién es.` : `Esperando a que ${quien?.nombre} esté listo…`}</p>
    </div>
    {puedo && <div className="ffp-barra estatica"><button type="button" className="ffp-boton grande" onClick={onListo}><Icon name="check" size={20} /> ¡Listo!</button></div>}
    </>
  );
}

/** Ronda en juego. `miTurno` dice si quien mira puede responder (en un dispositivo, siempre). */
export function PantallaJuego({ v, enviar, onSalir, offset = 0, miTurno, local = false, admin }) {
  const [parte, setParte] = useState(null);
  useEffect(() => { setParte(null); }, [v.turno, v.ronda, v.listo]);
  useEffect(() => { if (parte && v.partes[parte]?.resuelta) setParte(null); }, [v.partes, parte]);
  const quien = v.jugadores.find((j) => j.id === v.turno);
  const resueltas = PARTES.filter((p) => v.partes[p.id].resuelta).length;
  const titulo = `¿De quién es cada trozo? (${resueltas}/3)`;
  const etiqueta = local || !miTurno ? `Turno de ${quien?.nombre}` : 'Tu turno';

  if (!v.listo) {
    return (
      <>
        <Hero v={v} onSalir={onSalir} etiqueta={etiqueta} titulo={titulo} clase={miTurno && !local ? 'mio' : ''} />
        <Ultimo v={v} />
        <TurnoDe v={v} quien={quien} local={local} puedo={miTurno} onListo={() => enviar('listo')} />
        {admin?.esAdmin && admin.atascado && (
          <div className="ffp-barra estatica">
            <button type="button" className="ffp-enlace" onClick={admin.onForzar}><Icon name="forward" size={15} /> ¿No responde? Saltar su turno</button>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <Hero v={v} onSalir={onSalir} etiqueta={etiqueta} titulo={titulo} clase={miTurno && !local ? 'mio' : ''} />
      <Ultimo v={v} />
      <Reloj v={v} offset={offset} />
      {miTurno && !parte && <p className="ffp-indicacion">👆 Toca un trozo del futbolista para responder</p>}
      <Cara v={v} seleccion={parte} onElegir={miTurno ? setParte : null} />
      <Pistas v={v} />
      {miTurno && parte && <FormRespuesta v={v} parte={parte} enviar={enviar} onCambiarParte={setParte} />}
      {!miTurno && <p className="ffp-esperando">⏳ {quien?.nombre} está intentando adivinar…</p>}
      {miTurno && (
        <div className="ffp-barra estatica">
          <button type="button" className="ffp-boton secundario" onClick={() => enviar('pasar')}>⏭️ Pasar turno</button>
        </div>
      )}
      {admin?.esAdmin && (
        <div className="ffp-barra estatica">
          <div className="ffp-dos">
            {admin.atascado && <button type="button" className="ffp-enlace" onClick={admin.onForzar}><Icon name="forward" size={15} /> Saltar turno</button>}
            <button type="button" className="ffp-enlace" onClick={() => enviar('terminar')}><Icon name="flagFinish" size={15} /> Terminar partida</button>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Fin de una cara en dos pasos: primero las soluciones y, al pulsar «Ver puntuaciones», la clasificación con el
 * botón de la siguiente ronda (que llega como `children`).
 */
export function PantallaResultado({ v, onSalir, children }) {
  const [paso, setPaso] = useState('soluciones');
  useEffect(() => { setPaso('soluciones'); }, [v.ronda]);
  if (paso === 'soluciones') {
    return (
      <>
        <Hero v={v} onSalir={onSalir} etiqueta={v.motivo === 'completa' ? '¡Futbolista completo!' : 'Nadie ha completado el futbolista'} titulo="Las soluciones" clase="fin" />
        <Cara v={v} />
        <div className="ffp-tarjeta">
          <ul className="ffp-solucion">
            {PARTES.map((pt) => {
              const x = v.partes[pt.id];
              const j = v.jugadores.find((q) => q.id === x.jugadorId);
              return (
                <li key={pt.id} className={x.resuelta ? 'bien' : ''}>
                  <span className="ffp-sol-parte">{pt.nombre}</span>
                  <strong>{x.futbolista}</strong>
                  <small>{x.resuelta ? `Lo acertó ${j?.nombre ?? '—'} (+${x.puntos})` : 'Nadie lo acertó'}</small>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="ffp-barra estatica">
          <button type="button" className="ffp-boton grande" onClick={() => setPaso('puntos')}><Icon name="chart" size={20} /> Ver puntuaciones</button>
        </div>
      </>
    );
  }
  const orden = [...v.jugadores].sort((a, b) => b.puntos - a.puntos);
  const max = orden[0]?.puntos ?? 0;
  const ganadas = Object.fromEntries(PARTES.map((pt) => v.partes[pt.id]).filter((x) => x.resuelta).map((x) => [x.jugadorId, 0]));
  PARTES.forEach((pt) => { const x = v.partes[pt.id]; if (x.resuelta) ganadas[x.jugadorId] += x.puntos; });
  return (
    <>
      <Hero v={v} onSalir={onSalir} etiqueta={`Después del futbolista ${v.ronda} de ${v.rondas}`} titulo="Puntuaciones" clase="fin" />
      <div className="ffp-tarjeta">
        <ol className="ffp-ranking">
          {orden.map((j, i) => (
            <li key={j.id} className={max > 0 && j.puntos === max ? 'lider' : ''}>
              <span className="ffp-pos">{j.fuera ? '🚪' : i + 1}</span>
              <Avatar id={j.id} nombre={j.nombre} />
              <span className="ffp-ranking-nombre">{j.nombre}{j.id === v.yo?.id ? ' (tú)' : ''}<small>{ganadas[j.id] ? `+${ganadas[j.id]} en este` : 'sin puntos en este'}</small></span>
              <strong>{j.puntos}</strong>
            </li>
          ))}
        </ol>
      </div>
      {children}
    </>
  );
}

export function PantallaFin({ v, onSalir, children }) {
  useRegistrarPartida('footballsplit', resultadoDesdeFin(v));
  const f = v.fin;
  const nombres = f.ganadores.map((id) => v.jugadores.find((j) => j.id === id)?.nombre).filter(Boolean);
  return (
    <>
      <Hero v={v} onSalir={onSalir} etiqueta="Fin de la partida" titulo={nombres.length ? `¡Gana ${nombres.join(' y ')}!` : 'Nadie ha puntuado'} clase="fin" />
      <div className="ffp-tarjeta">
        <p className="ffp-etiqueta">Clasificación</p>
        <ol className="ffp-ranking">
          {f.tabla.map((j) => (
            <li key={j.id} className={j.puesto === 1 && j.puntos > 0 ? 'lider' : ''}>
              <span className="ffp-pos">{j.fuera ? '🚪' : j.puesto}</span>
              <Avatar id={j.id} nombre={j.nombre} />
              <span className="ffp-ranking-nombre">{j.nombre}{j.id === v.yo?.id ? ' (tú)' : ''}<small>{j.aciertos} {j.aciertos === 1 ? 'trozo acertado' : 'trozos acertados'}</small></span>
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
      <div className="rg-modal ffp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ffp-modal-icono">🚪</div>
        <h3>{titulo}</h3>
        <p className="hint">{texto}</p>
        <div className="ffp-dos">
          <button type="button" className="ffp-boton secundario" onClick={onSeguir}>Seguir</button>
          <button type="button" className="ffp-boton peligro" onClick={onSalir}>Salir</button>
        </div>
      </div>
    </div>
  );
}

export function SelectorRondas({ valor, onCambiar, numJugadores }) {
  return (
    <div className="ffp-pildoras">
      {OPCIONES_RONDAS.map((n) => (
        <button key={n} type="button" className={`ffp-pildora${valor === n ? ' activo' : ''}`} disabled={!onCambiar} onClick={() => onCambiar?.(n)}>×{n}{numJugadores ? ` · ${n * numJugadores} futbolistas` : ' por jugador'}</button>
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
            <li>Cada ronda sale un futbolista <strong>dibujado</strong> con la <strong>cabeza</strong>, la <strong>camiseta</strong> y las <strong>piernas</strong> de tres futbolistas distintos de la temporada 2025/26.</li><li>Cada trozo lleva los colores de la equipación de su club (sin escudo), su bandera, su edad y su puesto.</li>
            <li>Por turnos: al pulsar «¡Listo!» tienes {AJUSTES.segTurno} s. Toca un trozo y escribe de quién es. Si aciertas sumas {AJUSTES.puntos} puntos y sigues; si fallas o pasas, le toca al siguiente.</li>
            <li>Puedes pedir una pista de un trozo (te dice en qué club juega): acertarlo pasa a valer {AJUSTES.puntosPista} puntos.</li>
            <li>La ronda acaba cuando se descubren los tres trozos o cuando todos habéis tenido vuestro turno.</li>
            <li>Vale el apellido (o el nombre por el que se le conoce), sin tildes y con pequeñas erratas.</li>
          </ul>
        </div>
        <button type="button" className="big full qq-btn-principal" onClick={onCerrar}>¡Entendido!</button>
      </div>
    </div>
  );
}
