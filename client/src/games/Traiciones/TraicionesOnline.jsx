// client/src/games/Traiciones/TraicionesOnline.jsx
import React, { useState, useEffect, useRef } from 'react';
import Icon from './IconoT.jsx';
import { OPCIONES_DEBATE } from './engine.js';
import { PantallaDeFase, PantallaFin, Ayuda } from './Vistas.jsx';
import './Traiciones.css';

const CLAVE_SESION = 'traiciones_online_session';
const MIN_JUGADORES = 4;
const API = '/api/traiciones/online';

const post = async (url, body) => {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Algo ha fallado.');
  return data;
};

export default function TraicionesOnline() {
  const [vista, setVista] = useState('menu'); // 'menu' | 'crear' | 'unirse' | 'sala'
  const [nombre, setNombre] = useState('');
  const [codigoInput, setCodigoInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);
  const [modalSalir, setModalSalir] = useState(false);
  const [modalAyuda, setModalAyuda] = useState(false);
  const [codigoCopiado, setCodigoCopiado] = useState(false);
  const [sala, setSala] = useState(null);
  const [offset, setOffset] = useState(0);
  const fallos = useRef(0);

  const [sesion, setSesion] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem(CLAVE_SESION)); } catch { return null; }
  });

  const cerrarSesion = (mensaje) => {
    sessionStorage.removeItem(CLAVE_SESION);
    setSesion(null); setSala(null); setVista('menu');
    if (mensaje) setErrorMsg(mensaje);
  };

  const consultar = async (s = sesion) => {
    if (!s) return;
    try {
      const r = await fetch(`${API}/sala/${s.code}?token=${s.token}`);
      if (r.status === 403 || r.status === 404) { cerrarSesion('La sala se ha cerrado o ya no formas parte de ella.'); return; }
      if (!r.ok) throw new Error('error');
      const d = await r.json();
      fallos.current = 0;
      setOffset(d.ahora - Date.now());
      setSala(d);
      setVista('sala');
    } catch {
      fallos.current += 1;
      if (fallos.current >= 8) cerrarSesion('Se ha perdido la conexión con la sala.');
    }
  };

  useEffect(() => {
    if (!sesion) { setSala(null); return undefined; }
    consultar(sesion);
    const i = setInterval(() => consultar(sesion), 500);
    return () => clearInterval(i);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sesion]);

  const entrar = async (ruta, cuerpo) => {
    setErrorMsg(''); setCargando(true);
    try {
      const d = await post(`${API}/${ruta}`, cuerpo);
      const nueva = { code: d.code, token: d.token };
      sessionStorage.setItem(CLAVE_SESION, JSON.stringify(nueva));
      setSesion(nueva);
    } catch (e) { setErrorMsg(e.message); } finally { setCargando(false); }
  };

  const llamar = async (ruta, cuerpo = {}) => {
    if (!sesion) return;
    try {
      await post(`${API}/sala/${sesion.code}/${ruta}`, { token: sesion.token, ...cuerpo });
      setErrorMsg('');
      await consultar();
    } catch (e) { setErrorMsg(e.message); }
  };

  // Acciones de partida (las usan las pantallas compartidas)
  const enviar = (tipo, datos = {}) => llamar('accion', { tipo, ...datos });

  const salir = async () => {
    if (sesion) { try { await post(`${API}/sala/${sesion.code}/salir`, { token: sesion.token }); } catch { /* ignorar */ } }
    cerrarSesion();
  };

  const copiarCodigo = () => {
    if (!sala?.code) return;
    navigator.clipboard?.writeText(sala.code);
    setCodigoCopiado(true);
    setTimeout(() => setCodigoCopiado(false), 2000);
  };

  const esAdmin = Boolean(sala?.esAdmin);
  const jugadores = sala?.jugadores || [];
  const ranking = [...jugadores].sort((a, b) => b.puntos - a.puntos);
  const puntosTotales = Object.fromEntries(jugadores.map((j) => [j.id, j.puntos]));
  const mostrarAyuda = vista !== 'sala' || sala?.estado === 'lobby';

  const Marcador = () => (
    <div className="tr-card">
      <h3><Icon name="trophy" size={18} /> Marcador</h3>
      <div className="scoreboard">
        {ranking.map((j, i) => (
          <div key={j.id} className={`score-row${i === 0 && j.puntos > 0 ? ' first' : ''}`}>
            <span className="score-name">{i === 0 && j.puntos > 0 ? <Icon name="crown" size={22} /> : <span className="pos">{i + 1}</span>} {j.nombre}</span>
            <span className="score-pts">{j.puntos} pts</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="tr-wrap">
      {mostrarAyuda && (
        <button type="button" className="btn-ayuda-flotante" onClick={() => setModalAyuda(true)} title="Reglas de Traiciones">
          <span className="btn-ayuda-flotante-signo">?</span>
        </button>
      )}
      {modalAyuda && <Ayuda onCerrar={() => setModalAyuda(false)} />}

      {errorMsg && vista !== 'crear' && vista !== 'unirse' && <p className="error">{errorMsg}</p>}

      {/* ---------- Menú ---------- */}
      {vista === 'menu' && (
        <section className="game">
          <div className="panel tr-center">
            <span className="tr-logo"><Icon name="dagger" size={44} strokeWidth={1.7} /></span>
            <h1 className="title">Traiciones</h1>
            <p className="hint">Una caravana cruza el desierto rumbo al Oasis. Algunos de vosotros son traidores. Moveos por el campamento, haced tareas, fijaos en quién veis y dónde, y descubrid quién miente antes de que sea tarde. Partida en tiempo real, de 4 a 12 jugadores, cada uno con su móvil.</p>
            <div className="actions">
              <button className="big full" onClick={() => { setVista('crear'); setErrorMsg(''); }}><Icon name="crown" size={22} /> Crear partida</button>
              <button className="big full" onClick={() => { setVista('unirse'); setErrorMsg(''); }}><Icon name="users" size={22} /> Unirse a partida</button>
            </div>
          </div>
        </section>
      )}

      {/* ---------- Crear / unirse ---------- */}
      {(vista === 'crear' || vista === 'unirse') && (
        <section className="game">
          <div className="panel tr-center">
            <span className="tr-logo"><Icon name={vista === 'crear' ? 'crown' : 'users'} size={40} strokeWidth={1.7} /></span>
            <h2 className="title">{vista === 'crear' ? 'Crear partida' : 'Unirse a partida'}</h2>
            <p className="hint">{vista === 'crear' ? 'Pon tu nombre para crear la sala y ser el anfitrión.' : 'Introduce el código de 4 letras que te ha dado el anfitrión.'}</p>
            <div className="tr-form">
              {vista === 'unirse' && (
                <>
                  <label className="field-label" htmlFor="tr-code">Código de la sala</label>
                  <input id="tr-code" type="text" placeholder="ABCD" value={codigoInput} maxLength={4} autoFocus
                    onChange={(e) => setCodigoInput(e.target.value.toUpperCase())}
                    style={{ textTransform: 'uppercase', letterSpacing: '4px', textAlign: 'center', fontWeight: 800 }} />
                </>
              )}
              <label className="field-label" htmlFor="tr-nombre">Tu nombre</label>
              <input id="tr-nombre" type="text" placeholder="Tu nombre" value={nombre} maxLength={20} autoFocus={vista === 'crear'} onChange={(e) => setNombre(e.target.value)} />
              {errorMsg && <p className="error" style={{ marginTop: '.8rem' }}>{errorMsg}</p>}
              <button className="big full" style={{ marginTop: '1rem' }}
                disabled={cargando || !nombre.trim() || (vista === 'unirse' && codigoInput.trim().length < 4)}
                onClick={() => (vista === 'crear' ? entrar('crear', { nombre: nombre.trim() }) : entrar('unirse', { code: codigoInput.trim().toUpperCase(), nombre: nombre.trim() }))}>
                <Icon name="check" size={22} strokeWidth={2.5} /> {vista === 'crear' ? 'Crear sala' : 'Entrar en la partida'}
              </button>
              <button className="secondary full" style={{ marginTop: '.6rem' }} onClick={() => { setVista('menu'); setErrorMsg(''); }}>Volver</button>
            </div>
          </div>
        </section>
      )}

      {/* ---------- Lobby ---------- */}
      {vista === 'sala' && sala && sala.estado === 'lobby' && (
        <section className="game">
          <div className="panel tr-center">
            <p className="hint" style={{ marginBottom: '.2rem' }}>Código de la partida</p>
            <button type="button" className="tr-codigo" onClick={copiarCodigo} title="Copiar código">{sala.code}</button>
            <p className="hint small">{codigoCopiado ? '¡Copiado al portapapeles!' : 'Pulsa el código para copiarlo y compártelo con los demás.'}</p>
          </div>

          <div className="panel" style={{ marginTop: '1rem' }}>
            <h3 className="panel-title"><Icon name="users" size={20} /> Jugadores ({jugadores.length}/12)</h3>
            <div className="tr-lista">
              {jugadores.map((j) => (
                <div key={j.id} className={`tr-jug ${j.id === sala.yoId ? 'yo' : ''}`}>
                  <span><span className={`tr-punto ${j.conectado ? '' : 'off'}`} />{j.nombre}{j.id === sala.yoId ? ' (tú)' : ''}{j.id === 1 ? ' 👑' : ''}</span>
                </div>
              ))}
            </div>
            {jugadores.length < MIN_JUGADORES && <p className="hint" style={{ marginTop: '.8rem' }}>Faltan {MIN_JUGADORES - jugadores.length} jugadores para empezar (mínimo {MIN_JUGADORES}).</p>}
          </div>

          {esAdmin && (
            <div className="panel tr-config" style={{ marginTop: '1rem' }}>
              <h3 className="panel-title"><Icon name="settings" size={20} /> Ajustes</h3>
              <label className="fila">
                <span>Roles especiales (Vigía, Protegido, Bufón)</span>
                <input type="checkbox" checked={sala.config.rolesEspeciales} style={{ width: 24, height: 24 }}
                  onChange={(e) => llamar('config', { rolesEspeciales: e.target.checked })} />
              </label>
              <div>
                <span style={{ fontWeight: 700 }}>Tiempo de debate</span>
                <div className="tr-opciones" style={{ marginTop: '.4rem' }}>
                  {OPCIONES_DEBATE.map((s) => (
                    <button key={s} type="button" className={sala.config.segDebate === s ? 'on' : ''} onClick={() => llamar('config', { segDebate: s })}>
                      {s === 0 ? 'Sin límite' : `${s} s`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {!esAdmin && (
            <div className="panel tr-center" style={{ marginTop: '1rem' }}>
              <h3>Esperando al anfitrión…</h3>
              <p className="hint">Roles especiales: {sala.config.rolesEspeciales ? 'sí' : 'no'} · Debate: {sala.config.segDebate === 0 ? 'sin límite' : `${sala.config.segDebate} s`}</p>
            </div>
          )}

          <div className="actions" style={{ marginTop: '1rem' }}>
            {esAdmin && (
              <button className="big full" disabled={jugadores.length < MIN_JUGADORES} onClick={() => llamar('iniciar')}>
                <Icon name="play" size={22} /> {jugadores.length < MIN_JUGADORES ? 'Esperando jugadores…' : '¡Repartir roles y empezar!'}
              </button>
            )}
            <button className="secondary danger full" onClick={() => setModalSalir(true)}><Icon name="door" size={20} /> Salir de la sala</button>
          </div>
        </section>
      )}

      {/* ---------- Partida ---------- */}
      {vista === 'sala' && sala && sala.estado === 'jugando' && sala.vista && (
        <>
          {sala.vista.fase !== 'fin' ? (
            <>
              <PantallaDeFase v={sala.vista} enviar={enviar} offset={offset} />
              <div className="actions" style={{ marginTop: '.4rem' }}>
                {esAdmin && ['asamblea', 'votacion', 'veredicto', 'roles'].includes(sala.vista.fase) && <button type="button" className="secondary full" onClick={() => llamar('forzar')}><Icon name="forward" size={18} /> Forzar avance (si alguien está ausente)</button>}
                <button type="button" className="secondary danger full" onClick={() => setModalSalir(true)}><Icon name="door" size={20} /> Abandonar partida</button>
              </div>
            </>
          ) : (
            <PantallaFin v={sala.vista} puntosTotales={puntosTotales}>
              <Marcador />
              <div className="actions">
                {esAdmin ? (
                  <>
                    <button className="big full" disabled={jugadores.length < MIN_JUGADORES} onClick={() => llamar('siguiente-partida')}><Icon name="refresh" size={22} /> Otra partida (mismos jugadores)</button>
                    <button className="secondary danger full" onClick={() => llamar('finalizar')}><Icon name="trophy" size={20} /> Finalizar y ver podio</button>
                  </>
                ) : <p className="hint tr-center">Esperando a que el anfitrión decida qué hacer…</p>}
                <button className="secondary danger full" onClick={() => setModalSalir(true)}><Icon name="door" size={20} /> Salir de la sala</button>
              </div>
            </PantallaFin>
          )}
        </>
      )}

      {/* ---------- Podio final ---------- */}
      {vista === 'sala' && sala && sala.estado === 'final' && (
        <section className="game">
          <div className="end-card">
            <span className="end-icon"><Icon name="crown" size={44} /></span>
            <h1 className="title">Puntuaciones finales</h1>
            <p className="final-score">{ranking[0]?.puntos > 0 ? `Ganador: ${ranking.filter((j) => j.puntos === ranking[0].puntos).map((j) => j.nombre).join(' y ')}` : 'Sin ganador'}</p>
            <div className="scoreboard">
              {ranking.map((j, i) => (
                <div key={j.id} className={`score-row${i === 0 && j.puntos > 0 ? ' first' : ''}`}>
                  <span className="score-name">{i === 0 && j.puntos > 0 ? <Icon name="crown" size={22} /> : <span className="pos">{i + 1}</span>} {j.nombre}</span>
                  <span className="score-pts">{j.puntos} pts</span>
                </div>
              ))}
            </div>
          </div>
          <div className="actions" style={{ marginTop: '1.2rem' }}>
            {esAdmin && <button className="big full" onClick={() => llamar('reiniciar')}><Icon name="refresh" size={22} /> Volver a la sala de espera</button>}
            <button className="secondary danger full" onClick={() => setModalSalir(true)}><Icon name="door" size={20} /> Salir de la sala</button>
          </div>
        </section>
      )}

      {modalSalir && (
        <div className="tr-modal-fondo" onClick={() => setModalSalir(false)}>
          <div className="tr-modal" onClick={(e) => e.stopPropagation()}>
            <h3>¿Salir de la sala?</h3>
            <p>{sala?.estado === 'jugando' ? 'Si abandonas, tu personaje se perderá en el desierto y la partida continuará sin ti.' : 'Abandonarás la sala de espera.'}</p>
            <div className="tr-modal-acciones">
              <button type="button" className="secondary full" onClick={() => setModalSalir(false)}>No, quedarme</button>
              <button type="button" className="secondary danger full" onClick={() => { setModalSalir(false); salir(); }}>Sí, salir</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
