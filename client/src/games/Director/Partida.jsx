// client/src/games/Director/Partida.jsx
// Pantallas de «Director Deportivo» (online y en un dispositivo): formación, mercados con pujas secretas, táctica y liga.
import React, { useState } from 'react';
import Icon from '../../components/Icon.jsx';
import { Pildoras, AvisoTurno } from '../Pulsador/Vistas.jsx';
import { BloqueConfig } from '../../components/MenuJuego.jsx';
import { FORMACIONES, TACTICAS, AJUSTES, OPCIONES } from './engine.js';
import './Director.css';

const POS = { POR: { n: 'Portero', c: '#f59e0b' }, DEF: { n: 'Defensa', c: '#2563eb' }, MED: { n: 'Medio', c: '#16a34a' }, DEL: { n: 'Delantero', c: '#dc2626' } };
const clubDe = (v, id) => v.clubes.find((c) => c.id === id);
const m = (x) => `${Number(x).toLocaleString('es-ES')} M€`;

function Cabecera({ v, onSalir, titulo, etiqueta, chip }) {
  return (
    <header className="pzp-hero">
      <span className="pzp-hero-fondo" aria-hidden="true">⚽</span>
      <div className="pzp-hero-top">
        <button type="button" className="pzp-salir" onClick={onSalir}><Icon name="door" size={15} /> Salir</button>
        <span className="pzp-chip">{chip}</span>
      </div>
      <p className="pzp-hero-etiqueta">{etiqueta}</p>
      <h1 className="pzp-hero-titulo">{titulo}</h1>
      <div className="pzp-marcador">
        {v.clubes.map((c) => (
          <span key={c.id} className={`pzp-marca${c.id === v.yo?.id ? ' yo' : ''}`}>
            <span className="pzp-marca-nombre">{c.bot ? '🤖 ' : ''}{c.nombre}</span>
            <span className="pzp-marca-datos">{m(c.presupuesto)}</span>
            {c.listo && !c.bot && (v.fase === 'formacion' || v.fase === 'mercado' || v.fase === 'tactica') && <b className="mas">✓</b>}
          </span>
        ))}
      </div>
    </header>
  );
}

export function Futbolista({ f, children, pagado }) {
  const sube = f.temporada != null ? f.temporada - f.media : null;
  return (
    <div className="dtp-fut">
      <span className="dtp-pos" style={{ '--c': POS[f.pos].c }}>{f.pos}</span>
      <div className="dtp-fut-datos">
        <strong>{f.nombre}</strong>
        <small>{f.edad} años · {f.club} · {f.pais}</small>
      </div>
      <div className="dtp-media"><b>{f.media}</b><small>pot. {f.potencial}{sube ? ` (${sube > 0 ? '+' : ''}${sube})` : ''}</small></div>
      {pagado != null && <span className="dtp-precio">{m(pagado)}</span>}
      {children}
    </div>
  );
}

function Plantilla({ c, abierta = false }) {
  const [ver, setVer] = useState(abierta);
  const F = { POR: 1, ...(FORMACIONES[c.formacion] || {}) };
  const por = (pos) => c.plantilla.filter((f) => f.pos === pos);
  return (
    <div className="pzp-tarjeta">
      <button type="button" className="dtp-plegar" onClick={() => setVer((x) => !x)}>
        <span>📋 Tu plantilla ({c.plantilla.length}/{AJUSTES.maxPlantilla}) · {c.formacion}</span>
        <span className="dtp-huecos">{Object.keys(POS).map((p) => <i key={p} className={por(p).length >= F[p] ? 'ok' : ''} style={{ '--c': POS[p].c }}>{p} {por(p).length}/{F[p]}</i>)}</span>
        <b>{ver ? '▲' : '▼'}</b>
      </button>
      {ver && (c.plantilla.length ? <div className="dtp-lista">{c.plantilla.map((f) => <Futbolista key={f.id} f={f} pagado={f.pagado} />)}</div>
        : <p className="pzp-nota">Aún no has fichado a nadie. Si te faltan jugadores, jugarán canteranos de media {AJUSTES.canterano}.</p>)}
    </div>
  );
}

function Espera({ v, texto }) {
  return (
    <div className="pzp-tarjeta">
      <p className="pzp-esperando-txt">⏳ {texto}</p>
      <div className="dtp-listos">{v.clubes.filter((c) => !c.bot).map((c) => <span key={c.id} className={c.listo ? 'si' : ''}>{c.listo ? '✓' : '…'} {c.dueno}</span>)}</div>
    </div>
  );
}

function Formacion({ v, enviar }) {
  const [f, setF] = useState(v.yo.formacion || '4-3-3');
  if (v.yo.listo) return <Espera v={v} texto="Esperando a que los demás elijan formación…" />;
  return (
    <div className="pzp-tarjeta pzp-form">
      <p className="pzp-etiqueta">Elige tu sistema: decide qué posiciones tendrás que fichar</p>
      <div className="dtp-formaciones">
        {Object.entries(FORMACIONES).map(([k, F]) => (
          <button key={k} type="button" className={`dtp-formacion${f === k ? ' activa' : ''}`} onClick={() => setF(k)}>
            <strong>{k}</strong><small>1 POR · {F.DEF} DEF · {F.MED} MED · {F.DEL} DEL</small>
          </button>
        ))}
      </div>
      <button type="button" className="pzp-boton" onClick={() => enviar('formacion', { formacion: f })}><Icon name="check" size={20} /> Jugar con {f}</button>
    </div>
  );
}

function Mercado({ v, enviar }) {
  const yo = clubDe(v, v.yo.id);
  const [pujas, setPujas] = useState(() => ({ ...(v.yo.pujas || {}) }));
  const total = Object.values(pujas).reduce((a, x) => a + x, 0);
  if (v.yo.listo) {
    return (
      <>
        <div className="pzp-tarjeta">
          <p className="pzp-etiqueta">Tus pujas secretas · {m(total)}</p>
          {Object.keys(v.yo.pujas || {}).length ? v.oferta.filter((f) => v.yo.pujas[f.id] != null).map((f) => <Futbolista key={f.id} f={f}><span className="dtp-puja">{m(v.yo.pujas[f.id])}</span></Futbolista>)
            : <p className="pzp-nota">En este mercado no pujas por nadie.</p>}
          <button type="button" className="pzp-enlace oscuro" onClick={() => enviar('retirar')}>✏️ Cambiar mis pujas</button>
        </div>
        <Espera v={v} texto="Esperando las pujas de los demás clubes…" />
      </>
    );
  }
  const cambia = (f, x) => setPujas((p) => { const n = { ...p }; if (x == null) delete n[f.id]; else n[f.id] = Math.max(f.precio, Math.round(x * 2) / 2); return n; });
  const n = Object.keys(pujas).length;
  const pasa = total > yo.presupuesto || n > AJUSTES.maxPujas || yo.plantilla.length + n > AJUSTES.maxPlantilla;
  return (
    <>
      <Plantilla c={yo} />
      <div className="pzp-tarjeta">
        <p className="pzp-etiqueta">En el mercado · puja lo que quieras (mínimo su precio): gana la puja más alta</p>
        <div className="dtp-lista">
          {v.oferta.map((f) => (
            <Futbolista key={f.id} f={f}>
              {pujas[f.id] == null ? (
                <button type="button" className="dtp-pujar" onClick={() => cambia(f, f.precio)}>{m(f.precio)}<small>Pujar</small></button>
              ) : (
                <div className="dtp-ajuste">
                  <button type="button" onClick={() => (pujas[f.id] <= f.precio ? cambia(f, null) : cambia(f, pujas[f.id] - 1))}>{pujas[f.id] <= f.precio ? '✕' : '−'}</button>
                  <strong>{m(pujas[f.id])}</strong>
                  <button type="button" onClick={() => cambia(f, pujas[f.id] + 1)}>+</button>
                  <button type="button" onClick={() => cambia(f, pujas[f.id] + 5)}>+5</button>
                </div>
              )}
            </Futbolista>
          ))}
        </div>
      </div>
      <div className="pzp-barra">
        <p className={`dtp-total${pasa ? ' mal' : ''}`}>{n} {n === 1 ? 'puja' : 'pujas'} · {m(total)} de {m(yo.presupuesto)}{n > AJUSTES.maxPujas ? ` · máximo ${AJUSTES.maxPujas}` : ''}</p>
        <button type="button" className="pzp-boton grande" disabled={pasa} onClick={() => enviar('pujar', { pujas })}>
          <Icon name="check" size={20} /> {n ? 'Enviar mis pujas' : 'No pujar en este mercado'}
        </button>
      </div>
    </>
  );
}

function ResultadoMercado({ v, enviar, local }) {
  const r = v.resultadoMercado;
  const yo = v.yo ? clubDe(v, v.yo.id) : null;
  return (
    <>
      <div className="pzp-tarjeta">
        <p className="pzp-etiqueta">Fichajes del mercado {r.mercado}</p>
        {r.fichajes.length ? (
          <ul className="dtp-fichajes">
            {r.fichajes.map((x) => (
              <li key={x.futbolista} className={x.club === v.yo?.id ? 'mio' : x.rivales.some((o) => o.club === v.yo?.id) ? 'perdido' : ''}>
                <span className="dtp-pos" style={{ '--c': POS[x.pos].c }}>{x.pos}</span>
                <div><strong>{x.nombre}</strong><small>{clubDe(v, x.club)?.nombre}{x.pujas > 1 ? ` · ${x.pujas} pujas (${x.rivales.map((o) => `${clubDe(v, o.club)?.nombre}: ${m(o.m)}`).join(', ')})` : ''}</small></div>
                <b>{m(x.pagado)}</b>
              </li>
            ))}
          </ul>
        ) : <p className="pzp-nota">Nadie ha fichado en este mercado.</p>}
      </div>
      {yo && <Plantilla c={yo} abierta />}
      {local ? (
        <div className="pzp-barra estatica"><button type="button" className="pzp-boton grande" onClick={() => enviar('seguir')}><Icon name="play" size={20} /> {v.mercado < v.mercados ? 'Siguiente mercado' : 'Elegir tácticas'}</button></div>
      ) : !clubDe(v, v.yo.id).listo ? (
        <div className="pzp-barra estatica"><button type="button" className="pzp-boton grande" onClick={() => enviar('seguir')}><Icon name="play" size={20} /> {v.mercado < v.mercados ? 'Siguiente mercado' : 'Elegir táctica'}</button></div>
      ) : <Espera v={v} texto="Esperando a los demás…" />}
    </>
  );
}

function Tactica({ v, enviar }) {
  const [t, setT] = useState(v.yo.tactica || 'equilibrada');
  const pr = v.yo.previa;
  if (v.yo.listo) return <Espera v={v} texto="Esperando a que los demás elijan táctica…" />;
  return (
    <>
      <div className="pzp-tarjeta">
        <p className="pzp-etiqueta">Tu once ({v.yo.formacion})</p>
        <div className="dtp-lineas"><span>🧤🛡️ Defensa <b>{pr.def}</b></span><span>🎯 Medio <b>{pr.med}</b></span><span>⚽ Ataque <b>{pr.ata}</b></span></div>
        <div className="dtp-lineas"><span>🤝 Química <b>{pr.quimica}/10</b></span><span>🎂 Edad <b>{pr.edadMedia}</b></span><span>🪑 Banquillo <b>{pr.fondo}</b></span></div>
        <ol className="dtp-once">
          {pr.once.map((o, k) => <li key={k} className={o.nombre === 'Canterano' ? 'cantera' : o.fuera ? 'fuera' : ''}><span className="dtp-pos" style={{ '--c': POS[o.juegaDe].c }}>{o.juegaDe}</span><span>{o.nombre}{o.fuera ? ' (fuera de sitio)' : ''}</span><b>{o.efectiva}</b></li>)}
        </ol>
        <p className="pzp-nota">La química sube con compañeros del mismo club o país. Con menos de 3 en el banquillo, el equipo se cansa en la segunda vuelta.</p>
      </div>
      <div className="pzp-tarjeta pzp-form">
        <p className="pzp-etiqueta">Elige la táctica para la liga</p>
        <div className="dtp-tacticas">
          {Object.entries(TACTICAS).map(([k, T]) => (
            <button key={k} type="button" className={`dtp-tactica${t === k ? ' activa' : ''}`} onClick={() => setT(k)}><span>{T.e}</span><strong>{T.nombre}</strong><small>{T.desc}</small></button>
          ))}
        </div>
        <button type="button" className="pzp-boton" onClick={() => enviar('tactica', { tactica: t })}><Icon name="check" size={20} /> ¡A competir!</button>
      </div>
    </>
  );
}

function Clasificacion({ v, filas }) {
  return (
    <table className="dtp-tabla">
      <thead><tr><th>#</th><th>Club</th><th>PJ</th><th>DG</th><th>Pts</th></tr></thead>
      <tbody>
        {filas.map((r, i) => (
          <tr key={r.id} className={`${r.id === v.yo?.id ? 'mio' : ''}${i === 0 ? ' lider' : ''}`}>
            <td>{i + 1}</td><td>{clubDe(v, r.id)?.bot ? '🤖 ' : ''}{r.nombre}</td><td>{r.pj}</td><td>{r.gf - r.gc > 0 ? '+' : ''}{r.gf - r.gc}</td><td><b>{r.pts}</b></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Liga({ v, enviar, puedeAvanzar }) {
  const ultima = v.jornadas[v.jornadas.length - 1];
  return (
    <>
      <div className="pzp-tarjeta">
        <p className="pzp-etiqueta">Jornada {v.jornadas.length} de {v.totalJornadas}</p>
        {ultima ? (
          <ul className="dtp-partidos">
            {ultima.map((p, k) => (
              <li key={k} className={[p.local, p.visita].includes(v.yo?.id) ? 'mio' : ''}>
                <span>{clubDe(v, p.local)?.nombre}</span><b>{p.gl} - {p.gv}</b><span>{clubDe(v, p.visita)?.nombre}</span>
                {p.goles.length > 0 && <small>⚽ {p.goles.map((g) => g.n.split(' ').slice(-1)[0]).join(', ')}</small>}
              </li>
            ))}
          </ul>
        ) : <p className="pzp-esperando-txt">⏳ ¡Empieza la liga!</p>}
      </div>
      <div className="pzp-tarjeta"><p className="pzp-etiqueta">Clasificación</p><Clasificacion v={v} filas={v.clasificacion} /></div>
      {puedeAvanzar && <div className="pzp-barra estatica"><button type="button" className="pzp-enlace" onClick={() => enviar('jornada')}><Icon name="forward" size={15} /> Siguiente jornada</button></div>}
    </>
  );
}

/** La partida (todo salvo el final). */
export function Partida({ v, enviar, onSalir, local = false, admin = false }) {
  const titulos = {
    formacion: ['Elige formación', 'Pretemporada'],
    mercado: ['Mercado de fichajes', `Pujas secretas · ${v.yo ? m(clubDe(v, v.yo.id)?.presupuesto ?? 0) : ''}`],
    resultadoMercado: ['¡Mercado cerrado!', `Mercado ${v.mercado} de ${v.mercados}`],
    tactica: ['Pizarra', 'Elige táctica'],
    liga: ['La liga', `Jornada ${v.jornadas.length}/${v.totalJornadas}`]
  }[v.fase] || ['', ''];
  const chip = v.fase === 'liga' ? '🏆 Liga' : `🛒 Mercado ${Math.max(1, v.mercado)}/${v.mercados}`;
  return (
    <>
      <Cabecera v={v} onSalir={onSalir} titulo={titulos[0]} etiqueta={titulos[1]} chip={chip} />
      {!local && v.yo && ['formacion', 'mercado', 'tactica'].includes(v.fase) && (
        <AvisoTurno clave={`${v.fase}-${v.mercado}`} emoji={{ formacion: '📋', mercado: '🛒', tactica: '🧠' }[v.fase]} texto={titulos[0]}
          sub={{ formacion: 'Decide qué posiciones vas a fichar.', mercado: 'Haz tus pujas secretas antes de que cierre.', tactica: 'Elige cómo jugará tu equipo la liga.' }[v.fase]} />
      )}
      {v.fase === 'formacion' && v.yo && <Formacion v={v} enviar={enviar} />}
      {v.fase === 'mercado' && v.yo && <Mercado key={`${v.mercado}-${v.yo.id}-${v.yo.listo}`} v={v} enviar={enviar} />}
      {v.fase === 'resultadoMercado' && <ResultadoMercado v={v} enviar={enviar} local={local} />}
      {v.fase === 'tactica' && v.yo && <Tactica v={v} enviar={enviar} />}
      {v.fase === 'liga' && <Liga v={v} enviar={enviar} puedeAvanzar={admin || local} />}
      {admin && ['formacion', 'mercado', 'resultadoMercado', 'tactica'].includes(v.fase) && (
        <div className="pzp-barra estatica"><button type="button" className="pzp-enlace" onClick={() => enviar('forzar')}><Icon name="forward" size={15} /> Seguir sin esperar</button></div>
      )}
    </>
  );
}

export function PartidaOnline({ v, sala, enviar, onSalir }) {
  return <Partida v={v} enviar={enviar} onSalir={onSalir} admin={sala.esAdmin} />;
}

export function Fin({ v, onSalir, children }) {
  const f = v.fin;
  const campeon = clubDe(v, f.campeon);
  return (
    <>
      <header className="pzp-hero acierto">
        <span className="pzp-hero-fondo" aria-hidden="true">🏆</span>
        <div className="pzp-hero-top">
          <button type="button" className="pzp-salir" onClick={onSalir}><Icon name="door" size={15} /> Salir</button>
          <span className="pzp-chip">🏆 Final</span>
        </div>
        <p className="pzp-hero-etiqueta">Campeón de liga</p>
        <h1 className="pzp-hero-titulo">{campeon ? `¡${campeon.nombre}!` : 'Liga terminada'}</h1>
      </header>
      <div className="pzp-tarjeta"><p className="pzp-etiqueta">Clasificación final</p><Clasificacion v={v} filas={f.tabla} /></div>
      <div className="pzp-tarjeta dtp-premios">
        {f.pichichi && <p>⚽ <strong>Pichichi:</strong> {f.pichichi.nombre} ({clubDe(v, f.pichichi.club)?.nombre}), {f.pichichi.goles} goles</p>}
        {f.ganga && <p>💸 <strong>Fichaje más rentable:</strong> {f.ganga.nombre} ({clubDe(v, f.ganga.club)?.nombre}), media {f.ganga.media} por {m(f.ganga.pagado)}</p>}
        {v.fuerzas && (
          <ul className="dtp-fuerzas">
            {f.tabla.map((r) => { const z = v.fuerzas[r.id]; return z && <li key={r.id}><strong>{r.nombre}</strong><span>{TACTICAS[z.tactica]?.e} 🛡️{z.def} 🎯{z.med} ⚽{z.ata} 🤝{z.quimica}</span></li>; })}
          </ul>
        )}
      </div>
      {children}
    </>
  );
}

export function Config({ config, onCambiar }) {
  return (
    <>
      <BloqueConfig titulo="Presupuesto por club">
        <Pildoras opciones={OPCIONES.presupuesto.map((n) => [n, `${n} M€`])} valor={config.presupuesto} onCambiar={onCambiar && ((presupuesto) => onCambiar({ presupuesto }))} />
      </BloqueConfig>
      <BloqueConfig titulo="Mercados de fichajes">
        <Pildoras opciones={OPCIONES.mercados.map((n) => [n, `${n} mercados`])} valor={config.mercados} onCambiar={onCambiar && ((mercados) => onCambiar({ mercados }))} />
      </BloqueConfig>
      <p className="pzp-nota">Si sois menos de {AJUSTES.minClubes}, la liga se completa con clubes de la máquina 🤖.</p>
    </>
  );
}
