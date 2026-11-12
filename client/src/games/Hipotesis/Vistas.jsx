// client/src/games/Hipotesis/Vistas.jsx
// Pantallas de «La Hipótesis Ganadora» (las comparten el modo online y el de un solo dispositivo), con el estilo
// de los juegos renovados: cabecera con degradado, tarjetas blancas, botones en relieve y barra abajo.
// Reciben `v` (vista de un jugador que genera engine.vistaDe) y `enviar(tipo, datos)`.
import React, { useEffect, useMemo, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import { VARIANTES, PLANTILLAS, EVENTOS, REACCIONES, AJUSTES, rangoN, evaluar, textoHipotesis } from './engine.js';
import './Hipotesis.css';

export const COLORES = ['#ef4444', '#2563eb', '#16a34a', '#f59e0b', '#9333ea', '#ec4899', '#0d9488', '#ea580c'];
export const colorDe = (id) => COLORES[((Number(id) || 1) - 1) % COLORES.length];
const inicial = (n) => (n || '?').trim().charAt(0).toUpperCase();

export function Avatar({ id, nombre, grande = false }) {
  if (id == null) return <span className="hpp-avatar anon">?</span>;
  return <span className={`hpp-avatar${grande ? ' grande' : ''}`} style={{ '--c': colorDe(id) }}>{inicial(nombre)}</span>;
}

function useAhora(activo) {
  const [, setT] = useState(0);
  useEffect(() => {
    if (!activo) return undefined;
    const i = setInterval(() => setT((x) => x + 1), 250);
    return () => clearInterval(i);
  }, [activo]);
  return Date.now();
}

// ---------------------------------------------------------------- Cabecera
export function Hero({ v, offset = 0, onSalir, etiqueta, titulo, clase = '' }) {
  const ahora = useAhora(Boolean(v.limite)) + offset;
  const resto = v.limite ? Math.max(0, v.limite - ahora) : null;
  const ev = EVENTOS[v.evento];
  return (
    <header className={`hpp-hero ${clase}`}>
      <span className="hpp-burbujas" aria-hidden="true" />
      <div className="hpp-hero-top">
        <button type="button" className="hpp-salir" onClick={onSalir}><Icon name="door" size={15} /> Salir</button>
        <div className="hpp-chips">
          {v.fase !== 'fin' && <span className="hpp-chip">Ronda {v.ronda}/{v.rondas}</span>}
          {v.fase !== 'fin' && v.evento !== 'normal' && <span className="hpp-chip evento" title={ev.desc}>{ev.emoji} {ev.nombre}</span>}
          {resto != null && <span className={`hpp-chip${resto <= 10000 ? ' urgente' : ''}`}><Icon name="clock" size={13} /> {Math.ceil(resto / 1000)} s</span>}
        </div>
      </div>
      {etiqueta && <p className="hpp-hero-etiqueta">{etiqueta}</p>}
      {titulo && <h1 className="hpp-hero-titulo">{titulo}</h1>}
      <div className="hpp-marcador">
        {[...v.jugadores].sort((a, b) => b.puntos - a.puntos).map((j) => (
          <span key={j.id} className={`hpp-marca${j.id === v.yo?.id ? ' yo' : ''}${j.fuera ? ' fuera' : ''}`}>
            <Avatar id={j.id} nombre={j.nombre} />
            <span className="hpp-marca-nombre">{j.nombre}</span>
            <strong>{j.puntos}</strong>
            {v.fase !== 'fin' && v.fase !== 'revelacion' && j.listo && <b>✓</b>}
            {v.resultado && v.fase === 'revelacion' && v.resultado.deltas[j.id] ? <em className={v.resultado.deltas[j.id] > 0 ? 'mas' : 'menos'}>{v.resultado.deltas[j.id] > 0 ? '+' : ''}{v.resultado.deltas[j.id]}</em> : null}
          </span>
        ))}
      </div>
    </header>
  );
}

// ---------------------------------------------------------------- Casillas
export function Valor({ variante, v, grande = false }) {
  const V = VARIANTES[variante];
  const x = V.valores[v];
  return <span className={`hpp-valor${V.numerico ? ' num' : ''}${grande ? ' grande' : ''}`} style={{ '--c': x.c }} title={x.n}>{x.e}</span>;
}

function Tablero({ v, titulo, voltear = false }) {
  const V = VARIANTES[v.variante];
  return (
    <div className="hpp-tarjeta">
      <p className="hpp-etiqueta"><Icon name={V.icono} size={14} /> {titulo || `${V.nombre} · ${V.intro}`}</p>
      <div className="hpp-casillas" style={{ '--k': v.K }}>
        {v.casillas.map((c) => (
          <div key={c.i} className={`hpp-casilla${c.v != null ? ' vista' : ''}${c.mia ? ' mia' : ''}${c.rumor ? ' rumor' : ''}${voltear ? ' voltear' : ''}`} style={{ '--d': `${c.i * 90}ms` }}>
            <small>{V.celda} {c.i + 1}</small>
            {c.v != null ? <Valor variante={v.variante} v={c.v} grande /> : <span className="hpp-incognita">?</span>}
            {c.rumor && <i>rumor</i>}
          </div>
        ))}
      </div>
      {!voltear && <p className="hpp-pista">Solo tú ves lo que hay en tus casillas. Lo demás… tendrás que deducirlo de lo que digan.</p>}
    </div>
  );
}

// ---------------------------------------------------------------- Formular
/** ¿Qué sabe el jugador de su hipótesis? true / false / null (no lo sabe seguro). */
function loQueSabes(v, h) {
  if (!h) return null;
  const conocidas = Object.fromEntries(v.casillas.filter((c) => c.v != null).map((c) => [c.i, c.v]));
  const celdas = ['i', 'j'].filter((k) => PLANTILLAS[h.pl].params.includes(k)).map((k) => h.p[k]);
  if (celdas.length) {
    if (!celdas.every((i) => conocidas[i] != null)) return null;
    const t = Array.from({ length: v.K }, (_, i) => conocidas[i] ?? 0);
    return evaluar(v.variante, h, t);
  }
  return null; // las de recuento dependen de casillas que no ves
}

function Constructor({ v, enviar }) {
  const V = VARIANTES[v.variante];
  const [pl, setPl] = useState(V.plantillas[0]);
  const [p, setP] = useState({});
  useEffect(() => { setPl(V.plantillas[0]); setP({}); }, [v.ronda]); // eslint-disable-line react-hooks/exhaustive-deps
  const params = PLANTILLAS[pl].params;
  const [lo, hi] = rangoN(v.variante, pl, v.K);
  const completo = params.every((k) => p[k] != null);
  const h = completo ? { pl, p } : null;
  const error = h && ((p.i != null && p.j != null && params.includes('j') && p.i === p.j) || (p.v != null && p.w != null && params.includes('w') && p.v === p.w));
  const sabes = h && !error ? loQueSabes(v, h) : null;
  const texto = h && !error ? textoHipotesis(v.variante, h) : null;
  const cambiarPl = (x) => {
    setPl(x);
    setP((prev) => {
      const nuevo = {};
      PLANTILLAS[x].params.forEach((k) => { if (k !== 'n' && prev[k] != null) nuevo[k] = prev[k]; });
      if (PLANTILLAS[x].params.includes('n')) { const [a, b] = rangoN(v.variante, x, v.K); nuevo.n = Math.round((a + b) / 2); }
      return nuevo;
    });
  };
  const fijar = (k, x) => setP((prev) => ({ ...prev, [k]: x }));

  const selCasilla = (k, etiqueta) => (
    <div className="hpp-campo">
      <span className="hpp-campo-titulo">{etiqueta}</span>
      <div className="hpp-elegir-casillas">
        {v.casillas.map((c) => (
          <button key={c.i} type="button" className={`hpp-mini-casilla${p[k] === c.i ? ' sel' : ''}${c.v != null ? ' vista' : ''}`} onClick={() => fijar(k, c.i)}>
            <small>{c.i + 1}</small>{c.v != null ? <Valor variante={v.variante} v={c.v} /> : <span className="hpp-incognita mini">?</span>}
          </button>
        ))}
      </div>
    </div>
  );
  const selValor = (k, etiqueta) => (
    <div className="hpp-campo">
      <span className="hpp-campo-titulo">{etiqueta}</span>
      <div className="hpp-elegir-valores">
        {V.valores.map((x, idx) => (
          <button key={idx} type="button" className={`hpp-mini-valor${p[k] === idx ? ' sel' : ''}`} onClick={() => fijar(k, idx)}>
            <Valor variante={v.variante} v={idx} />{!V.numerico && <span>{x.n.replace(/^una? /, '')}</span>}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <>
    <div className="hpp-tarjeta">
      <p className="hpp-etiqueta"><Icon name="bulb" size={14} /> Formula tu hipótesis (cierta… o un farol)</p>
      <div className="hpp-pildoras">
        {V.plantillas.map((x) => (
          <button key={x} type="button" className={`hpp-pildora${pl === x ? ' activo' : ''}`} onClick={() => cambiarPl(x)}>{PLANTILLAS[x].nombre}</button>
        ))}
      </div>
      {params.includes('i') && selCasilla('i', params.includes('j') ? `Primer${V.articulo === 'la' ? 'a' : ''} ${V.celda.toLowerCase()}` : V.celda)}
      {params.includes('j') && selCasilla('j', `Segund${V.articulo === 'la' ? 'a' : 'o'} ${V.celda.toLowerCase()}`)}
      {params.includes('v') && selValor('v', params.includes('w') ? 'Hay más de…' : V.numerico ? 'Número' : 'Valor')}
      {params.includes('w') && selValor('w', 'que de…')}
      {params.includes('n') && (
        <div className="hpp-campo">
          <span className="hpp-campo-titulo">Número</span>
          <div className="hpp-stepper">
            <button type="button" onClick={() => fijar('n', Math.max(lo, (p.n ?? lo) - 1))} disabled={(p.n ?? lo) <= lo}>−</button>
            <strong>{p.n ?? lo}</strong>
            <button type="button" onClick={() => fijar('n', Math.min(hi, (p.n ?? lo) + 1))} disabled={(p.n ?? lo) >= hi}>+</button>
          </div>
        </div>
      )}
      <div className={`hpp-vista-previa${texto ? '' : ' vacia'}`}>
        {error ? 'Elige dos distintos.' : texto ? <>«{texto}»</> : 'Completa los huecos…'}
        {texto && <small className={sabes === true ? 'cierta' : sabes === false ? 'falsa' : ''}>
          {sabes === true ? 'Según lo que ves: es CIERTA' : sabes === false ? 'Según lo que ves: es FALSA (un farol)' : 'No lo sabes seguro: ¡arriésgate!'}
        </small>}
      </div>
      {v.soyTopo && <p className="hpp-topo">🕵️ Eres el topo: tu misión es MENTIR y que la mayoría se lo crea (+3).</p>}
    </div>
    <div className="hpp-barra">
      <button type="button" className="hpp-boton grande" disabled={!texto} onClick={() => enviar('formular', { hipotesis: h })}>
        <Icon name="check" size={20} strokeWidth={2.5} /> {v.yo.hipotesis ? 'Cambiar mi hipótesis' : 'Formular'}
      </button>
    </div>
    </>
  );
}

function Esperando({ v, texto }) {
  const pend = v.jugadores.filter((j) => v.faltan.includes(j.id));
  return (
    <div className="hpp-esperando">
      <strong><Icon name="clock" size={16} /> {texto}</strong>
      {pend.length > 0 && <span>Falta: {pend.map((j) => j.nombre).join(', ')}</span>}
    </div>
  );
}

// ---------------------------------------------------------------- Juicio
function Juicio({ v, enviar }) {
  const [votos, setVotos] = useState({});
  const [seguro, setSeguro] = useState(null);
  useEffect(() => { setVotos(v.yo.votos || {}); setSeguro(v.yo.seguro); }, [v.ronda]); // eslint-disable-line react-hooks/exhaustive-deps
  const ajenas = v.hipotesis.filter((h) => !h.mia);
  const hechos = ajenas.filter((h) => votos[h.hid]).length;
  const nombre = (id) => v.jugadores.find((j) => j.id === id)?.nombre ?? 'Anónimo';
  const enviado = v.yo.listo;

  return (
    <>
      <div className="hpp-tarjeta">
        <p className="hpp-etiqueta"><Icon name="scale" size={14} /> ¿Te fías? Decide en cada hipótesis · marca una con ⭐ si estás seguro (×2)</p>
        <div className="hpp-hipotesis">
          {v.hipotesis.map((h) => (
            <div key={h.hid} className={`hpp-hip${h.mia ? ' mia' : ''}${votos[h.hid] === 'si' ? ' si' : votos[h.hid] === 'no' ? ' no' : ''}`}>
              <div className="hpp-hip-cab">
                <Avatar id={h.autorId} nombre={nombre(h.autorId)} />
                <span>{h.mia ? 'Tu hipótesis' : h.autorId == null ? 'Alguien (a ciegas)' : nombre(h.autorId)}</span>
                {!h.mia && !enviado && (
                  <button type="button" className={`hpp-seguro${seguro === h.hid ? ' activo' : ''}`} disabled={!votos[h.hid]} title="¡Seguro! (doble o nada)"
                    onClick={() => setSeguro(seguro === h.hid ? null : h.hid)}>⭐</button>
                )}
                {enviado && seguro === h.hid && <span className="hpp-seguro activo">⭐</span>}
              </div>
              <p className="hpp-hip-texto">«{h.texto}»</p>
              {!h.mia && (
                <div className="hpp-dos">
                  <button type="button" className={`hpp-voto si${votos[h.hid] === 'si' ? ' activo' : ''}`} disabled={enviado} onClick={() => setVotos({ ...votos, [h.hid]: 'si' })}>✅ Me fío</button>
                  <button type="button" className={`hpp-voto no${votos[h.hid] === 'no' ? ' activo' : ''}`} disabled={enviado} onClick={() => setVotos({ ...votos, [h.hid]: 'no' })}>❌ Es mentira</button>
                </div>
              )}
              <div className="hpp-reacciones">
                {REACCIONES.map((e) => (
                  <button key={e} type="button" className={`hpp-reaccion${h.miReaccion === e ? ' activo' : ''}`} onClick={() => enviar('reaccion', { hid: h.hid, emoji: e })}>
                    {e}{h.reacciones[e] ? <b>{h.reacciones[e]}</b> : null}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="hpp-barra">
        {enviado ? <Esperando v={v} texto="Veredicto enviado" /> : (
          <button type="button" className="hpp-boton grande" disabled={hechos < ajenas.length} onClick={() => enviar('juzgar', { votos, seguro })}>
            <Icon name="check" size={20} strokeWidth={2.5} /> {hechos < ajenas.length ? `Decide en todas (${hechos}/${ajenas.length})` : 'Enviar mi veredicto'}
          </button>
        )}
      </div>
    </>
  );
}

// ---------------------------------------------------------------- Revelación
function Revelacion({ v, enviar, local }) {
  const r = v.resultado;
  const [mostradas, setMostradas] = useState(0);
  useEffect(() => {
    setMostradas(0);
    const id = setInterval(() => setMostradas((x) => { if (x >= r.hipotesis.length) { clearInterval(id); return x; } return x + 1; }), 1100);
    return () => clearInterval(id);
  }, [v.ronda, r.hipotesis.length]);
  const nombre = (id) => v.jugadores.find((j) => j.id === id)?.nombre ?? '?';
  const todas = mostradas >= r.hipotesis.length;
  const mios = r.motivos[v.yo?.id] || [];
  return (
    <>
      <Tablero v={v} titulo="La verdad absoluta" voltear />
      <div className="hpp-tarjeta">
        <p className="hpp-etiqueta"><Icon name="search" size={14} /> Comprobando hipótesis… {Math.min(mostradas, r.hipotesis.length)}/{r.hipotesis.length}</p>
        {r.hipotesis.length === 0 && <p className="hpp-texto">Nadie formuló ninguna hipótesis esta ronda.</p>}
        <div className="hpp-hipotesis">
          {r.hipotesis.map((h, k) => {
            const visible = k < mostradas;
            return (
              <div key={h.hid} className={`hpp-hip resuelta${visible ? (h.cierta ? ' cierta' : ' falsa') : ' oculta'}`}>
                <div className="hpp-hip-cab">
                  <Avatar id={h.autorId} nombre={nombre(h.autorId)} />
                  <span>{nombre(h.autorId)}{h.autorId === r.topoId ? ' 🕵️ (topo)' : ''}</span>
                </div>
                <p className="hpp-hip-texto">«{h.texto}»</p>
                {visible ? (
                  <>
                    <span className={`hpp-sello ${h.cierta ? 'cierta' : 'falsa'}`}>{h.cierta ? 'CIERTA' : 'FALSA'}</span>
                    <div className="hpp-quien">
                      <span>✅ {h.creen.length ? h.creen.map((id) => <Avatar key={id} id={id} nombre={nombre(id)} />) : 'nadie'}</span>
                      <span>❌ {h.dudan.length ? h.dudan.map((id) => <Avatar key={id} id={id} nombre={nombre(id)} />) : 'nadie'}</span>
                    </div>
                    {h.ganadora && <p className="hpp-ganadora">🏆 ¡Hipótesis ganadora! La que más gente se creyó (+{AJUSTES.ganadora})</p>}
                  </>
                ) : <p className="hpp-pista izquierda">🔬 Analizando…</p>}
              </div>
            );
          })}
        </div>
      </div>
      {todas && v.yo && !local && (
        <div className="hpp-tarjeta">
          <p className="hpp-etiqueta">Tus puntos esta ronda {v.evento === 'doble' ? '(×2)' : ''}</p>
          {mios.length === 0 ? <p className="hpp-texto">Esta ronda no has sumado ni restado nada.</p> : (
            <div className="hpp-motivos">
              {mios.map((m, i) => <div key={i} className={m.n > 0 ? 'mas' : 'menos'}><span>{m.texto}</span><strong>{m.n > 0 ? '+' : ''}{m.n}</strong></div>)}
            </div>
          )}
        </div>
      )}
      {todas && local && (
        <div className="hpp-tarjeta">
          <p className="hpp-etiqueta">Puntos de la ronda {v.evento === 'doble' ? '(×2)' : ''}</p>
          <div className="hpp-motivos">
            {v.jugadores.map((j) => <div key={j.id} className={(r.deltas[j.id] || 0) >= 0 ? 'mas' : 'menos'}><span><Avatar id={j.id} nombre={j.nombre} /> {j.nombre}</span><strong>{r.deltas[j.id] > 0 ? '+' : ''}{r.deltas[j.id] || 0}</strong></div>)}
          </div>
        </div>
      )}
      <div className="hpp-barra">
        {v.yo?.listo ? <Esperando v={v} texto="Esperando a los demás" /> : (
          <button type="button" className="hpp-boton grande" disabled={!todas} onClick={() => enviar('continuar')}>
            <Icon name="forward" size={20} /> {v.ronda >= v.rondas ? 'Ver el resultado final' : 'Siguiente ronda'}
          </button>
        )}
      </div>
    </>
  );
}

// ---------------------------------------------------------------- Pantallas
export function PantallaJuego({ v, enviar, onSalir, offset = 0, local = false, admin = null }) {
  const V = VARIANTES[v.variante];
  const ev = EVENTOS[v.evento];
  const fases = { formular: 'Formula tu hipótesis', juicio: '¿Verdad o farol?', revelacion: 'La hora de la verdad' };
  const nuevaRonda = useMemo(() => v.fase === 'formular', [v.fase]);
  return (
    <>
      <Hero v={v} offset={offset} onSalir={onSalir} etiqueta={`${V.nombre} · ronda ${v.ronda}`} titulo={fases[v.fase]} clase={v.fase} />
      {nuevaRonda && (
        <div className={`hpp-evento${v.evento === 'normal' ? ' tranquilo' : ''}`}>
          <span className="hpp-evento-emoji">{ev.emoji}</span>
          <div><strong>{ev.nombre}</strong><span>{ev.desc}</span></div>
        </div>
      )}
      {v.fase === 'formular' && (
        <>
          <Tablero v={v} />
          {v.yo.hipotesis && <div className="hpp-tarjeta hpp-mia"><p className="hpp-etiqueta">Tu hipótesis (puedes cambiarla hasta que todos terminen)</p><p className="hpp-hip-texto">«{v.yo.hipotesis.texto}»</p><Esperando v={v} texto="Esperando al resto" /></div>}
          <Constructor v={v} enviar={enviar} />
        </>
      )}
      {v.fase === 'juicio' && (
        <>
          <Tablero v={v} titulo={`Lo que tú sabes · ${V.nombre}`} />
          {v.evento === 'ciegas' && <p className="hpp-aviso">🙈 Juicio a ciegas: no sabes de quién es cada hipótesis.</p>}
          <Juicio v={v} enviar={enviar} />
        </>
      )}
      {v.fase === 'revelacion' && <Revelacion v={v} enviar={enviar} local={local} />}
      {admin?.esAdmin && v.faltan.length > 0 && v.fase !== 'revelacion' && !v.faltan.includes(v.yo.id) && (
        <div className="hpp-barra estatica">
          <button type="button" className="hpp-enlace" onClick={admin.onForzar}><Icon name="forward" size={15} /> Seguir sin esperar a {v.faltan.length === 1 ? v.jugadores.find((j) => j.id === v.faltan[0])?.nombre : `${v.faltan.length} jugadores`}</button>
        </div>
      )}
    </>
  );
}

export function PantallaFin({ v, onSalir, children }) {
  const f = v.fin;
  const nombre = (id) => v.jugadores.find((j) => j.id === id)?.nombre ?? '?';
  const top = f.tabla.filter((x) => !x.fuera).slice(0, 3);
  const colocacion = top.length === 3 ? [top[1], top[0], top[2]] : top.length === 2 ? [top[1], top[0]] : top;
  const alturas = ['primero', 'segundo', 'tercero'];
  const ganadores = f.ganadores.map(nombre);
  return (
    <>
      <Hero v={v} onSalir={onSalir} etiqueta="Fin del congreso" titulo={ganadores.length > 1 ? `Empate: ${ganadores.join(' y ')}` : `¡Gana ${ganadores[0]}!`} clase="fin" />
      <div className="hpp-tarjeta hpp-centro">
        <div className="hpp-podio">
          {colocacion.map((x) => {
            // empatados (mismos puntos y aciertos) comparten puesto
            const puesto = top.filter((o) => o.puntos > x.puntos || (o.puntos === x.puntos && o.aciertos > x.aciertos)).length;
            return (
              <div key={x.id} className={`hpp-podio-col ${alturas[puesto]}`} style={{ '--c': colorDe(x.id) }}>
                <Avatar id={x.id} nombre={x.nombre} grande />
                <span className="hpp-podio-nombre">{x.nombre}{x.id === v.yo?.id ? ' (tú)' : ''}</span>
                <span className="hpp-podio-pts">{x.puntos} pts</span>
                <span className="hpp-podio-base">{puesto + 1}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="hpp-premios">
        {f.premios.mentiroso && <div><span>🤥</span><strong>Gran mentiroso</strong><small>{nombre(f.premios.mentiroso.id)} · {f.premios.mentiroso.n} engañados</small></div>}
        {f.premios.detective && <div><span>🔍</span><strong>Detective</strong><small>{nombre(f.premios.detective.id)} · {f.premios.detective.n} aciertos</small></div>}
      </div>
      <div className="hpp-tarjeta">
        <p className="hpp-etiqueta">Clasificación</p>
        <ol className="hpp-ranking">
          {f.tabla.map((x, i) => (
            <li key={x.id} className={f.ganadores.includes(x.id) ? 'lider' : ''}>
              <span className="hpp-pos">{i + 1}</span><Avatar id={x.id} nombre={x.nombre} />
              <span className="hpp-ranking-nombre">{x.nombre}{x.fuera ? ' (salió)' : ''}</span>
              <small>{x.aciertos} ✔ · {x.engaños} 🤥</small>
              <strong>{x.puntos}</strong>
            </li>
          ))}
        </ol>
      </div>
      {children}
    </>
  );
}

export function Ayuda({ onCerrar, titulo, descripcion }) {
  return (
    <div className="rg-modal-fondo" onClick={onCerrar}>
      <div className="rg-modal qq-modal-ayuda" onClick={(e) => e.stopPropagation()}>
        <div className="qq-modal-ayuda-header">
          <span className="qq-ayuda-badge">❓ Cómo jugar</span>
          <h3>{titulo}</h3>
        </div>
        <div className="qq-modal-ayuda-body">
          {descripcion && <p>{descripcion}</p>}
          <p className="hpp-ayuda-sub">🔬 Cada ronda</p>
          <ol>
            <li><strong>La verdad absoluta:</strong> hay una fila de casillas ocultas (tubos, cartas, casas o dígitos). Tú solo ves unas pocas.</li>
            <li><strong>Formula</strong> en secreto una hipótesis sobre la verdad. Puede ser cierta… o un farol.</li>
            <li><strong>Juicio:</strong> se desvelan todas las hipótesis y decides en cada una si te fías ✅ o es mentira ❌. Marca una con ⭐ si estás seguro.</li>
            <li><strong>La hora de la verdad:</strong> se descubre todo y se reparten los puntos.</li>
          </ol>
          <p className="hpp-ayuda-sub">🏆 Puntos</p>
          <ul>
            <li>Aciertas tu juicio: +{AJUSTES.puntosAcierto} (con ⭐: +{AJUSTES.puntosSeguro}, pero si fallas con ⭐: {AJUSTES.penalSeguro}).</li>
            <li>Tu hipótesis era cierta: +{AJUSTES.autorCierta} por cada uno que se la creyó.</li>
            <li>Tu hipótesis era un farol: +{AJUSTES.autorFarol} por cada uno que picó y {AJUSTES.autorPillado} por cada uno que te pilló.</li>
            <li>La hipótesis que más gente se cree es la <strong>hipótesis ganadora</strong>: +{AJUSTES.ganadora}.</li>
          </ul>
          <p className="hpp-ayuda-sub">🎲 Escenarios y sorpresas</p>
          <ul>
            {Object.values(VARIANTES).map((x) => <li key={x.nombre}><strong>{x.nombre}:</strong> {x.intro}</li>)}
          </ul>
          <ul>
            {Object.values(EVENTOS).map((e) => <li key={e.nombre}>{e.emoji} <strong>{e.nombre}:</strong> {e.desc}</li>)}
          </ul>
        </div>
        <button type="button" className="big full qq-btn-principal" onClick={onCerrar}>¡Entendido!</button>
      </div>
    </div>
  );
}
