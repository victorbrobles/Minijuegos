// client/src/components/Reacciones.jsx
// Reacciones con emojis en las salas online: aparece una barra cuando estás en una sala y los emojis que manda
// cualquiera suben flotando en las pantallas de todos (y en el modo tele).
import { useEffect, useRef, useState } from 'react';
import { useSalaViva, fetchOriginal } from '../lib/salaViva.js';
import { nombreIdentidad } from '../lib/identidad.js';
import { sonar } from '../lib/sonido.js';
import './Reacciones.css';

export const EMOJIS = ['😂', '🔥', '😱', '👏', '😡', '🤯', '❤️', '🐐'];

/** Lluvia de reacciones de una sala (la usan los móviles y la tele). Devuelve los globos a pintar. */
export function useLluviaReacciones(juego, code, { sonido = true, propios } = {}) {
  const [globos, setGlobos] = useState([]);
  const desde = useRef(null);
  useEffect(() => {
    if (!juego || !code) return undefined;
    let vivo = true;
    const leer = () => fetchOriginal(`/api/social/sala/${encodeURIComponent(juego)}/${code}?desde=${desde.current ?? 0}`)
      .then((r) => (r.ok ? r.json() : null)).then((d) => {
        if (!vivo || !d) return;
        // La primera lectura solo marca por dónde vamos (no se repiten reacciones antiguas)
        if (desde.current === null) { desde.current = d.ultimoId || 0; return; }
        const nuevas = (d.reacciones || []).filter((r) => r.id > desde.current);
        desde.current = Math.max(desde.current, d.ultimoId || 0);
        const ajenas = nuevas.filter((r) => !propios?.current?.has(r.id));
        if (ajenas.length) { lanzar(ajenas); if (sonido) sonar('reaccion', { minimo: 150 }); }
      }).catch(() => {});
    leer();
    const t = setInterval(leer, 1500);
    return () => { vivo = false; clearInterval(t); };
  }, [juego, code]); // eslint-disable-line react-hooks/exhaustive-deps
  const lanzar = (lista) => {
    const nuevos = lista.map((r) => ({ ...r, clave: `${r.id ?? 'p'}-${Math.random()}`, x: 8 + Math.random() * 78, giro: Math.random() * 40 - 20 }));
    setGlobos((g) => [...g, ...nuevos].slice(-30));
    nuevos.forEach((n) => setTimeout(() => setGlobos((g) => g.filter((x) => x.clave !== n.clave)), 3200));
  };
  return { globos, lanzar };
}

export function Globos({ globos, grande = false }) {
  return (
    <div className={`rx-lluvia${grande ? ' grande' : ''}`} aria-hidden="true">
      {globos.map((g) => (
        <span key={g.clave} className="rx-globo" style={{ left: `${g.x}%`, '--giro': `${g.giro}deg` }}>
          <b>{g.emoji}</b>{g.nombre && <small>{g.nombre}</small>}
        </span>
      ))}
    </div>
  );
}

export default function Reacciones({ juego }) {
  const sala = useSalaViva(juego);
  const [abierta, setAbierta] = useState(false);
  const propios = useRef(new Set());
  const { globos, lanzar } = useLluviaReacciones(juego, sala?.code, { propios });
  if (!sala) return null;
  const enviar = (emoji) => {
    const nombre = nombreIdentidad() || 'Alguien';
    lanzar([{ emoji, nombre: 'Tú' }]);
    sonar('reaccion');
    fetchOriginal(`/api/social/sala/${encodeURIComponent(juego)}/${sala.code}/reaccion`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nombre, emoji })
    }).then((r) => r.json()).then((d) => { if (d?.id) propios.current.add(d.id); }).catch(() => {});
  };
  return (
    <>
      <Globos globos={globos} />
      <div className={`rx-barra${abierta ? ' abierta' : ''}`}>
        {abierta && EMOJIS.map((e) => <button key={e} type="button" className="rx-emoji" onClick={() => enviar(e)} aria-label={`Reaccionar ${e}`}>{e}</button>)}
        <button type="button" className="rx-toggle" onClick={() => setAbierta(!abierta)} aria-label={abierta ? 'Cerrar reacciones' : 'Reaccionar'}>{abierta ? '✕' : '😀'}</button>
      </div>
    </>
  );
}
