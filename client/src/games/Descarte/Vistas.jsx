// client/src/games/Descarte/Vistas.jsx
// Pantallas de «¡Descarta y Elimina!» (online y un solo dispositivo) con el estilo de los juegos renovados.
// Reciben `v` (vista que genera engine.vistaDe) y `enviar(tipo, datos)`.
import React, { useEffect, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import { LETRAS, PUNTOS, AJUSTES } from './engine.js';
import './Descarte.css';

export const COLORES = ['#e11d48', '#2563eb', '#16a34a', '#f59e0b', '#9333ea', '#0d9488', '#ea580c', '#db2777', '#4f46e5', '#65a30d', '#0891b2', '#78716c'];
export const colorDe = (id) => COLORES[((Number(id) || 1) - 1) % COLORES.length];
const inicial = (n) => (n || '?').trim().charAt(0).toUpperCase();
const ptos = (n) => `${n} ${n === 1 ? 'pto' : 'ptos'}`;

export function Avatar({ id, nombre, grande = false }) {
  return <span className={`dsp-avatar${grande ? ' grande' : ''}`} style={{ '--c': colorDe(id) }}>{inicial(nombre)}</span>;
}

/** Segundos que quedan hasta `limite` (con el desfase del reloj del servidor). */
function useCuenta(limite, offset = 0) {
  const calc = () => (limite ? Math.max(0, Math.ceil((limite - (Date.now() + offset)) / 1000)) : 0);
  const [s, setS] = useState(calc);
  useEffect(() => {
    setS(calc());
    if (!limite) return undefined;
    const i = setInterval(() => setS(calc()), 250);
    return () => clearInterval(i);
  }, [limite, offset]); // eslint-disable-line react-hooks/exhaustive-deps
  return s;
}

function Reloj({ limite, offset, total }) {
  const s = useCuenta(limite, offset);
  return (
    <div className={`dsp-reloj${s <= 5 ? ' urgente' : ''}`}>
      <div className="dsp-reloj-barra"><span style={{ width: `${Math.min(100, (s / total) * 100)}%` }} /></div>
      <strong>{s}s</strong>
    </div>
  );
}

// ---------------------------------------------------------------- Cabecera
function Hero({ v, onSalir, etiqueta, titulo, clase = '' }) {
  const activo = v.fase === 'retar' ? v.retadorId : v.rivalId;
  const vivos = v.jugadores.filter((j) => !j.fuera).length;
  return (
    <header className={`dsp-hero ${clase}`}>
      <span className="dsp-letras-fondo" aria-hidden="true">A B Z</span>
      <div className="dsp-hero-top">
        <button type="button" className="dsp-salir" onClick={onSalir}><Icon name="door" size={15} /> Salir</button>
        <div className="dsp-chips">
          <span className="dsp-chip">Tablero {v.tablero}/{v.tableros}</span>
          {v.fase !== 'fin' && <span className="dsp-chip" title="Letras que quedan en el tablero">🔤 {v.letras.length}</span>}
          {v.fallos > 0 && v.fase !== 'fin' && <span className="dsp-chip alerta" title="Fallos seguidos: si fallan todos, se acaba el tablero">❌ {v.fallos}/{vivos}</span>}
        </div>
      </div>
      <p className="dsp-hero-etiqueta">{etiqueta}</p>
      <h1 className="dsp-hero-titulo">{titulo}</h1>
      <div className="dsp-marcador">
        {[...v.jugadores].sort((a, b) => b.puntos - a.puntos).map((j) => (
          <span key={j.id} className={`dsp-marca${activo === j.id && v.fase !== 'fin' && v.fase !== 'tablero' ? ' turno' : ''}${j.id === v.yo?.id ? ' yo' : ''}${j.fuera ? ' fuera' : ''}`}>
            <Avatar id={j.id} nombre={j.nombre} />
            <span className="dsp-marca-nombre">{j.nombre}</span>
            <span className="dsp-marca-datos">⭐{j.puntos}</span>
            {j.jugado && v.fase !== 'fin' && <b title="Ya ha jugado en esta vuelta">✓</b>}
          </span>
        ))}
      </div>
    </header>
  );
}

// ---------------------------------------------------------------- Tablero de letras
export function Tablero({ v, seleccion = null, onElegir = null, resaltar = null }) {
  return (
    <div className="dsp-tarjeta">
      <p className="dsp-etiqueta">Letras del tablero · <span className="dsp-ley p1">1</span><span className="dsp-ley p2">2</span><span className="dsp-ley p3">3</span> ptos</p>
      <div className="dsp-letras">
        {LETRAS.map(({ l, pts }) => {
          const libre = v.letras.includes(l);
          const cls = `dsp-letra p${pts}${libre ? '' : ' fuera'}${seleccion === l || resaltar === l ? ' sel' : ''}`;
          if (onElegir && libre) {
            return <button key={l} type="button" className={cls} onClick={() => onElegir(seleccion === l ? null : l)}><b>{l}</b><small>+{pts}</small></button>;
          }
          return <span key={l} className={cls}><b>{l}</b><small>+{pts}</small></span>;
        })}
      </div>
    </div>
  );
}

function Ultimo({ v }) {
  const u = v.ultimo;
  if (!u) return null;
  const quien = v.jugadores.find((j) => j.id === u.jugadorId);
  return (
    <div className={`dsp-ultimo ${u.ok ? 'bien' : 'mal'}`}>
      {u.ok
        ? <>✅ <strong>{quien?.nombre}</strong> acertó: fuera la <strong>{u.letra}</strong> (+{u.pts})</>
        : u.pasa ? <>⏭️ <strong>{quien?.nombre}</strong> pasó turno en «{u.categoria}»</>
          : <>❌ <strong>{quien?.nombre}</strong> falló en «{u.categoria}»{u.motivo ? ` (${u.motivo})` : ''}</>}
    </div>
  );
}

// ---------------------------------------------------------------- Fases de juego
/** Pantalla de «turno de…»: se ve antes de retar y antes de responder. */
function Turno({ v, jugadorId, etiqueta, texto, boton = '¡Listo!', onListo, local }) {
  const j = v.jugadores.find((x) => x.id === jugadorId);
  return (
    <div className="dsp-tarjeta dsp-gate">
      <Avatar id={jugadorId} nombre={j?.nombre} grande />
      <p className="dsp-etiqueta centrada">{etiqueta}</p>
      <h2>Turno de {j?.nombre}</h2>
      <p className="dsp-texto">{texto}</p>
      {local && <p className="dsp-pista">📱 Pasad el móvil a {j?.nombre}.</p>}
      <button type="button" className="dsp-boton grande" style={{ marginTop: '0.8rem' }} onClick={onListo}>
        <Icon name="check" size={20} /> {boton}
      </button>
    </div>
  );
}

function Esperando({ emoji, children }) {
  return (
    <div className="dsp-tarjeta dsp-centro">
      <span className="dsp-carga" aria-hidden="true">{emoji}</span>
      <p className="dsp-texto">{children}</p>
    </div>
  );
}


function Retar({ v, enviar }) {
  const [rival, setRival] = useState(null);
  const [cat, setCat] = useState(null);
  const nombreRival = v.jugadores.find((j) => j.id === rival)?.nombre;
  return (
    <>
      <div className="dsp-tarjeta">
        <p className="dsp-etiqueta">1 · ¿A quién retas?</p>
        <div className="dsp-rivales">
          {v.elegibles.map((id) => {
            const j = v.jugadores.find((x) => x.id === id);
            return (
              <button key={id} type="button" className={`dsp-rival${rival === id ? ' sel' : ''}`} style={{ '--c': colorDe(id) }} onClick={() => setRival(id)}>
                <Avatar id={id} nombre={j?.nombre} grande />
                <strong>{j?.nombre}</strong>
                <small>⭐ {ptos(j?.puntos ?? 0)}</small>
                {rival === id && <i className="dsp-check">✓</i>}
              </button>
            );
          })}
        </div>
        <p className="dsp-pista izquierda">Solo puedes retar a quien aún no haya jugado en esta vuelta.</p>
      </div>
      <div className="dsp-tarjeta">
        <p className="dsp-etiqueta">2 · Elige su categoría</p>
        <div className="dsp-categorias">
          {v.categorias.map((c, k) => (
            <button key={c} type="button" className={`dsp-categoria c${k}${cat === c ? ' sel' : ''}`} onClick={() => setCat(c)}>
              <span className="dsp-categoria-num">{k + 1}</span>
              <span className="dsp-categoria-txt">{c}</span>
              {cat === c && <i className="dsp-check">✓</i>}
            </button>
          ))}
        </div>
      </div>
      <div className="dsp-barra estatica">
        <button type="button" className="dsp-boton grande" disabled={rival == null || !cat} onClick={() => enviar('retar', { rivalId: rival, categoria: cat })}>
          🎯 {rival == null ? 'Elige rival y categoría' : !cat ? 'Ahora elige la categoría' : `Retar a ${nombreRival}`}
        </button>
      </div>
    </>
  );
}

function Categoria({ v, offset, mia = true }) {
  const rival = v.jugadores.find((j) => j.id === v.rivalId);
  return (
    <div className="dsp-tarjeta dsp-cat-activa">
      <p className="dsp-etiqueta centrada">{mia ? 'Tu categoría' : `Categoría de ${rival?.nombre}`}</p>
      <h2>{v.categoria}</h2>
      {v.limite && <Reloj limite={v.limite} offset={offset} total={AJUSTES.segundosRespuesta} />}
    </div>
  );
}

function Responder({ v, enviar, local, offset }) {
  const [letra, setLetra] = useState(null);
  const yo = v.yo?.id;
  const rival = v.jugadores.find((j) => j.id === v.rivalId);
  const miReto = local || yo === v.rivalId;
  if (!miReto) {
    return (
      <>
        <Categoria v={v} offset={offset} mia={false} />
        <Esperando emoji="🤔"><strong>{rival?.nombre}</strong> está pensando una palabra…</Esperando>
        <Tablero v={v} />
      </>
    );
  }
  return (
    <>
      <Categoria v={v} offset={offset} mia={!local} />
      <Tablero v={v} seleccion={letra} onElegir={setLetra} />
      <div className="dsp-barra">
        <p className="dsp-esperando">🗣️ {local ? `${rival?.nombre}, di` : 'Di'} en voz alta una palabra de la categoría y {local ? 'tocad' : 'toca'} su letra.</p>
        {local ? (
          <>
            <div className="dsp-dos">
              <button type="button" className="dsp-boton exito" disabled={!letra} onClick={() => enviar('marcar', { letra })}>
                ✅ {letra ? `Acierto (${letra} +${PUNTOS[letra]})` : 'Acierto'}
              </button>
              <button type="button" className="dsp-boton peligro" onClick={() => enviar('marcar', { letra: null })}>❌ Fallo</button>
            </div>
            <button type="button" className="dsp-boton secundario" onClick={() => enviar('marcar', { pasa: true })}>⏭️ Pasar turno</button>
          </>
        ) : (
          <>
            <button type="button" className="dsp-boton grande" disabled={!letra} onClick={() => enviar('letra', { letra })}>
              {letra ? `🗣️ He dicho una palabra por la ${letra}` : 'Toca la letra de tu palabra'}
            </button>
            <button type="button" className="dsp-boton secundario" onClick={() => enviar('pasar')}>⏭️ Pasar turno</button>
          </>
        )}
      </div>
    </>
  );
}

function Validar({ v, enviar, juezId }) {
  const yo = v.yo?.id;
  const rival = v.jugadores.find((j) => j.id === v.rivalId);
  const juez = v.jugadores.find((j) => j.id === juezId);
  const tarjeta = (
    <div className="dsp-tarjeta dsp-cat-activa">
      <p className="dsp-etiqueta centrada">{rival?.nombre} · «{v.categoria}»</p>
      <div className={`dsp-letra-grande p${PUNTOS[v.letra]}`}>{v.letra}</div>
      <p className="dsp-pista">Ha dicho una palabra por la <strong>{v.letra}</strong> · +{PUNTOS[v.letra]} si vale</p>
    </div>
  );
  if (yo === juezId) {
    return (
      <>
        {tarjeta}
        <div className="dsp-barra">
          <p className="dsp-esperando">⚖️ ¿La palabra de {rival?.nombre} es de «{v.categoria}» y empieza por {v.letra}?</p>
          <div className="dsp-dos">
            <button type="button" className="dsp-boton exito" onClick={() => enviar('validar', { valida: true })}>✅ Correcta</button>
            <button type="button" className="dsp-boton peligro" onClick={() => enviar('validar', { valida: false })}>❌ Incorrecta</button>
          </div>
        </div>
        <Tablero v={v} resaltar={v.letra} />
      </>
    );
  }
  if (yo === v.rivalId) {
    return (
      <>
        {tarjeta}
        <div className="dsp-barra estatica">
          <p className="dsp-esperando">⏳ {juez?.nombre ?? 'El anfitrión'} está decidiendo si vale. ¿Te has equivocado de letra? Toca otra.</p>
          <button type="button" className="dsp-boton secundario" onClick={() => enviar('pasar')}>⏭️ Pasar turno</button>
        </div>
        <Tablero v={v} seleccion={v.letra} onElegir={(l) => l && enviar('letra', { letra: l })} />
      </>
    );
  }
  return (
    <>
      {tarjeta}
      <Esperando emoji="⚖️">{juez?.nombre ?? 'El anfitrión'} está decidiendo si la respuesta de <strong>{rival?.nombre}</strong> vale.</Esperando>
      <Tablero v={v} resaltar={v.letra} />
    </>
  );
}

export function PantallaJuego({ v, enviar, onSalir, offset = 0, local = false, admin = null }) {
  const [listo, setListo] = useState(null);
  const yo = v.yo?.id;
  const retador = v.jugadores.find((j) => j.id === v.retadorId);
  const rival = v.jugadores.find((j) => j.id === v.rivalId);
  const claveReto = `${v.tablero}-${v.nlog}`;
  let etiqueta; let titulo; let mio = false; let cuerpo;

  if (v.fase === 'retar') {
    mio = local || yo === v.retadorId;
    etiqueta = 'Turno de retar';
    titulo = mio ? (local ? `${retador?.nombre}, ¡reta a alguien!` : '¡Te toca retar!') : `Reta ${retador?.nombre}`;
    if (!mio) cuerpo = <Esperando emoji="🎯"><strong>{retador?.nombre}</strong> está eligiendo a quién retar y con qué categoría…</Esperando>;
    else if (listo !== claveReto) {
      cuerpo = <Turno v={v} jugadorId={v.retadorId} local={local} etiqueta="Te toca retar" texto="Elige a quién retas y ponle la categoría más difícil que veas." onListo={() => setListo(claveReto)} />;
    } else cuerpo = <Retar v={v} enviar={enviar} />;
  } else if (v.fase === 'turno') {
    mio = local || yo === v.rivalId;
    etiqueta = `${retador?.nombre} reta a ${rival?.nombre}`;
    titulo = mio ? '¡Te han retado!' : `Se prepara ${rival?.nombre}`;
    cuerpo = mio
      ? <Turno v={v} jugadorId={v.rivalId} local={local} etiqueta={`Te reta ${retador?.nombre}`} texto={`Al pulsar «listo» verás tu categoría y tendrás ${AJUSTES.segundosRespuesta} segundos para decir una palabra.`} onListo={() => enviar('empezar')} />
      : <Esperando emoji="⏳"><strong>{rival?.nombre}</strong> se está preparando para responder…</Esperando>;
  } else if (v.fase === 'responder') {
    mio = local || yo === v.rivalId;
    etiqueta = `${retador?.nombre ?? 'El retador'} reta a ${rival?.nombre}`;
    titulo = mio && !local ? '¡Di tu palabra!' : `Responde ${rival?.nombre}`;
    cuerpo = <Responder key={`${v.rivalId}-${v.limite}`} v={v} enviar={enviar} local={local} offset={offset} />;
  } else {
    mio = yo === admin?.juezId;
    etiqueta = 'Validación';
    titulo = mio ? '¿Vale la respuesta?' : yo === v.rivalId ? '¿Te la dan por buena?' : 'Validando…';
    cuerpo = <Validar v={v} enviar={enviar} juezId={admin?.juezId} />;
  }

  const bloqueado = v.fase === 'retar' ? v.retadorId : ['turno', 'responder'].includes(v.fase) ? v.rivalId : v.fase === 'validar' ? admin?.juezId : null;
  return (
    <>
      <Hero v={v} onSalir={onSalir} etiqueta={etiqueta} titulo={titulo} clase={mio ? 'mio' : ''} />
      {v.fase === 'retar' && <Ultimo v={v} />}
      {cuerpo}
      {admin?.esAdmin && bloqueado != null && bloqueado !== yo && admin.desconectados?.includes(bloqueado) && (
        <div className="dsp-barra estatica">
          <button type="button" className="dsp-enlace" onClick={admin.onForzar}><Icon name="forward" size={15} /> ¿No responde? Saltar el turno de {v.jugadores.find((j) => j.id === bloqueado)?.nombre}</button>
        </div>
      )}
      {v.fase === 'retar' && (listo === claveReto || !(local || yo === v.retadorId)) && <Tablero v={v} />}
      <details className="dsp-detalle">
        <summary>📖 Lo que ha pasado</summary>
        <div className="dsp-log">{[...v.log].reverse().map((l) => <p key={l.n} className={l.tipo || ''}>{l.texto}</p>)}</div>
      </details>
    </>
  );
}

function Ranking({ v, filas }) {
  return (
    <ol className="dsp-ranking">
      {filas.map((j, i) => (
        <li key={j.id} className={i === 0 && j.puntos > 0 && !j.fuera ? 'lider' : ''}>
          <span className="dsp-pos">{j.fuera ? '🚪' : (j.puesto ?? i + 1)}</span>
          <Avatar id={j.id} nombre={j.nombre} />
          <span className="dsp-ranking-nombre">{j.nombre}{j.id === v.yo?.id ? ' (tú)' : ''}<small>{j.fuera ? 'abandonó' : `${j.aciertos} ${j.aciertos === 1 ? 'acierto' : 'aciertos'}`}</small></span>
          <strong>{j.puntos}</strong>
        </li>
      ))}
    </ol>
  );
}

/** Fin de un tablero (todavía quedan más). */
export function PantallaTablero({ v, onSalir, children }) {
  const r = v.resumen;
  const filas = [...v.jugadores].sort((a, b) => (a.fuera - b.fuera) || (b.puntos - a.puntos));
  return (
    <>
      <Hero v={v} onSalir={onSalir} etiqueta={`Fin del tablero ${r?.tablero ?? v.tablero}`} titulo={r?.motivo === 'sin_letras' ? '¡Tablero limpio!' : '¡Todos han fallado!'} clase="fin" />
      <Ultimo v={v} />
      <div className="dsp-tarjeta">
        <p className="dsp-etiqueta">{r?.motivo === 'sin_letras' ? 'Se han eliminado todas las letras' : `Quedaron ${r?.quedan?.length ?? 0} letras sin usar`}</p>
        {r?.quedan?.length > 0 && <div className="dsp-quedan">{r.quedan.map((l) => <span key={l} className={`dsp-letra p${PUNTOS[l]}`}><b>{l}</b></span>)}</div>}
        <p className="dsp-pista izquierda">En el tablero {v.tablero + 1} vuelven las 26 letras. Quedan {v.tableros - v.tablero} {v.tableros - v.tablero === 1 ? 'tablero' : 'tableros'}.</p>
      </div>
      <div className="dsp-tarjeta">
        <p className="dsp-etiqueta">Marcador</p>
        <Ranking v={v} filas={filas} />
      </div>
      {children}
    </>
  );
}

export function PantallaFin({ v, onSalir, children }) {
  const f = v.fin;
  const nombres = f.ganadores.map((id) => v.jugadores.find((j) => j.id === id)?.nombre).filter(Boolean);
  const top = f.tabla.filter((x) => !x.fuera).slice(0, 3);
  const orden = [top[1], top[0], top[2]].filter(Boolean);
  const clase = (x) => (x === top[0] ? 'primero' : x === top[1] ? 'segundo' : 'tercero');
  return (
    <>
      <Hero v={v} onSalir={onSalir} etiqueta="Fin de la partida" titulo={nombres.length ? `¡Gana ${nombres.join(' y ')}!` : 'Nadie ha puntuado'} clase="fin" />
      {top.length > 0 && f.max > 0 && (
        <div className="dsp-tarjeta">
          <div className="dsp-podio">
            {orden.map((x) => (
              <div key={x.id} className={`dsp-podio-col ${clase(x)}`}>
                <Avatar id={x.id} nombre={x.nombre} />
                <span className="dsp-podio-nombre">{x.nombre}</span>
                <span className="dsp-podio-pts">{ptos(x.puntos)}</span>
                <div className="dsp-podio-base" style={{ '--c': colorDe(x.id) }}>{x.puesto}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="dsp-tarjeta">
        <p className="dsp-etiqueta">Clasificación</p>
        <Ranking v={v} filas={f.tabla} />
      </div>
      {children}
    </>
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
          <p className="dsp-ayuda-sub">🎯 El reto</p>
          <ul>
            <li>Sale la pantalla de turno del <strong>retador</strong>: al pulsar «listo» elige a un rival (que no haya jugado aún en esta vuelta) y una de <strong>tres categorías</strong>.</li>
            <li>Después sale el turno del rival: al pulsar «listo» ve su categoría y tiene <strong>{AJUSTES.segundosRespuesta} segundos</strong> para decir en voz alta una palabra que empiece por una letra que siga en el tablero.</li>
            <li>Puede acertar, fallar o <strong>pasar turno</strong> (no suma y cuenta como fallo). Después, el rival pasa a ser el nuevo retador.</li>
          </ul>
          <p className="dsp-ayuda-sub">🔤 Letras y puntos</p>
          <ul>
            <li>Si la palabra vale, su letra <strong>se elimina</strong> del tablero y el rival suma sus puntos.</li>
            <li><strong>1 punto:</strong> A B C D E L M P R S T · <strong>2 puntos:</strong> F G H I N O U V · <strong>3 puntos:</strong> J K Q W X Y Z.</li>
          </ul>
          <p className="dsp-ayuda-sub">📱 Online</p>
          <ul>
            <li>El retado toca en su móvil la letra por la que ha dicho la palabra y el <strong>anfitrión</strong> decide si es correcta (si el retado es el anfitrión, decide el retador).</li>
          </ul>
          <p className="dsp-ayuda-sub">🏁 Tableros</p>
          <ul>
            <li>Un tablero termina cuando no quedan letras o cuando <strong>todos fallan seguidos</strong>. Gana quien más puntos sume al acabar el último tablero.</li>
          </ul>
        </div>
        <button type="button" className="big full qq-btn-principal" onClick={onCerrar}>¡Entendido!</button>
      </div>
    </div>
  );
}
