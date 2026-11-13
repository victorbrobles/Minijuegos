// client/src/games/Coleccion/Vistas.jsx
// Pantallas de «Colecciona con cabeza» (modo online y un solo dispositivo) con el estilo de los juegos renovados.
// Reciben `v` (vista de un jugador que genera engine.vistaDe) y `enviar(tipo, datos)`.
import { useRegistrarPartida, resultadoDesdeFin } from '../../lib/registros.js';
import React, { useEffect, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import InfoCarta from '../../components/InfoCarta.jsx';
import { PALOS, PALO, COMODIN, ACCIONES, AJUSTES, textoEncargo, esColeccion } from './engine.js';
import './Coleccion.css';

export const COLORES = ['#ef4444', '#2563eb', '#16a34a', '#f59e0b', '#9333ea', '#ec4899'];
export const colorDe = (id) => COLORES[((Number(id) || 1) - 1) % COLORES.length];
const inicial = (n) => (n || '?').trim().charAt(0).toUpperCase();

export function Avatar({ id, nombre, grande = false }) {
  return <span className={`cxp-avatar${grande ? ' grande' : ''}`} style={{ '--c': colorDe(id) }}>{inicial(nombre)}</span>;
}

/** Carta (de colección o de acción). */
export function Carta({ c, mini = false, onClick, accion, sel = false, deshabilitada = false, util = false }) {
  let e; let nombre; let color; let texto = null;
  if (c.clase === 'accion') { const A = ACCIONES[c.accion]; e = A.e; nombre = A.nombre; color = '#0f172a'; texto = A.desc; }
  else if (c.clase === 'comodin') { e = COMODIN.e; nombre = 'Comodín'; color = COMODIN.c; texto = 'Cuenta como cualquier palo.'; }
  else { e = PALO[c.palo].e; nombre = PALO[c.palo].nombre; color = PALO[c.palo].c; }
  const clase = `cxp-carta ${c.clase}${mini ? ' mini' : ''}${sel ? ' sel' : ''}${onClick && !deshabilitada ? ' activa' : ''}`;
  const dentro = (
    <>
      {util && <span className="cxp-util" title="Te sirve para tu encargo">★</span>}
      <span className="cxp-carta-e">{e}</span>
      <strong>{nombre}</strong>
      {!mini && texto && <InfoCarta e={e} nombre={nombre} desc={texto} />}
      {accion && <span className="cxp-carta-accion">{accion}</span>}
    </>
  );
  if (!onClick) return <div className={clase} style={{ '--c': color }}>{dentro}</div>;
  return <button type="button" className={clase} style={{ '--c': color }} onClick={onClick} disabled={deshabilitada}>{dentro}</button>;
}

/** Encargo con lo que falta. */
export function Encargo({ encargo, vitrina, progreso, compacto = false }) {
  if (!encargo) return null;
  const cuenta = {};
  let comodines = 0;
  vitrina.forEach((c) => { if (c.clase === 'comodin') comodines += 1; else if (c.clase === 'palo') cuenta[c.palo] = (cuenta[c.palo] || 0) + 1; });
  return (
    <div className={`cxp-encargo${compacto ? ' compacto' : ''}${progreso?.cumple ? ' cumple' : ''}`}>
      <div className="cxp-encargo-cab">
        <span>📜 {encargo.nombre}</span>
        {progreso && <b>{progreso.cumple ? '¡Completo!' : `Faltan ${progreso.faltan}`}</b>}
      </div>
      <div className="cxp-encargo-req">
        {encargo.distintos ? (
          <span className="cxp-req" style={{ '--c': '#0891b2' }}>🌈 {encargo.distintos} palos distintos <em>{Object.keys(cuenta).length}{comodines ? ` +${comodines}🌟` : ''}</em></span>
        ) : encargo.req.map((r) => (
          <span key={r.palo} className={`cxp-req${(cuenta[r.palo] || 0) >= r.n ? ' ok' : ''}`} style={{ '--c': PALO[r.palo].c }}>
            {PALO[r.palo].e} {r.n} × {PALO[r.palo].nombre} <em>{Math.min(cuenta[r.palo] || 0, r.n)}/{r.n}</em>
          </span>
        ))}
      </div>
      {!compacto && <p className="cxp-pista">Los 🌟 comodines de tu vitrina cubren cualquier hueco.</p>}
    </div>
  );
}

// ---------------------------------------------------------------- Cabecera
export function Hero({ v, onSalir, etiqueta, titulo, clase = '' }) {
  const t = v.turno;
  const miTurno = Boolean(t && v.yo) && t.jugadorId === v.yo.id;
  return (
    <header className={`cxp-hero ${clase}`}>
      <span className="cxp-cartas-fondo" aria-hidden="true">🃏</span>
      <div className="cxp-hero-top">
        <button type="button" className="cxp-salir" onClick={onSalir}><Icon name="door" size={15} /> Salir</button>
        <div className="cxp-chips">
          <span className="cxp-chip">Ronda {v.ronda}</span>
          <span className="cxp-chip" title="Cartas en el mazo">🂠 {v.mazo}</span>
          {miTurno && <span className="cxp-chip vivo">⚡ {t.jugadas} {t.jugadas === 1 ? 'jugada' : 'jugadas'}</span>}
        </div>
      </div>
      {etiqueta && <p className="cxp-hero-etiqueta">{etiqueta}</p>}
      {titulo && <h1 className="cxp-hero-titulo">{titulo}</h1>}
      <div className="cxp-marcador">
        {v.jugadores.map((j) => (
          <span key={j.id} className={`cxp-marca${t?.jugadorId === j.id ? ' turno' : ''}${j.id === v.yo?.id ? ' yo' : ''}${j.fuera ? ' fuera' : ''}`}>
            <Avatar id={j.id} nombre={j.nombre} />
            <span className="cxp-marca-nombre">{j.nombre}</span>
            <span className="cxp-marca-datos">🖼{j.vitrina.length} ✋{j.nMano}</span>
            {j.congelado && <b title="Congelado">❄️</b>}
          </span>
        ))}
      </div>
    </header>
  );
}

// ---------------------------------------------------------------- Panel de acción
function PanelAccion({ v, carta, enviar, onCancelar }) {
  const A = ACCIONES[carta.accion];
  const [obj, setObj] = useState(null);
  const [su, setSu] = useState(null);
  const [mi, setMi] = useState(null);
  const [palo, setPalo] = useState(null);
  const yo = v.jugadores.find((j) => j.id === v.yo.id);
  const rivales = v.jugadores.filter((j) => j.id !== v.yo.id && !j.fuera);
  const victima = rivales.find((j) => j.id === obj);
  const coleccionMano = v.yo.mano.filter(esColeccion);

  let listo = false;
  let pasos = null;
  const elegirRival = (filtro = () => true, aviso) => (
    <>
      <p className="cxp-etiqueta">¿A quién?</p>
      <div className="cxp-pildoras">
        {rivales.map((j) => (
          <button key={j.id} type="button" className={`cxp-pildora${obj === j.id ? ' activo' : ''}`} disabled={!filtro(j)} onClick={() => { setObj(j.id); setSu(null); }}>
            <Avatar id={j.id} nombre={j.nombre} /> {j.nombre}
          </button>
        ))}
      </div>
      {aviso && <p className="cxp-pista">{aviso}</p>}
    </>
  );
  switch (A.objetivo) {
    case 'vitrina':
      pasos = (
        <>
          {elegirRival((j) => j.vitrina.length > 0, 'Solo puedes elegir a quien tenga cartas en su vitrina.')}
          {victima && (
            <>
              <p className="cxp-etiqueta">¿Qué carta de su vitrina?</p>
              <div className="cxp-cartas">{victima.vitrina.map((c) => <Carta key={c.uid} c={c} mini sel={su === c.uid} onClick={() => setSu(c.uid)} />)}</div>
            </>
          )}
        </>
      );
      listo = obj != null && su != null;
      break;
    case 'trueque':
      pasos = (
        <>
          <p className="cxp-etiqueta">Tu carta (de tu vitrina)</p>
          {yo.vitrina.length ? <div className="cxp-cartas">{yo.vitrina.map((c) => <Carta key={c.uid} c={c} mini sel={mi === c.uid} onClick={() => setMi(c.uid)} />)}</div> : <p className="cxp-pista">Tu vitrina está vacía: no puedes hacer un trueque.</p>}
          {elegirRival((j) => j.vitrina.length > 0)}
          {victima && <div className="cxp-cartas">{victima.vitrina.map((c) => <Carta key={c.uid} c={c} mini sel={su === c.uid} onClick={() => setSu(c.uid)} />)}</div>}
        </>
      );
      listo = obj != null && su != null && mi != null;
      break;
    case 'regalo':
      pasos = (
        <>
          <p className="cxp-etiqueta">¿Qué carta regalas? (de tu mano)</p>
          {coleccionMano.length ? <div className="cxp-cartas">{coleccionMano.map((c) => <Carta key={c.uid} c={c} mini sel={mi === c.uid} onClick={() => setMi(c.uid)} />)}</div> : <p className="cxp-pista">No tienes cartas de colección en la mano.</p>}
          {elegirRival((j) => j.vitrina.length < AJUSTES.maxVitrina)}
        </>
      );
      listo = obj != null && mi != null;
      break;
    case 'jugador':
      pasos = elegirRival();
      listo = obj != null;
      break;
    case 'palo':
      pasos = (
        <>
          <p className="cxp-etiqueta">Elige un palo</p>
          <div className="cxp-pildoras">
            {PALOS.map((p) => <button key={p.id} type="button" className={`cxp-pildora${palo === p.id ? ' activo' : ''}`} onClick={() => setPalo(p.id)}>{p.e} {p.nombre}</button>)}
          </div>
        </>
      );
      listo = palo != null;
      break;
    case 'descarte':
      pasos = (
        <>
          <p className="cxp-etiqueta">Elige una carta del montón (las últimas descartadas)</p>
          {v.descarte.length ? <div className="cxp-cartas">{v.descarte.map((c) => <Carta key={c.uid} c={c} mini sel={su === c.uid} onClick={() => setSu(c.uid)} />)}</div> : <p className="cxp-pista">El montón de descartes está vacío.</p>}
        </>
      );
      listo = su != null;
      break;
    default:
      listo = true;
  }
  return (
    <div className="cxp-tarjeta cxp-panel">
      <div className="cxp-panel-cab">
        <span className="cxp-panel-e">{A.e}</span>
        <div><strong>{A.nombre}</strong><small>{A.desc}</small></div>
      </div>
      {pasos}
      <div className="cxp-dos" style={{ marginTop: '0.8rem' }}>
        <button type="button" className="cxp-boton secundario" onClick={onCancelar}>Cancelar</button>
        <button type="button" className="cxp-boton" disabled={!listo} onClick={() => enviar('accion', { uid: carta.uid, params: { objetivo: obj, suUid: su, miUid: mi, palo } })}>
          {A.e} ¡Jugar!
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Pantalla de partida
export function PantallaJuego({ v, enviar, onSalir, admin = null }) {
  const [accion, setAccion] = useState(null);
  const t = v.turno;
  const miTurno = t?.jugadorId === v.yo.id;
  const yo = v.jugadores.find((j) => j.id === v.yo.id);
  const rivales = v.jugadores.filter((j) => j.id !== v.yo.id);
  const quien = v.jugadores.find((j) => j.id === t?.jugadorId);
  const descartando = miTurno && t.paso === 'descartar';
  const sinJugadas = miTurno && t.jugadas <= 0;
  useEffect(() => { setAccion(null); }, [t?.jugadorId, v.yo.mano.length]);
  const enc = v.yo.encargo;
  const sirve = (c) => c.clase === 'comodin' || (c.clase === 'palo' && (enc?.distintos ? !yo.vitrina.some((x) => x.palo === c.palo) : enc?.req.some((r) => r.palo === c.palo && yo.vitrina.filter((x) => x.palo === c.palo).length < r.n)));

  return (
    <>
      <Hero v={v} onSalir={onSalir} etiqueta={miTurno ? `Tu turno · ronda ${v.ronda}` : `Ronda ${v.ronda}`}
        titulo={miTurno ? (descartando ? 'Descarta cartas' : '¡Te toca!') : `Juega ${quien?.nombre ?? '…'}`} clase={miTurno ? 'mio' : ''} />

      {v.log.length > 0 && <div className="cxp-ultimo">{v.log[v.log.length - 1].texto}</div>}

      <div className="cxp-tarjeta">
        <p className="cxp-etiqueta">🤫 Tu encargo secreto</p>
        <Encargo encargo={v.yo.encargo} vitrina={yo.vitrina} progreso={v.yo.progreso} />
      </div>

      <div className="cxp-tarjeta">
        <p className="cxp-etiqueta">🖼 Tu vitrina ({yo.vitrina.length}/{AJUSTES.maxVitrina}) · todos la ven</p>
        {yo.vitrina.length === 0 ? <p className="cxp-pista izquierda">Vacía. Pon aquí cartas de colección de tu mano.</p> : (
          <div className="cxp-cartas">
            {yo.vitrina.map((c) => (
              <Carta key={c.uid} c={c} mini onClick={miTurno && !descartando && !sinJugadas ? () => enviar('retirar', { uid: c.uid }) : undefined} accion={miTurno && !descartando && !sinJugadas ? '↩ A la mano' : null} />
            ))}
          </div>
        )}
      </div>

      {accion ? <PanelAccion v={v} carta={accion} enviar={(tipo, d) => { enviar(tipo, d); setAccion(null); }} onCancelar={() => setAccion(null)} /> : (
        <div className="cxp-tarjeta">
          <p className="cxp-etiqueta">✋ Tu mano ({v.yo.mano.length}/{AJUSTES.maxMano}){descartando ? ' · toca las que descartas' : miTurno ? ` · te quedan ${t.jugadas} ${t.jugadas === 1 ? 'jugada' : 'jugadas'}` : ''}</p>
          {v.yo.mano.length === 0 ? <p className="cxp-pista izquierda">No tienes cartas.</p> : (
            <div className="cxp-cartas grandes">
              {v.yo.mano.map((c) => {
                let texto = null; let fn;
                if (descartando) { texto = '🗑 Descartar'; fn = () => enviar('descartar', { uid: c.uid }); }
                else if (miTurno && !sinJugadas) {
                  if (esColeccion(c)) { texto = yo.vitrina.length >= AJUSTES.maxVitrina ? 'Vitrina llena' : '🖼 A la vitrina'; fn = yo.vitrina.length >= AJUSTES.maxVitrina ? undefined : () => enviar('colocar', { uid: c.uid }); }
                  else if (ACCIONES[c.accion].pasiva) texto = 'Se activa sola';
                  else { texto = '▶ Jugar'; fn = () => setAccion(c); }
                }
                return <Carta key={c.uid} c={c} accion={texto} onClick={fn} deshabilitada={!fn && Boolean(texto)} util={sirve(c)} />;
              })}
            </div>
          )}
        </div>
      )}

      <div className="cxp-tarjeta">
        <p className="cxp-etiqueta">👀 Rivales</p>
        <div className="cxp-rivales">
          {rivales.map((j) => (
            <div key={j.id} className={`cxp-rival${t?.jugadorId === j.id ? ' turno' : ''}${j.fuera ? ' fuera' : ''}`}>
              <div className="cxp-rival-cab">
                <Avatar id={j.id} nombre={j.nombre} /> <strong>{j.nombre}</strong>
                <span>✋ {j.nMano}{j.congelado ? ' · ❄️ congelado' : ''}{j.fuera ? ' · abandonó' : ''}</span>
              </div>
              {j.encargo && <Encargo encargo={j.encargo} vitrina={j.vitrina} progreso={j.progreso} compacto />}
              {j.vitrina.length ? <div className="cxp-cartas">{j.vitrina.map((c) => <Carta key={c.uid} c={c} mini />)}</div> : <p className="cxp-pista izquierda">Vitrina vacía.</p>}
              {!j.encargo && <p className="cxp-pista izquierda">Encargo: ❓ secreto (úsale un 🔍 Espía)</p>}
            </div>
          ))}
        </div>
      </div>

      <details className="cxp-detalle">
        <summary>📖 Lo que ha pasado</summary>
        <div className="cxp-log">{[...v.log].reverse().map((l) => <p key={l.n}>{l.texto}</p>)}</div>
      </details>

      {miTurno && !descartando && !accion && (
        <div className="cxp-barra">
          <button type="button" className="cxp-boton grande" onClick={() => enviar('terminar')}>
            <Icon name="check" size={20} strokeWidth={2.5} /> Terminar turno
          </button>
        </div>
      )}
      {admin?.esAdmin && !miTurno && admin.desconectados?.includes(t?.jugadorId) && (
        <div className="cxp-barra estatica">
          <button type="button" className="cxp-enlace" onClick={admin.onForzar}><Icon name="forward" size={15} /> ¿No responde? Saltar a {quien?.nombre}</button>
        </div>
      )}
    </>
  );
}

export function PantallaFin({ v, onSalir, children }) {
  useRegistrarPartida('coleccion', resultadoDesdeFin(v));
  const g = v.jugadores.find((j) => j.id === v.fin.ganadorId);
  return (
    <>
      <Hero v={v} onSalir={onSalir} etiqueta={v.fin.porAbandono ? 'Todos los demás abandonaron' : '¡Colección completa!'} titulo={`¡Gana ${g?.nombre}!`} clase="fin" />
      <div className="cxp-tarjeta cxp-centro">
        <Avatar id={g?.id} nombre={g?.nombre} grande />
        <p className="cxp-texto">{v.fin.porAbandono ? 'Se quedó solo en la partida.' : 'Su vitrina cumplió el encargo secreto:'}</p>
        {g && !v.fin.porAbandono && <Encargo encargo={v.fin.encargos.find((x) => x.id === g.id).encargo} vitrina={g.vitrina} progreso={{ cumple: true, faltan: 0 }} compacto />}
      </div>
      <div className="cxp-tarjeta">
        <p className="cxp-etiqueta">🤫 Los encargos de todos</p>
        <div className="cxp-rivales">
          {v.fin.encargos.map((x) => {
            const j = v.jugadores.find((q) => q.id === x.id);
            return (
              <div key={x.id} className={`cxp-rival${x.id === v.fin.ganadorId ? ' turno' : ''}`}>
                <div className="cxp-rival-cab"><Avatar id={j.id} nombre={j.nombre} /> <strong>{j.nombre}{j.id === v.yo?.id ? ' (tú)' : ''}</strong><span>{textoEncargo(x.encargo)}</span></div>
                {x.vitrina.length ? <div className="cxp-cartas">{x.vitrina.map((c) => <Carta key={c.uid} c={c} mini />)}</div> : <p className="cxp-pista izquierda">Vitrina vacía.</p>}
              </div>
            );
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
          <p className="cxp-ayuda-sub">🎯 Objetivo</p>
          <ul>
            <li>Recibes un <strong>encargo secreto</strong>: la colección que debes reunir en tu vitrina (por ejemplo, 4 dinosaurios, o 2 planetas y 2 piratas, o 5 palos distintos). Puede que otro vaya a por lo mismo… sin que lo sepas.</li>
            <li>En cuanto tu vitrina cumple tu encargo, <strong>ganas</strong> (aunque sea por culpa de otro). Los 🌟 comodines valen por cualquier palo.</li>
          </ul>
          <p className="cxp-ayuda-sub">🔁 Tu turno</p>
          <ol>
            <li>Robas {AJUSTES.roboTurno} cartas.</li>
            <li>Tienes {AJUSTES.jugadasTurno} jugadas: poner una carta de colección en tu vitrina (máx. {AJUSTES.maxVitrina}), devolver una de la vitrina a la mano o jugar una carta de acción.</li>
            <li>Al terminar, no puedes tener más de {AJUSTES.maxMano} cartas en la mano.</li>
          </ol>
          <p className="cxp-ayuda-sub">🃏 Cartas de acción</p>
          <ul>{Object.values(ACCIONES).map((a) => <li key={a.nombre}>{a.e} <strong>{a.nombre}:</strong> {a.desc}</li>)}</ul>
          <p className="cxp-ayuda-sub">Palos</p>
          <p>{PALOS.map((p) => `${p.e} ${p.nombre}`).join(' · ')} · {COMODIN.e} Comodín</p>
        </div>
        <button type="button" className="big full qq-btn-principal" onClick={onCerrar}>¡Entendido!</button>
      </div>
    </div>
  );
}
