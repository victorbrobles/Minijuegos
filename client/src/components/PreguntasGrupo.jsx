// client/src/components/PreguntasGrupo.jsx
// Selector «Preguntas de vuestro grupo» para los juegos de preguntas (¿Quién es más…?, Conoce a tus amigos).
// Elige un grupo y si se juega solo con vuestras preguntas o mezcladas con las de siempre.
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { nombreCompleto } from '../lib/identidad.js';
import './PreguntasGrupo.css';

const clave = (juego) => `minijuegos_preguntas_grupo_${juego}`;

/** [eleccion, setEleccion]: eleccion = { grupo, modo: 'mezcla' | 'solo' } o null. Se recuerda en este navegador. */
export function usePreguntasGrupo(juego) {
  const [v, setV] = useState(() => { try { return JSON.parse(localStorage.getItem(clave(juego)) || 'null'); } catch { return null; } });
  const poner = (n) => { setV(n); try { localStorage.setItem(clave(juego), JSON.stringify(n)); } catch { /* nada */ } };
  return [v, poner];
}

/** Lista de preguntas del grupo (para los modos de un solo móvil). */
export async function cargarPreguntasGrupo(juego, eleccion) {
  if (!eleccion?.grupo) return [];
  try {
    const r = await fetch(`/api/social/grupos/${eleccion.grupo}/preguntas/${juego}/lista`);
    const d = await r.json();
    const l = [...(d.preguntas || [])];
    for (let i = l.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [l[i], l[j]] = [l[j], l[i]]; }
    return l;
  } catch { return []; }
}

export function SelectorPreguntasGrupo({ juego, valor, onCambiar }) {
  const [grupos, setGrupos] = useState(null);
  const yo = nombreCompleto();
  useEffect(() => {
    let vivo = true;
    if (!yo) { setGrupos([]); return undefined; }
    fetch(`/api/social/preguntas-grupo?jugador=${encodeURIComponent(yo)}&juego=${juego}`)
      .then((r) => r.json()).then((d) => { if (vivo) setGrupos(d.grupos || []); }).catch(() => vivo && setGrupos([]));
    return () => { vivo = false; };
  }, [juego, yo]);
  // Si el grupo guardado ya no es tuyo o se ha quedado sin preguntas, se vuelve a las de siempre
  useEffect(() => {
    if (grupos && valor && !grupos.some((g) => g.codigo === valor.grupo && g.preguntas > 0)) onCambiar(null);
  }, [grupos]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!grupos) return null;
  const conPreguntas = grupos.filter((g) => g.preguntas > 0);
  if (!conPreguntas.length) {
    return (
      <p className="pg-pista">
        ✍️ ¿Y si jugáis con vuestras propias preguntas? Créalas en <Link to={grupos.length ? `/grupo/${grupos[0].codigo}#preguntas` : '/grupos'}>{grupos.length ? `«${grupos[0].nombre}»` : 'un grupo de amigos'}</Link>.
      </p>
    );
  }
  const elegir = (codigo) => onCambiar(codigo ? { grupo: codigo, modo: valor?.modo || 'mezcla' } : null);
  return (
    <div className="pg-caja">
      <span className="pg-titulo">👥 Preguntas de vuestro grupo</span>
      <div className="pg-chips">
        <button type="button" className={`pg-chip${!valor ? ' activo' : ''}`} onClick={() => elegir(null)}>Las de siempre</button>
        {conPreguntas.map((g) => (
          <button key={g.codigo} type="button" className={`pg-chip${valor?.grupo === g.codigo ? ' activo' : ''}`} onClick={() => elegir(g.codigo)}>
            {g.nombre} <em>{g.preguntas}</em>
          </button>
        ))}
      </div>
      {valor && (
        <div className="pg-modos">
          <button type="button" className={valor.modo === 'mezcla' ? 'activo' : ''} onClick={() => onCambiar({ ...valor, modo: 'mezcla' })}>🔀 Mezcladas con las de siempre</button>
          <button type="button" className={valor.modo === 'solo' ? 'activo' : ''} onClick={() => onCambiar({ ...valor, modo: 'solo' })}>⭐ Solo las nuestras</button>
        </div>
      )}
    </div>
  );
}
