import { useEffect, useMemo, useState } from 'react';
import './Lobos.css';
import Icon from '../../components/Icon.jsx';
import GameIntro from '../../components/GameIntro.jsx';
import { ROLES, BANDOS, ORDEN_ROLES, CLASICOS } from './roles.js';
import {
  crearPartida, iniciarNoche, fijarVictima, registrarAccion, avanzarTurno, limpiarAvisos, resolverNoche, disparar,
  contarVotos, juezActivo, gastarJuez, aplicarVotacion, siguienteRonda, comprobarVictoria, barajar, vivos, TEXTO_CAUSA,
  CAUSAS_PUBLICAS, EVENTOS, OBJETOS, MODIFICADORES, MEC_NINGUNA, MEC_TODAS, generarModDia, convertirCamaleon, aplicarFicha,
  sortearObjeto, reclamarObjeto, dejarMensajeEco, rolRevelado
} from './engine.js';
import {
  TIPOS, MIN_JUGADORES, MAX_JUGADORES, componer, validar, aRecuento, deRecuento, complejidadTotal
} from './composiciones.js';
import { simularComposicion } from './simulacion.js';
import TarjetaRol, { ConsultarRol } from './TarjetaRol.jsx';
import TurnoNoche, { ElegirUno } from './TurnoNoche.jsx';
import SelectorRoles, { selInicial, rolesDeSel } from './SelectorRoles.jsx';

const nombresPorDefecto = (n) => Array.from({ length: n }, (_, i) => `Jugador ${i + 1}`);

// Los nombres identifican a cada jugador: no pueden repetirse
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

/* ───────── Voto de un jugador (con voto robado si procede) ───────── */
function VotoTurno({ e, id, robadoDe, segunda, onVotar }) {
  const [paso, setPaso] = useState('propio');
  const [propio, setPropio] = useState(undefined);
  const [verRol, setVerRol] = useState(false);
  const j = e.jugadores[id];
  const opciones = vivos(e).map((x) => x.id).filter((x) => x !== id);
  const abstener = (cb) => (
    <button type="button" className="secondary full" style={{ marginTop: '.7rem' }} onClick={() => cb(null)}>Me abstengo</button>
  );
  return (
    <section className="game">
      <div className="hud">
        <span className="chip"><Icon name="users" size={18} />{j.nombre}</span>
        <button type="button" className="secondary lb-mirol" onClick={() => setVerRol(true)}><Icon name="eye" size={18} /> Mi rol</button>
      </div>
      {verRol && <ConsultarRol e={e} idFijo={id} onCerrar={() => setVerRol(false)} />}
      <div className="panel">
        {paso === 'propio' ? (
          <>
            <h2 className="title">{segunda ? 'Votación repetida' : 'Votación'}</h2>
            <p className="hint">Elige a quién linchar. Tu voto es secreto hasta el recuento.</p>
            <ElegirUno
              e={e} opciones={opciones} texto="Votar"
              onConfirmar={(t) => { if (robadoDe != null) { setPropio(t); setPaso('robado'); } else onVotar(t, undefined); }}
              extra={abstener((t) => { if (robadoDe != null) { setPropio(t); setPaso('robado'); } else onVotar(t, undefined); })}
            />
          </>
        ) : (
          <>
            <h2 className="title">Voto robado</h2>
            <div className="lb-haz"><p>Como <strong>Ladrón de Voces</strong>, emites también el voto de <strong>{e.jugadores[robadoDe].nombre}</strong>. Él no lo sabrá hasta el recuento.</p></div>
            <ElegirUno
              e={e} opciones={vivos(e).map((x) => x.id).filter((x) => x !== robadoDe)} texto="Emitir voto robado"
              onConfirmar={(t) => onVotar(propio, t)}
              extra={abstener((t) => onVotar(propio, t))}
            />
          </>
        )}
      </div>
    </section>
  );
}

/* ───────── Componente principal ───────── */
export default function LobosLocal({ onSalir }) {
  // Fases: setup | composicion | reparto | noche | anuncio | debate | votacion | resultado | fin
  const [fase, setFase] = useState('setup');
  const [modalAyuda, setModalAyuda] = useState(false);
  const [modalConsulta, setModalConsulta] = useState(false);

  // Configuración
  const [numJugadores, setNumJugadores] = useState(10);
  const [nombres, setNombres] = useState(nombresPorDefecto(10));
  const [minutos, setMinutos] = useState(3);
  const [votosPublicos, setVotosPublicos] = useState(true);
  const [mec, setMec] = useState({ ...MEC_NINGUNA });
  const [sel, setSel] = useState(() => selInicial(10));

  // Partida
  const [e, setE] = useState(null);
  const [idx, setIdx] = useState(0);        // índice de turno (reparto)
  const [paso, setPaso] = useState('pasar'); // subpaso dentro de la fase
  const [origen, setOrigen] = useState('noche');
  const [segundos, setSegundos] = useState(0);
  const [vot, setVot] = useState(null);      // estado de la votación en curso
  const [res, setRes] = useState(null);      // resultado de la votación
  const [objetoDia, setObjetoDia] = useState(null); // { tipo, dueno }
  const [ecoListo, setEcoListo] = useState(false);
  const [textoEco, setTextoEco] = useState('');

  const n = numJugadores;
  const rolesElegidos = useMemo(() => rolesDeSel(sel, n), [sel, n]);
  const validacion = useMemo(() => validar(rolesElegidos, n), [rolesElegidos, n]);

  /* ───── Configuración ───── */
  const cambiarNumJugadores = (ev) => {
    const k = Number(ev.target.value);
    setNumJugadores(k);
    setNombres((prev) => (k > prev.length ? [...prev, ...nombresPorDefecto(k).slice(prev.length)] : prev.slice(0, k)));
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
    else { setIdx(idx + 1); setPaso('pasar'); }
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
    if (g) { setE({ ...e, ganador: g }); setFase('fin'); return; }
    if (origen === 'noche') {
      const tipo = sortearObjeto(e);
      if (tipo) { setObjetoDia({ tipo, dueno: null }); setFase('objeto'); } else irADebate(e);
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
    setVot({ orden: barajar(vivos(estado).map((j) => j.id)), i: 0, votos: {}, segunda, primera: vot?.primera ?? null, robado: null });
    setPaso('pasar');
    setFase('votacion');
  };

  const registrarVoto = (voto, votoRobado) => {
    const votante = vot.orden[vot.i];
    const votos = { ...vot.votos, [votante]: voto };
    const robo = !vot.segunda && e.flags.ladron && e.flags.ladron.ladron === votante && e.jugadores[e.flags.ladron.objetivo].vivo
      ? e.flags.ladron.objetivo : null;
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
    if (robado) votos[robado.objetivo] = robado.voto ?? null; // el voto del afectado lo emitió el Ladrón
    let estado = convertirCamaleon(e, votos);
    const r = contarVotos(estado, votos, estado.modDia);
    let victima = r.victima;
    let fichaDe = null;

    // Banquero: una ficha de favor anula el linchamiento
    const f = aplicarFicha(estado, victima);
    if (f.usada) { estado = f.e; fichaDe = victima; victima = null; }

    // Veredicto del Juez: se repite la votación una vez
    if (!vot.segunda && victima != null && juezActivo(estado)) {
      setE(gastarJuez(estado));
      setVot({ ...vot, votos: {}, robado: null, primera: { victima }, repetir: true });
      setPaso('repite');
      setFase('votacion');
      return;
    }
    let juezMuere = false;
    let identico = false;
    if (vot.segunda && vot.primera && victima != null && victima === vot.primera.victima) { juezMuere = true; identico = true; }
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

  const jugarOtraVez = () => { setE(null); setFase('composicion'); };
  const nuevaConfiguracion = () => { setE(null); setFase('setup'); };

  /* ───── Vistas ───── */
  const ayuda = modalAyuda && (
    <div className="rg-modal-fondo" onClick={() => setModalAyuda(false)}>
      <div className="rg-modal modal-ayuda-juego" onClick={(ev) => ev.stopPropagation()}>
        <div className="modal-ayuda-header"><span className="modal-ayuda-signo-title">?</span><h3>Cómo se juega a «Luna de Sangre»</h3></div>
        <div className="modal-ayuda-cuerpo">
          <p><strong>1. Reparto:</strong></p>
          <ul>
            <li>Cada jugador, por turnos y pasándose el dispositivo, descubre su rol en secreto.</li>
            <li>Hay tres bandos: <strong>Lobos</strong>, <strong>Pueblo</strong> y <strong>Solitarios</strong>.</li>
          </ul>
          <p><strong>2. Noche:</strong></p>
          <ul>
            <li>El dispositivo pasa por <strong>todos</strong> los jugadores vivos, también los que no tienen poder (así nadie se delata).</li>
            <li>En tu turno verás <strong>qué debes hacer</strong> y puedes pulsar <em>Mi rol</em> para recordar tu ficha.</li>
          </ul>
          <p><strong>3. Día:</strong></p>
          <ul>
            <li>Se anuncian las muertes (y sus roles). Debatís y luego se vota en secreto a quién linchar.</li>
            <li>Con empate en el primer puesto, nadie es linchado.</li>
            <li>Durante el día cualquiera puede <strong>consultar su rol</strong> en privado desde el botón del debate.</li>
          </ul>
          <p><strong>Mecánicas globales (opcionales):</strong></p>
          <ul>
            <li>Al elegir roles puedes activar <strong>eventos nocturnos</strong>, <strong>objetos sueltos</strong>, <strong>rumores</strong> y <strong>votaciones con modificadores</strong>.</li>
            <li>Todas están desactivadas por defecto y puedes combinarlas como quieras.</li>
          </ul>
          <p><strong>4. Victoria:</strong></p>
          <ul>
            <li><strong>Pueblo:</strong> elimina a todos los lobos (y al Pirómano, si lo hay).</li>
            <li><strong>Lobos:</strong> igualan en número al resto de vivos.</li>
            <li>Los solitarios y los enamorados de bandos distintos tienen sus propias condiciones.</li>
          </ul>
        </div>
        <div className="rg-modal-acciones"><button className="big full" onClick={() => setModalAyuda(false)}>Entendido</button></div>
      </div>
    </div>
  );

  /* 1. SETUP */
  if (fase === 'setup') {
    return (
      <div className="lb-contenedor">
        <button type="button" className="btn-ayuda-flotante" onClick={() => setModalAyuda(true)} title="Reglas y funcionamiento"><span className="btn-ayuda-flotante-signo">?</span></button>
        {ayuda}
        <section className="game">
          {onSalir && <button type="button" className="secondary" onClick={onSalir}><Icon name="arrowLeft" size={18} /> Volver al menú</button>}
          <GameIntro gameId="lobos" titulo="Luna de Sangre (un solo dispositivo)" />
          <div className="panel">
            <h3 className="panel-title"><Icon name="users" size={22} /> Jugadores</h3>
            <label className="field-label" htmlFor="num-jugadores-lb">Número de jugadores ({MIN_JUGADORES} a {MAX_JUGADORES}; lo ideal, 8 a 12)</label>
            <select id="num-jugadores-lb" value={numJugadores} onChange={cambiarNumJugadores}>
              {Array.from({ length: MAX_JUGADORES - MIN_JUGADORES + 1 }, (_, i) => i + MIN_JUGADORES).map((k) => (
                <option key={k} value={k}>{k} jugadores</option>
              ))}
            </select>
            <span className="field-label">Nombres (el orden es el de los asientos en la mesa, en círculo)</span>
            <div className="names-grid">
              {nombres.map((nombre, i) => (
                <input key={i} type="text" value={nombre} maxLength={30} placeholder={`Jugador ${i + 1}`}
                  onChange={(ev) => setNombres((p) => p.map((x, k) => (k === i ? ev.target.value : x)))} />
              ))}
            </div>
          </div>
          <div className="panel" style={{ marginTop: '1rem' }}>
            <h3 className="panel-title"><Icon name="settings" size={22} /> Opciones</h3>
            <label className="field-label" htmlFor="min-debate">Tiempo de debate diurno</label>
            <select id="min-debate" value={minutos} onChange={(ev) => setMinutos(Number(ev.target.value))}>
              <option value={0}>Sin límite de tiempo</option>
              <option value={1}>1 minuto</option>
              <option value={2}>2 minutos</option>
              <option value={3}>3 minutos</option>
              <option value={5}>5 minutos</option>
            </select>
            <label className="lb-check">
              <input type="checkbox" checked={votosPublicos} onChange={(ev) => setVotosPublicos(ev.target.checked)} />
              <span>Mostrar quién votó a quién tras el recuento</span>
            </label>
          </div>
          <button className="big full" onClick={irAComposicion}><Icon name="forward" size={22} /> Elegir roles</button>
        </section>
      </div>
    );
  }

  /* 2. COMPOSICIÓN */
  if (fase === 'composicion') {
    const bloqueado = validacion.errores.length > 0;
    return (
      <div className="lb-contenedor">
        <section className="game">
          <h1 className="title">Elige los roles</h1>
          <p className="hint">{n} jugadores. Elige una combinación recomendada para tu mesa o diseña la tuya.</p>
          <SelectorRoles n={n} sel={sel} setSel={setSel} mec={mec} setMec={setMec} />

          <div className="actions">
            <button className="big full" disabled={bloqueado} onClick={empezarPartida}>
              <Icon name="moon" size={22} /> ¡Empezar partida!
            </button>
            <button className="secondary" onClick={() => setFase('setup')}>Volver a los jugadores</button>
          </div>
        </section>
      </div>
    );
  }

  /* 3. REPARTO DE ROLES */
  if (fase === 'reparto' && e) {
    const j = e.jugadores[idx];
    return (
      <div className="lb-contenedor">
        {paso === 'pasar' ? (
          <section className="game center">
            <p className="categoria"><Icon name="lock" size={16} />Reparto de roles · {idx + 1}/{e.jugadores.length}</p>
            <h1 className="title">Pasa el dispositivo a <span className="hl">{j.nombre}</span></h1>
            <p className="hint">Que nadie más mire la pantalla: vas a descubrir tu rol secreto.</p>
            <button className="big full" onClick={() => setPaso('ver')}><Icon name="check" size={22} strokeWidth={2.5} /> Soy {j.nombre}, mostrar mi rol</button>
          </section>
        ) : (
          <section className="game">
            <TarjetaRol e={e} id={idx} />
            <button className="big full" onClick={siguienteReparto}>
              <Icon name="check" size={22} strokeWidth={2.5} /> {idx + 1 >= e.jugadores.length ? 'He memorizado mi rol: ¡que caiga la noche!' : 'He memorizado mi rol'}
            </button>
          </section>
        )}
      </div>
    );
  }

  /* 4. NOCHE */
  if (fase === 'noche' && e && e.noche) {
    return (
      <div className="lb-contenedor lb-escena-noche">
        {paso === 'intro' && (
          <section className="game center">
            <span className="lb-luna"><Icon name="moon" size={64} strokeWidth={1.5} /></span>
            <p className="categoria"><Icon name="moon" size={16} />Noche {e.ronda}</p>
            <h1 className="title">Cae la noche sobre la aldea</h1>
            {e.noche.evento && (
              <p className="lb-evento grande"><Icon name={EVENTOS[e.noche.evento].icono} size={20} /> <strong>{EVENTOS[e.noche.evento].nombre}.</strong> {EVENTOS[e.noche.evento].texto}</p>
            )}
            <p className="hint">El dispositivo pasará por todos los jugadores vivos, uno a uno. Cuando no sea tu turno, no mires la pantalla.</p>
            <button className="big full" onClick={() => setPaso('pasar')}>Empezar la noche</button>
          </section>
        )}
        {paso === 'pasar' && turnoActual != null && (
          <section className="game center">
            <p className="categoria"><Icon name="lock" size={16} />Noche {e.ronda} · Turno {e.noche.idx + 1}/{e.noche.orden.length}</p>
            <h1 className="title">Pasa el dispositivo a <span className="hl">{e.jugadores[turnoActual].nombre}</span></h1>
            <p className="hint">No mires la pantalla si no es tu turno.</p>
            <button className="big full" onClick={empezarTurno}><Icon name="check" size={22} strokeWidth={2.5} /> Soy {e.jugadores[turnoActual].nombre}, ¡estoy listo!</button>
          </section>
        )}
        {paso === 'turno' && turnoActual != null && (
          <TurnoNoche key={`${e.ronda}-${e.noche.idx}`} e={e} id={turnoActual} onTerminar={terminarTurno} />
        )}
        {paso === 'amanece' && (
          <section className="game center">
            <span className="lb-luna"><Icon name="sun" size={64} strokeWidth={1.5} /></span>
            <h1 className="title">La noche ha terminado</h1>
            <p className="hint">Todos abren los ojos. Entrega el dispositivo a la mesa para ver qué ha ocurrido.</p>
            <button className="big full" onClick={amanecer}><Icon name="sun" size={22} /> Amanecer</button>
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
      <div className="lb-contenedor">
        <section className="game">
          <div className="end-card">
            <span className="end-icon"><Icon name={origen === 'noche' ? 'sun' : 'landmark'} size={44} /></span>
            <p className="categoria"><Icon name="flagFinish" size={16} />Ronda {e.ronda}</p>
            <h1 className="title">{tipoTitulo}</h1>
            {a.rebobinada && <p className="reveal">⏳ Ha ocurrido algo raro… el tiempo ha retrocedido. Nadie ha muerto esta noche.</p>}
            {a.muertes.length === 0 && !a.rebobinada && <p className="reveal">{origen === 'noche' ? 'Esta noche no ha muerto nadie.' : 'Nadie ha sido linchado.'}</p>}
            <div className="lb-muertes">
              {a.muertes.map((m) => (
                <div key={m.id} className="lb-muerte" style={{ '--rol': BANDOS[ROLES[m.rol].bando].color }}>
                  <span className="lb-explicado-icono"><Icon name={ROLES[m.rol].icono} size={26} /></span>
                  <div>
                    <strong>{e.jugadores[m.id].nombre}</strong>
                    <p>Era <strong>{ROLES[m.rol].nombre}</strong> ({BANDOS[ROLES[m.rol].bando].nombre}) · {CAUSAS_PUBLICAS.includes(m.causa) ? TEXTO_CAUSA[m.causa] : 'ha muerto'}</p>
                  </div>
                </div>
              ))}
            </div>
            {a.cartas.length > 0 && (
              <div className="lb-cartas">
                <p className="lb-res-titulo">📜 Las cartas selladas del Notario se abren</p>
                {a.cartas.map((c, i) => <p key={i}>«{c.sobreNombre} {c.veredicto === 'pueblo' ? 'es del Pueblo' : 'NO es del Pueblo'}»</p>)}
                <p className="hint small">El Notario decidía qué escribir: puede ser verdad… o mentira.</p>
              </div>
            )}
            {a.rumor && <p className="reveal">🗣 Rumor del pueblo: {a.rumor.texto} <small>(puede ser cierto o falso)</small></p>}
            {a.evento === 'eclipse' && <p className="reveal">🌑 Eclipse: hoy no hay debate, se vota directamente.</p>}
            {martirLinchado && <p className="reveal">🔔 El sacrificio del Mártir protege a la aldea: esta noche los lobos no podrán atacar.</p>}
            {e.victoriasPersonales.map((v) => <p key={v.id} className="reveal">💀 {v.texto}</p>)}
          </div>

          {origen === 'noche' && !ecoListo && !cazador && a.muertes.length > 0 && e.jugadores.some((x) => x.vivo && x.rol === 'eco') && (
            <div className="panel" style={{ marginTop: '1rem' }}>
              <h3 className="panel-title"><Icon name="speech" size={22} /> Un último susurro</h3>
              <p className="hint">Quien ha muerto esta noche puede dejar un mensaje anónimo para el Eco, sea verdad o mentira. Que escriba solo quien haya caído (¡el Eco no debe ver quién!).</p>
              <textarea className="lb-textarea" maxLength={200} rows={3} value={textoEco} onChange={(ev) => setTextoEco(ev.target.value)} placeholder="Escribe tu mensaje (máx. 200 caracteres)" />
              <button type="button" className="big full" onClick={() => { setE(dejarMensajeEco(e, textoEco)); setEcoListo(true); setTextoEco(''); }}>
                <Icon name="check" size={20} strokeWidth={2.5} /> {textoEco.trim() ? 'Dejar el mensaje' : 'No dejar mensaje'}
              </button>
            </div>
          )}

          {cazador ? (
            <div className="panel" style={{ marginTop: '1rem' }}>
              <h3 className="panel-title"><Icon name="target" size={22} /> {cazador.nombre} era el Cazador: ¡dispara!</h3>
              <p className="hint">Con su último aliento elige a quién se lleva por delante.</p>
              {candidatos.length ? (
                <ElegirUno e={e} opciones={candidatos} texto="Disparar" onConfirmar={(t) => dispararCazador(cazador.id, t)} />
              ) : (
                <button className="big full" onClick={() => dispararCazador(cazador.id, null)}>No queda nadie a quien disparar</button>
              )}
            </div>
          ) : (!(origen === 'noche' && !ecoListo && a.muertes.length > 0 && e.jugadores.some((x) => x.vivo && x.rol === 'eco'))) && (
            <button className="big full" onClick={continuarTrasAnuncio}><Icon name="forward" size={22} /> Continuar</button>
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
      <div className="lb-contenedor">
        <section className="game center">
          <span className="lb-luna"><Icon name={o.icono} size={64} strokeWidth={1.5} /></span>
          <p className="categoria"><Icon name="star" size={16} />Objeto misterioso</p>
          <h1 className="title">¡Ha aparecido: {o.nombre}!</h1>
          <p className="hint">{o.texto}</p>
          {objetoDia.dueno == null ? (
            <>
              <p className="hint">El primero que lo reclame se lo queda: <strong>¡pulsad vuestro nombre!</strong></p>
              <div className="names-grid">
                {candidatos.map((j) => <button key={j.id} type="button" className="secondary" onClick={() => reclamar(j.id)}>{j.nombre}</button>)}
              </div>
            </>
          ) : (
            <>
              <p className="reveal">🎒 {e.jugadores[objetoDia.dueno].nombre} se ha quedado con el objeto. Lo verá en su ficha de rol y en su turno de noche.</p>
              <button className="big full" onClick={() => irADebate(e)}><Icon name="forward" size={22} /> Continuar</button>
            </>
          )}
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
      <div className="lb-contenedor">
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="sun" size={18} />Día {e.ronda}</span>
            <span className="chip alt"><Icon name="users" size={18} />{vivosLista.length} vivos</span>
          </div>
          <div className="panel center">
            <h1 className="title">Debate en la plaza</h1>
            {e.modDia && <p className="lb-evento"><Icon name="landmark" size={18} /> <strong>{MODIFICADORES[e.modDia].nombre}.</strong> {MODIFICADORES[e.modDia].texto}</p>}
            {e.noche?.evento === 'eclipse' ? (
              <p className="lb-evento grande"><Icon name="sun" size={20} /> <strong>Eclipse.</strong> {EVENTOS.eclipse.texto}</p>
            ) : minutos > 0 ? (
              <>
                <div className="timer"><div className={`timer-bar ${segundos <= 20 ? 'low' : ''}`} style={{ width: `${(segundos / (minutos * 60)) * 100}%` }} /></div>
                <p className="timer-text"><Icon name="clock" size={18} />{mm}:{ss}{segundos === 0 ? ' · ¡Tiempo!' : ''}</p>
              </>
            ) : <p className="hint">Debatid todo lo que queráis. Cuando estéis listos, pasad a la votación.</p>}
            <p className="hint">¿Quién es el lobo? Acusad, defendeos y buscad contradicciones.</p>
          </div>

          <div className="panel" style={{ marginTop: '1rem' }}>
            <h3 className="panel-title"><Icon name="users" size={20} /> En la aldea</h3>
            <div className="lb-vivos">{vivosLista.map((j) => <span key={j.id} className="lb-vivo">{j.nombre}</span>)}</div>
            {muertos.length > 0 && (
              <>
                <p className="field-label">Eliminados</p>
                <div className="lb-vivos">
                  {muertos.map((j) => <span key={j.id} className="lb-vivo muerto">{j.nombre} · {ROLES[rolRevelado(e, j.id)].nombre}</span>)}
                </div>
              </>
            )}
          </div>

          <div className="actions">
            <button className="secondary" onClick={() => setModalConsulta(true)}><Icon name="eye" size={20} /> Consultar mi rol</button>
            <button className="big full" onClick={() => iniciarVotacion(false)}><Icon name="landmark" size={22} /> Pasar a la votación</button>
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
        <div className="lb-contenedor">
          <section className="game center">
            <span className="lb-luna"><Icon name="landmark" size={64} strokeWidth={1.5} /></span>
            <h1 className="title">¡Veredicto invocado!</h1>
            <p className="hint">Alguien ha invocado el veredicto del Juez Corrupto: <strong>se anula la votación y se repite</strong>. Si la segunda señala al mismo jugador, el Juez también pagará con su vida.</p>
            <button className="big full" onClick={() => { setVot({ ...vot, orden: barajar(vivos(e).map((j) => j.id)), i: 0, votos: {}, segunda: true, robado: null }); setPaso('pasar'); }}>
              Repetir la votación
            </button>
          </section>
        </div>
      );
    }
    const votante = vot.orden[vot.i];
    const robadoDe = !vot.segunda && e.flags.ladron && e.flags.ladron.ladron === votante && e.jugadores[e.flags.ladron.objetivo].vivo ? e.flags.ladron.objetivo : null;
    return (
      <div className="lb-contenedor">
        {paso === 'pasar' ? (
          <section className="game center">
            <p className="categoria"><Icon name="lock" size={16} />{vot.segunda ? 'Votación repetida' : 'Votación'} · {vot.i + 1}/{vot.orden.length}</p>
            <h1 className="title">Pasa el dispositivo a <span className="hl">{e.jugadores[votante].nombre}</span></h1>
            {e.modDia && !vot.segunda && <p className="lb-evento"><Icon name="landmark" size={18} /> <strong>{MODIFICADORES[e.modDia].nombre}:</strong> {MODIFICADORES[e.modDia].texto}</p>}
            <p className="hint">Vota en secreto: nadie más debe ver tu elección.</p>
            <button className="big full" onClick={() => setPaso('votar')}><Icon name="check" size={22} strokeWidth={2.5} /> Soy {e.jugadores[votante].nombre}, ¡estoy listo!</button>
            <button className="secondary" style={{ marginTop: '.8rem' }} onClick={() => setModalConsulta(true)}><Icon name="eye" size={18} /> Consultar mi rol</button>
            {modalConsulta && <ConsultarRol e={e} onCerrar={() => setModalConsulta(false)} />}
          </section>
        ) : (
          <VotoTurno key={`${vot.segunda}-${vot.i}`} e={e} id={votante} robadoDe={robadoDe} segunda={vot.segunda} onVotar={registrarVoto} />
        )}
      </div>
    );
  }

  /* 8. RESULTADO DE LA VOTACIÓN */
  if (fase === 'resultado' && e && res) {
    const todos = vivos(e);
    return (
      <div className="lb-contenedor">
        <section className="game">
          <div className="end-card">
            <span className="end-icon"><Icon name={res.victima == null ? 'hourglass' : 'landmark'} size={44} /></span>
            <p className="categoria"><Icon name="flagFinish" size={16} />Ronda {e.ronda}{res.repeticion ? ' · votación repetida' : ''}</p>
            <h1 className="title">Recuento de votos</h1>
            <p className="final-score">
              {res.fichaDe != null
                ? 'La ficha de favor ha anulado la sentencia'
                : res.victima == null
                ? (res.max === 0 ? 'Nadie ha recibido votos: no hay linchamiento' : `Empate entre ${res.empatados.map((i) => e.jugadores[i].nombre).join(' y ')}: no hay linchamiento`)
                : `El pueblo señala a ${e.jugadores[res.victima].nombre} (${res.max} ${res.max === 1 ? 'voto' : 'votos'})`}
            </p>
            {res.fichaDe != null && <p className="reveal">🪙 Una ficha de favor se ha gastado: {e.jugadores[res.fichaDe].nombre} se libra del linchamiento.</p>}
            {res.modif && <p className="hint small">Modificador de hoy: {MODIFICADORES[res.modif].nombre}.</p>}
            {res.identico && <p className="reveal">⚖ El resultado coincide con el primero: el Juez Corrupto paga con su vida.</p>}
            <div className="scoreboard">
              {[...todos].sort((a, b) => res.conteo[b.id] - res.conteo[a.id]).map((j) => (
                <div key={j.id} className={`score-row ${j.id === res.victima ? 'first' : ''}`}>
                  <span className="score-name">{j.nombre}</span>
                  <span className="score-pts">{res.conteo[j.id]} {res.conteo[j.id] === 1 ? 'voto' : 'votos'}</span>
                </div>
              ))}
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
          <button className="big full" onClick={aplicarResultado}><Icon name="forward" size={22} /> {res.victima == null ? 'Continuar' : 'Ejecutar la sentencia'}</button>
        </section>
      </div>
    );
  }

  /* 9. FIN */
  if (fase === 'fin' && e && e.ganador) {
    const g = e.ganador;
    const titulo = { lobos: 'Ganan los Lobos', pueblo: 'Gana el Pueblo', solitario: 'Gana el Solitario', amantes: 'Ganan los Enamorados', epidemia: 'Gana la Epidemia', nadie: 'Nadie gana' }[g.bando];
    const icono = { lobos: 'paw', pueblo: 'home', solitario: 'flame', amantes: 'heart', epidemia: 'flask', nadie: 'skull' }[g.bando];
    return (
      <div className="lb-contenedor">
        <section className="game">
          <div className="end-card">
            <span className="end-icon"><Icon name={icono} size={44} /></span>
            <p className="categoria"><Icon name="flagFinish" size={16} />Fin de la partida · ronda {e.ronda}</p>
            <h1 className="title">{titulo}</h1>
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
          <div className="actions">
            <button className="big full" onClick={jugarOtraVez}><Icon name="refresh" size={22} /> Otra partida (mismos jugadores)</button>
            <button className="secondary" onClick={nuevaConfiguracion}>Cambiar jugadores</button>
          </div>
        </section>
      </div>
    );
  }

  return null;
}
