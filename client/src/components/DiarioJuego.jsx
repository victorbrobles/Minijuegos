// client/src/components/DiarioJuego.jsx
// Reto del día de un juego de un jugador (Palabra oculta, Letras en cadena, Vía libre): la misma partida para todos
// cada día, un solo intento, clasificación del día y racha de días seguidos. El servidor está en /api/solo/diario.
import React, { useCallback, useEffect, useState } from 'react';
import { nombreCompleto, partirNombre } from '../lib/identidad.js';
import './DiarioJuego.css';

const fmt = (n) => Number(n).toLocaleString('es-ES');

/** Estado del reto de hoy y acciones. `datos` es la partida del día (null si ya has jugado). */
export function useDiario(juego) {
  const [estado, setEstado] = useState(null);
  const [error, setError] = useState('');
  const recargar = useCallback(() => {
    fetch(`/api/solo/diario/${juego}?jugador=${encodeURIComponent(nombreCompleto())}`)
      .then((r) => r.json()).then((d) => { if (d.success) { setEstado(d); setError(''); } else setError(d.error || 'Error'); })
      .catch(() => setError('Sin conexión: el reto del día necesita internet.'));
  }, [juego]);
  useEffect(() => { recargar(); }, [recargar]);
  const enviar = useCallback(async (puntos, resumen) => {
    try {
      const r = await fetch(`/api/solo/diario/${juego}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jugador: nombreCompleto(), puntos, resumen }) });
      const d = await r.json();
      if (d.success) setEstado({ ...d, datos: null });
      return d;
    } catch { return null; }
  }, [juego]);
  return { estado, error, recargar, enviar };
}

function Clasificacion({ estado, unidad }) {
  const yo = nombreCompleto();
  if (!estado?.clasificacion?.length) return <p className="dj-nota">Aún no ha jugado nadie hoy. ¡Sé el primero!</p>;
  return (
    <ol className="dj-tabla">
      {estado.clasificacion.slice(0, 10).map((r, i) => (
        <li key={r.jugador} className={r.jugador === yo ? 'yo' : ''}>
          <span>{['🥇', '🥈', '🥉'][i] || `${i + 1}.`}</span>
          <b>{partirNombre(r.jugador).nombre}</b>
          <small>{r.resumen}</small>
          <em>{fmt(r.puntos)} {unidad}</em>
        </li>
      ))}
    </ol>
  );
}

/** Tarjeta para la portada del juego. */
export function TarjetaDiario({ diario, onJugar, unidad = 'pts' }) {
  const { estado, error } = diario;
  if (error) return <div className="dj-tarjeta"><p className="dj-nota">📅 {error}</p></div>;
  if (!estado) return <div className="dj-tarjeta"><p className="dj-nota">📅 Cargando el reto del día…</p></div>;
  const hecho = Boolean(estado.intento);
  return (
    <div className={`dj-tarjeta${hecho ? ' hecho' : ''}`}>
      <div className="dj-cab">
        <span className="dj-cal" aria-hidden="true"><small>{new Date(`${estado.dia}T12:00:00`).toLocaleDateString('es-ES', { month: 'short' })}</small><b>{Number(estado.dia.slice(8))}</b></span>
        <div>
          <b>Reto del día</b>
          <small>La misma partida para todos · un solo intento</small>
        </div>
        {estado.racha > 0 && <span className="dj-racha" title="Días seguidos">🔥 {estado.racha}</span>}
      </div>
      {hecho ? (
        <p className="dj-hecho">✅ Hoy: <b>{fmt(estado.intento.puntos)} {unidad}</b>{estado.puesto ? ` · puesto ${estado.puesto} de ${estado.jugadores}` : ''}. Vuelve mañana.</p>
      ) : (
        <button type="button" className="dj-jugar" onClick={onJugar}>📅 Jugar el reto de hoy{estado.jugadores ? ` · ${estado.jugadores} ya ${estado.jugadores === 1 ? 'ha' : 'han'} jugado` : ''}</button>
      )}
      <details className="dj-detalles" open={hecho}>
        <summary>Clasificación de hoy</summary>
        <Clasificacion estado={estado} unidad={unidad} />
      </details>
    </div>
  );
}

/** Resultado del reto en la pantalla final. */
export function FinDiario({ estado, unidad = 'pts' }) {
  if (!estado?.intento) return <p className="dj-nota">Guardando tu resultado del reto…</p>;
  return (
    <div className="dj-fin">
      <p>📅 <b>Reto del día</b>: puesto <b>{estado.puesto || '–'}</b> de {estado.jugadores}{estado.racha > 1 ? ` · 🔥 ${estado.racha} días seguidos` : ''}</p>
      <Clasificacion estado={estado} unidad={unidad} />
    </div>
  );
}
