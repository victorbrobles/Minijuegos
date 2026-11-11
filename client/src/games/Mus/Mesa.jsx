// client/src/games/Mus/Mesa.jsx
// Mesa del Mus (online y contra la máquina): tus cartas abajo, tu pareja arriba y los rivales a los lados.
import React, { useEffect, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import { Pildoras } from '../Pulsador/Vistas.jsx';
import { BloqueConfig } from '../../components/MenuJuego.jsx';
import { NOMBRE_LANCE, OPCIONES, jugadaDe } from './engine.js';
import './Mus.css';
import CartaEspanola from '../../components/CartaEspanola.jsx';

/** Carta española (dibujo común con el Mus Avanzado): números 1-7, 10, 11 y 12. */
export function CartaEsp({ c, sel = false, onClick, chica = false, oculta = false }) {
  return <CartaEspanola c={c} sel={sel} onClick={onClick} chica={chica} oculta={oculta || !c} className="msp-carta-esp" />;
}

const rel = (v, s) => (s - (v.yo?.asiento ?? 0) + 4) % 4; // 0 yo, 1 derecha, 2 compañero, 3 izquierda
const POS = ['abajo', 'derecha', 'arriba', 'izquierda'];
const limpio = (n) => n.replace(' 🤖', '');
const nomDe = (v, s) => (v.yo && v.yo.asiento === s ? 'Tú' : limpio(v.jugadores[s].nombre));
const esNos = (v, k) => k === (v.yo?.pareja ?? 0);
const equipo = (v, k) => (esNos(v, k) ? 'Nosotros' : 'Ellos');
const ICONO = { grande: '👑', chica: '🐭', pares: '👯', juego: '🎯', punto: '🎯' };

function Asiento({ v, j }) {
  const r = rel(v, j.asiento);
  const nuestro = esNos(v, j.pareja);
  const turno = v.turno === j.asiento;
  const decl = v.declaraciones?.find((d) => d.asiento === j.asiento);
  const lance = v.lance?.nombre;
  return (
    <div className={`msp-asiento ${POS[r]}${turno ? ' turno' : ''}${nuestro ? ' nos' : ' ellos'}`}>
      <div className="msp-asiento-cab">
        <span className="msp-avatar">{j.bot ? '🤖' : j.nombre.charAt(0).toUpperCase()}</span>
        <span className="msp-asiento-nombre">{r === 0 ? 'Tú' : limpio(j.nombre)}</span>
        {v.mano === j.asiento && <b className="msp-mano" title="Es mano">M</b>}
      </div>
      {r !== 0 && (
        <div className="msp-mini-cartas">
          {j.cartas ? j.cartas.map((c) => <CartaEsp key={c.id} c={c} chica />) : Array.from({ length: j.nCartas }, (_, k) => <CartaEsp key={k} oculta chica />)}
        </div>
      )}
      <div className="msp-asiento-pie">
        {turno && !j.dicho && <span className="msp-habla">🗣️ Le toca</span>}
        {j.dicho && <span key={j.dichoN} className={`msp-voz ${j.dichoClase || 'info'}`}>{j.dicho}</span>}
        {decl && (lance === 'pares' || lance === 'juego' || lance === 'punto') && (
          <span className="msp-decl">{lance === 'pares' ? (decl.pares ? '✓ Pares' : '✗ Pares') : (decl.juego ? '✓ Juego' : '✗ Juego')}</span>
        )}
        {j.descartado != null && <span className="msp-decl">{j.descartado ? '✓ Descartado' : '…descartando'}</span>}
      </div>
    </div>
  );
}

function Marcador({ v, onSalir }) {
  const nos = v.yo?.pareja ?? 0;
  return (
    <header className="msp-marcador">
      <button type="button" className="pzp-salir" onClick={onSalir}><Icon name="door" size={15} /> Salir</button>
      <div className="msp-tanteo">
        <span className="nos"><small>Nosotros</small><strong>{v.puntos[nos]}</strong>{v.vacas > 1 && <em>{v.juegos[nos]} {v.juegos[nos] === 1 ? 'juego' : 'juegos'}</em>}</span>
        <span className="msp-a">a {v.objetivo}</span>
        <span className="ellos"><small>Ellos</small><strong>{v.puntos[1 - nos]}</strong>{v.vacas > 1 && <em>{v.juegos[1 - nos]} {v.juegos[1 - nos] === 1 ? 'juego' : 'juegos'}</em>}</span>
      </div>
      <span className="pzp-chip">🂠 Mano {v.numMano}</span>
    </header>
  );
}

function Lances({ v }) {
  const actual = v.lance?.nombre;
  const lista = ['grande', 'chica', 'pares', actual === 'punto' || v.resultados.punto ? 'punto' : 'juego'];
  const texto = (l) => {
    const r = v.resultados[l];
    if (!r) return l === actual ? 'ahora' : '';
    return { paso: 'en paso', querido: `${r.total} querido`, rechazado: 'no querido', solo: 'una pareja', nadie: 'nadie', ordago: 'órdago' }[r.tipo];
  };
  return (
    <ol className="msp-lances">
      {lista.map((l) => (
        <li key={l} className={`${l === actual ? 'actual' : ''}${v.resultados[l] ? ' hecho' : ''}`}>
          <strong>{ICONO[l]} {NOMBRE_LANCE[l]}</strong><small>{texto(l)}</small>
        </li>
      ))}
    </ol>
  );
}

/** Lo que se ha dicho en un lance, en orden: «Tú: Paso › Paco: Envido 2 › …». */
function Voces({ v, voces, vacio = null }) {
  if (!voces?.length) return vacio;
  return (
    <ol className="msp-voces">
      {voces.map((x, i) => (
        <li key={i} className={`${x.clase} ${esNos(v, x.s % 2) ? 'nos' : 'ellos'}`}><b>{nomDe(v, x.s)}</b> {x.texto}</li>
      ))}
    </ol>
  );
}

function Acciones({ v, enviar, sel, setSel }) {
  const mio = v.yo && v.turno === v.yo.asiento;
  const [subir, setSubir] = useState(2);
  useEffect(() => { setSubir(2); }, [v.lance?.nombre, v.lance?.propuesta?.total]);
  const yoJ = v.yo ? v.jugadores[v.yo.asiento] : null;

  if (v.fase === 'mus') {
    if (!mio) return <p className="msp-espera">⏳ Habla {nomDe(v, v.turno)}…</p>;
    return (
      <div className="msp-acciones">
        <p className="msp-pregunta">¿Quieres mus?</p>
        <div className="pzp-dos">
          <button type="button" className="pzp-boton" onClick={() => enviar('mus', { pide: true })}>🔄 Mus</button>
          <button type="button" className="pzp-boton secundario" onClick={() => enviar('mus', { pide: false })}>✋ No hay mus</button>
        </div>
      </div>
    );
  }
  if (v.fase === 'descarte') {
    if (yoJ?.descartado) return <p className="msp-espera">⏳ Esperando a que descarten los demás…</p>;
    return (
      <div className="msp-acciones">
        <p className="msp-pregunta">Toca las cartas que tiras ({sel.length})</p>
        <button type="button" className="pzp-boton" disabled={!sel.length} onClick={() => { enviar('descartar', { ids: sel }); setSel([]); }}>
          Me descarto de {sel.length || '…'}
        </button>
      </div>
    );
  }
  if (v.fase === 'lance') {
    const L = v.lance;
    const pr = L.propuesta;
    if (!mio) {
      return <p className="msp-espera">⏳ {v.turno != null ? `Habla ${nomDe(v, v.turno)}` : 'Esperando'}…</p>;
    }
    const nom = NOMBRE_LANCE[L.nombre].toLowerCase();
    return (
      <div className="msp-acciones">
        <p className="msp-pregunta">
          {pr ? (pr.ordago ? `¡Órdago a la ${nom}! ¿Lo quieres?` : `Te envidan ${pr.total} a la ${nom}`) : `¿Envidas a la ${nom}?`}
        </p>
        {pr ? (
          <div className="pzp-dos">
            <button type="button" className="pzp-boton" onClick={() => enviar('hablar', { accion: 'quiero' })}>Quiero</button>
            <button type="button" className="pzp-boton secundario" onClick={() => enviar('hablar', { accion: 'noquiero' })}>No quiero</button>
          </div>
        ) : (
          <div className="pzp-dos">
            <button type="button" className="pzp-boton secundario" onClick={() => enviar('hablar', { accion: 'paso' })}>Paso</button>
            <button type="button" className="pzp-boton" onClick={() => enviar('hablar', { accion: 'envido', cantidad: 2 })}>Envido</button>
          </div>
        )}
        {!pr?.ordago && (
          <div className="msp-subir">
            <button type="button" className="msp-paso" onClick={() => setSubir((x) => Math.max(2, x - 1))}>−</button>
            <button type="button" className="pzp-boton secundario" onClick={() => enviar('hablar', { accion: 'envido', cantidad: subir })}>{pr ? `${subir} más` : `Envido ${subir}`}</button>
            <button type="button" className="msp-paso" onClick={() => setSubir((x) => Math.min(30, x + 1))}>+</button>
            <button type="button" className="pzp-boton peligro msp-ordago" onClick={() => enviar('hablar', { accion: 'ordago' })}>Órdago</button>
          </div>
        )}
      </div>
    );
  }
  return null;
}

/** Qué lleva cada uno en pares y juego/punto (chips del destape). */
function Jugadas({ cartas, conPunto }) {
  const pares = jugadaDe('pares', cartas);
  const juego = jugadaDe(conPunto ? 'punto' : 'juego', cartas);
  return (
    <div className="msp-jugadas">
      <span className={pares === 'Sin pares' ? 'no' : ''}>{pares}</span>
      <span className={juego.startsWith('Sin') ? 'no' : ''}>{juego}</span>
    </div>
  );
}

/** Banner de juego ganado / órdago, común al destape y a las puntuaciones. */
function Aviso({ v }) {
  const c = v.conteo || {};
  return (
    <>
      {c.ordago && <p className="msp-banner ordago">🔥 Órdago a la {NOMBRE_LANCE[c.ordago.lance].toLowerCase()}: lo gana {nomDe(v, c.ordago.ganador)} ({equipo(v, c.ordago.ganador % 2)})</p>}
      {c.juegoPara != null && <p className="msp-banner">🏆 ¡Juego para {equipo(v, c.juegoPara)}!</p>}
    </>
  );
}

/** Paso 1 del conteo: las cartas de los cuatro boca arriba, por parejas. */
function Destape({ v, enviar, anfitrion }) {
  const nos = v.yo?.pareja ?? 0;
  const conPunto = Boolean(v.resultados.punto);
  const orden = [0, 1, 2, 3].map((k) => (v.mano + k) % 4);
  return (
    <div className="msp-destape">
      <div className="msp-destape-cab">
        <p className="pzp-etiqueta">Fin de la mano {v.numMano}</p>
        <h2>🂠 Cartas boca arriba</h2>
      </div>
      <Aviso v={v} />
      {[nos, 1 - nos].map((k) => (
        <section key={k} className={`msp-equipo ${k === nos ? 'nos' : 'ellos'}`}>
          <h3>{k === nos ? 'Nosotros' : 'Ellos'}</h3>
          {orden.filter((s) => s % 2 === k).map((s) => {
            const j = v.jugadores[s];
            return (
              <div key={s} className="msp-destape-fila">
                <div className="msp-destape-quien">
                  <span className="msp-avatar">{j.bot ? '🤖' : j.nombre.charAt(0).toUpperCase()}</span>
                  <b>{nomDe(v, s)}</b>
                  {v.mano === s && <b className="msp-mano" title="Es mano">M</b>}
                </div>
                <div className="msp-destape-cartas">{(j.cartas || []).map((c) => <CartaEsp key={c.id} c={c} />)}</div>
                <Jugadas cartas={j.cartas || []} conPunto={conPunto} />
              </div>
            );
          })}
        </section>
      ))}
      {anfitrion
        ? <button type="button" className="pzp-boton grande" onClick={() => enviar('verPuntos')}>📊 Ver puntuaciones</button>
        : <p className="msp-espera">⏳ El anfitrión enseñará las puntuaciones enseguida…</p>}
    </div>
  );
}

const ETIQUETA = (r) => ({
  paso: 'En paso', querido: `Envite querido de ${r.total}`, rechazado: 'No querido', solo: 'Solo una pareja', nadie: 'Nadie tiene', ordago: '🔥 Órdago querido'
}[r.tipo] || 'No se jugó');

function Mano({ v, s, gana, jugada, conPremio }) {
  const k = s % 2;
  return (
    <div className={`msp-duelo-lado ${esNos(v, k) ? 'nos' : 'ellos'}${gana ? ' gana' : ''}`}>
      <p className="msp-duelo-nombre">{gana && <span aria-label="Gana">🏆</span>} {nomDe(v, s)}</p>
      <div className="msp-duelo-cartas">{(v.jugadores[s].cartas || []).map((c) => <CartaEsp key={c.id} c={c} chica />)}</div>
      <p className="msp-duelo-jugada">{jugada}</p>
      {conPremio && <small>{equipo(v, k)}</small>}
    </div>
  );
}

/** Paso 2 del conteo: una tarjeta por lance con el duelo, quién ganó y el desglose de puntos. */
function Puntuaciones({ v, enviar, puedeForzar }) {
  const nos = v.yo?.pareja ?? 0;
  const yoListo = v.yo && v.jugadores[v.yo.asiento].listo;
  const res = v.resumen || [];
  const total = [0, 1].map((k) => res.reduce((a, l) => a + l.puntos[k], 0));
  const sinTener = { pares: 'pares', juego: 'juego' };
  return (
    <div className="msp-puntos">
      <div className="msp-destape-cab">
        <p className="pzp-etiqueta">Mano {v.numMano}</p>
        <h2>📊 Puntuaciones</h2>
      </div>
      <Aviso v={v} />
      {res.map((l) => {
        const k = l.ganador != null ? l.ganador % 2 : null;
        const sumaPar = [nos, 1 - nos].filter((x) => l.puntos[x] > 0);
        const ordago = l.cobros.some((c) => c.puntos == null);
        return (
          <article key={l.lance} className={`msp-lance-tarjeta ${k == null ? 'neutro' : esNos(v, k) ? 'nos' : 'ellos'}`}>
            <header>
              <span className="msp-lance-icono">{ICONO[l.lance]}</span>
              <h3>{NOMBRE_LANCE[l.lance]}</h3>
              <span className={`msp-lance-tipo ${l.tipo || 'nojugado'}`}>{ETIQUETA(l)}</span>
            </header>
            <Voces v={v} voces={l.voces} />
            {l.ganador != null ? (
              <div className="msp-duelo">
                <Mano v={v} s={l.ganador} gana jugada={l.jugadaGanador} conPremio />
                <span className="msp-vs">vs</span>
                {l.rival != null ? <Mano v={v} s={l.rival} jugada={l.jugadaRival} conPremio />
                  : <div className="msp-duelo-lado vacio"><p>{equipo(v, 1 - k)}</p><small>no {l.lance === 'punto' ? 'juegan' : `tienen ${sinTener[l.lance] || ''}`}</small></div>}
              </div>
            ) : l.tipo === 'nadie' ? <p className="msp-nadie">Nadie tiene {sinTener[l.lance] || 'nada'}.</p> : null}
            {l.cobros.length > 0 ? (
              <ul className="msp-desglose">
                {l.cobros.map((c, i) => (
                  <li key={i} className={esNos(v, c.pareja) ? 'nos' : 'ellos'}>
                    <b>{c.puntos == null ? '🏆' : `+${c.puntos}`}</b>
                    <span>{c.texto}{c.s != null ? ` · ${nomDe(v, c.s)}` : ''}</span>
                  </li>
                ))}
              </ul>
            ) : l.tipo !== 'nadie' && <p className="msp-nadie">{l.tipo && !ordago && v.fase !== 'conteo' ? 'No se llegó a cobrar: el juego ya había terminado.' : 'Sin puntos.'}</p>}
            {sumaPar.length > 0 && (
              <footer>{sumaPar.map((x) => <span key={x} className={x === nos ? 'nos' : 'ellos'}>+{l.puntos[x]} {equipo(v, x)}</span>)}</footer>
            )}
          </article>
        );
      })}
      <div className="msp-total">
        <span className="nos"><small>Nosotros</small><strong>+{total[nos]}</strong></span>
        <span className="msp-total-txt">en esta mano</span>
        <span className="ellos"><small>Ellos</small><strong>+{total[1 - nos]}</strong></span>
      </div>
      {v.fase !== 'fin' && (
        <div className="msp-seguir">
          {!yoListo ? <button type="button" className="pzp-boton grande" onClick={() => enviar('seguir')}><Icon name="play" size={20} /> {v.fase === 'finJuego' ? 'Siguiente juego' : 'Siguiente mano'}</button>
            : <p className="msp-espera">⏳ Esperando a los demás…</p>}
          {puedeForzar && yoListo && <button type="button" className="pzp-enlace" onClick={() => enviar('forzar')}>Seguir sin esperar</button>}
        </div>
      )}
    </div>
  );
}

function MiMano({ v, sel, setSel }) {
  if (!v.yo) return null;
  const yo = v.jugadores[v.yo.asiento];
  const puedeElegir = v.fase === 'descarte' && !yo.descartado;
  const toca = (id) => setSel((l) => (l.includes(id) ? l.filter((x) => x !== id) : [...l, id]));
  return (
    <div className="msp-mano-mia">
      <div className="msp-cartas">
        {(yo.cartas || []).map((c) => <CartaEsp key={c.id} c={c} sel={sel.includes(c.id)} onClick={puedeElegir ? () => toca(c.id) : undefined} />)}
      </div>
      <p className="msp-info">
        {v.yo.pares ? `${{ pareja: 'Pareja', medias: 'Medias', duples: 'Duples' }[v.yo.pares.tipo]}` : 'Sin pares'} · {v.yo.juego ? `Juego (${v.yo.suma})` : `Punto ${v.yo.suma}`}
      </p>
    </div>
  );
}

/** Centro del tapete: el lance en juego, la apuesta que hay encima y la última jugada. */
function Centro({ v }) {
  const L = v.lance;
  const pr = L?.propuesta;
  const ultimo = v.log[v.log.length - 1];
  return (
    <div className="msp-centro">
      <span className="msp-fase">{v.fase === 'lance' && ICONO[L?.nombre]} {{ mus: '¿Mus?', descarte: 'Descartes', lance: NOMBRE_LANCE[L?.nombre] || '', conteo: 'Conteo', finJuego: '¡Juego!', fin: 'Fin' }[v.fase]}</span>
      {pr && <span className={`msp-apuesta ${esNos(v, pr.pareja) ? 'nos' : 'ellos'}`}>{pr.ordago ? '🔥 ¡Órdago!' : `Envite: ${pr.total}`}<small>de {equipo(v, pr.pareja)}</small></span>}
      {!pr && ultimo && <small>{ultimo.texto}</small>}
    </div>
  );
}

/** La mesa entera (todo menos el final de la partida). anfitrion: puede pasar del destape a las puntuaciones. */
export function Mesa({ v, enviar, onSalir, puedeForzar = false, anfitrion = puedeForzar }) {
  const [sel, setSel] = useState([]);
  useEffect(() => { if (v.fase !== 'descarte') setSel([]); }, [v.fase]);
  const contando = v.fase === 'conteo' || v.fase === 'finJuego';
  return (
    <div className="msp-mesa-cont">
      <Marcador v={v} onSalir={onSalir} />
      {contando ? (
        v.revelado ? <Puntuaciones v={v} enviar={enviar} puedeForzar={puedeForzar} /> : <Destape v={v} enviar={enviar} anfitrion={anfitrion} />
      ) : (
        <>
          {v.fase === 'lance' && <Lances v={v} />}
          <div className="msp-mesa">
            {v.jugadores.filter((j) => rel(v, j.asiento) !== 0).map((j) => <Asiento key={j.asiento} v={v} j={j} />)}
            <Centro v={v} />
            {v.yo && <Asiento v={v} j={v.jugadores[v.yo.asiento]} />}
          </div>
          {v.fase === 'lance' && (
            <div className="msp-hilo">
              <span>{ICONO[v.lance.nombre]} En {NOMBRE_LANCE[v.lance.nombre].toLowerCase()}:</span>
              <Voces v={v} voces={v.voces?.[v.lance.nombre]} vacio={<em>todavía no ha hablado nadie</em>} />
            </div>
          )}
          <MiMano v={v} sel={sel} setSel={setSel} />
          <Acciones v={v} enviar={enviar} sel={sel} setSel={setSel} />
        </>
      )}
      <details className="pzp-tarjeta msp-log">
        <summary>📖 Lo que ha pasado</summary>
        <div>{[...v.log].reverse().map((l) => <p key={l.n} className={l.tipo}>{l.texto}</p>)}</div>
      </details>
    </div>
  );
}

export function PartidaOnline({ v, sala, enviar, onSalir }) {
  return <Mesa v={v} enviar={enviar} onSalir={onSalir} puedeForzar={sala.esAdmin} />;
}

export function Fin({ v, onSalir, children }) {
  const nos = v.yo?.pareja ?? 0;
  const gana = v.fin.ganadora === nos;
  const pareja = (k) => v.jugadores.filter((j) => j.pareja === k).map((j) => j.nombre).join(' y ');
  return (
    <>
      <header className={`pzp-hero ${gana ? 'acierto' : 'fin'}`}>
        <span className="pzp-hero-fondo" aria-hidden="true">🂡</span>
        <div className="pzp-hero-top">
          <button type="button" className="pzp-salir" onClick={onSalir}><Icon name="door" size={15} /> Salir</button>
          <span className="pzp-chip">🂠 Fin</span>
        </div>
        <p className="pzp-hero-etiqueta">Fin de la partida{v.fin.terminada ? ' (terminada antes)' : ''}</p>
        <h1 className="pzp-hero-titulo">{gana ? '¡Habéis ganado!' : 'Han ganado ellos'}</h1>
      </header>
      <div className="pzp-tarjeta">
        <p className="pzp-etiqueta">Resultado</p>
        <ul className="msp-filas">
          {[nos, 1 - nos].map((k) => (
            <li key={k} className={k === nos ? 'nos' : 'ellos'}>
              <strong>{k === nos ? 'Nosotros' : 'Ellos'}</strong><span>{pareja(k)}</span>
              <b>{v.vacas > 1 ? `${v.fin.juegos[k]} juegos` : `${v.fin.puntos[k]} pts`}{v.fin.ganadora === k ? ' 🏆' : ''}</b>
            </li>
          ))}
        </ul>
      </div>
      {v.resumen && v.conteo && (
        <details className="pzp-tarjeta msp-ultima">
          <summary>🂠 La última mano</summary>
          <Puntuaciones v={v} enviar={() => {}} />
        </details>
      )}
      {children}
    </>
  );
}

/** Puntos, juegos y (online) quién va de pareja con el anfitrión. */
export function Config({ config, onCambiar, sala }) {
  const otros = sala ? sala.jugadores.filter((j) => j.id !== sala.anfitrionId) : [];
  return (
    <>
      <BloqueConfig titulo="Se juega a">
        <Pildoras opciones={OPCIONES.objetivo.map((n) => [n, `${n} puntos`])} valor={config.objetivo} onCambiar={onCambiar && ((objetivo) => onCambiar({ objetivo }))} />
      </BloqueConfig>
      <BloqueConfig titulo="Partida">
        <Pildoras opciones={OPCIONES.vacas.map((n) => [n, n === 1 ? 'A 1 juego' : `Al mejor de ${n}`])} valor={config.vacas} onCambiar={onCambiar && ((vacas) => onCambiar({ vacas }))} />
      </BloqueConfig>
      {sala && (
        <BloqueConfig titulo="Pareja del anfitrión">
          <Pildoras opciones={[[null, 'Por orden de llegada'], ...otros.map((j) => [j.id, j.nombre])]} valor={config.companero ?? null} onCambiar={onCambiar && ((companero) => onCambiar({ companero }))} />
          <p className="pzp-nota" style={{ marginTop: '0.4rem' }}>Los huecos hasta cuatro los ocupa la máquina 🤖.</p>
        </BloqueConfig>
      )}
    </>
  );
}
