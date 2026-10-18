// client/src/games/QuienMas/QuienMasLocal.jsx
import { useState, useEffect, useRef } from 'react';
import './QuienMas.css';
import { useAdmin, adminHeaders } from '../../lib/admin.js';
import Icon from '../../components/Icon.jsx';
import GameIntro from '../../components/GameIntro.jsx';

const MIN_JUGADORES = 3;
const MAX_JUGADORES = 20;
const TIEMPO_VOTO = 30;

const nombresPorDefecto = (n) => Array.from({ length: n }, (_, i) => `Jugador ${i + 1}`);

function limpiarNombres(nombres) {
  const usados = new Set();
  return nombres.map((n, i) => {
    const base = n.trim() || `Jugador ${i + 1}`;
    let nombre = base;
    for (let k = 2; usados.has(nombre.toLowerCase()); k++) nombre = `${base} (${k})`;
    usados.add(nombre.toLowerCase());
    return nombre;
  });
}

export default function QuienMasLocal({ onVolver, onExit }) {
  const esAdmin = useAdmin();

  // Fases: 'setup' | 'cargando' | 'pasar' | 'votando' | 'resultado' | 'ranking'
  const [fase, setFase] = useState('setup');
  const [modalAyuda, setModalAyuda] = useState(false);

  // Configuración
  const [numJugadores, setNumJugadores] = useState(4);
  const [nombres, setNombres] = useState(nombresPorDefecto(4));
  const [categoria, setCategoria] = useState('normal');
  const [error, setError] = useState('');

  // Partida
  const [jugadores, setJugadores] = useState([]);
  const [puntos, setPuntos] = useState({});
  const [pregunta, setPregunta] = useState('');
  const [turno, setTurno] = useState(0);
  const [votos, setVotos] = useState({});
  const [resultado, setResultado] = useState(null);
  const [ronda, setRonda] = useState(0);
  const [reserva, setReserva] = useState([]);

  // Temporizador de 30s para votar
  const [tiempoRestante, setTiempoRestante] = useState(TIEMPO_VOTO);
  const timerRef = useRef(null);

  const jugadoresRef = useRef(jugadores);
  useEffect(() => {
    jugadoresRef.current = jugadores;
  }, [jugadores]);

  const categoriaActiva = esAdmin ? categoria : 'normal';

  const cambiarNumJugadores = (e) => {
    const n = Number(e.target.value);
    setNumJugadores(n);
    setNombres((prev) => (n > prev.length
      ? [...prev, ...nombresPorDefecto(n).slice(prev.length)]
      : prev.slice(0, n)));
  };

  const cambiarNombre = (idx, valor) => {
    setNombres((prev) => prev.map((n, i) => (i === idx ? valor : n)));
  };

  const nuevaRonda = (lista, jugs) => {
    if (lista.length === 0) {
      setFase('ranking');
      return;
    }
    setPregunta(lista[0]);
    setReserva(lista.slice(1));
    setVotos({});
    setResultado(null);
    setTurno(Math.floor(Math.random() * jugs.length));
    setFase('pasar');
  };

  const empezarPartida = async () => {
    const jugs = limpiarNombres(nombres);
    setNombres(jugs);
    setJugadores(jugs);
    setPuntos(Object.fromEntries(jugs.map((n) => [n, 0])));
    setError('');
    setFase('cargando');

    try {
      const res = await fetch(`/api/quienmas/preguntas?categoria=${categoriaActiva}`, { headers: adminHeaders() });
      if (!res.ok) throw new Error('No se pudieron cargar las preguntas.');
      const data = await res.json();
      const lista = [...(data.preguntas || [])].sort(() => Math.random() - 0.5);
      if (lista.length === 0) throw new Error('La lista de preguntas está vacía.');
      setRonda(1);
      nuevaRonda(lista, jugs);
    } catch (err) {
      setError(err.message || 'No se pudieron obtener las preguntas.');
      setFase('setup');
    }
  };

  const votar = (candidato) => {
    if (timerRef.current) clearInterval(timerRef.current);
    const jugadorActual = jugadores[turno];
    const nuevos = { ...votos, [jugadorActual]: candidato };
    setVotos(nuevos);
    if (Object.keys(nuevos).length >= jugadores.length) {
      calcularRonda(nuevos);
    } else {
      setTurno((t) => (t + 1) % jugadores.length);
      setFase('pasar');
    }
  };

  const votarRef = useRef(votar);
  useEffect(() => {
    votarRef.current = votar;
  });

  // Temporizador de 30 segundos durante la votación
  useEffect(() => {
    if (fase !== 'votando') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    setTiempoRestante(TIEMPO_VOTO);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          const jActuales = jugadoresRef.current;
          if (jActuales && jActuales.length > 0) {
            const candidatoAleatorio = jActuales[Math.floor(Math.random() * jActuales.length)];
            votarRef.current(candidatoAleatorio);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fase, turno]);

  const calcularRonda = (finales) => {
    const recuento = Object.fromEntries(jugadores.map((n) => [n, 0]));
    Object.values(finales).forEach((c) => { recuento[c] += 1; });

    const maximo = Math.max(...Object.values(recuento));
    const masVotados = jugadores.filter((n) => recuento[n] === maximo);
    const empate = masVotados.length > 1;
    const ganador = empate ? null : masVotados[0];

    const ganados = Object.fromEntries(jugadores.map((n) => [n, !empate && finales[n] === ganador ? 1 : 0]));
    setPuntos((prev) => Object.fromEntries(jugadores.map((n) => [n, (prev[n] || 0) + ganados[n]])));
    setResultado({ recuento, maximo, masVotados, empate, ganador, votos: finales, ganados });
    setFase('resultado');
  };

  const siguientePregunta = () => {
    setRonda((r) => r + 1);
    nuevaRonda(reserva, jugadores);
  };

  const jugadorTurno = jugadores[turno];
  const ranking = [...jugadores].sort((a, b) => (puntos[b] || 0) - (puntos[a] || 0));
  const maximoPuntos = ranking.length ? puntos[ranking[0]] || 0 : 0;
  const ganadores = maximoPuntos > 0 ? ranking.filter((n) => puntos[n] === maximoPuntos) : [];

  return (
    <div className="qm-contenedor">
      {/* AYUDA */}
      {fase === 'setup' && (
        <>
          <button
            type="button"
            className="btn-ayuda-flotante"
            onClick={() => setModalAyuda(true)}
            title="Reglas y funcionamiento"
          >
            <span className="btn-ayuda-flotante-signo">?</span>
          </button>

          {modalAyuda && (
            <div className="rg-modal-fondo" onClick={() => setModalAyuda(false)}>
              <div className="rg-modal modal-ayuda-juego" onClick={(e) => e.stopPropagation()}>
                <div className="modal-ayuda-header">
                  <span className="modal-ayuda-signo-title">?</span>
                  <h3>Cómo se juega a «¿De verdad os conocéis?»</h3>
                </div>

                <div className="modal-ayuda-cuerpo">
                  <p><strong>1. Votación secreta:</strong></p>
                  <ul>
                    <li>Aparece una pregunta sobre la personalidad del grupo.</li>
                    <li>Cada jugador, por turnos y pasándose el dispositivo, vota <strong>en secreto</strong> al jugador que mejor encaja.</li>
                    <li>Dispones de <strong>30 segundos</strong> para emitir tu voto. Si se agota el tiempo, se seleccionará un jugador al azar.</li>
                  </ul>
                  <p><strong>2. Puntuación:</strong></p>
                  <ul>
                    <li>Si votas al jugador <strong>más votado</strong>, sumas <strong>+1 punto</strong>.</li>
                    <li>Si hay <strong>empate</strong> en la primera posición, <strong>nadie suma puntos</strong>.</li>
                  </ul>
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

      {/* 1. SETUP */}
      {fase === 'setup' && (
        <section className="game" style={{ position: 'relative' }}>
          <GameIntro gameId="quienmas" titulo="¿De verdad os conocéis? (Un solo dispositivo)" />

          <div className="panel">
            <div className="hud" style={{ marginBottom: '1rem' }}>
              <button className="btn-back-inline" onClick={onVolver}>
                &larr; Cambiar modo
              </button>
            </div>

            <h3 className="panel-title"><Icon name="users" size={22} /> Participantes</h3>
            <label className="field-label" htmlFor="num-jugadores-qm">
              Número de jugadores ({MIN_JUGADORES} a {MAX_JUGADORES})
            </label>
            <select id="num-jugadores-qm" value={numJugadores} onChange={cambiarNumJugadores}>
              {Array.from({ length: MAX_JUGADORES - MIN_JUGADORES + 1 }, (_, i) => (
                <option key={i + MIN_JUGADORES} value={i + MIN_JUGADORES}>
                  {i + MIN_JUGADORES} jugadores
                </option>
              ))}
            </select>

            <span className="field-label">Nombres</span>
            <div className="names-grid">
              {nombres.map((nombre, idx) => (
                <input
                  key={idx}
                  type="text"
                  value={nombre}
                  onChange={(e) => cambiarNombre(idx, e.target.value)}
                  placeholder={`Jugador ${idx + 1}`}
                  maxLength={30}
                />
              ))}
            </div>
          </div>

          {esAdmin && (
            <div className="panel" style={{ marginTop: '1rem' }}>
              <h3 className="panel-title"><Icon name="lock" size={22} /> Preguntas (administrador)</h3>
              <label className="field-label" htmlFor="categoria-qm">Tipo de preguntas</label>
              <select id="categoria-qm" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                <option value="normal">Normal: para todos los públicos</option>
                <option value="picante">Picante: incómodas y comprometidas</option>
              </select>
            </div>
          )}

          {error && <p className="error" style={{ marginTop: '0.8rem' }}>{error}</p>}

          <button className="big full" onClick={empezarPartida} style={{ marginTop: '1rem' }}>
            <Icon name="play" size={24} /> ¡Empezar Partida!
          </button>
        </section>
      )}

      {/* 2. CARGANDO */}
      {fase === 'cargando' && (
        <section className="game">
          <p className="loading">Cargando preguntas…</p>
        </section>
      )}

      {/* 3. PASAR EL DISPOSITIVO */}
      {fase === 'pasar' && jugadorTurno && (
        <section className="game center">
          <p className="categoria"><Icon name="lock" size={16} />Ronda {ronda} · Voto secreto</p>
          <h1 className="title">
            Pasa el dispositivo a <span className="hl">{jugadorTurno}</span>
          </h1>
          <p className="hint">No mires la pantalla si no es tu turno para que el voto siga siendo secreto.</p>
          <button className="big full" onClick={() => setFase('votando')}>
            <Icon name="check" size={22} strokeWidth={2.5} /> Soy {jugadorTurno}, ¡estoy listo!
          </button>
        </section>
      )}

      {/* 4. VOTANDO */}
      {fase === 'votando' && jugadorTurno && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="users" size={18} />{jugadorTurno}</span>
            <span className="chip alt">
              <Icon name="flagFinish" size={18} />Ronda {ronda}
            </span>
          </div>

          <div className="panel qm-pregunta">
            <h2 className="title">{pregunta}</h2>
            <p className="hint">Elige al jugador que más encaja con la pregunta:</p>

            {/* Temporizador de 30 segundos */}
            <div
              className="timer"
              role="timer"
              style={{
                margin: '0.8rem 0 0.3rem',
                background: '#e2e8f0',
                borderRadius: '9999px',
                height: '8px',
                overflow: 'hidden'
              }}
            >
              <div
                className={`timer-bar ${tiempoRestante <= 10 ? 'low' : ''}`}
                style={{
                  width: `${(tiempoRestante / TIEMPO_VOTO) * 100}%`,
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
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                color: tiempoRestante <= 10 ? '#dc2626' : '#64748b',
                fontSize: '0.9rem',
                fontWeight: 700,
                margin: '0 0 1rem'
              }}
            >
              <Icon name="clock" size={16} />
              {tiempoRestante} s
            </p>

            <div className="names-grid">
              {jugadores.map((nombre) => (
                <button key={nombre} type="button" className="secondary" onClick={() => votar(nombre)}>
                  {nombre}
                  {nombre === jugadorTurno && <span className="badge">Tú</span>}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. RESULTADO DE LA RONDA */}
      {fase === 'resultado' && resultado && (
        <section className="game">
          <div className="end-card">
            <span className="end-icon"><Icon name={resultado.empate ? 'hourglass' : 'trophy'} size={44} /></span>
            <p className="categoria"><Icon name="flagFinish" size={16} />Ronda {ronda}</p>
            <h1 className="title">Votación de la ronda</h1>
            <p className="reveal">«{pregunta}»</p>

            <p className="final-score" style={{ marginTop: '1rem' }}>
              {resultado.empate
                ? <>¡Empate entre {resultado.masVotados.join(' y ')}! Nadie suma puntos</>
                : <>Más votado: {resultado.ganador} ({resultado.maximo} {resultado.maximo === 1 ? 'voto' : 'votos'})</>}
            </p>

            <div className="scoreboard">
              {jugadores.map((nombre) => {
                const n = resultado.recuento[nombre];
                return (
                  <div key={nombre} className={`score-row ${!resultado.empate && nombre === resultado.ganador ? 'first' : ''}`}>
                    <span className="score-name">{nombre}</span>
                    <span className="score-pts">{n} {n === 1 ? 'voto' : 'votos'}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="panel reveal-panel">
            <h3 className="reveal-title"><Icon name="eye" size={20} /> Desglose de votos</h3>
            <div className="reveal-list">
              {jugadores.map((nombre) => (
                <div key={nombre} className="reveal-row">
                  <span className="reveal-name">{nombre} votó a {resultado.votos[nombre]}</span>
                  <span className="reveal-card">{resultado.ganados[nombre] > 0 ? '+1 pto' : '0 ptos'}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="actions">
            <button className="big full" onClick={siguientePregunta}>
              <Icon name="play" size={20} /> Siguiente pregunta
            </button>
            <button className="secondary" onClick={() => setFase('ranking')}>
              <Icon name="trophy" size={20} /> Ver clasificación
            </button>
          </div>
        </section>
      )}

      {/* 6. CLASIFICACIÓN */}
      {fase === 'ranking' && (
        <section className="game">
          <div className="end-card">
            <span className="end-icon"><Icon name="crown" size={44} /></span>
            <p className="categoria"><Icon name="flagFinish" size={16} />Rondas jugadas: {ronda}</p>
            <h1 className="title">Puntuación total</h1>
            <p className="final-score">
              {ganadores.length === 0
                ? 'Nadie ha conseguido puntos todavía'
                : ganadores.length === 1
                ? <>¡{ganadores[0]} lidera con {maximoPuntos} {maximoPuntos === 1 ? 'punto' : 'puntos'}!</>
                : <>Empate en cabeza: {ganadores.join(', ')} con {maximoPuntos} pts</>}
            </p>

            <div className="scoreboard">
              {ranking.map((nombre, i) => {
                const lider = maximoPuntos > 0 && puntos[nombre] === maximoPuntos;
                return (
                  <div key={nombre} className={`score-row ${lider ? 'first' : ''}`}>
                    <span className="score-name">
                      {lider ? <Icon name="crown" size={22} /> : <span className="pos">{i + 1}</span>}
                      {nombre}
                    </span>
                    <span className="score-pts">{puntos[nombre] || 0} pts</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="actions">
            <button className="big full" onClick={siguientePregunta}>
              <Icon name="play" size={20} /> Continuar jugando
            </button>
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