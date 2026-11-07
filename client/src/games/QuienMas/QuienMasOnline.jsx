// client/src/games/QuienMas/QuienMasOnline.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAdmin, adminHeaders } from '../../lib/admin.js';
import Icon from '../../components/Icon.jsx';
import './QuienMas.css';
import { MenuInicioJuego, MenuModoOnline, FormCrearSala, FormUnirseSala, CabeceraSala } from '../../components/MenuJuego.jsx';

const CLAVE_SESION_QM = 'quienmas_online_session';
const TIEMPO_VOTO = 30;

export default function QuienMasOnline({ onLocal, onSalir }) {
  const esAdminGlobal = useAdmin();

  const [vista, setVista] = useState('menu'); // 'menu' | 'crear' | 'unirse' | 'sala'
  const [nombre, setNombre] = useState('');
  const [codigoInput, setCodigoInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);
  const [modalSalir, setModalSalir] = useState(false);
  const [modalAyuda, setModalAyuda] = useState(false);

  const [sesion, setSesion] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(CLAVE_SESION_QM));
    } catch {
      return null;
    }
  });

  const [sala, setSala] = useState(null);
  const [codigoCopiado, setCodigoCopiado] = useState(false);
  const [tiempoRestante, setTiempoRestante] = useState(TIEMPO_VOTO);

  const intervalRef = useRef(null);
  const timerVotoRef = useRef(null);

  const salaRef = useRef(sala);
  useEffect(() => {
    salaRef.current = sala;
  }, [sala]);

  useEffect(() => {
    if (!sesion) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setSala(null);
      return;
    }

    const consultarEstado = () => {
      fetch(`/api/quienmas/online/sala/${sesion.code}?token=${sesion.token}`)
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
          sessionStorage.removeItem(CLAVE_SESION_QM);
          setSesion(null);
          setSala(null);
          setVista('online_menu');
          setErrorMsg('La sala se ha cerrado o se ha perdido la conexión.');
        });
    };

    consultarEstado();
    intervalRef.current = setInterval(consultarEstado, 600);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sesion]);

  const handleCrear = async () => {
    if (!nombre.trim()) return;
    setErrorMsg('');
    setCargando(true);
    try {
      const res = await fetch('/api/quienmas/online/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear la sala.');

      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_QM, JSON.stringify(nueva));
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
      const res = await fetch('/api/quienmas/online/unirse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codigoInput.trim().toUpperCase(), nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al unirse.');

      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_QM, JSON.stringify(nueva));
      setSesion(nueva);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleCambiarCategoria = async (cat) => {
    if (!sesion || !sala?.esAdmin) return;
    try {
      await fetch(`/api/quienmas/online/sala/${sesion.code}/categoria`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...adminHeaders() },
        body: JSON.stringify({ token: sesion.token, categoria: cat })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleIniciarPartida = async () => {
    if (!sesion) return;
    try {
      await fetch(`/api/quienmas/online/sala/${sesion.code}/iniciar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...adminHeaders() },
        body: JSON.stringify({ token: sesion.token })
      });
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleVotar = async (candidato) => {
    if (timerVotoRef.current) clearInterval(timerVotoRef.current);
    if (!sesion) return;
    try {
      await fetch(`/api/quienmas/online/sala/${sesion.code}/votar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token, candidato })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleVotarRef = useRef(handleVotar);
  useEffect(() => {
    handleVotarRef.current = handleVotar;
  });

  // Temporizador de 30 segundos durante la votación online
  useEffect(() => {
    if (sala?.estado !== 'votando' || sala?.yaVoto) {
      if (timerVotoRef.current) clearInterval(timerVotoRef.current);
      return;
    }

    setTiempoRestante(TIEMPO_VOTO);

    if (timerVotoRef.current) clearInterval(timerVotoRef.current);
    timerVotoRef.current = setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev <= 1) {
          clearInterval(timerVotoRef.current);
          const s = salaRef.current;
          if (s && s.jugadores && s.jugadores.length > 0 && !s.yaVoto) {
            const candidatos = s.jugadores.map((j) => j.nombre);
            const elegido = candidatos[Math.floor(Math.random() * candidatos.length)];
            handleVotarRef.current(elegido);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerVotoRef.current) clearInterval(timerVotoRef.current);
    };
  }, [sala?.estado, sala?.rondaNum, sala?.preguntaActual, sala?.yaVoto]);

  const handleCerrarVotacion = async () => {
    if (!sesion) return;
    try {
      await fetch(`/api/quienmas/online/sala/${sesion.code}/cerrar-votacion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSiguientePregunta = async () => {
    if (!sesion) return;
    try {
      await fetch(`/api/quienmas/online/sala/${sesion.code}/siguiente-pregunta`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleVerRanking = async () => {
    if (!sesion) return;
    try {
      await fetch(`/api/quienmas/online/sala/${sesion.code}/ver-ranking`, {
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
      await fetch(`/api/quienmas/online/sala/${sesion.code}/reiniciar`, {
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
        await fetch(`/api/quienmas/online/sala/${sesion.code}/salir`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: sesion.token })
        });
      } catch {
        /* ignorar */
      }
    }
    sessionStorage.removeItem(CLAVE_SESION_QM);
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

  const esAdmin = Boolean(sala?.esAdmin);
  const resultado = sala?.resultado;
  const ranking = [...(sala?.jugadores || [])].sort((a, b) => b.puntos - a.puntos);
  const maximoPuntos = ranking.length ? ranking[0].puntos : 0;
  const ganadores = maximoPuntos > 0 ? ranking.filter((j) => j.puntos === maximoPuntos) : [];

  // Mostrar ayuda en menús y en el lobby, desaparece al empezar a jugar

  return (
    <div className="qm-contenedor">
      {/* ---------------- BOTÓN Y MODAL DE AYUDA ---------------- */}

      {modalAyuda && (
        <div className="rg-modal-fondo" onClick={() => setModalAyuda(false)}>
          <div className="rg-modal modal-ayuda-juego" onClick={(e) => e.stopPropagation()}>
            <div className="modal-ayuda-header">
              <span className="modal-ayuda-signo-title">?</span>
              <h3>Cómo se juega a «¿De verdad os conocéis?»</h3>
            </div>

            <div className="modal-ayuda-cuerpo">
              <p><strong>1. Votación secreta:</strong></p>
              <ul>
                <li>Aparece una pregunta sobre la personalidad del grupo.</li>
                <li>Cada jugador vota <strong>en secreto</strong> al jugador que mejor encaja.</li>
                <li>Dispones de <strong>30 segundos</strong> para emitir tu voto. Si se agota el tiempo, se seleccionará un jugador al azar.</li>
              </ul>
              <p><strong>2. Puntuación:</strong></p>
              <ul>
                <li>Si votas al jugador <strong>más votado</strong>, sumas <strong>+1 punto</strong>.</li>
                <li>Si hay <strong>empate</strong> en la primera posición, <strong>nadie suma puntos</strong>.</li>
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
      {/* ---------------- FIN AYUDA ---------------- */}

      {/* 1. MENÚ PRINCIPAL */}
      {vista === 'menu' && (
        <MenuInicioJuego
          juegoId="quienmas"
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

          {/* Selector de categoría (solo disponible si el modo admin global está activado y el usuario es anfitrión) */}
          {esAdminGlobal && esAdmin && (
            <div className="panel qq-menu-panel" style={{ marginTop: '1rem' }}>
              <h3 className="qq-sala-titulo"><Icon name="dice" size={20} /> Categoría de preguntas (Admin)</h3>
              <div>
                <label className="field-label">Elige la temática para el grupo:</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    className={`pts-btn-modo ${sala.categoria === 'normal' ? 'activo' : ''}`}
                    onClick={() => handleCambiarCategoria('normal')}
                  >
                    😊 Normal (Todos los públicos)
                  </button>
                  <button
                    type="button"
                    className={`pts-btn-modo ${sala.categoria === 'picante' ? 'activo' : ''}`}
                    onClick={() => handleCambiarCategoria('picante')}
                  >
                    🌶️ Picante (Comprometidas)
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="panel qq-menu-panel" style={{ marginTop: '1rem' }}>
            <h3 className="qq-sala-titulo"><Icon name="users" size={20} /> Jugadores ({sala.jugadores.length})</h3>
            <div className="lb-lista qq-sala-lista">
              {sala.jugadores.map((j) => (
                <div key={j.id} className={`lb-jug ${j.id === sala.yoId ? 'yo' : ''}`}>
                  <span className="lb-jug-nombre">
                    {j.nombre}{j.id === sala.yoId ? ' (tú)' : ''}{j.id === 1 ? ' 👑' : ''}
                  </span>
                </div>
              ))}
            </div>
            {sala.jugadores.length < 3 && (
              <p className="hint" style={{ marginTop: '0.8rem' }}>
                Faltan al menos {3 - sala.jugadores.length} jugadores para empezar (mínimo 3).
              </p>
            )}
          </div>

          {esAdmin ? (
            <div style={{ marginTop: '1.2rem' }}>
              <button
                className="big full qq-btn-principal"
                disabled={sala.jugadores.length < 3}
                onClick={handleIniciarPartida}
              >
                <Icon name="play" size={22} />
                {sala.jugadores.length < 3 ? 'Esperando jugadores...' : '¡Empezar Partida!'}
              </button>
            </div>
          ) : (
            <div className="panel center qq-menu-panel" style={{ padding: '2rem 1.5rem', marginTop: '1rem' }}>
              <span className="lb-luna chica"><Icon name="hourglass" size={40} /></span>
              <h3 style={{ margin: '0.5rem 0' }}>Esperando al anfitrión...</h3>
              <p className="hint">En cuanto comience la partida, verás la primera pregunta para votar en secreto.</p>
            </div>
          )}

        </section>
      )}

      {/* 5. SALA: VOTANDO */}
      {vista === 'sala' && sala && sala.estado === 'votando' && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="flagFinish" size={18} />Ronda {sala.rondaNum}</span>
            <span className="chip alt">
              <Icon name="check" size={18} /> {sala.totalVotaron} / {sala.totalJugadores} han votado
            </span>
          </div>

          <div className="panel qm-pregunta">
            <h2 className="title">«{sala.preguntaActual}»</h2>

            {!sala.yaVoto ? (
              <>
                <p className="hint" style={{ margin: '0.5rem 0 0.4rem' }}>
                  Elige en secreto al jugador que más encaja con la pregunta:
                </p>

                {/* Temporizador de 30 segundos */}
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
                    className={`timer-bar ${tiempoRestante <= 10 ? 'low' : ''}`}
                    style={{
                      width: `${(tiempoRestante / TIEMPO_VOTO) * 100}%`,
                      height: '100%',
                      backgroundColor: tiempoRestante <= 10 ? '#ef4444' : '#16a34a',
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
                    color: tiempoRestante <= 10 ? '#dc2626' : '#64748b',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    margin: '0 0 1rem'
                  }}
                >
                  <Icon name="clock" size={16} />
                  {tiempoRestante} s
                </p>

                <div className="names-grid">
                  {sala.jugadores.map((j) => (
                    <button
                      key={j.id}
                      type="button"
                      className="secondary"
                      onClick={() => handleVotar(j.nombre)}
                    >
                      {j.nombre}
                      {j.id === sala.yoId && <span className="badge">Tú</span>}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ padding: '1.2rem 0' }}>
                <span className="badge" style={{ background: '#dcfce7', color: '#166534', fontSize: '1rem', padding: '0.4rem 1rem' }}>
                  ✅ Has votado a <strong>{sala.miVoto}</strong>
                </span>
                <p className="hint" style={{ marginTop: '1rem' }}>
                  Esperando a que los demás jugadores terminen de votar ({sala.totalVotaron} de {sala.totalJugadores})...
                </p>

                <div className="scoreboard-container" style={{ justifyContent: 'center', marginTop: '0.8rem' }}>
                  {sala.jugadores.map((j) => (
                    <div key={j.id} className="score-pill">
                      <span>{j.nombre}</span>
                      <span style={{ marginLeft: '6px' }}>{j.haVotado ? '✅' : '⏳'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {esAdmin && (
            <div style={{ marginTop: '1rem' }}>
              <button className="secondary full" onClick={handleCerrarVotacion}>
                <Icon name="check" size={18} /> Cerrar votación y ver resultados ya
              </button>
            </div>
          )}

          <div className="actions" style={{ marginTop: '1.2rem' }}>
            <button className="secondary danger full" onClick={() => setModalSalir(true)}>
              <Icon name="door" size={20} /> Salir de la sala
            </button>
          </div>
        </section>
      )}

      {/* 6. SALA: RESULTADO DE LA RONDA */}
      {vista === 'sala' && sala && sala.estado === 'resultado' && resultado && (
        <section className="game">
          <div className="end-card">
            <span className="end-icon">
              <Icon name={resultado.empate ? 'hourglass' : 'trophy'} size={44} />
            </span>
            <p className="categoria"><Icon name="flagFinish" size={16} />Ronda {sala.rondaNum}</p>
            <h1 className="title">Votación de la ronda</h1>
            <p className="reveal">«{sala.preguntaActual}»</p>

            <p className="final-score" style={{ marginTop: '1rem' }}>
              {resultado.empate
                ? <>¡Empate entre {resultado.masVotados.join(' y ')}! Nadie suma puntos</>
                : <>Más votado: {resultado.ganador} ({resultado.maximo} {resultado.maximo === 1 ? 'voto' : 'votos'})</>}
            </p>

            <div className="scoreboard">
              {sala.jugadores.map((j) => {
                const n = resultado.recuento[j.nombre] || 0;
                return (
                  <div key={j.id} className={`score-row ${!resultado.empate && j.nombre === resultado.ganador ? 'first' : ''}`}>
                    <span className="score-name">{j.nombre} {j.id === sala.yoId ? '(Tú)' : ''}</span>
                    <span className="score-pts">{n} {n === 1 ? 'voto' : 'votos'}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="panel reveal-panel" style={{ marginTop: '1rem' }}>
            <h3 className="reveal-title"><Icon name="eye" size={20} /> Desglose de votos</h3>
            <div className="reveal-list">
              {sala.jugadores.map((j) => (
                <div key={j.id} className="reveal-row">
                  <span className="reveal-name">
                    {j.nombre} votó a <strong>{resultado.votos[j.nombre] || 'Nadie'}</strong>
                  </span>
                  <span className="reveal-card">
                    {resultado.ganados[j.nombre] > 0 ? '+1 pto' : '0 ptos'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="actions" style={{ marginTop: '1.2rem' }}>
            {esAdmin ? (
              <>
                <button className="big full" onClick={handleSiguientePregunta}>
                  <Icon name="play" size={20} /> Siguiente pregunta
                </button>
                <button className="secondary full" onClick={handleVerRanking}>
                  <Icon name="trophy" size={20} /> Ver clasificación general
                </button>
              </>
            ) : (
              <p className="hint center">Esperando a que el anfitrión pase a la siguiente pregunta...</p>
            )}

            <button className="secondary danger full" onClick={() => setModalSalir(true)}>
              <Icon name="door" size={20} /> Salir de la sala
            </button>
          </div>
        </section>
      )}

      {/* 7. SALA: RANKING GENERAL */}
      {vista === 'sala' && sala && sala.estado === 'ranking' && (
        <section className="game">
          <div className="end-card">
            <span className="end-icon"><Icon name="crown" size={44} /></span>
            <p className="categoria"><Icon name="flagFinish" size={16} />Rondas jugadas: {sala.rondaNum}</p>
            <h1 className="title">Puntuación total</h1>
            <p className="final-score">
              {ganadores.length === 0
                ? 'Nadie ha conseguido puntos todavía'
                : ganadores.length === 1
                ? <>¡{ganadores[0].nombre} lidera con {maximoPuntos} {maximoPuntos === 1 ? 'punto' : 'puntos'}!</>
                : <>Empate en cabeza: {ganadores.map((g) => g.nombre).join(', ')} con {maximoPuntos} pts</>}
            </p>

            <div className="scoreboard">
              {ranking.map((j, i) => {
                const lider = maximoPuntos > 0 && j.puntos === maximoPuntos;
                return (
                  <div key={j.id} className={`score-row ${lider ? 'first' : ''}`}>
                    <span className="score-name">
                      {lider ? <Icon name="crown" size={22} /> : <span className="pos">{i + 1}</span>}
                      {j.nombre} {j.id === sala.yoId ? '(Tú)' : ''}
                    </span>
                    <span className="score-pts">{j.puntos || 0} pts</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="actions" style={{ marginTop: '1.2rem' }}>
            {esAdmin ? (
              <>
                <button className="big full" onClick={handleSiguientePregunta}>
                  <Icon name="play" size={20} /> Continuar jugando (Siguiente pregunta)
                </button>
                <button className="secondary full" onClick={handleReiniciarPartida}>
                  <Icon name="refresh" size={20} /> Nueva partida (reiniciar puntos)
                </button>
              </>
            ) : (
              <p className="hint center">Esperando a que el anfitrión continúe...</p>
            )}

            <button className="secondary danger full" onClick={() => setModalSalir(true)}>
              <Icon name="door" size={20} /> Salir al menú principal
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