// client/src/games/Conoce/ConoceLocal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import { getPreguntaAleatoria } from '../../../../server/data/seeds/conoce/conoceData.js';
import './Conoce.css';
import { centrarActivo } from '../../lib/centrarActivo.js';

const MIN_JUGADORES = 4;
const MAX_JUGADORES = 16;
const MAX_RONDAS = 15;

const COLORES = ['#3b82f6', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4', '#f97316'];
export const colorJugador = (i) => COLORES[((i % COLORES.length) + COLORES.length) % COLORES.length];
export const inicial = (nombre = '?') => nombre.trim().charAt(0).toUpperCase() || '?';
export const indiceColor = (j, i) => (typeof j?.id === 'number' ? j.id - 1 : i);

export const PALETA_RESPUESTAS = [
  { bg: '#eff6ff', border: '#60a5fa', accent: '#2563eb', text: '#1e3a8a', pill: '#dbeafe' },
  { bg: '#fdf2f8', border: '#f472b6', accent: '#db2777', text: '#831843', pill: '#fce7f3' },
  { bg: '#fefce8', border: '#facc15', accent: '#d97706', text: '#713f12', pill: '#fef3c7' },
  { bg: '#f0fdf4', border: '#4ade80', accent: '#16a34a', text: '#14532d', pill: '#dcfce7' },
  { bg: '#f5f3ff', border: '#a78bfa', accent: '#7c3aed', text: '#4c1d95', pill: '#ede9fe' },
  { bg: '#ecfeff', border: '#22d3ee', accent: '#0891b2', text: '#164e63', pill: '#cffafe' },
  { bg: '#fff7ed', border: '#fb923c', accent: '#ea580c', text: '#7c2d12', pill: '#ffedd5' },
  { bg: '#fef2f2', border: '#f87171', accent: '#dc2626', text: '#7f1d1d', pill: '#fee2e2' }
];

/* ==========================================================================
   NORMALIZACIÓN Y COMPARACIÓN TOLERANTE A FALLOS ORTOGRÁFICOS
   ========================================================================== */

export function normalizarRespuesta(str = '') {
  return String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function distanciaLevenshtein(a = '', b = '') {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const matriz = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) matriz[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const costo = a[i - 1] === b[j - 1] ? 0 : 1;
      matriz[i][j] = Math.min(
        matriz[i - 1][j] + 1,
        matriz[i][j - 1] + 1,
        matriz[i - 1][j - 1] + costo
      );
    }
  }
  return matriz[a.length][b.length];
}

export function sonRespuestasEquivalentes(r1 = '', r2 = '') {
  const n1 = normalizarRespuesta(r1);
  const n2 = normalizarRespuesta(r2);
  if (!n1 || !n2) return false;
  if (n1 === n2) return true;

  const sinEsp1 = n1.replace(/\s+/g, '');
  const sinEsp2 = n2.replace(/\s+/g, '');
  if (sinEsp1 === sinEsp2) return true;

  const maxLen = Math.max(sinEsp1.length, sinEsp2.length);
  const diffLen = Math.abs(sinEsp1.length - sinEsp2.length);
  if (diffLen > 2) return false;

  const dist = distanciaLevenshtein(sinEsp1, sinEsp2);
  if (maxLen >= 4 && maxLen <= 7 && dist <= 1) return true;
  if (maxLen >= 8 && dist <= 2) return true;

  return false;
}

export function agruparRespuestasUnicas(listaTextos = []) {
  const unicas = [];
  listaTextos.forEach((txt) => {
    const limpio = String(txt || '').trim();
    if (!limpio) return;
    const yaEsta = unicas.some((existente) => sonRespuestasEquivalentes(existente, limpio));
    if (!yaEsta) {
      unicas.push(limpio);
    }
  });
  return unicas.sort((a, b) => a.localeCompare(b));
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
            <span className="qqp-chip" title="Fase de la ronda">
              <Icon name={categoria.icono || 'users'} size={14} /> <span>{categoria.nombre}</span>
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

export function OrdenTurnos({ jugadores, activoId, completadosCount = null }) {
  const ref = useRef(null);
  useEffect(() => {
    centrarActivo(ref.current);
  }, [activoId]);

  return (
    <ol className="qqp-orden" ref={ref} aria-label="Estado de los jugadores">
      {jugadores.map((j, i) => {
        const esActivo = j.id === activoId;
        const listo = typeof completadosCount === 'number' ? i < completadosCount : Boolean(j.listo);
        return (
          <li
            key={j.id}
            className={`qqp-orden-item${esActivo ? ' activo' : ''}`}
            style={{ '--c': colorJugador(indiceColor(j, i)) }}
            aria-current={esActivo ? 'step' : undefined}
          >
            <span className="qqp-orden-avatar">{listo ? '✓' : inicial(j.nombre)}</span>
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
   TABLERO DRAG & DROP + TÁCTIL PARA EMPAREJAR JUGADORES CON RESPUESTAS
   ========================================================================== */

export function TableroEmparejarRespuestas({
  rivales = [],
  opcionesUnicas = [],
  asignaciones = {},
  onChangeAsignaciones
}) {
  const [jugadorActivoId, setJugadorActivoId] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);

  const sinAsignar = rivales.filter((r) => !asignaciones[r.id]);

  // Selecciona automáticamente el primer jugador pendiente para agilizar en móvil
  useEffect(() => {
    if (jugadorActivoId && sinAsignar.some((r) => r.id === jugadorActivoId)) return;
    setJugadorActivoId(sinAsignar[0]?.id ?? null);
  }, [asignaciones, rivales]);

  const asignarJugadorARespuesta = (jId, textoRespuesta) => {
    if (!jId) return;
    onChangeAsignaciones({
      ...asignaciones,
      [jId]: textoRespuesta
    });
    const siguienteLibre = rivales.find((r) => r.id !== jId && !asignaciones[r.id]);
    setJugadorActivoId(siguienteLibre ? siguienteLibre.id : null);
  };

  const quitarAsignacion = (jId, e) => {
    if (e) e.stopPropagation();
    const copia = { ...asignaciones };
    delete copia[jId];
    onChangeAsignaciones(copia);
    setJugadorActivoId(jId);
  };

  const handleDragStart = (e, jId) => {
    e.dataTransfer.setData('text/plain', String(jId));
    e.dataTransfer.effectAllowed = 'move';
    setJugadorActivoId(jId);
  };

  const handleDropEnRespuesta = (e, textoRespuesta) => {
    e.preventDefault();
    setDragOverIdx(null);
    const idArrastrado = Number(e.dataTransfer.getData('text/plain')) || jugadorActivoId;
    if (idArrastrado) {
      asignarJugadorARespuesta(idArrastrado, textoRespuesta);
    }
  };

  const handleDropEnBandeja = (e) => {
    e.preventDefault();
    const idArrastrado = Number(e.dataTransfer.getData('text/plain'));
    if (idArrastrado && asignaciones[idArrastrado]) {
      quitarAsignacion(idArrastrado);
    }
  };

  return (
    <div className="cnc-dnd-wrapper">
      {/* 1. BANDEJA DE COMPAÑEROS POR UBICAR */}
      <div
        className="qqp-tarjeta cnc-bandeja-card"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDropEnBandeja}
      >
        <div className="cnc-bandeja-top">
          <p className="qqp-carta-cara-titulo">
            <Icon name="users" size={16} /> Compañeros ({sinAsignar.length} por colocar)
          </p>
          <span className="cnc-bandeja-ayuda">
            Arrastra cada jugador a su respuesta o tócalo y pulsa una tarjeta
          </span>
        </div>

        {sinAsignar.length > 0 ? (
          <div className="cnc-fichas-pool">
            {sinAsignar.map((r, i) => {
              const color = colorJugador(indiceColor(r, i));
              const seleccionado = jugadorActivoId === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  draggable
                  onDragStart={(e) => handleDragStart(e, r.id)}
                  onClick={() => setJugadorActivoId(seleccionado ? null : r.id)}
                  className={`cnc-ficha-jugador ${seleccionado ? 'activa' : ''}`}
                  style={{ '--c': color }}
                >
                  <span className="cnc-ficha-avatar">{inicial(r.nombre)}</span>
                  <span className="cnc-ficha-nombre">{r.nombre}</span>
                  <span className="cnc-ficha-grip" aria-hidden="true">⋮⋮</span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="cnc-bandeja-completa">
            <span>✅ ¡Todos los compañeros están colocados en una respuesta!</span>
          </div>
        )}
      </div>

      {opcionesUnicas.length < rivales.length && (
        <div className="cnc-nota-unificadas">
          💡 Varios jugadores han coincidido en la misma respuesta: aparece una sola vez y puedes arrastrar a varios compañeros dentro de la misma tarjeta.
        </div>
      )}

      {/* 2. TARJETAS DE RESPUESTAS DIFERENCIADAS POR COLOR */}
      <div className="cnc-respuestas-grid">
        {opcionesUnicas.map((textoOpc, idx) => {
          const paleta = PALETA_RESPUESTAS[idx % PALETA_RESPUESTAS.length];
          const jugadoresAqui = rivales.filter((r) => asignaciones[r.id] === textoOpc);
          const esTarget = dragOverIdx === idx;

          return (
            <div
              key={idx}
              role="button"
              tabIndex={0}
              onDragOver={(e) => {
                e.preventDefault();
                if (dragOverIdx !== idx) setDragOverIdx(idx);
              }}
              onDragLeave={() => setDragOverIdx(null)}
              onDrop={(e) => handleDropEnRespuesta(e, textoOpc)}
              onClick={() => {
                if (jugadorActivoId) {
                  asignarJugadorARespuesta(jugadorActivoId, textoOpc);
                }
              }}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && jugadorActivoId) {
                  e.preventDefault();
                  asignarJugadorARespuesta(jugadorActivoId, textoOpc);
                }
              }}
              className={`cnc-drop-respuesta ${esTarget ? 'drag-over' : ''} ${
                jugadorActivoId ? 'esperando-click' : ''
              } ${jugadoresAqui.length > 0 ? 'con-jugadores' : ''}`}
              style={{
                '--r-bg': paleta.bg,
                '--r-border': paleta.border,
                '--r-accent': paleta.accent,
                '--r-text': paleta.text,
                '--r-pill': paleta.pill
              }}
            >
              <div className="cnc-drop-header">
                <span className="cnc-drop-num">Respuesta #{idx + 1}</span>
                {jugadorActivoId && (
                  <span className="cnc-drop-hint-accion">
                    + Colocar a {rivales.find((r) => r.id === jugadorActivoId)?.nombre}
                  </span>
                )}
              </div>

              <blockquote className="cnc-drop-texto">«{textoOpc}»</blockquote>

              <div className="cnc-drop-zona-fichas">
                {jugadoresAqui.length > 0 ? (
                  jugadoresAqui.map((r) => {
                    const col = colorJugador(indiceColor(r, 0));
                    return (
                      <div
                        key={r.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, r.id)}
                        onClick={(e) => {
                          e.stopPropagation();
                          setJugadorActivoId(r.id);
                        }}
                        className={`cnc-ficha-asignada ${jugadorActivoId === r.id ? 'activa' : ''}`}
                        style={{ '--c': col }}
                      >
                        <span className="cnc-ficha-avatar">{inicial(r.nombre)}</span>
                        <span className="cnc-ficha-nombre">{r.nombre}</span>
                        <button
                          type="button"
                          className="cnc-ficha-quitar"
                          title="Quitar de esta respuesta"
                          aria-label={`Quitar a ${r.nombre}`}
                          onClick={(e) => quitarAsignacion(r.id, e)}
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <span className="cnc-drop-vacio">
                    Arrastra o toca aquí para asignar un compañero
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ==========================================================================
   MODO LOCAL: CONOCE A TUS AMIGOS
   ========================================================================== */

export default function ConoceLocal({ onVolver, onSalir, onExit, onAbrirAyuda }) {
  const navigate = useNavigate();

  // setup | pasar_resp | respondiendo | cuenta_atras | pasar_adivinar | adivinando | resultados_1 | resultados_2 | resultados_3 | fin
  const [paso, setPaso] = useState('setup');
  const [modalSalirPortada, setModalSalirPortada] = useState(false);

  const [numJugadores, setNumJugadores] = useState(4);
  const [listaConfig, setListaConfig] = useState(
    Array.from({ length: 4 }, (_, i) => ({ id: i + 1, nombre: `Jugador ${i + 1}` }))
  );

  const [jugadores, setJugadores] = useState([]);
  const [rondaNum, setRondaNum] = useState(1);
  const [preguntaActual, setPreguntaActual] = useState('');
  const [usadas, setUsadas] = useState([]);

  const [turnoIdx, setTurnoIdx] = useState(0);
  const [respuestas, setRespuestas] = useState({});
  const [adivinanzas, setAdivinanzas] = useState({});
  const [inputRespuesta, setInputRespuesta] = useState('');
  const [asignacionesActuales, setAsignacionesActuales] = useState({});
  const [desgloseRonda, setDesgloseRonda] = useState({});

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
      nombre: listaConfig[i]?.nombre || `Jugador ${i + 1}`
    }));
    setListaConfig(nuevos);
  };

  const handleNombreChange = (idx, val) => {
    const copia = [...listaConfig];
    copia[idx] = { ...copia[idx], nombre: val };
    setListaConfig(copia);
  };

  const iniciarPartida = () => {
    const jugs = listaConfig.map((j, i) => ({
      id: i + 1,
      nombre: j.nombre.trim() || `Jugador ${i + 1}`,
      puntos: 0
    }));
    setJugadores(jugs);
    setRondaNum(1);
    setUsadas([]);
    comenzarNuevaRonda(jugs, 1, []);
  };

  const comenzarNuevaRonda = (jugs, rNum, yaUsadas) => {
    const preg = getPreguntaAleatoria(yaUsadas);
    setPreguntaActual(preg);
    setUsadas([...yaUsadas, preg]);
    setRespuestas({});
    setAdivinanzas({});
    setDesgloseRonda({});
    setTurnoIdx(0);
    setInputRespuesta('');
    setPaso('pasar_resp');
  };

  const guardarRespuesta = (e) => {
    if (e) e.preventDefault();
    if (!inputRespuesta.trim()) return;
    const jId = jugadores[turnoIdx].id;
    const nuevasResp = { ...respuestas, [jId]: inputRespuesta.trim() };
    setRespuestas(nuevasResp);
    setInputRespuesta('');

    if (turnoIdx + 1 < jugadores.length) {
      setTurnoIdx(turnoIdx + 1);
      setPaso('pasar_resp');
    } else {
      setPaso('cuenta_atras');
    }
  };

  const empezarAdivinanzasPasaMovil = () => {
    setTurnoIdx(0);
    setAsignacionesActuales({});
    setPaso('pasar_adivinar');
  };

  const guardarAdivinanzaJugador = () => {
    const jId = jugadores[turnoIdx].id;
    const nuevasAdiv = { ...adivinanzas, [jId]: asignacionesActuales };
    setAdivinanzas(nuevasAdiv);
    setAsignacionesActuales({});

    if (turnoIdx + 1 < jugadores.length) {
      setTurnoIdx(turnoIdx + 1);
      setPaso('pasar_adivinar');
    } else {
      calcularPuntosYDesglose(nuevasAdiv);
      setPaso('resultados_1');
    }
  };

  const calcularPuntosYDesglose = (todasAdivinanzas) => {
    const nuevosJugs = jugadores.map((j) => ({ ...j }));
    const mapaDesglose = {};
    nuevosJugs.forEach((j) => {
      mapaDesglose[j.id] = { totalDelta: 0, relaciones: [] };
    });

    for (let i = 0; i < nuevosJugs.length; i++) {
      for (let j = i + 1; j < nuevosJugs.length; j++) {
        const pA = nuevosJugs[i];
        const pB = nuevosJugs[j];

        const respA = respuestas[pA.id] || '';
        const respB = respuestas[pB.id] || '';

        const intentoASobreB = todasAdivinanzas[pA.id]?.[pB.id] || '';
        const intentoBSobreA = todasAdivinanzas[pB.id]?.[pA.id] || '';

        const aciertoA = sonRespuestasEquivalentes(intentoASobreB, respB);
        const aciertoB = sonRespuestasEquivalentes(intentoBSobreA, respA);

        let deltaA = 0;
        let deltaB = 0;
        let estadoA = '';
        let estadoB = '';
        let textoA = '';
        let textoB = '';

        if (aciertoA && aciertoB) {
          deltaA = 3;
          deltaB = 3;
          estadoA = 'os_conoceis';
          estadoB = 'os_conoceis';
          textoA = `¡Os conocéis! Acertaste la respuesta de ${pB.nombre} y él/ella acertó la tuya.`;
          textoB = `¡Os conocéis! Acertaste la respuesta de ${pA.nombre} y él/ella acertó la tuya.`;
        } else if (aciertoA && !aciertoB) {
          deltaA = 2;
          deltaB = -1;
          estadoA = 'le_conoces';
          estadoB = 'te_conoce';
          textoA = `Acertaste la respuesta de ${pB.nombre}, pero él/ella no acertó la tuya.`;
          textoB = `${pA.nombre} acertó tu respuesta, pero tú elegiste «${intentoBSobreA || '—'}» en lugar de «${respA}».`;
        } else if (!aciertoA && aciertoB) {
          deltaA = -1;
          deltaB = 2;
          estadoA = 'te_conoce';
          estadoB = 'le_conoces';
          textoA = `${pB.nombre} acertó tu respuesta, pero tú elegiste «${intentoASobreB || '—'}» en lugar de «${respB}».`;
          textoB = `Acertaste la respuesta de ${pA.nombre}, pero él/ella no acertó la tuya.`;
        } else {
          deltaA = -1;
          deltaB = -1;
          estadoA = 'no_os_conoceis';
          estadoB = 'no_os_conoceis';
          textoA = `Ninguno acertó al otro (elegiste «${intentoASobreB || '—'}» y su respuesta era «${respB}»).`;
          textoB = `Ninguno acertó al otro (elegiste «${intentoBSobreA || '—'}» y su respuesta era «${respA}»).`;
        }

        pA.puntos += deltaA;
        pB.puntos += deltaB;

        mapaDesglose[pA.id].totalDelta += deltaA;
        mapaDesglose[pA.id].relaciones.push({
          rivalId: pB.id,
          rivalNombre: pB.nombre,
          delta: deltaA,
          estado: estadoA,
          explicacion: textoA
        });

        mapaDesglose[pB.id].totalDelta += deltaB;
        mapaDesglose[pB.id].relaciones.push({
          rivalId: pA.id,
          rivalNombre: pA.nombre,
          delta: deltaB,
          estado: estadoB,
          explicacion: textoB
        });
      }
    }

    setDesgloseRonda(mapaDesglose);
    setJugadores(nuevosJugs);
  };

  const siguienteRonda = () => {
    if (rondaNum >= MAX_RONDAS) {
      setPaso('fin');
      return;
    }
    const sig = rondaNum + 1;
    setRondaNum(sig);
    comenzarNuevaRonda(jugadores, sig, usadas);
  };

  const ranking = [...jugadores].sort((a, b) => b.puntos - a.puntos);
  const maxPuntos = ranking.length > 0 ? ranking[0].puntos : 0;
  const ganadores = maxPuntos > 0 ? ranking.filter((j) => j.puntos === maxPuntos) : [];

  const jugadorTurno = jugadores[turnoIdx];
  const rivalesActuales = jugadores.filter((j) => j.id !== jugadorTurno?.id);
  const respuestasOpciones = agruparRespuestasUnicas(
    rivalesActuales.map((j) => respuestas[j.id])
  );

  const todasAsignadas =
    rivalesActuales.length > 0 &&
    rivalesActuales.every((r) => Boolean(asignacionesActuales[r.id]));

  const enPartidaActiva = paso !== 'setup';

  return (
    <div className={`cnc-contenedor ${enPartidaActiva ? 'qq-en-partida' : ''}`}>
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
              <label className="qq-label-destacado" htmlFor="num-jugadores-cnc">
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
                  id="num-jugadores-cnc"
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

      {/* 2. PASAR MÓVIL PARA RESPONDER */}
      {paso === 'pasar_resp' && jugadorTurno && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            categoria={{ nombre: 'Respuesta secreta', icono: 'lock' }}
            etiqueta={`Ronda ${rondaNum} de ${MAX_RONDAS} · Turno ${turnoIdx + 1} de ${jugadores.length}`}
            titulo="Pasad el móvil"
          >
            <OrdenTurnos
              jugadores={jugadores}
              activoId={jugadorTurno.id}
              completadosCount={turnoIdx}
            />
          </Cabecera>

          <div className="qqp-tarjeta qqp-pasar">
            <Avatar
              nombre={jugadorTurno.nombre}
              color={colorJugador(indiceColor(jugadorTurno, turnoIdx))}
              grande
            />
            <p className="qqp-pasar-para">Turno de</p>
            <h3 className="qqp-pasar-nombre">{jugadorTurno.nombre}</h3>
            <p className="qqp-texto">
              Vas a responder en secreto a la pregunta de esta ronda. Asegúrate de que nadie más mire la pantalla.
            </p>
          </div>

          <div className="qqp-barra">
            <BotonPrincipal onClick={() => setPaso('respondiendo')}>
              <Icon name="eye" size={22} /> Soy {jugadorTurno.nombre}, responder
            </BotonPrincipal>
          </div>
        </section>
      )}

      {/* 3. RESPONDIENDO */}
      {paso === 'respondiendo' && jugadorTurno && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            categoria={{ nombre: 'Respuesta secreta', icono: 'lock' }}
            etiqueta={`Ronda ${rondaNum} de ${MAX_RONDAS} · Respondiendo`}
            titulo={jugadorTurno.nombre}
            avatar={
              <Avatar
                nombre={jugadorTurno.nombre}
                color={colorJugador(indiceColor(jugadorTurno, turnoIdx))}
              />
            }
          >
            <div className="qqp-identidad cnc-consigna-box">
              <div className="cnc-consigna-top">
                <span className="qqp-identidad-icono">
                  <Icon name="users" size={16} strokeWidth={2.4} />
                </span>
                <span className="cnc-consigna-texto">«{preguntaActual}»</span>
              </div>
            </div>

            <OrdenTurnos
              jugadores={jugadores}
              activoId={jugadorTurno.id}
              completadosCount={turnoIdx}
            />
          </Cabecera>

          <form onSubmit={guardarRespuesta} className="qqp-tarjeta">
            <label className="qq-label-destacado" htmlFor="cnc-local-resp">
              Escribe tu respuesta sincera (nadie la verá todavía)
            </label>
            <input
              id="cnc-local-resp"
              type="text"
              className="qq-input-moderno"
              placeholder="Tu respuesta..."
              value={inputRespuesta}
              onChange={(e) => setInputRespuesta(e.target.value)}
              autoFocus
            />

            <div style={{ marginTop: '1rem' }}>
              <BotonPrincipal type="submit" disabled={!inputRespuesta.trim()}>
                <Icon name="check" size={20} strokeWidth={2.5} /> Guardar y pasar móvil
              </BotonPrincipal>
            </div>
          </form>
        </section>
      )}

      {/* 4. TRANSICIÓN ANTES DE ADIVINAR */}
      {paso === 'cuenta_atras' && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            categoria={{ nombre: 'Fase 2: Deducción', icono: 'target' }}
            etiqueta={`Ronda ${rondaNum} de ${MAX_RONDAS}`}
            titulo="¡Todos han respondido!"
          >
            <div className="qqp-identidad">
              <span className="qqp-identidad-icono"><Icon name="check" size={16} strokeWidth={2.5} /></span>
              <span>«{preguntaActual}»</span>
            </div>
          </Cabecera>

          <div className="qqp-tarjeta qqp-pasar">
            <span className="cnc-emoji-grande" aria-hidden="true">🕵️‍♂️✨</span>
            <p className="qqp-pasar-para">Hora de demostrar cuánto os conocéis</p>
            <h3 className="qqp-pasar-nombre" style={{ fontSize: '1.7rem' }}>
              Adivina quién dijo qué
            </h3>
            <p className="qqp-texto">
              A continuación os pasaréis el móvil de nuevo para arrastrar cada compañero a la respuesta que creéis que escribió.
            </p>
          </div>

          <div className="qqp-barra">
            <BotonPrincipal onClick={empezarAdivinanzasPasaMovil}>
              <Icon name="play" size={22} /> ¡Comenzar a adivinar!
            </BotonPrincipal>
          </div>
        </section>
      )}

      {/* 5. PASAR MÓVIL PARA ADIVINAR */}
      {paso === 'pasar_adivinar' && jugadorTurno && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            categoria={{ nombre: 'Fase de deducción', icono: 'target' }}
            etiqueta={`Ronda ${rondaNum} de ${MAX_RONDAS} · Turno ${turnoIdx + 1} de ${jugadores.length}`}
            titulo="Pasad el móvil"
          >
            <OrdenTurnos
              jugadores={jugadores}
              activoId={jugadorTurno.id}
              completadosCount={turnoIdx}
            />
          </Cabecera>

          <div className="qqp-tarjeta qqp-pasar">
            <Avatar
              nombre={jugadorTurno.nombre}
              color={colorJugador(indiceColor(jugadorTurno, turnoIdx))}
              grande
            />
            <p className="qqp-pasar-para">Turno de</p>
            <h3 className="qqp-pasar-nombre">{jugadorTurno.nombre}</h3>
            <p className="qqp-texto">
              Arrastra a cada uno de tus compañeros hasta la tarjeta de respuesta que crees que ha escrito.
            </p>
          </div>

          <div className="qqp-barra">
            <BotonPrincipal onClick={() => setPaso('adivinando')}>
              <Icon name="eye" size={22} /> Soy {jugadorTurno.nombre}, adivinar
            </BotonPrincipal>
          </div>
        </section>
      )}

      {/* 6. ADIVINANDO (DRAG & DROP DE JUGADORES A RESPUESTAS DE COLORES) */}
      {paso === 'adivinando' && jugadorTurno && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            categoria={{ nombre: 'Adivinando', icono: 'target' }}
            etiqueta={`Ronda ${rondaNum} de ${MAX_RONDAS} · Deducciones`}
            titulo={jugadorTurno.nombre}
            avatar={
              <Avatar
                nombre={jugadorTurno.nombre}
                color={colorJugador(indiceColor(jugadorTurno, turnoIdx))}
              />
            }
          >
            <div className="qqp-identidad cnc-consigna-box">
              <div className="cnc-consigna-top">
                <span className="qqp-identidad-icono">
                  <Icon name="users" size={16} strokeWidth={2.4} />
                </span>
                <span className="cnc-consigna-texto">«{preguntaActual}»</span>
              </div>
            </div>

            <OrdenTurnos
              jugadores={jugadores}
              activoId={jugadorTurno.id}
              completadosCount={turnoIdx}
            />
          </Cabecera>

          <TableroEmparejarRespuestas
            rivales={rivalesActuales}
            opcionesUnicas={respuestasOpciones}
            asignaciones={asignacionesActuales}
            onChangeAsignaciones={setAsignacionesActuales}
          />

          <div className="qqp-barra">
            <BotonPrincipal
              disabled={!todasAsignadas}
              onClick={guardarAdivinanzaJugador}
            >
              <Icon name="check" size={20} strokeWidth={2.5} /> Confirmar mis deducciones
            </BotonPrincipal>
          </div>
        </section>
      )}

      {/* 7A. PANTALLA 1 DE RESULTADOS: QUÉ RESPONDIÓ REALMENTE CADA JUGADOR */}
      {paso === 'resultados_1' && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            categoria={{ nombre: 'Paso 1 de 3 · Revelación', icono: 'eye' }}
            etiqueta={`Ronda ${rondaNum} de ${MAX_RONDAS} completada`}
            titulo="¿Qué escribió cada uno?"
          >
            <div className="qqp-identidad">
              <span className="qqp-identidad-icono"><Icon name="check" size={16} strokeWidth={2.5} /></span>
              <span>«{preguntaActual}»</span>
            </div>
          </Cabecera>

          <div className="cnc-revelacion-grid">
            {jugadores.map((j, i) => {
              const paleta = PALETA_RESPUESTAS[i % PALETA_RESPUESTAS.length];
              const colJug = colorJugador(indiceColor(j, i));
              return (
                <div
                  key={j.id}
                  className="cnc-revelacion-card"
                  style={{
                    '--r-bg': paleta.bg,
                    '--r-border': paleta.border,
                    '--r-accent': paleta.accent,
                    '--r-text': paleta.text,
                    '--c': colJug
                  }}
                >
                  <div className="cnc-revelacion-autor">
                    <span className="cnc-revelacion-avatar">{inicial(j.nombre)}</span>
                    <div className="cnc-revelacion-textos">
                      <span className="cnc-revelacion-label">Respuesta sincera de</span>
                      <strong className="cnc-revelacion-nombre">{j.nombre}</strong>
                    </div>
                  </div>
                  <div className="cnc-revelacion-burbuja">
                    «{respuestas[j.id]}»
                  </div>
                </div>
              );
            })}
          </div>

          <div className="qqp-barra">
            <BotonPrincipal onClick={() => setPaso('resultados_2')}>
              <Icon name="eye" size={20} /> Ver desglose de aciertos y puntos
            </BotonPrincipal>
          </div>
        </section>
      )}

      {/* 7B. PANTALLA 2 DE RESULTADOS: DESGLOSE DETALLADO POR JUGADOR Y PAREJA */}
      {paso === 'resultados_2' && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            categoria={{ nombre: 'Paso 2 de 3 · Desglose', icono: 'users' }}
            etiqueta={`Ronda ${rondaNum} de ${MAX_RONDAS} · Por qué suma o resta cada uno`}
            titulo="Desglose de elecciones"
          >
            <div className="qqp-identidad">
              <span className="qqp-identidad-icono"><Icon name="zap" size={16} /></span>
              <span>Acierto mutuo: +3 pts · Solo tú aciertas: +2 pts · Fallo: -1 pt</span>
            </div>
          </Cabecera>

          <div className="cnc-desglose-jugadores">
            {jugadores.map((j, idx) => {
              const info = desgloseRonda[j.id] || { totalDelta: 0, relaciones: [] };
              const col = colorJugador(indiceColor(j, idx));
              const signo = info.totalDelta >= 0 ? `+${info.totalDelta}` : info.totalDelta;

              return (
                <div key={j.id} className="qqp-tarjeta cnc-desglose-jugador-card">
                  <div className="cnc-desglose-jugador-header">
                    <span className="cnc-revelacion-avatar" style={{ '--c': col }}>
                      {inicial(j.nombre)}
                    </span>
                    <div className="cnc-desglose-jugador-titulos">
                      <strong>{j.nombre}</strong>
                      <span>Dijo: «{respuestas[j.id]}»</span>
                    </div>
                    <span
                      className={`cnc-delta-ronda-pill ${
                        info.totalDelta > 0 ? 'pos' : info.totalDelta < 0 ? 'neg' : ''
                      }`}
                    >
                      {signo} pts en la ronda
                    </span>
                  </div>

                  <div className="cnc-relaciones-lista">
                    {info.relaciones.map((rel) => (
                      <div key={rel.rivalId} className={`cnc-relacion-item ${rel.estado}`}>
                        <div className="cnc-relacion-texto">
                          <strong>Con {rel.rivalNombre}:</strong> {rel.explicacion}
                        </div>
                        <span
                          className={`cnc-relacion-pts ${
                            rel.delta > 0 ? 'pos' : 'neg'
                          }`}
                        >
                          {rel.delta >= 0 ? `+${rel.delta}` : rel.delta} pts
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="qqp-barra">
            <BotonPrincipal onClick={() => setPaso('resultados_3')}>
              <Icon name="trophy" size={20} /> Ver clasificación general
            </BotonPrincipal>
            <EnlaceSecundario onClick={() => setPaso('resultados_1')}>
              ← Volver a las respuestas reales
            </EnlaceSecundario>
          </div>
        </section>
      )}

      {/* 7C. PANTALLA 3 DE RESULTADOS: CLASIFICACIÓN ACTUAL */}
      {paso === 'resultados_3' && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            categoria={{ nombre: 'Paso 3 de 3 · Clasificación', icono: 'trophy' }}
            etiqueta={`Ronda ${rondaNum} de ${MAX_RONDAS} completada`}
            titulo="Puntuaciones actuales"
          />

          <div className="qqp-tarjeta">
            <p className="qqp-carta-cara-titulo" style={{ marginBottom: '0.8rem' }}>
              <Icon name="trophy" size={16} /> Clasificación general
            </p>
            <ul className="qqp-rivales">
              {ranking.map((j, i) => {
                const lider = maxPuntos > 0 && j.puntos === maxPuntos;
                const delta = desgloseRonda[j.id]?.totalDelta ?? 0;
                return (
                  <li key={j.id} className="qqp-rival" style={{ '--c': colorJugador(indiceColor(j, i)) }}>
                    <span className="qqp-rival-avatar">{lider ? '👑' : i + 1}</span>
                    <span className="qqp-rival-datos">
                      <span className="qqp-rival-nombre">
                        {lider ? 'Líder actual' : `Puesto ${i + 1}`} · Ronda:{' '}
                        {delta >= 0 ? `+${delta}` : delta} pts
                      </span>
                      <strong className="qqp-rival-tarjeta">{j.nombre}</strong>
                    </span>
                    <span className="cnc-ranking-pts">{j.puntos} pts</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="qqp-barra">
            <BotonPrincipal onClick={siguienteRonda}>
              <Icon name="play" size={20} />
              {rondaNum >= MAX_RONDAS ? 'Ver podio final' : `Siguiente ronda (${rondaNum + 1} de ${MAX_RONDAS})`}
            </BotonPrincipal>
            <EnlaceSecundario onClick={() => setPaso('resultados_2')}>
              ← Volver al desglose de puntos
            </EnlaceSecundario>
            <EnlaceSecundario onClick={() => setPaso('fin')}>
              Finalizar partida anticipadamente
            </EnlaceSecundario>
          </div>
        </section>
      )}

      {/* 8. PODIO FINAL */}
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
                  ? 'Nadie consiguió puntos positivos en esta partida.'
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
                    <span className="cnc-ranking-pts">{j.puntos} pts</span>
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