// client/src/games/Popular/PopularOnline.jsx
import SalonFama from '../../components/SalonFama.jsx';
import { useRegistrarPartida, ganadoresPorPuntos } from '../../lib/registros.js';
import { nombreIdentidad } from '../../lib/identidad.js';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import './Popular.css';
import {
  Aviso,
  Cabecera,
  Avatar,
  OrdenTurnos,
  BotonPrincipal,
  EnlaceSecundario,
  PUNTOS_POR_PUESTO,
  colorJugador,
  indiceColor
} from './PopularLocal.jsx';
import { limitesOnline, textoSala } from '../limites.js';
import { ChipJugadores } from '../../components/MenuJuego.jsx';
import { SelectorRondas } from '../../components/MenuJuego.jsx';
import { rondasPorDefecto } from '../rondas.js';

const LIM_ON = limitesOnline('popular');

const CLAVE_SESION_POPULAR = 'popular_online_session';
const TIEMPO_TURNO = 45;

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

export default function PopularOnline({
  tituloJuego = 'Sigue la moda',
  descripcionJuego,
  onLocal,
  onSalir,
  onAbrirAyuda
}) {
  const [rondasSel, setRondasSel] = useState(rondasPorDefecto('popular'));
  const navigate = useNavigate();
  const [vista, setVista] = useState('menu'); // 'menu' | 'online_menu' | 'crear' | 'unirse' | 'sala'
  const [nombre, setNombre] = useState(nombreIdentidad);
  const [codigoInput, setCodigoInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);

  const [modalSalirLobby, setModalSalirLobby] = useState(false);
  const [modalSalirPortada, setModalSalirPortada] = useState(false);
  const [codigoCopiado, setCodigoCopiado] = useState(false);

  // Sub-paso en la fase de resolución online: 1 (Soluciones del Top 5), 2 (Clasificación general)
  const [pasoResolucionOnline, setPasoResolucionOnline] = useState(1);

  const [sesion, setSesion] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(CLAVE_SESION_POPULAR));
    } catch {
      return null;
    }
  });

  const [sala, setSala] = useState(null);
  const [inputTexto, setInputTexto] = useState('');
  const [tiempoRestante, setTiempoRestante] = useState(TIEMPO_TURNO);

  const [eventoAviso, setEventoAviso] = useState(null);
  const avisoSeqRef = useRef(0);
  const ultimoFeedbackMsgRef = useRef('');

  const intervalRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!sesion) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setSala(null);
      return undefined;
    }

    const consultarEstado = () => {
      fetch(`/api/popular/online/sala/${sesion.code}?token=${sesion.token}`)
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
          sessionStorage.removeItem(CLAVE_SESION_POPULAR);
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

  const ronda = sala?.ronda;
  const esAdmin = Boolean(sala?.esAdmin);
  const yoId = sala?.yoId;
  const esMiTurno = ronda?.jugadorActivoId === yoId;
  const misPistas = ronda?.misPistas || {};

  // Siempre que entra en resolución de ronda, empieza mostrando primero las 5 respuestas (paso 1)
  useEffect(() => {
    if (ronda?.faseRonda === 'resolucion') {
      setPasoResolucionOnline(1);
    }
  }, [ronda?.faseRonda, sala?.rondaNum]);

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
    sessionStorage.removeItem(CLAVE_SESION_POPULAR);
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
    sessionStorage.removeItem(CLAVE_SESION_POPULAR);
    setSesion(null);
    setSala(null);
    setModalSalirLobby(false);
    setVista('online_menu');
  };

  const handleCrear = async () => {
    if (!nombre.trim()) return;
    setCargando(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/popular/online/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_POPULAR, JSON.stringify(nueva));
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
      const res = await fetch('/api/popular/online/unirse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codigoInput.trim().toUpperCase(), nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_POPULAR, JSON.stringify(nueva));
      setSesion(nueva);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleIniciarPartida = async () => {
    try {
      const res = await fetch(`/api/popular/online/sala/${sesion.code}/iniciar`, {
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

  const handleValidarRespuesta = async (e) => {
    e.preventDefault();
    if (!inputTexto.trim()) return;

    try {
      const res = await fetch(`/api/popular/online/sala/${sesion.code}/validar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token, respuesta: inputTexto })
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setInputTexto('');
    } catch (err) {
      console.error(err);
    }
  };

  const handlePasarTurno = async () => {
    try {
      await fetch(`/api/popular/online/sala/${sesion.code}/pasar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token })
      });
      setInputTexto('');
    } catch (err) {
      console.error(err);
    }
  };

  const handlePasarTurnoRef = useRef();
  useEffect(() => {
    handlePasarTurnoRef.current = handlePasarTurno;
  });

  useEffect(() => {
    const fb = ronda?.feedback;
    if (!fb || !fb.msg) return;
    if (fb.msg === ultimoFeedbackMsgRef.current) return;
    ultimoFeedbackMsgRef.current = fb.msg;

    avisoSeqRef.current += 1;
    setEventoAviso({
      n: avisoSeqRef.current,
      tipo: fb.tipo === 'acierto' ? 'acierto' : 'fallo',
      texto: fb.msg
    });
  }, [ronda?.feedback]);

  useEffect(() => {
    const isJugando = sala?.estado === 'jugando' && ronda?.faseRonda === 'jugando';
    if (!isJugando || ronda?.feedback !== null) {
      if (timerRef.current) clearInterval(timerRef.current);
      return undefined;
    }

    setTiempoRestante(TIEMPO_TURNO);
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          if (esMiTurno && handlePasarTurnoRef.current) {
            handlePasarTurnoRef.current();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sala?.estado, ronda?.faseRonda, ronda?.jugadorActivoId, esMiTurno, ronda?.feedback]);

  const handlePedirPistaPuesto = async (puesto) => {
    if (!esMiTurno || ronda?.feedback !== null) return;
    const actual = misPistas[puesto] || {};
    const tipo = !actual.longitud ? 'longitud' : !actual.letras ? 'letras' : null;
    if (!tipo) return;

    try {
      const res = await fetch(`/api/popular/online/sala/${sesion.code}/pista`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token, puesto, tipo })
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRendirse = async () => {
    try {
      await fetch(`/api/popular/online/sala/${sesion.code}/rendirse`, {
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
      await fetch(`/api/popular/online/sala/${sesion.code}/siguiente-ronda`, {
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
      await fetch(`/api/popular/online/sala/${sesion.code}/finalizar`, {
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
  const maximo = ranking.length ? ranking[0].puntos : 0;
  const ganadores = maximo > 0 ? ranking.filter((j) => j.puntos === maximo) : [];

  const totalDescubiertos = Object.keys(ronda?.acertados || {}).length;
  const enPartidaActiva = vista === 'sala' && sala && sala.estado !== 'lobby';

  // Salón de la fama: se guarda la partida al llegar a la pantalla final
  useRegistrarPartida('popular', sala?.estado === 'final' ? ganadoresPorPuntos((sala?.jugadores || []).filter((j) => !j.fuera && !j.abandonado).map((j) => ({ nombre: j.nombre, puntos: j.puntos ?? null }))) : null);
  return (
    <div className={`pop-contenedor ${enPartidaActiva ? 'qq-en-partida' : ''}`}>
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
              <Icon name="trophy" size={44} strokeWidth={1.7} />
            </div>
            <h1 className="title qq-main-title">{tituloJuego}</h1>
            <ChipJugadores juegoId="popular" />
            <p className="hint qq-main-desc">{descripcionJuego}</p>
            <SalonFama juegoId="popular" />

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
              Introduce el código que te ha compartido el anfitrión y tu nombre.
            </p>

            <div className="lb-form qq-form-estilizado">
              <label className="field-label" htmlFor="pop-code-input">Código de la partida</label>
              <input
                id="pop-code-input"
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
              {codigoCopiado
                ? '¡Copiado al portapapeles!'
                : 'Pulsa el código para copiarlo y compártelo con los demás.'}
            </p>
          </div>

          <div className="panel qq-menu-panel" style={{ marginTop: '1rem' }}>
            <h3 className="qq-sala-titulo">
              <Icon name="users" size={20} /> Jugadores ({sala.jugadores.length}/12)
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
                Se necesitan al menos {LIM_ON.min} jugadores para empezar la partida.
              </p>
            )}
          </div>

          {errorMsg && <p className="error" style={{ margin: '0.8rem 0' }}>{errorMsg}</p>}

          {esAdmin && (
            <div className="panel qq-menu-panel" style={{ marginTop: '1rem' }}>
              <SelectorRondas juegoId="popular" valor={rondasSel} onCambiar={setRondasSel} numJugadores={sala.jugadores.length} />
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
              {sala.jugadores.length < LIM_ON.min ? `Esperando rivales (mínimo ${LIM_ON.min})...` : '¡Iniciar juego!'}
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

      {/* 5. JUGANDO ONLINE */}
      {vista === 'sala' && sala && sala.estado === 'jugando' && ronda && ronda.faseRonda === 'jugando' && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            categoria={{ nombre: 'Top 5 más popular', icono: 'trophy' }}
            etiqueta={
              esMiTurno
                ? `Ronda ${sala.rondaNum} de ${sala.maxRondas} · ¡Es tu turno!`
                : `Ronda ${sala.rondaNum} de ${sala.maxRondas} · Turno en curso`
            }
            titulo={esMiTurno ? '¡Te toca responder!' : `Turno de ${ronda.jugadorActivoNombre}`}
            avatar={
              <Avatar
                nombre={ronda.jugadorActivoNombre}
                color={colorJugador((ronda.jugadorActivoId ?? 1) - 1)}
              />
            }
          >
            <div className="qqp-identidad pop-consigna-box">
              <div className="pop-consigna-top">
                <span className="qqp-identidad-icono">
                  <Icon name="trophy" size={16} strokeWidth={2.4} />
                </span>
                <span className="pop-consigna-texto">«{ronda.pregunta}»</span>
              </div>

              <div className="pop-hero-stats">
                <span className="pop-hero-stat ok">✅ {totalDescubiertos}/5 descubiertos</span>
                <span className={`pop-hero-stat timer${tiempoRestante <= 10 ? ' low' : ''}`}>
                  <Icon name="clock" size={14} /> {tiempoRestante}s
                </span>
              </div>

              <div className="pop-timer-track" role="timer">
                <div
                  className={`pop-timer-fill${tiempoRestante <= 10 ? ' low' : ''}`}
                  style={{ width: `${(tiempoRestante / TIEMPO_TURNO) * 100}%` }}
                />
              </div>
            </div>

            <OrdenTurnos
              jugadores={sala.jugadores}
              activoId={ronda.jugadorActivoId}
            />
          </Cabecera>

          {ronda.feedback && (
            <div className={`pop-feedback-banner ${ronda.feedback.tipo}`} role="status">
              {ronda.feedback.msg}
            </div>
          )}

          <div className="qqp-tarjeta">
            <p className="qqp-carta-cara-titulo" style={{ marginBottom: '0.7rem' }}>
              <Icon name="eye" size={16} /> Respuestas más populares (Top 1 a 5)
            </p>

            <div className="popp-slots-lista">
              {[1, 2, 3, 4, 5].map((puesto) => {
                const descubierto = ronda.acertados?.[puesto];
                const pistaPuesto = misPistas[puesto];
                const tieneLongitud = Boolean(pistaPuesto?.longitud);
                const tieneLetras = Boolean(pistaPuesto?.letras);
                const esqueletoVisible = pistaPuesto?.letras || pistaPuesto?.longitud;

                return (
                  <div key={puesto} className={`popp-slot-card ${descubierto ? 'revelado' : ''}`}>
                    <div className="popp-slot-main">
                      <span className={`popp-puesto-num p-${puesto}`}>#{puesto}</span>

                      <div className="popp-slot-contenido">
                        {descubierto ? (
                          <>
                            <span className="popp-slot-texto">{descubierto.texto}</span>
                            <span className="popp-slot-autor">Acertado por {descubierto.jugador}</span>
                          </>
                        ) : esqueletoVisible ? (
                          <div className="popp-ahorcado-wrap">
                            {esqueletoVisible.split('   /   ').map((palabra, pIdx) => (
                              <span key={pIdx} className="popp-palabra-chip">
                                {palabra}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="popp-slot-incognita">Respuesta oculta</span>
                        )}
                      </div>
                    </div>

                    <div className="popp-slot-derecha">
                      {!descubierto && !tieneLetras && esMiTurno && (
                        <button
                          type="button"
                          className={`popp-btn-pista-slot ${tieneLongitud ? 'fase2' : ''}`}
                          onClick={() => handlePedirPistaPuesto(puesto)}
                          disabled={ronda.feedback !== null}
                          title={
                            !tieneLongitud
                              ? `Ver huecos de letras del Top #${puesto} (-1 pt)`
                              : `Revelar letras del Top #${puesto} (-1 pt)`
                          }
                        >
                          <span>{!tieneLongitud ? '💡 Pista' : '🔤 +Letras'}</span>
                          <small>-1 pt</small>
                        </button>
                      )}
                      <span className="popp-puntos-badge">+{PUNTOS_POR_PUESTO[puesto]} pts</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleValidarRespuesta} className="pop-form-respuesta">
              <label className="qq-label-destacado" htmlFor="popp-input-online">
                {esMiTurno
                  ? 'Escribe una respuesta para cualquier puesto del Top 5'
                  : `Esperando la respuesta de ${ronda.jugadorActivoNombre}…`}
              </label>
              <div className="pop-form-row">
                <input
                  id="popp-input-online"
                  type="text"
                  autoFocus={esMiTurno}
                  className="qq-input-moderno"
                  placeholder={esMiTurno ? 'Escribe una palabra clave o respuesta…' : 'No es tu turno'}
                  value={inputTexto}
                  onChange={(e) => setInputTexto(e.target.value)}
                  disabled={!esMiTurno || ronda.feedback !== null}
                  autoComplete="off"
                />
                <button
                  type="submit"
                  className="pop-btn-comprobar"
                  disabled={!esMiTurno || !inputTexto.trim() || ronda.feedback !== null}
                >
                  <Icon name="check" size={18} strokeWidth={2.5} /> Comprobar
                </button>
              </div>
            </form>
          </div>

          <div className="qqp-barra">
            {esMiTurno && (
              <EnlaceSecundario onClick={handlePasarTurno} disabled={ronda.feedback !== null}>
                <Icon name="refresh" size={16} /> Pasar turno
              </EnlaceSecundario>
            )}
            {esAdmin && (
              <EnlaceSecundario onClick={handleRendirse}>
                <Icon name="flagFinish" size={16} /> Rendirse y resolver los 5 puestos
              </EnlaceSecundario>
            )}
          </div>
        </section>
      )}

      {/* 6. RESOLUCIÓN DE RONDA ONLINE (DIVIDIDA EN 2 PANTALLAS: 1. RESPUESTAS -> 2. PUNTUACIONES) */}
      {vista === 'sala' && sala && sala.estado === 'jugando' && ronda && ronda.faseRonda === 'resolucion' && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            categoria={{
              nombre: pasoResolucionOnline === 1 ? 'Paso 1 de 2 · Soluciones' : 'Paso 2 de 2 · Clasificación',
              icono: pasoResolucionOnline === 1 ? 'eye' : 'trophy'
            }}
            etiqueta={`Ronda ${sala.rondaNum} de ${sala.maxRondas} completada`}
            titulo={pasoResolucionOnline === 1 ? 'Soluciones del Top 5' : 'Puntuaciones actuales'}
          >
            <div className="qqp-identidad">
              <span className="qqp-identidad-icono"><Icon name="check" size={16} strokeWidth={2.5} /></span>
              <span>«{ronda.pregunta}»</span>
            </div>
          </Cabecera>

          {pasoResolucionOnline === 1 ? (
            <>
              <div className="qqp-tarjeta">
                <p className="qqp-carta-cara-titulo" style={{ marginBottom: '0.75rem' }}>
                  <Icon name="eye" size={16} /> Las 5 respuestas más populares
                </p>

                <div className="popp-slots-lista">
                  {(ronda.solucionFinal || [1, 2, 3, 4, 5].map((p) => ({
                    puesto: p,
                    texto: ronda.acertados?.[p]?.texto || '',
                    puntos: PUNTOS_POR_PUESTO[p]
                  }))).map((resp) => {
                    const acertador = ronda.acertados?.[resp.puesto];
                    return (
                      <div
                        key={resp.puesto}
                        className={`popp-slot-card ${acertador ? 'revelado' : 'no-acertado'}`}
                      >
                        <div className="popp-slot-main">
                          <span className={`popp-puesto-num p-${resp.puesto}`}>#{resp.puesto}</span>
                          <div className="popp-slot-contenido">
                            <span className="popp-slot-texto">{resp.texto}</span>
                            <span className="popp-slot-autor">
                              {acertador ? `🎉 Acertado por ${acertador.jugador}` : 'Sin descubrir'}
                            </span>
                          </div>
                        </div>
                        <span className="popp-puntos-badge">+{resp.puntos} pts</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="qqp-barra">
                <BotonPrincipal onClick={() => setPasoResolucionOnline(2)}>
                  <Icon name="trophy" size={20} /> Continuar a las puntuaciones
                </BotonPrincipal>
              </div>
            </>
          ) : (
            <>
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
                          <strong className="qqp-rival-tarjeta">
                            {j.nombre}{j.id === yoId ? ' (tú)' : ''}
                          </strong>
                        </span>
                        <span className="pop-ranking-pts">{j.puntos} pts</span>
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
                        <Icon name="play" size={20} /> Siguiente ronda ({sala.rondaNum + 1} de {sala.maxRondas})
                      </BotonPrincipal>
                    ) : (
                      <BotonPrincipal onClick={handleFinalizar}>
                        <Icon name="trophy" size={20} /> Ver podio final
                      </BotonPrincipal>
                    )}
                    <EnlaceSecundario onClick={() => setPasoResolucionOnline(1)}>
                      ← Volver a ver las 5 respuestas
                    </EnlaceSecundario>
                    <EnlaceSecundario onClick={handleFinalizar}>
                      Finalizar partida anticipadamente
                    </EnlaceSecundario>
                  </>
                ) : (
                  <>
                    <p className="qqp-estado">
                      <span className="qqp-spinner" aria-hidden="true" /> Esperando a que el anfitrión lance la siguiente ronda…
                    </p>
                    <EnlaceSecundario onClick={() => setPasoResolucionOnline(1)}>
                      ← Volver a ver las 5 respuestas
                    </EnlaceSecundario>
                  </>
                )}
              </div>
            </>
          )}
        </section>
      )}

      {/* 7. PODIO FINAL ONLINE */}
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
                      <strong className="qqp-rival-tarjeta">
                        {j.nombre}{j.id === yoId ? ' (tú)' : ''}
                      </strong>
                    </span>
                    <span className="pop-ranking-pts">{j.puntos} pts</span>
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