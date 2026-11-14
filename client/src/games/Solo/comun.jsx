// client/src/games/Solo/comun.jsx
// Utilidades de los juegos de un jugador de trivia y fútbol: carga de datos, comparación de respuestas escritas,
// cuenta atrás y buscador con sugerencias.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { nombreCompleto, partirNombre } from '../../lib/identidad.js';
import { AvatarJugador } from '../../components/Perfil.jsx';

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

// ---------------------------------------------------------------- Retos entre amigos
// Si se entra con /juego/<id>?reto=CÓDIGO, la primera partida es la del reto (los mismos datos que jugó quien retó).
const ultimos = {}; // juego → datos de la última partida (para poder retar con ella)
let retoActivo = null; // { codigo, juego }
export const recordarPartida = (juego, datos) => { ultimos[juego] = datos; };
export const retoDe = (juego) => (retoActivo?.juego === juego ? retoActivo : null);
/** Si la URL trae un reto de este juego, devuelve sus datos (una sola vez) y lo deja activo. */
export async function datosDeReto(juego) {
  const codigo = new URLSearchParams(window.location.search).get('reto');
  if (!codigo) { if (retoActivo?.juego === juego) retoActivo = null; return null; }
  window.history.replaceState(null, '', window.location.pathname); // «Jugar otra vez» ya será una partida nueva
  try {
    const r = await fetch(`/api/solo/retos/${encodeURIComponent(codigo)}`);
    if (!r.ok) return null;
    const d = await r.json();
    if (d.juego !== juego) return null;
    retoActivo = { codigo: codigo.toUpperCase(), juego };
    ultimos[juego] = d.datos;
    return d.datos;
  } catch { return null; }
}

/** Pide al servidor una partida nueva de /api/solo/:juego (o la del reto, si se ha entrado con un enlace de reto). */
export async function cargarSolo(juego) {
  const deReto = await datosDeReto(juego);
  if (deReto) return deReto;
  if (retoActivo?.juego === juego) retoActivo = null;
  const r = await fetch(`/api/solo/${juego}`);
  if (!r.ok) throw new Error('No se pudo cargar la partida.');
  const d = await r.json();
  ultimos[juego] = d;
  return d;
}

/** Al final de una partida: retar a un amigo con la misma partida o, si era un reto, ver cómo has quedado. */
export function RetoAmigo({ juego, puntos, orden = 'desc', formato = (x) => x }) {
  const [estado, setEstado] = useState({ fase: 'inicio' });
  const reto = retoDe(juego);
  const yo = nombreCompleto();
  useEffect(() => {
    if (!reto || !yo) return;
    fetch(`/api/solo/retos/${reto.codigo}/resultado`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jugador: yo, puntos }) })
      .then((r) => r.json()).then((d) => setEstado({ fase: 'resultado', resultados: d.resultados || [] })).catch(() => {});
    retoActivo = null;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  if (!yo || puntos == null) return null;
  if (estado.fase === 'resultado') {
    const pos = estado.resultados.findIndex((x) => x.jugador === yo);
    return (
      <div className="sl-reto">
        <p className="sl-reto-titulo">⚔️ Reto entre amigos · {pos === 0 ? '¡vas primero!' : `vas ${pos + 1}.º`}</p>
        <ol className="sl-reto-lista">
          {estado.resultados.map((x, i) => (
            <li key={x.jugador} className={x.jugador === yo ? 'yo' : ''}>
              <span>{i + 1}.</span><AvatarJugador nombre={x.jugador} tam={22} /><b>{partirNombre(x.jugador).nombre}{x.retador ? ' (retador)' : ''}</b><em>{formato(x.puntos)}</em>
            </li>
          ))}
        </ol>
      </div>
    );
  }
  if (reto) return <p className="sl-nota">Guardando tu resultado del reto…</p>;
  const crear = async () => {
    setEstado({ fase: 'creando' });
    try {
      const r = await fetch('/api/solo/retos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ juego, datos: ultimos[juego], jugador: yo, puntos, orden }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setEstado({ fase: 'creado', url: `${window.location.origin}/juego/${juego}?reto=${d.codigo}` });
    } catch (e) { setEstado({ fase: 'error', error: e.message || 'No se pudo crear el reto.' }); }
  };
  if (estado.fase === 'creado') {
    const texto = `⚔️ Te reto a superar mis ${formato(puntos)} en este juego de Minigames Hub:`;
    return (
      <div className="sl-reto">
        <p className="sl-reto-titulo">⚔️ ¡Reto creado! Mándale este enlace:</p>
        <input className="sl-input sl-reto-url" readOnly value={estado.url} onFocus={(e) => e.target.select()} />
        <div className="sl-fila">
          <button type="button" className="uj-boton secundario" onClick={() => { navigator.clipboard?.writeText(`${texto} ${estado.url}`); setEstado({ ...estado, copiado: true }); }}>{estado.copiado ? '✓ Copiado' : '📋 Copiar'}</button>
          {navigator.share && <button type="button" className="uj-boton secundario" onClick={() => navigator.share({ title: 'Minigames Hub', text: texto, url: estado.url }).catch(() => {})}>📤 Compartir</button>}
        </div>
        <p className="sl-nota">Jugará exactamente la misma partida. Cuando termine, verá quién ha ganado.</p>
      </div>
    );
  }
  return (
    <div className="sl-reto">
      <button type="button" className="uj-boton" onClick={crear} disabled={estado.fase === 'creando'}>⚔️ {estado.fase === 'creando' ? 'Creando reto…' : 'Retar a un amigo con esta misma partida'}</button>
      {estado.error && <p className="sl-nota">{estado.error}</p>}
    </div>
  );
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
