// client/src/games/Golpe/Vistas.jsx
// Pantallas de «El Golpe» con el estilo de los juegos renovados.
// Reciben `v` (vista de un jugador que genera engine.vistaDe) y `enviar(tipo, datos)`.
import { useRegistrarPartida, resultadoDesdeFin } from '../../lib/registros.js';
import React, { useEffect, useRef, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import { ESCENARIOS, ESTADOS, OBJETIVOS, PUNTOS, AJUSTES } from './engine.js';
import './Golpe.css';

export const COLORES = ['#ef4444', '#2563eb', '#16a34a', '#f59e0b', '#9333ea', '#ec4899', '#0d9488', '#ea580c'];
export const colorDe = (id) => COLORES[((Number(id) || 1) - 1) % COLORES.length];
const inicial = (n) => (n || '?').trim().charAt(0).toUpperCase();

export function Avatar({ id, nombre, grande = false }) {
  return <span className={`gpp-avatar${grande ? ' grande' : ''}`} style={{ '--c': colorDe(id) }}>{inicial(nombre)}</span>;
}

function useAhora(activo) {
  const [, setT] = useState(0);
  useEffect(() => {
    if (!activo) return undefined;
    const i = setInterval(() => setT((x) => x + 1), 500);
    return () => clearInterval(i);
  }, [activo]);
  return Date.now();
}

const escDe = (v) => ESCENARIOS.find((e) => e.id === v.escenario);
const FASES = { briefing: 'El encargo', plan: 'Traza tu plan', debate: 'El debate', voto: 'La votación', resolucion: 'La hora de la verdad' };

// ---------------------------------------------------------------- Cabecera
function Hero({ v, offset = 0, onSalir, etiqueta, titulo, clase = '' }) {
  const ahora = useAhora(Boolean(v.limite)) + offset;
  const resto = v.limite ? Math.max(0, v.limite - ahora) : null;
  const esc = escDe(v);
  const listos = v.fase === 'resolucion' || v.fase === 'fin' ? [] : v.jugadores.filter((j) => !v.faltan.includes(j.id)).map((j) => j.id);
  return (
    <header className={`gpp-hero ${clase}`}>
      <span className="gpp-plano" aria-hidden="true" />
      <div className="gpp-hero-top">
        <button type="button" className="gpp-salir" onClick={onSalir}><Icon name="door" size={15} /> Salir</button>
        <div className="gpp-chips">
          {v.fase !== 'fin' && <span className="gpp-chip">{esc?.e} Misión {v.mision}/{v.misiones}</span>}
          {resto != null && v.fase !== 'fin' && <span className={`gpp-chip${resto <= 10000 ? ' urgente' : ''}`}><Icon name="clock" size={13} /> {Math.floor(Math.ceil(resto / 1000) / 60)}:{String(Math.ceil(resto / 1000) % 60).padStart(2, '0')}</span>}
        </div>
      </div>
      <p className="gpp-hero-etiqueta">{etiqueta}</p>
      <h1 className="gpp-hero-titulo">{titulo}</h1>
      <div className="gpp-marcador">
        {[...v.jugadores].sort((a, b) => b.puntos - a.puntos).map((j) => (
          <span key={j.id} className={`gpp-marca${j.id === v.yo?.id ? ' yo' : ''}${j.fuera ? ' fuera' : ''}`}>
            <Avatar id={j.id} nombre={j.nombre} />
            <span className="gpp-marca-nombre">{j.nombre}</span>
            <strong>{j.puntos}</strong>
            {listos.includes(j.id) && <b>✓</b>}
          </span>
        ))}
      </div>
    </header>
  );
}

// ---------------------------------------------------------------- Piezas
function Mision({ v, compacta = false }) {
  const esc = escDe(v);
  return (
    <div className="gpp-tarjeta gpp-mision">
      <div className="gpp-mision-cab">
        <span className="gpp-mision-e">{esc.e}</span>
        <div><p className="gpp-etiqueta">Misión en {esc.lugar}</p><h2>{esc.nombre}</h2></div>
      </div>
      {!compacta && <p className="gpp-texto">{esc.intro}</p>}
      <ul className="gpp-publicas">{esc.publicas.map((c) => <li key={c}>📌 {c}</li>)}</ul>
    </div>
  );
}

function MisPistas({ v, titulo = '🔎 Lo que sabes (solo tú)' }) {
  return (
    <div className="gpp-tarjeta">
      <p className="gpp-etiqueta">{titulo}</p>
      <div className="gpp-pistas">
        {v.yo.pistas.map((p) => (
          <div key={`${p.paso}-${p.opcion}`} className={`gpp-indicio ${p.estado}`}>
            <span>{ESTADOS[p.estado].e}</span>
            <div><small>{escDe(v).pasos[p.paso].nombre}</small><p>{p.texto}</p></div>
          </div>
        ))}
      </div>
      <p className="gpp-nota">En el debate puedes contar tus pistas… o inventártelas.</p>
    </div>
  );
}

function MiObjetivo({ v }) {
  const o = OBJETIVOS[v.yo.objetivo];
  if (!o) return null;
  return (
    <div className={`gpp-objetivo ${v.yo.objetivo}`}>
      <span className="gpp-objetivo-e">{o.e}</span>
      <div>
        <p className="gpp-etiqueta claro">Tu objetivo secreto · +{PUNTOS.objetivo}{v.yo.objetivo === 'traidor' ? ` (+${PUNTOS.traidorOculto} si no te descubren)` : ''}</p>
        <strong>{o.nombre}</strong>
        <span>{o.desc}</span>
      </div>
    </div>
  );
}

/** Lo que cada jugador sabe de una opción, para marcarla en el plan. */
const pistaDe = (v, paso, op) => v.yo.pistas.find((p) => p.paso === paso && p.opcion === op);

function PlanTexto({ v, plan, verdad = null }) {
  const esc = escDe(v);
  return (
    <ol className="gpp-plan-pasos">
      {plan.map((op, paso) => {
        const estado = verdad ? verdad[paso][op].estado : null;
        return (
          <li key={paso} className={estado || ''}>
            <small>{esc.pasos[paso].nombre}</small>
            <span>{estado && `${ESTADOS[estado].e} `}{esc.pasos[paso].opciones[op]}</span>
          </li>
        );
      })}
    </ol>
  );
}

function Chat({ v, enviar }) {
  const [txt, setTxt] = useState('');
  const caja = useRef(null);
  const ultimo = v.chat.length ? v.chat[v.chat.length - 1].n : 0;
  useEffect(() => { if (caja.current) caja.current.scrollTop = caja.current.scrollHeight; }, [ultimo]);
  const nombre = (id) => v.jugadores.find((j) => j.id === id)?.nombre ?? '?';
  const mandar = (e) => { e.preventDefault(); if (!txt.trim()) return; enviar('chat', { texto: txt }); setTxt(''); };
  return (
    <div className="gpp-tarjeta">
      <p className="gpp-etiqueta">💬 Debate (cuestiona, defiende… o miente)</p>
      <div className="gpp-chat" ref={caja}>
        {v.chat.length === 0 && <p className="gpp-nota">Nadie ha dicho nada todavía. ¿Qué sabes de las entradas?</p>}
        {v.chat.map((m) => (
          <div key={m.n} className={`gpp-msg${m.id === v.yo.id ? ' yo' : ''}`}>
            <Avatar id={m.id} nombre={nombre(m.id)} /><span><b>{nombre(m.id)}</b>{m.texto}</span>
          </div>
        ))}
      </div>
      <form className="gpp-chat-form" onSubmit={mandar}>
        <input type="text" value={txt} maxLength={AJUSTES.chatMax} placeholder="Escribe (o habla en voz alta)…" onChange={(e) => setTxt(e.target.value)} />
        <button type="submit" className="gpp-boton mini" disabled={!txt.trim()} aria-label="Enviar"><Icon name="forward" size={18} /></button>
      </form>
    </div>
  );
}

function Esperando({ v, texto }) {
  const pend = v.jugadores.filter((j) => v.faltan.includes(j.id));
  return (
    <div className="gpp-esperando">
      <strong>⏳ {texto}</strong>
      {pend.length > 0 && <span>Falta: {pend.map((j) => j.nombre).join(', ')}</span>}
    </div>
  );
}

// ---------------------------------------------------------------- Fases
function Briefing({ v, enviar }) {
  return (
    <>
      <Mision v={v} />
      <MiObjetivo v={v} />
      <MisPistas v={v} />
      <div className="gpp-tarjeta">
        <p className="gpp-etiqueta">🗺️ Las opciones de cada paso</p>
        <div className="gpp-pasos">
          {escDe(v).pasos.map((p, paso) => (
            <div key={p.nombre} className="gpp-paso">
              <strong>{paso + 1}. {p.nombre}</strong>
              {p.opciones.map((o, op) => { const pi = pistaDe(v, paso, op); return <span key={o} className={pi ? pi.estado : ''}>{pi ? ESTADOS[pi.estado].e : '❔'} {o}</span>; })}
            </div>
          ))}
        </div>
        <p className="gpp-nota">Cada opción es segura ✅, peligrosa ⚠️ (funciona, pero es arriesgada) o imposible ⛔ (el plan fracasa).</p>
      </div>
      <div className="gpp-barra">
        {v.yo.listo ? <Esperando v={v} texto="Preparado" /> : <button type="button" className="gpp-boton grande" onClick={() => enviar('listo')}><Icon name="check" size={20} strokeWidth={2.5} /> Entendido, ¡a planear!</button>}
      </div>
    </>
  );
}

function Plan({ v, enviar }) {
  const [plan, setPlan] = useState(v.yo.plan || [null, null, null]);
  useEffect(() => { setPlan(v.yo.plan || [null, null, null]); }, [v.mision]); // eslint-disable-line react-hooks/exhaustive-deps
  const esc = escDe(v);
  const completo = plan.every((x) => x != null);
  return (
    <>
      <MiObjetivo v={v} />
      <div className="gpp-tarjeta">
        <p className="gpp-etiqueta">📝 Tu plan de tres pasos</p>
        {esc.pasos.map((p, paso) => (
          <div key={p.nombre} className="gpp-elegir">
            <strong>{paso + 1}. {p.nombre}</strong>
            <div className="gpp-opciones">
              {p.opciones.map((o, op) => {
                const pi = pistaDe(v, paso, op);
                return (
                  <button key={o} type="button" className={`gpp-opcion${plan[paso] === op ? ' sel' : ''}${pi ? ` ${pi.estado}` : ''}`} onClick={() => setPlan(plan.map((x, k) => (k === paso ? op : x)))}>
                    {pi && <i>{ESTADOS[pi.estado].e}</i>}{o}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        <p className="gpp-nota">Las marcas ✅⚠️⛔ son lo que tú sabes. Lo demás… es un riesgo.</p>
      </div>
      <div className="gpp-barra">
        {v.yo.plan && <Esperando v={v} texto="Plan enviado (puedes cambiarlo)" />}
        <button type="button" className="gpp-boton grande" disabled={!completo} onClick={() => enviar('plan', { plan })}>
          <Icon name="check" size={20} strokeWidth={2.5} /> {v.yo.plan ? 'Cambiar mi plan' : 'Proponer este plan'}
        </button>
      </div>
      <Chat v={v} enviar={enviar} />
    </>
  );
}

function ListaPlanes({ v, seleccionable = false, sel, setSel }) {
  const nombre = (id) => v.jugadores.find((j) => j.id === id)?.nombre ?? '?';
  return (
    <div className="gpp-planes">
      {v.planes.map((p) => {
        const mio = p.autorId === v.yo.id;
        const Tag = seleccionable && !mio ? 'button' : 'div';
        return (
          <Tag key={p.autorId} type={Tag === 'button' ? 'button' : undefined} className={`gpp-plan${mio ? ' mio' : ''}${sel === p.autorId ? ' sel' : ''}`} onClick={Tag === 'button' ? () => setSel(p.autorId) : undefined}>
            <div className="gpp-plan-cab"><Avatar id={p.autorId} nombre={nombre(p.autorId)} /> <strong>{mio ? 'Tu plan' : `Plan de ${nombre(p.autorId)}`}</strong>{sel === p.autorId && <em>Tu voto</em>}</div>
            <PlanTexto v={v} plan={p.plan} />
          </Tag>
        );
      })}
    </div>
  );
}

function Debate({ v, enviar }) {
  return (
    <>
      <div className="gpp-tarjeta">
        <p className="gpp-etiqueta">🗂️ Los planes sobre la mesa</p>
        <ListaPlanes v={v} />
      </div>
      <Chat v={v} enviar={enviar} />
      <MisPistas v={v} />
      <MiObjetivo v={v} />
      <div className="gpp-barra">
        {v.yo.listo ? <Esperando v={v} texto="Listo para votar" /> : <button type="button" className="gpp-boton grande" onClick={() => enviar('listo')}><Icon name="check" size={20} strokeWidth={2.5} /> Ya podemos votar</button>}
      </div>
    </>
  );
}

function Voto({ v, enviar }) {
  const [sel, setSel] = useState(v.yo.voto);
  const [traidor, setTraidor] = useState(v.yo.acusacion);
  const rivales = v.jugadores.filter((j) => j.id !== v.yo.id && !j.fuera);
  const votado = v.yo.voto != null;
  return (
    <>
      <div className="gpp-tarjeta">
        <p className="gpp-etiqueta">🗳️ ¿Qué plan se ejecuta? (no puedes votar el tuyo)</p>
        <ListaPlanes v={v} seleccionable={!votado} sel={sel} setSel={setSel} />
      </div>
      <div className="gpp-tarjeta">
        <p className="gpp-etiqueta">🗡️ ¿Quién crees que es el traidor? (+{PUNTOS.acusar} si aciertas)</p>
        <div className="gpp-pildoras">
          {rivales.map((j) => <button key={j.id} type="button" disabled={votado} className={`gpp-pildora${traidor === j.id ? ' activo' : ''}`} onClick={() => setTraidor(j.id)}><Avatar id={j.id} nombre={j.nombre} /> {j.nombre}</button>)}
          <button type="button" disabled={votado} className={`gpp-pildora${traidor == null ? ' activo' : ''}`} onClick={() => setTraidor(null)}>No acuso a nadie</button>
        </div>
      </div>
      <Chat v={v} enviar={enviar} />
      <div className="gpp-barra">
        {votado ? <Esperando v={v} texto="Voto enviado" /> : (
          <button type="button" className="gpp-boton grande" disabled={sel == null} onClick={() => enviar('votar', { plan: sel, traidor })}>
            <Icon name="check" size={20} strokeWidth={2.5} /> {sel == null ? 'Elige un plan' : 'Votar'}
          </button>
        )}
      </div>
    </>
  );
}

function Resolucion({ v, enviar }) {
  const r = v.resultado;
  const esc = escDe(v);
  const nombre = (id) => v.jugadores.find((j) => j.id === id)?.nombre ?? '?';
  const mia = r.filas.find((f) => f.id === v.yo.id);
  return (
    <>
      <div className={`gpp-veredicto ${r.ganador == null ? 'nada' : r.exito ? 'exito' : 'fracaso'}`}>
        <strong>{r.ganador == null ? '🤷 No se ejecutó ningún plan' : r.exito ? '💰 ¡EL GOLPE SALE BIEN!' : '🚨 ¡EL GOLPE FRACASA!'}</strong>
        {r.ganador != null && <span>Se ejecutó el plan de {nombre(r.ganador)}{r.empate ? ' (empate decidido a suertes)' : ''} con {r.recuento[r.ganador]} voto{r.recuento[r.ganador] === 1 ? '' : 's'}.</span>}
        {r.ganador != null && <PlanTexto v={v} plan={r.planes[r.ganador]} verdad={r.verdad} />}
      </div>

      <div className="gpp-tarjeta">
        <p className="gpp-etiqueta">🔓 Las condiciones reales</p>
        <div className="gpp-pasos">
          {esc.pasos.map((p, paso) => (
            <div key={p.nombre} className="gpp-paso">
              <strong>{paso + 1}. {p.nombre}</strong>
              {p.opciones.map((o, op) => <span key={o} className={r.verdad[paso][op].estado}>{ESTADOS[r.verdad[paso][op].estado].e} {o}<small>{r.verdad[paso][op].motivo}</small></span>)}
            </div>
          ))}
        </div>
      </div>

      <div className="gpp-tarjeta">
        <p className="gpp-etiqueta">🎭 Se descubre todo</p>
        <div className="gpp-filas">
          {r.filas.map((f) => {
            const ev = r.evals[f.id];
            return (
              <div key={f.id} className={`gpp-fila${f.objetivo === 'traidor' ? ' traidor' : ''}`}>
                <div className="gpp-fila-cab">
                  <Avatar id={f.id} nombre={nombre(f.id)} />
                  <strong>{nombre(f.id)}{f.id === v.yo.id ? ' (tú)' : ''}</strong>
                  <span className="gpp-fila-obj">{OBJETIVOS[f.objetivo].e} {OBJETIVOS[f.objetivo].nombre} {f.cumple ? '✔️' : '✖️'}</span>
                  <b>+{f.total}</b>
                </div>
                {r.planes[f.id] && <p className="gpp-nota izquierda">Plan {ev?.viable ? 'viable ✅' : 'inviable ⛔'} · {r.recuento[f.id] || 0} voto{(r.recuento[f.id] || 0) === 1 ? '' : 's'} · acusó a {r.acusaciones[f.id] != null ? nombre(r.acusaciones[f.id]) : 'nadie'}</p>}
              </div>
            );
          })}
        </div>
        <p className="gpp-nota">El traidor era {nombre(r.traidorId)}: {r.descubierto ? 'lo descubrieron' : 'no lo descubrieron'}.</p>
      </div>

      {mia && (
        <div className="gpp-tarjeta">
          <p className="gpp-etiqueta">Tus puntos en esta misión</p>
          {mia.lineas.length ? <div className="gpp-lineas">{mia.lineas.map((l, i) => <div key={i}><span>{l.texto}</span><strong>+{l.n}</strong></div>)}</div> : <p className="gpp-texto">Esta vez no has sumado puntos.</p>}
        </div>
      )}
      <div className="gpp-barra">
        {v.yo.listo ? <Esperando v={v} texto="Esperando a los demás" /> : <button type="button" className="gpp-boton grande" onClick={() => enviar('listo')}><Icon name="forward" size={20} /> {v.mision >= v.misiones ? 'Ver el resultado final' : 'Siguiente misión'}</button>}
      </div>
    </>
  );
}

export function PantallaJuego({ v, enviar, onSalir, offset = 0, admin = null }) {
  const esc = escDe(v);
  const titulos = { briefing: esc.nombre, plan: 'Traza tu plan', debate: 'Convence a la banda', voto: '¿Qué plan se ejecuta?', resolucion: 'La hora de la verdad' };
  return (
    <>
      <Hero v={v} offset={offset} onSalir={onSalir} etiqueta={`${FASES[v.fase]} · ${esc.lugar}`} titulo={titulos[v.fase]} clase={v.fase} />
      {v.fase === 'briefing' && <Briefing v={v} enviar={enviar} />}
      {v.fase === 'plan' && <Plan v={v} enviar={enviar} />}
      {v.fase === 'debate' && <Debate v={v} enviar={enviar} />}
      {v.fase === 'voto' && <Voto v={v} enviar={enviar} />}
      {v.fase === 'resolucion' && <Resolucion v={v} enviar={enviar} />}
      {admin?.esAdmin && v.faltan.length > 0 && !v.faltan.includes(v.yo.id) && v.fase !== 'resolucion' && (
        <div className="gpp-barra estatica">
          <button type="button" className="gpp-enlace" onClick={admin.onForzar}><Icon name="forward" size={15} /> Seguir sin esperar a {v.faltan.length === 1 ? v.jugadores.find((j) => j.id === v.faltan[0])?.nombre : `${v.faltan.length} jugadores`}</button>
        </div>
      )}
    </>
  );
}

export function PantallaFin({ v, onSalir, children }) {
  useRegistrarPartida('golpe', resultadoDesdeFin(v));
  const f = v.fin;
  const nombre = (id) => v.jugadores.find((j) => j.id === id)?.nombre ?? '?';
  const top = f.tabla.filter((x) => !x.fuera).slice(0, 3);
  const colocacion = top.length === 3 ? [top[1], top[0], top[2]] : top.length === 2 ? [top[1], top[0]] : top;
  const alturas = ['primero', 'segundo', 'tercero'];
  const ganadores = f.ganadores.map(nombre);
  return (
    <>
      <Hero v={v} onSalir={onSalir} etiqueta="Fin de los golpes" titulo={ganadores.length > 1 ? `Empate: ${ganadores.join(' y ')}` : `¡${ganadores[0]} se lleva el botín!`} clase="fin" />
      <div className="gpp-tarjeta gpp-centro">
        <div className="gpp-podio">
          {colocacion.map((x) => {
            const puesto = top.filter((o) => o.puntos > x.puntos).length;
            return (
              <div key={x.id} className={`gpp-podio-col ${alturas[puesto]}`} style={{ '--c': colorDe(x.id) }}>
                <Avatar id={x.id} nombre={x.nombre} grande />
                <span className="gpp-podio-nombre">{x.nombre}{x.id === v.yo?.id ? ' (tú)' : ''}</span>
                <span className="gpp-podio-pts">{x.puntos} pts</span>
                <span className="gpp-podio-base">{puesto + 1}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="gpp-tarjeta">
        <p className="gpp-etiqueta">Las misiones</p>
        <div className="gpp-lineas">
          {v.historial.map((h) => {
            const e = ESCENARIOS.find((x) => x.id === h.escenario);
            return <div key={h.mision}><span>{e.e} {e.nombre}</span><strong>{h.exito ? '💰 Éxito' : '🚨 Fracaso'}</strong></div>;
          })}
        </div>
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
          <p className="gpp-ayuda-sub">🎬 Cada misión</p>
          <ol>
            <li><strong>El encargo:</strong> una misión con 3 pasos (entrar, dar el golpe y huir) y 4 opciones en cada uno. Cada opción es segura ✅, peligrosa ⚠️ (funciona, pero arriesgada) o imposible ⛔ (el plan fracasa).</li>
            <li><strong>Información privada:</strong> recibes pistas sobre algunas opciones y un objetivo secreto.</li>
            <li><strong>El plan:</strong> cada uno propone un plan eligiendo una opción por paso.</li>
            <li><strong>El debate:</strong> cuestiona, defiende y, si te conviene, miente sobre tus pistas.</li>
            <li><strong>La votación:</strong> votas en secreto el mejor plan (no el tuyo) y acusas a quien creas traidor.</li>
            <li><strong>La resolución:</strong> se ejecuta el plan más votado, se revelan las condiciones reales y los objetivos de todos.</li>
          </ol>
          <p className="gpp-ayuda-sub">🎭 Objetivos secretos (hay un traidor por misión)</p>
          <ul>{Object.values(OBJETIVOS).map((o) => <li key={o.nombre}>{o.e} <strong>{o.nombre}:</strong> {o.desc}</li>)}</ul>
          <p className="gpp-ayuda-sub">🏆 Puntos</p>
          <ul>
            <li>+{PUNTOS.viable} si tu plan era viable · +{PUNTOS.votado} si alguien votó tu plan · +{PUNTOS.objetivo} si cumples tu objetivo secreto.</li>
            <li>+{PUNTOS.acusar} si aciertas quién es el traidor · el traidor gana +{PUNTOS.traidorOculto} si sabotea el golpe sin que la mitad de los demás le acuse.</li>
          </ul>
        </div>
        <button type="button" className="big full qq-btn-principal" onClick={onCerrar}>¡Entendido!</button>
      </div>
    </div>
  );
}
