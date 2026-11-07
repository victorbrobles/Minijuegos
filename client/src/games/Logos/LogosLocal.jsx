// client/src/games/Logos/LogosLocal.jsx
import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../components/Icon.jsx';
import { getLogoAleatorio, TODOS_LOS_LOGOS } from '../../../../server/data/seeds/logos/logosData.js';
import './Logos.css';
import '../Adivina/Adivina.css';
import { SelectorJugadores } from '../../components/MenuJuego.jsx';

const MIN_JUGADORES = 2;
const MAX_JUGADORES = 10;
const MAX_RONDAS = 30;

const normalizar = (t) =>
  String(t ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();

const distanciaLevenshtein = (a, b) => {
  const matrix = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const coste = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + coste);
    }
  }
  return matrix[a.length][b.length];
};

const esRespuestaCorrecta = (intento, logo) => {
  const normIntento = normalizar(intento);
  if (!normIntento) return false;
  const candidatos = [logo.nombre, ...(logo.sinonimos || [])].map(normalizar);
  for (const c of candidatos) {
    if (normIntento === c) return true;
    const dist = distanciaLevenshtein(normIntento, c);
    const maxLen = Math.max(normIntento.length, c.length);
    if ((1 - dist / maxLen) >= 0.82 || (maxLen >= 5 && dist <= 1)) return true;
  }
  return false;
};

const nombresPorDefecto = (n) => Array.from({ length: n }, (_, i) => `Jugador ${i + 1}`);

export default function LogosLocal({ onSalir }) {
  const [paso, setPaso] = useState('setup');
  const [numJugadores, setNumJugadores] = useState(2);
  const [nombres, setNombres] = useState(nombresPorDefecto(2));
  const [modalAyuda, setModalAyuda] = useState(false);

  const [jugadores, setJugadores] = useState([]);
  const [rondaNum, setRondaNum] = useState(1);
  const [logoActual, setLogoActual] = useState(null);
  const [usados, setUsados] = useState([]);

  const [turnoIdx, setTurnoIdx] = useState(0);
  const [segundos, setSegundos] = useState(60);
  const [inputRespuesta, setInputRespuesta] = useState('');
  const [jugadasRonda, setJugadasRonda] = useState({});

  const timerRef = useRef(null);

  const cambiarNumJugadores = (e) => {
    const k = Number(e.target.value);
    setNumJugadores(k);
    setNombres((prev) => (k > prev.length ? [...prev, ...nombresPorDefecto(k).slice(prev.length)] : prev.slice(0, k)));
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
    setUsados([]);
    comenzarRonda(jugs, 1, []);
  };

  const comenzarRonda = (jugs, rNum, yaUsados) => {
    const nuevoLogo = getLogoAleatorio(yaUsados);
    setLogoActual(nuevoLogo);
    setUsados([...yaUsados, nuevoLogo.id]);
    setJugadasRonda({});
    setTurnoIdx(0);
    setPaso('pasar_turno');
  };

  useEffect(() => {
    if (paso === 'jugando') {
      setSegundos(60);
      setInputRespuesta('');
      timerRef.current = setInterval(() => {
        setSegundos((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            resolverTurno(true, true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [paso, turnoIdx]);

  const resolverTurno = (esPaso = false, tiempoAgotado = false) => {
    clearInterval(timerRef.current);
    const jugActivo = jugadores[turnoIdx];
    const segRest = Math.max(1, segundos);

    let acierto = false;
    let delta = 0;

    if (!esPaso && !tiempoAgotado) {
      acierto = esRespuestaCorrecta(inputRespuesta, logoActual);
      delta = acierto ? segRest : -segRest;
    }

    const nuevosJugs = jugadores.map((j) => {
      if (j.id === jugActivo.id) {
        return { ...j, puntos: j.puntos + delta };
      }
      return j;
    });

    setJugadores(nuevosJugs);
    const nuevasJugadas = {
      ...jugadasRonda,
      [jugActivo.id]: {
        acierto,
        paso: esPaso || tiempoAgotado,
        delta,
        texto: tiempoAgotado ? 'Tiempo agotado' : esPaso ? 'Paso' : inputRespuesta
      }
    };
    setJugadasRonda(nuevasJugadas);

    if (turnoIdx + 1 < jugadores.length) {
      setTurnoIdx(turnoIdx + 1);
      setPaso('pasar_turno');
    } else {
      setPaso('resultados_ronda');
    }
  };

  const siguienteRonda = () => {
    if (rondaNum >= MAX_RONDAS) {
      setPaso('fin');
      return;
    }
    const sig = rondaNum + 1;
    setRondaNum(sig);
    comenzarRonda(jugadores, sig, usados);
  };

  const ranking = [...jugadores].sort((a, b) => b.puntos - a.puntos);
  const maxPuntos = ranking.length > 0 ? ranking[0].puntos : 0;
  const ganadores = maxPuntos > 0 ? ranking.filter((j) => j.puntos === maxPuntos) : [];
  const jugadorTurno = jugadores[turnoIdx];

  return (
    <div className="lg-contenedor" style={{ position: 'relative' }}>
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
                  <h3>¿Cómo se juega a Logo Mania?</h3>
                </div>

                <div className="aprox-modal-cuerpo">
                  <p><strong>1. Dinámica del juego:</strong></p>
                  <ul>
                    <li>Aparecerá la imagen de un logo sin su nombre escrito. Cuentas con un contador de <strong>60 segundos</strong>.</li>
                    <li>Escribe el nombre de la marca o empresa. Se admiten pequeños errores ortográficos o variantes similares.</li>
                  </ul>
                  <p><strong>2. Puntuación y Riesgo:</strong></p>
                  <ul>
                    <li><strong>Acierto:</strong> Sumas los segundos restantes que queden en el contador.</li>
                    <li><strong>Fallo:</strong> Pierdes esos mismos segundos como puntos y se bloquea tu respuesta.</li>
                    <li><strong>Pasar:</strong> Si no lo sabes, pulsa «Pasar turno» para no arriesgar puntos (0 pts).</li>
                  </ul>
                  <p><strong>3. Fin de partida:</strong></p>
                  <ul>
                    <li>Se disputan <strong>30 rondas</strong>. ¡Gana el jugador con mayor puntuación acumulada!</li>
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
          textoBoton="Empezar Partida (30 Rondas)"
          iconoBoton="play"
        />
        </>
      )}

      {/* 2. PASAR MÓVIL AL JUGADOR */}
      {paso === 'pasar_turno' && jugadorTurno && (
        <section className="game center" style={{ padding: '3.5rem 1.5rem' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '0.8rem' }}>🤫</div>
          <h2 className="title" style={{ fontSize: '1.6rem' }}>
            Pasad el móvil a:<br /><span className="hl">{jugadorTurno.nombre}</span>
          </h2>
          <p className="hint" style={{ marginTop: '1rem' }}>Tendrás 60 segundos para reconocer el logo y escribir la marca.</p>
          <button className="big full" style={{ marginTop: '2rem' }} onClick={() => setPaso('jugando')}>
            <Icon name="eye" size={22} /> Soy {jugadorTurno.nombre}, ¡ver logo!
          </button>
        </section>
      )}

      {/* 3. JUGANDO */}
      {paso === 'jugando' && jugadorTurno && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="users" size={18} />Turno de {jugadorTurno.nombre}</span>
            <span className="chip alt"><Icon name="cards" size={16} />Ronda {rondaNum}/{MAX_RONDAS}</span>
          </div>

          <div className="lg-timer-wrap">
            <div className="lg-timer">
              <div
                className={`lg-timer-bar ${segundos <= 10 ? 'low' : ''}`}
                style={{ width: `${Math.max(0, (segundos / 60) * 100)}%` }}
              />
            </div>
            <div className="lg-timer-text">
              <Icon name="clock" size={18} /> {segundos}s
            </div>
          </div>

          <div className="lg-stage-logo">
            {logoActual?.imagen && (
              <img
                src={logoActual.imagen}
                alt="Logo misterioso"
                className="lg-logo-img"
              />
            )}
          </div>

          <div className="panel center">
            <form onSubmit={(e) => { e.preventDefault(); inputRespuesta.trim() && resolverTurno(false); }} className="lg-form-respuesta">
              <input
                type="text"
                className="lg-input-logo"
                placeholder="Escribe el nombre de la marca..."
                value={inputRespuesta}
                onChange={(e) => setInputRespuesta(e.target.value)}
                autoFocus
              />
              <button type="submit" className="big full" disabled={!inputRespuesta.trim()}>
                <Icon name="check" size={20} /> Responder
              </button>
              <button type="button" className="lg-btn-pasar" onClick={() => resolverTurno(true)}>
                Pasar turno
              </button>
            </form>
          </div>
        </section>
      )}

      {/* 4. RESULTADOS DE LA RONDA */}
      {paso === 'resultados_ronda' && (
        <section className="game">
          <div className="end-card">
            <p className="categoria">Ronda {rondaNum} de {MAX_RONDAS}</p>
            <p className="hint">El logo correspondía a:</p>
            <h1 className="lg-respuesta-revelada">{logoActual?.nombre}</h1>
            <div style={{ display: 'flex', justifyContent: 'center', margin: '0.8rem 0' }}>
              {logoActual?.imagen && (
                <img
                  src={logoActual.imagen}
                  alt={logoActual.nombre}
                  style={{ height: '70px', objectFit: 'contain' }}
                />
              )}
            </div>
          </div>

          <div className="panel" style={{ marginTop: '1rem' }}>
            <h3 className="panel-title"><Icon name="speech" size={20} /> Respuestas en esta ronda:</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', margin: '0.8rem 0' }}>
              {jugadores.map((j) => {
                const jgd = jugadasRonda[j.id];
                return (
                  <div key={j.id} style={{ padding: '0.6rem 0.8rem', background: '#f8fafc', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>{j.nombre}:</strong>
                    <span>
                      {jgd?.acierto ? (
                        <span style={{ color: '#16a34a', fontWeight: 800 }}>✔ «{jgd.texto}» (+{jgd.delta} pts)</span>
                      ) : jgd?.paso ? (
                        <span style={{ color: '#64748b', fontWeight: 700 }}>Paso (0 pts)</span>
                      ) : (
                        <span style={{ color: '#dc2626', fontWeight: 800 }}>✖ «{jgd?.texto}» ({jgd?.delta} pts)</span>
                      )}
                    </span>
                  </div>
                );
              })}
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

      {/* 5. PODIO FINAL */}
      {paso === 'fin' && (
        <section className="game">
          <div className="end-card">
            <span className="end-icon"><Icon name="trophy" size={44} /></span>
            <h1 className="title">¡Fin de la Partida!</h1>
            <p className="final-score" style={{ color: '#4338ca' }}>
              {ganadores.length === 0
                ? 'Nadie consiguió puntos positivos.'
                : `🏆 Ganador(es): ${ganadores.map((g) => g.nombre).join(', ')} con ${maxPuntos} pts`}
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