// client/src/games/ConfianzaCiega/ConfianzaCiegaOnline.jsx
import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../components/Icon.jsx';
import './ConfianzaCiega.css';

const CLAVE_SESION_CC = 'confianzaciega_online_session';

export default function ConfianzaCiegaOnline({ onLocal, onSalir }) {
  const [vista, setVista] = useState('menu'); // 'menu' | 'crear' | 'unirse' | 'sala'
  const [nombre, setNombre] = useState('');
  const [codigoInput, setCodigoInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);
  const [modalSalir, setModalSalir] = useState(false);

  const [sesion, setSesion] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(CLAVE_SESION_CC));
    } catch {
      return null;
    }
  });

  const [sala, setSala] = useState(null);
  const [codigoCopiado, setCodigoCopiado] = useState(false);

  // Estados de apuesta en este dispositivo
  const [apuestaNumero, setApuestaNumero] = useState(5);
  const [apuestaCondicion, setApuestaCondicion] = useState('mas');

  const intervalRef = useRef(null);

  useEffect(() => {
    if (!sesion) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setSala(null);
      return;
    }

    const consultarEstado = () => {
      fetch(`/api/confianzaciega/online/sala/${sesion.code}?token=${sesion.token}`)
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
          sessionStorage.removeItem(CLAVE_SESION_CC);
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
      const res = await fetch('/api/confianzaciega/online/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear la sala.');

      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_CC, JSON.stringify(nueva));
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
      const res = await fetch('/api/confianzaciega/online/unirse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codigoInput.trim().toUpperCase(), nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al unirse.');

      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_CC, JSON.stringify(nueva));
      setSesion(nueva);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleCambiarPicantes = async (nuevoValor) => {
    if (!sesion || !sala?.esAdmin) return;
    try {
      await fetch(`/api/confianzaciega/online/sala/${sesion.code}/picantes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token, usarPicantes: nuevoValor })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleIniciarPartida = async () => {
    if (!sesion) return;
    try {
      await fetch(`/api/confianzaciega/online/sala/${sesion.code}/iniciar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token })
      });
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleElegirConsigna = async (consigna) => {
    if (!sesion) return;
    try {
      await fetch(`/api/confianzaciega/online/sala/${sesion.code}/elegir-consigna`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token, consigna })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleEnviarApuesta = async () => {
    if (!sesion) return;
    try {
      await fetch(`/api/confianzaciega/online/sala/${sesion.code}/apostar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: sesion.token,
          numero: apuestaNumero,
          condicion: apuestaCondicion
        })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAjustarContador = async (delta) => {
    if (!sesion) return;
    try {
      await fetch(`/api/confianzaciega/online/sala/${sesion.code}/ajustar-contador`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delta })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handlePararTiempo = async () => {
    if (!sesion) return;
    try {
      await fetch(`/api/confianzaciega/online/sala/${sesion.code}/parar-tiempo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmarResultados = async () => {
    if (!sesion) return;
    try {
      await fetch(`/api/confianzaciega/online/sala/${sesion.code}/confirmar-resultados`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token, aciertosFinales: sala.contadorAciertos })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSiguienteRonda = async () => {
    if (!sesion) return;
    try {
      await fetch(`/api/confianzaciega/online/sala/${sesion.code}/siguiente-ronda`, {
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
      await fetch(`/api/confianzaciega/online/sala/${sesion.code}/finalizar`, {
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
      await fetch(`/api/confianzaciega/online/sala/${sesion.code}/reiniciar`, {
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
        await fetch(`/api/confianzaciega/online/sala/${sesion.code}/salir`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: sesion.token })
        });
      } catch {
        /* ignorar */
      }
    }
    sessionStorage.removeItem(CLAVE_SESION_CC);
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
  const esActivo = Boolean(sala?.esActivo);
  const resultadoRonda = sala?.resultadoRonda;
  const ranking = [...(sala?.jugadores || [])].sort((a, b) => b.puntos - a.puntos);
  const maximoPuntos = ranking.length ? ranking[0].puntos : 0;
  const ganadores = maximoPuntos > 0 ? ranking.filter((j) => j.puntos === maximoPuntos) : [];

  return (
    <div className="aprox-contenedor">
      {/* 1. MENÚ PRINCIPAL */}
      {vista === 'menu' && (
        <section className="game">
          <div className="panel center">
            <span className="lb-luna chica">
              <Icon name="target" size={42} strokeWidth={1.6} />
            </span>
            <h1 className="title">Confianza Ciega</h1>
            <p className="hint">
              Apuesta cuántas palabras dirá tu compañero y pon a prueba tu intuición. El anfitrión crea la sala y comparte el código.
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
              <label className="field-label" htmlFor="cc-host-nombre">Tu nombre</label>
              <input
                id="cc-host-nombre"
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
              <label className="field-label" htmlFor="cc-code-input">Código de la sala</label>
              <input
                id="cc-code-input"
                className="lb-input-codigo"
                type="text"
                placeholder="ABCD"
                value={codigoInput}
                onChange={(e) => setCodigoInput(e.target.value.toUpperCase())}
                maxLength={4}
                style={{ textTransform: 'uppercase', letterSpacing: '4px', textAlign: 'center', fontWeight: '800' }}
                autoFocus
              />

              <label className="field-label" htmlFor="cc-guest-nombre" style={{ marginTop: '1rem' }}>Tu nombre</label>
              <input
                id="cc-guest-nombre"
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

          <div className="panel" style={{ marginTop: '1rem' }}>
            <h3 className="panel-title"><Icon name="target" size={20} /> Categorías picantes</h3>
            {esAdmin ? (
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#db2777', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer', marginTop: '0.4rem' }}>
                <input
                  type="checkbox"
                  checked={Boolean(sala.usarPicantes)}
                  onChange={(e) => handleCambiarPicantes(e.target.checked)}
                />
                <span>Incluir consignas picantes y comprometidas</span>
              </label>
            ) : (
              <p className="hint" style={{ fontWeight: 700 }}>
                {sala.usarPicantes ? '🌶️ Consignas picantes activadas' : '😊 Modo estándar'}
              </p>
            )}
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
              <p className="hint">El anfitrión iniciará la ronda en cuanto estéis todos.</p>
            </div>
          )}

          <div className="actions" style={{ marginTop: '1rem' }}>
            <button className="secondary danger full" onClick={() => setModalSalir(true)}>
              <Icon name="door" size={20} /> Salir de la sala
            </button>
          </div>
        </section>
      )}

      {/* 5. SALA: ELECCIÓN SECRETA DE CONSIGNA */}
      {vista === 'sala' && sala && sala.estado === 'eleccion_consigna' && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="flagFinish" size={18} />Ronda {sala.rondaActual}</span>
            <span className="chip alt">Turno de {sala.jugadorActivoNombre}</span>
          </div>

          {esActivo ? (
            <div className="panel">
              <h3 className="panel-title"><Icon name="eye" size={20} /> Elige tu consigna en secreto</h3>
              <p className="field-label">Los demás verán las dos opciones, pero solo tú sabrás cuál has elegido:</p>

              <div className="aprox-opciones-confianza" style={{ gridTemplateColumns: '1fr 1fr' }}>
                {sala.opcionesConsignas.map((consigna, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="aprox-btn-opcion-confianza"
                    onClick={() => handleElegirConsigna(consigna)}
                    style={{ textAlign: 'left', alignItems: 'flex-start', padding: '1.4rem' }}
                  >
                    <span className="aprox-badge-pregunta" style={{ marginBottom: '0.5rem' }}>Opción {idx + 1}</span>
                    <div className="aprox-pregunta-texto" style={{ fontSize: '1.2rem', textAlign: 'left' }}>{consigna}</div>
                    <span className="aprox-tag-confiar" style={{ marginTop: '1rem' }}>Elegir esta</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="panel center" style={{ padding: '2.5rem 1.5rem' }}>
              <span className="lb-luna chica"><Icon name="hourglass" size={40} /></span>
              <h2>{sala.jugadorActivoNombre} está eligiendo...</h2>
              <p className="hint">
                Está decidiendo en secreto qué consigna afrontar en su turno de 2 minutos.
              </p>
            </div>
          )}

          <div className="actions" style={{ marginTop: '1rem' }}>
            <button className="secondary danger full" onClick={() => setModalSalir(true)}>
              <Icon name="door" size={20} /> Salir de la sala
            </button>
          </div>
        </section>
      )}

      {/* 6. SALA: APUESTAS SIMULTÁNEAS */}
      {vista === 'sala' && sala && sala.estado === 'apuestas' && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="flagFinish" size={18} />Ronda {sala.rondaActual}</span>
            <span className="chip alt">
              <Icon name="target" size={18} /> {sala.totalApostaron} / {sala.totalApostadores} han apostado
            </span>
          </div>

          {esActivo ? (
            <div className="panel center" style={{ padding: '2.5rem 1.5rem' }}>
              <span className="lb-luna chica"><Icon name="users" size={40} /></span>
              <h2>Los demás están apostando sobre ti...</h2>
              <p className="hint">
                Has elegido: <strong>«{sala.consignaElegida}»</strong>. En cuanto todos emitan su apuesta arrancará tu turno de 2 minutos.
              </p>

              <div className="scoreboard-container" style={{ justifyContent: 'center', marginTop: '1rem' }}>
                {sala.jugadores.filter((j) => j.id !== sala.yoId).map((j) => (
                  <div key={j.id} className="score-pill">
                    <span>{j.nombre}</span>
                    <span style={{ marginLeft: '6px' }}>{j.haApostado ? '✅' : '⏳'}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="panel aprox-pregunta-card">
                <span className="aprox-badge-pregunta">Opciones de consigna</span>
                <p className="field-label" style={{ margin: '0.4rem 0 0.8rem' }}>
                  <strong>{sala.jugadorActivoNombre}</strong> ha elegido una de estas dos en secreto:
                </p>
                <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span className="chip" style={{ fontSize: '1rem', padding: '0.6rem 1rem' }}>{sala.opcionesConsignas[0]}</span>
                  <strong>ó</strong>
                  <span className="chip" style={{ fontSize: '1rem', padding: '0.6rem 1rem' }}>{sala.opcionesConsignas[1]}</span>
                </div>
              </div>

              {!sala.yaAposto ? (
                <div className="panel" style={{ textAlign: 'center' }}>
                  <h3 className="panel-title" style={{ justifyContent: 'center' }}>
                    ¿Cuántas palabras crees que dirá {sala.jugadorActivoNombre}?
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', margin: '1.2rem 0' }}>
                    <button
                      type="button"
                      className="aprox-btn-ayuda"
                      style={{ position: 'static', width: '48px', height: '48px', fontSize: '1.5rem' }}
                      onClick={() => setApuestaNumero(Math.max(0, apuestaNumero - 1))}
                    >
                      -
                    </button>
                    <span style={{ fontSize: '3.2rem', fontWeight: '900', color: '#4338ca', minWidth: '70px' }}>
                      {apuestaNumero}
                    </span>
                    <button
                      type="button"
                      className="aprox-btn-ayuda"
                      style={{ position: 'static', width: '48px', height: '48px', fontSize: '1.5rem' }}
                      onClick={() => setApuestaNumero(apuestaNumero + 1)}
                    >
                      +
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.2rem' }}>
                    <button
                      type="button"
                      className={`cc-btn-condicion ${apuestaCondicion === 'mas' ? 'activa' : ''}`}
                      onClick={() => setApuestaCondicion('mas')}
                    >
                      Más de {apuestaNumero}
                    </button>
                    <button
                      type="button"
                      className={`cc-btn-condicion ${apuestaCondicion === 'menos' ? 'activa' : ''}`}
                      onClick={() => setApuestaCondicion('menos')}
                    >
                      Menos de {apuestaNumero}
                    </button>
                  </div>

                  <button className="big full" style={{ marginTop: '1.5rem' }} onClick={handleEnviarApuesta}>
                    <Icon name="check" size={22} /> Confirmar mi apuesta
                  </button>
                </div>
              ) : (
                <div className="panel center" style={{ padding: '2rem 1rem' }}>
                  <span className="badge" style={{ background: '#dcfce7', color: '#166534', fontSize: '1rem', padding: '0.5rem 1rem' }}>
                    ✅ Has apostado: {sala.miApuesta?.condicion === 'mas' ? `Más de ${sala.miApuesta?.numero}` : `Menos de ${sala.miApuesta?.numero}`}
                  </span>
                  <p className="hint" style={{ marginTop: '1rem' }}>
                    Esperando a los demás ({sala.totalApostaron} de {sala.totalApostadores})...
                  </p>
                </div>
              )}
            </>
          )}

          <div className="actions" style={{ marginTop: '1rem' }}>
            <button className="secondary danger full" onClick={() => setModalSalir(true)}>
              <Icon name="door" size={20} /> Salir de la sala
            </button>
          </div>
        </section>
      )}

      {/* 7. SALA: TURNO DE ACCIÓN */}
      {vista === 'sala' && sala && sala.estado === 'turno_accion' && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="flagFinish" size={18} />Ronda {sala.rondaActual}</span>
            <span className="chip alt">
              <Icon name="clock" size={18} />
              {sala.prepRestante > 0 ? 'Preparación (10s)' : '¡Tiempo en marcha!'}
            </span>
          </div>

          <div className="panel aprox-pregunta-card">
            <span className="aprox-badge-pregunta">Consigna en juego</span>
            <h2 className="aprox-pregunta-texto" style={{ color: '#4338ca', fontSize: '1.8rem' }}>
              {sala.consignaElegida}
            </h2>
            <p className="field-label" style={{ marginTop: '0.6rem' }}>
              <strong>{sala.jugadorActivoNombre}</strong> está diciendo palabras en voz alta durante 2 minutos.
            </p>
          </div>

          <div className="timer" role="timer">
            <div
              className={`timer-bar ${sala.prepRestante === 0 && sala.accionRestante <= 10 ? 'low' : ''}`}
              style={{ width: `${sala.prepRestante > 0 ? 100 : (sala.accionRestante / 120) * 100}%` }}
            />
          </div>
          <p className="timer-text">
            <Icon name="clock" size={16} />
            {sala.prepRestante > 0 ? `Preparados… ${sala.prepRestante} s` : `${sala.accionRestante} s`}
          </p>

          <div className="panel" style={{ textAlign: 'center', marginTop: '1rem' }}>
            <span className="field-label">Palabras válidas aprobadas:</span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', margin: '0.8rem 0' }}>
              {esAdmin && (
                <button
                  type="button"
                  className="aprox-btn-ayuda"
                  style={{ position: 'static', width: '52px', height: '52px', fontSize: '1.5rem' }}
                  disabled={sala.prepRestante > 0}
                  onClick={() => handleAjustarContador(-1)}
                >
                  -1
                </button>
              )}
              <span style={{ fontSize: '3.5rem', fontWeight: '900', color: '#10b981', minWidth: '80px' }}>
                {sala.contadorAciertos}
              </span>
              {esAdmin && (
                <button
                  type="button"
                  className="aprox-btn-ayuda"
                  style={{ position: 'static', width: '52px', height: '52px', fontSize: '1.5rem' }}
                  disabled={sala.prepRestante > 0}
                  onClick={() => handleAjustarContador(1)}
                >
                  +1
                </button>
              )}
            </div>
            {!esAdmin && (
              <p className="hint small">El anfitrión está llevando la cuenta de los aciertos.</p>
            )}
          </div>

          {esAdmin && (
            <div className="actions" style={{ marginTop: '1rem' }}>
              <button
                className="secondary danger full"
                disabled={sala.prepRestante > 0}
                onClick={handlePararTiempo}
              >
                <Icon name="flagFinish" size={20} /> Parar tiempo
              </button>
            </div>
          )}

          <div className="actions" style={{ marginTop: '1rem' }}>
            <button className="secondary danger full" onClick={() => setModalSalir(true)}>
              <Icon name="door" size={20} /> Salir de la sala
            </button>
          </div>
        </section>
      )}

      {/* 8. SALA: VALIDACIÓN FINAL */}
      {vista === 'sala' && sala && sala.estado === 'validacion_final' && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="flagFinish" size={18} />Ronda {sala.rondaActual}</span>
            <span className="chip alt">Recuento final</span>
          </div>

          <div className="panel aprox-pregunta-card">
            <span className="aprox-badge-pregunta">Consigna</span>
            <h2 className="aprox-pregunta-texto">{sala.consignaElegida}</h2>
            <p className="field-label" style={{ marginTop: '0.8rem' }}>
              Palabras finales conseguidas por <strong>{sala.jugadorActivoNombre}</strong>:
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', margin: '1rem 0' }}>
              {esAdmin && (
                <button
                  type="button"
                  className="aprox-btn-ayuda"
                  style={{ position: 'static', width: '48px', height: '48px', fontSize: '1.5rem' }}
                  onClick={() => handleAjustarContador(-1)}
                >
                  -
                </button>
              )}
              <span style={{ fontSize: '3rem', fontWeight: '900', color: '#10b981', minWidth: '70px' }}>
                {sala.contadorAciertos}
              </span>
              {esAdmin && (
                <button
                  type="button"
                  className="aprox-btn-ayuda"
                  style={{ position: 'static', width: '48px', height: '48px', fontSize: '1.5rem' }}
                  onClick={() => handleAjustarContador(1)}
                >
                  +
                </button>
              )}
            </div>
          </div>

          {esAdmin ? (
            <button className="big full" onClick={handleConfirmarResultados}>
              <Icon name="check" size={22} /> Confirmar resultados y ver apuestas
            </button>
          ) : (
            <p className="hint center">El anfitrión está confirmando el recuento final...</p>
          )}

          <div className="actions" style={{ marginTop: '1rem' }}>
            <button className="secondary danger full" onClick={() => setModalSalir(true)}>
              <Icon name="door" size={20} /> Salir de la sala
            </button>
          </div>
        </section>
      )}

      {/* 9. SALA: RESULTADOS DE LA RONDA */}
      {vista === 'sala' && sala && sala.estado === 'resultados' && resultadoRonda && (
        <section className="game">
          <div className="end-card aprox-resolucion-card">
            <span className="end-icon"><Icon name="trophy" size={44} /></span>
            <p className="categoria">{resultadoRonda.consignaElegida}</p>
            <h1 className="title">
              Palabras conseguidas: <span className="aprox-num-correcto">{resultadoRonda.aciertosFinales}</span>
            </h1>

            <div className="aprox-resolucion-lista">
              {resultadoRonda.detalles.map((item) => (
                <div
                  key={item.jugadorId}
                  className={`aprox-fila-resultado cc-fila-${item.estadoColor}`}
                >
                  <div className="aprox-res-col-val">
                    <span className="aprox-res-num">
                      {item.condicion === 'mas' ? `> ${item.numero}` : `< ${item.numero}`}
                    </span>
                    <span className="aprox-res-dist">(dif: {item.diff})</span>
                  </div>

                  <div className="aprox-res-col-jugadores">
                    <div>
                      <strong>{item.nombre} {item.jugadorId === sala.yoId ? '(Tú)' : ''}</strong>{' '}
                      <span className="aprox-badge-pts">
                        {item.puntosGanados >= 0 ? `+${item.puntosGanados}` : item.puntosGanados} pts
                      </span>
                    </div>
                  </div>

                  <div className="aprox-res-etiqueta">
                    {item.estadoColor === 'azul' && '🎯 CLAVADO'}
                    {item.estadoColor === 'verde' && '✓ ACERTADA'}
                    {item.estadoColor === 'rojo' && '❌ FALLADA'}
                  </div>
                </div>
              ))}
            </div>

            <div className="scoreboard" style={{ marginTop: '1.5rem', width: '100%' }}>
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
                <button className="big full" onClick={handleSiguienteRonda}>
                  <Icon name="play" size={20} /> Siguiente ronda ({sala.rondaActual + 1})
                </button>
                <button className="secondary danger full" onClick={handleFinalizarPartida}>
                  <Icon name="flagFinish" size={20} /> Finalizar partida 🏆
                </button>
              </>
            ) : (
              <p className="hint center">Esperando a que el anfitrión avance a la siguiente ronda...</p>
            )}

            <button className="secondary danger full" onClick={() => setModalSalir(true)}>
              <Icon name="door" size={20} /> Salir de la sala
            </button>
          </div>
        </section>
      )}

      {/* 10. SALA: FINAL */}
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