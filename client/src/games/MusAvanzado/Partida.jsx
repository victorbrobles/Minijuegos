// client/src/games/MusAvanzado/Partida.jsx
// Pantallas de «Mus Avanzado» (online y en un dispositivo) con las piezas comunes de ../Pulsador.
import React, { useEffect, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import { Hero, Cuenta, useRestante, Avatar, Pildoras, PantallaFin, colorDe } from '../Pulsador/Vistas.jsx';
import { BloqueConfig } from '../../components/MenuJuego.jsx';
import { CATEGORIAS, CATEGORIAS_NORMALES, MODIFICADORES, REGLAS_ESPECIALES, ICONO_PALO, CORTO_RANGO, NOMBRE_RANGO, OPCIONES } from './engine.js';
import './MusAvanzado.css';

const HERO = { emoji: '🂡' };
const nombreDe = (v, id) => v.jugadores.find((j) => j.id === id)?.nombre ?? '¿?';
/** Nombre de un bando: el jugador o «Ana y Luis». */
export const nombreBando = (v, bid) => {
  const b = v.bandos.find((x) => x.id === bid);
  return b ? b.miembros.map((m) => nombreDe(v, m)).join(' y ') : '¿?';
};
const nivelTexto = (v, n) => (n > 0 ? v.categoria.niveles[n - 1] : 'Nada');
const ESPECIAL = { comodin: { e: '🃏', t: 'Comodín' }, bomba: { e: '💣', t: 'Bomba' }, espejo: { e: '🪞', t: 'Espejo' }, doble: { e: '✌️', t: 'Doble' }, mutante: { e: '🧬', t: 'Mutante' } };

export function Carta({ c, sel, onClick, chica }) {
  const esp = ESPECIAL[c.esp];
  const sinValor = c.esp === 'comodin' || c.esp === 'bomba' || c.esp === 'espejo';
  return (
    <button type="button" className={`mav-carta ${c.p || 'especial'}${sel ? ' sel' : ''}${chica ? ' chica' : ''}${c.esp ? ` esp-${c.esp}` : ''}`}
      onClick={onClick} disabled={!onClick} aria-label={sinValor ? esp.t : `${NOMBRE_RANGO[c.r]} de ${c.p}${esp ? ` (${esp.t})` : ''}`}>
      {sinValor ? <span className="mav-carta-esp">{esp.e}<small>{esp.t}</small></span> : (
        <>
          <span className="mav-carta-r">{CORTO_RANGO[c.r]}</span>
          <span className="mav-carta-p">{ICONO_PALO[c.p]}</span>
          {esp && <span className="mav-carta-marca" title={esp.t}>{esp.e}</span>}
        </>
      )}
    </button>
  );
}

function Mano({ cartas, sel = [], onToggle, chica }) {
  return <div className={`mav-mano${chica ? ' chica' : ''}`}>{cartas.map((c) => <Carta key={c.id} c={c} chica={chica} sel={sel.includes(c.id)} onClick={onToggle ? () => onToggle(c.id) : null} />)}</div>;
}

function Categoria({ v }) {
  const c = v.categoria;
  if (!c) return null;
  return (
    <div className="pzp-tarjeta mav-categoria">
      <span className="mav-cat-e">{c.e}</span>
      <div>
        <strong>{c.nombre}</strong>
        <p>{c.desc}</p>
        {c.detalle && <p className="mav-cat-detalle">{c.detalle}</p>}
      </div>
    </div>
  );
}

// ---------- Pacto
function Interruptor({ on, e, nombre, desc, onClick }) {
  return (
    <button type="button" className={`mav-opcion${on ? ' on' : ''}`} onClick={onClick} disabled={!onClick} aria-pressed={on}>
      <span className="mav-opcion-e">{e}</span>
      <span className="mav-opcion-txt"><b>{nombre}</b><small>{desc}</small></span>
      <span className="mav-opcion-check">{on ? '✓' : ''}</span>
    </button>
  );
}
function Pacto({ v, enviar, local }) {
  const t = v.pacto;
  const yoAcepto = v.yo && t.aceptan.includes(v.yo.id);
  const proponer = (cambio) => enviar('proponer', { cambio });
  return (
    <>
      <div className="pzp-tarjeta mav-pacto">
        <p className="pzp-etiqueta">🤝 Pacto de la baraja</p>
        <p className="mav-ayuda-osc">Cualquiera puede cambiar la propuesta, pero solo se juega cuando <b>todos</b> la aceptan. Si alguien la cambia, hay que volver a aceptar.</p>
        <h3>Cartas especiales</h3>
        {Object.entries(MODIFICADORES).map(([k, m]) => <Interruptor key={k} {...m} on={Boolean(t.modificadores[k])} onClick={() => proponer({ modificador: k })} />)}
        <h3>Reglas especiales</h3>
        {Object.entries(REGLAS_ESPECIALES).map(([k, m]) => <Interruptor key={k} {...m} on={Boolean(t.reglas[k])} onClick={() => proponer({ regla: k })} />)}
        <h3>Categorías ({t.categorias.length})</h3>
        {Object.entries(CATEGORIAS).map(([k, c]) => (
          <Interruptor key={k} e={c.e} nombre={`${c.nombre}${CATEGORIAS_NORMALES.includes(k) ? '' : ' ✨'}`} desc={c.desc} on={t.categorias.includes(k)} onClick={() => proponer({ categoria: k })} />
        ))}
      </div>
      <div className="pzp-tarjeta">
        <p className="pzp-etiqueta">¿Quién acepta esta baraja?</p>
        <div className="mav-aceptan">
          {v.jugadores.filter((j) => !j.fuera).map((j) => {
            const ok = t.aceptan.includes(j.id);
            return local ? (
              <button key={j.id} type="button" className={`mav-acepta${ok ? ' ok' : ''}`} style={{ '--c': colorDe(j.id) }} disabled={ok} onClick={() => enviar('aceptar', { jugador: j.id })}>
                {ok ? '✓' : '○'} {j.nombre}
              </button>
            ) : <span key={j.id} className={`mav-acepta${ok ? ' ok' : ''}`} style={{ '--c': colorDe(j.id) }}>{ok ? '✓' : '…'} {j.nombre}</span>;
          })}
        </div>
        {!local && <button type="button" className="pzp-boton" disabled={yoAcepto} onClick={() => enviar('aceptar')}><Icon name="check" size={20} /> {yoAcepto ? 'Aceptada: esperando a los demás' : 'Acepto esta baraja'}</button>}
        {local && <p className="pzp-nota">Cada jugador pulsa su nombre cuando esté de acuerdo.</p>}
      </div>
    </>
  );
}

// ---------- Cambio
function Cambio({ v, enviar }) {
  const [sel, setSel] = useState([]);
  const yo = v.yo;
  if (yo.cambio !== null) {
    return (
      <>
        <Mano cartas={yo.mano} />
        <p className="mav-nota">Has cambiado {yo.cambio} {yo.cambio === 1 ? 'carta' : 'cartas'}. Esperando a: {v.jugadores.filter((j) => !j.fuera && j.cambio === null).map((j) => j.nombre).join(', ')}</p>
      </>
    );
  }
  const toggle = (id) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length < yo.maxCambio ? [...s, id] : s));
  return (
    <>
      <Mano cartas={yo.mano} sel={sel} onToggle={toggle} />
      <p className="mav-nota">Toca hasta {yo.maxCambio} cartas para cambiarlas por otras del mazo. Solo tú ves tu mano.</p>
      <MiNivel v={v} />
      <button type="button" className="pzp-boton" onClick={() => { enviar('cambiar', { ids: sel }); setSel([]); }}>
        <Icon name="refresh" size={20} /> {sel.length ? `Cambiar ${sel.length} ${sel.length === 1 ? 'carta' : 'cartas'}` : 'Me quedo con estas'}
      </button>
    </>
  );
}
function MiNivel({ v }) {
  if (!v.yo || !v.categoria) return null;
  return <p className="mav-minivel">Tu mano sola, de verdad: <b>{nivelTexto(v, v.yo.nivelPropio)}</b>{v.modo === 'parejas' ? ` (más lo que tenga ${nombreDe(v, v.yo.companero)})` : ''}</p>;
}

// ---------- Apuestas
function Apuesta({ v }) {
  const a = v.apuesta;
  return (
    <div className="mav-mesa">
      <span className="mav-bote">💰 Bote: <b>{v.bote}</b></span>
      {a ? <span className="mav-dice"><b style={{ color: colorDe(a.jugador) }}>{nombreDe(v, a.jugador)}</b> dice: «{nivelTexto(v, a.nivel)}» · {a.fichas} 🪙</span>
        : <span className="mav-dice">Nadie ha anunciado nada todavía.</span>}
    </div>
  );
}
function Registro({ v }) {
  if (!v.registro.length) return null;
  const t = { anuncia: 'anuncia', sube: 'sube:', paso: 'pasa', desafia: '¡desafía!' };
  return (
    <ul className="mav-registro">
      {v.registro.slice(0, 5).map((r, i) => (
        <li key={i}><b style={{ color: colorDe(r.id) }}>{nombreDe(v, r.id)}</b> {t[r.tipo]}{r.nivel ? ` «${nivelTexto(v, r.nivel)}» (${r.fichas} 🪙)` : ''}</li>
      ))}
    </ul>
  );
}
function Acciones({ v, enviar }) {
  const minimo = (v.apuesta?.nivel || 0) + 1;
  const niveles = v.categoria.niveles;
  const [nivel, setNivel] = useState(Math.min(minimo, niveles.length));
  const [subida, setSubida] = useState(1);
  useEffect(() => { setNivel(Math.min(minimo, niveles.length)); setSubida(1); }, [minimo, niveles.length]);
  const misFichas = v.bandos.find((b) => b.id === v.yo.bando).fichas;
  const coste = (v.apuesta?.fichas || 0) + subida;
  const puedeAnunciar = minimo <= niveles.length && misFichas >= coste;
  const desafio = v.apuesta ? Math.min(misFichas, v.apuesta.fichas) : 0;
  return (
    <div className="pzp-tarjeta mav-acciones">
      <p className="pzp-etiqueta">{v.apuesta ? 'Sube con algo mejor, pasa o desafía' : 'Anuncia lo que tienes (o lo que quieres que crean)'}</p>
      {minimo <= niveles.length ? (
        <>
          <div className="mav-niveles">
            {niveles.map((t, i) => (i + 1 < minimo ? null : (
              <button key={t} type="button" className={nivel === i + 1 ? 'on' : ''} onClick={() => setNivel(i + 1)}>{t}</button>
            )))}
          </div>
          <div className="mav-subida">
            <span>Sube</span>
            {Array.from({ length: v.subidaMax }, (_, i) => i + 1).map((s) => (
              <button key={s} type="button" className={subida === s ? 'on' : ''} onClick={() => setSubida(s)}>+{s}</button>
            ))}
          </div>
          <button type="button" className="pzp-boton" disabled={!puedeAnunciar} onClick={() => enviar('anunciar', { nivel, subida })}>
            📣 «{niveles[nivel - 1]}» · pones {coste} 🪙
          </button>
          {misFichas < coste && <p className="pzp-nota">No tienes fichas suficientes ({misFichas}).</p>}
        </>
      ) : <p className="pzp-nota">Ya no se puede anunciar nada más alto.</p>}
      <div className="mav-botones">
        <button type="button" className="pzp-boton secundario" onClick={() => enviar('pasar')}>🙅 Paso</button>
        {v.apuesta && <button type="button" className="pzp-boton peligro" disabled={misFichas < 1} onClick={() => enviar('desafiar')}>⚔️ ¡No te creo! ({desafio} 🪙)</button>}
      </div>
    </div>
  );
}

// ---------- Revelación
function Revelacion({ v, enviar, puedeSeguir }) {
  const r = v.revelacion;
  const a = r.apuesta;
  let titulo;
  if (r.tipo === 'desafio') titulo = r.verdad ? `✅ ${nombreDe(v, a.jugador)} decía la verdad` : `🤥 ¡${nombreDe(v, a.jugador)} iba de farol!`;
  else if (r.tipo === 'sinDesafio') titulo = `🎩 Nadie desafió a ${nombreDe(v, a.jugador)}`;
  else titulo = '🤷 Nadie se atrevió a anunciar';
  return (
    <>
      <div className="pzp-tarjeta">
        <p className="pzp-etiqueta">{titulo}</p>
        {a && <p className="mav-ayuda-osc">Anunció «{nivelTexto(v, a.nivel)}» y tenía <b>{nivelTexto(v, r.niveles[a.bando])}</b>.
          {r.tipo === 'desafio' ? ` Desafió ${nombreDe(v, r.desafianteJugador)}: el bote es para ${nombreBando(v, r.gana)}.` : r.tipo === 'sinDesafio' ? ` Se lleva el bote sin enseñar nada.` : ''}</p>}
        {r.tipo === 'nadie' && <p className="mav-ayuda-osc">{v.bote ? `El bote (${v.bote} 🪙) pasa a la siguiente categoría.` : 'El bote se reparte.'}</p>}
        {r.bombas.map((b) => <p key={b.id} className="mav-ayuda-osc">💣 {nombreDe(v, b.id)} tenía una bomba: −{b.fichas} 🪙</p>)}
      </div>
      <div className="mav-manos">
        {v.bandos.map((b) => (
          <div key={b.id} className={`pzp-tarjeta mav-bando${r.gana === b.id ? ' gana' : ''}`}>
            <p className="mav-bando-tit">
              <span>{nombreBando(v, b.id)}</span>
              <b>{nivelTexto(v, r.niveles[b.id])}</b>
              <em className={r.cambios[b.id] < 0 ? 'menos' : ''}>{r.cambios[b.id] ? `${r.cambios[b.id] > 0 ? '+' : ''}${r.cambios[b.id]} 🪙` : ''}</em>
            </p>
            {b.miembros.map((m) => <Mano key={m} cartas={v.manos[m] || []} chica />)}
          </div>
        ))}
      </div>
      <div className="pzp-barra estatica">
        {puedeSeguir ? (
          <>
            <button type="button" className="pzp-boton grande" onClick={() => enviar('siguiente')}>
              <Icon name="play" size={20} /> {v.ronda >= v.rondas ? 'Ver resultado final' : 'Siguiente categoría'}
            </button>
            {v.ronda < v.rondas && <button type="button" className="pzp-enlace" onClick={() => enviar('terminar')}>Terminar la partida ya</button>}
          </>
        ) : <p className="pzp-esperando">⏳ El anfitrión pasará a la siguiente categoría…</p>}
      </div>
    </>
  );
}

export function Partida({ v, enviar, offset = 0, onSalir, local = false, admin = true }) {
  const restante = useRestante(v.hasta, offset);
  const habla = v.habla;
  const miTurno = v.fase === 'apuestas' && v.yo && habla === v.yo.id;
  const chip = v.fase === 'pacto' ? '🂡 Pacto' : `🂡 ${v.ronda}/${v.rondas}`;
  const titulos = {
    pacto: 'Pactad la baraja',
    cambio: v.categoria?.nombre,
    apuestas: miTurno ? (local ? `Habla ${nombreDe(v, habla)}` : '¡Te toca hablar!') : `Habla ${nombreDe(v, habla)}`,
    revelacion: 'Se enseñan las cartas'
  };
  const etiqueta = v.fase === 'pacto' ? 'Mus Avanzado' : v.modo === 'parejas' && v.yo ? `Vas con ${nombreDe(v, v.yo.companero)}` : v.fase === 'cambio' ? 'Cambia cartas' : v.categoria?.nombre;
  return (
    <>
      <Hero v={v} juego={HERO} onSalir={onSalir} chip={chip} etiqueta={etiqueta} titulo={titulos[v.fase]} turno={habla ?? undefined} />
      {v.hasta && <Cuenta ms={restante} total={v.segundos * 1000} />}
      {v.fase === 'pacto' && <Pacto v={v} enviar={enviar} local={local} />}
      {v.fase !== 'pacto' && v.fase !== 'revelacion' && <Categoria v={v} />}
      {v.fase === 'cambio' && v.yo && <Cambio key={`${v.ronda}-${v.yo.id}`} v={v} enviar={enviar} />}
      {v.fase === 'apuestas' && (
        <>
          <Apuesta v={v} />
          {v.yo && <Mano cartas={v.yo.mano} />}
          <MiNivel v={v} />
          {miTurno ? <Acciones key={`${v.ronda}-${v.registro.length}`} v={v} enviar={enviar} /> : <p className="mav-nota">Esperando a {nombreDe(v, habla)}…</p>}
          <Registro v={v} />
        </>
      )}
      {v.fase === 'revelacion' && <Revelacion v={v} enviar={enviar} puedeSeguir={admin} />}
    </>
  );
}

export function PartidaOnline({ v, sala, enviar, offset, onSalir }) {
  return <Partida v={v} enviar={enviar} offset={offset} onSalir={onSalir} admin={sala.esAdmin} />;
}

export function Fin({ v, juego, onSalir, children }) {
  return <PantallaFin v={v} juego={juego} onSalir={onSalir}>{children}</PantallaFin>;
}

export function Config({ config, onCambiar }) {
  return (
    <>
      <BloqueConfig titulo="Modo">
        <Pildoras opciones={[['individual', '👤 Individual (4-8)'], ['parejas', '👥 Parejas (4 o 6)']]} valor={config.modo} onCambiar={onCambiar && ((modo) => onCambiar({ modo }))} />
      </BloqueConfig>
      <BloqueConfig titulo="Fichas por jugador">
        <Pildoras opciones={OPCIONES.fichas.map((n) => [n, `${n}`])} valor={config.fichas} onCambiar={onCambiar && ((fichas) => onCambiar({ fichas }))} />
      </BloqueConfig>
    </>
  );
}
