// client/src/games/Conoce/ConoceLocal.jsx
import React, { useState } from 'react';
import Icon from '../../components/Icon.jsx';
import { getPreguntaAleatoria } from '../../../../server/data/seeds/conoce/conoceData.js';
import './Conoce.css';
import '../Adivina/Adivina.css';
import { SelectorJugadores } from '../../components/MenuJuego.jsx';

const MIN_JUGADORES = 4;
const MAX_JUGADORES = 16;
const MAX_RONDAS = 15;

const nombresPorDefecto = (n) => Array.from({ length: n }, (_, i) => `Jugador ${i + 1}`);

export default function ConoceLocal({ onSalir }) {
  const [paso, setPaso] = useState('setup'); // setup | pasar_resp | respondiendo | cuenta_atras | pasar_adivinar | adivinando | resultados | fin
  const [numJugadores, setNumJugadores] = useState(4);
  const [nombres, setNombres] = useState(nombresPorDefecto(4));
  const [modalAyuda, setModalAyuda] = useState(false);

  const [jugadores, setJugadores] = useState([]);
  const [rondaNum, setRondaNum] = useState(1);
  const [preguntaActual, setPreguntaActual] = useState('');
  const [usadas, setUsadas] = useState([]);

  // Control de turnos al pasar el móvil
  const [turnoIdx, setTurnoIdx] = useState(0);
  const [respuestas, setRespuestas] = useState({}); // { [id]: string }
  const [adivinanzas, setAdivinanzas] = useState({}); // { [idAdivinador]: { [idTarget]: string } }
  const [inputRespuesta, setInputRespuesta] = useState('');
  const [asignacionesActuales, setAsignacionesActuales] = useState({});

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
    const jugs = nombres.map((n, i) => ({ id: i + 1, nombre: n.trim() || `Jugador ${i + 1}`, puntos: 0 }));
    setJugadores(jugs);
    setRondaNum(1);
    setUsadas([]);
    comenzarNuevaRonda(jugs, 1, []);
  };

  const comenzarNuevaRonda = (jugs, rNum, yaUsadas) => {
    const preg = getPreguntaAleatoria(yaUsadas);
    setPreguntaActual(preg);
    setUsadas([...yaUsadas, preg]);
    setRespuestas({});
    setAdivinanzas({});
    setTurnoIdx(0);
    setInputRespuesta('');
    setPaso('pasar_resp');
  };

  const guardarRespuesta = () => {
    if (!inputRespuesta.trim()) return;
    const jId = jugadores[turnoIdx].id;
    const nuevasResp = { ...respuestas, [jId]: inputRespuesta.trim() };
    setRespuestas(nuevasResp);
    setInputRespuesta('');

    if (turnoIdx + 1 < jugadores.length) {
      setTurnoIdx(turnoIdx + 1);
      setPaso('pasar_resp');
    } else {
      // Todos han respondido -> cuenta atrás
      setPaso('cuenta_atras');
    }
  };

  const empezarAdivinanzasPasaMovil = () => {
    setTurnoIdx(0);
    setAsignacionesActuales({});
    setPaso('pasar_adivinar');
  };

  const guardarAdivinanzaJugador = () => {
    const jId = jugadores[turnoIdx].id;
    const nuevasAdiv = { ...adivinanzas, [jId]: asignacionesActuales };
    setAdivinanzas(nuevasAdiv);
    setAsignacionesActuales({});

    if (turnoIdx + 1 < jugadores.length) {
      setTurnoIdx(turnoIdx + 1);
      setPaso('pasar_adivinar');
    } else {
      // Calcular puntuaciones
      calcularPuntos(nuevasAdiv);
      setPaso('resultados');
    }
  };

  const calcularPuntos = (todasAdivinanzas) => {
    const nuevosJugs = jugadores.map(j => ({ ...j }));

    for (let i = 0; i < nuevosJugs.length; i++) {
      for (let j = i + 1; j < nuevosJugs.length; j++) {
        const pA = nuevosJugs[i];
        const pB = nuevosJugs[j];

        const respA = respuestas[pA.id]?.trim().toLowerCase();
        const respB = respuestas[pB.id]?.trim().toLowerCase();

        const aciertoA = todasAdivinanzas[pA.id]?.[pB.id]?.trim().toLowerCase() === respB;
        const aciertoB = todasAdivinanzas[pB.id]?.[pA.id]?.trim().toLowerCase() === respA;

        if (aciertoA && aciertoB) {
          pA.puntos += 3;
          pB.puntos += 3;
        } else if (aciertoA && !aciertoB) {
          pA.puntos += 2;
          pB.puntos -= 1;
        } else if (!aciertoA && aciertoB) {
          pA.puntos -= 1;
          pB.puntos += 2;
        } else {
          pA.puntos -= 1;
          pB.puntos -= 1;
        }
      }
    }

    setJugadores(nuevosJugs);
  };

  const siguienteRonda = () => {
    if (rondaNum >= MAX_RONDAS) {
      setPaso('fin');
      return;
    }
    const sig = rondaNum + 1;
    setRondaNum(sig);
    comenzarNuevaRonda(jugadores, sig, usadas);
  };

  const ranking = [...jugadores].sort((a, b) => b.puntos - a.puntos);
  const maxPuntos = ranking.length > 0 ? ranking[0].puntos : 0;
  const ganadores = maxPuntos > 0 ? ranking.filter(j => j.puntos === maxPuntos) : [];

  const jugadorTurno = jugadores[turnoIdx];
  const respuestasOpciones = jugadores
    .filter(j => j.id !== jugadorTurno?.id)
    .map(j => respuestas[j.id])
    .sort((a, b) => a.localeCompare(b));

  return (
    <div className="cnc-contenedor" style={{ position: 'relative' }}>
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
                  <h3>¿Cómo se juega a Conoce a tus amigos?</h3>
                </div>

                <div className="aprox-modal-cuerpo">
                  <p><strong>1. Pregunta sincera:</strong></p>
                  <ul>
                    <li>En cada ronda sale una pregunta cotidiana. Cada jugador responde sinceramente en su turno sin que nadie lo vea.</li>
                  </ul>
                  <p><strong>2. Adivinar quién dijo qué:</strong></p>
                  <ul>
                    <li>Aparecerán las respuestas desordenadas de todos. Deberás emparejar cada respuesta con el amigo que crees que la escribió.</li>
                  </ul>
                  <p><strong>3. Puntuación por parejas:</strong></p>
                  <ul>
                    <li><strong>¡Os conocéis bien!</strong> (Si ambos os acertáis): <strong>+3 puntos</strong> para cada uno.</li>
                    <li><strong>Le conoces</strong> (Tú aciertas su respuesta, pero él no la tuya): <strong>+2 puntos</strong> para ti y <strong>-1 punto</strong> para él.</li>
                    <li><strong>No os conocéis</strong> (Ambos falláis): <strong>-1 punto</strong> para cada uno.</li>
                  </ul>
                  <p><strong>4. Fin de la partida:</strong></p>
                  <ul>
                    <li>Se disputan <strong>15 rondas</strong>. ¡Gana quien más puntos sume!</li>
                  </ul>
                </div>

                <div className="rg-modal-acciones" style={{ marginTop: '1.2rem' }}>
                  <button className="big full" onClick={() => setModalAyuda(false)}>Entendido</button>
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
          textoBoton="Empezar Partida (15 Rondas)"
          iconoBoton="play"
        />
        </>
      )}

      {/* 2. PASAR MÓVIL PARA RESPONDER */}
      {paso === 'pasar_resp' && jugadorTurno && (
        <section className="game center" style={{ padding: '3.5rem 1.5rem' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '0.8rem' }}>🤫</div>
          <h2 className="title" style={{ fontSize: '1.6rem' }}>
            Pasad el móvil a:<br /><span className="hl">{jugadorTurno.nombre}</span>
          </h2>
          <p className="hint" style={{ marginTop: '1rem' }}>Vas a responder a la pregunta secreta de esta ronda.</p>
          <button className="big full" style={{ marginTop: '2rem' }} onClick={() => setPaso('respondiendo')}>
            <Icon name="eye" size={22} /> Soy {jugadorTurno.nombre}, responder
          </button>
        </section>
      )}

      {/* 3. RESPONDIENDO */}
      {paso === 'respondiendo' && jugadorTurno && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="users" size={18} />Turno de {jugadorTurno.nombre}</span>
            <span className="chip alt">Ronda {rondaNum}/{MAX_RONDAS}</span>
          </div>

          <div className="cnc-pregunta-card">
            <span className="field-label" style={{ color: 'rgba(255,255,255,0.85)' }}>Pregunta:</span>
            <h2>{preguntaActual}</h2>
          </div>

          <div className="panel center">
            <p className="hint">Escribe tu respuesta sincera (nadie la verá aún):</p>
            <input
              type="text"
              className="player-text-input"
              placeholder="Tu respuesta..."
              value={inputRespuesta}
              onChange={(e) => setInputRespuesta(e.target.value)}
              autoFocus
            />

            <button
              className="big full"
              style={{ marginTop: '1.2rem' }}
              disabled={!inputRespuesta.trim()}
              onClick={guardarRespuesta}
            >
              <Icon name="check" size={20} /> Guardar y pasar móvil
            </button>
          </div>
        </section>
      )}

      {/* 4. CUENTA ATRÁS ANTES DE ADIVINAR */}
      {paso === 'cuenta_atras' && (
        <div className="cnc-overlay-cuenta">
          <p style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 1rem' }}>¡TODOS HAN RESPONDIDO!</p>
          <p className="hint" style={{ color: '#e2e8f0', marginBottom: '1.5rem' }}>
            A continuación cada jugador deberá emparejar las respuestas con sus amigos.
          </p>
          <button className="big" onClick={empezarAdivinanzasPasaMovil}>
            ¡Comenzar fase de adivinar!
          </button>
        </div>
      )}

      {/* 5. PASAR MÓVIL PARA ADIVINAR */}
      {paso === 'pasar_adivinar' && jugadorTurno && (
        <section className="game center" style={{ padding: '3.5rem 1.5rem' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '0.8rem' }}>🎯</div>
          <h2 className="title" style={{ fontSize: '1.6rem' }}>
            Pasad el móvil a:<br /><span className="hl">{jugadorTurno.nombre}</span>
          </h2>
          <p className="hint" style={{ marginTop: '1rem' }}>Te toca adivinar qué respondió cada uno de tus amigos.</p>
          <button className="big full" style={{ marginTop: '2rem' }} onClick={() => setPaso('adivinando')}>
            <Icon name="check" size={22} /> Soy {jugadorTurno.nombre}, adivinar
          </button>
        </section>
      )}

      {/* 6. ADIVINANDO */}
      {paso === 'adivinando' && jugadorTurno && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="users" size={18} />Adivina: {jugadorTurno.nombre}</span>
            <span className="chip alt">Ronda {rondaNum}/{MAX_RONDAS}</span>
          </div>

          <div className="cnc-pregunta-card">
            <h2>{preguntaActual}</h2>
          </div>

          <div className="panel">
            <p className="hint" style={{ marginBottom: '1rem' }}>Selecciona la respuesta que crees que corresponde a cada compañero:</p>

            {jugadores.filter(j => j.id !== jugadorTurno.id).map(rival => (
              <div key={rival.id} className="cnc-asignar-row">
                <span className="cnc-asignar-header">👤 {rival.nombre}</span>
                <select
                  className="cnc-select-respuesta"
                  value={asignacionesActuales[rival.id] || ''}
                  onChange={(e) => setAsignacionesActuales({ ...asignacionesActuales, [rival.id]: e.target.value })}
                >
                  <option value="">-- Elige una respuesta --</option>
                  {respuestasOpciones.map((opc, idx) => (
                    <option key={idx} value={opc}>{opc}</option>
                  ))}
                </select>
              </div>
            ))}

            <button
              className="big full"
              style={{ marginTop: '1.2rem' }}
              disabled={Object.keys(asignacionesActuales).length < jugadores.length - 1}
              onClick={guardarAdivinanzaJugador}
            >
              <Icon name="check" size={20} /> Confirmar mis deducciones
            </button>
          </div>
        </section>
      )}

      {/* 7. RESULTADOS DE LA RONDA */}
      {paso === 'resultados' && (
        <section className="game">
          <div className="end-card">
            <span className="end-icon"><Icon name="users" size={44} /></span>
            <p className="categoria">Resultados de la ronda {rondaNum}</p>
            <h1 className="title">{preguntaActual}</h1>
          </div>

          <div className="panel" style={{ marginTop: '1rem' }}>
            <h3 className="panel-title"><Icon name="speech" size={20} /> Respuestas reales de cada uno</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', margin: '0.8rem 0' }}>
              {jugadores.map(j => (
                <div key={j.id} style={{ padding: '0.6rem 0.8rem', background: '#f8fafc', borderRadius: '10px', display: 'flex', justifyContent: 'space-between' }}>
                  <strong>{j.nombre}:</strong>
                  <span>«{respuestas[j.id]}»</span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel" style={{ marginTop: '1rem' }}>
            <h3 className="panel-title"><Icon name="trophy" size={20} /> Marcador general</h3>
            <div className="scoreboard">
              {ranking.map((j, i) => (
                <div key={j.id} className={`score-row ${i === 0 && j.puntos > 0 ? 'first' : ''}`}>
                  <span className="score-name">{i + 1}. {j.nombre}</span>
                  <span className="score-pts">{j.puntos} pts</span>
                </div>
              ))}
            </div>
          </div>

          <div className="actions" style={{ marginTop: '1.2rem' }}>
            <button className="big full" onClick={siguienteRonda}>
              <Icon name="play" size={20} /> {rondaNum >= MAX_RONDAS ? 'Ver Podio Final' : `Siguiente Ronda (${rondaNum + 1})`}
            </button>
            <button className="secondary danger full" onClick={() => setPaso('fin')}>
              Finalizar partida ahora
            </button>
          </div>
        </section>
      )}

      {/* 8. PODIO FINAL */}
      {paso === 'fin' && (
        <section className="game">
          <div className="end-card">
            <span className="end-icon"><Icon name="trophy" size={44} /></span>
            <h1 className="title">¡Fin de la Partida!</h1>
            <p className="final-score" style={{ color: '#4338ca' }}>
              {ganadores.length === 0
                ? 'Nadie consiguió puntos positivos.'
                : `🏆 Ganador(es): ${ganadores.map(g => g.nombre).join(', ')} con ${maxPuntos} pts`}
            </p>
          </div>

          <div className="panel reveal-panel" style={{ marginTop: '1rem' }}>
            <h3 className="reveal-title"><Icon name="podium" size={20} /> Clasificación Final</h3>
            <div className="scoreboard">
              {ranking.map((j, i) => (
                <div key={j.id} className={`score-row ${j.puntos === maxPuntos && maxPuntos > 0 ? 'first' : ''}`}>
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
            <button className="secondary full" onClick={onSalir}>Salir al menú</button>
          </div>
        </section>
      )}
    </div>
  );
}