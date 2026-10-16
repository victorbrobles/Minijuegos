// client/src/games/ConfianzaCiega/ConfianzaCiegaLocal.jsx
import React, { useState, useEffect } from 'react';
import Icon from '../../components/Icon.jsx';
import GameIntro from '../../components/GameIntro.jsx';
import './ConfianzaCiega.css';

const MIN_JUGADORES = 3;
const MAX_JUGADORES = 15;
const TIEMPO_MAXIMO_S = 120;
const PREPARACION_S = 10;

export default function ConfianzaCiegaLocal({ onVolver, onExit }) {
  const [fase, setFase] = useState('setup');
  const [modalAyuda, setModalAyuda] = useState(false);

  const [esAdmin, setEsAdmin] = useState(false);
  const [usarPicantes, setUsarPicantes] = useState(false);

  useEffect(() => {
    try {
      const adminToken = localStorage.getItem('admin_token') || 
                         localStorage.getItem('is_admin') || 
                         localStorage.getItem('admin_secret');
      setEsAdmin(Boolean(adminToken));
    } catch {
      setEsAdmin(false);
    }
  }, []);

  const [numJugadores, setNumJugadores] = useState(4);
  const [jugadores, setJugadores] = useState([
    { id: 1, nombre: 'Jugador 1' },
    { id: 2, nombre: 'Jugador 2' },
    { id: 3, nombre: 'Jugador 3' },
    { id: 4, nombre: 'Jugador 4' }
  ]);
  const [puntos, setPuntos] = useState({});

  const [rondaActual, setRondaActual] = useState(1);
  const [ordenTurnos, setOrdenTurnos] = useState([]);
  const [indiceTurno, setIndiceTurno] = useState(0);

  const [opcionesConsignas, setOpcionesConsignas] = useState([]);
  const [consignaElegida, setConsignaElegida] = useState('');
  const [errorCarga, setErrorCarga] = useState(null);

  const [apuestas, setApuestas] = useState({});
  const [indiceApostador, setIndiceApostador] = useState(0);
  const [apuestaNumero, setApuestaNumero] = useState(5);
  const [apuestaCondicion, setApuestaCondicion] = useState('mas');

  const [prep, setPrep] = useState(PREPARACION_S);
  const [restante, setRestante] = useState(TIEMPO_MAXIMO_S);
  const [contadorAciertos, setContadorAciertos] = useState(0);

  const [resultadoRonda, setResultadoRonda] = useState(null);

  const handleNumJugadoresChange = (e) => {
    const num = parseInt(e.target.value, 10);
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

  const iniciarPartida = () => {
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

    pedirConsignas(orden[0], listaActualizada);
  };

  const pedirConsignas = async (idxActivo, lista = jugadores) => {
    setErrorCarga(null);
    try {
      const res = await fetch(`/api/confianzaciega/consignas?includePicantes=${esAdmin && usarPicantes}`);
      const data = await res.json();

      if (data.success && data.consignas && data.consignas.length >= 2) {
        setOpcionesConsignas(data.consignas);
        setConsignaElegida('');
        setApuestas({});
        setContadorAciertos(0);
        setFase('eleccion_consigna');
      } else {
        throw new Error('Error al cargar consignas');
      }
    } catch (err) {
      console.error(err);
      setErrorCarga('No se pudieron obtener las consignas del servidor.');
    }
  };

  const jugadorActivo = jugadores[ordenTurnos[indiceTurno]];
  const apostadoresRestantes = jugadores.filter((j) => j.id !== jugadorActivo?.id);
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
      setFase('turno_accion');
    }
  };

  useEffect(() => {
    if (fase !== 'turno_accion') return;

    const finPrep = Date.now() + PREPARACION_S * 1000;
    const finTurno = finPrep + TIEMPO_MAXIMO_S * 1000;
    setPrep(PREPARACION_S);
    setRestante(TIEMPO_MAXIMO_S);

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
          setFase('validacion_final');
        }
        return;
      }
      setRestante(r);
    }, 100);

    return () => clearInterval(id);
  }, [fase]);

  const preparando = prep > 0;

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
    pedirConsignas(ordenTurnos[proxIndice]);
  };

  const ranking = [...jugadores].sort((a, b) => (puntos[b.id] ?? 0) - (puntos[a.id] ?? 0));
  const maximo = ranking.length ? (puntos[ranking[0].id] ?? 0) : 0;
  const ganadores = maximo > 0 ? ranking.filter((j) => (puntos[j.id] ?? 0) === maximo) : [];

  return (
    <div className="aprox-contenedor">
      {/* AYUDA */}
      {fase === 'setup' && (
        <>
          <button
            type="button"
            className="aprox-btn-ayuda"
            onClick={() => setModalAyuda(true)}
            title="Reglas y puntuación"
          >
            <span className="aprox-btn-ayuda-signo">?</span>
          </button>

          {modalAyuda && (
            <div className="rg-modal-fondo" onClick={() => setModalAyuda(false)}>
              <div className="rg-modal aprox-modal-ayuda" onClick={(e) => e.stopPropagation()}>
                <div className="aprox-modal-header">
                  <h3>¿Cómo se juega a Confianza Ciega?</h3>
                </div>

                <div className="aprox-modal-cuerpo">
                  <p><strong>1. Dinámica de la ronda:</strong></p>
                  <ul>
                    <li>El jugador activo ve dos consignas y elige una en secreto.</li>
                    <li>Los demás jugadores apuestan un número y si dirá <em>más de</em> o <em>menos de</em> esa cantidad.</li>
                    <li>Hay <strong>10 segundos de preparación</strong> antes de que empiece a correr el tiempo (2 minutos).</li>
                    <li>El jugador que responde no suma puntos en su turno (solo cuando apuesta en el de otros).</li>
                  </ul>

                  <p><strong>2. Sistema de puntuación:</strong></p>
                  <div className="aprox-tabla-puntos">
                    <div className="aprox-puntos-fila acierto" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
                      <span>🎯 Número exacto</span>
                      <strong>+{jugadores.length + 5} pts</strong>
                    </div>
                    <div className="aprox-puntos-fila acierto">
                      <span>✓ Apuesta acertada</span>
                      <strong>+{jugadores.length - 1} pts decreciendo</strong>
                    </div>
                    <div className="aprox-puntos-fila lejana">
                      <span>❌ Apuesta fallada</span>
                      <strong>-{jugadores.length - 1} pts</strong>
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

      {/* 1. SETUP */}
      {fase === 'setup' && (
        <section className="game">
          <GameIntro gameId="confianzaciega" titulo="Confianza Ciega (Un solo dispositivo)" />

          {errorCarga && <p className="error" role="alert">{errorCarga}</p>}

          <div className="panel">
            <div className="hud" style={{ marginBottom: '1rem' }}>
              <button className="btn-back-inline" onClick={onVolver}>
                &larr; Cambiar modo
              </button>
            </div>

            <h3 className="panel-title"><Icon name="users" size={22} /> Participantes</h3>
            <label className="field-label" htmlFor="num-jugadores-cc">
              Número de jugadores ({MIN_JUGADORES} a {MAX_JUGADORES})
            </label>
            <select
              id="num-jugadores-cc"
              value={numJugadores}
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
                  maxLength={30}
                  required
                />
              ))}
            </div>

            {esAdmin && (
              <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#fdf2f8', borderRadius: '12px', border: '1.5px dashed #f472b6' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#db2777', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={usarPicantes}
                    onChange={(e) => setUsarPicantes(e.target.checked)}
                  />
                  <span>Habilitar Categorías Picantes / Ocultas (Modo Admin)</span>
                </label>
              </div>
            )}
          </div>

          <button className="big full" onClick={iniciarPartida}>
            <Icon name="play" size={24} /> ¡Empezar Partida!
          </button>
        </section>
      )}

      {/* 2. ELECCIÓN SECRETA DE CONSIGNA */}
      {fase === 'eleccion_consigna' && jugadorActivo && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="flagFinish" size={18} />Ronda {rondaActual}</span>
            <span className="chip alt"><Icon name="dice" size={18} />Elección secreta</span>
          </div>

          <div className="starter">
            <Icon name="dice" size={28} />
            <p>Turno de: <strong>{jugadorActivo.nombre}</strong></p>
          </div>

          <div className="panel">
            <h3 className="panel-title"><Icon name="eye" size={20} /> Elige una consigna en secreto</h3>
            <p className="field-label">Los demás jugadores verán ambas opciones, pero solo tú sabrás cuál has elegido:</p>

            <div className="aprox-opciones-confianza" style={{ gridTemplateColumns: '1fr 1fr' }}>
              {opcionesConsignas.map((consigna, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="aprox-btn-opcion-confianza"
                  onClick={() => seleccionarConsigna(consigna)}
                  style={{ textAlign: 'left', alignItems: 'flex-start', padding: '1.4rem' }}
                >
                  <span className="aprox-badge-pregunta" style={{ marginBottom: '0.5rem' }}>Opción {idx + 1}</span>
                  <div className="aprox-pregunta-texto" style={{ fontSize: '1.2rem', textAlign: 'left' }}>{consigna}</div>
                  <span className="aprox-tag-confiar" style={{ marginTop: '1rem' }}>Elegir esta consigna</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. CONFIRMACIÓN PRIVADA DE APUESTA */}
      {fase === 'confirmacion_apuesta' && apostadorActual && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="flagFinish" size={18} />Ronda {rondaActual}</span>
            <span className="chip alt">Paso de turno privado</span>
          </div>

          <div className="starter">
            <Icon name="users" size={28} />
            <p>Pasa el dispositivo a: <strong>{apostadorActual.nombre}</strong></p>
          </div>

          <div className="panel aprox-pregunta-card">
            <span className="aprox-badge-pregunta">Apuesta privada</span>
            <h2 className="aprox-pregunta-texto">Turno de {apostadorActual.nombre}</h2>
            <p className="field-label" style={{ marginTop: '0.8rem' }}>
              Nadie más debe mirar la pantalla para realizar la apuesta en secreto.
            </p>
          </div>

          <button className="big full" onClick={() => setFase('apuestas')}>
            <Icon name="check" size={22} /> Soy {apostadorActual.nombre}, continuar
          </button>
        </section>
      )}

      {/* 4. FORMULACIÓN DE APUESTA */}
      {fase === 'apuestas' && apostadorActual && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="flagFinish" size={18} />Ronda {rondaActual}</span>
            <span className="chip alt"><Icon name="target" size={18} />Apuesta ({indiceApostador + 1} de {apostadoresRestantes.length})</span>
          </div>

          <div className="starter">
            <Icon name="target" size={28} />
            <p>Apuesta de: <strong>{apostadorActual.nombre}</strong></p>
          </div>

          <div className="panel aprox-pregunta-card">
            <span className="aprox-badge-pregunta">Opciones de consigna</span>
            <p className="field-label" style={{ margin: '0.4rem 0 0.8rem' }}>
              <strong>{jugadorActivo.nombre}</strong> ha elegido en secreto una de estas dos:
            </p>
            <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
              <span className="chip" style={{ fontSize: '1rem', padding: '0.6rem 1rem' }}>{opcionesConsignas[0]}</span>
              <strong>ó</strong>
              <span className="chip" style={{ fontSize: '1rem', padding: '0.6rem 1rem' }}>{opcionesConsignas[1]}</span>
            </div>
          </div>

          <div className="panel" style={{ textAlign: 'center' }}>
            <h3 className="panel-title" style={{ justifyContent: 'center' }}>
              ¿Cuántas palabras crees que dirá?
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', margin: '1.2rem 0' }}>
              <button
                type="button"
                className="aprox-btn-ayuda"
                style={{ position: 'static', width: '48px', height: '48px', fontSize: '1.5rem' }}
                onClick={() => setApuestaNumero(Math.max(0, apuestaNumero - 1))}
              >
                -
              </button>
              <span style={{ fontSize: '3.2rem', fontWeight: '900', color: '#4338ca', minWidth: '70px' }}>
                {apuestaNumero}
              </span>
              <button
                type="button"
                className="aprox-btn-ayuda"
                style={{ position: 'static', width: '48px', height: '48px', fontSize: '1.5rem' }}
                onClick={() => setApuestaNumero(apuestaNumero + 1)}
              >
                +
              </button>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.2rem' }}>
              <button
                type="button"
                className={`cc-btn-condicion ${apuestaCondicion === 'mas' ? 'activa' : ''}`}
                onClick={() => setApuestaCondicion('mas')}
              >
                Más de {apuestaNumero}
              </button>
              <button
                type="button"
                className={`cc-btn-condicion ${apuestaCondicion === 'menos' ? 'activa' : ''}`}
                onClick={() => setApuestaCondicion('menos')}
              >
                Menos de {apuestaNumero}
              </button>
            </div>
          </div>

          <button className="big full" onClick={confirmarApuestaIndividual}>
            <Icon name="check" size={22} /> Confirmar apuesta y pasar turno
          </button>
        </section>
      )}

      {/* 5. TURNO DE ACCIÓN */}
      {fase === 'turno_accion' && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="flagFinish" size={18} />Ronda {rondaActual}</span>
            <span className="chip alt">
              <Icon name="clock" size={18} />
              {preparando ? 'Preparación (10s)' : '¡Tiempo en marcha!'}
            </span>
          </div>

          <div className="starter">
            <Icon name="zap" size={28} />
            <p>¡Turno de <strong>{jugadorActivo.nombre}</strong>!</p>
          </div>

          <div className="panel aprox-pregunta-card">
            <span className="aprox-badge-pregunta">Consigna elegida</span>
            <h2 className="aprox-pregunta-texto" style={{ color: '#4338ca', fontSize: '1.8rem' }}>
              {consignaElegida}
            </h2>
            <p className="field-label" style={{ marginTop: '0.6rem' }}>
              Di tantas palabras válidas en voz alta como puedas en 2 minutos. Los demás validáis:
            </p>
          </div>

          <div className="timer" role="timer" aria-label="Tiempo restante">
            <div
              className={`timer-bar${!preparando && restante <= 10 ? ' low' : ''}`}
              style={{ width: `${preparando ? 100 : (restante / TIEMPO_MAXIMO_S) * 100}%` }}
            />
          </div>
          <p className="timer-text">
            <Icon name="clock" size={16} />
            {preparando ? `Preparados… ${prep} s` : `${Math.ceil(restante)} s`}
          </p>

          <div className="panel" style={{ textAlign: 'center', marginTop: '1rem' }}>
            <span className="field-label">Aciertos aprobados por el grupo:</span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', margin: '0.8rem 0' }}>
              <button
                type="button"
                className="aprox-btn-ayuda"
                style={{ position: 'static', width: '52px', height: '52px', fontSize: '1.5rem' }}
                disabled={preparando}
                onClick={() => setContadorAciertos(Math.max(0, contadorAciertos - 1))}
              >
                -1
              </button>
              <span style={{ fontSize: '3.5rem', fontWeight: '900', color: '#10b981', minWidth: '80px' }}>
                {contadorAciertos}
              </span>
              <button
                type="button"
                className="aprox-btn-ayuda"
                style={{ position: 'static', width: '52px', height: '52px', fontSize: '1.5rem' }}
                disabled={preparando}
                onClick={() => setContadorAciertos(contadorAciertos + 1)}
              >
                +1
              </button>
            </div>
          </div>

          <div className="actions">
            <button
              className="secondary danger full"
              disabled={preparando}
              onClick={pararManualmente}
            >
              <Icon name="flagFinish" size={20} /> Parar tiempo
            </button>
          </div>
        </section>
      )}

      {/* 6. CONFIRMACIÓN FINAL */}
      {fase === 'validacion_final' && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="flagFinish" size={18} />Ronda {rondaActual}</span>
            <span className="chip alt">Recuento final</span>
          </div>

          <div className="starter">
            <Icon name="trophy" size={28} />
            <p>¡Tiempo terminado!</p>
          </div>

          <div className="panel aprox-pregunta-card">
            <span className="aprox-badge-pregunta">Consigna</span>
            <h2 className="aprox-pregunta-texto">{consignaElegida}</h2>
            <p className="field-label" style={{ marginTop: '0.8rem' }}>
              Confirmad el número definitivo de aciertos antes de comprobar las apuestas:
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', margin: '1rem 0' }}>
              <button
                type="button"
                className="aprox-btn-ayuda"
                style={{ position: 'static', width: '48px', height: '48px', fontSize: '1.5rem' }}
                onClick={() => setContadorAciertos(Math.max(0, contadorAciertos - 1))}
              >
                -
              </button>
              <span style={{ fontSize: '3rem', fontWeight: '900', color: '#10b981', minWidth: '70px' }}>
                {contadorAciertos}
              </span>
              <button
                type="button"
                className="aprox-btn-ayuda"
                style={{ position: 'static', width: '48px', height: '48px', fontSize: '1.5rem' }}
                onClick={() => setContadorAciertos(contadorAciertos + 1)}
              >
                +
              </button>
            </div>
          </div>

          <button className="big full" onClick={() => calcularResultados(contadorAciertos)}>
            <Icon name="check" size={22} /> Confirmar y ver resultados
          </button>
        </section>
      )}

      {/* 7. RESULTADOS DE LA RONDA */}
      {fase === 'resultados' && resultadoRonda && (
        <section className="game">
          <div className="end-card aprox-resolucion-card">
            <span className="end-icon"><Icon name="trophy" size={44} /></span>
            <p className="categoria">{consignaElegida}</p>
            <h1 className="title">
              Palabras conseguidas: <span className="aprox-num-correcto">{resultadoRonda.aciertosFinales}</span>
            </h1>

            <div className="aprox-resolucion-lista">
              {resultadoRonda.detalles.map((item) => (
                <div
                  key={item.jugadorId}
                  className={`aprox-fila-resultado cc-fila-${item.estadoColor}`}
                >
                  <div className="aprox-res-col-val">
                    <span className="aprox-res-num">
                      {item.condicion === 'mas' ? `> ${item.numero}` : `< ${item.numero}`}
                    </span>
                    <span className="aprox-res-dist">(dif: {item.diff})</span>
                  </div>

                  <div className="aprox-res-col-jugadores">
                    <div>
                      <strong>{item.nombre}</strong>{' '}
                      <span className="aprox-badge-pts">
                        {item.puntosGanados >= 0 ? `+${item.puntosGanados}` : item.puntosGanados} pts
                      </span>
                    </div>
                  </div>

                  <div className="aprox-res-etiqueta">
                    {item.estadoColor === 'azul' && '🎯 CLAVADO'}
                    {item.estadoColor === 'verde' && '✓ ACERTADA'}
                    {item.estadoColor === 'rojo' && '❌ FALLADA'}
                  </div>
                </div>
              ))}
            </div>

            <div className="scoreboard" style={{ marginTop: '1.5rem', width: '100%' }}>
              <h3 className="section-title" style={{ margin: '0 0 0.8rem', textAlign: 'center' }}>
                Marcador general
              </h3>
              {ranking.map((j, i) => {
                const pts = puntos[j.id] ?? 0;
                const primero = maximo > 0 && pts === maximo;
                return (
                  <div key={j.id} className={`score-row${primero ? ' first' : ''}`}>
                    <span className="score-name">
                      {primero ? <Icon name="crown" size={22} /> : <span className="pos">{i + 1}</span>}
                      {j.nombre}
                    </span>
                    <span className="score-pts">{pts} pts</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="actions">
            <button onClick={avanzarSiguienteRonda}>
              <Icon name="play" size={20} />
              Siguiente ronda ({rondaActual + 1})
            </button>
            <button className="secondary danger" onClick={() => setFase('final')}>
              <Icon name="flagFinish" size={20} /> Finalizar el juego
            </button>
          </div>
        </section>
      )}

      {/* 8. PANTALLA FINAL */}
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
              {ranking.map((j, i) => {
                const pts = puntos[j.id] ?? 0;
                const primero = maximo > 0 && pts === maximo;
                return (
                  <div key={j.id} className={`score-row${primero ? ' first' : ''}`}>
                    <span className="score-name">
                      {primero ? <Icon name="crown" size={22} /> : <span className="pos">{i + 1}</span>}
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
              <Icon name="door" size={20} /> Volver al menú
            </button>
          </div>
        </section>
      )}
    </div>
  );
}