// client/src/games/Adivina/AdivinaLocal.jsx
import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../components/Icon.jsx';
import { reproducirClip, detenerClip } from './audioPlayer.js';
import './Adivina.css';
import { SelectorJugadores, BloqueConfig } from '../../components/MenuJuego.jsx';

const TIEMPO_RESPUESTA = 30; // segundos para responder tras pulsar

const MIN_JUGADORES = 2;
const MAX_JUGADORES = 15;

export default function AdivinaLocal({ onVolver, onExit }) {
  const [fase, setFase] = useState('setup');
  const [modalAyuda, setModalAyuda] = useState(false);

  const [modo, setModo] = useState('canciones'); // 'canciones' | 'peliculas'
  const [subcategoria, setSubcategoria] = useState('moderna'); // 'moderna' | 'antigua'

  const [numJugadores, setNumJugadores] = useState(4);
  const [jugadores, setJugadores] = useState([
    { id: 1, nombre: 'Jugador 1' },
    { id: 2, nombre: 'Jugador 2' },
    { id: 3, nombre: 'Jugador 3' },
    { id: 4, nombre: 'Jugador 4' }
  ]);
  const [puntos, setPuntos] = useState({});

  const [rondaNum, setRondaNum] = useState(1);
  const [rondaData, setRondaData] = useState(null);
  const [usados, setUsados] = useState([]);
  const [pistaActual, setPistaActual] = useState(1);
  const [bloqueados, setBloqueados] = useState([]);
  const [reproduciendoAudio, setReproduciendoAudio] = useState(false);
  const [segundosAudio, setSegundosAudio] = useState(20);

  const [pulsadorActivo, setPulsadorActivo] = useState(false);
  const [inputRespuesta, setInputRespuesta] = useState('');
  const [jugadorSeleccionadoId, setJugadorSeleccionadoId] = useState(null);
  const [segundosRespuesta, setSegundosRespuesta] = useState(TIEMPO_RESPUESTA);
  const [feedbackError, setFeedbackError] = useState('');
  const [resultadoRonda, setResultadoRonda] = useState(null);

  const inputRespuestaRef = useRef(inputRespuesta);
  useEffect(() => {
    inputRespuestaRef.current = inputRespuesta;
  }, [inputRespuesta]);

  const jugadorSeleccionadoRef = useRef(jugadorSeleccionadoId);
  useEffect(() => {
    jugadorSeleccionadoRef.current = jugadorSeleccionadoId;
  }, [jugadorSeleccionadoId]);

  const bloqueadosRef = useRef(bloqueados);
  useEffect(() => {
    bloqueadosRef.current = bloqueados;
  }, [bloqueados]);

  const jugadoresRef = useRef(jugadores);
  useEffect(() => {
    jugadoresRef.current = jugadores;
  }, [jugadores]);

  useEffect(() => {
    return () => detenerClip();
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
    listaActualizada.forEach((j) => (scores[j.id] = 0));
    setPuntos(scores);

    setRondaNum(1);
    setUsados([]);
    cargarNuevaRonda(1, []);
  };

  const cargarNuevaRonda = async (numRonda, listaUsados) => {
    detenerClip();
    try {
      const res = await fetch('/api/adivina/iniciar-ronda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modo, subcategoria, usados: listaUsados })
      });
      const data = await res.json();

      setRondaData(data);
      setUsados([...listaUsados, data.id]);
      setPistaActual(1);
      setBloqueados([]);
      setPulsadorActivo(false);
      setInputRespuesta('');
      setJugadorSeleccionadoId(null);
      setSegundosRespuesta(TIEMPO_RESPUESTA);
      setFeedbackError('');
      setReproduciendoAudio(false);
      setSegundosAudio(20);
      setResultadoRonda(null);
      setFase('jugando');
    } catch {
      alert('Error cargando la ronda.');
    }
  };

  const handlePulsarBotonRojo = () => {
    if (jugadoresDisponibles.length === 0) return;
    detenerClip();
    setReproduciendoAudio(false);
    setPulsadorActivo(true);
    setInputRespuesta('');
    setJugadorSeleccionadoId(null);
    setFeedbackError('');
    setSegundosRespuesta(TIEMPO_RESPUESTA);
  };

  const cancelarRespuesta = () => {
    setPulsadorActivo(false);
    setInputRespuesta('');
    setJugadorSeleccionadoId(null);
    setFeedbackError('');
  };

  useEffect(() => {
    if (!pulsadorActivo) {
      setSegundosRespuesta(TIEMPO_RESPUESTA);
      return;
    }

    setSegundosRespuesta(TIEMPO_RESPUESTA);
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
    const nuevosBloqueados = [...bloqueadosRef.current, jugador.id];
    setBloqueados(nuevosBloqueados);

    if (nuevosBloqueados.length >= jugadoresRef.current.length) {
      revelarSolucion('todos_fallaron');
    } else {
      setFeedbackError(avisoTexto || `¡${jugador.nombre} ha fallado!`);
      setTimeout(() => {
        cancelarRespuesta();
      }, 1500);
    }
  };

  const handleTiempoAgotadoLocal = () => {
    const jId = jugadorSeleccionadoRef.current;
    const texto = inputRespuestaRef.current.trim();

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
      confirmarRespuestaJugador(jugador, texto);
    } else {
      aplicarFallo(jugador, `¡${jugador.nombre} ha agotado el tiempo sin responder!`);
    }
  };

  const confirmarRespuestaJugador = async (jugador, textoOpcional) => {
    const texto = (textoOpcional !== undefined ? textoOpcional : inputRespuesta).trim();
    if (!texto || !pulsadorActivo) return;

    try {
      const res = await fetch('/api/adivina/validar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modo,
          subcategoria,
          id: rondaData.id,
          respuesta: texto
        })
      });
      const data = await res.json();

      if (data.acierto) {
        setPulsadorActivo(false);
        setInputRespuesta('');
        setJugadorSeleccionadoId(null);

        const ptsGanados = pistaActual === 1 ? 10 : pistaActual === 2 ? 5 : 3;
        setPuntos((prev) => ({
          ...prev,
          [jugador.id]: (prev[jugador.id] || 0) + ptsGanados
        }));

        setResultadoRonda({
          tipo: 'acierto',
          ganador: jugador,
          puntos: ptsGanados,
          titulo: data.tituloReal
        });
        setFase('resolucion');
      } else {
        aplicarFallo(jugador, `¡${jugador.nombre} ha fallado!`);
      }
    } catch {
      setFeedbackError('Error validando respuesta.');
    }
  };

  const revelarSolucion = async (motivo) => {
    detenerClip();
    try {
      const res = await fetch('/api/adivina/solucion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modo, subcategoria, id: rondaData.id })
      });
      const data = await res.json();

      setResultadoRonda({
        tipo: motivo,
        titulo: data.titulo,
        extra: data.extra
      });
      setPulsadorActivo(false);
      setJugadorSeleccionadoId(null);
      setFase('resolucion');
    } catch {
      setFase('setup');
    }
  };

  const avanzarPista = () => {
    if (pistaActual < 3) {
      detenerClip();
      setReproduciendoAudio(false);
      setPistaActual((prev) => prev + 1);
    }
  };

  const escucharEstribilloReal = () => {
    if (reproduciendoAudio) {
      detenerClip();
      setReproduciendoAudio(false);
      return;
    }
    setReproduciendoAudio(true);
    reproducirClip(
      rondaData.pista3,
      (segundos) => setSegundosAudio(segundos),
      () => setReproduciendoAudio(false)
    );
  };

  const siguienteRonda = () => {
    const sig = rondaNum + 1;
    setRondaNum(sig);
    cargarNuevaRonda(sig, usados);
  };

  const ranking = [...jugadores].sort((a, b) => (puntos[b.id] ?? 0) - (puntos[a.id] ?? 0));
  const maximo = ranking.length ? (puntos[ranking[0].id] ?? 0) : 0;
  const ganadores = maximo > 0 ? ranking.filter((j) => (puntos[j.id] ?? 0) === maximo) : [];
  const jugadoresDisponibles = jugadores.filter((j) => !bloqueados.includes(j.id));

  return (
    <div className="adv-contenedor">
      {/* AYUDA */}
      {fase === 'setup' && (
        <>

          {modalAyuda && (
            <div className="rg-modal-fondo" onClick={() => setModalAyuda(false)}>
              <div className="rg-modal modal-ayuda-juego" onClick={(e) => e.stopPropagation()}>
                <div className="modal-ayuda-header">
                  <span className="modal-ayuda-signo-title">?</span>
                  <h3>¿Cómo se juega a Adivina la Pista?</h3>
                </div>

                <div className="modal-ayuda-cuerpo">
                  <p><strong>1. Dinámica del juego:</strong></p>
                  <ul>
                    <li>Elige si jugar a adivinar <strong>Canciones</strong> (modernas o clásicas) o <strong>Películas</strong>.</li>
                    <li><strong>Pulsa el botón rojo</strong> para parar el tiempo e introducir el título. Dispondrás de <strong>30 segundos</strong> para responder.</li>
                    <li>Si aciertas, ganas la ronda. Si fallas (o se te acaba el tiempo), quedas eliminado esa ronda.</li>
                  </ul>
                  <p><strong>2. Puntuación:</strong></p>
                  <div className="tabla-ayuda-puntos">
                    <div className="fila-ayuda-puntos verde">
                      <span>🎯 Acierto en Pista 1</span>
                      <strong>+10 puntos</strong>
                    </div>
                    <div className="fila-ayuda-puntos amarillo">
                      <span>💡 Acierto en Pista 2</span>
                      <strong>+5 puntos</strong>
                    </div>
                    <div className="fila-ayuda-puntos azul">
                      <span>📝 Acierto en Pista 3</span>
                      <strong>+3 puntos</strong>
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

      {/* 1. SETUP */}
      {fase === 'setup' && (
        <SelectorJugadores
          onVolver={onVolver}
          onAyuda={() => setModalAyuda(true)}
          min={MIN_JUGADORES}
          max={MAX_JUGADORES}
          numJugadores={numJugadores}
          onCambiarNum={(n) => handleNumJugadoresChange({ target: { value: n } })}
          nombres={jugadores}
          onNombre={handleNombreChange}
          onEmpezar={iniciarPartida}
          textoBoton="¡Empezar Partida!"
          iconoBoton="play"
        >
          <BloqueConfig>
          <span className="qq-label-destacado qq-label-icono"><Icon name="dice" size={16} /> Modalidad</span>
          <div className="adv-selector-modo">
            <button
              type="button"
              className={`adv-btn-modo ${modo === 'canciones' ? 'activo' : ''}`}
              onClick={() => setModo('canciones')}
            >
              🎵 Canciones
            </button>
            <button
              type="button"
              className={`adv-btn-modo ${modo === 'peliculas' ? 'activo' : ''}`}
              onClick={() => setModo('peliculas')}
            >
              🎬 Películas
            </button>
          </div>

          {/* Subcategoría de canciones si modo === 'canciones' */}
          {modo === 'canciones' && (
            <div style={{ marginTop: '1.2rem' }}>
              <span className="field-label">Época musical:</span>
              <div className="adv-selector-modo" style={{ gridTemplateColumns: '1fr 1fr', marginTop: '0.4rem' }}>
                <button
                  type="button"
                  className={`adv-btn-modo ${subcategoria === 'moderna' ? 'activo' : ''}`}
                  onClick={() => setSubcategoria('moderna')}
                >
                  🔥 Moderna (Actual / Urbana)
                </button>
                <button
                  type="button"
                  className={`adv-btn-modo ${subcategoria === 'antigua' ? 'activo' : ''}`}
                  onClick={() => setSubcategoria('antigua')}
                >
                  📻 Clásica (80s, 90s, 2000s)
                </button>
              </div>
            </div>
          )}
          </BloqueConfig>
        </SelectorJugadores>
      )}

      {/* 2. EN JUEGO */}
      {fase === 'jugando' && rondaData && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="flagFinish" size={18} />Ronda {rondaNum}</span>
            <span className="chip alt">
              {modo === 'canciones'
                ? `🎵 ${subcategoria === 'antigua' ? 'Clásica' : 'Moderna'}`
                : '🎬 Película'} · Pista {pistaActual}/3 ({pistaActual === 1 ? '10 pts' : pistaActual === 2 ? '5 pts' : '3 pts'})
            </span>
          </div>

          <div className="scoreboard-container" style={{ justifyContent: 'center', marginBottom: '0.8rem' }}>
            {jugadores.map((j) => {
              const eliminado = bloqueados.includes(j.id);
              return (
                <div key={j.id} className={`score-pill ${eliminado ? 'locked' : ''}`}>
                  <span>{j.nombre}: <strong>{puntos[j.id] ?? 0} pts</strong></span>
                  {eliminado && <span style={{ marginLeft: '4px' }}>❌</span>}
                </div>
              );
            })}
          </div>

          <div className="panel adv-panel-pistas">
            <div className="adv-pista-caja activa">
              <span className="adv-pista-badge">
                Pista 1 ({modo === 'canciones' ? 'Frase' : 'Protagonistas'}) · 10 pts
              </span>
              <p className="adv-pista-contenido">
                {modo === 'canciones' ? `«${rondaData.pista1}»` : rondaData.pista1}
              </p>
            </div>

            {pistaActual >= 2 && (
              <div className="adv-pista-caja activa anim-aparecer">
                <span className="adv-pista-badge">
                  Pista 2 ({modo === 'canciones' ? 'Artista y Año' : 'Género y Año'}) · 5 pts
                </span>
                <p className="adv-pista-contenido">{rondaData.pista2}</p>
              </div>
            )}

            {pistaActual >= 3 && (
              <div className="adv-pista-caja activa anim-aparecer">
                <span className="adv-pista-badge">
                  Pista 3 ({modo === 'canciones' ? 'Música del tema (20s)' : 'Sinopsis mínima'}) · 3 pts
                </span>
                {modo === 'canciones' ? (
                  <div className="adv-audio-player">
                    {rondaData.pista3 ? (
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
                    {rondaData.pista3 && (
                      <p className="hint" style={{ fontSize: '0.75rem', marginTop: '0.4rem' }}>
                        Fragmento de audio proporcionado por{' '}
                        <a href="https://www.deezer.com" target="_blank" rel="noopener noreferrer">Deezer</a>
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="adv-pista-contenido">{rondaData.pista3}</p>
                )}
              </div>
            )}
          </div>

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

                <div className="adv-controles-ronda" style={{ width: '100%', marginTop: '0.6rem' }}>
                  {pistaActual < 3 ? (
                    <button className="secondary full" onClick={avanzarPista}>
                      <Icon name="forward" size={18} />
                      Siguiente pista ({pistaActual === 1 ? '5 pts' : '3 pts'})
                    </button>
                  ) : (
                    <button className="secondary danger full" onClick={() => revelarSolucion('rendicion')}>
                      <Icon name="flag" size={18} />
                      Rendirse y ver solución
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="respuesta-pulsada-box">
                <div className="respuesta-pulsada-header">
                  <span className="pulsado-badge">🔴 Tiempo detenido para responder</span>
                  <p className="hint small" style={{ margin: '0.3rem 0 0.4rem' }}>
                    Escribe el título y selecciona el jugador que responde:
                  </p>

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
                        width: `${(segundosRespuesta / TIEMPO_RESPUESTA) * 100}%`,
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
                    placeholder="Escribe el título..."
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

      {/* 3. RESOLUCIÓN */}
      {fase === 'resolucion' && resultadoRonda && (
        <section className="game">
          <div className="end-card">
            <span className="end-icon">
              <Icon name={resultadoRonda.tipo === 'acierto' ? 'trophy' : 'hourglass'} size={44} />
            </span>

            <h1 className="title">
              {resultadoRonda.tipo === 'acierto' ? '¡Punto conseguido!' : 'Ronda finalizada'}
            </h1>

            <p className="reveal" style={{ fontSize: '1.25rem', margin: '0.8rem 0' }}>
              Era: <strong>{resultadoRonda.titulo}</strong>
              {resultadoRonda.extra && <span style={{ display: 'block', fontSize: '0.95rem', color: '#64748b' }}>{resultadoRonda.extra}</span>}
            </p>

            <p className="categoria">
              {resultadoRonda.tipo === 'acierto'
                ? `¡${resultadoRonda.ganador.nombre} ha acertado y suma +${resultadoRonda.puntos} puntos!`
                : resultadoRonda.tipo === 'todos_fallaron'
                ? 'Todos los jugadores han fallado esta ronda.'
                : 'Os habéis rendido sin acertar.'}
            </p>

            <div className="scoreboard">
              {ranking.map((j, i) => {
                const pts = puntos[j.id] ?? 0;
                const lider = maximo > 0 && pts === maximo;
                return (
                  <div key={j.id} className={`score-row${lider ? ' first' : ''}`}>
                    <span className="score-name">
                      {lider ? <Icon name="crown" size={22} /> : <span className="pos">{i + 1}</span>}
                      {j.nombre}
                    </span>
                    <span className="score-pts">{pts} pts</span>
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
                ? 'Nadie ha sumado puntos'
                : ganadores.length === 1
                ? <>¡Gana {ganadores[0].nombre}!</>
                : <>Empate entre {ganadores.map((g) => g.nombre).join(', ')}</>}
            </p>

            <div className="scoreboard">
              {ranking.map((j, i) => {
                const pts = puntos[j.id] ?? 0;
                const lider = maximo > 0 && pts === maximo;
                return (
                  <div key={j.id} className={`score-row${lider ? ' first' : ''}`}>
                    <span className="score-name">
                      {lider ? <Icon name="crown" size={22} /> : <span className="pos">{i + 1}</span>}
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