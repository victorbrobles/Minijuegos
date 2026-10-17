// client/src/games/QuienMas/QuienMasOnline.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAdmin, adminHeaders } from '../../lib/admin.js';
import Icon from '../../components/Icon.jsx';
import './QuienMas.css';

const CLAVE_SESION_QM = 'quienmas_online_session';

export default function QuienMasOnline({ onLocal, onSalir }) {
  const esAdminGlobal = useAdmin();

  const [vista, setVista] = useState('menu'); // 'menu' | 'crear' | 'unirse' | 'sala'
  const [nombre, setNombre] = useState('');
  const [codigoInput, setCodigoInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);

  const [sesion, setSesion] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(CLAVE_SESION_QM));
    } catch {
      return null;
    }
  });

  const [sala, setSala] = useState(null);
  const [codigoCopiado, setCodigoCopiado] = useState(false);

  const intervalRef = useRef(null);

  useEffect(() => {
    if (!sesion) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setSala(null);
      return;
    }

    const consultarEstado = () => {
      fetch(`/api/quienmas/online/sala/${sesion.code}?token=${sesion.token}`)
        .then((r) => {
          if (!r.ok) throw new Error('Sala no disponible');
          return r.json();
        })
        .then((d) => {
          if (d.success) {
            setSala(d);
            setVista('sala');
          }
        })
        .catch(() => {
          sessionStorage.removeItem(CLAVE_SESION_QM);
          setSesion(null);
          setSala(null);
          setVista('menu');
          setErrorMsg('La sala se ha cerrado o se ha perdido la conexión.');
        });
    };

    consultarEstado();
    intervalRef.current = setInterval(consultarEstado, 600);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sesion]);

  const handleCrear = async () => {
    if (!nombre.trim()) return;
    setErrorMsg('');
    setCargando(true);
    try {
      const res = await fetch('/api/quienmas/online/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear la sala.');

      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_QM, JSON.stringify(nueva));
      setSesion(nueva);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleUnirse = async () => {
    if (!nombre.trim() || !codigoInput.trim()) return;
    setErrorMsg('');
    setCargando(true);
    try {
      const res = await fetch('/api/quienmas/online/unirse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codigoInput.trim().toUpperCase(), nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al unirse.');

      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_QM, JSON.stringify(nueva));
      setSesion(nueva);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleCambiarCategoria = async (cat) => {
    if (!sesion || !sala?.esAdmin) return;
    try {
      await fetch(`/api/quienmas/online/sala/${sesion.code}/categoria`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...adminHeaders() },
        body: JSON.stringify({ token: sesion.token, categoria: cat })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleIniciarPartida = async () => {
    if (!sesion) return;
    try {
      await fetch(`/api/quienmas/online/sala/${sesion.code}/iniciar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...adminHeaders() },
        body: JSON.stringify({ token: sesion.token })
      });
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleVotar = async (candidato) => {
    if (!sesion) return;
    try {
      await fetch(`/api/quienmas/online/sala/${sesion.code}/votar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token, candidato })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleCerrarVotacion = async () => {
    if (!sesion) return;
    try {
      await fetch(`/api/quienmas/online/sala/${sesion.code}/cerrar-votacion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSiguientePregunta = async () => {
    if (!sesion) return;
    try {
      await fetch(`/api/quienmas/online/sala/${sesion.code}/siguiente-pregunta`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleVerRanking = async () => {
    if (!sesion) return;
    try {
      await fetch(`/api/quienmas/online/sala/${sesion.code}/ver-ranking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleReiniciarPartida = async () => {
    if (!sesion) return;
    try {
      await fetch(`/api/quienmas/online/sala/${sesion.code}/reiniciar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSalir = async () => {
    if (sesion) {
      try {
        await fetch(`/api/quienmas/online/sala/${sesion.code}/salir`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: sesion.token })
        });
      } catch {
        /* ignorar */
      }
    }
    sessionStorage.removeItem(CLAVE_SESION_QM);
    setSesion(null);
    setSala(null);
    setVista('menu');
  };

  const copiarCodigo = () => {
    if (!sala?.code) return;
    navigator.clipboard?.writeText(sala.code);
    setCodigoCopiado(true);
    setTimeout(() => setCodigoCopiado(false), 2000);
  };

  const esAdmin = Boolean(sala?.esAdmin);
  const resultado = sala?.resultado;
  const ranking = [...(sala?.jugadores || [])].sort((a, b) => b.puntos - a.puntos);
  const maximoPuntos = ranking.length ? ranking[0].puntos : 0;
  const ganadores = maximoPuntos > 0 ? ranking.filter((j) => j.puntos === maximoPuntos) : [];

  return (
    <div className="qm-contenedor">
      {/* 1. MENÚ PRINCIPAL */}
      {vista === 'menu' && (
        <section className="game">
          <div className="panel center">
            <span className="lb-luna chica">
              <Icon name="users" size={42} strokeWidth={1.6} />
            </span>
            <h1 className="title">¿De verdad os conocéis?</h1>
            <p className="hint">
              Votaciones secretas en grupo para ver quién encaja mejor con cada afirmación. El anfitrión crea la sala y comparte el código.
            </p>

            {errorMsg && <p className="error" style={{ margin: '0.8rem 0' }}>{errorMsg}</p>}

            <div className="lb-menu">
              <button className="big full" onClick={() => { setVista('crear'); setErrorMsg(''); }}>
                <Icon name="crown" size={22} /> Crear partida
              </button>
              <button className="big full" onClick={() => { setVista('unirse'); setErrorMsg(''); }}>
                <Icon name="users" size={22} /> Unirse a partida
              </button>
              <button className="secondary full" onClick={onLocal}>
                <Icon name="home" size={20} /> Jugar en un solo dispositivo
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 2. CREAR SALA */}
      {vista === 'crear' && (
        <section className="game">
          <div className="panel center">
            <span className="lb-luna chica">
              <Icon name="crown" size={40} strokeWidth={1.6} />
            </span>
            <h2 className="title">Crear partida</h2>
            <p className="hint">Introduce tu nombre para crear la sala y ser el anfitrión.</p>

            <div className="lb-form" style={{ marginTop: '1.2rem', textAlign: 'left' }}>
              <label className="field-label" htmlFor="qm-host-nombre">Tu nombre</label>
              <input
                id="qm-host-nombre"
                type="text"
                placeholder="Tu nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                maxLength={20}
                autoFocus
              />
              {errorMsg && <p className="error">{errorMsg}</p>}

              <button
                className="big full"
                style={{ marginTop: '1rem' }}
                disabled={cargando || !nombre.trim()}
                onClick={handleCrear}
              >
                <Icon name="check" size={22} strokeWidth={2.5} /> Crear sala
              </button>
              <button
                className="secondary full"
                style={{ marginTop: '0.6rem' }}
                onClick={() => { setVista('menu'); setErrorMsg(''); }}
              >
                Volver
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 3. UNIRSE A SALA */}
      {vista === 'unirse' && (
        <section className="game">
          <div className="panel center">
            <span className="lb-luna chica">
              <Icon name="users" size={40} strokeWidth={1.6} />
            </span>
            <h2 className="title">Unirse a partida</h2>
            <p className="hint">Introduce el código de 4 letras que te ha dado el anfitrión.</p>

            <div className="lb-form" style={{ marginTop: '1.2rem', textAlign: 'left' }}>
              <label className="field-label" htmlFor="qm-code-input">Código de la sala</label>
              <input
                id="qm-code-input"
                className="lb-input-codigo"
                type="text"
                placeholder="ABCD"
                value={codigoInput}
                onChange={(e) => setCodigoInput(e.target.value.toUpperCase())}
                maxLength={4}
                style={{ textTransform: 'uppercase', letterSpacing: '4px', textAlign: 'center', fontWeight: '800' }}
                autoFocus
              />

              <label className="field-label" htmlFor="qm-guest-nombre" style={{ marginTop: '1rem' }}>Tu nombre</label>
              <input
                id="qm-guest-nombre"
                type="text"
                placeholder="Tu nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                maxLength={20}
              />
              {errorMsg && <p className="error">{errorMsg}</p>}

              <button
                className="big full"
                style={{ marginTop: '1rem' }}
                disabled={cargando || !nombre.trim() || codigoInput.trim().length < 4}
                onClick={handleUnirse}
              >
                <Icon name="check" size={22} strokeWidth={2.5} /> Entrar en la partida
              </button>
              <button
                className="secondary full"
                style={{ marginTop: '0.6rem' }}
                onClick={() => { setVista('menu'); setErrorMsg(''); }}
              >
                Volver
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 4. SALA: LOBBY */}
      {vista === 'sala' && sala && sala.estado === 'lobby' && (
        <section className="game">
          <div className="panel center">
            <p className="categoria"><Icon name="lock" size={16} />Sala de espera</p>
            <p className="hint">Código de la partida</p>
            <button
              type="button"
              className="qq-codigo-btn"
              onClick={copiarCodigo}
              title="Copiar código"
            >
              {sala.code}
            </button>
            <p className="hint small">
              {codigoCopiado ? '¡Copiado al portapapeles!' : 'Pulsa el código para copiarlo y compártelo con los demás.'}
            </p>
          </div>

          {/* Selector de categoría */}
          <div className="panel" style={{ marginTop: '1rem' }}>
            <h3 className="panel-title"><Icon name="dice" size={20} /> Categoría de preguntas</h3>
            {esAdmin ? (
              <div>
                <label className="field-label">Elige la temática para el grupo:</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    className={`pts-btn-modo ${sala.categoria === 'normal' ? 'activo' : ''}`}
                    onClick={() => handleCambiarCategoria('normal')}
                  >
                    😊 Normal (Todos los públicos)
                  </button>

                  {esAdminGlobal ? (
                    <button
                      type="button"
                      className={`pts-btn-modo ${sala.categoria === 'picante' ? 'activo' : ''}`}
                      onClick={() => handleCambiarCategoria('picante')}
                    >
                      🌶️ Picante (Comprometidas)
                    </button>
                  ) : (
                    <button type="button" className="pts-btn-modo" disabled title="Requiere modo administrador">
                      🔒 Picante (Solo Admin)
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <p className="hint" style={{ fontWeight: 700 }}>
                Categoría seleccionada: {sala.categoria === 'picante' ? '🌶️ Picante' : '😊 Normal'}
              </p>
            )}
          </div>

          <div className="panel" style={{ marginTop: '1rem' }}>
            <h3 className="panel-title"><Icon name="users" size={20} /> Jugadores ({sala.jugadores.length})</h3>
            <div className="lb-lista">
              {sala.jugadores.map((j) => (
                <div key={j.id} className={`lb-jug ${j.id === sala.yoId ? 'yo' : ''}`}>
                  <span className="lb-punto on" />
                  <span className="lb-jug-nombre">
                    {j.nombre}{j.id === sala.yoId ? ' (tú)' : ''}{j.id === 1 ? ' 👑' : ''}
                  </span>
                </div>
              ))}
            </div>
            {sala.jugadores.length < 3 && (
              <p className="hint" style={{ marginTop: '0.8rem' }}>
                Faltan al menos {3 - sala.jugadores.length} jugadores para empezar (mínimo 3).
              </p>
            )}
          </div>

          {esAdmin ? (
            <div style={{ marginTop: '1.2rem' }}>
              <button
                className="big full"
                disabled={sala.jugadores.length < 3}
                onClick={handleIniciarPartida}
              >
                <Icon name="play" size={22} />
                {sala.jugadores.length < 3 ? 'Esperando jugadores...' : '¡Empezar Partida!'}
              </button>
            </div>
          ) : (
            <div className="panel center" style={{ padding: '2rem 1.5rem', marginTop: '1rem' }}>
              <span className="lb-luna chica"><Icon name="hourglass" size={40} /></span>
              <h3 style={{ margin: '0.5rem 0' }}>Esperando al anfitrión...</h3>
              <p className="hint">En cuanto comience la partida, verás la primera pregunta para votar en secreto.</p>
            </div>
          )}

          <div className="actions" style={{ marginTop: '1rem' }}>
            <button className="secondary danger full" onClick={handleSalir}>
              <Icon name="door" size={20} /> Salir de la sala
            </button>
          </div>
        </section>
      )}

      {/* 5. SALA: VOTANDO (CADA JUGADOR EN SU MÓVIL) */}
      {vista === 'sala' && sala && sala.estado === 'votando' && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="flagFinish" size={18} />Ronda {sala.rondaNum}</span>
            <span className="chip alt">
              <Icon name="check" size={18} /> {sala.totalVotaron} / {sala.totalJugadores} han votado
            </span>
          </div>

          <div className="panel qm-pregunta">
            <h2 className="title">«{sala.preguntaActual}»</h2>

            {!sala.yaVoto ? (
              <>
                <p className="hint" style={{ margin: '0.5rem 0 1rem' }}>
                  Elige en secreto al jugador que más encaja con la pregunta:
                </p>

                <div className="names-grid">
                  {sala.jugadores.map((j) => (
                    <button
                      key={j.id}
                      type="button"
                      className="secondary"
                      onClick={() => handleVotar(j.nombre)}
                    >
                      {j.nombre}
                      {j.id === sala.yoId && <span className="badge">Tú</span>}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ padding: '1.2rem 0' }}>
                <span className="badge" style={{ background: '#dcfce7', color: '#166534', fontSize: '1rem', padding: '0.4rem 1rem' }}>
                  ✅ Has votado a <strong>{sala.miVoto}</strong>
                </span>
                <p className="hint" style={{ marginTop: '1rem' }}>
                  Esperando a que los demás jugadores terminen de votar ({sala.totalVotaron} de {sala.totalJugadores})...
                </p>

                <div className="scoreboard-container" style={{ justifyContent: 'center', marginTop: '0.8rem' }}>
                  {sala.jugadores.map((j) => (
                    <div key={j.id} className="score-pill">
                      <span>{j.nombre}</span>
                      <span style={{ marginLeft: '6px' }}>{j.haVotado ? '✅' : '⏳'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Control del anfitrión por si alguien se queda dormido */}
          {esAdmin && (
            <div style={{ marginTop: '1rem' }}>
              <button className="secondary full" onClick={handleCerrarVotacion}>
                <Icon name="check" size={18} /> Cerrar votación y ver resultados ya
              </button>
            </div>
          )}

          <div className="actions" style={{ marginTop: '1.2rem' }}>
            <button className="secondary danger full" onClick={handleSalir}>
              <Icon name="door" size={20} /> Salir de la sala
            </button>
          </div>
        </section>
      )}

      {/* 6. SALA: RESULTADO DE LA RONDA */}
      {vista === 'sala' && sala && sala.estado === 'resultado' && resultado && (
        <section className="game">
          <div className="end-card">
            <span className="end-icon">
              <Icon name={resultado.empate ? 'hourglass' : 'trophy'} size={44} />
            </span>
            <p className="categoria"><Icon name="flagFinish" size={16} />Ronda {sala.rondaNum}</p>
            <h1 className="title">Votación de la ronda</h1>
            <p className="reveal">«{sala.preguntaActual}»</p>

            <p className="final-score" style={{ marginTop: '1rem' }}>
              {resultado.empate
                ? <>¡Empate entre {resultado.masVotados.join(' y ')}! Nadie suma puntos</>
                : <>Más votado: {resultado.ganador} ({resultado.maximo} {resultado.maximo === 1 ? 'voto' : 'votos'})</>}
            </p>

            <div className="scoreboard">
              {sala.jugadores.map((j) => {
                const n = resultado.recuento[j.nombre] || 0;
                return (
                  <div key={j.id} className={`score-row ${!resultado.empate && j.nombre === resultado.ganador ? 'first' : ''}`}>
                    <span className="score-name">{j.nombre} {j.id === sala.yoId ? '(Tú)' : ''}</span>
                    <span className="score-pts">{n} {n === 1 ? 'voto' : 'votos'}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Desglose de votos */}
          <div className="panel reveal-panel" style={{ marginTop: '1rem' }}>
            <h3 className="reveal-title"><Icon name="eye" size={20} /> Desglose de votos</h3>
            <div className="reveal-list">
              {sala.jugadores.map((j) => (
                <div key={j.id} className="reveal-row">
                  <span className="reveal-name">
                    {j.nombre} votó a <strong>{resultado.votos[j.nombre] || 'Nadie'}</strong>
                  </span>
                  <span className="reveal-card">
                    {resultado.ganados[j.nombre] > 0 ? '+1 pto' : '0 ptos'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="actions" style={{ marginTop: '1.2rem' }}>
            {esAdmin ? (
              <>
                <button className="big full" onClick={handleSiguientePregunta}>
                  <Icon name="play" size={20} /> Siguiente pregunta
                </button>
                <button className="secondary full" onClick={handleVerRanking}>
                  <Icon name="trophy" size={20} /> Ver clasificación general
                </button>
              </>
            ) : (
              <p className="hint center">Esperando a que el anfitrión pase a la siguiente pregunta...</p>
            )}

            <button className="secondary danger full" onClick={handleSalir}>
              <Icon name="door" size={20} /> Salir de la sala
            </button>
          </div>
        </section>
      )}

      {/* 7. SALA: RANKING GENERAL */}
      {vista === 'sala' && sala && sala.estado === 'ranking' && (
        <section className="game">
          <div className="end-card">
            <span className="end-icon"><Icon name="crown" size={44} /></span>
            <p className="categoria"><Icon name="flagFinish" size={16} />Rondas jugadas: {sala.rondaNum}</p>
            <h1 className="title">Puntuación total</h1>
            <p className="final-score">
              {ganadores.length === 0
                ? 'Nadie ha conseguido puntos todavía'
                : ganadores.length === 1
                ? <>¡{ganadores[0].nombre} lidera con {maximoPuntos} {maximoPuntos === 1 ? 'punto' : 'puntos'}!</>
                : <>Empate en cabeza: {ganadores.map((g) => g.nombre).join(', ')} con {maximoPuntos} pts</>}
            </p>

            <div className="scoreboard">
              {ranking.map((j, i) => {
                const lider = maximoPuntos > 0 && j.puntos === maximoPuntos;
                return (
                  <div key={j.id} className={`score-row ${lider ? 'first' : ''}`}>
                    <span className="score-name">
                      {lider ? <Icon name="crown" size={22} /> : <span className="pos">{i + 1}</span>}
                      {j.nombre} {j.id === sala.yoId ? '(Tú)' : ''}
                    </span>
                    <span className="score-pts">{j.puntos || 0} pts</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="actions" style={{ marginTop: '1.2rem' }}>
            {esAdmin ? (
              <>
                <button className="big full" onClick={handleSiguientePregunta}>
                  <Icon name="play" size={20} /> Continuar jugando (Siguiente pregunta)
                </button>
                <button className="secondary full" onClick={handleReiniciarPartida}>
                  <Icon name="refresh" size={20} /> Nueva partida (reiniciar puntos)
                </button>
              </>
            ) : (
              <p className="hint center">Esperando a que el anfitrión continúe...</p>
            )}

            <button className="secondary danger full" onClick={handleSalir}>
              <Icon name="door" size={20} /> Salir al menú principal
            </button>
          </div>
        </section>
      )}
    </div>
  );
}