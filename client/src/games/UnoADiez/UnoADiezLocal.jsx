// client/src/games/UnoADiez/UnoADiezLocal.jsx
import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../components/Icon.jsx';
import GameIntro from '../../components/GameIntro.jsx';
import './UnoADiez.css';
import '../Adivina/Adivina.css';

const CATEGORIAS_EJEMPLO = [
  "Nivel de dolor físico",
  "Comida apetecible a las 3 de la mañana",
  "Nivel de peligro de un animal si te encierran con él",
  "Plan ideal para una primera cita",
  "Nivel de vergüenza ajena",
  "Placer culpable que no confiesas fácilmente",
  "Nivel de pereza que da hacer esta tarea del hogar",
  "Utilidad de un objeto si estás en una isla desierta",
  "Cosas que más molestan en el transporte público",
  "Nivel de miedo que da encontrarte esto de noche en casa",
  "Mentira típica que todo el mundo dice",
  "Nivel de mal olor",
  "Película perfecta para un domingo de lluvia",
  "Razón justificada para cancelar planes a última hora",
  "Qué tan difícil es aprender esta habilidad",
  "Superpoder útil en la vida cotidiana",
  "Comportamiento de mala educación en la mesa",
  "Cosas que te arruinan el día por completo",
  "Nivel de picante soportable",
  "Ganas de salir de fiesta este viernes"
];

const getCatAleatoria = (lista) => {
  const pool = lista.length > 0 ? lista : CATEGORIAS_EJEMPLO;
  return pool[Math.floor(Math.random() * pool.length)];
};

export default function UnoADiezLocal({ onSalir }) {
  const [paso, setPaso] = useState('setup'); // setup, pasar_pistador, ver_pista, adivinar, resolucion, fin
  const [modalAyuda, setModalAyuda] = useState(false);
  const [numJugadores, setNumJugadores] = useState(4);
  const [nombres, setNombres] = useState(['Jugador 1', 'Jugador 2', 'Jugador 3', 'Jugador 4']);
  const [categoriasDB, setCategoriasDB] = useState([]);

  // Estado de la partida
  const [jugadores, setJugadores] = useState([]);
  const [adivinadoresPendientes, setAdivinadoresPendientes] = useState([]);
  const [adivinadorActual, setAdivinadorActual] = useState(null);
  const [pistadorActual, setPistadorActual] = useState(null);
  const [numeroSecreto, setNumeroSecreto] = useState(null);
  const [categoriaActual, setCategoriaActual] = useState('');
  const [intentosRonda, setIntentosRonda] = useState(1);
  const [segundosRestantes, setSegundosRestantes] = useState(60);
  const [ultimoGuess, setUltimoGuess] = useState(null);
  const [puntosSumados, setPuntosSumados] = useState(0);

  const timerRef = useRef(null);

  useEffect(() => {
    fetch('/api/unoadiez/categorias')
      .then(r => r.json())
      .then(d => { if (d.success) setCategoriasDB(d.categorias); })
      .catch(() => setCategoriasDB(CATEGORIAS_EJEMPLO));
  }, []);

  const handleNumJugadores = (e) => {
    const n = parseInt(e.target.value, 10);
    setNumJugadores(n);
    setNombres(Array.from({ length: n }, (_, i) => nombres[i] || `Jugador ${i + 1}`));
  };

  const handleNombre = (idx, val) => {
    const copia = [...nombres];
    copia[idx] = val;
    setNombres(copia);
  };

  const iniciarPartida = () => {
    setModalAyuda(false);
    const jugs = nombres.map((n, i) => ({ id: i + 1, nombre: n.trim() || `Jugador ${i + 1}`, puntos: 0 }));
    const ordenAdivinadores = [...jugs.map(j => j.id)].sort(() => Math.random() - 0.5);

    setJugadores(jugs);
    setAdivinadoresPendientes(ordenAdivinadores);

    siguienteAdivinador(jugs, ordenAdivinadores);
  };

  const elegirPistador = (jugs, idAdivinador, idAnteriorPistador = null) => {
    const otros = jugs.filter(j => j.id !== idAdivinador);
    const elegibles = otros.filter(j => j.id !== idAnteriorPistador);
    const candidatos = elegibles.length > 0 ? elegibles : otros;
    return candidatos[Math.floor(Math.random() * candidatos.length)];
  };

  const siguienteAdivinador = (jugsActuales, pendientes) => {
    if (pendientes.length === 0) {
      setPaso('fin');
      return;
    }

    const copiaPendientes = [...pendientes];
    const idAdiv = copiaPendientes.shift();
    const adiv = jugsActuales.find(j => j.id === idAdiv);
    const pist = elegirPistador(jugsActuales, idAdiv);
    const num = Math.floor(Math.random() * 10) + 1;
    const cat = getCatAleatoria(categoriasDB);

    setAdivinadoresPendientes(copiaPendientes);
    setAdivinadorActual(adiv);
    setPistadorActual(pist);
    setNumeroSecreto(num);
    setCategoriaActual(cat);
    setIntentosRonda(1);
    setUltimoGuess(null);
    setPuntosSumados(0);

    setPaso('pasar_pistador');
  };

  const empezarAdivinanza = () => {
    setSegundosRestantes(60);
    setPaso('adivinar');
  };

  // Timer de 60 segundos
  useEffect(() => {
    if (paso !== 'adivinar') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setSegundosRestantes(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handlePasar();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [paso, intentosRonda]);

  const handlePasar = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    const nuevoPist = elegirPistador(jugadores, adivinadorActual.id, pistadorActual.id);
    const nuevaCat = getCatAleatoria(categoriasDB);

    setIntentosRonda(prev => prev + 1);
    setPistadorActual(nuevoPist);
    setCategoriaActual(nuevaCat);
    setPaso('pasar_pistador');
  };

  const handleAdivinar = (num) => {
    if (timerRef.current) clearInterval(timerRef.current);

    const diff = Math.abs(num - numeroSecreto);
    let pts = 0;

    if (diff === 0) {
      pts = intentosRonda;
    } else if (diff === 1) {
      pts = intentosRonda + 1;
    } else {
      pts = intentosRonda + 10;
    }

    const nuevosJugs = jugadores.map(j => {
      if (j.id === adivinadorActual.id) return { ...j, puntos: j.puntos + pts };
      return j;
    });

    setJugadores(nuevosJugs);
    setPuntosSumados(pts);
    setUltimoGuess(num);
    setPaso('resolucion');
  };

  const continuarTrasResolucion = () => {
    siguienteAdivinador(jugadores, adivinadoresPendientes);
  };

  const ranking = [...jugadores].sort((a, b) => a.puntos - b.puntos);
  const minPuntos = ranking.length > 0 ? ranking[0].puntos : 0;
  const ganadores = ranking.filter(j => j.puntos === minPuntos);

  return (
    <div className="uad-contenedor" style={{ position: 'relative' }}>
      {/* 1. SETUP */}
      {paso === 'setup' && (
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
              <div
                className="rg-modal aprox-modal-ayuda"
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: '540px', maxHeight: '88vh', overflowY: 'auto', textAlign: 'left' }}
              >
                <div className="aprox-modal-header">
                  <span className="aprox-modal-signo-title">?</span>
                  <h3>¿Cómo se juega a Del 1 al 10...?</h3>
                </div>

                <div className="aprox-modal-cuerpo">
                  <p><strong>1. Dinámica de la ronda:</strong></p>
                  <ul>
                    <li>En cada turno hay un <strong>Adivinador</strong> y un <strong>Pistador</strong>[cite: 11].</li>
                    <li>El Pistador consulta en secreto un <strong>número del 1 al 10</strong> y una <strong>categoría aleatoria</strong>[cite: 11].</li>
                    <li>Debe decir en voz alta una respuesta o ejemplo que encaje exactamente con esa puntuación[cite: 11]. <em>(Por ejemplo, si la categoría es "Comida picante" y el número es 10, dirá una salsa extrema; si es 1, dirá yogur)</em>.</li>
                  </ul>

                  <p><strong>2. Adivinar o Pasar:</strong></p>
                  <ul>
                    <li>El Adivinador tiene <strong>60 segundos</strong> para elegir un número del 1 al 10[cite: 11].</li>
                    <li>Si no lo tiene claro, puede pulsar <strong>Pasar</strong> para que otro rival le dé una nueva pista con otra categoría (aumentando la pista de la ronda)[cite: 11].</li>
                  </ul>

                  <p><strong>3. Sistema de puntuación (¡Gana el que MENOS puntos sume!):</strong></p>
                  <ul>
                    <li><strong>🎯 Acierto exacto:</strong> Sumas únicamente el número de pistas necesitadas <em>(ej: a la 1ª pista = +1 punto)</em>[cite: 11].</li>
                    <li><strong>🤏 A 1 de distancia:</strong> Sumas el número de pistas + 1 de penalización <em>(ej: a la 1ª pista = +2 puntos)</em>[cite: 11].</li>
                    <li><strong>❌ Fallo (más de 1 de diferencia):</strong> Sumas el número de pistas + 10 de penalización <em>(ej: a la 1ª pista = +11 puntos)</em>[cite: 11].</li>
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

          <section className="game">
            <GameIntro gameId="unoadiez" titulo="Del 1 al 10... (Un dispositivo)" />
            <div className="panel">
              <h3 className="panel-title"><Icon name="users" size={22} /> Jugadores (2-10)</h3>
              <label className="field-label" htmlFor="uad-num">Número de participantes</label>
              <select id="uad-num" value={numJugadores} onChange={handleNumJugadores}>
                {Array.from({ length: 9 }, (_, i) => i + 2).map(n => (
                  <option key={n} value={n}>{n} jugadores</option>
                ))}
              </select>

              <span className="field-label" style={{ marginTop: '1rem' }}>Nombres</span>
              <div className="names-grid">
                {nombres.map((n, i) => (
                  <input key={i} value={n} onChange={(e) => handleNombre(i, e.target.value)} maxLength={15} />
                ))}
              </div>
            </div>

            <div className="actions">
              <button className="big full" onClick={iniciarPartida}>
                <Icon name="play" size={22} /> Empezar Partida
              </button>
              <button className="secondary full" onClick={onSalir}>Volver</button>
            </div>
          </section>
        </>
      )}

      {/* 2. PASAR MÓVIL AL PISTADOR */}
      {paso === 'pasar_pistador' && pistadorActual && adivinadorActual && (
        <section className="game center" style={{ padding: '3.5rem 1.5rem' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '0.8rem' }}>🤫</div>
          <h2 className="title" style={{ fontSize: '1.6rem' }}>
            Pasad el móvil a:<br /><span className="hl">{pistadorActual.nombre}</span>
          </h2>
          <p className="hint" style={{ marginTop: '1rem' }}>
            {adivinadorActual.nombre} tiene que adivinar. ¡Que no mire la pantalla!
          </p>
          <button className="big full" style={{ marginTop: '2rem' }} onClick={() => setPaso('ver_pista')}>
            <Icon name="eye" size={22} /> Soy {pistadorActual.nombre}, ver el número secreto
          </button>
        </section>
      )}

      {/* 3. PISTADOR VE EL NÚMERO Y CATEGORÍA */}
      {paso === 'ver_pista' && pistadorActual && adivinadorActual && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="users" size={18} />Turno de {pistadorActual.nombre} (Pistador)</span>
            <span className="chip alt">Pista {intentosRonda}</span>
          </div>

          <div className="panel center">
            <p className="field-label">El número secreto que debe adivinar {adivinadorActual.nombre} es:</p>
            <div className="uad-badge-secret">
              <span>🎯 {numeroSecreto}</span>
            </div>

            <div className="uad-categoria-box">
              <span className="field-label">Tu categoría asignada:</span>
              <p className="uad-categoria-texto">«{categoriaActual}»</p>
            </div>

            <p className="hint" style={{ lineHeight: '1.4', margin: '1rem 0' }}>
              Di en voz alta un ejemplo de esa categoría que se corresponda exactamente con un <strong>{numeroSecreto} del 1 al 10</strong>.
            </p>

            <button className="big full" onClick={empezarAdivinanza}>
              <Icon name="check" size={22} /> Ya he dicho la pista en voz alta
            </button>
          </div>
        </section>
      )}

      {/* 4. ADIVINADOR RESPONDE */}
      {paso === 'adivinar' && adivinadorActual && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="target" size={18} />Adivina {adivinadorActual.nombre}</span>
            <span className="chip alt"><Icon name="clock" size={16} /> {segundosRestantes}s</span>
          </div>

          <div className="panel center">
            <p className="hint small">Pista dicha por <strong>{pistadorActual.nombre}</strong> para la categoría:</p>
            <div className="uad-categoria-box">
              <p className="uad-categoria-texto">«{categoriaActual}»</p>
            </div>

            <p className="field-label">¿Qué número del 1 al 10 crees que es?</p>

            <div className="uad-teclado-grid">
              {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                <button key={n} type="button" className="uad-btn-num" onClick={() => handleAdivinar(n)}>
                  {n}
                </button>
              ))}
            </div>

            <button type="button" className="secondary full" style={{ marginTop: '0.8rem' }} onClick={handlePasar}>
              <Icon name="forward" size={18} /> Pasar (Pedir otra pista a otro jugador)
            </button>
          </div>
        </section>
      )}

      {/* 5. RESOLUCIÓN DE LA RONDA */}
      {paso === 'resolucion' && adivinadorActual && (
        <section className="game">
          <div className="end-card">
            <span className="end-icon"><Icon name="target" size={44} /></span>
            <h1 className="title">Resolución</h1>
            <p className="reveal">
              El número secreto era: <strong>{numeroSecreto}</strong><br />
              {adivinadorActual.nombre} dijo: <strong>{ultimoGuess}</strong>
            </p>

            <div className={`uad-score-badge ${Math.abs(ultimoGuess - numeroSecreto) === 0 ? 'acierto' : (Math.abs(ultimoGuess - numeroSecreto) === 1 ? 'cerca' : 'fallo')}`}>
              +{puntosSumados} puntos
            </div>

            <p className="hint small">
              {Math.abs(ultimoGuess - numeroSecreto) === 0 && `¡Acierto exacto! Sumas ${puntosSumados} pts (rondas necesitadas).`}
              {Math.abs(ultimoGuess - numeroSecreto) === 1 && `¡Por muy poco! A 1 de distancia: sumas ${puntosSumados} pts (rondas + 1).`}
              {Math.abs(ultimoGuess - numeroSecreto) > 1 && `¡Fallo! Más de 1 de diferencia: sumas ${puntosSumados} pts (rondas + 10).`}
            </p>
          </div>

          <div className="panel" style={{ marginTop: '1rem' }}>
            <h3 className="panel-title"><Icon name="podium" size={20} /> Marcador (gana el que menos puntos tenga)</h3>
            <div className="scoreboard">
              {ranking.map((j, i) => (
                <div key={j.id} className={`score-row ${i === 0 ? 'first' : ''}`}>
                  <span className="score-name">{i + 1}. {j.nombre}</span>
                  <span className="score-pts">{j.puntos} pts</span>
                </div>
              ))}
            </div>
          </div>

          <div className="actions" style={{ marginTop: '1.2rem' }}>
            <button className="big full" onClick={continuarTrasResolucion}>
              <Icon name="forward" size={22} /> {adivinadoresPendientes.length > 0 ? 'Siguiente Jugador' : 'Ver Podio Final'}
            </button>
          </div>
        </section>
      )}

      {/* 6. PODIO FINAL */}
      {paso === 'fin' && (
        <section className="game">
          <div className="end-card">
            <span className="end-icon"><Icon name="trophy" size={44} /></span>
            <h1 className="title">¡Fin de la Partida!</h1>
            <p className="final-score" style={{ color: '#16a34a' }}>
              🏆 Ganador(es): {ganadores.map(g => g.nombre).join(', ')} con {minPuntos} pts
            </p>
          </div>

          <div className="panel reveal-panel" style={{ marginTop: '1rem' }}>
            <h3 className="reveal-title"><Icon name="podium" size={20} /> Clasificación Final</h3>
            <div className="scoreboard">
              {ranking.map((j, i) => (
                <div key={j.id} className={`score-row ${j.puntos === minPuntos ? 'first' : ''}`}>
                  <span className="score-name">{i + 1}. {j.nombre}</span>
                  <span className="score-pts">{j.puntos} pts</span>
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