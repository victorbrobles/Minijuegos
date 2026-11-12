// client/src/games/Jugadas/JugadasLocal.jsx
// Modo «un único dispositivo»: el motor corre en el servidor (que guarda las jugadas) y el móvil pasa de mano en
// mano según el turno.
import React, { useCallback, useRef, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import JugadasPartida from './JugadasPartida.jsx';
import { ModalSalir } from './JugadasComun.jsx';
import { MIN_JUGADORES, MAX_JUGADORES } from './constantes.js';
import { SelectorJugadores } from '../../components/MenuJuego.jsx';
import './Jugadas.css';
import { limitesLocal } from '../limites.js';

const LIM_JUG = limitesLocal('jugadas');

export default function JugadasLocal({ onVolver, onExit, onAbrirAyuda }) {
  const [paso, setPaso] = useState('config');
  const [nombres, setNombres] = useState(() => Array(LIM_JUG.min).fill(''));
  const [vista, setVista] = useState(null);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [cargando, setCargando] = useState(false);
  const [modal, setModal] = useState(false);
  const partidaRef = useRef(null);
  const enVueloRef = useRef(false);

  const empezar = async () => {
    const limpios = nombres.map((n) => n.trim());
    if (limpios.some((n) => !n)) return setError('Todos los jugadores necesitan un nombre.');
    if (new Set(limpios.map((n) => n.toLowerCase())).size !== limpios.length) return setError('Hay nombres repetidos.');
    setError(''); setCargando(true);
    try {
      const res = await fetch('/api/jugadas/local/nueva', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nombres: limpios }) });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'No se ha podido crear la partida.');
      partidaRef.current = data.partida;
      setVista(data.vista);
      setPaso('juego');
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
    return undefined;
  };

  const enviarAccion = useCallback(async (accion) => {
    if (!partidaRef.current || enVueloRef.current) return;
    enVueloRef.current = true;
    try {
      const res = await fetch('/api/jugadas/local/accion', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ partida: partidaRef.current, accion }) });
      const data = await res.json();
      if (data.partida) { partidaRef.current = data.partida; setVista(data.vista); }
      if (!data.ok && data.error && accion.tipo !== 'tiempo') { setAviso(data.error); setTimeout(() => setAviso(''), 3000); }
    } catch {
      setAviso('Sin conexión con el servidor. Inténtalo de nuevo.');
      setTimeout(() => setAviso(''), 3000);
    } finally {
      enVueloRef.current = false;
    }
  }, []);
  const avisarTiempo = useCallback(() => enviarAccion({ tipo: 'tiempo' }), [enviarAccion]);

  if (paso === 'config') {
    return (
      <div className="jgp-contenedor">
        <SelectorJugadores
          onVolver={onVolver} onAyuda={onAbrirAyuda} min={LIM_JUG.min} max={LIM_JUG.max}
          numJugadores={nombres.length}
          onCambiarNum={(n) => setNombres((l) => (n > l.length ? [...l, ...Array(n - l.length).fill('')] : l.slice(0, n)))}
          nombres={nombres}
          onNombre={(i, valor) => setNombres((l) => l.map((x, k) => (k === i ? valor : x)))}
          onEmpezar={empezar} textoBoton={cargando ? 'Cargando…' : '¡Empezar partido!'} error={error}
        />
      </div>
    );
  }

  return (
    <div className="jgp-contenedor qq-en-partida">
      {aviso && <p className="jgp-toast" role="alert" onClick={() => setAviso('')}>{aviso}</p>}
      <section className="game jgp-escena">
        {vista && (
          <JugadasPartida vista={vista} local esHost onAccion={enviarAccion} onTiempo={avisarTiempo} onSalir={() => setModal(true)}
            finalAcciones={(
              <div className="jgp-barra estatica">
                <button type="button" className="jgp-boton grande" onClick={() => { partidaRef.current = null; setVista(null); setPaso('config'); }}><Icon name="refresh" size={20} /> Nueva partida</button>
                <button type="button" className="jgp-boton secundario" onClick={() => onExit?.()}><Icon name="door" size={18} /> Salir a la portada</button>
              </div>
            )} />
        )}
      </section>
      {modal && (
        <ModalSalir titulo="¿Salir de la partida?" texto="Se perderá la partida en curso y volverás a la portada."
          onSeguir={() => setModal(false)} onSalir={() => { setModal(false); onExit?.(); }} />
      )}
    </div>
  );
}
