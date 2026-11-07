// client/src/games/Descarte/DescarteLocal.jsx
import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../components/Icon.jsx';
import { TODAS_LAS_CATEGORIAS } from '../../../../server/data/seeds/descarte/descarte.js';
import './Descarte.css';
import '../Adivina/Adivina.css';
import { SelectorJugadores } from '../../components/MenuJuego.jsx';

const MIN_JUGADORES = 3;
const MAX_JUGADORES = 12;
const MAX_TABLEROS = 5;

// Configuración de letras y puntuaciones
const LETRAS_CONFIG = [
  { l: 'A', pts: 1 }, { l: 'B', pts: 1 }, { l: 'C', pts: 1 }, { l: 'D', pts: 1 }, { l: 'E', pts: 1 },
  { l: 'F', pts: 2 }, { l: 'G', pts: 2 }, { l: 'H', pts: 2 }, { l: 'I', pts: 2 }, { l: 'J', pts: 3 },
  { l: 'K', pts: 3 }, { l: 'L', pts: 1 }, { l: 'M', pts: 1 }, { l: 'N', pts: 2 }, { l: 'Ñ', pts: 3 },
  { l: 'O', pts: 2 }, { l: 'P', pts: 1 }, { l: 'Q', pts: 3 }, { l: 'R', pts: 1 }, { l: 'S', pts: 1 },
  { l: 'T', pts: 1 }, { l: 'U', pts: 2 }, { l: 'V', pts: 2 }, { l: 'W', pts: 3 }, { l: 'X', pts: 3 },
  { l: 'Y', pts: 3 }, { l: 'Z', pts: 3 }
];

const ABECEDARIO = LETRAS_CONFIG.map(x => x.l);
const nombresPorDefecto = (n) => Array.from({ length: n }, (_, i) => `Jugador ${i + 1}`);

const getTresRandom = () => {
  const barajadas = [...TODAS_LAS_CATEGORIAS].sort(() => Math.random() - 0.5);
  return barajadas.slice(0, 3);
};

export default function DescarteLocal({ onSalir }) {
  const [paso, setPaso] = useState('setup'); // setup | eligiendo_rival | eligiendo_cat | pasar_dispositivo | respondiendo | cambio_tablero | fin
  const [modalAyuda, setModalAyuda] = useState(false);
  const [numJugadores, setNumJugadores] = useState(4);
  const [nombres, setNombres] = useState(nombresPorDefecto(4));

  // Estado del juego
  const [jugadores, setJugadores] = useState([]);
  const [jugadorRetadorId, setJugadorRetadorId] = useState(null);
  const [jugadorActivoId, setJugadorActivoId] = useState(null);
  const [jugadosEnCiclo, setJugadosEnCiclo] = useState([]); // IDs de quienes ya jugaron en la ronda actual
  const [tableroActual, setTableroActual] = useState(1);
  const [letrasDisponibles, setLetrasDisponibles] = useState([...ABECEDARIO]);
  
  const [tresCategorias, setTresCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [segundos, setSegundos] = useState(30);
  const [fallosConsecutivos, setFallosConsecutivos] = useState(0);
  const [letraElegidaAdmin, setLetraElegidaAdmin] = useState('');

  const timerRef = useRef(null);

  const cambiarNumJugadores = (e) => {
    const k = Number(e.target.value);
    setNumJugadores(k);
    setNombres(prev => (k > prev.length ? [...prev, ...nombresPorDefecto(k).slice(prev.length)] : prev.slice(0, k)));
  };

  const handleNombre = (idx, val) => {
    const copia = [...nombres];
    copia[idx] = val;
    setNombres(copia);
  };

  const iniciarPartida = () => {
    setModalAyuda(false);
    const jugs = nombres.map((n, i) => ({ id: i + 1, nombre: n.trim() || `Jugador ${i + 1}`, puntos: 0 }));
    setJugadores(jugs);
    setTableroActual(1);
    setLetrasDisponibles([...ABECEDARIO]);
    setFallosConsecutivos(0);

    // El primer jugador es elegido al azar
    const primerId = jugs[Math.floor(Math.random() * jugs.length)].id;
    setJugadorActivoId(primerId);
    setJugadorRetadorId(null);
    setJugadosEnCiclo([primerId]);

    // Para el primer jugador, se le dan 3 categorías para que elija él mismo
    setTresCategorias(getTresRandom());
    setPaso('eligiendo_cat');
  };

  // El retador elige al rival
  const seleccionarRival = (idRival) => {
    setJugadorActivoId(idRival);
    setJugadosEnCiclo(prev => [...prev, idRival]);
    setTresCategorias(getTresRandom());
    setPaso('eligiendo_cat');
  };

  // El retador (o el primer jugador) elige la categoría
  const confirmarCategoria = (cat) => {
    setCategoriaSeleccionada(cat);
    setPaso('pasar_dispositivo');
  };

  const empezarTurnoRespuesta = () => {
    setSegundos(30);
    setLetraElegidaAdmin('');
    setPaso('respondiendo');
  };

  // Temporizador de 30s
  useEffect(() => {
    if (paso !== 'respondiendo') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setSegundos(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          procesarResultadoTurno(false, null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [paso]);

  const procesarResultadoTurno = (acierto, letra = null) => {
    let nuevasLetras = [...letrasDisponibles];
    let nuevosFallos = fallosConsecutivos;

    if (acierto && letra) {
      nuevasLetras = nuevasLetras.filter(l => l !== letra);
      const conf = LETRAS_CONFIG.find(x => x.l === letra);
      const ptsASumar = conf ? conf.pts : 1;

      setLetrasDisponibles(nuevasLetras);
      setJugadores(prev => prev.map(j => j.id === jugadorActivoId ? { ...j, puntos: j.puntos + ptsASumar } : j));
      nuevosFallos = 0;
      setFallosConsecutivos(0);
    } else {
      nuevosFallos += 1;
      setFallosConsecutivos(nuevosFallos);
    }

    // Comprobar cambio de tablero
    const rondaCompletaFallada = nuevosFallos >= jugadores.length;
    const sinLetras = nuevasLetras.length === 0;

    if (sinLetras || rondaCompletaFallada) {
      if (tableroActual >= MAX_TABLEROS) {
        setPaso('fin');
        return;
      }
      setPaso('cambio_tablero');
    } else {
      prepararSiguienteRetador();
    }
  };

  const prepararSiguienteRetador = () => {
    setJugadorRetadorId(jugadorActivoId);

    if (jugadosEnCiclo.length >= jugadores.length) {
      setJugadosEnCiclo([jugadorActivoId]);
    }

    setPaso('eligiendo_rival');
  };

  const avanzarSiguienteTablero = () => {
    setTableroActual(prev => prev + 1);
    setLetrasDisponibles([...ABECEDARIO]);
    setFallosConsecutivos(0);
    setJugadosEnCiclo([jugadorActivoId]);
    setJugadorRetadorId(jugadorActivoId);
    setPaso('eligiendo_rival');
  };

  const retadorActual = jugadores.find(j => j.id === jugadorRetadorId);
  const activoActual = jugadores.find(j => j.id === jugadorActivoId);

  const rivalesElegibles = jugadores.filter(j => 
    j.id !== jugadorRetadorId && !jugadosEnCiclo.includes(j.id)
  );

  const ranking = [...jugadores].sort((a, b) => b.puntos - a.puntos);
  const maxPuntos = ranking.length > 0 ? ranking[0].puntos : 0;
  const ganadores = maxPuntos > 0 ? ranking.filter(j => j.puntos === maxPuntos) : [];

  return (
    <div className="dsc-contenedor" style={{ position: 'relative' }}>
      {/* 1. SETUP */}
      {paso === 'setup' && (
        <>

          {modalAyuda && (
            <div className="rg-modal-fondo" onClick={() => setModalAyuda(false)}>
              <div
                className="rg-modal aprox-modal-ayuda"
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: '540px', maxHeight: '88vh', overflowY: 'auto', textAlign: 'left' }}
              >
                <div className="aprox-modal-header">
                  <span className="aprox-modal-signo-title">?</span>
                  <h3>¿Cómo se juega a Descarta y Elimina?</h3>
                </div>

                <div className="aprox-modal-cuerpo">
                  <p><strong>1. Dinámica del reto:</strong></p>
                  <ul>
                    <li>En cada turno, el <strong>Retador</strong> elige a un rival que aún no haya participado en la ronda actual y le asigna una <strong>categoría trampa</strong> de entre 3 opciones.</li>
                    <li>El jugador desafiado tiene <strong>30 segundos</strong> para decir en voz alta una palabra válida de esa categoría que empiece por una de las letras disponibles en el tablero.</li>
                  </ul>

                  <p><strong>2. Eliminación de letras y puntos:</strong></p>
                  <ul>
                    <li>Cada letra acertada <strong>queda eliminada del tablero</strong> y nadie más podrá usarla hasta el siguiente tablero.</li>
                    <li><strong>🔵 1 punto (fáciles):</strong> A, B, C, D, E, L, M, P, R, S, T.</li>
                    <li><strong>🟡 2 puntos (medias):</strong> F, G, H, I, N, O, U, V.</li>
                    <li><strong>🔴 3 puntos (difíciles):</strong> J, K, Ñ, Q, W, X, Y, Z.</li>
                    <li>Si se agota el tiempo o no se da una palabra válida, se cuenta como fallo y no se suman puntos.</li>
                  </ul>

                  <p><strong>3. Cambio de tablero y Victoria:</strong></p>
                  <ul>
                    <li>El tablero actual finaliza cuando se <strong>eliminan todas las letras del abecedario</strong> o cuando <strong>todos los jugadores fallan consecutivamente</strong>.</li>
                    <li>La partida se disputa a <strong>5 tableros</strong>. ¡Gana quien acumule más puntos al final!</li>
                  </ul>
                </div>

                <div className="rg-modal-acciones" style={{ marginTop: '1.2rem' }}>
                  <button className="big full" onClick={() => setModalAyuda(false)}>
                    Entendido
                  </button>
                </div>
              </div>
            </div>
          )}

          <SelectorJugadores
          onVolver={onSalir}
          onAyuda={() => setModalAyuda(true)}
          min={MIN_JUGADORES}
          max={MAX_JUGADORES}
          numJugadores={numJugadores}
          onCambiarNum={(n) => cambiarNumJugadores({ target: { value: n } })}
          nombres={nombres}
          onNombre={handleNombre}
          onEmpezar={iniciarPartida}
          textoBoton="Empezar Partida (5 Tableros)"
          iconoBoton="play"
        />
        </>
      )}

      {/* 2. NOMINAR RIVAL */}
      {paso === 'eligiendo_rival' && retadorActual && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="users" size={18} />Retador: {retadorActual.nombre}</span>
            <span className="chip alt">Tablero {tableroActual}/{MAX_TABLEROS}</span>
          </div>

          <div className="panel center">
            <h2 className="title">¡Te toca retar, {retadorActual.nombre}!</h2>
            <p className="hint">Elige al rival al que vas a desafiar (solo jugadores que no hayan participado en esta ronda):</p>

            <div className="dsc-opciones-cat">
              {(rivalesElegibles.length > 0 ? rivalesElegibles : jugadores.filter(j => j.id !== retadorActual.id)).map(r => (
                <button
                  key={r.id}
                  type="button"
                  className="dsc-cat-btn"
                  onClick={() => seleccionarRival(r.id)}
                >
                  🎯 Desafiar a {r.nombre} ({r.puntos} pts)
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. ELEGIR CATEGORÍA PARA EL RIVAL */}
      {paso === 'eligiendo_cat' && (
        <section className="game">
          <div className="hud">
            <span className="chip alt">Tablero {tableroActual}/{MAX_TABLEROS}</span>
          </div>

          <div className="panel center">
            <h2 className="title">
              {retadorActual ? `${retadorActual.nombre}, elige la temática para ${activoActual?.nombre}:` : `Primer turno: ${activoActual?.nombre}, elige tu categoría:`}
            </h2>
            <p className="hint">
              {retadorActual ? 'Ponle una categoría difícil para intentar que falle:' : 'Deberás decir una palabra que empiece por una letra disponible.'}
            </p>

            <div className="dsc-opciones-cat">
              {tresCategorias.map((cat, i) => (
                <button
                  key={i}
                  type="button"
                  className="dsc-cat-btn"
                  onClick={() => confirmarCategoria(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. PASAR DISPOSITIVO */}
      {paso === 'pasar_dispositivo' && activoActual && (
        <section className="game center" style={{ padding: '3.5rem 1.5rem' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '0.8rem' }}>📱</div>
          <h2 className="title" style={{ fontSize: '1.6rem' }}>
            Pasad el móvil a:<br /><span className="hl">{activoActual.nombre}</span>
          </h2>
          <p className="hint" style={{ marginTop: '1rem' }}>
            {retadorActual ? `${retadorActual.nombre} ya ha seleccionado tu categoría.` : '¡Es tu momento!'}
          </p>
          <button className="big full" style={{ marginTop: '2rem' }} onClick={empezarTurnoRespuesta}>
            <Icon name="check" size={22} /> Soy {activoActual.nombre}, ¡a responder!
          </button>
        </section>
      )}

      {/* 5. RESPONDIENDO (TABLERO + LETRAS PUNTUADAS) */}
      {paso === 'respondiendo' && activoActual && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="users" size={18} />{activoActual.nombre}</span>
            <span className="chip alt">Tablero {tableroActual}/{MAX_TABLEROS}</span>
          </div>

          <div className="panel center">
            <div className={`dsc-timer-badge ${segundos <= 5 ? 'peligro' : ''}`}>
              {segundos}s
            </div>

            <div className="dsc-cat-activa">
              <span className="field-label" style={{ color: 'rgba(255,255,255,0.85)', marginBottom: '0.3rem' }}>Categoría a responder:</span>
              <h2>{categoriaSeleccionada}</h2>
            </div>

            {/* Leyenda de puntos */}
            <div className="dsc-leyenda-puntos">
              <span className="dsc-leyenda-tag" style={{ color: '#1d4ed8' }}>🔵 1 pto (fáciles)</span>
              <span className="dsc-leyenda-tag" style={{ color: '#b45309' }}>🟡 2 ptos (medias)</span>
              <span className="dsc-leyenda-tag" style={{ color: '#be123c' }}>🔴 3 ptos (difíciles)</span>
            </div>

            {/* TABLERO A-Z */}
            <div className="dsc-tablero-grid">
              {LETRAS_CONFIG.map(({ l, pts }) => {
                const disponible = letrasDisponibles.includes(l);
                const seleccionada = letraElegidaAdmin === l;
                return (
                  <div
                    key={l}
                    className={`dsc-letra-card ${disponible ? `disponible pts-${pts}` : 'eliminada'} ${seleccionada ? 'seleccionada' : ''}`}
                    onClick={() => disponible && setLetraElegidaAdmin(l)}
                  >
                    <span className="dsc-letra-char">{l}</span>
                    <span className="dsc-letra-pts">+{pts}</span>
                  </div>
                );
              })}
            </div>

            {/* VERIFICACIÓN DEL ADMINISTRADOR */}
            <div className="dsc-admin-box">
              <span className="field-label">Verificación (Toca en el tablero la letra dicha):</span>
              <p style={{ fontWeight: 800, margin: '0.4rem 0 1rem' }}>
                Letra elegida: {letraElegidaAdmin ? (
                  <strong style={{ color: '#be123c', fontSize: '1.4rem' }}>
                    {letraElegidaAdmin} (+{LETRAS_CONFIG.find(x => x.l === letraElegidaAdmin)?.pts} pts)
                  </strong>
                ) : 'Ninguna'}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <button
                  type="button"
                  className="big full"
                  style={{ background: '#16a34a', borderColor: '#15803d' }}
                  disabled={!letraElegidaAdmin}
                  onClick={() => procesarResultadoTurno(true, letraElegidaAdmin)}
                >
                  <Icon name="check" size={20} /> Correcta
                </button>
                <button
                  type="button"
                  className="secondary danger full"
                  onClick={() => procesarResultadoTurno(false, null)}
                >
                  <Icon name="x" size={20} /> Fallo / Pasa
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 6. CAMBIO DE TABLERO */}
      {paso === 'cambio_tablero' && (
        <section className="game">
          <div className="end-card">
            <span className="end-icon"><Icon name="refresh" size={44} /></span>
            <p className="categoria">Fin del tablero {tableroActual}</p>
            <h1 className="title">¡Nuevo Tablero!</h1>
            <p className="reveal">
              {letrasDisponibles.length === 0
                ? '¡Se han eliminado todas las letras del abecedario!'
                : '¡Ronda fallada! Todos los jugadores han fallado consecutivamente.'}
            </p>
          </div>

          <div className="panel" style={{ marginTop: '1rem' }}>
            <h3 className="panel-title"><Icon name="trophy" size={20} /> Marcador general</h3>
            <div className="scoreboard">
              {ranking.map((j, i) => (
                <div key={j.id} className={`score-row ${i === 0 && j.puntos > 0 ? 'first' : ''}`}>
                  <span className="score-name">{i + 1}. {j.nombre}</span>
                  <span className="score-pts">{j.puntos} {j.puntos === 1 ? 'pto' : 'ptos'}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="actions" style={{ marginTop: '1.2rem' }}>
            <button className="big full" onClick={avanzarSiguienteTablero}>
              <Icon name="play" size={20} /> Empezar Tablero {tableroActual + 1}
            </button>
            <button className="secondary danger full" onClick={() => setPaso('fin')}>
              Finalizar partida ahora
            </button>
          </div>
        </section>
      )}

      {/* 7. PODIO FINAL */}
      {paso === 'fin' && (
        <section className="game">
          <div className="end-card">
            <span className="end-icon"><Icon name="trophy" size={44} /></span>
            <h1 className="title">¡Partida Terminada!</h1>
            <p className="final-score" style={{ color: '#be123c' }}>
              {ganadores.length === 0
                ? 'Nadie consiguió puntos.'
                : `🏆 Ganador: ${ganadores.map(g => g.nombre).join(', ')} con ${maxPuntos} ptos`}
            </p>
          </div>

          <div className="panel reveal-panel" style={{ marginTop: '1rem' }}>
            <h3 className="reveal-title"><Icon name="trophy" size={20} /> Clasificación Final</h3>
            <div className="scoreboard">
              {ranking.map((j, i) => (
                <div key={j.id} className={`score-row ${j.puntos === maxPuntos && maxPuntos > 0 ? 'first' : ''}`}>
                  <span className="score-name">{i + 1}. {j.nombre}</span>
                  <span className="score-pts">{j.puntos} ptos</span>
                </div>
              ))}
            </div>
          </div>

          <div className="actions" style={{ marginTop: '1.2rem' }}>
            <button className="big full" onClick={() => setPaso('setup')}>
              <Icon name="refresh" size={20} /> Jugar otra vez
            </button>
            <button className="secondary full" onClick={onSalir}>
              Salir al menú
            </button>
          </div>
        </section>
      )}
    </div>
  );
}