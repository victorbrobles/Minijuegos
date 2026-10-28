// client/src/games/FutbolGrid/FutbolGridLocal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import GameIntro from '../../components/GameIntro.jsx';
import './FutbolGrid.css';

const TIEMPO_S = 60; 

export default function FutbolGridLocal({ onVolver, onExit }) {
  const navigate = useNavigate();
  const [paso, setPaso] = useState('config'); 
  const [modalAyuda, setModalAyuda] = useState(false);
  const [jugadores, setJugadores] = useState([{ id: 1, nombre: 'Jugador 1' }, { id: 2, nombre: 'Jugador 2' }]);
  const [equipos, setEquipos] = useState({ X: [], O: [] });
  const [tablero, setTablero] = useState(Array(9).fill(null));
  const [turno, setTurno] = useState('X');
  const [celdaActiva, setCeldaActiva] = useState(null); 
  const [restante, setRestante] = useState(TIEMPO_S);
  const [ganador, setGanador] = useState(null);
  
  const [gridActual, setGridActual] = useState(null);
  const [respuestaInput, setRespuestaInput] = useState("");
  const [feedback, setFeedback] = useState(null);

  const timerRef = useRef(null);

  const handleNumJugadores = (e) => {
    const num = parseInt(e.target.value, 10);
    setJugadores(Array.from({ length: num }, (_, i) => ({
      id: i + 1, nombre: jugadores[i]?.nombre ?? `Jugador ${i + 1}`
    })));
  };

  const cargarGrid = async () => {
    try {
      const res = await fetch('/api/futbolgrid/grid');
      const data = await res.json();
      if(data.success) {
        setGridActual(data.grid);
      }
    } catch(e) { console.error("Error al cargar grid", e); }
  };

  const empezar = async () => {
    const lista = jugadores.map((j) => ({ ...j, nombre: j.nombre.trim() || `Jugador ${j.id}` }));
    const eqX = []; const eqO = [];
    lista.forEach((j, i) => { if (i % 2 === 0) eqX.push(j); else eqO.push(j); });
    setEquipos({ X: eqX, O: eqO });
    setJugadores(lista);
    setTablero(Array(9).fill(null));
    setTurno('X');
    setGanador(null);
    await cargarGrid();
    setPaso('jugando');
  };

  const iniciarTimer = () => {
    setRestante(TIEMPO_S);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setRestante((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          procesarFallo("¡Tiempo agotado!");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const abrirCelda = (index) => {
    if (tablero[index] !== null || ganador || !gridActual) return;
    setCeldaActiva(index);
    setRespuestaInput("");
    setFeedback(null);
    iniciarTimer();
  };

  const normalizar = (t) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

  const validarRespuesta = (e) => {
    e.preventDefault();
    if (!respuestaInput.trim()) return;
    if (timerRef.current) clearInterval(timerRef.current);

    const validos = gridActual.respuestas[Math.floor(celdaActiva / 3)][celdaActiva % 3];
    const inputNorm = normalizar(respuestaInput);
    const esCorrecto = validos.some(n => normalizar(n) === inputNorm || normalizar(n).includes(inputNorm) || inputNorm.includes(normalizar(n)));

    if(esCorrecto) {
      setFeedback({ tipo: 'success', msj: '¡Respuesta correcta!' });
      setTimeout(() => procesarAcierto(), 1500);
    } else {
      setFeedback({ tipo: 'error', msj: 'Jugador incorrecto' });
      setTimeout(() => procesarFallo("Fallo"), 1500);
    }
  };

  const procesarAcierto = () => {
    let nuevoTablero = [...tablero];
    nuevoTablero[celdaActiva] = turno;
    setTablero(nuevoTablero);
    setCeldaActiva(null);
    comprobarVictoria(nuevoTablero);
  };

  const procesarFallo = (motivo) => {
    setCeldaActiva(null);
    setTurno(turno === 'X' ? 'O' : 'X');
  };

  const comprobarVictoria = (nuevoTablero) => {
    const lineas = [[0,1,2], [3,4,5], [6,7,8], [0,3,6], [1,4,7], [2,5,8], [0,4,8], [2,4,6]];
    for (let [a, b, c] of lineas) {
      if (nuevoTablero[a] && nuevoTablero[a] === nuevoTablero[b] && nuevoTablero[a] === nuevoTablero[c]) {
        setGanador(nuevoTablero[a]);
        return setPaso('final');
      }
    }
    if (!nuevoTablero.includes(null)) { setGanador('Empate'); setPaso('final'); }
    else { setTurno(turno === 'X' ? 'O' : 'X'); }
  };

  return (
    <div className="rk-contenedor">
      {paso === 'config' && (
        <>
          <button type="button" className="rk-btn-ayuda" onClick={() => setModalAyuda(true)} title="Reglas">
            <span className="rk-btn-ayuda-signo">?</span>
          </button>

          {modalAyuda && (
            <div className="rg-modal-fondo" onClick={() => setModalAyuda(false)}>
              <div className="rg-modal rk-modal-ayuda" onClick={(e) => e.stopPropagation()}>
                <div className="rk-modal-header">
                  <span className="rk-modal-signo-title">?</span>
                  <h3>¿Cómo se juega a Fútbol en Raya?</h3>
                </div>
                <div className="rk-modal-cuerpo">
                  <p>El clásico Tres en Raya, pero con conocimiento futbolístico. Los jugadores se dividirán en <strong>Equipo Azul (X)</strong> y <strong>Equipo Rojo (O)</strong>.</p>
                  <ul>
                    <li>En tu turno, elige una casilla vacía de la cuadrícula.</li>
                    <li>Deberéis escribir el nombre de un jugador que cumpla <strong>ambas categorías</strong> (fila y columna).</li>
                    <li>Si acertáis, la casilla es vuestra. Si falláis o se acaba el tiempo, el turno pasa al otro equipo.</li>
                    <li>Gana el primer equipo en alinear 3 casillas.</li>
                  </ul>
                </div>
                <div className="rg-modal-acciones">
                  <button className="big full" onClick={() => setModalAyuda(false)}>Entendido</button>
                </div>
              </div>
            </div>
          )}

          <section className="game">
            <GameIntro gameId="futbolgrid" titulo="Fútbol en Raya" />
            <div className="panel">
              <div className="hud" style={{ marginBottom: '1rem' }}><button className="btn-back-inline" onClick={onVolver}>&larr; Cambiar a modo Online</button></div>
              <h3 className="panel-title"><Icon name="users" size={22} />Jugadores (2 a 6)</h3>
              <select value={jugadores.length} onChange={handleNumJugadores} style={{ marginBottom: '1rem', width: '100%', padding: '0.8rem', borderRadius: '8px' }}>
                {[2, 3, 4, 5, 6].map((num) => (<option key={num} value={num}>{num} jugadores</option>))}
              </select>
              <div className="names-grid">
                {jugadores.map((j, idx) => (
                  <input key={j.id} type="text" value={j.nombre} onChange={(e) => handleNombre(idx, e.target.value)} placeholder={`Jugador ${j.id}`} maxLength={20} />
                ))}
              </div>
            </div>
            <button className="big full" onClick={empezar}><Icon name="play" size={24} /> Empezar Partida</button>
          </section>
        </>
      )}

      {paso === 'jugando' && gridActual && (
        <section className="game">
          <div className="hud space-between">
            <div className={`eq-badge ${turno === 'X' ? 'active-x' : ''}`}><strong>Azul (X)</strong>: {equipos.X.map(j => j.nombre).join(', ')}</div>
            <div className={`eq-badge ${turno === 'O' ? 'active-o' : ''}`}><strong>Rojo (O)</strong>: {equipos.O.map(j => j.nombre).join(', ')}</div>
          </div>

          <div className="grid-board-container">
            <div className="grid-board">
              <div className="grid-cell header empty"></div>
              {gridActual.columnas.map((col, i) => (<div key={`c-${i}`} className="grid-cell header col-header">{col}</div>))}
              {gridActual.filas.map((fila, fIndex) => (
                <React.Fragment key={`row-${fIndex}`}>
                  <div className="grid-cell header row-header">{fila}</div>
                  {[0, 1, 2].map((cIndex) => {
                    const index = fIndex * 3 + cIndex;
                    const valor = tablero[index];
                    return (
                      <div key={index} className={`grid-cell interactable ${valor === 'X' ? 'cell-x' : valor === 'O' ? 'cell-o' : ''}`} onClick={() => abrirCelda(index)}>
                        {valor && <span className="cell-mark">{valor}</span>}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>

          {celdaActiva !== null && (
            <div className="rg-modal-fondo">
              <div className="rg-modal grid-modal" onClick={(e) => e.stopPropagation()}>
                <h3 style={{ textAlign: 'center', marginBottom: '1rem', color: '#1e293b' }}>Respuesta Equipo {turno === 'X' ? 'Azul' : 'Rojo'}</h3>
                <div className="grid-reto">
                  <span className="grid-reto-cat">{gridActual.filas[Math.floor(celdaActiva / 3)]}</span>
                  <Icon name="close" size={20} color="#64748b" />
                  <span className="grid-reto-cat">{gridActual.columnas[celdaActiva % 3]}</span>
                </div>
                <div className="timer" style={{ marginTop: '1.5rem' }}><div className={`timer-bar${restante <= 15 ? ' low' : ''}`} style={{ width: `${(restante / TIEMPO_S) * 100}%` }} /></div>
                <p className="timer-text" style={{ marginBottom: '1.5rem' }}><Icon name="clock" size={16} />{restante} s</p>
                
                {!feedback ? (
                  <form onSubmit={validarRespuesta}>
                    <input type="text" placeholder="Escribe el jugador..." value={respuestaInput} onChange={(e) => setRespuestaInput(e.target.value)} autoFocus style={{ width: '100%', padding: '0.8rem', marginBottom: '1rem', border: '2px solid #cbd5e1', borderRadius: '8px' }} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <button type="submit" className="ok" disabled={!respuestaInput.trim()}><Icon name="check" size={20} /> Validar</button>
                      <button type="button" className="secondary danger" onClick={() => procesarFallo("Pasar")}>No lo sé</button>
                    </div>
                  </form>
                ) : (
                  <div style={{ padding: '1rem', textAlign: 'center', background: feedback.tipo === 'success' ? '#dcfce7' : '#fee2e2', color: feedback.tipo === 'success' ? '#15803d' : '#991b1b', borderRadius: '8px', fontWeight: 'bold' }}>
                    {feedback.msj}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      )}

      {paso === 'final' && (
        <section className="game">
          <div className="end-card">
            <span className="end-icon"><Icon name="trophy" size={48} /></span>
            <h1 className="title">{ganador === 'Empate' ? '¡Es un Empate!' : `¡El Equipo ${ganador === 'X' ? 'Azul' : 'Rojo'} gana!`}</h1>
          </div>
          <div className="actions">
            <button onClick={() => setPaso('config')}><Icon name="refresh" size={20} /> Jugar de nuevo</button>
            <button className="secondary danger" onClick={() => (onExit ? onExit() : navigate('/'))}><Icon name="door" size={20} /> Salir al menú</button>
          </div>
        </section>
      )}
    </div>
  );
}
