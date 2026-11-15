// client/src/games/CuatroCuatros/CuatroCuatros.jsx
// «Cuatro cuatros»: dados de farol. Online (cada uno ve sus dados en su móvil) o en un solo móvil.
import React, { useState } from 'react';
import JuegoPulsador from '../Pulsador/JuegoPulsador.jsx';
import LocalPorTurnos from '../comun/LocalPorTurnos.jsx';
import { Hero, Pildoras, AvisoTurno } from '../Pulsador/Vistas.jsx';
import { BloqueConfig } from '../../components/MenuJuego.jsx';
import Icon from '../../components/Icon.jsx';
import * as E from './engine.js';
import './CuatroCuatros.css';

const PUNTOS = { 1: [[50, 50]], 2: [[28, 28], [72, 72]], 3: [[28, 28], [50, 50], [72, 72]], 4: [[28, 28], [72, 28], [28, 72], [72, 72]],
  5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]], 6: [[28, 26], [72, 26], [28, 50], [72, 50], [28, 74], [72, 74]] };

export function Dado({ v, marcado, chico, oculto, onClick, sel }) {
  const Tag = onClick ? 'button' : 'span';
  return (
    <Tag type={onClick ? 'button' : undefined} onClick={onClick} className={`ccd-dado${marcado ? ' marcado' : ''}${chico ? ' chico' : ''}${oculto ? ' oculto' : ''}${sel ? ' sel' : ''}${v === 1 ? ' uno' : ''}`}>
      <svg viewBox="0 0 100 100" aria-label={oculto ? 'Dado oculto' : `Dado ${v}`}>
        <rect x="4" y="4" width="92" height="92" rx="20" className="cara" />
        {oculto ? <text x="50" y="66" textAnchor="middle" className="interrogante">?</text> : PUNTOS[v].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="9" className="punto" />)}
      </svg>
    </Tag>
  );
}

const textoApuesta = (a) => `${a.cantidad} × `;

function Apuesta({ v }) {
  const a = v.apuesta;
  const quien = a && v.jugadores.find((j) => j.id === a.id)?.nombre;
  return (
    <div className="pzp-tarjeta ccd-apuesta">
      <p className="pzp-etiqueta centrada">🎲 {v.total} dados en la mesa · los unos son comodines</p>
      {a ? (
        <>
          <p className="ccd-quien">{quien} apuesta que hay al menos</p>
          <div className="ccd-grande"><b>{a.cantidad}</b><span>×</span><Dado v={a.valor} /></div>
        </>
      ) : <p className="ccd-quien">Aún no hay apuesta: abre la ronda quien tiene el turno.</p>}
      {v.historial.length > 1 && (
        <div className="ccd-historial">
          {v.historial.slice(0, -1).map((h, i) => <span key={i}>{v.jugadores.find((j) => j.id === h.id)?.nombre}: {textoApuesta(h)}<Dado v={h.valor} chico /></span>)}
        </div>
      )}
    </div>
  );
}

function MisDados({ dados, titulo = 'Tus dados (solo los ves tú)' }) {
  return (
    <div className="pzp-tarjeta ccd-mios">
      <p className="pzp-etiqueta centrada">{titulo}</p>
      <div className="ccd-fila">{dados.map((d, i) => <Dado key={i} v={d} />)}</div>
    </div>
  );
}

function Pujar({ v, enviar }) {
  const [valor, setValor] = useState(v.apuesta?.valor ?? 4);
  const minimo = E.minimoPara(v.apuesta, valor);
  const [cantidad, setCantidad] = useState(Math.max(1, minimo));
  const c = Math.max(cantidad, minimo);
  const valida = c <= v.total && E.subidaValida(v.apuesta, { cantidad: c, valor });
  const elegirValor = (x) => { setValor(x); setCantidad(Math.max(1, E.minimoPara(v.apuesta, x))); };
  return (
    <div className="pzp-tarjeta ccd-pujar">
      <p className="pzp-etiqueta">{v.apuesta ? 'Sube la apuesta…' : 'Abre la ronda con una apuesta'}</p>
      <div className="ccd-valores">{[1, 2, 3, 4, 5, 6].map((x) => <Dado key={x} v={x} onClick={() => elegirValor(x)} sel={valor === x} />)}</div>
      <div className="ccd-cantidad">
        <button type="button" onClick={() => setCantidad(Math.max(minimo, c - 1))} disabled={c <= minimo}>−</button>
        <b>{c} × </b><Dado v={valor} chico />
        <button type="button" onClick={() => setCantidad(Math.min(v.total, c + 1))} disabled={c >= v.total}>+</button>
      </div>
      <button type="button" className="pzp-boton grande" disabled={!valida} onClick={() => enviar('apostar', { cantidad: c, valor })}>🎲 Apostar {c} × {valor === 1 ? 'unos' : `${valor}s`}</button>
      {v.apuesta && (
        <div className="pzp-dos ccd-cantar">
          <button type="button" className="ccd-mentiroso" onClick={() => enviar('dudar')}>🤥 ¡Mentiroso!</button>
          <button type="button" className="ccd-exacto" onClick={() => enviar('exacto')}>🎯 ¡Exacto!</button>
        </div>
      )}
    </div>
  );
}

function Revelar({ v, enviar, local, admin }) {
  const r = v.revelado;
  const nombre = (id) => v.jugadores.find((j) => j.id === id)?.nombre;
  const cumple = (d) => d === r.apuesta.valor || (r.apuesta.valor !== 1 && d === 1);
  const resultado = r.tipo === 'exacto'
    ? (r.gana != null ? `¡Clavado! ${nombre(r.gana)} recupera un dado` : `No era exacto: ${nombre(r.pierde)} pierde un dado`)
    : `${nombre(r.pierde)} pierde un dado`;
  return (
    <>
      <div className="pzp-tarjeta ccd-revelar">
        <p className="ccd-quien">{nombre(r.apuesta.id)} apostó al menos</p>
        <div className="ccd-grande"><b>{r.apuesta.cantidad}</b><span>×</span><Dado v={r.apuesta.valor} /></div>
        <p className={`ccd-hay ${r.hay >= r.apuesta.cantidad ? 'si' : 'no'}`}>Había <b>{r.hay}</b></p>
        <p className="ccd-resultado">{resultado}{r.eliminado ? ` y queda eliminado ☠️` : ''}</p>
      </div>
      <div className="pzp-tarjeta">
        <p className="pzp-etiqueta">Se levantan los dados</p>
        <ul className="ccd-manos">
          {r.manos.map((m) => (
            <li key={m.id} className={m.id === r.pierde ? 'pierde' : m.id === r.gana ? 'gana' : ''}>
              <b>{m.nombre}</b>
              <div className="ccd-fila">{m.dados.map((d, i) => <Dado key={i} v={d} chico marcado={cumple(d)} />)}</div>
            </li>
          ))}
        </ul>
      </div>
      <div className="pzp-barra estatica">
        {local || (v.yo && !v.yo.listo && !v.yo.eliminado)
          ? <button type="button" className="pzp-boton grande" onClick={() => enviar('seguir')}><Icon name="refresh" size={20} /> Volver a tirar los dados</button>
          : <p className="pzp-esperando">⏳ Esperando a los demás…</p>}
        {admin && !local && <button type="button" className="pzp-enlace" onClick={() => enviar('forzar')}><Icon name="forward" size={15} /> Seguir sin esperar</button>}
      </div>
    </>
  );
}

function Partida({ v, enviar, onSalir, admin, local }) {
  const turno = v.jugadores.find((j) => j.id === v.turno);
  const mio = v.fase === 'apostar' && (local || v.yo?.id === v.turno);
  const extra = (j) => (j.eliminado ? <small className="ccd-extra">☠️</small> : null);
  const titulo = v.fase === 'revelar' ? (v.revelado.tipo === 'exacto' ? '¡Exacto!' : '¡Mentiroso!') : mio && !local ? '¡Te toca!' : `Turno de ${turno?.nombre}`;
  return (
    <>
      <Hero v={v} juego={JUEGO} onSalir={onSalir} chip={`🎲 Ronda ${v.ronda}`} turno={v.turno} etiqueta={v.fase === 'revelar' ? 'Se levantan los dados' : 'Dados de farol'} titulo={titulo}
        clase={v.fase === 'revelar' ? 'fin' : ''} extra={extra} />
      {!local && v.fase === 'apostar' && <AvisoTurno clave={mio ? `${v.ronda}-${v.historial.length}` : null} emoji="🎲" texto="¡Te toca!" sub="Sube la apuesta o canta «¡Mentiroso!»." id={v.yo?.id} />}
      {v.fase === 'revelar' ? <Revelar v={v} enviar={enviar} local={local} admin={admin} /> : (
        <>
          <Apuesta v={v} />
          {v.yo && !v.yo.eliminado && <MisDados dados={v.yo.dados} titulo={local ? `Dados de ${turno?.nombre} (que no miren los demás)` : undefined} />}
          {v.yo?.eliminado && <p className="pzp-esperando">☠️ Te has quedado sin dados. ¡Mira cómo se mienten!</p>}
          {mio ? <Pujar key={`${v.ronda}-${v.historial.length}`} v={v} enviar={enviar} /> : !v.yo?.eliminado && <p className="pzp-esperando">⏳ {turno?.nombre} está pensando su jugada…</p>}
          {admin && !local && !mio && <div className="pzp-barra estatica"><button type="button" className="pzp-enlace" onClick={() => enviar('forzar')}><Icon name="forward" size={15} /> Forzar la jugada de {turno?.nombre}</button></div>}
        </>
      )}
    </>
  );
}

function Config({ config, onCambiar }) {
  return (
    <BloqueConfig titulo="Dados por jugador">
      <Pildoras opciones={E.OPCIONES_DADOS.map((n) => [n, `${n} dados`])} valor={config.dados} onCambiar={onCambiar && ((dados) => onCambiar({ dados }))} />
    </BloqueConfig>
  );
}

const JUEGO = {
  id: 'cuatrocuatros',
  api: '/api/cuatrocuatros',
  emoji: '🎲',
  config: { dados: 5 },
  Partida: (props) => <Partida {...props} admin={props.admin ?? props.sala?.esAdmin} />,
  Config,
  Local: (props) => <LocalPorTurnos {...props} E={E} />,
  textoPasar: () => 'Mira tus dados en secreto y haz tu jugada.',
  textoEmpezar: '¡Tirar los dados!',
  notaSala: '🎲 Cada uno ve sus dados en su móvil. ¡Farolea con cara de póker!',
  ganador: (n) => `¡${n.join(' y ')} es el mejor mentiroso!`,
  detalleFin: (j) => (j.dados ? `aguanta con ${j.dados} ${j.dados === 1 ? 'dado' : 'dados'}` : `${j.puesto}.º en caer`),
};

export default function CuatroCuatros({ onExit }) {
  return <JuegoPulsador juego={JUEGO} onExit={onExit} />;
}
