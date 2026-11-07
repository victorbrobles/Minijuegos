// client/src/games/Popular/PopularLocal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import './Popular.css';
import { SelectorJugadores } from '../../components/MenuJuego.jsx';

const MIN_JUGADORES = 2;
const MAX_JUGADORES = 12;
const MAX_RONDAS = 15;
const TIEMPO_TURNO = 45;

const PUNTOS_POR_PUESTO = {
  1: 2,
  2: 4,
  3: 6,
  4: 8,
  5: 10
};

const COLORES_JUGADOR = ['#3b82f6', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4', '#f97316', '#84cc16', '#6366f1'];
const colorJugador = (id) => COLORES_JUGADOR[(Number(id) - 1 + COLORES_JUGADOR.length * 10) % COLORES_JUGADOR.length];
const inicial = (n = '?') => n.trim().charAt(0).toUpperCase() || '?';

export default function PopularLocal({ onVolver, onExit }) {
  const navigate = useNavigate();

  const [fase, setFase] = useState('setup'); // 'setup' | 'pasar_turno' | 'jugando' | 'resolucion' | 'final'
  const [modalAyuda, setModalAyuda] = useState(false);
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
  const [usados, setUsados] = useState([]);
  const [preguntaData, setPreguntaData] = useState(null);

  const [acertados, setAcertados] = useState({});
  const [ordenTurnos, setOrdenTurnos] = useState([]);
  const [indiceTurno, setIndiceTurno] = useState(0);

  const [pistasJugadores, setPistasJugadores] = useState({});

  const [inputTexto, setInputTexto] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [solucionFinal, setSolucionFinal] = useState(null);

  const [tiempoRestante, setTiempoRestante] = useState(TIEMPO_TURNO);
  const timerRef = useRef(null);

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

  const avanzarTurnoRef = useRef();
  useEffect(() => {
    avanzarTurnoRef.current = avanzarTurno;
  });

  // Temporizador de 45 segundos
  useEffect(() => {
    if (fase !== 'jugando' || feedback !== null) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    setTiempoRestante(TIEMPO_TURNO);
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          if (avanzarTurnoRef.current) avanzarTurnoRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fase, indiceTurno, feedback]);

  // Pide automáticamente la siguiente pista disponible para ese puesto (1.º longitud, 2.º letras)
  const pedirSiguientePistaPuesto = async (puesto) => {
    if (!jugadorActivo || !preguntaData || feedback !== null) return;
    const actual = pistasJugadores[jugadorActivo.id]?.[puesto] || {};
    const tipo = !actual.longitud ? 'longitud' : !actual.letras ? 'letras' : null;
    if (!tipo) return;

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
      }
    } catch {
      alert('Error al solicitar la pista.');
    }
  };

  const enviarRespuesta = async (e) => {
    e.preventDefault();
    if (!inputTexto.trim() || !preguntaData || feedback !== null) return;

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
        setInputTexto('');

        if (Object.keys(nuevosAcertados).length >= 5) {
          // Pasa directamente a la pantalla de fin de ronda con soluciones y puntuaciones
          terminarRonda();
        } else {
          setFeedback({
            tipo: 'acierto',
            msg: `🎉 ¡Acierto! Top #${data.puesto}: «${data.texto}» (+${data.puntos} pts)`
          });

          setTimeout(() => {
            setFeedback(null);
            avanzarTurno();
          }, 1400);
        }
      } else {
        setFeedback({
          tipo: 'fallo',
          msg: `❌ «${inputTexto}» no está en el Top 5. Turno para el siguiente jugador.`
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

  const terminarRonda = async () => {
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
  const enPartidaActiva = fase === 'pasar_turno' || fase === 'jugando' || fase === 'resolucion';

  const cabeceraHero = (
    <header className="popp-hero">
      <span className="popp-hero-deco" aria-hidden="true">
        <Icon name="trophy" size={140} strokeWidth={1.3} />
      </span>
      <div className="popp-hero-top">
        <button type="button" className="popp-salir" onClick={() => setModalSalirPortada(true)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span>Portada</span>
        </button>
        <div className="popp-hero-chips">
          <span className="popp-chip"><Icon name="flagFinish" size={14} /> Ronda {rondaNum}</span>
          <span className="popp-chip">{Object.keys(acertados).length} / 5 descubiertos</span>
        </div>
      </div>

      <ol className="popp-marcador" aria-label="Jugadores">
        {jugadores.map((j) => {
          const activo = j.id === jugadorActivo?.id && fase !== 'resolucion';
          return (
            <li
              key={j.id}
              className={`popp-jugador${activo ? ' activo' : ''}`}
              style={{ '--c': colorJugador(j.id) }}
            >
              <span className="popp-jugador-avatar">{inicial(j.nombre)}</span>
              <span className="popp-jugador-datos">
                <span className="popp-jugador-nombre">{j.nombre}</span>
                <strong className="popp-jugador-pts">{puntos[j.id] ?? 0} pts</strong>
              </span>
            </li>
          );
        })}
      </ol>
    </header>
  );

  return (
    <div className={`pop-contenedor ${enPartidaActiva ? 'qq-en-partida' : ''}`}>
      {/* MODAL DE AYUDA */}
      {modalAyuda && (
        <div className="rg-modal-fondo" onClick={() => setModalAyuda(false)}>
          <div className="rg-modal popp-modal-ayuda" onClick={(e) => e.stopPropagation()}>
            <div className="popp-modal-ayuda-header">
              <span className="popp-ayuda-badge">❓ Cómo jugar</span>
              <h3>Sigue la moda</h3>
            </div>

            <div className="popp-modal-ayuda-body">
              <p>Adivina <strong>las 5 respuestas más habituales</strong> que da la gente a cada situación cotidiana.</p>
              <ul>
                <li><strong>Por turnos (45 s):</strong> Escribe cualquier idea que creas que está en el Top 5. No hace falta decir la frase exacta: basta con la palabra clave o un sinónimo claro.</li>
                <li><strong>Pistas en cada puesto (-1 pt):</strong> En cualquier fila oculta puedes pulsar el botón <strong>💡 Pista</strong> situado en ese mismo puesto para ver sus huecos de letras, y pulsarlo otra vez para revelar letras.</li>
                <li><strong>Puntos crecientes:</strong> Top #1 (+2 pts), Top #2 (+4 pts), Top #3 (+6 pts), Top #4 (+8 pts) y Top #5 (+10 pts).</li>
              </ul>
            </div>

            <button type="button" className="popp-boton" onClick={() => setModalAyuda(false)}>
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
          onEmpezar={iniciarPartida}
          textoBoton="¡Empezar Partida!"
          iconoBoton="play"
        />
      )}

      {/* 2. PASAR TURNO */}
      {fase === 'pasar_turno' && jugadorActivo && (
        <section className="game popp-escena">
          {cabeceraHero}
          <div className="popp-tarjeta popp-listo">
            <span className="popp-listo-avatar" style={{ '--c': colorJugador(jugadorActivo.id) }}>
              {inicial(jugadorActivo.nombre)}
            </span>
            <p className="popp-etiqueta">Pasa el móvil a</p>
            <h2 className="popp-listo-nombre">{jugadorActivo.nombre}</h2>
            <p className="popp-texto">
              Tendrás <strong>{TIEMPO_TURNO} segundos</strong> para intentar adivinar una de las 5 respuestas más populares o pedir pista en el puesto que prefieras.
            </p>
          </div>

          <div className="popp-barra">
            <button type="button" className="popp-boton grande" onClick={() => setFase('jugando')}>
              <Icon name="play" size={22} /> Soy {jugadorActivo.nombre}, ¡listo!
            </button>
          </div>
        </section>
      )}

      {/* 3. JUGANDO */}
      {fase === 'jugando' && preguntaData && (
        <section className="game popp-escena">
          {cabeceraHero}

          {/* Barra de tiempo */}
          <div className={`popp-tiempo ${tiempoRestante <= 10 ? 'critico' : ''}`} role="timer">
            <div className="popp-tiempo-barra">
              <span style={{ width: `${(tiempoRestante / TIEMPO_TURNO) * 100}%` }} />
            </div>
            <span className="popp-tiempo-num">
              <Icon name="clock" size={15} /> {tiempoRestante}s
            </span>
          </div>

          {/* Tarjeta de la pregunta */}
          <div className="popp-tarjeta popp-pregunta-box">
            <span className="popp-badge-tema">Top 5 más popular</span>
            <h2 className="popp-pregunta-titulo">«{preguntaData.pregunta}»</h2>
          </div>

          {feedback && (
            <div className={`popp-feedback ${feedback.tipo}`} role="status">
              {feedback.msg}
            </div>
          )}

          {/* Lista de los 5 puestos con botón de pista integrado en cada puesto */}
          <div className="popp-slots-lista">
            {[1, 2, 3, 4, 5].map((puesto) => {
              const descubierto = acertados[puesto];
              const pistaPuesto = misPistas[puesto];
              const tieneLongitud = Boolean(pistaPuesto?.longitud);
              const tieneLetras = Boolean(pistaPuesto?.letras);
              const esqueletoVisible = pistaPuesto?.letras || pistaPuesto?.longitud;

              return (
                <div key={puesto} className={`popp-slot-card ${descubierto ? 'revelado' : ''}`}>
                  <div className="popp-slot-main">
                    <span className={`popp-puesto-num p-${puesto}`}>#{puesto}</span>

                    <div className="popp-slot-contenido">
                      {descubierto ? (
                        <>
                          <span className="popp-slot-texto">{descubierto.texto}</span>
                          <span className="popp-slot-autor">Acertado por {descubierto.jugador}</span>
                        </>
                      ) : esqueletoVisible ? (
                        <div className="popp-ahorcado-wrap">
                          {esqueletoVisible.split('   /   ').map((palabra, pIdx) => (
                            <span key={pIdx} className="popp-palabra-chip">
                              {palabra}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="popp-slot-incognita">Respuesta oculta</span>
                      )}
                    </div>
                  </div>

                  <div className="popp-slot-derecha">
                    {!descubierto && !tieneLetras && (
                      <button
                        type="button"
                        className={`popp-btn-pista-slot ${tieneLongitud ? 'fase2' : ''}`}
                        onClick={() => pedirSiguientePistaPuesto(puesto)}
                        disabled={feedback !== null}
                        title={
                          !tieneLongitud
                            ? `Ver huecos de letras del Top #${puesto} (-1 pt)`
                            : `Revelar letras del Top #${puesto} (-1 pt)`
                        }
                      >
                        <span>{!tieneLongitud ? '💡 Pista' : '🔤 +Letras'}</span>
                        <small>-1 pt</small>
                      </button>
                    )}
                    <span className="popp-puntos-badge">+{PUNTOS_POR_PUESTO[puesto]} pts</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Formulario limpio en la parte inferior */}
          <form onSubmit={enviarRespuesta} className="popp-tarjeta popp-form-card">
            <label className="popp-etiqueta" htmlFor="popp-input-local">
              Tu respuesta para cualquier puesto del Top 5
            </label>
            <input
              id="popp-input-local"
              type="text"
              autoFocus
              className="popp-input"
              placeholder="Escribe una palabra clave o respuesta…"
              value={inputTexto}
              onChange={(e) => setInputTexto(e.target.value)}
              disabled={feedback !== null}
              autoComplete="off"
            />

            <div className="popp-fila-botones">
              <button
                type="button"
                className="popp-boton secundario"
                onClick={avanzarTurno}
                disabled={feedback !== null}
              >
                Pasar turno
              </button>
              <button
                type="submit"
                className="popp-boton"
                disabled={!inputTexto.trim() || feedback !== null}
              >
                <Icon name="check" size={20} /> Comprobar
              </button>
            </div>
          </form>

          <div className="popp-pie-acciones">
            <button type="button" className="popp-enlace peligro" onClick={terminarRonda}>
              <Icon name="flagFinish" size={16} /> Rendirse y resolver los 5 puestos
            </button>
          </div>
        </section>
      )}

      {/* 4. RESOLUCIÓN DE LA RONDA */}
      {fase === 'resolucion' && preguntaData && solucionFinal && (
        <section className="game popp-escena">
          {cabeceraHero}

          <div className="popp-tarjeta">
            <p className="popp-etiqueta">Soluciones · Ronda {rondaNum}</p>
            <h3 className="popp-pregunta-resumen">«{preguntaData.pregunta}»</h3>

            <div className="popp-slots-lista" style={{ marginTop: '0.8rem' }}>
              {solucionFinal.map((resp) => {
                const acertador = acertados[resp.puesto];
                return (
                  <div
                    key={resp.puesto}
                    className={`popp-slot-card ${acertador ? 'revelado' : 'no-acertado'}`}
                  >
                    <div className="popp-slot-main">
                      <span className={`popp-puesto-num p-${resp.puesto}`}>#{resp.puesto}</span>
                      <div className="popp-slot-contenido">
                        <span className="popp-slot-texto">{resp.texto}</span>
                        <span className="popp-slot-autor">
                          {acertador ? `🎉 Acertado por ${acertador.jugador}` : 'Sin descubrir'}
                        </span>
                      </div>
                    </div>
                    <span className="popp-puntos-badge">+{resp.puntos} pts</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="popp-tarjeta">
            <p className="popp-etiqueta">Clasificación general</p>
            <ol className="popp-ranking">
              {ranking.map((j, i) => {
                const pts = puntos[j.id] ?? 0;
                const lider = maximo > 0 && pts === maximo;
                return (
                  <li key={j.id} className={lider ? 'lider' : ''} style={{ '--c': colorJugador(j.id) }}>
                    <span className="popp-ranking-pos">{lider ? <Icon name="crown" size={18} /> : i + 1}</span>
                    <span className="popp-jugador-avatar">{inicial(j.nombre)}</span>
                    <span className="popp-ranking-nombre">{j.nombre}</span>
                    <strong>{pts} pts</strong>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="popp-barra estatica">
            {rondaNum < MAX_RONDAS ? (
              <button type="button" className="popp-boton grande" onClick={siguienteRonda}>
                <Icon name="play" size={20} /> Siguiente ronda ({rondaNum + 1})
              </button>
            ) : (
              <button type="button" className="popp-boton grande" onClick={() => setFase('final')}>
                <Icon name="trophy" size={20} /> Ver podio final
              </button>
            )}
            <button type="button" className="popp-enlace" onClick={() => setFase('final')}>
              <Icon name="flagFinish" size={16} /> Finalizar partida
            </button>
          </div>
        </section>
      )}

      {/* 5. PODIO FINAL */}
      {fase === 'final' && (
        <section className="game popp-escena">
          <div className="end-card">
            <span className="end-icon"><Icon name="crown" size={48} /></span>
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

          <div className="popp-barra estatica">
            <button type="button" className="popp-boton grande" onClick={() => setFase('setup')}>
              <Icon name="refresh" size={20} /> Nueva partida
            </button>
            <button type="button" className="popp-boton secundario" onClick={handleSalirAPortada}>
              <Icon name="door" size={20} /> Volver a la portada
            </button>
          </div>
        </section>
      )}

      {/* MODAL SALIR A PORTADA */}
      {modalSalirPortada && (
        <div className="rg-modal-fondo" onClick={() => setModalSalirPortada(false)}>
          <div className="rg-modal popp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="popp-modal-icono">🚪</div>
            <h3>¿Salir a la portada?</h3>
            <p className="hint">Se cancelará la partida actual y volverás a la portada principal.</p>
            <div className="popp-fila-botones">
              <button type="button" className="popp-boton secundario" onClick={() => setModalSalirPortada(false)}>
                Continuar
              </button>
              <button type="button" className="popp-boton peligro" onClick={handleSalirAPortada}>
                Salir a portada
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}