// client/src/games/FootballSplit/FootballSplitLocal.jsx
import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../components/Icon.jsx';
import GameIntro from '../../components/GameIntro.jsx';
import './FootballSplit.css';
import '../Adivina/Adivina.css';

const TIEMPO_TURNO = 120;

export default function FootballSplitLocal({ onVolver }) {
  const [paso, setPaso] = useState('config'); // 'config' | 'jugando' | 'cambio_turno' | 'ronda_fin' | 'final_partida'
  const [modalAyuda, setModalAyuda] = useState(false);

  const [jugadores, setJugadores] = useState([
    { id: 1, nombre: 'Jugador 1' },
    { id: 2, nombre: 'Jugador 2' }
  ]);
  
  const [puntos, setPuntos] = useState({});
  const [rondaActual, setRondaActual] = useState(1);
  const [maxRondas] = useState(15);

  const [reto, setReto] = useState(null);
  const [estadoReto, setEstadoReto] = useState({ top: false, middle: false, bottom: false });
  
  const [pistasAbiertas, setPistasAbiertas] = useState({ top: false, middle: false, bottom: false });
  const [pistasUsadasEnParte, setPistasUsadasEnParte] = useState({ top: false, middle: false, bottom: false });

  const [turnoIdx, setTurnoIdx] = useState(0);
  const [siguienteTurnoIdx, setSiguienteTurnoIdx] = useState(0);
  const [mensajeCambio, setMensajeCambio] = useState('');
  
  const [parteSeleccionada, setParteSeleccionada] = useState(null);
  const [inputStr, setInputStr] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [fallosConsecutivos, setFallosConsecutivos] = useState(0);

  const [tiempoRestante, setTiempoRestante] = useState(TIEMPO_TURNO);
  const timerRef = useRef(null);

  const handleNumJugadores = (e) => {
    const num = parseInt(e.target.value, 10);
    setJugadores(
      Array.from({ length: num }, (_, i) => ({
        id: i + 1,
        nombre: jugadores[i]?.nombre ?? `Jugador ${i + 1}`
      }))
    );
  };

  const iniciarPartida = async () => {
    const initialScores = {};
    jugadores.forEach(j => { initialScores[j.id] = 0; });
    setPuntos(initialScores);
    setRondaActual(1);
    await cargarNuevoReto(true);
  };

  const cargarNuevoReto = async (sortearTurno = false) => {
    try {
      const res = await fetch('/api/footballsplit/reto');
      const data = await res.json();
      if (!data || !data.reto) throw new Error('No se pudo cargar el reto');
      
      setReto(data.reto);
      setEstadoReto({ top: false, middle: false, bottom: false });
      setPistasAbiertas({ top: false, middle: false, bottom: false });
      setPistasUsadasEnParte({ top: false, middle: false, bottom: false });
      setParteSeleccionada(null);
      setFallosConsecutivos(0);
      
      let nuevoIdx = turnoIdx;
      if (sortearTurno) {
        nuevoIdx = Math.floor(Math.random() * jugadores.length);
      } else {
        nuevoIdx = (turnoIdx + 1) % jugadores.length;
      }
      setTurnoIdx(nuevoIdx);

      setInputStr('');
      setFeedback(null);
      setMensajeCambio(`¡Ronda ${rondaActual}!\nComienza ${jugadores[nuevoIdx]?.nombre || 'el jugador'}`);
      setPaso('cambio_turno');
    } catch (e) {
      console.error(e);
      setPaso('jugando');
    }
  };

  const prepararCambioTurno = (motivo = '¡Fallaste o pasaste turno!') => {
    if (timerRef.current) clearInterval(timerRef.current);
    const nuevoFallos = fallosConsecutivos + 1;
    setFallosConsecutivos(nuevoFallos);
    
    if (nuevoFallos >= jugadores.length) {
      setPaso('ronda_fin');
      return;
    }

    const siguienteIdx = (turnoIdx + 1) % jugadores.length;
    setSiguienteTurnoIdx(siguienteIdx);
    setMensajeCambio(`${motivo}\nTurno para: ${jugadores[siguienteIdx]?.nombre || 'Siguiente'}`);
    setPaso('cambio_turno');
  };

  const aceptarCambioTurno = () => {
    setTurnoIdx(siguienteTurnoIdx);
    setParteSeleccionada(null);
    setInputStr('');
    setPaso('jugando');
  };

  useEffect(() => {
    if (paso !== 'jugando') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    setTiempoRestante(TIEMPO_TURNO);
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          prepararCambioTurno('¡Se acabó el tiempo de 120s!');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paso, turnoIdx]);

  const normalizar = (t) =>
    typeof t === 'string' ? t
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim() : '';

  const validarRespuesta = (e) => {
    e.preventDefault();
    if (!inputStr.trim() || !reto || !parteSeleccionada) return;

    if (timerRef.current) clearInterval(timerRef.current);

    const jugadorActual = jugadores[turnoIdx];
    const normInput = normalizar(inputStr);
    const parteObj = reto.partes && reto.partes[parteSeleccionada];
    const normReal = parteObj ? normalizar(parteObj.jugador) : '';

    const esAcertado = normReal && (normReal === normInput || (normInput.length >= 4 && normReal.includes(normInput)));

    if (esAcertado && !estadoReto[parteSeleccionada]) {
      const conPista = pistasUsadasEnParte[parteSeleccionada];
      const puntosGanados = conPista ? 1 : 5;

      setPuntos(prev => ({
        ...prev,
        [jugadorActual.id]: (prev[jugadorActual.id] || 0) + puntosGanados
      }));

      const nuevoEstadoReto = { ...estadoReto, [parteSeleccionada]: true };
      setEstadoReto(nuevoEstadoReto);
      setFallosConsecutivos(0);
      setFeedback({ tipo: 'success', msj: `¡Acierto! +${puntosGanados} pts` });

      if (nuevoEstadoReto.top && nuevoEstadoReto.middle && nuevoEstadoReto.bottom) {
        setTimeout(() => {
          if (rondaActual >= maxRondas) {
            setPaso('final_partida');
          } else {
            setPaso('ronda_fin');
          }
        }, 1500);
      } else {
        setTimeout(() => {
          setFeedback(null);
          setParteSeleccionada(null);
        }, 1200);
      }
    } else {
      setFeedback({ tipo: 'error', msj: 'Incorrecto. ¡Fallo!' });
      setTimeout(() => {
        setFeedback(null);
        prepararCambioTurno(`¡Fallo de ${jugadorActual?.nombre || 'jugador'}!`);
      }, 1200);
    }

    setInputStr('');
  };

  const togglePista = (parte, e) => {
    e.stopPropagation();
    if (estadoReto[parte]) return;
    
    setPistasUsadasEnParte(prev => ({ ...prev, [parte]: true }));
    setPistasAbiertas(prev => ({ ...prev, [parte]: !prev[parte] }));
  };

  const seleccionarParte = (parte) => {
    if (estadoReto[parte]) return;
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

  const jugadorActivo = jugadores[turnoIdx];
  const ranking = [...jugadores].sort((a, b) => (puntos[b.id] || 0) - (puntos[a.id] || 0));

  return (
    <div className="rk-contenedor">
      {paso === 'config' && (
        <button type="button" className="aprox-btn-ayuda" onClick={() => setModalAyuda(true)} title="Reglas">
          <span className="aprox-btn-ayuda-signo">?</span>
        </button>
      )}

      {modalAyuda && (
        <div className="rg-modal-fondo" onClick={() => setModalAyuda(false)}>
          <div className="rg-modal aprox-modal-ayuda" onClick={(e) => e.stopPropagation()}>
            <div className="aprox-modal-header">
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

      {paso === 'config' && (
        <section className="game">
          <GameIntro gameId="footballsplit" titulo="Football Split" />
          <div className="panel">
            <div className="hud" style={{ marginBottom: '1rem' }}>
              <button className="btn-back-inline" onClick={onVolver}>&larr; Cambiar a modo Online</button>
            </div>
            <h3 className="panel-title"><Icon name="users" size={22} /> Jugadores</h3>
            <select
              value={jugadores.length}
              onChange={handleNumJugadores}
              style={{ marginBottom: '1rem', width: '100%', padding: '0.8rem', borderRadius: '8px' }}
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>{n} jugador{n > 1 ? 'es' : ''}</option>
              ))}
            </select>
            <div className="names-grid">
              {jugadores.map((j, idx) => (
                <input
                  key={j.id}
                  type="text"
                  value={j.nombre}
                  onChange={(e) => {
                    const nuevos = [...jugadores];
                    nuevos[idx].nombre = e.target.value;
                    setJugadores(nuevos);
                  }}
                  placeholder={`Jugador ${j.id}`}
                  maxLength={20}
                />
              ))}
            </div>
          </div>
          <button className="big full" onClick={iniciarPartida}>
            <Icon name="play" size={24} /> Empezar Partida (15 Rondas)
          </button>
        </section>
      )}

      {paso === 'cambio_turno' && (
        <section className="game center">
          <div className="panel aprox-pregunta-card bm-pasar-card" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
            <span style={{ fontSize: '3.5rem', display: 'block', marginBottom: '0.5rem' }}>🔄</span>
            <h1 className="bm-jugador-highlight" style={{ fontSize: '2rem', color: '#4f46e5', margin: '0.5rem 0 1rem' }}>
              ¡Cambio de Turno!
            </h1>
            <p className="hint" style={{ fontSize: '1.2rem', marginBottom: '2rem', whiteSpace: 'pre-line', fontWeight: 'bold' }}>
              {mensajeCambio}
            </p>
            <button className="big full" onClick={aceptarCambioTurno}>
              <Icon name="check" size={22} strokeWidth={2.5} /> ¡Preparado, empezar turno!
            </button>
          </div>
        </section>
      )}

      {paso === 'jugando' && reto && (
        <section className="game">
          <div className="hud space-between">
            <span className="chip">
              <Icon name="flagFinish" size={18} /> Ronda {rondaActual}/{maxRondas}
            </span>
            <span className="chip alt">
              <Icon name="users" size={18} /> Turno de: <strong>{jugadorActivo?.nombre}</strong>
            </span>
            <button
              className="secondary danger"
              style={{ padding: '0.3rem 0.8rem', fontSize: '0.85rem' }}
              onClick={() => setPaso('ronda_fin')}
            >
              Finalizar ronda
            </button>
          </div>

          <div className="scoreboard-container" style={{ justifyContent: 'center', marginBottom: '0.6rem' }}>
            {jugadores.map((j) => (
              <div key={j.id} className={`score-pill ${j.id === jugadorActivo?.id ? 'active' : ''}`} style={{ borderColor: j.id === jugadorActivo?.id ? '#4f46e5' : undefined }}>
                <span>{j.nombre}: <strong>{puntos[j.id] ?? 0} pts</strong></span>
              </div>
            ))}
          </div>

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
                className={`fs-slice ${estadoReto[p] ? 'solved' : ''} ${parteSeleccionada === p ? 'selected-slice' : ''}`}
                onClick={() => seleccionarParte(p)}
                style={{ cursor: estadoReto[p] ? 'default' : 'pointer', border: parteSeleccionada === p ? '3px solid #4f46e5' : undefined }}
              >
                {reto?.partes && reto.partes[p] && reto.partes[p].img && (
                  <img
                    src={reto.partes[p].img}
                    alt={p}
                    style={getEstiloImagen(p)}
                  />
                )}

                <button
                  type="button"
                  className="fs-slice-status"
                  disabled={estadoReto[p]}
                  onClick={(e) => togglePista(p, e)}
                  title={estadoReto[p] ? 'Acertado' : 'Ver pista'}
                >
                  {estadoReto[p] ? <Icon name="check" size={16} /> : '?'}
                </button>

                {!estadoReto[p] && pistasAbiertas[p] && reto?.partes && reto.partes[p] && (
                  <div className="fs-slice-pista-box" onClick={(e) => e.stopPropagation()}>
                    <span>💡 {reto.partes[p].pista}</span>
                  </div>
                )}

                {estadoReto[p] && reto?.partes && reto.partes[p] && <div className="fs-solved-name">{reto.partes[p].jugador}</div>}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', margin: '0.8rem 0' }}>
            <button
              type="button"
              className="secondary full"
              style={{ maxWidth: '360px', borderRadius: '14px', fontWeight: 'bold' }}
              onClick={() => prepararCambioTurno('¡Has pasado el turno!')}
            >
              ⏭️ Pasar turno
            </button>
          </div>

          <form onSubmit={validarRespuesta} style={{ display: 'flex', gap: '0.5rem', margin: '0.5rem 0 1rem' }}>
            <input
              type="text"
              placeholder={parteSeleccionada ? '🔍 Escribe el nombre del jugador...' : '⚠️ Selecciona una parte de la cara arriba primero'}
              value={inputStr}
              onChange={(e) => setInputStr(e.target.value)}
              disabled={!parteSeleccionada}
              autoFocus={!!parteSeleccionada}
              style={{ flex: 1, padding: '0.8rem', borderRadius: '20px', border: '2px solid #cbd5e1' }}
            />
            <button type="submit" className="ok" disabled={!parteSeleccionada || !inputStr.trim()}>Probar</button>
          </form>

          {feedback && (
            <div
              style={{
                textAlign: 'center',
                padding: '0.5rem',
                borderRadius: '8px',
                background: feedback.tipo === 'success' ? '#dcfce7' : '#fee2e2',
                color: feedback.tipo === 'success' ? '#15803d' : '#991b1b',
                fontWeight: 'bold',
                marginBottom: '1rem'
              }}
            >
              {feedback.msj}
            </div>
          )}
        </section>
      )}

      {paso === 'ronda_fin' && (
        <section className="game" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1rem' }}>
          <div style={{ background: '#ffffff', borderRadius: '24px', padding: '2rem', width: '100%', maxWidth: '500px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', textAlign: 'center', color: '#1e293b' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🏆</div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#1e1b4b', marginBottom: '0.5rem' }}>Ronda {rondaActual} Finalizada</h1>
            <p style={{ color: '#64748b', fontSize: '1rem', marginBottom: '1.2rem' }}>Solución del reto:</p>
            
            <div style={{ margin: '1rem 0', background: '#f8fafc', padding: '1rem', borderRadius: '12px', textAlign: 'left', border: '1px solid #e2e8f0' }}>
              <p style={{ margin: '0.3rem 0' }}><strong>Pelo:</strong> {reto?.partes?.top?.jugador || '---'}</p>
              <p style={{ margin: '0.3rem 0' }}><strong>Ojos:</strong> {reto?.partes?.middle?.jugador || '---'}</p>
              <p style={{ margin: '0.3rem 0' }}><strong>Barbilla:</strong> {reto?.partes?.bottom?.jugador || '---'}</p>
            </div>

            <div style={{ width: '100%', marginTop: '1.5rem', textAlign: 'left' }}>
              <h3 style={{ margin: '0 0 0.8rem', textAlign: 'center', fontSize: '1.2rem', color: '#334155' }}>
                Clasificación actual
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {ranking.map((j, i) => {
                  const pts = puntos[j.id] ?? 0;
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
              {rondaActual < maxRondas ? (
                <button 
                  style={{ width: '100%', padding: '1rem', borderRadius: '14px', background: '#4f46e5', color: '#fff', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '1rem' }}
                  onClick={() => { setRondaActual(r => r + 1); cargarNuevoReto(false); }}
                >
                  ▶ Siguiente Ronda ({rondaActual + 1}/{maxRondas})
                </button>
              ) : (
                <button 
                  style={{ width: '100%', padding: '1rem', borderRadius: '14px', background: '#16a34a', color: '#fff', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '1rem' }}
                  onClick={() => setPaso('final_partida')}
                >
                  🏆 Ver podio final
                </button>
              )}
              <button 
                style={{ width: '100%', padding: '0.8rem', borderRadius: '14px', background: '#ef4444', color: '#fff', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '0.95rem' }}
                onClick={() => setPaso('final_partida')}
              >
                🏁 Finalizar partida
              </button>
            </div>
          </div>
        </section>
      )}

      {/* PANTALLA FINAL DE PARTIDA */}
      {paso === 'final_partida' && (
        <section className="game" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1rem' }}>
          <div style={{ background: '#ffffff', borderRadius: '24px', padding: '2rem', width: '100%', maxWidth: '500px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', textAlign: 'center', color: '#1e293b' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>👑</div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#1e1b4b', marginBottom: '0.5rem' }}>¡Partida Finalizada!</h1>
            <p style={{ color: '#64748b', fontSize: '1rem', marginBottom: '1.2rem' }}>Clasificación final:</p>

            <div style={{ width: '100%', marginTop: '1rem', textAlign: 'left' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {ranking.map((j, i) => {
                  const pts = puntos[j.id] ?? 0;
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
              <button 
                style={{ width: '100%', padding: '1rem', borderRadius: '14px', background: '#4f46e5', color: '#fff', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '1rem' }}
                onClick={() => setPaso('config')}
              >
                🔄 Volver a jugar
              </button>
              <button 
                style={{ width: '100%', padding: '0.8rem', borderRadius: '14px', background: '#64748b', color: '#fff', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '0.95rem' }}
                onClick={onVolver}
              >
                🚪 Salir a la portada
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}