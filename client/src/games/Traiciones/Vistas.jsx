// client/src/games/Traiciones/Vistas.jsx
// Pantallas de Traiciones (tiempo real). Reciben `v` (vista del jugador que genera engine.vistaDe) y
// `enviar(tipo, datos)`. `offset` = hora del servidor − hora del navegador, para temporizadores exactos.
import React, { useEffect, useRef, useState } from 'react';
import Icon from './IconoT.jsx';
import { SALAS, SALA, ALAS, ROLES } from './engine.js';
import Minijuego from './Minijuegos.jsx';
import './Traiciones.css';

export const ICONO_ROL = { viajero: 'flag', vigia: 'eye', protegido: 'shield', traidor: 'dagger', bufon: 'mask' };
const plural = (n, s, p) => (n === 1 ? s : p);

// Reloj que se refresca varias veces por segundo (hora del servidor)
function useAhora(offset = 0) {
  const [, setT] = useState(0);
  useEffect(() => { const i = setInterval(() => setT((x) => x + 1), 250); return () => clearInterval(i); }, []);
  return Date.now() + offset;
}
const seg = (ms) => Math.max(0, Math.ceil(ms / 1000));

// ---------------------------------------------------------------- Piezas pequeñas
export function Temporizador({ limite, offset = 0 }) {
  const ahora = useAhora(offset);
  const total = useRef({ limite: null, ms: 1 });
  if (!limite) return null;
  const resto = Math.max(0, limite - ahora);
  if (total.current.limite !== limite) total.current = { limite, ms: Math.max(resto, 1000) };
  const s = seg(resto);
  return (
    <div className={`tr-timer ${s <= 10 ? 'urgente' : ''}`}>
      <Icon name="clock" size={18} /> {Math.floor(s / 60)}:{String(s % 60).padStart(2, '0')}
      <div className="tr-timer-barra"><div className="tr-timer-fill" style={{ width: `${Math.min(100, (resto / total.current.ms) * 100)}%` }} /></div>
    </div>
  );
}

export function Privado({ children, etiqueta = 'Pantalla oculta' }) {
  const [oculto, setOculto] = useState(false);
  if (oculto) {
    return (
      <div className="tr-privado-tapa">
        <Icon name="eyeoff" size={34} /><span>{etiqueta}</span>
        <button type="button" className="secondary" onClick={() => setOculto(false)}><Icon name="eye" size={16} /> Mostrar</button>
      </div>
    );
  }
  return (
    <div className="tr-privado">
      {children}
      <div className="tr-center"><button type="button" className="secondary tr-ojo-btn" onClick={() => setOculto(true)}><Icon name="eyeoff" size={14} /> Ocultar pantalla</button></div>
    </div>
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

// ---------------------------------------------------------------- Cabecera
export function Hud({ v }) {
  const [verRol, setVerRol] = useState(false);
  const { hechas, total } = v.progreso;
  const pct = total ? Math.min(100, Math.round((hechas / total) * 100)) : 0;
  const clase = v.yo.vivo ? v.yo.equipo : 'espiritu';
  return (
    <>
      <div className="tr-hud">
        <span className="tr-chip"><Icon name="users" size={16} /> {v.jugadores.length} en la caravana</span>
        <button type="button" className={`tr-chip ${clase}`} style={{ border: 0, cursor: 'pointer' }} onClick={() => setVerRol((x) => !x)} title="Pulsa para mostrar u ocultar tu rol">
          <Icon name={v.yo.vivo ? ICONO_ROL[v.yo.rol] : 'skull'} size={16} />
          {!v.yo.vivo ? 'Espíritu' : verRol ? v.yo.rolNombre : 'Ver mi rol'}
        </button>
      </div>
      <div className="tr-camino">
        <div className="tr-camino-top"><span>Tareas de la caravana</span><span>{pct}%</span></div>
        <div className="tr-camino-barra">
          <div className="tr-camino-fill" style={{ width: `${pct}%` }} />
          <span className="tr-camino-meta"><Icon name="leaf" size={16} /></span>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------- Tu rol
export function FaseRol({ v, enviar }) {
  const eq = v.yo.equipo;
  const objetivo = eq === 'leales'
    ? 'Completad todas las tareas del campamento o expulsad a todos los traidores. Si veis un cuerpo, reportadlo.'
    : eq === 'traidores'
      ? 'Eliminad a quien se quede a solas con vosotros hasta ser tantos como los demás, o dejad que el incendio arrase el campamento.'
      : 'Consigue que la caravana te expulse en una votación. Si lo logras, ganas tú solo.';
  return (
    <div className="tr-wrap">
      <Privado etiqueta="Tu rol está oculto">
        <div className={`tr-rol ${eq}`}>
          <span className="tr-rol-ico"><Icon name={ICONO_ROL[v.yo.rol]} size={46} strokeWidth={1.8} /></span>
          <small>{eq === 'leales' ? 'Eres de los leales' : eq === 'traidores' ? 'Eres un traidor' : 'Eres neutral'}</small>
          <h1>{v.yo.rolNombre}</h1>
          <p>{v.yo.desc}</p>
          <p className="tr-rol-objetivo"><strong>Objetivo:</strong> {objetivo}</p>
          {v.yo.rol === 'traidor' && (
            <div className="tr-aliados">{v.yo.aliados.length ? `Tus cómplices: ${v.yo.aliados.map((a) => a.nombre).join(', ')}` : 'Trabajas solo: nadie más conoce el plan.'}</div>
          )}
        </div>
      </Privado>
      {v.listo
        ? <div className="tr-card tr-espera"><h3>Todo listo</h3><p className="tr-muted">Esperando a: {v.faltan.join(', ')}</p></div>
        : <button type="button" className="big full" onClick={() => enviar('rol')}><Icon name="check" size={22} strokeWidth={2.5} /> Entendido, ¡a la caravana!</button>}
    </div>
  );
}

// ---------------------------------------------------------------- Mapa del campamento
function Mapa({ v, enviar }) {
  const sala = v.yo.sala;
  const vecinos = sala ? SALA[sala].vecinos : [];
  const destino = v.yo.mov?.destino;
  const fuegos = new Set((v.incendio?.salas || []).filter((s) => !s.apagado).map((s) => s.id));
  const atajos = v.yo.rol === 'traidor' && v.yo.vivo ? (v.yo.atajos || 0) : 0;
  return (
    <>
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
              <span>{s.nombre.replace(/^(El|La) /, '')}</span>
              {v.radar && <b className="tr-nodo-n">{v.radar[s.id]}</b>}
              {actual && <i className="tr-nodo-yo">tú</i>}
              {puedoSaltar && <i className="tr-nodo-yo salto">atajo</i>}
            </button>
          );
        })}
      </div>
      <div className="tr-leyenda">
        {Object.entries(ALAS).map(([k, n]) => <span key={k} className={`tr-ley ala-${k}`}>{n}</span>)}
        {atajos > 0 && <span className="tr-ley salto">Atajos disponibles: {atajos}</span>}
      </div>
    </>
  );
}

// ---------------------------------------------------------------- Partida en curso
export function PantallaJuego({ v, enviar, offset }) {
  const ahora = useAhora(offset);
  const [ojeoSel, setOjeoSel] = useState('pozo');
  const [sabotajeAbierto, setSabotajeAbierto] = useState(false);
  const yo = v.yo;
  const s = v.sala;
  const op = v.opciones;
  const traidor = yo.rol === 'traidor' && yo.vivo;
  const trabajando = yo.trabajo;
  const enCamino = yo.mov;
  // espera de campana y de traidor: se restan los ms transcurridos desde que llegó la vista
  const desdeVista = ahora - v.ahora;
  const campanaMs = Math.max(0, yo.campanaEn - desdeVista);
  const matarMs = op ? Math.max(0, op.esperaMatar - desdeVista) : 0;
  const sabotajeMs = op ? Math.max(0, op.esperaSabotaje - desdeVista) : 0;

  const porSala = {};
  yo.tareas.forEach((t) => { porSala[t.sala] = porSala[t.sala] || { texto: t.texto, hechas: 0, total: 0 }; porSala[t.sala].total += 1; if (t.hecha) porSala[t.sala].hechas += 1; });
  const pendientes = yo.tareas.filter((t) => !t.hecha).length;

  return (
    <div className="tr-wrap">
      <Hud v={v} />

      {v.incendio && (
        <div className="tr-alerta fuego">
          <Icon name="flame" size={26} />
          <div>
            <strong>¡Incendio en el campamento!</strong>
            <span>Apagad el fuego en {v.incendio.salas.map((x) => `${x.nombre}${x.apagado ? ' ✔' : ''}`).join(' y ')} antes de que se acabe el tiempo: {seg(v.incendio.hasta - ahora)} s</span>
          </div>
        </div>
      )}
      {v.tormenta && !v.incendio && (
        <div className="tr-alerta tormenta"><Icon name="zap" size={26} /><div><strong>Tormenta de arena</strong><span>No distingues caras ni nombres durante {seg(v.tormenta.hasta - ahora)} s más.</span></div></div>
      )}
      {!yo.vivo && <div className="tr-alerta espiritu"><Icon name="skull" size={26} /><div><strong>Eres un espíritu</strong><span>{yo.tareasFalsas ? 'Ya no puedes hacer nada, pero ves todo.' : 'Puedes seguir con tus tareas, pero no puedes hablar con los vivos.'}</span></div></div>}
      {v.avisos.slice(-2).map((a, i) => <div key={a.t + '-' + i} className={`tr-diario-item ${a.tipo}`}>{a.x}</div>)}

      {trabajando?.tipo === 'tarea' && (
        <div className="tr-card tr-mj-card">
          <Minijuego id={trabajando.minijuego} clave={trabajando.inicio} onExito={() => enviar('tarea-hecha')} onCancelar={() => enviar('cancelar')} />
          <p className="tr-muted" style={{ margin: '.6rem 0 0', fontSize: '.85rem' }}>Los demás ven que estás trabajando. Si te mueves, pierdes lo avanzado.</p>
        </div>
      )}

      <Mapa v={v} enviar={enviar} />

      {enCamino ? (
        <div className="tr-card tr-center">
          <h3><Icon name="forward" size={18} /> En camino a {SALA[enCamino.destino].nombre}</h3>
          <Barra desde={enCamino.llegaEn - enCamino.ms} hasta={enCamino.llegaEn} etiqueta={enCamino.salto ? 'Por el atajo' : 'Llegando'} offset={offset} />
          <p className="tr-muted">{enCamino.salto ? 'Atajo secreto: apareces en otro punto del campamento mucho antes de lo normal.' : 'Mientras caminas nadie te ve y tú no ves a nadie.'}</p>
        </div>
      ) : s && (
        <div className="tr-card">
          <h3><Icon name={s.icono} size={20} /> Estás en {s.nombre}</h3>
          <div className="tr-gente">
            {s.presentes.length === 0 && s.anonimos === 0 && <span className="tr-muted">No hay nadie más aquí.</span>}
            {s.presentes.map((p) => <span key={p.id} className={`tr-persona ${p.fantasma ? 'muerto' : ''}`}>{p.nombre}{p.trabajando ? ' · trabajando' : ''}{p.fantasma ? ' (espíritu)' : ''}</span>)}
            {s.anonimos > 0 && <span className="tr-persona">{s.anonimos} {plural(s.anonimos, 'persona', 'personas')} entre la arena</span>}
          </div>

          {s.cuerpos.map((c) => (
            <div key={c.id} className="tr-muerte">
              <Icon name="skull" size={22} /><span>Aquí yace {c.nombre}.</span>
              {yo.vivo && <button type="button" className="tr-btn-matar" onClick={() => enviar('reportar')}><Icon name="bell" size={16} /> Reportar</button>}
            </div>
          ))}

          {trabajando?.tipo === 'fuego' && <Barra desde={trabajando.finEn - 4000} hasta={trabajando.finEn} etiqueta="Apagando el fuego" offset={offset} />}

          <div className="tr-acciones">
            {s.fuego && yo.vivo && !trabajando && <button type="button" className="big full tr-btn-sabotear" onClick={() => enviar('apagar')}><Icon name="flame" size={20} /> Apagar el fuego (4 s)</button>}
            {s.tarea && !trabajando && !v.incendio && <button type="button" className="big full" onClick={() => enviar('trabajar')}><Icon name="check" size={20} /> Empezar tarea: {s.tarea}</button>}
            {s.tarea && v.incendio && <p className="tr-muted">No se puede trabajar mientras haya un incendio.</p>}
          </div>
          {trabajando?.tipo === 'fuego' && <p className="tr-muted" style={{ margin: '.5rem 0 0' }}>Si te mueves, pierdes lo avanzado.</p>}
        </div>
      )}

      {traidor && op && (
        <div className="tr-traidor-box">
          <h3><Icon name="dagger" size={16} /> Tus armas de traidor</h3>
          {op.objetivoNombre
            ? <p>Estás a solas con {op.objetivoNombre}. {matarMs > 0 ? `Podrás actuar en ${seg(matarMs)} s.` : 'Nadie lo sabrá.'}</p>
            : <p>Solo puedes eliminar a alguien que esté a solas contigo.</p>}
          <div className="tr-acciones">
            <button type="button" className="big full tr-btn-matar" disabled={!op.puedeMatar || matarMs > 0} onClick={() => enviar('matar', { objetivo: op.objetivo })}>
              <Icon name="skull" size={20} /> {matarMs > 0 ? `Enfriándote… ${seg(matarMs)} s` : op.objetivoNombre ? `Eliminar a ${op.objetivoNombre}` : 'Eliminar'}
            </button>
            <button type="button" className="secondary full" disabled={sabotajeMs > 0 || !!v.incendio} onClick={() => setSabotajeAbierto((x) => !x)}>
              <Icon name="bomb" size={18} /> {sabotajeMs > 0 ? `Sabotaje disponible en ${seg(sabotajeMs)} s` : 'Sabotear…'}
            </button>
            {sabotajeAbierto && sabotajeMs === 0 && !v.incendio && (
              <div className="tr-opciones">
                <button type="button" onClick={() => { enviar('sabotear', { sabotaje: 'tormenta' }); setSabotajeAbierto(false); }}>Tormenta de arena (no se ven caras)</button>
                <button type="button" onClick={() => { enviar('sabotear', { sabotaje: 'incendio' }); setSabotajeAbierto(false); }}>Incendio (dos lugares, 45 s)</button>
              </div>
            )}
          </div>
          {yo.aliados.length > 0 && <p style={{ marginTop: '.6rem' }}>Cómplices: {yo.aliados.map((a) => a.nombre + (a.vivo ? '' : ' (fuera)')).join(', ')}</p>}
        </div>
      )}

      {yo.rol === 'vigia' && yo.vivo && (
        <div className="tr-card">
          <h3><Icon name="eye" size={18} /> Ojo avizor</h3>
          {v.ojeo ? (
            <p>Estás viendo {SALA[v.ojeo.sala].nombre} ({seg(v.ojeo.hasta - ahora)} s): {v.ojeo.presentes.length ? v.ojeo.presentes.map((p) => p.nombre).join(', ') : 'no hay nadie'}.</p>
          ) : yo.ojeoUsado ? <p className="tr-muted">Ya has usado tu ojo avizor.</p> : (
            <>
              <p className="tr-muted">Una sola vez: mira en directo quién hay en un lugar durante 12 s.</p>
              <select value={ojeoSel} onChange={(e) => setOjeoSel(e.target.value)}>{SALAS.map((x) => <option key={x.id} value={x.id}>{x.nombre}</option>)}</select>
              <button type="button" className="full" style={{ marginTop: '.5rem' }} onClick={() => enviar('ojear', { sala: ojeoSel })}>Ojear</button>
            </>
          )}
        </div>
      )}

      {v.radar && <div className="tr-card"><h3><Icon name="tower" size={18} /> Desde la Atalaya</h3><p className="tr-muted">Ves cuánta gente hay ahora mismo en cada lugar (los números del mapa). No ves quiénes son.</p></div>}

      {yo.vivo && (
        <div className="tr-card">
          <h3><Icon name="eye" size={18} /> Lo que has visto</h3>
          {v.feed.length === 0 ? <p className="tr-muted">Nada por ahora. Fíjate en quién entra y sale de donde estés.</p> : (
            <div className="tr-diario">{[...v.feed].reverse().map((e, i) => <div key={e.t + '-' + i} className={`tr-diario-item ${e.tipo === 'llega' ? 'ok' : 'mal'}`}>{e.texto} <small>(hace {seg(ahora - e.t)} s)</small></div>)}</div>
          )}
        </div>
      )}

      <div className="tr-card">
        <h3><Icon name="book" size={18} /> {yo.tareasFalsas ? 'Tus tareas de pega' : 'Tus tareas'} ({yo.tareas.length - pendientes}/{yo.tareas.length})</h3>
        {yo.tareasFalsas && <p className="tr-muted">Completarlas no hace avanzar nada, pero te sirven de coartada: nadie sabe cuáles son falsas.</p>}
        <div className="tr-lista-roles">
          {Object.entries(porSala).map(([id, t]) => (
            <div key={id} className="tr-fila-rol" style={t.hechas === t.total ? { opacity: .5 } : null}>
              <span>{t.texto}<small>{SALA[id].nombre}</small></span><span className="tr-pts">{t.hechas}/{t.total}</span>
            </div>
          ))}
        </div>
      </div>

      {yo.vivo && (
        <button type="button" className="secondary full" disabled={campanaMs > 0 || !!v.incendio || yo.campanas <= 0} onClick={() => enviar('campana')}>
          <Icon name="bell" size={18} /> {yo.campanas <= 0 ? 'Ya has tocado la campana' : v.incendio ? 'Campana bloqueada (incendio)' : campanaMs > 0 ? `Campana disponible en ${seg(campanaMs)} s` : 'Tocar la campana (asamblea, 1 uso)'}
        </button>
      )}
      <Espectro v={v} />
    </div>
  );
}

// ---------------------------------------------------------------- Asamblea (debate + chat)
function Chat({ v, enviar }) {
  const [txt, setTxt] = useState('');
  const fin = useRef(null);
  useEffect(() => { fin.current?.scrollIntoView({ block: 'nearest' }); }, [v.asamblea.chat.length]);
  const mandar = () => { if (!txt.trim()) return; enviar('chat', { texto: txt }); setTxt(''); };
  return (
    <div className="tr-card">
      <h3><Icon name="speech" size={18} /> Debate</h3>
      <div className="tr-chat">
        {v.asamblea.chat.length === 0 && <p className="tr-muted">Nadie ha dicho nada todavía. ¿Dónde estabas? ¿A quién viste?</p>}
        {v.asamblea.chat.map((m) => <div key={m.n} className={`tr-msg ${m.id === v.yo.id ? 'yo' : ''}`}><b>{m.nombre}:</b> {m.texto}</div>)}
        <div ref={fin} />
      </div>
      {v.yo.vivo ? (
        <div className="tr-nombre-fila" style={{ marginTop: '.6rem' }}>
          <input type="text" value={txt} maxLength={140} placeholder="Escribe (o habla en voz alta)…" onChange={(e) => setTxt(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') mandar(); }} />
          <button type="button" onClick={mandar}><Icon name="forward" size={18} /></button>
        </div>
      ) : <p className="tr-muted" style={{ marginTop: '.5rem' }}>Los espíritus no pueden hablar.</p>}
    </div>
  );
}

function CabeceraAsamblea({ v }) {
  const a = v.asamblea;
  return (
    <div className="tr-card tr-informe">
      <h2><Icon name="bell" size={22} /> {a.cuerpo ? `${a.por} ha encontrado un cuerpo` : `${a.por} ha tocado la campana`}</h2>
      {a.cuerpo && <div className="tr-muerte"><Icon name="skull" size={22} /><span>{a.cuerpo.nombre} yacía en {SALA[a.cuerpo.sala].nombre}.</span></div>}
      {a.muertos.length > 0 && <p className="tr-muted" style={{ marginTop: '.6rem' }}>Han sido eliminados: {a.muertos.join(', ')}.</p>}
      {a.muertos.length === 0 && !a.cuerpo && <p className="tr-muted" style={{ marginTop: '.6rem' }}>Todavía no ha muerto nadie… que se sepa.</p>}
      <div className="tr-gente">{v.jugadores.map((j) => <span key={j.id} className={`tr-persona ${j.vivo ? '' : 'muerto'}`}>{j.nombre}</span>)}</div>
    </div>
  );
}

export function FaseAsamblea({ v, enviar, offset }) {
  return (
    <div className="tr-wrap">
      <Hud v={v} />
      {v.limite ? <Temporizador limite={v.limite} offset={offset} /> : null}
      <CabeceraAsamblea v={v} />
      <Chat v={v} enviar={enviar} />
      {v.yo.vivo
        ? v.listo
          ? <div className="tr-card tr-espera"><h3>Listo para votar</h3><p className="tr-muted">Esperando a: {v.faltan.join(', ')}</p></div>
          : <button type="button" className="big full" onClick={() => enviar('listo-votar')}><Icon name="check" size={22} strokeWidth={2.5} /> Estoy listo para votar</button>
        : null}
      <Registro v={v} />
      <Espectro v={v} />
    </div>
  );
}

export function FaseVotacion({ v, enviar, offset }) {
  const candidatos = v.jugadores.filter((j) => j.vivo && j.id !== v.yo.id);
  const votado = v.miVoto !== undefined;
  return (
    <div className="tr-wrap">
      <Hud v={v} />
      <Temporizador limite={v.limite} offset={offset} />
      <div className="tr-card tr-center">
        <h2><Icon name="scale" size={22} /> ¿A quién expulsáis?</h2>
        <p className="tr-muted">Se expulsa a quien tenga más votos si supera a los votos en blanco. Con empate no se expulsa a nadie. Los votos serán públicos.</p>
      </div>
      {v.yo.vivo && (
        <div className="tr-votos">
          {candidatos.map((j) => (
            <button key={j.id} type="button" className={`tr-voto ${v.miVoto === j.id ? 'sel' : ''}`} onClick={() => enviar('votar', { objetivo: j.id })}>
              <strong>{j.nombre}</strong>{v.miVoto === j.id && <small>Tu voto</small>}
            </button>
          ))}
          <button type="button" className={`tr-voto saltar ${votado && v.miVoto === null ? 'sel' : ''}`} onClick={() => enviar('votar', { objetivo: null })}>
            <strong>No expulsar a nadie</strong>{votado && v.miVoto === null && <small>Tu voto</small>}
          </button>
        </div>
      )}
      {v.yo.vivo && votado && <div className="tr-card tr-espera"><h3>Voto registrado</h3><p className="tr-muted">Puedes cambiarlo hasta que voten todos. Faltan: {v.faltan.join(', ') || 'nadie'}</p></div>}
      <Chat v={v} enviar={enviar} />
      <Espectro v={v} />
    </div>
  );
}

export function TarjetaVeredicto({ v }) {
  const vr = v.veredicto;
  if (!vr) return null;
  const nombre = (id) => v.jugadores.find((j) => j.id === id)?.nombre ?? '?';
  const equipo = vr.rol ? ROLES[vr.rol].equipo : null;
  return (
    <div className="tr-card tr-veredicto">
      {vr.expulsado ? (
        <>
          <h2>{vr.expulsado} ha sido expulsado de la caravana</h2>
          <span className={`tr-rol-reveal ${equipo}`}><Icon name={ICONO_ROL[vr.rol]} size={16} /> Era {ROLES[vr.rol].nombre}</span>
        </>
      ) : (<><h2>Nadie ha sido expulsado</h2><p className="tr-muted">Empate, o más votos en blanco que contra cualquier sospechoso.</p></>)}
      <div className="tr-tabla-votos">
        {Object.entries(vr.votos).map(([votante, objetivo]) => (
          <div key={votante}><span>{nombre(Number(votante))}</span><span>{objetivo ? `→ ${nombre(objetivo)}` : 'en blanco'}</span></div>
        ))}
      </div>
    </div>
  );
}

export function FaseVeredicto({ v, enviar, offset }) {
  return (
    <div className="tr-wrap">
      <Hud v={v} />
      <Temporizador limite={v.limite} offset={offset} />
      <TarjetaVeredicto v={v} />
      {v.yo.vivo && (v.listo
        ? <div className="tr-card tr-espera"><h3>Volviendo al campamento…</h3></div>
        : <button type="button" className="big full" onClick={() => enviar('continuar')}><Icon name="forward" size={22} /> Volver al campamento</button>)}
      <Espectro v={v} />
    </div>
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
export function PantallaFin({ v, puntosTotales, children }) {
  const f = v.fin;
  const [titulo, sub] = TEXTO_FIN[f.motivo] || ['Fin de la partida', ''];
  const clase = f.ganador === 'leales' ? 'leales' : f.ganador === 'traidores' ? 'traidores' : 'bufon';
  const bufon = f.roles.find((r) => r.rol === 'bufon');
  return (
    <div className="tr-wrap">
      <div className={`tr-fin ${clase}`}>
        <span className="tr-fin-ico"><Icon name={f.ganador === 'leales' ? 'trophy' : f.ganador === 'traidores' ? 'dagger' : 'mask'} size={46} strokeWidth={1.8} /></span>
        <h1>{titulo}</h1>
        <p>{f.motivo === 'bufon' && bufon ? `${bufon.nombre} ${sub.toLowerCase()}` : sub}</p>
        <p style={{ marginTop: '.5rem', opacity: .9 }}>{f.ganador === 'leales' ? 'Ganan los leales' : f.ganador === 'traidores' ? 'Ganan los traidores' : 'Gana el Bufón'}</p>
      </div>
      <div className="tr-card">
        <h3><Icon name="mask" size={18} /> Quién era quién</h3>
        <div className="tr-lista-roles">
          {f.roles.map((r) => (
            <div key={r.id} className={`tr-fila-rol ${ROLES[r.rol].equipo}`}>
              <span>
                <Icon name={ICONO_ROL[r.rol]} size={16} /> {r.nombre}{r.id === v.yo.id ? ' (tú)' : ''}
                <small>{r.rolNombre} · {r.vivo ? 'sobrevivió' : r.causa === 'asesinado' ? 'eliminado' : r.causa === 'expulsado' ? 'expulsado' : 'abandonó'}{r.asesinatos ? ` · ${r.asesinatos} ${plural(r.asesinatos, 'víctima', 'víctimas')}` : ''}</small>
              </span>
              <span className="tr-pts">{f.puntos[r.id] ? `+${f.puntos[r.id]} pts` : ''}{puntosTotales ? ` (${puntosTotales[r.id] ?? 0})` : ''}</span>
            </div>
          ))}
        </div>
      </div>
      <Registro v={v} abierto />
      {children}
    </div>
  );
}

// ---------------------------------------------------------------- Registro y espectro
export function Registro({ v, abierto = false }) {
  const reg = v.registro || [];
  if (!reg.length) return null;
  return (
    <details className="tr-detalle" open={abierto}>
      <summary>Asambleas anteriores</summary>
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
      <summary><Icon name="skull" size={16} /> Desde el más allá (no hables, ¡es secreto!)</summary>
      <div className="tr-lista-roles">
        {v.espectro.map((r) => (
          <div key={r.id} className={`tr-fila-rol ${r.equipo}`}>
            <span>{r.nombre}<small>{r.rolNombre}{r.vivo ? ` · ahora en ${r.sala}` : ' · fuera de juego'}</small></span>
          </div>
        ))}
      </div>
    </details>
  );
}

// ---------------------------------------------------------------- Reglas
export function Ayuda({ onCerrar }) {
  return (
    <div className="tr-modal-fondo" onClick={onCerrar}>
      <div className="tr-modal" onClick={(e) => e.stopPropagation()}>
        <h3>¿Cómo se juega a Traiciones?</h3>
        <p>Una caravana acampa en el desierto. Entre los viajeros hay <strong>traidores</strong>. La partida es <strong>en tiempo real y no se detiene</strong> hasta que alguien reporta un cuerpo o toca la campana.</p>
        <h4>Moverse y ver</h4>
        <ul>
          <li>El campamento tiene nueve lugares: una plaza central (la hoguera) y cuatro alas —norte, este, sur y oeste— de dos salas cada una. Los fondos de alas vecinas se comunican entre sí formando un anillo.</li>
          <li>Solo puedes ir a una <strong>sala contigua</strong> (tardas unos segundos; mientras caminas nadie te ve).</li>
          <li>Solo ves, en directo, a quien está <strong>en tu mismo lugar</strong>, y quién entra o sale. Nada queda anotado: tienes que fijarte y recordar.</li>
          <li>Nadie sabe si otro jugador sigue vivo hasta que aparece un cuerpo o se celebra una asamblea.</li>
        </ul>
        <h4>Viajeros</h4>
        <ul>
          <li>Tienes varias tareas repartidas por el campamento. Cada sala tiene su propia prueba (puntería, memoria, cálculo, pulso…). Si te mueves o la dejas, pierdes lo avanzado.</li>
          <li>Si ves un cuerpo, <strong>repórtalo</strong>. Si sospechas que falta alguien, toca la <strong>campana</strong> (una vez por jugador).</li>
          <li>Ganáis si se completan todas las tareas o se expulsa a todos los traidores.</li>
        </ul>
        <h4>Traidores</h4>
        <ul>
          <li>Podéis eliminar a alguien <strong>solo si está a solas con vosotros</strong>, y debéis esperar un rato entre muerte y muerte.</li>
          <li><strong>Atajo:</strong> cada vez que matáis ganáis un salto a cualquier sala lejana (rápido, y se pierde en la próxima asamblea). Los demás solo veréis que alguien «se ha ido» y que otro «ha llegado»: fijaos en los tiempos.</li>
          <li>Sabotajes: <strong>tormenta de arena</strong> (nadie distingue caras) e <strong>incendio</strong> (hay que apagarlo en dos lugares a la vez antes de 45 s o ganáis vosotros; mientras arde nadie puede hacer tareas).</li>
          <li>Ganáis al ser tantos como los demás, o si el campamento arde.</li>
        </ul>
        <h4>Asamblea</h4>
        <p>Todos van a la hoguera, debaten (chat o voz) y votan. Se expulsa a quien más votos tenga (con empate, nadie). El rol del expulsado se revela y los votos son públicos.</p>
        <h4>Otros roles (7+ jugadores con roles especiales)</h4>
        <ul>
          <li><strong>Vigía:</strong> una vez, ve en directo quién hay en cualquier lugar. <strong>Protegido:</strong> sobrevive al primer ataque y descubre al traidor. <strong>Bufón:</strong> gana solo si lo expulsan.</li>
          <li>La <strong>Atalaya</strong> muestra cuánta gente hay en cada lugar (sin nombres).</li>
          <li>Los eliminados son <strong>espíritus</strong>: siguen haciendo tareas, ven todo, pero no pueden hablar.</li>
        </ul>
        <p><strong>Puntos:</strong> leales +3 (+1 si sobreviven), traidores +5 (+1 por víctima), Bufón +7.</p>
        <div className="tr-modal-acciones"><button type="button" className="big full" onClick={onCerrar}>Entendido</button></div>
      </div>
    </div>
  );
}

export function PantallaDeFase({ v, enviar, offset }) {
  switch (v.fase) {
    case 'roles': return <FaseRol v={v} enviar={enviar} />;
    case 'juego': return <PantallaJuego v={v} enviar={enviar} offset={offset} />;
    case 'asamblea': return <FaseAsamblea v={v} enviar={enviar} offset={offset} />;
    case 'votacion': return <FaseVotacion v={v} enviar={enviar} offset={offset} />;
    case 'veredicto': return <FaseVeredicto v={v} enviar={enviar} offset={offset} />;
    default: return null;
  }
}
