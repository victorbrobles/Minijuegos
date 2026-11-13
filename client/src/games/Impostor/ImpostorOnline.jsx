// client/src/games/Impostor/ImpostorOnline.jsx
import SalonFama from '../../components/SalonFama.jsx';
import { useRegistrarPartida, ganadoresPorPuntos } from '../../lib/registros.js';
import { nombreIdentidad } from '../../lib/identidad.js';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import './Impostor.css';
import {
  Cabecera,
  Avatar,
  OrdenTurnos,
  SelectorModosImpostor,
  BotonPrincipal,
  EnlaceSecundario,
  MODOS_IMPOSTOR,
  colorJugador,
  indiceColor
} from './ImpostorLocal.jsx';
import { limitesOnline, textoSala } from '../limites.js';
import { ChipJugadores } from '../../components/MenuJuego.jsx';
import { SelectorRondas } from '../../components/MenuJuego.jsx';
import { rondasPorDefecto } from '../rondas.js';

const LIM_ON = limitesOnline('impostor');

const CLAVE_SESION_IMP = 'impostor_online_session';

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

export default function ImpostorOnline({
  tituloJuego = 'Miente como puedas',
  descripcionJuego,
  onLocal,
  onSalir,
  onAbrirAyuda
}) {
  const [rondasSel, setRondasSel] = useState(rondasPorDefecto('impostor'));
  const navigate = useNavigate();
  const [vista, setVista] = useState('menu'); // 'menu' | 'online_menu' | 'crear' | 'unirse' | 'sala'
  const [nombre, setNombre] = useState(nombreIdentidad);
  const [codigoInput, setCodigoInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);

  const [modalSalirLobby, setModalSalirLobby] = useState(false);
  const [modalSalirPortada, setModalSalirPortada] = useState(false);

  const [eligiendoModo, setEligiendoModo] = useState(false);
  const [modoAdmin, setModoAdmin] = useState('clasico');

  const [sesion, setSesion] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(CLAVE_SESION_IMP));
    } catch {
      return null;
    }
  });

  const [sala, setSala] = useState(null);
  const [codigoCopiado, setCodigoCopiado] = useState(false);
  const [ocultarPalabra, setOcultarPalabra] = useState(false);

  const [ganador, setGanador] = useState('impostor');
  const [rondasSobrevividas, setRondasSobrevividas] = useState(1);

  const intervalRef = useRef(null);

  useEffect(() => {
    if (!sesion) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setSala(null);
      return undefined;
    }

    const consultarEstado = () => {
      fetch(`/api/impostor/online/sala/${sesion.code}?token=${sesion.token}`)
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
          sessionStorage.removeItem(CLAVE_SESION_IMP);
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
    sessionStorage.removeItem(CLAVE_SESION_IMP);
    setSesion(null);
    setSala(null);
    setModalSalirPortada(false);

    if (sesionActual?.code && sesionActual?.token) {
      fetch(`/api/impostor/online/sala/${sesionActual.code}/salir`, {
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
    sessionStorage.removeItem(CLAVE_SESION_IMP);
    setSesion(null);
    setSala(null);
    setModalSalirLobby(false);
    setEligiendoModo(false);
    setVista('online_menu');

    if (sesionActual?.code && sesionActual?.token) {
      fetch(`/api/impostor/online/sala/${sesionActual.code}/salir`, {
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
      const res = await fetch('/api/impostor/online/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear la sala.');

      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_IMP, JSON.stringify(nueva));
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
      const res = await fetch('/api/impostor/online/unirse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codigoInput.trim().toUpperCase(), nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al unirse.');

      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_IMP, JSON.stringify(nueva));
      setSesion(nueva);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleIniciarConModo = async (modoElegido) => {
    if (!sesion) return;
    setModoAdmin(modoElegido);
    setOcultarPalabra(false);
    setEligiendoModo(false);
    try {
      await fetch(`/api/impostor/online/sala/${sesion.code}/iniciar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token, modo: modoElegido, ...(sala?.estado === 'lobby' ? { rondas: rondasSel } : {}) })
      });
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleIrResolucion = async () => {
    if (!sesion) return;
    setGanador('impostor');
    setRondasSobrevividas(1);
    try {
      await fetch(`/api/impostor/online/sala/${sesion.code}/ir-resolucion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolver = async () => {
    if (!sesion) return;
    try {
      await fetch(`/api/impostor/online/sala/${sesion.code}/resolver`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: sesion.token,
          ganador,
          rondasSobrevividas
        })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSiguientePartida = async () => {
    if (!sesion) return;
    setOcultarPalabra(false);
    try {
      await fetch(`/api/impostor/online/sala/${sesion.code}/siguiente-partida`, {
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
      await fetch(`/api/impostor/online/sala/${sesion.code}/finalizar`, {
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
    setEligiendoModo(false);
    try {
      await fetch(`/api/impostor/online/sala/${sesion.code}/reiniciar`, {
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
  const esImpostor = Boolean(sala?.esImpostor);
  const yoId = sala?.yoId;
  const miJugador = sala?.jugadores?.find((j) => j.id === yoId);
  const jugadorInicialObj = sala?.jugadores?.find((j) => j.nombre === sala?.nombreInicial);
  const infoModoActual = MODOS_IMPOSTOR.find((m) => m.id === (sala?.modoJuego || modoAdmin)) || MODOS_IMPOSTOR[0];

  const ranking = [...(sala?.jugadores || [])].sort((a, b) => b.puntos - a.puntos);
  const maximoPuntos = ranking.length ? ranking[0].puntos : 0;
  const ganadores = maximoPuntos > 0 ? ranking.filter((j) => j.puntos === maximoPuntos) : [];

  const enPartidaActiva = vista === 'sala' && sala && (sala.estado !== 'lobby' || eligiendoModo);

  // Salón de la fama: se guarda la partida al llegar a la pantalla final
  useRegistrarPartida('impostor', sala?.estado === 'final' ? ganadoresPorPuntos((sala?.jugadores || []).filter((j) => !j.fuera && !j.abandonado).map((j) => ({ nombre: j.nombre, puntos: j.puntos ?? null }))) : null);
  return (
    <div className={`imp-contenedor ${enPartidaActiva ? 'qq-en-partida' : ''}`}>
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
              <Icon name="eye" size={44} strokeWidth={1.7} />
            </div>
            <h1 className="title qq-main-title">{tituloJuego}</h1>
            <ChipJugadores juegoId="impostor" />
            <p className="hint qq-main-desc">{descripcionJuego}</p>
            <SalonFama juegoId="impostor" />

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
                  <span>Cada jugador recibe su rol secreto en su propio móvil</span>
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
                  <span>Pasando el móvil por turnos para mirar el rol en secreto</span>
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
                  <span>Sé el anfitrión, genera un código y elige el modo de juego</span>
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
              <label className="field-label" htmlFor="imp-host-nombre">Tu nombre</label>
              <input
                id="imp-host-nombre"
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
              <label className="field-label" htmlFor="imp-code-input">Código de la partida</label>
              <input
                id="imp-code-input"
                className="lb-input-codigo qq-input-moderno"
                type="text"
                placeholder="ABCD"
                value={codigoInput}
                onChange={(e) => setCodigoInput(e.target.value.toUpperCase())}
                maxLength={4}
                autoFocus
              />

              <label className="field-label" htmlFor="imp-guest-nombre" style={{ marginTop: '1rem' }}>
                Tu nombre
              </label>
              <input
                id="imp-guest-nombre"
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

      {/* 4A. SALA DE ESPERA (LOBBY - SOLO JUGADORES) */}
      {vista === 'sala' && sala && sala.estado === 'lobby' && !eligiendoModo && (
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
            {sala.jugadores.length < LIM_ON.min && (
              <p className="hint" style={{ marginTop: '0.8rem' }}>
                {LIM_ON.min - sala.jugadores.length === 1 ? 'Falta al menos 1 jugador' : `Faltan al menos ${LIM_ON.min - sala.jugadores.length} jugadores`} para poder empezar (mínimo {LIM_ON.min}).
              </p>
            )}
          </div>

          {esAdmin && (
            <div className="panel qq-menu-panel" style={{ marginTop: '1rem' }}>
              <SelectorRondas juegoId="impostor" valor={rondasSel} onCambiar={setRondasSel} numJugadores={sala.jugadores.length} />
            </div>
          )}
          {esAdmin ? (
            <button
              type="button"
              className="big full qq-btn-principal"
              style={{ marginTop: '1rem' }}
              disabled={sala.jugadores.length < LIM_ON.min}
              onClick={() => setEligiendoModo(true)}
            >
              <Icon name="play" size={22} />
              {sala.jugadores.length < LIM_ON.min ? 'Esperando jugadores...' : 'Continuar y elegir modo de juego'}
            </button>
          ) : (
            <div className="panel center" style={{ padding: '1.8rem 1.4rem', marginTop: '1rem' }}>
              <span className="lb-luna chica"><Icon name="hourglass" size={36} /></span>
              <h3 style={{ margin: '0.4rem 0' }}>Esperando al anfitrión...</h3>
              <p className="hint">
                En cuanto el anfitrión elija el modo de juego y reparta los roles, verás tu palabra secreta.
              </p>
            </div>
          )}
        </section>
      )}

      {/* 4B. PANTALLA DE ELECCIÓN DE TIPO DE JUEGO (ANFITRIÓN) */}
      {vista === 'sala' && sala && eligiendoModo && esAdmin && (
        <SelectorModosImpostor
          rondaActual={(sala.rondaActual || 0) + 1}
          modoSeleccionado={modoAdmin}
          onElegirModo={handleIniciarConModo}
          onSalir={() => setEligiendoModo(false)}
          textoSalir="Volver"
          onAyuda={onAbrirAyuda}
        />
      )}

      {/* 5. SALA EN JUEGO */}
      {vista === 'sala' && sala && sala.estado === 'en_juego' && !eligiendoModo && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            categoria={{ nombre: infoModoActual.nombre, icono: infoModoActual.icono }}
            etiqueta={`Ronda ${sala.rondaActual} de ${sala.maxRondas} · ${esImpostor ? '🎭 Eres el Impostor' : '👤 Eres del Pueblo'}`}
            titulo={`Empieza: ${sala.nombreInicial}`}
            avatar={
              miJugador ? (
                <Avatar nombre={miJugador.nombre} color={colorJugador(indiceColor(miJugador, 0))} />
              ) : undefined
            }
          >
            <div className="qqp-identidad">
              <span className="qqp-identidad-icono"><Icon name="dice" size={16} /></span>
              <span>Abre el debate hablando: <strong>{sala.nombreInicial}</strong></span>
            </div>

            <OrdenTurnos
              jugadores={sala.jugadores}
              activoId={jugadorInicialObj?.id}
            />
          </Cabecera>

          {!ocultarPalabra ? (
            <div className={`qqp-tarjeta imp-rol-card ${esImpostor ? 'es-impostor' : 'es-pueblo'}`}>
              <span className={`imp-rol-badge ${esImpostor ? 'impostor' : 'pueblo'}`}>
                {esImpostor ? '🎭 Rol secreto: Impostor' : '👤 Tu palabra secreta'}
              </span>

              <h3 className={`imp-palabra-secreta ${esImpostor ? 'impostor' : 'pueblo'}`}>
                {esImpostor ? '¡ERES EL IMPOSTOR!' : sala.miPalabra}
              </h3>

              {esImpostor ? (
                <>
                  {sala.modoJuego === 'clasico' && (
                    <p className="imp-rol-instruccion">
                      No tienes ninguna pista. Escucha a los demás e intenta pasar desapercibido.
                    </p>
                  )}
                  {sala.modoJuego === 'pista' && (
                    <div className="imp-pista-box ambar">
                      <span className="imp-pista-label">🔍 Tu pista exclusiva</span>
                      <strong className="imp-pista-valor">{sala.infoImpostor}</strong>
                    </div>
                  )}
                  {sala.modoJuego === 'camuflado' && (
                    <div className="imp-pista-box violeta">
                      <span className="imp-pista-label">🎭 Tu palabra camuflada</span>
                      <strong className="imp-pista-valor">{sala.infoImpostor}</strong>
                      <span className="imp-pista-nota">Actúa como si esta fuera la palabra de todos.</span>
                    </div>
                  )}
                  {sala.modoJuego === 'preguntas' && (
                    <div className="imp-pista-box azul">
                      <span className="imp-pista-label">❓ Categoría de la palabra</span>
                      <strong className="imp-pista-valor">{sala.infoImpostor}</strong>
                    </div>
                  )}
                </>
              ) : (
                <p className="imp-rol-instruccion">
                  {sala.modoJuego === 'preguntas'
                    ? 'Por turnos, elegid a otro jugador y hacedle una pregunta de «Sí» o «No» sobre esta palabra para cazar al impostor.'
                    : 'Da una pista sutil sobre la palabra: ni tan evidente que el impostor la adivine, ni tan extraña que sospechen de ti.'}
                </p>
              )}

              <button
                type="button"
                className="imp-btn-privacidad"
                onClick={() => setOcultarPalabra(true)}
              >
                <Icon name="eye" size={16} /> Ocultar mi pantalla por privacidad
              </button>
            </div>
          ) : (
            <div className="qqp-tarjeta qqp-pasar">
              <span className="lb-luna chica"><Icon name="lock" size={34} /></span>
              <p className="qqp-pasar-para">Modo privacidad activo</p>
              <h3 className="qqp-pasar-nombre" style={{ fontSize: '1.6rem' }}>Rol oculto</h3>
              <p className="qqp-texto" style={{ marginBottom: '1rem' }}>
                Tu pantalla está protegida para que nadie a tu alrededor vea tu palabra o tu rol.
              </p>
              <button
                type="button"
                className="imp-btn-privacidad mostrar"
                onClick={() => setOcultarPalabra(false)}
              >
                <Icon name="eye" size={16} /> Volver a mostrar mi rol
              </button>
            </div>
          )}

          <div className="qqp-barra">
            {esAdmin ? (
              <BotonPrincipal onClick={handleIrResolucion}>
                <Icon name="flagFinish" size={20} /> Finalizar debate y resolver
              </BotonPrincipal>
            ) : (
              <p className="qqp-estado">
                <span className="qqp-spinner" aria-hidden="true" /> El anfitrión cerrará el debate cuando decidáis votar…
              </p>
            )}
          </div>
        </section>
      )}

      {/* 6. SALA: RESOLUCIÓN */}
      {vista === 'sala' && sala && sala.estado === 'resolucion' && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            categoria={{ nombre: infoModoActual.nombre, icono: infoModoActual.icono }}
            etiqueta={`Ronda ${sala.rondaActual} de ${sala.maxRondas} · Resolución`}
            titulo={esAdmin ? '¿Quién ha ganado?' : 'Resolviendo partida…'}
          />

          {esAdmin ? (
            <>
              <div className="qqp-tarjeta imp-resolucion-panel">
                <p className="qqp-carta-cara-titulo" style={{ justifyContent: 'center', width: '100%' }}>
                  <Icon name="trophy" size={16} /> Selecciona al ganador de la ronda
                </p>

                <div className="imp-ganador-grid">
                  <button
                    type="button"
                    className={`imp-btn-ganador ${ganador === 'impostor' ? 'activa' : ''}`}
                    onClick={() => setGanador('impostor')}
                  >
                    <span>🎭 El Impostor</span>
                    <small>+10 pts base</small>
                  </button>
                  <button
                    type="button"
                    className={`imp-btn-ganador ${ganador === 'pueblo' ? 'activa' : ''}`}
                    onClick={() => setGanador('pueblo')}
                  >
                    <span>👥 El Pueblo</span>
                    <small>+3 pts cada uno</small>
                  </button>
                </div>

                <div className="imp-rondas-box">
                  <p className="qqp-carta-cara-titulo" style={{ justifyContent: 'center', width: '100%' }}>
                    <Icon name="zap" size={16} /> ¿Cuántas rondas sobrevivió el impostor?
                  </p>
                  <p className="imp-sub-nota">Suma +3 puntos extra por cada vuelta superada sin ser expulsado:</p>

                  <div className="imp-big-stepper">
                    <button
                      type="button"
                      className="imp-big-stepper-btn"
                      onClick={() => setRondasSobrevividas(Math.max(0, rondasSobrevividas - 1))}
                    >
                      &minus;
                    </button>
                    <span className="imp-big-stepper-val">{rondasSobrevividas}</span>
                    <button
                      type="button"
                      className="imp-big-stepper-btn"
                      onClick={() => setRondasSobrevividas(rondasSobrevividas + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="qqp-barra">
                <BotonPrincipal onClick={handleResolver}>
                  <Icon name="check" size={20} strokeWidth={2.5} /> Calcular puntuaciones para todos
                </BotonPrincipal>
              </div>
            </>
          ) : (
            <div className="qqp-tarjeta qqp-pasar">
              <span className="lb-luna chica"><Icon name="hourglass" size={34} /></span>
              <p className="qqp-pasar-para">Recuento final</p>
              <h3 className="qqp-pasar-nombre" style={{ fontSize: '1.6rem' }}>
                Calculando puntos
              </h3>
              <p className="qqp-texto">
                El anfitrión está indicando el ganador de la ronda para revelar al impostor y repartir los puntos…
              </p>
            </div>
          )}
        </section>
      )}

      {/* 7. SALA: RESULTADOS DE LA RONDA */}
      {vista === 'sala' && sala && sala.estado === 'resultados' && !eligiendoModo && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            etiqueta={`Ronda ${sala.rondaActual} de ${sala.maxRondas} completada`}
            titulo={sala.ganador === 'impostor' ? '¡Victoria del Impostor!' : '¡Victoria del Pueblo!'}
            avatar={
              <span className="qqp-avatar" style={{ '--c': sala.ganador === 'impostor' ? '#ef4444' : '#10b981' }}>
                {sala.ganador === 'impostor' ? '🎭' : '👥'}
              </span>
            }
          >
            <div className="qqp-identidad">
              <span className="qqp-identidad-icono"><Icon name="check" size={16} strokeWidth={2.5} /></span>
              <span>
                Impostor: <strong>{sala.nombreImpostor}</strong>
                {sala.miPalabra ? <> · Palabra: <strong>«{sala.miPalabra}»</strong></> : null}
              </span>
            </div>
          </Cabecera>

          <div className="qqp-tarjeta">
            <p className="qqp-carta-cara-titulo" style={{ marginBottom: '0.8rem' }}>
              <Icon name="zap" size={16} /> Puntos sumados en esta ronda
            </p>
            <div className="imp-desglose-lista">
              {sala.jugadores.map((j) => {
                const delta = sala.puntosRonda?.[j.id] || 0;
                const esImp = j.nombre === sala.nombreImpostor;
                return (
                  <div key={j.id} className={`imp-desglose-fila ${delta > 0 ? 'gano' : ''}`}>
                    <span className="imp-desglose-nombre">
                      <span>{esImp ? '🎭' : '👤'}</span>
                      <strong>{j.nombre}{j.id === yoId ? ' (tú)' : ''}</strong>
                      <small className="imp-rol-mini">{esImp ? 'Impostor' : 'Pueblo'}</small>
                    </span>
                    <span className={`imp-badge-pts ${delta > 0 ? 'pos' : ''}`}>
                      +{delta} pts
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="qqp-tarjeta">
            <p className="qqp-carta-cara-titulo" style={{ marginBottom: '0.8rem' }}>
              <Icon name="trophy" size={16} /> Clasificación general
            </p>
            <ul className="qqp-rivales">
              {ranking.map((j, i) => {
                const pts = j.puntos ?? 0;
                const lider = maximoPuntos > 0 && pts === maximoPuntos;
                return (
                  <li key={j.id} className="qqp-rival" style={{ '--c': colorJugador(indiceColor(j, i)) }}>
                    <span className="qqp-rival-avatar">{lider ? '👑' : i + 1}</span>
                    <span className="qqp-rival-datos">
                      <span className="qqp-rival-nombre">{lider ? 'Líder actual' : `Puesto ${i + 1}`}</span>
                      <strong className="qqp-rival-tarjeta">
                        {j.nombre}{j.id === yoId ? ' (tú)' : ''}
                      </strong>
                    </span>
                    <span className="imp-ranking-pts">{pts} pts</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="qqp-barra">
            {esAdmin ? (
              <>
                {sala.rondaActual >= sala.maxRondas ? (
                  <BotonPrincipal onClick={handleFinalizarPartida}>
                    <Icon name="trophy" size={20} /> Ver el podio final
                  </BotonPrincipal>
                ) : (
                  <>
                    <BotonPrincipal onClick={handleSiguientePartida}>
                      <Icon name="play" size={20} /> Siguiente ronda ({sala.rondaActual + 1} de {sala.maxRondas})
                    </BotonPrincipal>
                    <EnlaceSecundario onClick={() => setEligiendoModo(true)}>
                      Cambiar modo de juego para la siguiente
                    </EnlaceSecundario>
                  </>
                )}
                <EnlaceSecundario onClick={handleFinalizarPartida}>
                  Finalizar partida y ver podio 🏆
                </EnlaceSecundario>
              </>
            ) : (
              <p className="qqp-estado">
                <span className="qqp-spinner" aria-hidden="true" /> Esperando a que el anfitrión inicie la siguiente partida…
              </p>
            )}
          </div>
        </section>
      )}

      {/* 8. SALA: PODIO FINAL */}
      {vista === 'sala' && sala && sala.estado === 'final' && !eligiendoModo && (
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
                  ? 'Nadie ha sumado puntos en esta partida.'
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
                const pts = j.puntos ?? 0;
                const lider = maximoPuntos > 0 && pts === maximoPuntos;
                return (
                  <li key={j.id} className="qqp-rival" style={{ '--c': colorJugador(indiceColor(j, i)) }}>
                    <span className="qqp-rival-avatar">{lider ? '👑' : i + 1}</span>
                    <span className="qqp-rival-datos">
                      <span className="qqp-rival-nombre">{lider ? '¡Ganador!' : `Puesto ${i + 1}`}</span>
                      <strong className="qqp-rival-tarjeta">
                        {j.nombre}{j.id === yoId ? ' (tú)' : ''}
                      </strong>
                    </span>
                    <span className="imp-ranking-pts">{pts} pts</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="qqp-barra">
            {esAdmin && (
              <BotonPrincipal onClick={handleReiniciarPartida}>
                <Icon name="refresh" size={20} /> Otra partida (mismos jugadores)
              </BotonPrincipal>
            )}
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