// client/src/games/Traiciones/Vistas.jsx
// Pantallas de Traiciones (tiempo real), con el mismo lenguaje visual que el resto de juegos renovados:
// cabecera con degradado, tarjetas blancas, botones en relieve y barra de acciones abajo.
// Reciben `v` (la vista del jugador que genera engine.vistaDe), `enviar(tipo, datos)` y
// `offset` (= hora del servidor − hora del navegador, para que los temporizadores sean exactos).
import React, { useEffect, useRef, useState } from 'react';
import Icon from './IconoT.jsx';
import { SALAS, SALA, ALAS, ROLES, AJUSTES } from './engine.js';
import Minijuego from './Minijuegos.jsx';
import './Traiciones.css';

export const ICONO_ROL = { viajero: 'flag', vigia: 'eye', protegido: 'shield', traidor: 'dagger', bufon: 'mask' };
const plural = (n, s, p) => (n === 1 ? s : p);
export const COLORES = ['#ef4444', '#2563eb', '#16a34a', '#f59e0b', '#9333ea', '#ec4899', '#0d9488', '#ea580c', '#475569', '#65a30d', '#0891b2', '#be123c'];
export const colorDe = (id) => COLORES[(Math.abs(Number(id)) || 0) % COLORES.length];
export const inicial = (n) => (n || '?').trim().charAt(0).toUpperCase();
const sinArticulo = (n) => n.replace(/^(El|La) /, '');

// Reloj que se refresca varias veces por segundo (hora del servidor)
function useAhora(offset = 0) {
  const [, setT] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setT((x) => x + 1), 250);
    return () => clearInterval(i);
  }, []);
  return Date.now() + offset;
}
const seg = (ms) => Math.max(0, Math.ceil(ms / 1000));
const reloj = (ms) => {
  const s = seg(ms);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

const OBJETIVO = {
  leales: 'Completad todas las tareas del campamento o expulsad a todos los traidores. Si veis un cuerpo, reportadlo.',
  traidores: 'Eliminad a quien se quede a solas con vosotros hasta ser tantos como los demás, o dejad que el incendio arrase el campamento.',
  neutral: 'Consigue que la caravana te expulse en una votación. Si lo logras, ganas tú solo.'
};

// ---------------------------------------------------------------- Piezas comunes
export function Avatar({ id, nombre, grande = false, muerto = false }) {
  return (
    <span className={`trp-avatar${grande ? ' grande' : ''}${muerto ? ' muerto' : ''}`} style={{ '--c': colorDe(id) }}>
      {muerto ? <Icon name="skull" size={grande ? 22 : 15} /> : inicial(nombre)}
    </span>
  );
}

function ChipReloj({ limite, offset }) {
  const ahora = useAhora(offset);
  if (!limite) return null;
  const resto = Math.max(0, limite - ahora);
  return (
    <span className={`trp-chip reloj${resto <= 10000 ? ' urgente' : ''}`}>
      <Icon name="clock" size={14} /> {reloj(resto)}
    </span>
  );
}

function TarjetaRol({ v }) {
  const eq = v.yo.equipo;
  return (
    <div className={`tr-rol ${eq}`}>
      <span className="tr-rol-ico"><Icon name={ICONO_ROL[v.yo.rol]} size={46} strokeWidth={1.8} /></span>
      <small>{eq === 'leales' ? 'Eres de los leales' : eq === 'traidores' ? 'Eres un traidor' : 'Eres neutral'}</small>
      <h1>{v.yo.rolNombre}</h1>
      <p>{v.yo.desc}</p>
      <p className="tr-rol-objetivo"><strong>Objetivo:</strong> {OBJETIVO[eq]}</p>
      {v.yo.rol === 'traidor' && (
        <div className="tr-aliados">
          {v.yo.aliados.length ? `Tus cómplices: ${v.yo.aliados.map((a) => a.nombre + (a.vivo ? '' : ' (fuera)')).join(', ')}` : 'Trabajas solo: nadie más conoce el plan.'}
        </div>
      )}
      {v.yo.rol === 'protegido' && <div className="tr-aliados">{v.yo.amuleto ? 'Tu amuleto sigue intacto.' : 'Tu amuleto ya se ha gastado.'}</div>}
      {!v.yo.vivo && <div className="tr-aliados">Ahora eres un espíritu: lo ves todo, pero no puedes hablar.</div>}
    </div>
  );
}

/** Cabecera de la partida: salir, chips, título de la fase, «Mi papel» y progreso de las tareas. */
function Hero({ v, offset, onSalir, clase, etiqueta, titulo, chips = null, conProgreso = true }) {
  const [verRol, setVerRol] = useState(false);
  const { hechas, total } = v.progreso;
  const pct = total ? Math.min(100, Math.round((hechas / total) * 100)) : 0;
  const vivosVisibles = v.jugadores.filter((j) => j.vivo).length;
  return (
    <header className={`trp-hero ${clase}`}>
      <span className="trp-sol" aria-hidden="true" />
      <span className="trp-dunas" aria-hidden="true" />
      <div className="trp-hero-top">
        <button type="button" className="trp-salir" onClick={onSalir}>
          <Icon name="door" size={15} /> Salir
        </button>
        <div className="trp-chips">
          {chips}
          <span className="trp-chip"><Icon name="users" size={14} /> {vivosVisibles}/{v.jugadores.length}</span>
          <ChipReloj limite={v.limite} offset={offset} />
        </div>
      </div>
      <div className="trp-hero-fila">
        <div style={{ minWidth: 0 }}>
          <p className="trp-hero-etiqueta">{etiqueta}</p>
          <h1 className="trp-hero-titulo">{titulo}</h1>
        </div>
        {v.fase !== 'fin' && (
          <button type="button" className={`trp-mirol ${v.yo.vivo ? v.yo.equipo : 'espiritu'}`} onClick={() => setVerRol(true)}>
            <Icon name={v.yo.vivo ? ICONO_ROL[v.yo.rol] : 'skull'} size={15} /> {v.yo.vivo ? 'Mi papel' : 'Espíritu'}
          </button>
        )}
      </div>
      {conProgreso && (
        <div className="trp-progreso" title="Tareas completadas por toda la caravana">
          <div className="trp-progreso-top"><span><Icon name="leaf" size={13} /> Tareas de la caravana</span><span>{pct}%</span></div>
          <div className="trp-progreso-barra"><div className="trp-progreso-fill" style={{ width: `${pct}%` }} /></div>
        </div>
      )}
      {verRol && (
        <div className="rg-modal-fondo" onClick={() => setVerRol(false)}>
          <div className="rg-modal trp-modal-rol" onClick={(e) => e.stopPropagation()}>
            <TarjetaRol v={v} />
            <button type="button" className="trp-boton" style={{ marginTop: '0.9rem' }} onClick={() => setVerRol(false)}>
              <Icon name="eyeoff" size={18} /> Ocultar
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

function Barra({ hasta, desde, etiqueta, offset }) {
  const ahora = useAhora(offset);
  const total = Math.max(1, hasta - desde);
  const pct = Math.min(100, Math.max(0, ((ahora - desde) / total) * 100));
  return (
    <div className="tr-trabajo">
      <div className="tr-trabajo-barra"><div className="tr-trabajo-fill" style={{ width: `${pct}%` }} /></div>
      <span>{etiqueta} · {seg(hasta - ahora)} s</span>
    </div>
  );
}

/** Enlace del anfitrión para no quedarse atascados si alguien se ha ido. */
function Forzar({ v, admin }) {
  // Solo cuando el propio anfitrión ya ha hecho su parte (si no, el botón le haría saltarse a sí mismo)
  if (!admin?.esAdmin || !v.faltan?.length || v.faltan.includes(v.yo.nombre)) return null;
  return (
    <button type="button" className="trp-enlace" onClick={admin.onForzar}>
      <Icon name="forward" size={15} /> Seguir sin esperar a {v.faltan.length === 1 ? v.faltan[0] : `${v.faltan.length} jugadores`}
    </button>
  );
}

function Esperando({ titulo, faltan }) {
  return (
    <div className="trp-esperando">
      <strong><Icon name="hourglass" size={16} /> {titulo}</strong>
      {faltan?.length > 0 && <span>Esperando a: {faltan.join(', ')}</span>}
    </div>
  );
}

// ---------------------------------------------------------------- Tu rol
export function FaseRol({ v, enviar, offset, onSalir, admin }) {
  const [oculto, setOculto] = useState(false);
  return (
    <>
      <Hero v={v} offset={offset} onSalir={onSalir} clase="roles" etiqueta="La caravana se prepara" titulo="Tu papel secreto" conProgreso={false} />
      {oculto ? (
        <div className="tr-privado-tapa">
          <Icon name="eyeoff" size={34} />
          <span>Tu papel está oculto</span>
          <button type="button" className="trp-boton secundario" style={{ width: 'auto' }} onClick={() => setOculto(false)}>
            <Icon name="eye" size={16} /> Mostrar
          </button>
        </div>
      ) : (
        <div>
          <TarjetaRol v={v} />
          <div className="tr-center">
            <button type="button" className="trp-ojo" onClick={() => setOculto(true)}><Icon name="eyeoff" size={14} /> Tapar la pantalla</button>
          </div>
        </div>
      )}
      <div className="trp-barra">
        {v.listo
          ? <Esperando titulo="¡Listo!" faltan={v.faltan} />
          : <button type="button" className="trp-boton grande" onClick={() => enviar('rol')}><Icon name="check" size={22} strokeWidth={2.5} /> Entendido, ¡a la caravana!</button>}
        <Forzar v={v} admin={admin} />
      </div>
    </>
  );
}

// ---------------------------------------------------------------- Mapa del campamento
function Mapa({ v, enviar }) {
  const sala = v.yo.sala;
  const vecinos = sala ? SALA[sala].vecinos : [];
  const destino = v.yo.mov?.destino;
  const fuegos = new Set((v.incendio?.salas || []).filter((s) => !s.apagado).map((s) => s.id));
  const atajos = v.yo.rol === 'traidor' && v.yo.vivo ? (v.yo.atajos || 0) : 0;
  const tareasAqui = new Set(v.yo.tareas.filter((t) => !t.hecha).map((t) => t.sala));
  return (
    <div className="trp-tarjeta trp-mapa-tarjeta">
      <p className="trp-etiqueta"><Icon name="globe" size={14} /> El campamento · toca una sala contigua para ir</p>
      <div className="tr-mapa">
        <svg className="tr-mapa-lineas" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {SALAS.flatMap((s) => s.vecinos.filter((o) => o > s.id).map((o) => (
            <line key={s.id + o} x1={s.pos[0]} y1={s.pos[1]} x2={SALA[o].pos[0]} y2={SALA[o].pos[1]} />
          )))}
        </svg>
        {SALAS.map((s) => {
          const actual = sala === s.id;
          const puedoIr = !v.yo.mov && vecinos.includes(s.id);
          const puedoSaltar = !v.yo.mov && !!sala && atajos > 0 && !actual && !vecinos.includes(s.id);
          const clases = ['tr-nodo', `ala-${s.ala}`, actual ? 'actual' : '', puedoIr ? 'ir' : '', puedoSaltar ? 'salto' : '', destino === s.id ? 'destino' : '', fuegos.has(s.id) ? 'fuego' : '', v.ojeo?.sala === s.id ? 'ojeo' : ''].join(' ');
          return (
            <button key={s.id} type="button" className={clases} style={{ left: `${s.pos[0]}%`, top: `${s.pos[1]}%` }} disabled={!puedoIr && !puedoSaltar}
              onClick={() => enviar('mover', { sala: s.id })} title={s.nombre}>
              <Icon name={fuegos.has(s.id) ? 'flame' : s.icono} size={20} />
              <span>{sinArticulo(s.nombre)}</span>
              {v.radar && <b className="tr-nodo-n">{v.radar[s.id]}</b>}
              {!v.radar && tareasAqui.has(s.id) && !actual && <b className="tr-nodo-tarea" title="Tienes una tarea aquí">!</b>}
              {actual && <i className="tr-nodo-yo">tú</i>}
              {puedoSaltar && <i className="tr-nodo-yo salto">atajo</i>}
            </button>
          );
        })}
      </div>
      <div className="tr-leyenda">
        {Object.entries(ALAS).map(([k, n]) => <span key={k} className={`tr-ley ala-${k}`}>{n}</span>)}
        <span className="tr-ley tarea">! = {v.yo.tareasFalsas ? 'tarea de pega' : 'tarea pendiente'}</span>
        {atajos > 0 && <span className="tr-ley salto">Atajos: {atajos}</span>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Partida en curso
export function PantallaJuego({ v, enviar, offset, onSalir }) {
  const ahora = useAhora(offset);
  const [ojeoSel, setOjeoSel] = useState('');
  const [sabotajeAbierto, setSabotajeAbierto] = useState(false);
  const yo = v.yo;
  const s = v.sala;
  const op = v.opciones;
  const traidor = yo.rol === 'traidor' && yo.vivo;
  const trabajando = yo.trabajo;
  const enCamino = yo.mov;
  // esperas (campana, traidor): se restan los ms transcurridos desde que llegó la vista
  const desdeVista = Math.max(0, ahora - v.ahora);
  const campanaMs = Math.max(0, yo.campanaEn - desdeVista);
  const matarMs = op ? Math.max(0, op.esperaMatar - desdeVista) : 0;
  const sabotajeMs = op ? Math.max(0, op.esperaSabotaje - desdeVista) : 0;

  const porSala = {};
  yo.tareas.forEach((t) => {
    porSala[t.sala] = porSala[t.sala] || { texto: t.texto, hechas: 0, total: 0 };
    porSala[t.sala].total += 1;
    if (t.hecha) porSala[t.sala].hechas += 1;
  });
  const pendientes = yo.tareas.filter((t) => !t.hecha).length;
  const avisosRecientes = v.avisos.filter((a) => ahora - a.t < 20000).slice(-3);
  const chips = (
    <>
      {v.incendio && <span className="trp-chip alerta"><Icon name="flame" size={14} /> {seg(v.incendio.hasta - ahora)} s</span>}
      {v.tormenta && <span className="trp-chip tormenta"><Icon name="zap" size={14} /> {seg(v.tormenta.hasta - ahora)} s</span>}
    </>
  );

  return (
    <>
      <Hero
        v={v} offset={offset} onSalir={onSalir} chips={chips}
        clase={`juego${v.incendio ? ' incendio' : ''}${v.tormenta ? ' tormenta' : ''}${!yo.vivo ? ' espiritu' : ''}`}
        etiqueta={enCamino ? (enCamino.salto ? 'Por un atajo secreto hacia' : 'De camino a') : 'Estás en'}
        titulo={enCamino ? SALA[enCamino.destino].nombre : s ? s.nombre : '…'}
      />

      {v.incendio && (
        <div className="tr-alerta fuego">
          <Icon name="flame" size={26} />
          <div>
            <strong>¡Incendio en el campamento!</strong>
            <span>Apagad {v.incendio.salas.map((x) => `${x.nombre}${x.apagado ? ' ✔' : ''}`).join(' y ')} antes de {seg(v.incendio.hasta - ahora)} s o ganarán los traidores.</span>
          </div>
        </div>
      )}
      {v.tormenta && (
        <div className="tr-alerta tormenta"><Icon name="zap" size={26} /><div><strong>Tormenta de arena</strong><span>No distingues caras ni nombres durante {seg(v.tormenta.hasta - ahora)} s más.</span></div></div>
      )}
      {!yo.vivo && (
        <div className="tr-alerta espiritu">
          <Icon name="skull" size={26} />
          <div><strong>Eres un espíritu</strong><span>{yo.tareasFalsas ? 'Ya no puedes influir en la partida, pero lo ves todo.' : 'Sigue con tus tareas para ayudar a la caravana, pero no puedes hablar con los vivos.'}</span></div>
        </div>
      )}
      {avisosRecientes.map((a, i) => <div key={`${a.t}-${i}`} className={`tr-diario-item ${a.tipo}`}>{a.x}</div>)}

      {trabajando?.tipo === 'tarea' && !trabajando.exito && (
        <div className="trp-tarjeta tr-mj-card">
          <Minijuego id={trabajando.minijuego} clave={trabajando.inicio} onExito={() => enviar('tarea-hecha')} onCancelar={() => enviar('cancelar')} />
          <p className="tr-muted" style={{ margin: '.6rem 0 0', fontSize: '.85rem' }}>Los demás ven que estás trabajando. Si te mueves, pierdes lo avanzado.</p>
        </div>
      )}
      {trabajando?.tipo === 'tarea' && trabajando.exito && (
        <div className="trp-tarjeta tr-mj-card">
          <p className="trp-etiqueta"><Icon name="check" size={14} /> ¡Prueba superada!</p>
          <Barra desde={trabajando.inicio} hasta={trabajando.finEn} etiqueta="Rematando la tarea" offset={offset} />
          <p className="tr-muted" style={{ margin: 0, fontSize: '.85rem' }}>No te muevas hasta que termine o la perderás.</p>
        </div>
      )}

      {enCamino ? (
        <div className="trp-tarjeta tr-center">
          <p className="trp-etiqueta centrada"><Icon name="forward" size={14} /> {enCamino.salto ? 'Atajo secreto' : 'En camino'}</p>
          <Barra desde={enCamino.llegaEn - enCamino.ms} hasta={enCamino.llegaEn} etiqueta={`Llegando a ${SALA[enCamino.destino].nombre}`} offset={offset} />
          <p className="tr-muted" style={{ margin: 0 }}>{enCamino.salto ? 'Apareces en otro punto del campamento mucho antes de lo normal.' : 'Mientras caminas nadie te ve y tú no ves a nadie.'}</p>
        </div>
      ) : s && (
        <div className="trp-tarjeta">
          <p className="trp-etiqueta"><Icon name={s.icono} size={14} /> Contigo en {s.nombre}</p>
          <div className="tr-gente">
            {s.presentes.length === 0 && s.anonimos === 0 && <span className="tr-muted">No hay nadie más aquí.</span>}
            {s.presentes.map((p) => (
              <span key={p.id} className={`tr-persona ${p.fantasma ? 'muerto' : ''}`}>
                <Avatar id={p.id} nombre={p.nombre} muerto={p.fantasma} />
                {p.nombre}{p.trabajando ? <em>trabajando</em> : null}
              </span>
            ))}
            {s.anonimos > 0 && <span className="tr-persona"><Icon name="zap" size={15} /> {s.anonimos} {plural(s.anonimos, 'silueta', 'siluetas')} entre la arena</span>}
          </div>

          {s.cuerpos.map((c) => (
            <div key={c.id} className="tr-muerte">
              <Icon name="skull" size={22} /><span>Aquí yace {c.nombre}.</span>
              {yo.vivo && <button type="button" className="trp-boton peligro mini" onClick={() => enviar('reportar')}><Icon name="bell" size={16} /> Reportar</button>}
            </div>
          ))}

          {trabajando?.tipo === 'fuego' && <Barra desde={trabajando.finEn - AJUSTES.apagarMs} hasta={trabajando.finEn} etiqueta="Apagando el fuego" offset={offset} />}

          <div className="tr-acciones">
            {s.fuego && yo.vivo && !trabajando && (
              <button type="button" className="trp-boton fuego" onClick={() => enviar('apagar')}><Icon name="flame" size={20} /> Apagar el fuego ({seg(AJUSTES.apagarMs)} s)</button>
            )}
            {s.tarea && !trabajando && !v.incendio && (
              <button type="button" className="trp-boton" onClick={() => enviar('trabajar')}>
                <Icon name="check" size={20} /> {yo.tareasFalsas ? 'Fingir tarea' : 'Hacer tarea'}: {s.tarea}
              </button>
            )}
            {s.tarea && v.incendio && <p className="tr-muted" style={{ margin: 0 }}>No se puede trabajar mientras haya un incendio.</p>}
            {!s.tarea && !s.fuego && !s.cuerpos.length && !trabajando && <p className="tr-muted" style={{ margin: 0 }}>{pendientes ? 'Aquí no tienes nada que hacer. Busca los «!» en el mapa.' : 'Ya has terminado todas tus tareas.'}</p>}
          </div>
          {trabajando?.tipo === 'fuego' && <p className="tr-muted" style={{ margin: '.5rem 0 0' }}>Si te mueves, pierdes lo avanzado.</p>}
        </div>
      )}

      {traidor && op && (
        <div className="tr-traidor-box">
          <p className="trp-etiqueta"><Icon name="dagger" size={14} /> Tus armas de traidor</p>
          {op.objetivoNombre
            ? <p>Estás a solas con <strong>{op.objetivoNombre}</strong>. {matarMs > 0 ? `Podrás actuar en ${seg(matarMs)} s.` : 'Nadie lo sabrá.'}</p>
            : <p>Solo puedes eliminar a alguien que esté a solas contigo (los cómplices no cuentan).</p>}
          <div className="tr-acciones">
            <button type="button" className="trp-boton peligro" disabled={!op.puedeMatar || matarMs > 0} onClick={() => enviar('matar', { objetivo: op.objetivo })}>
              <Icon name="skull" size={20} /> {matarMs > 0 ? `Enfriándote… ${seg(matarMs)} s` : op.objetivoNombre ? `Eliminar a ${op.objetivoNombre}` : 'Eliminar'}
            </button>
            <button type="button" className="trp-boton oscuro" disabled={sabotajeMs > 0 || !!v.incendio} onClick={() => setSabotajeAbierto((x) => !x)}>
              <Icon name="bomb" size={18} /> {v.incendio ? 'Hay un incendio en marcha' : sabotajeMs > 0 ? `Sabotaje en ${seg(sabotajeMs)} s` : 'Sabotear…'}
            </button>
            {sabotajeAbierto && sabotajeMs === 0 && !v.incendio && (
              <div className="tr-sabotajes">
                <button type="button" onClick={() => { enviar('sabotear', { sabotaje: 'tormenta' }); setSabotajeAbierto(false); }}>
                  <Icon name="zap" size={20} /><span><strong>Tormenta de arena</strong><small>{seg(AJUSTES.tormentaMs)} s sin que nadie distinga caras</small></span>
                </button>
                <button type="button" onClick={() => { enviar('sabotear', { sabotaje: 'incendio' }); setSabotajeAbierto(false); }}>
                  <Icon name="flame" size={20} /><span><strong>Incendio</strong><small>Dos lugares arden: {seg(AJUSTES.incendioMs)} s para apagarlos</small></span>
                </button>
              </div>
            )}
          </div>
          {yo.aliados.length > 0 && <p style={{ margin: '.6rem 0 0' }}>Cómplices: {yo.aliados.map((a) => a.nombre + (a.vivo ? '' : ' (fuera)')).join(', ')}</p>}
        </div>
      )}

      <Mapa v={v} enviar={enviar} />

      {yo.rol === 'vigia' && yo.vivo && (
        <div className="trp-tarjeta">
          <p className="trp-etiqueta"><Icon name="eye" size={14} /> Ojo avizor</p>
          {v.ojeo ? (
            <p style={{ margin: 0 }}>Estás viendo <strong>{SALA[v.ojeo.sala].nombre}</strong> ({seg(v.ojeo.hasta - ahora)} s): {v.ojeo.presentes.length ? v.ojeo.presentes.map((p) => p.nombre).join(', ') : 'no hay nadie'}.</p>
          ) : yo.ojeoUsado ? <p className="tr-muted" style={{ margin: 0 }}>Ya has usado tu ojo avizor.</p> : (
            <>
              <p className="tr-muted">Una sola vez por partida: mira en directo quién hay en un lugar durante {seg(AJUSTES.ojeoMs)} s.</p>
              <div className="tr-ojeo-salas">
                {SALAS.filter((x) => x.id !== yo.sala).map((x) => (
                  <button key={x.id} type="button" className={`trp-pildora${ojeoSel === x.id ? ' activo' : ''}`} onClick={() => setOjeoSel(x.id)}>{sinArticulo(x.nombre)}</button>
                ))}
              </div>
              <button type="button" className="trp-boton" style={{ marginTop: '.7rem' }} disabled={!ojeoSel} onClick={() => enviar('ojear', { sala: ojeoSel })}>
                <Icon name="eye" size={18} /> {ojeoSel ? `Ojear ${SALA[ojeoSel].nombre}` : 'Elige un lugar'}
              </button>
            </>
          )}
        </div>
      )}

      {v.radar && (
        <div className="trp-tarjeta">
          <p className="trp-etiqueta"><Icon name="tower" size={14} /> Desde la Atalaya</p>
          <p className="tr-muted" style={{ margin: 0 }}>Los números del mapa son las personas que hay ahora mismo en cada lugar. No ves quiénes son.</p>
        </div>
      )}

      <div className="trp-tarjeta">
        <p className="trp-etiqueta"><Icon name="book" size={14} /> {yo.tareasFalsas ? 'Tus tareas de pega' : 'Tus tareas'} · {yo.tareas.length - pendientes}/{yo.tareas.length}</p>
        {yo.tareasFalsas && <p className="tr-muted">No cuentan para nada, pero te sirven de coartada: nadie sabe cuáles son falsas.</p>}
        <div className="tr-lista-roles">
          {Object.entries(porSala).map(([id, t]) => (
            <div key={id} className={`tr-fila-rol${t.hechas === t.total ? ' hecha' : ''}${yo.sala === id ? ' aqui' : ''}`}>
              <span>{t.texto}<small>{SALA[id].nombre}{yo.sala === id ? ' · estás aquí' : ''}</small></span>
              <span className="tr-pts">{t.hechas === t.total ? '✔' : `${t.hechas}/${t.total}`}</span>
            </div>
          ))}
        </div>
      </div>

      {yo.vivo && (
        <div className="trp-tarjeta">
          <p className="trp-etiqueta"><Icon name="eye" size={14} /> Lo que has visto</p>
          {v.feed.length === 0 ? <p className="tr-muted" style={{ margin: 0 }}>Nada por ahora. Fíjate en quién entra y sale de donde estés.</p> : (
            <div className="tr-diario">
              {[...v.feed].reverse().map((e, i) => (
                <div key={`${e.t}-${i}`} className={`tr-diario-item ${e.tipo === 'llega' ? 'ok' : 'mal'}`}>{e.texto} <small>hace {seg(ahora - e.t)} s</small></div>
              ))}
            </div>
          )}
          {v.avisos.length > avisosRecientes.length && (
            <details className="tr-avisos-viejos">
              <summary>Avisos anteriores</summary>
              {v.avisos.slice(0, v.avisos.length - avisosRecientes.length).reverse().map((a, i) => <div key={`${a.t}-${i}`} className={`tr-diario-item ${a.tipo}`}>{a.x}</div>)}
            </details>
          )}
        </div>
      )}

      <Registro v={v} />
      <Espectro v={v} />

      {yo.vivo && (
        <div className="trp-barra estatica">
          <button type="button" className="trp-boton campana" disabled={campanaMs > 0 || !!v.incendio || yo.campanas <= 0} onClick={() => enviar('campana')}>
            <Icon name="bell" size={18} /> {yo.campanas <= 0 ? 'Ya has tocado tu campana' : v.incendio ? 'Campana bloqueada por el incendio' : campanaMs > 0 ? `Campana disponible en ${seg(campanaMs)} s` : 'Tocar la campana (asamblea)'}
          </button>
        </div>
      )}
    </>
  );
}

// ---------------------------------------------------------------- Asamblea (debate + chat)
function Chat({ v, enviar }) {
  const [txt, setTxt] = useState('');
  const caja = useRef(null);
  const n = v.asamblea.chat.length ? v.asamblea.chat[v.asamblea.chat.length - 1].n : 0;
  // desplaza solo la caja del chat (no toda la página) cuando llega un mensaje nuevo
  useEffect(() => {
    if (caja.current) caja.current.scrollTop = caja.current.scrollHeight;
  }, [n]);
  const mandar = (e) => {
    e?.preventDefault();
    if (!txt.trim()) return;
    enviar('chat', { texto: txt });
    setTxt('');
  };
  return (
    <div className="trp-tarjeta">
      <p className="trp-etiqueta"><Icon name="speech" size={14} /> Debate</p>
      <div className="tr-chat" ref={caja}>
        {v.asamblea.chat.length === 0 && <p className="tr-muted" style={{ margin: 0 }}>Nadie ha dicho nada todavía. ¿Dónde estabas? ¿A quién viste?</p>}
        {v.asamblea.chat.map((m) => (
          <div key={m.n} className={`tr-msg ${m.id === v.yo.id ? 'yo' : ''}`}>
            <Avatar id={m.id} nombre={m.nombre} />
            <span><b>{m.nombre}</b>{m.texto}</span>
          </div>
        ))}
      </div>
      {v.yo.vivo ? (
        <form className="tr-chat-form" onSubmit={mandar}>
          <input type="text" value={txt} maxLength={AJUSTES.chatMaxCaracteres} placeholder="Escribe (o habla en voz alta)…" onChange={(e) => setTxt(e.target.value)} />
          <button type="submit" className="trp-boton mini" disabled={!txt.trim()} aria-label="Enviar"><Icon name="forward" size={18} /></button>
        </form>
      ) : <p className="tr-muted" style={{ margin: '.5rem 0 0' }}>Los espíritus no pueden hablar.</p>}
    </div>
  );
}

function InformeAsamblea({ v }) {
  const a = v.asamblea;
  return (
    <div className="trp-tarjeta">
      {a.cuerpo
        ? <div className="tr-muerte" style={{ marginTop: 0 }}><Icon name="skull" size={22} /><span>{a.cuerpo.nombre} yacía en {SALA[a.cuerpo.sala].nombre}.</span></div>
        : <div className="tr-campana-aviso"><Icon name="bell" size={20} /><span>{a.por} ha convocado una asamblea.</span></div>}
      <p className="tr-muted" style={{ margin: '.7rem 0 .4rem' }}>
        {a.muertos.length ? `Han sido eliminados: ${a.muertos.join(', ')}.` : 'Todavía no ha muerto nadie… que se sepa.'}
      </p>
      <div className="tr-gente">
        {v.jugadores.map((j) => (
          <span key={j.id} className={`tr-persona ${j.vivo ? '' : 'muerto'}`}>
            <Avatar id={j.id} nombre={j.nombre} muerto={!j.vivo} />{j.nombre}{j.id === v.yo.id ? ' (tú)' : ''}
          </span>
        ))}
      </div>
    </div>
  );
}

export function FaseAsamblea({ v, enviar, offset, onSalir, admin }) {
  const a = v.asamblea;
  return (
    <>
      <Hero v={v} offset={offset} onSalir={onSalir} clase="asamblea" etiqueta="Asamblea en la Hoguera"
        titulo={a.cuerpo ? `${a.por} ha encontrado un cuerpo` : `${a.por} ha tocado la campana`} />
      <InformeAsamblea v={v} />
      <Chat v={v} enviar={enviar} />
      <Registro v={v} />
      <Espectro v={v} />
      <div className="trp-barra">
        {v.yo.vivo && (v.listo
          ? <Esperando titulo="Listo para votar" faltan={v.faltan} />
          : <button type="button" className="trp-boton grande" onClick={() => enviar('listo-votar')}><Icon name="check" size={22} strokeWidth={2.5} /> Estoy listo para votar</button>)}
        {!v.yo.vivo && <Esperando titulo="Los vivos están debatiendo" faltan={v.faltan} />}
        <Forzar v={v} admin={admin} />
      </div>
    </>
  );
}

export function FaseVotacion({ v, enviar, offset, onSalir, admin }) {
  const candidatos = v.jugadores.filter((j) => j.vivo && j.id !== v.yo.id);
  const votado = v.miVoto !== undefined;
  return (
    <>
      <Hero v={v} offset={offset} onSalir={onSalir} clase="asamblea" etiqueta="Votación" titulo="¿A quién expulsáis?" />
      {v.yo.vivo ? (
        <div className="trp-tarjeta">
          <p className="trp-etiqueta"><Icon name="scale" size={14} /> {votado ? 'Puedes cambiar tu voto hasta que voten todos' : 'Elige a un sospechoso'}</p>
          <div className="tr-votos">
            {candidatos.map((j) => (
              <button key={j.id} type="button" className={`tr-voto ${v.miVoto === j.id ? 'sel' : ''}`} onClick={() => enviar('votar', { objetivo: j.id })}>
                <Avatar id={j.id} nombre={j.nombre} />
                <strong>{j.nombre}</strong>
                {v.miVoto === j.id && <small>Tu voto</small>}
              </button>
            ))}
            <button type="button" className={`tr-voto saltar ${votado && v.miVoto === null ? 'sel' : ''}`} onClick={() => enviar('votar', { objetivo: null })}>
              <strong>Votar en blanco</strong>{votado && v.miVoto === null && <small>Tu voto</small>}
            </button>
          </div>
          <p className="tr-muted" style={{ margin: '.8rem 0 0', fontSize: '.86rem' }}>Sale quien tenga más votos si supera a los votos en blanco. Con empate no sale nadie. Los votos serán públicos.</p>
        </div>
      ) : (
        <div className="trp-tarjeta"><p className="tr-muted" style={{ margin: 0 }}>Los espíritus no votan. Mira cómo se equivocan… o aciertan.</p></div>
      )}
      <Chat v={v} enviar={enviar} />
      <Espectro v={v} />
      <div className="trp-barra">
        {(votado || !v.yo.vivo) && <Esperando titulo={v.yo.vivo ? 'Voto registrado' : 'Votación en curso'} faltan={v.faltan} />}
        <Forzar v={v} admin={admin} />
      </div>
    </>
  );
}

export function TarjetaVeredicto({ v }) {
  const vr = v.veredicto;
  if (!vr) return null;
  const nombre = (id) => v.jugadores.find((j) => j.id === id)?.nombre ?? '?';
  const equipo = vr.rol ? ROLES[vr.rol].equipo : null;
  return (
    <div className="trp-tarjeta tr-veredicto">
      {vr.expulsado ? (
        <>
          <Avatar id={vr.expulsadoId} nombre={vr.expulsado} grande />
          <h2>{vr.expulsado} sale de la caravana</h2>
          <span className={`tr-rol-reveal ${equipo}`}><Icon name={ICONO_ROL[vr.rol]} size={16} /> Era {ROLES[vr.rol].nombre}</span>
        </>
      ) : (
        <>
          <span className="tr-veredicto-ico"><Icon name="scale" size={30} /></span>
          <h2>Nadie ha sido expulsado</h2>
          <p className="tr-muted">Empate, o más votos en blanco que contra cualquier sospechoso.</p>
        </>
      )}
      <div className="tr-tabla-votos">
        {Object.entries(vr.votos).map(([votante, objetivo]) => (
          <div key={votante}>
            <span><Avatar id={votante} nombre={nombre(Number(votante))} /> {nombre(Number(votante))}</span>
            <span>{objetivo != null ? `→ ${nombre(objetivo)}` : 'en blanco'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FaseVeredicto({ v, enviar, offset, onSalir, admin }) {
  return (
    <>
      <Hero v={v} offset={offset} onSalir={onSalir} clase="asamblea" etiqueta="Veredicto" titulo={v.veredicto?.expulsado ? `Adiós, ${v.veredicto.expulsado}` : 'La caravana duda'} />
      <TarjetaVeredicto v={v} />
      <Espectro v={v} />
      <div className="trp-barra">
        {v.yo.vivo && (v.listo
          ? <Esperando titulo="Volviendo al campamento…" faltan={v.faltan} />
          : <button type="button" className="trp-boton grande" onClick={() => enviar('continuar')}><Icon name="forward" size={22} /> Volver al campamento</button>)}
        <Forzar v={v} admin={admin} />
      </div>
    </>
  );
}

// ---------------------------------------------------------------- Fin
const TEXTO_FIN = {
  tareas: ['¡La caravana está lista!', 'Los leales completaron todas las tareas.'],
  traidores_fuera: ['¡Traidores descubiertos!', 'No queda ni un solo traidor en la caravana.'],
  mayoria: ['¡La caravana ha caído!', 'Los traidores ya son tantos como los demás.'],
  incendio: ['¡El campamento ha ardido!', 'Nadie apagó el incendio a tiempo.'],
  bufon: ['¡El Bufón se ha salido con la suya!', 'Lo expulsaron… y así es como quería ganar.']
};
const CAUSA = { asesinado: 'eliminado', expulsado: 'expulsado', abandono: 'abandonó' };

export function PantallaFin({ v, puntosTotales, offset, onSalir, children }) {
  const f = v.fin;
  const [titulo, sub] = TEXTO_FIN[f.motivo] || ['Fin de la partida', ''];
  const clase = f.ganador === 'leales' ? 'leales' : f.ganador === 'traidores' ? 'traidores' : 'bufon';
  const bufon = f.roles.find((r) => r.rol === 'bufon');
  const yoGano = (f.puntos[v.yo.id] || 0) > 0;
  return (
    <>
      <Hero v={v} offset={offset} onSalir={onSalir} clase={`fin ${clase}`}
        etiqueta={f.ganador === 'leales' ? 'Ganan los leales' : f.ganador === 'traidores' ? 'Ganan los traidores' : 'Gana el Bufón'}
        titulo={titulo} />
      <div className={`trp-tarjeta tr-fin ${clase}`}>
        <span className="tr-fin-ico"><Icon name={f.ganador === 'leales' ? 'trophy' : f.ganador === 'traidores' ? 'dagger' : 'mask'} size={40} strokeWidth={1.8} /></span>
        <p className="tr-fin-sub">{f.motivo === 'bufon' && bufon ? `${bufon.nombre}: ${sub.toLowerCase()}` : sub}</p>
        <p className={`tr-fin-yo ${yoGano ? 'gana' : 'pierde'}`}>{yoGano ? `¡Has ganado! +${f.puntos[v.yo.id]} puntos` : 'Esta vez no has ganado.'}</p>
      </div>
      <div className="trp-tarjeta">
        <p className="trp-etiqueta"><Icon name="mask" size={14} /> Quién era quién</p>
        <div className="tr-lista-roles">
          {f.roles.map((r) => (
            <div key={r.id} className={`tr-fila-rol ${ROLES[r.rol].equipo}`}>
              <span className="tr-fila-nombre">
                <Avatar id={r.id} nombre={r.nombre} muerto={!r.vivo} />
                <span>
                  {r.nombre}{r.id === v.yo.id ? ' (tú)' : ''}
                  <small><Icon name={ICONO_ROL[r.rol]} size={12} /> {r.rolNombre} · {r.vivo ? 'sobrevivió' : CAUSA[r.causa] || 'fuera'}{r.asesinatos ? ` · ${r.asesinatos} ${plural(r.asesinatos, 'víctima', 'víctimas')}` : ''}</small>
                </span>
              </span>
              <span className="tr-pts">
                {f.puntos[r.id] ? `+${f.puntos[r.id]}` : '+0'}
                {puntosTotales && puntosTotales[r.id] != null && <small>{puntosTotales[r.id]} en total</small>}
              </span>
            </div>
          ))}
        </div>
      </div>
      <Registro v={v} abierto />
      {children}
    </>
  );
}

// ---------------------------------------------------------------- Registro y espectro
export function Registro({ v, abierto = false }) {
  const reg = v.registro || [];
  if (!reg.length) return null;
  return (
    <details className="tr-detalle" open={abierto}>
      <summary><Icon name="book" size={16} /> Asambleas anteriores ({reg.length})</summary>
      {reg.map((r, i) => (
        <div key={i} className="tr-reg">
          <b>Asamblea {i + 1}</b> ({r.motivo === 'cuerpo' ? `cuerpo hallado por ${r.pornombre}` : `campana de ${r.pornombre}`}):{' '}
          {r.expulsadoId != null ? `${r.nombre} fue expulsado y era ${ROLES[r.rol].nombre}.` : 'nadie fue expulsado.'}
        </div>
      ))}
    </details>
  );
}

export function Espectro({ v }) {
  if (!v.espectro) return null;
  return (
    <details className="tr-detalle tr-espectro" open>
      <summary><Icon name="skull" size={16} /> Desde el más allá (¡es secreto!)</summary>
      <div className="tr-lista-roles">
        {v.espectro.map((r) => (
          <div key={r.id} className={`tr-fila-rol ${r.equipo}`}>
            <span>{r.nombre}<small>{r.rolNombre}{r.vivo ? (r.sala !== '—' ? ` · ahora en ${r.sala}` : '') : ' · fuera de juego'}</small></span>
          </div>
        ))}
      </div>
    </details>
  );
}

export function PantallaDeFase(props) {
  switch (props.v.fase) {
    case 'roles': return <FaseRol {...props} />;
    case 'juego': return <PantallaJuego {...props} />;
    case 'asamblea': return <FaseAsamblea {...props} />;
    case 'votacion': return <FaseVotacion {...props} />;
    case 'veredicto': return <FaseVeredicto {...props} />;
    default: return null;
  }
}
