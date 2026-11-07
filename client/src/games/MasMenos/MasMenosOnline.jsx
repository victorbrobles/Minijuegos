// client/src/games/MasMenos/MasMenosOnline.jsx
import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../components/Icon.jsx';
import CategoryCard from '../../components/CategoryCard.jsx';
import './MasMenos.css';
import '../Adivina/Adivina.css';
import { MenuInicioJuego, MenuModoOnline, FormCrearSala, FormUnirseSala, CabeceraSala, EsperandoAnfitrion } from '../../components/MenuJuego.jsx';

const CLAVE_SESION_MM = 'masmenos_online_session';
const TIEMPO_TURNO = 30;

export default function MasMenosOnline({ onLocal, onSalir }) {
  const [vista, setVista] = useState('menu'); // 'menu' | 'crear' | 'unirse' | 'sala'
  const [nombre, setNombre] = useState('');
  const [codigoInput, setCodigoInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);
  const [modalSalir, setModalSalir] = useState(false);
  const [modalAyuda, setModalAyuda] = useState(false);

  const [categorias, setCategorias] = useState([]);
  const [sesion, setSesion] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(CLAVE_SESION_MM));
    } catch {
      return null;
    }
  });

  const [sala, setSala] = useState(null);
  const [codigoCopiado, setCodigoCopiado] = useState(false);
  const [tiempoRestante, setTiempoRestante] = useState(TIEMPO_TURNO);

  const intervalRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    fetch('/api/masmenos/categorias')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setCategorias(d.categorias);
      })
      .catch((e) => console.error(e));
  }, []);

  useEffect(() => {
    if (!sesion) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setSala(null);
      return;
    }

    const consultarEstado = () => {
      fetch(`/api/masmenos/online/sala/${sesion.code}?token=${sesion.token}`)
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
          sessionStorage.removeItem(CLAVE_SESION_MM);
          setSesion(null);
          setSala(null);
          setVista('online_menu');
          setErrorMsg('La sala se ha cerrado.');
        });
    };

    consultarEstado();
    intervalRef.current = setInterval(consultarEstado, 550);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sesion]);

  const handleCrear = async () => {
    if (!nombre.trim()) return;
    setCargando(true);
    try {
      const res = await fetch('/api/masmenos/online/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_MM, JSON.stringify(nueva));
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
      const res = await fetch('/api/masmenos/online/unirse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codigoInput.trim().toUpperCase(), nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_MM, JSON.stringify(nueva));
      setSesion(nueva);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleIniciarPartida = async () => {
    try {
      const res = await fetch(`/api/masmenos/online/sala/${sesion.code}/iniciar-partida`, {
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
      const res = await fetch(`/api/masmenos/online/sala/${sesion.code}/elegir-categoria`, {
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

  const handleElegirTarjeta = async (opcion) => {
    try {
      const res = await fetch(`/api/masmenos/online/sala/${sesion.code}/elegir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token, opcion })
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTimeOutRef = useRef();
  useEffect(() => {
    handleTimeOutRef.current = () => handleElegirTarjeta('TIMEOUT'); // Forzamos respuesta incorrecta
  });

  const ronda = sala?.ronda;
  const esAdmin = sala?.esAdmin;
  const yoId = sala?.yoId;
  const esMiTurno = ronda?.jugadorActivoId === yoId;

  // Temporizador sincronizado
  useEffect(() => {
    const isJugando = sala?.estado === 'jugando' && ronda?.faseRonda === 'jugando';
    if (!isJugando || ronda?.estadoEleccion !== null) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    setTiempoRestante(TIEMPO_TURNO);
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          if (esMiTurno && handleTimeOutRef.current) {
            handleTimeOutRef.current();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sala?.estado, ronda?.faseRonda, ronda?.estadoEleccion, ronda?.puntosTurno, esMiTurno]);

  const handleSiguienteJugador = async () => {
    try {
      await fetch(`/api/masmenos/online/sala/${sesion.code}/siguiente-jugador`, {
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
      await fetch(`/api/masmenos/online/sala/${sesion.code}/finalizar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSalir = () => {
    sessionStorage.removeItem(CLAVE_SESION_MM);
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

  const formatearCifra = (num) => {
    if (typeof num !== 'number') return num;
    return new Intl.NumberFormat('es-ES').format(num);
  };

  const ranking = sala?.jugadores ? [...sala.jugadores].sort((a, b) => b.puntos - a.puntos) : [];
  const maximo = ranking.length ? ranking[0].puntos : 0;
  const ganadores = maximo > 0 ? ranking.filter((j) => j.puntos === maximo) : [];


  return (
    <div className="mm-contenedor">
      {/* ---------------- BOTÓN Y MODAL DE AYUDA ---------------- */}

      {modalAyuda && (
        <div className="rg-modal-fondo" onClick={() => setModalAyuda(false)}>
          <div className="rg-modal aprox-modal-ayuda" onClick={(e) => e.stopPropagation()}>
            <div className="aprox-modal-header">
              <span className="aprox-modal-signo-title">?</span>
              <h3>¿Cómo se juega a Entre dos aguas?</h3>
            </div>

            <div className="aprox-modal-cuerpo">
              <p><strong>1. Dinámica del reto:</strong></p>
              <ul>
                <li>Eliges una categoría y se sortea quién empieza la partida.</li>
                <li>Aparecen dos datos frente a frente. Tienes <strong>30 segundos</strong> para <strong>elegir la cifra más alta</strong>.</li>
                <li>Si aciertas, sumas <strong>+1 punto</strong>, se desvelan las cifras reales y la tarjeta perdedora o más antigua se sustituye por una nueva.</li>
                <li>¡Encadena tantos aciertos consecutivos como puedas hasta fallar (o quedarte sin tiempo)!</li>
              </ul>
            </div>

            <div className="rg-modal-acciones">
              <button className="big full" onClick={() => setModalAyuda(false)}>
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ---------------- FIN AYUDA ---------------- */}

      {/* 1. MENÚ ONLINE */}
      {vista === 'menu' && (
        <MenuInicioJuego
          juegoId="masmenos"
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

      {/* 2. CREAR SALA */}
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

      {/* 3. UNIRSE A SALA */}
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

      {/* 4. LOBBY */}
      {vista === 'sala' && sala && sala.estado === 'lobby' && (
        <section className="game qq-pantalla">
          <CabeceraSala codigo={sala.code} onVolver={() => setModalSalir(true)} onAyuda={() => setModalAyuda(true)} />

          <div className="panel qq-menu-panel" style={{ marginTop: '1rem' }}>
            <h3 className="qq-sala-titulo"><Icon name="users" size={20} /> Jugadores ({sala.jugadores.length}/10)</h3>
            <div className="lb-lista qq-sala-lista">
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
              className="big full qq-btn-principal"
              style={{ marginTop: '1.2rem' }}
              disabled={sala.jugadores.length < 2}
              onClick={handleIniciarPartida}
            >
              <Icon name="play" size={22} /> {sala.jugadores.length < 2 ? 'Esperando rivales (mínimo 2)...' : '¡Elegir Categoría!'}
            </button>
          ) : (
            <EsperandoAnfitrion />
          )}

        </section>
      )}

      {/* 5. SELECTOR DE CATEGORÍA */}
      {vista === 'sala' && sala && sala.estado === 'categoria' && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="target" size={18} />Selector de categoría</span>
          </div>

          {esAdmin ? (
            <>
              <h3 className="section-title" style={{ textAlign: 'center', marginBottom: '1rem' }}>
                ¿Qué temática queréis comparar?
              </h3>
              <div className="rf-opciones conecta-categories-grid">
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
              <h2 className="title" style={{ marginTop: '0.8rem' }}>Eligiendo categoría...</h2>
              <p className="hint">El anfitrión está seleccionando la temática para esta partida.</p>
            </div>
          )}

          <button className="secondary danger full" style={{ marginTop: '1.5rem' }} onClick={() => setModalSalir(true)}>
            Salir de la sala
          </button>
        </section>
      )}

      {/* 6. JUGANDO ONLINE */}
      {vista === 'sala' && sala && sala.estado === 'jugando' && ronda && ronda.faseRonda === 'jugando' && (
        <section className="game">
          <div className="hud">
            <span className="chip">
              <Icon name="users" size={18} />
              {esMiTurno ? (
                <strong>¡Es tu turno!</strong>
              ) : (
                <>Turno de: <strong>{ronda.jugadorActivoNombre}</strong></>
              )}
            </span>
            <span className="mm-streak-pill">
              🔥 Racha: {ronda.puntosTurno} {ronda.puntosTurno === 1 ? 'acierto' : 'aciertos'}
            </span>
          </div>

          <h2 className="title center" style={{ margin: '0.5rem 0 0.2rem', fontSize: '1.45rem' }}>
            ¿Cuál tiene la cifra más grande?
          </h2>
          <p className="hint small center" style={{ marginBottom: '1rem' }}>
            {esMiTurno
              ? 'Pulsa sobre la tarjeta que consideres mayor'
              : `Observando en directo las elecciones de ${ronda.jugadorActivoNombre}...`}
          </p>

          {/* Temporizador de 30 segundos */}
          <div style={{ padding: '0 1rem', marginTop: '0.5rem', marginBottom: '1rem' }}>
            <div
              className="timer"
              role="timer"
              style={{ margin: '0.4rem 0', background: '#e2e8f0', borderRadius: '9999px', height: '8px', overflow: 'hidden' }}
            >
              <div
                className={`timer-bar ${tiempoRestante <= 10 ? 'low' : ''}`}
                style={{
                  width: `${(tiempoRestante / TIEMPO_TURNO) * 100}%`,
                  height: '100%',
                  backgroundColor: tiempoRestante <= 10 ? '#ef4444' : '#16a34a',
                  borderRadius: '9999px',
                  transition: 'width 0.1s linear, background-color 0.3s ease'
                }}
              />
            </div>
            <p
              className="timer-text"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                color: tiempoRestante <= 10 ? '#dc2626' : '#64748b', fontSize: '0.9rem', fontWeight: 700, margin: '0'
              }}
            >
              <Icon name="clock" size={16} />
              {tiempoRestante} s
            </p>
          </div>

          <div className="mm-versus-wrapper">
            <button
              type="button"
              className={`mm-card-opcion ${
                ronda.estadoEleccion?.eleccion === 'A'
                  ? ronda.estadoEleccion.esAcierto
                    ? 'acierto'
                    : 'fallo'
                  : ''
              }`}
              disabled={!esMiTurno || ronda.estadoEleccion !== null}
              onClick={() => handleElegirTarjeta('A')}
              style={{ cursor: esMiTurno ? 'pointer' : 'default' }}
            >
              <h3 className="mm-card-nombre">{ronda.tarjetaA.nombre}</h3>
              {ronda.tarjetaA.detalle && <p className="mm-card-detalle">{ronda.tarjetaA.detalle}</p>}

              {ronda.tarjetaA.valor !== null && (
                <>
                  <span className="mm-card-cifra">{formatearCifra(ronda.tarjetaA.valor)}</span>
                  <span className="mm-card-unidad">{ronda.tarjetaA.unidad}</span>
                </>
              )}
            </button>

            <span className="mm-vs-badge">VS</span>

            <button
              type="button"
              className={`mm-card-opcion ${
                ronda.estadoEleccion?.eleccion === 'B'
                  ? ronda.estadoEleccion.esAcierto
                    ? 'acierto'
                    : 'fallo'
                  : ''
              }`}
              disabled={!esMiTurno || ronda.estadoEleccion !== null}
              onClick={() => handleElegirTarjeta('B')}
              style={{ cursor: esMiTurno ? 'pointer' : 'default' }}
            >
              <h3 className="mm-card-nombre">{ronda.tarjetaB.nombre}</h3>
              {ronda.tarjetaB.detalle && <p className="mm-card-detalle">{ronda.tarjetaB.detalle}</p>}

              {ronda.tarjetaB.valor !== null && (
                <>
                  <span className="mm-card-cifra">{formatearCifra(ronda.tarjetaB.valor)}</span>
                  <span className="mm-card-unidad">{ronda.tarjetaB.unidad}</span>
                </>
              )}
            </button>
          </div>

          <button className="secondary danger full" style={{ marginTop: '1.5rem' }} onClick={() => setModalSalir(true)}>
            Salir de la sala
          </button>
        </section>
      )}

      {/* 7. FIN DE TURNO INDIVIDUAL */}
      {vista === 'sala' && sala && sala.estado === 'jugando' && ronda && ronda.faseRonda === 'turno_fin' && (
        <section className="game center">
          <div className="end-card">
            <span className="end-icon"><Icon name="hourglass" size={44} /></span>
            <h1 className="title">¡Racha terminada!</h1>
            <p className="reveal" style={{ fontSize: '1.4rem', margin: '0.8rem 0' }}>
              <strong>{ronda.jugadorActivoNombre}</strong> ha conseguido{' '}
              <strong>{ronda.puntosTurno} aciertos consecutivos</strong>.
            </p>

            <div className="scoreboard">
              {sala.jugadores.map((j) => (
                <div key={j.id} className={`score-row ${j.id === ronda.jugadorActivoId ? 'first' : ''}`}>
                  <span className="score-name">{j.nombre}</span>
                  <span className="score-pts">{j.jugo ? `${j.puntos} pts` : 'Pendiente'}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="actions" style={{ marginTop: '1.5rem' }}>
            {esAdmin ? (
              sala.jugadores.some((j) => !j.jugo) ? (
                <button className="big full" onClick={handleSiguienteJugador}>
                  <Icon name="play" size={20} /> Turno del siguiente jugador
                </button>
              ) : (
                <button className="big full" onClick={handleFinalizar}>
                  <Icon name="trophy" size={20} /> Ver podio final
                </button>
              )
            ) : (
              <p className="hint">Esperando a que el anfitrión lance el siguiente turno...</p>
            )}

            <button className="secondary danger full" onClick={() => setModalSalir(true)}>
              Salir de la sala
            </button>
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
                ? <>¡Victoria para {ganadores[0].nombre} con {maximo} puntos!</>
                : <>Empate entre {ganadores.map((g) => g.nombre).join(', ')} con {maximo} puntos</>}
            </p>

            <div className="scoreboard">
              {ranking.map((j, i) => {
                const lider = maximo > 0 && j.puntos === maximo;
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