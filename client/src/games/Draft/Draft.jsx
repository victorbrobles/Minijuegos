// client/src/games/Draft/Draft.jsx
// «El Draft de Estrellas»: ficha famosos por turnos sin saber cuál de los tres criterios contará. Online o en un móvil.
import React from 'react';
import JuegoPulsador from '../Pulsador/JuegoPulsador.jsx';
import LocalPorTurnos from '../comun/LocalPorTurnos.jsx';
import { useReloj } from '../comun/Lienzo2D.jsx';
import { Hero, Pildoras, AvisoTurno, useLatido, colorDe } from '../Pulsador/Vistas.jsx';
import { BloqueConfig } from '../../components/MenuJuego.jsx';
import * as E from './engine.js';
import { CATEGORIAS } from './famosos.js';
import './Draft.css';

function Restante({ v }) {
  useLatido(500);
  const ahora = useReloj(v);
  return <>{Math.max(0, Math.ceil((v.limite - ahora()) / 1000))}s</>;
}

function Criterios({ v }) {
  return (
    <div className="dr-criterios">
      <p className="pzp-etiqueta">{v.criterio ? 'Ha salido…' : 'Contará UNO de estos (al final se sabrá cuál):'}</p>
      <div>
        {v.candidatos.map((c) => (
          <span key={c} className={`dr-criterio${v.criterio === c ? ' sale' : ''}${v.criterio && v.criterio !== c ? ' no' : ''}`}>{E.CRITERIOS[c].emoji} {E.CRITERIOS[c].nombre}</span>
        ))}
      </div>
    </div>
  );
}

function Partida({ v, enviar, onSalir, local }) {
  const cat = CATEGORIAS[v.categoria];
  const turno = v.jugadores.find((j) => j.id === v.turno);
  const mio = v.fase === 'draft' && (local || v.turno === v.yo?.id);
  const extra = (j) => <small className="dr-mini">{j.equipo.map((i) => v.pool[i]?.n.split(' ').slice(-1)[0]).join(' · ') || '—'}</small>;

  if (v.fase === 'revelar' && v.resultado) {
    const cr = E.CRITERIOS[v.criterio];
    const sumas = Object.fromEntries(v.resultado.sumas.map((s) => [s.id, s.suma]));
    const orden = [...v.jugadores].filter((j) => !j.fuera).sort((a, b) => (sumas[b.id] - sumas[a.id]) * cr.mejor);
    return (
      <>
        <Hero v={v} juego={JUEGO} onSalir={onSalir} chip={`${cat.emoji} Ronda ${v.ronda}/${v.rondas}`} etiqueta="¡Se desvela el criterio!" titulo={`${cr.emoji} ${cr.nombre}`} clase="fin" />
        <Criterios v={v} />
        <div className="dr-equipos">
          {orden.map((j, n) => (
            <div key={j.id} className={`pzp-tarjeta dr-equipo${n === 0 ? ' gana' : ''}`} style={{ '--c': colorDe(j.id) }}>
              <p className="dr-equipo-nombre">{['🥇', '🥈', '🥉'][n] || `${n + 1}.º`} {j.nombre} <em>+{v.resultado.puntos[j.id] ?? 0}</em></p>
              <ul>{j.equipo.map((i) => { const f = v.pool[i]; return <li key={i}>{f.n}<b>{cr.dato(f)}</b></li>; })}</ul>
              <p className="dr-suma">{sumas[j.id]} {cr.unidad}</p>
            </div>
          ))}
        </div>
        <p className="pzp-esperando">Siguiente ronda en <Restante v={v} /></p>
      </>
    );
  }

  return (
    <>
      <Hero v={v} juego={JUEGO} onSalir={onSalir} chip={`${cat.emoji} Ronda ${v.ronda}/${v.rondas} · fichaje ${v.pick + 1}/${v.totalPicks}`} turno={v.turno} extra={extra}
        etiqueta={mio ? (local ? `Ficha ${turno?.nombre}` : '¡Te toca fichar!') : `Ficha ${turno?.nombre}`} titulo={`${cat.emoji} ${cat.nombre}`} />
      {!local && <AvisoTurno clave={v.turno === v.yo?.id ? `p${v.ronda}-${v.pick}` : null} emoji="🌟" texto="¡Te toca fichar!" id={v.yo?.id} />}
      <Criterios v={v} />
      <p className="pzp-nota dr-reloj">⏱️ <Restante v={v} /> para fichar · si se acaba, ficha al azar</p>
      <div className="dr-pool">
        {v.pool.map((f, i) => {
          const dueño = v.jugadores.find((j) => j.id === f.de);
          return (
            <button key={f.n} type="button" className={`dr-famoso${dueño ? ' cogido' : ''}`} style={dueño ? { '--c': colorDe(dueño.id) } : undefined}
              disabled={!mio || Boolean(dueño)} onClick={() => enviar('fichar', { idx: i })}>
              <b>{f.n}</b>{dueño && <small>{dueño.nombre}</small>}
            </button>
          );
        })}
      </div>
    </>
  );
}

function Config({ config, onCambiar }) {
  return (
    <BloqueConfig titulo="Rondas">
      <Pildoras opciones={E.OPCIONES_RONDAS.map((n) => [n, `${n} rondas`])} valor={config.rondas} onCambiar={onCambiar && ((rondas) => onCambiar({ rondas }))} />
    </BloqueConfig>
  );
}

const JUEGO = {
  id: 'draft',
  api: '/api/draft',
  emoji: '🌟',
  config: { rondas: 5 },
  tiempoReal: true,
  Partida: (props) => <Partida {...props} />,
  Config,
  Local: (props) => <LocalPorTurnos {...props} E={E} />,
  textoEmpezar: '¡Empieza el draft!',
  notaSala: '🌟 Por turnos, cada uno ficha 3 famosos. Al final se desvela qué criterio puntúa.',
  ganador: (n) => `¡${n.join(' y ')} ${n.length > 1 ? 'tienen' : 'tiene'} el mejor ojo para las estrellas!`,
  detalleFin: (j) => `${j.puntos} ${j.puntos === 1 ? 'punto' : 'puntos'}`
};

export default function Draft({ onExit }) {
  return <JuegoPulsador juego={JUEGO} onExit={onExit} />;
}
