// client/src/games/FootballSplit/FootballSplitOnline.jsx
import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../components/Icon.jsx';
import './FootballSplit.css';
import '../Adivina/Adivina.css';

const CLAVE_SESION_FS = 'footballsplit_online_session';

export default function FootballSplitOnline({ onLocal }) {
  const [vista, setVista] = useState('menu');
  const [nombre, setNombre] = useState('');
  const [codigoInput, setCodigoInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);

  const [inputStr, setInputStr] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [pistasTexto, setPistasTexto] = useState({ top: null, middle: null, bottom: null });
  const [pistasAbiertas, setPistasAbiertas] = useState({ top: false, middle: false, bottom: false });

  const [modalAyuda, setModalAyuda] = useState(false);
  const [modalSalir, setModalSalir] = useState(false);
  const [codigoCopiado, setCodigoCopiado] = useState(false);

  const [sesion, setSesion] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(CLAVE_SESION_FS));
    } catch {
      return null;
    }
  });

  const [sala, setSala] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!sesion) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setSala(null);
      return;
    }
    const consultarEstado = () => {
      fetch(`/api/footballsplit/online/sala/${sesion.code}?token=${sesion.token}`)
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
          sessionStorage.removeItem(CLAVE_SESION_FS);
          setSesion(null);
          setSala(null);
          setVista('menu');
        });
    };
    consultarEstado();
    intervalRef.current = setInterval(consultarEstado, 800);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sesion]);

  // Limpiar pistas locales cuando cambia el reto
  useEffect(() => {
    setPistasTexto({ top: null, middle: null, bottom: null });
    setPistasAbiertas({ top: false, middle: false, bottom: false });
  }, [sala?.retoActual?.id]);

  const apiFetch = async (endpoint, payload) => {
    const res = await fetch(`/api/footballsplit/online/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  };

  const handleCrear = async () => {
    if (!nombre.trim()) return;
    setCargando(true);
    try {
      const data = await apiFetch('crear', { nombre: nombre.trim() });
      if (!data.success) throw new Error(data.error);
      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_FS, JSON.stringify(nueva));
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
    try {
      const data = await apiFetch('unirse', { code: codigoInput.trim().toUpperCase(), nombre: nombre.trim() });
      if (!data.success) throw new Error(data.error);
      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_FS, JSON.stringify(nueva));
      setSesion(nueva);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setCargando(false);
    }
  };

  const accionSala = async (accion, extra = {}) => {
    return apiFetch(`sala/${sesion.code}/${accion}`, { token: sesion.token, ...extra });
  };

  const handleSalir = () => {
    if (sala) {
      accionSala('abandonar').catch(() => console.error('Error al abandonar sala'));
    }
    sessionStorage.removeItem(CLAVE_SESION_FS);
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

  const validarRespuesta = async (e) => {
    e.preventDefault();
    if (!inputStr.trim() || !esMiTurno) return;

    const response = await accionSala('validar', { respuesta: inputStr });
    if (response.acierto) {
      setFeedback({ tipo: 'success', msj: '¡Acierto!' });
    } else {
      setFeedback({ tipo: 'error', msj: 'Incorrecto. Cambio de turno.' });
    }
    setInputStr('');
    setTimeout(() => setFeedback(null), 1500);
  };

  const togglePista = async (parte) => {
    if (sala?.estadoReto?.[parte]) return;

    // Si ya tenemos la pista cargada, alternamos su visibilidad sin gastar más intentos
    if (pistasTexto[parte]) {
      setPistasAbiertas((prev) => ({ ...prev, [parte]: !prev[parte] }));
      return;
    }

    // Si la pista ya viene en retoActual, o la pedimos al servidor
    const res = await accionSala('pista', { parte });
    const texto = res?.pista || sala?.retoActual?.partes?.[parte]?.pista;
    if (texto) {
      setPistasTexto((prev) => ({ ...prev, [parte]: texto }));
      setPistasAbiertas((prev) => ({ ...prev, [parte]: true }));
    }
  };

  const getEstiloImagen = (seccion) => {
    let offsetFranja = -16;
    if (seccion === 'middle') offsetFranja = -136;
    if (seccion === 'bottom') offsetFranja = -256;

    return {
      position: 'absolute',
      left: '50%',
      top: `${offsetFranja}px`,
      width: '420px',
      height: '420px',
      maxWidth: 'none',
      transform: 'translateX(-50%)',
      objectFit: 'contain',
      pointerEvents: 'none',
      userSelect: 'none'
    };
  };

  const esAdmin = sala?.esAdmin;
  const esMiTurno = sala?.turnoId === sala?.yoId;
  const jugadorTurnoNombre = sala?.jugadores.find((j) => j.id === sala?.turnoId)?.nombre;
  const mostrarAyuda =
    vista === 'menu' || vista === 'crear' || vista === 'unirse' || (vista === 'sala' && sala?.estado === 'lobby');

  return (
    <div className="rk-contenedor">
      {mostrarAyuda && (
        <button type="button" className="btn-ayuda-flotante" onClick={() => setModalAyuda(true)} title="Reglas">
          <span className="btn-ayuda-flotante-signo">?</span>
        </button>
      )}

      {modalAyuda && (
        <div className="rg-modal-fondo" onClick={() => setModalAyuda(false)}>
          <div className="rg-modal aprox-modal-ayuda" onClick={(e) => e.stopPropagation()}>
            <div className="aprox-modal-header">
              <span className="aprox-modal-signo-title">?</span>
              <h3>¿Cómo jugar a Football Split?</h3>
            </div>
            <div className="aprox-modal-cuerpo">
              <p>Se mostrará una cara formada por <strong>3 futbolistas diferentes</strong> (pelo, ojos y barbilla).</p>
              <ul>
                <li>Jugáis <strong>en equipo</strong> y tenéis <strong>20 intentos</strong> en total.</li>
                <li>En cada turno, el jugador activo debe escribir el nombre de uno de los 3 jugadores.</li>
                <li>Pulsa el botón <strong>«?»</strong> de cualquier franja para desplegar su pista (consume 1 intento).</li>
              </ul>
            </div>
            <div className="rg-modal-acciones">
              <button className="big full" onClick={() => setModalAyuda(false)}>Entendido</button>
            </div>
          </div>
        </div>
      )}

      {vista === 'menu' && (
        <section className="game">
          <div className="panel center">
            <span className="lb-luna chica">
              <Icon name="users" size={42} strokeWidth={1.6} />
            </span>
            <h1 className="title">Football Split</h1>
            <p className="hint">Adivina los 3 jugadores que forman la cara cooperando con tus amigos.</p>
            {errorMsg && <p className="error">{errorMsg}</p>}
            <div className="lb-menu">
              <button className="big full" onClick={() => { setVista('crear'); setErrorMsg(''); }}>
                <Icon name="crown" size={22} /> Crear partida Online
              </button>
              <button className="big full" onClick={() => { setVista('unirse'); setErrorMsg(''); }}>
                <Icon name="users" size={22} /> Unirse con código
              </button>
              <button className="secondary full" onClick={onLocal}>
                <Icon name="home" size={20} /> Jugar en Local (Mismo dispositivo)
              </button>
            </div>
          </div>
        </section>
      )}

      {vista === 'crear' && (
        <section className="game">
          <div className="panel center">
            <h2 className="title">Crear sala Online</h2>
            <div className="lb-form" style={{ marginTop: '1.2rem', textAlign: 'left' }}>
              <input
                type="text"
                placeholder="Tu nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                maxLength={20}
                autoFocus
              />
              <button className="big full" style={{ marginTop: '1rem' }} disabled={cargando || !nombre.trim()} onClick={handleCrear}>
                Crear sala
              </button>
              <button className="secondary full" style={{ marginTop: '0.6rem' }} onClick={() => setVista('menu')}>
                Volver
              </button>
            </div>
          </div>
        </section>
      )}

      {vista === 'unirse' && (
        <section className="game">
          <div className="panel center">
            <h2 className="title">Unirse a partida</h2>
            <div className="lb-form" style={{ marginTop: '1.2rem', textAlign: 'left' }}>
              <input
                type="text"
                placeholder="CÓDIGO"
                value={codigoInput}
                onChange={(e) => setCodigoInput(e.target.value.toUpperCase())}
                maxLength={4}
                style={{ textTransform: 'uppercase', letterSpacing: '4px', textAlign: 'center', fontWeight: '800' }}
                autoFocus
              />
              <input
                type="text"
                placeholder="Tu nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                maxLength={20}
                style={{ marginTop: '0.8rem' }}
              />
              <button
                className="big full"
                style={{ marginTop: '1rem' }}
                disabled={cargando || !nombre.trim() || codigoInput.trim().length < 4}
                onClick={handleUnirse}
              >
                Entrar a la sala
              </button>
              <button className="secondary full" style={{ marginTop: '0.6rem' }} onClick={() => setVista('menu')}>
                Volver
              </button>
            </div>
          </div>
        </section>
      )}

      {vista === 'sala' && sala?.estado === 'lobby' && (
        <section className="game">
          <div className="panel center">
            <p
              className="categoria"
              style={{
                display: 'inline-flex',
                padding: '0.3rem 0.8rem',
                borderRadius: '12px',
                alignItems: 'center',
                gap: '0.3rem',
                color: '#059669',
                background: '#dcfce7',
                border: '1px solid #34d399',
                fontSize: '0.85rem',
                fontWeight: 'bold'
              }}
            >
              <Icon name="lock" size={16} /> Sala de espera
            </p>
            <p className="hint" style={{ marginTop: '0.8rem', marginBottom: '0.2rem' }}>Código de la partida</p>
            <div
              style={{
                display: 'inline-block',
                border: '2px dashed #3b82f6',
                borderRadius: '16px',
                background: '#eff6ff',
                padding: '1rem 2.5rem',
                margin: '0.5rem 0'
              }}
            >
              <h2
                style={{ fontSize: '3.5rem', margin: '0', letterSpacing: '8px', color: '#1d4ed8', fontWeight: '900', cursor: 'pointer' }}
                onClick={copiarCodigo}
              >
                {sala.code}
              </h2>
            </div>
            <p className="hint small" style={{ fontStyle: 'italic', marginBottom: '0' }}>
              {codigoCopiado ? '¡Copiado al portapapeles!' : 'Comparte este código para que se unan (2 a 15 jugadores).'}
            </p>
          </div>

          <div className="panel" style={{ marginTop: '1rem' }}>
            <h3 className="panel-title">
              <Icon name="users" size={20} /> Jugadores ({sala.jugadores.length}/15)
            </h3>
            <div className="lb-lista">
              {sala.jugadores.map((j) => (
                <div key={j.id} className={`lb-jug ${j.id === sala.yoId ? 'yo' : ''}`}>
                  <span className="lb-jug-nombre">
                    {j.nombre}
                    {j.id === sala.yoId ? ' (Tú)' : ''}
                    {j.id === sala.adminId ? ' 👑' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1.2rem' }}>
            {esAdmin ? (
              <button className="big full" disabled={sala.jugadores.length < 2} onClick={() => accionSala('iniciar')}>
                ¡Empezar Partida!
              </button>
            ) : (
              <p className="hint center">Esperando al anfitrión...</p>
            )}
            <button className="secondary danger full" onClick={() => setModalSalir(true)}>
              Salir de la sala
            </button>
          </div>
        </section>
      )}

      {vista === 'sala' && sala?.estado === 'jugando' && (
        <section className="game">
          <div className="hud space-between">
            <span className="chip">
              <Icon name="users" size={18} /> Turno: <strong>{jugadorTurnoNombre}</strong>
            </span>
            {esAdmin && (
              <button
                className="secondary danger"
                style={{ padding: '0.3rem 0.8rem', fontSize: '0.85rem' }}
                onClick={() => accionSala('rendirse')}
              >
                Rendirse
              </button>
            )}
          </div>

          <form onSubmit={validarRespuesta} style={{ display: 'flex', gap: '0.5rem', margin: '1rem 0' }}>
            <input
              type="text"
              placeholder={esMiTurno ? 'Escribe un jugador...' : 'Espera tu turno...'}
              value={inputStr}
              onChange={(e) => setInputStr(e.target.value)}
              disabled={!esMiTurno}
              autoFocus={esMiTurno}
              style={{ flex: 1, padding: '0.8rem', borderRadius: '20px', border: '2px solid #cbd5e1' }}
            />
            <button type="submit" className="ok" disabled={!esMiTurno || !inputStr.trim()}>
              Probar
            </button>
          </form>

          {feedback && (
            <div
              style={{
                textAlign: 'center',
                padding: '0.5rem',
                background: feedback.tipo === 'success' ? '#dcfce7' : '#fee2e2',
                color: feedback.tipo === 'success' ? '#15803d' : '#991b1b',
                borderRadius: '8px',
                marginBottom: '1rem',
                fontWeight: 'bold'
              }}
            >
              {feedback.msj}
            </div>
          )}

          <div className="fs-split-container">
            {['top', 'middle', 'bottom'].map((p) => (
              <div key={p} className={`fs-slice ${sala.estadoReto[p] ? 'solved' : ''}`}>
                {sala.retoActual.partes[p].img && (
                  <img
                    src={sala.retoActual.partes[p].img}
                    alt={p}
                    style={getEstiloImagen(p)}
                  />
                )}

                <button
                  type="button"
                  className="fs-slice-status"
                  disabled={sala.estadoReto[p]}
                  onClick={() => togglePista(p)}
                  title={sala.estadoReto[p] ? 'Acertado' : 'Ver pista (-1 intento)'}
                >
                  {sala.estadoReto[p] ? <Icon name="check" size={16} /> : '?'}
                </button>

                {!sala.estadoReto[p] && pistasAbiertas[p] && pistasTexto[p] && (
                  <div className="fs-slice-pista-box" onClick={() => togglePista(p)}>
                    <span>💡 {pistasTexto[p]}</span>
                  </div>
                )}

                {sala.estadoReto[p] && <div className="fs-solved-name">{sala.retoActual.partes[p].jugador}</div>}
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <div className="fs-attempts">Intentos {sala.intentos}/20</div>
          </div>
        </section>
      )}

      {vista === 'sala' && (sala?.estado === 'victoria' || sala?.estado === 'derrota') && (
        <section className="game">
          <div className="end-card">
            <span className="end-icon">
              <Icon name={sala.estado === 'victoria' ? 'trophy' : 'close'} size={48} />
            </span>
            <h1 className="title">{sala.estado === 'victoria' ? '¡Lo habéis logrado!' : '¡Fin del juego!'}</h1>
            <p className="hint">Usasteis {sala.intentos} intentos.</p>

            <div style={{ margin: '1.5rem 0', background: '#f1f5f9', padding: '1rem', borderRadius: '12px', textAlign: 'left', color: '#1e293b' }}>
              <h3 style={{ marginBottom: '0.8rem' }}>La solución era:</h3>
              <p><strong>Pelo:</strong> {sala.retoActual?.partes.top.jugador}</p>
              <p><strong>Ojos:</strong> {sala.retoActual?.partes.middle.jugador}</p>
              <p><strong>Barbilla:</strong> {sala.retoActual?.partes.bottom.jugador}</p>
            </div>
          </div>
          <div className="actions" style={{ marginTop: '1.5rem' }}>
            {esAdmin && (
              <button className="big full" onClick={() => accionSala('volver')}>
                <Icon name="refresh" size={20} /> Volver al Lobby
              </button>
            )}
            <button className="secondary danger full" onClick={() => setModalSalir(true)}>
              <Icon name="door" size={20} /> Salir al menú
            </button>
          </div>
        </section>
      )}

      {modalSalir && (
        <div className="rg-modal-fondo" onClick={() => setModalSalir(false)}>
          <div className="rg-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px', textAlign: 'center', padding: '1.8rem 1.4rem' }}>
            <h3 style={{ margin: '0 0 0.6rem', color: '#1e1b4b', fontSize: '1.3rem' }}>¿Abandonar la partida?</h3>
            <p className="hint" style={{ fontSize: '0.95rem', marginBottom: '1.4rem' }}>
              Si sales de la sala perderás tu progreso actual en la partida.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginTop: '1rem' }}>
              <button type="button" className="secondary full" onClick={() => setModalSalir(false)}>
                Quedarme
              </button>
              <button type="button" className="secondary danger full" onClick={() => { setModalSalir(false); handleSalir(); }}>
                Sí, salir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}