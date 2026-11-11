// client/src/games/Mus/Mesa.jsx
// Mesa del Mus (online y contra la máquina): tus cartas abajo, tu pareja arriba y los rivales a los lados.
import React, { useEffect, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import { Pildoras } from '../Pulsador/Vistas.jsx';
import { BloqueConfig } from '../../components/MenuJuego.jsx';
import { NOMBRE_LANCE, OPCIONES } from './engine.js';
import './Mus.css';
import CartaEspanola from '../../components/CartaEspanola.jsx';

/** Carta española (dibujo común con el Mus Avanzado): números 1-7, 10, 11 y 12. */
export function CartaEsp({ c, sel = false, onClick, chica = false, oculta = false }) {
  return <CartaEspanola c={c} sel={sel} onClick={onClick} chica={chica} oculta={oculta || !c} className="msp-carta-esp" />;
}

const rel = (v, s) => (s - (v.yo?.asiento ?? 0) + 4) % 4; // 0 yo, 1 derecha, 2 compañero, 3 izquierda
const POS = ['abajo', 'derecha', 'arriba', 'izquierda'];

function Asiento({ v, j }) {
  const r = rel(v, j.asiento);
  const nuestro = v.yo ? j.pareja === v.yo.pareja : j.pareja === 0;
  const turno = v.turno === j.asiento;
  const decl = v.declaraciones?.find((d) => d.asiento === j.asiento);
  const lance = v.lance?.nombre;
  return (
    <div className={`msp-asiento ${POS[r]}${turno ? ' turno' : ''}${nuestro ? ' nos' : ' ellos'}`}>
      <div className="msp-asiento-cab">
        <span className="msp-avatar">{j.bot ? '🤖' : j.nombre.charAt(0).toUpperCase()}</span>
        <span className="msp-asiento-nombre">{r === 0 ? 'Tú' : j.nombre.replace(' 🤖', '')}</span>
        {v.mano === j.asiento && <b className="msp-mano" title="Es mano">M</b>}
      </div>
      {r !== 0 && (
        <div className="msp-mini-cartas">
          {j.cartas ? j.cartas.map((c) => <CartaEsp key={c.id} c={c} chica />) : Array.from({ length: j.nCartas }, (_, k) => <CartaEsp key={k} oculta chica />)}
        </div>
      )}
      {decl && (lance === 'pares' || lance === 'juego' || lance === 'punto') && (
        <span className="msp-decl">{lance === 'pares' ? (decl.pares ? 'Pares: sí' : 'Pares: no') : (decl.juego ? 'Juego: sí' : 'Juego: no')}</span>
      )}
      {j.descartado != null && <span className="msp-decl">{j.descartado ? '✓ Descartado' : '…descartando'}</span>}
      {j.dicho && <span key={j.dichoN} className="msp-bocadillo">{j.dicho}</span>}
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
          <strong>{NOMBRE_LANCE[l]}</strong><small>{texto(l)}</small>
        </li>
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
    if (!mio) return <p className="msp-espera">⏳ Habla {v.jugadores[v.turno]?.nombre}…</p>;
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
      const quien = v.jugadores[v.turno];
      return <p className="msp-espera">⏳ {quien ? `Habla ${quien.nombre}` : 'Esperando'}{pr ? (pr.ordago ? ' (hay órdago)' : ` (envite de ${pr.total})`) : ''}…</p>;
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

function Conteo({ v, enviar, puedeForzar }) {
  const nos = v.yo?.pareja ?? 0;
  const c = v.conteo || {};
  const yoListo = v.yo && v.jugadores[v.yo.asiento].listo;
  const nombrePareja = (k) => (k === nos ? 'Nosotros' : 'Ellos');
  return (
    <div className="pzp-tarjeta msp-conteo">
      {c.ordago ? (
        <p className="pzp-etiqueta centrada">Órdago a la {NOMBRE_LANCE[c.ordago.lance].toLowerCase()}: lo gana {nombrePareja(c.ordago.ganador % 2)}</p>
      ) : <p className="pzp-etiqueta">Conteo de la mano</p>}
      {c.filas?.length > 0 && (
        <ul className="msp-filas">
          {c.filas.map((f, i) => (
            <li key={i} className={f.pareja === nos ? 'nos' : 'ellos'}>
              <strong>{NOMBRE_LANCE[f.lance]}</strong><span>{f.motivo}</span><b>+{f.puntos} {nombrePareja(f.pareja)}</b>
            </li>
          ))}
        </ul>
      )}
      {c.juegoPara != null && <p className="msp-juego">🏆 ¡Juego para {nombrePareja(c.juegoPara)}!</p>}
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

/** La mesa entera (todo menos el final de la partida). */
export function Mesa({ v, enviar, onSalir, puedeForzar = false }) {
  const [sel, setSel] = useState([]);
  useEffect(() => { if (v.fase !== 'descarte') setSel([]); }, [v.fase]);
  const ultimo = v.log[v.log.length - 1];
  return (
    <div className="msp-mesa-cont">
      <Marcador v={v} onSalir={onSalir} />
      {(v.fase === 'lance' || v.fase === 'conteo' || v.fase === 'finJuego') && <Lances v={v} />}
      <div className="msp-mesa">
        {v.jugadores.filter((j) => rel(v, j.asiento) !== 0).map((j) => <Asiento key={j.asiento} v={v} j={j} />)}
        <div className="msp-centro">
          <span className="msp-fase">{{ mus: '¿Mus?', descarte: 'Descartes', lance: NOMBRE_LANCE[v.lance?.nombre] || '', conteo: 'Conteo', finJuego: '¡Juego!', fin: 'Fin' }[v.fase]}</span>
          {ultimo && <small>{ultimo.texto}</small>}
        </div>
        {v.yo && <Asiento v={v} j={v.jugadores[v.yo.asiento]} />}
      </div>
      <MiMano v={v} sel={sel} setSel={setSel} />
      {(v.fase === 'conteo' || v.fase === 'finJuego') ? <Conteo v={v} enviar={enviar} puedeForzar={puedeForzar} /> : <Acciones v={v} enviar={enviar} sel={sel} setSel={setSel} />}
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
