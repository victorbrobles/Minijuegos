// client/src/games/Conecta/ConectaOnline.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import CategoryCard from '../../components/CategoryCard.jsx';
import './Conecta.css';

const CLAVE_SESION_CONECTA = 'conecta_online_session';
const TIEMPO_RESPUESTA_S = 30;

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

  // Estados locales durante la selección de casillas y temporizador
  const [seleccionados, setSeleccionados] = useState([]);
  const [inputTema, setInputTema] = useState('');
  const [mensajeFeedback, setMensajeFeedback] = useState(null);
  const [segundosRespuesta, setSegundosRespuesta] = useState(TIEMPO_RESPUESTA_S);

  // Seguimiento de turnos por ciclo
  const [jugadoresRespondieronTurno, setJugadoresRespondieronTurno] = useState([]);
  const prevPulsadoRef = useRef(null);

  const intervalRef = useRef(null);
  const seleccionadosRef = useRef(seleccionados);
  useEffect(() => {
    seleccionadosRef.current = seleccionados;
  }, [seleccionados]);

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
  const soyElQueHaPulsado = Boolean(sala?.jugadorPulsado && sala.jugadorPulsado.jugadorId === yoId);
  const alguienHaPulsado = Boolean(sala?.jugadorPulsado);
  const miJugador = sala?.jugadores?.find((j) => j.id === yoId);
  const sinVidas = (miJugador?.vidas ?? 3) <= 0;

  useEffect(() => {
    setJugadoresRespondieronTurno([]);
  }, [sala?.rondaActual, sala?.estado === 'categoria']);

  useEffect(() => {
    const jugadorAnterior = prevPulsadoRef.current;
    const jugadorActual = sala?.jugadorPulsado;
    if (jugadorAnterior && (!jugadorActual || jugadorActual.jugadorId !== jugadorAnterior.jugadorId)) {
      const pId = jugadorAnterior.jugadorId;
      setJugadoresRespondieronTurno((prev) => {
        const nuevo = prev.includes(pId) ? prev : [...prev, pId];
        const vivos = (sala?.jugadores || []).filter((j) => (j.vidas ?? 3) > 0);
        const todosRespondieron = vivos.length === 0 || vivos.every((j) => nuevo.includes(j.id));
        return todosRespondieron ? [] : nuevo;
      });
    }
    prevPulsadoRef.current = jugadorActual;
  }, [sala?.jugadorPulsado, sala?.jugadores]);

  const jugadoresVivos = (sala?.jugadores || []).filter((j) => (j.vidas ?? 3) > 0);
  const respondieronLista = (sala?.respondieronIds && Array.isArray(sala.respondieronIds)) ? sala.respondieronIds : jugadoresRespondieronTurno;
  const cicloCompleto = jugadoresVivos.length === 0 || jugadoresVivos.every((j) => respondieronLista.includes(j.id));
  const respondieronEfectivos = cicloCompleto ? [] : respondieronLista;
  const yaRespondioEnCiclo = respondieronEfectivos.includes(yoId);

  useEffect(() => {
    if (!alguienHaPulsado) {
      setSegundosRespuesta(TIEMPO_RESPUESTA_S);
      return;
    }
    setSegundosRespuesta(TIEMPO_RESPUESTA_S);
    const t = setInterval(() => {
      setSegundosRespuesta((prev) => {
        if (prev <= 0.1) {
          clearInterval(t);
          if (soyElQueHaPulsado) handleTiempoAgotadoOnline();
          return 0;
        }
        return Math.max(0, prev - 0.1);
      });
    }, 100);
    return () => clearInterval(t);
  }, [alguienHaPulsado, soyElQueHaPulsado]);

  const handleTiempoAgotadoOnline = async () => {
    if (!sesion) return;
    if (seleccionadosRef.current && seleccionadosRef.current.length === 4) {
      handleConfirmarSeleccionOnline();
    } else {
      handleCancelarTurno();
    }
  };

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
        body: JSON.stringify({ token: sesion.token })
      });
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleSeleccionarCategoria = async (catId) => {
    if (!sesion) return;
    setSeleccionados([]);
    setMensajeFeedback(null);
    try {
      await fetch(`/api/conecta/online/sala/${sesion.code}/seleccionar-categoria`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token, categoriaId: catId })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handlePulsarRojo = async () => {
    if (!sesion || yaRespondioEnCiclo) return;
    setSeleccionados([]);
    setMensajeFeedback(null);
    setSegundosRespuesta(TIEMPO_RESPUESTA_S);
    try {
      await fetch(`/api/conecta/online/sala/${sesion.code}/pulsar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelarTurno = async () => {
    if (!sesion) return;
    setSeleccionados([]);
    try {
      await fetch(`/api/conecta/online/sala/${sesion.code}/cancelar-turno`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSeleccionOnline = (item) => {
    if (seleccionados.some((s) => s.texto === item.texto)) {
      setSeleccionados(seleccionados.filter((s) => s.texto !== item.texto));
    } else {
      if (seleccionados.length < 4) {
        setSeleccionados([...seleccionados, item]);
      }
    }
  };

  const handleConfirmarSeleccionOnline = async () => {
    if (seleccionados.length !== 4 || !sesion) return;
    try {
      const res = await fetch(`/api/conecta/online/sala/${sesion.code}/confirmar-seleccion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token, seleccionados })
      });
      const data = await res.json();
      if (!data.correcto) {
        if (data.tresCorrectos) setMensajeFeedback('¡Tienes 3 correctos de una misma conexión! (-1 ❤️)');
        else setMensajeFeedback('¡No forman una conexión! (-1 ❤️)');
        setTimeout(() => setMensajeFeedback(null), 2000);
      }
      setSeleccionados([]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleValidarTema = async (saltar = false) => {
    if (!sesion) return;
    try {
      await fetch(`/api/conecta/online/sala/${sesion.code}/validar-tema`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token, inputTema, saltar })
      });
      setInputTema('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleContinuarTrasTema = async () => {
    if (!sesion) return;
    try {
      await fetch(`/api/conecta/online/sala/${sesion.code}/continuar-tras-tema`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleRendirse = async () => {
    if (!sesion) return;
    try {
      await fetch(`/api/conecta/online/sala/${sesion.code}/rendirse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token })
      });
    } catch (err) {
      console.error(err);
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
              <Icon name="dice" size={44} strokeWidth={1.6} />
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
              {codigoCopiado ? '¡Copiado al portapapeles!' : 'Pulsa el código para copiarlo y compártelo con los demás.'}
            </p>
          </div>

          <div className="panel" style={{ marginTop: '1rem' }}>
            <h3 className="panel-title"><Icon name="users" size={20} /> Jugadores ({sala.jugadores.length})</h3>
            <div className="lb-lista">
              {sala.jugadores.map((j) => (
                <div key={j.id} className={`lb-jug ${j.id === yoId ? 'yo' : ''}`}>
                  <span className="lb-jug-nombre">
                    {j.nombre}{j.id === yoId ? ' (tú)' : ''}{j.id === 1 ? ' 👑' : ''}
                  </span>
                </div>
              ))}
            </div>
            {sala.jugadores.length < 3 && (
              <p className="hint" style={{ marginTop: '0.8rem' }}>
                Faltan al menos {3 - sala.jugadores.length} jugadores para poder empezar (mínimo 3).
              </p>
            )}
          </div>

          {esAdmin ? (
            <div style={{ marginTop: '1.2rem' }}>
              <button
                type="button"
                className="big full qq-btn-principal"
                disabled={sala.jugadores.length < 3}
                onClick={handleIniciarJuego}
              >
                <Icon name="play" size={22} />
                {sala.jugadores.length < 3 ? 'Esperando jugadores...' : '¡Elegir Categoría y Empezar!'}
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
        <section className="game">
          <div className="panel qq-menu-panel">
            <div className="qq-card-top">
              <BotonVolver texto="Volver a la portada" onClick={() => setModalSalirPortada(true)} />
              <span className="qq-tablero-badge" style={{ marginBottom: 0 }}>
                Ronda {sala.rondaActual}
              </span>
            </div>

            {esAdmin ? (
              <>
                <div className="qq-section-header">
                  <h3 className="qq-section-title">Elige la categoría</h3>
                  <p className="hint">Al seleccionarla, aparecerá el tablero en todos los móviles.</p>
                </div>
                <div className="rf-opciones conecta-categories-grid">
                  {CATEGORIAS_METADATA.map((cat, idx) => (
                    <CategoryCard
                      key={cat.id}
                      nombre={cat.nombre}
                      icono={cat.icono}
                      indice={idx}
                      onClick={() => handleSeleccionarCategoria(cat.id)}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="panel center" style={{ padding: '2.5rem 1.5rem' }}>
                <span className="lb-luna chica"><Icon name="hourglass" size={40} /></span>
                <h3>El anfitrión está eligiendo la categoría...</h3>
                <p className="hint">En cuanto la seleccione, aparecerá el tablero en tu pantalla.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 6. SALA: JUGANDO ONLINE */}
      {vista === 'sala' && sala && sala.estado === 'juego' && (
        <section className="game">
          <div className="panel qq-menu-panel">
            <div className="qq-card-top" style={{ marginBottom: '0.8rem' }}>
              <BotonVolver texto="Volver a la portada" onClick={() => setModalSalirPortada(true)} />
              <span className="qq-tablero-badge" style={{ marginBottom: 0 }}>
                Ronda {sala.rondaActual} · {sala.conexionesResueltas.length}/4
              </span>
            </div>

            <div className="scoreboard-container" style={{ justifyContent: 'center', marginBottom: '0.8rem' }}>
              {sala.jugadores.map((j) => {
                const yaRespondio = respondieronEfectivos.includes(j.id);
                return (
                  <div key={j.id} className={`score-pill ${j.vidas <= 0 ? 'locked' : ''}`}>
                    <span>
                      {j.nombre}: {j.vidas > 0 ? '❤️'.repeat(j.vidas) : '💀 Fuera'} {yaRespondio && j.vidas > 0 ? '· ⏳' : ''}
                    </span>
                  </div>
                );
              })}
            </div>

            {sala.conexionesResueltas.length > 0 && (
              <div className="conecta-resueltos-lista">
                {sala.conexionesResueltas.map((r, idx) => (
                  <div key={idx} className="conecta-grupo-resuelto-card">
                    <div className="conecta-resuelto-header">
                      <strong>{r.tema}</strong>
                      <span>+{r.puntosGanados} pts ({r.resueltoPor})</span>
                    </div>
                    <div className="conecta-resuelto-items">{r.elementos.join(' • ')}</div>
                  </div>
                ))}
              </div>
            )}

            {sala.tablero.length > 0 && (
              <div className="conecta-grid-16">
                {sala.tablero.map((item, idx) => {
                  const seleccionado = seleccionados.some((s) => s.texto === item.texto);
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={!soyElQueHaPulsado}
                      className={`conecta-item-btn ${seleccionado ? 'seleccionado' : ''}`}
                      onClick={() => toggleSeleccionOnline(item)}
                    >
                      <span>{item.texto}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {mensajeFeedback && (
              <div className="conecta-feedback-banner">{mensajeFeedback}</div>
            )}

            <div className="interactive-controls" style={{ marginTop: '1.2rem' }}>
              {!alguienHaPulsado && (
                <div className="pulsador-container">
                  <button
                    type="button"
                    className="btn-pulsador-rojo"
                    onClick={handlePulsarRojo}
                    disabled={sinVidas || yaRespondioEnCiclo}
                  >
                    <span className="pulsador-icono">🔴</span>
                    <span className="pulsador-texto">
                      {sinVidas
                        ? 'SIN VIDAS EN ESTA RONDA'
                        : yaRespondioEnCiclo
                        ? 'ESPERANDO A LOS DEMÁS...'
                        : '¡PULSAR PARA RESPONDER!'}
                    </span>
                  </button>
                  {yaRespondioEnCiclo && (
                    <p className="hint small center" style={{ marginTop: '0.5rem' }}>
                      Ya has respondido en esta ronda ({respondieronEfectivos.length}/{jugadoresVivos.length}). Podrás volver a pulsar cuando todos hayan participado.
                    </p>
                  )}
                </div>
              )}

              {soyElQueHaPulsado && (
                <div className="respuesta-pulsada-box">
                  <div className="respuesta-pulsada-header">
                    <span className="pulsado-badge" style={{ background: '#dcfce7', color: '#166534' }}>
                      🔴 ¡Has pulsado! Selecciona 4 casillas ({seleccionados.length}/4)
                    </span>

                    <div
                      className="timer"
                      role="timer"
                      style={{
                        margin: '0.6rem 0 0.3rem',
                        background: '#e2e8f0',
                        borderRadius: '9999px',
                        height: '8px',
                        overflow: 'hidden'
                      }}
                    >
                      <div
                        className={`timer-bar ${segundosRespuesta <= 7 ? 'low' : ''}`}
                        style={{
                          width: `${(segundosRespuesta / TIEMPO_RESPUESTA_S) * 100}%`,
                          height: '100%',
                          backgroundColor: segundosRespuesta <= 7 ? '#ef4444' : '#16a34a',
                          borderRadius: '9999px',
                          transition: 'width 0.1s linear, background-color 0.3s ease'
                        }}
                      />
                    </div>
                    <p
                      className="timer-text"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem',
                        color: segundosRespuesta <= 7 ? '#dc2626' : '#64748b',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        margin: '0 0 0.8rem'
                      }}
                    >
                      <Icon name="clock" size={16} />
                      {Math.ceil(segundosRespuesta)} s
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.8rem' }}>
                    <button
                      type="button"
                      className="big full"
                      disabled={seleccionados.length !== 4}
                      onClick={handleConfirmarSeleccionOnline}
                    >
                      <Icon name="check" size={20} /> Confirmar 4 casillas
                    </button>
                    <button
                      type="button"
                      className="secondary full"
                      onClick={handleCancelarTurno}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {alguienHaPulsado && !soyElQueHaPulsado && (
                <div className="online-tecleo-preview-card">
                  <div className="online-tecleo-header">
                    <span className="pulsador-icono">🔴</span>
                    <strong>¡{sala.jugadorPulsado.nombre} ha pulsado!</strong>
                  </div>
                  <p className="hint small" style={{ margin: '0.4rem 0 0.4rem' }}>
                    Está seleccionando las 4 casillas en su pantalla...
                  </p>

                  <div
                    className="timer"
                    role="timer"
                    style={{
                      margin: '0.6rem 0 0.3rem',
                      background: '#e2e8f0',
                      borderRadius: '9999px',
                      height: '8px',
                      overflow: 'hidden'
                    }}
                  >
                    <div
                      className={`timer-bar ${segundosRespuesta <= 7 ? 'low' : ''}`}
                      style={{
                        width: `${(segundosRespuesta / TIEMPO_RESPUESTA_S) * 100}%`,
                        height: '100%',
                        backgroundColor: segundosRespuesta <= 7 ? '#ef4444' : '#16a34a',
                        borderRadius: '9999px',
                        transition: 'width 0.1s linear, background-color 0.3s ease'
                      }}
                    />
                  </div>
                  <p
                    className="timer-text"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem',
                      color: segundosRespuesta <= 7 ? '#dc2626' : '#64748b',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      margin: '0'
                    }}
                  >
                    <Icon name="clock" size={16} />
                    {Math.ceil(segundosRespuesta)} s
                  </p>
                </div>
              )}
            </div>

            {esAdmin && (
              <div className="qq-tablero-footer">
                <button type="button" className="qq-link-otra-ronda" onClick={handleRendirse}>
                  Rendirse y ver soluciones (Anfitrión)
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 7. SALA: ADIVINAR LA CONEXIÓN */}
      {vista === 'sala' && sala && sala.estado === 'resolucion_grupo' && sala.grupoParaTema && (
        <section className="game">
          <div className="panel qq-menu-panel">
            <div className="qq-card-top" style={{ marginBottom: '0.8rem' }}>
              <BotonVolver texto="Volver a la portada" onClick={() => setModalSalirPortada(true)} />
            </div>

            <div className="starter" style={{ marginBottom: '1.2rem', textAlign: 'center' }}>
              <Icon name="trophy" size={28} />
              <p>¡Conexión acertada por <strong>{sala.grupoParaTema.resueltoPor}</strong>!</p>
            </div>

            <div className="panel aprox-pregunta-card">
              <span className="aprox-badge-pregunta">Pregunta extra (+1 punto)</span>
              <h2 className="aprox-pregunta-texto">¿Qué relación une a estos 4 elementos?</h2>
              <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', flexWrap: 'wrap', margin: '1rem 0' }}>
                {sala.grupoParaTema.elementos.map((el, i) => (
                  <span key={i} className="chip">{el}</span>
                ))}
              </div>
            </div>

            {!sala.feedbackTema ? (
              soyElQueHaPulsado ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleValidarTema(false);
                  }}
                  className="panel aprox-formulario"
                  style={{ marginTop: '1rem' }}
                >
                  <label className="field-label" htmlFor="input-tema-online">
                    Introduce la conexión:
                  </label>
                  <input
                    id="input-tema-online"
                    type="text"
                    autoFocus
                    placeholder="Ej: Campeones del mundo..."
                    value={inputTema}
                    onChange={(e) => setInputTema(e.target.value)}
                  />
                  <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1rem' }}>
                    <button type="submit" className="big full" style={{ flex: 2 }}>
                      <Icon name="check" size={22} /> Validar (+1 pt)
                    </button>
                    <button
                      type="button"
                      className="secondary full"
                      style={{ flex: 1 }}
                      onClick={() => handleValidarTema(true)}
                    >
                      Pasar
                    </button>
                  </div>
                </form>
              ) : (
                <div className="panel center" style={{ padding: '2rem 1rem', marginTop: '1rem' }}>
                  <h3>{sala.grupoParaTema.resueltoPor} está adivinando la conexión...</h3>
                  <p className="hint">Tiene la oportunidad de sumar +1 punto extra.</p>
                </div>
              )
            ) : (
              <div className="panel aprox-pregunta-card" style={{ padding: '1.8rem 1.4rem', marginTop: '1rem' }}>
                <div
                  className={
                    sala.feedbackTema.esCorrecto
                      ? 'conecta-feedback-banner-acierto'
                      : sala.feedbackTema.saltado
                      ? 'conecta-feedback-banner-info'
                      : 'conecta-feedback-banner-fallo'
                  }
                >
                  {sala.feedbackTema.esCorrecto ? (
                    <>🎯 ¡Correcto! <strong>+1 punto extra</strong> para {sala.feedbackTema.jugadorNombre}.</>
                  ) : sala.feedbackTema.saltado ? (
                    <>ℹ️ No se ha intentado adivinar la temática.</>
                  ) : (
                    <>❌ ¡Incorrecto! La respuesta no era correcta.</>
                  )}
                </div>

                <div style={{ marginTop: '1.2rem', fontSize: '1.15rem', color: '#1e1b4b' }}>
                  La conexión era: <strong style={{ color: '#2563eb' }}>{sala.feedbackTema.temaReal}</strong>
                </div>

                {esAdmin ? (
                  <button
                    type="button"
                    className="big full qq-btn-principal"
                    style={{ marginTop: '1.5rem' }}
                    onClick={handleContinuarTrasTema}
                  >
                    <Icon name="play" size={20} /> Continuar partida
                  </button>
                ) : (
                  <p className="hint center" style={{ marginTop: '1.2rem' }}>
                    Esperando a que el anfitrión continúe...
                  </p>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* 8. SALA: 4ª Y ÚLTIMA CONEXIÓN ONLINE */}
      {vista === 'sala' && sala && sala.estado === 'ultima_conexion' && sala.ultimoGrupoPendiente && (
        <section className="game">
          <div className="panel qq-menu-panel">
            <div className="qq-card-top" style={{ marginBottom: '0.8rem' }}>
              <BotonVolver texto="Volver a la portada" onClick={() => setModalSalirPortada(true)} />
            </div>

            <div className="starter" style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
              <Icon name="target" size={28} />
              <p>¡3 conexiones resueltas! Queda la última conexión:</p>
            </div>

            <div className="panel aprox-pregunta-card">
              <span className="aprox-badge-pregunta" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
                Últimos 4 elementos
              </span>
              <h2 className="aprox-pregunta-texto">¿De qué trata esta última conexión?</h2>
              <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', flexWrap: 'wrap', margin: '1rem 0' }}>
                {sala.ultimoGrupoPendiente.elementos.map((el, i) => (
                  <span key={i} className="chip" style={{ fontSize: '1rem', padding: '0.6rem 1rem' }}>{el}</span>
                ))}
              </div>
              <p className="field-label" style={{ marginTop: '0.6rem' }}>
                Cualquiera puede pulsar el botón rojo para adivinar la temática (+1 pt extra / -1 vida):
              </p>
            </div>

            {sala.feedbackTema && (
              <div className="panel aprox-pregunta-card" style={{ padding: '1.6rem 1.4rem', marginTop: '1rem' }}>
                <div className={sala.feedbackTema.esCorrecto ? 'conecta-feedback-banner-acierto' : 'conecta-feedback-banner-fallo'}>
                  {sala.feedbackTema.esCorrecto ? (
                    <>🎯 ¡Correcto! <strong>+1 punto extra</strong> para {sala.feedbackTema.jugadorNombre}.</>
                  ) : (
                    <>❌ ¡Incorrecto! {sala.feedbackTema.jugadorNombre} pierde 1 vida.</>
                  )}
                </div>

                {sala.feedbackTema.esCorrecto && (
                  <div style={{ marginTop: '1.2rem', fontSize: '1.15rem', color: '#1e1b4b' }}>
                    Conexión: <strong style={{ color: '#2563eb' }}>{sala.feedbackTema.temaReal}</strong>
                  </div>
                )}

                {esAdmin ? (
                  <button
                    type="button"
                    className="big full qq-btn-principal"
                    style={{ marginTop: '1.2rem' }}
                    onClick={handleContinuarTrasTema}
                  >
                    Ver soluciones completas
                  </button>
                ) : (
                  <p className="hint center" style={{ marginTop: '1.2rem' }}>
                    Esperando a que el anfitrión continúe...
                  </p>
                )}
              </div>
            )}

            {!sala.feedbackTema && (
              <div className="interactive-controls" style={{ margin: '1.2rem 0' }}>
                {!alguienHaPulsado && (
                  <div className="pulsador-container">
                    <button
                      type="button"
                      className="btn-pulsador-rojo"
                      onClick={handlePulsarRojo}
                      disabled={sinVidas || yaRespondioEnCiclo}
                    >
                      <span className="pulsador-icono">🔴</span>
                      <span className="pulsador-texto">
                        {sinVidas
                          ? 'SIN VIDAS EN ESTA RONDA'
                          : yaRespondioEnCiclo
                          ? 'ESPERANDO A LOS DEMÁS...'
                          : '¡PULSAR PARA ADIVINAR!'}
                      </span>
                    </button>
                  </div>
                )}

                {soyElQueHaPulsado && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleValidarTema(false);
                    }}
                    className="panel aprox-formulario"
                  >
                    <label className="field-label" htmlFor="input-tema-u-on">
                      Introduce la conexión:
                    </label>
                    <input
                      id="input-tema-u-on"
                      type="text"
                      autoFocus
                      placeholder="Escribe la conexión..."
                      value={inputTema}
                      onChange={(e) => setInputTema(e.target.value)}
                      required
                    />

                    <div
                      className="timer"
                      role="timer"
                      style={{
                        margin: '0.6rem 0 0.3rem',
                        background: '#e2e8f0',
                        borderRadius: '9999px',
                        height: '8px',
                        overflow: 'hidden'
                      }}
                    >
                      <div
                        className={`timer-bar ${segundosRespuesta <= 7 ? 'low' : ''}`}
                        style={{
                          width: `${(segundosRespuesta / TIEMPO_RESPUESTA_S) * 100}%`,
                          height: '100%',
                          backgroundColor: segundosRespuesta <= 7 ? '#ef4444' : '#16a34a',
                          borderRadius: '9999px',
                          transition: 'width 0.1s linear, background-color 0.3s ease'
                        }}
                      />
                    </div>
                    <p
                      className="timer-text"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem',
                        color: segundosRespuesta <= 7 ? '#dc2626' : '#64748b',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        margin: '0 0 0.8rem'
                      }}
                    >
                      <Icon name="clock" size={16} />
                      {Math.ceil(segundosRespuesta)} s
                    </p>

                    <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.8rem' }}>
                      <button type="submit" className="big full" style={{ flex: 2 }}>
                        <Icon name="check" size={20} /> Validar (+1 pt)
                      </button>
                      <button type="button" className="secondary full" style={{ flex: 1 }} onClick={handleCancelarTurno}>
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}

                {alguienHaPulsado && !soyElQueHaPulsado && (
                  <div className="online-tecleo-preview-card">
                    <div className="online-tecleo-header">
                      <span className="pulsador-icono">🔴</span>
                      <strong>¡{sala.jugadorPulsado.nombre} ha pulsado!</strong>
                    </div>
                    <p className="hint small" style={{ margin: '0.4rem 0 0.4rem' }}>
                      Está respondiendo en su pantalla...
                    </p>

                    <div
                      className="timer"
                      role="timer"
                      style={{
                        margin: '0.6rem 0 0.3rem',
                        background: '#e2e8f0',
                        borderRadius: '9999px',
                        height: '8px',
                        overflow: 'hidden'
                      }}
                    >
                      <div
                        className={`timer-bar ${segundosRespuesta <= 7 ? 'low' : ''}`}
                        style={{
                          width: `${(segundosRespuesta / TIEMPO_RESPUESTA_S) * 100}%`,
                          height: '100%',
                          backgroundColor: segundosRespuesta <= 7 ? '#ef4444' : '#16a34a',
                          borderRadius: '9999px',
                          transition: 'width 0.1s linear, background-color 0.3s ease'
                        }}
                      />
                    </div>
                    <p
                      className="timer-text"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem',
                        color: segundosRespuesta <= 7 ? '#dc2626' : '#64748b',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        margin: '0'
                      }}
                    >
                      <Icon name="clock" size={16} />
                      {Math.ceil(segundosRespuesta)} s
                    </p>
                  </div>
                )}
              </div>
            )}

            {esAdmin && !sala.feedbackTema && (
              <div className="qq-tablero-footer">
                <button type="button" className="qq-link-otra-ronda" onClick={handleRendirse}>
                  Nadie la sabe / Ver soluciones (Anfitrión)
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 9. SALA: RONDA FIN */}
      {vista === 'sala' && sala && sala.estado === 'ronda_fin' && (
        <section className="game">
          <div className="panel qq-menu-panel">
            <div className="qq-card-top" style={{ marginBottom: '0.8rem' }}>
              <BotonVolver texto="Volver a la portada" onClick={() => setModalSalirPortada(true)} />
              <span className="qq-tablero-badge" style={{ marginBottom: 0 }}>
                Ronda {sala.rondaActual} finalizada
              </span>
            </div>

            <div className="starter" style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <Icon name="trophy" size={28} />
              <p style={{ margin: 0 }}>Soluciones del Tablero</p>
            </div>

            <div className="conecta-resueltos-lista">
              {sala.grupos.map((g, idx) => (
                <div key={idx} className="conecta-grupo-resuelto-card">
                  <div className="conecta-resuelto-header"><strong>{g.tema}</strong></div>
                  <div className="conecta-resuelto-items">{g.elementos.join(' • ')}</div>
                </div>
              ))}
            </div>

            <div className="scoreboard" style={{ width: '100%', marginTop: '1.5rem' }}>
              <h3 className="section-title" style={{ margin: '0 0 0.8rem', textAlign: 'center' }}>
                Marcador general
              </h3>
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

            {esAdmin ? (
              <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <button type="button" className="big full qq-btn-principal" onClick={handleSiguienteRonda}>
                  <Icon name="play" size={20} /> Siguiente ronda ({sala.rondaActual + 1})
                </button>
                <div className="qq-tablero-footer" style={{ marginTop: 0, paddingTop: '0.6rem', borderTop: 'none' }}>
                  <button type="button" className="qq-link-otra-ronda" onClick={handleFinalizarPartida}>
                    Finalizar partida 🏆
                  </button>
                </div>
              </div>
            ) : (
              <p className="hint center" style={{ marginTop: '1.5rem' }}>Esperando a que el anfitrión avance...</p>
            )}
          </div>
        </section>
      )}

      {/* 10. SALA: PODIO FINAL */}
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