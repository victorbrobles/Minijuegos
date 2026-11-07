// client/src/games/Buscaminas/BuscaminasOnline.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import CategoryCard from '../../components/CategoryCard.jsx';
import './Buscaminas.css';
import '../Adivina/Adivina.css';

const CLAVE_SESION_BM = 'buscaminas_online_session';
const TOTAL_CORRECTOS = 10;
const TOTAL_MINAS = 5;
const TIEMPO_TURNO = 30;

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

export default function BuscaminasOnline({
  tituloJuego = 'Cuidado que explota',
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
  
  const [categorias, setCategorias] = useState([]);
  const [sesion, setSesion] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(CLAVE_SESION_BM));
    } catch {
      return null;
    }
  });

  const [sala, setSala] = useState(null);
  const [codigoCopiado, setCodigoCopiado] = useState(false);
  const [tiempoRestante, setTiempoRestante] = useState(TIEMPO_TURNO);

  const intervalRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    fetch('/api/buscaminas/categorias')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setCategorias(d.categorias);
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (!sesion) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setSala(null);
      return;
    }

    const consultarEstado = () => {
      fetch(`/api/buscaminas/online/sala/${sesion.code}?token=${sesion.token}`)
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
          sessionStorage.removeItem(CLAVE_SESION_BM);
          setSesion(null);
          setSala(null);
          setVista('online_menu');
          setErrorMsg('La sala se ha cerrado o se ha perdido la conexión.');
        });
    };

    consultarEstado();
    intervalRef.current = setInterval(consultarEstado, 650);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sesion]);

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
    sessionStorage.removeItem(CLAVE_SESION_BM);
    setSesion(null);
    setSala(null);
    setModalSalirPortada(false);

    if (sesionActual?.code && sesionActual?.token) {
      fetch(`/api/buscaminas/online/sala/${sesionActual.code}/salir`, {
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
    sessionStorage.removeItem(CLAVE_SESION_BM);
    setSesion(null);
    setSala(null);
    setModalSalirLobby(false);
    setVista('online_menu');

    if (sesionActual?.code && sesionActual?.token) {
      fetch(`/api/buscaminas/online/sala/${sesionActual.code}/salir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesionActual.token }),
        keepalive: true
      }).catch(() => {});
    }
  };

  const handleCrear = async () => {
    if (!nombre.trim()) return;
    setCargando(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/buscaminas/online/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_BM, JSON.stringify(nueva));
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
    setErrorMsg('');
    try {
      const res = await fetch('/api/buscaminas/online/unirse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codigoInput.trim().toUpperCase(), nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_BM, JSON.stringify(nueva));
      setSesion(nueva);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleIniciarPartida = async () => {
    try {
      const res = await fetch(`/api/buscaminas/online/sala/${sesion.code}/iniciar-partida`, {
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

  const handleElegirCategoria = async (categoriaId) => {
    try {
      const res = await fetch(`/api/buscaminas/online/sala/${sesion.code}/elegir-categoria`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token, categoriaId })
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleSeleccionarCasilla = async (casillaId) => {
    try {
      const res = await fetch(`/api/buscaminas/online/sala/${sesion.code}/seleccionar-casilla`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token, casillaId })
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePerderTurno = async () => {
    if (!sesion) return;
    try {
      await fetch(`/api/buscaminas/online/sala/${sesion.code}/perder-turno`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const perderTurnoRef = useRef();
  useEffect(() => {
    perderTurnoRef.current = handlePerderTurno;
  });

  const ronda = sala?.ronda;
  const esAdmin = sala?.esAdmin;
  const yoId = sala?.yoId;
  const esMiTurno = ronda?.jugadorActivoId === yoId;
  const yoEliminado = ronda?.eliminadosRonda?.includes(yoId);

  useEffect(() => {
    const isJugando = sala?.estado === 'jugando' && ronda?.faseRonda === 'jugando';
    if (!isJugando) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    setTiempoRestante(TIEMPO_TURNO);
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          if (esMiTurno && !yoEliminado && perderTurnoRef.current) {
            perderTurnoRef.current(); 
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sala?.estado, ronda?.faseRonda, ronda?.jugadorActivoId, esMiTurno, yoEliminado]);

  const handleCerrarExplosion = async () => {
    try {
      await fetch(`/api/buscaminas/online/sala/${sesion.code}/cerrar-explosion`, {
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
      await fetch(`/api/buscaminas/online/sala/${sesion.code}/siguiente-ronda`, {
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
      await fetch(`/api/buscaminas/online/sala/${sesion.code}/finalizar`, {
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

  const ranking = sala?.jugadores ? [...sala.jugadores].sort((a, b) => b.puntos - a.puntos) : [];
  const maximoPuntos = ranking.length ? ranking[0].puntos : 0;
  const ganadores = maximoPuntos > 0 ? ranking.filter((j) => j.puntos === maximoPuntos) : [];

  const correctasDescubiertas = ronda?.casillas ? ronda.casillas.filter((c) => c.descubierta && c.correcto).length : 0;
  const minasExplotadas = ronda?.casillas ? ronda.casillas.filter((c) => c.descubierta && !c.correcto).length : 0;

  const enPartidaActiva = vista === 'sala' && sala && sala.estado !== 'lobby';

  return (
    <div className={`bm-contenedor ${enPartidaActiva ? 'qq-en-partida' : ''}`}>

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
              <Icon name="bomb" size={44} strokeWidth={1.7} />
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
                  <span>Pasando el móvil por turnos entre los jugadores</span>
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

            {errorMsg && <p className="error" style={{ margin: '0.8rem 0' }}>{errorMsg}</p>}

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
                  <span>Sé el anfitrión, genera un código y elige la temática</span>
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
              <label className="field-label" htmlFor="bm-host-nombre">Tu nombre</label>
              <input
                id="bm-host-nombre"
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
                type="button"
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
              <label className="field-label" htmlFor="bm-code-input">Código de la sala</label>
              <input
                id="bm-code-input"
                className="lb-input-codigo qq-input-moderno"
                type="text"
                placeholder="ABCD"
                value={codigoInput}
                onChange={(e) => setCodigoInput(e.target.value.toUpperCase())}
                maxLength={4}
                style={{ textTransform: 'uppercase', letterSpacing: '4px', textAlign: 'center', fontWeight: '800' }}
                autoFocus
              />

              <label className="field-label" htmlFor="bm-guest-nombre" style={{ marginTop: '1rem' }}>Tu nombre</label>
              <input
                id="bm-guest-nombre"
                className="qq-input-moderno"
                type="text"
                placeholder="Tu nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                maxLength={20}
              />
              {errorMsg && <p className="error">{errorMsg}</p>}

              <button
                type="button"
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

            <span className="qq-badge-sala"><Icon name="lock" size={15} /> Sala de espera</span>
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

          <div className="panel qq-menu-panel" style={{ marginTop: '1rem' }}>
            <h3 className="qq-sala-titulo"><Icon name="users" size={20} /> Jugadores ({sala.jugadores.length})</h3>
            <div className="lb-lista qq-sala-lista">
              {sala.jugadores.map((j) => (
                <div key={j.id} className={`lb-jug ${j.id === yoId ? 'yo' : ''}`}>
                  <span className="lb-jug-nombre">
                    {j.nombre}{j.id === yoId ? ' (Tú)' : ''}{j.id === 1 ? ' 👑' : ''}
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
                className="big full qq-btn-principal"
                disabled={sala.jugadores.length < 3}
                onClick={handleIniciarPartida}
              >
                <Icon name="play" size={22} />
                {sala.jugadores.length < 3 ? 'Esperando jugadores...' : '¡Elegir Categoría!'}
              </button>
            </div>
          ) : (
            <div className="panel center" style={{ padding: '2rem 1.5rem', marginTop: '1rem' }}>
              <span className="lb-luna chica"><Icon name="hourglass" size={40} /></span>
              <h3 style={{ margin: '0.5rem 0' }}>Esperando al anfitrión...</h3>
              <p className="hint">El anfitrión elegirá la categoría de la ronda.</p>
            </div>
          )}
        </section>
      )}

      {/* 5. SELECTOR DE CATEGORÍA */}
      {vista === 'sala' && sala && sala.estado === 'categoria' && (
        <section className="game">
          <div className="panel qq-menu-panel">
            <div className="qq-card-top">
              <BotonVolver texto="Volver a la portada" onClick={() => setModalSalirPortada(true)} />
              <span className="qq-tablero-badge" style={{ marginBottom: 0 }}>
                Ronda {sala.rondaNum} de {sala.maxRondas}
              </span>
            </div>

            {esAdmin ? (
              <>
                <div className="qq-section-header">
                  <h3 className="qq-section-title">Elige la temática para este tablero:</h3>
                </div>
                <div className="bm-categories-grid">
                  {categorias.map((cat, idx) => (
                    <CategoryCard
                      key={cat.id}
                      nombre={cat.nombre}
                      icono={cat.icono}
                      indice={idx}
                      onClick={() => handleElegirCategoria(cat.id)}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="panel center" style={{ padding: '2.5rem 1.5rem' }}>
                <span className="end-icon"><Icon name="target" size={44} /></span>
                <h2 className="title" style={{ marginTop: '0.8rem' }}>Seleccionando temática...</h2>
                <p className="hint">El anfitrión está eligiendo la categoría del tablero para la Ronda {sala.rondaNum}.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 6. TABLERO ONLINE EN JUEGO */}
      {vista === 'sala' && sala && sala.estado === 'jugando' && ronda && ronda.faseRonda === 'jugando' && (
        <section className="game">
          <div className="panel qq-menu-panel">
            <div className="qq-card-top" style={{ marginBottom: '0.8rem' }}>
              <BotonVolver texto="Volver a la portada" onClick={() => setModalSalirPortada(true)} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="qq-tablero-badge" style={{ marginBottom: 0 }}>
                  Ronda {sala.rondaNum} de {sala.maxRondas}
                </span>
              </div>
            </div>

            {/* Marcador superior */}
            <div className="scoreboard-container" style={{ justifyContent: 'center', marginBottom: '0.8rem' }}>
              {sala.jugadores.map((j) => {
                const eliminado = ronda.eliminadosRonda.includes(j.id);
                const esTurno = j.id === ronda.jugadorActivoId;
                return (
                  <div key={j.id} className={`score-pill ${eliminado ? 'locked' : ''}`} style={{ borderColor: esTurno ? '#4f46e5' : undefined }}>
                    <span>{j.nombre}: <strong>{j.puntos} pts</strong></span>
                    {eliminado ? <span style={{ marginLeft: '4px' }}>💥</span> : esTurno ? <span style={{ marginLeft: '4px' }}>👉</span> : null}
                  </div>
                );
              })}
            </div>

            {/* Consigna */}
            <div className="bm-consigna-card">
              <span className="badge" style={{ background: '#e0e7ff', color: '#4338ca' }}>
                {ronda.categoriaNombre}
              </span>
              <h2 className="bm-consigna-titulo">«{ronda.consigna}»</h2>
              <p className="bm-consigna-sub">Encuentra los elementos que cumplen la consigna y esquiva las 5 bombas.</p>

              <div className="bm-progreso-stats">
                <span className="bm-stat-chip correctas">
                  ✅ Aciertos: {correctasDescubiertas} / {TOTAL_CORRECTOS}
                </span>
                <span className="bm-stat-chip minas">
                  💣 Minas pisadas: {minasExplotadas} / {TOTAL_MINAS}
                </span>
              </div>
            </div>

            {esMiTurno ? (
              <div className="bm-starter-banner" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                <span>👉 <strong>¡ES TU TURNO!</strong> Selecciona una casilla</span>
              </div>
            ) : (
              <div className="bm-starter-banner">
                <span>⏳ Esperando a: <strong>{ronda.jugadorActivoNombre}</strong></span>
              </div>
            )}

            {/* Temporizador */}
            <div style={{ padding: '0 1rem', marginTop: '0.5rem' }}>
              <div
                className="timer"
                role="timer"
                style={{ margin: '0.4rem 0', background: '#e2e8f0', borderRadius: '9999px', height: '8px', overflow: 'hidden' }}
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
            </div>

            <div className="bm-grid-15">
              {ronda.casillas.map((c) => {
                if (c.descubierta) {
                  if (c.correcto) {
                    return (
                      <button key={c.id} type="button" className="bm-casilla-btn acertada" disabled>
                        <span>{c.texto}</span>
                        <span className={`bm-badge-pts ${c.dificultad}`}>
                          +{c.puntos} {c.puntos === 1 ? 'pt' : 'pts'}
                        </span>
                      </button>
                    );
                  } else {
                    return (
                      <button key={c.id} type="button" className="bm-casilla-btn mina-explotada" disabled>
                        <span>💣 {c.texto}</span>
                      </button>
                    );
                  }
                }

                return (
                  <button
                    key={c.id}
                    type="button"
                    className="bm-casilla-btn"
                    disabled={!esMiTurno || yoEliminado}
                    onClick={() => handleSeleccionarCasilla(c.id)}
                    style={{
                      cursor: esMiTurno && !yoEliminado ? 'pointer' : 'default',
                      opacity: esMiTurno && !yoEliminado ? 1 : 0.85
                    }}
                  >
                    <span>{c.texto}</span>
                  </button>
                );
              })}
            </div>

            {ronda.explosionModal && (
              <div className="bm-modal-explosion-fondo" onClick={esAdmin ? handleCerrarExplosion : undefined}>
                <div className="bm-modal-explosion-card" onClick={(e) => e.stopPropagation()}>
                  <span className="bm-bomba-animada">💣💥</span>
                  <h2 className="bm-explosion-titulo">¡BOOM! ¡MINA PISADA!</h2>
                  <p className="bm-explosion-txt">
                    <strong>{ronda.explosionModal.casillaTexto}</strong> no cumple la consigna.
                    <br />
                    <strong>{ronda.explosionModal.jugadorNombre}</strong> queda eliminado de esta ronda.
                  </p>
                  {esAdmin ? (
                    <button type="button" className="big full" onClick={handleCerrarExplosion}>
                      {ronda.motivoFinRonda ? 'Ver resultados de la ronda' : 'Continuar con el siguiente jugador'}
                    </button>
                  ) : (
                    <p className="hint small">Esperando a que el anfitrión continúe...</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 7. FIN DE RONDA ONLINE */}
      {vista === 'sala' && sala && sala.estado === 'jugando' && ronda && ronda.faseRonda === 'ronda_fin' && (
        <section className="game">
          <div className="panel qq-menu-panel">
            <div className="qq-card-top" style={{ marginBottom: '0.8rem' }}>
              <BotonVolver texto="Volver a la portada" onClick={() => setModalSalirPortada(true)} />
            </div>

            <div className="end-card aprox-resolucion-card" style={{ border: 'none', boxShadow: 'none', padding: '0 0 1rem' }}>
              <span className="end-icon"><Icon name="trophy" size={44} /></span>
              <p className="categoria">Ronda {sala.rondaNum} completada</p>
              <h1 className="title">{ronda.motivoFinRonda || 'Fin de la ronda'}</h1>
              <p className="reveal" style={{ fontSize: '1.2rem', margin: '0.6rem 0' }}>
                Consigna: «{ronda.consigna}»
              </p>

              <div className="bm-grid-15" style={{ margin: '1.2rem 0' }}>
                {ronda.casillas.map((c) => (
                  <div
                    key={c.id}
                    className={`bm-casilla-btn ${c.correcto ? 'acertada' : 'mina-explotada'}`}
                    style={{ cursor: 'default' }}
                  >
                    <span>{c.correcto ? '✓ ' : '💣 '}{c.texto}</span>
                    {c.correcto && (
                      <span className={`bm-badge-pts ${c.dificultad}`}>
                        +{c.puntos} {c.puntos === 1 ? 'pt' : 'pts'}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="scoreboard" style={{ width: '100%', marginTop: '1rem' }}>
                <h3 className="section-title" style={{ margin: '0 0 0.8rem', textAlign: 'center' }}>
                  Clasificación general
                </h3>
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

            <div className="actions" style={{ marginTop: '1.2rem' }}>
              {esAdmin ? (
                <>
                  {sala.rondaNum < sala.maxRondas ? (
                    <button className="big full qq-btn-principal" onClick={handleSiguienteRonda}>
                      <Icon name="play" size={20} /> Elegir siguiente categoría (Ronda {sala.rondaNum + 1} de {sala.maxRondas})
                    </button>
                  ) : (
                    <button className="big full qq-btn-principal" onClick={handleFinalizar}>
                      <Icon name="trophy" size={20} /> Ver podio final
                    </button>
                  )}
                  <div className="qq-tablero-footer">
                    <button type="button" className="qq-link-otra-ronda" onClick={handleFinalizar}>
                      Finalizar partida anticipadamente
                    </button>
                  </div>
                </>
              ) : (
                <div className="panel center" style={{ width: '100%', padding: '1rem' }}>
                  <p className="hint">Esperando a que el anfitrión avance a la siguiente ronda...</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 8. PODIO FINAL ONLINE */}
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
            <button className="secondary danger full" onClick={() => setModalSalirPortada(true)}>
              <Icon name="door" size={20} /> Salir al menú
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