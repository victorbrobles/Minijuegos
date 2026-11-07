// client/src/games/Trayectoria/TrayectoriaOnline.jsx
import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../components/Icon.jsx';
import './Trayectoria.css';
import { MenuInicioJuego, MenuModoOnline, FormCrearSala, FormUnirseSala, CabeceraSala } from '../../components/MenuJuego.jsx';

const CLAVE_SESION_TRAY = 'trayectoria_online_session';

export default function TrayectoriaOnline({ onLocal, onSalir }) {
  const [vista, setVista] = useState('menu'); // 'menu' | 'crear' | 'unirse' | 'sala'
  const [nombre, setNombre] = useState('');
  const [codigoInput, setCodigoInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);
  const [modalSalir, setModalSalir] = useState(false);
  const [modalAyuda, setModalAyuda] = useState(false);

  const [sesion, setSesion] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(CLAVE_SESION_TRAY));
    } catch {
      return null;
    }
  });

  const [sala, setSala] = useState(null);
  const [codigoCopiado, setCodigoCopiado] = useState(false);
  const [miTexto, setMiTexto] = useState('');
  const [segundosRespuesta, setSegundosRespuesta] = useState(15);
  const [modalPistaAbierto, setModalPistaAbierto] = useState(false);

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
      fetch(`/api/trayectoria/online/sala/${sesion.code}?token=${sesion.token}`)
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
          sessionStorage.removeItem(CLAVE_SESION_TRAY);
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
      await fetch(`/api/trayectoria/online/sala/${sesion.code}/responder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token, respuesta: texto || '-' })
      });
      setMiTexto('');
    } catch (err) {
      console.error(err);
    }
  };

  // Temporizador de 15 segundos cuando alguien pulsa para responder
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
      const res = await fetch('/api/trayectoria/online/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear la sala.');

      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_TRAY, JSON.stringify(nueva));
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
      const res = await fetch('/api/trayectoria/online/unirse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codigoInput.trim().toUpperCase(), nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al unirse.');

      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_TRAY, JSON.stringify(nueva));
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
      await fetch(`/api/trayectoria/online/sala/${sesion.code}/iniciar`, {
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
      await fetch(`/api/trayectoria/online/sala/${sesion.code}/pulsar`, {
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
    fetch(`/api/trayectoria/online/sala/${sesion.code}/teclear`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: sesion.token, texto: val })
    }).catch(() => {});
  };

  const handleEnviarRespuesta = async (e) => {
    if (e) e.preventDefault();
    if (!miTexto.trim() || !sesion) return;
    try {
      await fetch(`/api/trayectoria/online/sala/${sesion.code}/responder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token, respuesta: miTexto })
      });
      setMiTexto('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleAbrirPista = async () => {
    if (!sesion) return;
    try {
      await fetch(`/api/trayectoria/online/sala/${sesion.code}/pista`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token })
      });
      setModalPistaAbierto(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRendirse = async () => {
    if (!sesion) return;
    try {
      await fetch(`/api/trayectoria/online/sala/${sesion.code}/rendirse`, {
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
    try {
      setMiTexto('');
      await fetch(`/api/trayectoria/online/sala/${sesion.code}/siguiente-ronda`, {
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
      await fetch(`/api/trayectoria/online/sala/${sesion.code}/reiniciar`, {
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
        await fetch(`/api/trayectoria/online/sala/${sesion.code}/salir`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: sesion.token })
        });
      } catch {
        /* ignorar */
      }
    }
    sessionStorage.removeItem(CLAVE_SESION_TRAY);
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
      {/* ---------------- NUEVO: BOTÓN Y MODAL DE AYUDA ---------------- */}

      {modalAyuda && (
        <div className="rg-modal-fondo" onClick={() => setModalAyuda(false)}>
          <div className="rg-modal modal-ayuda-juego" onClick={(e) => e.stopPropagation()}>
            <div className="modal-ayuda-header">
              <span className="modal-ayuda-signo-title">?</span>
              <h3>¿Cómo se juega a Trayectoria?</h3>
            </div>
            <div className="modal-ayuda-cuerpo">
              <p><strong>1. Dinámica del juego:</strong></p>
              <ul>
                <li>Se revelan uno a uno los clubes de fútbol de la carrera de un futbolista.</li>
                <li>Cada 5 segundos aparece un nuevo club cronológico.</li>
                <li><strong>Pulsa el botón rojo</strong> para parar el tiempo e introducir el futbolista.</li>
                <li>Dispones de <strong>15 segundos</strong> para responder. Si no escribes nada, contará como fallo.</li>
                <li>Si fallas, pierdes 1 punto y quedas bloqueado el resto de la ronda.</li>
              </ul>
              <p><strong>2. Puntuación:</strong></p>
              <div className="tabla-ayuda-puntos">
                <div className="fila-ayuda-puntos verde">
                  <span>⚡ Acierto antes del último club</span>
                  <strong>+4 puntos</strong>
                </div>
                <div className="fila-ayuda-puntos azul">
                  <span>⚽ Acierto con todos los clubes</span>
                  <strong>+2 puntos</strong>
                </div>
                <div className="fila-ayuda-puntos amarillo">
                  <span>💡 Acierto tras ver la pista</span>
                  <strong>+1 punto</strong>
                </div>
                <div className="fila-ayuda-puntos rojo">
                  <span>❌ Respuesta incorrecta o tiempo agotado</span>
                  <strong>-1 punto</strong>
                </div>
              </div>
            </div>
            <div className="rg-modal-acciones">
              <button className="btn-start" style={{ width: '100%' }} onClick={() => setModalAyuda(false)}>
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
          juegoId="trayectoria"
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
            <h3 className="qq-sala-titulo"><Icon name="users" size={20} /> Jugadores ({sala.jugadores.length})</h3>
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
            <div className="panel center qq-menu-panel" style={{ padding: '2rem 1.5rem', marginTop: '1rem' }}>
              <span className="lb-luna chica"><Icon name="hourglass" size={40} /></span>
              <h3 style={{ margin: '0.5rem 0' }}>Esperando al anfitrión...</h3>
              <p className="hint">En cuanto comience la partida, verás los clubes aparecer en pantalla.</p>
            </div>
          )}

        </section>
      )}

      {/* 5. SALA: PODIO FINAL */}
      {vista === 'sala' && sala && sala.estado === 'podio' && (
        <section className="game">
          <div className="game-setup-white-card">
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.8rem', color: '#0f172a', margin: '0 0 0.5rem 0' }}>🏆 Resultados Finales</h2>
              <p style={{ color: '#64748b' }}>Partida online completada.</p>
            </div>

            <table className="results-table">
              <thead>
                <tr>
                  <th>Puesto</th>
                  <th>Jugador</th>
                  <th style={{ textAlign: 'right' }}>Puntuación</th>
                </tr>
              </thead>
              <tbody>
                {[...sala.jugadores].sort((a, b) => b.puntos - a.puntos).map((j, idx) => (
                  <tr key={j.id} className={idx === 0 ? 'row-winner' : ''}>
                    <td className="pos-col">
                      {idx === 0 ? '🥇 1º' : idx === 1 ? '🥈 2º' : idx === 2 ? '🥉 3º' : `${idx + 1}º`}
                    </td>
                    <td style={{ fontWeight: 600 }}>{j.nombre} {j.id === yoId ? '(Tú)' : ''}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: j.puntos >= 0 ? '#15803d' : '#b91c1c' }}>
                      {j.puntos} pts
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="actions" style={{ marginTop: '2rem' }}>
              {esAdmin && (
                <button className="btn-start" onClick={handleReiniciarPartida}>
                  Otra Partida
                </button>
              )}
              <button className="btn-secondary-action" onClick={() => setModalSalir(true)}>
                Salir de la sala
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 6. SALA: JUGANDO ONLINE */}
      {vista === 'sala' && sala && sala.estado === 'jugando' && ronda && (
        <div className="trayectoria-container">
          <div className="scoreboard-container">
            {sala.jugadores.map((j) => (
              <div key={j.id} className={`score-pill ${j.bloqueado ? 'locked' : ''}`}>
                <span>{j.nombre}: <strong>{j.puntos} pts</strong></span>
                {j.bloqueado && <span style={{ marginLeft: '4px' }}>❌</span>}
              </div>
            ))}
          </div>

          <div className="game-card-content">
            <div className="round-header">
              <span><strong>Ronda {sala.retoActualIdx + 1}</strong> de {sala.totalRetos}</span>
              <span style={{ textTransform: 'capitalize', color: '#64748b', fontWeight: 600 }}>
                Dificultad: {ronda.dificultad}
              </span>
            </div>

            <div className="progress-bar-container">
              <div
                className="progress-bar-fill"
                style={{ width: ronda.estadoRonda === 'activa' && !ronda.estaPausado ? `${(ronda.segundosRestantes / 5) * 100}%` : '0%' }}
              />
            </div>

            <div className="clubs-container">
              {ronda.clubesRevelados.map((club, idx) => (
                <div key={idx} className="club-badge-card">
                  <div className="club-badge-image-wrap">
                    {club.logo ? (
                      <img
                        src={club.logo}
                        alt={club.nombre}
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          if (e.currentTarget.nextElementSibling) {
                            e.currentTarget.nextElementSibling.style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <div
                      className="club-fallback-badge"
                      style={{ display: club.logo ? 'none' : 'flex' }}
                    >
                      {club.nombre.substring(0, 3).toUpperCase()}
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9rem', marginTop: '0.4rem' }}>
                    {club.nombre}
                  </div>
                  <small style={{ color: '#64748b' }}>{club.periodo}</small>
                </div>
              ))}
            </div>

            {ronda.estadoRonda === 'activa' ? (
              <div className="interactive-controls">
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

                    <div className="pulsador-secundarios">
                      {ronda.hayPista && ronda.clubesRevelados.length >= ronda.totalClubes && (
                        <button
                          type="button"
                          className={`btn-hint ${ronda.pistaRevelada ? 'hint-used' : ''}`}
                          onClick={handleAbrirPista}
                        >
                          💡 Pista {ronda.pistaRevelada ? '(Vista)' : ''}
                        </button>
                      )}

                      {esAdmin && ronda.clubesRevelados.length >= ronda.totalClubes && (
                        <button type="button" className="btn-giveup" onClick={handleRendirse}>
                          Rendirse (Anfitrión)
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {soyElQueHaPulsado && (
                  <form onSubmit={handleEnviarRespuesta} className="respuesta-pulsada-box">
                    <div className="respuesta-pulsada-header">
                      <span className="pulsado-badge">🔴 ¡Has pulsado! Tiempo detenido</span>
                      <p className="hint small" style={{ margin: '0.3rem 0 0.4rem' }}>
                        Escribe el nombre del futbolista. Los demás están viendo lo que escribes en directo:
                      </p>

                      {/* Temporizador de 15 segundos estilo RasgosOnline */}
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
                        placeholder="Nombre del futbolista..."
                        value={miTexto}
                        onChange={(e) => handleCambioTexto(e.target.value)}
                      />
                      <button
                        type="submit"
                        className="btn-start"
                        disabled={!miTexto.trim()}
                      >
                        Enviar
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
                <div className={`status-alert ${ronda.solucion ? 'info' : 'error'}`} style={{ fontSize: '1.05rem', margin: '0 0 1.25rem 0' }}>
                  Futbolista: <strong>{ronda.solucion}</strong>
                </div>

                {esAdmin ? (
                  <div className="round-finished-actions">
                    {sala.retoActualIdx + 1 < sala.totalRetos ? (
                      <button className="btn-start" onClick={handleSiguienteRonda}>
                        Siguiente Ronda ➔
                      </button>
                    ) : (
                      <button className="btn-start" onClick={handleSiguienteRonda}>
                        Ver Resultados Finales 🏆
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="hint center">Esperando a que el anfitrión avance de ronda...</p>
                )}
              </div>
            )}
          </div>

          {modalPistaAbierto && ronda.pistaTexto && (
            <div className="modal-backdrop">
              <div className="modal-content-card modal-hint-card">
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>💡</div>
                <h3 style={{ color: '#b45309' }}>Pista Revelada</h3>
                <p className="hint-text-box">{ronda.pistaTexto}</p>
                <small style={{ color: '#92400e', fontWeight: 600 }}>
                  * Al haber revelado la pista, acertar otorgará 1 punto.
                </small>
                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                  <button className="btn-start" onClick={() => setModalPistaAbierto(false)}>
                    Entendido
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="actions" style={{ marginTop: '1rem' }}>
            <button className="secondary danger full" onClick={() => setModalSalir(true)}>
              <Icon name="door" size={20} /> Salir de la sala
            </button>
          </div>
        </div>
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