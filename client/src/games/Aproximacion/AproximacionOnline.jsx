// client/src/games/Aproximacion/AproximacionOnline.jsx
import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../components/Icon.jsx';
import './Aproximacion.css';
import '../Adivina/Adivina.css';

const CLAVE_SESION_APROX = 'aprox_online_session';

export default function AproximacionOnline({ onLocal, onSalir }) {
  const [vista, setVista] = useState('menu'); // 'menu' | 'crear' | 'unirse' | 'sala'
  const [nombre, setNombre] = useState('');
  const [codigoInput, setCodigoInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);

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

  const intervalRef = useRef(null);

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
          setVista('menu');
          setErrorMsg('La sala se ha cerrado.');
        });
    };

    consultarEstado();
    intervalRef.current = setInterval(consultarEstado, 700);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sesion]);

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
    e.preventDefault();
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
    setVista('menu');
  };

  const copiarCodigo = () => {
    if (!sala?.code) return;
    navigator.clipboard?.writeText(sala.code);
    setCodigoCopiado(true);
    setTimeout(() => setCodigoCopiado(false), 2000);
  };

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

  const ranking = sala?.jugadores ? [...sala.jugadores].sort((a, b) => b.puntos - a.puntos) : [];
  const maximo = ranking.length ? ranking[0].puntos : 0;
  const ganadores = maximo > 0 ? ranking.filter((j) => j.puntos === maximo) : [];

  return (
    <div className="aprox-contenedor">
      {/* 1. MENÚ ONLINE */}
      {vista === 'menu' && (
        <section className="game">
          <div className="panel center">
            <span className="lb-luna chica">
              <Icon name="target" size={42} strokeWidth={1.6} />
            </span>
            <h1 className="title">Aproximación Online</h1>
            <p className="hint">
              Calculad cifras asombrosas en tiempo real. Ajusta tu número o confía en la cifra de un rival.
            </p>

            {errorMsg && <p className="error" style={{ margin: '0.8rem 0' }}>{errorMsg}</p>}

            <div className="lb-menu">
              <button className="big full" onClick={() => { setVista('crear'); setErrorMsg(''); }}>
                <Icon name="crown" size={22} /> Crear partida Online
              </button>
              <button className="big full" onClick={() => { setVista('unirse'); setErrorMsg(''); }}>
                <Icon name="users" size={22} /> Unirse con código
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
            <h2 className="title">Crear sala Online</h2>
            <p className="hint">Introduce tu nombre de anfitrión (de 4 a 20 jugadores).</p>

            <div className="lb-form" style={{ marginTop: '1.2rem', textAlign: 'left' }}>
              <input
                type="text"
                placeholder="Tu nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                maxLength={20}
                autoFocus
              />
              <button
                className="big full"
                style={{ marginTop: '1rem' }}
                disabled={cargando || !nombre.trim()}
                onClick={handleCrear}
              >
                Crear sala
              </button>
              <button className="secondary full" style={{ marginTop: '0.6rem' }} onClick={() => setVista('menu')}>
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
            <h2 className="title">Unirse a partida</h2>
            <div className="lb-form" style={{ marginTop: '1.2rem', textAlign: 'left' }}>
              <input
                type="text"
                placeholder="CÓDIGO (4 LETRAS)"
                value={codigoInput}
                onChange={(e) => setCodigoInput(e.target.value.toUpperCase())}
                maxLength={4}
                style={{ textTransform: 'uppercase', letterSpacing: '4px', textAlign: 'center', fontWeight: '800' }}
                autoFocus
              />
              <input
                type="text"
                placeholder="Tu nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                maxLength={20}
                style={{ marginTop: '0.8rem' }}
              />
              <button
                className="big full"
                style={{ marginTop: '1rem' }}
                disabled={cargando || !nombre.trim() || codigoInput.trim().length < 4}
                onClick={handleUnirse}
              >
                Entrar a la sala
              </button>
              <button className="secondary full" style={{ marginTop: '0.6rem' }} onClick={() => setVista('menu')}>
                Volver
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 4. LOBBY */}
      {vista === 'sala' && sala && sala.estado === 'lobby' && (
        <section className="game">
          <div className="panel center">
            <p className="categoria">Código de la partida</p>
            <button type="button" className="qq-codigo-btn" onClick={copiarCodigo}>
              {sala.code}
            </button>
            <p className="hint small">
              {codigoCopiado ? '¡Copiado!' : 'Comparte este código para que se unan (mínimo 4 jugadores).'}
            </p>
          </div>

          <div className="panel" style={{ marginTop: '1rem' }}>
            <h3 className="panel-title"><Icon name="users" size={20} /> Jugadores ({sala.jugadores.length}/20)</h3>
            <div className="lb-lista">
              {sala.jugadores.map((j) => (
                <div key={j.id} className={`lb-jug ${j.id === yoId ? 'yo' : ''}`}>
                  <span className="lb-punto on" />
                  <span className="lb-jug-nombre">{j.nombre}{j.id === yoId ? ' (Tú)' : ''}{j.id === 1 ? ' 👑' : ''}</span>
                </div>
              ))}
            </div>
          </div>

          {errorMsg && <p className="error" style={{ margin: '0.8rem 0' }}>{errorMsg}</p>}

          {esAdmin ? (
            <button
              className="big full"
              style={{ marginTop: '1.2rem' }}
              disabled={sala.jugadores.length < 4}
              onClick={handleIniciarJuego}
            >
              {sala.jugadores.length < 4 ? 'Esperando jugadores (mínimo 4)...' : '¡Empezar Partida (15 Rondas)!'}
            </button>
          ) : (
            <div className="panel center" style={{ marginTop: '1rem' }}>
              <p className="hint">Esperando a que el anfitrión comience la partida...</p>
            </div>
          )}

          <button className="secondary danger full" style={{ marginTop: '1rem' }} onClick={handleSalir}>
            Salir de la sala
          </button>
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

          <button className="secondary danger full" style={{ marginTop: '1rem' }} onClick={handleSalir}>
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
            </div>
          )}

          <button className="secondary danger full" style={{ marginTop: '1rem' }} onClick={handleSalir}>
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

          <button className="secondary danger full" style={{ marginTop: '1rem' }} onClick={handleSalir}>
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
                {sala.rondaNum < sala.maxRondas ? `Siguiente ronda (${sala.rondaNum + 1} de ${sala.maxRondas})` : 'Ver podio final'}
              </button>
              <button className="secondary danger" onClick={handleFinalizar}>
                <Icon name="flagFinish" size={20} /> Finalizar partida
              </button>
            </div>
          ) : (
            <div className="panel center" style={{ marginTop: '1rem' }}>
              <p className="hint">Esperando a que el anfitrión avance a la siguiente ronda...</p>
              <button className="secondary danger full" style={{ marginTop: '0.8rem' }} onClick={handleSalir}>
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
                ? 'Nadie ha conseguido puntos'
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
            <button className="secondary danger full" onClick={handleSalir}>
              <Icon name="door" size={20} /> Salir al menú
            </button>
          </div>
        </section>
      )}
    </div>
  );
}