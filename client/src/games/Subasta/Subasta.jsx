// client/src/games/Subasta/Subasta.jsx
// «Subasta a ciegas»: pujas secretas por lotes misteriosos. Online o en un solo móvil.
import React, { useState } from 'react';
import JuegoPulsador from '../Pulsador/JuegoPulsador.jsx';
import LocalPorTurnos from '../comun/LocalPorTurnos.jsx';
import { Hero, Pildoras, AvisoTurno, PantallaFin } from '../Pulsador/Vistas.jsx';
import { BloqueConfig } from '../../components/MenuJuego.jsx';
import Icon from '../../components/Icon.jsx';
import * as E from './engine.js';
import './Subasta.css';

const contenidoTexto = (c) => (c.tipo === 'tesoro' ? `💰 Tesoro de ${c.valor}` : c.tipo === 'trasto' ? `🗑️ Trasto de ${c.valor}` : `${E.EFECTOS[c.efecto].e} ${E.EFECTOS[c.efecto].nombre}`);

function Inventario({ yo }) {
  if (!yo?.lotes.length) return null;
  return (
    <div className="pzp-tarjeta">
      <p className="pzp-etiqueta">Tus lotes (solo tú sabes lo que valen)</p>
      <ul className="sba-inventario">
        {yo.lotes.map((l) => <li key={l.n}><span>{l.e}</span><b>{l.nombre}</b><small>{l.tipo === 'efecto' ? `${E.EFECTOS[l.efecto].e} ${E.EFECTOS[l.efecto].nombre}` : `${l.tipo === 'tesoro' ? '💰' : '🗑️'} ${l.valor}${l.doble ? ' (×2)' : ''}`} · pagaste {l.pagado}</small></li>)}
      </ul>
    </div>
  );
}

function Lote({ v }) {
  const l = v.lote;
  return (
    <div className="pzp-tarjeta sba-lote" key={l.n}>
      <span className="sba-lote-emoji">{l.e}</span>
      <h2>{l.nombre}</h2>
      <p className="sba-tasacion">📋 Tasación oficial: <b>{l.tasacion[0]} – {l.tasacion[1]}</b> monedas</p>
      {v.yo?.soplo && <p className="sba-soplo">🕵️ {v.yo.soplo}</p>}
      {l.contenido && <p className="sba-lupa">🔍 Con tu lupa ves que es: <b>{contenidoTexto(l.contenido)}</b></p>}
    </div>
  );
}

function Pujar({ v, enviar }) {
  const yo = v.yo;
  const [cantidad, setCantidad] = useState(0);
  const [editar, setEditar] = useState(false);
  const pendientes = v.jugadores.filter((j) => !j.listo && !j.fuera);
  if (yo.listo && !editar) {
    return (
      <div className="pzp-tarjeta sba-hecho">
        <p>Has pujado <b>{yo.puja}</b> monedas en secreto.</p>
        <p className="pzp-nota">Esperando a {pendientes.map((j) => j.nombre).join(', ') || '…'}</p>
        <button type="button" className="pzp-enlace oscuro" onClick={() => { setCantidad(yo.puja); setEditar(true); }}>✏️ Cambiar mi puja</button>
      </div>
    );
  }
  const poner = (c) => setCantidad(Math.max(0, Math.min(yo.monedas, c)));
  return (
    <div className="pzp-tarjeta sba-pujar">
      <p className="pzp-etiqueta">Tienes {yo.monedas} monedas{yo.doble ? ' · ✨ tu próximo tesoro vale el doble' : ''}</p>
      <div className="sba-cantidad">{cantidad}<small>monedas</small></div>
      <input type="range" min="0" max={yo.monedas} value={cantidad} onChange={(e) => poner(Number(e.target.value))} className="sba-slider" />
      <div className="sba-rapidos">
        <button type="button" onClick={() => poner(0)}>0</button>
        <button type="button" onClick={() => poner(cantidad - 5)}>−5</button>
        <button type="button" onClick={() => poner(cantidad + 5)}>+5</button>
        <button type="button" onClick={() => poner(cantidad + 20)}>+20</button>
        <button type="button" onClick={() => poner(yo.monedas)}>Todo</button>
      </div>
      <button type="button" className="pzp-boton grande" onClick={() => { enviar('pujar', { cantidad }); setEditar(false); }}>
        🔨 {cantidad === 0 ? 'No pujar' : `Pujar ${cantidad} en secreto`}
      </button>
    </div>
  );
}

function Resultado({ v, enviar, local, admin }) {
  const r = v.resultado;
  const nombre = (id) => v.jugadores.find((j) => j.id === id)?.nombre;
  const mio = r.ganador === v.yo?.id ? v.yo.lotes.at(-1) : null;
  return (
    <>
      <div className={`pzp-tarjeta sba-resultado${r.ganador ? '' : ' nadie'}`}>
        <h2>{r.desierto ? 'Nadie ha pujado' : r.empate ? '¡Empate! Nadie se lo lleva' : `¡${nombre(r.ganador)} se lo lleva por ${r.pujas[0].puja}!`}</h2>
        {r.empate && <p className="pzp-nota">Los empatados pagan la mitad de su puja a la casa.</p>}
        <ol className="sba-pujas">
          {r.pujas.map((x, i) => <li key={x.id} className={x.id === r.ganador ? 'gana' : ''}><span>{i + 1}.</span><b>{x.nombre}</b><em>{x.puja}</em></li>)}
        </ol>
        {r.efecto && (
          <div className="sba-efecto">
            <span>{r.efecto.e}</span>
            <div><b>¡Sorpresa: {r.efecto.nombre}!</b><p>{r.efecto.texto}{r.efecto.victima ? ` (a ${r.efecto.victima}: ${r.efecto.cantidad})` : ''}</p></div>
          </div>
        )}
        {mio && mio.tipo !== 'efecto' && <p className="sba-secreto">🤫 Lo abres en secreto: <b>{mio.tipo === 'tesoro' ? `💰 ¡un tesoro de ${mio.valor}!` : `🗑️ un trasto de ${mio.valor}…`}</b></p>}
        {!mio && r.ganador && !r.efecto && <p className="pzp-nota">¿Tesoro o trasto? Solo {nombre(r.ganador)} lo sabe… hasta el final.</p>}
      </div>
      <div className="pzp-barra estatica">
        {local || !v.yo?.listo
          ? <button type="button" className="pzp-boton grande" onClick={() => enviar('seguir')}><Icon name="play" size={20} /> {v.ronda >= v.rondas ? 'Abrir todos los lotes' : 'Siguiente lote'}</button>
          : <p className="pzp-esperando">⏳ Esperando a los demás…</p>}
        {admin && !local && <button type="button" className="pzp-enlace" onClick={() => enviar('forzar')}><Icon name="forward" size={15} /> Seguir sin esperar</button>}
      </div>
    </>
  );
}

function Partida({ v, enviar, onSalir, admin, local }) {
  return (
    <>
      <Hero v={v} juego={JUEGO} onSalir={onSalir} chip={`🔨 Lote ${v.ronda}/${v.rondas}`}
        etiqueta={v.fase === 'pujar' ? 'Puja en secreto' : 'Resultado de la puja'} titulo={v.lote?.nombre}
        extra={(j) => <small className="sba-extra">📦{j.lotes}{v.fase === 'pujar' && j.listo ? ' ✓' : ''}</small>} />
      {!local && <AvisoTurno clave={`${v.ronda}-${v.fase}`} emoji={v.fase === 'pujar' ? v.lote.e : '🔨'} texto={v.fase === 'pujar' ? `Lote ${v.ronda}: ${v.lote.nombre}` : '¡Adjudicado!'} />}
      {v.fase === 'pujar' ? (
        <>
          <Lote v={v} />
          {v.yo ? <Pujar key={v.ronda} v={v} enviar={enviar} /> : <p className="pzp-esperando">Pujando…</p>}
          {admin && !local && <div className="pzp-barra estatica"><button type="button" className="pzp-enlace" onClick={() => enviar('forzar')}><Icon name="forward" size={15} /> Cerrar la puja (los que falten pujan 0)</button></div>}
        </>
      ) : <Resultado v={v} enviar={enviar} local={local} admin={admin} />}
      {v.yo?.lupa?.filter((l) => l.n > v.ronda).length > 0 && (
        <div className="pzp-tarjeta"><p className="pzp-etiqueta">🔍 Tu lupa: próximos lotes</p>{v.yo.lupa.filter((l) => l.n > v.ronda).map((l) => <p key={l.n} className="sba-lupa">{l.e} {l.nombre}: <b>{contenidoTexto(l.contenido)}</b></p>)}</div>
      )}
      {!local || v.yo ? <Inventario yo={v.yo} /> : null}
    </>
  );
}

function Fin(props) {
  const f = props.v.fin;
  return (
    <PantallaFin {...props}>
      <div className="pzp-tarjeta">
        <p className="pzp-etiqueta">Se abren todos los lotes</p>
        <ul className="sba-inventario">
          {f.lotes.map((l) => {
            const dueno = f.tabla.find((t) => t.lotes.some((x) => x.n === l.n));
            const comprado = dueno?.lotes.find((x) => x.n === l.n);
            return <li key={l.n}><span>{l.e}</span><b>{l.nombre}</b><small>{contenidoTexto(l.contenido)}{comprado?.doble ? ' ×2' : ''} · {dueno ? `${dueno.nombre} pagó ${comprado.pagado}` : 'sin dueño'}</small></li>;
          })}
        </ul>
      </div>
      {props.children}
    </PantallaFin>
  );
}

function Config({ config, onCambiar }) {
  return (
    <BloqueConfig titulo="Número de lotes">
      <Pildoras opciones={E.OPCIONES_LOTES.map((n) => [n, `${n} lotes`])} valor={config.lotes} onCambiar={onCambiar && ((lotes) => onCambiar({ lotes }))} />
    </BloqueConfig>
  );
}

const JUEGO = {
  id: 'subasta',
  api: '/api/subasta',
  emoji: '🔨',
  config: { lotes: 8 },
  Partida: (props) => <Partida {...props} admin={props.admin ?? props.sala?.esAdmin} />,
  Fin,
  Config,
  Local: (props) => <LocalPorTurnos {...props} E={E} />,
  textoPasar: () => 'Mira el lote, lee el soplo de tu experto (si tienes) y puja en secreto.',
  textoEmpezar: '¡Que empiece la subasta!',
  notaSala: '🔨 Cada uno puja en secreto desde su móvil. Algunos reciben el soplo privado de su experto.',
  ganador: (n) => `¡${n.join(' y ')} hace la mejor fortuna!`,
  detalleFin: (j) => `${j.monedas} monedas + ${j.objetos} en objetos`,
  unidadPuntos: '🪙',
  reglas: [
    `Todos empezáis con ${E.INICIAL} monedas. En cada ronda sale un lote con una tasación orientativa (que puede engañar).`,
    'Algunos jugadores reciben en secreto el soplo de su experto sobre ese lote.',
    'Todos pujáis a la vez y en secreto. La puja más alta se lleva el lote y lo paga. Si hay empate arriba, nadie se lo lleva y los empatados pagan la mitad.',
    'El lote puede ser un tesoro 💰, un trasto 🗑️ o un efecto especial: maldición 💀, ladrón 🦹, varita duplicadora ✨, lupa 🔍, garantía 💸 o regalo para todos 🎁. Los efectos se aplican al momento; el valor de tesoros y trastos solo lo conoce quien los gana… hasta el final.',
    'Al final se abren todos los lotes: gana quien sume más monedas + valor de sus objetos.'
  ]
};

export default function Subasta({ onExit }) {
  return <JuegoPulsador juego={JUEGO} onExit={onExit} />;
}
