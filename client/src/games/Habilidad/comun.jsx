// client/src/games/Habilidad/comun.jsx
// Piezas comunes: marcador sobre la escena, botones y el envoltorio de cada minijuego
// (instrucciones → 3, 2, 1 → juego → resultado), con un tiempo máximo de seguridad.
import React, { useEffect, useRef, useState } from 'react';
import { sonar } from '../../lib/sonido.js';

export function Hud({ izq, der, centro }) {
  return (
    <div className="hb-hud">
      <span>{izq}</span>{centro && <b className="hb-hud-centro">{centro}</b>}<span>{der}</span>
    </div>
  );
}
export function Botones({ children, lados }) { return <div className={`hb-botones${lados ? " lados" : ""}`}>{children}</div>; }
export function Boton({ onPulsar, children, ancho, color }) {
  return (
    <button type="button" className={`hb-boton${ancho ? ' ancho' : ''}`} style={color ? { background: color } : undefined}
      onPointerDown={(e) => { e.preventDefault(); onPulsar?.(); }}>{children}</button>
  );
}
export function Mensaje({ texto, tipo }) { return texto ? <div className={`hb-msg ${tipo || ''}`} key={texto}>{texto}</div> : null; }

/** Formatea el resultado de un minijuego con su unidad. */
export function formatear(juego, v) {
  if (v == null) return '—';
  if (juego.formato) return juego.formato(v);
  return `${Math.round(v * 10) / 10} ${juego.unidad}`.replace('.', ',');
}

/** Juega un minijuego y devuelve su resultado con onFin(valor). */
export function Minijuego({ juego, semilla, onFin, quien }) {
  const [fase, setFase] = useState('intro');
  const [cuenta, setCuenta] = useState(3);
  const [valor, setValor] = useState(null);
  const hecho = useRef(false);
  const terminar = (v) => {
    if (hecho.current) return; hecho.current = true;
    const limpio = Number.isFinite(v) ? v : juego.mejor === 'menos' ? juego.peor : 0;
    setValor(limpio); setFase('hecho'); sonar('acierto');
    setTimeout(() => onFin(limpio), 1400);
  };
  useEffect(() => {
    if (fase !== 'cuenta') return undefined;
    if (cuenta <= 0) { setFase('jugando'); return undefined; }
    sonar(cuenta === 1 ? 'ultimo' : 'tic');
    const t = setTimeout(() => setCuenta((c) => c - 1), 700);
    return () => clearTimeout(t);
  }, [fase, cuenta]);
  // Tiempo máximo de seguridad
  useEffect(() => {
    if (fase !== 'jugando') return undefined;
    const t = setTimeout(() => terminar(undefined), (juego.duracion + 10) * 1000);
    return () => clearTimeout(t);
  }, [fase]); // eslint-disable-line react-hooks/exhaustive-deps
  if (fase === 'intro') {
    return (
      <div className="hb-intro">
        <span className="hb-intro-emoji">{juego.emoji}</span>
        <h2>{juego.nombre}</h2>
        {quien && <p className="hb-quien">Juega: <b>{quien}</b></p>}
        <p className="hb-como">{juego.como}</p>
        <p className="hb-meta">⏱️ Máx. {juego.duracion} s · {juego.mejor === 'menos' ? 'gana el resultado más bajo' : 'gana el resultado más alto'}</p>
        <button type="button" className="pzp-boton grande" onClick={() => { setFase('cuenta'); setCuenta(3); }}>▶️ ¡Empezar!</button>
      </div>
    );
  }
  if (fase === 'cuenta') return <div className="hb-intro hb-cuenta"><span key={cuenta}>{cuenta}</span><p>{juego.nombre}</p></div>;
  if (fase === 'hecho') return <div className="hb-intro"><span className="hb-intro-emoji">🏁</span><h2>{formatear(juego, valor)}</h2><p className="hb-como">Resultado guardado</p></div>;
  const C = juego.C;
  return <C semilla={semilla} alTerminar={terminar} />;
}
