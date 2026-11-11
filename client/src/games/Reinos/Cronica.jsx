// client/src/games/Reinos/Cronica.jsx
// Crónica ilustrada de «Los Siete Reinos»: tarjetas por hecho y animaciones de batallas (los soldados caen uno a uno)
// y de reclutamiento (los nuevos soldados se van sumando a la tropa).
import React, { useEffect, useMemo, useState } from 'react';
import { TIPOS } from './engine.js';

const MAX_FIG = 24; // figuras como mucho por grupo (si hay más, cada figura vale varios soldados)
const reinoDe = (v, id) => v.reinos.find((r) => r.id === id);
const nombreT = (v, id) => { const x = v.mapa[id]; return x ? x.nombre || TIPOS[x.tipo].nombre : '¿?'; };
const NEUTRAL = { c: '#78716c', e: '🏳️', nombre: 'Tierra libre', jugador: 'Neutrales' };
const reinoO = (v, id) => (id == null ? NEUTRAL : reinoDe(v, id) || NEUTRAL);
const plural = (n, s, p) => `${n} ${n === 1 ? s : p}`;

function Escudo({ r }) {
  return <span className="rnp-escudo chico" style={{ '--c': r.c }}>{r.e}</span>;
}

/** Cuántos soldados representa cada figura para que un grupo quepa. */
const escalaDe = (n) => Math.max(1, Math.ceil(n / MAX_FIG));

function Tropa({ grupo, color, muertas = 0, nuevas = 0, escala, invertir = false, muralla = 0 }) {
  const figs = Math.ceil(grupo / escala);
  return (
    <div className={`rnp-tropa${invertir ? ' inv' : ''}`}>
      {muralla > 0 && <span className="rnp-muro" title={`Muralla ${muralla}`}>{'🧱'.repeat(muralla)}</span>}
      {Array.from({ length: figs }, (_, i) => {
        const muerta = i >= figs - muertas;
        const nueva = i >= figs - nuevas;
        return <span key={i} className={`rnp-sold${muerta ? ' muere' : ''}${nueva ? ' nueva' : ''}`} style={{ '--c': color, '--i': nueva ? i - (figs - nuevas) : 0 }}>{muerta ? '💀' : '🪖'}</span>;
      })}
    </div>
  );
}

/** Animación de una batalla: cada «golpe» mata a un soldado de un bando, alternando según las bajas de cada uno. */
export function BatallaAnim({ v, d }) {
  const lados = useMemo(() => {
    const l = d.ataques.map((a) => ({ ...a, atacante: true }));
    if (d.defensa.inicial > 0 || d.defensa.reino != null) l.push({ ...d.defensa, atacante: false });
    return l;
  }, [d]);
  const escala = escalaDe(Math.max(...lados.map((x) => x.inicial), 1));
  // Orden de las muertes: por rondas, un soldado de cada lado que aún tenga bajas pendientes
  const orden = useMemo(() => {
    const pend = lados.map((x) => Math.ceil(x.muertos / escala));
    const o = [];
    while (pend.some((n) => n > 0)) pend.forEach((n, i) => { if (n > 0) { o.push(i); pend[i] -= 1; } });
    return o;
  }, [lados, escala]);
  const [paso, setPaso] = useState(0);
  const [vuelta, setVuelta] = useState(0);
  useEffect(() => {
    setPaso(0);
    if (!orden.length) return undefined;
    let k = 0;
    const t = setInterval(() => { k += 1; setPaso(k); if (k >= orden.length) clearInterval(t); }, Math.max(140, Math.min(420, 3600 / orden.length)));
    return () => clearInterval(t);
  }, [orden, vuelta]);
  const muertas = lados.map((_, i) => orden.slice(0, paso).filter((x) => x === i).length);
  const acabado = paso >= orden.length;
  const ataques = lados.filter((x) => x.atacante);
  const def = lados.find((x) => !x.atacante);
  return (
    <div className={`rnp-batalla${acabado ? ' fin' : ''}`}>
      <div className="rnp-campo">
        <div className="rnp-bando">
          {ataques.map((a) => {
            const i = lados.indexOf(a);
            const r = reinoO(v, a.reino);
            return (
              <div key={i} className="rnp-grupo">
                <p><Escudo r={r} /> <b>{r.jugador}</b> <small>⚔️ {a.inicial - Math.min(a.inicial, muertas[i] * escala)}/{a.inicial}</small></p>
                <Tropa grupo={a.inicial} color={r.c} muertas={muertas[i]} escala={escala} />
              </div>
            );
          })}
        </div>
        <span className="rnp-vs">⚔️</span>
        {def && (
          <div className="rnp-bando def">
            <div className="rnp-grupo">
              <p><Escudo r={reinoO(v, def.reino)} /> <b>{reinoO(v, def.reino).jugador}</b> <small>🛡️ {def.inicial - Math.min(def.inicial, muertas[lados.indexOf(def)] * escala)}/{def.inicial}</small></p>
              <Tropa grupo={def.inicial} color={reinoO(v, def.reino).c} muertas={muertas[lados.indexOf(def)]} escala={escala} invertir muralla={d.muralla} />
            </div>
          </div>
        )}
      </div>
      <div className="rnp-batalla-pie">
        {escala > 1 && <small>Cada 🪖 = {escala} soldados</small>}
        {acabado
          ? <button type="button" className="rnp-repetir" onClick={() => setVuelta((x) => x + 1)}>↻ Repetir</button>
          : <small className="rnp-luchando">¡Luchando!</small>}
      </div>
    </div>
  );
}

/** Animación de reclutamiento: los soldados nuevos llegan uno a uno a la tropa. */
export function EntrenoAnim({ v, d }) {
  const r = reinoO(v, d.reino);
  const escala = escalaDe(d.despues);
  const nuevas = Math.ceil(d.despues / escala) - Math.ceil(d.antes / escala);
  const [vuelta, setVuelta] = useState(0);
  return (
    <div className="rnp-entreno" key={vuelta}>
      <Tropa grupo={d.despues} color={r.c} nuevas={nuevas} escala={escala} />
      <div className="rnp-batalla-pie">
        <small>⚔️ {d.antes} → <b>{d.despues}</b> soldados{escala > 1 ? ` · cada 🪖 = ${escala}` : ''}</small>
        <button type="button" className="rnp-repetir" onClick={() => setVuelta((x) => x + 1)}>↻ Repetir</button>
      </div>
    </div>
  );
}

const RESULTADO = {
  cae: (v, d) => `🏴 Conquistado por ${reinoO(v, d.vencedor).jugador}`,
  resiste: () => '🛡️ La defensa resiste',
  empate: () => '⚔️ Choque igualado: nadie entra'
};

function TarjetaBatalla({ v, e, yo }) {
  const d = e.detalle;
  const x = v.mapa[d.territorio];
  const mia = e.implicados?.includes(yo);
  return (
    <article className={`rnp-hecho batalla ${d.resultado}${mia ? ' mia' : ''}`}>
      <header>
        <span className="rnp-hecho-icono">{TIPOS[x.tipo].e}</span>
        <div><strong>{nombreT(v, d.territorio)}</strong><small>{RESULTADO[d.resultado](v, d)}</small></div>
      </header>
      <BatallaAnim v={v} d={d} />
      <ul className="rnp-bajas">
        {[...d.ataques.map((a) => ({ ...a, rol: 'ataca' })), ...(d.defensa.inicial > 0 || d.defensa.reino != null ? [{ ...d.defensa, rol: 'defiende' }] : [])].map((l, i) => {
          const r = reinoO(v, l.reino);
          return (
            <li key={i} style={{ '--c': r.c }}>
              <Escudo r={r} /><span><b>{r.jugador}</b> {l.rol}</span>
              <em>⚔️ {l.inicial}</em><em className="m">💀 {l.muertos}</em><em className="q">✔ {l.inicial - l.muertos}</em>
            </li>
          );
        })}
      </ul>
      {d.resultado === 'cae' && <p className="rnp-hecho-nota">Se quedan {plural(d.quedan, 'soldado', 'soldados')} en {nombreT(v, d.territorio)}{d.botin ? ` · ¡botín de ${d.botin} 🪙!` : ''}.{d.ataques.length > 1 ? ' Los demás atacantes que sobreviven vuelven a casa.' : ''}</p>}
      {d.resultado === 'resiste' && <p className="rnp-hecho-nota">Un tercio de los atacantes supervivientes se retira a su territorio.</p>}
    </article>
  );
}

function TarjetaSimple({ v, e, yo }) {
  const d = e.detalle || {};
  const mia = e.implicados?.includes(yo);
  const icono = { entrenar: '🛡️', muralla: '🧱', mercado: '⚖️', intercambio: '⚖️', alianza: '🤝', romper: '💔', traicion: '🗡️', caida: '☠️' }[d.clase] || '📜';
  return (
    <article className={`rnp-hecho ${d.clase || 'otro'} ${e.tipo}${mia ? ' mia' : ''}`}>
      <header>
        <span className="rnp-hecho-icono">{icono}</span>
        <div><strong>{e.texto.replace(/^\S+\s/, '')}</strong></div>
      </header>
      {d.clase === 'entrenar' && <EntrenoAnim v={v} d={d} />}
    </article>
  );
}

/** La crónica de la ronda, agrupada: batallas, ejército y obras, diplomacia y comercio. */
export default function CronicaBonita({ v }) {
  const yo = v.yo?.id;
  const hechos = v.cronica.filter((e) => e.tipo !== 'titulo');
  const batallas = hechos.filter((e) => e.detalle?.clase === 'batalla');
  const ejercito = hechos.filter((e) => ['entrenar', 'muralla'].includes(e.detalle?.clase));
  const otros = hechos.filter((e) => !batallas.includes(e) && !ejercito.includes(e));
  const seccion = (titulo, lista, Comp) => lista.length > 0 && (
    <section className="rnp-seccion">
      <h3>{titulo}</h3>
      {lista.map((e) => <Comp key={e.n} v={v} e={e} yo={yo} />)}
    </section>
  );
  return (
    <div className="rnp-cronica-bonita">
      <div className="rnp-pergamino-cab"><span>📜</span><div><small>Crónica</small><strong>Ronda {v.ronda}</strong></div></div>
      {!hechos.length && <p className="rnp-tranquila">Una ronda tranquila: nadie se ha movido.</p>}
      {seccion('⚔️ Batallas', batallas, TarjetaBatalla)}
      {seccion('🛡️ Ejércitos y murallas', ejercito, TarjetaSimple)}
      {seccion('📜 Diplomacia, comercio y otros', otros, TarjetaSimple)}
    </div>
  );
}
