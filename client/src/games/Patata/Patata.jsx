// client/src/games/Patata/Patata.jsx
// «La Patata Caliente»: pásate la bomba antes de que explote. Online o en un solo móvil.
import React, { useState } from 'react';
import JuegoPulsador from '../Pulsador/JuegoPulsador.jsx';
import LocalPorTurnos from '../comun/LocalPorTurnos.jsx';
import { Hero, Pildoras, AvisoTurno } from '../Pulsador/Vistas.jsx';
import { BloqueConfig } from '../../components/MenuJuego.jsx';
import * as E from './engine.js';
import './Patata.css';

const HEX = { rojo: '#ef4444', azul: '#3b82f6', verde: '#22c55e', amarillo: '#eab308' };

export function Carta({ c, sel, onClick, chica }) {
  const num = c.tipo === 'numero';
  const esp = E.ESPECIALES[c.tipo];
  return (
    <button type="button" className={`pat-carta${num ? '' : ' especial'}${sel ? ' sel' : ''}${chica ? ' chica' : ''}`} style={num ? { '--c': HEX[c.color] } : undefined} onClick={onClick} disabled={!onClick}>
      {num ? <><b>{c.valor}</b><small>{c.color}</small></> : <><b>{esp.e}</b><small>{esp.nombre}</small></>}
    </button>
  );
}

const textoCondicion = (c) => (c.tipo === 'superar' ? <>Supera el <b>{c.valor}</b></> : c.tipo === 'color' ? <>Juega <b style={{ color: HEX[c.color] }}>{c.color}</b></> : <>Juega <b>lo que quieras</b></>);

function Bomba({ v }) {
  const nombre = v.jugadores.find((j) => j.id === v.portador)?.nombre;
  return (
    <div className={`pzp-tarjeta pat-bomba n${v.nervios}`}>
      <span className="pat-bomba-emoji">💣</span>
      <p className="pat-portador">La tiene <b>{nombre}</b> <span className="pat-sentido">{v.sentido > 0 ? '⟳' : '⟲'}</span></p>
      <p className="pat-condicion">{textoCondicion(v.condicion)}</p>
      <p className="pzp-nota">{v.nervios === 2 ? '🔥 ¡La mecha está a punto!' : v.nervios === 1 ? '⏳ La mecha se calienta…' : '🕯️ La mecha arde tranquila… de momento.'}</p>
      {v.log[0] && (
        <div className="pat-ultima">
          <small>{v.jugadores.find((j) => j.id === v.log[0].de)?.nombre} jugó</small>
          <div>{v.log[0].cartas.map((c, i) => <Carta key={i} c={c} chica />)}</div>
        </div>
      )}
    </div>
  );
}

function Mano({ v, enviar }) {
  const [sel, setSel] = useState([]);
  const [destino, setDestino] = useState(null);
  const [color, setColor] = useState(null);
  const mio = v.portador === v.yo.id;
  const cartas = sel.map((u) => v.yo.mano.find((c) => c.uid === u)).filter(Boolean);
  const especial = cartas.length === 1 && cartas[0].tipo !== 'numero' ? cartas[0].tipo : null;
  const valido = cartas.length > 0 && E.cumple(v.condicion, cartas) && (especial !== 'dirigir' || destino) && (especial !== 'color' || color);
  const tocar = (c) => {
    if (!mio) return;
    setSel((s) => {
      if (s.includes(c.uid)) return s.filter((x) => x !== c.uid);
      if (c.tipo !== 'numero') return [c.uid];
      const otras = s.map((u) => v.yo.mano.find((x) => x.uid === u)).filter((x) => x && x.tipo === 'numero');
      return otras.length >= 2 ? [c.uid] : [...otras.map((x) => x.uid), c.uid];
    });
  };
  const pasar = () => { enviar('jugar', { cartas: sel, destino, color }); setSel([]); setDestino(null); setColor(null); };
  return (
    <div className={`pzp-tarjeta pat-mano${mio ? ' activa' : ''}`}>
      <p className="pzp-etiqueta">{mio ? '¡Tienes la bomba! Elige 1 carta (o 2 del mismo color)' : 'Tu mano'}</p>
      <div className="pat-cartas">{v.yo.mano.map((c) => <Carta key={c.uid} c={c} sel={sel.includes(c.uid)} onClick={mio ? () => tocar(c) : undefined} />)}</div>
      {mio && especial === 'dirigir' && (
        <div className="pat-elegir">
          <p className="pzp-nota">¿A quién se la pasas?</p>
          {v.jugadores.filter((j) => j.id !== v.yo.id && !j.eliminado && !j.fuera).map((j) => <button key={j.id} type="button" className={destino === j.id ? 'sel' : ''} onClick={() => setDestino(j.id)}>{j.nombre}</button>)}
        </div>
      )}
      {mio && especial === 'color' && (
        <div className="pat-elegir">
          <p className="pzp-nota">¿Qué color tendrá que jugar el siguiente?</p>
          {E.COLORES.map((c) => <button key={c} type="button" className={color === c ? 'sel' : ''} style={{ '--c': HEX[c] }} onClick={() => setColor(c)}>{c}</button>)}
        </div>
      )}
      {mio && (
        <div className="pat-acciones">
          <button type="button" className="pzp-boton grande" disabled={!valido} onClick={pasar}>💨 ¡Pasar la bomba!</button>
          <button type="button" className="pzp-boton secundario" onClick={() => enviar('robar')}>🃏 Robar carta</button>
        </div>
      )}
      {mio && cartas.length > 0 && !E.cumple(v.condicion, cartas) && <p className="pat-aviso">Eso no cumple: {textoCondicion(v.condicion)}</p>}
    </div>
  );
}

function Partida({ v, enviar, onSalir, local }) {
  const extra = (j) => <small className="pat-vidas">{j.eliminado ? '☠️' : '❤️'.repeat(j.vidas)} · 🃏{j.cartas}</small>;
  if (v.fase === 'explosion') {
    const ex = v.explosion;
    return (
      <>
        <Hero v={v} juego={JUEGO} onSalir={onSalir} chip={`💣 Ronda ${v.ronda}`} etiqueta="¡BUUUM!" titulo={ex.eliminado ? `${ex.nombre} queda eliminado` : `${ex.nombre} pierde una vida`} clase="fallo" extra={extra} />
        <div className="pzp-tarjeta pat-explosion"><span>💥</span><p>{ex.eliminado ? '¡Se acabaron sus vidas!' : 'La siguiente ronda empieza enseguida…'}</p></div>
      </>
    );
  }
  const mio = v.yo && v.portador === v.yo.id;
  return (
    <>
      <Hero v={v} juego={JUEGO} onSalir={onSalir} chip={`💣 Ronda ${v.ronda}`} turno={v.portador}
        etiqueta={mio ? '¡Es tuya!' : 'Patata caliente'} titulo={mio ? '¡Quítatela de encima!' : `La tiene ${v.jugadores.find((j) => j.id === v.portador)?.nombre}`} extra={extra} />
      {!local && <AvisoTurno clave={mio ? `${v.ronda}-${v.log[0]?.t ?? 0}` : null} emoji="💣" texto="¡Te ha llegado la bomba!" id={v.yo?.id} />}
      <Bomba v={v} />
      {v.yo && !v.yo.eliminado ? <Mano key={`${v.portador}-${v.log[0]?.t ?? 0}`} v={v} enviar={enviar} /> : v.yo?.eliminado ? <p className="pzp-esperando">☠️ Estás eliminado. ¡Mira cómo arde!</p> : null}
    </>
  );
}

function Config({ config, onCambiar }) {
  return (
    <BloqueConfig titulo="Vidas de cada jugador">
      <Pildoras opciones={E.OPCIONES_VIDAS.map((n) => [n, `${n} vidas`])} valor={config.vidas} onCambiar={onCambiar && ((vidas) => onCambiar({ vidas }))} />
    </BloqueConfig>
  );
}

const JUEGO = {
  id: 'patata',
  api: '/api/patata',
  emoji: '💣',
  config: { vidas: 3 },
  tiempoReal: true,
  Partida: (props) => <Partida {...props} admin={props.admin ?? props.sala?.esAdmin} />,
  Config,
  Local: (props) => <LocalPorTurnos {...props} E={E} />,
  textoPasar: () => '¡Te llega la bomba! La mecha no corre hasta que la cojas.',
  textoEmpezar: '¡Encender la mecha!',
  notaSala: '💣 La mecha es secreta y corre de verdad: cuanto antes te la quites de encima, mejor.',
  ganador: (n) => `¡${n.join(' y ')} sobrevive a la patata caliente!`,
  detalleFin: (j) => (j.vidas > 0 ? `${j.vidas} ${j.vidas === 1 ? 'vida' : 'vidas'}` : 'eliminado'),
  unidadPuntos: '❤️',
  reglas: [
    'Hay una bomba con una mecha secreta (entre 20 y 50 segundos) que pasa de mano en mano. Cada uno tiene 5 cartas: números del 1 al 12 en cuatro colores y cartas especiales.',
    'Para pasar la bomba tienes que cumplir la condición: superar la cifra anterior (con una carta o con dos del mismo color sumadas), jugar el color pedido o, si está libre, lo que quieras.',
    'Lo que juegas marca la condición del siguiente: si sumas 15, el siguiente tendrá que superar 15. ¡No se lo pongas fácil!',
    'Especiales (se pueden jugar siempre): 🔄 invertir el sentido, ⏭️ saltar al siguiente, 🎯 pasarla a quien quieras, 🌶️ calentar (+4 a la cifra), 🧊 enfriar (vale cualquier carta) y 🎨 elegir color.',
    'Si no puedes (o no quieres) jugar, roba una carta… pero el tiempo sigue corriendo.',
    'Cuando la mecha se acaba, quien tiene la bomba pierde una vida. Gana el último que siga en pie.'
  ]
};

export default function Patata({ onExit }) {
  return <JuegoPulsador juego={JUEGO} onExit={onExit} />;
}
