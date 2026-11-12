// client/src/games/Fichajes/Fichajes.jsx
// «Fichaje exprés»: online (piezas de ../Pulsador) y en un dispositivo pasando el móvil.
import React, { useEffect, useRef, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import JuegoPulsador from '../Pulsador/JuegoPulsador.jsx';
import { Hero, Cuenta, useRestante, PantallaFin, ModalSalir, TurnoDe } from '../Pulsador/Vistas.jsx';
import { SelectorJugadores, SelectorRondas } from '../../components/MenuJuego.jsx';
import { FormTexto } from '../comun/Simultaneo.jsx';
import { limitesLocal } from '../limites.js';
import { rondasPorDefecto } from '../rondas.js';
import { errorNombres } from '../../lib/nombres.js';
import * as E from './engine.js';
import '../comun/Simultaneo.css';
import './Fichajes.css';

const LIM = limitesLocal('fichajes');
const nombreDe = (v, id) => v.jugadores.find((j) => j.id === id)?.nombre ?? '¿?';
const PAISES = { BEL: 'Bélgica', BRA: 'Brasil', ITA: 'Italia', GER: 'Alemania', SVN: 'Eslovenia', FRA: 'Francia', ESP: 'España', SUI: 'Suiza', POR: 'Portugal', CMR: 'Camerún', GEO: 'Georgia', MAR: 'Marruecos', UKR: 'Ucrania', NED: 'Países Bajos', CRO: 'Croacia', ECU: 'Ecuador', ENG: 'Inglaterra', URU: 'Uruguay', KOR: 'Corea del Sur', CAN: 'Canadá', SCO: 'Escocia', HUN: 'Hungría', SVK: 'Eslovaquia', ARG: 'Argentina', AUT: 'Austria', NOR: 'Noruega', TUR: 'Turquía', EGY: 'Egipto', POL: 'Polonia', SWE: 'Suecia', GHA: 'Ghana', JPN: 'Japón', COL: 'Colombia', USA: 'Estados Unidos', NGA: 'Nigeria', SRB: 'Serbia', DEN: 'Dinamarca', GUI: 'Guinea', CZE: 'Chequia', KOS: 'Kosovo', CIV: 'Costa de Marfil', BFA: 'Burkina Faso', UZB: 'Uzbekistán', ALG: 'Argelia', VEN: 'Venezuela', ARM: 'Armenia', SEN: 'Senegal', IRL: 'Irlanda', MEX: 'México', BIH: 'Bosnia', WAL: 'Gales', COD: 'R. D. del Congo', NZL: 'Nueva Zelanda', GAM: 'Gambia' };
const POS = { POR: 'Portero', DEF: 'Defensa', MED: 'Centrocampista', DEL: 'Delantero', LD: 'Lateral derecho', LI: 'Lateral izquierdo', DFC: 'Central', MC: 'Centrocampista', MCD: 'Mediocentro defensivo', MCO: 'Mediapunta', ED: 'Extremo derecho', EI: 'Extremo izquierdo', DC: 'Delantero centro' };

function Ultimo({ v }) {
  const u = v.ultimo;
  if (!u) return null;
  return (
    <div className={`fch-ultimo${u.racha ? ' bien' : ''}`}>
      <b>{nombreDe(v, u.id)}</b> aguanta <b>{u.racha}</b> {u.racha === 1 ? 'fichaje' : 'fichajes'} (+{u.racha}).
      <small>{u.nombre} juega en el <b>{u.club}</b>{u.respuesta ? ` (dijo «${u.respuesta}»)` : ' (se acabó el tiempo)'}.</small>
    </div>
  );
}

function Futbolista({ v, restante, puedo, enviar }) {
  const f = v.futbolista;
  return (
    <div className="pzp-tarjeta fch-carta">
      <Cuenta ms={restante} total={E.SEGUNDOS * 1000} />
      <div className="fch-racha">🔥 Racha de {nombreDe(v, v.turno)}: <b>{v.racha}</b></div>
      <p className="pzp-etiqueta centrada">¿En qué equipo juega?</p>
      <h2 className="fch-nombre">{f.nombre}</h2>
      <p className="fch-datos">{POS[f.pos] || f.pos} · {PAISES[f.pais] || f.pais}</p>
      {puedo
        ? <FormTexto key={f.nombre} placeholder="Su equipo actual…" boton="Fichado" lista={E.NOMBRES_CLUB} onEnviar={(valor) => enviar('responder', { valor })} />
        : <p className="pzp-esperando-txt">⏳ Responde {nombreDe(v, v.turno)}…</p>}
    </div>
  );
}

function Partida({ v, sala, enviar, offset, onSalir }) {
  const restante = useRestante(v.hasta, offset);
  const yo = v.yo?.id;
  const mio = v.turno === yo;
  return (
    <>
      <Hero v={v} juego={JUEGO} onSalir={onSalir} etiqueta={`Turno de ${nombreDe(v, v.turno)}`} titulo={v.fase === 'pregunta' ? (mio ? '¡Ficha rápido!' : `Juega ${nombreDe(v, v.turno)}`) : mio ? '¡Te toca!' : `Turno de ${nombreDe(v, v.turno)}`} turno={v.turno} />
      <Ultimo v={v} />
      {v.fase === 'preparado' && (
        <div className="pzp-tarjeta pzp-centro">
          <p className="pzp-texto">{mio ? `Cuando pulses, saldrá tu primer futbolista. Tienes ${E.SEGUNDOS} segundos para cada uno.` : `Esperando a que ${nombreDe(v, v.turno)} empiece…`}</p>
          {mio && <button type="button" className="pzp-boton grande" onClick={() => enviar('empezar')}><Icon name="play" size={20} /> ¡Empezar mi racha!</button>}
        </div>
      )}
      {v.fase === 'pregunta' && <Futbolista v={v} restante={restante} puedo={mio} enviar={enviar} />}
      {sala.esAdmin && <div className="pzp-barra estatica"><button type="button" className="pzp-enlace" onClick={() => enviar('terminar')}>Terminar la partida ya</button></div>}
    </>
  );
}

function Local({ juego, onVolver, onExit, onAbrirAyuda }) {
  const [paso, setPaso] = useState('config');
  const [nombres, setNombres] = useState(() => Array(LIM.min).fill(''));
  const [rondas, setRondas] = useState(rondasPorDefecto('fichajes'));
  const [error, setError] = useState('');
  const [modal, setModal] = useState(false);
  const pRef = useRef(null);
  const [, setVer] = useState(0);
  const refrescar = () => setVer((x) => x + 1);
  useEffect(() => {
    if (paso !== 'juego') return undefined;
    const t = setInterval(() => { if (pRef.current) { E.tick(pRef.current, Date.now()); refrescar(); } }, 200);
    return () => clearInterval(t);
  }, [paso]);

  const empezar = async () => {
    const e = errorNombres(nombres);
    if (e) return setError(e);
    try {
      const d = await (await fetch(`/api/fichajes/local?r=${rondas}`)).json();
      pRef.current = E.crearPartida(nombres.map((nombre, i) => ({ id: i + 1, nombre: nombre.trim() })), d.items, d.reglas, Date.now());
      setError(''); setPaso('juego');
    } catch { setError('No se ha podido preparar la partida.'); }
    return undefined;
  };

  if (paso === 'config') {
    return (
      <div className="pzp-contenedor fichajes">
        <SelectorJugadores onVolver={onVolver} onAyuda={onAbrirAyuda} min={LIM.min} max={LIM.max} numJugadores={nombres.length}
          onCambiarNum={(n) => setNombres((l) => (n > l.length ? [...l, ...Array(n - l.length).fill('')] : l.slice(0, n)))}
          nombres={nombres} onNombre={(i, valor) => setNombres((l) => l.map((x, k) => (k === i ? valor : x)))}
          onEmpezar={empezar} textoBoton="¡A fichar!" error={error}>
          <SelectorRondas juegoId="fichajes" valor={rondas} onCambiar={setRondas} numJugadores={nombres.length} />
        </SelectorJugadores>
      </div>
    );
  }
  const p = pRef.current;
  const v = E.vistaDe(p, -1);
  const salir = modal && <ModalSalir titulo="¿Salir de la partida?" texto="Se perderá la partida en curso y volverás a la portada." onSeguir={() => setModal(false)} onSalir={() => { setModal(false); onExit?.(); }} />;
  const envolver = (c) => <div className="pzp-contenedor fichajes qq-en-partida"><section className="game pzp-escena">{c}</section>{salir}</div>;
  if (p.fase === 'fin') {
    return envolver(
      <PantallaFin v={v} juego={juego} onSalir={() => setModal(true)}>
        <div className="pzp-barra estatica">
          <button type="button" className="pzp-boton grande" onClick={() => setPaso('config')}><Icon name="refresh" size={20} /> Nueva partida</button>
          <button type="button" className="pzp-boton secundario" onClick={() => onExit?.()}><Icon name="door" size={18} /> Salir a la portada</button>
        </div>
      </PantallaFin>
    );
  }
  const enviar = (tipo, d = {}) => {
    const r = tipo === 'empezar' ? E.empezar(p, v.turno, Date.now()) : E.responder(p, v.turno, d.valor, Date.now());
    refrescar();
    return Promise.resolve(r);
  };
  if (p.fase === 'preparado') {
    return envolver(
      <TurnoDe v={v} id={v.turno} puedo juego={JUEGO} onSalir={() => setModal(true)} onListo={() => enviar('empezar')} boton={`Soy ${nombreDe(v, v.turno)}, ¡empezar!`}
        texto={`Ronda ${v.ronda} de ${v.rondas}. ${E.SEGUNDOS} segundos por futbolista: aguanta todo lo que puedas.`}>
        <Ultimo v={v} />
      </TurnoDe>
    );
  }
  return envolver(
    <>
      <Hero v={v} juego={JUEGO} onSalir={() => setModal(true)} etiqueta={`Turno de ${nombreDe(v, v.turno)}`} titulo="¡Ficha rápido!" turno={v.turno} />
      <Futbolista v={v} restante={Math.max(0, p.hasta - Date.now())} puedo enviar={enviar} />
    </>
  );
}

const JUEGO = {
  id: 'fichajes',
  api: '/api/fichajes',
  emoji: '⚽',
  config: { rondas: rondasPorDefecto('fichajes') },
  Local,
  Partida,
  Config: ({ config, onCambiar, sala }) => <SelectorRondas juegoId="fichajes" valor={config.rondas} onCambiar={onCambiar && ((r) => onCambiar({ rondas: r }))} numJugadores={sala?.jugadores?.length || 1} />,
  Fin: ({ v, juego, onSalir, children }) => <PantallaFin v={v} juego={juego} onSalir={onSalir}>{children}</PantallaFin>,
  notaSala: '⚽ Por turnos: el que juega responde desde su móvil y los demás lo ven en directo.',
  detalleFin: (j) => `Mejor racha: ${j.mejor}`,
  ganador: (n) => (n.length > 1 ? `¡Empate entre ${n.join(' y ')}!` : `¡${n[0]} se sabe todas las plantillas!`),
  reglas: [
    'Sale un futbolista y tienes que decir en qué equipo juega ahora (temporada 2025/26). Tienes 15 segundos.',
    'Si aciertas, sale otro; si fallas o se acaba el tiempo, tu racha termina.',
    'Cuanto más aguantas, menos conocidos son los futbolistas.',
    'Al terminar tu turno sumas tantos puntos como futbolistas hayas acertado seguidos.',
    'Cada ronda juegan todos, uno detrás de otro. Se juegan 5, 7 o 10 rondas.',
    'Vale el nombre del club o cómo se le conoce (Atleti, Barça, City, Napoli…).'
  ]
};

export default function Fichajes({ onExit }) {
  return <JuegoPulsador juego={JUEGO} onExit={onExit} />;
}
