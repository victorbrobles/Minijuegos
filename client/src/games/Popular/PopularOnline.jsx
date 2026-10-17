// client/src/games/Popular/PopularOnline.jsx
import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../components/Icon.jsx';
import './Popular.css';
import '../Adivina/Adivina.css';

const CLAVE_SESION_POPULAR = 'popular_online_session';

const PUNTOS_POR_PUESTO = {
  1: 2,
  2: 4,
  3: 6,
  4: 8,
  5: 10
};

export default function PopularOnline({ onLocal, onSalir }) {
  const [vista, setVista] = useState('menu'); // 'menu' | 'crear' | 'unirse' | 'sala'
  const [nombre, setNombre] = useState('');
  const [codigoInput, setCodigoInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);

  const [sesion, setSesion] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(CLAVE_SESION_POPULAR));
    } catch {
      return null;
    }
  });

  const [sala, setSala] = useState(null);
  const [codigoCopiado, setCodigoCopiado] = useState(false);

  const [inputTexto, setInputTexto] = useState('');
  const [modalPistas, setModalPistas] = useState(false);

  const intervalRef = useRef(null);

  // Polling continuo
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
          setVista('menu');
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

  const handlePedirPista = async (puesto, tipo) => {
    try {
      const res = await fetch(`/api/popular/online/sala/${sesion.code}/pista`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token, puesto, tipo })
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setModalPistas(false);
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
    setVista('menu');
  };

  const copiarCodigo = () => {
    if (!sala?.code) return;
    navigator.clipboard?.writeText(sala.code);
    setCodigoCopiado(true);
    setTimeout(() => setCodigoCopiado(false), 2000);
  };

  const ronda = sala?.ronda;
  const esAdmin = sala?.esAdmin;
  const yoId = sala?.yoId;
  const esMiTurno = ronda?.jugadorActivoId === yoId;
  const misPistas = ronda?.misPistas || {};

  const ranking = sala?.jugadores ? [...sala.jugadores].sort((a, b) => b.puntos - a.puntos) : [];
  const maximo = ranking.length ? ranking[0].puntos : 0;
  const ganadores = maximo > 0 ? ranking.filter((j) => j.puntos === maximo) : [];

  return (
    <div className="pop-contenedor">
      {/* 1. MENÚ ONLINE */}
      {vista === 'menu' && (
        <section className="game">
          <div className="panel center">
            <span className="lb-luna chica">
              <Icon name="fashion" size={42} strokeWidth={1.6} />
            </span>
            <h1 className="title">Sigue la moda Online</h1>
            <p className="hint">
              Adivina las 5 respuestas más populares. Cuando no sea tu turno podrás ver en directo qué puestos se descubren y cómo juegan los demás.
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
            <p className="hint">Introduce tu nombre de anfitrión (de 2 a 12 jugadores).</p>

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
            <p className="categoria">Código de la partida</p>
            <button type="button" className="qq-codigo-btn" onClick={copiarCodigo}>
              {sala.code}
            </button>
            <p className="hint small">
              {codigoCopiado ? '¡Copiado!' : 'Comparte este código para que se unan (mínimo 2 jugadores).'}
            </p>
          </div>

          <div className="panel" style={{ marginTop: '1rem' }}>
            <h3 className="panel-title"><Icon name="users" size={20} /> Jugadores ({sala.jugadores.length}/12)</h3>
            <div className="lb-lista">
              {sala.jugadores.map((j) => (
                <div key={j.id} className={`lb-jug ${j.id === yoId ? 'yo' : ''}`}>
                  <span className="lb-punto on" />
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
              {sala.jugadores.length < 2 ? 'Esperando rivales (mínimo 2)...' : '¡Empezar Partida!'}
            </button>
          ) : (
            <div className="panel center" style={{ marginTop: '1rem' }}>
              <p className="hint">Esperando a que el anfitrión comience la partida...</p>
            </div>
          )}

          <button className="secondary danger full" style={{ marginTop: '1rem' }} onClick={handleSalir}>
            Salir de la sala
          </button>
        </section>
      )}

      {/* 5. JUGANDO ONLINE */}
      {vista === 'sala' && sala && sala.estado === 'jugando' && ronda && ronda.faseRonda === 'jugando' && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="flagFinish" size={18} />Ronda {sala.rondaNum} de {sala.maxRondas}</span>
            <span className="chip alt">
              {Object.keys(ronda.acertados || {}).length} / 5 descubiertos
            </span>
          </div>

          {/* Marcador superior */}
          <div className="scoreboard-container" style={{ justifyContent: 'center', marginBottom: '0.8rem' }}>
            {sala.jugadores.map((j) => (
              <div
                key={j.id}
                className="score-pill"
                style={{ borderColor: j.id === ronda.jugadorActivoId ? '#4f46e5' : undefined }}
              >
                <span>{j.nombre}: <strong>{j.puntos} pts</strong></span>
                {j.id === ronda.jugadorActivoId && <span style={{ marginLeft: '4px' }}>👉</span>}
              </div>
            ))}
          </div>

          {/* Pregunta */}
          <div className="pop-pregunta-card">
            <span className="badge" style={{ background: '#ede9fe', color: '#6d28d9' }}>
              Lo más popular
            </span>
            <h2 className="pop-pregunta-titulo">«{ronda.pregunta}»</h2>
          </div>

          {/* Banner indicador de turno */}
          {esMiTurno ? (
            <div className="status-alert acierto" style={{ textAlign: 'center', marginBottom: '1rem', fontWeight: 800 }}>
              👉 ¡ES TU TURNO! Escribe una respuesta o pide pista
            </div>
          ) : (
            <div className="status-alert info" style={{ textAlign: 'center', marginBottom: '1rem' }}>
              ⏳ Turno de <strong>{ronda.jugadorActivoNombre}</strong>. Espera tu turno...
            </div>
          )}

          {/* Los 5 puestos en vivo */}
          <div className="pop-slots-lista">
            {[1, 2, 3, 4, 5].map((puesto) => {
              const descubierto = ronda.acertados?.[puesto];
              const pistaPuesto = misPistas[puesto];
              const esqueletoVisible = pistaPuesto?.letras || pistaPuesto?.longitud;

              return (
                <div key={puesto} className={`pop-slot-item ${descubierto ? 'revelado' : ''}`}>
                  <div className="pop-slot-posicion">
                    <span className="pop-puesto-badge">#{puesto}</span>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      {descubierto ? (
                        <span className="pop-slot-texto">
                          {descubierto.texto}{' '}
                          <em style={{ fontSize: '0.85rem', color: '#15803d' }}>({descubierto.jugador})</em>
                        </span>
                      ) : (
                        <>
                          <span className="pop-slot-incognita">¿ ?</span>
                          {esqueletoVisible && (
                            <div className="pop-pista-ahorcado-container">
                              {esqueletoVisible.split('   /   ').map((palabra, pIdx) => (
                                <span key={pIdx} className="pop-palabra-bloque">
                                  {palabra}
                                </span>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <span className="pop-puntos-tag">+{PUNTOS_POR_PUESTO[puesto]} pts</span>
                </div>
              );
            })}
          </div>

          {/* Feedback interactivo en vivo */}
          {ronda.feedback && (
            <div className={`pop-banner-feedback ${ronda.feedback.tipo}`}>
              {ronda.feedback.msg}
            </div>
          )}

          {/* Formulario (solo activo para el jugador de turno) */}
          <form onSubmit={handleValidarRespuesta} className="pop-formulario-box">
            <p className="field-label" style={{ textAlign: 'center', marginBottom: '0.6rem' }}>
              {esMiTurno ? 'Escribe tu respuesta:' : `Observando respuestas de ${ronda.jugadorActivoNombre}...`}
            </p>
            <input
              type="text"
              autoFocus={esMiTurno}
              className="pop-input-grande"
              placeholder={esMiTurno ? 'Escribe lo que diría la gente...' : 'No es tu turno'}
              value={inputTexto}
              onChange={(e) => setInputTexto(e.target.value)}
              disabled={!esMiTurno || ronda.feedback !== null}
            />

            <div className="pop-form-actions-row">
              <button
                type="submit"
                className="big btn-validar-flex"
                disabled={!esMiTurno || !inputTexto.trim() || ronda.feedback !== null}
              >
                <Icon name="check" size={20} /> Validar respuesta
              </button>

              <button
                type="button"
                className="btn-pedir-pista"
                onClick={() => setModalPistas(true)}
                disabled={!esMiTurno || ronda.feedback !== null}
              >
                💡 Pedir pista (-1 pt)
              </button>

              <button
                type="button"
                className="btn-pasar-turno"
                onClick={handlePasarTurno}
                disabled={!esMiTurno || ronda.feedback !== null}
              >
                Pasar turno ➔
              </button>
            </div>
          </form>

          {esAdmin && (
            <div className="actions" style={{ marginTop: '0.8rem' }}>
              <button className="secondary danger full" onClick={handleRendirse}>
                <Icon name="flag" size={18} /> Rendirse y ver soluciones
              </button>
            </div>
          )}

          {/* MODAL DE PISTAS ONLINE */}
          {modalPistas && esMiTurno && (
            <div className="rg-modal-fondo" onClick={() => setModalPistas(false)}>
              <div className="rg-modal pop-modal-pistas" onClick={(e) => e.stopPropagation()}>
                <div className="modal-ayuda-header">
                  <h3>Pedir pista para un puesto (-1 punto)</h3>
                </div>
                <p className="hint small" style={{ margin: '0.4rem 0 1rem', textAlign: 'center' }}>
                  Elige sobre qué puesto quieres la pista. Se aplicará a tu pantalla durante toda la ronda:
                </p>

                <div className="pop-pistas-selector-grid">
                  {[1, 2, 3, 4, 5].map((puesto) => {
                    const yaDescubierto = Boolean(ronda.acertados?.[puesto]);
                    const yaTieneLongitud = Boolean(misPistas[puesto]?.longitud);
                    const yaTieneLetras = Boolean(misPistas[puesto]?.letras);

                    return (
                      <div key={puesto} className={`pop-pista-row-card ${yaDescubierto ? 'bloqueado' : ''}`}>
                        <div className="pop-pista-info-puesto">
                          <span className="pop-puesto-badge">#{puesto}</span>
                          <strong>{yaDescubierto ? '¡Ya descubierto!' : `Top ${puesto} (+${PUNTOS_POR_PUESTO[puesto]} pts)`}</strong>
                        </div>

                        {!yaDescubierto && (
                          <div className="pop-pista-botones-accion">
                            <button
                              type="button"
                              className="btn-subpista"
                              disabled={yaTieneLongitud}
                              onClick={() => handlePedirPista(puesto, 'longitud')}
                            >
                              {yaTieneLongitud ? '✓ N.º letras pedidas' : '📏 N.º letras (-1 pt)'}
                            </button>

                            <button
                              type="button"
                              className="btn-subpista"
                              disabled={!yaTieneLongitud || yaTieneLetras}
                              title={!yaTieneLongitud ? 'Debes pedir primero el número de letras' : ''}
                              onClick={() => handlePedirPista(puesto, 'letras')}
                            >
                              {yaTieneLetras
                                ? '✓ 20% revelado'
                                : !yaTieneLongitud
                                ? '🔒 Revelar 20% (Pide 1.º letras)'
                                : '🔤 Revelar 20% (-1 pt)'}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="rg-modal-acciones" style={{ marginTop: '1.2rem' }}>
                  <button className="secondary full" onClick={() => setModalPistas(false)}>
                    Cerrar sin pedir pista
                  </button>
                </div>
              </div>
            </div>
          )}

          <button className="secondary danger full" style={{ marginTop: '1.2rem' }} onClick={handleSalir}>
            Salir de la sala
          </button>
        </section>
      )}

      {/* 6. RESOLUCIÓN DE RONDA ONLINE */}
      {vista === 'sala' && sala && sala.estado === 'jugando' && ronda && ronda.faseRonda === 'resolucion' && ronda.solucionFinal && (
        <section className="game">
          <div className="end-card aprox-resolucion-card">
            <span className="end-icon"><Icon name="trophy" size={44} /></span>
            <p className="categoria">Ronda {sala.rondaNum} completada</p>
            <h1 className="title">Los 5 más populares</h1>
            <p className="reveal" style={{ fontSize: '1.25rem', margin: '0.4rem 0 1.2rem' }}>
              «{ronda.pregunta}»
            </p>

            <div className="pop-slots-lista" style={{ width: '100%' }}>
              {ronda.solucionFinal.map((resp) => {
                const acertador = ronda.acertados?.[resp.puesto];
                return (
                  <div
                    key={resp.puesto}
                    className={`pop-slot-item ${acertador ? 'revelado' : 'solucion-perdida'}`}
                  >
                    <div className="pop-slot-posicion">
                      <span className="pop-puesto-badge">#{resp.puesto}</span>
                      <span className="pop-slot-texto">
                        {resp.texto}{' '}
                        {acertador && <em style={{ fontSize: '0.85rem', color: '#15803d' }}>({acertador.jugador})</em>}
                      </span>
                    </div>
                    <span className="pop-puntos-tag">+{resp.puntos} pts</span>
                  </div>
                );
              })}
            </div>

            <div className="scoreboard" style={{ width: '100%', marginTop: '1.2rem' }}>
              <h3 className="section-title" style={{ margin: '0 0 0.8rem', textAlign: 'center' }}>
                Clasificación general
              </h3>
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

          <div className="actions" style={{ marginTop: '1.2rem' }}>
            {esAdmin ? (
              <>
                {sala.rondaNum < sala.maxRondas ? (
                  <button className="big full" onClick={handleSiguienteRonda}>
                    <Icon name="play" size={20} /> Siguiente ronda ({sala.rondaNum + 1} de {sala.maxRondas})
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
                <p className="hint">Esperando a que el anfitrión avance a la siguiente ronda...</p>
                <button className="secondary danger full" style={{ marginTop: '0.8rem' }} onClick={handleSalir}>
                  Salir de la sala
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 7. PODIO FINAL ONLINE */}
      {vista === 'sala' && sala && sala.estado === 'final' && (
        <section className="game">
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

          <div className="actions" style={{ marginTop: '1.5rem' }}>
            <button className="secondary danger full" onClick={handleSalir}>
              <Icon name="door" size={20} /> Salir al menú
            </button>
          </div>
        </section>
      )}
    </div>
  );
}