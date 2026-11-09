// client/src/games/Impostor/ImpostorLocal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import './Impostor.css';

const MIN_JUGADORES = 3;
const MAX_JUGADORES = 20;

const COLORES = ['#3b82f6', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4', '#f97316'];
export const colorJugador = (i) => COLORES[((i % COLORES.length) + COLORES.length) % COLORES.length];
export const inicial = (nombre = '?') => nombre.trim().charAt(0).toUpperCase() || '?';
export const indiceColor = (j, i) => (typeof j?.id === 'number' ? j.id - 1 : i);

export const MODOS_IMPOSTOR = [
  {
    id: 'clasico',
    emoji: '🤫',
    icono: 'eye',
    nombre: 'Modo Clásico',
    badge: 'Puro engaño',
    descripcion: 'El impostor no sabe absolutamente nada. Debe escuchar las pistas de los demás y deducir de qué hablan sin ser descubierto.',
    c1: '#ef4444',
    c2: '#b91c1c'
  },
  {
    id: 'pista',
    emoji: '🔍',
    icono: 'search',
    nombre: 'Con Pista',
    badge: 'Ayuda táctica',
    descripcion: 'El impostor recibe una pista exclusiva relacionada con la palabra secreta para poder defenderse desde el primer turno.',
    c1: '#f59e0b',
    c2: '#d97706'
  },
  {
    id: 'camuflado',
    emoji: '🎭',
    icono: 'users',
    nombre: 'Camuflado',
    badge: 'Palabra trampa',
    descripcion: 'El impostor recibe una palabra muy parecida a la del pueblo. Nadie sabe con certeza si tiene la palabra real o la falsa.',
    c1: '#8b5cf6',
    c2: '#6d28d9'
  },
  {
    id: 'preguntas',
    emoji: '❓',
    icono: 'target',
    nombre: 'Modo Preguntas',
    badge: 'Interrogatorio Sí/No',
    descripcion: 'El impostor conoce la categoría general. Por turnos os hacéis preguntas de «Sí» o «No» sobre la palabra para cazarle.',
    c1: '#06b6d4',
    c2: '#0284c7'
  }
];

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
        <Icon name="eye" size={150} strokeWidth={1.4} />
      </span>
      <div className="qqp-hero-top">
        {onSalir ? <BotonPortada onClick={onSalir} texto={textoSalir} /> : <span />}
        <div className="qqp-hero-chips">
          {chips}
          {categoria && (
            <span className="qqp-chip" title="Modo de juego">
              <Icon name={categoria.icono || 'eye'} size={14} /> <span>{categoria.nombre}</span>
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

export function OrdenTurnos({ jugadores, activoId, vistosCount = null, puntosMap = null }) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current?.querySelector('.activo')?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [activoId]);

  return (
    <ol className="qqp-orden" ref={ref} aria-label="Estado de los jugadores">
      {jugadores.map((j, i) => {
        const esActivo = j.id === activoId;
        const yaVisto = typeof vistosCount === 'number' && i < vistosCount;
        const pts = puntosMap ? (puntosMap[j.id] ?? 0) : (j.puntos ?? 0);
        return (
          <li
            key={j.id}
            className={`qqp-orden-item${esActivo ? ' activo' : ''}`}
            style={{ '--c': colorJugador(indiceColor(j, i)) }}
            aria-current={esActivo ? 'step' : undefined}
          >
            <span className="qqp-orden-avatar">{yaVisto ? '✓' : inicial(j.nombre)}</span>
            <span className="qqp-orden-nombre">{j.nombre}</span>
            <span className="qqp-orden-pts">{pts}p</span>
          </li>
        );
      })}
    </ol>
  );
}

export function SelectorModosImpostor({
  rondaActual,
  modoSeleccionado,
  onElegirModo,
  onSalir,
  textoSalir = 'Portada',
  onAyuda
}) {
  return (
    <section className="game qqp-escena">
      <header className="qqp-hero">
        <span className="qqp-hero-deco" aria-hidden="true">
          <Icon name="eye" size={150} strokeWidth={1.4} />
        </span>
        <div className="qqp-hero-top">
          {onSalir ? <BotonPortada onClick={onSalir} texto={textoSalir} /> : <span />}
          <div className="qqp-hero-chips">
            <span className="qqp-chip">
              <Icon name="flagFinish" size={14} /> <span>Partida {rondaActual}</span>
            </span>
            {onAyuda && (
              <button type="button" className="qqp-ayuda" onClick={onAyuda} title="Cómo jugar" aria-label="Cómo jugar">
                ?
              </button>
            )}
          </div>
        </div>
        <p className="qqp-hero-etiqueta">Configuración de la ronda</p>
        <h2 className="qqp-hero-titulo">Elige el tipo de juego</h2>
        <p className="qqp-hero-aviso">
          Toca una modalidad para repartir los roles secretos y comenzar la partida.
        </p>
      </header>

      <div className="imp-modos-grid">
        {MODOS_IMPOSTOR.map((m) => {
          const esActual = modoSeleccionado === m.id;
          return (
            <button
              key={m.id}
              type="button"
              className={`imp-modo-card ${esActual ? 'seleccionado' : ''}`}
              style={{ '--c1': m.c1, '--c2': m.c2 }}
              onClick={() => onElegirModo(m.id)}
            >
              <div className="imp-modo-top">
                <span className="imp-modo-icono" aria-hidden="true">
                  <span className="imp-modo-emoji">{m.emoji}</span>
                </span>
                <span className="imp-modo-badge">{m.badge}</span>
              </div>

              <div className="imp-modo-cuerpo">
                <h3 className="imp-modo-titulo">{m.nombre}</h3>
                <p className="imp-modo-desc">{m.descripcion}</p>
              </div>

              <div className="imp-modo-footer">
                <span>Jugar a {m.nombre}</span>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          );
        })}
      </div>
    </section>
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
   MODO LOCAL: EL IMPOSTOR
   ========================================================================== */

export default function ImpostorLocal({ onVolver, onExit, onAbrirAyuda }) {
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

  const [modoJuego, setModoJuego] = useState('clasico');
  const [itemJuego, setItemJuego] = useState(null);

  const [impostorId, setImpostorId] = useState(null);
  const [jugadorInicialId, setJugadorInicialId] = useState(null);

  const [indiceReparto, setIndiceReparto] = useState(0);

  // Cubierta táctil idéntica a Quién es Quién para descubrir el rol
  const [mirandoRol, setMirandoRol] = useState(false);
  const vibradoRol = useRef(false);

  const mostrarRol = (e) => {
    if (e?.type === 'pointerdown' && e.button > 0) return;
    setMirandoRol(true);
    if (!vibradoRol.current && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(12);
      vibradoRol.current = true;
    }
  };
  const ocultarRol = () => {
    setMirandoRol(false);
    vibradoRol.current = false;
  };

  const [ganador, setGanador] = useState('impostor');
  const [rondasSobrevividas, setRondasSobrevividas] = useState(1);
  const [puntosRonda, setPuntosRonda] = useState({});
  const [rondaActual, setRondaActual] = useState(1);

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

  const irASelectorModo = () => {
    const listaActualizada = jugadores.map((j) => ({
      ...j,
      nombre: j.nombre.trim() || `Jugador ${j.id}`
    }));
    setJugadores(listaActualizada);

    const scores = {};
    listaActualizada.forEach((j) => { scores[j.id] = 0; });
    setPuntos(scores);

    setRondaActual(1);
    setFase('modo');
  };

  const prepararRonda = async (modoElegido = modoJuego, lista = jugadores) => {
    setModoJuego(modoElegido);
    try {
      const res = await fetch(`/api/impostor/palabra?modo=${modoElegido}`);
      const data = await res.json();
      if (data.success) {
        setItemJuego(data.item);

        // Impostor 100% aleatorio entre todos los jugadores
        const impElegido = lista[Math.floor(Math.random() * lista.length)];
        setImpostorId(impElegido.id);

        const inicialElegido = lista[Math.floor(Math.random() * lista.length)];
        setJugadorInicialId(inicialElegido.id);

        setIndiceReparto(0);
        setMirandoRol(false);
        setGanador('impostor');
        setRondasSobrevividas(1);
        setFase('reparto');
      }
    } catch (err) {
      console.error('Error al preparar ronda de impostor:', err);
    }
  };

  const pasarSiguienteJugadorReparto = () => {
    setMirandoRol(false);
    if (indiceReparto + 1 < jugadores.length) {
      setIndiceReparto((prev) => prev + 1);
    } else {
      setFase('en_juego');
    }
  };

  const jugadorEnTurnoReparto = jugadores[indiceReparto];
  const esImpostorEnTurno = jugadorEnTurnoReparto?.id === impostorId;
  const infoModoActual = MODOS_IMPOSTOR.find((m) => m.id === modoJuego) || MODOS_IMPOSTOR[0];

  let miPalabra = null;
  let infoImpostor = null;
  if (itemJuego) {
    if (esImpostorEnTurno) {
      if (modoJuego === 'pista') infoImpostor = itemJuego.pista;
      if (modoJuego === 'camuflado') infoImpostor = itemJuego.palabraImpostor;
      if (modoJuego === 'preguntas') infoImpostor = itemJuego.categoria;
    } else {
      miPalabra = itemJuego.palabra;
    }
  }

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

  const jugadorInicialObj = jugadores.find((j) => j.id === jugadorInicialId);
  const impostorObj = jugadores.find((j) => j.id === impostorId);
  const enPartidaActiva = fase !== 'setup';

  return (
    <div className={`imp-contenedor ${enPartidaActiva ? 'qq-en-partida' : ''}`}>
      {/* 1. SELECCIÓN DE JUGADORES */}
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
              <label className="qq-label-destacado" htmlFor="num-jugadores-imp">
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
                  id="num-jugadores-imp"
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
              onClick={irASelectorModo}
            >
              <Icon name="play" size={22} /> ¡Iniciar juego!
            </button>
          </div>
        </section>
      )}

      {/* 2. PANTALLA DE ELECCIÓN DE TIPO DE JUEGO */}
      {fase === 'modo' && (
        <SelectorModosImpostor
          rondaActual={rondaActual}
          modoSeleccionado={modoJuego}
          onElegirModo={(modoId) => prepararRonda(modoId)}
          onSalir={() => (rondaActual === 1 ? setFase('setup') : setModalSalirPortada(true))}
          textoSalir={rondaActual === 1 ? 'Volver' : 'Portada'}
          onAyuda={onAbrirAyuda}
        />
      )}

      {/* 3. REPARTO SECRETO DE ROLES CON CUBIERTA TÁCTIL */}
      {fase === 'reparto' && jugadorEnTurnoReparto && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            categoria={{ nombre: infoModoActual.nombre, icono: infoModoActual.icono }}
            etiqueta={`Ronda ${rondaActual} · Turno secreto ${indiceReparto + 1} de ${jugadores.length}`}
            titulo={jugadorEnTurnoReparto.nombre}
            avatar={
              <Avatar
                nombre={jugadorEnTurnoReparto.nombre}
                color={colorJugador(indiceColor(jugadorEnTurnoReparto, indiceReparto))}
              />
            }
          >
            <OrdenTurnos
              jugadores={jugadores}
              activoId={jugadorEnTurnoReparto.id}
              vistosCount={indiceReparto}
              puntosMap={puntos}
            />
          </Cabecera>

          <div
            className={`qqp-carta ${mirandoRol ? 'mirando' : ''}`}
            role="button"
            tabIndex={0}
            aria-pressed={mirandoRol}
            aria-label="Mantén pulsado para descubrir tu palabra o rol secreto"
            onPointerDown={mostrarRol}
            onPointerUp={ocultarRol}
            onPointerLeave={ocultarRol}
            onPointerCancel={ocultarRol}
            onContextMenu={(e) => e.preventDefault()}
          >
            <div className="qqp-carta-dorso" aria-hidden={mirandoRol}>
              <span className="qqp-carta-icono"><Icon name="eye" size={34} strokeWidth={2} /></span>
              <p className="qqp-carta-titulo">Mantén pulsado para mirar tu rol</p>
              <p className="qqp-carta-sub">Nadie más debe mirar. Suelta para volver a tapar.</p>
              <span className="qqp-carta-dedo" aria-hidden="true" />
            </div>

            <div className={`qqp-carta-cara imp-rol-card-interactivo ${esImpostorEnTurno ? 'es-impostor' : 'es-pueblo'}`} aria-hidden={!mirandoRol}>
              <span className={`imp-rol-badge ${esImpostorEnTurno ? 'impostor' : 'pueblo'}`}>
                {esImpostorEnTurno ? '🕵️ ERES EL IMPOSTOR' : '😊 INOCENTE · PALABRA SECRETA'}
              </span>

              <h3 className={`imp-palabra-secreta ${esImpostorEnTurno ? 'impostor' : 'pueblo'}`}>
                {esImpostorEnTurno ? '¡ERES EL IMPOSTOR!' : miPalabra}
              </h3>

              {esImpostorEnTurno ? (
                <>
                  {modoJuego === 'clasico' && (
                    <p className="imp-rol-instruccion">
                      No tienes ninguna pista. Escucha con atención a los demás e intenta pasar desapercibido.
                    </p>
                  )}
                  {modoJuego === 'pista' && (
                    <div className="imp-pista-box ambar">
                      <span className="imp-pista-label">🔍 Tu pista exclusiva</span>
                      <strong className="imp-pista-valor">{infoImpostor}</strong>
                    </div>
                  )}
                  {modoJuego === 'camuflado' && (
                    <div className="imp-pista-box violeta">
                      <span className="imp-pista-label">🎭 Tu palabra camuflada</span>
                      <strong className="imp-pista-valor">{infoImpostor}</strong>
                      <span className="imp-pista-nota">Actúa como si esta fuera la palabra de todos.</span>
                    </div>
                  )}
                  {modoJuego === 'preguntas' && (
                    <div className="imp-pista-box azul">
                      <span className="imp-pista-label">❓ Categoría de la palabra</span>
                      <strong className="imp-pista-valor">{infoImpostor}</strong>
                    </div>
                  )}
                </>
              ) : (
                <p className="imp-rol-instruccion">
                  {modoJuego === 'preguntas'
                    ? 'Por turnos, elegid a otro jugador y hacedle una pregunta de «Sí» o «No» sobre esta palabra para cazar al impostor.'
                    : 'Da una pista sutil sobre la palabra: ni tan evidente que el impostor la adivine, ni tan extraña que sospechen de ti.'}
                </p>
              )}
            </div>
          </div>

          <div className="qqp-barra">
            <BotonPrincipal onClick={pasarSiguienteJugadorReparto}>
              <Icon name="check" size={22} strokeWidth={2.5} />
              {indiceReparto + 1 < jugadores.length
                ? 'Siguiente jugador (pasar el móvil)'
                : 'Comenzar el debate'}
            </BotonPrincipal>
          </div>
        </section>
      )}

      {/* 4. DEBATE EN JUEGO */}
      {fase === 'en_juego' && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            categoria={{ nombre: infoModoActual.nombre, icono: infoModoActual.icono }}
            etiqueta={`Ronda ${rondaActual} · Debate en curso`}
            titulo="¡Descubrid al impostor!"
          >
            {jugadorInicialObj && (
              <div className="qqp-identidad">
                <span className="qqp-identidad-icono"><Icon name="dice" size={16} /></span>
                <span>Empieza hablando: <strong>{jugadorInicialObj.nombre}</strong></span>
              </div>
            )}

            <OrdenTurnos
              jugadores={jugadores}
              activoId={jugadorInicialId}
              puntosMap={puntos}
            />
          </Cabecera>

          <div className="qqp-tarjeta qqp-pasar">
            <span className="imp-debate-emoji" aria-hidden="true">{infoModoActual.emoji}</span>
            <p className="qqp-pasar-para">{infoModoActual.nombre}</p>
            <h3 className="qqp-pasar-nombre" style={{ fontSize: '1.65rem' }}>
              Empieza {jugadorInicialObj?.nombre}
            </h3>
            <p className="qqp-texto">
              {infoModoActual.descripcion} Cuando hayáis votado y descubierto quién miente, pulsad en resolver partida.
            </p>
          </div>

          <div className="qqp-barra">
            <BotonPrincipal onClick={() => setFase('resolucion')}>
              <Icon name="flagFinish" size={20} /> Finalizar debate y resolver
            </BotonPrincipal>
            <EnlaceSecundario onClick={() => setFase('modo')}>
              Cambiar modo de juego
            </EnlaceSecundario>
          </div>
        </section>
      )}

      {/* 5. RESOLUCIÓN DE LA PARTIDA */}
      {fase === 'resolucion' && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            categoria={{ nombre: infoModoActual.nombre, icono: infoModoActual.icono }}
            etiqueta={`Ronda ${rondaActual} · Identidad revelada`}
            titulo={`Impostor: ${impostorObj?.nombre || ''}`}
            avatar={
              impostorObj ? (
                <Avatar nombre={impostorObj.nombre} color={colorJugador(indiceColor(impostorObj, 0))} />
              ) : undefined
            }
          >
            <div className="qqp-identidad">
              <span className="qqp-identidad-icono"><Icon name="eye" size={16} /></span>
              <span>Palabra secreta del pueblo: <strong>«{itemJuego?.palabra}»</strong></span>
            </div>
          </Cabecera>

          <div className="qqp-tarjeta imp-resolucion-panel">
            <p className="qqp-carta-cara-titulo" style={{ justifyContent: 'center', width: '100%' }}>
              <Icon name="trophy" size={16} /> ¿Quién ha ganado la ronda?
            </p>

            <div className="imp-ganador-grid">
              <button
                type="button"
                className={`imp-btn-ganador ${ganador === 'impostor' ? 'activa' : ''}`}
                onClick={() => setGanador('impostor')}
              >
                <span>🎭 El Impostor</span>
                <small>+10 pts base</small>
              </button>
              <button
                type="button"
                className={`imp-btn-ganador ${ganador === 'pueblo' ? 'activa' : ''}`}
                onClick={() => setGanador('pueblo')}
              >
                <span>👥 El Pueblo</span>
                <small>+3 pts cada uno</small>
              </button>
            </div>

            <div className="imp-rondas-box">
              <p className="qqp-carta-cara-titulo" style={{ justifyContent: 'center', width: '100%' }}>
                <Icon name="zap" size={16} /> ¿Cuántas rondas sobrevivió el impostor?
              </p>
              <p className="imp-sub-nota">Suma +3 puntos extra por cada vuelta superada sin ser expulsado:</p>

              <div className="imp-big-stepper">
                <button
                  type="button"
                  className="imp-big-stepper-btn"
                  onClick={() => setRondasSobrevividas(Math.max(0, rondasSobrevividas - 1))}
                >
                  &minus;
                </button>
                <span className="imp-big-stepper-val">{rondasSobrevividas}</span>
                <button
                  type="button"
                  className="imp-big-stepper-btn"
                  onClick={() => setRondasSobrevividas(rondasSobrevividas + 1)}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="qqp-barra">
            <BotonPrincipal onClick={resolverPartida}>
              <Icon name="check" size={20} strokeWidth={2.5} /> Calcular puntuaciones
            </BotonPrincipal>
          </div>
        </section>
      )}

      {/* 6. RESULTADOS DE LA RONDA */}
      {fase === 'resultados' && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            etiqueta={`Ronda ${rondaActual} completada`}
            titulo={ganador === 'impostor' ? '¡Victoria del Impostor!' : '¡Victoria del Pueblo!'}
            avatar={
              <span className="qqp-avatar" style={{ '--c': ganador === 'impostor' ? '#ef4444' : '#10b981' }}>
                {ganador === 'impostor' ? '🎭' : '👥'}
              </span>
            }
          >
            <div className="qqp-identidad">
              <span className="qqp-identidad-icono"><Icon name="check" size={16} strokeWidth={2.5} /></span>
              <span>
                Palabra: <strong>«{itemJuego?.palabra}»</strong> · Impostor: <strong>{impostorObj?.nombre}</strong>
              </span>
            </div>
          </Cabecera>

          <div className="qqp-tarjeta">
            <p className="qqp-carta-cara-titulo" style={{ marginBottom: '0.8rem' }}>
              <Icon name="zap" size={16} /> Puntos sumados en esta ronda
            </p>
            <div className="imp-desglose-lista">
              {jugadores.map((j) => {
                const delta = puntosRonda[j.id] || 0;
                const esImp = j.id === impostorId;
                return (
                  <div key={j.id} className={`imp-desglose-fila ${delta > 0 ? 'gano' : ''}`}>
                    <span className="imp-desglose-nombre">
                      <span>{esImp ? '🎭' : '👤'}</span>
                      <strong>{j.nombre}</strong>
                      <small className="imp-rol-mini">{esImp ? 'Impostor' : 'Pueblo'}</small>
                    </span>
                    <span className={`imp-badge-pts ${delta > 0 ? 'pos' : ''}`}>
                      +{delta} pts
                    </span>
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
                    <span className="imp-ranking-pts">{pts} pts</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="qqp-barra">
            <BotonPrincipal
              onClick={() => {
                setRondaActual((r) => r + 1);
                prepararRonda(modoJuego);
              }}
            >
              <Icon name="play" size={20} /> Siguiente partida ({infoModoActual.nombre})
            </BotonPrincipal>
            <EnlaceSecundario
              onClick={() => {
                setRondaActual((r) => r + 1);
                setFase('modo');
              }}
            >
              Cambiar modo de juego para la siguiente
            </EnlaceSecundario>
            <EnlaceSecundario onClick={() => setFase('final')}>
              Finalizar partida y ver podio
            </EnlaceSecundario>
          </div>
        </section>
      )}

      {/* 7. PODIO FINAL */}
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
                    <span className="imp-ranking-pts">{pts} pts</span>
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