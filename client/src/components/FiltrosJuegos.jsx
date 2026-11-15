// client/src/components/FiltrosJuegos.jsx
// Filtros de la portada: cuántos sois, online o en un móvil, duración, tipo de juego y favoritos.
// Se recuerdan en este navegador (solo es una comodidad: si no hay almacenamiento, funciona igual).
import React, { useState } from 'react';
import Icon from './Icon.jsx';
import { metaDe, CATEGORIAS_PORTADA } from '../games/meta.js';
import { LIMITES, limitesLocal, limitesOnline } from '../games/limites.js';
import { MODOS } from '../games/modos.js';
import './FiltrosJuegos.css';

const CLAVE = 'minijuegos_filtros';
export const SIN_FILTROS = { jugadores: null, modo: 'todos', duracion: null, tipos: [], favoritos: false };
const TIPOS = CATEGORIAS_PORTADA.filter((c) => !['favoritos', 'dos_jugadores', 'un_jugador'].includes(c.id));
export const DURACIONES = [[5, '≤ 5 min'], [15, '≤ 15 min'], [30, '≤ 30 min']];

export function useFiltros() {
  const [f, setF] = useState(() => {
    try { return { ...SIN_FILTROS, ...JSON.parse(localStorage.getItem(CLAVE) || '{}') }; } catch { return SIN_FILTROS; }
  });
  const cambiar = (nuevo) => {
    const v = typeof nuevo === 'function' ? nuevo(f) : nuevo;
    setF(v);
    try { localStorage.setItem(CLAVE, JSON.stringify(v)); } catch { /* sin almacenamiento */ }
  };
  return [f, cambiar];
}

/** Cuántos filtros hay activos (para el botón). */
export const cuantosFiltros = (f) => (f.jugadores ? 1 : 0) + (f.modo !== 'todos' ? 1 : 0) + (f.duracion ? 1 : 0) + f.tipos.length + (f.favoritos ? 1 : 0);

/** ¿Encaja el juego con los filtros? */
export function cumpleFiltros(id, f, favoritos = []) {
  const m = metaDe(id);
  const modos = MODOS[id] || { online: true, local: true };
  if (f.favoritos && !favoritos.includes(id)) return false;
  if (f.modo === 'online' && !modos.online) return false;
  if (f.modo === 'local' && !modos.local) return false;
  if (f.duracion && (m.duracion || 15) > f.duracion) return false;
  if (f.tipos.length && !f.tipos.some((t) => (m.categorias || []).includes(t))) return false;
  if (f.jugadores && LIMITES[id]) {
    const n = f.jugadores;
    const cabe = (l) => n >= l.min && n <= l.max;
    const enLocal = modos.local && cabe(limitesLocal(id));
    const enOnline = modos.online && cabe(limitesOnline(id));
    if (f.modo === 'online' ? !enOnline : f.modo === 'local' ? !enLocal : !(enLocal || enOnline)) return false;
  }
  return true;
}

function Chip({ activo, onClick, children }) {
  return <button type="button" className={`fj-chip${activo ? ' activo' : ''}`} aria-pressed={activo} onClick={onClick}>{children}</button>;
}

export function PanelFiltros({ filtros: f, onCambiar, resultados, onCerrar }) {
  const poner = (k, v) => onCambiar({ ...f, [k]: v });
  const alternarTipo = (t) => poner('tipos', f.tipos.includes(t) ? f.tipos.filter((x) => x !== t) : [...f.tipos, t]);
  return (
    <section className="fj-panel" aria-label="Filtros">
      <div className="fj-grupo">
        <span className="fj-etiqueta">👥 ¿Cuántos sois?</span>
        <div className="fj-somos">
          <button type="button" onClick={() => poner('jugadores', f.jugadores > 1 ? f.jugadores - 1 : null)} aria-label="Menos" disabled={!f.jugadores}>−</button>
          <b>{f.jugadores ? (f.jugadores === 1 ? 'Solo yo' : `Somos ${f.jugadores}`) : 'Cualquiera'}</b>
          <button type="button" onClick={() => poner('jugadores', Math.min(20, (f.jugadores || 0) + 1))} aria-label="Más">+</button>
        </div>
      </div>
      <div className="fj-grupo">
        <span className="fj-etiqueta">📱 Cómo jugáis</span>
        <div className="fj-chips">
          <Chip activo={f.modo === 'todos'} onClick={() => poner('modo', 'todos')}>Da igual</Chip>
          <Chip activo={f.modo === 'online'} onClick={() => poner('modo', 'online')}>🌐 Cada uno en su móvil</Chip>
          <Chip activo={f.modo === 'local'} onClick={() => poner('modo', 'local')}>📱 En un solo móvil</Chip>
        </div>
      </div>
      <div className="fj-grupo">
        <span className="fj-etiqueta">⏱️ Tiempo</span>
        <div className="fj-chips">
          <Chip activo={!f.duracion} onClick={() => poner('duracion', null)}>Sin prisa</Chip>
          {DURACIONES.map(([d, t]) => <Chip key={d} activo={f.duracion === d} onClick={() => poner('duracion', d)}>{t}</Chip>)}
        </div>
      </div>
      <div className="fj-grupo">
        <span className="fj-etiqueta">🎲 Tipo de juego</span>
        <div className="fj-chips">
          {TIPOS.map((c) => <Chip key={c.id} activo={f.tipos.includes(c.id)} onClick={() => alternarTipo(c.id)}>{c.titulo}</Chip>)}
        </div>
      </div>
      <div className="fj-pie">
        <Chip activo={f.favoritos} onClick={() => poner('favoritos', !f.favoritos)}>❤️ Solo mis favoritos</Chip>
        <span className="fj-cuenta">{resultados} {resultados === 1 ? 'juego' : 'juegos'}</span>
        {cuantosFiltros(f) > 0 && <button type="button" className="fj-limpiar" onClick={() => onCambiar(SIN_FILTROS)}><Icon name="x" size={14} /> Quitar filtros</button>}
        {onCerrar && <button type="button" className="fj-listo" onClick={onCerrar}>Ver juegos</button>}
      </div>
    </section>
  );
}

/** Texto corto de la duración: «~15 min». */
export const textoDuracion = (id) => `~${metaDe(id).duracion || 15} min`;
