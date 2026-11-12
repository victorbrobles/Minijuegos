// client/src/games/Velocidad/VelocidadOnline.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Icon from '../../components/Icon.jsx';
import './Velocidad.css';
import {
  MenuInicioJuego,
  MenuModoOnline,
  FormCrearSala,
  FormUnirseSala,
  CabeceraSala,
  ListaSala,
  EsperandoAnfitrion
} from '../../components/MenuJuego.jsx';
import { limitesOnline, textoSala } from '../limites.js';
import { SelectorRondas } from '../../components/MenuJuego.jsx';
import { rondasPorDefecto } from '../rondas.js';

const LIM_ON = limitesOnline('velocidad');

const CLAVE_SESION_VEL = 'velocidad_online_session';
const COLORES_JUGADOR = ['#3b82f6', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4', '#f97316', '#84cc16', '#6366f1'];
const colorJugador = (id) => COLORES_JUGADOR[(Number(id) - 1 + COLORES_JUGADOR.length * 10) % COLORES_JUGADOR.length];
const inicial = (n = '?') => n.trim().charAt(0).toUpperCase() || '?';

export default function VelocidadOnline({ onLocal }) {
  const [rondasSel, setRondasSel] = useState(rondasPorDefecto('velocidad'));
  const [vista, setVista] = useState('menu'); // 'menu' | 'online_menu' | 'crear' | 'unirse' | 'sala'
  const [nombre, setNombre] = useState('');
  const [codigoInput, setCodigoInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);
  const [modalSalir, setModalSalir] = useState(false);
  const [modalAyuda, setModalAyuda] = useState(false);

  const [sesion, setSesion] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(CLAVE_SESION_VEL));
    } catch {
      return null;
    }
  });

  const [sala, setSala] = useState(null);
  const [sinRed, setSinRed] = useState(false);

  // Estados de la partida activa en mi teléfono (cuando es mi turno)
  const [preguntas, setPreguntas] = useState([]);
  const [preguntaEspecial, setPreguntaEspecial] = useState(null);
  const [preguntaIdx, setPreguntaIdx] = useState(0);
  const [aciertosActuales, setAciertosActuales] = useState(0);
  const [tiempoRestante, setTiempoRestante] = useState(60);
  const [feedbackOpcion, setFeedbackOpcion] = useState(null);

  const [mostrandoEspecial, setMostrandoEspecial] = useState(false);
  const [especialUsada, setEspecialUsada] = useState(false);
  const [inputEspecial, setInputEspecial] = useState('');
  const [feedbackEspecial, setFeedbackEspecial] = useState(null);

  const timerRef = useRef(null);
  const intervalRef = useRef(null);
  const arrancandoRef = useRef(false);
  const aciertosRef = useRef(0);

  useEffect(() => {
    aciertosRef.current = aciertosActuales;
  }, [aciertosActuales]);

  useEffect(() => {
    if (!sesion) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setSala(null);
      return;
    }

    let fallos = 0;
    let pedidas = 0;
    let aplicada = 0;
    const cerrar = (msg) => {
      sessionStorage.removeItem(CLAVE_SESION_VEL);
      setSesion(null);
      setSala(null);
      setSinRed(false);
      setVista('online_menu');
      setErrorMsg(msg);
    };

    const consultarEstado = () => {
      const n = ++pedidas;
      fetch(`/api/velocidad/online/sala/${sesion.code}?token=${sesion.token}`)
        .then(async (r) => {
          if (r.status === 404 || r.status === 403) {
            const d = await r.json().catch(() => ({}));
            cerrar(d.error || 'La sala se ha cerrado.');
            return;
          }
          if (!r.ok) throw new Error('red');
          const d = await r.json();
          if (n < aplicada) return;
          aplicada = n;
          fallos = 0;
          setSinRed(false);
          if (d.success) {
            setSala(d);
            setVista('sala');
          }
        })
        .catch(() => {
          fallos += 1;
          if (fallos >= 3) setSinRed(true);
          if (fallos >= 40) cerrar('Se ha perdido la conexión con la sala.');
        });
    };

    consultarEstado();
    intervalRef.current = setInterval(consultarEstado, 500);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sesion]);

  const esMiTurno = Boolean(sala && sala.jugadorActualId === sala.yoId);

  const reportarProgreso = useCallback((aciertos, tiempo, numPreg, preguntaTxt, esp) => {
    if (!sesion) return;
    fetch(`/api/velocidad/online/sala/${sesion.code}/reportar-progreso`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: sesion.token,
        aciertos,
        tiempoRestante: tiempo,
        preguntaNum: numPreg,
        preguntaTexto: preguntaTxt,
        mostrandoEspecial: esp
      })
    }).catch(() => {});
  }, [sesion]);

  const handleArrancarMiTurnoEnVivo = useCallback(async () => {
    if (!sesion || arrancandoRef.current) return;
    arrancandoRef.current = true;
    try {
      const res = await fetch(`/api/velocidad/online/sala/${sesion.code}/arrancar-turno`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token })
      });
      const data = await res.json();
      if (data.success) {
        setPreguntas(data.preguntas || []);
        setPreguntaEspecial(data.especial || null);
        setPreguntaIdx(0);
        setAciertosActuales(0);
        aciertosRef.current = 0;
        setTiempoRestante(60);
        setEspecialUsada(false);
        setMostrandoEspecial(false);
        setInputEspecial('');
        setFeedbackEspecial(null);
        setFeedbackOpcion(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      arrancandoRef.current = false;
    }
  }, [sesion]);

  // Auto-arrancar el turno cuando la cuenta atrás de 10s llega a 0 o al reconectar en 'jugando'
  useEffect(() => {
    if (!sala || !esMiTurno) return;

    if (sala.estado === 'cuenta_atras' && sala.cuentaAtrasSegundos <= 0) {
      handleArrancarMiTurnoEnVivo();
    } else if (sala.estado === 'jugando' && preguntas.length === 0) {
      handleArrancarMiTurnoEnVivo();
    }
  }, [sala?.estado, sala?.cuentaAtrasSegundos, esMiTurno, preguntas.length, handleArrancarMiTurnoEnVivo]);

  const finalizarMiTurno = useCallback(async () => {
    clearInterval(timerRef.current);
    if (!sesion) return;
    try {
      await fetch(`/api/velocidad/online/sala/${sesion.code}/finalizar-turno`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token, aciertos: aciertosRef.current })
      });
    } catch (err) {
      console.error(err);
    }
  }, [sesion]);

  // Cronómetro del jugador activo en su propio turno
  useEffect(() => {
    if (sala?.estado !== 'jugando' || !esMiTurno || mostrandoEspecial || preguntas.length === 0) return;

    timerRef.current = setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev === 31 && !especialUsada) {
          clearInterval(timerRef.current);
          setMostrandoEspecial(true);
          setEspecialUsada(true);
          reportarProgreso(aciertosRef.current, 30, preguntaIdx + 1, preguntas[preguntaIdx]?.pregunta, true);
          return 30;
        }

        if (prev <= 1) {
          clearInterval(timerRef.current);
          finalizarMiTurno();
          return 0;
        }

        const nuevo = prev - 1;
        reportarProgreso(aciertosRef.current, nuevo, preguntaIdx + 1, preguntas[preguntaIdx]?.pregunta, false);
        return nuevo;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [sala?.estado, esMiTurno, mostrandoEspecial, especialUsada, preguntaIdx, preguntas, reportarProgreso, finalizarMiTurno]);

  const handleCrear = async () => {
    if (!nombre.trim()) return;
    setErrorMsg('');
    setCargando(true);
    try {
      const res = await fetch('/api/velocidad/online/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear la sala.');

      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_VEL, JSON.stringify(nueva));
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
      const res = await fetch('/api/velocidad/online/unirse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codigoInput.trim().toUpperCase(), nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al unirse.');

      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_VEL, JSON.stringify(nueva));
      setSesion(nueva);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleExpulsar = async (jugadorId) => {
    if (!sesion) return;
    try {
      await fetch(`/api/velocidad/online/sala/${sesion.code}/expulsar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token, jugadorId })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleIniciarJuego = async () => {
    if (!sesion) return;
    try {
      await fetch(`/api/velocidad/online/sala/${sesion.code}/iniciar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token, rondas: rondasSel })
      });
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const responderOpcionOnline = (opcIndex) => {
    if (feedbackOpcion !== null || mostrandoEspecial) return;

    const actual = preguntas[preguntaIdx];
    if (!actual) return;

    const esCorrecta = opcIndex === actual.correcta;
    setFeedbackOpcion({ idx: opcIndex, correcta: esCorrecta });

    let nuevosAciertos = aciertosRef.current;
    if (esCorrecta) {
      nuevosAciertos += 1;
      aciertosRef.current = nuevosAciertos;
      setAciertosActuales(nuevosAciertos);
    }

    reportarProgreso(nuevosAciertos, tiempoRestante, preguntaIdx + 1, actual.pregunta, false);

    setTimeout(() => {
      setFeedbackOpcion(null);
      const sigIdx = preguntaIdx + 1 < preguntas.length ? preguntaIdx + 1 : 0;
      setPreguntaIdx(sigIdx);
      reportarProgreso(nuevosAciertos, tiempoRestante, sigIdx + 1, preguntas[sigIdx]?.pregunta, false);
    }, 220);
  };

  const enviarRespuestaEspecialOnline = async (e) => {
    e.preventDefault();
    if (!inputEspecial.trim() || !sesion || feedbackEspecial) return;

    try {
      const res = await fetch(`/api/velocidad/online/sala/${sesion.code}/validar-especial`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token, respuesta: inputEspecial })
      });
      const data = await res.json();

      let nuevoTiempo = tiempoRestante;
      if (data.acierto) {
        nuevoTiempo = tiempoRestante + 30;
        setFeedbackEspecial({ acierto: true, texto: '¡CORRECTO! +30 SEGUNDOS AL CRONÓMETRO' });
        setTiempoRestante(nuevoTiempo);
      } else {
        setFeedbackEspecial({
          acierto: false,
          texto: `INCORRECTO (Era: ${data.respuestaCorrecta}). El tiempo continúa.`
        });
      }

      setTimeout(() => {
        setMostrandoEspecial(false);
        setFeedbackEspecial(null);
        reportarProgreso(aciertosRef.current, nuevoTiempo, preguntaIdx + 1, preguntas[preguntaIdx]?.pregunta, false);
      }, 1600);
    } catch {
      setMostrandoEspecial(false);
    }
  };

  const handleSiguienteJugador = async () => {
    if (!sesion) return;
    try {
      await fetch(`/api/velocidad/online/sala/${sesion.code}/siguiente-jugador`, {
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
      await fetch(`/api/velocidad/online/sala/${sesion.code}/reiniciar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSalir = async () => {
    clearInterval(timerRef.current);
    if (sesion) {
      try {
        await fetch(`/api/velocidad/online/sala/${sesion.code}/salir`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: sesion.token }),
          keepalive: true
        });
      } catch {
        /* ignorar */
      }
    }
    sessionStorage.removeItem(CLAVE_SESION_VEL);
    setSesion(null);
    setSala(null);
    setVista('online_menu');
  };

  const esAdmin = Boolean(sala?.esAdmin);
  const yoId = sala?.yoId;
  const preguntaActual = preguntas[preguntaIdx];
  const ranking = [...(sala?.jugadores || [])].sort((a, b) => b.aciertos - a.aciertos);
  const maximoAciertos = ranking.length ? ranking[0].aciertos : 0;
  const ganadores = maximoAciertos > 0 ? ranking.filter((j) => j.aciertos === maximoAciertos) : [];
  const enPartidaActiva = vista === 'sala' && sala && sala.estado !== 'lobby';

  const tiempoMostrado = esMiTurno ? tiempoRestante : (sala?.progresoEnVivo?.tiempoRestante ?? 60);
  const aciertosMostrados = esMiTurno ? aciertosActuales : (sala?.progresoEnVivo?.aciertos ?? 0);
  const enEspecialActual = esMiTurno ? mostrandoEspecial : Boolean(sala?.progresoEnVivo?.mostrandoEspecial);

  return (
    <div className={`vel-contenedor ${enPartidaActiva ? 'qq-en-partida' : ''}`}>
      {sinRed && <div className="ptp-sin-red">📶 Reconectando con la sala…</div>}

      {/* MODAL DE AYUDA */}
      {modalAyuda && (
        <div className="rg-modal-fondo" onClick={() => setModalAyuda(false)}>
          <div className="rg-modal ptp-modal-ayuda" onClick={(e) => e.stopPropagation()}>
            <div className="ptp-modal-ayuda-header">
              <span className="ptp-ayuda-badge">❓ Cómo jugar</span>
              <h3>Test de Velocidad</h3>
            </div>

            <div className="ptp-modal-ayuda-body">
              <p>Compite por turnos de 60 segundos desde cada móvil mientras el resto sigue tu ronda en directo.</p>
              <ul>
                <li><strong>Turnos sorteados:</strong> El juego sortea quién empieza con una cuenta atrás de <strong>10 segundos</strong>.</li>
                <li><strong>60 segundos contrarreloj:</strong> Cada pregunta tiene 4 opciones y suma <strong>+1 punto</strong> por acierto. Todos ven tus preguntas y aciertos en tiempo real.</li>
                <li><strong>⭐ Pregunta Especial (30s):</strong> A los 30 segundos el cronómetro se pausa y aparece una pregunta abierta que otorga <strong>+30 segundos extra</strong> si aciertas.</li>
              </ul>
            </div>

            <button type="button" className="ptp-boton" onClick={() => setModalAyuda(false)}>
              ¡Entendido!
            </button>
          </div>
        </div>
      )}

      {/* 1. MENÚ PRINCIPAL */}
      {vista === 'menu' && (
        <MenuInicioJuego
          juegoId="velocidad"
          onOnline={() => { setVista('online_menu'); setErrorMsg(''); }}
          onLocal={onLocal}
          onAyuda={() => setModalAyuda(true)}
          error={errorMsg}
        />
      )}

      {vista === 'online_menu' && (
        <MenuModoOnline
          onVolver={() => { setVista('menu'); setErrorMsg(''); }}
          onCrear={() => { setVista('crear'); setErrorMsg(''); }}
          onUnirse={() => { setVista('unirse'); setErrorMsg(''); }}
          onAyuda={() => setModalAyuda(true)}
          error={errorMsg}
        />
      )}

      {/* 2. CREAR SALA */}
      {vista === 'crear' && (
        <FormCrearSala
          onVolver={() => { setVista('online_menu'); setErrorMsg(''); }}
          onAyuda={() => setModalAyuda(true)}
          nombre={nombre}
          setNombre={setNombre}
          onCrear={handleCrear}
          cargando={cargando}
          error={errorMsg}
        />
      )}

      {/* 3. UNIRSE A SALA */}
      {vista === 'unirse' && (
        <FormUnirseSala
          onVolver={() => { setVista('online_menu'); setErrorMsg(''); }}
          onAyuda={() => setModalAyuda(true)}
          codigo={codigoInput}
          setCodigo={setCodigoInput}
          nombre={nombre}
          setNombre={setNombre}
          onUnirse={handleUnirse}
          cargando={cargando}
          error={errorMsg}
        />
      )}

      {/* 4. SALA: LOBBY */}
      {vista === 'sala' && sala && sala.estado === 'lobby' && (
        <section className="game qq-pantalla">
          <CabeceraSala
            codigo={sala.code}
            onVolver={() => setModalSalir(true)}
            onAyuda={() => setModalAyuda(true)}
          />

          <ListaSala
            jugadores={sala.jugadores}
            yoId={yoId}
            min={LIM_ON.min}
            max={LIM_ON.max}
            anfitrionId={sala.anfitrionId}
            renderExtra={(j) => (
              <span className="ptp-sala-extra">
                {!j.conectado && <span className="ptp-sin-conexion" title="Sin conexión">📵</span>}
                {esAdmin && j.id !== yoId && (
                  <button type="button" className="ptp-quitar" onClick={() => handleExpulsar(j.id)}>
                    Quitar
                  </button>
                )}
              </span>
            )}
          />

          {esAdmin && (
            <div className="panel qq-menu-panel" style={{ marginTop: '1rem' }}>
              <SelectorRondas juegoId="velocidad" valor={rondasSel} onCambiar={setRondasSel} />
            </div>
          )}
          {esAdmin ? (
            <div style={{ marginTop: '1.2rem' }}>
              <button
                className="big full qq-btn-principal"
                disabled={sala.jugadores.length < LIM_ON.min}
                onClick={handleIniciarJuego}
              >
                <Icon name="play" size={22} />
                {sala.jugadores.length < LIM_ON.min ? 'Esperando jugadores...' : '¡Empezar Desafío!'}
              </button>
            </div>
          ) : (
            <EsperandoAnfitrion texto="El anfitrión sorteará quién empieza el minuto contrarreloj." />
          )}
        </section>
      )}

      {/* 5. SALA: CUENTA ATRÁS PREVIA */}
      {vista === 'sala' && sala && sala.estado === 'cuenta_atras' && (
        <section className="game ptp-escena">
          <header className="ptp-hero">
            <span className="ptp-hero-deco" aria-hidden="true">
              <Icon name="zap" size={140} strokeWidth={1.3} />
            </span>
            <div className="ptp-hero-top">
              <button type="button" className="ptp-salir" onClick={() => setModalSalir(true)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                <span>Portada</span>
              </button>
              <div className="ptp-hero-chips">
                <span className="ptp-chip"><Icon name="dice" size={14} /> Turno sorteado</span>
              </div>
            </div>

            <ol className="ptp-marcador" aria-label="Jugadores">
              {sala.jugadores.map((j) => {
                const esTurnoDeEste = j.id === sala.jugadorActualId;
                return (
                  <li
                    key={j.id}
                    className={`ptp-jugador${j.jugo ? ' respondido' : ''}${j.id === yoId ? ' yo' : ''}`}
                    style={{ '--c': colorJugador(j.id) }}
                  >
                    <span className="ptp-jugador-avatar">{inicial(j.nombre)}</span>
                    <span className="ptp-jugador-datos">
                      <span className="ptp-jugador-nombre">{j.nombre}{j.id === yoId ? ' (tú)' : ''}</span>
                      <span className="ptp-jugador-linea">
                        <strong>{j.jugo ? `${j.aciertos} pts` : esTurnoDeEste ? 'En turno' : 'Pendiente'}</strong>
                      </span>
                    </span>
                    <span className="ptp-jugador-estado">
                      {j.jugo ? '✅' : esTurnoDeEste ? '⚡' : '⏳'}
                    </span>
                  </li>
                );
              })}
            </ol>
          </header>

          <div className="ptp-tarjeta vel-prep-card">
            <p className="ptp-etiqueta">Siguiente participante</p>
            {esMiTurno ? (
              <>
                <h2 className="vel-prep-titulo">
                  ¡Es tu turno, <span style={{ color: colorJugador(yoId) }}>{sala.jugadorActualNombre}</span>!
                </h2>
                <p className="vel-prep-sub">Prepárate: dispondrás de 60 segundos contrarreloj.</p>
              </>
            ) : (
              <>
                <h2 className="vel-prep-titulo">
                  Turno de <span style={{ color: colorJugador(sala.jugadorActualId) }}>{sala.jugadorActualNombre}</span>
                </h2>
                <p className="vel-prep-sub">Prepárate para seguir su ronda contrarreloj en directo.</p>
              </>
            )}

            <div className="vel-cuenta-circulo">
              <span>{sala.cuentaAtrasSegundos}</span>
            </div>

            {esMiTurno ? (
              <button type="button" className="ptp-boton grande" onClick={handleArrancarMiTurnoEnVivo}>
                <Icon name="zap" size={22} /> ¡Empezar ya sin esperar!
              </button>
            ) : (
              <p className="vel-prep-sub" style={{ margin: 0, fontWeight: 700 }}>
                Comenzando en breve…
              </p>
            )}
          </div>
        </section>
      )}

      {/* 6. SALA: JUGANDO ONLINE */}
      {vista === 'sala' && sala && sala.estado === 'jugando' && (
        <section className="game ptp-escena">
          <header className="ptp-hero">
            <span className="ptp-hero-deco" aria-hidden="true">
              <Icon name="zap" size={140} strokeWidth={1.3} />
            </span>
            <div className="ptp-hero-top">
              <button type="button" className="ptp-salir" onClick={() => setModalSalir(true)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                <span>Portada</span>
              </button>
              <div className="ptp-hero-chips">
                <span className="ptp-chip">
                  <Icon name="zap" size={14} /> {esMiTurno ? 'Tu turno' : sala.jugadorActualNombre}
                </span>
                <span className="ptp-chip">
                  <Icon name="check" size={14} strokeWidth={2.5} /> {aciertosMostrados} {aciertosMostrados === 1 ? 'acierto' : 'aciertos'}
                </span>
              </div>
            </div>

            <ol className="ptp-marcador" aria-label="Estado de los jugadores">
              {sala.jugadores.map((j) => {
                const esTurnoDeEste = j.id === sala.jugadorActualId;
                const pts = esTurnoDeEste ? aciertosMostrados : j.aciertos;
                return (
                  <li
                    key={j.id}
                    className={`ptp-jugador${j.jugo ? ' respondido' : ''}${j.id === yoId ? ' yo' : ''}`}
                    style={{ '--c': colorJugador(j.id) }}
                  >
                    <span className="ptp-jugador-avatar">{inicial(j.nombre)}</span>
                    <span className="ptp-jugador-datos">
                      <span className="ptp-jugador-nombre">{j.nombre}{j.id === yoId ? ' (tú)' : ''}</span>
                      <span className="ptp-jugador-linea">
                        <strong>{j.jugo || esTurnoDeEste ? `${pts} pts` : 'Pendiente'}</strong>
                      </span>
                    </span>
                    <span className="ptp-jugador-estado">
                      {j.jugo ? '✅' : esTurnoDeEste ? '⚡' : '⏳'}
                    </span>
                  </li>
                );
              })}
            </ol>
          </header>

          {/* Barra de tiempo */}
          <div className={`ptp-tiempo ${tiempoMostrado <= 12 && !enEspecialActual ? 'critico' : ''}`} role="timer">
            <div className="ptp-tiempo-barra">
              <span style={{ width: `${Math.min(100, (tiempoMostrado / 60) * 100)}%` }} />
            </div>
            <span className="ptp-tiempo-num">
              <Icon name="clock" size={15} />
              {enEspecialActual ? 'Pausado' : `${tiempoMostrado}s`}
            </span>
          </div>

          {esMiTurno ? (
            mostrandoEspecial && preguntaEspecial ? (
              <div className="ptp-tarjeta vel-especial-panel">
                <div className="vel-especial-header">
                  <span className="vel-especial-estrella">⭐</span>
                  <h3>¡PREGUNTA ESPECIAL!</h3>
                </div>

                <p className="vel-especial-sub">
                  El cronómetro está pausado. Acierta sin opciones para ganar <strong>+30 segundos extra</strong>.
                </p>

                <div className="vel-especial-caja-pregunta">
                  <p>{preguntaEspecial.pregunta}</p>
                </div>

                {feedbackEspecial ? (
                  <div className={`vel-feedback-esp ${feedbackEspecial.acierto ? 'exito' : 'fallo'}`}>
                    {feedbackEspecial.texto}
                  </div>
                ) : (
                  <form onSubmit={enviarRespuestaEspecialOnline} className="ptp-form-online">
                    <input
                      type="text"
                      autoFocus
                      autoComplete="off"
                      className="ptp-input"
                      placeholder="Escribe la respuesta exacta…"
                      value={inputEspecial}
                      onChange={(e) => setInputEspecial(e.target.value)}
                      required
                    />
                    <button type="submit" className="ptp-boton" disabled={!inputEspecial.trim()}>
                      <Icon name="check" size={20} strokeWidth={2.5} /> Responder (+30s)
                    </button>
                  </form>
                )}
              </div>
            ) : (
              preguntaActual && (
                <div className="ptp-tarjeta vel-tarjeta-pregunta">
                  <div className="ptp-tarjeta-cab">
                    <p className="ptp-etiqueta">Test contrarreloj</p>
                    <span className="ptp-badge-pista">Pregunta #{preguntaIdx + 1}</span>
                  </div>

                  <h2 className="vel-pregunta-texto">{preguntaActual.pregunta}</h2>

                  <div className="vel-opciones-grid">
                    {preguntaActual.opciones.map((opcion, idx) => {
                      let clase = 'vel-btn-opcion';
                      if (feedbackOpcion !== null) {
                        if (idx === preguntaActual.correcta) clase += ' acierto-flash';
                        else if (idx === feedbackOpcion.idx) clase += ' fallo-flash';
                      }

                      return (
                        <button
                          key={idx}
                          type="button"
                          className={clase}
                          disabled={feedbackOpcion !== null}
                          onClick={() => responderOpcionOnline(idx)}
                        >
                          <span className="vel-letra-opcion">{String.fromCharCode(65 + idx)}</span>
                          <span className="vel-texto-opcion">{opcion}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )
            )
          ) : (
            <div className="ptp-tarjeta vel-espectador-card">
              {sala.progresoEnVivo?.mostrandoEspecial ? (
                <div className="vel-especial-caja-pregunta" style={{ margin: 0 }}>
                  <span style={{ fontSize: '2rem', display: 'block' }}>⭐</span>
                  <h3 style={{ margin: '0.35rem 0', color: '#78350f' }}>¡Pregunta Especial de 30s en curso!</h3>
                  <p style={{ margin: 0, fontWeight: 600 }}>
                    El tiempo está pausado mientras {sala.jugadorActualNombre} responde la pregunta abierta.
                  </p>
                </div>
              ) : (
                <>
                  <div className="ptp-tarjeta-cab">
                    <p className="ptp-etiqueta">Viendo en directo a {sala.jugadorActualNombre}</p>
                    <span className="ptp-badge-pista">Pregunta #{sala.progresoEnVivo?.preguntaNum ?? 1}</span>
                  </div>
                  <h2 className="vel-pregunta-texto" style={{ margin: '0.6rem 0 0.9rem' }}>
                    {sala.progresoEnVivo?.preguntaTexto || 'Respondiendo preguntas a toda velocidad…'}
                  </h2>
                  <p className="vel-prep-sub" style={{ margin: 0 }}>
                    {sala.jugadorActualNombre} está seleccionando su respuesta en directo.
                  </p>
                </>
              )}
            </div>
          )}
        </section>
      )}

      {/* 7. SALA: RESUMEN DEL TURNO */}
      {vista === 'sala' && sala && sala.estado === 'resumen_turno' && (
        <section className="game ptp-escena">
          <header className="ptp-hero">
            <span className="ptp-hero-deco" aria-hidden="true">
              <Icon name="hourglass" size={140} strokeWidth={1.3} />
            </span>
            <div className="ptp-hero-top">
              <button type="button" className="ptp-salir" onClick={() => setModalSalir(true)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                <span>Salir</span>
              </button>
              <span className="ptp-chip"><Icon name="flagFinish" size={14} /> ¡Fin del turno!</span>
            </div>
            <p className="ptp-etiqueta" style={{ color: 'rgba(255,255,255,0.85)' }}>
              Marca de {sala.jugadorActualNombre || 'este turno'}
            </p>
            <h2 className="ptp-solucion-titulo">
              {sala.jugadores.find((j) => j.id === sala.jugadorActualId)?.aciertos ?? 0} aciertos
            </h2>
          </header>

          <div className="ptp-tarjeta">
            <p className="ptp-etiqueta">Clasificación general</p>
            <ol className="ptp-ranking">
              {sala.jugadores.map((j, i) => {
                const esReciente = j.id === sala.jugadorActualId;
                return (
                  <li key={j.id} className={esReciente ? 'lider' : ''} style={{ '--c': colorJugador(j.id) }}>
                    <span className="ptp-ranking-pos">{j.jugo ? '✅' : i + 1}</span>
                    <span className="ptp-jugador-avatar">{inicial(j.nombre)}</span>
                    <span className="ptp-ranking-nombre">
                      {j.nombre}{j.id === yoId ? ' (tú)' : ''}
                    </span>
                    <strong>{j.jugo ? `${j.aciertos} pts` : 'Pendiente'}</strong>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="ptp-barra estatica">
            {esAdmin ? (
              sala.jugadores.some((j) => !j.jugo) || sala.ronda < sala.maxRondas ? (
                <button type="button" className="ptp-boton grande" onClick={handleSiguienteJugador}>
                  <Icon name="dice" size={20} /> {sala.jugadores.some((j) => !j.jugo) ? 'Sortear siguiente jugador' : `Empezar la ronda ${sala.ronda + 1} de ${sala.maxRondas}`}
                </button>
              ) : (
                <button type="button" className="ptp-boton grande" onClick={handleSiguienteJugador}>
                  <Icon name="trophy" size={20} /> Ver podio y resultados finales
                </button>
              )
            ) : (
              <p className="ptp-espera">Esperando a que el anfitrión continúe con el siguiente jugador…</p>
            )}
          </div>
        </section>
      )}

      {/* 8. SALA: FINAL */}
      {vista === 'sala' && sala && sala.estado === 'final' && (
        <section className="game ptp-escena">
          <div className="end-card">
            <span className="end-icon"><Icon name="crown" size={44} /></span>
            <h1 className="title">Clasificación Final</h1>
            <p className="final-score">
              {ganadores.length === 0
                ? 'Partida completada'
                : ganadores.length === 1
                ? <>¡Victoria para {ganadores[0].nombre} con {ganadores[0].aciertos} aciertos!</>
                : <>Empate entre {ganadores.map((g) => g.nombre).join(', ')} con {maximoAciertos} aciertos</>}
            </p>

            <div className="scoreboard">
              {ranking.map((j, i) => {
                const lider = maximoAciertos > 0 && j.aciertos === maximoAciertos;
                return (
                  <div key={j.id} className={`score-row ${lider ? 'first' : ''}`}>
                    <span className="score-name">
                      {lider ? <Icon name="crown" size={22} /> : <span className="pos">{i + 1}</span>}
                      {j.nombre} {j.id === yoId ? '(Tú)' : ''}
                    </span>
                    <span className="score-pts">{j.aciertos} pts</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="ptp-barra estatica">
            {esAdmin && (
              <button type="button" className="ptp-boton grande" onClick={handleReiniciarPartida}>
                <Icon name="refresh" size={20} /> Otra partida (mismos jugadores)
              </button>
            )}
            <button type="button" className="ptp-boton secundario" onClick={() => setModalSalir(true)}>
              <Icon name="door" size={20} /> Salir de la sala
            </button>
          </div>
        </section>
      )}

      {/* MODAL DE CONFIRMACIÓN PARA SALIR */}
      {modalSalir && (
        <div className="rg-modal-fondo" onClick={() => setModalSalir(false)}>
          <div className="rg-modal ptp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ptp-modal-icono">🚪</div>
            <h3>¿Salir de la sala?</h3>
            <p className="hint">Si sales ahora abandonarás la partida en curso. ¿Estás seguro?</p>

            <div className="ptp-fila-botones">
              <button type="button" className="ptp-boton secundario" onClick={() => setModalSalir(false)}>
                Quedarme
              </button>
              <button
                type="button"
                className="ptp-boton peligro"
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