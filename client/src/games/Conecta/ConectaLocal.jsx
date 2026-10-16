// client/src/games/Conecta/ConectaLocal.jsx
import React, { useState } from 'react';
import Icon from '../../components/Icon.jsx';
import GameIntro from '../../components/GameIntro.jsx';
import CategoryCard from '../../components/CategoryCard.jsx';
import './Conecta.css';

const MIN_JUGADORES = 3;
const MAX_JUGADORES = 15;

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

export default function ConectaLocal({ onVolver, onExit }) {
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
  const [vidas, setVidas] = useState({});

  const [categoriaElegida, setCategoriaElegida] = useState(null);
  const [rondaActual, setRondaActual] = useState(1);

  const [tablero, setTablero] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [conexionesResueltas, setConexionesResueltas] = useState([]);

  // NUEVO: Pulsador rojo único en local
  const [pulsadorActivo, setPulsadorActivo] = useState(false);
  const [jugadorPulsado, setJugadorPulsado] = useState(null);
  const [seleccionados, setSeleccionados] = useState([]);
  const [mensajeFeedback, setMensajeFeedback] = useState(null);

  const [inputTema, setInputTema] = useState('');
  const [grupoParaTema, setGrupoParaTema] = useState(null);
  const [feedbackTema, setFeedbackTema] = useState(null);

  const [ultimoGrupoPendiente, setUltimoGrupoPendiente] = useState(null);
  const [jugadorPulsadoUltima, setJugadorPulsadoUltima] = useState(null);
  const [inputTemaUltima, setInputTemaUltima] = useState('');
  const [feedbackUltima, setFeedbackUltima] = useState(null);

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
    setPulsadorActivo(false);
    setJugadorPulsado(null);
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

  // Manejador del pulsador rojo offline
  const handlePulsarBotonRojo = () => {
    if (jugadoresDisponibles.length === 0) return;
    setPulsadorActivo(true);
    setJugadorPulsado(null);
    setSeleccionados([]);
    setMensajeFeedback(null);
  };

  const cancelarPulsacion = () => {
    setPulsadorActivo(false);
    setJugadorPulsado(null);
    setSeleccionados([]);
  };

  const toggleSeleccion = (item) => {
    if (!jugadorPulsado) return;
    if (seleccionados.some((s) => s.texto === item.texto)) {
      setSeleccionados(seleccionados.filter((s) => s.texto !== item.texto));
    } else {
      if (seleccionados.length < 4) {
        setSeleccionados([...seleccionados, item]);
      }
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

      const nuevaResuelta = {
        ...grupoObj,
        resueltoPor: jugadorPulsado.nombre,
        puntosGanados: ptsGanados
      };

      setConexionesResueltas((prev) => [...prev, nuevaResuelta]);

      setGrupoParaTema(nuevaResuelta);
      setInputTema('');
      setFeedbackTema(null);
      setPulsadorActivo(false);
      setFase('resolucion_grupo');
    } else {
      const vidasRestantes = vidas[jugadorPulsado.id] - 1;
      setVidas((prev) => ({
        ...prev,
        [jugadorPulsado.id]: vidasRestantes
      }));

      if (tresCorrectos) {
        setMensajeFeedback('¡Tienes 3 correctos de una misma conexión!');
      } else {
        setMensajeFeedback('¡No forman una conexión!');
      }

      setTimeout(() => {
        setPulsadorActivo(false);
        setJugadorPulsado(null);
        setSeleccionados([]);
        setMensajeFeedback(null);

        const quedanVivos = Object.entries(vidas).some(
          ([jId, v]) => parseInt(jId, 10) !== jugadorPulsado.id && v > 0
        );
        if (!quedanVivos && vidasRestantes <= 0) {
          rendirseRonda();
        }
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

    setFeedbackTema({
      esCorrecto: esAcierto,
      saltado: saltar,
      temaReal: grupoParaTema.tema,
      jugadorNombre: jugadorPulsado.nombre
    });
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

      setFeedbackUltima({
        esCorrecto: true,
        jugadorNombre: jugadorPulsadoUltima.nombre,
        temaReal: ultimoGrupoPendiente.tema
      });
    } else {
      const vidasRestantes = vidas[jugadorPulsadoUltima.id] - 1;
      setVidas((prev) => ({
        ...prev,
        [jugadorPulsadoUltima.id]: vidasRestantes
      }));

      setFeedbackUltima({
        esCorrecto: false,
        jugadorNombre: jugadorPulsadoUltima.nombre,
        temaReal: ultimoGrupoPendiente.tema
      });
    }
  };

  const continuarTrasFeedbackUltima = () => {
    if (feedbackUltima?.esCorrecto) {
      setConexionesResueltas((prev) => [
        ...prev,
        {
          ...ultimoGrupoPendiente,
          resueltoPor: jugadorPulsadoUltima ? jugadorPulsadoUltima.nombre : 'Adivinada',
          puntosGanados: 0
        }
      ]);
      setTablero([]);
      setFeedbackUltima(null);
      setJugadorPulsadoUltima(null);
      setFase('ronda_fin');
    } else {
      setFeedbackUltima(null);
      setJugadorPulsadoUltima(null);

      const quedanVivos = Object.values(vidas).some((v) => v > 0);
      if (!quedanVivos) {
        rendirseUltimaConexion();
      }
    }
  };

  const rendirseUltimaConexion = () => {
    if (ultimoGrupoPendiente) {
      setConexionesResueltas((prev) => [
        ...prev,
        {
          ...ultimoGrupoPendiente,
          resueltoPor: 'Nadie',
          puntosGanados: 0
        }
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
  const jugadoresDisponibles = jugadores.filter((j) => (vidas[j.id] ?? 3) > 0);

  return (
    <div className="aprox-contenedor">
      {/* AYUDA */}
      {fase === 'setup' && (
        <>
          <button
            type="button"
            className="aprox-btn-ayuda"
            onClick={() => setModalAyuda(true)}
            title="Reglas de Conecta 4"
          >
            <span className="aprox-btn-ayuda-signo">?</span>
          </button>

          {modalAyuda && (
            <div className="rg-modal-fondo" onClick={() => setModalAyuda(false)}>
              <div className="rg-modal aprox-modal-ayuda" onClick={(e) => e.stopPropagation()}>
                <div className="aprox-modal-header">
                  <h3>¿Cómo se juega a Conecta 4?</h3>
                </div>

                <div className="aprox-modal-cuerpo">
                  <p><strong>1. Dinámica del juego:</strong></p>
                  <ul>
                    <li>El tablero tiene <strong>16 elementos</strong> distribuidos en 4 conexiones secretas.</li>
                    <li><strong>Pulsa el botón rojo</strong> cuando sepas una conexión, elige tu nombre y marca 4 casillas.</li>
                    <li>Si fallas, pierdes 1 vida (3 vidas por ronda). Si aciertas 3 de 4, el juego te avisará.</li>
                    <li>Al acertar una conexión, puedes adivinar su temática para ganar <strong>+1 punto extra</strong>.</li>
                  </ul>
                  <p><strong>2. Puntuación:</strong></p>
                  <div className="aprox-tabla-puntos">
                    <div className="aprox-puntos-fila acierto">
                      <span>🥇 1ª conexión descubierta</span>
                      <strong>+5 puntos</strong>
                    </div>
                    <div className="aprox-puntos-fila intermedia" style={{ background: '#e0e7ff', color: '#4338ca' }}>
                      <span>🥈 2ª conexión descubierta</span>
                      <strong>+3 puntos</strong>
                    </div>
                    <div className="aprox-puntos-fila cercana">
                      <span>🥉 3ª conexión descubierta</span>
                      <strong>+1 punto</strong>
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
          <GameIntro gameId="conecta" titulo="Conecta 4 (Un solo dispositivo)" />

          <div className="panel">
            <div className="hud" style={{ marginBottom: '1rem' }}>
              <button className="btn-back-inline" onClick={onVolver}>
                &larr; Cambiar modo
              </button>
            </div>

            <h3 className="panel-title"><Icon name="users" size={22} /> Participantes</h3>
            <label className="field-label" htmlFor="num-jugadores-c4">
              Número de jugadores ({MIN_JUGADORES} a {MAX_JUGADORES})
            </label>
            <select
              id="num-jugadores-c4"
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

          <button className="big full" onClick={irACategorias}>
            <Icon name="play" size={24} /> Elegir Categoría
          </button>
        </section>
      )}

      {/* 2. SELECTOR DE CATEGORÍA */}
      {fase === 'categoria' && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="flagFinish" size={18} />Ronda {rondaActual}</span>
            <span className="chip alt"><Icon name="target" size={18} />Selector de categoría</span>
          </div>

          <h3 className="section-title" style={{ textAlign: 'center', marginBottom: '1rem' }}>
            Elige una categoría para el tablero
          </h3>

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
        </section>
      )}

      {/* 3. TABLERO DE JUEGO CON PULSADOR ROJO */}
      {fase === 'juego' && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="flagFinish" size={18} />Ronda {rondaActual}</span>
            <span className="chip alt">{conexionesResueltas.length} de 4 conexiones</span>
          </div>

          {/* Marcador superior de vidas */}
          <div className="scoreboard-container" style={{ justifyContent: 'center', marginBottom: '0.8rem' }}>
            {jugadores.map((j) => {
              const v = vidas[j.id] ?? 3;
              return (
                <div key={j.id} className={`score-pill ${v <= 0 ? 'locked' : ''}`}>
                  <span>{j.nombre}: {v > 0 ? '❤️'.repeat(v) : '💀 Fuera'}</span>
                </div>
              );
            })}
          </div>

          {/* Conexiones ya resueltas */}
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

          {/* Tablero 4x4 */}
          {tablero.length > 0 && (
            <div className="panel conecta-tablero-panel">
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

              {mensajeFeedback && (
                <div className="conecta-feedback-banner">{mensajeFeedback}</div>
              )}
            </div>
          )}

          {/* ZONA DE PULSADOR ROJO Y SELECCIÓN DE JUGADOR */}
          <div className="interactive-controls" style={{ marginTop: '0.8rem' }}>
            {!pulsadorActivo ? (
              <div className="pulsador-container">
                <button
                  type="button"
                  className="btn-pulsador-rojo"
                  onClick={handlePulsarBotonRojo}
                  disabled={jugadoresDisponibles.length === 0}
                >
                  <span className="pulsador-icono">🔴</span>
                  <span className="pulsador-texto">¡PULSAR PARA RESPONDER!</span>
                </button>
              </div>
            ) : (
              <div className="respuesta-pulsada-box">
                {!jugadorPulsado ? (
                  <>
                    <div className="respuesta-pulsada-header">
                      <span className="pulsado-badge">🔴 Tiempo detenido para responder</span>
                      <p className="hint small" style={{ margin: '0.4rem 0 0.8rem' }}>
                        ¿Quién ha pulsado el botón? Selecciona el jugador que va a responder:
                      </p>
                    </div>

                    <div className="modal-players-grid">
                      {jugadoresDisponibles.map((j) => (
                        <button
                          key={j.id}
                          type="button"
                          className="btn-modal-player"
                          onClick={() => setJugadorPulsado(j)}
                        >
                          {j.nombre} ({vidas[j.id]} ❤️)
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="respuesta-pulsada-header">
                    <span className="pulsado-badge" style={{ background: '#dcfce7', color: '#166534' }}>
                      👤 Turno de {jugadorPulsado.nombre} ({seleccionados.length}/4 casillas)
                    </span>
                    <p className="hint" style={{ marginTop: '0.6rem', fontWeight: 700, color: '#1e1b4b' }}>
                      Selecciona 4 casillas del tablero de arriba y confirma:
                    </p>

                    <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.8rem' }}>
                      <button
                        type="button"
                        className="big full"
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

          <div className="actions" style={{ marginTop: '1rem' }}>
            <button className="secondary danger full" onClick={rendirseRonda}>
              <Icon name="flagFinish" size={20} /> Rendirse y ver soluciones
            </button>
          </div>
        </section>
      )}

      {/* 4. ADIVINAR LA CONEXIÓN (1, 2 y 3) */}
      {fase === 'resolucion_grupo' && grupoParaTema && (
        <section className="game">
          <div className="starter">
            <Icon name="trophy" size={28} />
            <p>¡Conexión acertada por <strong>{jugadorPulsado?.nombre}</strong>!</p>
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
                  No lo sé / Pasar
                </button>
              </div>
            </form>
          ) : (
            <div className="panel aprox-pregunta-card" style={{ padding: '1.8rem 1.4rem' }}>
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
                className="big full"
                style={{ marginTop: '1.5rem' }}
                onClick={continuarTrasFeedbackTema}
              >
                <Icon name="play" size={20} /> Continuar
              </button>
            </div>
          )}
        </section>
      )}

      {/* 5. 4ª Y ÚLTIMA CONEXIÓN CON PULSADOR */}
      {fase === 'ultima_conexion' && ultimoGrupoPendiente && (
        <section className="game">
          <div className="starter">
            <Icon name="target" size={28} />
            <p>¡3 conexiones resueltas! Queda la última conexión:</p>
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
              Cualquiera puede pulsar el botón rojo para adivinar la temática (+1 punto extra):
            </p>
          </div>

          {feedbackUltima && (
            <div className="panel aprox-pregunta-card" style={{ padding: '1.6rem 1.4rem', marginBottom: '1rem' }}>
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
                className="big full"
                style={{ marginTop: '1.2rem' }}
                onClick={continuarTrasFeedbackUltima}
              >
                {feedbackUltima.esCorrecto ? 'Ver resultados de la ronda' : 'Continuar turno'}
              </button>
            </div>
          )}

          {jugadorPulsadoUltima && !feedbackUltima && (
            <form onSubmit={validarTemaUltimaConexion} className="panel aprox-formulario">
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

          <div className="actions">
            <button className="secondary danger full" onClick={rendirseUltimaConexion}>
              <Icon name="flagFinish" size={20} /> Nadie la sabe / Revelar y ver soluciones
            </button>
          </div>
        </section>
      )}

      {/* 6. SOLUCIONES Y PUNTUACIÓN */}
      {fase === 'ronda_fin' && (
        <section className="game">
          <div className="end-card aprox-resolucion-card">
            <span className="end-icon"><Icon name="trophy" size={44} /></span>
            <p className="categoria">Ronda {rondaActual} finalizada</p>
            <h1 className="title">Soluciones del Tablero</h1>

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
          </div>

          <div className="actions">
            <button onClick={() => setFase('categoria')}>
              <Icon name="play" size={20} />
              Iniciar Siguiente Ronda ({rondaActual + 1})
            </button>
            <button className="secondary danger" onClick={() => setFase('final')}>
              <Icon name="flagFinish" size={20} />
              Terminar Partida
            </button>
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