// client/src/reto/Memoria.jsx — reto diario: repetir una secuencia de colores que crece (sin vidas)
import React, { useEffect, useRef, useState } from 'react';

const COLORES = ['#ef4444', '#3b82f6', '#22c55e', '#eab308'];
const NOTAS = [262, 330, 392, 523];
let audio = null;
function sonar(f, ms = 220) {
  try {
    audio ||= new (window.AudioContext || window.webkitAudioContext)();
    const o = audio.createOscillator(); const g = audio.createGain();
    o.frequency.value = f; g.gain.setValueAtTime(0.15, audio.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + ms / 1000);
    o.connect(g).connect(audio.destination); o.start(); o.stop(audio.currentTime + ms / 1000 + 0.05);
  } catch { /* sin audio */ }
}

export default function Memoria({ datos, onFin }) {
  const { secuencia, objetivo } = datos;
  const [largo, setLargo] = useState(3);
  const [fase, setFase] = useState('mostrando');
  const [luz, setLuz] = useState(null);
  const [hecho, setHecho] = useState(0);
  const timers = useRef([]);
  const limpiar = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  useEffect(() => limpiar, []);

  useEffect(() => {
    limpiar(); setFase('mostrando'); setHecho(0);
    const paso = Math.max(380, 650 - largo * 25);
    let t = 800;
    secuencia.slice(0, largo).forEach((b) => {
      timers.current.push(setTimeout(() => { setLuz(b); sonar(NOTAS[b], paso * 0.7); }, t));
      timers.current.push(setTimeout(() => setLuz(null), t + paso * 0.7));
      t += paso;
    });
    timers.current.push(setTimeout(() => setFase('turno'), t));
  }, [largo]); // eslint-disable-line react-hooks/exhaustive-deps

  const pulsar = (b) => {
    if (fase !== 'turno') return;
    setLuz(b); timers.current.push(setTimeout(() => setLuz(null), 160)); sonar(NOTAS[b], 160);
    if (b !== secuencia[hecho]) {
      setFase('fin'); sonar(110, 400);
      timers.current.push(setTimeout(() => onFin(largo - 1 >= objetivo, largo - 1, `Secuencia de ${largo - 1}`), 900));
      return;
    }
    if (hecho + 1 === largo) {
      if (largo >= objetivo) { setFase('fin'); timers.current.push(setTimeout(() => onFin(true, largo, `Secuencia de ${largo}`), 600)); return; }
      setFase('mostrando'); timers.current.push(setTimeout(() => setLargo(largo + 1), 500));
    } else setHecho(hecho + 1);
  };

  return (
    <div className="rto-juego">
      <div className="rto-progreso"><span>Secuencia de {largo}</span><span>Objetivo: {objetivo}</span></div>
      <p className="rto-estado">{fase === 'mostrando' ? '👀 Mira con atención…' : fase === 'turno' ? `🔁 Tu turno: ${hecho}/${largo}` : '⏳'}</p>
      <div className="rto-memoria">
        {COLORES.map((c, b) => (
          <button key={c} type="button" className={`rto-boton-color${luz === b ? ' luz' : ''}`} style={{ '--c': c }} disabled={fase !== 'turno'}
            onPointerDown={(e) => { e.preventDefault(); pulsar(b); }} aria-label={`Color ${b + 1}`} />
        ))}
      </div>
    </div>
  );
}
