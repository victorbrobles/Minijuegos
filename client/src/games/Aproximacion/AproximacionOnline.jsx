// client/src/games/Aproximacion/AproximacionOnline.jsx
import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../components/Icon.jsx';
import './Aproximacion.css';
import '../Adivina/Adivina.css';
import { MenuInicioJuego, MenuModoOnline, FormCrearSala, FormUnirseSala, CabeceraSala, ListaSala, EsperandoAnfitrion } from '../../components/MenuJuego.jsx';

const CLAVE_SESION_APROX = 'aprox_online_session';
const TIEMPO_TURNO = 30; // 30 segundos por turno

export default function AproximacionOnline({ onLocal, onSalir }) {
  const [vista, setVista] = useState('menu'); // 'menu' | 'crear' | 'unirse' | 'sala'
  const [nombre, setNombre] = useState('');
  const [codigoInput, setCodigoInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);
  const [modalSalir, setModalSalir] = useState(false);
  const [modalAyuda, setModalAyuda] = useState(false);

  const [sesion, setSesion] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(CLAVE_SESION_APROX));
    } catch {
      return null;
    }
  });

  const [sala, setSala] = useState(null);
  const [codigoCopiado, setCodigoCopiado] = useState(false);

  // Estados de entrada para el turno
  const [inputNumero, setInputNumero] = useState('');
  const [confianzaElegida, setConfianzaElegida] = useState(null);
  const [inputRealManual, setInputRealManual] = useState('');
  const [errorTurno, setErrorTurno] = useState('');
  
  const [tiempoRestante, setTiempoRestante] = useState(TIEMPO_TURNO);

  const intervalRef = useRef(null);
  const timerTurnoRef = useRef(null);
  
  const inputNumeroRef = useRef(inputNumero);
  const confianzaElegidaRef = useRef(confianzaElegida);
  
  useEffect(() => {
    inputNumeroRef.current = inputNumero;
    confianzaElegidaRef.current = confianzaElegida;
  }, [inputNumero, confianzaElegida]);

  useEffect(() => {
    if (!sesion) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setSala(null);
      return;
    }

    const consultarEstado = () => {
      fetch(`/api/aproximacion/online/sala/${sesion.code}?token=${sesion.token}`)
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
          sessionStorage.removeItem(CLAVE_SESION_APROX);
          setSesion(null);
          setSala(null);
          setVista('online_menu');
          setErrorMsg('La sala se ha cerrado.');
        });
    };

    consultarEstado();
    intervalRef.current = setInterval(consultarEstado, 700);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sesion]);
  
  const ronda = sala?.ronda;
  const esAdmin = sala?.esAdmin;
  const yoId = sala?.yoId;
  const infoTurno = ronda?.infoTurno;
  const esMiTurno = infoTurno?.jugadorId === yoId;
  const esPrimerJugador = ronda?.primerJugadorId === yoId;

  const respuestasDadas = ronda?.decisiones
    ? Object.entries(ronda.decisiones)
        .filter(([, d]) => d.tipo === 'propia')
        .map(([jId, d]) => ({
          jugadorId: Number(jId),
          jugadorNombre: sala.jugadores.find((j) => j.id === Number(jId))?.nombre,
          valor: d.valor
        }))
    : [];

  // Temporizador visual reactivo al cambio de turno
  useEffect(() => {
    if (!ronda || (ronda.faseRonda !== 'turno' && ronda.faseRonda !== 'segunda_vuelta')) {
      if (timerTurnoRef.current) clearInterval(timerTurnoRef.current);
      return;
    }

    setTiempoRestante(TIEMPO_TURNO);

    if (timerTurnoRef.current) clearInterval(timerTurnoRef.current);
    timerTurnoRef.current = setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev <= 1) {
          clearInterval(timerTurnoRef.current);
          if (esMiTurno) {
             forzarEnvioTurnoOnline();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerTurnoRef.current) clearInterval(timerTurnoRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [infoTurno?.subTurnoIndex, ronda?.faseRonda, esMiTurno]);

  const forzarEnvioTurnoOnline = async () => {
      let payload = {};
      
      if (ronda.faseRonda === 'turno') {
          if (confianzaElegidaRef.current !== null) {
              const respRef = respuestasDadas.find((r) => r.jugadorId === confianzaElegidaRef.current);
              if (respRef) {
                payload = { tipo: 'confia', valor: respRef.valor, confiaEnId: respRef.jugadorId };
              }
          }
          
          if (!payload.tipo) {
              let numVal = 0;
              if (inputNumeroRef.current !== '' && !isNaN(Number(inputNumeroRef.current))) {
                  numVal = Math.round(Number(inputNumeroRef.current));
              }
              
              let valorFinal = numVal;
              while (respuestasDadas.some((r) => r.valor === valorFinal)) {
                  valorFinal++;
              }
              payload = { tipo: 'propia', valor: valorFinal };
          }
          
          try {
              await fetch(`/api/aproximacion/online/sala/${sesion.code}/responder`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: sesion.token, ...payload })
              });
              setInputNumero('');
              setConfianzaElegida(null);
          } catch (err) {
              console.error(err);
          }
      } else if (ronda.faseRonda === 'segunda_vuelta') {
          handleSegundaVuelta(null);
      }
  };

  const handleCrear = async () => {
    if (!nombre.trim()) return;
    setCargando(true);
    try {
      const res = await fetch('/api/aproximacion/online/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_APROX, JSON.stringify(nueva));
      setSesion(nueva);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleUnirse = async () => {
    if (!nombre.trim() || !codigoInput.trim()) return;
    setCargando(true);
    try {
      const res = await fetch('/api/aproximacion/online/unirse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codigoInput.trim().toUpperCase(), nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_APROX, JSON.stringify(nueva));
      setSesion(nueva);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleIniciarJuego = async () => {
    try {
      const res = await fetch(`/api/aproximacion/online/sala/${sesion.code}/iniciar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleConfirmarRespuesta = async (e) => {
    if(e) e.preventDefault();
    setErrorTurno('');

    let payload = {};
    if (confianzaElegida !== null) {
      const respRef = respuestasDadas.find((r) => r.jugadorId === confianzaElegida);
      if (!respRef) {
        setErrorTurno('Selección de confianza inválida.');
        return;
      }
      payload = { tipo: 'confia', valor: respRef.valor, confiaEnId: respRef.jugadorId };
    } else {
      if (inputNumero === '' || isNaN(Number(inputNumero))) {
        setErrorTurno('Introduce un número válido.');
        return;
      }
      payload = { tipo: 'propia', valor: Math.round(Number(inputNumero)) };
    }

    try {
      const res = await fetch(`/api/aproximacion/online/sala/${sesion.code}/responder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token, ...payload })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setInputNumero('');
      setConfianzaElegida(null);
    } catch (err) {
      setErrorTurno(err.message);
    }
  };

  const handleSegundaVuelta = async (cambiarAId = null) => {
    try {
      await fetch(`/api/aproximacion/online/sala/${sesion.code}/segunda-vuelta`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token, cambiarAId })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleEnviarManual = async (e) => {
    e.preventDefault();
    if (inputRealManual === '' || isNaN(Number(inputRealManual))) {
      setErrorTurno('Introduce una cifra numérica.');
      return;
    }

    try {
      const res = await fetch(`/api/aproximacion/online/sala/${sesion.code}/introducir-real`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token, valorReal: inputRealManual })
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setInputRealManual('');
    } catch (err) {
      setErrorTurno(err.message);
    }
  };

  const handleSiguienteRonda = async () => {
    try {
      await fetch(`/api/aproximacion/online/sala/${sesion.code}/siguiente-ronda`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleFinalizar = async () => {
    try {
      await fetch(`/api/aproximacion/online/sala/${sesion.code}/finalizar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSalir = () => {
    sessionStorage.removeItem(CLAVE_SESION_APROX);
    setSesion(null);
    setSala(null);
    setVista('online_menu');
  };

  const copiarCodigo = () => {
    if (!sala?.code) return;
    navigator.clipboard?.writeText(sala.code);
    setCodigoCopiado(true);
    setTimeout(() => setCodigoCopiado(false), 2000);
  };

  const ranking = sala?.jugadores ? [...sala.jugadores].sort((a, b) => b.puntos - a.puntos) : [];
  const maximo = ranking.length ? ranking[0].puntos : 0;
  const ganadores = maximo > 0 ? ranking.filter((j) => j.puntos === maximo) : [];

  return (
    <div className="aprox-contenedor">
      {/* ---------------- BOTÓN Y MODAL DE AYUDA ---------------- */}

      {modalAyuda && (
        <div className="rg-modal-fondo" onClick={() => setModalAyuda(false)}>
          <div className="rg-modal aprox-modal-ayuda" onClick={(e) => e.stopPropagation()}>
            <div className="aprox-modal-header">
              <span className="aprox-modal-signo-title">?</span>
              <h3>¿Cómo se juega a Aproximación?</h3>
            </div>

            <div className="aprox-modal-cuerpo">
              <p><strong>1. Dinámica de la ronda:</strong></p>
              <ul>
                <li>Sale una pregunta numérica (geografía, récords, deportes o sobre vosotros mismos).</li>
                <li>Un jugador al azar empieza respondiendo con una cifra. Dispone de <strong>30 segundos</strong>.</li>
                <li>Los siguientes jugadores ven las respuestas anteriores y pueden <strong>poner su propio número</strong> o <strong>confiar en el de otro</strong>.</li>
                <li>Al final de la ronda, el primer jugador tiene una <strong>segunda oportunidad</strong> (otros 30s) para mantener su cifra o cambiar y confiar en la de otro.</li>
              </ul>

              <p><strong>2. Sistema de puntuación:</strong></p>
              <div className="aprox-tabla-puntos">
                <div className="aprox-puntos-fila acierto">
                  <span>🎯 Respuesta exacta</span>
                  <strong>+15 pts (autor) / +8 pts (confianza)</strong>
                </div>
                <div className="aprox-puntos-fila cercana">
                  <span>🥇 Más cercana</span>
                  <strong>+6 pts (autor) / +3 pts (confianza)</strong>
                </div>
                <div className="aprox-puntos-fila lejana">
                  <span>❌ Más lejana</span>
                  <strong>-5 pts (autor) / 0 pts (confianza)</strong>
                </div>
                <div className="aprox-puntos-fila intermedio">
                  <span>⚖️ Mitad superior de intermedias</span>
                  <strong>+1 pt (autor) / 0 pts (confianza)</strong>
                </div>
                <div className="aprox-puntos-fila intermedio-mala">
                  <span>⚠️ Mitad inferior de intermedias</span>
                  <strong>-1 pt (autor) / 0 pts (confianza)</strong>
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
      {/* ---------------- FIN AYUDA ---------------- */}

      {/* 1. MENÚ ONLINE */}
      {vista === 'menu' && (
        <MenuInicioJuego
          juegoId="aproximacion"
          onOnline={() => { setVista('online_menu'); setErrorMsg(''); }}
          onLocal={onLocal}
          onAyuda={() => setModalAyuda(true)}
          error={errorMsg}
        />
      )}

      {vista === 'online_menu' && (
        <MenuModoOnline
          onVolver={() => { setVista('menu'); setErrorMsg(''); }}
          onCrear={() => { setVista('crear'); setErrorMsg(''); }}
          onUnirse={() => { setVista('unirse'); setErrorMsg(''); }}
          onAyuda={() => setModalAyuda(true)}
          error={errorMsg}
        />
      )}

      {/* 2. CREAR SALA */}
      {vista === 'crear' && (
        <FormCrearSala
          onVolver={() => { setVista('online_menu'); setErrorMsg(''); }}
          onAyuda={() => setModalAyuda(true)}
          nombre={nombre}
          setNombre={setNombre}
          onCrear={handleCrear}
          cargando={cargando}
          error={errorMsg}
          descripcion="Introduce tu nombre para abrir la sala y ser el anfitrión (de 4 a 20 jugadores)."
        />
      )}

      {/* 3. UNIRSE A SALA */}
      {vista === 'unirse' && (
        <FormUnirseSala
          onVolver={() => { setVista('online_menu'); setErrorMsg(''); }}
          onAyuda={() => setModalAyuda(true)}
          codigo={codigoInput}
          setCodigo={setCodigoInput}
          nombre={nombre}
          setNombre={setNombre}
          onUnirse={handleUnirse}
          cargando={cargando}
          error={errorMsg}
        />
      )}

      {/* 4. LOBBY */}
      {vista === 'sala' && sala && sala.estado === 'lobby' && (
        <section className="game qq-pantalla">
          <CabeceraSala codigo={sala.code} onVolver={() => setModalSalir(true)} onAyuda={() => setModalAyuda(true)} />
          <ListaSala jugadores={sala.jugadores} yoId={yoId} max={20} min={4} />

          {errorMsg && <p className="error" style={{ margin: '0.8rem 0' }}>{errorMsg}</p>}

          {esAdmin ? (
            <button
              className="big full qq-btn-principal"
              style={{ marginTop: '1.2rem' }}
              disabled={sala.jugadores.length < 4}
              onClick={handleIniciarJuego}
            >
              <Icon name="play" size={22} />
              {sala.jugadores.length < 4 ? 'Esperando jugadores (mínimo 4)...' : '¡Empezar Partida (15 Rondas)!'}
            </button>
          ) : (
            <EsperandoAnfitrion />
          )}
        </section>
      )}

      {/* 5. JUGANDO: FASE TURNO (MI TURNO vs ESPERA) */}
      {vista === 'sala' && sala && sala.estado === 'jugando' && ronda && ronda.faseRonda === 'turno' && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="flagFinish" size={18} />Ronda {sala.rondaNum} de {sala.maxRondas}</span>
            <span className="chip alt">
              <Icon name="users" size={18} />Jugador {infoTurno?.subTurnoIndex + 1} de {sala.jugadores.length}
            </span>
          </div>

          {/* Marcador superior */}
          <div className="scoreboard-container" style={{ justifyContent: 'center', marginBottom: '0.8rem' }}>
            {sala.jugadores.map((j) => (
              <div key={j.id} className="score-pill">
                <span>{j.nombre}: <strong>{j.puntos} pts</strong></span>
              </div>
            ))}
          </div>

          <div className="panel aprox-pregunta-card">
            <span className={`aprox-badge-pregunta ${ronda.pregunta.manual ? 'personal' : ''}`}>
              {ronda.pregunta.manual ? 'Pregunta sobre los Jugadores' : 'Pregunta Numérica'}
            </span>
            <h2 className="aprox-pregunta-texto">{ronda.pregunta.pregunta}</h2>
          </div>

          {esMiTurno ? (
            /* ES MI TURNO: Formulario idéntico al local */
            <>
              <div className="starter">
                <Icon name="dice" size={28} />
                <p>¡Es tu turno! Elige una cifra o confía en un compañero</p>
              </div>

              {!infoTurno?.esPrimerJugador && respuestasDadas.length > 0 && (
                <div className="panel aprox-respuestas-previas">
                  <h3 className="panel-title"><Icon name="eye" size={20} /> Respuestas dadas hasta ahora</h3>
                  <p className="field-label">Puedes pulsar una para confiar en ella o escribir tu propio número:</p>

                  <div className="aprox-opciones-confianza">
                    {respuestasDadas.map((r) => {
                      const quienesConfian = Object.entries(ronda.decisiones)
                        .filter(([, d]) => d.tipo === 'confia' && d.confiaEnId === r.jugadorId)
                        .map(([id]) => sala.jugadores.find((j) => j.id === Number(id))?.nombre);

                      const seleccionada = confianzaElegida === r.jugadorId;

                      return (
                        <button
                          key={r.jugadorId}
                          type="button"
                          className={`aprox-btn-opcion-confianza ${seleccionada ? 'activa' : ''}`}
                          onClick={() => {
                            setConfianzaElegida(seleccionada ? null : r.jugadorId);
                            setInputNumero('');
                            setErrorTurno('');
                          }}
                        >
                          <div className="aprox-opcion-valor">{r.valor}</div>
                          <div className="aprox-opcion-autor">Dicha por <strong>{r.jugadorNombre}</strong></div>
                          {quienesConfian.length > 0 && (
                            <div className="aprox-opcion-apoyos">Confían: {quienesConfian.join(', ')}</div>
                          )}
                          <span className="aprox-tag-confiar">
                            {seleccionada ? '✓ Has elegido confiar' : 'Pulsar para confiar'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <form onSubmit={handleConfirmarRespuesta} className="panel aprox-formulario">
                <h3 className="panel-title">
                  {infoTurno?.esPrimerJugador
                    ? '¿Cuál es tu respuesta?'
                    : confianzaElegida !== null
                    ? `Confiarás en la cifra de ${sala.jugadores.find((j) => j.id === confianzaElegida)?.nombre}`
                    : 'Escribe tu propia cifra (sin repetir):'}
                </h3>

                {confianzaElegida === null && (
                  <input
                    type="number"
                    step="1"
                    autoFocus
                    placeholder="Escribe una cantidad numérica..."
                    value={inputNumero}
                    onChange={(e) => {
                      setInputNumero(e.target.value);
                      setConfianzaElegida(null);
                      setErrorTurno('');
                    }}
                    required
                  />
                )}

                {errorTurno && <p className="error" role="alert">{errorTurno}</p>}

                <button type="submit" className="big full" style={{ marginTop: '1rem' }}>
                  <Icon name="check" size={22} strokeWidth={2.5} />
                  {confianzaElegida !== null ? 'Confirmar confianza' : 'Confirmar mi número'}
                </button>
                <div className="timer" style={{ marginTop: '1.2rem', marginBottom: '1rem' }}>
                  <div className={`timer-bar${tiempoRestante <= 10 ? ' low' : ''}`} style={{ width: `${(tiempoRestante / TIEMPO_TURNO) * 100}%` }} />
                </div>
                <p className="timer-text" style={{ marginTop: '-0.5rem', marginBottom: '0.8rem' }}>
                  <Icon name="clock" size={16} /> {tiempoRestante} s
                </p>
              </form>
            </>
          ) : (
            /* NO ES MI TURNO: Pantalla de espera interactiva */
            <div className="panel center" style={{ padding: '2rem 1.2rem' }}>
              <div className="starter" style={{ margin: '0 auto 1.2rem', display: 'inline-flex' }}>
                <Icon name="hourglass" size={28} />
                <p>Turno de: <strong>{infoTurno?.jugadorNombre}</strong></p>
              </div>
              <p className="hint">
                Espera tu turno mientras <strong>{infoTurno?.jugadorNombre}</strong> decide su cifra o elige en quién confiar...
              </p>
              <div className="timer" style={{ marginTop: '1.2rem', marginBottom: '1rem' }}>
                <div className={`timer-bar${tiempoRestante <= 10 ? ' low' : ''}`} style={{ width: `${(tiempoRestante / TIEMPO_TURNO) * 100}%` }} />
              </div>
              <p className="timer-text" style={{ marginTop: '-0.5rem', marginBottom: '0.8rem' }}>
                <Icon name="clock" size={16} /> {tiempoRestante} s
              </p>

              {respuestasDadas.length > 0 && (
                <div style={{ marginTop: '1.5rem', textAlign: 'left' }}>
                  <h4 style={{ color: '#1e1b4b', marginBottom: '0.6rem' }}>Cifras ya colocadas en esta ronda:</h4>
                  <div className="aprox-top-bloque" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {respuestasDadas.map((r) => (
                      <div key={r.jugadorId} className="aprox-fila-resultado intermedia">
                        <span style={{ fontSize: '1.2rem', fontWeight: '900', color: '#1e1b4b' }}>{r.valor}</span>
                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>por {r.jugadorNombre}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <button className="secondary danger full" style={{ marginTop: '1rem' }} onClick={() => setModalSalir(true)}>
            Salir de la sala
          </button>
        </section>
      )}

      {/* 6. JUGANDO: SEGUNDA VUELTA DEL PRIMER JUGADOR */}
      {vista === 'sala' && sala && sala.estado === 'jugando' && ronda && ronda.faseRonda === 'segunda_vuelta' && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="flagFinish" size={18} />Ronda {sala.rondaNum}</span>
            <span className="chip alt">Segunda oportunidad</span>
          </div>

          <div className="panel aprox-pregunta-card">
            <h2 className="aprox-pregunta-texto">{ronda.pregunta.pregunta}</h2>
            <div className="aprox-mi-respuesta-inicial">
              Respuesta inicial de <strong>{ronda.primerJugadorNombre}</strong>:{' '}
              <strong>{ronda.decisiones[ronda.primerJugadorId]?.valor}</strong>
            </div>
          </div>

          {esPrimerJugador ? (
            <>
              <div className="starter">
                <Icon name="refresh" size={28} />
                <p>¡Segunda oportunidad! ¿Te quedas con tu número o cambias?</p>
              </div>

              <div className="panel aprox-respuestas-previas">
                <h3 className="panel-title">Respuestas del resto de jugadores:</h3>
                <div className="aprox-opciones-confianza">
                  {respuestasDadas
                    .filter((r) => r.jugadorId !== yoId)
                    .map((r) => (
                      <button
                        key={r.jugadorId}
                        type="button"
                        className="aprox-btn-opcion-confianza"
                        onClick={() => handleSegundaVuelta(r.jugadorId)}
                      >
                        <div className="aprox-opcion-valor">{r.valor}</div>
                        <div className="aprox-opcion-autor">De <strong>{r.jugadorNombre}</strong></div>
                        <span className="aprox-tag-confiar">Cambiar y confiar en esta</span>
                      </button>
                    ))}
                </div>
              </div>

              <button className="big full" onClick={() => handleSegundaVuelta(null)}>
                <Icon name="check" size={22} /> Mantener mi respuesta ({ronda.decisiones[yoId]?.valor})
              </button>
              <div className="timer" style={{ marginTop: '1.2rem', marginBottom: '1rem' }}>
                <div className={`timer-bar${tiempoRestante <= 10 ? ' low' : ''}`} style={{ width: `${(tiempoRestante / TIEMPO_TURNO) * 100}%` }} />
              </div>
              <p className="timer-text" style={{ marginTop: '-0.5rem', marginBottom: '0.8rem' }}>
                <Icon name="clock" size={16} /> {tiempoRestante} s
              </p>
            </>
          ) : (
            <div className="panel center" style={{ padding: '2rem 1.2rem' }}>
              <div className="starter" style={{ margin: '0 auto 1.2rem', display: 'inline-flex' }}>
                <Icon name="refresh" size={28} />
                <p>Segunda oportunidad de <strong>{ronda.primerJugadorNombre}</strong></p>
              </div>
              <p className="hint">
                Esperando a que <strong>{ronda.primerJugadorNombre}</strong> decida si mantiene su cifra o cambia de opinión para confiar en otro rival...
              </p>
              <div className="timer" style={{ marginTop: '1.2rem', marginBottom: '1rem' }}>
                <div className={`timer-bar${tiempoRestante <= 10 ? ' low' : ''}`} style={{ width: `${(tiempoRestante / TIEMPO_TURNO) * 100}%` }} />
              </div>
              <p className="timer-text" style={{ marginTop: '-0.5rem', marginBottom: '0.8rem' }}>
                <Icon name="clock" size={16} /> {tiempoRestante} s
              </p>
            </div>
          )}

          <button className="secondary danger full" style={{ marginTop: '1rem' }} onClick={() => setModalSalir(true)}>
            Salir de la sala
          </button>
        </section>
      )}

      {/* 7. JUGANDO: INTRODUCIR REAL EN PREGUNTAS SOBRE JUGADORES */}
      {vista === 'sala' && sala && sala.estado === 'jugando' && ronda && ronda.faseRonda === 'introducir_real' && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="flagFinish" size={18} />Ronda {sala.rondaNum}</span>
            <span className="chip alt">Recuento común</span>
          </div>

          <div className="panel aprox-pregunta-card">
            <span className="aprox-badge-pregunta personal">Pregunta sobre los Jugadores</span>
            <h2 className="aprox-pregunta-texto">{ronda.pregunta.pregunta}</h2>
          </div>

          {esAdmin ? (
            <form onSubmit={handleEnviarManual} className="panel aprox-formulario">
              <p className="field-label" style={{ marginBottom: '0.8rem' }}>
                Haced el recuento conjunto entre todos e introduce la cifra real obtenida:
              </p>
              <input
                type="number"
                step="1"
                autoFocus
                placeholder="Total real tras el recuento..."
                value={inputRealManual}
                onChange={(e) => {
                  setInputRealManual(e.target.value);
                  setErrorTurno('');
                }}
                required
              />
              {errorTurno && <p className="error" role="alert">{errorTurno}</p>}

              <button type="submit" className="big full" style={{ marginTop: '1rem' }}>
                <Icon name="trophy" size={22} /> Calcular resultados y puntuaciones
              </button>
            </form>
          ) : (
            <div className="panel center" style={{ padding: '2rem 1.2rem' }}>
              <p className="hint">
                Esperando a que el anfitrión introduzca la cifra real consensuada tras el recuento...
              </p>
            </div>
          )}

          <button className="secondary danger full" style={{ marginTop: '1rem' }} onClick={() => setModalSalir(true)}>
            Salir de la sala
          </button>
        </section>
      )}

      {/* 8. RESULTADOS DE LA RONDA */}
      {vista === 'sala' && sala && sala.estado === 'jugando' && ronda && ronda.faseRonda === 'resultados' && ronda.resultado && (
        <section className="game">
          <div className="end-card aprox-resolucion-card">
            <span className="end-icon"><Icon name="trophy" size={44} /></span>
            <p className="categoria">{ronda.pregunta.pregunta}</p>
            <h1 className="title">
              Respuesta correcta: <span className="aprox-num-correcto">{ronda.resultado.objetivo}</span>
            </h1>

            <div className="aprox-resolucion-lista">
              {ronda.resultado.listaUnicas.map((item) => {
                const esExacta = item.distancia === 0;
                const esMin = item.distancia === ronda.resultado.listaUnicas[0].distancia && !esExacta;
                const esMax = item.distancia === ronda.resultado.listaUnicas[ronda.resultado.listaUnicas.length - 1].distancia && ronda.resultado.listaUnicas.length > 1 && !esExacta;

                const confiadosNombres = Object.entries(ronda.resultado.decsFinales)
                  .filter(([id, d]) => Number(id) !== item.autorId && d.valor === item.valor)
                  .map(([id]) => sala.jugadores.find((j) => j.id === Number(id))?.nombre);

                const autorNombre = sala.jugadores.find((j) => j.id === item.autorId)?.nombre;

                return (
                  <div
                    key={item.valor}
                    className={`aprox-fila-resultado ${
                      esExacta ? 'exacta' : esMin ? 'cercana' : esMax ? 'lejana' : 'intermedia'
                    }`}
                  >
                    <div className="aprox-res-col-val">
                      <span className="aprox-res-num">{item.valor}</span>
                      <span className="aprox-res-dist">(distancia: {item.distancia})</span>
                    </div>

                    <div className="aprox-res-col-jugadores">
                      <div>
                        <strong>{autorNombre}</strong>{' '}
                        <span className="aprox-badge-pts">
                          {ronda.resultado.scoresRonda[item.autorId] >= 0
                            ? `+${ronda.resultado.scoresRonda[item.autorId]}`
                            : ronda.resultado.scoresRonda[item.autorId]} pts
                        </span>
                      </div>
                      {confiadosNombres.length > 0 && (
                        <div className="aprox-res-confian">
                          Confiaron: {confiadosNombres.map((nom) => {
                            const jId = sala.jugadores.find((j) => j.nombre === nom)?.id;
                            const ptsConf = ronda.resultado.scoresRonda[jId];
                            return `${nom} (+${ptsConf} pts)`;
                          }).join(', ')}
                        </div>
                      )}
                    </div>

                    <div className="aprox-res-etiqueta">
                      {esExacta && '🎯 EXACTA'}
                      {esMin && '🥇 MÁS CERCANA'}
                      {esMax && '❌ MÁS LEJANA'}
                      {!esExacta && !esMin && !esMax && '⚖️ INTERMEDIA'}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="scoreboard" style={{ marginTop: '1.5rem', width: '100%' }}>
              <h3 className="section-title" style={{ margin: '0 0 0.8rem', textAlign: 'center' }}>
                Marcador general
              </h3>
              {ranking.map((j, i) => (
                <div key={j.id} className={`score-row${i === 0 && j.puntos > 0 ? ' first' : ''}`}>
                  <span className="score-name">
                    {i === 0 && j.puntos > 0 ? <Icon name="crown" size={22} /> : <span className="pos">{i + 1}</span>}
                    {j.nombre}
                  </span>
                  <span className="score-pts">{j.puntos} pts</span>
                </div>
              ))}
            </div>
          </div>

          {esAdmin ? (
            <div className="actions">
              <button onClick={handleSiguienteRonda}>
                <Icon name="play" size={20} />
                {sala.rondaNum < sala.maxRondas ? `Siguiente ronda (${sala.rondaNum + 1} de${sala.maxRondas})` : 'Ver podio final'}
              </button>
              <button className="secondary danger" onClick={handleFinalizar}>
                <Icon name="flagFinish" size={20} /> Finalizar partida
              </button>
            </div>
          ) : (
            <div className="panel center" style={{ marginTop: '1rem' }}>
              <p className="hint">Esperando a que el anfitrión avance a la siguiente ronda...</p>
              <button className="secondary danger full" style={{ marginTop: '0.8rem' }} onClick={() => setModalSalir(true)}>
                Salir de la sala
              </button>
            </div>
          )}
        </section>
      )}

      {/* 9. PANTALLA FINAL */}
      {vista === 'sala' && sala && sala.estado === 'final' && (
        <section className="game">
          <div className="end-card">
            <span className="end-icon"><Icon name="crown" size={44} /></span>
            <h1 className="title">Clasificación Final</h1>
            <p className="final-score">
              {ganadores.length === 0
                ? 'Nadie ha sumado puntos'
                : ganadores.length === 1
                ? <>¡Victoria para {ganadores[0].nombre} con {maximo} puntos!</>
                : <>Empate entre {ganadores.map((g) => g.nombre).join(', ')} con {maximo} puntos</>}
            </p>

            <div className="scoreboard">
              {ranking.map((j, i) => (
                <div key={j.id} className={`score-row${i === 0 && j.puntos > 0 ? ' first' : ''}`}>
                  <span className="score-name">
                    {i === 0 && j.puntos > 0 ? <Icon name="crown" size={22} /> : <span className="pos">{i + 1}</span>}
                    {j.nombre}
                  </span>
                  <span className="score-pts">{j.puntos} pts</span>
                </div>
              ))}
            </div>
          </div>

          <div className="actions">
            <button className="secondary danger full" onClick={() => setModalSalir(true)}>
              <Icon name="door" size={20} /> Salir al menú
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