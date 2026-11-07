// client/src/games/FutbolGrid/FutbolGridOnline.jsx
import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../components/Icon.jsx';
import './FutbolGrid.css';
import { MenuInicioJuego, MenuModoOnline, FormCrearSala, FormUnirseSala, CabeceraSala, ListaSala, EsperandoAnfitrion } from '../../components/MenuJuego.jsx';

const CLAVE_SESION_GRID = 'futbolgrid_online_session';
const TIEMPO_S = 60;

export default function FutbolGridOnline({ onLocal, onSalir }) {
  const [vista, setVista] = useState('menu'); 
  const [nombre, setNombre] = useState('');
  const [codigoInput, setCodigoInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);
  const [modalSalir, setModalSalir] = useState(false);
  const [modalAyuda, setModalAyuda] = useState(false);
  
  const [celdaActiva, setCeldaActiva] = useState(null);
  const [restante, setRestante] = useState(TIEMPO_S);
  const [respuestaInput, setRespuestaInput] = useState("");
  const [feedback, setFeedback] = useState(null);
  
  const [codigoCopiado, setCodigoCopiado] = useState(false);
  const timerRef = useRef(null);

  const [sesion, setSesion] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem(CLAVE_SESION_GRID)); } catch { return null; }
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
      fetch(`/api/futbolgrid/online/sala/${sesion.code}?token=${sesion.token}`)
        .then((r) => { if (!r.ok) throw new Error('Sala no disponible'); return r.json(); })
        .then((d) => { if (d.success) { setSala(d); setVista('sala'); } })
        .catch(() => {
          sessionStorage.removeItem(CLAVE_SESION_GRID);
          setSesion(null); setSala(null); setVista('online_menu');
        });
    };
    consultarEstado();
    intervalRef.current = setInterval(consultarEstado, 800);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [sesion]);

  const apiFetch = async (endpoint, payload) => {
    const res = await fetch(`/api/futbolgrid/online/${endpoint}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
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
      sessionStorage.setItem(CLAVE_SESION_GRID, JSON.stringify(nueva));
      setSesion(nueva);
    } catch (err) { setErrorMsg(err.message); } finally { setCargando(false); }
  };

  const handleUnirse = async () => {
    if (!nombre.trim() || !codigoInput.trim()) return;
    setCargando(true);
    try {
      const data = await apiFetch('unirse', { code: codigoInput.trim().toUpperCase(), nombre: nombre.trim() });
      if (!data.success) throw new Error(data.error);
      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_GRID, JSON.stringify(nueva));
      setSesion(nueva);
    } catch (err) { setErrorMsg(err.message); } finally { setCargando(false); }
  };

  const accionSala = async (accion, extra = {}) => {
    return apiFetch(`sala/${sesion.code}/${accion}`, { token: sesion.token, ...extra });
  };

  const handleSalir = () => {
    if (sala) {
      accionSala('abandonar').catch(() => console.error("Error al abandonar sala"));
    }
    sessionStorage.removeItem(CLAVE_SESION_GRID);
    setSesion(null);
    setSala(null);
    setVista('online_menu');
  };
  
  const copiarCodigo = () => {
    if (!sala?.code) return;
    navigator.clipboard?.writeText(sala.code);
    setCodigoCopiado(true);
    setTimeout(() => setCodigoCopiado(false), 2000);
  };

  const checkGanador = (nuevoTablero) => {
    const lineas = [[0,1,2], [3,4,5], [6,7,8], [0,3,6], [1,4,7], [2,5,8], [0,4,8], [2,4,6]];
    for (let [a, b, c] of lineas) {
      if (nuevoTablero[a] && nuevoTablero[a] === nuevoTablero[b] && nuevoTablero[a] === nuevoTablero[c]) return nuevoTablero[a];
    }
    if (!nuevoTablero.includes(null)) return 'Empate';
    return null;
  };

  const iniciarTimer = () => {
    setRestante(TIEMPO_S);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setRestante((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          procesarServidorTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  const procesarServidorTimeout = async () => {
    if(!esMiTurno()) return;
    await accionSala('validar', { celda: celdaActiva, resultado: 'fallo' });
    setCeldaActiva(null);
  };

  const abrirCelda = (index) => {
    if (sala.tablero[index] !== null) return;
    if (!esMiTurno()) return; 
    setCeldaActiva(index);
    setRespuestaInput("");
    setFeedback(null);
    iniciarTimer();
  };

  const validarRespuesta = async (e) => {
    e.preventDefault();
    if (!respuestaInput.trim() || !esMiTurno()) return;
    if (timerRef.current) clearInterval(timerRef.current);

    const response = await accionSala('validar', { celda: celdaActiva, jugadorTexto: respuestaInput });
    
    if(response.correcto) {
      setFeedback({ tipo: 'success', msj: '¡Correcto!' });
      const nuevoTablero = [...sala.tablero];
      nuevoTablero[celdaActiva] = sala.turno;
      if(checkGanador(nuevoTablero)) {
         setTimeout(() => accionSala('terminar'), 1000);
      }
    } else {
      setFeedback({ tipo: 'error', msj: 'Incorrecto' });
    }
    
    setTimeout(() => {
      setCeldaActiva(null);
      setFeedback(null);
    }, 1500);
  };

  const esAdmin = sala?.esAdmin;
  const esMiTurno = () => {
    if(!sala || !sala.equipos) return false;
    const miEquipo = sala.equipos[sala.turno];
    return miEquipo.some(j => j.id === sala.yoId);
  };

  const ganadorFinal = sala?.tablero ? checkGanador(sala.tablero) : null;

  return (
    <div className="rk-contenedor">

      {modalAyuda && (
        <div className="rg-modal-fondo" onClick={() => setModalAyuda(false)}>
          <div className="rg-modal rk-modal-ayuda" onClick={(e) => e.stopPropagation()}>
            <div className="rk-modal-header">
              <span className="rk-modal-signo-title">?</span>
              <h3>¿Cómo se juega a Fútbol en Raya?</h3>
            </div>

            <div className="rk-modal-cuerpo">
              <p>El clásico Tres en Raya con conocimiento futbolístico.</p>
              <ul>
                <li>El <strong>Anfitrión (👑)</strong> iniciará el partido y os dividiréis automáticamente en Equipo Azul y Equipo Rojo.</li>
                <li>Cuando sea el turno de tu equipo, cualquier miembro puede tocar una casilla vacía.</li>
                <li>Disponéis de 60s para escribir qué jugador cumple la fila y columna elegida.</li>
                <li>El juego validará automáticamente la respuesta. Gana el primer equipo en alinear 3 casillas.</li>
              </ul>
            </div>

            <div className="rg-modal-acciones">
              <button className="big full" onClick={() => setModalAyuda(false)}>Entendido</button>
            </div>
          </div>
        </div>
      )}

      {vista === 'menu' && (
        <MenuInicioJuego
          juegoId="futbolgrid"
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

      {vista === 'sala' && sala?.estado === 'lobby' && (
        <section className="game qq-pantalla">
          <CabeceraSala codigo={sala.code} onVolver={() => setModalSalir(true)} onAyuda={() => setModalAyuda(true)} texto="Pulsa el código para copiarlo y compártelo (2 a 6 jugadores)." />
          <ListaSala jugadores={sala.jugadores} yoId={sala.yoId} max={6} min={2} anfitrionId={sala.adminId} />

          {esAdmin ? (
            <button
              type="button"
              className="big full qq-btn-principal"
              style={{ marginTop: '1.2rem' }}
              disabled={sala.jugadores.length < 2}
              onClick={() => accionSala('iniciar')}
            >
              <Icon name="play" size={22} />
              {sala.jugadores.length < 2 ? 'Esperando jugadores...' : '¡Empezar Partida!'}
            </button>
          ) : (
            <EsperandoAnfitrion />
          )}
        </section>
      )}

      {vista === 'sala' && sala?.estado === 'jugando' && sala.gridActual && (
        <section className="game">
          <div className="hud space-between" style={{ marginBottom: '1rem' }}>
            <div className={`eq-badge ${sala.turno === 'X' ? 'active-x' : ''}`}><strong>Azul (X)</strong>: {sala.equipos.X.map(j => j.nombre).join(', ')}</div>
            <div className={`eq-badge ${sala.turno === 'O' ? 'active-o' : ''}`}><strong>Rojo (O)</strong>: {sala.equipos.O.map(j => j.nombre).join(', ')}</div>
          </div>

          <p className="hint center" style={{ margin: '0.5rem 0 1.5rem', fontWeight: 'bold' }}>
             {esMiTurno() ? "¡Es tu turno! Toca una casilla para intentar resolverla." : `Turno del Equipo ${sala.turno === 'X' ? 'Azul' : 'Rojo'}. Esperando...`}
          </p>

          <div className="grid-board-container">
            <div className="grid-board">
              <div className="grid-cell header empty"></div>
              {sala.gridActual.columnas.map((col, i) => (<div key={`c-${i}`} className="grid-cell header col-header">{col}</div>))}
              {sala.gridActual.filas.map((fila, fIndex) => (
                <React.Fragment key={`row-${fIndex}`}>
                  <div className="grid-cell header row-header">{fila}</div>
                  {[0, 1, 2].map((cIndex) => {
                    const index = fIndex * 3 + cIndex;
                    const valor = sala.tablero[index];
                    const esInteractable = esMiTurno() && valor === null;
                    return (
                      <div key={index} className={`grid-cell ${esInteractable ? 'interactable' : ''} ${valor === 'X' ? 'cell-x' : valor === 'O' ? 'cell-o' : ''}`} onClick={() => esInteractable && abrirCelda(index)}>
                        {valor && <span className="cell-mark">{valor}</span>}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>

          {celdaActiva !== null && esMiTurno() && (
            <div className="rg-modal-fondo">
              <div className="rg-modal grid-modal" onClick={(e) => e.stopPropagation()}>
                <h3 style={{ textAlign: 'center', marginBottom: '1rem', color: '#1e293b' }}>Respuesta Equipo {sala.turno === 'X' ? 'Azul' : 'Rojo'}</h3>
                <div className="grid-reto">
                  <span className="grid-reto-cat">{sala.gridActual.filas[Math.floor(celdaActiva / 3)]}</span>
                  <Icon name="close" size={20} color="#64748b" />
                  <span className="grid-reto-cat">{sala.gridActual.columnas[celdaActiva % 3]}</span>
                </div>
                <div className="timer" style={{ marginTop: '1.5rem' }}><div className={`timer-bar${restante <= 15 ? ' low' : ''}`} style={{ width: `${(restante / TIEMPO_S) * 100}%` }} /></div>
                <p className="timer-text" style={{ marginBottom: '1.5rem' }}><Icon name="clock" size={16} />{restante} s</p>

                {!feedback ? (
                  <form onSubmit={validarRespuesta}>
                    <input type="text" placeholder="Escribe el jugador..." value={respuestaInput} onChange={(e) => setRespuestaInput(e.target.value)} autoFocus style={{ width: '100%', padding: '0.8rem', marginBottom: '1rem', border: '2px solid #cbd5e1', borderRadius: '8px' }} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <button type="submit" className="ok" disabled={!respuestaInput.trim()}><Icon name="check" size={20} /> Comprobar</button>
                      <button type="button" className="secondary danger" onClick={() => accionSala('validar', { celda: celdaActiva, resultado: 'fallo' }).then(() => setCeldaActiva(null))}>No lo sé</button>
                    </div>
                  </form>
                ) : (
                  <div style={{ padding: '1rem', textAlign: 'center', background: feedback.tipo === 'success' ? '#dcfce7' : '#fee2e2', color: feedback.tipo === 'success' ? '#15803d' : '#991b1b', borderRadius: '8px', fontWeight: 'bold' }}>
                    {feedback.msj}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      )}

      {vista === 'sala' && sala?.estado === 'final' && (
        <section className="game">
          <div className="end-card">
            <span className="end-icon"><Icon name="trophy" size={48} /></span>
            <h1 className="title">{ganadorFinal === 'Empate' ? '¡Es un Empate!' : `¡El Equipo ${ganadorFinal === 'X' ? 'Azul' : 'Rojo'} gana!`}</h1>
          </div>
          <div className="actions" style={{ marginTop: '1.5rem' }}>
            {esAdmin && <button className="big full" onClick={() => accionSala('reset')} style={{ marginBottom: '0.8rem' }}><Icon name="refresh" size={20} /> Volver al Lobby</button>}
            <button className="secondary danger full" onClick={() => setModalSalir(true)}><Icon name="door" size={20} /> Salir al menú</button>
          </div>
        </section>
      )}

      {modalSalir && (
        <div className="rg-modal-fondo" onClick={() => setModalSalir(false)}>
          <div className="rg-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px', textAlign: 'center', padding: '1.8rem 1.4rem' }}>
            <h3 style={{ margin: '0 0 0.6rem', color: '#1e1b4b', fontSize: '1.3rem' }}>¿Abandonar la partida?</h3>
            <p className="hint" style={{ fontSize: '0.95rem', marginBottom: '1.4rem' }}>Si sales de la sala perderás tu progreso actual en la partida.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginTop: '1rem' }}>
              <button type="button" className="secondary full" onClick={() => setModalSalir(false)}>Quedarme</button>
              <button type="button" className="secondary danger full" onClick={() => { setModalSalir(false); handleSalir(); }}>Sí, salir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
