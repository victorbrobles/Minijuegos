// client/src/components/Sonido.jsx
// Botón 🔊 con el panel de ajustes de sonido y vibración.
import { useEffect, useRef, useState } from 'react';
import { usePreferenciasSonido, guardarPreferencias, sonar, puedeVibrar } from '../lib/sonido.js';
import './Sonido.css';

function Interruptor({ activo, onCambio, children }) {
  return (
    <button type="button" role="switch" aria-checked={activo} className={`snd-int${activo ? ' on' : ''}`} onClick={() => onCambio(!activo)}>
      <span>{children}</span><i />
    </button>
  );
}

export default function BotonSonido({ clase = '' }) {
  const p = usePreferenciasSonido();
  const [abierto, setAbierto] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!abierto) return undefined;
    const fuera = (e) => { if (ref.current && !ref.current.contains(e.target)) setAbierto(false); };
    document.addEventListener('pointerdown', fuera);
    return () => document.removeEventListener('pointerdown', fuera);
  }, [abierto]);
  const icono = !p.sonido || p.volumen === 0 ? '🔇' : p.volumen < 0.4 ? '🔈' : '🔊';
  return (
    <div className={`snd ${clase}`} ref={ref}>
      <button type="button" className="snd-btn" aria-label="Sonido y vibración" aria-expanded={abierto} onClick={() => setAbierto(!abierto)}>{icono}</button>
      {abierto && (
        <div className="snd-panel" role="dialog" aria-label="Sonido y vibración">
          <b>Sonido y vibración</b>
          <Interruptor activo={p.sonido} onCambio={(v) => { guardarPreferencias({ sonido: v }); if (v) setTimeout(() => sonar('acierto', { vibrar: false }), 30); }}>🔊 Efectos de sonido</Interruptor>
          <label className={`snd-vol${p.sonido ? '' : ' off'}`}>
            <span>Volumen</span>
            <input type="range" min="0" max="1" step="0.05" value={p.volumen} disabled={!p.sonido}
              onChange={(e) => guardarPreferencias({ volumen: Number(e.target.value) })}
              onPointerUp={() => sonar('acierto', { vibrar: false })} />
          </label>
          <Interruptor activo={p.toques} onCambio={(v) => guardarPreferencias({ toques: v })}>👆 Sonido al tocar botones</Interruptor>
          <Interruptor activo={p.vibracion} onCambio={(v) => { guardarPreferencias({ vibracion: v }); if (v) navigator.vibrate?.(80); }}>📳 Vibración</Interruptor>
          {!puedeVibrar() && <small>Este navegador no permite vibrar (en iPhone no está disponible).</small>}
          <div className="snd-probar">
            {[['acierto', '✅'], ['fallo', '❌'], ['turno', '🔄'], ['victoria', '🏆']].map(([s, e]) => (
              <button key={s} type="button" onClick={() => sonar(s)} aria-label={`Probar ${s}`}>{e}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
