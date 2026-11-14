// client/src/games/Dragon/Dragon.jsx
// «El Dragón»: tesoros, valor y retirada a tiempo. Online (cada uno en su móvil) o en un solo móvil.
import React from 'react';
import JuegoPulsador from '../Pulsador/JuegoPulsador.jsx';
import LocalPorTurnos from '../comun/LocalPorTurnos.jsx';
import { Hero, Pildoras, AvisoTurno } from '../Pulsador/Vistas.jsx';
import { BloqueConfig } from '../../components/MenuJuego.jsx';
import Icon from '../../components/Icon.jsx';
import * as E from './engine.js';
import './Dragon.css';

function Mazmorra({ v }) {
  return (
    <div className="pzp-tarjeta drg-mazmorra">
      <p className="pzp-etiqueta">Salas de esta expedición</p>
      <ol className="drg-salas">
        {v.salas.map((s) => (
          <li key={s.n} className={s.tipo}>
            <span>{s.tipo === 'dragon' ? '🐉' : s.tipo === 'reliquia' ? '🏺' : '💰'}</span>
            <b>{s.tipo === 'dragon' ? '¡Dragón!' : s.tipo === 'reliquia' ? `Reliquia ${s.valor}` : s.valor}</b>
            {s.tipo === 'tesoro' && <small>{s.cada} c/u{s.resto ? ` · ${s.resto} al suelo` : ''}</small>}
          </li>
        ))}
      </ol>
      <div className="drg-suelo">
        <span>🪙 En el suelo: <b>{v.suelo}</b></span>
        {v.reliquias.length > 0 && <span>🏺 Reliquias: <b>{v.reliquias.join(' + ')}</b> <small>(solo si sale uno solo)</small></span>}
      </div>
    </div>
  );
}

function Riesgo({ v }) {
  const pct = Math.round(v.riesgo * 100);
  return (
    <div className={`drg-riesgo${pct >= 30 ? ' alto' : pct >= 15 ? ' medio' : ''}`}>
      <span>🔥</span>
      <div><b>{pct} %</b> de que la próxima sala sea la del dragón</div>
      <i style={{ width: `${pct / 0.55}%` }} />
    </div>
  );
}

function Ultimo({ v }) {
  const u = v.ultimo;
  if (!u || (!u.vuelven?.length && !u.dragon)) return null;
  return (
    <div className="pzp-tarjeta drg-ultimo">
      {u.vuelven?.length > 0 && <p>🏃 Han vuelto: {u.vuelven.map((x) => `${x.nombre} (guarda ${x.guarda}${x.reliquias ? `, con reliquias +${x.reliquias}` : ''})`).join(', ')}</p>}
      {u.siguen?.length > 0 && <p>⛏️ Siguen: {u.siguen.map((x) => x.nombre).join(', ')}</p>}
    </div>
  );
}

function Partida({ v, enviar, onSalir, admin, local }) {
  const yo = v.yo;
  const pendientes = v.jugadores.filter((j) => j.dentro && !j.listo && !j.fuera);
  const cabecera = (
    <Hero v={v} juego={JUEGO} onSalir={onSalir} chip={`🐉 Expedición ${v.ronda}/${v.rondas}`}
      etiqueta={v.fase === 'resumen' ? 'Fin de la expedición' : `Sala ${v.salas.length}`}
      titulo={v.fase === 'resumen' ? (v.motivo === 'dragon' ? '¡HA DESPERTADO EL DRAGÓN!' : 'Todos han salido a tiempo') : yo?.dentro ? '¿Sigues o vuelves?' : 'En la mazmorra…'}
      clase={v.fase === 'resumen' && v.motivo === 'dragon' ? 'fallo' : ''}
      extra={(j) => <small className="drg-estado">{j.dentro ? `🎒${j.mochila}` : '🏠'}{v.fase === 'decidir' && j.dentro && j.listo ? ' ✓' : ''}</small>} />
  );
  if (v.fase === 'resumen') {
    const perdidos = v.ultimo?.dragon || [];
    return (
      <>
        {cabecera}
        {!local && <AvisoTurno clave={`r${v.ronda}`} emoji={v.motivo === 'dragon' ? '🐉' : '🏆'} texto={v.motivo === 'dragon' ? '¡El dragón!' : 'Expedición terminada'} />}
        {perdidos.length > 0 && (
          <div className="pzp-tarjeta drg-dragon">
            <span className="drg-dragon-emoji">🐉</span>
            <p>{perdidos.map((x) => `${x.nombre} pierde ${x.pierde}`).join(' · ')}</p>
          </div>
        )}
        <Mazmorra v={v} />
        <Ultimo v={v} />
        <div className="pzp-barra estatica">
          {local || !yo?.listo
            ? <button type="button" className="pzp-boton grande" onClick={() => enviar('seguir')}><Icon name="play" size={20} /> {v.ronda >= v.rondas ? 'Ver el resultado' : 'Siguiente expedición'}</button>
            : <p className="pzp-esperando">⏳ Esperando a los demás…</p>}
          {admin && !local && <button type="button" className="pzp-enlace" onClick={() => enviar('forzar')}><Icon name="forward" size={15} /> Seguir sin esperar</button>}
        </div>
      </>
    );
  }
  return (
    <>
      {cabecera}
      {!local && <AvisoTurno clave={`${v.ronda}-${v.salas.length}`} emoji="🚪" texto={`Sala ${v.salas.length}`} sub={yo?.dentro ? '¿Sigues dentro o vuelves con tu botín?' : 'Mira quién se atreve…'} />}
      <Mazmorra v={v} />
      <Ultimo v={v} />
      <Riesgo v={v} />
      {yo?.dentro && !yo.listo && (
        <div className="drg-decision">
          <p className="pzp-etiqueta centrada">Tu mochila: <b>{yo.mochila} 🪙</b> · tu cofre: {yo.cofre}</p>
          <button type="button" className="drg-boton seguir" onClick={() => enviar('decidir', { decision: 'seguir' })}><span>⛏️</span>Seguir explorando</button>
          <button type="button" className="drg-boton volver" onClick={() => enviar('decidir', { decision: 'volver' })}><span>🏃</span>Volver con {yo.mochila} 🪙</button>
        </div>
      )}
      {yo?.dentro && yo.listo && <p className="pzp-esperando">Has decidido <b>{yo.decision === 'seguir' ? 'seguir ⛏️' : 'volver 🏃'}</b>. Esperando a {pendientes.map((j) => j.nombre).join(', ')}…</p>}
      {yo && !yo.dentro && <p className="pzp-esperando">🏠 Estás a salvo con {yo.cofre} 🪙 en el cofre. Esperando a {pendientes.map((j) => j.nombre).join(', ') || 'la mazmorra'}…</p>}
      {admin && !local && pendientes.length > 0 && <div className="pzp-barra estatica"><button type="button" className="pzp-enlace" onClick={() => enviar('forzar')}><Icon name="forward" size={15} /> Los que no decidan, vuelven</button></div>}
    </>
  );
}

function Config({ config, onCambiar }) {
  return (
    <BloqueConfig titulo="Expediciones">
      <Pildoras opciones={E.OPCIONES_EXPEDICIONES.map((n) => [n, `${n} expediciones`])} valor={config.expediciones} onCambiar={onCambiar && ((expediciones) => onCambiar({ expediciones }))} />
    </BloqueConfig>
  );
}

const JUEGO = {
  id: 'dragon',
  api: '/api/dragon',
  emoji: '🐉',
  config: { expediciones: 5 },
  Partida: (props) => <Partida {...props} admin={props.admin ?? props.sala?.esAdmin} />,
  Config,
  Local: (props) => <LocalPorTurnos {...props} E={E} />,
  textoPasar: () => 'Decide en secreto si sigues o vuelves.',
  textoEmpezar: '¡A la mazmorra!',
  notaSala: '🐉 Cada uno decide en su móvil, en secreto, si sigue o vuelve. Se descubre todo a la vez.',
  ganador: (n) => `¡${n.join(' y ')} sale con más oro!`,
  detalleFin: () => 'oro en el cofre',
  unidadPuntos: '🪙',
  reglas: [
    'Entráis todos en la mazmorra. En cada sala hay un tesoro que se reparte a partes iguales entre los que siguen dentro; lo que sobra se queda en el suelo.',
    'Después de cada sala, todos decidís a la vez y en secreto: seguir explorando o volver.',
    'Los que vuelven guardan su mochila en el cofre (ya no se puede perder) y se reparten lo que había en el suelo. Si vuelve uno solo, se lleva también las reliquias 🏺.',
    'Cada sala nueva aumenta la probabilidad de que aparezca el dragón 🐉 (la veis en pantalla). Si aparece, los que siguen dentro pierden toda su mochila de esa expedición.',
    'Al final de todas las expediciones, gana quien tenga más oro en el cofre.'
  ]
};

export default function Dragon({ onExit }) {
  return <JuegoPulsador juego={JUEGO} onExit={onExit} />;
}
