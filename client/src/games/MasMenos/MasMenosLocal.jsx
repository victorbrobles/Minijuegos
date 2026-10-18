// client/src/games/MasMenos/MasMenosLocal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import GameIntro from '../../components/GameIntro.jsx';
import CategoryCard from '../../components/CategoryCard.jsx';
import './MasMenos.css';

const MIN_JUGADORES = 1;
const MAX_JUGADORES = 10;
const TIEMPO_TURNO = 30;

export default function MasMenosLocal({ onVolver, onExit }) {
  const navigate = useNavigate();

  const [fase, setFase] = useState('setup');
  const [modalAyuda, setModalAyuda] = useState(false);

  const [numJugadores, setNumJugadores] = useState(3);
  const [jugadores, setJugadores] = useState([
    { id: 1, nombre: 'Jugador 1', puntos: 0, jugo: false },
    { id: 2, nombre: 'Jugador 2', puntos: 0, jugo: false },
    { id: 3, nombre: 'Jugador 3', puntos: 0, jugo: false }
  ]);

  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [poolElementos, setPoolElementos] = useState([]);

  const [ordenTurnos, setOrdenTurnos] = useState([]);
  const [indiceTurno, setIndiceTurno] = useState(0);

  const [puntosTurno, setPuntosTurno] = useState(0);
  const [tarjetaA, setTarjetaA] = useState(null);
  const [tarjetaB, setTarjetaB] = useState(null);
  const [indicePool, setIndicePool] = useState(0);

  const [estadoEleccion, setEstadoEleccion] = useState(null);

  const [tiempoRestante, setTiempoRestante] = useState(TIEMPO_TURNO);
  const timerRef = useRef(null);

  useEffect(() => {
    fetch('/api/masmenos/categorias')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setCategorias(d.categorias);
      })
      .catch((e) => console.error('Error cargando categorías de masmenos:', e));
  }, []);

  const handleNumJugadoresChange = (e) => {
    const num = parseInt(e.target.value, 10);
    setNumJugadores(num);
    const nuevos = Array.from({ length: num }, (_, i) => ({
      id: i + 1,
      nombre: jugadores[i]?.nombre || `Jugador ${i + 1}`,
      puntos: 0,
      jugo: false
    }));
    setJugadores(nuevos);
  };

  const handleNombreChange = (idx, val) => {
    const nuevos = [...jugadores];
    nuevos[idx] = { ...nuevos[idx], nombre: val };
    setJugadores(nuevos);
  };

  const irACategorias = () => {
    const listaActualizada = jugadores.map((j) => ({
      ...j,
      nombre: j.nombre.trim() || `Jugador ${j.id}`,
      puntos: 0,
      jugo: false
    }));
    setJugadores(listaActualizada);
    setFase('categoria');
  };

  const iniciarJuegoConCategoria = async (catId) => {
    setCategoriaSeleccionada(catId);
    try {
      const res = await fetch('/api/masmenos/partida', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoria: catId })
      });
      const data = await res.json();

      if (data.success && data.elementos.length >= 2) {
        setPoolElementos(data.elementos);

        const ids = jugadores.map((j) => j.id);
        const primerIdx = Math.floor(Math.random() * ids.length);
        const orden = [];
        for (let i = 0; i < ids.length; i++) {
          orden.push(ids[(primerIdx + i) % ids.length]);
        }
        setOrdenTurnos(orden);
        setIndiceTurno(0);

        prepararRachaJugador(data.elementos, 0);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const jugadorActivoId = ordenTurnos[indiceTurno];
  const jugadorActivo = jugadores.find((j) => j.id === jugadorActivoId);

  const prepararRachaJugador = (elementos, cursor) => {
    setPuntosTurno(0);
    setEstadoEleccion(null);

    setTarjetaA({ item: elementos[cursor], tiempo: 1 });
    setTarjetaB({ item: elementos[cursor + 1], tiempo: 1 });
    setIndicePool(cursor + 2);

    setFase('pasar_turno');
  };

  const formatearCifra = (num) => {
    if (typeof num !== 'number') return num;
    return new Intl.NumberFormat('es-ES').format(num);
  };

  const elegirTarjeta = (opcionElegida) => {
    if (estadoEleccion !== null) return;

    if (timerRef.current) clearInterval(timerRef.current);

    const valA = tarjetaA.item.valor;
    const valB = tarjetaB.item.valor;
    const esMayorA = valA >= valB;
    const esMayorB = valB >= valA;

    const esAcierto = (opcionElegida === 'A' && esMayorA) || (opcionElegida === 'B' && esMayorB);

    setEstadoEleccion({
      eleccion: opcionElegida,
      esAcierto
    });

    if (esAcierto) {
      const nuevosPuntos = puntosTurno + 1;
      setPuntosTurno(nuevosPuntos);

      setTimeout(() => {
        setEstadoEleccion(null);

        const nuevoItem = poolElementos[indicePool % poolElementos.length];
        setIndicePool((p) => p + 1);

        if (nuevosPuntos === 1) {
          if (opcionElegida === 'A') {
            setTarjetaA((prev) => ({ ...prev, tiempo: prev.tiempo + 1 }));
            setTarjetaB({ item: nuevoItem, tiempo: 1 });
          } else {
            setTarjetaB((prev) => ({ ...prev, tiempo: prev.tiempo + 1 }));
            setTarjetaA({ item: nuevoItem, tiempo: 1 });
          }
        } else {
          if (tarjetaA.tiempo >= tarjetaB.tiempo) {
            setTarjetaA({ item: nuevoItem, tiempo: 1 });
            setTarjetaB((prev) => ({ ...prev, tiempo: prev.tiempo + 1 }));
          } else {
            setTarjetaB({ item: nuevoItem, tiempo: 1 });
            setTarjetaA((prev) => ({ ...prev, tiempo: prev.tiempo + 1 }));
          }
        }
      }, 1600);
    } else {
      setTimeout(() => {
        setJugadores((prev) =>
          prev.map((j) =>
            j.id === jugadorActivo.id ? { ...j, puntos: puntosTurno, jugo: true } : j
          )
        );
        setFase('turno_fin');
      }, 2000);
    }
  };

  const handleTimeOut = () => {
    if (estadoEleccion !== null) return;
    setEstadoEleccion({ eleccion: 'TIMEOUT', esAcierto: false });
    setTimeout(() => {
      setJugadores((prev) =>
        prev.map((j) =>
          j.id === jugadorActivo.id ? { ...j, puntos: puntosTurno, jugo: true } : j
        )
      );
      setFase('turno_fin');
    }, 2000);
  };

  const handleTimeOutRef = useRef();
  useEffect(() => {
    handleTimeOutRef.current = handleTimeOut;
  });

  useEffect(() => {
    if (fase !== 'jugando' || estadoEleccion !== null) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    setTiempoRestante(TIEMPO_TURNO);
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          if (handleTimeOutRef.current) handleTimeOutRef.current(); // Agota el tiempo y falla
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fase, indicePool, estadoEleccion]);

  const continuarTrasFallo = () => {
    const siguientes = ordenTurnos.slice(indiceTurno + 1);
    if (siguientes.length > 0) {
      setIndiceTurno((t) => t + 1);
      prepararRachaJugador(poolElementos, indicePool);
    } else {
      setFase('final');
    }
  };

  const ranking = [...jugadores].sort((a, b) => b.puntos - a.puntos);
  const maximo = ranking.length ? ranking[0].puntos : 0;
  const ganadores = maximo > 0 ? ranking.filter((j) => j.puntos === maximo) : [];

  return (
    <div className="mm-contenedor">
      {/* AYUDA */}
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
                  <h3>¿Cómo se juega a Entre dos aguas?</h3>
                </div>

                <div className="aprox-modal-cuerpo">
                  <p><strong>1. Dinámica del reto:</strong></p>
                  <ul>
                    <li>Eliges una categoría y se sortea quién empieza la partida.</li>
                    <li>Aparecen dos datos frente a frente. Tienes <strong>30 segundos</strong> para <strong>elegir la cifra más alta</strong>.</li>
                    <li>Si aciertas, sumas <strong>+1 punto</strong>, se desvelan las cifras reales y la tarjeta perdedora o más antigua se sustituye por una nueva.</li>
                    <li>¡Encadena tantos aciertos consecutivos como puedas hasta fallar (o quedarte sin tiempo)!</li>
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
        <section className="game">
          <GameIntro gameId="masmenos" titulo="Entre dos aguas" />

          <div className="panel">
            <div className="hud" style={{ marginBottom: '1rem' }}>
              <button className="btn-back-inline" onClick={onVolver}>
                &larr; Cambiar a modo Online
              </button>
            </div>

            <h3 className="panel-title"><Icon name="users" size={22} /> Participantes</h3>
            <label className="field-label" htmlFor="num-jugadores-mm">
              Número de jugadores ({MIN_JUGADORES} a {MAX_JUGADORES})
            </label>
            <select
              id="num-jugadores-mm"
              value={numJugadores}
              onChange={handleNumJugadoresChange}
            >
              {Array.from({ length: MAX_JUGADORES - MIN_JUGADORES + 1 }, (_, i) => (
                <option key={i + MIN_JUGADORES} value={i + MIN_JUGADORES}>
                  {i + MIN_JUGADORES} {i + MIN_JUGADORES === 1 ? 'jugador' : 'jugadores'}
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

      {/* 2. CATEGORÍA */}
      {fase === 'categoria' && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="target" size={18} />Selector de categoría</span>
          </div>

          <h3 className="section-title" style={{ textAlign: 'center', marginBottom: '1rem' }}>
            ¿Qué temática queréis comparar?
          </h3>

          <div className="rf-opciones conecta-categories-grid">
            {categorias.map((cat, idx) => (
              <CategoryCard
                key={cat.id}
                nombre={cat.nombre}
                icono={cat.icono}
                indice={idx}
                onClick={() => iniciarJuegoConCategoria(cat.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* 3. PASAR TURNO */}
      {fase === 'pasar_turno' && jugadorActivo && (
        <section className="game center">
          <div className="panel aprox-pregunta-card" style={{ padding: '3.2rem 1.5rem' }}>
            <span className="chip alt">Turno individual contrarreloj</span>
            <h1 style={{ fontSize: '2.4rem', fontWeight: '900', color: '#4f46e5', margin: '0.6rem 0 1.2rem' }}>
              ¡Turno de {jugadorActivo.nombre}!
            </h1>
            <p className="hint" style={{ fontSize: '1.05rem', marginBottom: '1.8rem' }}>
              Pasad el móvil a <strong>{jugadorActivo.nombre}</strong> para conseguir la mayor racha de aciertos.
            </p>
            <button className="big full" onClick={() => setFase('jugando')}>
              <Icon name="zap" size={22} /> ¡Empezar mi turno!
            </button>
          </div>
        </section>
      )}

      {/* 4. EN JUEGO */}
      {fase === 'jugando' && tarjetaA && tarjetaB && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="users" size={18} />Jugando: <strong>{jugadorActivo?.nombre}</strong></span>
            <span className="mm-streak-pill">
              🔥 Racha: {puntosTurno} {puntosTurno === 1 ? 'acierto' : 'aciertos'}
            </span>
          </div>

          <h2 className="title center" style={{ margin: '0.5rem 0 1rem', fontSize: '1.45rem' }}>
            ¿Cuál tiene la cifra más grande?
          </h2>

          {/* Temporizador de 30 segundos */}
          <div style={{ padding: '0 1rem', marginTop: '0.5rem', marginBottom: '1rem' }}>
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
                color: tiempoRestante <= 10 ? '#dc2626' : '#64748b', fontSize: '0.9rem', fontWeight: 700, margin: '0'
              }}
            >
              <Icon name="clock" size={16} />
              {tiempoRestante} s
            </p>
          </div>

          <div className="mm-versus-wrapper">
            <button
              type="button"
              className={`mm-card-opcion ${
                estadoEleccion?.eleccion === 'A'
                  ? estadoEleccion.esAcierto
                    ? 'acierto'
                    : 'fallo'
                  : ''
              }`}
              disabled={estadoEleccion !== null}
              onClick={() => elegirTarjeta('A')}
            >
              <h3 className="mm-card-nombre">{tarjetaA.item.nombre}</h3>
              {tarjetaA.item.detalle && <p className="mm-card-detalle">{tarjetaA.item.detalle}</p>}

              {estadoEleccion !== null && (
                <>
                  <span className="mm-card-cifra">{formatearCifra(tarjetaA.item.valor)}</span>
                  <span className="mm-card-unidad">{tarjetaA.item.unidad}</span>
                </>
              )}
            </button>

            <span className="mm-vs-badge">VS</span>

            <button
              type="button"
              className={`mm-card-opcion ${
                estadoEleccion?.eleccion === 'B'
                  ? estadoEleccion.esAcierto
                    ? 'acierto'
                    : 'fallo'
                  : ''
              }`}
              disabled={estadoEleccion !== null}
              onClick={() => elegirTarjeta('B')}
            >
              <h3 className="mm-card-nombre">{tarjetaB.item.nombre}</h3>
              {tarjetaB.item.detalle && <p className="mm-card-detalle">{tarjetaB.item.detalle}</p>}

              {estadoEleccion !== null && (
                <>
                  <span className="mm-card-cifra">{formatearCifra(tarjetaB.item.valor)}</span>
                  <span className="mm-card-unidad">{tarjetaB.item.unidad}</span>
                </>
              )}
            </button>
          </div>
        </section>
      )}

      {/* 5. FIN DEL TURNO */}
      {fase === 'turno_fin' && jugadorActivo && (
        <section className="game center">
          <div className="end-card">
            <span className="end-icon"><Icon name="hourglass" size={44} /></span>
            <h1 className="title">¡Racha terminada!</h1>
            <p className="reveal" style={{ fontSize: '1.4rem', margin: '0.8rem 0' }}>
              <strong>{jugadorActivo.nombre}</strong> ha conseguido <strong>{puntosTurno} aciertos consecutivos</strong>.
            </p>

            <div className="scoreboard">
              {jugadores.map((j) => (
                <div key={j.id} className={`score-row ${j.id === jugadorActivo.id ? 'first' : ''}`}>
                  <span className="score-name">{j.nombre}</span>
                  <span className="score-pts">{j.jugo ? `${j.puntos} pts` : 'Pendiente'}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="actions" style={{ marginTop: '1.5rem' }}>
            {jugadores.some((j) => !j.jugo) ? (
              <button className="big full" onClick={continuarTrasFallo}>
                <Icon name="play" size={20} /> Siguiente participante
              </button>
            ) : (
              <button className="big full" onClick={() => setFase('final')}>
                <Icon name="trophy" size={20} /> Ver podio final
              </button>
            )}
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
                ? <>¡Victoria para {ganadores[0].nombre} con {maximo} puntos!</>
                : <>Empate entre {ganadores.map((g) => g.nombre).join(', ')} con {maximo} puntos</>}
            </p>

            <div className="scoreboard">
              {ranking.map((j, i) => {
                const lider = maximo > 0 && j.puntos === maximo;
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