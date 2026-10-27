// client/src/games/Furbo/FurboPartida.jsx
// Pantalla de partida compartida por el modo local y el online.
// Recibe la «vista» que prepara el motor del servidor y envía acciones con onAccion.
import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../components/Icon.jsx';
import { FASES_INFO } from './furboInfo.js';
import './Furbo.css';
import '../Adivina/Adivina.css';

const LETRAS = ['A', 'B', 'C', 'D'];
const QUINIELA = ['1', 'X', '2'];

/* ------------------------------------------------------------------ piezas */
function Reloj({ restante, total }) {
  if (restante == null) return null;
  const seg = Math.ceil(restante / 1000);
  const pct = total ? Math.max(0, Math.min(100, (restante / total) * 100)) : 100;
  const bajo = seg <= 5;
  return (
    <div className="furbo-reloj" role="timer">
      <div className="furbo-reloj-barra">
        <div className={`furbo-reloj-fill ${bajo ? 'low' : ''}`} style={{ width: `${pct}%` }} />
      </div>
      <p className={`furbo-reloj-texto ${bajo ? 'low' : ''}`}>
        <Icon name="clock" size={16} /> {seg} s
      </p>
    </div>
  );
}

function Gate({ nombre, motivo, onAbrir }) {
  return (
    <div className="panel center furbo-gate">
      <span className="furbo-fase-emoji">📱</span>
      <h2 className="title">Pasa el móvil a {nombre}</h2>
      <p className="hint">{motivo}</p>
      <button type="button" className="big full" style={{ marginTop: '1rem' }} onClick={onAbrir}>
        Soy {nombre}
      </button>
    </div>
  );
}

function ChipsEspera({ jugadores, respondieron }) {
  return (
    <div className="furbo-chips-espera">
      {jugadores.filter((j) => !j.ausente).map((j) => (
        <span key={j.id} className={`furbo-chip-espera ${respondieron.includes(j.id) ? 'listo' : ''}`}>
          {respondieron.includes(j.id) ? '✅' : '⏳'} {j.nombre}
        </span>
      ))}
    </div>
  );
}

const MOTIVO_GATE = {
  vestuario: 'Va a escribir su respuesta en secreto. Que nadie más mire la pantalla.',
  quiniela: 'Va a elegir su opción en secreto. Que nadie más mire la pantalla.',
  rebote: 'Es su turno de responder.',
  prorroga: 'Es quien describe: la pantalla mostrará la palabra, ¡que nadie la vea!',
  penaltis: 'Le toca lanzar el penalti.'
};

/* --------------------------------------------------------------- Vestuario */
function Vestuario({ ronda, ctx }) {
  const [texto, setTexto] = useState('');
  useEffect(() => { setTexto(''); }, [ctx.claveRonda, ctx.actor]);

  const enviar = (e) => {
    e.preventDefault();
    if (!texto.trim()) return;
    ctx.onAccion({ tipo: 'responder', jugadorId: ctx.actor, texto: texto.trim() });
  };

  if (ronda.etapa === 'revelado') {
    const { grupos = [], ganadores = [], puntos = 2 } = ronda.resultado || {};
    const ordenados = [...grupos].sort((a, b) => b.length - a.length);
    return (
      <>
        <div className="furbo-pregunta">
          <span className="furbo-tag">Vestuario</span>
          <h2>{ronda.pregunta}</h2>
        </div>
        {ordenados.length === 0 && <p className="hint center">Nadie llegó a responder.</p>}
        {ordenados.map((g, i) => {
          const gana = g.length > 1;
          return (
            <div key={i} className={`furbo-grupo ${gana ? 'ganadora' : ''}`}>
              <div className="furbo-grupo-titulo">
                {gana ? `✅ ¡Coinciden! +${puntos} pts cada uno` : '❌ Sin coincidencia'}
              </div>
              {g.map((id) => (
                <div key={id} className="furbo-grupo-fila">
                  <span>{ctx.nombre(id)}</span>
                  <strong>«{ronda.respuestas?.[id]}»</strong>
                </div>
              ))}
            </div>
          );
        })}
        {ganadores.length === 0 && ordenados.length > 0 && (
          <div className="status-alert error">Nadie ha coincidido en esta ronda.</div>
        )}
      </>
    );
  }

  return (
    <>
      <div className="furbo-pregunta">
        <span className="furbo-tag">Vestuario · Telepatía</span>
        <h2>{ronda.pregunta}</h2>
      </div>
      <Reloj restante={ctx.restante} total={ronda.totalMs} />
      {ctx.soyPendiente ? (
        <form onSubmit={enviar}>
          <input
            autoFocus
            type="text"
            className="player-text-input respuesta-input-grande"
            placeholder="Escribe un nombre..."
            maxLength={40}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
          />
          <button type="submit" className="big full" style={{ marginTop: '0.8rem' }} disabled={!texto.trim()}>
            Enviar respuesta
          </button>
          <p className="hint small center" style={{ marginTop: '0.5rem' }}>
            {ctx.local ? `${ctx.nombre(ctx.actor)}: nadie más debe ver tu respuesta.` : 'Intenta coincidir con alguien: no hace falta acertar.'}
          </p>
        </form>
      ) : (
        <p className="hint center">✅ Respuesta enviada. Esperando al resto...</p>
      )}
      <ChipsEspera jugadores={ctx.jugadores} respondieron={ronda.respondieron} />
    </>
  );
}

/* ------------------------------------------------------------------ Rebote */
function Rebote({ ronda, ctx }) {
  const [num, setNum] = useState('');
  useEffect(() => { setNum(''); }, [ctx.claveRonda, ctx.actor]);

  const enviar = (e) => {
    e.preventDefault();
    if (!num.trim()) return;
    ctx.onAccion({ tipo: 'responder', jugadorId: ctx.actor, numero: num.trim() });
  };

  const cabecera = (
    <div className="furbo-pregunta">
      <span className="furbo-tag">Rebote · Dato exacto</span>
      <h2>{ronda.pregunta}</h2>
    </div>
  );

  if (ronda.etapa === 'revelado') {
    const res = ronda.resultado || {};
    let mensaje;
    let tipo = 'info';
    if (res.exacto) {
      mensaje = `¡${ctx.nombre(ronda.activoId)} lo clava y suma +${res.ptsActivo} puntos!`;
      tipo = 'success';
    } else if (res.direccionAcertada === true) {
      mensaje = `${ctx.nombre(ronda.reboteId)} acierta el rebote y suma +${res.ptsRebote} punto.`;
      tipo = 'success';
    } else if (res.direccionAcertada === false) {
      mensaje = `${ctx.nombre(ronda.reboteId)} falla el rebote. Nadie suma.`;
      tipo = 'error';
    } else if (res.saltada) {
      mensaje = 'Ronda saltada por el anfitrión.';
    } else if (res.tiempoAgotado) {
      mensaje = 'Se acabó el tiempo. Nadie suma.';
      tipo = 'error';
    } else {
      mensaje = 'Nadie suma en esta ronda.';
      tipo = 'error';
    }
    return (
      <>
        {cabecera}
        <div className="furbo-respuesta-real">Respuesta correcta: {ronda.correcta}</div>
        {res.intento != null && !res.exacto && (
          <p className="hint center">{ctx.nombre(ronda.activoId)} dijo: <strong>{res.intento}</strong></p>
        )}
        <div className={`status-alert ${tipo}`}>{mensaje}</div>
      </>
    );
  }

  if (ronda.etapa === 'j1') {
    return (
      <>
        {cabecera}
        <Reloj restante={ctx.restante} total={ronda.totalMs} />
        {ctx.soyPendiente ? (
          <form onSubmit={enviar}>
            <p className="hint center" style={{ marginBottom: '0.5rem' }}>
              Tu turno, <strong>{ctx.nombre(ronda.activoId)}</strong>: di el número exacto (+3 pts).
            </p>
            <input
              autoFocus
              type="text"
              inputMode="numeric"
              className="player-text-input respuesta-input-grande"
              placeholder={ronda.esAnio ? 'Año...' : 'Número...'}
              maxLength={6}
              value={num}
              onChange={(e) => setNum(e.target.value.replace(/[^\d]/g, ''))}
            />
            <button type="submit" className="big full" style={{ marginTop: '0.8rem' }} disabled={!num.trim()}>
              Responder
            </button>
          </form>
        ) : (
          <p className="hint center">🎯 Turno de <strong>{ctx.nombre(ronda.activoId)}</strong>. Si falla, rebotará a {ronda.reboteId ? ctx.nombre(ronda.reboteId) : 'otro jugador'}.</p>
        )}
      </>
    );
  }

  // etapa 'rebote'
  const menos = ronda.esAnio ? '⬅️ Antes' : '⬇️ Menos';
  const mas = ronda.esAnio ? 'Después ➡️' : '⬆️ Más';
  return (
    <>
      {cabecera}
      <Reloj restante={ctx.restante} total={ronda.totalMs} />
      <div className="status-alert error" style={{ marginBottom: '0.8rem' }}>
        {ctx.nombre(ronda.activoId)} ha dicho <strong>{ronda.intento}</strong> y ha fallado. ¡Rebote!
      </div>
      {ctx.soyPendiente ? (
        <>
          <p className="hint center">
            <strong>{ctx.nombre(ronda.reboteId)}</strong>, ¿el dato real es {ronda.esAnio ? 'anterior o posterior' : 'menor o mayor'} que {ronda.intento}? (+1 pt)
          </p>
          <div className="furbo-zonas">
            <button type="button" className="furbo-zona-btn" onClick={() => ctx.onAccion({ tipo: 'responder', jugadorId: ctx.actor, direccion: 'menos' })}>
              <span>{menos}</span>
            </button>
            <button type="button" className="furbo-zona-btn" onClick={() => ctx.onAccion({ tipo: 'responder', jugadorId: ctx.actor, direccion: 'mas' })}>
              <span>{mas}</span>
            </button>
          </div>
        </>
      ) : (
        <p className="hint center">Esperando a que <strong>{ctx.nombre(ronda.reboteId)}</strong> responda...</p>
      )}
    </>
  );
}

/* ---------------------------------------------------------------- Quiniela */
function Quiniela({ ronda, ctx }) {
  const rev = ronda.etapa === 'revelado';
  const respuestas = ronda.respuestas || {};

  const quienElegio = (i) => Object.entries(respuestas)
    .filter(([, op]) => op === i)
    .map(([id]) => ctx.nombre(Number(id)));

  return (
    <>
      <div className="furbo-pregunta">
        <span className="furbo-tag">Quiniela 1X2</span>
        <h2>{ronda.pregunta}</h2>
      </div>
      {!rev && <Reloj restante={ctx.restante} total={ronda.totalMs} />}

      <div className="furbo-opciones">
        {ronda.opciones.map((op, i) => {
          let clase = '';
          if (rev) clase = i === ronda.correcta ? 'correcta' : (quienElegio(i).length ? 'incorrecta' : '');
          else if (ronda.miRespuesta === i) clase = 'elegida';
          const quien = rev ? quienElegio(i) : [];
          return (
            <button
              key={i}
              type="button"
              className={`furbo-opcion-btn ${clase}`}
              disabled={rev || !ctx.soyPendiente}
              onClick={() => ctx.onAccion({ tipo: 'responder', jugadorId: ctx.actor, opcion: i })}
            >
              <span className="furbo-letra">{QUINIELA[i]}</span>
              <span>{op}</span>
              {quien.length > 0 && <span className="furbo-quien">{quien.join(', ')}</span>}
            </button>
          );
        })}
      </div>

      {rev ? (
        ronda.resultado?.ganadores?.length > 0 ? (
          <div className="status-alert success">
            Aciertan: {ronda.resultado.ganadores.map((id) => ctx.nombre(id)).join(', ')} (+{ronda.resultado.puntos} pts)
          </div>
        ) : (
          <div className="status-alert error">Nadie ha acertado.</div>
        )
      ) : (
        <>
          {!ctx.soyPendiente && <p className="hint center">✅ Elección enviada. Esperando al resto...</p>}
          <ChipsEspera jugadores={ctx.jugadores} respondieron={ronda.respondieron} />
        </>
      )}
    </>
  );
}

/* ----------------------------------------------------------------- Prórroga */
function Prorroga({ ronda, ctx }) {
  const [eligiendo, setEligiendo] = useState(false);
  useEffect(() => { setEligiendo(false); }, [ctx.claveRonda, ronda.actual?.objetivo]);

  const accion = (tipo, extra = {}) => ctx.onAccion({ tipo, jugadorId: ctx.actor, ...extra });
  const describidor = ctx.nombre(ronda.describidorId);

  const contadores = (
    <div className="furbo-contadores">
      <span className="furbo-contador">✅ Acertadas: {ronda.aciertos}</span>
      <span className="furbo-contador">⏭️ Pasadas: {ronda.pasadas}</span>
      <span className="furbo-contador">🚫 Faltas: {ronda.faltas}</span>
    </div>
  );

  if (ronda.etapa === 'fin') {
    return (
      <>
        <div className="furbo-pregunta">
          <span className="furbo-tag">Prórroga</span>
          <h2>¡Turno de {describidor} terminado!</h2>
        </div>
        {contadores}
        {ronda.historial?.length > 0 && (
          <div className="panel" style={{ marginTop: '0.4rem' }}>
            {ronda.historial.map((h, i) => (
              <div key={i} className="furbo-grupo-fila">
                <span>{h.resultado === 'acierto' ? '✅' : h.resultado === 'falta' ? '🚫' : '⏭️'} {h.objetivo}</span>
                {h.adivinoId ? <strong>{ctx.nombre(h.adivinoId)}</strong> : null}
              </div>
            ))}
          </div>
        )}
      </>
    );
  }

  if (ronda.etapa === 'preparado') {
    return (
      <div className="panel center">
        <span className="furbo-fase-emoji">🗣️</span>
        {ctx.soyPendiente ? (
          <>
            <h2 className="title">¡Te toca describir, {describidor}!</h2>
            <p className="hint">
              Verás una palabra y 4 palabras prohibidas. Descríbela en voz alta sin decirlas. Tienes <strong>60 segundos</strong>.
            </p>
            <button type="button" className="big full" style={{ marginTop: '1rem' }} onClick={() => accion('empezar')}>
              ¡Empezar!
            </button>
          </>
        ) : (
          <>
            <h2 className="title">{describidor} va a describir</h2>
            <p className="hint">¡Preparaos para adivinar! El tiempo empezará cuando {describidor} esté listo.</p>
          </>
        )}
      </div>
    );
  }

  // jugando
  return (
    <>
      <Reloj restante={ctx.restante} total={ronda.totalMs} />
      {contadores}
      {ctx.soyPendiente && ronda.actual ? (
        <>
          <div className="furbo-palabra-card">
            <span className="furbo-tag">Describe esto</span>
            <h2>{ronda.actual.objetivo}</h2>
          </div>
          <p className="furbo-prohibidas-titulo">🚫 Palabras prohibidas</p>
          <div className="furbo-prohibidas">
            {ronda.actual.prohibidas.map((w) => (
              <span key={w} className="furbo-prohibida-chip">{w}</span>
            ))}
          </div>

          {!eligiendo ? (
            <div className="furbo-acciones-grid">
              <button type="button" className="big full" onClick={() => setEligiendo(true)}>✅ ¡Acertada!</button>
              <button type="button" className="secondary full" onClick={() => accion('pasar')}>⏭️ Pasar</button>
              <button type="button" className="secondary danger full" onClick={() => accion('prohibida')}>🚫 Dije una prohibida (−1)</button>
              <button type="button" className="secondary full" onClick={() => accion('terminar')}>Terminar mi turno</button>
            </div>
          ) : (
            <div className="panel">
              <p className="form-label" style={{ textAlign: 'center' }}>¿Quién la ha adivinado?</p>
              <div className="modal-players-grid">
                {ctx.jugadores.filter((j) => !j.ausente && j.id !== ronda.describidorId).map((j) => (
                  <button
                    key={j.id}
                    type="button"
                    className="btn-modal-player"
                    onClick={() => { setEligiendo(false); accion('acertada', { adivinoId: j.id }); }}
                  >
                    {j.nombre}
                  </button>
                ))}
              </div>
              <div style={{ textAlign: 'center', marginTop: '0.8rem' }}>
                <button type="button" className="btn-modal-cancel" onClick={() => setEligiendo(false)}>Cancelar</button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="panel center">
          <span className="furbo-fase-emoji">🗣️</span>
          <h2 className="title">{describidor} está describiendo...</h2>
          <p className="hint">¡Gritad vuestras respuestas! {describidor} marcará las acertadas.</p>
        </div>
      )}
    </>
  );
}

/* ----------------------------------------------------------------- Penaltis */
function Penaltis({ ronda, ctx }) {
  const tirador = ctx.nombre(ronda.tiradorId);

  if (ronda.etapa === 'revelado') {
    const gol = ronda.gol;
    return (
      <>
        <div className={`furbo-banner-resultado ${gol ? 'gol' : 'parada'}`}>
          {gol ? '⚽ ¡GOOOL!' : '🧤 ¡PARADA!'}
          <small>
            {gol
              ? `${tirador} marca desde ${ronda.zona === 'escuadra' ? 'la escuadra' : 'el centro'} y suma +${ronda.puntos}`
              : `${tirador} falla${ronda.zona ? '' : ' (sin tiempo para elegir)'}.`}
          </small>
        </div>
        {ronda.pregunta && (
          <>
            <div className="furbo-pregunta">
              <span className="furbo-tag">{ronda.zona === 'escuadra' ? 'A la escuadra' : 'Al centro'}</span>
              <h2>{ronda.pregunta}</h2>
            </div>
            <p className="furbo-respuesta-real">Respuesta: {ronda.opciones?.[ronda.correcta]}</p>
          </>
        )}
      </>
    );
  }

  if (ronda.etapa === 'elegir') {
    return (
      <>
        <Reloj restante={ctx.restante} total={ronda.totalMs} />
        <div className="panel center">
          <span className="furbo-fase-emoji">⚽</span>
          {ctx.soyPendiente ? (
            <>
              <h2 className="title">¡A chutar, {tirador}!</h2>
              <p className="hint">Elige dónde tirar antes de ver la pregunta.</p>
              <div className="furbo-zonas">
                <button type="button" className="furbo-zona-btn centro" onClick={() => ctx.onAccion({ tipo: 'tirar', jugadorId: ctx.actor, zona: 'centro' })}>
                  <span className="furbo-zona-emoji">🎯</span>
                  Al centro
                  <small>Pregunta fácil · 1 gol</small>
                </button>
                <button type="button" className="furbo-zona-btn escuadra" onClick={() => ctx.onAccion({ tipo: 'tirar', jugadorId: ctx.actor, zona: 'escuadra' })}>
                  <span className="furbo-zona-emoji">🥅</span>
                  A la escuadra
                  <small>Pregunta difícil · 3 goles</small>
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="title">{tirador} va a lanzar...</h2>
              <p className="hint">Está decidiendo si tira al centro o a la escuadra.</p>
            </>
          )}
        </div>
      </>
    );
  }

  // etapa 'pregunta'
  return (
    <>
      <div className="furbo-pregunta">
        <span className="furbo-tag">{ronda.zona === 'escuadra' ? 'A la escuadra · 3 goles' : 'Al centro · 1 gol'}</span>
        <h2>{ronda.pregunta}</h2>
      </div>
      <Reloj restante={ctx.restante} total={ronda.totalMs} />
      <div className="furbo-opciones">
        {ronda.opciones.map((op, i) => (
          <button
            key={i}
            type="button"
            className="furbo-opcion-btn"
            disabled={!ctx.soyPendiente}
            onClick={() => ctx.onAccion({ tipo: 'responder', jugadorId: ctx.actor, opcion: i })}
          >
            <span className="furbo-letra">{LETRAS[i]}</span>
            <span>{op}</span>
          </button>
        ))}
      </div>
      {!ctx.soyPendiente && <p className="hint center">{tirador} está respondiendo...</p>}
    </>
  );
}

/* ------------------------------------------------------------------- Final */
function Clasificacion({ jugadores }) {
  const ranking = [...jugadores].sort((a, b) => b.puntos - a.puntos);
  const maximo = ranking.length ? ranking[0].puntos : 0;
  return (
    <div className="scoreboard">
      {ranking.map((j, i) => {
        const lider = maximo > 0 && j.puntos === maximo;
        return (
          <div key={j.id} className={`score-row${lider ? ' first' : ''}`}>
            <span className="score-name">
              {lider ? <Icon name="crown" size={22} /> : <span className="pos">{i + 1}</span>}
              {j.nombre}{j.ausente ? ' (salió)' : ''}
            </span>
            <span className="score-pts">{j.puntos} pts</span>
          </div>
        );
      })}
    </div>
  );
}

/* --------------------------------------------------------------- Componente */
export default function FurboPartida({
  vista,
  viewerId = null,
  local = false,
  esHost = false,
  sostiene = null,
  setSostiene = () => {},
  onAccion,
  onTiempo,
  finalAcciones = null
}) {
  const ronda = vista.ronda;
  const info = FASES_INFO[vista.fase];

  // --- cuenta atrás: el servidor envía los ms restantes y aquí se descuentan entre consultas
  const [, setTic] = useState(0);
  const vistaRef = useRef(null);
  const recibidoRef = useRef(Date.now());
  if (vistaRef.current !== vista) {
    vistaRef.current = vista;
    recibidoRef.current = Date.now();
  }
  const hayReloj = ronda?.restanteMs != null;
  useEffect(() => {
    if (!hayReloj) return undefined;
    const id = setInterval(() => setTic((t) => t + 1), 250);
    return () => clearInterval(id);
  }, [hayReloj]);
  const restante = hayReloj ? Math.max(0, ronda.restanteMs - (Date.now() - recibidoRef.current)) : null;

  const claveRonda = ronda ? `${vista.faseIdx}-${vista.rondaNum}-${ronda.etapa}` : `${vista.faseIdx}-${vista.estado}`;

  // Modo local: al llegar a 0 se avisa al motor (en online lo resuelve el servidor)
  const enviadoRef = useRef(null);
  useEffect(() => {
    if (!local || restante == null || restante > 0) return;
    if (enviadoRef.current === claveRonda) return;
    enviadoRef.current = claveRonda;
    if (onTiempo) onTiempo();
  }, [local, restante, claveRonda, onTiempo]);

  // Modo local: en cada ronda nueva hay que volver a «pasar el móvil»
  useEffect(() => {
    if (local) setSostiene(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [local, vista.faseIdx, vista.rondaNum]);

  // --- quién tiene que actuar ahora
  const jugadores = vista.jugadores;
  const presentes = jugadores.filter((j) => !j.ausente);
  const nombre = (id) => jugadores.find((j) => j.id === id)?.nombre ?? '—';

  let pendientes = [];
  if (vista.estado === 'ronda' && ronda) {
    if ((ronda.tipo === 'vestuario' || ronda.tipo === 'quiniela') && ronda.etapa === 'respondiendo') {
      pendientes = presentes.filter((j) => !ronda.respondieron.includes(j.id)).map((j) => j.id);
    } else if (ronda.tipo === 'rebote') {
      pendientes = ronda.etapa === 'j1' ? [ronda.activoId] : ronda.etapa === 'rebote' ? [ronda.reboteId] : [];
    } else if (ronda.tipo === 'prorroga') {
      pendientes = ronda.etapa !== 'fin' ? [ronda.describidorId] : [];
    } else if (ronda.tipo === 'penaltis') {
      pendientes = ronda.etapa !== 'revelado' ? [ronda.tiradorId] : [];
    }
  }
  const actor = local ? sostiene : viewerId;
  const soyPendiente = pendientes.includes(actor);
  const hayGate = local && pendientes.length > 0 && !pendientes.includes(sostiene);

  const ctx = {
    local, actor, soyPendiente, nombre, jugadores, restante, claveRonda,
    onAccion: (a) => onAccion(a)
  };

  const continuar = () => onAccion({ tipo: 'continuar' });
  const saltar = () => onAccion({ tipo: 'saltar' });
  const finalizar = () => onAccion({ tipo: 'finalizar' });

  /* ---------------------------- marcador y cabecera (fases en curso) ----- */
  const cabecera = (
    <>
      <div className="hud">
        <span className="chip"><Icon name="flagFinish" size={18} />{info.emoji} {info.nombre}</span>
        {vista.estado !== 'intro' && (
          <span className="chip">Ronda {vista.rondaNum}/{vista.totalRondas}</span>
        )}
        <span className="chip">Fase {vista.faseIdx + 1}/{vista.fases.length}</span>
      </div>
      <div className="scoreboard-container" style={{ justifyContent: 'center', marginBottom: '0.8rem' }}>
        {jugadores.map((j) => (
          <div key={j.id} className={`score-pill ${j.ausente ? 'locked' : ''}`}>
            <span>{j.nombre}: <strong>{j.puntos} pts</strong></span>
          </div>
        ))}
      </div>
    </>
  );

  /* -------------------------------------------------------------- FINAL --- */
  if (vista.estado === 'fin') {
    const ranking = [...jugadores].sort((a, b) => b.puntos - a.puntos);
    const maximo = ranking.length ? ranking[0].puntos : 0;
    const ganadores = maximo > 0 ? ranking.filter((j) => j.puntos === maximo) : [];
    return (
      <section className="game">
        <div className="end-card">
          <span className="end-icon"><Icon name="crown" size={44} /></span>
          <h1 className="title">Final del partido</h1>
          <p className="final-score">
            {ganadores.length === 0
              ? 'Nadie ha conseguido puntos'
              : ganadores.length === 1
              ? <>¡Victoria para {ganadores[0].nombre} con {maximo} puntos!</>
              : <>Empate entre {ganadores.map((g) => g.nombre).join(', ')} con {maximo} puntos</>}
          </p>
          <Clasificacion jugadores={jugadores} />
        </div>
        {finalAcciones}
      </section>
    );
  }

  /* -------------------------------------------------------------- INTRO --- */
  if (vista.estado === 'intro') {
    const siguiente = vista.faseIdx + 1 < vista.fases.length ? FASES_INFO[vista.fases[vista.faseIdx + 1]].nombre : null;
    return (
      <section className="game">
        {cabecera}
        <div className="panel center">
          <span className="furbo-fase-emoji">{info.emoji}</span>
          <h2 className="title">{info.nombre}</h2>
          <p className="hint"><strong>{info.lema}</strong> · {vista.totalRondas} {vista.totalRondas === 1 ? 'ronda' : 'rondas'}</p>
          <ul className="furbo-reglas">
            {info.reglas.map((r, i) => (
              // eslint-disable-next-line react/no-danger
              <li key={i} dangerouslySetInnerHTML={{ __html: r }} />
            ))}
          </ul>
          {esHost ? (
            <button type="button" className="big full" onClick={continuar}>
              <Icon name="play" size={22} /> ¡Empezar {info.nombre}!
            </button>
          ) : (
            <p className="hint">Esperando a que el anfitrión empiece la fase...</p>
          )}
          {siguiente && <p className="hint small" style={{ marginTop: '0.8rem' }}>Después: {siguiente}</p>}
        </div>
        {esHost && (
          <button type="button" className="secondary danger full" style={{ marginTop: '1rem' }} onClick={finalizar}>
            <Icon name="flagFinish" size={18} /> Finalizar partida
          </button>
        )}
      </section>
    );
  }

  /* ------------------------------------------------------- RONDA / RESULTADO */
  const enResultado = vista.estado === 'resultado';
  let textoSiguiente;
  if (vista.rondaNum < vista.totalRondas) textoSiguiente = `Siguiente ronda (${vista.rondaNum + 1}/${vista.totalRondas})`;
  else if (vista.faseIdx + 1 < vista.fases.length) textoSiguiente = `Siguiente fase: ${FASES_INFO[vista.fases[vista.faseIdx + 1]].nombre}`;
  else textoSiguiente = 'Ver clasificación final';

  let contenido = null;
  if (ronda) {
    switch (ronda.tipo) {
      case 'vestuario': contenido = <Vestuario ronda={ronda} ctx={ctx} />; break;
      case 'rebote': contenido = <Rebote ronda={ronda} ctx={ctx} />; break;
      case 'quiniela': contenido = <Quiniela ronda={ronda} ctx={ctx} />; break;
      case 'prorroga': contenido = <Prorroga ronda={ronda} ctx={ctx} />; break;
      case 'penaltis': contenido = <Penaltis ronda={ronda} ctx={ctx} />; break;
      default: break;
    }
  }

  return (
    <section className="game">
      {cabecera}

      {hayGate ? (
        <Gate
          nombre={nombre(pendientes[0])}
          motivo={MOTIVO_GATE[ronda.tipo]}
          onAbrir={() => setSostiene(pendientes[0])}
        />
      ) : (
        contenido
      )}

      {enResultado && (
        <>
          <div style={{ marginTop: '1rem' }}>
            <Clasificacion jugadores={jugadores} />
          </div>
          <div className="actions">
            {esHost ? (
              <button type="button" onClick={continuar}>
                <Icon name="play" size={20} /> {textoSiguiente}
              </button>
            ) : (
              <p className="hint center" style={{ width: '100%' }}>Esperando al anfitrión...</p>
            )}
            {esHost && (
              <button type="button" className="secondary danger" onClick={finalizar}>
                <Icon name="flagFinish" size={20} /> Finalizar partida
              </button>
            )}
          </div>
        </>
      )}

      {!enResultado && esHost && (
        <button type="button" className="secondary full" style={{ marginTop: '1rem' }} onClick={saltar}>
          <Icon name="flag" size={18} /> Saltar turno
        </button>
      )}
    </section>
  );
}
