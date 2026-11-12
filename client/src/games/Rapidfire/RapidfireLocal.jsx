// client/src/games/Rapidfire/RapidfireLocal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import './Rapidfire.css';
import { centrarActivo } from '../../lib/centrarActivo.js';
import { limitesLocal } from '../limites.js';
import { SelectorRondas } from '../../components/MenuJuego.jsx';
import { rondasPorDefecto, totalRondas } from '../rondas.js';

const TIEMPO_S = 60;
const PREPARACION_S = 3;
const PUNTOS_POR_ACIERTO = 2;
const NUM_OPCIONES = 3;
const { min: MIN_JUGADORES, max: MAX_JUGADORES } = limitesLocal('rapidfire');

const COLORES = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];
export const colorJugador = (i) => COLORES[((i % COLORES.length) + COLORES.length) % COLORES.length];
export const inicial = (nombre = '?') => nombre.trim().charAt(0).toUpperCase() || '?';
export const indiceColor = (j, i) => (typeof j?.id === 'number' ? j.id - 1 : i);

const COLORES_CATEGORIA = [
  ['#f97316', '#ef4444'],
  ['#8b5cf6', '#6366f1'],
  ['#06b6d4', '#3b82f6'],
  ['#22c55e', '#16a34a']
];

const aleatorio = (n) => Math.floor(Math.random() * n);

function barajar(lista) {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = aleatorio(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ==========================================================================
   COMPONENTES DE TABLERO COMPARTIDOS (USADOS EN LOCAL Y ONLINE)
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
  const bueno = visible.tipo === 'acierto' || visible.tipo === 'rebote_ok';
  const malo = visible.tipo === 'tiempo' || visible.tipo === 'rendido';

  return (
    <div className={`cnp-aviso${bueno ? ' bueno' : ''}${malo ? ' malo' : ''}`} role="status" aria-live="polite">
      <span aria-hidden="true">
        {bueno ? '🎉' : visible.tipo === 'rebote' ? '🔄' : visible.tipo === 'tiempo' ? '⏰' : '🏳️'}
      </span>
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
    <span className={`qqp-avatar${grande ? ' grande' : ''}`} style={{ '--c': color || '#ef4444' }}>
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

export function OrdenTurnos({ jugadores, activoId, intentadosIds = [], puntosMap = null, yoId = null }) {
  const ref = useRef(null);
  useEffect(() => {
    centrarActivo(ref.current);
  }, [activoId]);

  return (
    <ol className="qqp-orden" ref={ref} aria-label="Orden de jugadores">
      {jugadores.map((j, i) => {
        const esActivo = j.id === activoId;
        const yaIntento = !esActivo && intentadosIds.includes(j.id);
        const pts = puntosMap ? (puntosMap[j.id] ?? 0) : (j.puntos ?? 0);
        return (
          <li
            key={j.id}
            className={`qqp-orden-item${esActivo ? ' activo' : ''}${yaIntento ? ' hecho' : ''}`}
            style={{ '--c': colorJugador(indiceColor(j, i)) }}
            aria-current={esActivo ? 'step' : undefined}
          >
            <span className="qqp-orden-avatar">{inicial(j.nombre)}</span>
            <span className="qqp-orden-nombre">
              {j.nombre}{yoId && j.id === yoId ? ' (tú)' : ''}
            </span>
            <span className="qqp-orden-pts">{pts}p</span>
          </li>
        );
      })}
    </ol>
  );
}

export function OpcionesCategoria({ opciones = [], onElegir, deshabilitado = false }) {
  return (
    <ul className={`rf-categorias-grid${deshabilitado ? ' bloqueado' : ''}`}>
      {opciones.map((cat, i) => {
        const [c1, c2] = COLORES_CATEGORIA[i % COLORES_CATEGORIA.length];
        return (
          <li key={cat.id}>
            <button
              type="button"
              className="qqp-categoria rf-categoria-card"
              style={{ '--c1': c1, '--c2': c2 }}
              disabled={deshabilitado}
              onClick={() => !deshabilitado && onElegir && onElegir(cat)}
            >
              <span className="qqp-categoria-icono">
                <Icon name={cat.icono || 'star'} size={26} />
              </span>
              <span className="qqp-categoria-textos">
                <span className="qqp-categoria-nombre">{cat.nombre}</span>
                <span className="qqp-categoria-info">
                  {deshabilitado ? 'Opción sorteada' : 'Toca para jugar este reto'}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function BotonPrincipal({ children, onClick, disabled, type = 'button' }) {
  return (
    <button type={type} className="qqp-boton" onClick={onClick} disabled={disabled}>
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

/* ==========================================================================
   PANTALLA DE TURNO ACTIVO (LOCAL)
   ========================================================================== */

function Turno({
  maxRondas,
  jugador,
  jugadores,
  puntos,
  intentadosIds,
  ronda,
  esRebote,
  motivo,
  categoria,
  reto,
  onAcierto,
  onRebote,
  onTiempo,
  onRendirse,
  onSalirPortada
}) {
  const [prep, setPrep] = useState(PREPARACION_S);
  const [restante, setRestante] = useState(TIEMPO_S);
  const alAcabarse = useRef(onTiempo);
  alAcabarse.current = onTiempo;

  useEffect(() => {
    const finPrep = Date.now() + PREPARACION_S * 1000;
    const finTurno = finPrep + TIEMPO_S * 1000;
    let avisado = false;
    const id = setInterval(() => {
      const ahora = Date.now();
      if (ahora < finPrep) {
        setPrep(Math.ceil((finPrep - ahora) / 1000));
        return;
      }
      setPrep(0);
      const r = (finTurno - ahora) / 1000;
      if (r <= 0) {
        setRestante(0);
        if (!avisado) {
          avisado = true;
          clearInterval(id);
          alAcabarse.current();
        }
        return;
      }
      setRestante(r);
    }, 100);
    return () => clearInterval(id);
  }, []);

  const preparando = prep > 0;
  const segundosMostrar = preparando ? prep : Math.ceil(restante);
  const porcentajeBarra = preparando
    ? (prep / PREPARACION_S) * 100
    : (restante / TIEMPO_S) * 100;
  const puntosEnJuego = reto.n * PUNTOS_POR_ACIERTO;

  return (
    <section className="game qqp-escena">
      <Cabecera
        onSalir={onSalirPortada}
        categoria={categoria}
        etiqueta={esRebote ? `Ronda ${ronda} de ${maxRondas} · Turno de rebote` : `Ronda ${ronda} de ${maxRondas} · Turno en juego`}
        titulo={jugador.nombre}
        avatar={<Avatar nombre={jugador.nombre} color={colorJugador(indiceColor(jugador, 0))} />}
        chips={
          <span className="qqp-chip">
            <Icon name="trophy" size={14} /> <span>+{puntosEnJuego} pts</span>
          </span>
        }
      >
        {/* Temporizador en la cabecera: solo se muestra cuando termina la cuenta atrás de preparación */}
        {!preparando && (
          <div className="qqp-identidad bm-consigna-box">
            <div className="bm-hero-stats">
              <span className="bm-hero-stat">
                {esRebote
                  ? '🔄 Rebote: di las respuestas que faltan'
                  : '🎙️ Di las respuestas en voz alta'}
              </span>
              <span className={`bm-hero-stat timer${restante <= 10 ? ' low' : ''}`}>
                <Icon name="clock" size={14} /> {`${segundosMostrar}s`}
              </span>
            </div>
            <div className="bm-timer-track" role="timer" aria-label="Tiempo restante">
              <div
                className={`bm-timer-fill${restante <= 10 ? ' low' : ''}`}
                style={{ width: `${porcentajeBarra}%` }}
              />
            </div>
          </div>
        )}

        <OrdenTurnos
          jugadores={jugadores}
          activoId={jugador.id}
          intentadosIds={intentadosIds}
          puntosMap={puntos}
        />
      </Cabecera>

      {motivo && (
        <div className="rf-aviso-banner" role="status">
          <Icon name={motivo === 'tiempo' ? 'hourglass' : 'refresh'} size={20} />
          <span>
            {motivo === 'tiempo' ? '¡Se acabó el tiempo anterior!' : '¡Rebote!'} Turno para <strong>{jugador.nombre}</strong>
          </span>
        </div>
      )}

      {/* Tarjeta blanca limpia (con la única cuenta atrás inicial abajo) */}
      <div className="qqp-tarjeta rf-tarjeta-reto">
        <div className="rf-reto-numero">{reto.n}</div>
        <p className="rf-reto-texto">{reto.texto}</p>

        {preparando && (
          <div className="rf-prep-box" role="status" aria-live="polite">
            <span className="rf-prep-circulo">{prep}</span>
            <span className="rf-prep-label">Comenzando cuenta atrás…</span>
          </div>
        )}
      </div>

      <div className="qqp-barra">
        <div className="rf-botones">
          <button type="button" className="ok" disabled={preparando} onClick={onAcierto}>
            <Icon name="check" size={22} strokeWidth={2.5} /> ¡Correcto!
          </button>
          <button type="button" className="rebote" disabled={preparando} onClick={onRebote}>
            <Icon name="refresh" size={22} strokeWidth={2.5} /> Rebote
          </button>
        </div>
        <EnlaceSecundario onClick={onRendirse}>
          <Icon name="flag" size={15} /> Rendirse (nadie puntúa)
        </EnlaceSecundario>
      </div>
    </section>
  );
}

/* ==========================================================================
   MODO LOCAL PRINCIPAL
   ========================================================================== */

export default function RapidfireLocal({ onVolver, onExit, onAbrirAyuda }) {
  const navigate = useNavigate();

  const [paso, setPaso] = useState('config');
  const [modalSalirPortada, setModalSalirPortada] = useState(false);
  const [categoriasTodas, setCategoriasTodas] = useState([]);

  const [numJugadores, setNumJugadores] = useState(MIN_JUGADORES);
  const [jugadores, setJugadores] = useState(() => Array.from({ length: MIN_JUGADORES }, (_, i) => ({ id: i + 1, nombre: `Jugador ${i + 1}` })));
  const [puntos, setPuntos] = useState({});
  const [ronda, setRonda] = useState(1);
  const [rondasSel, setRondasSel] = useState(rondasPorDefecto('rapidfire'));
  const maxRondas = totalRondas('rapidfire', rondasSel, jugadores.length);
  const [jugadorInicialRonda, setJugadorInicialRonda] = useState(0);
  const [proximoInicialRonda, setProximoInicialRonda] = useState(0);
  const [turno, setTurno] = useState(0);
  const [intento, setIntento] = useState(0);
  const [motivo, setMotivo] = useState(null);
  const [opciones, setOpciones] = useState([]);
  const [categoria, setCategoria] = useState(null);
  const [reto, setReto] = useState(null);
  const [ultimo, setUltimo] = useState(null);

  const [eventoAviso, setEventoAviso] = useState(null);
  const avisoSeqRef = useRef(0);

  const usados = useRef([]);
  const intentados = useRef(new Set());

  useEffect(() => {
    fetch('/api/rapidfire/categorias')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setCategoriasTodas(d.categorias);
      })
      .catch((err) => console.error('Error al cargar categorías de rapidfire:', err));
  }, []);

  const lanzarAviso = (tipo, texto) => {
    avisoSeqRef.current += 1;
    setEventoAviso({ n: avisoSeqRef.current, tipo, texto });
  };

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
    setJugadores(
      Array.from({ length: num }, (_, i) => ({
        id: i + 1,
        nombre: jugadores[i]?.nombre ?? `Jugador ${i + 1}`
      }))
    );
  };

  const handleNombre = (index, valor) => {
    setJugadores(jugadores.map((j, i) => (i === index ? { ...j, nombre: valor } : j)));
  };

  const sortearOpciones = (cats = categoriasTodas) => {
    if (!cats.length) return;
    setOpciones(barajar(cats).slice(0, NUM_OPCIONES));
  };

  const empezar = () => {
    const lista = jugadores.map((j) => ({ ...j, nombre: j.nombre.trim() || `Jugador ${j.id}` }));
    setJugadores(lista);
    setPuntos(Object.fromEntries(lista.map((j) => [j.id, 0])));
    usados.current = [];
    setRonda(1);

    const primer = aleatorio(lista.length);
    setJugadorInicialRonda(primer);
    setProximoInicialRonda((primer + 1) % lista.length);
    setTurno(primer);

    setUltimo(null);
    sortearOpciones(categoriasTodas);
    setPaso('categorias');
  };

  const nuevaPartida = () => {
    setUltimo(null);
    setCategoria(null);
    setReto(null);
    setPaso('config');
  };

  const elegirCategoria = async (cat) => {
    try {
      const res = await fetch('/api/rapidfire/reto-local', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoriaId: cat.id, usados: usados.current })
      });
      const data = await res.json();

      if (data.success) {
        usados.current.push(data.retoClave);
        intentados.current = new Set([turno]);
        setCategoria(cat);
        setReto(data.reto);
        setIntento(0);
        setMotivo(null);
        setPaso('turno');
      }
    } catch (e) {
      console.error('Error al pedir reto:', e);
    }
  };

  const cerrarRonda = (resultado) => {
    setUltimo(resultado);
    setPaso('puntuaciones');
  };

  const pasarTurno = (porque) => {
    let sig = (turno + 1) % jugadores.length;
    let intentosLoop = 0;
    while (intentados.current.has(sig) && intentosLoop < jugadores.length) {
      sig = (sig + 1) % jugadores.length;
      intentosLoop++;
    }

    if (!intentados.current.has(sig)) {
      intentados.current.add(sig);
      const sigJugador = jugadores[sig];
      setTurno(sig);
      setIntento((k) => k + 1);
      setMotivo(porque);
      lanzarAviso(
        porque === 'tiempo' ? 'tiempo' : 'rebote',
        porque === 'tiempo'
          ? `¡Tiempo agotado! Rebote para ${sigJugador.nombre}`
          : `¡Rebote para ${sigJugador.nombre}!`
      );
    } else {
      setProximoInicialRonda((jugadorInicialRonda + 1) % jugadores.length);
      lanzarAviso('rendido', 'Nadie ha completado el reto en esta ronda.');
      cerrarRonda({ tipo: 'rendido' });
    }
  };

  const acierto = () => {
    const jugador = jugadores[turno];
    const ganados = reto.n * PUNTOS_POR_ACIERTO;
    setPuntos((p) => ({ ...p, [jugador.id]: (p[jugador.id] ?? 0) + ganados }));

    setProximoInicialRonda((jugadorInicialRonda + 1) % jugadores.length);
    const tipo = intento > 0 ? 'rebote' : 'acierto';
    lanzarAviso('acierto', `¡${jugador.nombre} completa el reto y suma +${ganados} puntos!`);
    cerrarRonda({ tipo, jugador: jugador.nombre, puntos: ganados });
  };

  const rendirse = () => {
    setProximoInicialRonda((jugadorInicialRonda + 1) % jugadores.length);
    lanzarAviso('rendido', 'Ronda finalizada sin puntos.');
    cerrarRonda({ tipo: 'rendido' });
  };

  const continuar = () => {
    setRonda((r) => r + 1);
    setJugadorInicialRonda(proximoInicialRonda);
    setTurno(proximoInicialRonda);
    intentados.current = new Set();
    setMotivo(null);
    setIntento(0);
    sortearOpciones(categoriasTodas);
    setPaso('categorias');
  };

  const ranking = [...jugadores].sort((a, b) => (puntos[b.id] ?? 0) - (puntos[a.id] ?? 0));
  const maximo = ranking.length ? (puntos[ranking[0].id] ?? 0) : 0;
  const ganadores = maximo > 0 ? ranking.filter((j) => (puntos[j.id] ?? 0) === maximo) : [];

  const jugadorActual = jugadores[turno] || jugadores[0];
  const intentadosIds = Array.from(intentados.current).map((idx) => jugadores[idx]?.id).filter(Boolean);
  const enPartidaActiva = paso !== 'config';

  return (
    <div className={`rf-contenedor ${enPartidaActiva ? 'qq-en-partida' : ''}`}>
      <Aviso evento={eventoAviso} />

      {/* 1. CONFIGURACIÓN DE JUGADORES */}
      {paso === 'config' && (
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
              <label className="qq-label-destacado" htmlFor="rf-num-jugadores">
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
                  id="rf-num-jugadores"
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
                    onChange={(e) => handleNombre(idx, e.target.value)}
                    placeholder={`Jugador ${j.id}`}
                    maxLength={20}
                  />
                </div>
              ))}
            </div>

            <SelectorRondas juegoId="rapidfire" valor={rondasSel} onCambiar={setRondasSel} numJugadores={jugadores.length} />
            <button
              type="button"
              className="big full qq-btn-principal"
              style={{ marginTop: '1.5rem' }}
              onClick={empezar}
            >
              <Icon name="play" size={22} /> Iniciar juego
            </button>
          </div>
        </section>
      )}

      {/* 2. SELECCIÓN ENTRE LAS 3 CATEGORÍAS SORTEADAS (Con botón de ayuda) */}
      {paso === 'categorias' && jugadorActual && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => (ronda === 1 ? setPaso('config') : setModalSalirPortada(true))}
            textoSalir={ronda === 1 ? 'Volver' : 'Portada'}
            onAyuda={onAbrirAyuda}
            etiqueta={`Ronda ${ronda} de ${maxRondas} · ${ronda === 1 ? 'Empieza al azar' : 'Abre la ronda'}`}
            titulo={`${jugadorActual.nombre}, elige temática`}
            avatar={<Avatar nombre={jugadorActual.nombre} color={colorJugador(indiceColor(jugadorActual, turno))} />}
          >
            <OrdenTurnos
              jugadores={jugadores}
              activoId={jugadorActual.id}
              puntosMap={puntos}
            />
          </Cabecera>

          <OpcionesCategoria
            opciones={opciones}
            onElegir={elegirCategoria}
          />
        </section>
      )}

      {/* 3. TURNO ACTIVO (Sin botón de ayuda) */}
      {paso === 'turno' && categoria && reto && jugadorActual && (
        <Turno
          key={intento}
          jugador={jugadorActual}
          jugadores={jugadores}
          puntos={puntos}
          intentadosIds={intentadosIds}
          ronda={ronda}
          maxRondas={maxRondas}
          esRebote={intento > 0}
          motivo={motivo}
          categoria={categoria}
          reto={reto}
          onAcierto={acierto}
          onRebote={() => pasarTurno('rebote')}
          onTiempo={() => pasarTurno('tiempo')}
          onRendirse={rendirse}
          onSalirPortada={() => setModalSalirPortada(true)}
        />
      )}

      {/* 4. PUNTUACIONES DE LA RONDA */}
      {paso === 'puntuaciones' && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            categoria={categoria}
            etiqueta={`Ronda ${ronda} de ${maxRondas} completada`}
            titulo="Puntuaciones"
          >
            {ultimo && (
              <div className="qqp-identidad">
                <span className="qqp-identidad-icono">
                  <Icon name={ultimo.tipo === 'rendido' ? 'flag' : 'trophy'} size={16} />
                </span>
                <span>
                  {ultimo.tipo === 'rendido'
                    ? 'Nadie ha sumado puntos en esta ronda.'
                    : ultimo.tipo === 'rebote'
                      ? <><strong>{ultimo.jugador}</strong> completó el rebote (<strong>+{ultimo.puntos} pts</strong>).</>
                      : <><strong>{ultimo.jugador}</strong> completó el reto (<strong>+{ultimo.puntos} pts</strong>).</>}
                </span>
              </div>
            )}
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
                    <span className="rf-ranking-pts">{pts} pts</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="qqp-barra">
            {ronda >= maxRondas ? (
              <BotonPrincipal onClick={() => setPaso('final')}>
                <Icon name="trophy" size={20} /> Ver el podio final
              </BotonPrincipal>
            ) : (
              <>
                <BotonPrincipal onClick={continuar}>
                  <Icon name="play" size={20} /> Continuar: Ronda {ronda + 1} de {maxRondas}
                </BotonPrincipal>
                <EnlaceSecundario onClick={() => setPaso('final')}>
                  Finalizar partida y ver podio
                </EnlaceSecundario>
              </>
            )}
          </div>
        </section>
      )}

      {/* 5. PODIO FINAL */}
      {paso === 'final' && (
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
                    <span className="rf-ranking-pts">{pts} pts</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="qqp-barra">
            <BotonPrincipal onClick={nuevaPartida}>
              <Icon name="refresh" size={20} /> Nueva partida
            </BotonPrincipal>
            <EnlaceSecundario onClick={handleSalirAPortada}>
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
              Se cancelará la partida actual y volverás a la portada principal. ¿Estás seguro?
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