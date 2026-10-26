import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../components/Icon.jsx';
import { reproducirOReanudar, pausarAudio, detenerReproduccion } from './audioPlayerCancion.js';
import './Cancion.css';
import '../Adivina/Adivina.css';

const CLAVE_SESION_CANCION = 'cancion_online_session';
const TIEMPO_RESPUESTA = 60;

export default function CancionOnline({ onLocal, onSalir }) {
  const [vista, setVista] = useState('menu'); 
  const [nombre, setNombre] = useState('');
  const [codigoInput, setCodigoInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);
  const [modalSalir, setModalSalir] = useState(false);
  const [modalAyuda, setModalAyuda] = useState(false);

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
          setVista('menu');
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

  const handleSalir = () => {
    detenerReproduccion();
    sessionStorage.removeItem(CLAVE_SESION_CANCION);
    setSesion(null);
    setSala(null);
    setVista('menu');
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

  const mostrarAyuda = vista === 'menu' || vista === 'crear' || vista === 'unirse' || (vista === 'sala' && sala?.estado === 'lobby');

  return (
    <div className="cancion-contenedor">
      {mostrarAyuda && (
        <button type="button" className="btn-ayuda-flotante" onClick={() => setModalAyuda(true)} title="Reglas del juego">
          <span className="btn-ayuda-flotante-signo">?</span>
        </button>
      )}

      {modalAyuda && (
        <div className="rg-modal-fondo" onClick={() => setModalAyuda(false)}>
          <div className="rg-modal aprox-modal-ayuda" onClick={(e) => e.stopPropagation()}>
            <div className="aprox-modal-header">
              <span className="aprox-modal-signo-title">?</span>
              <h3>¿Cómo se juega a Afina ese oído?</h3>
            </div>

            <div className="aprox-modal-cuerpo">
              <p><strong>1. Dinámica musical:</strong></p>
              <ul>
                <li>El anfitrión iniciará la canción que durará hasta un máximo de 30s.</li>
                <li>En cuanto reconozcas el tema, <strong>pulsa el botón rojo</strong> para detener la reproducción de todos. Tienes <strong>60 segundos para responder</strong>.</li>
              </ul>
              <p><strong>2. Puntuación y rebote:</strong></p>
              <ul>
                <li>Si aciertas, sumas <strong>+10 puntos</strong>.</li>
                <li>Si fallas o se te acaba el tiempo de respuesta, restas <strong>-5 puntos</strong> y quedas bloqueado, ¡reanudándose el audio y la ronda para el resto!</li>
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

      {vista === 'menu' && (
        <section className="game">
          <div className="panel center">
            <span className="lb-luna chica">
              <Icon name="music" size={42} strokeWidth={1.6} />
            </span>
            <h1 className="title">Afina ese oído Online</h1>
            <p className="hint">
              Adivina la canción antes de que acabe. ¡El más rápido en pulsar se la lleva!
            </p>

            {errorMsg && <p className="error" style={{ margin: '0.8rem 0' }}>{errorMsg}</p>}

            <div className="lb-menu">
              <button className="big full" onClick={() => { setVista('crear'); setErrorMsg(''); }}>
                <Icon name="crown" size={22} /> Crear partida Online
              </button>
              <button className="big full" onClick={() => { setVista('unirse'); setErrorMsg(''); }}>
                <Icon name="users" size={22} /> Unirse con código
              </button>
              <button className="secondary full" onClick={onLocal}>
                <Icon name="home" size={20} /> Jugar en un solo dispositivo
              </button>
            </div>
          </div>
        </section>
      )}

      {vista === 'crear' && (
        <section className="game">
          <div className="panel center">
            <h2 className="title">Crear sala Online</h2>
            <p className="hint">Introduce tu nombre de anfitrión (hasta 20 jugadores).</p>

            <div className="lb-form" style={{ marginTop: '1.2rem', textAlign: 'left' }}>
              <input
                type="text"
                placeholder="Tu nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                maxLength={20}
                autoFocus
              />
              <button className="big full" style={{ marginTop: '1rem' }} disabled={cargando || !nombre.trim()} onClick={handleCrear}>
                Crear sala
              </button>
              <button className="secondary full" style={{ marginTop: '0.6rem' }} onClick={() => setVista('menu')}>
                Volver
              </button>
            </div>
          </div>
        </section>
      )}

      {vista === 'unirse' && (
        <section className="game">
          <div className="panel center">
            <h2 className="title">Unirse a partida</h2>
            <div className="lb-form" style={{ marginTop: '1.2rem', textAlign: 'left' }}>
              <input
                type="text"
                placeholder="CÓDIGO (4 LETRAS)"
                value={codigoInput}
                onChange={(e) => setCodigoInput(e.target.value.toUpperCase())}
                maxLength={4}
                style={{ textTransform: 'uppercase', letterSpacing: '4px', textAlign: 'center', fontWeight: '800' }}
                autoFocus
              />
              <input
                type="text"
                placeholder="Tu nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                maxLength={20}
                style={{ marginTop: '0.8rem' }}
              />
              <button
                className="big full"
                style={{ marginTop: '1rem' }}
                disabled={cargando || !nombre.trim() || codigoInput.trim().length < 4}
                onClick={handleUnirse}
              >
                Entrar a la sala
              </button>
              <button className="secondary full" style={{ marginTop: '0.6rem' }} onClick={() => setVista('menu')}>
                Volver
              </button>
            </div>
          </div>
        </section>
      )}

      {vista === 'sala' && sala && sala.estado === 'lobby' && (
        <section className="game">
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
            <button type="button" className="qq-codigo-btn" onClick={copiarCodigo} title="Copiar código">
              {sala.code}
            </button>
            <p className="hint small">
              {codigoCopiado ? '¡Copiado al portapapeles!' : 'Comparte este código para que se unan (2 a 20 jugadores).'}
            </p>
          </div>

          <div className="panel" style={{ marginTop: '1rem' }}>
            <h3 className="panel-title"><Icon name="users" size={20} /> Jugadores ({sala.jugadores.length}/20)</h3>
            <div className="lb-lista">
              {sala.jugadores.map((j) => (
                <div key={j.id} className={`lb-jug ${j.id === yoId ? 'yo' : ''}`}>
                  <span className="lb-jug-nombre">{j.nombre}{j.id === yoId ? ' (Tú)' : ''}{j.id === 1 ? ' 👑' : ''}</span>
                </div>
              ))}
            </div>
          </div>

          {esAdmin ? (
            <button
              className="big full"
              style={{ marginTop: '1.2rem' }}
              disabled={sala.jugadores.length < 2}
              onClick={handleIniciarJuego}
            >
              {sala.jugadores.length < 2 ? 'Esperando rivales...' : '¡Empezar Partida!'}
            </button>
          ) : (
            <div className="panel center" style={{ marginTop: '1rem' }}>
              <p className="hint">Esperando a que el anfitrión comience la partida...</p>
            </div>
          )}

          <button className="secondary danger full" style={{ marginTop: '1rem' }} onClick={() => setModalSalir(true)}>
            Salir de la sala
          </button>
        </section>
      )}

      {vista === 'sala' && sala && sala.estado === 'jugando' && ronda && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="flagFinish" size={18} />Ronda {sala.rondaNum}</span>
          </div>

          <div className="scoreboard-container" style={{ justifyContent: 'center', marginBottom: '0.8rem' }}>
            {sala.jugadores.map((j) => (
              <div key={j.id} className={`score-pill ${j.bloqueado ? 'locked' : ''}`}>
                <span>{j.nombre}: <strong>{j.puntos} pts</strong></span>
                {j.bloqueado && <span style={{ marginLeft: '4px' }}>❌</span>}
              </div>
            ))}
          </div>

          <div className="panel" style={{ marginBottom: '1.2rem', padding: '1.2rem' }}>
            <div className="adv-pista-caja activa" style={{ margin: 0, width: '100%' }}>
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
                    <button className="secondary danger full" style={{ marginTop: '0.8rem' }} onClick={handleRendirse}>
                      Rendirse y ver solución
                    </button>
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

              {esAdmin ? (
                <div className="round-finished-actions">
                  <button className="btn-start" onClick={handleSiguienteRonda}>
                    Siguiente Canción ➔
                  </button>
                </div>
              ) : (
                <p className="hint">Esperando a que el anfitrión pase de ronda...</p>
              )}
            </div>
          )}

          <button className="secondary danger full" style={{ marginTop: '1.2rem' }} onClick={() => setModalSalir(true)}>
            Salir de la sala
          </button>
        </section>
      )}

      {modalSalir && (
        <div className="rg-modal-fondo" onClick={() => setModalSalir(false)}>
          <div className="rg-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px', textAlign: 'center', padding: '1.8rem 1.4rem' }}>
            <div style={{ fontSize: '2.4rem', marginBottom: '0.4rem' }}>🚪</div>
            <h3 style={{ margin: '0 0 0.6rem', color: '#1e1b4b', fontSize: '1.3rem' }}>
              ¿Abandonar la partida?
            </h3>
            <p className="hint" style={{ fontSize: '0.95rem', marginBottom: '1.4rem', lineHeight: '1.4' }}>
              Si sales de la sala perderás tu progreso actual en la partida. ¿Estás seguro de que deseas salir?
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <button type="button" className="secondary full" onClick={() => setModalSalir(false)}>
                No, quedarme
              </button>
              <button 
                type="button" 
                className="secondary danger full" 
                style={{ background: '#ef4444', color: '#ffffff', borderColor: '#dc2626' }}
                onClick={() => {
                  setModalSalir(false);
                  handleSalir();
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