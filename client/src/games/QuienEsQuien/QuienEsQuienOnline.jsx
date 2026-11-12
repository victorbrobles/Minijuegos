// client/src/games/QuienEsQuien/QuienEsQuienOnline.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin, adminHeaders } from '../../lib/admin.js';
import Icon from '../../components/Icon.jsx';
import './QuienEsQuien.css';
import { PantallaTablero, EnlaceSecundario, SelectorCategorias, colorJugador } from './TableroPartida.jsx';
import { ChipJugadores } from '../../components/MenuJuego.jsx';

const CLAVE_SESION_QQ = 'qq_online_session';

export default function QuienEsQuienOnline({
  tituloJuego = '¿Sabes quién soy?',
  descripcionJuego,
  onLocal,
  onSalir,
  onAbrirAyuda
}) {
  const esAdminGlobal = useAdmin();
  const navigate = useNavigate();

  // 'menu' | 'online_menu' | 'crear' | 'unirse' | 'sala'
  const [vista, setVista] = useState('menu');
  const [eligiendoCategoria, setEligiendoCategoria] = useState(false);

  const [nombre, setNombre] = useState('');
  const [codigoInput, setCodigoInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);

  // Modales de confirmación
  const [modalSalir, setModalSalir] = useState(false);
  const [modalSalirPortada, setModalSalirPortada] = useState(false);
  const [modalOtraRonda, setModalOtraRonda] = useState(false);

  // Estados categoría personalizada
  const [mostrarModalCustom, setMostrarModalCustom] = useState(false);
  const [customNombre, setCustomNombre] = useState('');
  const [customDatos, setCustomDatos] = useState('');
  const [errorCustom, setErrorCustom] = useState('');

  const [sesion, setSesion] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(CLAVE_SESION_QQ));
    } catch {
      return null;
    }
  });

  const [sala, setSala] = useState(null);
  const [codigoCopiado, setCodigoCopiado] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [cubiertaLevantada, setCubiertaLevantada] = useState(false);

  const intervalRef = useRef(null);

  useEffect(() => {
    fetch('/api/quienesquien/categorias')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setCategorias(d.categorias);
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (!sesion) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setSala(null);
      return;
    }

    const consultarEstado = () => {
      fetch(`/api/quienesquien/sala/${sesion.code}?token=${sesion.token}`)
        .then((r) => {
          if (!r.ok) throw new Error('Sala no disponible');
          return r.json();
        })
        .then((d) => {
          if (d.success) {
            setSala(d);
            setVista('sala');
            if (d.estado === 'jugando') {
              setEligiendoCategoria(false);
            }
          }
        })
        .catch((err) => {
          console.warn('Error en conexión con la sala:', err);
        });
    };

    consultarEstado();
    intervalRef.current = setInterval(consultarEstado, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sesion]);

  // Redirección segura a la portada
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

  // Cierra la sala en el servidor, limpia la sesión y sale a la portada inmediatamente
  const handleCerrarSalaYSalirAPortada = () => {
    // 1. Detener inmediatamente el intervalo para evitar actualizaciones residuales
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const sesionActual = sesion;
    sessionStorage.removeItem(CLAVE_SESION_QQ);
    setSesion(null);
    setSala(null);
    setModalSalirPortada(false);
    setModalSalir(false);

    // 2. Avisar al servidor en segundo plano
    if (sesionActual?.code && sesionActual?.token) {
      try {
        fetch(`/api/quienesquien/sala/${sesionActual.code}/salir`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: sesionActual.token }),
          keepalive: true
        }).catch(() => {});
      } catch {
        /* ignorar */
      }
    }

    // 3. Salir a la portada sin esperas
    redirigirAPortada();
  };

  const handleCrear = async () => {
    if (!nombre.trim()) return;
    setErrorMsg('');
    setCargando(true);
    try {
      const res = await fetch('/api/quienesquien/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear la sala.');

      const nuevaSesion = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_QQ, JSON.stringify(nuevaSesion));
      setEligiendoCategoria(false);
      setSesion(nuevaSesion);
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
      const res = await fetch('/api/quienesquien/unirse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codigoInput.trim().toUpperCase(), nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al unirse.');

      const nuevaSesion = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_QQ, JSON.stringify(nuevaSesion));
      setEligiendoCategoria(false);
      setSesion(nuevaSesion);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setCargando(false);
    }
  };

  // Devuelve null si todo va bien o el mensaje de error
  const enviarInicioPartida = async (categoriaId, customParams = null) => {
    if (!categoriaId || !sesion) return null;
    setErrorMsg('');
    setCargando(true);
    try {
      const payload = { token: sesion.token, categoriaId };
      if (customParams) {
        // Se envía el texto tal cual: el servidor lo valida y baraja (nunca se evalúa como código)
        payload.customName = customParams.nombre;
        payload.customData = customParams.datos;
      }

      const res = await fetch(`/api/quienesquien/sala/${sesion.code}/iniciar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...adminHeaders() },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo iniciar.');

      setSala(data);
      setEligiendoCategoria(false);
      setCubiertaLevantada(false);
      return null;
    } catch (err) {
      if (!customParams) setErrorMsg(err.message);
      return err.message;
    } finally {
      setCargando(false);
    }
  };

  const handleSeleccionarCat = (cat) => {
    if (cat.id === 'custom') {
      setCustomNombre('');
      setCustomDatos('');
      setErrorCustom('');
      setMostrarModalCustom(true);
    } else {
      enviarInicioPartida(cat.id);
    }
  };

  const iniciarPartidaCustom = async () => {
    setErrorCustom('');
    if (!customNombre.trim()) {
      setErrorCustom('Debes introducir un nombre para la categoría.');
      return;
    }
    if (!customDatos.trim()) {
      setErrorCustom("Introduce los datos con el formato: ['Dato 1', 'Dato 2']");
      return;
    }

    const error = await enviarInicioPartida('custom', { nombre: customNombre.trim(), datos: customDatos });
    if (error) {
      setErrorCustom(error);
    } else {
      setMostrarModalCustom(false);
    }
  };

  const handleReiniciarPartida = async (irACategorias = false) => {
    if (!sesion) return;
    try {
      await fetch(`/api/quienesquien/sala/${sesion.code}/reiniciar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...adminHeaders() },
        body: JSON.stringify({ token: sesion.token })
      });
      setCubiertaLevantada(false);
      setEligiendoCategoria(irACategorias);
      setSala((prev) => (prev ? { ...prev, estado: 'lobby', categoria: null } : prev));
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

  const rivales = (sala?.jugadores || []).filter((j) => !j.esTu && j.tarjeta);

  const categoriasAMostrar =
    esAdminGlobal && sala?.esAdmin
      ? [...categorias, { id: 'custom', nombre: 'Personalizada 🛠️', icono: 'edit' }]
      : categorias;

  const enPartidaActiva = vista === 'sala' && sala && sala.estado === 'jugando';

  return (
    <div className={`qq-contenedor ${enPartidaActiva ? 'qq-en-partida' : ''}`}>
      {/* 1. MENÚ INICIAL */}
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
              <Icon name="whois" size={44} strokeWidth={1.7} />
            </div>
            <h1 className="title qq-main-title">{tituloJuego}</h1>
            <ChipJugadores juegoId="quien-es-quien" />
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
              <button
                type="button"
                className="qq-link-volver"
                onClick={() => {
                  setVista('menu');
                  setErrorMsg('');
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                <span>Volver</span>
              </button>
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
              <button
                type="button"
                className="qq-link-volver"
                onClick={() => {
                  setVista('online_menu');
                  setErrorMsg('');
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                <span>Volver</span>
              </button>
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
              <label className="field-label" htmlFor="qq-host-nombre">Tu nombre</label>
              <input
                id="qq-host-nombre"
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
              <button
                type="button"
                className="qq-link-volver"
                onClick={() => {
                  setVista('online_menu');
                  setErrorMsg('');
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                <span>Volver</span>
              </button>
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
              <label className="field-label" htmlFor="qq-code-input">Código de la partida</label>
              <input
                id="qq-code-input"
                className="lb-input-codigo qq-input-moderno"
                type="text"
                placeholder="ABCD"
                value={codigoInput}
                onChange={(e) => setCodigoInput(e.target.value.toUpperCase())}
                maxLength={4}
                autoFocus
              />

              <label className="field-label" htmlFor="qq-guest-nombre" style={{ marginTop: '1rem' }}>
                Tu nombre
              </label>
              <input
                id="qq-guest-nombre"
                className="qq-input-moderno"
                type="text"
                placeholder="Tu nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                maxLength={20}
              />
              {errorMsg && <p className="error">{errorMsg}</p>}

              <button
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

      {/* 4A. SALA DE ESPERA (LOBBY) */}
      {vista === 'sala' && sala && sala.estado === 'lobby' && !eligiendoCategoria && (
        <section className="game">
          <div className="panel center qq-menu-panel">
            <div className="qq-card-top">
              <button
                type="button"
                className="qq-link-volver"
                onClick={() => setModalSalir(true)}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                <span>Volver</span>
              </button>
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
                <div key={j.id} className={`lb-jug ${j.esTu ? 'yo' : ''}`}>
                  <span className="lb-jug-nombre">
                    {j.nombre}{j.esTu ? ' (tú)' : ''}{j.id === 1 ? ' 👑' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {sala.esAdmin ? (
            <button
              type="button"
              className="big full qq-btn-principal"
              style={{ marginTop: '1rem' }}
              onClick={() => {
                setErrorMsg('');
                setEligiendoCategoria(true);
              }}
            >
              <Icon name="play" size={22} /> Iniciar juego
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

      {/* 4B. SELECTOR DE CATEGORÍAS ONLINE (SOLO ADMIN) */}
      {vista === 'sala' && sala && sala.estado === 'lobby' && eligiendoCategoria && (
        <SelectorCategorias
          categorias={categoriasAMostrar}
          onElegir={handleSeleccionarCat}
          onVolver={() => setEligiendoCategoria(false)}
          onAyuda={onAbrirAyuda}
          aviso="Al tocar una categoría se reparten los personajes y empieza la partida en todos los móviles."
          cargando={cargando && !mostrarModalCustom}
          error={errorMsg}
        />
      )}

      {/* 5. JUGANDO ONLINE */}
      {enPartidaActiva && (
        <PantallaTablero
          etiqueta="Tu identidad es secreta"
          titulo={sala.jugadores.find((j) => j.esTu)?.nombre || 'Tu turno'}
          colorTitulo={colorJugador((sala.jugadores.find((j) => j.esTu)?.id ?? 1) - 1)}
          rivales={rivales}
          categoria={sala.categoria}
          onSalir={() => setModalSalirPortada(true)}
          chips={<span className="qqp-chip"><Icon name="users" size={14} /> <span>{sala.jugadores.length}</span></span>}
          vacio="Esperando a que los demás tengan asignado su personaje..."
          pie={sala.esAdmin ? (
            <EnlaceSecundario onClick={() => setModalOtraRonda(true)}>
              <Icon name="refresh" size={16} /> Otra ronda (cambiar categoría)
            </EnlaceSecundario>
          ) : null}
        />
      )}

      {/* MODAL: SALIR DE LA SALA DE ESPERA (LOBBY) */}
      {modalSalir && (
        <div className="rg-modal-fondo" onClick={() => setModalSalir(false)}>
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
              Saldrás de la sala y volverás a la portada principal. ¿Estás seguro?
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
                onClick={handleCerrarSalaYSalirAPortada}
              >
                Sí, salir de la sala
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SALIR DE LA PARTIDA ACTIVA A PORTADA */}
      {modalSalirPortada && (
        <div className="rg-modal-fondo" onClick={() => setModalSalirPortada(false)}>
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
              {sala?.esAdmin
                ? 'Se cerrará la partida para todos y saldrás a la portada. ¿Estás seguro?'
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

      {/* MODAL: JUGAR OTRA RONDA */}
      {modalOtraRonda && (
        <div className="rg-modal-fondo" onClick={() => setModalOtraRonda(false)}>
          <div
            className="rg-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '420px', textAlign: 'center', padding: '1.8rem 1.4rem' }}
          >
            <div style={{ fontSize: '2.4rem', marginBottom: '0.4rem' }}>🔄</div>
            <h3 style={{ margin: '0 0 0.6rem', color: '#1e1b4b', fontSize: '1.3rem' }}>
              ¿Jugar otra ronda?
            </h3>
            <p className="hint" style={{ fontSize: '0.95rem', marginBottom: '1.4rem', lineHeight: '1.4' }}>
              Se terminará la ronda actual y pasarás a elegir una nueva categoría para todos. ¿Estás seguro?
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <button
                type="button"
                className="secondary full"
                onClick={() => setModalOtraRonda(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="big full"
                style={{ marginTop: 0 }}
                onClick={() => {
                  setModalOtraRonda(false);
                  handleReiniciarPartida(true);
                }}
              >
                Sí, cambiar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CATEGORÍA PERSONALIZADA */}
      {mostrarModalCustom && (
        <div className="rg-modal-fondo" onClick={() => setMostrarModalCustom(false)}>
          <div
            className="rg-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '420px', textAlign: 'center', padding: '1.8rem 1.4rem' }}
          >
            <h3 style={{ margin: '0 0 1rem', color: '#1e1b4b', fontSize: '1.4rem' }}>
              Categoría Personalizada 🛠️
            </h3>

            <div style={{ textAlign: 'left', marginBottom: '1.2rem' }}>
              <label className="field-label">Nombre de la categoría</label>
              <input
                type="text"
                value={customNombre}
                onChange={(e) => setCustomNombre(e.target.value)}
                placeholder="Ej: Personajes de la oficina"
                style={{ width: '100%', marginBottom: '1rem', padding: '0.8rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
              />

              <label className="field-label">Datos (Formato Array)</label>
              <textarea
                style={{ width: '100%', height: '100px', resize: 'none', padding: '0.8rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
                value={customDatos}
                onChange={(e) => setCustomDatos(e.target.value)}
                placeholder="['Dato 1', 'Dato 2', 'Dato 3', ...]"
              />
            </div>

            {errorCustom && <p className="error" style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>{errorCustom}</p>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <button
                type="button"
                className="secondary full"
                onClick={() => setMostrarModalCustom(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="big full"
                disabled={cargando}
                onClick={iniciarPartidaCustom}
              >
                {cargando ? 'Repartiendo…' : 'Jugar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}