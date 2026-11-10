// client/src/games/MasMenos/MasMenosLocal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import CategoryCard from '../../components/CategoryCard.jsx';
import './MasMenos.css';
import { SelectorJugadores } from '../../components/MenuJuego.jsx';

const MIN_JUGADORES = 1;
const MAX_JUGADORES = 10;
const TIEMPO_TURNO = 30;

const COLORES_JUGADOR = ['#4d7c0f', '#3b82f6', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4', '#f97316', '#84cc16'];
const colorJugador = (id) => COLORES_JUGADOR[(Number(id) - 1 + COLORES_JUGADOR.length * 10) % COLORES_JUGADOR.length];
const inicial = (n = '?') => n.trim().charAt(0).toUpperCase() || '?';

export default function MasMenosLocal({ onVolver, onExit }) {
  const navigate = useNavigate();

  const [fase, setFase] = useState('setup'); // 'setup' | 'categoria' | 'pasar_turno' | 'jugando' | 'turno_fin' | 'final'
  const [modalAyuda, setModalAyuda] = useState(false);
  const [modalSalirPortada, setModalSalirPortada] = useState(false);

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

  const handleSalirAPortada = () => {
    setModalSalirPortada(false);
    clearInterval(timerRef.current);
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
          if (handleTimeOutRef.current) handleTimeOutRef.current();
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
  const enPartidaActiva = fase === 'pasar_turno' || fase === 'jugando' || fase === 'turno_fin';

  return (
    <div className={`mm-contenedor ${enPartidaActiva ? 'qq-en-partida' : ''}`}>
      {/* AYUDA */}
      {modalAyuda && (
        <div className="rg-modal-fondo" onClick={() => setModalAyuda(false)}>
          <div className="rg-modal ptp-modal-ayuda" onClick={(e) => e.stopPropagation()}>
            <div className="ptp-modal-ayuda-header">
              <span className="ptp-ayuda-badge">❓ Cómo jugar</span>
              <h3>Entre dos aguas</h3>
            </div>

            <div className="ptp-modal-ayuda-body">
              <p>Compite por turnos para adivinar qué cifra es mayor.</p>
              <ul>
                <li><strong>Dinámica:</strong> Aparecen dos tarjetas con datos frente a frente. Tienes <strong>30 segundos</strong> para elegir la cifra más alta.</li>
                <li><strong>Racha:</strong> Si aciertas, sumas +1 punto a tu racha, se desvelan las cifras reales y la tarjeta perdedora se renueva.</li>
                <li><strong>Fin de turno:</strong> Tu turno termina en cuanto fallas o se agota el tiempo. ¡Gana quien acumule más puntos!</li>
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
          onEmpezar={irACategorias}
          textoBoton="Elegir Categoría"
          iconoBoton="play"
        />
      )}

      {/* 2. CATEGORÍA */}
      {fase === 'categoria' && (
        <section className="game qq-pantalla">
          <div className="hud">
            <span className="chip"><Icon name="target" size={18} />Selector de categoría</span>
          </div>

          <h3 className="section-title" style={{ textAlign: 'center', marginBottom: '1rem', color: '#0f172a' }}>
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
        <section className="game ptp-escena">
          <header className="ptp-hero">
            <span className="ptp-hero-deco" aria-hidden="true">
              <Icon name="scale" size={140} strokeWidth={1.3} />
            </span>
            <div className="ptp-hero-top">
              <button type="button" className="ptp-salir" onClick={() => setModalSalirPortada(true)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                <span>Portada</span>
              </button>
              <div className="ptp-hero-chips">
                <span className="ptp-chip"><Icon name="dice" size={14} /> Turno individual</span>
              </div>
            </div>

            <ol className="ptp-marcador" aria-label="Jugadores">
              {jugadores.map((j) => {
                const esActual = j.id === jugadorActivo.id;
                return (
                  <li
                    key={j.id}
                    className={`ptp-jugador${j.jugo ? ' respondido' : ''}${esActual ? ' yo' : ''}`}
                    style={{ '--c': colorJugador(j.id) }}
                  >
                    <span className="ptp-jugador-avatar">{inicial(j.nombre)}</span>
                    <span className="ptp-jugador-datos">
                      <span className="ptp-jugador-nombre">{j.nombre}</span>
                      <span className="ptp-jugador-linea">
                        <strong>{j.jugo ? `${j.puntos} pts` : esActual ? 'Su turno' : 'Pendiente'}</strong>
                      </span>
                    </span>
                    <span className="ptp-jugador-estado">
                      {j.jugo ? '✅' : esActual ? '⚡' : '⏳'}
                    </span>
                  </li>
                );
              })}
            </ol>
          </header>

          <div className="ptp-tarjeta" style={{ textAlign: 'center', padding: '1.8rem 1.4rem' }}>
            <p className="ptp-etiqueta">Pasad el dispositivo</p>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0f172a', margin: '0.4rem 0 0.8rem' }}>
              ¡Turno de <span style={{ color: colorJugador(jugadorActivo.id) }}>{jugadorActivo.nombre}</span>!
            </h2>
            <p className="hint" style={{ fontSize: '0.96rem', marginBottom: '1.5rem' }}>
              Pasad el móvil a <strong>{jugadorActivo.nombre}</strong> para conseguir la mayor racha de aciertos.
            </p>
            <button type="button" className="ptp-boton grande" onClick={() => setFase('jugando')}>
              <Icon name="zap" size={22} /> ¡Empezar mi turno!
            </button>
          </div>
        </section>
      )}

      {/* 4. EN JUEGO */}
      {fase === 'jugando' && tarjetaA && tarjetaB && (
        <section className="game ptp-escena">
          <header className="ptp-hero">
            <span className="ptp-hero-deco" aria-hidden="true">
              <Icon name="scale" size={140} strokeWidth={1.3} />
            </span>
            <div className="ptp-hero-top">
              <button type="button" className="ptp-salir" onClick={() => setModalSalirPortada(true)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                <span>Portada</span>
              </button>
              <div className="ptp-hero-chips">
                <span className="ptp-chip"><Icon name="users" size={14} /> {jugadorActivo?.nombre}</span>
                <span className="ptp-chip">
                  <Icon name="flame" size={14} /> Racha: {puntosTurno}
                </span>
              </div>
            </div>

            <ol className="ptp-marcador" aria-label="Jugadores">
              {jugadores.map((j) => {
                const esActual = j.id === jugadorActivo?.id;
                const pts = esActual ? puntosTurno : j.puntos;
                return (
                  <li
                    key={j.id}
                    className={`ptp-jugador${j.jugo ? ' respondido' : ''}${esActual ? ' yo' : ''}`}
                    style={{ '--c': colorJugador(j.id) }}
                  >
                    <span className="ptp-jugador-avatar">{inicial(j.nombre)}</span>
                    <span className="ptp-jugador-datos">
                      <span className="ptp-jugador-nombre">{j.nombre}</span>
                      <span className="ptp-jugador-linea">
                        <strong>{j.jugo || esActual ? `${pts} pts` : 'Pendiente'}</strong>
                      </span>
                    </span>
                    <span className="ptp-jugador-estado">
                      {j.jugo ? '✅' : esActual ? '⚡' : '⏳'}
                    </span>
                  </li>
                );
              })}
            </ol>
          </header>

          {/* Temporizador */}
          <div className={`ptp-tiempo ${tiempoRestante <= 10 ? 'critico' : ''}`} role="timer">
            <div className="ptp-tiempo-barra">
              <span style={{ width: `${(tiempoRestante / TIEMPO_TURNO) * 100}%` }} />
            </div>
            <span className="ptp-tiempo-num">
              <Icon name="clock" size={15} /> {tiempoRestante}s
            </span>
          </div>

          <div className="ptp-tarjeta" style={{ padding: '0.8rem 1rem', textAlign: 'center' }}>
            <h2 className="title" style={{ margin: '0.2rem 0', fontSize: '1.25rem', color: '#0f172a' }}>
              ¿Cuál tiene la cifra más grande?
            </h2>
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
        <section className="game ptp-escena">
          <header className="ptp-hero">
            <span className="ptp-hero-deco" aria-hidden="true">
              <Icon name="hourglass" size={140} strokeWidth={1.3} />
            </span>
            <div className="ptp-hero-top">
              <button type="button" className="ptp-salir" onClick={() => setModalSalirPortada(true)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                <span>Portada</span>
              </button>
              <span className="ptp-chip"><Icon name="flagFinish" size={14} /> ¡Racha terminada!</span>
            </div>
            <p className="ptp-etiqueta" style={{ color: 'rgba(255,255,255,0.85)' }}>
              Resultado de {jugadorActivo.nombre}
            </p>
            <h2 className="ptp-solucion-titulo">
              {puntosTurno} {puntosTurno === 1 ? 'acierto' : 'aciertos'}
            </h2>
          </header>

          <div className="ptp-tarjeta">
            <p className="ptp-etiqueta">Clasificación provisional</p>
            <ol className="ptp-ranking">
              {jugadores.map((j, i) => {
                const esActual = j.id === jugadorActivo.id;
                return (
                  <li key={j.id} className={esActual ? 'lider' : ''} style={{ '--c': colorJugador(j.id) }}>
                    <span className="ptp-ranking-pos">{j.jugo ? '✅' : i + 1}</span>
                    <span className="ptp-jugador-avatar">{inicial(j.nombre)}</span>
                    <span className="ptp-ranking-nombre">{j.nombre}</span>
                    <strong>{j.jugo ? `${j.puntos} pts` : 'Pendiente'}</strong>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="ptp-barra estatica">
            {jugadores.some((j) => !j.jugo) ? (
              <button type="button" className="ptp-boton grande" onClick={continuarTrasFallo}>
                <Icon name="play" size={20} /> Siguiente participante
              </button>
            ) : (
              <button type="button" className="ptp-boton grande" onClick={() => setFase('final')}>
                <Icon name="trophy" size={20} /> Ver podio y resultados finales
              </button>
            )}
          </div>
        </section>
      )}

      {/* 6. FINAL */}
      {fase === 'final' && (
        <section className="game ptp-escena">
          <div className="end-card">
            <span className="end-icon"><Icon name="crown" size={44} /></span>
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

          <div className="ptp-barra estatica">
            <button type="button" className="ptp-boton grande" onClick={() => setFase('setup')}>
              <Icon name="refresh" size={20} /> Nueva partida
            </button>
            <button type="button" className="ptp-boton secundario" onClick={() => (onExit ? onExit() : navigate('/'))}>
              <Icon name="door" size={20} /> Salir al menú principal
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