// client/src/games/Trayectoria/TrayectoriaLocal.jsx
import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../components/Icon.jsx';
import './Trayectoria.css';
import { SelectorJugadores } from '../../components/MenuJuego.jsx';

const llamar = async (ruta, cuerpo) => {
  const res = await fetch(`/api/trayectoria${ruta}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cuerpo)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Error del servidor');
  return data;
};

export default function TrayectoriaLocal({ onVolver, onExit }) {
  const [fase, setFase] = useState('config'); // 'config' | 'jugando' | 'podio'
  const [modalAyuda, setModalAyuda] = useState(false);
  const [numJugadores, setNumJugadores] = useState(2);
  const [jugadores, setJugadores] = useState([
    { id: 1, nombre: 'Jugador 1', puntos: 0 },
    { id: 2, nombre: 'Jugador 2', puntos: 0 }
  ]);
  const [retos, setRetos] = useState([]);
  const [retoActualIdx, setRetoActualIdx] = useState(0);

  // Estados de la ronda
  const [partidaId, setPartidaId] = useState(null);
  const [clubes, setClubes] = useState([]);
  const [pista, setPista] = useState(null);
  const [errorConfig, setErrorConfig] = useState(null);
  const [reintento, setReintento] = useState(0);
  const [segundosRestantes, setSegundosRestantes] = useState(5);
  const [bloqueadosEnRonda, setBloqueadosEnRonda] = useState(new Set());
  const [modalPistaAbierto, setModalPistaAbierto] = useState(false);
  const [pistaRevelada, setPistaRevelada] = useState(false);
  const [estadoRonda, setEstadoRonda] = useState('activa');
  const [solucionFinal, setSolucionFinal] = useState(null);
  const [mensaje, setMensaje] = useState(null);

  // Pulsador rojo offline y temporizador de respuesta (15s)
  const [pulsadorActivo, setPulsadorActivo] = useState(false);
  const [respuestaTexto, setRespuestaTexto] = useState('');
  const [jugadorSeleccionadoId, setJugadorSeleccionadoId] = useState(null);
  const [segundosRespuesta, setSegundosRespuesta] = useState(15);

  const respuestaTextoRef = useRef(respuestaTexto);
  useEffect(() => {
    respuestaTextoRef.current = respuestaTexto;
  }, [respuestaTexto]);

  const jugadorSeleccionadoRef = useRef(jugadorSeleccionadoId);
  useEffect(() => {
    jugadorSeleccionadoRef.current = jugadorSeleccionadoId;
  }, [jugadorSeleccionadoId]);

  const pidiendoClub = useRef(false);
  const rondaRef = useRef(0);
  const clubesRevelados = clubes.length;

  const handleNumJugadoresChange = (cantidad) => {
    const cant = Math.min(15, Math.max(2, cantidad));
    setNumJugadores(cant);
    setJugadores((prev) => {
      const nuevaLista = [];
      for (let i = 1; i <= cant; i++) {
        const existente = prev.find((p) => p.id === i);
        nuevaLista.push(existente || { id: i, nombre: `Jugador ${i}`, puntos: 0 });
      }
      return nuevaLista;
    });
  };

  const handleNombreJugador = (id, nuevoNombre) => {
    setJugadores((prev) => prev.map((j) => (j.id === id ? { ...j, nombre: nuevoNombre } : j)));
  };

  const iniciarPartida = async () => {
    setErrorConfig(null);
    try {
      const data = await llamar('/partida', { jugadores: jugadores.length });
      setPartidaId(data.partidaId);
      setRetos(data.retos);
      setRetoActualIdx(0);
      iniciarRonda();
      setFase('jugando');
    } catch (error) {
      setErrorConfig(error.message);
    }
  };

  const iniciarRonda = () => {
    rondaRef.current += 1;
    setClubes([]);
    setPista(null);
    setPulsadorActivo(false);
    setRespuestaTexto('');
    setJugadorSeleccionadoId(null);
    setSegundosRespuesta(15);
    setSegundosRestantes(5);
    setBloqueadosEnRonda(new Set());
    setMensaje(null);
    setSolucionFinal(null);
    setEstadoRonda('activa');
    setModalPistaAbierto(false);
    setPistaRevelada(false);
  };

  const retoActual = retos[retoActualIdx];

  const pedirClub = async () => {
    if (pidiendoClub.current || !retoActual) return;
    pidiendoClub.current = true;
    const ronda = rondaRef.current;
    const indice = clubes.length;
    try {
      const { club } = await llamar('/club', { partidaId, retoId: retoActual.id, indice });
      if (ronda !== rondaRef.current) {
        setReintento((r) => r + 1);
        return;
      }
      setClubes((prev) => (prev.length === indice ? [...prev, club] : prev));
      setSegundosRestantes(5);
    } catch (error) {
      if (ronda === rondaRef.current) setTimeout(() => setReintento((r) => r + 1), 1500);
    } finally {
      pidiendoClub.current = false;
    }
  };

  const timerActivo =
    fase === 'jugando' && !pulsadorActivo && estadoRonda === 'activa' && Boolean(retoActual) &&
    clubes.length > 0 && clubes.length < retoActual.totalClubes;

  useEffect(() => {
    if (!timerActivo) return;
    const t = setInterval(() => setSegundosRestantes((prev) => Math.max(0, prev - 0.1)), 100);
    return () => clearInterval(t);
  }, [timerActivo]);

  useEffect(() => {
    if (fase !== 'jugando' || estadoRonda !== 'activa' || !retoActual || !partidaId) return;
    if (clubes.length >= retoActual.totalClubes) return;
    if (clubes.length > 0 && (pulsadorActivo || segundosRestantes > 0.05)) return;
    pedirClub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fase, estadoRonda, retoActual, partidaId, clubes.length, pulsadorActivo, segundosRestantes, reintento]);

  // Al pulsar el botón rojo se detiene el tiempo y se habilita la respuesta con 15s de límite
  const handlePulsarRojo = () => {
    if (estadoRonda !== 'activa' || jugadoresDisponibles.length === 0) return;
    setRespuestaTexto('');
    setJugadorSeleccionadoId(null);
    setSegundosRespuesta(15);
    setPulsadorActivo(true);
  };

  // Temporizador de 15 segundos para la respuesta
  useEffect(() => {
    if (!pulsadorActivo) {
      setSegundosRespuesta(15);
      return;
    }

    setSegundosRespuesta(15);
    const t = setInterval(() => {
      setSegundosRespuesta((prev) => {
        if (prev <= 0.1) {
          clearInterval(t);
          handleTiempoAgotadoLocal();
          return 0;
        }
        return Math.max(0, prev - 0.1);
      });
    }, 100);

    return () => clearInterval(t);
  }, [pulsadorActivo]);

  const aplicarFalloJugador = async (jugadorId, textoAviso) => {
    setJugadores((prev) =>
      prev.map((j) => (j.id === jugadorId ? { ...j, puntos: j.puntos - 1 } : j))
    );
    const nuevosBloqueados = new Set(bloqueadosEnRonda).add(jugadorId);
    setBloqueadosEnRonda(nuevosBloqueados);
    setRespuestaTexto('');
    setJugadorSeleccionadoId(null);
    setPulsadorActivo(false);

    if (nuevosBloqueados.size >= jugadores.length) {
      await rendirse();
    } else {
      setMensaje({
        tipo: 'error',
        texto: textoAviso || 'Incorrecto (-1 punto). Quedas fuera por esta ronda.'
      });
      setTimeout(() => setMensaje(null), 2000);
    }
  };

  const handleTiempoAgotadoLocal = () => {
    const jugadorId = jugadorSeleccionadoRef.current;
    const texto = respuestaTextoRef.current.trim();

    // Si no se ha elegido jugador, simplemente se cierra el modal
    if (!jugadorId) {
      setPulsadorActivo(false);
      setRespuestaTexto('');
      setJugadorSeleccionadoId(null);
      setMensaje({
        tipo: 'error',
        texto: 'Tiempo de respuesta agotado (15 s) sin seleccionar jugador.'
      });
      setTimeout(() => setMensaje(null), 2000);
      return;
    }

    // Si hay jugador seleccionado:
    if (texto) {
      // Si hay algo escrito, se envía como respuesta
      confirmarRespuestaJugador(jugadorId, texto);
    } else {
      // Si no ha escrito nada, cuenta como fallo
      const jObj = jugadores.find((j) => j.id === jugadorId);
      const nombreJ = jObj ? jObj.nombre : `Jugador ${jugadorId}`;
      aplicarFalloJugador(jugadorId, `Tiempo agotado sin responder (-1 punto para ${nombreJ}). Quedas fuera por esta ronda.`);
    }
  };

  const abrirPista = async () => {
    if (pista === null) {
      try {
        const data = await llamar('/pista', { partidaId, retoId: retoActual.id });
        setPista(data.pista);
      } catch (error) {
        setMensaje({ tipo: 'error', texto: error.message });
        return;
      }
    }
    setPistaRevelada(true);
    setModalPistaAbierto(true);
  };

  const confirmarRespuestaJugador = async (jugadorId, textoOpcional) => {
    const texto = (textoOpcional !== undefined ? textoOpcional : respuestaTexto).trim();
    if (!texto) return;

    try {
      const data = await llamar('/validar', {
        partidaId,
        retoId: retoActual.id,
        jugadorId,
        respuesta: texto
      });

      if (data.correcto) {
        let puntosGanados = 2;
        let motivo = "sin usar la pista (+2 pts)";

        if (pistaRevelada) {
          puntosGanados = 1;
          motivo = "con pista revelada (+1 pt)";
        } else if (clubesRevelados < retoActual.totalClubes) {
          puntosGanados = 4;
          motivo = "¡antes de ver el último club! (+4 pts)";
        }

        setJugadores((prev) =>
          prev.map((j) => (j.id === jugadorId ? { ...j, puntos: j.puntos + puntosGanados } : j))
        );
        setSolucionFinal(data.nombreReal);
        setEstadoRonda('resuelta');
        setMensaje({
          tipo: 'success',
          texto: `¡Correcto! Era ${data.nombreReal} ${motivo}`
        });
        setPulsadorActivo(false);
        setRespuestaTexto('');
        setJugadorSeleccionadoId(null);
      } else {
        aplicarFalloJugador(jugadorId, 'Incorrecto (-1 punto). Quedas fuera por esta ronda.');
      }
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message });
      setPulsadorActivo(false);
      setJugadorSeleccionadoId(null);
    }
  };

  const rendirse = async () => {
    try {
      const data = await llamar('/solucion', { partidaId, retoId: retoActual.id });
      setSolucionFinal(data.nombre);
      setEstadoRonda('resuelta');
      setMensaje({ tipo: 'error', texto: `Fin de la ronda. El futbolista era: ${data.nombre}` });
      setPulsadorActivo(false);
      setJugadorSeleccionadoId(null);
    } catch (e) {
      setMensaje({ tipo: 'error', texto: e.message });
    }
  };

  const siguienteRonda = () => {
    if (retoActualIdx + 1 < retos.length) {
      setRetoActualIdx((idx) => idx + 1);
      iniciarRonda();
    } else {
      setFase('podio');
    }
  };

  const finalizarPartida = () => {
    setFase('podio');
  };

  const esUltimoClub = Boolean(retoActual) && clubes.length > 0 && clubes.length >= retoActual.totalClubes;
  const jugadoresDisponibles = jugadores.filter((j) => !bloqueadosEnRonda.has(j.id));
  const tienePistaDisponible = retoActual && retoActual.hayPista && esUltimoClub;

  // 1. Configuración
  if (fase === 'config') {
    return (
      <div style={{ position: 'relative' }}>

        {modalAyuda && (
          <div className="rg-modal-fondo" onClick={() => setModalAyuda(false)}>
            <div className="rg-modal modal-ayuda-juego" onClick={(e) => e.stopPropagation()}>
              <div className="modal-ayuda-header">
                <span className="modal-ayuda-signo-title">?</span>
                <h3>¿Cómo se juega a Trayectoria?</h3>
              </div>
              <div className="modal-ayuda-cuerpo">
                <p><strong>1. Dinámica del juego:</strong></p>
                <ul>
                  <li>Se revelan uno a uno los clubes de fútbol de la carrera de un futbolista.</li>
                  <li>Cada 5 segundos aparece un nuevo club cronológico.</li>
                  <li><strong>Pulsa el botón rojo</strong> para parar el tiempo e introducir el futbolista.</li>
                  <li>Si fallas, pierdes 1 punto y quedas bloqueado el resto de la ronda.</li>
                </ul>
                <p><strong>2. Puntuación:</strong></p>
                <div className="tabla-ayuda-puntos">
                  <div className="fila-ayuda-puntos verde">
                    <span>⚡ Acierto antes del último club</span>
                    <strong>+4 puntos</strong>
                  </div>
                  <div className="fila-ayuda-puntos azul">
                    <span>⚽ Acierto con todos los clubes</span>
                    <strong>+2 puntos</strong>
                  </div>
                  <div className="fila-ayuda-puntos amarillo">
                    <span>💡 Acierto tras ver la pista</span>
                    <strong>+1 punto</strong>
                  </div>
                  <div className="fila-ayuda-puntos rojo">
                    <span>❌ Respuesta incorrecta</span>
                    <strong>-1 punto</strong>
                  </div>
                </div>
              </div>
              <div className="rg-modal-acciones">
                <button
                  className="btn-start"
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #16a34a, #15803d)',
                    boxShadow: '0 4px 14px rgba(22, 163, 74, 0.4)'
                  }}
                  onClick={() => setModalAyuda(false)}
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        )}

        <SelectorJugadores
          onVolver={onVolver}
          onAyuda={() => setModalAyuda(true)}
          min={2}
          max={15}
          numJugadores={numJugadores}
          onCambiarNum={handleNumJugadoresChange}
          nombres={jugadores}
          onNombre={(idx, valor) => handleNombreJugador(jugadores[idx].id, valor)}
          onEmpezar={iniciarPartida}
          textoBoton="Comenzar Partida"
          error={errorConfig}
        />
      </div>
    );
  }

  // 2. Podio
  if (fase === 'podio') {
    const ordenados = [...jugadores].sort((a, b) => b.puntos - a.puntos);
    return (
      <div className="trayectoria-container">
        <div className="game-setup-white-card">
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.8rem', color: '#0f172a', margin: '0 0 0.5rem 0' }}>🏆 Resultados Finales</h2>
            <p style={{ color: '#64748b' }}>Partida completada tras {retoActualIdx + 1} rondas.</p>
          </div>

          <table className="results-table">
            <thead>
              <tr>
                <th>Puesto</th>
                <th>Jugador</th>
                <th style={{ textAlign: 'right' }}>Puntuación</th>
              </tr>
            </thead>
            <tbody>
              {ordenados.map((j, idx) => (
                <tr key={j.id} className={idx === 0 ? 'row-winner' : ''}>
                  <td className="pos-col">
                    {idx === 0 ? '🥇 1º' : idx === 1 ? '🥈 2º' : idx === 2 ? '🥉 3º' : `${idx + 1}º`}
                  </td>
                  <td style={{ fontWeight: 600 }}>{j.nombre}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: j.puntos >= 0 ? '#15803d' : '#b91c1c' }}>
                    {j.puntos} pts
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
            <button
              className="btn-start"
              style={{
                background: 'linear-gradient(135deg, #16a34a, #15803d)',
                boxShadow: '0 4px 14px rgba(22, 163, 74, 0.4)'
              }}
              onClick={() => setFase('config')}
            >
              Nueva Partida
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Juego en vivo
  return (
    <div className="trayectoria-container">
      {/* Marcador superior */}
      <div className="scoreboard-container">
        {jugadores.map((j) => {
          const bloqueado = bloqueadosEnRonda.has(j.id);
          return (
            <div key={j.id} className={`score-pill ${bloqueado ? 'locked' : ''}`}>
              <span>{j.nombre}: <strong>{j.puntos} pts</strong></span>
              {bloqueado && <span style={{ marginLeft: '4px' }}>❌</span>}
            </div>
          );
        })}
      </div>

      <div className="game-card-content">
        <div className="round-header">
          <span><strong>Ronda {retoActualIdx + 1}</strong> de {retos.length}</span>
          <span style={{ textTransform: 'capitalize', color: '#64748b', fontWeight: 600 }}>
            Dificultad: {retoActual.dificultad}
          </span>
        </div>

        {/* Barra de progreso */}
        <div className="progress-bar-container">
          <div
            className="progress-bar-fill"
            style={{ width: estadoRonda === 'activa' && !pulsadorActivo ? `${(segundosRestantes / 5) * 100}%` : '0%' }}
          />
        </div>

        {/* Trayectoria de clubes */}
        <div className="clubs-container">
          {clubes.map((club, idx) => (
            <div key={idx} className="club-badge-card">
              <div className="club-badge-image-wrap">
                {club.logo ? (
                  <img
                    src={club.logo}
                    alt={club.nombre}
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      if (e.currentTarget.nextElementSibling) {
                        e.currentTarget.nextElementSibling.style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <div
                  className="club-fallback-badge"
                  style={{ display: club.logo ? 'none' : 'flex' }}
                >
                  {club.nombre.substring(0, 3).toUpperCase()}
                </div>
              </div>
              <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9rem', marginTop: '0.4rem' }}>
                {club.nombre}
              </div>
              <small style={{ color: '#64748b' }}>{club.periodo}</small>
            </div>
          ))}
        </div>

        {/* Controles de juego con Pulsador Rojo */}
        {estadoRonda === 'activa' ? (
          <div className="interactive-controls">
            {!pulsadorActivo ? (
              <div className="pulsador-container">
                <button
                  type="button"
                  className="btn-pulsador-rojo"
                  onClick={handlePulsarRojo}
                  disabled={jugadoresDisponibles.length === 0}
                >
                  <span className="pulsador-icono">🔴</span>
                  <span className="pulsador-texto">¡PULSAR PARA RESPONDER!</span>
                </button>

                <div className="pulsador-secundarios">
                  {tienePistaDisponible && (
                    <button
                      type="button"
                      className={`btn-hint ${pistaRevelada ? 'hint-used' : ''}`}
                      onClick={abrirPista}
                    >
                      💡 Pista {pistaRevelada ? '(Vista)' : ''}
                    </button>
                  )}
                  {esUltimoClub && (
                    <button type="button" className="btn-giveup" onClick={rendirse}>
                      Rendirse
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="respuesta-pulsada-box">
                <div className="respuesta-pulsada-header">
                  <span className="pulsado-badge">🔴 Tiempo detenido para responder</span>
                  <p className="hint small" style={{ margin: '0.3rem 0 0.4rem' }}>
                    Escribe el futbolista y selecciona el jugador que responde:
                  </p>

                  {/* Temporizador de 15 segundos estilo RasgosOnline */}
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
                      className={`timer-bar ${segundosRespuesta <= 4 ? 'low' : ''}`}
                      style={{
                        width: `${(segundosRespuesta / 15) * 100}%`,
                        height: '100%',
                        backgroundColor: segundosRespuesta <= 4 ? '#ef4444' : '#16a34a',
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
                      color: segundosRespuesta <= 4 ? '#dc2626' : '#64748b',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      margin: '0 0 0.8rem'
                    }}
                  >
                    <Icon name="clock" size={16} />
                    {Math.ceil(segundosRespuesta)} s
                  </p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (jugadorSeleccionadoId && respuestaTexto.trim()) {
                      confirmarRespuestaJugador(jugadorSeleccionadoId);
                    }
                  }}
                >
                  <input
                    autoFocus
                    type="text"
                    className="player-text-input respuesta-input-grande"
                    placeholder="Nombre del futbolista..."
                    value={respuestaTexto}
                    onChange={(e) => setRespuestaTexto(e.target.value)}
                  />

                  <p className="form-label" style={{ marginTop: '0.8rem', textAlign: 'center' }}>
                    ¿Quién ha pulsado y responde?
                  </p>

                  <div className="modal-players-grid">
                    {jugadoresDisponibles.map((j) => (
                      <button
                        key={j.id}
                        type="button"
                        className={`btn-modal-player ${jugadorSeleccionadoId === j.id ? 'active' : ''}`}
                        style={
                          jugadorSeleccionadoId === j.id
                            ? {
                                background: '#16a34a',
                                color: '#ffffff',
                                borderColor: '#15803d',
                                fontWeight: 700,
                                boxShadow: '0 2px 8px rgba(22, 163, 74, 0.3)'
                              }
                            : {}
                        }
                        onClick={() => {
                          setJugadorSeleccionadoId(j.id);
                        }}
                      >
                        {j.nombre} {jugadorSeleccionadoId === j.id ? '✓' : ''}
                      </button>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', marginTop: '1.2rem' }}>
                    <button
                      type="button"
                      className="btn-modal-cancel"
                      onClick={() => {
                        setPulsadorActivo(false);
                        setRespuestaTexto('');
                        setJugadorSeleccionadoId(null);
                      }}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn-start"
                      style={{
                        background: 'linear-gradient(135deg, #16a34a, #15803d)',
                        boxShadow: '0 4px 14px rgba(22, 163, 74, 0.4)'
                      }}
                      disabled={!jugadorSeleccionadoId || !respuestaTexto.trim()}
                    >
                      Enviar respuesta
                    </button>
                  </div>
                </form>
              </div>
            )}

            {mensaje && (
              <div className={`status-alert ${mensaje.tipo}`} style={{ marginTop: '1rem' }}>
                {mensaje.texto}
              </div>
            )}
          </div>
        ) : (
          <div className="round-finished-box">
            <div className={`status-alert ${solucionFinal ? 'info' : 'error'}`} style={{ fontSize: '1.05rem', margin: '0 0 1.25rem 0' }}>
              Futbolista: <strong>{solucionFinal}</strong>
            </div>

            <div className="round-finished-actions">
              {retoActualIdx + 1 < retos.length ? (
                <button
                  className="btn-start"
                  style={{
                    background: 'linear-gradient(135deg, #16a34a, #15803d)',
                    boxShadow: '0 4px 14px rgba(22, 163, 74, 0.4)'
                  }}
                  onClick={siguienteRonda}
                >
                  Siguiente Ronda ➔
                </button>
              ) : (
                <button
                  className="btn-start"
                  style={{
                    background: 'linear-gradient(135deg, #16a34a, #15803d)',
                    boxShadow: '0 4px 14px rgba(22, 163, 74, 0.4)'
                  }}
                  onClick={finalizarPartida}
                >
                  Ver Puntuaciones Finales 🏆
                </button>
              )}
              <button className="btn-secondary-action" onClick={finalizarPartida}>
                Finalizar Juego
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Pista */}
      {modalPistaAbierto && (
        <div className="modal-backdrop">
          <div className="modal-content-card modal-hint-card">
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>💡</div>
            <h3 style={{ color: '#b45309' }}>Pista Revelada</h3>
            <p className="hint-text-box">{pista}</p>
            <small style={{ color: '#92400e', fontWeight: 600 }}>
              * Al haber revelado la pista, acertar otorgará 1 punto.
            </small>
            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <button
                className="btn-start"
                style={{
                  background: 'linear-gradient(135deg, #16a34a, #15803d)',
                  boxShadow: '0 4px 14px rgba(22, 163, 74, 0.4)'
                }}
                onClick={() => setModalPistaAbierto(false)}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}