// client/src/components/Sonido.jsx
// Botón 🔊 que abre (en una ventana propia, como Ajustes) los ajustes de sonido y vibración.
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePreferenciasSonido, guardarPreferencias, sonar, puedeVibrar } from '../lib/sonido.js';
import './Ajustes.css';
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
  useEffect(() => {
    if (!abierto) return undefined;
    const tecla = (e) => { if (e.key === 'Escape') setAbierto(false); };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [abierto]);
  const icono = !p.sonido || p.volumen === 0 ? '🔇' : p.volumen < 0.4 ? '🔈' : '🔊';
  return (
    <div className={`snd ${clase}`}>
      <button type="button" className="snd-btn" aria-label="Sonido y vibración" aria-expanded={abierto} onClick={() => setAbierto(!abierto)}>{icono}</button>
      {abierto && createPortal(
        <div className="rg-modal-fondo aj-fondo" onClick={() => setAbierto(false)}>
        <div className="aj-panel snd-panel" role="dialog" aria-modal="true" aria-label="Sonido y vibración" onClick={(e) => e.stopPropagation()}>
          <header><h2>🔊 Sonido y vibración</h2><button type="button" className="aj-cerrar" onClick={() => setAbierto(false)} aria-label="Cerrar">✕</button></header>
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
        </div>,
        document.body
      )}
    </div>
  );
}
