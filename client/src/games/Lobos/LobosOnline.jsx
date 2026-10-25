// client/src/games/Lobos/LobosOnline.jsx
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './Lobos.css';
import Icon from '../../components/Icon.jsx';
import { ROLES, BANDOS } from './roles.js';
import { EVENTOS, OBJETOS, MODIFICADORES, TEXTO_CAUSA, CAUSAS_PUBLICAS } from './engine.js';
import TarjetaRol from './TarjetaRol.jsx';
import TurnoNoche, { ElegirUno, BotonAbstenerse } from './TurnoNoche.jsx';
import SelectorRoles, { ChipsRoles, ListaRolesExplicados, selInicial } from './SelectorRoles.jsx';

const API = '/api/lobos';
const CLAVE_SESION = 'lobos-sesion';

async function llamar(ruta, metodo = 'GET', cuerpo, signal) {
  const r = await fetch(API + ruta, {
    method: metodo, signal,
    headers: { 'Content-Type': 'application/json' },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined
  });
  let datos = {};
  try { datos = await r.json(); } catch { /* respuesta vacía */ }
  if (!r.ok) { const err = new Error(datos.error || 'Error de conexión'); err.estado = r.status; throw err; }
  return datos;
}

const leerSesion = () => { try { return JSON.parse(sessionStorage.getItem(CLAVE_SESION)); } catch { return null; } };
const guardarSesion = (s) => { try { if (s) sessionStorage.setItem(CLAVE_SESION, JSON.stringify(s)); else sessionStorage.removeItem(CLAVE_SESION); } catch { /* sin almacenamiento */ } };

export function vistaAE(v) {
  const m = v?.mi || {};
  const yoNum = Number(v?.yo);
  const jugadores = (v?.jugadores || []).map((p) => (Number(p.id) === yoNum
    ? { id: p.id, nombre: p.nombre, vivo: m.vivo ?? p.vivo ?? true, rol: m.rol, rolInicial: m.rolInicial || m.rol, estado: m.estado || {}, avisos: [] }
    : { id: p.id, nombre: p.nombre, vivo: p.vivo ?? true, rol: p.rolRevelado || null, rolInicial: p.rolRevelado || null, estado: {}, avisos: [] }));
  const t = v?.noche?.turno;
  return {
    jugadores,
    ronda: v?.ronda || 1,
    amantes: m.amante != null ? [v.yo, m.amante] : null,
    fichas: { [v.yo]: m.fichas || 0 },
    flags: { sinAtaque: !!t?.sinAtaque, juezArmado: !!m.juezArmado, ladron: null },
    noche: { evento: v?.noche?.evento ?? v?.nocheEvento ?? null, victima: t?.victima, acc: Object.fromEntries(Object.entries(t?.manadaVotos || {}).map(([k, o]) => [k, { objetivo: o }])) },
    eco: t?.eco || null,
    companeros: (m.companeros || []).map((c) => (c && typeof c === 'object' ? c.id : c)),
    config: { votosPublicos: v?.config?.votosPublicos ?? true },
    modDia: v?.modDia || null,
    pendientes: [],
    anuncio: null,
    victoriasPersonales: v?.victoriasPersonales || []
  };
}

function useSala(sesion, alInvalidarse) {
  const [vista, setVista] = useState(null);
  const [errorRed, setErrorRed] = useState(false);
  const offset = useRef(0);

  useEffect(() => {
    if (!sesion) return undefined;
    let activo = true;
    const ctl = new AbortController();
    let ver = 0;
    (async () => {
      while (activo) {
        try {
          const r = await llamar(`/${sesion.code}/estado?token=${sesion.token}&ver=${ver}`, 'GET', undefined, ctl.signal);
          setErrorRed(false);
          if (r.sinCambios) continue;
          ver = r.vista.ver;
          offset.current = r.vista.ahora - Date.now();
          setVista(r.vista);
        } catch (err) {
          if (!activo) return;
          if (err.estado === 403 || err.estado === 404) { alInvalidarse(err.message); return; }
          setErrorRed(true);
          await new Promise((ok) => { setTimeout(ok, 1500); });
        }
      }
    })();
    return () => { activo = false; ctl.abort(); };
  }, [sesion?.code, sesion?.token]);

  const [aviso, setAviso] = useState(null);
  const enviar = useCallback(async (msg) => {
    try {
      const r = await llamar(`/${sesion.code}/accion`, 'POST', { token: sesion.token, ...msg });
      if (r.vista) { offset.current = r.vista.ahora - Date.now(); setVista((actual) => (!actual || r.vista.ver >= actual.ver ? r.vista : actual)); }
      setAviso(null);
      return true;
    } catch (err) {
      setAviso(err.message);
      setTimeout(() => setAviso(null), 4000);
      return false;
    }
  }, [sesion?.code, sesion?.token]);

  return { vista, enviar, errorRed, aviso, offset };
}

function Cuenta({ finTs, offset }) {
  const [, tic] = useState(0);
  useEffect(() => { const h = setInterval(() => tic((x) => x + 1), 500); return () => clearInterval(h); }, []);
  if (!finTs) return null;
  const s = Math.max(0, Math.round((finTs - (Date.now() + offset.current)) / 1000));
  return <span className="lb-cuenta"><Icon name="clock" size={16} />{Math.floor(s / 60)}:{String(s % 60).padStart(2, '0')}</span>;
}

function Espera({ texto, faltan, v, offset, children }) {
  return (
    <div className="panel center">
      <span className="lb-luna chica"><Icon name="hourglass" size={40} strokeWidth={1.6} /></span>
      <p className="lb-res-titulo">{texto}</p>
      {faltan != null && <p className="hint">Faltan {faltan} jugador{faltan === 1 ? '' : 'es'} por terminar. <Cuenta finTs={v?.finTs} offset={offset} /></p>}
      {children}
    </div>
  );
}

function ListaJugadores({ v }) {
  return (
    <div className="panel" style={{ marginTop: '1rem' }}>
      <h3 className="panel-title"><Icon name="users" size={20} /> Jugadores</h3>
      <div className="lb-lista">
        {v.jugadores.map((p) => (
          <div key={p.id} className={`lb-jug ${p.vivo === false ? 'muerto' : ''} ${p.id === v.yo ? 'yo' : ''}`}>
            <span className="lb-jug-nombre">{p.nombre}{p.id === v.yo ? ' (tú)' : ''}{p.id === 0 ? ' 👑' : ''}{p.bot ? ' 🤖' : ''}</span>
            {p.vivo === false && p.rolRevelado && <span className="lb-jug-rol">✝ {ROLES[p.rolRevelado].nombre}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function Entrada({ onEntrar, onLocal }) {
  const [modo, setModo] = useState(null);
  const [nombre, setNombre] = useState('');
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const enviar = async () => {
    setError(''); setCargando(true);
    try {
      const r = modo === 'crear'
        ? await llamar('/crear', 'POST', { nombre })
        : await llamar(`/${codigo.trim().toUpperCase()}/unirse`, 'POST', { nombre });
      onEntrar({ code: r.code, token: r.token });
    } catch (err) { setError(err.message); } finally { setCargando(false); }
  };

  return (
    <section className="game">
      <div className="panel center">
        <span className="lb-luna chica"><Icon name="moon" size={44} strokeWidth={1.5} /></span>
        <h1 className="title">Luna de Sangre</h1>
        <p className="hint">Cada jugador, desde su propio móvil. El anfitrión crea la partida y comparte el código.</p>
        {!modo && (
          <div className="lb-menu">
            <button className="big full" onClick={() => setModo('crear')}><Icon name="crown" size={22} /> Crear partida</button>
            <button className="big full" onClick={() => setModo('unirse')}><Icon name="users" size={22} /> Unirse a partida</button>
            <button className="secondary full" onClick={onLocal}><Icon name="home" size={20} /> Jugar en un solo dispositivo</button>
          </div>
        )}
        {modo && (
          <div className="lb-form">
            {modo === 'unirse' && (
              <>
                <label className="field-label" htmlFor="lb-codigo">Código de la partida</label>
                <input id="lb-codigo" className="lb-input-codigo" type="text" value={codigo} maxLength={5} autoCapitalize="characters" autoComplete="off"
                  onChange={(ev) => setCodigo(ev.target.value.toUpperCase())} placeholder="ABCDE" />
              </>
            )}
            <label className="field-label" htmlFor="lb-nombre">Tu nombre</label>
            <input id="lb-nombre" type="text" value={nombre} maxLength={20} autoComplete="off" onChange={(ev) => setNombre(ev.target.value)} placeholder="Tu nombre" />
            {error && <p className="error">{error}</p>}
            <button className="big full" disabled={cargando || !nombre.trim() || (modo === 'unirse' && codigo.trim().length < 5)} onClick={enviar}>
              <Icon name="check" size={22} strokeWidth={2.5} /> {modo === 'crear' ? 'Crear sala' : 'Entrar en la partida'}
            </button>
            <button className="secondary full" onClick={() => { setModo(null); setError(''); }}>Volver</button>
          </div>
        )}
      </div>
    </section>
  );
}

export function Lobby({ v, enviar, onAbrirModalSalir }) {
  const n = v.jugadores.length;
  const nEf = Math.min(v.limites.max, Math.max(v.limites.min, n));
  const [sel, setSel] = useState(() => selInicial(nEf));
  const [mec, setMec] = useState(() => ({ ...v.config.mec }));
  const [copiado, setCopiado] = useState(false);
  const primera = useRef(true);

  useEffect(() => {
    if (!v.esAdmin) return undefined;
    if (primera.current) { primera.current = false; return undefined; }
    const h = setTimeout(() => {
      enviar({ tipo: 'config', config: { seleccion: { modo: sel.tab === 'recomendadas' ? 'recomendada' : 'personalizada', tipo: sel.tipoSel, custom: sel.custom }, mec } });
    }, 350);
    return () => clearTimeout(h);
  }, [sel.tab, sel.tipoSel, sel.custom, mec]);

  const copiar = async () => {
    try { await navigator.clipboard.writeText(v.code); setCopiado(true); setTimeout(() => setCopiado(false), 1800); } catch { /* sin portapapeles */ }
  };
  const cfg = (c) => enviar({ tipo: 'config', config: c });
  const faltan = v.limites.min - n;

  return (
    <section className="game" style={{ position: 'relative' }}>
      <div className="panel center">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.8rem' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.35rem 1.1rem',
              borderRadius: '9999px',
              border: '1.5px solid #22c55e',
              backgroundColor: '#f0fdf4',
              color: '#16a34a',
              fontSize: '0.85rem',
              fontWeight: 600,
              lineHeight: 1
            }}
          >
            <Icon name="lock" size={15} />
            Sala de espera
          </span>
        </div>
        <p className="hint">Código de la partida</p>
        <button type="button" className="qq-codigo-btn" onClick={copiar} title="Copiar código">
          {v.code}
        </button>
        <p className="hint small">
          {copiado ? '¡Copiado al portapapeles!' : 'Pulsa el código para copiarlo y compártelo con los demás.'}
        </p>
      </div>

      <div className="panel" style={{ marginTop: '1rem' }}>
        <h3 className="panel-title"><Icon name="users" size={20} /> Jugadores ({n}/{v.limites.max})</h3>
        <div className="lb-lista">
          {v.jugadores.map((p) => (
            <div key={p.id} className={`lb-jug ${p.id === v.yo ? 'yo' : ''}`}>
              <span className="lb-jug-nombre">{p.nombre}{p.id === v.yo ? ' (tú)' : ''}{p.id === 0 ? ' 👑' : ''}{p.bot ? ' 🤖' : ''}</span>
              {v.esAdmin && p.id !== 0 && <button type="button" className="secondary lb-quitar" onClick={() => enviar({ tipo: 'expulsar', id: p.id })}>Quitar</button>}
            </div>
          ))}
        </div>
        {faltan > 0 ? <p className="hint">Faltan {faltan} jugador{faltan === 1 ? '' : 'es'} para poder empezar (mínimo {v.limites.min}).</p> : <p className="hint ok">¡Ya sois suficientes! El anfitrión puede empezar cuando quiera.</p>}
        {v.esAdmin && n < v.limites.max && (
          <button type="button" className="secondary full" onClick={() => enviar({ tipo: 'addBot' })}><Icon name="chip" size={18} /> Añadir un jugador de prueba (bot)</button>
        )}
      </div>

      {v.esAdmin ? (
        <>
          <div className="panel" style={{ marginTop: '1rem' }}>
            <h3 className="panel-title"><Icon name="settings" size={20} /> Opciones de la partida</h3>
            <label className="field-label" htmlFor="lb-min">Tiempo de debate diurno</label>
            <select id="lb-min" value={v.config.minutos} onChange={(ev) => cfg({ minutos: Number(ev.target.value) })}>
              <option value={0}>Sin límite (el anfitrión decide)</option>
              {[1, 2, 3, 5].map((m) => <option key={m} value={m}>{m} minuto{m > 1 ? 's' : ''}</option>)}
            </select>
            <label className="field-label" htmlFor="lb-noche">Tiempo máximo por noche</label>
            <select id="lb-noche" value={v.config.nocheSeg} onChange={(ev) => cfg({ nocheSeg: Number(ev.target.value) })}>
              {[60, 90, 120, 180].map((s) => <option key={s} value={s}>{s} segundos</option>)}
            </select>
            <label className="field-label" htmlFor="lb-voto">Tiempo máximo de votación</label>
            <select id="lb-voto" value={v.config.votoSeg} onChange={(ev) => cfg({ votoSeg: Number(ev.target.value) })}>
              {[30, 45, 60, 90].map((s) => <option key={s} value={s}>{s} segundos</option>)}
            </select>
            <label className="lb-check">
              <input type="checkbox" checked={v.config.votosPublicos} onChange={(ev) => cfg({ votosPublicos: ev.target.checked })} />
              <span>Mostrar quién votó a quién tras el recuento</span>
            </label>
          </div>
          <h2 className="title" style={{ marginTop: '1.2rem' }}>Elige los roles</h2>
          <SelectorRoles n={nEf} sel={sel} setSel={setSel} mec={mec} setMec={setMec} />
          {v.validacion.errores.map((m) => <p key={m} className="error">{m}</p>)}
          <div className="actions">
            <button className="big full" disabled={!v.puedeEmpezar || v.validacion.errores.length > 0} onClick={() => enviar({ tipo: 'empezar' })}>
              <Icon name="moon" size={22} /> ¡Empezar partida!
            </button>
            <button className="secondary danger full" onClick={onAbrirModalSalir}>Cerrar sala</button>
          </div>
        </>
      ) : (
        <>
          <div className="panel" style={{ marginTop: '1rem' }}>
            <h3 className="panel-title"><Icon name="dice" size={20} /> Roles previstos</h3>
            <p className="hint small">El anfitrión está eligiendo los roles. Esto es lo que hay ahora mismo:</p>
            <ChipsRoles roles={v.roles} />
            <ListaRolesExplicados roles={v.roles} conDetalle />
            {Object.entries(v.config.mec).some(([, on]) => on) && <p className="hint small">Mecánicas activadas: {Object.entries(v.config.mec).filter(([, on]) => on).map(([k]) => ({ eventos: 'eventos nocturnos', objetos: 'objetos', rumores: 'rumores', modif: 'votos especiales' }[k])).join(', ')}.</p>}
          </div>
          <div className="actions"><button className="secondary danger full" onClick={onAbrirModalSalir}>Salir de la partida</button></div>
        </>
      )}
    </section>
  );
}

function VotoRemoto({ v, e, enviar, offset }) {
  const [paso, setPaso] = useState('propio');
  const [propio, setPropio] = useState(null);
  const vivos = v.jugadores.filter((p) => p.vivo).map((p) => p.id);
  const otros = vivos.filter((x) => x !== v.yo);
  const robadoDe = v.votacion.robadoDe;
  const abstener = (cb) => <BotonAbstenerse onClick={() => cb(null)} />;
  const finalizar = (voto, robado) => enviar({ tipo: 'votar', voto, ...(robado !== undefined ? { robado } : {}) });

  return (
    <div className="panel">
      {v.votacion.avisoRepite && <p className="lb-evento grande"><Icon name="landmark" size={20} /> <strong>¡Veredicto invocado!</strong> Alguien ha anulado la votación: se repite. Si la segunda señala al mismo jugador, el Juez Corrupto también pagará con su vida.</p>}
      {v.modDia && !v.votacion.segunda && <p className="lb-evento"><Icon name="landmark" size={18} /> <strong>{MODIFICADORES[v.modDia].nombre}:</strong> {MODIFICADORES[v.modDia].texto}</p>}
      {paso === 'propio' ? (
        <>
          <h2 className="title">{v.votacion.segunda ? 'Votación repetida' : 'Votación'}</h2>
          <p className="hint">Elige a quién linchar. Tu voto es secreto hasta el recuento. <Cuenta finTs={v.finTs} offset={offset} /></p>
          <ElegirUno e={e} opciones={otros} texto="Votar a este jugador" onConfirmar={(t) => { if (robadoDe != null) { setPropio(t); setPaso('robado'); } else finalizar(t); }}
            arriba={abstener((t) => { if (robadoDe != null) { setPropio(t); setPaso('robado'); } else finalizar(t); })} />
        </>
      ) : (
        <>
          <h2 className="title">Voto robado</h2>
          <div className="lb-haz"><p>Como <strong>Ladrón de Voces</strong>, emites también el voto de <strong>{e.jugadores[robadoDe].nombre}</strong>. Él no lo sabrá hasta el recuento.</p></div>
          <ElegirUno e={e} opciones={vivos.filter((x) => x !== robadoDe)} texto="Emitir voto robado" onConfirmar={(t) => finalizar(propio, t)} arriba={abstener((t) => finalizar(propio, t))} />
        </>
      )}
    </div>
  );
}

function InfoNoche({ info }) {
  if (!info?.length) return null;
  const txtBando = { lobos: '🐺 es un LOBO', pueblo: '🏡 es del PUEBLO', solitario: '🔥 es un SOLITARIO' };
  return (
    <div className="lb-resultado">
      {info.map((i, k) => (
        <div key={k}>
          {i.tipo === 'vidente' && <><p className="lb-res-titulo">{i.nombre}</p><p className="lb-res-grande" style={{ color: BANDOS[i.bando].color }}>{txtBando[i.bando]}</p></>}
          {i.tipo === 'cartografo' && <><p className="lb-res-titulo">{i.a} y {i.b}</p><p className="lb-res-grande">Distancia: {i.dist} {i.dist === 1 ? 'asiento' : 'asientos'}</p></>}
          {i.tipo === 'cupido' && <><p className="lb-res-titulo">💘 Enamorados</p><p className="lb-res-grande">{i.a} y {i.b}</p></>}
          {i.tipo === 'pergamino' && <><p className="lb-res-titulo">📜 Pergamino: {i.nombre}</p><p className="lb-res-grande">{ROLES[i.rol].nombre}</p></>}
          {i.niebla && <p className="hint small">La niebla enturbia tu visión: este resultado puede ser falso.</p>}
        </div>
      ))}
    </div>
  );
}

export function VistaJuego({ v, enviar, offset, onAbrirModalSalir }) {
  const e = useMemo(() => vistaAE(v), [v]);
  const [verRol, setVerRol] = useState(false);
  const [textoEco, setTextoEco] = useState('');
  const m = v.mi;
  const vivo = m.vivo;

  // Clave representativa de los avisos actuales recibidos del servidor
  const avisosKey = JSON.stringify(m?.avisos || []);
  const [avisosVistosKey, setAvisosVistosKey] = useState('');

  const mostrarAvisosModal = Boolean(m?.avisos?.length > 0 && avisosVistosKey !== avisosKey);

  const handleCerrarAvisos = () => {
    setAvisosVistosKey(avisosKey);
    enviar({ tipo: 'ackAvisos' });
  };

  const avisoTexto = (a) => {
    if (a.tipo === 'amor') return `💘 Cupido os ha unido: estás enamorado/a de ${e.jugadores[a.con].nombre}. Si uno muere, el otro también. Si sois de bandos distintos y sobrevivís los dos hasta el final, ganáis juntos.`;
    if (a.tipo === 'infectado') return '🐺 Anoche el Lobo Alfa te infectó. Ahora eres un LOBO y ganas con la manada. Verás a tus compañeros en tu ficha de rol.';
    if (a.tipo === 'herencia') return `🪱 Tu huésped, ${a.de}, ha muerto. Has heredado su rol: ahora eres ${ROLES[a.rol].nombre}, con los usos que a él le quedaban.`;
    if (a.tipo === 'ficha') return '🪙 Alguien te ha entregado una ficha de favor. Si el pueblo fuera a linchar a quien la tiene, la ficha se gasta y se libra.';
    if (a.tipo === 'contagio') return '🤒 Te notas febril: estás contagiado. Conservas tu rol y tu bando, pero cuentas para la epidemia del Contagiado.';
    if (a.tipo === 'camaleon') return `🦎 Tu primer acusador fue ${a.acusador}, del bando ${BANDOS[a.bandoAcusador].nombre}. Por eso te unes al bando contrario: ahora eres del bando ${BANDOS[a.nuevo].nombre}${a.nuevo === 'lobos' ? ' y votarás víctima con la manada' : ''}.`;
    return '';
  };

  const rolActual = m?.rol ? ROLES[m.rol] : null;
  const iconoRol = vivo ? (rolActual?.icono || 'users') : 'skull';

  const cabecera = (
    <div className="hud">
      <span className="chip"><Icon name={iconoRol} size={18} />{vivo ? 'Ronda' : 'Eliminado · ronda'} {v.ronda}</span>
      <button type="button" className="secondary lb-mirol" onClick={() => setVerRol(true)}><Icon name="eye" size={18} /> Mi rol</button>
    </div>
  );

  const ecoForm = v.puedoEco && (
    <div className="panel" style={{ marginTop: '1rem' }}>
      <h3 className="panel-title"><Icon name="speech" size={22} /> Un último susurro</h3>
      <p className="hint">Hay un Eco vivo en la aldea. Puedes dejarle un mensaje anónimo, sea verdad o mentira.</p>
      <textarea className="lb-textarea" maxLength={200} rows={3} value={textoEco} onChange={(ev) => setTextoEco(ev.target.value)} placeholder="Escribe tu mensaje (máx. 200 caracteres)" />
      <button type="button" className="big full" onClick={() => enviar({ tipo: 'eco', texto: textoEco })}><Icon name="check" size={20} strokeWidth={2.5} /> {textoEco.trim() ? 'Dejar el mensaje' : 'No dejar mensaje'}</button>
    </div>
  );

  // En el turno propio de noche, TurnoNoche ya pinta su cabecera con «Mi rol»: no duplicarla
  const turnoPropioNoche = v.fase === 'noche' && vivo && !v.listo;

  let cuerpo = null;
  switch (v.fase) {
    case 'reparto':
      cuerpo = (
        <>
          <TarjetaRol e={e} id={v.yo} />
          <div className="panel"><h3 className="panel-title"><Icon name="dice" size={20} /> Roles en esta partida</h3><ChipsRoles roles={v.roles || []} /></div>
          {v.listo
            ? <Espera texto="Esperando a que todos memoricen su rol…" faltan={v.faltan} v={v} offset={offset} />
            : <button className="big full" style={{ marginTop: '1rem' }} onClick={() => enviar({ tipo: 'listo' })}><Icon name="check" size={22} strokeWidth={2.5} /> He memorizado mi rol</button>}
          {v.esAdmin && <button className="secondary full" style={{ marginTop: '.7rem' }} onClick={() => enviar({ tipo: 'saltar' })}>Empezar la noche ya</button>}
        </>
      );
      break;

    case 'noche':
      if (!vivo) cuerpo = <Espera texto="Estás eliminado. Observas la noche en silencio…" faltan={v.faltan} v={v} offset={offset} />;
      else if (!v.listo) {
        cuerpo = (
          <TurnoNoche key={`${v.ronda}-n`} e={e} id={v.yo} remoto bloqueada={v.noche.turno.bloqueada}
            onTerminar={(acc) => enviar({ tipo: 'noche', acc })} />
        );
      } else {
        cuerpo = (
          <Espera texto="Has terminado tu turno. Esperando al resto de la aldea…" faltan={v.faltan} v={v} offset={offset}>
            <InfoNoche info={v.noche.info} />
          </Espera>
        );
      }
      if (v.esAdmin) cuerpo = <>{cuerpo}<button className="secondary full" style={{ marginTop: '.7rem' }} onClick={() => enviar({ tipo: 'saltar' })}>Forzar el amanecer</button></>;
      break;

    case 'anuncio': {
      const a = v.anuncio;
      const hayCazador = v.cazador;
      const candidatos = v.jugadores.filter((p) => p.vivo && p.id !== v.yo).map((p) => p.id);
      cuerpo = (
        <>
          <div className="end-card">
            <span className="end-icon"><Icon name={v.origen === 'noche' ? 'sun' : 'landmark'} size={44} /></span>
            <p className="categoria"><Icon name="flagFinish" size={16} />Ronda {v.ronda}</p>
            <h1 className="title">{v.origen === 'noche' ? 'Amanece en la aldea' : 'Veredicto del pueblo'}</h1>
            {a?.rebobinada && <p className="reveal">⏳ Ha ocurrido algo raro… el tiempo ha retrocedido. Nadie ha muerto esta noche.</p>}
            {a && a.muertes.length === 0 && !a.rebobinada && <p className="reveal">{v.origen === 'noche' ? 'Esta noche no ha muerto nadie.' : 'Nadie ha sido linchado.'}</p>}
            <div className="lb-muertes">
              {a?.muertes.map((mu) => (
                <div key={mu.id} className="lb-muerte" style={{ '--rol': BANDOS[ROLES[mu.rol].bando].color }}>
                  <span className="lb-explicado-icono"><Icon name={ROLES[mu.rol].icono} size={26} /></span>
                  <div><strong>{mu.nombre}</strong><p>Era <strong>{ROLES[mu.rol].nombre}</strong> ({BANDOS[ROLES[mu.rol].bando].nombre}) · {CAUSAS_PUBLICAS.includes(mu.causa) ? TEXTO_CAUSA[mu.causa] : 'ha muerto'}</p></div>
                </div>
              ))}
            </div>
            {a?.cartas?.length > 0 && (
              <div className="lb-cartas">
                <p className="lb-res-titulo">📜 Las cartas selladas del Notario se abren</p>
                {a.cartas.map((c, i) => <p key={i}>«{c.sobreNombre} {c.veredicto === 'pueblo' ? 'es del Pueblo' : 'NO es del Pueblo'}»</p>)}
                <p className="hint small">El Notario decidía qué escribir: puede ser verdad… o mentira.</p>
              </div>
            )}
            {a?.rumor && <p className="reveal">🗣 Rumor del pueblo: {a.rumor} <small>(puede ser cierto o falso)</small></p>}
            {a?.evento === 'eclipse' && <p className="reveal">🌑 Eclipse: hoy no hay debate, se vota directamente.</p>}
            {a?.muertes.some((mu) => mu.rol === 'martir' && mu.causa === 'linchamiento') && <p className="reveal">🔔 El sacrificio del Mártir protege a la aldea: esta noche los lobos no podrán atacar.</p>}
            {v.victoriasPersonales.map((vp) => <p key={vp.id} className="reveal">💀 {vp.texto}</p>)}
          </div>
          {hayCazador && hayCazador.id === v.yo && (
            <div className="panel" style={{ marginTop: '1rem' }}>
              <h3 className="panel-title"><Icon name="target" size={22} /> ¡Eres el Cazador: dispara!</h3>
              <p className="hint">Con tu último aliento, elige a quién te llevas por delante. <Cuenta finTs={v.finTs} offset={offset} /></p>
              {candidatos.length ? <ElegirUno e={e} opciones={candidatos} texto="Disparar" onConfirmar={(t) => enviar({ tipo: 'disparar', objetivo: t })} /> : <button className="big full" onClick={() => enviar({ tipo: 'disparar', objetivo: null })}>No queda nadie</button>}
            </div>
          )}
          {hayCazador && hayCazador.id !== v.yo && <Espera texto={`${hayCazador.nombre} era el Cazador y está eligiendo a quién disparar…`} />}
          {ecoForm}
          {!hayCazador && (
            <div className="panel center" style={{ marginTop: '1rem' }}>
              <p className="hint">La partida continúa sola en unos segundos. <Cuenta finTs={v.finTs} offset={offset} /></p>
              {v.esAdmin && <button className="big full" onClick={() => enviar({ tipo: 'continuar' })}><Icon name="forward" size={22} /> Continuar ya</button>}
            </div>
          )}
        </>
      );
      break;
    }

    case 'objeto': {
      const o = OBJETOS[v.objeto.tipo];
      cuerpo = (
        <div className="panel center">
          <span className="lb-luna"><Icon name={o.icono} size={64} strokeWidth={1.5} /></span>
          <p className="categoria"><Icon name="star" size={16} />Objeto misterioso</p>
          <h1 className="title">¡Ha aparecido: {o.nombre}!</h1>
          <p className="hint">{o.texto}</p>
          {v.objeto.dueno == null ? (
            v.puedoReclamar
              ? <button className="big full lb-reclamar" onClick={() => enviar({ tipo: 'reclamar' })}><Icon name="star" size={24} /> ¡Reclamar!</button>
              : <p className="hint">{vivo ? 'Ya tienes un objeto: no puedes reclamar otro.' : 'Observas desde el más allá…'}</p>
          ) : (
            <p className="reveal">🎒 {v.objeto.nombreDueno} ha sido el más rápido y se queda con el objeto. Lo verá en su ficha de rol.</p>
          )}
          {v.esAdmin && <button className="secondary full" style={{ marginTop: '.7rem' }} onClick={() => enviar({ tipo: 'saltar' })}>Continuar sin objeto</button>}
        </div>
      );
      break;
    }

    case 'debate': {
      const d = v.debate;
      cuerpo = (
        <>
          <div className="panel center">
            <h1 className="title">Debate en la plaza</h1>
            {v.modDia && <p className="lb-evento"><Icon name="landmark" size={18} /> <strong>{MODIFICADORES[v.modDia].nombre}.</strong> {MODIFICADORES[v.modDia].texto}</p>}
            {d.eclipse
              ? <p className="lb-evento grande"><Icon name="sun" size={20} /> <strong>Eclipse.</strong> {EVENTOS.eclipse.texto}</p>
              : <p className="hint">¿Quién es el lobo? Hablad entre vosotros (en persona o por llamada). {d.fin ? <Cuenta finTs={d.fin} offset={offset} /> : 'Sin límite de tiempo.'}</p>}
            <p className="hint small">Listos para votar: {d.listos}/{v.jugadores.filter((p) => p.vivo).length}</p>
            {vivo && (d.yoListo
              ? <p className="reveal">✔ Esperando a los demás…</p>
              : <button className="big full" onClick={() => enviar({ tipo: 'listoVotar' })}><Icon name="landmark" size={22} /> Estoy listo para votar</button>)}
            {v.esAdmin && <button className="secondary full" style={{ marginTop: '.7rem' }} onClick={() => enviar({ tipo: 'saltar' })}>Pasar a la votación ya</button>}
          </div>
          {ecoForm}
        </>
      );
      break;
    }

    case 'votacion':
      if (!vivo) cuerpo = <Espera texto="Estás eliminado: observas la votación." faltan={v.faltan} v={v} offset={offset} />;
      else if (v.listo) cuerpo = <Espera texto="Voto emitido. Esperando al resto…" faltan={v.faltan} v={v} offset={offset} />;
      else cuerpo = <VotoRemoto key={`${v.ronda}-${v.votacion.segunda}`} v={v} e={e} enviar={enviar} offset={offset} />;
      if (v.esAdmin) cuerpo = <>{cuerpo}<button className="secondary full" style={{ marginTop: '.7rem' }} onClick={() => enviar({ tipo: 'saltar' })}>Cerrar la votación ya</button></>;
      break;

    case 'resultado': {
      const r = v.resultado;
      const vivosRes = v.jugadores.filter((p) => p.vivo);
      cuerpo = (
        <>
          <div className="end-card">
            <span className="end-icon"><Icon name={r.victima == null ? 'hourglass' : 'landmark'} size={44} /></span>
            <p className="categoria"><Icon name="flagFinish" size={16} />Ronda {v.ronda}{r.repeticion ? ' · votación repetida' : ''}</p>
            <h1 className="title">Recuento de votos</h1>
            <p className="final-score">
              {r.fichaDe != null ? 'La ficha de favor ha anulado la sentencia'
                : r.anuladaAbstencion ? `Hay más abstenciones (${r.abstenciones}) que votos contra ${e.jugadores[r.empatados[0]]?.nombre ?? 'el más votado'} (${r.max}): no hay linchamiento`
                : r.victima == null ? (r.max === 0 ? 'Nadie ha recibido votos: no hay linchamiento' : `Empate entre ${r.empatados.map((i) => e.jugadores[i].nombre).join(' y ')}: no hay linchamiento`)
                : `El pueblo señala a ${e.jugadores[r.victima].nombre} (${r.max} ${r.max === 1 ? 'voto' : 'votos'})`}
            </p>
            {r.fichaDe != null && <p className="reveal">🪙 Una ficha de favor se ha gastado: {e.jugadores[r.fichaDe].nombre} se libra del linchamiento.</p>}
            {r.modif && <p className="hint small">Modificador de hoy: {MODIFICADORES[r.modif].nombre}.</p>}
            {r.identico && <p className="reveal">⚖ El resultado coincide con el primero: el Juez Corrupto paga con su vida.</p>}
            <div className="scoreboard">
              {[...vivosRes].sort((a, b) => r.conteo[b.id] - r.conteo[a.id]).map((p) => (
                <div key={p.id} className={`score-row ${p.id === r.victima ? 'first' : ''}`}>
                  <span className="score-name">{p.nombre}</span><span className="score-pts">{r.conteo[p.id]} {r.conteo[p.id] === 1 ? 'voto' : 'votos'}</span>
                </div>
              ))}
              {r.abstenciones > 0 && <div className="score-row"><span className="score-name">Abstenciones</span><span className="score-pts">{r.abstenciones}</span></div>}
            </div>
          </div>
          {r.votos && (
            <div className="panel reveal-panel">
              <h3 className="reveal-title"><Icon name="eye" size={20} /> Desglose de votos</h3>
              <div className="reveal-list">
                {vivosRes.map((p) => (
                  <div key={p.id} className="reveal-row"><span className="reveal-name">{p.nombre}</span><span className="reveal-card">{r.votos[p.id] != null ? `→ ${e.jugadores[r.votos[p.id]].nombre}` : 'se abstuvo'}</span></div>
                ))}
              </div>
              <p className="hint small center">Si tu voto no coincide con el que emitiste… alguien te lo ha robado.</p>
            </div>
          )}
          <div className="panel center" style={{ marginTop: '1rem' }}>
            <p className="hint">Se ejecuta la sentencia en unos segundos. <Cuenta finTs={v.finTs} offset={offset} /></p>
            {v.esAdmin && <button className="big full" onClick={() => enviar({ tipo: 'continuar' })}><Icon name="forward" size={22} /> {r.victima == null ? 'Continuar' : 'Ejecutar la sentencia'}</button>}
          </div>
        </>
      );
      break;
    }

    case 'fin': {
      const g = v.fin.ganador;
      const titulo = { lobos: 'Ganan los Lobos', pueblo: 'Gana el Pueblo', solitario: 'Gana el Solitario', amantes: 'Ganan los Enamorados', epidemia: 'Gana la Epidemia', nadie: 'Nadie gana' }[g.bando];
      const icono = { lobos: 'paw', pueblo: 'home', solitario: 'flame', amantes: 'heart', epidemia: 'flask', nadie: 'skull' }[g.bando];
      cuerpo = (
        <>
          <div className="end-card">
            <span className="end-icon"><Icon name={icono} size={44} /></span>
            <p className="categoria"><Icon name="flagFinish" size={16} />Fin de la partida · ronda {v.ronda}</p>
            <h1 className="title">{titulo}</h1>
            <p className="reveal">{g.texto}</p>
            {v.victoriasPersonales.map((vp) => <p key={vp.id} className="reveal">💀 {vp.texto}</p>)}
          </div>
          <div className="panel reveal-panel">
            <h3 className="reveal-title"><Icon name="eye" size={20} /> Todos los roles</h3>
            <div className="reveal-list">
              {v.fin.roles.map((p) => {
                const gano = v.fin.ids.includes(p.id) || v.victoriasPersonales.some((vp) => vp.id === p.id);
                return (
                  <div key={p.id} className="reveal-row lb-final-fila" style={{ '--rol': BANDOS[ROLES[p.rol].bando].color }}>
                    <span className="reveal-name">{gano ? '🏆 ' : ''}{p.nombre}{!p.vivo ? ' ✝' : ''}</span>
                    <span className="reveal-card">{p.rolInicial !== p.rol ? `${ROLES[p.rolInicial].nombre} → ${ROLES[p.rol].nombre}` : ROLES[p.rol].nombre}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="actions">
            {v.esAdmin
              ? <button className="big full" onClick={() => enviar({ tipo: 'reiniciar' })}><Icon name="refresh" size={22} /> Otra partida (volver a la sala)</button>
              : <p className="hint center">El anfitrión puede iniciar otra partida desde la sala.</p>}
            <button className="secondary danger full" onClick={onAbrirModalSalir}>Salir</button>
          </div>
        </>
      );
      break;
    }
    default: cuerpo = null;
  }

  return (
    <section className="game">
      {!turnoPropioNoche && cabecera}
      {cuerpo}
      {v.fase !== 'fin' && <ListaJugadores v={v} />}
      {v.fase !== 'fin' && <div className="actions"><button className="secondary danger full" onClick={onAbrirModalSalir}>Salir de la partida</button></div>}

      {verRol && (
        <div className="rg-modal-fondo" onClick={() => setVerRol(false)}>
          <div className="rg-modal lb-modal" onClick={(ev) => ev.stopPropagation()}>
            <TarjetaRol e={e} id={v.yo} completa={false} />
            <button type="button" className="big full" onClick={() => setVerRol(false)}><Icon name="check" size={20} strokeWidth={2.5} /> Cerrar</button>
          </div>
        </div>
      )}

      {mostrarAvisosModal && (
        <div className="rg-modal-fondo" onClick={handleCerrarAvisos}>
          <div className="rg-modal lb-modal" onClick={(ev) => ev.stopPropagation()}>
            <h3 className="panel-title"><Icon name="bell" size={22} /> Noticias para ti</h3>
            {m.avisos.map((a, i) => <p key={i} className="lb-aviso">{avisoTexto(a)}</p>)}
            <button type="button" className="big full" onClick={handleCerrarAvisos}>Entendido</button>
          </div>
        </div>
      )}
    </section>
  );
}

export default function LobosOnline({ onLocal }) {
  const [sesion, setSesion] = useState(() => leerSesion());
  const [mensaje, setMensaje] = useState('');
  const [modalSalir, setModalSalir] = useState(false);
  const [modalAyuda, setModalAyuda] = useState(false);

  const invalidar = useCallback((txt) => { guardarSesion(null); setSesion(null); setMensaje(txt || 'La partida ya no existe.'); }, []);
  const { vista, enviar, errorRed, aviso, offset } = useSala(sesion, invalidar);

  const entrar = (s) => { guardarSesion(s); setMensaje(''); setSesion(s); };
  const salir = async () => {
    if (sesion && vista && vista.fase === 'lobby' && !vista.esAdmin) await enviar({ tipo: 'abandonar' });
    guardarSesion(null); setSesion(null);
  };

  const mostrarAyuda = !sesion || vista?.fase === 'lobby';

  if (!sesion) {
    return (
      <div className="lb-contenedor">
        {mostrarAyuda && (
          <button
            type="button"
            className="btn-ayuda-flotante"
            onClick={() => setModalAyuda(true)}
            title="Reglas y funcionamiento"
          >
            <span className="btn-ayuda-flotante-signo">?</span>
          </button>
        )}

        {modalAyuda && (
          <div className="rg-modal-fondo" onClick={() => setModalAyuda(false)}>
            <div className="rg-modal modal-ayuda-juego" onClick={(ev) => ev.stopPropagation()}>
              <div className="modal-ayuda-header">
                <span className="modal-ayuda-signo-title">?</span>
                <h3>Cómo se juega a «Luna de Sangre»</h3>
              </div>
              <div className="modal-ayuda-cuerpo">
                <p><strong>1. Reparto:</strong></p>
                <ul>
                  <li>Cada jugador descubre su rol secreto en su propio móvil.</li>
                  <li>Hay tres bandos: <strong>Lobos</strong>, <strong>Pueblo</strong> y <strong>Solitarios</strong>.</li>
                </ul>
                <p><strong>2. Noche:</strong></p>
                <ul>
                  <li>Todos los jugadores vivos realizan su turno en secreto desde su dispositivo.</li>
                  <li>En tu turno verás <strong>qué debes hacer</strong> y puedes pulsar <em>Mi rol</em> para recordar tu ficha.</li>
                </ul>
                <p><strong>3. Día:</strong></p>
                <ul>
                  <li>Se anuncian las muertes. Debatís juntos y luego se vota en secreto a quién linchar.</li>
                  <li>Con empate en el primer puesto, nadie es linchado.</li>
                </ul>
                <p><strong>4. Victoria:</strong></p>
                <ul>
                  <li><strong>Pueblo:</strong> elimina a todos los lobos (y al Pirómano, si lo hay).</li>
                  <li><strong>Lobos:</strong> igualan en número al resto de vivos.</li>
                  <li>Los solitarios y los enamorados de bandos distintos tienen sus propias condiciones.</li>
                </ul>
              </div>
              <div className="rg-modal-acciones">
                <button className="big full" onClick={() => setModalAyuda(false)}>
                  Entendido
                </button>
              </div>
            </div>
          </div>
        )}

        {mensaje && <p className="error center">{mensaje}</p>}
        <Entrada onEntrar={entrar} onLocal={onLocal} />
      </div>
    );
  }
  if (!vista) return <div className="lb-contenedor"><section className="game center"><p className="hint">Conectando con la sala {sesion.code}…</p></section></div>;

  return (
    <div className="lb-contenedor">
      {/* ---------------- BOTÓN Y MODAL DE AYUDA ---------------- */}
      {mostrarAyuda && (
        <button
          type="button"
          className="btn-ayuda-flotante"
          onClick={() => setModalAyuda(true)}
          title="Reglas y funcionamiento"
        >
          <span className="btn-ayuda-flotante-signo">?</span>
        </button>
      )}

      {modalAyuda && (
        <div className="rg-modal-fondo" onClick={() => setModalAyuda(false)}>
          <div className="rg-modal modal-ayuda-juego" onClick={(ev) => ev.stopPropagation()}>
            <div className="modal-ayuda-header">
              <span className="modal-ayuda-signo-title">?</span>
              <h3>Cómo se juega a «Luna de Sangre»</h3>
            </div>
            <div className="modal-ayuda-cuerpo">
              <p><strong>1. Reparto:</strong></p>
              <ul>
                <li>Cada jugador descubre su rol secreto en su propio móvil.</li>
                <li>Hay tres bandos: <strong>Lobos</strong>, <strong>Pueblo</strong> y <strong>Solitarios</strong>.</li>
              </ul>
              <p><strong>2. Noche:</strong></p>
              <ul>
                <li>Todos los jugadores vivos realizan su turno en secreto desde su dispositivo.</li>
                <li>En tu turno verás <strong>qué debes hacer</strong> y puedes pulsar <em>Mi rol</em> para recordar tu ficha.</li>
              </ul>
              <p><strong>3. Día:</strong></p>
              <ul>
                <li>Se anuncian las muertes. Debatís juntos y luego se vota en secreto a quién linchar.</li>
                <li>Con empate en el primer puesto, nadie es linchado.</li>
              </ul>
              <p><strong>4. Victoria:</strong></p>
              <ul>
                <li><strong>Pueblo:</strong> elimina a todos los lobos (y al Pirómano, si lo hay).</li>
                <li><strong>Lobos:</strong> igualan en número al resto de vivos.</li>
                <li>Los solitarios y los enamorados de bandos distintos tienen sus propias condiciones.</li>
              </ul>
            </div>
            <div className="rg-modal-acciones">
              <button className="big full" onClick={() => setModalAyuda(false)}>
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ---------------- FIN AYUDA ---------------- */}

      {errorRed && <p className="lb-sinred">⚠ Sin conexión con el servidor. Reintentando…</p>}
      {aviso && <p className="lb-toast">{aviso}</p>}
      {vista.fase === 'lobby'
        ? <Lobby v={vista} enviar={enviar} onAbrirModalSalir={() => setModalSalir(true)} />
        : <VistaJuego v={vista} enviar={enviar} offset={offset} onAbrirModalSalir={() => setModalSalir(true)} />}

      {/* MODAL DE CONFIRMACIÓN PARA SALIR */}
      {modalSalir && (
        <div className="rg-modal-fondo" onClick={() => setModalSalir(false)}>
          <div 
            className="rg-modal" 
            onClick={(e) => e.stopPropagation()} 
            style={{ maxWidth: '420px', textAlign: 'center', padding: '1.8rem 1.4rem' }}
          >
            <div style={{ fontSize: '2.4rem', marginBottom: '0.4rem' }}>🚪</div>
            <h3 style={{ margin: '0 0 0.6rem', color: '#1e1b4b', fontSize: '1.3rem' }}>
              ¿Abandonar la partida?
            </h3>
            <p className="hint" style={{ fontSize: '0.95rem', marginBottom: '1.4rem', lineHeight: '1.4' }}>
              Si sales de la sala perderás tu progreso actual en la partida. ¿Estás seguro de que deseas salir?
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <button 
                type="button" 
                className="secondary full" 
                onClick={() => setModalSalir(false)}
              >
                No, quedarme
              </button>
              <button 
                type="button" 
                className="secondary danger full" 
                style={{ background: '#ef4444', color: '#ffffff', borderColor: '#dc2626' }}
                onClick={() => {
                  setModalSalir(false);
                  salir();
                }}
              >
                Sí, salir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}