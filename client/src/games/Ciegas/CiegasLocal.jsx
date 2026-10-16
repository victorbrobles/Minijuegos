// client/src/games/Ciegas/CiegasLocal.jsx
import React, { useState, useEffect } from 'react';
import Icon from '../../components/Icon.jsx';
import GameIntro from '../../components/GameIntro.jsx';
import './Ciegas.css';
import '../Adivina/Adivina.css';

const MIN_JUGADORES = 4;
const MAX_JUGADORES = 10;
const CATEGORIAS = [
  { id: 'comida', label: 'Comida' },
  { id: 'deporte', label: 'Deporte' },
  { id: 'famosos', label: 'Famosos' },
  { id: 'culturapop', label: 'Cultura Pop' },
  { id: 'geografia', label: 'Geografía' }
];

export default function CiegasLocal({ onVolver, onExit }) {
  const [fase, setFase] = useState('setup'); // 'setup' | 'cuenta_atras' | 'armando' | 'pasar_movil' | 'votando' | 'resolucion' | 'final'
  const [modalAyuda, setModalAyuda] = useState(false);

  const [numJugadores, setNumJugadores] = useState(4);
  const [jugadores, setJugadores] = useState([
    { id: 1, nombre: 'Jugador 1' },
    { id: 2, nombre: 'Jugador 2' },
    { id: 3, nombre: 'Jugador 3' },
    { id: 4, nombre: 'Jugador 4' }
  ]);
  const [puntos, setPuntos] = useState({});

  const [categoria, setCategoria] = useState('comida');
  const [rondaNum, setRondaNum] = useState(1);
  const [usados, setUsados] = useState([]);

  // Jugador activo que arma el ranking
  const [jugadorActivoIdx, setJugadorActivoIdx] = useState(0);

  // Datos de la ronda
  const [rankingData, setRankingData] = useState(null);
  const [cuentaAtras, setCuentaAtras] = useState(5);
  const [indiceSecuencia, setIndiceSecuencia] = useState(0);
  const [topArmado, setTopArmado] = useState([null, null, null, null, null]);

  // Votación pasando el móvil
  const [votanteActualIdx, setVotanteActualIdx] = useState(0);
  const [votos, setVotos] = useState({});
  const [aciertosReales, setAciertosReales] = useState(0);

  const handleNumChange = (e) => {
    const num = parseInt(e.target.value, 10);
    setNumJugadores(num);
    const nuevos = Array.from({ length: num }, (_, i) => ({
      id: i + 1,
      nombre: jugadores[i]?.nombre || `Jugador ${i + 1}`
    }));
    setJugadores(nuevos);
  };

  const handleNombreChange = (idx, val) => {
    const nuevos = [...jugadores];
    nuevos[idx] = { ...nuevos[idx], nombre: val };
    setJugadores(nuevos);
  };

  const iniciarPartida = () => {
    const lista = jugadores.map((j) => ({
      ...j,
      nombre: j.nombre.trim() || `Jugador ${j.id}`
    }));
    setJugadores(lista);

    const scores = {};
    lista.forEach((j) => { scores[j.id] = 0; });
    setPuntos(scores);

    setRondaNum(1);
    setUsados([]);

    const primerActivo = Math.floor(Math.random() * lista.length);
    setJugadorActivoIdx(primerActivo);
    cargarNuevaRonda(1, [], primerActivo);
  };

  const cargarNuevaRonda = async (ronda, usadosLista, activoIdx) => {
    try {
      const res = await fetch('/api/ciegas/iniciar-local', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoria, usados: usadosLista })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setRankingData(data);
      setUsados([...usadosLista, data.rankingId]);
      setTopArmado([null, null, null, null, null]);
      setIndiceSecuencia(0);
      setVotos({});
      setCuentaAtras(5);
      setFase('cuenta_atras');
    } catch {
      alert('Error cargando el ranking.');
    }
  };

  useEffect(() => {
    let timer;
    if (fase === 'cuenta_atras' && cuentaAtras > 0) {
      timer = setTimeout(() => setCuentaAtras((prev) => prev - 1), 1000);
    } else if (fase === 'cuenta_atras' && cuentaAtras === 0) {
      setFase('armando');
    }
    return () => clearTimeout(timer);
  }, [fase, cuentaAtras]);

  const handleColocar = (slotIdx) => {
    if (topArmado[slotIdx] !== null) return;

    const itemActual = rankingData.itemsSecuencia[indiceSecuencia];
    const nuevoTop = [...topArmado];
    nuevoTop[slotIdx] = itemActual;
    setTopArmado(nuevoTop);

    const sig = indiceSecuencia + 1;
    if (sig < 5) {
      setIndiceSecuencia(sig);
    } else {
      let correctos = 0;
      nuevoTop.forEach((nom, idx) => {
        const orig = rankingData.itemsOriginales.find((it) => it.nombre === nom);
        if (orig && orig.posicionReal === idx + 1) correctos += 1;
      });
      setAciertosReales(correctos);

      let primerVotante = 0;
      if (primerVotante === jugadorActivoIdx) primerVotante = 1;
      setVotanteActualIdx(primerVotante);
      setFase('pasar_movil');
    }
  };

  const registrarVoto = (num) => {
    const votante = jugadores[votanteActualIdx];
    const nuevosVotos = { ...votos, [votante.id]: num };
    setVotos(nuevosVotos);

    let sig = votanteActualIdx + 1;
    if (sig === jugadorActivoIdx) sig += 1;

    if (sig < jugadores.length) {
      setVotanteActualIdx(sig);
      setFase('pasar_movil');
    } else {
      // Cálculo de puntos:
      // El jugador activo suma el total de votos que le han asignado los demás
      const activo = jugadores[jugadorActivoIdx];
      const sumaPuntosOtorgados = Object.values(nuevosVotos).reduce(
        (acc, val) => acc + (Number(val) || 0),
        0
      );

      setPuntos((prev) => ({
        ...prev,
        [activo.id]: (prev[activo.id] || 0) + sumaPuntosOtorgados
      }));

      setFase('resolucion');
    }
  };

  const siguienteRonda = () => {
    const sigRonda = rondaNum + 1;
    const sigActivo = (jugadorActivoIdx + 1) % jugadores.length;
    setRondaNum(sigRonda);
    setJugadorActivoIdx(sigActivo);
    cargarNuevaRonda(sigRonda, usados, sigActivo);
  };

  const ranking = [...jugadores].sort((a, b) => (puntos[b.id] ?? 0) - (puntos[a.id] ?? 0));
  const maximo = ranking.length ? (puntos[ranking[0].id] ?? 0) : 0;
  const ganadores = maximo > 0 ? ranking.filter((j) => (puntos[j.id] ?? 0) === maximo) : [];
  const jugadorActivo = jugadores[jugadorActivoIdx];

  return (
    <div className="cancion-contenedor">
      {/* AYUDA */}
      {fase === 'setup' && (
        <>
          <button
            type="button"
            className="btn-ayuda-flotante"
            onClick={() => setModalAyuda(true)}
            title="Reglas del juego"
          >
            <span className="btn-ayuda-flotante-signo">?</span>
          </button>

          {modalAyuda && (
            <div className="rg-modal-fondo" onClick={() => setModalAyuda(false)}>
              <div className="rg-modal modal-ayuda-juego" onClick={(e) => e.stopPropagation()}>
                <div className="modal-ayuda-header">
                  <span className="modal-ayuda-signo-title">?</span>
                  <h3>¿Cómo se juega a Ranking a Ciegas?</h3>
                </div>

                <div className="modal-ayuda-cuerpo">
                  <p><strong>1. Ranking a Ciegas:</strong></p>
                  <ul>
                    <li>Un jugador es elegido al azar para confeccionar el top 5 de la categoría elegida.</li>
                    <li>Tras 5 segundos de espera, le saldrá el primer elemento y deberá colocarlo en una posición del 1º al 5º.</li>
                    <li><strong>Una vez colocado un elemento, no se puede cambiar de lugar.</strong></li>
                  </ul>
                  <p><strong>2. Votación y Puntos:</strong></p>
                  <ul>
                    <li>Los demás jugadores verán el ranking completo terminado sin saber en qué orden apareció cada ítem.</li>
                    <li>Se pasa el móvil a cada rival para votar cuántos elementos creen que han quedado exactamente en su posición real (de 0 a 5).</li>
                    <li>Cada participante que adivine la cantidad exacta de aciertos se lleva <strong>+3 puntos</strong>.</li>
                  </ul>
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

      {/* 1. SETUP */}
      {fase === 'setup' && (
        <section className="game">
          <GameIntro gameId="rankings" titulo="Ranking a Ciegas" />

          <div className="panel">
            <div className="hud" style={{ marginBottom: '1rem' }}>
              <button className="btn-back-inline" onClick={onVolver}>
                &larr; Cambiar a modo Online
              </button>
            </div>

            <h3 className="panel-title"><Icon name="users" size={22} /> Participantes ({MIN_JUGADORES} a {MAX_JUGADORES})</h3>
            <label className="field-label" htmlFor="num-jugadores-ciegas">
              Número de jugadores
            </label>
            <select
              id="num-jugadores-ciegas"
              value={numJugadores}
              onChange={handleNumChange}
            >
              {Array.from({ length: MAX_JUGADORES - MIN_JUGADORES + 1 }, (_, i) => (
                <option key={i + MIN_JUGADORES} value={i + MIN_JUGADORES}>
                  {i + MIN_JUGADORES} jugadores
                </option>
              ))}
            </select>

            <label className="field-label" htmlFor="cat-ciegas" style={{ marginTop: '0.8rem' }}>
              Categoría
            </label>
            <select
              id="cat-ciegas"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            >
              {CATEGORIAS.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>

            <span className="field-label" style={{ marginTop: '0.8rem' }}>Nombres</span>
            <div className="names-grid">
              {jugadores.map((j, idx) => (
                <input
                  key={j.id}
                  type="text"
                  value={j.nombre}
                  onChange={(e) => handleNombreChange(idx, e.target.value)}
                  placeholder={`Jugador ${j.id}`}
                  maxLength={25}
                  required
                />
              ))}
            </div>
          </div>

          <button className="big full" onClick={iniciarPartida}>
            <Icon name="play" size={24} /> ¡Empezar Partida!
          </button>
        </section>
      )}

      {/* 2. CUENTA ATRÁS 5S */}
      {fase === 'cuenta_atras' && rankingData && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="flagFinish" size={18} />Ronda {rondaNum}</span>
            <span className="chip alt">🎲 Turno de {jugadorActivo?.nombre}</span>
          </div>

          <div className="panel center" style={{ margin: '1.5rem 0' }}>
            <span className="categoria" style={{ textTransform: 'uppercase' }}>{categoria}</span>
            <h2 className="title" style={{ fontSize: '1.3rem', margin: '0.6rem 0 1.2rem' }}>
              {rankingData.tema}
            </h2>

            <div className="cancion-player-box" style={{ padding: '2rem 1rem' }}>
              <span className="hint">Pasa el móvil a <strong>{jugadorActivo?.nombre}</strong></span>
              <p style={{ margin: '0.6rem 0' }}>El primer elemento aparecerá en:</p>
              <div className="cuenta-numero-grande">{cuentaAtras}</div>
            </div>
          </div>
        </section>
      )}

      {/* 3. ARMANDO RANKING A CIEGAS */}
      {fase === 'armando' && rankingData && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="flagFinish" size={18} />Ronda {rondaNum}</span>
            <span className="chip alt">👤 {jugadorActivo?.nombre} colocando #{indiceSecuencia + 1} de 5</span>
          </div>

          <div className="panel">
            <p className="categoria" style={{ textTransform: 'uppercase', textAlign: 'center' }}>{categoria}</p>
            <h3 style={{ textAlign: 'center', margin: '0.4rem 0 1.2rem', color: '#1e1b4b' }}>
              {rankingData.tema}
            </h3>

            <div className="ciegas-item-actual-card">
              <span className="hint small">Elemento a colocar a ciegas:</span>
              <h2 className="ciegas-item-titulo">{rankingData.itemsSecuencia[indiceSecuencia]}</h2>
            </div>

            <p className="hint small" style={{ textAlign: 'center', margin: '1rem 0 0.5rem' }}>
              Selecciona una posición libre para asignarlo:
            </p>

            <div className="ciegas-slots-lista">
              {topArmado.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`ciegas-slot-btn ${item ? 'ocupado' : 'libre'}`}
                  disabled={item !== null}
                  onClick={() => handleColocar(idx)}
                >
                  <span className="ciegas-slot-num">{idx + 1}º</span>
                  <span className="ciegas-slot-text">{item || '— Asignar en este puesto —'}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. PASAR MÓVIL AL SIGUIENTE */}
      {fase === 'pasar_movil' && (
        <section className="game">
          <div className="panel center" style={{ padding: '2.5rem 1.5rem' }}>
            <span className="end-icon"><Icon name="users" size={44} /></span>
            <h2 className="title" style={{ marginTop: '0.8rem' }}>¡Pasa el móvil!</h2>
            <p className="hint" style={{ fontSize: '1.1rem', margin: '1rem 0' }}>
              Entrégaselo a <strong>{jugadores[votanteActualIdx]?.nombre}</strong> para emitir su voto secreto.
            </p>
            <button className="big full" onClick={() => setFase('votando')}>
              Soy {jugadores[votanteActualIdx]?.nombre}, listo para votar
            </button>
          </div>
        </section>
      )}

      {/* 5. VOTACIÓN DE CADA JUGADOR */}
      {fase === 'votando' && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="flagFinish" size={18} />Votación</span>
            <span className="chip alt">Votando: {jugadores[votanteActualIdx]?.nombre}</span>
          </div>

          <div className="panel">
            <p className="categoria" style={{ textTransform: 'uppercase', textAlign: 'center' }}>{categoria}</p>
            <h3 style={{ textAlign: 'center', margin: '0.4rem 0 0.8rem', color: '#1e1b4b' }}>
              {rankingData.tema}
            </h3>
            <p className="hint small" style={{ textAlign: 'center', marginBottom: '1rem' }}>
              Top 5 fijado por <strong>{jugadorActivo?.nombre}</strong> (orden oculto):
            </p>

            <div className="ciegas-top-bloque">
              {topArmado.map((item, idx) => (
                <div key={idx} className="ciegas-top-row">
                  <span className="ciegas-slot-num">{idx + 1}º</span>
                  <span className="ciegas-slot-text">{item}</span>
                </div>
              ))}
            </div>

            <p style={{ textAlign: 'center', fontWeight: '800', margin: '1.2rem 0 0.6rem', color: '#1e1b4b' }}>
              ¿Cuántos elementos crees que están colocados en su posición exacta?
            </p>

            <div className="ciegas-voto-grid">
              {[0, 1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  className="ciegas-btn-voto"
                  onClick={() => registrarVoto(num)}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. RESOLUCIÓN DE LA RONDA */}
      {fase === 'resolucion' && (
        <section className="game">
          <div className="end-card">
            <span className="end-icon"><Icon name="trophy" size={44} /></span>
            <h1 className="title">Resultados de la ronda</h1>
            <p className="categoria" style={{ textTransform: 'uppercase' }}>{categoria}</p>
            <p className="reveal" style={{ fontSize: '1.2rem', margin: '0.4rem 0 1rem' }}>
              {rankingData.tema}
            </p>

            <div className="ciegas-solucion-box">
              <h4 style={{ margin: '0 0 0.8rem', color: '#1e1b4b', textAlign: 'center' }}>
                Top 5 completado por {jugadorActivo?.nombre}:
              </h4>
              {topArmado.map((nom, idx) => (
                <div key={idx} className="ciegas-top-row" style={{ marginBottom: '0.4rem' }}>
                  <span className="ciegas-slot-num">{idx + 1}º</span>
                  <span className="ciegas-slot-text">{nom}</span>
                </div>
              ))}
            </div>

            <div className="panel" style={{ marginTop: '1rem', textAlign: 'left' }}>
              <h4 style={{ color: '#1e1b4b', margin: '0 0 0.6rem' }}>
                Votaciones del grupo:
              </h4>
              {jugadores.map((j) => {
                if (j.id === jugadorActivo?.id) return null;
                const suVoto = votos[j.id] ?? 0;
                return (
                  <div key={j.id} className="ciegas-resumen-voto-row">
                    <span>{j.nombre} le otorgó</span>
                    <span className="pts-verde">+{suVoto} pts</span>
                  </div>
                );
              })}

              <div style={{ marginTop: '0.8rem', paddingTop: '0.8rem', borderTop: '2px dashed #e2e8f0', textAlign: 'center' }}>
                <span style={{ fontSize: '1.05rem', color: '#1e1b4b' }}>
                  🎉 <strong>{jugadorActivo?.nombre}</strong> suma un total de{' '}
                  <strong style={{ color: '#059669', fontSize: '1.2rem' }}>
                    +{Object.values(votos).reduce((acc, v) => acc + (Number(v) || 0), 0)} pts
                  </strong>
                </span>
              </div>
            </div>

            <div className="scoreboard">
              {ranking.map((j, i) => {
                const pts = puntos[j.id] ?? 0;
                const lider = maximo > 0 && pts === maximo;
                return (
                  <div key={j.id} className={`score-row${lider ? ' first' : ''}`}>
                    <span className="score-name">
                      {lider ? <Icon name="crown" size={22} /> : <span className="pos">{i + 1}</span>}
                      {j.nombre}
                    </span>
                    <span className="score-pts">{pts} pts</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="actions">
            <button onClick={siguienteRonda}>
              <Icon name="play" size={20} /> Siguiente ronda ({rondaNum + 1})
            </button>
            <button className="secondary danger" onClick={() => setFase('final')}>
              <Icon name="flagFinish" size={20} /> Finalizar partida
            </button>
          </div>
        </section>
      )}

      {/* 7. PODIO FINAL */}
      {fase === 'final' && (
        <section className="game">
          <div className="end-card">
            <span className="end-icon"><Icon name="crown" size={44} /></span>
            <h1 className="title">Clasificación Final</h1>
            <p className="final-score">
              {ganadores.length === 0
                ? 'Nadie ha conseguido puntos'
                : ganadores.length === 1
                ? <>¡Victoria para {ganadores[0].nombre} con {maximo} puntos!</>
                : <>Empate entre {ganadores.map((g) => g.nombre).join(', ')} con {maximo} puntos</>}
            </p>

            <div className="scoreboard">
              {ranking.map((j, i) => {
                const pts = puntos[j.id] ?? 0;
                const lider = maximo > 0 && pts === maximo;
                return (
                  <div key={j.id} className={`score-row${lider ? ' first' : ''}`}>
                    <span className="score-name">
                      {lider ? <Icon name="crown" size={22} /> : <span className="pos">{i + 1}</span>}
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
            <button className="secondary danger" onClick={onVolver}>
              <Icon name="door" size={20} /> Salir al menú
            </button>
          </div>
        </section>
      )}
    </div>
  );
}