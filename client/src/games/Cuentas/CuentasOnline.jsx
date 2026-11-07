// client/src/games/Cuentas/CuentasOnline.jsx
import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../components/Icon.jsx';
import './Cuentas.css';
import '../Adivina/Adivina.css';
import { MenuInicioJuego, FormCrearSala, FormUnirseSala, CabeceraSala, EsperandoAnfitrion } from '../../components/MenuJuego.jsx';

const CLAVE_SESION_CNT = 'cuentas_online_session';

export default function CuentasOnline({ onSalir }) {
  const [vista, setVista] = useState('menu'); // menu | crear | unirse | sala
  const [nombre, setNombre] = useState('');
  const [codigoInput, setCodigoInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);
  const [modalSalir, setModalSalir] = useState(false);
  const [modalAyuda, setModalAyuda] = useState(false);
  const [codigoCopiado, setCodigoCopiado] = useState(false);

  // Modal de acción / selección
  const [modalAccion, setModalAccion] = useState(null);
  const [accionResultado, setAccionResultado] = useState(null);

  const [sala, setSala] = useState(null);
  const [sesion, setSesion] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem(CLAVE_SESION_CNT)); } catch { return null; }
  });

  const intervalRef = useRef(null);

  useEffect(() => {
    if (!sesion) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setSala(null);
      return;
    }

    const consultarEstado = () => {
      fetch(`/api/cuentas/sala/${sesion.code}?token=${sesion.token}`)
        .then(r => r.ok ? r.json() : Promise.reject('Sala no disponible'))
        .then(d => {
          if (d.success) {
            setSala(d);
            setVista('sala');
          }
        }).catch(() => {
          sessionStorage.removeItem(CLAVE_SESION_CNT);
          setSesion(null);
          setSala(null);
          setVista('menu');
        });
    };

    consultarEstado();
    intervalRef.current = setInterval(consultarEstado, 800);
    return () => clearInterval(intervalRef.current);
  }, [sesion]);

  useEffect(() => {
    if (sala && sala.estado !== 'lobby') {
      setModalAyuda(false);
    }
  }, [sala?.estado]);

  const peticionPost = async (endpoint, extraBody = {}) => {
    setCargando(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/cuentas/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion?.token, code: sesion?.code, ...extraBody })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.token) {
        const nueva = { code: data.code, token: data.token };
        sessionStorage.setItem(CLAVE_SESION_CNT, JSON.stringify(nueva));
        setSesion(nueva);
      }
      return data;
    } catch (err) {
      setErrorMsg(err.message);
      return null;
    } finally {
      setCargando(false);
    }
  };

  const handleCrear = () => nombre.trim() && peticionPost('crear', { nombre });
  const handleUnirse = () => nombre.trim() && codigoInput && peticionPost('unirse', { nombre, joinCode: codigoInput.toUpperCase() });

  const handleSalir = () => {
    if (sesion) peticionPost(`sala/${sesion.code}/salir`);
    sessionStorage.removeItem(CLAVE_SESION_CNT);
    setSesion(null);
    setSala(null);
    setVista('menu');
    setModalSalir(false);
  };

  const copiarCodigo = () => {
    if (!sala?.code) return;
    navigator.clipboard?.writeText(sala.code);
    setCodigoCopiado(true);
    setTimeout(() => setCodigoCopiado(false), 2000);
  };

  const jugarCarta = (numero) => {
    peticionPost(`sala/${sesion.code}/jugar-carta`, { numero });
  };

  const robarAccion = async (extra = {}) => {
    const d = await peticionPost(`sala/${sesion.code}/robar-accion`, extra);
    if (d?.accion) {
      setAccionResultado({ accion: d.accion, detalle: d.detalle });
      setModalAccion(null);
    }
  };

  const yo = sala?.jugadores?.find(j => j.esTu);
  const esAdmin = yo?.esAdmin;
  const miTurno = sala?.turnoId === yo?.id;
  const rivales = sala?.jugadores?.filter(j => !j.esTu && j.cantidadCartas > 0) || [];

  const ranking = [...(sala?.jugadores || [])].sort((a, b) => b.puntos - a.puntos);
  const maxPuntos = ranking.length > 0 ? ranking[0].puntos : 0;
  const ganadores = maxPuntos > 0 ? ranking.filter(j => j.puntos === maxPuntos) : [];

  const BotonAyudaCard = () => (
    <button
      type="button"
      onClick={() => setModalAyuda(true)}
      title="Reglas del juego"
      style={{
        position: 'absolute',
        top: '1rem',
        right: '1rem',
        width: '38px',
        height: '38px',
        borderRadius: '50%',
        border: '1.5px solid #c7d2fe',
        backgroundColor: '#ffffff',
        color: '#4338ca',
        fontSize: '1.2rem',
        fontWeight: '700',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(99, 102, 241, 0.12)',
        padding: 0,
        zIndex: 5
      }}
    >
      ?
    </button>
  );

  const ModalAyuda = () => modalAyuda ? (
    <div className="rg-modal-fondo" onClick={() => setModalAyuda(false)}>
      <div
        className="rg-modal aprox-modal-ayuda"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '560px', maxHeight: '88vh', overflowY: 'auto', textAlign: 'left' }}
      >
        <div className="aprox-modal-header">
          <span className="aprox-modal-signo-title">?</span>
          <h3>¿Cómo se juega a Lleva la cuenta?</h3>
        </div>

        <div className="aprox-modal-cuerpo">
          <p><strong>1. Reparto inicial de cartas (del 1 al 100):</strong></p>
          <ul>
            <li><strong>2 jugadores:</strong> 15 cartas cada uno.</li>
            <li><strong>3 o 4 jugadores:</strong> 8 cartas cada uno.</li>
            <li><strong>5 o 6 jugadores:</strong> 5 cartas cada uno.</li>
            <li><strong>7 u 8 jugadores:</strong> 4 cartas cada uno.</li>
            <li><strong>9 o 10 jugadores:</strong> 3 cartas cada uno.</li>
          </ul>

          <p><strong>2. Objetivo y Dinámica:</strong></p>
          <ul>
            <li>Hay que ir colocando las cartas de todos de <strong>menor a mayor</strong> en el centro de la mesa, sin saber las cartas que tienen tus compañeros.</li>
            <li><strong>Acierto:</strong> Si sueltas una carta y nadie tiene una menor que ella (y mayor que la del centro), te la quitas de encima, suma +1 pto y se convierte en la nueva referencia.</li>
            <li><strong>Fallo:</strong> Si resulta que otro jugador tenía una carta menor, restas 1 pto y debes robar una nueva carta del mazo (mayor a la que haya en el centro).</li>
          </ul>

          <p><strong>3. Regla de Retención:</strong></p>
          <ul>
            <li>Si en cualquier momento tienes la carta más baja de la partida y <strong>no la sueltas durante 2 turnos consecutivos</strong>, perderás 1 punto y robarás otra carta obligatoriamente.</li>
          </ul>

          <p><strong>4. Cartas de Acción y Puntuación final:</strong></p>
          <ul>
            <li>Durante la partida se pueden robar hasta <strong>5 cartas de acción</strong> (buenas, malas y neutras como ver cartas, intercambiar, radares numéricos, etc.).</li>
            <li><strong>Puntos finales:</strong> El primer jugador en quedarse sin cartas se lleva tantos puntos como jugadores haya en la sala, el 2º un punto menos, y así sucesivamente hasta el último, que suma 1 pto.</li>
          </ul>
        </div>

        <div className="rg-modal-acciones" style={{ marginTop: '1.2rem' }}>
          <button className="big full" onClick={() => setModalAyuda(false)}>
            Entendido
          </button>
        </div>
      </div>
    </div>
  ) : null;

  if (vista === 'menu') {
    return (
      <div className="cnt-contenedor" style={{ position: 'relative' }}>
        <ModalAyuda />
        <MenuInicioJuego
            juegoId="cuentas"
            onCrear={() => { setVista('crear'); setErrorMsg(''); }}
            onUnirse={() => { setVista('unirse'); setErrorMsg(''); }}
            onAyuda={() => setModalAyuda(true)}
            error={errorMsg}
          />
      </div>
    );
  }

  if (vista === 'crear' || vista === 'unirse') {
    return (
      <div className="cnt-contenedor" style={{ position: 'relative' }}>
        <ModalAyuda />
        {vista === 'crear' ? (
          <FormCrearSala
            onVolver={() => { setVista('menu'); setErrorMsg(''); }}
            onAyuda={() => setModalAyuda(true)}
            nombre={nombre}
            setNombre={setNombre}
            onCrear={handleCrear}
            cargando={cargando}
            error={errorMsg}
            maxLength={15}
          />
        ) : (
          <FormUnirseSala
            onVolver={() => { setVista('menu'); setErrorMsg(''); }}
            onAyuda={() => setModalAyuda(true)}
            codigo={codigoInput}
            setCodigo={setCodigoInput}
            nombre={nombre}
            setNombre={setNombre}
            onUnirse={handleUnirse}
            cargando={cargando}
            error={errorMsg}
            maxLength={15}
          />
        )}
      </div>
    );
  }

  if (!sala) return <div className="panel center"><p>Cargando sala...</p></div>;

  return (
    <div className="cnt-contenedor" style={{ position: 'relative' }}>
      <ModalAyuda />

      {/* 1. LOBBY */}
      {sala.estado === 'lobby' && (
        <section className="game qq-pantalla">
          <CabeceraSala codigo={sala.code} onVolver={() => setModalSalir(true)} onAyuda={() => setModalAyuda(true)} />

          <div className="panel qq-menu-panel" style={{ marginTop: '1rem' }}>
            <h3 className="qq-sala-titulo"><Icon name="users" size={20} /> Jugadores ({sala.jugadores.length}/10)</h3>
            <div className="lb-lista qq-sala-lista">
              {sala.jugadores.map((j) => (
                <div key={j.id} className={`lb-jug ${j.esTu ? 'yo' : ''}`}>
                  <span className="lb-jug-nombre">{j.nombre} {j.esTu && '(tú)'} {j.esAdmin && '👑'}</span>
                </div>
              ))}
            </div>

            {sala.jugadores.length < 2 && (
              <p className="hint" style={{ marginTop: '0.8rem' }}>Falta al menos 1 jugador para empezar (mínimo 2).</p>
            )}
          </div>

          <div className="actions" style={{ marginTop: '1rem' }}>
            {esAdmin && (
              <button
                className="big full qq-btn-principal"
                disabled={sala.jugadores.length < 2}
                onClick={() => peticionPost(`sala/${sesion.code}/iniciar`)}
              >
                <Icon name="play" size={22} /> Empezar Partida
              </button>
            )}
          </div>

          {!esAdmin && <EsperandoAnfitrion />}
        </section>
      )}

      {/* 2. EN JUEGO */}
      {sala.estado === 'jugando' && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="cards" size={18} />En juego</span>
            <span className="chip alt">Puntos: {sala.misPuntos || 0} pts</span>
          </div>

          {/* Estado de la mesa: Carta central de referencia */}
          <div className="cnt-mesa-display">
            <span className="cnt-mesa-subtitulo">Número actual en la mesa</span>
            <div className="cnt-mesa-numero">
              {sala.cartaActual > 0 ? sala.cartaActual : '—'}
            </div>
            <span className="cnt-mesa-alerta">
              {sala.cartaActual > 0 
                ? `La próxima carta debe ser estrictamente mayor que ${sala.cartaActual}` 
                : 'Empieza la partida: colocad la carta más baja posible'}
            </span>
          </div>

          {/* Turno actual */}
          <div className="panel center" style={{ padding: '0.9rem', marginBottom: '1rem' }}>
            {miTurno ? (
              <span className="badge" style={{ background: '#dcfce7', color: '#166534', fontSize: '1rem', padding: '0.4rem 1rem', fontWeight: 800 }}>
                👉 ¡ES TU TURNO! Juega la carta que creas más baja
              </span>
            ) : (
              <span className="hint">
                Turno de: <strong>{sala.jugadores.find(j => j.id === sala.turnoId)?.nombre || '...'}</strong>
              </span>
            )}
          </div>

          {/* Mano de cartas del jugador */}
          <div className="panel" style={{ padding: '1.2rem 1rem' }}>
            <h3 className="panel-title" style={{ textAlign: 'center', marginBottom: '0.6rem' }}>
              Tus cartas ({sala.misCartas?.length || 0})
            </h3>
            
            <div className="cnt-mano-grid">
              {sala.misCartas?.map(n => (
                <button
                  key={n}
                  type="button"
                  className="cnt-carta-btn"
                  disabled={!miTurno || sala.bloqueado}
                  onClick={() => jugarCarta(n)}
                >
                  {n}
                </button>
              ))}
              {sala.misCartas?.length === 0 && (
                <p className="hint ok" style={{ width: '100%', textAlign: 'center' }}>
                  🎉 ¡Te has quedado sin cartas! Esperando a que finalicen los demás.
                </p>
              )}
            </div>

            {/* Acción de robar carta de acción */}
            {miTurno && sala.misCartas?.length > 0 && sala.accionesRestantes > 0 && (
              <button
                type="button"
                className="cnt-btn-accion"
                onClick={() => setModalAccion(true)}
              >
                ✨ Robar Carta de Acción ({sala.accionesRestantes} disponibles)
              </button>
            )}
          </div>

          {/* Historial de eventos */}
          {sala.log?.length > 0 && (
            <div className="panel" style={{ marginTop: '1rem' }}>
              <h4 style={{ margin: '0 0 0.5rem', color: '#1e293b' }}>Registro de jugadas:</h4>
              {sala.log.slice(0, 4).map((l, idx) => (
                <p key={idx} className="hint small" style={{ margin: '0.3rem 0' }}>{l}</p>
              ))}
            </div>
          )}

          {/* Marcador en vivo */}
          <div className="scoreboard-container" style={{ justifyContent: 'center', marginTop: '0.8rem' }}>
            {sala.jugadores?.map(j => (
              <div key={j.id} className="score-pill">
                <span>{j.nombre}: <strong>{j.cantidadCartas} cartas</strong> ({j.puntos} pts)</span>
              </div>
            ))}
          </div>

          <button className="secondary danger full" style={{ marginTop: '1.2rem' }} onClick={() => setModalSalir(true)}>
            <Icon name="door" size={20} /> Salir de la sala
          </button>
        </section>
      )}

      {/* 3. PODIO FINAL */}
      {sala.estado === 'fin' && (
        <section className="game">
          <div className="end-card">
            <span className="end-icon"><Icon name="trophy" size={44} /></span>
            <h1 className="title">¡Partida Terminada!</h1>
            <p className="final-score" style={{ color: '#16a34a' }}>
              🏆 Ganador: {ganadores.map(g => g.nombre).join(', ')} con {maxPuntos} pts
            </p>
          </div>

          <div className="panel reveal-panel" style={{ marginTop: '1rem' }}>
            <h3 className="reveal-title"><Icon name="podium" size={20} /> Clasificación Final</h3>
            <div className="scoreboard">
              {ranking.map((j, i) => (
                <div key={j.id} className={`score-row ${j.puntos === maxPuntos && maxPuntos > 0 ? 'first' : ''}`}>
                  <span className="score-name">{i + 1}. {j.nombre} {j.esTu && '(Tú)'}</span>
                  <span className="score-pts">{j.puntos} pts</span>
                </div>
              ))}
            </div>
          </div>

          <div className="actions" style={{ marginTop: '1.2rem' }}>
            {esAdmin && (
              <button className="big full" onClick={() => peticionPost(`sala/${sesion.code}/iniciar`)}>
                <Icon name="refresh" size={20} /> Jugar otra vez
              </button>
            )}
            <button className="secondary danger full" onClick={handleSalir}>
              <Icon name="door" size={20} /> Salir al menú
            </button>
          </div>
        </section>
      )}

      {/* Modal de selección para robar acción */}
      {modalAccion && (
        <div className="rg-modal-fondo" onClick={() => setModalAccion(null)}>
          <div className="rg-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px', padding: '1.6rem' }}>
            <h3 style={{ margin: '0 0 0.8rem', color: '#1e1b4b' }}>Robar Carta de Acción</h3>
            <p className="hint small" style={{ marginBottom: '1.2rem' }}>
              Si la carta requiere elegir a un rival, selecciona con quién interactuar:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {rivales.map(r => (
                <button
                  key={r.id}
                  className="secondary full"
                  onClick={() => robarAccion({ rivalId: r.id })}
                >
                  Seleccionar a {r.nombre} ({r.cantidadCartas} cartas)
                </button>
              ))}
              {rivales.length === 0 && (
                <button className="big full" onClick={() => robarAccion()}>
                  Robar acción
                </button>
              )}
            </div>

            <button className="secondary danger full" style={{ marginTop: '1rem' }} onClick={() => setModalAccion(null)}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Modal resultado de carta de acción */}
      {accionResultado && (
        <div className="rg-modal-fondo" onClick={() => setAccionResultado(null)}>
          <div className="rg-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px', textAlign: 'center', padding: '1.8rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.4rem' }}>{accionResultado.accion.icono}</div>
            <h2 style={{ margin: '0 0 0.5rem', color: '#1e1b4b' }}>{accionResultado.accion.nombre}</h2>
            <p className="hint" style={{ fontSize: '1rem', lineHeight: '1.4', marginBottom: '1.4rem' }}>
              {accionResultado.detalle}
            </p>
            <button className="big full" onClick={() => setAccionResultado(null)}>
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Modal Confirmación Salir */}
      {modalSalir && (
        <div className="rg-modal-fondo" onClick={() => setModalSalir(false)}>
          <div className="rg-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px', textAlign: 'center', padding: '1.8rem 1.4rem' }}>
            <div style={{ fontSize: '2.4rem', marginBottom: '0.4rem' }}>🚪</div>
            <h3 style={{ margin: '0 0 0.6rem', color: '#1e1b4b', fontSize: '1.3rem' }}>¿Abandonar la partida?</h3>
            <p className="hint" style={{ fontSize: '0.95rem', marginBottom: '1.4rem', lineHeight: '1.4' }}>
              Perderás tus cartas y tu puntuación actual. ¿Deseas salir?
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <button type="button" className="secondary full" onClick={() => setModalSalir(false)}>Quedarme</button>
              <button type="button" className="secondary danger full" onClick={handleSalir}>Salir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}