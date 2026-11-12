// client/src/games/Aproximacion/AproximacionLocal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import './Aproximacion.css';
import { centrarActivo } from '../../lib/centrarActivo.js';
import { limitesLocal } from '../limites.js';

const MAX_RONDAS = 15;
const { min: MIN_JUGADORES, max: MAX_JUGADORES } = limitesLocal('aproximacion');
const TIEMPO_TURNO = 30;

const COLORES = ['#3b82f6', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4', '#f97316'];
export const colorJugador = (i) => COLORES[((i % COLORES.length) + COLORES.length) % COLORES.length];
export const inicial = (nombre = '?') => nombre.trim().charAt(0).toUpperCase() || '?';
export const indiceColor = (j, i) => (typeof j?.id === 'number' ? j.id - 1 : i);

/* ==========================================================================
   COMPONENTES DE TABLERO COMPARTIDOS (UNIFICADOS CON BUSCAMINAS / QUIÉN ES QUIÉN)
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
  const bueno = ['acierto', 'confia', 'ok'].includes(visible.tipo);
  const malo = ['fallo', 'tiempo', 'error'].includes(visible.tipo);

  return (
    <div className={`cnp-aviso${bueno ? ' bueno' : ''}${malo ? ' malo' : ''}`} role="status" aria-live="polite">
      <span aria-hidden="true">{bueno ? '🎯' : malo ? '⏰' : 'ℹ️'}</span>
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
        <Icon name="target" size={150} strokeWidth={1.4} />
      </span>
      <div className="qqp-hero-top">
        {onSalir ? <BotonPortada onClick={onSalir} texto={textoSalir} /> : <span />}
        <div className="qqp-hero-chips">
          {chips}
          {categoria && (
            <span className="qqp-chip" title="Tipo de pregunta">
              <Icon name={categoria.icono || 'target'} size={14} /> <span>{categoria.nombre}</span>
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
    <ol className="qqp-orden" ref={ref} aria-label="Orden de jugadores">
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
   MODO LOCAL: APROXIMACIÓN
   ========================================================================== */

export default function AproximacionLocal({ onVolver, onExit, onAbrirAyuda }) {
  const navigate = useNavigate();

  const [fase, setFase] = useState('setup');
  const [modalSalirPortada, setModalSalirPortada] = useState(false);

  const [numJugadores, setNumJugadores] = useState(MIN_JUGADORES);
  const [jugadores, setJugadores] = useState(() => Array.from({ length: MIN_JUGADORES }, (_, i) => ({ id: i + 1, nombre: `Jugador ${i + 1}` })));
  const [puntos, setPuntos] = useState({});

  const [preguntas, setPreguntas] = useState([]);
  const [rondaActual, setRondaActual] = useState(1);
  const [preguntaActual, setPreguntaActual] = useState(null);

  const [primerIndexInicial, setPrimerIndexInicial] = useState(null);
  const [ordenTurnos, setOrdenTurnos] = useState([]);
  const [subTurnoIndex, setSubTurnoIndex] = useState(0);
  const [decisiones, setDecisiones] = useState({});

  const [inputNumero, setInputNumero] = useState('');
  const [confianzaElegida, setConfianzaElegida] = useState(null);
  const [inputRealManual, setInputRealManual] = useState('');
  const [errorInput, setErrorInput] = useState('');

  const [resultadoRonda, setResultadoRonda] = useState(null);
  const [tiempoRestante, setTiempoRestante] = useState(TIEMPO_TURNO);

  const [eventoAviso, setEventoAviso] = useState(null);
  const avisoSeqRef = useRef(0);

  const inputNumeroRef = useRef(inputNumero);
  const confianzaElegidaRef = useRef(confianzaElegida);
  const faseRef = useRef(fase);

  useEffect(() => {
    inputNumeroRef.current = inputNumero;
    confianzaElegidaRef.current = confianzaElegida;
    faseRef.current = fase;
  }, [inputNumero, confianzaElegida, fase]);

  useEffect(() => {
    fetch('/api/aproximacion/preguntas')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => setPreguntas(data))
      .catch((err) => console.error('Error cargando preguntas:', err));
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

  const iniciarPartida = () => {
    const listaActualizada = jugadores.map((j) => ({
      ...j,
      nombre: j.nombre.trim() || `Jugador ${j.id}`
    }));
    setJugadores(listaActualizada);

    const puntuaciones = {};
    listaActualizada.forEach((j) => {
      puntuaciones[j.id] = 0;
    });
    setPuntos(puntuaciones);

    const primerIndexSorteado = Math.floor(Math.random() * listaActualizada.length);
    setPrimerIndexInicial(primerIndexSorteado);

    setRondaActual(1);
    prepararRonda(1, listaActualizada, primerIndexSorteado);
  };

  const prepararRonda = (numRonda, listaJugadores = jugadores, baseIndex = primerIndexInicial) => {
    const preg = preguntas[(numRonda - 1) % Math.max(1, preguntas.length)] || {
      id: 999,
      pregunta: '¿Cuántos países reconocidos hay en el mundo?',
      respuesta: 195,
      manual: false
    };
    setPreguntaActual(preg);

    const primerIndex = (baseIndex + (numRonda - 1)) % listaJugadores.length;
    const orden = [];
    for (let i = 0; i < listaJugadores.length; i++) {
      orden.push((primerIndex + i) % listaJugadores.length);
    }

    setOrdenTurnos(orden);
    setSubTurnoIndex(0);
    setDecisiones({});
    setResultadoRonda(null);
    setInputNumero('');
    setConfianzaElegida(null);
    setInputRealManual('');
    setErrorInput('');
    setFase('turno');
    setTiempoRestante(TIEMPO_TURNO);
  };

  const jugadorActual = jugadores[ordenTurnos[subTurnoIndex]];
  const primerJugadorRonda = jugadores[ordenTurnos[0]];
  const jugadoresEnOrden = ordenTurnos.map((idx) => jugadores[idx]).filter(Boolean);
  const esPrimerJugador = subTurnoIndex === 0;

  const respuestasDadas = Object.entries(decisiones)
    .filter(([, d]) => d.tipo === 'propia')
    .map(([jId, d]) => ({
      jugadorId: Number(jId),
      jugadorNombre: jugadores.find((j) => j.id === Number(jId))?.nombre,
      valor: d.valor
    }));

  useEffect(() => {
    if (fase !== 'turno' && fase !== 'segunda_vuelta_inicial') return;

    setTiempoRestante(TIEMPO_TURNO);

    const id = setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          forzarEnvioTurno();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subTurnoIndex, fase]);

  const forzarEnvioTurno = () => {
    if (faseRef.current === 'turno') {
      let nuevaDecision = null;
      if (confianzaElegidaRef.current !== null) {
        const jugadorReferencia = respuestasDadas.find((r) => r.jugadorId === confianzaElegidaRef.current);
        if (jugadorReferencia) {
          nuevaDecision = {
            tipo: 'confia',
            valor: jugadorReferencia.valor,
            confiaEnId: jugadorReferencia.jugadorId
          };
        }
      }

      if (!nuevaDecision) {
        let numVal = 0;
        if (inputNumeroRef.current !== '' && !isNaN(Number(inputNumeroRef.current))) {
          numVal = Math.round(Number(inputNumeroRef.current));
        }

        let valorFinal = numVal;
        while (respuestasDadas.some((r) => r.valor === valorFinal)) {
          valorFinal++;
        }

        nuevaDecision = {
          tipo: 'propia',
          valor: valorFinal,
          confiaEnId: null
        };
      }

      avisoSeqRef.current += 1;
      setEventoAviso({
        n: avisoSeqRef.current,
        tipo: 'tiempo',
        texto: `¡Tiempo agotado! Se asigna respuesta a ${jugadorActual?.nombre}.`
      });

      setDecisiones((prev) => {
        const nuevasDecisiones = {
          ...prev,
          [jugadorActual.id]: nuevaDecision
        };
        setTimeout(() => avanzarSiguienteTurno(nuevasDecisiones), 0);
        return nuevasDecisiones;
      });
    } else if (faseRef.current === 'segunda_vuelta_inicial') {
      confirmarSegundaVuelta(null);
    }
  };

  const confirmarTurno = (e) => {
    if (e) e.preventDefault();
    setErrorInput('');

    let nuevaDecision = null;

    if (confianzaElegida !== null) {
      const jugadorReferencia = respuestasDadas.find((r) => r.jugadorId === confianzaElegida);
      if (!jugadorReferencia) {
        setErrorInput('Selecciona un jugador válido en el que confiar.');
        return;
      }
      nuevaDecision = {
        tipo: 'confia',
        valor: jugadorReferencia.valor,
        confiaEnId: jugadorReferencia.jugadorId
      };

      avisoSeqRef.current += 1;
      setEventoAviso({
        n: avisoSeqRef.current,
        tipo: 'confia',
        texto: `${jugadorActual.nombre} confía en el ${jugadorReferencia.valor} de ${jugadorReferencia.jugadorNombre}.`
      });
    } else {
      if (inputNumero === '' || isNaN(Number(inputNumero))) {
        setErrorInput('Introduce un número válido.');
        return;
      }

      const numVal = Math.round(Number(inputNumero));
      const yaExiste = respuestasDadas.some((r) => r.valor === numVal);
      if (yaExiste) {
        setErrorInput(`El número ${numVal} ya ha sido dicho. Escribe otro o pulsa en su tarjeta para confiar en él.`);
        return;
      }

      nuevaDecision = {
        tipo: 'propia',
        valor: numVal,
        confiaEnId: null
      };

      avisoSeqRef.current += 1;
      setEventoAviso({
        n: avisoSeqRef.current,
        tipo: 'ok',
        texto: `${jugadorActual.nombre} apuesta por el número ${numVal}.`
      });
    }

    const nuevasDecisiones = {
      ...decisiones,
      [jugadorActual.id]: nuevaDecision
    };

    setDecisiones(nuevasDecisiones);
    avanzarSiguienteTurno(nuevasDecisiones);
  };

  const avanzarSiguienteTurno = (nuevasDecisiones) => {
    setInputNumero('');
    setConfianzaElegida(null);
    setErrorInput('');

    if (subTurnoIndex + 1 < ordenTurnos.length) {
      setSubTurnoIndex(subTurnoIndex + 1);
    } else {
      const idPrimerJugador = jugadores[ordenTurnos[0]].id;
      const otrasRespuestas = Object.entries(nuevasDecisiones).filter(
        ([id, d]) => Number(id) !== idPrimerJugador && d.tipo === 'propia'
      );

      if (otrasRespuestas.length === 0) {
        finalizarVueltas(nuevasDecisiones);
      } else {
        setFase('segunda_vuelta_inicial');
      }
    }
  };

  const confirmarSegundaVuelta = (cambiarAId = null) => {
    const idPrimerJugador = jugadores[ordenTurnos[0]].id;
    let decsFinales = { ...decisiones };

    if (cambiarAId !== null) {
      const ref = respuestasDadas.find((r) => r.jugadorId === cambiarAId);
      if (ref) {
        decsFinales[idPrimerJugador] = {
          tipo: 'confia',
          valor: ref.valor,
          confiaEnId: ref.jugadorId
        };
        setDecisiones(decsFinales);
      }
    }

    finalizarVueltas(decsFinales);
  };

  const finalizarVueltas = (decsFinales) => {
    if (preguntaActual.manual) {
      setInputRealManual('');
      setFase('introducir_real');
    } else {
      concluirRonda(decsFinales, preguntaActual.respuesta);
    }
  };

  const confirmarCifraRealManual = (e) => {
    e.preventDefault();
    if (inputRealManual === '' || isNaN(Number(inputRealManual))) {
      setErrorInput('Introduce un número válido.');
      return;
    }

    const valorReal = Math.round(Number(inputRealManual));
    setPreguntaActual((prev) => ({ ...prev, respuesta: valorReal }));
    concluirRonda(decisiones, valorReal);
  };

  const concluirRonda = (decsFinales, objetivoReal) => {
    const objetivo = objetivoReal;
    const scoresRonda = {};
    jugadores.forEach((j) => (scoresRonda[j.id] = 0));

    const respuestasUnicasMap = new Map();

    Object.entries(decsFinales).forEach(([jId, dec]) => {
      if (dec.tipo === 'propia') {
        respuestasUnicasMap.set(dec.valor, {
          autorId: Number(jId),
          valor: dec.valor,
          distancia: Math.abs(dec.valor - objetivo)
        });
      }
    });

    const listaUnicas = Array.from(respuestasUnicasMap.values()).sort(
      (a, b) => a.distancia - b.distancia
    );

    const exactas = listaUnicas.filter((item) => item.distancia === 0);
    const noExactas = listaUnicas.filter((item) => item.distancia > 0);

    exactas.forEach((item) => {
      scoresRonda[item.autorId] += 15;
      Object.entries(decsFinales).forEach(([jId, dec]) => {
        if (Number(jId) !== item.autorId && dec.valor === item.valor) {
          scoresRonda[Number(jId)] += 8;
        }
      });
    });

    if (noExactas.length > 0) {
      const minDist = noExactas[0].distancia;
      const maxDist = noExactas[noExactas.length - 1].distancia;

      const masCercanas = noExactas.filter((item) => item.distancia === minDist);
      masCercanas.forEach((item) => {
        scoresRonda[item.autorId] += 6;
        Object.entries(decsFinales).forEach(([jId, dec]) => {
          if (Number(jId) !== item.autorId && dec.valor === item.valor) {
            scoresRonda[Number(jId)] += 3;
          }
        });
      });

      if (maxDist > minDist) {
        const masLejanas = noExactas.filter((item) => item.distancia === maxDist);
        masLejanas.forEach((item) => {
          scoresRonda[item.autorId] -= 5;
        });

        const intermedias = noExactas.filter(
          (item) => item.distancia > minDist && item.distancia < maxDist
        );

        if (intermedias.length > 0) {
          const mitadIndex = Math.ceil(intermedias.length / 2);
          intermedias.forEach((item, idx) => {
            const esMitadSuperior = idx < mitadIndex;
            const deltaAutor = esMitadSuperior ? 1 : -1;
            scoresRonda[item.autorId] += deltaAutor;
          });
        }
      }
    }

    setPuntos((prev) => {
      const act = { ...prev };
      Object.entries(scoresRonda).forEach(([jId, delta]) => {
        act[jId] = (act[jId] || 0) + delta;
      });
      return act;
    });

    setResultadoRonda({
      scoresRonda,
      listaUnicas,
      objetivo,
      decsFinales
    });

    setFase('resultados');
  };

  const avanzarSiguienteRonda = () => {
    if (rondaActual >= MAX_RONDAS) {
      setFase('final');
    } else {
      const sigRonda = rondaActual + 1;
      setRondaActual(sigRonda);
      prepararRonda(sigRonda);
    }
  };

  const ranking = [...jugadores].sort((a, b) => (puntos[b.id] ?? 0) - (puntos[a.id] ?? 0));
  const maximo = ranking.length ? (puntos[ranking[0].id] ?? 0) : 0;
  const ganadores = maximo > 0 ? ranking.filter((j) => (puntos[j.id] ?? 0) === maximo) : [];

  const enPartidaActiva = fase !== 'setup';

  return (
    <div className={`aprox-contenedor ${enPartidaActiva ? 'qq-en-partida' : ''}`}>
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
              <label className="qq-label-destacado" htmlFor="num-jugadores-aprox">
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
                  id="num-jugadores-aprox"
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

            <button
              type="button"
              className="big full qq-btn-principal"
              style={{ marginTop: '1.5rem' }}
              onClick={iniciarPartida}
            >
              <Icon name="play" size={22} /> Iniciar juego ({MAX_RONDAS} rondas)
            </button>
          </div>
        </section>
      )}

      {/* 2. TURNO ACTIVO */}
      {fase === 'turno' && preguntaActual && jugadorActual && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            categoria={{
              nombre: preguntaActual.manual ? 'Sobre el grupo' : 'Pregunta numérica',
              icono: preguntaActual.manual ? 'users' : 'target'
            }}
            etiqueta={`Ronda ${rondaActual} de ${MAX_RONDAS} · Jugador ${subTurnoIndex + 1} de ${jugadores.length}`}
            titulo={jugadorActual.nombre}
            avatar={<Avatar nombre={jugadorActual.nombre} color={colorJugador(indiceColor(jugadorActual, 0))} />}
          >
            <div className="qqp-identidad aprox-consigna-box">
              <div className="aprox-consigna-top">
                <span className="qqp-identidad-icono">
                  <Icon name="target" size={16} strokeWidth={2.4} />
                </span>
                <span className="aprox-consigna-texto">«{preguntaActual.pregunta}»</span>
              </div>

              <div className="aprox-hero-stats">
                <span className="aprox-hero-stat">
                  🔢 {respuestasDadas.length} {respuestasDadas.length === 1 ? 'cifra dicha' : 'cifras dichas'}
                </span>
                <span className={`aprox-hero-stat timer${tiempoRestante <= 10 ? ' low' : ''}`}>
                  <Icon name="clock" size={14} /> {tiempoRestante}s
                </span>
              </div>

              <div className="aprox-timer-track" role="timer">
                <div
                  className={`aprox-timer-fill${tiempoRestante <= 10 ? ' low' : ''}`}
                  style={{ width: `${(tiempoRestante / TIEMPO_TURNO) * 100}%` }}
                />
              </div>
            </div>

            <OrdenTurnos
              jugadores={jugadoresEnOrden}
              activoId={jugadorActual.id}
              puntosMap={puntos}
            />
          </Cabecera>

          {!esPrimerJugador && respuestasDadas.length > 0 && (
            <div className="qqp-tarjeta">
              <p className="qqp-carta-cara-titulo" style={{ marginBottom: '0.35rem' }}>
                <Icon name="eye" size={16} /> Cifras propuestas hasta ahora
              </p>
              <p className="aprox-sub-instruccion">
                Toca una cifra para confiar en ella o escribe tu propio número debajo:
              </p>

              <div className="aprox-opciones-confianza">
                {respuestasDadas.map((r) => {
                  const quienesConfian = Object.entries(decisiones)
                    .filter(([, d]) => d.tipo === 'confia' && d.confiaEnId === r.jugadorId)
                    .map(([id]) => jugadores.find((j) => j.id === Number(id))?.nombre);

                  const seleccionada = confianzaElegida === r.jugadorId;

                  return (
                    <button
                      key={r.jugadorId}
                      type="button"
                      className={`aprox-btn-opcion-confianza ${seleccionada ? 'activa' : ''}`}
                      onClick={() => {
                        setConfianzaElegida(seleccionada ? null : r.jugadorId);
                        setInputNumero('');
                        setErrorInput('');
                      }}
                    >
                      <div className="aprox-opcion-valor">{r.valor}</div>
                      <div className="aprox-opcion-autor">De <strong>{r.jugadorNombre}</strong></div>
                      {quienesConfian.length > 0 && (
                        <div className="aprox-opcion-apoyos">
                          Confían: {quienesConfian.join(', ')}
                        </div>
                      )}
                      <span className="aprox-tag-confiar">
                        {seleccionada ? '✓ Confiando' : 'Confiar'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <form onSubmit={confirmarTurno} className="qqp-tarjeta aprox-form-card">
            <label className="qq-label-destacado" htmlFor="aprox-input-num">
              {esPrimerJugador
                ? `¿Cuál es tu respuesta, ${jugadorActual.nombre}?`
                : confianzaElegida !== null
                ? `Has elegido confiar en ${jugadores.find((j) => j.id === confianzaElegida)?.nombre}`
                : 'O introduce tu propia cifra (sin repetir)'}
            </label>

            {confianzaElegida === null ? (
              <input
                id="aprox-input-num"
                className="qq-input-moderno aprox-input-gigante"
                type="number"
                step="1"
                autoFocus
                placeholder="Ej. 150"
                value={inputNumero}
                onChange={(e) => {
                  setInputNumero(e.target.value);
                  setConfianzaElegida(null);
                  setErrorInput('');
                }}
                required
              />
            ) : (
              <div className="aprox-confianza-resumen">
                <span>Apostando por el número <strong>{respuestasDadas.find((r) => r.jugadorId === confianzaElegida)?.valor}</strong></span>
                <button
                  type="button"
                  className="aprox-btn-cambiar-idea"
                  onClick={() => setConfianzaElegida(null)}
                >
                  Escribir mi número
                </button>
              </div>
            )}

            {errorInput && <p className="error" role="alert" style={{ marginTop: '0.6rem' }}>{errorInput}</p>}

            <div style={{ marginTop: '1rem' }}>
              <BotonPrincipal type="submit">
                <Icon name="check" size={20} strokeWidth={2.5} />
                {confianzaElegida !== null ? 'Confirmar confianza' : 'Confirmar mi número'}
              </BotonPrincipal>
            </div>
          </form>
        </section>
      )}

      {/* 3. SEGUNDA VUELTA DEL PRIMER JUGADOR */}
      {fase === 'segunda_vuelta_inicial' && primerJugadorRonda && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            categoria={{ nombre: 'Segunda oportunidad', icono: 'refresh' }}
            etiqueta={`Ronda ${rondaActual} de ${MAX_RONDAS} · Decisión final`}
            titulo={primerJugadorRonda.nombre}
            avatar={<Avatar nombre={primerJugadorRonda.nombre} color={colorJugador(indiceColor(primerJugadorRonda, 0))} />}
          >
            <div className="qqp-identidad aprox-consigna-box">
              <div className="aprox-consigna-top">
                <span className="qqp-identidad-icono">
                  <Icon name="target" size={16} strokeWidth={2.4} />
                </span>
                <span className="aprox-consigna-texto">«{preguntaActual.pregunta}»</span>
              </div>

              <div className="aprox-hero-stats">
                <span className="aprox-hero-stat ok">
                  Tu cifra inicial: <strong>{decisiones[primerJugadorRonda.id]?.valor}</strong>
                </span>
                <span className={`aprox-hero-stat timer${tiempoRestante <= 10 ? ' low' : ''}`}>
                  <Icon name="clock" size={14} /> {tiempoRestante}s
                </span>
              </div>

              <div className="aprox-timer-track" role="timer">
                <div
                  className={`aprox-timer-fill${tiempoRestante <= 10 ? ' low' : ''}`}
                  style={{ width: `${(tiempoRestante / TIEMPO_TURNO) * 100}%` }}
                />
              </div>
            </div>
          </Cabecera>

          <div className="qqp-tarjeta">
            <p className="qqp-carta-cara-titulo" style={{ marginBottom: '0.35rem' }}>
              <Icon name="refresh" size={16} /> ¿Cambias de opinión?
            </p>
            <p className="aprox-sub-instruccion">
              Por haber abierto la ronda, puedes mantener tu cifra o tocar la de otro compañero para confiar en ella:
            </p>

            <div className="aprox-opciones-confianza">
              {respuestasDadas
                .filter((r) => r.jugadorId !== primerJugadorRonda.id)
                .map((r) => (
                  <button
                    key={r.jugadorId}
                    type="button"
                    className="aprox-btn-opcion-confianza"
                    onClick={() => confirmarSegundaVuelta(r.jugadorId)}
                  >
                    <div className="aprox-opcion-valor">{r.valor}</div>
                    <div className="aprox-opcion-autor">De <strong>{r.jugadorNombre}</strong></div>
                    <span className="aprox-tag-confiar">Cambiar y confiar</span>
                  </button>
                ))}
            </div>
          </div>

          <div className="qqp-barra">
            <BotonPrincipal onClick={() => confirmarSegundaVuelta(null)}>
              <Icon name="check" size={20} strokeWidth={2.5} /> Mantener mi cifra ({decisiones[primerJugadorRonda.id]?.valor})
            </BotonPrincipal>
          </div>
        </section>
      )}

      {/* 4. INTRODUCIR CIFRA REAL MANUAL */}
      {fase === 'introducir_real' && preguntaActual && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            categoria={{ nombre: 'Sobre el grupo', icono: 'users' }}
            etiqueta={`Ronda ${rondaActual} de ${MAX_RONDAS} · Recuento común`}
            titulo="¡Momento del recuento!"
          >
            <div className="qqp-identidad">
              <span className="qqp-identidad-icono"><Icon name="users" size={16} /></span>
              <span>«{preguntaActual.pregunta}»</span>
            </div>
          </Cabecera>

          <form onSubmit={confirmarCifraRealManual} className="qqp-tarjeta aprox-form-card">
            <label className="qq-label-destacado" htmlFor="aprox-manual-real">
              Contad y sumad entre todos los presentes e introducid el total real
            </label>
            <input
              id="aprox-manual-real"
              className="qq-input-moderno aprox-input-gigante"
              type="number"
              step="1"
              autoFocus
              placeholder="Total real tras el recuento..."
              value={inputRealManual}
              onChange={(e) => {
                setInputRealManual(e.target.value);
                setErrorInput('');
              }}
              required
            />
            {errorInput && <p className="error" role="alert" style={{ marginTop: '0.6rem' }}>{errorInput}</p>}

            <div style={{ marginTop: '1rem' }}>
              <BotonPrincipal type="submit">
                <Icon name="trophy" size={20} /> Calcular resultados y puntos
              </BotonPrincipal>
            </div>
          </form>
        </section>
      )}

      {/* 5. RESULTADOS DE LA RONDA */}
      {fase === 'resultados' && resultadoRonda && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            etiqueta={`Ronda ${rondaActual} de ${MAX_RONDAS} completada`}
            titulo={`Respuesta: ${resultadoRonda.objetivo}`}
          >
            <div className="qqp-identidad">
              <span className="qqp-identidad-icono"><Icon name="check" size={16} strokeWidth={2.5} /></span>
              <span>«{preguntaActual.pregunta}»</span>
            </div>
          </Cabecera>

          <div className="qqp-tarjeta">
            <p className="qqp-carta-cara-titulo" style={{ marginBottom: '0.8rem' }}>
              <Icon name="target" size={16} /> Desglose de aproximaciones
            </p>
            <div className="aprox-resolucion-lista">
              {resultadoRonda.listaUnicas.map((item) => {
                const esExacta = item.distancia === 0;
                const esMin = item.distancia === resultadoRonda.listaUnicas[0].distancia && !esExacta;
                const esMax =
                  item.distancia === resultadoRonda.listaUnicas[resultadoRonda.listaUnicas.length - 1].distancia &&
                  resultadoRonda.listaUnicas.length > 1 &&
                  !esExacta;

                const confiadosNombres = Object.entries(resultadoRonda.decsFinales)
                  .filter(([id, d]) => Number(id) !== item.autorId && d.valor === item.valor)
                  .map(([id]) => jugadores.find((j) => j.id === Number(id))?.nombre);

                const autorNombre = jugadores.find((j) => j.id === item.autorId)?.nombre;
                const deltaAutor = resultadoRonda.scoresRonda[item.autorId] ?? 0;

                return (
                  <div
                    key={item.valor}
                    className={`aprox-fila-resultado ${
                      esExacta ? 'exacta' : esMin ? 'cercana' : esMax ? 'lejana' : 'intermedia'
                    }`}
                  >
                    <div className="aprox-res-col-val">
                      <span className="aprox-res-num">{item.valor}</span>
                      <span className="aprox-res-dist">a {item.distancia}</span>
                    </div>

                    <div className="aprox-res-col-jugadores">
                      <div className="aprox-res-autor-linea">
                        <strong>{autorNombre}</strong>
                        <span className={`aprox-badge-pts ${deltaAutor > 0 ? 'pos' : deltaAutor < 0 ? 'neg' : ''}`}>
                          {deltaAutor >= 0 ? `+${deltaAutor}` : deltaAutor} pts
                        </span>
                      </div>
                      {confiadosNombres.length > 0 && (
                        <div className="aprox-res-confian">
                          Confiaron:{' '}
                          {confiadosNombres
                            .map((nom) => {
                              const jId = jugadores.find((j) => j.nombre === nom)?.id;
                              const ptsConf = resultadoRonda.scoresRonda[jId] ?? 0;
                              return `${nom} (+${ptsConf}p)`;
                            })
                            .join(', ')}
                        </div>
                      )}
                    </div>

                    <div className="aprox-res-etiqueta">
                      {esExacta && '🎯 Exacta'}
                      {esMin && '🥇 Más cercana'}
                      {esMax && '❌ Más lejana'}
                      {!esExacta && !esMin && !esMax && '⚖️ Intermedia'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

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
                    <span className="aprox-ranking-pts">{pts} pts</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="qqp-barra">
            <BotonPrincipal onClick={avanzarSiguienteRonda}>
              <Icon name="play" size={20} />
              {rondaActual < MAX_RONDAS
                ? `Jugar ronda ${rondaActual + 1} de ${MAX_RONDAS}`
                : 'Ver podio final'}
            </BotonPrincipal>
            <EnlaceSecundario onClick={() => setFase('final')}>
              Finalizar partida anticipadamente
            </EnlaceSecundario>
          </div>
        </section>
      )}

      {/* 6. PODIO FINAL */}
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
                  ? 'Nadie ha sumado puntos en esta partida.'
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
                    <span className="aprox-ranking-pts">{pts} pts</span>
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

      {/* MODAL: SALIR A LA PORTADA */}
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