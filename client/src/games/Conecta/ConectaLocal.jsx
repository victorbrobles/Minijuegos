// client/src/games/Conecta/ConectaLocal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import CategoryCard from '../../components/CategoryCard.jsx';
import './Conecta.css';

const MIN_JUGADORES = 3;
const MAX_JUGADORES = 15;
const TIEMPO_RESPUESTA_S = 30;

const CATEGORIAS_METADATA = [
  { id: 'futbolistas', nombre: 'Futbolistas', icono: 'trophy' },
  { id: 'deportistas', nombre: 'Deportistas', icono: 'speedometer' },
  { id: 'famosos', nombre: 'Famosos', icono: 'users' },
  { id: 'animales', nombre: 'Animales', icono: 'whois' },
  { id: 'comidas', nombre: 'Comidas', icono: 'star' },
  { id: 'paises', nombre: 'Países', icono: 'globe' },
  { id: 'videojuegos', nombre: 'Videojuegos', icono: 'zap' },
  { id: 'cine', nombre: 'Cine y Series', icono: 'clapperboard' },
  { id: 'musica', nombre: 'Música', icono: 'letters' },
  { id: 'historia', nombre: 'Historia', icono: 'detective' }
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

export default function ConectaLocal({ onVolver, onExit, onAbrirAyuda }) {
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
  const [vidas, setVidas] = useState({});

  const [categoriaElegida, setCategoriaElegida] = useState(null);
  const [rondaActual, setRondaActual] = useState(1);

  const [tablero, setTablero] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [conexionesResueltas, setConexionesResueltas] = useState([]);

  // Control de turnos por ciclo
  const [jugadoresRespondieronTurno, setJugadoresRespondieronTurno] = useState([]);

  // Pulsador rojo, temporizador de 30s y selección
  const [pulsadorActivo, setPulsadorActivo] = useState(false);
  const [jugadorPulsado, setJugadorPulsado] = useState(null);
  const [segundosRespuesta, setSegundosRespuesta] = useState(TIEMPO_RESPUESTA_S);
  const [seleccionados, setSeleccionados] = useState([]);
  const [mensajeFeedback, setMensajeFeedback] = useState(null);

  const [inputTema, setInputTema] = useState('');
  const [grupoParaTema, setGrupoParaTema] = useState(null);
  const [feedbackTema, setFeedbackTema] = useState(null);

  const [ultimoGrupoPendiente, setUltimoGrupoPendiente] = useState(null);
  const [jugadorPulsadoUltima, setJugadorPulsadoUltima] = useState(null);
  const [inputTemaUltima, setInputTemaUltima] = useState('');
  const [feedbackUltima, setFeedbackUltima] = useState(null);

  const timerRespuestaRef = useRef(null);

  const jugadorPulsadoRef = useRef(jugadorPulsado);
  useEffect(() => {
    jugadorPulsadoRef.current = jugadorPulsado;
  }, [jugadorPulsado]);

  const vidasRef = useRef(vidas);
  useEffect(() => {
    vidasRef.current = vidas;
  }, [vidas]);

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

  const irACategorias = () => {
    const listaActualizada = jugadores.map((j) => ({
      ...j,
      nombre: j.nombre.trim() || `Jugador ${j.id}`
    }));
    setJugadores(listaActualizada);

    const pts = {};
    listaActualizada.forEach((j) => { pts[j.id] = 0; });
    setPuntos(pts);

    setRondaActual(1);
    setFase('categoria');
  };

  const iniciarRondaConCategoria = (catId) => {
    setCategoriaElegida(catId);
    const v = {};
    jugadores.forEach((j) => { v[j.id] = 3; });
    setVidas(v);
    setConexionesResueltas([]);
    setJugadoresRespondieronTurno([]);
    setPulsadorActivo(false);
    setJugadorPulsado(null);
    setSegundosRespuesta(TIEMPO_RESPUESTA_S);
    setSeleccionados([]);
    setMensajeFeedback(null);
    setFeedbackTema(null);
    setUltimoGrupoPendiente(null);
    setJugadorPulsadoUltima(null);
    setFeedbackUltima(null);

    fetch(`/api/conecta/tablero?categoria=${catId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setTablero(data.tablero);
          setGrupos(data.grupos);
          setFase('juego');
        }
      })
      .catch((err) => console.error('Error al obtener tablero:', err));
  };

  const registrarRespuestaJugador = (jugadorId, vidasActuales = vidas) => {
    setJugadoresRespondieronTurno((prev) => {
      const nuevo = prev.includes(jugadorId) ? prev : [...prev, jugadorId];
      const vivos = jugadores.filter((j) => (vidasActuales[j.id] ?? 3) > 0);
      const todosRespondieron = vivos.length === 0 || vivos.every((j) => nuevo.includes(j.id));
      return todosRespondieron ? [] : nuevo;
    });
  };

  const handlePulsarBotonRojo = () => {
    if (jugadoresDisponibles.length === 0) return;
    setPulsadorActivo(true);
    setJugadorPulsado(null);
    setSeleccionados([]);
    setMensajeFeedback(null);
    setSegundosRespuesta(TIEMPO_RESPUESTA_S);
  };

  const cancelarPulsacion = () => {
    setPulsadorActivo(false);
    setJugadorPulsado(null);
    setSeleccionados([]);
  };

  useEffect(() => {
    if (!pulsadorActivo) {
      setSegundosRespuesta(TIEMPO_RESPUESTA_S);
      return;
    }
    setSegundosRespuesta(TIEMPO_RESPUESTA_S);
    timerRespuestaRef.current = setInterval(() => {
      setSegundosRespuesta((prev) => {
        if (prev <= 0.1) {
          clearInterval(timerRespuestaRef.current);
          handleTiempoAgotadoLocal();
          return 0;
        }
        return Math.max(0, prev - 0.1);
      });
    }, 100);
    return () => clearInterval(timerRespuestaRef.current);
  }, [pulsadorActivo]);

  const handleTiempoAgotadoLocal = () => {
    const jugador = jugadorPulsadoRef.current;
    if (!jugador) {
      cancelarPulsacion();
    } else {
      const vidasRestantes = (vidasRef.current[jugador.id] ?? 3) - 1;
      const nuevasVidas = { ...vidasRef.current, [jugador.id]: vidasRestantes };
      setVidas(nuevasVidas);
      setMensajeFeedback(`¡Tiempo agotado para responder! (${jugador.nombre} pierde 1 ❤️)`);
      registrarRespuestaJugador(jugador.id, nuevasVidas);

      setTimeout(() => {
        setPulsadorActivo(false);
        setJugadorPulsado(null);
        setSeleccionados([]);
        setMensajeFeedback(null);
        const quedanVivos = Object.values(nuevasVidas).some((v) => v > 0);
        if (!quedanVivos) rendirseRonda();
      }, 1800);
    }
  };

  const toggleSeleccion = (item) => {
    if (!jugadorPulsado) return;
    if (seleccionados.some((s) => s.texto === item.texto)) {
      setSeleccionados(seleccionados.filter((s) => s.texto !== item.texto));
    } else {
      if (seleccionados.length < 4) setSeleccionados([...seleccionados, item]);
    }
  };

  const confirmarSeleccion = () => {
    if (seleccionados.length !== 4 || !jugadorPulsado) return;
    const cuentas = {};
    seleccionados.forEach((s) => {
      cuentas[s.grupoId] = (cuentas[s.grupoId] || 0) + 1;
    });
    const grupoAcertado = Object.entries(cuentas).find(([, cant]) => cant === 4);
    const tresCorrectos = Object.entries(cuentas).find(([, cant]) => cant === 3);

    if (grupoAcertado) {
      const gId = parseInt(grupoAcertado[0], 10);
      const grupoObj = grupos.find((g) => g.id === gId);
      const numResueltas = conexionesResueltas.length;
      let ptsGanados = 1;
      if (numResueltas === 0) ptsGanados = 5;
      else if (numResueltas === 1) ptsGanados = 3;

      setPuntos((prev) => ({
        ...prev,
        [jugadorPulsado.id]: (prev[jugadorPulsado.id] || 0) + ptsGanados
      }));

      const textosEliminar = new Set(seleccionados.map((s) => s.texto));
      setTablero((prev) => prev.filter((item) => !textosEliminar.has(item.texto)));

      const nuevaResuelta = { ...grupoObj, resueltoPor: jugadorPulsado.nombre, puntosGanados: ptsGanados };
      setConexionesResueltas((prev) => [...prev, nuevaResuelta]);
      registrarRespuestaJugador(jugadorPulsado.id, vidas);
      setGrupoParaTema(nuevaResuelta);
      setInputTema('');
      setFeedbackTema(null);
      setPulsadorActivo(false);
      setFase('resolucion_grupo');
    } else {
      const vidasRestantes = vidas[jugadorPulsado.id] - 1;
      const nuevasVidas = { ...vidas, [jugadorPulsado.id]: vidasRestantes };
      setVidas(nuevasVidas);
      registrarRespuestaJugador(jugadorPulsado.id, nuevasVidas);

      if (tresCorrectos) setMensajeFeedback('¡Tienes 3 correctos de una misma conexión! (-1 ❤️)');
      else setMensajeFeedback('¡No forman una conexión! (-1 ❤️)');

      setTimeout(() => {
        setPulsadorActivo(false);
        setJugadorPulsado(null);
        setSeleccionados([]);
        setMensajeFeedback(null);
        const quedanVivos = Object.entries(nuevasVidas).some(([jId, v]) => parseInt(jId, 10) !== jugadorPulsado.id && v > 0);
        if (!quedanVivos && vidasRestantes <= 0) rendirseRonda();
      }, 1800);
    }
  };

  const validarTemaConexion = (saltar = false) => {
    let esAcierto = false;
    if (!saltar && inputTema.trim() && grupoParaTema?.palabrasClave) {
      const texto = inputTema.trim().toLowerCase();
      esAcierto = grupoParaTema.palabrasClave.some((kw) => texto.includes(kw.toLowerCase()));
      if (esAcierto) {
        setPuntos((prev) => ({
          ...prev,
          [jugadorPulsado.id]: (prev[jugadorPulsado.id] || 0) + 1
        }));
      }
    }
    setFeedbackTema({ esCorrecto: esAcierto, saltado: saltar, temaReal: grupoParaTema.tema, jugadorNombre: jugadorPulsado.nombre });
  };

  const continuarTrasFeedbackTema = () => {
    setFeedbackTema(null);
    setGrupoParaTema(null);
    setJugadorPulsado(null);
    setSeleccionados([]);
    setInputTema('');

    if (conexionesResueltas.length === 3) {
      const idsResueltos = new Set(conexionesResueltas.map((r) => r.id));
      const cuarto = grupos.find((g) => !idsResueltos.has(g.id));
      setUltimoGrupoPendiente(cuarto);
      setJugadorPulsadoUltima(null);
      setInputTemaUltima('');
      setFeedbackUltima(null);
      setFase('ultima_conexion');
    } else if (conexionesResueltas.length >= 4) {
      setFase('ronda_fin');
    } else {
      setFase('juego');
    }
  };

  const validarTemaUltimaConexion = (e) => {
    e.preventDefault();
    if (!inputTemaUltima.trim() || !ultimoGrupoPendiente || !jugadorPulsadoUltima) return;

    const texto = inputTemaUltima.trim().toLowerCase();
    const esAcierto = ultimoGrupoPendiente.palabrasClave.some((kw) => texto.includes(kw.toLowerCase()));

    if (esAcierto) {
      setPuntos((prev) => ({
        ...prev,
        [jugadorPulsadoUltima.id]: (prev[jugadorPulsadoUltima.id] || 0) + 1
      }));
      setFeedbackUltima({ esCorrecto: true, jugadorNombre: jugadorPulsadoUltima.nombre, temaReal: ultimoGrupoPendiente.tema });
    } else {
      const vidasRestantes = vidas[jugadorPulsadoUltima.id] - 1;
      const nuevasVidas = { ...vidas, [jugadorPulsadoUltima.id]: vidasRestantes };
      setVidas(nuevasVidas);
      registrarRespuestaJugador(jugadorPulsadoUltima.id, nuevasVidas);
      setFeedbackUltima({ esCorrecto: false, jugadorNombre: jugadorPulsadoUltima.nombre, temaReal: ultimoGrupoPendiente.tema });
    }
  };

  const continuarTrasFeedbackUltima = () => {
    if (feedbackUltima?.esCorrecto) {
      setConexionesResueltas((prev) => [
        ...prev,
        { ...ultimoGrupoPendiente, resueltoPor: jugadorPulsadoUltima ? jugadorPulsadoUltima.nombre : 'Adivinada', puntosGanados: 0 }
      ]);
      setTablero([]);
      setFeedbackUltima(null);
      setJugadorPulsadoUltima(null);
      setFase('ronda_fin');
    } else {
      setFeedbackUltima(null);
      setJugadorPulsadoUltima(null);
      const quedanVivos = Object.values(vidas).some((v) => v > 0);
      if (!quedanVivos) rendirseUltimaConexion();
    }
  };

  const rendirseUltimaConexion = () => {
    if (ultimoGrupoPendiente) {
      setConexionesResueltas((prev) => [
        ...prev,
        { ...ultimoGrupoPendiente, resueltoPor: 'Nadie', puntosGanados: 0 }
      ]);
      setTablero([]);
    }
    setFase('ronda_fin');
  };

  const rendirseRonda = () => {
    setFase('ronda_fin');
  };

  const ranking = [...jugadores].sort((a, b) => (puntos[b.id] ?? 0) - (puntos[a.id] ?? 0));
  const maximo = ranking.length ? (puntos[ranking[0].id] ?? 0) : 0;
  const ganadores = maximo > 0 ? ranking.filter((j) => (puntos[j.id] ?? 0) === maximo) : [];

  const jugadoresVivos = jugadores.filter((j) => (vidas[j.id] ?? 3) > 0);
  const cicloCompleto = jugadoresVivos.length === 0 || jugadoresVivos.every((j) => jugadoresRespondieronTurno.includes(j.id));
  const respondieronEfectivos = cicloCompleto ? [] : jugadoresRespondieronTurno;
  const jugadoresDisponibles = jugadoresVivos.filter((j) => !respondieronEfectivos.includes(j.id));
  const enPartidaActiva = fase !== 'setup' && fase !== 'categoria';

  return (
    <div className={`cc-contenedor ${enPartidaActiva ? 'qq-en-partida' : ''}`}>

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

            <div className="qq-selector-cantidad-box">
              <label className="qq-label-destacado" htmlFor="num-jugadores-cc">
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
                  id="num-jugadores-cc"
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
              onClick={irACategorias}
            >
              <Icon name="play" size={22} /> Elegir Categoría
            </button>
          </div>
        </section>
      )}

      {/* 2. SELECTOR DE CATEGORÍA */}
      {fase === 'categoria' && (
        <section className="game">
          <div className="panel qq-menu-panel">
            <div className="qq-card-top">
              <BotonVolver onClick={() => setFase('setup')} />
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

            <div className="qq-section-header">
              <h3 className="qq-section-title">Elige una temática</h3>
              <p className="hint">
                Al seleccionar una categoría se cargará el tablero de 16 elementos.
              </p>
            </div>

            <div className="rf-opciones conecta-categories-grid">
              {CATEGORIAS_METADATA.map((cat, idx) => (
                <CategoryCard
                  key={cat.id}
                  nombre={cat.nombre}
                  icono={cat.icono}
                  indice={idx}
                  onClick={() => iniciarRondaConCategoria(cat.id)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. TABLERO DE JUEGO (OFFLINE CON PULSADOR) */}
      {fase === 'juego' && (
        <section className="game">
          <div className="panel qq-menu-panel">
            <div className="qq-card-top" style={{ marginBottom: '0.8rem' }}>
              <BotonVolver texto="Volver a la portada" onClick={() => setModalSalirPortada(true)} />
              <span className="qq-tablero-badge" style={{ marginBottom: 0 }}>
                Ronda {rondaActual} · {conexionesResueltas.length}/4
              </span>
            </div>

            <div className="scoreboard-container" style={{ justifyContent: 'center', marginBottom: '0.8rem' }}>
              {jugadores.map((j) => {
                const v = vidas[j.id] ?? 3;
                const yaRespondio = respondieronEfectivos.includes(j.id);
                return (
                  <div key={j.id} className={`score-pill ${v <= 0 ? 'locked' : ''}`}>
                    <span>
                      {j.nombre}: {v > 0 ? '❤️'.repeat(v) : '💀 Fuera'} {yaRespondio && v > 0 ? '· ⏳' : ''}
                    </span>
                  </div>
                );
              })}
            </div>

            {conexionesResueltas.length > 0 && (
              <div className="conecta-resueltos-lista">
                {conexionesResueltas.map((r, idx) => (
                  <div key={idx} className="conecta-grupo-resuelto-card">
                    <div className="conecta-resuelto-header">
                      <strong>{r.tema}</strong>
                      <span>+{r.puntosGanados} pts ({r.resueltoPor})</span>
                    </div>
                    <div className="conecta-resuelto-items">{r.elementos.join(' • ')}</div>
                  </div>
                ))}
              </div>
            )}

            {tablero.length > 0 && (
              <div className="conecta-grid-16">
                {tablero.map((item, idx) => {
                  const seleccionado = seleccionados.some((s) => s.texto === item.texto);
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={!jugadorPulsado}
                      className={`conecta-item-btn ${seleccionado ? 'seleccionado' : ''}`}
                      onClick={() => toggleSeleccion(item)}
                    >
                      <span>{item.texto}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {mensajeFeedback && (
              <div className="conecta-feedback-banner">{mensajeFeedback}</div>
            )}

            <div className="interactive-controls" style={{ marginTop: '1.2rem' }}>
              {!pulsadorActivo ? (
                <div className="pulsador-container">
                  <button
                    type="button"
                    className="btn-pulsador-rojo"
                    onClick={handlePulsarBotonRojo}
                    disabled={jugadoresVivos.length === 0}
                  >
                    <span className="pulsador-icono">🔴</span>
                    <span className="pulsador-texto">¡PULSAR PARA RESPONDER!</span>
                  </button>
                  {respondieronEfectivos.length > 0 && (
                    <p className="hint small center" style={{ marginTop: '0.5rem' }}>
                      Turno en curso: {respondieronEfectivos.length}/{jugadoresVivos.length} ya han respondido en este ciclo.
                    </p>
                  )}
                </div>
              ) : (
                <div className="respuesta-pulsada-box">
                  <div className="respuesta-pulsada-header">
                    <span className="pulsado-badge" style={{ background: '#dcfce7', color: '#166534' }}>
                      🔴 Tiempo detenido para responder
                    </span>
                    <p className="hint small" style={{ margin: '0.5rem 0 0.4rem' }}>
                      {!jugadorPulsado
                        ? 'Selecciona el jugador que va a responder:'
                        : `Turno de ${jugadorPulsado.nombre} (${seleccionados.length}/4 casillas). Selecciona 4 casillas del tablero:`}
                    </p>

                    <div
                      className="timer"
                      role="timer"
                      style={{
                        margin: '0.6rem 0 0.3rem',
                        background: '#e2e8f0',
                        borderRadius: '9999px',
                        height: '8px',
                        overflow: 'hidden'
                      }}
                    >
                      <div
                        className={`timer-bar ${segundosRespuesta <= 7 ? 'low' : ''}`}
                        style={{
                          width: `${(segundosRespuesta / TIEMPO_RESPUESTA_S) * 100}%`,
                          height: '100%',
                          backgroundColor: segundosRespuesta <= 7 ? '#ef4444' : '#16a34a',
                          borderRadius: '9999px',
                          transition: 'width 0.1s linear, background-color 0.3s ease'
                        }}
                      />
                    </div>
                    <p
                      className="timer-text"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem',
                        color: segundosRespuesta <= 7 ? '#dc2626' : '#64748b',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        margin: '0 0 0.8rem'
                      }}
                    >
                      <Icon name="clock" size={16} />
                      {Math.ceil(segundosRespuesta)} s
                    </p>
                  </div>

                  {!jugadorPulsado ? (
                    <>
                      <div className="modal-players-grid">
                        {jugadoresVivos.map((j) => {
                          const yaRespondio = respondieronEfectivos.includes(j.id);
                          return (
                            <button
                              key={j.id}
                              type="button"
                              className={`btn-modal-player ${yaRespondio ? 'locked' : ''}`}
                              disabled={yaRespondio}
                              onClick={() => setJugadorPulsado(j)}
                            >
                              {j.nombre} ({vidas[j.id]} ❤️) {yaRespondio ? '⏳' : ''}
                            </button>
                          );
                        })}
                      </div>
                      {respondieronEfectivos.length > 0 && (
                        <p className="hint small center" style={{ marginTop: '0.5rem' }}>
                          Los jugadores con ⏳ deben esperar a que responda el resto para reiniciar turno.
                        </p>
                      )}
                    </>
                  ) : (
                    <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.8rem' }}>
                      <button
                        type="button"
                        className="big full qq-btn-principal"
                        disabled={seleccionados.length !== 4}
                        onClick={confirmarSeleccion}
                      >
                        <Icon name="check" size={20} /> Confirmar conexión
                      </button>
                      <button
                        type="button"
                        className="secondary full"
                        onClick={cancelarPulsacion}
                      >
                        Cancelar
                      </button>
                    </div>
                  )}

                  {!jugadorPulsado && (
                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                      <button type="button" className="btn-modal-cancel" onClick={cancelarPulsacion}>
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="qq-tablero-footer">
              <button type="button" className="qq-link-otra-ronda" onClick={rendirseRonda}>
                Rendirse y ver soluciones completas
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 4. ADIVINAR LA CONEXIÓN */}
      {fase === 'resolucion_grupo' && grupoParaTema && (
        <section className="game">
          <div className="panel qq-menu-panel">
            <div className="qq-card-top" style={{ marginBottom: '0.8rem' }}>
              <BotonVolver texto="Volver a la portada" onClick={() => setModalSalirPortada(true)} />
            </div>

            <div className="starter" style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
              <Icon name="trophy" size={28} />
              <p style={{ margin: 0 }}>¡Conexión acertada por <strong>{jugadorPulsado?.nombre}</strong>!</p>
            </div>

            <div className="panel aprox-pregunta-card">
              <span className="aprox-badge-pregunta">Pregunta extra (+1 punto)</span>
              <h2 className="aprox-pregunta-texto">¿Qué relación une a estos 4 elementos?</h2>
              <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', flexWrap: 'wrap', margin: '1rem 0' }}>
                {grupoParaTema.elementos.map((el, i) => (
                  <span key={i} className="chip">{el}</span>
                ))}
              </div>
            </div>

            {!feedbackTema ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  validarTemaConexion(false);
                }}
                className="panel aprox-formulario"
                style={{ marginTop: '1rem' }}
              >
                <label className="field-label" htmlFor="input-tema-cc">
                  Introduce la conexión (solo para {jugadorPulsado?.nombre}):
                </label>
                <input
                  id="input-tema-cc"
                  type="text"
                  autoFocus
                  placeholder="Ej: Campeones del mundo con España..."
                  value={inputTema}
                  onChange={(e) => setInputTema(e.target.value)}
                />
                <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1rem' }}>
                  <button type="submit" className="big full" style={{ flex: 2 }}>
                    <Icon name="check" size={22} /> Validar (+1 pt)
                  </button>
                  <button
                    type="button"
                    className="secondary full"
                    style={{ flex: 1 }}
                    onClick={() => validarTemaConexion(true)}
                  >
                    Pasar
                  </button>
                </div>
              </form>
            ) : (
              <div className="panel aprox-pregunta-card" style={{ padding: '1.8rem 1.4rem', marginTop: '1rem' }}>
                <div
                  className={
                    feedbackTema.esCorrecto
                      ? 'conecta-feedback-banner-acierto'
                      : feedbackTema.saltado
                      ? 'conecta-feedback-banner-info'
                      : 'conecta-feedback-banner-fallo'
                  }
                >
                  {feedbackTema.esCorrecto ? (
                    <>🎯 ¡Correcto! <strong>+1 punto extra</strong> para {feedbackTema.jugadorNombre}.</>
                  ) : feedbackTema.saltado ? (
                    <>ℹ️ No se ha intentado adivinar la conexión.</>
                  ) : (
                    <>❌ ¡Incorrecto! La respuesta no era correcta.</>
                  )}
                </div>

                <div style={{ marginTop: '1.4rem', fontSize: '1.15rem', color: '#1e1b4b' }}>
                  La conexión era: <strong style={{ color: '#2563eb' }}>{feedbackTema.temaReal}</strong>
                </div>

                <button
                  type="button"
                  className="big full qq-btn-principal"
                  style={{ marginTop: '1.5rem' }}
                  onClick={continuarTrasFeedbackTema}
                >
                  <Icon name="play" size={20} /> Continuar
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 5. 4ª Y ÚLTIMA CONEXIÓN CON PULSADOR */}
      {fase === 'ultima_conexion' && ultimoGrupoPendiente && (
        <section className="game">
          <div className="panel qq-menu-panel">
            <div className="qq-card-top" style={{ marginBottom: '0.8rem' }}>
              <BotonVolver texto="Volver a la portada" onClick={() => setModalSalirPortada(true)} />
            </div>

            <div className="starter" style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
              <Icon name="target" size={28} />
              <p style={{ margin: 0 }}>¡3 conexiones resueltas! Queda la última conexión:</p>
            </div>

            <div className="panel aprox-pregunta-card">
              <span className="aprox-badge-pregunta" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
                Últimos 4 elementos
              </span>
              <h2 className="aprox-pregunta-texto">¿De qué trata esta última conexión?</h2>
              <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', flexWrap: 'wrap', margin: '1rem 0' }}>
                {ultimoGrupoPendiente.elementos.map((el, i) => (
                  <span key={i} className="chip" style={{ fontSize: '1rem', padding: '0.6rem 1rem' }}>{el}</span>
                ))}
              </div>
              <p className="field-label" style={{ marginTop: '0.6rem' }}>
                Cualquiera puede pulsar el botón rojo para adivinar la temática (+1 pt extra / -1 vida):
              </p>
            </div>

            {feedbackUltima && (
              <div className="panel aprox-pregunta-card" style={{ padding: '1.6rem 1.4rem', marginTop: '1rem', marginBottom: '1rem' }}>
                <div className={feedbackUltima.esCorrecto ? 'conecta-feedback-banner-acierto' : 'conecta-feedback-banner-fallo'}>
                  {feedbackUltima.esCorrecto ? (
                    <>🎯 ¡Correcto! <strong>+1 punto extra</strong> para {feedbackUltima.jugadorNombre}.</>
                  ) : (
                    <>❌ ¡Incorrecto! {feedbackUltima.jugadorNombre} pierde 1 vida.</>
                  )}
                </div>

                {feedbackUltima.esCorrecto && (
                  <div style={{ marginTop: '1.2rem', fontSize: '1.15rem', color: '#1e1b4b' }}>
                    Conexión: <strong style={{ color: '#2563eb' }}>{feedbackUltima.temaReal}</strong>
                  </div>
                )}

                <button
                  type="button"
                  className="big full qq-btn-principal"
                  style={{ marginTop: '1.2rem' }}
                  onClick={continuarTrasFeedbackUltima}
                >
                  {feedbackUltima.esCorrecto ? 'Ver resultados de la ronda' : 'Continuar turno'}
                </button>
              </div>
            )}

            {jugadorPulsadoUltima && !feedbackUltima && (
              <form onSubmit={validarTemaUltimaConexion} className="panel aprox-formulario" style={{ marginTop: '1rem' }}>
                <label className="field-label" htmlFor="input-tema-ultima">
                  Respuesta de <strong>{jugadorPulsadoUltima.nombre}</strong> (+1 pt / -1 vida):
                </label>
                <input
                  id="input-tema-ultima"
                  type="text"
                  autoFocus
                  placeholder="Escribe la conexión que los une..."
                  value={inputTemaUltima}
                  onChange={(e) => setInputTemaUltima(e.target.value)}
                  required
                />
                <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1rem' }}>
                  <button type="submit" className="big full" style={{ flex: 2 }}>
                    <Icon name="check" size={22} /> Validar respuesta
                  </button>
                  <button
                    type="button"
                    className="secondary full"
                    style={{ flex: 1 }}
                    onClick={() => setJugadorPulsadoUltima(null)}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}

            {!feedbackUltima && !jugadorPulsadoUltima && (
              <div className="pulsador-container" style={{ margin: '1rem 0' }}>
                <button
                  type="button"
                  className="btn-pulsador-rojo"
                  onClick={() => setJugadorPulsadoUltima(jugadoresDisponibles[0] || null)}
                  disabled={jugadoresDisponibles.length === 0}
                >
                  <span className="pulsador-icono">🔴</span>
                  <span className="pulsador-texto">¡PULSAR PARA ADIVINAR!</span>
                </button>
              </div>
            )}

            <div className="qq-tablero-footer">
              <button type="button" className="qq-link-otra-ronda" onClick={rendirseUltimaConexion}>
                Nadie la sabe / Ver soluciones
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 6. SOLUCIONES Y PUNTUACIÓN */}
      {fase === 'ronda_fin' && (
        <section className="game">
          <div className="panel qq-menu-panel">
            <div className="qq-card-top" style={{ marginBottom: '0.8rem' }}>
              <BotonVolver texto="Volver a la portada" onClick={() => setModalSalirPortada(true)} />
              <span className="qq-tablero-badge" style={{ marginBottom: 0 }}>
                Ronda {rondaActual} finalizada
              </span>
            </div>

            <div className="starter" style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <Icon name="trophy" size={28} />
              <p style={{ margin: 0 }}>Soluciones del Tablero</p>
            </div>

            <div className="conecta-resueltos-lista" style={{ margin: '1rem 0' }}>
              {grupos.map((g, idx) => (
                <div key={idx} className="conecta-grupo-resuelto-card">
                  <div className="conecta-resuelto-header"><strong>{g.tema}</strong></div>
                  <div className="conecta-resuelto-items">{g.elementos.join(' • ')}</div>
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

            <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <button type="button" className="big full qq-btn-principal" onClick={() => setFase('categoria')}>
                <Icon name="play" size={20} /> Siguiente Ronda ({rondaActual + 1})
              </button>
              <div className="qq-tablero-footer" style={{ marginTop: 0, paddingTop: '0.6rem', borderTop: 'none' }}>
                <button type="button" className="qq-link-otra-ronda" onClick={() => setFase('final')}>
                  Finalizar partida 🏆
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 7. PODIO FINAL */}
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

      {/* MODAL: SALIR A LA PORTADA */}
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