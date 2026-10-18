import React, { useState } from 'react';
import Icon from '../../components/Icon.jsx';
import GameIntro from '../../components/GameIntro.jsx';
import './Telepatia.css';

const PALABRAS_BASE = [
  'PLAYA', 'FÚTBOL', 'PIZZA', 'VERANO', 'VIAJE', 'NOCHE', 'CINE', 'MÚSICA',
  'CHOCOLATE', 'MONTAÑA', 'DINERO', 'FIESTA', 'PERRO', 'BODAS', 'UNIVERSO',
  'SUPERHÉROE', 'INVIERNO', 'CAFÉ', 'ISLA', 'CASTILLO', 'AVIÓN', 'BOSQUE'
];

const MIN_JUGADORES = 4;
const MAX_JUGADORES = 20;
const MAX_RONDAS = 15;

const nombresPorDefecto = (n) => Array.from({ length: n }, (_, i) => `Jugador ${i + 1}`);

export default function TelepatiaLocal({ onSalir }) {
  const [paso, setPaso] = useState('setup'); // setup | ronda | registrar_coincidencia | registrar_no_coincidencia | resumen_ronda | fin
  const [numJugadores, setNumJugadores] = useState(6);
  const [nombres, setNombres] = useState(nombresPorDefecto(6));

  const [jugadores, setJugadores] = useState([]);
  const [rondaNum, setRondaNum] = useState(1);
  const [palabraActual, setPalabraActual] = useState('');
  const [palabraSiguiente, setPalabraSiguiente] = useState('');
  
  // Para registrar coincidencias
  const [seleccionados, setSeleccionados] = useState([]);
  const [palabraCoincididaInput, setPalabraCoincididaInput] = useState('');
  const [palabraNoCoincididaInput, setPalabraNoCoincididaInput] = useState('');
  const [logRonda, setLogRonda] = useState('');

  const cambiarNumJugadores = (ev) => {
    const k = Number(ev.target.value);
    setNumJugadores(k);
    setNombres((prev) => (k > prev.length ? [...prev, ...nombresPorDefecto(k).slice(prev.length)] : prev.slice(0, k)));
  };

  const iniciarPartida = () => {
    const jugs = nombres.map((n, i) => ({
      id: i + 1,
      nombre: n.trim() || `Jugador ${i + 1}`,
      puntos: 0,
      racha: 0
    }));

    const palabraInicial = PALABRAS_BASE[Math.floor(Math.random() * PALABRAS_BASE.length)];

    setJugadores(jugs);
    setRondaNum(1);
    setPalabraActual(palabraInicial);
    setPaso('ronda');
  };

  const toggleSeleccion = (id) => {
    setSeleccionados(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const confirmarCoincidencia = () => {
    if (seleccionados.length < 2 || !palabraCoincididaInput.trim()) return;

    const palabraUsada = palabraCoincididaInput.trim().toUpperCase();

    // Actualizamos rachas y puntos
    const jugsActualizados = jugadores.map(j => {
      if (seleccionados.includes(j.id)) {
        const nuevaRacha = j.racha + 1;
        return {
          ...j,
          puntos: j.puntos + nuevaRacha, // 1er match: 1 pt, 2do match: 2 pts, etc.
          racha: nuevaRacha
        };
      }
      return { ...j, racha: 0 };
    });

    const nombresCoincidentes = jugsActualizados
      .filter(j => seleccionados.includes(j.id))
      .map(j => j.nombre)
      .join(', ');

    setJugadores(jugsActualizados);
    setPalabraSiguiente(palabraUsada);
    setLogRonda(`¡Conexión mental! ${nombresCoincidentes} coincidieron con la palabra «${palabraUsada}».`);
    setPaso('resumen_ronda');
  };

  const confirmarSinCoincidencia = () => {
    const palabraNueva = palabraNoCoincididaInput.trim().toUpperCase() || PALABRAS_BASE[Math.floor(Math.random() * PALABRAS_BASE.length)];

    // Reseteamos todas las rachas
    const jugsActualizados = jugadores.map(j => ({ ...j, racha: 0 }));

    setJugadores(jugsActualizados);
    setPalabraSiguiente(palabraNueva);
    setLogRonda(`Nadie coincidió en esta ronda. Para la siguiente ronda se ha elegido «${palabraNueva}».`);
    setPaso('resumen_ronda');
  };

  const siguienteRonda = () => {
    if (rondaNum >= MAX_RONDAS) {
      setPaso('fin');
      return;
    }

    setRondaNum(prev => prev + 1);
    setPalabraActual(palabraSiguiente);
    setSeleccionados([]);
    setPalabraCoincididaInput('');
    setPalabraNoCoincididaInput('');
    setPaso('ronda');
  };

  const ranking = [...jugadores].sort((a, b) => b.puntos - a.puntos);
  const maxPuntos = ranking.length > 0 ? ranking[0].puntos : 0;
  const ganadores = maxPuntos > 0 ? ranking.filter(j => j.puntos === maxPuntos) : [];

  return (
    <div className="tel-contenedor">
      {/* 1. SETUP */}
      {paso === 'setup' && (
        <section className="game">
          <GameIntro gameId="telepatia" titulo="Telepatía (Un solo dispositivo)" />

          <div className="panel">
            <h3 className="panel-title"><Icon name="users" size={22} /> Jugadores (4 a 20)</h3>
            <label className="field-label" htmlFor="tel-num">Número de participantes</label>
            <select id="tel-num" value={numJugadores} onChange={cambiarNumJugadores}>
              {Array.from({ length: MAX_JUGADORES - MIN_JUGADORES + 1 }, (_, i) => i + MIN_JUGADORES).map((k) => (
                <option key={k} value={k}>{k} jugadores</option>
              ))}
            </select>

            <span className="field-label" style={{ marginTop: '1rem' }}>Nombres</span>
            <div className="names-grid">
              {nombres.map((nombre, i) => (
                <input
                  key={i}
                  type="text"
                  value={nombre}
                  maxLength={20}
                  placeholder={`Jugador ${i + 1}`}
                  onChange={(ev) => setNombres(p => p.map((x, k) => k === i ? ev.target.value : x))}
                />
              ))}
            </div>
          </div>

          <div className="actions">
            <button className="big full" onClick={iniciarPartida}>
              <Icon name="play" size={22} /> Empezar Partida (15 rondas)
            </button>
            <button className="secondary full" onClick={onSalir}>Volver</button>
          </div>
        </section>
      )}

      {/* 2. RONDA: MOSTRAR PALABRA */}
      {paso === 'ronda' && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="flagFinish" size={18} />Ronda {rondaNum} de {MAX_RONDAS}</span>
            <span className="chip alt"><Icon name="zap" size={18} />En voz alta</span>
          </div>

          <div className="panel center">
            <p className="field-label">La palabra de esta ronda es:</p>
            <div className="tel-palabra-card">
              <span className="tel-palabra-titulo">Palabra Base</span>
              <h1 className="tel-palabra-texto">{palabraActual}</h1>
            </div>

            <p className="hint" style={{ fontSize: '1.05rem', lineHeight: '1.4', margin: '1rem 0' }}>
              A la de tres, todos los jugadores deben decir <strong>en voz alta a la vez</strong> una palabra relacionada con <strong>{palabraActual}</strong>.
            </p>

            <div className="lb-form" style={{ marginTop: '1.5rem' }}>
              <button 
                className="big full" 
                onClick={() => {
                  setSeleccionados([]);
                  setPalabraCoincididaInput('');
                  setPaso('registrar_coincidencia');
                }}
              >
                <Icon name="check" size={22} /> ¡Varios jugadores han coincidido!
              </button>
              
              <button 
                className="secondary full" 
                style={{ marginTop: '0.8rem' }}
                onClick={() => {
                  setPalabraNoCoincididaInput('');
                  setPaso('registrar_no_coincidencia');
                }}
              >
                Nadie ha coincidido
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 3. REGISTRAR COINCIDENCIA */}
      {paso === 'registrar_coincidencia' && (
        <section className="game">
          <div className="panel center">
            <h2 className="title">¿Quiénes han coincidido?</h2>
            <p className="hint">Selecciona los jugadores que dijeron exactamente la misma palabra:</p>

            <div className="tel-check-grid">
              {jugadores.map(j => {
                const sel = seleccionados.includes(j.id);
                return (
                  <button
                    key={j.id}
                    type="button"
                    className={`tel-check-btn ${sel ? 'seleccionado' : ''}`}
                    onClick={() => toggleSeleccion(j.id)}
                  >
                    {sel ? '✅' : '⚪'} {j.nombre}
                  </button>
                );
              })}
            </div>

            <label className="field-label" style={{ textAlign: 'left', marginTop: '1rem' }}>
              ¿Qué palabra dijeron? (Será la palabra de la siguiente ronda)
            </label>
            <input
              type="text"
              className="tel-input-palabra"
              placeholder="PALABRA COINCIDENTE"
              value={palabraCoincididaInput}
              onChange={(e) => setPalabraCoincididaInput(e.target.value.toUpperCase())}
              autoFocus
            />

            <div className="actions" style={{ marginTop: '1.4rem' }}>
              <button
                className="big full"
                disabled={seleccionados.length < 2 || !palabraCoincididaInput.trim()}
                onClick={confirmarCoincidencia}
              >
                <Icon name="check" size={22} /> Guardar coincidencia
              </button>
              <button className="secondary full" onClick={() => setPaso('ronda')}>
                Cancelar
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 4. REGISTRAR NO COINCIDENCIA */}
      {paso === 'registrar_no_coincidencia' && (
        <section className="game">
          <div className="panel center">
            <h2 className="title">Sin coincidencias</h2>
            <p className="hint">
              Escribe una de las palabras que haya dicho algún jugador para que sea la base de la siguiente ronda:
            </p>

            <input
              type="text"
              className="tel-input-palabra"
              placeholder="PALABRA DE LA SIGUIENTE RONDA"
              value={palabraNoCoincididaInput}
              onChange={(e) => setPalabraNoCoincididaInput(e.target.value.toUpperCase())}
              autoFocus
            />

            <div className="actions" style={{ marginTop: '1.4rem' }}>
              <button className="big full" onClick={confirmarSinCoincidencia}>
                <Icon name="forward" size={22} /> Continuar con esta palabra
              </button>
              <button className="secondary full" onClick={() => setPaso('ronda')}>
                Cancelar
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 5. RESUMEN DE RONDA */}
      {paso === 'resumen_ronda' && (
        <section className="game">
          <div className="end-card">
            <span className="end-icon"><Icon name="zap" size={44} /></span>
            <p className="categoria">Fin de la ronda {rondaNum}</p>
            <h1 className="title">Puntuaciones</h1>
            <p className="reveal">{logRonda}</p>
          </div>

          <div className="panel" style={{ marginTop: '1rem' }}>
            <h3 className="panel-title"><Icon name="trophy" size={20} /> Marcador</h3>
            <div className="scoreboard">
              {ranking.map((j, i) => (
                <div key={j.id} className={`score-row ${i === 0 && j.puntos > 0 ? 'first' : ''}`}>
                  <span className="score-name">
                    {j.nombre} {j.racha > 1 && <span className="badge" style={{background:'#dcfce7', color:'#166534'}}>🔥 Racha {j.racha}</span>}
                  </span>
                  <span className="score-pts">{j.puntos} {j.puntos === 1 ? 'pto' : 'ptos'}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="actions" style={{ marginTop: '1.2rem' }}>
            <button className="big full" onClick={siguienteRonda}>
              <Icon name="play" size={20} />
              {rondaNum >= MAX_RONDAS ? 'Ver Podio Final' : `Ir a Ronda ${rondaNum + 1}`}
            </button>
            <button className="secondary danger full" onClick={() => setPaso('fin')}>
              Finalizar partida ahora
            </button>
          </div>
        </section>
      )}

      {/* 6. PODIO FINAL */}
      {paso === 'fin' && (
        <section className="game">
          <div className="end-card">
            <span className="end-icon"><Icon name="trophy" size={44} /></span>
            <h1 className="title">¡Partida Terminada!</h1>
            <p className="final-score" style={{ color: '#0891b2' }}>
              {ganadores.length === 0
                ? 'Nadie ha conseguido puntos.'
                : `🏆 Ganador(es): ${ganadores.map(g => g.nombre).join(', ')} con ${maxPuntos} pts`}
            </p>
          </div>

          <div className="panel reveal-panel" style={{ marginTop: '1rem' }}>
            <h3 className="reveal-title"><Icon name="trophy" size={20} /> Clasificación Final</h3>
            <div className="scoreboard">
              {ranking.map((j, i) => (
                <div key={j.id} className={`score-row ${j.puntos === maxPuntos && maxPuntos > 0 ? 'first' : ''}`}>
                  <span className="score-name">{i + 1}. {j.nombre}</span>
                  <span className="score-pts">{j.puntos} ptos</span>
                </div>
              ))}
            </div>
          </div>

          <div className="actions" style={{ marginTop: '1.2rem' }}>
            <button className="big full" onClick={() => setPaso('setup')}>
              <Icon name="refresh" size={20} /> Jugar otra vez
            </button>
            <button className="secondary full" onClick={onSalir}>
              Salir al menú
            </button>
          </div>
        </section>
      )}
    </div>
  );
}