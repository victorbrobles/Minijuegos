// client/src/games/Trayectoria/TrayectoriaOnline.jsx
import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../components/Icon.jsx';
import './Trayectoria.css';

const CLAVE_SESION_TRAY = 'trayectoria_online_session';

export default function TrayectoriaOnline({ onLocal, onSalir }) {
  const [vista, setVista] = useState('menu'); // 'menu' | 'crear' | 'unirse' | 'sala'
  const [nombre, setNombre] = useState('');
  const [codigoInput, setCodigoInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);

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
  const [modalPistaAbierto, setModalPistaAbierto] = useState(false);

  const intervalRef = useRef(null);

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

  // Pulsador rojo en online
  const handlePulsarRojo = async () => {
    if (!sesion) return;
    try {
      setMiTexto('');
      await fetch(`/api/trayectoria/online/sala/${sesion.code}/pulsar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token })
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Envío en tiempo real del tecleo
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
    e.preventDefault();
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
  const estoyBloqueado = Boolean(sala?.jugadores?.find((j) => j.id === yoId)?.bloqueado);

  return (
    <div className="aprox-contenedor">
      {/* 1. MENÚ PRINCIPAL (ESTILO 1:1 CON LOBOS Y QUIÉN ES QUIÉN) */}
      {vista === 'menu' && (
        <section className="game">
          <div className="panel center">
            <span className="lb-luna chica">
              <span style={{ fontSize: '2.4rem' }}>⚽</span>
            </span>
            <h1 className="title">Trayectoria</h1>
            <p className="hint">
              Adivina el futbolista por los clubes de su carrera. El anfitrión crea la partida y comparte el código.
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
              <label className="field-label" htmlFor="tray-host-nombre">Tu nombre</label>
              <input
                id="tray-host-nombre"
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
              <label className="field-label" htmlFor="tray-code-input">Código de la sala</label>
              <input
                id="tray-code-input"
                className="lb-input-codigo"
                type="text"
                placeholder="ABCD"
                value={codigoInput}
                onChange={(e) => setCodigoInput(e.target.value.toUpperCase())}
                maxLength={4}
                style={{ textTransform: 'uppercase', letterSpacing: '4px', textAlign: 'center', fontWeight: '800' }}
                autoFocus
              />

              <label className="field-label" htmlFor="tray-guest-nombre" style={{ marginTop: '1rem' }}>Tu nombre</label>
              <input
                id="tray-guest-nombre"
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
              <p className="hint">En cuanto comience la partida, verás los clubes aparecer en pantalla.</p>
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
              <button className="btn-secondary-action" onClick={handleSalir}>
                Salir de la sala
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 6. SALA: JUGANDO ONLINE */}
      {vista === 'sala' && sala && sala.estado === 'jugando' && ronda && (
        <div className="trayectoria-container">
          {/* Marcador superior */}
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

            {/* Barra de progreso */}
            <div className="progress-bar-container">
              <div
                className="progress-bar-fill"
                style={{ width: ronda.estadoRonda === 'activa' && !ronda.estaPausado ? `${(ronda.segundosRestantes / 5) * 100}%` : '0%' }}
              />
            </div>

            {/* Clubes en pantalla */}
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

            {/* ZONA DEL PULSADOR Y RESPUESTA ONLINE */}
            {ronda.estadoRonda === 'activa' ? (
              <div className="interactive-controls">
                {/* 1. NADIE HA PULSADO: PULSADOR DISPONIBLE */}
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

                {/* 2. YO HE PULSADO: VEO EL INPUT Y RESPONDO */}
                {soyElQueHaPulsado && (
                  <form onSubmit={handleEnviarRespuesta} className="respuesta-pulsada-box">
                    <div className="respuesta-pulsada-header">
                      <span className="pulsado-badge">🔴 ¡Has pulsado! Tiempo detenido</span>
                      <p className="hint small" style={{ margin: '0.3rem 0 0.8rem' }}>
                        Escribe el nombre del futbolista. Los demás están viendo lo que escribes en directo:
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

                {/* 3. OTRO JUGADOR HA PULSADO: VEO LO QUE ESCRIBE EN DIRECTO SIN PODER TOCAR NADA */}
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

          {/* Modal de pista revelada online */}
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
            <button className="secondary danger full" onClick={handleSalir}>
              <Icon name="door" size={20} /> Salir de la sala
            </button>
          </div>
        </div>
      )}
    </div>
  );
}