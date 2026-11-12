// client/src/games/Rankings/RankingsOnline.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import './Rankings.css';
import {
  Aviso,
  Cabecera,
  Avatar,
  OrdenTurnos,
  SelectorCategorias,
  BotonPrincipal,
  EnlaceSecundario,
  colorJugador,
  indiceColor
} from './RankingsLocal.jsx';
import { limitesOnline, textoSala } from '../limites.js';
import { ChipJugadores } from '../../components/MenuJuego.jsx';
import { SelectorRondas } from '../../components/MenuJuego.jsx';
import { rondasPorDefecto } from '../rondas.js';

const LIM_ON = limitesOnline('rankings');

const CLAVE_SESION_RK = 'rankings_online_session';
const TIEMPO_TURNO = 90;

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

export default function RankingsOnline({
  tituloJuego = 'Completar Rankings',
  descripcionJuego,
  onLocal,
  onSalir,
  onAbrirAyuda
}) {
  const [rondasSel, setRondasSel] = useState(rondasPorDefecto('rankings'));
  const navigate = useNavigate();
  const [vista, setVista] = useState('menu'); // 'menu' | 'online_menu' | 'crear' | 'unirse' | 'sala'

  const [nombre, setNombre] = useState('');
  const [codigoInput, setCodigoInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);

  const [modalSalirLobby, setModalSalirLobby] = useState(false);
  const [modalSalirPortada, setModalSalirPortada] = useState(false);

  const [categoriasDatos, setCategoriasDatos] = useState(null);
  const [sesion, setSesion] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(CLAVE_SESION_RK));
    } catch {
      return null;
    }
  });

  const [sala, setSala] = useState(null);
  const [codigoCopiado, setCodigoCopiado] = useState(false);

  const [inputRespuesta, setInputRespuesta] = useState('');
  const [modalPista, setModalPista] = useState(null);
  const [segundosRestantes, setSegundosRestantes] = useState(TIEMPO_TURNO);
  const [elementosRojos, setElementosRojos] = useState(false);

  const [eventoAviso, setEventoAviso] = useState(null);
  const avisoSeqRef = useRef(0);
  const ultimoFeedbackTextoRef = useRef('');

  const intervalRef = useRef(null);
  const timerTurnoRef = useRef(null);

  useEffect(() => {
    fetch('/api/rankings/categorias')
      .then((r) => r.json())
      .then((d) => setCategoriasDatos(d))
      .catch((e) => console.error(e));
  }, []);

  useEffect(() => {
    if (!sesion) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setSala(null);
      return;
    }

    const consultarEstado = () => {
      fetch(`/api/rankings/online/sala/${sesion.code}?token=${sesion.token}`)
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
          sessionStorage.removeItem(CLAVE_SESION_RK);
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

  const ronda = sala?.ronda;
  const yoId = sala?.yoId;
  const esMiTurno = ronda?.jugadorTurnoId === yoId;
  const esAdmin = sala?.esAdmin;

  // Avisos flotantes sincronizados con el feedback de la ronda
  useEffect(() => {
    const fb = ronda?.mensajeFeedback;
    if (!fb || !fb.texto) return;
    if (fb.texto === ultimoFeedbackTextoRef.current) return;
    ultimoFeedbackTextoRef.current = fb.texto;

    avisoSeqRef.current += 1;
    setEventoAviso({
      n: avisoSeqRef.current,
      tipo: fb.tipo === 'exito' ? 'acierto' : 'fallo',
      texto: fb.texto
    });
  }, [ronda?.mensajeFeedback]);

  // Temporizador visual reactivo al cambio de turno
  useEffect(() => {
    if (!ronda || ronda.faseRonda !== 'jugando') {
      if (timerTurnoRef.current) clearInterval(timerTurnoRef.current);
      return;
    }

    setSegundosRestantes(TIEMPO_TURNO);

    if (timerTurnoRef.current) clearInterval(timerTurnoRef.current);
    timerTurnoRef.current = setInterval(() => {
      setSegundosRestantes((prev) => {
        if (prev <= 1) {
          clearInterval(timerTurnoRef.current);
          if (esMiTurno) {
            fetch(`/api/rankings/online/sala/${sesion.code}/tiempo-agotado`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token: sesion.token })
            }).catch(() => {});
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerTurnoRef.current) clearInterval(timerTurnoRef.current);
    };
  }, [ronda?.jugadorTurnoId, ronda?.faseRonda, esMiTurno, sesion]);

  // Destello rojo si ocurre un fallo o rebote
  useEffect(() => {
    if (ronda?.motivo === 'fallo' || ronda?.motivo === 'rebote') {
      setElementosRojos(true);
      const timer = setTimeout(() => setElementosRojos(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [ronda?.motivo, ronda?.jugadorTurnoId]);

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
    sessionStorage.removeItem(CLAVE_SESION_RK);
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
    sessionStorage.removeItem(CLAVE_SESION_RK);
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
      const res = await fetch('/api/rankings/online/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_RK, JSON.stringify(nueva));
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
      const res = await fetch('/api/rankings/online/unirse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codigoInput.trim().toUpperCase(), nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_RK, JSON.stringify(nueva));
      setSesion(nueva);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleIniciarPartida = async () => {
    try {
      const res = await fetch(`/api/rankings/online/sala/${sesion.code}/iniciar-partida`, {
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

  const handleElegirCategoria = async (catNombre) => {
    try {
      const res = await fetch(`/api/rankings/online/sala/${sesion.code}/elegir-categoria`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token, categoria: catNombre })
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handlePedirPista = async (puesto) => {
    try {
      const res = await fetch(`/api/rankings/online/sala/${sesion.code}/pista`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token, posicion: puesto.posicion })
      });
      const d = await res.json();
      if (d.success) {
        setModalPista({ posicion: puesto.posicion, pista: puesto.pista });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEnviarRespuesta = async (e) => {
    e.preventDefault();
    if (!inputRespuesta.trim()) return;

    try {
      const res = await fetch(`/api/rankings/online/sala/${sesion.code}/validar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token, respuesta: inputRespuesta })
      });
      const d = await res.json();
      if (d.success) {
        setInputRespuesta('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePasarTurno = async () => {
    try {
      await fetch(`/api/rankings/online/sala/${sesion.code}/pasar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token })
      });
      setInputRespuesta('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleAvanzarResumen = async () => {
    try {
      await fetch(`/api/rankings/online/sala/${sesion.code}/avanzar-resumen`, {
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
      await fetch(`/api/rankings/online/sala/${sesion.code}/siguiente-ronda`, {
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
      await fetch(`/api/rankings/online/sala/${sesion.code}/finalizar`, {
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

  const descubiertos = ronda?.puestos ? ronda.puestos.filter((p) => !p.oculto).length : 0;
  const totalPuestos = ronda?.puestos ? ronda.puestos.length : 0;
  const enPartidaActiva = vista === 'sala' && sala && sala.estado !== 'lobby';

  return (
    <div className={`rk-contenedor ${enPartidaActiva ? 'qq-en-partida' : ''}`}>
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
            <ChipJugadores juegoId="rankings" />
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
              <label className="field-label" htmlFor="rk-host-nombre">Tu nombre</label>
              <input
                id="rk-host-nombre"
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
              <label className="field-label" htmlFor="rk-code-input">Código de la partida</label>
              <input
                id="rk-code-input"
                className="lb-input-codigo qq-input-moderno"
                type="text"
                placeholder="ABCD"
                value={codigoInput}
                onChange={(e) => setCodigoInput(e.target.value.toUpperCase())}
                maxLength={4}
                autoFocus
              />

              <label className="field-label" htmlFor="rk-guest-nombre" style={{ marginTop: '1rem' }}>
                Tu nombre
              </label>
              <input
                id="rk-guest-nombre"
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
              <Icon name="users" size={20} /> Jugadores ({sala.jugadores.length}/15)
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
              <SelectorRondas juegoId="rankings" valor={rondasSel} onCambiar={setRondasSel} numJugadores={sala.jugadores.length} />
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
              {sala.jugadores.length < LIM_ON.min ? `Esperando rivales (mínimo ${LIM_ON.min})...` : 'Iniciar juego'}
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
            categorias={categoriasDatos?.categorias || []}
            rondaActual={sala.rondaNum}
            maxRondas={sala.maxRondas}
            onElegir={handleElegirCategoria}
            onSalir={() => setModalSalirPortada(true)}
            onAyuda={onAbrirAyuda}
            aviso="Al tocar una categoría comenzará el ranking en los móviles de todos los jugadores."
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
                Preparando ranking
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
            categoria={{ nombre: ronda.categoria, icono: 'trophy' }}
            etiqueta={
              esMiTurno
                ? `Ronda ${sala.rondaNum} de ${sala.maxRondas} · ¡Es tu turno!`
                : `Ronda ${sala.rondaNum} de ${sala.maxRondas} · Turno en curso`
            }
            titulo={esMiTurno ? '¡Te toca responder!' : `Turno de ${ronda.jugadorTurnoNombre}`}
            avatar={
              <Avatar
                nombre={ronda.jugadorTurnoNombre}
                color={colorJugador((ronda.jugadorTurnoId ?? 1) - 1)}
              />
            }
          >
            <div className="qqp-identidad rk-consigna-box">
              <div className="rk-consigna-top">
                <span className="qqp-identidad-icono">
                  <Icon name="trophy" size={16} strokeWidth={2.4} />
                </span>
                <div className="rk-consigna-textos">
                  <span className="rk-consigna-titulo">{ronda.titulo}</span>
                  {ronda.descripcion && (
                    <span className="rk-consigna-sub">{ronda.descripcion}</span>
                  )}
                </div>
              </div>

              <div className="rk-hero-stats">
                <span className="rk-hero-stat ok">✅ {descubiertos}/{totalPuestos} descubiertos</span>
                {ronda.esRebote && <span className="rk-hero-stat rebote">🔄 Rebote</span>}
                <span className={`rk-hero-stat timer${segundosRestantes <= 15 ? ' low' : ''}`}>
                  <Icon name="clock" size={14} /> {segundosRestantes}s
                </span>
              </div>

              <div className="rk-timer-track" role="timer">
                <div
                  className={`rk-timer-fill${segundosRestantes <= 15 ? ' low' : ''}`}
                  style={{ width: `${(segundosRestantes / TIEMPO_TURNO) * 100}%` }}
                />
              </div>
            </div>

            <OrdenTurnos
              jugadores={sala.jugadores}
              activoId={ronda.jugadorTurnoId}
            />
          </Cabecera>

          {ronda.motivo && (
            <div className="rk-rebote-banner" role="status">
              <Icon name={ronda.motivo === 'tiempo' ? 'hourglass' : 'refresh'} size={18} />
              <span>
                {ronda.motivo === 'tiempo' ? '¡Se agotó el tiempo!' : '¡Respuesta incorrecta (Rebote)!'} Le toca a <strong>{ronda.jugadorTurnoNombre}</strong>
              </span>
            </div>
          )}

          <div className="qqp-tarjeta">
            {ronda.mensajeFeedback && (
              <div className={`rk-feedback rk-feedback-${ronda.mensajeFeedback.tipo}`}>
                {ronda.mensajeFeedback.texto}
              </div>
            )}

            <div className="rk-lista-ranking">
              {ronda.puestos.map((p) => (
                <div
                  key={p.posicion}
                  className={`rk-fila-puesto ${p.oculto ? 'rk-oculto' : 'rk-resuelto'} ${p.oculto && elementosRojos ? 'rk-flash-red' : ''}`}
                >
                  <span className="rk-pos">#{p.posicion}</span>

                  {!p.oculto ? (
                    <>
                      <span className="rk-val">{p.valor}</span>
                      <span className="rk-check"><Icon name="check" size={20} strokeWidth={2.5} /></span>
                    </>
                  ) : (
                    <div className="rk-slot-acciones">
                      <span className="rk-slot-oculto-texto">Puesto por descubrir</span>

                      <button
                        type="button"
                        disabled={!esMiTurno || elementosRojos || ronda.pistasBloqueadas?.[p.posicion]}
                        className={`rk-btn-pista ${ronda.pistasUsadas?.[p.posicion] ? 'usada' : ''}`}
                        onClick={() => esMiTurno && handlePedirPista(p)}
                        title={
                          ronda.pistasBloqueadas?.[p.posicion]
                            ? 'Pista bloqueada: el rival anterior falló sin pedirla'
                            : 'Pedir pista (acertar sumará 1 punto en vez de 3)'
                        }
                      >
                        <Icon name="eye" size={15} />
                        <span>
                          {ronda.pistasUsadas?.[p.posicion]
                            ? 'Ver pista'
                            : ronda.pistasBloqueadas?.[p.posicion]
                            ? 'Bloqueada'
                            : 'Pista (1 pt)'}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <form onSubmit={handleEnviarRespuesta} className="rk-form-respuesta">
              <label className="qq-label-destacado" htmlFor="rk-online-input">
                {esMiTurno
                  ? 'Introduce cualquier elemento que falte en el ranking'
                  : `Esperando la respuesta de ${ronda.jugadorTurnoNombre}…`}
              </label>
              <div className="rk-form-row">
                <input
                  id="rk-online-input"
                  className="qq-input-moderno"
                  type="text"
                  autoFocus={esMiTurno}
                  autoComplete="off"
                  disabled={!esMiTurno || elementosRojos}
                  placeholder={esMiTurno ? 'Escribe el nombre o elemento…' : 'No es tu turno'}
                  value={inputRespuesta}
                  onChange={(e) => setInputRespuesta(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  disabled={!esMiTurno || !inputRespuesta.trim() || elementosRojos}
                  className="rk-btn-enviar"
                >
                  <Icon name="check" size={18} strokeWidth={2.5} /> Enviar
                </button>
              </div>
            </form>
          </div>

          {esMiTurno && (
            <div className="qqp-barra">
              <EnlaceSecundario disabled={elementosRojos} onClick={handlePasarTurno}>
                <Icon name="refresh" size={16} /> Pasar turno / Fallo (Rebote)
              </EnlaceSecundario>
            </div>
          )}

          {/* MODAL PISTA ONLINE */}
          {modalPista && (
            <div className="rg-modal-fondo" onClick={() => setModalPista(null)}>
              <div className="rg-modal qq-modal-ayuda" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
                <div className="qq-modal-ayuda-header">
                  <span className="qq-ayuda-badge">💡 Pista del ranking</span>
                  <h3>Puesto #{modalPista.posicion}</h3>
                </div>
                <p className="rk-modal-texto-pista">{modalPista.pista}</p>
                <p className="hint" style={{ textAlign: 'center', marginBottom: '1.2rem', fontSize: '0.9rem' }}>
                  Recuerda: si aciertas este puesto habiendo visto la pista sumarás <strong>1 punto</strong> en lugar de 3.
                </p>
                <button type="button" className="big full qq-btn-principal" onClick={() => setModalPista(null)}>
                  ¡Entendido!
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* 7. SOLUCIÓN ONLINE (SI TODOS FALLAN) */}
      {vista === 'sala' && sala && sala.estado === 'jugando' && ronda && ronda.faseRonda === 'solucion' && ronda.solucionFinal && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            categoria={{ nombre: ronda.categoria, icono: 'trophy' }}
            etiqueta={`Ronda ${sala.rondaNum} de ${sala.maxRondas} · Solución`}
            titulo={ronda.titulo || 'Fin de la ronda'}
          >
            <div className="qqp-identidad">
              <span className="qqp-identidad-icono"><Icon name="eye" size={16} strokeWidth={2.5} /></span>
              <span>Nadie completó el ranking. ¡Así quedaban todos los puestos!</span>
            </div>
          </Cabecera>

          <div className="qqp-tarjeta">
            <p className="qqp-carta-cara-titulo" style={{ marginBottom: '0.8rem' }}>
              <Icon name="trophy" size={16} /> Solución completa
            </p>
            <div className="rk-lista-ranking">
              {ronda.solucionFinal.map((sol) => {
                const acertado = ronda.puestos.some((p) => p.posicion === sol.posicion && !p.oculto);
                return (
                  <div
                    key={sol.posicion}
                    className={`rk-fila-puesto ${acertado ? 'rk-resuelto' : 'rk-fallado-solucion'}`}
                  >
                    <span className="rk-pos">#{sol.posicion}</span>
                    <span className="rk-val">{sol.valor}</span>
                    {acertado ? (
                      <span className="rk-check"><Icon name="check" size={20} strokeWidth={2.5} /></span>
                    ) : (
                      <span className="rk-tag-no-adivinado">No descubierto</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="qqp-barra">
            {esAdmin ? (
              <BotonPrincipal onClick={handleAvanzarResumen}>
                <Icon name="trophy" size={20} /> Ver clasificación de la ronda
              </BotonPrincipal>
            ) : (
              <p className="qqp-estado">
                <span className="qqp-spinner" aria-hidden="true" /> Esperando a que el anfitrión continúe…
              </p>
            )}
          </div>
        </section>
      )}

      {/* 8. RESUMEN DE RONDA ONLINE */}
      {vista === 'sala' && sala && sala.estado === 'jugando' && ronda && ronda.faseRonda === 'resumen' && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            etiqueta={`Ronda ${sala.rondaNum} de ${sala.maxRondas} completada`}
            titulo="Puntuaciones de la ronda"
          >
            <div className="qqp-identidad">
              <span className="qqp-identidad-icono"><Icon name="check" size={16} strokeWidth={2.5} /></span>
              <span>Ranking: <strong>«{ronda.titulo}»</strong></span>
            </div>
          </Cabecera>

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
                    <span className="rk-ranking-pts">{j.puntos} pts</span>
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
                <span className="qqp-spinner" aria-hidden="true" /> Esperando a que el anfitrión lance la siguiente ronda…
              </p>
            )}
          </div>
        </section>
      )}

      {/* 9. PODIO FINAL ONLINE */}
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
                    <span className="rk-ranking-pts">{j.puntos} pts</span>
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
                ? 'Abandonarás la partida actual y volverás a la portada principal. ¿Estás seguro?'
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