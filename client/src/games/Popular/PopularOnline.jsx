// client/src/games/Popular/PopularOnline.jsx
import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../components/Icon.jsx';
import './Popular.css';
import { MenuInicioJuego, MenuModoOnline, FormCrearSala, FormUnirseSala, CabeceraSala, EsperandoAnfitrion } from '../../components/MenuJuego.jsx';

const CLAVE_SESION_POPULAR = 'popular_online_session';
const TIEMPO_TURNO = 45;

const PUNTOS_POR_PUESTO = {
  1: 2,
  2: 4,
  3: 6,
  4: 8,
  5: 10
};

const COLORES_JUGADOR = ['#3b82f6', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4', '#f97316', '#84cc16', '#6366f1'];
const colorJugador = (id) => COLORES_JUGADOR[(Number(id) - 1 + COLORES_JUGADOR.length * 10) % COLORES_JUGADOR.length];
const inicial = (n = '?') => n.trim().charAt(0).toUpperCase() || '?';

export default function PopularOnline({ onLocal, onSalir }) {
  const [vista, setVista] = useState('menu'); // 'menu' | 'online_menu' | 'crear' | 'unirse' | 'sala'
  const [nombre, setNombre] = useState('');
  const [codigoInput, setCodigoInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);
  const [modalSalir, setModalSalir] = useState(false);
  const [modalAyuda, setModalAyuda] = useState(false);

  const [sesion, setSesion] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(CLAVE_SESION_POPULAR));
    } catch {
      return null;
    }
  });

  const [sala, setSala] = useState(null);
  const [inputTexto, setInputTexto] = useState('');
  const [tiempoRestante, setTiempoRestante] = useState(TIEMPO_TURNO);

  const intervalRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!sesion) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setSala(null);
      return;
    }

    const consultarEstado = () => {
      fetch(`/api/popular/online/sala/${sesion.code}?token=${sesion.token}`)
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
          sessionStorage.removeItem(CLAVE_SESION_POPULAR);
          setSesion(null);
          setSala(null);
          setVista('online_menu');
          setErrorMsg('La sala se ha cerrado.');
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
    setCargando(true);
    try {
      const res = await fetch('/api/popular/online/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_POPULAR, JSON.stringify(nueva));
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
      const res = await fetch('/api/popular/online/unirse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codigoInput.trim().toUpperCase(), nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_POPULAR, JSON.stringify(nueva));
      setSesion(nueva);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleIniciarPartida = async () => {
    try {
      const res = await fetch(`/api/popular/online/sala/${sesion.code}/iniciar`, {
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

  const handleValidarRespuesta = async (e) => {
    e.preventDefault();
    if (!inputTexto.trim()) return;

    try {
      const res = await fetch(`/api/popular/online/sala/${sesion.code}/validar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token, respuesta: inputTexto })
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setInputTexto('');
    } catch (err) {
      console.error(err);
    }
  };

  const handlePasarTurno = async () => {
    try {
      await fetch(`/api/popular/online/sala/${sesion.code}/pasar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token })
      });
      setInputTexto('');
    } catch (err) {
      console.error(err);
    }
  };

  const handlePasarTurnoRef = useRef();
  useEffect(() => {
    handlePasarTurnoRef.current = handlePasarTurno;
  });

  const ronda = sala?.ronda;
  const esAdmin = sala?.esAdmin;
  const yoId = sala?.yoId;
  const esMiTurno = ronda?.jugadorActivoId === yoId;
  const misPistas = ronda?.misPistas || {};

  // Temporizador sincronizado durante el turno
  useEffect(() => {
    const isJugando = sala?.estado === 'jugando' && ronda?.faseRonda === 'jugando';
    if (!isJugando || ronda?.feedback !== null) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    setTiempoRestante(TIEMPO_TURNO);
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          if (esMiTurno && handlePasarTurnoRef.current) {
            handlePasarTurnoRef.current();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sala?.estado, ronda?.faseRonda, ronda?.jugadorActivoId, esMiTurno, ronda?.feedback]);

  // Pide directamente desde la fila del puesto la siguiente pista disponible
  const handlePedirPistaPuesto = async (puesto) => {
    if (!esMiTurno || ronda?.feedback !== null) return;
    const actual = misPistas[puesto] || {};
    const tipo = !actual.longitud ? 'longitud' : !actual.letras ? 'letras' : null;
    if (!tipo) return;

    try {
      const res = await fetch(`/api/popular/online/sala/${sesion.code}/pista`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token, puesto, tipo })
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRendirse = async () => {
    try {
      await fetch(`/api/popular/online/sala/${sesion.code}/rendirse`, {
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
      await fetch(`/api/popular/online/sala/${sesion.code}/siguiente-ronda`, {
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
      await fetch(`/api/popular/online/sala/${sesion.code}/finalizar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSalir = () => {
    sessionStorage.removeItem(CLAVE_SESION_POPULAR);
    setSesion(null);
    setSala(null);
    setVista('online_menu');
  };

  const ranking = sala?.jugadores ? [...sala.jugadores].sort((a, b) => b.puntos - a.puntos) : [];
  const maximo = ranking.length ? ranking[0].puntos : 0;
  const ganadores = maximo > 0 ? ranking.filter((j) => j.puntos === maximo) : [];
  const enPartidaActiva = vista === 'sala' && sala && sala.estado !== 'lobby';

  const cabeceraOnline = sala && ronda && (
    <header className="popp-hero">
      <span className="popp-hero-deco" aria-hidden="true">
        <Icon name="trophy" size={140} strokeWidth={1.3} />
      </span>
      <div className="popp-hero-top">
        <button type="button" className="popp-salir" onClick={() => setModalSalir(true)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span>Portada</span>
        </button>
        <div className="popp-hero-chips">
          <span className="popp-chip"><Icon name="flagFinish" size={14} /> Ronda {sala.rondaNum}/{sala.maxRondas}</span>
          <span className="popp-chip">{Object.keys(ronda.acertados || {}).length} / 5 descubiertos</span>
        </div>
      </div>

      <ol className="popp-marcador" aria-label="Jugadores">
        {sala.jugadores.map((j) => {
          const activo = j.id === ronda.jugadorActivoId && ronda.faseRonda === 'jugando';
          return (
            <li
              key={j.id}
              className={`popp-jugador${activo ? ' activo' : ''}`}
              style={{ '--c': colorJugador(j.id) }}
            >
              <span className="popp-jugador-avatar">{inicial(j.nombre)}</span>
              <span className="popp-jugador-datos">
                <span className="popp-jugador-nombre">
                  {j.nombre}{j.id === yoId ? ' (tú)' : ''}
                </span>
                <strong className="popp-jugador-pts">{j.puntos} pts</strong>
              </span>
            </li>
          );
        })}
      </ol>
    </header>
  );

  return (
    <div className={`pop-contenedor ${enPartidaActiva ? 'qq-en-partida' : ''}`}>
      {/* MODAL DE AYUDA */}
      {modalAyuda && (
        <div className="rg-modal-fondo" onClick={() => setModalAyuda(false)}>
          <div className="rg-modal popp-modal-ayuda" onClick={(e) => e.stopPropagation()}>
            <div className="popp-modal-ayuda-header">
              <span className="popp-ayuda-badge">❓ Cómo jugar</span>
              <h3>Sigue la moda</h3>
            </div>

            <div className="popp-modal-ayuda-body">
              <p>Adivina <strong>las 5 respuestas más populares</strong> de cada categoría propuesta.</p>
              <ul>
                <li><strong>Por turnos (45 s):</strong> Cuando sea tu turno, escribe una respuesta o palabra clave para cualquiera de los 5 puestos.</li>
                <li><strong>Pistas en cada fila (-1 pt):</strong> Pulsa el botón <strong>💡 Pista</strong> a la derecha del puesto que quieras desbloquear.</li>
                <li><strong>Puntuación:</strong> Top #1 (+2 pts), Top #2 (+4 pts), Top #3 (+6 pts), Top #4 (+8 pts) y Top #5 (+10 pts).</li>
              </ul>
            </div>

            <button type="button" className="popp-boton" onClick={() => setModalAyuda(false)}>
              ¡Entendido!
            </button>
          </div>
        </div>
      )}

      {/* 1. MENÚ ONLINE */}
      {vista === 'menu' && (
        <MenuInicioJuego
          juegoId="popular"
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

      {/* 2. CREAR SALA */}
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

      {/* 3. UNIRSE A SALA */}
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

      {/* 4. LOBBY */}
      {vista === 'sala' && sala && sala.estado === 'lobby' && (
        <section className="game qq-pantalla">
          <CabeceraSala codigo={sala.code} onVolver={() => setModalSalir(true)} onAyuda={() => setModalAyuda(true)} />

          <div className="panel qq-menu-panel" style={{ marginTop: '1rem' }}>
            <h3 className="qq-sala-titulo"><Icon name="users" size={20} /> Jugadores ({sala.jugadores.length}/12)</h3>
            <div className="lb-lista qq-sala-lista">
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
              className="big full qq-btn-principal"
              style={{ marginTop: '1.2rem' }}
              disabled={sala.jugadores.length < 2}
              onClick={handleIniciarPartida}
            >
              <Icon name="play" size={22} /> {sala.jugadores.length < 2 ? 'Esperando rivales (mínimo 2)...' : '¡Empezar Partida!'}
            </button>
          ) : (
            <EsperandoAnfitrion />
          )}
        </section>
      )}

      {/* 5. JUGANDO ONLINE */}
      {vista === 'sala' && sala && sala.estado === 'jugando' && ronda && ronda.faseRonda === 'jugando' && (
        <section className="game popp-escena">
          {cabeceraOnline}

          {/* Banner de quién tiene el turno */}
          <div
            className={`popp-turno-banner ${esMiTurno ? 'mio' : ''}`}
            style={{ '--c': colorJugador(ronda.jugadorActivoId || 1) }}
          >
            <span className="popp-jugador-avatar">{inicial(ronda.jugadorActivoNombre)}</span>
            <div className="popp-turno-textos">
              <span className="popp-etiqueta">{esMiTurno ? '¡Te toca a ti!' : 'Turno en curso'}</span>
              <strong>
                {esMiTurno
                  ? 'Escribe una respuesta o pide pista en un puesto'
                  : `${ronda.jugadorActivoNombre} está pensando una respuesta…`}
              </strong>
            </div>
          </div>

          {/* Barra de tiempo */}
          <div className={`popp-tiempo ${tiempoRestante <= 10 ? 'critico' : ''}`} role="timer">
            <div className="popp-tiempo-barra">
              <span style={{ width: `${(tiempoRestante / TIEMPO_TURNO) * 100}%` }} />
            </div>
            <span className="popp-tiempo-num">
              <Icon name="clock" size={15} /> {tiempoRestante}s
            </span>
          </div>

          {/* Tarjeta de la pregunta */}
          <div className="popp-tarjeta popp-pregunta-box">
            <span className="popp-badge-tema">Top 5 más popular</span>
            <h2 className="popp-pregunta-titulo">«{ronda.pregunta}»</h2>
          </div>

          {ronda.feedback && (
            <div className={`popp-feedback ${ronda.feedback.tipo}`} role="status">
              {ronda.feedback.msg}
            </div>
          )}

          {/* Los 5 puestos con botón de pista integrado en cada puesto */}
          <div className="popp-slots-lista">
            {[1, 2, 3, 4, 5].map((puesto) => {
              const descubierto = ronda.acertados?.[puesto];
              const pistaPuesto = misPistas[puesto];
              const tieneLongitud = Boolean(pistaPuesto?.longitud);
              const tieneLetras = Boolean(pistaPuesto?.letras);
              const esqueletoVisible = pistaPuesto?.letras || pistaPuesto?.longitud;

              return (
                <div key={puesto} className={`popp-slot-card ${descubierto ? 'revelado' : ''}`}>
                  <div className="popp-slot-main">
                    <span className={`popp-puesto-num p-${puesto}`}>#{puesto}</span>

                    <div className="popp-slot-contenido">
                      {descubierto ? (
                        <>
                          <span className="popp-slot-texto">{descubierto.texto}</span>
                          <span className="popp-slot-autor">Acertado por {descubierto.jugador}</span>
                        </>
                      ) : esqueletoVisible ? (
                        <div className="popp-ahorcado-wrap">
                          {esqueletoVisible.split('   /   ').map((palabra, pIdx) => (
                            <span key={pIdx} className="popp-palabra-chip">
                              {palabra}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="popp-slot-incognita">Respuesta oculta</span>
                      )}
                    </div>
                  </div>

                  <div className="popp-slot-derecha">
                    {!descubierto && !tieneLetras && esMiTurno && (
                      <button
                        type="button"
                        className={`popp-btn-pista-slot ${tieneLongitud ? 'fase2' : ''}`}
                        onClick={() => handlePedirPistaPuesto(puesto)}
                        disabled={ronda.feedback !== null}
                        title={
                          !tieneLongitud
                            ? `Ver huecos de letras del Top #${puesto} (-1 pt)`
                            : `Revelar letras del Top #${puesto} (-1 pt)`
                        }
                      >
                        <span>{!tieneLongitud ? '💡 Pista' : '🔤 +Letras'}</span>
                        <small>-1 pt</small>
                      </button>
                    )}
                    <span className="popp-puntos-badge">+{PUNTOS_POR_PUESTO[puesto]} pts</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Formulario (solo visible cuando es tu turno) */}
          {esMiTurno && (
            <form onSubmit={handleValidarRespuesta} className="popp-tarjeta popp-form-card">
              <label className="popp-etiqueta" htmlFor="popp-input-online">
                Tu respuesta para cualquier puesto del Top 5
              </label>
              <input
                id="popp-input-online"
                type="text"
                autoFocus
                className="popp-input"
                placeholder="Escribe una palabra clave o respuesta…"
                value={inputTexto}
                onChange={(e) => setInputTexto(e.target.value)}
                disabled={ronda.feedback !== null}
                autoComplete="off"
              />

              <div className="popp-fila-botones">
                <button
                  type="button"
                  className="popp-boton secundario"
                  onClick={handlePasarTurno}
                  disabled={ronda.feedback !== null}
                >
                  Pasar turno
                </button>
                <button
                  type="submit"
                  className="popp-boton"
                  disabled={!inputTexto.trim() || ronda.feedback !== null}
                >
                  <Icon name="check" size={20} /> Comprobar
                </button>
              </div>
            </form>
          )}

          {esAdmin && (
            <div className="popp-pie-acciones">
              <button type="button" className="popp-enlace peligro" onClick={handleRendirse}>
                <Icon name="flagFinish" size={16} /> Rendirse y resolver los 5 puestos
              </button>
            </div>
          )}
        </section>
      )}

      {/* 6. RESOLUCIÓN DE RONDA ONLINE (Se abre automáticamente al acertar los 5 o al rendirse) */}
      {vista === 'sala' && sala && sala.estado === 'jugando' && ronda && ronda.faseRonda === 'resolucion' && (
        <section className="game popp-escena">
          {cabeceraOnline}

          <div className="popp-tarjeta">
            <p className="popp-etiqueta">Soluciones · Ronda {sala.rondaNum}</p>
            <h3 className="popp-pregunta-resumen">«{ronda.pregunta}»</h3>

            <div className="popp-slots-lista" style={{ marginTop: '0.8rem' }}>
              {(ronda.solucionFinal || [1, 2, 3, 4, 5].map((p) => ({
                puesto: p,
                texto: ronda.acertados?.[p]?.texto || '',
                puntos: PUNTOS_POR_PUESTO[p]
              }))).map((resp) => {
                const acertador = ronda.acertados?.[resp.puesto];
                return (
                  <div
                    key={resp.puesto}
                    className={`popp-slot-card ${acertador ? 'revelado' : 'no-acertado'}`}
                  >
                    <div className="popp-slot-main">
                      <span className={`popp-puesto-num p-${resp.puesto}`}>#{resp.puesto}</span>
                      <div className="popp-slot-contenido">
                        <span className="popp-slot-texto">{resp.texto}</span>
                        <span className="popp-slot-autor">
                          {acertador ? `🎉 Acertado por ${acertador.jugador}` : 'Sin descubrir'}
                        </span>
                      </div>
                    </div>
                    <span className="popp-puntos-badge">+{resp.puntos} pts</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="popp-tarjeta">
            <p className="popp-etiqueta">Clasificación general</p>
            <ol className="popp-ranking">
              {ranking.map((j, i) => {
                const lider = maximo > 0 && j.puntos === maximo;
                return (
                  <li key={j.id} className={lider ? 'lider' : ''} style={{ '--c': colorJugador(j.id) }}>
                    <span className="popp-ranking-pos">{lider ? <Icon name="crown" size={18} /> : i + 1}</span>
                    <span className="popp-jugador-avatar">{inicial(j.nombre)}</span>
                    <span className="popp-ranking-nombre">
                      {j.nombre}{j.id === yoId ? ' (tú)' : ''}
                    </span>
                    <strong>{j.puntos} pts</strong>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="popp-barra estatica">
            {esAdmin ? (
              <>
                {sala.rondaNum < sala.maxRondas ? (
                  <button type="button" className="popp-boton grande" onClick={handleSiguienteRonda}>
                    <Icon name="play" size={20} /> Siguiente ronda ({sala.rondaNum + 1})
                  </button>
                ) : (
                  <button type="button" className="popp-boton grande" onClick={handleFinalizar}>
                    <Icon name="trophy" size={20} /> Ver podio final
                  </button>
                )}
                <button type="button" className="popp-enlace" onClick={handleFinalizar}>
                  <Icon name="flagFinish" size={16} /> Finalizar partida
                </button>
              </>
            ) : (
              <p className="popp-espera">Esperando a que el anfitrión inicie la siguiente ronda o finalice la partida…</p>
            )}
          </div>
        </section>
      )}

      {/* 7. PODIO FINAL ONLINE */}
      {vista === 'sala' && sala && sala.estado === 'final' && (
        <section className="game popp-escena">
          <div className="end-card">
            <span className="end-icon"><Icon name="crown" size={48} /></span>
            <h1 className="title">Clasificación Final</h1>
            <p className="final-score">
              {ganadores.length === 0
                ? 'Nadie ha conseguido puntos'
                : ganadores.length === 1
                ? <>¡Victoria para {ganadores[0].nombre} con {maximo} puntos!</>
                : <>Empate entre {ganadores.map((g) => g.nombre).join(', ')} con {maximo} puntos</>}
            </p>

            <div className="scoreboard">
              {ranking.map((j, i) => {
                const lider = maximo > 0 && j.puntos === maximo;
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

          <div className="popp-barra estatica">
            <button type="button" className="popp-boton secundario" onClick={() => setModalSalir(true)}>
              <Icon name="door" size={20} /> Salir al menú
            </button>
          </div>
        </section>
      )}

      {/* MODAL DE CONFIRMACIÓN PARA SALIR */}
      {modalSalir && (
        <div className="rg-modal-fondo" onClick={() => setModalSalir(false)}>
          <div className="rg-modal popp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="popp-modal-icono">🚪</div>
            <h3>¿Salir de la sala?</h3>
            <p className="hint">Si sales de la sala perderás tu progreso actual en la partida. ¿Estás seguro?</p>

            <div className="popp-fila-botones">
              <button type="button" className="popp-boton secundario" onClick={() => setModalSalir(false)}>
                Quedarme
              </button>
              <button
                type="button"
                className="popp-boton peligro"
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