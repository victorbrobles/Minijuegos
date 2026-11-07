// client/src/games/Rasgos/RasgosOnline.jsx
import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../components/Icon.jsx';
import './Rasgos.css';
import { MenuInicioJuego, MenuModoOnline, FormCrearSala, FormUnirseSala, CabeceraSala } from '../../components/MenuJuego.jsx';

const CLAVE_SESION_RASGOS = 'rasgos_online_session';

export default function RasgosOnline({ onLocal, onSalir }) {
  const [vista, setVista] = useState('menu'); // 'menu' | 'crear' | 'unirse' | 'sala'
  const [nombre, setNombre] = useState('');
  const [codigoInput, setCodigoInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);
  const [modalSalir, setModalSalir] = useState(false);
  const [modalAyuda, setModalAyuda] = useState(false);

  const [sesion, setSesion] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(CLAVE_SESION_RASGOS));
    } catch {
      return null;
    }
  });

  const [sala, setSala] = useState(null);
  const [codigoCopiado, setCodigoCopiado] = useState(false);
  const [miTexto, setMiTexto] = useState('');
  const [segundosRespuesta, setSegundosRespuesta] = useState(15);

  const intervalRef = useRef(null);
  const miTextoRef = useRef(miTexto);
  useEffect(() => {
    miTextoRef.current = miTexto;
  }, [miTexto]);

  useEffect(() => {
    if (!sesion) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setSala(null);
      return;
    }

    const consultarEstado = () => {
      fetch(`/api/rasgos/online/sala/${sesion.code}?token=${sesion.token}`)
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
          sessionStorage.removeItem(CLAVE_SESION_RASGOS);
          setSesion(null);
          setSala(null);
          setVista('online_menu');
          setErrorMsg('La sala se ha cerrado o se ha perdido la conexión.');
        });
    };

    consultarEstado();
    intervalRef.current = setInterval(consultarEstado, 500);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sesion]);

  const ronda = sala?.ronda;
  const esAdmin = sala?.esAdmin;
  const yoId = sala?.yoId;
  const soyElQueHaPulsado = Boolean(ronda?.pulsado && ronda.pulsado.jugadorId === yoId);
  const alguienHaPulsado = Boolean(ronda?.pulsado);
  const estoyBloqueado = Boolean(sala?.jugadores?.find((j) => j.id === yoId)?.bloqueado);

  const handleTiempoAgotadoOnline = async () => {
    if (!sesion) return;
    const texto = miTextoRef.current.trim();
    try {
      // Si hay algo escrito se envía; si no ha escrito nada, se envía '-' para que cuente como fallo
      await fetch(`/api/rasgos/online/sala/${sesion.code}/responder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token, respuesta: texto || '-' })
      });
      setMiTexto('');
    } catch (err) {
      console.error(err);
    }
  };

  // Temporizador de 15 segundos para responder online
  useEffect(() => {
    if (!alguienHaPulsado) {
      setSegundosRespuesta(15);
      return;
    }

    setSegundosRespuesta(15);
    const t = setInterval(() => {
      setSegundosRespuesta((prev) => {
        if (prev <= 0.1) {
          clearInterval(t);
          if (soyElQueHaPulsado) {
            handleTiempoAgotadoOnline();
          }
          return 0;
        }
        return Math.max(0, prev - 0.1);
      });
    }, 100);

    return () => clearInterval(t);
  }, [alguienHaPulsado, soyElQueHaPulsado]);

  const handleCrear = async () => {
    if (!nombre.trim()) return;
    setErrorMsg('');
    setCargando(true);
    try {
      const res = await fetch('/api/rasgos/online/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear sala.');

      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_RASGOS, JSON.stringify(nueva));
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
      const res = await fetch('/api/rasgos/online/unirse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codigoInput.trim().toUpperCase(), nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al unirse.');

      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_RASGOS, JSON.stringify(nueva));
      setSesion(nueva);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleIniciarJuego = async () => {
    if (!sesion) return;
    try {
      await fetch(`/api/rasgos/online/sala/${sesion.code}/iniciar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token })
      });
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handlePulsarRojo = async () => {
    if (!sesion) return;
    try {
      setMiTexto('');
      setSegundosRespuesta(15);
      await fetch(`/api/rasgos/online/sala/${sesion.code}/pulsar`, {
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
    fetch(`/api/rasgos/online/sala/${sesion.code}/teclear`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: sesion.token, texto: val })
    }).catch(() => {});
  };

  const handleEnviarRespuesta = async (e) => {
    if (e) e.preventDefault();
    if (!miTexto.trim() || !sesion) return;
    try {
      await fetch(`/api/rasgos/online/sala/${sesion.code}/responder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token, respuesta: miTexto })
      });
      setMiTexto('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSiguienteRonda = async () => {
    if (!sesion) return;
    try {
      setMiTexto('');
      await fetch(`/api/rasgos/online/sala/${sesion.code}/siguiente-ronda`, {
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
      await fetch(`/api/rasgos/online/sala/${sesion.code}/reiniciar`, {
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
        await fetch(`/api/rasgos/online/sala/${sesion.code}/salir`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: sesion.token })
        });
      } catch {
        /* ignorar */
      }
    }
    sessionStorage.removeItem(CLAVE_SESION_RASGOS);
    setSesion(null);
    setSala(null);
    setVista('online_menu');
  };

  const copiarCodigo = () => {
    if (!sala?.code) return;
    navigator.clipboard?.writeText(sala.code);
    setCodigoCopiado(true);
    setTimeout(() => setCodigoCopiado(false), 2000);
  };


  return (
    <div className="aprox-contenedor">
      
      {/* ---------------- BOTÓN Y MODAL DE AYUDA ---------------- */}

      {modalAyuda && (
        <div className="rg-modal-fondo" onClick={() => setModalAyuda(false)}>
          <div className="rg-modal modal-ayuda-juego" onClick={(e) => e.stopPropagation()}>
            <div className="modal-ayuda-header">
              <span className="modal-ayuda-signo-title">?</span>
              <h3>¿Cómo se juega a Rasgos de Famosos?</h3>
            </div>
            <div className="modal-ayuda-cuerpo">
              <p><strong>1. Dinámica del juego:</strong></p>
              <ul>
                <li>Se muestra un detalle físico recortado del rostro de un famoso.</li>
                <li>Dispones de un cronómetro de <strong>60 segundos</strong>.</li>
                <li><strong>Pulsa el botón rojo</strong> para parar el tiempo e introducir el nombre del famoso.</li>
                <li>Dispones de <strong>15 segundos</strong> para responder. Si no escribes nada, contará como fallo.</li>
              </ul>
              <p><strong>2. Puntuación:</strong></p>
              <div className="tabla-ayuda-puntos">
                <div className="fila-ayuda-puntos verde">
                  <span>⏱️ Acierto</span>
                  <strong>Suma los segundos restantes (+segundos)</strong>
                </div>
                <div className="fila-ayuda-puntos rojo">
                  <span>❌ Fallo o tiempo agotado</span>
                  <strong>Resta los segundos restantes (-segundos) y quedas fuera</strong>
                </div>
              </div>
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

      {/* 1. MENÚ PRINCIPAL */}
      {vista === 'menu' && (
        <MenuInicioJuego
          juegoId="rasgos"
          onOnline={() => { setVista('online_menu'); setErrorMsg(''); }}
          onLocal={onLocal}
          onAyuda={() => setModalAyuda(true)}
          error={errorMsg}
        />
      )}

      {vista === 'online_menu' && (
        <MenuModoOnline
          onVolver={() => { setVista('menu'); setErrorMsg(''); }}
          onCrear={() => { setVista('crear'); setErrorMsg(''); }}
          onUnirse={() => { setVista('unirse'); setErrorMsg(''); }}
          onAyuda={() => setModalAyuda(true)}
          error={errorMsg}
        />
      )}

      {/* 2. CREAR SALA */}
      {vista === 'crear' && (
        <FormCrearSala
          onVolver={() => { setVista('online_menu'); setErrorMsg(''); }}
          onAyuda={() => setModalAyuda(true)}
          nombre={nombre}
          setNombre={setNombre}
          onCrear={handleCrear}
          cargando={cargando}
          error={errorMsg}
        />
      )}

      {/* 3. UNIRSE A SALA */}
      {vista === 'unirse' && (
        <FormUnirseSala
          onVolver={() => { setVista('online_menu'); setErrorMsg(''); }}
          onAyuda={() => setModalAyuda(true)}
          codigo={codigoInput}
          setCodigo={setCodigoInput}
          nombre={nombre}
          setNombre={setNombre}
          onUnirse={handleUnirse}
          cargando={cargando}
          error={errorMsg}
        />
      )}

      {/* 4. SALA: LOBBY */}
      {vista === 'sala' && sala && sala.estado === 'lobby' && (
        <section className="game qq-pantalla">
          <CabeceraSala codigo={sala.code} onVolver={() => setModalSalir(true)} onAyuda={() => setModalAyuda(true)} />

          <div className="panel qq-menu-panel" style={{ marginTop: '1rem' }}>
            <h3 className="qq-sala-titulo"><Icon name="users" size={20} /> Jugadores ({sala.jugadores.length}/15)</h3>
            <div className="lb-lista qq-sala-lista">
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

          {errorMsg && <p className="error" style={{ margin: '0.8rem 0' }}>{errorMsg}</p>}

          {esAdmin ? (
            <button
              className="big full qq-btn-principal"
              style={{ marginTop: '1.2rem' }}
              disabled={sala.jugadores.length < 2}
              onClick={handleIniciarJuego}
            >
              <Icon name="play" size={22} />
              {sala.jugadores.length < 2 ? 'Esperando rivales (mínimo 2)...' : '¡Empezar Partida!'}
            </button>
          ) : (
            <div className="panel center qq-menu-panel" style={{ padding: '2rem 1.5rem', marginTop: '1rem' }}>
              <span className="lb-luna chica"><Icon name="hourglass" size={40} /></span>
              <h3 style={{ margin: '0.5rem 0' }}>Esperando al anfitrión...</h3>
              <p className="hint">En cuanto empiece la partida, aparecerá el rasgo recortado.</p>
            </div>
          )}

        </section>
      )}

      {/* 5. SALA: PODIO FINAL */}
      {vista === 'sala' && sala && sala.estado === 'podio' && (
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
            <button className="secondary danger full" onClick={() => setModalSalir(true)}>
              <Icon name="door" size={20} /> Salir al menú principal
            </button>
          </div>
        </section>
      )}

      {/* 6. SALA: JUGANDO ONLINE */}
      {vista === 'sala' && sala && sala.estado === 'jugando' && ronda && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="flagFinish" size={18} />Ronda {sala.rondaIdx + 1} de {sala.totalRondas}</span>
          </div>

          <div className="scoreboard-container" style={{ justifyContent: 'center' }}>
            {sala.jugadores.map((j) => (
              <div key={j.id} className={`score-pill ${j.bloqueado ? 'locked' : ''}`}>
                <span>{j.nombre}: <strong>{j.puntos} pts</strong></span>
                {j.bloqueado && <span style={{ marginLeft: '4px' }}>❌</span>}
              </div>
            ))}
          </div>

          <div className="rg-foto">
            {ronda.estadoRonda === 'activa' ? (
              <img
                src={`/api/rasgos/online/sala/${sala.code}/imagen?r=${sala.rondaIdx}`}
                alt="Detalle físico de un famoso"
                draggable={false}
              />
            ) : (
              <img
                className="rg-reveal-foto"
                src={`/api/rasgos/online/sala/${sala.code}/foto?r=${sala.rondaIdx}`}
                alt="Foto completa"
              />
            )}
          </div>

          <div className="timer" role="timer">
            <div
              className={`timer-bar ${ronda.segundosRestantes <= 10 ? 'low' : ''}`}
              style={{ width: `${(ronda.segundosRestantes / 60) * 100}%` }}
            />
          </div>
          <p className="timer-text">
            <Icon name="clock" size={16} />
            {Math.ceil(ronda.segundosRestantes)} s
          </p>

          {ronda.estadoRonda === 'activa' ? (
            <div className="interactive-controls" style={{ marginTop: '0.8rem' }}>
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
                </div>
              )}

              {soyElQueHaPulsado && (
                <form onSubmit={handleEnviarRespuesta} className="respuesta-pulsada-box">
                  <div className="respuesta-pulsada-header">
                    <span className="pulsado-badge">🔴 ¡Has pulsado! Tiempo detenido (+{Math.ceil(ronda.segundosRestantes)} pts)</span>
                    <p className="hint small" style={{ margin: '0.3rem 0 0.4rem' }}>
                      Escribe el nombre del famoso. Los demás ven lo que escribes en directo:
                    </p>

                    {/* Temporizador de 15 segundos */}
                    <div
                      className="timer"
                      role="timer"
                      style={{
                        margin: '0.6rem 0 0.3rem',
                        background: '#e2e8f0',
                        borderRadius: '9999px',
                        height: '8px',
                        overflow: 'hidden'
                      }}
                    >
                      <div
                        className={`timer-bar ${segundosRespuesta <= 4 ? 'low' : ''}`}
                        style={{
                          width: `${(segundosRespuesta / 15) * 100}%`,
                          height: '100%',
                          backgroundColor: segundosRespuesta <= 4 ? '#ef4444' : '#16a34a',
                          borderRadius: '9999px',
                          transition: 'width 0.1s linear, background-color 0.3s ease'
                        }}
                      />
                    </div>
                    <p
                      className="timer-text"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem',
                        color: segundosRespuesta <= 4 ? '#dc2626' : '#64748b',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        margin: '0 0 0.8rem'
                      }}
                    >
                      <Icon name="clock" size={16} />
                      {Math.ceil(segundosRespuesta)} s
                    </p>
                  </div>

                  <div className="answer-form">
                    <input
                      autoFocus
                      type="text"
                      className="player-text-input respuesta-input-grande"
                      placeholder="Nombre del famoso..."
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

              {alguienHaPulsado && !soyElQueHaPulsado && (
                <div className="online-tecleo-preview-card">
                  <div className="online-tecleo-header">
                    <span className="pulsador-icono">🔴</span>
                    <strong>¡{ronda.pulsado.nombre} ha pulsado el botón!</strong>
                  </div>
                  <p className="hint small" style={{ margin: '0.4rem 0 0.4rem' }}>
                    Tiempo detenido. Está escribiendo su respuesta en directo:
                  </p>

                  {/* Temporizador de 15 segundos visible para los rivales */}
                  <div
                    className="timer"
                    role="timer"
                    style={{
                      margin: '0.6rem 0 0.3rem',
                      background: '#e2e8f0',
                      borderRadius: '9999px',
                      height: '8px',
                      overflow: 'hidden'
                    }}
                  >
                    <div
                      className={`timer-bar ${segundosRespuesta <= 4 ? 'low' : ''}`}
                      style={{
                        width: `${(segundosRespuesta / 15) * 100}%`,
                        height: '100%',
                        backgroundColor: segundosRespuesta <= 4 ? '#ef4444' : '#16a34a',
                        borderRadius: '9999px',
                        transition: 'width 0.1s linear, background-color 0.3s ease'
                      }}
                    />
                  </div>
                  <p
                    className="timer-text"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem',
                      color: segundosRespuesta <= 4 ? '#dc2626' : '#64748b',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      margin: '0 0 0.8rem'
                    }}
                  >
                    <Icon name="clock" size={16} />
                    {Math.ceil(segundosRespuesta)} s
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
              <p className="rg-nombre-famoso">{ronda.solucion}</p>

              {ronda.attribution && (
                <p className="rg-atribucion">
                  Foto original por{' '}
                  <a href={ronda.attribution.fuenteUrl} target="_blank" rel="noopener noreferrer">
                    {ronda.attribution.autor}
                  </a>{' '}
                  (Wikimedia Commons), bajo licencia{' '}
                  <a href={ronda.attribution.licenciaUrl} target="_blank" rel="noopener noreferrer">
                    {ronda.attribution.licencia}
                  </a>.
                </p>
              )}

              <div className={`status-alert ${ronda.mensaje?.tipo || 'info'}`} style={{ margin: '1rem 0' }}>
                {ronda.mensaje?.texto || `El famoso era: ${ronda.solucion}`}
              </div>

              {esAdmin ? (
                <div className="round-finished-actions">
                  {sala.rondaIdx + 1 < sala.totalRondas ? (
                    <button className="btn-start" onClick={handleSiguienteRonda}>
                      Siguiente Ronda ➔
                    </button>
                  ) : (
                    <button className="btn-start" onClick={handleSiguienteRonda}>
                      Ver Puntuaciones Finales 🏆
                    </button>
                  )}
                </div>
              ) : (
                <p className="hint center">Esperando a que el anfitrión avance de ronda...</p>
              )}
            </div>
          )}

          <div className="actions" style={{ marginTop: '1.2rem' }}>
            <button className="secondary danger full" onClick={() => setModalSalir(true)}>
              <Icon name="door" size={20} /> Salir de la sala
            </button>
          </div>
        </section>
      )}

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