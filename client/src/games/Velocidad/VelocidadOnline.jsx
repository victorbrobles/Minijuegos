// client/src/games/Velocidad/VelocidadOnline.jsx
import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../components/Icon.jsx';
import './Velocidad.css';

const CLAVE_SESION_VEL = 'velocidad_online_session';

export default function VelocidadOnline({ onLocal, onSalir }) {
  const [vista, setVista] = useState('menu'); // 'menu' | 'crear' | 'unirse' | 'sala'
  const [nombre, setNombre] = useState('');
  const [codigoInput, setCodigoInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);
  const [modalSalir, setModalSalir] = useState(false);
  const [modalAyuda, setModalAyuda] = useState(false);

  const [sesion, setSesion] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(CLAVE_SESION_VEL));
    } catch {
      return null;
    }
  });

  const [sala, setSala] = useState(null);
  const [codigoCopiado, setCodigoCopiado] = useState(false);

  // Estados de la partida activa en mi teléfono (cuando es mi turno)
  const [preguntas, setPreguntas] = useState([]);
  const [preguntaEspecial, setPreguntaEspecial] = useState(null);
  const [preguntaIdx, setPreguntaIdx] = useState(0);
  const [aciertosActuales, setAciertosActuales] = useState(0);
  const [tiempoRestante, setTiempoRestante] = useState(60);
  const [feedbackOpcion, setFeedbackOpcion] = useState(null);

  const [mostrandoEspecial, setMostrandoEspecial] = useState(false);
  const [especialUsada, setEspecialUsada] = useState(false);
  const [inputEspecial, setInputEspecial] = useState('');
  const [feedbackEspecial, setFeedbackEspecial] = useState(null);

  const timerRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!sesion) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setSala(null);
      return;
    }

    const consultarEstado = () => {
      fetch(`/api/velocidad/online/sala/${sesion.code}?token=${sesion.token}`)
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
          sessionStorage.removeItem(CLAVE_SESION_VEL);
          setSesion(null);
          setSala(null);
          setVista('menu');
          setErrorMsg('La sala se ha cerrado o se ha perdido la conexión.');
        });
    };

    consultarEstado();
    intervalRef.current = setInterval(consultarEstado, 500);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sesion]);

  const esMiTurno = Boolean(sala?.jugadorActualId === sala?.yoId);

  // Arrastre y cronómetro del jugador activo en su propio turno
  useEffect(() => {
    if (sala?.estado !== 'jugando' || !esMiTurno || mostrandoEspecial) return;

    timerRef.current = setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev === 31 && !especialUsada) {
          clearInterval(timerRef.current);
          setMostrandoEspecial(true);
          setEspecialUsada(true);
          reportarProgreso(aciertosActuales, 30, preguntas[preguntaIdx]?.pregunta, true);
          return 30;
        }

        if (prev <= 1) {
          clearInterval(timerRef.current);
          finalizarMiTurno();
          return 0;
        }

        const nuevo = prev - 1;
        reportarProgreso(aciertosActuales, nuevo, preguntas[preguntaIdx]?.pregunta, false);
        return nuevo;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [sala?.estado, esMiTurno, mostrandoEspecial, especialUsada, aciertosActuales, preguntaIdx, preguntas]);

  const reportarProgreso = (aciertos, tiempo, preguntaTxt, esp) => {
    if (!sesion) return;
    fetch(`/api/velocidad/online/sala/${sesion.code}/reportar-progreso`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: sesion.token,
        aciertos,
        tiempoRestante: tiempo,
        preguntaTexto: preguntaTxt,
        mostrandoEspecial: esp
      })
    }).catch(() => {});
  };

  const handleCrear = async () => {
    if (!nombre.trim()) return;
    setErrorMsg('');
    setCargando(true);
    try {
      const res = await fetch('/api/velocidad/online/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear la sala.');

      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_VEL, JSON.stringify(nueva));
      setSesion(nueva);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleUnirse = async () => {
    if (!nombre.trim() || !codigoInput.trim()) return;
    setErrorMsg('');
    setCargando(true);
    try {
      const res = await fetch('/api/velocidad/online/unirse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codigoInput.trim().toUpperCase(), nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al unirse.');

      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_VEL, JSON.stringify(nueva));
      setSesion(nueva);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleIniciarJuego = async () => {
    if (!sesion) return;
    try {
      await fetch(`/api/velocidad/online/sala/${sesion.code}/iniciar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token })
      });
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleArrancarMiTurnoEnVivo = async () => {
    if (!sesion) return;
    try {
      const res = await fetch(`/api/velocidad/online/sala/${sesion.code}/arrancar-turno`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token })
      });
      const data = await res.json();

      setPreguntas(data.preguntas);
      setPreguntaEspecial(data.especial);
      setPreguntaIdx(0);
      setAciertosActuales(0);
      setTiempoRestante(60);
      setEspecialUsada(false);
      setMostrandoEspecial(false);
      setInputEspecial('');
      setFeedbackEspecial(null);
      setFeedbackOpcion(null);
    } catch (err) {
      console.error(err);
    }
  };

  const responderOpcionOnline = (opcIndex) => {
    if (feedbackOpcion !== null || mostrandoEspecial) return;

    const actual = preguntas[preguntaIdx];
    const esCorrecta = opcIndex === actual.correcta;

    setFeedbackOpcion({ idx: opcIndex, correcta: esCorrecta });

    let nuevosAciertos = aciertosActuales;
    if (esCorrecta) {
      nuevosAciertos += 1;
      setAciertosActuales(nuevosAciertos);
    }

    reportarProgreso(nuevosAciertos, tiempoRestante, actual.pregunta, false);

    setTimeout(() => {
      setFeedbackOpcion(null);
      const sigIdx = preguntaIdx + 1 < preguntas.length ? preguntaIdx + 1 : 0;
      setPreguntaIdx(sigIdx);
      reportarProgreso(nuevosAciertos, tiempoRestante, preguntas[sigIdx]?.pregunta, false);
    }, 220);
  };

  const enviarRespuestaEspecialOnline = async (e) => {
    e.preventDefault();
    if (!inputEspecial.trim() || !sesion) return;

    try {
      const res = await fetch(`/api/velocidad/online/sala/${sesion.code}/validar-especial`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token, respuesta: inputEspecial })
      });
      const data = await res.json();

      if (data.acierto) {
        setFeedbackEspecial({ acierto: true, texto: '¡CORRECTO! +30 SEGUNDOS AL CRONÓMETRO' });
        setTiempoRestante((t) => t + 30);
      } else {
        setFeedbackEspecial({
          acierto: false,
          texto: `INCORRECTO (Era: ${data.respuestaCorrecta}). El tiempo continúa.`
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

  const finalizarMiTurno = async () => {
    clearInterval(timerRef.current);
    if (!sesion) return;
    try {
      await fetch(`/api/velocidad/online/sala/${sesion.code}/finalizar-turno`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token, aciertos: aciertosActuales })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSiguienteJugador = async () => {
    if (!sesion) return;
    try {
      await fetch(`/api/velocidad/online/sala/${sesion.code}/siguiente-jugador`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleReiniciarPartida = async () => {
    if (!sesion) return;
    try {
      await fetch(`/api/velocidad/online/sala/${sesion.code}/reiniciar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSalir = async () => {
    if (sesion) {
      try {
        await fetch(`/api/velocidad/online/sala/${sesion.code}/salir`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: sesion.token })
        });
      } catch {
        /* ignorar */
      }
    }
    sessionStorage.removeItem(CLAVE_SESION_VEL);
    setSesion(null);
    setSala(null);
    setVista('menu');
  };

  const copiarCodigo = () => {
    if (!sala?.code) return;
    navigator.clipboard?.writeText(sala.code);
    setCodigoCopiado(true);
    setTimeout(() => setCodigoCopiado(false), 2000);
  };

  const esAdmin = Boolean(sala?.esAdmin);
  const preguntaActual = preguntas[preguntaIdx];
  const ranking = [...(sala?.jugadores || [])].sort((a, b) => b.aciertos - a.aciertos);
  const maximoAciertos = ranking.length ? ranking[0].aciertos : 0;
  const ganadores = maximoAciertos > 0 ? ranking.filter((j) => j.aciertos === maximoAciertos) : [];

  // Mostrar ayuda en los menús y en la sala de espera (lobby), desaparece al iniciar la partida
  const mostrarAyuda = vista === 'menu' || vista === 'crear' || vista === 'unirse' || (vista === 'sala' && sala?.estado === 'lobby');

  return (
    <div className="vel-contenedor">
      {/* ---------------- BOTÓN Y MODAL DE AYUDA ---------------- */}
      {mostrarAyuda && (
        <button
          type="button"
          className="btn-ayuda-flotante"
          onClick={() => setModalAyuda(true)}
          title="Reglas y funcionamiento"
        >
          <span className="btn-ayuda-flotante-signo">?</span>
        </button>
      )}

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
      {/* ---------------- FIN AYUDA ---------------- */}

      {/* 1. MENÚ PRINCIPAL */}
      {vista === 'menu' && (
        <section className="game">
          <div className="panel center">
            <span className="lb-luna chica">
              <Icon name="zap" size={42} strokeWidth={1.6} />
            </span>
            <h1 className="title">Test de Velocidad</h1>
            <p className="hint">
              60 segundos contrarreloj para responder el máximo número de preguntas. El anfitrión crea la sala y comparte el código.
            </p>

            {errorMsg && <p className="error" style={{ margin: '0.8rem 0' }}>{errorMsg}</p>}

            <div className="lb-menu">
              <button className="big full" onClick={() => { setVista('crear'); setErrorMsg(''); }}>
                <Icon name="crown" size={22} /> Crear partida
              </button>
              <button className="big full" onClick={() => { setVista('unirse'); setErrorMsg(''); }}>
                <Icon name="users" size={22} /> Unirse a partida
              </button>
              <button className="secondary full" onClick={onLocal}>
                <Icon name="home" size={20} /> Jugar en un solo dispositivo
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 2. CREAR SALA */}
      {vista === 'crear' && (
        <section className="game">
          <div className="panel center">
            <span className="lb-luna chica">
              <Icon name="crown" size={40} strokeWidth={1.6} />
            </span>
            <h2 className="title">Crear partida</h2>
            <p className="hint">Introduce tu nombre para crear la sala y ser el anfitrión.</p>

            <div className="lb-form" style={{ marginTop: '1.2rem', textAlign: 'left' }}>
              <label className="field-label" htmlFor="vel-host-nombre">Tu nombre</label>
              <input
                id="vel-host-nombre"
                type="text"
                placeholder="Tu nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                maxLength={20}
                autoFocus
              />
              {errorMsg && <p className="error">{errorMsg}</p>}

              <button
                className="big full"
                style={{ marginTop: '1rem' }}
                disabled={cargando || !nombre.trim()}
                onClick={handleCrear}
              >
                <Icon name="check" size={22} strokeWidth={2.5} /> Crear sala
              </button>
              <button
                className="secondary full"
                style={{ marginTop: '0.6rem' }}
                onClick={() => { setVista('menu'); setErrorMsg(''); }}
              >
                Volver
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 3. UNIRSE A SALA */}
      {vista === 'unirse' && (
        <section className="game">
          <div className="panel center">
            <span className="lb-luna chica">
              <Icon name="users" size={40} strokeWidth={1.6} />
            </span>
            <h2 className="title">Unirse a partida</h2>
            <p className="hint">Introduce el código de 4 letras que te ha dado el anfitrión.</p>

            <div className="lb-form" style={{ marginTop: '1.2rem', textAlign: 'left' }}>
              <label className="field-label" htmlFor="vel-code-input">Código de la sala</label>
              <input
                id="vel-code-input"
                className="lb-input-codigo"
                type="text"
                placeholder="ABCD"
                value={codigoInput}
                onChange={(e) => setCodigoInput(e.target.value.toUpperCase())}
                maxLength={4}
                style={{ textTransform: 'uppercase', letterSpacing: '4px', textAlign: 'center', fontWeight: '800' }}
                autoFocus
              />

              <label className="field-label" htmlFor="vel-guest-nombre" style={{ marginTop: '1rem' }}>Tu nombre</label>
              <input
                id="vel-guest-nombre"
                type="text"
                placeholder="Tu nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                maxLength={20}
              />
              {errorMsg && <p className="error">{errorMsg}</p>}

              <button
                className="big full"
                style={{ marginTop: '1rem' }}
                disabled={cargando || !nombre.trim() || codigoInput.trim().length < 4}
                onClick={handleUnirse}
              >
                <Icon name="check" size={22} strokeWidth={2.5} /> Entrar en la partida
              </button>
              <button
                className="secondary full"
                style={{ marginTop: '0.6rem' }}
                onClick={() => { setVista('menu'); setErrorMsg(''); }}
              >
                Volver
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 4. SALA: LOBBY */}
      {vista === 'sala' && sala && sala.estado === 'lobby' && (
        <section className="game">
          <div className="panel center">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.8rem' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.35rem 1.1rem',
                  borderRadius: '9999px',
                  border: '1.5px solid #22c55e',
                  backgroundColor: '#f0fdf4',
                  color: '#16a34a',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  lineHeight: 1
                }}
              >
                <Icon name="lock" size={15} />
                Sala de espera
              </span>
            </div>
            <p className="hint">Código de la partida</p>
            <button
              type="button"
              className="qq-codigo-btn"
              onClick={copiarCodigo}
              title="Copiar código"
            >
              {sala.code}
            </button>
            <p className="hint small">
              {codigoCopiado ? '¡Copiado al portapapeles!' : 'Pulsa el código para copiarlo y compártelo con los demás.'}
            </p>
          </div>

          <div className="panel" style={{ marginTop: '1rem' }}>
            <h3 className="panel-title"><Icon name="users" size={20} /> Jugadores ({sala.jugadores.length})</h3>
            <div className="lb-lista">
              {sala.jugadores.map((j) => (
                <div key={j.id} className={`lb-jug ${j.id === sala.yoId ? 'yo' : ''}`}>
                  <span className="lb-jug-nombre">
                    {j.nombre}{j.id === sala.yoId ? ' (tú)' : ''}{j.id === 1 ? ' 👑' : ''}
                  </span>
                </div>
              ))}
            </div>
            {sala.jugadores.length < 2 && (
              <p className="hint" style={{ marginTop: '0.8rem' }}>
                Falta al menos 1 jugador más para poder empezar.
              </p>
            )}
          </div>

          {esAdmin ? (
            <div style={{ marginTop: '1.2rem' }}>
              <button
                className="big full"
                disabled={sala.jugadores.length < 2}
                onClick={handleIniciarJuego}
              >
                <Icon name="play" size={22} />
                {sala.jugadores.length < 2 ? 'Esperando jugadores...' : '¡Empezar Desafío!'}
              </button>
            </div>
          ) : (
            <div className="panel center" style={{ padding: '2rem 1.5rem', marginTop: '1rem' }}>
              <span className="lb-luna chica"><Icon name="hourglass" size={40} /></span>
              <h3 style={{ margin: '0.5rem 0' }}>Esperando al anfitrión...</h3>
              <p className="hint">El anfitrión sorteará quién empieza el minuto contrarreloj.</p>
            </div>
          )}

          <div className="actions" style={{ marginTop: '1rem' }}>
            <button className="secondary danger full" onClick={() => setModalSalir(true)}>
              <Icon name="door" size={20} /> Salir de la sala
            </button>
          </div>
        </section>
      )}

      {/* 5. SALA: CUENTA ATRÁS PREVIA */}
      {vista === 'sala' && sala && sala.estado === 'cuenta_atras' && (
        <section className="game center">
          <p className="categoria">Turno sorteado al azar</p>
          {esMiTurno ? (
            <>
              <h1 className="title">¡Es tu turno, <span className="hl">{sala.jugadorActualNombre}</span>!</h1>
              <p className="hint">Prepárate: dispondrás de 60 segundos contrarreloj.</p>
            </>
          ) : (
            <>
              <h1 className="title">¡Turno de <span className="hl">{sala.jugadorActualNombre}</span>!</h1>
              <p className="hint">Prepárate para ver su ronda contrarreloj en directo.</p>
            </>
          )}

          <div className="vel-cuenta-circulo">
            <span>{sala.cuentaAtrasSegundos}</span>
          </div>

          {esMiTurno ? (
            <button className="big full" onClick={handleArrancarMiTurnoEnVivo}>
              <Icon name="zap" size={22} /> ¡Empezar ya sin esperar!
            </button>
          ) : (
            <p className="hint center">Comenzando en breve...</p>
          )}
        </section>
      )}

      {/* 6. SALA: JUGANDO ONLINE */}
      {vista === 'sala' && sala && sala.estado === 'jugando' && (
        <section className="game">
          {esMiTurno ? (
            <>
              <div className="hud">
                <span className="chip"><Icon name="users" size={18} />{sala.jugadorActualNombre} (Tú)</span>
                <span className="chip alt">
                  <Icon name="check" size={18} strokeWidth={2.5} /> {aciertosActuales} aciertos
                </span>
              </div>

              <div className="timer" role="timer">
                <div
                  className={`timer-bar ${tiempoRestante <= 15 ? 'low' : ''}`}
                  style={{ width: `${Math.min(100, (tiempoRestante / 60) * 100)}%` }}
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
                          onClick={() => responderOpcionOnline(idx)}
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
                      <form onSubmit={enviarRespuestaEspecialOnline}>
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
            </>
          ) : (
            <>
              <div className="hud">
                <span className="chip"><Icon name="zap" size={18} />Jugando: <strong>{sala.jugadorActualNombre}</strong></span>
                <span className="chip alt">
                  <Icon name="check" size={18} strokeWidth={2.5} /> {sala.progresoEnVivo?.aciertos ?? 0} aciertos
                </span>
              </div>

              <div className="timer" role="timer">
                <div
                  className={`timer-bar ${((sala.progresoEnVivo?.tiempoRestante ?? 60) <= 15) ? 'low' : ''}`}
                  style={{ width: `${Math.min(100, ((sala.progresoEnVivo?.tiempoRestante ?? 60) / 60) * 100)}%` }}
                />
              </div>
              <p className="timer-text">
                <Icon name="clock" size={18} />
                <strong>{sala.progresoEnVivo?.tiempoRestante ?? 60} s</strong>
              </p>

              <div className="panel vel-tarjeta-pregunta" style={{ textAlign: 'center', padding: '2rem 1.4rem' }}>
                {sala.progresoEnVivo?.mostrandoEspecial ? (
                  <div className="vel-especial-caja-pregunta" style={{ margin: '1rem auto' }}>
                    <span style={{ fontSize: '2rem' }}>⭐</span>
                    <h3 style={{ margin: '0.4rem 0', color: '#78350f' }}>¡Pregunta Especial de 30s en curso!</h3>
                    <p style={{ margin: 0 }}>El tiempo está pausado mientras responde la pregunta abierta.</p>
                  </div>
                ) : (
                  <>
                    <span className="vel-pregunta-num">Pregunta en pantalla</span>
                    <h2 className="vel-pregunta-texto" style={{ margin: '1rem 0' }}>
                      {sala.progresoEnVivo?.preguntaTexto || 'Respondiendo preguntas a toda velocidad...'}
                    </h2>
                    <p className="hint">
                      {sala.jugadorActualNombre} está seleccionando su respuesta en directo.
                    </p>
                  </>
                )}
              </div>
            </>
          )}

          <div className="actions" style={{ marginTop: '1.2rem' }}>
            <button className="secondary danger full" onClick={() => setModalSalir(true)}>
              <Icon name="door" size={20} /> Salir de la sala
            </button>
          </div>
        </section>
      )}

      {/* 7. SALA: RESUMEN DEL TURNO */}
      {vista === 'sala' && sala && sala.estado === 'resumen_turno' && (
        <section className="game center">
          <div className="end-card">
            <span className="end-icon"><Icon name="hourglass" size={44} /></span>
            <h1 className="title">¡Fin del turno!</h1>
            <p className="reveal" style={{ fontSize: '1.4rem', margin: '0.8rem 0' }}>
              <strong>{sala.jugadorActualNombre}</strong> ha conseguido <strong>{sala.jugadores.find((j) => j.id === sala.jugadorActualId)?.aciertos ?? 0} aciertos</strong>.
            </p>

            <div className="scoreboard">
              {sala.jugadores.map((j) => (
                <div key={j.id} className={`score-row ${j.id === sala.jugadorActualId ? 'first' : ''}`}>
                  <span className="score-name">{j.nombre} {j.id === sala.yoId ? '(Tú)' : ''}</span>
                  <span className="score-pts">
                    {j.jugo ? `${j.aciertos} pts` : 'Pendiente'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="actions" style={{ marginTop: '1.5rem' }}>
            {esAdmin ? (
              sala.jugadores.some((j) => !j.jugo) ? (
                <button className="big full" onClick={handleSiguienteJugador}>
                  <Icon name="dice" size={20} /> Sortear siguiente jugador
                </button>
              ) : (
                <button className="big full" onClick={handleSiguienteJugador}>
                  <Icon name="trophy" size={20} /> Ver podio y resultados finales
                </button>
              )
            ) : (
              <p className="hint center">Esperando a que el anfitrión continúe...</p>
            )}

            <button className="secondary danger full" onClick={() => setModalSalir(true)}>
              <Icon name="door" size={20} /> Salir de la sala
            </button>
          </div>
        </section>
      )}

      {/* 8. SALA: FINAL */}
      {vista === 'sala' && sala && sala.estado === 'final' && (
        <section className="game">
          <div className="end-card">
            <span className="end-icon"><Icon name="crown" size={48} /></span>
            <h1 className="title">Clasificación Final</h1>
            <p className="final-score">
              {ganadores.length === 0
                ? 'Partida completada'
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
                      {j.nombre} {j.id === sala.yoId ? '(Tú)' : ''}
                    </span>
                    <span className="score-pts">{j.aciertos} pts</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="actions" style={{ marginTop: '1.5rem' }}>
            {esAdmin && (
              <button className="big full" onClick={handleReiniciarPartida}>
                <Icon name="refresh" size={20} /> Otra partida (mismos jugadores)
              </button>
            )}
            <button className="secondary danger full" onClick={() => setModalSalir(true)}>
              <Icon name="door" size={20} /> Salir al menú principal
            </button>
          </div>
        </section>
      )}

      {/* MODAL DE CONFIRMACIÓN PARA SALIR */}
      {modalSalir && (
        <div className="rg-modal-fondo" onClick={() => setModalSalir(false)}>
          <div 
            className="rg-modal" 
            onClick={(e) => e.stopPropagation()} 
            style={{ maxWidth: '420px', textAlign: 'center', padding: '1.8rem 1.4rem' }}
          >
            <div style={{ fontSize: '2.4rem', marginBottom: '0.4rem' }}>🚪</div>
            <h3 style={{ margin: '0 0 0.6rem', color: '#1e1b4b', fontSize: '1.3rem' }}>
              ¿Abandonar la partida?
            </h3>
            <p className="hint" style={{ fontSize: '0.95rem', marginBottom: '1.4rem', lineHeight: '1.4' }}>
              Si sales de la sala perderás tu progreso actual en la partida. ¿Estás seguro de que deseas salir?
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <button 
                type="button" 
                className="secondary full" 
                onClick={() => setModalSalir(false)}
              >
                No, quedarme
              </button>
              <button 
                type="button" 
                className="secondary danger full" 
                style={{ background: '#ef4444', color: '#ffffff', borderColor: '#dc2626' }}
                onClick={() => {
                  setModalSalir(false);
                  handleSalir();
                }}
              >
                Sí, salir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}