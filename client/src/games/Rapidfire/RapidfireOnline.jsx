// client/src/games/Rapidfire/RapidfireOnline.jsx
import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../components/Icon.jsx';
import CategoryCard from '../../components/CategoryCard.jsx';
import './Rapidfire.css';
import '../Adivina/Adivina.css';

const CLAVE_SESION_RF = 'rapidfire_online_session';
const TIEMPO_S = 60;

export default function RapidfireOnline({ onLocal, onSalir }) {
  const [vista, setVista] = useState('menu');
  const [nombre, setNombre] = useState('');
  const [codigoInput, setCodigoInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);
  const [modalSalir, setModalSalir] = useState(false); // <--- NUEVO ESTADO

  const [sesion, setSesion] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(CLAVE_SESION_RF));
    } catch {
      return null;
    }
  });

  const [sala, setSala] = useState(null);
  const [codigoCopiado, setCodigoCopiado] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!sesion) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setSala(null);
      return;
    }

    const consultarEstado = () => {
      fetch(`/api/rapidfire/online/sala/${sesion.code}?token=${sesion.token}`)
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
          sessionStorage.removeItem(CLAVE_SESION_RF);
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
      const res = await fetch('/api/rapidfire/online/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_RF, JSON.stringify(nueva));
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
      const res = await fetch('/api/rapidfire/online/unirse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codigoInput.trim().toUpperCase(), nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_RF, JSON.stringify(nueva));
      setSesion(nueva);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleIniciarPartida = async () => {
    try {
      const res = await fetch(`/api/rapidfire/online/sala/${sesion.code}/iniciar`, {
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
      const res = await fetch(`/api/rapidfire/online/sala/${sesion.code}/elegir-categoria`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token, categoriaId })
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAccionJuez = async (accion) => {
    try {
      const res = await fetch(`/api/rapidfire/online/sala/${sesion.code}/accion-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token, accion })
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
    } catch (err) {
      console.error(err);
    }
  };

  const handleContinuarRonda = async () => {
    try {
      await fetch(`/api/rapidfire/online/sala/${sesion.code}/continuar-ronda`, {
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
      await fetch(`/api/rapidfire/online/sala/${sesion.code}/finalizar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSalir = () => {
    sessionStorage.removeItem(CLAVE_SESION_RF);
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
  const esMiTurno = ronda?.jugadorTurnoId === yoId;

  const ranking = sala?.jugadores ? [...sala.jugadores].sort((a, b) => b.puntos - a.puntos) : [];
  const maximo = ranking.length ? ranking[0].puntos : 0;
  const ganadores = maximo > 0 ? ranking.filter((j) => j.puntos === maximo) : [];

  return (
    <div className="rf-contenedor">
      {/* 1. MENÚ ONLINE */}
      {vista === 'menu' && (
        <section className="game">
          <div className="panel center">
            <span className="lb-luna chica">
              <Icon name="zap" size={42} strokeWidth={1.6} />
            </span>
            <h1 className="title">Rapidfire Online</h1>
            <p className="hint">
              Responde a contrarreloj en 60 segundos. En el modo online, el anfitrión actúa de juez y decide si cada respuesta es correcta o rebote.
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
            <p className="hint">Introduce tu nombre de anfitrión (serás el juez de las respuestas).</p>

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
              {sala.jugadores.length < 2 ? 'Esperando rivales (mínimo 2)...' : '¡Empezar Partida!'}
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

      {/* 5. ELECCIÓN DE CATEGORÍA */}
      {vista === 'sala' && sala && sala.estado === 'categorias' && ronda && (
        <section className="game">
          <p className="categoria"><Icon name="flagFinish" size={16} />Ronda {sala.rondaNum}</p>
          <div className="starter">
            <Icon name="dice" size={28} />
            <p>
              {esMiTurno
                ? <strong>¡Es tu turno de elegir categoría!</strong>
                : <>Abre la ronda <strong>{ronda.jugadorTurnoNombre}</strong></>}
            </p>
          </div>

          <h3 className="section-title">
            {esMiTurno ? 'Selecciona una de las 3 opciones:' : `Esperando a que ${ronda.jugadorTurnoNombre} elija categoría...`}
          </h3>

          <div className="rf-opciones">
            {ronda.opciones.map((c, idx) => (
              <CategoryCard
                key={c.id}
                nombre={c.nombre}
                icono={c.icono}
                indice={idx}
                onClick={esMiTurno ? () => handleElegirCategoria(c.id) : undefined}
              />
            ))}
          </div>

          <button className="secondary danger full" style={{ marginTop: '1.5rem' }} onClick={() => setModalSalir(true)}>
            Salir de la sala
          </button>
        </section>
      )}

      {/* 6. TURNO EN JUEGO */}
      {vista === 'sala' && sala && sala.estado === 'turno' && ronda && (
        <section className="game">
          {ronda.motivo && (
            <p className="rf-aviso" role="status">
              <Icon name={ronda.motivo === 'tiempo' ? 'hourglass' : 'refresh'} size={22} />
              {ronda.motivo === 'tiempo' ? '¡Se acabó el tiempo!' : '¡Rebote!'} Le toca a <strong>{ronda.jugadorTurnoNombre}</strong>
            </p>
          )}

          <div className="hud">
            <span className="chip">
              <Icon name="users" size={18} />
              {esMiTurno ? <strong>¡Es tu turno de hablar!</strong> : <>Turno: <strong>{ronda.jugadorTurnoNombre}</strong></>}
            </span>
            <span className="chip alt">{ronda.intento > 0 ? 'Rebote' : `Ronda ${sala.rondaNum}`}</span>
          </div>

          <p className="categoria"><Icon name={ronda.categoria.icono} size={16} />{ronda.categoria.nombre}</p>

          <div className="rf-reto-card">
            <div className="rf-reto-numero">{ronda.reto.n}</div>
            <div className="rf-reto-texto">{ronda.reto.texto}</div>
          </div>

          <div className="timer" role="timer" aria-label="Tiempo restante">
            <div
              className={`timer-bar${ronda.segsPrep === 0 && ronda.segsTurno <= 10 ? ' low' : ''}`}
              style={{ width: `${(ronda.segsTurno / TIEMPO_S) * 100}%` }}
            />
          </div>
          <p className="timer-text">
            <Icon name="clock" size={16} />
            {ronda.segsPrep > 0 ? `Preparados… ${ronda.segsPrep}` : `${ronda.segsTurno} s`}
          </p>

          {esAdmin ? (
            <div className="rf-panel-juez">
              <span className="rf-badge-juez">👑 Panel de control del Juez</span>
              <p className="hint small" style={{ margin: '0 0 0.8rem' }}>
                Escucha las respuestas de <strong>{ronda.jugadorTurnoNombre}</strong> y pulsa según corresponda:
              </p>
              <div className="rf-botones-juez">
                <button
                  type="button"
                  className="rf-btn-correcto"
                  disabled={ronda.segsPrep > 0}
                  onClick={() => handleAccionJuez('acierto')}
                >
                  <Icon name="check" size={22} strokeWidth={2.5} /> Correcto
                </button>
                <button
                  type="button"
                  className="rf-btn-rebote"
                  disabled={ronda.segsPrep > 0}
                  onClick={() => handleAccionJuez('rebote')}
                >
                  <Icon name="refresh" size={22} strokeWidth={2.5} /> Rebote
                </button>
              </div>
              <button
                type="button"
                className="secondary danger full"
                onClick={() => handleAccionJuez('rendirse')}
              >
                <Icon name="flag" size={18} /> Rendirse (nadie puntúa)
              </button>
            </div>
          ) : (
            <div className="status-alert info" style={{ textAlign: 'center', marginTop: '1rem' }}>
              El anfitrión (👑) está juzgando las respuestas en directo...
            </div>
          )}

          <button className="secondary danger full" style={{ marginTop: '1.2rem' }} onClick={() => setModalSalir(true)}>
            Salir de la sala
          </button>
        </section>
      )}

      {/* 7. PUNTUACIONES */}
      {vista === 'sala' && sala && sala.estado === 'puntuaciones' && (
        <section className="game">
          <div className="end-card">
            <span className="end-icon"><Icon name="trophy" size={44} /></span>
            <h1 className="title">Puntuaciones</h1>
            {ronda?.ultimo && (
              <p className="reveal">
                {ronda.ultimo.tipo === 'rendido'
                  ? 'Ronda finalizada: nadie suma puntos en este turno.'
                  : ronda.ultimo.tipo === 'rebote'
                  ? <><strong>{ronda.ultimo.jugador}</strong> ha cogido el rebote y se lleva <strong>{ronda.ultimo.puntos} puntos</strong>.</>
                  : <><strong>{ronda.ultimo.jugador}</strong> ha dicho todos los elementos y suma <strong>{ronda.ultimo.puntos} puntos</strong>.</>}
              </p>
            )}

            <div className="scoreboard">
              {ranking.map((j, i) => (
                <div key={j.id} className={`score-row${i === 0 && j.puntos > 0 ? ' first' : ''}`}>
                  <span className="score-name">
                    {i === 0 && j.puntos > 0 ? <Icon name="crown" size={22} /> : <span className="pos">{i + 1}</span>}
                    {j.nombre}
                  </span>
                  <span className="score-pts">{j.puntos} pts</span>
                </div>
              ))}
            </div>
          </div>

          <div className="actions" style={{ marginTop: '1.2rem' }}>
            {esAdmin ? (
              <>
                <button className="big full" onClick={handleContinuarRonda}>
                  <Icon name="play" size={20} /> Siguiente ronda ({sala.rondaNum + 1})
                </button>
                <button className="secondary danger full" onClick={handleFinalizar}>
                  <Icon name="flagFinish" size={20} /> Finalizar partida
                </button>
              </>
            ) : (
              <div className="panel center" style={{ width: '100%', padding: '1rem' }}>
                <p className="hint">Esperando a que el anfitrión avance de ronda...</p>
                <button className="secondary danger full" style={{ marginTop: '0.8rem' }} onClick={() => setModalSalir(true)}>
                  Salir de la sala
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 8. FINAL */}
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
              {ranking.map((j, i) => (
                <div key={j.id} className={`score-row${i === 0 && j.puntos > 0 ? ' first' : ''}`}>
                  <span className="score-name">
                    {i === 0 && j.puntos > 0 ? <Icon name="crown" size={22} /> : <span className="pos">{i + 1}</span>}
                    {j.nombre}
                  </span>
                  <span className="score-pts">{j.puntos} pts</span>
                </div>
              ))}
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