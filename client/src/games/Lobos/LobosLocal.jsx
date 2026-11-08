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
import { SelectorJugadores, BloqueConfig } from '../../components/MenuJuego.jsx';
import { CabeceraLobos, Aldea, PasaDispositivo, ModalSalirLobos, FINAL } from './Escena.jsx';

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
function VotoTurno({ e, id, robadoDe, segunda, onVotar }) {
  const [paso, setPaso] = useState('propio');
  const [propio, setPropio] = useState(undefined);
  const [verRol, setVerRol] = useState(false);
  const j = e.jugadores[id];
  const opciones = vivos(e)
    .map((x) => x.id)
    .filter((x) => x !== id);
  const abstener = (cb) => <BotonAbstenerse onClick={() => cb(null)} />;
  return (
    <>
      {verRol && <ConsultarRol e={e} idFijo={id} onCerrar={() => setVerRol(false)} />}
      <div className="panel lbp-voto">
        <div className="lbp-voto-cab">
          <span className="lbp-etiqueta">{paso === 'propio' ? `Vota ${j.nombre}` : 'Voto robado'}</span>
          <button type="button" className="lbp-mirol claro" onClick={() => setVerRol(true)}>
            <Icon name="eye" size={14} /> Mi rol
          </button>
        </div>
        {paso === 'propio' ? (
          <>
            <p className="hint">{segunda ? 'Se repite la votación. ' : ''}Elige a quién linchar. Tu voto es secreto hasta el recuento.</p>
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
            <div className="lb-haz">
              <p>
                Como <strong>Ladrón de Voces</strong>, emites también el voto de <strong>{e.jugadores[robadoDe].nombre}</strong>. No lo sabrá hasta el recuento.
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
    </>
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


  const modalConfirmarSalida = modalSalirPortada && (
    <ModalSalirLobos
      texto="Se cancelará la partida actual y volverás a la portada."
      onSeguir={() => setModalSalirPortada(false)}
      onSalir={handleSalirAPortada}
    />
  );

  const salir = () => setModalSalirPortada(true);
  const vivosN = e ? vivos(e).length : null;
  const cabecera = (momento, etiqueta, titulo, extra = {}) => (
    <CabeceraLobos
      momento={momento}
      etiqueta={etiqueta}
      titulo={titulo}
      vivos={vivosN}
      total={e?.jugadores.length}
      onSalir={salir}
      {...extra}
    />
  );
  const aldea = (compacta = false) => e && (
    <Aldea
      compacta={compacta}
      jugadores={e.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, vivo: j.vivo, rolRevelado: j.vivo ? null : rolRevelado(e, j.id) }))}
    />
  );

  /* 1. SETUP DE JUGADORES */
  if (fase === 'setup') {
    return (
      <div className="lb-contenedor">
        <SelectorJugadores
          onVolver={onVolver || onSalir}
          onAyuda={onAbrirAyuda}
          min={MIN_JUGADORES}
          max={MAX_JUGADORES}
          numJugadores={numJugadores}
          onCambiarNum={actualizarCantidadJugadores}
          nombres={nombres}
          onNombre={(i, valor) => setNombres((p) => p.map((x, k) => (k === i ? valor : x)))}
          onEmpezar={irAComposicion}
          textoBoton="Elegir los roles"
          iconoBoton="moon"
          subtitulo={`De ${MIN_JUGADORES} a ${MAX_JUGADORES} jugadores (lo ideal, de 8 a 12). Escribid los nombres en el orden en que estáis sentados en círculo.`}
          maxLength={30}
        >
          <BloqueConfig titulo="Tiempo de debate diurno" style={{ marginTop: '1.2rem' }}>
            <div className="lbp-pildoras">
              {[[0, 'Sin límite'], [1, '1 min'], [2, '2 min'], [3, '3 min'], [5, '5 min']].map(([m, t]) => (
                <button key={m} type="button" className={`lbp-pildora${minutos === m ? ' activo' : ''}`} onClick={() => setMinutos(m)}>
                  {t}
                </button>
              ))}
            </div>
            <label className="lb-check" style={{ marginTop: '0.9rem' }}>
              <input type="checkbox" checked={votosPublicos} onChange={(ev) => setVotosPublicos(ev.target.checked)} />
              <span>Mostrar quién votó a quién tras el recuento</span>
            </label>
          </BloqueConfig>
        </SelectorJugadores>
      </div>
    );
  }

  /* 2. COMPOSICIÓN DE ROLES */
  if (fase === 'composicion') {
    const bloqueado = validacion.errores.length > 0;
    return (
      <div className="lb-contenedor">
        <section className="game qq-pantalla">
          <div className="panel qq-menu-panel">
            <div className="qq-card-top">
              <BotonVolver onClick={() => setFase('setup')} />
              <button type="button" className="qq-btn-ayuda" onClick={onAbrirAyuda} title="Cómo jugar" aria-label="Cómo jugar">?</button>
            </div>
            <div className="qq-section-header">
              <h2 className="qq-section-title">Elige los roles</h2>
              <p className="hint">{n} jugadores. Elige una combinación recomendada para tu mesa o diseña la tuya.</p>
            </div>
            <SelectorRoles n={n} sel={sel} setSel={setSel} mec={mec} setMec={setMec} />
            <button type="button" className="big full qq-btn-principal" style={{ marginTop: '1.2rem' }} disabled={bloqueado} onClick={empezarPartida}>
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
      <div className="lb-contenedor qq-en-partida">
        {modalConfirmarSalida}
        <section className="game lbp-escena lb-partida noche">
          {cabecera('noche', 'Reparto de roles', `Jugador ${idx + 1} de ${e.jugadores.length}`, { vivos: null })}
          {paso === 'pasar' ? (
            <PasaDispositivo
              id={j.id}
              nombre={j.nombre}
              texto="Que nadie más mire la pantalla: vas a descubrir tu rol secreto."
            >
              <button className="lbp-boton grande" onClick={() => setPaso('ver')}>
                <Icon name="eye" size={22} /> Soy {j.nombre}, mostrar mi rol
              </button>
            </PasaDispositivo>
          ) : (
            <>
              <TarjetaRol e={e} id={idx} />
              <div className="lbp-barra">
                <button className="lbp-boton grande" onClick={siguienteReparto}>
                  <Icon name="check" size={22} strokeWidth={2.5} />{' '}
                  {idx + 1 >= e.jugadores.length ? 'Memorizado: ¡que caiga la noche!' : 'He memorizado mi rol'}
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    );
  }

  /* 4. NOCHE */
  if (fase === 'noche' && e && e.noche) {
    const turnoJ = turnoActual != null ? e.jugadores[turnoActual] : null;
    return (
      <div className="lb-contenedor qq-en-partida">
        {modalConfirmarSalida}
        <section className="game lbp-escena lb-partida noche">
          {paso !== 'turno' && cabecera('noche', 'Cae la noche', `Noche ${e.ronda}`, {
            chips: [paso === 'pasar' ? <><Icon name="lock" size={14} /> Turno {e.noche.idx + 1}/{e.noche.orden.length}</> : null]
          })}

          {paso === 'intro' && (
            <div className="lbp-tarjeta lbp-noche-intro">
              <span className="lbp-luna-grande" aria-hidden="true" />
              <h2 className="lbp-titulo">Cae la noche sobre la aldea</h2>
              {e.noche.evento && (
                <p className="lb-evento grande">
                  <Icon name={EVENTOS[e.noche.evento].icono} size={20} />{' '}
                  <span><strong>{EVENTOS[e.noche.evento].nombre}.</strong> {EVENTOS[e.noche.evento].texto}</span>
                </p>
              )}
              <p className="lbp-texto">
                El móvil pasará por todos los jugadores vivos, uno a uno. Todos tardan lo mismo para no delatar quién tiene poderes. Cuando no sea tu turno, cierra los ojos.
              </p>
              <button className="lbp-boton grande" onClick={() => setPaso('pasar')}>
                <Icon name="moon" size={22} /> Empezar la noche
              </button>
            </div>
          )}
          {paso === 'pasar' && turnoJ && (
            <PasaDispositivo id={turnoJ.id} nombre={turnoJ.nombre} texto="No mires la pantalla si no es tu turno.">
              <button className="lbp-boton grande" onClick={empezarTurno}>
                <Icon name="check" size={22} strokeWidth={2.5} /> Soy {turnoJ.nombre}, ¡estoy listo!
              </button>
            </PasaDispositivo>
          )}
          {paso === 'turno' && turnoActual != null && (
            <>
              {cabecera('noche', `Noche ${e.ronda} · turno ${e.noche.idx + 1}/${e.noche.orden.length}`, null)}
              <TurnoNoche key={`${e.ronda}-${e.noche.idx}`} e={e} id={turnoActual} onTerminar={terminarTurno} />
            </>
          )}
          {paso === 'amanece' && (
            <div className="lbp-tarjeta lbp-noche-intro">
              <span className="lbp-sol-grande" aria-hidden="true" />
              <h2 className="lbp-titulo">La noche ha terminado</h2>
              <p className="lbp-texto">Todos abren los ojos. Dejad el móvil en el centro de la mesa para ver qué ha ocurrido.</p>
              <button className="lbp-boton grande" onClick={amanecer}>
                <Icon name="sun" size={22} /> Amanecer
              </button>
            </div>
          )}
        </section>
      </div>
    );
  }

  /* 5. ANUNCIO DE MUERTES */
  if (fase === 'anuncio' && e && e.anuncio) {
    const a = e.anuncio;
    const cazador = e.pendientes.length ? e.jugadores[e.pendientes[0]] : null;
    const candidatos = cazador ? vivos(e).filter((x) => x.id !== cazador.id).map((x) => x.id) : [];
    const martirLinchado = a.muertes.some((m) => m.rol === 'martir' && m.causa === 'linchamiento');
    const hayEco = origen === 'noche' && !ecoListo && a.muertes.length > 0 && e.jugadores.some((x) => x.vivo && x.rol === 'eco');
    return (
      <div className="lb-contenedor qq-en-partida">
        {modalConfirmarSalida}
        <section className="game lbp-escena lb-partida dia">
          {cabecera('dia', `Día ${e.ronda}`, origen === 'noche' ? 'Amanece en la aldea' : 'Veredicto del pueblo')}
          <div className="end-card">
            {a.rebobinada && <p className="reveal">⏳ Ha ocurrido algo raro… el tiempo ha retrocedido. Nadie ha muerto esta noche.</p>}
            {a.muertes.length === 0 && !a.rebobinada && (
              <p className="lbp-nadie">
                <span aria-hidden="true">{origen === 'noche' ? '🌤️' : '🕊️'}</span>
                {origen === 'noche' ? 'Esta noche no ha muerto nadie.' : 'Nadie ha sido linchado.'}
              </p>
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
                  <p key={i}>«{c.sobreNombre} {c.veredicto === 'pueblo' ? 'es del Pueblo' : 'NO es del Pueblo'}»</p>
                ))}
                <p className="hint small">El Notario decidía qué escribir: puede ser verdad… o mentira.</p>
              </div>
            )}
            {a.rumor && <p className="reveal">🗣 Rumor del pueblo: {a.rumor.texto} <small>(puede ser cierto o falso)</small></p>}
            {a.evento === 'eclipse' && <p className="reveal">🌑 Eclipse: hoy no hay debate, se vota directamente.</p>}
            {martirLinchado && <p className="reveal">🔔 El sacrificio del Mártir protege a la aldea: esta noche los lobos no podrán atacar.</p>}
            {e.victoriasPersonales.map((v) => <p key={v.id} className="reveal">💀 {v.texto}</p>)}
          </div>

          {hayEco && !cazador && (
            <div className="panel">
              <h3 className="panel-title"><Icon name="speech" size={22} /> Un último susurro</h3>
              <p className="hint">Quien ha muerto esta noche puede dejar un mensaje anónimo para el Eco, sea verdad o mentira.</p>
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
                className="lbp-boton"
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
            <div className="panel">
              <h3 className="panel-title"><Icon name="target" size={22} /> {cazador.nombre} era el Cazador: ¡dispara!</h3>
              <p className="hint">Con su último aliento elige a quién se lleva por delante.</p>
              {candidatos.length ? (
                <ElegirUno e={e} opciones={candidatos} texto="Disparar" onConfirmar={(t) => dispararCazador(cazador.id, t)} />
              ) : (
                <button className="lbp-boton" onClick={() => dispararCazador(cazador.id, null)}>No queda nadie a quien disparar</button>
              )}
            </div>
          ) : (
            !hayEco && (
              <div className="lbp-barra estatica">
                <button className="lbp-boton grande" onClick={continuarTrasAnuncio}>
                  <Icon name="forward" size={22} /> Continuar
                </button>
              </div>
            )
          )}
          {aldea()}
        </section>
      </div>
    );
  }

  /* 5b. OBJETO MISTERIOSO */
  if (fase === 'objeto' && e && objetoDia) {
    const o = OBJETOS[objetoDia.tipo];
    const candidatos = vivos(e).filter((j) => !j.estado.objeto || j.id === objetoDia.dueno);
    return (
      <div className="lb-contenedor qq-en-partida">
        {modalConfirmarSalida}
        <section className="game lbp-escena lb-partida dia">
          {cabecera('dia', `Día ${e.ronda}`, 'Objeto misterioso')}
          <div className="lbp-tarjeta lbp-objeto">
            <span className="lbp-objeto-icono"><Icon name={o.icono} size={44} strokeWidth={1.6} /></span>
            <h2 className="lbp-titulo">¡Ha aparecido: {o.nombre}!</h2>
            <p className="lbp-texto">{o.texto}</p>
            {objetoDia.dueno == null ? (
              <>
                <p className="lbp-texto"><strong>El primero que lo reclame se lo queda: ¡pulsad vuestro nombre!</strong></p>
                <div className="names-grid lb-eleccion">
                  {candidatos.map((j) => (
                    <button key={j.id} type="button" className="secondary lb-op" onClick={() => reclamar(j.id)}>
                      {j.nombre}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <p className="reveal">🎒 {e.jugadores[objetoDia.dueno].nombre} se ha quedado con el objeto. Lo verá en su ficha de rol y en su turno de noche.</p>
                <button className="lbp-boton grande" onClick={() => irADebate(e)}>
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
    const mm = String(Math.floor(segundos / 60)).padStart(2, '0');
    const ss = String(segundos % 60).padStart(2, '0');
    const eclipse = e.noche?.evento === 'eclipse';
    return (
      <div className="lb-contenedor qq-en-partida">
        {modalConfirmarSalida}
        <section className="game lbp-escena lb-partida dia">
          {cabecera('dia', `Día ${e.ronda}`, 'Debate en la plaza')}
          <div className="lbp-tarjeta lbp-debate">
            {e.modDia && (
              <p className="lb-evento">
                <Icon name="landmark" size={18} /> <span><strong>{MODIFICADORES[e.modDia].nombre}.</strong> {MODIFICADORES[e.modDia].texto}</span>
              </p>
            )}
            {eclipse ? (
              <p className="lb-evento grande">
                <Icon name="sun" size={20} /> <span><strong>Eclipse.</strong> {EVENTOS.eclipse.texto}</span>
              </p>
            ) : minutos > 0 ? (
              <div className={`lbp-reloj${segundos <= 20 ? ' critico' : ''}${segundos === 0 ? ' fin' : ''}`}>
                <span className="lbp-reloj-num">{segundos === 0 ? '¡Tiempo!' : `${mm}:${ss}`}</span>
                <div className="lbp-reloj-barra"><span style={{ width: `${(segundos / (minutos * 60)) * 100}%` }} /></div>
              </div>
            ) : (
              <p className="lbp-texto">Debatid todo lo que queráis. Cuando estéis listos, pasad a la votación.</p>
            )}
            <p className="lbp-texto">🐺 ¿Quién es el lobo? Acusad, defendeos y buscad contradicciones.</p>
          </div>
          {aldea()}
          <div className="lbp-barra">
            <button className="lbp-boton grande" onClick={() => iniciarVotacion(false)}>
              <Icon name="landmark" size={22} /> Pasar a la votación
            </button>
            <button className="lbp-enlace" onClick={() => setModalConsulta(true)}>
              <Icon name="eye" size={16} /> Consultar mi rol
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
        <div className="lb-contenedor qq-en-partida">
          {modalConfirmarSalida}
          <section className="game lbp-escena lb-partida dia">
            {cabecera('dia', `Día ${e.ronda}`, '¡Veredicto invocado!')}
            <div className="lbp-tarjeta lbp-objeto">
              <span className="lbp-objeto-icono"><Icon name="landmark" size={44} strokeWidth={1.6} /></span>
              <p className="lbp-texto">
                Alguien ha invocado el veredicto del Juez Corrupto: <strong>se anula la votación y se repite</strong>. Si la segunda señala al mismo jugador, el Juez también pagará con su vida.
              </p>
              <button
                className="lbp-boton grande"
                onClick={() => {
                  setVot({ ...vot, orden: barajar(vivos(e).map((j) => j.id)), i: 0, votos: {}, segunda: true, robado: null });
                  setPaso('pasar');
                }}
              >
                <Icon name="refresh" size={22} /> Repetir la votación
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
      <div className="lb-contenedor qq-en-partida">
        {modalConfirmarSalida}
        <section className="game lbp-escena lb-partida dia">
          {cabecera('dia', `Día ${e.ronda} · voto ${vot.i + 1}/${vot.orden.length}`, vot.segunda ? 'Votación repetida' : 'Votación')}
          {paso === 'pasar' ? (
            <PasaDispositivo id={votante} nombre={e.jugadores[votante].nombre} emoji="🗳️" texto="Vota en secreto: nadie más debe ver tu elección.">
              {e.modDia && !vot.segunda && (
                <p className="lb-evento">
                  <Icon name="landmark" size={18} /> <span><strong>{MODIFICADORES[e.modDia].nombre}:</strong> {MODIFICADORES[e.modDia].texto}</span>
                </p>
              )}
              <button className="lbp-boton grande" onClick={() => setPaso('votar')}>
                <Icon name="check" size={22} strokeWidth={2.5} /> Soy {e.jugadores[votante].nombre}, ¡estoy listo!
              </button>
            </PasaDispositivo>
          ) : (
            <VotoTurno
              key={`${vot.segunda}-${vot.i}`}
              e={e}
              id={votante}
              robadoDe={robadoDe}
              segunda={vot.segunda}
              onVotar={registrarVoto}
            />
          )}
        </section>
      </div>
    );
  }

  /* 8. RESULTADO DE LA VOTACIÓN */
  if (fase === 'resultado' && e && res) {
    const todos = vivos(e);
    return (
      <div className="lb-contenedor qq-en-partida">
        {modalConfirmarSalida}
        <section className="game lbp-escena lb-partida dia">
          {cabecera('dia', `Día ${e.ronda}`, 'Recuento de votos')}
          <div className="end-card">
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
            {res.fichaDe != null && <p className="reveal">🪙 Una ficha de favor se ha gastado: {e.jugadores[res.fichaDe].nombre} se libra del linchamiento.</p>}
            {res.modif && <p className="hint small">Modificador de hoy: {MODIFICADORES[res.modif].nombre}.</p>}
            {res.identico && <p className="reveal">⚖ El resultado coincide con el primero: el Juez Corrupto paga con su vida.</p>}
            <div className="scoreboard">
              {[...todos]
                .sort((a, b) => res.conteo[b.id] - res.conteo[a.id])
                .map((j) => (
                  <div key={j.id} className={`score-row ${j.id === res.victima ? 'first' : ''}`}>
                    <span className="score-name">{j.nombre}</span>
                    <span className="score-pts">{res.conteo[j.id]} {res.conteo[j.id] === 1 ? 'voto' : 'votos'}</span>
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
              <h3 className="reveal-title"><Icon name="eye" size={20} /> Desglose de votos</h3>
              <div className="reveal-list">
                {todos.map((j) => (
                  <div key={j.id} className="reveal-row">
                    <span className="reveal-name">{j.nombre}</span>
                    <span className="reveal-card">{res.votos[j.id] != null ? `→ ${e.jugadores[res.votos[j.id]].nombre}` : 'se abstuvo'}</span>
                  </div>
                ))}
              </div>
              <p className="hint small center">Si tu voto no coincide con el que emitiste… alguien te lo ha robado.</p>
            </div>
          )}
          <div className="lbp-barra estatica">
            <button className="lbp-boton grande" onClick={aplicarResultado}>
              <Icon name="forward" size={22} /> {res.victima == null ? 'Continuar' : 'Ejecutar la sentencia'}
            </button>
          </div>
        </section>
      </div>
    );
  }

  /* 9. FIN */
  if (fase === 'fin' && e && e.ganador) {
    const g = e.ganador;
    const final = FINAL[g.bando] || FINAL.nadie;
    return (
      <div className="lb-contenedor qq-en-partida">
        {modalConfirmarSalida}
        <section className="game lbp-escena lb-partida fin">
          {cabecera('fin', `Fin de la partida · ronda ${e.ronda}`, final.titulo)}
          <div className="end-card">
            <span className="lbp-final-emoji" aria-hidden="true">{final.emoji}</span>
            <p className="reveal">{g.texto}</p>
            {e.victoriasPersonales.map((v) => <p key={v.id} className="reveal">💀 {v.texto}</p>)}
          </div>
          <div className="panel reveal-panel">
            <h3 className="reveal-title"><Icon name="eye" size={20} /> Todos los roles</h3>
            <div className="reveal-list">
              {e.jugadores.map((j) => {
                const cambio = j.rolInicial !== j.rol;
                const gano = g.ids.includes(j.id) || e.victoriasPersonales.some((v) => v.id === j.id);
                return (
                  <div key={j.id} className="reveal-row lb-final-fila" style={{ '--rol': BANDOS[ROLES[j.rol].bando].color }}>
                    <span className="reveal-name">{gano ? '🏆 ' : ''}{j.nombre}{!j.vivo ? ' ✝' : ''}</span>
                    <span className="reveal-card">{cambio ? `${ROLES[j.rolInicial].nombre} → ${ROLES[j.rol].nombre}` : ROLES[j.rol].nombre}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="lbp-barra estatica">
            <button className="lbp-boton grande" onClick={jugarOtraVez}>
              <Icon name="refresh" size={22} /> Otra partida (mismos jugadores)
            </button>
            <button className="lbp-enlace" onClick={nuevaConfiguracion}>
              <Icon name="users" size={16} /> Cambiar jugadores
            </button>
            <button className="lbp-enlace" onClick={handleSalirAPortada}>
              <Icon name="home" size={16} /> Volver a la portada
            </button>
          </div>
        </section>
      </div>
    );
  }

  return null;
}