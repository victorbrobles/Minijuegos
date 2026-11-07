// client/src/games/Ubicacion/UbicacionOnline.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import MapaMundi from './MapaMundi.jsx';
import { formatearKm, resolverImagenes } from './geo.js';
import './Ubicacion.css';
import '../Adivina/Adivina.css';

const CLAVE_SESION_UBICACION = 'ubicacion_online_session';
const CANDIDATOS = 16;
const SEGUNDOS_TURNO = 90;

export default function UbicacionOnline({
  tituloJuego = 'Test del viajero',
  descripcionJuego,
  onLocal,
  onSalir,
  onAbrirAyuda
}) {
  const navigate = useNavigate();

  // 'menu' | 'online_menu' | 'crear' | 'unirse' | 'sala'
  const [vista, setVista] = useState('menu');
  const [nombre, setNombre] = useState('');
  const [codigoInput, setCodigoInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);

  const [modalSalirLobby, setModalSalirLobby] = useState(false);
  const [modalSalirPortada, setModalSalirPortada] = useState(false);

  const [sesion, setSesion] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(CLAVE_SESION_UBICACION));
    } catch {
      return null;
    }
  });

  const [sala, setSala] = useState(null);
  const [codigoCopiado, setCodigoCopiado] = useState(false);
  const [verImagen, setVerImagen] = useState(false);
  const [enfoque, setEnfoque] = useState(null);
  const [miPosicionLocal, setMiPosicionLocal] = useState(null);

  const intervalRef = useRef(null);

  useEffect(() => {
    if (!sesion) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setSala(null);
      return;
    }

    const consultarEstado = () => {
      fetch(`/api/ubicacion/online/sala/${sesion.code}?token=${sesion.token}`)
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
          sessionStorage.removeItem(CLAVE_SESION_UBICACION);
          setSesion(null);
          setSala(null);
          setVista('online_menu');
          setErrorMsg('La sala se ha cerrado.');
        });
    };

    consultarEstado();
    intervalRef.current = setInterval(consultarEstado, 500);

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

  // Volver desde el lobby al submenú online
  const handleVolverMenuOnline = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const sesionActual = sesion;
    sessionStorage.removeItem(CLAVE_SESION_UBICACION);
    setSesion(null);
    setSala(null);
    setModalSalirLobby(false);
    setVista('online_menu');

    if (sesionActual?.code && sesionActual?.token) {
      fetch(`/api/ubicacion/online/sala/${sesionActual.code}/salir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesionActual.token }),
        keepalive: true
      }).catch(() => {});
    }
  };

  // Cerrar sala en partida y volver a la portada
  const handleCerrarSalaYSalirAPortada = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const sesionActual = sesion;
    sessionStorage.removeItem(CLAVE_SESION_UBICACION);
    setSesion(null);
    setSala(null);
    setModalSalirPortada(false);

    if (sesionActual?.code && sesionActual?.token) {
      fetch(`/api/ubicacion/online/sala/${sesionActual.code}/salir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesionActual.token }),
        keepalive: true
      }).catch(() => {});
    }

    redirigirAPortada();
  };

  const handleCrear = async () => {
    if (!nombre.trim()) return;
    setCargando(true);
    setErrorMsg('');
    try {
      const rLote = await fetch(`/api/ubicacion/lote?n=${CANDIDATOS}`);
      if (!rLote.ok) throw new Error('Error al conectar con la base de datos de lugares.');
      const candidatos = await rLote.json();
      const lugaresConFoto = await resolverImagenes(candidatos);
      if (!lugaresConFoto.length) throw new Error('No se pudieron descargar las fotos de los monumentos.');

      const res = await fetch('/api/ubicacion/online/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombre.trim(), lugares: lugaresConFoto })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_UBICACION, JSON.stringify(nueva));
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
      const res = await fetch('/api/ubicacion/online/unirse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codigoInput.trim().toUpperCase(), nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_UBICACION, JSON.stringify(nueva));
      setSesion(nueva);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleIniciarPartida = async () => {
    try {
      const res = await fetch(`/api/ubicacion/online/sala/${sesion.code}/iniciar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token })
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setMiPosicionLocal(null);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleColocarMarcador = (lat, lng) => {
    if (ronda?.miMarcador?.confirmado) return;
    setMiPosicionLocal({ lat, lng });

    fetch(`/api/ubicacion/online/sala/${sesion.code}/posicionar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: sesion.token, lat, lng })
    }).catch(() => {});
  };

  const handleConfirmarMarcador = async () => {
    if (!miPosicionLocal && !ronda?.miMarcador?.lat) return;
    try {
      await fetch(`/api/ubicacion/online/sala/${sesion.code}/confirmar`, {
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
      setMiPosicionLocal(null);
      await fetch(`/api/ubicacion/online/sala/${sesion.code}/siguiente-ronda`, {
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
      await fetch(`/api/ubicacion/online/sala/${sesion.code}/finalizar`, {
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
  const esAdmin = sala?.esAdmin;
  const yoId = sala?.yoId;
  const miJugador = sala?.jugadores?.find((j) => j.id === yoId);
  const miColor = miJugador?.color || '#2563eb';
  const yaConfirmado = Boolean(ronda?.miMarcador?.confirmado);

  const marcadoresMapa = [];
  const miPos = miPosicionLocal || (ronda?.miMarcador?.lat ? { lat: ronda.miMarcador.lat, lng: ronda.miMarcador.lng } : null);

  if (miPos) {
    marcadoresMapa.push({
      id: 'mi-marcador',
      lat: miPos.lat,
      lng: miPos.lng,
      color: miColor,
      glifo: '★',
      grande: true,
      arrastrable: !yaConfirmado,
      etiqueta: yaConfirmado ? `${miJugador?.nombre} (Confirmado)` : `${miJugador?.nombre} (Tú)`
    });
  }

  if (ronda?.destellosVisibles?.length) {
    ronda.destellosVisibles.forEach((d) => {
      marcadoresMapa.push({
        id: d.id,
        lat: d.lat,
        lng: d.lng,
        color: d.color,
        glifo: '👁',
        grande: false,
        fantasma: true,
        arrastrable: false,
        etiqueta: `📍 ${d.nombre}`
      });
    });
  }

  const marcadoresResultado = ronda?.resultado
    ? [
        {
          id: 'correcto',
          lat: ronda.resultado.lugar.lat,
          lng: ronda.resultado.lugar.lng,
          color: '#111827',
          glifo: '✓',
          grande: true,
          z: 1000,
          etiqueta: ronda.resultado.lugar.nombre
        },
        ...ronda.resultado.filas
          .filter((f) => f.real)
          .map((f) => ({
            id: `jugador-${f.jugadorId}`,
            lat: f.real.lat,
            lng: f.real.lng,
            color: f.color,
            glifo: (f.nombre[0] ?? '?').toUpperCase(),
            etiqueta: f.nombre
          }))
      ]
    : [];

  const lineasResultado = ronda?.resultado
    ? ronda.resultado.filas
        .filter((f) => f.real)
        .map((f) => ({
          desde: f.real,
          hasta: ronda.resultado.lugar,
          color: f.color
        }))
    : [];

  const ranking = sala?.jugadores ? [...sala.jugadores].sort((a, b) => b.puntos - a.puntos) : [];
  const maximo = ranking.length ? ranking[0].puntos : 0;
  const ganadores = maximo > 0 ? ranking.filter((j) => j.puntos === maximo) : [];

  const enPartidaActiva = vista === 'sala' && sala && sala.estado !== 'lobby';

  return (
    <div className={`ub-contenedor ${enPartidaActiva ? 'qq-en-partida' : ''}`}>
      {/* 1. MENÚ INICIAL (2 BOTONES: ONLINE / UN DISPOSITIVO) */}
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
              <Icon name="pin" size={44} strokeWidth={1.7} />
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
                  <span>Cada jugador desde su propio dispositivo con código de sala</span>
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
                  <span>Pasando el dispositivo por turnos colocando señuelos</span>
                </div>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 1B. SUBMENÚ ONLINE (CREAR PARTIDA / UNIRSE CON CÓDIGO) */}
      {vista === 'online_menu' && (
        <section className="game">
          <div className="panel center qq-menu-panel">
            <div className="qq-card-top">
              <button
                type="button"
                className="qq-link-volver"
                onClick={() => {
                  setVista('menu');
                  setErrorMsg('');
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                <span>Volver</span>
              </button>
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
                  <span>Sé el anfitrión y genera un código para hasta 10 jugadores</span>
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
              <button
                type="button"
                className="qq-link-volver"
                onClick={() => {
                  setVista('online_menu');
                  setErrorMsg('');
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                <span>Volver</span>
              </button>
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
              Introduce tu nombre para abrir la sala y ser el anfitrión (de 2 a 10 jugadores).
            </p>

            <div className="lb-form qq-form-estilizado">
              <label className="field-label" htmlFor="ub-host-nombre">Tu nombre</label>
              <input
                id="ub-host-nombre"
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
                <Icon name="check" size={22} strokeWidth={2.5} />{' '}
                {cargando ? 'Descargando lugares…' : 'Crear sala'}
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
              <button
                type="button"
                className="qq-link-volver"
                onClick={() => {
                  setVista('online_menu');
                  setErrorMsg('');
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                <span>Volver</span>
              </button>
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
              <label className="field-label" htmlFor="ub-code-input">Código de la partida</label>
              <input
                id="ub-code-input"
                className="lb-input-codigo qq-input-moderno"
                type="text"
                placeholder="ABCD"
                value={codigoInput}
                onChange={(e) => setCodigoInput(e.target.value.toUpperCase())}
                maxLength={4}
                autoFocus
              />

              <label className="field-label" htmlFor="ub-guest-nombre" style={{ marginTop: '1rem' }}>
                Tu nombre
              </label>
              <input
                id="ub-guest-nombre"
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
              <button
                type="button"
                className="qq-link-volver"
                onClick={() => setModalSalirLobby(true)}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                <span>Volver</span>
              </button>
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
              {codigoCopiado
                ? '¡Copiado al portapapeles!'
                : 'Pulsa el código para copiarlo y compártelo con los demás.'}
            </p>
          </div>

          <div className="panel qq-menu-panel" style={{ marginTop: '1rem' }}>
            <h3 className="qq-sala-titulo">
              <Icon name="users" size={20} /> Jugadores ({sala.jugadores.length}/10)
            </h3>
            <div className="lb-lista qq-sala-lista">
              {sala.jugadores.map((j) => (
                <div key={j.id} className={`lb-jug ${j.id === yoId ? 'yo' : ''}`}>
                  <span className="ub-punto" style={{ background: j.color }} />
                  <span className="lb-jug-nombre">
                    {j.nombre}{j.id === yoId ? ' (tú)' : ''}{j.id === 1 ? ' 👑' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {errorMsg && <p className="error" style={{ margin: '0.8rem 0' }}>{errorMsg}</p>}

          {esAdmin ? (
            <button
              type="button"
              className="big full qq-btn-principal"
              style={{ marginTop: '1rem' }}
              disabled={sala.jugadores.length < 2}
              onClick={handleIniciarPartida}
            >
              <Icon name="play" size={22} />{' '}
              {sala.jugadores.length < 2 ? 'Esperando jugadores (mínimo 2)...' : 'Iniciar juego'}
            </button>
          ) : (
            <div className="panel center" style={{ padding: '1.8rem 1.4rem', marginTop: '1rem' }}>
              <span className="lb-luna chica"><Icon name="hourglass" size={36} /></span>
              <h3 style={{ margin: '0.4rem 0' }}>Esperando al anfitrión...</h3>
              <p className="hint">
                El anfitrión iniciará la partida cuando estéis todos listos.
              </p>
            </div>
          )}
        </section>
      )}

      {/* 5. JUGANDO: FASE FOTO */}
      {vista === 'sala' && sala && sala.estado === 'jugando' && ronda && ronda.faseRonda === 'foto' && (
        <section className="game">
          <div className="panel qq-menu-panel">
            <div className="qq-card-top">
              <button
                type="button"
                className="qq-link-volver"
                onClick={() => setModalSalirPortada(true)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                <span>Volver a la portada</span>
              </button>
              <span className="qq-tablero-badge" style={{ marginBottom: 0 }}>
                Ronda {sala.rondaNum} de {sala.totalRondas}
              </span>
            </div>

            <h3 className="panel-title" style={{ justifyContent: 'center', marginTop: '0.4rem' }}>
              <Icon name="eye" size={22} /> ¡Memoriza este lugar!
            </h3>
            <img
              className="ub-foto"
              src={ronda.lugar.imagenUrl}
              alt="Monumento a situar en el mapa"
            />
            <div className="timer">
              <div
                className={`timer-bar${ronda.segundosRestantesFoto <= 3 ? ' low' : ''}`}
                style={{ width: `${(ronda.segundosRestantesFoto / 10) * 100}%` }}
              />
            </div>
            <p className="timer-text">
              <Icon name="clock" size={18} /> Pasando al mapa en: {ronda.segundosRestantesFoto} s
            </p>
          </div>
        </section>
      )}

      {/* 6. JUGANDO: FASE MAPA */}
      {vista === 'sala' && sala && sala.estado === 'jugando' && ronda && ronda.faseRonda === 'mapa' && (
        <section className="game">
          {verImagen && (
            <div className="ub-modal-fondo" onClick={() => setVerImagen(false)}>
              <div className="ub-modal ub-modal-foto" onClick={(e) => e.stopPropagation()}>
                <img className="ub-foto" src={ronda.lugar.imagenUrl} alt="Lugar" />
                <button className="big full" onClick={() => setVerImagen(false)}>Cerrar</button>
              </div>
            </div>
          )}

          <div className="panel qq-menu-panel">
            <div className="qq-card-top" style={{ marginBottom: '0.8rem' }}>
              <button
                type="button"
                className="qq-link-volver"
                onClick={() => setModalSalirPortada(true)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                <span>Volver a la portada</span>
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="qq-tablero-badge" style={{ marginBottom: 0 }}>
                  Ronda {sala.rondaNum}/{sala.totalRondas}
                </span>
                <button type="button" className="secondary ub-mini" onClick={() => setVerImagen(true)}>
                  <Icon name="eye" size={16} /> Ver foto
                </button>
              </div>
            </div>

            <div className="timer" style={{ marginTop: '0', marginBottom: '0.8rem' }}>
              <div
                className={`timer-bar${ronda.segundosRestantesMapa <= 15 ? ' low' : ''}`}
                style={{ width: `${(ronda.segundosRestantesMapa / SEGUNDOS_TURNO) * 100}%` }}
              />
            </div>
            <p className="timer-text" style={{ marginTop: '-0.3rem', marginBottom: '0.9rem' }}>
              <Icon name="clock" size={16} /> {ronda.segundosRestantesMapa} s
            </p>

            <div className="scoreboard-container" style={{ justifyContent: 'center', marginBottom: '0.8rem' }}>
              {sala.jugadores.map((j) => {
                const listo = ronda.jugadoresConfirmados.includes(j.id);
                return (
                  <div key={j.id} className="score-pill" style={{ borderColor: listo ? '#10b981' : undefined }}>
                    <span className="ub-punto" style={{ background: j.color }} />
                    <span>{j.nombre}: {listo ? '✅ Listo' : 'Colocando…'}</span>
                  </div>
                );
              })}
            </div>

            {ronda.destellosVisibles.length > 0 && (
              <div className="status-alert acierto" style={{ textAlign: 'center', marginBottom: '0.8rem' }}>
                📡 ¡RADAR ACTIVO (1s)! Vislumbrando marcadores provisionales de rivales no confirmados...
              </div>
            )}

            <div className="ub-turno" style={{ '--c': miColor }}>
              <p className="ub-turno-titulo">
                <span className="ub-punto" style={{ background: miColor }} />
                {yaConfirmado ? (
                  <span>¡Marcador confirmado! Tu posición está blindada.</span>
                ) : (
                  <span>Toca el mapa para situar tu marcador <strong>★ Real</strong>.</span>
                )}
              </p>
              <p className="ub-turno-texto">
                {yaConfirmado
                  ? 'Esperando a que el resto de jugadores confirmen o se agote el tiempo.'
                  : 'Mientras no confirmes, tu marcador parpadeará durante 1 segundo para los demás cada 15 segundos.'}
              </p>
            </div>

            <MapaMundi
              key={`mapa-online-${sala.rondaNum}`}
              marcadores={marcadoresMapa}
              onClickMapa={handleColocarMarcador}
              onMoverMarcador={(id, lat, lng) => handleColocarMarcador(lat, lng)}
            />

            {!yaConfirmado ? (
              <button
                className="big full qq-btn-principal"
                disabled={!miPos}
                onClick={handleConfirmarMarcador}
                style={{ marginTop: '0.6rem' }}
              >
                <Icon name="check" size={22} /> Confirmar mi marcador definitivo
              </button>
            ) : (
              <div className="status-alert info" style={{ textAlign: 'center', marginTop: '0.6rem' }}>
                Has confirmado tu marcador. Esperando al resto...
              </div>
            )}
          </div>
        </section>
      )}

      {/* 7. RESULTADOS DE LA RONDA */}
      {vista === 'sala' && sala && sala.estado === 'jugando' && ronda && ronda.faseRonda === 'resultados' && ronda.resultado && (
        <section className="game">
          <div className="panel qq-menu-panel">
            <div className="qq-card-top" style={{ marginBottom: '0.8rem' }}>
              <button
                type="button"
                className="qq-link-volver"
                onClick={() => setModalSalirPortada(true)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                <span>Volver a la portada</span>
              </button>
              <span className="qq-tablero-badge" style={{ marginBottom: 0 }}>
                Ronda {sala.rondaNum} de {sala.totalRondas}
              </span>
            </div>

            <MapaMundi
              key={`res-online-${sala.rondaNum}`}
              marcadores={marcadoresResultado}
              lineas={lineasResultado}
              ajustar
              enfoque={enfoque}
            />

            <div className="ub-ranking" style={{ marginTop: '1rem' }}>
              <h3 className="panel-title"><Icon name="trophy" size={22} /> Resultados de la ronda</h3>
              <p className="ub-lugar-revelado">
                <Icon name="pin" size={22} />
                <span><strong>{ronda.resultado.lugar.nombre}</strong> · {ronda.resultado.lugar.pais}</span>
              </p>

              <div className="scoreboard">
                {ronda.resultado.filas.map((f, i) => (
                  <button
                    key={f.jugadorId}
                    className="ub-rank-fila"
                    onClick={() => f.real && setEnfoque(f.real)}
                    title="Ver su marcador en el mapa"
                    disabled={!f.real}
                  >
                    <span className="score-name">
                      <span className="pos">{i + 1}</span>
                      <span className="ub-punto" style={{ background: f.color }} />
                      {f.nombre}
                    </span>
                    <span className="ub-rank-datos">
                      <span className="ub-rank-km">{f.real ? formatearKm(f.km) : 'No colocado'}</span>
                      <span className={`ub-rank-pts${f.puntos > 0 ? ' suma' : ''}`}>+{f.puntos}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {esAdmin ? (
              <div style={{ marginTop: '1.2rem' }}>
                {sala.rondaNum < sala.totalRondas ? (
                  <button className="big full qq-btn-principal" onClick={handleSiguienteRonda}>
                    <Icon name="play" size={20} /> Siguiente ronda ({sala.rondaNum + 1} de {sala.totalRondas})
                  </button>
                ) : (
                  <button className="big full qq-btn-principal" onClick={handleFinalizar}>
                    <Icon name="trophy" size={20} /> Ver podio final
                  </button>
                )}

                <div className="qq-tablero-footer">
                  <button type="button" className="qq-link-otra-ronda" onClick={handleFinalizar}>
                    Finalizar partida ahora
                  </button>
                </div>
              </div>
            ) : (
              <p className="hint center" style={{ marginTop: '1rem', marginBottom: 0 }}>
                Esperando a que el anfitrión avance a la siguiente ronda...
              </p>
            )}
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
                ? 'Nadie ha sumado puntos'
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
                      <span className="ub-punto" style={{ background: j.color }} />
                      {j.nombre}
                    </span>
                    <span className="score-pts">{j.puntos} pts</span>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              className="big full qq-btn-principal"
              style={{ marginTop: '1.4rem' }}
              onClick={handleCerrarSalaYSalirAPortada}
            >
              Volver a la portada
            </button>
          </div>
        </section>
      )}

      {/* MODAL: SALIR DEL LOBBY AL SUBMENÚ ONLINE */}
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

      {/* MODAL: CERRAR SALA Y VOLVER A PORTADA DESDE LA PARTIDA */}
      {modalSalirPortada && (
        <div className="rg-modal-fondo" onClick={() => setModalSalirPortada(false)}>
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
              {esAdmin
                ? 'Se cerrará la sala y volverás a la portada principal. ¿Estás seguro?'
                : 'Abandonarás la partida en curso y volverás a la portada principal. ¿Estás seguro?'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <button
                type="button"
                className="secondary full"
                onClick={() => setModalSalirPortada(false)}
              >
                No, quedarme
              </button>
              <button
                type="button"
                className="secondary danger full"
                style={{ background: '#ef4444', color: '#ffffff', borderColor: '#dc2626' }}
                onClick={handleCerrarSalaYSalirAPortada}
              >
                Sí, salir de la sala
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}