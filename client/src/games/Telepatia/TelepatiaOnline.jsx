// client/src/games/Telepatia/TelepatiaOnline.jsx
import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../components/Icon.jsx';
import './Telepatia.css';
import '../Adivina/Adivina.css';

const CLAVE_SESION_TEL = 'telepatia_online_session';

export default function TelepatiaOnline({ onLocal, onSalir }) {
  const [vista, setVista] = useState('menu');
  const [nombre, setNombre] = useState('');
  const [codigoInput, setCodigoInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);
  const [modalSalir, setModalSalir] = useState(false);
  const [modalAyuda, setModalAyuda] = useState(false);
  const [codigoCopiado, setCodigoCopiado] = useState(false);

  // Input de palabra del jugador
  const [miPalabra, setMiPalabra] = useState('');
  const [haEnviado, setHaEnviado] = useState(false);

  const [sala, setSala] = useState(null);
  const [sesion, setSesion] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem(CLAVE_SESION_TEL)); } catch { return null; }
  });

  const intervalRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!sesion) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setSala(null);
      return;
    }

    const consultarEstado = () => {
      fetch(`/api/telepatia/sala/${sesion.code}?token=${sesion.token}`)
        .then(r => r.ok ? r.json() : Promise.reject('Sala no disponible'))
        .then(d => {
          if (d.success) {
            setSala(d);
            setVista('sala');
          }
        }).catch(() => {
          sessionStorage.removeItem(CLAVE_SESION_TEL);
          setSesion(null);
          setSala(null);
          setVista('menu');
        });
    };

    consultarEstado();
    intervalRef.current = setInterval(consultarEstado, 1000);
    return () => clearInterval(intervalRef.current);
  }, [sesion]);

  // Cierra automáticamente el modal al empezar la partida
  useEffect(() => {
    if (sala && sala.estado !== 'lobby') {
      setModalAyuda(false);
    }
  }, [sala?.estado]);

  const peticionPost = async (endpoint, extraBody = {}) => {
    setCargando(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/telepatia/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion?.token, code: sesion?.code, ...extraBody })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.token) {
        const nueva = { code: data.code, token: data.token };
        sessionStorage.setItem(CLAVE_SESION_TEL, JSON.stringify(nueva));
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
    sessionStorage.removeItem(CLAVE_SESION_TEL);
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

  // Al pasar a estado 'escribiendo', reiniciar el input y enfocar
  useEffect(() => {
    if (sala?.estado === 'escribiendo') {
      setMiPalabra('');
      setHaEnviado(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [sala?.estado, sala?.rondaNum]);

  const enviarPalabra = () => {
    if (!miPalabra.trim() || haEnviado) return;
    setHaEnviado(true);
    peticionPost(`sala/${sesion.code}/enviar-palabra`, { palabra: miPalabra.trim() });
  };

  const mostrarAyuda = vista === 'menu' || vista === 'crear' || vista === 'unirse' || (vista === 'sala' && sala?.estado === 'lobby');

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
        style={{ maxWidth: '540px', maxHeight: '88vh', overflowY: 'auto', textAlign: 'left' }}
      >
        <div className="aprox-modal-header">
          <span className="aprox-modal-signo-title">?</span>
          <h3>¿Cómo se juega a Telepatía?</h3>
        </div>

        <div className="aprox-modal-cuerpo">
          <p><strong>1. Dinámica de la ronda:</strong></p>
          <ul>
            <li>En cada ronda aparece una <strong>Palabra de Origen</strong> común para todos los móviles.</li>
            <li>Tienes <strong>5 segundos</strong> para escribir una palabra que relaciones mentalmente con ella y pulsar Enviar.</li>
          </ul>

          <p><strong>2. Coincidencias y Rachas:</strong></p>
          <ul>
            <li>El sistema compara todas las palabras enviadas. Si <strong>2 o más jugadores escriben exactamente la misma</strong>, ¡conectan mentes y suman puntos!</li>
            <li><strong>🔥 Racha multiplicadora:</strong> La 1ª coincidencia suma <strong>+1 punto</strong>. Si vuelves a coincidir en la ronda siguiente consecutiva, tu racha sube (+2 pts, +3 pts...).</li>
            <li>Si no coincides en una ronda, tu racha vuelve a empezar desde cero.</li>
          </ul>

          <p><strong>3. Fin de partida:</strong></p>
          <ul>
            <li>Se juegan <strong>15 rondas</strong> de máxima velocidad mental. ¡El jugador que lidere la clasificación al final gana la partida!</li>
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
      <div className="tel-contenedor" style={{ position: 'relative' }}>
        <ModalAyuda />
        <section className="game">
          <div className="panel center" style={{ position: 'relative' }}>
            <BotonAyudaCard />
            <span className="lb-luna chica"><Icon name="zap" size={42} strokeWidth={1.6} /></span>
            <h1 className="title">Telepatía</h1>
            <p className="hint">Escribid la misma palabra en 5 segundos. ¡Conectad vuestras mentes! (4 a 20 jugadores).</p>
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
      </div>
    );
  }

  if (vista === 'crear' || vista === 'unirse') {
    return (
      <div className="tel-contenedor" style={{ position: 'relative' }}>
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

  const yo = sala.jugadores.find(j => j.esTu);
  const esAdmin = yo?.esAdmin;
  const faltan = 4 - sala.jugadores.length;

  const ranking = [...sala.jugadores].sort((a, b) => b.puntos - a.puntos);
  const maxPuntos = ranking.length > 0 ? ranking[0].puntos : 0;
  const ganadores = maxPuntos > 0 ? ranking.filter(j => j.puntos === maxPuntos) : [];

  return (
    <div className="tel-contenedor" style={{ position: 'relative' }}>
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
              {codigoCopiado ? '¡Copiado al portapapeles!' : 'Compártelo con los demás para que se unan.'}
            </p>
          </div>

          <div className="panel" style={{ marginTop: '1rem' }}>
            <h3 className="panel-title"><Icon name="users" size={20} /> Jugadores ({sala.jugadores.length}/20)</h3>
            <div className="lb-lista">
              {sala.jugadores.map((j) => (
                <div key={j.id} className={`lb-jug ${j.esTu ? 'yo' : ''}`}>
                  <span className="lb-jug-nombre">{j.nombre} {j.esTu && '(tú)'} {j.esAdmin && '👑'}</span>
                </div>
              ))}
            </div>
            {faltan > 0 ? (
              <p className="hint" style={{ marginTop: '0.8rem' }}>Faltan {faltan} jugador{faltan === 1 ? '' : 'es'} para poder empezar (mínimo 4).</p>
            ) : (
              <p className="hint ok" style={{ marginTop: '0.8rem' }}>¡Ya sois suficientes! El anfitrión puede empezar.</p>
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

      {/* 2. ESCRIBIENDO (5 SEGUNDOS) - Ayuda oculta */}
      {sala.estado === 'escribiendo' && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="flagFinish" size={18} />Ronda {sala.rondaNum} / 15</span>
            <span className="chip alt"><Icon name="clock" size={16} /> ¡Rápido!</span>
          </div>

          <div className="panel center">
            <div className={`tel-countdown ${sala.segundosRestantes <= 2 ? 'peligro' : ''}`}>
              {sala.segundosRestantes}
            </div>

            <p className="field-label">Palabra de origen:</p>
            <div className="tel-palabra-card">
              <h1 className="tel-palabra-texto">{sala.palabraActual}</h1>
            </div>

            <p className="hint" style={{ marginBottom: '1rem' }}>
              Escribe una palabra relacionada antes de que el contador llegue a 0:
            </p>

            <form onSubmit={(e) => { e.preventDefault(); enviarPalabra(); }}>
              <input
                ref={inputRef}
                type="text"
                className="tel-input-palabra"
                placeholder="TU PALABRA..."
                value={miPalabra}
                disabled={haEnviado || sala.segundosRestantes <= 0}
                onChange={(e) => setMiPalabra(e.target.value.toUpperCase())}
                maxLength={20}
              />

              <button
                type="submit"
                className="big full"
                style={{ marginTop: '1rem' }}
                disabled={haEnviado || !miPalabra.trim() || sala.segundosRestantes <= 0}
              >
                <Icon name="check" size={20} /> {haEnviado ? '¡Palabra enviada!' : 'Enviar palabra'}
              </button>
            </form>
          </div>
        </section>
      )}

      {/* 3. RESULTADO DE RONDA */}
      {sala.estado === 'resultado' && (
        <section className="game">
          <div className="end-card">
            <span className="end-icon"><Icon name="zap" size={44} /></span>
            <p className="categoria">Fin de la ronda {sala.rondaNum}</p>
            <h1 className="title">Resultados de la ronda</h1>
            <p className="reveal">{sala.logRonda}</p>
          </div>

          <div className="panel" style={{ marginTop: '1rem' }}>
            <h3 className="panel-title"><Icon name="speech" size={20} /> Palabras dichas</h3>
            {sala.gruposCoincidentes?.map((g, i) => (
              <div key={i} className={`tel-grupo-card ${g.coincide ? 'coincidencia' : ''}`}>
                <div className="tel-grupo-cab">
                  <span className="tel-grupo-palabra">«{g.palabra}»</span>
                  {g.coincide && <span className="tel-grupo-pts">+{g.puntosSumados} {g.puntosSumados === 1 ? 'pto' : 'ptos'}</span>}
                </div>
                <div className="tel-chips-jugadores">
                  {g.jugadores.map((n, idx) => (
                    <span key={idx} className="tel-chip-jug">👤 {n}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="panel" style={{ marginTop: '1rem' }}>
            <h3 className="panel-title"><Icon name="trophy" size={20} /> Clasificación actual</h3>
            <div className="scoreboard">
              {ranking.map((j, i) => (
                <div key={j.id} className={`score-row ${i === 0 && j.puntos > 0 ? 'first' : ''}`}>
                  <span className="score-name">
                    {j.nombre} {j.esTu && '(Tú)'} {j.racha > 1 && <span className="badge" style={{background:'#dcfce7', color:'#166534'}}>🔥 x{j.racha}</span>}
                  </span>
                  <span className="score-pts">{j.puntos} {j.puntos === 1 ? 'pto' : 'ptos'}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="actions" style={{ marginTop: '1.2rem' }}>
            {esAdmin ? (
              <>
                <button className="big full" onClick={() => peticionPost(`sala/${sesion.code}/siguiente`)}>
                  <Icon name="play" size={20} /> {sala.rondaNum >= 15 ? 'Ver Podio Final' : `Ir a Ronda ${sala.rondaNum + 1}`}
                </button>
                <button className="secondary danger full" onClick={() => peticionPost(`sala/${sesion.code}/terminar-ya`)}>
                  Finalizar partida ahora
                </button>
              </>
            ) : (
              <p className="hint center">Esperando a que el anfitrión avance la ronda...</p>
            )}
          </div>
        </section>
      )}

      {/* 4. FIN / PODIO */}
      {sala.estado === 'fin' && (
        <section className="game">
          <div className="end-card">
            <span className="end-icon"><Icon name="trophy" size={44} /></span>
            <h1 className="title">¡Partida Terminada!</h1>
            <p className="final-score" style={{ color: '#0891b2' }}>
              {ganadores.length === 0
                ? 'Nadie consiguió conectar mentes esta vez.'
                : `🏆 Ganador: ${ganadores.map(g => g.nombre).join(', ')} con ${maxPuntos} pts`}
            </p>
          </div>

          <div className="panel reveal-panel" style={{ marginTop: '1rem' }}>
            <h3 className="reveal-title"><Icon name="trophy" size={20} /> Clasificación Final</h3>
            <div className="scoreboard">
              {ranking.map((j, i) => (
                <div key={j.id} className={`score-row ${j.puntos === maxPuntos && maxPuntos > 0 ? 'first' : ''}`}>
                  <span className="score-name">{i + 1}. {j.nombre} {j.esTu && '(Tú)'}</span>
                  <span className="score-pts">{j.puntos} ptos</span>
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
              Perderás tus puntos actuales. ¿Deseas salir?
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