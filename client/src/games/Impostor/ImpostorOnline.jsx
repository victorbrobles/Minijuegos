// client/src/games/Impostor/ImpostorOnline.jsx
import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../components/Icon.jsx';
import './Impostor.css';
import { MenuInicioJuego, MenuModoOnline, FormCrearSala, FormUnirseSala, CabeceraSala } from '../../components/MenuJuego.jsx';

const CLAVE_SESION_IMP = 'impostor_online_session';

export default function ImpostorOnline({ onLocal, onSalir }) {
  const [vista, setVista] = useState('menu');
  const [nombre, setNombre] = useState('');
  const [codigoInput, setCodigoInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);
  const [modalSalir, setModalSalir] = useState(false);
  const [modalAyuda, setModalAyuda] = useState(false);
  
  const [modoAdmin, setModoAdmin] = useState('clasico');

  const [sesion, setSesion] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(CLAVE_SESION_IMP));
    } catch {
      return null;
    }
  });

  const [sala, setSala] = useState(null);
  const [codigoCopiado, setCodigoCopiado] = useState(false);
  const [ocultarPalabra, setOcultarPalabra] = useState(false);

  const [ganador, setGanador] = useState('impostor');
  const [rondasSobrevividas, setRondasSobrevividas] = useState(1);

  const intervalRef = useRef(null);

  useEffect(() => {
    if (!sesion) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setSala(null);
      return;
    }

    const consultarEstado = () => {
      fetch(`/api/impostor/online/sala/${sesion.code}?token=${sesion.token}`)
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
          sessionStorage.removeItem(CLAVE_SESION_IMP);
          setSesion(null);
          setSala(null);
          setVista('online_menu');
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
      const res = await fetch('/api/impostor/online/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear la sala.');

      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_IMP, JSON.stringify(nueva));
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
      const res = await fetch('/api/impostor/online/unirse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codigoInput.trim().toUpperCase(), nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al unirse.');

      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_IMP, JSON.stringify(nueva));
      setSesion(nueva);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleIniciarJuego = async () => {
    if (!sesion) return;
    setOcultarPalabra(false);
    try {
      await fetch(`/api/impostor/online/sala/${sesion.code}/iniciar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token, modo: modoAdmin })
      });
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleIrResolucion = async () => {
    if (!sesion) return;
    try {
      await fetch(`/api/impostor/online/sala/${sesion.code}/ir-resolucion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolver = async () => {
    if (!sesion) return;
    try {
      await fetch(`/api/impostor/online/sala/${sesion.code}/resolver`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: sesion.token,
          ganador,
          rondasSobrevividas
        })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSiguientePartida = async () => {
    if (!sesion) return;
    setOcultarPalabra(false);
    try {
      await fetch(`/api/impostor/online/sala/${sesion.code}/siguiente-partida`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleFinalizarPartida = async () => {
    if (!sesion) return;
    try {
      await fetch(`/api/impostor/online/sala/${sesion.code}/finalizar`, {
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
      await fetch(`/api/impostor/online/sala/${sesion.code}/reiniciar`, {
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
        await fetch(`/api/impostor/online/sala/${sesion.code}/salir`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: sesion.token })
        });
      } catch {
        // ignorar
      }
    }
    sessionStorage.removeItem(CLAVE_SESION_IMP);
    setSesion(null);
    setSala(null);
    setVista('online_menu');
  };

  const copiarCodigo = () => {
    if (!sala?.code) return;
    navigator.clipboard?.writeText(sala.code);
    setCodigoCopiado(true);
    setTimeout(() => setCodigoCopiado(false), 2000);
  };

  const esAdmin = Boolean(sala?.esAdmin);
  const esImpostor = Boolean(sala?.esImpostor);
  const ranking = [...(sala?.jugadores || [])].sort((a, b) => b.puntos - a.puntos);
  const maximoPuntos = ranking.length ? ranking[0].puntos : 0;
  const ganadores = maximoPuntos > 0 ? ranking.filter((j) => j.puntos === maximoPuntos) : [];

  return (
    <div className="aprox-contenedor">

      {modalAyuda && (
        <div className="rg-modal-fondo" onClick={() => setModalAyuda(false)}>
          <div className="rg-modal aprox-modal-ayuda" onClick={(e) => e.stopPropagation()}>
            <div className="aprox-modal-header">
              <span className="aprox-modal-signo-title">?</span>
              <h3>¿Cómo se juega a Miente como puedas?</h3>
            </div>
            <div className="aprox-modal-cuerpo">
              <p><strong>1. Dinámica del juego:</strong></p>
              <ul>
                <li>Participan de 3 a 20 jugadores. Uno será el impostor en secreto.</li>
                <li>Existen distintos modos de juego elegibles por el anfitrión.</li>
                <li>Sigue las instrucciones en pantalla según tu rol (Impostor o Pueblo).</li>
              </ul>
            </div>
            <div className="rg-modal-acciones">
              <button className="big full" onClick={() => setModalAyuda(false)}>Entendido</button>
            </div>
          </div>
        </div>
      )}

      {vista === 'menu' && (
        <MenuInicioJuego
          juegoId="impostor"
          onOnline={() => { setVista('online_menu'); setErrorMsg(''); }}
          onLocal={onLocal}
          onAyuda={() => setModalAyuda(true)}
          error={errorMsg}
        />
      )}

      {vista === 'online_menu' && (
        <MenuModoOnline
          onVolver={() => { setVista('menu'); setErrorMsg(''); }}
          onCrear={() => { setVista('crear'); setErrorMsg(''); }}
          onUnirse={() => { setVista('unirse'); setErrorMsg(''); }}
          onAyuda={() => setModalAyuda(true)}
          error={errorMsg}
        />
      )}

      {vista === 'crear' && (
        <FormCrearSala
          onVolver={() => { setVista('online_menu'); setErrorMsg(''); }}
          onAyuda={() => setModalAyuda(true)}
          nombre={nombre}
          setNombre={setNombre}
          onCrear={handleCrear}
          cargando={cargando}
          error={errorMsg}
        />
      )}

      {vista === 'unirse' && (
        <FormUnirseSala
          onVolver={() => { setVista('online_menu'); setErrorMsg(''); }}
          onAyuda={() => setModalAyuda(true)}
          codigo={codigoInput}
          setCodigo={setCodigoInput}
          nombre={nombre}
          setNombre={setNombre}
          onUnirse={handleUnirse}
          cargando={cargando}
          error={errorMsg}
        />
      )}

      {vista === 'sala' && sala && sala.estado === 'lobby' && (
        <section className="game qq-pantalla">
          <CabeceraSala codigo={sala.code} onVolver={() => setModalSalir(true)} onAyuda={() => setModalAyuda(true)} />

          <div className="panel qq-menu-panel" style={{ marginTop: '1rem' }}>
            <h3 className="qq-sala-titulo"><Icon name="users" size={20} /> Jugadores ({sala.jugadores.length})</h3>
            <div className="lb-lista qq-sala-lista">
              {sala.jugadores.map((j) => (
                <div key={j.id} className={`lb-jug ${j.id === sala.yoId ? 'yo' : ''}`}>
                  <span className="lb-jug-nombre">
                    {j.nombre}{j.id === sala.yoId ? ' (tú)' : ''}{j.id === 1 ? ' 👑' : ''}
                  </span>
                </div>
              ))}
            </div>
            {sala.jugadores.length < 3 && (
              <p className="hint" style={{ marginTop: '0.8rem' }}>
                Faltan al menos {3 - sala.jugadores.length} jugadores para poder empezar.
              </p>
            )}
          </div>

          {esAdmin ? (
            <div style={{ marginTop: '1.2rem' }}>
              <div className="panel" style={{ marginBottom: '1rem', padding: '1rem' }}>
                <label className="field-label" style={{ marginBottom: '0.5rem' }}>
                  Modo de Juego
                </label>
                <select 
                  value={modoAdmin} 
                  onChange={(e) => setModoAdmin(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '2px solid #cbd5e1' }}
                >
                  <option value="clasico">🤫 Clásico (El impostor no sabe nada)</option>
                  <option value="pista">🔍 Con Pista (El impostor recibe una pista)</option>
                  <option value="camuflado">🎭 Camuflado (Recibe una palabra similar)</option>
                  <option value="preguntas">❓ Preguntas (Sabe la categoría. Turnos de Sí/No)</option>
                </select>
              </div>

              <button
                className="big full qq-btn-principal"
                disabled={sala.jugadores.length < 3}
                onClick={handleIniciarJuego}
              >
                <Icon name="play" size={22} />
                {sala.jugadores.length < 3 ? 'Esperando jugadores...' : '¡Repartir Roles y Empezar!'}
              </button>
            </div>
          ) : (
            <div className="panel center qq-menu-panel" style={{ padding: '2rem 1.5rem', marginTop: '1rem' }}>
              <span className="lb-luna chica"><Icon name="hourglass" size={40} /></span>
              <h3 style={{ margin: '0.5rem 0' }}>Esperando al anfitrión...</h3>
              <p className="hint">En cuanto comience la partida, verás tu palabra secreta.</p>
            </div>
          )}

        </section>
      )}

      {vista === 'sala' && sala && sala.estado === 'en_juego' && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="flagFinish" size={18} />Ronda {sala.rondaActual}</span>
            <span className="chip alt">
              {esImpostor ? '🎭 Impostor' : '👤 Inocente'}
            </span>
          </div>

          <div className="starter">
            <Icon name="dice" size={28} />
            <p>Empieza hablando: <strong>{sala.nombreInicial}</strong></p>
          </div>

          <div className="panel aprox-pregunta-card" style={{ padding: '2rem 1.4rem' }}>
            <span className={`aprox-badge-pregunta ${esImpostor ? 'personal' : ''}`}>
              {esImpostor ? '¡Eres el Impostor!' : 'Tu palabra secreta'}
            </span>

            {!ocultarPalabra ? (
              <>
                <h1 style={{
                  fontSize: esImpostor ? '2.1rem' : '2.5rem',
                  fontWeight: '900',
                  color: esImpostor ? '#dc2626' : '#2563eb',
                  margin: '0.8rem 0'
                }}>
                  {esImpostor ? '¡ERES EL IMPOSTOR!' : sala.miPalabra}
                </h1>

                {esImpostor ? (
                  <>
                    {sala.modoJuego === 'clasico' && (
                      <p style={{ color: '#64748b', fontSize: '0.95rem', margin: '0.4rem 0 1.2rem' }}>
                        No tienes ninguna pista. Escucha a los demás e intenta pasar desapercibido.
                      </p>
                    )}
                    {sala.modoJuego === 'pista' && (
                      <div className="imp-restriccion-box" style={{ background: '#fffbeb', borderColor: '#fde68a', margin: '0.5rem 0 1rem' }}>
                         <span className="imp-restriccion-tag" style={{ color: '#d97706' }}>TU PISTA EXCLUSIVA</span>
                         <p className="imp-restriccion-texto" style={{ color: '#92400e' }}>{sala.infoImpostor}</p>
                      </div>
                    )}
                    {sala.modoJuego === 'camuflado' && (
                      <div className="imp-restriccion-box" style={{ background: '#f3e8ff', borderColor: '#d8b4fe', margin: '0.5rem 0 1rem' }}>
                         <span className="imp-restriccion-tag" style={{ color: '#9333ea' }}>TU PALABRA FALSA</span>
                         <p className="imp-restriccion-texto" style={{ color: '#6b21a8' }}>{sala.infoImpostor}</p>
                         <p style={{ fontSize: '0.8rem', color: '#6b21a8', marginTop: '0.5rem' }}>Actúa como si esta fuera la palabra real.</p>
                      </div>
                    )}
                    {sala.modoJuego === 'preguntas' && (
                      <div className="imp-restriccion-box" style={{ background: '#e0f2fe', borderColor: '#bae6fd', margin: '0.5rem 0 1rem' }}>
                         <span className="imp-restriccion-tag" style={{ color: '#0284c7' }}>CATEGORÍA DE LA PALABRA</span>
                         <p className="imp-restriccion-texto" style={{ color: '#075985' }}>{sala.infoImpostor}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {sala.modoJuego === 'preguntas' ? (
                      <p style={{ color: '#64748b', fontSize: '0.95rem', margin: '0.4rem 0 1.2rem' }}>
                        Por turnos, elegid a otro jugador y hacedle una pregunta de "Sí" o "No" sobre esta palabra para cazar al impostor.
                      </p>
                    ) : (
                      <p style={{ color: '#64748b', fontSize: '0.95rem', margin: '0.4rem 0 1.2rem' }}>
                        Da una pista sutil sobre la palabra. Que no sea ni muy obvia (el impostor la adivinará) ni muy rara (creerán que eres tú).
                      </p>
                    )}
                  </>
                )}

                <button
                  type="button"
                  className="secondary"
                  style={{ fontSize: '0.85rem' }}
                  onClick={() => setOcultarPalabra(true)}
                >
                  <Icon name="eye" size={16} /> Ocultar pantalla (privacidad)
                </button>
              </>
            ) : (
              <div style={{ padding: '1.2rem 0' }}>
                <p className="hint">Tu palabra está oculta para que nadie cerca pueda verla.</p>
                <button
                  type="button"
                  className="big"
                  style={{ marginTop: '0.8rem' }}
                  onClick={() => setOcultarPalabra(false)}
                >
                  <Icon name="eye" size={20} /> Mostrar mi palabra
                </button>
              </div>
            )}
          </div>

          {esAdmin ? (
            <div className="actions" style={{ marginTop: '1.2rem' }}>
              <button className="big full" onClick={handleIrResolucion}>
                <Icon name="flagFinish" size={22} /> Finalizar debate / Resolver (Anfitrión)
              </button>
            </div>
          ) : (
            <p className="hint center" style={{ marginTop: '1rem' }}>
              El anfitrión finalizará el debate cuando decidáis acusar o termine la ronda.
            </p>
          )}

          <div className="actions" style={{ marginTop: '1rem' }}>
            <button className="secondary danger full" onClick={() => setModalSalir(true)}>
              <Icon name="door" size={20} /> Salir de la sala
            </button>
          </div>
        </section>
      )}

      {vista === 'sala' && sala && sala.estado === 'resolucion' && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="flagFinish" size={18} />Ronda {sala.rondaActual}</span>
            <span className="chip alt">Resolución de la partida</span>
          </div>

          {esAdmin ? (
            <div className="panel" style={{ textAlign: 'center' }}>
              <span className="aprox-badge-pregunta">Panel de resolución</span>
              <h2 style={{ margin: '0.5rem 0' }}>¿Quién ha ganado la partida?</h2>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  className={`imp-btn-ganador ${ganador === 'impostor' ? 'activa' : ''}`}
                  onClick={() => setGanador('impostor')}
                >
                  🎭 El Impostor (+10 pts)
                </button>
                <button
                  type="button"
                  className={`imp-btn-ganador ${ganador === 'pueblo' ? 'activa' : ''}`}
                  onClick={() => setGanador('pueblo')}
                >
                  👥 El Pueblo (+3 pts c/u)
                </button>
              </div>

              <div style={{ marginTop: '1.8rem' }}>
                <h3 className="panel-title" style={{ justifyContent: 'center' }}>
                  ¿Cuántas rondas sobrevivió el impostor?
                </h3>
                <p className="field-label">(+3 puntos por ronda para el impostor)</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', margin: '0.8rem 0' }}>
                  <button
                    type="button"
                    className="aprox-btn-ayuda"
                    style={{ position: 'static', width: '48px', height: '48px', fontSize: '1.5rem' }}
                    onClick={() => setRondasSobrevividas(Math.max(0, rondasSobrevividas - 1))}
                  >
                    -
                  </button>
                  <span style={{ fontSize: '3rem', fontWeight: '900', color: '#4338ca', minWidth: '60px' }}>
                    {rondasSobrevividas}
                  </span>
                  <button
                    type="button"
                    className="aprox-btn-ayuda"
                    style={{ position: 'static', width: '48px', height: '48px', fontSize: '1.5rem' }}
                    onClick={() => setRondasSobrevividas(rondasSobrevividas + 1)}
                  >
                    +
                  </button>
                </div>
              </div>

              <button className="big full" style={{ marginTop: '1.5rem' }} onClick={handleResolver}>
                <Icon name="check" size={22} /> Calcular Puntuaciones para todos
              </button>
            </div>
          ) : (
            <div className="panel center" style={{ padding: '2.5rem 1.5rem' }}>
              <span className="lb-luna chica"><Icon name="hourglass" size={40} /></span>
              <h3>El anfitrión está resolviendo la partida...</h3>
              <p className="hint">En breves momentos se revelará quién era el impostor y el reparto de puntos.</p>
            </div>
          )}

          <div className="actions" style={{ marginTop: '1rem' }}>
            <button className="secondary danger full" onClick={() => setModalSalir(true)}>
              <Icon name="door" size={20} /> Salir de la sala
            </button>
          </div>
        </section>
      )}

      {vista === 'sala' && sala && sala.estado === 'resultados' && (
        <section className="game">
          <div className="end-card aprox-resolucion-card">
            <span className="end-icon"><Icon name="trophy" size={44} /></span>
            <p className="categoria">Palabra: {sala.miPalabra || "(Oculta)"} | Impostor: {sala.nombreImpostor}</p>
            <h1 className="title">
              {sala.ganador === 'impostor' ? '¡Victoria del Impostor!' : '¡Victoria del Pueblo!'}
            </h1>

            <div className="scoreboard" style={{ width: '100%', marginTop: '1.5rem' }}>
              <h3 className="section-title" style={{ margin: '0 0 0.8rem', textAlign: 'center' }}>Puntos de esta ronda</h3>
              {sala.jugadores.map((j) => {
                const delta = sala.puntosRonda?.[j.id] || 0;
                const esImp = j.nombre === sala.nombreImpostor;
                return (
                  <div key={j.id} className="score-row">
                    <span className="score-name">
                      {esImp ? '🎭 ' : '👤 '}
                      {j.nombre} {esImp && <em style={{ fontSize: '0.8rem', color: '#64748b' }}>(Impostor)</em>}
                    </span>
                    <span className="score-pts" style={{ color: delta > 0 ? '#10b981' : '#64748b' }}>
                      +{delta} pts
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="scoreboard" style={{ width: '100%', marginTop: '1.5rem' }}>
              <h3 className="section-title" style={{ margin: '0 0 0.8rem', textAlign: 'center' }}>Marcador general</h3>
              {ranking.map((j, i) => {
                const pts = j.puntos ?? 0;
                const primero = maximoPuntos > 0 && pts === maximoPuntos;
                return (
                  <div key={j.id} className={`score-row${primero ? ' first' : ''}`}>
                    <span className="score-name">
                      {primero ? <Icon name="crown" size={22} /> : <span className="pos">{i + 1}</span>}
                      {j.nombre} {j.id === sala.yoId ? '(Tú)' : ''}
                    </span>
                    <span className="score-pts">{pts} pts</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="actions" style={{ marginTop: '1.2rem' }}>
            {esAdmin ? (
              <>
                <button className="big full" onClick={handleSiguientePartida}>
                  <Icon name="play" size={20} /> Siguiente partida
                </button>
                <button className="secondary danger full" onClick={handleFinalizarPartida}>
                  <Icon name="flagFinish" size={20} /> Finalizar juego 🏆
                </button>
              </>
            ) : (
              <p className="hint center">Esperando a que el anfitrión comience la siguiente ronda...</p>
            )}

            <button className="secondary danger full" onClick={() => setModalSalir(true)}>
              <Icon name="door" size={20} /> Salir de la sala
            </button>
          </div>
        </section>
      )}

      {vista === 'sala' && sala && sala.estado === 'final' && (
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
                const pts = j.puntos ?? 0;
                const primero = maximoPuntos > 0 && pts === maximoPuntos;
                return (
                  <div key={j.id} className={`score-row${primero ? ' first' : ''}`}>
                    <span className="score-name">
                      {primero ? <Icon name="crown" size={22} /> : <span className="pos">{i + 1}</span>}
                      {j.nombre} {j.id === sala.yoId ? '(Tú)' : ''}
                    </span>
                    <span className="score-pts">{pts} pts</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="actions" style={{ marginTop: '1.5rem' }}>
            {esAdmin && (
              <button className="big full" onClick={handleReiniciarPartida}>
                <Icon name="refresh" size={20} /> Otra Partida (mismos jugadores)
              </button>
            )}
            <button className="secondary danger full" onClick={() => setModalSalir(true)}>
              <Icon name="door" size={20} /> Salir al menú principal
            </button>
          </div>
        </section>
      )}

      {modalSalir && (
        <div className="rg-modal-fondo" onClick={() => setModalSalir(false)}>
          <div className="rg-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px', textAlign: 'center', padding: '1.8rem 1.4rem' }}>
            <div style={{ fontSize: '2.4rem', marginBottom: '0.4rem' }}>🚪</div>
            <h3 style={{ margin: '0 0 0.6rem', color: '#1e1b4b', fontSize: '1.3rem' }}>
              ¿Abandonar la partida?
            </h3>
            <p className="hint" style={{ fontSize: '0.95rem', marginBottom: '1.4rem', lineHeight: '1.4' }}>
              Si sales de la sala perderás tu progreso actual en la partida. ¿Estás seguro de que deseas salir?
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <button type="button" className="secondary full" onClick={() => setModalSalir(false)}>No, quedarme</button>
              <button type="button" className="secondary danger full" style={{ background: '#ef4444', color: '#ffffff', borderColor: '#dc2626' }} onClick={() => { setModalSalir(false); handleSalir(); }}>Sí, salir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}