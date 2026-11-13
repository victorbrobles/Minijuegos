// client/src/games/Telepatia/TelepatiaOnline.jsx
import SalonFama from '../../components/SalonFama.jsx';
import { useRegistrarPartida, ganadoresPorPuntos } from '../../lib/registros.js';
import { nombreIdentidad } from '../../lib/identidad.js';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import './Telepatia.css';
import {
  Cabecera,
  Avatar,
  OrdenTurnos,
  BotonPrincipal,
  EnlaceSecundario,
  colorJugador,
  indiceColor
} from './TelepatiaLocal.jsx';
import { limitesOnline, textoSala } from '../limites.js';
import { ChipJugadores } from '../../components/MenuJuego.jsx';
import { SelectorRondas } from '../../components/MenuJuego.jsx';
import { rondasPorDefecto } from '../rondas.js';

const LIM_ON = limitesOnline('telepatia');

const CLAVE_SESION_TEL = 'telepatia_online_session';

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

export default function TelepatiaOnline({
  tituloJuego = 'Telepatía',
  descripcionJuego,
  onLocal,
  onSalir,
  onAbrirAyuda
}) {
  const [rondasSel, setRondasSel] = useState(rondasPorDefecto('telepatia'));
  const navigate = useNavigate();
  const [vista, setVista] = useState('menu'); // 'menu' | 'online_menu' | 'crear' | 'unirse' | 'sala'
  const [nombre, setNombre] = useState(nombreIdentidad);
  const [codigoInput, setCodigoInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);

  const [modalSalirLobby, setModalSalirLobby] = useState(false);
  const [modalSalirPortada, setModalSalirPortada] = useState(false);
  const [codigoCopiado, setCodigoCopiado] = useState(false);

  // Input de palabra del jugador
  const [miPalabra, setMiPalabra] = useState('');
  const [haEnviado, setHaEnviado] = useState(false);

  const [sala, setSala] = useState(null);
  const [sesion, setSesion] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(CLAVE_SESION_TEL));
    } catch {
      return null;
    }
  });

  const intervalRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!sesion) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setSala(null);
      return undefined;
    }

    const consultarEstado = () => {
      fetch(`/api/telepatia/sala/${sesion.code}?token=${sesion.token}`)
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error('Sala no disponible'))))
        .then((d) => {
          if (d.success) {
            setSala(d);
            setVista('sala');
          }
        })
        .catch(() => {
          sessionStorage.removeItem(CLAVE_SESION_TEL);
          setSesion(null);
          setSala(null);
          setVista('online_menu');
          setErrorMsg('La sala se ha cerrado o se ha perdido la conexión.');
        });
    };

    consultarEstado();
    intervalRef.current = setInterval(consultarEstado, 800);
    return () => clearInterval(intervalRef.current);
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

  const peticionPost = async (endpoint, extraBody = {}) => {
    setCargando(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/telepatia/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion?.token, code: sesion?.code, ...extraBody })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error en la petición');
      if (data.token) {
        const nueva = { code: data.code, token: data.token };
        sessionStorage.setItem(CLAVE_SESION_TEL, JSON.stringify(nueva));
        setSesion(nueva);
      }
      return data;
    } catch (err) {
      setErrorMsg(err.message);
      return null;
    } finally {
      setCargando(false);
    }
  };

  const handleCrear = () => nombre.trim() && peticionPost('crear', { nombre: nombre.trim() });
  const handleUnirse = () =>
    nombre.trim() &&
    codigoInput.trim() &&
    peticionPost('unirse', { nombre: nombre.trim(), joinCode: codigoInput.trim().toUpperCase() });

  const handleVolverMenuOnline = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    const sesionActual = sesion;
    sessionStorage.removeItem(CLAVE_SESION_TEL);
    setSesion(null);
    setSala(null);
    setModalSalirLobby(false);
    setVista('online_menu');

    if (sesionActual?.code && sesionActual?.token) {
      fetch(`/api/telepatia/sala/${sesionActual.code}/salir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesionActual.token, code: sesionActual.code }),
        keepalive: true
      }).catch(() => {});
    }
  };

  const handleCerrarSalaYSalirAPortada = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    const sesionActual = sesion;
    sessionStorage.removeItem(CLAVE_SESION_TEL);
    setSesion(null);
    setSala(null);
    setModalSalirPortada(false);

    if (sesionActual?.code && sesionActual?.token) {
      fetch(`/api/telepatia/sala/${sesionActual.code}/salir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesionActual.token, code: sesionActual.code }),
        keepalive: true
      }).catch(() => {});
    }

    redirigirAPortada();
  };

  const copiarCodigo = () => {
    if (!sala?.code) return;
    navigator.clipboard?.writeText(sala.code);
    setCodigoCopiado(true);
    setTimeout(() => setCodigoCopiado(false), 2000);
  };

  useEffect(() => {
    if (sala?.estado === 'escribiendo') {
      setMiPalabra('');
      setHaEnviado(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [sala?.estado, sala?.rondaNum]);

  const enviarPalabra = (e) => {
    if (e) e.preventDefault();
    if (!miPalabra.trim() || haEnviado) return;
    setHaEnviado(true);
    peticionPost(`sala/${sesion.code}/enviar-palabra`, { palabra: miPalabra.trim() });
  };

  const yo = sala?.jugadores?.find((j) => j.esTu);
  const esAdmin = Boolean(yo?.esAdmin);
  const faltan = sala?.jugadores ? Math.max(0, LIM_ON.min - sala.jugadores.length) : LIM_ON.min;

  const ranking = sala?.jugadores ? [...sala.jugadores].sort((a, b) => b.puntos - a.puntos) : [];
  const maxPuntos = ranking.length > 0 ? ranking[0].puntos : 0;
  const ganadores = maxPuntos > 0 ? ranking.filter((j) => j.puntos === maxPuntos) : [];

  const enPartidaActiva = vista === 'sala' && sala && sala.estado !== 'lobby';

  // Salón de la fama: se guarda la partida al llegar a la pantalla final
  useRegistrarPartida('telepatia', sala?.estado === 'fin' ? ganadoresPorPuntos((sala?.jugadores || []).filter((j) => !j.fuera && !j.abandonado).map((j) => ({ nombre: j.nombre, puntos: j.puntos ?? null }))) : null);
  return (
    <div className={`tel-contenedor ${enPartidaActiva ? 'qq-en-partida' : ''}`}>
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
            <ChipJugadores juegoId="telepatia" />
            <p className="hint qq-main-desc">{descripcionJuego}</p>
            <SalonFama juegoId="telepatia" />

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
                  <span>Cada jugador escribe su palabra en 5 segundos desde su móvil</span>
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
                  <span>Diciendo la palabra en voz alta a la vez y apuntando coincidencias</span>
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
                  <span>Sé el anfitrión y genera un código para tu grupo (mínimo {LIM_ON.min})</span>
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
              <label className="field-label" htmlFor="tel-host-nombre">Tu nombre</label>
              <input
                id="tel-host-nombre"
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
              <label className="field-label" htmlFor="tel-code-input">Código de la partida</label>
              <input
                id="tel-code-input"
                className="lb-input-codigo qq-input-moderno"
                type="text"
                placeholder="ABCD"
                value={codigoInput}
                onChange={(e) => setCodigoInput(e.target.value.toUpperCase())}
                maxLength={4}
                autoFocus
              />

              <label className="field-label" htmlFor="tel-guest-nombre" style={{ marginTop: '1rem' }}>
                Tu nombre
              </label>
              <input
                id="tel-guest-nombre"
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
              <Icon name="users" size={20} /> Jugadores ({sala.jugadores.length}/20)
            </h3>
            <div className="lb-lista qq-sala-lista">
              {sala.jugadores.map((j) => (
                <div key={j.id} className={`lb-jug ${j.esTu ? 'yo' : ''}`}>
                  <span className="lb-jug-nombre">
                    {j.nombre}{j.esTu ? ' (tú)' : ''}{j.esAdmin ? ' 👑' : ''}
                  </span>
                </div>
              ))}
            </div>
            {faltan > 0 && (
              <p className="hint" style={{ marginTop: '0.8rem' }}>
                Faltan al menos {faltan} jugador{faltan === 1 ? '' : 'es'} para poder empezar (mínimo {LIM_ON.min}).
              </p>
            )}
          </div>

          {errorMsg && <p className="error" style={{ margin: '0.8rem 0' }}>{errorMsg}</p>}

          {esAdmin && (
            <div className="panel qq-menu-panel" style={{ marginTop: '1rem' }}>
              <SelectorRondas juegoId="telepatia" valor={rondasSel} onCambiar={setRondasSel} numJugadores={sala.jugadores.length} />
            </div>
          )}
          {esAdmin ? (
            <button
              type="button"
              className="big full qq-btn-principal"
              style={{ marginTop: '1rem' }}
              disabled={faltan > 0}
              onClick={() => peticionPost(`sala/${sesion.code}/iniciar`, { rondas: rondasSel })}
            >
              <Icon name="play" size={22} />
              {faltan > 0 ? `Esperando jugadores (mínimo ${LIM_ON.min})...` : '¡Iniciar juego!'}
            </button>
          ) : (
            <div className="panel center" style={{ padding: '1.8rem 1.4rem', marginTop: '1rem' }}>
              <span className="lb-luna chica"><Icon name="hourglass" size={36} /></span>
              <h3 style={{ margin: '0.4rem 0' }}>Esperando al anfitrión...</h3>
              <p className="hint">
                El anfitrión iniciará la partida cuando estéis todos listos (mínimo {LIM_ON.min} jugadores).
              </p>
            </div>
          )}
        </section>
      )}

      {/* 5. ESCRIBIENDO (5 SEGUNDOS) */}
      {vista === 'sala' && sala && sala.estado === 'escribiendo' && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            categoria={{ nombre: '¡5 segundos!', icono: 'clock' }}
            etiqueta={`Ronda ${sala.rondaNum} de ${sala.maxRondas} · Palabra de origen`}
            titulo={sala.palabraActual}
            avatar={
              yo ? <Avatar nombre={yo.nombre} color={colorJugador(indiceColor(yo, 0))} /> : undefined
            }
          >
            <div className="qqp-identidad tel-consigna-box">
              <div className="tel-hero-stats">
                <span className="tel-hero-stat">
                  ⚡ ¡Piensa rápido y conecta mentes!
                </span>
                <span className={`tel-hero-stat timer${sala.segundosRestantes <= 2 ? ' low' : ''}`}>
                  <Icon name="clock" size={14} /> {sala.segundosRestantes}s
                </span>
              </div>
              <div className="tel-timer-track" role="timer">
                <div
                  className={`tel-timer-fill${sala.segundosRestantes <= 2 ? ' low' : ''}`}
                  style={{ width: `${(Math.max(0, sala.segundosRestantes) / 5) * 100}%` }}
                />
              </div>
            </div>

            <OrdenTurnos jugadores={sala.jugadores} />
          </Cabecera>

          <form onSubmit={enviarPalabra} className="qqp-tarjeta tel-form-card">
            <div className={`tel-countdown ${sala.segundosRestantes <= 2 ? 'peligro' : ''}`}>
              {sala.segundosRestantes}
            </div>

            <label className="qq-label-destacado" htmlFor="tel-online-input">
              {haEnviado
                ? '¡Palabra enviada! Esperando el cierre de la ronda…'
                : `Escribe una palabra asociada con «${sala.palabraActual}»`}
            </label>

            <input
              id="tel-online-input"
              ref={inputRef}
              type="text"
              className="qq-input-moderno tel-input-palabra"
              placeholder="TU PALABRA..."
              value={miPalabra}
              disabled={haEnviado || sala.segundosRestantes <= 0}
              onChange={(e) => setMiPalabra(e.target.value.toUpperCase())}
              maxLength={20}
            />

            <div style={{ marginTop: '1rem' }}>
              <BotonPrincipal
                type="submit"
                disabled={haEnviado || !miPalabra.trim() || sala.segundosRestantes <= 0}
              >
                <Icon name="check" size={20} strokeWidth={2.5} />
                {haEnviado ? '¡Palabra enviada!' : 'Enviar palabra'}
              </BotonPrincipal>
            </div>
          </form>
        </section>
      )}

      {/* 6. RESULTADO DE LA RONDA */}
      {vista === 'sala' && sala && sala.estado === 'resultado' && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            etiqueta={`Ronda ${sala.rondaNum} de ${sala.maxRondas} completada`}
            titulo="Resultados de la ronda"
          >
            <div className="qqp-identidad">
              <span className="qqp-identidad-icono"><Icon name="zap" size={16} /></span>
              <span>{sala.logRonda}</span>
            </div>
          </Cabecera>

          <div className="qqp-tarjeta">
            <p className="qqp-carta-cara-titulo" style={{ marginBottom: '0.8rem' }}>
              <Icon name="eye" size={16} /> Palabras enviadas
            </p>
            <div className="tel-grupos-lista">
              {sala.gruposCoincidentes?.map((g, i) => (
                <div key={i} className={`tel-grupo-card ${g.coincide ? 'coincidencia' : ''}`}>
                  <div className="tel-grupo-cab">
                    <span className="tel-grupo-palabra">«{g.palabra}»</span>
                    {g.coincide && (
                      <span className="tel-grupo-pts">
                        +{g.puntosSumados} {g.puntosSumados === 1 ? 'pt' : 'pts'}
                      </span>
                    )}
                  </div>
                  <div className="tel-chips-jugadores">
                    {g.jugadores.map((n, idx) => (
                      <span key={idx} className="tel-chip-jug">👤 {n}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="qqp-tarjeta">
            <p className="qqp-carta-cara-titulo" style={{ marginBottom: '0.8rem' }}>
              <Icon name="trophy" size={16} /> Clasificación actual
            </p>
            <ul className="qqp-rivales">
              {ranking.map((j, i) => {
                const lider = maxPuntos > 0 && j.puntos === maxPuntos;
                return (
                  <li key={j.id} className="qqp-rival" style={{ '--c': colorJugador(indiceColor(j, i)) }}>
                    <span className="qqp-rival-avatar">{lider ? '👑' : i + 1}</span>
                    <span className="qqp-rival-datos">
                      <span className="qqp-rival-nombre">
                        {lider ? 'Líder actual' : `Puesto ${i + 1}`}
                        {j.racha > 1 ? ` · 🔥 Racha x${j.racha}` : ''}
                      </span>
                      <strong className="qqp-rival-tarjeta">
                        {j.nombre}{j.esTu ? ' (tú)' : ''}
                      </strong>
                    </span>
                    <span className="tel-ranking-pts">{j.puntos} pts</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="qqp-barra">
            {esAdmin ? (
              <>
                <BotonPrincipal onClick={() => peticionPost(`sala/${sesion.code}/siguiente`)}>
                  <Icon name="play" size={20} />
                  {sala.rondaNum >= sala.maxRondas ? 'Ver podio final' : `Ir a Ronda ${sala.rondaNum + 1} de ${sala.maxRondas}`}
                </BotonPrincipal>
                <EnlaceSecundario onClick={() => peticionPost(`sala/${sesion.code}/terminar-ya`)}>
                  Finalizar partida anticipadamente
                </EnlaceSecundario>
              </>
            ) : (
              <p className="qqp-estado">
                <span className="qqp-spinner" aria-hidden="true" /> Esperando a que el anfitrión lance la siguiente ronda…
              </p>
            )}
          </div>
        </section>
      )}

      {/* 7. FIN / PODIO ONLINE */}
      {vista === 'sala' && sala && sala.estado === 'fin' && (
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
                  ? 'Nadie consiguió conectar mentes en esta partida.'
                  : ganadores.length === 1
                  ? <>¡Victoria para <strong>{ganadores[0].nombre}</strong> con <strong>{maxPuntos} pts</strong>!</>
                  : <>Empate entre <strong>{ganadores.map((g) => g.nombre).join(', ')}</strong> con <strong>{maxPuntos} pts</strong></>}
              </span>
            </div>
          </Cabecera>

          <div className="qqp-tarjeta">
            <p className="qqp-carta-cara-titulo" style={{ marginBottom: '0.8rem' }}>
              <Icon name="users" size={16} /> Podio de jugadores
            </p>
            <ul className="qqp-rivales">
              {ranking.map((j, i) => {
                const lider = maxPuntos > 0 && j.puntos === maxPuntos;
                return (
                  <li key={j.id} className="qqp-rival" style={{ '--c': colorJugador(indiceColor(j, i)) }}>
                    <span className="qqp-rival-avatar">{lider ? '👑' : i + 1}</span>
                    <span className="qqp-rival-datos">
                      <span className="qqp-rival-nombre">{lider ? '¡Ganador!' : `Puesto ${i + 1}`}</span>
                      <strong className="qqp-rival-tarjeta">
                        {j.nombre}{j.esTu ? ' (tú)' : ''}
                      </strong>
                    </span>
                    <span className="tel-ranking-pts">{j.puntos} pts</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="qqp-barra">
            {esAdmin && (
              <BotonPrincipal onClick={() => peticionPost(`sala/${sesion.code}/iniciar`, { rondas: rondasSel })}>
                <Icon name="refresh" size={20} /> Jugar otra vez (mismos jugadores)
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