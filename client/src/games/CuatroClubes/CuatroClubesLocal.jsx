// client/src/games/CuatroClubes/CuatroClubesLocal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import GameIntro from '../../components/GameIntro.jsx';
import '../Adivina/Adivina.css';
import './CuatroClubes.css';

const TIEMPO_S = 90; // 90 segundos por jugador en cada turno

function EscudoClub({ club }) {
  const [imgError, setImgError] = useState(false);
  const c1 = club?.colores?.[0] || '#1e293b';
  const c2 = club?.colores?.[1] || '#3b82f6';

  return (
    <div className="cc-club-card">
      <div className="cc-escudo-wrap">
        {club?.escudo && !imgError ? (
          <img
            src={club.escudo}
            alt={club.nombre}
            className="cc-escudo-img"
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className="cc-escudo-fallback"
            style={{ background: `linear-gradient(135deg, ${c1} 50%, ${c2} 50%)` }}
          >
            <span>{club?.siglas || club?.nombre?.substring(0, 3).toUpperCase()}</span>
          </div>
        )}
      </div>
      <span className="cc-club-nombre">{club?.nombre}</span>
    </div>
  );
}

// Calcula el orden de turnos de la ronda rotando el jugador inicial en cada ronda:
// Ronda 1 -> empieza Jugador 1; Ronda 2 -> empieza Jugador 2; Ronda 3 -> empieza Jugador 3...
function obtenerOrdenRonda(listaJugadores, numRonda) {
  const n = listaJugadores.length;
  if (n === 0) return [];
  const inicioIdx = ((numRonda - 1) % n + n) % n;
  const orden = [];
  for (let k = 0; k < n; k++) {
    orden.push(listaJugadores[(inicioIdx + k) % n]);
  }
  return orden;
}

export default function CuatroClubesLocal({ onVolver, onExit }) {
  const navigate = useNavigate();
  const [paso, setPaso] = useState('config'); // 'config' | 'jugando' | 'resumen' | 'final'
  const [modalAyuda, setModalAyuda] = useState(false);
  const [modalRespuestas, setModalRespuestas] = useState(false);

  const [jugadores, setJugadores] = useState([
    { id: 1, nombre: 'Jugador 1' },
    { id: 2, nombre: 'Jugador 2' }
  ]);
  const [puntos, setPuntos] = useState({});
  const [ronda, setRonda] = useState(1);
  const [usados, setUsados] = useState([]);
  const [reto, setReto] = useState(null);

  // Índice del turno dentro de la ronda actual (0 a jugadores.length - 1)
  const [turnoIdx, setTurnoIdx] = useState(0);
  const [respuestasRonda, setRespuestasRonda] = useState([]);
  const [restante, setRestante] = useState(TIEMPO_S);

  const timerRef = useRef(null);

  const maxRondas = jugadores.length * 3;
  // El orden de la ronda se deriva directamente del número de ronda para garantizar la rotación
  const ordenTurnos = obtenerOrdenRonda(jugadores, ronda);
  const jugadorActual = ordenTurnos[turnoIdx] || null;
  const jugadorInicial = ordenTurnos[0] || null;

  const limpiarTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Temporizador de 90s que se reinicia en cada turno de jugador durante la ronda
  useEffect(() => {
    limpiarTimer();
    if (paso !== 'jugando' || !reto) return undefined;

    setRestante(TIEMPO_S);
    timerRef.current = setInterval(() => {
      setRestante((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => limpiarTimer();
  }, [paso, ronda, turnoIdx, reto]);

  // Si el temporizador llega a 0 en el turno de un jugador, anota 0 puntos y pasa al siguiente jugador
  useEffect(() => {
    if (paso === 'jugando' && restante === 0 && reto) {
      puntuarTurno(0, true);
    }
  }, [restante, paso, reto]);

  const handleNumJugadores = (e) => {
    const num = parseInt(e.target.value, 10);
    setJugadores(
      Array.from({ length: num }, (_, i) => ({
        id: i + 1,
        nombre: jugadores[i]?.nombre ?? `Jugador ${i + 1}`
      }))
    );
  };

  const handleNombre = (index, valor) => {
    setJugadores(jugadores.map((j, i) => (i === index ? { ...j, nombre: valor } : j)));
  };

  const cargarReto = async (numRondaSiguiente, listaUsados) => {
    try {
      limpiarTimer();
      const res = await fetch('/api/cuatroclubes/reto-local', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usados: listaUsados })
      });
      const data = await res.json();
      if (data.success && data.reto) {
        setUsados([...listaUsados, data.reto.id]);
        setRonda(numRondaSiguiente);
        setTurnoIdx(0);
        setRespuestasRonda([]);
        setModalRespuestas(false);
        setRestante(TIEMPO_S);
        setReto(data.reto);
        setPaso('jugando');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const empezar = () => {
    const lista = jugadores.map((j) => ({ ...j, nombre: j.nombre.trim() || `Jugador ${j.id}` }));
    setJugadores(lista);
    setPuntos(Object.fromEntries(lista.map((j) => [j.id, 0])));
    cargarReto(1, []);
  };

  const puntuarTurno = (clubesAcertados, porTiempo = false) => {
    if (!jugadorActual) return;
    limpiarTimer();

    const pts = Math.max(0, Math.min(4, clubesAcertados));
    setPuntos((prev) => ({
      ...prev,
      [jugadorActual.id]: (prev[jugadorActual.id] ?? 0) + pts
    }));

    const nuevasRespuestas = [
      ...respuestasRonda,
      {
        jugadorId: jugadorActual.id,
        nombre: jugadorActual.nombre,
        puntos: pts,
        tiempoAgotado: porTiempo
      }
    ];
    setRespuestasRonda(nuevasRespuestas);

    if (turnoIdx + 1 >= ordenTurnos.length) {
      setPaso('resumen');
      setModalRespuestas(true); // Desvelar futbolistas de 4 y 3 clubes al concluir la ronda
    } else {
      setRestante(TIEMPO_S);
      setTurnoIdx((prevIdx) => prevIdx + 1);
    }
  };

  const finalizarRondaManual = () => {
    limpiarTimer();
    setPaso('resumen');
    setModalRespuestas(true);
  };

  const continuar = () => {
    if (ronda >= maxRondas) {
      limpiarTimer();
      setPaso('final');
    } else {
      cargarReto(ronda + 1, usados);
    }
  };

  const ranking = [...jugadores].sort((a, b) => (puntos[b.id] ?? 0) - (puntos[a.id] ?? 0));
  const maximo = ranking.length ? (puntos[ranking[0].id] ?? 0) : 0;

  return (
    <div className="rk-contenedor">
      {paso === 'config' && (
        <>
          <button type="button" className="rk-btn-ayuda" onClick={() => setModalAyuda(true)} title="Reglas">
            <span className="rk-btn-ayuda-signo">?</span>
          </button>

          {modalAyuda && (
            <div className="rg-modal-fondo" onClick={() => setModalAyuda(false)}>
              <div className="rg-modal rk-modal-ayuda" onClick={(e) => e.stopPropagation()}>
                <div className="rk-modal-header">
                  <span className="rk-modal-signo-title">?</span>
                  <h3>¿Cómo se juega a El club de los cuatro?</h3>
                </div>
                <div className="rk-modal-cuerpo">
                  <p>
                    En cada ronda aparecerán en pantalla los <strong>escudos de 4 clubes distintos</strong>. El objetivo es decir un futbolista que haya jugado en el <strong>máximo número posible</strong> de esos 4 clubes.
                  </p>
                  <ul>
                    <li><strong>Jugadores y rondas:</strong> De 2 a 10 jugadores. Se juegan tantas rondas como jugadores haya multiplicado por 3 (cada jugador inicia 3 rondas).</li>
                    <li><strong>Rotación e inicio de ronda:</strong> Cada vez que cambian los 4 clubes, empieza la ronda el siguiente jugador en orden secuencial.</li>
                    <li><strong>90 segundos por jugador:</strong> Cada jugador dispone de 90 segundos en su turno para decir un futbolista en voz alta.</li>
                    <li><strong>Puntuación:</strong> Cada club acertado suma <strong>+1 punto</strong> (de 0 a 4 puntos por turno).</li>
                    <li><strong>Desvelar soluciones:</strong> Al finalizar cada ronda se abrirá una ventana con ejemplos reales de futbolistas que jugaron en los 4 clubes y en 3 de ellos.</li>
                  </ul>
                </div>
                <div className="rg-modal-acciones">
                  <button className="big full" onClick={() => setModalAyuda(false)}>Entendido</button>
                </div>
              </div>
            </div>
          )}

          <section className="game">
            <GameIntro gameId="cuatroclubes" titulo="El club de los cuatro" />

            <div className="panel">
              <div className="hud" style={{ marginBottom: '1rem' }}>
                <button className="btn-back-inline" onClick={onVolver}>&larr; Cambiar a modo Online</button>
              </div>
              <h3 className="panel-title"><Icon name="users" size={22} />Jugadores (2 a 10)</h3>
              <select
                value={jugadores.length}
                onChange={handleNumJugadores}
                style={{ marginBottom: '1rem', width: '100%', padding: '0.8rem', borderRadius: '8px' }}
              >
                {[...Array(9)].map((_, i) => (
                  <option key={i + 2} value={i + 2}>
                    {i + 2} jugadores ({(i + 2) * 3} rondas)
                  </option>
                ))}
              </select>
              <div className="names-grid">
                {jugadores.map((j, idx) => (
                  <input
                    key={j.id}
                    type="text"
                    value={j.nombre}
                    onChange={(e) => handleNombre(idx, e.target.value)}
                    placeholder={`Jugador ${j.id}`}
                    maxLength={20}
                  />
                ))}
              </div>
            </div>
            <button className="big full" onClick={empezar}>
              <Icon name="play" size={24} /> Empezar Partida ({maxRondas} rondas)
            </button>
          </section>
        </>
      )}

      {paso === 'jugando' && reto && (
        <section className="game">
          <div className="hud" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span className="chip"><Icon name="flagFinish" size={18} />Ronda {ronda} de {maxRondas}</span>
            <span className="chip">Abre esta ronda: <strong>{jugadorInicial?.nombre}</strong></span>
          </div>

          {/* Escudos de los 4 clubes siempre visibles en pantalla */}
          <div className="panel center" style={{ margin: '1rem 0', padding: '1.4rem 1rem' }}>
            <h3 className="cc-subtitulo">¿Qué futbolista ha jugado en más de estos 4 clubes?</h3>
            <div className="cc-clubes-grid">
              {(reto.clubes || []).map((club, idx) => (
                <EscudoClub key={idx} club={club} />
              ))}
            </div>
          </div>

          {/* Barra de temporizador de 90s idéntica a la de los otros minijuegos */}
          <div className="timer" role="timer" aria-label="Tiempo restante">
            <div className={`timer-bar${restante <= 15 ? ' low' : ''}`} style={{ width: `${(restante / TIEMPO_S) * 100}%` }} />
          </div>
          <p className="timer-text"><Icon name="clock" size={16} />{restante} s</p>

          {/* Progreso de turnos de la ronda (muestra el orden rotado de esta ronda) */}
          <div className="cc-turnos-barra">
            {ordenTurnos.map((j, idx) => {
              const resp = respuestasRonda.find((r) => r.jugadorId === j.id);
              const activo = idx === turnoIdx;
              return (
                <div
                  key={j.id}
                  className={`cc-turno-pill ${activo ? 'activo' : ''} ${resp ? 'completado' : ''}`}
                >
                  <span>{idx + 1}º {j.nombre}</span>
                  {resp && <strong>+{resp.puntos}</strong>}
                </div>
              );
            })}
          </div>

          {/* Pantalla del jugador en su turno para elegir cuántos clubes acertó */}
          {jugadorActual && (
            <div className="panel center cc-panel-turno">
              <p className="cc-turno-etiqueta">
                Turno {turnoIdx + 1} de {ordenTurnos.length} • Inicia ronda: {jugadorInicial?.nombre}
              </p>
              <h2 className="cc-turno-nombre">Turno de {jugadorActual.nombre}</h2>
              <p className="hint" style={{ marginBottom: '1rem' }}>
                Tienes {restante}s para decir un futbolista en voz alta. ¿En cuántos de estos 4 clubes ha jugado?
              </p>

              <div className="cc-botones-puntos">
                {[0, 1, 2, 3, 4].map((pts) => (
                  <button
                    key={pts}
                    type="button"
                    className={`cc-btn-punto cc-pts-${pts}`}
                    onClick={() => puntuarTurno(pts, false)}
                  >
                    <span className="cc-btn-num">{pts}</span>
                    <span className="cc-btn-txt">{pts === 1 ? '1 club (+1 pt)' : `${pts} clubes (+${pts} pts)`}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Botones de control de ronda, partida y salida */}
          <div className="cc-acciones-footer">
            <button type="button" className="secondary" onClick={finalizarRondaManual}>
              <Icon name="flag" size={18} /> Fin de ronda
            </button>
            <button type="button" className="secondary danger" onClick={() => { limpiarTimer(); setPaso('final'); }}>
              <Icon name="flagFinish" size={18} /> Fin de partida
            </button>
            <button type="button" className="secondary" onClick={() => { limpiarTimer(); setPaso('config'); }}>
              <Icon name="door" size={18} /> Salir a la sala
            </button>
          </div>
        </section>
      )}

      {paso === 'resumen' && reto && (
        <section className="game">
          {/* Mantenemos los 4 escudos visibles también en el resumen */}
          <div className="panel center" style={{ marginBottom: '1rem', padding: '1rem' }}>
            <div className="cc-clubes-grid compacto">
              {(reto.clubes || []).map((club, idx) => (
                <EscudoClub key={idx} club={club} />
              ))}
            </div>
            <button
              type="button"
              className="secondary"
              style={{ marginTop: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 'bold' }}
              onClick={() => setModalRespuestas(true)}
            >
              <Icon name="eye" size={18} /> Ver futbolistas en 4 y 3 clubes
            </button>
          </div>

          <div className="end-card">
            <span className="end-icon"><Icon name="trophy" size={44} /></span>
            <h1 className="title">Puntuaciones (Ronda {ronda} de {maxRondas})</h1>

            {respuestasRonda.length > 0 && (
              <div className="cc-resumen-ronda">
                {respuestasRonda.map((r, i) => (
                  <span key={i} className="cc-resumen-chip">
                    {r.nombre}: <strong>+{r.puntos} pts</strong>{r.tiempoAgotado ? ' (⏱️ Tiempo)' : ''}
                  </span>
                ))}
              </div>
            )}

            <div className="scoreboard">
              {ranking.map((j, i) => (
                <div key={j.id} className={`score-row${maximo > 0 && puntos[j.id] === maximo ? ' first' : ''}`}>
                  <span className="score-name">
                    {maximo > 0 && puntos[j.id] === maximo ? <Icon name="crown" size={22} /> : <span className="pos">{i + 1}</span>}
                    {j.nombre}
                  </span>
                  <span className="score-pts">{puntos[j.id] ?? 0} pts</span>
                </div>
              ))}
            </div>
          </div>

          <div className="actions">
            <button onClick={continuar}>
              <Icon name="play" size={20} />
              {ronda >= maxRondas
                ? 'Ver Podio Final'
                : `Continuar a la Ronda ${ronda + 1} (Empezará ${obtenerOrdenRonda(jugadores, ronda + 1)[0]?.nombre})`}
            </button>
            <button className="secondary danger" onClick={() => setPaso('final')}>
              <Icon name="flagFinish" size={20} /> Fin de partida
            </button>
            <button className="secondary" onClick={() => setPaso('config')}>
              <Icon name="door" size={20} /> Salir a la sala
            </button>
          </div>

          {/* Ventana modal al acabar la ronda que desvela los jugadores de 4 y 3 clubes */}
          {modalRespuestas && (
            <div className="rg-modal-fondo" onClick={() => setModalRespuestas(false)}>
              <div className="rg-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
                <h3 style={{ marginBottom: '0.5rem', color: '#1e1b4b' }}>Futbolistas de esta combinación</h3>
                <p className="hint small" style={{ marginBottom: '1rem' }}>
                  {(reto.clubes || []).map((c) => c.nombre).join(' • ')}
                </p>

                <div className="cc-soluciones-box">
                  <div className="cc-sol-seccion">
                    <h4 className="cc-sol-titulo cuatro">⭐ Jugaron en los 4 clubes (4 pts)</h4>
                    {reto.jugadores4 && reto.jugadores4.length > 0 ? (
                      reto.jugadores4.map((jug, i) => (
                        <div key={i} className="cc-sol-item">• {jug}</div>
                      ))
                    ) : (
                      <div className="cc-sol-vacio">Sin registros.</div>
                    )}
                  </div>

                  <div className="cc-sol-seccion" style={{ marginTop: '1rem' }}>
                    <h4 className="cc-sol-titulo tres">🔥 Jugaron en 3 de los 4 clubes (3 pts)</h4>
                    {reto.jugadores3 && reto.jugadores3.length > 0 ? (
                      reto.jugadores3.map((jug, i) => (
                        <div key={i} className="cc-sol-item">• {jug}</div>
                      ))
                    ) : (
                      <div className="cc-sol-vacio">Sin registros.</div>
                    )}
                  </div>
                </div>

                <button className="big full" onClick={() => setModalRespuestas(false)}>
                  Ver puntuaciones
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {paso === 'final' && (
        <section className="game">
          <div className="end-card">
            <span className="end-icon"><Icon name="crown" size={48} /></span>
            <h1 className="title">Clasificación Final</h1>
            <div className="scoreboard" style={{ marginTop: '1.5rem' }}>
              {ranking.map((j, i) => (
                <div key={j.id} className={`score-row${maximo > 0 && puntos[j.id] === maximo ? ' first' : ''}`}>
                  <span className="score-name">
                    {maximo > 0 && puntos[j.id] === maximo ? <Icon name="crown" size={22} /> : <span className="pos">{i + 1}</span>}
                    {j.nombre}
                  </span>
                  <span className="score-pts">{puntos[j.id] ?? 0} pts</span>
                </div>
              ))}
            </div>
          </div>
          <div className="actions">
            <button onClick={() => setPaso('config')}>
              <Icon name="refresh" size={20} /> Nueva Partida
            </button>
            <button className="secondary danger" onClick={() => (onExit ? onExit() : navigate('/'))}>
              <Icon name="door" size={20} /> Salir al menú
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
