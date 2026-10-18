// client/src/games/FrasesCelebres/FrasesCelebresLocal.jsx
import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../components/Icon.jsx';
import GameIntro from '../../components/GameIntro.jsx';
import './FrasesCelebres.css';

const MIN_JUGADORES = 2;
const MAX_JUGADORES = 15;
const MAX_RONDAS = 10;
const TIEMPO_S = 30;

export default function FrasesCelebresLocal({ onVolver, onExit }) {
  const [fase, setFase] = useState('setup'); // 'setup' | 'jugando' | 'resolucion' | 'final'
  const [modalAyuda, setModalAyuda] = useState(false);

  const [numJugadores, setNumJugadores] = useState(4);
  const [jugadores, setJugadores] = useState([
    { id: 1, nombre: 'Jugador 1' },
    { id: 2, nombre: 'Jugador 2' },
    { id: 3, nombre: 'Jugador 3' },
    { id: 4, nombre: 'Jugador 4' }
  ]);
  const [puntos, setPuntos] = useState({});

  const [preguntas, setPreguntas] = useState([]);
  const [indicePregunta, setIndicePregunta] = useState(0);
  const [rondaActual, setRondaActual] = useState(1);
  const [errorCarga, setErrorCarga] = useState(null);

  // Estados de la frase en juego
  const [restante, setRestante] = useState(TIEMPO_S);
  const [bloqueados, setBloqueados] = useState([]);
  const [pulsadorActivo, setPulsadorActivo] = useState(false);
  const [jugadorSeleccionado, setJugadorSeleccionado] = useState(null);
  const [segundosRespuesta, setSegundosRespuesta] = useState(15);
  const [ultimoResultado, setUltimoResultado] = useState(null);

  const timerRef = useRef(null);
  const timerRespuestaRef = useRef(null);

  const jugadorSeleccionadoRef = useRef(jugadorSeleccionado);
  useEffect(() => {
    jugadorSeleccionadoRef.current = jugadorSeleccionado;
  }, [jugadorSeleccionado]);

  const bloqueadosRef = useRef(bloqueados);
  useEffect(() => {
    bloqueadosRef.current = bloqueados;
  }, [bloqueados]);

  const jugadoresRef = useRef(jugadores);
  useEffect(() => {
    jugadoresRef.current = jugadores;
  }, [jugadores]);

  useEffect(() => {
    fetch('/api/frasescelebres/preguntas')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        if (data.success && data.preguntas) {
          setPreguntas(data.preguntas);
        }
      })
      .catch((err) => {
        console.error('Error cargando frases:', err);
        setErrorCarga('No se pudieron cargar las frases desde el servidor.');
      });
  }, []);

  const handleNumJugadoresChange = (e) => {
    const num = parseInt(e.target.value, 10);
    setNumJugadores(num);
    const nuevos = Array.from({ length: num }, (_, i) => ({
      id: i + 1,
      nombre: jugadores[i]?.nombre || `Jugador ${i + 1}`
    }));
    setJugadores(nuevos);
  };

  const handleNombreChange = (index, val) => {
    const nuevos = [...jugadores];
    nuevos[index] = { ...nuevos[index], nombre: val };
    setJugadores(nuevos);
  };

  const iniciarPartida = () => {
    const listaActualizada = jugadores.map((j) => ({
      ...j,
      nombre: j.nombre.trim() || `Jugador ${j.id}`
    }));
    setJugadores(listaActualizada);

    const scores = {};
    listaActualizada.forEach((j) => { scores[j.id] = 0; });
    setPuntos(scores);

    setRondaActual(1);
    setIndicePregunta(0);
    iniciarFrase();
  };

  const iniciarFrase = () => {
    setRestante(TIEMPO_S);
    setBloqueados([]);
    setPulsadorActivo(false);
    setJugadorSeleccionado(null);
    setSegundosRespuesta(15);
    setUltimoResultado(null);
    setFase('jugando');
  };

  // Temporizador general de 30s de la ronda
  useEffect(() => {
    if (fase !== 'jugando' || pulsadorActivo) {
      clearInterval(timerRef.current);
      return;
    }

    const fin = Date.now() + restante * 1000;
    timerRef.current = setInterval(() => {
      const r = (fin - Date.now()) / 1000;
      if (r <= 0) {
        clearInterval(timerRef.current);
        setRestante(0);
        cerrarPorTiempo();
      } else {
        setRestante(r);
      }
    }, 100);

    return () => clearInterval(timerRef.current);
  }, [fase, pulsadorActivo]);

  const preguntaActual = preguntas[indicePregunta % (preguntas.length || 1)] || {
    frase: "Solo sé que no sé nada.",
    autor: "Sócrates",
    opciones: ["Platón", "Aristóteles", "Sócrates", "Séneca"]
  };

  const preguntaActualRef = useRef(preguntaActual);
  useEffect(() => {
    preguntaActualRef.current = preguntaActual;
  }, [preguntaActual]);

  const handlePulsarBotonRojo = () => {
    if (jugadoresDisponibles.length === 0) return;
    setPulsadorActivo(true);
    setJugadorSeleccionado(null);
    setSegundosRespuesta(15);
  };

  const cancelarRespuesta = () => {
    setPulsadorActivo(false);
    setJugadorSeleccionado(null);
  };

  // Temporizador de 15s al pulsar el botón rojo
  useEffect(() => {
    if (!pulsadorActivo) {
      setSegundosRespuesta(15);
      return;
    }

    setSegundosRespuesta(15);
    timerRespuestaRef.current = setInterval(() => {
      setSegundosRespuesta((prev) => {
        if (prev <= 0.1) {
          clearInterval(timerRespuestaRef.current);
          handleTiempoAgotadoPulsador();
          return 0;
        }
        return Math.max(0, prev - 0.1);
      });
    }, 100);

    return () => clearInterval(timerRespuestaRef.current);
  }, [pulsadorActivo]);

  const aplicarFallo = (jugadorId) => {
    setPuntos((prev) => ({
      ...prev,
      [jugadorId]: (prev[jugadorId] ?? 0) - 1
    }));

    const nuevosBloqueados = [...bloqueadosRef.current, jugadorId];
    setBloqueados(nuevosBloqueados);
    setPulsadorActivo(false);
    setJugadorSeleccionado(null);

    if (nuevosBloqueados.length >= jugadoresRef.current.length) {
      setUltimoResultado({
        tipo: 'todos_fallaron',
        autorCorrecto: preguntaActualRef.current.autor
      });
      setFase('resolucion');
    }
  };

  const handleTiempoAgotadoPulsador = () => {
    const jId = jugadorSeleccionadoRef.current;
    if (!jId) {
      // Si no se eligió jugador, simplemente se cierra el modal
      cancelarRespuesta();
    } else {
      // Si hay jugador seleccionado y se agotó el tiempo, cuenta como fallo
      aplicarFallo(jId);
    }
  };

  const responderOpcion = (opcionElegida) => {
    if (!jugadorSeleccionado) return;

    const jugador = jugadores.find((j) => j.id === jugadorSeleccionado);
    const esCorrecto = opcionElegida === preguntaActual.autor;

    if (esCorrecto) {
      setPuntos((prev) => ({
        ...prev,
        [jugador.id]: (prev[jugador.id] ?? 0) + 3
      }));

      setUltimoResultado({
        tipo: 'acierto',
        jugador: jugador.nombre,
        autorCorrecto: preguntaActual.autor,
        puntosGanados: 3
      });
      setPulsadorActivo(false);
      setJugadorSeleccionado(null);
      setFase('resolucion');
    } else {
      aplicarFallo(jugador.id);
    }
  };

  const cerrarPorTiempo = () => {
    setUltimoResultado({
      tipo: 'tiempo',
      autorCorrecto: preguntaActual.autor
    });
    setFase('resolucion');
  };

  const siguienteFrase = () => {
    if (rondaActual >= MAX_RONDAS) {
      setFase('final');
    } else {
      setRondaActual((r) => r + 1);
      setIndicePregunta((p) => p + 1);
      iniciarFrase();
    }
  };

  const ranking = [...jugadores].sort((a, b) => (puntos[b.id] ?? 0) - (puntos[a.id] ?? 0));
  const maximo = ranking.length ? (puntos[ranking[0].id] ?? 0) : 0;
  const ganadores = maximo > 0 ? ranking.filter((j) => (puntos[j.id] ?? 0) === maximo) : [];
  const jugadoresDisponibles = jugadores.filter((j) => !bloqueados.includes(j.id));
  const jugadorEnTurno = jugadores.find((j) => j.id === jugadorSeleccionado);

  return (
    <div className="aprox-contenedor">
      {/* AYUDA */}
      {fase === 'setup' && (
        <>
          <button
            type="button"
            className="aprox-btn-ayuda"
            onClick={() => setModalAyuda(true)}
            title="Reglas y puntuación"
          >
            <span className="aprox-btn-ayuda-signo">?</span>
          </button>

          {modalAyuda && (
            <div className="rg-modal-fondo" onClick={() => setModalAyuda(false)}>
              <div className="rg-modal aprox-modal-ayuda" onClick={(e) => e.stopPropagation()}>
                <div className="aprox-modal-header">
                  <h3>¿Cómo se juega a Frases Célebres?</h3>
                </div>

                <div className="aprox-modal-cuerpo">
                  <p><strong>1. Dinámica del juego:</strong></p>
                  <ul>
                    <li>Aparece la frase con las 4 opciones de autor (A, B, C y D).</li>
                    <li>Disponéis de <strong>30 segundos</strong> de tiempo común.</li>
                    <li><strong>Pulsa el botón rojo</strong> para parar el tiempo. Dispondrás de <strong>15 segundos</strong> para seleccionar quién ha pulsado y tocar la opción correcta.</li>
                  </ul>
                  <p><strong>2. Puntuación:</strong></p>
                  <div className="aprox-tabla-puntos">
                    <div className="aprox-puntos-fila acierto">
                      <span>🎯 Acierto</span>
                      <strong>+3 puntos</strong>
                    </div>
                    <div className="aprox-puntos-fila lejana">
                      <span>❌ Fallo o tiempo agotado</span>
                      <strong>-1 punto (quedando fuera de la frase)</strong>
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
        </>
      )}

      {/* 1. SETUP DE JUGADORES */}
      {fase === 'setup' && (
        <section className="game" style={{ position: 'relative' }}>
          <GameIntro gameId="frasescelebres" titulo="Frases Célebres (Un solo dispositivo)" />

          {errorCarga && <p className="error" role="alert">{errorCarga}</p>}

          <div className="panel">
            <div className="hud" style={{ marginBottom: '1rem' }}>
              <button className="btn-back-inline" onClick={onVolver}>
                &larr; Cambiar modo
              </button>
            </div>

            <h3 className="panel-title"><Icon name="users" size={22} /> Participantes</h3>
            <label className="field-label" htmlFor="num-jugadores-fc">
              Número de jugadores ({MIN_JUGADORES} a {MAX_JUGADORES})
            </label>
            <select
              id="num-jugadores-fc"
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

      {/* 2. JUGANDO: FRASE + OPCIONES + PULSADOR ROJO */}
      {fase === 'jugando' && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="flagFinish" size={18} />Frase {rondaActual} de {MAX_RONDAS}</span>
            <span className="chip alt"><Icon name="zap" size={18} />30s</span>
          </div>

          {/* Marcador superior */}
          <div className="scoreboard-container" style={{ justifyContent: 'center', marginBottom: '0.8rem' }}>
            {jugadores.map((j) => {
              const fuera = bloqueados.includes(j.id);
              return (
                <div key={j.id} className={`score-pill ${fuera ? 'locked' : ''}`}>
                  <span>{j.nombre}: <strong>{puntos[j.id] ?? 0} pts</strong></span>
                  {fuera && <span style={{ marginLeft: '4px' }}>❌</span>}
                </div>
              );
            })}
          </div>

          {/* Temporizador general de la frase */}
          <div className="timer" role="timer">
            <div
              className={`timer-bar ${restante <= 7 ? 'low' : ''}`}
              style={{ width: `${(restante / TIEMPO_S) * 100}%` }}
            />
          </div>
          <p className="timer-text">
            <Icon name="clock" size={16} />
            {pulsadorActivo ? 'Tiempo detenido para responder...' : `${Math.ceil(restante)} s`}
          </p>

          {/* Tarjeta de la frase */}
          <div className="panel aprox-pregunta-card" style={{ padding: '1.8rem 1.4rem' }}>
            <span className="aprox-badge-pregunta">¿Quién dijo esta frase?</span>
            <h2 className="fc-frase-texto">
              «{preguntaActual.frase}»
            </h2>
          </div>

          {/* 4 OPCIONES: ACTIVAS O EN REPOSO SEGÚN EL ESTADO */}
          <div className="fc-opciones-grid" style={{ marginBottom: '1.2rem' }}>
            {preguntaActual.opciones.map((opcion, idx) => {
              const esPulsable = pulsadorActivo && jugadorSeleccionado !== null;

              return (
                <button
                  key={idx}
                  type="button"
                  className={`fc-btn-opcion ${esPulsable ? 'activa-pulsable' : 'bloqueada-vista'}`}
                  disabled={!esPulsable}
                  onClick={() => responderOpcion(opcion)}
                >
                  <span className="fc-opcion-letra">{String.fromCharCode(65 + idx)}</span>
                  <span className="fc-opcion-nombre">{opcion}</span>
                </button>
              );
            })}
          </div>

          {/* ZONA DE PULSADOR ROJO O SELECCIÓN DE JUGADOR */}
          <div className="interactive-controls">
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
              </div>
            ) : (
              <div className="respuesta-pulsada-box">
                <div className="respuesta-pulsada-header">
                  <span className="pulsado-badge">🔴 Tiempo detenido (+3 pts / -1 pt)</span>
                  <p className="hint small" style={{ margin: '0.3rem 0 0.4rem' }}>
                    {!jugadorSeleccionado
                      ? 'Selecciona quién va a responder:'
                      : `Turno de ${jugadorEnTurno?.nombre}. ¡Toca una de las 4 opciones de arriba!`}
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

                {!jugadorSeleccionado ? (
                  <div className="modal-players-grid">
                    {jugadoresDisponibles.map((j) => (
                      <button
                        key={j.id}
                        type="button"
                        className="btn-modal-player"
                        onClick={() => setJugadorSeleccionado(j.id)}
                      >
                        {j.nombre}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="modal-players-grid" style={{ marginBottom: '0.5rem' }}>
                    {jugadoresDisponibles.map((j) => (
                      <button
                        key={j.id}
                        type="button"
                        className={`btn-modal-player ${jugadorSeleccionado === j.id ? 'active' : ''}`}
                        style={
                          jugadorSeleccionado === j.id
                            ? {
                                background: '#16a34a',
                                color: '#ffffff',
                                borderColor: '#15803d',
                                fontWeight: 700,
                                boxShadow: '0 2px 8px rgba(22, 163, 74, 0.3)'
                              }
                            : {}
                        }
                        onClick={() => setJugadorSeleccionado(j.id)}
                      >
                        {j.nombre} {jugadorSeleccionado === j.id ? '✓' : ''}
                      </button>
                    ))}
                  </div>
                )}

                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                  <button
                    type="button"
                    className="btn-modal-cancel"
                    onClick={cancelarRespuesta}
                  >
                    Cancelar y reanudar tiempo
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 3. RESOLUCIÓN */}
      {fase === 'resolucion' && ultimoResultado && (
        <section className="game">
          <div className="end-card aprox-resolucion-card">
            <span className="end-icon">
              <Icon name={ultimoResultado.tipo === 'acierto' ? 'trophy' : 'hourglass'} size={44} />
            </span>

            <p className="categoria">Frase {rondaActual} de {MAX_RONDAS}</p>
            <h1 className="title">
              {ultimoResultado.tipo === 'acierto' ? '¡Punto conseguido!' : 'Fin de la frase'}
            </h1>

            <p className="reveal" style={{ fontSize: '1.25rem', margin: '0.8rem 0' }}>
              Autor correcto: <strong>{ultimoResultado.autorCorrecto}</strong>
            </p>

            <p className="categoria">
              {ultimoResultado.tipo === 'acierto'
                ? `¡${ultimoResultado.jugador} acertó y suma +3 puntos!`
                : ultimoResultado.tipo === 'todos_fallaron'
                ? 'Todos los jugadores han fallado esta frase.'
                : 'Se agotó el tiempo de 30 segundos.'}
            </p>

            <div className="scoreboard" style={{ width: '100%', marginTop: '1rem' }}>
              {ranking.map((j, i) => {
                const pts = puntos[j.id] ?? 0;
                const primero = maximo > 0 && pts === maximo;
                return (
                  <div key={j.id} className={`score-row${primero ? ' first' : ''}`}>
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
            {rondaActual < MAX_RONDAS ? (
              <button onClick={siguienteFrase}>
                <Icon name="play" size={20} />
                Siguiente frase ({rondaActual + 1} de {MAX_RONDAS})
              </button>
            ) : (
              <button onClick={() => setFase('final')}>
                <Icon name="trophy" size={20} />
                Ver resultados finales 🏆
              </button>
            )}
            <button className="secondary danger" onClick={() => setFase('final')}>
              <Icon name="flagFinish" size={20} />
              Finalizar partida
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
                ? 'Nadie ha sumado puntos'
                : ganadores.length === 1
                ? <>¡Gana {ganadores[0].nombre}!</>
                : <>Empate entre {ganadores.map((g) => g.nombre).join(', ')}</>}
            </p>

            <div className="scoreboard">
              {ranking.map((j, i) => {
                const pts = puntos[j.id] ?? 0;
                const primero = maximo > 0 && pts === maximo;
                return (
                  <div key={j.id} className={`score-row${primero ? ' first' : ''}`}>
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