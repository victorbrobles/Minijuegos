// client/src/games/Cancion/CancionOnline.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import { reproducirOReanudar, pausarAudio, detenerReproduccion } from './audioPlayerCancion.js';
import './Cancion.css';
import '../Adivina/Adivina.css';

const CLAVE_SESION_CANCION = 'cancion_online_session';
const TIEMPO_RESPUESTA = 60;

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

export default function CancionOnline({
  tituloJuego = 'Afina ese oído',
  descripcionJuego,
  onLocal,
  onSalir,
  onAbrirAyuda
}) {
  const navigate = useNavigate();
  const [vista, setVista] = useState('menu'); 
  const [nombre, setNombre] = useState('');
  const [codigoInput, setCodigoInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);
  
  const [modalSalirLobby, setModalSalirLobby] = useState(false);
  const [modalSalirPortada, setModalSalirPortada] = useState(false);

  const [sesion, setSesion] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(CLAVE_SESION_CANCION));
    } catch {
      return null;
    }
  });

  const [sala, setSala] = useState(null);
  const [codigoCopiado, setCodigoCopiado] = useState(false);
  const [miTexto, setMiTexto] = useState('');
  const [sonandoLocal, setSonandoLocal] = useState(false);

  const [tiempoRespuesta, setTiempoRespuesta] = useState(TIEMPO_RESPUESTA);

  const intervalRef = useRef(null);
  const timerRespuestaRef = useRef(null);

  useEffect(() => {
    return () => detenerReproduccion();
  }, []);

  useEffect(() => {
    if (!sesion) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setSala(null);
      return;
    }

    const consultarEstado = () => {
      fetch(`/api/cancion/online/sala/${sesion.code}?token=${sesion.token}`)
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
          sessionStorage.removeItem(CLAVE_SESION_CANCION);
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

  useEffect(() => {
    const ronda = sala?.ronda;
    if (!ronda) return;

    if (ronda.reproduciendo && !sonandoLocal && ronda.estadoRonda === 'activa') {
      setSonandoLocal(true);
      reproducirOReanudar(
        ronda.audio,
        null,
        () => {
          setSonandoLocal(false);
        }
      );
    } else if (!ronda.reproduciendo && sonandoLocal) {
      pausarAudio();
      setSonandoLocal(false);
    }
  }, [sala?.ronda?.reproduciendo, sala?.ronda?.estadoRonda, sonandoLocal]);

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
    sessionStorage.removeItem(CLAVE_SESION_CANCION);
    setSesion(null);
    setSala(null);
    setModalSalirPortada(false);

    if (sesionActual?.code && sesionActual?.token) {
      fetch(`/api/cancion/online/sala/${sesionActual.code}/salir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesionActual.token }),
        keepalive: true
      }).catch(() => {});
    }

    redirigirAPortada();
  };

  const handleVolverMenuOnline = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const sesionActual = sesion;
    sessionStorage.removeItem(CLAVE_SESION_CANCION);
    setSesion(null);
    setSala(null);
    setModalSalirLobby(false);
    setVista('online_menu');

    if (sesionActual?.code && sesionActual?.token) {
      fetch(`/api/cancion/online/sala/${sesionActual.code}/salir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesionActual.token }),
        keepalive: true
      }).catch(() => {});
    }
  };

  const handleCrear = async () => {
    if (!nombre.trim()) return;
    setCargando(true);
    try {
      const res = await fetch('/api/cancion/online/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_CANCION, JSON.stringify(nueva));
      setSesion(nueva);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleUnirse = async () => {
    if (!nombre.trim() || !codigoInput.trim()) return;
    setCargando(true);
    try {
      const res = await fetch('/api/cancion/online/unirse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codigoInput.trim().toUpperCase(), nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_CANCION, JSON.stringify(nueva));
      setSesion(nueva);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleIniciarJuego = async () => {
    try {
      await fetch(`/api/cancion/online/sala/${sesion.code}/iniciar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token })
      });
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handlePlayAudio = async () => {
    try {
      await fetch(`/api/cancion/online/sala/${sesion.code}/reproducir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handlePulsarRojo = async () => {
    detenerReproduccion();
    pausarAudio();
    setSonandoLocal(false);
    try {
      setMiTexto('');
      await fetch(`/api/cancion/online/sala/${sesion.code}/pulsar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleCambioTexto = (val) => {
    setMiTexto(val);
    fetch(`/api/cancion/online/sala/${sesion.code}/teclear`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: sesion.token, texto: val })
    }).catch(() => {});
  };

  const enviarFalloTimeout = async () => {
    if (!sesion) return;
    try {
      await fetch(`/api/cancion/online/sala/${sesion.code}/responder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token, respuesta: '' }) 
      });
      setMiTexto('');
    } catch (err) {
      console.error(err);
    }
  };

  const enviarFalloTimeoutRef = useRef();
  useEffect(() => {
    enviarFalloTimeoutRef.current = enviarFalloTimeout;
  });

  const handleEnviarRespuesta = async (e) => {
    if (e) e.preventDefault();
    if (!miTexto.trim()) return;

    if (timerRespuestaRef.current) clearInterval(timerRespuestaRef.current);

    try {
      await fetch(`/api/cancion/online/sala/${sesion.code}/responder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token, respuesta: miTexto })
      });
      setMiTexto('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleRendirse = async () => {
    detenerReproduccion();
    try {
      await fetch(`/api/cancion/online/sala/${sesion.code}/solucion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSiguienteRonda = async () => {
    detenerReproduccion();
    try {
      await fetch(`/api/cancion/online/sala/${sesion.code}/siguiente-ronda`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token })
      });
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

  const ronda = sala?.ronda;
  const esAdmin = sala?.esAdmin;
  const yoId = sala?.yoId;
  const soyElQueHaPulsado = Boolean(ronda?.pulsado && ronda.pulsado.jugadorId === yoId);
  const alguienHaPulsado = Boolean(ronda?.pulsado);
  const miJugador = sala?.jugadores?.find((j) => j.id === yoId);
  const estoyBloqueado = Boolean(miJugador?.bloqueado);

  useEffect(() => {
    if (!alguienHaPulsado || ronda?.estadoRonda !== 'activa') {
      if (timerRespuestaRef.current) clearInterval(timerRespuestaRef.current);
      return;
    }

    setTiempoRespuesta(TIEMPO_RESPUESTA);
    if (timerRespuestaRef.current) clearInterval(timerRespuestaRef.current);

    timerRespuestaRef.current = setInterval(() => {
      setTiempoRespuesta((prev) => {
        if (prev <= 1) {
          clearInterval(timerRespuestaRef.current);
          if (soyElQueHaPulsado && enviarFalloTimeoutRef.current) {
            enviarFalloTimeoutRef.current(); 
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRespuestaRef.current) clearInterval(timerRespuestaRef.current);
    };
  }, [alguienHaPulsado, ronda?.estadoRonda, soyElQueHaPulsado]);

  const ranking = sala?.jugadores ? [...sala.jugadores].sort((a, b) => b.puntos - a.puntos) : [];
  const maximoPuntos = ranking.length ? ranking[0].puntos : 0;
  const ganadores = maximoPuntos > 0 ? ranking.filter((j) => j.puntos === maximoPuntos) : [];

  const enPartidaActiva = vista === 'sala' && sala && sala.estado !== 'lobby';

  return (
    <div className={`cancion-contenedor ${enPartidaActiva ? 'qq-en-partida' : ''}`}>
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
              <Icon name="music" size={44} strokeWidth={1.7} />
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
              Introduce tu nombre para abrir la sala y ser el anfitrión.
            </p>

            <div className="lb-form qq-form-estilizado">
              <label className="field-label" htmlFor="can-host-nombre">Tu nombre</label>
              <input
                id="can-host-nombre"
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
              Introduce el código que te ha compartido el anfitrión y tu nombre.
            </p>

            <div className="lb-form qq-form-estilizado">
              <label className="field-label" htmlFor="can-code-input">Código de la sala</label>
              <input
                id="can-code-input"
                className="lb-input-codigo qq-input-moderno"
                type="text"
                placeholder="ABCD"
                value={codigoInput}
                onChange={(e) => setCodigoInput(e.target.value.toUpperCase())}
                maxLength={4}
                style={{ textTransform: 'uppercase', letterSpacing: '4px', textAlign: 'center', fontWeight: '800' }}
                autoFocus
              />

              <label className="field-label" htmlFor="can-guest-nombre" style={{ marginTop: '1rem' }}>Tu nombre</label>
              <input
                id="can-guest-nombre"
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
              {codigoCopiado ? '¡Copiado al portapapeles!' : 'Pulsa el código para copiarlo y compártelo con los demás.'}
            </p>
          </div>

          <div className="panel" style={{ marginTop: '1rem' }}>
            <h3 className="panel-title"><Icon name="users" size={20} /> Jugadores ({sala.jugadores.length})</h3>
            <div className="lb-lista">
              {sala.jugadores.map((j) => (
                <div key={j.id} className={`lb-jug ${j.id === yoId ? 'yo' : ''}`}>
                  <span className="lb-jug-nombre">
                    {j.nombre}{j.id === yoId ? ' (Tú)' : ''}{j.id === 1 ? ' 👑' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {esAdmin ? (
            <div style={{ marginTop: '1.2rem' }}>
              <button
                className="big full qq-btn-principal"
                disabled={sala.jugadores.length < 2}
                onClick={handleIniciarJuego}
              >
                <Icon name="play" size={22} />
                {sala.jugadores.length < 2 ? 'Esperando jugadores...' : '¡Empezar Partida!'}
              </button>
            </div>
          ) : (
            <div className="panel center" style={{ padding: '2rem 1.5rem', marginTop: '1rem' }}>
              <span className="lb-luna chica"><Icon name="hourglass" size={40} /></span>
              <h3 style={{ margin: '0.5rem 0' }}>Esperando al anfitrión...</h3>
              <p className="hint">El anfitrión iniciará la partida cuando estéis todos listos.</p>
            </div>
          )}
        </section>
      )}

      {/* 5. JUGANDO ONLINE */}
      {vista === 'sala' && sala && sala.estado === 'jugando' && ronda && (
        <section className="game">
          <div className="panel qq-menu-panel">
            <div className="qq-card-top" style={{ marginBottom: '0.8rem' }}>
              <BotonVolver texto="Volver a la portada" onClick={() => setModalSalirPortada(true)} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="qq-tablero-badge" style={{ marginBottom: 0 }}>
                  Ronda {sala.rondaNum}
                </span>
              </div>
            </div>

            <div className="scoreboard-container" style={{ justifyContent: 'center', marginBottom: '0.8rem' }}>
              {sala.jugadores.map((j) => (
                <div key={j.id} className={`score-pill ${j.bloqueado ? 'locked' : ''}`}>
                  <span>{j.nombre}: <strong>{j.puntos} pts</strong></span>
                  {j.bloqueado && <span style={{ marginLeft: '4px' }}>❌</span>}
                </div>
              ))}
            </div>

            <div className="adv-pista-caja activa" style={{ margin: 0, width: '100%', marginBottom: '1.2rem' }}>
              <span className="adv-pista-badge" style={{ marginBottom: '0.8rem' }}>
                🎵 MÚSICA DEL TEMA (30S)
              </span>
              <div className="adv-audio-player" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem', marginTop: '0.2rem' }}>
                {ronda.audio ? (
                  esAdmin ? (
                    <button
                      type="button"
                      className={`adv-btn-audio ${ronda.reproduciendo ? 'sonando' : ''}`}
                      onClick={handlePlayAudio}
                      disabled={alguienHaPulsado || ronda.estadoRonda !== 'activa'}
                    >
                      <Icon name={ronda.reproduciendo ? 'pause' : 'play'} size={20} />
                      {ronda.reproduciendo
                        ? 'Pausar canción (Admin)'
                        : 'Reproducir / Reanudar (30s)'}
                    </button>
                  ) : (
                    <div className={`adv-btn-audio ${ronda.reproduciendo ? 'sonando' : ''}`} style={{ cursor: 'default', opacity: 1 }}>
                      <Icon name={ronda.reproduciendo ? 'music' : 'pause'} size={20} />
                      {ronda.reproduciendo
                        ? 'Escuchando canción...'
                        : 'Música pausada'}
                    </div>
                  )
                ) : (
                  <p className="hint">Audio no disponible para este tema.</p>
                )}

                {ronda.audio && (
                  <p className="hint" style={{ fontSize: '0.75rem', marginTop: '0.3rem' }}>
                    Fragmento de audio proporcionado por{' '}
                    <a href="https://www.deezer.com" target="_blank" rel="noopener noreferrer">Deezer</a>
                  </p>
                )}
              </div>
            </div>

            {ronda.estadoRonda === 'activa' ? (
              <div className="cancion-pulsador-wrapper" style={{ marginTop: '0' }}>
                {!alguienHaPulsado && (
                  <div className="pulsador-container">
                    <button
                      type="button"
                      className="btn-pulsador-rojo"
                      onClick={handlePulsarRojo}
                      disabled={estoyBloqueado}
                    >
                      <span className="pulsador-icono">🔴</span>
                      <span className="pulsador-texto">
                        {estoyBloqueado ? 'BLOQUEADO ESTA RONDA' : '¡PULSAR PARA RESPONDER!'}
                      </span>
                    </button>

                    {esAdmin && (
                      <div className="qq-tablero-footer" style={{ marginTop: '0.8rem', width: '100%' }}>
                        <button type="button" className="qq-link-otra-ronda" onClick={handleRendirse}>
                          Rendirse y ver solución
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {alguienHaPulsado && (
                  <div style={{ padding: '0', marginTop: '0.5rem', marginBottom: '0.8rem', width: '100%' }}>
                    <div className="timer" role="timer" style={{ margin: '0.4rem 0', background: '#e2e8f0', borderRadius: '9999px', height: '8px', overflow: 'hidden' }}>
                      <div
                        className={`timer-bar ${tiempoRespuesta <= 15 ? 'low' : ''}`}
                        style={{
                          width: `${(tiempoRespuesta / TIEMPO_RESPUESTA) * 100}%`,
                          height: '100%',
                          backgroundColor: tiempoRespuesta <= 15 ? '#ef4444' : '#16a34a',
                          borderRadius: '9999px',
                          transition: 'width 0.1s linear, background-color 0.3s ease'
                        }}
                      />
                    </div>
                    <p className="timer-text" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', color: tiempoRespuesta <= 15 ? '#dc2626' : '#64748b', fontSize: '0.9rem', fontWeight: 700, margin: '0' }}>
                      <Icon name="clock" size={16} />
                      {tiempoRespuesta} s para responder
                    </p>
                  </div>
                )}

                {soyElQueHaPulsado && (
                  <form onSubmit={handleEnviarRespuesta} className="respuesta-pulsada-box" style={{ width: '100%' }}>
                    <div className="respuesta-pulsada-header">
                      <span className="pulsado-badge">🔴 Tiempo detenido (+10 / -5 pts)</span>
                      <p className="hint small" style={{ margin: '0.3rem 0' }}>Escribe el nombre de la canción:</p>
                    </div>
                    <div className="answer-form">
                      <input
                        autoFocus
                        type="text"
                        className="player-text-input respuesta-input-grande"
                        placeholder="Título de la canción..."
                        value={miTexto}
                        onChange={(e) => handleCambioTexto(e.target.value)}
                      />
                      <button type="submit" className="btn-start" disabled={!miTexto.trim()}>
                        Responder
                      </button>
                    </div>
                  </form>
                )}

                {alguienHaPulsado && !soyElQueHaPulsado && (
                  <div className="online-tecleo-preview-card" style={{ width: '100%' }}>
                    <p>🔴 <strong>{ronda.pulsado.nombre}</strong> ha pulsado:</p>
                    <div className="online-tecleo-box">
                      <span className="online-tecleo-texto">{ronda.pulsado.texto || 'Escribiendo...'}</span>
                    </div>
                  </div>
                )}

                {ronda.mensaje && (
                  <div className={`status-alert ${ronda.mensaje.tipo}`} style={{ marginTop: '1rem', width: '100%' }}>
                    {ronda.mensaje.texto}
                  </div>
                )}
              </div>
            ) : (
              <div className="round-finished-box">
                <h2 style={{ fontSize: '1.4rem', color: '#1e1b4b' }}>🎵 {ronda.solucion}</h2>
                {ronda.mensaje && (
                  <div className={`status-alert ${ronda.mensaje.tipo}`} style={{ margin: '0.8rem 0' }}>
                    {ronda.mensaje.texto}
                  </div>
                )}

                <div className="round-finished-actions">
                  {esAdmin ? (
                    <button className="big full qq-btn-principal" onClick={handleSiguienteRonda}>
                      Siguiente Canción ➔
                    </button>
                  ) : (
                    <p className="hint">Esperando a que el anfitrión pase de ronda...</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 6. SALA: PODIO FINAL */}
      {vista === 'sala' && sala && sala.estado === 'final' && (
        <section className="game">
          <div className="end-card">
            <span className="end-icon"><Icon name="crown" size={48} /></span>
            <h1 className="title">Clasificación Final</h1>
            <p className="final-score">
              {ganadores.length === 0
                ? 'Nadie ha conseguido puntos'
                : ganadores.length === 1
                ? <>¡Victoria para {ganadores[0].nombre} con {maximoPuntos} puntos!</>
                : <>Empate entre {ganadores.map((g) => g.nombre).join(', ')} con {maximoPuntos} puntos</>}
            </p>

            <div className="scoreboard">
              {ranking.map((j, i) => {
                const lider = maximoPuntos > 0 && j.puntos === maximoPuntos;
                return (
                  <div key={j.id} className={`score-row ${lider ? 'first' : ''}`}>
                    <span className="score-name">
                      {lider ? <Icon name="crown" size={22} /> : <span className="pos">{i + 1}</span>}
                      {j.nombre}
                    </span>
                    <span className="score-pts">{j.puntos} pts</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="actions" style={{ marginTop: '1.5rem' }}>
            <button className="secondary danger full" onClick={() => setModalSalirPortada(true)}>
              <Icon name="door" size={20} /> Salir al menú principal
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