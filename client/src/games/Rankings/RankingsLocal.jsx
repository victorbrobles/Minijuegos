// client/src/games/Rankings/RankingsLocal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import './Rankings.css';

const TIEMPO_TURNO = 90;
const PREPARACION_S = 3;
const MAX_RONDAS = 15;
const MIN_JUGADORES = 3;
const MAX_JUGADORES = 15;

const COLORES = ['#3b82f6', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4', '#f97316'];
export const colorJugador = (i) => COLORES[((i % COLORES.length) + COLORES.length) % COLORES.length];
export const inicial = (nombre = '?') => nombre.trim().charAt(0).toUpperCase() || '?';
export const indiceColor = (j, i) => (typeof j?.id === 'number' ? j.id - 1 : i);

const COLORES_CATEGORIA = [
  ['#f97316', '#ef4444'], ['#8b5cf6', '#6366f1'], ['#06b6d4', '#3b82f6'], ['#ec4899', '#f43f5e'],
  ['#22c55e', '#84cc16'], ['#3b82f6', '#8b5cf6'], ['#f59e0b', '#f97316'], ['#14b8a6', '#22c55e']
];

/* ==========================================================================
   COMPONENTES DE TABLERO COMPARTIDOS (UNIFICADOS CON BUSCAMINAS / QUIÉN ES QUIÉN)
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
  const bueno = ['acierto', 'exito'].includes(visible.tipo);
  const malo = ['fallo', 'tiempo', 'rebote', 'error'].includes(visible.tipo);

  return (
    <div className={`cnp-aviso${bueno ? ' bueno' : ''}${malo ? ' malo' : ''}`} role="status" aria-live="polite">
      <span aria-hidden="true">{bueno ? '🎉' : malo ? '💔' : 'ℹ️'}</span>
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
        <Icon name="trophy" size={150} strokeWidth={1.4} />
      </span>
      <div className="qqp-hero-top">
        {onSalir ? <BotonPortada onClick={onSalir} texto={textoSalir} /> : <span />}
        <div className="qqp-hero-chips">
          {chips}
          {categoria && (
            <span className="qqp-chip" title="Categoría de la ronda">
              <Icon name={categoria.icono || 'trophy'} size={14} /> <span>{categoria.nombre}</span>
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

export function OrdenTurnos({ jugadores, activoId, puntosMap = null }) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current?.querySelector('.activo')?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [activoId]);

  return (
    <ol className="qqp-orden" ref={ref} aria-label="Estado de los jugadores">
      {jugadores.map((j, i) => {
        const esActivo = j.id === activoId;
        const pts = puntosMap ? (puntosMap[j.nombre] ?? puntosMap[j.id] ?? 0) : (j.puntos ?? 0);
        return (
          <li
            key={j.id || j.nombre}
            className={`qqp-orden-item${esActivo ? ' activo' : ''}`}
            style={{ '--c': colorJugador(indiceColor(j, i)) }}
            aria-current={esActivo ? 'step' : undefined}
          >
            <span className="qqp-orden-avatar">{inicial(j.nombre)}</span>
            <span className="qqp-orden-nombre">{j.nombre}</span>
            <span className="qqp-orden-pts">{pts}p</span>
          </li>
        );
      })}
    </ol>
  );
}

export function SelectorCategorias({ categorias = [], rondaActual, maxRondas, turnoNombre, onElegir, onSalir, onAyuda, aviso }) {
  const [filtro, setFiltro] = useState('');
  const normalizar = (t) => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const todas = [{ nombre: 'Todas las categorías', icono: 'star', esTodas: true }, ...categorias];
  const visibles = filtro.trim()
    ? todas.filter((c) => normalizar(c.nombre).includes(normalizar(filtro.trim())))
    : todas;

  return (
    <section className="game qqp-escena">
      <header className="qqp-hero">
        <span className="qqp-hero-deco" aria-hidden="true">
          <Icon name="trophy" size={150} strokeWidth={1.4} />
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
        <p className="qqp-hero-etiqueta">
          {turnoNombre ? `Abre la ronda: ${turnoNombre}` : 'Nueva ronda'}
        </p>
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
          {visibles.map((cat, idx) => {
            const [c1, c2] = COLORES_CATEGORIA[idx % COLORES_CATEGORIA.length];
            return (
              <li key={cat.nombre}>
                <button
                  type="button"
                  className="qqp-categoria"
                  style={{ '--c1': c1, '--c2': c2 }}
                  onClick={() => onElegir(cat.esTodas ? null : cat.nombre)}
                >
                  <span className="qqp-categoria-icono">
                    <Icon name={cat.icono || (cat.esTodas ? 'star' : 'trophy')} size={24} />
                  </span>
                  <span className="qqp-categoria-textos">
                    <span className="qqp-categoria-nombre">{cat.nombre}</span>
                    <span className="qqp-categoria-info">
                      {cat.esTodas ? 'Mezcla de todos los temas' : 'Ranking oficial'}
                    </span>
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
   COMPONENTE DE TURNO ACTIVO (LOCAL)
   ========================================================================== */

function TurnoRanking({
  jugador,
  jugadores,
  puntos,
  rondaActual,
  esRebote,
  motivo,
  rankingData,
  puestos,
  pistasUsadas,
  pistasBloqueadas,
  inputRespuesta,
  setInputRespuesta,
  onAbrirPista,
  onEnviarRespuesta,
  onPasarTurno,
  onTiempoAgotado,
  onSalirPortada,
  mensajeFeedback,
  elementosRojos
}) {
  const [prep, setPrep] = useState(PREPARACION_S);
  const [restante, setRestante] = useState(TIEMPO_TURNO);
  const alAcabarse = useRef(onTiempoAgotado);
  alAcabarse.current = onTiempoAgotado;

  useEffect(() => {
    const finPrep = Date.now() + PREPARACION_S * 1000;
    const finTurno = finPrep + TIEMPO_TURNO * 1000;
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
  const descubiertos = puestos.filter((p) => !p.oculto).length;
  const totalPuestos = puestos.length;

  return (
    <section className="game qqp-escena">
      <Cabecera
        onSalir={onSalirPortada}
        categoria={{ nombre: rankingData.categoria, icono: 'trophy' }}
        etiqueta={`Ronda ${rondaActual} de ${MAX_RONDAS} · ${esRebote ? 'Turno de rebote' : 'Turno activo'}`}
        titulo={jugador.nombre}
        avatar={<Avatar nombre={jugador.nombre} color={colorJugador(indiceColor(jugador, 0))} />}
      >
        <div className="qqp-identidad rk-consigna-box">
          <div className="rk-consigna-top">
            <span className="qqp-identidad-icono">
              <Icon name="trophy" size={16} strokeWidth={2.4} />
            </span>
            <div className="rk-consigna-textos">
              <span className="rk-consigna-titulo">{rankingData.titulo}</span>
              {rankingData.descripcion && (
                <span className="rk-consigna-sub">{rankingData.descripcion}</span>
              )}
            </div>
          </div>

          <div className="rk-hero-stats">
            <span className="rk-hero-stat ok">✅ {descubiertos}/{totalPuestos} descubiertos</span>
            {esRebote && <span className="rk-hero-stat rebote">🔄 Rebote</span>}
            <span className={`rk-hero-stat timer${!preparando && restante <= 15 ? ' low' : ''}`}>
              <Icon name="clock" size={14} />
              {preparando ? `Prep… ${prep}s` : `${Math.ceil(restante)}s`}
            </span>
          </div>

          <div className="rk-timer-track" role="timer" aria-label="Tiempo restante">
            <div
              className={`rk-timer-fill${!preparando && restante <= 15 ? ' low' : ''}`}
              style={{ width: preparando ? '100%' : `${(restante / TIEMPO_TURNO) * 100}%` }}
            />
          </div>
        </div>

        <OrdenTurnos
          jugadores={jugadores}
          activoId={jugador.id}
          puntosMap={puntos}
        />
      </Cabecera>

      {motivo && (
        <div className="rk-rebote-banner" role="status">
          <Icon name={motivo === 'tiempo' ? 'hourglass' : 'refresh'} size={18} />
          <span>
            {motivo === 'tiempo' ? '¡Se agotó el tiempo!' : '¡Fallo o rebote!'} Turno para <strong>{jugador.nombre}</strong>
          </span>
        </div>
      )}

      {preparando && (
        <div className="rk-prep-card" role="status">
          <Icon name="clock" size={20} />
          <span>¡Prepárate, <strong>{jugador.nombre}</strong>! Empieza en <strong>{prep}</strong>…</span>
        </div>
      )}

      <div className="qqp-tarjeta">
        {mensajeFeedback && (
          <div className={`rk-feedback rk-feedback-${mensajeFeedback.tipo}`}>
            {mensajeFeedback.texto}
          </div>
        )}

        <div className="rk-lista-ranking">
          {puestos.map((p) => (
            <div
              key={p.posicion}
              className={`rk-fila-puesto ${p.oculto ? 'rk-oculto' : 'rk-resuelto'} ${p.oculto && elementosRojos ? 'rk-flash-red' : ''}`}
            >
              <span className="rk-pos">#{p.posicion}</span>

              {!p.oculto ? (
                <>
                  <span className="rk-val">{p.valor}</span>
                  <span className="rk-check"><Icon name="check" size={20} strokeWidth={2.5} /></span>
                </>
              ) : (
                <div className="rk-slot-acciones">
                  <span className="rk-slot-oculto-texto">Puesto por descubrir</span>

                  <button
                    type="button"
                    disabled={preparando || elementosRojos || pistasBloqueadas[p.posicion]}
                    className={`rk-btn-pista ${pistasUsadas[p.posicion] ? 'usada' : ''}`}
                    onClick={() => !preparando && onAbrirPista(p)}
                    title={
                      pistasBloqueadas[p.posicion]
                        ? 'Pista bloqueada: el jugador anterior falló sin pedirla'
                        : 'Pedir pista (acertar sumará 1 punto en vez de 3)'
                    }
                  >
                    <Icon name="eye" size={15} />
                    <span>
                      {pistasUsadas[p.posicion]
                        ? 'Ver pista'
                        : pistasBloqueadas[p.posicion]
                        ? 'Bloqueada'
                        : 'Pista (1 pt)'}
                    </span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <form onSubmit={onEnviarRespuesta} className="rk-form-respuesta">
          <label className="qq-label-destacado" htmlFor="rk-input-global">
            Introduce cualquier elemento que falte en el ranking
          </label>
          <div className="rk-form-row">
            <input
              id="rk-input-global"
              className="qq-input-moderno"
              type="text"
              autoFocus
              autoComplete="off"
              disabled={preparando || elementosRojos}
              placeholder="Escribe el nombre o elemento…"
              value={inputRespuesta}
              onChange={(e) => setInputRespuesta(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={preparando || elementosRojos || !inputRespuesta.trim()}
              className="rk-btn-enviar"
            >
              <Icon name="check" size={18} strokeWidth={2.5} /> Enviar
            </button>
          </div>
        </form>
      </div>

      <div className="qqp-barra">
        <EnlaceSecundario
          disabled={preparando || elementosRojos}
          onClick={() => onPasarTurno('rebote')}
        >
          <Icon name="refresh" size={16} /> Pasar turno / Fallo (Rebote)
        </EnlaceSecundario>
      </div>
    </section>
  );
}

/* ==========================================================================
   MODO LOCAL PRINCIPAL: RANKINGS
   ========================================================================== */

export default function RankingsLocal({ onVolver, onExit, onAbrirAyuda }) {
  const navigate = useNavigate();

  const [paso, setPaso] = useState('setup'); // 'setup' | 'categoria' | 'jugando' | 'solucion' | 'resumen_ronda' | 'fin_partida'
  const [modalSalirPortada, setModalSalirPortada] = useState(false);

  const [categoriasDatos, setCategoriasDatos] = useState(null);
  const [errorCarga, setErrorCarga] = useState(false);

  const [numJugadores, setNumJugadores] = useState(3);
  const [jugadores, setJugadores] = useState([
    { id: 1, nombre: 'Jugador 1' },
    { id: 2, nombre: 'Jugador 2' },
    { id: 3, nombre: 'Jugador 3' }
  ]);

  const [puntos, setPuntos] = useState({});
  const [rondaActual, setRondaActual] = useState(1);
  const [rankingData, setRankingData] = useState(null);
  const [solucionFinal, setSolucionFinal] = useState(null);

  const [jugadorInicialRonda, setJugadorInicialRonda] = useState(0);
  const [jugadorTurno, setJugadorTurno] = useState(0);
  const [esRebote, setEsRebote] = useState(false);
  const [intento, setIntento] = useState(0);
  const [motivo, setMotivo] = useState(null);
  const [jugadoresIntentados, setJugadoresIntentados] = useState([]);

  const [puestos, setPuestos] = useState([]);
  const [pistasUsadas, setPistasUsadas] = useState({});
  const [pistasBloqueadas, setPistasBloqueadas] = useState({});

  const [inputRespuesta, setInputRespuesta] = useState('');
  const [modalPista, setModalPista] = useState(null);
  const [mensajeFeedback, setMensajeFeedback] = useState(null);
  const [elementosRojos, setElementosRojos] = useState(false);

  const [eventoAviso, setEventoAviso] = useState(null);
  const avisoSeqRef = useRef(0);

  useEffect(() => {
    fetch('/api/rankings/categorias')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => setCategoriasDatos(data))
      .catch(() => setErrorCarga(true));
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

    const puntuacionesIniciales = {};
    listaActualizada.forEach((j) => {
      puntuacionesIniciales[j.nombre] = 0;
    });
    setPuntos(puntuacionesIniciales);

    const primerJugador = Math.floor(Math.random() * listaActualizada.length);
    setJugadorInicialRonda(primerJugador);
    setJugadorTurno(primerJugador);
    setRondaActual(1);
    setPaso('categoria');
  };

  const cargarRanking = async (catNombre, idTurno) => {
    try {
      const res = await fetch('/api/rankings/iniciar-ronda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoria: catNombre })
      });
      const data = await res.json();

      setRankingData(data);
      setPuestos(data.elementos);
      setPistasUsadas({});
      setPistasBloqueadas({});
      setJugadoresIntentados([idTurno]);
      setEsRebote(false);
      setIntento(0);
      setMotivo(null);
      setSolucionFinal(null);
      setInputRespuesta('');
      setMensajeFeedback(null);
      setElementosRojos(false);
      setPaso('jugando');
    } catch {
      alert('Error al conectar con la base de datos de rankings.');
    }
  };

  const abrirPista = (puesto) => {
    if (pistasBloqueadas[puesto.posicion]) return;
    setPistasUsadas((prev) => ({ ...prev, [puesto.posicion]: true }));
    setModalPista({ posicion: puesto.posicion, pista: puesto.pista });
  };

  const enviarRespuesta = async (e) => {
    e.preventDefault();
    if (!inputRespuesta.trim() || elementosRojos) return;

    try {
      const posicionesOcultas = puestos.filter((p) => p.oculto).map((p) => p.posicion);

      const res = await fetch('/api/rankings/validar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoria: rankingData.categoria,
          titulo: rankingData.titulo,
          respuesta: inputRespuesta,
          posicionesOcultas
        })
      });
      const data = await res.json();

      if (data.yaVisible) {
        setMensajeFeedback({ tipo: 'alerta', texto: data.mensaje });
        setInputRespuesta('');
        return;
      }

      if (data.acierto) {
        const usoPista = pistasUsadas[data.posicion];
        const puntosSumados = usoPista ? 1 : 3;
        const nombreActual = jugadores[jugadorTurno].nombre;

        setPuntos((prev) => ({
          ...prev,
          [nombreActual]: (prev[nombreActual] ?? 0) + puntosSumados
        }));

        const puestosActualizados = puestos.map((p) =>
          p.posicion === data.posicion
            ? { ...p, oculto: false, valor: data.valorReal }
            : p
        );
        setPuestos(puestosActualizados);
        setInputRespuesta('');

        const textoAcierto = `¡${nombreActual} descubre #${data.posicion} «${data.valorReal}» (+${puntosSumados} ${puntosSumados === 1 ? 'pt' : 'pts'})!`;
        setMensajeFeedback({ tipo: 'exito', texto: textoAcierto });
        avisoSeqRef.current += 1;
        setEventoAviso({ n: avisoSeqRef.current, tipo: 'acierto', texto: textoAcierto });

        const quedanOcultos = puestosActualizados.some((p) => p.oculto);
        if (!quedanOcultos) {
          setJugadorInicialRonda((jugadorInicialRonda + 1) % jugadores.length);
          setTimeout(() => finalizarRonda(), 1200);
        }
      } else {
        setElementosRojos(true);
        const textoFallo = `¡Fallo! «${inputRespuesta}» no está en el ranking.`;
        setMensajeFeedback({ tipo: 'error', texto: textoFallo });
        avisoSeqRef.current += 1;
        setEventoAviso({ n: avisoSeqRef.current, tipo: 'fallo', texto: textoFallo });

        setTimeout(() => {
          setElementosRojos(false);
          manejarFalloOTiempoAgotado('fallo');
        }, 1500);
      }
    } catch {
      alert('Error al validar respuesta.');
    }
  };

  const manejarFalloOTiempoAgotado = async (tipoFallo) => {
    const nuevosBloqueos = { ...pistasBloqueadas };
    puestos.forEach((p) => {
      if (p.oculto && !pistasUsadas[p.posicion]) {
        nuevosBloqueos[p.posicion] = true;
      }
    });
    setPistasBloqueadas(nuevosBloqueos);

    let siguienteIdx = (jugadorTurno + 1) % jugadores.length;
    let intentosBucle = 0;
    while (jugadoresIntentados.includes(siguienteIdx) && intentosBucle < jugadores.length) {
      siguienteIdx = (siguienteIdx + 1) % jugadores.length;
      intentosBucle++;
    }

    if (!jugadoresIntentados.includes(siguienteIdx)) {
      setJugadorTurno(siguienteIdx);
      setJugadoresIntentados([...jugadoresIntentados, siguienteIdx]);
      setEsRebote(true);
      setIntento((prev) => prev + 1);
      setMotivo(tipoFallo);
      setInputRespuesta('');
      setMensajeFeedback(null);
    } else {
      setJugadorInicialRonda((jugadorInicialRonda + 1) % jugadores.length);
      try {
        const res = await fetch('/api/rankings/solucion', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            categoria: rankingData.categoria,
            titulo: rankingData.titulo
          })
        });
        const data = await res.json();
        setSolucionFinal(data.elementos);
        setPaso('solucion');
      } catch {
        finalizarRonda();
      }
    }
  };

  const finalizarRonda = () => {
    setJugadorTurno(jugadorInicialRonda);
    setPaso('resumen_ronda');
  };

  const avanzarSiguienteRonda = () => {
    if (rondaActual >= MAX_RONDAS) {
      setPaso('fin_partida');
    } else {
      setRondaActual((prev) => prev + 1);
      setPaso('categoria');
    }
  };

  const rankingOrdenado = [...jugadores].sort(
    (a, b) => (puntos[b.nombre] ?? 0) - (puntos[a.nombre] ?? 0)
  );
  const maximoPuntos = rankingOrdenado.length ? (puntos[rankingOrdenado[0].nombre] ?? 0) : 0;
  const ganadores = maximoPuntos > 0
    ? rankingOrdenado.filter((j) => (puntos[j.nombre] ?? 0) === maximoPuntos)
    : [];

  const enPartidaActiva = paso !== 'setup';

  if (errorCarga) {
    return (
      <div className="rk-contenedor">
        <section className="game">
          <div className="panel center qq-menu-panel">
            <h2 className="title qq-main-title">Completar Rankings</h2>
            <p className="error">No se pudo conectar con el servidor.</p>
            <button type="button" className="big full qq-btn-principal" onClick={() => window.location.reload()}>
              <Icon name="refresh" size={20} /> Reintentar
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className={`rk-contenedor ${enPartidaActiva ? 'qq-en-partida' : ''}`}>
      <Aviso evento={eventoAviso} />

      {/* 1. CONFIGURACIÓN DE JUGADORES */}
      {paso === 'setup' && (
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
              <label className="qq-label-destacado" htmlFor="num-jugadores-rk">
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
                  id="num-jugadores-rk"
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

      {/* 2. SELECTOR DE CATEGORÍA */}
      {paso === 'categoria' && (
        <SelectorCategorias
          categorias={categoriasDatos?.categorias || []}
          rondaActual={rondaActual}
          maxRondas={MAX_RONDAS}
          turnoNombre={jugadores[jugadorTurno]?.nombre}
          onElegir={(catNombre) => cargarRanking(catNombre, jugadorTurno)}
          onSalir={() => (rondaActual === 1 ? setPaso('setup') : setModalSalirPortada(true))}
          onAyuda={onAbrirAyuda}
          aviso="Elige una temática para cargar el ranking y comenzar el turno."
        />
      )}

      {/* 3. JUGANDO */}
      {paso === 'jugando' && rankingData && (
        <TurnoRanking
          key={`${rondaActual}-${jugadores[jugadorTurno]?.id}-${intento}`}
          jugador={jugadores[jugadorTurno]}
          jugadores={jugadores}
          puntos={puntos}
          rondaActual={rondaActual}
          esRebote={esRebote}
          motivo={motivo}
          rankingData={rankingData}
          puestos={puestos}
          pistasUsadas={pistasUsadas}
          pistasBloqueadas={pistasBloqueadas}
          inputRespuesta={inputRespuesta}
          setInputRespuesta={setInputRespuesta}
          onAbrirPista={abrirPista}
          onEnviarRespuesta={enviarRespuesta}
          onPasarTurno={() => manejarFalloOTiempoAgotado('rebote')}
          onTiempoAgotado={() => manejarFalloOTiempoAgotado('tiempo')}
          onSalirPortada={() => setModalSalirPortada(true)}
          mensajeFeedback={mensajeFeedback}
          elementosRojos={elementosRojos}
        />
      )}

      {/* 4. MODAL PISTA */}
      {modalPista && (
        <div className="rg-modal-fondo" onClick={() => setModalPista(null)}>
          <div className="rg-modal qq-modal-ayuda" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="qq-modal-ayuda-header">
              <span className="qq-ayuda-badge">💡 Pista del ranking</span>
              <h3>Puesto #{modalPista.posicion}</h3>
            </div>
            <p className="rk-modal-texto-pista">{modalPista.pista}</p>
            <p className="hint" style={{ textAlign: 'center', marginBottom: '1.2rem', fontSize: '0.9rem' }}>
              Recuerda: si aciertas este puesto habiendo visto la pista sumarás <strong>1 punto</strong> en lugar de 3.
            </p>
            <button type="button" className="big full qq-btn-principal" onClick={() => setModalPista(null)}>
              ¡Entendido!
            </button>
          </div>
        </div>
      )}

      {/* 5. SOLUCIÓN (CUANDO NADIE COMPLETA EL RANKING) */}
      {paso === 'solucion' && solucionFinal && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            categoria={{ nombre: rankingData?.categoria, icono: 'trophy' }}
            etiqueta={`Ronda ${rondaActual} de ${MAX_RONDAS} · Solución`}
            titulo={rankingData?.titulo || 'Fin de la ronda'}
          >
            <div className="qqp-identidad">
              <span className="qqp-identidad-icono"><Icon name="eye" size={16} strokeWidth={2.5} /></span>
              <span>Nadie completó el ranking. ¡Así quedaban todos los puestos!</span>
            </div>
          </Cabecera>

          <div className="qqp-tarjeta">
            <p className="qqp-carta-cara-titulo" style={{ marginBottom: '0.8rem' }}>
              <Icon name="trophy" size={16} /> Solución completa
            </p>
            <div className="rk-lista-ranking">
              {solucionFinal.map((sol) => {
                const acertadoPorJugador = puestos.some((p) => p.posicion === sol.posicion && !p.oculto);
                return (
                  <div
                    key={sol.posicion}
                    className={`rk-fila-puesto ${acertadoPorJugador ? 'rk-resuelto' : 'rk-fallado-solucion'}`}
                  >
                    <span className="rk-pos">#{sol.posicion}</span>
                    <span className="rk-val">{sol.valor}</span>
                    {acertadoPorJugador ? (
                      <span className="rk-check"><Icon name="check" size={20} strokeWidth={2.5} /></span>
                    ) : (
                      <span className="rk-tag-no-adivinado">No descubierto</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="qqp-barra">
            <BotonPrincipal onClick={finalizarRonda}>
              <Icon name="trophy" size={20} /> Ver clasificación de la ronda
            </BotonPrincipal>
          </div>
        </section>
      )}

      {/* 6. RESUMEN DE RONDA */}
      {paso === 'resumen_ronda' && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            etiqueta={`Ronda ${rondaActual} de ${MAX_RONDAS} completada`}
            titulo="Puntuaciones de la ronda"
          >
            {rankingData && (
              <div className="qqp-identidad">
                <span className="qqp-identidad-icono"><Icon name="check" size={16} strokeWidth={2.5} /></span>
                <span>Ranking: <strong>«{rankingData.titulo}»</strong></span>
              </div>
            )}
          </Cabecera>

          <div className="qqp-tarjeta">
            <p className="qqp-carta-cara-titulo" style={{ marginBottom: '0.8rem' }}>
              <Icon name="trophy" size={16} /> Clasificación general
            </p>
            <ul className="qqp-rivales">
              {rankingOrdenado.map((j, i) => {
                const pts = puntos[j.nombre] ?? 0;
                const lider = maximoPuntos > 0 && pts === maximoPuntos;
                return (
                  <li key={j.id} className="qqp-rival" style={{ '--c': colorJugador(indiceColor(j, i)) }}>
                    <span className="qqp-rival-avatar">{lider ? '👑' : i + 1}</span>
                    <span className="qqp-rival-datos">
                      <span className="qqp-rival-nombre">{lider ? 'Líder actual' : `Puesto ${i + 1}`}</span>
                      <strong className="qqp-rival-tarjeta">{j.nombre}</strong>
                    </span>
                    <span className="rk-ranking-pts">{pts} pts</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="qqp-barra">
            <BotonPrincipal onClick={avanzarSiguienteRonda}>
              <Icon name="play" size={20} />
              {rondaActual < MAX_RONDAS
                ? `Jugar ronda ${rondaActual + 1} de ${MAX_RONDAS}`
                : 'Ver podio final'}
            </BotonPrincipal>
            <EnlaceSecundario onClick={() => setPaso('fin_partida')}>
              Finalizar partida anticipadamente
            </EnlaceSecundario>
          </div>
        </section>
      )}

      {/* 7. PODIO FINAL */}
      {paso === 'fin_partida' && (
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
              {rankingOrdenado.map((j, i) => {
                const pts = puntos[j.nombre] ?? 0;
                const lider = maximoPuntos > 0 && pts === maximoPuntos;
                return (
                  <li key={j.id} className="qqp-rival" style={{ '--c': colorJugador(indiceColor(j, i)) }}>
                    <span className="qqp-rival-avatar">{lider ? '👑' : i + 1}</span>
                    <span className="qqp-rival-datos">
                      <span className="qqp-rival-nombre">{lider ? '¡Ganador!' : `Puesto ${i + 1}`}</span>
                      <strong className="qqp-rival-tarjeta">{j.nombre}</strong>
                    </span>
                    <span className="rk-ranking-pts">{pts} pts</span>
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