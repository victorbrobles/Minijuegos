// client/src/games/QuienMas/QuienMasOnline.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin, adminHeaders } from '../../lib/admin.js';
import Icon from '../../components/Icon.jsx';
import './QuienMas.css';
import {
  Cabecera,
  Avatar,
  OrdenTurnos,
  BotonPrincipal,
  EnlaceSecundario,
  colorJugador,
  inicial,
  indiceColor
} from './QuienMasLocal.jsx';

const CLAVE_SESION_QM = 'quienmas_online_session';
const TIEMPO_VOTO = 30;

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

export default function QuienMasOnline({
  tituloJuego = '¿De verdad os conocéis?',
  descripcionJuego,
  onLocal,
  onSalir,
  onAbrirAyuda
}) {
  const navigate = useNavigate();
  const esAdminGlobal = useAdmin();

  const [vista, setVista] = useState('menu'); // 'menu' | 'online_menu' | 'crear' | 'unirse' | 'sala'
  const [nombre, setNombre] = useState('');
  const [codigoInput, setCodigoInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);

  const [modalSalirLobby, setModalSalirLobby] = useState(false);
  const [modalSalirPortada, setModalSalirPortada] = useState(false);

  const [sesion, setSesion] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(CLAVE_SESION_QM));
    } catch {
      return null;
    }
  });

  const [sala, setSala] = useState(null);
  const [codigoCopiado, setCodigoCopiado] = useState(false);
  const [tiempoRestante, setTiempoRestante] = useState(TIEMPO_VOTO);

  const intervalRef = useRef(null);
  const timerVotoRef = useRef(null);

  const salaRef = useRef(sala);
  useEffect(() => {
    salaRef.current = sala;
  }, [sala]);

  useEffect(() => {
    if (!sesion) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setSala(null);
      return;
    }

    const consultarEstado = () => {
      fetch(`/api/quienmas/online/sala/${sesion.code}?token=${sesion.token}`)
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
          sessionStorage.removeItem(CLAVE_SESION_QM);
          setSesion(null);
          setSala(null);
          setVista('online_menu');
          setErrorMsg('La sala se ha cerrado o se ha perdido la conexión.');
        });
    };

    consultarEstado();
    intervalRef.current = setInterval(consultarEstado, 600);

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
    sessionStorage.removeItem(CLAVE_SESION_QM);
    setSesion(null);
    setSala(null);
    setModalSalirPortada(false);

    if (sesionActual?.code && sesionActual?.token) {
      fetch(`/api/quienmas/online/sala/${sesionActual.code}/salir`, {
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
    sessionStorage.removeItem(CLAVE_SESION_QM);
    setSesion(null);
    setSala(null);
    setModalSalirLobby(false);
    setVista('online_menu');

    if (sesionActual?.code && sesionActual?.token) {
      fetch(`/api/quienmas/online/sala/${sesionActual.code}/salir`, {
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
      const res = await fetch('/api/quienmas/online/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear la sala.');

      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_QM, JSON.stringify(nueva));
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
      const res = await fetch('/api/quienmas/online/unirse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codigoInput.trim().toUpperCase(), nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al unirse.');

      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_QM, JSON.stringify(nueva));
      setSesion(nueva);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleCambiarCategoria = async (cat) => {
    if (!sesion || !sala?.esAdmin) return;
    try {
      await fetch(`/api/quienmas/online/sala/${sesion.code}/categoria`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...adminHeaders() },
        body: JSON.stringify({ token: sesion.token, categoria: cat })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleIniciarPartida = async () => {
    if (!sesion) return;
    try {
      await fetch(`/api/quienmas/online/sala/${sesion.code}/iniciar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...adminHeaders() },
        body: JSON.stringify({ token: sesion.token })
      });
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleVotar = async (candidato) => {
    if (timerVotoRef.current) clearInterval(timerVotoRef.current);
    if (!sesion) return;
    try {
      await fetch(`/api/quienmas/online/sala/${sesion.code}/votar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token, candidato })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleVotarRef = useRef(handleVotar);
  useEffect(() => {
    handleVotarRef.current = handleVotar;
  });

  useEffect(() => {
    if (sala?.estado !== 'votando' || sala?.yaVoto) {
      if (timerVotoRef.current) clearInterval(timerVotoRef.current);
      return;
    }

    setTiempoRestante(TIEMPO_VOTO);

    if (timerVotoRef.current) clearInterval(timerVotoRef.current);
    timerVotoRef.current = setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev <= 1) {
          clearInterval(timerVotoRef.current);
          const s = salaRef.current;
          if (s && s.jugadores && s.jugadores.length > 0 && !s.yaVoto) {
            const candidatos = s.jugadores.map((j) => j.nombre);
            const elegido = candidatos[Math.floor(Math.random() * candidatos.length)];
            handleVotarRef.current(elegido);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerVotoRef.current) clearInterval(timerVotoRef.current);
    };
  }, [sala?.estado, sala?.rondaNum, sala?.preguntaActual, sala?.yaVoto]);

  const handleCerrarVotacion = async () => {
    if (!sesion) return;
    try {
      await fetch(`/api/quienmas/online/sala/${sesion.code}/cerrar-votacion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSiguientePregunta = async () => {
    if (!sesion) return;
    try {
      await fetch(`/api/quienmas/online/sala/${sesion.code}/siguiente-pregunta`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleVerRanking = async () => {
    if (!sesion) return;
    try {
      await fetch(`/api/quienmas/online/sala/${sesion.code}/ver-ranking`, {
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
      await fetch(`/api/quienmas/online/sala/${sesion.code}/reiniciar`, {
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

  const esAdmin = Boolean(sala?.esAdmin);
  const yoId = sala?.yoId;
  const miJugador = sala?.jugadores?.find((j) => j.id === yoId);
  const resultado = sala?.resultado;
  const ranking = [...(sala?.jugadores || [])].sort((a, b) => b.puntos - a.puntos);
  const maximoPuntos = ranking.length ? ranking[0].puntos : 0;
  const ganadores = maximoPuntos > 0 ? ranking.filter((j) => j.puntos === maximoPuntos) : [];

  const enPartidaActiva = vista === 'sala' && sala && sala.estado !== 'lobby';

  return (
    <div className={`qm-contenedor ${enPartidaActiva ? 'qq-en-partida' : ''}`}>
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
              <Icon name="users" size={44} strokeWidth={1.7} />
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
                  <span>Cada jugador vota en secreto desde su propio móvil</span>
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
                  <span>Pasando el móvil por turnos para votar en secreto</span>
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
                  <span>Sé el anfitrión y genera un código para tu grupo</span>
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
              <label className="field-label" htmlFor="qm-host-nombre">Tu nombre</label>
              <input
                id="qm-host-nombre"
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
              <label className="field-label" htmlFor="qm-code-input">Código de la partida</label>
              <input
                id="qm-code-input"
                className="lb-input-codigo qq-input-moderno"
                type="text"
                placeholder="ABCD"
                value={codigoInput}
                onChange={(e) => setCodigoInput(e.target.value.toUpperCase())}
                maxLength={4}
                autoFocus
              />

              <label className="field-label" htmlFor="qm-guest-nombre" style={{ marginTop: '1rem' }}>
                Tu nombre
              </label>
              <input
                id="qm-guest-nombre"
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

          {esAdminGlobal && esAdmin && (
            <div className="panel qq-menu-panel" style={{ marginTop: '1rem' }}>
              <span className="qq-label-destacado">
                <Icon name="lock" size={14} /> Categoría de preguntas (Admin)
              </span>
              <div className="qm-admin-cats">
                <button
                  type="button"
                  className={`qm-admin-cat-btn ${sala.categoria === 'normal' ? 'activo' : ''}`}
                  onClick={() => handleCambiarCategoria('normal')}
                >
                  😊 Normal (Todos los públicos)
                </button>
                <button
                  type="button"
                  className={`qm-admin-cat-btn ${sala.categoria === 'picante' ? 'activo' : ''}`}
                  onClick={() => handleCambiarCategoria('picante')}
                >
                  🌶️ Picante (Comprometidas)
                </button>
              </div>
            </div>
          )}

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
                Faltan al menos {3 - sala.jugadores.length} jugadores para empezar (mínimo 3).
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
                En cuanto comience la partida, verás la primera pregunta para votar en secreto.
              </p>
            </div>
          )}
        </section>
      )}

      {/* 5. SALA: VOTANDO */}
      {vista === 'sala' && sala && sala.estado === 'votando' && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            categoria={{ nombre: 'Voto secreto', icono: 'lock' }}
            etiqueta={`Ronda ${sala.rondaNum} · ${sala.totalVotaron} de ${sala.totalJugadores} han votado`}
            titulo={sala.yaVoto ? '¡Voto enviado!' : '¡Te toca votar!'}
            avatar={
              miJugador ? (
                <Avatar nombre={miJugador.nombre} color={colorJugador((miJugador.id ?? 1) - 1)} />
              ) : undefined
            }
          >
            <div className="qqp-identidad qm-consigna-box">
              <div className="qm-consigna-top">
                <span className="qqp-identidad-icono">
                  <Icon name="users" size={16} strokeWidth={2.4} />
                </span>
                <span className="qm-consigna-texto">«{sala.preguntaActual}»</span>
              </div>

              <div className="qm-hero-stats">
                <span className="qm-hero-stat ok">
                  ✅ {sala.totalVotaron}/{sala.totalJugadores} listos
                </span>
                {!sala.yaVoto && (
                  <span className={`qm-hero-stat timer${tiempoRestante <= 10 ? ' low' : ''}`}>
                    <Icon name="clock" size={14} /> {tiempoRestante}s
                  </span>
                )}
              </div>

              {!sala.yaVoto && (
                <div className="qm-timer-track" role="timer">
                  <div
                    className={`qm-timer-fill${tiempoRestante <= 10 ? ' low' : ''}`}
                    style={{ width: `${(tiempoRestante / TIEMPO_VOTO) * 100}%` }}
                  />
                </div>
              )}
            </div>

            <OrdenTurnos
              jugadores={sala.jugadores}
              activoNombre={!sala.yaVoto ? miJugador?.nombre : null}
            />
          </Cabecera>

          {!sala.yaVoto ? (
            <div className="qqp-tarjeta">
              <p className="qqp-carta-cara-titulo" style={{ marginBottom: '0.8rem' }}>
                <Icon name="check" size={16} /> Elige en secreto al jugador que mejor encaja
              </p>
              <div className="qm-candidatos-grid">
                {sala.jugadores.map((j, idx) => (
                  <button
                    key={j.id}
                    type="button"
                    className="qm-candidato-btn"
                    style={{ '--c': colorJugador(indiceColor(j, idx)) }}
                    onClick={() => handleVotar(j.nombre)}
                  >
                    <span className="qm-candidato-avatar">{inicial(j.nombre)}</span>
                    <span className="qm-candidato-nombre">
                      {j.nombre}
                      {j.id === yoId && <span className="qm-badge-tu">Tú</span>}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="qqp-tarjeta qqp-pasar">
              <span className="lb-luna chica"><Icon name="check" size={34} /></span>
              <p className="qqp-pasar-para">Tu voto secreto</p>
              <h3 className="qqp-pasar-nombre" style={{ fontSize: '1.8rem' }}>{sala.miVoto}</h3>
              <p className="qqp-texto">
                Esperando a que terminen de votar los demás jugadores ({sala.totalVotaron} de {sala.totalJugadores})…
              </p>
            </div>
          )}

          {esAdmin && (
            <div className="qqp-barra">
              <EnlaceSecundario onClick={handleCerrarVotacion}>
                <Icon name="flagFinish" size={16} /> Cerrar votación y mostrar resultados ya
              </EnlaceSecundario>
            </div>
          )}
        </section>
      )}

      {/* 6. SALA: RESULTADO DE LA RONDA */}
      {vista === 'sala' && sala && sala.estado === 'resultado' && resultado && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            etiqueta={`Ronda ${sala.rondaNum} completada`}
            titulo={
              resultado.empate
                ? '¡Empate en la votación!'
                : `Más votado: ${resultado.ganador}`
            }
            avatar={
              <span className="qqp-avatar" style={{ '--c': resultado.empate ? '#64748b' : '#f59e0b' }}>
                {resultado.empate ? '⚖️' : '🏆'}
              </span>
            }
          >
            <div className="qqp-identidad">
              <span className="qqp-identidad-icono"><Icon name="users" size={16} /></span>
              <span>«{sala.preguntaActual}»</span>
            </div>
          </Cabecera>

          <div className="qqp-tarjeta">
            <p className="qqp-carta-cara-titulo" style={{ marginBottom: '0.8rem' }}>
              <Icon name="trophy" size={16} /> Recuento de votos recibidos
            </p>
            <ul className="qqp-rivales">
              {[...sala.jugadores]
                .sort((a, b) => (resultado.recuento[b.nombre] || 0) - (resultado.recuento[a.nombre] || 0))
                .map((j, i) => {
                  const n = resultado.recuento[j.nombre] || 0;
                  const esMasVotado = !resultado.empate && j.nombre === resultado.ganador;
                  return (
                    <li key={j.id} className="qqp-rival" style={{ '--c': colorJugador(indiceColor(j, i)) }}>
                      <span className="qqp-rival-avatar">{esMasVotado ? '👑' : inicial(j.nombre)}</span>
                      <span className="qqp-rival-datos">
                        <span className="qqp-rival-nombre">
                          {esMasVotado ? '¡El más votado!' : 'Candidato'}
                        </span>
                        <strong className="qqp-rival-tarjeta">
                          {j.nombre}{j.id === yoId ? ' (tú)' : ''}
                        </strong>
                      </span>
                      <span className="qm-ranking-pts">
                        {n} {n === 1 ? 'voto' : 'votos'}
                      </span>
                    </li>
                  );
                })}
            </ul>
          </div>

          <div className="qqp-tarjeta">
            <p className="qqp-carta-cara-titulo" style={{ marginBottom: '0.8rem' }}>
              <Icon name="eye" size={16} /> ¿A quién votó cada uno?
            </p>
            <div className="qm-desglose-lista">
              {sala.jugadores.map((j) => {
                const gano = resultado.ganados[j.nombre] > 0;
                return (
                  <div key={j.id} className={`qm-desglose-fila ${gano ? 'acierto' : ''}`}>
                    <span className="qm-desglose-texto">
                      <strong>{j.nombre}</strong> votó a <strong>{resultado.votos[j.nombre] || 'Nadie'}</strong>
                    </span>
                    <span className={`qm-badge-pto ${gano ? 'pos' : ''}`}>
                      {gano ? '+1 pt' : '0 pts'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="qqp-barra">
            {esAdmin ? (
              <>
                <BotonPrincipal onClick={handleSiguientePregunta}>
                  <Icon name="play" size={20} /> Siguiente pregunta
                </BotonPrincipal>
                <EnlaceSecundario onClick={handleVerRanking}>
                  <Icon name="trophy" size={16} /> Ver clasificación general
                </EnlaceSecundario>
              </>
            ) : (
              <p className="qqp-estado">
                <span className="qqp-spinner" aria-hidden="true" /> Esperando a que el anfitrión lance la siguiente pregunta…
              </p>
            )}
          </div>
        </section>
      )}

      {/* 7. SALA: RANKING GENERAL */}
      {vista === 'sala' && sala && sala.estado === 'ranking' && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            etiqueta={`Rondas jugadas: ${sala.rondaNum}`}
            titulo="Clasificación General"
            avatar={<span className="qqp-avatar" style={{ '--c': '#f59e0b' }}>🏆</span>}
          >
            <div className="qqp-identidad">
              <span className="qqp-identidad-icono"><Icon name="crown" size={16} /></span>
              <span>
                {ganadores.length === 0
                  ? 'Nadie ha conseguido puntos todavía.'
                  : ganadores.length === 1
                  ? <>¡<strong>{ganadores[0].nombre}</strong> lidera con <strong>{maximoPuntos} {maximoPuntos === 1 ? 'pt' : 'pts'}</strong>!</>
                  : <>Empate en cabeza entre <strong>{ganadores.map((g) => g.nombre).join(', ')}</strong> con <strong>{maximoPuntos} pts</strong></>}
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
                      <span className="qqp-rival-nombre">{lider ? 'Líder' : `Puesto ${i + 1}`}</span>
                      <strong className="qqp-rival-tarjeta">
                        {j.nombre}{j.id === yoId ? ' (tú)' : ''}
                      </strong>
                    </span>
                    <span className="qm-ranking-pts">{j.puntos || 0} pts</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="qqp-barra">
            {esAdmin ? (
              <>
                <BotonPrincipal onClick={handleSiguientePregunta}>
                  <Icon name="play" size={20} /> Continuar jugando (Siguiente pregunta)
                </BotonPrincipal>
                <EnlaceSecundario onClick={handleReiniciarPartida}>
                  <Icon name="refresh" size={16} /> Reiniciar puntos y empezar de cero
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
              Abandonarás la partida actual y volverás a la portada principal. ¿Estás seguro?
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