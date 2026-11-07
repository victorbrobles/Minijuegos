// client/src/games/Furbo/FurboOnline.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import FurboPartida from './FurboPartida.jsx';
import { ConfigPartida } from './FurboComun.jsx';
import './Furbo.css';
import '../Adivina/Adivina.css';

const CLAVE_SESION_FURBO = 'furbo_online_session';
const MAX_JUGADORES = 20;
const API = '/api/furbo/online';

const postJSON = (url, body) =>
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

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

export default function FurboOnline({
  tituloJuego = 'Furbo!',
  descripcionJuego,
  onLocal,
  onSalir,
  onAbrirAyuda
}) {
  const navigate = useNavigate();
  const [vista, setVista] = useState('menu'); // 'menu' | 'online_menu' | 'crear' | 'unirse' | 'sala'
  const [nombre, setNombre] = useState('');
  const [codigoInput, setCodigoInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);
  
  const [modalSalirLobby, setModalSalirLobby] = useState(false);
  const [modalSalirPortada, setModalSalirPortada] = useState(false);
  const [codigoCopiado, setCodigoCopiado] = useState(false);

  const [sesion, setSesion] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(CLAVE_SESION_FURBO));
    } catch {
      return null;
    }
  });
  const [sala, setSala] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!sesion) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setSala(null);
      return undefined;
    }

    const consultarEstado = () => {
      fetch(`${API}/sala/${sesion.code}?token=${sesion.token}`)
        .then((r) => {
          if (!r.ok) throw new Error('Sala no disponible');
          return r.json();
        })
        .then((d) => {
          if (d.success) {
            setSala(d);
            setVista('sala');
          }
        })
        .catch(() => {
          sessionStorage.removeItem(CLAVE_SESION_FURBO);
          setSesion(null);
          setSala(null);
          setVista('online_menu');
          setErrorMsg('La sala se ha cerrado.');
        });
    };

    consultarEstado();
    intervalRef.current = setInterval(consultarEstado, 500);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sesion]);

  const guardarSesion = (data) => {
    const nueva = { code: data.code, token: data.token };
    sessionStorage.setItem(CLAVE_SESION_FURBO, JSON.stringify(nueva));
    setSesion(nueva);
  };

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
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const sesionActual = sesion;
    sessionStorage.removeItem(CLAVE_SESION_FURBO);
    setSesion(null);
    setSala(null);
    setModalSalirPortada(false);

    if (sesionActual?.code && sesionActual?.token) {
      postJSON(`${API}/sala/${sesionActual.code}/salir`, { token: sesionActual.token }).catch(() => {});
    }

    redirigirAPortada();
  };

  const handleVolverMenuOnline = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const sesionActual = sesion;
    sessionStorage.removeItem(CLAVE_SESION_FURBO);
    setSesion(null);
    setSala(null);
    setModalSalirLobby(false);
    setVista('online_menu');

    if (sesionActual?.code && sesionActual?.token) {
      postJSON(`${API}/sala/${sesionActual.code}/salir`, { token: sesionActual.token }).catch(() => {});
    }
  };

  const handleCrear = async () => {
    if (!nombre.trim()) return;
    setCargando(true);
    setErrorMsg('');
    try {
      const res = await postJSON(`${API}/crear`, { nombre: nombre.trim() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      guardarSesion(data);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleUnirse = async () => {
    if (!nombre.trim() || !codigoInput.trim()) return;
    setCargando(true);
    setErrorMsg('');
    try {
      const res = await postJSON(`${API}/unirse`, { code: codigoInput.trim().toUpperCase(), nombre: nombre.trim() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      guardarSesion(data);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleConfig = async (config) => {
    setSala((s) => (s ? { ...s, config } : s));
    try {
      await postJSON(`${API}/sala/${sesion.code}/config`, { token: sesion.token, config });
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleIniciar = async () => {
    try {
      const res = await postJSON(`${API}/sala/${sesion.code}/iniciar`, { token: sesion.token });
      if (!res.ok) {
        const data = await res.json();
        setErrorMsg(data.error);
      }
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const enviarAccion = useCallback(async (accion) => {
    if (!sesion) return;
    try {
      await postJSON(`${API}/sala/${sesion.code}/accion`, { token: sesion.token, accion });
    } catch (err) {
      console.error(err);
    }
  }, [sesion]);

  const handleReiniciar = async () => {
    try {
      await postJSON(`${API}/sala/${sesion.code}/reiniciar`, { token: sesion.token });
    } catch (err) {
      console.error(err);
    }
  };

  const copiarCodigo = () => {
    if (!sala?.code) return;
    navigator.clipboard?.writeText(sala.code);
    setCodigoCopiado(true);
    setTimeout(() => setCodigoCopiado(false), 2000);
  };

  const esAdmin = sala?.esAdmin;
  const yoId = sala?.yoId;
  const enPartidaActiva = vista === 'sala' && sala && sala.estado !== 'lobby';

  return (
    <div className={`furbo-contenedor ${enPartidaActiva ? 'qq-en-partida' : ''}`}>
      {/* 1. MENÚ PRINCIPAL */}
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
              <span style={{ fontSize: '2.5rem', lineHeight: 1 }}>⚽</span>
            </div>
            <h1 className="title qq-main-title">{tituloJuego}</h1>
            <p className="hint qq-main-desc">{descripcionJuego}</p>

            {errorMsg && <p className="error" style={{ margin: '0.8rem 0' }}>{errorMsg}</p>}

            <div className="qq-menu-opciones">
              <button
                type="button"
                className="qq-opcion-card principal"
                onClick={() => {
                  setVista('online_menu');
                  setErrorMsg('');
                }}
              >
                <span className="qq-opcion-icono">
                  <Icon name="globe" size={26} />
                </span>
                <div className="qq-opcion-textos">
                  <strong>Jugar online</strong>
                  <span>Cada jugador desde su propio móvil con código de sala</span>
                </div>
              </button>

              <button
                type="button"
                className="qq-opcion-card secundaria"
                onClick={onLocal}
              >
                <span className="qq-opcion-icono">
                  <Icon name="users" size={26} />
                </span>
                <div className="qq-opcion-textos">
                  <strong>Jugar en un único dispositivo</strong>
                  <span>Pasando el móvil por turnos entre los jugadores</span>
                </div>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 1B. SUBMENÚ ONLINE */}
      {vista === 'online_menu' && (
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
              <Icon name="globe" size={40} strokeWidth={1.7} />
            </div>
            <h2 className="title qq-main-title">Modo Online</h2>
            <p className="hint qq-main-desc">
              Crea una sala nueva para compartir el código con tus amigos o únete a una ya creada.
            </p>

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
                  <span>Sé el anfitrión, genera un código y administra el partido</span>
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

      {/* 2. CREAR SALA */}
      {vista === 'crear' && (
        <section className="game">
          <div className="panel center qq-menu-panel">
            <div className="qq-card-top">
              <BotonVolver
                onClick={() => {
                  setVista('online_menu');
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
              Introduce tu nombre para abrir la sala y ser el anfitrión (hasta {MAX_JUGADORES} jugadores).
            </p>

            <div className="lb-form qq-form-estilizado">
              <label className="field-label" htmlFor="furbo-host-nombre">Tu nombre</label>
              <input
                id="furbo-host-nombre"
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
                onClick={handleCrear}
              >
                <Icon name="check" size={22} strokeWidth={2.5} /> Crear sala
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 3. UNIRSE A SALA */}
      {vista === 'unirse' && (
        <section className="game">
          <div className="panel center qq-menu-panel">
            <div className="qq-card-top">
              <BotonVolver
                onClick={() => {
                  setVista('online_menu');
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
              <label className="field-label" htmlFor="furbo-code-input">Código de la sala</label>
              <input
                id="furbo-code-input"
                className="lb-input-codigo qq-input-moderno"
                type="text"
                placeholder="ABCD"
                value={codigoInput}
                onChange={(e) => setCodigoInput(e.target.value.toUpperCase())}
                maxLength={4}
                style={{ textTransform: 'uppercase', letterSpacing: '4px', textAlign: 'center', fontWeight: '800' }}
                autoFocus
              />

              <label className="field-label" htmlFor="furbo-guest-nombre" style={{ marginTop: '1rem' }}>Tu nombre</label>
              <input
                id="furbo-guest-nombre"
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
                onClick={handleUnirse}
              >
                <Icon name="check" size={22} strokeWidth={2.5} /> Entrar en la partida
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 4. SALA: LOBBY */}
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

            <p className="categoria"><Icon name="lock" size={16} /> Sala de espera</p>
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
              {codigoCopiado ? '¡Copiado al portapapeles!' : `Comparte este código para que se unan (2 a ${MAX_JUGADORES} jugadores).`}
            </p>
          </div>

          <div className="panel" style={{ marginTop: '1rem' }}>
            <h3 className="panel-title"><Icon name="users" size={20} /> Jugadores ({sala.jugadores.length}/{MAX_JUGADORES})</h3>
            <div className="lb-lista">
              {sala.jugadores.map((j, i) => (
                <div key={j.id} className={`lb-jug ${j.id === yoId ? 'yo' : ''}`}>
                  <span className="lb-jug-nombre">
                    {j.nombre}{j.id === yoId ? ' (tú)' : ''}{i === 0 ? ' 👑' : ''}
                  </span>
                </div>
              ))}
            </div>
            {sala.jugadores.length < 2 && (
              <p className="hint" style={{ marginTop: '0.8rem' }}>
                Falta al menos 1 jugador más para poder empezar.
              </p>
            )}
          </div>

          <div className="panel" style={{ marginTop: '1rem' }}>
            <h3 className="panel-title">⚽ El partido</h3>
            {!esAdmin && <p className="hint small" style={{ marginBottom: '0.6rem' }}>Lo configura el anfitrión.</p>}
            <ConfigPartida config={sala.config} onChange={esAdmin ? handleConfig : null} />
          </div>

          {errorMsg && <p className="error" style={{ margin: '0.8rem 0' }}>{errorMsg}</p>}

          {esAdmin ? (
            <button
              type="button"
              className="big full qq-btn-principal"
              style={{ marginTop: '1.2rem' }}
              disabled={sala.jugadores.length < 2}
              onClick={handleIniciar}
            >
              <Icon name="play" size={22} />
              {sala.jugadores.length < 2 ? 'Esperando rivales...' : '¡Pitido inicial!'}
            </button>
          ) : (
            <div className="panel center" style={{ padding: '2rem 1.5rem', marginTop: '1rem' }}>
              <span className="lb-luna chica"><Icon name="hourglass" size={40} /></span>
              <h3 style={{ margin: '0.5rem 0' }}>Esperando al anfitrión...</h3>
              <p className="hint">El anfitrión iniciará el partido cuando estéis listos.</p>
            </div>
          )}
        </section>
      )}

      {/* 5. PARTIDA ACTIVA */}
      {enPartidaActiva && sala?.vista && (
        <section className="game">
          <div className="panel qq-menu-panel" style={{ padding: '0.8rem 1.1rem', marginBottom: '1rem' }}>
            <div className="qq-card-top" style={{ marginBottom: 0 }}>
              <BotonVolver texto="Volver a la portada" onClick={() => setModalSalirPortada(true)} />
            </div>
          </div>

          <FurboPartida
            vista={sala.vista}
            viewerId={yoId}
            esHost={Boolean(esAdmin)}
            onAccion={enviarAccion}
            finalAcciones={(
              <div className="actions" style={{ marginTop: '1.5rem' }}>
                {esAdmin ? (
                  <button type="button" className="big full qq-btn-principal" onClick={handleReiniciar}>
                    <Icon name="refresh" size={20} /> Volver a la sala
                  </button>
                ) : (
                  <p className="hint center" style={{ width: '100%' }}>Esperando a que el anfitrión vuelva a la sala...</p>
                )}
                <button type="button" className="secondary danger full" onClick={() => setModalSalirPortada(true)}>
                  <Icon name="door" size={20} /> Salir a la portada
                </button>
              </div>
            )}
          />
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
                ? 'Se cerrará la sala y saldrás de la partida hacia la portada principal. ¿Estás seguro?'
                : 'Abandonarás la sala y saldrás hacia la portada principal. ¿Estás seguro?'}
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