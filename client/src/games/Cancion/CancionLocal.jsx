// client/src/games/Cancion/CancionLocal.jsx
import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../components/Icon.jsx';
import GameIntro from '../../components/GameIntro.jsx';
import { reproducirConRampa, pausarAudio, reanudarAudio, detenerReproduccion } from './audioPlayerCancion.js';
import './Cancion.css';
import '../Adivina/Adivina.css';

const MIN_JUGADORES = 2;
const MAX_JUGADORES = 20;
const TIEMPO_RESPUESTA = 30;

export default function CancionLocal({ onVolver, onExit }) {
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

  const [rondaNum, setRondaNum] = useState(1);
  const [cancionActual, setCancionActual] = useState(null);
  const [usados, setUsados] = useState([]);
  const [bloqueados, setBloqueados] = useState([]);

  // Audio y cuenta atrás (30s de la canción)
  const [sonando, setSonando] = useState(false);
  const [segundos, setSegundos] = useState(30);

  // Pulsador
  const [pulsado, setPulsado] = useState(false);
  const [inputTexto, setInputTexto] = useState('');
  const [mensajeFeedback, setMensajeFeedback] = useState(null);
  const [resultadoRonda, setResultadoRonda] = useState(null);

  // Temporizador para responder una vez pulsado
  const [tiempoRespuesta, setTiempoRespuesta] = useState(TIEMPO_RESPUESTA);
  const timerRespuestaRef = useRef(null);

  useEffect(() => {
    return () => detenerReproduccion();
  }, []);

  const handleNumChange = (e) => {
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
      setSegundos(30);
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
      reproducirConRampa(
        cancionActual?.audio,
        (s) => setSegundos(s),
        () => {
          // Solo se ejecuta si realmente se consumen los 30 segundos
          setSonando(false);
          revelarSolucion('tiempo_agotado');
        }
      );
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
    // Reanudar música para el resto si quedan segundos
    if (segundos > 0) {
      setSonando(true);
      reanudarAudio();
    }
  };

  const cancelarPulsadoRef = useRef();
  useEffect(() => {
    cancelarPulsadoRef.current = cancelarPulsado;
  });

  // Efecto para el temporizador de 30 segundos al responder
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
          if (cancelarPulsadoRef.current) cancelarPulsadoRef.current(); // Cierra el modal sin fallos
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
          respuesta: inputTexto,
          segundosRestantes: segundos
        })
      });
      const data = await res.json();

      setPulsado(false);

      if (data.acierto) {
        detenerReproduccion();
        setPuntos((prev) => ({
          ...prev,
          [jugador.id]: (prev[jugador.id] || 0) + data.puntos
        }));
        setResultadoRonda({
          tipo: 'acierto',
          ganador: jugador,
          puntos: data.puntos,
          titulo: `${data.tituloReal} —${data.artistaReal}`
        });
        setFase('resolucion');
      } else {
        // Resta tantos puntos como segundos queden
        setPuntos((prev) => ({
          ...prev,
          [jugador.id]: Math.max(0, (prev[jugador.id] || 0) - data.puntos)
        }));

        const nuevosBloqueados = [...bloqueados, jugador.id];
        setBloqueados(nuevosBloqueados);

        if (nuevosBloqueados.length >= jugadores.length) {
          revelarSolucion('todos_fallaron');
        } else {
          // Rebote para el resto: se reanuda la música
          setMensajeFeedback({
            tipo: 'fallo',
            texto: `¡Incorrecto! ${jugador.nombre} resta -${data.puntos} pts. ¡Rebote para el resto!`
          });
          if (segundos > 0) {
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
        titulo: `${data.titulo} —${data.artista}`
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

  return (
    <div className="cancion-contenedor">
      {/* AYUDA */}
      {fase === 'setup' && (
        <>
          <button
            type="button"
            className="btn-ayuda-flotante"
            onClick={() => setModalAyuda(true)}
            title="Reglas del juego"
          >
            <span className="btn-ayuda-flotante-signo">?</span>
          </button>

          {modalAyuda && (
            <div className="rg-modal-fondo" onClick={() => setModalAyuda(false)}>
              <div className="rg-modal modal-ayuda-juego" onClick={(e) => e.stopPropagation()}>
                <div className="modal-ayuda-header">
                  <span className="modal-ayuda-signo-title">?</span>
                  <h3>¿Cómo se juega a Afina ese oído?</h3>
                </div>

                <div className="modal-ayuda-cuerpo">
                  <p><strong>1. Dinámica musical:</strong></p>
                  <ul>
                    <li>Pulsa el reproductor para iniciar la canción.</li>
                    <li>Empezará casi inaudible e irá <strong>subiendo gradualmente de volumen</strong> hasta alcanzar un nivel medio a los 30 segundos.</li>
                    <li>En cuanto reconozcas el tema, <strong>pulsa el botón rojo</strong> para detener la reproducción. Tienes <strong>30 segundos para responder</strong>.</li>
                  </ul>
                  <p><strong>2. Puntuación y rebote:</strong></p>
                  <ul>
                    <li>Si aciertas, sumas <strong>tantos puntos como segundos queden</strong> en el reproductor.</li>
                    <li>Si fallas, restas esa misma cantidad de puntos y quedas bloqueado en esa ronda, ¡habiendo rebote para el resto!</li>
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
        <section className="game">
          <GameIntro gameId="cancion" titulo="Afina ese oído" />

          <div className="panel">
            <div className="hud" style={{ marginBottom: '1rem' }}>
              <button className="btn-back-inline" onClick={onVolver}>
                &larr; Cambiar a modo Online
              </button>
            </div>

            <h3 className="panel-title"><Icon name="users" size={22} /> Participantes ({MIN_JUGADORES} a {MAX_JUGADORES})</h3>
            <label className="field-label" htmlFor="num-jugadores-can">
              Número de jugadores
            </label>
            <select
              id="num-jugadores-can"
              value={numJugadores}
              onChange={handleNumChange}
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
                  maxLength={25}
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

      {/* 2. JUGANDO */}
      {fase === 'jugando' && cancionActual && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="flagFinish" size={18} />Ronda {rondaNum}</span>
            <span className="chip alt">⏱️ {segundos}s restantes (+{segundos} / -{segundos} pts)</span>
          </div>

          {/* Marcador superior */}
          <div className="scoreboard-container" style={{ justifyContent: 'center', marginBottom: '0.8rem' }}>
            {jugadores.map((j) => (
              <div key={j.id} className={`score-pill ${bloqueados.includes(j.id) ? 'locked' : ''}`}>
                <span>{j.nombre}: <strong>{puntos[j.id] ?? 0} pts</strong></span>
                {bloqueados.includes(j.id) && <span style={{ marginLeft: '4px' }}>❌</span>}
              </div>
            ))}
          </div>

          {/* Reproductor con subida gradual de volumen */}
          <div className="cancion-player-box">
            <button
              type="button"
              className={`cancion-play-btn ${sonando ? 'sonando' : ''}`}
              onClick={toggleReproductor}
              disabled={pulsado}
            >
              <Icon name={sonando ? 'pause' : 'play'} size={42} strokeWidth={2.5} />
            </button>
            <span className="cancion-timer-tag">
              {sonando ? '¡Música sonando!' : segundos === 30 ? 'Pulsa para reproducir' : 'Pausado'}
            </span>
            <span className="hint small">Volumen en aumento progresivo ({segundos}s)</span>

            <div className="cancion-volume-meter">
              <div
                className="cancion-volume-fill"
                style={{ width: `${((30 - segundos) / 30) * 100}%` }}
              />
            </div>
          </div>

          {/* Feedback de rebote o error */}
          {mensajeFeedback && (
            <div className={`status-alert ${mensajeFeedback.tipo}`} style={{ marginBottom: '1rem' }}>
              {mensajeFeedback.texto}
            </div>
          )}

          {/* PULSADOR Y CAJA DE RESPUESTA */}
          <div className="cancion-pulsador-wrapper">
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

                <div className="adv-controles-ronda" style={{ width: '100%', marginTop: '0.8rem' }}>
                  <button className="secondary danger full" onClick={() => revelarSolucion('rendicion')}>
                    <Icon name="flag" size={18} /> Rendirse y ver solución
                  </button>
                </div>
              </div>
            ) : (
              <div className="respuesta-pulsada-box" style={{ width: '100%' }}>
                <div className="respuesta-pulsada-header">
                  <span className="pulsado-badge">🔴 Tiempo congelado a los {segundos}s</span>
                  <p className="hint small" style={{ margin: '0.4rem 0' }}>
                    Escribe el título de la canción y pulsa en el nombre del jugador:
                  </p>
                </div>

                {/* Temporizador de respuesta */}
                <div style={{ padding: '0', marginTop: '0.5rem', marginBottom: '0.8rem' }}>
                  <div
                    className="timer"
                    role="timer"
                    style={{ margin: '0.4rem 0', background: '#e2e8f0', borderRadius: '9999px', height: '8px', overflow: 'hidden' }}
                  >
                    <div
                      className={`timer-bar ${tiempoRespuesta <= 10 ? 'low' : ''}`}
                      style={{
                        width: `${(tiempoRespuesta / TIEMPO_RESPUESTA) * 100}%`,
                        height: '100%',
                        backgroundColor: tiempoRespuesta <= 10 ? '#ef4444' : '#16a34a',
                        borderRadius: '9999px',
                        transition: 'width 0.1s linear, background-color 0.3s ease'
                      }}
                    />
                  </div>
                  <p
                    className="timer-text"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                      color: tiempoRespuesta <= 10 ? '#dc2626' : '#64748b', fontSize: '0.9rem', fontWeight: 700, margin: '0'
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
                  ¿Quién responde? (+{segundos} / -{segundos} pts)
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
                : 'Se ha agotado el tiempo o se han rendido.'}
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
              <Icon name="play" size={20} /> Siguiente canción ({rondaNum + 1})
            </button>
            <button className="secondary danger" onClick={() => setFase('final')}>
              <Icon name="flagFinish" size={20} /> Finalizar partida
            </button>
          </div>
        </section>
      )}

      {/* 4. PODIO FINAL */}
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

          <div className="actions">
            <button onClick={() => setFase('setup')}>
              <Icon name="refresh" size={20} /> Nueva partida
            </button>
            <button className="secondary danger" onClick={onVolver}>
              <Icon name="door" size={20} /> Salir al menú
            </button>
          </div>
        </section>
      )}
    </div>
  );
}