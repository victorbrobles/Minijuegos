// client/src/games/Pistas/PistasOnline.jsx
import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../components/Icon.jsx';
import './Pistas.css';
import { MenuInicioJuego, MenuModoOnline, FormCrearSala, FormUnirseSala, CabeceraSala, ListaSala, EsperandoAnfitrion } from '../../components/MenuJuego.jsx';
import { limitesOnline, textoSala } from '../limites.js';

const LIM_ON = limitesOnline('pistas');

const CLAVE_SESION_PISTAS = 'pistas_online_session';
const COLORES_JUGADOR = ['#3b82f6', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4', '#f97316', '#84cc16', '#6366f1'];
const colorJugador = (id) => COLORES_JUGADOR[(Number(id) - 1 + COLORES_JUGADOR.length * 10) % COLORES_JUGADOR.length];
const inicial = (n = '?') => n.trim().charAt(0).toUpperCase() || '?';

export default function PistasOnline({ onLocal, onSalir }) {
  const [vista, setVista] = useState('menu'); // 'menu' | 'online_menu' | 'crear' | 'unirse' | 'sala'
  const [nombre, setNombre] = useState('');
  const [codigoInput, setCodigoInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);
  const [modalSalir, setModalSalir] = useState(false);
  const [modalAyuda, setModalAyuda] = useState(false);

  const [sesion, setSesion] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(CLAVE_SESION_PISTAS));
    } catch {
      return null;
    }
  });

  const [sala, setSala] = useState(null);
  const [sinRed, setSinRed] = useState(false);
  const [miTexto, setMiTexto] = useState('');
  const [enviandoRespuesta, setEnviandoRespuesta] = useState(false);

  const intervalRef = useRef(null);
  const rondaIdRef = useRef(null);

  useEffect(() => {
    if (!sesion) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setSala(null);
      return;
    }

    let fallos = 0;
    let pedidas = 0;
    let aplicada = 0;
    const cerrar = (msg) => {
      sessionStorage.removeItem(CLAVE_SESION_PISTAS);
      setSesion(null);
      setSala(null);
      setSinRed(false);
      setVista('online_menu');
      setErrorMsg(msg);
    };
    const consultarEstado = () => {
      const n = ++pedidas;
      fetch(`/api/pistas/online/sala/${sesion.code}?token=${sesion.token}`)
        .then(async (r) => {
          if (r.status === 404 || r.status === 403) {
            const d = await r.json().catch(() => ({}));
            cerrar(d.error || 'La sala se ha cerrado.');
            return;
          }
          if (!r.ok) throw new Error('red');
          const d = await r.json();
          if (n < aplicada) return;
          aplicada = n;
          fallos = 0;
          setSinRed(false);
          if (d.success) {
            setSala(d);
            setVista('sala');
          }
        })
        .catch(() => {
          fallos += 1;
          if (fallos >= 3) setSinRed(true);
          if (fallos >= 40) cerrar('Se ha perdido la conexión con la sala.');
        });
    };

    consultarEstado();
    intervalRef.current = setInterval(consultarEstado, 500);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sesion]);

  // Limpiar el input cuando cambia el número de ronda
  useEffect(() => {
    if (sala?.rondaNum && sala.rondaNum !== rondaIdRef.current) {
      rondaIdRef.current = sala.rondaNum;
      setMiTexto('');
      setEnviandoRespuesta(false);
    }
  }, [sala?.rondaNum]);

  const ronda = sala?.ronda;
  const esAdmin = sala?.esAdmin;
  const yoId = sala?.yoId;
  const miJugador = sala?.jugadores?.find((j) => j.id === yoId);
  const estoyBloqueado = Boolean(miJugador?.bloqueado);
  const yaHeAcertado = Boolean(miJugador?.acerto);
  const yaHeRespondido = Boolean(miJugador?.respondido || estoyBloqueado || yaHeAcertado);
  const sinVidas = sala?.modo === 'supervivencia' && (miJugador?.vidas ?? 0) <= 0;

  const handleCrear = async () => {
    if (!nombre.trim()) return;
    setErrorMsg('');
    setCargando(true);
    try {
      const res = await fetch('/api/pistas/online/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear la sala.');

      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_PISTAS, JSON.stringify(nueva));
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
      const res = await fetch('/api/pistas/online/unirse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codigoInput.trim().toUpperCase(), nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al unirse.');

      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_PISTAS, JSON.stringify(nueva));
      setSesion(nueva);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleCambiarModo = async (nuevoModo) => {
    if (!sesion || !sala?.esAdmin) return;
    try {
      await fetch(`/api/pistas/online/sala/${sesion.code}/modo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token, modo: nuevoModo })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleExpulsar = async (jugadorId) => {
    if (!sesion) return;
    try {
      await fetch(`/api/pistas/online/sala/${sesion.code}/expulsar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token, jugadorId })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleIniciarJuego = async () => {
    if (!sesion) return;
    try {
      await fetch(`/api/pistas/online/sala/${sesion.code}/iniciar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token })
      });
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleEnviarRespuestaDirecta = async (e) => {
    if (e) e.preventDefault();
    const textoLimpio = miTexto.trim();
    if (!textoLimpio || !sesion || yaHeRespondido || sinVidas || enviandoRespuesta) return;

    setEnviandoRespuesta(true);
    try {
      await fetch(`/api/pistas/online/sala/${sesion.code}/responder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token, respuesta: textoLimpio })
      });
      setMiTexto('');
    } catch (err) {
      console.error(err);
    } finally {
      setEnviandoRespuesta(false);
    }
  };

  const handleSiguienteRonda = async () => {
    if (!sesion) return;
    try {
      setMiTexto('');
      await fetch(`/api/pistas/online/sala/${sesion.code}/siguiente-ronda`, {
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
      await fetch(`/api/pistas/online/sala/${sesion.code}/finalizar`, {
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
      await fetch(`/api/pistas/online/sala/${sesion.code}/reiniciar`, {
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
        await fetch(`/api/pistas/online/sala/${sesion.code}/salir`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: sesion.token }),
          keepalive: true
        });
      } catch {
        /* ignorar */
      }
    }
    sessionStorage.removeItem(CLAVE_SESION_PISTAS);
    setSesion(null);
    setSala(null);
    setVista('online_menu');
  };

  const ranking = [...(sala?.jugadores || [])].sort((a, b) => (b.puntos ?? 0) - (a.puntos ?? 0));
  const maximoPuntos = ranking.length ? (ranking[0].puntos ?? 0) : 0;
  const enPartidaActiva = vista === 'sala' && sala && sala.estado !== 'lobby';

  return (
    <div className={`pts-contenedor ${enPartidaActiva ? 'qq-en-partida' : ''}`}>
      {sinRed && <div className="ptp-sin-red">📶 Reconectando con la sala…</div>}

      {/* MODAL DE AYUDA */}
      {modalAyuda && (
        <div className="rg-modal-fondo" onClick={() => setModalAyuda(false)}>
          <div className="rg-modal ptp-modal-ayuda" onClick={(e) => e.stopPropagation()}>
            <div className="ptp-modal-ayuda-header">
              <span className="ptp-ayuda-badge">❓ Cómo jugar</span>
              <h3>6 Pistas</h3>
            </div>

            <div className="ptp-modal-ayuda-body">
              <p>Descubre el personaje, película, lugar o canción secreta antes que los demás.</p>
              <ul>
                <li><strong>6 pistas progresivas:</strong> Se descubre una nueva pista cada <strong>10 segundos</strong>.</li>
                <li><strong>Respuesta secreta en cualquier momento:</strong> Escribe y envía tu respuesta cuando quieras desde tu móvil. Los demás solo verán un icono de que ya has respondido (✅), pero no sabrán qué has puesto ni si has acertado hasta que termine la ronda.</li>
                <li><strong>Fin de ronda automático:</strong> Cuando todos hayan respondido o se acabe el tiempo de la 6.ª pista, se mostrará la solución y las puntuaciones.</li>
              </ul>
            </div>

            <button type="button" className="ptp-boton" onClick={() => setModalAyuda(false)}>
              ¡Entendido!
            </button>
          </div>
        </div>
      )}

      {/* 1. MENÚ PRINCIPAL */}
      {vista === 'menu' && (
        <MenuInicioJuego
          juegoId="pistas"
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

      {/* 4. SALA: LOBBY */}
      {vista === 'sala' && sala && sala.estado === 'lobby' && (
        <section className="game qq-pantalla">
          <CabeceraSala codigo={sala.code} onVolver={() => setModalSalir(true)} onAyuda={() => setModalAyuda(true)} />

          <div className="panel qq-menu-panel" style={{ marginTop: '1rem' }}>
            <h3 className="qq-sala-titulo"><Icon name="dice" size={20} /> Modo de juego</h3>
            {esAdmin ? (
              <div className="pts-selector-modo">
                <button
                  type="button"
                  className={`pts-btn-modo ${sala.modo === 'estandar' ? 'activo' : ''}`}
                  onClick={() => handleCambiarModo('estandar')}
                >
                  🏆 Estándar (Puntos)
                </button>
                <button
                  type="button"
                  className={`pts-btn-modo ${sala.modo === 'supervivencia' ? 'activo' : ''}`}
                  onClick={() => handleCambiarModo('supervivencia')}
                >
                  💀 Supervivencia (Vidas ❤️)
                </button>
              </div>
            ) : (
              <p className="hint" style={{ fontWeight: 700 }}>
                Modo seleccionado: {sala.modo === 'supervivencia' ? '💀 Supervivencia (Vidas ❤️)' : '🏆 Estándar (Por Puntos)'}
              </p>
            )}
          </div>

          <ListaSala
            jugadores={sala.jugadores} yoId={yoId} min={LIM_ON.min} max={LIM_ON.max} anfitrionId={sala.anfitrionId}
            renderExtra={(j) => (
              <span className="ptp-sala-extra">
                {!j.conectado && <span className="ptp-sin-conexion" title="Sin conexión">📵</span>}
                {esAdmin && j.id !== yoId && (
                  <button type="button" className="ptp-quitar" onClick={() => handleExpulsar(j.id)}>Quitar</button>
                )}
              </span>
            )}
          />

          {esAdmin ? (
            <div style={{ marginTop: '1.2rem' }}>
              <button
                className="big full qq-btn-principal"
                disabled={sala.jugadores.length < LIM_ON.min}
                onClick={handleIniciarJuego}
              >
                <Icon name="play" size={22} />
                {sala.jugadores.length < LIM_ON.min ? 'Esperando jugadores...' : '¡Empezar Partida!'}
              </button>
            </div>
          ) : (
            <EsperandoAnfitrion texto="En cuanto el anfitrión empiece, verás aparecer las pistas." />
          )}
        </section>
      )}

      {/* 5. SALA: PODIO FINAL */}
      {vista === 'sala' && sala && sala.estado === 'final' && (
        <section className="game ptp-escena">
          <div className="end-card">
            <span className="end-icon"><Icon name="crown" size={44} /></span>
            <h1 className="title">Puntuaciones finales</h1>
            <p className="categoria"><Icon name="flagFinish" size={16} /> Partida finalizada</p>

            <div className="scoreboard" style={{ marginTop: '1.2rem' }}>
              {ranking.map((j, idx) => (
                <div key={j.id} className={`score-row ${idx === 0 && maximoPuntos > 0 ? 'first' : ''}`}>
                  <span className="score-name">
                    {idx === 0 && maximoPuntos > 0 ? <Icon name="crown" size={22} /> : <span className="pos">{idx + 1}</span>}
                    {j.nombre} {j.id === yoId ? '(Tú)' : ''}
                  </span>
                  <span className="score-pts">
                    {sala.modo === 'estandar' ? `${j.puntos} pts` : `${j.vidas > 0 ? '❤️'.repeat(j.vidas) : '💀 Eliminado'}`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="ptp-barra estatica">
            {esAdmin && (
              <button type="button" className="ptp-boton grande" onClick={handleReiniciarPartida}>
                <Icon name="refresh" size={20} /> Otra Partida (mismos jugadores)
              </button>
            )}
            <button type="button" className="ptp-boton secundario" onClick={() => setModalSalir(true)}>
              <Icon name="door" size={20} /> Salir de la sala
            </button>
          </div>
        </section>
      )}

      {/* 6A. SALA: JUGANDO ONLINE (RONDA ACTIVA) */}
      {vista === 'sala' && sala && sala.estado === 'jugando' && ronda && ronda.estadoRonda === 'activa' && (
        <section className="game ptp-escena">
          <header className="ptp-hero">
            <span className="ptp-hero-deco" aria-hidden="true">
              <Icon name="detective" size={140} strokeWidth={1.3} />
            </span>
            <div className="ptp-hero-top">
              <button type="button" className="ptp-salir" onClick={() => setModalSalir(true)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                <span>Portada</span>
              </button>
              <div className="ptp-hero-chips">
                <span className="ptp-chip"><Icon name="flagFinish" size={14} /> Ronda {sala.rondaNum}</span>
                <span className="ptp-chip">
                  {sala.modo === 'estandar'
                    ? `Pista ${ronda.pistasReveladas}/6 · +${6 - ronda.pistasReveladas + 1} pts`
                    : `Supervivencia · ${ronda.pistasReveladas}/6`}
                </span>
              </div>
            </div>

            <ol className="ptp-marcador" aria-label="Estado de los jugadores">
              {sala.jugadores.map((j) => {
                const haRespondido = Boolean(j.respondido || j.acerto || j.bloqueado);
                const eliminadoSupervivencia = sala.modo === 'supervivencia' && j.vidas <= 0;
                return (
                  <li
                    key={j.id}
                    className={`ptp-jugador${haRespondido ? ' respondido' : ''}${j.id === yoId ? ' yo' : ''}${eliminadoSupervivencia ? ' eliminado' : ''}`}
                    style={{ '--c': colorJugador(j.id) }}
                  >
                    <span className="ptp-jugador-avatar">{inicial(j.nombre)}</span>
                    <span className="ptp-jugador-datos">
                      <span className="ptp-jugador-nombre">
                        {j.nombre}{j.id === yoId ? ' (tú)' : ''}
                      </span>
                      <span className="ptp-jugador-linea">
                        <strong>
                          {sala.modo === 'estandar'
                            ? `${j.puntos} pts`
                            : j.vidas > 0
                            ? '♥'.repeat(j.vidas)
                            : 'Eliminado'}
                        </strong>
                      </span>
                    </span>
                    <span
                      className="ptp-jugador-estado"
                      title={haRespondido ? 'Ya ha respondido' : 'Pendiente de responder'}
                    >
                      {haRespondido ? '✅' : '⏳'}
                    </span>
                  </li>
                );
              })}
            </ol>
          </header>

          {/* Barra de tiempo */}
          <div className={`ptp-tiempo ${ronda.segundosRestantes <= 3 ? 'critico' : ''}`} role="timer">
            <div className="ptp-tiempo-barra">
              <span style={{ width: `${(ronda.segundosRestantes / 10) * 100}%` }} />
            </div>
            <span className="ptp-tiempo-num">
              <Icon name="clock" size={15} /> {Math.ceil(ronda.segundosRestantes)}s
            </span>
          </div>

          {/* Pistas descubiertas */}
          <div className="ptp-tarjeta">
            <div className="ptp-tarjeta-cab">
              <p className="ptp-etiqueta">Pistas descubiertas</p>
              <span className="ptp-badge-pista">{ronda.pistasReveladas} de 6</span>
            </div>
            <div className="ptp-pistas-lista">
              {ronda.pistas.slice(0, ronda.pistasReveladas).map((pistaTexto, idx) => {
                const esUltima = idx === ronda.pistasReveladas - 1;
                return (
                  <div key={idx} className={`ptp-pista-item ${esUltima ? 'actual' : ''}`}>
                    <span className="ptp-pista-numero">{idx + 1}</span>
                    <p className="ptp-pista-txt">{pistaTexto}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Caja de respuesta individual */}
          <div className="ptp-tarjeta ptp-online-respuesta">
            {!yaHeRespondido && !sinVidas ? (
              <form onSubmit={handleEnviarRespuestaDirecta} className="ptp-form-online">
                <label className="ptp-etiqueta" htmlFor="ptp-online-input">
                  Tu respuesta (puedes enviarla en cualquier momento)
                </label>
                <input
                  id="ptp-online-input"
                  type="text"
                  className="ptp-input"
                  placeholder="Escribe el personaje, película, canción…"
                  value={miTexto}
                  onChange={(e) => setMiTexto(e.target.value)}
                  disabled={enviandoRespuesta}
                  autoComplete="off"
                />
                <button
                  type="submit"
                  className="ptp-boton"
                  disabled={!miTexto.trim() || enviandoRespuesta}
                >
                  <Icon name="check" size={20} /> Enviar respuesta
                </button>
              </form>
            ) : (
              <div className={`ptp-estado-mi-respuesta ${yaHeAcertado ? 'acierto' : 'bloqueado'}`}>
                <span className="ptp-estado-icono">
                  {sinVidas ? '💀' : yaHeAcertado ? '🎉' : '❌'}
                </span>
                <div>
                  <strong>
                    {sinVidas
                      ? 'Estás eliminado de la partida'
                      : yaHeAcertado
                      ? '¡Has acertado el enigma!'
                      : 'Has fallado en esta ronda'}
                  </strong>
                  <p>
                    {sinVidas
                      ? 'Espera a que tus compañeros terminen la ronda.'
                      : 'Los demás solo ven un ✅ junto a tu nombre. La ronda terminará cuando todos respondan o se agote el tiempo.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 6B. SALA: FIN DE LA RONDA (AUTOMÁTICO CUANDO TODOS RESPONDEN O ACABA EL TIEMPO) */}
      {vista === 'sala' && sala && sala.estado === 'jugando' && ronda && ronda.estadoRonda === 'resuelta' && (
        <section className="game ptp-escena">
          <header className="ptp-hero">
            <span className="ptp-hero-deco" aria-hidden="true">
              <Icon name="trophy" size={140} strokeWidth={1.3} />
            </span>
            <div className="ptp-hero-top">
              <button type="button" className="ptp-salir" onClick={() => setModalSalir(true)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                <span>Salir</span>
              </button>
              <span className="ptp-chip"><Icon name="flagFinish" size={14} /> Fin de la ronda {sala.rondaNum}</span>
            </div>
            <p className="ptp-etiqueta" style={{ color: 'rgba(255,255,255,0.85)' }}>La respuesta correcta era</p>
            <h2 className="ptp-solucion-titulo">{ronda.solucion}</h2>
          </header>

          <div className="ptp-tarjeta">
            <p className="ptp-etiqueta">Resumen de la ronda</p>
            <div className="ptp-resumen-lista">
              {ronda.acertados && ronda.acertados.length > 0 ? (
                ronda.acertados.map((a) => (
                  <div key={a.jugadorId} className="ptp-acierto-item">
                    <span>🎉 <strong>{a.nombre}</strong> acertó en la pista #{a.pistaNum}</span>
                    <strong>
                      {sala.modo === 'estandar'
                        ? `+${a.puntos} pts`
                        : a.deltaVidas > 0
                        ? '+1 ❤️'
                        : a.deltaVidas < 0
                        ? '-1 ❤️'
                        : 'Mantiene ❤️'}
                    </strong>
                  </div>
                ))
              ) : (
                <p className="hint" style={{ margin: '0.4rem 0' }}>Nadie ha conseguido adivinar este enigma.</p>
              )}
            </div>
          </div>

          <div className="ptp-tarjeta">
            <p className="ptp-etiqueta">Clasificación general</p>
            <ol className="ptp-ranking">
              {ranking.map((j, i) => {
                const pts = j.puntos ?? 0;
                const v = j.vidas ?? 0;
                const esLider = maximoPuntos > 0 && pts === maximoPuntos && sala.modo === 'estandar';
                return (
                  <li key={j.id} className={esLider ? 'lider' : ''} style={{ '--c': colorJugador(j.id) }}>
                    <span className="ptp-ranking-pos">{esLider ? <Icon name="crown" size={18} /> : i + 1}</span>
                    <span className="ptp-jugador-avatar">{inicial(j.nombre)}</span>
                    <span className="ptp-ranking-nombre">
                      {j.nombre}{j.id === yoId ? ' (tú)' : ''}
                    </span>
                    <strong>{sala.modo === 'estandar' ? `${pts} pts` : v > 0 ? '❤️'.repeat(v) : '💀 Eliminado'}</strong>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="ptp-barra estatica">
            {esAdmin ? (
              <>
                <button type="button" className="ptp-boton grande" onClick={handleSiguienteRonda}>
                  <Icon name="play" size={20} /> Siguiente ronda ({sala.rondaNum + 1})
                </button>
                <button type="button" className="ptp-enlace" onClick={handleFinalizarPartida}>
                  <Icon name="trophy" size={16} /> Finalizar partida
                </button>
              </>
            ) : (
              <p className="ptp-espera">Esperando a que el anfitrión inicie la siguiente ronda o finalice la partida…</p>
            )}
          </div>
        </section>
      )}

      {/* MODAL DE CONFIRMACIÓN PARA SALIR */}
      {modalSalir && (
        <div className="rg-modal-fondo" onClick={() => setModalSalir(false)}>
          <div className="rg-modal ptp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ptp-modal-icono">🚪</div>
            <h3>¿Salir de la sala?</h3>
            <p className="hint">Si sales ahora abandonarás la partida en curso. ¿Estás seguro?</p>

            <div className="ptp-fila-botones">
              <button type="button" className="ptp-boton secundario" onClick={() => setModalSalir(false)}>
                Quedarme
              </button>
              <button
                type="button"
                className="ptp-boton peligro"
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