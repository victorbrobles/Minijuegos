// client/src/games/Cancion/CancionLocal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import GameIntro from '../../components/GameIntro.jsx';
import { reproducir, pausarAudio, reanudarAudio, detenerReproduccion } from './audioPlayerCancion.js';
import './Cancion.css';
import '../Adivina/Adivina.css'; 

const MIN_JUGADORES = 2;
const MAX_JUGADORES = 20;
const TIEMPO_RESPUESTA = 60;

const COLORES = ['#ef4444', '#2563eb', '#16a34a', '#f59e0b', '#9333ea', '#ec4899', '#0d9488', '#ea580c', '#475569', '#65a30d'];

function BotonVolver({ onClick, texto = 'Volver' }) {
  return (
    <button type="button" className="qq-link-volver" onClick={onClick}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      <span>{texto}</span>
    </button>
  );
}

export default function CancionLocal({ onVolver, onExit, onAbrirAyuda }) {
  const navigate = useNavigate();
  const [fase, setFase] = useState('setup');
  const [modalSalirPortada, setModalSalirPortada] = useState(false);

  const [numJugadores, setNumJugadores] = useState(4);
  const [jugadores, setJugadores] = useState([
    { id: 1, nombre: 'Jugador 1' },
    { id: 2, nombre: 'Jugador 2' },
    { id: 3, nombre: 'Jugador 3' },
    { id: 4, nombre: 'Jugador 4' }
  ]);
  const [puntos, setPuntos] = useState({});

  const [rondaNum, setRondaNum] = useState(1);
  const [cancionActual, setCancionActual] = useState(null);
  const [usados, setUsados] = useState([]);
  const [bloqueados, setBloqueados] = useState([]);

  const [sonando, setSonando] = useState(false);
  const [segundosAudio, setSegundosAudio] = useState(30);

  const [pulsado, setPulsado] = useState(false);
  const [inputTexto, setInputTexto] = useState('');
  const [mensajeFeedback, setMensajeFeedback] = useState(null);
  const [resultadoRonda, setResultadoRonda] = useState(null);

  const [tiempoRespuesta, setTiempoRespuesta] = useState(TIEMPO_RESPUESTA);
  const timerRespuestaRef = useRef(null);

  useEffect(() => {
    return () => detenerReproduccion();
  }, []);

  const handleSalirAPortada = () => {
    setModalSalirPortada(false);
    if (typeof onExit === 'function') {
      onExit();
    } else {
      try {
        navigate('/');
      } catch {
        window.location.href = '/';
      }
    }
  };

  const actualizarCantidadJugadores = (nuevoNum) => {
    const num = Math.max(MIN_JUGADORES, Math.min(MAX_JUGADORES, nuevoNum));
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
    const lista = jugadores.map((j) => ({
      ...j,
      nombre: j.nombre.trim() || `Jugador ${j.id}`
    }));
    setJugadores(lista);

    const scores = {};
    lista.forEach((j) => { scores[j.id] = 0; });
    setPuntos(scores);

    setRondaNum(1);
    setUsados([]);
    cargarNuevaRonda(1, []);
  };

  const cargarNuevaRonda = async (ronda, usadosLista) => {
    detenerReproduccion();
    try {
      const res = await fetch('/api/cancion/iniciar-ronda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usados: usadosLista })
      });
      const data = await res.json();

      setCancionActual(data);
      setUsados([...usadosLista, data.id]);
      setBloqueados([]);
      setSegundosAudio(30);
      setSonando(false);
      setPulsado(false);
      setInputTexto('');
      setMensajeFeedback(null);
      setResultadoRonda(null);
      setTiempoRespuesta(TIEMPO_RESPUESTA);
      setFase('jugando');
    } catch {
      alert('Error cargando la canción.');
    }
  };

  const toggleReproductor = () => {
    if (sonando) {
      pausarAudio();
      setSonando(false);
    } else {
      setSonando(true);
      if (segundosAudio < 30 && segundosAudio > 0) {
        reanudarAudio();
      } else {
        reproducir(
          cancionActual?.audio,
          (s) => setSegundosAudio(s),
          () => setSonando(false)
        );
      }
    }
  };

  const handlePulsar = () => {
    if (jugadoresDisponibles.length === 0) return;
    pausarAudio();
    setSonando(false);
    setPulsado(true);
    setInputTexto('');
    setTiempoRespuesta(TIEMPO_RESPUESTA);
  };

  const cancelarPulsado = () => {
    setPulsado(false);
    setInputTexto('');
    setTiempoRespuesta(TIEMPO_RESPUESTA);
    if (segundosAudio > 0) {
      setSonando(true);
      reanudarAudio();
    }
  };

  const cancelarPulsadoRef = useRef();
  useEffect(() => {
    cancelarPulsadoRef.current = cancelarPulsado;
  });

  useEffect(() => {
    if (!pulsado) {
      if (timerRespuestaRef.current) clearInterval(timerRespuestaRef.current);
      return;
    }

    setTiempoRespuesta(TIEMPO_RESPUESTA);
    if (timerRespuestaRef.current) clearInterval(timerRespuestaRef.current);

    timerRespuestaRef.current = setInterval(() => {
      setTiempoRespuesta((prev) => {
        if (prev <= 1) {
          clearInterval(timerRespuestaRef.current);
          if (cancelarPulsadoRef.current) cancelarPulsadoRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRespuestaRef.current) clearInterval(timerRespuestaRef.current);
    };
  }, [pulsado]);

  const confirmarRespuesta = async (jugador) => {
    if (!inputTexto.trim()) return;

    if (timerRespuestaRef.current) clearInterval(timerRespuestaRef.current);

    try {
      const res = await fetch('/api/cancion/validar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: cancionActual.id,
          respuesta: inputTexto
        })
      });
      const data = await res.json();

      setPulsado(false);

      if (data.acierto) {
        detenerReproduccion();
        setPuntos((prev) => ({
          ...prev,
          [jugador.id]: (prev[jugador.id] || 0) + data.puntosAcierto
        }));
        setResultadoRonda({
          tipo: 'acierto',
          ganador: jugador,
          puntos: data.puntosAcierto,
          titulo: `${data.tituloReal} — ${data.artistaReal}`
        });
        setFase('resolucion');
      } else {
        setPuntos((prev) => ({
          ...prev,
          [jugador.id]: Math.max(0, (prev[jugador.id] || 0) - data.puntosFallo)
        }));

        const nuevosBloqueados = [...bloqueados, jugador.id];
        setBloqueados(nuevosBloqueados);

        if (nuevosBloqueados.length >= jugadores.length) {
          revelarSolucion('todos_fallaron');
        } else {
          setMensajeFeedback({
            tipo: 'fallo',
            texto: `¡Incorrecto! ${jugador.nombre} resta -${data.puntosFallo} pts. ¡Rebote para el resto!`
          });
          if (segundosAudio > 0) {
            setSonando(true);
            reanudarAudio();
          }
        }
      }
    } catch {
      alert('Error validando respuesta.');
    }
  };

  const revelarSolucion = async (motivo) => {
    detenerReproduccion();
    try {
      const res = await fetch('/api/cancion/solucion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: cancionActual.id })
      });
      const data = await res.json();

      setResultadoRonda({
        tipo: motivo,
        titulo: `${data.titulo} — ${data.artista}`
      });
      setFase('resolucion');
    } catch {
      setFase('setup');
    }
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

  const enPartidaActiva = fase !== 'setup';

  return (
    <div className={`cancion-contenedor ${enPartidaActiva ? 'qq-en-partida' : ''}`}>

      {fase === 'setup' && (
        <section className="game">
          <div className="panel qq-menu-panel">
            <div className="qq-card-top">
              <BotonVolver onClick={onVolver} />
              <button
                type="button"
                className="qq-btn-ayuda"
                onClick={onAbrirAyuda}
                title="Cómo jugar"
                aria-label="Cómo jugar"
              >
                ?
              </button>
            </div>

            <div className="qq-config-header">
              <div className="qq-hero-icono chico">
                <Icon name="users" size={32} />
              </div>
              <div>
                <h2 className="qq-config-titulo">Jugadores</h2>
                <p className="qq-config-sub">
                  Configura quiénes van a participar ({MIN_JUGADORES} a {MAX_JUGADORES} jugadores)
                </p>
              </div>
            </div>

            <div className="qq-selector-cantidad-box">
              <label className="qq-label-destacado" htmlFor="num-jugadores-can">
                Número de participantes
              </label>
              <div className="qq-stepper-row">
                <button
                  type="button"
                  className="qq-stepper-btn"
                  disabled={numJugadores <= MIN_JUGADORES}
                  onClick={() => actualizarCantidadJugadores(numJugadores - 1)}
                >
                  &minus;
                </button>
                <select
                  id="num-jugadores-can"
                  className="qq-select-jugadores"
                  value={numJugadores}
                  onChange={(e) => actualizarCantidadJugadores(parseInt(e.target.value, 10))}
                >
                  {Array.from({ length: MAX_JUGADORES - MIN_JUGADORES + 1 }, (_, i) => (
                    <option key={i + MIN_JUGADORES} value={i + MIN_JUGADORES}>
                      {i + MIN_JUGADORES} jugadores
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="qq-stepper-btn"
                  disabled={numJugadores >= MAX_JUGADORES}
                  onClick={() => actualizarCantidadJugadores(numJugadores + 1)}
                >
                  +
                </button>
              </div>
            </div>

            <span className="qq-label-destacado" style={{ marginTop: '1.2rem', display: 'block' }}>
              Nombres de los jugadores
            </span>
            <div className="qq-nombres-grid">
              {jugadores.map((j, idx) => (
                <div key={j.id} className="qq-jugador-input-card">
                  <span
                    className="qq-jugador-badge"
                    style={{ background: COLORES[idx % COLORES.length] }}
                  >
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={j.nombre}
                    onChange={(e) => handleNombreChange(idx, e.target.value)}
                    placeholder={`Jugador ${j.id}`}
                    maxLength={25}
                    required
                  />
                </div>
              ))}
            </div>

            <button
              type="button"
              className="big full qq-btn-principal"
              style={{ marginTop: '1.5rem' }}
              onClick={iniciarPartida}
            >
              <Icon name="play" size={22} /> ¡Empezar Partida!
            </button>
          </div>
        </section>
      )}

      {fase === 'jugando' && cancionActual && (
        <section className="game">
          <div className="panel qq-menu-panel">
            <div className="qq-card-top" style={{ marginBottom: '0.8rem' }}>
              <BotonVolver texto="Volver a la portada" onClick={() => setModalSalirPortada(true)} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="qq-tablero-badge" style={{ marginBottom: 0 }}>
                  Ronda {rondaNum}
                </span>
              </div>
            </div>

            <div className="scoreboard-container" style={{ justifyContent: 'center', marginBottom: '0.8rem' }}>
              {jugadores.map((j) => (
                <div key={j.id} className={`score-pill ${bloqueados.includes(j.id) ? 'locked' : ''}`}>
                  <span>{j.nombre}: <strong>{puntos[j.id] ?? 0} pts</strong></span>
                  {bloqueados.includes(j.id) && <span style={{ marginLeft: '4px' }}>❌</span>}
                </div>
              ))}
            </div>

            <div className="adv-pista-caja activa" style={{ margin: 0, width: '100%', marginBottom: '1.2rem' }}>
              <span className="adv-pista-badge" style={{ marginBottom: '0.8rem' }}>
                🎵 MÚSICA DEL TEMA (30S)
              </span>
              <div className="adv-audio-player" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem', marginTop: '0.2rem' }}>
                {cancionActual.audio ? (
                  <button
                    type="button"
                    className={`adv-btn-audio ${sonando ? 'sonando' : ''}`}
                    onClick={toggleReproductor}
                    disabled={pulsado}
                  >
                    <Icon name={sonando ? 'pause' : 'play'} size={20} />
                    {sonando
                      ? `Reproduciendo música (${segundosAudio}s)...`
                      : segundosAudio < 30 && segundosAudio > 0
                      ? `Reanudar música (${segundosAudio}s restantes)`
                      : 'Escuchar la canción (30s)'}
                  </button>
                ) : (
                  <p className="hint">Audio no disponible para este tema.</p>
                )}
                {cancionActual.audio && (
                  <p className="hint" style={{ fontSize: '0.75rem', marginTop: '0.3rem' }}>
                    Fragmento de audio proporcionado por{' '}
                    <a href="https://www.deezer.com" target="_blank" rel="noopener noreferrer">Deezer</a>
                  </p>
                )}
              </div>
            </div>

            {mensajeFeedback && (
              <div className={`status-alert ${mensajeFeedback.tipo}`} style={{ marginBottom: '1rem' }}>
                {mensajeFeedback.texto}
              </div>
            )}

            <div className="cancion-pulsador-wrapper" style={{ marginTop: '0' }}>
              {!pulsado ? (
                <div className="pulsador-container">
                  <button
                    type="button"
                    className="btn-pulsador-rojo"
                    onClick={handlePulsar}
                    disabled={jugadoresDisponibles.length === 0}
                  >
                    <span className="pulsador-icono">🔴</span>
                    <span className="pulsador-texto">¡PULSAR PARA RESPONDER!</span>
                  </button>

                  <div className="qq-tablero-footer" style={{ marginTop: '0.8rem', width: '100%' }}>
                    <button type="button" className="qq-link-otra-ronda" onClick={() => revelarSolucion('rendicion')}>
                      Rendirse y ver solución
                    </button>
                  </div>
                </div>
              ) : (
                <div className="respuesta-pulsada-box" style={{ width: '100%' }}>
                  <div className="respuesta-pulsada-header">
                    <span className="pulsado-badge">🔴 Tiempo de música congelado</span>
                    <p className="hint small" style={{ margin: '0.4rem 0' }}>
                      Escribe el título de la canción y pulsa en el nombre del jugador:
                    </p>
                  </div>

                  <div style={{ padding: '0', marginTop: '0.5rem', marginBottom: '0.8rem' }}>
                    <div
                      className="timer"
                      role="timer"
                      style={{ margin: '0.4rem 0', background: '#e2e8f0', borderRadius: '9999px', height: '8px', overflow: 'hidden' }}
                    >
                      <div
                        className={`timer-bar ${tiempoRespuesta <= 15 ? 'low' : ''}`}
                        style={{
                          width: `${(tiempoRespuesta / TIEMPO_RESPUESTA) * 100}%`,
                          height: '100%',
                          backgroundColor: tiempoRespuesta <= 15 ? '#ef4444' : '#16a34a',
                          borderRadius: '9999px',
                          transition: 'width 0.1s linear, background-color 0.3s ease'
                        }}
                      />
                    </div>
                    <p
                      className="timer-text"
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                        color: tiempoRespuesta <= 15 ? '#dc2626' : '#64748b', fontSize: '0.9rem', fontWeight: 700, margin: '0'
                      }}
                    >
                      <Icon name="clock" size={16} />
                      {tiempoRespuesta} s para responder
                    </p>
                  </div>

                  <input
                    autoFocus
                    type="text"
                    className="player-text-input respuesta-input-grande"
                    placeholder="Título de la canción..."
                    value={inputTexto}
                    onChange={(e) => setInputTexto(e.target.value)}
                  />

                  <p className="form-label" style={{ marginTop: '0.8rem', textAlign: 'center' }}>
                    ¿Quién responde? (+10 / -5 pts)
                  </p>

                  <div className="modal-players-grid">
                    {jugadoresDisponibles.map((j) => (
                      <button
                        key={j.id}
                        type="button"
                        className="btn-modal-player"
                        disabled={!inputTexto.trim()}
                        onClick={() => confirmarRespuesta(j)}
                      >
                        {j.nombre}
                      </button>
                    ))}
                  </div>

                  <div style={{ textAlign: 'center', marginTop: '0.8rem' }}>
                    <button type="button" className="btn-modal-cancel" onClick={cancelarPulsado}>
                      Cancelar y reanudar audio
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {fase === 'resolucion' && resultadoRonda && (
        <section className="game">
          <div className="panel qq-menu-panel">
            <div className="qq-card-top" style={{ marginBottom: '0.8rem' }}>
              <BotonVolver texto="Volver a la portada" onClick={() => setModalSalirPortada(true)} />
            </div>

            <div className="end-card aprox-resolucion-card" style={{ border: 'none', boxShadow: 'none', padding: '0 0 1rem' }}>
              <span className="end-icon">
                <Icon name={resultadoRonda.tipo === 'acierto' ? 'trophy' : 'hourglass'} size={44} />
              </span>
              <h1 className="title">
                {resultadoRonda.tipo === 'acierto' ? '¡Canción adivinada!' : 'Fin de la ronda'}
              </h1>
              <p className="reveal" style={{ fontSize: '1.4rem', margin: '0.8rem 0' }}>
                🎵 <strong>{resultadoRonda.titulo}</strong>
              </p>
              <p className="categoria">
                {resultadoRonda.tipo === 'acierto'
                  ? `¡${resultadoRonda.ganador.nombre} ha acertado y suma +${resultadoRonda.puntos} puntos!`
                  : resultadoRonda.tipo === 'todos_fallaron'
                  ? 'Todos los jugadores han fallado esta canción.'
                  : 'Se han rendido.'}
              </p>

              <div className="scoreboard" style={{ width: '100%', marginTop: '1.5rem' }}>
                <h3 className="section-title" style={{ margin: '0 0 0.8rem', textAlign: 'center' }}>
                  Marcador general
                </h3>
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

            <div style={{ marginTop: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <button type="button" className="big full qq-btn-principal" onClick={siguienteRonda}>
                <Icon name="play" size={20} /> Siguiente canción ({rondaNum + 1})
              </button>
              <div className="qq-tablero-footer" style={{ marginTop: 0, paddingTop: '0.6rem', borderTop: 'none' }}>
                <button type="button" className="qq-link-otra-ronda" onClick={() => setFase('final')}>
                  Finalizar partida 🏆
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {fase === 'final' && (
        <section className="game">
          <div className="end-card">
            <span className="end-icon"><Icon name="crown" size={44} /></span>
            <h1 className="title">Clasificación Final</h1>
            <p className="final-score">
              {ganadores.length === 0
                ? 'Nadie ha conseguido puntos'
                : ganadores.length === 1
                ? <>¡Victoria para {ganadores[0].nombre} con {maximo} puntos!</>
                : <>Empate entre {ganadores.map((g) => g.nombre).join(', ')} con {maximo} puntos</>}
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

          <div className="actions" style={{ marginTop: '1.5rem' }}>
            <button type="button" className="big full qq-btn-principal" onClick={() => setFase('setup')}>
              <Icon name="refresh" size={20} /> Nueva partida
            </button>
            <button type="button" className="secondary danger full" onClick={() => setModalSalirPortada(true)}>
              <Icon name="door" size={20} /> Volver a la portada
            </button>
          </div>
        </section>
      )}

      {/* MODAL: SALIR A LA PORTADA (MODO OFFLINE) */}
      {modalSalirPortada && (
        <div className="rg-modal-fondo" onClick={() => setModalSalirPortada(false)}>
          <div
            className="rg-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '420px', textAlign: 'center', padding: '1.8rem 1.4rem' }}
          >
            <div style={{ fontSize: '2.4rem', marginBottom: '0.4rem' }}>🚪</div>
            <h3 style={{ margin: '0 0 0.6rem', color: '#1e1b4b', fontSize: '1.3rem' }}>
              ¿Salir a la portada?
            </h3>
            <p className="hint" style={{ fontSize: '0.95rem', marginBottom: '1.4rem', lineHeight: '1.4' }}>
              Se cancelará la partida actual y volverás a la portada principal de juegos. ¿Estás seguro?
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <button
                type="button"
                className="secondary full"
                onClick={() => setModalSalirPortada(false)}
              >
                No, continuar
              </button>
              <button
                type="button"
                className="secondary danger full"
                style={{ background: '#ef4444', color: '#ffffff', borderColor: '#dc2626' }}
                onClick={handleSalirAPortada}
              >
                Sí, salir a portada
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}