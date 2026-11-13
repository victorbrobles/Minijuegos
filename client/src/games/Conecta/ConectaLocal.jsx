// client/src/games/Conecta/ConectaLocal.jsx
import { useRegistrarPartida, ganadoresPorPuntos } from '../../lib/registros.js';
import { RecientesJugadores, ponerReciente } from '../../components/Recientes.jsx';
import { nombreIdentidad } from '../../lib/identidad.js';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import './Conecta.css';
import * as E from './engine.js';
import ConectaPartida, { SelectorCategorias } from './ConectaPartida.jsx';
import { limitesLocal } from '../limites.js';
import { SelectorRondas } from '../../components/MenuJuego.jsx';
import { rondasPorDefecto, totalRondas } from '../rondas.js';
import { avisarNombres } from '../../lib/nombres.js';

const { min: MIN_JUGADORES, max: MAX_JUGADORES } = limitesLocal('conecta');

const CATEGORIAS_METADATA = [
  { id: 'futbolistas', nombre: 'Futbolistas', icono: 'trophy' },
  { id: 'deportistas', nombre: 'Deportistas', icono: 'speedometer' },
  { id: 'famosos', nombre: 'Famosos', icono: 'users' },
  { id: 'animales', nombre: 'Animales', icono: 'whois' },
  { id: 'comidas', nombre: 'Comidas', icono: 'star' },
  { id: 'paises', nombre: 'Países', icono: 'globe' },
  { id: 'videojuegos', nombre: 'Videojuegos', icono: 'zap' },
  { id: 'cine', nombre: 'Cine y Series', icono: 'clapperboard' },
  { id: 'musica', nombre: 'Música', icono: 'letters' },
  { id: 'historia', nombre: 'Historia', icono: 'detective' }
];

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

export default function ConectaLocal({ onVolver, onExit, onAbrirAyuda }) {
  const navigate = useNavigate();
  const [fase, setFase] = useState('setup'); // 'setup' | 'categoria' | 'juego' | 'final'
  const [modalSalirPortada, setModalSalirPortada] = useState(false);

  const [numJugadores, setNumJugadores] = useState(MIN_JUGADORES);
  const [jugadores, setJugadores] = useState(() => Array.from({ length: MIN_JUGADORES }, (_, i) => ({ id: i + 1, nombre: i === 0 ? nombreIdentidad() : '' })));
  const [puntos, setPuntos] = useState({});
  const [rondaActual, setRondaActual] = useState(0);
  const [rondasSel, setRondasSel] = useState(rondasPorDefecto('conecta'));
  const maxRondas = totalRondas('conecta', rondasSel);
  const [errorCarga, setErrorCarga] = useState('');

  // Estado de la ronda (motor de reglas compartido con el servidor)
  const rondaRef = useRef(null);
  const [, setVersion] = useState(0);
  const refrescar = () => setVersion((v) => v + 1);

  // Reloj: aplica el fin del tiempo de cada turno
  useEffect(() => {
    if (fase !== 'juego') return undefined;
    const id = setInterval(() => {
      if (rondaRef.current && E.tick(rondaRef.current, Date.now())) refrescar();
    }, 250);
    return () => clearInterval(id);
  }, [fase]);

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
      nombre: jugadores[i]?.nombre ?? ''
    }));
    setJugadores(nuevos);
  };

  const handleNombreChange = (index, val) => {
    const nuevos = [...jugadores];
    nuevos[index] = { ...nuevos[index], nombre: val };
    setJugadores(nuevos);
  };

  const irACategorias = () => {
    if (avisarNombres(jugadores)) return;
    const listaActualizada = jugadores.map((j) => ({
      ...j,
      nombre: j.nombre.trim() || `Jugador ${j.id}`
    }));
    setJugadores(listaActualizada);

    const pts = {};
    listaActualizada.forEach((j) => { pts[j.id] = 0; });
    setPuntos(pts);

    setRondaActual(0);
    setFase('categoria');
  };

  const iniciarRondaConCategoria = (catId) => {
    setErrorCarga('');
    const meta = CATEGORIAS_METADATA.find((c) => c.id === catId);
    fetch(`/api/conecta/tablero?categoria=${catId}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.success) throw new Error();
        const numero = rondaActual + 1;
        rondaRef.current = E.crearRonda(
          jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: puntos[j.id] ?? 0 })),
          { grupos: data.grupos },
          { ronda: numero, categoria: meta?.nombre || data.categoria }
        );
        setRondaActual(numero);
        setFase('juego');
        refrescar();
      })
      .catch(() => setErrorCarga('No se pudo cargar el tablero. Inténtalo de nuevo.'));
  };

  // Pasa los puntos de la ronda al marcador general
  const guardarPuntos = () => {
    const r = rondaRef.current;
    if (!r) return;
    const pts = { ...puntos };
    r.jugadores.forEach((j) => { pts[j.id] = j.puntos; });
    setPuntos(pts);
  };

  const accion = async (tipo, datos = {}) => {
    const r = rondaRef.current;
    if (!r) return { error: 'No hay ronda.' };
    const ahora = Date.now();
    const id = r.turno?.jugadorId;
    let res;
    if (tipo === 'listo') res = E.empezarTurno(r, id, ahora);
    else if (tipo === 'confirmar') res = E.confirmarSeleccion(r, id, datos.ids, ahora);
    else if (tipo === 'tema') res = E.adivinarTema(r, id, datos.texto, ahora);
    else if (tipo === 'saltar-turno') res = E.saltarTurno(r);
    else if (tipo === 'finalizar-ronda') res = E.finalizarRonda(r);
    refrescar();
    return res;
  };

  const ranking = [...jugadores].sort((a, b) => (puntos[b.id] ?? 0) - (puntos[a.id] ?? 0));
  const maximo = ranking.length ? (puntos[ranking[0].id] ?? 0) : 0;
  const ganadores = maximo > 0 ? ranking.filter((j) => (puntos[j.id] ?? 0) === maximo) : [];
  const enPartidaActiva = fase === 'juego';

  // Salón de la fama: se guarda la partida al llegar a la pantalla final
  useRegistrarPartida('conecta', fase === 'final' ? ganadoresPorPuntos((jugadores || []).filter((j) => !j.fuera && !j.abandonado).map((j) => ({ nombre: j.nombre, puntos: j.puntos ?? null }))) : null);
  return (
    <div className={`cc-contenedor ${enPartidaActiva ? 'qq-en-partida' : ''}`}>

      {/* 1. SETUP DE JUGADORES */}
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
              <label className="qq-label-destacado" htmlFor="num-jugadores-cc">
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
                  id="num-jugadores-cc"
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
                    style={{ background: COLORES[idx % COLORES.length] }}
                  >
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={j.nombre}
                    onChange={(e) => handleNombreChange(idx, e.target.value)}
                    placeholder={`Nombre del jugador ${j.id}`}
                    maxLength={30}
                    required
                  />
                </div>
              ))}
            </div>
            <RecientesJugadores usados={jugadores.map((j) => j.nombre)} onPoner={(n) => setJugadores((l) => ponerReciente(l, n))} />

            <SelectorRondas juegoId="conecta" valor={rondasSel} onCambiar={setRondasSel} />
            <button
              type="button"
              className="big full qq-btn-principal"
              style={{ marginTop: '1.5rem' }}
              onClick={irACategorias}
            >
              <Icon name="play" size={22} /> Elegir Categoría
            </button>
          </div>
        </section>
      )}

      {/* 2. CATEGORÍA */}
      {fase === 'categoria' && (
        <SelectorCategorias
          categorias={CATEGORIAS_METADATA}
          onElegir={iniciarRondaConCategoria}
          onVolver={() => setFase('setup')}
          onAyuda={onAbrirAyuda}
          aviso="Al seleccionarla se cargará el tablero con 16 elementos mezclados."
          error={errorCarga}
        />
      )}

      {/* 3. RONDA POR TURNOS */}
      {fase === 'juego' && rondaRef.current && (
        <ConectaPartida
          local
          partida={E.vista(rondaRef.current, Date.now())}
          onAccion={accion}
          onSalir={() => setModalSalirPortada(true)}
          finRonda={(
            <>
              {rondaActual >= maxRondas ? (
                <button type="button" className="cnp-boton grande" onClick={() => { guardarPuntos(); setFase('final'); }}>
                  <Icon name="trophy" size={20} /> Ver el podio final
                </button>
              ) : (
                <>
                  <button type="button" className="cnp-boton grande" onClick={() => { guardarPuntos(); setFase('categoria'); }}>
                    <Icon name="play" size={20} /> Nueva ronda ({rondaActual + 1} de {maxRondas})
                  </button>
                  <button type="button" className="cnp-enlace" onClick={() => { guardarPuntos(); setFase('final'); }}>
                    <Icon name="trophy" size={16} /> Finalizar partida
                  </button>
                </>
              )}
            </>
          )}
        />
      )}

      {/* 4. PODIO FINAL */}
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

          <div className="actions" style={{ marginTop: '1.5rem' }}>
            <button type="button" className="big full qq-btn-principal" onClick={() => setFase('setup')}>
              <Icon name="refresh" size={20} /> Nueva partida
            </button>
            <button type="button" className="secondary danger full" onClick={() => setModalSalirPortada(true)}>
              <Icon name="door" size={20} /> Volver a la portada
            </button>
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