// client/src/games/GeoQuiz/GeoQuizPartida.jsx
// Pantallas de una partida de GeoQuiz (modo local y online). Recibe la «vista» del motor
// (engine.js) y llama a onAccion(tipo, datos) -> Promise<resultado | { error }>.
import React, { useEffect, useRef, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import { centrarActivo } from '../../lib/centrarActivo.js';

const COLORES_JUGADOR = ['#0ea5e9', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4', '#f97316', '#84cc16', '#6366f1', '#14b8a6', '#d946ef'];
const colorJugador = (id) => COLORES_JUGADOR[(Number(id) - 1 + COLORES_JUGADOR.length * 10) % COLORES_JUGADOR.length];
const inicial = (n = '?') => n.trim().charAt(0).toUpperCase() || '?';

const TIPOS = {
  respuesta: { nombre: 'Respuesta única', icono: 'edit' },
  opciones: { nombre: 'Test', icono: 'check' },
  enumerar: { nombre: 'Enumera', icono: 'book' },
  pistas: { nombre: 'Pistas', icono: 'sleuth' },
  ordenar: { nombre: 'Ordena', icono: 'chart' },
  numero: { nombre: 'Aproximación', icono: 'target' }
};

function useCuentaAtras(restanteMs, clave) {
  const [fin, setFin] = useState(null);
  const [ahora, setAhora] = useState(Date.now());
  useEffect(() => {
    setFin(restanteMs == null ? null : Date.now() + restanteMs);
  }, [restanteMs, clave]);
  useEffect(() => {
    if (fin == null) return undefined;
    const id = setInterval(() => setAhora(Date.now()), 200);
    return () => clearInterval(id);
  }, [fin]);
  return fin == null ? null : Math.max(0, Math.ceil((fin - ahora) / 1000));
}

function Vidas({ n, max = 3 }) {
  return (
    <span className="gq-vidas" aria-label={`${n} vidas`}>
      {Array.from({ length: max }, (_, i) => <span key={i} className={i < n ? 'llena' : 'vacia'}>♥</span>)}
    </span>
  );
}

function Marcador({ jugadores, turnoId, yoId, supervivencia, vidasMax }) {
  const ref = useRef(null);
  useEffect(() => {
    centrarActivo(ref.current);
  }, [turnoId]);
  return (
    <ol className="gq-marcador" ref={ref} aria-label="Jugadores">
      {jugadores.map((j) => (
        <li key={j.id} className={`gq-jugador${j.id === turnoId ? ' activo' : ''}${j.eliminado ? ' eliminado' : ''}`} style={{ '--c': colorJugador(j.id) }}>
          <span className="gq-avatar">{inicial(j.nombre)}</span>
          <span className="gq-jugador-datos">
            <span className="gq-jugador-nombre">{j.nombre}{j.id === yoId ? ' (tú)' : ''}</span>
            <span className="gq-jugador-linea">
              {supervivencia && (j.eliminado ? <span className="gq-eliminado">Eliminado</span> : <Vidas n={j.vidas} max={vidasMax} />)}
              <strong>{j.puntos} pts</strong>
            </span>
          </span>
        </li>
      ))}
    </ol>
  );
}

function BarraTiempo({ segundos, totalMs }) {
  if (segundos == null || !totalMs) return null;
  const pct = Math.max(0, Math.min(100, (segundos * 1000 / totalMs) * 100));
  const nivel = segundos <= 5 ? 'critico' : segundos <= 10 ? 'aviso' : '';
  return (
    <div className={`gq-tiempo ${nivel}`} role="timer" aria-label={`${segundos} segundos`}>
      <div className="gq-tiempo-barra"><span style={{ width: `${pct}%` }} /></div>
      <span className="gq-tiempo-num"><Icon name="clock" size={15} /> {segundos}s</span>
    </div>
  );
}

function Aviso({ evento }) {
  const [visible, setVisible] = useState(null);
  const ultimo = useRef(evento?.n ?? 0);
  useEffect(() => {
    if (!evento || evento.n === ultimo.current) return undefined;
    ultimo.current = evento.n;
    setVisible(evento);
    const id = setTimeout(() => setVisible(null), 3500);
    return () => clearTimeout(id);
  }, [evento]);
  if (!visible) return null;
  const bueno = ['acierto', 'ganador'].includes(visible.tipo);
  const malo = visible.tipo === 'fallo';
  return (
    <div className={`gq-aviso${bueno ? ' bueno' : ''}${malo ? ' malo' : ''}`} role="status" aria-live="polite">
      <span aria-hidden="true">{bueno ? '🎉' : malo ? (visible.eliminado ? '💀' : '❌') : 'ℹ️'}</span>
      {visible.texto}
    </div>
  );
}

function CabeceraPregunta({ pregunta }) {
  const tipo = TIPOS[pregunta.tipo] || TIPOS.respuesta;
  return (
    <div className="gq-pregunta-cab">
      <div className="gq-etiquetas">
        <span className="gq-etiqueta-tipo"><Icon name={tipo.icono} size={14} /> {tipo.nombre}</span>
        <span className="gq-etiqueta-prueba">{pregunta.prueba}</span>
      </div>
      {pregunta.categoria && <p className="gq-categoria-texto">{pregunta.categoria}</p>}
      {pregunta.tipo !== 'pistas' && <h2 className="gq-pregunta">{pregunta.pregunta}</h2>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pruebas interactivas
// ---------------------------------------------------------------------------
function FormTexto({ placeholder, onEnviar, boton = 'Responder', numerico = false, unidad, deshabilitado, autoFocus = true, limpiarTrasEnviar = false }) {
  const [texto, setTexto] = useState('');
  const ref = useRef(null);
  const enviar = async (e) => {
    e.preventDefault();
    if (!texto.trim() || deshabilitado) return;
    const valor = texto;
    if (limpiarTrasEnviar) setTexto('');
    await onEnviar(valor);
    ref.current?.focus();
  };
  return (
    <form className="gq-form" onSubmit={enviar}>
      <div className="gq-input-fila">
        <input
          ref={ref}
          className="gq-input"
          type="text"
          inputMode={numerico ? 'decimal' : 'text'}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          maxLength={80}
          autoFocus={autoFocus}
          enterKeyHint="send"
        />
        {unidad && <span className="gq-unidad">{unidad}</span>}
      </div>
      <button type="submit" className="gq-boton" disabled={!texto.trim() || deshabilitado}>
        <Icon name="check" size={20} /> {boton}
      </button>
    </form>
  );
}

function Opciones({ opciones, onElegir, deshabilitado, correcta, elegida }) {
  return (
    <div className="gq-opciones">
      {opciones.map((op, i) => {
        const estado = correcta ? (op === correcta ? ' correcta' : op === elegida ? ' incorrecta' : ' apagada') : '';
        return (
          <button key={op} type="button" className={`gq-opcion${estado}`} disabled={deshabilitado} onClick={() => onElegir?.(op)}>
            <span className="gq-opcion-letra">{String.fromCharCode(65 + i)}</span>
            <span>{op}</span>
          </button>
        );
      })}
    </div>
  );
}

function Enumerar({ pregunta, puedo, accion, enviando }) {
  const [ultimo, setUltimo] = useState(null);
  const enviar = async (texto) => {
    const r = await accion('enumerar', { texto });
    if (r && !r.error) setUltimo({ ...r, texto });
  };
  const mensajes = {
    nuevo: (u) => `✓ ${u.elemento}`,
    repetido: (u) => `«${u.elemento}» ya estaba`,
    no: (u) => `«${u.texto}» no vale`
  };
  return (
    <>
      <div className="gq-enumerar-cab">
        <span className="gq-contador"><strong>{pregunta.encontrados.length}</strong> / {pregunta.total}</span>
        {ultimo && mensajes[ultimo.estado] && (
          <span key={`${ultimo.texto}-${pregunta.encontrados.length}`} className={`gq-feedback ${ultimo.estado}`}>{mensajes[ultimo.estado](ultimo)}</span>
        )}
      </div>
      {puedo && <FormTexto placeholder="Escribe uno y pulsa Intro…" boton="Añadir" onEnviar={enviar} deshabilitado={enviando} limpiarTrasEnviar />}
      {pregunta.encontrados.length > 0 && (
        <div className="gq-chips-lista">
          {pregunta.encontrados.map((el) => <span key={el} className="gq-chip-ok">{el}</span>)}
        </div>
      )}
      {!puedo && pregunta.intentos?.length > 0 && (
        <p className="gq-mini">Últimos intentos: {pregunta.intentos.map((x) => x.texto).join(', ')}</p>
      )}
    </>
  );
}

function Pistas({ pregunta, puedo, accion, enviando }) {
  const [fallo, setFallo] = useState(null);
  const enviar = async (texto) => {
    const r = await accion('responder', { valor: texto });
    if (r && r.otraPista) setFallo(texto);
  };
  return (
    <>
      <ol className="gq-pistas">
        {pregunta.pistas.map((p, i) => (
          <li key={i} className={i === pregunta.pistas.length - 1 ? 'nueva' : ''}>
            <span className="gq-pista-num">{i + 1}</span>
            <span>{p}</span>
          </li>
        ))}
        {Array.from({ length: pregunta.totalPistas - pregunta.pistas.length }, (_, i) => (
          <li key={`h${i}`} className="oculta"><span className="gq-pista-num">{pregunta.pistas.length + i + 1}</span><span>Pista oculta</span></li>
        ))}
      </ol>
      <p className="gq-mini">Si aciertas ahora: <strong>{pregunta.puntosPosibles} {pregunta.puntosPosibles === 1 ? 'punto' : 'puntos'}</strong></p>
      {fallo && puedo && <p className="gq-feedback no" key={fallo + pregunta.pistas.length}>«{fallo}» no es correcto: ¡nueva pista!</p>}
      {!puedo && pregunta.intentos?.length > 0 && <p className="gq-mini">Ha probado: {pregunta.intentos.join(', ')}</p>}
      {puedo && (
        <>
          <FormTexto placeholder="¿Qué es?" onEnviar={enviar} deshabilitado={enviando} limpiarTrasEnviar />
          {pregunta.pistas.length < pregunta.totalPistas && (
            <button type="button" className="gq-boton secundario" disabled={enviando} onClick={() => accion('pista')}>
              <Icon name="eye" size={18} /> Ver otra pista (−1 punto)
            </button>
          )}
        </>
      )}
    </>
  );
}

function Ordenar({ pregunta, puedo, accion, enviando }) {
  const [orden, setOrden] = useState([]);
  const quedan = pregunta.items.filter((it) => !orden.includes(it));
  return (
    <>
      <p className="gq-mini">Toca los elementos <strong>{pregunta.criterio}</strong>. Toca uno colocado para quitarlo.</p>
      <ol className="gq-orden">
        {pregunta.items.map((_, i) => (
          <li key={i} className={orden[i] ? 'lleno' : ''}>
            <span className="gq-orden-pos">{i + 1}</span>
            {orden[i] ? (
              <button type="button" className="gq-orden-item" disabled={!puedo} onClick={() => setOrden(orden.filter((x) => x !== orden[i]))}>
                {orden[i]} <Icon name="x" size={14} />
              </button>
            ) : <span className="gq-orden-vacio">—</span>}
          </li>
        ))}
      </ol>
      {quedan.length > 0 && (
        <div className="gq-orden-pendientes">
          {quedan.map((it) => (
            <button key={it} type="button" className="gq-orden-ficha" disabled={!puedo} onClick={() => setOrden([...orden, it])}>{it}</button>
          ))}
        </div>
      )}
      {puedo && (
        <button type="button" className="gq-boton" disabled={orden.length !== pregunta.items.length || enviando} onClick={() => accion('responder', { valor: orden })}>
          <Icon name="check" size={20} /> Comprobar orden
        </button>
      )}
    </>
  );
}

function Pregunta({ pregunta, puedo, accion, enviando }) {
  switch (pregunta.tipo) {
    case 'opciones':
      return <Opciones opciones={pregunta.opciones} deshabilitado={!puedo || enviando} onElegir={(op) => accion('responder', { valor: op })} />;
    case 'enumerar':
      return <Enumerar pregunta={pregunta} puedo={puedo} accion={accion} enviando={enviando} />;
    case 'pistas':
      return <Pistas pregunta={pregunta} puedo={puedo} accion={accion} enviando={enviando} />;
    case 'ordenar':
      return <Ordenar pregunta={pregunta} puedo={puedo} accion={accion} enviando={enviando} />;
    case 'numero':
      return puedo
        ? <FormTexto placeholder="Escribe un número" numerico unidad={pregunta.unidad} onEnviar={(v) => accion('responder', { valor: v })} deshabilitado={enviando} />
        : <p className="gq-mini">Respuesta en {pregunta.unidad}.</p>;
    default:
      return puedo ? <FormTexto placeholder="Tu respuesta…" onEnviar={(v) => accion('responder', { valor: v })} deshabilitado={enviando} /> : null;
  }
}

// ---------------------------------------------------------------------------
// Resultado de una prueba
// ---------------------------------------------------------------------------
function Resultado({ turno, modo }) {
  const r = turno.resultado;
  const p = turno.pregunta;
  if (modo === 'contrarreloj') {
    const lista = r.detalle?.respondidas || [];
    return (
      <div className="gq-tarjeta gq-resultado">
        <p className="gq-resultado-titulo">⏱️ ¡Tiempo!</p>
        <p className="gq-resultado-puntos">{r.detalle?.aciertos ?? 0} {r.detalle?.aciertos === 1 ? 'acierto' : 'aciertos'} · +{r.puntosTurno ?? 0} pts</p>
        {lista.length > 0 ? (
          <ul className="gq-repaso">
            {lista.map((x, i) => (
              <li key={i} className={x.correcto ? 'ok' : 'ko'}>
                <span>{x.correcto ? '✓' : '✗'}</span>
                <span><span className="gq-repaso-preg">{x.pregunta}</span> <strong>{x.solucion}</strong></span>
              </li>
            ))}
          </ul>
        ) : <p className="gq-mini">No ha respondido ninguna pregunta.</p>}
      </div>
    );
  }
  const d = r.detalle || {};
  return (
    <div className={`gq-tarjeta gq-resultado ${r.correcto ? 'ok' : r.puntos > 0 ? 'medio' : 'ko'}`}>
      <p className="gq-resultado-titulo">
        {r.correcto ? '¡Correcto!' : r.puntos > 0 ? '¡Bien!' : 'Fallo'}
        <span className="gq-resultado-puntos">+{r.puntos} {r.puntos === 1 ? 'punto' : 'puntos'}</span>
      </p>
      {r.eliminado ? <p className="gq-vida-perdida">💀 Sin vidas: queda eliminado</p> : r.perdioVida ? <p className="gq-vida-perdida">💔 Pierde una vida</p> : null}
      {p && <p className="gq-mini gq-resultado-preg">{p.tipo === 'pistas' ? 'Pistas' : p.pregunta}</p>}

      {p?.tipo === 'opciones' && <Opciones opciones={p.opciones} deshabilitado correcta={p.respuestaCorrecta} elegida={d.tuRespuesta} />}
      {p?.tipo === 'respuesta' && (
        <dl className="gq-comparar">
          {d.tuRespuesta && <><dt>Respuesta dada</dt><dd>{d.tuRespuesta}</dd></>}
          <dt>Solución</dt><dd><strong>{r.solucion}</strong></dd>
        </dl>
      )}
      {p?.tipo === 'pistas' && (
        <dl className="gq-comparar">
          <dt>Solución</dt><dd><strong>{r.solucion}</strong></dd>
          <dt>Pistas usadas</dt><dd>{d.pistasUsadas} de {d.pistas?.length}</dd>
        </dl>
      )}
      {p?.tipo === 'numero' && (
        <dl className="gq-comparar">
          <dt>Respuesta dada</dt><dd>{d.tuValor != null ? `${d.tuValor.toLocaleString('es-ES')} ${d.unidad}` : '—'}</dd>
          <dt>Valor real</dt><dd><strong>{r.solucion}</strong></dd>
          {d.errorPct != null && <><dt>Desviación</dt><dd>{d.errorPct}%</dd></>}
        </dl>
      )}
      {p?.tipo === 'ordenar' && (
        <ol className="gq-orden resultado">
          {d.ordenCorrecto.map((it, i) => (
            <li key={it} className={d.tuOrden?.[i] === it ? 'bien' : 'mal'}>
              <span className="gq-orden-pos">{i + 1}</span>
              <span className="gq-orden-texto">{it}{d.tuOrden?.[i] && d.tuOrden[i] !== it ? <small> (pusiste {d.tuOrden[i]})</small> : null}</span>
            </li>
          ))}
        </ol>
      )}
      {p?.tipo === 'enumerar' && (
        <>
          <p className="gq-mini"><strong>{d.encontrados?.length}</strong> de {d.total}</p>
          <div className="gq-chips-lista">
            {d.encontrados?.map((el) => <span key={el} className="gq-chip-ok">{el}</span>)}
            {d.faltan?.map((el) => <span key={el} className="gq-chip-falta">{el}</span>)}
          </div>
        </>
      )}
      {r.dato && <p className="gq-dato">💡 {r.dato}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------
/**
 * - partida: vista del motor · yoId: jugador de este dispositivo (online). null en local
 * - esAdmin: puede saltar turnos y terminar la partida
 * - onAccion(tipo, datos) · onSalir · finPartida: botones al terminar
 */
export default function GeoQuizPartida({ partida, yoId = null, esAdmin, onAccion, onSalir, finPartida, local = false }) {
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [confirmarFin, setConfirmarFin] = useState(false);
  const t = partida.turno;
  const clave = t ? `${t.jugadorId}-${t.paso}-${t.pregunta?.pregunta}-${t.contrarreloj?.respondidas}` : 'fin';
  const segundos = useCuentaAtras(t?.restanteMs ?? null, clave);
  const puedo = Boolean(t) && (local || t.jugadorId === yoId);
  const supervivencia = partida.modo === 'supervivencia';

  useEffect(() => { setError(''); }, [clave]);

  const accion = async (tipo, datos) => {
    setEnviando(true);
    setError('');
    const r = await onAccion(tipo, datos);
    if (r?.error) setError(r.error);
    setEnviando(false);
    return r;
  };

  const cabecera = (
    <header className="gq-hero">
      <span className="gq-hero-deco" aria-hidden="true"><Icon name="globe" size={150} strokeWidth={1.3} /></span>
      <div className="gq-hero-top">
        <button type="button" className="gq-salir" onClick={onSalir}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          <span>Portada</span>
        </button>
        <div className="gq-hero-chips">
          <span className="gq-chip">{partida.nombreModo}</span>
          {partida.rondas && partida.fase !== 'fin' && <span className="gq-chip">Ronda {partida.ronda}/{partida.rondas}</span>}
        </div>
      </div>
      <Marcador jugadores={partida.jugadores} turnoId={t?.jugadorId} yoId={yoId} supervivencia={supervivencia} vidasMax={partida.vidasMax} />
    </header>
  );

  const pieAdmin = (esAdmin || local) && partida.fase !== 'fin' && (
    <div className="gq-admin">
      {!local && t && !puedo && (
        <button type="button" className="gq-enlace" onClick={() => accion('saltar-turno')}>
          <Icon name="forward" size={16} /> Saltar turno de {t.nombre}
        </button>
      )}
      <button type="button" className="gq-enlace peligro" onClick={() => setConfirmarFin(true)}>
        <Icon name="flagFinish" size={16} /> Terminar partida
      </button>
    </div>
  );

  const modalFin = confirmarFin && (
    <div className="rg-modal-fondo" onClick={() => setConfirmarFin(false)}>
      <div className="rg-modal gq-modal" onClick={(e) => e.stopPropagation()}>
        <div className="gq-modal-icono">🏁</div>
        <h3>¿Terminar la partida?</h3>
        <p className="hint">Se mostrará la clasificación con las puntuaciones actuales.</p>
        <div className="gq-fila">
          <button type="button" className="gq-boton secundario" onClick={() => setConfirmarFin(false)}>Seguir jugando</button>
          <button type="button" className="gq-boton peligro" onClick={() => { setConfirmarFin(false); accion('finalizar'); }}>Terminar</button>
        </div>
      </div>
    </div>
  );

  // ---------- FIN DE PARTIDA ----------
  if (partida.fase === 'fin') {
    const ranking = [...partida.jugadores].sort((a, b) => b.puntos - a.puntos || (b.vidas - a.vidas));
    const ganador = supervivencia ? partida.jugadores.find((j) => !j.eliminado) : null;
    const max = ranking[0]?.puntos ?? 0;
    const lideres = ranking.filter((j) => j.puntos === max && max > 0);
    return (
      <section className="game gq-escena">
        {cabecera}
        <Aviso evento={partida.evento} />
        <div className="gq-tarjeta gq-final">
          <span className="gq-final-icono"><Icon name="crown" size={40} /></span>
          <p className="gq-etiqueta">Fin de la partida</p>
          <h2 className="gq-final-titulo">
            {ganador && partida.jugadores.length > 1
              ? `¡${ganador.nombre} sobrevive!`
              : lideres.length === 1 ? `¡Gana ${lideres[0].nombre}!` : lideres.length > 1 ? `Empate: ${lideres.map((j) => j.nombre).join(' y ')}` : 'Nadie ha sumado puntos'}
          </h2>
          <ol className="gq-ranking">
            {ranking.map((j, i) => (
              <li key={j.id} className={i === 0 && max > 0 ? 'lider' : ''} style={{ '--c': colorJugador(j.id) }}>
                <span className="gq-ranking-pos">{i === 0 && max > 0 ? <Icon name="crown" size={18} /> : i + 1}</span>
                <span className="gq-avatar">{inicial(j.nombre)}</span>
                <span className="gq-ranking-nombre">
                  {j.nombre}{j.id === yoId ? ' (tú)' : ''}
                  <small>{j.aciertos} aciertos · {j.fallos} fallos</small>
                </span>
                <strong>{j.puntos} pts</strong>
              </li>
            ))}
          </ol>
        </div>
        <div className="gq-barra estatica">{finPartida}</div>
      </section>
    );
  }

  // ---------- TURNO: «LISTO» ----------
  if (t?.paso === 'listo') {
    const j = partida.jugadores.find((x) => x.id === t.jugadorId);
    return (
      <section className="game gq-escena">
        {cabecera}
        <Aviso evento={partida.evento} />
        <div className="gq-tarjeta gq-listo">
          <span className="gq-listo-avatar" style={{ '--c': colorJugador(t.jugadorId) }}>{inicial(t.nombre)}</span>
          <p className="gq-etiqueta">{puedo ? (local ? 'Pasa el móvil a' : '¡Es tu turno!') : 'Turno de'}</p>
          <h2 className="gq-listo-nombre">{t.nombre}</h2>
          {supervivencia && j && <Vidas n={j.vidas} max={partida.vidasMax} />}
          <p className="gq-texto">
            {partida.modo === 'contrarreloj'
              ? <>Tendrás <strong>60 segundos</strong> para acertar tantas preguntas como puedas.</>
              : puedo ? <>Cuando estés preparado, pulsa <strong>¡Listo!</strong> y aparecerá tu pregunta.</> : <>Esperando a que {t.nombre} pulse «Listo»…</>}
          </p>
        </div>
        {error && <p className="error" style={{ margin: 0 }}>{error}</p>}
        <div className="gq-barra">
          {puedo && (
            <button type="button" className="gq-boton grande" disabled={enviando} onClick={() => accion('listo')}>
              <Icon name="play" size={22} /> ¡Listo!
            </button>
          )}
          {pieAdmin}
        </div>
        {modalFin}
      </section>
    );
  }

  // ---------- PREGUNTA ----------
  if (t?.paso === 'pregunta' && t.pregunta) {
    const cr = t.contrarreloj;
    return (
      <section className="game gq-escena">
        {cabecera}
        <Aviso evento={partida.evento} />
        {!puedo && (
          <div className="gq-turno-de" style={{ '--c': colorJugador(t.jugadorId) }}>
            <span className="gq-avatar">{inicial(t.nombre)}</span>
            <p><strong>{t.nombre}</strong> está respondiendo…</p>
          </div>
        )}
        <BarraTiempo segundos={segundos} totalMs={t.totalMs} />
        {cr && (
          <div className="gq-contrarreloj">
            <span><strong>{cr.aciertos}</strong> {cr.aciertos === 1 ? 'acierto' : 'aciertos'}</span>
            {cr.ultima && (
              <span key={cr.respondidas} className={`gq-feedback ${cr.ultima.correcto ? 'nuevo' : 'no'}`}>
                {cr.ultima.correcto ? '✓ ¡Bien!' : `✗ Era: ${cr.ultima.solucion}`}
              </span>
            )}
          </div>
        )}
        <div className="gq-tarjeta gq-pregunta-tarjeta" key={t.pregunta.pregunta + (cr?.respondidas ?? '')}>
          <CabeceraPregunta pregunta={t.pregunta} />
          <Pregunta pregunta={t.pregunta} puedo={puedo} accion={accion} enviando={enviando} />
        </div>
        {error && <p className="error" style={{ margin: 0 }}>{error}</p>}
        {/* En la pregunta la barra no flota: el botón principal está dentro de la tarjeta */}
        <div className="gq-barra estatica">
          {puedo && (
            <button type="button" className="gq-enlace" disabled={enviando} onClick={() => accion('plantarse')}>
              {t.pregunta.tipo === 'enumerar' ? <><Icon name="check" size={16} /> He terminado</> : partida.modo === 'contrarreloj' ? <><Icon name="flagFinish" size={16} /> Terminar mi turno</> : <><Icon name="forward" size={16} /> No lo sé, pasar</>}
            </button>
          )}
          {pieAdmin}
        </div>
        {modalFin}
      </section>
    );
  }

  // ---------- RESULTADO ----------
  if (t?.paso === 'resultado' && t.resultado) {
    return (
      <section className="game gq-escena">
        {cabecera}
        <Aviso evento={partida.evento} />
        <Resultado turno={t} modo={partida.modo} />
        <BarraTiempo segundos={segundos} totalMs={t.totalMs} />
        <div className="gq-barra">
          {(puedo || esAdmin) && (
            <button type="button" className="gq-boton grande" disabled={enviando} onClick={() => accion('continuar')}>
              Continuar <Icon name="forward" size={20} />
            </button>
          )}
          {pieAdmin}
        </div>
        {modalFin}
      </section>
    );
  }

  return (
    <section className="game gq-escena">
      {cabecera}
      <p className="gq-mini">Cargando…</p>
    </section>
  );
}
