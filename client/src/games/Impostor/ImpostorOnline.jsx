// client/src/games/Impostor/ImpostorOnline.jsx
import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../components/Icon.jsx';
import './Impostor.css';

const CLAVE_SESION_IMP = 'impostor_online_session';

export default function ImpostorOnline({ onLocal, onSalir }) {
  const [vista, setVista] = useState('menu'); // 'menu' | 'crear' | 'unirse' | 'sala'
  const [nombre, setNombre] = useState('');
  const [codigoInput, setCodigoInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);
  const [modalSalir, setModalSalir] = useState(false);
  const [modalAyuda, setModalAyuda] = useState(false);

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

  // Estados de resolución (Anfitrión)
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
        body: JSON.stringify({ token: sesion.token })
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
        /* ignorar */
      }
    }
    sessionStorage.removeItem(CLAVE_SESION_IMP);
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
  const esImpostor = Boolean(sala?.esImpostor);
  const ranking = [...(sala?.jugadores || [])].sort((a, b) => b.puntos - a.puntos);
  const maximoPuntos = ranking.length ? ranking[0].puntos : 0;
  const ganadores = maximoPuntos > 0 ? ranking.filter((j) => j.puntos === maximoPuntos) : [];

  // Mostrar ayuda en menús y en la sala de espera (lobby), desaparece al empezar a jugar
  const mostrarAyuda = vista === 'menu' || vista === 'crear' || vista === 'unirse' || (vista === 'sala' && sala?.estado === 'lobby');

  return (
    <div className="aprox-contenedor">
      {/* ---------------- BOTÓN Y MODAL DE AYUDA ---------------- */}
      {mostrarAyuda && (
        <button
          type="button"
          className="btn-ayuda-flotante"
          onClick={() => setModalAyuda(true)}
          title="Reglas de Miente como puedas"
        >
          <span className="btn-ayuda-flotante-signo">?</span>
        </button>
      )}

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
                <li>Participan de 3 a 20 jugadores. Uno de ellos será el impostor en secreto.</li>
                <li>Todos ven en su pantalla la palabra secreta excepto el impostor.</li>
                <li>Hay una <strong>restricción obligatoria común</strong> para todos.</li>
                <li>Por turnos en voz alta, cada uno dice una pista sin saltarse la restricción.</li>
              </ul>
              <p><strong>2. Puntuación:</strong></p>
              <div className="aprox-tabla-puntos">
                <div className="aprox-puntos-fila acierto" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
                  <span>🎭 Victoria del Impostor</span>
                  <strong>+10 puntos</strong>
                </div>
                <div className="aprox-puntos-fila cercana">
                  <span>⏳ Rondas sobrevividas</span>
                  <strong>+3 puntos por ronda superada</strong>
                </div>
                <div className="aprox-puntos-fila acierto">
                  <span>👥 Victoria del Pueblo</span>
                  <strong>+3 puntos para cada inocente</strong>
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
      {/* ---------------- FIN AYUDA ---------------- */}

      {/* 1. MENÚ PRINCIPAL */}
      {vista === 'menu' && (
        <section className="game">
          <div className="panel center">
            <span className="lb-luna chica">
              <Icon name="whois" size={42} strokeWidth={1.6} />
            </span>
            <h1 className="title">Miente como puedas</h1>
            <p className="hint">
              Uno de vosotros es el impostor. Hablad por turnos respetando la restricción sin ser descubiertos. El anfitrión crea la sala y comparte el código.
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
              <label className="field-label" htmlFor="imp-host-nombre">Tu nombre</label>
              <input
                id="imp-host-nombre"
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
              <label className="field-label" htmlFor="imp-code-input">Código de la sala</label>
              <input
                id="imp-code-input"
                className="lb-input-codigo"
                type="text"
                placeholder="ABCD"
                value={codigoInput}
                onChange={(e) => setCodigoInput(e.target.value.toUpperCase())}
                maxLength={4}
                style={{ textTransform: 'uppercase', letterSpacing: '4px', textAlign: 'center', fontWeight: '800' }}
                autoFocus
              />

              <label className="field-label" htmlFor="imp-guest-nombre" style={{ marginTop: '1rem' }}>Tu nombre</label>
              <input
                id="imp-guest-nombre"
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
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.8rem' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.35rem 1.1rem',
                  borderRadius: '9999px',
                  border: '1.5px solid #22c55e',
                  backgroundColor: '#f0fdf4',
                  color: '#16a34a',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  lineHeight: 1
                }}
              >
                <Icon name="lock" size={15} />
                Sala de espera
              </span>
            </div>
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

          <div className="panel" style={{ marginTop: '1rem' }}>
            <h3 className="panel-title"><Icon name="users" size={20} /> Jugadores ({sala.jugadores.length})</h3>
            <div className="lb-lista">
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
                Faltan al menos {3 - sala.jugadores.length} jugadores para poder empezar (mínimo 3).
              </p>
            )}
          </div>

          {esAdmin ? (
            <div style={{ marginTop: '1.2rem' }}>
              <button
                className="big full"
                disabled={sala.jugadores.length < 3}
                onClick={handleIniciarJuego}
              >
                <Icon name="play" size={22} />
                {sala.jugadores.length < 3 ? 'Esperando jugadores...' : '¡Repartir Roles y Empezar!'}
              </button>
            </div>
          ) : (
            <div className="panel center" style={{ padding: '2rem 1.5rem', marginTop: '1rem' }}>
              <span className="lb-luna chica"><Icon name="hourglass" size={40} /></span>
              <h3 style={{ margin: '0.5rem 0' }}>Esperando al anfitrión...</h3>
              <p className="hint">En cuanto comience la partida, verás tu palabra secreta en tu pantalla.</p>
            </div>
          )}

          <div className="actions" style={{ marginTop: '1rem' }}>
            <button className="secondary danger full" onClick={() => setModalSalir(true)}>
              <Icon name="door" size={20} /> Salir de la sala
            </button>
          </div>
        </section>
      )}

      {/* 5. SALA: EN JUEGO */}
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
                  <p style={{ color: '#64748b', fontSize: '0.95rem', margin: '0.4rem 0 1.2rem' }}>
                    No conoces la palabra. Escucha con atención las pistas de los demás e improvisa usando la restricción obligatoria.
                  </p>
                ) : (
                  <p style={{ color: '#64748b', fontSize: '0.95rem', margin: '0.4rem 0 1.2rem' }}>
                    Describe la palabra con pistas sin decirla directamente y respetando la restricción obligatoria.
                  </p>
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

            <div className="imp-restriccion-box" style={{ marginTop: '1.4rem' }}>
              <span className="imp-restriccion-tag">⚠️ RESTRICCIÓN PARA TODOS</span>
              <p className="imp-restriccion-texto">{sala.restriccion}</p>
            </div>
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

      {/* 6. SALA: RESOLUCIÓN */}
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

      {/* 7. SALA: RESULTADOS DE LA RONDA */}
      {vista === 'sala' && sala && sala.estado === 'resultados' && (
        <section className="game">
          <div className="end-card aprox-resolucion-card">
            <span className="end-icon"><Icon name="trophy" size={44} /></span>
            <p className="categoria">Palabra: {sala.miPalabra} | Impostor: {sala.nombreImpostor}</p>
            <h1 className="title">
              {sala.ganador === 'impostor' ? '¡Victoria del Impostor!' : '¡Victoria del Pueblo!'}
            </h1>

            <div className="scoreboard" style={{ width: '100%', marginTop: '1.5rem' }}>
              <h3 className="section-title" style={{ margin: '0 0 0.8rem', textAlign: 'center' }}>
                Puntos de esta ronda
              </h3>
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
              <h3 className="section-title" style={{ margin: '0 0 0.8rem', textAlign: 'center' }}>
                Marcador general
              </h3>
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

      {/* 8. SALA: PODIO FINAL */}
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

      {/* MODAL DE CONFIRMACIÓN PARA SALIR */}
      {modalSalir && (
        <div className="rg-modal-fondo" onClick={() => setModalSalir(false)}>
          <div 
            className="rg-modal" 
            onClick={(e) => e.stopPropagation()} 
            style={{ maxWidth: '420px', textAlign: 'center', padding: '1.8rem 1.4rem' }}
          >
            <div style={{ fontSize: '2.4rem', marginBottom: '0.4rem' }}>🚪</div>
            <h3 style={{ margin: '0 0 0.6rem', color: '#1e1b4b', fontSize: '1.3rem' }}>
              ¿Abandonar la partida?
            </h3>
            <p className="hint" style={{ fontSize: '0.95rem', marginBottom: '1.4rem', lineHeight: '1.4' }}>
              Si sales de la sala perderás tu progreso actual en la partida. ¿Estás seguro de que deseas salir?
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <button 
                type="button" 
                className="secondary full" 
                onClick={() => setModalSalir(false)}
              >
                No, quedarme
              </button>
              <button 
                type="button" 
                className="secondary danger full" 
                style={{ background: '#ef4444', color: '#ffffff', borderColor: '#dc2626' }}
                onClick={() => {
                  setModalSalir(false);
                  handleSalir();
                }}
              >
                Sí, salir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}