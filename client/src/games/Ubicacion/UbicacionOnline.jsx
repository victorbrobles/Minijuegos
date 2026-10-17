// client/src/games/Ubicacion/UbicacionOnline.jsx
import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../components/Icon.jsx';
import MapaMundi from './MapaMundi.jsx';
import { formatearKm, resolverImagenes } from './geo.js';
import './Ubicacion.css';
import '../Adivina/Adivina.css';

const CLAVE_SESION_UBICACION = 'ubicacion_online_session';
const CANDIDATOS = 16;

export default function UbicacionOnline({ onLocal, onSalir }) {
  const [vista, setVista] = useState('menu'); // 'menu' | 'crear' | 'unirse' | 'sala'
  const [nombre, setNombre] = useState('');
  const [codigoInput, setCodigoInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);
  const [modalSalir, setModalSalir] = useState(false);

  const [sesion, setSesion] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(CLAVE_SESION_UBICACION));
    } catch {
      return null;
    }
  });

  const [sala, setSala] = useState(null);
  const [codigoCopiado, setCodigoCopiado] = useState(false);
  const [verImagen, setVerImagen] = useState(false);
  const [enfoque, setEnfoque] = useState(null);

  // Marcador provisional propio antes de confirmarlo en el backend
  const [miPosicionLocal, setMiPosicionLocal] = useState(null);

  const intervalRef = useRef(null);

  useEffect(() => {
    if (!sesion) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setSala(null);
      return;
    }

    const consultarEstado = () => {
      fetch(`/api/ubicacion/online/sala/${sesion.code}?token=${sesion.token}`)
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
          sessionStorage.removeItem(CLAVE_SESION_UBICACION);
          setSesion(null);
          setSala(null);
          setVista('menu');
          setErrorMsg('La sala se ha cerrado.');
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
    setErrorMsg('');
    try {
      const rLote = await fetch(`/api/ubicacion/lote?n=${CANDIDATOS}`);
      if (!rLote.ok) throw new Error('Error al conectar con la base de datos de lugares.');
      const candidatos = await rLote.json();
      const lugaresConFoto = await resolverImagenes(candidatos);
      if (!lugaresConFoto.length) throw new Error('No se pudieron descargar las fotos de los monumentos.');

      const res = await fetch('/api/ubicacion/online/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombre.trim(), lugares: lugaresConFoto })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_UBICACION, JSON.stringify(nueva));
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
      const res = await fetch('/api/ubicacion/online/unirse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codigoInput.trim().toUpperCase(), nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_UBICACION, JSON.stringify(nueva));
      setSesion(nueva);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleIniciarPartida = async () => {
    try {
      const res = await fetch(`/api/ubicacion/online/sala/${sesion.code}/iniciar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token })
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setMiPosicionLocal(null);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleColocarMarcador = (lat, lng) => {
    if (ronda?.miMarcador?.confirmado) return;
    setMiPosicionLocal({ lat, lng });

    fetch(`/api/ubicacion/online/sala/${sesion.code}/posicionar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: sesion.token, lat, lng })
    }).catch(() => {});
  };

  const handleConfirmarMarcador = async () => {
    if (!miPosicionLocal && !ronda?.miMarcador?.lat) return;
    try {
      await fetch(`/api/ubicacion/online/sala/${sesion.code}/confirmar`, {
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
      setMiPosicionLocal(null);
      await fetch(`/api/ubicacion/online/sala/${sesion.code}/siguiente-ronda`, {
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
      await fetch(`/api/ubicacion/online/sala/${sesion.code}/finalizar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSalir = () => {
    sessionStorage.removeItem(CLAVE_SESION_UBICACION);
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
  const miJugador = sala?.jugadores?.find((j) => j.id === yoId);
  const miColor = miJugador?.color || '#2563eb';
  const yaConfirmado = Boolean(ronda?.miMarcador?.confirmado);

  const marcadoresMapa = [];

  const miPos = miPosicionLocal || (ronda?.miMarcador?.lat ? { lat: ronda.miMarcador.lat, lng: ronda.miMarcador.lng } : null);
  if (miPos) {
    marcadoresMapa.push({
      id: 'mi-marcador',
      lat: miPos.lat,
      lng: miPos.lng,
      color: miColor,
      glifo: '★',
      grande: true,
      arrastrable: !yaConfirmado,
      etiqueta: yaConfirmado ? `${miJugador?.nombre} (Confirmado)` : `${miJugador?.nombre} (Tú)`
    });
  }

  if (ronda?.destellosVisibles?.length) {
    ronda.destellosVisibles.forEach((d) => {
      marcadoresMapa.push({
        id: d.id,
        lat: d.lat,
        lng: d.lng,
        color: d.color,
        glifo: '👁',
        grande: false,
        fantasma: true,
        arrastrable: false,
        etiqueta: `📍 ${d.nombre}`
      });
    });
  }

  const marcadoresResultado = ronda?.resultado
    ? [
        {
          id: 'correcto',
          lat: ronda.resultado.lugar.lat,
          lng: ronda.resultado.lugar.lng,
          color: '#111827',
          glifo: '✓',
          grande: true,
          z: 1000,
          etiqueta: ronda.resultado.lugar.nombre
        },
        ...ronda.resultado.filas
          .filter((f) => f.real)
          .map((f) => ({
            id: `jugador-${f.jugadorId}`,
            lat: f.real.lat,
            lng: f.real.lng,
            color: f.color,
            glifo: (f.nombre[0] ?? '?').toUpperCase(),
            etiqueta: f.nombre
          }))
      ]
    : [];

  const lineasResultado = ronda?.resultado
    ? ronda.resultado.filas
        .filter((f) => f.real)
        .map((f) => ({
          desde: f.real,
          hasta: ronda.resultado.lugar,
          color: f.color
        }))
    : [];

  const ranking = sala?.jugadores ? [...sala.jugadores].sort((a, b) => b.puntos - a.puntos) : [];
  const maximo = ranking.length ? ranking[0].puntos : 0;
  const ganadores = maximo > 0 ? ranking.filter((j) => j.puntos === maximo) : [];

  return (
    <div className="ub-contenedor">
      {/* 1. MENÚ ONLINE */}
      {vista === 'menu' && (
        <section className="game">
          <div className="panel center">
            <span className="lb-luna chica">
              <Icon name="globe" size={42} strokeWidth={1.6} />
            </span>
            <h1 className="title">Ubica el lugar Online</h1>
            <p className="hint">
              10 segundos para memorizar el monumento y 90 segundos para situar tu marcador simultáneamente con los demás. ¡Ojo a los radares de 1 segundo cada 15s!
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
                <Icon name="home" size={20} /> Jugar en un solo dispositivo (con señuelos)
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
            <p className="hint">Introduce tu nombre de anfitrión (hasta 10 jugadores simultáneos).</p>

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
                {cargando ? 'Descargando monumentos…' : 'Crear sala'}
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
                  <span className="ub-punto" style={{ background: j.color }} />
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
              {sala.jugadores.length < 2 ? 'Esperando rivales (mínimo 2)...' : '¡Empezar Partida (10 Rondas)!'}
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

      {/* 5. JUGANDO: FASE FOTO */}
      {vista === 'sala' && sala && sala.estado === 'jugando' && ronda && ronda.faseRonda === 'foto' && (
        <section className="game">
          <div className="hud">
            <span className="chip">Ronda {sala.rondaNum} de {sala.totalRondas}</span>
            <span className="chip alt">📸 Memoriza el monumento</span>
          </div>

          <div className="panel">
            <h3 className="panel-title"><Icon name="eye" size={22} /> ¡Todos mirando la foto!</h3>
            <img
              className="ub-foto"
              src={ronda.lugar.imagenUrl}
              alt="Monumento a situar en el mapa"
            />
            <div className="timer">
              <div
                className={`timer-bar${ronda.segundosRestantesFoto <= 3 ? ' low' : ''}`}
                style={{ width: `${(ronda.segundosRestantesFoto / 10) * 100}%` }}
              />
            </div>
            <p className="timer-text">
              <Icon name="clock" size={18} /> Pasando al mapa en: {ronda.segundosRestantesFoto} s
            </p>
          </div>
        </section>
      )}

      {/* 6. JUGANDO: FASE MAPA */}
      {vista === 'sala' && sala && sala.estado === 'jugando' && ronda && ronda.faseRonda === 'mapa' && (
        <section className="game">
          {verImagen && (
            <div className="ub-modal-fondo" onClick={() => setVerImagen(false)}>
              <div className="ub-modal ub-modal-foto" onClick={(e) => e.stopPropagation()}>
                <img className="ub-foto" src={ronda.lugar.imagenUrl} alt="Lugar" />
                <button className="big full" onClick={() => setVerImagen(false)}>Cerrar</button>
              </div>
            </div>
          )}

          <div className="ub-barra">
            <span className="chip">Ronda {sala.rondaNum} · ⏱️ {ronda.segundosRestantesMapa}s</span>
            <button className="secondary ub-mini" onClick={() => setVerImagen(true)}>
              <Icon name="eye" size={18} /> Ver imagen
            </button>
          </div>

          <div className="scoreboard-container" style={{ justifyContent: 'center', marginBottom: '0.8rem' }}>
            {sala.jugadores.map((j) => {
              const listo = ronda.jugadoresConfirmados.includes(j.id);
              return (
                <div key={j.id} className="score-pill" style={{ borderColor: listo ? '#10b981' : undefined }}>
                  <span className="ub-punto" style={{ background: j.color }} />
                  <span>{j.nombre}: {listo ? '✅ Listo' : 'Colocando…'}</span>
                </div>
              );
            })}
          </div>

          {ronda.destellosVisibles.length > 0 && (
            <div className="status-alert acierto" style={{ textAlign: 'center', marginBottom: '0.8rem' }}>
              📡 ¡RADAR ACTIVO (1s)! Vislumbrando marcadores provisionales de rivales no confirmados...
            </div>
          )}

          <div className="ub-turno" style={{ '--c': miColor }}>
            <p className="ub-turno-titulo">
              <span className="ub-punto" style={{ background: miColor }} />
              {yaConfirmado ? (
                <span>¡Marcador confirmado! Tu posición está blindada.</span>
              ) : (
                <span>Toca el mapa para situar tu marcador <strong>★ Real</strong>.</span>
              )}
            </p>
            <p className="ub-turno-texto">
              {yaConfirmado
                ? 'Esperando a que el resto de jugadores confirmen o se agote el tiempo de 90 segundos.'
                : 'Mientras no confirmes, tu marcador parpadeará durante 1 segundo para los demás cada 15 segundos.'}
            </p>
          </div>

          <MapaMundi
            key={`mapa-online-${sala.rondaNum}`}
            marcadores={marcadoresMapa}
            onClickMapa={handleColocarMarcador}
            onMoverMarcador={(id, lat, lng) => handleColocarMarcador(lat, lng)}
          />

          {!yaConfirmado ? (
            <button
              className="big full"
              disabled={!miPos}
              onClick={handleConfirmarMarcador}
              style={{ marginTop: '0.8rem' }}
            >
              <Icon name="check" size={22} /> Confirmar mi marcador definitivo
            </button>
          ) : (
            <div className="status-alert info" style={{ textAlign: 'center', marginTop: '0.8rem' }}>
              Has confirmado tu marcador. Esperando al resto...
            </div>
          )}

          <button className="secondary danger full" style={{ marginTop: '1.2rem' }} onClick={() => setModalSalir(true)}>
            Salir de la sala
          </button>
        </section>
      )}

      {/* 7. RESULTADOS DE LA RONDA */}
      {vista === 'sala' && sala && sala.estado === 'jugando' && ronda && ronda.faseRonda === 'resultados' && ronda.resultado && (
        <section className="game">
          <MapaMundi
            key={`res-online-${sala.rondaNum}`}
            marcadores={marcadoresResultado}
            lineas={lineasResultado}
            ajustar
            enfoque={enfoque}
          />

          <div className="panel ub-ranking">
            <h3 className="panel-title"><Icon name="trophy" size={22} /> Resultados de la ronda</h3>
            <p className="ub-lugar-revelado">
              <Icon name="pin" size={22} />
              <span><strong>{ronda.resultado.lugar.nombre}</strong> · {ronda.resultado.lugar.pais}</span>
            </p>

            <div className="scoreboard">
              {ronda.resultado.filas.map((f, i) => (
                <button
                  key={f.jugadorId}
                  className="ub-rank-fila"
                  onClick={() => f.real && setEnfoque(f.real)}
                  title="Ver su marcador en el mapa"
                >
                  <span className="score-name">
                    <span className="pos">{i + 1}</span>
                    <span className="ub-punto" style={{ background: f.color }} />
                    {f.nombre}
                  </span>
                  <span className="ub-rank-datos">
                    <span className="ub-rank-km">{f.real ? formatearKm(f.km) : 'No colocado'}</span>
                    <span className={`ub-rank-pts${f.puntos > 0 ? ' suma' : ''}`}>+{f.puntos}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="actions" style={{ marginTop: '1.2rem' }}>
            {esAdmin ? (
              <>
                {sala.rondaNum < sala.totalRondas ? (
                  <button className="big full" onClick={handleSiguienteRonda}>
                    <Icon name="play" size={20} /> Siguiente ronda ({sala.rondaNum + 1} de {sala.totalRondas})
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
                ? 'Nadie ha sumado puntos'
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
                      <span className="ub-punto" style={{ background: j.color }} />
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