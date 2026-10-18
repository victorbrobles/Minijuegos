// client/src/games/Conecta/ConectaOnline.jsx
import React, { useState, useEffect, useRef } from 'react';
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

export default function ConectaOnline({ onLocal, onSalir }) {
  const [vista, setVista] = useState('menu'); // 'menu' | 'crear' | 'unirse' | 'sala'
  const [nombre, setNombre] = useState('');
  const [codigoInput, setCodigoInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);
  const [modalSalir, setModalSalir] = useState(false);
  const [modalAyuda, setModalAyuda] = useState(false);

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
          setVista('menu');
          setErrorMsg('La sala se ha cerrado o se ha perdido la conexión.');
        });
    };

    consultarEstado();
    intervalRef.current = setInterval(consultarEstado, 600);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sesion]);

  const esAdmin = Boolean(sala?.esAdmin);
  const yoId = sala?.yoId;
  const soyElQueHaPulsado = Boolean(sala?.jugadorPulsado && sala.jugadorPulsado.jugadorId === yoId);
  const alguienHaPulsado = Boolean(sala?.jugadorPulsado);
  const miJugador = sala?.jugadores?.find((j) => j.id === yoId);
  const sinVidas = (miJugador?.vidas ?? 3) <= 0;

  // Seguimiento del ciclo de turnos: reiniciar en nueva ronda o categoría
  useEffect(() => {
    setJugadoresRespondieronTurno([]);
  }, [sala?.rondaActual, sala?.estado === 'categoria']);

  useEffect(() => {
    const jugadorAnterior = prevPulsadoRef.current;
    const jugadorActual = sala?.jugadorPulsado;

    // Cuando un jugador termina de responder (acertó, falló o canceló)
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
  const respondieronLista = (sala?.respondieronIds && Array.isArray(sala.respondieronIds))
    ? sala.respondieronIds
    : jugadoresRespondieronTurno;

  const cicloCompleto = jugadoresVivos.length === 0 || jugadoresVivos.every((j) => respondieronLista.includes(j.id));
  const respondieronEfectivos = cicloCompleto ? [] : respondieronLista;
  const yaRespondioEnCiclo = respondieronEfectivos.includes(yoId);

  // Temporizador de 30 segundos mientras alguien tiene el pulsador activo
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
          if (soyElQueHaPulsado) {
            handleTiempoAgotadoOnline();
          }
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
        if (data.tresCorrectos) {
          setMensajeFeedback('¡Tienes 3 correctos de una misma conexión! (-1 ❤️)');
        } else {
          setMensajeFeedback('¡No forman una conexión! (-1 ❤️)');
        }
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

  const handleSalir = async () => {
    if (sesion) {
      try {
        await fetch(`/api/conecta/online/sala/${sesion.code}/salir`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: sesion.token })
        });
      } catch {
        /* ignorar */
      }
    }
    sessionStorage.removeItem(CLAVE_SESION_CONECTA);
    setSesion(null);
    setSala(null);
    setVista('menu');
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

  // Mostrar ayuda en menús y en el lobby, desaparece al empezar a jugar
  const mostrarAyuda = vista === 'menu' || vista === 'crear' || vista === 'unirse' || (vista === 'sala' && sala?.estado === 'lobby');

  return (
    <div className="aprox-contenedor">
      {/* ---------------- BOTÓN Y MODAL DE AYUDA ---------------- */}
      {mostrarAyuda && (
        <button
          type="button"
          className="btn-ayuda-flotante"
          onClick={() => setModalAyuda(true)}
          title="Reglas de Conecta 4"
        >
          <span className="btn-ayuda-flotante-signo">?</span>
        </button>
      )}

      {modalAyuda && (
        <div className="rg-modal-fondo" onClick={() => setModalAyuda(false)}>
          <div className="rg-modal aprox-modal-ayuda" onClick={(e) => e.stopPropagation()}>
            <div className="aprox-modal-header">
              <span className="aprox-modal-signo-title">?</span>
              <h3>¿Cómo se juega a Conecta 4?</h3>
            </div>

            <div className="aprox-modal-cuerpo">
              <p><strong>1. Dinámica del juego:</strong></p>
              <ul>
                <li>El tablero tiene <strong>16 elementos</strong> distribuidos en 4 conexiones secretas.</li>
                <li><strong>Pulsa el botón rojo</strong> cuando sepas una conexión y marca 4 casillas. Dispondrás de <strong>30 segundos</strong> para responder.</li>
                <li><strong>Ciclo de turnos:</strong> Tras responder (aciertes o falles), debes esperar a que respondan los demás jugadores vivos antes de poder volver a pulsar. Al responder todos, el turno se reinicia para cualquiera.</li>
                <li>Si fallas, pierdes 1 vida (3 vidas por ronda). Si aciertas 3 de 4, el juego te avisará.</li>
                <li>Al acertar una conexión, puedes adivinar su temática para ganar <strong>+1 punto extra</strong>.</li>
              </ul>
              <p><strong>2. Puntuación:</strong></p>
              <div className="aprox-tabla-puntos">
                <div className="aprox-puntos-fila acierto">
                  <span>🥇 1ª conexión descubierta</span>
                  <strong>+5 puntos</strong>
                </div>
                <div className="aprox-puntos-fila intermedia" style={{ background: '#e0e7ff', color: '#4338ca' }}>
                  <span>🥈 2ª conexión descubierta</span>
                  <strong>+3 puntos</strong>
                </div>
                <div className="aprox-puntos-fila cercana">
                  <span>🥉 3ª conexión descubierta</span>
                  <strong>+1 punto</strong>
                </div>
              </div>
            </div>

            <div className="rg-modal-acciones">
              <button className="big full" onClick={() => setModalAyuda(false)}>
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ---------------- FIN AYUDA ---------------- */}

      {/* 1. MENÚ PRINCIPAL */}
      {vista === 'menu' && (
        <section className="game">
          <div className="panel center">
            <span className="lb-luna chica">
              <Icon name="dice" size={42} strokeWidth={1.6} />
            </span>
            <h1 className="title">Conecta 4</h1>
            <p className="hint">
              Encuentra los 4 grupos de 4 elementos que comparten una conexión secreta. El anfitrión crea la sala y comparte el código.
            </p>

            {errorMsg && <p className="error" style={{ margin: '0.8rem 0' }}>{errorMsg}</p>}

            <div className="lb-menu">
              <button className="big full" onClick={() => { setVista('crear'); setErrorMsg(''); }}>
                <Icon name="crown" size={22} /> Crear partida
              </button>
              <button className="big full" onClick={() => { setVista('unirse'); setErrorMsg(''); }}>
                <Icon name="users" size={22} /> Unirse a partida
              </button>
              <button className="secondary full" onClick={onLocal}>
                <Icon name="home" size={20} /> Jugar en un solo dispositivo
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 2. CREAR SALA */}
      {vista === 'crear' && (
        <section className="game">
          <div className="panel center">
            <span className="lb-luna chica">
              <Icon name="crown" size={40} strokeWidth={1.6} />
            </span>
            <h2 className="title">Crear partida</h2>
            <p className="hint">Introduce tu nombre para crear la sala y ser el anfitrión.</p>

            <div className="lb-form" style={{ marginTop: '1.2rem', textAlign: 'left' }}>
              <label className="field-label" htmlFor="cc-host-nombre">Tu nombre</label>
              <input
                id="cc-host-nombre"
                type="text"
                placeholder="Tu nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                maxLength={20}
                autoFocus
              />
              {errorMsg && <p className="error">{errorMsg}</p>}

              <button
                className="big full"
                style={{ marginTop: '1rem' }}
                disabled={cargando || !nombre.trim()}
                onClick={handleCrear}
              >
                <Icon name="check" size={22} strokeWidth={2.5} /> Crear sala
              </button>
              <button
                className="secondary full"
                style={{ marginTop: '0.6rem' }}
                onClick={() => { setVista('menu'); setErrorMsg(''); }}
              >
                Volver
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 3. UNIRSE A SALA */}
      {vista === 'unirse' && (
        <section className="game">
          <div className="panel center">
            <span className="lb-luna chica">
              <Icon name="users" size={40} strokeWidth={1.6} />
            </span>
            <h2 className="title">Unirse a partida</h2>
            <p className="hint">Introduce el código de 4 letras que te ha dado el anfitrión.</p>

            <div className="lb-form" style={{ marginTop: '1.2rem', textAlign: 'left' }}>
              <label className="field-label" htmlFor="cc-code-input">Código de la sala</label>
              <input
                id="cc-code-input"
                className="lb-input-codigo"
                type="text"
                placeholder="ABCD"
                value={codigoInput}
                onChange={(e) => setCodigoInput(e.target.value.toUpperCase())}
                maxLength={4}
                style={{ textTransform: 'uppercase', letterSpacing: '4px', textAlign: 'center', fontWeight: '800' }}
                autoFocus
              />

              <label className="field-label" htmlFor="cc-guest-nombre" style={{ marginTop: '1rem' }}>Tu nombre</label>
              <input
                id="cc-guest-nombre"
                type="text"
                placeholder="Tu nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                maxLength={20}
              />
              {errorMsg && <p className="error">{errorMsg}</p>}

              <button
                className="big full"
                style={{ marginTop: '1rem' }}
                disabled={cargando || !nombre.trim() || codigoInput.trim().length < 4}
                onClick={handleUnirse}
              >
                <Icon name="check" size={22} strokeWidth={2.5} /> Entrar en la partida
              </button>
              <button
                className="secondary full"
                style={{ marginTop: '0.6rem' }}
                onClick={() => { setVista('menu'); setErrorMsg(''); }}
              >
                Volver
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 4. SALA: LOBBY */}
      {vista === 'sala' && sala && sala.estado === 'lobby' && (
        <section className="game">
          <div className="panel center">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.8rem' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.35rem 1.1rem',
                  borderRadius: '9999px',
                  border: '1.5px solid #22c55e',
                  backgroundColor: '#f0fdf4',
                  color: '#16a34a',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  lineHeight: 1
                }}
              >
                <Icon name="lock" size={15} />
                Sala de espera
              </span>
            </div>
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
                className="big full"
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

          <div className="actions" style={{ marginTop: '1rem' }}>
            <button className="secondary danger full" onClick={() => setModalSalir(true)}>
              <Icon name="door" size={20} /> Salir de la sala
            </button>
          </div>
        </section>
      )}

      {/* 5. SALA: SELECTOR DE CATEGORÍA */}
      {vista === 'sala' && sala && sala.estado === 'categoria' && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="flagFinish" size={18} />Ronda {sala.rondaActual}</span>
            <span className="chip alt"><Icon name="target" size={18} />Selector de categoría</span>
          </div>

          {esAdmin ? (
            <>
              <h3 className="section-title" style={{ textAlign: 'center', marginBottom: '1rem' }}>
                Elige la categoría para el tablero:
              </h3>
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

          <div className="actions" style={{ marginTop: '1.2rem' }}>
            <button className="secondary danger full" onClick={() => setModalSalir(true)}>
              <Icon name="door" size={20} /> Salir de la sala
            </button>
          </div>
        </section>
      )}

      {/* 6. SALA: JUGANDO ONLINE */}
      {vista === 'sala' && sala && sala.estado === 'juego' && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="flagFinish" size={18} />Ronda {sala.rondaActual}</span>
            <span className="chip alt">{sala.conexionesResueltas.length} de 4 conexiones</span>
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
            <div className="panel conecta-tablero-panel">
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

              {mensajeFeedback && (
                <div className="conecta-feedback-banner">{mensajeFeedback}</div>
              )}
            </div>
          )}

          <div className="interactive-controls" style={{ marginTop: '0.8rem' }}>
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
                      ? 'ESPERANDO A LOS DEMÁS JUGADORES...'
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

                  {/* Temporizador de 30 segundos */}
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
                  <strong>¡{sala.jugadorPulsado.nombre} ha pulsado el botón!</strong>
                </div>
                <p className="hint small" style={{ margin: '0.4rem 0 0.4rem' }}>
                  Está seleccionando las 4 casillas en su pantalla...
                </p>

                {/* Temporizador de 30 segundos visible para los rivales */}
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
            <div className="actions" style={{ marginTop: '1.2rem' }}>
              <button className="secondary danger full" onClick={handleRendirse}>
                <Icon name="flagFinish" size={20} /> Rendirse y ver soluciones (Anfitrión)
              </button>
            </div>
          )}

          <div className="actions" style={{ marginTop: '1rem' }}>
            <button className="secondary danger full" onClick={() => setModalSalir(true)}>
              <Icon name="door" size={20} /> Salir de la sala
            </button>
          </div>
        </section>
      )}

      {/* 7. SALA: ADIVINAR LA CONEXIÓN */}
      {vista === 'sala' && sala && sala.estado === 'resolucion_grupo' && sala.grupoParaTema && (
        <section className="game">
          <div className="starter">
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
              <div className="panel center" style={{ padding: '2rem 1rem' }}>
                <h3>{sala.grupoParaTema.resueltoPor} está adivinando la conexión...</h3>
                <p className="hint">Tiene la oportunidad de sumar +1 punto extra.</p>
              </div>
            )
          ) : (
            <div className="panel aprox-pregunta-card" style={{ padding: '1.8rem 1.4rem' }}>
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
                  className="big full"
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

          <div className="actions" style={{ marginTop: '1rem' }}>
            <button className="secondary danger full" onClick={() => setModalSalir(true)}>
              <Icon name="door" size={20} /> Salir de la sala
            </button>
          </div>
        </section>
      )}

      {/* 8. SALA: 4ª Y ÚLTIMA CONEXIÓN ONLINE */}
      {vista === 'sala' && sala && sala.estado === 'ultima_conexion' && sala.ultimoGrupoPendiente && (
        <section className="game">
          <div className="starter">
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
            <div className="panel aprox-pregunta-card" style={{ padding: '1.6rem 1.4rem', marginBottom: '1rem' }}>
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

              {esAdmin && (
                <button
                  type="button"
                  className="big full"
                  style={{ marginTop: '1.2rem' }}
                  onClick={handleContinuarTrasTema}
                >
                  Ver soluciones completas
                </button>
              )}
            </div>
          )}

          {!sala.feedbackTema && (
            <div className="interactive-controls" style={{ margin: '1rem 0' }}>
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

                  {/* Temporizador de 30 segundos */}
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
                    <strong>¡{sala.jugadorPulsado.nombre} ha pulsado el botón!</strong>
                  </div>
                  <p className="hint small" style={{ margin: '0.4rem 0 0.4rem' }}>
                    Está respondiendo en su pantalla...
                  </p>

                  {/* Temporizador de 30 segundos visible para los rivales */}
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

          {esAdmin && (
            <div className="actions" style={{ marginTop: '1rem' }}>
              <button className="secondary danger full" onClick={handleRendirse}>
                <Icon name="flagFinish" size={20} /> Nadie la sabe / Ver soluciones (Anfitrión)
              </button>
            </div>
          )}

          <div className="actions" style={{ marginTop: '1rem' }}>
            <button className="secondary danger full" onClick={() => setModalSalir(true)}>
              <Icon name="door" size={20} /> Salir de la sala
            </button>
          </div>
        </section>
      )}

      {/* 9. SALA: RONDA FIN */}
      {vista === 'sala' && sala && sala.estado === 'ronda_fin' && (
        <section className="game">
          <div className="end-card aprox-resolucion-card">
            <span className="end-icon"><Icon name="trophy" size={44} /></span>
            <p className="categoria">Ronda {sala.rondaActual} finalizada</p>
            <h1 className="title">Soluciones del Tablero</h1>

            <div className="conecta-resueltos-lista" style={{ margin: '1rem 0' }}>
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
          </div>

          <div className="actions" style={{ marginTop: '1.2rem' }}>
            {esAdmin ? (
              <>
                <button className="big full" onClick={handleSiguienteRonda}>
                  <Icon name="play" size={20} /> Siguiente ronda ({sala.rondaActual + 1})
                </button>
                <button className="secondary danger full" onClick={handleFinalizarPartida}>
                  <Icon name="flagFinish" size={20} /> Finalizar partida 🏆
                </button>
              </>
            ) : (
              <p className="hint center">Esperando a que el anfitrión avance a la siguiente ronda...</p>
            )}

            <button className="secondary danger full" onClick={() => setModalSalir(true)}>
              <Icon name="door" size={20} /> Salir de la sala
            </button>
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
              <button className="big full" onClick={handleReiniciarPartida}>
                <Icon name="refresh" size={20} /> Otra Partida (mismos jugadores)
              </button>
            )}
            <button className="secondary danger full" onClick={() => setModalSalir(true)}>
              <Icon name="door" size={20} /> Salir al menú principal
            </button>
          </div>
        </section>
      )}

      {/* MODAL DE CONFIRMACIÓN PARA SALIR */}
      {modalSalir && (
        <div className="rg-modal-fondo" onClick={() => setModalSalir(false)}>
          <div 
            className="rg-modal" 
            onClick={(e) => e.stopPropagation()} 
            style={{ maxWidth: '420px', textAlign: 'center', padding: '1.8rem 1.4rem' }}
          >
            <div style={{ fontSize: '2.4rem', marginBottom: '0.4rem' }}>🚪</div>
            <h3 style={{ margin: '0 0 0.6rem', color: '#1e1b4b', fontSize: '1.3rem' }}>
              ¿Abandonar la partida?
            </h3>
            <p className="hint" style={{ fontSize: '0.95rem', marginBottom: '1.4rem', lineHeight: '1.4' }}>
              Si sales de la sala perderás tu progreso actual en la partida. ¿Estás seguro de que deseas salir?
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <button 
                type="button" 
                className="secondary full" 
                onClick={() => setModalSalir(false)}
              >
                No, quedarme
              </button>
              <button 
                type="button" 
                className="secondary danger full" 
                style={{ background: '#ef4444', color: '#ffffff', borderColor: '#dc2626' }}
                onClick={() => {
                  setModalSalir(false);
                  handleSalir();
                }}
              >
                Sí, salir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}