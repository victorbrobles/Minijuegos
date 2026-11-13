// client/src/games/Conoce/ConoceOnline.jsx
import SalonFama from '../../components/SalonFama.jsx';
import { useRegistrarPartida, ganadoresPorPuntos } from '../../lib/registros.js';
import { nombreIdentidad } from '../../lib/identidad.js';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import './Conoce.css';
import {
  Cabecera,
  Avatar,
  OrdenTurnos,
  BotonPrincipal,
  EnlaceSecundario,
  TableroEmparejarRespuestas,
  PALETA_RESPUESTAS,
  colorJugador,
  inicial,
  indiceColor,
  agruparRespuestasUnicas,
  normalizarRespuesta
} from './ConoceLocal.jsx';
import { limitesOnline, textoSala } from '../limites.js';
import { ChipJugadores } from '../../components/MenuJuego.jsx';
import { SelectorRondas } from '../../components/MenuJuego.jsx';
import { rondasPorDefecto } from '../rondas.js';

const LIM_ON = limitesOnline('conoce');

const CLAVE_SESION_CNC = 'conoce_online_session';

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

export default function ConoceOnline({
  tituloJuego = 'Conoce a tus amigos',
  descripcionJuego,
  onLocal,
  onSalir,
  onAbrirAyuda
}) {
  const [rondasSel, setRondasSel] = useState(rondasPorDefecto('conoce'));
  const navigate = useNavigate();
  const [vista, setVista] = useState('menu'); // 'menu' | 'online_menu' | 'crear' | 'unirse' | 'sala'
  const [nombre, setNombre] = useState(nombreIdentidad);
  const [codigoInput, setCodigoInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);

  const [modalSalirLobby, setModalSalirLobby] = useState(false);
  const [modalSalirPortada, setModalSalirPortada] = useState(false);
  const [codigoCopiado, setCodigoCopiado] = useState(false);

  const [miRespuestaInput, setMiRespuestaInput] = useState('');
  const [misElecciones, setMisElecciones] = useState({});

  // Sub-paso para dividir la pantalla de resultados online en 3 pantallas: 1 (Respuestas), 2 (Desglose), 3 (Clasificación)
  const [pasoResultadoOnline, setPasoResultadoOnline] = useState(1);

  const [sala, setSala] = useState(null);
  const [sesion, setSesion] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(CLAVE_SESION_CNC));
    } catch {
      return null;
    }
  });

  const intervalRef = useRef(null);

  useEffect(() => {
    if (!sesion) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setSala(null);
      return undefined;
    }

    const consultarEstado = () => {
      fetch(`/api/conoce/sala/${sesion.code}?token=${sesion.token}`)
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error('Sala no disponible'))))
        .then((d) => {
          if (d.success) {
            setSala(d);
            setVista('sala');
          }
        })
        .catch(() => {
          sessionStorage.removeItem(CLAVE_SESION_CNC);
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

  useEffect(() => {
    if (sala?.estado === 'respondiendo' && !sala?.yaRespondio) {
      setMiRespuestaInput('');
    }
    if (sala?.estado === 'adivinando' && !sala?.yaAdivino) {
      setMisElecciones({});
    }
    if (sala?.estado === 'resultados') {
      setPasoResultadoOnline(1);
    }
  }, [sala?.estado, sala?.rondaNum, sala?.yaRespondio, sala?.yaAdivino]);

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
      const res = await fetch(`/api/conoce/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion?.token, code: sesion?.code, ...extraBody })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error en la petición');
      if (data.token) {
        const nueva = { code: data.code, token: data.token };
        sessionStorage.setItem(CLAVE_SESION_CNC, JSON.stringify(nueva));
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
    sessionStorage.removeItem(CLAVE_SESION_CNC);
    setSesion(null);
    setSala(null);
    setModalSalirLobby(false);
    setVista('online_menu');

    if (sesionActual?.code && sesionActual?.token) {
      fetch(`/api/conoce/sala/${sesionActual.code}/salir`, {
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
    sessionStorage.removeItem(CLAVE_SESION_CNC);
    setSesion(null);
    setSala(null);
    setModalSalirPortada(false);

    if (sesionActual?.code && sesionActual?.token) {
      fetch(`/api/conoce/sala/${sesionActual.code}/salir`, {
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

  const enviarRespuesta = (e) => {
    if (e) e.preventDefault();
    if (!miRespuestaInput.trim() || sala?.yaRespondio) return;
    const limpia = miRespuestaInput.trim().replace(/\s+/g, ' ');
    peticionPost(`sala/${sesion.code}/responder`, {
      respuesta: limpia,
      respuestaNormalizada: normalizarRespuesta(limpia)
    });
  };

  const enviarAdivinanzas = () => {
    peticionPost(`sala/${sesion.code}/enviar-adivinanzas`, { asignaciones: misElecciones });
  };

  const yo = sala?.jugadores?.find((j) => j.esTu);
  const esAdmin = Boolean(yo?.esAdmin);
  const faltan = Math.max(0, 4 - (sala?.jugadores?.length || 0));
  const rivales = sala?.jugadores?.filter((j) => !j.esTu) || [];

  const opcionesRaw = (sala?.respuestasOpciones || []).map((opc) =>
    typeof opc === 'string' ? opc : opc.texto
  );
  const opcionesUnicas = agruparRespuestasUnicas(opcionesRaw);

  const todasAsignadas =
    rivales.length > 0 && rivales.every((r) => Boolean(misElecciones[r.id]));

  const ranking = [...(sala?.jugadores || [])].sort((a, b) => b.puntos - a.puntos);
  const maxPuntos = ranking.length > 0 ? ranking[0].puntos : 0;
  const ganadores = maxPuntos > 0 ? ranking.filter((j) => j.puntos === maxPuntos) : [];

  // Reconstrucción de las respuestas reales de todos para la Pantalla 1 de resultados
  const listaRespuestasReales = [];
  // Salón de la fama: se guarda la partida al llegar a la pantalla final
  useRegistrarPartida('conoce', sala?.estado === 'fin' ? ganadoresPorPuntos((sala?.jugadores || []).filter((j) => !j.fuera && !j.abandonado).map((j) => ({ nombre: j.nombre, puntos: j.puntos ?? null }))) : null);
  if (yo && sala?.miRespuesta) {
    listaRespuestasReales.push({
      id: yo.id,
      nombre: `${yo.nombre} (tú)`,
      respuesta: sala.miRespuesta
    });
  }
  (sala?.misComparaciones || []).forEach((comp, idx) => {
    const jugObj = sala?.jugadores?.find((j) => j.nombre === comp.rival);
    listaRespuestasReales.push({
      id: jugObj?.id || idx + 100,
      nombre: comp.rival,
      respuesta: comp.respuestaRival
    });
  });

  const enPartidaActiva = vista === 'sala' && sala && sala.estado !== 'lobby';

  return (
    <div className={`cnc-contenedor ${enPartidaActiva ? 'qq-en-partida' : ''}`}>
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
            <ChipJugadores juegoId="conoce" />
            <p className="hint qq-main-desc">{descripcionJuego}</p>
            <SalonFama juegoId="conoce" />

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
                  <span>Cada jugador responde y adivina desde su propio móvil</span>
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
                  <span>Pasando el móvil por turnos para responder y emparejar</span>
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
                  <span>Sé el anfitrión y genera un código para tu grupo ({textoSala('conoce')})</span>
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
              <label className="field-label" htmlFor="cnc-host-nombre">Tu nombre</label>
              <input
                id="cnc-host-nombre"
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
              <label className="field-label" htmlFor="cnc-code-input">Código de la partida</label>
              <input
                id="cnc-code-input"
                className="lb-input-codigo qq-input-moderno"
                type="text"
                placeholder="ABCD"
                value={codigoInput}
                onChange={(e) => setCodigoInput(e.target.value.toUpperCase())}
                maxLength={4}
                autoFocus
              />

              <label className="field-label" htmlFor="cnc-guest-nombre" style={{ marginTop: '1rem' }}>
                Tu nombre
              </label>
              <input
                id="cnc-guest-nombre"
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
              <Icon name="users" size={20} /> Jugadores ({sala.jugadores.length}/16)
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
              <SelectorRondas juegoId="conoce" valor={rondasSel} onCambiar={setRondasSel} numJugadores={sala.jugadores.length} />
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

      {/* 5. RESPONDIENDO (60s) */}
      {/* 4B. MEJOR AMIGO (antes de la primera ronda, en secreto) */}
      {vista === 'sala' && sala && sala.estado === 'mejor_amigo' && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            categoria={{ nombre: 'Mejor amigo', icono: 'users' }}
            etiqueta="Antes de empezar · elección secreta"
            titulo={sala.miAmigoId ? '¡Elegido!' : '¿Quién es tu mejor amigo?'}
          >
            <div className="qqp-identidad">
              <span className="qqp-identidad-icono"><Icon name="zap" size={16} /></span>
              <span>Si los dos acertáis la respuesta del otro, tú te llevas el doble de puntos.</span>
            </div>
          </Cabecera>
          {sala.miAmigoId ? (
            <div className="qqp-tarjeta qqp-pasar">
              <span className="cnc-emoji-grande" aria-hidden="true">💛</span>
              <p className="qqp-pasar-para">Tu mejor amigo</p>
              <h3 className="qqp-pasar-nombre">{sala.jugadores.find((j) => j.id === sala.miAmigoId)?.nombre}</h3>
              <p className="qqp-texto">
                Esperando a que elijan los demás ({sala.jugadores.filter((j) => j.haElegidoAmigo).length}/{sala.jugadores.length})…
              </p>
            </div>
          ) : (
            <div className="cnc-amigos-lista">
              {rivales.map((r) => (
                <button key={r.id} type="button" className="cnc-amigo-opcion" disabled={cargando}
                  onClick={() => peticionPost(`sala/${sesion.code}/mejor-amigo`, { amigoId: r.id })}>
                  <Avatar nombre={r.nombre} color={colorJugador(indiceColor(r, 0))} />
                  <span>{r.nombre}</span>
                  <span aria-hidden="true">💛</span>
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {vista === 'sala' && sala && sala.estado === 'respondiendo' && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            categoria={{ nombre: 'Respuesta sincera', icono: 'lock' }}
            etiqueta={`Ronda ${sala.rondaNum} de ${sala.maxRondas || 15}`}
            titulo={sala.yaRespondio ? '¡Respuesta guardada!' : '¡Te toca responder!'}
            avatar={
              yo ? <Avatar nombre={yo.nombre} color={colorJugador(indiceColor(yo, 0))} /> : undefined
            }
          >
            <div className="qqp-identidad cnc-consigna-box">
              <div className="cnc-consigna-top">
                <span className="qqp-identidad-icono">
                  <Icon name="users" size={16} strokeWidth={2.4} />
                </span>
                <span className="cnc-consigna-texto">«{sala.preguntaActual}»</span>
              </div>

              <div className="cnc-hero-stats">
                <span className="cnc-hero-stat">🤫 En secreto</span>
                <span className={`cnc-hero-stat timer${sala.segundosRestantes <= 10 ? ' low' : ''}`}>
                  <Icon name="clock" size={14} /> {sala.segundosRestantes}s
                </span>
              </div>

              <div className="cnc-timer-track" role="timer">
                <div
                  className={`cnc-timer-fill${sala.segundosRestantes <= 10 ? ' low' : ''}`}
                  style={{ width: `${(Math.max(0, sala.segundosRestantes) / 60) * 100}%` }}
                />
              </div>
            </div>

            <OrdenTurnos jugadores={sala.jugadores} />
          </Cabecera>

          {sala.yaRespondio ? (
            <div className="qqp-tarjeta qqp-pasar">
              <span className="lb-luna chica"><Icon name="check" size={34} /></span>
              <p className="qqp-pasar-para">Tu respuesta secreta</p>
              <h3 className="qqp-pasar-nombre" style={{ fontSize: '1.65rem' }}>
                «{sala.miRespuesta}»
              </h3>
              <p className="qqp-texto">
                Esperando a que el resto del grupo termine de escribir su respuesta…
              </p>
            </div>
          ) : (
            <form onSubmit={enviarRespuesta} className="qqp-tarjeta">
              <label className="qq-label-destacado" htmlFor="cnc-online-resp">
                Escribe tu respuesta sincera antes de que se acabe el tiempo
              </label>
              <input
                id="cnc-online-resp"
                type="text"
                className="qq-input-moderno"
                placeholder="Escribe aquí tu respuesta..."
                value={miRespuestaInput}
                onChange={(e) => setMiRespuestaInput(e.target.value)}
                autoFocus
              />
              <div style={{ marginTop: '1rem' }}>
                <BotonPrincipal type="submit" disabled={!miRespuestaInput.trim()}>
                  <Icon name="check" size={20} strokeWidth={2.5} /> Enviar mi respuesta
                </BotonPrincipal>
              </div>
            </form>
          )}
        </section>
      )}

      {/* 6. CUENTA ATRÁS 10s */}
      {vista === 'sala' && sala && sala.estado === 'cuenta_atras' && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            categoria={{ nombre: 'Preparando respuestas', icono: 'clock' }}
            etiqueta={`Ronda ${sala.rondaNum} de ${sala.maxRondas || 15}`}
            titulo="¡Todos han respondido!"
          >
            <div className="qqp-identidad">
              <span className="qqp-identidad-icono"><Icon name="users" size={16} /></span>
              <span>«{sala.preguntaActual}»</span>
            </div>
          </Cabecera>

          <div className="qqp-tarjeta qqp-pasar">
            <div className="cnc-cuenta-circulo">{sala.cuentaAtras10s}</div>
            <p className="qqp-pasar-para">Prepárate para adivinar</p>
            <h3 className="qqp-pasar-nombre" style={{ fontSize: '1.6rem' }}>
              Barajando respuestas…
            </h3>
            <p className="qqp-texto">
              En unos segundos podrás arrastrar a cada compañero hasta la tarjeta de respuesta que crees que escribió.
            </p>
          </div>
        </section>
      )}

      {/* 7. ADIVINANDO (90s CON DRAG & DROP A TARJETAS DE COLORES) */}
      {vista === 'sala' && sala && sala.estado === 'adivinando' && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            categoria={{ nombre: 'Deducción', icono: 'target' }}
            etiqueta={`Ronda ${sala.rondaNum} de ${sala.maxRondas || 15}`}
            titulo={sala.yaAdivino ? '¡Deducciones enviadas!' : '¿Quién dijo qué?'}
            avatar={
              yo ? <Avatar nombre={yo.nombre} color={colorJugador(indiceColor(yo, 0))} /> : undefined
            }
          >
            <div className="qqp-identidad cnc-consigna-box">
              <div className="cnc-consigna-top">
                <span className="qqp-identidad-icono">
                  <Icon name="users" size={16} strokeWidth={2.4} />
                </span>
                <span className="cnc-consigna-texto">«{sala.preguntaActual}»</span>
              </div>

              <div className="cnc-hero-stats">
                <span className="cnc-hero-stat">🎯 Arrastra cada amigo a su respuesta</span>
                <span className={`cnc-hero-stat timer${sala.segundosRestantes <= 15 ? ' low' : ''}`}>
                  <Icon name="clock" size={14} /> {sala.segundosRestantes}s
                </span>
              </div>

              <div className="cnc-timer-track" role="timer">
                <div
                  className={`cnc-timer-fill${sala.segundosRestantes <= 15 ? ' low' : ''}`}
                  style={{ width: `${(Math.max(0, sala.segundosRestantes) / 90) * 100}%` }}
                />
              </div>
            </div>

            <OrdenTurnos jugadores={sala.jugadores} />
          </Cabecera>

          {sala.yaAdivino ? (
            <div className="qqp-tarjeta qqp-pasar">
              <span className="lb-luna chica"><Icon name="check" size={34} /></span>
              <p className="qqp-pasar-para">Deducciones registradas</p>
              <h3 className="qqp-pasar-nombre" style={{ fontSize: '1.6rem' }}>
                ¡Todo listo!
              </h3>
              <p className="qqp-texto">
                Esperando a que el resto de tus compañeros confirmen sus emparejamientos…
              </p>
            </div>
          ) : (
            <>
              <TableroEmparejarRespuestas
                rivales={rivales}
                opcionesUnicas={opcionesUnicas}
                asignaciones={misElecciones}
                onChangeAsignaciones={setMisElecciones}
              />

              <div className="qqp-barra">
                <BotonPrincipal
                  disabled={!todasAsignadas}
                  onClick={enviarAdivinanzas}
                >
                  <Icon name="check" size={20} strokeWidth={2.5} /> Enviar mis predicciones
                </BotonPrincipal>
              </div>
            </>
          )}
        </section>
      )}

      {/* 8. RESULTADOS DE LA RONDA (DIVIDIDO EN 3 PANTALLAS) */}
      {vista === 'sala' && sala && sala.estado === 'resultados' && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            categoria={{
              nombre: `Paso ${pasoResultadoOnline} de 3`,
              icono: pasoResultadoOnline === 1 ? 'eye' : pasoResultadoOnline === 2 ? 'users' : 'trophy'
            }}
            etiqueta={`Ronda ${sala.rondaNum} de ${sala.maxRondas || 15} completada`}
            titulo={
              pasoResultadoOnline === 1
                ? '¿Qué escribió cada uno?'
                : pasoResultadoOnline === 2
                ? 'Desglose de elecciones'
                : 'Puntuaciones actuales'
            }
          >
            <div className="qqp-identidad">
              <span className="qqp-identidad-icono"><Icon name="check" size={16} strokeWidth={2.5} /></span>
              <span>«{sala.preguntaActual}»</span>
            </div>
          </Cabecera>

          {/* PANTALLA 1: LO QUE HA RESPONDIDO REALMENTE CADA UNO */}
          {pasoResultadoOnline === 1 && (
            <>
              <div className="cnc-revelacion-grid">
                {listaRespuestasReales.map((item, i) => {
                  const paleta = PALETA_RESPUESTAS[i % PALETA_RESPUESTAS.length];
                  const colJug = colorJugador(i);
                  return (
                    <div
                      key={item.id}
                      className="cnc-revelacion-card"
                      style={{
                        '--r-bg': paleta.bg,
                        '--r-border': paleta.border,
                        '--r-accent': paleta.accent,
                        '--r-text': paleta.text,
                        '--c': colJug
                      }}
                    >
                      <div className="cnc-revelacion-autor">
                        <span className="cnc-revelacion-avatar">{inicial(item.nombre)}</span>
                        <div className="cnc-revelacion-textos">
                          <span className="cnc-revelacion-label">Respuesta sincera de</span>
                          <strong className="cnc-revelacion-nombre">{item.nombre}</strong>
                        </div>
                      </div>
                      <div className="cnc-revelacion-burbuja">
                        «{item.respuesta}»
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="qqp-barra">
                <BotonPrincipal onClick={() => setPasoResultadoOnline(2)}>
                  <Icon name="eye" size={20} /> Ver desglose de aciertos y puntos
                </BotonPrincipal>
              </div>
            </>
          )}

          {/* PANTALLA 2: DESGLOSE DETALLADO DE ACIERTOS Y PUNTOS */}
          {pasoResultadoOnline === 2 && (
            <>
              <div className="qqp-tarjeta cnc-desglose-jugador-card">
                <div className="cnc-desglose-jugador-header">
                  <span
                    className="cnc-revelacion-avatar"
                    style={{ '--c': colorJugador(indiceColor(yo, 0)) }}
                  >
                    {inicial(yo?.nombre)}
                  </span>
                  <div className="cnc-desglose-jugador-titulos">
                    <strong>Tu desglose ({yo?.nombre})</strong>
                    {sala.miRespuesta && <span>Dijiste: «{sala.miRespuesta}»</span>}
                  </div>
                </div>

                <div className="cnc-relaciones-lista">
                  {sala.misComparaciones?.map((comp, idx) => {
                    const esPos = String(comp.puntos || '').includes('+');
                    let explicacionDetallada = '';
                    if (comp.estado === 'os_conoceis') {
                      explicacionDetallada = `¡Os conocéis! Acertaste la respuesta de ${comp.rival} («${comp.respuestaRival}») y él/ella acertó la tuya.`;
                    } else if (comp.estado === 'le_conoces') {
                      explicacionDetallada = `Acertaste que ${comp.rival} respondió «${comp.respuestaRival}», pero él/ella falló tu respuesta.`;
                    } else if (comp.estado === 'te_conoce') {
                      explicacionDetallada = `${comp.rival} acertó tu respuesta, pero tú no acertaste que dijo «${comp.respuestaRival}».`;
                    } else {
                      explicacionDetallada = `Ninguno acertó la respuesta del otro (su respuesta real era «${comp.respuestaRival}»).`;
                    }

                    return (
                      <div key={idx} className={`cnc-relacion-item ${comp.estado}`}>
                        <div className="cnc-relacion-texto">
                          <strong>Con {comp.rival}:</strong> {explicacionDetallada}
                        </div>
                        <span className={`cnc-relacion-pts ${esPos ? 'pos' : 'neg'}`}>
                          {comp.puntos}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="qqp-barra">
                <BotonPrincipal onClick={() => setPasoResultadoOnline(3)}>
                  <Icon name="trophy" size={20} /> Ver clasificación general
                </BotonPrincipal>
                <EnlaceSecundario onClick={() => setPasoResultadoOnline(1)}>
                  ← Volver a las respuestas reales
                </EnlaceSecundario>
              </div>
            </>
          )}

          {/* PANTALLA 3: PUNTUACIONES ACTUALES DE CADA JUGADOR */}
          {pasoResultadoOnline === 3 && (
            <>
              <div className="qqp-tarjeta">
                <p className="qqp-carta-cara-titulo" style={{ marginBottom: '0.8rem' }}>
                  <Icon name="trophy" size={16} /> Clasificación general
                </p>
                <ul className="qqp-rivales">
                  {ranking.map((j, i) => {
                    const lider = maxPuntos > 0 && j.puntos === maxPuntos;
                    return (
                      <li key={j.id} className="qqp-rival" style={{ '--c': colorJugador(indiceColor(j, i)) }}>
                        <span className="qqp-rival-avatar">{lider ? '👑' : i + 1}</span>
                        <span className="qqp-rival-datos">
                          <span className="qqp-rival-nombre">{lider ? 'Líder actual' : `Puesto ${i + 1}`}</span>
                          <strong className="qqp-rival-tarjeta">
                            {j.nombre}{j.esTu ? ' (tú)' : ''}
                          </strong>
                        </span>
                        <span className="cnc-ranking-pts">{j.puntos} pts</span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="qqp-barra">
                {esAdmin ? (
                  <>
                    <BotonPrincipal onClick={() => peticionPost(`sala/${sesion.code}/siguiente-ronda`)}>
                      <Icon name="play" size={20} />
                      {sala.rondaNum >= (sala.maxRondas || 15)
                        ? 'Ver podio final'
                        : `Siguiente ronda (${sala.rondaNum + 1} de ${sala.maxRondas || 15})`}
                    </BotonPrincipal>
                    <EnlaceSecundario onClick={() => setPasoResultadoOnline(2)}>
                      ← Volver al desglose de puntos
                    </EnlaceSecundario>
                    <EnlaceSecundario onClick={() => peticionPost(`sala/${sesion.code}/terminar-ya`)}>
                      Finalizar partida anticipadamente
                    </EnlaceSecundario>
                  </>
                ) : (
                  <>
                    <p className="qqp-estado">
                      <span className="qqp-spinner" aria-hidden="true" /> Esperando a que el anfitrión continúe…
                    </p>
                    <EnlaceSecundario onClick={() => setPasoResultadoOnline(2)}>
                      ← Volver al desglose de puntos
                    </EnlaceSecundario>
                  </>
                )}
              </div>
            </>
          )}
        </section>
      )}

      {/* 9. PODIO FINAL ONLINE */}
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
                  ? 'Nadie consiguió puntos positivos en esta partida.'
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
                    <span className="cnc-ranking-pts">{j.puntos} pts</span>
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