// client/src/games/Colores/ColoresOnline.jsx
import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../components/Icon.jsx';
import './Colores.css';

const CLAVE_SESION_COLORES = 'colores_online_session';
const TIEMPO_TURNO = 45;

const PALETA_COLORES = [
  { id: 'rojo', nombre: 'Rojo', hex: '#ef4444', textoHex: '#ffffff' },
  { id: 'azul', nombre: 'Azul', hex: '#2563eb', textoHex: '#ffffff' },
  { id: 'amarillo', nombre: 'Amarillo', hex: '#eab308', textoHex: '#0f172a' },
  { id: 'verde', nombre: 'Verde', hex: '#16a34a', textoHex: '#ffffff' },
  { id: 'naranja', nombre: 'Naranja', hex: '#ea580c', textoHex: '#ffffff' },
  { id: 'morado', nombre: 'Morado', hex: '#9333ea', textoHex: '#ffffff' },
  { id: 'marron', nombre: 'Marrón', hex: '#78350f', textoHex: '#ffffff' },
  { id: 'blanco', nombre: 'Blanco', hex: '#ffffff', textoHex: '#0f172a', borde: '#cbd5e1' },
  { id: 'negro', nombre: 'Negro', hex: '#0f172a', textoHex: '#ffffff' },
  { id: 'gris', nombre: 'Gris', hex: '#64748b', textoHex: '#ffffff' },
  { id: 'rosa', nombre: 'Rosa', hex: '#ec4899', textoHex: '#ffffff' }
];

export default function ColoresOnline({ onLocal, onSalir }) {
  const [vista, setVista] = useState('menu'); // 'menu' | 'crear' | 'unirse' | 'sala'
  const [nombre, setNombre] = useState('');
  const [codigoInput, setCodigoInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);
  const [modalSalir, setModalSalir] = useState(false);
  const [modalAyuda, setModalAyuda] = useState(false);

  const [sesion, setSesion] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(CLAVE_SESION_COLORES));
    } catch {
      return null;
    }
  });

  const [sala, setSala] = useState(null);
  const [codigoCopiado, setCodigoCopiado] = useState(false);
  const [misColoresSeleccionados, setMisColoresSeleccionados] = useState([]);

  const [tiempoRestante, setTiempoRestante] = useState(TIEMPO_TURNO);
  const timerRef = useRef(null);

  const intervalRef = useRef(null);

  useEffect(() => {
    if (!sesion) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setSala(null);
      return;
    }

    const consultarEstado = () => {
      fetch(`/api/colores/online/sala/${sesion.code}?token=${sesion.token}`)
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
          sessionStorage.removeItem(CLAVE_SESION_COLORES);
          setSesion(null);
          setSala(null);
          setVista('menu');
          setErrorMsg('La sala se ha cerrado o se ha perdido la conexión.');
        });
    };

    consultarEstado();
    intervalRef.current = setInterval(consultarEstado, 500);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sesion]);

  // SOLUCIÓN BUG: Reinicia las selecciones locales para TODOS los jugadores cuando cambia la ronda o el estado
  useEffect(() => {
    setMisColoresSeleccionados([]);
  }, [sala?.rondaActualIdx, sala?.estado]);

  const handleCrear = async () => {
    if (!nombre.trim()) return;
    setErrorMsg('');
    setCargando(true);
    try {
      const res = await fetch('/api/colores/online/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear la sala.');

      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_COLORES, JSON.stringify(nueva));
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
      const res = await fetch('/api/colores/online/unirse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codigoInput.trim().toUpperCase(), nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al unirse.');

      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_COLORES, JSON.stringify(nueva));
      setSesion(nueva);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleIniciarJuego = async () => {
    if (!sesion) return;
    setMisColoresSeleccionados([]);
    try {
      await fetch(`/api/colores/online/sala/${sesion.code}/iniciar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token })
      });
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const toggleColorOnline = (colorId) => {
    if (sala?.ronda?.yaRespondio) return;
    const numMax = sala?.ronda?.numColores || 1;

    if (misColoresSeleccionados.includes(colorId)) {
      setMisColoresSeleccionados(misColoresSeleccionados.filter((c) => c !== colorId));
    } else {
      if (misColoresSeleccionados.length < numMax) {
        setMisColoresSeleccionados([...misColoresSeleccionados, colorId]);
      }
    }
  };

  const handleEnviarRespuesta = async (forzado = false) => {
    if (!sesion) return;
    if (!forzado && misColoresSeleccionados.length !== sala?.ronda?.numColores) return;

    if (timerRef.current) clearInterval(timerRef.current);

    try {
      await fetch(`/api/colores/online/sala/${sesion.code}/responder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token, colores: misColoresSeleccionados })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleEnviarRespuestaRef = useRef();
  useEffect(() => {
    handleEnviarRespuestaRef.current = handleEnviarRespuesta;
  });

  useEffect(() => {
    const isVotando = sala?.estado === 'jugando' && sala?.ronda?.estadoRonda === 'votando';
    if (!isVotando || sala?.ronda?.yaRespondio) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    setTiempoRestante(TIEMPO_TURNO);
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          if (handleEnviarRespuestaRef.current) handleEnviarRespuestaRef.current(true); // Forzar envío
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sala?.estado, sala?.ronda?.estadoRonda, sala?.ronda?.yaRespondio, sala?.rondaActualIdx]);

  const handleCerrarRonda = async () => {
    if (!sesion) return;
    try {
      await fetch(`/api/colores/online/sala/${sesion.code}/cerrar-ronda`, {
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
    setMisColoresSeleccionados([]);
    try {
      await fetch(`/api/colores/online/sala/${sesion.code}/siguiente-ronda`, {
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
      await fetch(`/api/colores/online/sala/${sesion.code}/finalizar`, {
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
      await fetch(`/api/colores/online/sala/${sesion.code}/reiniciar`, {
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
        await fetch(`/api/colores/online/sala/${sesion.code}/salir`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: sesion.token })
        });
      } catch {
        /* ignorar */
      }
    }
    sessionStorage.removeItem(CLAVE_SESION_COLORES);
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

  const ronda = sala?.ronda;
  const esAdmin = Boolean(sala?.esAdmin);
  const resultadoRonda = ronda?.resultadoRonda;
  const ranking = [...(sala?.jugadores || [])].sort((a, b) => b.puntos - a.puntos);
  const maximoPuntos = ranking.length ? ranking[0].puntos : 0;
  const ganadores = maximoPuntos > 0 ? ranking.filter((j) => j.puntos === maximoPuntos) : [];

  const mostrarAyuda = vista === 'menu' || vista === 'crear' || vista === 'unirse' || (vista === 'sala' && sala?.estado === 'lobby');

  return (
    <div className="aprox-contenedor">
      {/* ---------------- BOTÓN Y MODAL DE AYUDA ---------------- */}
      {mostrarAyuda && (
        <button
          type="button"
          className="btn-ayuda-flotante"
          onClick={() => setModalAyuda(true)}
          title="Reglas de La vida en colores"
        >
          <span className="btn-ayuda-flotante-signo">?</span>
        </button>
      )}

      {modalAyuda && (
        <div className="rg-modal-fondo" onClick={() => setModalAyuda(false)}>
          <div className="rg-modal aprox-modal-ayuda" onClick={(e) => e.stopPropagation()}>
            <div className="aprox-modal-header">
              <span className="aprox-modal-signo-title">?</span>
              <h3>¿Cómo se juega a La vida en colores?</h3>
            </div>

            <div className="aprox-modal-cuerpo">
              <p><strong>1. Dinámica del juego:</strong></p>
              <ul>
                <li>Participan de <strong>3 a 15 jugadores</strong>. La partida dura un máximo de <strong>25 rondas</strong>.</li>
                <li>Cada ronda muestra un elemento mítico y el <strong>número exacto de colores</strong> que debes adivinar.</li>
                <li>Todos los jugadores responden simultáneamente en sus propios dispositivos en secreto.</li>
                <li>Tienes <strong>45 segundos</strong> para responder por turno.</li>
              </ul>
              <p><strong>2. Puntuación:</strong></p>
              <div className="aprox-tabla-puntos">
                <div className="aprox-puntos-fila acierto">
                  <span>🎯 Color acertado</span>
                  <strong>+1 punto por cada color correcto</strong>
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
              <Icon name="star" size={42} strokeWidth={1.6} />
            </span>
            <h1 className="title">La vida en colores</h1>
            <p className="hint">
              Adivina los colores exactos de logotipos, personajes y banderas. El anfitrión crea la sala y comparte el código.
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
              <label className="field-label" htmlFor="col-host-nombre">Tu nombre</label>
              <input
                id="col-host-nombre"
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
              <label className="field-label" htmlFor="col-code-input">Código de la sala</label>
              <input
                id="col-code-input"
                className="lb-input-codigo"
                type="text"
                placeholder="ABCD"
                value={codigoInput}
                onChange={(e) => setCodigoInput(e.target.value.toUpperCase())}
                maxLength={4}
                style={{ textTransform: 'uppercase', letterSpacing: '4px', textAlign: 'center', fontWeight: '800' }}
                autoFocus
              />

              <label className="field-label" htmlFor="col-guest-nombre" style={{ marginTop: '1rem' }}>Tu nombre</label>
              <input
                id="col-guest-nombre"
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
                <div key={j.id} className={`lb-jug ${j.id === sala.yoId ? 'yo' : ''}`}>
                  <span className="lb-jug-nombre">
                    {j.nombre}{j.id === sala.yoId ? ' (tú)' : ''}{j.id === 1 ? ' 👑' : ''}
                  </span>
                </div>
              ))}
            </div>
            {sala.jugadores.length < 2 && (
              <p className="hint" style={{ marginTop: '0.8rem' }}>
                Falta al menos 1 jugador más para poder empezar.
              </p>
            )}
          </div>

          {esAdmin ? (
            <div style={{ marginTop: '1.2rem' }}>
              <button
                className="big full"
                disabled={sala.jugadores.length < 2}
                onClick={handleIniciarJuego}
              >
                <Icon name="play" size={22} />
                {sala.jugadores.length < 2 ? 'Esperando jugadores...' : '¡Empezar Partida (25 Rondas)!'}
              </button>
            </div>
          ) : (
            <div className="panel center" style={{ padding: '2rem 1.5rem', marginTop: '1rem' }}>
              <span className="lb-luna chica"><Icon name="hourglass" size={40} /></span>
              <h3 style={{ margin: '0.5rem 0' }}>Esperando al anfitrión...</h3>
              <p className="hint">En cuanto comience la partida, verás el primer elemento para elegir sus colores.</p>
            </div>
          )}

          <div className="actions" style={{ marginTop: '1rem' }}>
            <button className="secondary danger full" onClick={() => setModalSalir(true)}>
              <Icon name="door" size={20} /> Salir de la sala
            </button>
          </div>
        </section>
      )}

      {/* 5. SALA: JUGANDO ONLINE */}
      {vista === 'sala' && sala && sala.estado === 'jugando' && ronda && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="flagFinish" size={18} />Ronda {sala.rondaActualIdx + 1} de {sala.totalRondas}</span>
            <span className="chip alt">
              <Icon name="check" size={18} /> {ronda.totalRespondieron} / {ronda.totalJugadores} listos
            </span>
          </div>

          {ronda.estadoRonda === 'votando' ? (
            <>
              <div className="panel aprox-pregunta-card" style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.6rem' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      padding: '0.45rem 1.3rem',
                      borderRadius: '9999px',
                      backgroundColor: '#fef3c7',
                      border: '2px solid #f59e0b',
                      color: '#b45309',
                      fontSize: '1rem',
                      fontWeight: 800,
                      boxShadow: '0 2px 6px rgba(245, 158, 11, 0.2)'
                    }}
                  >
                    🎨 Debes elegir exactamente {ronda.numColores} {ronda.numColores === 1 ? 'color' : 'colores'}
                  </span>
                </div>
                <h2 className="aprox-pregunta-texto" style={{ fontSize: '1.65rem', margin: '0.6rem 0' }}>
                  {ronda.item}
                </h2>
                <p className="field-label">
                  Marca los {ronda.numColores} colores característicos de este elemento en tu pantalla:
                </p>
              </div>

              {!ronda.yaRespondio ? (
                <>
                  {/* Temporizador de 45 segundos */}
                  <div
                    className="timer"
                    role="timer"
                    style={{ margin: '0.6rem 0 0.3rem', background: '#e2e8f0', borderRadius: '9999px', height: '8px', overflow: 'hidden' }}
                  >
                    <div
                      className={`timer-bar ${tiempoRestante <= 10 ? 'low' : ''}`}
                      style={{
                        width: `${(tiempoRestante / TIEMPO_TURNO) * 100}%`,
                        height: '100%',
                        backgroundColor: tiempoRestante <= 10 ? '#ef4444' : '#16a34a',
                        borderRadius: '9999px',
                        transition: 'width 0.1s linear, background-color 0.3s ease'
                      }}
                    />
                  </div>
                  <p
                    className="timer-text"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                      color: tiempoRestante <= 10 ? '#dc2626' : '#64748b', fontSize: '0.9rem', fontWeight: 700, margin: '0 0 1rem'
                    }}
                  >
                    <Icon name="clock" size={16} />
                    {tiempoRestante} s
                  </p>

                  <div className="panel">
                    <style>{`
                      .colores-grid button.colores-tarjeta-solida {
                        background-image: none !important;
                        padding: 0.9rem 0.5rem !important;
                        border-radius: 14px !important;
                        min-height: 56px !important;
                        display: flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        font-weight: 800 !important;
                        font-size: 1.05rem !important;
                        cursor: pointer !important;
                        position: relative !important;
                        letter-spacing: 0.3px !important;
                        transition: transform 0.15s ease, box-shadow 0.15s ease !important;
                      }
                      .colores-grid button.color-btn-rojo { background-color: #ef4444 !important; background: #ef4444 !important; color: #ffffff !important; border: 2.5px solid #dc2626 !important; }
                      .colores-grid button.color-btn-azul { background-color: #2563eb !important; background: #2563eb !important; color: #ffffff !important; border: 2.5px solid #1d4ed8 !important; }
                      .colores-grid button.color-btn-amarillo { background-color: #eab308 !important; background: #eab308 !important; color: #0f172a !important; border: 2.5px solid #ca8a04 !important; }
                      .colores-grid button.color-btn-verde { background-color: #16a34a !important; background: #16a34a !important; color: #ffffff !important; border: 2.5px solid #15803d !important; }
                      .colores-grid button.color-btn-naranja { background-color: #ea580c !important; background: #ea580c !important; color: #ffffff !important; border: 2.5px solid #c2410c !important; }
                      .colores-grid button.color-btn-morado { background-color: #9333ea !important; background: #9333ea !important; color: #ffffff !important; border: 2.5px solid #7e22ce !important; }
                      .colores-grid button.color-btn-marron { background-color: #78350f !important; background: #78350f !important; color: #ffffff !important; border: 2.5px solid #451a03 !important; }
                      .colores-grid button.color-btn-blanco { background-color: #ffffff !important; background: #ffffff !important; color: #0f172a !important; border: 2.5px solid #94a3b8 !important; }
                      .colores-grid button.color-btn-negro { background-color: #0f172a !important; background: #0f172a !important; color: #ffffff !important; border: 2.5px solid #000000 !important; }
                      .colores-grid button.color-btn-gris { background-color: #64748b !important; background: #64748b !important; color: #ffffff !important; border: 2.5px solid #475569 !important; }
                      .colores-grid button.color-btn-rosa { background-color: #ec4899 !important; background: #ec4899 !important; color: #ffffff !important; border: 2.5px solid #db2777 !important; }

                      .colores-grid button.colores-tarjeta-solida.seleccionado {
                        transform: scale(1.05) !important;
                        box-shadow: 0 0 0 3px #ffffff, 0 0 0 6px #2563eb, 0 6px 16px rgba(0, 0, 0, 0.35) !important;
                      }
                    `}</style>
                    <div className="colores-grid">
                      {PALETA_COLORES.map((col) => {
                        const activo = misColoresSeleccionados.includes(col.id);
                        return (
                          <button
                            key={col.id}
                            type="button"
                            className={`colores-tarjeta-solida color-btn-${col.id} ${activo ? 'seleccionado' : ''}`}
                            onClick={() => toggleColorOnline(col.id)}
                          >
                            <span>{col.nombre}</span>
                            {activo && (
                              <span
                                style={{
                                  position: 'absolute',
                                  top: '4px',
                                  right: '6px',
                                  backgroundColor: col.id === 'blanco' || col.id === 'amarillo' ? '#0f172a' : '#ffffff',
                                  color: col.id === 'blanco' || col.id === 'amarillo' ? '#ffffff' : '#0f172a',
                                  borderRadius: '9999px',
                                  width: '22px',
                                  height: '22px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.8rem',
                                  fontWeight: 900,
                                  boxShadow: '0 2px 5px rgba(0,0,0,0.35)'
                                }}
                              >
                                ✓
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    className="big full"
                    disabled={misColoresSeleccionados.length !== ronda.numColores}
                    onClick={() => handleEnviarRespuesta(false)}
                  >
                    <Icon name="check" size={22} />
                    {misColoresSeleccionados.length === ronda.numColores
                      ? 'Confirmar selección'
                      : `Selecciona ${ronda.numColores - misColoresSeleccionados.length} más`}
                  </button>
                </>
              ) : (
                <div className="panel center" style={{ padding: '2rem 1.5rem' }}>
                  <span className="badge" style={{ background: '#dcfce7', color: '#166534', fontSize: '1.05rem', padding: '0.5rem 1.2rem' }}>
                    ✅ ¡Has enviado tus colores!
                  </span>

                  <p className="hint" style={{ marginTop: '1.2rem' }}>
                    Esperando a los demás jugadores ({ronda.totalRespondieron} de {ronda.totalJugadores})...
                  </p>

                  <div className="scoreboard-container" style={{ justifyContent: 'center', marginTop: '1rem' }}>
                    {sala.jugadores.map((j) => (
                      <div key={j.id} className="score-pill">
                        <span>{j.nombre}</span>
                        <span style={{ marginLeft: '6px' }}>{j.haRespondido ? '✅' : '⏳'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {esAdmin && (
                <div style={{ marginTop: '1rem' }}>
                  <button className="secondary full" onClick={handleCerrarRonda}>
                    <Icon name="check" size={18} /> Cerrar ronda y ver resultados ya
                  </button>
                </div>
              )}
            </>
          ) : (
            resultadoRonda && (
              <div className="end-card aprox-resolucion-card">
                <span className="end-icon"><Icon name="trophy" size={44} /></span>
                <p className="categoria">{resultadoRonda.item}</p>
                <h1 className="title" style={{ fontSize: '1.35rem' }}>Colores correctos:</h1>

                <div className="colores-resolucion-correctos">
                  {resultadoRonda.coloresCorrectos.map((colId) => {
                    const cObj = PALETA_COLORES.find((p) => p.id === colId);
                    return (
                      <div key={colId} className="colores-pill-acierto">
                        <span
                          className="colores-circulo-mini"
                          style={{ backgroundColor: cObj?.hex, border: cObj?.borde ? '1px solid #94a3b8' : 'none' }}
                        />
                        <span>{cObj?.nombre || colId}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="aprox-resolucion-lista" style={{ marginTop: '1.2rem', width: '100%' }}>
                  {resultadoRonda.desglose.map((d) => (
                    <div key={d.id} className="aprox-fila-resultado intermedia" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'stretch' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong>{d.jugador} {d.id === sala.yoId ? '(Tú)' : ''}</strong>
                        <span className="aprox-badge-pts" style={{ background: d.aciertos > 0 ? '#10b981' : '#64748b' }}>
                          +{d.aciertos} {d.aciertos === 1 ? 'pt' : 'pts'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        {d.elegidos.map((colId) => {
                          const esAcierto = resultadoRonda.coloresCorrectos.includes(colId);
                          const cObj = PALETA_COLORES.find((p) => p.id === colId);
                          return (
                            <span key={colId} className={`colores-tag-elegido ${esAcierto ? 'acierto' : 'fallo'}`}>
                              <span
                                className="colores-circulo-micro"
                                style={{ backgroundColor: cObj?.hex }}
                              />
                              {cObj?.nombre || colId} {esAcierto ? '✓' : '✗'}
                            </span>
                          );
                        })}
                      </div>
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
                          {j.nombre} {j.id === sala.yoId ? '(Tú)' : ''}
                        </span>
                        <span className="score-pts">{pts} pts</span>
                      </div>
                    );
                  })}
                </div>

                <div className="round-finished-actions" style={{ marginTop: '1.5rem', width: '100%' }}>
                  {esAdmin ? (
                    <>
                      {sala.rondaActualIdx + 1 < sala.totalRondas ? (
                        <button className="btn-start" onClick={handleSiguienteRonda}>
                          Siguiente ronda ({sala.rondaActualIdx + 2} de {sala.totalRondas}) ➔
                        </button>
                      ) : (
                        <button className="btn-start" onClick={handleFinalizarPartida}>
                          Ver resultados finales 🏆
                        </button>
                      )}
                      <button className="btn-secondary-action" onClick={handleFinalizarPartida}>
                        Finalizar juego
                      </button>
                    </>
                  ) : (
                    <p className="hint center">Esperando a que el anfitrión avance a la siguiente ronda...</p>
                  )}
                </div>
              </div>
            )
          )}

          <div className="actions" style={{ marginTop: '1.2rem' }}>
            <button className="secondary danger full" onClick={() => setModalSalir(true)}>
              <Icon name="door" size={20} /> Salir de la sala
            </button>
          </div>
        </section>
      )}

      {/* 6. SALA: PODIO FINAL */}
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
                      {j.nombre} {j.id === sala.yoId ? '(Tú)' : ''}
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