import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../components/Icon.jsx';
import './Trescientosuno.css';

const CLAVE_SESION_trescientosuno = 'trescientosuno_online_session';

export default function TrescientosunoOnline({ onLocal, onSalir }) {
  const [vista, setVista] = useState('menu'); 
  const [nombre, setNombre] = useState('');
  const [codigoInput, setCodigoInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);
  
  const [modalSalir, setModalSalir] = useState(false);
  const [modalAyuda, setModalAyuda] = useState(false);
  
  const [sesion, setSesion] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(CLAVE_SESION_trescientosuno));
    } catch {
      return null;
    }
  });

  const [sala, setSala] = useState(null);
  const [codigoCopiado, setCodigoCopiado] = useState(false);

  const intervalRef = useRef(null);

  // Elección de equipo y reglas (solo el anfitrión)
  const [equipos, setEquipos] = useState([]);
  const [equipoSel, setEquipoSel] = useState(null);
  const [estadisticaSel, setEstadisticaSel] = useState('goles');
  const [objetivoSel, setObjetivoSel] = useState(301);

  // Turno propio
  const [inputJugador, setInputJugador] = useState('');
  const [errorJuego, setErrorJuego] = useState('');
  const [enviando, setEnviando] = useState(false);

  // Polling para mantener sincronizada la sala online
  useEffect(() => {
    if (!sesion) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setSala(null);
      return;
    }

    const consultarEstado = () => {
      fetch(`/api/trescientosuno/online/sala/${sesion.code}?token=${sesion.token}`)
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
          sessionStorage.removeItem(CLAVE_SESION_trescientosuno);
          setSesion(null);
          setSala(null);
          setVista('menu');
          setErrorMsg('La sala se ha cerrado o se ha perdido la conexión.');
        });
    };

    consultarEstado();
    intervalRef.current = setInterval(consultarEstado, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sesion]);

  const llamar = async (ruta, body = {}) => {
    const res = await fetch(`/api/trescientosuno/online/sala/${sesion.code}/${ruta}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: sesion.token, ...body })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'No se ha podido completar la acción.');
    return data;
  };

  const accionAdmin = async (ruta, body) => {
    setErrorMsg('');
    setCargando(true);
    try {
      await llamar(ruta, body);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setCargando(false);
    }
  };

  // El anfitrión necesita la lista de equipos cuando llega a la fase de configuración
  const estadoSala = sala?.estado;
  useEffect(() => {
    if (estadoSala !== 'configuracion' || equipos.length > 0) return;
    fetch('/api/trescientosuno/equipos')
      .then((r) => r.json())
      .then((d) => { if (d.success) setEquipos(d.equipos); })
      .catch(() => setErrorMsg('No se han podido cargar los equipos.'));
  }, [estadoSala, equipos.length]);

  // Al cambiar de turno se limpia lo escrito
  const turnoId = sala?.turnoActualId;
  useEffect(() => { setInputJugador(''); setErrorJuego(''); }, [turnoId, estadoSala]);

  const enviarJugador = async (e) => {
    e.preventDefault();
    if (!inputJugador.trim() || enviando) return;
    setEnviando(true);
    setErrorJuego('');
    try {
      await llamar('jugar', { nombreJugador: inputJugador });
      setInputJugador('');
    } catch (err) {
      setErrorJuego(err.message);
    } finally {
      setEnviando(false);
    }
  };

  const plantarse = async () => {
    if (enviando) return;
    setEnviando(true);
    setErrorJuego('');
    try {
      await llamar('plantarse');
    } catch (err) {
      setErrorJuego(err.message);
    } finally {
      setEnviando(false);
    }
  };

  const handleCrear = async () => {
    if (!nombre.trim()) return;
    setErrorMsg('');
    setCargando(true);
    try {
      const res = await fetch('/api/trescientosuno/online/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear la sala.');

      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_trescientosuno, JSON.stringify(nueva));
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
      const res = await fetch('/api/trescientosuno/online/unirse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codigoInput.trim().toUpperCase(), nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al unirse.');

      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_trescientosuno, JSON.stringify(nueva));
      setSesion(nueva);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleSalir = async () => {
    if (sesion) {
      try {
        await fetch(`/api/trescientosuno/online/sala/${sesion.code}/salir`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: sesion.token })
        });
      } catch {
        /* ignorar fallo */
      }
    }
    sessionStorage.removeItem(CLAVE_SESION_trescientosuno);
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

  const esAdmin = Boolean(sala?.esAdmin);
  const yoId = sala?.yoId;
  const mostrarAyuda = vista === 'menu' || vista === 'crear' || vista === 'unirse' || (vista === 'sala' && sala?.estado === 'lobby');

  return (
    <div className="tcu-contenedor">
      {/* ========================================================
          MODAL DE AYUDA
          ======================================================== */}
      {mostrarAyuda && (
        <button
          type="button"
          className="btn-ayuda-flotante"
          onClick={() => setModalAyuda(true)}
          title="Reglas"
        >
          <span className="btn-ayuda-flotante-signo">?</span>
        </button>
      )}

      {modalAyuda && (
        <div className="rg-modal-fondo" onClick={() => setModalAyuda(false)}>
          <div className="rg-modal modal-ayuda-juego" onClick={(e) => e.stopPropagation()}>
            <div className="modal-ayuda-header">
              <span className="modal-ayuda-signo-title">?</span>
              <h3>¿Cómo se juega a 301 Goles?</h3>
            </div>
            <div className="modal-ayuda-cuerpo">
              <p><strong>1. Dinámica del juego:</strong></p>
              <ul>
                <li>Se selecciona un equipo y una estadística a restar (Goles, Asistencias o Partidos).</li>
                <li>Por turnos, introduce el nombre de un jugador que haya estado en ese club.</li>
                <li>Se restarán de tu marcador los puntos correspondientes a ese jugador en el club.</li>
                <li>¡Cuidado! Si te pasas del 0 exacto, o nombras a alguien con 0 en esa estadística, quedas eliminado.</li>
                <li>Tienes un límite de 60 segundos por turno para responder o plantarte.</li>
              </ul>
            </div>
            <div className="rg-modal-acciones">
              <button className="btn-start" style={{ width: '100%' }} onClick={() => setModalAyuda(false)}>
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MENÚ PRINCIPAL
          ======================================================== */}
      {vista === 'menu' && (
        <section className="game">
          <div className="panel center">
            <span className="lb-luna chica"><span style={{ fontSize: '2.4rem' }}>🎯</span></span>
            <h1 className="title">301 Goles Online</h1>
            <p className="hint">Resta puntuación adivinando jugadores hasta llegar a cero sin pasarte.</p>
            {errorMsg && <p className="error" style={{ margin: '0.8rem 0' }}>{errorMsg}</p>}
            <div className="lb-menu">
              <button className="btn-start" style={{ width: '100%', marginBottom: '0.5rem' }} onClick={() => { setVista('crear'); setErrorMsg(''); }}>
                <Icon name="crown" size={22} /> Crear partida
              </button>
              <button className="btn-start" style={{ width: '100%', marginBottom: '0.5rem' }} onClick={() => { setVista('unirse'); setErrorMsg(''); }}>
                <Icon name="users" size={22} /> Unirse a partida
              </button>
              <button className="secondary full" onClick={onLocal}>
                <Icon name="home" size={20} /> Jugar en un solo dispositivo
              </button>
            </div>
          </div>
        </section>
      )}
      
      {/* ========================================================
          CREAR SALA
          ======================================================== */}
      {vista === 'crear' && (
        <section className="game">
          <div className="panel center">
            <span className="lb-luna chica">
              <Icon name="crown" size={40} strokeWidth={1.6} />
            </span>
            <h2 className="title">Crear partida</h2>
            <p className="hint">Introduce tu nombre para crear la sala y ser el anfitrión.</p>

            <div className="lb-form" style={{ marginTop: '1.2rem', textAlign: 'left' }}>
              <label className="form-label" htmlFor="tcu-host-nombre">Tu nombre</label>
              <input
                id="tcu-host-nombre"
                className="player-text-input"
                type="text"
                placeholder="Tu nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                maxLength={20}
                autoFocus
              />
              {errorMsg && <p className="error">{errorMsg}</p>}

              <button
                className="btn-start"
                style={{ width: '100%', marginTop: '1rem' }}
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

      {/* ========================================================
          UNIRSE A SALA
          ======================================================== */}
      {vista === 'unirse' && (
        <section className="game">
          <div className="panel center">
            <span className="lb-luna chica">
              <Icon name="users" size={40} strokeWidth={1.6} />
            </span>
            <h2 className="title">Unirse a partida</h2>
            <p className="hint">Introduce el código de 4 letras que te ha dado el anfitrión.</p>

            <div className="lb-form" style={{ marginTop: '1.2rem', textAlign: 'left' }}>
              <label className="form-label" htmlFor="tcu-code-input">Código de la sala</label>
              <input
                id="tcu-code-input"
                className="player-text-input"
                type="text"
                placeholder="ABCD"
                value={codigoInput}
                onChange={(e) => setCodigoInput(e.target.value.toUpperCase())}
                maxLength={4}
                style={{ textTransform: 'uppercase', letterSpacing: '4px', textAlign: 'center', fontWeight: '800' }}
                autoFocus
              />

              <label className="form-label" htmlFor="tcu-guest-nombre" style={{ marginTop: '1rem' }}>Tu nombre</label>
              <input
                id="tcu-guest-nombre"
                className="player-text-input"
                type="text"
                placeholder="Tu nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                maxLength={20}
              />
              {errorMsg && <p className="error">{errorMsg}</p>}

              <button
                className="btn-start"
                style={{ width: '100%', marginTop: '1rem' }}
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

      {/* ========================================================
          SALA DE ESPERA (LOBBY ONLINE)
          ======================================================== */}
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
                    {j.nombre}{j.id === yoId ? ' (tú)' : ''}{j.esAdmin ? ' 👑' : ''}
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
              {errorMsg && <p className="error">{errorMsg}</p>}
              <button
                className="btn-start"
                style={{ width: '100%' }}
                disabled={cargando || sala.jugadores.length < 2}
                onClick={() => accionAdmin('empezar')}
              >
                <Icon name="play" size={22} />
                {sala.jugadores.length < 2 ? 'Esperando jugadores...' : '¡Empezar juego!'}
              </button>
            </div>
          ) : (
            <div className="panel center" style={{ padding: '2rem 1.5rem', marginTop: '1rem' }}>
              <span className="lb-luna chica"><Icon name="hourglass" size={40} /></span>
              <h3 style={{ margin: '0.5rem 0' }}>Esperando al anfitrión...</h3>
              <p className="hint">El anfitrión empezará la partida cuando estéis todos.</p>
            </div>
          )}

          <div className="actions" style={{ marginTop: '1rem' }}>
            <button className="secondary danger full" onClick={() => setModalSalir(true)}>
              <Icon name="door" size={20} /> Salir de la sala
            </button>
          </div>
        </section>
      )}

      {/* ========================================================
          CONFIGURACIÓN: equipo, estadística y objetivo
          ======================================================== */}
      {vista === 'sala' && sala && sala.estado === 'configuracion' && (
        <section className="game">
          {esAdmin ? (
            <>
              <div className="panel">
                <h2 className="title center">Elige equipo y reglas</h2>
                <p className="hint center">Los jugadores tendrán que decir futbolistas de este equipo.</p>

                <div className="tcu-grid-equipos">
                  {equipos.map((eq) => (
                    <div
                      key={eq.id}
                      className={`tcu-equipo-card ${equipoSel?.id === eq.id ? 'sel' : ''}`}
                      onClick={() => setEquipoSel(eq)}
                    >
                      <div className="tcu-escudo">{eq.escudo}</div>
                      <h4>{eq.nombre}</h4>
                    </div>
                  ))}
                </div>
                {equipos.length === 0 && <p className="hint center" style={{ marginTop: '1rem' }}>Cargando equipos...</p>}

                <div className="tcu-ajustes">
                  <div className="form-group">
                    <label className="form-label" htmlFor="tcu-stat">Estadística a restar</label>
                    <div className="select-wrapper">
                      <select id="tcu-stat" className="game-select" value={estadisticaSel} onChange={(e) => setEstadisticaSel(e.target.value)}>
                        <option value="goles">Goles</option>
                        <option value="asistencias">Asistencias</option>
                        <option value="partidos">Partidos jugados</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="tcu-obj">Puntuación objetivo</label>
                    <div className="select-wrapper">
                      <select id="tcu-obj" className="game-select" value={objetivoSel} onChange={(e) => setObjetivoSel(Number(e.target.value))}>
                        <option value={101}>101</option>
                        <option value={201}>201</option>
                        <option value={301}>301</option>
                        <option value={501}>501</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {errorMsg && <p className="error">{errorMsg}</p>}
              <button
                className="big full"
                style={{ marginTop: '1rem' }}
                disabled={cargando || !equipoSel}
                onClick={() => accionAdmin('configurar', { equipoId: equipoSel.id, estadistica: estadisticaSel, objetivo: objetivoSel })}
              >
                <Icon name="play" size={24} /> {equipoSel ? `¡Comenzar con ${equipoSel.nombre}!` : 'Elige un equipo'}
              </button>
            </>
          ) : (
            <div className="panel center" style={{ padding: '2rem 1.5rem' }}>
              <span className="lb-luna chica"><Icon name="hourglass" size={40} /></span>
              <h3 style={{ margin: '0.5rem 0' }}>El anfitrión está eligiendo equipo...</h3>
              <p className="hint">La partida empezará en cuanto termine de configurarla.</p>
            </div>
          )}
          <div className="actions" style={{ marginTop: '1rem' }}>
            <button className="secondary danger full" onClick={() => setModalSalir(true)}>
              <Icon name="door" size={20} /> Salir de la sala
            </button>
          </div>
        </section>
      )}

      {/* ========================================================
          PARTIDA EN DIRECTO
          ======================================================== */}
      {vista === 'sala' && sala && sala.estado === 'jugando' && (() => {
        const stat = sala.configuracion.estadistica;
        const jTurno = sala.jugadores.find((j) => j.id === sala.turnoActualId);
        const esMiTurno = sala.turnoActualId === yoId;
        const ev = sala.evento;
        return (
          <section className="game">
            <div className="hud">
              <span className="chip"><Icon name="shield" size={18} /> {sala.equipoSeleccionado?.nombre}</span>
              <span className="chip alt">Objetivo: 0 {stat}</span>
            </div>

            <div className="tcu-marcador-grid">
              {sala.jugadores.map((j) => (
                <div
                  key={j.id}
                  className={`tcu-marcador-item ${j.id === sala.turnoActualId ? 'activo' : ''} ${j.estado}`}
                >
                  <div className="nombre">{j.nombre}{j.id === yoId ? ' (tú)' : ''}</div>
                  <div className="puntos">{j.estado === 'eliminado' ? 'X' : j.puntuacionActual}</div>
                </div>
              ))}
            </div>

            <div className="panel center tcu-turno-panel">
              {ev ? (
                <div className={`tcu-feedback ${ev.tipo}`}>{ev.mensaje}</div>
              ) : esMiTurno ? (
                <>
                  <h2 className="title">¡Es tu turno!</h2>
                  <div className="timer-bar-container">
                    <div
                      className={`timer-bar ${sala.tiempoRestante <= 10 ? 'low' : ''}`}
                      style={{ width: `${(sala.tiempoRestante / sala.tiempoTurno) * 100}%` }}
                    />
                  </div>
                  <p className="timer-text">{sala.tiempoRestante} s</p>
                  <form onSubmit={enviarJugador} className="tcu-form">
                    <input
                      type="text"
                      value={inputJugador}
                      onChange={(e) => { setInputJugador(e.target.value); setErrorJuego(''); }}
                      placeholder={`Dime un jugador del ${sala.equipoSeleccionado?.nombre}...`}
                      autoFocus
                    />
                    {errorJuego && <p className="error">{errorJuego}</p>}
                    <div className="tcu-actions">
                      <button type="submit" className="btn-start" style={{ width: '100%' }} disabled={enviando || !inputJugador.trim()}>Enviar</button>
                      <button type="button" className="secondary danger" disabled={enviando} onClick={plantarse}>Plantarse</button>
                    </div>
                  </form>
                </>
              ) : (
                <>
                  <h2 className="title">Turno de {jTurno?.nombre}</h2>
                  <div className="timer-bar-container">
                    <div
                      className={`timer-bar ${sala.tiempoRestante <= 10 ? 'low' : ''}`}
                      style={{ width: `${(sala.tiempoRestante / sala.tiempoTurno) * 100}%` }}
                    />
                  </div>
                  <p className="timer-text">{sala.tiempoRestante} s</p>
                  <p className="tcu-turno-aviso">Esperando su respuesta...</p>
                </>
              )}
            </div>

            {sala.jugadoresUsados.length > 0 && (
              <div className="tcu-usados">
                <strong>Ya dichos:</strong> {sala.jugadoresUsados.join(', ')}
              </div>
            )}

            <div className="actions" style={{ marginTop: '1rem' }}>
              <button className="secondary danger full" onClick={() => setModalSalir(true)}>
                <Icon name="door" size={20} /> Salir de la partida
              </button>
            </div>
          </section>
        );
      })()}

      {/* ========================================================
          RESULTADOS
          ======================================================== */}
      {vista === 'sala' && sala && sala.estado === 'resultados' && (() => {
        const ranking = [...sala.jugadores].sort(
          (a, b) => (a.estado === 'eliminado') - (b.estado === 'eliminado') || a.puntuacionActual - b.puntuacionActual
        );
        const mejor = ranking.find((j) => j.estado !== 'eliminado');
        return (
          <section className="game">
            <div className="end-card">
              <span className="end-icon"><Icon name="trophy" size={48} /></span>
              <h1 className="title">Fin de la partida</h1>
              <p className="final-score">
                {!mejor
                  ? 'Todos han sido eliminados.'
                  : mejor.estado === 'ganador'
                    ? `Ganador: ${mejor.nombre} (¡clavó el 0!)`
                    : `Ganador: ${mejor.nombre} (se quedó a ${mejor.puntuacionActual})`}
              </p>
              <div className="scoreboard">
                {ranking.map((j) => (
                  <div key={j.id} className="score-row">
                    <span className="score-name">{j.nombre}{j.id === yoId ? ' (tú)' : ''} {j.estado === 'plantado' && '(Plantado)'}</span>
                    <span className="score-pts">{j.estado === 'eliminado' ? 'Eliminado' : j.puntuacionActual}</span>
                  </div>
                ))}
              </div>
            </div>
            {errorMsg && <p className="error">{errorMsg}</p>}
            <div className="actions" style={{ marginTop: '1.5rem' }}>
              {esAdmin ? (
                <button disabled={cargando || sala.jugadores.length < 2} onClick={() => accionAdmin('revancha')}>
                  <Icon name="refresh" size={20} /> Jugar otro equipo
                </button>
              ) : (
                <p className="hint center">Esperando a que el anfitrión elija el siguiente equipo...</p>
              )}
              <button className="secondary danger" onClick={() => setModalSalir(true)}>
                <Icon name="door" size={20} /> Salir
              </button>
            </div>
          </section>
        );
      })()}

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