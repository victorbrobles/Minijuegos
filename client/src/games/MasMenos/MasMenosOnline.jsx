// client/src/games/MasMenos/MasMenosOnline.jsx
import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../components/Icon.jsx';
import CategoryCard from '../../components/CategoryCard.jsx';
import './MasMenos.css';
import {
  MenuInicioJuego,
  MenuModoOnline,
  FormCrearSala,
  FormUnirseSala,
  CabeceraSala,
  ListaSala,
  EsperandoAnfitrion
} from '../../components/MenuJuego.jsx';

const CLAVE_SESION_MM = 'masmenos_online_session';
const TIEMPO_TURNO = 30;

const COLORES_JUGADOR = ['#4d7c0f', '#3b82f6', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4', '#f97316', '#84cc16'];
const colorJugador = (id) => COLORES_JUGADOR[(Number(id) - 1 + COLORES_JUGADOR.length * 10) % COLORES_JUGADOR.length];
const inicial = (n = '?') => n.trim().charAt(0).toUpperCase() || '?';

export default function MasMenosOnline({ onLocal }) {
  const [vista, setVista] = useState('menu'); // 'menu' | 'online_menu' | 'crear' | 'unirse' | 'sala'
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
  const [sinRed, setSinRed] = useState(false);
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

    let fallos = 0;
    let pedidas = 0;
    let aplicada = 0;
    const cerrar = (msg) => {
      sessionStorage.removeItem(CLAVE_SESION_MM);
      setSesion(null);
      setSala(null);
      setSinRed(false);
      setVista('online_menu');
      setErrorMsg(msg);
    };

    const consultarEstado = () => {
      const n = ++pedidas;
      fetch(`/api/masmenos/online/sala/${sesion.code}?token=${sesion.token}`)
        .then(async (r) => {
          if (r.status === 404 || r.status === 403) {
            const d = await r.json().catch(() => ({}));
            cerrar(d.error || 'La sala se ha cerrado.');
            return;
          }
          if (!r.ok) throw new Error('red');
          const d = await r.json();
          if (n < aplicada) return;
          aplicada = n;
          fallos = 0;
          setSinRed(false);
          if (d.success) {
            setSala(d);
            setVista('sala');
          }
        })
        .catch(() => {
          fallos += 1;
          if (fallos >= 3) setSinRed(true);
          if (fallos >= 40) cerrar('Se ha perdido la conexión con la sala.');
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

  const handleExpulsar = async (jugadorId) => {
    if (!sesion) return;
    try {
      await fetch(`/api/masmenos/online/sala/${sesion.code}/expulsar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token, jugadorId })
      });
    } catch (err) {
      console.error(err);
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
    handleTimeOutRef.current = () => handleElegirTarjeta('TIMEOUT');
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

  const handleReiniciarPartida = async () => {
    try {
      await fetch(`/api/masmenos/online/sala/${sesion.code}/reiniciar`, {
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
        await fetch(`/api/masmenos/online/sala/${sesion.code}/salir`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: sesion.token }),
          keepalive: true
        });
      } catch {
        /* ignorar */
      }
    }
    sessionStorage.removeItem(CLAVE_SESION_MM);
    setSesion(null);
    setSala(null);
    setVista('online_menu');
  };

  const formatearCifra = (num) => {
    if (typeof num !== 'number') return num;
    return new Intl.NumberFormat('es-ES').format(num);
  };

  const ranking = sala?.jugadores ? [...sala.jugadores].sort((a, b) => b.puntos - a.puntos) : [];
  const maximo = ranking.length ? ranking[0].puntos : 0;
  const ganadores = maximo > 0 ? ranking.filter((j) => j.puntos === maximo) : [];
  const enPartidaActiva = vista === 'sala' && sala && sala.estado !== 'lobby';

  return (
    <div className={`mm-contenedor ${enPartidaActiva ? 'qq-en-partida' : ''}`}>
      {sinRed && <div className="ptp-sin-red">📶 Reconectando con la sala…</div>}

      {/* AYUDA */}
      {modalAyuda && (
        <div className="rg-modal-fondo" onClick={() => setModalAyuda(false)}>
          <div className="rg-modal ptp-modal-ayuda" onClick={(e) => e.stopPropagation()}>
            <div className="ptp-modal-ayuda-header">
              <span className="ptp-ayuda-badge">❓ Cómo jugar</span>
              <h3>Entre dos aguas</h3>
            </div>

            <div className="ptp-modal-ayuda-body">
              <p>Compite en la sala multijugador para adivinar qué cifra es mayor.</p>
              <ul>
                <li><strong>Dinámica:</strong> Aparecen dos tarjetas con datos frente a frente. Tienes <strong>30 segundos</strong> para elegir la cifra más alta en tu turno.</li>
                <li><strong>Racha:</strong> Si aciertas, sumas +1 punto a tu racha, se desvelan las cifras y la tarjeta perdedora se renueva.</li>
                <li><strong>Fin de turno:</strong> Tu turno termina en cuanto fallas o se agota el tiempo, pasando el relevo al siguiente jugador.</li>
              </ul>
            </div>

            <button type="button" className="ptp-boton" onClick={() => setModalAyuda(false)}>
              ¡Entendido!
            </button>
          </div>
        </div>
      )}

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

          <ListaSala
            jugadores={sala.jugadores}
            yoId={yoId}
            min={2}
            max={10}
            anfitrionId={sala.anfitrionId}
            renderExtra={(j) => (
              <span className="ptp-sala-extra">
                {!j.conectado && <span className="ptp-sin-conexion" title="Sin conexión">📵</span>}
                {esAdmin && j.id !== yoId && (
                  <button type="button" className="ptp-quitar" onClick={() => handleExpulsar(j.id)}>
                    Quitar
                  </button>
                )}
              </span>
            )}
          />

          {errorMsg && <p className="error" style={{ margin: '0.8rem 0' }}>{errorMsg}</p>}

          {esAdmin ? (
            <div style={{ marginTop: '1.2rem' }}>
              <button
                className="big full qq-btn-principal"
                disabled={sala.jugadores.length < 2}
                onClick={handleIniciarPartida}
              >
                <Icon name="play" size={22} />
                {sala.jugadores.length < 2 ? 'Esperando rivales (mínimo 2)...' : '¡Elegir Categoría!'}
              </button>
            </div>
          ) : (
            <EsperandoAnfitrion texto="El anfitrión está a punto de elegir la categoría para iniciar la partida." />
          )}
        </section>
      )}

      {/* 5. SELECTOR DE CATEGORÍA */}
      {vista === 'sala' && sala && sala.estado === 'categoria' && (
        <section className="game qq-pantalla">
          <div className="hud">
            <span className="chip"><Icon name="target" size={18} />Selector de categoría</span>
          </div>

          {esAdmin ? (
            <>
              <h3 className="section-title" style={{ textAlign: 'center', marginBottom: '1rem', color: '#0f172a' }}>
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
            <div className="panel center qq-menu-panel" style={{ padding: '2.5rem 1.5rem', marginTop: '1rem' }}>
              <span className="end-icon"><Icon name="target" size={44} /></span>
              <h2 className="title" style={{ marginTop: '0.8rem' }}>Eligiendo categoría...</h2>
              <p className="hint">El anfitrión está seleccionando la temática para esta partida.</p>
            </div>
          )}
        </section>
      )}

      {/* 6. JUGANDO ONLINE */}
      {vista === 'sala' && sala && sala.estado === 'jugando' && ronda && ronda.faseRonda === 'jugando' && (
        <section className="game ptp-escena">
          <header className="ptp-hero">
            <span className="ptp-hero-deco" aria-hidden="true">
              <Icon name="scale" size={140} strokeWidth={1.3} />
            </span>
            <div className="ptp-hero-top">
              <button type="button" className="ptp-salir" onClick={() => setModalSalir(true)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                <span>Salir</span>
              </button>
              <div className="ptp-hero-chips">
                <span className="ptp-chip">
                  <Icon name="users" size={14} /> {esMiTurno ? '¡Tu turno!' : ronda.jugadorActivoNombre}
                </span>
                <span className="ptp-chip">
                  <Icon name="flame" size={14} /> Racha: {ronda.puntosTurno}
                </span>
              </div>
            </div>

            <ol className="ptp-marcador" aria-label="Jugadores">
              {sala.jugadores.map((j) => {
                const esTurnoDeEste = j.id === ronda.jugadorActivoId;
                const pts = esTurnoDeEste ? ronda.puntosTurno : j.puntos;
                return (
                  <li
                    key={j.id}
                    className={`ptp-jugador${j.jugo ? ' respondido' : ''}${j.id === yoId ? ' yo' : ''}`}
                    style={{ '--c': colorJugador(j.id) }}
                  >
                    <span className="ptp-jugador-avatar">{inicial(j.nombre)}</span>
                    <span className="ptp-jugador-datos">
                      <span className="ptp-jugador-nombre">{j.nombre}{j.id === yoId ? ' (tú)' : ''}</span>
                      <span className="ptp-jugador-linea">
                        <strong>{j.jugo || esTurnoDeEste ? `${pts} pts` : 'Pendiente'}</strong>
                      </span>
                    </span>
                    <span className="ptp-jugador-estado">
                      {j.jugo ? '✅' : esTurnoDeEste ? '⚡' : '⏳'}
                    </span>
                  </li>
                );
              })}
            </ol>
          </header>

          {/* Temporizador */}
          <div className={`ptp-tiempo ${tiempoRestante <= 10 ? 'critico' : ''}`} role="timer">
            <div className="ptp-tiempo-barra">
              <span style={{ width: `${(tiempoRestante / TIEMPO_TURNO) * 100}%` }} />
            </div>
            <span className="ptp-tiempo-num">
              <Icon name="clock" size={15} /> {tiempoRestante}s
            </span>
          </div>

          <div className="ptp-tarjeta" style={{ padding: '0.8rem 1rem', textAlign: 'center' }}>
            <h2 className="title" style={{ margin: '0.2rem 0', fontSize: '1.25rem', color: '#0f172a' }}>
              {esMiTurno ? '¿Cuál tiene la cifra más grande?' : `Observando a ${ronda.jugadorActivoNombre}...`}
            </h2>
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
        </section>
      )}

      {/* 7. FIN DE TURNO INDIVIDUAL */}
      {vista === 'sala' && sala && sala.estado === 'jugando' && ronda && ronda.faseRonda === 'turno_fin' && (
        <section className="game ptp-escena">
          <header className="ptp-hero">
            <span className="ptp-hero-deco" aria-hidden="true">
              <Icon name="hourglass" size={140} strokeWidth={1.3} />
            </span>
            <div className="ptp-hero-top">
              <button type="button" className="ptp-salir" onClick={() => setModalSalir(true)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                <span>Salir</span>
              </button>
              <span className="ptp-chip"><Icon name="flagFinish" size={14} /> ¡Racha terminada!</span>
            </div>
            <p className="ptp-etiqueta" style={{ color: 'rgba(255,255,255,0.85)' }}>
              Resultado de {ronda.jugadorActivoNombre}
            </p>
            <h2 className="ptp-solucion-titulo">
              {ronda.puntosTurno} aciertos
            </h2>
          </header>

          <div className="ptp-tarjeta">
            <p className="ptp-etiqueta">Clasificación provisional</p>
            <ol className="ptp-ranking">
              {sala.jugadores.map((j, i) => {
                const esActual = j.id === ronda.jugadorActivoId;
                return (
                  <li key={j.id} className={esActual ? 'lider' : ''} style={{ '--c': colorJugador(j.id) }}>
                    <span className="ptp-ranking-pos">{j.jugo ? '✅' : i + 1}</span>
                    <span className="ptp-jugador-avatar">{inicial(j.nombre)}</span>
                    <span className="ptp-ranking-nombre">
                      {j.nombre}{j.id === yoId ? ' (tú)' : ''}
                    </span>
                    <strong>{j.jugo ? `${j.puntos} pts` : 'Pendiente'}</strong>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="ptp-barra estatica">
            {esAdmin ? (
              sala.jugadores.some((j) => !j.jugo) ? (
                <button type="button" className="ptp-boton grande" onClick={handleSiguienteJugador}>
                  <Icon name="play" size={20} /> Turno del siguiente jugador
                </button>
              ) : (
                <button type="button" className="ptp-boton grande" onClick={handleFinalizar}>
                  <Icon name="trophy" size={20} /> Ver podio final
                </button>
              )
            ) : (
              <p className="ptp-espera">Esperando a que el anfitrión lance el siguiente turno...</p>
            )}
          </div>
        </section>
      )}

      {/* 8. PODIO FINAL ONLINE */}
      {vista === 'sala' && sala && sala.estado === 'final' && (
        <section className="game ptp-escena">
          <div className="end-card">
            <span className="end-icon"><Icon name="crown" size={44} /></span>
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
                      {j.nombre} {j.id === yoId ? '(Tú)' : ''}
                    </span>
                    <span className="score-pts">{j.puntos} pts</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="ptp-barra estatica">
            {esAdmin && (
              <button type="button" className="ptp-boton grande" onClick={handleReiniciarPartida}>
                <Icon name="refresh" size={20} /> Otra partida (mismos jugadores)
              </button>
            )}
            <button type="button" className="ptp-boton secundario" onClick={() => setModalSalir(true)}>
              <Icon name="door" size={20} /> Salir al menú
            </button>
          </div>
        </section>
      )}

      {/* MODAL DE CONFIRMACIÓN PARA SALIR */}
      {modalSalir && (
        <div className="rg-modal-fondo" onClick={() => setModalSalir(false)}>
          <div className="rg-modal ptp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ptp-modal-icono">🚪</div>
            <h3>¿Abandonar la partida?</h3>
            <p className="hint">Si sales de la sala perderás tu progreso actual en la partida. ¿Estás seguro de que deseas salir?</p>

            <div className="ptp-fila-botones">
              <button type="button" className="ptp-boton secundario" onClick={() => setModalSalir(false)}>
                No, quedarme
              </button>
              <button
                type="button"
                className="ptp-boton peligro"
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