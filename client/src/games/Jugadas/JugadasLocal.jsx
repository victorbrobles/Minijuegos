// client/src/games/Jugadas/JugadasLocal.jsx
import React, { useState, useRef, useCallback } from 'react';
import Icon from '../../components/Icon.jsx';
import JugadasPartida from './JugadasPartida.jsx';
import { AyudaJugadas } from './JugadasComun.jsx';
import './Jugadas.css';
import '../Adivina/Adivina.css';
import { SelectorJugadores } from '../../components/MenuJuego.jsx';

const MIN_JUGADORES = 2;
const MAX_JUGADORES = 12;

export default function JugadasLocal({ onVolver, onExit }) {
  const [fase, setFase] = useState('setup'); // 'setup' | 'jugando'
  const [modalAyuda, setModalAyuda] = useState(false);

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
      <AyudaJugadas abierto={modalAyuda} onCerrar={() => setModalAyuda(false)} />

      {fase === 'setup' && (
        <SelectorJugadores
          onVolver={onVolver}
          onAyuda={() => setModalAyuda(true)}
          min={MIN_JUGADORES}
          max={MAX_JUGADORES}
          numJugadores={numJugadores}
          onCambiarNum={(n) => handleNumChange({ target: { value: n } })}
          nombres={jugadores}
          onNombre={handleNombreChange}
          onEmpezar={iniciarPartida}
          textoBoton="¡Comenzar partido!"
          iconoBoton="play"
          puedeEmpezar={!(cargando)}
          error={error}
        />
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