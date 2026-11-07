// client/src/games/CuatroClubes/CuatroClubesOnline.jsx
import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../components/Icon.jsx';
import '../Adivina/Adivina.css';
import './CuatroClubes.css';
import { MenuInicioJuego, MenuModoOnline, FormCrearSala, FormUnirseSala, CabeceraSala, EsperandoAnfitrion } from '../../components/MenuJuego.jsx';

const CLAVE_SESION_CC = 'cuatroclubes_online_session';
const TIEMPO_S = 90; // 90 segundos por turno de cada jugador

function EscudoClub({ club }) {
  const [imgError, setImgError] = useState(false);
  const c1 = club?.colores?.[0] || '#1e293b';
  const c2 = club?.colores?.[1] || '#3b82f6';

  return (
    <div className="cc-club-card">
      <div className="cc-escudo-wrap">
        {club?.escudo && !imgError ? (
          <img
            src={club.escudo}
            alt={club.nombre}
            className="cc-escudo-img"
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className="cc-escudo-fallback"
            style={{ background: `linear-gradient(135deg, ${c1} 50%, ${c2} 50%)` }}
          >
            <span>{club?.siglas || club?.nombre?.substring(0, 3).toUpperCase()}</span>
          </div>
        )}
      </div>
      <span className="cc-club-nombre">{club?.nombre}</span>
    </div>
  );
}

export default function CuatroClubesOnline({ onLocal, onSalir }) {
  const [vista, setVista] = useState('menu');
  const [nombre, setNombre] = useState('');
  const [codigoInput, setCodigoInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);
  const [modalSalir, setModalSalir] = useState(false);
  const [modalAyuda, setModalAyuda] = useState(false);
  const [modalRespuestas, setModalRespuestas] = useState(false);

  const [sesion, setSesion] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(CLAVE_SESION_CC));
    } catch {
      return null;
    }
  });

  const [sala, setSala] = useState(null);
  const [codigoCopiado, setCodigoCopiado] = useState(false);
  const intervalRef = useRef(null);
  const estadoPrevioRef = useRef(null);

  useEffect(() => {
    if (!sesion) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setSala(null);
      return;
    }

    const consultarEstado = () => {
      fetch(`/api/cuatroclubes/online/sala/${sesion.code}?token=${sesion.token}`)
        .then((r) => {
          if (!r.ok) throw new Error('Sala no disponible');
          return r.json();
        })
        .then((d) => {
          if (d.success) {
            if (estadoPrevioRef.current !== 'resumen' && d.estado === 'resumen') {
              setModalRespuestas(true);
            } else if (d.estado === 'jugando') {
              setModalRespuestas(false);
            }
            estadoPrevioRef.current = d.estado;
            setSala(d);
            setVista('sala');
          }
        })
        .catch(() => {
          sessionStorage.removeItem(CLAVE_SESION_CC);
          setSesion(null);
          setSala(null);
          setVista('online_menu');
          setErrorMsg('La sala se ha cerrado.');
        });
    };

    consultarEstado();
    intervalRef.current = setInterval(consultarEstado, 600);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sesion]);

  const apiFetch = async (endpoint, payload) => {
    const res = await fetch(`/api/cuatroclubes/online/${endpoint}`, {
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
      sessionStorage.setItem(CLAVE_SESION_CC, JSON.stringify(nueva));
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
      const data = await apiFetch('unirse', {
        code: codigoInput.trim().toUpperCase(),
        nombre: nombre.trim()
      });
      if (!data.success) throw new Error(data.error);
      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_CC, JSON.stringify(nueva));
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

  const handlePuntuar = (puntos) => {
    accionSala('puntuar', { puntos });
  };

  const handleSalir = () => {
    if (sala) {
      accionSala('abandonar').catch(() => console.error('Error al abandonar sala'));
    }
    sessionStorage.removeItem(CLAVE_SESION_CC);
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

  const esAdmin = sala?.esAdmin;
  const ronda = sala?.ronda;
  const ranking = sala?.jugadores ? [...sala.jugadores].sort((a, b) => b.puntos - a.puntos) : [];
  const maximo = ranking.length ? ranking[0].puntos : 0;

  // Calcular quién abrirá la siguiente ronda cuando cambien los 4 clubes
  const proximoInicialNombre = (() => {
    if (!sala?.jugadores?.length) return '';
    const n = sala.jugadores.length;
    const sigIdx = (sala.rondaNum || 1) % n;
    return sala.jugadores[sigIdx]?.nombre || '';
  })();

  return (
    <div className="rk-contenedor">

      {modalAyuda && (
        <div className="rg-modal-fondo" onClick={() => setModalAyuda(false)}>
          <div className="rg-modal rk-modal-ayuda" onClick={(e) => e.stopPropagation()}>
            <div className="rk-modal-header">
              <span className="rk-modal-signo-title">?</span>
              <h3>¿Cómo se juega a El club de los cuatro?</h3>
            </div>
            <div className="rk-modal-cuerpo">
              <p>
                En cada ronda aparecerán en pantalla los <strong>escudos de 4 clubes distintos</strong>. Cada jugador debe nombrar en su turno un futbolista que haya jugado en el máximo número posible de esos clubes.
              </p>
              <ul>
                <li><strong>2 a 10 jugadores:</strong> El juego dura tantas rondas como jugadores haya por 3 (cada jugador inicia 3 rondas).</li>
                <li><strong>Rotación en cada ronda:</strong> Cuando cambian los 4 clubes, empieza la nueva ronda el siguiente jugador en orden secuencial.</li>
                <li><strong>Temporizador de 90s:</strong> Cada jugador dispone de 90 segundos en su turno para responder en voz alta.</li>
                <li><strong>Validación del Anfitrión (👑):</strong> En el modo online, solo al admin le aparecerán los botones para elegir cuántos clubes correctos (0 a 4) suma el futbolista de cada jugador (1 punto por club).</li>
                <li><strong>Soluciones al acabar la ronda:</strong> Al terminar cada ronda se abrirá una ventana mostrando ejemplos de jugadores que pasaron por los 4 clubes y por 3 de ellos.</li>
              </ul>
            </div>
            <div className="rg-modal-acciones">
              <button className="big full" onClick={() => setModalAyuda(false)}>Entendido</button>
            </div>
          </div>
        </div>
      )}

      {/* MENÚ */}
      {vista === 'menu' && (
        <MenuInicioJuego
          juegoId="cuatroclubes"
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

      {/* CREAR */}
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

      {/* UNIRSE */}
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

      {/* LOBBY */}
      {vista === 'sala' && sala?.estado === 'lobby' && (
        <section className="game qq-pantalla">
          <CabeceraSala codigo={sala.code} onVolver={() => setModalSalir(true)} onAyuda={() => setModalAyuda(true)} />

          <div className="panel qq-menu-panel" style={{ marginTop: '1rem' }}>
            <h3 className="qq-sala-titulo"><Icon name="users" size={20} /> Jugadores ({sala.jugadores.length}/10)</h3>
            <div className="lb-lista qq-sala-lista">
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
              <button
                className="big full qq-btn-principal"
                disabled={sala.jugadores.length < 2}
                onClick={() => accionSala('iniciar')}
              >
                <Icon name="play" size={22} /> ¡Empezar Partida! ({sala.jugadores.length * 3} rondas)
              </button>
            ) : (
              <EsperandoAnfitrion />
            )}
          </div>
        </section>
      )}

      {/* JUGANDO */}
      {vista === 'sala' && sala?.estado === 'jugando' && ronda?.reto && (
        <section className="game">
          <div className="hud" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span className="chip"><Icon name="flagFinish" size={18} />Ronda {sala.rondaNum} de {sala.maxRondas}</span>
            <span className="chip">Abre esta ronda: <strong>{ronda.iniciaRondaNombre}</strong></span>
          </div>

          {/* Los 4 escudos se mantienen siempre en pantalla */}
          <div className="panel center" style={{ margin: '1rem 0', padding: '1.4rem 1rem' }}>
            <h3 className="cc-subtitulo">¿Qué futbolista ha jugado en más de estos 4 clubes?</h3>
            <div className="cc-clubes-grid">
              {(ronda.reto.clubes || []).map((club, idx) => (
                <EscudoClub key={idx} club={club} />
              ))}
            </div>
          </div>

          {/* Temporizador de 90s para cada jugador (idéntico al de los otros minijuegos) */}
          <div className="timer" role="timer" aria-label="Tiempo restante">
            <div
              className={`timer-bar${(ronda.segsRestantes ?? TIEMPO_S) <= 15 ? ' low' : ''}`}
              style={{ width: `${((ronda.segsRestantes ?? TIEMPO_S) / TIEMPO_S) * 100}%` }}
            />
          </div>
          <p className="timer-text"><Icon name="clock" size={16} />{ronda.segsRestantes ?? TIEMPO_S} s</p>

          {/* Barra de orden secuencial de turnos en la ronda */}
          <div className="cc-turnos-barra">
            {(ronda.ordenTurnos || []).map((jugId, idx) => {
              const jugObj = sala.jugadores.find((j) => j.id === jugId);
              const resp = (ronda.respuestasRonda || []).find((r) => r.jugadorId === jugId);
              const activo = idx === ronda.turnoIdx;
              return (
                <div
                  key={jugId}
                  className={`cc-turno-pill ${activo ? 'activo' : ''} ${resp ? 'completado' : ''}`}
                >
                  <span>{idx + 1}º {jugObj?.nombre || 'Jugador'}</span>
                  {resp && <strong>+{resp.puntos}</strong>}
                </div>
              );
            })}
          </div>

          {/* Información de turno actual */}
          <div className="panel center cc-panel-turno">
            <p className="cc-turno-etiqueta">
              Turno {(ronda.turnoIdx ?? 0) + 1} de {(ronda.ordenTurnos || []).length} • Inicia ronda: {ronda.iniciaRondaNombre}
            </p>
            <h2 className="cc-turno-nombre">
              {ronda.turnoJugadorId === sala.yoId
                ? `¡Es tu turno, ${ronda.turnoJugadorNombre}!`
                : `Turno de ${ronda.turnoJugadorNombre}`}
            </h2>
            <p className="hint" style={{ marginBottom: esAdmin ? '1rem' : '0' }}>
              {ronda.turnoJugadorId === sala.yoId
                ? `Tienes ${ronda.segsRestantes ?? TIEMPO_S}s para decir un futbolista en voz alta y que los demás validen en cuántos clubes encaja.`
                : 'Escuchad el futbolista que diga en voz alta y validad en cuántos de los 4 clubes ha jugado.'}
            </p>

            {/* En modo online, solo al admin le sale la opción de elegir cuántos clubes correctos coincide */}
            {esAdmin && (
              <div style={{ marginTop: '1rem', borderTop: '2px dashed #cbd5e1', paddingTop: '1rem' }}>
                <p className="hint small" style={{ marginBottom: '0.8rem', fontWeight: 'bold', color: '#1e293b' }}>
                  👑 Panel del Anfitrión: ¿En cuántos clubes encaja el futbolista de {ronda.turnoJugadorNombre}?
                </p>
                <div className="cc-botones-puntos">
                  {[0, 1, 2, 3, 4].map((pts) => (
                    <button
                      key={pts}
                      type="button"
                      className={`cc-btn-punto cc-pts-${pts}`}
                      onClick={() => handlePuntuar(pts)}
                    >
                      <span className="cc-btn-num">{pts}</span>
                      <span className="cc-btn-txt">{pts === 1 ? '1 club (+1 pt)' : `${pts} clubes (+${pts} pts)`}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Botones de control de ronda, partida y salida */}
          <div className="cc-acciones-footer">
            {esAdmin && (
              <>
                <button
                  type="button"
                  className="secondary"
                  onClick={() => accionSala('puntuar', { tipo: 'fin-ronda' })}
                >
                  <Icon name="flag" size={18} /> Fin de ronda
                </button>
                <button
                  type="button"
                  className="secondary danger"
                  onClick={() => accionSala('finalizar')}
                >
                  <Icon name="flagFinish" size={18} /> Fin de partida
                </button>
              </>
            )}
            <button type="button" className="secondary" onClick={() => setModalSalir(true)}>
              <Icon name="door" size={18} /> Salir a la sala
            </button>
          </div>
        </section>
      )}

      {/* RESUMEN DE RONDA */}
      {vista === 'sala' && sala?.estado === 'resumen' && ronda?.reto && (
        <section className="game">
          {/* Escudos de los 4 clubes siempre presentes */}
          <div className="panel center" style={{ marginBottom: '1rem', padding: '1rem' }}>
            <div className="cc-clubes-grid compacto">
              {(ronda.reto.clubes || []).map((club, idx) => (
                <EscudoClub key={idx} club={club} />
              ))}
            </div>
            <button
              type="button"
              className="secondary"
              style={{ marginTop: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 'bold' }}
              onClick={() => setModalRespuestas(true)}
            >
              <Icon name="eye" size={18} /> Ver futbolistas en 4 y 3 clubes
            </button>
          </div>

          <div className="end-card">
            <span className="end-icon"><Icon name="trophy" size={44} /></span>
            <h1 className="title">Puntuaciones (Ronda {sala.rondaNum} de {sala.maxRondas})</h1>

            {ronda.respuestasRonda && ronda.respuestasRonda.length > 0 && (
              <div className="cc-resumen-ronda">
                {ronda.respuestasRonda.map((r, i) => (
                  <span key={i} className="cc-resumen-chip">
                    {r.nombre}: <strong>+{r.puntos} pts</strong>{r.tiempoAgotado ? ' (⏱️ Tiempo)' : ''}
                  </span>
                ))}
              </div>
            )}

            <div className="scoreboard">
              {ranking.map((j, i) => (
                <div key={j.id} className={`score-row${maximo > 0 && j.puntos === maximo ? ' first' : ''}`}>
                  <span className="score-name">
                    {maximo > 0 && j.puntos === maximo ? <Icon name="crown" size={22} /> : <span className="pos">{i + 1}</span>} {j.nombre}
                  </span>
                  <span className="score-pts">{j.puntos} pts</span>
                </div>
              ))}
            </div>
          </div>

          <div className="actions">
            {esAdmin ? (
              <>
                <button className="big full" onClick={() => accionSala('siguiente-ronda')}>
                  <Icon name="play" size={20} />{' '}
                  {sala.rondaNum >= sala.maxRondas
                    ? 'Ver Podio Final'
                    : `Siguiente ronda (Empezará ${proximoInicialNombre})`}
                </button>
                <button className="secondary danger full" onClick={() => accionSala('finalizar')}>
                  <Icon name="flagFinish" size={20} /> Fin de partida
                </button>
              </>
            ) : (
              <p className="hint center">Esperando al anfitrión...</p>
            )}
            <button className="secondary full" onClick={() => setModalSalir(true)}>
              <Icon name="door" size={20} /> Salir a la sala
            </button>
          </div>

          {/* Ventana modal al acabar la ronda para desvelar ejemplos de 4 y 3 clubes */}
          {modalRespuestas && (
            <div className="rg-modal-fondo" onClick={() => setModalRespuestas(false)}>
              <div className="rg-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
                <h3 style={{ marginBottom: '0.5rem', color: '#1e1b4b' }}>Futbolistas de esta combinación</h3>
                <p className="hint small" style={{ marginBottom: '1rem' }}>
                  {(ronda.reto.clubes || []).map((c) => c.nombre).join(' • ')}
                </p>

                <div className="cc-soluciones-box">
                  <div className="cc-sol-seccion">
                    <h4 className="cc-sol-titulo cuatro">⭐ Jugaron en los 4 clubes (4 pts)</h4>
                    {ronda.reto.jugadores4 && ronda.reto.jugadores4.length > 0 ? (
                      ronda.reto.jugadores4.map((jug, i) => (
                        <div key={i} className="cc-sol-item">• {jug}</div>
                      ))
                    ) : (
                      <div className="cc-sol-vacio">Sin registros.</div>
                    )}
                  </div>

                  <div className="cc-sol-seccion" style={{ marginTop: '1rem' }}>
                    <h4 className="cc-sol-titulo tres">🔥 Jugaron en 3 de los 4 clubes (3 pts)</h4>
                    {ronda.reto.jugadores3 && ronda.reto.jugadores3.length > 0 ? (
                      ronda.reto.jugadores3.map((jug, i) => (
                        <div key={i} className="cc-sol-item">• {jug}</div>
                      ))
                    ) : (
                      <div className="cc-sol-vacio">Sin registros.</div>
                    )}
                  </div>
                </div>

                <button className="big full" onClick={() => setModalRespuestas(false)}>
                  Ver puntuaciones
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* FINAL */}
      {vista === 'sala' && sala?.estado === 'final' && (
        <section className="game">
          <div className="end-card">
            <span className="end-icon"><Icon name="crown" size={48} /></span>
            <h1 className="title">Clasificación Final</h1>
            <div className="scoreboard" style={{ marginTop: '1.5rem' }}>
              {ranking.map((j, i) => (
                <div key={j.id} className={`score-row${maximo > 0 && j.puntos === maximo ? ' first' : ''}`}>
                  <span className="score-name">
                    {maximo > 0 && j.puntos === maximo ? <Icon name="crown" size={22} /> : <span className="pos">{i + 1}</span>} {j.nombre}
                  </span>
                  <span className="score-pts">{j.puntos} pts</span>
                </div>
              ))}
            </div>
          </div>
          <div className="actions" style={{ marginTop: '1.5rem' }}>
            {esAdmin && (
              <button className="big full" onClick={() => accionSala('volver-sala')}>
                <Icon name="refresh" size={20} /> Volver a la sala de espera
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
          <div
            className="rg-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '420px', textAlign: 'center', padding: '1.8rem 1.4rem' }}
          >
            <h3 style={{ margin: '0 0 0.6rem', color: '#1e1b4b', fontSize: '1.3rem' }}>¿Abandonar la partida?</h3>
            <p className="hint" style={{ fontSize: '0.95rem', marginBottom: '1.4rem' }}>
              Si sales de la sala perderás tu progreso actual en la partida.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginTop: '1rem' }}>
              <button type="button" className="secondary full" onClick={() => setModalSalir(false)}>
                Quedarme
              </button>
              <button
                type="button"
                className="secondary danger full"
                onClick={() => {
                  setModalSalir(false);
                  handleSalir();
                }}
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
