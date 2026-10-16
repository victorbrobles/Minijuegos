// client/src/games/Popular/Popular.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import GameIntro from '../../components/GameIntro.jsx';
import './Popular.css';

const MIN_JUGADORES = 2;
const MAX_JUGADORES = 12;
const MAX_RONDAS = 15;

const PUNTOS_POR_PUESTO = {
  1: 2,
  2: 4,
  3: 6,
  4: 8,
  5: 10
};

export default function Popular({ onExit }) {
  const navigate = useNavigate();

  // Fases: 'setup' | 'pasar_turno' | 'jugando' | 'resolucion' | 'final'
  const [fase, setFase] = useState('setup');
  const [modalAyuda, setModalAyuda] = useState(false);
  const [modalPistas, setModalPistas] = useState(false);

  // Jugadores y marcadores
  const [numJugadores, setNumJugadores] = useState(4);
  const [jugadores, setJugadores] = useState([
    { id: 1, nombre: 'Jugador 1' },
    { id: 2, nombre: 'Jugador 2' },
    { id: 3, nombre: 'Jugador 3' },
    { id: 4, nombre: 'Jugador 4' }
  ]);
  const [puntos, setPuntos] = useState({});

  // Control de ronda
  const [rondaNum, setRondaNum] = useState(1);
  const [usados, setUsados] = useState([]);
  const [preguntaData, setPreguntaData] = useState(null);

  // Estado del panel de los 5 puestos
  const [acertados, setAcertados] = useState({});
  const [ordenTurnos, setOrdenTurnos] = useState([]);
  const [indiceTurno, setIndiceTurno] = useState(0);

  // Pistas por jugador persistentes en la ronda:
  // { [jugadorId]: { [puesto]: { longitud?: string, letras?: string } } }
  const [pistasJugadores, setPistasJugadores] = useState({});

  // Input y feedback
  const [inputTexto, setInputTexto] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [solucionFinal, setSolucionFinal] = useState(null);

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
    listaActualizada.forEach((j) => { scores[j.id] = 0; });
    setPuntos(scores);

    setRondaNum(1);
    setUsados([]);
    cargarNuevaRonda(1, [], listaActualizada);
  };

  const cargarNuevaRonda = async (numRonda, listaUsados = usados, listaJug = jugadores) => {
    try {
      const res = await fetch('/api/popular/ronda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usados: listaUsados })
      });
      const data = await res.json();

      if (data.success) {
        setPreguntaData(data);
        setUsados([...listaUsados, data.id]);
        setAcertados({});
        setPistasJugadores({});
        setInputTexto('');
        setFeedback(null);
        setSolucionFinal(null);
        setModalPistas(false);

        const ids = listaJug.map((j) => j.id);
        const primerIdx = Math.floor(Math.random() * ids.length);
        const orden = [];
        for (let i = 0; i < ids.length; i++) {
          orden.push(ids[(primerIdx + i) % ids.length]);
        }
        setOrdenTurnos(orden);
        setIndiceTurno(0);
        setFase('pasar_turno');
      }
    } catch {
      alert('Error al cargar la ronda desde el servidor.');
    }
  };

  const jugadorActivoId = ordenTurnos[indiceTurno];
  const jugadorActivo = jugadores.find((j) => j.id === jugadorActivoId);

  const avanzarTurno = () => {
    setInputTexto('');
    setFeedback(null);
    setIndiceTurno((prev) => (prev + 1) % ordenTurnos.length);
    setFase('pasar_turno');
  };

  // Pedir pista (-1 pt para el jugador activo)
  const pedirPista = async (puesto, tipo) => {
    if (!jugadorActivo || !preguntaData) return;

    try {
      const res = await fetch('/api/popular/pista', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: preguntaData.id,
          puesto,
          tipo
        })
      });
      const data = await res.json();

      if (data.success) {
        setPuntos((prev) => ({
          ...prev,
          [jugadorActivo.id]: (prev[jugadorActivo.id] || 0) - 1
        }));

        setPistasJugadores((prev) => {
          const userPistas = { ...(prev[jugadorActivo.id] || {}) };
          const puestoPistas = { ...(userPistas[puesto] || {}) };
          puestoPistas[tipo] = data.esqueleto;
          userPistas[puesto] = puestoPistas;
          return { ...prev, [jugadorActivo.id]: userPistas };
        });

        setModalPistas(false);
      }
    } catch {
      alert('Error al solicitar la pista.');
    }
  };

  const enviarRespuesta = async (e) => {
    e.preventDefault();
    if (!inputTexto.trim() || !preguntaData) return;

    try {
      const puestosDescubiertos = Object.keys(acertados).map(Number);
      const res = await fetch('/api/popular/validar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: preguntaData.id,
          respuesta: inputTexto,
          acertados: puestosDescubiertos
        })
      });
      const data = await res.json();

      if (data.acierto) {
        setPuntos((prev) => ({
          ...prev,
          [jugadorActivo.id]: (prev[jugadorActivo.id] || 0) + data.puntos
        }));

        const nuevosAcertados = {
          ...acertados,
          [data.puesto]: {
            texto: data.texto,
            puntos: data.puntos,
            jugador: jugadorActivo.nombre
          }
        };
        setAcertados(nuevosAcertados);

        setFeedback({
          tipo: 'acierto',
          msg: `¡Acierto! Has encontrado el Top ${data.puesto}: «${data.texto}» (+${data.puntos} pts)`
        });
        setInputTexto('');

        if (Object.keys(nuevosAcertados).length === 5) {
          setTimeout(() => {
            terminarRonda('todos_acertados');
          }, 1400);
        } else {
          setTimeout(() => {
            setFeedback(null);
            avanzarTurno();
          }, 1400);
        }
      } else {
        setFeedback({
          tipo: 'fallo',
          msg: `«${inputTexto}» no está entre los 5 más populares. Pierdes el turno.`
        });
        setInputTexto('');

        setTimeout(() => {
          setFeedback(null);
          avanzarTurno();
        }, 1400);
      }
    } catch {
      alert('Error validando respuesta.');
    }
  };

  const rendirseRonda = async () => {
    terminarRonda('rendicion');
  };

  const terminarRonda = async (motivo) => {
    try {
      const res = await fetch('/api/popular/solucion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: preguntaData.id })
      });
      const data = await res.json();

      if (data.success) {
        setSolucionFinal(data.respuestas);
        setFeedback(null);
        setModalPistas(false);
        setFase('resolucion');
      }
    } catch {
      setFase('resolucion');
    }
  };

  const siguienteRonda = () => {
    if (rondaNum >= MAX_RONDAS) {
      setFase('final');
    } else {
      const sig = rondaNum + 1;
      setRondaNum(sig);
      cargarNuevaRonda(sig);
    }
  };

  const ranking = [...jugadores].sort((a, b) => (puntos[b.id] ?? 0) - (puntos[a.id] ?? 0));
  const maximo = ranking.length ? (puntos[ranking[0].id] ?? 0) : 0;
  const ganadores = maximo > 0 ? ranking.filter((j) => (puntos[j.id] ?? 0) === maximo) : [];

  const misPistas = (jugadorActivo && pistasJugadores[jugadorActivo.id]) || {};

  return (
    <div className="pop-contenedor">
      {/* AYUDA */}
      {fase === 'setup' && (
        <>
          <button
            type="button"
            className="aprox-btn-ayuda"
            onClick={() => setModalAyuda(true)}
            title="Reglas del juego"
          >
            <span className="aprox-btn-ayuda-signo">?</span>
          </button>

          {modalAyuda && (
            <div className="rg-modal-fondo" onClick={() => setModalAyuda(false)}>
              <div className="rg-modal aprox-modal-ayuda" onClick={(e) => e.stopPropagation()}>
                <div className="aprox-modal-header">
                  <h3>¿Cómo se juega a Sigue la moda?</h3>
                </div>

                <div className="aprox-modal-cuerpo">
                  <p><strong>1. Dinámica del juego:</strong></p>
                  <ul>
                    <li>Adivina <strong>las 5 respuestas más populares</strong> de la categoría propuesta.</li>
                    <li>Por turnos y pasándose el teléfono, cada jugador escribe una respuesta.</li>
                    <li>Puedes <strong>pasar turno</strong> en cualquier momento si no sabes qué responder.</li>
                    <li>Si aciertas, sumas los puntos de ese puesto y el turno pasa al siguiente. Si fallas, pierdes el turno.</li>
                  </ul>

                  <p><strong>2. Puntuación de los puestos:</strong></p>
                  <div className="aprox-tabla-puntos">
                    <div className="aprox-puntos-fila acierto">
                      <span>🥇 Top 1</span>
                      <strong>+2 puntos</strong>
                    </div>
                    <div className="aprox-puntos-fila acierto" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
                      <span>🥈 Top 2</span>
                      <strong>+4 puntos</strong>
                    </div>
                    <div className="aprox-puntos-fila intermedia" style={{ background: '#fef3c7', color: '#92400e' }}>
                      <span>🥉 Top 3</span>
                      <strong>+6 puntos</strong>
                    </div>
                    <div className="aprox-puntos-fila acierto" style={{ background: '#ede9fe', color: '#5b21b6' }}>
                      <span>🏅 Top 4</span>
                      <strong>+8 puntos</strong>
                    </div>
                    <div className="aprox-puntos-fila acierto" style={{ background: '#fdf2f8', color: '#be185d' }}>
                      <span>🏆 Top 5 (El más difícil)</span>
                      <strong>+10 puntos</strong>
                    </div>
                  </div>

                  <p><strong>3. Sistema de pistas (-1 punto cada una):</strong></p>
                  <ul>
                    <li><strong>1.ª Pista: Estructura de letras (_ _ _ / _ _ _)</strong>: Muestra el número de letras y separa claramente las palabras (-1 pt).</li>
                    <li><strong>2.ª Pista: Revelar 20% de letras</strong>: Solo se puede pedir tras haber solicitado la primera pista de ese puesto (-1 pt).</li>
                    <li>Las pistas quedan grabadas <strong>solo para el jugador que las pidió</strong> durante toda la ronda.</li>
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
          <GameIntro gameId="popular" titulo="Sigue la moda" />

          <div className="panel">
            <h3 className="panel-title"><Icon name="users" size={22} /> Participantes</h3>
            <label className="field-label" htmlFor="num-jugadores-pop">
              Número de jugadores ({MIN_JUGADORES} a {MAX_JUGADORES})
            </label>
            <select
              id="num-jugadores-pop"
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

      {/* 2. PASAR TURNO */}
      {fase === 'pasar_turno' && jugadorActivo && (
        <section className="game center">
          <div className="panel aprox-pregunta-card" style={{ padding: '3rem 1.5rem' }}>
            <span className="chip alt">Ronda {rondaNum} · Turno en juego</span>
            <h1 style={{ fontSize: '2.4rem', fontWeight: '900', color: '#4f46e5', margin: '0.5rem 0 1rem' }}>
              ¡Turno de {jugadorActivo.nombre}!
            </h1>
            <p className="hint" style={{ fontSize: '1.05rem', marginBottom: '1.5rem' }}>
              Pasad el teléfono a <strong>{jugadorActivo.nombre}</strong> para responder.
            </p>
            <button className="big full" onClick={() => setFase('jugando')}>
              <Icon name="check" size={22} strokeWidth={2.5} /> Soy {jugadorActivo.nombre}, ¡estoy listo!
            </button>
          </div>
        </section>
      )}

      {/* 3. JUGANDO */}
      {fase === 'jugando' && preguntaData && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="flagFinish" size={18} />Ronda {rondaNum}</span>
            <span className="chip alt">
              {Object.keys(acertados).length} / 5 descubiertos
            </span>
          </div>

          {/* Marcador superior */}
          <div className="scoreboard-container" style={{ justifyContent: 'center', marginBottom: '0.8rem' }}>
            {jugadores.map((j) => (
              <div
                key={j.id}
                className="score-pill"
                style={{ borderColor: j.id === jugadorActivo?.id ? '#4f46e5' : undefined }}
              >
                <span>{j.nombre}: <strong>{puntos[j.id] ?? 0} pts</strong></span>
                {j.id === jugadorActivo?.id && <span style={{ marginLeft: '4px' }}>👉</span>}
              </div>
            ))}
          </div>

          {/* Pregunta o categoría */}
          <div className="pop-pregunta-card">
            <span className="badge" style={{ background: '#ede9fe', color: '#6d28d9' }}>
              Lo más popular
            </span>
            <h2 className="pop-pregunta-titulo">«{preguntaData.pregunta}»</h2>
          </div>

          {/* Los 5 puestos con soporte de palabras separadas */}
          <div className="pop-slots-lista">
            {[1, 2, 3, 4, 5].map((puesto) => {
              const descubierto = acertados[puesto];
              const pistaPuesto = misPistas[puesto];
              const esqueletoVisible = pistaPuesto?.letras || pistaPuesto?.longitud;

              return (
                <div key={puesto} className={`pop-slot-item ${descubierto ? 'revelado' : ''}`}>
                  <div className="pop-slot-posicion">
                    <span className="pop-puesto-badge">#{puesto}</span>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      {descubierto ? (
                        <span className="pop-slot-texto">{descubierto.texto}</span>
                      ) : (
                        <>
                          <span className="pop-slot-incognita">¿ ?</span>
                          {esqueletoVisible && (
                            <div className="pop-pista-ahorcado-container">
                              {esqueletoVisible.split('   /   ').map((palabra, pIdx) => (
                                <span key={pIdx} className="pop-palabra-bloque">
                                  {palabra}
                                </span>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <span className="pop-puntos-tag">+{PUNTOS_POR_PUESTO[puesto]} pts</span>
                </div>
              );
            })}
          </div>

          {/* Feedback */}
          {feedback && (
            <div className={`pop-banner-feedback ${feedback.tipo}`}>
              {feedback.msg}
            </div>
          )}

          {/* Formulario de entrada */}
          <form onSubmit={enviarRespuesta} className="pop-formulario-box">
            <p className="field-label" style={{ textAlign: 'center', marginBottom: '0.6rem' }}>
              Escribe una respuesta para cualquier puesto:
            </p>
            <input
              type="text"
              autoFocus
              className="pop-input-grande"
              placeholder="Escribe lo que diría la gente..."
              value={inputTexto}
              onChange={(e) => setInputTexto(e.target.value)}
              disabled={feedback !== null}
            />

            <div className="pop-form-actions-row">
              <button
                type="submit"
                className="big btn-validar-flex"
                disabled={!inputTexto.trim() || feedback !== null}
              >
                <Icon name="check" size={20} /> Validar respuesta
              </button>

              <button
                type="button"
                className="btn-pedir-pista"
                onClick={() => setModalPistas(true)}
                disabled={feedback !== null}
              >
                💡 Pedir pista (-1 pt)
              </button>

              <button
                type="button"
                className="btn-pasar-turno"
                onClick={avanzarTurno}
                disabled={feedback !== null}
                title="Ceder el turno al siguiente jugador sin penalización"
              >
                Pasar turno ➔
              </button>
            </div>
          </form>

          <div className="actions">
            <button className="secondary danger full" onClick={rendirseRonda}>
              <Icon name="flag" size={18} /> Rendirse y ver los 5 puestos
            </button>
          </div>

          {/* MODAL PARA PEDIR PISTAS */}
          {modalPistas && (
            <div className="rg-modal-fondo" onClick={() => setModalPistas(false)}>
              <div className="rg-modal pop-modal-pistas" onClick={(e) => e.stopPropagation()}>
                <div className="modal-ayuda-header">
                  <h3>Pedir pista para un puesto (-1 punto)</h3>
                </div>
                <p className="hint small" style={{ margin: '0.4rem 0 1rem', textAlign: 'center' }}>
                  Elige sobre qué puesto quieres la pista. Se aplicará a tu pantalla durante toda la ronda:
                </p>

                <div className="pop-pistas-selector-grid">
                  {[1, 2, 3, 4, 5].map((puesto) => {
                    const yaDescubierto = Boolean(acertados[puesto]);
                    const yaTieneLongitud = Boolean(misPistas[puesto]?.longitud);
                    const yaTieneLetras = Boolean(misPistas[puesto]?.letras);

                    return (
                      <div key={puesto} className={`pop-pista-row-card ${yaDescubierto ? 'bloqueado' : ''}`}>
                        <div className="pop-pista-info-puesto">
                          <span className="pop-puesto-badge">#{puesto}</span>
                          <strong>{yaDescubierto ? '¡Ya descubierto!' : `Top ${puesto} (+${PUNTOS_POR_PUESTO[puesto]} pts)`}</strong>
                        </div>

                        {!yaDescubierto && (
                          <div className="pop-pista-botones-accion">
                            <button
                              type="button"
                              className="btn-subpista"
                              disabled={yaTieneLongitud}
                              onClick={() => pedirPista(puesto, 'longitud')}
                            >
                              {yaTieneLongitud ? '✓ N.º letras pedidas' : '📏 N.º letras (-1 pt)'}
                            </button>

                            {/* La pista de revelar letras solo se habilita si ya se pidió la de longitud */}
                            <button
                              type="button"
                              className="btn-subpista"
                              disabled={!yaTieneLongitud || yaTieneLetras}
                              title={!yaTieneLongitud ? 'Debes pedir primero el número de letras' : ''}
                              onClick={() => pedirPista(puesto, 'letras')}
                            >
                              {yaTieneLetras
                                ? '✓ 20% revelado'
                                : !yaTieneLongitud
                                ? '🔒 Revelar 20% (Pide 1.º letras)'
                                : '🔤 Revelar 20% (-1 pt)'}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="rg-modal-acciones" style={{ marginTop: '1.2rem' }}>
                  <button className="secondary full" onClick={() => setModalPistas(false)}>
                    Cerrar sin pedir pista
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* 4. RESOLUCIÓN DE LA RONDA */}
      {fase === 'resolucion' && preguntaData && solucionFinal && (
        <section className="game">
          <div className="end-card aprox-resolucion-card">
            <span className="end-icon"><Icon name="trophy" size={44} /></span>
            <p className="categoria">Ronda {rondaNum} completada</p>
            <h1 className="title">Los 5 más populares</h1>
            <p className="reveal" style={{ fontSize: '1.25rem', margin: '0.4rem 0 1.2rem' }}>
              «{preguntaData.pregunta}»
            </p>

            <div className="pop-slots-lista" style={{ width: '100%' }}>
              {solucionFinal.map((resp) => {
                const acertador = acertados[resp.puesto];
                return (
                  <div
                    key={resp.puesto}
                    className={`pop-slot-item ${acertador ? 'revelado' : 'solucion-perdida'}`}
                  >
                    <div className="pop-slot-posicion">
                      <span className="pop-puesto-badge">#{resp.puesto}</span>
                      <span className="pop-slot-texto">
                        {resp.texto} {acertador && <em style={{ fontSize: '0.85rem', color: '#15803d' }}>({acertador.jugador})</em>}
                      </span>
                    </div>
                    <span className="pop-puntos-tag">+{resp.puntos} pts</span>
                  </div>
                );
              })}
            </div>

            <div className="scoreboard" style={{ width: '100%', marginTop: '1.2rem' }}>
              <h3 className="section-title" style={{ margin: '0 0 0.8rem', textAlign: 'center' }}>
                Clasificación general
              </h3>
              {ranking.map((j, i) => {
                const pts = puntos[j.id] ?? 0;
                const lider = maximo > 0 && pts === maximo;
                return (
                  <div key={j.id} className={`score-row ${lider ? 'first' : ''}`}>
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
            {rondaNum < MAX_RONDAS ? (
              <button className="big full" onClick={siguienteRonda}>
                <Icon name="play" size={20} /> Siguiente ronda ({rondaNum + 1})
              </button>
            ) : (
              <button className="big full" onClick={() => setFase('final')}>
                <Icon name="trophy" size={20} /> Ver podio final
              </button>
            )}
            <button className="secondary danger full" onClick={() => setFase('final')}>
              <Icon name="flagFinish" size={20} /> Finalizar partida
            </button>
          </div>
        </section>
      )}

      {/* 5. PODIO FINAL */}
      {fase === 'final' && (
        <section className="game">
          <div className="end-card">
            <span className="end-icon"><Icon name="crown" size={48} /></span>
            <h1 className="title">Puntuaciones Finales</h1>
            <p className="final-score">
              {ganadores.length === 0
                ? 'Nadie ha conseguido puntos'
                : ganadores.length === 1
                ? <>¡Victoria para {ganadores[0].nombre} con {maximo} puntos!</>
                : <>Empate entre {ganadores.map((g) => g.nombre).join(', ')} con {maximo} puntos</>}
            </p>

            <div className="scoreboard">
              {ranking.map((j, i) => {
                const lider = maximo > 0 && j.puntos === maximo;
                return (
                  <div key={j.id} className={`score-row ${lider ? 'first' : ''}`}>
                    <span className="score-name">
                      {lider ? <Icon name="crown" size={22} /> : <span className="pos">{i + 1}</span>}
                      {j.nombre}
                    </span>
                    <span className="score-pts">{j.puntos} pts</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="actions">
            <button onClick={() => setFase('setup')}>
              <Icon name="refresh" size={20} /> Nueva partida
            </button>
            <button className="secondary danger" onClick={() => (onExit ? onExit() : navigate('/'))}>
              <Icon name="door" size={20} /> Salir al menú principal
            </button>
          </div>
        </section>
      )}
    </div>
  );
}