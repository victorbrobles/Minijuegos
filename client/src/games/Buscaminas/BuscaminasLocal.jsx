// client/src/games/Buscaminas/BuscaminasLocal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import CategoryCard from '../../components/CategoryCard.jsx';
import './Buscaminas.css';

const MIN_JUGADORES = 3;
const MAX_JUGADORES = 8;
const MAX_RONDAS = 10;
const TOTAL_CORRECTOS = 10;
const TOTAL_MINAS = 5;
const TIEMPO_TURNO = 30;

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

export default function BuscaminasLocal({ onVolver, onExit, onAbrirAyuda }) {
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
  const enPartidaActiva = fase !== 'setup';

  return (
    <div className={`bm-contenedor ${enPartidaActiva ? 'qq-en-partida' : ''}`}>

      {/* 1. SETUP */}
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
              <label className="qq-label-destacado" htmlFor="num-jugadores-bm">
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
                  id="num-jugadores-bm"
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
              <Icon name="play" size={22} /> ¡Elegir categoría!
            </button>
          </div>
        </section>
      )}

      {/* 2. SELECTOR DE CATEGORÍA */}
      {fase === 'categoria' && (
        <section className="game">
          <div className="panel qq-menu-panel">
            <div className="qq-card-top">
              <BotonVolver texto="Volver a la portada" onClick={() => setModalSalirPortada(true)} />
              <span className="qq-tablero-badge" style={{ marginBottom: 0 }}>
                Ronda {rondaActual} de {MAX_RONDAS}
              </span>
            </div>

            <div className="qq-section-header">
              <h3 className="qq-section-title">Elige la temática</h3>
              <p className="hint">
                Al seleccionar una categoría se cargará el tablero de 15 elementos.
              </p>
            </div>

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
          </div>
        </section>
      )}

      {/* 3. PASAR TURNO */}
      {fase === 'pasar_turno' && jugadorActivo && (
        <section className="game center">
          <div className="panel qq-menu-panel bm-pasar-card" style={{ textAlign: 'center' }}>
            <div className="qq-card-top" style={{ justifyContent: 'flex-start', marginBottom: '0.4rem', width: '100%' }}>
              <BotonVolver texto="Volver a la portada" onClick={() => setModalSalirPortada(true)} />
            </div>

            <div className="qq-tablero-header">
              <span className="qq-tablero-badge">
                <Icon name="flagFinish" size={16} /> Ronda {rondaActual} · Turno en juego
              </span>
              <div style={{ fontSize: '3.2rem', margin: '0.4rem 0' }}>📱</div>
              <h1 className="bm-jugador-highlight">¡Turno de {jugadorActivo.nombre}!</h1>
              <p className="hint" style={{ fontSize: '1.05rem', marginBottom: '1.5rem' }}>
                Pasad el teléfono a <strong>{jugadorActivo.nombre}</strong> para elegir una casilla del tablero sin pisar la mina.
              </p>
            </div>

            <button className="big full qq-btn-principal" onClick={() => setFase('jugando')}>
              <Icon name="check" size={22} strokeWidth={2.5} /> Soy {jugadorActivo.nombre}, ¡ver tablero!
            </button>
          </div>
        </section>
      )}

      {/* 4. TABLERO JUGANDO */}
      {fase === 'jugando' && (
        <section className="game">
          <div className="panel qq-menu-panel">
            <div className="qq-card-top" style={{ marginBottom: '0.8rem' }}>
              <BotonVolver texto="Volver a la portada" onClick={() => setModalSalirPortada(true)} />
              <span className="qq-tablero-badge" style={{ marginBottom: 0 }}>
                Ronda {rondaActual} de {MAX_RONDAS}
              </span>
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

            {/* Temporizador */}
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

            <div className="qq-tablero-footer">
              <button type="button" className="qq-link-otra-ronda" onClick={() => {
                setMotivoFinRonda('Ronda finalizada por decisión del grupo.');
                setFase('ronda_fin');
              }}>
                Finalizar ronda y ver soluciones
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 5. FIN DE RONDA */}
      {fase === 'ronda_fin' && (
        <section className="game">
          <div className="panel qq-menu-panel">
            <div className="qq-card-top" style={{ marginBottom: '0.8rem' }}>
              <BotonVolver texto="Volver a la portada" onClick={() => setModalSalirPortada(true)} />
              <span className="qq-tablero-badge" style={{ marginBottom: 0 }}>
                Ronda {rondaActual} finalizada
              </span>
            </div>

            <div className="end-card aprox-resolucion-card" style={{ border: 'none', boxShadow: 'none', padding: '0 0 1rem' }}>
              <span className="end-icon"><Icon name="trophy" size={44} /></span>
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
                <button className="big full qq-btn-principal" onClick={siguienteRonda}>
                  <Icon name="play" size={20} /> Jugar Ronda {rondaActual + 1} de {MAX_RONDAS}
                </button>
              ) : (
                <button className="big full qq-btn-principal" onClick={() => setFase('final')}>
                  <Icon name="trophy" size={20} /> Ver podio final
                </button>
              )}

              <div className="qq-tablero-footer">
                <button type="button" className="qq-link-otra-ronda" onClick={() => setFase('final')}>
                  Finalizar partida anticipadamente
                </button>
              </div>
            </div>
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
            <button type="button" className="big full qq-btn-principal" onClick={() => setFase('setup')}>
              <Icon name="refresh" size={20} /> Nueva partida
            </button>
            <button type="button" className="secondary danger full" onClick={() => setModalSalirPortada(true)}>
              <Icon name="door" size={20} /> Salir al menú principal
            </button>
          </div>
        </section>
      )}

      {/* MODAL: SALIR A LA PORTADA (MODO OFFLINE) */}
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