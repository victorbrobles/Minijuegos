// client/src/games/Jugadas/JugadasOnline.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Icon from '../../components/Icon.jsx';
import JugadasPartida from './JugadasPartida.jsx';
import { AyudaJugadas } from './JugadasComun.jsx';
import './Jugadas.css';
import '../Adivina/Adivina.css';
import { MenuInicioJuego, MenuModoOnline, FormCrearSala, FormUnirseSala, CabeceraSala, ListaSala, EsperandoAnfitrion } from '../../components/MenuJuego.jsx';

const CLAVE_SESION_JUGADAS = 'jugadas_online_session';
const MAX_JUGADORES = 12;
const API = '/api/jugadas/online';

const postJSON = (url, body) =>
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

export default function JugadasOnline({ onLocal }) {
  const [vista, setVista] = useState('menu'); // 'menu' | 'crear' | 'unirse' | 'sala'
  const [nombre, setNombre] = useState('');
  const [codigoInput, setCodigoInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);
  const [modalSalir, setModalSalir] = useState(false);
  const [modalAyuda, setModalAyuda] = useState(false);
  const [codigoCopiado, setCodigoCopiado] = useState(false);

  const [sesion, setSesion] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(CLAVE_SESION_JUGADAS));
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
          sessionStorage.removeItem(CLAVE_SESION_JUGADAS);
          setSesion(null);
          setSala(null);
          setVista('online_menu');
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
    sessionStorage.setItem(CLAVE_SESION_JUGADAS, JSON.stringify(nueva));
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
      const res = await postJSON(`${API}/unirse`, {
        code: codigoInput.trim().toUpperCase(),
        nombre: nombre.trim()
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      guardarSesion(data);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setCargando(false);
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
      /* ignorado */
    }
    sessionStorage.removeItem(CLAVE_SESION_JUGADAS);
    setSesion(null);
    setSala(null);
    setErrorMsg('');
    setVista('online_menu');
  };

  const copiarCodigo = () => {
    if (!sala?.code) return;
    navigator.clipboard?.writeText(sala.code);
    setCodigoCopiado(true);
    setTimeout(() => setCodigoCopiado(false), 2000);
  };

  const esAdmin = sala?.esAdmin;
  const yoId = sala?.yoId;

  return (
    <div className="furbo-contenedor">
      <AyudaJugadas online abierto={modalAyuda} onCerrar={() => setModalAyuda(false)} />

      {/* 1. MENÚ ONLINE */}
      {vista === 'menu' && (
        <MenuInicioJuego
          juegoId="jugadas"
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
          descripcion="Introduce tu nombre para abrir la sala y ser el anfitrión (2 a 12 jugadores)."
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

      {/* 4. LOBBY */}
      {vista === 'sala' && sala && sala.estado === 'lobby' && (
        <section className="game qq-pantalla">
          <CabeceraSala
            codigo={sala.code}
            onVolver={() => setModalSalir(true)}
            onAyuda={() => setModalAyuda(true)}
            texto={`Pulsa el código para copiarlo y compártelo (2 a ${MAX_JUGADORES} jugadores · 3 rondas por jugador).`}
          />
          <ListaSala
            jugadores={sala.jugadores.map((j, i) => ({ ...j, nombre: `${i + 1}. ${j.nombre}` }))}
            yoId={yoId}
            max={MAX_JUGADORES}
            min={2}
            anfitrionId={sala.jugadores[0]?.id}
          />

          {errorMsg && <p className="error" style={{ margin: '0.8rem 0' }}>{errorMsg}</p>}

          {esAdmin ? (
            <button
              type="button"
              className="big full qq-btn-principal"
              style={{ marginTop: '1.2rem' }}
              disabled={sala.jugadores.length < 2}
              onClick={handleIniciar}
            >
              <Icon name="play" size={22} /> {sala.jugadores.length < 2 ? 'Esperando rivales...' : '¡Comenzar partido!'}
            </button>
          ) : (
            <EsperandoAnfitrion />
          )}
        </section>
      )}

      {/* 5. PARTIDA */}
      {vista === 'sala' && sala && sala.estado === 'jugando' && sala.vista && (
        <JugadasPartida
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

      {/* MODAL SALIR */}
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