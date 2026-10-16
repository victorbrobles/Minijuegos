// client/src/games/Impostor/ImpostorLocal.jsx
import React, { useState } from 'react';
import Icon from '../../components/Icon.jsx';
import GameIntro from '../../components/GameIntro.jsx';
import './Impostor.css';

const MIN_JUGADORES = 3;
const MAX_JUGADORES = 20;

export default function ImpostorLocal({ onVolver, onExit }) {
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

  const [palabraSecreta, setPalabraSecreta] = useState('');
  const [restriccion, setRestriccion] = useState('');
  const [impostorId, setImpostorId] = useState(null);
  const [jugadorInicialId, setJugadorInicialId] = useState(null);

  const [indiceReparto, setIndiceReparto] = useState(0);
  const [revelado, setRevelado] = useState(false);

  const [ganador, setGanador] = useState('impostor');
  const [rondasSobrevividas, setRondasSobrevividas] = useState(1);
  const [puntosRonda, setPuntosRonda] = useState({});
  const [rondaActual, setRondaActual] = useState(1);

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
    prepararRonda(listaActualizada);
  };

  const prepararRonda = async (lista = jugadores) => {
    try {
      const res = await fetch('/api/impostor/palabra');
      const data = await res.json();
      if (data.success) {
        setPalabraSecreta(data.palabra);
        setRestriccion(data.restriccion);

        const impElegido = lista[Math.floor(Math.random() * lista.length)];
        setImpostorId(impElegido.id);

        const inicialElegido = lista[Math.floor(Math.random() * lista.length)];
        setJugadorInicialId(inicialElegido.id);

        setIndiceReparto(0);
        setRevelado(false);
        setFase('reparto');
      }
    } catch (err) {
      console.error('Error al preparar ronda de impostor:', err);
    }
  };

  const pasarSiguienteJugadorReparto = () => {
    setRevelado(false);
    if (indiceReparto + 1 < jugadores.length) {
      setIndiceReparto((prev) => prev + 1);
    } else {
      setFase('en_juego');
    }
  };

  const jugadorEnTurnoReparto = jugadores[indiceReparto];
  const esImpostorEnTurno = jugadorEnTurnoReparto?.id === impostorId;

  const resolverPartida = () => {
    const scores = {};
    jugadores.forEach((j) => { scores[j.id] = 0; });

    const rondas = parseInt(rondasSobrevividas, 10) || 0;
    const ptsImpostor = (ganador === 'impostor' ? 10 : 0) + (rondas * 3);
    scores[impostorId] = ptsImpostor;

    if (ganador === 'pueblo') {
      jugadores.forEach((j) => {
        if (j.id !== impostorId) {
          scores[j.id] = 3;
        }
      });
    }

    setPuntosRonda(scores);

    setPuntos((prev) => {
      const act = { ...prev };
      Object.entries(scores).forEach(([id, delta]) => {
        act[id] = (act[id] || 0) + delta;
      });
      return act;
    });

    setFase('resultados');
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
            title="Reglas de Miente como puedas"
          >
            <span className="aprox-btn-ayuda-signo">?</span>
          </button>

          {modalAyuda && (
            <div className="rg-modal-fondo" onClick={() => setModalAyuda(false)}>
              <div className="rg-modal aprox-modal-ayuda" onClick={(e) => e.stopPropagation()}>
                <div className="aprox-modal-header">
                  <h3>¿Cómo se juega a Miente como puedas?</h3>
                </div>

                <div className="aprox-modal-cuerpo">
                  <p><strong>1. Dinámica del juego:</strong></p>
                  <ul>
                    <li>Participan de 3 a 20 jugadores. Uno de ellos será el impostor en secreto.</li>
                    <li>Todos ven en privado la palabra secreta excepto el impostor.</li>
                    <li>Hay una <strong>restricción obligatoria común</strong> para todos.</li>
                    <li>Por turnos en voz alta, cada uno dice una pista sin saltarse la restricción.</li>
                  </ul>
                  <p><strong>2. Puntuación:</strong></p>
                  <div className="aprox-tabla-puntos">
                    <div className="aprox-puntos-fila acierto" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
                      <span>🎭 Victoria del Impostor</span>
                      <strong>+10 puntos</strong>
                    </div>
                    <div className="aprox-puntos-fila cercana">
                      <span>⏳ Rondas sobrevividas</span>
                      <strong>+3 puntos por ronda superada</strong>
                    </div>
                    <div className="aprox-puntos-fila acierto">
                      <span>👥 Victoria del Pueblo</span>
                      <strong>+3 puntos para cada inocente</strong>
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
          <GameIntro gameId="impostor" titulo="Miente como puedas (Un solo dispositivo)" />

          <div className="panel">
            <div className="hud" style={{ marginBottom: '1rem' }}>
              <button className="btn-back-inline" onClick={onVolver}>
                &larr; Cambiar modo
              </button>
            </div>

            <h3 className="panel-title"><Icon name="users" size={22} /> Participantes</h3>
            <label className="field-label" htmlFor="num-jugadores-imp">
              Número de jugadores ({MIN_JUGADORES} a {MAX_JUGADORES})
            </label>
            <select
              id="num-jugadores-imp"
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
            <Icon name="play" size={24} /> ¡Empezar Partida!
          </button>
        </section>
      )}

      {/* 2. REPARTO SECRETO */}
      {fase === 'reparto' && jugadorEnTurnoReparto && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="flagFinish" size={18} />Ronda {rondaActual}</span>
            <span className="chip alt">Paso secreto ({indiceReparto + 1}/{jugadores.length})</span>
          </div>

          <div className="starter">
            <Icon name="whois" size={28} />
            <p>Pasa el dispositivo a: <strong>{jugadorEnTurnoReparto.nombre}</strong></p>
          </div>

          {!revelado ? (
            <div className="panel aprox-pregunta-card" style={{ padding: '2.5rem 1.5rem' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🔒</div>
              <h2 className="aprox-pregunta-texto">{jugadorEnTurnoReparto.nombre}</h2>
              <p className="field-label" style={{ marginTop: '0.6rem' }}>
                Asegúrate de que nadie más esté mirando la pantalla antes de revelar tu palabra.
              </p>
              <button
                type="button"
                className="big full"
                style={{ marginTop: '1.5rem' }}
                onClick={() => setRevelado(true)}
              >
                <Icon name="eye" size={22} /> Ver mi palabra secreta
              </button>
            </div>
          ) : (
            <div className="panel aprox-pregunta-card" style={{ padding: '2rem 1.5rem' }}>
              <span className={`aprox-badge-pregunta ${esImpostorEnTurno ? 'personal' : ''}`}>
                {esImpostorEnTurno ? '¡Eres el Impostor!' : 'Tu palabra secreta'}
              </span>

              <h1 style={{
                fontSize: esImpostorEnTurno ? '2rem' : '2.4rem',
                fontWeight: '900',
                color: esImpostorEnTurno ? '#dc2626' : '#2563eb',
                margin: '0.8rem 0'
              }}>
                {esImpostorEnTurno ? '¡ERES EL IMPOSTOR!' : palabraSecreta}
              </h1>

              {esImpostorEnTurno ? (
                <p style={{ color: '#64748b', fontSize: '0.95rem', margin: '0.5rem 0 1.5rem' }}>
                  No conoces la palabra. Escucha con atención a los demás y usa la restricción para disimular.
                </p>
              ) : (
                <p style={{ color: '#64748b', fontSize: '0.95rem', margin: '0.5rem 0 1.5rem' }}>
                  Describe la palabra sin decirla directamente y respetando la restricción obligatoria.
                </p>
              )}

              <div className="imp-restriccion-box">
                <span className="imp-restriccion-tag">⚠️ RESTRICCIÓN PARA TODOS</span>
                <p className="imp-restriccion-texto">{restriccion}</p>
              </div>

              <button
                type="button"
                className="big full"
                style={{ marginTop: '1.8rem' }}
                onClick={pasarSiguienteJugadorReparto}
              >
                <Icon name="check" size={22} /> Ya lo he visto / Siguiente
              </button>
            </div>
          )}
        </section>
      )}

      {/* 3. EN JUEGO: HABLANDO ENTRE ELLOS */}
      {fase === 'en_juego' && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="flagFinish" size={18} />Ronda {rondaActual}</span>
            <span className="chip alt">Debate en curso</span>
          </div>

          <div className="starter">
            <Icon name="dice" size={28} />
            <p>Empieza hablando: <strong>{jugadores.find((j) => j.id === jugadorInicialId)?.nombre}</strong></p>
          </div>

          <div className="panel aprox-pregunta-card" style={{ padding: '2rem 1.5rem' }}>
            <span className="aprox-badge-pregunta">Partida en juego</span>
            <h2 className="aprox-pregunta-texto" style={{ margin: '0.8rem 0' }}>
              ¡Hablad por turnos y descubrid al impostor!
            </h2>
            <p className="field-label">
              Recordad que todos debéis respetar la restricción al dar vuestras pistas:
            </p>

            <div className="imp-restriccion-box" style={{ marginTop: '1.2rem' }}>
              <span className="imp-restriccion-tag">⚠️ RESTRICCIÓN ACTIVA</span>
              <p className="imp-restriccion-texto">{restriccion}</p>
            </div>
          </div>

          <div className="actions">
            <button className="big full" onClick={() => setFase('resolucion')}>
              <Icon name="flagFinish" size={22} /> Finalizar partida / Resolver
            </button>
          </div>
        </section>
      )}

      {/* 4. RESOLUCIÓN */}
      {fase === 'resolucion' && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="flagFinish" size={18} />Ronda {rondaActual}</span>
            <span className="chip alt">Resolución</span>
          </div>

          <div className="starter">
            <Icon name="trophy" size={28} />
            <p>El impostor era: <strong>{jugadores.find((j) => j.id === impostorId)?.nombre}</strong></p>
          </div>

          <div className="panel aprox-pregunta-card">
            <span className="aprox-badge-pregunta">Datos de la partida</span>
            <div style={{ margin: '0.8rem 0', fontSize: '1.2rem', color: '#1e1b4b' }}>
              Palabra secreta: <strong style={{ color: '#2563eb' }}>{palabraSecreta}</strong>
            </div>
          </div>

          <div className="panel" style={{ textAlign: 'center' }}>
            <h3 className="panel-title" style={{ justifyContent: 'center' }}>¿Quién ha ganado la partida?</h3>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button
                type="button"
                className={`imp-btn-ganador ${ganador === 'impostor' ? 'activa' : ''}`}
                onClick={() => setGanador('impostor')}
              >
                🎭 El Impostor (+10 pts)
              </button>
              <button
                type="button"
                className={`imp-btn-ganador ${ganador === 'pueblo' ? 'activa' : ''}`}
                onClick={() => setGanador('pueblo')}
              >
                👥 El Pueblo (+3 pts c/u)
              </button>
            </div>

            <div style={{ marginTop: '1.8rem' }}>
              <h3 className="panel-title" style={{ justifyContent: 'center' }}>
                ¿Cuántas rondas sobrevivió el impostor?
              </h3>
              <p className="field-label">(+3 puntos por ronda para el impostor)</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', margin: '0.8rem 0' }}>
                <button
                  type="button"
                  className="aprox-btn-ayuda"
                  style={{ position: 'static', width: '48px', height: '48px', fontSize: '1.5rem' }}
                  onClick={() => setRondasSobrevividas(Math.max(0, rondasSobrevividas - 1))}
                >
                  -
                </button>
                <span style={{ fontSize: '3rem', fontWeight: '900', color: '#4338ca', minWidth: '60px' }}>
                  {rondasSobrevividas}
                </span>
                <button
                  type="button"
                  className="aprox-btn-ayuda"
                  style={{ position: 'static', width: '48px', height: '48px', fontSize: '1.5rem' }}
                  onClick={() => setRondasSobrevividas(rondasSobrevividas + 1)}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <button className="big full" onClick={resolverPartida}>
            <Icon name="check" size={22} /> Calcular Puntuaciones
          </button>
        </section>
      )}

      {/* 5. RESULTADOS DE LA RONDA */}
      {fase === 'resultados' && (
        <section className="game">
          <div className="end-card aprox-resolucion-card">
            <span className="end-icon"><Icon name="trophy" size={44} /></span>
            <p className="categoria">Palabra: {palabraSecreta} | Impostor: {jugadores.find((j) => j.id === impostorId)?.nombre}</p>
            <h1 className="title">
              {ganador === 'impostor' ? '¡Victoria del Impostor!' : '¡Victoria del Pueblo!'}
            </h1>

            <div className="scoreboard" style={{ width: '100%', marginTop: '1.5rem' }}>
              <h3 className="section-title" style={{ margin: '0 0 0.8rem', textAlign: 'center' }}>
                Puntos de esta ronda
              </h3>
              {jugadores.map((j) => {
                const delta = puntosRonda[j.id] || 0;
                const esImp = j.id === impostorId;
                return (
                  <div key={j.id} className="score-row">
                    <span className="score-name">
                      {esImp ? '🎭 ' : '👤 '}
                      {j.nombre} {esImp && <em style={{ fontSize: '0.8rem', color: '#64748b' }}>(Impostor)</em>}
                    </span>
                    <span className="score-pts" style={{ color: delta > 0 ? '#10b981' : '#64748b' }}>
                      +{delta} pts
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="scoreboard" style={{ width: '100%', marginTop: '1.5rem' }}>
              <h3 className="section-title" style={{ margin: '0 0 0.8rem', textAlign: 'center' }}>
                Marcador acumulado
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
            <button onClick={() => {
              setRondaActual((r) => r + 1);
              prepararRonda();
            }}>
              <Icon name="play" size={20} /> Siguiente partida
            </button>
            <button className="secondary danger" onClick={() => setFase('final')}>
              <Icon name="flagFinish" size={20} /> Finalizar juego
            </button>
          </div>
        </section>
      )}

      {/* 6. PANTALLA FINAL */}
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