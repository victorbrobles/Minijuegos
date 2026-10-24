// client/src/games/Rankings/RankingsOnline.jsx
import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../components/Icon.jsx';
import CategoryCard from '../../components/CategoryCard.jsx';
import './Rankings.css';
import '../Adivina/Adivina.css';

const CLAVE_SESION_RK = 'rankings_online_session';
const TIEMPO_TURNO = 90;

export default function RankingsOnline({ onLocal, onSalir }) {
  const [vista, setVista] = useState('menu'); // 'menu' | 'crear' | 'unirse' | 'sala'
  const [nombre, setNombre] = useState('');
  const [codigoInput, setCodigoInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);
  const [modalSalir, setModalSalir] = useState(false);
  const [modalAyuda, setModalAyuda] = useState(false);

  const [categoriasDatos, setCategoriasDatos] = useState(null);
  const [sesion, setSesion] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(CLAVE_SESION_RK));
    } catch {
      return null;
    }
  });

  const [sala, setSala] = useState(null);
  const [codigoCopiado, setCodigoCopiado] = useState(false);

  const [inputRespuesta, setInputRespuesta] = useState('');
  const [modalPista, setModalPista] = useState(null);
  const [segundosRestantes, setSegundosRestantes] = useState(TIEMPO_TURNO);
  
  // Estado local para remarcar los huecos en rojo cuando el servidor notifica un fallo
  const [elementosRojos, setElementosRojos] = useState(false);

  const intervalRef = useRef(null);
  const timerTurnoRef = useRef(null);

  // Carga de categorías
  useEffect(() => {
    fetch('/api/rankings/categorias')
      .then((r) => r.json())
      .then((d) => setCategoriasDatos(d))
      .catch((e) => console.error(e));
  }, []);

  // Polling de sincronización
  useEffect(() => {
    if (!sesion) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setSala(null);
      return;
    }

    const consultarEstado = () => {
      fetch(`/api/rankings/online/sala/${sesion.code}?token=${sesion.token}`)
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
          sessionStorage.removeItem(CLAVE_SESION_RK);
          setSesion(null);
          setSala(null);
          setVista('menu');
          setErrorMsg('La sala se ha cerrado.');
        });
    };

    consultarEstado();
    intervalRef.current = setInterval(consultarEstado, 650);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sesion]);

  const ronda = sala?.ronda;
  const yoId = sala?.yoId;
  const esMiTurno = ronda?.jugadorTurnoId === yoId;
  const esAdmin = sala?.esAdmin;

  // Temporizador visual reactivo al cambio de turno
  useEffect(() => {
    if (!ronda || ronda.faseRonda !== 'jugando') {
      if (timerTurnoRef.current) clearInterval(timerTurnoRef.current);
      return;
    }

    setSegundosRestantes(TIEMPO_TURNO);

    if (timerTurnoRef.current) clearInterval(timerTurnoRef.current);
    timerTurnoRef.current = setInterval(() => {
      setSegundosRestantes((prev) => {
        if (prev <= 1) {
          clearInterval(timerTurnoRef.current);
          if (esMiTurno) {
            fetch(`/api/rankings/online/sala/${sesion.code}/tiempo-agotado`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token: sesion.token })
            }).catch(() => {});
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerTurnoRef.current) clearInterval(timerTurnoRef.current);
    };
  }, [ronda?.jugadorTurnoId, ronda?.faseRonda, esMiTurno]);

  // Efecto para destello rojo si ocurre un fallo o rebote
  useEffect(() => {
    if (ronda?.motivo === 'fallo' || ronda?.motivo === 'rebote') {
      setElementosRojos(true);
      const timer = setTimeout(() => setElementosRojos(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [ronda?.motivo, ronda?.jugadorTurnoId]);

  const handleCrear = async () => {
    if (!nombre.trim()) return;
    setCargando(true);
    try {
      const res = await fetch('/api/rankings/online/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_RK, JSON.stringify(nueva));
      setSesion(nueva);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleUnirse = async () => {
    if (!nombre.trim() || !codigoInput.trim()) return;
    setCargando(true);
    try {
      const res = await fetch('/api/rankings/online/unirse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codigoInput.trim().toUpperCase(), nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_RK, JSON.stringify(nueva));
      setSesion(nueva);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleIniciarPartida = async () => {
    try {
      const res = await fetch(`/api/rankings/online/sala/${sesion.code}/iniciar-partida`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token })
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleElegirCategoria = async (catNombre) => {
    try {
      const res = await fetch(`/api/rankings/online/sala/${sesion.code}/elegir-categoria`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token, categoria: catNombre })
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handlePedirPista = async (puesto) => {
    try {
      const res = await fetch(`/api/rankings/online/sala/${sesion.code}/pista`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token, posicion: puesto.posicion })
      });
      const d = await res.json();
      if (d.success) {
        setModalPista({ posicion: puesto.posicion, pista: puesto.pista });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEnviarRespuesta = async (e) => {
    e.preventDefault();
    if (!inputRespuesta.trim()) return;

    try {
      const res = await fetch(`/api/rankings/online/sala/${sesion.code}/validar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token, respuesta: inputRespuesta })
      });
      const d = await res.json();
      if (d.success) {
        setInputRespuesta('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePasarTurno = async () => {
    try {
      await fetch(`/api/rankings/online/sala/${sesion.code}/pasar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token })
      });
      setInputRespuesta('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleAvanzarResumen = async () => {
    try {
      await fetch(`/api/rankings/online/sala/${sesion.code}/avanzar-resumen`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSiguienteRonda = async () => {
    try {
      await fetch(`/api/rankings/online/sala/${sesion.code}/siguiente-ronda`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleFinalizar = async () => {
    try {
      await fetch(`/api/rankings/online/sala/${sesion.code}/finalizar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSalir = () => {
    sessionStorage.removeItem(CLAVE_SESION_RK);
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

  const ranking = sala?.jugadores ? [...sala.jugadores].sort((a, b) => b.puntos - a.puntos) : [];
  const maximoPuntos = ranking.length ? ranking[0].puntos : 0;
  const ganadores = maximoPuntos > 0 ? ranking.filter((j) => j.puntos === maximoPuntos) : [];

  const mostrarAyuda = vista === 'menu' || vista === 'crear' || vista === 'unirse' || (vista === 'sala' && sala?.estado === 'lobby');

  return (
    <div className="rk-contenedor">
      <style>{`
        .rk-flash-red {
          background-color: #fee2e2 !important;
          border-color: #ef4444 !important;
          color: #b91c1c !important;
          transition: background-color 0.2s, border-color 0.2s;
        }
        .rk-flash-red .rk-slot-oculto-texto {
          color: #b91c1c !important;
        }
      `}</style>

      {/* ---------------- BOTÓN Y MODAL DE AYUDA ---------------- */}
      {mostrarAyuda && (
        <button
          type="button"
          className="rk-btn-ayuda"
          onClick={() => setModalAyuda(true)}
          title="Reglas y sistema de puntuación"
        >
          <span className="rk-btn-ayuda-signo">?</span>
        </button>
      )}

      {modalAyuda && (
        <div className="rg-modal-fondo" onClick={() => setModalAyuda(false)}>
          <div className="rg-modal rk-modal-ayuda" onClick={(e) => e.stopPropagation()}>
            <div className="rk-modal-header">
              <span className="rk-modal-signo-title">?</span>
              <h3>¿Cómo se juega a Completar Rankings?</h3>
            </div>

            <div className="rk-modal-cuerpo">
              <p><strong>1. Dinámica del juego:</strong></p>
              <ul>
                <li>Elige categoría y aparecerá un ranking real con varios puestos ocultos.</li>
                <li>La primera ronda empieza con un jugador al azar. En las siguientes, el turno inicial pasa de forma <strong>secuencial</strong> al siguiente jugador de la lista.</li>
                <li><strong>No hace falta indicar el puesto:</strong> escribe cualquier elemento que creas que falta; si es correcto, se colocará en su posición automáticamente.</li>
                <li>Si fallas o se agota el tiempo, el turno pasa por <strong>rebote</strong> al siguiente jugador en orden.</li>
                <li>La siguiente ronda <strong>SIEMPRE</strong> la abre el jugador que va después de quien abrió la actual, independientemente de quién acierte por rebote.</li>
              </ul>

              <p><strong>2. Pistas y bloqueo en rebote:</strong></p>
              <ul>
                <li>Puedes solicitar una pista para un puesto concreto antes de responder.</li>
                <li><strong>Regla de rebote:</strong> Si un jugador falla o pasa su turno sin haber pedido la pista de un puesto, dicha pista queda <strong>bloqueada</strong> para los jugadores que reciban el rebote.</li>
              </ul>

              <p><strong>3. Sistema de puntuación:</strong></p>
              <div className="rk-tabla-puntos">
                <div className="rk-puntos-fila acierto-sin-pista">
                  <span>🎯 Acierto sin pista</span>
                  <strong>+3 puntos</strong>
                </div>
                <div className="rk-puntos-fila acierto-con-pista">
                  <span>💡 Acierto con pista</span>
                  <strong>+1 punto</strong>
                </div>
                <div className="rk-puntos-fila fallo">
                  <span>❌ Fallo o tiempo agotado</span>
                  <strong>0 puntos (Rebote)</strong>
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

      {/* 1. MENÚ ONLINE */}
      {vista === 'menu' && (
        <section className="game">
          <div className="panel center">
            <span className="lb-luna chica">
              <Icon name="trophy" size={42} strokeWidth={1.6} />
            </span>
            <h1 className="title">Completar Rankings Online</h1>
            <p className="hint">
              Adivina los puestos ocultos de listas y récords mundiales. Cuando no sea tu turno, observa las respuestas de tus rivales y prepárate para el rebote.
            </p>

            {errorMsg && <p className="error" style={{ margin: '0.8rem 0' }}>{errorMsg}</p>}

            <div className="lb-menu">
              <button className="big full" onClick={() => { setVista('crear'); setErrorMsg(''); }}>
                <Icon name="crown" size={22} /> Crear partida Online
              </button>
              <button className="big full" onClick={() => { setVista('unirse'); setErrorMsg(''); }}>
                <Icon name="users" size={22} /> Unirse con código
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
            <h2 className="title">Crear sala Online</h2>
            <p className="hint">Introduce tu nombre de anfitrión (de 2 a 15 jugadores).</p>

            <div className="lb-form" style={{ marginTop: '1.2rem', textAlign: 'left' }}>
              <input
                type="text"
                placeholder="Tu nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                maxLength={20}
                autoFocus
              />
              <button
                className="big full"
                style={{ marginTop: '1rem' }}
                disabled={cargando || !nombre.trim()}
                onClick={handleCrear}
              >
                Crear sala
              </button>
              <button className="secondary full" style={{ marginTop: '0.6rem' }} onClick={() => setVista('menu')}>
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
            <h2 className="title">Unirse a partida</h2>
            <div className="lb-form" style={{ marginTop: '1.2rem', textAlign: 'left' }}>
              <input
                type="text"
                placeholder="CÓDIGO (4 LETRAS)"
                value={codigoInput}
                onChange={(e) => setCodigoInput(e.target.value.toUpperCase())}
                maxLength={4}
                style={{ textTransform: 'uppercase', letterSpacing: '4px', textAlign: 'center', fontWeight: '800' }}
                autoFocus
              />
              <input
                type="text"
                placeholder="Tu nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                maxLength={20}
                style={{ marginTop: '0.8rem' }}
              />
              <button
                className="big full"
                style={{ marginTop: '1rem' }}
                disabled={cargando || !nombre.trim() || codigoInput.trim().length < 4}
                onClick={handleUnirse}
              >
                Entrar a la sala
              </button>
              <button className="secondary full" style={{ marginTop: '0.6rem' }} onClick={() => setVista('menu')}>
                Volver
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 4. LOBBY */}
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

          <div className="panel" style={{ marginTop: '1rem' }}>
            <h3 className="panel-title"><Icon name="users" size={20} /> Jugadores ({sala.jugadores.length}/15)</h3>
            <div className="lb-lista">
              {sala.jugadores.map((j) => (
                <div key={j.id} className={`lb-jug ${j.id === yoId ? 'yo' : ''}`}>
                  <span className="lb-jug-nombre">{j.nombre}{j.id === yoId ? ' (Tú)' : ''}{j.id === 1 ? ' 👑' : ''}</span>
                </div>
              ))}
            </div>
          </div>

          {errorMsg && <p className="error" style={{ margin: '0.8rem 0' }}>{errorMsg}</p>}

          {esAdmin ? (
            <button
              className="big full"
              style={{ marginTop: '1.2rem' }}
              disabled={sala.jugadores.length < 2}
              onClick={handleIniciarPartida}
            >
              {sala.jugadores.length < 2 ? 'Esperando rivales (mínimo 2)...' : '¡Elegir Categoría!'}
            </button>
          ) : (
            <div className="panel center" style={{ marginTop: '1rem' }}>
              <p className="hint">Esperando a que el anfitrión comience la partida...</p>
            </div>
          )}

          <button className="secondary danger full" style={{ marginTop: '1rem' }} onClick={() => setModalSalir(true)}>
            Salir de la sala
          </button>
        </section>
      )}

      {/* 5. SELECTOR DE CATEGORÍA */}
      {vista === 'sala' && sala && sala.estado === 'categoria' && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="flagFinish" size={18} />Ronda {sala.rondaNum} de {sala.maxRondas}</span>
            <span className="chip alt">Selector de categoría</span>
          </div>

          {esAdmin ? (
            <>
              <h3 className="section-title" style={{ textAlign: 'center', marginBottom: '1rem' }}>
                Elige la temática del ranking para la Ronda {sala.rondaNum}:
              </h3>
              <div className="cat-grid">
                <CategoryCard todas nombre="Todas las categorías" onClick={() => handleElegirCategoria(null)} />
                {categoriasDatos?.categorias?.map((c, i) => (
                  <CategoryCard
                    key={c.nombre}
                    nombre={c.nombre}
                    indice={i}
                    onClick={() => handleElegirCategoria(c.nombre)}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="panel center" style={{ padding: '2.5rem 1.5rem' }}>
              <span className="end-icon"><Icon name="trophy" size={44} /></span>
              <h2 className="title" style={{ marginTop: '0.8rem' }}>Eligiendo ranking...</h2>
              <p className="hint">El anfitrión está seleccionando la categoría para la Ronda {sala.rondaNum}.</p>
            </div>
          )}

          <button className="secondary danger full" style={{ marginTop: '1.5rem' }} onClick={() => setModalSalir(true)}>
            Salir de la sala
          </button>
        </section>
      )}

      {/* 6. JUGANDO ONLINE */}
      {vista === 'sala' && sala && sala.estado === 'jugando' && ronda && ronda.faseRonda === 'jugando' && (
        <section className="game">
          {ronda.motivo && (
            <p className="rf-aviso" role="status" style={{ background: '#fee2e2', color: '#b91c1c', border: '1.5px solid #fca5a5' }}>
              <Icon name={ronda.motivo === 'tiempo' ? 'hourglass' : 'refresh'} size={22} />
              {ronda.motivo === 'tiempo' ? '¡Se acabó el tiempo!' : '¡Respuesta incorrecta (Rebote)!'} Le toca a <strong>{ronda.jugadorTurnoNombre}</strong>
            </p>
          )}

          <div className="hud">
            <span className="chip">
              <Icon name="users" size={18} />
              {esMiTurno ? <strong>¡Es tu turno!</strong> : <>Turno: <strong>{ronda.jugadorTurnoNombre}</strong></>}
            </span>
            <span className="chip alt">{ronda.esRebote ? 'Rebote' : `Ronda ${sala.rondaNum} de ${sala.maxRondas}`}</span>
          </div>

          {/* Marcador superior */}
          <div className="scoreboard-container" style={{ justifyContent: 'center', marginBottom: '0.8rem' }}>
            {sala.jugadores.map((j) => (
              <div
                key={j.id}
                className="score-pill"
                style={{ borderColor: j.id === ronda.jugadorTurnoId ? '#4f46e5' : undefined }}
              >
                <span>{j.nombre}: <strong>{j.puntos} pts</strong></span>
                {j.id === ronda.jugadorTurnoId && <span style={{ marginLeft: '4px' }}>👉</span>}
              </div>
            ))}
          </div>

          <div className="panel rk-tablero">
            <p className="categoria"><Icon name="trophy" size={16} />{ronda.categoria}</p>
            <h2 className="rk-ranking-titulo">{ronda.titulo}</h2>
            <p className="rk-ranking-desc">{ronda.descripcion}</p>

            <div className="timer" role="timer" aria-label="Tiempo restante">
              <div
                className={`timer-bar${segundosRestantes <= 15 ? ' low' : ''}`}
                style={{ width: `${(segundosRestantes / TIEMPO_TURNO) * 100}%` }}
              />
            </div>
            <p className="timer-text">
              <Icon name="clock" size={16} /> {segundosRestantes} s
            </p>

            {ronda.mensajeFeedback && (
              <div className={`rk-feedback rk-feedback-${ronda.mensajeFeedback.tipo}`}>
                {ronda.mensajeFeedback.texto}
              </div>
            )}

            <div className="rk-lista-ranking">
              {ronda.puestos.map((p) => (
                <div
                  key={p.posicion}
                  className={`rk-fila-puesto ${p.oculto ? 'rk-oculto' : 'rk-resuelto'} ${p.oculto && elementosRojos ? 'rk-flash-red' : ''}`}
                >
                  <span className="rk-pos">#{p.posicion}</span>

                  {!p.oculto ? (
                    <>
                      <span className="rk-val">{p.valor}</span>
                      <span className="rk-check"><Icon name="check" size={20} strokeWidth={2.5} /></span>
                    </>
                  ) : (
                    <div className="rk-slot-acciones">
                      <span className="rk-slot-oculto-texto">[ ? ] Puesto por descubrir</span>

                      <button
                        type="button"
                        disabled={!esMiTurno || elementosRojos || ronda.pistasBloqueadas?.[p.posicion]}
                        className={`rk-btn-pista ${ronda.pistasUsadas?.[p.posicion] ? 'usada' : ''}`}
                        onClick={() => esMiTurno && handlePedirPista(p)}
                        title={
                          ronda.pistasBloqueadas?.[p.posicion]
                            ? 'Pista bloqueada: el rival anterior falló sin pedirla'
                            : 'Pedir pista (acertar sumará 1 punto en vez de 3)'
                        }
                      >
                        <Icon name="eye" size={16} />
                        {ronda.pistasUsadas?.[p.posicion]
                          ? 'Ver pista'
                          : ronda.pistasBloqueadas?.[p.posicion]
                          ? 'Bloqueada'
                          : 'Pista (1 pt)'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <form onSubmit={handleEnviarRespuesta} className="rk-form-respuesta">
              <label className="field-label" htmlFor="rk-online-input">
                {esMiTurno ? 'Introduce cualquier elemento que falte:' : `Esperando a ${ronda.jugadorTurnoNombre}...`}
              </label>
              <div className="rk-form-row">
                <input
                  id="rk-online-input"
                  type="text"
                  autoFocus={esMiTurno}
                  autoComplete="off"
                  disabled={!esMiTurno || elementosRojos}
                  placeholder={esMiTurno ? 'Escribe el nombre o elemento…' : 'No es tu turno'}
                  value={inputRespuesta}
                  onChange={(e) => setInputRespuesta(e.target.value)}
                  required
                />
                <button type="submit" disabled={!esMiTurno || !inputRespuesta.trim() || elementosRojos} className="ok">
                  <Icon name="check" size={18} strokeWidth={2.5} /> Enviar
                </button>
              </div>
            </form>
          </div>

          {esMiTurno && (
            <button
              type="button"
              disabled={elementosRojos}
              className="secondary danger full"
              onClick={handlePasarTurno}
            >
              <Icon name="refresh" size={20} /> Pasar turno / Fallo (Rebote)
            </button>
          )}

          {/* MODAL PISTA */}
          {modalPista && (
            <div className="rg-modal-fondo">
              <div className="rg-modal" role="dialog" aria-modal="true">
                <h3>Pista para el puesto #{modalPista.posicion}</h3>
                <p className="rk-modal-texto-pista">{modalPista.pista}</p>
                <p className="rg-modal-puntos">
                  Recuerda: si aciertas este puesto habiendo visto la pista sumarás <strong>1 punto</strong> en lugar de 3.
                </p>
                <div className="rg-modal-acciones">
                  <button className="big full" onClick={() => setModalPista(null)}>Entendido</button>
                </div>
              </div>
            </div>
          )}

          <button className="secondary danger full" style={{ marginTop: '1.2rem' }} onClick={() => setModalSalir(true)}>
            Salir de la sala
          </button>
        </section>
      )}

      {/* 7. SOLUCIÓN ONLINE (SI TODOS FALLAN) */}
      {vista === 'sala' && sala && sala.estado === 'jugando' && ronda && ronda.faseRonda === 'solucion' && ronda.solucionFinal && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="flagFinish" size={18} />Ronda {sala.rondaNum} de {sala.maxRondas}</span>
          </div>

          <div className="rf-aviso" style={{ background: '#fee2e2', color: '#991b1b', border: '1.5px solid #fca5a5' }}>
            <Icon name="hourglass" size={22} />
            ¡Ronda terminada! Nadie ha conseguido completar el ranking.
          </div>

          <div className="panel rk-tablero">
            <p className="categoria"><Icon name="trophy" size={16} />{ronda.categoria}</p>
            <h2 className="rk-ranking-titulo">{ronda.titulo}</h2>
            <p className="rk-ranking-desc">{ronda.descripcion}</p>

            <div className="rk-lista-ranking">
              {ronda.solucionFinal.map((sol) => {
                const acertado = ronda.puestos.some((p) => p.posicion === sol.posicion && !p.oculto);
                return (
                  <div
                    key={sol.posicion}
                    className={`rk-fila-puesto ${acertado ? 'rk-resuelto' : 'rk-fallado-solucion'}`}
                  >
                    <span className="rk-pos">#{sol.posicion}</span>
                    <span className="rk-val">{sol.valor}</span>
                    {acertado ? (
                      <span className="rk-check"><Icon name="check" size={20} strokeWidth={2.5} /></span>
                    ) : (
                      <span className="rk-tag-no-adivinado">No descubierto</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {esAdmin ? (
            <button className="big full" onClick={handleAvanzarResumen}>
              <Icon name="trophy" size={22} /> Ver puntuaciones de la ronda
            </button>
          ) : (
            <p className="hint center">Esperando a que el anfitrión avance al resumen...</p>
          )}

          <button className="secondary danger full" style={{ marginTop: '1rem' }} onClick={() => setModalSalir(true)}>
            Salir de la sala
          </button>
        </section>
      )}

      {/* 8. RESUMEN DE RONDA ONLINE */}
      {vista === 'sala' && sala && sala.estado === 'jugando' && ronda && ronda.faseRonda === 'resumen' && (
        <section className="game">
          <div className="end-card">
            <span className="end-icon"><Icon name="trophy" size={44} /></span>
            <h1 className="title">Puntuaciones tras la Ronda {sala.rondaNum}</h1>
            <div className="scoreboard">
              {ranking.map((j, i) => (
                <div key={j.id} className={`score-row ${i === 0 && j.puntos > 0 ? 'first' : ''}`}>
                  <span className="score-name">
                    {i === 0 && j.puntos > 0 ? <Icon name="crown" size={22} /> : <span className="pos">{i + 1}</span>}
                    {j.nombre}
                  </span>
                  <span className="score-pts">{j.puntos} pts</span>
                </div>
              ))}
            </div>
          </div>

          <div className="actions" style={{ marginTop: '1.2rem' }}>
            {esAdmin ? (
              <>
                {sala.rondaNum < sala.maxRondas ? (
                  <button className="big full" onClick={handleSiguienteRonda}>
                    <Icon name="play" size={20} /> Elegir categoría para Ronda {sala.rondaNum + 1}
                  </button>
                ) : (
                  <button className="big full" onClick={handleFinalizar}>
                    <Icon name="trophy" size={20} /> Ver podio final
                  </button>
                )}
                <button className="secondary danger full" onClick={handleFinalizar}>
                  <Icon name="flagFinish" size={20} /> Finalizar partida
                </button>
              </>
            ) : (
              <div className="panel center" style={{ width: '100%', padding: '1rem' }}>
                <p className="hint">Esperando a que el anfitrión lance la siguiente ronda...</p>
                <button className="secondary danger full" style={{ marginTop: '0.8rem' }} onClick={() => setModalSalir(true)}>
                  Salir de la sala
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 9. PODIO FINAL ONLINE */}
      {vista === 'sala' && sala && sala.estado === 'final' && (
        <section className="game">
          <div className="end-card">
            <span className="end-icon"><Icon name="crown" size={48} /></span>
            <h1 className="title">Clasificación Final</h1>
            <p className="final-score">
              {ganadores.length === 0
                ? 'Nadie ha conseguido puntos'
                : ganadores.length === 1
                ? <>¡Victoria para {ganadores[0].nombre} con {maximoPuntos} puntos!</>
                : <>Empate entre {ganadores.map((g) => g.nombre).join(', ')} con {maximoPuntos} puntos</>}
            </p>

            <div className="scoreboard">
              {ranking.map((j, i) => {
                const lider = maximoPuntos > 0 && j.puntos === maximoPuntos;
                return (
                  <div key={j.id} className={`score-row ${lider ? 'first' : ''}`}>
                    <span className="score-name">
                      {lider ? <Icon name="crown" size={22} /> : <span className="pos">{i + 1}</span>}
                      {j.nombre}
                    </span>
                    <span className="score-pts">{j.puntos} pts</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="actions" style={{ marginTop: '1.5rem' }}>
            <button className="secondary danger full" onClick={() => setModalSalir(true)}>
              <Icon name="door" size={20} /> Salir al menú
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