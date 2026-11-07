// client/src/games/Furbo/FurboLocal.jsx
import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import FurboPartida from './FurboPartida.jsx';
import { ConfigPartida } from './FurboComun.jsx';
import { ORDEN_FASES } from './FurboInfo.js';
import './Furbo.css';
import '../Adivina/Adivina.css';

const MIN_JUGADORES = 2;
const MAX_JUGADORES = 20;

const COLORES = ['#ef4444', '#2563eb', '#16a34a', '#f59e0b', '#9333ea', '#ec4899', '#0d9488', '#ea580c', '#475569', '#65a30d'];

function BotonVolver({ onClick, texto = 'Volver' }) {
  return (
    <button type="button" className="qq-link-volver" onClick={onClick}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      <span>{texto}</span>
    </button>
  );
}

export default function FurboLocal({ onVolver, onExit, onAbrirAyuda }) {
  const navigate = useNavigate();
  const [fase, setFase] = useState('setup'); // 'setup' | 'jugando'
  const [modalSalirPortada, setModalSalirPortada] = useState(false);

  const [numJugadores, setNumJugadores] = useState(4);
  const [jugadores, setJugadores] = useState([
    { id: 1, nombre: 'Jugador 1' },
    { id: 2, nombre: 'Jugador 2' },
    { id: 3, nombre: 'Jugador 3' },
    { id: 4, nombre: 'Jugador 4' }
  ]);
  const [config, setConfig] = useState({ fases: [...ORDEN_FASES], duracion: 'normal' });

  const [vista, setVista] = useState(null);
  const [sostiene, setSostiene] = useState(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const partidaRef = useRef(null);
  const enVueloRef = useRef(false);

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
        nombre: jugadores[i]?.nombre || `Jugador ${i + 1}`
      }))
    );
  };

  const handleNombreChange = (idx, val) => {
    const nuevos = [...jugadores];
    nuevos[idx] = { ...nuevos[idx], nombre: val };
    setJugadores(nuevos);
  };

  const iniciarPartida = async () => {
    setError('');
    setCargando(true);
    try {
      const nombres = jugadores.map((j) => j.nombre.trim() || `Jugador ${j.id}`);
      const res = await fetch('/api/furbo/local/nueva', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombres, config })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'No se ha podido crear la partida.');
      partidaRef.current = data.partida;
      setVista(data.vista);
      setSostiene(null);
      setFase('jugando');
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const enviarAccion = useCallback(async (accion) => {
    if (!partidaRef.current || enVueloRef.current) return;
    enVueloRef.current = true;
    try {
      const res = await fetch('/api/furbo/local/accion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partida: partidaRef.current, accion })
      });
      const data = await res.json();
      if (data.partida) {
        partidaRef.current = data.partida;
        setVista(data.vista);
      }
    } catch (err) {
      console.error(err);
    } finally {
      enVueloRef.current = false;
    }
  }, []);

  const avisarTiempo = useCallback(() => enviarAccion({ tipo: 'tiempo' }), [enviarAccion]);

  const nuevaPartida = () => {
    partidaRef.current = null;
    setVista(null);
    setFase('setup');
  };

  const enPartidaActiva = fase === 'jugando';

  return (
    <div className={`furbo-contenedor ${enPartidaActiva ? 'qq-en-partida' : ''}`}>
      {/* 1. SETUP */}
      {fase === 'setup' && (
        <section className="game">
          <div className="panel qq-menu-panel">
            <div className="qq-card-top">
              <BotonVolver onClick={onVolver} />
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
                <span style={{ fontSize: '2rem' }}>⚽</span>
              </div>
              <div>
                <h2 className="qq-config-titulo">Jugadores</h2>
                <p className="qq-config-sub">
                  Configura quiénes van a participar ({MIN_JUGADORES} a {MAX_JUGADORES} jugadores)
                </p>
              </div>
            </div>

            <div className="qq-selector-cantidad-box">
              <label className="qq-label-destacado" htmlFor="num-jugadores-furbo">
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
                  id="num-jugadores-furbo"
                  className="qq-select-jugadores"
                  value={numJugadores}
                  onChange={(e) => actualizarCantidadJugadores(parseInt(e.target.value, 10))}
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
                  <span
                    className="qq-jugador-badge"
                    style={{ background: COLORES[idx % COLORES.length] }}
                  >
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={j.nombre}
                    onChange={(e) => handleNombreChange(idx, e.target.value)}
                    placeholder={`Jugador ${j.id}`}
                    maxLength={25}
                    required
                  />
                </div>
              ))}
            </div>

            <div className="panel" style={{ marginTop: '1.2rem', boxShadow: 'none', border: '1.5px solid #e2e8f0', background: '#f8fafc' }}>
              <h3 className="panel-title" style={{ color: '#1e1b4b' }}>⚽ Configuración del partido</h3>
              <ConfigPartida config={config} onChange={setConfig} />
            </div>

            {error && <p className="error" style={{ margin: '0.8rem 0' }}>{error}</p>}

            <button
              type="button"
              className="big full qq-btn-principal"
              style={{ marginTop: '1.5rem' }}
              onClick={iniciarPartida}
              disabled={cargando}
            >
              <Icon name="play" size={24} /> ¡Pitido inicial!
            </button>
          </div>
        </section>
      )}

      {/* 2. PARTIDA */}
      {fase === 'jugando' && vista && (
        <section className="game">
          <div className="panel qq-menu-panel" style={{ padding: '0.8rem 1.1rem', marginBottom: '1rem' }}>
            <div className="qq-card-top" style={{ marginBottom: 0 }}>
              <BotonVolver texto="Volver a la portada" onClick={() => setModalSalirPortada(true)} />
            </div>
          </div>

          <FurboPartida
            vista={vista}
            local
            esHost
            sostiene={sostiene}
            setSostiene={setSostiene}
            onAccion={enviarAccion}
            onTiempo={avisarTiempo}
            finalAcciones={(
              <div className="actions" style={{ marginTop: '1.5rem' }}>
                <button type="button" className="big full qq-btn-principal" onClick={nuevaPartida}>
                  <Icon name="refresh" size={20} /> Nueva partida
                </button>
                <div className="qq-tablero-footer" style={{ marginTop: 0, paddingTop: '0.6rem', borderTop: 'none' }}>
                  <button type="button" className="qq-link-otra-ronda" onClick={() => setModalSalirPortada(true)}>
                    Salir a la portada
                  </button>
                </div>
              </div>
            )}
          />
        </section>
      )}

      {/* MODAL DE CONFIRMACIÓN PARA SALIR A PORTADA */}
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
              Se cancelará la partida actual y volverás a la portada principal. ¿Estás seguro?
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
    </div>
  );
}