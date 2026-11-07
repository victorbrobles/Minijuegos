// client/src/games/Logos/LogosOnline.jsx
import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../components/Icon.jsx';
import './Logos.css';
import '../Adivina/Adivina.css';
import { MenuInicioJuego, MenuModoOnline, FormCrearSala, FormUnirseSala, CabeceraSala, EsperandoAnfitrion } from '../../components/MenuJuego.jsx';

const CLAVE_SESION_LOGOS = 'logos_online_session';

export default function LogosOnline({ onLocal, onSalir }) {
  const [vista, setVista] = useState('menu');
  const [nombre, setNombre] = useState('');
  const [codigoInput, setCodigoInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);
  const [modalSalir, setModalSalir] = useState(false);
  const [modalAyuda, setModalAyuda] = useState(false);
  const [codigoCopiado, setCodigoCopiado] = useState(false);

  const [inputRespuesta, setInputRespuesta] = useState('');

  const [sala, setSala] = useState(null);
  const [sesion, setSesion] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem(CLAVE_SESION_LOGOS)); } catch { return null; }
  });

  const intervalRef = useRef(null);

  useEffect(() => {
    if (!sesion) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setSala(null);
      return;
    }

    const consultarEstado = () => {
      fetch(`/api/logos/sala/${sesion.code}?token=${sesion.token}`)
        .then(r => r.ok ? r.json() : Promise.reject('Sala no disponible'))
        .then(d => {
          if (d.success) {
            setSala(d);
            setVista('sala');
          }
        }).catch(() => {
          sessionStorage.removeItem(CLAVE_SESION_LOGOS);
          setSesion(null);
          setSala(null);
          setVista('online_menu');
        });
    };

    consultarEstado();
    intervalRef.current = setInterval(consultarEstado, 750);
    return () => clearInterval(intervalRef.current);
  }, [sesion]);

  useEffect(() => {
    if (sala && sala.estado !== 'lobby') {
      setModalAyuda(false);
    }
  }, [sala?.estado]);

  useEffect(() => {
    if (sala?.estado === 'jugando' && !sala?.miJugada) {
      setInputRespuesta('');
    }
  }, [sala?.estado, sala?.rondaNum]);

  const peticionPost = async (endpoint, extraBody = {}) => {
    setCargando(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/logos/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion?.token, code: sesion?.code, ...extraBody })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.token) {
        const nueva = { code: data.code, token: data.token };
        sessionStorage.setItem(CLAVE_SESION_LOGOS, JSON.stringify(nueva));
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
    sessionStorage.removeItem(CLAVE_SESION_LOGOS);
    setSesion(null);
    setSala(null);
    setVista('online_menu');
    setModalSalir(false);
  };

  const copiarCodigo = () => {
    if (!sala?.code) return;
    navigator.clipboard?.writeText(sala.code);
    setCodigoCopiado(true);
    setTimeout(() => setCodigoCopiado(false), 2000);
  };

  const responder = (e) => {
    if (e) e.preventDefault();
    if (!inputRespuesta.trim() || sala?.miJugada) return;
    peticionPost(`sala/${sesion.code}/responder`, { respuesta: inputRespuesta.trim() });
  };

  const pasar = () => {
    if (sala?.miJugada) return;
    peticionPost(`sala/${sesion.code}/pasar`);
  };

  const yo = sala?.jugadores?.find(j => j.esTu);
  const esAdmin = yo?.esAdmin;
  const faltan = 2 - (sala?.jugadores?.length || 0);

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
        top: '1.1rem',
        right: '1.1rem',
        width: '38px',
        height: '38px',
        borderRadius: '50%',
        border: '1.5px solid #c7d2fe',
        background: '#ffffff',
        color: '#4338ca',
        fontSize: '1.2rem',
        fontWeight: '700',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(99, 102, 241, 0.15)',
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
          <h3>¿Cómo se juega a Logo Mania?</h3>
        </div>

        <div className="aprox-modal-cuerpo">
          <p><strong>1. Dinámica en directo (60s):</strong></p>
          <ul>
            <li>En cada ronda aparece la imagen de un logo sin su nombre escrito. Todos los jugadores lo ven en tiempo real al mismo tiempo.</li>
            <li>Escribe en el campo de texto el nombre de la marca o empresa. El sistema acepta variantes y pequeños fallos ortográficos.</li>
          </ul>

          <p><strong>2. Puntuaciones y Riesgo:</strong></p>
          <ul>
            <li><strong>Acierto:</strong> Sumas exactamente los segundos restantes del cronómetro en ese instante.</li>
            <li><strong>Fallo:</strong> Pierdes los segundos que te quedaban y se bloquea tu respuesta en esa ronda.</li>
            <li><strong>Pasar:</strong> Si no lo sabes, pulsa «Pasar turno» para no arriesgar puntos (0 pts).</li>
          </ul>

          <p><strong>3. Fin de partida:</strong></p>
          <ul>
            <li>Las partidas constan de <strong>30 rondas</strong> (o hasta que el anfitrión decida finalizar). ¡Gana quien más puntos acumule!</li>
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
      <div className="lg-contenedor" style={{ position: 'relative' }}>
        <ModalAyuda />
        <MenuInicioJuego
            juegoId="logos"
            onOnline={() => { setVista('online_menu'); setErrorMsg(''); }}
            onLocal={onLocal}
            onAyuda={() => setModalAyuda(true)}
            error={errorMsg}
          />
      </div>
    );
  }

  if (vista === 'online_menu') {
    return (
      <div className="lg-contenedor" style={{ position: 'relative' }}>
        <ModalAyuda />
        <MenuModoOnline
          onVolver={() => { setVista('menu'); setErrorMsg(''); }}
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
      <div className="lg-contenedor" style={{ position: 'relative' }}>
        <ModalAyuda />
        {vista === 'crear' ? (
          <FormCrearSala
            onVolver={() => { setVista('online_menu'); setErrorMsg(''); }}
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
            onVolver={() => { setVista('online_menu'); setErrorMsg(''); }}
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
    <div className="lg-contenedor" style={{ position: 'relative' }}>
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

            {faltan > 0 && (
              <p className="hint" style={{ marginTop: '0.8rem' }}>Falta {faltan} jugador para poder empezar (mínimo 2).</p>
            )}
          </div>

          <div className="actions" style={{ marginTop: '1rem' }}>
            {esAdmin && (
              <button
                className="big full qq-btn-principal"
                disabled={faltan > 0}
                onClick={() => peticionPost(`sala/${sesion.code}/iniciar`)}
              >
                <Icon name="play" size={22} /> Empezar Partida (30 rondas)
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
            <span className="chip"><Icon name="cards" size={18} />Ronda {sala.rondaNum}/{sala.maxRondas}</span>
            <span className="chip alt"><Icon name="trophy" size={16} />{yo?.puntos || 0} pts</span>
          </div>

          <div className="lg-timer-wrap">
            <div className="lg-timer">
              <div
                className={`lg-timer-bar ${sala.segundosRestantes <= 10 ? 'low' : ''}`}
                style={{ width: `${Math.max(0, (sala.segundosRestantes / 60) * 100)}%` }}
              />
            </div>
            <div className="lg-timer-text">
              <Icon name="clock" size={18} /> {sala.segundosRestantes}s
            </div>
          </div>

          <div className="lg-stage-logo">
            {sala.logoImagen && (
              <img
                src={sala.logoImagen}
                alt="Logo misterioso"
                className="lg-logo-img"
              />
            )}
          </div>

          <div className="panel center">
            {sala.miJugada ? (
              <div className={`lg-alerta-jugada ${sala.miJugada.acierto ? 'acierto' : sala.miJugada.paso ? 'paso' : 'fallo'}`}>
                {sala.miJugada.acierto ? (
                  <>
                    <span>✔ ¡Acertaste!</span>
                    <small>Sumas +{sala.miJugada.delta} puntos.</small>
                  </>
                ) : sala.miJugada.paso ? (
                  <>
                    <span>⏭ Has pasado esta ronda</span>
                    <small>Esperando a los demás compañeros...</small>
                  </>
                ) : (
                  <>
                    <span>✖ Fallaste («{sala.miJugada.texto}»)</span>
                    <small>Pierdes {sala.miJugada.delta} puntos en esta ronda.</small>
                  </>
                )}
              </div>
            ) : (
              <form onSubmit={responder} className="lg-form-respuesta">
                <input
                  type="text"
                  className="lg-input-logo"
                  placeholder="Escribe el nombre de la marca..."
                  value={inputRespuesta}
                  onChange={(e) => setInputRespuesta(e.target.value)}
                  autoFocus
                />
                <button type="submit" className="big full" disabled={!inputRespuesta.trim()}>
                  <Icon name="check" size={20} /> Responder
                </button>
                <button type="button" className="lg-btn-pasar" onClick={pasar}>
                  Pasar turno
                </button>
              </form>
            )}
          </div>

          <div className="scoreboard-container" style={{ justifyContent: 'center', marginTop: '1rem' }}>
            {sala.jugadores?.map(j => (
              <div key={j.id} className="score-pill">
                <span>{j.nombre}: {j.haJugado ? '✔ Listo' : 'Pensando...'} ({j.puntos} pts)</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. RESULTADOS DE LA RONDA */}
      {sala.estado === 'resultados' && (
        <section className="game">
          <div className="end-card">
            <p className="categoria">Ronda {sala.rondaNum} de {sala.maxRondas}</p>
            <p className="hint">La marca correspondía a:</p>
            <h1 className="lg-respuesta-revelada">{sala.logoNombre}</h1>
            <div style={{ display: 'flex', justifyContent: 'center', margin: '0.8rem 0' }}>
              {sala.logoImagen && (
                <img
                  src={sala.logoImagen}
                  alt={sala.logoNombre}
                  style={{ height: '70px', objectFit: 'contain' }}
                />
              )}
            </div>
          </div>

          <div className="panel" style={{ marginTop: '1rem' }}>
            <h3 className="panel-title"><Icon name="speech" size={20} /> Respuestas en esta ronda:</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', margin: '0.8rem 0' }}>
              {sala.jugadores?.map(j => {
                const jgd = j.jugada;
                return (
                  <div key={j.id} style={{ padding: '0.6rem 0.8rem', background: '#f8fafc', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>{j.nombre} {j.esTu && '(Tú)'}:</strong>
                    <span>
                      {jgd?.acierto ? (
                        <span style={{ color: '#16a34a', fontWeight: 800 }}>✔ «{jgd.texto}» (+{jgd.delta} pts)</span>
                      ) : jgd?.paso ? (
                        <span style={{ color: '#64748b', fontWeight: 700 }}>Paso (0 pts)</span>
                      ) : jgd ? (
                        <span style={{ color: '#dc2626', fontWeight: 800 }}>✖ «{jgd.texto}» ({jgd.delta} pts)</span>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>Sin respuesta</span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
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

      {/* 4. PODIO FINAL */}
      {sala.estado === 'fin' && (
        <section className="game">
          <div className="end-card">
            <span className="end-icon"><Icon name="trophy" size={44} /></span>
            <h1 className="title">¡Partida Terminada!</h1>
            <p className="final-score" style={{ color: '#0891b2' }}>
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