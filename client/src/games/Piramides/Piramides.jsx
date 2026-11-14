// client/src/games/Piramides/Piramides.jsx
// «Pirámides futbolísticas»: descubre la regla secreta de cada uno diciendo futbolistas. Online o en un móvil.
import React, { useEffect, useState } from 'react';
import JuegoPulsador from '../Pulsador/JuegoPulsador.jsx';
import LocalPorTurnos from '../comun/LocalPorTurnos.jsx';
import { Hero, Pildoras, AvisoTurno, PantallaFin } from '../Pulsador/Vistas.jsx';
import { BloqueConfig } from '../../components/MenuJuego.jsx';
import { Buscador } from '../Solo/comun.jsx';
import '../Solo/Solo.css';
import Icon from '../../components/Icon.jsx';
import * as E from './engine.js';
import './Piramides.css';

let NOMBRES = null;
const cargarFutbolistas = async () => {
  const r = await fetch('/api/piramides/local');
  if (!r.ok) throw new Error('No se pudieron cargar los futbolistas.');
  const d = await r.json();
  NOMBRES = d.futbolistas.map((f) => f.nombre).sort((a, b) => a.localeCompare(b, 'es'));
  return d.futbolistas;
};
function useNombres() {
  const [l, setL] = useState(NOMBRES || []);
  useEffect(() => { if (!NOMBRES) cargarFutbolistas().then(() => setL(NOMBRES)).catch(() => {}); }, []);
  return l;
}

function Piramide({ j, v, yo }) {
  const si = j.tablero.filter((t) => t.si); const no = j.tablero.filter((t) => !t.si);
  return (
    <div className={`pir-jugador${j.id === v.turno ? ' turno' : ''}${j.descubierta ? ' descubierta' : ''}`}>
      <div className="pir-cab">
        <b>{j.nombre}{yo ? ' (tú)' : ''}</b>
        <span>{j.puntos} pts</span>
      </div>
      {j.descubierta && <p className="pir-regla">🔓 {j.regla} <small>(la descubrió {v.jugadores.find((x) => x.id === j.descubiertaPor)?.nombre})</small></p>}
      <div className="pir-columnas">
        <ul className="si">{si.map((t) => <li key={t.nombre}>✅ {t.nombre}</li>)}{!si.length && <li className="vacio">✅ …</li>}</ul>
        <ul className="no">{no.map((t) => <li key={t.nombre}>❌ {t.nombre}</li>)}{!no.length && <li className="vacio">❌ …</li>}</ul>
      </div>
      {j.fallos.length > 0 && !j.descubierta && <p className="pir-fallos">No es: {j.fallos.join(' · ')}</p>}
    </div>
  );
}

function Turno({ v, enviar, actorId }) {
  const nombres = useNombres();
  const otros = v.jugadores.filter((j) => j.id !== actorId && !j.fuera && !j.descubierta);
  const [obj, setObj] = useState(otros[0]?.id ?? null);
  const [adivinando, setAdivinando] = useState(false);
  const o = v.jugadores.find((j) => j.id === obj);
  if (v.paso === 'preguntar' && !adivinando) {
    return (
      <div className="pzp-tarjeta pir-turno">
        <p className="pzp-etiqueta">1. ¿A quién le preguntas?</p>
        <div className="pir-objetivos">{otros.map((j) => <button key={j.id} type="button" className={obj === j.id ? 'sel' : ''} onClick={() => setObj(j.id)}>{j.nombre}</button>)}</div>
        <p className="pzp-etiqueta" style={{ marginTop: '0.7rem' }}>2. Di un futbolista (temporada 2025/26)</p>
        <Buscador lista={nombres} onElegir={(f) => obj && enviar('preguntar', { objetivo: obj, futbolista: f })} placeholder="Escribe un futbolista…" />
        <button type="button" className="pzp-enlace oscuro" onClick={() => setAdivinando(true)}>🎯 Ya lo sé: adivinar una regla</button>
      </div>
    );
  }
  if (!adivinando) {
    const u = v.ultimo;
    return (
      <div className="pzp-tarjeta pir-turno">
        {u?.tipo === 'pregunta' && <p className={`pir-respuesta ${u.si ? 'si' : 'no'}`}>{u.futbolista}: {u.si ? '✅ ¡encaja!' : '❌ no encaja'} en la regla de {v.jugadores.find((j) => j.id === u.a)?.nombre}</p>}
        <div className="pzp-dos">
          <button type="button" className="pzp-boton" onClick={() => setAdivinando(true)}>🎯 Adivinar una regla</button>
          <button type="button" className="pzp-boton secundario" onClick={() => enviar('pasar')}>Pasar turno</button>
        </div>
      </div>
    );
  }
  return (
    <div className="pzp-tarjeta pir-turno">
      <p className="pzp-etiqueta">¿De quién? (+3 si aciertas, −1 si fallas)</p>
      <div className="pir-objetivos">{otros.map((j) => <button key={j.id} type="button" className={obj === j.id ? 'sel' : ''} onClick={() => setObj(j.id)}>{j.nombre}</button>)}</div>
      {o && (
        <div className="pir-opciones">
          {o.opciones.map((r) => {
            const descartada = o.fallos.includes(r.texto);
            return <button key={r.id} type="button" disabled={descartada} onClick={() => { enviar('adivinar', { objetivo: o.id, regla: r.id }); setAdivinando(false); }}>{r.texto}</button>;
          })}
        </div>
      )}
      <button type="button" className="pzp-enlace oscuro" onClick={() => setAdivinando(false)}>↩ Volver</button>
    </div>
  );
}

function Partida({ v, enviar, onSalir, admin, local }) {
  if (v.fase === 'ver') {
    return (
      <>
        <Hero v={v} juego={JUEGO} onSalir={onSalir} chip="🔺 Reglas secretas" etiqueta="Memoriza tu regla" titulo={v.yo ? 'Tu regla secreta' : 'Repartiendo reglas…'} />
        {v.yo && (
          <div className="pzp-tarjeta pir-mia">
            <span>🤫</span>
            <h2>{v.yo.regla}</h2>
            <p className="pzp-nota">Cuando te pregunten por un futbolista, el juego responderá según esta regla. ¡Que no la descubran!</p>
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
  const u = v.ultimo;
  return (
    <>
      <Hero v={v} juego={JUEGO} onSalir={onSalir} chip={`🔺 Vuelta ${v.ronda}/${v.rondas}`} turno={v.turno}
        etiqueta={mio && !local ? 'Te toca' : `Turno de ${turno?.nombre}`} titulo={v.paso === 'preguntar' ? 'Pregunta por un futbolista' : '¿Adivinas una regla?'} />
      {!local && <AvisoTurno clave={v.yo?.id === v.turno ? `${v.ronda}-${v.turno}` : null} emoji="⚽" texto="¡Te toca!" sub="Pregunta por un futbolista." id={v.yo?.id} />}
      {v.yo && !local && <p className="pir-mia-mini">🤫 Tu regla: <b>{v.yo.regla}</b></p>}
      {u && <p className={`pir-ultimo ${u.tipo === 'adivina' ? (u.acierta ? 'si' : 'no') : u.si ? 'si' : 'no'}`}>
        {u.tipo === 'pregunta' ? `${v.jugadores.find((j) => j.id === u.de)?.nombre} preguntó a ${v.jugadores.find((j) => j.id === u.a)?.nombre} por ${u.futbolista}: ${u.si ? '✅ encaja' : '❌ no encaja'}`
          : `${v.jugadores.find((j) => j.id === u.de)?.nombre} dijo que la regla de ${v.jugadores.find((j) => j.id === u.a)?.nombre} es «${u.regla}»: ${u.acierta ? '¡ACIERTO! +3' : 'falla, −1'}`}
      </p>}
      {mio && <Turno key={`${v.turno}-${v.paso}-${v.ronda}`} v={v} enviar={enviar} actorId={v.turno} />}
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
        <p className="pzp-etiqueta">Las reglas secretas</p>
        <ul className="pir-final">{props.v.fin.tabla.map((t) => <li key={t.id}><b>{t.nombre}</b><span>{t.regla}</span><small>{t.descubierta ? '🔓 descubierta' : '🔒 nadie la descubrió (+2)'}</small></li>)}</ul>
      </div>
      {props.children}
    </PantallaFin>
  );
}

function Config({ config, onCambiar }) {
  return (
    <BloqueConfig titulo="Vueltas">
      <Pildoras opciones={E.OPCIONES_VUELTAS.map((n) => [n, `${n} vueltas`])} valor={config.vueltas} onCambiar={onCambiar && ((vueltas) => onCambiar({ vueltas }))} />
    </BloqueConfig>
  );
}

const JUEGO = {
  id: 'piramides',
  api: '/api/piramides',
  emoji: '🔺',
  config: { vueltas: 4 },
  cargarItems: cargarFutbolistas,
  Partida: (props) => <Partida {...props} admin={props.admin ?? props.sala?.esAdmin} />,
  Fin,
  Config,
  Local: (props) => <LocalPorTurnos {...props} E={E} />,
  textoPasar: () => 'Vas a ver tu regla secreta. ¡Memorízala y que nadie mire!',
  textoEmpezar: '¡Repartir las reglas!',
  notaSala: '🔺 Cada uno ve su regla secreta en su móvil. El juego responde por vosotros: no se puede mentir.',
  ganador: (n) => `¡${n.join(' y ')} lee mejor las reglas!`,
  detalleFin: (j) => (j.bonus ? `incluye +${j.bonus} por regla sin descubrir` : 'regla descubierta'),
  reglas: [
    'Cada jugador recibe una regla secreta sobre futbolistas: «juega en la Premier», «tiene 30 años o más», «su apellido empieza por vocal»…',
    'En tu turno eliges a otro jugador y dices un futbolista de la temporada 2025/26. Su regla responde (sin mentir) si encaja ✅ o no ❌, y queda apuntado en su pirámide a la vista de todos.',
    'Después puedes intentar adivinar la regla de alguien entre 6 opciones: si aciertas, +3 puntos y su regla queda descubierta; si fallas, −1. O puedes pasar.',
    'Al final, cada jugador cuya regla no haya descubierto nadie gana 2 puntos. ¡Gana quien más puntos tenga!'
  ]
};

export default function Piramides({ onExit }) {
  return <JuegoPulsador juego={JUEGO} onExit={onExit} />;
}
