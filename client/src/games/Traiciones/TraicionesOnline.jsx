// client/src/games/Traiciones/TraicionesOnline.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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

function BotonVolver({ onClick, texto = 'Volver' }) {
  return (
    <button type="button" className="qq-link-volver" onClick={onClick}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      <span>{texto}</span>
    </button>
  );
}

export default function TraicionesOnline({
  tituloJuego = 'Traiciones',
  descripcionJuego,
  onSalir,
  onAbrirAyuda
}) {
  const navigate = useNavigate();
  // 'menu' | 'crear' | 'unirse' | 'sala'
  const [vista, setVista] = useState('menu');
  const [nombre, setNombre] = useState('');
  const [codigoInput, setCodigoInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);
  const [modalSalirLobby, setModalSalirLobby] = useState(false);
  const [modalSalirPortada, setModalSalirPortada] = useState(false);
  const [codigoCopiado, setCodigoCopiado] = useState(false);

  const [sala, setSala] = useState(null);
  const [offset, setOffset] = useState(0);
  const fallos = useRef(0);

  const [sesion, setSesion] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem(CLAVE_SESION)); } catch { return null; }
  });

  const cerrarSesion = (mensaje) => {
    sessionStorage.removeItem(CLAVE_SESION);
    setSesion(null);
    setSala(null);
    setVista('menu');
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

  const redirigirAPortada = () => {
    if (typeof onSalir === 'function') {
      onSalir();
    } else {
      try {
        navigate('/');
      } catch {
        window.location.href = '/';
      }
    }
  };

  const handleCerrarSalaYSalirAPortada = () => {
    const sesionActual = sesion;
    sessionStorage.removeItem(CLAVE_SESION);
    setSesion(null);
    setSala(null);
    setModalSalirPortada(false);

    if (sesionActual?.code && sesionActual?.token) {
      fetch(`${API}/sala/${sesionActual.code}/salir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesionActual.token }),
        keepalive: true
      }).catch(() => {});
    }
    redirigirAPortada();
  };

  const handleVolverMenuOnline = () => {
    const sesionActual = sesion;
    sessionStorage.removeItem(CLAVE_SESION);
    setSesion(null);
    setSala(null);
    setModalSalirLobby(false);
    setVista('menu');

    if (sesionActual?.code && sesionActual?.token) {
      fetch(`${API}/sala/${sesionActual.code}/salir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesionActual.token }),
        keepalive: true
      }).catch(() => {});
    }
  };

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
  
  const enPartidaActiva = vista === 'sala' && sala && sala.estado !== 'lobby';

  return (
    <div className={`tr-contenedor ${enPartidaActiva ? 'qq-en-partida' : ''}`}>
      {errorMsg && vista !== 'crear' && vista !== 'unirse' && vista !== 'menu' && (
        <p className="error" style={{ textAlign: 'center', marginBottom: '1rem' }}>{errorMsg}</p>
      )}

      {/* ---------- 1. MENÚ PRINCIPAL (SÓLO ONLINE) ---------- */}
      {vista === 'menu' && (
        <section className="game">
          <div className="panel center qq-menu-panel">
            <div className="qq-card-top solo-derecha">
              <button
                type="button"
                className="qq-btn-ayuda"
                onClick={onAbrirAyuda}
                title="Cómo jugar"
                aria-label="Cómo jugar"
              >
                ?
              </button>
            </div>

            <div className="qq-hero-icono">
              <Icon name="dagger" size={44} strokeWidth={1.7} />
            </div>
            <h1 className="title qq-main-title">{tituloJuego}</h1>
            <p className="hint qq-main-desc">{descripcionJuego}</p>

            {errorMsg && <p className="error" style={{ margin: '0.8rem 0' }}>{errorMsg}</p>}

            <div className="qq-menu-opciones">
              <button
                type="button"
                className="qq-opcion-card principal"
                onClick={() => {
                  setVista('crear');
                  setErrorMsg('');
                }}
              >
                <span className="qq-opcion-icono">
                  <Icon name="crown" size={26} />
                </span>
                <div className="qq-opcion-textos">
                  <strong>Crear partida</strong>
                  <span>Sé el anfitrión, genera un código y administra el juego</span>
                </div>
              </button>

              <button
                type="button"
                className="qq-opcion-card secundaria"
                onClick={() => {
                  setVista('unirse');
                  setErrorMsg('');
                }}
              >
                <span className="qq-opcion-icono">
                  <Icon name="users" size={26} />
                </span>
                <div className="qq-opcion-textos">
                  <strong>Unirse con código</strong>
                  <span>Introduce el código de 4 letras de tu anfitrión</span>
                </div>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ---------- 2. CREAR SALA ---------- */}
      {vista === 'crear' && (
        <section className="game">
          <div className="panel center qq-menu-panel">
            <div className="qq-card-top">
              <BotonVolver
                onClick={() => {
                  setVista('menu');
                  setErrorMsg('');
                }}
              />
              <button
                type="button"
                className="qq-btn-ayuda"
                onClick={onAbrirAyuda}
                title="Cómo jugar"
                aria-label="Cómo jugar"
              >
                ?
              </button>
            </div>

            <div className="qq-hero-icono">
              <Icon name="crown" size={40} strokeWidth={1.6} />
            </div>
            <h2 className="title qq-main-title">Crear partida</h2>
            <p className="hint qq-main-desc">
              Introduce tu nombre para abrir la sala y ser el anfitrión (mínimo 4 jugadores).
            </p>

            <div className="lb-form qq-form-estilizado">
              <label className="field-label" htmlFor="tr-host-nombre">Tu nombre</label>
              <input
                id="tr-host-nombre"
                className="qq-input-moderno"
                type="text"
                placeholder="Ej. Alex"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                maxLength={20}
                autoFocus
              />
              {errorMsg && <p className="error">{errorMsg}</p>}

              <button
                type="button"
                className="big full qq-btn-principal"
                disabled={cargando || !nombre.trim()}
                onClick={() => entrar('crear', { nombre: nombre.trim() })}
              >
                <Icon name="check" size={22} strokeWidth={2.5} /> Crear sala
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ---------- 3. UNIRSE A SALA ---------- */}
      {vista === 'unirse' && (
        <section className="game">
          <div className="panel center qq-menu-panel">
            <div className="qq-card-top">
              <BotonVolver
                onClick={() => {
                  setVista('menu');
                  setErrorMsg('');
                }}
              />
              <button
                type="button"
                className="qq-btn-ayuda"
                onClick={onAbrirAyuda}
                title="Cómo jugar"
                aria-label="Cómo jugar"
              >
                ?
              </button>
            </div>

            <div className="qq-hero-icono">
              <Icon name="users" size={40} strokeWidth={1.6} />
            </div>
            <h2 className="title qq-main-title">Unirse a partida</h2>
            <p className="hint qq-main-desc">
              Introduce el código de 4 letras que te ha compartido el anfitrión.
            </p>

            <div className="lb-form qq-form-estilizado">
              <label className="field-label" htmlFor="tr-code-input">Código de la sala</label>
              <input
                id="tr-code-input"
                className="lb-input-codigo qq-input-moderno"
                type="text"
                placeholder="ABCD"
                value={codigoInput}
                onChange={(e) => setCodigoInput(e.target.value.toUpperCase())}
                maxLength={4}
                style={{ textTransform: 'uppercase', letterSpacing: '4px', textAlign: 'center', fontWeight: '800' }}
                autoFocus
              />

              <label className="field-label" htmlFor="tr-guest-nombre" style={{ marginTop: '1rem' }}>Tu nombre</label>
              <input
                id="tr-guest-nombre"
                className="qq-input-moderno"
                type="text"
                placeholder="Tu nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                maxLength={20}
              />
              {errorMsg && <p className="error">{errorMsg}</p>}

              <button
                type="button"
                className="big full qq-btn-principal"
                disabled={cargando || !nombre.trim() || codigoInput.trim().length < 4}
                onClick={() => entrar('unirse', { code: codigoInput.trim().toUpperCase(), nombre: nombre.trim() })}
              >
                <Icon name="check" size={22} strokeWidth={2.5} /> Entrar en la partida
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ---------- 4. SALA DE ESPERA (LOBBY) ---------- */}
      {vista === 'sala' && sala && sala.estado === 'lobby' && (
        <section className="game">
          <div className="panel center qq-menu-panel">
            <div className="qq-card-top">
              <BotonVolver onClick={() => setModalSalirLobby(true)} />
              <button
                type="button"
                className="qq-btn-ayuda"
                onClick={onAbrirAyuda}
                title="Cómo jugar"
                aria-label="Cómo jugar"
              >
                ?
              </button>
            </div>

            <span className="qq-badge-sala"><Icon name="lock" size={15} /> Sala de espera</span>

            <p className="hint">Código de la partida</p>
            <button
              type="button"
              className="qq-codigo-btn"
              onClick={copiarCodigo}
              title="Copiar código"
            >
              {sala.code}
            </button>
            <p className="hint small">
              {codigoCopiado ? '¡Copiado al portapapeles!' : 'Pulsa el código para copiarlo y compártelo con los demás.'}
            </p>
          </div>

          <div className="panel qq-menu-panel" style={{ marginTop: '1rem' }}>
            <h3 className="qq-sala-titulo"><Icon name="users" size={20} /> Jugadores ({jugadores.length}/12)</h3>
            <div className="lb-lista qq-sala-lista">
              {jugadores.map((j) => (
                <div key={j.id} className={`lb-jug ${j.id === sala.yoId ? 'yo' : ''}`}>
                  <span className="lb-jug-nombre">
                    <span className={`tr-punto ${j.conectado ? '' : 'off'}`} style={{ marginRight: '6px' }} />
                    {j.nombre}{j.id === sala.yoId ? ' (tú)' : ''}{j.id === 1 ? ' 👑' : ''}
                  </span>
                </div>
              ))}
            </div>
            {jugadores.length < MIN_JUGADORES && (
              <p className="hint" style={{ marginTop: '0.8rem' }}>
                Faltan {MIN_JUGADORES - jugadores.length} jugadores para poder empezar (mínimo {MIN_JUGADORES}).
              </p>
            )}
          </div>

          {esAdmin && (
            <div className="panel qq-menu-panel" style={{ marginTop: '1rem', padding: '1.2rem' }}>
              <h3 className="panel-title"><Icon name="settings" size={20} /> Ajustes</h3>
              
              <label className="lb-check" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <input type="checkbox" checked={sala.config.rolesEspeciales} style={{ width: 24, height: 24 }}
                  onChange={(e) => llamar('config', { rolesEspeciales: e.target.checked })} />
                <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>Roles especiales (Vigía, Protegido, Bufón)</span>
              </label>
              
              <div>
                <span style={{ fontWeight: 700, display: 'block', marginBottom: '0.4rem', color: '#475569' }}>Tiempo de debate diurno</span>
                <div className="tr-opciones" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {OPCIONES_DEBATE.map((s) => (
                    <button key={s} type="button" className={sala.config.segDebate === s ? 'qq-btn-principal' : 'secondary'} 
                      style={{ padding: '0.4rem 0.9rem', color: sala.config.segDebate === s ? 'white' : 'inherit' }}
                      onClick={() => llamar('config', { segDebate: s })}>
                      {s === 0 ? 'Sin límite' : `${s} s`}
                    </button>
                  ))}
                </div>
              </div>

              <button
                className="big full qq-btn-principal"
                style={{ marginTop: '1.5rem' }}
                disabled={jugadores.length < MIN_JUGADORES}
                onClick={() => llamar('iniciar')}
              >
                <Icon name="play" size={22} /> {jugadores.length < MIN_JUGADORES ? 'Esperando jugadores…' : '¡Repartir roles y empezar!'}
              </button>
            </div>
          )}

          {!esAdmin && (
            <div className="panel center" style={{ padding: '2rem 1.5rem', marginTop: '1rem' }}>
              <span className="lb-luna chica"><Icon name="hourglass" size={40} /></span>
              <h3 style={{ margin: '0.5rem 0' }}>Esperando al anfitrión...</h3>
              <p className="hint">
                Roles especiales: {sala.config.rolesEspeciales ? 'Sí' : 'No'} <br/>
                Debate: {sala.config.segDebate === 0 ? 'Sin límite' : `${sala.config.segDebate} s`}
              </p>
            </div>
          )}
        </section>
      )}

      {/* ---------- 5. PARTIDA EN CURSO ---------- */}
      {vista === 'sala' && sala && sala.estado === 'jugando' && sala.vista && (
        <>
          <div className="panel qq-menu-panel" style={{ padding: '0.8rem', marginBottom: '1rem' }}>
            <div className="qq-card-top" style={{ marginBottom: 0 }}>
              <BotonVolver texto="Volver a la portada" onClick={() => setModalSalirPortada(true)} />
            </div>
          </div>

          {sala.vista.fase !== 'fin' ? (
            <>
              <PantallaDeFase v={sala.vista} enviar={enviar} offset={offset} />
              
              <div className="panel" style={{ marginTop: '1rem', padding: '1rem' }}>
                <div className="actions" style={{ marginTop: 0 }}>
                  {esAdmin && ['asamblea', 'votacion', 'veredicto', 'roles'].includes(sala.vista.fase) && (
                    <button type="button" className="secondary full" onClick={() => llamar('forzar')}>
                      <Icon name="forward" size={18} /> Forzar avance (si alguien está ausente)
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <PantallaFin v={sala.vista} puntosTotales={puntosTotales}>
              <div className="actions" style={{ marginTop: '1.2rem' }}>
                {esAdmin ? (
                  <>
                    <button className="big full qq-btn-principal" disabled={jugadores.length < MIN_JUGADORES} onClick={() => llamar('siguiente-partida')}>
                      <Icon name="refresh" size={22} /> Otra partida (mismos jugadores)
                    </button>
                    <button className="secondary full" onClick={() => llamar('finalizar')}>
                      <Icon name="trophy" size={20} /> Finalizar y ver podio
                    </button>
                  </>
                ) : (
                  <p className="hint tr-center" style={{ width: '100%' }}>Esperando a que el anfitrión decida qué hacer…</p>
                )}
              </div>
            </PantallaFin>
          )}
        </>
      )}

      {/* ---------- 6. PODIO FINAL ---------- */}
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
              <button className="big full qq-btn-principal" onClick={() => llamar('reiniciar')}>
                <Icon name="refresh" size={22} /> Volver a la sala de espera
              </button>
            )}
            <button className="secondary danger full" onClick={() => setModalSalirPortada(true)}>
              <Icon name="door" size={20} /> Salir a la portada
            </button>
          </div>
        </section>
      )}

      {/* MODAL DE CONFIRMACIÓN PARA SALIR DEL LOBBY AL SUBMENÚ */}
      {modalSalirLobby && (
        <div className="rg-modal-fondo" onClick={() => setModalSalirLobby(false)}>
          <div 
            className="rg-modal" 
            onClick={(e) => e.stopPropagation()} 
            style={{ maxWidth: '420px', textAlign: 'center', padding: '1.8rem 1.4rem' }}
          >
            <div style={{ fontSize: '2.4rem', marginBottom: '0.4rem' }}>🚪</div>
            <h3 style={{ margin: '0 0 0.6rem', color: '#1e1b4b', fontSize: '1.3rem' }}>
              ¿Salir de la sala?
            </h3>
            <p className="hint" style={{ fontSize: '0.95rem', marginBottom: '1.4rem', lineHeight: '1.4' }}>
              Si sales ahora abandonarás la sala de espera y volverás al menú anterior. ¿Estás seguro?
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <button 
                type="button" 
                className="secondary full" 
                onClick={() => setModalSalirLobby(false)}
              >
                No, quedarme
              </button>
              <button 
                type="button" 
                className="secondary danger full" 
                style={{ background: '#ef4444', color: '#ffffff', borderColor: '#dc2626' }}
                onClick={handleVolverMenuOnline}
              >
                Sí, salir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CERRAR SALA Y SALIR A PORTADA */}
      {modalSalirPortada && (
        <div className="rg-modal-fondo" onClick={() => setModalSalirPortada(false)}>
          <div 
            className="rg-modal" 
            onClick={(e) => e.stopPropagation()} 
            style={{ maxWidth: '420px', textAlign: 'center', padding: '1.8rem 1.4rem' }}
          >
            <div style={{ fontSize: '2.4rem', marginBottom: '0.4rem' }}>🚪</div>
            <h3 style={{ margin: '0 0 0.6rem', color: '#1e1b4b', fontSize: '1.3rem' }}>
              ¿Salir a la portada?
            </h3>
            <p className="hint" style={{ fontSize: '0.95rem', marginBottom: '1.4rem', lineHeight: '1.4' }}>
              {esAdmin
                ? 'Se cerrará la sala y la partida para todos. ¿Estás seguro?'
                : 'Abandonarás la partida y saldrás hacia la portada principal. ¿Estás seguro?'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <button 
                type="button" 
                className="secondary full" 
                onClick={() => setModalSalirPortada(false)}
              >
                No, continuar
              </button>
              <button 
                type="button" 
                className="secondary danger full" 
                style={{ background: '#ef4444', color: '#ffffff', borderColor: '#dc2626' }}
                onClick={handleCerrarSalaYSalirAPortada}
              >
                Sí, salir a portada
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}