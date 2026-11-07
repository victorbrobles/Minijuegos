// client/src/games/Bingoball/BingoballOnline.jsx
import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../components/Icon.jsx';
import './Bingoball.css';
import '../Adivina/Adivina.css';
import { MenuInicioJuego, FormCrearSala, FormUnirseSala, CabeceraSala, EsperandoAnfitrion } from '../../components/MenuJuego.jsx';

const CLAVE_SESION_BB = 'bingoball_online_session';

const CATEGORIAS_PRINCIPALES = [
  { id: 'internacional', nombre: 'Fútbol Internacional y Selecciones' },
  { id: 'champions', nombre: 'UEFA Champions League' },
  { id: 'laliga', nombre: 'La Liga Española' },
  { id: 'grandes_ligas', nombre: 'Grandes Ligas Europeas' },
  { id: 'leyendas', nombre: 'Leyendas y Récords' }
];

export default function BingoballOnline({ onSalir }) {
  const [vista, setVista] = useState('menu');
  const [nombre, setNombre] = useState('');
  const [codigoInput, setCodigoInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);
  const [modalSalir, setModalSalir] = useState(false);
  const [modalAyuda, setModalAyuda] = useState(false);
  const [codigoCopiado, setCodigoCopiado] = useState(false);

  const [feedbackTurno, setFeedbackTurno] = useState('');
  const [siguienteGrupoId, setSiguienteGrupoId] = useState('');

  const [sala, setSala] = useState(null);
  const [sesion, setSesion] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem(CLAVE_SESION_BB)); } catch { return null; }
  });

  const intervalRef = useRef(null);

  useEffect(() => {
    if (!sesion) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setSala(null);
      return;
    }

    const consultarEstado = () => {
      fetch(`/api/bingoball/sala/${sesion.code}?token=${sesion.token}`)
        .then(r => r.ok ? r.json() : Promise.reject('Sala no disponible'))
        .then(d => {
          if (d.success) {
            setSala(d);
            setVista('sala');
            if (!siguienteGrupoId && d.grupoId) {
              setSiguienteGrupoId(d.grupoId);
            }
          }
        }).catch(() => {
          sessionStorage.removeItem(CLAVE_SESION_BB);
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
      const res = await fetch(`/api/bingoball/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion?.token, code: sesion?.code, ...extraBody })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.token) {
        const nueva = { code: data.code, token: data.token };
        sessionStorage.setItem(CLAVE_SESION_BB, JSON.stringify(nueva));
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
    sessionStorage.removeItem(CLAVE_SESION_BB);
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

  const handleMarcarCasilla = async (casilla) => {
    if (casilla.marcada || sala.bloqueado) return;
    setFeedbackTurno('');
    const d = await peticionPost(`sala/${sesion.code}/marcar`, { casillaId: casilla.id });
    if (d?.mensaje) setFeedbackTurno(d.mensaje);
  };

  const handleCantarLinea = (filaIndex) => {
    peticionPost(`sala/${sesion.code}/linea`, { filaIndex });
  };

  const yo = sala?.jugadores?.find(j => j.esTu);
  const esAdmin = yo?.esAdmin;
  const faltan = 3 - (sala?.jugadores?.length || 0);

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
          <h3>¿Cómo se juega a Bingoball?</h3>
        </div>
        <div className="aprox-modal-cuerpo">
          <p><strong>1. El Cartón (4x3):</strong></p>
          <ul>
            <li>Cada participante recibe un cartón de <strong>12 categorías</strong> elegidas al azar de un total de 20.</li>
            <li>Tendrás <strong>10 segundos</strong> al inicio para memorizar la disposición de tu cartón.</li>
          </ul>
          <p><strong>2. Jugadores en pantalla (15s):</strong></p>
          <ul>
            <li>Aparecerán futbolistas en pantalla de uno en uno durante <strong>15 segundos</strong>. Toca una casilla válida de tu cartón para colocarlo.</li>
            <li>Cada acierto suma <strong>+2 puntos</strong>.</li>
            <li><strong>¡Cuidado al fallar!</strong> Si te equivocas, se te restará <strong>-1 punto</strong> y quedarás bloqueado durante el resto de ese turno.</li>
          </ul>
          <p><strong>3. Líneas y Bingo:</strong></p>
          <ul>
            <li><strong>Línea (+15 pts):</strong> Al completar las 3 casillas de una fila entera puedes cantar línea. La fila se renovará con nuevas categorías.</li>
            <li><strong>Bingo (+25 pts):</strong> El primer jugador en rellenar todas las casillas de su cartón consigue el Bingo.</li>
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
      <div className="bb-contenedor" style={{ position: 'relative' }}>
        <ModalAyuda />
        <MenuInicioJuego
            juegoId="bingoball"
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
      <div className="bb-contenedor" style={{ position: 'relative' }}>
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
    <div className="bb-contenedor" style={{ position: 'relative' }}>
      <ModalAyuda />

      {/* 1. LOBBY */}
      {sala.estado === 'lobby' && (
        <section className="game qq-pantalla">
          <CabeceraSala codigo={sala.code} onVolver={() => setModalSalir(true)} onAyuda={() => setModalAyuda(true)} />

          <div className="panel qq-menu-panel" style={{ marginTop: '1rem' }}>
            <h3 className="qq-sala-titulo"><Icon name="users" size={20} /> Jugadores ({sala.jugadores.length}/15)</h3>
            <div className="lb-lista qq-sala-lista">
              {sala.jugadores.map((j) => (
                <div key={j.id} className={`lb-jug ${j.esTu ? 'yo' : ''}`}>
                  <span className="lb-jug-nombre">{j.nombre} {j.esTu && '(tú)'} {j.esAdmin && '👑'}</span>
                </div>
              ))}
            </div>

            {esAdmin ? (
              <div style={{ marginTop: '1.2rem', textAlign: 'left' }}>
                <label className="field-label" htmlFor="bb-select-tema">
                  Categoría del Bingo
                </label>
                <select
                  id="bb-select-tema"
                  value={sala.grupoId || 'internacional'}
                  onChange={(e) => peticionPost(`sala/${sesion.code}/configurar`, { grupoId: e.target.value })}
                >
                  {CATEGORIAS_PRINCIPALES.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                  ))}
                </select>
                <p className="hint small" style={{ marginTop: '0.4rem' }}>
                  Se seleccionará un bingo aleatorio de esta temática al iniciar la ronda.
                </p>
              </div>
            ) : (
              <div style={{ marginTop: '0.8rem', padding: '0.6rem', background: '#f8fafc', borderRadius: '10px', textAlign: 'center' }}>
                <span className="hint small">Categoría: <strong>{CATEGORIAS_PRINCIPALES.find(c => c.id === sala.grupoId)?.nombre || sala.grupoId}</strong></span>
              </div>
            )}

            {faltan > 0 && (
              <p className="hint" style={{ marginTop: '0.8rem' }}>Faltan {faltan} jugador{faltan === 1 ? '' : 'es'} para poder empezar (mínimo 3).</p>
            )}
          </div>

          <div className="actions" style={{ marginTop: '1rem' }}>
            {esAdmin && (
              <button
                className="big full qq-btn-principal"
                disabled={faltan > 0}
                onClick={() => peticionPost(`sala/${sesion.code}/iniciar`)}
              >
                <Icon name="play" size={22} /> Empezar Bingoball
              </button>
            )}
          </div>

          {!esAdmin && <EsperandoAnfitrion />}
        </section>
      )}

      {/* 2. PREPARACIÓN */}
      {sala.estado === 'preparacion' && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="eye" size={18} />Memoriza tu cartón</span>
            <span className="chip alt"><Icon name="clock" size={16} /> {sala.segundosRestantes}s</span>
          </div>

          <div className="panel center">
            <h2 style={{ margin: '0 0 0.4rem', color: '#1e1b4b' }}>¡Revisa tus categorías!</h2>
            <p className="hint small">En {sala.segundosRestantes} segundos empezarán a salir futbolistas (15s cada uno):</p>

            <div className="bb-carton-wrap">
              {[0, 1, 2, 3].map(fila => (
                <div key={fila} className="bb-fila-contenedor">
                  <div className="bb-fila-grid">
                    {sala.miCarton?.filter(c => c.fila === fila).map(casilla => (
                      <div key={casilla.id} className="bb-casilla-btn" style={{ cursor: 'default' }}>
                        <span className="bb-casilla-cat">{casilla.nombre}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. CUENTA ATRÁS 3..2..1 */}
      {sala.estado === 'cuenta_atras' && (
        <div className="bb-overlay-countdown">
          <p style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 1rem' }}>¡ATENTOS AL CARTÓN!</p>
          <div className="bb-countdown-num">{sala.cuentaAtras321}</div>
        </div>
      )}

      {/* 4. EN JUEGO */}
      {sala.estado === 'jugando' && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="soccer" size={18} />En juego</span>
            <span className="chip alt">Puntos: {sala.puntos || 0} pts</span>
          </div>

          <div className="bb-jugador-display">
            <div className="bb-jugador-avatar">⚽</div>
            <h2 className="bb-jugador-nombre">{sala.jugadorActual}</h2>
            <div className={`bb-timer-badge ${sala.segundosRestantes <= 4 ? 'peligro' : ''}`}>
              <Icon name="clock" size={15} /> {sala.segundosRestantes}s restantes
            </div>
          </div>

          {sala.bloqueado && (
            <div className="bb-alerta-bloqueo">
              🚫 ¡Has fallado! Bloqueado en este turno (-1 pt). Espera al siguiente futbolista.
            </div>
          )}

          {feedbackTurno && (
            <div className="bb-alerta-bloqueo" style={{ background: '#fef3c7', borderColor: '#f59e0b', color: '#92400e' }}>
              {feedbackTurno}
            </div>
          )}

          <div className="panel" style={{ padding: '0.8rem' }}>
            <h3 className="panel-title" style={{ textAlign: 'center', marginBottom: '0.6rem' }}>
              Tu Cartón (4x3)
            </h3>

            <div className="bb-carton-wrap">
              {[0, 1, 2, 3].map(fila => {
                const casillasFila = sala.miCarton?.filter(c => c.fila === fila) || [];
                const filaCompleta = casillasFila.length === 3 && casillasFila.every(c => c.marcada);

                return (
                  <div key={fila} className="bb-fila-contenedor">
                    <div className="bb-fila-grid">
                      {casillasFila.map(casilla => (
                        <button
                          key={casilla.id}
                          type="button"
                          className={`bb-casilla-btn ${casilla.marcada ? 'marcada' : ''}`}
                          disabled={casilla.marcada || sala.bloqueado}
                          onClick={() => handleMarcarCasilla(casilla)}
                        >
                          <span className="bb-casilla-cat">{casilla.nombre}</span>
                          {casilla.marcada && (
                            <span className="bb-casilla-marcada-badge" title={casilla.jugadorAsignado}>
                              ✔ {casilla.jugadorAsignado}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>

                    {filaCompleta && (
                      <button
                        type="button"
                        className="bb-btn-linea"
                        onClick={() => handleCantarLinea(fila)}
                      >
                        ⭐ ¡Línea! (+15 pts)
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="scoreboard-container" style={{ justifyContent: 'center', marginTop: '0.8rem' }}>
            {sala.jugadores?.map(j => (
              <div key={j.id} className="score-pill">
                <span>{j.nombre}: <strong>{j.puntos} pts</strong></span>
              </div>
            ))}
          </div>

          <button className="secondary danger full" style={{ marginTop: '1.2rem' }} onClick={() => setModalSalir(true)}>
            <Icon name="door" size={20} /> Salir de la partida
          </button>
        </section>
      )}

      {/* 5. FIN DEL BINGO (CARTÓN RESUELTO) */}
      {sala.estado === 'bingo_cantado' && (
        <section className="game">
          <div className="end-card">
            <span className="end-icon">🎉</span>
            <h1 className="title">¡BINGO COMPLETADO!</h1>
            <p className="final-score" style={{ color: '#16a34a' }}>
              ¡{sala.ganadorBingo || 'Un jugador'} ha cantado BINGO (+25 pts)!
            </p>
          </div>

          <div className="panel" style={{ marginTop: '1rem' }}>
            <h3 className="panel-title"><Icon name="trophy" size={20} /> Marcador Acumulado</h3>
            <div className="scoreboard">
              {ranking.map((j, i) => (
                <div key={j.id} className={`score-row ${i === 0 && j.puntos > 0 ? 'first' : ''}`}>
                  <span className="score-name">{i + 1}. {j.nombre} {j.esTu && '(Tú)'}</span>
                  <span className="score-pts">{j.puntos} pts</span>
                </div>
              ))}
            </div>
          </div>

          {esAdmin ? (
            <div className="panel" style={{ marginTop: '1rem' }}>
              <h3 className="panel-title"><Icon name="cards" size={20} /> Siguiente Bingo</h3>
              <p className="hint small">Elige la categoría para el siguiente cartón:</p>
              
              <select
                value={siguienteGrupoId || sala.grupoId}
                onChange={(e) => setSiguienteGrupoId(e.target.value)}
                style={{ marginBottom: '1rem' }}
              >
                {CATEGORIAS_PRINCIPALES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                ))}
              </select>

              <div className="actions">
                <button
                  className="big full"
                  onClick={() => peticionPost(`sala/${sesion.code}/siguiente-bingo`, { grupoId: siguienteGrupoId || sala.grupoId })}
                >
                  <Icon name="play" size={20} /> Jugar Siguiente Bingo (+Puntos)
                </button>
                <button
                  className="secondary danger full"
                  onClick={() => peticionPost(`sala/${sesion.code}/finalizar`)}
                >
                  <Icon name="trophy" size={20} /> Finalizar Partida y Ver Podio
                </button>
              </div>
            </div>
          ) : (
            <p className="hint center" style={{ marginTop: '1rem' }}>
              Esperando a que el anfitrión inicie el siguiente bingo o finalice la partida...
            </p>
          )}

          <div className="actions" style={{ marginTop: '1rem' }}>
            <button className="secondary full" onClick={() => setModalSalir(true)}>
              <Icon name="door" size={20} /> Salir de la sala
            </button>
          </div>
        </section>
      )}

      {/* 6. PODIO DEFINITIVO */}
      {sala.estado === 'final' && (
        <section className="game">
          <div className="end-card">
            <span className="end-icon"><Icon name="crown" size={44} /></span>
            <h1 className="title">¡FIN DEL TORNEO!</h1>
            <p className="final-score" style={{ color: '#eab308' }}>
              🏆 Ganador: {ganadores.map(g => g.nombre).join(', ')} con {maxPuntos} pts
            </p>
          </div>

          <div className="panel reveal-panel" style={{ marginTop: '1rem' }}>
            <h3 className="reveal-title"><Icon name="podium" size={20} /> Clasificación Final Definitiva</h3>
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
                <Icon name="refresh" size={20} /> Reiniciar Torneo desde cero
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
              Perderás tu cartón y tus puntos acumulados. ¿Deseas salir?
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