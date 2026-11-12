// client/src/games/Aproximacion/AproximacionOnline.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import './Aproximacion.css';
import {
  Aviso,
  Cabecera,
  Avatar,
  OrdenTurnos,
  BotonPrincipal,
  EnlaceSecundario,
  colorJugador,
  indiceColor
} from './AproximacionLocal.jsx';
import { limitesOnline, textoSala } from '../limites.js';
import { ChipJugadores } from '../../components/MenuJuego.jsx';
import { SelectorRondas } from '../../components/MenuJuego.jsx';
import { rondasPorDefecto } from '../rondas.js';

const LIM_ON = limitesOnline('aproximacion');

const CLAVE_SESION_APROX = 'aprox_online_session';
const TIEMPO_TURNO = 30;

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

export default function AproximacionOnline({
  tituloJuego = 'Aproximación',
  descripcionJuego,
  onLocal,
  onSalir,
  onAbrirAyuda
}) {
  const [rondasSel, setRondasSel] = useState(rondasPorDefecto('aproximacion'));
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
      return JSON.parse(sessionStorage.getItem(CLAVE_SESION_APROX));
    } catch {
      return null;
    }
  });

  const [sala, setSala] = useState(null);
  const [codigoCopiado, setCodigoCopiado] = useState(false);

  const [inputNumero, setInputNumero] = useState('');
  const [confianzaElegida, setConfianzaElegida] = useState(null);
  const [inputRealManual, setInputRealManual] = useState('');
  const [errorTurno, setErrorTurno] = useState('');
  const [tiempoRestante, setTiempoRestante] = useState(TIEMPO_TURNO);

  const [eventoAviso, setEventoAviso] = useState(null);
  const avisoSeqRef = useRef(0);
  const numDecisionesPrevRef = useRef(0);

  const intervalRef = useRef(null);
  const timerTurnoRef = useRef(null);

  const inputNumeroRef = useRef(inputNumero);
  const confianzaElegidaRef = useRef(confianzaElegida);

  useEffect(() => {
    inputNumeroRef.current = inputNumero;
    confianzaElegidaRef.current = confianzaElegida;
  }, [inputNumero, confianzaElegida]);

  useEffect(() => {
    if (!sesion) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setSala(null);
      return;
    }

    const consultarEstado = () => {
      fetch(`/api/aproximacion/online/sala/${sesion.code}?token=${sesion.token}`)
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
          sessionStorage.removeItem(CLAVE_SESION_APROX);
          setSesion(null);
          setSala(null);
          setVista('online_menu');
          setErrorMsg('La sala se ha cerrado o se ha perdido la conexión.');
        });
    };

    consultarEstado();
    intervalRef.current = setInterval(consultarEstado, 700);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sesion]);

  const ronda = sala?.ronda;
  const esAdmin = sala?.esAdmin;
  const yoId = sala?.yoId;
  const infoTurno = ronda?.infoTurno;
  const esMiTurno = infoTurno?.jugadorId === yoId;
  const esPrimerJugador = ronda?.primerJugadorId === yoId;

  const respuestasDadas = ronda?.decisiones
    ? Object.entries(ronda.decisiones)
        .filter(([, d]) => d.tipo === 'propia')
        .map(([jId, d]) => ({
          jugadorId: Number(jId),
          jugadorNombre: sala.jugadores.find((j) => j.id === Number(jId))?.nombre,
          valor: d.valor
        }))
    : [];

  // Avisos flotantes cuando alguien toma una decisión
  useEffect(() => {
    const decs = ronda?.decisiones ? Object.entries(ronda.decisiones) : [];
    if (decs.length === 0) {
      numDecisionesPrevRef.current = 0;
      return;
    }
    if (decs.length > numDecisionesPrevRef.current) {
      const [ultimoId, ultimaDec] = decs[decs.length - 1];
      const autor = sala?.jugadores?.find((j) => j.id === Number(ultimoId))?.nombre || 'Jugador';
      avisoSeqRef.current += 1;
      if (ultimaDec.tipo === 'confia') {
        const refNom = sala?.jugadores?.find((j) => j.id === Number(ultimaDec.confiaEnId))?.nombre || 'un compañero';
        setEventoAviso({
          n: avisoSeqRef.current,
          tipo: 'confia',
          texto: `${autor} confía en el ${ultimaDec.valor} de ${refNom}.`
        });
      } else {
        setEventoAviso({
          n: avisoSeqRef.current,
          tipo: 'ok',
          texto: `${autor} apuesta por el número ${ultimaDec.valor}.`
        });
      }
    }
    numDecisionesPrevRef.current = decs.length;
  }, [ronda?.decisiones, sala?.jugadores]);

  useEffect(() => {
    if (!ronda || (ronda.faseRonda !== 'turno' && ronda.faseRonda !== 'segunda_vuelta')) {
      if (timerTurnoRef.current) clearInterval(timerTurnoRef.current);
      return;
    }

    setTiempoRestante(TIEMPO_TURNO);

    if (timerTurnoRef.current) clearInterval(timerTurnoRef.current);
    timerTurnoRef.current = setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev <= 1) {
          clearInterval(timerTurnoRef.current);
          if (esMiTurno || (ronda.faseRonda === 'segunda_vuelta' && esPrimerJugador)) {
            forzarEnvioTurnoOnline();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerTurnoRef.current) clearInterval(timerTurnoRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [infoTurno?.subTurnoIndex, ronda?.faseRonda, esMiTurno, esPrimerJugador]);

  const forzarEnvioTurnoOnline = async () => {
    let payload = {};

    if (ronda.faseRonda === 'turno') {
      if (confianzaElegidaRef.current !== null) {
        const respRef = respuestasDadas.find((r) => r.jugadorId === confianzaElegidaRef.current);
        if (respRef) {
          payload = { tipo: 'confia', valor: respRef.valor, confiaEnId: respRef.jugadorId };
        }
      }

      if (!payload.tipo) {
        let numVal = 0;
        if (inputNumeroRef.current !== '' && !isNaN(Number(inputNumeroRef.current))) {
          numVal = Math.round(Number(inputNumeroRef.current));
        }

        let valorFinal = numVal;
        while (respuestasDadas.some((r) => r.valor === valorFinal)) {
          valorFinal++;
        }
        payload = { tipo: 'propia', valor: valorFinal };
      }

      try {
        await fetch(`/api/aproximacion/online/sala/${sesion.code}/responder`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: sesion.token, ...payload })
        });
        setInputNumero('');
        setConfianzaElegida(null);
      } catch (err) {
        console.error(err);
      }
    } else if (ronda.faseRonda === 'segunda_vuelta') {
      handleSegundaVuelta(null);
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
    sessionStorage.removeItem(CLAVE_SESION_APROX);
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
    sessionStorage.removeItem(CLAVE_SESION_APROX);
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
      const res = await fetch('/api/aproximacion/online/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_APROX, JSON.stringify(nueva));
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
      const res = await fetch('/api/aproximacion/online/unirse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codigoInput.trim().toUpperCase(), nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_APROX, JSON.stringify(nueva));
      setSesion(nueva);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleIniciarJuego = async () => {
    try {
      const res = await fetch(`/api/aproximacion/online/sala/${sesion.code}/iniciar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token, rondas: rondasSel })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleConfirmarRespuesta = async (e) => {
    if (e) e.preventDefault();
    setErrorTurno('');

    let payload = {};
    if (confianzaElegida !== null) {
      const respRef = respuestasDadas.find((r) => r.jugadorId === confianzaElegida);
      if (!respRef) {
        setErrorTurno('Selección de confianza inválida.');
        return;
      }
      payload = { tipo: 'confia', valor: respRef.valor, confiaEnId: respRef.jugadorId };
    } else {
      if (inputNumero === '' || isNaN(Number(inputNumero))) {
        setErrorTurno('Introduce un número válido.');
        return;
      }
      payload = { tipo: 'propia', valor: Math.round(Number(inputNumero)) };
    }

    try {
      const res = await fetch(`/api/aproximacion/online/sala/${sesion.code}/responder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token, ...payload })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setInputNumero('');
      setConfianzaElegida(null);
    } catch (err) {
      setErrorTurno(err.message);
    }
  };

  const handleSegundaVuelta = async (cambiarAId = null) => {
    try {
      await fetch(`/api/aproximacion/online/sala/${sesion.code}/segunda-vuelta`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token, cambiarAId })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleEnviarManual = async (e) => {
    e.preventDefault();
    if (inputRealManual === '' || isNaN(Number(inputRealManual))) {
      setErrorTurno('Introduce una cifra numérica.');
      return;
    }

    try {
      const res = await fetch(`/api/aproximacion/online/sala/${sesion.code}/introducir-real`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token, valorReal: inputRealManual })
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setInputRealManual('');
    } catch (err) {
      setErrorTurno(err.message);
    }
  };

  const handleSiguienteRonda = async () => {
    try {
      await fetch(`/api/aproximacion/online/sala/${sesion.code}/siguiente-ronda`, {
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
      await fetch(`/api/aproximacion/online/sala/${sesion.code}/finalizar`, {
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

  const enPartidaActiva = vista === 'sala' && sala && sala.estado !== 'lobby';

  return (
    <div className={`aprox-contenedor ${enPartidaActiva ? 'qq-en-partida' : ''}`}>
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
              <Icon name="target" size={44} strokeWidth={1.7} />
            </div>
            <h1 className="title qq-main-title">{tituloJuego}</h1>
            <ChipJugadores juegoId="aproximacion" />
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
                  <span>Sé el anfitrión y genera un código para tu grupo ({textoSala('aproximacion')})</span>
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
              Introduce tu nombre para abrir la sala y ser el anfitrión ({textoSala('aproximacion')}).
            </p>

            <div className="lb-form qq-form-estilizado">
              <label className="field-label" htmlFor="aprox-host-nombre">Tu nombre</label>
              <input
                id="aprox-host-nombre"
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
              <label className="field-label" htmlFor="aprox-code-input">Código de la partida</label>
              <input
                id="aprox-code-input"
                className="lb-input-codigo qq-input-moderno"
                type="text"
                placeholder="ABCD"
                value={codigoInput}
                onChange={(e) => setCodigoInput(e.target.value.toUpperCase())}
                maxLength={4}
                autoFocus
              />

              <label className="field-label" htmlFor="aprox-guest-nombre" style={{ marginTop: '1rem' }}>
                Tu nombre
              </label>
              <input
                id="aprox-guest-nombre"
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
                <div key={j.id} className={`lb-jug ${j.id === yoId ? 'yo' : ''}`}>
                  <span className="lb-jug-nombre">
                    {j.nombre}{j.id === yoId ? ' (tú)' : ''}{j.id === 1 ? ' 👑' : ''}
                  </span>
                </div>
              ))}
            </div>
            {sala.jugadores.length < LIM_ON.min && (
              <p className="hint" style={{ marginTop: '0.8rem' }}>
                {LIM_ON.min - sala.jugadores.length === 1 ? 'Falta al menos 1 jugador' : `Faltan al menos ${LIM_ON.min - sala.jugadores.length} jugadores`} para poder empezar (mínimo {LIM_ON.min}).
              </p>
            )}
          </div>

          {errorMsg && <p className="error" style={{ margin: '0.8rem 0' }}>{errorMsg}</p>}

          {esAdmin && (
            <div className="panel qq-menu-panel" style={{ marginTop: '1rem' }}>
              <SelectorRondas juegoId="aproximacion" valor={rondasSel} onCambiar={setRondasSel} numJugadores={sala.jugadores.length} />
            </div>
          )}
          {esAdmin ? (
            <button
              type="button"
              className="big full qq-btn-principal"
              style={{ marginTop: '1rem' }}
              disabled={sala.jugadores.length < LIM_ON.min}
              onClick={handleIniciarJuego}
            >
              <Icon name="play" size={22} />
              {sala.jugadores.length < LIM_ON.min ? `Esperando jugadores (mínimo ${LIM_ON.min})...` : 'Iniciar juego'}
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

      {/* 5. JUGANDO: FASE TURNO ONLINE */}
      {vista === 'sala' && sala && sala.estado === 'jugando' && ronda && ronda.faseRonda === 'turno' && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            categoria={{
              nombre: ronda.pregunta.manual ? 'Sobre el grupo' : 'Pregunta numérica',
              icono: ronda.pregunta.manual ? 'users' : 'target'
            }}
            etiqueta={
              esMiTurno
                ? `Ronda ${sala.rondaNum} de ${sala.maxRondas} · ¡Es tu turno!`
                : `Ronda ${sala.rondaNum} de ${sala.maxRondas} · Turno ${(infoTurno?.subTurnoIndex ?? 0) + 1} de ${sala.jugadores.length}`
            }
            titulo={esMiTurno ? '¡Te toca elegir!' : `Turno de ${infoTurno?.jugadorNombre}`}
            avatar={
              <Avatar
                nombre={infoTurno?.jugadorNombre}
                color={colorJugador((infoTurno?.jugadorId ?? 1) - 1)}
              />
            }
          >
            <div className="qqp-identidad aprox-consigna-box">
              <div className="aprox-consigna-top">
                <span className="qqp-identidad-icono">
                  <Icon name="target" size={16} strokeWidth={2.4} />
                </span>
                <span className="aprox-consigna-texto">«{ronda.pregunta.pregunta}»</span>
              </div>

              <div className="aprox-hero-stats">
                <span className="aprox-hero-stat">
                  🔢 {respuestasDadas.length} {respuestasDadas.length === 1 ? 'cifra dicha' : 'cifras dichas'}
                </span>
                <span className={`aprox-hero-stat timer${tiempoRestante <= 10 ? ' low' : ''}`}>
                  <Icon name="clock" size={14} /> {tiempoRestante}s
                </span>
              </div>

              <div className="aprox-timer-track" role="timer">
                <div
                  className={`aprox-timer-fill${tiempoRestante <= 10 ? ' low' : ''}`}
                  style={{ width: `${(tiempoRestante / TIEMPO_TURNO) * 100}%` }}
                />
              </div>
            </div>

            <OrdenTurnos
              jugadores={sala.jugadores}
              activoId={infoTurno?.jugadorId}
            />
          </Cabecera>

          {esMiTurno ? (
            <>
              {!infoTurno?.esPrimerJugador && respuestasDadas.length > 0 && (
                <div className="qqp-tarjeta">
                  <p className="qqp-carta-cara-titulo" style={{ marginBottom: '0.35rem' }}>
                    <Icon name="eye" size={16} /> Cifras propuestas hasta ahora
                  </p>
                  <p className="aprox-sub-instruccion">
                    Toca una cifra para confiar en ella o escribe tu propio número debajo:
                  </p>

                  <div className="aprox-opciones-confianza">
                    {respuestasDadas.map((r) => {
                      const quienesConfian = Object.entries(ronda.decisiones)
                        .filter(([, d]) => d.tipo === 'confia' && d.confiaEnId === r.jugadorId)
                        .map(([id]) => sala.jugadores.find((j) => j.id === Number(id))?.nombre);

                      const seleccionada = confianzaElegida === r.jugadorId;

                      return (
                        <button
                          key={r.jugadorId}
                          type="button"
                          className={`aprox-btn-opcion-confianza ${seleccionada ? 'activa' : ''}`}
                          onClick={() => {
                            setConfianzaElegida(seleccionada ? null : r.jugadorId);
                            setInputNumero('');
                            setErrorTurno('');
                          }}
                        >
                          <div className="aprox-opcion-valor">{r.valor}</div>
                          <div className="aprox-opcion-autor">De <strong>{r.jugadorNombre}</strong></div>
                          {quienesConfian.length > 0 && (
                            <div className="aprox-opcion-apoyos">Confían: {quienesConfian.join(', ')}</div>
                          )}
                          <span className="aprox-tag-confiar">
                            {seleccionada ? '✓ Confiando' : 'Confiar'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <form onSubmit={handleConfirmarRespuesta} className="qqp-tarjeta aprox-form-card">
                <label className="qq-label-destacado" htmlFor="aprox-online-num">
                  {infoTurno?.esPrimerJugador
                    ? '¿Cuál es tu respuesta?'
                    : confianzaElegida !== null
                    ? `Confiarás en la cifra de ${sala.jugadores.find((j) => j.id === confianzaElegida)?.nombre}`
                    : 'O escribe tu propia cifra (sin repetir)'}
                </label>

                {confianzaElegida === null ? (
                  <input
                    id="aprox-online-num"
                    className="qq-input-moderno aprox-input-gigante"
                    type="number"
                    step="1"
                    autoFocus
                    placeholder="Ej. 150"
                    value={inputNumero}
                    onChange={(e) => {
                      setInputNumero(e.target.value);
                      setConfianzaElegida(null);
                      setErrorTurno('');
                    }}
                    required
                  />
                ) : (
                  <div className="aprox-confianza-resumen">
                    <span>Apostando por el número <strong>{respuestasDadas.find((r) => r.jugadorId === confianzaElegida)?.valor}</strong></span>
                    <button
                      type="button"
                      className="aprox-btn-cambiar-idea"
                      onClick={() => setConfianzaElegida(null)}
                    >
                      Escribir mi número
                    </button>
                  </div>
                )}

                {errorTurno && <p className="error" role="alert" style={{ marginTop: '0.6rem' }}>{errorTurno}</p>}

                <div style={{ marginTop: '1rem' }}>
                  <BotonPrincipal type="submit">
                    <Icon name="check" size={20} strokeWidth={2.5} />
                    {confianzaElegida !== null ? 'Confirmar confianza' : 'Confirmar mi número'}
                  </BotonPrincipal>
                </div>
              </form>
            </>
          ) : (
            <div className="qqp-tarjeta">
              <div className="qqp-pasar" style={{ paddingBottom: respuestasDadas.length > 0 ? '1rem' : 0 }}>
                <span className="lb-luna chica"><Icon name="hourglass" size={34} /></span>
                <p className="qqp-pasar-para">Decidiendo ahora</p>
                <h3 className="qqp-pasar-nombre" style={{ fontSize: '1.6rem' }}>{infoTurno?.jugadorNombre}</h3>
                <p className="qqp-texto">
                  Esperando a que <strong>{infoTurno?.jugadorNombre}</strong> escriba su cifra o elija en quién confiar…
                </p>
              </div>

              {respuestasDadas.length > 0 && (
                <div style={{ borderTop: '1.5px solid #e2e8f0', paddingTop: '1rem', marginTop: '0.5rem' }}>
                  <p className="qqp-carta-cara-titulo" style={{ marginBottom: '0.6rem' }}>
                    <Icon name="eye" size={16} /> Cifras ya colocadas
                  </p>
                  <div className="aprox-opciones-confianza">
                    {respuestasDadas.map((r) => {
                      const quienesConfian = Object.entries(ronda.decisiones)
                        .filter(([, d]) => d.tipo === 'confia' && d.confiaEnId === r.jugadorId)
                        .map(([id]) => sala.jugadores.find((j) => j.id === Number(id))?.nombre);

                      return (
                        <div key={r.jugadorId} className="aprox-btn-opcion-confianza solo-lectura">
                          <div className="aprox-opcion-valor">{r.valor}</div>
                          <div className="aprox-opcion-autor">De <strong>{r.jugadorNombre}</strong></div>
                          {quienesConfian.length > 0 && (
                            <div className="aprox-opcion-apoyos">Confían: {quienesConfian.join(', ')}</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* 6. JUGANDO: SEGUNDA VUELTA DEL PRIMER JUGADOR ONLINE */}
      {vista === 'sala' && sala && sala.estado === 'jugando' && ronda && ronda.faseRonda === 'segunda_vuelta' && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            categoria={{ nombre: 'Segunda oportunidad', icono: 'refresh' }}
            etiqueta={`Ronda ${sala.rondaNum} de ${sala.maxRondas} · Decisión final`}
            titulo={esPrimerJugador ? '¡Tu segunda oportunidad!' : `Decisión de ${ronda.primerJugadorNombre}`}
            avatar={
              <Avatar
                nombre={ronda.primerJugadorNombre}
                color={colorJugador((ronda.primerJugadorId ?? 1) - 1)}
              />
            }
          >
            <div className="qqp-identidad aprox-consigna-box">
              <div className="aprox-consigna-top">
                <span className="qqp-identidad-icono">
                  <Icon name="target" size={16} strokeWidth={2.4} />
                </span>
                <span className="aprox-consigna-texto">«{ronda.pregunta.pregunta}»</span>
              </div>

              <div className="aprox-hero-stats">
                <span className="aprox-hero-stat ok">
                  Cifra inicial de {ronda.primerJugadorNombre}: <strong>{ronda.decisiones[ronda.primerJugadorId]?.valor}</strong>
                </span>
                <span className={`aprox-hero-stat timer${tiempoRestante <= 10 ? ' low' : ''}`}>
                  <Icon name="clock" size={14} /> {tiempoRestante}s
                </span>
              </div>

              <div className="aprox-timer-track" role="timer">
                <div
                  className={`aprox-timer-fill${tiempoRestante <= 10 ? ' low' : ''}`}
                  style={{ width: `${(tiempoRestante / TIEMPO_TURNO) * 100}%` }}
                />
              </div>
            </div>
          </Cabecera>

          {esPrimerJugador ? (
            <>
              <div className="qqp-tarjeta">
                <p className="qqp-carta-cara-titulo" style={{ marginBottom: '0.35rem' }}>
                  <Icon name="refresh" size={16} /> ¿Cambias de opinión?
                </p>
                <p className="aprox-sub-instruccion">
                  Toca una cifra de tus compañeros si prefieres cambiar y confiar en ella:
                </p>

                <div className="aprox-opciones-confianza">
                  {respuestasDadas
                    .filter((r) => r.jugadorId !== yoId)
                    .map((r) => (
                      <button
                        key={r.jugadorId}
                        type="button"
                        className="aprox-btn-opcion-confianza"
                        onClick={() => handleSegundaVuelta(r.jugadorId)}
                      >
                        <div className="aprox-opcion-valor">{r.valor}</div>
                        <div className="aprox-opcion-autor">De <strong>{r.jugadorNombre}</strong></div>
                        <span className="aprox-tag-confiar">Cambiar y confiar</span>
                      </button>
                    ))}
                </div>
              </div>

              <div className="qqp-barra">
                <BotonPrincipal onClick={() => handleSegundaVuelta(null)}>
                  <Icon name="check" size={20} strokeWidth={2.5} /> Mantener mi cifra ({ronda.decisiones[yoId]?.valor})
                </BotonPrincipal>
              </div>
            </>
          ) : (
            <div className="qqp-tarjeta qqp-pasar">
              <span className="lb-luna chica"><Icon name="refresh" size={34} /></span>
              <p className="qqp-pasar-para">Última decisión</p>
              <h3 className="qqp-pasar-nombre" style={{ fontSize: '1.6rem' }}>{ronda.primerJugadorNombre}</h3>
              <p className="qqp-texto">
                Esperando a que <strong>{ronda.primerJugadorNombre}</strong> decida si mantiene su cifra ({ronda.decisiones[ronda.primerJugadorId]?.valor}) o confía en otro jugador…
              </p>
            </div>
          )}
        </section>
      )}

      {/* 7. INTRODUCIR CIFRA REAL MANUAL ONLINE */}
      {vista === 'sala' && sala && sala.estado === 'jugando' && ronda && ronda.faseRonda === 'introducir_real' && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            categoria={{ nombre: 'Sobre el grupo', icono: 'users' }}
            etiqueta={`Ronda ${sala.rondaNum} de ${sala.maxRondas} · Recuento común`}
            titulo="¡Momento del recuento!"
          >
            <div className="qqp-identidad">
              <span className="qqp-identidad-icono"><Icon name="users" size={16} /></span>
              <span>«{ronda.pregunta.pregunta}»</span>
            </div>
          </Cabecera>

          {esAdmin ? (
            <form onSubmit={handleEnviarManual} className="qqp-tarjeta aprox-form-card">
              <label className="qq-label-destacado" htmlFor="aprox-online-manual">
                Haced el recuento conjunto e introduce la cifra real obtenida
              </label>
              <input
                id="aprox-online-manual"
                className="qq-input-moderno aprox-input-gigante"
                type="number"
                step="1"
                autoFocus
                placeholder="Total real tras el recuento..."
                value={inputRealManual}
                onChange={(e) => {
                  setInputRealManual(e.target.value);
                  setErrorTurno('');
                }}
                required
              />
              {errorTurno && <p className="error" role="alert" style={{ marginTop: '0.6rem' }}>{errorTurno}</p>}

              <div style={{ marginTop: '1rem' }}>
                <BotonPrincipal type="submit">
                  <Icon name="trophy" size={20} /> Calcular resultados y puntos
                </BotonPrincipal>
              </div>
            </form>
          ) : (
            <div className="qqp-tarjeta qqp-pasar">
              <span className="lb-luna chica"><Icon name="users" size={34} /></span>
              <h3 className="qqp-pasar-nombre" style={{ fontSize: '1.5rem', marginTop: '0.4rem' }}>
                Recuento en curso
              </h3>
              <p className="qqp-texto">
                Esperando a que el anfitrión introduzca la cifra real consensuada tras el recuento…
              </p>
            </div>
          )}
        </section>
      )}

      {/* 8. RESULTADOS DE LA RONDA ONLINE */}
      {vista === 'sala' && sala && sala.estado === 'jugando' && ronda && ronda.faseRonda === 'resultados' && ronda.resultado && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            etiqueta={`Ronda ${sala.rondaNum} de ${sala.maxRondas} completada`}
            titulo={`Respuesta: ${ronda.resultado.objetivo}`}
          >
            <div className="qqp-identidad">
              <span className="qqp-identidad-icono"><Icon name="check" size={16} strokeWidth={2.5} /></span>
              <span>«{ronda.pregunta.pregunta}»</span>
            </div>
          </Cabecera>

          <div className="qqp-tarjeta">
            <p className="qqp-carta-cara-titulo" style={{ marginBottom: '0.8rem' }}>
              <Icon name="target" size={16} /> Desglose de aproximaciones
            </p>
            <div className="aprox-resolucion-lista">
              {ronda.resultado.listaUnicas.map((item) => {
                const esExacta = item.distancia === 0;
                const esMin = item.distancia === ronda.resultado.listaUnicas[0].distancia && !esExacta;
                const esMax =
                  item.distancia === ronda.resultado.listaUnicas[ronda.resultado.listaUnicas.length - 1].distancia &&
                  ronda.resultado.listaUnicas.length > 1 &&
                  !esExacta;

                const confiadosNombres = Object.entries(ronda.resultado.decsFinales)
                  .filter(([id, d]) => Number(id) !== item.autorId && d.valor === item.valor)
                  .map(([id]) => sala.jugadores.find((j) => j.id === Number(id))?.nombre);

                const autorNombre = sala.jugadores.find((j) => j.id === item.autorId)?.nombre;
                const deltaAutor = ronda.resultado.scoresRonda[item.autorId] ?? 0;

                return (
                  <div
                    key={item.valor}
                    className={`aprox-fila-resultado ${
                      esExacta ? 'exacta' : esMin ? 'cercana' : esMax ? 'lejana' : 'intermedia'
                    }`}
                  >
                    <div className="aprox-res-col-val">
                      <span className="aprox-res-num">{item.valor}</span>
                      <span className="aprox-res-dist">a {item.distancia}</span>
                    </div>

                    <div className="aprox-res-col-jugadores">
                      <div className="aprox-res-autor-linea">
                        <strong>{autorNombre}</strong>
                        <span className={`aprox-badge-pts ${deltaAutor > 0 ? 'pos' : deltaAutor < 0 ? 'neg' : ''}`}>
                          {deltaAutor >= 0 ? `+${deltaAutor}` : deltaAutor} pts
                        </span>
                      </div>
                      {confiadosNombres.length > 0 && (
                        <div className="aprox-res-confian">
                          Confiaron:{' '}
                          {confiadosNombres
                            .map((nom) => {
                              const jId = sala.jugadores.find((j) => j.nombre === nom)?.id;
                              const ptsConf = ronda.resultado.scoresRonda[jId] ?? 0;
                              return `${nom} (+${ptsConf}p)`;
                            })
                            .join(', ')}
                        </div>
                      )}
                    </div>

                    <div className="aprox-res-etiqueta">
                      {esExacta && '🎯 Exacta'}
                      {esMin && '🥇 Más cercana'}
                      {esMax && '❌ Más lejana'}
                      {!esExacta && !esMin && !esMax && '⚖️ Intermedia'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

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
                    <span className="aprox-ranking-pts">{j.puntos} pts</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="qqp-barra">
            {esAdmin ? (
              <>
                <BotonPrincipal onClick={handleSiguienteRonda}>
                  <Icon name="play" size={20} />
                  {sala.rondaNum < sala.maxRondas
                    ? `Siguiente ronda (${sala.rondaNum + 1} de ${sala.maxRondas})`
                    : 'Ver podio final'}
                </BotonPrincipal>
                <EnlaceSecundario onClick={handleFinalizar}>
                  Finalizar partida anticipadamente
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
                  ? 'Nadie ha sumado puntos en esta partida.'
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
                    <span className="aprox-ranking-pts">{j.puntos} pts</span>
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