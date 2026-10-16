// client/src/games/Adivina/AdivinaLocal.jsx
import React, { useState, useEffect } from 'react';
import Icon from '../../components/Icon.jsx';
import GameIntro from '../../components/GameIntro.jsx';
import { reproducirClip, detenerClip } from './audioPlayer.js';
import './Adivina.css';

const MIN_JUGADORES = 2;
const MAX_JUGADORES = 15;

export default function AdivinaLocal({ onVolver, onExit }) {
  const [fase, setFase] = useState('setup'); // 'setup' | 'jugando' | 'resolucion' | 'final'
  const [modalAyuda, setModalAyuda] = useState(false);

  const [modo, setModo] = useState('canciones');
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

  // NUEVO: Pulsador rojo offline
  const [pulsadorActivo, setPulsadorActivo] = useState(false);
  const [inputRespuesta, setInputRespuesta] = useState('');
  const [feedbackError, setFeedbackError] = useState('');

  const [resultadoRonda, setResultadoRonda] = useState(null);

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
        body: JSON.stringify({ modo, usados: listaUsados })
      });
      const data = await res.json();

      setRondaData(data);
      setUsados([...listaUsados, data.id]);
      setPistaActual(1);
      setBloqueados([]);
      setPulsadorActivo(false);
      setInputRespuesta('');
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
    setFeedbackError('');
  };

  const cancelarRespuesta = () => {
    setPulsadorActivo(false);
    setInputRespuesta('');
    setFeedbackError('');
  };

  const confirmarRespuestaJugador = async (jugador) => {
    if (!inputRespuesta.trim() || !pulsadorActivo) return;

    try {
      const res = await fetch('/api/adivina/validar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modo,
          id: rondaData.id,
          respuesta: inputRespuesta
        })
      });
      const data = await res.json();

      setPulsadorActivo(false);
      setInputRespuesta('');

      if (data.acierto) {
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
        const nuevosBloqueados = [...bloqueados, jugador.id];
        setBloqueados(nuevosBloqueados);

        if (nuevosBloqueados.length >= jugadores.length) {
          revelarSolucion('todos_fallaron');
        }
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
        body: JSON.stringify({ modo, id: rondaData.id })
      });
      const data = await res.json();

      setResultadoRonda({
        tipo: motivo,
        titulo: data.titulo,
        extra: data.extra
      });
      setPulsadorActivo(false);
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
                  <h3>¿Cómo se juega a Adivina la Pista?</h3>
                </div>

                <div className="modal-ayuda-cuerpo">
                  <p><strong>1. Dinámica del juego:</strong></p>
                  <ul>
                    <li>Elige si jugar a adivinar <strong>Canciones</strong> o <strong>Películas</strong>.</li>
                    <li><strong>Pulsa el botón rojo</strong> para parar el tiempo e introducir el título.</li>
                    <li>Si aciertas, ganas la ronda. Si fallas, quedas eliminado esa ronda.</li>
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
        <section className="game" style={{ position: 'relative' }}>
          <GameIntro gameId="adivina" titulo="Adivina la Pista (Un solo dispositivo)" />

          <div className="panel">
            <div className="hud" style={{ marginBottom: '1rem' }}>
              <button className="btn-back-inline" onClick={onVolver}>
                &larr; Cambiar modo
              </button>
            </div>

            <h3 className="panel-title"><Icon name="dice" size={22} /> Modalidad</h3>
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
          </div>

          <div className="panel">
            <h3 className="panel-title"><Icon name="users" size={22} /> Participantes</h3>
            <label className="field-label" htmlFor="num-jugadores-adv">
              Número de jugadores ({MIN_JUGADORES} a {MAX_JUGADORES})
            </label>
            <select
              id="num-jugadores-adv"
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

      {/* 2. EN JUEGO CON PULSADOR ROJO */}
      {fase === 'jugando' && rondaData && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="flagFinish" size={18} />Ronda {rondaNum}</span>
            <span className="chip alt">
              {modo === 'canciones' ? '🎵 Canción' : '🎬 Película'} · Pista {pistaActual}/3 ({pistaActual === 1 ? '10 pts' : pistaActual === 2 ? '5 pts' : '3 pts'})
            </span>
          </div>

          {/* Marcador superior compacto */}
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

          {/* Pistas */}
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
                  </div>
                ) : (
                  <p className="adv-pista-contenido">{rondaData.pista3}</p>
                )}
              </div>
            )}
          </div>

          {/* CONTROL DE PULSADOR ROJO */}
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
                  <p className="hint small" style={{ margin: '0.4rem 0 0.8rem' }}>
                    Escribe el título y pulsa en el nombre del jugador que responde:
                  </p>
                </div>

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
                      className="btn-modal-player"
                      disabled={!inputRespuesta.trim()}
                      onClick={() => confirmarRespuestaJugador(j)}
                    >
                      {j.nombre}
                    </button>
                  ))}
                </div>

                <div style={{ textAlign: 'center', marginTop: '0.8rem' }}>
                  <button
                    type="button"
                    className="btn-modal-cancel"
                    onClick={cancelarRespuesta}
                  >
                    Cancelar
                  </button>
                </div>
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