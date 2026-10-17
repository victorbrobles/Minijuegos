// client/src/games/QuienEsQuien/QuienEsQuienOnline.jsx
import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../components/Icon.jsx';
import CategoryCard from '../../components/CategoryCard.jsx';
import './QuienEsQuien.css';

const CLAVE_SESION_QQ = 'qq_online_session';

export default function QuienEsQuienOnline({ onLocal, onSalir }) {
  const [vista, setVista] = useState('menu');
  const [nombre, setNombre] = useState('');
  const [codigoInput, setCodigoInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);

  const [sesion, setSesion] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(CLAVE_SESION_QQ));
    } catch {
      return null;
    }
  });

  const [sala, setSala] = useState(null);
  const [codigoCopiado, setCodigoCopiado] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [cubiertaLevantada, setCubiertaLevantada] = useState(false);

  // Cargar categorías disponibles
  useEffect(() => {
    fetch('/api/quienesquien/categorias')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setCategorias(d.categorias);
      })
      .catch((err) => console.error(err));
  }, []);

  // Polling de sincronización
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!sesion) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setSala(null);
      return;
    }

    const consultarEstado = () => {
      fetch(`/api/quienesquien/sala/${sesion.code}?token=${sesion.token}`)
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
        .catch((err) => {
          console.warn('Error en conexión con la sala:', err);
        });
    };

    consultarEstado();
    intervalRef.current = setInterval(consultarEstado, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sesion]);

  const handleCrear = async () => {
    if (!nombre.trim()) return;
    setErrorMsg('');
    setCargando(true);
    try {
      const res = await fetch('/api/quienesquien/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear la sala.');

      const nuevaSesion = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_QQ, JSON.stringify(nuevaSesion));
      setSesion(nuevaSesion);
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
      const res = await fetch('/api/quienesquien/unirse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codigoInput.trim().toUpperCase(), nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al unirse.');

      const nuevaSesion = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_QQ, JSON.stringify(nuevaSesion));
      setSesion(nuevaSesion);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setCargando(false);
    }
  };

  // PULSAR CUALQUIER CATEGORÍA INICIA LA PARTIDA DIRECTAMENTE
  const handleSeleccionarYIniciar = async (categoriaId) => {
    if (!categoriaId || !sesion) return;
    setErrorMsg('');
    setCargando(true);
    try {
      const res = await fetch(`/api/quienesquien/sala/${sesion.code}/iniciar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token, categoriaId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo iniciar.');

      // Cambio instantáneo de pantalla sin esperar al siguiente tick de polling
      setSala(data);
      setCubiertaLevantada(false);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleReiniciarPartida = async () => {
    if (!sesion) return;
    try {
      await fetch(`/api/quienesquien/sala/${sesion.code}/reiniciar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token })
      });
      setCubiertaLevantada(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSalir = async () => {
    if (sesion) {
      try {
        await fetch(`/api/quienesquien/sala/${sesion.code}/salir`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: sesion.token })
        });
      } catch {
        /* ignorar */
      }
    }
    sessionStorage.removeItem(CLAVE_SESION_QQ);
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

  const rivales = (sala?.jugadores || []).filter((j) => !j.esTu && j.tarjeta);

  return (
    <div className="aprox-contenedor">
      {/* 1. MENÚ PRINCIPAL */}
      {vista === 'menu' && (
        <section className="game">
          <div className="panel center">
            <span className="lb-luna chica">
              <Icon name="whois" size={42} strokeWidth={1.6} />
            </span>
            <h1 className="title">¿Quién es quién?</h1>
            <p className="hint">
              Cada jugador, desde su propio móvil. El anfitrión crea la partida y comparte el código.
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
              <label className="field-label" htmlFor="qq-host-nombre">Tu nombre</label>
              <input
                id="qq-host-nombre"
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
            <p className="hint">Introduce el código que te ha dado el anfitrión y tu nombre.</p>

            <div className="lb-form" style={{ marginTop: '1.2rem', textAlign: 'left' }}>
              <label className="field-label" htmlFor="qq-code-input">Código de la partida</label>
              <input
                id="qq-code-input"
                className="lb-input-codigo"
                type="text"
                placeholder="ABCD"
                value={codigoInput}
                onChange={(e) => setCodigoInput(e.target.value.toUpperCase())}
                maxLength={4}
                style={{ textTransform: 'uppercase', letterSpacing: '4px', textAlign: 'center', fontWeight: '800' }}
                autoFocus
              />

              <label className="field-label" htmlFor="qq-guest-nombre" style={{ marginTop: '1rem' }}>Tu nombre</label>
              <input
                id="qq-guest-nombre"
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
                <div key={j.id} className={`lb-jug ${j.esTu ? 'yo' : ''}`}>
                  <span className="lb-punto on" />
                  <span className="lb-jug-nombre">
                    {j.nombre}{j.esTu ? ' (tú)' : ''}{j.id === 1 ? ' 👑' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {sala.esAdmin ? (
            <div className="panel" style={{ marginTop: '1rem' }}>
              <h3 className="panel-title"><Icon name="crown" size={20} /> Pulsa una categoría para empezar:</h3>
              <p className="field-label" style={{ marginBottom: '1rem' }}>
                Al tocar una temática se repartirán los personajes y comenzará la partida directamente.
              </p>

              {cargando && (
                <p className="hint ok center" style={{ fontWeight: 800 }}>
                  ⏳ Repartiendo tarjetas y comenzando partida...
                </p>
              )}

              {errorMsg && <p className="error" style={{ marginBottom: '0.8rem' }}>{errorMsg}</p>}

              <div className="conecta-categories-grid">
                {categorias.map((cat, idx) => (
                  <CategoryCard
                    key={cat.id}
                    nombre={cat.nombre}
                    icono={cat.icono}
                    indice={idx}
                    onClick={() => handleSeleccionarYIniciar(cat.id)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="panel center" style={{ padding: '2rem 1.5rem', marginTop: '1rem' }}>
              <span className="lb-luna chica"><Icon name="hourglass" size={40} /></span>
              <h3 style={{ margin: '0.5rem 0' }}>Esperando al anfitrión...</h3>
              <p className="hint">
                El anfitrión está seleccionando la categoría. En cuanto pulse una, la partida empezará automáticamente en tu pantalla.
              </p>
            </div>
          )}

          <div className="actions" style={{ marginTop: '1rem' }}>
            <button className="secondary danger full" onClick={handleSalir}>
              <Icon name="door" size={20} /> Salir de la sala
            </button>
          </div>
        </section>
      )}

      {/* 5. JUGANDO ONLINE */}
      {vista === 'sala' && sala && sala.estado === 'jugando' && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="target" size={18} />{sala.categoria?.nombre}</span>
            <span className="chip alt">Sala: {sala.code}</span>
          </div>

          {/* TARJETA CON CUBIERTA DESLIZABLE */}
          <div className="qq-cubierta-wrapper">
            <div
              className={`qq-cubierta-cortina ${cubiertaLevantada ? 'levantada' : ''}`}
              onMouseDown={() => setCubiertaLevantada(true)}
              onMouseUp={() => setCubiertaLevantada(false)}
              onMouseLeave={() => setCubiertaLevantada(false)}
              onTouchStart={() => setCubiertaLevantada(true)}
              onTouchEnd={() => setCubiertaLevantada(false)}
              onTouchCancel={() => setCubiertaLevantada(false)}
              onContextMenu={(e) => e.preventDefault()}
            >
              <div className="qq-cubierta-icono">
                <Icon name={cubiertaLevantada ? 'eye' : 'lock'} size={46} strokeWidth={1.8} />
              </div>
              <h3 className="qq-cubierta-titulo">
                {cubiertaLevantada ? '¡Soltar para tapar!' : 'MANTÉN PULSADO PARA MIRAR'}
              </h3>
              <p className="qq-cubierta-sub">
                {cubiertaLevantada
                  ? 'Viendo a tus compañeros...'
                  : 'Mantén presionado para levantar la cubierta y ver qué personaje tiene cada jugador.'}
              </p>
            </div>

            <div className="qq-tarjeta-grupal-interior">
              <div className="qq-grupal-header">
                <span className="aprox-badge-pregunta">Personajes de tus compañeros</span>
                <p className="hint small" style={{ margin: '0.4rem 0 0' }}>
                  Responde con Sí o No cuando te pregunten sobre su identidad:
                </p>
              </div>

              <div className="qq-filas-rivales-lista">
                {rivales.length > 0 ? (
                  rivales.map((j) => (
                    <div key={j.id} className="qq-fila-rival-item">
                      <span className="qq-rival-nombre-label">{j.nombre}</span>
                      <strong className="qq-rival-tarjeta-badge">{j.tarjeta}</strong>
                    </div>
                  ))
                ) : (
                  <p className="hint center" style={{ margin: '1rem 0' }}>
                    Esperando a que otros jugadores tengan asignado su personaje...
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* BOTÓN AUXILIAR PARA PRESIONAR */}
          <button
            type="button"
            className="big full qq-btn-pulsador-mirar"
            onMouseDown={() => setCubiertaLevantada(true)}
            onMouseUp={() => setCubiertaLevantada(false)}
            onMouseLeave={() => setCubiertaLevantada(false)}
            onTouchStart={() => setCubiertaLevantada(true)}
            onTouchEnd={() => setCubiertaLevantada(false)}
            onTouchCancel={() => setCubiertaLevantada(false)}
            onContextMenu={(e) => e.preventDefault()}
          >
            <Icon name="eye" size={22} />
            {cubiertaLevantada ? 'Soltar para tapar' : 'Mantén presionado aquí para mirar'}
          </button>

          <p className="hint center" style={{ marginTop: '0.8rem' }}>
            Tu personaje está oculto para ti. Averígualo haciendo preguntas al grupo.
          </p>

          {/* CONTROLES PARA EL ANFITRIÓN */}
          {sala.esAdmin && (
            <div className="panel" style={{ marginTop: '1.2rem' }}>
              <h3 className="panel-title"><Icon name="crown" size={20} /> Controles del Anfitrión</h3>
              <button
                type="button"
                className="big full"
                style={{ marginTop: '0.6rem' }}
                onClick={handleReiniciarPartida}
              >
                <Icon name="refresh" size={18} /> Jugar otra ronda (Nueva categoría)
              </button>
            </div>
          )}

          <div className="actions" style={{ marginTop: '1rem' }}>
            <button className="secondary danger full" onClick={handleSalir}>
              <Icon name="door" size={20} /> Salir de la partida
            </button>
          </div>
        </section>
      )}
    </div>
  );
}