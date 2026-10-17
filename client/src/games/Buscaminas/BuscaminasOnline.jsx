// client/src/games/Buscaminas/BuscaminasOnline.jsx
import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../components/Icon.jsx';
import CategoryCard from '../../components/CategoryCard.jsx';
import './Buscaminas.css';
import '../Adivina/Adivina.css';

const CLAVE_SESION_BM = 'buscaminas_online_session';
const TOTAL_CORRECTOS = 10;
const TOTAL_MINAS = 5;

export default function BuscaminasOnline({ onLocal, onSalir }) {
  const [vista, setVista] = useState('menu'); // 'menu' | 'crear' | 'unirse' | 'sala'
  const [nombre, setNombre] = useState('');
  const [codigoInput, setCodigoInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);
  const [modalSalir, setModalSalir] = useState(false);

  const [categorias, setCategorias] = useState([]);
  const [sesion, setSesion] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(CLAVE_SESION_BM));
    } catch {
      return null;
    }
  });

  const [sala, setSala] = useState(null);
  const [codigoCopiado, setCodigoCopiado] = useState(false);

  const intervalRef = useRef(null);

  // Cargar categorías
  useEffect(() => {
    fetch('/api/buscaminas/categorias')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setCategorias(d.categorias);
      })
      .catch((err) => console.error(err));
  }, []);

  // Polling de sincronización
  useEffect(() => {
    if (!sesion) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setSala(null);
      return;
    }

    const consultarEstado = () => {
      fetch(`/api/buscaminas/online/sala/${sesion.code}?token=${sesion.token}`)
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
          sessionStorage.removeItem(CLAVE_SESION_BM);
          setSesion(null);
          setSala(null);
          setVista('menu');
          setErrorMsg('La sala se ha cerrado.');
        });
    };

    consultarEstado();
    intervalRef.current = setInterval(consultarEstado, 650);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sesion]);

  const handleCrear = async () => {
    if (!nombre.trim()) return;
    setCargando(true);
    try {
      const res = await fetch('/api/buscaminas/online/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_BM, JSON.stringify(nueva));
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
      const res = await fetch('/api/buscaminas/online/unirse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codigoInput.trim().toUpperCase(), nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_BM, JSON.stringify(nueva));
      setSesion(nueva);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleIniciarPartida = async () => {
    try {
      const res = await fetch(`/api/buscaminas/online/sala/${sesion.code}/iniciar-partida`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token })
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleElegirCategoria = async (categoriaId) => {
    try {
      const res = await fetch(`/api/buscaminas/online/sala/${sesion.code}/elegir-categoria`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token, categoriaId })
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleSeleccionarCasilla = async (casillaId) => {
    try {
      const res = await fetch(`/api/buscaminas/online/sala/${sesion.code}/seleccionar-casilla`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token, casillaId })
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCerrarExplosion = async () => {
    try {
      await fetch(`/api/buscaminas/online/sala/${sesion.code}/cerrar-explosion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSiguienteRonda = async () => {
    try {
      await fetch(`/api/buscaminas/online/sala/${sesion.code}/siguiente-ronda`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleFinalizar = async () => {
    try {
      await fetch(`/api/buscaminas/online/sala/${sesion.code}/finalizar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSalir = () => {
    sessionStorage.removeItem(CLAVE_SESION_BM);
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
  const esAdmin = sala?.esAdmin;
  const yoId = sala?.yoId;
  const esMiTurno = ronda?.jugadorActivoId === yoId;
  const yoEliminado = ronda?.eliminadosRonda?.includes(yoId);

  const ranking = sala?.jugadores ? [...sala.jugadores].sort((a, b) => b.puntos - a.puntos) : [];
  const maximoPuntos = ranking.length ? ranking[0].puntos : 0;
  const ganadores = maximoPuntos > 0 ? ranking.filter((j) => j.puntos === maximoPuntos) : [];

  const correctasDescubiertas = ronda?.casillas ? ronda.casillas.filter((c) => c.descubierta && c.correcto).length : 0;
  const minasExplotadas = ronda?.casillas ? ronda.casillas.filter((c) => c.descubierta && !c.correcto).length : 0;

  return (
    <div className="bm-contenedor">
      {/* 1. MENÚ ONLINE */}
      {vista === 'menu' && (
        <section className="game">
          <div className="panel center">
            <span className="lb-luna chica">
              <Icon name="bomb" size={42} strokeWidth={1.6} />
            </span>
            <h1 className="title">Cuidado que explota Online</h1>
            <p className="hint">
              10 aciertos y 5 bombas en el tablero. Descubre casillas cuando sea tu turno y esquiva la mina para no caer eliminado.
            </p>

            {errorMsg && <p className="error" style={{ margin: '0.8rem 0' }}>{errorMsg}</p>}

            <div className="lb-menu">
              <button className="big full" onClick={() => { setVista('crear'); setErrorMsg(''); }}>
                <Icon name="crown" size={22} /> Crear partida Online
              </button>
              <button className="big full" onClick={() => { setVista('unirse'); setErrorMsg(''); }}>
                <Icon name="users" size={22} /> Unirse con código
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
            <h2 className="title">Crear sala Online</h2>
            <p className="hint">Introduce tu nombre de anfitrión (de 3 a 8 jugadores).</p>

            <div className="lb-form" style={{ marginTop: '1.2rem', textAlign: 'left' }}>
              <input
                type="text"
                placeholder="Tu nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                maxLength={20}
                autoFocus
              />
              <button
                className="big full"
                style={{ marginTop: '1rem' }}
                disabled={cargando || !nombre.trim()}
                onClick={handleCrear}
              >
                Crear sala
              </button>
              <button className="secondary full" style={{ marginTop: '0.6rem' }} onClick={() => setVista('menu')}>
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
            <h2 className="title">Unirse a partida</h2>
            <div className="lb-form" style={{ marginTop: '1.2rem', textAlign: 'left' }}>
              <input
                type="text"
                placeholder="CÓDIGO (4 LETRAS)"
                value={codigoInput}
                onChange={(e) => setCodigoInput(e.target.value.toUpperCase())}
                maxLength={4}
                style={{ textTransform: 'uppercase', letterSpacing: '4px', textAlign: 'center', fontWeight: '800' }}
                autoFocus
              />
              <input
                type="text"
                placeholder="Tu nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                maxLength={20}
                style={{ marginTop: '0.8rem' }}
              />
              <button
                className="big full"
                style={{ marginTop: '1rem' }}
                disabled={cargando || !nombre.trim() || codigoInput.trim().length < 4}
                onClick={handleUnirse}
              >
                Entrar a la sala
              </button>
              <button className="secondary full" style={{ marginTop: '0.6rem' }} onClick={() => setVista('menu')}>
                Volver
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 4. LOBBY */}
      {vista === 'sala' && sala && sala.estado === 'lobby' && (
        <section className="game">
          <div className="panel center">
            <p className="categoria">Código de la partida</p>
            <button type="button" className="qq-codigo-btn" onClick={copiarCodigo}>
              {sala.code}
            </button>
            <p className="hint small">
              {codigoCopiado ? '¡Copiado!' : 'Comparte este código para que se unan (mínimo 3 jugadores).'}
            </p>
          </div>

          <div className="panel" style={{ marginTop: '1rem' }}>
            <h3 className="panel-title"><Icon name="users" size={20} /> Jugadores ({sala.jugadores.length}/8)</h3>
            <div className="lb-lista">
              {sala.jugadores.map((j) => (
                <div key={j.id} className={`lb-jug ${j.id === yoId ? 'yo' : ''}`}>
                  <span className="lb-jug-nombre">{j.nombre}{j.id === yoId ? ' (Tú)' : ''}{j.id === 1 ? ' 👑' : ''}</span>
                </div>
              ))}
            </div>
          </div>

          {errorMsg && <p className="error" style={{ margin: '0.8rem 0' }}>{errorMsg}</p>}

          {esAdmin ? (
            <button
              className="big full"
              style={{ marginTop: '1.2rem' }}
              disabled={sala.jugadores.length < 3}
              onClick={handleIniciarPartida}
            >
              {sala.jugadores.length < 3 ? 'Esperando rivales (mínimo 3)...' : '¡Elegir Categoría!'}
            </button>
          ) : (
            <div className="panel center" style={{ marginTop: '1rem' }}>
              <p className="hint">Esperando a que el anfitrión comience la partida...</p>
            </div>
          )}

          <button className="secondary danger full" style={{ marginTop: '1rem' }} onClick={() => setModalSalir(true)}>
            Salir de la sala
          </button>
        </section>
      )}

      {/* 5. SELECTOR DE CATEGORÍA */}
      {vista === 'sala' && sala && sala.estado === 'categoria' && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="flagFinish" size={18} />Ronda {sala.rondaNum} de {sala.maxRondas}</span>
            <span className="chip alt"><Icon name="target" size={18} />Categoría del tablero</span>
          </div>

          {esAdmin ? (
            <>
              <h3 className="section-title" style={{ textAlign: 'center', marginBottom: '1rem' }}>
                Elige la temática para este tablero:
              </h3>
              <div className="bm-categories-grid">
                {categorias.map((cat, idx) => (
                  <CategoryCard
                    key={cat.id}
                    nombre={cat.nombre}
                    icono={cat.icono}
                    indice={idx}
                    onClick={() => handleElegirCategoria(cat.id)}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="panel center" style={{ padding: '2.5rem 1.5rem' }}>
              <span className="end-icon"><Icon name="target" size={44} /></span>
              <h2 className="title" style={{ marginTop: '0.8rem' }}>Seleccionando temática...</h2>
              <p className="hint">El anfitrión está eligiendo la categoría del tablero para la Ronda {sala.rondaNum}.</p>
            </div>
          )}

          <button className="secondary danger full" style={{ marginTop: '1.5rem' }} onClick={() => setModalSalir(true)}>
            Salir de la sala
          </button>
        </section>
      )}

      {/* 6. TABLERO ONLINE EN JUEGO */}
      {vista === 'sala' && sala && sala.estado === 'jugando' && ronda && ronda.faseRonda === 'jugando' && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="flagFinish" size={18} />Ronda {sala.rondaNum} de {sala.maxRondas}</span>
            <span className="chip alt">Turno de: {ronda.jugadorActivoNombre}</span>
          </div>

          {/* Marcador superior */}
          <div className="scoreboard-container" style={{ justifyContent: 'center', marginBottom: '0.8rem' }}>
            {sala.jugadores.map((j) => {
              const eliminado = ronda.eliminadosRonda.includes(j.id);
              const esTurno = j.id === ronda.jugadorActivoId;
              return (
                <div key={j.id} className={`score-pill ${eliminado ? 'locked' : ''}`} style={{ borderColor: esTurno ? '#4f46e5' : undefined }}>
                  <span>{j.nombre}: <strong>{j.puntos} pts</strong></span>
                  {eliminado ? <span style={{ marginLeft: '4px' }}>💥</span> : esTurno ? <span style={{ marginLeft: '4px' }}>👉</span> : null}
                </div>
              );
            })}
          </div>

          {/* Consigna */}
          <div className="bm-consigna-card">
            <span className="badge" style={{ background: '#e0e7ff', color: '#4338ca' }}>
              {ronda.categoriaNombre}
            </span>
            <h2 className="bm-consigna-titulo">«{ronda.consigna}»</h2>
            <p className="bm-consigna-sub">Encuentra los elementos que cumplen la consigna y esquiva las 5 bombas.</p>

            <div className="bm-progreso-stats">
              <span className="bm-stat-chip correctas">
                ✅ Aciertos: {correctasDescubiertas} / {TOTAL_CORRECTOS}
              </span>
              <span className="bm-stat-chip minas">
                💣 Minas pisadas: {minasExplotadas} / {TOTAL_MINAS}
              </span>
            </div>
          </div>

          {esMiTurno ? (
            <div className="bm-starter-banner" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
              <span>👉 <strong>¡ES TU TURNO!</strong> Selecciona una casilla</span>
            </div>
          ) : (
            <div className="bm-starter-banner">
              <span>⏳ Esperando a: <strong>{ronda.jugadorActivoNombre}</strong></span>
            </div>
          )}

          <div className="bm-grid-15">
            {ronda.casillas.map((c) => {
              if (c.descubierta) {
                if (c.correcto) {
                  return (
                    <button key={c.id} type="button" className="bm-casilla-btn acertada" disabled>
                      <span>{c.texto}</span>
                      <span className={`bm-badge-pts ${c.dificultad}`}>
                        +{c.puntos} {c.puntos === 1 ? 'pt' : 'pts'}
                      </span>
                    </button>
                  );
                } else {
                  return (
                    <button key={c.id} type="button" className="bm-casilla-btn mina-explotada" disabled>
                      <span>💣 {c.texto}</span>
                    </button>
                  );
                }
              }

              return (
                <button
                  key={c.id}
                  type="button"
                  className="bm-casilla-btn"
                  disabled={!esMiTurno || yoEliminado}
                  onClick={() => handleSeleccionarCasilla(c.id)}
                  style={{
                    cursor: esMiTurno && !yoEliminado ? 'pointer' : 'default',
                    opacity: esMiTurno && !yoEliminado ? 1 : 0.85
                  }}
                >
                  <span>{c.texto}</span>
                </button>
              );
            })}
          </div>

          {ronda.explosionModal && (
            <div className="bm-modal-explosion-fondo" onClick={esAdmin ? handleCerrarExplosion : undefined}>
              <div className="bm-modal-explosion-card" onClick={(e) => e.stopPropagation()}>
                <span className="bm-bomba-animada">💣💥</span>
                <h2 className="bm-explosion-titulo">¡BOOM! ¡MINA PISADA!</h2>
                <p className="bm-explosion-txt">
                  <strong>{ronda.explosionModal.casillaTexto}</strong> no cumple la consigna.
                  <br />
                  <strong>{ronda.explosionModal.jugadorNombre}</strong> queda eliminado de esta ronda.
                </p>
                {esAdmin ? (
                  <button type="button" className="big full" onClick={handleCerrarExplosion}>
                    {ronda.motivoFinRonda ? 'Ver resultados de la ronda' : 'Continuar con el siguiente jugador'}
                  </button>
                ) : (
                  <p className="hint small">Esperando a que el anfitrión continúe...</p>
                )}
              </div>
            </div>
          )}

          <button className="secondary danger full" style={{ marginTop: '1.2rem' }} onClick={() => setModalSalir(true)}>
            Salir de la sala
          </button>
        </section>
      )}

      {/* 7. FIN DE RONDA ONLINE */}
      {vista === 'sala' && sala && sala.estado === 'jugando' && ronda && ronda.faseRonda === 'ronda_fin' && (
        <section className="game">
          <div className="end-card aprox-resolucion-card">
            <span className="end-icon"><Icon name="trophy" size={44} /></span>
            <p className="categoria">Ronda {sala.rondaNum} completada</p>
            <h1 className="title">{ronda.motivoFinRonda || 'Fin de la ronda'}</h1>
            <p className="reveal" style={{ fontSize: '1.2rem', margin: '0.6rem 0' }}>
              Consigna: «{ronda.consigna}»
            </p>

            <div className="bm-grid-15" style={{ margin: '1.2rem 0' }}>
              {ronda.casillas.map((c) => (
                <div
                  key={c.id}
                  className={`bm-casilla-btn ${c.correcto ? 'acertada' : 'mina-explotada'}`}
                  style={{ cursor: 'default' }}
                >
                  <span>{c.correcto ? '✓ ' : '💣 '}{c.texto}</span>
                  {c.correcto && (
                    <span className={`bm-badge-pts ${c.dificultad}`}>
                      +{c.puntos} {c.puntos === 1 ? 'pt' : 'pts'}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="scoreboard" style={{ width: '100%', marginTop: '1rem' }}>
              <h3 className="section-title" style={{ margin: '0 0 0.8rem', textAlign: 'center' }}>
                Clasificación general
              </h3>
              {ranking.map((j, i) => {
                const lider = maximoPuntos > 0 && j.puntos === maximoPuntos;
                return (
                  <div key={j.id} className={`score-row ${lider ? 'first' : ''}`}>
                    <span className="score-name">
                      {lider ? <Icon name="crown" size={22} /> : <span className="pos">{i + 1}</span>}
                      {j.nombre}
                    </span>
                    <span className="score-pts">{j.puntos} pts</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="actions" style={{ marginTop: '1.2rem' }}>
            {esAdmin ? (
              <>
                {sala.rondaNum < sala.maxRondas ? (
                  <button className="big full" onClick={handleSiguienteRonda}>
                    <Icon name="play" size={20} /> Elegir siguiente categoría (Ronda {sala.rondaNum + 1} de {sala.maxRondas})
                  </button>
                ) : (
                  <button className="big full" onClick={handleFinalizar}>
                    <Icon name="trophy" size={20} /> Ver podio final
                  </button>
                )}
                <button className="secondary danger full" onClick={handleFinalizar}>
                  <Icon name="flagFinish" size={20} /> Finalizar partida
                </button>
              </>
            ) : (
              <div className="panel center" style={{ width: '100%', padding: '1rem' }}>
                <p className="hint">Esperando a que el anfitrión avance a la siguiente ronda...</p>
                <button className="secondary danger full" style={{ marginTop: '0.8rem' }} onClick={() => setModalSalir(true)}>
                  Salir de la sala
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 8. PODIO FINAL ONLINE */}
      {vista === 'sala' && sala && sala.estado === 'final' && (
        <section className="game">
          <div className="end-card">
            <span className="end-icon"><Icon name="crown" size={48} /></span>
            <h1 className="title">Clasificación Final</h1>
            <p className="final-score">
              {ganadores.length === 0
                ? 'Nadie ha conseguido puntos'
                : ganadores.length === 1
                ? <>¡Victoria para {ganadores[0].nombre} con {maximoPuntos} puntos!</>
                : <>Empate entre {ganadores.map((g) => g.nombre).join(', ')} con {maximoPuntos} puntos</>}
            </p>

            <div className="scoreboard">
              {ranking.map((j, i) => {
                const lider = maximoPuntos > 0 && j.puntos === maximoPuntos;
                return (
                  <div key={j.id} className={`score-row ${lider ? 'first' : ''}`}>
                    <span className="score-name">
                      {lider ? <Icon name="crown" size={22} /> : <span className="pos">{i + 1}</span>}
                      {j.nombre}
                    </span>
                    <span className="score-pts">{j.puntos} pts</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="actions" style={{ marginTop: '1.5rem' }}>
            <button className="secondary danger full" onClick={() => setModalSalir(true)}>
              <Icon name="door" size={20} /> Salir al menú
            </button>
          </div>
        </section>
      )}

      {/* MODAL DE CONFIRMACIÓN PARA SALIR */}
      {modalSalir && (
        <div className="rg-modal-fondo" onClick={() => setModalSalir(false)}>
          <div 
            className="rg-modal" 
            onClick={(e) => e.stopPropagation()} 
            style={{ maxWidth: '420px', textAlign: 'center', padding: '1.8rem 1.4rem' }}
          >
            <div style={{ fontSize: '2.4rem', marginBottom: '0.4rem' }}>🚪</div>
            <h3 style={{ margin: '0 0 0.6rem', color: '#1e1b4b', fontSize: '1.3rem' }}>
              ¿Abandonar la partida?
            </h3>
            <p className="hint" style={{ fontSize: '0.95rem', marginBottom: '1.4rem', lineHeight: '1.4' }}>
              Si sales de la sala perderás tu progreso actual en la partida. ¿Estás seguro de que deseas salir?
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <button 
                type="button" 
                className="secondary full" 
                onClick={() => setModalSalir(false)}
              >
                No, quedarme
              </button>
              <button 
                type="button" 
                className="secondary danger full" 
                style={{ background: '#ef4444', color: '#ffffff', borderColor: '#dc2626' }}
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