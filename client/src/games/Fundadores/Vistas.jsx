// client/src/games/Fundadores/Vistas.jsx
// Pantallas de «Fundadores» (las comparten el modo online y el de un solo dispositivo), con el estilo de los
// juegos renovados: cabecera con degradado, tarjetas blancas, botones en relieve y barra de acciones abajo.
// Reciben `v` (la vista de un jugador que genera engine.vistaDe) y `enviar(tipo, datos)`.
import { useRegistrarPartida, resultadoDesdeFin } from '../../lib/registros.js';
import React, { useEffect, useState } from 'react';
import Icon from './IconoF.jsx';
import { ROLES, ROL, TIPOS, ORDEN_TIPOS, SINGULARES, AJUSTES, DURACIONES } from './engine.js';
import './Fundadores.css';

export const COLORES = ['#ef4444', '#2563eb', '#16a34a', '#f59e0b', '#9333ea', '#ec4899', '#0d9488', '#ea580c', '#475569'];
export const colorDe = (id) => COLORES[((Number(id) || 1) - 1) % COLORES.length];
const inicial = (n) => (n || '?').trim().charAt(0).toUpperCase();
const pl = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;

export function Avatar({ id, nombre, grande = false }) {
  return <span className={`fdp-avatar${grande ? ' grande' : ''}`} style={{ '--c': colorDe(id) }}>{inicial(nombre)}</span>;
}

function Monedas({ n, claro = false }) {
  return <span className={`fdp-monedas${claro ? ' claro' : ''}`}><Icon name="coin" size={14} /> {n}</span>;
}

/** Carta de plano / edificio. */
export function Plano({ c, coste = c.coste, onClick, motivo, accion, mini = false, seleccionado = false }) {
  const tipo = TIPOS[c.tipo];
  const contenido = (
    <>
      <span className="fdp-plano-tipo"><Icon name={tipo.icono} size={13} /> {tipo.nombre}</span>
      <strong className="fdp-plano-nombre">{c.nombre}</strong>
      {!mini && c.texto && <span className="fdp-plano-texto">{c.texto}</span>}
      <span className="fdp-plano-pie">
        <span className={`fdp-plano-coste${coste < c.coste ? ' rebajado' : ''}`}><Icon name="coin" size={13} /> {coste}</span>
        <span className="fdp-plano-pts">{c.puntos} pts</span>
      </span>
      {accion && <span className={`fdp-plano-accion${motivo ? ' no' : ''}`}>{motivo || accion}</span>}
    </>
  );
  const clase = `fdp-plano${mini ? ' mini' : ''}${seleccionado ? ' sel' : ''}${onClick && !motivo ? ' activo' : ''}`;
  if (!onClick) return <div className={clase} style={{ '--t': tipo.color }}>{contenido}</div>;
  return (
    <button type="button" className={clase} style={{ '--t': tipo.color }} onClick={onClick} disabled={Boolean(motivo)}>
      {contenido}
    </button>
  );
}

function CartaRol({ rol, onClick, sel = false, estado = '', pie = null }) {
  const r = ROL[rol];
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag type={onClick ? 'button' : undefined} className={`fdp-rol ${estado}${sel ? ' sel' : ''}`} onClick={onClick}>
      <span className="fdp-rol-num">{r.id}</span>
      <span className="fdp-rol-ico"><Icon name={r.icono} size={22} /></span>
      <span className="fdp-rol-textos">
        <strong>{r.nombre}</strong>
        <small>{r.desc}</small>
        {pie}
      </span>
    </Tag>
  );
}

// ---------------------------------------------------------------- Cabecera
export function Hero({ v, onSalir, etiqueta, titulo, clase = '' }) {
  return (
    <header className={`fdp-hero ${clase}`}>
      <span className="fdp-tejados" aria-hidden="true" />
      <div className="fdp-hero-top">
        <button type="button" className="fdp-salir" onClick={onSalir}><Icon name="door" size={15} /> Salir</button>
        <div className="fdp-chips">
          <span className="fdp-chip">Ronda {v.ronda}</span>
          <span className="fdp-chip" title="Edificios para completar el pueblo"><Icon name="home" size={13} /> {v.meta}</span>
          <span className="fdp-chip" title="Planos en el mazo"><Icon name="scroll" size={13} /> {v.mazo}</span>
        </div>
      </div>
      {etiqueta && <p className="fdp-hero-etiqueta">{etiqueta}</p>}
      {titulo && <h1 className="fdp-hero-titulo">{titulo}</h1>}
      <div className="fdp-marcador">
        {v.jugadores.map((j) => {
          const activo = v.turno?.jugadorId === j.id || v.eleccion?.turnoDe === j.id;
          return (
            <span key={j.id} className={`fdp-marca${activo ? ' turno' : ''}${j.id === v.yo?.id ? ' yo' : ''}${j.fuera ? ' fuera' : ''}`}>
              <Avatar id={j.id} nombre={j.nombre} />
              <span className="fdp-marca-nombre">{j.nombre}</span>
              {v.sello === j.id && <span title="Tiene el sello: elige oficio el primero">👑</span>}
              <span className="fdp-marca-datos"><Icon name="home" size={12} />{j.pueblo.length}/{v.meta} · <Icon name="coin" size={12} />{j.monedas}</span>
              {j.rol && <em>{j.rol}</em>}
              {j.completo && <b title="Pueblo completo">✓</b>}
            </span>
          );
        })}
      </div>
      {v.fase !== 'fin' && (
        <div className="fdp-ronda-roles" aria-label="Oficios de la ronda">
          {ROLES.map((r) => {
            const retirado = v.retirados.includes(r.id);
            const hecho = v.turnoRol && r.id < v.turnoRol;
            const ahora = v.turnoRol === r.id;
            const dueno = hecho || ahora ? v.jugadores.find((j) => j.rol === r.id) : null;
            return (
              <span key={r.id} title={`${r.id}. ${r.nombre}${retirado ? ' (no se presenta)' : ''}`}
                className={`fdp-mini-rol${retirado ? ' retirado' : ''}${hecho ? ' hecho' : ''}${ahora ? ' ahora' : ''}${v.saboteado === r.id ? ' saboteado' : ''}${v.yo?.rol === r.id ? ' mio' : ''}`}>
                <Icon name={r.icono} size={14} />
                <i>{r.id}</i>
                {dueno && !retirado && <b style={{ '--c': colorDe(dueno.id) }}>{inicial(dueno.nombre)}</b>}
              </span>
            );
          })}
        </div>
      )}
    </header>
  );
}

// ---------------------------------------------------------------- Elección de oficio
function Eleccion({ v, enviar }) {
  const [sel, setSel] = useState(null);
  const e = v.eleccion;
  const yoElijo = e.turnoDe === v.yo.id;
  useEffect(() => { setSel(null); }, [v.ronda, e.turnoDe]);
  const quien = v.jugadores.find((j) => j.id === e.turnoDe);
  const ultimo = e.quedan === 1;

  if (!yoElijo) {
    return (
      <div className="fdp-tarjeta fdp-centro">
        {v.yo.rol ? (
          <>
            <p className="fdp-etiqueta centrada">Tu oficio esta ronda (secreto)</p>
            <CartaRol rol={v.yo.rol} estado="elegido" />
          </>
        ) : (
          <p className="fdp-texto">Cuando te toque verás los oficios que queden.</p>
        )}
        <p className="fdp-esperando-txt"><Icon name="hourglass" size={16} /> {quien?.nombre} está eligiendo… (quedan {e.quedan})</p>
      </div>
    );
  }
  return (
    <>
      <div className="fdp-tarjeta">
        <p className="fdp-etiqueta">{ultimo ? 'Solo queda este oficio' : `Elige en secreto · quedan ${e.quedan}`}</p>
        <div className="fdp-roles">
          {e.pool.map((r) => <CartaRol key={r} rol={r} sel={sel === r || ultimo} onClick={() => setSel(r)} />)}
        </div>
        {v.retirados.length > 0 && <p className="fdp-pista">No se presentan esta ronda: {v.retirados.map((r) => ROL[r].nombre).join(', ')}.</p>}
      </div>
      <div className="fdp-barra">
        <button type="button" className="fdp-boton grande" disabled={!sel && !ultimo} onClick={() => enviar('elegir-rol', { rol: ultimo ? e.pool[0] : sel })}>
          <Icon name="check" size={20} strokeWidth={2.5} /> {sel || ultimo ? `Ser ${ROL[ultimo ? e.pool[0] : sel].nombre}` : 'Elige un oficio'}
        </button>
      </div>
    </>
  );
}

// ---------------------------------------------------------------- Turno
const PASOS = [['recurso', 'Cobrar'], ['habilidad', 'Habilidad'], ['construir', 'Construir']];

function Pasos({ paso }) {
  const idx = paso === 'planos' ? 0 : PASOS.findIndex(([p]) => p === paso);
  return (
    <div className="fdp-pasos">
      {PASOS.map(([p, t], i) => <span key={p} className={i < idx ? 'hecho' : i === idx ? 'ahora' : ''}><b>{i + 1}</b> {t}</span>)}
    </div>
  );
}

function ElegirOficio({ v, valor, setValor, filtro }) {
  return (
    <div className="fdp-pildoras">
      {v.enJuego.filter(filtro).map((r) => (
        <button key={r} type="button" className={`fdp-pildora${valor === r ? ' activo' : ''}`} onClick={() => setValor(r)}>{r}. {ROL[r].nombre}</button>
      ))}
    </div>
  );
}

function Habilidad({ v, enviar }) {
  const rol = v.turno.rol;
  const [objetivo, setObjetivo] = useState(null);
  const [victima, setVictima] = useState(null);
  const [edificio, setEdificio] = useState(null);
  const yo = v.jugadores.find((j) => j.id === v.yo.id);
  const derribables = v.jugadores.filter((j) => j.id !== v.yo.id && !j.fuera && j.pueblo.length < v.meta && v.protegidoId !== j.id && !j.pueblo.some((c) => c.efecto === 'empalizada') && j.pueblo.length);
  const victimaJ = v.jugadores.find((j) => j.id === victima);
  const precio = edificio ? Math.max(0, edificio.coste - 1) : 0;

  let controles = null;
  let listo = true;
  let params = {};
  if (rol === 1) {
    controles = <ElegirOficio v={v} valor={objetivo} setValor={setObjetivo} filtro={(r) => r !== 1} />;
    listo = objetivo != null; params = { rol: objetivo };
  } else if (rol === 2) {
    controles = <ElegirOficio v={v} valor={objetivo} setValor={setObjetivo} filtro={(r) => r > 2 && r !== v.saboteado} />;
    listo = objetivo != null; params = { rol: objetivo };
  } else if (rol === 8) {
    controles = derribables.length ? (
      <>
        <p className="fdp-pista izquierda">Opcional: elige un pueblo y un edificio para derribar.</p>
        <div className="fdp-pildoras">
          {derribables.map((j) => (
            <button key={j.id} type="button" className={`fdp-pildora${victima === j.id ? ' activo' : ''}`} onClick={() => { setVictima(victima === j.id ? null : j.id); setEdificio(null); }}>{j.nombre}</button>
          ))}
        </div>
        {victimaJ && (
          <div className="fdp-planos mini">
            {victimaJ.pueblo.map((c) => (
              <Plano key={c.uid} c={c} mini seleccionado={edificio?.uid === c.uid} onClick={() => setEdificio(edificio?.uid === c.uid ? null : c)}
                motivo={Math.max(0, c.coste - 1) > yo.monedas ? 'Sin monedas' : null} accion={`Derribar (${Math.max(0, c.coste - 1)})`} />
            ))}
          </div>
        )}
      </>
    ) : <p className="fdp-pista izquierda">No hay pueblos que puedas derribar ahora.</p>;
    params = edificio ? { derribo: { jugadorId: victima, uid: edificio.uid } } : {};
  }

  return (
    <div className="fdp-tarjeta">
      <p className="fdp-etiqueta">Paso 2 · tu habilidad</p>
      <CartaRol rol={rol} estado="elegido" />
      {controles && <div style={{ marginTop: '0.7rem' }}>{controles}</div>}
      <div className="fdp-dos" style={{ marginTop: '0.8rem' }}>
        <button type="button" className="fdp-boton secundario" onClick={() => enviar('omitir')}>No usarla</button>
        <button type="button" className="fdp-boton" disabled={!listo} onClick={() => enviar('habilidad', { params })}>
          <Icon name={ROL[rol].icono} size={18} /> {rol === 8 && edificio ? `Cobrar y derribar (${precio})` : 'Usar'}
        </button>
      </div>
    </div>
  );
}

function MiTurno({ v, enviar }) {
  const t = v.turno;
  const [descarte, setDescarte] = useState(false);
  const ventajas = v.yo.ventajas;
  const nPlanos = AJUSTES.planosRobo + (ventajas.includes('atalaya') ? 1 : 0);
  const quedar = 1 + (ventajas.includes('archivo') ? 1 : 0);

  if (t.paso === 'recurso') {
    return (
      <div className="fdp-tarjeta">
        <p className="fdp-etiqueta">Paso 1 · ¿qué prefieres?</p>
        <div className="fdp-dos">
          <button type="button" className="fdp-opcion" onClick={() => enviar('recurso', { recurso: 'monedas' })}>
            <span className="fdp-opcion-ico oro"><Icon name="coin" size={28} /></span>
            <strong>Cobrar {AJUSTES.cobro} monedas</strong>
          </button>
          <button type="button" className="fdp-opcion" disabled={v.mazo === 0} onClick={() => enviar('recurso', { recurso: 'planos' })}>
            <span className="fdp-opcion-ico"><Icon name="scroll" size={28} /></span>
            <strong>Tomar planos</strong>
            <small>Robas {nPlanos} y te quedas {quedar === 1 ? '1' : quedar}</small>
          </button>
        </div>
      </div>
    );
  }
  if (t.paso === 'planos') {
    return (
      <div className="fdp-tarjeta">
        <p className="fdp-etiqueta">Elige {t.quedar === 1 ? 'el plano que te quedas' : `${t.quedar} planos más`}</p>
        <div className="fdp-planos">
          {t.pendiente.map((c) => <Plano key={c.uid} c={c} onClick={() => enviar('plano', { uid: c.uid })} accion="Quedármelo" />)}
        </div>
      </div>
    );
  }
  if (t.paso === 'habilidad') return <Habilidad v={v} enviar={enviar} />;

  // construir
  const restan = t.limite - t.construidos;
  return (
    <>
      <div className="fdp-tarjeta">
        <p className="fdp-etiqueta">Paso 3 · construir {restan > 0 ? `(puedes ${restan === 1 ? '1 edificio más' : `${restan} edificios más`})` : '(ya no puedes más)'}</p>
        {v.yo.mano.length === 0 ? <p className="fdp-texto">No tienes planos. La próxima vez toma planos en vez de monedas.</p> : (
          <div className="fdp-planos">
            {v.yo.mano.map((c) => (
              <Plano key={c.uid} c={c} coste={c.costeReal} motivo={c.motivo} accion="Construir"
                onClick={() => (descarte ? (setDescarte(false), enviar('edificio', { efecto: 'abastos', params: { uid: c.uid } })) : enviar('construir', { uid: c.uid }))} />
            ))}
          </div>
        )}
        {(ventajas.includes('imprenta') || ventajas.includes('abastos')) && (
          <div className="fdp-ventajas">
            {ventajas.includes('imprenta') && (
              <button type="button" className="fdp-pildora" disabled={t.usados.imprenta || v.yo.monedas < 1} onClick={() => enviar('edificio', { efecto: 'imprenta' })}>
                Imprenta: 1 moneda → 1 plano{t.usados.imprenta ? ' ✓' : ''}
              </button>
            )}
            {ventajas.includes('abastos') && (
              <button type="button" className={`fdp-pildora${descarte ? ' activo' : ''}`} disabled={t.usados.abastos || !v.yo.mano.length} onClick={() => setDescarte((x) => !x)}>
                {descarte ? 'Toca el plano que descartas…' : `Mercado de abastos: plano → 2 monedas${t.usados.abastos ? ' ✓' : ''}`}
              </button>
            )}
          </div>
        )}
      </div>
      <div className="fdp-barra">
        <button type="button" className="fdp-boton grande" onClick={() => enviar('terminar')}>
          <Icon name="check" size={20} strokeWidth={2.5} /> Terminar mi turno
        </button>
      </div>
    </>
  );
}

function TurnoAjeno({ v }) {
  const t = v.turno;
  const j = v.jugadores.find((x) => x.id === t.jugadorId);
  const r = ROL[t.rol];
  const texto = { recurso: 'está decidiendo si cobra o toma planos', planos: 'está eligiendo planos', habilidad: 'va a usar su habilidad', construir: 'está construyendo' }[t.paso];
  return (
    <div className="fdp-tarjeta">
      <div className="fdp-ajeno">
        <Avatar id={j.id} nombre={j.nombre} grande />
        <div>
          <p className="fdp-etiqueta">{r.id}. {r.nombre}</p>
          <h2 className="fdp-titulo izquierda">{j.nombre} {texto}</h2>
        </div>
      </div>
      <p className="fdp-texto">{r.desc}</p>
    </div>
  );
}

// ---------------------------------------------------------------- Pueblos
function Pueblo({ j, meta, propio = false }) {
  const porTipo = ORDEN_TIPOS.map((t) => [t, j.pueblo.filter((c) => c.tipo === t)]).filter(([, l]) => l.length);
  const tipos = new Set(j.pueblo.map((c) => c.tipo)).size;
  return (
    <div className="fdp-pueblo">
      <div className="fdp-pueblo-cab">
        <span><Avatar id={j.id} nombre={j.nombre} /> <strong>{propio ? 'Tu pueblo' : j.nombre}</strong></span>
        <span className="fdp-pueblo-datos">{j.pueblo.length}/{meta} · {tipos}/5 tipos · {j.puntos} pts{j.medallas ? ` · 🏅${j.medallas}` : ''}</span>
      </div>
      <div className="fdp-pueblo-barra"><div style={{ width: `${Math.min(100, (j.pueblo.length / meta) * 100)}%` }} /></div>
      {porTipo.length === 0 ? <p className="fdp-pista izquierda">Todavía no hay edificios.</p> : (
        <div className="fdp-planos mini">
          {porTipo.flatMap(([, l]) => l).map((c) => <Plano key={c.uid} c={c} mini />)}
        </div>
      )}
    </div>
  );
}

export function Registro({ v, abierto = false }) {
  if (!v.log?.length) return null;
  return (
    <details className="fdp-detalle" open={abierto}>
      <summary><Icon name="book" size={16} /> Lo que ha pasado</summary>
      <div className="fdp-log">
        {[...v.log].reverse().map((l, i) => <p key={i} className={l.texto.startsWith('—') ? 'ronda' : ''}>{l.texto}</p>)}
      </div>
    </details>
  );
}

// ---------------------------------------------------------------- Pantalla de partida
export function PantallaJuego({ v, enviar, onSalir, admin = null }) {
  const yo = v.jugadores.find((j) => j.id === v.yo.id);
  const miTurno = v.turno?.jugadorId === v.yo.id;
  const eligiendo = v.fase === 'eleccion';
  let etiqueta; let titulo;
  if (eligiendo) {
    const quien = v.jugadores.find((j) => j.id === v.eleccion.turnoDe);
    etiqueta = `Ronda ${v.ronda} · elección de oficios`;
    titulo = v.eleccion.turnoDe === v.yo.id ? 'Elige tu oficio' : `Elige ${quien?.nombre}`;
  } else {
    const quien = v.jugadores.find((j) => j.id === v.turno?.jugadorId);
    etiqueta = `Turno del ${v.turno?.rol}. ${ROL[v.turno?.rol]?.nombre ?? ''}`;
    titulo = miTurno ? 'Tu turno' : `Juega ${quien?.nombre}`;
  }
  const otros = v.jugadores.filter((j) => j.id !== v.yo.id);
  const faltaQuien = eligiendo ? v.eleccion.turnoDe : v.turno?.jugadorId;
  return (
    <>
      <Hero v={v} onSalir={onSalir} etiqueta={etiqueta} titulo={titulo} clase={miTurno || (eligiendo && v.eleccion.turnoDe === v.yo.id) ? 'mio' : ''} />

      {(v.saboteado || v.cobrado) && !eligiendo && (
        <div className="fdp-avisos">
          {v.saboteado && <span className="mal"><Icon name="bomb" size={14} /> {ROL[v.saboteado].nombre} saboteado</span>}
          {v.cobrado && <span><Icon name="briefcase" size={14} /> El Cobrador va a por el {ROL[v.cobrado].nombre}</span>}
        </div>
      )}

      {miTurno && <Pasos paso={v.turno.paso} />}
      {eligiendo ? <Eleccion v={v} enviar={enviar} /> : miTurno ? <MiTurno v={v} enviar={enviar} /> : v.turno && <TurnoAjeno v={v} />}

      {!eligiendo && v.yo.rol && !miTurno && (
        <div className="fdp-tarjeta fdp-tu-rol">
          <p className="fdp-etiqueta">Tu oficio esta ronda</p>
          <CartaRol rol={v.yo.rol} estado={v.turnoRol > v.yo.rol ? 'hecho' : 'elegido'} pie={v.saboteado === v.yo.rol ? <em className="fdp-sabotaje">¡Te han saboteado!</em> : null} />
        </div>
      )}

      <div className="fdp-tarjeta">
        <Pueblo j={yo} meta={v.meta} propio />
        {!miTurno || v.turno?.paso !== 'construir' ? (
          <>
            <p className="fdp-etiqueta" style={{ marginTop: '0.9rem' }}><Icon name="scroll" size={14} /> Tus planos ({v.yo.mano.length}) · <Monedas n={v.yo.monedas} /></p>
            {v.yo.mano.length ? (
              <div className="fdp-planos mini">{v.yo.mano.map((c) => <Plano key={c.uid} c={c} mini />)}</div>
            ) : <p className="fdp-pista izquierda">No tienes planos.</p>}
          </>
        ) : <p className="fdp-etiqueta" style={{ marginTop: '0.9rem' }}>Tienes <Monedas n={v.yo.monedas} /></p>}
      </div>

      <details className="fdp-detalle">
        <summary><Icon name="users" size={16} /> Pueblos de los demás</summary>
        {otros.map((j) => (
          <div key={j.id} className="fdp-otro">
            <Pueblo j={j} meta={v.meta} />
            <p className="fdp-pista izquierda">{pl(j.planos, 'plano', 'planos')} en la mano · {pl(j.monedas, 'moneda', 'monedas')}{j.fuera ? ' · abandonó' : ''}</p>
          </div>
        ))}
      </details>
      <Registro v={v} />

      {admin?.esAdmin && faltaQuien !== v.yo.id && admin.desconectados?.includes(faltaQuien) && (
        <div className="fdp-barra estatica">
          <button type="button" className="fdp-enlace" onClick={admin.onForzar}>
            <Icon name="forward" size={15} /> ¿No responde? Saltar a {v.jugadores.find((j) => j.id === faltaQuien)?.nombre}
          </button>
        </div>
      )}
    </>
  );
}

// ---------------------------------------------------------------- Final
export function PantallaFin({ v, onSalir, yoId = v.yo?.id, children }) {
  useRegistrarPartida('fundadores', resultadoDesdeFin(v));
  const f = v.fin;
  const nombre = (id) => v.jugadores.find((j) => j.id === id)?.nombre ?? '?';
  const ganadores = f.ganadores.map(nombre);
  const top = f.tabla.filter((x) => !x.fuera).slice(0, 3);
  const colocacion = top.length === 3 ? [top[1], top[0], top[2]] : top.length === 2 ? [top[1], top[0]] : top;
  const alturas = ['primero', 'segundo', 'tercero'];
  return (
    <>
      <Hero v={v} onSalir={onSalir} etiqueta="El pueblo está terminado" titulo={ganadores.length > 1 ? `Empate: ${ganadores.join(' y ')}` : `¡Gana ${ganadores[0]}!`} clase="fin" />
      <div className="fdp-tarjeta fdp-centro">
        <p className="fdp-etiqueta centrada">El mejor pueblo</p>
        <div className="fdp-podio">
          {colocacion.map((x) => {
            const puesto = top.indexOf(x);
            return (
              <div key={x.id} className={`fdp-podio-col ${alturas[puesto]}`} style={{ '--c': colorDe(x.id) }}>
                <Avatar id={x.id} nombre={x.nombre} grande />
                <span className="fdp-podio-nombre">{x.nombre}{x.id === yoId ? ' (tú)' : ''}</span>
                <span className="fdp-podio-pts">{x.total} pts</span>
                <span className="fdp-podio-base">{puesto + 1}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="fdp-tarjeta">
        <p className="fdp-etiqueta">Recuento de puntos</p>
        <div className="fdp-tabla">
          <div className="cab"><span>Jugador</span><span title="Edificios">🏠</span><span title="Variedad (5 tipos)">🎨</span><span title="Pueblo completo">✓</span><span title="Monedas sobrantes">🪙</span><span title="Medallas">🏅</span><span title="Ventajas de edificios">✨</span><strong>Total</strong></div>
          {f.tabla.map((x) => (
            <div key={x.id} className={f.ganadores.includes(x.id) ? 'gana' : ''}>
              <span className="fdp-tabla-nombre"><Avatar id={x.id} nombre={x.nombre} /> {x.nombre}{x.fuera ? ' (abandonó)' : ''}</span>
              <span>{x.edificios}</span><span>{x.variedad}</span><span>{x.completar}</span><span>{x.monedas}</span><span>{x.medallas}</span><span>{x.ventajas}</span>
              <strong>{x.total}</strong>
            </div>
          ))}
        </div>
        <p className="fdp-pista izquierda">Edificios: sus puntos · Variedad: +{AJUSTES.bonusVariedad} con los 5 tipos · Completar: +{AJUSTES.bonusPrimero} el primero, +{AJUSTES.bonusCompleto} los demás · 1 punto por cada {AJUSTES.monedasPorPunto} monedas · +{AJUSTES.puntosMedalla} por medalla · ventajas de Puerto y Fuente. Empate: más monedas.</p>
      </div>
      {v.jugadores.map((j) => <div key={j.id} className="fdp-tarjeta"><Pueblo j={j} meta={v.meta} propio={j.id === yoId} /></div>)}
      <Registro v={v} />
      {children}
    </>
  );
}

// ---------------------------------------------------------------- Ayuda
export function Ayuda({ onCerrar, titulo = 'Fundadores', descripcion }) {
  return (
    <div className="rg-modal-fondo" onClick={onCerrar}>
      <div className="rg-modal qq-modal-ayuda" onClick={(e) => e.stopPropagation()}>
        <div className="qq-modal-ayuda-header">
          <span className="qq-ayuda-badge">❓ Cómo jugar</span>
          <h3>{titulo}</h3>
        </div>
        <div className="qq-modal-ayuda-body">
          {descripcion && <p>{descripcion}</p>}
          <p className="fdp-ayuda-sub">🏗️ Objetivo</p>
          <ul>
            <li>Cada uno levanta su propio pueblo. Empiezas con {AJUSTES.monedasIni} monedas y {AJUSTES.planosIni} planos.</li>
            <li>Cuando alguien completa su pueblo ({DURACIONES.corto}, {DURACIONES.normal} u {DURACIONES.largo} edificios, según la duración) se acaba esa ronda y gana el mejor pueblo.</li>
          </ul>
          <p className="fdp-ayuda-sub">🎭 Cada ronda</p>
          <ul>
            <li>Se retiran al azar algunos de los 10 oficios: quedan tantos como jugadores (los retirados se ven).</li>
            <li>Por orden, empezando por quien tiene el sello 👑, cada uno elige un oficio <strong>en secreto</strong>.</li>
            <li>Los oficios se llaman por número (1 → 10). Al llamarte, se descubre tu oficio y juegas tu turno:</li>
          </ul>
          <ol>
            <li><strong>Cobrar:</strong> {AJUSTES.cobro} monedas, o robar {AJUSTES.planosRobo} planos y quedarte 1.</li>
            <li><strong>Habilidad</strong> de tu oficio (puedes no usarla).</li>
            <li><strong>Construir</strong> un edificio de tu mano pagando su coste (no puedes repetir edificio).</li>
          </ol>
          <p className="fdp-ayuda-sub">📜 Los oficios</p>
          <ul>
            {ROLES.map((r) => <li key={r.id}><strong>{r.id}. {r.nombre}:</strong> {r.desc}</li>)}
          </ul>
          <p className="fdp-ayuda-sub">🏠 Edificios</p>
          <ul>
            {ORDEN_TIPOS.slice(0, 4).map((t) => <li key={t}><strong>{TIPOS[t].nombre}</strong>: cuestan lo que valen. Hay oficios que cobran por ellos.</li>)}
            <li><strong>Singulares</strong> (uno de cada): dan ventajas.
              <ul>{SINGULARES.map((s) => <li key={s.efecto}><strong>{s.nombre}</strong> ({s.coste}): {s.texto}</li>)}</ul>
            </li>
          </ul>
          <p className="fdp-ayuda-sub">🏆 Puntos al final</p>
          <ul>
            <li>Puntos de tus edificios · +{AJUSTES.bonusVariedad} si tienes los 5 tipos · +{AJUSTES.bonusPrimero} quien completa primero, +{AJUSTES.bonusCompleto} los demás que completen.</li>
            <li>1 punto por cada {AJUSTES.monedasPorPunto} monedas que te sobren · +{AJUSTES.puntosMedalla} por medalla · ventajas de tus edificios. Si hay empate, gana quien tenga más monedas.</li>
          </ul>
        </div>
        <button type="button" className="big full qq-btn-principal" onClick={onCerrar}>¡Entendido!</button>
      </div>
    </div>
  );
}
