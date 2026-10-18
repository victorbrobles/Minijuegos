// client/src/games/Buscaminas/BuscaminasLocal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import GameIntro from '../../components/GameIntro.jsx';
import CategoryCard from '../../components/CategoryCard.jsx';
import './Buscaminas.css';

const MIN_JUGADORES = 3;
const MAX_JUGADORES = 8;
const MAX_RONDAS = 10;
const TOTAL_CORRECTOS = 10;
const TOTAL_MINAS = 5;
const TIEMPO_TURNO = 30;

export default function BuscaminasLocal({ onVolver, onExit }) {
  const navigate = useNavigate();

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

  const [categorias, setCategorias] = useState([]);
  const [categoriaElegida, setCategoriaElegida] = useState(null);
  const [rondaActual, setRondaActual] = useState(1);
  const [tablerosUsados, setTablerosUsados] = useState([]);

  const [consigna, setConsigna] = useState('');
  const [casillas, setCasillas] = useState([]);
  const [eliminadosRonda, setEliminadosRonda] = useState([]);
  const [ordenTurnoRonda, setOrdenTurnoRonda] = useState([]);
  const [indiceTurno, setIndiceTurno] = useState(0);

  const [explosionModal, setExplosionModal] = useState(null);
  const [motivoFinRonda, setMotivoFinRonda] = useState('');

  const [tiempoRestante, setTiempoRestante] = useState(TIEMPO_TURNO);
  const timerRef = useRef(null);

  useEffect(() => {
    fetch('/api/buscaminas/categorias')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setCategorias(d.categorias);
      })
      .catch((err) => console.error('Error al cargar categorías de buscaminas:', err));
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

  const irACategorias = () => {
    const listaActualizada = jugadores.map((j) => ({
      ...j,
      nombre: j.nombre.trim() || `Jugador ${j.id}`
    }));
    setJugadores(listaActualizada);

    const scores = {};
    listaActualizada.forEach((j) => { scores[j.id] = 0; });
    setPuntos(scores);

    setRondaActual(1);
    setTablerosUsados([]);
    setFase('categoria');
  };

  const iniciarRondaConCategoria = async (catId) => {
    setCategoriaElegida(catId);
    try {
      const res = await fetch('/api/buscaminas/tablero', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoria: catId, usados: tablerosUsados })
      });
      const data = await res.json();

      if (data.success) {
        setConsigna(data.consigna);
        setCasillas(data.casillas.map((c, idx) => ({ ...c, id: idx, descubierta: false })));
        setTablerosUsados((prev) => [...prev, data.tableroId]);
        setEliminadosRonda([]);

        const ids = jugadores.map((j) => j.id);
        const primerIdx = Math.floor(Math.random() * ids.length);
        const orden = [];
        for (let i = 0; i < ids.length; i++) {
          orden.push(ids[(primerIdx + i) % ids.length]);
        }
        setOrdenTurnoRonda(orden);
        setIndiceTurno(0);
        setExplosionModal(null);
        setMotivoFinRonda('');
        setFase('pasar_turno');
      }
    } catch (err) {
      console.error('Error al iniciar tablero buscaminas:', err);
    }
  };

  const jugadorActivoId = ordenTurnoRonda[indiceTurno];
  const jugadorActivo = jugadores.find((j) => j.id === jugadorActivoId);

  const avanzarTurno = (nuevosEliminados = eliminadosRonda) => {
    const vivos = ordenTurnoRonda.filter((id) => !nuevosEliminados.includes(id));
    if (vivos.length === 0) return;

    let proxIndice = (indiceTurno + 1) % ordenTurnoRonda.length;
    while (nuevosEliminados.includes(ordenTurnoRonda[proxIndice])) {
      proxIndice = (proxIndice + 1) % ordenTurnoRonda.length;
    }
    setIndiceTurno(proxIndice);
    setFase('pasar_turno');
  };

  const avanzarTurnoRef = useRef();
  useEffect(() => {
    avanzarTurnoRef.current = avanzarTurno;
  });

  // Temporizador de turno
  useEffect(() => {
    if (fase !== 'jugando') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    setTiempoRestante(TIEMPO_TURNO);
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          if (avanzarTurnoRef.current) avanzarTurnoRef.current(); // Pierde el turno
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fase, indiceTurno]);

  const seleccionarCasilla = (casilla) => {
    if (casilla.descubierta || !jugadorActivo) return;

    if (timerRef.current) clearInterval(timerRef.current);

    const nuevasCasillas = casillas.map((c) =>
      c.id === casilla.id ? { ...c, descubierta: true } : c
    );
    setCasillas(nuevasCasillas);

    const correctasDescubiertas = nuevasCasillas.filter((c) => c.descubierta && c.correcto).length;
    const minasExplotadas = nuevasCasillas.filter((c) => c.descubierta && !c.correcto).length;

    if (casilla.correcto) {
      setPuntos((prev) => ({
        ...prev,
        [jugadorActivo.id]: (prev[jugadorActivo.id] || 0) + casilla.puntos
      }));

      if (correctasDescubiertas >= TOTAL_CORRECTOS) {
        setMotivoFinRonda('¡Se han descubierto los 10 aciertos del tablero!');
        setFase('ronda_fin');
      } else {
        avanzarTurno();
      }
    } else {
      const nuevosEliminados = [...eliminadosRonda, jugadorActivo.id];
      setEliminadosRonda(nuevosEliminados);

      setExplosionModal({
        jugadorNombre: jugadorActivo.nombre,
        casillaTexto: casilla.texto
      });

      if (minasExplotadas >= TOTAL_MINAS) {
        setMotivoFinRonda('¡Han explotado las 5 bombas del tablero!');
      } else if (nuevosEliminados.length >= jugadores.length) {
        setMotivoFinRonda('¡Todos los jugadores han caído eliminados!');
      }
    }
  };

  const cerrarModalExplosion = () => {
    setExplosionModal(null);
    if (motivoFinRonda) {
      setFase('ronda_fin');
    } else {
      avanzarTurno(eliminadosRonda);
    }
  };

  const siguienteRonda = () => {
    if (rondaActual >= MAX_RONDAS) {
      setFase('final');
    } else {
      setRondaActual((r) => r + 1);
      setFase('categoria');
    }
  };

  const ranking = [...jugadores].sort((a, b) => (puntos[b.id] ?? 0) - (puntos[a.id] ?? 0));
  const maximoPuntos = ranking.length ? (puntos[ranking[0].id] ?? 0) : 0;
  const ganadores = maximoPuntos > 0 ? ranking.filter((j) => (puntos[j.id] ?? 0) === maximoPuntos) : [];

  const correctasDescubiertas = casillas.filter((c) => c.descubierta && c.correcto).length;
  const minasExplotadas = casillas.filter((c) => c.descubierta && !c.correcto).length;

  return (
    <div className="bm-contenedor">
      {/* REGLAS */}
      {fase === 'setup' && (
        <>
          <button
            type="button"
            className="aprox-btn-ayuda"
            onClick={() => setModalAyuda(true)}
            title="Reglas del juego"
          >
            <span className="aprox-btn-ayuda-signo">?</span>
          </button>

          {modalAyuda && (
            <div className="rg-modal-fondo" onClick={() => setModalAyuda(false)}>
              <div className="rg-modal aprox-modal-ayuda" onClick={(e) => e.stopPropagation()}>
                <div className="aprox-modal-header">
                  <h3>¿Cómo se juega a Cuidado que explota?</h3>
                </div>

                <div className="aprox-modal-cuerpo">
                  <p><strong>1. Dinámica del tablero (15 casillas):</strong></p>
                  <ul>
                    <li>Se muestra una consigna y un tablero de 15 elementos (3 filas x 5 columnas).</li>
                    <li>Exactamente <strong>10 casillas son correctas</strong> y <strong>5 son bombas</strong>.</li>
                    <li>Por turnos y pasándose el dispositivo, cada jugador selecciona una casilla en menos de <strong>30 segundos</strong> o perderá el turno.</li>
                    <li>Si aciertas, ganas puntos y la casilla queda inhabilitada para los demás.</li>
                    <li>Si fallas, <strong>¡la bomba explota!</strong> y quedas eliminado por el resto de la ronda.</li>
                  </ul>

                  <p><strong>2. Puntuación según dificultad:</strong></p>
                  <div className="aprox-tabla-puntos">
                    <div className="aprox-puntos-fila acierto">
                      <span>🟢 Elemento Fácil</span>
                      <strong>+1 punto</strong>
                    </div>
                    <div className="aprox-puntos-fila intermedia" style={{ background: '#fef3c7', color: '#92400e' }}>
                      <span>🟡 Elemento Medio</span>
                      <strong>+2 puntos</strong>
                    </div>
                    <div className="aprox-puntos-fila acierto" style={{ background: '#ede9fe', color: '#5b21b6' }}>
                      <span>🟣 Elemento Difícil</span>
                      <strong>+3 puntos</strong>
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

      {/* 1. SETUP */}
      {fase === 'setup' && (
        <section className="game">
          <GameIntro gameId="buscaminas" titulo="Cuidado que explota" />

          <div className="panel">
            <div className="hud" style={{ marginBottom: '1rem' }}>
              <button className="btn-back-inline" onClick={onVolver}>
                &larr; Cambiar a modo Online
              </button>
            </div>

            <h3 className="panel-title"><Icon name="users" size={22} /> Jugadores (3 a 8)</h3>
            <label className="field-label" htmlFor="num-jugadores-bm">
              Número de jugadores
            </label>
            <select
              id="num-jugadores-bm"
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
            <span className="chip"><Icon name="flagFinish" size={18} />Ronda {rondaActual} de {MAX_RONDAS}</span>
            <span className="chip alt"><Icon name="target" size={18} />Categoría del tablero</span>
          </div>

          <h3 className="section-title" style={{ textAlign: 'center', marginBottom: '1rem' }}>
            Elige la temática para este tablero:
          </h3>

          <div className="bm-categories-grid">
            {categorias.map((cat, idx) => (
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

      {/* 3. PASAR TURNO */}
      {fase === 'pasar_turno' && jugadorActivo && (
        <section className="game center">
          <div className="panel aprox-pregunta-card bm-pasar-card">
            <span className="chip alt">Ronda {rondaActual} · Turno en juego</span>
            <h1 className="bm-jugador-highlight">
              ¡Turno de {jugadorActivo.nombre}!
            </h1>
            <p className="hint" style={{ fontSize: '1.05rem', marginBottom: '1.5rem' }}>
              Pasad el teléfono a <strong>{jugadorActivo.nombre}</strong> para elegir una casilla del tablero sin pisar la mina.
            </p>
            <button className="big full" onClick={() => setFase('jugando')}>
              <Icon name="check" size={22} strokeWidth={2.5} /> Soy {jugadorActivo.nombre}, ¡ver tablero!
            </button>
          </div>
        </section>
      )}

      {/* 4. TABLERO JUGANDO */}
      {fase === 'jugando' && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="flagFinish" size={18} />Ronda {rondaActual} de {MAX_RONDAS}</span>
            <span className="chip alt">Turno de: {jugadorActivo?.nombre}</span>
          </div>

          <div className="scoreboard-container" style={{ justifyContent: 'center', marginBottom: '0.8rem' }}>
            {jugadores.map((j) => {
              const eliminado = eliminadosRonda.includes(j.id);
              const esTurno = j.id === jugadorActivo?.id;
              return (
                <div key={j.id} className={`score-pill ${eliminado ? 'locked' : ''}`} style={{ borderColor: esTurno ? '#4f46e5' : undefined }}>
                  <span>{j.nombre}: <strong>{puntos[j.id] ?? 0} pts</strong></span>
                  {eliminado ? <span style={{ marginLeft: '4px' }}>💥</span> : esTurno ? <span style={{ marginLeft: '4px' }}>👉</span> : null}
                </div>
              );
            })}
          </div>

          <div className="bm-consigna-card">
            <span className="badge" style={{ background: '#e0e7ff', color: '#4338ca' }}>
              Consigna de la ronda
            </span>
            <h2 className="bm-consigna-titulo">«{consigna}»</h2>
            <p className="bm-consigna-sub">Encuentra los elementos que cumplen la consigna y esquiva las 5 bombas.</p>

            <div className="bm-progreso-stats">
              <span className="bm-stat-chip correctas">
                ✅ Aciertos: {correctasDescubiertas} / {TOTAL_CORRECTOS}
              </span>
              <span className="bm-stat-chip minas">
                💣 Minas pisadas: {minasExplotadas} / {TOTAL_MINAS}
              </span>
            </div>
          </div>

          <div className="bm-starter-banner">
            <span>👤 Turno de: <strong>{jugadorActivo?.nombre}</strong></span>
          </div>

          {/* Temporizador de 30 segundos */}
          <div style={{ padding: '0 1rem', marginTop: '0.5rem' }}>
            <div
              className="timer"
              role="timer"
              style={{ margin: '0.4rem 0', background: '#e2e8f0', borderRadius: '9999px', height: '8px', overflow: 'hidden' }}
            >
              <div
                className={`timer-bar ${tiempoRestante <= 10 ? 'low' : ''}`}
                style={{
                  width: `${(tiempoRestante / TIEMPO_TURNO) * 100}%`,
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
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                color: tiempoRestante <= 10 ? '#dc2626' : '#64748b', fontSize: '0.9rem', fontWeight: 700, margin: '0 0 1rem'
              }}
            >
              <Icon name="clock" size={16} />
              {tiempoRestante} s
            </p>
          </div>

          <div className="bm-grid-15">
            {casillas.map((c) => {
              if (c.descubierta) {
                if (c.correcto) {
                  return (
                    <button key={c.id} type="button" className="bm-casilla-btn acertada" disabled>
                      <span>{c.texto}</span>
                      <span className={`bm-badge-pts ${c.dificultad}`}>
                        +{c.puntos} {c.puntos === 1 ? 'pt' : 'pts'}
                      </span>
                    </button>
                  );
                } else {
                  return (
                    <button key={c.id} type="button" className="bm-casilla-btn mina-explotada" disabled>
                      <span>💣 {c.texto}</span>
                    </button>
                  );
                }
              }

              return (
                <button
                  key={c.id}
                  type="button"
                  className="bm-casilla-btn"
                  onClick={() => seleccionarCasilla(c)}
                >
                  <span>{c.texto}</span>
                </button>
              );
            })}
          </div>

          {explosionModal && (
            <div className="bm-modal-explosion-fondo" onClick={cerrarModalExplosion}>
              <div className="bm-modal-explosion-card" onClick={(e) => e.stopPropagation()}>
                <span className="bm-bomba-animada">💣💥</span>
                <h2 className="bm-explosion-titulo">¡BOOM! ¡MINA PISADA!</h2>
                <p className="bm-explosion-txt">
                  <strong>{explosionModal.casillaTexto}</strong> no cumple la consigna.
                  <br />
                  <strong>{explosionModal.jugadorNombre}</strong> queda eliminado de esta ronda.
                </p>
                <button type="button" className="big full" onClick={cerrarModalExplosion}>
                  {motivoFinRonda ? 'Ver resultados de la ronda' : 'Continuar con el siguiente jugador'}
                </button>
              </div>
            </div>
          )}

          <div className="actions" style={{ marginTop: '1.2rem' }}>
            <button className="secondary danger full" onClick={() => {
              setMotivoFinRonda('Ronda finalizada por decisión del grupo.');
              setFase('ronda_fin');
            }}>
              <Icon name="flagFinish" size={20} /> Finalizar ronda y ver soluciones
            </button>
          </div>
        </section>
      )}

      {/* 5. FIN DE RONDA */}
      {fase === 'ronda_fin' && (
        <section className="game">
          <div className="end-card aprox-resolucion-card">
            <span className="end-icon"><Icon name="trophy" size={44} /></span>
            <p className="categoria">Ronda {rondaActual} completada</p>
            <h1 className="title">{motivoFinRonda || 'Fin de la ronda'}</h1>
            <p className="reveal" style={{ fontSize: '1.2rem', margin: '0.6rem 0' }}>
              Consigna: «{consigna}»
            </p>

            <div className="bm-grid-15" style={{ margin: '1.2rem 0' }}>
              {casillas.map((c) => (
                <div
                  key={c.id}
                  className={`bm-casilla-btn ${c.correcto ? 'acertada' : 'mina-explotada'}`}
                  style={{ cursor: 'default' }}
                >
                  <span>{c.correcto ? '✓ ' : '💣 '}{c.texto}</span>
                  {c.correcto && (
                    <span className={`bm-badge-pts ${c.dificultad}`}>
                      +{c.puntos} {c.puntos === 1 ? 'pt' : 'pts'}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="scoreboard" style={{ width: '100%', marginTop: '1rem' }}>
              <h3 className="section-title" style={{ margin: '0 0 0.8rem', textAlign: 'center' }}>
                Clasificación general
              </h3>
              {ranking.map((j, i) => {
                const pts = puntos[j.id] ?? 0;
                const lider = maximoPuntos > 0 && pts === maximoPuntos;
                return (
                  <div key={j.id} className={`score-row ${lider ? 'first' : ''}`}>
                    <span className="score-name">
                      {lider ? <Icon name="crown" size={22} /> : <span className="pos">{i + 1}</span>}
                      {j.nombre}
                    </span>
                    <span className="score-pts">{pts} pts</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="actions" style={{ marginTop: '1.2rem' }}>
            {rondaActual < MAX_RONDAS ? (
              <button className="big full" onClick={siguienteRonda}>
                <Icon name="play" size={20} /> Jugar Ronda {rondaActual + 1} de {MAX_RONDAS}
              </button>
            ) : (
              <button className="big full" onClick={() => setFase('final')}>
                <Icon name="trophy" size={20} /> Ver podio final
              </button>
            )}

            <button className="secondary danger full" onClick={() => setFase('final')}>
              <Icon name="flagFinish" size={20} /> Finalizar partida
            </button>
          </div>
        </section>
      )}

      {/* 6. FINAL */}
      {fase === 'final' && (
        <section className="game">
          <div className="end-card">
            <span className="end-icon"><Icon name="crown" size={48} /></span>
            <h1 className="title">Clasificación Final</h1>
            <p className="final-score">
              {ganadores.length === 0
                ? 'Nadie ha conseguido puntos'
                : ganadores.length === 1
                ? <>¡Victoria para {ganadores[0].nombre} con {maximoPuntos} puntos!</>
                : <>Empate entre {ganadores.map((g) => g.nombre).join(', ')} con {maximoPuntos} puntos</>}
            </p>

            <div className="scoreboard">
              {ranking.map((j, i) => {
                const lider = maximoPuntos > 0 && j.puntos === maximoPuntos;
                return (
                  <div key={j.id} className={`score-row ${lider ? 'first' : ''}`}>
                    <span className="score-name">
                      {lider ? <Icon name="crown" size={22} /> : <span className="pos">{i + 1}</span>}
                      {j.nombre}
                    </span>
                    <span className="score-pts">{j.puntos} pts</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="actions" style={{ marginTop: '1.5rem' }}>
            <button onClick={() => setFase('setup')}>
              <Icon name="refresh" size={20} /> Nueva partida
            </button>
            <button className="secondary danger" onClick={() => (onExit ? onExit() : navigate('/'))}>
              <Icon name="door" size={20} /> Salir al menú principal
            </button>
          </div>
        </section>
      )}
    </div>
  );
}