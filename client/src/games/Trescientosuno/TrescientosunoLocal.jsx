import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import GameIntro from '../../components/GameIntro.jsx';
import './Trescientosuno.css';

const MIN_JUGADORES = 2;
const MAX_JUGADORES = 12;
const TIEMPO_TURNO = 60;

export default function TrescientosunoLocal({ onVolver, onExit }) {
  const navigate = useNavigate();

  const [fase, setFase] = useState('setup'); // setup, equipo, config, jugando, resultados
  const [modalAyuda, setModalAyuda] = useState(false);

  const [numJugadores, setNumJugadores] = useState(3);
  const [jugadores, setJugadores] = useState([
    { id: 1, nombre: 'Jugador 1', puntos: 0, estado: 'vivo' },
    { id: 2, nombre: 'Jugador 2', puntos: 0, estado: 'vivo' },
    { id: 3, nombre: 'Jugador 3', puntos: 0, estado: 'vivo' }
  ]);

  const [equipos, setEquipos] = useState([]);
  const [equipoSel, setEquipoSel] = useState(null);
  
  const [objetivo, setObjetivo] = useState(301);
  const [estadistica, setEstadistica] = useState('goles'); // goles, asistencias, partidos

  const [turnoIndex, setTurnoIndex] = useState(0);
  const [jugadoresUsados, setJugadoresUsados] = useState([]);
  const [inputJugador, setInputJugador] = useState('');
  const [mensajeError, setMensajeError] = useState('');
  const [ultimoAcierto, setUltimoAcierto] = useState(null);

  const [tiempoRestante, setTiempoRestante] = useState(TIEMPO_TURNO);
  const timerRef = useRef(null);
  // Copias siempre actualizadas: el temporizador y los setTimeout no deben leer valores antiguos
  const jugadoresRef = useRef(jugadores);
  const turnoRef = useRef(0);
  const timeoutRef = useRef(null);
  const finTurnoRef = useRef(0);        // hora (ms) en la que se acaba el turno actual
  const turnoCerradoRef = useRef(false); // true cuando el turno ya se ha resuelto (acierto, plantarse, eliminación)

  useEffect(() => {
    fetch('/api/trescientosuno/equipos')
      .then(r => r.json())
      .then(d => { if (d.success) setEquipos(d.equipos); })
      .catch(() => {});
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const guardarJugadores = (lista) => { jugadoresRef.current = lista; setJugadores(lista); };
  const guardarTurno = (i) => { turnoRef.current = i; setTurnoIndex(i); };
  const detenerTemporizador = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    turnoCerradoRef.current = true;
  };
  const despuesDe = (ms, fn) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(fn, ms);
  };

  const handleNumJugadoresChange = (cantidad) => {
    const cant = Math.min(MAX_JUGADORES, Math.max(MIN_JUGADORES, cantidad));
    setNumJugadores(cant);
    setJugadores((prev) => {
      const nuevaLista = [];
      for (let i = 1; i <= cant; i++) {
        const existente = prev.find((p) => p.id === i);
        nuevaLista.push(existente || { id: i, nombre: `Jugador ${i}`, puntos: 0, estado: 'vivo' });
      }
      jugadoresRef.current = nuevaLista;
      return nuevaLista;
    });
  };

  const handleNombreJugador = (id, nuevoNombre) => {
    setJugadores((prev) => {
      const lista = prev.map((j) => (j.id === id ? { ...j, nombre: nuevoNombre } : j));
      jugadoresRef.current = lista;
      return lista;
    });
  };

  const iniciarJuego = () => {
    const jActualizados = jugadoresRef.current.map(j => ({
      ...j,
      nombre: j.nombre.trim() || `Jugador ${j.id}`,
      puntos: objetivo,
      estado: 'vivo'
    }));
    guardarJugadores([...jActualizados].sort(() => Math.random() - 0.5));
    setJugadoresUsados([]);
    setUltimoAcierto(null);
    guardarTurno(0);
    setFase('jugando');
    iniciarTemporizador();
  };

  // El tiempo se calcula contra una hora límite (no restando de uno en uno): no se retrasa si la pestaña queda en segundo plano
  const iniciarTemporizador = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    turnoCerradoRef.current = false;
    finTurnoRef.current = Date.now() + TIEMPO_TURNO * 1000;
    setTiempoRestante(TIEMPO_TURNO);
    timerRef.current = setInterval(() => {
      const restante = Math.max(0, Math.ceil((finTurnoRef.current - Date.now()) / 1000));
      setTiempoRestante(restante);
      if (restante <= 0) handleEliminacion('¡Tiempo agotado!');
    }, 250);
  };

  const pasarTurno = () => {
    detenerTemporizador();
    setMensajeError('');
    setInputJugador('');
    setUltimoAcierto(null);

    const lista = jugadoresRef.current;
    if (!lista.some(j => j.estado === 'vivo')) {
      setFase('resultados');
      return;
    }

    let nextIndex = (turnoRef.current + 1) % lista.length;
    while (lista[nextIndex].estado !== 'vivo') {
      nextIndex = (nextIndex + 1) % lista.length;
    }
    guardarTurno(nextIndex);
    iniciarTemporizador();
  };

  // Cambia al jugador del turno actual sin mutar el estado de React
  const actualizarActual = (cambios) => {
    const nuevos = jugadoresRef.current.map((j, i) => (i === turnoRef.current ? { ...j, ...cambios } : j));
    guardarJugadores(nuevos);
    return nuevos;
  };

  const handleEliminacion = (motivo) => {
    detenerTemporizador();
    actualizarActual({ estado: 'eliminado' });
    setUltimoAcierto({ tipo: 'eliminado', msj: motivo });
    despuesDe(2500, pasarTurno);
  };

  const handlePlantarse = () => {
    detenerTemporizador();
    actualizarActual({ estado: 'plantado' });
    setUltimoAcierto({ tipo: 'plantado', msj: `${jugadoresRef.current[turnoRef.current].nombre} se ha plantado.` });
    despuesDe(1500, pasarTurno);
  };

  const validarJugadorSubmit = async (e) => {
    e.preventDefault();
    if (!inputJugador.trim() || ultimoAcierto) return;

    try {
      const res = await fetch('/api/trescientosuno/validar-jugador', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ equipoId: equipoSel.id, nombreJugador: inputJugador })
      });
      const data = await res.json();

      if (!(data.success && data.encontrado)) {
        setMensajeError(data.mensaje || 'Jugador no encontrado en la base de datos de este equipo.');
        return;
      }

      const jbd = data.jugador;
      // Se compara con el nombre real del futbolista: "Messi" y "Lionel Messi" son la misma persona
      if (jugadoresUsados.includes(jbd.nombre)) {
        setMensajeError(`${jbd.nombre} ya ha sido dicho.`);
        return;
      }

      // Si el turno se cerró mientras se consultaba (tiempo agotado), esta respuesta ya no cuenta
      if (turnoCerradoRef.current) return;
      const valorEstadistica = Number(jbd[estadistica]) || 0;

      if (valorEstadistica === 0) {
        handleEliminacion(`${jbd.nombre} tiene 0 ${estadistica}. ¡Eliminado!`);
        return;
      }

      detenerTemporizador();
      const nuevaPuntuacion = jugadoresRef.current[turnoRef.current].puntos - valorEstadistica;
      setJugadoresUsados((prev) => [...prev, jbd.nombre]);

      if (nuevaPuntuacion === 0) {
        actualizarActual({ puntos: 0, estado: 'ganador' });
        setUltimoAcierto({ tipo: 'ganador', msj: `¡DIANA! ${jbd.nombre} (${valorEstadistica}). ¡Ha clavado el 0!` });
        despuesDe(3000, () => setFase('resultados'));
      } else if (nuevaPuntuacion < 0) {
        actualizarActual({ puntos: nuevaPuntuacion });
        handleEliminacion(`${jbd.nombre} restó ${valorEstadistica}. Te has pasado de 0.`);
      } else {
        actualizarActual({ puntos: nuevaPuntuacion });
        setUltimoAcierto({ tipo: 'acierto', msj: `${jbd.nombre} resta ${valorEstadistica} ${estadistica}.` });
        despuesDe(2000, pasarTurno);
      }
    } catch (err) {
      setMensajeError('Error de conexión.');
    }
  };

  const getGanador = () => {
    const validos = jugadores.filter(j => j.puntos >= 0 && j.estado !== 'eliminado');
    if (validos.length === 0) return null;
    return [...validos].sort((a, b) => a.puntos - b.puntos);
  };
  const rankingFinal = getGanador();

  return (
    <div className="tcu-contenedor">
      {/* ========================================================
          MODAL DE AYUDA (Unificado en todos los modos)
          ======================================================== */}
      {fase === 'setup' && (
        <button
          type="button"
          className="btn-ayuda-flotante"
          onClick={() => setModalAyuda(true)}
          title="Reglas"
        >
          <span className="btn-ayuda-flotante-signo">?</span>
        </button>
      )}

      {modalAyuda && (
        <div className="rg-modal-fondo" onClick={() => setModalAyuda(false)}>
          <div className="rg-modal modal-ayuda-juego" onClick={(e) => e.stopPropagation()}>
            <div className="modal-ayuda-header">
              <span className="modal-ayuda-signo-title">?</span>
              <h3>¿Cómo se juega a 301 Goles?</h3>
            </div>
            <div className="modal-ayuda-cuerpo">
              <p><strong>1. Dinámica del juego:</strong></p>
              <ul>
                <li>Se selecciona un equipo y una estadística a restar (Goles, Asistencias o Partidos).</li>
                <li>Por turnos, introduce el nombre de un jugador que haya estado en ese club.</li>
                <li>Se restarán de tu marcador los puntos correspondientes a ese jugador en el club.</li>
                <li>¡Cuidado! Si te pasas del 0 exacto, o nombras a alguien con 0 en esa estadística, quedas eliminado.</li>
                <li>Tienes un límite de 60 segundos por turno para responder o plantarte.</li>
              </ul>
            </div>
            <div className="rg-modal-acciones">
              <button className="btn-start" style={{ width: '100%' }} onClick={() => setModalAyuda(false)}>
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          1. FASE DE SETUP CON ESTILOS ACTUALIZADOS
          ======================================================== */}
      {fase === 'setup' && (
        <>
          <div className="game-intro-banner">
            <div className="game-intro-icon-box">
              <span style={{ fontSize: '2.2rem' }}>🎯</span>
            </div>
            <div className="game-intro-text">
              <h2>301 Goles (Un dispositivo)</h2>
              <p>Resta puntuación adivinando jugadores hasta llegar a cero sin pasarte.</p>
            </div>
          </div>

          <div className="game-setup-white-card">
            <div className="hud" style={{ marginBottom: '1rem' }}>
              <button className="btn-back-inline" onClick={onVolver}>
                &larr; Cambiar a modo Online
              </button>
            </div>

            <div className="section-title">
              <Icon name="users" size={22} />
              <span>Participantes</span>
            </div>

            <div className="form-group">
              <label className="form-label">Número de jugadores ({MIN_JUGADORES} a {MAX_JUGADORES})</label>
              <div className="select-wrapper">
                <select
                  className="game-select"
                  value={numJugadores}
                  onChange={(e) => handleNumJugadoresChange(Number(e.target.value))}
                >
                  {Array.from({ length: MAX_JUGADORES - MIN_JUGADORES + 1 }, (_, i) => i + MIN_JUGADORES).map((num) => (
                    <option key={num} value={num}>
                      {num} jugadores
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Nombres</label>
              <div className="players-inputs-grid">
                {jugadores.map((j) => (
                  <input
                    key={j.id}
                    type="text"
                    className="player-text-input"
                    value={j.nombre}
                    placeholder={`Jugador ${j.id}`}
                    onChange={(e) => handleNombreJugador(j.id, e.target.value)}
                  />
                ))}
              </div>
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn-start" onClick={() => setFase('equipo')}>
                Siguiente
              </button>
            </div>
          </div>
        </>
      )}

      {fase === 'equipo' && (
        <section className="game">
          <div className="hud"><span className="chip"><Icon name="shield" size={18} /> Selecciona un Equipo/Selección</span></div>
          <div className="tcu-grid-equipos">
            {equipos.map(eq => (
              <div key={eq.id} className="tcu-equipo-card" onClick={() => { setEquipoSel(eq); setFase('config'); }}>
                <div className="tcu-escudo">{eq.escudo}</div>
                <h4>{eq.nombre}</h4>
              </div>
            ))}
          </div>
        </section>
      )}

      {fase === 'config' && (
        <section className="game">
          <div className="panel">
            <h2 className="title center">Configuración de Partida</h2>
            <div className="tcu-equipo-sel center">
              <div className="tcu-escudo-big">{equipoSel.escudo}</div>
              <h3>{equipoSel.nombre}</h3>
            </div>
            
            <div className="form-group" style={{ marginTop: '1.5rem' }}>
              <label className="form-label">Estadística a restar</label>
              <div className="select-wrapper">
                <select className="game-select" value={estadistica} onChange={(e) => setEstadistica(e.target.value)}>
                  <option value="goles">Goles</option>
                  <option value="asistencias">Asistencias</option>
                  <option value="partidos">Partidos Jugados</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '1.5rem' }}>
              <label className="form-label">Puntuación Objetivo</label>
              <div className="select-wrapper">
                <select className="game-select" value={objetivo} onChange={(e) => setObjetivo(Number(e.target.value))}>
                  <option value={101}>101</option>
                  <option value={201}>201</option>
                  <option value={301}>301</option>
                  <option value={501}>501</option>
                </select>
              </div>
            </div>
          </div>
          <button className="big full" onClick={iniciarJuego}><Icon name="play" size={24} /> ¡Comenzar!</button>
        </section>
      )}

      {fase === 'jugando' && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="shield" size={18} /> {equipoSel.nombre}</span>
            <span className="chip alt">Objetivo: 0 {estadistica}</span>
          </div>

          <div className="tcu-marcador-grid">
            {jugadores.map((j, i) => (
              <div key={j.id} className={`tcu-marcador-item ${i === turnoIndex ? 'activo' : ''} ${j.estado}`}>
                <div className="nombre">{j.nombre}</div>
                <div className="puntos">{j.estado === 'eliminado' ? 'X' : j.puntos}</div>
              </div>
            ))}
          </div>

          <div className="panel center tcu-turno-panel">
            {ultimoAcierto ? (
              <div className={`tcu-feedback ${ultimoAcierto.tipo}`}>
                {ultimoAcierto.msj}
              </div>
            ) : (
              <>
                <h2 className="title">Turno de {jugadores[turnoIndex].nombre}</h2>
                <div className="timer-bar-container">
                  <div className={`timer-bar ${tiempoRestante <= 10 ? 'low' : ''}`} style={{ width: `${(tiempoRestante / TIEMPO_TURNO) * 100}%` }} />
                </div>
                <p className="timer-text">{tiempoRestante} s</p>

                <form onSubmit={validarJugadorSubmit} className="tcu-form">
                  <input 
                    type="text" 
                    value={inputJugador} 
                    onChange={(e) => { setInputJugador(e.target.value); setMensajeError(''); }} 
                    placeholder={`Dime un jugador del ${equipoSel.nombre}...`}
                    autoFocus 
                  />
                  {mensajeError && <p className="error">{mensajeError}</p>}
                  <div className="tcu-actions">
                    <button type="submit" className="btn-start" style={{ width: '100%' }}>Enviar</button>
                    <button type="button" className="secondary danger" onClick={handlePlantarse}>Plantarse</button>
                  </div>
                </form>
              </>
            )}
          </div>

          {jugadoresUsados.length > 0 && (
            <div className="tcu-usados">
              <strong>Ya dichos:</strong> {jugadoresUsados.join(', ')}
            </div>
          )}
        </section>
      )}

      {fase === 'resultados' && (
        <section className="game">
          <div className="end-card">
            <span className="end-icon"><Icon name="trophy" size={48} /></span>
            <h1 className="title">Fin de la partida</h1>
            <p className="final-score">
              {!rankingFinal ? 'Todos han sido eliminados.' : `Ganador: ${rankingFinal[0].nombre} (se quedó a ${rankingFinal[0].puntos})`}
            </p>
            <div className="scoreboard">
              {[...jugadores].sort((a, b) => (a.estado === 'eliminado') - (b.estado === 'eliminado') || a.puntos - b.puntos).map((j) => (
                <div key={j.id} className="score-row">
                  <span className="score-name">{j.nombre} {j.estado === 'plantado' && '(Plantado)'}</span>
                  <span className="score-pts">{j.estado === 'eliminado' ? 'Eliminado' : j.puntos}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="actions" style={{ marginTop: '1.5rem' }}>
            <button onClick={() => { setUltimoAcierto(null); setFase('equipo'); }}><Icon name="refresh" size={20} /> Jugar otro equipo</button>
            <button className="secondary danger" onClick={() => (onExit ? onExit() : navigate('/'))}><Icon name="door" size={20} /> Salir</button>
          </div>
        </section>
      )}
    </div>
  );
}