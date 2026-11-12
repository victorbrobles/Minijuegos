// client/src/games/Furbo/FurboLocal.jsx
// Modo «un único dispositivo»: el servidor no guarda nada; el cliente conserva la partida y la reenvía.
import React, { useState, useRef, useCallback } from 'react';
import Icon from '../../components/Icon.jsx';
import { SelectorJugadores, BloqueConfig } from '../../components/MenuJuego.jsx';
import FurboPartida from './FurboPartida.jsx';
import { ModalSalir } from './FurboOnline.jsx';
import { ConfigPartida } from './FurboComun.jsx';
import { ORDEN_FASES } from './FurboInfo.js';
import './Furbo.css';
import { limitesLocal } from '../limites.js';

const { min: MIN, max: MAX } = limitesLocal('furbo');

export default function FurboLocal({ onVolver, onExit, onAbrirAyuda }) {
  const [fase, setFase] = useState('setup'); // 'setup' | 'jugando'
  const [modalSalir, setModalSalir] = useState(false);
  const [nombres, setNombres] = useState(() => Array.from({ length: MIN }, (_, i) => `Jugador ${i + 1}`));
  const [config, setConfig] = useState({ fases: [...ORDEN_FASES], duracion: 'normal' });
  const [vista, setVista] = useState(null);
  const [sostiene, setSostiene] = useState(null);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [cargando, setCargando] = useState(false);

  const partidaRef = useRef(null);
  const colaRef = useRef(Promise.resolve());
  const avisoTimer = useRef(null);

  const cambiarNum = (n) => {
    const num = Math.max(MIN, Math.min(MAX, n));
    setNombres((prev) => Array.from({ length: num }, (_, i) => prev[i] ?? `Jugador ${i + 1}`));
  };

  const nombresLimpios = nombres.map((n, i) => n.trim() || `Jugador ${i + 1}`);
  const repetidos = new Set(nombresLimpios.map((n) => n.toLowerCase())).size !== nombresLimpios.length;

  const iniciarPartida = async () => {
    setError('');
    setCargando(true);
    try {
      const res = await fetch('/api/furbo/local/nueva', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombres: nombresLimpios, config })
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

  // Las acciones se encadenan en una cola. Antes, una acción que llegaba mientras otra estaba en
  // vuelo (p. ej. el aviso de «tiempo» de la Prórroga) se descartaba y la ronda se quedaba colgada.
  const enviarAccion = useCallback((accion) => {
    colaRef.current = colaRef.current.then(async () => {
      if (!partidaRef.current) return;
      try {
        const res = await fetch('/api/furbo/local/accion', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ partida: partidaRef.current, accion })
        });
        const data = await res.json();
        if (data.partida && partidaRef.current) {
          partidaRef.current = data.partida;
          setVista(data.vista);
        }
        if (data.ok === false && data.error && accion.tipo !== 'tiempo') {
          setAviso(data.error);
          clearTimeout(avisoTimer.current);
          avisoTimer.current = setTimeout(() => setAviso(''), 3000);
        }
      } catch {
        setAviso('No se ha podido conectar con el servidor. Inténtalo de nuevo.');
        clearTimeout(avisoTimer.current);
        avisoTimer.current = setTimeout(() => setAviso(''), 3000);
      }
    });
    return colaRef.current;
  }, []);

  const avisarTiempo = useCallback(() => enviarAccion({ tipo: 'tiempo' }), [enviarAccion]);

  const nuevaPartida = () => {
    partidaRef.current = null;
    setVista(null);
    setFase('setup');
  };

  if (fase === 'setup') {
    return (
      <div className="furbo-contenedor">
        <SelectorJugadores
          onVolver={onVolver}
          onAyuda={onAbrirAyuda}
          min={MIN}
          max={MAX}
          numJugadores={nombres.length}
          onCambiarNum={cambiarNum}
          nombres={nombres}
          onNombre={(i, v) => setNombres((prev) => prev.map((n, k) => (k === i ? v : n)))}
          onEmpezar={iniciarPartida}
          textoBoton="¡Pitido inicial!"
          puedeEmpezar={!cargando && !repetidos}
          error={error || (repetidos ? 'Hay dos jugadores con el mismo nombre.' : '')}
          maxLength={20}
        >
          <BloqueConfig>
            <ConfigPartida config={config} onChange={setConfig} numJugadores={nombres.length} />
          </BloqueConfig>
        </SelectorJugadores>
      </div>
    );
  }

  return (
    <div className="furbo-contenedor qq-en-partida">
      {aviso && <p className="fbp-toast" role="alert" onClick={() => setAviso('')}>{aviso}</p>}
      {vista && (
        <FurboPartida
          vista={vista}
          local
          esHost
          sostiene={sostiene}
          setSostiene={setSostiene}
          onAccion={enviarAccion}
          onTiempo={avisarTiempo}
          onSalir={() => setModalSalir(true)}
          finalAcciones={(
            <div className="fbp-barra estatica">
              <button type="button" className="fbp-boton grande" onClick={nuevaPartida}>
                <Icon name="refresh" size={20} /> Nuevo partido
              </button>
              <button type="button" className="fbp-enlace" onClick={() => setModalSalir(true)}>Salir a la portada</button>
            </div>
          )}
        />
      )}
      {modalSalir && (
        <ModalSalir
          titulo="¿Salir del partido?"
          texto="Se perderá el partido en curso y volverás a la portada."
          onSeguir={() => setModalSalir(false)}
          onSalir={() => { setModalSalir(false); onExit?.(); }}
        />
      )}
    </div>
  );
}
