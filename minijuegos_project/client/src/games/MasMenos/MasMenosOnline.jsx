// client/src/games/MasMenos/MasMenosOnline.jsx
import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../components/Icon.jsx';
import CategoryCard from '../../components/CategoryCard.jsx';
import './MasMenos.css';
import '../Adivina/Adivina.css';

const CLAVE_SESION_MM = 'masmenos_online_session';

export default function MasMenosOnline({ onLocal, onSalir }) {
  const [vista, setVista] = useState('menu'); // 'menu' | 'crear' | 'unirse' | 'sala'
  const [nombre, setNombre] = useState('');
  const [codigoInput, setCodigoInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);

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

  const intervalRef = useRef(null);

  useEffect(() => {
    fetch('/api/masmenos/categorias')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setCategorias(d.categorias);
      })
      .catch((e) => console.error(e));
  }, []);

  // Polling continuo de sincronización
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
          setVista('menu');
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
    setVista('menu');
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

  const ronda = sala?.ronda;
  const esAdmin = sala?.esAdmin;
  const yoId = sala?.yoId;
  const esMiTurno = ronda?.jugadorActivoId === yoId;
  const ranking = sala?.jugadores ? [...sala.jugadores].sort((a, b) => b.puntos - a.puntos) : [];
  const maximo = ranking.length ? ranking[0].puntos : 0;
  const ganadores = maximo > 0 ? ranking.filter((j) => j.puntos === maximo) : [];

  return (
    <div className="mm-contenedor">
      {/* 1. MENÚ ONLINE */}
      {vista === 'menu' && (
        <section className="game">
          <div className="panel center">
            <span className="lb-luna chica">
              <Icon name="scale" size={42} strokeWidth={1.6} />
            </span>
            <h1 className="title">Entre dos aguas Online</h1>
            <p className="hint">
              Compara dos cifras numéricas frente a frente y elige cuál es la más alta. Los demás verán tu racha en directo en sus pantallas.
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
            <p className="hint">Introduce tu nombre de anfitrión (de 2 a 10 jugadores).</p>

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
              {codigoCopiado ? '¡Copiado!' : 'Comparte este código para que se unan (mínimo 2 jugadores).'}
            </p>
          </div>

          <div className="panel" style={{ marginTop: '1rem' }}>
            <h3 className="panel-title"><Icon name="users" size={20} /> Jugadores ({sala.jugadores.length}/10)</h3>
            <div className="lb-lista">
              {sala.jugadores.map((j) => (
                <div key={j.id} className={`lb-jug ${j.id === yoId ? 'yo' : ''}`}>
                  <span className="lb-punto on" />
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
              disabled={sala.jugadores.length < 2}
              onClick={handleIniciarPartida}
            >
              {sala.jugadores.length < 2 ? 'Esperando rivales (mínimo 2)...' : '¡Elegir Categoría!'}
            </button>
          ) : (
            <div className="panel center" style={{ marginTop: '1rem' }}>
              <p className="hint">Esperando a que el anfitrión comience la partida...</p>
            </div>
          )}

          <button className="secondary danger full" style={{ marginTop: '1rem' }} onClick={handleSalir}>
            Salir de la sala
          </button>
        </section>
      )}

      {/* 5. SELECTOR DE CATEGORÍA (ANFITRIÓN) */}
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

          <button className="secondary danger full" style={{ marginTop: '1.5rem' }} onClick={handleSalir}>
            Salir de la sala
          </button>
        </section>
      )}

      {/* 6. JUGANDO ONLINE (EL QUE TIENE EL TURNO JUEGA, LOS DEMÁS MIRAN EN VIVO) */}
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

          <div className="mm-versus-wrapper">
            {/* TARJETA A */}
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

            {/* TARJETA B */}
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

          <button className="secondary danger full" style={{ marginTop: '1.5rem' }} onClick={handleSalir}>
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

            <button className="secondary danger full" onClick={handleSalir}>
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
            <button className="secondary danger full" onClick={handleSalir}>
              <Icon name="door" size={20} /> Salir al menú
            </button>
          </div>
        </section>
      )}
    </div>
  );
}