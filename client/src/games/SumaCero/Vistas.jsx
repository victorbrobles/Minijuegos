// client/src/games/SumaCero/Vistas.jsx
// Pantallas de «Suma Cero» (modo online y un solo dispositivo) con el estilo de los juegos renovados.
// Reciben `v` (vista de un jugador que genera engine.vistaDe) y `enviar(tipo, datos)`.
import { useRegistrarPartida, resultadoDesdeFin } from '../../lib/registros.js';
import React, { useEffect, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import InfoCarta from '../../components/InfoCarta.jsx';
import { ESPECIALES, AJUSTES } from './engine.js';
import './SumaCero.css';

export const COLORES = ['#ef4444', '#2563eb', '#16a34a', '#f59e0b', '#9333ea', '#ec4899'];
export const colorDe = (id) => COLORES[((Number(id) || 1) - 1) % COLORES.length];
const inicial = (n) => (n || '?').trim().charAt(0).toUpperCase();
const conSigno = (n) => (n > 0 ? `+${n}` : String(n));

export function Avatar({ id, nombre, grande = false }) {
  return <span className={`szp-avatar${grande ? ' grande' : ''}`} style={{ '--c': colorDe(id) }}>{inicial(nombre)}</span>;
}

export function Carta({ c, mini = false, nueva = false, sel = false, onClick, accion }) {
  const clase = c.tipo === 'numero' ? (c.valor > 0 ? 'pos' : 'neg') : 'esp';
  const dentro = c.tipo === 'numero' ? (
    <>
      <span className="szp-carta-num">{conSigno(c.valor)}</span>
      {c.doble && <i className="szp-carta-doble">×{c.doble}</i>}
    </>
  ) : (
    <>
      <span className="szp-carta-e">{ESPECIALES[c.especial].e}</span>
      <strong>{ESPECIALES[c.especial].nombre}</strong>
      {!mini && (
        <InfoCarta e={ESPECIALES[c.especial].e} nombre={ESPECIALES[c.especial].nombre} desc={ESPECIALES[c.especial].desc}
          nota={`Si te la quedas al final de la ronda, suma +${AJUSTES.penalEspecial}.`} />
      )}
    </>
  );
  const cls = `szp-carta ${clase}${mini ? ' mini' : ''}${nueva ? ' nueva' : ''}${sel ? ' sel' : ''}`;
  if (!onClick) return <div className={cls}>{dentro}{nueva && <b className="szp-nueva">nueva</b>}</div>;
  return (
    <button type="button" className={cls} onClick={onClick}>
      {dentro}
      {nueva && <b className="szp-nueva">nueva</b>}
      {accion && <span className="szp-carta-accion">{accion}</span>}
    </button>
  );
}

/** Termómetro: dónde está tu suma respecto al 0. */
function Termometro({ suma }) {
  const lim = 20;
  const pos = Math.max(-lim, Math.min(lim, suma));
  const pct = ((pos + lim) / (lim * 2)) * 100;
  return (
    <div className="szp-termo">
      <div className="szp-termo-barra">
        <span className="szp-termo-cero" />
        <span className={`szp-termo-marca${suma === 0 ? ' cero' : ''}`} style={{ left: `${pct}%` }}>{conSigno(suma)}</span>
      </div>
      <div className="szp-termo-escala"><span>−{lim}</span><span>0</span><span>+{lim}</span></div>
    </div>
  );
}

// ---------------------------------------------------------------- Cabecera
export function Hero({ v, onSalir, etiqueta, titulo, clase = '' }) {
  const t = v.turno;
  const plantado = v.jugadores.find((j) => j.id === v.plantado);
  return (
    <header className={`szp-hero ${clase}`}>
      <span className="szp-cero-fondo" aria-hidden="true">0</span>
      <div className="szp-hero-top">
        <button type="button" className="szp-salir" onClick={onSalir}><Icon name="door" size={15} /> Salir</button>
        <div className="szp-chips">
          {v.fase !== 'fin' && <span className="szp-chip">Ronda {v.ronda}/{v.rondas}</span>}
          {v.fase === 'juego' && <span className="szp-chip" title="Cartas en el mazo">🂠 {v.mazo}</span>}
          {plantado && v.fase === 'juego' && <span className="szp-chip alerta">✋ {plantado.nombre} se ha plantado</span>}
        </div>
      </div>
      {etiqueta && <p className="szp-hero-etiqueta">{etiqueta}</p>}
      {titulo && <h1 className="szp-hero-titulo">{titulo}</h1>}
      <div className="szp-marcador">
        {[...v.jugadores].sort((a, b) => a.total - b.total).map((j) => (
          <span key={j.id} className={`szp-marca${t?.jugadorId === j.id ? ' turno' : ''}${j.id === v.yo?.id ? ' yo' : ''}${j.fuera ? ' fuera' : ''}`}>
            <Avatar id={j.id} nombre={j.nombre} />
            <span className="szp-marca-nombre">{j.nombre}</span>
            <strong title="Puntos acumulados (menos es mejor)">{j.total}</strong>
            {v.fase === 'juego' && <span className="szp-marca-mano">🂠{j.nMano}</span>}
            {j.congelado && <b>❄️</b>}
            {v.plantado === j.id && v.fase === 'juego' && <b>✋</b>}
          </span>
        ))}
      </div>
    </header>
  );
}

// ---------------------------------------------------------------- Panel de carta especial
function PanelEspecial({ v, carta, enviar, onCancelar }) {
  const E = ESPECIALES[carta.especial];
  const [obj, setObj] = useState(null);
  const [propia, setPropia] = useState(null);
  const rivales = v.jugadores.filter((j) => j.id !== v.yo.id && !j.fuera);
  const listo = E.objetivo === 'jugador' ? obj != null : E.objetivo === 'propia' ? propia != null : true;
  const numeros = v.yo.mano.filter((c) => c.tipo === 'numero');
  return (
    <div className="szp-tarjeta szp-panel">
      <div className="szp-panel-cab"><span>{E.e}</span><div><strong>{E.nombre}</strong><small>{E.desc}</small></div></div>
      {E.objetivo === 'jugador' && (
        <>
          <p className="szp-etiqueta">¿A quién?</p>
          <div className="szp-pildoras">
            {rivales.map((j) => (
              <button key={j.id} type="button" className={`szp-pildora${obj === j.id ? ' activo' : ''}`} onClick={() => setObj(j.id)}>
                <Avatar id={j.id} nombre={j.nombre} /> {j.nombre} · 🂠{j.nMano}{v.plantado === j.id ? ' · ✋' : ''}
              </button>
            ))}
          </div>
        </>
      )}
      {E.objetivo === 'propia' && (
        <>
          <p className="szp-etiqueta">¿Qué carta duplicas?</p>
          {numeros.length ? <div className="szp-cartas">{numeros.map((c) => <Carta key={c.uid} c={c} mini sel={propia === c.uid} onClick={() => setPropia(c.uid)} />)}</div>
            : <p className="szp-pista">No tienes cartas numéricas.</p>}
        </>
      )}
      <div className="szp-dos" style={{ marginTop: '0.8rem' }}>
        <button type="button" className="szp-boton secundario" onClick={onCancelar}>Cancelar</button>
        <button type="button" className="szp-boton" disabled={!listo} onClick={() => enviar('especial', { uid: carta.uid, params: { objetivo: obj, cartaUid: propia } })}>{E.e} ¡Usar!</button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Partida
export function PantallaJuego({ v, enviar, onSalir, admin = null }) {
  const [especial, setEspecial] = useState(null);
  const t = v.turno;
  const miTurno = Boolean(t && v.yo) && t.jugadorId === v.yo.id;
  const quien = v.jugadores.find((j) => j.id === t?.jugadorId);
  useEffect(() => { setEspecial(null); }, [t?.jugadorId, t?.paso]);
  const ultimoTurno = v.plantado != null && v.ultimosTurnos.includes(v.yo.id);
  const arriba = v.descarteArriba;

  return (
    <>
      <Hero v={v} onSalir={onSalir} etiqueta={miTurno ? (ultimoTurno ? '¡Tu último turno!' : `Tu turno · ronda ${v.ronda}`) : `Ronda ${v.ronda}`}
        titulo={miTurno ? (t.paso === 'robar' ? 'Roba o plántate' : 'Descarta o usa un especial') : `Juega ${quien?.nombre ?? '…'}`} clase={miTurno ? 'mio' : ''} />

      {v.log.length > 0 && <div className="szp-ultimo">{v.log[v.log.length - 1].texto}</div>}

      <div className="szp-tarjeta">
        <p className="szp-etiqueta">Tu mano · {v.yo.mano.length} cartas{v.yo.especiales ? ` · ${v.yo.especiales} especial${v.yo.especiales > 1 ? 'es' : ''} (+${AJUSTES.penalEspecial} c/u si te la quedas al final)` : ''}</p>
        <div className={`szp-suma${v.yo.suma === 0 ? ' cero' : ''}`}>
          <span>Tu suma</span>
          <strong>{conSigno(v.yo.suma)}</strong>
          {v.yo.suma === 0 && <em>¡Perfecta!</em>}
        </div>
        <Termometro suma={v.yo.suma} />
        <div className="szp-cartas grandes">
          {v.yo.mano.map((c) => {
            let accion = null; let fn;
            if (miTurno && t.paso === 'jugar' && !especial) {
              if (c.tipo === 'especial' && !ESPECIALES[c.especial].pasiva) { accion = '▶ Usar'; fn = () => setEspecial(c); }
              else { accion = '🗑 Descartar'; fn = () => enviar('descartar', { uid: c.uid }); }
            }
            return <Carta key={c.uid} c={c} nueva={c.uid === t?.robada} onClick={fn} accion={accion} />;
          })}
        </div>
        {miTurno && t.paso === 'jugar' && !especial && (
          <p className="szp-pista">Descarta una carta para terminar tu turno. Las especiales también se pueden descartar sin usarlas.</p>
        )}
      </div>

      {miTurno && t.paso === 'jugar' && especial && (
        <PanelEspecial v={v} carta={especial} enviar={(tipo, d) => { enviar(tipo, d); setEspecial(null); }} onCancelar={() => setEspecial(null)} />
      )}

      {miTurno && t.paso === 'robar' && (
        <div className="szp-tarjeta">
          <p className="szp-etiqueta">{ultimoTurno ? 'Último turno: aprovéchalo para fastidiar… o salvar tu mano' : 'Elige de dónde robar'}</p>
          <div className="szp-dos">
            <button type="button" className="szp-opcion" disabled={v.mazo === 0} onClick={() => enviar('robar', { origen: 'mazo' })}>
              <span className="szp-dorso">?</span>
              <strong>Robar del mazo</strong>
              <small>A ciegas</small>
            </button>
            <button type="button" className="szp-opcion" disabled={!arriba} onClick={() => enviar('robar', { origen: 'descarte' })}>
              {arriba ? <Carta c={arriba} mini /> : <span className="szp-dorso">—</span>}
              <strong>Coger del descarte</strong>
              <small>{arriba ? 'La carta de arriba' : 'Vacío'}</small>
            </button>
          </div>
          {v.plantado == null && (
            <button type="button" className="szp-boton plantarse" onClick={() => enviar('plantarse')}>
              ✋ Plantarme con {conSigno(v.yo.suma)}
            </button>
          )}
          {v.plantado == null && <p className="szp-pista">Si te plantas, los demás tienen un último turno… y pueden fastidiarte. Si al final no eres el mejor de la ronda: +{AJUSTES.penalPlanton}.{v.yo.mano.some((c) => c.especial === 'escudo') ? ' Tu 🛡️ Escudo parará el primer ataque.' : ''}</p>}
        </div>
      )}

      {!miTurno && (
        <div className="szp-tarjeta szp-centro">
          <p className="szp-texto"><Icon name="clock" size={16} /> {quien?.nombre} está jugando…</p>
          {arriba && <div className="szp-descarte"><span>Descarte:</span><Carta c={arriba} mini /></div>}
        </div>
      )}

      <details className="szp-detalle">
        <summary>📖 Lo que ha pasado</summary>
        <div className="szp-log">{[...v.log].reverse().map((l) => <p key={l.n}>{l.texto}</p>)}</div>
      </details>

      {admin?.esAdmin && !miTurno && admin.desconectados?.includes(t?.jugadorId) && (
        <div className="szp-barra estatica">
          <button type="button" className="szp-enlace" onClick={admin.onForzar}><Icon name="forward" size={15} /> ¿No responde? Saltar a {quien?.nombre}</button>
        </div>
      )}
    </>
  );
}

// ---------------------------------------------------------------- Resultado de la ronda
export function PantallaResultado({ v, enviar, onSalir, local = false }) {
  const r = v.resultado;
  const yoListo = v.jugadores.find((j) => j.id === v.yo?.id)?.listo;
  const ganador = r.filas[0];
  return (
    <>
      <Hero v={v} onSalir={onSalir} etiqueta={`Fin de la ronda ${r.ronda}`} titulo={`Mejor mano: ${ganador?.nombre}`} clase="resultado" />
      <div className="szp-tarjeta">
        <p className="szp-etiqueta">Las manos, al descubierto</p>
        <div className="szp-filas">
          {r.filas.map((f, i) => (
            <div key={f.id} className={`szp-fila${i === 0 ? ' mejor' : ''}`}>
              <div className="szp-fila-cab">
                <Avatar id={f.id} nombre={f.nombre} />
                <strong>{f.nombre}{f.id === v.yo?.id ? ' (tú)' : ''}{f.id === r.plantado ? ' ✋' : ''}</strong>
                <span className={`szp-fila-suma${f.suma === 0 ? ' cero' : ''}`}>Σ {conSigno(f.suma)}</span>
                <b className="szp-fila-pts">{conSigno(f.puntos)}</b>
              </div>
              <div className="szp-cartas">{f.mano.map((c) => <Carta key={c.uid} c={c} mini />)}</div>
              <p className="szp-pista izquierda">
                {f.suma === 0 ? `¡Suma cero! −${AJUSTES.bonusCero} de premio. ` : `|${conSigno(f.suma)}| = ${Math.abs(f.suma)}. `}
                {f.especiales ? `${f.especiales} especial${f.especiales > 1 ? 'es' : ''} sin usar: +${f.especiales * AJUSTES.penalEspecial}. ` : ''}
                {f.planton ? `Se plantó y no fue el mejor: +${AJUSTES.penalPlanton}.` : ''}
              </p>
            </div>
          ))}
        </div>
      </div>
      <div className="szp-tarjeta">
        <p className="szp-etiqueta">Clasificación (menos puntos es mejor)</p>
        <ol className="szp-ranking">
          {[...v.jugadores].filter((j) => !j.fuera).sort((a, b) => a.total - b.total).map((j, i) => (
            <li key={j.id} className={i === 0 ? 'lider' : ''}><span className="szp-pos">{i + 1}</span><Avatar id={j.id} nombre={j.nombre} /><span className="szp-ranking-nombre">{j.nombre}</span><strong>{j.total}</strong></li>
          ))}
        </ol>
      </div>
      <div className="szp-barra">
        {yoListo && !local ? (
          <p className="szp-esperando">⏳ Esperando a: {v.jugadores.filter((j) => !j.fuera && !j.listo).map((j) => j.nombre).join(', ')}</p>
        ) : (
          <button type="button" className="szp-boton grande" onClick={() => enviar('continuar')}>
            <Icon name="forward" size={20} /> {v.ronda >= v.rondas ? 'Ver el resultado final' : 'Siguiente ronda'}
          </button>
        )}
      </div>
    </>
  );
}

export function PantallaFin({ v, onSalir, children }) {
  useRegistrarPartida('sumacero', resultadoDesdeFin(v));
  const f = v.fin;
  const nombre = (id) => v.jugadores.find((j) => j.id === id)?.nombre ?? '?';
  const top = f.tabla.filter((x) => !x.fuera).slice(0, 3);
  const colocacion = top.length === 3 ? [top[1], top[0], top[2]] : top.length === 2 ? [top[1], top[0]] : top;
  const alturas = ['primero', 'segundo', 'tercero'];
  const ganadores = f.ganadores.map(nombre);
  return (
    <>
      <Hero v={v} onSalir={onSalir} etiqueta="Fin de la partida" titulo={ganadores.length > 1 ? `Empate: ${ganadores.join(' y ')}` : `¡Gana ${ganadores[0]}!`} clase="fin" />
      <div className="szp-tarjeta szp-centro">
        <p className="szp-etiqueta centrada">Gana quien acumula menos puntos</p>
        <div className="szp-podio">
          {colocacion.map((x) => {
            const puesto = top.filter((o) => o.total < x.total).length;
            return (
              <div key={x.id} className={`szp-podio-col ${alturas[puesto]}`} style={{ '--c': colorDe(x.id) }}>
                <Avatar id={x.id} nombre={x.nombre} grande />
                <span className="szp-podio-nombre">{x.nombre}{x.id === v.yo?.id ? ' (tú)' : ''}</span>
                <span className="szp-podio-pts">{x.total} pts</span>
                <span className="szp-podio-base">{puesto + 1}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="szp-tarjeta">
        <p className="szp-etiqueta">Puntos por ronda</p>
        <div className="szp-tabla">
          <div className="cab"><span>Jugador</span>{v.historial.map((h) => <span key={h.ronda}>R{h.ronda}</span>)}<strong>Total</strong></div>
          {f.tabla.map((x) => (
            <div key={x.id} className={f.ganadores.includes(x.id) ? 'gana' : ''}>
              <span className="szp-tabla-nombre"><Avatar id={x.id} nombre={x.nombre} /> {x.nombre}{x.fuera ? ' (salió)' : ''}</span>
              {v.historial.map((h) => <span key={h.ronda}>{h.puntos[x.id] ?? '—'}</span>)}
              <strong>{x.total}</strong>
            </div>
          ))}
        </div>
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
          <p className="szp-ayuda-sub">🎯 Objetivo</p>
          <ul>
            <li>Empiezas con {AJUSTES.manoInicial} cartas con valores del −{AJUSTES.maxValor} al +{AJUSTES.maxValor}. Tienes que conseguir que la <strong>suma de tu mano sea 0</strong> o lo más cercana posible.</li>
          </ul>
          <p className="szp-ayuda-sub">🔁 Tu turno</p>
          <ol>
            <li><strong>Roba</strong> una carta del mazo (a ciegas) o coge la de arriba del descarte… o <strong>plántate</strong>.</li>
            <li>Después, <strong>descarta</strong> una carta o <strong>usa una especial</strong>. Las especiales usadas salen del juego; al descarte solo va lo que descartas.</li>
          </ol>
          <p className="szp-ayuda-sub">✋ Plantarse</p>
          <ul>
            <li>Cuando creas que tu mano es buena, plántate en lugar de robar: cada rival juega un último turno… y puede destrozarte la mano justo antes de terminar.</li>
            <li>Si te plantas y al final no tienes la mejor mano de la ronda: +{AJUSTES.penalPlanton} puntos (salvo que te hayan cambiado la mano después de plantarte).</li>
            <li>Para plantarte tranquilo, guárdate un 🛡️ Escudo: para el primer ataque (aunque si no lo gastas, cuenta +{AJUSTES.penalEspecial} al final). Y con 🔍 Rayos X puedes ver si alguien se guarda un Cambio de manos.</li>
          </ul>
          <p className="szp-ayuda-sub">🃏 Cartas especiales</p>
          <ul>{Object.values(ESPECIALES).map((e) => <li key={e.nombre}>{e.e} <strong>{e.nombre}:</strong> {e.desc}</li>)}</ul>
          <p className="szp-ayuda-sub">🏆 Puntos (menos es mejor)</p>
          <ul>
            <li>Al final de cada ronda sumas la distancia de tu mano al 0. Suma exacta 0: −{AJUSTES.bonusCero}.</li>
            <li>Cada especial que te quede en la mano: +{AJUSTES.penalEspecial}. Gana quien menos puntos acumule al final.</li>
          </ul>
        </div>
        <button type="button" className="big full qq-btn-principal" onClick={onCerrar}>¡Entendido!</button>
      </div>
    </div>
  );
}
