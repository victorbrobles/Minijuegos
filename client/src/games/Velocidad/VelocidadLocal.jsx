// client/src/games/Velocidad/VelocidadLocal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import './Velocidad.css';
import { SelectorJugadores, BloqueConfig } from '../../components/MenuJuego.jsx';

const TIEMPO_TURNO = 60;
const TIEMPO_PREPARACION = 10;
const MIN_JUGADORES = 1;
const MAX_JUGADORES = 15;

const COLORES_JUGADOR = ['#3b82f6', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4', '#f97316', '#84cc16', '#6366f1'];
const colorJugador = (id) => COLORES_JUGADOR[(Number(id) - 1 + COLORES_JUGADOR.length * 10) % COLORES_JUGADOR.length];
const inicial = (n = '?') => n.trim().charAt(0).toUpperCase() || '?';

export default function VelocidadLocal({ onVolver, onExit }) {
  const navigate = useNavigate();
  const [fase, setFase] = useState('setup'); // 'setup' | 'cuenta_atras' | 'jugando' | 'resumen_turno' | 'final'
  const [modalAyuda, setModalAyuda] = useState(false);
  const [modalSalirPortada, setModalSalirPortada] = useState(false);

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
  const aciertosRef = useRef(0);
  const jugadorActualRef = useRef(null);

  useEffect(() => {
    aciertosRef.current = aciertosActuales;
  }, [aciertosActuales]);

  useEffect(() => {
    jugadorActualRef.current = jugadorActual;
  }, [jugadorActual]);

  const handleSalirAPortada = () => {
    setModalSalirPortada(false);
    clearInterval(timerRef.current);
    clearInterval(prepTimerRef.current);
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
      setFase('final');
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

    const elegido = actualizados[Math.floor(Math.random() * actualizados.length)];
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

      setPreguntas(data.preguntas || []);
      setPreguntaEspecial(data.especial || null);
      setPreguntaIdx(0);
      setAciertosActuales(0);
      aciertosRef.current = 0;
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
    if (!actual) return;

    const esCorrecta = opcIndex === actual.correcta;
    setFeedbackOpcion({ idx: opcIndex, correcta: esCorrecta });

    if (esCorrecta) {
      setAciertosActuales((prev) => {
        const sig = prev + 1;
        aciertosRef.current = sig;
        return sig;
      });
    }

    setTimeout(() => {
      setFeedbackOpcion(null);
      setPreguntaIdx((prev) => (prev + 1 < preguntas.length ? prev + 1 : 0));
    }, 220);
  };

  const enviarRespuestaEspecial = async (e) => {
    e.preventDefault();
    if (!inputEspecial.trim() || !preguntaEspecial || feedbackEspecial) return;

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

    const puntosFinales = aciertosRef.current;
    const jugAct = jugadorActualRef.current;

    if (jugAct) {
      setJugadores((prev) =>
        prev.map((j) =>
          j.id === jugAct.id ? { ...j, aciertos: puntosFinales, jugo: true } : j
        )
      );

      setRecord((prevRecord) => {
        if (puntosFinales > prevRecord.puntos) {
          const nuevoRecord = { puntos: puntosFinales, jugador: jugAct.nombre };
          try {
            localStorage.setItem('test_velocidad_record', JSON.stringify(nuevoRecord));
          } catch (_) {}
          return nuevoRecord;
        }
        return prevRecord;
      });
    }

    setFase('resumen_turno');
  };

  const preguntaActual = preguntas[preguntaIdx];
  const ranking = [...jugadores].sort((a, b) => b.aciertos - a.aciertos);
  const maximoAciertos = ranking.length ? ranking[0].aciertos : 0;
  const ganadores = maximoAciertos > 0 ? ranking.filter((j) => j.aciertos === maximoAciertos) : [];
  const enPartidaActiva = fase === 'cuenta_atras' || fase === 'jugando' || fase === 'resumen_turno';

  return (
    <div className={`vel-contenedor ${enPartidaActiva ? 'qq-en-partida' : ''}`}>
      {/* MODAL DE AYUDA */}
      {modalAyuda && (
        <div className="rg-modal-fondo" onClick={() => setModalAyuda(false)}>
          <div className="rg-modal ptp-modal-ayuda" onClick={(e) => e.stopPropagation()}>
            <div className="ptp-modal-ayuda-header">
              <span className="ptp-ayuda-badge">❓ Cómo jugar</span>
              <h3>Test de Velocidad</h3>
            </div>

            <div className="ptp-modal-ayuda-body">
              <p>Responde tantas preguntas de cultura general como puedas antes de que se agote tu minuto.</p>
              <ul>
                <li><strong>Sorteo y preparación:</strong> El juego elige al azar quién juega cada turno con una cuenta atrás de <strong>10 segundos</strong>.</li>
                <li><strong>60 segundos contrarreloj:</strong> Cada pregunta tiene 4 opciones y cada acierto suma <strong>+1 punto</strong>. Si fallas, pasas de inmediato a la siguiente.</li>
                <li><strong>⭐ Pregunta Especial (30s):</strong> Cuando queden 30 segundos, el reloj se detiene con una pregunta abierta. Si la aciertas sin opciones, ganas <strong>+30 segundos extra</strong>.</li>
              </ul>
            </div>

            <button type="button" className="ptp-boton" onClick={() => setModalAyuda(false)}>
              ¡Entendido!
            </button>
          </div>
        </div>
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
          onEmpezar={empezarPartida}
          textoBoton="¡Comenzar Desafío!"
          iconoBoton="play"
        >
          <BloqueConfig>
            <div className="vel-record-box">
              <Icon name="trophy" size={20} />
              <span>
                Récord histórico: <strong>{record.puntos} aciertos</strong> ({record.jugador})
              </span>
            </div>
          </BloqueConfig>
        </SelectorJugadores>
      )}

      {/* 2. CUENTA ATRÁS PREVIA */}
      {fase === 'cuenta_atras' && jugadorActual && (
        <section className="game ptp-escena">
          <header className="ptp-hero">
            <span className="ptp-hero-deco" aria-hidden="true">
              <Icon name="zap" size={140} strokeWidth={1.3} />
            </span>
            <div className="ptp-hero-top">
              <button type="button" className="ptp-salir" onClick={() => setModalSalirPortada(true)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                <span>Portada</span>
              </button>
              <div className="ptp-hero-chips">
                <span className="ptp-chip"><Icon name="dice" size={14} /> Turno sorteado</span>
              </div>
            </div>

            <ol className="ptp-marcador" aria-label="Jugadores">
              {jugadores.map((j) => {
                const esActual = j.id === jugadorActual.id;
                return (
                  <li
                    key={j.id}
                    className={`ptp-jugador${j.jugo ? ' respondido' : ''}${esActual ? ' yo' : ''}`}
                    style={{ '--c': colorJugador(j.id) }}
                  >
                    <span className="ptp-jugador-avatar">{inicial(j.nombre)}</span>
                    <span className="ptp-jugador-datos">
                      <span className="ptp-jugador-nombre">{j.nombre}</span>
                      <span className="ptp-jugador-linea">
                        <strong>{j.jugo ? `${j.aciertos} pts` : esActual ? 'Su turno' : 'Pendiente'}</strong>
                      </span>
                    </span>
                    <span className="ptp-jugador-estado">
                      {j.jugo ? '✅' : esActual ? '⚡' : '⏳'}
                    </span>
                  </li>
                );
              })}
            </ol>
          </header>

          <div className="ptp-tarjeta vel-prep-card">
            <p className="ptp-etiqueta">¡Pasad el dispositivo!</p>
            <h2 className="vel-prep-titulo">
              Turno de <span style={{ color: colorJugador(jugadorActual.id) }}>{jugadorActual.nombre}</span>
            </h2>
            <p className="vel-prep-sub">
              Tienes 60 segundos para acertar tantas preguntas como puedas.
            </p>

            <div className="vel-cuenta-circulo">
              <span>{cuentaAtras}</span>
            </div>

            <button
              type="button"
              className="ptp-boton grande"
              onClick={() => {
                clearInterval(prepTimerRef.current);
                iniciarPartidaEnVivo();
              }}
            >
              <Icon name="zap" size={22} /> ¡Empezar ya sin esperar!
            </button>
          </div>
        </section>
      )}

      {/* 3. JUEGO EN VIVO */}
      {fase === 'jugando' && (
        <section className="game ptp-escena">
          <header className="ptp-hero">
            <span className="ptp-hero-deco" aria-hidden="true">
              <Icon name="zap" size={140} strokeWidth={1.3} />
            </span>
            <div className="ptp-hero-top">
              <button type="button" className="ptp-salir" onClick={() => setModalSalirPortada(true)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                <span>Portada</span>
              </button>
              <div className="ptp-hero-chips">
                <span className="ptp-chip"><Icon name="users" size={14} /> {jugadorActual?.nombre}</span>
                <span className="ptp-chip">
                  <Icon name="check" size={14} strokeWidth={2.5} /> {aciertosActuales} {aciertosActuales === 1 ? 'acierto' : 'aciertos'}
                </span>
              </div>
            </div>

            <ol className="ptp-marcador" aria-label="Jugadores">
              {jugadores.map((j) => {
                const esActual = j.id === jugadorActual?.id;
                const pts = esActual ? aciertosActuales : j.aciertos;
                return (
                  <li
                    key={j.id}
                    className={`ptp-jugador${j.jugo ? ' respondido' : ''}${esActual ? ' yo' : ''}`}
                    style={{ '--c': colorJugador(j.id) }}
                  >
                    <span className="ptp-jugador-avatar">{inicial(j.nombre)}</span>
                    <span className="ptp-jugador-datos">
                      <span className="ptp-jugador-nombre">{j.nombre}</span>
                      <span className="ptp-jugador-linea">
                        <strong>{j.jugo || esActual ? `${pts} pts` : 'Pendiente'}</strong>
                      </span>
                    </span>
                    <span className="ptp-jugador-estado">
                      {j.jugo ? '✅' : esActual ? '⚡' : '⏳'}
                    </span>
                  </li>
                );
              })}
            </ol>
          </header>

          {/* Barra de tiempo */}
          <div className={`ptp-tiempo ${tiempoRestante <= 12 && !mostrandoEspecial ? 'critico' : ''}`} role="timer">
            <div className="ptp-tiempo-barra">
              <span style={{ width: `${Math.min(100, (tiempoRestante / TIEMPO_TURNO) * 100)}%` }} />
            </div>
            <span className="ptp-tiempo-num">
              <Icon name="clock" size={15} />
              {mostrandoEspecial ? 'Pausado' : `${tiempoRestante}s`}
            </span>
          </div>

          {/* Tarjeta de Pregunta Especial (30s) o Pregunta Normal */}
          {mostrandoEspecial && preguntaEspecial ? (
            <div className="ptp-tarjeta vel-especial-panel">
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
                <form onSubmit={enviarRespuestaEspecial} className="ptp-form-online">
                  <input
                    type="text"
                    autoFocus
                    autoComplete="off"
                    className="ptp-input"
                    placeholder="Escribe la respuesta exacta…"
                    value={inputEspecial}
                    onChange={(e) => setInputEspecial(e.target.value)}
                    required
                  />
                  <button type="submit" className="ptp-boton" disabled={!inputEspecial.trim()}>
                    <Icon name="check" size={20} strokeWidth={2.5} /> Responder (+30s)
                  </button>
                </form>
              )}
            </div>
          ) : (
            preguntaActual && (
              <div className="ptp-tarjeta vel-tarjeta-pregunta">
                <div className="ptp-tarjeta-cab">
                  <p className="ptp-etiqueta">Test contrarreloj</p>
                  <span className="ptp-badge-pista">Pregunta #{preguntaIdx + 1}</span>
                </div>

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
            )
          )}
        </section>
      )}

      {/* 4. RESUMEN DEL TURNO */}
      {fase === 'resumen_turno' && jugadorActual && (
        <section className="game ptp-escena">
          <header className="ptp-hero">
            <span className="ptp-hero-deco" aria-hidden="true">
              <Icon name="hourglass" size={140} strokeWidth={1.3} />
            </span>
            <div className="ptp-hero-top">
              <button type="button" className="ptp-salir" onClick={() => setModalSalirPortada(true)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                <span>Portada</span>
              </button>
              <span className="ptp-chip"><Icon name="flagFinish" size={14} /> ¡Tiempo agotado!</span>
            </div>
            <p className="ptp-etiqueta" style={{ color: 'rgba(255,255,255,0.85)' }}>
              Resultado de {jugadorActual.nombre}
            </p>
            <h2 className="ptp-solucion-titulo">
              {aciertosActuales} {aciertosActuales === 1 ? 'acierto' : 'aciertos'}
            </h2>
          </header>

          <div className="ptp-tarjeta">
            <p className="ptp-etiqueta">Clasificación provisional</p>
            <ol className="ptp-ranking">
              {jugadores.map((j, i) => {
                const esActual = j.id === jugadorActual.id;
                return (
                  <li key={j.id} className={esActual ? 'lider' : ''} style={{ '--c': colorJugador(j.id) }}>
                    <span className="ptp-ranking-pos">{j.jugo ? '✅' : i + 1}</span>
                    <span className="ptp-jugador-avatar">{inicial(j.nombre)}</span>
                    <span className="ptp-ranking-nombre">{j.nombre}</span>
                    <strong>{j.jugo ? `${j.aciertos} pts` : 'Pendiente'}</strong>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="ptp-barra estatica">
            {jugadores.some((j) => !j.jugo) ? (
              <button type="button" className="ptp-boton grande" onClick={elegirSiguienteJugador}>
                <Icon name="dice" size={20} /> Sortear siguiente jugador
              </button>
            ) : (
              <button type="button" className="ptp-boton grande" onClick={() => setFase('final')}>
                <Icon name="trophy" size={20} /> Ver podio y resultados finales
              </button>
            )}
          </div>
        </section>
      )}

      {/* 5. PODIO FINAL */}
      {fase === 'final' && (
        <section className="game ptp-escena">
          <div className="end-card">
            <span className="end-icon"><Icon name="crown" size={44} /></span>
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

          <div className="ptp-barra estatica">
            <button type="button" className="ptp-boton grande" onClick={() => setFase('setup')}>
              <Icon name="refresh" size={20} /> Nueva partida
            </button>
            <button type="button" className="ptp-boton secundario" onClick={onVolver}>
              <Icon name="door" size={20} /> Volver al menú
            </button>
          </div>
        </section>
      )}

      {/* MODAL SALIR A PORTADA */}
      {modalSalirPortada && (
        <div className="rg-modal-fondo" onClick={() => setModalSalirPortada(false)}>
          <div className="rg-modal ptp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ptp-modal-icono">🚪</div>
            <h3>¿Salir a la portada?</h3>
            <p className="hint">Se cancelará la partida actual y volverás a la portada principal.</p>
            <div className="ptp-fila-botones">
              <button type="button" className="ptp-boton secundario" onClick={() => setModalSalirPortada(false)}>
                Continuar
              </button>
              <button type="button" className="ptp-boton peligro" onClick={handleSalirAPortada}>
                Salir a portada
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}