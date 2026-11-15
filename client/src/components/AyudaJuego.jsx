// client/src/components/AyudaJuego.jsx
// Ayuda común de todos los juegos: cabecera con el degradado del juego, objetivo y secciones con colores
// (cómo se juega, bloques propios del juego, puntuación, quién gana y consejos). El contenido de cada juego
// está en src/ayudas/ (datos, sin JSX). Se abre al pulsar cualquier botón «?» del juego (ver GamePage).
import React, { useEffect } from 'react';
import Icon from './Icon.jsx';
import { metaDe } from '../games/meta.js';
import { textoJugadores } from '../games/limites.js';
import { AYUDAS } from '../ayudas/index.js';
import './AyudaJuego.css';

export const tieneAyuda = (id) => Boolean(AYUDAS[id]);

/** Texto con **negritas**. */
function T({ children }) {
  const partes = String(children ?? '').split(/\*\*(.+?)\*\*/g);
  return <>{partes.map((p, i) => (i % 2 ? <b key={i}>{p}</b> : p))}</>;
}
const tono = (valor) => {
  const v = String(valor).trim();
  if (/^[+]|^gana|^\d/i.test(v)) return 'mas';
  if (/^[-−–]|^pierde|^fuera|^0\b|elimina/i.test(v)) return 'menos';
  return 'neutro';
};
const COLORES = ['azul', 'violeta', 'verde', 'rosa', 'naranja', 'cian'];

function Bloque({ icono, titulo, color, children }) {
  return (
    <section className={`ayj-bloque ${color}`}>
      <h4><span>{icono}</span>{titulo}</h4>
      {children}
    </section>
  );
}

export default function AyudaJuego({ juegoId, onCerrar }) {
  const a = AYUDAS[juegoId];
  const m = metaDe(juegoId);
  useEffect(() => {
    const tecla = (e) => { if (e.key === 'Escape') onCerrar(); };
    window.addEventListener('keydown', tecla);
    const antes = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', tecla); document.body.style.overflow = antes; };
  }, [onCerrar]);
  if (!a) return null;
  let jugadores = null;
  try { jugadores = textoJugadores(juegoId); } catch { /* sin límites */ }
  return (
    <div className="rg-modal-fondo ayj-fondo" onClick={onCerrar}>
      <div className="ayj" role="dialog" aria-modal="true" aria-label={`Cómo se juega a ${m.titulo}`} onClick={(e) => e.stopPropagation()}>
        <header className="ayj-cab">
          <button type="button" className="ayj-cerrar" onClick={onCerrar} aria-label="Cerrar"><Icon name="close" size={18} /></button>
          <span className="ayj-icono"><Icon name={m.icono} size={30} /></span>
          <div>
            <small>Cómo se juega</small>
            <h3>{m.titulo}</h3>
          </div>
          <div className="ayj-chips">
            {jugadores && <span>👥 {jugadores}</span>}
            {(a.chips || []).map((c) => <span key={c}>{c}</span>)}
          </div>
        </header>

        <div className="ayj-cuerpo">
          {a.objetivo && (
            <div className="ayj-objetivo">
              <span>🎯</span>
              <div><small>Objetivo</small><p><T>{a.objetivo}</T></p></div>
            </div>
          )}

          {a.pasos?.length > 0 && (
            <Bloque icono="🕹️" titulo={a.tituloPasos || 'Paso a paso'} color="azul">
              <ol className="ayj-pasos">
                {a.pasos.map((p, i) => <li key={i}><i>{i + 1}</i><span><T>{p}</T></span></li>)}
              </ol>
            </Bloque>
          )}

          {(a.secciones || []).map((s, k) => (
            <Bloque key={s.titulo} icono={s.icono || '📌'} titulo={s.titulo} color={s.color || COLORES[(k + 1) % COLORES.length]}>
              {s.texto && <p className="ayj-texto"><T>{s.texto}</T></p>}
              {s.items && <ul className="ayj-lista">{s.items.map((x, i) => <li key={i}><T>{x}</T></li>)}</ul>}
              {s.tabla && (
                <div className="ayj-tabla">
                  {s.tabla.map(([ic, c, v], i) => (
                    <div key={i}><span className="ic">{ic}</span><span className="c"><T>{c}</T></span>{v != null && <strong className={tono(v)}><T>{v}</T></strong>}</div>
                  ))}
                </div>
              )}
            </Bloque>
          ))}

          {(a.puntos?.length > 0 || a.notasPuntos?.length > 0) && (
            <Bloque icono="⭐" titulo={a.tituloPuntos || 'Puntuación'} color="ambar">
              {a.puntos?.length > 0 && (
                <div className="ayj-tabla">
                  {a.puntos.map(([ic, c, v], i) => (
                    <div key={i}><span className="ic">{ic}</span><span className="c"><T>{c}</T></span>{v != null && <strong className={tono(v)}><T>{v}</T></strong>}</div>
                  ))}
                </div>
              )}
              {a.notasPuntos?.length > 0 && <ul className="ayj-lista">{a.notasPuntos.map((x, i) => <li key={i}><T>{x}</T></li>)}</ul>}
            </Bloque>
          )}

          {a.gana && (
            <div className="ayj-gana">
              <span>🏆</span>
              <div><small>¿Quién gana?</small><p><T>{a.gana}</T></p></div>
            </div>
          )}

          {a.consejos?.length > 0 && (
            <Bloque icono="💡" titulo="Consejos" color="violeta">
              <ul className="ayj-lista consejos">{a.consejos.map((x, i) => <li key={i}><T>{x}</T></li>)}</ul>
            </Bloque>
          )}
        </div>

        <footer className="ayj-pie">
          <button type="button" className="ayj-ok" onClick={onCerrar}>¡Entendido, a jugar!</button>
        </footer>
      </div>
    </div>
  );
}
