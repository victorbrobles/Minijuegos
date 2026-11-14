// client/src/games/Transmision/Transmision.jsx
// «Última Transmisión»: cooperativo en tiempo real, solo online (cada uno ve cosas distintas en su móvil).
import React from 'react';
import JuegoPulsador from '../Pulsador/JuegoPulsador.jsx';
import { Hero, Pildoras, useRestante, AvisoTurno } from '../Pulsador/Vistas.jsx';
import { BloqueConfig } from '../../components/MenuJuego.jsx';
import { useRegistrarPartida } from '../../lib/registros.js';
import Icon from '../../components/Icon.jsx';
import * as E from './engine.js';
import './Transmision.css';

const HEX = { rojo: '#ef4444', azul: '#3b82f6', verde: '#22c55e', amarillo: '#eab308' };
const mmss = (ms) => { const s = Math.ceil(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };

function Alarma({ a, v, offset }) {
  const quedan = useRestante(v.ahora + a.quedan, offset);
  const s = v.secciones.find((x) => x.id === a.seccion);
  const pct = Math.max(0, Math.min(100, (quedan / a.total) * 100));
  return (
    <li className={`tr-alarma${a.mia ? ' mia' : ''}${quedan < 10000 ? ' urgente' : ''}`}>
      <div className="tr-alarma-cab"><span>{s.e}</span><b>{a.nombre}</b><small>{s.nombre}{a.mia ? ' · ¡ES TUYA!' : ''}</small><em>{Math.ceil(quedan / 1000)} s</em></div>
      <i className="tr-alarma-barra"><span style={{ width: `${pct}%` }} /></i>
      {a.manual && <p className="tr-manual">📖 <b>Tienes el manual:</b> {a.manual}</p>}
    </li>
  );
}

function Panel({ s, enviar }) {
  const p = s.panel;
  return (
    <div className="tr-panel">
      <p className="tr-panel-titulo">{s.e} {s.nombre}</p>
      <div className="tr-palancas">
        {E.PALANCAS.map((c) => (
          <button key={c} type="button" className={`tr-palanca${p.palancas[c] ? ' arriba' : ''}`} onClick={() => enviar('palanca', { seccion: s.id, cual: c })}>
            <span className="tr-palanca-mango" /><b>{c}</b><small>{p.palancas[c] ? 'ARRIBA' : 'ABAJO'}</small>
          </button>
        ))}
      </div>
      <div className="tr-dial">
        <span>Dial</span>
        <div>{Array.from({ length: 10 }, (_, d) => <button key={d} type="button" className={p.dial === d ? 'sel' : ''} onClick={() => enviar('dial', { seccion: s.id, valor: d })}>{d}</button>)}</div>
      </div>
      <div className="tr-colores">
        {E.COLORES.map((c) => <button key={c} type="button" className={p.color === c ? 'sel' : ''} style={{ '--c': HEX[c] }} onClick={() => enviar('color', { seccion: s.id, color: c })}>{c}</button>)}
      </div>
    </div>
  );
}

function Partida({ v, enviar, onSalir, offset = 0 }) {
  const quedan = useRestante(v.ahora + v.quedan, offset);
  const mias = v.secciones.filter((s) => s.panel);
  const otras = v.secciones.filter((s) => !s.panel);
  const nombre = (id) => v.jugadores.find((j) => j.id === id)?.nombre;
  const manuales = v.averias.filter((a) => a.manual).length;
  return (
    <>
      <Hero v={v} juego={JUEGO} onSalir={onSalir} chip={`📡 ${mmss(quedan)}`}
        etiqueta={`Casco ${'🟩'.repeat(Math.max(0, v.casco))}${'⬛'.repeat(Math.max(0, v.cascoMax - v.casco))}`} titulo={v.averias.length ? `${v.averias.length} ${v.averias.length === 1 ? 'avería' : 'averías'} activas` : 'Todo en orden… por ahora'}
        clase={v.casco <= 2 ? 'fallo' : ''} />
      <AvisoTurno clave="inicio" emoji="🛰️" texto="¡Averías en la nave!" sub="Habla con tu tripulación: tú tienes manuales de secciones ajenas." />
      <div className="pzp-tarjeta">
        <p className="pzp-etiqueta">🚨 Alarmas {manuales > 0 && <b className="tr-tienes">· tienes {manuales} {manuales === 1 ? 'manual' : 'manuales'}: ¡léelos en voz alta!</b>}</p>
        {v.averias.length ? <ul className="tr-alarmas">{v.averias.map((a) => <Alarma key={a.id} a={a} v={v} offset={offset} />)}</ul> : <p className="pzp-nota">Sin averías. Respirad.</p>}
      </div>
      <div className="pzp-tarjeta">
        <p className="pzp-etiqueta">🎛️ Tus secciones</p>
        <div className="tr-paneles">{mias.map((s) => <Panel key={s.id} s={s} enviar={enviar} />)}</div>
        <p className="pzp-nota">Otras secciones: {otras.map((s) => `${s.e} ${s.nombre} (${nombre(s.dueno)})`).join(' · ')}</p>
      </div>
      {v.log.length > 0 && <div className="pzp-tarjeta tr-log">{v.log.map((l) => <p key={l.t + l.texto} className={l.ok ? 'bien' : 'mal'}>{l.texto}</p>)}</div>}
    </>
  );
}

function Fin({ v, onSalir, children }) {
  const f = v.fin;
  useRegistrarPartida('transmision', f.tabla.filter((t) => !t.fuera).map((t) => ({ nombre: t.nombre, puntos: f.reparadas, gana: f.exito })));
  return (
    <>
      <Hero v={v} juego={JUEGO} onSalir={onSalir} chip="📡 Fin de la misión" etiqueta={f.exito ? 'Transmisión enviada' : 'Señal perdida'}
        titulo={f.exito ? '¡La nave aguanta! Misión cumplida' : '💥 La nave se ha perdido en el espacio'} clase={f.exito ? 'fin' : 'fallo'} />
      <div className="pzp-tarjeta tr-resumen">
        <span>{f.exito ? '🛰️' : '☄️'}</span>
        <p><b>{f.reparadas}</b> averías reparadas · <b>{f.perdidas}</b> fallidas · casco {f.casco}/{v.cascoMax}</p>
        <ol className="pzp-ranking">{f.tabla.map((t) => <li key={t.id}><span className="pzp-pos">{t.puesto}</span><span className="pzp-ranking-nombre">{t.nombre}<small>reparaciones en las que ha participado</small></span><strong>{t.arregladas}</strong></li>)}</ol>
      </div>
      {children}
    </>
  );
}

function Config({ config, onCambiar }) {
  return (
    <BloqueConfig titulo="Duración de la misión">
      <Pildoras opciones={E.OPCIONES_DURACION.map((n) => [n, `${n / 60} min`])} valor={config.duracion} onCambiar={onCambiar && ((duracion) => onCambiar({ duracion }))} />
    </BloqueConfig>
  );
}

const JUEGO = {
  id: 'transmision',
  api: '/api/transmision',
  emoji: '🛰️',
  config: { duracion: 180 },
  sinLocal: true,
  Partida: (props) => <Partida {...props} admin={props.admin ?? props.sala?.esAdmin} />,
  Fin,
  Config,
  notaSala: '🛰️ Cooperativo: cada uno ve cosas distintas en su móvil. ¡Jugad en la misma habitación (o en llamada) y hablad mucho!',
  ganador: () => '¡Misión cumplida!',
  reglas: [
    'Estáis en una nave que se cae a pedazos. Cada jugador controla una o dos secciones (motores, oxígeno, navegación…). Cada sección tiene tres palancas, un dial del 0 al 9 y un botón de color.',
    'Van saltando averías. Todos veis qué falla y dónde, pero el MANUAL con la solución («dial al 7, palanca B arriba…») lo tiene otro jugador, y nadie sabe quién.',
    'Hablad: quien tiene el manual lo lee en voz alta y el dueño de la sección lo ejecuta en su panel. En cuanto el panel cumple el manual, la avería queda reparada.',
    'Cada avería tiene su cuenta atrás. Si se acaba, el casco pierde un punto. Con el casco a cero, la nave se pierde.',
    'Si aguantáis hasta que acabe el tiempo, la transmisión llega a la Tierra y ganáis todos.'
  ]
};

export default function Transmision({ onExit }) {
  return <JuegoPulsador juego={JUEGO} onExit={onExit} />;
}
