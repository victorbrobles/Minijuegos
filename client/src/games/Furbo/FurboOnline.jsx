// client/src/games/Furbo/FurboOnline.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Icon from '../../components/Icon.jsx';
import FurboPartida from './FurboPartida.jsx';
import { AyudaFurbo, ConfigPartida } from './FurboComun.jsx';
import './Furbo.css';
import '../Adivina/Adivina.css';

const CLAVE_SESION_FURBO = 'furbo_online_session';
const MAX_JUGADORES = 20;
const API = '/api/furbo/online';

const postJSON = (url, body) =>
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

export default function FurboOnline({ onLocal }) {
  const [vista, setVista] = useState('menu'); // 'menu' | 'crear' | 'unirse' | 'sala'
  const [nombre, setNombre] = useState('');
  const [codigoInput, setCodigoInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);
  const [modalSalir, setModalSalir] = useState(false);
  const [codigoCopiado, setCodigoCopiado] = useState(false);

  const [sesion, setSesion] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(CLAVE_SESION_FURBO));
    } catch {
      return null;
    }
  });
  const [sala, setSala] = useState(null);
  const intervalRef = useRef(null);

  // ---- Polling de sincronización (cada 500 ms, como el resto de juegos)
  useEffect(() => {
    if (!sesion) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setSala(null);
      return undefined;
    }

    const consultarEstado = () => {
      fetch(`${API}/sala/${sesion.code}?token=${sesion.token}`)
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
          sessionStorage.removeItem(CLAVE_SESION_FURBO);
          setSesion(null);
          setSala(null);
          setVista('menu');
          setErrorMsg('La sala se ha cerrado.');
        });
    };

    consultarEstado();
    intervalRef.current = setInterval(consultarEstado, 500);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sesion]);

  const guardarSesion = (data) => {
    const nueva = { code: data.code, token: data.token };
    sessionStorage.setItem(CLAVE_SESION_FURBO, JSON.stringify(nueva));
    setSesion(nueva);
  };

  const handleCrear = async () => {
    if (!nombre.trim()) return;
    setCargando(true);
    try {
      const res = await postJSON(`${API}/crear`, { nombre: nombre.trim() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      guardarSesion(data);
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
      const res = await postJSON(`${API}/unirse`, { code: codigoInput.trim().toUpperCase(), nombre: nombre.trim() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      guardarSesion(data);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleConfig = async (config) => {
    // Cambio inmediato en pantalla; el servidor lo confirma en el siguiente sondeo
    setSala((s) => (s ? { ...s, config } : s));
    try {
      await postJSON(`${API}/sala/${sesion.code}/config`, { token: sesion.token, config });
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleIniciar = async () => {
    try {
      const res = await postJSON(`${API}/sala/${sesion.code}/iniciar`, { token: sesion.token });
      if (!res.ok) {
        const data = await res.json();
        setErrorMsg(data.error);
      }
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const enviarAccion = useCallback(async (accion) => {
    if (!sesion) return;
    try {
      await postJSON(`${API}/sala/${sesion.code}/accion`, { token: sesion.token, accion });
    } catch (err) {
      console.error(err);
    }
  }, [sesion]);

  const handleReiniciar = async () => {
    try {
      await postJSON(`${API}/sala/${sesion.code}/reiniciar`, { token: sesion.token });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSalir = async () => {
    try {
      await postJSON(`${API}/sala/${sesion.code}/salir`, { token: sesion.token });
    } catch {
      /* ignorado: se sale igualmente */
    }
    sessionStorage.removeItem(CLAVE_SESION_FURBO);
    setSesion(null);
    setSala(null);
    setErrorMsg('');
    setVista('menu');
  };

  const copiarCodigo = () => {
    if (!sala?.code) return;
    navigator.clipboard?.writeText(sala.code);
    setCodigoCopiado(true);
    setTimeout(() => setCodigoCopiado(false), 2000);
  };

  const esAdmin = sala?.esAdmin;
  const yoId = sala?.yoId;
  const enMenus = vista === 'menu' || vista === 'crear' || vista === 'unirse' || (vista === 'sala' && sala?.estado === 'lobby');

  return (
    <div className="furbo-contenedor">
      {enMenus && <AyudaFurbo online />}

      {/* 1. MENÚ ONLINE */}
      {vista === 'menu' && (
        <section className="game">
          <div className="panel center">
            <span className="lb-luna chica">
              <span style={{ fontSize: '2.4rem', lineHeight: 1 }}>⚽</span>
            </span>
            <h1 className="title">Furbo Online</h1>
            <p className="hint">
              Telepatía, rebotes, quinielas, palabras prohibidas y penaltis. ¡Un partido completo de preguntas de fútbol con tus amigos!
            </p>
            {errorMsg && <p className="error" style={{ margin: '0.8rem 0' }}>{errorMsg}</p>}

            <div className="lb-menu">
              <button className="big full" onClick={() => { setVista('crear'); setErrorMsg(''); }}>
                <Icon name="crown" size={22} /> Crear partida Online
              </button>
              <button className="big full" onClick={() => { setVista('unirse'); setErrorMsg(''); }}>
                <Icon name="users" size={22} /> Unirse con código
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
            <h2 className="title">Crear sala Online</h2>
            <p className="hint">Introduce tu nombre de anfitrión (hasta {MAX_JUGADORES} jugadores).</p>
            {errorMsg && <p className="error" style={{ margin: '0.8rem 0' }}>{errorMsg}</p>}
            <div className="lb-form" style={{ marginTop: '1.2rem', textAlign: 'left' }}>
              <input
                type="text"
                placeholder="Tu nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                maxLength={20}
                autoFocus
              />
              <button
                className="big full"
                style={{ marginTop: '1rem' }}
                disabled={cargando || !nombre.trim()}
                onClick={handleCrear}
              >
                Crear sala
              </button>
              <button className="secondary full" style={{ marginTop: '0.6rem' }} onClick={() => { setVista('menu'); setErrorMsg(''); }}>
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
            <h2 className="title">Unirse a partida</h2>
            {errorMsg && <p className="error" style={{ margin: '0.8rem 0' }}>{errorMsg}</p>}
            <div className="lb-form" style={{ marginTop: '1.2rem', textAlign: 'left' }}>
              <input
                type="text"
                placeholder="CÓDIGO (4 LETRAS)"
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
              <button className="secondary full" style={{ marginTop: '0.6rem' }} onClick={() => { setVista('menu'); setErrorMsg(''); }}>
                Volver
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 4. LOBBY */}
      {vista === 'sala' && sala && sala.estado === 'lobby' && (
        <section className="game">
          <div className="panel center">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.8rem' }}>
              <span
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
                  padding: '0.35rem 1.1rem', borderRadius: '9999px',
                  border: '1.5px solid #22c55e', backgroundColor: '#f0fdf4', color: '#16a34a',
                  fontSize: '0.85rem', fontWeight: 600, lineHeight: 1
                }}
              >
                <Icon name="lock" size={15} />
                Sala de espera
              </span>
            </div>
            <p className="hint">Código de la partida</p>
            <button type="button" className="qq-codigo-btn" onClick={copiarCodigo} title="Copiar código">
              {sala.code}
            </button>
            <p className="hint small">
              {codigoCopiado ? '¡Copiado al portapapeles!' : `Comparte este código para que se unan (2 a ${MAX_JUGADORES} jugadores).`}
            </p>
          </div>

          <div className="panel" style={{ marginTop: '1rem' }}>
            <h3 className="panel-title"><Icon name="users" size={20} /> Jugadores ({sala.jugadores.length}/{MAX_JUGADORES})</h3>
            <div className="lb-lista">
              {sala.jugadores.map((j, i) => (
                <div key={j.id} className={`lb-jug ${j.id === yoId ? 'yo' : ''}`}>
                  <span className="lb-jug-nombre">
                    {j.nombre}{j.id === yoId ? ' (Tú)' : ''}{i === 0 ? ' 👑' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel" style={{ marginTop: '1rem' }}>
            <h3 className="panel-title">⚽ El partido</h3>
            {!esAdmin && <p className="hint small" style={{ marginBottom: '0.6rem' }}>Lo configura el anfitrión.</p>}
            <ConfigPartida config={sala.config} onChange={esAdmin ? handleConfig : null} />
          </div>

          {errorMsg && <p className="error" style={{ margin: '0.8rem 0' }}>{errorMsg}</p>}

          {esAdmin ? (
            <button
              className="big full"
              style={{ marginTop: '1.2rem' }}
              disabled={sala.jugadores.length < 2}
              onClick={handleIniciar}
            >
              {sala.jugadores.length < 2 ? 'Esperando rivales...' : '¡Pitido inicial!'}
            </button>
          ) : (
            <div className="panel center" style={{ marginTop: '1rem' }}>
              <p className="hint">Esperando a que el anfitrión comience la partida...</p>
            </div>
          )}

          <button className="secondary danger full" style={{ marginTop: '1rem' }} onClick={() => setModalSalir(true)}>
            Salir de la sala
          </button>
        </section>
      )}

      {/* 5. PARTIDA */}
      {vista === 'sala' && sala && sala.estado === 'jugando' && sala.vista && (
        <FurboPartida
          vista={sala.vista}
          viewerId={yoId}
          esHost={Boolean(esAdmin)}
          onAccion={enviarAccion}
          pie={(
            <button className="secondary danger full" style={{ marginTop: '1.2rem' }} onClick={() => setModalSalir(true)}>
              Salir de la sala
            </button>
          )}
          finalAcciones={(
            <div className="actions">
              {esAdmin ? (
                <button onClick={handleReiniciar}>
                  <Icon name="refresh" size={20} /> Volver a la sala
                </button>
              ) : (
                <p className="hint center" style={{ width: '100%' }}>Esperando a que el anfitrión vuelva a la sala...</p>
              )}
              <button className="secondary danger" onClick={() => setModalSalir(true)}>
                <Icon name="door" size={20} /> Salir
              </button>
            </div>
          )}
        />
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
            <h3 style={{ margin: '0 0 0.6rem', color: '#1e1b4b', fontSize: '1.3rem' }}>¿Abandonar la partida?</h3>
            <p className="hint" style={{ fontSize: '0.95rem', marginBottom: '1.4rem', lineHeight: '1.4' }}>
              Si sales de la sala perderás tu progreso actual en la partida. ¿Estás seguro de que deseas salir?
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <button type="button" className="secondary full" onClick={() => setModalSalir(false)}>
                No, quedarme
              </button>
              <button
                type="button"
                className="secondary danger full"
                style={{ background: '#ef4444', color: '#ffffff', borderColor: '#dc2626' }}
                onClick={() => { setModalSalir(false); handleSalir(); }}
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
