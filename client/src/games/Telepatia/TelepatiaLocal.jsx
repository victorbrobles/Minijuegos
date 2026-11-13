// client/src/games/Telepatia/TelepatiaLocal.jsx
import { useRegistrarPartida, ganadoresPorPuntos } from '../../lib/registros.js';
import { RecientesJugadores, ponerReciente } from '../../components/Recientes.jsx';
import { nombreIdentidad } from '../../lib/identidad.js';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import './Telepatia.css';
import { limitesLocal } from '../limites.js';
import { SelectorRondas } from '../../components/MenuJuego.jsx';
import { rondasPorDefecto, totalRondas } from '../rondas.js';
import { avisarNombres } from '../../lib/nombres.js';

const PALABRAS_BASE = [
  'PLAYA', 'FÚTBOL', 'PIZZA', 'VERANO', 'VIAJE', 'NOCHE', 'CINE', 'MÚSICA',
  'CHOCOLATE', 'MONTAÑA', 'DINERO', 'FIESTA', 'PERRO', 'BODAS', 'UNIVERSO',
  'SUPERHÉROE', 'INVIERNO', 'CAFÉ', 'ISLA', 'CASTILLO', 'AVIÓN', 'BOSQUE'
];

const { min: MIN_JUGADORES, max: MAX_JUGADORES } = limitesLocal('telepatia');

const COLORES = ['#3b82f6', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4', '#f97316'];
export const colorJugador = (i) => COLORES[((i % COLORES.length) + COLORES.length) % COLORES.length];
export const inicial = (nombre = '?') => nombre.trim().charAt(0).toUpperCase() || '?';
export const indiceColor = (j, i) => (typeof j?.id === 'number' ? j.id - 1 : i);

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
        <Icon name="zap" size={150} strokeWidth={1.4} />
      </span>
      <div className="qqp-hero-top">
        {onSalir ? <BotonPortada onClick={onSalir} texto={textoSalir} /> : <span />}
        <div className="qqp-hero-chips">
          {chips}
          {categoria && (
            <span className="qqp-chip" title="Modo de ronda">
              <Icon name={categoria.icono || 'zap'} size={14} /> <span>{categoria.nombre}</span>
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

export function OrdenTurnos({ jugadores, seleccionadosIds = [] }) {
  const ref = useRef(null);
  return (
    <ol className="qqp-orden" ref={ref} aria-label="Estado de los jugadores">
      {jugadores.map((j, i) => {
        const esActivo = seleccionadosIds.includes(j.id);
        return (
          <li
            key={j.id}
            className={`qqp-orden-item${esActivo ? ' activo' : ''}`}
            style={{ '--c': colorJugador(indiceColor(j, i)) }}
          >
            <span className="qqp-orden-avatar">{j.racha > 1 ? '🔥' : inicial(j.nombre)}</span>
            <span className="qqp-orden-nombre">{j.nombre}</span>
            <span className="qqp-orden-pts">{j.puntos ?? 0}p</span>
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
   MODO LOCAL: TELEPATÍA
   ========================================================================== */

export default function TelepatiaLocal({ onVolver, onSalir, onExit, onAbrirAyuda }) {
  const navigate = useNavigate();

  // Fases: 'setup' | 'ronda' | 'registrar_coincidencia' | 'registrar_no_coincidencia' | 'resumen_ronda' | 'fin'
  const [paso, setPaso] = useState('setup');
  const [modalSalirPortada, setModalSalirPortada] = useState(false);

  const [numJugadores, setNumJugadores] = useState(MIN_JUGADORES);
  const [listaConfig, setListaConfig] = useState(
    Array.from({ length: MIN_JUGADORES }, (_, i) => ({ id: i + 1, nombre: i === 0 ? nombreIdentidad() : '' }))
  );
  const [rondasSel, setRondasSel] = useState(rondasPorDefecto('telepatia'));
  const MAX_RONDAS = totalRondas('telepatia', rondasSel, listaConfig.length);

  const [jugadores, setJugadores] = useState([]);
  const [rondaNum, setRondaNum] = useState(1);
  const [palabraActual, setPalabraActual] = useState('');
  const [palabraSiguiente, setPalabraSiguiente] = useState('');

  // Registro de coincidencias
  const [seleccionados, setSeleccionados] = useState([]);
  const [palabraCoincididaInput, setPalabraCoincididaInput] = useState('');
  const [palabraNoCoincididaInput, setPalabraNoCoincididaInput] = useState('');
  const [logRonda, setLogRonda] = useState('');

  const volverAlMenu = () => {
    if (typeof onVolver === 'function') {
      onVolver();
    } else if (typeof onSalir === 'function') {
      onSalir();
    }
  };

  const handleSalirAPortada = () => {
    setModalSalirPortada(false);
    if (typeof onExit === 'function') {
      onExit();
    } else if (typeof onSalir === 'function') {
      onSalir();
    } else {
      try {
        navigate('/');
      } catch {
        window.location.href = '/';
      }
    }
  };

  const actualizarCantidadJugadores = (nuevoNum) => {
    const k = Math.max(MIN_JUGADORES, Math.min(MAX_JUGADORES, nuevoNum));
    setNumJugadores(k);
    const nuevos = Array.from({ length: k }, (_, i) => ({
      id: i + 1,
      nombre: listaConfig[i]?.nombre ?? ''
    }));
    setListaConfig(nuevos);
  };

  const handleNombreChange = (idx, valor) => {
    const nuevos = [...listaConfig];
    nuevos[idx] = { ...nuevos[idx], nombre: valor };
    setListaConfig(nuevos);
  };

  const iniciarPartida = () => {
    if (avisarNombres(listaConfig)) return;
    const jugs = listaConfig.map((j, i) => ({
      id: i + 1,
      nombre: j.nombre.trim() || `Jugador ${i + 1}`,
      puntos: 0,
      racha: 0
    }));

    const palabraInicial = PALABRAS_BASE[Math.floor(Math.random() * PALABRAS_BASE.length)];

    setJugadores(jugs);
    setRondaNum(1);
    setPalabraActual(palabraInicial);
    setSeleccionados([]);
    setPaso('ronda');
  };

  const toggleSeleccion = (id) => {
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const confirmarCoincidencia = () => {
    if (seleccionados.length < 2 || !palabraCoincididaInput.trim()) return;

    const palabraUsada = palabraCoincididaInput.trim().toUpperCase();

    const jugsActualizados = jugadores.map((j) => {
      if (seleccionados.includes(j.id)) {
        const nuevaRacha = j.racha + 1;
        return {
          ...j,
          puntos: j.puntos + nuevaRacha,
          racha: nuevaRacha
        };
      }
      return { ...j, racha: 0 };
    });

    const nombresCoincidentes = jugsActualizados
      .filter((j) => seleccionados.includes(j.id))
      .map((j) => j.nombre)
      .join(', ');

    setJugadores(jugsActualizados);
    setPalabraSiguiente(palabraUsada);
    setLogRonda(`¡Conexión mental! ${nombresCoincidentes} coincidieron con «${palabraUsada}».`);
    setPaso('resumen_ronda');
  };

  const confirmarSinCoincidencia = () => {
    const palabraNueva =
      palabraNoCoincididaInput.trim().toUpperCase() ||
      PALABRAS_BASE[Math.floor(Math.random() * PALABRAS_BASE.length)];

    const jugsActualizados = jugadores.map((j) => ({ ...j, racha: 0 }));

    setJugadores(jugsActualizados);
    setPalabraSiguiente(palabraNueva);
    setLogRonda(`Nadie coincidió en esta ronda. La siguiente palabra base será «${palabraNueva}».`);
    setPaso('resumen_ronda');
  };

  const siguienteRonda = () => {
    if (rondaNum >= MAX_RONDAS) {
      setPaso('fin');
      return;
    }

    setRondaNum((prev) => prev + 1);
    setPalabraActual(palabraSiguiente);
    setSeleccionados([]);
    setPalabraCoincididaInput('');
    setPalabraNoCoincididaInput('');
    setPaso('ronda');
  };

  const ranking = [...jugadores].sort((a, b) => b.puntos - a.puntos);
  const maxPuntos = ranking.length > 0 ? ranking[0].puntos : 0;
  const ganadores = maxPuntos > 0 ? ranking.filter((j) => j.puntos === maxPuntos) : [];

  const enPartidaActiva = paso !== 'setup';

  // Salón de la fama: se guarda la partida al llegar a la pantalla final
  useRegistrarPartida('telepatia', paso === 'fin' ? ganadoresPorPuntos((jugadores || []).filter((j) => !j.fuera && !j.abandonado).map((j) => ({ nombre: j.nombre, puntos: j.puntos ?? null }))) : null);
  return (
    <div className={`tel-contenedor ${enPartidaActiva ? 'qq-en-partida' : ''}`}>
      {/* 1. CONFIGURACIÓN DE JUGADORES */}
      {paso === 'setup' && (
        <section className="game">
          <div className="panel qq-menu-panel">
            <div className="qq-card-top">
              <button type="button" className="qq-link-volver" onClick={volverAlMenu}>
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
              <label className="qq-label-destacado" htmlFor="num-jugadores-tel">
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
                  id="num-jugadores-tel"
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
                    placeholder={`Nombre del jugador ${j.id}`}
                    maxLength={20}
                  />
                </div>
              ))}
            </div>
            <RecientesJugadores usados={listaConfig.map((j) => j.nombre)} onPoner={(n) => setListaConfig((l) => ponerReciente(l, n))} />

            <SelectorRondas juegoId="telepatia" valor={rondasSel} onCambiar={setRondasSel} numJugadores={listaConfig.length} />
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

      {/* 2. RONDA: MOSTRAR PALABRA BASE */}
      {paso === 'ronda' && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            categoria={{ nombre: 'En voz alta', icono: 'zap' }}
            etiqueta={`Ronda ${rondaNum} de ${MAX_RONDAS} · Palabra base`}
            titulo={palabraActual}
          >
            <div className="qqp-identidad">
              <span className="qqp-identidad-icono"><Icon name="zap" size={16} strokeWidth={2.4} /></span>
              <span>A la de tres, decid todos a la vez una palabra relacionada con <strong>«{palabraActual}»</strong>.</span>
            </div>

            <OrdenTurnos jugadores={jugadores} />
          </Cabecera>

          <div className="qqp-tarjeta qqp-pasar">
            <span className="tel-palabra-emoji" aria-hidden="true">🧠⚡</span>
            <p className="qqp-pasar-para">Palabra de la Ronda {rondaNum}</p>
            <h3 className="qqp-pasar-nombre tel-palabra-hero">{palabraActual}</h3>
            <p className="qqp-texto">
              Contad «1, 2, 3…» y decid vuestra palabra en voz alta al mismo tiempo. ¿Alguien ha coincidido?
            </p>
          </div>

          <div className="qqp-barra">
            <BotonPrincipal
              onClick={() => {
                setSeleccionados([]);
                setPalabraCoincididaInput('');
                setPaso('registrar_coincidencia');
              }}
            >
              <Icon name="check" size={22} strokeWidth={2.5} /> ¡Varios jugadores han coincidido!
            </BotonPrincipal>
            <EnlaceSecundario
              onClick={() => {
                setPalabraNoCoincididaInput('');
                setPaso('registrar_no_coincidencia');
              }}
            >
              Nadie ha coincidido en esta ronda
            </EnlaceSecundario>
          </div>
        </section>
      )}

      {/* 3. REGISTRAR COINCIDENCIA */}
      {paso === 'registrar_coincidencia' && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setPaso('ronda')}
            textoSalir="Volver"
            categoria={{ nombre: `Base: ${palabraActual}`, icono: 'zap' }}
            etiqueta={`Ronda ${rondaNum} de ${MAX_RONDAS} · Conexión mental`}
            titulo="¿Quiénes coincidieron?"
          >
            <OrdenTurnos jugadores={jugadores} seleccionadosIds={seleccionados} />
          </Cabecera>

          <div className="qqp-tarjeta">
            <p className="qqp-carta-cara-titulo" style={{ marginBottom: '0.6rem' }}>
              <Icon name="users" size={16} /> 1. Toca los jugadores que dijeron la misma palabra (mínimo 2)
            </p>

            <div className="tel-check-grid">
              {jugadores.map((j, idx) => {
                const sel = seleccionados.includes(j.id);
                return (
                  <button
                    key={j.id}
                    type="button"
                    className={`tel-check-btn ${sel ? 'seleccionado' : ''}`}
                    style={{ '--c': colorJugador(indiceColor(j, idx)) }}
                    onClick={() => toggleSeleccion(j.id)}
                  >
                    <span className="tel-check-avatar">{sel ? '✓' : inicial(j.nombre)}</span>
                    <span className="tel-check-nombre">{j.nombre}</span>
                  </button>
                );
              })}
            </div>

            <div style={{ marginTop: '1.2rem' }}>
              <label className="qq-label-destacado" htmlFor="tel-palabra-coincidente">
                2. ¿Qué palabra dijeron? (Será la base de la siguiente ronda)
              </label>
              <input
                id="tel-palabra-coincidente"
                type="text"
                className="qq-input-moderno tel-input-palabra"
                placeholder="PALABRA COINCIDENTE"
                value={palabraCoincididaInput}
                onChange={(e) => setPalabraCoincididaInput(e.target.value.toUpperCase())}
                autoFocus
              />
            </div>
          </div>

          <div className="qqp-barra">
            <BotonPrincipal
              disabled={seleccionados.length < 2 || !palabraCoincididaInput.trim()}
              onClick={confirmarCoincidencia}
            >
              <Icon name="check" size={22} strokeWidth={2.5} /> Guardar coincidencia y sumar puntos
            </BotonPrincipal>
            <EnlaceSecundario onClick={() => setPaso('ronda')}>
              Cancelar y volver
            </EnlaceSecundario>
          </div>
        </section>
      )}

      {/* 4. REGISTRAR NO COINCIDENCIA */}
      {paso === 'registrar_no_coincidencia' && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setPaso('ronda')}
            textoSalir="Volver"
            categoria={{ nombre: `Base: ${palabraActual}`, icono: 'zap' }}
            etiqueta={`Ronda ${rondaNum} de ${MAX_RONDAS} · Sin conexión`}
            titulo="Nadie ha coincidido"
          />

          <div className="qqp-tarjeta">
            <label className="qq-label-destacado" htmlFor="tel-palabra-nueva">
              Escribe una de las palabras dichas para usarla en la Ronda {rondaNum + 1} (o déjalo vacío para una aleatoria)
            </label>
            <input
              id="tel-palabra-nueva"
              type="text"
              className="qq-input-moderno tel-input-palabra"
              placeholder="NUEVA PALABRA BASE..."
              value={palabraNoCoincididaInput}
              onChange={(e) => setPalabraNoCoincididaInput(e.target.value.toUpperCase())}
              autoFocus
            />
          </div>

          <div className="qqp-barra">
            <BotonPrincipal onClick={confirmarSinCoincidencia}>
              <Icon name="forward" size={20} /> Continuar con esta palabra
            </BotonPrincipal>
            <EnlaceSecundario onClick={() => setPaso('ronda')}>
              Cancelar y volver
            </EnlaceSecundario>
          </div>
        </section>
      )}

      {/* 5. RESUMEN DE RONDA */}
      {paso === 'resumen_ronda' && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            etiqueta={`Ronda ${rondaNum} de ${MAX_RONDAS} completada`}
            titulo={`Siguiente: ${palabraSiguiente}`}
          >
            <div className="qqp-identidad">
              <span className="qqp-identidad-icono"><Icon name="zap" size={16} /></span>
              <span>{logRonda}</span>
            </div>
          </Cabecera>

          <div className="qqp-tarjeta">
            <p className="qqp-carta-cara-titulo" style={{ marginBottom: '0.8rem' }}>
              <Icon name="trophy" size={16} /> Clasificación general
            </p>
            <ul className="qqp-rivales">
              {ranking.map((j, i) => {
                const lider = maxPuntos > 0 && j.puntos === maxPuntos;
                return (
                  <li key={j.id} className="qqp-rival" style={{ '--c': colorJugador(indiceColor(j, i)) }}>
                    <span className="qqp-rival-avatar">{lider ? '👑' : i + 1}</span>
                    <span className="qqp-rival-datos">
                      <span className="qqp-rival-nombre">
                        {lider ? 'Líder actual' : `Puesto ${i + 1}`}
                        {j.racha > 1 ? ` · 🔥 Racha x${j.racha}` : ''}
                      </span>
                      <strong className="qqp-rival-tarjeta">{j.nombre}</strong>
                    </span>
                    <span className="tel-ranking-pts">{j.puntos} pts</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="qqp-barra">
            <BotonPrincipal onClick={siguienteRonda}>
              <Icon name="play" size={20} />
              {rondaNum >= MAX_RONDAS ? 'Ver podio final' : `Ir a Ronda ${rondaNum + 1} de ${MAX_RONDAS}`}
            </BotonPrincipal>
            <EnlaceSecundario onClick={() => setPaso('fin')}>
              Finalizar partida anticipadamente
            </EnlaceSecundario>
          </div>
        </section>
      )}

      {/* 6. PODIO FINAL */}
      {paso === 'fin' && (
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
                  ? <>¡Victoria para <strong>{ganadores[0].nombre}</strong> con <strong>{maxPuntos} pts</strong>!</>
                  : <>Empate entre <strong>{ganadores.map((g) => g.nombre).join(', ')}</strong> con <strong>{maxPuntos} pts</strong></>}
              </span>
            </div>
          </Cabecera>

          <div className="qqp-tarjeta">
            <p className="qqp-carta-cara-titulo" style={{ marginBottom: '0.8rem' }}>
              <Icon name="users" size={16} /> Podio de jugadores
            </p>
            <ul className="qqp-rivales">
              {ranking.map((j, i) => {
                const lider = maxPuntos > 0 && j.puntos === maxPuntos;
                return (
                  <li key={j.id} className="qqp-rival" style={{ '--c': colorJugador(indiceColor(j, i)) }}>
                    <span className="qqp-rival-avatar">{lider ? '👑' : i + 1}</span>
                    <span className="qqp-rival-datos">
                      <span className="qqp-rival-nombre">{lider ? '¡Ganador!' : `Puesto ${i + 1}`}</span>
                      <strong className="qqp-rival-tarjeta">{j.nombre}</strong>
                    </span>
                    <span className="tel-ranking-pts">{j.puntos} pts</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="qqp-barra">
            <BotonPrincipal onClick={() => setPaso('setup')}>
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