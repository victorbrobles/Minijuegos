// client/src/games/Rapidfire/RapidfireOnline.jsx
import SalonFama from '../../components/SalonFama.jsx';
import { useRegistrarPartida, ganadoresPorPuntos } from '../../lib/registros.js';
import { nombreIdentidad } from '../../lib/identidad.js';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import './Rapidfire.css';
import {
  Aviso,
  Avatar,
  Cabecera,
  OrdenTurnos,
  OpcionesCategoria,
  BotonPrincipal,
  EnlaceSecundario,
  colorJugador,
  indiceColor
} from './RapidfireLocal.jsx';
import { limitesOnline, textoSala } from '../limites.js';
import { ChipJugadores } from '../../components/MenuJuego.jsx';
import { SelectorRondas } from '../../components/MenuJuego.jsx';
import { rondasPorDefecto } from '../rondas.js';

const LIM_ON = limitesOnline('rapidfire');

const CLAVE_SESION_RF = 'rapidfire_online_session';
const TIEMPO_S = 60;
const PREPARACION_S = 3;
const PUNTOS_POR_ACIERTO = 2;

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
  const [rondasSel, setRondasSel] = useState(rondasPorDefecto('rapidfire'));
  const navigate = useNavigate();
  // 'menu' | 'online_menu' | 'crear' | 'unirse' | 'sala'
  const [vista, setVista] = useState('menu');
  const [nombre, setNombre] = useState(nombreIdentidad);
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

  const [eventoAviso, setEventoAviso] = useState(null);
  const avisoSeqRef = useRef(0);
  const ultimoAvisoKeyRef = useRef('');

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

  // Avisos flotantes cuando hay rebote o termina la ronda
  useEffect(() => {
    if (!sala?.ronda) return;
    const r = sala.ronda;

    if (sala.estado === 'turno' && r.intento > 0 && r.motivo) {
      const key = `rebote-${sala.rondaNum}-${r.intento}-${r.jugadorTurnoId}`;
      if (key !== ultimoAvisoKeyRef.current) {
        ultimoAvisoKeyRef.current = key;
        avisoSeqRef.current += 1;
        setEventoAviso({
          n: avisoSeqRef.current,
          tipo: r.motivo === 'tiempo' ? 'tiempo' : 'rebote',
          texto:
            r.motivo === 'tiempo'
              ? `¡Tiempo agotado! Rebote para ${r.jugadorTurnoNombre}`
              : `¡Rebote para ${r.jugadorTurnoNombre}!`
        });
      }
    } else if (sala.estado === 'puntuaciones' && r.ultimo) {
      const key = `fin-${sala.rondaNum}-${r.ultimo.tipo}-${r.ultimo.jugador || ''}`;
      if (key !== ultimoAvisoKeyRef.current) {
        ultimoAvisoKeyRef.current = key;
        avisoSeqRef.current += 1;
        setEventoAviso({
          n: avisoSeqRef.current,
          tipo: r.ultimo.tipo === 'rendido' ? 'rendido' : 'acierto',
          texto:
            r.ultimo.tipo === 'rendido'
              ? 'Ronda finalizada sin puntos.'
              : `¡${r.ultimo.jugador} completa el reto y suma +${r.ultimo.puntos} puntos!`
        });
      }
    }
  }, [sala]);

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

  const notificarSalidaServidor = (sesionActual) => {
    if (sesionActual?.code && sesionActual?.token) {
      fetch(`/api/rapidfire/online/sala/${sesionActual.code}/salir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesionActual.token }),
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
    sessionStorage.removeItem(CLAVE_SESION_RF);
    setSesion(null);
    setSala(null);
    setModalSalirPortada(false);
    notificarSalidaServidor(sesionActual);
    redirigirAPortada();
  };

  const handleVolverMenuOnline = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const sesionActual = sesion;
    sessionStorage.removeItem(CLAVE_SESION_RF);
    setSesion(null);
    setSala(null);
    setModalSalirLobby(false);
    notificarSalidaServidor(sesionActual);
    setVista('online_menu');
  };

  const handleCrear = async () => {
    if (!nombre.trim()) return;
    setErrorMsg('');
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
    setErrorMsg('');
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
        body: JSON.stringify({ token: sesion.token, rondas: rondasSel })
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
  const esAdmin = Boolean(sala?.esAdmin);
  const yoId = sala?.yoId;
  const esMiTurno = ronda?.jugadorTurnoId === yoId;

  const ranking = sala?.jugadores ? [...sala.jugadores].sort((a, b) => b.puntos - a.puntos) : [];
  const maximo = ranking.length ? ranking[0].puntos : 0;
  const ganadores = maximo > 0 ? ranking.filter((j) => j.puntos === maximo) : [];

  const enPartidaActiva = vista === 'sala' && sala && sala.estado !== 'lobby';

  // Salón de la fama: se guarda la partida al llegar a la pantalla final
  useRegistrarPartida('rapidfire', sala?.estado === 'final' ? ganadoresPorPuntos((sala?.jugadores || []).filter((j) => !j.fuera && !j.abandonado).map((j) => ({ nombre: j.nombre, puntos: j.puntos ?? null }))) : null);
  return (
    <div className={`rf-contenedor ${enPartidaActiva ? 'qq-en-partida' : ''}`}>
      <Aviso evento={eventoAviso} />

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
            <ChipJugadores juegoId="rapidfire" />
            <p className="hint qq-main-desc">{descripcionJuego}</p>
            <SalonFama juegoId="rapidfire" />

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
                  handleCrear(); // se crea la sala con el nombre elegido al entrar
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
              <p className="qq-jugaras">Jugarás como <b>{nombre}</b></p>
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
              <label className="field-label" htmlFor="rf-code-input">Código de la partida</label>
              <input
                id="rf-code-input"
                className="lb-input-codigo qq-input-moderno"
                type="text"
                placeholder="ABCD"
                value={codigoInput}
                onChange={(e) => setCodigoInput(e.target.value.toUpperCase())}
                maxLength={4}
                autoFocus
              />

              <p className="qq-jugaras">Jugarás como <b>{nombre}</b></p>
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
              {codigoCopiado ? '¡Copiado al portapapeles!' : 'Comparte este código para que se unan (mínimo {LIM_ON.min} jugadores).'}
            </p>
          </div>

          <div className="panel qq-menu-panel" style={{ marginTop: '1rem' }}>
            <h3 className="qq-sala-titulo"><Icon name="users" size={20} /> Jugadores ({sala.jugadores.length}/10)</h3>
            <div className="lb-lista qq-sala-lista">
              {sala.jugadores.map((j) => (
                <div key={j.id} className={`lb-jug ${j.id === yoId ? 'yo' : ''}`}>
                  <span className="lb-jug-nombre">{j.nombre}{j.id === yoId ? ' (tú)' : ''}{j.id === 1 ? ' 👑' : ''}</span>
                </div>
              ))}
            </div>
            {sala.jugadores.length < LIM_ON.min && (
              <p className="hint" style={{ marginTop: '0.8rem' }}>
                Faltan jugadores para poder empezar (mínimo {LIM_ON.min}).
              </p>
            )}
          </div>

          {esAdmin && (
            <div className="panel qq-menu-panel" style={{ marginTop: '1rem' }}>
              <SelectorRondas juegoId="rapidfire" valor={rondasSel} onCambiar={setRondasSel} numJugadores={sala.jugadores.length} />
            </div>
          )}
          {esAdmin ? (
            <button
              type="button"
              className="big full qq-btn-principal"
              style={{ marginTop: '1rem' }}
              disabled={sala.jugadores.length < LIM_ON.min}
              onClick={handleIniciarPartida}
            >
              <Icon name="play" size={22} />
              {sala.jugadores.length < LIM_ON.min ? 'Esperando rivales...' : 'Iniciar juego'}
            </button>
          ) : (
            <div className="panel center" style={{ padding: '1.8rem 1.4rem', marginTop: '1rem' }}>
              <span className="lb-luna chica"><Icon name="hourglass" size={36} /></span>
              <h3 style={{ margin: '0.4rem 0' }}>Esperando al anfitrión...</h3>
              <p className="hint">El anfitrión comenzará la partida cuando estéis todos listos.</p>
            </div>
          )}
        </section>
      )}

      {/* 5. ELECCIÓN DE CATEGORÍA ONLINE (Con botón de ayuda) */}
      {vista === 'sala' && sala && sala.estado === 'categorias' && ronda && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            onAyuda={onAbrirAyuda}
            etiqueta={`Ronda ${sala.rondaNum} de ${sala.maxRondas} · ${esMiTurno ? '¡Te toca elegir!' : `Abre la ronda ${ronda.jugadorTurnoNombre}`}`}
            titulo={esMiTurno ? 'Elige una temática' : `${ronda.jugadorTurnoNombre} elige temática…`}
            avatar={
              <Avatar
                nombre={ronda.jugadorTurnoNombre}
                color={colorJugador((ronda.jugadorTurnoId ?? 1) - 1)}
              />
            }
          >
            <OrdenTurnos
              jugadores={sala.jugadores}
              activoId={ronda.jugadorTurnoId}
              yoId={yoId}
            />
          </Cabecera>

          <OpcionesCategoria
            opciones={ronda.opciones || []}
            onElegir={handleElegirCategoria}
            deshabilitado={!esMiTurno}
          />
        </section>
      )}

      {/* 6. TURNO EN JUEGO ONLINE (Sin botón de ayuda, sin categoría repetida en la tarjeta blanca) */}
      {vista === 'sala' && sala && sala.estado === 'turno' && ronda && (() => {
        const preparando = (ronda.segsPrep ?? 0) > 0;
        const segundosMostrar = preparando ? ronda.segsPrep : ronda.segsTurno;
        const porcentajeBarra = preparando
          ? ((ronda.segsPrep ?? 0) / PREPARACION_S) * 100
          : ((ronda.segsTurno ?? 0) / TIEMPO_S) * 100;
        const puntosEnJuego = (ronda.reto?.n || 0) * PUNTOS_POR_ACIERTO;

        return (
          <section className="game qqp-escena">
            <Cabecera
              onSalir={() => setModalSalirPortada(true)}
              categoria={ronda.categoria}
              etiqueta={
                ronda.intento > 0
                  ? `Ronda ${sala.rondaNum} de ${sala.maxRondas} · Turno de rebote`
                  : `Ronda ${sala.rondaNum} de ${sala.maxRondas} · Turno en juego`
              }
              titulo={esMiTurno ? '¡Es tu turno de hablar!' : `Turno de ${ronda.jugadorTurnoNombre}`}
              avatar={
                <Avatar
                  nombre={ronda.jugadorTurnoNombre}
                  color={colorJugador((ronda.jugadorTurnoId ?? 1) - 1)}
                />
              }
              chips={
                <span className="qqp-chip">
                  <Icon name="trophy" size={14} /> <span>+{puntosEnJuego} pts</span>
                </span>
              }
            >
              {/* Temporizador en la cabecera: solo se muestra cuando termina la cuenta atrás de preparación */}
              {!preparando && (
                <div className="qqp-identidad bm-consigna-box">
                  <div className="bm-hero-stats">
                    <span className="bm-hero-stat">
                      {ronda.intento > 0
                        ? '🔄 Rebote: di las respuestas que faltan'
                        : '🎙️ Di las respuestas en voz alta'}
                    </span>
                    <span className={`bm-hero-stat timer${ronda.segsTurno <= 10 ? ' low' : ''}`}>
                      <Icon name="clock" size={14} /> {`${segundosMostrar}s`}
                    </span>
                  </div>
                  <div className="bm-timer-track" role="timer" aria-label="Tiempo restante">
                    <div
                      className={`bm-timer-fill${ronda.segsTurno <= 10 ? ' low' : ''}`}
                      style={{ width: `${porcentajeBarra}%` }}
                    />
                  </div>
                </div>
              )}

              <OrdenTurnos
                jugadores={sala.jugadores}
                activoId={ronda.jugadorTurnoId}
                yoId={yoId}
              />
            </Cabecera>

            {ronda.motivo && (
              <div className="rf-aviso-banner" role="status">
                <Icon name={ronda.motivo === 'tiempo' ? 'hourglass' : 'refresh'} size={20} />
                <span>
                  {ronda.motivo === 'tiempo' ? '¡Se acabó el tiempo anterior!' : '¡Rebote!'} Turno para <strong>{ronda.jugadorTurnoNombre}</strong>
                </span>
              </div>
            )}

            {/* Tarjeta blanca limpia (con la única cuenta atrás inicial abajo) */}
            <div className="qqp-tarjeta rf-tarjeta-reto">
              <div className="rf-reto-numero">{ronda.reto.n}</div>
              <p className="rf-reto-texto">{ronda.reto.texto}</p>

              {preparando && (
                <div className="rf-prep-box" role="status" aria-live="polite">
                  <span className="rf-prep-circulo">{ronda.segsPrep}</span>
                  <span className="rf-prep-label">Comenzando cuenta atrás…</span>
                </div>
              )}
            </div>

            {esAdmin ? (
              <div className="qqp-barra">
                <span className="rf-badge-juez">👑 Panel del Juez · Escucha a {ronda.jugadorTurnoNombre}</span>
                <div className="rf-botones">
                  <button
                    type="button"
                    className="ok"
                    disabled={preparando}
                    onClick={() => handleAccionJuez('acierto')}
                  >
                    <Icon name="check" size={22} strokeWidth={2.5} /> ¡Correcto!
                  </button>
                  <button
                    type="button"
                    className="rebote"
                    disabled={preparando}
                    onClick={() => handleAccionJuez('rebote')}
                  >
                    <Icon name="refresh" size={22} strokeWidth={2.5} /> Rebote
                  </button>
                </div>
                <EnlaceSecundario onClick={() => handleAccionJuez('rendirse')}>
                  <Icon name="flag" size={15} /> Rendirse (nadie puntúa)
                </EnlaceSecundario>
              </div>
            ) : (
              <p className="qqp-estado">
                <span className="qqp-spinner" aria-hidden="true" /> El anfitrión (👑) está validando las respuestas en directo…
              </p>
            )}
          </section>
        );
      })()}

      {/* 7. PUNTUACIONES DE LA RONDA ONLINE */}
      {vista === 'sala' && sala && sala.estado === 'puntuaciones' && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            categoria={ronda?.categoria}
            etiqueta={`Ronda ${sala.rondaNum} de ${sala.maxRondas} completada`}
            titulo="Puntuaciones"
          >
            {ronda?.ultimo && (
              <div className="qqp-identidad">
                <span className="qqp-identidad-icono">
                  <Icon name={ronda.ultimo.tipo === 'rendido' ? 'flag' : 'trophy'} size={16} />
                </span>
                <span>
                  {ronda.ultimo.tipo === 'rendido'
                    ? 'Nadie ha sumado puntos en esta ronda.'
                    : ronda.ultimo.tipo === 'rebote'
                      ? <><strong>{ronda.ultimo.jugador}</strong> completó el rebote (<strong>+{ronda.ultimo.puntos} pts</strong>).</>
                      : <><strong>{ronda.ultimo.jugador}</strong> completó el reto (<strong>+{ronda.ultimo.puntos} pts</strong>).</>}
                </span>
              </div>
            )}
          </Cabecera>

          <div className="qqp-tarjeta">
            <p className="qqp-carta-cara-titulo" style={{ marginBottom: '0.8rem' }}>
              <Icon name="trophy" size={16} /> Clasificación general
            </p>
            <ul className="qqp-rivales">
              {ranking.map((j, i) => {
                const lider = maximo > 0 && j.puntos === maximo;
                return (
                  <li key={j.id} className="qqp-rival" style={{ '--c': colorJugador(indiceColor(j, i)) }}>
                    <span className="qqp-rival-avatar">{lider ? '👑' : i + 1}</span>
                    <span className="qqp-rival-datos">
                      <span className="qqp-rival-nombre">{lider ? 'Líder actual' : `Puesto ${i + 1}`}</span>
                      <strong className="qqp-rival-tarjeta">{j.nombre}{j.id === yoId ? ' (tú)' : ''}</strong>
                    </span>
                    <span className="rf-ranking-pts">{j.puntos} pts</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="qqp-barra">
            {esAdmin ? (
              <>
                {sala.rondaNum >= sala.maxRondas ? (
                  <BotonPrincipal onClick={handleFinalizar}>
                    <Icon name="trophy" size={20} /> Ver el podio final
                  </BotonPrincipal>
                ) : (
                  <>
                    <BotonPrincipal onClick={handleContinuarRonda}>
                      <Icon name="play" size={20} /> Siguiente ronda ({sala.rondaNum + 1} de {sala.maxRondas})
                    </BotonPrincipal>
                    <EnlaceSecundario onClick={handleFinalizar}>
                      Finalizar partida anticipadamente
                    </EnlaceSecundario>
                  </>
                )}
              </>
            ) : (
              <p className="qqp-estado">
                <span className="qqp-spinner" aria-hidden="true" /> Esperando a que el anfitrión avance a la siguiente ronda…
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
                    ? <>¡Victoria para <strong>{ganadores[0].nombre}</strong> con <strong>{maximo} pts</strong>!</>
                    : <>Empate entre <strong>{ganadores.map((g) => g.nombre).join(', ')}</strong> con <strong>{maximo} pts</strong></>}
              </span>
            </div>
          </Cabecera>

          <div className="qqp-tarjeta">
            <p className="qqp-carta-cara-titulo" style={{ marginBottom: '0.8rem' }}>
              <Icon name="users" size={16} /> Podio de jugadores
            </p>
            <ul className="qqp-rivales">
              {ranking.map((j, i) => {
                const lider = maximo > 0 && j.puntos === maximo;
                return (
                  <li key={j.id} className="qqp-rival" style={{ '--c': colorJugador(indiceColor(j, i)) }}>
                    <span className="qqp-rival-avatar">{lider ? '👑' : i + 1}</span>
                    <span className="qqp-rival-datos">
                      <span className="qqp-rival-nombre">{lider ? '¡Ganador!' : `Puesto ${i + 1}`}</span>
                      <strong className="qqp-rival-tarjeta">{j.nombre}{j.id === yoId ? ' (tú)' : ''}</strong>
                    </span>
                    <span className="rf-ranking-pts">{j.puntos} pts</span>
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