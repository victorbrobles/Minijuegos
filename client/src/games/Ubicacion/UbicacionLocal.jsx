// client/src/games/Ubicacion/UbicacionLocal.jsx
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import GameIntro from '../../components/GameIntro.jsx';
import MapaMundi from './MapaMundi.jsx';
import { RANGOS_PUNTOS, barajar, distanciaKm, formatearKm, puntosPorDistancia, resolverImagenes } from './geo.js';
import './Ubicacion.css';

const MIN_JUGADORES = 3;
const MAX_JUGADORES = 10;
const RONDAS = 10;
const SEGUNDOS_IMAGEN = 10;
const CANDIDATOS = 16;

const COLORES = ['#ef4444', '#2563eb', '#16a34a', '#f59e0b', '#9333ea', '#ec4899', '#0d9488', '#ea580c', '#475569', '#65a30d'];

const SLOTS = [
  { id: 'real', glifo: '★', nombre: 'Real' },
  { id: 's1', glifo: '1', nombre: 'Señuelo 1' },
  { id: 's2', glifo: '2', nombre: 'Señuelo 2' }
];
const VACIOS = { real: null, s1: null, s2: null };

const inicial = (nombre) => (nombre.trim()[0] ?? '?').toUpperCase();
const urlWiki = (l) => (l.wiki ? `https://en.wikipedia.org/wiki/${encodeURIComponent(l.wiki)}` : null);

function FaseImagen({ lugar, ronda, total, onFin, onError }) {
  const [cargada, setCargada] = useState(false);
  const [restante, setRestante] = useState(SEGUNDOS_IMAGEN);
  const alAcabar = useRef(onFin);
  alAcabar.current = onFin;

  useEffect(() => {
    if (!cargada) return undefined;
    const fin = Date.now() + SEGUNDOS_IMAGEN * 1000;
    const id = setInterval(() => {
      const r = (fin - Date.now()) / 1000;
      if (r <= 0) {
        clearInterval(id);
        setRestante(0);
        alAcabar.current();
      } else {
        setRestante(r);
      }
    }, 100);
    return () => clearInterval(id);
  }, [cargada]);

  return (
    <section className="game">
      <div className="hud">
        <span className="chip">Ronda {ronda} de {total}</span>
      </div>
      <div className="panel">
        <h3 className="panel-title"><Icon name="eye" size={22} /> ¡Memoriza este lugar!</h3>
        <img
          className="ub-foto"
          src={lugar.imagenUrl}
          alt="Fotografía de un lugar emblemático"
          onLoad={() => setCargada(true)}
          onError={onError}
        />
        <div className="timer">
          <div className={`timer-bar${restante <= 3 ? ' low' : ''}`} style={{ width: `${(restante / SEGUNDOS_IMAGEN) * 100}%` }} />
        </div>
        <p className="timer-text">
          <Icon name="clock" size={18} /> {cargada ? `${Math.ceil(restante)} s` : 'Cargando foto…'}
        </p>
        <Credito lugar={lugar} mostrarEnlace={false} />
      </div>
    </section>
  );
}

function Credito({ lugar, mostrarEnlace = false }) {
  const url = urlWiki(lugar);
  return (
    <p className="ub-credito">
      Foto de Wikimedia Commons (licencia libre)
      {mostrarEnlace && url && (
        <> · <a href={url} target="_blank" rel="noreferrer">ver origen y detalles</a></>
      )}
    </p>
  );
}

export default function UbicacionLocal({ onVolver, onExit }) {
  const navigate = useNavigate();

  const [fase, setFase] = useState('setup');
  const [modalAyuda, setModalAyuda] = useState(false);
  const [verImagen, setVerImagen] = useState(false);
  const [errorCarga, setErrorCarga] = useState('');

  const [numJugadores, setNumJugadores] = useState(MIN_JUGADORES);
  const [nombres, setNombres] = useState(() => Array.from({ length: MAX_JUGADORES }, (_, i) => `Jugador ${i + 1}`));

  const [jugadores, setJugadores] = useState([]);
  const [puntos, setPuntos] = useState({});
  const [lugares, setLugares] = useState([]);
  const [ronda, setRonda] = useState(1);
  const [abridores, setAbridores] = useState([]);

  const [orden, setOrden] = useState([]);
  const [turnoIdx, setTurnoIdx] = useState(0);
  const [marcasRonda, setMarcasRonda] = useState([]);
  const [colocados, setColocados] = useState(VACIOS);
  const [slotActivo, setSlotActivo] = useState('real');
  const [resultado, setResultado] = useState(null);
  const [enfoque, setEnfoque] = useState(null);

  const totalRondas = Math.min(RONDAS, lugares.length);
  const lugarActual = lugares[ronda - 1];
  const jugadorActual = jugadores[orden[turnoIdx]];
  const anterior = marcasRonda.length ? marcasRonda[marcasRonda.length - 1] : null;
  const jugadorAnterior = anterior ? jugadores.find((j) => j.id === anterior.jugadorId) : null;

  const esUltimoTurno = turnoIdx === orden.length - 1;
  const slotsActivos = esUltimoTurno ? SLOTS.filter((s) => s.id === 'real') : SLOTS;

  useEffect(() => {
    const siguiente = lugares[ronda];
    if (siguiente) new Image().src = siguiente.imagenUrl;
  }, [lugares, ronda]);

  useEffect(() => {
    if (['imagen', 'aviso', 'turno'].includes(fase) && !lugarActual) setFase('final');
  }, [fase, lugarActual]);

  const iniciarPartida = async () => {
    const js = nombres.slice(0, numJugadores).map((n, i) => ({
      id: i + 1,
      nombre: n.trim() || `Jugador ${i + 1}`,
      color: COLORES[i % COLORES.length]
    }));
    setJugadores(js);
    setPuntos(Object.fromEntries(js.map((j) => [j.id, 0])));
    setErrorCarga('');
    setFase('cargando');
    try {
      const r = await fetch(`/api/ubicacion/lote?n=${CANDIDATOS}`);
      if (!r.ok) throw new Error('servidor');
      const candidatos = await r.json();
      const conFoto = await resolverImagenes(candidatos);
      if (conFoto.length === 0) throw new Error('fotos');
      setLugares(conFoto);
      setRonda(1);
      empezarRonda(js, []);
    } catch (e) {
      setErrorCarga(
        e.message === 'fotos'
          ? 'No se han podido cargar las fotos (se descargan de Wikimedia Commons). Comprueba la conexión a internet.'
          : 'No se pudo cargar el catálogo de lugares. ¿Está arrancado el servidor?'
      );
      setFase('setup');
    }
  };

  const empezarRonda = (js, pendientes) => {
    const pool = pendientes.length ? pendientes : js.map((_, i) => i);
    const k = Math.floor(Math.random() * pool.length);
    const inicio = pool[k];
    setAbridores(pool.filter((_, i) => i !== k));
    setOrden(js.map((_, i) => (inicio + i) % js.length));
    setTurnoIdx(0);
    setMarcasRonda([]);
    setColocados(VACIOS);
    setSlotActivo('real');
    setResultado(null);
    setEnfoque(null);
    setFase('imagen');
  };

  const descartarLugar = () => setLugares((ls) => ls.filter((l) => l.id !== lugarActual?.id));

  const colocar = (lat, lng) => {
    if (!slotActivo) return;
    const nuevos = { ...colocados, [slotActivo]: { lat, lng } };
    setColocados(nuevos);
    const siguiente = slotsActivos.find((s) => !nuevos[s.id]);
    setSlotActivo(siguiente ? siguiente.id : null);
  };

  const moverMarcador = (id, lat, lng) => {
    if (id in colocados) setColocados((c) => ({ ...c, [id]: { lat, lng } }));
  };

  const confirmar = () => {
    const entrada = {
      jugadorId: jugadorActual.id,
      real: colocados.real,
      senuelos: esUltimoTurno ? [] : [colocados.s1, colocados.s2],
      visibles: esUltimoTurno ? [colocados.real] : barajar([colocados.real, colocados.s1, colocados.s2])
    };
    const marcas = [...marcasRonda, entrada];
    setMarcasRonda(marcas);
    if (turnoIdx + 1 < orden.length) {
      setTurnoIdx(turnoIdx + 1);
      setColocados(VACIOS);
      setSlotActivo('real');
      setFase('aviso');
    } else {
      cerrarRonda(marcas);
    }
  };

  const cerrarRonda = (marcas) => {
    const lugar = lugarActual;
    const filas = marcas
      .map((m) => {
        const km = distanciaKm(m.real, lugar);
        return { jugador: jugadores.find((j) => j.id === m.jugadorId), real: m.real, km, puntos: puntosPorDistancia(km) };
      })
      .sort((a, b) => a.km - b.km);
    setPuntos((p) => {
      const n = { ...p };
      filas.forEach((f) => { n[f.jugador.id] = (n[f.jugador.id] ?? 0) + f.puntos; });
      return n;
    });
    setResultado({ lugar, filas });
    setFase('resultados');
  };

  const siguienteRonda = () => {
    setRonda((r) => r + 1);
    empezarRonda(jugadores, abridores);
  };

  const colocadosN = slotsActivos.filter((s) => colocados[s.id]).length;
  const slotInfo = slotsActivos.find((s) => s.id === slotActivo);

  const marcadoresTurno = jugadorActual
    ? [
        ...(anterior?.visibles ?? []).map((p, i) => ({
          id: `previo-${i}`, lat: p.lat, lng: p.lng, color: jugadorAnterior.color, glifo: '?', fantasma: true, interactivo: false
        })),
        ...slotsActivos.filter((s) => colocados[s.id]).map((s) => ({
          id: s.id, ...colocados[s.id], color: jugadorActual.color, glifo: s.glifo, grande: s.id === 'real', arrastrable: true
        }))
      ]
    : [];

  const marcadoresResultado = resultado
    ? [
        { id: 'correcto', lat: resultado.lugar.lat, lng: resultado.lugar.lng, color: '#111827', glifo: '✓', grande: true, z: 1000, etiqueta: resultado.lugar.nombre },
        ...resultado.filas.map((f) => ({
          id: `jugador-${f.jugador.id}`, lat: f.real.lat, lng: f.real.lng, color: f.jugador.color, glifo: inicial(f.jugador.nombre), etiqueta: f.jugador.nombre
        }))
      ]
    : [];
  const lineasResultado = resultado
    ? resultado.filas.map((f) => ({ desde: f.real, hasta: resultado.lugar, color: f.jugador.color }))
    : [];

  const clasificacion = [...jugadores].sort((a, b) => (puntos[b.id] ?? 0) - (puntos[a.id] ?? 0));
  const maximo = clasificacion.length ? (puntos[clasificacion[0].id] ?? 0) : 0;
  const ganadores = maximo > 0 ? clasificacion.filter((j) => (puntos[j.id] ?? 0) === maximo) : [];
  const ganadoEnRonda = (id) => resultado?.filas.find((f) => f.jugador.id === id)?.puntos ?? 0;
  const esUltimaRonda = ronda >= totalRondas;

  const mostrarBarra = ['aviso', 'turno', 'resultados', 'puntuaciones'].includes(fase) && lugarActual;

  return (
    <div className="ub-contenedor">
      {fase === 'setup' && (
        <>
          <button
            type="button"
            className="btn-ayuda-flotante"
            onClick={() => setModalAyuda(true)}
            title="Reglas y sistema de puntuación"
          >
            <span className="btn-ayuda-flotante-signo">?</span>
          </button>

          {modalAyuda && (
            <div className="rg-modal-fondo" onClick={() => setModalAyuda(false)}>
              <div className="rg-modal modal-ayuda-juego" onClick={(e) => e.stopPropagation()}>
                <div className="modal-ayuda-header">
                  <span className="modal-ayuda-signo-title">?</span>
                  <h3>¿Cómo se juega a Ubica el lugar?</h3>
                </div>
                <div className="modal-ayuda-cuerpo">
                  <p><strong>1. Dinámica de la ronda:</strong></p>
                  <ul>
                    <li>Se muestra la fotografía de un lugar emblemático durante {SEGUNDOS_IMAGEN} segundos.</li>
                    <li>Un jugador al azar abre la ronda y coloca <strong>3 marcadores</strong>: uno <strong>real</strong> (★) y <strong>dos señuelos</strong> (1 y 2).</li>
                    <li>El siguiente jugador verá esos 3 marcadores anteriores con una «?» (sin saber cuál es el real) y colocará los suyos.</li>
                    <li><strong>Último jugador:</strong> solo coloca su marcador <strong>★ Real</strong>.</li>
                  </ul>

                  <p><strong>2. Puntuación:</strong></p>
                  <div className="tabla-ayuda-puntos">
                    {RANGOS_PUNTOS.map((r) => (
                      <div key={r.hasta} className="fila-ayuda-puntos verde">
                        <span>A {r.hasta.toLocaleString('es-ES')} km o menos</span>
                        <strong>+{r.puntos} {r.puntos === 1 ? 'punto' : 'puntos'}</strong>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rg-modal-acciones">
                  <button className="big full" onClick={() => setModalAyuda(false)}>Entendido</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {verImagen && lugarActual && (
        <div className="ub-modal-fondo" onClick={() => setVerImagen(false)}>
          <div className="ub-modal ub-modal-foto" onClick={(e) => e.stopPropagation()}>
            <img className="ub-foto" src={lugarActual.imagenUrl} alt="Fotografía del lugar de esta ronda" />
            <Credito lugar={lugarActual} mostrarEnlace={false} />
            <button className="big full" onClick={() => setVerImagen(false)}>Cerrar</button>
          </div>
        </div>
      )}

      {mostrarBarra && (
        <div className="ub-barra">
          <span className="chip">Ronda {ronda} de {totalRondas}</span>
          <button className="secondary ub-mini" onClick={() => setVerImagen(true)}>
            <Icon name="eye" size={18} /> Ver imagen
          </button>
        </div>
      )}

      {/* SETUP */}
      {fase === 'setup' && (
        <section className="game" style={{ position: 'relative' }}>
          <GameIntro gameId="ubicacion" titulo="Ubica el lugar" />

          <div className="panel">
            <div className="hud" style={{ marginBottom: '1rem' }}>
              <button className="btn-back-inline" onClick={onVolver}>
                &larr; Cambiar a modo Online
              </button>
            </div>

            <h3 className="panel-title"><Icon name="users" size={22} /> Jugadores</h3>
            <label className="field-label" htmlFor="num-jugadores-ub">
              Número de jugadores ({MIN_JUGADORES} a {MAX_JUGADORES})
            </label>
            <select id="num-jugadores-ub" value={numJugadores} onChange={(e) => setNumJugadores(parseInt(e.target.value, 10))}>
              {Array.from({ length: MAX_JUGADORES - MIN_JUGADORES + 1 }, (_, i) => (
                <option key={i + MIN_JUGADORES} value={i + MIN_JUGADORES}>{i + MIN_JUGADORES} jugadores</option>
              ))}
            </select>

            <span className="field-label">Nombres</span>
            <div className="names-grid">
              {nombres.slice(0, numJugadores).map((n, i) => (
                <div key={i} className="ub-nombre">
                  <span className="ub-punto" style={{ background: COLORES[i % COLORES.length] }} />
                  <input
                    type="text"
                    value={n}
                    onChange={(e) => setNombres((ns) => ns.map((x, k) => (k === i ? e.target.value : x)))}
                    placeholder={`Jugador ${i + 1}`}
                    maxLength={30}
                  />
                </div>
              ))}
            </div>
          </div>

          <button className="big full" onClick={iniciarPartida}>
            <Icon name="play" size={24} /> ¡Empezar Partida ({RONDAS} Rondas)!
          </button>
        </section>
      )}

      {/* CARGANDO */}
      {fase === 'cargando' && (
        <section className="game">
          <p className="loading">Buscando lugares emblemáticos…</p>
        </section>
      )}

      {/* FOTO */}
      {fase === 'imagen' && lugarActual && (
        <FaseImagen
          key={lugarActual.id}
          lugar={lugarActual}
          ronda={ronda}
          total={totalRondas}
          onFin={() => setFase('aviso')}
          onError={descartarLugar}
        />
      )}

      {/* AVISO */}
      {fase === 'aviso' && jugadorActual && (
        <section className="game">
          <div className="panel ub-aviso" style={{ '--c': jugadorActual.color }}>
            <span className="ub-aviso-punto" />
            <p className="ub-aviso-sub">Turno {turnoIdx + 1} de {orden.length}</p>
            <h2 className="ub-aviso-nombre">{jugadorActual.nombre}</h2>
            {turnoIdx === 0 ? (
              <p className="hint"><Icon name="dice" size={18} /> El sorteo ha elegido a {jugadorActual.nombre} para abrir esta ronda.</p>
            ) : esUltimoTurno ? (
              <p className="hint"><Icon name="flagFinish" size={18} /> ¡Eres el último jugador! Solo tendrás que colocar tu marcador real.</p>
            ) : (
              <p className="hint">Verás los 3 marcadores de <strong>{jugadorAnterior.nombre}</strong> con «?».</p>
            )}
            <p className="hint small">Pasa el dispositivo a {jugadorActual.nombre} y pulsa cuando esté listo.</p>
            <button className="big full" onClick={() => setFase('turno')}>
              <Icon name="pin" size={22} /> Empezar mi turno
            </button>
          </div>
        </section>
      )}

      {/* TURNO */}
      {fase === 'turno' && jugadorActual && (
        <section className="game">
          <div className="ub-turno" style={{ '--c': jugadorActual.color }}>
            <p className="ub-turno-titulo">
              <span className="ub-punto" style={{ background: jugadorActual.color }} />
              Turno de <strong>{jugadorActual.nombre}</strong>
            </p>
            <p className="ub-turno-texto">
              {slotInfo ? <>Toca el mapa para colocar <strong>{slotInfo.glifo} {slotInfo.nombre}</strong>.</> : <>Arrastra el marcador para ajustarlo o confirma abajo.</>}
            </p>
          </div>

          <MapaMundi
            key={`turno-${ronda}-${jugadorActual.id}`}
            marcadores={marcadoresTurno}
            onClickMapa={colocar}
            onMoverMarcador={moverMarcador}
          />

          <div className="ub-slots" style={{ gridTemplateColumns: esUltimoTurno ? '1fr' : 'repeat(3, 1fr)' }}>
            {slotsActivos.map((s) => (
              <button
                key={s.id}
                className={`ub-slot${slotActivo === s.id ? ' activo' : ''}${colocados[s.id] ? ' listo' : ''}`}
                style={{ '--c': jugadorActual.color }}
                onClick={() => setSlotActivo(s.id)}
                aria-pressed={slotActivo === s.id}
              >
                <span className="ub-slot-glifo">{s.glifo}</span>
                <span>{s.nombre}</span>
                <small>{colocados[s.id] ? 'Colocado' : 'Sin colocar'}</small>
              </button>
            ))}
          </div>

          <button className="big full" disabled={colocadosN < slotsActivos.length} onClick={confirmar}>
            <Icon name="check" size={22} /> Confirmar {esUltimoTurno ? 'marcador real' : `marcadores (${colocadosN}/${slotsActivos.length})`}
          </button>
        </section>
      )}

      {/* RESULTADOS */}
      {fase === 'resultados' && resultado && (
        <section className="game">
          <MapaMundi
            key={`resultado-${ronda}`}
            marcadores={marcadoresResultado}
            lineas={lineasResultado}
            ajustar
            enfoque={enfoque}
          />

          <div className="panel ub-ranking">
            <h3 className="panel-title"><Icon name="trophy" size={22} /> Ranking de la ronda</h3>
            <p className="ub-lugar-revelado">
              <Icon name="pin" size={22} />
              <span><strong>{resultado.lugar.nombre}</strong> · {resultado.lugar.pais}</span>
            </p>

            <div className="scoreboard">
              {resultado.filas.map((f, i) => (
                <button
                  key={f.jugador.id}
                  className="ub-rank-fila"
                  onClick={() => setEnfoque({ lat: f.real.lat, lng: f.real.lng })}
                  title="Ver su marcador en el mapa"
                >
                  <span className="score-name">
                    <span className="pos">{i + 1}</span>
                    <span className="ub-punto" style={{ background: f.jugador.color }} />
                    {f.jugador.nombre}
                  </span>
                  <span className="ub-rank-datos">
                    <span className="ub-rank-km">{formatearKm(f.km)}</span>
                    <span className={`ub-rank-pts${f.puntos > 0 ? ' suma' : ''}`}>+{f.puntos}</span>
                  </span>
                </button>
              ))}
            </div>

            <Credito lugar={resultado.lugar} mostrarEnlace={true} />
          </div>

          <button className="big full" onClick={() => setFase('puntuaciones')}>
            <Icon name="chart" size={22} /> Ver puntuaciones
          </button>
        </section>
      )}

      {/* PUNTUACIONES */}
      {fase === 'puntuaciones' && (
        <section className="game">
          <div className="end-card ub-puntuaciones">
            <span className="end-icon"><Icon name="trophy" size={44} /></span>
            <h1 className="title">Puntuaciones</h1>
            <p className="hint">Tras la ronda {ronda} de {totalRondas}</p>
            <div className="scoreboard">
              {clasificacion.map((j, i) => {
                const pts = puntos[j.id] ?? 0;
                const lider = maximo > 0 && pts === maximo;
                return (
                  <div key={j.id} className={`score-row${lider ? ' first' : ''}`}>
                    <span className="score-name">
                      {lider ? <Icon name="crown" size={22} /> : <span className="pos">{i + 1}</span>}
                      <span className="ub-punto" style={{ background: j.color }} />
                      {j.nombre}
                    </span>
                    <span className="score-pts">
                      <small className="ub-delta">+{ganadoEnRonda(j.id)}</small> {pts} pts
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="actions">
            {esUltimaRonda ? (
              <button onClick={() => setFase('final')}>
                <Icon name="crown" size={20} /> Ver resultado final
              </button>
            ) : (
              <>
                <button onClick={siguienteRonda}>
                  <Icon name="play" size={20} /> Siguiente ronda
                </button>
                <button className="secondary danger" onClick={() => setFase('final')}>
                  <Icon name="flagFinish" size={20} /> Finalizar el juego
                </button>
              </>
            )}
          </div>
        </section>
      )}

      {/* FINAL */}
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
              {clasificacion.map((j, i) => {
                const pts = puntos[j.id] ?? 0;
                const primero = maximo > 0 && pts === maximo;
                return (
                  <div key={j.id} className={`score-row${primero ? ' first' : ''}`}>
                    <span className="score-name">
                      {primero ? <Icon name="crown" size={22} /> : <span className="pos">{i + 1}</span>}
                      <span className="ub-punto" style={{ background: j.color }} />
                      {j.nombre}
                    </span>
                    <span className="score-pts">{pts} pts</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="actions">
            <button onClick={() => setFase('setup')}>
              <Icon name="refresh" size={20} /> Nueva partida
            </button>
            <button className="secondary danger" onClick={() => (onExit ? onExit() : navigate('/'))}>
              <Icon name="door" size={20} /> Salir al menú principal
            </button>
          </div>
        </section>
      )}
    </div>
  );
}