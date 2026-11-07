// client/src/games/FootballSplit/FootballSplitOnline.jsx
import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../components/Icon.jsx';
import './FootballSplit.css';
import '../Adivina/Adivina.css';
import { MenuInicioJuego, MenuModoOnline, FormCrearSala, FormUnirseSala, CabeceraSala, EsperandoAnfitrion } from '../../components/MenuJuego.jsx';

const CLAVE_SESION_FS = 'footballsplit_online_session';
const TIEMPO_TURNO = 120;

export default function FootballSplitOnline({ onLocal }) {
  const [vista, setVista] = useState('menu'); // 'menu' | 'crear' | 'unirse' | 'sala'
  const [nombre, setNombre] = useState('');
  const [codigoInput, setCodigoInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);

  const [inputStr, setInputStr] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [parteSeleccionada, setParteSeleccionada] = useState(null);
  
  const [pistasTexto, setPistasTexto] = useState({ top: null, middle: null, bottom: null });
  const [pistasAbiertas, setPistasAbiertas] = useState({ top: false, middle: false, bottom: false });

  const [modalAyuda, setModalAyuda] = useState(false);
  const [modalSalir, setModalSalir] = useState(false);
  const [codigoCopiado, setCodigoCopiado] = useState(false);

  const [tiempoRestante, setTiempoRestante] = useState(TIEMPO_TURNO);
  const timerRef = useRef(null);

  const [sesion, setSesion] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(CLAVE_SESION_FS));
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
      return;
    }
    const consultarEstado = () => {
      fetch(`/api/footballsplit/online/sala/${sesion.code}?token=${sesion.token}`)
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
          sessionStorage.removeItem(CLAVE_SESION_FS);
          setSesion(null);
          setSala(null);
          setVista('online_menu');
        });
    };
    consultarEstado();
    intervalRef.current = setInterval(consultarEstado, 800);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sesion]);

  // Limpiar pistas locales cuando cambia el reto
  useEffect(() => {
    setPistasTexto({ top: null, middle: null, bottom: null });
    setPistasAbiertas({ top: false, middle: false, bottom: false });
    setParteSeleccionada(null);
  }, [sala?.retoActual?.id]);

  const apiFetch = async (endpoint, payload) => {
    const res = await fetch(`/api/footballsplit/online/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  };

  const handleCrear = async () => {
    if (!nombre.trim()) return;
    setCargando(true);
    try {
      const data = await apiFetch('crear', { nombre: nombre.trim() });
      if (!data.success) throw new Error(data.error);
      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_FS, JSON.stringify(nueva));
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
      const data = await apiFetch('unirse', { code: codigoInput.trim().toUpperCase(), nombre: nombre.trim() });
      if (!data.success) throw new Error(data.error);
      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_FS, JSON.stringify(nueva));
      setSesion(nueva);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setCargando(false);
    }
  };

  const accionSala = async (accion, extra = {}) => {
    return apiFetch(`sala/${sesion.code}/${accion}`, { token: sesion.token, ...extra });
  };

  const handleSalir = () => {
    if (sala) {
      accionSala('abandonar').catch(() => console.error('Error al abandonar sala'));
    }
    sessionStorage.removeItem(CLAVE_SESION_FS);
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

  const esAdmin = sala?.esAdmin;
  const esMiTurno = sala?.turnoId === sala?.yoId;
  const jugadorTurnoNombre = sala?.jugadores.find((j) => j.id === sala?.turnoId)?.nombre;

  const handlePasarTurno = async () => {
    if (!esMiTurno) return;
    await accionSala('pasar-turno');
    setParteSeleccionada(null);
  };

  const pasarTurnoRef = useRef();
  useEffect(() => {
    pasarTurnoRef.current = handlePasarTurno;
  });

  useEffect(() => {
    const isJugando = sala?.estado === 'jugando';
    if (!isJugando) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    setTiempoRestante(TIEMPO_TURNO);
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          if (esMiTurno && pasarTurnoRef.current) {
            pasarTurnoRef.current();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sala?.estado, sala?.turnoId, esMiTurno]);

  const validarRespuesta = async (e) => {
    e.preventDefault();
    if (!inputStr.trim() || !esMiTurno || !parteSeleccionada) return;

    if (timerRef.current) clearInterval(timerRef.current);

    const response = await accionSala('validar', { respuesta: inputStr, parte: parteSeleccionada });
    if (response.acierto) {
      setFeedback({ tipo: 'success', msj: `¡Acierto! +${response.puntosGanados} pts` });
    } else {
      setFeedback({ tipo: 'error', msj: 'Incorrecto. Cambio de turno.' });
    }
    setInputStr('');
    setParteSeleccionada(null);
    setTimeout(() => setFeedback(null), 1500);
  };

  const togglePista = async (parte, e) => {
    e.stopPropagation();
    if (sala?.estadoReto?.[parte]) return;

    if (pistasTexto[parte]) {
      setPistasAbiertas((prev) => ({ ...prev, [parte]: !prev[parte] }));
      return;
    }

    const res = await accionSala('pista', { parte });
    const texto = res?.pista || sala?.retoActual?.partes?.[parte]?.pista;
    if (texto) {
      setPistasTexto((prev) => ({ ...prev, [parte]: texto }));
      setPistasAbiertas((prev) => ({ ...prev, [parte]: true }));
    }
  };

  const seleccionarParte = (parte) => {
    if (!esMiTurno || sala?.estadoReto?.[parte]) return;
    setParteSeleccionada(parte);
    setInputStr('');
  };

  const getEstiloImagen = (seccion) => {
    let offsetFranja = -16;
    if (seccion === 'middle') offsetFranja = -136;
    if (seccion === 'bottom') offsetFranja = -256;

    return {
      position: 'absolute',
      left: '50%',
      top: `${offsetFranja}px`,
      width: '420px',
      height: '420px',
      maxWidth: 'none',
      transform: 'translateX(-50%)',
      objectFit: 'contain',
      pointerEvents: 'none',
      userSelect: 'none'
    };
  };


  const ranking = sala?.jugadores ? [...sala.jugadores].sort((a, b) => (b.puntos || 0) - (a.puntos || 0)) : [];

  return (
    <div className="rk-contenedor">

      {modalAyuda && (
        <div className="rg-modal-fondo" onClick={() => setModalAyuda(false)}>
          <div className="rg-modal aprox-modal-ayuda" onClick={(e) => e.stopPropagation()}>
            <div className="aprox-modal-header">
              <span className="aprox-modal-signo-title">?</span>
              <h3>¿Cómo jugar a Football Split?</h3>
            </div>
            <div className="aprox-modal-cuerpo">
              <p>Se mostrará una cara formada por <strong>3 futbolistas diferentes</strong> (a 15 rondas).</p>
              <ul>
                <li>Se sortea el primer turno y se rota secuencialmente (120 s por turno).</li>
                <li><strong>Pulsa sobre la parte de la imagen</strong> a la que quieres responder para habilitar el cajón de texto.</li>
                <li>Acertar sin pista otorga <strong>5 puntos</strong>; con pista otorga <strong>1 punto</strong>.</li>
                <li>La ronda finaliza automáticamente cuando todos han tenido su turno tras un fallo o pase.</li>
              </ul>
            </div>
            <div className="rg-modal-acciones">
              <button className="big full" onClick={() => setModalAyuda(false)}>Entendido</button>
            </div>
          </div>
        </div>
      )}

      {vista === 'menu' && (
        <MenuInicioJuego
          juegoId="footballsplit"
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

      {vista === 'sala' && sala?.estado === 'lobby' && (
        <section className="game qq-pantalla">
          <CabeceraSala codigo={sala.code} onVolver={() => setModalSalir(true)} onAyuda={() => setModalAyuda(true)} />

          <div className="panel qq-menu-panel" style={{ marginTop: '1rem' }}>
            <h3 className="qq-sala-titulo">
              <Icon name="users" size={20} /> Jugadores ({sala.jugadores.length}/15)
            </h3>
            <div className="lb-lista qq-sala-lista">
              {sala.jugadores.map((j) => (
                <div key={j.id} className={`lb-jug ${j.id === sala.yoId ? 'yo' : ''}`}>
                  <span className="lb-jug-nombre">
                    {j.nombre}
                    {j.id === sala.yoId ? ' (Tú)' : ''}
                    {j.id === sala.adminId ? ' 👑' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1.2rem' }}>
            {esAdmin ? (
              <button className="big full qq-btn-principal" disabled={sala.jugadores.length < 2} onClick={() => accionSala('iniciar')}>
                <Icon name="play" size={22} /> ¡Empezar Partida (15 Rondas)!
              </button>
            ) : (
              <EsperandoAnfitrion />
            )}
          </div>
        </section>
      )}

      {vista === 'sala' && sala?.estado === 'jugando' && (
        <section className="game">
          <div className="hud space-between">
            <span className="chip">
              <Icon name="flagFinish" size={18} /> Ronda {sala.rondaActual}/{sala.maxRondas}
            </span>
            <span className="chip alt">
              <Icon name="users" size={18} /> Turno de: <strong>{jugadorTurnoNombre}</strong>
            </span>
            <button
              className="secondary danger"
              style={{ padding: '0.3rem 0.8rem', fontSize: '0.85rem' }}
              onClick={() => setModalSalir(true)}
            >
              Salir de la sala
            </button>
          </div>

          <div className="scoreboard-container" style={{ justifyContent: 'center', marginBottom: '0.6rem' }}>
            {sala.jugadores.map((j) => (
              <div key={j.id} className={`score-pill ${j.id === sala.turnoId ? 'active' : ''}`} style={{ borderColor: j.id === sala.turnoId ? '#4f46e5' : undefined }}>
                <span>{j.nombre}: <strong>{j.puntos ?? 0} pts</strong></span>
              </div>
            ))}
          </div>

          {/* Pantalla de transición evidente si no es tu turno o si quieres resaltar el turno */}
          {!esMiTurno && (
            <div style={{ background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '16px', padding: '0.8rem', textAlign: 'center', marginBottom: '0.8rem' }}>
              <p style={{ margin: 0, fontWeight: 'bold', color: '#475569' }}>⏳ Esperando tu turno. Turno actual de <strong>{jugadorTurnoNombre}</strong></p>
            </div>
          )}

          {/* Temporizador de 120s */}
          <div style={{ padding: '0 1rem', marginTop: '0.2rem' }}>
            <div
              className="timer"
              role="timer"
              style={{ margin: '0.4rem 0', background: '#e2e8f0', borderRadius: '9999px', height: '8px', overflow: 'hidden' }}
            >
              <div
                className={`timer-bar ${tiempoRestante <= 15 ? 'low' : ''}`}
                style={{
                  width: `${(tiempoRestante / TIEMPO_TURNO) * 100}%`,
                  height: '100%',
                  backgroundColor: tiempoRestante <= 15 ? '#ef4444' : '#16a34a',
                  borderRadius: '9999px',
                  transition: 'width 0.1s linear, background-color 0.3s ease'
                }}
              />
            </div>
            <p
              className="timer-text"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                color: tiempoRestante <= 15 ? '#dc2626' : '#64748b', fontSize: '0.9rem', fontWeight: 700, margin: '0 0 0.8rem'
              }}
            >
              <Icon name="clock" size={16} />
              {tiempoRestante} s
            </p>
          </div>

          <p className="hint center" style={{ marginBottom: '0.6rem', fontWeight: 700 }}>
            {parteSeleccionada ? `🎯 Respondiendo a la parte: ${parteSeleccionada === 'top' ? 'Pelo' : parteSeleccionada === 'middle' ? 'Ojos' : 'Barbilla'}` : '👉 Haz clic en una de las partes de la cara para responder'}
          </p>

          <div className="fs-split-container">
            {['top', 'middle', 'bottom'].map((p) => (
              <div
                key={p}
                className={`fs-slice ${sala.estadoReto[p] ? 'solved' : ''} ${parteSeleccionada === p ? 'selected-slice' : ''}`}
                onClick={() => seleccionarParte(p)}
                style={{ cursor: sala.estadoReto[p] ? 'default' : 'pointer', border: parteSeleccionada === p ? '3px solid #4f46e5' : undefined }}
              >
                {sala.retoActual.partes[p].img && (
                  <img
                    src={sala.retoActual.partes[p].img}
                    alt={p}
                    style={getEstiloImagen(p)}
                  />
                )}

                <button
                  type="button"
                  className="fs-slice-status"
                  disabled={sala.estadoReto[p]}
                  onClick={(e) => togglePista(p, e)}
                  title={sala.estadoReto[p] ? 'Acertado' : 'Ver pista'}
                >
                  {sala.estadoReto[p] ? <Icon name="check" size={16} /> : '?'}
                </button>

                {!sala.estadoReto[p] && pistasAbiertas[p] && pistasTexto[p] && (
                  <div className="fs-slice-pista-box" onClick={(e) => e.stopPropagation()}>
                    <span>💡 {pistasTexto[p]}</span>
                  </div>
                )}

                {sala.estadoReto[p] && <div className="fs-solved-name">{sala.retoActual.partes[p].jugador}</div>}
              </div>
            ))}
          </div>

          {/* Botón de pasar turno debajo de la imagen */}
          <div style={{ display: 'flex', justifyContent: 'center', margin: '0.8rem 0' }}>
            <button
              type="button"
              className="secondary full"
              disabled={!esMiTurno}
              style={{ maxWidth: '360px', borderRadius: '14px', fontWeight: 'bold' }}
              onClick={handlePasarTurno}
            >
              ⏭️ Pasar turno
            </button>
          </div>

          <form onSubmit={validarRespuesta} style={{ display: 'flex', gap: '0.5rem', margin: '0.5rem 0 1rem' }}>
            <input
              type="text"
              placeholder={esMiTurno && parteSeleccionada ? '🔍 Escribe el nombre del jugador...' : '⚠️ Selecciona una parte de la cara arriba primero'}
              value={inputStr}
              onChange={(e) => setInputStr(e.target.value)}
              disabled={!esMiTurno || !parteSeleccionada}
              autoFocus={esMiTurno && !!parteSeleccionada}
              style={{ flex: 1, padding: '0.8rem', borderRadius: '20px', border: '2px solid #cbd5e1' }}
            />
            <button type="submit" className="ok" disabled={!esMiTurno || !parteSeleccionada || !inputStr.trim()}>
              Probar
            </button>
          </form>

          {feedback && (
            <div
              style={{
                textAlign: 'center',
                padding: '0.5rem',
                background: feedback.tipo === 'success' ? '#dcfce7' : '#fee2e2',
                color: feedback.tipo === 'success' ? '#15803d' : '#991b1b',
                borderRadius: '8px',
                marginBottom: '1rem',
                fontWeight: 'bold'
              }}
            >
              {feedback.msj}
            </div>
          )}
        </section>
      )}

      {vista === 'sala' && sala?.estado === 'ronda_fin' && (
        <section className="game" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1rem' }}>
          <div style={{ background: '#ffffff', borderRadius: '24px', padding: '2rem', width: '100%', maxWidth: '500px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', textAlign: 'center', color: '#1e293b' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🏆</div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#1e1b4b', marginBottom: '0.5rem' }}>Ronda {sala.rondaActual} Finalizada</h1>
            <p style={{ color: '#64748b', fontSize: '1rem', marginBottom: '1.2rem' }}>Solución del reto:</p>
            
            <div style={{ margin: '1rem 0', background: '#f8fafc', padding: '1rem', borderRadius: '12px', textAlign: 'left', border: '1px solid #e2e8f0' }}>
              <p style={{ margin: '0.3rem 0' }}><strong>Pelo:</strong> {sala.retoActual?.partes?.top?.jugador || '---'}</p>
              <p style={{ margin: '0.3rem 0' }}><strong>Ojos:</strong> {sala.retoActual?.partes?.middle?.jugador || '---'}</p>
              <p style={{ margin: '0.3rem 0' }}><strong>Barbilla:</strong> {sala.retoActual?.partes?.bottom?.jugador || '---'}</p>
            </div>

            <div style={{ width: '100%', marginTop: '1.5rem', textAlign: 'left' }}>
              <h3 style={{ margin: '0 0 0.8rem', textAlign: 'center', fontSize: '1.2rem', color: '#334155' }}>
                Clasificación actual
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {ranking.map((j, i) => {
                  const pts = j.puntos ?? 0;
                  return (
                    <div key={j.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', borderRadius: '12px', background: i === 0 ? '#fef08a' : '#f1f5f9', fontWeight: 'bold' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ display: 'inline-grid', placeItems: 'center', width: '1.5rem', height: '1.5rem', borderRadius: '50%', background: i === 0 ? '#eab308' : '#cbd5e1', color: '#fff', fontSize: '0.8rem' }}>{i + 1}</span>
                        {j.nombre}
                      </span>
                      <span>{pts} pts</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {esAdmin ? (
                <>
                  {sala.rondaActual < sala.maxRondas ? (
                    <button 
                      style={{ width: '100%', padding: '1rem', borderRadius: '14px', background: '#4f46e5', color: '#fff', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '1rem' }}
                      onClick={() => accionSala('siguiente-ronda')}
                    >
                      ▶ Siguiente Ronda ({sala.rondaActual + 1}/{sala.maxRondas})
                    </button>
                  ) : (
                    <button 
                      style={{ width: '100%', padding: '1rem', borderRadius: '14px', background: '#16a34a', color: '#fff', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '1rem' }}
                      onClick={() => accionSala('finalizar-partida')}
                    >
                      🏆 Ver Podio Final
                    </button>
                  )}
                  <button 
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '14px', background: '#ef4444', color: '#fff', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '0.95rem' }}
                    onClick={() => accionSala('finalizar-partida')}
                  >
                    🏁 Finalizar partida
                  </button>
                </>
              ) : (
                <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Esperando a que el administrador elija la siguiente acción...</p>
              )}
              <button 
                style={{ width: '100%', padding: '0.8rem', borderRadius: '14px', background: '#64748b', color: '#fff', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '0.95rem' }}
                onClick={() => setModalSalir(true)}
              >
                🚪 Salir de la sala
              </button>
            </div>
          </div>
        </section>
      )}

      {vista === 'sala' && sala?.estado === 'final_partida' && (
        <section className="game" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1rem' }}>
          <div style={{ background: '#ffffff', borderRadius: '24px', padding: '2rem', width: '100%', maxWidth: '500px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', textAlign: 'center', color: '#1e293b' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>👑</div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#1e1b4b', marginBottom: '0.5rem' }}>¡Partida Finalizada!</h1>
            <p style={{ color: '#64748b', fontSize: '1rem', marginBottom: '1.2rem' }}>Clasificación final:</p>

            <div className="scoreboard" style={{ width: '100%', marginTop: '1rem', textAlign: 'left' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {ranking.map((j, i) => {
                  const pts = j.puntos ?? 0;
                  return (
                    <div key={j.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', borderRadius: '12px', background: i === 0 ? '#fef08a' : '#f1f5f9', fontWeight: 'bold' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ display: 'inline-grid', placeItems: 'center', width: '1.5rem', height: '1.5rem', borderRadius: '50%', background: i === 0 ? '#eab308' : '#cbd5e1', color: '#fff', fontSize: '0.8rem' }}>{i + 1}</span>
                        {j.nombre}
                      </span>
                      <span>{pts} pts</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {esAdmin ? (
                <button 
                  style={{ width: '100%', padding: '1rem', borderRadius: '14px', background: '#4f46e5', color: '#fff', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '1rem' }}
                  onClick={() => accionSala('volver-lobby')}
                >
                  🔄 Jugar de nuevo (Volver al Lobby)
                </button>
              ) : (
                <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Esperando a que el administrador decida volver a jugar...</p>
              )}
              <button 
                style={{ width: '100%', padding: '0.8rem', borderRadius: '14px', background: '#ef4444', color: '#fff', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '0.95rem' }}
                onClick={() => setModalSalir(true)}
              >
                🚪 Salir de la sala
              </button>
            </div>
          </div>
        </section>
      )}

      {modalSalir && (
        <div className="rg-modal-fondo" onClick={() => setModalSalir(false)}>
          <div className="rg-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px', textAlign: 'center', padding: '1.8rem 1.4rem' }}>
            <h3 style={{ margin: '0 0 0.6rem', color: '#1e1b4b', fontSize: '1.3rem' }}>¿Abandonar la partida?</h3>
            <p className="hint" style={{ fontSize: '0.95rem', marginBottom: '1.4rem' }}>
              Si sales de la sala perderás tu progreso actual en la partida.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginTop: '1rem' }}>
              <button type="button" className="secondary full" onClick={() => setModalSalir(false)}>
                Quedarme
              </button>
              <button type="button" className="secondary danger full" onClick={() => { setModalSalir(false); handleSalir(); }}>
                Sí, salir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}