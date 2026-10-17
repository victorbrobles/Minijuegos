// client/src/games/Rankings/RankingsLocal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import GameIntro from '../../components/GameIntro.jsx';
import CategoryCard from '../../components/CategoryCard.jsx';
import './Rankings.css';

const TIEMPO_TURNO = 90;
const PREPARACION_S = 3;
const MAX_RONDAS = 15;
const MIN_JUGADORES = 3;
const MAX_JUGADORES = 15;

function TurnoRanking({
  jugador,
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
  mensajeFeedback
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

  return (
    <section className="game">
      {motivo && (
        <p className="rf-aviso" role="status">
          <Icon name={motivo === 'tiempo' ? 'hourglass' : 'refresh'} size={22} />
          {motivo === 'tiempo' ? '¡Se acabó el tiempo!' : '¡Rebote!'} Le toca a <strong>{jugador.nombre}</strong>
        </p>
      )}

      {!esRebote && (
        <div className="starter">
          <Icon name="dice" size={28} />
          <p>Turno de <strong>{jugador.nombre}</strong></p>
        </div>
      )}

      <div className="hud">
        <span className="chip"><Icon name="users" size={18} />{jugador.nombre}</span>
        <span className="chip alt">{esRebote ? 'Rebote' : `Ronda ${rondaActual} de ${MAX_RONDAS}`}</span>
      </div>

      {preparando && (
        <div className="rk-prep-card" role="status">
          <Icon name="clock" size={24} />
          <span>¡Prepárate, <strong>{jugador.nombre}</strong>! El tiempo empieza en <strong>{prep}</strong>…</span>
        </div>
      )}

      <div className="panel rk-tablero">
        <p className="categoria"><Icon name="trophy" size={16} />{rankingData.categoria}</p>
        <h2 className="rk-ranking-titulo">{rankingData.titulo}</h2>
        <p className="rk-ranking-desc">{rankingData.descripcion}</p>

        <div className="timer" role="timer" aria-label="Tiempo restante">
          <div
            className={`timer-bar${!preparando && restante <= 15 ? ' low' : ''}`}
            style={{ width: preparando ? '100%' : `${(restante / TIEMPO_TURNO) * 100}%` }}
          />
        </div>
        <p className="timer-text">
          <Icon name="clock" size={16} />
          {preparando ? `Preparados… ${prep}` : `${Math.ceil(restante)} s`}
        </p>

        {mensajeFeedback && (
          <div className={`rk-feedback rk-feedback-${mensajeFeedback.tipo}`}>
            {mensajeFeedback.texto}
          </div>
        )}

        <div className="rk-lista-ranking">
          {puestos.map((p) => (
            <div
              key={p.posicion}
              className={`rk-fila-puesto ${p.oculto ? 'rk-oculto' : 'rk-resuelto'}`}
            >
              <span className="rk-pos">#{p.posicion}</span>

              {!p.oculto ? (
                <>
                  <span className="rk-val">{p.valor}</span>
                  <span className="rk-check"><Icon name="check" size={20} strokeWidth={2.5} /></span>
                </>
              ) : (
                <div className="rk-slot-acciones">
                  <span className="rk-slot-oculto-texto">
                    [ ? ] Puesto por descubrir
                  </span>

                  <button
                    type="button"
                    disabled={preparando || pistasBloqueadas[p.posicion]}
                    className={`rk-btn-pista ${pistasUsadas[p.posicion] ? 'usada' : ''}`}
                    onClick={() => !preparando && onAbrirPista(p)}
                    title={
                      pistasBloqueadas[p.posicion]
                        ? 'Pista bloqueada: el jugador anterior falló sin pedirla'
                        : 'Pedir pista (acertar sumará 1 punto en vez de 3)'
                    }
                  >
                    <Icon name="eye" size={16} />
                    {pistasUsadas[p.posicion]
                      ? 'Ver pista'
                      : pistasBloqueadas[p.posicion]
                      ? 'Bloqueada'
                      : 'Pista (1 pt)'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <form onSubmit={onEnviarRespuesta} className="rk-form-respuesta">
          <label className="field-label" htmlFor="rk-input-global">
            Introduce cualquier elemento que falte en el ranking:
          </label>
          <div className="rk-form-row">
            <input
              id="rk-input-global"
              type="text"
              autoFocus
              autoComplete="off"
              disabled={preparando}
              placeholder="Escribe el nombre o elemento…"
              value={inputRespuesta}
              onChange={(e) => setInputRespuesta(e.target.value)}
              required
            />
            <button type="submit" disabled={preparando || !inputRespuesta.trim()} className="ok">
              <Icon name="check" size={18} strokeWidth={2.5} />Enviar
            </button>
          </div>
        </form>
      </div>

      <button
        type="button"
        disabled={preparando}
        className="secondary danger full"
        onClick={() => onPasarTurno('rebote')}
      >
        <Icon name="refresh" size={20} />Pasar turno / Fallo (Rebote)
      </button>
    </section>
  );
}

export default function RankingsLocal({ onVolver, onExit }) {
  const navigate = useNavigate();

  const [paso, setPaso] = useState('selector');
  const [modalAyuda, setModalAyuda] = useState(false);
  const [categoriasDatos, setCategoriasDatos] = useState(null);
  const [errorCarga, setErrorCarga] = useState(false);

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

  useEffect(() => {
    fetch('/api/rankings/categorias')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => setCategoriasDatos(data))
      .catch(() => setErrorCarga(true));
  }, []);

  const handleNumJugadoresChange = (e) => {
    const num = parseInt(e.target.value, 10);
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
      setPaso('jugando');
    } catch {
      alert('Error al conectar con la base de datos de rankings.');
    }
  };

  const iniciarPartidaConCategoria = async (catNombre) => {
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

    await cargarRanking(catNombre, primerJugador);
  };

  const abrirPista = (puesto) => {
    if (pistasBloqueadas[puesto.posicion]) return;
    setPistasUsadas((prev) => ({ ...prev, [puesto.posicion]: true }));
    setModalPista({ posicion: puesto.posicion, pista: puesto.pista });
  };

  const enviarRespuesta = async (e) => {
    e.preventDefault();
    if (!inputRespuesta.trim()) return;

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
        setMensajeFeedback({
          tipo: 'exito',
          texto: `¡Correcto! "${data.valorReal}" pertenece al puesto #${data.posicion} (+${puntosSumados} pts).`
        });

        const quedanOcultos = puestosActualizados.some((p) => p.oculto);
        if (!quedanOcultos) {
          setTimeout(() => finalizarRonda(true), 1200);
        }
      } else {
        manejarFalloOTiempoAgotado('fallo');
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

    const noHanJugado = [];
    for (let i = 0; i < jugadores.length; i++) {
      if (!jugadoresIntentados.includes(i)) noHanJugado.push(i);
    }

    if (noHanJugado.length > 0) {
      const siguienteRebote = noHanJugado[Math.floor(Math.random() * noHanJugado.length)];
      setJugadorTurno(siguienteRebote);
      setJugadoresIntentados([...jugadoresIntentados, siguienteRebote]);
      setEsRebote(true);
      setIntento((prev) => prev + 1);
      setMotivo(tipoFallo);
      setInputRespuesta('');
      setMensajeFeedback(null);
    } else {
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
        finalizarRonda(false);
      }
    }
  };

  const finalizarRonda = (completado) => {
    if (completado && esRebote) {
      setJugadorInicialRonda(jugadorTurno);
    } else {
      const siguiente = (jugadorInicialRonda + 1) % jugadores.length;
      setJugadorInicialRonda(siguiente);
      setJugadorTurno(siguiente);
    }
    setPaso('resumen_ronda');
  };

  const avanzarSiguienteRonda = () => {
    if (rondaActual >= MAX_RONDAS) {
      setPaso('fin_partida');
    } else {
      setRondaActual((prev) => prev + 1);
      setPaso('seleccion_ronda');
    }
  };

  if (errorCarga) {
    return (
      <section className="game">
        <GameIntro gameId="rankings" titulo="Completar Rankings" />
        <p className="error">No se pudo conectar con el servidor.</p>
        <button onClick={() => window.location.reload()}><Icon name="refresh" size={20} />Reintentar</button>
      </section>
    );
  }

  if (!categoriasDatos && paso === 'selector') {
    return (
      <section className="game">
        <GameIntro gameId="rankings" titulo="Completar Rankings" />
        <p className="loading">Cargando categorías…</p>
      </section>
    );
  }

  return (
    <div className="rk-contenedor">
      {paso === 'selector' && (
        <>
          <button
            type="button"
            className="rk-btn-ayuda"
            onClick={() => setModalAyuda(true)}
            title="Reglas y sistema de puntuación"
          >
            <span className="rk-btn-ayuda-signo">?</span>
          </button>

          {modalAyuda && (
            <div className="rg-modal-fondo" onClick={() => setModalAyuda(false)}>
              <div className="rg-modal rk-modal-ayuda" onClick={(e) => e.stopPropagation()}>
                <div className="rk-modal-header">
                  <span className="rk-modal-signo-title">?</span>
                  <h3>¿Cómo se juega a Completar Rankings?</h3>
                </div>

                <div className="rk-modal-cuerpo">
                  <p><strong>1. Dinámica del juego:</strong></p>
                  <ul>
                    <li>Elige categoría y aparecerá un ranking real con varios puestos ocultos.</li>
                    <li>Un jugador al azar empieza la ronda con <strong>90 segundos</strong> de tiempo.</li>
                    <li><strong>No hace falta indicar el puesto:</strong> escribe cualquier elemento que creas que falta; si es correcto, se colocará en su posición automáticamente.</li>
                    <li>Si fallas o se agota el tiempo, el turno pasa por <strong>rebote</strong> a otro jugador aleatorio que aún no haya jugado.</li>
                    <li>Si nadie completa el ranking tras probar todos, se revela la <strong>solución completa</strong> antes de mostrar las puntuaciones.</li>
                  </ul>

                  <p><strong>2. Pistas y bloqueo en rebote:</strong></p>
                  <ul>
                    <li>Puedes solicitar una pista para un puesto concreto antes de responder.</li>
                    <li><strong>Regla de rebote:</strong> Si un jugador falla o pasa su turno sin haber pedido la pista de un puesto, dicha pista queda <strong>bloqueada</strong> para los jugadores que reciban el rebote.</li>
                  </ul>

                  <p><strong>3. Sistema de puntuación:</strong></p>
                  <div className="rk-tabla-puntos">
                    <div className="rk-puntos-fila acierto-sin-pista">
                      <span>🎯 Acierto sin pista</span>
                      <strong>+3 puntos</strong>
                    </div>
                    <div className="rk-puntos-fila acierto-con-pista">
                      <span>💡 Acierto con pista</span>
                      <strong>+1 punto</strong>
                    </div>
                    <div className="rk-puntos-fila fallo">
                      <span>❌ Fallo o tiempo agotado</span>
                      <strong>0 puntos (Rebote)</strong>
                    </div>
                  </div>
                </div>

                <div className="rg-modal-acciones">
                  <button className="big full" onClick={() => setModalAyuda(false)}>
                    Entendido
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* 1. SELECTOR PRINCIPAL */}
      {paso === 'selector' && (
        <section className="game">
          <GameIntro gameId="rankings" titulo="Completar Rankings" />

          <div className="panel">
            <div className="hud" style={{ marginBottom: '1rem' }}>
              <button className="btn-back-inline" onClick={onVolver}>
                &larr; Cambiar a modo Online
              </button>
            </div>

            <h3 className="panel-title"><Icon name="users" size={22} />Jugadores</h3>
            <label className="field-label" htmlFor="num-jugadores">
              Número de jugadores ({MIN_JUGADORES} a {MAX_JUGADORES})
            </label>
            <select
              id="num-jugadores"
              value={jugadores.length}
              onChange={handleNumJugadoresChange}
            >
              {Array.from({ length: MAX_JUGADORES - MIN_JUGADORES + 1 }, (_, i) => (
                <option key={i + MIN_JUGADORES} value={i + MIN_JUGADORES}>
                  {i + MIN_JUGADORES} jugadores
                </option>
              ))}
            </select>

            <span className="field-label">Nombres</span>
            <div className="names-grid">
              {jugadores.map((j, idx) => (
                <input
                  key={j.id}
                  type="text"
                  value={j.nombre}
                  onChange={(e) => handleNombreChange(idx, e.target.value)}
                  placeholder={`Jugador ${j.id}`}
                  aria-label={`Nombre del jugador ${j.id}`}
                  maxLength={30}
                />
              ))}
            </div>
          </div>

          <h3 className="section-title">Elige una categoría</h3>
          <div className="cat-grid">
            <CategoryCard todas nombre="Todas las categorías" onClick={() => iniciarPartidaConCategoria(null)} />
            {categoriasDatos.categorias.map((c, i) => (
              <CategoryCard
                key={c.nombre}
                nombre={c.nombre}
                indice={i}
                onClick={() => iniciarPartidaConCategoria(c.nombre)}
              />
            ))}
          </div>
        </section>
      )}

      {/* 2. ELECCIÓN ENTRE RONDAS */}
      {paso === 'seleccion_ronda' && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="flagFinish" size={18} />Ronda {rondaActual} de {MAX_RONDAS}</span>
            <span className="chip alt">Turno de: {jugadores[jugadorTurno]?.nombre}</span>
          </div>

          <div className="starter">
            <Icon name="dice" size={28} />
            <p>Abre la ronda <strong>{jugadores[jugadorTurno]?.nombre}</strong></p>
          </div>

          <h3 className="section-title">{jugadores[jugadorTurno]?.nombre}, elige una categoría</h3>
          <div className="cat-grid">
            <CategoryCard todas nombre="Todas las categorías" onClick={() => cargarRanking(null, jugadorTurno)} />
            {categoriasDatos.categorias.map((c, i) => (
              <CategoryCard
                key={c.nombre}
                nombre={c.nombre}
                indice={i}
                onClick={() => cargarRanking(c.nombre, jugadorTurno)}
              />
            ))}
          </div>
        </section>
      )}

      {/* 3. JUGANDO */}
      {paso === 'jugando' && rankingData && (
        <TurnoRanking
          key={`${rondaActual}-${jugadores[jugadorTurno]?.id}-${intento}`}
          jugador={jugadores[jugadorTurno]}
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
          mensajeFeedback={mensajeFeedback}
        />
      )}

      {/* 4. MODAL PISTA */}
      {modalPista && (
        <div className="rg-modal-fondo">
          <div className="rg-modal" role="dialog" aria-modal="true">
            <h3>Pista para el puesto #{modalPista.posicion}</h3>
            <p className="rk-modal-texto-pista">{modalPista.pista}</p>
            <p className="rg-modal-puntos">
              Recuerda: si aciertas este puesto habiendo visto la pista sumarás <strong>1 punto</strong> en lugar de 3.
            </p>
            <div className="rg-modal-acciones">
              <button className="big full" onClick={() => setModalPista(null)}>Entendido</button>
            </div>
          </div>
        </div>
      )}

      {/* 5. SOLUCIÓN */}
      {paso === 'solucion' && solucionFinal && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="flagFinish" size={18} />Ronda {rondaActual} de {MAX_RONDAS}</span>
          </div>

          <div className="rf-aviso" style={{ background: '#fee2e2', color: '#991b1b', border: '1.5px solid #fca5a5' }}>
            <Icon name="hourglass" size={22} />
            ¡Ronda terminada! Nadie ha conseguido completar el ranking.
          </div>

          <div className="panel rk-tablero">
            <p className="categoria"><Icon name="trophy" size={16} />{rankingData?.categoria}</p>
            <h2 className="rk-ranking-titulo">{rankingData?.titulo}</h2>
            <p className="rk-ranking-desc">Esta era la solución completa del ranking:</p>

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

          <button className="big full" onClick={() => finalizarRonda(false)}>
            <Icon name="trophy" size={22} />Ver puntuaciones de la ronda
          </button>
        </section>
      )}

      {/* 6. RESUMEN */}
      {paso === 'resumen_ronda' && (
        <section className="game">
          <div className="end-card">
            <span className="end-icon"><Icon name="trophy" size={44} /></span>
            <h1 className="title">Puntuaciones tras la Ronda {rondaActual}</h1>
            <div className="scoreboard">
              {Object.entries(puntos)
                .sort(([, a], [, b]) => b - a)
                .map(([nombre, pts], idx) => (
                  <div key={nombre} className={`score-row ${idx === 0 ? 'first' : ''}`}>
                    <span className="score-name">
                      {idx === 0 ? <Icon name="crown" size={22} /> : <span className="pos">{idx + 1}</span>}
                      {nombre}
                    </span>
                    <span className="score-pts">{pts} pts</span>
                  </div>
                ))}
            </div>
          </div>
          <div className="actions">
            <button onClick={avanzarSiguienteRonda}>
              <Icon name="play" size={20} />
              {rondaActual < MAX_RONDAS ? `Continuar: ronda ${rondaActual + 1}` : 'Ver resultados finales'}
            </button>
            <button className="secondary" onClick={() => setPaso('fin_partida')}>
              <Icon name="flagFinish" size={20} />Finalizar el juego
            </button>
          </div>
        </section>
      )}

      {/* 7. FINAL */}
      {paso === 'fin_partida' && (
        <section className="game">
          <div className="end-card">
            <span className="end-icon"><Icon name="crown" size={44} /></span>
            <h1 className="title">Puntuaciones finales</h1>
            <div className="scoreboard">
              {Object.entries(puntos)
                .sort(([, a], [, b]) => b - a)
                .map(([nombre, pts], idx) => (
                  <div key={nombre} className={`score-row ${idx === 0 ? 'first' : ''}`}>
                    <span className="score-name">
                      <span className="pos">{idx + 1}</span>
                      {nombre}
                    </span>
                    <span className="score-pts">{pts} pts</span>
                  </div>
                ))}
            </div>
          </div>
          <div className="actions">
            <button onClick={() => setPaso('selector')}>
              <Icon name="refresh" size={20} />Nueva partida
            </button>
            <button className="secondary danger" onClick={() => navigate('/')}>
              <Icon name="door" size={20} />Salir al menú principal
            </button>
          </div>
        </section>
      )}
    </div>
  );
}