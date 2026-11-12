// client/src/games/QuienMas/QuienMasLocal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './QuienMas.css';
import { useAdmin, adminHeaders } from '../../lib/admin.js';
import Icon from '../../components/Icon.jsx';
import { centrarActivo } from '../../lib/centrarActivo.js';
import { limitesLocal } from '../limites.js';

const { min: MIN_JUGADORES, max: MAX_JUGADORES } = limitesLocal('quienmas');
const TIEMPO_VOTO = 30;

const COLORES = ['#3b82f6', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4', '#f97316'];
export const colorJugador = (i) => COLORES[((i % COLORES.length) + COLORES.length) % COLORES.length];
export const inicial = (nombre = '?') => nombre.trim().charAt(0).toUpperCase() || '?';
export const indiceColor = (j, i) => (typeof j?.id === 'number' ? j.id - 1 : i);

function limpiarNombres(lista) {
  const usados = new Set();
  return lista.map((j, i) => {
    const base = (j.nombre || '').trim() || `Jugador ${i + 1}`;
    let nombre = base;
    for (let k = 2; usados.has(nombre.toLowerCase()); k++) {
      nombre = `${base} (${k})`;
    }
    usados.add(nombre.toLowerCase());
    return { ...j, nombre };
  });
}

/* ==========================================================================
   COMPONENTES DE TABLERO COMPARTIDOS
   ========================================================================== */

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
        <Icon name="users" size={150} strokeWidth={1.4} />
      </span>
      <div className="qqp-hero-top">
        {onSalir ? <BotonPortada onClick={onSalir} texto={textoSalir} /> : <span />}
        <div className="qqp-hero-chips">
          {chips}
          {categoria && (
            <span className="qqp-chip" title="Categoría">
              <Icon name={categoria.icono || 'lock'} size={14} /> <span>{categoria.nombre}</span>
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

export function OrdenTurnos({ jugadores, activoNombre, votaronMap = {}, puntosMap = null }) {
  const ref = useRef(null);
  useEffect(() => {
    centrarActivo(ref.current);
  }, [activoNombre]);

  return (
    <ol className="qqp-orden" ref={ref} aria-label="Estado de los jugadores">
      {jugadores.map((j, i) => {
        const nombre = typeof j === 'string' ? j : j.nombre;
        const esActivo = nombre === activoNombre;
        const yaVoto = Boolean(votaronMap[nombre] ?? j.haVotado);
        const pts = puntosMap ? (puntosMap[nombre] ?? 0) : (j.puntos ?? 0);
        return (
          <li
            key={nombre}
            className={`qqp-orden-item${esActivo ? ' activo' : ''}`}
            style={{ '--c': colorJugador(i) }}
            aria-current={esActivo ? 'step' : undefined}
          >
            <span className="qqp-orden-avatar">{yaVoto ? '✓' : inicial(nombre)}</span>
            <span className="qqp-orden-nombre">{nombre}</span>
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
   MODO LOCAL: ¿DE VERDAD OS CONOCÉIS?
   ========================================================================== */

export default function QuienMasLocal({ onVolver, onExit, onAbrirAyuda }) {
  const navigate = useNavigate();
  const esAdmin = useAdmin();

  // Fases: 'setup' | 'cargando' | 'pasar' | 'votando' | 'resultado' | 'ranking'
  const [fase, setFase] = useState('setup');
  const [modalSalirPortada, setModalSalirPortada] = useState(false);

  // Configuración
  const [numJugadores, setNumJugadores] = useState(MIN_JUGADORES);
  const [listaConfig, setListaConfig] = useState(() => Array.from({ length: MIN_JUGADORES }, (_, i) => ({ id: i + 1, nombre: `Jugador ${i + 1}` })));
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
    const n = Math.max(MIN_JUGADORES, Math.min(MAX_JUGADORES, nuevoNum));
    setNumJugadores(n);
    const nuevos = Array.from({ length: n }, (_, i) => ({
      id: i + 1,
      nombre: listaConfig[i]?.nombre || `Jugador ${i + 1}`
    }));
    setListaConfig(nuevos);
  };

  const handleNombreChange = (idx, valor) => {
    const nuevos = [...listaConfig];
    nuevos[idx] = { ...nuevos[idx], nombre: valor };
    setListaConfig(nuevos);
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
    const limpios = limpiarNombres(listaConfig);
    setListaConfig(limpios);
    const nombresJugs = limpios.map((j) => j.nombre);
    setJugadores(nombresJugs);
    setPuntos(Object.fromEntries(nombresJugs.map((n) => [n, 0])));
    setError('');
    setFase('cargando');

    try {
      const res = await fetch(`/api/quienmas/preguntas?categoria=${categoriaActiva}`, { headers: adminHeaders() });
      if (!res.ok) throw new Error('No se pudieron cargar las preguntas.');
      const data = await res.json();
      const lista = [...(data.preguntas || [])].sort(() => Math.random() - 0.5);
      if (lista.length === 0) throw new Error('La lista de preguntas está vacía.');
      setRonda(1);
      nuevaRonda(lista, nombresJugs);
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
    Object.values(finales).forEach((c) => { recuento[c] = (recuento[c] || 0) + 1; });

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

  const totalVotaron = Object.keys(votos).length;
  const enPartidaActiva = fase !== 'setup';

  return (
    <div className={`qm-contenedor ${enPartidaActiva ? 'qq-en-partida' : ''}`}>
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
              <label className="qq-label-destacado" htmlFor="num-jugadores-qm">
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
                  id="num-jugadores-qm"
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
              {listaConfig.map((j, idx) => (
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

            {esAdmin && (
              <div className="qq-selector-cantidad-box" style={{ marginTop: '1.2rem' }}>
                <span className="qq-label-destacado">
                  <Icon name="lock" size={14} /> Tipo de preguntas (Admin)
                </span>
                <div className="qm-admin-cats">
                  <button
                    type="button"
                    className={`qm-admin-cat-btn ${categoria === 'normal' ? 'activo' : ''}`}
                    onClick={() => setCategoria('normal')}
                  >
                    😊 Normal (Todos los públicos)
                  </button>
                  <button
                    type="button"
                    className={`qm-admin-cat-btn ${categoria === 'picante' ? 'activo' : ''}`}
                    onClick={() => setCategoria('picante')}
                  >
                    🌶️ Picante (Comprometidas)
                  </button>
                </div>
              </div>
            )}

            {error && <p className="error" style={{ marginTop: '0.8rem' }}>{error}</p>}

            <button
              type="button"
              className="big full qq-btn-principal"
              style={{ marginTop: '1.5rem' }}
              onClick={empezarPartida}
            >
              <Icon name="play" size={22} /> Iniciar juego
            </button>
          </div>
        </section>
      )}

      {/* 2. CARGANDO */}
      {fase === 'cargando' && (
        <section className="game qqp-escena">
          <div className="qqp-tarjeta qqp-pasar">
            <span className="qqp-spinner" aria-hidden="true" />
            <p className="qqp-texto" style={{ marginTop: '0.8rem' }}>Cargando preguntas…</p>
          </div>
        </section>
      )}

      {/* 3. PASAR EL DISPOSITIVO */}
      {fase === 'pasar' && jugadorTurno && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            categoria={{ nombre: 'Voto secreto', icono: 'lock' }}
            etiqueta={`Ronda ${ronda} · ${totalVotaron} de ${jugadores.length} han votado`}
            titulo="Pasad el móvil"
          >
            <OrdenTurnos
              jugadores={jugadores}
              activoNombre={jugadorTurno}
              votaronMap={votos}
              puntosMap={puntos}
            />
          </Cabecera>

          <div className="qqp-tarjeta qqp-pasar">
            <Avatar nombre={jugadorTurno} color={colorJugador(turno)} grande />
            <p className="qqp-pasar-para">Le toca votar a</p>
            <h3 className="qqp-pasar-nombre">{jugadorTurno}</h3>
            <p className="qqp-texto">
              No mires la pantalla si no es tu turno para que el voto siga siendo totalmente secreto.
            </p>
          </div>

          <div className="qqp-barra">
            <BotonPrincipal onClick={() => setFase('votando')}>
              <Icon name="eye" size={22} /> Soy {jugadorTurno}, ¡a votar!
            </BotonPrincipal>
          </div>
        </section>
      )}

      {/* 4. VOTANDO */}
      {fase === 'votando' && jugadorTurno && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            categoria={{ nombre: 'Voto secreto', icono: 'lock' }}
            etiqueta={`Ronda ${ronda} · Turno de votación`}
            titulo={jugadorTurno}
            avatar={<Avatar nombre={jugadorTurno} color={colorJugador(turno)} />}
          >
            <div className="qqp-identidad qm-consigna-box">
              <div className="qm-consigna-top">
                <span className="qqp-identidad-icono">
                  <Icon name="users" size={16} strokeWidth={2.4} />
                </span>
                <span className="qm-consigna-texto">«{pregunta}»</span>
              </div>

              <div className="qm-hero-stats">
                <span className="qm-hero-stat">
                  🗳️ Voto {totalVotaron + 1} de {jugadores.length}
                </span>
                <span className={`qm-hero-stat timer${tiempoRestante <= 10 ? ' low' : ''}`}>
                  <Icon name="clock" size={14} /> {tiempoRestante}s
                </span>
              </div>

              <div className="qm-timer-track" role="timer">
                <div
                  className={`qm-timer-fill${tiempoRestante <= 10 ? ' low' : ''}`}
                  style={{ width: `${(tiempoRestante / TIEMPO_VOTO) * 100}%` }}
                />
              </div>
            </div>

            <OrdenTurnos
              jugadores={jugadores}
              activoNombre={jugadorTurno}
              votaronMap={votos}
              puntosMap={puntos}
            />
          </Cabecera>

          <div className="qqp-tarjeta">
            <p className="qqp-carta-cara-titulo" style={{ marginBottom: '0.8rem' }}>
              <Icon name="check" size={16} /> Elige al jugador que mejor encaja
            </p>
            <div className="qm-candidatos-grid">
              {jugadores.map((nombre, idx) => (
                <button
                  key={nombre}
                  type="button"
                  className="qm-candidato-btn"
                  style={{ '--c': colorJugador(idx) }}
                  onClick={() => votar(nombre)}
                >
                  <span className="qm-candidato-avatar">{inicial(nombre)}</span>
                  <span className="qm-candidato-nombre">
                    {nombre}
                    {nombre === jugadorTurno && <span className="qm-badge-tu">Tú</span>}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. RESULTADO DE LA RONDA */}
      {fase === 'resultado' && resultado && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            etiqueta={`Ronda ${ronda} completada`}
            titulo={
              resultado.empate
                ? '¡Empate en la votación!'
                : `Más votado: ${resultado.ganador}`
            }
            avatar={
              <span className="qqp-avatar" style={{ '--c': resultado.empate ? '#64748b' : '#f59e0b' }}>
                {resultado.empate ? '⚖️' : '🏆'}
              </span>
            }
          >
            <div className="qqp-identidad">
              <span className="qqp-identidad-icono"><Icon name="users" size={16} /></span>
              <span>«{pregunta}»</span>
            </div>
          </Cabecera>

          <div className="qqp-tarjeta">
            <p className="qqp-carta-cara-titulo" style={{ marginBottom: '0.8rem' }}>
              <Icon name="trophy" size={16} /> Recuento de votos recibidos
            </p>
            <ul className="qqp-rivales">
              {[...jugadores]
                .sort((a, b) => (resultado.recuento[b] || 0) - (resultado.recuento[a] || 0))
                .map((nombre) => {
                  const idx = jugadores.indexOf(nombre);
                  const n = resultado.recuento[nombre] || 0;
                  const esMasVotado = !resultado.empate && nombre === resultado.ganador;
                  return (
                    <li key={nombre} className="qqp-rival" style={{ '--c': colorJugador(idx) }}>
                      <span className="qqp-rival-avatar">{esMasVotado ? '👑' : inicial(nombre)}</span>
                      <span className="qqp-rival-datos">
                        <span className="qqp-rival-nombre">
                          {esMasVotado ? '¡El más votado!' : 'Candidato'}
                        </span>
                        <strong className="qqp-rival-tarjeta">{nombre}</strong>
                      </span>
                      <span className="qm-ranking-pts">
                        {n} {n === 1 ? 'voto' : 'votos'}
                      </span>
                    </li>
                  );
                })}
            </ul>
          </div>

          <div className="qqp-tarjeta">
            <p className="qqp-carta-cara-titulo" style={{ marginBottom: '0.8rem' }}>
              <Icon name="eye" size={16} /> ¿A quién votó cada uno?
            </p>
            <div className="qm-desglose-lista">
              {jugadores.map((nombre) => {
                const gano = resultado.ganados[nombre] > 0;
                return (
                  <div key={nombre} className={`qm-desglose-fila ${gano ? 'acierto' : ''}`}>
                    <span className="qm-desglose-texto">
                      <strong>{nombre}</strong> votó a <strong>{resultado.votos[nombre]}</strong>
                    </span>
                    <span className={`qm-badge-pto ${gano ? 'pos' : ''}`}>
                      {gano ? '+1 pt' : '0 pts'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="qqp-barra">
            <BotonPrincipal onClick={siguientePregunta}>
              <Icon name="play" size={20} /> Siguiente pregunta
            </BotonPrincipal>
            <EnlaceSecundario onClick={() => setFase('ranking')}>
              <Icon name="trophy" size={16} /> Ver clasificación general
            </EnlaceSecundario>
          </div>
        </section>
      )}

      {/* 6. CLASIFICACIÓN GENERAL */}
      {fase === 'ranking' && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            etiqueta={`Rondas jugadas: ${ronda}`}
            titulo="Clasificación General"
            avatar={<span className="qqp-avatar" style={{ '--c': '#f59e0b' }}>🏆</span>}
          >
            <div className="qqp-identidad">
              <span className="qqp-identidad-icono"><Icon name="crown" size={16} /></span>
              <span>
                {ganadores.length === 0
                  ? 'Nadie ha conseguido puntos todavía.'
                  : ganadores.length === 1
                  ? <>¡<strong>{ganadores[0]}</strong> lidera con <strong>{maximoPuntos} {maximoPuntos === 1 ? 'pt' : 'pts'}</strong>!</>
                  : <>Empate en cabeza entre <strong>{ganadores.join(', ')}</strong> con <strong>{maximoPuntos} pts</strong></>}
              </span>
            </div>
          </Cabecera>

          <div className="qqp-tarjeta">
            <p className="qqp-carta-cara-titulo" style={{ marginBottom: '0.8rem' }}>
              <Icon name="users" size={16} /> Podio de jugadores
            </p>
            <ul className="qqp-rivales">
              {ranking.map((nombre, i) => {
                const idx = jugadores.indexOf(nombre);
                const pts = puntos[nombre] || 0;
                const lider = maximoPuntos > 0 && pts === maximoPuntos;
                return (
                  <li key={nombre} className="qqp-rival" style={{ '--c': colorJugador(idx) }}>
                    <span className="qqp-rival-avatar">{lider ? '👑' : i + 1}</span>
                    <span className="qqp-rival-datos">
                      <span className="qqp-rival-nombre">{lider ? 'Líder' : `Puesto ${i + 1}`}</span>
                      <strong className="qqp-rival-tarjeta">{nombre}</strong>
                    </span>
                    <span className="qm-ranking-pts">{pts} pts</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="qqp-barra">
            {reserva.length > 0 && (
              <BotonPrincipal onClick={siguientePregunta}>
                <Icon name="play" size={20} /> Continuar jugando (Ronda {ronda + 1})
              </BotonPrincipal>
            )}
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