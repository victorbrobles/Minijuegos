// client/src/games/MusAvanzado/Partida.jsx
// Pantallas de «Mus Avanzado» (online y en un dispositivo) con las piezas comunes de ../Pulsador.
import React, { useEffect, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import { Hero, Cuenta, useRestante, Pildoras, PantallaFin, colorDe } from '../Pulsador/Vistas.jsx';
import { BloqueConfig } from '../../components/MenuJuego.jsx';
import { CATEGORIAS, ORDEN_CATEGORIAS, ESPECIALES, OPCIONES } from './engine.js';
import './MusAvanzado.css';
import CartaEspanola from '../../components/CartaEspanola.jsx';

const HERO = { emoji: '🂡' };
const nombreDe = (v, id) => v.jugadores.find((j) => j.id === id)?.nombre ?? '¿?';
const bandoDe = (v, bid) => v.bandos.find((b) => b.id === bid);
/** Nombre de un bando: el jugador o «Ana y Luis». */
export const nombreBando = (v, bid) => (bandoDe(v, bid)?.miembros || []).map((m) => nombreDe(v, m)).join(' y ') || '¿?';
const colorBando = (v, bid) => colorDe(bandoDe(v, bid)?.miembros[0] ?? bid);
const ESPECIAL = { comodin: { e: '🃏', t: 'Comodín' }, bomba: { e: '💣', t: 'Bomba' }, espejo: { e: '🪞', t: 'Espejo' }, doble: { e: '✌️', t: 'Doble' }, mutante: { e: '🧬', t: 'Mutante' } };

export function Carta({ c, sel, onClick, chica }) {
  const esp = ESPECIAL[c.esp];
  const sinValor = c.esp === 'comodin' || c.esp === 'bomba' || c.esp === 'espejo';
  return (
    <CartaEspanola c={sinValor ? null : { p: c.p, n: c.n }} sel={sel} chica={chica} onClick={onClick || undefined}
      especial={sinValor ? { ...esp, clase: c.esp } : null} marca={!sinValor && esp ? esp : null} />
  );
}
function Mano({ cartas, sel = [], onToggle, chica }) {
  return <div className={`mav-mano${chica ? ' chica' : ''}`}>{cartas.map((c) => <Carta key={c.id} c={c} chica={chica} sel={sel.includes(c.id)} onClick={onToggle ? () => onToggle(c.id) : null} />)}</div>;
}

// ---------- Categorías de la mano (tira de arriba)
const RESULTADO = (c) => (c ? { paso: 'en paso', querido: `${c.total} querido`, rechazado: 'no querido', ordago: 'órdago' }[c.tipo] : '');
function Tira({ v }) {
  return (
    <ol className="mav-tira">
      {v.categorias.map((k, i) => {
        const c = v.cerradas[i];
        const actual = i === v.idx && (v.fase === 'cambio' || v.fase === 'apuestas');
        return (
          <li key={k} className={`${actual ? 'actual' : ''}${c ? ' hecha' : ''}`}>
            <span>{CATEGORIAS[k].e}</span><b>{CATEGORIAS[k].nombre}</b><small>{actual ? 'ahora' : RESULTADO(c)}</small>
          </li>
        );
      })}
    </ol>
  );
}

function Categoria({ v }) {
  const c = v.categoria;
  if (!c) return null;
  return (
    <div className="mav-categoria">
      <span className="mav-cat-e">{c.e}</span>
      <div>
        <strong>{c.nombre}</strong>
        <p>{c.desc}</p>
        <p className="mav-cat-extra">⭐ {c.extras}</p>
      </div>
    </div>
  );
}

/** Lo que llevas ahora en cada categoría que queda (para decidir qué te guardas). */
function MisJugadas({ v }) {
  if (!v.yo) return null;
  return (
    <div className="mav-jugadas">
      <p>Con esta mano llevas…</p>
      <ul>
        {v.categorias.map((k, i) => (i < v.idx ? null : (
          <li key={k} className={i === v.idx ? 'actual' : ''}><span>{CATEGORIAS[k].e} {CATEGORIAS[k].nombre}</span><b>{v.yo.jugadas[k]}</b></li>
        )))}
      </ul>
    </div>
  );
}

// ---------- Cambio de cartas
function Cambio({ v, enviar }) {
  const [sel, setSel] = useState([]);
  const yo = v.yo;
  const pendientes = v.jugadores.filter((j) => !j.fuera && j.cambio === null).map((j) => j.nombre);
  if (yo.cambio !== null) {
    return (
      <>
        <Mano cartas={yo.mano} />
        <MisJugadas v={v} />
        <p className="mav-espera">✓ Has cambiado {yo.cambio} {yo.cambio === 1 ? 'carta' : 'cartas'}. Esperando a: {pendientes.join(', ')}</p>
      </>
    );
  }
  const toggle = (id) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const ultima = v.idx === v.categorias.length - 1;
  return (
    <>
      <Mano cartas={yo.mano} sel={sel} onToggle={toggle} />
      <p className="mav-nota">Toca las cartas que tiras (de 0 a 5). {ultima ? 'Es la última categoría de la mano.' : 'Las que te quedes seguirán contigo en la siguiente categoría.'}</p>
      <MisJugadas v={v} />
      <button type="button" className="pzp-boton grande" onClick={() => { enviar('cambiar', { ids: sel }); setSel([]); }}>
        <Icon name="refresh" size={20} /> {sel.length ? `Tirar ${sel.length} y robar` : 'Me quedo con estas'}
      </button>
    </>
  );
}

// ---------- Apuestas
function Mesa({ v }) {
  const L = v.lance;
  const a = L.apuesta;
  const ultima = (bid) => [...L.voces].reverse().find((x) => x.bando === bid);
  return (
    <div className="mav-tapete">
      <div className="mav-envite">
        {a ? (
          <span className={`mav-envite-caja${a.ordago ? ' ordago' : ''}`} style={{ '--c': colorBando(v, a.por) }}>
            <small>{CATEGORIAS[L.cat].e} {CATEGORIAS[L.cat].nombre}</small>
            <strong>{a.ordago ? '🔥 ¡Órdago!' : `Envite: ${a.total}`}</strong>
            <em>de {nombreDe(v, a.porJugador)}</em>
          </span>
        ) : (
          <span className="mav-envite-caja vacia"><small>{CATEGORIAS[L.cat].e} {CATEGORIAS[L.cat].nombre}</small><strong>Sin envite</strong><em>se puede pasar o envidar</em></span>
        )}
      </div>
      <ul className="mav-asientos">
        {v.bandos.filter((b) => b.miembros.some((m) => !v.jugadores.find((j) => j.id === m).fuera)).map((b) => {
          const turno = L.turno === b.id;
          const voz = ultima(b.id);
          const fuera = !L.activos.includes(b.id);
          return (
            <li key={b.id} className={`${turno ? 'turno' : ''}${fuera ? ' retirado' : ''}${v.yo?.bando === b.id ? ' yo' : ''}`} style={{ '--c': colorBando(v, b.id) }}>
              <span className="mav-asiento-avatares">{b.miembros.map((m) => <i key={m} style={{ background: colorDe(m) }}>{nombreDe(v, m).charAt(0).toUpperCase()}</i>)}</span>
              <span className="mav-asiento-nombre">{nombreBando(v, b.id)}{b.miembros.includes(v.mano) && <b className="mav-mano-m" title="Es mano">M</b>}</span>
              <span className="mav-asiento-puntos">{b.puntos}</span>
              {turno ? <span className="mav-voz habla">🗣️ Le toca</span> : voz ? <span className={`mav-voz ${voz.clase}`}>{voz.texto}</span> : <span className="mav-voz nada">—</span>}
            </li>
          );
        })}
      </ul>
      {L.voces.length > 0 && (
        <ol className="mav-voces">
          {L.voces.map((x, i) => <li key={i} className={x.clase}><b style={{ color: colorDe(x.id) }}>{nombreDe(v, x.id)}</b> {x.texto}</li>)}
        </ol>
      )}
    </div>
  );
}

function Acciones({ v, enviar }) {
  const a = v.lance.apuesta;
  const [n, setN] = useState(2);
  useEffect(() => { setN(a ? 2 : 2); }, [a?.total, a?.ordago]);
  const tope = v.objetivo;
  const nom = CATEGORIAS[v.lance.cat].nombre.toLowerCase();
  const hablar = (accion, cantidad) => enviar('hablar', { accion, cantidad });
  return (
    <div className="mav-acciones">
      <p className="mav-pregunta">
        {!a ? `¿Envidas a ${nom}?` : a.ordago ? `¡Órdago a ${nom}! ¿Lo quieres?` : `Hay ${a.total} a ${nom}. ¿Lo quieres?`}
      </p>
      <div className="mav-dos">
        {!a ? (
          <>
            <button type="button" className="pzp-boton secundario" onClick={() => hablar('paso')}>Paso</button>
            <button type="button" className="pzp-boton" onClick={() => hablar('envido', 2)}>Envido 2</button>
          </>
        ) : (
          <>
            <button type="button" className="pzp-boton" onClick={() => hablar('quiero')}>Quiero</button>
            <button type="button" className="pzp-boton secundario" onClick={() => hablar('noquiero')}>No quiero</button>
          </>
        )}
      </div>
      {!a?.ordago && (
        <div className="mav-subir">
          <button type="button" className="mav-paso" onClick={() => setN((x) => Math.max(a ? 1 : 2, x - 1))}>−</button>
          <button type="button" className="pzp-boton secundario" onClick={() => hablar('envido', n)}>{a ? `${n} más (${a.total + n})` : `Envido ${n}`}</button>
          <button type="button" className="mav-paso" onClick={() => setN((x) => Math.min(tope, x + 1))}>+</button>
          <button type="button" className="pzp-boton peligro" onClick={() => hablar('ordago')}>Órdago</button>
        </div>
      )}
      {a && !a.ordago && <p className="mav-nota-osc">Si nadie quiere, {nombreDe(v, a.porJugador)} se lleva {a.previo}. Un órdago querido lo gana quien tenga la mejor jugada… y con él, la partida.</p>}
    </div>
  );
}

// ---------- Conteo
const ETIQUETA = (l) => ({ paso: 'En paso', querido: `Envite querido de ${l.total}`, rechazado: 'No querido', ordago: '🔥 Órdago querido' }[l.tipo]);
function Duelo({ v, l }) {
  const quienes = l.participantes;
  const g = quienes.find((x) => x.id === l.ganador);
  const resto = quienes.filter((x) => x.id !== l.ganador);
  return (
    <div className="mav-duelo">
      {[g, ...resto].filter(Boolean).map((x) => (
        <div key={x.id} className={`mav-duelo-fila${x.id === l.ganador ? ' gana' : ''}${x.id === l.rival ? ' rival' : ''}`} style={{ '--c': colorBando(v, x.bando) }}>
          <p className="mav-duelo-nombre">{x.id === l.ganador ? '🏆 ' : ''}{nombreDe(v, x.id)}</p>
          <Mano cartas={x.cartas} chica />
          <p className="mav-duelo-jugada">{x.jugada}</p>
        </div>
      ))}
    </div>
  );
}
function Puntuaciones({ v, enviar, admin, final = false }) {
  const res = v.resumen || [];
  const totales = v.bandos.map((b) => ({ id: b.id, n: res.reduce((a, l) => a + (l.puntos[b.id] || 0), 0) + v.bombas.filter((x) => x.bando === b.id).reduce((a, x) => a + x.puntos, 0) }));
  return (
    <div className="mav-conteo">
      <div className="mav-conteo-cab">
        <p>Mano {v.numMano}</p>
        <h2>📊 Así ha ido la mano</h2>
      </div>
      {v.ganador != null && <p className="mav-banner">🏆 ¡{nombreBando(v, v.ganador)} {bandoDe(v, v.ganador).miembros.length > 1 ? 'ganan' : 'gana'} la partida!</p>}
      {res.map((l) => (
        <article key={l.cat} className={`mav-lance ${l.tipo}`} style={{ '--c': colorBando(v, v.jugadores.find((j) => j.id === l.ganador)?.bando) }}>
          <header>
            <span className="mav-lance-e">{CATEGORIAS[l.cat].e}</span>
            <h3>{CATEGORIAS[l.cat].nombre}</h3>
            <span className={`mav-lance-tipo ${l.tipo}`}>{ETIQUETA(l)}</span>
          </header>
          {l.voces.length > 0 && <ol className="mav-voces">{l.voces.map((x, i) => <li key={i} className={x.clase}><b style={{ color: colorDe(x.id) }}>{nombreDe(v, x.id)}</b> {x.texto}</li>)}</ol>}
          {l.tipo === 'rechazado' ? <p className="mav-nadie">Nadie quiso: {nombreDe(v, l.porJugador)} gana sin enseñar más que sus extras.</p> : null}
          <Duelo v={v} l={l} />
          {l.cobros.length > 0 ? (
            <ul className="mav-desglose">
              {l.cobros.map((c, i) => (
                <li key={i} style={{ '--c': colorBando(v, c.bando) }}>
                  <b>{c.puntos == null ? '🏆' : `+${c.puntos}`}</b>
                  <span>{c.texto}{c.jugador != null ? ` · ${nombreDe(v, c.jugador)}` : ''}</span>
                  <em>{nombreBando(v, c.bando)}</em>
                </li>
              ))}
            </ul>
          ) : <p className="mav-nadie">{v.ganador != null && l.tipo !== 'ordago' ? 'No se llegó a cobrar: la partida ya estaba ganada.' : 'Sin puntos.'}</p>}
        </article>
      ))}
      {v.bombas.length > 0 && (
        <article className="mav-lance bomba">
          <header><span className="mav-lance-e">💣</span><h3>Bombas</h3></header>
          <ul className="mav-desglose">{v.bombas.map((c, i) => <li key={i} style={{ '--c': '#dc2626' }}><b>{c.puntos}</b><span>bomba en la mano · {nombreDe(v, c.jugador)}</span></li>)}</ul>
        </article>
      )}
      <div className="mav-totales">
        <p>En esta mano</p>
        <ul>
          {totales.map((t) => (
            <li key={t.id} style={{ '--c': colorBando(v, t.id) }}>
              <span>{nombreBando(v, t.id)}</span><b>{t.n > 0 ? '+' : ''}{t.n}</b><small>{bandoDe(v, t.id).puntos}/{v.objetivo}</small>
            </li>
          ))}
        </ul>
      </div>
      {!final && (
        <div className="pzp-barra estatica">
          {admin ? (
            <>
              <button type="button" className="pzp-boton grande" onClick={() => enviar('siguiente')}>
                <Icon name="play" size={20} /> {v.ganador != null ? 'Ver resultado final' : 'Siguiente mano'}
              </button>
              {v.ganador == null && <button type="button" className="pzp-enlace" onClick={() => enviar('terminar')}>Terminar la partida ya</button>}
            </>
          ) : <p className="pzp-esperando">⏳ El anfitrión repartirá la siguiente mano…</p>}
        </div>
      )}
    </div>
  );
}

export function Partida({ v, enviar, offset = 0, onSalir, local = false, admin = true }) {
  const restante = useRestante(v.hasta, offset);
  const habla = v.habla;
  const puedo = v.fase === 'apuestas' && v.yo && (local ? habla === v.yo.id : v.lance.turno === v.yo.bando);
  const chip = `🂡 Mano ${v.numMano}`;
  const cat = v.categoria;
  const turnoTxt = v.lance ? nombreBando(v, v.lance.turno) : '';
  const titulos = {
    cambio: `${cat?.e} ${cat?.nombre}: cambia cartas`,
    apuestas: puedo ? '¡Te toca hablar!' : `Habla ${turnoTxt}`,
    conteo: v.ganador != null ? '¡Partida decidida!' : 'Fin de la mano'
  };
  const etiqueta = `${v.modo === 'parejas' && v.yo ? `Vas con ${nombreDe(v, v.yo.companero)} · ` : ''}A ${v.objetivo} puntos · categoría ${Math.min(v.idx + 1, v.categorias.length)}/${v.categorias.length}`;
  return (
    <>
      <Hero v={v} juego={HERO} onSalir={onSalir} chip={chip} etiqueta={etiqueta} titulo={titulos[v.fase]} turno={habla ?? undefined} />
      {v.hasta && <Cuenta ms={restante} total={v.segundos * 1000} />}
      {v.fase !== 'conteo' && <Tira v={v} />}
      {v.fase === 'cambio' && <Categoria v={v} />}
      {v.fase === 'cambio' && v.yo && <Cambio key={`${v.numMano}-${v.idx}-${v.yo.id}`} v={v} enviar={enviar} />}
      {v.fase === 'cambio' && !v.yo && <p className="mav-espera">⏳ Cada jugador está cambiando cartas…</p>}
      {v.fase === 'apuestas' && (
        <>
          <Mesa v={v} />
          {v.yo && <Mano cartas={v.yo.mano} />}
          {v.yo && <p className="mav-info">{cat.e} Llevas: <b>{v.yo.jugadas[cat.id]}</b></p>}
          {puedo ? <Acciones key={`${v.idx}-${v.lance.voces.length}`} v={v} enviar={enviar} />
            : <p className="mav-espera">⏳ {v.modo === 'parejas' && v.yo && v.lance.turno === v.yo.bando ? `Habla tu compañero ${nombreDe(v, v.yo.companero)}…` : `Habla ${turnoTxt}…`}</p>}
        </>
      )}
      {v.fase === 'conteo' && <Puntuaciones v={v} enviar={enviar} admin={admin} />}
    </>
  );
}

export function PartidaOnline({ v, sala, enviar, offset, onSalir }) {
  return <Partida v={v} enviar={enviar} offset={offset} onSalir={onSalir} admin={sala.esAdmin} />;
}

export function Fin({ v, juego, onSalir, children }) {
  return (
    <PantallaFin v={v} juego={juego} onSalir={onSalir}>
      {v.resumen?.length > 0 && (
        <details className="pzp-tarjeta mav-ultima">
          <summary>🂠 La última mano</summary>
          <Puntuaciones v={v} enviar={() => {}} final />
        </details>
      )}
      {children}
    </PantallaFin>
  );
}

function Interruptor({ on, e, nombre, desc, onClick }) {
  return (
    <button type="button" className={`mav-opcion${on ? ' on' : ''}`} onClick={onClick} disabled={!onClick} aria-pressed={on}>
      <span className="mav-opcion-e">{e}</span>
      <span className="mav-opcion-txt"><b>{nombre}</b><small>{desc}</small></span>
      <span className="mav-opcion-check">{on ? '✓' : ''}</span>
    </button>
  );
}

/** Lo configura el anfitrión (o quien prepara la partida en un móvil): modo, puntos, categorías y cartas especiales. */
export function Config({ config, onCambiar }) {
  const cats = config.categorias || ORDEN_CATEGORIAS;
  const esp = config.especiales || {};
  const tocarCat = (k) => {
    const nuevas = cats.includes(k) ? cats.filter((x) => x !== k) : ORDEN_CATEGORIAS.filter((x) => x === k || cats.includes(x));
    if (nuevas.length >= 3) onCambiar({ categorias: nuevas });
  };
  return (
    <>
      <BloqueConfig titulo="Modo">
        <Pildoras opciones={[['individual', '👤 Individual (4-8)'], ['parejas', '👥 Parejas (4 o 6)']]} valor={config.modo} onCambiar={onCambiar && ((modo) => onCambiar({ modo }))} />
      </BloqueConfig>
      <BloqueConfig titulo="Se juega a">
        <Pildoras opciones={OPCIONES.objetivo.map((n) => [n, `${n} puntos`])} valor={config.objetivo} onCambiar={onCambiar && ((objetivo) => onCambiar({ objetivo }))} />
      </BloqueConfig>
      <BloqueConfig titulo={`Categorías (${cats.length}, mínimo 3)`}>
        <div className="mav-opciones">
          {ORDEN_CATEGORIAS.map((k) => <Interruptor key={k} e={CATEGORIAS[k].e} nombre={CATEGORIAS[k].nombre} desc={CATEGORIAS[k].extras} on={cats.includes(k)} onClick={onCambiar && (() => tocarCat(k))} />)}
        </div>
      </BloqueConfig>
      <BloqueConfig titulo="Cartas especiales (opcional)">
        <div className="mav-opciones">
          {Object.entries(ESPECIALES).map(([k, m]) => <Interruptor key={k} {...m} on={Boolean(esp[k])} onClick={onCambiar && (() => onCambiar({ especiales: { ...esp, [k]: !esp[k] } }))} />)}
        </div>
      </BloqueConfig>
    </>
  );
}
