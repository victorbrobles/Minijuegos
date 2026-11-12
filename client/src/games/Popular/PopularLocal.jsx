// client/src/games/Popular/PopularLocal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import './Popular.css';
import { centrarActivo } from '../../lib/centrarActivo.js';
import { limitesLocal } from '../limites.js';
import { SelectorRondas } from '../../components/MenuJuego.jsx';
import { rondasPorDefecto, totalRondas } from '../rondas.js';

const { min: MIN_JUGADORES, max: MAX_JUGADORES } = limitesLocal('popular');
const TIEMPO_TURNO = 45;

export const PUNTOS_POR_PUESTO = {
  1: 2,
  2: 4,
  3: 6,
  4: 8,
  5: 10
};

const COLORES = ['#3b82f6', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4', '#f97316', '#84cc16', '#6366f1'];
export const colorJugador = (i) => COLORES[((i % COLORES.length) + COLORES.length) % COLORES.length];
export const inicial = (n = '?') => n.trim().charAt(0).toUpperCase() || '?';
export const indiceColor = (j, i) => (typeof j?.id === 'number' ? j.id - 1 : i);

/* ==========================================================================
   COMPONENTES DE TABLERO COMPARTIDOS
   ========================================================================== */

export function Aviso({ evento }) {
  const [visible, setVisible] = useState(null);
  const ultimo = useRef(evento?.n ?? 0);

  useEffect(() => {
    if (!evento || evento.n === ultimo.current) return undefined;
    ultimo.current = evento.n;
    setVisible(evento);
    const id = setTimeout(() => setVisible(null), 3500);
    return () => clearTimeout(id);
  }, [evento]);

  if (!visible) return null;
  const bueno = ['acierto', 'ok'].includes(visible.tipo);
  const malo = ['fallo', 'tiempo', 'error'].includes(visible.tipo);

  return (
    <div className={`cnp-aviso${bueno ? ' bueno' : ''}${malo ? ' malo' : ''}`} role="status" aria-live="polite">
      <span aria-hidden="true">{bueno ? '🎉' : malo ? '❌' : 'ℹ️'}</span>
      {visible.texto}
    </div>
  );
}

export function BotonPortada({ onClick, texto = 'Portada' }) {
  return (
    <button type="button" className="qqp-salir" onClick={onClick}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      <span>{texto}</span>
    </button>
  );
}

export function Avatar({ nombre, color, grande = false }) {
  return (
    <span className={`qqp-avatar${grande ? ' grande' : ''}`} style={{ '--c': color }}>
      {inicial(nombre)}
    </span>
  );
}

export function Cabecera({ onSalir, textoSalir = 'Portada', onAyuda, categoria, etiqueta, titulo, avatar, chips, children }) {
  return (
    <header className="qqp-hero">
      <span className="qqp-hero-deco" aria-hidden="true">
        <Icon name="trophy" size={150} strokeWidth={1.4} />
      </span>
      <div className="qqp-hero-top">
        {onSalir ? <BotonPortada onClick={onSalir} texto={textoSalir} /> : <span />}
        <div className="qqp-hero-chips">
          {chips}
          {categoria && (
            <span className="qqp-chip" title="Estado de la ronda">
              <Icon name={categoria.icono || 'trophy'} size={14} /> <span>{categoria.nombre}</span>
            </span>
          )}
          {onAyuda && (
            <button type="button" className="qqp-ayuda" onClick={onAyuda} title="Cómo jugar" aria-label="Cómo jugar">
              ?
            </button>
          )}
        </div>
      </div>
      <div className="qqp-hero-cuerpo">
        {avatar}
        <div className="qqp-hero-textos">
          {etiqueta && <p className="qqp-hero-etiqueta">{etiqueta}</p>}
          <h2 className="qqp-hero-titulo">{titulo}</h2>
        </div>
      </div>
      {children}
    </header>
  );
}

export function OrdenTurnos({ jugadores, activoId, puntosMap = null }) {
  const ref = useRef(null);
  useEffect(() => {
    centrarActivo(ref.current);
  }, [activoId]);

  return (
    <ol className="qqp-orden" ref={ref} aria-label="Estado de los jugadores">
      {jugadores.map((j, i) => {
        const esActivo = j.id === activoId;
        const pts = puntosMap ? (puntosMap[j.id] ?? 0) : (j.puntos ?? 0);
        return (
          <li
            key={j.id}
            className={`qqp-orden-item${esActivo ? ' activo' : ''}`}
            style={{ '--c': colorJugador(indiceColor(j, i)) }}
            aria-current={esActivo ? 'step' : undefined}
          >
            <span className="qqp-orden-avatar">{inicial(j.nombre)}</span>
            <span className="qqp-orden-nombre">{j.nombre}</span>
            <span className="qqp-orden-pts">{pts}p</span>
          </li>
        );
      })}
    </ol>
  );
}

export function BotonPrincipal({ children, onClick, disabled, type = 'button' }) {
  return (
    <button type={type} className="qqp-boton" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export function EnlaceSecundario({ children, onClick, disabled }) {
  return (
    <button type="button" className="qqp-enlace" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

/* ==========================================================================
   MODO LOCAL: SIGUE LA MODA (POPULAR)
   ========================================================================== */

export default function PopularLocal({ onVolver, onExit, onAbrirAyuda }) {
  const navigate = useNavigate();

  // Fases: 'setup' | 'pasar_turno' | 'jugando' | 'resolucion_respuestas' | 'resolucion_puntos' | 'final'
  const [fase, setFase] = useState('setup');
  const [modalSalirPortada, setModalSalirPortada] = useState(false);

  const [numJugadores, setNumJugadores] = useState(MIN_JUGADORES);
  const [jugadores, setJugadores] = useState(() => Array.from({ length: MIN_JUGADORES }, (_, i) => ({ id: i + 1, nombre: `Jugador ${i + 1}` })));
  const [rondasSel, setRondasSel] = useState(rondasPorDefecto('popular'));
  const MAX_RONDAS = totalRondas('popular', rondasSel, jugadores.length);
  const [puntos, setPuntos] = useState({});

  const [rondaNum, setRondaNum] = useState(1);
  const [usados, setUsados] = useState([]);
  const [preguntaData, setPreguntaData] = useState(null);

  const [acertados, setAcertados] = useState({});
  const [ordenTurnos, setOrdenTurnos] = useState([]);
  const [indiceTurno, setIndiceTurno] = useState(0);

  const [pistasJugadores, setPistasJugadores] = useState({});

  const [inputTexto, setInputTexto] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [solucionFinal, setSolucionFinal] = useState(null);

  const [tiempoRestante, setTiempoRestante] = useState(TIEMPO_TURNO);
  const timerRef = useRef(null);

  const [eventoAviso, setEventoAviso] = useState(null);
  const avisoSeqRef = useRef(0);

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
    listaActualizada.forEach((j) => { scores[j.id] = 0; });
    setPuntos(scores);

    setRondaNum(1);
    setUsados([]);
    cargarNuevaRonda(1, [], listaActualizada);
  };

  const cargarNuevaRonda = async (numRonda, listaUsados = usados, listaJug = jugadores) => {
    try {
      const res = await fetch('/api/popular/ronda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usados: listaUsados })
      });
      const data = await res.json();

      if (data.success) {
        setPreguntaData(data);
        setUsados([...listaUsados, data.id]);
        setAcertados({});
        setPistasJugadores({});
        setInputTexto('');
        setFeedback(null);
        setSolucionFinal(null);

        const ids = listaJug.map((j) => j.id);
        const primerIdx = Math.floor(Math.random() * ids.length);
        const orden = [];
        for (let i = 0; i < ids.length; i++) {
          orden.push(ids[(primerIdx + i) % ids.length]);
        }
        setOrdenTurnos(orden);
        setIndiceTurno(0);
        setFase('pasar_turno');
      }
    } catch {
      alert('Error al cargar la ronda desde el servidor.');
    }
  };

  const jugadorActivoId = ordenTurnos[indiceTurno];
  const jugadorActivo = jugadores.find((j) => j.id === jugadorActivoId);
  const jugadoresEnOrden = ordenTurnos.map((id) => jugadores.find((j) => j.id === id)).filter(Boolean);

  const avanzarTurno = () => {
    setInputTexto('');
    setFeedback(null);
    setIndiceTurno((prev) => (prev + 1) % ordenTurnos.length);
    setFase('pasar_turno');
  };

  const avanzarTurnoRef = useRef();
  useEffect(() => {
    avanzarTurnoRef.current = avanzarTurno;
  });

  useEffect(() => {
    if (fase !== 'jugando' || feedback !== null) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    setTiempoRestante(TIEMPO_TURNO);
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          if (avanzarTurnoRef.current) avanzarTurnoRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fase, indiceTurno, feedback]);

  const pedirSiguientePistaPuesto = async (puesto) => {
    if (!jugadorActivo || !preguntaData || feedback !== null) return;
    const actual = pistasJugadores[jugadorActivo.id]?.[puesto] || {};
    const tipo = !actual.longitud ? 'longitud' : !actual.letras ? 'letras' : null;
    if (!tipo) return;

    try {
      const res = await fetch('/api/popular/pista', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: preguntaData.id,
          puesto,
          tipo
        })
      });
      const data = await res.json();

      if (data.success) {
        setPuntos((prev) => ({
          ...prev,
          [jugadorActivo.id]: (prev[jugadorActivo.id] || 0) - 1
        }));

        setPistasJugadores((prev) => {
          const userPistas = { ...(prev[jugadorActivo.id] || {}) };
          const puestoPistas = { ...(userPistas[puesto] || {}) };
          puestoPistas[tipo] = data.esqueleto;
          userPistas[puesto] = puestoPistas;
          return { ...prev, [jugadorActivo.id]: userPistas };
        });
      }
    } catch {
      alert('Error al solicitar la pista.');
    }
  };

  const enviarRespuesta = async (e) => {
    e.preventDefault();
    if (!inputTexto.trim() || !preguntaData || feedback !== null) return;

    try {
      const puestosDescubiertos = Object.keys(acertados).map(Number);
      const res = await fetch('/api/popular/validar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: preguntaData.id,
          respuesta: inputTexto,
          acertados: puestosDescubiertos
        })
      });
      const data = await res.json();

      if (data.acierto) {
        setPuntos((prev) => ({
          ...prev,
          [jugadorActivo.id]: (prev[jugadorActivo.id] || 0) + data.puntos
        }));

        const nuevosAcertados = {
          ...acertados,
          [data.puesto]: {
            texto: data.texto,
            puntos: data.puntos,
            jugador: jugadorActivo.nombre
          }
        };
        setAcertados(nuevosAcertados);
        setInputTexto('');

        const msgAcierto = `¡${jugadorActivo.nombre} descubre el Top #${data.puesto}: «${data.texto}» (+${data.puntos} pts)!`;
        avisoSeqRef.current += 1;
        setEventoAviso({ n: avisoSeqRef.current, tipo: 'acierto', texto: msgAcierto });

        if (Object.keys(nuevosAcertados).length >= 5) {
          terminarRonda();
        } else {
          setFeedback({
            tipo: 'acierto',
            msg: `🎉 ¡Acierto! Top #${data.puesto}: «${data.texto}» (+${data.puntos} pts)`
          });

          setTimeout(() => {
            setFeedback(null);
            avanzarTurno();
          }, 1400);
        }
      } else {
        const msgFallo = `«${inputTexto}» no está en el Top 5. Turno para el siguiente jugador.`;
        avisoSeqRef.current += 1;
        setEventoAviso({ n: avisoSeqRef.current, tipo: 'fallo', texto: msgFallo });

        setFeedback({
          tipo: 'fallo',
          msg: `❌ ${msgFallo}`
        });
        setInputTexto('');

        setTimeout(() => {
          setFeedback(null);
          avanzarTurno();
        }, 1400);
      }
    } catch {
      alert('Error validando respuesta.');
    }
  };

  const terminarRonda = async () => {
    try {
      const res = await fetch('/api/popular/solucion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: preguntaData.id })
      });
      const data = await res.json();

      if (data.success) {
        setSolucionFinal(data.respuestas);
        setFeedback(null);
        setFase('resolucion_respuestas');
      }
    } catch {
      setFase('resolucion_respuestas');
    }
  };

  const siguienteRonda = () => {
    if (rondaNum >= MAX_RONDAS) {
      setFase('final');
    } else {
      const sig = rondaNum + 1;
      setRondaNum(sig);
      cargarNuevaRonda(sig);
    }
  };

  const ranking = [...jugadores].sort((a, b) => (puntos[b.id] ?? 0) - (puntos[a.id] ?? 0));
  const maximo = ranking.length ? (puntos[ranking[0].id] ?? 0) : 0;
  const ganadores = maximo > 0 ? ranking.filter((j) => (puntos[j.id] ?? 0) === maximo) : [];

  const misPistas = (jugadorActivo && pistasJugadores[jugadorActivo.id]) || {};
  const totalDescubiertos = Object.keys(acertados).length;
  const enPartidaActiva = fase !== 'setup';

  return (
    <div className={`pop-contenedor ${enPartidaActiva ? 'qq-en-partida' : ''}`}>
      <Aviso evento={eventoAviso} />

      {/* 1. CONFIGURACIÓN DE JUGADORES */}
      {fase === 'setup' && (
        <section className="game">
          <div className="panel qq-menu-panel">
            <div className="qq-card-top">
              <button type="button" className="qq-link-volver" onClick={onVolver}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                <span>Volver</span>
              </button>
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
              <label className="qq-label-destacado" htmlFor="num-jugadores-pop">
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
                  id="num-jugadores-pop"
                  className="qq-select-jugadores"
                  value={numJugadores}
                  onChange={(e) => actualizarCantidadJugadores(parseInt(e.target.value, 10))}
                >
                  {Array.from({ length: MAX_JUGADORES - MIN_JUGADORES + 1 }, (_, i) => (
                    <option key={i + MIN_JUGADORES} value={i + MIN_JUGADORES}>
                      {i + MIN_JUGADORES} {i + MIN_JUGADORES === 1 ? 'jugador' : 'jugadores'}
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
                    style={{ background: colorJugador(idx) }}
                  >
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={j.nombre}
                    onChange={(e) => handleNombreChange(idx, e.target.value)}
                    placeholder={`Jugador ${j.id}`}
                    maxLength={20}
                  />
                </div>
              ))}
            </div>

            <SelectorRondas juegoId="popular" valor={rondasSel} onCambiar={setRondasSel} numJugadores={jugadores.length} />
            <button
              type="button"
              className="big full qq-btn-principal"
              style={{ marginTop: '1.5rem' }}
              onClick={iniciarPartida}
            >
              <Icon name="play" size={22} /> ¡Iniciar juego!
            </button>
          </div>
        </section>
      )}

      {/* 2. PASAR TURNO */}
      {fase === 'pasar_turno' && jugadorActivo && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            categoria={{ nombre: `${totalDescubiertos}/5 descubiertos`, icono: 'trophy' }}
            etiqueta={`Ronda ${rondaNum} de ${MAX_RONDAS}`}
            titulo="Pasad el móvil"
          >
            <OrdenTurnos
              jugadores={jugadoresEnOrden}
              activoId={jugadorActivo.id}
              puntosMap={puntos}
            />
          </Cabecera>

          <div className="qqp-tarjeta qqp-pasar">
            <Avatar nombre={jugadorActivo.nombre} color={colorJugador(indiceColor(jugadorActivo, 0))} grande />
            <p className="qqp-pasar-para">Le toca a</p>
            <h3 className="qqp-pasar-nombre">{jugadorActivo.nombre}</h3>
            <p className="qqp-texto">
              Tendrás <strong>{TIEMPO_TURNO} segundos</strong> para intentar adivinar una de las 5 respuestas más populares o pedir pista en el puesto que prefieras.
            </p>
          </div>

          <div className="qqp-barra">
            <BotonPrincipal onClick={() => setFase('jugando')}>
              <Icon name="play" size={22} /> Soy {jugadorActivo.nombre}, ¡a jugar!
            </BotonPrincipal>
          </div>
        </section>
      )}

      {/* 3. JUGANDO */}
      {fase === 'jugando' && preguntaData && jugadorActivo && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            categoria={{ nombre: 'Top 5 más popular', icono: 'trophy' }}
            etiqueta={`Ronda ${rondaNum} de ${MAX_RONDAS} · Turno activo`}
            titulo={jugadorActivo.nombre}
            avatar={<Avatar nombre={jugadorActivo.nombre} color={colorJugador(indiceColor(jugadorActivo, 0))} />}
          >
            <div className="qqp-identidad pop-consigna-box">
              <div className="pop-consigna-top">
                <span className="qqp-identidad-icono">
                  <Icon name="trophy" size={16} strokeWidth={2.4} />
                </span>
                <span className="pop-consigna-texto">«{preguntaData.pregunta}»</span>
              </div>

              <div className="pop-hero-stats">
                <span className="pop-hero-stat ok">✅ {totalDescubiertos}/5 descubiertos</span>
                <span className={`pop-hero-stat timer${tiempoRestante <= 10 ? ' low' : ''}`}>
                  <Icon name="clock" size={14} /> {tiempoRestante}s
                </span>
              </div>

              <div className="pop-timer-track" role="timer">
                <div
                  className={`pop-timer-fill${tiempoRestante <= 10 ? ' low' : ''}`}
                  style={{ width: `${(tiempoRestante / TIEMPO_TURNO) * 100}%` }}
                />
              </div>
            </div>

            <OrdenTurnos
              jugadores={jugadoresEnOrden}
              activoId={jugadorActivo.id}
              puntosMap={puntos}
            />
          </Cabecera>

          {feedback && (
            <div className={`pop-feedback-banner ${feedback.tipo}`} role="status">
              {feedback.msg}
            </div>
          )}

          {/* Lista de los 5 puestos con botón de pista integrado */}
          <div className="qqp-tarjeta">
            <p className="qqp-carta-cara-titulo" style={{ marginBottom: '0.7rem' }}>
              <Icon name="eye" size={16} /> Respuestas más populares (Top 1 a 5)
            </p>

            <div className="popp-slots-lista">
              {[1, 2, 3, 4, 5].map((puesto) => {
                const descubierto = acertados[puesto];
                const pistaPuesto = misPistas[puesto];
                const tieneLongitud = Boolean(pistaPuesto?.longitud);
                const tieneLetras = Boolean(pistaPuesto?.letras);
                const esqueletoVisible = pistaPuesto?.letras || pistaPuesto?.longitud;

                return (
                  <div key={puesto} className={`popp-slot-card ${descubierto ? 'revelado' : ''}`}>
                    <div className="popp-slot-main">
                      <span className={`popp-puesto-num p-${puesto}`}>#{puesto}</span>

                      <div className="popp-slot-contenido">
                        {descubierto ? (
                          <>
                            <span className="popp-slot-texto">{descubierto.texto}</span>
                            <span className="popp-slot-autor">Acertado por {descubierto.jugador}</span>
                          </>
                        ) : esqueletoVisible ? (
                          <div className="popp-ahorcado-wrap">
                            {esqueletoVisible.split('   /   ').map((palabra, pIdx) => (
                              <span key={pIdx} className="popp-palabra-chip">
                                {palabra}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="popp-slot-incognita">Respuesta oculta</span>
                        )}
                      </div>
                    </div>

                    <div className="popp-slot-derecha">
                      {!descubierto && !tieneLetras && (
                        <button
                          type="button"
                          className={`popp-btn-pista-slot ${tieneLongitud ? 'fase2' : ''}`}
                          onClick={() => pedirSiguientePistaPuesto(puesto)}
                          disabled={feedback !== null}
                          title={
                            !tieneLongitud
                              ? `Ver huecos de letras del Top #${puesto} (-1 pt)`
                              : `Revelar letras del Top #${puesto} (-1 pt)`
                          }
                        >
                          <span>{!tieneLongitud ? '💡 Pista' : '🔤 +Letras'}</span>
                          <small>-1 pt</small>
                        </button>
                      )}
                      <span className="popp-puntos-badge">+{PUNTOS_POR_PUESTO[puesto]} pts</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <form onSubmit={enviarRespuesta} className="pop-form-respuesta">
              <label className="qq-label-destacado" htmlFor="popp-input-local">
                Escribe una respuesta para cualquier puesto del Top 5
              </label>
              <div className="pop-form-row">
                <input
                  id="popp-input-local"
                  type="text"
                  autoFocus
                  className="qq-input-moderno"
                  placeholder="Escribe una palabra clave o respuesta…"
                  value={inputTexto}
                  onChange={(e) => setInputTexto(e.target.value)}
                  disabled={feedback !== null}
                  autoComplete="off"
                />
                <button
                  type="submit"
                  className="pop-btn-comprobar"
                  disabled={!inputTexto.trim() || feedback !== null}
                >
                  <Icon name="check" size={18} strokeWidth={2.5} /> Comprobar
                </button>
              </div>
            </form>
          </div>

          <div className="qqp-barra">
            <EnlaceSecundario onClick={avanzarTurno} disabled={feedback !== null}>
              <Icon name="refresh" size={16} /> Pasar turno al siguiente jugador
            </EnlaceSecundario>
            <EnlaceSecundario onClick={terminarRonda}>
              <Icon name="flagFinish" size={16} /> Rendirse y ver las 5 soluciones
            </EnlaceSecundario>
          </div>
        </section>
      )}

      {/* 4A. PANTALLA 1 DE FIN DE RONDA: LAS 5 RESPUESTAS */}
      {fase === 'resolucion_respuestas' && preguntaData && solucionFinal && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            categoria={{ nombre: 'Paso 1 de 2 · Soluciones', icono: 'eye' }}
            etiqueta={`Ronda ${rondaNum} de ${MAX_RONDAS} completada`}
            titulo="Soluciones del Top 5"
          >
            <div className="qqp-identidad">
              <span className="qqp-identidad-icono"><Icon name="check" size={16} strokeWidth={2.5} /></span>
              <span>«{preguntaData.pregunta}»</span>
            </div>
          </Cabecera>

          <div className="qqp-tarjeta">
            <p className="qqp-carta-cara-titulo" style={{ marginBottom: '0.75rem' }}>
              <Icon name="eye" size={16} /> Las 5 respuestas más populares
            </p>

            <div className="popp-slots-lista">
              {solucionFinal.map((resp) => {
                const acertador = acertados[resp.puesto];
                return (
                  <div
                    key={resp.puesto}
                    className={`popp-slot-card ${acertador ? 'revelado' : 'no-acertado'}`}
                  >
                    <div className="popp-slot-main">
                      <span className={`popp-puesto-num p-${resp.puesto}`}>#{resp.puesto}</span>
                      <div className="popp-slot-contenido">
                        <span className="popp-slot-texto">{resp.texto}</span>
                        <span className="popp-slot-autor">
                          {acertador ? `🎉 Acertado por ${acertador.jugador}` : 'Sin descubrir'}
                        </span>
                      </div>
                    </div>
                    <span className="popp-puntos-badge">+{resp.puntos} pts</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="qqp-barra">
            <BotonPrincipal onClick={() => setFase('resolucion_puntos')}>
              <Icon name="trophy" size={20} /> Continuar a las puntuaciones
            </BotonPrincipal>
          </div>
        </section>
      )}

      {/* 4B. PANTALLA 2 DE FIN DE RONDA: CLASIFICACIÓN GENERAL */}
      {fase === 'resolucion_puntos' && preguntaData && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            categoria={{ nombre: 'Paso 2 de 2 · Clasificación', icono: 'trophy' }}
            etiqueta={`Ronda ${rondaNum} de ${MAX_RONDAS} completada`}
            titulo="Puntuaciones actuales"
          >
            <div className="qqp-identidad">
              <span className="qqp-identidad-icono"><Icon name="trophy" size={16} /></span>
              <span>«{preguntaData.pregunta}»</span>
            </div>
          </Cabecera>

          <div className="qqp-tarjeta">
            <p className="qqp-carta-cara-titulo" style={{ marginBottom: '0.8rem' }}>
              <Icon name="trophy" size={16} /> Clasificación general
            </p>
            <ul className="qqp-rivales">
              {ranking.map((j, i) => {
                const pts = puntos[j.id] ?? 0;
                const lider = maximo > 0 && pts === maximo;
                return (
                  <li key={j.id} className="qqp-rival" style={{ '--c': colorJugador(indiceColor(j, i)) }}>
                    <span className="qqp-rival-avatar">{lider ? '👑' : i + 1}</span>
                    <span className="qqp-rival-datos">
                      <span className="qqp-rival-nombre">{lider ? 'Líder actual' : `Puesto ${i + 1}`}</span>
                      <strong className="qqp-rival-tarjeta">{j.nombre}</strong>
                    </span>
                    <span className="pop-ranking-pts">{pts} pts</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="qqp-barra">
            {rondaNum < MAX_RONDAS ? (
              <BotonPrincipal onClick={siguienteRonda}>
                <Icon name="play" size={20} /> Siguiente ronda ({rondaNum + 1} de {MAX_RONDAS})
              </BotonPrincipal>
            ) : (
              <BotonPrincipal onClick={() => setFase('final')}>
                <Icon name="trophy" size={20} /> Ver podio final
              </BotonPrincipal>
            )}
            <EnlaceSecundario onClick={() => setFase('resolucion_respuestas')}>
              ← Volver a ver las 5 respuestas
            </EnlaceSecundario>
            <EnlaceSecundario onClick={() => setFase('final')}>
              Finalizar partida anticipadamente
            </EnlaceSecundario>
          </div>
        </section>
      )}

      {/* 5. PODIO FINAL */}
      {fase === 'final' && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            etiqueta="Partida terminada"
            titulo="Clasificación Final"
            avatar={<span className="qqp-avatar" style={{ '--c': '#f59e0b' }}>🏆</span>}
          >
            <div className="qqp-identidad">
              <span className="qqp-identidad-icono"><Icon name="crown" size={16} /></span>
              <span>
                {ganadores.length === 0
                  ? 'Nadie ha conseguido puntos en esta partida.'
                  : ganadores.length === 1
                  ? <>¡Victoria para <strong>{ganadores[0].nombre}</strong> con <strong>{maximo} pts</strong>!</>
                  : <>Empate entre <strong>{ganadores.map((g) => g.nombre).join(', ')}</strong> con <strong>{maximo} pts</strong></>}
              </span>
            </div>
          </Cabecera>

          <div className="qqp-tarjeta">
            <p className="qqp-carta-cara-titulo" style={{ marginBottom: '0.8rem' }}>
              <Icon name="users" size={16} /> Podio de jugadores
            </p>
            <ul className="qqp-rivales">
              {ranking.map((j, i) => {
                const pts = puntos[j.id] ?? 0;
                const lider = maximo > 0 && pts === maximo;
                return (
                  <li key={j.id} className="qqp-rival" style={{ '--c': colorJugador(indiceColor(j, i)) }}>
                    <span className="qqp-rival-avatar">{lider ? '👑' : i + 1}</span>
                    <span className="qqp-rival-datos">
                      <span className="qqp-rival-nombre">{lider ? '¡Ganador!' : `Puesto ${i + 1}`}</span>
                      <strong className="qqp-rival-tarjeta">{j.nombre}</strong>
                    </span>
                    <span className="pop-ranking-pts">{pts} pts</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="qqp-barra">
            <BotonPrincipal onClick={() => setFase('setup')}>
              <Icon name="refresh" size={20} /> Nueva partida
            </BotonPrincipal>
            <EnlaceSecundario onClick={() => setModalSalirPortada(true)}>
              Salir a la portada principal
            </EnlaceSecundario>
          </div>
        </section>
      )}

      {/* MODAL SALIR A PORTADA */}
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