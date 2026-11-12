// client/src/games/ConfianzaCiega/ConfianzaCiegaOnline.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin, adminHeaders } from '../../lib/admin.js';
import Icon from '../../components/Icon.jsx';
import './ConfianzaCiega.css';
import {
  Cabecera,
  Avatar,
  OrdenTurnos,
  BotonPrincipal,
  EnlaceSecundario,
  colorJugador,
  indiceColor
} from './ConfianzaCiegaLocal.jsx';
import { limitesOnline, textoSala } from '../limites.js';
import { ChipJugadores } from '../../components/MenuJuego.jsx';
import { SelectorRondas } from '../../components/MenuJuego.jsx';
import { rondasPorDefecto } from '../rondas.js';

const LIM_ON = limitesOnline('confianzaciega');

const CLAVE_SESION_CC = 'confianzaciega_online_session';
const TIEMPO_ACCION_S = 60;

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

export default function ConfianzaCiegaOnline({
  tituloJuego = 'Confianza Ciega',
  descripcionJuego,
  onLocal,
  onSalir,
  onAbrirAyuda
}) {
  const [rondasSel, setRondasSel] = useState(rondasPorDefecto('confianzaciega'));
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
      return JSON.parse(sessionStorage.getItem(CLAVE_SESION_CC));
    } catch {
      return null;
    }
  });

  const [sala, setSala] = useState(null);
  const [codigoCopiado, setCodigoCopiado] = useState(false);

  // Estados de apuesta en este dispositivo
  const [apuestaNumero, setApuestaNumero] = useState(5);
  const [apuestaCondicion, setApuestaCondicion] = useState('mas');

  // Confirmación de pantalla "Turno de..." antes de elegir consigna
  const [listoEleccionRonda, setListoEleccionRonda] = useState(null);
  const [tiempoAccionLocal, setTiempoAccionLocal] = useState(TIEMPO_ACCION_S);

  const intervalRef = useRef(null);

  useEffect(() => {
    if (!sesion) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setSala(null);
      return undefined;
    }

    const consultarEstado = () => {
      fetch(`/api/confianzaciega/online/sala/${sesion.code}?token=${sesion.token}`)
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
          sessionStorage.removeItem(CLAVE_SESION_CC);
          setSesion(null);
          setSala(null);
          setVista('online_menu');
          setErrorMsg('La sala se ha cerrado o se ha perdido la conexión.');
        });
    };

    consultarEstado();
    intervalRef.current = setInterval(consultarEstado, 500);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sesion]);

  const esAdmin = Boolean(sala?.esAdmin);
  const esActivo = Boolean(sala?.esActivo);
  const yoId = sala?.yoId;

  const listoParaElegir = listoEleccionRonda === sala?.rondaActual;

  // Detectamos si el jugador activo ya le dio a "¡Estoy listo!" para empezar a enumerar:
  // Soporta tanto `sala.accionIniciada` (si el backend tiene el endpoint /iniciar-accion)
  // como la señal sincronizada mediante `contadorAciertos >= 1000` sin tocar el backend.
  const accionEnMarcha = Boolean(
    sala?.estado === 'turno_accion' &&
      (sala?.accionIniciada || (typeof sala?.contadorAciertos === 'number' && sala.contadorAciertos >= 1000))
  );

  // El contador real que se muestra en pantalla descuenta la marca de sincronización (+1000)
  const aciertosReales =
    typeof sala?.contadorAciertos === 'number'
      ? sala.contadorAciertos >= 1000
        ? sala.contadorAciertos - 1000
        : sala.contadorAciertos
      : 0;

  const aciertosRealesRef = useRef(aciertosReales);
  useEffect(() => {
    aciertosRealesRef.current = aciertosReales;
  }, [aciertosReales]);

  // Cronómetro sincronizado de 60s para todos los jugadores en cuanto `accionEnMarcha` pasa a true
  useEffect(() => {
    if (sala?.estado !== 'turno_accion' || !accionEnMarcha) {
      setTiempoAccionLocal(TIEMPO_ACCION_S);
      return undefined;
    }

    setTiempoAccionLocal(TIEMPO_ACCION_S);
    const fin = Date.now() + TIEMPO_ACCION_S * 1000;
    let avisado = false;

    const id = setInterval(() => {
      const r = Math.max(0, Math.ceil((fin - Date.now()) / 1000));
      setTiempoAccionLocal(r);
      if (r <= 0 && !avisado) {
        avisado = true;
        clearInterval(id);
        if (esActivo || esAdmin) {
          handlePararTiempo();
        }
      }
    }, 250);

    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sala?.estado, sala?.rondaActual, accionEnMarcha]);

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
    sessionStorage.removeItem(CLAVE_SESION_CC);
    setSesion(null);
    setSala(null);
    setModalSalirPortada(false);

    if (sesionActual?.code && sesionActual?.token) {
      fetch(`/api/confianzaciega/online/sala/${sesionActual.code}/salir`, {
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
    sessionStorage.removeItem(CLAVE_SESION_CC);
    setSesion(null);
    setSala(null);
    setModalSalirLobby(false);
    setVista('online_menu');

    if (sesionActual?.code && sesionActual?.token) {
      fetch(`/api/confianzaciega/online/sala/${sesionActual.code}/salir`, {
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
      const res = await fetch('/api/confianzaciega/online/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear la sala.');

      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_CC, JSON.stringify(nueva));
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
      const res = await fetch('/api/confianzaciega/online/unirse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codigoInput.trim().toUpperCase(), nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al unirse.');

      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_CC, JSON.stringify(nueva));
      setSesion(nueva);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleCambiarPicantes = async (nuevoValor) => {
    if (!sesion || !sala?.esAdmin) return;
    try {
      await fetch(`/api/confianzaciega/online/sala/${sesion.code}/picantes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...adminHeaders() },
        body: JSON.stringify({ token: sesion.token, usarPicantes: nuevoValor })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleIniciarPartida = async () => {
    if (!sesion) return;
    try {
      await fetch(`/api/confianzaciega/online/sala/${sesion.code}/iniciar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...adminHeaders() },
        body: JSON.stringify({ token: sesion.token, rondas: rondasSel })
      });
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleElegirConsigna = async (consigna) => {
    if (!sesion) return;
    try {
      await fetch(`/api/confianzaciega/online/sala/${sesion.code}/elegir-consigna`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token, consigna })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleEnviarApuesta = async () => {
    if (!sesion) return;
    try {
      await fetch(`/api/confianzaciega/online/sala/${sesion.code}/apostar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: sesion.token,
          numero: apuestaNumero,
          condicion: apuestaCondicion
        })
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Cuando el jugador activo pulsa "¡Estoy listo!" para empezar a enumerar:
  // Notifica a todos los móviles de la sala usando el contador compartido (+1000)
  const handleJugadorActivoListo = async () => {
    if (!sesion || accionEnMarcha) return;
    try {
      await fetch(`/api/confianzaciega/online/sala/${sesion.code}/ajustar-contador`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delta: 1000 })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAjustarContador = async (delta) => {
    if (!sesion) return;
    // Evitamos que baje de 0 respuestas reales
    if (delta < 0 && aciertosReales <= 0) return;
    try {
      await fetch(`/api/confianzaciega/online/sala/${sesion.code}/ajustar-contador`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delta })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handlePararTiempo = async () => {
    if (!sesion) return;
    try {
      // Quitamos la marca +1000 si estaba activa para que en validacion_final quede el número limpio
      if (typeof sala?.contadorAciertos === 'number' && sala.contadorAciertos >= 1000) {
        await fetch(`/api/confianzaciega/online/sala/${sesion.code}/ajustar-contador`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ delta: -1000 })
        });
      }
      await fetch(`/api/confianzaciega/online/sala/${sesion.code}/parar-tiempo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmarResultados = async () => {
    if (!sesion) return;
    try {
      await fetch(`/api/confianzaciega/online/sala/${sesion.code}/confirmar-resultados`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token, aciertosFinales: aciertosReales })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSiguienteRonda = async () => {
    if (!sesion) return;
    try {
      await fetch(`/api/confianzaciega/online/sala/${sesion.code}/siguiente-ronda`, {
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
      await fetch(`/api/confianzaciega/online/sala/${sesion.code}/finalizar`, {
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
      await fetch(`/api/confianzaciega/online/sala/${sesion.code}/reiniciar`, {
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

  const miJugador = sala?.jugadores?.find((j) => j.id === yoId);
  const jugadorActivoObj = sala?.jugadores?.find((j) => j.nombre === sala?.jugadorActivoNombre);
  const resultadoRonda = sala?.resultadoRonda;
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
              <Icon name="target" size={44} strokeWidth={1.7} />
            </div>
            <h1 className="title qq-main-title">{tituloJuego}</h1>
            <ChipJugadores juegoId="confianzaciega" />
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
                  <span>Cada jugador apuesta en secreto desde su propio móvil</span>
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

              <label className="field-label" htmlFor="cc-guest-nombre" style={{ marginTop: '1rem' }}>
                Tu nombre
              </label>
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
                <Icon name="lock" size={14} /> Categoría de consignas (Admin)
              </span>
              <div className="cc-admin-cats">
                <button
                  type="button"
                  className={`cc-admin-cat-btn ${!sala.usarPicantes ? 'activo' : ''}`}
                  onClick={() => handleCambiarPicantes(false)}
                >
                  😊 Normal (Todos los públicos)
                </button>
                <button
                  type="button"
                  className={`cc-admin-cat-btn ${sala.usarPicantes ? 'activo' : ''}`}
                  onClick={() => handleCambiarPicantes(true)}
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
            {sala.jugadores.length < LIM_ON.min && (
              <p className="hint" style={{ marginTop: '0.8rem' }}>
                {LIM_ON.min - sala.jugadores.length === 1 ? 'Falta al menos 1 jugador' : `Faltan al menos ${LIM_ON.min - sala.jugadores.length} jugadores`} para empezar (mínimo {LIM_ON.min}).
              </p>
            )}
          </div>

          {esAdmin && (
            <div className="panel qq-menu-panel" style={{ marginTop: '1rem' }}>
              <SelectorRondas juegoId="confianzaciega" valor={rondasSel} onCambiar={setRondasSel} numJugadores={sala.jugadores.length} />
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
              {sala.jugadores.length < LIM_ON.min ? 'Esperando jugadores...' : 'Iniciar juego'}
            </button>
          ) : (
            <div className="panel center" style={{ padding: '1.8rem 1.4rem', marginTop: '1rem' }}>
              <span className="lb-luna chica"><Icon name="hourglass" size={36} /></span>
              <h3 style={{ margin: '0.4rem 0' }}>Esperando al anfitrión...</h3>
              <p className="hint">
                El anfitrión iniciará la partida en cuanto estéis todos listos.
              </p>
            </div>
          )}
        </section>
      )}

      {/* 5. SALA: ELECCIÓN SECRETA DE CONSIGNA */}
      {vista === 'sala' && sala && sala.estado === 'eleccion_consigna' && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            categoria={{ nombre: 'Elección secreta', icono: 'eye' }}
            etiqueta={`Ronda ${sala.rondaActual} de ${sala.maxRondas} · Protagonista`}
            titulo={esActivo ? '¡Es tu turno!' : `Turno de ${sala.jugadorActivoNombre}`}
            avatar={
              <Avatar
                nombre={sala.jugadorActivoNombre}
                color={colorJugador(indiceColor(jugadorActivoObj, 0))}
              />
            }
          >
            <div className="qqp-identidad">
              <span className="qqp-identidad-icono"><Icon name="lock" size={16} /></span>
              <span>
                {esActivo
                  ? 'Los demás verán ambas opciones, pero solo tú sabrás cuál has elegido.'
                  : `${sala.jugadorActivoNombre} está eligiendo en secreto una de las dos consignas.`}
              </span>
            </div>

            <OrdenTurnos
              jugadores={sala.jugadores}
              activoId={jugadorActivoObj?.id}
            />
          </Cabecera>

          {esActivo && !listoParaElegir ? (
            <>
              <div className="qqp-tarjeta qqp-pasar">
                <Avatar
                  nombre={sala.jugadorActivoNombre}
                  color={colorJugador(indiceColor(jugadorActivoObj, 0))}
                  grande
                />
                <p className="qqp-pasar-para">Turno de</p>
                <h3 className="qqp-pasar-nombre">{sala.jugadorActivoNombre}</h3>
                <p className="qqp-texto">
                  Vas a recibir dos consignas y elegirás una en secreto antes de que tus compañeros hagan sus apuestas.
                </p>
              </div>
              <div className="qqp-barra">
                <BotonPrincipal onClick={() => setListoEleccionRonda(sala.rondaActual)}>
                  <Icon name="eye" size={22} /> Soy {sala.jugadorActivoNombre}, ver consignas
                </BotonPrincipal>
              </div>
            </>
          ) : esActivo ? (
            <div className="cc-consignas-grid">
              {sala.opcionesConsignas.map((consigna, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="cc-consigna-card"
                  onClick={() => handleElegirConsigna(consigna)}
                >
                  <span className="cc-consigna-pill">Opción {idx + 1}</span>
                  <strong className="cc-consigna-titulo">«{consigna}»</strong>
                  <span className="cc-consigna-cta">
                    Elegir esta consigna <Icon name="check" size={15} />
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="qqp-tarjeta qqp-pasar">
              <span className="lb-luna chica"><Icon name="hourglass" size={34} /></span>
              <p className="qqp-pasar-para">Esperando a</p>
              <h3 className="qqp-pasar-nombre" style={{ fontSize: '1.7rem' }}>
                {sala.jugadorActivoNombre}
              </h3>
              <p className="qqp-texto">
                En cuanto elija una consigna en secreto, podrás hacer tu apuesta sobre cuántas respuestas dará en {TIEMPO_ACCION_S} segundos.
              </p>
            </div>
          )}
        </section>
      )}

      {/* 6. SALA: APUESTAS SIMULTÁNEAS */}
      {vista === 'sala' && sala && sala.estado === 'apuestas' && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            categoria={{
              nombre: `${sala.totalApostaron}/${sala.totalApostadores} apuestas`,
              icono: 'target'
            }}
            etiqueta={`Ronda ${sala.rondaActual} de ${sala.maxRondas} · Apostando sobre ${sala.jugadorActivoNombre}`}
            titulo={
              esActivo
                ? '¡Están apostando sobre ti!'
                : sala.yaAposto
                ? '¡Apuesta enviada!'
                : '¡Haz tu apuesta!'
            }
            avatar={
              miJugador ? (
                <Avatar nombre={miJugador.nombre} color={colorJugador(indiceColor(miJugador, 0))} />
              ) : undefined
            }
          >
            {esActivo ? (
              <div className="qqp-identidad">
                <span className="qqp-identidad-icono"><Icon name="zap" size={16} /></span>
                <span>Tu consigna secreta: <strong>«{sala.consignaElegida}»</strong></span>
              </div>
            ) : (
              <div className="qqp-identidad cc-consigna-box">
                <span className="cc-hero-sub">
                  <strong>{sala.jugadorActivoNombre}</strong> ha elegido en secreto una de estas dos:
                </span>
                <div className="cc-dual-pills">
                  <span className="cc-dual-pill">1. «{sala.opcionesConsignas[0]}»</span>
                  <span className="cc-dual-pill">2. «{sala.opcionesConsignas[1]}»</span>
                </div>
              </div>
            )}

            <OrdenTurnos
              jugadores={sala.jugadores}
              activoId={jugadorActivoObj?.id}
            />
          </Cabecera>

          {esActivo ? (
            <div className="qqp-tarjeta qqp-pasar">
              <span className="lb-luna chica"><Icon name="users" size={34} /></span>
              <p className="qqp-pasar-para">Apuestas en curso</p>
              <h3 className="qqp-pasar-nombre" style={{ fontSize: '1.6rem' }}>
                {sala.totalApostaron} de {sala.totalApostadores} listos
              </h3>
              <p className="qqp-texto">
                En cuanto todos tus rivales confirmen su apuesta, te saldrá tu pantalla de turno para empezar los {TIEMPO_ACCION_S} segundos.
              </p>
            </div>
          ) : !sala.yaAposto ? (
            <>
              <div className="qqp-tarjeta cc-apuesta-card">
                <p className="qqp-carta-cara-titulo" style={{ justifyContent: 'center', width: '100%' }}>
                  <Icon name="target" size={16} /> ¿Cuántas palabras dirá {sala.jugadorActivoNombre}?
                </p>

                <div className="cc-big-stepper">
                  <button
                    type="button"
                    className="cc-big-stepper-btn"
                    onClick={() => setApuestaNumero(Math.max(0, apuestaNumero - 1))}
                  >
                    &minus;
                  </button>
                  <span className="cc-big-stepper-val">{apuestaNumero}</span>
                  <button
                    type="button"
                    className="cc-big-stepper-btn"
                    onClick={() => setApuestaNumero(apuestaNumero + 1)}
                  >
                    +
                  </button>
                </div>

                <div className="cc-condicion-grid">
                  <button
                    type="button"
                    className={`cc-btn-condicion ${apuestaCondicion === 'mas' ? 'activa' : ''}`}
                    onClick={() => setApuestaCondicion('mas')}
                  >
                    📈 Más de {apuestaNumero}
                  </button>
                  <button
                    type="button"
                    className={`cc-btn-condicion ${apuestaCondicion === 'menos' ? 'activa' : ''}`}
                    onClick={() => setApuestaCondicion('menos')}
                  >
                    📉 Menos de {apuestaNumero}
                  </button>
                </div>
              </div>

              <div className="qqp-barra">
                <BotonPrincipal onClick={handleEnviarApuesta}>
                  <Icon name="check" size={20} strokeWidth={2.5} /> Confirmar mi apuesta
                </BotonPrincipal>
              </div>
            </>
          ) : (
            <div className="qqp-tarjeta qqp-pasar">
              <span className="lb-luna chica"><Icon name="check" size={34} /></span>
              <p className="qqp-pasar-para">Tu apuesta secreta</p>
              <h3 className="qqp-pasar-nombre" style={{ fontSize: '1.8rem' }}>
                {sala.miApuesta?.condicion === 'mas'
                  ? `Más de ${sala.miApuesta?.numero}`
                  : `Menos de ${sala.miApuesta?.numero}`}
              </h3>
              <p className="qqp-texto">
                Esperando a que terminen de apostar los demás ({sala.totalApostaron} de {sala.totalApostadores})…
              </p>
            </div>
          )}
        </section>
      )}

      {/* 7. SALA: TURNO DE ACCIÓN
          - Si aún no ha empezado: al jugador activo le sale "Turno de..." con su botón de listo;
            al resto les sale "Esperando a...".
          - Cuando el jugador activo le da a listo: todos ven el contador de 60s y el admin ve los botones de contar. */}
      {vista === 'sala' && sala && sala.estado === 'turno_accion' && (
        !accionEnMarcha ? (
          <section className="game qqp-escena">
            <Cabecera
              onSalir={() => setModalSalirPortada(true)}
              categoria={{ nombre: '¡A responder!', icono: 'zap' }}
              etiqueta={`Ronda ${sala.rondaActual} de ${sala.maxRondas} · Todas las apuestas listas`}
              titulo={esActivo ? '¡Es tu turno!' : `Turno de ${sala.jugadorActivoNombre}`}
            >
              <OrdenTurnos
                jugadores={sala.jugadores}
                activoId={jugadorActivoObj?.id}
              />
            </Cabecera>

            {esActivo ? (
              <>
                <div className="qqp-tarjeta qqp-pasar">
                  <Avatar
                    nombre={sala.jugadorActivoNombre}
                    color={colorJugador(indiceColor(jugadorActivoObj, 0))}
                    grande
                  />
                  <p className="qqp-pasar-para">Turno de</p>
                  <h3 className="qqp-pasar-nombre">{sala.jugadorActivoNombre}</h3>
                  <p className="qqp-texto">
                    En cuanto pulses el botón comenzará directamente tu tiempo de <strong>{TIEMPO_ACCION_S} segundos</strong> para enumerar respuestas de <strong>«{sala.consignaElegida}»</strong>.
                  </p>
                </div>

                <div className="qqp-barra">
                  <BotonPrincipal onClick={handleJugadorActivoListo}>
                    <Icon name="play" size={22} /> Soy {sala.jugadorActivoNombre}, ¡estoy listo!
                  </BotonPrincipal>
                </div>
              </>
            ) : (
              <div className="qqp-tarjeta qqp-pasar">
                <span className="lb-luna chica"><Icon name="hourglass" size={34} /></span>
                <p className="qqp-pasar-para">Esperando a</p>
                <h3 className="qqp-pasar-nombre" style={{ fontSize: '1.8rem' }}>
                  {sala.jugadorActivoNombre}
                </h3>
                <p className="qqp-texto">
                  Todas las apuestas están cerradas. El cronómetro de <strong>{TIEMPO_ACCION_S} segundos</strong> empezará en cuanto <strong>{sala.jugadorActivoNombre}</strong> pulse que está listo.
                </p>
              </div>
            )}
          </section>
        ) : (
          <section className="game qqp-escena">
            <Cabecera
              onSalir={() => setModalSalirPortada(true)}
              categoria={{
                nombre: '¡En marcha!',
                icono: 'clock'
              }}
              etiqueta={`Ronda ${sala.rondaActual} de ${sala.maxRondas} · Turno de acción`}
              titulo={sala.jugadorActivoNombre}
              avatar={
                <Avatar
                  nombre={sala.jugadorActivoNombre}
                  color={colorJugador(indiceColor(jugadorActivoObj, 0))}
                />
              }
            >
              <div className="qqp-identidad cc-consigna-box">
                <div className="cc-consigna-top">
                  <span className="qqp-identidad-icono">
                    <Icon name="zap" size={16} strokeWidth={2.4} />
                  </span>
                  <span className="cc-consigna-texto">«{sala.consignaElegida}»</span>
                </div>

                <div className="cc-hero-stats">
                  <span className="cc-hero-stat ok">✅ {aciertosReales} válidas</span>
                  <span className={`cc-hero-stat timer${tiempoAccionLocal <= 15 ? ' low' : ''}`}>
                    <Icon name="clock" size={14} />
                    {tiempoAccionLocal}s
                  </span>
                </div>

                <div className="cc-timer-track" role="timer">
                  <div
                    className={`cc-timer-fill${tiempoAccionLocal <= 15 ? ' low' : ''}`}
                    style={{
                      width: `${(tiempoAccionLocal / TIEMPO_ACCION_S) * 100}%`
                    }}
                  />
                </div>
              </div>
            </Cabecera>

            <div className="qqp-tarjeta cc-apuesta-card">
              <p className="qqp-carta-cara-titulo" style={{ justifyContent: 'center', width: '100%' }}>
                <Icon name="check" size={16} /> Respuestas válidas aprobadas
              </p>
              <p className="cc-sub-instruccion">
                {esAdmin
                  ? `Suma cada respuesta válida que diga ${sala.jugadorActivoNombre} en voz alta:`
                  : `El anfitrión está contabilizando las respuestas válidas de ${sala.jugadorActivoNombre} en tiempo real.`}
              </p>

              <div className="cc-big-stepper">
                {esAdmin && (
                  <button
                    type="button"
                    className="cc-big-stepper-btn"
                    disabled={aciertosReales <= 0}
                    onClick={() => handleAjustarContador(-1)}
                  >
                    -1
                  </button>
                )}
                <span className="cc-big-stepper-val aciertos">{aciertosReales}</span>
                {esAdmin && (
                  <button
                    type="button"
                    className="cc-big-stepper-btn"
                    onClick={() => handleAjustarContador(1)}
                  >
                    +1
                  </button>
                )}
              </div>
            </div>

            {esAdmin && (
              <div className="qqp-barra">
                <BotonPrincipal onClick={handlePararTiempo}>
                  <Icon name="flagFinish" size={20} /> Parar tiempo y cerrar recuento
                </BotonPrincipal>
              </div>
            )}
          </section>
        )
      )}

      {/* 8. SALA: VALIDACIÓN FINAL */}
      {vista === 'sala' && sala && sala.estado === 'validacion_final' && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            categoria={{ nombre: 'Recuento final', icono: 'check' }}
            etiqueta={`Ronda ${sala.rondaActual} de ${sala.maxRondas} · Tiempo finalizado`}
            titulo={`Recuento de ${sala.jugadorActivoNombre}`}
            avatar={
              <Avatar
                nombre={sala.jugadorActivoNombre}
                color={colorJugador(indiceColor(jugadorActivoObj, 0))}
              />
            }
          >
            <div className="qqp-identidad">
              <span className="qqp-identidad-icono"><Icon name="zap" size={16} /></span>
              <span>Consigna: <strong>«{sala.consignaElegida}»</strong></span>
            </div>
          </Cabecera>

          <div className="qqp-tarjeta cc-apuesta-card">
            <p className="qqp-carta-cara-titulo" style={{ justifyContent: 'center', width: '100%' }}>
              <Icon name="trophy" size={16} /> Total definitivo de respuestas
            </p>
            <p className="cc-sub-instruccion">
              {esAdmin
                ? 'Ajusta el marcador si es necesario y confirma para desvelar las apuestas:'
                : 'El anfitrión está confirmando el recuento definitivo de palabras…'}
            </p>

            <div className="cc-big-stepper">
              {esAdmin && (
                <button
                  type="button"
                  className="cc-big-stepper-btn"
                  disabled={aciertosReales <= 0}
                  onClick={() => handleAjustarContador(-1)}
                >
                  &minus;
                </button>
              )}
              <span className="cc-big-stepper-val aciertos">{aciertosReales}</span>
              {esAdmin && (
                <button
                  type="button"
                  className="cc-big-stepper-btn"
                  onClick={() => handleAjustarContador(1)}
                >
                  +
                </button>
              )}
            </div>
          </div>

          <div className="qqp-barra">
            {esAdmin ? (
              <BotonPrincipal onClick={handleConfirmarResultados}>
                <Icon name="check" size={20} strokeWidth={2.5} /> Confirmar resultados y ver apuestas
              </BotonPrincipal>
            ) : (
              <p className="qqp-estado">
                <span className="qqp-spinner" aria-hidden="true" /> Esperando confirmación del anfitrión…
              </p>
            )}
          </div>
        </section>
      )}

      {/* 9. SALA: RESULTADOS DE LA RONDA */}
      {vista === 'sala' && sala && sala.estado === 'resultados' && resultadoRonda && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            etiqueta={`Ronda ${sala.rondaActual} de ${sala.maxRondas} completada`}
            titulo={`Aciertos: ${resultadoRonda.aciertosFinales}`}
          >
            <div className="qqp-identidad">
              <span className="qqp-identidad-icono"><Icon name="check" size={16} strokeWidth={2.5} /></span>
              <span>«{resultadoRonda.consignaElegida}»</span>
            </div>
          </Cabecera>

          <div className="qqp-tarjeta">
            <p className="qqp-carta-cara-titulo" style={{ marginBottom: '0.8rem' }}>
              <Icon name="target" size={16} /> Resultado de las apuestas
            </p>
            <div className="cc-resolucion-lista">
              {resultadoRonda.detalles.map((item) => (
                <div
                  key={item.jugadorId}
                  className={`cc-fila-resultado cc-fila-${item.estadoColor}`}
                >
                  <div className="cc-res-col-val">
                    <span className="cc-res-num">
                      {item.condicion === 'mas' ? `> ${item.numero}` : `< ${item.numero}`}
                    </span>
                    <span className="cc-res-dist">dif: {item.diff}</span>
                  </div>

                  <div className="cc-res-col-jugadores">
                    <div className="cc-res-autor-linea">
                      <strong>
                        {item.nombre}{item.jugadorId === yoId ? ' (tú)' : ''}
                      </strong>
                      <span
                        className={`cc-badge-pts ${
                          item.puntosGanados > 0 ? 'pos' : item.puntosGanados < 0 ? 'neg' : ''
                        }`}
                      >
                        {item.puntosGanados >= 0 ? `+${item.puntosGanados}` : item.puntosGanados} pts
                      </span>
                    </div>
                  </div>

                  <div className="cc-res-etiqueta">
                    {item.estadoColor === 'azul' && '🎯 Clavado'}
                    {item.estadoColor === 'verde' && '✓ Acertada'}
                    {item.estadoColor === 'rojo' && '❌ Fallada'}
                  </div>
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
                    <span className="cc-ranking-pts">{pts} pts</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="qqp-barra">
            {esAdmin ? (
              <>
                {sala.rondaActual < sala.maxRondas && (
                  <BotonPrincipal onClick={handleSiguienteRonda}>
                    <Icon name="play" size={20} /> Siguiente ronda ({sala.rondaActual + 1} de {sala.maxRondas})
                  </BotonPrincipal>
                )}
                <EnlaceSecundario onClick={handleFinalizarPartida}>
                  Finalizar partida y ver podio 🏆
                </EnlaceSecundario>
              </>
            ) : (
              <p className="qqp-estado">
                <span className="qqp-spinner" aria-hidden="true" /> Esperando a que el anfitrión avance a la siguiente ronda…
              </p>
            )}
          </div>
        </section>
      )}

      {/* 10. SALA: PODIO FINAL */}
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
                    <span className="cc-ranking-pts">{pts} pts</span>
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