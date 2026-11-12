// client/src/games/Ubicacion/UbicacionLocal.jsx
// Modo «un único dispositivo»: turnos con marcador real y dos señuelos.
import { useEffect, useRef, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import { SelectorJugadores, BloqueConfig } from '../../components/MenuJuego.jsx';
import MapaMundi from './MapaMundi.jsx';
import { barajar, distanciaKm, puntosPorDistancia, resolverImagenes, OPCIONES_RONDAS } from './geo.js';
import {
  Hero, BarraTiempo, TarjetaFoto, BotonFoto, ModalFoto, TablaRonda, Clasificacion, Podio, ModalSalir, inicial
} from './Pantallas.jsx';
import './Ubicacion.css';
import { limitesLocal } from '../limites.js';

const { min: MIN_JUGADORES, max: MAX_JUGADORES } = limitesLocal('ubicacion');
const SEGUNDOS_IMAGEN = 10;
const SEGUNDOS_TURNO = 90;

const COLORES = ['#ef4444', '#2563eb', '#16a34a', '#f59e0b', '#9333ea', '#ec4899', '#0d9488', '#ea580c', '#475569', '#65a30d'];

const SLOTS = [
  { id: 'real', glifo: '★', nombre: 'Real' },
  { id: 's1', glifo: '1', nombre: 'Señuelo 1' },
  { id: 's2', glifo: '2', nombre: 'Señuelo 2' }
];
const VACIOS = { real: null, s1: null, s2: null };

export default function UbicacionLocal({ onVolver, onExit, onAbrirAyuda }) {
  const [fase, setFase] = useState('setup'); // setup | cargando | imagen | aviso | turno | resultados | puntuaciones | final
  const [verImagen, setVerImagen] = useState(false);
  const [errorCarga, setErrorCarga] = useState('');
  const [modalSalir, setModalSalir] = useState(false);

  const [numJugadores, setNumJugadores] = useState(MIN_JUGADORES);
  const [nombres, setNombres] = useState(() => Array.from({ length: MAX_JUGADORES }, () => ''));
  const [rondasElegidas, setRondasElegidas] = useState(7);

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

  const [fotoCargada, setFotoCargada] = useState(false);
  const [restanteFoto, setRestanteFoto] = useState(SEGUNDOS_IMAGEN);
  const [tiempoTurno, setTiempoTurno] = useState(SEGUNDOS_TURNO);
  const colocadosRef = useRef(colocados);
  colocadosRef.current = colocados;

  const totalRondas = Math.min(rondasElegidas, lugares.length);
  const lugarActual = lugares[ronda - 1];
  const jugadorActual = jugadores[orden[turnoIdx]];
  const anterior = marcasRonda.length ? marcasRonda[marcasRonda.length - 1] : null;
  const jugadorAnterior = anterior ? jugadores.find((j) => j.id === anterior.jugadorId) : null;
  const esUltimoTurno = turnoIdx === orden.length - 1;
  const slotsActivos = esUltimoTurno ? SLOTS.filter((s) => s.id === 'real') : SLOTS;

  // Cuenta atrás de la foto (empieza cuando la foto ha cargado)
  useEffect(() => {
    if (fase !== 'imagen' || !fotoCargada) return undefined;
    const fin = Date.now() + SEGUNDOS_IMAGEN * 1000;
    setRestanteFoto(SEGUNDOS_IMAGEN);
    const id = setInterval(() => {
      const r = (fin - Date.now()) / 1000;
      if (r <= 0) { clearInterval(id); setFase('aviso'); } else setRestanteFoto(r);
    }, 100);
    return () => clearInterval(id);
  }, [fase, fotoCargada]);

  // Reloj del turno
  useEffect(() => {
    if (fase !== 'turno') return undefined;
    setTiempoTurno(SEGUNDOS_TURNO);
    const fin = Date.now() + SEGUNDOS_TURNO * 1000;
    const id = setInterval(() => {
      const rest = (fin - Date.now()) / 1000;
      if (rest <= 0) {
        clearInterval(id);
        setTiempoTurno(0);
        confirmar(colocadosRef.current);
      } else setTiempoTurno(rest);
    }, 200);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fase, turnoIdx]);

  // Precarga la foto de la siguiente ronda
  useEffect(() => {
    const siguiente = lugares[ronda];
    if (siguiente) new Image().src = siguiente.imagenUrl;
  }, [lugares, ronda]);

  // Si se acaban los lugares (fotos que no cargan), se termina la partida
  useEffect(() => {
    if (['imagen', 'aviso', 'turno'].includes(fase) && !lugarActual && lugares.length) setFase('final');
  }, [fase, lugarActual, lugares.length]);

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
      const r = await fetch(`/api/ubicacion/lote?n=${rondasElegidas + 8}`);
      if (!r.ok) throw new Error('servidor');
      const conFoto = await resolverImagenes(await r.json());
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

  // Abre la ronda alguien que aún no la haya abierto (sorteo) y se sigue en orden
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
    setFotoCargada(false);
    setFase('imagen');
  };

  const descartarLugar = () => {
    setFotoCargada(false);
    setLugares((ls) => ls.filter((l) => l.id !== lugarActual?.id));
  };

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

  const confirmar = (datos = colocados) => {
    const entrada = {
      jugadorId: jugadorActual.id,
      real: datos.real || null,
      visibles: esUltimoTurno
        ? [datos.real].filter(Boolean)
        : barajar([datos.real, datos.s1, datos.s2].filter(Boolean))
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
        const j = jugadores.find((x) => x.id === m.jugadorId);
        const km = m.real ? distanciaKm(m.real, lugar) : null;
        return { id: j.id, nombre: j.nombre, color: j.color, real: m.real, km, puntos: puntosPorDistancia(km) };
      })
      .sort((a, b) => a.puntos - b.puntos);
    setPuntos((p) => {
      const n = { ...p };
      filas.forEach((f) => { n[f.id] = (n[f.id] ?? 0) + f.puntos; });
      return n;
    });
    setResultado({ lugar, filas });
    setFase('resultados');
  };

  const siguienteRonda = () => {
    setRonda((r) => r + 1);
    empezarRonda(jugadores, abridores);
  };

  const conPuntos = jugadores.map((j) => ({ ...j, puntos: puntos[j.id] ?? 0 }));
  const sumadas = resultado ? Object.fromEntries(resultado.filas.map((f) => [f.id, f.puntos])) : {};
  const esUltimaRonda = ronda >= totalRondas;
  const salir = () => setModalSalir(true);

  const hero = (extra = {}) => (
    <Hero onSalir={salir} ronda={ronda} total={totalRondas} jugadores={conPuntos} {...extra} />
  );

  const modalSalirPartida = modalSalir && (
    <ModalSalir
      texto="Se perderá la partida en curso y volverás a la portada."
      onSeguir={() => setModalSalir(false)}
      onSalir={() => { setModalSalir(false); onExit?.(); }}
    />
  );

  // ---------- Configuración ----------
  if (fase === 'setup') {
    return (
      <div className="ub-contenedor">
        <SelectorJugadores
          onVolver={onVolver}
          onAyuda={onAbrirAyuda}
          min={MIN_JUGADORES}
          max={MAX_JUGADORES}
          numJugadores={numJugadores}
          onCambiarNum={(n) => setNumJugadores(Math.max(MIN_JUGADORES, Math.min(MAX_JUGADORES, n)))}
          nombres={nombres.slice(0, numJugadores)}
          onNombre={(i, v) => setNombres((ns) => ns.map((x, k) => (k === i ? v : x)))}
          onEmpezar={iniciarPartida}
          error={errorCarga}
          maxLength={30}
        >
          <BloqueConfig titulo="Número de rondas" style={{ marginTop: '1.2rem' }}>
            <div className="ubp-pildoras">
              {OPCIONES_RONDAS.map((n) => (
                <button key={n} type="button" className={`ubp-pildora${rondasElegidas === n ? ' activo' : ''}`} onClick={() => setRondasElegidas(n)}>
                  {n} rondas
                </button>
              ))}
            </div>
          </BloqueConfig>
        </SelectorJugadores>
      </div>
    );
  }

  // ---------- Cargando ----------
  if (fase === 'cargando') {
    return (
      <div className="ub-contenedor qq-en-partida">
        <section className="game ubp-escena">
          <div className="ubp-tarjeta ubp-cargando">
            <span className="ubp-globo" aria-hidden="true">🌍</span>
            <p>Preparando el viaje…</p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="ub-contenedor qq-en-partida">
      {verImagen && lugarActual && <ModalFoto src={lugarActual.imagenUrl} onCerrar={() => setVerImagen(false)} />}

      {/* ---------- Foto ---------- */}
      {fase === 'imagen' && lugarActual && (
        <section className="game ubp-escena">
          {hero()}
          <TarjetaFoto
            key={lugarActual.id}
            src={lugarActual.imagenUrl}
            segundos={restanteFoto}
            total={SEGUNDOS_IMAGEN}
            cargando={!fotoCargada}
            onLoad={() => setFotoCargada(true)}
            onError={descartarLugar}
          />
        </section>
      )}

      {/* ---------- Pasa el móvil ---------- */}
      {fase === 'aviso' && jugadorActual && (
        <section className="game ubp-escena">
          {hero({ turnoId: jugadorActual.id })}
          <div className="ubp-tarjeta ubp-listo">
            <span className="ubp-listo-avatar" style={{ '--c': jugadorActual.color }}>{inicial(jugadorActual.nombre)}</span>
            <p className="ubp-etiqueta">Pasa el móvil a</p>
            <h2 className="ubp-listo-nombre">{jugadorActual.nombre}</h2>
            <p className="ubp-texto">
              {turnoIdx === 0
                ? <>🎲 Abres la ronda. Coloca tu marcador real <strong>★</strong> y <strong>2 señuelos</strong> para despistar al siguiente.</>
                : esUltimoTurno
                  ? <>🏁 Eres el último: verás las marcas de <strong>{jugadorAnterior.nombre}</strong> con «?» y solo tendrás que colocar tu marcador real.</>
                  : <>Verás las 3 marcas de <strong>{jugadorAnterior.nombre}</strong> con «?». Solo una es la buena… Coloca tu marcador real y 2 señuelos.</>}
            </p>
            <p className="ubp-turno-num">Turno {turnoIdx + 1} de {orden.length} · {SEGUNDOS_TURNO} segundos</p>
          </div>
          <div className="ubp-barra">
            <button type="button" className="ubp-boton grande" onClick={() => setFase('turno')}>
              <Icon name="pin" size={22} /> Empezar mi turno
            </button>
          </div>
        </section>
      )}

      {/* ---------- Turno ---------- */}
      {fase === 'turno' && jugadorActual && (
        <section className="game ubp-escena">
          {hero({ turnoId: jugadorActual.id })}
          <BarraTiempo segundos={tiempoTurno} total={SEGUNDOS_TURNO} />
          <div className="ubp-instruccion" style={{ '--c': jugadorActual.color }}>
            <span className="ubp-avatar">{inicial(jugadorActual.nombre)}</span>
            <p>
              {slotActivo
                ? <>Toca el mapa para colocar <strong>{SLOTS.find((s) => s.id === slotActivo).glifo} {SLOTS.find((s) => s.id === slotActivo).nombre}</strong></>
                : <>Arrastra tus marcadores para afinar o confirma</>}
            </p>
            {lugarActual && <BotonFoto src={lugarActual.imagenUrl} onClick={() => setVerImagen(true)} />}
          </div>

          <MapaMundi
            key={`turno-${ronda}-${jugadorActual.id}`}
            marcadores={[
              ...(anterior?.visibles ?? []).map((p, i) => ({
                id: `previo-${i}`, lat: p.lat, lng: p.lng, color: jugadorAnterior.color, glifo: '?', fantasma: true, interactivo: false
              })),
              ...slotsActivos.filter((s) => colocados[s.id]).map((s) => ({
                id: s.id, ...colocados[s.id], color: jugadorActual.color, glifo: s.glifo, grande: s.id === 'real', arrastrable: true
              }))
            ]}
            onClickMapa={colocar}
            onMoverMarcador={moverMarcador}
          />

          <div className={`ubp-slots${esUltimoTurno ? ' uno' : ''}`}>
            {slotsActivos.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`ubp-slot${slotActivo === s.id ? ' activo' : ''}${colocados[s.id] ? ' listo' : ''}`}
                style={{ '--c': jugadorActual.color }}
                onClick={() => setSlotActivo(s.id)}
                aria-pressed={slotActivo === s.id}
              >
                <span className="ubp-slot-glifo">{s.glifo}</span>
                <span className="ubp-slot-nombre">{s.nombre}</span>
                <small>{colocados[s.id] ? '✓ Colocado' : slotActivo === s.id ? 'Toca el mapa' : 'Pendiente'}</small>
              </button>
            ))}
          </div>

          <div className="ubp-barra estatica">
            <button
              type="button"
              className="ubp-boton grande"
              disabled={slotsActivos.some((s) => !colocados[s.id])}
              onClick={() => confirmar()}
            >
              <Icon name="check" size={22} />
              {esUltimoTurno ? 'Confirmar mi marcador' : `Confirmar marcadores (${slotsActivos.filter((s) => colocados[s.id]).length}/${slotsActivos.length})`}
            </button>
          </div>
        </section>
      )}

      {/* ---------- Resultado de la ronda ---------- */}
      {fase === 'resultados' && resultado && (
        <section className="game ubp-escena">
          {hero()}
          <MapaMundi
            key={`resultado-${ronda}`}
            marcadores={[
              { id: 'correcto', lat: resultado.lugar.lat, lng: resultado.lugar.lng, color: '#111827', glifo: '✓', grande: true, z: 1000, etiqueta: resultado.lugar.nombre },
              ...resultado.filas.filter((f) => f.real).map((f) => ({
                id: `jugador-${f.id}`, lat: f.real.lat, lng: f.real.lng, color: f.color, glifo: inicial(f.nombre), etiqueta: f.nombre
              }))
            ]}
            lineas={resultado.filas.filter((f) => f.real).map((f) => ({ desde: f.real, hasta: resultado.lugar, color: f.color }))}
            ajustar
            enfoque={enfoque}
          />
          <TablaRonda lugar={resultado.lugar} filas={resultado.filas} onEnfocar={setEnfoque} />
          <div className="ubp-barra estatica">
            <button type="button" className="ubp-boton grande" onClick={() => setFase('puntuaciones')}>
              <Icon name="chart" size={22} /> Ver clasificación
            </button>
          </div>
        </section>
      )}

      {/* ---------- Clasificación ---------- */}
      {fase === 'puntuaciones' && (
        <section className="game ubp-escena">
          {hero()}
          <Clasificacion jugadores={conPuntos} sumadas={sumadas} subtitulo={`Tras la ronda ${ronda} de ${totalRondas} · gana quien menos sume`} />
          <div className="ubp-barra estatica">
            {esUltimaRonda ? (
              <button type="button" className="ubp-boton grande" onClick={() => setFase('final')}>
                <Icon name="crown" size={22} /> Ver resultado final
              </button>
            ) : (
              <>
                <button type="button" className="ubp-boton grande" onClick={siguienteRonda}>
                  <Icon name="play" size={22} /> Siguiente ronda
                </button>
                <button type="button" className="ubp-enlace" onClick={() => setFase('final')}>
                  <Icon name="flagFinish" size={16} /> Terminar la partida aquí
                </button>
              </>
            )}
          </div>
        </section>
      )}

      {/* ---------- Final ---------- */}
      {fase === 'final' && (
        <section className="game ubp-escena">
          <Podio jugadores={conPuntos} />
          <Clasificacion jugadores={conPuntos} titulo="Clasificación final" />
          <div className="ubp-barra estatica">
            <button type="button" className="ubp-boton grande" onClick={() => setFase('setup')}>
              <Icon name="refresh" size={22} /> Nueva partida
            </button>
            <button type="button" className="ubp-enlace" onClick={() => onExit?.()}>
              <Icon name="home" size={16} /> Volver a la portada
            </button>
          </div>
        </section>
      )}

      {modalSalirPartida}
    </div>
  );
}
