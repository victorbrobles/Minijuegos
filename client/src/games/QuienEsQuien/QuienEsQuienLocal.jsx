// client/src/games/QuienEsQuien/QuienEsQuienLocal.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin, adminHeaders } from '../../lib/admin.js';
import Icon from '../../components/Icon.jsx';
import CategoryCard from '../../components/CategoryCard.jsx';
import './QuienEsQuien.css';

const MIN_JUGADORES = 2;
const MAX_JUGADORES = 15;

export default function QuienEsQuienLocal({ onVolver, onExit, onAbrirAyuda }) {
  const esAdminGlobal = useAdmin();
  const navigate = useNavigate();

  // 'config' | 'categorias' | 'interturno' | 'turno'
  const [paso, setPaso] = useState('config');
  const [numJugadores, setNumJugadores] = useState(4);
  const [jugadores, setJugadores] = useState([
    { id: 1, nombre: 'Jugador 1', tarjeta: null },
    { id: 2, nombre: 'Jugador 2', tarjeta: null },
    { id: 3, nombre: 'Jugador 3', tarjeta: null },
    { id: 4, nombre: 'Jugador 4', tarjeta: null }
  ]);

  const [categorias, setCategorias] = useState([]);
  const [categoriaElegida, setCategoriaElegida] = useState(null);
  const [turnoIdx, setTurnoIdx] = useState(0);
  const [cubiertaLevantada, setCubiertaLevantada] = useState(false);

  // Modales de confirmación
  const [modalSalirPortada, setModalSalirPortada] = useState(false);
  const [modalOtraRonda, setModalOtraRonda] = useState(false);

  // Estados categoría personalizada
  const [mostrarModalCustom, setMostrarModalCustom] = useState(false);
  const [customNombre, setCustomNombre] = useState('');
  const [customDatos, setCustomDatos] = useState('');
  const [errorCustom, setErrorCustom] = useState('');

  useEffect(() => {
    fetch('/api/quienesquien/categorias')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setCategorias(d.categorias);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleSalirAPortada = () => {
    setModalSalirPortada(false);
    if (typeof onExit === 'function') {
      onExit();
    } else {
      try {
        navigate('/');
      } catch {
        window.location.href = '/';
      }
    }
  };

  const actualizarCantidadJugadores = (nuevoNum) => {
    const num = Math.max(MIN_JUGADORES, Math.min(MAX_JUGADORES, nuevoNum));
    setNumJugadores(num);
    setJugadores(
      Array.from({ length: num }, (_, i) => ({
        id: i + 1,
        nombre: jugadores[i]?.nombre || `Jugador ${i + 1}`,
        tarjeta: null
      }))
    );
  };

  const handleNumJugadores = (e) => {
    actualizarCantidadJugadores(parseInt(e.target.value, 10));
  };

  const handleNombre = (idx, val) => {
    const copia = [...jugadores];
    copia[idx] = { ...copia[idx], nombre: val };
    setJugadores(copia);
  };

  const irACategorias = () => {
    const lista = jugadores.map((j) => ({
      ...j,
      nombre: j.nombre.trim() || `Jugador ${j.id}`
    }));
    setJugadores(lista);
    setPaso('categorias');
  };

  const seleccionarCategoria = async (cat) => {
    if (cat.id === 'custom') {
      setCustomNombre('');
      setCustomDatos('');
      setErrorCustom('');
      setMostrarModalCustom(true);
      return;
    }

    setCategoriaElegida(cat);
    try {
      const res = await fetch(`/api/quienesquien/personajes?categoria=${cat.id}`);
      const data = await res.json();
      const mazo = data.personajes || [];

      const asignados = jugadores.map((j, i) => ({
        ...j,
        tarjeta: mazo[i % mazo.length]
      }));

      setJugadores(asignados);
      setTurnoIdx(0);
      setCubiertaLevantada(false);
      setPaso('interturno');
    } catch (err) {
      console.error(err);
    }
  };

  // La lista se valida y se baraja en el servidor (el texto nunca se evalúa como código)
  const iniciarPartidaCustom = async () => {
    setErrorCustom('');
    if (!customNombre.trim()) {
      setErrorCustom('Debes introducir un nombre para la categoría.');
      return;
    }
    if (!customDatos.trim()) {
      setErrorCustom("Introduce los datos con el formato: ['Dato 1', 'Dato 2']");
      return;
    }

    let datos;
    try {
      const res = await fetch('/api/quienesquien/personalizada', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...adminHeaders() },
        body: JSON.stringify({ nombre: customNombre.trim(), datos: customDatos })
      });
      datos = await res.json();
      if (!res.ok) throw new Error(datos.error || 'No se pudo crear la categoría.');
    } catch (err) {
      setErrorCustom(err.message);
      return;
    }

    const mazo = datos.personajes;
    if (mazo.length < jugadores.length) {
      setErrorCustom(`Hay ${jugadores.length} jugadores y solo ${mazo.length} elementos distintos: añade más elementos.`);
      return;
    }

    setCategoriaElegida({ id: 'custom', nombre: datos.categoria, icono: 'edit' });

    // El mazo ya viene barajado: cada jugador recibe un elemento distinto y aleatorio
    const asignados = jugadores.map((j, i) => ({
      ...j,
      tarjeta: mazo[i]
    }));

    setJugadores(asignados);
    setTurnoIdx(0);
    setCubiertaLevantada(false);
    setMostrarModalCustom(false);
    setPaso('interturno');
  };

  const empezarTurnoJugador = () => {
    setCubiertaLevantada(false);
    setPaso('turno');
  };

  const pasarSiguienteTurno = () => {
    const sigIdx = (turnoIdx + 1) % jugadores.length;
    setTurnoIdx(sigIdx);
    setCubiertaLevantada(false);
    setPaso('interturno');
  };

  const jugadorActual = jugadores[turnoIdx];
  const rivales = jugadores.filter((_, idx) => idx !== turnoIdx);

  const categoriasAMostrar = esAdminGlobal
    ? [...categorias, { id: 'custom', nombre: 'Personalizada 🛠️', icono: 'edit' }]
    : categorias;

  const enPartidaActiva = paso === 'interturno' || paso === 'turno';

  return (
    <div className={`qq-contenedor ${enPartidaActiva ? 'qq-en-partida' : ''}`}>
      {/* 1. CONFIGURACIÓN */}
      {paso === 'config' && (
        <section className="game">
          <div className="panel qq-menu-panel">
            <div className="qq-card-top">
              <button
                type="button"
                className="qq-link-volver"
                onClick={onVolver}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                <span>Volver</span>
              </button>
              <button
                type="button"
                className="qq-btn-ayuda"
                onClick={onAbrirAyuda}
                title="Cómo jugar"
                aria-label="Cómo jugar"
              >
                ?
              </button>
            </div>

            <div className="qq-config-header">
              <div className="qq-hero-icono chico">
                <Icon name="users" size={32} />
              </div>
              <div>
                <h2 className="qq-config-titulo">Jugadores</h2>
                <p className="qq-config-sub">Configura quiénes van a participar en la partida</p>
              </div>
            </div>

            <div className="qq-selector-cantidad-box">
              <label className="qq-label-destacado" htmlFor="qq-num-jugadores">
                Número de participantes
              </label>
              <div className="qq-stepper-row">
                <button
                  type="button"
                  className="qq-stepper-btn"
                  disabled={numJugadores <= MIN_JUGADORES}
                  onClick={() => actualizarCantidadJugadores(numJugadores - 1)}
                >
                  &minus;
                </button>
                <select
                  id="qq-num-jugadores"
                  className="qq-select-jugadores"
                  value={numJugadores}
                  onChange={handleNumJugadores}
                >
                  {Array.from({ length: MAX_JUGADORES - MIN_JUGADORES + 1 }, (_, i) => (
                    <option key={i + MIN_JUGADORES} value={i + MIN_JUGADORES}>
                      {i + MIN_JUGADORES} jugadores
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="qq-stepper-btn"
                  disabled={numJugadores >= MAX_JUGADORES}
                  onClick={() => actualizarCantidadJugadores(numJugadores + 1)}
                >
                  +
                </button>
              </div>
            </div>

            <span className="qq-label-destacado" style={{ marginTop: '1.2rem', display: 'block' }}>
              Nombres de los jugadores
            </span>
            <div className="qq-nombres-grid">
              {jugadores.map((j, idx) => (
                <div key={j.id} className="qq-jugador-input-card">
                  <span className="qq-jugador-badge">{idx + 1}</span>
                  <input
                    type="text"
                    value={j.nombre}
                    onChange={(e) => handleNombre(idx, e.target.value)}
                    placeholder={`Jugador ${j.id}`}
                    maxLength={20}
                  />
                </div>
              ))}
            </div>

            <button
              type="button"
              className="big full qq-btn-principal"
              style={{ marginTop: '1.5rem' }}
              onClick={irACategorias}
            >
              <Icon name="play" size={22} /> Iniciar juego
            </button>
          </div>
        </section>
      )}

      {/* 2. CATEGORÍAS */}
      {paso === 'categorias' && (
        <section className="game">
          <div className="panel qq-menu-panel">
            <div className="qq-card-top">
              <button
                type="button"
                className="qq-link-volver"
                onClick={() => setPaso('config')}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                <span>Volver</span>
              </button>
              <button
                type="button"
                className="qq-btn-ayuda"
                onClick={onAbrirAyuda}
                title="Cómo jugar"
                aria-label="Cómo jugar"
              >
                ?
              </button>
            </div>

            <div className="qq-section-header">
              <h3 className="qq-section-title">Elige una temática para los personajes</h3>
              <p className="hint">Pulsa sobre una categoría para repartir los personajes y comenzar.</p>
            </div>

            <div className="conecta-categories-grid">
              {categoriasAMostrar.map((cat, idx) => (
                <CategoryCard
                  key={cat.id}
                  nombre={cat.nombre}
                  icono={cat.icono}
                  indice={idx}
                  onClick={() => seleccionarCategoria(cat)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. INTERTURNO */}
      {paso === 'interturno' && jugadorActual && (
        <section className="game">
          <div className="panel qq-menu-panel qq-tablero-panel" style={{ textAlign: 'center' }}>
            <div className="qq-card-top" style={{ justifyContent: 'flex-start', marginBottom: '0.4rem', width: '100%' }}>
              <button
                type="button"
                className="qq-link-volver"
                onClick={() => setModalSalirPortada(true)}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                <span>Volver a la portada</span>
              </button>
            </div>

            <div className="qq-tablero-header">
              <span className="qq-tablero-badge">
                <Icon name="users" size={16} /> Turno de {jugadorActual.nombre}
              </span>
              <div style={{ fontSize: '3.2rem', margin: '0.4rem 0' }}>📱</div>
              <h2 className="qq-tablero-titulo">Pasad el móvil a: {jugadorActual.nombre}</h2>
              <p className="qq-tablero-sub">
                En tu turno podrás ver los personajes de todos tus compañeros manteniendo pulsada la cubierta. Tu propio personaje permanecerá 100% oculto.
              </p>
            </div>

            <button
              type="button"
              className="big full qq-btn-principal"
              onClick={empezarTurnoJugador}
            >
              <Icon name="eye" size={22} /> Soy {jugadorActual.nombre}, tomar el dispositivo
            </button>
          </div>
        </section>
      )}

      {/* 4. TURNO ACTIVO */}
      {paso === 'turno' && jugadorActual && (
        <section className="game">
          <div className="panel qq-menu-panel qq-tablero-panel">
            <div className="qq-card-top" style={{ justifyContent: 'flex-start', marginBottom: '0.4rem', width: '100%' }}>
              <button
                type="button"
                className="qq-link-volver"
                onClick={() => setModalSalirPortada(true)}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                <span>Volver a la portada</span>
              </button>
            </div>

            <div className="qq-tablero-header">
              <span className="qq-tablero-badge">
                <Icon name="users" size={16} /> Turno de {jugadorActual.nombre}
              </span>
              <h2 className="qq-tablero-titulo">Tarjetas del grupo</h2>
              <p className="qq-tablero-sub">
                Tu elemento está oculto para ti. Haz preguntas de «Sí» o «No» al grupo para adivinar quién eres.
              </p>
            </div>

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
                  <Icon name={cubiertaLevantada ? 'eye' : 'lock'} size={44} strokeWidth={1.8} />
                </div>
                <h3 className="qq-cubierta-titulo">
                  {cubiertaLevantada ? '¡Soltar para tapar!' : 'MANTÉN PULSADO PARA MIRAR'}
                </h3>
                <p className="qq-cubierta-sub">
                  {cubiertaLevantada
                    ? 'Viendo a los demás jugadores...'
                    : 'Pulsa sin soltar para levantar la cubierta y ver a tus compañeros.'}
                </p>
              </div>

              <div className="qq-tarjeta-grupal-interior">
                <div className="qq-grupal-header">
                  <span className="aprox-badge-pregunta">Personajes de tus rivales</span>
                  <p className="hint small" style={{ margin: '0.35rem 0 0' }}>
                    Responde con Sí o No cuando te pregunten sobre sus identidades:
                  </p>
                </div>

                <div className="qq-filas-rivales-lista">
                  {rivales.map((j) => (
                    <div key={j.id} className="qq-fila-rival-item">
                      <span className="qq-rival-nombre-label">{j.nombre}</span>
                      <strong className="qq-rival-tarjeta-badge">{j.tarjeta}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>

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
              {cubiertaLevantada ? 'Soltar para ocultar' : 'Mantén presionado aquí para ver los nombres'}
            </button>

            <button
              type="button"
              className="secondary full"
              style={{ marginTop: '0.85rem' }}
              onClick={pasarSiguienteTurno}
            >
              <Icon name="check" size={20} /> Pasar turno al siguiente jugador
            </button>

            <div className="qq-tablero-footer">
              <button
                type="button"
                className="qq-link-otra-ronda"
                onClick={() => setModalOtraRonda(true)}
              >
                <Icon name="refresh" size={16} /> Jugar otra ronda (cambiar categoría)
              </button>
            </div>
          </div>
        </section>
      )}

      {/* MODAL: SALIR A LA PORTADA */}
      {modalSalirPortada && (
        <div className="rg-modal-fondo" onClick={() => setModalSalirPortada(false)}>
          <div
            className="rg-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '420px', textAlign: 'center', padding: '1.8rem 1.4rem' }}
          >
            <div style={{ fontSize: '2.4rem', marginBottom: '0.4rem' }}>🚪</div>
            <h3 style={{ margin: '0 0 0.6rem', color: '#1e1b4b', fontSize: '1.3rem' }}>
              ¿Salir a la portada?
            </h3>
            <p className="hint" style={{ fontSize: '0.95rem', marginBottom: '1.4rem', lineHeight: '1.4' }}>
              Se cancelará la partida actual y volverás a la portada principal de juegos. ¿Estás seguro?
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <button
                type="button"
                className="secondary full"
                onClick={() => setModalSalirPortada(false)}
              >
                No, continuar
              </button>
              <button
                type="button"
                className="secondary danger full"
                style={{ background: '#ef4444', color: '#ffffff', borderColor: '#dc2626' }}
                onClick={handleSalirAPortada}
              >
                Sí, salir a portada
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: JUGAR OTRA RONDA */}
      {modalOtraRonda && (
        <div className="rg-modal-fondo" onClick={() => setModalOtraRonda(false)}>
          <div
            className="rg-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '420px', textAlign: 'center', padding: '1.8rem 1.4rem' }}
          >
            <div style={{ fontSize: '2.4rem', marginBottom: '0.4rem' }}>🔄</div>
            <h3 style={{ margin: '0 0 0.6rem', color: '#1e1b4b', fontSize: '1.3rem' }}>
              ¿Jugar otra ronda?
            </h3>
            <p className="hint" style={{ fontSize: '0.95rem', marginBottom: '1.4rem', lineHeight: '1.4' }}>
              Se terminará la ronda actual y pasarás a elegir una nueva categoría. ¿Estás seguro?
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <button
                type="button"
                className="secondary full"
                onClick={() => setModalOtraRonda(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="big full"
                style={{ marginTop: 0 }}
                onClick={() => {
                  setModalOtraRonda(false);
                  setPaso('categorias');
                }}
              >
                Sí, cambiar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CATEGORÍA PERSONALIZADA */}
      {mostrarModalCustom && (
        <div className="rg-modal-fondo" onClick={() => setMostrarModalCustom(false)}>
          <div
            className="rg-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '420px', textAlign: 'center', padding: '1.8rem 1.4rem' }}
          >
            <h3 style={{ margin: '0 0 1rem', color: '#1e1b4b', fontSize: '1.4rem' }}>
              Categoría Personalizada 🛠️
            </h3>

            <div style={{ textAlign: 'left', marginBottom: '1.2rem' }}>
              <label className="field-label">Nombre de la categoría</label>
              <input
                type="text"
                value={customNombre}
                onChange={(e) => setCustomNombre(e.target.value)}
                placeholder="Ej: Personajes de la oficina"
                style={{ width: '100%', marginBottom: '1rem', padding: '0.8rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
              />

              <label className="field-label">Datos (Formato Array)</label>
              <textarea
                style={{ width: '100%', height: '100px', resize: 'none', padding: '0.8rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
                value={customDatos}
                onChange={(e) => setCustomDatos(e.target.value)}
                placeholder="['Dato 1', 'Dato 2', 'Dato 3', ...]"
              />
            </div>

            {errorCustom && <p className="error" style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>{errorCustom}</p>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <button
                type="button"
                className="secondary full"
                onClick={() => setMostrarModalCustom(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="big full"
                onClick={iniciarPartidaCustom}
              >
                Jugar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}