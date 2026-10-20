// client/src/games/Fundadores/Vistas.jsx
// Pantallas de Fundadores compartidas por el modo online y el de un solo dispositivo.
import React, { useState } from 'react';
import Icon from './IconoF.jsx';
import { ROLES, ROL, PEON, TIPOS, TIPOS_BASE, nombreRol } from './engine.js';
import './Fundadores.css';
import '../Adivina/Adivina.css';

const plural = (n, s, p) => (n === 1 ? s : p);

export function Moneda({ n }) { return <span className="fd-stat mon"><Icon name="coin" size={14} /> {n}</span>; }

export function Edificio({ c }) {
  const t = TIPOS[c.tipo];
  return <span className="fd-edif" style={{ background: t.color }} title={`${c.nombre} · ${t.nombre} · coste ${c.coste} · prestigio ${c.prestigio}${c.texto ? ' · ' + c.texto : ''}`}><Icon name={t.icono} size={12} /> {c.nombre} <b>{c.prestigio}★</b></span>;
}

export function Carta({ c, coste, onClick, deshabilitada, seleccionada, etiqueta }) {
  const t = TIPOS[c.tipo];
  return (
    <button type="button" className={`fd-carta ${onClick && !deshabilitada ? 'click' : ''} ${seleccionada ? 'sel' : ''} ${deshabilitada ? 'no' : ''}`}
      style={{ borderLeftColor: t.color }} onClick={deshabilitada ? undefined : onClick} disabled={!onClick}>
      <div className="fd-carta-top"><span className="fd-carta-nombre">{c.nombre}</span><span className="fd-carta-tipo" style={{ color: t.color }}><Icon name={t.icono} size={12} /> {t.nombre}</span></div>
      <div className="fd-carta-nums">
        <span><Icon name="coin" size={13} className="fd-ico" /> {coste !== undefined && coste !== c.coste ? <><s>{c.coste}</s> <b>{coste}</b></> : c.coste}</span>
        <span><Icon name="star" size={13} className="fd-ico" /> {c.prestigio}</span>
      </div>
      {c.texto && <span className="fd-carta-texto">{c.texto}</span>}
      {etiqueta && <span className="fd-carta-texto" style={{ color: '#0e7490', fontWeight: 800 }}>{etiqueta}</span>}
    </button>
  );
}

export function BarraObra({ v }) {
  const pct = Math.min(100, Math.round((v.progreso / v.meta) * 100));
  const insta = v.inaugurador !== null && v.inaugurador !== undefined;
  return (
    <div className="fd-obra">
      <div className="fd-obra-top"><span>Obra común del pueblo</span><span>{v.progreso}/{v.meta}</span></div>
      <div className="fd-obra-barra"><div className="fd-obra-fill" style={{ width: `${pct}%` }} /><span className="fd-obra-meta"><Icon name="flagFinish" size={16} /></span></div>
      {insta && <div className="fd-obra-aviso">¡{v.jugadores.find((j) => j.id === v.inaugurador)?.nombre} ha puesto la última piedra! El pueblo se inaugura al acabar la ronda.</div>}
    </div>
  );
}

export function Marcador({ v, mostrarElegido = false }) {
  return (
    <div className="fd-jugadores">
      {v.jugadores.map((j) => {
        const activo = v.turno && v.turno.jugadorId === j.id;
        return (
          <div key={j.id} className={`fd-jug ${j.id === v.yo.id ? 'yo' : ''} ${activo ? 'activo' : ''} ${j.fuera ? 'fuera' : ''}`}>
            <div className="fd-jug-top">
              <span className="fd-jug-nombre">
                {j.esSello && <Icon name="crown" size={16} />}{j.nombre}{j.id === v.yo.id ? ' (tú)' : ''}{j.protegido && <Icon name="shield" size={14} />}
              </span>
              <span className="fd-stats">
                {j.rolRevelado !== null && j.rolRevelado !== undefined && <span className="fd-rolchip"><Icon name={j.rolRevelado === 0 ? PEON.icono : ROL[j.rolRevelado].icono} size={12} /> {nombreRol(j.rolRevelado)}</span>}
                {mostrarElegido && j.eligio !== null && <span className="fd-rolchip" style={j.eligio ? { background: '#16a34a' } : { background: '#9ca3af' }}>{j.eligio ? 'Ha elegido' : 'Pensando…'}</span>}
                <Moneda n={j.monedas} />
                <span className="fd-stat"><Icon name="cards" size={13} /> {j.nMano}</span>
                <span className="fd-stat pts"><Icon name="star" size={13} /> {j.puntos}</span>
              </span>
            </div>
            <div className="fd-pueblo">{j.pueblo.length ? j.pueblo.map((c) => <Edificio key={c.uid} c={c} />) : <span className="fd-vacio">Aún sin edificios</span>}</div>
          </div>
        );
      })}
    </div>
  );
}

export function Registro({ v, abierto = false }) {
  return (
    <details className="fd-detalle" open={abierto}>
      <summary>Qué ha pasado</summary>
      <div className="fd-log">
        {[...v.log].reverse().map((l, i) => <div key={i} className={l.texto.startsWith('—') ? 'rond' : ''}>{l.texto}</div>)}
      </div>
    </details>
  );
}

function MiMano({ v, costes }) {
  return (
    <div className="fd-card">
      <h3><Icon name="cards" size={18} /> Tus planos ({v.yo.mano.length}) · <Icon name="coin" size={16} className="fd-ico" /> {v.yo.monedas}</h3>
      {v.yo.mano.length === 0 ? <p className="fd-muted">No tienes planos. Proyecta para conseguir más.</p> : (
        <div className="fd-mano">{v.yo.mano.map((c) => <Carta key={c.uid} c={c} coste={costes?.[c.uid]} />)}</div>
      )}
    </div>
  );
}

export function FaseElegir({ v, enviar }) {
  const [sel, setSel] = useState(v.yo.eleccion);
  const hecho = !!v.yo.eleccion;
  return (
    <div className="fd-wrap">
      <BarraObra v={v} />
      <div className="fd-card fd-center">
        <h2>Ronda {v.ronda}: elige tu oficio</h2>
        <p className="fd-muted">Elección secreta y simultánea. Si dos jugadores eligen el mismo, se lo queda quien tenga prioridad (<Icon name="crown" size={14} /> {v.sello.nombre} y los siguientes a su izquierda) y el otro actúa de Peón.</p>
      </div>
      {v.ultimaRonda && (
        <div className="fd-card">
          <h3>Oficios de la ronda anterior</h3>
          <div className="fd-chips">{v.ultimaRonda.map((u, i) => <span key={i} className="fd-rolchip"><Icon name={u.rol === 0 ? PEON.icono : ROL[u.rol].icono} size={12} /> {nombreRol(u.rol)}: {v.jugadores.find((j) => j.id === u.jugadorId)?.nombre}</span>)}</div>
        </div>
      )}
      {hecho ? (
        <div className="fd-card fd-center">
          <h3>Has elegido el {nombreRol(v.yo.eleccion)}</h3>
          <p className="fd-muted">Esperando a: {v.faltan.join(', ') || '…'}</p>
        </div>
      ) : (
        <div className="fd-card">
          <div className="fd-roles">
            {ROLES.map((r) => (
              <button key={r.id} type="button" className={`fd-rol ${sel === r.id ? 'sel' : ''}`} onClick={() => setSel(r.id)}>
                <span className="fd-rol-top"><span className="fd-rol-num">{r.id}</span><Icon name={r.icono} size={18} /> {r.nombre}</span>
                <small>{r.desc}</small>
              </button>
            ))}
          </div>
          <button type="button" className="big full" style={{ marginTop: '.9rem' }} disabled={!sel} onClick={() => enviar('elegir-rol', { rol: sel })}>
            <Icon name="check" size={22} strokeWidth={2.5} /> {sel ? `Elegir ${nombreRol(sel)}` : 'Elige un oficio'}
          </button>
        </div>
      )}
      <MiMano v={v} />
      <Marcador v={v} mostrarElegido />
      <Registro v={v} />
    </div>
  );
}

function ParamPanel({ rolEf, v, onUsar }) {
  const r = ROL[rolEf];
  const otros = v.jugadores.filter((j) => j.id !== v.yo.id && !j.fuera);
  const yo = v.jugadores.find((j) => j.id === v.yo.id);
  if (r.param === 'rol') {
    return <div className="fd-chips">{ROLES.filter((x) => x.id >= r.min && x.id <= r.max).map((x) => <button key={x.id} type="button" onClick={() => onUsar({ rolObjetivo: x.id })}>{x.id}. {x.nombre}</button>)}</div>;
  }
  if (r.param === 'jugador') {
    return <div className="fd-chips">{otros.map((j) => <button key={j.id} type="button" disabled={j.protegido || j.nMano === 0} onClick={() => onUsar({ objetivo: j.id })}>{j.nombre} ({j.nMano} planos){j.protegido ? ' 🛡' : ''}</button>)}</div>;
  }
  if (r.param === 'tipo') {
    return <div className="fd-chips">{TIPOS_BASE.map((t) => <button key={t} type="button" onClick={() => onUsar({ tipo: t })}>{TIPOS[t].nombre} (cobras {yo.pueblo.filter((c) => c.tipo === t).length})</button>)}</div>;
  }
  if (r.param === 'edificio') {
    const filas = otros.filter((j) => !j.protegido).flatMap((j) => j.pueblo.map((c) => ({ j, c })));
    if (!filas.length) return <p className="fd-muted">Nadie tiene edificios que se puedan comprar.</p>;
    return (
      <div className="fd-mano">
        {filas.map(({ j, c }) => {
          const precio = c.coste + 1;
          const dup = yo.pueblo.some((x) => x.nombre === c.nombre);
          return <Carta key={c.uid} c={c} etiqueta={`De ${j.nombre} · pagas ${precio}`} deshabilitada={v.yo.monedas < precio || dup} onClick={() => onUsar({ objetivo: j.id, cartaUid: c.uid })} />;
        })}
      </div>
    );
  }
  return <button type="button" className="full" onClick={() => onUsar({})}>Usar habilidad</button>;
}

function PanelHabilidad({ v, enviar }) {
  const t = v.turno;
  const [copiar, setCopiar] = useState(null);
  if (t.rol === 0) return <p className="fd-muted">El Peón no tiene habilidad.</p>;
  if (t.bloqueada) return <div className="fd-aviso mal">Tu oficio ha sido clausurado: hoy no puedes usar tu habilidad.</div>;
  if (t.habilidadUsada) return <p className="fd-muted">Ya has usado tu habilidad.</p>;
  const usar = (params) => enviar('habilidad', { params });
  if (t.rol === 8) {
    if (!t.libres?.length) return <p className="fd-muted">No hay ningún oficio libre (3–7) que copiar. Hoy actúas como un Peón.</p>;
    return (
      <>
        <p className="fd-muted">Oficios que nadie ha elegido esta ronda. Copia la habilidad de uno:</p>
        <div className="fd-chips">{t.libres.map((id) => <button key={id} type="button" className={copiar === id ? 'on' : ''} onClick={() => setCopiar(id)}>{id}. {nombreRol(id)}</button>)}</div>
        {copiar && <><p className="fd-muted">{ROL[copiar].desc}</p><ParamPanel rolEf={copiar} v={v} onUsar={(p) => usar({ ...p, copiar })} /></>}
      </>
    );
  }
  return <ParamPanel rolEf={t.rol} v={v} onUsar={usar} />;
}

function MiTurno({ v, enviar }) {
  const t = v.turno;
  const rolInfo = t.rol === 0 ? PEON : ROL[t.rol];
  const pend = t.pendiente;
  const yoPueblo = v.jugadores.find((j) => j.id === v.yo.id).pueblo;
  const puedeConstruir = t.basica && !pend && t.construidos < t.maxConstruir;
  return (
    <div className="fd-card fd-miturno">
      <h2><Icon name={rolInfo.icono} size={22} /> Tu turno: {rolInfo.nombre}</h2>
      <p className="fd-muted">{rolInfo.desc}</p>

      <div className="fd-paso">
        <h3><span className={`fd-numpaso ${t.basica ? 'ok' : ''}`}>1</span> Acción básica</h3>
        {pend?.tipo === 'proyectar' ? (
          <><p className="fd-muted">Quédate con uno de estos planos (los demás se descartan):</p>
            <div className="fd-mano">{pend.cartas.map((c) => <Carta key={c.uid} c={c} onClick={() => enviar('pendiente', { uid: c.uid })} />)}</div></>
        ) : t.basica ? <p className="fd-muted">Hecha.</p> : (
          <div className="fd-botones">
            <button type="button" onClick={() => enviar('basica', { basica: 'jornal' })}><Icon name="coin" size={18} /> Cobrar jornal (+{t.bonusJornal})</button>
            <button type="button" onClick={() => enviar('basica', { basica: 'proyectar' })}><Icon name="cards" size={18} /> Proyectar (ver {t.proyectarN}, quedarte 1)</button>
          </div>
        )}
      </div>

      <div className="fd-paso">
        <h3><span className={`fd-numpaso ${t.habilidadUsada ? 'ok' : ''}`}>2</span> Habilidad del oficio</h3>
        {pend?.tipo === 'notario' ? (
          <><p className="fd-muted">Mano de {v.jugadores.find((j) => j.id === pend.objetivo)?.nombre}. Elige un plano para copiarlo:</p>
            <div className="fd-mano">{pend.cartas.map((c) => <Carta key={c.uid} c={c} onClick={() => enviar('pendiente', { uid: c.uid })} />)}</div></>
        ) : <PanelHabilidad v={v} enviar={enviar} />}
      </div>

      <div className="fd-paso">
        <h3><span className={`fd-numpaso ${t.construidos > 0 ? 'ok' : ''}`}>3</span> Construir ({t.construidos}/{t.maxConstruir})</h3>
        {!t.basica && <p className="fd-muted">Primero haz tu acción básica.</p>}
        {v.yo.mano.length === 0 ? <p className="fd-muted">No tienes planos.</p> : (
          <div className="fd-mano">
            {v.yo.mano.map((c) => {
              const coste = t.costes[c.uid];
              const dup = yoPueblo.some((x) => x.nombre === c.nombre);
              const asequible = v.yo.monedas >= coste;
              return <Carta key={c.uid} c={c} coste={coste} deshabilitada={!puedeConstruir || !asequible || dup} onClick={() => enviar('construir', { uid: c.uid })}
                etiqueta={dup ? 'Ya tienes uno igual' : !asequible && puedeConstruir ? `Te faltan ${coste - v.yo.monedas}` : puedeConstruir ? 'Construir' : ''} />;
            })}
          </div>
        )}
      </div>

      <button type="button" className="big full" disabled={!t.basica || !!pend} onClick={() => enviar('terminar')}><Icon name="forward" size={22} /> Terminar turno</button>
    </div>
  );
}

export function FaseTurnos({ v, enviar }) {
  const t = v.turno;
  const mio = t && t.jugadorId === v.yo.id;
  return (
    <div className="fd-wrap">
      <BarraObra v={v} />
      {t && !mio && (
        <div className="fd-card fd-center">
          <h2>Turno del {t.rolNombre}</h2>
          <p><b>{t.nombre}</b> está jugando{t.bloqueada ? ' (clausurado)' : ''}…</p>
          {v.yo.rol !== null && <p className="fd-muted">Tu oficio esta ronda: {nombreRol(v.yo.rol)}{v.yo.rol === 0 ? ' (Peón: perdiste un empate)' : ''}. {v.jugadores.find((j) => j.id === v.yo.id).rolRevelado !== null ? 'Ya has actuado.' : 'Todavía no te ha tocado.'}</p>}
        </div>
      )}
      {mio && <MiTurno v={v} enviar={enviar} />}
      {!mio && <MiMano v={v} />}
      <Marcador v={v} />
      <Registro v={v} abierto={!mio} />
    </div>
  );
}

export function PantallaFin({ v, puntosTotales, children }) {
  const f = v.fin;
  const nombres = f.ganadores.map((id) => v.jugadores.find((j) => j.id === id)?.nombre).join(' y ');
  return (
    <div className="fd-wrap">
      <div className="fd-fin">
        <Icon name="trophy" size={56} strokeWidth={1.7} />
        <h1>{nombres} {f.ganadores.length > 1 ? 'ganan' : 'gana'}</h1>
        <p style={{ margin: 0, fontWeight: 600 }}>{{ inauguracion: `El pueblo se ha inaugurado tras ${v.ronda} rondas.`, sin_planos: 'Se acabaron los planos: la obra termina aquí.', tiempo: 'Se acabó el tiempo de obra.', abandono: 'Los demás fundadores se marcharon.' }[f.motivo] || 'Fin de la partida.'}</p>
      </div>
      <div className="fd-card">
        <h3>Resultado</h3>
        <div className="fd-tabla">
          {f.tabla.map((x, i) => (
            <div key={x.id} className={`fd-fila ${f.ganadores.includes(x.id) ? 'ganador' : ''}`}>
              <div className="fd-fila-top"><span>{i + 1}. {x.nombre}{x.id === v.yo.id ? ' (tú)' : ''}{x.fuera ? ' (se fue)' : ''}</span><span>{x.total} pts{puntosTotales ? ` · total ${puntosTotales[x.id] ?? 0}` : ''}</span></div>
              <small>{x.edificios} edificios = {x.base} · variedad +{x.variedad} · hogares +{x.hogares} · inauguración +{x.inauguracion} · {x.monedas} monedas</small>
            </div>
          ))}
        </div>
      </div>
      <Marcador v={v} />
      <Registro v={v} />
      {children}
    </div>
  );
}

// ---------------------------------------------------------------- Modal de Ayuda (Estilizado y legible)
export function Ayuda({ onCerrar }) {
  return (
    <div className="rg-modal-fondo" onClick={onCerrar}>
      <div
        className="rg-modal aprox-modal-ayuda"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '560px',
          maxHeight: '88vh',
          overflowY: 'auto',
          textAlign: 'left',
          padding: '1.4rem'
        }}
      >
        <div className="aprox-modal-header" style={{ marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.6rem' }}>
          <span className="aprox-modal-signo-title">?</span>
          <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#1e1b4b' }}>¿Cómo se juega a Fundadores?</h3>
        </div>

        <div className="aprox-modal-cuerpo" style={{ fontSize: '0.92rem', lineHeight: '1.5', color: '#334155' }}>
          <div style={{ marginBottom: '1.1rem' }}>
            <h4 style={{ color: '#0f172a', margin: '0 0 0.3rem', fontSize: '1rem' }}>🎯 Objetivo</h4>
            <p style={{ margin: 0 }}>
              Todos levantáis <strong>un mismo pueblo</strong>, cada uno su propio barrio. Cuando entre todos se alcance la <strong>meta de obra común</strong>, el pueblo se inaugura y gana quien haya acumulado más prestigio.
            </p>
          </div>

          <div style={{ marginBottom: '1.1rem' }}>
            <h4 style={{ color: '#0f172a', margin: '0 0 0.3rem', fontSize: '1rem' }}>⏳ En cada ronda</h4>
            <ol style={{ paddingLeft: '1.2rem', margin: '0.3rem 0' }}>
              <li style={{ marginBottom: '0.35rem' }}>
                <strong>1. Elegir oficio (en secreto y a la vez):</strong> Hay 8 oficios. Si dos jugadores eligen el mismo, se lo queda quien tenga prioridad; el otro actúa de Peón y recibe 1 moneda de consuelo[cite: 50, 56].
              </li>
              <li style={{ marginBottom: '0.35rem' }}>
                <strong>2. Turnos por orden (1 al 8):</strong> En tu turno realizas tu <em>acción básica</em> (cobrar jornal o proyectar planos), usas la <em>habilidad</em> del oficio y puedes <em>construir</em>[cite: 50, 56].
              </li>
            </ol>
          </div>

          <div style={{ marginBottom: '1.1rem' }}>
            <h4 style={{ color: '#0f172a', margin: '0 0 0.3rem', fontSize: '1rem' }}>🏛️ Edificios y Ventajas pasivas</h4>
            <ul style={{ paddingLeft: '1.2rem', margin: '0.3rem 0' }}>
              <li style={{ marginBottom: '0.3rem' }}><strong>Comercio:</strong> +1 moneda por jornal (máx. 2)[cite: 50, 56].</li>
              <li style={{ marginBottom: '0.3rem' }}><strong>Taller:</strong> Cada 2 talleres, tus edificios cuestan 1 moneda menos (mín. 1)[cite: 50, 56].</li>
              <li style={{ marginBottom: '0.3rem' }}><strong>Saber:</strong> Cada 2 de saber, ves 1 plano más al proyectar[cite: 50, 56].</li>
              <li style={{ marginBottom: '0.3rem' }}><strong>Hogar:</strong> Cada 3 hogares, sumas +1 de prestigio al final[cite: 50, 56].</li>
              <li style={{ marginBottom: '0.3rem' }}><strong>Hitos:</strong> Edificios únicos con efectos especiales potentes. No puedes tener dos edificios iguales[cite: 50, 56].</li>
            </ul>
          </div>

          <div style={{ marginBottom: '1.1rem' }}>
            <h4 style={{ color: '#0f172a', margin: '0 0 0.3rem', fontSize: '1rem' }}>🏆 Puntuación y Final</h4>
            <ul style={{ paddingLeft: '1.2rem', margin: '0.3rem 0' }}>
              <li>Prestigio base de todos tus edificios[cite: 50, 56].</li>
              <li><strong>+3 puntos de variedad:</strong> Si tienes los 4 tipos básicos de edificios en tu pueblo[cite: 50, 56].</li>
              <li><strong>+1 punto:</strong> Por cada 3 hogares que hayas construido[cite: 50, 56].</li>
              <li><strong>+3 puntos de inauguración:</strong> Si pusiste la última piedra de la obra común[cite: 50, 56].</li>
              <li><em>En caso de empate a puntos, gana quien conserve más monedas[cite: 50, 56].</em></li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#0f172a', margin: '0 0 0.3rem', fontSize: '1rem' }}>🎭 Los 8 Oficios</h4>
            <ul style={{ paddingLeft: '1.2rem', margin: '0.3rem 0' }}>
              {ROLES.map((r) => (
                <li key={r.id} style={{ marginBottom: '0.35rem' }}>
                  <strong>{r.id}. {r.nombre}:</strong> {r.desc}[cite: 50, 56]
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rg-modal-acciones" style={{ marginTop: '1.2rem' }}>
          <button type="button" className="big full" onClick={onCerrar}>
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}

export function PantallaDeFase({ v, enviar }) {
  if (v.fase === 'elegir') return <FaseElegir key={v.ronda} v={v} enviar={enviar} />;
  if (v.fase === 'turnos') return <FaseTurnos v={v} enviar={enviar} />;
  return null;
}