// client/src/games/Traiciones/TraicionesOnline.jsx
import React, { useState, useEffect, useRef } from 'react';
import Icon from './IconoT.jsx';
import { OPCIONES_DEBATE } from './engine.js';
import { PantallaDeFase, PantallaFin } from './Vistas.jsx';
import './Traiciones.css';
import '../Adivina/Adivina.css';

const CLAVE_SESION = 'traiciones_online_session';
const MIN_JUGADORES = 4;
const API = '/api/traiciones/online';

const post = async (url, body) => {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Algo ha fallado.');
  return data;
};

function ModalAyudaTraiciones({ onCerrar }) {
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
          <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#1e1b4b' }}>¿Cómo se juega a Traiciones?</h3>
        </div>

        <div className="aprox-modal-cuerpo" style={{ fontSize: '0.92rem', lineHeight: '1.5', color: '#334155' }}>
          <div style={{ marginBottom: '1.1rem' }}>
            <h4 style={{ color: '#0f172a', margin: '0 0 0.3rem', fontSize: '1rem' }}>🎯 Objetivo</h4>
            <p style={{ margin: 0 }}>
              Una caravana viaja por el desierto rumbo al Oasis. La mayoría sois <strong>Leales</strong>, pero entre vosotros se ocultan <strong>Traidores</strong> que buscan sabotear y eliminar a la caravana sin ser descubiertos.
            </p>
          </div>

          <div style={{ marginBottom: '1.1rem' }}>
            <h4 style={{ color: '#0f172a', margin: '0 0 0.3rem', fontSize: '1rem' }}>👥 Bandos y Roles</h4>
            <ul style={{ paddingLeft: '1.2rem', margin: '0.3rem 0' }}>
              <li style={{ marginBottom: '0.35rem' }}>
                <strong>Leal:</strong> Muévete por las salas del campamento completando tareas para llenar la barra común y desenmascara a los traidores.
              </li>
              <li style={{ marginBottom: '0.35rem' }}>
                <strong>Traidor:</strong> Sabotea tareas, finge coartadas y elimina sigilosamente a quien se quede a solas contigo.
              </li>
              <li style={{ marginBottom: '0.35rem' }}>
                <strong>Roles especiales:</strong> Vigía (ojea salas a distancia), Protegido (resiste un ataque) y Bufón (gana solo si lo expulsan).
              </li>
            </ul>
          </div>

          <div style={{ marginBottom: '1.1rem' }}>
            <h4 style={{ color: '#0f172a', margin: '0 0 0.3rem', fontSize: '1rem' }}>⏳ Fases en tiempo real</h4>
            <ol style={{ paddingLeft: '1.2rem', margin: '0.3rem 0' }}>
              <li style={{ marginBottom: '0.35rem' }}>
                <strong>Campamento en directo:</strong> Desplázate de sala en sala. Solo ves a quienes están contigo.
              </li>
              <li style={{ marginBottom: '0.35rem' }}>
                <strong>Asamblea y Debate:</strong> Si alguien toca la campana o reporta un cuerpo, todos se reúnen en la hoguera.
              </li>
              <li style={{ marginBottom: '0.35rem' }}>
                <strong>Votación y Veredicto:</strong> Se expulsa al más votado y se revela su rol.
              </li>
            </ol>
          </div>

          <div>
            <h4 style={{ color: '#0f172a', margin: '0 0 0.3rem', fontSize: '1rem' }}>🏆 Condiciones de victoria</h4>
            <ul style={{ paddingLeft: '1.2rem', margin: '0.3rem 0' }}>
              <li><strong>Leales:</strong> Completando todas las tareas o expulsando a todos los traidores.</li>
              <li><strong>Traidores:</strong> Igualando en número a los leales vivos o si el campamento arde.</li>
              <li><strong>Bufón:</strong> Consiguiendo que la caravana lo expulse en votación.</li>
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

export default function TraicionesOnline() {
  const [vista, setVista] = useState('menu');
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
  }, [sesion]);

  useEffect(() => {
    if (sala && sala.estado !== 'lobby') {
      setModalAyuda(false);
    }
  }, [sala?.estado]);

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

  // Botón circular blanco puro idéntico al de la portada
  const BotonAyudaPanel = () => (
    <button
      type="button"
      onClick={() => setModalAyuda(true)}
      title="Reglas del juego"
      style={{
        position: 'absolute',
        top: '1.1rem',
        right: '1.1rem',
        width: '38px',
        height: '38px',
        borderRadius: '50%',
        border: '1.5px solid #c7d2fe',
        background: '#ffffff',
        backgroundImage: 'none',
        color: '#4338ca',
        fontSize: '1.2rem',
        fontWeight: '700',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(99, 102, 241, 0.15)',
        padding: 0,
        zIndex: 5
      }}
    >
      ?
    </button>
  );

  return (
    <div className="tr-wrap">
      {modalAyuda && <ModalAyudaTraiciones onCerrar={() => setModalAyuda(false)} />}
      {errorMsg && vista !== 'crear' && vista !== 'unirse' && <p className="error">{errorMsg}</p>}

      {/* ---------- 1. MENÚ PRINCIPAL (ESTILO ADAPTADO) ---------- */}
      {vista === 'menu' && (
        <section className="game">
          <div className="panel tr-center" style={{ position: 'relative', padding: '2.4rem 1.6rem 2rem' }}>
            <BotonAyudaPanel />

            {/* Círculo suave con icono temático */}
            <div
              style={{
                width: '76px',
                height: '76px',
                borderRadius: '50%',
                backgroundColor: '#fff7ed',
                color: 'var(--g1, #d97706)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.1rem auto',
                boxShadow: '0 4px 14px rgba(217, 119, 6, 0.12)'
              }}
            >
              <Icon name="dagger" size={38} strokeWidth={2} />
            </div>

            <h1 className="title" style={{ margin: '0 0 0.6rem 0' }}>Traiciones</h1>
            <p className="hint" style={{ maxWidth: '540px', margin: '0 auto 1.6rem auto', lineHeight: '1.45' }}>
              Una caravana cruza el desierto rumbo al Oasis. Algunos sois traidores. Moveos por el campamento, haced tareas y descubrid quién miente.
            </p>

            {/* Botones en columna vertical de ancho completo */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', width: '100%', maxWidth: '480px', margin: '0 auto' }}>
              <button className="big full" onClick={() => { setVista('crear'); setErrorMsg(''); }}>
                <Icon name="crown" size={20} /> Crear partida
              </button>
              <button className="big full" onClick={() => { setVista('unirse'); setErrorMsg(''); }}>
                <Icon name="users" size={20} /> Unirse a partida
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ---------- 2. CREAR / UNIRSE ---------- */}
      {(vista === 'crear' || vista === 'unirse') && (
        <section className="game">
          <div className="panel tr-center" style={{ position: 'relative' }}>
            <BotonAyudaPanel />
            <div
              style={{
                width: '74px',
                height: '74px',
                borderRadius: '50%',
                backgroundColor: '#fff7ed',
                color: 'var(--g1, #d97706)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto'
              }}
            >
              <Icon name={vista === 'crear' ? 'crown' : 'users'} size={36} strokeWidth={2} />
            </div>
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

      {/* ---------- 3. SALA DE ESPERA (LOBBY) ---------- */}
      {vista === 'sala' && sala && sala.estado === 'lobby' && (
        <section className="game">
          <div className="panel tr-center" style={{ position: 'relative' }}>
            <BotonAyudaPanel />

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

            <p className="hint" style={{ marginBottom: '.2rem' }}>Código de la partida</p>
            <button type="button" className="tr-codigo" onClick={copiarCodigo} title="Copiar código">
              {sala.code}
            </button>
            <p className="hint small">
              {codigoCopiado ? '¡Copiado al portapapeles!' : 'Pulsa el código para copiarlo y compártelo con los demás.'}
            </p>
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
            {jugadores.length < MIN_JUGADORES && (
              <p className="hint" style={{ marginTop: '.8rem' }}>
                Faltan {MIN_JUGADORES - jugadores.length} jugadores para empezar (mínimo {MIN_JUGADORES}).
              </p>
            )}
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
            <button className="secondary danger full" onClick={() => setModalSalir(true)}>
              <Icon name="door" size={20} /> Salir de la sala
            </button>
          </div>
        </section>
      )}

      {/* ---------- 4. PARTIDA EN CURSO ---------- */}
      {vista === 'sala' && sala && sala.estado === 'jugando' && sala.vista && (
        <>
          {sala.vista.fase !== 'fin' ? (
            <>
              <PantallaDeFase v={sala.vista} enviar={enviar} offset={offset} />
              <div className="actions" style={{ marginTop: '.4rem' }}>
                {esAdmin && ['asamblea', 'votacion', 'veredicto', 'roles'].includes(sala.vista.fase) && (
                  <button type="button" className="secondary full" onClick={() => llamar('forzar')}>
                    <Icon name="forward" size={18} /> Forzar avance (si alguien está ausente)
                  </button>
                )}
                <button type="button" className="secondary danger full" onClick={() => setModalSalir(true)}>
                  <Icon name="door" size={20} /> Abandonar partida
                </button>
              </div>
            </>
          ) : (
            <PantallaFin v={sala.vista} puntosTotales={puntosTotales}>
              <div className="actions">
                {esAdmin ? (
                  <>
                    <button className="big full" disabled={jugadores.length < MIN_JUGADORES} onClick={() => llamar('siguiente-partida')}>
                      <Icon name="refresh" size={22} /> Otra partida (mismos jugadores)
                    </button>
                    <button className="secondary danger full" onClick={() => llamar('finalizar')}>
                      <Icon name="trophy" size={20} /> Finalizar y ver podio
                    </button>
                  </>
                ) : (
                  <p className="hint tr-center">Esperando a que el anfitrión decida qué hacer…</p>
                )}
                <button className="secondary danger full" onClick={() => setModalSalir(true)}>
                  <Icon name="door" size={20} /> Salir de la sala
                </button>
              </div>
            </PantallaFin>
          )}
        </>
      )}

      {/* ---------- 5. PODIO FINAL ---------- */}
      {vista === 'sala' && sala && sala.estado === 'final' && (
        <section className="game">
          <div className="end-card">
            <span className="end-icon"><Icon name="crown" size={44} /></span>
            <h1 className="title">Puntuaciones finales</h1>
            <p className="final-score">
              {ranking[0]?.puntos > 0 ? `Ganador: ${ranking.filter((j) => j.puntos === ranking[0].puntos).map((j) => j.nombre).join(' y ')}` : 'Sin ganador'}
            </p>
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
            {esAdmin && (
              <button className="big full" onClick={() => llamar('reiniciar')}>
                <Icon name="refresh" size={22} /> Volver a la sala de espera
              </button>
            )}
            <button className="secondary danger full" onClick={() => setModalSalir(true)}>
              <Icon name="door" size={20} /> Salir de la sala
            </button>
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