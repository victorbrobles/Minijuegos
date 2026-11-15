// client/src/games/Piramides/Piramides.jsx
// «Pirámides futbolísticas»: cada uno tiene una categoría secreta y son los propios jugadores quienes dicen si un
// futbolista encaja. Adivina las categorías de los demás para eliminarlos. Online o en un solo móvil.
import React, { useMemo, useState } from 'react';
import JuegoPulsador from '../Pulsador/JuegoPulsador.jsx';
import LocalPorTurnos from '../comun/LocalPorTurnos.jsx';
import { Hero, Pildoras, AvisoTurno, PantallaFin } from '../Pulsador/Vistas.jsx';
import { BloqueConfig } from '../../components/MenuJuego.jsx';
import Icon from '../../components/Icon.jsx';
import * as E from './engine.js';
import { CATEGORIAS, GRUPOS } from './categorias.js';
import './Piramides.css';

const norm = (t) => String(t ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const nombreDe = (v, id) => v.jugadores.find((j) => j.id === id)?.nombre ?? '¿?';

/** Botón que enseña la categoría solo mientras se mantiene pulsado (para que no la vea nadie más). */
function VerCategoria({ texto, quien }) {
  const [ver, setVer] = useState(false);
  if (!texto) return null;
  return (
    <button type="button" className={`pir-ver${ver ? ' visible' : ''}`}
      onPointerDown={(e) => { e.preventDefault(); setVer(true); }} onPointerUp={() => setVer(false)} onPointerLeave={() => setVer(false)} onContextMenu={(e) => e.preventDefault()}>
      {ver ? <><small>{quien ? `Categoría de ${quien}` : 'Tu categoría'}</small><b>{texto}</b></> : <>👁️ Mantén pulsado para ver {quien ? `la categoría de ${quien}` : 'tu categoría'}</>}
    </button>
  );
}

function Piramide({ j, v, yo }) {
  const si = j.tablero.filter((t) => t.encaja); const no = j.tablero.filter((t) => !t.encaja);
  return (
    <div className={`pir-jugador${j.id === v.turno ? ' turno' : ''}${j.eliminado ? ' eliminado' : ''}`}>
      <div className="pir-cab">
        <b>{j.eliminado ? '☠️ ' : ''}{j.nombre}{yo ? ' (tú)' : ''}</b>
        <span>{j.puntos > 0 ? '+' : ''}{j.puntos} pts</span>
      </div>
      {j.eliminado && <p className="pir-regla">🔓 {j.categoria} <small>(la descubrió {nombreDe(v, j.eliminadoPor)})</small></p>}
      <div className="pir-columnas">
        <ul className="si">{si.map((t) => <li key={t.futbolista}>✅ {t.futbolista}</li>)}{!si.length && <li className="vacio">✅ …</li>}</ul>
        <ul className="no">{no.map((t) => <li key={t.futbolista}>❌ {t.futbolista}</li>)}{!no.length && <li className="vacio">❌ …</li>}</ul>
      </div>
      {j.descartes.length > 0 && !j.eliminado && <p className="pir-fallos">🚫 No es: {j.descartes.join(' · ')}</p>}
    </div>
  );
}

/** Elegir la categoría que crees que tiene un rival (buscador + lista por grupos). */
function ElegirCategoria({ rival, onElegir, onCancelar }) {
  const [busca, setBusca] = useState('');
  const [sel, setSel] = useState(null);
  const lista = useMemo(() => {
    const t = norm(busca).trim();
    return CATEGORIAS.filter((c) => !t || norm(c.texto).includes(t));
  }, [busca]);
  const grupos = Object.keys(GRUPOS).map((g) => [g, lista.filter((c) => c.grupo === g)]).filter(([, l]) => l.length);
  return (
    <div className="pzp-tarjeta pir-elegir">
      <p className="pzp-etiqueta">¿Cuál es la categoría de {rival.nombre}? (solo tienes un intento)</p>
      <input className="pir-input" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar categoría…" autoComplete="off" />
      <div className="pir-lista-cats">
        {grupos.map(([g, l]) => (
          <div key={g}>
            <p className="pir-grupo">{GRUPOS[g]}</p>
            {l.map((c) => {
              const descartada = rival.descartes.includes(c.texto);
              return <button key={c.id} type="button" disabled={descartada} className={sel === c.id ? 'sel' : ''} onClick={() => setSel(c.id)}>{c.texto}</button>;
            })}
          </div>
        ))}
        {!grupos.length && <p className="pzp-nota">Ninguna categoría coincide.</p>}
      </div>
      <div className="pzp-dos">
        <button type="button" className="pzp-boton secundario" onClick={onCancelar}>↩ Volver</button>
        <button type="button" className="pzp-boton" disabled={!sel} onClick={() => onElegir(sel)}>🎯 ¡Es esta!</button>
      </div>
    </div>
  );
}

function Adivinar({ v, enviar, actorId }) {
  const [rival, setRival] = useState(null);
  const actor = v.jugadores.find((j) => j.id === actorId);
  const rivales = v.jugadores.filter((j) => j.id !== actorId && !j.eliminado && !j.fuera);
  const r = v.jugadores.find((j) => j.id === rival);
  if (r) return <ElegirCategoria rival={r} onCancelar={() => setRival(null)} onElegir={(cat) => { enviar('adivinar', { objetivo: r.id, categoria: cat }); setRival(null); }} />;
  return (
    <div className="pzp-tarjeta pir-turno">
      <p className="pzp-etiqueta">{v.racha ? `🎯 ¡Acierto! ¿Intentas con otro rival?` : '1. ¿Quieres adivinar la categoría de un rival?'}</p>
      <p className="pzp-nota">Si aciertas, queda eliminado, sumas 2 y puedes seguir con otro. Si fallas, −1 y pasas a los futbolistas. Solo un intento por rival en toda la partida.</p>
      <div className="pir-objetivos">
        {rivales.map((j) => {
          const usado = actor.intentos[j.id];
          return <button key={j.id} type="button" disabled={Boolean(usado)} onClick={() => setRival(j.id)}>{j.nombre}{usado ? ' (ya lo intentaste)' : ''}</button>;
        })}
      </div>
      <button type="button" className="pzp-boton secundario" onClick={() => enviar('noAdivinar')}>{v.racha ? 'Plantarme y pasar a los futbolistas →' : 'No, pasar a los futbolistas →'}</button>
    </div>
  );
}

function Apuntar({ v, enviar, actorId }) {
  const pendientes = v.jugadores.filter((j) => j.id !== actorId && !j.eliminado && !j.fuera && !v.dichos.includes(j.id));
  const [por, setPor] = useState(pendientes[0]?.id ?? null);
  const [texto, setTexto] = useState('');
  const quien = pendientes.find((j) => j.id === por) || pendientes[0];
  const mandar = (encaja) => {
    if (!texto.trim() || !quien) return;
    enviar('apuntar', { por: quien.id, futbolista: texto.trim(), encaja });
    setTexto(''); setPor(null);
  };
  return (
    <div className="pzp-tarjeta pir-turno">
      <p className="pzp-etiqueta">2. Cada rival te dice un futbolista: apúntalo y di si encaja en tu categoría</p>
      <div className="pir-objetivos">
        {pendientes.map((j) => <button key={j.id} type="button" className={quien?.id === j.id ? 'sel' : ''} onClick={() => setPor(j.id)}>{j.nombre}</button>)}
      </div>
      {quien && (
        <>
          <input className="pir-input" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder={`¿Qué futbolista dice ${quien.nombre}?`} autoComplete="off" autoCorrect="off" spellCheck="false" />
          <div className="pzp-dos">
            <button type="button" className="pir-si" disabled={!texto.trim()} onClick={() => mandar(true)}>✅ Encaja</button>
            <button type="button" className="pir-no" disabled={!texto.trim()} onClick={() => mandar(false)}>❌ No encaja</button>
          </div>
        </>
      )}
      {v.dichos.length > 0 && <button type="button" className="pzp-enlace oscuro" onClick={() => enviar('deshacer')}>↩ Deshacer el último</button>}
    </div>
  );
}

function Ultimo({ v }) {
  const u = v.ultimo;
  if (!u) return null;
  if (u.tipo === 'adivina') {
    return <p className={`pir-ultimo ${u.acierta ? 'si' : 'no'}`}>{nombreDe(v, u.de)} dijo que {nombreDe(v, u.a)} tiene «{u.categoria}»: {u.acierta ? `¡ACIERTO! ${nombreDe(v, u.a)} queda eliminado (+2)` : 'falla (−1)'}</p>;
  }
  return <p className={`pir-ultimo ${u.encaja ? 'si' : 'no'}`}>{nombreDe(v, u.por)} dijo {u.futbolista}: {u.encaja ? '✅ encaja' : '❌ no encaja'} en la categoría de {nombreDe(v, u.de)}</p>;
}

function Partida({ v, enviar, onSalir, admin, local }) {
  if (v.fase === 'ver') {
    return (
      <>
        <Hero v={v} juego={JUEGO} onSalir={onSalir} chip="🔺 Categorías secretas" etiqueta="Memoriza tu categoría" titulo={v.yo ? 'Tu categoría secreta' : 'Repartiendo categorías…'} />
        {v.yo && (
          <div className="pzp-tarjeta pir-mia">
            <span>🤫</span>
            <h2>{v.yo.categoria}</h2>
            <p className="pzp-nota">Cuando te digan un futbolista, tú dirás si encaja o no. ¡Sé honrado! Podrás volver a consultarla cuando quieras.</p>
            {!v.yo.listo ? <button type="button" className="pzp-boton grande" onClick={() => enviar('visto')}><Icon name="check" size={20} /> Memorizada</button>
              : <p className="pzp-esperando">⏳ Esperando a los demás…</p>}
          </div>
        )}
        {admin && !local && <div className="pzp-barra estatica"><button type="button" className="pzp-enlace" onClick={() => enviar('forzar')}><Icon name="forward" size={15} /> Empezar sin esperar</button></div>}
      </>
    );
  }
  const turno = v.jugadores.find((j) => j.id === v.turno);
  const mio = local || v.yo?.id === v.turno;
  const meTocaDecir = !local && v.yo && v.yo.id !== v.turno && !v.yo.eliminado && v.paso === 'apuntar' && !v.dichos.includes(v.yo.id);
  return (
    <>
      <Hero v={v} juego={JUEGO} onSalir={onSalir} chip={`🔺 Vuelta ${v.ronda}/${v.rondas}`} turno={v.turno}
        etiqueta={mio && !local ? 'Te toca' : `Turno de ${turno?.nombre}`}
        titulo={v.paso === 'adivinar' ? '¿Adivinas una categoría?' : 'Futbolistas para la pirámide'}
        extra={(j) => (j.eliminado ? <small className="pir-extra">☠️</small> : null)} />
      {!local && <AvisoTurno clave={v.yo?.id === v.turno ? `${v.ronda}-${v.turno}` : null} emoji="🔺" texto="¡Te toca!" sub="¿Adivinas una categoría? Luego apunta los futbolistas que te digan." id={v.yo?.id} />}
      {local ? <VerCategoria texto={v.categoriaTurno} quien={turno?.nombre} /> : v.yo && (v.yo.eliminado ? <p className="pir-mia-mini">☠️ Estás eliminado. Tu categoría era: <b>{v.yo.categoria}</b></p> : <VerCategoria texto={v.yo.categoria} />)}
      <Ultimo v={v} />
      {mio && v.paso === 'adivinar' && <Adivinar key={`a-${v.turno}-${v.ronda}`} v={v} enviar={enviar} actorId={v.turno} />}
      {mio && v.paso === 'apuntar' && <Apuntar key={`p-${v.turno}-${v.ronda}-${v.dichos.length}`} v={v} enviar={enviar} actorId={v.turno} />}
      {!mio && (
        <p className={`pzp-esperando${meTocaDecir ? ' pir-tu-turno' : ''}`}>
          {v.paso === 'adivinar' ? `🤔 ${turno?.nombre} está decidiendo si adivina alguna categoría…`
            : meTocaDecir ? `🗣️ ¡Dile un futbolista a ${turno?.nombre}! (en voz alta: lo apunta él)` : `⏳ ${turno?.nombre} está apuntando futbolistas…`}
        </p>
      )}
      <div className="pir-tableros">
        {v.jugadores.filter((j) => !j.fuera).map((j) => <Piramide key={j.id} j={j} v={v} yo={!local && j.id === v.yo?.id} />)}
      </div>
      {admin && !local && <div className="pzp-barra estatica"><button type="button" className="pzp-enlace" onClick={() => enviar('forzar')}><Icon name="forward" size={15} /> Saltar el turno de {turno?.nombre}</button></div>}
    </>
  );
}

function Fin(props) {
  return (
    <PantallaFin {...props}>
      <div className="pzp-tarjeta">
        <p className="pzp-etiqueta">Las categorías secretas</p>
        <ul className="pir-final">{props.v.fin.tabla.filter((t) => !t.fuera).map((t) => <li key={t.id}><b>{t.nombre}</b><span>{t.categoria}</span><small>{t.eliminado ? '☠️ descubierta' : '🔒 nadie la descubrió'} · {t.aciertos >= 0 ? '+' : ''}{t.aciertos} adivinando · +{t.supervivencia} por aguantar</small></li>)}</ul>
      </div>
      {props.children}
    </PantallaFin>
  );
}

function Config({ config, onCambiar }) {
  return (
    <BloqueConfig titulo="Máximo de vueltas">
      <Pildoras opciones={E.OPCIONES_VUELTAS.map((n) => [n, `${n} vueltas`])} valor={config.vueltas} onCambiar={onCambiar && ((vueltas) => onCambiar({ vueltas }))} />
    </BloqueConfig>
  );
}

const JUEGO = {
  id: 'piramides',
  api: '/api/piramides',
  emoji: '🔺',
  config: { vueltas: 8 },
  Partida: (props) => <Partida {...props} admin={props.admin ?? props.sala?.esAdmin} />,
  Fin,
  Config,
  Local: (props) => <LocalPorTurnos {...props} E={E} />,
  textoPasar: () => 'Vas a ver tu categoría secreta. ¡Memorízala y que nadie mire!',
  textoEmpezar: '¡Repartir las categorías!',
  notaSala: '🔺 Cada uno ve su categoría en su móvil. Los futbolistas se dicen en voz alta: jugad juntos o en llamada.',
  ganador: (n) => `¡${n.join(' y ')} gana las Pirámides!`,
  detalleFin: (j) => `${j.aciertos >= 0 ? '+' : ''}${j.aciertos} adivinando · +${j.supervivencia} por aguantar`,
  reglas: [
    `Cada jugador recibe una categoría secreta sobre futbolistas (de un banco de ${CATEGORIAS.length}): «Ha ganado la Champions», «Es zurdo», «Ha jugado en el Madrid y en el Barça»… Puedes consultar la tuya cuando quieras.`,
    'En tu turno, primero decides si intentas adivinar la categoría de un rival. Solo tienes un intento por rival en toda la partida: si aciertas, queda eliminado, sumas 2 puntos y puedes seguir intentándolo con otro rival; si fallas, pierdes 1, todos verán que no es esa y pasas a los futbolistas.',
    'Después, cada rival te dice en voz alta un futbolista (actual o retirado). Tú lo apuntas y dices, honradamente, si encaja ✅ o no ❌ en tu categoría. Todo queda en tu pirámide, a la vista de todos.',
    'Cuando todos te han dicho su futbolista, pasa el turno.',
    'Al final, el último en pie suma 2 × el número de jugadores; el siguiente, uno menos; y así sucesivamente. Si se acaban las vueltas, los que siguen vivos comparten el primer puesto. ¡Gana quien más puntos tenga!'
  ]
};

export default function Piramides({ onExit }) {
  return <JuegoPulsador juego={JUEGO} onExit={onExit} />;
}
