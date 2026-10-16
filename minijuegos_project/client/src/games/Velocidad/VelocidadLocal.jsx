// client/src/games/Velocidad/VelocidadLocal.jsx
import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../components/Icon.jsx';
import GameIntro from '../../components/GameIntro.jsx';
import './Velocidad.css';

const TIEMPO_TURNO = 60;
const TIEMPO_PREPARACION = 10;
const MIN_JUGADORES = 1;
const MAX_JUGADORES = 15;

export default function VelocidadLocal({ onVolver, onExit }) {
  const [fase, setFase] = useState('setup'); // 'setup' | 'cuenta_atras' | 'jugando' | 'resumen_turno' | 'final'
  const [modalAyuda, setModalAyuda] = useState(false);

  const [numJugadores, setNumJugadores] = useState(3);
  const [jugadores, setJugadores] = useState([
    { id: 1, nombre: 'Jugador 1', aciertos: 0, jugo: false },
    { id: 2, nombre: 'Jugador 2', aciertos: 0, jugo: false },
    { id: 3, nombre: 'Jugador 3', aciertos: 0, jugo: false }
  ]);

  const [record, setRecord] = useState(() => {
    try {
      const guardado = localStorage.getItem('test_velocidad_record');
      return guardado ? JSON.parse(guardado) : { puntos: 0, jugador: 'Nadie' };
    } catch {
      return { puntos: 0, jugador: 'Nadie' };
    }
  });

  const [jugadorActual, setJugadorActual] = useState(null);
  const [cuentaAtras, setCuentaAtras] = useState(TIEMPO_PREPARACION);

  const [tiempoRestante, setTiempoRestante] = useState(TIEMPO_TURNO);
  const [preguntas, setPreguntas] = useState([]);
  const [preguntaIdx, setPreguntaIdx] = useState(0);
  const [aciertosActuales, setAciertosActuales] = useState(0);
  const [feedbackOpcion, setFeedbackOpcion] = useState(null);

  const [preguntaEspecial, setPreguntaEspecial] = useState(null);
  const [mostrandoEspecial, setMostrandoEspecial] = useState(false);
  const [especialUsada, setEspecialUsada] = useState(false);
  const [inputEspecial, setInputEspecial] = useState('');
  const [feedbackEspecial, setFeedbackEspecial] = useState(null);

  const timerRef = useRef(null);
  const prepTimerRef = useRef(null);

  useEffect(() => {
    if (fase !== 'cuenta_atras') return;

    prepTimerRef.current = setInterval(() => {
      setCuentaAtras((prev) => {
        if (prev <= 1) {
          clearInterval(prepTimerRef.current);
          iniciarPartidaEnVivo();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(prepTimerRef.current);
  }, [fase]);

  useEffect(() => {
    if (fase !== 'jugando' || mostrandoEspecial) return;

    timerRef.current = setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev === 31 && !especialUsada) {
          clearInterval(timerRef.current);
          setMostrandoEspecial(true);
          setEspecialUsada(true);
          return 30;
        }

        if (prev <= 1) {
          clearInterval(timerRef.current);
          finalizarTurno();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [fase, mostrandoEspecial, especialUsada]);

  const handleNumJugadoresChange = (e) => {
    const num = parseInt(e.target.value, 10);
    setNumJugadores(num);
    const nuevos = Array.from({ length: num }, (_, i) => ({
      id: i + 1,
      nombre: jugadores[i]?.nombre || `Jugador ${i + 1}`,
      aciertos: 0,
      jugo: false
    }));
    setJugadores(nuevos);
  };

  const handleNombreChange = (idx, val) => {
    const nuevos = [...jugadores];
    nuevos[idx] = { ...nuevos[idx], nombre: val };
    setJugadores(nuevos);
  };

  const elegirSiguienteJugador = () => {
    const pendientes = jugadores.filter((j) => !j.jugo);
    if (pendientes.length === 0) {
      terminarJuegoCompleto();
      return;
    }

    const elegido = pendientes[Math.floor(Math.random() * pendientes.length)];
    setJugadorActual(elegido);
    setCuentaAtras(TIEMPO_PREPARACION);
    setFase('cuenta_atras');
  };

  const empezarPartida = () => {
    const actualizados = jugadores.map((j) => ({
      ...j,
      nombre: j.nombre.trim() || `Jugador ${j.id}`,
      aciertos: 0,
      jugo: false
    }));
    setJugadores(actualizados);

    const pendientes = [...actualizados];
    const elegido = pendientes[Math.floor(Math.random() * pendientes.length)];
    setJugadorActual(elegido);
    setCuentaAtras(TIEMPO_PREPARACION);
    setFase('cuenta_atras');
  };

  const iniciarPartidaEnVivo = async () => {
    try {
      const res = await fetch('/api/velocidad/iniciar-turno', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();

      setPreguntas(data.preguntas);
      setPreguntaEspecial(data.especial);
      setPreguntaIdx(0);
      setAciertosActuales(0);
      setTiempoRestante(TIEMPO_TURNO);
      setEspecialUsada(false);
      setMostrandoEspecial(false);
      setInputEspecial('');
      setFeedbackEspecial(null);
      setFeedbackOpcion(null);
      setFase('jugando');
    } catch {
      alert('Error al cargar preguntas.');
    }
  };

  const responderOpcion = (opcIndex) => {
    if (feedbackOpcion !== null || mostrandoEspecial) return;

    const actual = preguntas[preguntaIdx];
    const esCorrecta = opcIndex === actual.correcta;

    setFeedbackOpcion({ idx: opcIndex, correcta: esCorrecta });

    if (esCorrecta) {
      setAciertosActuales((prev) => prev + 1);
    }

    setTimeout(() => {
      setFeedbackOpcion(null);
      if (preguntaIdx + 1 < preguntas.length) {
        setPreguntaIdx((prev) => prev + 1);
      } else {
        setPreguntaIdx(0);
      }
    }, 220);
  };

  const enviarRespuestaEspecial = async (e) => {
    e.preventDefault();
    if (!inputEspecial.trim()) return;

    try {
      const res = await fetch('/api/velocidad/validar-especial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: preguntaEspecial.id,
          respuesta: inputEspecial
        })
      });
      const data = await res.json();

      if (data.acierto) {
        setFeedbackEspecial({ acierto: true, texto: '¡CORRECTO! +30 SEGUNDOS AL CRONÓMETRO' });
        setTiempoRestante((t) => t + 30);
      } else {
        setFeedbackEspecial({
          acierto: false,
          texto: `INCORRECTO (Era: ${data.respuestaCorrecta}). El tiempo continúa igual.`
        });
      }

      setTimeout(() => {
        setMostrandoEspecial(false);
        setFeedbackEspecial(null);
      }, 1600);
    } catch {
      setMostrandoEspecial(false);
    }
  };

  const finalizarTurno = () => {
    clearInterval(timerRef.current);

    setJugadores((prev) =>
      prev.map((j) =>
        j.id === jugadorActual.id ? { ...j, aciertos: aciertosActuales, jugo: true } : j
      )
    );

    if (aciertosActuales > record.puntos) {
      const nuevoRecord = { puntos: aciertosActuales, jugador: jugadorActual.nombre };
      setRecord(nuevoRecord);
      try {
        localStorage.setItem('test_velocidad_record', JSON.stringify(nuevoRecord));
      } catch (_) {}
    }

    setFase('resumen_turno');
  };

  const terminarJuegoCompleto = () => {
    setFase('final');
  };

  const preguntaActual = preguntas[preguntaIdx];
  const ranking = [...jugadores].sort((a, b) => b.aciertos - a.aciertos);
  const maximoAciertos = ranking.length ? ranking[0].aciertos : 0;
  const ganadores = maximoAciertos > 0 ? ranking.filter((j) => j.aciertos === maximoAciertos) : [];

  return (
    <div className="vel-contenedor">
      {/* AYUDA */}
      {fase === 'setup' && (
        <>
          <button
            type="button"
            className="btn-ayuda-flotante"
            onClick={() => setModalAyuda(true)}
            title="Reglas y funcionamiento"
          >
            <span className="btn-ayuda-flotante-signo">?</span>
          </button>

          {modalAyuda && (
            <div className="rg-modal-fondo" onClick={() => setModalAyuda(false)}>
              <div className="rg-modal modal-ayuda-juego" onClick={(e) => e.stopPropagation()}>
                <div className="modal-ayuda-header">
                  <span className="modal-ayuda-signo-title">?</span>
                  <h3>¿Cómo se juega al Test de Velocidad?</h3>
                </div>

                <div className="modal-ayuda-cuerpo">
                  <p><strong>1. Dinámica del reto:</strong></p>
                  <ul>
                    <li>El juego sortea quién empieza con una cuenta atrás de 10 segundos.</li>
                    <li>Dispones de <strong>60 segundos</strong> en tu turno. Cada acierto suma <strong>+1 punto</strong>.</li>
                    <li>Cada pregunta tiene 4 opciones. Si fallas, pasa de inmediato a la siguiente.</li>
                  </ul>
                  <p><strong>2. ¡Pregunta Especial en el segundo 30!</strong></p>
                  <ul>
                    <li>A los 30 segundos el cronómetro se detiene y aparece una pregunta abierta.</li>
                    <li>Si aciertas, ¡ganas <strong>+30 segundos extra</strong> al cronómetro!</li>
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
          <GameIntro gameId="velocidad" titulo="Test de Velocidad (Un solo dispositivo)" />

          <div className="vel-record-badge">
            <Icon name="trophy" size={20} />
            <span>
              Récord histórico: <strong>{record.puntos} aciertos</strong> ({record.jugador})
            </span>
          </div>

          <div className="panel">
            <div className="hud" style={{ marginBottom: '1rem' }}>
              <button className="btn-back-inline" onClick={onVolver}>
                &larr; Cambiar modo
              </button>
            </div>

            <h3 className="panel-title"><Icon name="users" size={22} /> Participantes</h3>
            <label className="field-label" htmlFor="num-jugadores-vel">
              Número de jugadores ({MIN_JUGADORES} a {MAX_JUGADORES})
            </label>
            <select
              id="num-jugadores-vel"
              value={numJugadores}
              onChange={handleNumJugadoresChange}
            >
              {Array.from({ length: MAX_JUGADORES - MIN_JUGADORES + 1 }, (_, i) => (
                <option key={i + MIN_JUGADORES} value={i + MIN_JUGADORES}>
                  {i + MIN_JUGADORES} {i + MIN_JUGADORES === 1 ? 'jugador' : 'jugadores'}
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

          <button className="big full" onClick={empezarPartida}>
            <Icon name="play" size={24} /> ¡Comenzar Desafío!
          </button>
        </section>
      )}

      {/* 2. CUENTA ATRÁS PREVIA */}
      {fase === 'cuenta_atras' && jugadorActual && (
        <section className="game center">
          <p className="categoria">Turno sorteado al azar</p>
          <h1 className="title">
            ¡Pasad el móvil a <span className="hl">{jugadorActual.nombre}</span>!
          </h1>
          <p className="hint">
            Tienes 60 segundos para acertar tantas preguntas como puedas.
          </p>

          <div className="vel-cuenta-circulo">
            <span>{cuentaAtras}</span>
          </div>

          <button className="big full" onClick={() => {
            clearInterval(prepTimerRef.current);
            iniciarPartidaEnVivo();
          }}>
            <Icon name="zap" size={22} /> ¡Empezar ya sin esperar!
          </button>
        </section>
      )}

      {/* 3. JUEGO EN VIVO */}
      {fase === 'jugando' && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="users" size={18} />{jugadorActual?.nombre}</span>
            <span className="chip alt">
              <Icon name="check" size={18} strokeWidth={2.5} /> {aciertosActuales} {aciertosActuales === 1 ? 'acierto' : 'aciertos'}
            </span>
          </div>

          <div className="timer" role="timer">
            <div
              className={`timer-bar ${tiempoRestante <= 15 ? 'low' : ''}`}
              style={{ width: `${Math.min(100, (tiempoRestante / TIEMPO_TURNO) * 100)}%` }}
            />
          </div>
          <p className="timer-text">
            <Icon name="clock" size={18} />
            <strong>{tiempoRestante} s</strong>
          </p>

          {preguntaActual && (
            <div className="panel vel-tarjeta-pregunta">
              <span className="vel-pregunta-num">Pregunta #{preguntaIdx + 1}</span>
              <h2 className="vel-pregunta-texto">{preguntaActual.pregunta}</h2>

              <div className="vel-opciones-grid">
                {preguntaActual.opciones.map((opcion, idx) => {
                  let clase = 'vel-btn-opcion';
                  if (feedbackOpcion !== null) {
                    if (idx === preguntaActual.correcta) clase += ' acierto-flash';
                    else if (idx === feedbackOpcion.idx) clase += ' fallo-flash';
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      className={clase}
                      disabled={feedbackOpcion !== null}
                      onClick={() => responderOpcion(idx)}
                    >
                      <span className="vel-letra-opcion">{String.fromCharCode(65 + idx)}</span>
                      <span className="vel-texto-opcion">{opcion}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {mostrandoEspecial && preguntaEspecial && (
            <div className="rg-modal-fondo">
              <div className="rg-modal vel-modal-especial" onClick={(e) => e.stopPropagation()}>
                <div className="vel-especial-header">
                  <span className="vel-especial-estrella">⭐</span>
                  <h3>¡PREGUNTA ESPECIAL!</h3>
                </div>

                <p className="vel-especial-sub">
                  El cronómetro está pausado. Acierta sin opciones para ganar <strong>+30 segundos extra</strong>.
                </p>

                <div className="vel-especial-caja-pregunta">
                  <p>{preguntaEspecial.pregunta}</p>
                </div>

                {feedbackEspecial ? (
                  <div className={`vel-feedback-esp ${feedbackEspecial.acierto ? 'exito' : 'fallo'}`}>
                    {feedbackEspecial.texto}
                  </div>
                ) : (
                  <form onSubmit={enviarRespuestaEspecial}>
                    <input
                      type="text"
                      autoFocus
                      autoComplete="off"
                      placeholder="Escribe la respuesta exacta..."
                      value={inputEspecial}
                      onChange={(e) => setInputEspecial(e.target.value)}
                      required
                    />
                    <div className="rg-modal-acciones">
                      <button type="submit" className="big full ok">
                        <Icon name="check" size={20} strokeWidth={2.5} /> Responder
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </section>
      )}

      {/* 4. RESUMEN DEL TURNO */}
      {fase === 'resumen_turno' && jugadorActual && (
        <section className="game center">
          <div className="end-card">
            <span className="end-icon"><Icon name="hourglass" size={44} /></span>
            <h1 className="title">¡Tiempo agotado!</h1>
            <p className="reveal" style={{ fontSize: '1.4rem', margin: '0.8rem 0' }}>
              <strong>{jugadorActual.nombre}</strong> ha conseguido <strong>{aciertosActuales} aciertos</strong>.
            </p>

            <div className="scoreboard">
              {jugadores.map((j) => (
                <div key={j.id} className={`score-row ${j.id === jugadorActual.id ? 'first' : ''}`}>
                  <span className="score-name">{j.nombre}</span>
                  <span className="score-pts">
                    {j.jugo ? `${j.aciertos} pts` : 'Pendiente'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="actions">
            {jugadores.some((j) => !j.jugo) ? (
              <button className="big full" onClick={elegirSiguienteJugador}>
                <Icon name="dice" size={20} /> Sortear siguiente jugador
              </button>
            ) : (
              <button className="big full" onClick={terminarJuegoCompleto}>
                <Icon name="trophy" size={20} /> Ver podio y resultados finales
              </button>
            )}
          </div>
        </section>
      )}

      {/* 5. PODIO FINAL */}
      {fase === 'final' && (
        <section className="game">
          <div className="end-card">
            <span className="end-icon"><Icon name="crown" size={48} /></span>
            <h1 className="title">Clasificación Final</h1>
            <p className="final-score">
              {ganadores.length === 0
                ? 'Nadie ha conseguido puntos'
                : ganadores.length === 1
                ? <>¡Victoria para {ganadores[0].nombre} con {ganadores[0].aciertos} aciertos!</>
                : <>Empate entre {ganadores.map((g) => g.nombre).join(', ')} con {maximoAciertos} aciertos</>}
            </p>

            <div className="scoreboard">
              {ranking.map((j, i) => {
                const lider = maximoAciertos > 0 && j.aciertos === maximoAciertos;
                return (
                  <div key={j.id} className={`score-row ${lider ? 'first' : ''}`}>
                    <span className="score-name">
                      {lider ? <Icon name="crown" size={22} /> : <span className="pos">{i + 1}</span>}
                      {j.nombre}
                    </span>
                    <span className="score-pts">{j.aciertos} pts</span>
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