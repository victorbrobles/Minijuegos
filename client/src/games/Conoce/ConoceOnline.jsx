// client/src/games/Conoce/ConoceOnline.jsx
import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../components/Icon.jsx';
import './Conoce.css';
import '../Adivina/Adivina.css';

const CLAVE_SESION_CNC = 'conoce_online_session';

export default function ConoceOnline({ onLocal, onSalir }) {
  const [vista, setVista] = useState('menu'); // menu | crear | unirse | sala
  const [nombre, setNombre] = useState('');
  const [codigoInput, setCodigoInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);
  const [modalSalir, setModalSalir] = useState(false);
  const [modalAyuda, setModalAyuda] = useState(false);
  const [codigoCopiado, setCodigoCopiado] = useState(false);

  // Input de respuesta y elecciones
  const [miRespuestaInput, setMiRespuestaInput] = useState('');
  const [misElecciones, setMisElecciones] = useState({});

  const [sala, setSala] = useState(null);
  const [sesion, setSesion] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem(CLAVE_SESION_CNC)); } catch { return null; }
  });

  const intervalRef = useRef(null);

  useEffect(() => {
    if (!sesion) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setSala(null);
      return;
    }

    const consultarEstado = () => {
      fetch(`/api/conoce/sala/${sesion.code}?token=${sesion.token}`)
        .then(r => r.ok ? r.json() : Promise.reject('Sala no disponible'))
        .then(d => {
          if (d.success) {
            setSala(d);
            setVista('sala');
          }
        }).catch(() => {
          sessionStorage.removeItem(CLAVE_SESION_CNC);
          setSesion(null);
          setSala(null);
          setVista('menu');
        });
    };

    consultarEstado();
    intervalRef.current = setInterval(consultarEstado, 800);
    return () => clearInterval(intervalRef.current);
  }, [sesion]);

  // Cierra automáticamente el modal al arrancar el juego
  useEffect(() => {
    if (sala && sala.estado !== 'lobby') {
      setModalAyuda(false);
    }
  }, [sala?.estado]);

  // Limpiar inputs al cambiar de ronda o fase
  useEffect(() => {
    if (sala?.estado === 'respondiendo' && !sala?.yaRespondio) {
      setMiRespuestaInput('');
    }
    if (sala?.estado === 'adivinando' && !sala?.yaAdivino) {
      setMisElecciones({});
    }
  }, [sala?.estado, sala?.rondaNum]);

  const peticionPost = async (endpoint, extraBody = {}) => {
    setCargando(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/conoce/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion?.token, code: sesion?.code, ...extraBody })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.token) {
        const nueva = { code: data.code, token: data.token };
        sessionStorage.setItem(CLAVE_SESION_CNC, JSON.stringify(nueva));
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
    sessionStorage.removeItem(CLAVE_SESION_CNC);
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

  const enviarRespuesta = (e) => {
    if (e) e.preventDefault();
    if (!miRespuestaInput.trim() || sala.yaRespondio) return;
    peticionPost(`sala/${sesion.code}/responder`, { respuesta: miRespuestaInput.trim() });
  };

  const enviarAdivinanzas = () => {
    peticionPost(`sala/${sesion.code}/enviar-adivinanzas`, { asignaciones: misElecciones });
  };

  const yo = sala?.jugadores?.find(j => j.esTu);
  const esAdmin = yo?.esAdmin;
  const faltan = 4 - (sala?.jugadores?.length || 0);
  const rivales = sala?.jugadores?.filter(j => !j.esTu) || [];

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
          <h3>¿Cómo se juega a Conoce a tus amigos?</h3>
        </div>

        <div className="aprox-modal-cuerpo">
          <p><strong>1. Pregunta cotidiana (60s):</strong></p>
          <ul>
            <li>En cada ronda se plantea una pregunta común. Cada jugador responde sinceramente desde su teléfono móvil.</li>
          </ul>

          <p><strong>2. Cuenta atrás y Deducción (90s):</strong></p>
          <ul>
            <li>Tras una cuenta atrás de 10s, se revelan las respuestas desordenadas de todos los participantes.</li>
            <li>Tendrás 90 segundos para asignar a cada compañero la respuesta que crees que escribió.</li>
          </ul>

          <p><strong>3. Puntuación por parejas:</strong></p>
          <ul>
            <li><strong>¡Os conocéis bien!</strong> (Ambos acertáis la respuesta del otro): <strong>+3 puntos</strong> para cada uno.</li>
            <li><strong>Le conoces</strong> (Tú aciertas su respuesta, pero él no la tuya): <strong>+2 puntos</strong> para ti y <strong>-1 punto</strong> para él.</li>
            <li><strong>Te conoce</strong> (Él acierta tu respuesta, pero tú fallas la suya): <strong>+2 puntos</strong> para él y <strong>-1 punto</strong> para ti.</li>
            <li><strong>No os conocéis</strong> (Ambos falláis): <strong>-1 punto</strong> para cada uno.</li>
          </ul>

          <p><strong>4. Fin de la partida:</strong></p>
          <ul>
            <li>Las partidas son a <strong>15 rondas</strong> (salvo que el anfitrión decida finalizar antes). ¡Gana el jugador con mayor puntuación acumulada!</li>
          </ul>
        </div>

        <div className="rg-modal-acciones" style={{ marginTop: '1.2rem' }}>
          <button className="big full" onClick={() => setModalAyuda(false)}>Entendido</button>
        </div>
      </div>
    </div>
  ) : null;

  if (vista === 'menu') {
    return (
      <div className="cnc-contenedor" style={{ position: 'relative' }}>
        <ModalAyuda />
        <section className="game">
          <div className="panel center" style={{ position: 'relative' }}>
            <BotonAyudaCard />
            <span className="lb-luna chica"><Icon name="users" size={42} strokeWidth={1.6} /></span>
            <h1 className="title">Conoce a tus amigos</h1>
            <p className="hint">Preguntas cotidianas para descubrir cuánto os conocéis en verdad. (4 a 16 jugadores).</p>
            {errorMsg && <p className="error" style={{ margin: '0.8rem 0' }}>{errorMsg}</p>}
            <div className="lb-menu">
              <button className="big full" onClick={() => { setVista('crear'); setErrorMsg(''); }}>
                <Icon name="crown" size={22} /> Crear partida Online
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
      </div>
    );
  }

  if (vista === 'crear' || vista === 'unirse') {
    return (
      <div className="cnc-contenedor" style={{ position: 'relative' }}>
        <ModalAyuda />
        <section className="game">
          <div className="panel center">
            <span className="lb-luna chica"><Icon name={vista === 'crear' ? 'crown' : 'users'} size={40} /></span>
            <h2 className="title">{vista === 'crear' ? 'Crear partida' : 'Unirse a partida'}</h2>
            <div className="lb-form" style={{ marginTop: '1.2rem', textAlign: 'left' }}>
              {vista === 'unirse' && (
                <>
                  <label className="field-label">Código de la sala</label>
                  <input
                    className="lb-input-codigo"
                    placeholder="ABCD"
                    value={codigoInput}
                    onChange={(e) => setCodigoInput(e.target.value.toUpperCase())}
                    maxLength={4}
                    style={{ textTransform: 'uppercase', letterSpacing: '4px', textAlign: 'center', fontWeight: '800' }}
                  />
                </>
              )}
              <label className="field-label" style={{ marginTop: '1rem' }}>Tu nombre</label>
              <input
                placeholder="Tu nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                maxLength={15}
                autoFocus
              />
              {errorMsg && <p className="error">{errorMsg}</p>}
              <button
                className="big full"
                style={{ marginTop: '1rem' }}
                disabled={cargando || !nombre.trim() || (vista === 'unirse' && codigoInput.length < 4)}
                onClick={vista === 'crear' ? handleCrear : handleUnirse}
              >
                <Icon name="check" size={22} strokeWidth={2.5} /> Continuar
              </button>
              <button className="secondary full" style={{ marginTop: '0.6rem' }} onClick={() => setVista('menu')}>
                Volver
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (!sala) return <div className="panel center"><p>Cargando sala...</p></div>;

  return (
    <div className="cnc-contenedor" style={{ position: 'relative' }}>
      <ModalAyuda />

      {/* 1. LOBBY ONLINE */}
      {sala.estado === 'lobby' && (
        <section className="game">
          <div className="panel center" style={{ position: 'relative' }}>
            <BotonAyudaCard />

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
            <button type="button" className="qq-codigo-btn" onClick={copiarCodigo} title="Copiar código">
              {sala.code}
            </button>
            <p className="hint small">
              {codigoCopiado ? '¡Copiado al portapapeles!' : 'Comparte este código para que se unan (4 a 16 jugadores).'}
            </p>
          </div>

          <div className="panel" style={{ marginTop: '1rem' }}>
            <h3 className="panel-title"><Icon name="users" size={20} /> Jugadores ({sala.jugadores.length}/16)</h3>
            <div className="lb-lista">
              {sala.jugadores.map((j) => (
                <div key={j.id} className={`lb-jug ${j.esTu ? 'yo' : ''}`}>
                  <span className="lb-jug-nombre">{j.nombre} {j.esTu && '(tú)'} {j.esAdmin && '👑'}</span>
                </div>
              ))}
            </div>

            {faltan > 0 && (
              <p className="hint" style={{ marginTop: '0.8rem' }}>Faltan {faltan} jugador{faltan === 1 ? '' : 'es'} para poder empezar (mínimo 4).</p>
            )}
          </div>

          <div className="actions" style={{ marginTop: '1rem' }}>
            {esAdmin && (
              <button
                className="big full"
                disabled={faltan > 0}
                onClick={() => peticionPost(`sala/${sesion.code}/iniciar`)}
              >
                <Icon name="play" size={22} /> Empezar Partida (15 rondas)
              </button>
            )}
            <button className="secondary danger full" onClick={() => setModalSalir(true)}>
              <Icon name="door" size={20} /> Salir
            </button>
          </div>
        </section>
      )}

      {/* 2. RESPONDIENDO (60s) */}
      {sala.estado === 'respondiendo' && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="speech" size={18} />Responde con sinceridad</span>
            <span className={`chip alt ${sala.segundosRestantes <= 10 ? 'danger' : ''}`}>
              <Icon name="clock" size={16} /> {sala.segundosRestantes}s
            </span>
          </div>

          <div className="cnc-pregunta-card">
            <span className="field-label" style={{ color: 'rgba(255,255,255,0.85)' }}>Pregunta #{sala.rondaNum}:</span>
            <h2>{sala.preguntaActual}</h2>
          </div>

          <div className="panel center">
            {sala.yaRespondio ? (
              <div style={{ padding: '1.5rem 0' }}>
                <span className="badge" style={{ background: '#dcfce7', color: '#166534', padding: '0.4rem 1rem', fontSize: '1rem', fontWeight: 800 }}>
                  ✔ ¡Respuesta enviada!
                </span>
                <p className="hint" style={{ marginTop: '0.8rem' }}>
                  Tu respuesta: <strong>«{sala.miRespuesta}»</strong><br />
                  Esperando a que el resto de jugadores terminen de responder...
                </p>
              </div>
            ) : (
              <form onSubmit={enviarRespuesta}>
                <p className="hint" style={{ marginBottom: '1rem' }}>
                  Escribe tu respuesta sincera antes de que se acabe el tiempo:
                </p>
                <input
                  type="text"
                  className="player-text-input"
                  placeholder="Escribe aquí tu respuesta..."
                  value={miRespuestaInput}
                  onChange={(e) => setMiRespuestaInput(e.target.value)}
                  autoFocus
                />
                <button
                  type="submit"
                  className="big full"
                  style={{ marginTop: '1rem' }}
                  disabled={!miRespuestaInput.trim()}
                >
                  <Icon name="check" size={20} /> Enviar mi respuesta
                </button>
              </form>
            )}
          </div>
        </section>
      )}

      {/* 3. CUENTA ATRÁS 10s */}
      {sala.estado === 'cuenta_atras' && (
        <div className="cnc-overlay-cuenta">
          <p style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 1rem' }}>¡TODOS HAN RESPONDIDO!</p>
          <p className="hint" style={{ color: '#e2e8f0', marginBottom: '1rem' }}>
            En breves instantes verás las respuestas desordenadas de tus amigos:
          </p>
          <div className="cnc-cuenta-numero">{sala.cuentaAtras10s}</div>
        </div>
      )}

      {/* 4. ADIVINANDO (90s) */}
      {sala.estado === 'adivinando' && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="users" size={18} />Adivina de quién es cada respuesta</span>
            <span className={`chip alt ${sala.segundosRestantes <= 15 ? 'danger' : ''}`}>
              <Icon name="clock" size={16} /> {sala.segundosRestantes}s
            </span>
          </div>

          <div className="cnc-pregunta-card">
            <h2>{sala.preguntaActual}</h2>
          </div>

          <div className="panel">
            {sala.yaAdivino ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <span className="badge" style={{ background: '#dcfce7', color: '#166534', padding: '0.4rem 1rem', fontSize: '1rem', fontWeight: 800 }}>
                  ✔ ¡Deducciones enviadas!
                </span>
                <p className="hint" style={{ marginTop: '0.8rem' }}>
                  Esperando a que tus amigos confirmen sus apuestas...
                </p>
              </div>
            ) : (
              <>
                <p className="hint" style={{ marginBottom: '1rem' }}>
                  Relaciona a cada compañero con la respuesta que crees que escribió:
                </p>

                {rivales.map(r => (
                  <div key={r.id} className="cnc-asignar-row">
                    <span className="cnc-asignar-header">👤 {r.nombre}</span>
                    <select
                      className="cnc-select-respuesta"
                      value={misElecciones[r.id] || ''}
                      onChange={(e) => setMisElecciones({ ...misElecciones, [r.id]: e.target.value })}
                    >
                      <option value="">-- Selecciona qué respondió --</option>
                      {sala.respuestasOpciones?.map((opc, idx) => (
                        <option key={idx} value={opc.texto}>{opc.texto}</option>
                      ))}
                    </select>
                  </div>
                ))}

                <button
                  type="button"
                  className="big full"
                  style={{ marginTop: '1.2rem' }}
                  disabled={Object.keys(misElecciones).length < rivales.length}
                  onClick={enviarAdivinanzas}
                >
                  <Icon name="check" size={20} /> Enviar mis predicciones
                </button>
              </>
            )}
          </div>
        </section>
      )}

      {/* 5. RESULTADOS DE LA RONDA */}
      {sala.estado === 'resultados' && (
        <section className="game">
          <div className="end-card">
            <span className="end-icon"><Icon name="users" size={44} /></span>
            <p className="categoria">Ronda {sala.rondaNum} de {sala.maxRondas}</p>
            <h1 className="title">Tus resultados con el grupo</h1>
            <p className="reveal">«{sala.preguntaActual}»</p>
          </div>

          <div className="cnc-comp-grid">
            {sala.misComparaciones?.map((comp, idx) => (
              <div key={idx} className={`cnc-comp-card ${comp.estado}`}>
                <div className="cnc-comp-rival">
                  <span>{comp.rival}</span>
                  <strong>{comp.puntos}</strong>
                </div>
                <span className="cnc-comp-tag">{comp.etiqueta}</span>
                <p className="hint small" style={{ margin: 0 }}>
                  Su respuesta fue: <em>«{comp.respuestaRival}»</em>
                </p>
              </div>
            ))}
          </div>

          <div className="panel" style={{ marginTop: '1rem' }}>
            <h3 className="panel-title"><Icon name="trophy" size={20} /> Clasificación general</h3>
            <div className="scoreboard">
              {ranking.map((j, i) => (
                <div key={j.id} className={`score-row ${i === 0 && j.puntos > 0 ? 'first' : ''}`}>
                  <span className="score-name">{i + 1}. {j.nombre} {j.esTu && '(Tú)'}</span>
                  <span className="score-pts">{j.puntos} pts</span>
                </div>
              ))}
            </div>
          </div>

          <div className="actions" style={{ marginTop: '1.2rem' }}>
            {esAdmin ? (
              <>
                <button className="big full" onClick={() => peticionPost(`sala/${sesion.code}/siguiente-ronda`)}>
                  <Icon name="play" size={20} /> {sala.rondaNum >= sala.maxRondas ? 'Ver Podio Final' : `Siguiente Ronda (${sala.rondaNum + 1})`}
                </button>
                <button className="secondary danger full" onClick={() => peticionPost(`sala/${sesion.code}/terminar-ya`)}>
                  Finalizar partida ahora
                </button>
              </>
            ) : (
              <p className="hint center">Esperando a que el anfitrión continúe...</p>
            )}
          </div>
        </section>
      )}

      {/* 6. PODIO FINAL */}
      {sala.estado === 'fin' && (
        <section className="game">
          <div className="end-card">
            <span className="end-icon"><Icon name="trophy" size={44} /></span>
            <h1 className="title">¡Partida Terminada!</h1>
            <p className="final-score" style={{ color: '#4338ca' }}>
              {ganadores.length === 0
                ? 'Nadie consiguió puntos positivos.'
                : `🏆 Ganador: ${ganadores.map(g => g.nombre).join(', ')} con ${maxPuntos} pts`}
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

      {/* MODAL SALIR */}
      {modalSalir && (
        <div className="rg-modal-fondo" onClick={() => setModalSalir(false)}>
          <div className="rg-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px', textAlign: 'center', padding: '1.8rem 1.4rem' }}>
            <div style={{ fontSize: '2.4rem', marginBottom: '0.4rem' }}>🚪</div>
            <h3 style={{ margin: '0 0 0.6rem', color: '#1e1b4b', fontSize: '1.3rem' }}>¿Abandonar la partida?</h3>
            <p className="hint" style={{ fontSize: '0.95rem', marginBottom: '1.4rem', lineHeight: '1.4' }}>
              Perderás tu puntuación actual. ¿Deseas salir?
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