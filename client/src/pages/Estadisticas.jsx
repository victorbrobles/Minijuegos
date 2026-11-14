// client/src/pages/Estadisticas.jsx
// Estadísticas: primero las generales del mes (podios, juegos más jugados) y debajo las personales del jugador activo.
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { Podio } from '../components/SalonFama.jsx';
import { NombreTag } from '../components/Identidad.jsx';
import { nombreCompleto } from '../lib/identidad.js';
import { metaDe, CATEGORIAS_PORTADA } from '../games/meta.js';
import { conVictorias, LIMITES } from '../games/limites.js';
import '../components/SalonFama.css';
import './Estadisticas.css';

const MEDALLAS = ['🥇', '🥈', '🥉'];
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const num = (x) => (Number.isInteger(x) ? x : Math.round(x * 10) / 10).toLocaleString('es-ES');
const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
const plural = (n, uno, varios) => `${num(n)} ${n === 1 ? uno : varios}`;
const titulo = (id) => metaDe(id)?.titulo || id;
const fechaCorta = (t) => new Date(t).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
const unJugador = (id) => (LIMITES[id]?.min ?? 2) === 1;

function useJson(url) {
  const [d, setD] = useState(null);
  useEffect(() => {
    let vivo = true;
    if (!url) return undefined;
    fetch(url).then((r) => (r.ok ? r.json() : null)).then((x) => { if (vivo) setD(x || { error: true }); }).catch(() => vivo && setD({ error: true }));
    return () => { vivo = false; };
  }, [url]);
  return d;
}

function Bloque({ icono, titulo: t, sub, children }) {
  return (
    <section className="est-bloque">
      <h3><span className="slf-ico"><Icon name={icono} size={16} /></span>{t}{sub && <small>{sub}</small>}</h3>
      {children}
    </section>
  );
}

function Barras({ filas, total, unidad }) {
  const max = Math.max(1, ...filas.map((f) => f.n));
  return (
    <ol className="est-barras">
      {filas.map((f, i) => (
        <li key={f.clave}>
          <span className="est-barras-pos">{MEDALLAS[i] || `${i + 1}.`}</span>
          <div className="est-barras-cuerpo">
            <div className="est-barras-txt"><b>{f.texto}</b><small>{plural(f.n, unidad[0], unidad[1])}{total ? ` · ${pct(f.n, total)} %` : ''}</small></div>
            <span className="est-barra"><i style={{ width: `${(f.n / max) * 100}%` }} /></span>
          </div>
        </li>
      ))}
    </ol>
  );
}

function Generales({ d, mes }) {
  if (!d) return <p className="slf-vacio">Cargando…</p>;
  if (d.error) return <p className="slf-vacio">No se han podido cargar las estadísticas.</p>;
  return (
    <>
      <div className="est-cifras">
        <div><b>{num(d.totales.partidas)}</b><span>partidas en {mes}</span></div>
        <div><b>{num(d.totales.jugadores)}</b><span>jugadores activos</span></div>
      </div>
      <div className="est-podios">
        <Podio titulo="Más partidas jugadas" sub={`en ${mes}`} icono="gamepad" filas={d.partidas} unidad={['partida', 'partidas']} vacio="Aún nadie ha jugado este mes." />
        <Podio titulo="Más victorias" sub={`en ${mes}`} icono="crown" filas={d.victorias} unidad={['victoria', 'victorias']} vacio="Aún nadie ha ganado una partida este mes." />
      </div>
      {d.juegos.length > 0 && (
        <Bloque icono="chart" titulo="Juegos más jugados" sub={`en ${mes}`}>
          <Barras filas={d.juegos.map((j) => ({ clave: j.juego, texto: titulo(j.juego), n: j.n }))} total={d.totales.partidas} unidad={['partida', 'partidas']} />
        </Bloque>
      )}
    </>
  );
}

function Personales({ d, yo }) {
  if (!yo) return <p className="slf-vacio">Entra con tu nombre para ver tus estadísticas.</p>;
  if (!d) return <p className="slf-vacio">Cargando…</p>;
  if (d.error) return <p className="slf-vacio">No se han podido cargar tus estadísticas.</p>;
  if (!d.partidas) return <p className="slf-vacio">Todavía no tienes partidas registradas. ¡Juega alguna y vuelve por aquí!</p>;

  const competidos = d.juegos.filter((j) => conVictorias(j.juego) && j.multi > 0);
  const multi = competidos.reduce((a, j) => a + j.multi, 0);
  const ganadas = competidos.reduce((a, j) => a + j.ganadas, 0);
  const masJugados = [...d.juegos].sort((a, b) => b.partidas - a.partidas || b.ultima - a.ultima).slice(0, 3);
  const conRatio = competidos.filter((j) => j.multi >= 3).map((j) => ({ ...j, ratio: j.ganadas / j.multi }));
  const mejores = conRatio.filter((j) => j.ratio >= 0.5).sort((a, b) => b.ratio - a.ratio || b.multi - a.multi).slice(0, 3);
  const peores = conRatio.filter((j) => j.ratio < 0.5).sort((a, b) => a.ratio - b.ratio || b.multi - a.multi).slice(0, 3);
  const lista = (l, clase, vacio) => (l.length
    ? <ul>{l.map((j) => <li key={j.juego}><span>{titulo(j.juego)}</span><b className={clase}>{pct(j.ganadas, j.multi)} %</b><small>{j.ganadas}/{j.multi}</small></li>)}</ul>
    : <p className="slf-vacio">{vacio}</p>);
  const cats = new Map();
  d.juegos.forEach((j) => (metaDe(j.juego)?.categorias || []).filter((c) => c !== 'favoritos').forEach((c) => cats.set(c, (cats.get(c) || 0) + j.partidas)));
  const categorias = [...cats.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3)
    .map(([c, n]) => ({ clave: c, texto: CATEGORIAS_PORTADA.find((x) => x.id === c)?.titulo || c, n }));
  // Mejor puesto de cada juego en el top 3 histórico, primero los de un jugador
  const records = [];
  d.records.forEach((r) => { if (!records.some((x) => x.juego === r.juego)) records.push(r); });
  records.sort((a, b) => a.puesto - b.puesto || unJugador(b.juego) - unJugador(a.juego));
  const absolutos = records.filter((r) => r.puesto === 1).length;
  const diaFav = d.semana.indexOf(Math.max(...d.semana));

  return (
    <>
      <div className="est-cifras cuatro">
        <div><b>{num(d.partidas)}</b><span>partidas jugadas</span></div>
        <div><b>{num(ganadas)}</b><span>partidas ganadas</span></div>
        <div><b>{multi ? `${pct(ganadas, multi)} %` : '—'}</b><span>de victorias</span></div>
        <div><b>{num(absolutos)}</b><span>{absolutos === 1 ? 'récord absoluto' : 'récords absolutos'}</span></div>
      </div>
      <p className="est-nota">Las victorias cuentan en partidas de 2 o más jugadores con un ganador claro.</p>

      <div className="est-chips">
        <span>🎮 {plural(d.juegos.length, 'juego distinto', 'juegos distintos')}</span>
        <span>📅 {plural(d.dias, 'día jugado', 'días jugados')}</span>
        <span>🔥 Racha: {plural(d.racha.actual, 'día', 'días')} (mejor: {d.racha.mejor})</span>
        <span>🗓️ Este mes: {plural(d.partidasMes, 'partida', 'partidas')}</span>
        <span>💜 Tu día: el {DIAS[diaFav]}</span>
        {d.primera && <span>🌱 Jugando desde el {fechaCorta(d.primera)}</span>}
      </div>

      <Bloque icono="gamepad" titulo="Tus juegos más jugados">
        <Barras filas={masJugados.map((j) => ({ clave: j.juego, texto: titulo(j.juego), n: j.partidas }))} total={d.partidas} unidad={['partida', 'partidas']} />
      </Bloque>

      <Bloque icono="star" titulo="Tus categorías favoritas">
        <Barras filas={categorias} unidad={['partida', 'partidas']} />
      </Bloque>

      <Bloque icono="target" titulo="Dónde más ganas y dónde menos" sub="mín. 3 partidas">
        {conRatio.length ? (
          <div className="est-ratios">
            <div>
              <h4>💪 Tus fuertes</h4>
              {lista(mejores, 'bien', 'Ninguno por encima del 50 % todavía.')}
            </div>
            <div>
              <h4>🫠 Tus puntos flacos</h4>
              {lista(peores, 'mal', '¡Ninguno! Ganas al menos la mitad en todos.')}
            </div>
          </div>
        ) : <p className="slf-vacio">Juega al menos 3 partidas contra otros en un mismo juego para ver tu porcentaje.</p>}
      </Bloque>

      <Bloque icono="trophy" titulo="Tus récords" sub="top 3 histórico">
        {records.length ? (
          <ul className="est-records">
            {records.map((r) => (
              <li key={r.juego} className={`p${r.puesto}`}>
                <span className="slf-medalla">{MEDALLAS[r.puesto - 1]}</span>
                <span className="est-records-txt"><b>{titulo(r.juego)}</b><small>{r.puesto === 1 ? 'Récord absoluto' : `${r.puesto}.º mejor de siempre`} · {fechaCorta(r.fecha)}{unJugador(r.juego) ? ' · 1 jugador' : ''}</small></span>
                <b className="est-records-pts">{num(r.puntos)}</b>
              </li>
            ))}
          </ul>
        ) : <p className="slf-vacio">Aún no estás en el top 3 de ningún juego. ¡A por ello!</p>}
      </Bloque>

      {d.companeros.length > 0 && (
        <Bloque icono="users" titulo="Con quién más juegas">
          <ul className="est-companeros">
            {d.companeros.map((c, i) => <li key={c.jugador}><span>{MEDALLAS[i]}</span><NombreTag texto={c.jugador} /><small>{plural(c.n, 'partida', 'partidas')}</small></li>)}
          </ul>
        </Bloque>
      )}

      {d.reto && d.reto.intentos > 0 && (
        <Bloque icono="flame" titulo="Reto diario">
          <div className="est-cifras">
            <div><b>{d.reto.superados}/{d.reto.intentos}</b><span>retos superados</span></div>
            <div><b>{d.reto.racha.actual}</b><span>de racha (mejor: {d.reto.racha.mejor})</span></div>
          </div>
        </Bloque>
      )}
    </>
  );
}

export default function Estadisticas() {
  const yo = nombreCompleto();
  const generales = useJson('/api/registros/mes');
  const mias = useJson(yo ? `/api/registros/jugador?nombre=${encodeURIComponent(yo)}` : null);
  const mes = new Date().toLocaleDateString('es-ES', { month: 'long', timeZone: 'Europe/Madrid' });
  return (
    <div className="game-shell est-pagina">
      <Link to="/" className="back" aria-label="Volver a la portada"><Icon name="arrowLeft" size={20} strokeWidth={2.5} /><span>Portada</span></Link>
      <header className="est-cab">
        <span className="est-cab-ico">📊</span>
        <div><p>Minigames Hub</p><h1>Estadísticas</h1></div>
      </header>
      <section className="est-tarjeta">
        <h2>🏆 Los mejores de {mes}</h2>
        <Generales d={generales} mes={mes} />
      </section>
      <section className="est-tarjeta">
        <h2>👤 Tus estadísticas {yo && <NombreTag texto={yo} className="est-yo" />}</h2>
        <Personales d={mias} yo={yo} />
      </section>
    </div>
  );
}
