// client/src/games/Furbo/FurboPartida.jsx
// Pantalla de partida compartida por el modo local y el online, con el estilo de los juegos renovados:
// cabecera con degradado (fase, ronda, reloj y marcador), tarjetas blancas, botones en relieve y barra abajo.
// Recibe la «vista» que prepara el motor del servidor y envía acciones con onAccion.
import { useRegistrarPartida, ganadoresPorPuntos } from '../../lib/registros.js';
import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../components/Icon.jsx';
import { FASES_INFO } from './FurboInfo.js';
import './Furbo.css';

const LETRAS = ['A', 'B', 'C', 'D'];
const QUINIELA = ['1', 'X', '2'];
export const COLORES = ['#ef4444', '#2563eb', '#16a34a', '#f59e0b', '#9333ea', '#ec4899', '#0d9488', '#ea580c', '#475569', '#65a30d', '#0891b2', '#be123c'];
export const colorDe = (id) => COLORES[((Number(id) || 1) - 1) % COLORES.length];
const inicial = (n) => (n || '?').trim().charAt(0).toUpperCase();

export function Avatar({ id, nombre, grande = false }) {
  return <span className={`fbp-avatar${grande ? ' grande' : ''}`} style={{ '--c': colorDe(id) }}>{inicial(nombre)}</span>;
}

/* ------------------------------------------------------------------ piezas */
function Reloj({ restante, total }) {
  if (restante == null) return null;
  const seg = Math.ceil(restante / 1000);
  const pct = total ? Math.max(0, Math.min(100, (restante / total) * 100)) : 100;
  return (
    <div className={`fbp-reloj ${seg <= 5 ? 'bajo' : ''}`} role="timer">
      <Icon name="clock" size={15} />
      <div className="fbp-reloj-barra"><div className="fbp-reloj-fill" style={{ width: `${pct}%` }} /></div>
      <strong>{seg} s</strong>
    </div>
  );
}

function Pregunta({ etiqueta, texto }) {
  return (
    <div className="fbp-tarjeta fbp-pregunta">
      <p className="fbp-etiqueta">{etiqueta}</p>
      <h2>{texto}</h2>
    </div>
  );
}

function Aviso({ tipo = 'info', children }) {
  return <div className={`fbp-aviso ${tipo}`}>{children}</div>;
}

function Gate({ id, nombre, motivo, onAbrir }) {
  return (
    <div className="fbp-tarjeta fbp-gate">
      <Avatar id={id} nombre={nombre} grande />
      <p className="fbp-etiqueta centrada">Pasa el móvil</p>
      <h2>Le toca a {nombre}</h2>
      <p className="fbp-texto">{motivo}</p>
      <button type="button" className="fbp-boton grande" onClick={onAbrir}>
        <Icon name="check" size={20} strokeWidth={2.5} /> Soy {nombre}
      </button>
    </div>
  );
}

function ChipsEspera({ jugadores, respondieron }) {
  return (
    <div className="fbp-espera">
      {jugadores.filter((j) => !j.ausente).map((j) => {
        const listo = respondieron.includes(j.id);
        return (
          <span key={j.id} className={`fbp-espera-chip ${listo ? 'listo' : ''}`}>
            <Avatar id={j.id} nombre={j.nombre} /> {j.nombre} {listo ? '✓' : '…'}
          </span>
        );
      })}
    </div>
  );
}

const MOTIVO_GATE = {
  vestuario: 'Va a escribir su respuesta en secreto. Que nadie más mire la pantalla.',
  quiniela: 'Va a elegir su opción en secreto. Que nadie más mire la pantalla.',
  rebote: 'Es su turno de responder.',
  prorroga: 'Es quien describe: la pantalla mostrará la palabra, ¡que nadie más la vea!',
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
        <Pregunta etiqueta="Vestuario · respuestas" texto={ronda.pregunta} />
        <div className="fbp-tarjeta">
          {ronda.saltada && <Aviso>Ronda saltada por el anfitrión.</Aviso>}
          {!ronda.saltada && ordenados.length === 0 && <Aviso tipo="mal">Nadie llegó a responder.</Aviso>}
          <div className="fbp-grupos">
            {ordenados.map((g, i) => {
              const gana = g.length > 1;
              return (
                <div key={i} className={`fbp-grupo ${gana ? 'gana' : ''}`}>
                  <p className="fbp-grupo-titulo">{gana ? `¡Coinciden ${g.length}! +${puntos} cada uno` : 'Sin pareja'}</p>
                  {g.map((id) => (
                    <div key={id} className="fbp-grupo-fila">
                      <span><Avatar id={id} nombre={ctx.nombre(id)} /> {ctx.nombre(id)}</span>
                      <strong>«{ronda.respuestas?.[id]}»</strong>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
          {ganadores.length === 0 && ordenados.length > 0 && <Aviso tipo="mal">Nadie ha coincidido en esta ronda.</Aviso>}
        </div>
      </>
    );
  }

  return (
    <>
      <Pregunta etiqueta="Vestuario · escribe un nombre" texto={ronda.pregunta} />
      <div className="fbp-tarjeta">
        <Reloj restante={ctx.restante} total={ronda.totalMs} />
        {ctx.soyPendiente ? (
          <form onSubmit={enviar}>
            <input
              autoFocus
              type="text"
              className="fbp-input"
              placeholder="Escribe un nombre…"
              maxLength={40}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
            />
            <button type="submit" className="fbp-boton" style={{ marginTop: '0.7rem' }} disabled={!texto.trim()}>
              <Icon name="check" size={20} strokeWidth={2.5} /> Enviar respuesta
            </button>
            <p className="fbp-pista">
              {ctx.local ? `${ctx.nombre(ctx.actor)}: que nadie más vea tu respuesta.` : 'No hace falta acertar: se trata de coincidir con alguien.'}
            </p>
          </form>
        ) : (
          <Aviso tipo="bien">Respuesta enviada. Esperando al resto…</Aviso>
        )}
        <ChipsEspera jugadores={ctx.jugadores} respondieron={ronda.respondieron} />
      </div>
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

  const cabecera = <Pregunta etiqueta={`Rebote · turno de ${ctx.nombre(ronda.activoId)}`} texto={ronda.pregunta} />;

  if (ronda.etapa === 'revelado') {
    const res = ronda.resultado || {};
    let mensaje;
    let tipo = 'mal';
    if (res.exacto) {
      mensaje = `¡${ctx.nombre(ronda.activoId)} lo clava! +${res.ptsActivo}`;
      tipo = 'bien';
    } else if (res.direccionAcertada === true) {
      mensaje = `${ctx.nombre(ronda.reboteId)} acierta el rebote. +${res.ptsRebote}`;
      tipo = 'bien';
    } else if (res.direccionAcertada === false) {
      mensaje = `${ctx.nombre(ronda.reboteId)} falla el rebote. Nadie suma.`;
    } else if (res.saltada) {
      mensaje = 'Ronda saltada por el anfitrión.';
      tipo = 'info';
    } else if (res.ausente) {
      mensaje = 'Un jugador ha abandonado la partida. Nadie suma.';
      tipo = 'info';
    } else if (res.tiempoAgotado) {
      mensaje = 'Se acabó el tiempo. Nadie suma.';
    } else {
      mensaje = 'Nadie suma en esta ronda.';
    }
    return (
      <>
        {cabecera}
        <div className="fbp-tarjeta fbp-centro">
          <p className="fbp-etiqueta centrada">Respuesta correcta</p>
          <p className="fbp-dato">{ronda.correcta}</p>
          {res.intento != null && !res.exacto && <p className="fbp-texto">{ctx.nombre(ronda.activoId)} dijo <strong>{res.intento}</strong>.</p>}
          <Aviso tipo={tipo}>{mensaje}</Aviso>
        </div>
      </>
    );
  }

  if (ronda.etapa === 'j1') {
    return (
      <>
        {cabecera}
        <div className="fbp-tarjeta">
          <Reloj restante={ctx.restante} total={ronda.totalMs} />
          {ctx.soyPendiente ? (
            <form onSubmit={enviar}>
              <p className="fbp-texto">Di el número exacto (+3). Si fallas, rebota a {ronda.reboteId ? ctx.nombre(ronda.reboteId) : 'otro jugador'}.</p>
              <input
                autoFocus
                type="text"
                inputMode="numeric"
                className="fbp-input numero"
                placeholder={ronda.esAnio ? 'Año…' : 'Número…'}
                maxLength={7}
                value={num}
                onChange={(e) => setNum(e.target.value.replace(/[^\d]/g, ''))}
              />
              <button type="submit" className="fbp-boton" style={{ marginTop: '0.7rem' }} disabled={!num.trim()}>
                <Icon name="check" size={20} strokeWidth={2.5} /> Responder
              </button>
            </form>
          ) : (
            <Aviso>Responde <strong>{ctx.nombre(ronda.activoId)}</strong>. Si falla, rebotará a {ronda.reboteId ? ctx.nombre(ronda.reboteId) : 'otro jugador'}.</Aviso>
          )}
        </div>
      </>
    );
  }

  // etapa 'rebote'
  const menos = ronda.esAnio ? '⬅️ Antes' : '⬇️ Menos';
  const mas = ronda.esAnio ? 'Después ➡️' : '⬆️ Más';
  return (
    <>
      {cabecera}
      <div className="fbp-tarjeta">
        <Reloj restante={ctx.restante} total={ronda.totalMs} />
        <Aviso tipo="mal">{ctx.nombre(ronda.activoId)} ha dicho <strong>{ronda.intento}</strong> y ha fallado. ¡Rebote!</Aviso>
        {ctx.soyPendiente ? (
          <>
            <p className="fbp-texto"><strong>{ctx.nombre(ronda.reboteId)}</strong>, ¿el dato real es {ronda.esAnio ? 'anterior o posterior' : 'menor o mayor'} que {ronda.intento}? (+1)</p>
            <div className="fbp-dos">
              <button type="button" className="fbp-boton secundario grande" onClick={() => ctx.onAccion({ tipo: 'responder', jugadorId: ctx.actor, direccion: 'menos' })}>{menos}</button>
              <button type="button" className="fbp-boton secundario grande" onClick={() => ctx.onAccion({ tipo: 'responder', jugadorId: ctx.actor, direccion: 'mas' })}>{mas}</button>
            </div>
          </>
        ) : (
          <p className="fbp-texto">Esperando a que <strong>{ctx.nombre(ronda.reboteId)}</strong> responda…</p>
        )}
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- Quiniela */
function Quiniela({ ronda, ctx }) {
  const rev = ronda.etapa === 'revelado';
  const respuestas = ronda.respuestas || {};
  const quienElegio = (i) => Object.entries(respuestas).filter(([, op]) => op === i).map(([id]) => Number(id));

  return (
    <>
      <Pregunta etiqueta="Quiniela 1X2" texto={ronda.pregunta} />
      <div className="fbp-tarjeta">
        {!rev && <Reloj restante={ctx.restante} total={ronda.totalMs} />}
        <div className="fbp-opciones">
          {ronda.opciones.map((op, i) => {
            let clase = '';
            if (rev) clase = i === ronda.correcta ? 'correcta' : (quienElegio(i).length ? 'incorrecta' : 'apagada');
            else if (ronda.miRespuesta === i) clase = 'elegida';
            const quien = rev ? quienElegio(i) : [];
            return (
              <button
                key={i}
                type="button"
                className={`fbp-opcion ${clase}`}
                disabled={rev || !ctx.soyPendiente}
                onClick={() => ctx.onAccion({ tipo: 'responder', jugadorId: ctx.actor, opcion: i })}
              >
                <span className="fbp-letra">{QUINIELA[i]}</span>
                <span className="fbp-opcion-texto">{op}</span>
                {quien.length > 0 && <span className="fbp-quien">{quien.map((id) => <Avatar key={id} id={id} nombre={ctx.nombre(id)} />)}</span>}
              </button>
            );
          })}
        </div>
        {rev ? (
          ronda.saltada ? <Aviso>Ronda saltada por el anfitrión.</Aviso>
            : ronda.resultado?.ganadores?.length > 0
              ? <Aviso tipo="bien">Aciertan {ronda.resultado.ganadores.map((id) => ctx.nombre(id)).join(', ')} (+{ronda.resultado.puntos})</Aviso>
              : <Aviso tipo="mal">Nadie ha acertado.</Aviso>
        ) : (
          <>
            {!ctx.soyPendiente && ronda.respondieron.includes(ctx.actor) && <Aviso tipo="bien">Elección enviada. Esperando al resto…</Aviso>}
            <ChipsEspera jugadores={ctx.jugadores} respondieron={ronda.respondieron} />
          </>
        )}
      </div>
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
    <div className="fbp-contadores">
      <span className="bien">✅ {ronda.aciertos}</span>
      <span>⏭️ {ronda.pasadas}</span>
      <span className="mal">🚫 {ronda.faltas}</span>
    </div>
  );

  if (ronda.etapa === 'fin') {
    return (
      <div className="fbp-tarjeta">
        <p className="fbp-etiqueta">Prórroga · turno de {describidor}</p>
        <h2 className="fbp-titulo">{ronda.saltada ? 'Turno saltado' : 'Fin del turno'}</h2>
        {contadores}
        {ronda.historial?.length > 0 && (
          <div className="fbp-historial">
            {ronda.historial.map((h, i) => (
              <div key={i} className={`fbp-grupo-fila ${h.resultado}`}>
                <span>{h.resultado === 'acierto' ? '✅' : h.resultado === 'falta' ? '🚫' : '⏭️'} {h.objetivo}</span>
                {h.adivinoId ? <strong>{ctx.nombre(h.adivinoId)}</strong> : null}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (ronda.etapa === 'preparado') {
    return (
      <div className="fbp-tarjeta fbp-centro">
        <Avatar id={ronda.describidorId} nombre={describidor} grande />
        {ctx.soyPendiente ? (
          <>
            <h2 className="fbp-titulo">¡Te toca describir, {describidor}!</h2>
            <p className="fbp-texto">Verás una palabra y sus palabras prohibidas. Descríbela en voz alta sin decirlas. Tienes <strong>60 segundos</strong>.</p>
            <button type="button" className="fbp-boton grande" onClick={() => accion('empezar')}>
              <Icon name="play" size={20} /> ¡Empezar!
            </button>
          </>
        ) : (
          <>
            <h2 className="fbp-titulo">{describidor} va a describir</h2>
            <p className="fbp-texto">¡Preparaos para adivinar! El tiempo empieza cuando {describidor} esté listo.</p>
          </>
        )}
      </div>
    );
  }

  // jugando
  return (
    <div className="fbp-tarjeta">
      <Reloj restante={ctx.restante} total={ronda.totalMs} />
      {contadores}
      {ctx.soyPendiente && ronda.actual ? (
        <>
          <div className="fbp-palabra">
            <p className="fbp-etiqueta centrada">Describe</p>
            <h2>{ronda.actual.objetivo}</h2>
          </div>
          <p className="fbp-etiqueta centrada" style={{ marginTop: '0.8rem' }}>🚫 Prohibidas</p>
          <div className="fbp-prohibidas">
            {ronda.actual.prohibidas.map((w) => <span key={w}>{w}</span>)}
          </div>
          {!eligiendo ? (
            <div className="fbp-acciones">
              <button type="button" className="fbp-boton grande" onClick={() => setEligiendo(true)}>✅ ¡Acertada!</button>
              <div className="fbp-dos">
                <button type="button" className="fbp-boton secundario" onClick={() => accion('pasar')}>⏭️ Pasar</button>
                <button type="button" className="fbp-boton peligro" onClick={() => accion('prohibida')}>🚫 Dije una (−1)</button>
              </div>
              <button type="button" className="fbp-enlace oscuro" onClick={() => accion('terminar')}>Terminar mi turno</button>
            </div>
          ) : (
            <div className="fbp-elegir">
              <p className="fbp-etiqueta centrada">¿Quién la ha adivinado?</p>
              <div className="fbp-jugadores-grid">
                {ctx.jugadores.filter((j) => !j.ausente && j.id !== ronda.describidorId).map((j) => (
                  <button key={j.id} type="button" className="fbp-jugador-btn" onClick={() => { setEligiendo(false); accion('acertada', { adivinoId: j.id }); }}>
                    <Avatar id={j.id} nombre={j.nombre} /> {j.nombre}
                  </button>
                ))}
              </div>
              <button type="button" className="fbp-enlace oscuro" onClick={() => setEligiendo(false)}>Cancelar</button>
            </div>
          )}
        </>
      ) : (
        <div className="fbp-centro">
          <span className="fbp-emoji">🗣️</span>
          <h2 className="fbp-titulo">{describidor} está describiendo…</h2>
          <p className="fbp-texto">¡Gritad vuestras respuestas! {describidor} marcará quién acierta.</p>
        </div>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------- Penaltis */
function Penaltis({ ronda, ctx }) {
  const tirador = ctx.nombre(ronda.tiradorId);

  if (ronda.etapa === 'revelado') {
    const gol = ronda.gol;
    return (
      <>
        <div className={`fbp-banner ${gol ? 'gol' : 'parada'}`}>
          <strong>{gol ? '⚽ ¡GOOOL!' : '🧤 ¡PARADA!'}</strong>
          <span>
            {gol
              ? `${tirador} marca ${ronda.zona === 'escuadra' ? 'por la escuadra' : 'por el centro'} y suma +${ronda.puntos}`
              : ronda.saltada ? 'Turno saltado por el anfitrión.' : `${tirador} falla${ronda.zona ? '' : ' (no eligió a tiempo)'}.`}
          </span>
        </div>
        {ronda.pregunta && (
          <div className="fbp-tarjeta">
            <p className="fbp-etiqueta">{ronda.zona === 'escuadra' ? 'A la escuadra' : 'Al centro'}</p>
            <h2 className="fbp-titulo izquierda">{ronda.pregunta}</h2>
            <div className="fbp-opciones">
              {ronda.opciones.map((op, i) => (
                <div key={i} className={`fbp-opcion ${i === ronda.correcta ? 'correcta' : i === ronda.respuesta ? 'incorrecta' : 'apagada'}`}>
                  <span className="fbp-letra">{LETRAS[i]}</span><span className="fbp-opcion-texto">{op}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </>
    );
  }

  if (ronda.etapa === 'elegir') {
    return (
      <div className="fbp-tarjeta fbp-centro">
        <Reloj restante={ctx.restante} total={ronda.totalMs} />
        <div className="fbp-porteria" aria-hidden="true"><span>🧤</span></div>
        {ctx.soyPendiente ? (
          <>
            <h2 className="fbp-titulo">¡A chutar, {tirador}!</h2>
            <p className="fbp-texto">Elige dónde tirar antes de ver la pregunta.</p>
            <div className="fbp-dos">
              <button type="button" className="fbp-zona" onClick={() => ctx.onAccion({ tipo: 'tirar', jugadorId: ctx.actor, zona: 'centro' })}>
                <span className="fbp-zona-emoji">🎯</span><strong>Al centro</strong><small>Pregunta fácil · +1</small>
              </button>
              <button type="button" className="fbp-zona escuadra" onClick={() => ctx.onAccion({ tipo: 'tirar', jugadorId: ctx.actor, zona: 'escuadra' })}>
                <span className="fbp-zona-emoji">🥅</span><strong>A la escuadra</strong><small>Pregunta difícil · +3</small>
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="fbp-titulo">{tirador} coloca el balón…</h2>
            <p className="fbp-texto">Está decidiendo si tira al centro o a la escuadra.</p>
          </>
        )}
      </div>
    );
  }

  // etapa 'pregunta'
  return (
    <>
      <Pregunta etiqueta={ronda.zona === 'escuadra' ? `A la escuadra · +3 · ${tirador}` : `Al centro · +1 · ${tirador}`} texto={ronda.pregunta} />
      <div className="fbp-tarjeta">
        <Reloj restante={ctx.restante} total={ronda.totalMs} />
        <div className="fbp-opciones">
          {ronda.opciones.map((op, i) => (
            <button
              key={i}
              type="button"
              className="fbp-opcion"
              disabled={!ctx.soyPendiente}
              onClick={() => ctx.onAccion({ tipo: 'responder', jugadorId: ctx.actor, opcion: i })}
            >
              <span className="fbp-letra">{LETRAS[i]}</span>
              <span className="fbp-opcion-texto">{op}</span>
            </button>
          ))}
        </div>
        {!ctx.soyPendiente && <p className="fbp-pista">{tirador} está respondiendo…</p>}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------- Final */
function Podio({ jugadores, yoId }) {
  const orden = [...jugadores].sort((a, b) => b.puntos - a.puntos);
  const maximo = orden[0]?.puntos ?? 0;
  const ganadores = maximo > 0 ? orden.filter((j) => j.puntos === maximo) : [];
  const top = orden.slice(0, 3);
  const alturas = ['primero', 'segundo', 'tercero'];
  const colocacion = top.length === 3 ? [top[1], top[0], top[2]] : top.length === 2 ? [top[1], top[0]] : top;
  return (
    <div className="fbp-tarjeta fbp-centro">
      <p className="fbp-etiqueta centrada">Final del partido</p>
      <h2 className="fbp-ganador">
        {ganadores.length === 0 ? 'Nadie ha puntuado' : ganadores.length > 1 ? `¡Empate entre ${ganadores.map((g) => g.nombre).join(' y ')}!` : `¡Gana ${ganadores[0].nombre}!`}
      </h2>
      {maximo > 0 && <p className="fbp-texto">Con <strong>{maximo} puntos</strong>.</p>}
      <div className="fbp-podio">
        {colocacion.map((j) => {
          // con empate, mismo puesto (antes uno salía 1.º y otro 2.º con los mismos puntos)
          const puesto = orden.filter((o) => o.puntos > j.puntos).length;
          return (
            <div key={j.id} className={`fbp-podio-col ${alturas[puesto]}`} style={{ '--c': colorDe(j.id) }}>
              <Avatar id={j.id} nombre={j.nombre} grande />
              <span className="fbp-podio-nombre">{j.nombre}{j.id === yoId ? ' (tú)' : ''}</span>
              <span className="fbp-podio-pts">{j.puntos} pts</span>
              <span className="fbp-podio-base">{puesto + 1}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Clasificacion({ jugadores, yoId, deltas = null }) {
  const ranking = [...jugadores].sort((a, b) => b.puntos - a.puntos);
  const maximo = ranking[0]?.puntos ?? 0;
  return (
    <ol className="fbp-ranking">
      {ranking.map((j, i) => (
        <li key={j.id} className={maximo > 0 && j.puntos === maximo ? 'lider' : ''}>
          <span className="fbp-pos">{ranking.filter((o) => o.puntos > j.puntos).length + 1}</span>
          <Avatar id={j.id} nombre={j.nombre} />
          <span className="fbp-ranking-nombre">{j.nombre}{j.id === yoId ? ' (tú)' : ''}{j.ausente ? ' · salió' : ''}</span>
          {deltas && deltas[j.id] ? <span className={`fbp-delta ${deltas[j.id] > 0 ? 'mas' : 'menos'}`}>{deltas[j.id] > 0 ? '+' : ''}{deltas[j.id]}</span> : null}
          <strong>{j.puntos}</strong>
        </li>
      ))}
    </ol>
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
  onSalir,
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
  const hayReloj = ronda?.restanteMs != null && vista.estado === 'ronda';
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

  // Puntos al empezar cada ronda, para mostrar lo que ha sumado cada uno al terminarla
  const inicioRonda = useRef({ clave: null, puntos: {} });
  const claveBase = `${vista.faseIdx}-${vista.rondaNum}`;
  if (vista.estado === 'ronda' && inicioRonda.current.clave !== claveBase) {
    inicioRonda.current = { clave: claveBase, puntos: Object.fromEntries(vista.jugadores.map((j) => [j.id, j.puntos])) };
  }
  const deltas = vista.estado === 'resultado' && inicioRonda.current.clave === claveBase
    ? Object.fromEntries(vista.jugadores.map((j) => [j.id, j.puntos - (inicioRonda.current.puntos[j.id] ?? j.puntos)]))
    : null;

  // --- quién tiene que actuar ahora
  const jugadores = vista.jugadores;
  const presentes = jugadores.filter((j) => !j.ausente);
  const nombre = (id) => jugadores.find((j) => j.id === id)?.nombre ?? '—';

  let pendientes = [];
  let turno = null;
  if (vista.estado === 'ronda' && ronda) {
    if ((ronda.tipo === 'vestuario' || ronda.tipo === 'quiniela') && ronda.etapa === 'respondiendo') {
      pendientes = presentes.filter((j) => !ronda.respondieron.includes(j.id)).map((j) => j.id);
    } else if (ronda.tipo === 'rebote') {
      pendientes = ronda.etapa === 'j1' ? [ronda.activoId] : ronda.etapa === 'rebote' ? [ronda.reboteId] : [];
      turno = pendientes[0] ?? null;
    } else if (ronda.tipo === 'prorroga') {
      pendientes = ronda.etapa !== 'fin' ? [ronda.describidorId] : [];
      turno = ronda.describidorId;
    } else if (ronda.tipo === 'penaltis') {
      pendientes = ronda.etapa !== 'revelado' ? [ronda.tiradorId] : [];
      turno = ronda.tiradorId;
    }
  }
  const actor = local ? sostiene : viewerId;
  const soyPendiente = pendientes.includes(actor);
  const hayGate = local && pendientes.length > 0 && !pendientes.includes(sostiene);

  const ctx = { local, actor, soyPendiente, nombre, jugadores, restante, claveRonda, onAccion: (a) => onAccion(a) };

  const continuar = () => onAccion({ tipo: 'continuar' });
  const saltar = () => onAccion({ tipo: 'saltar' });
  const finalizar = () => onAccion({ tipo: 'finalizar' });

  const fin = vista.estado === 'fin';
  // Salón de la fama: se guarda la partida al llegar a la pantalla final
  useRegistrarPartida('furbo', fin ? ganadoresPorPuntos((jugadores || []).filter((j) => !j.fuera && !j.abandonado).map((j) => ({ nombre: j.nombre, puntos: j.puntos ?? null }))) : null);
  const maximo = Math.max(0, ...jugadores.map((j) => j.puntos));

  /* ---------------------------------------------------------- cabecera --- */
  const hero = (
    <header className={`fbp-hero ${fin ? 'fin' : ''}`}>
      <span className="fbp-campo" aria-hidden="true" />
      <div className="fbp-hero-top">
        <button type="button" className="fbp-salir" onClick={onSalir}>
          <Icon name="door" size={15} /> Salir
        </button>
        <div className="fbp-chips">
          {!fin && <span className="fbp-chip">Fase {vista.faseIdx + 1}/{vista.fases.length}</span>}
          {!fin && vista.estado !== 'intro' && <span className="fbp-chip">Ronda {vista.rondaNum}/{vista.totalRondas}</span>}
          {restante != null && <span className={`fbp-chip ${restante <= 5000 ? 'urgente' : ''}`}><Icon name="clock" size={13} /> {Math.ceil(restante / 1000)} s</span>}
        </div>
      </div>
      <p className="fbp-hero-etiqueta">{fin ? 'Pitido final' : info.lema}</p>
      <h1 className="fbp-hero-titulo">{fin ? '🏆 Clasificación' : `${info.emoji} ${info.nombre}`}</h1>
      <div className="fbp-marcador">
        {jugadores.map((j) => (
          <span key={j.id} className={`fbp-marca${j.ausente ? ' fuera' : ''}${turno === j.id ? ' turno' : ''}${j.id === viewerId ? ' yo' : ''}${maximo > 0 && j.puntos === maximo ? ' lider' : ''}`}>
            <Avatar id={j.id} nombre={j.nombre} />
            <span className="fbp-marca-nombre">{j.nombre}</span>
            <strong>{j.puntos}</strong>
            {deltas && deltas[j.id] ? <em className={deltas[j.id] > 0 ? 'mas' : 'menos'}>{deltas[j.id] > 0 ? '+' : ''}{deltas[j.id]}</em> : null}
          </span>
        ))}
      </div>
    </header>
  );

  /* -------------------------------------------------------------- FINAL --- */
  if (fin) {
    return (
      <section className="game fbp-escena">
        {hero}
        <Podio jugadores={jugadores} yoId={viewerId} />
        <div className="fbp-tarjeta">
          <p className="fbp-etiqueta">Clasificación</p>
          <Clasificacion jugadores={jugadores} yoId={viewerId} />
        </div>
        {finalAcciones}
      </section>
    );
  }

  /* -------------------------------------------------------------- INTRO --- */
  if (vista.estado === 'intro') {
    const siguiente = vista.faseIdx + 1 < vista.fases.length ? FASES_INFO[vista.fases[vista.faseIdx + 1]] : null;
    return (
      <section className="game fbp-escena">
        {hero}
        <div className="fbp-tarjeta">
          <div className="fbp-intro-cab">
            <span className="fbp-intro-emoji">{info.emoji}</span>
            <div>
              <p className="fbp-etiqueta">Fase {vista.faseIdx + 1} · {vista.totalRondas} {vista.totalRondas === 1 ? 'ronda' : 'rondas'}</p>
              <h2 className="fbp-titulo izquierda">{info.nombre}</h2>
            </div>
          </div>
          <ul className="fbp-reglas">
            {info.reglas.map((r, i) => (
              // eslint-disable-next-line react/no-danger
              <li key={i} dangerouslySetInnerHTML={{ __html: r }} />
            ))}
          </ul>
          {siguiente && <p className="fbp-pista">Después: {siguiente.emoji} {siguiente.nombre}</p>}
        </div>
        <div className="fbp-barra">
          {esHost ? (
            <>
              <button type="button" className="fbp-boton grande" onClick={continuar}>
                <Icon name="play" size={22} /> ¡Empezar {info.nombre}!
              </button>
              <button type="button" className="fbp-enlace" onClick={finalizar}>
                <Icon name="flagFinish" size={15} /> Terminar el partido ahora
              </button>
            </>
          ) : (
            <p className="fbp-esperando">⏳ Esperando a que el anfitrión empiece la fase…</p>
          )}
        </div>
      </section>
    );
  }

  /* ------------------------------------------------------- RONDA / RESULTADO */
  const enResultado = vista.estado === 'resultado';
  let textoSiguiente;
  if (vista.rondaNum < vista.totalRondas) textoSiguiente = `Siguiente ronda (${vista.rondaNum + 1}/${vista.totalRondas})`;
  else if (vista.faseIdx + 1 < vista.fases.length) textoSiguiente = `Siguiente fase: ${FASES_INFO[vista.fases[vista.faseIdx + 1]].nombre}`;
  else textoSiguiente = 'Ver la clasificación final';

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
    <section className="game fbp-escena">
      {hero}

      {hayGate ? (
        <Gate id={pendientes[0]} nombre={nombre(pendientes[0])} motivo={MOTIVO_GATE[ronda.tipo]} onAbrir={() => setSostiene(pendientes[0])} />
      ) : contenido}

      {enResultado && (
        <div className="fbp-tarjeta">
          <p className="fbp-etiqueta">Clasificación</p>
          <Clasificacion jugadores={jugadores} yoId={viewerId} deltas={deltas} />
        </div>
      )}

      <div className={`fbp-barra${enResultado ? '' : ' estatica'}`}>
        {enResultado && (esHost ? (
          <>
            <button type="button" className="fbp-boton grande" onClick={continuar}>
              <Icon name="play" size={20} /> {textoSiguiente}
            </button>
            <button type="button" className="fbp-enlace" onClick={finalizar}>
              <Icon name="flagFinish" size={15} /> Terminar el partido ahora
            </button>
          </>
        ) : (
          <p className="fbp-esperando">⏳ Esperando al anfitrión…</p>
        ))}
        {!enResultado && esHost && (
          <button type="button" className="fbp-enlace" onClick={saltar}>
            <Icon name="forward" size={15} /> Saltar esta ronda
          </button>
        )}
      </div>
    </section>
  );
}
