// client/src/games/Buscaminas/BuscaminasOnline.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import './Buscaminas.css';
import {
  Cabecera,
  Avatar,
  OrdenTurnos,
  SelectorCategorias,
  BotonPrincipal,
  EnlaceSecundario,
  colorJugador,
  indiceColor
} from './BuscaminasLocal.jsx';

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

  const handleElegirCategoria = async (cat) => {
    const categoriaId = typeof cat === 'object' ? cat.id : cat;
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
              <label className="field-label" htmlFor="bm-code-input">Código de la partida</label>
              <input
                id="bm-code-input"
                className="lb-input-codigo qq-input-moderno"
                type="text"
                placeholder="ABCD"
                value={codigoInput}
                onChange={(e) => setCodigoInput(e.target.value.toUpperCase())}
                maxLength={4}
                autoFocus
              />

              <label className="field-label" htmlFor="bm-guest-nombre" style={{ marginTop: '1rem' }}>
                Tu nombre
              </label>
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
              {codigoCopiado
                ? '¡Copiado al portapapeles!'
                : 'Pulsa el código para copiarlo y compártelo con los demás.'}
            </p>
          </div>

          <div className="panel qq-menu-panel" style={{ marginTop: '1rem' }}>
            <h3 className="qq-sala-titulo">
              <Icon name="users" size={20} /> Jugadores ({sala.jugadores.length})
            </h3>
            <div className="lb-lista qq-sala-lista">
              {sala.jugadores.map((j) => (
                <div key={j.id} className={`lb-jug ${j.id === yoId ? 'yo' : ''}`}>
                  <span className="lb-jug-nombre">
                    {j.nombre}{j.id === yoId ? ' (tú)' : ''}{j.id === 1 ? ' 👑' : ''}
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
            <button
              type="button"
              className="big full qq-btn-principal"
              style={{ marginTop: '1rem' }}
              disabled={sala.jugadores.length < 3}
              onClick={handleIniciarPartida}
            >
              <Icon name="play" size={22} />
              {sala.jugadores.length < 3 ? 'Esperando jugadores...' : 'Iniciar juego'}
            </button>
          ) : (
            <div className="panel center" style={{ padding: '1.8rem 1.4rem', marginTop: '1rem' }}>
              <span className="lb-luna chica"><Icon name="hourglass" size={36} /></span>
              <h3 style={{ margin: '0.4rem 0' }}>Esperando al anfitrión...</h3>
              <p className="hint">
                El anfitrión iniciará la partida y elegirá la temática cuando estéis todos listos.
              </p>
            </div>
          )}
        </section>
      )}

      {/* 5. SELECTOR DE CATEGORÍA ONLINE */}
      {vista === 'sala' && sala && sala.estado === 'categoria' && (
        esAdmin ? (
          <SelectorCategorias
            categorias={categorias}
            rondaActual={sala.rondaNum}
            maxRondas={sala.maxRondas}
            onElegir={handleElegirCategoria}
            onSalir={() => setModalSalirPortada(true)}
            onAyuda={onAbrirAyuda}
            aviso="Al tocar una categoría comenzará la ronda en los móviles de todos los jugadores."
          />
        ) : (
          <section className="game qqp-escena">
            <Cabecera
              onSalir={() => setModalSalirPortada(true)}
              onAyuda={onAbrirAyuda}
              etiqueta={`Ronda ${sala.rondaNum} de ${sala.maxRondas}`}
              titulo="Eligiendo temática…"
            />
            <div className="qqp-tarjeta qqp-pasar">
              <span className="lb-luna chica"><Icon name="hourglass" size={36} /></span>
              <h3 className="qqp-pasar-nombre" style={{ fontSize: '1.5rem', marginTop: '0.4rem' }}>
                Preparando tablero
              </h3>
              <p className="qqp-texto">
                El anfitrión está seleccionando la categoría de la Ronda {sala.rondaNum}.
              </p>
            </div>
          </section>
        )
      )}

      {/* 6. TABLERO ONLINE EN JUEGO */}
      {vista === 'sala' && sala && sala.estado === 'jugando' && ronda && ronda.faseRonda === 'jugando' && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            onAyuda={onAbrirAyuda}
            categoria={{ nombre: ronda.categoriaNombre, icono: 'star' }}
            etiqueta={
              esMiTurno
                ? `Ronda ${sala.rondaNum} de ${sala.maxRondas} · ¡Es tu turno!`
                : `Ronda ${sala.rondaNum} de ${sala.maxRondas} · Turno en curso`
            }
            titulo={esMiTurno ? '¡Te toca elegir!' : `Turno de ${ronda.jugadorActivoNombre}`}
            avatar={
              <Avatar
                nombre={ronda.jugadorActivoNombre}
                color={colorJugador((ronda.jugadorActivoId ?? 1) - 1)}
              />
            }
          >
            <div className="qqp-identidad bm-consigna-box">
              <div className="bm-consigna-top">
                <span className="qqp-identidad-icono">
                  <Icon name="target" size={16} strokeWidth={2.4} />
                </span>
                <span className="bm-consigna-texto">«{ronda.consigna}»</span>
              </div>
              <div className="bm-hero-stats">
                <span className="bm-hero-stat ok">✅ {correctasDescubiertas}/{TOTAL_CORRECTOS}</span>
                <span className="bm-hero-stat danger">💣 {minasExplotadas}/{TOTAL_MINAS}</span>
                <span className={`bm-hero-stat timer${tiempoRestante <= 10 ? ' low' : ''}`}>
                  <Icon name="clock" size={14} /> {tiempoRestante}s
                </span>
              </div>
              <div className="bm-timer-track" role="timer">
                <div
                  className={`bm-timer-fill${tiempoRestante <= 10 ? ' low' : ''}`}
                  style={{ width: `${(tiempoRestante / TIEMPO_TURNO) * 100}%` }}
                />
              </div>
            </div>

            <OrdenTurnos
              jugadores={sala.jugadores}
              activoId={ronda.jugadorActivoId}
              eliminados={ronda.eliminadosRonda}
            />
          </Cabecera>

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
                }
                return (
                  <button key={c.id} type="button" className="bm-casilla-btn mina-explotada" disabled>
                    <span>💣 {c.texto}</span>
                  </button>
                );
              }

              return (
                <button
                  key={c.id}
                  type="button"
                  className="bm-casilla-btn"
                  disabled={!esMiTurno || yoEliminado}
                  onClick={() => handleSeleccionarCasilla(c.id)}
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
                  <BotonPrincipal onClick={handleCerrarExplosion}>
                    {ronda.motivoFinRonda ? 'Ver resultados de la ronda' : 'Continuar con el siguiente jugador'}
                  </BotonPrincipal>
                ) : (
                  <p className="hint small">Esperando a que el anfitrión continúe...</p>
                )}
              </div>
            </div>
          )}
        </section>
      )}

      {/* 7. FIN DE RONDA ONLINE */}
      {vista === 'sala' && sala && sala.estado === 'jugando' && ronda && ronda.faseRonda === 'ronda_fin' && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            etiqueta={`Ronda ${sala.rondaNum} de ${sala.maxRondas} completada`}
            titulo={ronda.motivoFinRonda || 'Fin de la ronda'}
          >
            <div className="qqp-identidad">
              <span className="qqp-identidad-icono"><Icon name="check" size={16} strokeWidth={2.5} /></span>
              <span>Consigna: <strong>«{ronda.consigna}»</strong></span>
            </div>
          </Cabecera>

          <div className="qqp-tarjeta">
            <p className="qqp-carta-cara-titulo" style={{ marginBottom: '0.8rem' }}>
              <Icon name="eye" size={16} /> Solución del tablero
            </p>
            <div className="bm-grid-15 bm-grid-compacto">
              {ronda.casillas.map((c) => (
                <div
                  key={c.id}
                  className={`bm-casilla-btn ${c.correcto ? 'acertada' : 'mina-explotada'}`}
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
          </div>

          <div className="qqp-tarjeta">
            <p className="qqp-carta-cara-titulo" style={{ marginBottom: '0.8rem' }}>
              <Icon name="trophy" size={16} /> Clasificación general
            </p>
            <ul className="qqp-rivales">
              {ranking.map((j, i) => {
                const lider = maximoPuntos > 0 && j.puntos === maximoPuntos;
                return (
                  <li key={j.id} className="qqp-rival" style={{ '--c': colorJugador(indiceColor(j, i)) }}>
                    <span className="qqp-rival-avatar">{lider ? '👑' : i + 1}</span>
                    <span className="qqp-rival-datos">
                      <span className="qqp-rival-nombre">{lider ? 'Líder actual' : `Puesto ${i + 1}`}</span>
                      <strong className="qqp-rival-tarjeta">{j.nombre}{j.id === yoId ? ' (tú)' : ''}</strong>
                    </span>
                    <span className="bm-ranking-pts">{j.puntos} pts</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="qqp-barra">
            {esAdmin ? (
              <>
                {sala.rondaNum < sala.maxRondas ? (
                  <BotonPrincipal onClick={handleSiguienteRonda}>
                    <Icon name="play" size={20} /> Elegir temática (Ronda {sala.rondaNum + 1} de {sala.maxRondas})
                  </BotonPrincipal>
                ) : (
                  <BotonPrincipal onClick={handleFinalizar}>
                    <Icon name="trophy" size={20} /> Ver podio final
                  </BotonPrincipal>
                )}
                <EnlaceSecundario onClick={handleFinalizar}>
                  Finalizar partida anticipadamente
                </EnlaceSecundario>
              </>
            ) : (
              <p className="qqp-estado">
                <span className="qqp-spinner" aria-hidden="true" /> Esperando a que el anfitrión continúe…
              </p>
            )}
          </div>
        </section>
      )}

      {/* 8. PODIO FINAL ONLINE */}
      {vista === 'sala' && sala && sala.estado === 'final' && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            etiqueta="Partida terminada"
            titulo="Clasificación Final"
            avatar={<span className="qqp-avatar" style={{ '--c': '#f59e0b' }}>🏆</span>}
          >
            <div className="qqp-identidad">
              <span className="qqp-identidad-icono"><Icon name="crown" size={16} /></span>
              <span>
                {ganadores.length === 0
                  ? 'Nadie ha conseguido puntos en esta partida.'
                  : ganadores.length === 1
                  ? <>¡Victoria para <strong>{ganadores[0].nombre}</strong> con <strong>{maximoPuntos} pts</strong>!</>
                  : <>Empate entre <strong>{ganadores.map((g) => g.nombre).join(', ')}</strong> con <strong>{maximoPuntos} pts</strong></>}
              </span>
            </div>
          </Cabecera>

          <div className="qqp-tarjeta">
            <p className="qqp-carta-cara-titulo" style={{ marginBottom: '0.8rem' }}>
              <Icon name="users" size={16} /> Podio de jugadores
            </p>
            <ul className="qqp-rivales">
              {ranking.map((j, i) => {
                const lider = maximoPuntos > 0 && j.puntos === maximoPuntos;
                return (
                  <li key={j.id} className="qqp-rival" style={{ '--c': colorJugador(indiceColor(j, i)) }}>
                    <span className="qqp-rival-avatar">{lider ? '👑' : i + 1}</span>
                    <span className="qqp-rival-datos">
                      <span className="qqp-rival-nombre">{lider ? '¡Ganador!' : `Puesto ${i + 1}`}</span>
                      <strong className="qqp-rival-tarjeta">{j.nombre}{j.id === yoId ? ' (tú)' : ''}</strong>
                    </span>
                    <span className="bm-ranking-pts">{j.puntos} pts</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="qqp-barra">
            <BotonPrincipal onClick={() => setModalSalirPortada(true)}>
              <Icon name="door" size={20} /> Salir a la portada
            </BotonPrincipal>
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
                ? 'Se cerrará la partida para todos y saldrás a la portada. ¿Estás seguro?'
                : 'Abandonarás la partida y volverás a la portada principal. ¿Estás seguro?'}
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