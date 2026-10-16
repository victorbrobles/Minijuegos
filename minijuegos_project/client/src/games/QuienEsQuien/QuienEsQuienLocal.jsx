// client/src/games/QuienEsQuien/QuienEsQuienLocal.jsx
import React, { useState, useEffect } from 'react';
import Icon from '../../components/Icon.jsx';
import CategoryCard from '../../components/CategoryCard.jsx';
import './QuienEsQuien.css';

const MIN_JUGADORES = 2;
const MAX_JUGADORES = 15;

export default function QuienEsQuienLocal({ onVolver, onExit }) {
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

  // Turno actual del jugador que sostiene el dispositivo
  const [turnoIdx, setTurnoIdx] = useState(0);

  // Estado de la cubierta: true mientras se mantiene pulsado el botón/cubierta
  const [cubiertaLevantada, setCubiertaLevantada] = useState(false);

  useEffect(() => {
    fetch('/api/quienesquien/categorias')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setCategorias(d.categorias);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleNumJugadores = (e) => {
    const num = parseInt(e.target.value, 10);
    setNumJugadores(num);
    setJugadores(Array.from({ length: num }, (_, i) => ({
      id: i + 1,
      nombre: jugadores[i]?.nombre || `Jugador ${i + 1}`,
      tarjeta: null
    })));
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

  return (
    <div className="aprox-contenedor">
      {/* 1. CONFIGURACIÓN */}
      {paso === 'config' && (
        <section className="game">
          <div className="hud">
            <button className="btn-back-inline" onClick={onVolver}>
              &larr; Cambiar modo
            </button>
            <span className="chip alt">Un solo dispositivo</span>
          </div>

          <div className="panel">
            <h3 className="panel-title"><Icon name="users" size={22} /> Jugadores</h3>
            <label className="field-label" htmlFor="qq-num-jugadores">Número de participantes</label>
            <select id="qq-num-jugadores" value={numJugadores} onChange={handleNumJugadores}>
              {Array.from({ length: MAX_JUGADORES - MIN_JUGADORES + 1 }, (_, i) => (
                <option key={i + MIN_JUGADORES} value={i + MIN_JUGADORES}>
                  {i + MIN_JUGADORES} jugadores
                </option>
              ))}
            </select>

            <span className="field-label">Nombres</span>
            <div className="names-grid">
              {jugadores.map((j, idx) => (
                <input
                  key={j.id}
                  type="text"
                  value={j.nombre}
                  onChange={(e) => handleNombre(idx, e.target.value)}
                  placeholder={`Jugador ${j.id}`}
                  maxLength={20}
                />
              ))}
            </div>
          </div>

          <button className="big full" onClick={irACategorias}>
            <Icon name="play" size={24} /> Elegir categoría
          </button>
        </section>
      )}

      {/* 2. CATEGORÍAS */}
      {paso === 'categorias' && (
        <section className="game">
          <div className="hud">
            <button className="btn-back-inline" onClick={() => setPaso('config')}>
              &larr; Volver
            </button>
            <span className="chip alt">Elige categoría</span>
          </div>

          <h3 className="section-title" style={{ textAlign: 'center', marginBottom: '1rem' }}>
            Elige una temática para los personajes
          </h3>

          <div className="conecta-categories-grid">
            {categorias.map((cat, idx) => (
              <CategoryCard
                key={cat.id}
                nombre={cat.nombre}
                icono={cat.icono}
                indice={idx}
                onClick={() => seleccionarCategoria(cat)}
              />
            ))}
          </div>
        </section>
      )}

      {/* 3. INTERTURNO */}
      {paso === 'interturno' && jugadorActual && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="whois" size={18} />Turno de {jugadorActual.nombre}</span>
            <span className="chip alt">{categoriaElegida?.nombre}</span>
          </div>

          <div className="panel aprox-pregunta-card" style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '0.8rem' }}>📱</div>
            <h2 className="aprox-pregunta-texto">Pasad el móvil a: {jugadorActual.nombre}</h2>
            <p className="field-label" style={{ maxWidth: '400px', margin: '0.6rem auto 1.5rem' }}>
              En tu turno podrás ver los personajes de todos tus compañeros manteniendo pulsada la cubierta. Tu propio personaje permanecerá 100% oculto.
            </p>

            <button
              type="button"
              className="big full"
              onClick={empezarTurnoJugador}
            >
              <Icon name="eye" size={22} /> Soy {jugadorActual.nombre}, tomar el dispositivo
            </button>
          </div>
        </section>
      )}

      {/* 4. TURNO ACTIVO: TARJETA ÚNICA CON TODOS LOS RIVALES Y CUBIERTA */}
      {paso === 'turno' && jugadorActual && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="users" size={18} />Turno de {jugadorActual.nombre}</span>
            <span className="chip alt">{categoriaElegida?.nombre}</span>
          </div>

          {/* TARJETA GLOBAL CON CUBIERTA DESLIZABLE */}
          <div className="qq-cubierta-wrapper">
            {/* CUBIERTA QUE TAPA LOS PERSONAJES */}
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
                  ? 'Viendo a los demás jugadores...'
                  : 'Pulsa sin soltar para levantar la cubierta y ver a tus compañeros.'}
              </p>
            </div>

            {/* CONTENIDO INTERIOR: TODOS LOS RIVALES JUNTOS */}
            <div className="qq-tarjeta-grupal-interior">
              <div className="qq-grupal-header">
                <span className="aprox-badge-pregunta">Personajes de tus rivales</span>
                <p className="hint small" style={{ margin: '0.4rem 0 0' }}>
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

          {/* BOTÓN INFORMATIVO ADICIONAL */}
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

          {/* ACCIONES */}
          <div className="actions" style={{ marginTop: '1.2rem' }}>
            <button className="big full" onClick={pasarSiguienteTurno}>
              <Icon name="check" size={20} /> Pasar turno al siguiente jugador
            </button>
            <button className="secondary danger full" onClick={() => setPaso('categorias')}>
              <Icon name="refresh" size={18} /> Nueva ronda (cambiar categoría)
            </button>
          </div>
        </section>
      )}
    </div>
  );
}