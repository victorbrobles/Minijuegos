// client/src/games/Solo/comun.jsx
// Utilidades de los juegos de un jugador de trivia y fútbol: carga de datos, comparación de respuestas escritas,
// cuenta atrás y buscador con sugerencias.
import React, { useEffect, useMemo, useRef, useState } from 'react';

export const norm = (t) => String(t ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9ñ ]/g, ' ').replace(/\s+/g, ' ').trim();

function distancia(a, b) {
  if (Math.abs(a.length - b.length) > 2) return 9;
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}
/** ¿Lo escrito vale por este nombre? Nombre completo, alias o apellido, con una errata permitida en palabras largas. */
export function coincide(texto, nombre, alias = []) {
  const t = norm(texto);
  if (!t) return false;
  const formas = [nombre, ...alias].map(norm);
  const apellido = norm(nombre).split(' ').slice(-1)[0];
  if (apellido.length >= 4) formas.push(apellido);
  return formas.some((f) => f === t || (f.length >= 6 && distancia(f, t) <= 1));
}

/** Pide al servidor una partida nueva de /api/solo/:juego. */
export async function cargarSolo(juego) {
  const r = await fetch(`/api/solo/${juego}`);
  if (!r.ok) throw new Error('No se pudo cargar la partida.');
  return r.json();
}

/** Cuenta atrás con un instante de fin que se puede mover (bonus o penalización). */
export function useCuenta(activa, onFin) {
  const fin = useRef(0);
  const [restante, setRestante] = useState(0);
  const finRef = useRef(onFin); finRef.current = onFin;
  useEffect(() => {
    if (!activa) return undefined;
    const t = setInterval(() => {
      const r = Math.max(0, (fin.current - Date.now()) / 1000);
      setRestante(r);
      if (r <= 0) { clearInterval(t); finRef.current?.(); }
    }, 100);
    return () => clearInterval(t);
  }, [activa]);
  return {
    restante,
    empezar: (seg) => { fin.current = Date.now() + seg * 1000; setRestante(seg); },
    sumar: (seg) => { fin.current += seg * 1000; setRestante(Math.max(0, (fin.current - Date.now()) / 1000)); }
  };
}

/** Campo de texto con sugerencias (futbolistas…). Llama a onElegir(texto) al pulsar una o al enviar. */
export function Buscador({ lista, onElegir, placeholder = 'Escribe un nombre…', deshabilitado, minimo = 2 }) {
  const [texto, setTexto] = useState('');
  const ref = useRef(null);
  const normalizada = useMemo(() => lista.map((n) => [n, norm(n)]), [lista]);
  const t = norm(texto);
  const sugerencias = t.length >= minimo ? normalizada.filter(([, n]) => n.includes(t) || n.split(' ').some((p) => p.startsWith(t))).slice(0, 6).map(([n]) => n) : [];
  const elegir = (v) => { if (!v.trim()) return; onElegir(v); setTexto(''); ref.current?.focus(); };
  return (
    <form className="sl-buscador" onSubmit={(e) => { e.preventDefault(); elegir(sugerencias.length === 1 ? sugerencias[0] : texto); }}>
      <input ref={ref} className="sl-input" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder={placeholder} disabled={deshabilitado}
        autoComplete="off" autoCorrect="off" spellCheck="false" enterKeyHint="send" />
      {sugerencias.length > 0 && (
        <ul className="sl-sugerencias">
          {sugerencias.map((s) => <li key={s}><button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => elegir(s)}>{s}</button></li>)}
        </ul>
      )}
    </form>
  );
}

/** Pantalla de carga / error mientras llegan los datos. */
export function Cargando({ error, onReintentar }) {
  return (
    <section className="game uj-escena">
      <div className="uj-tarjeta sl-centro">
        {error ? <><p>{error}</p><button type="button" className="uj-boton" onClick={onReintentar}>Reintentar</button></> : <p>Preparando la partida…</p>}
      </div>
    </section>
  );
}
