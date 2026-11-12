// client/src/games/Pistas/PistasLocal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import './Pistas.css';
import { SelectorJugadores, BloqueConfig } from '../../components/MenuJuego.jsx';
import { limitesLocal } from '../limites.js';
import { SelectorRondas } from '../../components/MenuJuego.jsx';
import { rondasPorDefecto, totalRondas } from '../rondas.js';

const MAX_PISTAS = 6;
const TIEMPO_PISTA_SEGUNDOS = 10;
const TIEMPO_RESPUESTA_LOCAL = 30;
const { min: MIN_JUGADORES, max: MAX_JUGADORES } = limitesLocal('pistas');

const COLORES_JUGADOR = ['#3b82f6', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4', '#f97316', '#84cc16', '#6366f1'];
const colorJugador = (id) => COLORES_JUGADOR[(Number(id) - 1 + COLORES_JUGADOR.length * 10) % COLORES_JUGADOR.length];
const inicial = (n = '?') => n.trim().charAt(0).toUpperCase() || '?';

export default function PistasLocal({ onVolver, onExit }) {
  const navigate = useNavigate();
  const [fase, setFase] = useState('setup'); // 'setup' | 'jugando' | 'resolucion' | 'final'
  const [modalAyuda, setModalAyuda] = useState(false);
  const [modalSalirPortada, setModalSalirPortada] = useState(false);

  // Setup
  const [modo, setModo] = useState('estandar'); // 'estandar' | 'supervivencia'
  const [rondasSel, setRondasSel] = useState(rondasPorDefecto('pistas'));
  const maxRondas = modo === 'estandar' ? totalRondas('pistas', rondasSel) : null;
  const [numJugadores, setNumJugadores] = useState(MIN_JUGADORES);
  const [jugadores, setJugadores] = useState(() => Array.from({ length: MIN_JUGADORES }, (_, i) => ({ id: i + 1, nombre: `Jugador ${i + 1}` })));

  // Marcadores y vidas
  const [puntos, setPuntos] = useState({});
  const [vidas, setVidas] = useState({});
  const [ordenEliminacionSupervivencia, setOrdenEliminacionSupervivencia] = useState([]);

  // Ronda en curso
  const [rondaNum, setRondaNum] = useState(1);
  const [rondaData, setRondaData] = useState(null);
  const [usados, setUsados] = useState([]);
  const [pistasReveladas, setPistasReveladas] = useState(1);
  const [segundosRestantes, setSegundosRestantes] = useState(TIEMPO_PISTA_SEGUNDOS);

  // Estados de la ronda
  const [acertadosRonda, setAcertadosRonda] = useState([]);
  const [bloqueadosRonda, setBloqueadosRonda] = useState([]);

  // Pulsador rojo offline y temporizador de 30s para responder
  const [pulsadorActivo, setPulsadorActivo] = useState(false);
  const [inputRespuesta, setInputRespuesta] = useState('');
  const [jugadorSeleccionadoId, setJugadorSeleccionadoId] = useState(null);
  const [segundosRespuesta, setSegundosRespuesta] = useState(TIEMPO_RESPUESTA_LOCAL);
  const [avisoFlotante, setAvisoFlotante] = useState(null);

  // Resultado de la ronda
  const [resultadoRonda, setResultadoRonda] = useState(null);

  const timerRef = useRef(null);

  const inputRespuestaRef = useRef(inputRespuesta);
  useEffect(() => { inputRespuestaRef.current = inputRespuesta; }, [inputRespuesta]);

  const jugadorSeleccionadoRef = useRef(jugadorSeleccionadoId);
  useEffect(() => { jugadorSeleccionadoRef.current = jugadorSeleccionadoId; }, [jugadorSeleccionadoId]);

  const acertadosRondaRef = useRef(acertadosRonda);
  useEffect(() => { acertadosRondaRef.current = acertadosRonda; }, [acertadosRonda]);

  const bloqueadosRondaRef = useRef(bloqueadosRonda);
  useEffect(() => { bloqueadosRondaRef.current = bloqueadosRonda; }, [bloqueadosRonda]);

  const vidasRef = useRef(vidas);
  useEffect(() => { vidasRef.current = vidas; }, [vidas]);

  const jugadoresRef = useRef(jugadores);
  useEffect(() => { jugadoresRef.current = jugadores; }, [jugadores]);

  const mostrarAviso = (texto, tipo = 'info') => {
    setAvisoFlotante({ texto, tipo, id: Date.now() });
    setTimeout(() => {
      setAvisoFlotante((prev) => (prev?.texto === texto ? null : prev));
    }, 3200);
  };

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

  // Temporizador de 10s por pista
  useEffect(() => {
    if (fase !== 'jugando' || pulsadorActivo) return;

    timerRef.current = setInterval(() => {
      setSegundosRestantes((prev) => {
        if (prev <= 1) {
          if (pistasReveladas < MAX_PISTAS) {
            setPistasReveladas((p) => p + 1);
            return TIEMPO_PISTA_SEGUNDOS;
          } else {
            clearInterval(timerRef.current);
            cerrarRondaPorLimite();
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [fase, pulsadorActivo, pistasReveladas]);

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
    const lives = {};
    listaActualizada.forEach((j) => {
      scores[j.id] = 0;
      lives[j.id] = 3;
    });
    setPuntos(scores);
    setVidas(lives);
    setOrdenEliminacionSupervivencia([]);

    setRondaNum(1);
    setUsados([]);
    cargarNuevaRonda(1, []);
  };

  const cargarNuevaRonda = async (numRonda, listaUsados) => {
    try {
      const res = await fetch('/api/pistas/iniciar-ronda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usados: listaUsados })
      });
      const data = await res.json();

      setRondaData(data);
      setUsados([...listaUsados, data.id]);
      setPistasReveladas(1);
      setSegundosRestantes(TIEMPO_PISTA_SEGUNDOS);
      setAcertadosRonda([]);
      setBloqueadosRonda([]);
      setPulsadorActivo(false);
      setInputRespuesta('');
      setJugadorSeleccionadoId(null);
      setSegundosRespuesta(TIEMPO_RESPUESTA_LOCAL);
      setResultadoRonda(null);
      setFase('jugando');
    } catch {
      alert('Error cargando la ronda.');
    }
  };

  const obtenerJugadoresActivos = (acertados, bloqueados, vidasActuales) => {
    return jugadores.filter((j) => {
      const yaAcerto = acertados.some((a) => a.jugadorId === j.id);
      const estaBloqueado = bloqueados.includes(j.id);
      const sinVidas = modo === 'supervivencia' && vidasActuales[j.id] <= 0;
      return !yaAcerto && !estaBloqueado && !sinVidas;
    });
  };

  const jugadoresDisponibles = obtenerJugadoresActivos(acertadosRonda, bloqueadosRonda, vidas);

  // Al presionar el botón rojo
  const handlePulsarBotonRojo = () => {
    if (jugadoresDisponibles.length === 0) return;
    setPulsadorActivo(true);
    setInputRespuesta('');
    setJugadorSeleccionadoId(jugadoresDisponibles.length === 1 ? jugadoresDisponibles[0].id : null);
    setSegundosRespuesta(TIEMPO_RESPUESTA_LOCAL);
  };

  const cancelarRespuesta = () => {
    setPulsadorActivo(false);
    setInputRespuesta('');
    setJugadorSeleccionadoId(null);
  };

  // Temporizador de 30 segundos para responder en modo local
  useEffect(() => {
    if (!pulsadorActivo) {
      setSegundosRespuesta(TIEMPO_RESPUESTA_LOCAL);
      return;
    }

    setSegundosRespuesta(TIEMPO_RESPUESTA_LOCAL);
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

  const aplicarFallo = (jugador, avisoTexto) => {
    setPulsadorActivo(false);
    setInputRespuesta('');
    setJugadorSeleccionadoId(null);

    if (modo === 'estandar') {
      const nuevosBloqueados = [...bloqueadosRondaRef.current, jugador.id];
      setBloqueadosRonda(nuevosBloqueados);

      const activos = obtenerJugadoresActivos(acertadosRondaRef.current, nuevosBloqueados, vidasRef.current);
      if (activos.length === 0) {
        finalizarRonda('todos_eliminados', acertadosRondaRef.current, nuevosBloqueados);
      } else {
        mostrarAviso(avisoTexto || `¡${jugador.nombre} ha fallado y queda bloqueado esta ronda!`, 'malo');
      }
    } else {
      const nuevasVidas = { ...vidasRef.current, [jugador.id]: 0 };
      setVidas(nuevasVidas);
      setOrdenEliminacionSupervivencia((prev) => [...prev, jugador.id]);

      const vivos = jugadoresRef.current.filter((j) => nuevasVidas[j.id] > 0);
      if (vivos.length <= 1) {
        finalizarPartidaSupervivencia(nuevasVidas);
      } else {
        const activos = obtenerJugadoresActivos(acertadosRondaRef.current, bloqueadosRondaRef.current, nuevasVidas);
        if (activos.length === 0) {
          finalizarRonda('todos_eliminados', acertadosRondaRef.current, bloqueadosRondaRef.current);
        } else {
          mostrarAviso(avisoTexto || `¡${jugador.nombre} ha fallado y pierde todas sus vidas!`, 'malo');
        }
      }
    }
  };

  const handleTiempoAgotadoLocal = () => {
    const jId = jugadorSeleccionadoRef.current;
    const texto = inputRespuestaRef.current.trim();

    if (!jId) {
      cancelarRespuesta();
      mostrarAviso('Tiempo agotado sin elegir jugador.', 'info');
      return;
    }

    const jugador = jugadoresRef.current.find((j) => j.id === jId);
    if (!jugador) {
      cancelarRespuesta();
      return;
    }

    if (texto) {
      confirmarRespuestaJugador(jugador, texto);
    } else {
      aplicarFallo(jugador, `¡${jugador.nombre} ha agotado los 30s sin responder!`);
    }
  };

  const confirmarRespuestaJugador = async (jugador, textoOpcional) => {
    const texto = (textoOpcional !== undefined ? textoOpcional : inputRespuesta).trim();
    if (!texto || !pulsadorActivo) return;

    try {
      const res = await fetch('/api/pistas/validar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: rondaData.id,
          respuesta: texto
        })
      });
      const data = await res.json();

      setPulsadorActivo(false);
      setInputRespuesta('');
      setJugadorSeleccionadoId(null);

      if (data.acierto) {
        let ptsGanados = 0;
        let deltaVidas = 0;

        if (modo === 'estandar') {
          ptsGanados = MAX_PISTAS - pistasReveladas + 1;
          setPuntos((prev) => ({
            ...prev,
            [jugador.id]: (prev[jugador.id] || 0) + ptsGanados
          }));
        } else {
          if (pistasReveladas <= 2) deltaVidas = 1;
          else if (pistasReveladas <= 4) deltaVidas = 0;
          else deltaVidas = -1;

          setVidas((prev) => {
            const actual = prev[jugador.id] ?? 3;
            const nueva = Math.min(3, Math.max(0, actual + deltaVidas));
            return { ...prev, [jugador.id]: nueva };
          });
        }

        const nuevoRegistro = {
          jugadorId: jugador.id,
          nombre: jugador.nombre,
          pistaNum: pistasReveladas,
          puntos: ptsGanados,
          deltaVidas
        };

        const nuevosAcertados = [...acertadosRonda, nuevoRegistro];
        setAcertadosRonda(nuevosAcertados);
        mostrarAviso(`¡${jugador.nombre} ha acertado en la pista #${pistasReveladas}!`, 'bueno');

        const activos = obtenerJugadoresActivos(nuevosAcertados, bloqueadosRonda, vidas);
        if (activos.length === 0) {
          finalizarRonda('todos_completados', nuevosAcertados, bloqueadosRonda);
        }
      } else {
        aplicarFallo(jugador, `¡${jugador.nombre} ha fallado!`);
      }
    } catch {
      mostrarAviso('Error validando la respuesta.', 'malo');
    }
  };

  const cerrarRondaPorLimite = () => {
    finalizarRonda('tiempo_agotado', acertadosRonda, bloqueadosRonda);
  };

  const finalizarRonda = async (motivo, acertados = acertadosRonda, bloqueados = bloqueadosRonda) => {
    clearInterval(timerRef.current);
    try {
      const res = await fetch('/api/pistas/solucion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: rondaData.id })
      });
      const data = await res.json();

      setResultadoRonda({
        tipo: motivo,
        nombre: data.nombre,
        acertados,
        bloqueados
      });
      setPulsadorActivo(false);
      setJugadorSeleccionadoId(null);
      setFase('resolucion');
    } catch {
      setFase('setup');
    }
  };

  const finalizarPartidaSupervivencia = (vidasFinales) => {
    clearInterval(timerRef.current);
    const vivos = jugadores.filter((j) => vidasFinales[j.id] > 0);
    const rankingFinal = [];

    if (vivos.length === 1) rankingFinal.push(vivos[0]);

    const eliminadosIds = [...ordenEliminacionSupervivencia].reverse();
    eliminadosIds.forEach((id) => {
      const j = jugadores.find((x) => x.id === id);
      if (j && !rankingFinal.some((r) => r.id === j.id)) rankingFinal.push(j);
    });

    jugadores.forEach((j) => {
      if (!rankingFinal.some((r) => r.id === j.id)) rankingFinal.push(j);
    });

    const nuevosPuntos = {};
    const totalJ = jugadores.length;
    rankingFinal.forEach((j, idx) => {
      nuevosPuntos[j.id] = Math.max(1, totalJ - idx);
    });
    setPuntos(nuevosPuntos);
    setFase('final');
  };

  const siguienteRonda = () => {
    if (modo === 'supervivencia') {
      const vivos = jugadores.filter((j) => vidas[j.id] > 0);
      if (vivos.length <= 1) {
        finalizarPartidaSupervivencia(vidas);
        return;
      }
    }
    if (maxRondas && rondaNum >= maxRondas) { setFase('final'); return; }
    const sig = rondaNum + 1;
    setRondaNum(sig);
    cargarNuevaRonda(sig, usados);
  };

  const ranking = [...jugadores].sort((a, b) => (puntos[b.id] ?? 0) - (puntos[a.id] ?? 0));
  const maximo = ranking.length ? (puntos[ranking[0].id] ?? 0) : 0;
  const ganadores = maximo > 0 ? ranking.filter((j) => (puntos[j.id] ?? 0) === maximo) : [];
  const enPartidaActiva = fase === 'jugando' || fase === 'resolucion';

  return (
    <div className={`pts-contenedor ${enPartidaActiva ? 'qq-en-partida' : ''}`}>
      {/* MODAL DE AYUDA */}
      {modalAyuda && (
        <div className="rg-modal-fondo" onClick={() => setModalAyuda(false)}>
          <div className="rg-modal ptp-modal-ayuda" onClick={(e) => e.stopPropagation()}>
            <div className="ptp-modal-ayuda-header">
              <span className="ptp-ayuda-badge">❓ Cómo jugar</span>
              <h3>6 Pistas</h3>
            </div>

            <div className="ptp-modal-ayuda-body">
              <p>Descubre el personaje, película, lugar o canción secreta con el menor número de pistas posible.</p>
              <ul>
                <li><strong>6 pistas progresivas:</strong> Se revela una nueva pista cada <strong>10 segundos</strong>.</li>
                <li><strong>Pulsador rojo:</strong> Pulsa el botón para detener el reloj. Elegid quién ha pulsado y tendréis <strong>30 segundos</strong> para escribir y enviar la respuesta.</li>
                <li><strong>Puntuación:</strong> Cuanto antes aciertes, más puntos sumas (de <strong>+6 pts</strong> en la primera pista a <strong>+1 pt</strong> en la última). Si fallas, no podrás volver a intentarlo en esa ronda.</li>
              </ul>
            </div>

            <button type="button" className="ptp-boton" onClick={() => setModalAyuda(false)}>
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
        >
          <BloqueConfig>
            <span className="qq-label-destacado qq-label-icono"><Icon name="dice" size={16} /> Modo de Juego</span>
            <div className="pts-selector-modo">
              <button
                type="button"
                className={`pts-btn-modo ${modo === 'estandar' ? 'activo' : ''}`}
                onClick={() => setModo('estandar')}
              >
                🏆 Estándar (Por Puntos)
              </button>
              <button
                type="button"
                className={`pts-btn-modo ${modo === 'supervivencia' ? 'activo' : ''}`}
                onClick={() => setModo('supervivencia')}
              >
                💀 Supervivencia (Vidas ❤️)
              </button>
            </div>
          </BloqueConfig>
          {modo === 'estandar' && <SelectorRondas juegoId="pistas" valor={rondasSel} onCambiar={setRondasSel} />}
        </SelectorJugadores>
      )}

      {/* 2. JUEGO EN CURSO */}
      {fase === 'jugando' && rondaData && (
        <section className="game ptp-escena">
          {avisoFlotante && (
            <div className={`ptp-aviso ${avisoFlotante.tipo}`} role="status">
              <span>{avisoFlotante.tipo === 'bueno' ? '🎉' : avisoFlotante.tipo === 'malo' ? '💔' : 'ℹ️'}</span>
              {avisoFlotante.texto}
            </div>
          )}

          {/* Cabecera Hero */}
          <header className="ptp-hero">
            <span className="ptp-hero-deco" aria-hidden="true">
              <Icon name="detective" size={140} strokeWidth={1.3} />
            </span>
            <div className="ptp-hero-top">
              <button type="button" className="ptp-salir" onClick={() => setModalSalirPortada(true)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                <span>Portada</span>
              </button>
              <div className="ptp-hero-chips">
                <span className="ptp-chip"><Icon name="flagFinish" size={14} /> Ronda {rondaNum}{maxRondas ? `/${maxRondas}` : ''}</span>
                <span className="ptp-chip">
                  {modo === 'estandar'
                    ? `Pista ${pistasReveladas}/${MAX_PISTAS} · +${MAX_PISTAS - pistasReveladas + 1} pts`
                    : `Supervivencia · ${pistasReveladas}/${MAX_PISTAS}`}
                </span>
              </div>
            </div>

            {/* Marcador de jugadores estilo píldora */}
            <ol className="ptp-marcador" aria-label="Jugadores">
              {jugadores.map((j) => {
                const yaAcerto = acertadosRonda.some((a) => a.jugadorId === j.id);
                const bloqueado = bloqueadosRonda.includes(j.id);
                const sinVidas = modo === 'supervivencia' && (vidas[j.id] ?? 0) <= 0;
                const haRespondido = yaAcerto || bloqueado;
                return (
                  <li
                    key={j.id}
                    className={`ptp-jugador${haRespondido ? ' respondido' : ''}${sinVidas ? ' eliminado' : ''}`}
                    style={{ '--c': colorJugador(j.id) }}
                  >
                    <span className="ptp-jugador-avatar">{inicial(j.nombre)}</span>
                    <span className="ptp-jugador-datos">
                      <span className="ptp-jugador-nombre">{j.nombre}</span>
                      <span className="ptp-jugador-linea">
                        <strong>
                          {modo === 'estandar'
                            ? `${puntos[j.id] ?? 0} pts`
                            : (vidas[j.id] ?? 0) > 0
                            ? '♥'.repeat(vidas[j.id])
                            : 'Eliminado'}
                        </strong>
                      </span>
                    </span>
                    <span className="ptp-jugador-estado" title={haRespondido ? 'Ya ha respondido' : 'Pendiente'}>
                      {yaAcerto ? '✅' : bloqueado ? '❌' : '⏳'}
                    </span>
                  </li>
                );
              })}
            </ol>
          </header>

          {/* Barra de tiempo de la pista */}
          <div className={`ptp-tiempo ${segundosRestantes <= 3 && !pulsadorActivo ? 'critico' : ''}`} role="timer">
            <div className="ptp-tiempo-barra">
              <span style={{ width: `${(segundosRestantes / TIEMPO_PISTA_SEGUNDOS) * 100}%` }} />
            </div>
            <span className="ptp-tiempo-num">
              <Icon name="clock" size={15} />
              {pulsadorActivo ? 'Pausado' : `${segundosRestantes}s`}
            </span>
          </div>

          {/* Tarjeta de Pistas */}
          <div className="ptp-tarjeta">
            <div className="ptp-tarjeta-cab">
              <p className="ptp-etiqueta">Enigma oculto</p>
              <span className="ptp-badge-pista">Pista {pistasReveladas} de {MAX_PISTAS}</span>
            </div>
            <div className="ptp-pistas-lista">
              {rondaData.pistas.slice(0, pistasReveladas).map((pistaTexto, idx) => {
                const esUltima = idx === pistasReveladas - 1;
                return (
                  <div key={idx} className={`ptp-pista-item ${esUltima ? 'actual' : ''}`}>
                    <span className="ptp-pista-numero">{idx + 1}</span>
                    <p className="ptp-pista-txt">{pistaTexto}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Controles: Pulsador Rojo o Modal de Respuesta de 30s */}
          {!pulsadorActivo ? (
            <div className="ptp-barra estatica">
              <button
                type="button"
                className="ptp-pulsador"
                onClick={handlePulsarBotonRojo}
                disabled={jugadoresDisponibles.length === 0}
              >
                <span className="ptp-pulsador-cara">
                  <Icon name="zap" size={30} />
                  ¡Lo sé!
                </span>
              </button>

              {pistasReveladas === MAX_PISTAS && (
                <button type="button" className="ptp-enlace peligro" onClick={cerrarRondaPorLimite}>
                  <Icon name="flagFinish" size={16} /> Terminar ronda y ver solución
                </button>
              )}
            </div>
          ) : (
            <form
              className="ptp-tarjeta ptp-respuesta-panel"
              onSubmit={(e) => {
                e.preventDefault();
                if (jugadorSeleccionadoId && inputRespuesta.trim()) {
                  const jugador = jugadores.find((j) => j.id === jugadorSeleccionadoId);
                  if (jugador) confirmarRespuestaJugador(jugador);
                }
              }}
            >
              <div className="ptp-respuesta-top">
                <span className="ptp-pulsado-chip">🔴 Reloj detenido · 30s para responder</span>
                <span className={`ptp-respuesta-reloj ${segundosRespuesta <= 6 ? 'critico' : ''}`}>
                  <Icon name="clock" size={15} /> {Math.ceil(segundosRespuesta)}s
                </span>
              </div>

              <div className="ptp-tiempo-mini">
                <span
                  className={segundosRespuesta <= 6 ? 'critico' : ''}
                  style={{ width: `${(segundosRespuesta / TIEMPO_RESPUESTA_LOCAL) * 100}%` }}
                />
              </div>

              <p className="ptp-etiqueta" style={{ marginTop: '0.9rem' }}>1. ¿Quién ha pulsado?</p>
              <div className="ptp-jugadores-selector">
                {jugadoresDisponibles.map((j) => {
                  const sel = jugadorSeleccionadoId === j.id;
                  return (
                    <button
                      key={j.id}
                      type="button"
                      className={`ptp-btn-quien ${sel ? 'activo' : ''}`}
                      style={{ '--c': colorJugador(j.id) }}
                      onClick={() => setJugadorSeleccionadoId(j.id)}
                    >
                      <span className="ptp-quien-avatar">{inicial(j.nombre)}</span>
                      <span className="ptp-quien-nombre">{j.nombre}</span>
                    </button>
                  );
                })}
              </div>

              <label className="ptp-etiqueta" htmlFor="ptp-input-local" style={{ marginTop: '0.95rem' }}>
                2. Escribe la respuesta
              </label>
              <input
                id="ptp-input-local"
                autoFocus
                type="text"
                className="ptp-input"
                placeholder="Escribe aquí tu respuesta…"
                value={inputRespuesta}
                onChange={(e) => setInputRespuesta(e.target.value)}
                autoComplete="off"
              />

              <div className="ptp-fila-botones" style={{ marginTop: '0.9rem' }}>
                <button type="button" className="ptp-boton secundario" onClick={cancelarRespuesta}>
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="ptp-boton"
                  disabled={!jugadorSeleccionadoId || !inputRespuesta.trim()}
                >
                  <Icon name="check" size={20} /> Enviar respuesta
                </button>
              </div>
            </form>
          )}
        </section>
      )}

      {/* 3. RESOLUCIÓN DE RONDA */}
      {fase === 'resolucion' && resultadoRonda && (
        <section className="game ptp-escena">
          <header className="ptp-hero">
            <div className="ptp-hero-top">
              <button type="button" className="ptp-salir" onClick={() => setModalSalirPortada(true)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                <span>Portada</span>
              </button>
              <span className="ptp-chip"><Icon name="flagFinish" size={14} /> Fin de la ronda {rondaNum}</span>
            </div>
            <p className="ptp-etiqueta" style={{ color: 'rgba(255,255,255,0.85)' }}>La respuesta correcta era</p>
            <h2 className="ptp-solucion-titulo">{resultadoRonda.nombre}</h2>
          </header>

          <div className="ptp-tarjeta">
            <p className="ptp-etiqueta">Resumen de la ronda</p>
            <div className="ptp-resumen-lista">
              {resultadoRonda.acertados && resultadoRonda.acertados.length > 0 ? (
                resultadoRonda.acertados.map((a) => (
                  <div key={a.jugadorId} className="ptp-acierto-item">
                    <span>🎉 <strong>{a.nombre}</strong> acertó en la pista #{a.pistaNum}</span>
                    <strong>
                      {modo === 'estandar'
                        ? `+${a.puntos} pts`
                        : a.deltaVidas > 0
                        ? '+1 ❤️'
                        : a.deltaVidas < 0
                        ? '-1 ❤️'
                        : 'Mantiene ❤️'}
                    </strong>
                  </div>
                ))
              ) : (
                <p className="hint" style={{ margin: '0.4rem 0' }}>Nadie ha conseguido adivinar este enigma.</p>
              )}
            </div>
          </div>

          <div className="ptp-tarjeta">
            <p className="ptp-etiqueta">Clasificación general</p>
            <ol className="ptp-ranking">
              {ranking.map((j, i) => {
                const pts = puntos[j.id] ?? 0;
                const v = vidas[j.id] ?? 0;
                const esLider = maximo > 0 && pts === maximo && modo === 'estandar';
                return (
                  <li key={j.id} className={esLider ? 'lider' : ''} style={{ '--c': colorJugador(j.id) }}>
                    <span className="ptp-ranking-pos">{esLider ? <Icon name="crown" size={18} /> : i + 1}</span>
                    <span className="ptp-jugador-avatar">{inicial(j.nombre)}</span>
                    <span className="ptp-ranking-nombre">{j.nombre}</span>
                    <strong>{modo === 'estandar' ? `${pts} pts` : v > 0 ? '❤️'.repeat(v) : '💀 Eliminado'}</strong>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="ptp-barra estatica">
            <button type="button" className="ptp-boton grande" onClick={siguienteRonda}>
              <Icon name="play" size={20} /> {maxRondas && rondaNum >= maxRondas ? 'Ver resultado final' : `Siguiente ronda (${rondaNum + 1})`}
            </button>
            <button type="button" className="ptp-enlace" onClick={() => setFase('final')}>
              <Icon name="trophy" size={16} /> Finalizar partida
            </button>
          </div>
        </section>
      )}

      {/* 4. PODIO FINAL */}
      {fase === 'final' && (
        <section className="game ptp-escena">
          <div className="end-card">
            <span className="end-icon"><Icon name="crown" size={44} /></span>
            <h1 className="title">Puntuaciones Finales</h1>
            <p className="final-score">
              {ganadores.length === 0
                ? 'Partida completada'
                : ganadores.length === 1
                ? <>¡Gana {ganadores[0].nombre}!</>
                : <>Empate entre {ganadores.map((g) => g.nombre).join(', ')}</>}
            </p>

            <div className="scoreboard">
              {ranking.map((j, i) => {
                const pts = puntos[j.id] ?? 0;
                const primero = maximo > 0 && pts === maximo;
                return (
                  <div key={j.id} className={`score-row ${primero ? 'first' : ''}`}>
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

          <div className="ptp-barra estatica">
            <button type="button" className="ptp-boton grande" onClick={() => setFase('setup')}>
              <Icon name="refresh" size={20} /> Nueva partida
            </button>
            <button type="button" className="ptp-boton secundario" onClick={onVolver}>
              <Icon name="door" size={20} /> Volver al menú
            </button>
          </div>
        </section>
      )}

      {/* MODAL SALIR A PORTADA */}
      {modalSalirPortada && (
        <div className="rg-modal-fondo" onClick={() => setModalSalirPortada(false)}>
          <div className="rg-modal ptp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ptp-modal-icono">🚪</div>
            <h3>¿Salir a la portada?</h3>
            <p className="hint">Se cancelará la partida actual y volverás a la portada principal.</p>
            <div className="ptp-fila-botones">
              <button type="button" className="ptp-boton secundario" onClick={() => setModalSalirPortada(false)}>
                Continuar
              </button>
              <button type="button" className="ptp-boton peligro" onClick={handleSalirAPortada}>
                Salir a portada
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}