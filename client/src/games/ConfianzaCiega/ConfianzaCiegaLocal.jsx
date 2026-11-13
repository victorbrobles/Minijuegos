// client/src/games/ConfianzaCiega/ConfianzaCiegaLocal.jsx
import { useRegistrarPartida, ganadoresPorPuntos } from '../../lib/registros.js';
import { RecientesJugadores, ponerReciente } from '../../components/Recientes.jsx';
import { nombreIdentidad } from '../../lib/identidad.js';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import './ConfianzaCiega.css';
import { centrarActivo } from '../../lib/centrarActivo.js';
import { limitesLocal } from '../limites.js';
import { SelectorRondas } from '../../components/MenuJuego.jsx';
import { rondasPorDefecto, totalRondas } from '../rondas.js';
import { avisarNombres } from '../../lib/nombres.js';

const { min: MIN_JUGADORES, max: MAX_JUGADORES } = limitesLocal('confianzaciega');
const TIEMPO_MAXIMO_S = 60;

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
        <Icon name="target" size={150} strokeWidth={1.4} />
      </span>
      <div className="qqp-hero-top">
        {onSalir ? <BotonPortada onClick={onSalir} texto={textoSalir} /> : <span />}
        <div className="qqp-hero-chips">
          {chips}
          {categoria && (
            <span className="qqp-chip" title="Fase de la ronda">
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

export function OrdenTurnos({ jugadores, activoId, apostaronMap = {}, puntosMap = null }) {
  const ref = useRef(null);
  useEffect(() => {
    centrarActivo(ref.current);
  }, [activoId]);

  return (
    <ol className="qqp-orden" ref={ref} aria-label="Estado de los jugadores">
      {jugadores.map((j, i) => {
        const esActivo = j.id === activoId;
        const yaAposto = Boolean(apostaronMap[j.id] ?? j.haApostado);
        const pts = puntosMap ? (puntosMap[j.id] ?? 0) : (j.puntos ?? 0);
        return (
          <li
            key={j.id}
            className={`qqp-orden-item${esActivo ? ' activo' : ''}`}
            style={{ '--c': colorJugador(indiceColor(j, i)) }}
            aria-current={esActivo ? 'step' : undefined}
          >
            <span className="qqp-orden-avatar">{yaAposto ? '✓' : inicial(j.nombre)}</span>
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
   MODO LOCAL: CONFIANZA CIEGA
   ========================================================================== */

export default function ConfianzaCiegaLocal({ onVolver, onExit, onAbrirAyuda }) {
  const navigate = useNavigate();

  const [fase, setFase] = useState('setup');
  const [modalSalirPortada, setModalSalirPortada] = useState(false);

  const [esAdmin, setEsAdmin] = useState(false);
  const [usarPicantes, setUsarPicantes] = useState(false);

  useEffect(() => {
    try {
      const adminToken =
        localStorage.getItem('admin_token') ||
        localStorage.getItem('is_admin') ||
        localStorage.getItem('admin_secret');
      setEsAdmin(Boolean(adminToken));
    } catch {
      setEsAdmin(false);
    }
  }, []);

  const [numJugadores, setNumJugadores] = useState(MIN_JUGADORES);
  const [jugadores, setJugadores] = useState(() => Array.from({ length: MIN_JUGADORES }, (_, i) => ({ id: i + 1, nombre: i === 0 ? nombreIdentidad() : '' })));
  const [puntos, setPuntos] = useState({});

  const [rondaActual, setRondaActual] = useState(1);
  const [rondasSel, setRondasSel] = useState(rondasPorDefecto('confianzaciega'));
  const maxRondas = totalRondas('confianzaciega', rondasSel, jugadores.length);
  const [ordenTurnos, setOrdenTurnos] = useState([]);
  const [indiceTurno, setIndiceTurno] = useState(0);

  const [opcionesConsignas, setOpcionesConsignas] = useState([]);
  const [consignaElegida, setConsignaElegida] = useState('');
  const [errorCarga, setErrorCarga] = useState(null);

  const [apuestas, setApuestas] = useState({});
  const [indiceApostador, setIndiceApostador] = useState(0);
  const [apuestaNumero, setApuestaNumero] = useState(5);
  const [apuestaCondicion, setApuestaCondicion] = useState('mas');

  const [restante, setRestante] = useState(TIEMPO_MAXIMO_S);
  const [contadorAciertos, setContadorAciertos] = useState(0);

  const [resultadoRonda, setResultadoRonda] = useState(null);

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

  const iniciarPartida = () => {
    if (avisarNombres(jugadores)) return;
    const listaActualizada = jugadores.map((j) => ({
      ...j,
      nombre: j.nombre.trim() || `Jugador ${j.id}`
    }));
    setJugadores(listaActualizada);

    const scores = {};
    listaActualizada.forEach((j) => { scores[j.id] = 0; });
    setPuntos(scores);

    const primerIndex = Math.floor(Math.random() * listaActualizada.length);
    const orden = [];
    for (let i = 0; i < listaActualizada.length; i++) {
      orden.push((primerIndex + i) % listaActualizada.length);
    }
    setOrdenTurnos(orden);
    setIndiceTurno(0);
    setRondaActual(1);

    pedirConsignas();
  };

  const pedirConsignas = async () => {
    setErrorCarga(null);
    try {
      const res = await fetch(`/api/confianzaciega/consignas?includePicantes=${esAdmin && usarPicantes}`);
      const data = await res.json();

      if (data.success && data.consignas && data.consignas.length >= 2) {
        setOpcionesConsignas(data.consignas);
        setConsignaElegida('');
        setApuestas({});
        setContadorAciertos(0);
        // Primero sale la pantalla de "Turno de..." para el protagonista
        setFase('confirmacion_eleccion');
      } else {
        throw new Error('Error al cargar consignas');
      }
    } catch (err) {
      console.error(err);
      setErrorCarga('No se pudieron obtener las consignas del servidor.');
    }
  };

  const jugadorActivo = jugadores[ordenTurnos[indiceTurno]];
  const jugadoresEnOrden = ordenTurnos.map((idx) => jugadores[idx]).filter(Boolean);
  const apostadoresRestantes = jugadoresEnOrden.filter((j) => j.id !== jugadorActivo?.id);
  const apostadorActual = apostadoresRestantes[indiceApostador];

  const seleccionarConsigna = (consigna) => {
    setConsignaElegida(consigna);
    setIndiceApostador(0);
    setApuestaNumero(5);
    setApuestaCondicion('mas');
    setFase('confirmacion_apuesta');
  };

  const confirmarApuestaIndividual = () => {
    const nuevasApuestas = {
      ...apuestas,
      [apostadorActual.id]: {
        numero: parseInt(apuestaNumero, 10),
        condicion: apuestaCondicion
      }
    };
    setApuestas(nuevasApuestas);

    if (indiceApostador + 1 < apostadoresRestantes.length) {
      setIndiceApostador(indiceApostador + 1);
      setApuestaNumero(5);
      setApuestaCondicion('mas');
      setFase('confirmacion_apuesta');
    } else {
      setContadorAciertos(0);
      // Cuando todos han apostado, sale la pantalla de turno del protagonista antes de arrancar los 60s
      setFase('confirmacion_accion');
    }
  };

  // Cronómetro directo de 60 segundos sin cuenta atrás de preparación
  useEffect(() => {
    if (fase !== 'turno_accion') return undefined;

    const finTurno = Date.now() + TIEMPO_MAXIMO_S * 1000;
    setRestante(TIEMPO_MAXIMO_S);

    let avisado = false;
    const id = setInterval(() => {
      const ahora = Date.now();
      const r = (finTurno - ahora) / 1000;
      if (r <= 0) {
        setRestante(0);
        if (!avisado) {
          avisado = true;
          clearInterval(id);
          setFase('validacion_final');
        }
        return;
      }
      setRestante(r);
    }, 100);

    return () => clearInterval(id);
  }, [fase]);

  const pararManualmente = () => {
    setFase('validacion_final');
  };

  const calcularResultados = (aciertosFinales) => {
    const N = jugadores.length;
    const scoresRonda = {};
    jugadores.forEach((j) => { scoresRonda[j.id] = 0; });
    const detalles = [];

    apostadoresRestantes.forEach((j) => {
      const ap = apuestas[j.id];
      const esExacto = ap.numero === aciertosFinales;
      let acerto = false;

      if (ap.condicion === 'mas' && aciertosFinales > ap.numero) acerto = true;
      if (ap.condicion === 'menos' && aciertosFinales < ap.numero) acerto = true;

      const diff = Math.abs(ap.numero - aciertosFinales);

      detalles.push({
        jugadorId: j.id,
        nombre: j.nombre,
        numero: ap.numero,
        condicion: ap.condicion,
        esExacto,
        acerto,
        diff,
        puntosGanados: 0,
        estadoColor: esExacto ? 'azul' : (acerto ? 'verde' : 'rojo')
      });
    });

    detalles.forEach((d) => {
      if (d.esExacto) {
        d.puntosGanados = N + 5;
        scoresRonda[d.jugadorId] = d.puntosGanados;
      }
    });

    const acertantes = detalles
      .filter((d) => !d.esExacto && d.acerto)
      .sort((a, b) => a.diff - b.diff);

    acertantes.forEach((d, idx) => {
      const pts = Math.max(1, (N - 1) - idx);
      d.puntosGanados = pts;
      scoresRonda[d.jugadorId] = pts;
    });

    const fallados = detalles
      .filter((d) => !d.esExacto && !d.acerto)
      .sort((a, b) => b.diff - a.diff);

    fallados.forEach((d, idx) => {
      const pen = -Math.max(1, (N - 1) - idx);
      d.puntosGanados = pen;
      scoresRonda[d.jugadorId] = pen;
    });

    scoresRonda[jugadorActivo.id] = 0;

    setPuntos((prev) => {
      const act = { ...prev };
      Object.entries(scoresRonda).forEach(([id, delta]) => {
        act[id] = (act[id] || 0) + delta;
      });
      return act;
    });

    setResultadoRonda({
      detalles,
      scoresRonda,
      aciertosFinales
    });

    setFase('resultados');
  };

  const avanzarSiguienteRonda = () => {
    const proxIndice = (indiceTurno + 1) % ordenTurnos.length;
    setIndiceTurno(proxIndice);
    setRondaActual(rondaActual + 1);
    pedirConsignas();
  };

  const ranking = [...jugadores].sort((a, b) => (puntos[b.id] ?? 0) - (puntos[a.id] ?? 0));
  const maximo = ranking.length ? (puntos[ranking[0].id] ?? 0) : 0;
  const ganadores = maximo > 0 ? ranking.filter((j) => (puntos[j.id] ?? 0) === maximo) : [];

  const enPartidaActiva = fase !== 'setup';

  // Salón de la fama: se guarda la partida al llegar a la pantalla final
  useRegistrarPartida('confianzaciega', fase === 'final' ? ganadoresPorPuntos((jugadores || []).filter((j) => !j.fuera && !j.abandonado).map((j) => ({ nombre: j.nombre, puntos: j.puntos ?? null }))) : null);
  return (
    <div className={`cc-contenedor ${enPartidaActiva ? 'qq-en-partida' : ''}`}>
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
            <RecientesJugadores usados={jugadores.map((j) => j.nombre)} onPoner={(n) => setJugadores((l) => ponerReciente(l, n))} />

            {esAdmin && (
              <div className="qq-selector-cantidad-box" style={{ marginTop: '1.2rem' }}>
                <span className="qq-label-destacado">
                  <Icon name="lock" size={14} /> Categoría de consignas (Admin)
                </span>
                <div className="cc-admin-cats">
                  <button
                    type="button"
                    className={`cc-admin-cat-btn ${!usarPicantes ? 'activo' : ''}`}
                    onClick={() => setUsarPicantes(false)}
                  >
                    😊 Normal (Todos los públicos)
                  </button>
                  <button
                    type="button"
                    className={`cc-admin-cat-btn ${usarPicantes ? 'activo' : ''}`}
                    onClick={() => setUsarPicantes(true)}
                  >
                    🌶️ Picante (Comprometidas)
                  </button>
                </div>
              </div>
            )}

            {errorCarga && <p className="error" style={{ marginTop: '0.8rem' }}>{errorCarga}</p>}

            <SelectorRondas juegoId="confianzaciega" valor={rondasSel} onCambiar={setRondasSel} numJugadores={jugadores.length} />
            <button
              type="button"
              className="big full qq-btn-principal"
              style={{ marginTop: '1.5rem' }}
              onClick={iniciarPartida}
            >
              <Icon name="play" size={22} /> Iniciar juego
            </button>
          </div>
        </section>
      )}

      {/* 2A. PANTALLA DE TURNO ANTES DE ELEGIR CONSIGNA */}
      {fase === 'confirmacion_eleccion' && jugadorActivo && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            categoria={{ nombre: 'Protagonista', icono: 'eye' }}
            etiqueta={`Ronda ${rondaActual} de ${maxRondas} · Paso de turno`}
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
            <p className="qqp-pasar-para">Turno de</p>
            <h3 className="qqp-pasar-nombre">{jugadorActivo.nombre}</h3>
            <p className="qqp-texto">
              Vas a ver dos consignas y elegirás una en secreto. Los demás verán ambas opciones, pero no sabrán cuál has escogido.
            </p>
          </div>

          <div className="qqp-barra">
            <BotonPrincipal onClick={() => setFase('eleccion_consigna')}>
              <Icon name="eye" size={22} /> Soy {jugadorActivo.nombre}, ver consignas
            </BotonPrincipal>
          </div>
        </section>
      )}

      {/* 2B. ELECCIÓN SECRETA DE CONSIGNA */}
      {fase === 'eleccion_consigna' && jugadorActivo && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            categoria={{ nombre: 'Elección secreta', icono: 'eye' }}
            etiqueta={`Ronda ${rondaActual} de ${maxRondas} · Protagonista`}
            titulo={jugadorActivo.nombre}
            avatar={<Avatar nombre={jugadorActivo.nombre} color={colorJugador(indiceColor(jugadorActivo, 0))} />}
          >
            <div className="qqp-identidad">
              <span className="qqp-identidad-icono"><Icon name="lock" size={16} /></span>
              <span>Elige una consigna en secreto. Los demás verán ambas opciones, pero no cuál has escogido.</span>
            </div>

            <OrdenTurnos
              jugadores={jugadoresEnOrden}
              activoId={jugadorActivo.id}
              puntosMap={puntos}
            />
          </Cabecera>

          <div className="cc-consignas-grid">
            {opcionesConsignas.map((consigna, idx) => (
              <button
                key={idx}
                type="button"
                className="cc-consigna-card"
                onClick={() => seleccionarConsigna(consigna)}
              >
                <span className="cc-consigna-pill">Opción {idx + 1}</span>
                <strong className="cc-consigna-titulo">«{consigna}»</strong>
                <span className="cc-consigna-cta">
                  Elegir esta consigna <Icon name="check" size={15} />
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 3. PASAR DISPOSITIVO PARA APUESTA PRIVADA */}
      {fase === 'confirmacion_apuesta' && apostadorActual && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            categoria={{ nombre: 'Apuesta secreta', icono: 'lock' }}
            etiqueta={`Ronda ${rondaActual} de ${maxRondas} · Apostador ${indiceApostador + 1} de ${apostadoresRestantes.length}`}
            titulo="Pasad el móvil"
          >
            <OrdenTurnos
              jugadores={jugadoresEnOrden}
              activoId={apostadorActual.id}
              apostaronMap={apuestas}
              puntosMap={puntos}
            />
          </Cabecera>

          <div className="qqp-tarjeta qqp-pasar">
            <Avatar nombre={apostadorActual.nombre} color={colorJugador(indiceColor(apostadorActual, 0))} grande />
            <p className="qqp-pasar-para">Turno de</p>
            <h3 className="qqp-pasar-nombre">{apostadorActual.nombre}</h3>
            <p className="qqp-texto">
              Nadie más debe mirar la pantalla para mantener tu apuesta en secreto sobre cuántas respuestas dará <strong>{jugadorActivo.nombre}</strong>.
            </p>
          </div>

          <div className="qqp-barra">
            <BotonPrincipal onClick={() => setFase('apuestas')}>
              <Icon name="eye" size={22} /> Soy {apostadorActual.nombre}, hacer mi apuesta
            </BotonPrincipal>
          </div>
        </section>
      )}

      {/* 4. FORMULARIO DE APUESTA */}
      {fase === 'apuestas' && apostadorActual && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            categoria={{ nombre: `Apuesta ${indiceApostador + 1}/${apostadoresRestantes.length}`, icono: 'target' }}
            etiqueta={`Ronda ${rondaActual} de ${maxRondas} · Apostando sobre ${jugadorActivo.nombre}`}
            titulo={apostadorActual.nombre}
            avatar={<Avatar nombre={apostadorActual.nombre} color={colorJugador(indiceColor(apostadorActual, 0))} />}
          >
            <div className="qqp-identidad cc-consigna-box">
              <span className="cc-hero-sub">
                <strong>{jugadorActivo.nombre}</strong> ha elegido en secreto una de estas dos:
              </span>
              <div className="cc-dual-pills">
                <span className="cc-dual-pill">1. «{opcionesConsignas[0]}»</span>
                <span className="cc-dual-pill">2. «{opcionesConsignas[1]}»</span>
              </div>
            </div>

            <OrdenTurnos
              jugadores={jugadoresEnOrden}
              activoId={apostadorActual.id}
              apostaronMap={apuestas}
              puntosMap={puntos}
            />
          </Cabecera>

          <div className="qqp-tarjeta cc-apuesta-card">
            <p className="qqp-carta-cara-titulo" style={{ justifyContent: 'center', width: '100%' }}>
              <Icon name="target" size={16} /> ¿Cuántas respuestas válidas crees que dirá?
            </p>

            <div className="cc-big-stepper">
              <button
                type="button"
                className="cc-big-stepper-btn"
                onClick={() => setApuestaNumero(Math.max(0, apuestaNumero - 1))}
              >
                &minus;
              </button>
              <span className="cc-big-stepper-val">{apuestaNumero}</span>
              <button
                type="button"
                className="cc-big-stepper-btn"
                onClick={() => setApuestaNumero(apuestaNumero + 1)}
              >
                +
              </button>
            </div>

            <div className="cc-condicion-grid">
              <button
                type="button"
                className={`cc-btn-condicion ${apuestaCondicion === 'mas' ? 'activa' : ''}`}
                onClick={() => setApuestaCondicion('mas')}
              >
                📈 Más de {apuestaNumero}
              </button>
              <button
                type="button"
                className={`cc-btn-condicion ${apuestaCondicion === 'menos' ? 'activa' : ''}`}
                onClick={() => setApuestaCondicion('menos')}
              >
                📉 Menos de {apuestaNumero}
              </button>
            </div>
          </div>

          <div className="qqp-barra">
            <BotonPrincipal onClick={confirmarApuestaIndividual}>
              <Icon name="check" size={20} strokeWidth={2.5} /> Confirmar apuesta y continuar
            </BotonPrincipal>
          </div>
        </section>
      )}

      {/* 5A. PANTALLA DE TURNO ANTES DE EMPEZAR A ENUMERAR ELEMENTOS */}
      {fase === 'confirmacion_accion' && jugadorActivo && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            categoria={{ nombre: '¡A responder!', icono: 'zap' }}
            etiqueta={`Ronda ${rondaActual} de ${maxRondas} · Todas las apuestas listas`}
            titulo="Pasad el móvil"
          >
            <OrdenTurnos
              jugadores={jugadoresEnOrden}
              activoId={jugadorActivo.id}
              apostaronMap={apuestas}
              puntosMap={puntos}
            />
          </Cabecera>

          <div className="qqp-tarjeta qqp-pasar">
            <Avatar nombre={jugadorActivo.nombre} color={colorJugador(indiceColor(jugadorActivo, 0))} grande />
            <p className="qqp-pasar-para">Turno de</p>
            <h3 className="qqp-pasar-nombre">{jugadorActivo.nombre}</h3>
            <p className="qqp-texto">
              En cuanto pulses el botón comenzará directamente el tiempo de <strong>{TIEMPO_MAXIMO_S} segundos</strong> para enumerar respuestas de <strong>«{consignaElegida}»</strong>.
            </p>
          </div>

          <div className="qqp-barra">
            <BotonPrincipal onClick={() => setFase('turno_accion')}>
              <Icon name="play" size={22} /> Soy {jugadorActivo.nombre}, ¡estoy listo!
            </BotonPrincipal>
          </div>
        </section>
      )}

      {/* 5B. TURNO DE ACCIÓN (60 SEGUNDOS DIRECTOS) */}
      {fase === 'turno_accion' && jugadorActivo && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            categoria={{
              nombre: '¡En marcha!',
              icono: 'clock'
            }}
            etiqueta={`Ronda ${rondaActual} de ${maxRondas} · Turno de acción`}
            titulo={jugadorActivo.nombre}
            avatar={<Avatar nombre={jugadorActivo.nombre} color={colorJugador(indiceColor(jugadorActivo, 0))} />}
          >
            <div className="qqp-identidad cc-consigna-box">
              <div className="cc-consigna-top">
                <span className="qqp-identidad-icono">
                  <Icon name="zap" size={16} strokeWidth={2.4} />
                </span>
                <span className="cc-consigna-texto">«{consignaElegida}»</span>
              </div>

              <div className="cc-hero-stats">
                <span className="cc-hero-stat ok">✅ {contadorAciertos} válidas</span>
                <span className={`cc-hero-stat timer${restante <= 15 ? ' low' : ''}`}>
                  <Icon name="clock" size={14} />
                  {Math.ceil(restante)}s
                </span>
              </div>

              <div className="cc-timer-track" role="timer">
                <div
                  className={`cc-timer-fill${restante <= 15 ? ' low' : ''}`}
                  style={{ width: `${(restante / TIEMPO_MAXIMO_S) * 100}%` }}
                />
              </div>
            </div>
          </Cabecera>

          <div className="qqp-tarjeta cc-apuesta-card">
            <p className="qqp-carta-cara-titulo" style={{ justifyContent: 'center', width: '100%' }}>
              <Icon name="check" size={16} /> Respuestas válidas aprobadas por el grupo
            </p>
            <p className="cc-sub-instruccion">
              Di tantas respuestas como puedas en voz alta en {TIEMPO_MAXIMO_S} segundos. El grupo suma cada acierto válido:
            </p>

            <div className="cc-big-stepper">
              <button
                type="button"
                className="cc-big-stepper-btn"
                onClick={() => setContadorAciertos(Math.max(0, contadorAciertos - 1))}
              >
                -1
              </button>
              <span className="cc-big-stepper-val aciertos">{contadorAciertos}</span>
              <button
                type="button"
                className="cc-big-stepper-btn"
                onClick={() => setContadorAciertos(contadorAciertos + 1)}
              >
                +1
              </button>
            </div>
          </div>

          <div className="qqp-barra">
            <BotonPrincipal onClick={pararManualmente}>
              <Icon name="flagFinish" size={20} /> Parar tiempo y cerrar recuento
            </BotonPrincipal>
          </div>
        </section>
      )}

      {/* 6. VALIDACIÓN FINAL DEL RECUENTO */}
      {fase === 'validacion_final' && jugadorActivo && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            categoria={{ nombre: 'Recuento final', icono: 'check' }}
            etiqueta={`Ronda ${rondaActual} de ${maxRondas} · Tiempo finalizado`}
            titulo={`Recuento de ${jugadorActivo.nombre}`}
            avatar={<Avatar nombre={jugadorActivo.nombre} color={colorJugador(indiceColor(jugadorActivo, 0))} />}
          >
            <div className="qqp-identidad">
              <span className="qqp-identidad-icono"><Icon name="zap" size={16} /></span>
              <span>Consigna: <strong>«{consignaElegida}»</strong></span>
            </div>
          </Cabecera>

          <div className="qqp-tarjeta cc-apuesta-card">
            <p className="qqp-carta-cara-titulo" style={{ justifyContent: 'center', width: '100%' }}>
              <Icon name="trophy" size={16} /> Confirmad el número definitivo de aciertos
            </p>
            <p className="cc-sub-instruccion">
              Ajustad la cifra si quedó alguna respuesta pendiente antes de desvelar las apuestas:
            </p>

            <div className="cc-big-stepper">
              <button
                type="button"
                className="cc-big-stepper-btn"
                onClick={() => setContadorAciertos(Math.max(0, contadorAciertos - 1))}
              >
                &minus;
              </button>
              <span className="cc-big-stepper-val aciertos">{contadorAciertos}</span>
              <button
                type="button"
                className="cc-big-stepper-btn"
                onClick={() => setContadorAciertos(contadorAciertos + 1)}
              >
                +
              </button>
            </div>
          </div>

          <div className="qqp-barra">
            <BotonPrincipal onClick={() => calcularResultados(contadorAciertos)}>
              <Icon name="check" size={20} strokeWidth={2.5} /> Confirmar y ver resultados
            </BotonPrincipal>
          </div>
        </section>
      )}

      {/* 7. RESULTADOS DE LA RONDA */}
      {fase === 'resultados' && resultadoRonda && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            etiqueta={`Ronda ${rondaActual} de ${maxRondas} completada`}
            titulo={`Aciertos: ${resultadoRonda.aciertosFinales}`}
          >
            <div className="qqp-identidad">
              <span className="qqp-identidad-icono"><Icon name="check" size={16} strokeWidth={2.5} /></span>
              <span>«{consignaElegida}»</span>
            </div>
          </Cabecera>

          <div className="qqp-tarjeta">
            <p className="qqp-carta-cara-titulo" style={{ marginBottom: '0.8rem' }}>
              <Icon name="target" size={16} /> Resultado de las apuestas
            </p>
            <div className="cc-resolucion-lista">
              {resultadoRonda.detalles.map((item) => (
                <div
                  key={item.jugadorId}
                  className={`cc-fila-resultado cc-fila-${item.estadoColor}`}
                >
                  <div className="cc-res-col-val">
                    <span className="cc-res-num">
                      {item.condicion === 'mas' ? `> ${item.numero}` : `< ${item.numero}`}
                    </span>
                    <span className="cc-res-dist">dif: {item.diff}</span>
                  </div>

                  <div className="cc-res-col-jugadores">
                    <div className="cc-res-autor-linea">
                      <strong>{item.nombre}</strong>
                      <span
                        className={`cc-badge-pts ${
                          item.puntosGanados > 0 ? 'pos' : item.puntosGanados < 0 ? 'neg' : ''
                        }`}
                      >
                        {item.puntosGanados >= 0 ? `+${item.puntosGanados}` : item.puntosGanados} pts
                      </span>
                    </div>
                  </div>

                  <div className="cc-res-etiqueta">
                    {item.estadoColor === 'azul' && '🎯 Clavado'}
                    {item.estadoColor === 'verde' && '✓ Acertada'}
                    {item.estadoColor === 'rojo' && '❌ Fallada'}
                  </div>
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
                const lider = maximo > 0 && pts === maximo;
                return (
                  <li key={j.id} className="qqp-rival" style={{ '--c': colorJugador(indiceColor(j, i)) }}>
                    <span className="qqp-rival-avatar">{lider ? '👑' : i + 1}</span>
                    <span className="qqp-rival-datos">
                      <span className="qqp-rival-nombre">{lider ? 'Líder actual' : `Puesto ${i + 1}`}</span>
                      <strong className="qqp-rival-tarjeta">{j.nombre}</strong>
                    </span>
                    <span className="cc-ranking-pts">{pts} pts</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="qqp-barra">
            {rondaActual >= maxRondas ? (
              <BotonPrincipal onClick={() => setFase('final')}>
                <Icon name="trophy" size={20} /> Ver el podio final
              </BotonPrincipal>
            ) : (
              <>
                <BotonPrincipal onClick={avanzarSiguienteRonda}>
                  <Icon name="play" size={20} /> Siguiente ronda ({rondaActual + 1} de {maxRondas})
                </BotonPrincipal>
                <EnlaceSecundario onClick={() => setFase('final')}>
                  Finalizar partida y ver podio
                </EnlaceSecundario>
              </>
            )}
          </div>
        </section>
      )}

      {/* 8. PODIO FINAL */}
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
                    <span className="cc-ranking-pts">{pts} pts</span>
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