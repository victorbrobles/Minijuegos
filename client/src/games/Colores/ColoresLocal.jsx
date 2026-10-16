// client/src/games/Colores/ColoresLocal.jsx
import React, { useState, useEffect } from 'react';
import Icon from '../../components/Icon.jsx';
import GameIntro from '../../components/GameIntro.jsx';
import './Colores.css';

const MIN_JUGADORES = 3;
const MAX_JUGADORES = 15;
const MAX_RONDAS = 25;

const PALETA_COLORES = [
  { id: 'rojo', nombre: 'Rojo', hex: '#ef4444' },
  { id: 'azul', nombre: 'Azul', hex: '#3b82f6' },
  { id: 'amarillo', nombre: 'Amarillo', hex: '#eab308' },
  { id: 'verde', nombre: 'Verde', hex: '#10b981' },
  { id: 'naranja', nombre: 'Naranja', hex: '#f97316' },
  { id: 'morado', nombre: 'Morado', hex: '#a855f7' },
  { id: 'marron', nombre: 'Marrón', hex: '#854d0e' },
  { id: 'blanco', nombre: 'Blanco', hex: '#f8fafc', borde: '#cbd5e1' },
  { id: 'negro', nombre: 'Negro', hex: '#0f172a' },
  { id: 'gris', nombre: 'Gris', hex: '#94a3b8' },
  { id: 'rosa', nombre: 'Rosa', hex: '#ec4899' }
];

export default function ColoresLocal({ onVolver, onExit }) {
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
  const [errorCarga, setErrorCarga] = useState(null);

  const [subTurno, setSubTurno] = useState(0);
  const [respuestasRonda, setRespuestasRonda] = useState({});
  const [coloresSeleccionados, setColoresSeleccionados] = useState([]);

  const [resultadoRonda, setResultadoRonda] = useState(null);

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

  const confirmarRespuesta = () => {
    if (coloresSeleccionados.length !== preguntaActual.numColores) return;

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

  const calcularPuntosRonda = (respuestas) => {
    const correctosSet = new Set(preguntaActual.colores);
    const puntosGanadosRonda = {};
    const desglose = [];

    jugadores.forEach((j) => {
      const elegidos = respuestas[j.id] || [];
      let aciertosJugador = 0;

      elegidos.forEach((col) => {
        if (correctosSet.has(col)) {
          aciertosJugador += 1;
        }
      });

      puntosGanadosRonda[j.id] = aciertosJugador;

      desglose.push({
        jugador: j.nombre,
        id: j.id,
        elegidos,
        aciertos: aciertosJugador
      });
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

  return (
    <div className="aprox-contenedor">
      {/* AYUDA */}
      {fase === 'setup' && (
        <>
          <button
            type="button"
            className="aprox-btn-ayuda"
            onClick={() => setModalAyuda(true)}
            title="Reglas de La vida en colores"
          >
            <span className="aprox-btn-ayuda-signo">?</span>
          </button>

          {modalAyuda && (
            <div className="rg-modal-fondo" onClick={() => setModalAyuda(false)}>
              <div className="rg-modal aprox-modal-ayuda" onClick={(e) => e.stopPropagation()}>
                <div className="aprox-modal-header">
                  <h3>¿Cómo se juega a La vida en colores?</h3>
                </div>

                <div className="aprox-modal-cuerpo">
                  <p><strong>1. Dinámica del juego:</strong></p>
                  <ul>
                    <li>Participan de <strong>3 a 15 jugadores</strong>. La partida dura un máximo de <strong>25 rondas</strong>.</li>
                    <li>Cada ronda muestra un elemento mítico y el <strong>número exacto de colores</strong> que debes adivinar.</li>
                    <li>Todos los jugadores responden por turnos de forma privada en el mismo dispositivo.</li>
                  </ul>
                  <p><strong>2. Puntuación:</strong></p>
                  <div className="aprox-tabla-puntos">
                    <div className="aprox-puntos-fila acierto">
                      <span>🎯 Color acertado</span>
                      <strong>+1 punto por cada color correcto</strong>
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

      {/* 1. SETUP DE JUGADORES */}
      {fase === 'setup' && (
        <section className="game">
          <GameIntro gameId="colores" titulo="La vida en colores (Un solo dispositivo)" />

          {errorCarga && <p className="error" role="alert">{errorCarga}</p>}

          <div className="panel">
            <div className="hud" style={{ marginBottom: '1rem' }}>
              <button className="btn-back-inline" onClick={onVolver}>
                &larr; Cambiar modo
              </button>
            </div>

            <h3 className="panel-title"><Icon name="users" size={22} /> Participantes</h3>
            <label className="field-label" htmlFor="num-jugadores-col">
              Número de jugadores ({MIN_JUGADORES} a {MAX_JUGADORES})
            </label>
            <select
              id="num-jugadores-col"
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
            <Icon name="play" size={24} /> ¡Empezar Partida (25 Rondas)!
          </button>
        </section>
      )}

      {/* 2. PASO DE TURNO EN PRIVADO */}
      {fase === 'privacidad' && jugadorEnTurno && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="flagFinish" size={18} />Ronda {rondaActual} de {MAX_RONDAS}</span>
            <span className="chip alt"><Icon name="users" size={18} />Jugador {subTurno + 1} de {jugadores.length}</span>
          </div>

          <div className="starter">
            <Icon name="users" size={28} />
            <p>Pasa el dispositivo a: <strong>{jugadorEnTurno.nombre}</strong></p>
          </div>

          <div className="panel aprox-pregunta-card" style={{ padding: '2.5rem 1.5rem' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🔒</div>
            <h2 className="aprox-pregunta-texto">Turno de {jugadorEnTurno.nombre}</h2>
            <p className="field-label" style={{ marginTop: '0.6rem' }}>
              Nadie más debe mirar la pantalla mientras seleccionas tus colores.
            </p>
            <button
              type="button"
              className="big full"
              style={{ marginTop: '1.5rem' }}
              onClick={() => setFase('turno')}
            >
              <Icon name="check" size={22} /> Soy {jugadorEnTurno.nombre}, responder
            </button>
          </div>
        </section>
      )}

      {/* 3. TURNO DE RESPUESTA CON LA PALETA */}
      {fase === 'turno' && jugadorEnTurno && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="flagFinish" size={18} />Ronda {rondaActual} de {MAX_RONDAS}</span>
            <span className="chip alt">
              {coloresSeleccionados.length} / {preguntaActual.numColores} colores
            </span>
          </div>

          <div className="starter">
            <Icon name="star" size={28} />
            <p>Turno de: <strong>{jugadorEnTurno.nombre}</strong></p>
          </div>

          <div className="panel aprox-pregunta-card">
            <span className="aprox-badge-pregunta">
              Selecciona exactamente {preguntaActual.numColores} {preguntaActual.numColores === 1 ? 'color' : 'colores'}
            </span>
            <h2 className="aprox-pregunta-texto" style={{ fontSize: '1.65rem', margin: '0.6rem 0' }}>
              {preguntaActual.item}
            </h2>
            <p className="field-label">
              Marca los {preguntaActual.numColores} colores característicos de este elemento:
            </p>
          </div>

          <div className="panel">
            <div className="colores-grid">
              {PALETA_COLORES.map((col) => {
                const activo = coloresSeleccionados.includes(col.id);
                return (
                  <button
                    key={col.id}
                    type="button"
                    className={`colores-tarjeta ${activo ? 'activa' : ''}`}
                    onClick={() => toggleColor(col.id)}
                  >
                    <span
                      className="colores-muestra"
                      style={{
                        backgroundColor: col.hex,
                        border: col.borde ? `2px solid ${col.borde}` : 'none'
                      }}
                    />
                    <span className="colores-nombre">{col.nombre}</span>
                    {activo && <span className="colores-check">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            className="big full"
            disabled={coloresSeleccionados.length !== preguntaActual.numColores}
            onClick={confirmarRespuesta}
          >
            <Icon name="check" size={22} />
            {coloresSeleccionados.length === preguntaActual.numColores
              ? 'Confirmar selección'
              : `Selecciona ${preguntaActual.numColores - coloresSeleccionados.length} más`}
          </button>
        </section>
      )}

      {/* 4. RESULTADOS DE LA RONDA */}
      {fase === 'resultados_ronda' && resultadoRonda && (
        <section className="game">
          <div className="end-card aprox-resolucion-card">
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
                          <span
                            className="colores-circulo-micro"
                            style={{ backgroundColor: cObj?.hex }}
                          />
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
          </div>

          <div className="actions">
            {rondaActual < MAX_RONDAS ? (
              <button onClick={avanzarSiguienteRonda}>
                <Icon name="play" size={20} />
                Siguiente ronda ({rondaActual + 1} de {MAX_RONDAS})
              </button>
            ) : (
              <button onClick={() => setFase('final')}>
                <Icon name="trophy" size={20} />
                Ver resultados finales (25 rondas)
              </button>
            )}
            <button className="secondary danger" onClick={() => setFase('final')}>
              <Icon name="flagFinish" size={20} />
              Finalizar juego
            </button>
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