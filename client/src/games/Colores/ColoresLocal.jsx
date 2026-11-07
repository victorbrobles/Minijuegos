// client/src/games/Colores/ColoresLocal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import './Colores.css';

const MIN_JUGADORES = 3;
const MAX_JUGADORES = 15;
const MAX_RONDAS = 25;
const TIEMPO_TURNO = 45;

const PALETA_COLORES = [
  { id: 'rojo', nombre: 'Rojo', hex: '#ef4444', textoHex: '#ffffff' },
  { id: 'azul', nombre: 'Azul', hex: '#2563eb', textoHex: '#ffffff' },
  { id: 'amarillo', nombre: 'Amarillo', hex: '#eab308', textoHex: '#0f172a' },
  { id: 'verde', nombre: 'Verde', hex: '#16a34a', textoHex: '#ffffff' },
  { id: 'naranja', nombre: 'Naranja', hex: '#ea580c', textoHex: '#ffffff' },
  { id: 'morado', nombre: 'Morado', hex: '#9333ea', textoHex: '#ffffff' },
  { id: 'marron', nombre: 'Marrón', hex: '#78350f', textoHex: '#ffffff' },
  { id: 'blanco', nombre: 'Blanco', hex: '#ffffff', textoHex: '#0f172a', borde: '#cbd5e1' },
  { id: 'negro', nombre: 'Negro', hex: '#0f172a', textoHex: '#ffffff' },
  { id: 'gris', nombre: 'Gris', hex: '#64748b', textoHex: '#ffffff' },
  { id: 'rosa', nombre: 'Rosa', hex: '#ec4899', textoHex: '#ffffff' }
];

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

export default function ColoresLocal({ onVolver, onExit, onAbrirAyuda }) {
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

  const [preguntas, setPreguntas] = useState([]);
  const [rondaActual, setRondaActual] = useState(1);
  const [errorCarga, setErrorCarga] = useState(null);

  const [subTurno, setSubTurno] = useState(0);
  const [respuestasRonda, setRespuestasRonda] = useState({});
  const [coloresSeleccionados, setColoresSeleccionados] = useState([]);

  const [resultadoRonda, setResultadoRonda] = useState(null);
  const [tiempoRestante, setTiempoRestante] = useState(TIEMPO_TURNO);
  const timerRef = useRef(null);

  useEffect(() => {
    fetch('/api/colores/preguntas')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        if (data.success && data.preguntas) {
          setPreguntas(data.preguntas);
        }
      })
      .catch((err) => {
        console.error('Error cargando casos de colores:', err);
        setErrorCarga('No se pudieron cargar los casos desde el servidor.');
      });
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
    const scores = {};
    listaActualizada.forEach((j) => { scores[j.id] = 0; });
    setPuntos(scores);
    setRondaActual(1);
    prepararRonda(1);
  };

  const prepararRonda = (numRonda) => {
    setSubTurno(0);
    setRespuestasRonda({});
    setColoresSeleccionados([]);
    setResultadoRonda(null);
    setFase('privacidad');
  };

  const preguntaActual = preguntas[(rondaActual - 1) % (preguntas.length || 1)] || {
    item: "Pikachu (cuerpo y mejillas/orejas)",
    numColores: 3,
    colores: ["amarillo", "rojo", "negro"]
  };

  const jugadorEnTurno = jugadores[subTurno];

  const toggleColor = (colorId) => {
    if (coloresSeleccionados.includes(colorId)) {
      setColoresSeleccionados(coloresSeleccionados.filter((c) => c !== colorId));
    } else {
      if (coloresSeleccionados.length < preguntaActual.numColores) {
        setColoresSeleccionados([...coloresSeleccionados, colorId]);
      }
    }
  };

  const confirmarRespuesta = (forzado = false) => {
    if (!forzado && coloresSeleccionados.length !== preguntaActual.numColores) return;
    if (timerRef.current) clearInterval(timerRef.current);
    const nuevasRespuestas = {
      ...respuestasRonda,
      [jugadorEnTurno.id]: coloresSeleccionados
    };
    setRespuestasRonda(nuevasRespuestas);
    setColoresSeleccionados([]);

    if (subTurno + 1 < jugadores.length) {
      setSubTurno((prev) => prev + 1);
      setFase('privacidad');
    } else {
      calcularPuntosRonda(nuevasRespuestas);
    }
  };

  const confirmarRespuestaRef = useRef();
  useEffect(() => {
    confirmarRespuestaRef.current = confirmarRespuesta;
  });

  useEffect(() => {
    if (fase !== 'turno') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    setTiempoRestante(TIEMPO_TURNO);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          if (confirmarRespuestaRef.current) confirmarRespuestaRef.current(true); 
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fase, subTurno, rondaActual]);

  const calcularPuntosRonda = (respuestas) => {
    const correctosSet = new Set(preguntaActual.colores);
    const puntosGanadosRonda = {};
    const desglose = [];

    jugadores.forEach((j) => {
      const elegidos = respuestas[j.id] || [];
      let aciertosJugador = 0;
      elegidos.forEach((col) => {
        if (correctosSet.has(col)) aciertosJugador += 1;
      });
      puntosGanadosRonda[j.id] = aciertosJugador;
      desglose.push({ jugador: j.nombre, id: j.id, elegidos, aciertos: aciertosJugador });
    });

    setPuntos((prev) => {
      const act = { ...prev };
      Object.entries(puntosGanadosRonda).forEach(([jId, delta]) => {
        act[jId] = (act[jId] || 0) + delta;
      });
      return act;
    });

    setResultadoRonda({
      desglose,
      coloresCorrectos: preguntaActual.colores,
      item: preguntaActual.item
    });
    setFase('resultados_ronda');
  };

  const avanzarSiguienteRonda = () => {
    if (rondaActual >= MAX_RONDAS) {
      setFase('final');
    } else {
      const sig = rondaActual + 1;
      setRondaActual(sig);
      prepararRonda(sig);
    }
  };

  const ranking = [...jugadores].sort((a, b) => (puntos[b.id] ?? 0) - (puntos[a.id] ?? 0));
  const maximo = ranking.length ? (puntos[ranking[0].id] ?? 0) : 0;
  const ganadores = maximo > 0 ? ranking.filter((j) => (puntos[j.id] ?? 0) === maximo) : [];
  const enPartidaActiva = fase !== 'setup';

  return (
    <div className={`colores-contenedor ${enPartidaActiva ? 'qq-en-partida' : ''}`}>

      {/* 1. SETUP DE JUGADORES */}
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

            {errorCarga && <p className="error" role="alert" style={{ marginBottom: '1rem' }}>{errorCarga}</p>}

            <div className="qq-selector-cantidad-box">
              <label className="qq-label-destacado" htmlFor="num-jugadores-col">
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
                  id="num-jugadores-col"
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
                    maxLength={30}
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
              <Icon name="play" size={22} /> ¡Empezar Partida (25 Rondas)!
            </button>
          </div>
        </section>
      )}

      {/* 2. PASO DE TURNO EN PRIVADO */}
      {fase === 'privacidad' && jugadorEnTurno && (
        <section className="game">
          <div className="panel qq-menu-panel" style={{ textAlign: 'center' }}>
            <div className="qq-card-top" style={{ justifyContent: 'flex-start', marginBottom: '0.4rem', width: '100%' }}>
              <BotonVolver texto="Volver a la portada" onClick={() => setModalSalirPortada(true)} />
            </div>

            <div className="qq-tablero-header">
              <span className="qq-tablero-badge">
                <Icon name="users" size={16} /> Turno de {jugadorEnTurno.nombre}
              </span>
              <div style={{ fontSize: '3.2rem', margin: '0.4rem 0' }}>📱</div>
              <h2 className="qq-tablero-titulo">Pasad el móvil a: {jugadorEnTurno.nombre}</h2>
              <p className="qq-tablero-sub">
                Nadie más debe mirar la pantalla mientras seleccionas tus colores.
              </p>
            </div>

            <button
              type="button"
              className="big full qq-btn-principal"
              onClick={() => setFase('turno')}
            >
              <Icon name="check" size={22} strokeWidth={2.5} /> Soy {jugadorEnTurno.nombre}, responder
            </button>
          </div>
        </section>
      )}

      {/* 3. TURNO DE RESPUESTA CON LA PALETA */}
      {fase === 'turno' && jugadorEnTurno && (
        <section className="game">
          <div className="panel qq-menu-panel">
            <div className="qq-card-top" style={{ marginBottom: '0.8rem' }}>
              <BotonVolver texto="Volver a la portada" onClick={() => setModalSalirPortada(true)} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="qq-tablero-badge" style={{ marginBottom: 0 }}>
                  Ronda {rondaActual}/{MAX_RONDAS}
                </span>
                <span className="qq-tablero-badge" style={{ marginBottom: 0, background: '#f8fafc', color: '#1e293b', borderColor: '#e2e8f0' }}>
                  <Icon name="check" size={14} /> {subTurno}/{jugadores.length} listos
                </span>
              </div>
            </div>

            <div className="aprox-pregunta-card" style={{ textAlign: 'center', padding: '1.4rem 1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.6rem' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.45rem 1.3rem',
                    borderRadius: '9999px',
                    backgroundColor: '#fef3c7',
                    border: '2px solid #f59e0b',
                    color: '#b45309',
                    fontSize: '1rem',
                    fontWeight: 800,
                    boxShadow: '0 2px 6px rgba(245, 158, 11, 0.2)'
                  }}
                >
                  🎨 Debes elegir {preguntaActual.numColores} {preguntaActual.numColores === 1 ? 'color' : 'colores'}
                </span>
              </div>
              <h2 className="aprox-pregunta-texto" style={{ fontSize: '1.65rem', margin: '0.6rem 0' }}>
                {preguntaActual.item}
              </h2>
            </div>

            <div
              className="timer"
              role="timer"
              style={{ margin: '0.6rem 0 0.3rem', background: '#e2e8f0', borderRadius: '9999px', height: '8px', overflow: 'hidden' }}
            >
              <div
                className={`timer-bar ${tiempoRestante <= 10 ? 'low' : ''}`}
                style={{
                  width: `${(tiempoRestante / TIEMPO_TURNO) * 100}%`,
                  height: '100%',
                  backgroundColor: tiempoRestante <= 10 ? '#ef4444' : '#16a34a',
                  borderRadius: '9999px',
                  transition: 'width 0.1s linear, background-color 0.3s ease'
                }}
              />
            </div>
            <p
              className="timer-text"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                color: tiempoRestante <= 10 ? '#dc2626' : '#64748b', fontSize: '0.9rem', fontWeight: 700, margin: '0 0 1rem'
              }}
            >
              <Icon name="clock" size={16} />
              {tiempoRestante} s
            </p>

            <style>{`
              .colores-grid button.colores-tarjeta-solida {
                background-image: none !important;
                padding: 0.9rem 0.5rem !important;
                border-radius: 14px !important;
                min-height: 56px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                font-weight: 800 !important;
                font-size: 1.05rem !important;
                cursor: pointer !important;
                position: relative !important;
                letter-spacing: 0.3px !important;
                transition: transform 0.15s ease, box-shadow 0.15s ease !important;
              }
              .colores-grid button.color-btn-rojo { background-color: #ef4444 !important; background: #ef4444 !important; color: #ffffff !important; border: 2.5px solid #dc2626 !important; }
              .colores-grid button.color-btn-azul { background-color: #2563eb !important; background: #2563eb !important; color: #ffffff !important; border: 2.5px solid #1d4ed8 !important; }
              .colores-grid button.color-btn-amarillo { background-color: #eab308 !important; background: #eab308 !important; color: #0f172a !important; border: 2.5px solid #ca8a04 !important; }
              .colores-grid button.color-btn-verde { background-color: #16a34a !important; background: #16a34a !important; color: #ffffff !important; border: 2.5px solid #15803d !important; }
              .colores-grid button.color-btn-naranja { background-color: #ea580c !important; background: #ea580c !important; color: #ffffff !important; border: 2.5px solid #c2410c !important; }
              .colores-grid button.color-btn-morado { background-color: #9333ea !important; background: #9333ea !important; color: #ffffff !important; border: 2.5px solid #7e22ce !important; }
              .colores-grid button.color-btn-marron { background-color: #78350f !important; background: #78350f !important; color: #ffffff !important; border: 2.5px solid #451a03 !important; }
              .colores-grid button.color-btn-blanco { background-color: #ffffff !important; background: #ffffff !important; color: #0f172a !important; border: 2.5px solid #94a3b8 !important; }
              .colores-grid button.color-btn-negro { background-color: #0f172a !important; background: #0f172a !important; color: #ffffff !important; border: 2.5px solid #000000 !important; }
              .colores-grid button.color-btn-gris { background-color: #64748b !important; background: #64748b !important; color: #ffffff !important; border: 2.5px solid #475569 !important; }
              .colores-grid button.color-btn-rosa { background-color: #ec4899 !important; background: #ec4899 !important; color: #ffffff !important; border: 2.5px solid #db2777 !important; }

              .colores-grid button.colores-tarjeta-solida.seleccionado {
                transform: scale(1.05) !important;
                box-shadow: 0 0 0 3px #ffffff, 0 0 0 6px #db2777, 0 6px 16px rgba(0, 0, 0, 0.35) !important;
              }
            `}</style>
            <div className="colores-grid">
              {PALETA_COLORES.map((col) => {
                const activo = coloresSeleccionados.includes(col.id);
                return (
                  <button
                    key={col.id}
                    type="button"
                    className={`colores-tarjeta-solida color-btn-${col.id} ${activo ? 'seleccionado' : ''}`}
                    onClick={() => toggleColor(col.id)}
                  >
                    <span>{col.nombre}</span>
                    {activo && (
                      <span
                        style={{
                          position: 'absolute', top: '4px', right: '6px',
                          backgroundColor: col.id === 'blanco' || col.id === 'amarillo' ? '#0f172a' : '#ffffff',
                          color: col.id === 'blanco' || col.id === 'amarillo' ? '#ffffff' : '#0f172a',
                          borderRadius: '9999px', width: '22px', height: '22px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.8rem', fontWeight: 900, boxShadow: '0 2px 5px rgba(0,0,0,0.35)'
                        }}
                      >
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              className="big full qq-btn-principal"
              style={{ marginTop: '1rem' }}
              disabled={coloresSeleccionados.length !== preguntaActual.numColores}
              onClick={() => confirmarRespuesta(false)}
            >
              <Icon name="check" size={22} />
              {coloresSeleccionados.length === preguntaActual.numColores
                ? 'Confirmar selección'
                : `Falta ${preguntaActual.numColores - coloresSeleccionados.length}`}
            </button>
          </div>
        </section>
      )}

      {/* 4. RESULTADOS DE LA RONDA */}
      {fase === 'resultados_ronda' && resultadoRonda && (
        <section className="game">
          <div className="panel qq-menu-panel">
            <div className="qq-card-top" style={{ marginBottom: '0.8rem' }}>
              <BotonVolver texto="Volver a la portada" onClick={() => setModalSalirPortada(true)} />
              <span className="qq-tablero-badge" style={{ marginBottom: 0 }}>
                Ronda {rondaActual} finalizada
              </span>
            </div>

            <div className="end-card aprox-resolucion-card" style={{ boxShadow: 'none', border: '1.5px solid #e2e8f0' }}>
              <span className="end-icon"><Icon name="trophy" size={44} /></span>
              <p className="categoria">{resultadoRonda.item}</p>
              <h1 className="title" style={{ fontSize: '1.35rem' }}>Colores correctos:</h1>

              <div className="colores-resolucion-correctos">
                {resultadoRonda.coloresCorrectos.map((colId) => {
                  const cObj = PALETA_COLORES.find((p) => p.id === colId);
                  return (
                    <div key={colId} className="colores-pill-acierto">
                      <span
                        className="colores-circulo-mini"
                        style={{ backgroundColor: cObj?.hex, border: cObj?.borde ? '1px solid #94a3b8' : 'none' }}
                      />
                      <span>{cObj?.nombre || colId}</span>
                    </div>
                  );
                })}
              </div>

              <div className="aprox-resolucion-lista" style={{ marginTop: '1.2rem', width: '100%' }}>
                {resultadoRonda.desglose.map((d) => (
                  <div key={d.id} className="aprox-fila-resultado intermedia" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'stretch' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong>{d.jugador}</strong>
                      <span className="aprox-badge-pts" style={{ background: d.aciertos > 0 ? '#10b981' : '#64748b' }}>
                        +{d.aciertos} {d.aciertos === 1 ? 'pt' : 'pts'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {d.elegidos.map((colId) => {
                        const esAcierto = resultadoRonda.coloresCorrectos.includes(colId);
                        const cObj = PALETA_COLORES.find((p) => p.id === colId);
                        return (
                          <span key={colId} className={`colores-tag-elegido ${esAcierto ? 'acierto' : 'fallo'}`}>
                            <span className="colores-circulo-micro" style={{ backgroundColor: cObj?.hex }} />
                            {cObj?.nombre || colId} {esAcierto ? '✓' : '✗'}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="scoreboard" style={{ width: '100%', marginTop: '1.5rem' }}>
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

              <div className="round-finished-actions" style={{ marginTop: '1.5rem', width: '100%' }}>
                {rondaActual < MAX_RONDAS ? (
                  <button className="btn-start qq-btn-principal" style={{ color: 'white' }} onClick={avanzarSiguienteRonda}>
                    Siguiente ronda ({rondaActual + 1} de {MAX_RONDAS}) ➔
                  </button>
                ) : (
                  <button className="btn-start qq-btn-principal" style={{ color: 'white' }} onClick={() => setFase('final')}>
                    Ver resultados finales 🏆
                  </button>
                )}
                <div className="qq-tablero-footer" style={{ marginTop: '0.8rem', paddingTop: '0.8rem' }}>
                  <button type="button" className="qq-link-otra-ronda" onClick={() => setFase('final')}>
                    Finalizar juego anticipadamente
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 5. PANTALLA FINAL */}
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