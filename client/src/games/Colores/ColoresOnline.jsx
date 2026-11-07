// client/src/games/Colores/ColoresOnline.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import './Colores.css';

const CLAVE_SESION_COLORES = 'colores_online_session';
const TIEMPO_TURNO = 45;

const PALETA_COLORES = [
  { id: 'rojo', nombre: 'Rojo', hex: '#ef4444', textoHex: '#ffffff' },
  { id: 'azul', nombre: 'Azul', hex: '#2563eb', textoHex: '#ffffff' },
  { id: 'amarillo', nombre: 'Amarillo', hex: '#eab308', textoHex: '#0f172a' },
  { id: 'verde', nombre: 'Verde', hex: '#16a34a', textoHex: '#ffffff' },
  { id: 'naranja', nombre: 'Naranja', hex: '#ea580c', textoHex: '#ffffff' },
  { id: 'morado', nombre: 'Morado', hex: '#9333ea', textoHex: '#ffffff' },
  { id: 'marron', nombre: 'Marrón', hex: '#78350f', textoHex: '#ffffff' },
  { id: 'blanco', nombre: 'Blanco', hex: '#ffffff', textoHex: '#0f172a', borde: '#cbd5e1' },
  { id: 'negro', nombre: 'Negro', hex: '#0f172a', textoHex: '#ffffff' },
  { id: 'gris', nombre: 'Gris', hex: '#64748b', textoHex: '#ffffff' },
  { id: 'rosa', nombre: 'Rosa', hex: '#ec4899', textoHex: '#ffffff' }
];

function BotonVolver({ onClick, texto = 'Volver' }) {
  return (
    <button type="button" className="qq-link-volver" onClick={onClick}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      <span>{texto}</span>
    </button>
  );
}

export default function ColoresOnline({
  tituloJuego = 'La vida en colores',
  descripcionJuego,
  onLocal,
  onSalir,
  onAbrirAyuda
}) {
  const navigate = useNavigate();
  const [vista, setVista] = useState('menu'); // 'menu' | 'online_menu' | 'crear' | 'unirse' | 'sala'
  const [nombre, setNombre] = useState('');
  const [codigoInput, setCodigoInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);
  
  const [modalSalirLobby, setModalSalirLobby] = useState(false);
  const [modalSalirPortada, setModalSalirPortada] = useState(false);

  const [sesion, setSesion] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(CLAVE_SESION_COLORES));
    } catch {
      return null;
    }
  });

  const [sala, setSala] = useState(null);
  const [codigoCopiado, setCodigoCopiado] = useState(false);
  const [misColoresSeleccionados, setMisColoresSeleccionados] = useState([]);
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
      fetch(`/api/colores/online/sala/${sesion.code}?token=${sesion.token}`)
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
          sessionStorage.removeItem(CLAVE_SESION_COLORES);
          setSesion(null);
          setSala(null);
          setVista('online_menu');
          setErrorMsg('La sala se ha cerrado o se ha perdido la conexión.');
        });
    };
    consultarEstado();
    intervalRef.current = setInterval(consultarEstado, 500);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sesion]);

  useEffect(() => {
    setMisColoresSeleccionados([]);
  }, [sala?.rondaActualIdx, sala?.estado]);

  const redirigirAPortada = () => {
    if (typeof onSalir === 'function') {
      onSalir();
    } else {
      try {
        navigate('/');
      } catch {
        window.location.href = '/';
      }
    }
  };

  const handleCerrarSalaYSalirAPortada = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    const sesionActual = sesion;
    sessionStorage.removeItem(CLAVE_SESION_COLORES);
    setSesion(null);
    setSala(null);
    setModalSalirPortada(false);

    if (sesionActual?.code && sesionActual?.token) {
      fetch(`/api/colores/online/sala/${sesionActual.code}/salir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesionActual.token }),
        keepalive: true
      }).catch(() => {});
    }
    redirigirAPortada();
  };

  const handleVolverMenuOnline = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    const sesionActual = sesion;
    sessionStorage.removeItem(CLAVE_SESION_COLORES);
    setSesion(null);
    setSala(null);
    setModalSalirLobby(false);
    setVista('online_menu');

    if (sesionActual?.code && sesionActual?.token) {
      fetch(`/api/colores/online/sala/${sesionActual.code}/salir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesionActual.token }),
        keepalive: true
      }).catch(() => {});
    }
  };

  const handleCrear = async () => {
    if (!nombre.trim()) return;
    setErrorMsg('');
    setCargando(true);
    try {
      const res = await fetch('/api/colores/online/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear la sala.');
      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_COLORES, JSON.stringify(nueva));
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
      const res = await fetch('/api/colores/online/unirse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codigoInput.trim().toUpperCase(), nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al unirse.');
      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_COLORES, JSON.stringify(nueva));
      setSesion(nueva);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleIniciarJuego = async () => {
    if (!sesion) return;
    setMisColoresSeleccionados([]);
    try {
      await fetch(`/api/colores/online/sala/${sesion.code}/iniciar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token })
      });
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const toggleColorOnline = (colorId) => {
    if (sala?.ronda?.yaRespondio) return;
    const numMax = sala?.ronda?.numColores || 1;
    if (misColoresSeleccionados.includes(colorId)) {
      setMisColoresSeleccionados(misColoresSeleccionados.filter((c) => c !== colorId));
    } else {
      if (misColoresSeleccionados.length < numMax) {
        setMisColoresSeleccionados([...misColoresSeleccionados, colorId]);
      }
    }
  };

  const handleEnviarRespuesta = async (forzado = false) => {
    if (!sesion) return;
    if (!forzado && misColoresSeleccionados.length !== sala?.ronda?.numColores) return;
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      await fetch(`/api/colores/online/sala/${sesion.code}/responder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token, colores: misColoresSeleccionados })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleEnviarRespuestaRef = useRef();
  useEffect(() => {
    handleEnviarRespuestaRef.current = handleEnviarRespuesta;
  });

  useEffect(() => {
    const isVotando = sala?.estado === 'jugando' && sala?.ronda?.estadoRonda === 'votando';
    if (!isVotando || sala?.ronda?.yaRespondio) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    setTiempoRestante(TIEMPO_TURNO);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          if (handleEnviarRespuestaRef.current) handleEnviarRespuestaRef.current(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sala?.estado, sala?.ronda?.estadoRonda, sala?.ronda?.yaRespondio, sala?.rondaActualIdx]);

  const handleCerrarRonda = async () => {
    if (!sesion) return;
    try {
      await fetch(`/api/colores/online/sala/${sesion.code}/cerrar-ronda`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSiguienteRonda = async () => {
    if (!sesion) return;
    setMisColoresSeleccionados([]);
    try {
      await fetch(`/api/colores/online/sala/${sesion.code}/siguiente-ronda`, {
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
      await fetch(`/api/colores/online/sala/${sesion.code}/finalizar`, {
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
      await fetch(`/api/colores/online/sala/${sesion.code}/reiniciar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const copiarCodigo = () => {
    if (!sala?.code) return;
    navigator.clipboard?.writeText(sala.code);
    setCodigoCopiado(true);
    setTimeout(() => setCodigoCopiado(false), 2000);
  };

  const ronda = sala?.ronda;
  const esAdmin = Boolean(sala?.esAdmin);
  const resultadoRonda = ronda?.resultadoRonda;
  const ranking = [...(sala?.jugadores || [])].sort((a, b) => b.puntos - a.puntos);
  const maximoPuntos = ranking.length ? ranking[0].puntos : 0;
  const ganadores = maximoPuntos > 0 ? ranking.filter((j) => j.puntos === maximoPuntos) : [];
  const enPartidaActiva = vista === 'sala' && sala && sala.estado !== 'lobby';

  return (
    <div className={`colores-contenedor ${enPartidaActiva ? 'qq-en-partida' : ''}`}>
      {/* 1. MENÚ PRINCIPAL */}
      {vista === 'menu' && (
        <section className="game">
          <div className="panel center qq-menu-panel">
            <div className="qq-card-top solo-derecha">
              <button
                type="button"
                className="qq-btn-ayuda"
                onClick={onAbrirAyuda}
                title="Cómo jugar"
                aria-label="Cómo jugar"
              >
                ?
              </button>
            </div>

            <div className="qq-hero-icono">
              <Icon name="star" size={44} strokeWidth={1.6} />
            </div>
            <h1 className="title qq-main-title">{tituloJuego}</h1>
            <p className="hint qq-main-desc">{descripcionJuego}</p>

            {errorMsg && <p className="error" style={{ margin: '0.8rem 0' }}>{errorMsg}</p>}

            <div className="qq-menu-opciones">
              <button
                type="button"
                className="qq-opcion-card principal"
                onClick={() => {
                  setVista('online_menu');
                  setErrorMsg('');
                }}
              >
                <span className="qq-opcion-icono">
                  <Icon name="globe" size={26} />
                </span>
                <div className="qq-opcion-textos">
                  <strong>Jugar online</strong>
                  <span>Cada jugador desde su propio móvil con código de sala</span>
                </div>
              </button>

              <button
                type="button"
                className="qq-opcion-card secundaria"
                onClick={onLocal}
              >
                <span className="qq-opcion-icono">
                  <Icon name="users" size={26} />
                </span>
                <div className="qq-opcion-textos">
                  <strong>Jugar en un único dispositivo</strong>
                  <span>Pasando el móvil por turnos respondiendo en secreto</span>
                </div>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 1B. SUBMENÚ ONLINE */}
      {vista === 'online_menu' && (
        <section className="game">
          <div className="panel center qq-menu-panel">
            <div className="qq-card-top">
              <BotonVolver
                onClick={() => {
                  setVista('menu');
                  setErrorMsg('');
                }}
              />
              <button
                type="button"
                className="qq-btn-ayuda"
                onClick={onAbrirAyuda}
                title="Cómo jugar"
                aria-label="Cómo jugar"
              >
                ?
              </button>
            </div>

            <div className="qq-hero-icono">
              <Icon name="globe" size={40} strokeWidth={1.7} />
            </div>
            <h2 className="title qq-main-title">Modo Online</h2>
            <p className="hint qq-main-desc">
              Crea una sala nueva para compartir el código con tus amigos o únete a una ya creada.
            </p>

            <div className="qq-menu-opciones">
              <button
                type="button"
                className="qq-opcion-card principal"
                onClick={() => {
                  setVista('crear');
                  setErrorMsg('');
                }}
              >
                <span className="qq-opcion-icono">
                  <Icon name="crown" size={26} />
                </span>
                <div className="qq-opcion-textos">
                  <strong>Crear partida</strong>
                  <span>Sé el anfitrión, genera un código y administra las rondas</span>
                </div>
              </button>

              <button
                type="button"
                className="qq-opcion-card secundaria"
                onClick={() => {
                  setVista('unirse');
                  setErrorMsg('');
                }}
              >
                <span className="qq-opcion-icono">
                  <Icon name="users" size={26} />
                </span>
                <div className="qq-opcion-textos">
                  <strong>Unirse con código</strong>
                  <span>Introduce el código de 4 letras de tu anfitrión</span>
                </div>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 2. CREAR SALA */}
      {vista === 'crear' && (
        <section className="game">
          <div className="panel center qq-menu-panel">
            <div className="qq-card-top">
              <BotonVolver
                onClick={() => {
                  setVista('online_menu');
                  setErrorMsg('');
                }}
              />
              <button
                type="button"
                className="qq-btn-ayuda"
                onClick={onAbrirAyuda}
                title="Cómo jugar"
                aria-label="Cómo jugar"
              >
                ?
              </button>
            </div>

            <div className="qq-hero-icono">
              <Icon name="crown" size={40} strokeWidth={1.6} />
            </div>
            <h2 className="title qq-main-title">Crear partida</h2>
            <p className="hint qq-main-desc">
              Introduce tu nombre para abrir la sala y ser el anfitrión.
            </p>

            <div className="lb-form qq-form-estilizado">
              <label className="field-label" htmlFor="col-host-nombre">Tu nombre</label>
              <input
                id="col-host-nombre"
                className="qq-input-moderno"
                type="text"
                placeholder="Ej. Alex"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                maxLength={20}
                autoFocus
              />
              {errorMsg && <p className="error">{errorMsg}</p>}

              <button
                className="big full qq-btn-principal"
                disabled={cargando || !nombre.trim()}
                onClick={handleCrear}
              >
                <Icon name="check" size={22} strokeWidth={2.5} /> Crear sala
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 3. UNIRSE A SALA */}
      {vista === 'unirse' && (
        <section className="game">
          <div className="panel center qq-menu-panel">
            <div className="qq-card-top">
              <BotonVolver
                onClick={() => {
                  setVista('online_menu');
                  setErrorMsg('');
                }}
              />
              <button
                type="button"
                className="qq-btn-ayuda"
                onClick={onAbrirAyuda}
                title="Cómo jugar"
                aria-label="Cómo jugar"
              >
                ?
              </button>
            </div>

            <div className="qq-hero-icono">
              <Icon name="users" size={40} strokeWidth={1.6} />
            </div>
            <h2 className="title qq-main-title">Unirse a partida</h2>
            <p className="hint qq-main-desc">
              Introduce el código que te ha compartido el anfitrión y tu nombre.
            </p>

            <div className="lb-form qq-form-estilizado">
              <label className="field-label" htmlFor="col-code-input">Código de la sala</label>
              <input
                id="col-code-input"
                className="lb-input-codigo qq-input-moderno"
                type="text"
                placeholder="ABCD"
                value={codigoInput}
                onChange={(e) => setCodigoInput(e.target.value.toUpperCase())}
                maxLength={4}
                autoFocus
              />

              <label className="field-label" htmlFor="col-guest-nombre" style={{ marginTop: '1rem' }}>Tu nombre</label>
              <input
                id="col-guest-nombre"
                className="qq-input-moderno"
                type="text"
                placeholder="Tu nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                maxLength={20}
              />
              {errorMsg && <p className="error">{errorMsg}</p>}

              <button
                className="big full qq-btn-principal"
                disabled={cargando || !nombre.trim() || codigoInput.trim().length < 4}
                onClick={handleUnirse}
              >
                <Icon name="check" size={22} strokeWidth={2.5} /> Entrar en la partida
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 4. SALA DE ESPERA (LOBBY) */}
      {vista === 'sala' && sala && sala.estado === 'lobby' && (
        <section className="game">
          <div className="panel center qq-menu-panel">
            <div className="qq-card-top">
              <BotonVolver onClick={() => setModalSalirLobby(true)} />
              <button
                type="button"
                className="qq-btn-ayuda"
                onClick={onAbrirAyuda}
                title="Cómo jugar"
                aria-label="Cómo jugar"
              >
                ?
              </button>
            </div>

            <p className="categoria"><Icon name="lock" size={16} /> Sala de espera</p>
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
            {sala.jugadores.length < 2 && (
              <p className="hint" style={{ marginTop: '0.8rem' }}>
                Falta al menos 1 jugador más para poder empezar.
              </p>
            )}
          </div>

          {esAdmin ? (
            <div style={{ marginTop: '1.2rem' }}>
              <button
                className="big full qq-btn-principal"
                disabled={sala.jugadores.length < 2}
                onClick={handleIniciarJuego}
              >
                <Icon name="play" size={22} />
                {sala.jugadores.length < 2 ? 'Esperando jugadores...' : '¡Empezar Partida (25 Rondas)!'}
              </button>
            </div>
          ) : (
            <div className="panel center" style={{ padding: '2rem 1.5rem', marginTop: '1rem' }}>
              <span className="lb-luna chica"><Icon name="hourglass" size={40} /></span>
              <h3 style={{ margin: '0.5rem 0' }}>Esperando al anfitrión...</h3>
              <p className="hint">En cuanto comience la partida, verás el primer elemento para elegir sus colores.</p>
            </div>
          )}
        </section>
      )}

      {/* 5. JUGANDO ONLINE */}
      {vista === 'sala' && sala && sala.estado === 'jugando' && ronda && (
        <section className="game">
          <div className="panel qq-menu-panel">
            <div className="qq-card-top" style={{ marginBottom: '0.8rem' }}>
              <BotonVolver texto="Volver a la portada" onClick={() => setModalSalirPortada(true)} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="qq-tablero-badge" style={{ marginBottom: 0 }}>
                  Ronda {sala.rondaActualIdx + 1} de {sala.totalRondas}
                </span>
                <span className="qq-tablero-badge" style={{ marginBottom: 0, background: '#f8fafc', color: '#1e293b', borderColor: '#e2e8f0' }}>
                  <Icon name="check" size={14} /> {ronda.totalRespondieron}/{ronda.totalJugadores} listos
                </span>
              </div>
            </div>

            {ronda.estadoRonda === 'votando' ? (
              <>
                <div className="aprox-pregunta-card" style={{ textAlign: 'center', padding: '1.4rem 1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.6rem' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        padding: '0.45rem 1.3rem',
                        borderRadius: '9999px',
                        backgroundColor: '#fef3c7',
                        border: '2px solid #f59e0b',
                        color: '#b45309',
                        fontSize: '1rem',
                        fontWeight: 800,
                        boxShadow: '0 2px 6px rgba(245, 158, 11, 0.2)'
                      }}
                    >
                      🎨 Debes elegir {ronda.numColores} {ronda.numColores === 1 ? 'color' : 'colores'}
                    </span>
                  </div>
                  <h2 className="aprox-pregunta-texto" style={{ fontSize: '1.65rem', margin: '0.6rem 0' }}>
                    {ronda.item}
                  </h2>
                </div>

                {!ronda.yaRespondio ? (
                  <>
                    {/* Temporizador */}
                    <div
                      className="timer"
                      role="timer"
                      style={{ margin: '0.6rem 0 0.3rem', background: '#e2e8f0', borderRadius: '9999px', height: '8px', overflow: 'hidden' }}
                    >
                      <div
                        className={`timer-bar ${tiempoRestante <= 10 ? 'low' : ''}`}
                        style={{
                          width: `${(tiempoRestante / TIEMPO_TURNO) * 100}%`,
                          height: '100%',
                          backgroundColor: tiempoRestante <= 10 ? '#ef4444' : '#16a34a',
                          borderRadius: '9999px',
                          transition: 'width 0.1s linear, background-color 0.3s ease'
                        }}
                      />
                    </div>
                    <p
                      className="timer-text"
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                        color: tiempoRestante <= 10 ? '#dc2626' : '#64748b', fontSize: '0.9rem', fontWeight: 700, margin: '0 0 1rem'
                      }}
                    >
                      <Icon name="clock" size={16} />
                      {tiempoRestante} s
                    </p>

                    <div className="colores-grid">
                      {PALETA_COLORES.map((col) => {
                        const activo = misColoresSeleccionados.includes(col.id);
                        return (
                          <button
                            key={col.id}
                            type="button"
                            className={`colores-tarjeta-solida color-btn-${col.id} ${activo ? 'seleccionado' : ''}`}
                            onClick={() => toggleColorOnline(col.id)}
                          >
                            <span>{col.nombre}</span>
                            {activo && (
                              <span
                                style={{
                                  position: 'absolute', top: '4px', right: '6px',
                                  backgroundColor: col.id === 'blanco' || col.id === 'amarillo' ? '#0f172a' : '#ffffff',
                                  color: col.id === 'blanco' || col.id === 'amarillo' ? '#ffffff' : '#0f172a',
                                  borderRadius: '9999px', width: '22px', height: '22px',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontSize: '0.8rem', fontWeight: 900, boxShadow: '0 2px 5px rgba(0,0,0,0.35)'
                                }}
                              >
                                ✓
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      className="big full qq-btn-principal"
                      style={{ marginTop: '1rem' }}
                      disabled={misColoresSeleccionados.length !== ronda.numColores}
                      onClick={() => handleEnviarRespuesta(false)}
                    >
                      <Icon name="check" size={22} />
                      {misColoresSeleccionados.length === ronda.numColores
                        ? 'Confirmar selección'
                        : `Falta ${ronda.numColores - misColoresSeleccionados.length}`}
                    </button>
                  </>
                ) : (
                  <div className="panel center" style={{ padding: '2rem 1.5rem', background: '#f8fafc', border: '2px dashed #cbd5e1', marginTop: '1rem' }}>
                    <span className="badge" style={{ background: '#dcfce7', color: '#166534', fontSize: '1.05rem', padding: '0.5rem 1.2rem' }}>
                      ✅ ¡Has enviado tus colores!
                    </span>
                    <p className="hint" style={{ marginTop: '1.2rem' }}>
                      Esperando a los demás jugadores ({ronda.totalRespondieron} de {ronda.totalJugadores})...
                    </p>
                    <div className="scoreboard-container" style={{ justifyContent: 'center', marginTop: '1rem' }}>
                      {sala.jugadores.map((j) => (
                        <div key={j.id} className="score-pill">
                          <span>{j.nombre}</span>
                          <span style={{ marginLeft: '6px' }}>{j.haRespondido ? '✅' : '⏳'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {esAdmin && (
                  <div className="qq-tablero-footer">
                    <button type="button" className="qq-link-otra-ronda" onClick={handleCerrarRonda}>
                      Forzar cierre de ronda (Anfitrión)
                    </button>
                  </div>
                )}
              </>
            ) : (
              resultadoRonda && (
                <div className="end-card aprox-resolucion-card">
                  <span className="end-icon"><Icon name="trophy" size={44} /></span>
                  <p className="categoria">{resultadoRonda.item}</p>
                  <h1 className="title" style={{ fontSize: '1.35rem' }}>Colores correctos:</h1>

                  <div className="colores-resolucion-correctos">
                    {resultadoRonda.coloresCorrectos.map((colId) => {
                      const cObj = PALETA_COLORES.find((p) => p.id === colId);
                      return (
                        <div key={colId} className="colores-pill-acierto">
                          <span
                            className="colores-circulo-mini"
                            style={{ backgroundColor: cObj?.hex, border: cObj?.borde ? '1px solid #94a3b8' : 'none' }}
                          />
                          <span>{cObj?.nombre || colId}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="aprox-resolucion-lista" style={{ marginTop: '1.2rem', width: '100%' }}>
                    {resultadoRonda.desglose.map((d) => (
                      <div key={d.id} className="aprox-fila-resultado intermedia" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'stretch' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong>{d.jugador} {d.id === sala.yoId ? '(Tú)' : ''}</strong>
                          <span className="aprox-badge-pts" style={{ background: d.aciertos > 0 ? '#10b981' : '#64748b' }}>
                            +{d.aciertos} {d.aciertos === 1 ? 'pt' : 'pts'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          {d.elegidos.map((colId) => {
                            const esAcierto = resultadoRonda.coloresCorrectos.includes(colId);
                            const cObj = PALETA_COLORES.find((p) => p.id === colId);
                            return (
                              <span key={colId} className={`colores-tag-elegido ${esAcierto ? 'acierto' : 'fallo'}`}>
                                <span className="colores-circulo-micro" style={{ backgroundColor: cObj?.hex }} />
                                {cObj?.nombre || colId} {esAcierto ? '✓' : '✗'}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    ))}
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

                  <div className="round-finished-actions" style={{ marginTop: '1.5rem', width: '100%' }}>
                    {esAdmin ? (
                      <>
                        {sala.rondaActualIdx + 1 < sala.totalRondas ? (
                          <button className="big full qq-btn-principal" onClick={handleSiguienteRonda}>
                            <Icon name="play" size={20} /> Siguiente ({sala.rondaActualIdx + 2} de {sala.totalRondas})
                          </button>
                        ) : (
                          <button className="big full qq-btn-principal" onClick={handleFinalizarPartida}>
                            <Icon name="trophy" size={20} /> Ver resultados finales
                          </button>
                        )}
                        <div className="qq-tablero-footer" style={{ marginTop: '0.8rem', paddingTop: '0.8rem' }}>
                          <button type="button" className="qq-link-otra-ronda" onClick={handleFinalizarPartida}>
                            Finalizar partida anticipadamente
                          </button>
                        </div>
                      </>
                    ) : (
                      <p className="hint center">Esperando a que el anfitrión avance...</p>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        </section>
      )}

      {/* 6. SALA: PODIO FINAL */}
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
              <button className="big full qq-btn-principal" onClick={handleReiniciarPartida}>
                <Icon name="refresh" size={20} /> Otra Partida (mismos jugadores)
              </button>
            )}
            <button className="secondary danger full" onClick={() => setModalSalirPortada(true)}>
              <Icon name="door" size={20} /> Salir al menú principal
            </button>
          </div>
        </section>
      )}

      {/* MODAL DE CONFIRMACIÓN PARA SALIR DEL LOBBY AL SUBMENÚ */}
      {modalSalirLobby && (
        <div className="rg-modal-fondo" onClick={() => setModalSalirLobby(false)}>
          <div 
            className="rg-modal" 
            onClick={(e) => e.stopPropagation()} 
            style={{ maxWidth: '420px', textAlign: 'center', padding: '1.8rem 1.4rem' }}
          >
            <div style={{ fontSize: '2.4rem', marginBottom: '0.4rem' }}>🚪</div>
            <h3 style={{ margin: '0 0 0.6rem', color: '#1e1b4b', fontSize: '1.3rem' }}>
              ¿Salir de la sala?
            </h3>
            <p className="hint" style={{ fontSize: '0.95rem', marginBottom: '1.4rem', lineHeight: '1.4' }}>
              Si sales ahora abandonarás la sala de espera y volverás al menú anterior. ¿Estás seguro?
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <button 
                type="button" 
                className="secondary full" 
                onClick={() => setModalSalirLobby(false)}
              >
                No, quedarme
              </button>
              <button 
                type="button" 
                className="secondary danger full" 
                style={{ background: '#ef4444', color: '#ffffff', borderColor: '#dc2626' }}
                onClick={handleVolverMenuOnline}
              >
                Sí, salir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CERRAR SALA Y SALIR A PORTADA */}
      {modalSalirPortada && (
        <div className="rg-modal-fondo" onClick={() => setModalSalirPortada(false)}>
          <div 
            className="rg-modal" 
            onClick={(e) => e.stopPropagation()} 
            style={{ maxWidth: '420px', textAlign: 'center', padding: '1.8rem 1.4rem' }}
          >
            <div style={{ fontSize: '2.4rem', marginBottom: '0.4rem' }}>🚪</div>
            <h3 style={{ margin: '0 0 0.6rem', color: '#1e1b4b', fontSize: '1.3rem' }}>
              ¿Salir a la portada?
            </h3>
            <p className="hint" style={{ fontSize: '0.95rem', marginBottom: '1.4rem', lineHeight: '1.4' }}>
              {esAdmin
                ? 'Se cerrará la sala y saldrás de la partida hacia la portada principal. ¿Estás seguro?'
                : 'Abandonarás la sala y saldrás hacia la portada principal. ¿Estás seguro?'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <button 
                type="button" 
                className="secondary full" 
                onClick={() => setModalSalirPortada(false)}
              >
                No, continuar
              </button>
              <button 
                type="button" 
                className="secondary danger full" 
                style={{ background: '#ef4444', color: '#ffffff', borderColor: '#dc2626' }}
                onClick={handleCerrarSalaYSalirAPortada}
              >
                Sí, salir a portada
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}