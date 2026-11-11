// client/src/games/Laberinto/Partida.jsx
// Pantallas de «El Laberinto» (online y en un dispositivo): tablero con niebla, tu personaje y tus acciones.
import React, { useState } from 'react';
import Icon from '../../components/Icon.jsx';
import { Pildoras, useRestante, Cuenta } from '../Pulsador/Vistas.jsx';
import { BloqueConfig } from '../../components/MenuJuego.jsx';
import { PERSONAJES, CONTENIDO, AJUSTES } from './engine.js';
import './Laberinto.css';

const COLORES = ['#ef4444', '#2563eb', '#16a34a', '#f59e0b'];
const colorDe = (v, id) => COLORES[v.jugadores.findIndex((j) => j.id === id) % 4];
const nombreDe = (v, id) => v.jugadores.find((j) => j.id === id)?.nombre ?? '¿?';
const clave = (a, b) => (a < b ? `${a}-${b}` : `${b}-${a}`);

/** Estado de cada lado de una sala: paso, puerta, barricada, pared o desconocido. */
function lados(v, id) {
  const L = v.lado;
  const f = Math.floor(id / L); const c = id % L;
  const pasos = Object.fromEntries(v.pasos.map((x) => [clave(x.a, x.b), x]));
  const lado = (ff, cc) => {
    if (ff < 0 || cc < 0 || ff >= L || cc >= L) return 'borde';
    const otro = ff * L + cc;
    const x = pasos[clave(id, otro)];
    if (x) return x.barricada ? 'barricada' : x.t;
    return v.salas[id].descubierta || v.salas[otro].descubierta ? 'pared' : 'niebla';
  };
  return { N: lado(f - 1, c), S: lado(f + 1, c), E: lado(f, c + 1), O: lado(f, c - 1) };
}

export function Tablero({ v, marcadas = {}, onTocar }) {
  return (
    <div className="lbr-tablero" style={{ '--lado': v.lado }}>
      {v.salas.map((s) => {
        const l = lados(v, s.id);
        const aqui = v.jugadores.filter((j) => j.sala === s.id && !j.fuera);
        const marca = marcadas[s.id];
        const pista = v.yo?.pistas?.[s.id];
        const cepo = v.yo?.misCepos?.includes(s.id);
        const salida = v.esquinas.includes(s.id);
        return (
          <button key={s.id} type="button" disabled={!marca || !onTocar} onClick={() => onTocar?.(s.id)}
            className={`lbr-sala${s.descubierta ? '' : ' niebla'}${salida ? ' salida' : ''}${s.descubierta && s.contenido === 'corazon' ? ' corazon' : ''}${marca ? ` ${marca}` : ''}`}
            data-n={l.N} data-s={l.S} data-e={l.E} data-o={l.O} aria-label={`Sala ${s.id}`}>
            {s.descubierta && s.contenido !== 'vacia' && s.contenido !== 'salida' && <span className="lbr-cont">{CONTENIDO[s.contenido].e}{s.oro > 1 ? <sub>{s.oro}</sub> : null}</span>}
            {salida && <span className="lbr-cont salida">🚪</span>}
            {!s.descubierta && pista && <span className="lbr-pista">{pista}</span>}
            {cepo && <span className="lbr-micepo">🪤</span>}
            {aqui.length > 0 && (
              <span className="lbr-fichas">
                {aqui.map((j) => <i key={j.id} className={j.corazon ? 'lleva' : ''} style={{ '--c': colorDe(v, j.id) }} title={j.nombre}>{PERSONAJES[j.personaje].e}{j.corazon ? '💎' : ''}</i>)}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function Estado({ v }) {
  return (
    <div className="lbr-estado">
      {v.jugadores.map((j) => {
        const P = PERSONAJES[j.personaje];
        return (
          <div key={j.id} className={`lbr-ficha${v.turno?.jugadorId === j.id ? ' turno' : ''}${j.id === v.yo?.id ? ' yo' : ''}${j.fuera ? ' fuera' : ''}`} style={{ '--c': colorDe(v, j.id) }}>
            <span className="lbr-pj">{P.e}</span>
            <div>
              <strong>{j.nombre}{j.id === v.yo?.id ? ' (tú)' : ''}</strong>
              <small>{'❤️'.repeat(Math.max(0, j.vidas))} · 💰{j.oro}{j.llaves ? ` · 🔑${j.llaves}` : ''}{j.corazon ? ' · 💎' : ''}{j.escudo > 0 ? ' · 🛡️' : ''}</small>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Acciones({ v, enviar, modo, setModo }) {
  const yo = v.jugadores.find((j) => j.id === v.yo.id);
  const t = v.turno;
  const rivales = v.jugadores.filter((j) => j.id !== yo.id && j.sala === yo.sala && !j.fuera && (j.oro || j.corazon));
  const pactoCon = (id) => v.pactos.some((x) => x.entre.includes(id) && x.entre.includes(yo.id));
  const P = PERSONAJES[yo.personaje];
  return (
    <div className="pzp-tarjeta lbr-acciones">
      <p className="pzp-etiqueta">Tu turno · 👣 {t.pasos} {t.pasos === 1 ? 'paso' : 'pasos'} · {t.accion ? '✋ te queda la acción' : 'acción hecha'}</p>
      {modo ? (
        <div className="lbr-modo">
          <p>{modo === 'barricada' ? 'Toca el pasillo vecino que quieres bloquear.' : 'Toca la sala descubierta a la que quieres ir.'}</p>
          <button type="button" className="pzp-boton secundario" onClick={() => setModo(null)}>Cancelar</button>
        </div>
      ) : (
        <>
          <p className="pzp-nota">{t.pasos > 0 ? 'Toca una sala vecina iluminada para moverte.' : 'No te quedan pasos.'}</p>
          <div className="lbr-botones">
            {t.accion && rivales.filter((r) => !pactoCon(r.id)).map((r) => (
              <button key={r.id} type="button" className="lbr-accion" onClick={() => enviar('robar', { victima: r.id })}>🦹 Robar a {r.nombre}{r.corazon ? ' 💎' : ''}</button>
            ))}
            {t.accion && v.yo.objetos.includes('cepo') && <button type="button" className="lbr-accion" onClick={() => enviar('cepo')}>🪤 Dejar cepo aquí</button>}
            {t.accion && v.yo.objetos.includes('barricada') && <button type="button" className="lbr-accion" onClick={() => setModo('barricada')}>🚧 Poner barricada</button>}
            {t.accion && yo.personaje === 'mago' && (v.yo.recarga > 0 ? <span className="lbr-recarga">🔮 Teletransporte en {v.yo.recarga} turnos</span>
              : <button type="button" className="lbr-accion" disabled={yo.corazon} onClick={() => setModo('teletransporte')}>🔮 Teletransporte</button>)}
          </div>
          <details className="lbr-pacto">
            <summary>🤝 Proponer un pacto ({AJUSTES.rondasPacto} rondas sin robos ni trampas entre vosotros)</summary>
            <div className="lbr-botones">
              {v.jugadores.filter((j) => j.id !== yo.id && !j.fuera && !pactoCon(j.id)).map((j) => (
                <button key={j.id} type="button" className="lbr-accion" onClick={() => enviar('pacto', { a: j.id })}>{PERSONAJES[j.personaje].e} {j.nombre}</button>
              ))}
            </div>
          </details>
          <button type="button" className="pzp-boton" onClick={() => enviar('fin')}><Icon name="check" size={18} /> Terminar mi turno</button>
        </>
      )}
      <p className="lbr-yo">{P.e} <strong>{P.nombre}</strong>: {P.desc}{v.yo.objetos.length ? ` · Llevas: ${v.yo.objetos.map((o) => CONTENIDO[o].e).join(' ')}` : ''}</p>
    </div>
  );
}

function Propuestas({ v, enviar }) {
  if (!v.yo?.propuestas?.length) return null;
  return (
    <div className="pzp-tarjeta lbr-propuestas">
      {v.yo.propuestas.map((x) => (
        <div key={x.id}>
          <p>🤝 <strong>{nombreDe(v, x.de)}</strong> te propone un pacto de {AJUSTES.rondasPacto} rondas: ni robos, ni cepos, ni barricadas entre vosotros.</p>
          <div className="pzp-dos">
            <button type="button" className="pzp-boton secundario" onClick={() => enviar('responderPacto', { propuesta: x.id, acepta: false })}>No</button>
            <button type="button" className="pzp-boton" onClick={() => enviar('responderPacto', { propuesta: x.id, acepta: true })}>Aceptar</button>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Qué hay que hacer ahora mismo, en una frase. */
function Objetivo({ v }) {
  const lleva = v.jugadores.find((j) => j.corazon);
  const yo = v.yo && v.jugadores.find((j) => j.id === v.yo.id);
  let texto;
  if (!lleva) texto = '🎯 Llega al 💎 del centro y sácalo por cualquiera de las 🚪 salidas de las esquinas.';
  else if (yo && lleva.id === yo.id) texto = `🏃 ¡Lo llevas tú! Corre hacia una 🚪 esquina (das un paso menos).${yo.escudo > 0 ? ' 🛡️ Nadie puede robarte todavía.' : ' Cuidado: si te alcanzan, te lo pueden robar.'}`;
  else texto = lleva.escudo > 0 ? `🛡️ ${lleva.nombre} acaba de robar el Corazón y está protegido: no se le puede robar hasta dentro de ${lleva.escudo === 1 ? 'su próximo turno' : '2 rondas'}. ¡Córtale el paso a las salidas!`
    : `🦹 ${lleva.nombre} lleva el Corazón: alcánzale y róbaselo antes de que llegue a una 🚪 esquina.`;
  return <p className={`lbr-objetivo${lleva ? ' alerta' : ''}`}>{texto}</p>;
}

/** La partida (todo salvo el final). */
export function Partida({ v, enviar, onSalir, offset = 0, local = false, admin = false }) {
  const [modo, setModo] = useState(null);
  const restante = useRestante(local ? null : v.hasta, offset);
  const miTurno = v.yo && v.turno?.jugadorId === v.yo.id;
  const marcadas = {};
  if (miTurno) {
    if (modo === 'teletransporte') v.salas.forEach((s) => { if (s.descubierta) marcadas[s.id] = 'destino'; });
    else if (modo === 'barricada') v.yo.opciones.forEach((o) => { marcadas[o.id] = 'barrera'; });
    else if (v.turno.pasos > 0) v.yo.opciones.forEach((o) => { if (!o.motivo) marcadas[o.id] = o.puerta ? 'puerta' : 'destino'; });
  }
  const tocar = (id) => {
    if (modo === 'teletransporte') { enviar('teletransporte', { sala: id }); setModo(null); } else if (modo === 'barricada') { enviar('barricada', { sala: id }); setModo(null); } else enviar('mover', { sala: id });
  };
  const turnoDe = v.jugadores.find((j) => j.id === v.turno?.jugadorId);
  return (
    <>
      <header className="pzp-hero">
        <span className="pzp-hero-fondo" aria-hidden="true">🗝️</span>
        <div className="pzp-hero-top">
          <button type="button" className="pzp-salir" onClick={onSalir}><Icon name="door" size={15} /> Salir</button>
          <span className="pzp-chip">🗝️ Ronda {v.ronda}/{v.rondasMax}</span>
        </div>
        <p className="pzp-hero-etiqueta">{miTurno ? 'Te toca' : `Turno de ${turnoDe?.nombre}`}</p>
        <h1 className="pzp-hero-titulo">{v.jugadores.some((j) => j.corazon) ? `💎 ¡${v.jugadores.find((j) => j.corazon).nombre} lleva el Corazón!` : 'Encuentra el Corazón 💎'}</h1>
      </header>
      {!local && v.hasta && <div className="pzp-tarjeta" style={{ padding: '0.5rem 0.8rem' }}><Cuenta ms={restante} total={AJUSTES.segTurno * 1000} /></div>}
      <Objetivo v={v} />
      <Estado v={v} />
      <div className="pzp-tarjeta lbr-tablero-tarjeta"><Tablero v={v} marcadas={marcadas} onTocar={miTurno ? tocar : null} /></div>
      <Propuestas v={v} enviar={enviar} />
      {miTurno ? <Acciones v={v} enviar={enviar} modo={modo} setModo={setModo} /> : <p className="pzp-esperando">⏳ Juega {turnoDe?.nombre} ({PERSONAJES[turnoDe?.personaje]?.nombre})…</p>}
      <details className="pzp-tarjeta lbr-log" open>
        <summary>📖 Lo último</summary>
        <div>{[...v.log].reverse().slice(0, 8).map((l) => <p key={l.n} className={l.tipo}>{l.texto}</p>)}</div>
      </details>
      <details className="pzp-tarjeta lbr-leyenda">
        <summary>🗺️ Leyenda</summary>
        <p>🚪 salida · 💎 Corazón · 💰 tesoro · 🕳️ trampa · 🔑 llave · 🧪 poción · 📜 mapa · 🪤 cepo · 🚧 barricada · 🛡️ protegido tras robar el Corazón. Las puertas cerradas son las rayas marrones; las barricadas, naranjas.</p>
      </details>
      {admin && (
        <div className="pzp-barra estatica">
          <div className="pzp-dos">
            <button type="button" className="pzp-enlace" onClick={() => enviar('forzar')}><Icon name="forward" size={15} /> Saltar turno</button>
            <button type="button" className="pzp-enlace" onClick={() => enviar('terminar')}><Icon name="flagFinish" size={15} /> Terminar ya</button>
          </div>
        </div>
      )}
    </>
  );
}

export function PartidaOnline({ v, sala, enviar, offset, onSalir }) {
  return <Partida v={v} enviar={enviar} offset={offset} onSalir={onSalir} admin={sala.esAdmin} />;
}

export function Fin({ v, onSalir, children }) {
  const f = v.fin;
  const g = f.ganadores.map((id) => nombreDe(v, id));
  return (
    <>
      <header className="pzp-hero acierto">
        <span className="pzp-hero-fondo" aria-hidden="true">💎</span>
        <div className="pzp-hero-top">
          <button type="button" className="pzp-salir" onClick={onSalir}><Icon name="door" size={15} /> Salir</button>
          <span className="pzp-chip">🗝️ Fin</span>
        </div>
        <p className="pzp-hero-etiqueta">{f.escapado != null ? 'Escapó con el Corazón' : 'Se acabó el tiempo: gana el más rico'}</p>
        <h1 className="pzp-hero-titulo">{g.length ? `¡${g.join(' y ')}!` : 'Nadie'}</h1>
      </header>
      <div className="pzp-tarjeta lbr-tablero-tarjeta"><Tablero v={v} /></div>
      <div className="pzp-tarjeta">
        <p className="pzp-etiqueta">Clasificación (oro, +5 si llevas el Corazón)</p>
        <ol className="pzp-ranking">
          {f.tabla.map((j, i) => (
            <li key={j.id} className={f.ganadores.includes(j.id) ? 'lider' : ''}>
              <span className="pzp-pos">{i + 1}</span><span>{PERSONAJES[j.personaje].e}</span>
              <span className="pzp-ranking-nombre">{j.nombre}<small>{PERSONAJES[j.personaje].nombre}{j.corazon ? ' · 💎' : ''}</small></span><strong>💰{j.oro}</strong>
            </li>
          ))}
        </ol>
      </div>
      {children}
    </>
  );
}

export function Config({ config, onCambiar }) {
  return (
    <BloqueConfig titulo="Rondas como mucho">
      <Pildoras opciones={[20, 30, 40].map((n) => [n, `${n} rondas`])} valor={config.rondasMax} onCambiar={onCambiar && ((rondasMax) => onCambiar({ rondasMax }))} />
    </BloqueConfig>
  );
}
