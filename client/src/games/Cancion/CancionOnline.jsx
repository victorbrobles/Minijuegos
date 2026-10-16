// client/src/games/Cancion/CancionOnline.jsx
import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../components/Icon.jsx';
import { reproducirConRampa, pausarAudio, detenerReproduccion } from './audioPlayerCancion.js';
import './Cancion.css';
import '../Adivina/Adivina.css';

const CLAVE_SESION_CANCION = 'cancion_online_session';

export default function CancionOnline({ onLocal, onSalir }) {
  const [vista, setVista] = useState('menu'); // 'menu' | 'crear' | 'unirse' | 'sala'
  const [nombre, setNombre] = useState('');
  const [codigoInput, setCodigoInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);

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

  const intervalRef = useRef(null);

  useEffect(() => {
    return () => detenerReproduccion();
  }, []);

  // Polling de sincronización
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

  // Manejo reactivo de audio sincronizado
  useEffect(() => {
    const ronda = sala?.ronda;
    if (!ronda) return;

    if (ronda.reproduciendo && !sonandoLocal && ronda.estadoRonda === 'activa') {
      setSonandoLocal(true);
      reproducirConRampa(
        ronda.audio,
        (s) => {
          if (sala.esAdmin) {
            fetch(`/api/cancion/online/sala/${sala.code}/tick`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token: sesion.token, segundos: s })
            }).catch(() => {});
          }
        },
        () => {
          setSonandoLocal(false);
          if (sala.esAdmin) {
            fetch(`/api/cancion/online/sala/${sala.code}/solucion`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token: sesion.token })
            }).catch(() => {});
          }
        }
      );
    } else if (!ronda.reproduciendo && sonandoLocal) {
      pausarAudio();
      setSonandoLocal(false);
    }
  }, [sala?.ronda?.reproduciendo, sala?.ronda?.estadoRonda]);

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

  const handleEnviarRespuesta = async (e) => {
    e.preventDefault();
    if (!miTexto.trim()) return;
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

  return (
    <div className="cancion-contenedor">
      {/* 1. MENÚ ONLINE */}
      {vista === 'menu' && (
        <section className="game">
          <div className="panel center">
            <span className="lb-luna chica">
              <Icon name="music" size={42} strokeWidth={1.6} />
            </span>
            <h1 className="title">Afina ese oído</h1>
            <p className="hint">
              Adivina la canción antes de que alcance su volumen máximo. ¡El más rápido en pulsar suma los segundos que queden!
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

      {/* 2. CREAR SALA */}
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
              <button
                className="big full"
                style={{ marginTop: '1rem' }}
                disabled={cargando || !nombre.trim()}
                onClick={handleCrear}
              >
                Crear sala
              </button>
              <button className="secondary full" style={{ marginTop: '0.6rem' }} onClick={() => setVista('menu')}>
                Volver
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 3. UNIRSE A SALA */}
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

      {/* 4. LOBBY */}
      {vista === 'sala' && sala && sala.estado === 'lobby' && (
        <section className="game">
          <div className="panel center">
            <p className="categoria">Código de la partida</p>
            <button type="button" className="qq-codigo-btn" onClick={copiarCodigo}>
              {sala.code}
            </button>
            <p className="hint small">
              {codigoCopiado ? '¡Copiado!' : 'Comparte este código para que se unan (2 a 20 jugadores).'}
            </p>
          </div>

          <div className="panel" style={{ marginTop: '1rem' }}>
            <h3 className="panel-title"><Icon name="users" size={20} /> Jugadores ({sala.jugadores.length}/20)</h3>
            <div className="lb-lista">
              {sala.jugadores.map((j) => (
                <div key={j.id} className={`lb-jug ${j.id === yoId ? 'yo' : ''}`}>
                  <span className="lb-punto on" />
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

          <button className="secondary danger full" style={{ marginTop: '1rem' }} onClick={handleSalir}>
            Salir de la sala
          </button>
        </section>
      )}

      {/* 5. JUGANDO ONLINE */}
      {vista === 'sala' && sala && sala.estado === 'jugando' && ronda && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="flagFinish" size={18} />Ronda {sala.rondaNum}</span>
            <span className="chip alt">⏱️ {ronda.segundosRestantes}s (+{ronda.segundosRestantes} / -{ronda.segundosRestantes} pts)</span>
          </div>

          {/* Marcador superior */}
          <div className="scoreboard-container" style={{ justifyContent: 'center', marginBottom: '0.8rem' }}>
            {sala.jugadores.map((j) => (
              <div key={j.id} className={`score-pill ${j.bloqueado ? 'locked' : ''}`}>
                <span>{j.nombre}: <strong>{j.puntos} pts</strong></span>
                {j.bloqueado && <span style={{ marginLeft: '4px' }}>❌</span>}
              </div>
            ))}
          </div>

          {/* Reproductor con rampa de volumen */}
          <div className="cancion-player-box">
            {esAdmin ? (
              <button
                type="button"
                className={`cancion-play-btn ${ronda.reproduciendo ? 'sonando' : ''}`}
                onClick={handlePlayAudio}
                disabled={alguienHaPulsado || ronda.estadoRonda !== 'activa'}
              >
                <Icon name={ronda.reproduciendo ? 'pause' : 'play'} size={42} strokeWidth={2.5} />
              </button>
            ) : (
              <div className={`cancion-play-btn ${ronda.reproduciendo ? 'sonando' : ''}`} style={{ cursor: 'default' }}>
                <Icon name="music" size={42} strokeWidth={2.5} />
              </div>
            )}

            <span className="cancion-timer-tag">
              {ronda.reproduciendo ? '¡Música sonando!' : 'Pausado'}
            </span>
            <span className="hint small">Subiendo gradualmente de volumen ({ronda.segundosRestantes}s)</span>

            <div className="cancion-volume-meter">
              <div
                className="cancion-volume-fill"
                style={{ width: `${((30 - ronda.segundosRestantes) / 30) * 100}%` }}
              />
            </div>
          </div>

          {/* Zona del pulsador interactivo online */}
          {ronda.estadoRonda === 'activa' ? (
            <div className="cancion-pulsador-wrapper">
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

              {/* Si yo he pulsado */}
              {soyElQueHaPulsado && (
                <form onSubmit={handleEnviarRespuesta} className="respuesta-pulsada-box" style={{ width: '100%' }}>
                  <div className="respuesta-pulsada-header">
                    <span className="pulsado-badge">🔴 Has pulsado · {ronda.segundosRestantes}s restantes</span>
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

              {/* Si otro jugador ha pulsado: previsualización en vivo */}
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

          <button className="secondary danger full" style={{ marginTop: '1.2rem' }} onClick={handleSalir}>
            Salir de la sala
          </button>
        </section>
      )}
    </div>
  );
}