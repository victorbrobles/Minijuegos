// client/src/games/Reinos/Partida.jsx
// Pantallas de «Los Siete Reinos» (online y en un dispositivo): órdenes secretas, diplomacia, crónica y final.
import React, { useMemo, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import Mapa from './Mapa.jsx';
import CronicaBonita from './Cronica.jsx';
import { Pildoras, AvisoTurno } from '../Pulsador/Vistas.jsx';
import { BloqueConfig } from '../../components/MenuJuego.jsx';
import { ACCIONES, AJUSTES, TIPOS, OPCIONES_RONDAS } from './engine.js';
import './Reinos.css';

const reinoDe = (v, id) => v.reinos.find((r) => r.id === id);
const nombreT = (x) => x.nombre || TIPOS[x.tipo].nombre;
const sonAliados = (v, a, b) => v.alianzas.some((al) => al.includes(a) && al.includes(b));

function Escudo({ r, chico = false }) {
  return <span className={`rnp-escudo${chico ? ' chico' : ''}`} style={{ '--c': r.c }}>{r.e}</span>;
}

export function Cabecera({ v, onSalir, titulo, etiqueta }) {
  const yo = v.yo ? reinoDe(v, v.yo.id) : null;
  return (
    <header className="pzp-hero">
      <span className="pzp-hero-fondo" aria-hidden="true">{yo?.e || '👑'}</span>
      <div className="pzp-hero-top">
        <button type="button" className="pzp-salir" onClick={onSalir}><Icon name="door" size={15} /> Salir</button>
        <span className="pzp-chip">👑 Ronda {v.ronda}/{v.rondas}</span>
      </div>
      {etiqueta && <p className="pzp-hero-etiqueta">{etiqueta}</p>}
      {titulo && <h1 className="pzp-hero-titulo">{titulo}</h1>}
      <div className="pzp-marcador">
        {v.reinos.map((r) => (
          <span key={r.id} className={`pzp-marca${r.id === v.yo?.id ? ' yo' : ''}${r.eliminado || r.fuera ? ' fuera' : ''}`}>
            <Escudo r={r} chico />
            <span className="pzp-marca-nombre">{r.jugador}</span>
            <span className="pzp-marca-datos">{r.tronos}👑 {r.territorios}⬢</span>
            {v.yo && r.id !== v.yo.id && sonAliados(v, r.id, v.yo.id) && <b className="mas">🤝</b>}
            {r.traiciones > 0 && <b className="menos">🗡️</b>}
          </span>
        ))}
      </div>
    </header>
  );
}

function Recursos({ v }) {
  const yo = v.yo;
  const r = reinoDe(v, yo.id);
  const [verObj, setVerObj] = useState(false);
  return (
    <div className="pzp-tarjeta rnp-recursos">
      <div className="rnp-reino"><Escudo r={r} /><div><strong>{r.nombre}</strong><small>{r.jugador}</small></div></div>
      <div className="rnp-cifras">
        <span>🪙 <strong>{yo.oro}</strong><small>oro{yo.ingresos ? ` · +${yo.ingresos.oro}` : ''}</small></span>
        <span>🌾 <strong>{yo.alimento}</strong><small>alimento{yo.ingresos ? ` · +${yo.ingresos.alimento} −${yo.ingresos.comen}` : ''}</small></span>
        <span>🪖 <strong>{r.soldados}</strong><small>soldados</small></span>
        <span>👑 <strong>{r.tronos}</strong><small>tronos</small></span>
      </div>
      <button type="button" className="pzp-enlace oscuro" onClick={() => setVerObj((x) => !x)}>🎯 Objetivos secretos {verObj ? '▲' : '▼'}</button>
      {verObj && (
        <ul className="rnp-objetivos">
          {yo.objetivos.map((o) => <li key={o.id} className={o.cumplido ? 'si' : ''}><strong>{o.cumplido ? '✅' : '⬜'} {o.nombre}</strong><small>{o.desc}</small></li>)}
        </ul>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- Órdenes
const COSTE = (a) => {
  if (a.tipo === 'entrenar') return { oro: a.soldados * AJUSTES.coste.soldadoOro, alimento: a.soldados * AJUSTES.coste.soldadoAlimento };
  if (a.tipo === 'fortificar') return { oro: AJUSTES.coste.muralla, alimento: 0 };
  if (a.tipo === 'comerciar') return a.da === 'oro' ? { oro: a.lotes * AJUSTES.mercado.da, alimento: 0 } : { oro: 0, alimento: a.lotes * AJUSTES.mercado.da };
  if (a.tipo === 'negociar' && a.clase === 'intercambio') return { oro: a.doy.oro, alimento: a.doy.alimento };
  return { oro: 0, alimento: 0 };
};
function textoOrden(v, a) {
  const T = (id) => nombreT(v.mapa[id]);
  if (a.tipo === 'conquistar') {
    const d = v.mapa[a.hacia];
    const verbo = d.dueno === v.yo.id ? 'Refuerzas' : 'Atacas';
    return `${verbo} ${T(a.hacia)} con ${a.soldados} desde ${T(a.desde)}`;
  }
  if (a.tipo === 'entrenar') return `Entrenas ${a.soldados} soldados en ${T(a.en)}`;
  if (a.tipo === 'fortificar') return `Muralla en ${T(a.en)} (nivel ${v.mapa[a.en].muralla + 1})`;
  if (a.tipo === 'comerciar') return `Mercado: ${a.lotes * AJUSTES.mercado.da} de ${a.da} → ${a.lotes * AJUSTES.mercado.recibe} de ${a.da === 'oro' ? 'alimento' : 'oro'}`;
  const otro = reinoDe(v, a.a)?.nombre;
  if (a.clase === 'alianza') return `Propones alianza al ${otro}`;
  if (a.clase === 'romper') return `Rompes la alianza con el ${otro}`;
  return `Intercambio con el ${otro}: das ${a.doy.oro}🪙 ${a.doy.alimento}🌾, pides ${a.pido.oro}🪙 ${a.pido.alimento}🌾`;
}

function Stepper({ valor, min, max, onCambiar, sufijo }) {
  return (
    <div className="rnp-stepper">
      <button type="button" onClick={() => onCambiar(Math.max(min, valor - 1))} disabled={valor <= min}>−</button>
      <strong>{valor}{sufijo}</strong>
      <button type="button" onClick={() => onCambiar(Math.min(max, valor + 1))} disabled={valor >= max}>+</button>
    </div>
  );
}

/** Construye una orden paso a paso (tocando el mapa cuando hace falta). */
function NuevaOrden({ v, tipo, disponibles, onAnadir, onCancelar, sel, setSel }) {
  const [n, setN] = useState(1);
  const [da, setDa] = useState('oro');
  const [otro, setOtro] = useState(null);
  const [clase, setClase] = useState('alianza');
  const [doy, setDoy] = useState({ oro: 0, alimento: 0 });
  const [pido, setPido] = useState({ oro: 0, alimento: 0 });
  const A = ACCIONES[tipo];
  const yo = v.yo;
  const rivales = v.reinos.filter((r) => r.id !== yo.id && !r.fuera && !r.eliminado);
  let cuerpo = null; let orden = null;
  if (tipo === 'conquistar') {
    const o = sel.desde != null ? v.mapa[sel.desde] : null;
    const d = sel.hacia != null ? v.mapa[sel.hacia] : null;
    const max = o ? Math.max(0, o.soldados - (disponibles.salen[o.id] || 0)) : 0;
    const traicion = d && d.dueno != null && d.dueno !== yo.id && sonAliados(v, d.dueno, yo.id);
    cuerpo = (
      <>
        <p className="rnp-paso">{!o ? '1. Toca en el mapa un territorio tuyo con soldados.' : !d ? `2. Toca un territorio vecino de ${nombreT(o)}.` : `${d.dueno === yo.id ? 'Refuerzas' : 'Atacas'} ${nombreT(d)} (${d.soldados} ${d.soldados === 1 ? 'soldado' : 'soldados'}${d.muralla ? ` + muralla ${d.muralla}` : ''}).`}</p>
        {o && d && max > 0 && <Stepper valor={Math.min(n, max)} min={1} max={max} onCambiar={setN} sufijo=" soldados" />}
        {traicion && <p className="rnp-aviso">🗡️ ¡Es de tu aliado! Atacarle es una traición: rompe la alianza y resta {Math.abs(AJUSTES.puntos.traicion)} puntos al final.</p>}
      </>
    );
    if (o && d && max > 0) orden = { tipo, desde: o.id, hacia: d.id, soldados: Math.min(n, max) };
  } else if (tipo === 'entrenar' || tipo === 'fortificar') {
    const x = sel.en != null ? v.mapa[sel.en] : null;
    cuerpo = (
      <>
        <p className="rnp-paso">{x ? `${tipo === 'entrenar' ? 'Entrenas en' : 'Fortificas'} ${nombreT(x)}${tipo === 'fortificar' ? ` (muralla ${x.muralla} → ${x.muralla + 1})` : ''}.` : 'Toca en el mapa un territorio tuyo.'}</p>
        {x && tipo === 'entrenar' && <Stepper valor={n} min={1} max={AJUSTES.maxEntrenar} onCambiar={setN} sufijo=" soldados" />}
      </>
    );
    if (x && (tipo === 'fortificar' ? x.muralla < AJUSTES.maxMuralla : true)) orden = tipo === 'entrenar' ? { tipo, en: x.id, soldados: n } : { tipo, en: x.id };
  } else if (tipo === 'comerciar') {
    cuerpo = (
      <>
        <Pildoras opciones={[['oro', `Doy oro 🪙 → recibo 🌾`], ['alimento', `Doy alimento 🌾 → recibo 🪙`]]} valor={da} onCambiar={setDa} />
        <Stepper valor={n} min={1} max={AJUSTES.mercado.maxLotes} onCambiar={setN} sufijo={` × (${AJUSTES.mercado.da}→${AJUSTES.mercado.recibe})`} />
      </>
    );
    orden = { tipo, da, lotes: Math.min(n, AJUSTES.mercado.maxLotes) };
  } else if (tipo === 'negociar') {
    const aliado = otro != null && sonAliados(v, otro, yo.id);
    cuerpo = (
      <>
        <p className="rnp-paso">¿Con qué reino?</p>
        <Pildoras opciones={rivales.map((r) => [r.id, `${r.e} ${r.jugador}`])} valor={otro} onCambiar={setOtro} />
        {otro != null && (
          <Pildoras opciones={[[aliado ? 'romper' : 'alianza', aliado ? '💔 Romper alianza' : '🤝 Alianza'], ['intercambio', '⚖️ Intercambio']]} valor={clase === 'alianza' && aliado ? 'romper' : clase} onCambiar={setClase} />
        )}
        {otro != null && clase === 'intercambio' && (
          <div className="rnp-trato">
            <span>Das</span>
            <Stepper valor={doy.oro} min={0} max={yo.oro} onCambiar={(x) => setDoy((d) => ({ ...d, oro: x }))} sufijo="🪙" />
            <Stepper valor={doy.alimento} min={0} max={yo.alimento} onCambiar={(x) => setDoy((d) => ({ ...d, alimento: x }))} sufijo="🌾" />
            <span>Pides</span>
            <Stepper valor={pido.oro} min={0} max={30} onCambiar={(x) => setPido((d) => ({ ...d, oro: x }))} sufijo="🪙" />
            <Stepper valor={pido.alimento} min={0} max={30} onCambiar={(x) => setPido((d) => ({ ...d, alimento: x }))} sufijo="🌾" />
          </div>
        )}
      </>
    );
    const c = clase === 'alianza' && aliado ? 'romper' : clase;
    if (otro != null && (c !== 'intercambio' || doy.oro + doy.alimento + pido.oro + pido.alimento > 0)) orden = { tipo, a: otro, clase: c, doy, pido };
  }
  const coste = orden ? COSTE(orden) : { oro: 0, alimento: 0 };
  const caro = coste.oro > disponibles.oro || coste.alimento > disponibles.alimento;
  return (
    <div className="pzp-tarjeta pzp-form rnp-nueva">
      <p className="pzp-etiqueta">{A.e} {A.nombre}</p>
      <p className="pzp-nota">{A.desc}</p>
      {cuerpo}
      {(coste.oro > 0 || coste.alimento > 0) && <p className={`rnp-coste${caro ? ' caro' : ''}`}>Cuesta {coste.oro ? `${coste.oro}🪙 ` : ''}{coste.alimento ? `${coste.alimento}🌾` : ''}{caro ? ' — no te llega' : ''}</p>}
      <div className="pzp-dos">
        <button type="button" className="pzp-boton secundario" onClick={() => { setSel({}); onCancelar(); }}>Cancelar</button>
        <button type="button" className="pzp-boton" disabled={!orden || caro} onClick={() => { onAnadir(orden); setSel({}); }}><Icon name="check" size={18} /> Añadir</button>
      </div>
    </div>
  );
}

function Ordenes({ v, enviar }) {
  const yo = v.yo;
  const [lista, setLista] = useState([]);
  const [tipo, setTipo] = useState(null);
  const [sel, setSel] = useState({});
  const disponibles = useMemo(() => {
    const d = { oro: yo.oro, alimento: yo.alimento, salen: {} };
    lista.forEach((a) => { const c = COSTE(a); d.oro -= c.oro; d.alimento -= c.alimento; if (a.tipo === 'conquistar') d.salen[a.desde] = (d.salen[a.desde] || 0) + a.soldados; });
    return d;
  }, [lista, yo.oro, yo.alimento]);
  // Qué se puede tocar en el mapa
  const resaltados = {};
  if (tipo === 'conquistar') {
    if (sel.desde == null) v.mapa.forEach((x) => { if (x.dueno === yo.id && x.soldados - (disponibles.salen[x.id] || 0) > 0) resaltados[x.id] = 'mio'; });
    else { resaltados[sel.desde] = 'origen'; v.mapa[sel.desde].vecinos.forEach((id) => { resaltados[id] = 'destino'; }); if (sel.hacia != null) resaltados[sel.hacia] = 'objetivo'; }
  } else if (tipo === 'entrenar' || tipo === 'fortificar') {
    v.mapa.forEach((x) => { if (x.dueno === yo.id && (tipo === 'entrenar' || x.muralla < AJUSTES.maxMuralla)) resaltados[x.id] = sel.en === x.id ? 'objetivo' : 'mio'; });
  }
  const tocar = (id) => {
    if (tipo === 'conquistar') {
      if (sel.desde == null || (id !== sel.desde && !v.mapa[sel.desde].vecinos.includes(id))) setSel({ desde: id });
      else if (id === sel.desde) setSel({});
      else setSel((s) => ({ ...s, hacia: id }));
    } else setSel({ en: id });
  };
  const flechas = [...lista.filter((a) => a.tipo === 'conquistar'), ...(sel.desde != null && sel.hacia != null ? [sel] : [])];
  const mapa = (
    <div className="pzp-tarjeta rnp-mapa-tarjeta">
      <Mapa v={v} resaltados={resaltados} onTocar={tipo ? tocar : null} flechas={flechas} />
      <Leyenda v={v} />
    </div>
  );
  const soldados = v.mapa.filter((x) => x.dueno === yo.id).reduce((s2, x) => s2 + x.soldados, 0);
  const gasto = { oro: yo.oro - disponibles.oro, alimento: yo.alimento - disponibles.alimento };
  return (
    <>
      <div className="rnp-barra-rec" role="status">
        <span title="Oro disponible">🪙 <b>{disponibles.oro}</b>{gasto.oro > 0 && <small>−{gasto.oro}</small>}</span>
        <span title="Alimento disponible">🌾 <b>{disponibles.alimento}</b>{gasto.alimento > 0 && <small>−{gasto.alimento}</small>}</span>
        <span title="Soldados en tus territorios">⚔️ <b>{soldados}</b><small>soldados</small></span>
        <span title="Órdenes de esta ronda">📜 <b>{lista.length}/{AJUSTES.acciones}</b></span>
      </div>
      <div className="pzp-tarjeta">
        <p className="pzp-etiqueta">Tus órdenes · {lista.length}/{AJUSTES.acciones}</p>
        {lista.length > 0 && (
          <ol className="rnp-lista-ordenes">
            {lista.map((a, k) => (
              <li key={k}><span>{ACCIONES[a.tipo].e}</span><span>{textoOrden(v, a)}</span>
                <button type="button" className="rnp-quitar" onClick={() => setLista((l) => l.filter((_, i) => i !== k))} aria-label="Quitar">✕</button></li>
            ))}
          </ol>
        )}
        {!tipo && lista.length < AJUSTES.acciones && (
          <div className="rnp-tipos">
            {Object.entries(ACCIONES).map(([id, A]) => (
              <button key={id} type="button" className="rnp-tipo" onClick={() => { setTipo(id); setSel({}); }}><span>{A.e}</span>{A.nombre}</button>
            ))}
          </div>
        )}
      </div>
      {tipo && (
        <NuevaOrden key={tipo} v={v} tipo={tipo} disponibles={disponibles} sel={sel} setSel={setSel}
          onCancelar={() => setTipo(null)} onAnadir={(o) => { setLista((l) => [...l, o]); setTipo(null); }} />
      )}
      {mapa}
      {!tipo && (
        <div className="pzp-barra estatica">
          <button type="button" className="pzp-boton grande" onClick={() => enviar('ordenar', { acciones: lista })}>
            <Icon name="check" size={20} /> {lista.length ? `Enviar ${lista.length === 1 ? 'la orden' : 'las 2 órdenes'}` : 'No hacer nada esta ronda'}
          </button>
          <p className="pzp-nota" style={{ color: '#f8fafc', textAlign: 'center' }}>Las órdenes son secretas y se cumplen todas a la vez cuando todos hayan terminado.</p>
        </div>
      )}
    </>
  );
}

function Propuestas({ v, enviar }) {
  const yo = v.yo.id;
  const recibidas = v.propuestas.filter((x) => x.a === yo && x.estado === 'pendiente');
  if (!recibidas.length) return null;
  return (
    <div className="pzp-tarjeta rnp-propuestas">
      <p className="pzp-etiqueta">📜 Te proponen</p>
      {recibidas.map((x) => {
        const de = reinoDe(v, x.de);
        return (
          <div key={x.id} className="rnp-propuesta">
            <Escudo r={de} />
            <div>
              <strong>{de.nombre} ({de.jugador})</strong>
              <p>{x.clase === 'alianza' ? 'Te ofrece una alianza: no os podréis atacar sin traicionaros y podréis atacar juntos.'
                : `Intercambio: te da ${x.doy.oro}🪙 ${x.doy.alimento}🌾 y te pide ${x.pido.oro}🪙 ${x.pido.alimento}🌾.`}</p>
              <div className="pzp-dos">
                <button type="button" className="pzp-boton secundario" onClick={() => enviar('responder', { propuesta: x.id, acepta: false })}>Rechazar</button>
                <button type="button" className="pzp-boton" onClick={() => enviar('responder', { propuesta: x.id, acepta: true })}>Aceptar</button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Leyenda({ v }) {
  return (
    <div className="rnp-leyenda">
      <span className="rnp-leyenda-sold"><b>🪖 5</b> = 5 soldados en ese territorio</span>
      <span>🏰 Capital +3🪙+3🌾</span><span>👑 Trono +1🪙+1🌾</span><span>🌾 Granja +2🌾</span><span>⛏️ Mina +2🪙</span><span>🏘️ Ciudad +1🪙+1🌾</span><span>▰ Muralla +2 def.</span>
      {v.alianzas.length > 0 && <span>🤝 {v.alianzas.map((al) => al.map((id) => reinoDe(v, id)?.e).join('')).join(' · ')}</span>}
    </div>
  );
}

function Esperando({ v, texto }) {
  return (
    <div className="pzp-tarjeta">
      <p className="pzp-esperando-txt">⏳ {texto}</p>
      <div className="rnp-listos">
        {v.reinos.filter((r) => !r.fuera && !r.eliminado).map((r) => (
          <span key={r.id} className={(v.fase === 'cronica' ? r.listoCronica : r.listo) ? 'si' : ''}>{r.e} {r.jugador} {(v.fase === 'cronica' ? r.listoCronica : r.listo) ? '✓' : '…'}</span>
        ))}
      </div>
    </div>
  );
}

const Cronica = CronicaBonita;

/**
 * La partida en marcha. `local`: en un dispositivo (las acciones de «seguir» y «forzar» las hace el grupo).
 * `admin`: el anfitrión puede desbloquear la partida.
 */
export function Partida({ v, enviar, onSalir, admin = false, local = false }) {
  const yo = v.yo;
  if (!yo) return null;
  const r = reinoDe(v, yo.id);
  if (yo.eliminado || r.fuera) {
    return (
      <>
        <Cabecera v={v} onSalir={onSalir} etiqueta="Tu reino ha caído" titulo="Sigue mirando…" />
        <div className="pzp-tarjeta rnp-mapa-tarjeta"><Mapa v={v} /><Leyenda v={v} /></div>
        {v.fase === 'cronica' && <Cronica v={v} />}
      </>
    );
  }
  let cuerpo;
  let titulo;
  if (v.fase === 'ordenes' && !yo.listo) {
    titulo = 'Da tus órdenes';
    cuerpo = <><Propuestas v={v} enviar={enviar} /><Ordenes v={v} enviar={enviar} /></>;
  } else if (v.fase === 'ordenes' || (v.fase === 'diplomacia' && !v.propuestas.some((x) => x.a === yo.id && x.estado === 'pendiente'))) {
    titulo = v.fase === 'diplomacia' ? 'Diplomacia' : 'Órdenes enviadas';
    cuerpo = (
      <>
        <Propuestas v={v} enviar={enviar} />
        <div className="pzp-tarjeta">
          <p className="pzp-etiqueta">Tus órdenes</p>
          <ol className="rnp-lista-ordenes">{(yo.ordenes || []).map((a, k) => <li key={k}><span>{ACCIONES[a.tipo].e}</span><span>{textoOrden(v, a)}</span></li>)}</ol>
          {!(yo.ordenes || []).length && <p className="pzp-nota">Esta ronda no haces nada.</p>}
          {v.fase === 'ordenes' && <button type="button" className="pzp-enlace oscuro" onClick={() => enviar('retirar')}>✏️ Cambiar mis órdenes</button>}
        </div>
        <Esperando v={v} texto={v.fase === 'diplomacia' ? 'Esperando respuestas a las propuestas…' : 'Esperando a los demás reinos…'} />
        <div className="pzp-tarjeta rnp-mapa-tarjeta"><Mapa v={v} flechas={(yo.ordenes || []).filter((a) => a.tipo === 'conquistar')} /><Leyenda v={v} /></div>
      </>
    );
  } else if (v.fase === 'diplomacia') {
    titulo = 'Responde a las propuestas';
    cuerpo = <><Propuestas v={v} enviar={enviar} /><div className="pzp-tarjeta rnp-mapa-tarjeta"><Mapa v={v} /></div></>;
  } else {
    titulo = 'Crónica de la ronda';
    cuerpo = (
      <>
        <Cronica v={v} />
        <div className="pzp-tarjeta rnp-mapa-tarjeta"><Mapa v={v} /><Leyenda v={v} /></div>
        {!r.listoCronica ? (
          <div className="pzp-barra estatica"><button type="button" className="pzp-boton grande" onClick={() => enviar('seguir')}><Icon name="play" size={20} /> Siguiente ronda</button></div>
        ) : <Esperando v={v} texto="Esperando a que todos lean la crónica…" />}
      </>
    );
  }
  return (
    <>
      <Cabecera v={v} onSalir={onSalir} etiqueta={r.nombre} titulo={titulo} />
      {!local && v.fase === 'ordenes' && <AvisoTurno clave={`o${v.ronda}`} emoji="📜" texto={`Ronda ${v.ronda}`} sub="Da tus órdenes secretas a tu reino." />}
      <Recursos v={v} />
      {cuerpo}
      {admin && (
        <div className="pzp-barra estatica">
          <div className="pzp-dos">
            <button type="button" className="pzp-enlace" onClick={() => enviar('forzar')}><Icon name="forward" size={15} /> Seguir sin esperar</button>
            <button type="button" className="pzp-enlace" onClick={() => enviar('terminar')}><Icon name="flagFinish" size={15} /> Terminar ya</button>
          </div>
        </div>
      )}
    </>
  );
}

/** Crónica para todos a la vez (un dispositivo): sin recursos ni objetivos de nadie. */
export function CronicaComun({ v, onSeguir, onSalir }) {
  return (
    <>
      <Cabecera v={v} onSalir={onSalir} etiqueta="Todos juntos" titulo="Crónica de la ronda" />
      <Cronica v={v} />
      <div className="pzp-tarjeta rnp-mapa-tarjeta"><Mapa v={v} /><Leyenda v={v} /></div>
      <div className="pzp-barra estatica"><button type="button" className="pzp-boton grande" onClick={onSeguir}><Icon name="play" size={20} /> Siguiente ronda</button></div>
    </>
  );
}

export function PartidaOnline({ v, sala, enviar, onSalir }) {
  return <Partida v={v} enviar={enviar} onSalir={onSalir} admin={sala.esAdmin} />;
}

export function Fin({ v, onSalir, children }) {
  const f = v.fin;
  const g = f.ganadores.map((id) => reinoDe(v, id));
  return (
    <>
      <header className="pzp-hero acierto">
        <span className="pzp-hero-fondo" aria-hidden="true">👑</span>
        <div className="pzp-hero-top">
          <button type="button" className="pzp-salir" onClick={onSalir}><Icon name="door" size={15} /> Salir</button>
          <span className="pzp-chip">👑 Fin</span>
        </div>
        <p className="pzp-hero-etiqueta">{f.porTronos != null ? `¡Domina ${AJUSTES.tronosVictoria} tronos!` : 'Fin de la partida'}</p>
        <h1 className="pzp-hero-titulo">{g.length > 1 ? `Empate: ${g.map((r) => r.jugador).join(' y ')}` : `¡${g[0]?.jugador} gobierna los Siete Reinos!`}</h1>
      </header>
      <div className="pzp-tarjeta rnp-mapa-tarjeta"><Mapa v={v} /></div>
      <div className="pzp-tarjeta">
        <p className="pzp-etiqueta">Puntuación · trono {AJUSTES.puntos.trono} · territorio {AJUSTES.puntos.territorio} · objetivo {AJUSTES.puntos.objetivo} · traición {AJUSTES.puntos.traicion}</p>
        <ol className="rnp-final">
          {f.tabla.map((t, i) => (
            <li key={t.id} className={f.ganadores.includes(t.id) ? 'lider' : ''}>
              <div className="rnp-final-cab"><span className="pzp-pos">{i + 1}</span><Escudo r={t} chico /><strong>{t.jugador}</strong><small>{t.nombre}</small><b>{t.total}</b></div>
              <p>{t.tronos}👑 · {t.territorios}⬢{t.traiciones ? ` · ${t.traiciones}🗡️` : ''}{t.eliminado ? ' · eliminado' : ''}</p>
              <ul>{t.objetivos.map((o) => <li key={o.id} className={o.cumplido ? 'si' : ''}>{o.cumplido ? '✅' : '❌'} {o.nombre}: <small>{o.desc}</small></li>)}</ul>
            </li>
          ))}
        </ol>
      </div>
      {children}
    </>
  );
}

export function Config({ config, onCambiar }) {
  return (
    <BloqueConfig titulo="Número de rondas">
      <Pildoras opciones={OPCIONES_RONDAS.map((n) => [n, `${n} rondas`])} valor={config.rondas} onCambiar={onCambiar && ((rondas) => onCambiar({ rondas }))} />
    </BloqueConfig>
  );
}
