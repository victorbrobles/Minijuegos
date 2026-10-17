// client/src/games/Aproximacion/AproximacionLocal.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import GameIntro from '../../components/GameIntro.jsx';
import './Aproximacion.css';

const MAX_RONDAS = 15;
const MIN_JUGADORES = 4;
const MAX_JUGADORES = 20;

export default function AproximacionLocal({ onVolver, onExit }) {
  const navigate = useNavigate();

  const [fase, setFase] = useState('setup');
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
  const [rondaActual, setRondaActual] = useState(1);
  const [preguntaActual, setPreguntaActual] = useState(null);

  const [ordenTurnos, setOrdenTurnos] = useState([]);
  const [subTurnoIndex, setSubTurnoIndex] = useState(0);
  const [decisiones, setDecisiones] = useState({});

  const [inputNumero, setInputNumero] = useState('');
  const [confianzaElegida, setConfianzaElegida] = useState(null);
  const [inputRealManual, setInputRealManual] = useState('');
  const [errorInput, setErrorInput] = useState('');

  const [resultadoRonda, setResultadoRonda] = useState(null);

  useEffect(() => {
    fetch('/api/aproximacion/preguntas')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => setPreguntas(data))
      .catch((err) => console.error('Error cargando preguntas:', err));
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

    const puntuaciones = {};
    listaActualizada.forEach((j) => {
      puntuaciones[j.id] = 0;
    });
    setPuntos(puntuaciones);

    setRondaActual(1);
    prepararRonda(1, listaActualizada);
  };

  const prepararRonda = (numRonda, listaJugadores = jugadores) => {
    const preg = preguntas[(numRonda - 1) % preguntas.length] || {
      id: 999,
      pregunta: '¿Cuántos países hay en el mundo?',
      respuesta: 195,
      manual: false
    };
    setPreguntaActual(preg);

    const primerIndex = Math.floor(Math.random() * listaJugadores.length);
    const orden = [];
    for (let i = 0; i < listaJugadores.length; i++) {
      orden.push((primerIndex + i) % listaJugadores.length);
    }

    setOrdenTurnos(orden);
    setSubTurnoIndex(0);
    setDecisiones({});
    setResultadoRonda(null);
    setInputNumero('');
    setConfianzaElegida(null);
    setInputRealManual('');
    setErrorInput('');
    setFase('turno');
  };

  const jugadorActual = jugadores[ordenTurnos[subTurnoIndex]];
  const esPrimerJugador = subTurnoIndex === 0;

  const respuestasDadas = Object.entries(decisiones)
    .filter(([, d]) => d.tipo === 'propia')
    .map(([jId, d]) => ({
      jugadorId: Number(jId),
      jugadorNombre: jugadores.find((j) => j.id === Number(jId))?.nombre,
      valor: d.valor
    }));

  const confirmarTurno = (e) => {
    e.preventDefault();
    setErrorInput('');

    let nuevaDecision = null;

    if (confianzaElegida !== null) {
      const jugadorReferencia = respuestasDadas.find((r) => r.jugadorId === confianzaElegida);
      if (!jugadorReferencia) {
        setErrorInput('Selecciona un jugador válido en el que confiar.');
        return;
      }
      nuevaDecision = {
        tipo: 'confia',
        valor: jugadorReferencia.valor,
        confiaEnId: jugadorReferencia.jugadorId
      };
    } else {
      if (inputNumero === '' || isNaN(Number(inputNumero))) {
        setErrorInput('Introduce un número válido.');
        return;
      }

      const numVal = Math.round(Number(inputNumero));
      const yaExiste = respuestasDadas.some((r) => r.valor === numVal);
      if (yaExiste) {
        setErrorInput(`El número ${numVal} ya ha sido dicho. Debes decir otro número o confiar en él.`);
        return;
      }

      nuevaDecision = {
        tipo: 'propia',
        valor: numVal,
        confiaEnId: null
      };
    }

    const nuevasDecisiones = {
      ...decisiones,
      [jugadorActual.id]: nuevaDecision
    };

    setDecisiones(nuevasDecisiones);
    avanzarSiguienteTurno(nuevasDecisiones);
  };

  const avanzarSiguienteTurno = (nuevasDecisiones) => {
    setInputNumero('');
    setConfianzaElegida(null);
    setErrorInput('');

    if (subTurnoIndex + 1 < ordenTurnos.length) {
      setSubTurnoIndex(subTurnoIndex + 1);
    } else {
      const idPrimerJugador = jugadores[ordenTurnos[0]].id;
      const otrasRespuestas = Object.entries(nuevasDecisiones).filter(
        ([id, d]) => Number(id) !== idPrimerJugador && d.tipo === 'propia'
      );

      if (otrasRespuestas.length === 0) {
        finalizarVueltas(nuevasDecisiones);
      } else {
        setFase('segunda_vuelta_inicial');
      }
    }
  };

  const confirmarSegundaVuelta = (cambiarAId = null) => {
    const idPrimerJugador = jugadores[ordenTurnos[0]].id;
    let decsFinales = { ...decisiones };

    if (cambiarAId !== null) {
      const ref = respuestasDadas.find((r) => r.jugadorId === cambiarAId);
      if (ref) {
        decsFinales[idPrimerJugador] = {
          tipo: 'confia',
          valor: ref.valor,
          confiaEnId: ref.jugadorId
        };
        setDecisiones(decsFinales);
      }
    }

    finalizarVueltas(decsFinales);
  };

  const finalizarVueltas = (decsFinales) => {
    if (preguntaActual.manual) {
      setInputRealManual('');
      setFase('introducir_real');
    } else {
      concluirRonda(decsFinales, preguntaActual.respuesta);
    }
  };

  const confirmarCifraRealManual = (e) => {
    e.preventDefault();
    if (inputRealManual === '' || isNaN(Number(inputRealManual))) {
      setErrorInput('Introduce un número válido.');
      return;
    }

    const valorReal = Math.round(Number(inputRealManual));
    setPreguntaActual((prev) => ({ ...prev, respuesta: valorReal }));
    concluirRonda(decisiones, valorReal);
  };

  const concluirRonda = (decsFinales, objetivoReal) => {
    const objetivo = objetivoReal;
    const scoresRonda = {};
    jugadores.forEach((j) => (scoresRonda[j.id] = 0));

    const respuestasUnicasMap = new Map();

    Object.entries(decsFinales).forEach(([jId, dec]) => {
      if (dec.tipo === 'propia') {
        respuestasUnicasMap.set(dec.valor, {
          autorId: Number(jId),
          valor: dec.valor,
          distancia: Math.abs(dec.valor - objetivo)
        });
      }
    });

    const listaUnicas = Array.from(respuestasUnicasMap.values()).sort(
      (a, b) => a.distancia - b.distancia
    );

    const exactas = listaUnicas.filter((item) => item.distancia === 0);
    const noExactas = listaUnicas.filter((item) => item.distancia > 0);

    exactas.forEach((item) => {
      scoresRonda[item.autorId] += 15;
      Object.entries(decsFinales).forEach(([jId, dec]) => {
        if (Number(jId) !== item.autorId && dec.valor === item.valor) {
          scoresRonda[Number(jId)] += 8;
        }
      });
    });

    if (noExactas.length > 0) {
      const minDist = noExactas[0].distancia;
      const maxDist = noExactas[noExactas.length - 1].distancia;

      const masCercanas = noExactas.filter((item) => item.distancia === minDist);
      masCercanas.forEach((item) => {
        scoresRonda[item.autorId] += 6;
        Object.entries(decsFinales).forEach(([jId, dec]) => {
          if (Number(jId) !== item.autorId && dec.valor === item.valor) {
            scoresRonda[Number(jId)] += 3;
          }
        });
      });

      if (maxDist > minDist) {
        const masLejanas = noExactas.filter((item) => item.distancia === maxDist);
        masLejanas.forEach((item) => {
          scoresRonda[item.autorId] -= 5;
        });

        const intermedias = noExactas.filter(
          (item) => item.distancia > minDist && item.distancia < maxDist
        );

        if (intermedias.length > 0) {
          const mitadIndex = Math.ceil(intermedias.length / 2);
          intermedias.forEach((item, idx) => {
            const esMitadSuperior = idx < mitadIndex;
            const deltaAutor = esMitadSuperior ? 1 : -1;
            scoresRonda[item.autorId] += deltaAutor;
          });
        }
      }
    }

    setPuntos((prev) => {
      const act = { ...prev };
      Object.entries(scoresRonda).forEach(([jId, delta]) => {
        act[jId] = (act[jId] || 0) + delta;
      });
      return act;
    });

    setResultadoRonda({
      scoresRonda,
      listaUnicas,
      objetivo,
      decsFinales
    });

    setFase('resultados');
  };

  const avanzarSiguienteRonda = () => {
    if (rondaActual >= MAX_RONDAS) {
      setFase('final');
    } else {
      const sigRonda = rondaActual + 1;
      setRondaActual(sigRonda);
      prepararRonda(sigRonda);
    }
  };

  const ranking = [...jugadores].sort((a, b) => (puntos[b.id] ?? 0) - (puntos[a.id] ?? 0));
  const maximo = ranking.length ? (puntos[ranking[0].id] ?? 0) : 0;
  const ganadores = maximo > 0 ? ranking.filter((j) => (puntos[j.id] ?? 0) === maximo) : [];

  return (
    <div className="aprox-contenedor">
      {fase === 'setup' && (
        <>
          <button
            type="button"
            className="aprox-btn-ayuda"
            onClick={() => setModalAyuda(true)}
            title="Reglas y sistema de puntuación"
          >
            <span className="aprox-btn-ayuda-signo">?</span>
          </button>

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
                    <li>Un jugador al azar empieza respondiendo con una cifra.</li>
                    <li>Los siguientes jugadores ven las respuestas anteriores y pueden <strong>poner su propio número</strong> o <strong>confiar en el de otro</strong>.</li>
                    <li>Al final de la ronda, el primer jugador tiene una <strong>segunda oportunidad</strong> para mantener su cifra o cambiar y confiar en la de otro.</li>
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
        </>
      )}

      {/* 1. SETUP */}
      {fase === 'setup' && (
        <section className="game">
          <GameIntro gameId="aproximacion" titulo="Aproximación" />

          <div className="panel">
            <div className="hud" style={{ marginBottom: '1rem' }}>
              <button className="btn-back-inline" onClick={onVolver}>
                &larr; Cambiar a modo Online
              </button>
            </div>

            <h3 className="panel-title"><Icon name="users" size={22} /> Jugadores</h3>
            <label className="field-label" htmlFor="num-jugadores-aprox">
              Número de jugadores ({MIN_JUGADORES} a {MAX_JUGADORES})
            </label>
            <select
              id="num-jugadores-aprox"
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
            <Icon name="play" size={24} /> ¡Empezar Partida (15 Rondas)!
          </button>
        </section>
      )}

      {/* 2. TURNO */}
      {fase === 'turno' && preguntaActual && jugadorActual && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="flagFinish" size={18} />Ronda {rondaActual} de {MAX_RONDAS}</span>
            <span className="chip alt"><Icon name="users" size={18} />Jugador {subTurnoIndex + 1} de {jugadores.length}</span>
          </div>

          <div className="starter">
            <Icon name="dice" size={28} />
            <p>Turno de: <strong>{jugadorActual.nombre}</strong></p>
          </div>

          <div className="panel aprox-pregunta-card">
            <span className={`aprox-badge-pregunta ${preguntaActual.manual ? 'personal' : ''}`}>
              {preguntaActual.manual ? 'Pregunta sobre los Jugadores' : 'Pregunta Numérica'}
            </span>
            <h2 className="aprox-pregunta-texto">{preguntaActual.pregunta}</h2>
          </div>

          {!esPrimerJugador && respuestasDadas.length > 0 && (
            <div className="panel aprox-respuestas-previas">
              <h3 className="panel-title"><Icon name="eye" size={20} /> Respuestas dadas hasta ahora</h3>
              <p className="field-label">Puedes confiar en una de estas cifras o introducir tu propio número:</p>

              <div className="aprox-opciones-confianza">
                {respuestasDadas.map((r) => {
                  const quienesConfian = Object.entries(decisiones)
                    .filter(([, d]) => d.tipo === 'confia' && d.confiaEnId === r.jugadorId)
                    .map(([id]) => jugadores.find((j) => j.id === Number(id))?.nombre);

                  const seleccionada = confianzaElegida === r.jugadorId;

                  return (
                    <button
                      key={r.jugadorId}
                      type="button"
                      className={`aprox-btn-opcion-confianza ${seleccionada ? 'activa' : ''}`}
                      onClick={() => {
                        setConfianzaElegida(seleccionada ? null : r.jugadorId);
                        setInputNumero('');
                        setErrorInput('');
                      }}
                    >
                      <div className="aprox-opcion-valor">{r.valor}</div>
                      <div className="aprox-opcion-autor">Dicha por <strong>{r.jugadorNombre}</strong></div>
                      {quienesConfian.length > 0 && (
                        <div className="aprox-opcion-apoyos">
                          Confían: {quienesConfian.join(', ')}
                        </div>
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

          <form onSubmit={confirmarTurno} className="panel aprox-formulario">
            <h3 className="panel-title">
              {esPrimerJugador
                ? `¿Cuál es tu respuesta, ${jugadorActual.nombre}?`
                : confianzaElegida !== null
                ? `Has elegido confiar en ${jugadores.find((j) => j.id === confianzaElegida)?.nombre}`
                : `O escribe tu propio número (sin repetir):`}
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
                  setErrorInput('');
                }}
                required
              />
            )}

            {errorInput && <p className="error" role="alert">{errorInput}</p>}

            <button type="submit" className="big full" style={{ marginTop: '1rem' }}>
              <Icon name="check" size={22} strokeWidth={2.5} />
              {confianzaElegida !== null ? 'Confirmar confianza' : 'Confirmar mi número'}
            </button>
          </form>
        </section>
      )}

      {/* 3. SEGUNDA VUELTA */}
      {fase === 'segunda_vuelta_inicial' && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="flagFinish" size={18} />Ronda {rondaActual}</span>
            <span className="chip alt">Segunda oportunidad</span>
          </div>

          <div className="starter">
            <Icon name="refresh" size={28} />
            <p><strong>{jugadores[ordenTurnos[0]].nombre}</strong>, ¿te quedas con tu número o cambias?</p>
          </div>

          <div className="panel aprox-pregunta-card">
            <h2 className="aprox-pregunta-texto">{preguntaActual.pregunta}</h2>
            <div className="aprox-mi-respuesta-inicial">
              Tu respuesta inicial fue: <strong>{decisiones[jugadores[ordenTurnos[0]].id]?.valor}</strong>
            </div>
          </div>

          <div className="panel aprox-respuestas-previas">
            <h3 className="panel-title">Respuestas del resto de jugadores:</h3>
            <div className="aprox-opciones-confianza">
              {respuestasDadas
                .filter((r) => r.jugadorId !== jugadores[ordenTurnos[0]].id)
                .map((r) => (
                  <button
                    key={r.jugadorId}
                    type="button"
                    className="aprox-btn-opcion-confianza"
                    onClick={() => confirmarSegundaVuelta(r.jugadorId)}
                  >
                    <div className="aprox-opcion-valor">{r.valor}</div>
                    <div className="aprox-opcion-autor">De <strong>{r.jugadorNombre}</strong></div>
                    <span className="aprox-tag-confiar">Cambiar y confiar en esta</span>
                  </button>
                ))}
            </div>
          </div>

          <button className="big full" onClick={() => confirmarSegundaVuelta(null)}>
            <Icon name="check" size={22} /> Mantener mi respuesta ({decisiones[jugadores[ordenTurnos[0]].id]?.valor})
          </button>
        </section>
      )}

      {/* 4. INTRODUCIR REAL */}
      {fase === 'introducir_real' && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="flagFinish" size={18} />Ronda {rondaActual}</span>
            <span className="chip alt">Recuento común</span>
          </div>

          <div className="starter">
            <Icon name="users" size={28} />
            <p>¡Momento del recuento conjunto!</p>
          </div>

          <div className="panel aprox-pregunta-card">
            <span className="aprox-badge-pregunta personal">Pregunta sobre los Jugadores</span>
            <h2 className="aprox-pregunta-texto">{preguntaActual.pregunta}</h2>
            <p className="field-label" style={{ marginTop: '0.8rem' }}>
              Contad y sumad en voz alta entre todos los presentes e introducid el total exacto obtenido:
            </p>
          </div>

          <form onSubmit={confirmarCifraRealManual} className="panel aprox-formulario">
            <h3 className="panel-title">Cifra real total:</h3>
            <input
              type="number"
              step="1"
              autoFocus
              placeholder="Total real tras el recuento..."
              value={inputRealManual}
              onChange={(e) => {
                setInputRealManual(e.target.value);
                setErrorInput('');
              }}
              required
            />
            {errorInput && <p className="error" role="alert">{errorInput}</p>}

            <button type="submit" className="big full" style={{ marginTop: '1rem' }}>
              <Icon name="trophy" size={22} /> Calcular resultados y puntuaciones
            </button>
          </form>
        </section>
      )}

      {/* 5. RESULTADOS */}
      {fase === 'resultados' && resultadoRonda && (
        <section className="game">
          <div className="end-card aprox-resolucion-card">
            <span className="end-icon"><Icon name="trophy" size={44} /></span>
            <p className="categoria">{preguntaActual.pregunta}</p>
            <h1 className="title">Respuesta correcta: <span className="aprox-num-correcto">{resultadoRonda.objetivo}</span></h1>

            <div className="aprox-resolucion-lista">
              {resultadoRonda.listaUnicas.map((item) => {
                const esExacta = item.distancia === 0;
                const esMin = item.distancia === resultadoRonda.listaUnicas[0].distancia && !esExacta;
                const esMax = item.distancia === resultadoRonda.listaUnicas[resultadoRonda.listaUnicas.length - 1].distancia && resultadoRonda.listaUnicas.length > 1 && !esExacta;

                const confiadosNombres = Object.entries(resultadoRonda.decsFinales)
                  .filter(([id, d]) => Number(id) !== item.autorId && d.valor === item.valor)
                  .map(([id]) => jugadores.find((j) => j.id === Number(id))?.nombre);

                const autorNombre = jugadores.find((j) => j.id === item.autorId)?.nombre;

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
                          {resultadoRonda.scoresRonda[item.autorId] >= 0 ? `+${resultadoRonda.scoresRonda[item.autorId]}` : resultadoRonda.scoresRonda[item.autorId]} pts
                        </span>
                      </div>
                      {confiadosNombres.length > 0 && (
                        <div className="aprox-res-confian">
                          Confiaron: {confiadosNombres.map((nom) => {
                            const jId = jugadores.find((j) => j.nombre === nom)?.id;
                            const ptsConf = resultadoRonda.scoresRonda[jId];
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
            <button onClick={avanzarSiguienteRonda}>
              <Icon name="play" size={20} />
              {rondaActual < MAX_RONDAS ? `Siguiente ronda (${rondaActual + 1} de ${MAX_RONDAS})` : 'Ver puntuaciones finales'}
            </button>
            <button className="secondary danger" onClick={() => setFase('final')}>
              <Icon name="flagFinish" size={20} />Finalizar el juego
            </button>
          </div>
        </section>
      )}

      {/* 6. FINAL */}
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
              <Icon name="refresh" size={20} />Nueva partida
            </button>
            <button className="secondary danger" onClick={() => navigate('/')}>
              <Icon name="door" size={20} />Salir al menú principal
            </button>
          </div>
        </section>
      )}
    </div>
  );
}