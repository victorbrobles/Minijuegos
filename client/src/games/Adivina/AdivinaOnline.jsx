// client/src/games/Adivina/AdivinaOnline.jsx
import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../components/Icon.jsx';
import { reproducirClip, detenerClip } from './audioPlayer.js';
import './Adivina.css';

const CLAVE_SESION_ADIVINA = 'adivina_online_session';

export default function AdivinaOnline({ onLocal, onSalir }) {
  const [vista, setVista] = useState('menu'); // 'menu' | 'crear' | 'unirse' | 'sala'
  const [nombre, setNombre] = useState('');
  const [codigoInput, setCodigoInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);

  const [sesion, setSesion] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(CLAVE_SESION_ADIVINA));
    } catch {
      return null;
    }
  });

  const [sala, setSala] = useState(null);
  const [codigoCopiado, setCodigoCopiado] = useState(false);
  const [miTexto, setMiTexto] = useState('');
  const [reproduciendoAudio, setReproduciendoAudio] = useState(false);
  const [segundosAudio, setSegundosAudio] = useState(20);

  const intervalRef = useRef(null);

  useEffect(() => {
    return () => detenerClip();
  }, []);

  useEffect(() => {
    if (!sesion) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setSala(null);
      return;
    }

    const consultarEstado = () => {
      fetch(`/api/adivina/online/sala/${sesion.code}?token=${sesion.token}`)
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
          sessionStorage.removeItem(CLAVE_SESION_ADIVINA);
          setSesion(null);
          setSala(null);
          setVista('menu');
          setErrorMsg('La sala se ha cerrado o se ha perdido la conexión.');
        });
    };

    consultarEstado();
    intervalRef.current = setInterval(consultarEstado, 500);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sesion]);

  const handleCrear = async () => {
    if (!nombre.trim()) return;
    setErrorMsg('');
    setCargando(true);
    try {
      const res = await fetch('/api/adivina/online/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear la sala.');

      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_ADIVINA, JSON.stringify(nueva));
      setSesion(nueva);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleUnirse = async () => {
    if (!nombre.trim() || !codigoInput.trim()) return;
    setErrorMsg('');
    setCargando(true);
    try {
      const res = await fetch('/api/adivina/online/unirse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codigoInput.trim().toUpperCase(), nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al unirse.');

      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_ADIVINA, JSON.stringify(nueva));
      setSesion(nueva);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleCambiarModo = async (nuevoModo) => {
    if (!sesion || !sala?.esAdmin) return;
    try {
      await fetch(`/api/adivina/online/sala/${sesion.code}/modo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token, modo: nuevoModo })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleIniciarJuego = async () => {
    if (!sesion) return;
    try {
      await fetch(`/api/adivina/online/sala/${sesion.code}/iniciar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token })
      });
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleAvanzarPista = async () => {
    if (!sesion) return;
    detenerClip();
    setReproduciendoAudio(false);
    try {
      await fetch(`/api/adivina/online/sala/${sesion.code}/pista-siguiente`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handlePulsarRojo = async () => {
    if (!sesion) return;
    detenerClip();
    setReproduciendoAudio(false);
    try {
      setMiTexto('');
      await fetch(`/api/adivina/online/sala/${sesion.code}/pulsar`, {
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
    if (!sesion) return;
    fetch(`/api/adivina/online/sala/${sesion.code}/teclear`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: sesion.token, texto: val })
    }).catch(() => {});
  };

  const handleEnviarRespuesta = async (e) => {
    e.preventDefault();
    if (!miTexto.trim() || !sesion) return;
    try {
      await fetch(`/api/adivina/online/sala/${sesion.code}/responder`, {
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
    if (!sesion) return;
    detenerClip();
    setReproduciendoAudio(false);
    try {
      await fetch(`/api/adivina/online/sala/${sesion.code}/solucion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSiguienteRonda = async () => {
    if (!sesion) return;
    detenerClip();
    setReproduciendoAudio(false);
    try {
      setMiTexto('');
      await fetch(`/api/adivina/online/sala/${sesion.code}/siguiente-ronda`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleFinalizarPartida = async () => {
    if (!sesion) return;
    try {
      await fetch(`/api/adivina/online/sala/${sesion.code}/finalizar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleReiniciarPartida = async () => {
    if (!sesion) return;
    try {
      await fetch(`/api/adivina/online/sala/${sesion.code}/reiniciar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSalir = async () => {
    if (sesion) {
      try {
        await fetch(`/api/adivina/online/sala/${sesion.code}/salir`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: sesion.token })
        });
      } catch {
        /* ignorar */
      }
    }
    sessionStorage.removeItem(CLAVE_SESION_ADIVINA);
    setSesion(null);
    setSala(null);
    setVista('menu');
  };

  const escucharEstribilloReal = () => {
    if (reproduciendoAudio) {
      detenerClip();
      setReproduciendoAudio(false);
      return;
    }
    setReproduciendoAudio(true);
    reproducirClip(
      sala?.ronda?.pista3,
      (segundos) => setSegundosAudio(segundos),
      () => setReproduciendoAudio(false)
    );
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
    <div className="adv-contenedor">
      {/* 1. MENÚ PRINCIPAL */}
      {vista === 'menu' && (
        <section className="game">
          <div className="panel center">
            <span className="lb-luna chica">
              <Icon name="dice" size={42} strokeWidth={1.6} />
            </span>
            <h1 className="title">Adivina la Pista</h1>
            <p className="hint">
              Adivina canciones y películas mediante pistas progresivas. El anfitrión crea la sala y comparte el código.
            </p>

            {errorMsg && <p className="error" style={{ margin: '0.8rem 0' }}>{errorMsg}</p>}

            <div className="lb-menu">
              <button className="big full" onClick={() => { setVista('crear'); setErrorMsg(''); }}>
                <Icon name="crown" size={22} /> Crear partida
              </button>
              <button className="big full" onClick={() => { setVista('unirse'); setErrorMsg(''); }}>
                <Icon name="users" size={22} /> Unirse a partida
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
            <span className="lb-luna chica">
              <Icon name="crown" size={40} strokeWidth={1.6} />
            </span>
            <h2 className="title">Crear partida</h2>
            <p className="hint">Introduce tu nombre para crear la sala y ser el anfitrión.</p>

            <div className="lb-form" style={{ marginTop: '1.2rem', textAlign: 'left' }}>
              <label className="field-label" htmlFor="adv-host-nombre">Tu nombre</label>
              <input
                id="adv-host-nombre"
                type="text"
                placeholder="Tu nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                maxLength={20}
                autoFocus
              />
              {errorMsg && <p className="error">{errorMsg}</p>}

              <button
                className="big full"
                style={{ marginTop: '1rem' }}
                disabled={cargando || !nombre.trim()}
                onClick={handleCrear}
              >
                <Icon name="check" size={22} strokeWidth={2.5} /> Crear sala
              </button>
              <button
                className="secondary full"
                style={{ marginTop: '0.6rem' }}
                onClick={() => { setVista('menu'); setErrorMsg(''); }}
              >
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
            <span className="lb-luna chica">
              <Icon name="users" size={40} strokeWidth={1.6} />
            </span>
            <h2 className="title">Unirse a partida</h2>
            <p className="hint">Introduce el código de 4 letras que te ha dado el anfitrión.</p>

            <div className="lb-form" style={{ marginTop: '1.2rem', textAlign: 'left' }}>
              <label className="field-label" htmlFor="adv-code-input">Código de la sala</label>
              <input
                id="adv-code-input"
                className="lb-input-codigo"
                type="text"
                placeholder="ABCD"
                value={codigoInput}
                onChange={(e) => setCodigoInput(e.target.value.toUpperCase())}
                maxLength={4}
                style={{ textTransform: 'uppercase', letterSpacing: '4px', textAlign: 'center', fontWeight: '800' }}
                autoFocus
              />

              <label className="field-label" htmlFor="adv-guest-nombre" style={{ marginTop: '1rem' }}>Tu nombre</label>
              <input
                id="adv-guest-nombre"
                type="text"
                placeholder="Tu nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                maxLength={20}
              />
              {errorMsg && <p className="error">{errorMsg}</p>}

              <button
                className="big full"
                style={{ marginTop: '1rem' }}
                disabled={cargando || !nombre.trim() || codigoInput.trim().length < 4}
                onClick={handleUnirse}
              >
                <Icon name="check" size={22} strokeWidth={2.5} /> Entrar en la partida
              </button>
              <button
                className="secondary full"
                style={{ marginTop: '0.6rem' }}
                onClick={() => { setVista('menu'); setErrorMsg(''); }}
              >
                Volver
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 4. SALA: LOBBY */}
      {vista === 'sala' && sala && sala.estado === 'lobby' && (
        <section className="game">
          <div className="panel center">
            <p className="categoria"><Icon name="lock" size={16} />Sala de espera</p>
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
            <h3 className="panel-title"><Icon name="dice" size={20} /> Modalidad de juego</h3>
            {esAdmin ? (
              <div className="adv-selector-modo">
                <button
                  type="button"
                  className={`adv-btn-modo ${sala.modo === 'canciones' ? 'activo' : ''}`}
                  onClick={() => handleCambiarModo('canciones')}
                >
                  🎵 Canciones
                </button>
                <button
                  type="button"
                  className={`adv-btn-modo ${sala.modo === 'peliculas' ? 'activo' : ''}`}
                  onClick={() => handleCambiarModo('peliculas')}
                >
                  🎬 Películas
                </button>
              </div>
            ) : (
              <p className="hint" style={{ fontWeight: 700 }}>
                Temática: {sala.modo === 'canciones' ? '🎵 Canciones' : '🎬 Películas'}
              </p>
            )}
          </div>

          <div className="panel" style={{ marginTop: '1rem' }}>
            <h3 className="panel-title"><Icon name="users" size={20} /> Jugadores ({sala.jugadores.length})</h3>
            <div className="lb-lista">
              {sala.jugadores.map((j) => (
                <div key={j.id} className={`lb-jug ${j.id === yoId ? 'yo' : ''}`}>
                  <span className="lb-punto on" />
                  <span className="lb-jug-nombre">
                    {j.nombre}{j.id === yoId ? ' (tú)' : ''}{j.id === 1 ? ' 👑' : ''}
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

          {esAdmin ? (
            <div style={{ marginTop: '1.2rem' }}>
              <button
                className="big full"
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
              <p className="hint">En cuanto comience la partida, verás la primera pista en pantalla.</p>
            </div>
          )}

          <div className="actions" style={{ marginTop: '1rem' }}>
            <button className="secondary danger full" onClick={handleSalir}>
              <Icon name="door" size={20} /> Salir de la sala
            </button>
          </div>
        </section>
      )}

      {/* 5. SALA: PODIO FINAL */}
      {vista === 'sala' && sala && sala.estado === 'final' && (
        <section className="game">
          <div className="end-card">
            <span className="end-icon"><Icon name="crown" size={44} /></span>
            <h1 className="title">Puntuaciones finales</h1>
            <p className="categoria"><Icon name="flagFinish" size={16} />Partida finalizada</p>

            <div className="scoreboard" style={{ marginTop: '1.2rem' }}>
              {[...sala.jugadores].sort((a, b) => b.puntos - a.puntos).map((j, idx) => (
                <div key={j.id} className={`score-row ${idx === 0 ? 'first' : ''}`}>
                  <span className="score-name">
                    {idx === 0 ? <Icon name="crown" size={22} /> : <span className="pos">{idx + 1}</span>}
                    {j.nombre} {j.id === yoId ? '(Tú)' : ''}
                  </span>
                  <span className="score-pts">{j.puntos} pts</span>
                </div>
              ))}
            </div>
          </div>

          <div className="actions" style={{ marginTop: '1.5rem' }}>
            {esAdmin && (
              <button className="big full" onClick={handleReiniciarPartida}>
                <Icon name="refresh" size={20} /> Otra Partida (mismos jugadores)
              </button>
            )}
            <button className="secondary danger full" onClick={handleSalir}>
              <Icon name="door" size={20} /> Salir al menú principal
            </button>
          </div>
        </section>
      )}

      {/* 6. SALA: JUGANDO ONLINE */}
      {vista === 'sala' && sala && sala.estado === 'jugando' && ronda && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="flagFinish" size={18} />Ronda {sala.rondaNum}</span>
            <span className="chip alt">
              {sala.modo === 'canciones' ? '🎵 Canción' : '🎬 Película'} · Pista {ronda.pistaActual}/3 ({ronda.pistaActual === 1 ? '10 pts' : ronda.pistaActual === 2 ? '5 pts' : '3 pts'})
            </span>
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

          {/* Pistas */}
          <div className="panel adv-panel-pistas">
            <div className="adv-pista-caja activa">
              <span className="adv-pista-badge">
                Pista 1 ({sala.modo === 'canciones' ? 'Frase' : 'Protagonistas'}) · 10 pts
              </span>
              <p className="adv-pista-contenido">
                {sala.modo === 'canciones' ? `«${ronda.pista1}»` : ronda.pista1}
              </p>
            </div>

            {ronda.pistaActual >= 2 && (
              <div className="adv-pista-caja activa anim-aparecer">
                <span className="adv-pista-badge">
                  Pista 2 ({sala.modo === 'canciones' ? 'Artista y Año' : 'Género y Año'}) · 5 pts
                </span>
                <p className="adv-pista-contenido">{ronda.pista2}</p>
              </div>
            )}

            {ronda.pistaActual >= 3 && (
              <div className="adv-pista-caja activa anim-aparecer">
                <span className="adv-pista-badge">
                  Pista 3 ({sala.modo === 'canciones' ? 'Música del tema (20s)' : 'Sinopsis mínima'}) · 3 pts
                </span>
                {sala.modo === 'canciones' ? (
                  <div className="adv-audio-player">
                    {ronda.pista3 ? (
                      <button
                        type="button"
                        className={`adv-btn-audio ${reproduciendoAudio ? 'sonando' : ''}`}
                        onClick={escucharEstribilloReal}
                      >
                        <Icon name={reproduciendoAudio ? 'pause' : 'play'} size={20} />
                        {reproduciendoAudio
                          ? `Reproduciendo música (${segundosAudio}s)...`
                          : 'Escuchar 20s de la música real'}
                      </button>
                    ) : (
                      <p className="hint">Audio no disponible para este tema.</p>
                    )}
                  </div>
                ) : (
                  <p className="adv-pista-contenido">{ronda.pista3}</p>
                )}
              </div>
            )}
          </div>

          {/* ZONA DE PULSADOR Y RESPUESTA ONLINE */}
          {ronda.estadoRonda === 'activa' ? (
            <div className="interactive-controls" style={{ marginTop: '0.8rem' }}>
              {/* CASO A: NADIE HA PULSADO -> PULSADOR DISPONIBLE */}
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
                      {estoyBloqueado ? 'BLOQUEADO EN ESTA RONDA' : '¡PULSAR PARA RESPONDER!'}
                    </span>
                  </button>

                  {/* Controles de pista para el anfitrión */}
                  {esAdmin && (
                    <div className="adv-controles-ronda" style={{ width: '100%', marginTop: '0.6rem' }}>
                      {ronda.pistaActual < 3 ? (
                        <button className="secondary full" onClick={handleAvanzarPista}>
                          <Icon name="forward" size={18} />
                          Avanzar pista ({ronda.pistaActual === 1 ? '5 pts' : '3 pts'})
                        </button>
                      ) : (
                        <button className="secondary danger full" onClick={handleRendirse}>
                          <Icon name="flag" size={18} />
                          Rendirse y ver solución
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* CASO B: YO HE PULSADO -> SOLO VEO EL INPUT Y BOTÓN DE RESPONDER */}
              {soyElQueHaPulsado && (
                <form onSubmit={handleEnviarRespuesta} className="respuesta-pulsada-box">
                  <div className="respuesta-pulsada-header">
                    <span className="pulsado-badge">🔴 ¡Has pulsado! Tiempo detenido (+{ronda.pistaActual === 1 ? 10 : ronda.pistaActual === 2 ? 5 : 3} pts)</span>
                    <p className="hint small" style={{ margin: '0.3rem 0 0.8rem' }}>
                      Escribe el título {sala.modo === 'canciones' ? 'de la canción' : 'de la película'}. Los demás ven lo que escribes:
                    </p>
                  </div>

                  <div className="answer-form">
                    <input
                      autoFocus
                      type="text"
                      className="player-text-input respuesta-input-grande"
                      placeholder="Escribe el título..."
                      value={miTexto}
                      onChange={(e) => handleCambioTexto(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="btn-start"
                      disabled={!miTexto.trim()}
                    >
                      Responder
                    </button>
                  </div>
                </form>
              )}

              {/* CASO C: OTRO JUGADOR HA PULSADO -> VEO SU TECLEO EN TIEMPO REAL */}
              {alguienHaPulsado && !soyElQueHaPulsado && (
                <div className="online-tecleo-preview-card">
                  <div className="online-tecleo-header">
                    <span className="pulsador-icono">🔴</span>
                    <strong>¡{ronda.pulsado.nombre} ha pulsado el botón!</strong>
                  </div>
                  <p className="hint small" style={{ margin: '0.4rem 0 0.8rem' }}>
                    Tiempo detenido. Está escribiendo su respuesta en directo:
                  </p>
                  <div className="online-tecleo-box">
                    {ronda.pulsado.texto ? (
                      <span className="online-tecleo-texto">{ronda.pulsado.texto}</span>
                    ) : (
                      <span className="online-tecleo-esperando">Escribiendo...</span>
                    )}
                  </div>
                </div>
              )}

              {ronda.mensaje && (
                <div className={`status-alert ${ronda.mensaje.tipo}`} style={{ marginTop: '1rem' }}>
                  {ronda.mensaje.texto}
                </div>
              )}
            </div>
          ) : (
            <div className="round-finished-box">
              <p className="rg-nombre-famoso" style={{ fontSize: '1.4rem' }}>
                Era: <strong>{ronda.solucion}</strong>
              </p>
              {ronda.extra && (
                <p className="hint center" style={{ margin: '0.2rem 0 0.8rem' }}>
                  {ronda.extra}
                </p>
              )}

              <div className={`status-alert ${ronda.mensaje?.tipo || 'info'}`} style={{ margin: '0.8rem 0' }}>
                {ronda.mensaje?.texto || `Solución: ${ronda.solucion}`}
              </div>

              {esAdmin ? (
                <div className="round-finished-actions">
                  <button className="btn-start" onClick={handleSiguienteRonda}>
                    Siguiente Ronda ➔
                  </button>
                  <button className="btn-secondary-action" onClick={handleFinalizarPartida}>
                    Finalizar Partida 🏆
                  </button>
                </div>
              ) : (
                <p className="hint center">Esperando a que el anfitrión avance de ronda...</p>
              )}
            </div>
          )}

          <div className="actions" style={{ marginTop: '1.2rem' }}>
            <button className="secondary danger full" onClick={handleSalir}>
              <Icon name="door" size={20} /> Salir de la sala
            </button>
          </div>
        </section>
      )}
    </div>
  );
}