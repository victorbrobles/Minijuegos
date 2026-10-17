// client/src/games/Colores/ColoresOnline.jsx
import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../components/Icon.jsx';
import './Colores.css';

const CLAVE_SESION_COLORES = 'colores_online_session';

const PALETA_COLORES = [
  { id: 'rojo', nombre: 'Rojo', hex: '#ef4444' },
  { id: 'azul', nombre: 'Azul', hex: '#3b82f6' },
  { id: 'amarillo', nombre: 'Amarillo', hex: '#eab308' },
  { id: 'verde', nombre: 'Verde', hex: '#10b981' },
  { id: 'naranja', nombre: 'Naranja', hex: '#f97316' },
  { id: 'morado', nombre: 'Morado', hex: '#a855f7' },
  { id: 'marron', nombre: 'Marrón', hex: '#854d0e' },
  { id: 'blanco', nombre: 'Blanco', hex: '#f8fafc', borde: '#cbd5e1' },
  { id: 'negro', nombre: 'Negro', hex: '#0f172a' },
  { id: 'gris', nombre: 'Gris', hex: '#94a3b8' },
  { id: 'rosa', nombre: 'Rosa', hex: '#ec4899' }
];

export default function ColoresOnline({ onLocal, onSalir }) {
  const [vista, setVista] = useState('menu'); // 'menu' | 'crear' | 'unirse' | 'sala'
  const [nombre, setNombre] = useState('');
  const [codigoInput, setCodigoInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);

  const [sesion, setSesion] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(CLAVE_SESION_COLORES));
    } catch {
      return null;
    }
  });

  const [sala, setSala] = useState(null);
  const [codigoCopiado, setCodigoCopiado] = useState(false);
  const [misColoresSeleccionados, setMisColoresSeleccionados] = useState([]);

  const intervalRef = useRef(null);

  useEffect(() => {
    if (!sesion) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setSala(null);
      return;
    }

    const consultarEstado = () => {
      fetch(`/api/colores/online/sala/${sesion.code}?token=${sesion.token}`)
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
          sessionStorage.removeItem(CLAVE_SESION_COLORES);
          setSesion(null);
          setSala(null);
          setVista('menu');
          setErrorMsg('La sala se ha cerrado o se ha perdido la conexión.');
        });
    };

    consultarEstado();
    intervalRef.current = setInterval(consultarEstado, 500);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sesion]);

  const handleCrear = async () => {
    if (!nombre.trim()) return;
    setErrorMsg('');
    setCargando(true);
    try {
      const res = await fetch('/api/colores/online/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear la sala.');

      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_COLORES, JSON.stringify(nueva));
      setSesion(nueva);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleUnirse = async () => {
    if (!nombre.trim() || !codigoInput.trim()) return;
    setErrorMsg('');
    setCargando(true);
    try {
      const res = await fetch('/api/colores/online/unirse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codigoInput.trim().toUpperCase(), nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al unirse.');

      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_COLORES, JSON.stringify(nueva));
      setSesion(nueva);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleIniciarJuego = async () => {
    if (!sesion) return;
    setMisColoresSeleccionados([]);
    try {
      await fetch(`/api/colores/online/sala/${sesion.code}/iniciar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token })
      });
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const toggleColorOnline = (colorId) => {
    if (sala?.ronda?.yaRespondio) return;
    const numMax = sala?.ronda?.numColores || 1;

    if (misColoresSeleccionados.includes(colorId)) {
      setMisColoresSeleccionados(misColoresSeleccionados.filter((c) => c !== colorId));
    } else {
      if (misColoresSeleccionados.length < numMax) {
        setMisColoresSeleccionados([...misColoresSeleccionados, colorId]);
      }
    }
  };

  const handleEnviarRespuesta = async () => {
    if (!sesion || misColoresSeleccionados.length !== sala?.ronda?.numColores) return;
    try {
      await fetch(`/api/colores/online/sala/${sesion.code}/responder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token, colores: misColoresSeleccionados })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleCerrarRonda = async () => {
    if (!sesion) return;
    try {
      await fetch(`/api/colores/online/sala/${sesion.code}/cerrar-ronda`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSiguienteRonda = async () => {
    if (!sesion) return;
    setMisColoresSeleccionados([]);
    try {
      await fetch(`/api/colores/online/sala/${sesion.code}/siguiente-ronda`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleFinalizarPartida = async () => {
    if (!sesion) return;
    try {
      await fetch(`/api/colores/online/sala/${sesion.code}/finalizar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleReiniciarPartida = async () => {
    if (!sesion) return;
    try {
      await fetch(`/api/colores/online/sala/${sesion.code}/reiniciar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSalir = async () => {
    if (sesion) {
      try {
        await fetch(`/api/colores/online/sala/${sesion.code}/salir`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: sesion.token })
        });
      } catch {
        /* ignorar */
      }
    }
    sessionStorage.removeItem(CLAVE_SESION_COLORES);
    setSesion(null);
    setSala(null);
    setVista('menu');
  };

  const copiarCodigo = () => {
    if (!sala?.code) return;
    navigator.clipboard?.writeText(sala.code);
    setCodigoCopiado(true);
    setTimeout(() => setCodigoCopiado(false), 2000);
  };

  const ronda = sala?.ronda;
  const esAdmin = Boolean(sala?.esAdmin);
  const resultadoRonda = ronda?.resultadoRonda;
  const ranking = [...(sala?.jugadores || [])].sort((a, b) => b.puntos - a.puntos);
  const maximoPuntos = ranking.length ? ranking[0].puntos : 0;
  const ganadores = maximoPuntos > 0 ? ranking.filter((j) => j.puntos === maximoPuntos) : [];

  return (
    <div className="aprox-contenedor">
      {/* 1. MENÚ PRINCIPAL */}
      {vista === 'menu' && (
        <section className="game">
          <div className="panel center">
            <span className="lb-luna chica">
              <Icon name="star" size={42} strokeWidth={1.6} />
            </span>
            <h1 className="title">La vida en colores</h1>
            <p className="hint">
              Adivina los colores exactos de logotipos, personajes y banderas. El anfitrión crea la sala y comparte el código.
            </p>

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
      )}

      {/* 2. CREAR SALA */}
      {vista === 'crear' && (
        <section className="game">
          <div className="panel center">
            <span className="lb-luna chica">
              <Icon name="crown" size={40} strokeWidth={1.6} />
            </span>
            <h2 className="title">Crear partida</h2>
            <p className="hint">Introduce tu nombre para crear la sala y ser el anfitrión.</p>

            <div className="lb-form" style={{ marginTop: '1.2rem', textAlign: 'left' }}>
              <label className="field-label" htmlFor="col-host-nombre">Tu nombre</label>
              <input
                id="col-host-nombre"
                type="text"
                placeholder="Tu nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                maxLength={20}
                autoFocus
              />
              {errorMsg && <p className="error">{errorMsg}</p>}

              <button
                className="big full"
                style={{ marginTop: '1rem' }}
                disabled={cargando || !nombre.trim()}
                onClick={handleCrear}
              >
                <Icon name="check" size={22} strokeWidth={2.5} /> Crear sala
              </button>
              <button
                className="secondary full"
                style={{ marginTop: '0.6rem' }}
                onClick={() => { setVista('menu'); setErrorMsg(''); }}
              >
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
            <span className="lb-luna chica">
              <Icon name="users" size={40} strokeWidth={1.6} />
            </span>
            <h2 className="title">Unirse a partida</h2>
            <p className="hint">Introduce el código de 4 letras que te ha dado el anfitrión.</p>

            <div className="lb-form" style={{ marginTop: '1.2rem', textAlign: 'left' }}>
              <label className="field-label" htmlFor="col-code-input">Código de la sala</label>
              <input
                id="col-code-input"
                className="lb-input-codigo"
                type="text"
                placeholder="ABCD"
                value={codigoInput}
                onChange={(e) => setCodigoInput(e.target.value.toUpperCase())}
                maxLength={4}
                style={{ textTransform: 'uppercase', letterSpacing: '4px', textAlign: 'center', fontWeight: '800' }}
                autoFocus
              />

              <label className="field-label" htmlFor="col-guest-nombre" style={{ marginTop: '1rem' }}>Tu nombre</label>
              <input
                id="col-guest-nombre"
                type="text"
                placeholder="Tu nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                maxLength={20}
              />
              {errorMsg && <p className="error">{errorMsg}</p>}

              <button
                className="big full"
                style={{ marginTop: '1rem' }}
                disabled={cargando || !nombre.trim() || codigoInput.trim().length < 4}
                onClick={handleUnirse}
              >
                <Icon name="check" size={22} strokeWidth={2.5} /> Entrar en la partida
              </button>
              <button
                className="secondary full"
                style={{ marginTop: '0.6rem' }}
                onClick={() => { setVista('menu'); setErrorMsg(''); }}
              >
                Volver
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 4. SALA: LOBBY */}
      {vista === 'sala' && sala && sala.estado === 'lobby' && (
        <section className="game">
          <div className="panel center">
            <p className="categoria"><Icon name="lock" size={16} />Sala de espera</p>
            <p className="hint">Código de la partida</p>
            <button
              type="button"
              className="qq-codigo-btn"
              onClick={copiarCodigo}
              title="Copiar código"
            >
              {sala.code}
            </button>
            <p className="hint small">
              {codigoCopiado ? '¡Copiado al portapapeles!' : 'Pulsa el código para copiarlo y compártelo con los demás.'}
            </p>
          </div>

          <div className="panel" style={{ marginTop: '1rem' }}>
            <h3 className="panel-title"><Icon name="users" size={20} /> Jugadores ({sala.jugadores.length})</h3>
            <div className="lb-lista">
              {sala.jugadores.map((j) => (
                <div key={j.id} className={`lb-jug ${j.id === sala.yoId ? 'yo' : ''}`}>
                  <span className="lb-punto on" />
                  <span className="lb-jug-nombre">
                    {j.nombre}{j.id === sala.yoId ? ' (tú)' : ''}{j.id === 1 ? ' 👑' : ''}
                  </span>
                </div>
              ))}
            </div>
            {sala.jugadores.length < 2 && (
              <p className="hint" style={{ marginTop: '0.8rem' }}>
                Falta al menos 1 jugador más para poder empezar.
              </p>
            )}
          </div>

          {esAdmin ? (
            <div style={{ marginTop: '1.2rem' }}>
              <button
                className="big full"
                disabled={sala.jugadores.length < 2}
                onClick={handleIniciarJuego}
              >
                <Icon name="play" size={22} />
                {sala.jugadores.length < 2 ? 'Esperando jugadores...' : '¡Empezar Partida (25 Rondas)!'}
              </button>
            </div>
          ) : (
            <div className="panel center" style={{ padding: '2rem 1.5rem', marginTop: '1rem' }}>
              <span className="lb-luna chica"><Icon name="hourglass" size={40} /></span>
              <h3 style={{ margin: '0.5rem 0' }}>Esperando al anfitrión...</h3>
              <p className="hint">En cuanto comience la partida, verás el primer elemento para elegir sus colores.</p>
            </div>
          )}

          <div className="actions" style={{ marginTop: '1rem' }}>
            <button className="secondary danger full" onClick={handleSalir}>
              <Icon name="door" size={20} /> Salir de la sala
            </button>
          </div>
        </section>
      )}

      {/* 5. SALA: JUGANDO ONLINE */}
      {vista === 'sala' && sala && sala.estado === 'jugando' && ronda && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="flagFinish" size={18} />Ronda {sala.rondaActualIdx + 1} de {sala.totalRondas}</span>
            <span className="chip alt">
              <Icon name="check" size={18} /> {ronda.totalRespondieron} / {ronda.totalJugadores} listos
            </span>
          </div>

          {ronda.estadoRonda === 'votando' ? (
            <>
              {/* Tarjeta del elemento y cuántos colores seleccionar */}
              <div className="panel aprox-pregunta-card">
                <span className="aprox-badge-pregunta">
                  Selecciona exactamente {ronda.numColores} {ronda.numColores === 1 ? 'color' : 'colores'}
                </span>
                <h2 className="aprox-pregunta-texto" style={{ fontSize: '1.65rem', margin: '0.6rem 0' }}>
                  {ronda.item}
                </h2>
                <p className="field-label">
                  Marca los {ronda.numColores} colores característicos de este elemento en tu pantalla:
                </p>
              </div>

              {!ronda.yaRespondio ? (
                <>
                  {/* Paleta de 11 colores */}
                  <div className="panel">
                    <div className="colores-grid">
                      {PALETA_COLORES.map((col) => {
                        const activo = misColoresSeleccionados.includes(col.id);
                        return (
                          <button
                            key={col.id}
                            type="button"
                            className={`colores-tarjeta ${activo ? 'activa' : ''}`}
                            onClick={() => toggleColorOnline(col.id)}
                          >
                            <span
                              className="colores-muestra"
                              style={{
                                backgroundColor: col.hex,
                                border: col.borde ? `2px solid ${col.borde}` : 'none'
                              }}
                            />
                            <span className="colores-nombre">{col.nombre}</span>
                            {activo && <span className="colores-check">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    className="big full"
                    disabled={misColoresSeleccionados.length !== ronda.numColores}
                    onClick={handleEnviarRespuesta}
                  >
                    <Icon name="check" size={22} />
                    {misColoresSeleccionados.length === ronda.numColores
                      ? 'Confirmar selección'
                      : `Selecciona ${ronda.numColores - misColoresSeleccionados.length} más`}
                  </button>
                </>
              ) : (
                <div className="panel center" style={{ padding: '2rem 1.5rem' }}>
                  <span className="badge" style={{ background: '#dcfce7', color: '#166534', fontSize: '1.05rem', padding: '0.5rem 1.2rem' }}>
                    ✅ ¡Has enviado tus colores!
                  </span>

                  <p className="hint" style={{ marginTop: '1.2rem' }}>
                    Esperando a los demás jugadores ({ronda.totalRespondieron} de {ronda.totalJugadores})...
                  </p>

                  <div className="scoreboard-container" style={{ justifyContent: 'center', marginTop: '1rem' }}>
                    {sala.jugadores.map((j) => (
                      <div key={j.id} className="score-pill">
                        <span>{j.nombre}</span>
                        <span style={{ marginLeft: '6px' }}>{j.haRespondido ? '✅' : '⏳'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Botón de cierre para el anfitrión si alguien se demora */}
              {esAdmin && (
                <div style={{ marginTop: '1rem' }}>
                  <button className="secondary full" onClick={handleCerrarRonda}>
                    <Icon name="check" size={18} /> Cerrar ronda y ver resultados ya
                  </button>
                </div>
              )}
            </>
          ) : (
            /* RESOLUCIÓN DE LA RONDA */
            resultadoRonda && (
              <div className="end-card aprox-resolucion-card">
                <span className="end-icon"><Icon name="trophy" size={44} /></span>
                <p className="categoria">{resultadoRonda.item}</p>
                <h1 className="title" style={{ fontSize: '1.35rem' }}>Colores correctos:</h1>

                <div className="colores-resolucion-correctos">
                  {resultadoRonda.coloresCorrectos.map((colId) => {
                    const cObj = PALETA_COLORES.find((p) => p.id === colId);
                    return (
                      <div key={colId} className="colores-pill-acierto">
                        <span
                          className="colores-circulo-mini"
                          style={{ backgroundColor: cObj?.hex, border: cObj?.borde ? '1px solid #94a3b8' : 'none' }}
                        />
                        <span>{cObj?.nombre || colId}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Desglose de cada jugador */}
                <div className="aprox-resolucion-lista" style={{ marginTop: '1.2rem', width: '100%' }}>
                  {resultadoRonda.desglose.map((d) => (
                    <div key={d.id} className="aprox-fila-resultado intermedia" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'stretch' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong>{d.jugador} {d.id === sala.yoId ? '(Tú)' : ''}</strong>
                        <span className="aprox-badge-pts" style={{ background: d.aciertos > 0 ? '#10b981' : '#64748b' }}>
                          +{d.aciertos} {d.aciertos === 1 ? 'pt' : 'pts'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        {d.elegidos.map((colId) => {
                          const esAcierto = resultadoRonda.coloresCorrectos.includes(colId);
                          const cObj = PALETA_COLORES.find((p) => p.id === colId);
                          return (
                            <span key={colId} className={`colores-tag-elegido ${esAcierto ? 'acierto' : 'fallo'}`}>
                              <span
                                className="colores-circulo-micro"
                                style={{ backgroundColor: cObj?.hex }}
                              />
                              {cObj?.nombre || colId} {esAcierto ? '✓' : '✗'}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Marcador general */}
                <div className="scoreboard" style={{ width: '100%', marginTop: '1.5rem' }}>
                  <h3 className="section-title" style={{ margin: '0 0 0.8rem', textAlign: 'center' }}>
                    Marcador general
                  </h3>
                  {ranking.map((j, i) => {
                    const pts = j.puntos ?? 0;
                    const primero = maximoPuntos > 0 && pts === maximoPuntos;
                    return (
                      <div key={j.id} className={`score-row${primero ? ' first' : ''}`}>
                        <span className="score-name">
                          {primero ? <Icon name="crown" size={22} /> : <span className="pos">{i + 1}</span>}
                          {j.nombre} {j.id === sala.yoId ? '(Tú)' : ''}
                        </span>
                        <span className="score-pts">{pts} pts</span>
                      </div>
                    );
                  })}
                </div>

                <div className="round-finished-actions" style={{ marginTop: '1.5rem', width: '100%' }}>
                  {esAdmin ? (
                    <>
                      {sala.rondaActualIdx + 1 < sala.totalRondas ? (
                        <button className="btn-start" onClick={handleSiguienteRonda}>
                          Siguiente ronda ({sala.rondaActualIdx + 2} de {sala.totalRondas}) ➔
                        </button>
                      ) : (
                        <button className="btn-start" onClick={handleFinalizarPartida}>
                          Ver resultados finales 🏆
                        </button>
                      )}
                      <button className="btn-secondary-action" onClick={handleFinalizarPartida}>
                        Finalizar juego
                      </button>
                    </>
                  ) : (
                    <p className="hint center">Esperando a que el anfitrión avance a la siguiente ronda...</p>
                  )}
                </div>
              </div>
            )
          )}

          <div className="actions" style={{ marginTop: '1.2rem' }}>
            <button className="secondary danger full" onClick={handleSalir}>
              <Icon name="door" size={20} /> Salir de la sala
            </button>
          </div>
        </section>
      )}

      {/* 6. SALA: PODIO FINAL */}
      {vista === 'sala' && sala && sala.estado === 'final' && (
        <section className="game">
          <div className="end-card">
            <span className="end-icon"><Icon name="crown" size={44} /></span>
            <h1 className="title">Puntuaciones Finales</h1>
            <p className="final-score">
              {ganadores.length === 0
                ? 'Nadie ha sumado puntos'
                : ganadores.length === 1
                ? <>¡Gana {ganadores[0].nombre}!</>
                : <>Empate entre {ganadores.map((g) => g.nombre).join(', ')}</>}
            </p>

            <div className="scoreboard">
              {ranking.map((j, i) => {
                const pts = j.puntos ?? 0;
                const primero = maximoPuntos > 0 && pts === maximoPuntos;
                return (
                  <div key={j.id} className={`score-row${primero ? ' first' : ''}`}>
                    <span className="score-name">
                      {primero ? <Icon name="crown" size={22} /> : <span className="pos">{i + 1}</span>}
                      {j.nombre} {j.id === sala.yoId ? '(Tú)' : ''}
                    </span>
                    <span className="score-pts">{pts} pts</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="actions" style={{ marginTop: '1.5rem' }}>
            {esAdmin && (
              <button className="big full" onClick={handleReiniciarPartida}>
                <Icon name="refresh" size={20} /> Otra Partida (mismos jugadores)
              </button>
            )}
            <button className="secondary danger full" onClick={handleSalir}>
              <Icon name="door" size={20} /> Salir al menú principal
            </button>
          </div>
        </section>
      )}
    </div>
  );
}