// client/src/games/Jugadas/JugadasLocal.jsx
import React, { useState, useRef, useCallback } from 'react';
import Icon from '../../components/Icon.jsx';
import GameIntro from '../../components/GameIntro.jsx';
import JugadasPartida from './JugadasPartida.jsx';
import { AyudaJugadas } from './JugadasComun.jsx';
import './Jugadas.css';
import '../Adivina/Adivina.css';

const MIN_JUGADORES = 2;
const MAX_JUGADORES = 12;

export default function JugadasLocal({ onVolver, onExit }) {
  const [fase, setFase] = useState('setup'); // 'setup' | 'jugando'

  const [numJugadores, setNumJugadores] = useState(4);
  const [jugadores, setJugadores] = useState([
    { id: 1, nombre: 'Jugador 1' },
    { id: 2, nombre: 'Jugador 2' },
    { id: 3, nombre: 'Jugador 3' },
    { id: 4, nombre: 'Jugador 4' }
  ]);

  const [vista, setVista] = useState(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const partidaRef = useRef(null);
  const enVueloRef = useRef(false);

  const handleNumChange = (e) => {
    const num = Number(e.target.value);
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
      const res = await fetch('/api/jugadas/local/nueva', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombres })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'No se ha podido crear la partida.');
      partidaRef.current = data.partida;
      setVista(data.vista);
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
      const res = await fetch('/api/jugadas/local/accion', {
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

  return (
    <div className="furbo-contenedor">
      {fase === 'setup' && <AyudaJugadas online={false} />}

      {fase === 'setup' && (
        <section className="game">
          <GameIntro gameId="jugadas" titulo="Jugadas Icónicas" />

          <div className="panel">
            <div className="hud" style={{ marginBottom: '1rem' }}>
              <button className="btn-back-inline" onClick={onVolver}>
                &larr; Cambiar a modo Online
              </button>
            </div>

            <h3 className="panel-title">
              <Icon name="users" size={22} /> Participantes ({MIN_JUGADORES} a {MAX_JUGADORES})
            </h3>
            <label className="field-label" htmlFor="num-jugadores-jugadas">Número de jugadores</label>
            <select id="num-jugadores-jugadas" value={numJugadores} onChange={handleNumChange}>
              {Array.from({ length: MAX_JUGADORES - MIN_JUGADORES + 1 }, (_, i) => (
                <option key={i + MIN_JUGADORES} value={i + MIN_JUGADORES}>
                  {i + MIN_JUGADORES} jugadores ({(i + MIN_JUGADORES) * 3} rondas)
                </option>
              ))}
            </select>

            <span className="field-label">Nombres (orden secuencial de turno)</span>
            <div className="names-grid">
              {jugadores.map((j, idx) => (
                <input
                  key={j.id}
                  type="text"
                  value={j.nombre}
                  onChange={(e) => handleNombreChange(idx, e.target.value)}
                  placeholder={`Jugador ${j.id}`}
                  maxLength={25}
                  required
                />
              ))}
            </div>
          </div>

          {error && <p className="error" style={{ margin: '0.8rem 0' }}>{error}</p>}

          <button className="big full" style={{ marginTop: '1rem' }} onClick={iniciarPartida} disabled={cargando}>
            <Icon name="play" size={24} /> ¡Comenzar partido!
          </button>
        </section>
      )}

      {fase === 'jugando' && vista && (
        <JugadasPartida
          vista={vista}
          local
          esHost
          onAccion={enviarAccion}
          onTiempo={avisarTiempo}
          finalAcciones={(
            <div className="actions">
              <button onClick={nuevaPartida}>
                <Icon name="refresh" size={20} /> Nueva partida
              </button>
              <button className="secondary danger" onClick={onExit || onVolver}>
                <Icon name="door" size={20} /> Salir al menú
              </button>
            </div>
          )}
        />
      )}
    </div>
  );
}