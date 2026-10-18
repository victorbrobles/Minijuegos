// client/src/games/Pistas/PistasLocal.jsx
import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../components/Icon.jsx';
import GameIntro from '../../components/GameIntro.jsx';
import './Pistas.css';

const MAX_PISTAS = 6;
const TIEMPO_PISTA_SEGUNDOS = 10;
const MIN_JUGADORES = 2;
const MAX_JUGADORES = 15;

export default function PistasLocal({ onVolver, onExit }) {
  const [fase, setFase] = useState('setup'); // 'setup' | 'jugando' | 'resolucion' | 'final'
  const [modalAyuda, setModalAyuda] = useState(false);

  // Setup
  const [modo, setModo] = useState('estandar'); // 'estandar' | 'supervivencia'
  const [numJugadores, setNumJugadores] = useState(4);
  const [jugadores, setJugadores] = useState([
    { id: 1, nombre: 'Jugador 1' },
    { id: 2, nombre: 'Jugador 2' },
    { id: 3, nombre: 'Jugador 3' },
    { id: 4, nombre: 'Jugador 4' }
  ]);

  // Marcadores y vidas
  const [puntos, setPuntos] = useState({});
  const [vidas, setVidas] = useState({});
  const [ordenEliminacionSupervivencia, setOrdenEliminacionSupervivencia] = useState([]);

  // Ronda en curso
  const [rondaNum, setRondaNum] = useState(1);
  const [rondaData, setRondaData] = useState(null);
  const [usados, setUsados] = useState([]);
  const [pistasReveladas, setPistasReveladas] = useState(1);
  const [segundosRestantes, setSegundosRestantes] = useState(TIEMPO_PISTA_SEGUNDOS);

  // Estados de la ronda
  const [acertadosRonda, setAcertadosRonda] = useState([]);
  const [bloqueadosRonda, setBloqueadosRonda] = useState([]);

  // Pulsador rojo offline y temporizador de 15s para responder
  const [pulsadorActivo, setPulsadorActivo] = useState(false);
  const [inputRespuesta, setInputRespuesta] = useState('');
  const [jugadorSeleccionadoId, setJugadorSeleccionadoId] = useState(null);
  const [segundosRespuesta, setSegundosRespuesta] = useState(15);
  const [feedbackError, setFeedbackError] = useState('');

  // Resultado de la ronda
  const [resultadoRonda, setResultadoRonda] = useState(null);

  const timerRef = useRef(null);

  const inputRespuestaRef = useRef(inputRespuesta);
  useEffect(() => {
    inputRespuestaRef.current = inputRespuesta;
  }, [inputRespuesta]);

  const jugadorSeleccionadoRef = useRef(jugadorSeleccionadoId);
  useEffect(() => {
    jugadorSeleccionadoRef.current = jugadorSeleccionadoId;
  }, [jugadorSeleccionadoId]);

  const acertadosRondaRef = useRef(acertadosRonda);
  useEffect(() => {
    acertadosRondaRef.current = acertadosRonda;
  }, [acertadosRonda]);

  const bloqueadosRondaRef = useRef(bloqueadosRonda);
  useEffect(() => {
    bloqueadosRondaRef.current = bloqueadosRonda;
  }, [bloqueadosRonda]);

  const vidasRef = useRef(vidas);
  useEffect(() => {
    vidasRef.current = vidas;
  }, [vidas]);

  const jugadoresRef = useRef(jugadores);
  useEffect(() => {
    jugadoresRef.current = jugadores;
  }, [jugadores]);

  // Temporizador de 10s por pista
  useEffect(() => {
    if (fase !== 'jugando' || pulsadorActivo) return;

    timerRef.current = setInterval(() => {
      setSegundosRestantes((prev) => {
        if (prev <= 1) {
          if (pistasReveladas < MAX_PISTAS) {
            setPistasReveladas((p) => p + 1);
            return TIEMPO_PISTA_SEGUNDOS;
          } else {
            clearInterval(timerRef.current);
            cerrarRondaPorLimite();
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [fase, pulsadorActivo, pistasReveladas]);

  const handleNumJugadoresChange = (e) => {
    const num = parseInt(e.target.value, 10);
    setNumJugadores(num);
    const nuevos = Array.from({ length: num }, (_, i) => ({
      id: i + 1,
      nombre: jugadores[i]?.nombre || `Jugador ${i + 1}`
    }));
    setJugadores(nuevos);
  };

  const handleNombreChange = (idx, val) => {
    const nuevos = [...jugadores];
    nuevos[idx] = { ...nuevos[idx], nombre: val };
    setJugadores(nuevos);
  };

  const iniciarPartida = () => {
    const listaActualizada = jugadores.map((j) => ({
      ...j,
      nombre: j.nombre.trim() || `Jugador ${j.id}`
    }));
    setJugadores(listaActualizada);

    const scores = {};
    const lives = {};
    listaActualizada.forEach((j) => {
      scores[j.id] = 0;
      lives[j.id] = 3;
    });
    setPuntos(scores);
    setVidas(lives);
    setOrdenEliminacionSupervivencia([]);

    setRondaNum(1);
    setUsados([]);
    cargarNuevaRonda(1, []);
  };

  const cargarNuevaRonda = async (numRonda, listaUsados) => {
    try {
      const res = await fetch('/api/pistas/iniciar-ronda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usados: listaUsados })
      });
      const data = await res.json();

      setRondaData(data);
      setUsados([...listaUsados, data.id]);
      setPistasReveladas(1);
      setSegundosRestantes(TIEMPO_PISTA_SEGUNDOS);
      setAcertadosRonda([]);
      setBloqueadosRonda([]);
      setPulsadorActivo(false);
      setInputRespuesta('');
      setJugadorSeleccionadoId(null);
      setSegundosRespuesta(15);
      setFeedbackError('');
      setResultadoRonda(null);
      setFase('jugando');
    } catch {
      alert('Error cargando la ronda.');
    }
  };

  const obtenerJugadoresActivos = (acertados, bloqueados, vidasActuales) => {
    return jugadores.filter((j) => {
      const yaAcerto = acertados.some((a) => a.jugadorId === j.id);
      const estaBloqueado = bloqueados.includes(j.id);
      const sinVidas = modo === 'supervivencia' && vidasActuales[j.id] <= 0;
      return !yaAcerto && !estaBloqueado && !sinVidas;
    });
  };

  // Al presionar el botón rojo
  const handlePulsarBotonRojo = () => {
    if (jugadoresDisponibles.length === 0) return;
    setPulsadorActivo(true);
    setInputRespuesta('');
    setJugadorSeleccionadoId(null);
    setSegundosRespuesta(15);
    setFeedbackError('');
  };

  const cancelarRespuesta = () => {
    setPulsadorActivo(false);
    setInputRespuesta('');
    setJugadorSeleccionadoId(null);
    setFeedbackError('');
  };

  // Temporizador de 15 segundos para responder
  useEffect(() => {
    if (!pulsadorActivo) {
      setSegundosRespuesta(15);
      return;
    }

    setSegundosRespuesta(15);
    const t = setInterval(() => {
      setSegundosRespuesta((prev) => {
        if (prev <= 0.1) {
          clearInterval(t);
          handleTiempoAgotadoLocal();
          return 0;
        }
        return Math.max(0, prev - 0.1);
      });
    }, 100);

    return () => clearInterval(t);
  }, [pulsadorActivo]);

  const aplicarFallo = (jugador, avisoTexto) => {
    setPulsadorActivo(false);
    setInputRespuesta('');
    setJugadorSeleccionadoId(null);

    if (modo === 'estandar') {
      const nuevosBloqueados = [...bloqueadosRondaRef.current, jugador.id];
      setBloqueadosRonda(nuevosBloqueados);

      const activos = obtenerJugadoresActivos(acertadosRondaRef.current, nuevosBloqueados, vidasRef.current);
      if (activos.length === 0) {
        finalizarRonda('todos_eliminados', acertadosRondaRef.current, nuevosBloqueados);
      } else {
        setFeedbackError(avisoTexto || `¡${jugador.nombre} ha fallado!`);
        setTimeout(() => setFeedbackError(''), 2000);
      }
    } else {
      const nuevasVidas = { ...vidasRef.current, [jugador.id]: 0 };
      setVidas(nuevasVidas);
      setOrdenEliminacionSupervivencia((prev) => [...prev, jugador.id]);

      const vivos = jugadoresRef.current.filter((j) => nuevasVidas[j.id] > 0);
      if (vivos.length <= 1) {
        finalizarPartidaSupervivencia(nuevasVidas);
      } else {
        const activos = obtenerJugadoresActivos(acertadosRondaRef.current, bloqueadosRondaRef.current, nuevasVidas);
        if (activos.length === 0) {
          finalizarRonda('todos_eliminados', acertadosRondaRef.current, bloqueadosRondaRef.current);
        } else {
          setFeedbackError(avisoTexto || `¡${jugador.nombre} ha fallado y pierde todas sus vidas!`);
          setTimeout(() => setFeedbackError(''), 2000);
        }
      }
    }
  };

  const handleTiempoAgotadoLocal = () => {
    const jId = jugadorSeleccionadoRef.current;
    const texto = inputRespuestaRef.current.trim();

    // Si no se ha elegido jugador, simplemente se cierra el modal sin penalizar
    if (!jId) {
      cancelarRespuesta();
      return;
    }

    const jugador = jugadoresRef.current.find((j) => j.id === jId);
    if (!jugador) {
      cancelarRespuesta();
      return;
    }

    if (texto) {
      // Si hay algo escrito y no se ha enviado, se envía como respuesta
      confirmarRespuestaJugador(jugador, texto);
    } else {
      // Si no ha escrito nada, cuenta como fallo
      aplicarFallo(jugador, `¡${jugador.nombre} ha agotado el tiempo de respuesta!`);
    }
  };

  const confirmarRespuestaJugador = async (jugador, textoOpcional) => {
    const texto = (textoOpcional !== undefined ? textoOpcional : inputRespuesta).trim();
    if (!texto || !pulsadorActivo) return;

    try {
      const res = await fetch('/api/pistas/validar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: rondaData.id,
          respuesta: texto
        })
      });
      const data = await res.json();

      setPulsadorActivo(false);
      setInputRespuesta('');
      setJugadorSeleccionadoId(null);

      if (data.acierto) {
        let ptsGanados = 0;
        let deltaVidas = 0;

        if (modo === 'estandar') {
          ptsGanados = MAX_PISTAS - pistasReveladas + 1;
          setPuntos((prev) => ({
            ...prev,
            [jugador.id]: (prev[jugador.id] || 0) + ptsGanados
          }));
        } else {
          if (pistasReveladas <= 2) deltaVidas = 1;
          else if (pistasReveladas <= 4) deltaVidas = 0;
          else deltaVidas = -1;

          setVidas((prev) => {
            const actual = prev[jugador.id] ?? 3;
            const nueva = Math.min(3, Math.max(0, actual + deltaVidas));
            return { ...prev, [jugador.id]: nueva };
          });
        }

        const nuevoRegistro = {
          jugadorId: jugador.id,
          nombre: jugador.nombre,
          pistaNum: pistasReveladas,
          puntos: ptsGanados,
          deltaVidas
        };

        const nuevosAcertados = [...acertadosRonda, nuevoRegistro];
        setAcertadosRonda(nuevosAcertados);

        const activos = obtenerJugadoresActivos(nuevosAcertados, bloqueadosRonda, vidas);
        if (activos.length === 0) {
          finalizarRonda('todos_completados', nuevosAcertados, bloqueadosRonda);
        }
      } else {
        aplicarFallo(jugador, `¡${jugador.nombre} ha fallado!`);
      }
    } catch {
      setFeedbackError('Error validando respuesta.');
    }
  };

  const cerrarRondaPorLimite = () => {
    finalizarRonda('tiempo_agotado', acertadosRonda, bloqueadosRonda);
  };

  const finalizarRonda = async (motivo, acertados = acertadosRonda, bloqueados = bloqueadosRonda) => {
    clearInterval(timerRef.current);
    try {
      const res = await fetch('/api/pistas/solucion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: rondaData.id })
      });
      const data = await res.json();

      setResultadoRonda({
        tipo: motivo,
        nombre: data.nombre,
        acertados,
        bloqueados
      });
      setPulsadorActivo(false);
      setJugadorSeleccionadoId(null);
      setFase('resolucion');
    } catch {
      setFase('setup');
    }
  };

  const finalizarPartidaSupervivencia = (vidasFinales) => {
    clearInterval(timerRef.current);
    const vivos = jugadores.filter((j) => vidasFinales[j.id] > 0);
    const rankingFinal = [];

    if (vivos.length === 1) rankingFinal.push(vivos[0]);

    const eliminadosIds = [...ordenEliminacionSupervivencia].reverse();
    eliminadosIds.forEach((id) => {
      const j = jugadores.find((x) => x.id === id);
      if (j && !rankingFinal.some((r) => r.id === j.id)) rankingFinal.push(j);
    });

    jugadores.forEach((j) => {
      if (!rankingFinal.some((r) => r.id === j.id)) rankingFinal.push(j);
    });

    const nuevosPuntos = {};
    const totalJ = jugadores.length;
    rankingFinal.forEach((j, idx) => {
      nuevosPuntos[j.id] = Math.max(1, totalJ - idx);
    });
    setPuntos(nuevosPuntos);
    setFase('final');
  };

  const siguienteRonda = () => {
    if (modo === 'supervivencia') {
      const vivos = jugadores.filter((j) => vidas[j.id] > 0);
      if (vivos.length <= 1) {
        finalizarPartidaSupervivencia(vidas);
        return;
      }
    }
    const sig = rondaNum + 1;
    setRondaNum(sig);
    cargarNuevaRonda(sig, usados);
  };

  const ranking = [...jugadores].sort((a, b) => (puntos[b.id] ?? 0) - (puntos[a.id] ?? 0));
  const maximo = ranking.length ? (puntos[ranking[0].id] ?? 0) : 0;
  const ganadores = maximo > 0 ? ranking.filter((j) => (puntos[j.id] ?? 0) === maximo) : [];
  const jugadoresDisponibles = obtenerJugadoresActivos(acertadosRonda, bloqueadosRonda, vidas);

  return (
    <div className="pts-contenedor">
      {/* AYUDA */}
      {fase === 'setup' && (
        <>
          <button
            type="button"
            className="btn-ayuda-flotante"
            onClick={() => setModalAyuda(true)}
            title="Reglas y puntuación"
          >
            <span className="btn-ayuda-flotante-signo">?</span>
          </button>

          {modalAyuda && (
            <div className="rg-modal-fondo" onClick={() => setModalAyuda(false)}>
              <div className="rg-modal modal-ayuda-juego" onClick={(e) => e.stopPropagation()}>
                <div className="modal-ayuda-header">
                  <span className="modal-ayuda-signo-title">?</span>
                  <h3>¿Cómo se juega a 6 Pistas?</h3>
                </div>

                <div className="modal-ayuda-cuerpo">
                  <p><strong>1. Dinámica del juego:</strong></p>
                  <ul>
                    <li>Se van descubriendo hasta 6 pistas de un enigma (canción, película, personaje, etc.).</li>
                    <li>Hay <strong>10 segundos</strong> por pista.</li>
                    <li><strong>Pulsa el botón rojo</strong> para parar el tiempo e introducir tu respuesta. Dispones de <strong>15 segundos</strong> para responder.</li>
                  </ul>
                  <p><strong>2. Puntuación (Estándar):</strong></p>
                  <ul>
                    <li>Pista 1: <strong>+6 pts</strong> | Pista 2: <strong>+5 pts</strong></li>
                    <li>Pistas 3 y 4: <strong>4 y 3 pts</strong> | Pistas 5 y 6: <strong>2 y 1 pt</strong></li>
                    <li>Si fallas o se te acaba el tiempo, quedas eliminado exclusivamente durante esa ronda.</li>
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
        </>
      )}

      {/* 1. SETUP */}
      {fase === 'setup' && (
        <section className="game" style={{ position: 'relative' }}>
          <GameIntro gameId="pistas" titulo="6 Pistas (Un solo dispositivo)" />

          <div className="panel">
            <div className="hud" style={{ marginBottom: '1rem' }}>
              <button className="btn-back-inline" onClick={onVolver}>
                &larr; Cambiar modo
              </button>
            </div>

            <h3 className="panel-title"><Icon name="dice" size={22} /> Modo de Juego</h3>
            <div className="pts-selector-modo">
              <button
                type="button"
                className={`pts-btn-modo ${modo === 'estandar' ? 'activo' : ''}`}
                onClick={() => setModo('estandar')}
              >
                🏆 Estándar (Por Puntos)
              </button>
              <button
                type="button"
                className={`pts-btn-modo ${modo === 'supervivencia' ? 'activo' : ''}`}
                onClick={() => setModo('supervivencia')}
              >
                💀 Supervivencia (Vidas ❤️)
              </button>
            </div>
          </div>

          <div className="panel">
            <h3 className="panel-title"><Icon name="users" size={22} /> Participantes</h3>
            <label className="field-label" htmlFor="num-jugadores-pts">
              Número de jugadores ({MIN_JUGADORES} a {MAX_JUGADORES})
            </label>
            <select
              id="num-jugadores-pts"
              value={numJugadores}
              onChange={handleNumJugadoresChange}
            >
              {Array.from({ length: MAX_JUGADORES - MIN_JUGADORES + 1 }, (_, i) => (
                <option key={i + MIN_JUGADORES} value={i + MIN_JUGADORES}>
                  {i + MIN_JUGADORES} jugadores
                </option>
              ))}
            </select>

            <span className="field-label">Nombres</span>
            <div className="names-grid">
              {jugadores.map((j, idx) => (
                <input
                  key={j.id}
                  type="text"
                  value={j.nombre}
                  onChange={(e) => handleNombreChange(idx, e.target.value)}
                  placeholder={`Jugador ${j.id}`}
                  maxLength={30}
                  required
                />
              ))}
            </div>
          </div>

          <button className="big full" onClick={iniciarPartida}>
            <Icon name="play" size={24} /> ¡Empezar Partida!
          </button>
        </section>
      )}

      {/* 2. JUEGO EN CURSO CON PULSADOR ROJO */}
      {fase === 'jugando' && rondaData && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="flagFinish" size={18} />Ronda {rondaNum}</span>
            <span className="chip alt">
              {modo === 'estandar'
                ? `Pista ${pistasReveladas}/${MAX_PISTAS} (${MAX_PISTAS - pistasReveladas + 1} pts)`
                : `Supervivencia · Pista ${pistasReveladas}/${MAX_PISTAS}`}
            </span>
          </div>

          {/* Cronómetro */}
          <div className="timer" role="timer">
            <div
              className={`timer-bar ${segundosRestantes <= 3 ? 'low' : ''}`}
              style={{ width: `${(segundosRestantes / TIEMPO_PISTA_SEGUNDOS) * 100}%` }}
            />
          </div>
          <p className="timer-text" style={{ margin: '0.4rem 0 0.8rem' }}>
            <Icon name="clock" size={16} />
            {pulsadorActivo
              ? 'Tiempo detenido para responder...'
              : `${segundosRestantes} s para siguiente pista`}
          </p>

          {/* Marcador superior compacto */}
          <div className="scoreboard-container" style={{ justifyContent: 'center', marginBottom: '0.8rem' }}>
            {jugadores.map((j) => {
              const yaAcerto = acertadosRonda.find((a) => a.jugadorId === j.id);
              const eliminado = bloqueadosRonda.includes(j.id) || (modo === 'supervivencia' && vidas[j.id] <= 0);
              return (
                <div key={j.id} className={`score-pill ${eliminado ? 'locked' : ''}`}>
                  <span>
                    {j.nombre}: <strong>{modo === 'estandar' ? `${puntos[j.id] ?? 0} pts` : vidas[j.id] > 0 ? '❤️'.repeat(vidas[j.id]) : '💀'}</strong>
                  </span>
                  {yaAcerto && <span style={{ marginLeft: '4px' }}>✅</span>}
                  {eliminado && <span style={{ marginLeft: '4px' }}>❌</span>}
                </div>
              );
            })}
          </div>

          {/* Pistas descubiertas */}
          <div className="panel pts-pistas-box">
            <h3 className="panel-title">
              <Icon name="eye" size={20} /> Pistas descubiertas ({pistasReveladas}/{MAX_PISTAS})
            </h3>
            <div className="pts-pistas-lista">
              {rondaData.pistas.slice(0, pistasReveladas).map((pistaTexto, idx) => {
                const esUltima = idx === pistasReveladas - 1;
                return (
                  <div key={idx} className={`pts-pista-item ${esUltima ? 'actual' : ''}`}>
                    <span className="pts-pista-numero">#{idx + 1}</span>
                    <p className="pts-pista-txt">{pistaTexto}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CONTROL CON PULSADOR ROJO */}
          <div className="interactive-controls" style={{ marginTop: '0.8rem' }}>
            {!pulsadorActivo ? (
              <div className="pulsador-container">
                <button
                  type="button"
                  className="btn-pulsador-rojo"
                  onClick={handlePulsarBotonRojo}
                  disabled={jugadoresDisponibles.length === 0}
                >
                  <span className="pulsador-icono">🔴</span>
                  <span className="pulsador-texto">¡PULSAR PARA RESPONDER!</span>
                </button>

                {pistasReveladas === MAX_PISTAS && (
                  <button className="secondary danger full" style={{ marginTop: '0.6rem' }} onClick={cerrarRondaPorLimite}>
                    <Icon name="flag" size={18} /> Finalizar ronda y ver solución
                  </button>
                )}
              </div>
            ) : (
              <div className="respuesta-pulsada-box">
                <div className="respuesta-pulsada-header">
                  <span className="pulsado-badge">🔴 Tiempo detenido para responder</span>
                  <p className="hint small" style={{ margin: '0.3rem 0 0.4rem' }}>
                    Escribe tu respuesta y selecciona el jugador que responde:
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

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (jugadorSeleccionadoId && inputRespuesta.trim()) {
                      const jugador = jugadores.find((j) => j.id === jugadorSeleccionadoId);
                      if (jugador) confirmarRespuestaJugador(jugador);
                    }
                  }}
                >
                  <input
                    autoFocus
                    type="text"
                    className="player-text-input respuesta-input-grande"
                    placeholder="Película, canción, famoso, etc..."
                    value={inputRespuesta}
                    onChange={(e) => setInputRespuesta(e.target.value)}
                  />

                  {feedbackError && <p className="error" style={{ marginTop: '0.5rem' }}>{feedbackError}</p>}

                  <p className="form-label" style={{ marginTop: '0.8rem', textAlign: 'center' }}>
                    ¿Quién responde?
                  </p>

                  <div className="modal-players-grid">
                    {jugadoresDisponibles.map((j) => (
                      <button
                        key={j.id}
                        type="button"
                        className={`btn-modal-player ${jugadorSeleccionadoId === j.id ? 'active' : ''}`}
                        style={
                          jugadorSeleccionadoId === j.id
                            ? {
                                background: '#16a34a',
                                color: '#ffffff',
                                borderColor: '#15803d',
                                fontWeight: 700,
                                boxShadow: '0 2px 8px rgba(22, 163, 74, 0.3)'
                              }
                            : {}
                        }
                        onClick={() => setJugadorSeleccionadoId(j.id)}
                      >
                        {j.nombre} {jugadorSeleccionadoId === j.id ? '✓' : ''}
                      </button>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', marginTop: '1.2rem' }}>
                    <button
                      type="button"
                      className="btn-modal-cancel"
                      onClick={cancelarRespuesta}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn-start"
                      style={{
                        background: 'linear-gradient(135deg, #16a34a, #15803d)',
                        boxShadow: '0 4px 14px rgba(22, 163, 74, 0.4)'
                      }}
                      disabled={!jugadorSeleccionadoId || !inputRespuesta.trim()}
                    >
                      Responder
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 3. RESOLUCIÓN DE RONDA */}
      {fase === 'resolucion' && resultadoRonda && (
        <section className="game">
          <div className="end-card">
            <span className="end-icon">
              <Icon name={resultadoRonda.acertados?.length > 0 ? 'trophy' : 'hourglass'} size={44} />
            </span>

            <h1 className="title">Fin de la ronda</h1>

            <p className="reveal" style={{ fontSize: '1.4rem', margin: '0.8rem 0' }}>
              Era: <strong>{resultadoRonda.nombre}</strong>
            </p>

            <div className="pts-resumen-aciertos">
              {resultadoRonda.acertados && resultadoRonda.acertados.length > 0 ? (
                resultadoRonda.acertados.map((a) => (
                  <div key={a.jugadorId} className="pts-acierto-item">
                    <span><strong>{a.nombre}</strong> acertó en la pista #{a.pistaNum}</span>
                    <strong>{modo === 'estandar' ? `+${a.puntos} pts` : a.deltaVidas > 0 ? '+1 ❤️' : a.deltaVidas < 0 ? '-1 ❤️' : 'Mantiene ❤️'}</strong>
                  </div>
                ))
              ) : (
                <p className="hint">Nadie ha conseguido adivinar este enigma.</p>
              )}
            </div>

            <div className="scoreboard">
              {ranking.map((j, i) => {
                const pts = puntos[j.id] ?? 0;
                const v = vidas[j.id] ?? 0;
                return (
                  <div key={j.id} className="score-row">
                    <span className="score-name">
                      <span className="pos">{i + 1}</span>
                      {j.nombre}
                    </span>
                    <span className="score-pts">
                      {modo === 'estandar' ? `${pts} pts` : `${v > 0 ? '❤️'.repeat(v) : '💀 Eliminado'}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="actions">
            <button onClick={siguienteRonda}>
              <Icon name="play" size={20} /> Siguiente ronda ({rondaNum + 1})
            </button>
            <button className="secondary danger" onClick={() => setFase('final')}>
              <Icon name="flagFinish" size={20} /> Finalizar partida
            </button>
          </div>
        </section>
      )}

      {/* 4. FINAL */}
      {fase === 'final' && (
        <section className="game">
          <div className="end-card">
            <span className="end-icon"><Icon name="crown" size={44} /></span>
            <h1 className="title">Puntuaciones Finales</h1>
            <p className="final-score">
              {ganadores.length === 0
                ? 'Partida completada'
                : ganadores.length === 1
                ? <>¡Gana {ganadores[0].nombre}!</>
                : <>Empate entre {ganadores.map((g) => g.nombre).join(', ')}</>}
            </p>

            <div className="scoreboard">
              {ranking.map((j, i) => {
                const pts = puntos[j.id] ?? 0;
                const primero = maximo > 0 && pts === maximo;
                return (
                  <div key={j.id} className={`score-row ${primero ? 'first' : ''}`}>
                    <span className="score-name">
                      {primero ? <Icon name="crown" size={22} /> : <span className="pos">{i + 1}</span>}
                      {j.nombre}
                    </span>
                    <span className="score-pts">{pts} pts</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="actions">
            <button onClick={() => setFase('setup')}>
              <Icon name="refresh" size={20} /> Nueva partida
            </button>
            <button className="secondary danger" onClick={onVolver}>
              <Icon name="door" size={20} /> Volver al menú
            </button>
          </div>
        </section>
      )}
    </div>
  );
}