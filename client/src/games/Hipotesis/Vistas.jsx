// client/src/games/Hipotesis/Vistas.jsx
// Pantallas de «La Hipótesis Ganadora», compartidas por el modo online y el de un solo dispositivo.
// Reciben `v` (vista del jugador, engine.vistaDe) y `enviar(tipo, datos)`.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import { SUSTANCIAS, FORMAS, INSTRUMENTOS, REACCIONES, textoHipotesis } from './engine.js';
import './Hipotesis.css';

const plural = (n, s, p) => (n === 1 ? s : p);
const signo = (n) => (n > 0 ? `+${n}` : `${n}`);

// ---------------------------------------------------------------- Piezas pequeñas
export function Sustancia({ id, texto }) {
  const s = SUSTANCIAS[id];
  return <span className="hp-sust" style={{ background: s.color }}><Icon name={s.icono} size={13} /> {texto ?? s.nombre}</span>;
}

export function Temporizador({ limite, offset = 0 }) {
  const [, setT] = useState(0);
  const total = useRef({ limite: null, ms: 1 });
  useEffect(() => { const i = setInterval(() => setT((x) => x + 1), 500); return () => clearInterval(i); }, []);
  if (!limite) return null;
  const resto = Math.max(0, limite - (Date.now() + offset));
  if (total.current.limite !== limite) total.current = { limite, ms: Math.max(resto, 1000) };
  const s = Math.ceil(resto / 1000);
  return (
    <div className={`hp-timer ${s <= 10 ? 'urgente' : ''}`}>
      <Icon name="clock" size={16} /> {Math.floor(s / 60)}:{String(s % 60).padStart(2, '0')}
      <div className="hp-timer-barra"><div className="hp-timer-fill" style={{ width: `${Math.min(100, (resto / total.current.ms) * 100)}%` }} /></div>
    </div>
  );
}

// Rejilla de muestras. conocimiento: [{m,t}] lo que sabes. verdad: [t] (solo en la resolución).
export function Muestras({ v, verdad, sel = [], onSel, resaltar = [] }) {
  const sabe = (m) => v.conocimiento?.find((c) => c.m === m);
  return (
    <div className="hp-muestras">
      {Array.from({ length: v.M }, (_, m) => {
        const c = verdad ? { t: verdad[m] } : sabe(m);
        const s = c ? SUSTANCIAS[c.t] : null;
        const clases = ['hp-muestra', c ? 'conocida' : '', sel.includes(m) ? 'sel' : '', resaltar.includes(m) ? 'res' : '', onSel ? 'click' : ''].join(' ');
        return (
          <button key={m} type="button" className={clases} style={s ? { '--c': s.color } : null} disabled={!onSel} onClick={() => onSel?.(m)}>
            <b>{m + 1}</b>
            {s ? <><Icon name={s.icono} size={18} /><small>{s.nombre}</small></> : <small>?</small>}
            {c?.lupa && <i className="hp-lupa"><Icon name="search" size={10} /></i>}
            {c?.publica && <i className="hp-lupa">📣</i>}
          </button>
        );
      })}
    </div>
  );
}

export function Marcador({ v }) {
  const orden = [...v.jugadores].filter((j) => !j.fuera).sort((a, b) => b.puntos - a.puntos);
  return (
    <div className="hp-card">
      <h3><Icon name="trophy" size={18} /> Reputación</h3>
      <div className="hp-marcador">
        {orden.map((j, i) => (
          <div key={j.id} className={`hp-fila ${j.id === v.yo.id ? 'yo' : ''}`}>
            <span>{i === 0 && j.puntos > 0 ? <Icon name="crown" size={16} /> : <b>{i + 1}</b>} {j.nombre}{j.id === v.yo.id ? ' (tú)' : ''}</span>
            <span className="hp-fila-der">{j.hecho !== null && j.hecho !== undefined && <i className={`hp-hecho ${j.hecho ? 'si' : ''}`}>{j.hecho ? 'listo' : '…'}</i>}<b>{j.puntos} pts</b></span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Cabecera({ v, offset }) {
  return (
    <>
      <div className="hp-top">
        <span className="hp-chip"><Icon name="book" size={16} /> Ronda {v.ronda}/{v.rondas}</span>
        <span className="hp-chip yo"><Icon name="star" size={16} /> {v.yo.puntos} pts</span>
      </div>
      {v.limite ? <Temporizador limite={v.limite} offset={offset} /> : null}
      {v.apurando && <div className="hp-apura">⏰ ¡Casi todos han terminado! Date prisa</div>}
      {(v.fase === 'hipotesis' || v.fase === 'apuestas') && v.evento && v.evento.clave !== 'normal' && (
        <div className={`hp-evento ${v.evento.clave}`}><span className="hp-evento-emoji">{v.evento.emoji}</span><div><strong>{v.evento.nombre}</strong><span>{v.evento.desc}</span></div></div>
      )}
    </>
  );
}

function Instrumento({ v }) {
  const i = v.yo.instrumento;
  return (
    <div className={`hp-instr ${i.usado ? 'usado' : ''}`}>
      <span className="hp-instr-ico"><Icon name={i.icono} size={22} /></span>
      <div><strong>Tu poder esta ronda: {i.nombre}</strong> <small>({i.cuando.toLowerCase()} · úsalo o se pierde)</small><span>{i.usado ? 'Ya lo has usado.' : i.desc}</span></div>
    </div>
  );
}

function PanelConocimiento({ v }) {
  return (
    <div className="hp-card">
      <h3><Icon name="eye" size={18} /> Lo que sabes con certeza</h3>
      <div className="hp-gente">{v.conocimiento.map((c) => <span key={c.m} className="hp-saber">Muestra <b>{c.m + 1}</b> = <Sustancia id={c.t} />{c.lupa ? ' 🔍' : ''}{c.publica ? ' 📣' : ''}</span>)}</div>
      <p className="hp-muted" style={{ margin: '.4rem 0 0' }}>De las demás muestras no sabes nada… salvo lo que te cuenten los otros (que pueden mentir).</p>
    </div>
  );
}

// ---------------------------------------------------------------- Fase 1: formular tu hipótesis
// Cartas rápidas: con lo que sabes se generan opciones listas para enviar (verdades, faroles y una a ciegas).
const mulberry = (a) => () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const claveCarta = (c) => `${c.forma}-${c.i}-${c.j ?? ''}-${c.t ?? ''}`;
function generarCartas(sabe, M, semilla) {
  const rnd = mulberry(semilla);
  const azar = (n) => Math.floor(rnd() * n);
  const barajar = (arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = azar(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const ver = []; const far = [];
  sabe.forEach((c) => {
    ver.push({ forma: 'tipo', i: c.m, j: null, t: c.t, tag: 'verdad' });
    far.push({ forma: 'tipo', i: c.m, j: null, t: (c.t + 1 + azar(SUSTANCIAS.length - 1)) % SUSTANCIAS.length, tag: 'farol' });
  });
  if (sabe.length >= 2) {
    const ia = azar(sabe.length); let ib = azar(sabe.length - 1); if (ib >= ia) ib += 1;
    const a = sabe[ia]; const b = sabe[ib]; const igual = a.t === b.t;
    ver.push({ forma: igual ? 'igual' : 'distinta', i: a.m, j: b.m, t: null, tag: 'verdad' });
    far.push({ forma: igual ? 'distinta' : 'igual', i: a.m, j: b.m, t: null, tag: 'farol' });
  }
  const desc = Array.from({ length: M }, (_, m) => m).filter((m) => !sabe.some((c) => c.m === m));
  const ciega = desc.length ? [{ forma: 'tipo', i: desc[azar(desc.length)], j: null, t: azar(SUSTANCIAS.length), tag: 'ciegas' }] : [];
  return barajar([...barajar(ver).slice(0, 3), ...barajar(far).slice(0, 3), ...ciega]);
}
const ETIQUETA = { verdad: 'VERDAD', farol: 'FAROL', ciegas: 'A CIEGAS' };

export function FaseHipotesis({ v, enviar, offset }) {
  const [forma, setForma] = useState('tipo');
  const [sel, setSel] = useState([]);
  const [t, setT] = useState(null);
  const [coartada, setCoartada] = useState(false);
  const [lupa, setLupa] = useState('');
  const enviada = !!v.miHipotesis;
  const instr = v.yo.instrumento;
  const necesarias = forma === 'tipo' ? 1 : 2;
  const [semilla] = useState(() => Math.floor(Math.random() * 1e9));
  const [cartaSel, setCartaSel] = useState(null);
  const sig = JSON.stringify(v.conocimiento);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const cartas = useMemo(() => generarCartas(v.conocimiento, v.M, semilla), [sig, v.M, semilla]);
  const carta = cartas.find((c) => claveCarta(c) === cartaSel) || null;

  const alternar = (m) => setSel((s) => (s.includes(m) ? s.filter((x) => x !== m) : s.length >= necesarias ? [...s.slice(1), m] : [...s, m]));
  const cambiarForma = (f) => { setForma(f); setSel([]); };
  const lista = sel.length === necesarias && (forma !== 'tipo' || t !== null);
  const borrador = lista ? { forma, i: sel[0], j: forma === 'tipo' ? null : sel[1], t: forma === 'tipo' ? t : null } : null;
  const desconocidas = Array.from({ length: v.M }, (_, m) => m).filter((m) => !v.conocimiento.some((c) => c.m === m));

  return (
    <div className="hp-wrap">
      <Cabecera v={v} offset={offset} />
      <div className="hp-card hp-centro">
        <h2>Ronda {v.ronda}: ¿verdad o farol?</h2>
        <p className="hp-muted">En secreto y rápido. Luego se muestran todas a la vez y los demás apuestan si te creen. Puedes decir la verdad… o colarles un farol.</p>
      </div>
      <PanelConocimiento v={v} />
      <Instrumento v={v} />
      {enviada ? (
        <div className="hp-card hp-centro">
          <h3>Hipótesis enviada</h3>
          <p><b>{textoHipotesis(v.miHipotesis)}</b></p>
          <p className="hp-muted">Esperando a: {v.faltan.join(', ') || '…'}</p>
        </div>
      ) : (
        <>
          {instr.tipo === 'lupa' && !instr.usado && (
            <div className="hp-card">
              <h3><Icon name="search" size={18} /> Usar la lupa</h3>
              <div className="hp-form-fila">
                <select value={lupa} onChange={(e) => setLupa(e.target.value)}>
                  <option value="">Elige una muestra que no conozcas…</option>
                  {desconocidas.map((m) => <option key={m} value={m}>Muestra {m + 1}</option>)}
                </select>
                <button type="button" disabled={lupa === ''} onClick={() => enviar('lupa', { m: Number(lupa) })}>Mirar</button>
              </div>
            </div>
          )}
          <div className="hp-card">
            <h3>⚡ Elige tu jugada</h3>
            <p className="hp-muted" style={{ margin: '0 0 .6rem' }}>Un toque y listo. Las etiquetas solo las ves tú: decide si dices la verdad o si lanzas un farol.</p>
            <div className="hp-cartas">
              {cartas.map((c) => (
                <button key={claveCarta(c)} type="button" className={`hp-carta ${c.tag} ${cartaSel === claveCarta(c) ? 'on' : ''}`} onClick={() => setCartaSel(claveCarta(c))}>
                  <span className="hp-carta-tag">{ETIQUETA[c.tag]}</span>
                  <span className="hp-carta-txt">{textoHipotesis(c)}</span>
                  <small>vale ×{FORMAS[c.forma].peso}</small>
                </button>
              ))}
            </div>
            {instr.tipo === 'coartada' && !instr.usado && (
              <label className="hp-check"><input type="checkbox" checked={coartada} onChange={(e) => setCoartada(e.target.checked)} /> Usar la <b>Coartada</b> (si es falsa, no pierdes puntos por las refutaciones)</label>
            )}
            <button type="button" className="big full" style={{ marginTop: '.8rem' }} disabled={!carta}
              onClick={() => enviar('hipotesis', { hipotesis: { forma: carta.forma, i: carta.i, j: carta.j, t: carta.t, coartada } })}>
              <Icon name="check" size={22} strokeWidth={2.5} /> {carta ? 'Enviar esta hipótesis' : 'Toca una carta'}
            </button>
          </div>
          <details className="hp-detalle">
            <summary>🛠 Prefiero montarla yo (personalizada)</summary>
            <div className="hp-card" style={{ boxShadow: 'none', padding: 0 }}>
            <h3>Tipo de hipótesis</h3>
            <div className="hp-formas">
              {Object.entries(FORMAS).map(([k, f]) => (
                <button key={k} type="button" className={forma === k ? 'on' : ''} onClick={() => cambiarForma(k)}>
                  <strong>{f.nombre}</strong><small>{f.desc} Vale ×{f.peso}.</small>
                </button>
              ))}
            </div>
            <p className="hp-muted" style={{ margin: '.8rem 0 .4rem' }}>{forma === 'tipo' ? 'Elige una muestra:' : 'Elige dos muestras:'}</p>
            <Muestras v={v} sel={sel} onSel={alternar} />
            {forma === 'tipo' && (
              <>
                <p className="hp-muted" style={{ margin: '.8rem 0 .4rem' }}>…y la sustancia que dices que es:</p>
                <div className="hp-sustancias">{SUSTANCIAS.map((s) => <button key={s.id} type="button" className={t === s.id ? 'on' : ''} style={{ '--c': s.color }} onClick={() => setT(s.id)}><Icon name={s.icono} size={18} /> {s.nombre}</button>)}</div>
              </>
            )}
            <div className="hp-previa">{borrador ? <>Tu hipótesis: <b>{textoHipotesis(borrador)}</b></> : 'Completa la hipótesis para poder enviarla.'}</div>
            <button type="button" className="big full" disabled={!borrador} onClick={() => enviar('hipotesis', { hipotesis: { ...borrador, coartada } })}><Icon name="check" size={22} strokeWidth={2.5} /> Enviar hipótesis</button>
            </div>
          </details>
        </>
      )}
      <Marcador v={v} />
    </div>
  );
}

// ---------------------------------------------------------------- Fase 2: apostar por las hipótesis ajenas
function veredictoPrevio(v, h) {
  const c = (m) => v.conocimiento.find((x) => x.m === m);
  if (h.forma === 'tipo') return c(h.i) ? c(h.i).t === h.t : null;
  if (c(h.i) && c(h.j)) return h.forma === 'igual' ? c(h.i).t === c(h.j).t : c(h.i).t !== c(h.j).t;
  return null;
}

export function FaseApuestas({ v, enviar, offset }) {
  const [pos, setPos] = useState({});
  const [doble, setDoble] = useState(null);
  const [censura, setCensura] = useState(null);
  const instr = v.yo.instrumento;
  const mias = v.hipotesis.find((h) => h.autorId === v.yo.id);
  const ajenas = v.hipotesis.filter((h) => h.autorId !== v.yo.id);
  const algunaPos = Object.values(pos).some(Boolean);
  const poner = (a, valor) => setPos((p) => ({ ...p, [a]: p[a] === valor ? null : valor }));
  const puedeDoble = instr.tipo === 'doble' && !instr.usado;
  const puedeCensura = instr.tipo === 'censura' && !instr.usado;
  const puedeDetector = instr.tipo === 'detector' && !instr.usado;
  const Reacciones = ({ h }) => (
    <div className="hp-reacciones">
      <small>Presiona:</small>
      {REACCIONES.map((e) => (
        <button key={e} type="button" className={h.miReaccion === e ? 'on' : ''} onClick={() => enviar('reaccion', { a: h.autorId, emoji: e })}>{e}{h.reacciones?.[e] ? <b>{h.reacciones[e]}</b> : null}</button>
      ))}
    </div>
  );

  if (v.listo) {
    return (
      <div className="hp-wrap">
        <Cabecera v={v} offset={offset} />
        <div className="hp-card hp-centro"><h3>Apuestas enviadas</h3><p className="hp-muted">Esperando a: {v.faltan.join(', ') || '…'}. Mientras tanto, ¡mete presión!</p></div>
        {ajenas.map((h) => (
          <div key={h.autorId} className="hp-hip">
            <div className="hp-hip-cab"><strong>{h.nombre}</strong><span className="hp-peso">vale ×{h.peso}</span></div>
            <p className="hp-hip-texto" style={{ marginBottom: '.3rem' }}>{textoHipotesis(h)}</p>
            <Reacciones h={h} />
          </div>
        ))}
        <Marcador v={v} />
      </div>
    );
  }

  return (
    <div className="hp-wrap">
      <Cabecera v={v} offset={offset} />
      <div className="hp-card hp-centro">
        <h2>¿Quién miente?</h2>
        <p className="hp-muted">Respalda lo que creas cierto, refuta lo que creas falso. Posiciónate en al menos una; lo que no toques no te cuesta nada. Acertar todas tus apuestas (mínimo 2) da <b>+2</b>.</p>
        <div className="hp-reglas">
          <span><b>Respaldar</b>: +1 si es cierta · −2 si es falsa</span>
          <span><b>Refutar</b>: +2 si es falsa · −2 si es cierta</span>
          <span className="hp-muted">(Se multiplica por el valor de la hipótesis)</span>
        </div>
      </div>
      <PanelConocimiento v={v} />
      <Muestras v={v} />
      <Instrumento v={v} />
      {mias && <div className="hp-card hp-mia"><small>Tu hipótesis</small><b>{textoHipotesis(mias)}</b></div>}
      {ajenas.map((h) => {
        const pre = veredictoPrevio(v, h);
        const p = pos[h.autorId] || null;
        return (
          <div key={h.autorId} className={`hp-hip ${p || ''}`}>
            <div className="hp-hip-cab"><strong>{h.nombre}</strong><span className="hp-peso">vale ×{h.peso}</span></div>
            <p className="hp-hip-texto">{textoHipotesis(h)}</p>
            {pre !== null && <div className={`hp-pista ${pre ? 'si' : 'no'}`}>{pre ? 'Coincide con lo que sabes' : 'Contradice lo que sabes'}</div>}
            {v.detector?.a === h.autorId && <div className={`hp-pista ${v.detector.verdadera ? 'si' : 'no'}`}>🔎 Detector: es {v.detector.verdadera ? 'CIERTA' : 'FALSA'}</div>}
            <div className="hp-botones">
              <button type="button" className={`si ${p === 'si' ? 'on' : ''}`} onClick={() => poner(h.autorId, 'si')}><Icon name="check" size={16} /> Respaldar</button>
              <button type="button" className={`no ${p === 'no' ? 'on' : ''}`} onClick={() => poner(h.autorId, 'no')}><Icon name="x" size={16} /> Refutar</button>
            </div>
            <Reacciones h={h} />
            {((puedeDoble && p) || puedeCensura || (puedeDetector && !v.detector)) && (
              <div className="hp-extra">
                {puedeDetector && !v.detector && <button type="button" onClick={() => enviar('detectar', { a: h.autorId })}><Icon name="eye" size={14} /> Detectar si es cierta</button>}
                {puedeDoble && p && <button type="button" className={doble === h.autorId ? 'on' : ''} onClick={() => setDoble(doble === h.autorId ? null : h.autorId)}><Icon name="scale" size={14} /> Duplicar mi apuesta</button>}
                {puedeCensura && <button type="button" className={censura === h.autorId ? 'on' : ''} onClick={() => setCensura(censura === h.autorId ? null : h.autorId)}><Icon name="eyeoff" size={14} /> Censurar esta hipótesis</button>}
              </div>
            )}
          </div>
        );
      })}
      <button type="button" className="big full" disabled={!algunaPos}
        onClick={() => enviar('apostar', { posiciones: Object.fromEntries(Object.entries(pos).filter(([, x]) => x)), doble: doble && pos[doble] ? doble : undefined, censura: censura ?? undefined })}>
        <Icon name="check" size={22} strokeWidth={2.5} /> {algunaPos ? 'Enviar apuestas' : 'Posiciónate en alguna'}
      </button>
      <Marcador v={v} />
    </div>
  );
}

// ---------------------------------------------------------------- Fase 3: resolución (revelación escalonada)
const textoPremio = (p, nombre) => {
  const n = nombre(p.id);
  if (p.clave === 'farol') return `🎭 Farol de la ronda: ${n} coló una mentira con ${p.n} ${plural(p.n, 'respaldo', 'respaldos')}`;
  if (p.clave === 'caza') return `🕵️ Cazamentiras: ${n} desenmascaró ${p.n} ${plural(p.n, 'farol', 'faroles')}`;
  if (p.clave === 'ojo') return `🎯 Ojo clínico: ${n} acertó sus ${p.n} apuestas (+2)`;
  return `🤡 Pringado de la ronda: ${n} (${p.n} pts)`;
};
const TITULOS = { farol: '🎭 Rey del farol', caza: '🕵️ Sabueso', ojo: '🎯 Ojo clínico', pringado: '🤡 El pringado' };

export function Resolucion({ v, instantanea = false }) {
  const r = v.resultado;
  const nombre = (id) => v.jugadores.find((j) => j.id === id)?.nombre ?? '?';
  // las hipótesis más «jugosas» (con más respaldos) se revelan las últimas
  const hips = [...r.hipotesis].sort((a, b) => a.respaldos.length - b.respaldos.length);
  const total = hips.length; const meta = total + 2;
  const [paso, setPaso] = useState(instantanea ? meta : 0);
  useEffect(() => {
    if (instantanea) return undefined;
    const i = setInterval(() => setPaso((p) => (p >= meta ? p : p + 1)), 1100);
    return () => clearInterval(i);
  }, [instantanea, meta]);
  const visibles = Math.max(0, Math.min(total, paso - 1));
  const fin = paso >= meta;
  const ev = r.evento && r.evento !== 'normal' ? v.evento : null;
  return (
    <>
      <div className="hp-card">
        <h3><Icon name="search" size={18} /> {paso >= 1 ? 'La verdad de esta ronda' : 'Abriendo la caja…'}</h3>
        <Muestras v={{ M: v.M }} verdad={paso >= 1 ? r.verdad : null} />
        {!fin && <button type="button" className="hp-saltar" onClick={() => setPaso(meta)}>Saltar revelación ⏭</button>}
      </div>
      {hips.slice(0, visibles).map((h) => (
        <div key={h.autorId} className={`hp-res hp-aparece ${h.anulada ? 'anulada' : h.verdadera ? 'cierta' : 'falsa'}`}>
          <div className="hp-hip-cab">
            <strong>{h.nombre}{r.ganadoras.includes(h.autorId) ? ' · hipótesis ganadora +2' : ''}</strong>
            <span className="hp-veredicto">{h.anulada ? 'CENSURADA' : h.verdadera ? '✔ CIERTA' : '✘ FARSANTE'}</span>
          </div>
          <p className="hp-hip-texto">{textoHipotesis(h)}{h.coartada ? ' (con Coartada)' : ''}</p>
          <div className="hp-gente">
            {h.respaldos.map((q) => <span key={'s' + q} className="hp-pill si">✔ {nombre(q)}{h.dobles.includes(q) ? ' ×2' : ''}</span>)}
            {h.refutan.map((q) => <span key={'n' + q} className="hp-pill no">✘ {nombre(q)}{h.dobles.includes(q) ? ' ×2' : ''}</span>)}
            {!h.respaldos.length && !h.refutan.length && <span className="hp-muted">Nadie se posicionó.</span>}
          </div>
          {!h.anulada && (
            <div className="hp-deltas">{Object.entries(h.deltas).filter(([, x]) => x !== 0).map(([q, x]) => <span key={q} className={x > 0 ? 'mas' : 'menos'}>{nombre(Number(q))} {signo(x)}</span>)}</div>
          )}
        </div>
      ))}
      {fin && (
        <>
          {r.premios?.length > 0 && (
            <div className="hp-card hp-aparece">
              <h3>🏅 Lo mejor (y lo peor) de la ronda</h3>
              {r.premios.map((p, k) => <p key={k} className="hp-premio">{textoPremio(p, nombre)}</p>)}
            </div>
          )}
          {r.usos.length > 0 && (
            <div className="hp-card hp-aparece">
              <h3>Poderes usados</h3>
              {r.usos.map((u) => <p key={u.id} className="hp-muted" style={{ margin: '.2rem 0' }}><b>{nombre(u.id)}</b> usó {INSTRUMENTOS[u.tipo].nombre} sobre la hipótesis de <b>{nombre(u.objetivo)}</b>.</p>)}
            </div>
          )}
          <div className="hp-card hp-aparece">
            <h3>Puntos de la ronda {ev ? <span className="hp-pill si">{ev.emoji} {ev.nombre}</span> : null}</h3>
            <div className="hp-marcador">
              {Object.entries(r.totales).sort((a, b) => b[1] - a[1]).map(([id, x]) => (
                <div key={id} className={`hp-fila ${Number(id) === v.yo.id ? 'yo' : ''}`}><span>{nombre(Number(id))}</span><b className={x > 0 ? 'mas' : x < 0 ? 'menos' : ''}>{signo(x)}</b></div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}

export function FaseResolucion({ v, enviar, offset, accionContinuar = true }) {
  const ultima = v.ronda >= v.rondas;
  return (
    <div className="hp-wrap">
      <Cabecera v={v} offset={offset} />
      <Resolucion key={v.ronda} v={v} />
      <Marcador v={v} />
      {accionContinuar && (v.listo
        ? <div className="hp-card hp-centro"><h3>Listo</h3><p className="hp-muted">Esperando a: {v.faltan.join(', ') || '…'}</p></div>
        : <button type="button" className="big full" onClick={() => enviar('continuar')}><Icon name="forward" size={22} /> {ultima ? 'Ver resultado final' : 'Siguiente ronda'}</button>)}
    </div>
  );
}

// ---------------------------------------------------------------- Fin
export function PantallaFin({ v, puntosTotales, children }) {
  const f = v.fin;
  const nombres = f.ganadores.map((id) => v.jugadores.find((j) => j.id === id)?.nombre).join(' y ');
  return (
    <div className="hp-wrap">
      <div className="hp-fin">
        <Icon name="trophy" size={56} strokeWidth={1.7} />
        <h1>{nombres} {f.ganadores.length > 1 ? 'tienen' : 'tiene'} la hipótesis ganadora</h1>
        <p style={{ margin: 0, fontWeight: 600 }}>Tras {v.rondas} rondas de ciencia y mentiras.</p>
      </div>
      <div className="hp-card">
        <h3>Clasificación</h3>
        <div className="hp-marcador">
          {f.tabla.map((x, i) => (
            <div key={x.id} className={`hp-fila ${f.ganadores.includes(x.id) ? 'gan' : ''} ${x.id === v.yo.id ? 'yo' : ''}`}>
              <span><b>{i + 1}</b> {x.nombre}{x.id === v.yo.id ? ' (tú)' : ''}<small className="hp-muted"> · {x.aciertos} {plural(x.aciertos, 'hipótesis cierta', 'hipótesis ciertas')}</small></span>
              <b>{x.puntos} pts{puntosTotales ? ` · total ${puntosTotales[x.id] ?? 0}` : ''}</b>
            </div>
          ))}
        </div>
      </div>
      {f.titulos?.length > 0 && (
        <div className="hp-card">
          <h3>🏆 Títulos de la partida</h3>
          {f.titulos.map((t) => <p key={t.clave} className="hp-premio"><b>{TITULOS[t.clave]}</b>: {v.jugadores.find((j) => j.id === t.id)?.nombre} <span className="hp-muted">({t.n} {plural(t.n, 'vez', 'veces')})</span></p>)}
        </div>
      )}
      {v.resultado && <details className="hp-detalle"><summary>Ver la última ronda</summary><Resolucion v={v} instantanea /></details>}
      {children}
    </div>
  );
}

// ---------------------------------------------------------------- Reglas
export function Ayuda({ onCerrar }) {
  return (
    <div className="hp-modal-fondo" onClick={onCerrar}>
      <div className="hp-modal" onClick={(e) => e.stopPropagation()}>
        <h3>¿Cómo se juega a La Hipótesis Ganadora?</h3>
        <p>Sois científicos en un congreso. Cada ronda, el laboratorio esconde una <strong>verdad</strong>: varias muestras numeradas, cada una de una sustancia (Rubí, Zafiro, Jade o Ámbar). Tú solo conoces con certeza <strong>2 de ellas</strong>. Las rondas son rápidas: ¡el reloj corre!</p>
        <h4>Cada ronda</h4>
        <ul>
          <li><strong>1. Elige tu jugada (en secreto):</strong> te ofrecemos cartas con verdades, faroles y alguna a ciegas. Tú ves las etiquetas; los demás no. También puedes montar una hipótesis a mano.</li>
          <li><strong>2. Apuesta y presiona.</strong> Se muestran todas a la vez. Respalda las que creas ciertas y refuta las que creas falsas (en al menos una). Mientras tanto puedes soltar un 🤥, 🤔 o 👍 anónimo para meter presión… o para despistar.</li>
          <li><strong>3. Revelación.</strong> Se abre la caja y se van desvelando las hipótesis una a una. ¡Aquí caen los mentirosos!</li>
        </ul>
        <h4>Puntos (por el valor de la hipótesis)</h4>
        <ul>
          <li><strong>Hipótesis cierta:</strong> su autor gana 1 + 1 por cada respaldo; quien la respaldó gana 1; quien la refutó pierde 2.</li>
          <li><strong>Hipótesis falsa:</strong> su autor gana 2 por cada persona que la respaldó (¡el farol funcionó!) y pierde 2 por cada refutación; quienes la respaldaron pierden 2 y quienes la refutaron ganan 2.</li>
          <li><strong>Hipótesis ganadora de la ronda</strong> (cierta y con más respaldos): +2 extra.</li>
          <li><strong>Ojo clínico:</strong> si aciertas todas tus apuestas (mínimo 2): +2 extra.</li>
        </ul>
        <h4>Eventos de ronda</h4>
        <ul>
          <li><strong>💥 Puntos dobles:</strong> todo vale el doble. ¡La última ronda siempre lo es!</li>
          <li><strong>📣 Rumor:</strong> una muestra se filtra y todos la conocen.</li>
          <li><strong>🎯 Caza de faroles:</strong> cada refutación acertada de una hipótesis falsa da +1 extra.</li>
        </ul>
        <h4>Poderes (uno nuevo cada ronda: úsalo o se pierde)</h4>
        <ul>{Object.values(INSTRUMENTOS).map((i) => <li key={i.nombre}><strong>{i.nombre} ({i.cuando.toLowerCase()}):</strong> {i.desc}</li>)}</ul>
        <p>Cuando casi todos han terminado, al resto le quedan solo 10 segundos. Gana quien tenga más reputación al final; en caso de empate, quien haya formulado más hipótesis ciertas.</p>
        <div className="hp-modal-acciones"><button type="button" className="big full" onClick={onCerrar}>Entendido</button></div>
      </div>
    </div>
  );
}

export function PantallaDeFase({ v, enviar, offset }) {
  if (v.fase === 'hipotesis') return <FaseHipotesis key={v.ronda} v={v} enviar={enviar} offset={offset} />;
  if (v.fase === 'apuestas') return <FaseApuestas key={v.ronda} v={v} enviar={enviar} offset={offset} />;
  if (v.fase === 'resolucion') return <FaseResolucion v={v} enviar={enviar} offset={offset} />;
  return null;
}
