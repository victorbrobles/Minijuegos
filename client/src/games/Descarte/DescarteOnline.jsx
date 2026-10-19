// client/src/games/Descarte/DescarteOnline.jsx
import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../components/Icon.jsx';
import './Descarte.css';
import '../Adivina/Adivina.css';

const CLAVE_SESION_DSC = 'descarte_online_session';

const LETRAS_CONFIG = [
  { l: 'A', pts: 1 }, { l: 'B', pts: 1 }, { l: 'C', pts: 1 }, { l: 'D', pts: 1 }, { l: 'E', pts: 1 },
  { l: 'F', pts: 2 }, { l: 'G', pts: 2 }, { l: 'H', pts: 2 }, { l: 'I', pts: 2 }, { l: 'J', pts: 3 },
  { l: 'K', pts: 3 }, { l: 'L', pts: 1 }, { l: 'M', pts: 1 }, { l: 'N', pts: 2 }, { l: 'Ñ', pts: 3 },
  { l: 'O', pts: 2 }, { l: 'P', pts: 1 }, { l: 'Q', pts: 3 }, { l: 'R', pts: 1 }, { l: 'S', pts: 1 },
  { l: 'T', pts: 1 }, { l: 'U', pts: 2 }, { l: 'V', pts: 2 }, { l: 'W', pts: 3 }, { l: 'X', pts: 3 },
  { l: 'Y', pts: 3 }, { l: 'Z', pts: 3 }
];

export default function DescarteOnline({ onLocal, onSalir }) {
  const [vista, setVista] = useState('menu');
  const [nombre, setNombre] = useState('');
  const [codigoInput, setCodigoInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);
  const [modalSalir, setModalSalir] = useState(false);
  const [modalAyuda, setModalAyuda] = useState(false);
  const [codigoCopiado, setCodigoCopiado] = useState(false);
  const [letraElegidaAdmin, setLetraElegidaAdmin] = useState('');

  const [sala, setSala] = useState(null);
  const [sesion, setSesion] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem(CLAVE_SESION_DSC)); } catch { return null; }
  });

  const intervalRef = useRef(null);

  useEffect(() => {
    if (!sesion) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setSala(null);
      return;
    }

    const consultarEstado = () => {
      fetch(`/api/descarte/sala/${sesion.code}?token=${sesion.token}`)
        .then(r => r.ok ? r.json() : Promise.reject('Sala no disponible'))
        .then(d => {
          if (d.success) {
            setSala(d);
            setVista('sala');
          }
        }).catch(() => {
          sessionStorage.removeItem(CLAVE_SESION_DSC);
          setSesion(null);
          setSala(null);
          setVista('menu');
        });
    };

    consultarEstado();
    intervalRef.current = setInterval(consultarEstado, 1000);
    return () => clearInterval(intervalRef.current);
  }, [sesion]);

  // Cierra automáticamente el modal de ayuda al iniciarse la partida
  useEffect(() => {
    if (sala && sala.estado !== 'lobby') {
      setModalAyuda(false);
    }
  }, [sala?.estado]);

  const peticionPost = async (endpoint, extraBody = {}) => {
    setCargando(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/descarte/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion?.token, code: sesion?.code, ...extraBody })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.token) {
        const nueva = { code: data.code, token: data.token };
        sessionStorage.setItem(CLAVE_SESION_DSC, JSON.stringify(nueva));
        setSesion(nueva);
      }
      return data;
    } catch (err) {
      setErrorMsg(err.message);
      return null;
    } finally {
      setCargando(false);
      setLetraElegidaAdmin('');
    }
  };

  const handleCrear = () => nombre.trim() && peticionPost('crear', { nombre });
  const handleUnirse = () => nombre.trim() && codigoInput && peticionPost('unirse', { nombre, joinCode: codigoInput.toUpperCase() });

  const handleSalir = () => {
    if (sesion) peticionPost(`sala/${sesion.code}/salir`);
    sessionStorage.removeItem(CLAVE_SESION_DSC);
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
          <h3>¿Cómo se juega a Descarta y Elimina?</h3>
        </div>

        <div className="aprox-modal-cuerpo">
          <p><strong>1. Dinámica del reto:</strong></p>
          <ul>
            <li>En cada turno, el <strong>Retador</strong> elige a un rival de la sala y le impone una <strong>categoría trampa</strong> de entre 3 opciones.</li>
            <li>El jugador desafiado tiene <strong>30 segundos</strong> para decir en voz alta una palabra válida que comience por una letra aún disponible en el abecedario.</li>
          </ul>

          <p><strong>2. Eliminación de letras y puntuación:</strong></p>
          <ul>
            <li>Cada letra acertada <strong>queda tachada del abecedario</strong> y no se podrá volver a usar durante ese tablero.</li>
            <li><strong>🔵 1 punto (fáciles):</strong> A, B, C, D, E, L, M, P, R, S, T.</li>
            <li><strong>🟡 2 puntos (medias):</strong> F, G, H, I, N, O, U, V.</li>
            <li><strong>🔴 3 puntos (difíciles):</strong> J, K, Ñ, Q, W, X, Y, Z.</li>
            <li>El anfitrión valida la palabra tocando la letra correspondiente en el tablero de control.</li>
          </ul>

          <p><strong>3. Fin de tablero y Partida:</strong></p>
          <ul>
            <li>El tablero se renueva cuando se <strong>eliminan todas las letras</strong> o cuando <strong>todos los jugadores fallan consecutivamente</strong>.</li>
            <li>La partida consta de <strong>5 tableros</strong>. ¡El jugador con más puntos acumulados se corona ganador!</li>
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
      <div className="dsc-contenedor" style={{ position: 'relative' }}>
        <ModalAyuda />
        <section className="game">
          <div className="panel center" style={{ position: 'relative' }}>
            <BotonAyudaCard />
            <span className="lb-luna chica"><Icon name="x" size={42} strokeWidth={1.6} /></span>
            <h1 className="title">Descarta y Elimina!</h1>
            <p className="hint">Reta a tus amigos con categorías trampas y elimina letras del abecedario.</p>
            {errorMsg && <p className="error" style={{ margin: '0.8rem 0' }}>{errorMsg}</p>}
            <div className="lb-menu">
              <button className="big full" onClick={() => { setVista('crear'); setErrorMsg(''); }}>
                <Icon name="crown" size={22} /> Crear partida
              </button>
              <button className="big full" onClick={() => { setVista('unirse'); setErrorMsg(''); }}>
                <Icon name="users" size={22} /> Unirse a partida
              </button>
              <button className="secondary full" onClick={onLocal}>
                <Icon name="home" size={20} /> Jugar en un dispositivo
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (vista === 'crear' || vista === 'unirse') {
    return (
      <div className="dsc-contenedor" style={{ position: 'relative' }}>
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
  const faltan = 3 - sala.jugadores.length;

  const retador = sala.jugadores.find(j => j.id === sala.jugadorRetadorId);
  const activo = sala.jugadores.find(j => j.id === sala.jugadorActivoId);
  const soyElRetador = yo?.id === sala.jugadorRetadorId;
  const soyElActivo = yo?.id === sala.jugadorActivoId;

  // Rivales elegibles
  const rivalesElegibles = sala.jugadores.filter(j => 
    j.id !== sala.jugadorRetadorId && !sala.jugadosEnCiclo?.includes(j.id)
  );

  const ranking = [...sala.jugadores].sort((a, b) => b.puntos - a.puntos);
  const maxPuntos = ranking.length > 0 ? ranking[0].puntos : 0;
  const ganadores = maxPuntos > 0 ? ranking.filter(j => j.puntos === maxPuntos) : [];

  return (
    <div className="dsc-contenedor" style={{ position: 'relative' }}>
      <ModalAyuda />

      {/* 1. LOBBY */}
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
            <h3 className="panel-title"><Icon name="users" size={20} /> Jugadores ({sala.jugadores.length}/12)</h3>
            <div className="lb-lista">
              {sala.jugadores.map((j) => (
                <div key={j.id} className={`lb-jug ${j.esTu ? 'yo' : ''}`}>
                  <span className="lb-jug-nombre">{j.nombre} {j.esTu && '(tú)'} {j.esAdmin && '👑'}</span>
                </div>
              ))}
            </div>
            {faltan > 0 && (
              <p className="hint" style={{ marginTop: '0.8rem' }}>Faltan {faltan} jugador{faltan === 1 ? '' : 'es'} para poder empezar (mínimo 3).</p>
            )}
          </div>

          <div className="actions" style={{ marginTop: '1rem' }}>
            {esAdmin && (
              <button
                className="big full"
                disabled={faltan > 0}
                onClick={() => peticionPost(`sala/${sesion.code}/iniciar`)}
              >
                <Icon name="play" size={22} /> Empezar Partida (5 Tableros)
              </button>
            )}
            <button className="secondary danger full" onClick={() => setModalSalir(true)}>
              <Icon name="door" size={20} /> Salir
            </button>
          </div>
        </section>
      )}

      {/* 2. RETADOR NOMINA A UN RIVAL - Ayuda oculta */}
      {sala.estado === 'eligiendo_rival' && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="users" size={18} />Retador: {retador?.nombre}</span>
            <span className="chip alt">Tablero {sala.tableroActual}/5</span>
          </div>

          <div className="panel center">
            {soyElRetador ? (
              <>
                <h2 className="title">¡Elige a quién desafías!</h2>
                <p className="hint">Selecciona qué jugador responderá en este turno:</p>
                <div className="dsc-opciones-cat">
                  {(rivalesElegibles.length > 0 ? rivalesElegibles : sala.jugadores.filter(j => j.id !== yo?.id)).map(r => (
                    <button
                      key={r.id}
                      type="button"
                      className="dsc-cat-btn"
                      onClick={() => peticionPost(`sala/${sesion.code}/elegir-rival`, { idRival: r.id })}
                    >
                      🎯 Desafiar a {r.nombre} ({r.puntos} pts)
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ padding: '2.5rem 1rem' }}>
                <span className="lb-luna chica"><Icon name="hourglass" size={40} /></span>
                <h3>{retador?.nombre} está eligiendo rival...</h3>
                <p className="hint">Pronto se revelará a quién va a desafiar.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 3. RETADOR ELIGE CATEGORÍA PARA EL RIVAL */}
      {sala.estado === 'eligiendo_cat' && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="users" size={18} />{activo?.nombre} responderá</span>
            <span className="chip alt">Tablero {sala.tableroActual}/5</span>
          </div>

          <div className="panel center">
            {soyElRetador || (!retador && soyElActivo) ? (
              <>
                <h2 className="title">
                  {soyElRetador ? `Elige la categoría trampa para ${activo?.nombre}:` : 'Elige tu categoría para empezar:'}
                </h2>
                <div className="dsc-opciones-cat">
                  {sala.tresCategorias?.map((cat, i) => (
                    <button
                      key={i}
                      type="button"
                      className="dsc-cat-btn"
                      onClick={() => peticionPost(`sala/${sesion.code}/elegir-cat`, { categoria: cat })}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ padding: '2.5rem 1rem' }}>
                <span className="lb-luna chica"><Icon name="hourglass" size={40} /></span>
                <h3>{retador ? `${retador.nombre} está eligiendo temática para ${activo?.nombre}...` : `Esperando a ${activo?.nombre}...`}</h3>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 4. RESPONDIENDO (TABLERO ACTIVO CON PUNTOS POR LETRA) */}
      {sala.estado === 'respondiendo' && activo && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="users" size={18} />Responde: {activo.nombre}</span>
            <span className="chip alt">Tablero {sala.tableroActual}/5</span>
          </div>

          <div className="panel center">
            <div className={`dsc-timer-badge ${sala.segundosRestantes <= 5 ? 'peligro' : ''}`}>
              {sala.segundosRestantes}s
            </div>

            <div className="dsc-cat-activa">
              <span className="field-label" style={{ color: 'rgba(255,255,255,0.85)', marginBottom: '0.3rem' }}>Categoría:</span>
              <h2>{sala.categoriaActiva}</h2>
            </div>

            {/* Leyenda de dificultad */}
            <div className="dsc-leyenda-puntos">
              <span className="dsc-leyenda-tag" style={{ color: '#1d4ed8' }}>🔵 1 pto</span>
              <span className="dsc-leyenda-tag" style={{ color: '#b45309' }}>🟡 2 ptos</span>
              <span className="dsc-leyenda-tag" style={{ color: '#be123c' }}>🔴 3 ptos</span>
            </div>

            <p className="hint">
              {soyElActivo
                ? '¡Di en voz alta una palabra válida de la categoría que empiece por una de las letras disponibles!'
                : `${activo.nombre} debe decir en voz alta una palabra válida antes de que se acaben los 30s.`}
            </p>

            {/* TABLERO A-Z CON PUNTOS */}
            <div className="dsc-tablero-grid">
              {LETRAS_CONFIG.map(({ l, pts }) => {
                const disponible = sala.letrasDisponibles?.includes(l);
                const seleccionada = letraElegidaAdmin === l;
                return (
                  <div
                    key={l}
                    className={`dsc-letra-card ${disponible ? `disponible pts-${pts}` : 'eliminada'} ${seleccionada ? 'seleccionada' : ''}`}
                    onClick={() => esAdmin && disponible && setLetraElegidaAdmin(l)}
                  >
                    <span className="dsc-letra-char">{l}</span>
                    <span className="dsc-letra-pts">+{pts}</span>
                  </div>
                );
              })}
            </div>

            {/* PANEL EXCLUSIVO DEL ADMINISTRADOR */}
            {esAdmin ? (
              <div className="dsc-admin-box">
                <span className="field-label">Panel del Anfitrión (Toca en el tablero la letra dicha):</span>
                <p style={{ fontWeight: 800, margin: '0.4rem 0 1rem' }}>
                  Letra elegida: {letraElegidaAdmin ? (
                    <strong style={{ color: '#be123c', fontSize: '1.4rem' }}>
                      {letraElegidaAdmin} (+{LETRAS_CONFIG.find(x => x.l === letraElegidaAdmin)?.pts} pts)
                    </strong>
                  ) : 'Ninguna'}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                  <button
                    type="button"
                    className="big full"
                    style={{ background: '#16a34a', borderColor: '#15803d' }}
                    disabled={!letraElegidaAdmin}
                    onClick={() => peticionPost(`sala/${sesion.code}/verificar`, { acierto: true, letra: letraElegidaAdmin })}
                  >
                    <Icon name="check" size={20} /> Correcta
                  </button>
                  <button
                    type="button"
                    className="secondary danger full"
                    onClick={() => peticionPost(`sala/${sesion.code}/verificar`, { acierto: false })}
                  >
                    <Icon name="x" size={20} /> Fallo / Pasa
                  </button>
                </div>
              </div>
            ) : (
              <p className="hint small" style={{ marginTop: '0.8rem' }}>
                El anfitrión validará la palabra dicha en voz alta.
              </p>
            )}
          </div>
        </section>
      )}

      {/* 5. CAMBIO DE TABLERO */}
      {sala.estado === 'cambio_tablero' && (
        <section className="game">
          <div className="end-card">
            <span className="end-icon"><Icon name="refresh" size={44} /></span>
            <p className="categoria">Fin del tablero {sala.tableroActual}</p>
            <h1 className="title">¡Nuevo Tablero!</h1>
            <p className="reveal">{sala.logTurno}</p>
          </div>

          <div className="panel" style={{ marginTop: '1rem' }}>
            <h3 className="panel-title"><Icon name="trophy" size={20} /> Clasificación actual</h3>
            <div className="scoreboard">
              {ranking.map((j, i) => (
                <div key={j.id} className={`score-row ${i === 0 && j.puntos > 0 ? 'first' : ''}`}>
                  <span className="score-name">{i + 1}. {j.nombre} {j.esTu && '(Tú)'}</span>
                  <span className="score-pts">{j.puntos} {j.puntos === 1 ? 'pto' : 'ptos'}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="actions" style={{ marginTop: '1.2rem' }}>
            {esAdmin ? (
              <>
                <button className="big full" onClick={() => peticionPost(`sala/${sesion.code}/siguiente-tablero`)}>
                  <Icon name="play" size={20} /> Empezar Tablero {sala.tableroActual + 1}
                </button>
                <button className="secondary danger full" onClick={() => peticionPost(`sala/${sesion.code}/terminar-ya`)}>
                  Finalizar partida ahora
                </button>
              </>
            ) : (
              <p className="hint center">Esperando a que el anfitrión inicie el siguiente tablero...</p>
            )}
          </div>
        </section>
      )}

      {/* 6. FIN / PODIO */}
      {sala.estado === 'fin' && (
        <section className="game">
          <div className="end-card">
            <span className="end-icon"><Icon name="trophy" size={44} /></span>
            <h1 className="title">¡Partida Terminada!</h1>
            <p className="final-score" style={{ color: '#be123c' }}>
              {ganadores.length === 0
                ? 'Nadie consiguió puntos.'
                : `🏆 Ganador: ${ganadores.map(g => g.nombre).join(', ')} con ${maxPuntos} ptos`}
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