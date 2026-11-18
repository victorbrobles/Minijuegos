// client/src/games/Canicas/Canicas.jsx
// «Carrera de Canicas»: online (elegir canica → carrera → podio, varias carreras) o práctica contra bots.
import React, { useMemo, useRef, useState } from 'react';
import JuegoPulsador from '../Pulsador/JuegoPulsador.jsx';
import { claveSesion } from '../Pulsador/PulsadorOnline.jsx';
import { Hero, Pildoras, PantallaFin, useLatido, colorDe } from '../Pulsador/Vistas.jsx';
import { BloqueConfig, PanelMenu, Cabecera } from '../../components/MenuJuego.jsx';
import Icon from '../../components/Icon.jsx';
import { nombreIdentidad } from '../../lib/identidad.js';
import * as E from './engine.js';
import { CANICAS, IDS_CANICAS } from './canicas.js';
import { CIRCUITOS, IDS_CIRCUITOS } from './circuitos.js';
import Carrera3D from './Carrera3D.jsx';
import './Canicas.css';

const API = '/api/canicas';
const hex = (n) => `#${n.toString(16).padStart(6, '0')}`;
const fmt = (ms) => (ms == null ? '—' : `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')}.${Math.floor((ms % 1000) / 100)}`);

function Restante({ v }) {
  useLatido(250);
  const base = useRef({ ahora: v.ahora, local: Date.now() });
  if (base.current.ahora !== v.ahora) base.current = { ahora: v.ahora, local: Date.now() };
  if (!v.limite) return null;
  return <>{Math.max(0, Math.ceil((v.limite - (v.ahora + Date.now() - base.current.local)) / 1000))}s</>;
}

export function ElegirCanica({ valor, onElegir, ocupadas = {} }) {
  return (
    <div className="cn-elegir">
      {IDS_CANICAS.map((id) => {
        const k = CANICAS[id];
        return (
          <button key={id} type="button" className={valor === id ? 'sel' : ''} onClick={() => onElegir(id)}>
            <span className="cn-bola" style={{ background: `radial-gradient(circle at 35% 30%, #ffffff 0%, ${hex(k.color)} 45%, #0f172a 130%)` }}>{k.emoji}</span>
            <b>{k.nombre}</b><small>{k.habilidad}</small>
            {ocupadas[id] && <em>{ocupadas[id].join(', ')}</em>}
          </button>
        );
      })}
    </div>
  );
}

function Partida({ v, enviar, onSalir, admin, sala }) {
  const yo = v.jugadores.find((j) => j.id === v.yo?.id);
  if (v.fase === 'elegir') {
    const ocupadas = {};
    v.jugadores.forEach((j) => { if (j.canica) (ocupadas[j.canica] ||= []).push(j.nombre); });
    return (
      <>
        <Hero v={v} juego={JUEGO} onSalir={onSalir} chip={`🔮 Carrera ${v.ronda}/${v.rondas}`} etiqueta={`${CIRCUITOS[v.circuito].emoji} ${CIRCUITOS[v.circuito].nombre}`} titulo="Elige tu canica" />
        <div className="pzp-tarjeta">
          <p className="pzp-etiqueta">Cada canica tiene una habilidad · empieza en <Restante v={v} /></p>
          <ElegirCanica valor={yo?.canica} onElegir={(canica) => enviar('canica', { canica })} ocupadas={ocupadas} />
        </div>
        {admin && <div className="pzp-barra estatica"><button type="button" className="pzp-enlace" onClick={() => enviar('forzar')}><Icon name="forward" size={15} /> Empezar ya</button></div>}
      </>
    );
  }
  if (v.fase === 'cuenta' || v.fase === 'carrera') return <CarreraOnline v={v} enviar={enviar} onSalir={onSalir} admin={admin} sala={sala} />;
  // Podio de la carrera
  return (
    <>
      <Hero v={v} juego={JUEGO} onSalir={onSalir} chip={`🔮 Carrera ${v.ronda}/${v.rondas}`} etiqueta={CIRCUITOS[v.circuito].nombre} titulo="🏁 Resultados de la carrera" clase="fin" />
      <div className="pzp-tarjeta">
        <ol className="cn-resultados">
          {(v.resultados || []).map((r) => (
            <li key={r.id} className={r.puesto === 1 ? 'primero' : ''}><span>{['🥇', '🥈', '🥉'][r.puesto - 1] || `${r.puesto}.º`}</span><b>{CANICAS[r.canica]?.emoji} {r.nombre}</b><small>{r.tiempo ? fmt(r.tiempo) : `no llegó (${Math.round(r.prog * 100)}%)`}</small><em>+{r.pts}</em></li>
          ))}
        </ol>
        {admin ? <button type="button" className="pzp-boton grande" onClick={() => enviar('siguiente')}>{v.ronda >= v.rondas ? '🏆 Clasificación final' : '🔮 Siguiente carrera'}</button>
          : <p className="pzp-esperando">Siguiente en <Restante v={v} /></p>}
      </div>
    </>
  );
}

function CarreraOnline({ v, enviar, onSalir, admin, sala }) {
  const yo = v.jugadores.find((j) => j.id === v.yo?.id);
  // El inicio en el reloj de este móvil (se fija una vez por carrera)
  const inicioLocal = useMemo(() => Date.now() + ((v.inicio || v.ahora) - v.ahora), [v.carrera, v.inicio]); // eslint-disable-line react-hooks/exhaustive-deps
  const rivales = useMemo(() => v.jugadores.filter((j) => j.id !== v.yo?.id && !j.fuera).map((j) => ({ id: j.id, nombre: j.nombre, canica: j.canica || 'cometa', orden: j.orden })), [v.carrera]); // eslint-disable-line react-hooks/exhaustive-deps
  const token = useMemo(() => { try { return JSON.parse(sessionStorage.getItem(claveSesion('canicas')))?.token; } catch { return null; } }, []);
  const sync = async (cuerpo) => {
    const r = await fetch(`${API}/online/sala/${sala?.code}/sync`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, ...cuerpo }) });
    return r.ok ? r.json() : null;
  };
  return (
    <div className="cn-pantalla">
      <button type="button" className="cn-salir" onClick={onSalir}><Icon name="door" size={14} /> Salir</button>
      <Carrera3D key={`c${v.carrera}`} circuitoId={v.circuito} canica={yo?.canica || 'cometa'} orden={yo?.orden ?? 0} rivales={rivales} inicio={inicioLocal}
        sync={sync} colorDe={colorDe}
        onObjeto={(tipo, datos) => enviar('objeto', { objeto: tipo, ...datos })}
        onLlegada={() => enviar('llegada')} />
      <div className="cn-pie">
        {v.jugadores.filter((j) => !j.fuera).map((j) => <span key={j.id} style={{ '--c': colorDe(j.id) }}>{CANICAS[j.canica]?.emoji} {j.nombre}{j.llegada ? ` 🏁 ${fmt(j.llegada)}` : ''}</span>)}
      </div>
      {admin && <div className="pzp-barra estatica"><button type="button" className="pzp-enlace" onClick={() => enviar('forzar')}><Icon name="forward" size={15} /> Terminar la carrera</button></div>}
    </div>
  );
}

/* ───────── Práctica contra bots ───────── */
const NOMBRES_BOTS = ['Bolita', 'Rayo', 'Chispa', 'Pirata', 'Trueno', 'Galleta', 'Cohete'];
function Practica({ onVolver, onExit, onAbrirAyuda }) {
  const [paso, setPaso] = useState('config');
  const [circuito, setCircuito] = useState('valle');
  const [canica, setCanica] = useState('cometa');
  const [bots, setBots] = useState(3);
  const [carrera, setCarrera] = useState(0);
  const [resultado, setResultado] = useState(null);
  const rivales = useMemo(() => Array.from({ length: bots }, (_, i) => ({ id: `bot${i}`, nombre: NOMBRES_BOTS[i], canica: IDS_CANICAS[(i * 3 + 1) % IDS_CANICAS.length], orden: i + 1, bot: true })), [bots, carrera]); // eslint-disable-line react-hooks/exhaustive-deps
  const inicio = useMemo(() => Date.now() + 4000, [carrera]); // eslint-disable-line react-hooks/exhaustive-deps
  if (paso === 'config') {
    return (
      <section className="game qq-pantalla">
        <PanelMenu onVolver={onVolver} onAyuda={onAbrirAyuda}>
          <Cabecera icono="car" titulo="Práctica contra bots" descripcion="Elige circuito, canica y rivales. Aprende las curvas, los derrapes y qué caminos te convienen." />
          <p className="pzp-etiqueta">Circuito</p>
          <div className="cn-circuitos">
            {IDS_CIRCUITOS.map((id) => <button key={id} type="button" className={circuito === id ? 'sel' : ''} onClick={() => setCircuito(id)}><span>{CIRCUITOS[id].emoji}</span>{CIRCUITOS[id].nombre}<small>{CIRCUITOS[id].vueltas} vueltas · {CIRCUITOS[id].ramas.length} caminos</small></button>)}
          </div>
          <p className="pzp-etiqueta">Tu canica</p>
          <ElegirCanica valor={canica} onElegir={setCanica} />
          <p className="pzp-etiqueta">Rivales</p>
          <div className="cn-circuitos">{[3, 5, 7].map((n) => <button key={n} type="button" className={bots === n ? 'sel' : ''} onClick={() => setBots(n)}><span>🤖</span>{n} bots</button>)}</div>
          <button type="button" className="big full qq-btn-principal" style={{ marginTop: '1rem' }} onClick={() => { setResultado(null); setCarrera((n) => n + 1); setPaso('carrera'); }}><Icon name="play" size={20} /> ¡A correr!</button>
        </PanelMenu>
      </section>
    );
  }
  return (
    <div className="cn-pantalla">
      <button type="button" className="cn-salir" onClick={() => setPaso('config')}><Icon name="arrowLeft" size={14} /> Menú</button>
      <Carrera3D key={carrera} circuitoId={circuito} canica={canica} orden={0} rivales={rivales} inicio={inicio}
        colorDe={(id) => ['#ef4444', '#3b82f6', '#22c55e', '#a855f7', '#f97316', '#06b6d4', '#ec4899'][Number(String(id).replace('bot', '')) % 7]}
        onLlegada={(ms, puesto) => setTimeout(() => setResultado({ ms, puesto }), 1200)} />
      {resultado && (
        <div className="pzp-tarjeta cn-final">
          <p className="cn-final-puesto">{['🥇', '🥈', '🥉'][resultado.puesto - 1] || '🏁'} {resultado.puesto}.º de {bots + 1}</p>
          <p className="pzp-nota">Tiempo: <b>{fmt(resultado.ms)}</b> en {CIRCUITOS[circuito].nombre}</p>
          <div className="pzp-dos">
            <button type="button" className="pzp-boton" onClick={() => { setResultado(null); setCarrera((n) => n + 1); }}>🔁 Repetir</button>
            <button type="button" className="pzp-boton secundario" onClick={() => setPaso('config')}>⚙️ Cambiar</button>
          </div>
          <button type="button" className="pzp-enlace oscuro" onClick={() => onExit?.()}>Salir a la portada</button>
        </div>
      )}
    </div>
  );
}

function Config({ config, onCambiar }) {
  return (
    <BloqueConfig titulo="Carreras">
      <Pildoras opciones={E.OPCIONES_CARRERAS.map((n) => [n, n === 1 ? '1 carrera' : `${n} carreras (un circuito cada una)`])} valor={config.carreras} onCambiar={onCambiar && ((carreras) => onCambiar({ carreras }))} />
    </BloqueConfig>
  );
}

const JUEGO = {
  id: 'canicas',
  api: API,
  emoji: '🔮',
  config: { carreras: 3 },
  Partida: (props) => <Partida {...props} admin={props.admin ?? props.sala?.esAdmin} />,
  Config,
  Local: (props) => <Practica {...props} />,
  menuLocal: { icono: 'car', titulo: 'Práctica contra bots', texto: 'Tú solo contra canicas de la máquina' },
  textoEmpezar: '¡A la parrilla!',
  notaSala: '🔮 Cada uno corre en su móvil: 3 vueltas, joystick para girar, derrape para los miniturbos y objetos para remontar.',
  ganador: (n) => (n.length > 1 ? `¡${n.join(' y ')} empatan en lo más alto!` : `¡${n[0]} es la canica más rápida!`),
  detalleFin: (j) => `${j.victorias} ${j.victorias === 1 ? 'victoria' : 'victorias'}`,
};

export default function Canicas({ onExit }) {
  return <JuegoPulsador juego={JUEGO} onExit={onExit} />;
}
