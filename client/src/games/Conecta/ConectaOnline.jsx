// client/src/games/Conecta/ConectaOnline.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import './Conecta.css';
import ConectaPartida, { SelectorCategorias } from './ConectaPartida.jsx';
import { limitesOnline, textoSala } from '../limites.js';
import { ChipJugadores } from '../../components/MenuJuego.jsx';
import { SelectorRondas } from '../../components/MenuJuego.jsx';
import { rondasPorDefecto } from '../rondas.js';

const LIM_ON = limitesOnline('conecta');

const CLAVE_SESION_CONECTA = 'conecta_online_session';

const CATEGORIAS_METADATA = [
  { id: 'futbolistas', nombre: 'Futbolistas', icono: 'trophy' },
  { id: 'deportistas', nombre: 'Deportistas', icono: 'speedometer' },
  { id: 'famosos', nombre: 'Famosos', icono: 'users' },
  { id: 'animales', nombre: 'Animales', icono: 'whois' },
  { id: 'comidas', nombre: 'Comidas', icono: 'star' },
  { id: 'paises', nombre: 'Países', icono: 'globe' },
  { id: 'videojuegos', nombre: 'Videojuegos', icono: 'zap' },
  { id: 'cine', nombre: 'Cine y Series', icono: 'clapperboard' },
  { id: 'musica', nombre: 'Música', icono: 'letters' },
  { id: 'historia', nombre: 'Historia', icono: 'detective' }
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

export default function ConectaOnline({
  tituloJuego = 'Conecta 4',
  descripcionJuego,
  onLocal,
  onSalir,
  onAbrirAyuda
}) {
  const [rondasSel, setRondasSel] = useState(rondasPorDefecto('conecta'));
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
      return JSON.parse(sessionStorage.getItem(CLAVE_SESION_CONECTA));
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
      fetch(`/api/conecta/online/sala/${sesion.code}?token=${sesion.token}`)
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
          sessionStorage.removeItem(CLAVE_SESION_CONECTA);
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
    sessionStorage.removeItem(CLAVE_SESION_CONECTA);
    setSesion(null);
    setSala(null);
    setModalSalirPortada(false);

    if (sesionActual?.code && sesionActual?.token) {
      fetch(`/api/conecta/online/sala/${sesionActual.code}/salir`, {
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
    sessionStorage.removeItem(CLAVE_SESION_CONECTA);
    setSesion(null);
    setSala(null);
    setModalSalirLobby(false);
    setVista('online_menu');

    if (sesionActual?.code && sesionActual?.token) {
      fetch(`/api/conecta/online/sala/${sesionActual.code}/salir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesionActual.token }),
        keepalive: true
      }).catch(() => {});
    }
  };

  const esAdmin = Boolean(sala?.esAdmin);
  const yoId = sala?.yoId;
  
  const handleCrear = async () => {
    if (!nombre.trim()) return;
    setErrorMsg('');
    setCargando(true);
    try {
      const res = await fetch('/api/conecta/online/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear la sala.');
      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_CONECTA, JSON.stringify(nueva));
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
      const res = await fetch('/api/conecta/online/unirse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codigoInput.trim().toUpperCase(), nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al unirse.');
      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_CONECTA, JSON.stringify(nueva));
      setSesion(nueva);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleIniciarJuego = async () => {
    if (!sesion) return;
    try {
      await fetch(`/api/conecta/online/sala/${sesion.code}/iniciar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token, rondas: rondasSel })
      });
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleSeleccionarCategoria = async (catId) => {
    if (!sesion) return;
    try {
      const res = await fetch(`/api/conecta/online/sala/${sesion.code}/seleccionar-categoria`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token, categoriaId: catId })
      });
      const data = await res.json();
      if (res.ok && data.success) setSala(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Acciones de la ronda: listo · confirmar · tema · saltar-turno · finalizar-ronda
  const handleAccion = async (tipo, datos = {}) => {
    if (!sesion) return { error: 'Sin sesión.' };
    try {
      const res = await fetch(`/api/conecta/online/sala/${sesion.code}/accion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token, tipo, ...datos })
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error || 'No se pudo completar la acción.' };
      if (data.success) setSala(data);
      return data.resultado || { ok: true };
    } catch {
      return { error: 'Se ha perdido la conexión con la sala.' };
    }
  };

  const handleSiguienteRonda = async () => {
    if (!sesion) return;
    try {
      await fetch(`/api/conecta/online/sala/${sesion.code}/siguiente-ronda`, {
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
      await fetch(`/api/conecta/online/sala/${sesion.code}/finalizar`, {
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
      await fetch(`/api/conecta/online/sala/${sesion.code}/reiniciar`, {
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

  const ranking = [...(sala?.jugadores || [])].sort((a, b) => b.puntos - a.puntos);
  const maximoPuntos = ranking.length ? ranking[0].puntos : 0;
  const ganadores = maximoPuntos > 0 ? ranking.filter((j) => j.puntos === maximoPuntos) : [];
  const enPartidaActiva = vista === 'sala' && sala && sala.estado !== 'lobby';

  return (
    <div className={`cc-contenedor ${enPartidaActiva ? 'qq-en-partida' : ''}`}>

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
              <Icon name="connect" size={44} strokeWidth={1.7} />
            </div>
            <h1 className="title qq-main-title">{tituloJuego}</h1>
            <ChipJugadores juegoId="conecta" />
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
              <label className="field-label" htmlFor="cc-host-nombre">Tu nombre</label>
              <input
                id="cc-host-nombre"
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
              <label className="field-label" htmlFor="cc-code-input">Código de la partida</label>
              <input
                id="cc-code-input"
                className="lb-input-codigo qq-input-moderno"
                type="text"
                placeholder="ABCD"
                value={codigoInput}
                onChange={(e) => setCodigoInput(e.target.value.toUpperCase())}
                maxLength={4}
                autoFocus
              />

              <label className="field-label" htmlFor="cc-guest-nombre" style={{ marginTop: '1rem' }}>Tu nombre</label>
              <input
                id="cc-guest-nombre"
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
                    {j.nombre}{j.id === yoId ? ' (tú)' : ''}{j.id === 1 ? ' 👑' : ''}
                  </span>
                </div>
              ))}
            </div>
            {sala.jugadores.length < LIM_ON.min && (
              <p className="hint" style={{ marginTop: '0.8rem' }}>
                {LIM_ON.min - sala.jugadores.length === 1 ? 'Falta al menos 1 jugador' : `Faltan al menos ${LIM_ON.min - sala.jugadores.length} jugadores`} para poder empezar (mínimo {LIM_ON.min}).
              </p>
            )}
          </div>

          {esAdmin && (
            <div className="panel qq-menu-panel" style={{ marginTop: '1rem' }}>
              <SelectorRondas juegoId="conecta" valor={rondasSel} onCambiar={setRondasSel} numJugadores={sala.jugadores.length} />
            </div>
          )}
          {esAdmin ? (
            <div style={{ marginTop: '1.2rem' }}>
              <button
                type="button"
                className="big full qq-btn-principal"
                disabled={sala.jugadores.length < LIM_ON.min}
                onClick={handleIniciarJuego}
              >
                <Icon name="play" size={22} />
                {sala.jugadores.length < LIM_ON.min ? 'Esperando jugadores...' : '¡Elegir Categoría y Empezar!'}
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

      {/* 5. SALA: SELECTOR DE CATEGORÍA */}
      {vista === 'sala' && sala && sala.estado === 'categoria' && (
        esAdmin ? (
          <SelectorCategorias
            categorias={CATEGORIAS_METADATA}
            onElegir={handleSeleccionarCategoria}
            onVolver={() => setModalSalirPortada(true)}
            onAyuda={onAbrirAyuda}
            aviso="Al seleccionarla, aparecerá el tablero en todos los móviles."
            etiqueta={`Ronda ${sala.rondaActual + 1}`}
          />
        ) : (
          <section className="game cnp-escena">
            <header className="cnp-hero">
              <span className="cnp-hero-deco" aria-hidden="true" style={{ position: 'absolute', right: '-28px', bottom: '-34px', color: 'rgba(255, 255, 255, 0.12)', transform: 'rotate(-12deg)' }}>
                <Icon name="connect" size={150} strokeWidth={1.4} />
              </span>
              <div className="cnp-hero-top">
                <button type="button" className="cnp-salir" onClick={() => setModalSalirPortada(true)}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                  <span>Portada</span>
                </button>
              </div>
              <p className="cnp-etiqueta" style={{ color: 'rgba(255,255,255,0.9)' }}>Ronda {sala.rondaActual + 1}</p>
              <h2 className="cnp-titulo" style={{ color: '#fff', fontSize: '2.1rem', marginBottom: 0, textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>Esperando al anfitrión</h2>
              <p className="cnp-hero-aviso">El anfitrión está eligiendo la temática de esta ronda.</p>
            </header>
            <div className="cnp-tarjeta" style={{ textAlign: 'center', padding: '3rem 1.5rem', marginTop: '1rem' }}>
              <span className="lb-luna chica" style={{ margin: '0 auto 1rem' }}><Icon name="hourglass" size={40} /></span>
              <h3>Eligiendo categoría...</h3>
              <p className="hint">En cuanto la seleccione, aparecerá el tablero en tu pantalla.</p>
            </div>
          </section>
        )
      )}

      {/* 6. SALA: JUGANDO ONLINE */}
      {vista === 'sala' && sala && (sala.estado === 'juego' || sala.estado === 'ronda_fin') && sala.partida && (
        <ConectaPartida
          partida={sala.partida}
          yoId={yoId}
          esAdmin={esAdmin}
          onAccion={handleAccion}
          onSalir={() => setModalSalirPortada(true)}
          finRonda={esAdmin ? (
            <>
              {sala.rondaActual >= sala.maxRondas ? (
                <button type="button" className="cnp-boton grande" onClick={handleFinalizarPartida}>
                  <Icon name="trophy" size={20} /> Ver el podio final
                </button>
              ) : (
              <button type="button" className="cnp-boton grande" onClick={handleSiguienteRonda}>
                <Icon name="play" size={20} /> Nueva ronda ({sala.rondaActual + 1} de {sala.maxRondas})
              </button>
              )}
              <button type="button" className="cnp-enlace" onClick={handleFinalizarPartida}>
                <Icon name="trophy" size={16} /> Finalizar partida
              </button>
            </>
          ) : (
            <p className="cnp-espera">Esperando a que el anfitrión empiece otra ronda o termine la partida…</p>
          )}
        />
      )}

      {/* 7. SALA: PODIO FINAL */}
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
                      {j.nombre} {j.id === yoId ? '(Tú)' : ''}
                    </span>
                    <span className="score-pts">{pts} pts</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="actions" style={{ marginTop: '1.5rem' }}>
            {esAdmin && (
              <button type="button" className="big full qq-btn-principal" onClick={handleReiniciarPartida}>
                <Icon name="refresh" size={20} /> Otra Partida (mismos jugadores)
              </button>
            )}
            <button type="button" className="secondary danger full" onClick={() => setModalSalirPortada(true)}>
              <Icon name="door" size={20} /> Volver a la portada
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