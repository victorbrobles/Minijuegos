// client/src/games/Buscaminas/BuscaminasLocal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import './Buscaminas.css';
import { centrarActivo } from '../../lib/centrarActivo.js';

const MIN_JUGADORES = 3;
const MAX_JUGADORES = 8;
const MAX_RONDAS = 10;
const TOTAL_CORRECTOS = 10;
const TOTAL_MINAS = 5;
const TIEMPO_TURNO = 30;

const COLORES = ['#3b82f6', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4', '#f97316'];
export const colorJugador = (i) => COLORES[((i % COLORES.length) + COLORES.length) % COLORES.length];
export const inicial = (nombre = '?') => nombre.trim().charAt(0).toUpperCase() || '?';
export const indiceColor = (j, i) => (typeof j?.id === 'number' ? j.id - 1 : i);

const COLORES_CATEGORIA = [
  ['#f97316', '#ef4444'], ['#8b5cf6', '#6366f1'], ['#06b6d4', '#3b82f6'], ['#ec4899', '#f43f5e'],
  ['#22c55e', '#84cc16'], ['#3b82f6', '#8b5cf6'], ['#f59e0b', '#f97316'], ['#14b8a6', '#22c55e']
];

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
    const id = setTimeout(() => setVisible(null), 3800);
    return () => clearTimeout(id);
  }, [evento]);

  if (!visible) return null;
  const bueno = ['acierto', 'tema_ok', 'ultima_ok'].includes(visible.tipo);
  const malo = ['fallo', 'tiempo', 'ultima_ko', 'tema_ko'].includes(visible.tipo);

  return (
    <div className={`cnp-aviso${bueno ? ' bueno' : ''}${malo ? ' malo' : ''}`} role="status" aria-live="polite">
      <span aria-hidden="true">{bueno ? '🎉' : malo ? (visible.eliminado ? '💀' : '💔') : 'ℹ️'}</span>
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
        <Icon name="bomb" size={150} strokeWidth={1.4} />
      </span>
      <div className="qqp-hero-top">
        {onSalir ? <BotonPortada onClick={onSalir} texto={textoSalir} /> : <span />}
        <div className="qqp-hero-chips">
          {chips}
          {categoria && (
            <span className="qqp-chip" title="Categoría de la ronda">
              <Icon name={categoria.icono || 'star'} size={14} /> <span>{categoria.nombre}</span>
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

export function OrdenTurnos({ jugadores, activoId, eliminados = [], puntosMap = null }) {
  const ref = useRef(null);
  useEffect(() => {
    centrarActivo(ref.current);
  }, [activoId]);

  return (
    <ol className="qqp-orden" ref={ref} aria-label="Estado de los jugadores">
      {jugadores.map((j, i) => {
        const esActivo = j.id === activoId;
        const eliminado = eliminados.includes(j.id);
        const pts = puntosMap ? (puntosMap[j.id] ?? 0) : (j.puntos ?? 0);
        return (
          <li
            key={j.id}
            className={`qqp-orden-item${esActivo ? ' activo' : ''}${eliminado ? ' eliminado' : ''}`}
            style={{ '--c': colorJugador(indiceColor(j, i)) }}
            aria-current={esActivo ? 'step' : undefined}
          >
            <span className="qqp-orden-avatar">{eliminado ? '💥' : inicial(j.nombre)}</span>
            <span className="qqp-orden-nombre">{j.nombre}</span>
            <span className="qqp-orden-pts">{pts}p</span>
          </li>
        );
      })}
    </ol>
  );
}

export function SelectorCategorias({ categorias, rondaActual, maxRondas, onElegir, onSalir, onAyuda, aviso }) {
  const [filtro, setFiltro] = useState('');
  const normalizar = (t) => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const visibles = filtro.trim()
    ? categorias.filter((c) => normalizar(c.nombre).includes(normalizar(filtro.trim())))
    : categorias;

  return (
    <section className="game qqp-escena">
      <header className="qqp-hero">
        <span className="qqp-hero-deco" aria-hidden="true">
          <Icon name="bomb" size={150} strokeWidth={1.4} />
        </span>
        <div className="qqp-hero-top">
          {onSalir ? <BotonPortada onClick={onSalir} /> : <span />}
          <div className="qqp-hero-chips">
            <span className="qqp-chip">
              <Icon name="flagFinish" size={14} /> <span>Ronda {rondaActual} de {maxRondas}</span>
            </span>
            {onAyuda && (
              <button type="button" className="qqp-ayuda" onClick={onAyuda} title="Cómo jugar" aria-label="Cómo jugar">
                ?
              </button>
            )}
          </div>
        </div>
        <p className="qqp-hero-etiqueta">Nueva ronda</p>
        <h2 className="qqp-hero-titulo">Elige la temática</h2>
        {aviso && <p className="qqp-hero-aviso">{aviso}</p>}

        <label className="qqp-buscador">
          <Icon name="search" size={18} />
          <input
            type="search"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder="Buscar categoría…"
            aria-label="Buscar categoría"
          />
        </label>
      </header>

      {visibles.length ? (
        <ul className="qqp-categorias">
          {visibles.map((cat) => {
            const i = categorias.indexOf(cat);
            const [c1, c2] = COLORES_CATEGORIA[i % COLORES_CATEGORIA.length];
            return (
              <li key={cat.id}>
                <button
                  type="button"
                  className="qqp-categoria"
                  style={{ '--c1': c1, '--c2': c2 }}
                  onClick={() => onElegir(cat)}
                >
                  <span className="qqp-categoria-icono">
                    <Icon name={cat.icono || 'star'} size={24} />
                  </span>
                  <span className="qqp-categoria-textos">
                    <span className="qqp-categoria-nombre">{cat.nombre}</span>
                    <span className="qqp-categoria-info">15 casillas · 5 minas</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="qqp-vacio">No hay ninguna categoría con «{filtro}».</p>
      )}
    </section>
  );
}

export function BotonPrincipal({ children, onClick, disabled }) {
  return (
    <button type="button" className="qqp-boton" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export function EnlaceSecundario({ children, onClick }) {
  return (
    <button type="button" className="qqp-enlace" onClick={onClick}>
      {children}
    </button>
  );
}

/* ==========================================================================
   MODO LOCAL: BUSCAMINAS
   ========================================================================== */

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
  const [turnoTick, setTurnoTick] = useState(0);

  const [explosionModal, setExplosionModal] = useState(null);
  const [motivoFinRonda, setMotivoFinRonda] = useState('');

  const [eventoAviso, setEventoAviso] = useState(null);
  const avisoSeqRef = useRef(0);

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

  const iniciarRondaConCategoria = async (cat) => {
    const catObj = typeof cat === 'object' ? cat : categorias.find((c) => c.id === cat) || { id: cat, nombre: 'Temática' };
    setCategoriaElegida(catObj);
    try {
      const res = await fetch('/api/buscaminas/tablero', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoria: catObj.id, usados: tablerosUsados })
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
        setTurnoTick(0);
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
  const jugadoresEnOrden = ordenTurnoRonda.map((id) => jugadores.find((j) => j.id === id)).filter(Boolean);

  const avanzarTurno = (nuevosEliminados = eliminadosRonda) => {
    const vivos = ordenTurnoRonda.filter((id) => !nuevosEliminados.includes(id));
    if (vivos.length === 0) return;

    let proxIndice = (indiceTurno + 1) % ordenTurnoRonda.length;
    while (nuevosEliminados.includes(ordenTurnoRonda[proxIndice])) {
      proxIndice = (proxIndice + 1) % ordenTurnoRonda.length;
    }

    if (proxIndice === indiceTurno && fase === 'jugando') {
      setTurnoTick((t) => t + 1);
      return;
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
          if (avanzarTurnoRef.current) avanzarTurnoRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fase, indiceTurno, turnoTick]);

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

      avisoSeqRef.current += 1;
      setEventoAviso({
        n: avisoSeqRef.current,
        tipo: 'acierto',
        texto: `¡${jugadorActivo.nombre} acierta «${casilla.texto}» (+${casilla.puntos} ${casilla.puntos === 1 ? 'pt' : 'pts'})!`
      });

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
      <Aviso evento={eventoAviso} />

      {/* 1. CONFIGURACIÓN DE JUGADORES (Con botón de ayuda) */}
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
              onClick={irACategorias}
            >
              <Icon name="play" size={22} /> Iniciar juego
            </button>
          </div>
        </section>
      )}

      {/* 2. SELECTOR DE CATEGORÍA (Última pantalla con botón de ayuda) */}
      {fase === 'categoria' && (
        <SelectorCategorias
          categorias={categorias}
          rondaActual={rondaActual}
          maxRondas={MAX_RONDAS}
          onElegir={iniciarRondaConCategoria}
          onSalir={() => (rondaActual === 1 ? setFase('setup') : setModalSalirPortada(true))}
          onAyuda={onAbrirAyuda}
          aviso="Al tocar una categoría se cargará un tablero de 15 casillas con 10 aciertos y 5 minas."
        />
      )}

      {/* 3. PANTALLA PASAR EL MÓVIL (Sin botón de ayuda) */}
      {fase === 'pasar_turno' && jugadorActivo && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            categoria={categoriaElegida}
            etiqueta={`Ronda ${rondaActual} de ${MAX_RONDAS}`}
            titulo="Pasad el móvil"
          >
            <OrdenTurnos
              jugadores={jugadoresEnOrden}
              activoId={jugadorActivo.id}
              eliminados={eliminadosRonda}
              puntosMap={puntos}
            />
          </Cabecera>

          <div className="qqp-tarjeta qqp-pasar">
            <Avatar nombre={jugadorActivo.nombre} color={colorJugador(indiceColor(jugadorActivo, 0))} grande />
            <p className="qqp-pasar-para">Le toca a</p>
            <h3 className="qqp-pasar-nombre">{jugadorActivo.nombre}</h3>
            <p className="qqp-texto">
              Tendrás <strong>{TIEMPO_TURNO} segundos</strong> para elegir una casilla que cumpla la consigna sin pisar ninguna de las 5 bombas.
            </p>
          </div>

          <div className="qqp-barra">
            <BotonPrincipal onClick={() => setFase('jugando')}>
              <Icon name="eye" size={22} /> Soy {jugadorActivo.nombre}, ¡a jugar!
            </BotonPrincipal>
          </div>
        </section>
      )}

      {/* 4. TABLERO EN JUEGO (Sin botón de ayuda) */}
      {fase === 'jugando' && jugadorActivo && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            categoria={categoriaElegida}
            etiqueta={`Ronda ${rondaActual} de ${MAX_RONDAS} · Turno activo`}
            titulo={jugadorActivo.nombre}
            avatar={<Avatar nombre={jugadorActivo.nombre} color={colorJugador(indiceColor(jugadorActivo, 0))} />}
          >
            <div className="qqp-identidad bm-consigna-box">
              <div className="bm-consigna-top">
                <span className="qqp-identidad-icono">
                  <Icon name="target" size={16} strokeWidth={2.4} />
                </span>
                <span className="bm-consigna-texto">«{consigna}»</span>
              </div>
              <div className="bm-hero-stats">
                <span className="bm-hero-stat ok">✅ {correctasDescubiertas}/{TOTAL_CORRECTOS}</span>
                <span className="bm-hero-stat danger">💣 {minasExplotadas}/{TOTAL_MINAS}</span>
                <span className={`bm-hero-stat timer${tiempoRestante <= 10 ? ' low' : ''}`}>
                  <Icon name="clock" size={14} /> {tiempoRestante}s
                </span>
              </div>
              <div className="bm-timer-track" role="timer">
                <div
                  className={`bm-timer-fill${tiempoRestante <= 10 ? ' low' : ''}`}
                  style={{ width: `${(tiempoRestante / TIEMPO_TURNO) * 100}%` }}
                />
              </div>
            </div>

            <OrdenTurnos
              jugadores={jugadoresEnOrden}
              activoId={jugadorActivo.id}
              eliminados={eliminadosRonda}
              puntosMap={puntos}
            />
          </Cabecera>

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
                }
                return (
                  <button key={c.id} type="button" className="bm-casilla-btn mina-explotada" disabled>
                    <span>💣 {c.texto}</span>
                  </button>
                );
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

          <div className="qqp-barra">
            <EnlaceSecundario
              onClick={() => {
                setMotivoFinRonda('Ronda finalizada por decisión del grupo.');
                setFase('ronda_fin');
              }}
            >
              <Icon name="flagFinish" size={16} /> Finalizar ronda y ver soluciones
            </EnlaceSecundario>
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
                <BotonPrincipal onClick={cerrarModalExplosion}>
                  {motivoFinRonda ? 'Ver resultados de la ronda' : 'Continuar con el siguiente jugador'}
                </BotonPrincipal>
              </div>
            </div>
          )}
        </section>
      )}

      {/* 5. FIN DE RONDA (Sin botón de ayuda) */}
      {fase === 'ronda_fin' && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            categoria={categoriaElegida}
            etiqueta={`Ronda ${rondaActual} de ${MAX_RONDAS} completada`}
            titulo={motivoFinRonda || 'Fin de la ronda'}
          >
            <div className="qqp-identidad">
              <span className="qqp-identidad-icono"><Icon name="check" size={16} strokeWidth={2.5} /></span>
              <span>Consigna: <strong>«{consigna}»</strong></span>
            </div>
          </Cabecera>

          <div className="qqp-tarjeta">
            <p className="qqp-carta-cara-titulo" style={{ marginBottom: '0.8rem' }}>
              <Icon name="eye" size={16} /> Solución del tablero
            </p>
            <div className="bm-grid-15 bm-grid-compacto">
              {casillas.map((c) => (
                <div
                  key={c.id}
                  className={`bm-casilla-btn ${c.correcto ? 'acertada' : 'mina-explotada'}`}
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
          </div>

          <div className="qqp-tarjeta">
            <p className="qqp-carta-cara-titulo" style={{ marginBottom: '0.8rem' }}>
              <Icon name="trophy" size={16} /> Clasificación general
            </p>
            <ul className="qqp-rivales">
              {ranking.map((j, i) => {
                const pts = puntos[j.id] ?? 0;
                const lider = maximoPuntos > 0 && pts === maximoPuntos;
                return (
                  <li key={j.id} className="qqp-rival" style={{ '--c': colorJugador(indiceColor(j, i)) }}>
                    <span className="qqp-rival-avatar">{lider ? '👑' : i + 1}</span>
                    <span className="qqp-rival-datos">
                      <span className="qqp-rival-nombre">{lider ? 'Líder actual' : `Puesto ${i + 1}`}</span>
                      <strong className="qqp-rival-tarjeta">{j.nombre}</strong>
                    </span>
                    <span className="bm-ranking-pts">{pts} pts</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="qqp-barra">
            {rondaActual < MAX_RONDAS ? (
              <BotonPrincipal onClick={siguienteRonda}>
                <Icon name="play" size={20} /> Jugar ronda {rondaActual + 1} de {MAX_RONDAS}
              </BotonPrincipal>
            ) : (
              <BotonPrincipal onClick={() => setFase('final')}>
                <Icon name="trophy" size={20} /> Ver podio final
              </BotonPrincipal>
            )}
            <EnlaceSecundario onClick={() => setFase('final')}>
              Finalizar partida anticipadamente
            </EnlaceSecundario>
          </div>
        </section>
      )}

      {/* 6. PODIO FINAL (Sin botón de ayuda) */}
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
                  ? <>¡Victoria para <strong>{ganadores[0].nombre}</strong> con <strong>{maximoPuntos} pts</strong>!</>
                  : <>Empate entre <strong>{ganadores.map((g) => g.nombre).join(', ')}</strong> con <strong>{maximoPuntos} pts</strong></>}
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
                const lider = maximoPuntos > 0 && pts === maximoPuntos;
                return (
                  <li key={j.id} className="qqp-rival" style={{ '--c': colorJugador(indiceColor(j, i)) }}>
                    <span className="qqp-rival-avatar">{lider ? '👑' : i + 1}</span>
                    <span className="qqp-rival-datos">
                      <span className="qqp-rival-nombre">{lider ? '¡Ganador!' : `Puesto ${i + 1}`}</span>
                      <strong className="qqp-rival-tarjeta">{j.nombre}</strong>
                    </span>
                    <span className="bm-ranking-pts">{pts} pts</span>
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