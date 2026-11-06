// client/src/games/Lobos/LobosLocal.jsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Lobos.css';
import Icon from '../../components/Icon.jsx';
import { ROLES, BANDOS } from './roles.js';
import {
  crearPartida,
  iniciarNoche,
  fijarVictima,
  registrarAccion,
  avanzarTurno,
  limpiarAvisos,
  resolverNoche,
  disparar,
  contarVotos,
  juezActivo,
  gastarJuez,
  aplicarVotacion,
  siguienteRonda,
  comprobarVictoria,
  barajar,
  vivos,
  TEXTO_CAUSA,
  CAUSAS_PUBLICAS,
  EVENTOS,
  OBJETOS,
  MODIFICADORES,
  MEC_NINGUNA,
  generarModDia,
  convertirCamaleon,
  aplicarFicha,
  sortearObjeto,
  reclamarObjeto,
  dejarMensajeEco,
  rolRevelado
} from './engine.js';
import { MIN_JUGADORES, MAX_JUGADORES, validar } from './composiciones.js';
import TarjetaRol, { ConsultarRol } from './TarjetaRol.jsx';
import TurnoNoche, { ElegirUno, BotonAbstenerse } from './TurnoNoche.jsx';
import SelectorRoles, { selInicial, rolesDeSel } from './SelectorRoles.jsx';

const nombresPorDefecto = (n) => Array.from({ length: n }, (_, i) => `Jugador ${i + 1}`);

function limpiarNombres(nombres) {
  const usados = new Set();
  return nombres.map((n, i) => {
    const base = n.trim() || `Jugador ${i + 1}`;
    let nombre = base;
    for (let k = 2; usados.has(nombre.toLowerCase()); k++) nombre = `${base} (${k})`;
    usados.add(nombre.toLowerCase());
    return nombre;
  });
}

function BotonVolver({ onClick, texto = 'Volver' }) {
  return (
    <button type="button" className="qq-link-volver" onClick={onClick}>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      <span>{texto}</span>
    </button>
  );
}

/* ───────── Voto de un jugador (con voto robado si procede) ───────── */
function VotoTurno({ e, id, robadoDe, segunda, onVotar, onSalirPortada }) {
  const [paso, setPaso] = useState('propio');
  const [propio, setPropio] = useState(undefined);
  const [verRol, setVerRol] = useState(false);
  const j = e.jugadores[id];
  const opciones = vivos(e)
    .map((x) => x.id)
    .filter((x) => x !== id);
  const abstener = (cb) => <BotonAbstenerse onClick={() => cb(null)} />;
  return (
    <section className="game">
      {verRol && <ConsultarRol e={e} idFijo={id} onCerrar={() => setVerRol(false)} />}
      <div className="panel qq-menu-panel">
        <div className="qq-card-top" style={{ marginBottom: '0.8rem' }}>
          <BotonVolver texto="Volver a la portada" onClick={onSalirPortada} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="qq-tablero-badge" style={{ marginBottom: 0 }}>
              <Icon name="users" size={15} /> {j.nombre}
            </span>
            <button type="button" className="secondary lb-mirol" style={{ margin: 0 }} onClick={() => setVerRol(true)}>
              <Icon name="eye" size={16} /> Mi rol
            </button>
          </div>
        </div>

        {paso === 'propio' ? (
          <>
            <h2 className="title">{segunda ? 'Votación repetida' : 'Votación'}</h2>
            <p className="hint">Elige a quién linchar. Tu voto es secreto hasta el recuento.</p>
            <ElegirUno
              e={e}
              opciones={opciones}
              texto="Votar a este jugador"
              onConfirmar={(t) => {
                if (robadoDe != null) {
                  setPropio(t);
                  setPaso('robado');
                } else onVotar(t, undefined);
              }}
              arriba={abstener((t) => {
                if (robadoDe != null) {
                  setPropio(t);
                  setPaso('robado');
                } else onVotar(t, undefined);
              })}
            />
          </>
        ) : (
          <>
            <h2 className="title">Voto robado</h2>
            <div className="lb-haz">
              <p>
                Como <strong>Ladrón de Voces</strong>, emites también el voto de <strong>{e.jugadores[robadoDe].nombre}</strong>. Él no lo sabrá hasta el recuento.
              </p>
            </div>
            <ElegirUno
              e={e}
              opciones={vivos(e)
                .map((x) => x.id)
                .filter((x) => x !== robadoDe)}
              texto="Emitir voto robado"
              onConfirmar={(t) => onVotar(propio, t)}
              arriba={abstener((t) => onVotar(propio, t))}
            />
          </>
        )}
      </div>
    </section>
  );
}

/* ───────── Componente principal ───────── */
export default function LobosLocal({ onVolver, onSalir, onExit, onAbrirAyuda }) {
  const navigate = useNavigate();

  // Fases: setup | composicion | reparto | noche | anuncio | objeto | debate | votacion | resultado | fin
  const [fase, setFase] = useState('setup');
  const [modalConsulta, setModalConsulta] = useState(false);
  const [modalSalirPortada, setModalSalirPortada] = useState(false);

  // Configuración
  const [numJugadores, setNumJugadores] = useState(10);
  const [nombres, setNombres] = useState(nombresPorDefecto(10));
  const [minutos, setMinutos] = useState(3);
  const [votosPublicos, setVotosPublicos] = useState(true);
  const [mec, setMec] = useState({ ...MEC_NINGUNA });
  const [sel, setSel] = useState(() => selInicial(10));

  // Partida
  const [e, setE] = useState(null);
  const [idx, setIdx] = useState(0);
  const [paso, setPaso] = useState('pasar');
  const [origen, setOrigen] = useState('noche');
  const [segundos, setSegundos] = useState(0);
  const [vot, setVot] = useState(null);
  const [res, setRes] = useState(null);
  const [objetoDia, setObjetoDia] = useState(null);
  const [ecoListo, setEcoListo] = useState(false);
  const [textoEco, setTextoEco] = useState('');

  const n = numJugadores;
  const rolesElegidos = useMemo(() => rolesDeSel(sel, n), [sel, n]);
  const validacion = useMemo(() => validar(rolesElegidos, n), [rolesElegidos, n]);

  const handleSalirAPortada = () => {
    setModalSalirPortada(false);
    const fnSalida = onExit || onSalir;
    if (typeof fnSalida === 'function') {
      fnSalida();
    } else {
      try {
        navigate('/');
      } catch {
        window.location.href = '/';
      }
    }
  };

  /* ───── Configuración ───── */
  const actualizarCantidadJugadores = (nuevoNum) => {
    const k = Math.max(MIN_JUGADORES, Math.min(MAX_JUGADORES, nuevoNum));
    setNumJugadores(k);
    setNombres((prev) =>
      k > prev.length ? [...prev, ...nombresPorDefecto(k).slice(prev.length)] : prev.slice(0, k)
    );
    setSel(selInicial(k));
  };

  const cambiarNumJugadores = (ev) => {
    actualizarCantidadJugadores(Number(ev.target.value));
  };

  const irAComposicion = () => {
    setNombres(limpiarNombres(nombres));
    setSel(selInicial(n));
    setFase('composicion');
  };

  /* ───── Partida ───── */
  const empezarPartida = () => {
    const nuevo = crearPartida(nombres, rolesElegidos, { votosPublicos, mec });
    setE(nuevo);
    setIdx(0);
    setPaso('pasar');
    setFase('reparto');
  };

  const comenzarNoche = (estado) => {
    setE(iniciarNoche(estado));
    setPaso('intro');
    setFase('noche');
  };

  const siguienteReparto = () => {
    if (idx + 1 >= e.jugadores.length) comenzarNoche(e);
    else {
      setIdx(idx + 1);
      setPaso('pasar');
    }
  };

  // Noche
  const turnoActual = e && e.noche ? e.noche.orden[e.noche.idx] : null;
  const empezarTurno = () => {
    if (e.jugadores[turnoActual].rol === 'bruja' && e.noche.victima === undefined) setE(fijarVictima(e));
    setPaso('turno');
  };
  const terminarTurno = (acc) => {
    let s = e;
    if (acc) s = registrarAccion(s, turnoActual, acc);
    s = limpiarAvisos(s, turnoActual);
    s = avanzarTurno(s);
    setE(s);
    setPaso(s.noche.idx >= s.noche.orden.length ? 'amanece' : 'pasar');
  };
  const amanecer = () => {
    setE(resolverNoche(e));
    setOrigen('noche');
    setEcoListo(false);
    setTextoEco('');
    setFase('anuncio');
  };

  // Anuncio de muertes
  const continuarTrasAnuncio = () => {
    const g = comprobarVictoria(e);
    if (g) {
      setE({ ...e, ganador: g });
      setFase('fin');
      return;
    }
    if (origen === 'noche') {
      const tipo = sortearObjeto(e);
      if (tipo) {
        setObjetoDia({ tipo, dueno: null });
        setFase('objeto');
      } else irADebate(e);
    } else {
      comenzarNoche(siguienteRonda(e));
    }
  };

  const irADebate = (estado) => {
    setE({ ...estado, modDia: generarModDia(estado) });
    setSegundos(minutos * 60);
    setFase('debate');
  };

  const reclamar = (id) => {
    const s = reclamarObjeto(e, id, objetoDia.tipo);
    setE(s);
    setObjetoDia({ ...objetoDia, dueno: id });
  };

  // Debate (cuenta atrás opcional)
  useEffect(() => {
    if (fase !== 'debate' || minutos === 0) return undefined;
    const h = setInterval(() => setSegundos((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(h);
  }, [fase, minutos]);

  // Votación
  const iniciarVotacion = (segunda = false, estado = e) => {
    setVot({
      orden: barajar(vivos(estado).map((j) => j.id)),
      i: 0,
      votos: {},
      segunda,
      primera: vot?.primera ?? null,
      robado: null
    });
    setPaso('pasar');
    setFase('votacion');
  };

  const registrarVoto = (voto, votoRobado) => {
    const votante = vot.orden[vot.i];
    const votos = { ...vot.votos, [votante]: voto };
    const robo =
      !vot.segunda && e.flags.ladron && e.flags.ladron.ladron === votante && e.jugadores[e.flags.ladron.objetivo].vivo
        ? e.flags.ladron.objetivo
        : null;
    const robado = robo != null ? { objetivo: robo, voto: votoRobado } : vot.robado;
    if (vot.i + 1 < vot.orden.length) {
      setVot({ ...vot, votos, robado, i: vot.i + 1 });
      setPaso('pasar');
      return;
    }
    cerrarVotacion(votos, robado);
  };

  const cerrarVotacion = (votosBrutos, robado) => {
    const votos = { ...votosBrutos };
    if (robado) votos[robado.objetivo] = robado.voto ?? null;
    let estado = convertirCamaleon(e, votos);
    const r = contarVotos(estado, votos, estado.modDia);
    let victima = r.victima;
    let fichaDe = null;

    const f = aplicarFicha(estado, victima);
    if (f.usada) {
      estado = f.e;
      fichaDe = victima;
      victima = null;
    }

    if (!vot.segunda && victima != null && juezActivo(estado)) {
      setE(gastarJuez(estado));
      setVot({ ...vot, votos: {}, robado: null, primera: { victima }, repetir: true });
      setPaso('repite');
      setFase('votacion');
      return;
    }
    let juezMuere = false;
    let identico = false;
    if (vot.segunda && vot.primera && victima != null && victima === vot.primera.victima) {
      juezMuere = true;
      identico = true;
    }
    setE(estado);
    setRes({ ...r, votos, victima, juezMuere, identico, fichaDe, repeticion: vot.segunda });
    setFase('resultado');
  };

  const aplicarResultado = () => {
    setE(aplicarVotacion(e, res.victima, { juezMuere: res.juezMuere }));
    setOrigen('votacion');
    setFase('anuncio');
  };

  const dispararCazador = (cazador, objetivo) => setE(disparar(e, cazador, objetivo));

  const jugarOtraVez = () => {
    setE(null);
    setFase('composicion');
  };
  const nuevaConfiguracion = () => {
    setE(null);
    setFase('setup');
  };

  const enPartidaActiva = fase !== 'setup' && fase !== 'composicion';

  const modalConfirmarSalida = modalSalirPortada && (
    <div className="rg-modal-fondo" onClick={() => setModalSalirPortada(false)}>
      <div
        className="rg-modal"
        onClick={(ev) => ev.stopPropagation()}
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
          <button type="button" className="secondary full" onClick={() => setModalSalirPortada(false)}>
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
  );

  /* 1. SETUP DE JUGADORES */
  if (fase === 'setup') {
    return (
      <div className="lb-contenedor">
        <section className="game">
          <div className="panel qq-menu-panel">
            <div className="qq-card-top">
              <BotonVolver onClick={onVolver || onSalir} />
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
                  Configura quiénes van a participar ({MIN_JUGADORES} a {MAX_JUGADORES} jugadores; ideal de 8 a 12)
                </p>
              </div>
            </div>

            <div className="qq-selector-cantidad-box">
              <label className="qq-label-destacado" htmlFor="num-jugadores-lb">
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
                  id="num-jugadores-lb"
                  className="qq-select-jugadores"
                  value={numJugadores}
                  onChange={cambiarNumJugadores}
                >
                  {Array.from({ length: MAX_JUGADORES - MIN_JUGADORES + 1 }, (_, i) => i + MIN_JUGADORES).map((k) => (
                    <option key={k} value={k}>
                      {k} jugadores
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
              Nombres (según el orden de asientos en círculo)
            </span>
            <div className="qq-nombres-grid">
              {nombres.map((nombre, i) => (
                <div key={i} className="qq-jugador-input-card">
                  <span className="qq-jugador-badge">{i + 1}</span>
                  <input
                    type="text"
                    value={nombre}
                    maxLength={30}
                    placeholder={`Jugador ${i + 1}`}
                    onChange={(ev) => setNombres((p) => p.map((x, k) => (k === i ? ev.target.value : x)))}
                  />
                </div>
              ))}
            </div>

            <div className="qq-selector-cantidad-box" style={{ marginTop: '1.2rem' }}>
              <label className="qq-label-destacado" htmlFor="min-debate">
                Tiempo de debate diurno
              </label>
              <select
                id="min-debate"
                className="qq-select-jugadores"
                style={{ width: '100%' }}
                value={minutos}
                onChange={(ev) => setMinutos(Number(ev.target.value))}
              >
                <option value={0}>Sin límite de tiempo</option>
                <option value={1}>1 minuto</option>
                <option value={2}>2 minutos</option>
                <option value={3}>3 minutos</option>
                <option value={5}>5 minutos</option>
              </select>

              <label className="lb-check" style={{ marginTop: '0.8rem' }}>
                <input
                  type="checkbox"
                  checked={votosPublicos}
                  onChange={(ev) => setVotosPublicos(ev.target.checked)}
                />
                <span>Mostrar quién votó a quién tras el recuento</span>
              </label>
            </div>

            <button
              type="button"
              className="big full qq-btn-principal"
              style={{ marginTop: '1.5rem' }}
              onClick={irAComposicion}
            >
              <Icon name="play" size={22} /> Iniciar juego
            </button>
          </div>
        </section>
      </div>
    );
  }

  /* 2. COMPOSICIÓN DE ROLES */
  if (fase === 'composicion') {
    const bloqueado = validacion.errores.length > 0;
    return (
      <div className="lb-contenedor">
        <section className="game">
          <div className="panel qq-menu-panel">
            <div className="qq-card-top">
              <BotonVolver onClick={() => setFase('setup')} />
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

            <div className="qq-section-header">
              <h2 className="qq-section-title">Elige los roles</h2>
              <p className="hint">
                {n} jugadores. Elige una combinación recomendada para tu mesa o diseña la tuya.
              </p>
            </div>

            <SelectorRoles n={n} sel={sel} setSel={setSel} mec={mec} setMec={setMec} />

            <button
              type="button"
              className="big full qq-btn-principal"
              style={{ marginTop: '1.2rem' }}
              disabled={bloqueado}
              onClick={empezarPartida}
            >
              <Icon name="moon" size={22} /> ¡Empezar partida!
            </button>
          </div>
        </section>
      </div>
    );
  }

  /* 3. REPARTO DE ROLES */
  if (fase === 'reparto' && e) {
    const j = e.jugadores[idx];
    return (
      <div className={`lb-contenedor ${enPartidaActiva ? 'qq-en-partida' : ''}`}>
        {modalConfirmarSalida}
        {paso === 'pasar' ? (
          <section className="game center">
            <div className="panel qq-menu-panel">
              <div className="qq-card-top">
                <BotonVolver texto="Volver a la portada" onClick={() => setModalSalirPortada(true)} />
                <span className="qq-tablero-badge" style={{ marginBottom: 0 }}>
                  Reparto · {idx + 1}/{e.jugadores.length}
                </span>
              </div>
              <div style={{ fontSize: '3.2rem', margin: '0.4rem 0' }}>📱</div>
              <h1 className="title">
                Pasa el dispositivo a <span className="hl">{j.nombre}</span>
              </h1>
              <p className="hint">Que nadie más mire la pantalla: vas a descubrir tu rol secreto.</p>
              <button className="big full qq-btn-principal" onClick={() => setPaso('ver')}>
                <Icon name="check" size={22} strokeWidth={2.5} /> Soy {j.nombre}, mostrar mi rol
              </button>
            </div>
          </section>
        ) : (
          <section className="game">
            <div className="panel qq-menu-panel">
              <div className="qq-card-top" style={{ marginBottom: '0.8rem' }}>
                <BotonVolver texto="Volver a la portada" onClick={() => setModalSalirPortada(true)} />
                <span className="qq-tablero-badge" style={{ marginBottom: 0 }}>
                  Jugador {idx + 1} de {e.jugadores.length}
                </span>
              </div>
              <TarjetaRol e={e} id={idx} />
              <button className="big full qq-btn-principal" onClick={siguienteReparto}>
                <Icon name="check" size={22} strokeWidth={2.5} />{' '}
                {idx + 1 >= e.jugadores.length ? 'He memorizado mi rol: ¡que caiga la noche!' : 'He memorizado mi rol'}
              </button>
            </div>
          </section>
        )}
      </div>
    );
  }

  /* 4. NOCHE */
  if (fase === 'noche' && e && e.noche) {
    return (
      <div className={`lb-contenedor lb-escena-noche ${enPartidaActiva ? 'qq-en-partida' : ''}`}>
        {modalConfirmarSalida}
        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '0.5rem' }}>
          <button
            type="button"
            className="qq-link-volver"
            style={{ color: '#e0e7ff' }}
            onClick={() => setModalSalirPortada(true)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span style={{ color: '#e0e7ff' }}>Volver a la portada</span>
          </button>
        </div>

        {paso === 'intro' && (
          <section className="game center">
            <span className="lb-luna">
              <Icon name="moon" size={64} strokeWidth={1.5} />
            </span>
            <p className="categoria">
              <Icon name="moon" size={16} />
              Noche {e.ronda}
            </p>
            <h1 className="title">Cae la noche sobre la aldea</h1>
            {e.noche.evento && (
              <p className="lb-evento grande">
                <Icon name={EVENTOS[e.noche.evento].icono} size={20} />{' '}
                <strong>{EVENTOS[e.noche.evento].nombre}.</strong> {EVENTOS[e.noche.evento].texto}
              </p>
            )}
            <p className="hint">
              El dispositivo pasará por todos los jugadores vivos, uno a uno. Cuando no sea tu turno, no mires la pantalla.
            </p>
            <button className="big full qq-btn-principal" onClick={() => setPaso('pasar')}>
              Empezar la noche
            </button>
          </section>
        )}
        {paso === 'pasar' && turnoActual != null && (
          <section className="game center">
            <p className="categoria">
              <Icon name="lock" size={16} />
              Noche {e.ronda} · Turno {e.noche.idx + 1}/{e.noche.orden.length}
            </p>
            <h1 className="title">
              Pasa el dispositivo a <span className="hl">{e.jugadores[turnoActual].nombre}</span>
            </h1>
            <p className="hint">No mires la pantalla si no es tu turno.</p>
            <button className="big full qq-btn-principal" onClick={empezarTurno}>
              <Icon name="check" size={22} strokeWidth={2.5} /> Soy {e.jugadores[turnoActual].nombre}, ¡estoy listo!
            </button>
          </section>
        )}
        {paso === 'turno' && turnoActual != null && (
          <TurnoNoche key={`${e.ronda}-${e.noche.idx}`} e={e} id={turnoActual} onTerminar={terminarTurno} />
        )}
        {paso === 'amanece' && (
          <section className="game center">
            <span className="lb-luna">
              <Icon name="sun" size={64} strokeWidth={1.5} />
            </span>
            <h1 className="title">La noche ha terminado</h1>
            <p className="hint">Todos abren los ojos. Entrega el dispositivo a la mesa para ver qué ha ocurrido.</p>
            <button className="big full qq-btn-principal" onClick={amanecer}>
              <Icon name="sun" size={22} /> Amanecer
            </button>
          </section>
        )}
      </div>
    );
  }

  /* 5. ANUNCIO DE MUERTES */
  if (fase === 'anuncio' && e && e.anuncio) {
    const a = e.anuncio;
    const cazador = e.pendientes.length ? e.jugadores[e.pendientes[0]] : null;
    const candidatos = cazador ? vivos(e).filter((x) => x.id !== cazador.id).map((x) => x.id) : [];
    const martirLinchado = a.muertes.some((m) => m.rol === 'martir' && m.causa === 'linchamiento');
    const tipoTitulo = origen === 'noche' ? 'Amanece en la aldea' : 'Veredicto del pueblo';
    return (
      <div className={`lb-contenedor ${enPartidaActiva ? 'qq-en-partida' : ''}`}>
        {modalConfirmarSalida}
        <section className="game">
          <div className="end-card">
            <div className="qq-card-top" style={{ marginBottom: '0.8rem' }}>
              <BotonVolver texto="Volver a la portada" onClick={() => setModalSalirPortada(true)} />
              <span className="qq-tablero-badge" style={{ marginBottom: 0 }}>
                Ronda {e.ronda}
              </span>
            </div>
            <h1 className="title">{tipoTitulo}</h1>
            {a.rebobinada && <p className="reveal">⏳ Ha ocurrido algo raro… el tiempo ha retrocedido. Nadie ha muerto esta noche.</p>}
            {a.muertes.length === 0 && !a.rebobinada && (
              <p className="reveal">{origen === 'noche' ? 'Esta noche no ha muerto nadie.' : 'Nadie ha sido linchado.'}</p>
            )}
            <div className="lb-muertes">
              {a.muertes.map((m) => (
                <div key={m.id} className="lb-muerte" style={{ '--rol': BANDOS[ROLES[m.rol].bando].color }}>
                  <span className="lb-explicado-icono">
                    <Icon name={ROLES[m.rol].icono} size={26} />
                  </span>
                  <div>
                    <strong>{e.jugadores[m.id].nombre}</strong>
                    <p>
                      Era <strong>{ROLES[m.rol].nombre}</strong> ({BANDOS[ROLES[m.rol].bando].nombre}) ·{' '}
                      {CAUSAS_PUBLICAS.includes(m.causa) ? TEXTO_CAUSA[m.causa] : 'ha muerto'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {a.cartas.length > 0 && (
              <div className="lb-cartas">
                <p className="lb-res-titulo">📜 Las cartas selladas del Notario se abren</p>
                {a.cartas.map((c, i) => (
                  <p key={i}>
                    «{c.sobreNombre} {c.veredicto === 'pueblo' ? 'es del Pueblo' : 'NO es del Pueblo'}»
                  </p>
                ))}
                <p className="hint small">El Notario decidía qué escribir: puede ser verdad… o mentira.</p>
              </div>
            )}
            {a.rumor && (
              <p className="reveal">
                🗣 Rumor del pueblo: {a.rumor.texto} <small>(puede ser cierto o falso)</small>
              </p>
            )}
            {a.evento === 'eclipse' && <p className="reveal">🌑 Eclipse: hoy no hay debate, se vota directamente.</p>}
            {martirLinchado && (
              <p className="reveal">🔔 El sacrificio del Mártir protege a la aldea: esta noche los lobos no podrán atacar.</p>
            )}
            {e.victoriasPersonales.map((v) => (
              <p key={v.id} className="reveal">
                💀 {v.texto}
              </p>
            ))}
          </div>

          {origen === 'noche' && !ecoListo && !cazador && a.muertes.length > 0 && e.jugadores.some((x) => x.vivo && x.rol === 'eco') && (
            <div className="panel" style={{ marginTop: '1rem' }}>
              <h3 className="panel-title">
                <Icon name="speech" size={22} /> Un último susurro
              </h3>
              <p className="hint">
                Quien ha muerto esta noche puede dejar un mensaje anónimo para el Eco, sea verdad o mentira.
              </p>
              <textarea
                className="lb-textarea"
                maxLength={200}
                rows={3}
                value={textoEco}
                onChange={(ev) => setTextoEco(ev.target.value)}
                placeholder="Escribe tu mensaje (máx. 200 caracteres)"
              />
              <button
                type="button"
                className="big full qq-btn-principal"
                onClick={() => {
                  setE(dejarMensajeEco(e, textoEco));
                  setEcoListo(true);
                  setTextoEco('');
                }}
              >
                <Icon name="check" size={20} strokeWidth={2.5} /> {textoEco.trim() ? 'Dejar el mensaje' : 'No dejar mensaje'}
              </button>
            </div>
          )}

          {cazador ? (
            <div className="panel" style={{ marginTop: '1rem' }}>
              <h3 className="panel-title">
                <Icon name="target" size={22} /> {cazador.nombre} era el Cazador: ¡dispara!
              </h3>
              <p className="hint">Con su último aliento elige a quién se lleva por delante.</p>
              {candidatos.length ? (
                <ElegirUno e={e} opciones={candidatos} texto="Disparar" onConfirmar={(t) => dispararCazador(cazador.id, t)} />
              ) : (
                <button className="big full" onClick={() => dispararCazador(cazador.id, null)}>
                  No queda nadie a quien disparar
                </button>
              )}
            </div>
          ) : (
            !(origen === 'noche' && !ecoListo && a.muertes.length > 0 && e.jugadores.some((x) => x.vivo && x.rol === 'eco')) && (
              <button className="big full qq-btn-principal" onClick={continuarTrasAnuncio}>
                <Icon name="forward" size={22} /> Continuar
              </button>
            )
          )}
        </section>
      </div>
    );
  }

  /* 5b. OBJETO MISTERIOSO */
  if (fase === 'objeto' && e && objetoDia) {
    const o = OBJETOS[objetoDia.tipo];
    const candidatos = vivos(e).filter((j) => !j.estado.objeto || j.id === objetoDia.dueno);
    return (
      <div className={`lb-contenedor ${enPartidaActiva ? 'qq-en-partida' : ''}`}>
        {modalConfirmarSalida}
        <section className="game center">
          <div className="panel qq-menu-panel">
            <div className="qq-card-top">
              <BotonVolver texto="Volver a la portada" onClick={() => setModalSalirPortada(true)} />
              <span className="qq-tablero-badge" style={{ marginBottom: 0 }}>
                Objeto misterioso
              </span>
            </div>
            <div className="qq-hero-icono">
              <Icon name={o.icono} size={42} strokeWidth={1.6} />
            </div>
            <h1 className="title">¡Ha aparecido: {o.nombre}!</h1>
            <p className="hint">{o.texto}</p>
            {objetoDia.dueno == null ? (
              <>
                <p className="hint">
                  El primero que lo reclame se lo queda: <strong>¡pulsad vuestro nombre!</strong>
                </p>
                <div className="names-grid">
                  {candidatos.map((j) => (
                    <button key={j.id} type="button" className="secondary" onClick={() => reclamar(j.id)}>
                      {j.nombre}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <p className="reveal">
                  🎒 {e.jugadores[objetoDia.dueno].nombre} se ha quedado con el objeto. Lo verá en su ficha de rol y en su turno de noche.
                </p>
                <button className="big full qq-btn-principal" onClick={() => irADebate(e)}>
                  <Icon name="forward" size={22} /> Continuar
                </button>
              </>
            )}
          </div>
        </section>
      </div>
    );
  }

  /* 6. DEBATE */
  if (fase === 'debate' && e) {
    const vivosLista = vivos(e);
    const muertos = e.jugadores.filter((j) => !j.vivo);
    const mm = String(Math.floor(segundos / 60)).padStart(2, '0');
    const ss = String(segundos % 60).padStart(2, '0');
    return (
      <div className={`lb-contenedor ${enPartidaActiva ? 'qq-en-partida' : ''}`}>
        {modalConfirmarSalida}
        <section className="game">
          <div className="panel center qq-menu-panel">
            <div className="qq-card-top">
              <BotonVolver texto="Volver a la portada" onClick={() => setModalSalirPortada(true)} />
              <span className="qq-tablero-badge" style={{ marginBottom: 0 }}>
                Día {e.ronda} · {vivosLista.length} vivos
              </span>
            </div>

            <h1 className="title">Debate en la plaza</h1>
            {e.modDia && (
              <p className="lb-evento">
                <Icon name="landmark" size={18} /> <strong>{MODIFICADORES[e.modDia].nombre}.</strong> {MODIFICADORES[e.modDia].texto}
              </p>
            )}
            {e.noche?.evento === 'eclipse' ? (
              <p className="lb-evento grande">
                <Icon name="sun" size={20} /> <strong>Eclipse.</strong> {EVENTOS.eclipse.texto}
              </p>
            ) : minutos > 0 ? (
              <>
                <div className="timer">
                  <div className={`timer-bar ${segundos <= 20 ? 'low' : ''}`} style={{ width: `${(segundos / (minutos * 60)) * 100}%` }} />
                </div>
                <p className="timer-text">
                  <Icon name="clock" size={18} />
                  {mm}:{ss}
                  {segundos === 0 ? ' · ¡Tiempo!' : ''}
                </p>
              </>
            ) : (
              <p className="hint">Debatid todo lo que queráis. Cuando estéis listos, pasad a la votación.</p>
            )}
            <p className="hint">¿Quién es el lobo? Acusad, defendeos y buscad contradicciones.</p>
          </div>

          <div className="panel" style={{ marginTop: '1rem' }}>
            <h3 className="panel-title">
              <Icon name="users" size={20} /> En la aldea
            </h3>
            <div className="lb-vivos">
              {vivosLista.map((j) => (
                <span key={j.id} className="lb-vivo">
                  {j.nombre}
                </span>
              ))}
            </div>
            {muertos.length > 0 && (
              <>
                <p className="field-label">Eliminados</p>
                <div className="lb-vivos">
                  {muertos.map((j) => (
                    <span key={j.id} className="lb-vivo muerto">
                      {j.nombre} · {ROLES[rolRevelado(e, j.id)].nombre}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="actions">
            <button className="secondary" onClick={() => setModalConsulta(true)}>
              <Icon name="eye" size={20} /> Consultar mi rol
            </button>
            <button className="big full qq-btn-principal" onClick={() => iniciarVotacion(false)}>
              <Icon name="landmark" size={22} /> Pasar a la votación
            </button>
          </div>
        </section>
        {modalConsulta && <ConsultarRol e={e} onCerrar={() => setModalConsulta(false)} />}
      </div>
    );
  }

  /* 7. VOTACIÓN */
  if (fase === 'votacion' && e && vot) {
    if (paso === 'repite') {
      return (
        <div className={`lb-contenedor ${enPartidaActiva ? 'qq-en-partida' : ''}`}>
          {modalConfirmarSalida}
          <section className="game center">
            <div className="panel qq-menu-panel">
              <div className="qq-card-top">
                <BotonVolver texto="Volver a la portada" onClick={() => setModalSalirPortada(true)} />
              </div>
              <div className="qq-hero-icono">
                <Icon name="landmark" size={42} strokeWidth={1.6} />
              </div>
              <h1 className="title">¡Veredicto invocado!</h1>
              <p className="hint">
                Alguien ha invocado el veredicto del Juez Corrupto: <strong>se anula la votación y se repite</strong>. Si la segunda señala al mismo jugador, el Juez también pagará con su vida.
              </p>
              <button
                className="big full qq-btn-principal"
                onClick={() => {
                  setVot({
                    ...vot,
                    orden: barajar(vivos(e).map((j) => j.id)),
                    i: 0,
                    votos: {},
                    segunda: true,
                    robado: null
                  });
                  setPaso('pasar');
                }}
              >
                Repetir la votación
              </button>
            </div>
          </section>
        </div>
      );
    }
    const votante = vot.orden[vot.i];
    const robadoDe =
      !vot.segunda && e.flags.ladron && e.flags.ladron.ladron === votante && e.jugadores[e.flags.ladron.objetivo].vivo
        ? e.flags.ladron.objetivo
        : null;
    return (
      <div className={`lb-contenedor ${enPartidaActiva ? 'qq-en-partida' : ''}`}>
        {modalConfirmarSalida}
        {paso === 'pasar' ? (
          <section className="game center">
            <div className="panel qq-menu-panel">
              <div className="qq-card-top">
                <BotonVolver texto="Volver a la portada" onClick={() => setModalSalirPortada(true)} />
                <span className="qq-tablero-badge" style={{ marginBottom: 0 }}>
                  {vot.segunda ? 'Votación repetida' : 'Votación'} · {vot.i + 1}/{vot.orden.length}
                </span>
              </div>
              <div style={{ fontSize: '3.2rem', margin: '0.4rem 0' }}>🗳️</div>
              <h1 className="title">
                Pasa el dispositivo a <span className="hl">{e.jugadores[votante].nombre}</span>
              </h1>
              {e.modDia && !vot.segunda && (
                <p className="lb-evento">
                  <Icon name="landmark" size={18} /> <strong>{MODIFICADORES[e.modDia].nombre}:</strong> {MODIFICADORES[e.modDia].texto}
                </p>
              )}
              <p className="hint">Vota en secreto: nadie más debe ver tu elección.</p>
              <button className="big full qq-btn-principal" onClick={() => setPaso('votar')}>
                <Icon name="check" size={22} strokeWidth={2.5} /> Soy {e.jugadores[votante].nombre}, ¡estoy listo!
              </button>
              <button className="secondary full" style={{ marginTop: '.8rem' }} onClick={() => setModalConsulta(true)}>
                <Icon name="eye" size={18} /> Consultar mi rol
              </button>
              {modalConsulta && <ConsultarRol e={e} onCerrar={() => setModalConsulta(false)} />}
            </div>
          </section>
        ) : (
          <VotoTurno
            key={`${vot.segunda}-${vot.i}`}
            e={e}
            id={votante}
            robadoDe={robadoDe}
            segunda={vot.segunda}
            onVotar={registrarVoto}
            onSalirPortada={() => setModalSalirPortada(true)}
          />
        )}
      </div>
    );
  }

  /* 8. RESULTADO DE LA VOTACIÓN */
  if (fase === 'resultado' && e && res) {
    const todos = vivos(e);
    return (
      <div className={`lb-contenedor ${enPartidaActiva ? 'qq-en-partida' : ''}`}>
        {modalConfirmarSalida}
        <section className="game">
          <div className="end-card">
            <div className="qq-card-top" style={{ marginBottom: '0.8rem' }}>
              <BotonVolver texto="Volver a la portada" onClick={() => setModalSalirPortada(true)} />
              <span className="qq-tablero-badge" style={{ marginBottom: 0 }}>
                Ronda {e.ronda}
              </span>
            </div>
            <h1 className="title">Recuento de votos</h1>
            <p className="final-score">
              {res.fichaDe != null
                ? 'La ficha de favor ha anulado la sentencia'
                : res.anuladaAbstencion
                  ? `Hay más abstenciones (${res.abstenciones}) que votos contra ${e.jugadores[res.empatados[0]]?.nombre ?? 'el más votado'} (${res.max}): no hay linchamiento`
                  : res.victima == null
                    ? res.max === 0
                      ? 'Nadie ha recibido votos: no hay linchamiento'
                      : `Empate entre ${res.empatados.map((i) => e.jugadores[i].nombre).join(' y ')}: no hay linchamiento`
                    : `El pueblo señala a ${e.jugadores[res.victima].nombre} (${res.max} ${res.max === 1 ? 'voto' : 'votos'})`}
            </p>
            {res.fichaDe != null && (
              <p className="reveal">🪙 Una ficha de favor se ha gastado: {e.jugadores[res.fichaDe].nombre} se libra del linchamiento.</p>
            )}
            {res.modif && <p className="hint small">Modificador de hoy: {MODIFICADORES[res.modif].nombre}.</p>}
            {res.identico && <p className="reveal">⚖ El resultado coincide con el primero: el Juez Corrupto paga con su vida.</p>}
            <div className="scoreboard">
              {[...todos]
                .sort((a, b) => res.conteo[b.id] - res.conteo[a.id])
                .map((j) => (
                  <div key={j.id} className={`score-row ${j.id === res.victima ? 'first' : ''}`}>
                    <span className="score-name">{j.nombre}</span>
                    <span className="score-pts">
                      {res.conteo[j.id]} {res.conteo[j.id] === 1 ? 'voto' : 'votos'}
                    </span>
                  </div>
                ))}
              {res.abstenciones > 0 && (
                <div className="score-row">
                  <span className="score-name">Abstenciones</span>
                  <span className="score-pts">{res.abstenciones}</span>
                </div>
              )}
            </div>
          </div>
          {e.config.votosPublicos && (
            <div className="panel reveal-panel">
              <h3 className="reveal-title">
                <Icon name="eye" size={20} /> Desglose de votos
              </h3>
              <div className="reveal-list">
                {todos.map((j) => (
                  <div key={j.id} className="reveal-row">
                    <span className="reveal-name">{j.nombre}</span>
                    <span className="reveal-card">
                      {res.votos[j.id] != null ? `→ ${e.jugadores[res.votos[j.id]].nombre}` : 'se abstuvo'}
                    </span>
                  </div>
                ))}
              </div>
              <p className="hint small center">Si tu voto no coincide con el que emitiste… alguien te lo ha robado.</p>
            </div>
          )}
          <button className="big full qq-btn-principal" onClick={aplicarResultado}>
            <Icon name="forward" size={22} /> {res.victima == null ? 'Continuar' : 'Ejecutar la sentencia'}
          </button>
        </section>
      </div>
    );
  }

  /* 9. FIN */
  if (fase === 'fin' && e && e.ganador) {
    const g = e.ganador;
    const titulo = {
      lobos: 'Ganan los Lobos',
      pueblo: 'Gana el Pueblo',
      solitario: 'Gana el Solitario',
      amantes: 'Ganan los Enamorados',
      epidemia: 'Gana la Epidemia',
      nadie: 'Nadie gana'
    }[g.bando];
    const icono = {
      lobos: 'paw',
      pueblo: 'home',
      solitario: 'flame',
      amantes: 'heart',
      epidemia: 'flask',
      nadie: 'skull'
    }[g.bando];
    return (
      <div className={`lb-contenedor ${enPartidaActiva ? 'qq-en-partida' : ''}`}>
        {modalConfirmarSalida}
        <section className="game">
          <div className="end-card">
            <span className="end-icon">
              <Icon name={icono} size={44} />
            </span>
            <p className="categoria">
              <Icon name="flagFinish" size={16} />
              Fin de la partida · ronda {e.ronda}
            </p>
            <h1 className="title">{titulo}</h1>
            <p className="reveal">{g.texto}</p>
            {e.victoriasPersonales.map((v) => (
              <p key={v.id} className="reveal">
                💀 {v.texto}
              </p>
            ))}
          </div>
          <div className="panel reveal-panel">
            <h3 className="reveal-title">
              <Icon name="eye" size={20} /> Todos los roles
            </h3>
            <div className="reveal-list">
              {e.jugadores.map((j) => {
                const cambio = j.rolInicial !== j.rol;
                const gano = g.ids.includes(j.id) || e.victoriasPersonales.some((v) => v.id === j.id);
                return (
                  <div key={j.id} className="reveal-row lb-final-fila" style={{ '--rol': BANDOS[ROLES[j.rol].bando].color }}>
                    <span className="reveal-name">
                      {gano ? '🏆 ' : ''}
                      {j.nombre}
                      {!j.vivo ? ' ✝' : ''}
                    </span>
                    <span className="reveal-card">
                      {cambio ? `${ROLES[j.rolInicial].nombre} → ${ROLES[j.rol].nombre}` : ROLES[j.rol].nombre}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="actions">
            <button className="big full qq-btn-principal" onClick={jugarOtraVez}>
              <Icon name="refresh" size={22} /> Otra partida (mismos jugadores)
            </button>
            <button className="secondary" onClick={nuevaConfiguracion}>
              Cambiar jugadores
            </button>
            <button className="secondary danger" onClick={handleSalirAPortada}>
              Volver a la portada
            </button>
          </div>
        </section>
      </div>
    );
  }

  return null;
}