// client/src/games/Trescientosuno/TrescientosunoOnline.jsx
import SalonFama from '../../components/SalonFama.jsx';
import { useRegistrarPartida } from '../../lib/registros.js';
import { nombreIdentidad } from '../../lib/identidad.js';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import './Trescientosuno.css';
import {
  Aviso,
  BotonPortada,
  Cabecera,
  Avatar,
  EscudoEquipo,
  OrdenTurnos,
  TarjetaEquipo,
  BotonPrincipal,
  EnlaceSecundario,
  colorJugador,
  indiceColor
} from './TrescientosunoLocal.jsx';
import { limitesOnline, textoSala } from '../limites.js';
import { ChipJugadores } from '../../components/MenuJuego.jsx';
import { SelectorRondas } from '../../components/MenuJuego.jsx';
import { rondasPorDefecto } from '../rondas.js';

const LIM_ON = limitesOnline('trescientosuno');

const CLAVE_SESION_trescientosuno = 'trescientosuno_online_session';
const TIEMPO_TURNO = 60;

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

// Construye el mensaje completo con la cifra y la estadística restada
function formatearTextoEvento(ev, sala) {
  if (!ev || !ev.mensaje) return '';
  const stat = sala?.configuracion?.estadistica || 'puntos';
  const jEvento = sala?.jugadores?.find((j) => j.id === ev.jugadorId);

  if ((ev.tipo === 'acierto' || ev.tipo === 'ganador') && ev.valor != null) {
    const baseLimpia = String(ev.mensaje).replace(/[¡!]/g, '').trim();
    const yaIncluyeValor = String(ev.mensaje).includes(String(ev.valor));

    if (ev.tipo === 'ganador') {
      return yaIncluyeValor
        ? ev.mensaje
        : `¡DIANA! ${baseLimpia} resta ${ev.valor} ${stat}. ¡${jEvento ? jEvento.nombre : 'Jugador'} ha clavado el 0!`;
    }

    const restoTxt = jEvento != null ? ` (quedan ${jEvento.puntuacionActual})` : '';
    return yaIncluyeValor
      ? `${ev.mensaje}${restoTxt}`
      : `¡${baseLimpia} resta ${ev.valor} ${stat}!${restoTxt}`;
  }

  return ev.mensaje;
}

export default function TrescientosunoOnline({
  tituloJuego = '301 Goles',
  descripcionJuego,
  onLocal,
  onSalir,
  onAbrirAyuda
}) {
  const [rondasSel, setRondasSel] = useState(rondasPorDefecto('trescientosuno'));
  const navigate = useNavigate();
  const [vista, setVista] = useState('menu'); // 'menu' | 'online_menu' | 'crear' | 'unirse' | 'sala'

  const [nombre, setNombre] = useState(nombreIdentidad);
  const [codigoInput, setCodigoInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);

  const [modalSalirLobby, setModalSalirLobby] = useState(false);
  const [modalSalirPortada, setModalSalirPortada] = useState(false);

  const [sesion, setSesion] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem(CLAVE_SESION_trescientosuno)); } catch { return null; }
  });

  const [sala, setSala] = useState(null);
  const [codigoCopiado, setCodigoCopiado] = useState(false);

  const intervalRef = useRef(null);

  // Configuración de la partida en 2 pasos (igual que en modo local): 'equipo' | 'reglas'
  const [pasoConfig, setPasoConfig] = useState('equipo');
  const [equipos, setEquipos] = useState([]);
  const [filtroEquipo, setFiltroEquipo] = useState('');
  const [equipoSel, setEquipoSel] = useState(null);
  const [estadisticaSel, setEstadisticaSel] = useState('goles');
  const [objetivoSel, setObjetivoSel] = useState(301);

  // Estado local durante el turno
  const [inputJugador, setInputJugador] = useState('');
  const [errorJuego, setErrorJuego] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [comodinActivo, setComodinActivo] = useState(null);
  const [opcionesReveladas, setOpcionesReveladas] = useState(null);

  // Aviso flotante estilo Conecta
  const [eventoAviso, setEventoAviso] = useState(null);
  const avisoSeqRef = useRef(0);
  const ultimoEventoKeyRef = useRef('');

  useEffect(() => {
    if (!sesion) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setSala(null);
      return;
    }

    const consultarEstado = () => {
      fetch(`/api/trescientosuno/online/sala/${sesion.code}?token=${sesion.token}`)
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
          sessionStorage.removeItem(CLAVE_SESION_trescientosuno);
          setSesion(null);
          setSala(null);
          setVista('online_menu');
          setErrorMsg('La sala se ha cerrado.');
        });
    };

    consultarEstado();
    intervalRef.current = setInterval(consultarEstado, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sesion]);

  // Sincroniza el evento de la sala con el aviso flotante superior incluyendo los goles/asistencias/partidos restados
  useEffect(() => {
    const ev = sala?.evento;
    if (!ev || !ev.mensaje) return;
    const key = `${ev.tipo}-${ev.jugadorId}-${ev.mensaje}-${ev.valor ?? ''}`;
    if (key === ultimoEventoKeyRef.current) return;
    ultimoEventoKeyRef.current = key;
    avisoSeqRef.current += 1;
    setEventoAviso({
      n: avisoSeqRef.current,
      tipo: ev.tipo,
      texto: formatearTextoEvento(ev, sala)
    });
  }, [sala]);

  const llamar = async (ruta, body = {}) => {
    const res = await fetch(`/api/trescientosuno/online/sala/${sesion.code}/${ruta}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: sesion.token, ...body })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'No se ha podido completar la acción.');
    return data;
  };

  const accionAdmin = async (ruta, body) => {
    setErrorMsg('');
    setCargando(true);
    try {
      await llamar(ruta, body);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setCargando(false);
    }
  };

  const estadoSala = sala?.estado;

  useEffect(() => {
    if (estadoSala === 'configuracion') {
      setPasoConfig('equipo');
      setFiltroEquipo('');
      setErrorMsg('');
      if (equipos.length === 0) {
        fetch('/api/trescientosuno/equipos')
          .then((r) => r.json())
          .then((d) => { if (d.success) setEquipos(d.equipos); })
          .catch(() => setErrorMsg('No se han podido cargar los equipos.'));
      }
    }
  }, [estadoSala, equipos.length]);

  const turnoId = sala?.turnoActualId;
  useEffect(() => {
    setInputJugador('');
    setErrorJuego('');
    setComodinActivo(null);
    setOpcionesReveladas(null);
  }, [turnoId, estadoSala]);

  const activarRevelar = async () => {
    setComodinActivo('revelar');
    try {
      const res = await fetch(`/api/trescientosuno/online/sala/${sesion.code}/revelar-opciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token })
      });
      const data = await res.json();
      if (data.success) {
        setOpcionesReveladas(data.opciones);
      } else {
        setErrorJuego(data.error || 'Error al obtener opciones');
      }
    } catch {
      setErrorJuego('Error de conexión.');
    }
  };

  const enviarJugador = async (nombreAValidar) => {
    if (!nombreAValidar.trim() || enviando) return;
    setEnviando(true);
    setErrorJuego('');
    try {
      await llamar('jugar', { nombreJugador: nombreAValidar, comodin: comodinActivo });
      setInputJugador('');
      setComodinActivo(null);
      setOpcionesReveladas(null);
    } catch (err) {
      setErrorJuego(err.message);
    } finally {
      setEnviando(false);
    }
  };

  const plantarse = async () => {
    if (enviando) return;
    setEnviando(true);
    setErrorJuego('');
    try {
      await llamar('plantarse');
    } catch (err) {
      setErrorJuego(err.message);
    } finally {
      setEnviando(false);
    }
  };

  const pasarTurno = async () => {
    if (enviando) return;
    setEnviando(true);
    setErrorJuego('');
    try {
      await llamar('pasar');
    } catch (err) {
      setErrorJuego(err.message);
    } finally {
      setEnviando(false);
    }
  };

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
    sessionStorage.removeItem(CLAVE_SESION_trescientosuno);
    setSesion(null);
    setSala(null);
    setModalSalirPortada(false);

    if (sesionActual?.code && sesionActual?.token) {
      fetch(`/api/trescientosuno/online/sala/${sesionActual.code}/salir`, {
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
    sessionStorage.removeItem(CLAVE_SESION_trescientosuno);
    setSesion(null);
    setSala(null);
    setModalSalirLobby(false);
    setVista('online_menu');

    if (sesionActual?.code && sesionActual?.token) {
      fetch(`/api/trescientosuno/online/sala/${sesionActual.code}/salir`, {
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
      const res = await fetch('/api/trescientosuno/online/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear la sala.');

      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_trescientosuno, JSON.stringify(nueva));
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
      const res = await fetch('/api/trescientosuno/online/unirse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codigoInput.trim().toUpperCase(), nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al unirse.');

      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_trescientosuno, JSON.stringify(nueva));
      setSesion(nueva);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setCargando(false);
    }
  };

  const copiarCodigo = () => {
    if (!sala?.code) return;
    navigator.clipboard?.writeText(sala.code);
    setCodigoCopiado(true);
    setTimeout(() => setCodigoCopiado(false), 2000);
  };

  const normalizar = (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const equiposVisibles = filtroEquipo.trim()
    ? equipos.filter((eq) => normalizar(eq.nombre).includes(normalizar(filtroEquipo.trim())))
    : equipos;

  const esAdmin = Boolean(sala?.esAdmin);
  const yoId = sala?.yoId;
  const enPartidaActiva = vista === 'sala' && sala && sala.estado !== 'lobby';

  // Salón de la fama: se guarda la partida al llegar a la pantalla final
  useRegistrarPartida('trescientosuno', sala?.estado === 'resultados' ? (sala?.jugadores || []).filter((j) => j.nombre).map((j) => ({ nombre: j.nombre, puntos: null, gana: j.estado === 'ganador' })) : null);
  return (
    <div className={`tcu-contenedor ${enPartidaActiva ? 'qq-en-partida' : ''}`}>
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
              <Icon name="goal301" size={44} strokeWidth={1.7} />
            </div>
            <h1 className="title qq-main-title">{tituloJuego}</h1>
            <ChipJugadores juegoId="trescientosuno" />
            <p className="hint qq-main-desc">{descripcionJuego}</p>
            <SalonFama juegoId="trescientosuno" />

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
                  <span>Sé el anfitrión, genera un código y administra el juego</span>
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
              <label className="field-label" htmlFor="tcu-code-input">Código de la partida</label>
              <input
                id="tcu-code-input"
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

      {/* 4. SALA DE ESPERA (LOBBY - Última pantalla online con botón de ayuda) */}
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
            <h3 className="qq-sala-titulo">
              <Icon name="users" size={20} /> Jugadores ({sala.jugadores.length})
            </h3>
            <div className="lb-lista qq-sala-lista">
              {sala.jugadores.map((j) => (
                <div key={j.id} className={`lb-jug ${j.id === yoId ? 'yo' : ''}`}>
                  <span className="lb-jug-nombre">
                    {j.nombre}{j.id === yoId ? ' (tú)' : ''}{j.esAdmin ? ' 👑' : ''}
                  </span>
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
              <SelectorRondas juegoId="trescientosuno" valor={rondasSel} onCambiar={setRondasSel} numJugadores={sala.jugadores.length} />
            </div>
          )}
          {esAdmin ? (
            <button
              type="button"
              className="big full qq-btn-principal"
              style={{ marginTop: '1rem' }}
              disabled={sala.jugadores.length < LIM_ON.min}
              onClick={() => accionAdmin('empezar', { rondas: rondasSel })}
            >
              <Icon name="play" size={22} />
              {sala.jugadores.length < LIM_ON.min ? 'Esperando jugadores...' : 'Iniciar juego'}
            </button>
          ) : (
            <div className="panel center" style={{ padding: '1.8rem 1.4rem', marginTop: '1rem' }}>
              <span className="lb-luna chica"><Icon name="hourglass" size={36} /></span>
              <h3 style={{ margin: '0.4rem 0' }}>Esperando al anfitrión...</h3>
              <p className="hint">El anfitrión iniciará la partida y elegirá el equipo cuando estéis listos.</p>
            </div>
          )}
        </section>
      )}

      {/* 5. CONFIGURACIÓN ONLINE EN 2 PASOS (1: EQUIPO -> 2: ESTADÍSTICA Y CIFRA) */}
      {vista === 'sala' && sala && sala.estado === 'configuracion' && (
        esAdmin ? (
          pasoConfig === 'equipo' || !equipoSel ? (
            <section className="game qqp-escena">
              <header className="qqp-hero">
                <span className="qqp-hero-deco" aria-hidden="true">
                  <Icon name="goal301" size={150} strokeWidth={1.4} />
                </span>
                <div className="qqp-hero-top">
                  <BotonPortada texto="Portada" onClick={() => setModalSalirPortada(true)} />
                  <div className="qqp-hero-chips">
                    <span className="qqp-chip">
                      <Icon name="users" size={14} /> <span>{sala.jugadores.length} jugadores</span>
                    </span>
                  </div>
                </div>
                <p className="qqp-hero-etiqueta">Paso 1 de 2</p>
                <h2 className="qqp-hero-titulo">Selecciona un equipo</h2>
                <p className="qqp-hero-aviso">
                  Toca el escudo del club o selección cuyos futbolistas tendréis que nombrar.
                </p>

                <label className="qqp-buscador">
                  <Icon name="search" size={18} />
                  <input
                    type="search"
                    value={filtroEquipo}
                    onChange={(e) => setFiltroEquipo(e.target.value)}
                    placeholder="Buscar club o selección…"
                    aria-label="Buscar club o selección"
                  />
                </label>
              </header>

              {equipos.length === 0 ? (
                <p className="qqp-estado">
                  <span className="qqp-spinner" aria-hidden="true" /> Cargando equipos…
                </p>
              ) : equiposVisibles.length ? (
                <div className="tcu-grid-equipos">
                  {equiposVisibles.map((eq) => (
                    <TarjetaEquipo
                      key={eq.id}
                      equipo={eq}
                      seleccionado={equipoSel?.id === eq.id}
                      onClick={() => {
                        setEquipoSel(eq);
                        setPasoConfig('reglas');
                      }}
                    />
                  ))}
                </div>
              ) : (
                <p className="qqp-vacio">No hay ningún equipo que coincida con «{filtroEquipo}».</p>
              )}

              {errorMsg && <p className="error" style={{ margin: 0 }}>{errorMsg}</p>}
            </section>
          ) : (
            <section className="game qqp-escena">
              <Cabecera
                onSalir={() => setPasoConfig('equipo')}
                textoSalir="Cambiar equipo"
                etiqueta="Paso 2 de 2 · Reglas de la ronda"
                titulo={equipoSel.nombre}
                avatar={<EscudoEquipo equipo={equipoSel} size={64} />}
                chips={
                  <span className="qqp-chip">
                    <Icon name="users" size={14} /> <span>{sala.jugadores.length} jugadores</span>
                  </span>
                }
              />

              <div className="qqp-tarjeta">
                <div className="tcu-ajustes">
                  <div className="form-group">
                    <label className="qq-label-destacado" htmlFor="tcu-stat">
                      Estadística a restar
                    </label>
                    <div className="select-wrapper">
                      <select
                        id="tcu-stat"
                        className="game-select qq-input-moderno"
                        value={estadisticaSel}
                        onChange={(e) => setEstadisticaSel(e.target.value)}
                      >
                        <option value="goles">⚽ Goles históricos</option>
                        <option value="asistencias">👟 Asistencias históricas</option>
                        <option value="partidos">🏟️ Partidos jugados</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="qq-label-destacado" htmlFor="tcu-obj">
                      Puntuación inicial (Objetivo: 0)
                    </label>
                    <input
                      id="tcu-obj"
                      type="number"
                      className="player-text-input qq-input-moderno"
                      value={objetivoSel}
                      onChange={(e) => setObjetivoSel(Math.max(1, Number(e.target.value) || 1))}
                      min="1"
                    />
                  </div>
                </div>
              </div>

              {errorMsg && <p className="error" style={{ margin: 0 }}>{errorMsg}</p>}

              <div className="qqp-barra">
                <BotonPrincipal
                  disabled={cargando || !equipoSel}
                  onClick={() =>
                    accionAdmin('configurar', {
                      equipoId: equipoSel.id,
                      estadistica: estadisticaSel,
                      objetivo: objetivoSel
                    })
                  }
                >
                  <Icon name="play" size={22} /> ¡Comenzar partida!
                </BotonPrincipal>
              </div>
            </section>
          )
        ) : (
          <section className="game qqp-escena">
            <Cabecera
              onSalir={() => setModalSalirPortada(true)}
              etiqueta="Preparando partida"
              titulo="Eligiendo equipo…"
            />
            <div className="qqp-tarjeta qqp-pasar">
              <span className="lb-luna chica"><Icon name="hourglass" size={36} /></span>
              <h3 className="qqp-pasar-nombre" style={{ fontSize: '1.5rem', marginTop: '0.4rem' }}>
                Esperando al anfitrión
              </h3>
              <p className="qqp-texto">
                El anfitrión está seleccionando el equipo y la estadística de la partida.
              </p>
            </div>
          </section>
        )
      )}

      {/* 6. TABLERO JUGANDO ONLINE (Sin botón de ayuda) */}
      {vista === 'sala' && sala && sala.estado === 'jugando' && (() => {
        const stat = sala.configuracion.estadistica;
        const jTurno = sala.jugadores.find((j) => j.id === sala.turnoActualId);
        const yoInfo = sala.jugadores.find((j) => j.id === yoId);
        const esMiTurno = sala.turnoActualId === yoId;
        const ev = sala.evento;
        const totalSegundos = sala.tiempoTurno || TIEMPO_TURNO;

        return (
          <section className="game qqp-escena">
            <Cabecera
              onSalir={() => setModalSalirPortada(true)}
              etiqueta={esMiTurno ? `¡Es tu turno! · Objetivo: 0 ${stat}` : `Objetivo: clavar 0 ${stat}`}
              titulo={esMiTurno ? '¡Te toca jugar!' : `Turno de ${jTurno?.nombre || 'Jugador'}`}
              avatar={<EscudoEquipo equipo={sala.equipoSeleccionado} size={54} />}
              chips={
                <span className="qqp-chip">
                  <Icon name="shield" size={14} /> <span>{sala.equipoSeleccionado?.nombre}</span>
                </span>
              }
            >
              <div className="qqp-identidad tcu-hero-status">
                <div className="tcu-hero-status-row">
                  <span>
                    {esMiTurno ? (
                      <>Te quedan: <strong className="tcu-pts-destacado">{yoInfo?.puntuacionActual}</strong> {stat}</>
                    ) : (
                      <>Le quedan a {jTurno?.nombre}: <strong className="tcu-pts-destacado">{jTurno?.puntuacionActual}</strong> {stat}</>
                    )}
                  </span>
                  <span className={`tcu-timer-pill${sala.tiempoRestante <= 10 ? ' low' : ''}`}>
                    <Icon name="clock" size={14} /> {sala.tiempoRestante}s
                  </span>
                </div>
                <div className="tcu-timer-track" role="timer">
                  <div
                    className={`tcu-timer-fill${sala.tiempoRestante <= 10 ? ' low' : ''}`}
                    style={{ width: `${(sala.tiempoRestante / totalSegundos) * 100}%` }}
                  />
                </div>
              </div>

              <OrdenTurnos
                jugadores={sala.jugadores}
                activoId={sala.turnoActualId}
                yoId={yoId}
                eventoResta={ev}
              />
            </Cabecera>

            <div className="qqp-tarjeta tcu-turno-card">
              {ev ? (
                <div className="tcu-evento-display">
                  <span className="evento-icon">
                    {ev.tipo === 'acierto' && '⚽'}
                    {ev.tipo === 'ganador' && '🏆'}
                    {ev.tipo === 'fallo' && '❌'}
                    {ev.tipo === 'plantado' && '🛑'}
                    {ev.tipo === 'eliminado' && '💀'}
                  </span>
                  <h3>{formatearTextoEvento(ev, sala)}</h3>
                  {(ev.tipo === 'acierto' || ev.tipo === 'ganador') && ev.valor != null && (
                    <span className="tcu-ayuda-chip ok" style={{ fontSize: '1rem' }}>
                      -{ev.valor} {stat}
                    </span>
                  )}
                </div>
              ) : esMiTurno ? (
                <>
                  {yoInfo?.comodines && yoInfo.comodines.length > 0 && (
                    <div className="tcu-comodines-bloque">
                      <span className="qqp-carta-cara-titulo">Tus comodines</span>
                      <div className="tcu-comodines">
                        {yoInfo.comodines.map((c) => (
                          <button
                            key={c}
                            type="button"
                            className={`btn-comodin ${comodinActivo === c ? 'activo' : ''} ${c === 'revelar' && comodinActivo === 'revelar' ? 'revelar' : ''}`}
                            onClick={() => {
                              if (c === 'revelar') {
                                if (comodinActivo === 'revelar') {
                                  setComodinActivo(null);
                                  setOpcionesReveladas(null);
                                } else {
                                  activarRevelar();
                                }
                              } else {
                                setComodinActivo(comodinActivo === c ? null : c);
                              }
                            }}
                          >
                            {c === 'revelar' ? '🔍 Revelar' : `⭐ ${c.toUpperCase()}`}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {comodinActivo === 'revelar' && opcionesReveladas ? (
                    <div className="opciones-revelar-grid">
                      <p className="qqp-carta-cara-titulo" style={{ justifyContent: 'center' }}>
                        Elige un futbolista revelado
                      </p>
                      {opcionesReveladas.length > 0 ? (
                        opcionesReveladas.map((op) => (
                          <button
                            key={op.nombre}
                            type="button"
                            className="btn-opcion-revelada"
                            onClick={() => enviarJugador(op.nombre)}
                          >
                            ⚽ {op.nombre}
                          </button>
                        ))
                      ) : (
                        <p className="hint">No quedan jugadores disponibles.</p>
                      )}
                      <button
                        type="button"
                        className="tcu-btn-sec"
                        onClick={() => {
                          setComodinActivo(null);
                          setOpcionesReveladas(null);
                        }}
                      >
                        Cancelar y escribir manualmente
                      </button>
                    </div>
                  ) : (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        enviarJugador(inputJugador);
                      }}
                      className="tcu-form"
                    >
                      <input
                        type="text"
                        value={inputJugador}
                        onChange={(e) => {
                          setInputJugador(e.target.value);
                          setErrorJuego('');
                        }}
                        placeholder={`Futbolista del ${sala.equipoSeleccionado?.nombre}…`}
                        className="player-text-input qq-input-moderno"
                        autoFocus
                      />
                      {errorJuego && <p className="error" style={{ margin: '0 0 0.8rem' }}>{errorJuego}</p>}

                      <BotonPrincipal type="submit" disabled={enviando || !inputJugador.trim()}>
                        <Icon name="check" size={20} strokeWidth={2.5} /> Comprobar futbolista
                      </BotonPrincipal>

                      <div className="tcu-sub-actions">
                        <button type="button" className="tcu-btn-sec" disabled={enviando} onClick={pasarTurno}>
                          Pasar turno
                        </button>
                        <button type="button" className="tcu-btn-sec warn" disabled={enviando} onClick={plantarse}>
                          🛑 Plantarse ({yoInfo?.puntuacionActual})
                        </button>
                      </div>
                    </form>
                  )}
                </>
              ) : (
                <div className="qqp-pasar" style={{ padding: '0.6rem 0' }}>
                  <Avatar
                    nombre={jTurno?.nombre || '?'}
                    color={colorJugador((jTurno?.id ?? 1) - 1)}
                    grande
                  />
                  <p className="qqp-pasar-para">Pensando futbolista…</p>
                  <h3 className="qqp-pasar-nombre" style={{ fontSize: '1.75rem' }}>
                    {jTurno?.nombre}
                  </h3>
                  <p className="qqp-texto">
                    Está buscando un futbolista del <strong>{sala.equipoSeleccionado?.nombre}</strong> para restar {stat}.
                  </p>
                </div>
              )}
            </div>

            {sala.jugadoresUsados.length > 0 && (
              <div className="qqp-tarjeta tcu-usados-card">
                <p className="qqp-carta-cara-titulo" style={{ marginBottom: '0.6rem' }}>
                  Futbolistas ya dichos ({sala.jugadoresUsados.length})
                </p>
                <div className="tcu-usados-chips">
                  {sala.jugadoresUsados.map((nom) => (
                    <span key={nom} className="tcu-usado-pill">{nom}</span>
                  ))}
                </div>
              </div>
            )}
          </section>
        );
      })()}

      {/* 7. PODIO FINAL ONLINE */}
      {vista === 'sala' && sala && sala.estado === 'resultados' && (() => {
        const stat = sala.configuracion?.estadistica || 'pts';
        const ranking = [...sala.jugadores].sort(
          (a, b) => (a.estado === 'eliminado') - (b.estado === 'eliminado') || a.puntuacionActual - b.puntuacionActual
        );
        const mejor = ranking.find((j) => j.estado !== 'eliminado');

        return (
          <section className="game qqp-escena">
            <Cabecera
              onSalir={() => setModalSalirPortada(true)}
              etiqueta="Partida finalizada"
              titulo="Clasificación Final"
              avatar={<EscudoEquipo equipo={sala.equipoSeleccionado} size={54} />}
            >
              <div className="qqp-identidad">
                <span className="qqp-identidad-icono"><Icon name="trophy" size={16} /></span>
                <span>
                  {!mejor
                    ? 'Todos los jugadores han caído eliminados.'
                    : mejor.estado === 'ganador' || mejor.puntuacionActual === 0
                      ? <>¡Diana perfecta de <strong>{mejor.nombre}</strong> (clavó el 0)!</>
                      : <>Ganador: <strong>{mejor.nombre}</strong> (se quedó a <strong>{mejor.puntuacionActual}</strong>)</>}
                </span>
              </div>
            </Cabecera>

            <div className="qqp-tarjeta">
              <p className="qqp-carta-cara-titulo" style={{ marginBottom: '0.8rem' }}>
                <Icon name="users" size={16} /> Marcador final ({stat})
              </p>
              <ul className="qqp-rivales">
                {ranking.map((j, i) => {
                  const esGanador = mejor && mejor.id === j.id && j.estado !== 'eliminado';
                  return (
                    <li key={j.id} className="qqp-rival" style={{ '--c': colorJugador(indiceColor(j, i)) }}>
                      <span className="qqp-rival-avatar">
                        {j.estado === 'eliminado' ? '💀' : esGanador ? '👑' : i + 1}
                      </span>
                      <span className="qqp-rival-datos">
                        <span className="qqp-rival-nombre">
                          {j.estado === 'eliminado'
                            ? 'Eliminado'
                            : j.estado === 'plantado'
                              ? 'Plantado'
                              : esGanador
                                ? '¡Ganador!'
                                : `Puesto ${i + 1}`}
                        </span>
                        <strong className="qqp-rival-tarjeta">
                          {j.nombre}{j.id === yoId ? ' (tú)' : ''}
                        </strong>
                      </span>
                      <span className="tcu-ranking-pts">
                        {j.estado === 'eliminado' ? 'Eliminado' : `${j.puntuacionActual} ${stat}`}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {sala.serie && (
              <div className="qqp-tarjeta">
                <p className="qqp-carta-cara-titulo" style={{ marginBottom: '0.8rem' }}>
                  <Icon name="trophy" size={16} /> {sala.serie.partida >= sala.serie.max ? 'Clasificación final de la serie' : `Serie · partida ${sala.serie.partida} de ${sala.serie.max}`}
                </p>
                <ul className="qqp-rivales">
                  {[...sala.jugadores].sort((a, b) => (sala.serie.puntos[b.id] || 0) - (sala.serie.puntos[a.id] || 0)).map((j, i) => (
                    <li key={j.id} className="qqp-rival" style={{ '--c': colorJugador(indiceColor(j, i)) }}>
                      <span className="qqp-rival-avatar">{i === 0 && (sala.serie.puntos[j.id] || 0) > 0 ? '👑' : i + 1}</span>
                      <span className="qqp-rival-datos"><strong className="qqp-rival-tarjeta">{j.nombre}{j.id === yoId ? ' (tú)' : ''}</strong></span>
                      <span className="tcu-ranking-pts">{sala.serie.puntos[j.id] || 0} pts</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="qqp-barra">
              {esAdmin ? (
                <>
                  <BotonPrincipal
                    disabled={cargando || sala.jugadores.length < LIM_ON.min}
                    onClick={() => accionAdmin('revancha')}
                  >
                    <Icon name="refresh" size={20} /> {sala.serie && sala.serie.partida < sala.serie.max ? `Siguiente partida (${sala.serie.partida + 1} de ${sala.serie.max})` : 'Jugar otra serie'}
                  </BotonPrincipal>
                  <EnlaceSecundario onClick={() => setModalSalirPortada(true)}>
                    Salir a la portada principal
                  </EnlaceSecundario>
                </>
              ) : (
                <p className="qqp-estado">
                  <span className="qqp-spinner" aria-hidden="true" /> Esperando a que el anfitrión elija otro equipo…
                </p>
              )}
            </div>
          </section>
        );
      })()}

      {/* MODALES DE SALIDA */}
      {modalSalirLobby && (
        <div className="rg-modal-fondo" onClick={() => setModalSalirLobby(false)}>
          <div className="rg-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px', textAlign: 'center', padding: '1.8rem 1.4rem' }}>
            <div style={{ fontSize: '2.4rem', marginBottom: '0.4rem' }}>🚪</div>
            <h3 style={{ margin: '0 0 0.6rem', color: '#1e1b4b', fontSize: '1.3rem' }}>
              ¿Salir de la sala?
            </h3>
            <p className="hint" style={{ fontSize: '0.95rem', marginBottom: '1.4rem', lineHeight: '1.4' }}>
              Si sales ahora abandonarás la sala de espera y volverás al menú anterior. ¿Estás seguro?
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <button type="button" className="secondary full" onClick={() => setModalSalirLobby(false)}>
                No, quedarme
              </button>
              <button type="button" className="secondary danger full" style={{ background: '#ef4444', color: '#ffffff', borderColor: '#dc2626' }} onClick={handleVolverMenuOnline}>
                Sí, salir
              </button>
            </div>
          </div>
        </div>
      )}

      {modalSalirPortada && (
        <div className="rg-modal-fondo" onClick={() => setModalSalirPortada(false)}>
          <div className="rg-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px', textAlign: 'center', padding: '1.8rem 1.4rem' }}>
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
              <button type="button" className="secondary full" onClick={() => setModalSalirPortada(false)}>
                No, continuar
              </button>
              <button type="button" className="secondary danger full" style={{ background: '#ef4444', color: '#ffffff', borderColor: '#dc2626' }} onClick={handleCerrarSalaYSalirAPortada}>
                Sí, salir a portada
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}