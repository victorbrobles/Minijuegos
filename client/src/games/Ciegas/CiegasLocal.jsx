// client/src/games/Ciegas/CiegasLocal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import './Ciegas.css';
import { centrarActivo } from '../../lib/centrarActivo.js';
import { limitesLocal } from '../limites.js';
import { SelectorRondas } from '../../components/MenuJuego.jsx';
import { rondasPorDefecto, totalRondas } from '../rondas.js';

const { min: MIN_JUGADORES, max: MAX_JUGADORES } = limitesLocal('ciegas');

export const CATEGORIAS_CIEGAS = [
  { id: 'comida', nombre: 'Comida', info: 'Platos, postres y sabores', icono: 'star' },
  { id: 'culturapop', nombre: 'Cultura Pop', info: 'Series, cine y tendencias', icono: 'zap' },
  { id: 'deporte', nombre: 'Deporte', info: 'Competiciones y disciplinas', icono: 'trophy' },
  { id: 'deportistas', nombre: 'Deportistas', info: 'Leyendas y estrellas', icono: 'crown' },
  { id: 'famosos', nombre: 'Famosos', info: 'Celebridades e iconos', icono: 'users' },
  { id: 'geografia', nombre: 'Geografía', info: 'Países, ciudades y destinos', icono: 'globe' }
];

const COLORES = ['#3b82f6', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4', '#f97316'];
export const colorJugador = (i) => COLORES[((i % COLORES.length) + COLORES.length) % COLORES.length];
export const inicial = (nombre = '?') => nombre.trim().charAt(0).toUpperCase() || '?';
export const indiceColor = (j, i) => (typeof j?.id === 'number' ? j.id - 1 : i);

const COLORES_CATEGORIA = [
  ['#f97316', '#ef4444'], ['#8b5cf6', '#6366f1'], ['#06b6d4', '#3b82f6'], ['#ec4899', '#f43f5e'],
  ['#22c55e', '#84cc16'], ['#3b82f6', '#8b5cf6']
];

const MEDALLAS_PUESTO = ['🥇 1º', '🥈 2º', '🥉 3º', '4º', '5º'];

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
        <Icon name="trophy" size={150} strokeWidth={1.4} />
      </span>
      <div className="qqp-hero-top">
        {onSalir ? <BotonPortada onClick={onSalir} texto={textoSalir} /> : <span />}
        <div className="qqp-hero-chips">
          {chips}
          {categoria && (
            <span className="qqp-chip ciegas-chip-cat" title="Categoría de la ronda">
              <Icon name={categoria.icono || 'trophy'} size={15} /> <span>{categoria.nombre}</span>
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

export function CajaTemaRanking({ categoriaNombre, tema }) {
  return (
    <div className="ciegas-tema-banner">
      <div className="ciegas-tema-icono">
        <Icon name="trophy" size={22} strokeWidth={2.3} />
      </div>
      <div className="ciegas-tema-textos">
        <span className="ciegas-tema-etiqueta">
          Categoría: <strong>{categoriaNombre || 'General'}</strong> · Tema del Top 5
        </span>
        <strong className="ciegas-tema-titulo">«{tema}»</strong>
      </div>
    </div>
  );
}

export function OrdenTurnos({ jugadores, activoId, votadosMap = {}, puntosMap = null }) {
  const ref = useRef(null);
  useEffect(() => {
    centrarActivo(ref.current);
  }, [activoId]);

  return (
    <ol className="qqp-orden" ref={ref} aria-label="Estado de los jugadores">
      {jugadores.map((j, i) => {
        const esActivo = j.id === activoId;
        const yaVoto = votadosMap[j.id] !== undefined;
        const pts = puntosMap ? (puntosMap[j.id] ?? 0) : (j.puntos ?? 0);
        return (
          <li
            key={j.id}
            className={`qqp-orden-item${esActivo ? ' activo' : ''}`}
            style={{ '--c': colorJugador(indiceColor(j, i)) }}
            aria-current={esActivo ? 'step' : undefined}
          >
            <span className="qqp-orden-avatar">{yaVoto ? '✓' : inicial(j.nombre)}</span>
            <span className="qqp-orden-nombre">{j.nombre}</span>
            <span className="qqp-orden-pts">{pts}p</span>
          </li>
        );
      })}
    </ol>
  );
}

export function SelectorCategorias({ categorias = CATEGORIAS_CIEGAS, rondaActual = 1, onElegir, onSalir, textoSalir = 'Volver', onAyuda, aviso }) {
  const [filtro, setFiltro] = useState('');
  const normalizar = (t) => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const visibles = filtro.trim()
    ? categorias.filter((c) => normalizar(c.nombre).includes(normalizar(filtro.trim())))
    : categorias;

  return (
    <section className="game qqp-escena">
      <header className="qqp-hero">
        <span className="qqp-hero-deco" aria-hidden="true">
          <Icon name="trophy" size={150} strokeWidth={1.4} />
        </span>
        <div className="qqp-hero-top">
          {onSalir ? <BotonPortada onClick={onSalir} texto={textoSalir} /> : <span />}
          <div className="qqp-hero-chips">
            <span className="qqp-chip">
              <Icon name="flagFinish" size={14} /> <span>Ronda {rondaActual}</span>
            </span>
            {onAyuda && (
              <button type="button" className="qqp-ayuda" onClick={onAyuda} title="Cómo jugar" aria-label="Cómo jugar">
                ?
              </button>
            )}
          </div>
        </div>
        <p className="qqp-hero-etiqueta">Configuración</p>
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
                    <span className="qqp-categoria-info">{cat.info || 'Top 5 a ciegas'}</span>
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

/* ==========================================================================
   TABLERO INTERACTIVO DRAG & DROP CON CONFIRMAR / DESHACER
   ========================================================================== */

export function TableroArmarTopCiegas({
  itemActual,
  numeroElemento,
  topArmado = [null, null, null, null, null],
  onConfirmarPuesto
}) {
  const [slotPendiente, setSlotPendiente] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);

  // Al cambiar al siguiente elemento de la secuencia, limpiamos el estado pendiente
  useEffect(() => {
    setSlotPendiente(null);
    setDragOverIdx(null);
  }, [numeroElemento, itemActual]);

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', String(itemActual || ''));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDropEnSlot = (e, idx) => {
    e.preventDefault();
    setDragOverIdx(null);
    if (topArmado[idx] !== null) return;
    setSlotPendiente(idx);
  };

  const handleClickSlot = (idx) => {
    if (topArmado[idx] !== null) return;
    setSlotPendiente(idx);
  };

  const confirmar = () => {
    if (slotPendiente === null || topArmado[slotPendiente] !== null) return;
    const elegido = slotPendiente;
    setSlotPendiente(null);
    onConfirmarPuesto(elegido);
  };

  return (
    <div className="qqp-tarjeta ciegas-armar-card">
      {/* ZONA SUPERIOR: FICHA ARRASTRABLE O AVISO DE PRECOLOCADO */}
      <div className="ciegas-origen-box">
        <span className="ciegas-item-pill">
          Elemento #{numeroElemento} de 5 a colocar a ciegas
        </span>

        {slotPendiente === null ? (
          <>
            <div
              className="ciegas-ficha-draggable"
              draggable
              onDragStart={handleDragStart}
            >
              <span className="ciegas-ficha-icono">🎯</span>
              <strong className="ciegas-ficha-texto">{itemActual}</strong>
              <span className="ciegas-ficha-grip" aria-hidden="true">⋮⋮</span>
            </div>
            <p className="ciegas-instruccion-drag">
              Arrastra la ficha hasta un puesto libre del Top 5 (o toca la casilla donde quieras colocarla)
            </p>
          </>
        ) : (
          <div className="ciegas-origen-precolocado">
            <span>
              Has precolocado <strong>«{itemActual}»</strong> en el puesto <strong>{slotPendiente + 1}º</strong>. Confirma o deshaz debajo.
            </span>
          </div>
        )}
      </div>

      {/* LISTA VERTICAL DE 5 PUESTOS (1 POR LÍNEA) */}
      <div className="ciegas-slots-lista">
        {topArmado.map((itemFijo, idx) => {
          const ocupado = itemFijo !== null;
          const esPendiente = !ocupado && slotPendiente === idx;
          const esDragOver = !ocupado && dragOverIdx === idx;
          const claseMedalla = idx === 0 ? 'oro' : idx === 1 ? 'plata' : idx === 2 ? 'bronce' : 'normal';

          return (
            <div
              key={idx}
              role={!ocupado ? 'button' : undefined}
              tabIndex={!ocupado ? 0 : undefined}
              onDragOver={(e) => {
                if (ocupado) return;
                e.preventDefault();
                if (dragOverIdx !== idx) setDragOverIdx(idx);
              }}
              onDragLeave={() => setDragOverIdx(null)}
              onDrop={(e) => handleDropEnSlot(e, idx)}
              onClick={() => handleClickSlot(idx)}
              onKeyDown={(e) => {
                if (!ocupado && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  handleClickSlot(idx);
                }
              }}
              className={`ciegas-slot-fila ${
                ocupado ? 'ocupado' : esPendiente ? 'pendiente' : 'libre'
              } ${esDragOver ? 'drag-over' : ''}`}
            >
              <span className={`ciegas-puesto-badge ${claseMedalla}`}>
                {MEDALLAS_PUESTO[idx]}
              </span>

              {ocupado ? (
                <>
                  <span className="ciegas-slot-valor fijo">{itemFijo}</span>
                  <span className="ciegas-slot-tag-fijo">🔒 Fijado</span>
                </>
              ) : esPendiente ? (
                <>
                  <span className="ciegas-slot-valor precolocado">{itemActual}</span>
                  <button
                    type="button"
                    className="ciegas-btn-quitar-mini"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSlotPendiente(null);
                    }}
                    title="Deshacer y volver a arrastrar"
                  >
                    ↩ Quitar
                  </button>
                </>
              ) : (
                <span className="ciegas-slot-placeholder">
                  Suelta o toca aquí para colocar en el {idx + 1}º puesto
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* BARRA DE CONFIRMAR O DESHACER CUANDO SE HA SOLTADO EN UNA CASILLA */}
      {slotPendiente !== null && (
        <div className="ciegas-confirmar-box">
          <button
            type="button"
            className="ciegas-btn-deshacer"
            onClick={() => setSlotPendiente(null)}
          >
            ↩ Deshacer
          </button>
          <button
            type="button"
            className="ciegas-btn-confirmar"
            onClick={confirmar}
          >
            <Icon name="check" size={18} strokeWidth={2.5} /> Confirmar en el {slotPendiente + 1}º puesto
          </button>
        </div>
      )}
    </div>
  );
}

export function ListaTopCinco({ topArmado = [] }) {
  return (
    <div className="ciegas-slots-lista">
      {topArmado.map((item, idx) => {
        const claseMedalla = idx === 0 ? 'oro' : idx === 1 ? 'plata' : idx === 2 ? 'bronce' : 'normal';
        return (
          <div key={idx} className="ciegas-slot-fila ocupado">
            <span className={`ciegas-puesto-badge ${claseMedalla}`}>
              {MEDALLAS_PUESTO[idx]}
            </span>
            <span className="ciegas-slot-valor fijo">{item}</span>
          </div>
        );
      })}
    </div>
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
   MODO LOCAL: RANKING A CIEGAS
   ========================================================================== */

export default function CiegasLocal({ onVolver, onExit, onAbrirAyuda }) {
  const navigate = useNavigate();

  // 'setup' | 'categoria' | 'pasar_activo' | 'armando' | 'pasar_movil' | 'votando' | 'resolucion' | 'final'
  const [fase, setFase] = useState('setup');
  const [modalSalirPortada, setModalSalirPortada] = useState(false);

  const [numJugadores, setNumJugadores] = useState(MIN_JUGADORES);
  const [jugadores, setJugadores] = useState(() => Array.from({ length: MIN_JUGADORES }, (_, i) => ({ id: i + 1, nombre: `Jugador ${i + 1}` })));
  const [puntos, setPuntos] = useState({});

  const [categoriaObj, setCategoriaObj] = useState(CATEGORIAS_CIEGAS[0]);
  const [rondaNum, setRondaNum] = useState(1);
  const [rondasSel, setRondasSel] = useState(rondasPorDefecto('ciegas'));
  const maxRondas = totalRondas('ciegas', rondasSel, jugadores.length);
  const [usados, setUsados] = useState([]);

  const [jugadorActivoIdx, setJugadorActivoIdx] = useState(0);

  const [rankingData, setRankingData] = useState(null);
  const [indiceSecuencia, setIndiceSecuencia] = useState(0);
  const [topArmado, setTopArmado] = useState([null, null, null, null, null]);

  const [votanteActualIdx, setVotanteActualIdx] = useState(0);
  const [votos, setVotos] = useState({});

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

  const irACategorias = () => {
    const lista = jugadores.map((j) => ({
      ...j,
      nombre: j.nombre.trim() || `Jugador ${j.id}`
    }));
    setJugadores(lista);

    const scores = {};
    lista.forEach((j) => { scores[j.id] = 0; });
    setPuntos(scores);

    setRondaNum(1);
    setUsados([]);

    const primerActivo = Math.floor(Math.random() * lista.length);
    setJugadorActivoIdx(primerActivo);
    setFase('categoria');
  };

  const cargarNuevaRonda = async (catElegida, usadosLista = usados) => {
    const cat = typeof catElegida === 'object'
      ? catElegida
      : CATEGORIAS_CIEGAS.find((c) => c.id === catElegida) || CATEGORIAS_CIEGAS[0];
    setCategoriaObj(cat);

    try {
      const res = await fetch('/api/ciegas/iniciar-local', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoria: cat.id, usados: usadosLista })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setRankingData(data);
      setUsados([...usadosLista, data.rankingId]);
      setTopArmado([null, null, null, null, null]);
      setIndiceSecuencia(0);
      setVotos({});
      setFase('pasar_activo');
    } catch {
      alert('Error cargando el ranking.');
    }
  };

  const handleColocar = (slotIdx) => {
    if (topArmado[slotIdx] !== null) return;

    const itemActual = rankingData.itemsSecuencia[indiceSecuencia];
    const nuevoTop = [...topArmado];
    nuevoTop[slotIdx] = itemActual;
    setTopArmado(nuevoTop);

    const sig = indiceSecuencia + 1;
    if (sig < 5) {
      setIndiceSecuencia(sig);
    } else {
      let primerVotante = 0;
      if (primerVotante === jugadorActivoIdx) primerVotante = 1;
      setVotanteActualIdx(primerVotante);
      setFase('pasar_movil');
    }
  };

  const registrarVoto = (num) => {
    const votante = jugadores[votanteActualIdx];
    const nuevosVotos = { ...votos, [votante.id]: num };
    setVotos(nuevosVotos);

    let sig = votanteActualIdx + 1;
    if (sig === jugadorActivoIdx) sig += 1;

    if (sig < jugadores.length) {
      setVotanteActualIdx(sig);
      setFase('pasar_movil');
    } else {
      const activo = jugadores[jugadorActivoIdx];
      const sumaPuntosOtorgados = Object.values(nuevosVotos).reduce(
        (acc, val) => acc + (Number(val) || 0),
        0
      );

      setPuntos((prev) => ({
        ...prev,
        [activo.id]: (prev[activo.id] || 0) + sumaPuntosOtorgados
      }));

      setFase('resolucion');
    }
  };

  const siguienteRonda = () => {
    const sigRonda = rondaNum + 1;
    const sigActivo = (jugadorActivoIdx + 1) % jugadores.length;
    setRondaNum(sigRonda);
    setJugadorActivoIdx(sigActivo);
    cargarNuevaRonda(categoriaObj, usados);
  };

  const ranking = [...jugadores].sort((a, b) => (puntos[b.id] ?? 0) - (puntos[a.id] ?? 0));
  const maximo = ranking.length ? (puntos[ranking[0].id] ?? 0) : 0;
  const ganadores = maximo > 0 ? ranking.filter((j) => (puntos[j.id] ?? 0) === maximo) : [];

  const jugadorActivo = jugadores[jugadorActivoIdx];
  const votanteActual = jugadores[votanteActualIdx];
  const sumaRondaActual = Object.values(votos).reduce((acc, v) => acc + (Number(v) || 0), 0);
  const enPartidaActiva = fase !== 'setup';

  return (
    <div className={`ciegas-contenedor ${enPartidaActiva ? 'qq-en-partida' : ''}`}>
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
              <label className="qq-label-destacado" htmlFor="num-jugadores-ciegas">
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
                  id="num-jugadores-ciegas"
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

            <SelectorRondas juegoId="ciegas" valor={rondasSel} onCambiar={setRondasSel} numJugadores={jugadores.length} />
            <button
              type="button"
              className="big full qq-btn-principal"
              style={{ marginTop: '1.5rem' }}
              onClick={irACategorias}
            >
              <Icon name="play" size={22} /> ¡Iniciar juego!
            </button>
          </div>
        </section>
      )}

      {/* 2. SELECTOR DE CATEGORÍA */}
      {fase === 'categoria' && (
        <SelectorCategorias
          categorias={CATEGORIAS_CIEGAS}
          rondaActual={rondaNum}
          onElegir={(cat) => cargarNuevaRonda(cat)}
          onSalir={() => (rondaNum === 1 ? setFase('setup') : setModalSalirPortada(true))}
          textoSalir={rondaNum === 1 ? 'Volver' : 'Portada'}
          onAyuda={onAbrirAyuda}
          aviso={`Toca una temática para comenzar la Ronda ${rondaNum}.`}
        />
      )}

      {/* 2B. PANTALLA DE TURNO DEL PROTAGONISTA QUE ARMA EL RANKING */}
      {fase === 'pasar_activo' && rankingData && jugadorActivo && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            categoria={categoriaObj}
            etiqueta={`Ronda ${rondaNum} de ${maxRondas} · Protagonista`}
            titulo="Pasad el móvil"
          >
            <CajaTemaRanking categoriaNombre={categoriaObj?.nombre} tema={rankingData.tema} />
            <OrdenTurnos
              jugadores={jugadores}
              activoId={jugadorActivo.id}
              puntosMap={puntos}
            />
          </Cabecera>

          <div className="qqp-tarjeta qqp-pasar">
            <Avatar
              nombre={jugadorActivo.nombre}
              color={colorJugador(indiceColor(jugadorActivo, jugadorActivoIdx))}
              grande
            />
            <p className="qqp-pasar-para">Turno de</p>
            <h3 className="qqp-pasar-nombre">{jugadorActivo.nombre}</h3>
            <p className="qqp-texto">
              Vas a armar a ciegas el Top 5 sobre <strong>«{rankingData.tema}»</strong>. Arrastra cada uno de los 5 elementos a un puesto libre y confírmalo.
            </p>
          </div>

          <div className="qqp-barra">
            <BotonPrincipal onClick={() => setFase('armando')}>
              <Icon name="play" size={22} /> Soy {jugadorActivo.nombre}, ¡empezar!
            </BotonPrincipal>
          </div>
        </section>
      )}

      {/* 3. ARMANDO RANKING A CIEGAS (DRAG & DROP CON CONFIRMAR / DESHACER) */}
      {fase === 'armando' && rankingData && jugadorActivo && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            categoria={categoriaObj}
            etiqueta={`Ronda ${rondaNum} de ${maxRondas} · Elemento ${indiceSecuencia + 1} de 5`}
            titulo={jugadorActivo.nombre}
            avatar={
              <Avatar
                nombre={jugadorActivo.nombre}
                color={colorJugador(indiceColor(jugadorActivo, jugadorActivoIdx))}
              />
            }
          >
            <CajaTemaRanking categoriaNombre={categoriaObj?.nombre} tema={rankingData.tema} />
            <OrdenTurnos
              jugadores={jugadores}
              activoId={jugadorActivo.id}
              puntosMap={puntos}
            />
          </Cabecera>

          <TableroArmarTopCiegas
            itemActual={rankingData.itemsSecuencia[indiceSecuencia]}
            numeroElemento={indiceSecuencia + 1}
            topArmado={topArmado}
            onConfirmarPuesto={(slotIdx) => handleColocar(slotIdx)}
          />
        </section>
      )}

      {/* 4. PASAR MÓVIL AL SIGUIENTE VOTANTE */}
      {fase === 'pasar_movil' && votanteActual && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            categoria={categoriaObj}
            etiqueta={`Ronda ${rondaNum} de ${maxRondas} · Votación secreta`}
            titulo="Pasad el móvil"
          >
            <CajaTemaRanking categoriaNombre={categoriaObj?.nombre} tema={rankingData?.tema} />
            <OrdenTurnos
              jugadores={jugadores}
              activoId={votanteActual.id}
              votadosMap={votos}
              puntosMap={puntos}
            />
          </Cabecera>

          <div className="qqp-tarjeta qqp-pasar">
            <Avatar
              nombre={votanteActual.nombre}
              color={colorJugador(indiceColor(votanteActual, votanteActualIdx))}
              grande
            />
            <p className="qqp-pasar-para">Le toca votar a</p>
            <h3 className="qqp-pasar-nombre">{votanteActual.nombre}</h3>
            <p className="qqp-texto">
              Observa el Top 5 que ha dejado <strong>{jugadorActivo?.nombre}</strong> y vota cuántos puntos merece de 0 a 5.
            </p>
          </div>

          <div className="qqp-barra">
            <BotonPrincipal onClick={() => setFase('votando')}>
              <Icon name="eye" size={22} /> Soy {votanteActual.nombre}, ¡a votar!
            </BotonPrincipal>
          </div>
        </section>
      )}

      {/* 5. VOTACIÓN DE CADA JUGADOR */}
      {fase === 'votando' && votanteActual && rankingData && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            categoria={categoriaObj}
            etiqueta={`Ronda ${rondaNum} de ${maxRondas} · Votando sobre ${jugadorActivo?.nombre}`}
            titulo={votanteActual.nombre}
            avatar={
              <Avatar
                nombre={votanteActual.nombre}
                color={colorJugador(indiceColor(votanteActual, votanteActualIdx))}
              />
            }
          >
            <CajaTemaRanking categoriaNombre={categoriaObj?.nombre} tema={rankingData.tema} />
            <OrdenTurnos
              jugadores={jugadores}
              activoId={votanteActual.id}
              votadosMap={votos}
              puntosMap={puntos}
            />
          </Cabecera>

          <div className="qqp-tarjeta">
            <p className="qqp-carta-cara-titulo" style={{ marginBottom: '0.65rem' }}>
              <Icon name="eye" size={16} /> Top 5 armado por {jugadorActivo?.nombre}
            </p>

            <ListaTopCinco topArmado={topArmado} />

            <p className="ciegas-voto-label">
              ¿Qué puntuación (de 0 a 5) le das a este ranking?
            </p>

            <div className="ciegas-voto-grid">
              {[0, 1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  className="ciegas-btn-voto"
                  onClick={() => registrarVoto(num)}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. RESOLUCIÓN DE LA RONDA */}
      {fase === 'resolucion' && rankingData && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            categoria={categoriaObj}
            etiqueta={`Ronda ${rondaNum} de ${maxRondas} completada`}
            titulo={`${jugadorActivo?.nombre} suma +${sumaRondaActual} pts`}
            avatar={
              jugadorActivo ? (
                <Avatar
                  nombre={jugadorActivo.nombre}
                  color={colorJugador(indiceColor(jugadorActivo, jugadorActivoIdx))}
                />
              ) : undefined
            }
          >
            <CajaTemaRanking categoriaNombre={categoriaObj?.nombre} tema={rankingData.tema} />
          </Cabecera>

          <div className="qqp-tarjeta">
            <p className="qqp-carta-cara-titulo" style={{ marginBottom: '0.65rem' }}>
              <Icon name="trophy" size={16} /> Top 5 final de {jugadorActivo?.nombre}
            </p>
            <ListaTopCinco topArmado={topArmado} />
          </div>

          <div className="qqp-tarjeta">
            <p className="qqp-carta-cara-titulo" style={{ marginBottom: '0.65rem' }}>
              <Icon name="users" size={16} /> Votos otorgados por el grupo
            </p>
            <div className="ciegas-votos-desglose">
              {jugadores.map((j) => {
                if (j.id === jugadorActivo?.id) return null;
                const suVoto = votos[j.id] ?? 0;
                return (
                  <div key={j.id} className="ciegas-resumen-voto-row">
                    <span><strong>{j.nombre}</strong> le otorgó</span>
                    <span className="ciegas-badge-pts">+{suVoto} pts</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="qqp-tarjeta">
            <p className="qqp-carta-cara-titulo" style={{ marginBottom: '0.8rem' }}>
              <Icon name="crown" size={16} /> Clasificación general
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
                    <span className="ciegas-ranking-pts">{pts} pts</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="qqp-barra">
            {rondaNum >= maxRondas ? (
              <BotonPrincipal onClick={() => setFase('final')}>
                <Icon name="trophy" size={20} /> Ver el podio final
              </BotonPrincipal>
            ) : (
              <>
                <BotonPrincipal onClick={siguienteRonda}>
                  <Icon name="play" size={20} /> Siguiente ronda ({rondaNum + 1} de {maxRondas})
                </BotonPrincipal>
                <EnlaceSecundario
                  onClick={() => {
                    const sigRonda = rondaNum + 1;
                    const sigActivo = (jugadorActivoIdx + 1) % jugadores.length;
                    setRondaNum(sigRonda);
                    setJugadorActivoIdx(sigActivo);
                    setFase('categoria');
                  }}
                >
                  Cambiar temática para la siguiente ronda
                </EnlaceSecundario>
                <EnlaceSecundario onClick={() => setFase('final')}>
                  Finalizar partida y ver podio
                </EnlaceSecundario>
              </>
            )}
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
                    <span className="ciegas-ranking-pts">{pts} pts</span>
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