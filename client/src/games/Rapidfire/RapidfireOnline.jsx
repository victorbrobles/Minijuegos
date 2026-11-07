// client/src/games/Rapidfire/RapidfireOnline.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import CategoryCard from '../../components/CategoryCard.jsx';
import './Rapidfire.css';
import '../Adivina/Adivina.css';

const CLAVE_SESION_RF = 'rapidfire_online_session';
const TIEMPO_S = 60;

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

export default function RapidfireOnline({
  tituloJuego = 'Rápido y certero',
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
      return JSON.parse(sessionStorage.getItem(CLAVE_SESION_RF));
    } catch {
      return null;
    }
  });

  const [sala, setSala] = useState(null);
  const [codigoCopiado, setCodigoCopiado] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!sesion) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setSala(null);
      return;
    }

    const consultarEstado = () => {
      fetch(`/api/rapidfire/online/sala/${sesion.code}?token=${sesion.token}`)
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
          sessionStorage.removeItem(CLAVE_SESION_RF);
          setSesion(null);
          setSala(null);
          setVista('online_menu');
          setErrorMsg('La sala se ha cerrado.');
        });
    };

    consultarEstado();
    intervalRef.current = setInterval(consultarEstado, 550);

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

    sessionStorage.removeItem(CLAVE_SESION_RF);
    setSesion(null);
    setSala(null);
    setModalSalirPortada(false);
    redirigirAPortada();
  };

  const handleVolverMenuOnline = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    sessionStorage.removeItem(CLAVE_SESION_RF);
    setSesion(null);
    setSala(null);
    setModalSalirLobby(false);
    setVista('online_menu');
  };

  const handleCrear = async () => {
    if (!nombre.trim()) return;
    setCargando(true);
    try {
      const res = await fetch('/api/rapidfire/online/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_RF, JSON.stringify(nueva));
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
      const res = await fetch('/api/rapidfire/online/unirse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codigoInput.trim().toUpperCase(), nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_RF, JSON.stringify(nueva));
      setSesion(nueva);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleIniciarPartida = async () => {
    try {
      const res = await fetch(`/api/rapidfire/online/sala/${sesion.code}/iniciar`, {
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
      const res = await fetch(`/api/rapidfire/online/sala/${sesion.code}/elegir-categoria`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token, categoriaId })
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAccionJuez = async (accion) => {
    try {
      const res = await fetch(`/api/rapidfire/online/sala/${sesion.code}/accion-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token, accion })
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
    } catch (err) {
      console.error(err);
    }
  };

  const handleContinuarRonda = async () => {
    try {
      await fetch(`/api/rapidfire/online/sala/${sesion.code}/continuar-ronda`, {
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
      await fetch(`/api/rapidfire/online/sala/${sesion.code}/finalizar`, {
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
  const esMiTurno = ronda?.jugadorTurnoId === yoId;

  const ranking = sala?.jugadores ? [...sala.jugadores].sort((a, b) => b.puntos - a.puntos) : [];
  const maximo = ranking.length ? ranking[0].puntos : 0;
  const ganadores = maximo > 0 ? ranking.filter((j) => j.puntos === maximo) : [];

  const enPartidaActiva = vista === 'sala' && sala && sala.estado !== 'lobby';

  return (
    <div className={`rf-contenedor ${enPartidaActiva ? 'qq-en-partida' : ''}`}>
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
              <Icon name="zap" size={44} strokeWidth={1.7} />
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
                  <span>Sé el anfitrión y actúa como juez en los retos</span>
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
              Introduce tu nombre de anfitrión (serás el juez de las respuestas).
            </p>

            <div className="lb-form qq-form-estilizado">
              <label className="field-label" htmlFor="rf-host-nombre">Tu nombre</label>
              <input
                id="rf-host-nombre"
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
              Introduce el código de 4 letras que te ha compartido el anfitrión.
            </p>

            <div className="lb-form qq-form-estilizado">
              <label className="field-label" htmlFor="rf-code-input">Código de la sala</label>
              <input
                id="rf-code-input"
                className="lb-input-codigo qq-input-moderno"
                type="text"
                placeholder="ABCD"
                value={codigoInput}
                onChange={(e) => setCodigoInput(e.target.value.toUpperCase())}
                maxLength={4}
                style={{ textTransform: 'uppercase', letterSpacing: '4px', textAlign: 'center', fontWeight: '800' }}
                autoFocus
              />

              <label className="field-label" htmlFor="rf-guest-nombre" style={{ marginTop: '1rem' }}>Tu nombre</label>
              <input
                id="rf-guest-nombre"
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

      {/* 4. SALA: LOBBY */}
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
              {codigoCopiado ? '¡Copiado al portapapeles!' : 'Comparte este código para que se unan (mínimo 2 jugadores).'}
            </p>
          </div>

          <div className="panel" style={{ marginTop: '1rem' }}>
            <h3 className="panel-title"><Icon name="users" size={20} /> Jugadores ({sala.jugadores.length}/10)</h3>
            <div className="lb-lista">
              {sala.jugadores.map((j) => (
                <div key={j.id} className={`lb-jug ${j.id === yoId ? 'yo' : ''}`}>
                  <span className="lb-jug-nombre">{j.nombre}{j.id === yoId ? ' (tú)' : ''}{j.id === 1 ? ' 👑' : ''}</span>
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
                onClick={handleIniciarPartida}
              >
                <Icon name="play" size={22} />
                {sala.jugadores.length < 2 ? 'Esperando rivales...' : '¡Empezar Partida!'}
              </button>
            </div>
          ) : (
            <div className="panel center" style={{ padding: '2rem 1.5rem', marginTop: '1rem' }}>
              <span className="lb-luna chica"><Icon name="hourglass" size={40} /></span>
              <h3 style={{ margin: '0.5rem 0' }}>Esperando al anfitrión...</h3>
              <p className="hint">El anfitrión comenzará la partida cuando estéis todos listos.</p>
            </div>
          )}
        </section>
      )}

      {/* 5. ELECCIÓN DE CATEGORÍA */}
      {vista === 'sala' && sala && sala.estado === 'categorias' && ronda && (
        <section className="game">
          <div className="panel qq-menu-panel">
            <div className="qq-card-top" style={{ marginBottom: '0.8rem' }}>
              <BotonVolver texto="Volver a la portada" onClick={() => setModalSalirPortada(true)} />
              <span className="qq-tablero-badge" style={{ marginBottom: 0 }}>
                Ronda {sala.rondaNum}
              </span>
            </div>

            <div className="starter" style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
              <Icon name="dice" size={28} />
              <p style={{ margin: 0 }}>
                {esMiTurno ? (
                  <strong>¡Es tu turno de elegir categoría!</strong>
                ) : (
                  <>Abre la ronda <strong>{ronda.jugadorTurnoNombre}</strong></>
                )}
              </p>
            </div>

            <div className="qq-section-header">
              <h3 className="qq-section-title">
                {esMiTurno ? 'Selecciona una de las 3 opciones:' : `Esperando a que ${ronda.jugadorTurnoNombre} elija categoría...`}
              </h3>
            </div>

            <div className="rf-opciones">
              {ronda.opciones.map((c, idx) => (
                <CategoryCard
                  key={c.id}
                  nombre={c.nombre}
                  icono={c.icono}
                  indice={idx}
                  onClick={esMiTurno ? () => handleElegirCategoria(c.id) : undefined}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. TURNO EN JUEGO */}
      {vista === 'sala' && sala && sala.estado === 'turno' && ronda && (
        <section className="game">
          <div className="panel qq-menu-panel">
            <div className="qq-card-top" style={{ marginBottom: '0.8rem' }}>
              <BotonVolver texto="Volver a la portada" onClick={() => setModalSalirPortada(true)} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="qq-tablero-badge" style={{ marginBottom: 0 }}>
                  {ronda.intento > 0 ? 'Rebote' : `Ronda ${sala.rondaNum}`}
                </span>
              </div>
            </div>

            {ronda.motivo && (
              <p className="rf-aviso" role="status" style={{ marginBottom: '1rem' }}>
                <Icon name={ronda.motivo === 'tiempo' ? 'hourglass' : 'refresh'} size={22} />
                {ronda.motivo === 'tiempo' ? '¡Se acabó el tiempo!' : '¡Rebote!'} Le toca a <strong>{ronda.jugadorTurnoNombre}</strong>
              </p>
            )}

            <div className="starter" style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <span>
                {esMiTurno ? <strong>¡Es tu turno de hablar!</strong> : <>Turno de: <strong>{ronda.jugadorTurnoNombre}</strong></>}
              </span>
            </div>

            <p className="categoria" style={{ display: 'inline-flex', margin: '0 auto 1rem', width: 'fit-content' }}>
              <Icon name={ronda.categoria.icono} size={16} /> {ronda.categoria.nombre}
            </p>

            <div className="sigla-card rf-reto">
              <div className="rf-reto-numero" style={{ color: '#dc2626', fontSize: '3.5rem', fontWeight: '900', lineHeight: 1 }}>{ronda.reto.n}</div>
              <div className="rf-reto-texto" style={{ color: '#1e293b', fontSize: '1.25rem', fontWeight: '600', marginTop: '0.5rem' }}>{ronda.reto.texto}</div>
            </div>

            <div className="timer" role="timer" aria-label="Tiempo restante" style={{ marginTop: '0.5rem' }}>
              <div
                className={`timer-bar${ronda.segsPrep === 0 && ronda.segsTurno <= 10 ? ' low' : ''}`}
                style={{ width: `${(ronda.segsTurno / TIEMPO_S) * 100}%` }}
              />
            </div>
            <p className="timer-text">
              <Icon name="clock" size={16} />
              {ronda.segsPrep > 0 ? `Preparados… ${ronda.segsPrep}` : `${ronda.segsTurno} s`}
            </p>

            {esAdmin ? (
              <div className="rf-panel-juez">
                <span className="rf-badge-juez">👑 Panel de control del Juez</span>
                <p className="hint small" style={{ margin: '0 0 0.8rem' }}>
                  Escucha las respuestas de <strong>{ronda.jugadorTurnoNombre}</strong> y pulsa según corresponda:
                </p>
                <div className="rf-botones-juez">
                  <button
                    type="button"
                    className="rf-btn-correcto"
                    disabled={ronda.segsPrep > 0}
                    onClick={() => handleAccionJuez('acierto')}
                  >
                    <Icon name="check" size={22} strokeWidth={2.5} /> Correcto
                  </button>
                  <button
                    type="button"
                    className="rf-btn-rebote"
                    disabled={ronda.segsPrep > 0}
                    onClick={() => handleAccionJuez('rebote')}
                  >
                    <Icon name="refresh" size={22} strokeWidth={2.5} /> Rebote
                  </button>
                </div>
                <button
                  type="button"
                  className="secondary danger full"
                  onClick={() => handleAccionJuez('rendirse')}
                >
                  <Icon name="flag" size={18} /> Rendirse (nadie puntúa)
                </button>
              </div>
            ) : (
              <div className="status-alert info" style={{ textAlign: 'center', marginTop: '1rem' }}>
                El anfitrión (👑) está juzgando las respuestas en directo...
              </div>
            )}
          </div>
        </section>
      )}

      {/* 7. PUNTUACIONES */}
      {vista === 'sala' && sala && sala.estado === 'puntuaciones' && (
        <section className="game">
          <div className="panel qq-menu-panel">
            <div className="qq-card-top" style={{ marginBottom: '0.8rem' }}>
              <BotonVolver texto="Volver a la portada" onClick={() => setModalSalirPortada(true)} />
            </div>

            <div className="end-card" style={{ border: 'none', boxShadow: 'none', padding: '0 0 1rem' }}>
              <span className="end-icon"><Icon name="trophy" size={44} /></span>
              <h1 className="title">Puntuaciones</h1>
              {ronda?.ultimo && (
                <p className="reveal">
                  {ronda.ultimo.tipo === 'rendido'
                    ? 'Ronda finalizada: nadie suma puntos en este turno.'
                    : ronda.ultimo.tipo === 'rebote'
                    ? <><strong>{ronda.ultimo.jugador}</strong> ha cogido el rebote y se lleva <strong>{ronda.ultimo.puntos} puntos</strong>.</>
                    : <><strong>{ronda.ultimo.jugador}</strong> ha dicho todos los elementos y suma <strong>{ronda.ultimo.puntos} puntos</strong>.</>}
                </p>
              )}

              <div className="scoreboard">
                {ranking.map((j, i) => (
                  <div key={j.id} className={`score-row${i === 0 && j.puntos > 0 ? ' first' : ''}`}>
                    <span className="score-name">
                      {i === 0 && j.puntos > 0 ? <Icon name="crown" size={22} /> : <span className="pos">{i + 1}</span>}
                      {j.nombre}
                    </span>
                    <span className="score-pts">{j.puntos} pts</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {esAdmin ? (
                <>
                  <button type="button" className="big full qq-btn-principal" onClick={handleContinuarRonda}>
                    <Icon name="play" size={20} /> Siguiente ronda ({sala.rondaNum + 1})
                  </button>
                  <div className="qq-tablero-footer" style={{ marginTop: 0, paddingTop: '0.6rem', borderTop: 'none' }}>
                    <button type="button" className="qq-link-otra-ronda" onClick={handleFinalizar}>
                      Finalizar partida anticipadamente
                    </button>
                  </div>
                </>
              ) : (
                <p className="hint center">Esperando a que el anfitrión avance de ronda...</p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 8. FINAL */}
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
              {ranking.map((j, i) => (
                <div key={j.id} className={`score-row${i === 0 && j.puntos > 0 ? ' first' : ''}`}>
                  <span className="score-name">
                    {i === 0 && j.puntos > 0 ? <Icon name="crown" size={22} /> : <span className="pos">{i + 1}</span>}
                    {j.nombre}
                  </span>
                  <span className="score-pts">{j.puntos} pts</span>
                </div>
              ))}
            </div>
          </div>

          <div className="actions" style={{ marginTop: '1.5rem' }}>
            <button className="secondary danger full" onClick={() => setModalSalirPortada(true)}>
              <Icon name="door" size={20} /> Salir a la portada
            </button>
          </div>
        </section>
      )}

      {/* MODAL SALIR DEL LOBBY */}
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

      {/* MODAL SALIR A PORTADA */}
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