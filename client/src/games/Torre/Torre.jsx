// client/src/games/Torre/Torre.jsx
// «Torre Inestable»: construid una torre en 3D pieza a pieza; quien la derribe pierde la ronda.
import React, { useEffect, useRef, useState } from 'react';
import JuegoPulsador from '../Pulsador/JuegoPulsador.jsx';
import LocalPorTurnos from '../comun/LocalPorTurnos.jsx';
import { Hero, Pildoras, AvisoTurno, PantallaFin, useLatido } from '../Pulsador/Vistas.jsx';
import { BloqueConfig } from '../../components/MenuJuego.jsx';
import Icon from '../../components/Icon.jsx';
import * as CANNON from 'cannon-es';
import * as E from './engine.js';
import { PIEZAS } from './piezas.js';
import Escena from './Escena.jsx';
import './Torre.css';

E.usarFisica(CANNON);
const nombreDe = (v, id) => v.jugadores.find((j) => j.id === id)?.nombre ?? '¿?';
const POS_INICIAL = { x: 0, z: 0, rotY: 0, tumbar: false };

function Reloj({ v }) {
  useLatido(250);
  const base = useRef({ ahora: v.ahora, local: Date.now() });
  if (base.current.ahora !== v.ahora) base.current = { ahora: v.ahora, local: Date.now() };
  if (!v.limite) return null;
  const resto = Math.max(0, v.limite - (v.ahora + Date.now() - base.current.local));
  return <div className={`tor-reloj${resto < 10000 ? ' urgente' : ''}`}><i style={{ width: `${(resto / (E.SEG_TURNO * 1000)) * 100}%` }} /><span>{Math.ceil(resto / 1000)}s</span></div>;
}

/** Mando para mover la pieza: se arrastra el dedo por el recuadro (relativo a hacia dónde mira la cámara). */
function Mando({ colocar, setColocar, azimutRef, onSoltar, deshabilitado }) {
  const arrastre = useRef(null);
  const mover = (dx, dy) => {
    const a = azimutRef.current || 0;
    // Derecha de la pantalla y «hacia el fondo» según el ángulo de la cámara
    const rx = Math.cos(a); const rz = -Math.sin(a); const fx = -Math.sin(a); const fz = -Math.cos(a);
    setColocar((c) => ({ ...c, x: Math.max(-2.6, Math.min(2.6, c.x + (dx * rx - dy * fx) * 0.012)), z: Math.max(-2.6, Math.min(2.6, c.z + (dx * rz - dy * fz) * 0.012)) }));
  };
  useEffect(() => {
    const tecla = (e) => {
      const m = { ArrowLeft: [-12, 0], ArrowRight: [12, 0], ArrowUp: [0, -12], ArrowDown: [0, 12] }[e.key];
      if (m) { e.preventDefault(); mover(...m); }
      if (e.key === 'q') setColocar((c) => ({ ...c, rotY: (c.rotY + 345) % 360 }));
      if (e.key === 'e') setColocar((c) => ({ ...c, rotY: (c.rotY + 15) % 360 }));
      if (e.key === ' ' && !deshabilitado) { e.preventDefault(); onSoltar(); }
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  });
  return (
    <div className="tor-mando">
      <div className="tor-pad" onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); arrastre.current = [e.clientX, e.clientY]; }}
        onPointerMove={(e) => { if (!arrastre.current) return; const [x0, y0] = arrastre.current; mover(e.clientX - x0, e.clientY - y0); arrastre.current = [e.clientX, e.clientY]; }}
        onPointerUp={() => { arrastre.current = null; }} onPointerCancel={() => { arrastre.current = null; }}>
        <span>✥</span><small>Arrastra para mover</small>
      </div>
      <div className="tor-botones">
        <div className="tor-fila">
          <button type="button" onClick={() => setColocar((c) => ({ ...c, rotY: (c.rotY + 345) % 360 }))} aria-label="Girar a la izquierda">⟲</button>
          <button type="button" onClick={() => setColocar((c) => ({ ...c, rotY: (c.rotY + 15) % 360 }))} aria-label="Girar a la derecha">⟳</button>
          <button type="button" className={colocar.tumbar ? 'sel' : ''} onClick={() => setColocar((c) => ({ ...c, tumbar: !c.tumbar }))}>🔄 Tumbar</button>
        </div>
        <div className="tor-fila">
          <button type="button" onClick={() => setColocar((c) => ({ ...c, x: 0, z: 0 }))}>🎯 Centrar</button>
          <span className="tor-giro">{colocar.rotY}°</span>
        </div>
        <button type="button" className="pzp-boton grande tor-soltar" disabled={deshabilitado} onClick={onSoltar}>⬇️ ¡Soltar!</button>
      </div>
    </div>
  );
}

function Partida({ v, enviar, onSalir, admin, local }) {
  const turno = v.jugadores.find((j) => j.id === v.turno);
  const mio = v.fase === 'turno' && (local || v.yo?.id === v.turno);
  const [colocar, setColocar] = useState(POS_INICIAL);
  const [animando, setAnimando] = useState(false);
  const azimutRef = useRef(0);
  const enviado = useRef(null);
  // Pieza nueva → vuelve al centro
  useEffect(() => { setColocar(POS_INICIAL); }, [v.ultima?.n, v.ronda]);
  const soltar = () => {
    if (enviado.current === v.ultima?.n) return;
    enviado.current = v.ultima?.n ?? 0;
    enviar('soltar', colocar);
  };
  const derribo = v.fase === 'derribo' && !animando;
  const pieza = v.proxima && PIEZAS[v.proxima.tipo];
  const titulo = derribo ? `💥 ¡${nombreDe(v, v.perdedor)} ha derribado la torre!` : mio && !local ? '¡Te toca colocar!' : `Turno de ${turno?.nombre ?? '…'}`;
  return (
    <>
      <Hero v={v} juego={JUEGO} onSalir={onSalir} chip={`🏗️ Ronda ${v.ronda}/${v.rondas}`} turno={v.turno} etiqueta={`Altura ${String(v.altura).replace('.', ',')} · ${v.colocadas} piezas`} titulo={titulo} clase={derribo ? 'fin' : ''} />
      {!local && <AvisoTurno clave={mio ? `t${v.ultima?.n ?? 0}-${v.ronda}` : null} emoji="🏗️" texto="¡Te toca!" sub="Mueve tu pieza, gírala y suéltala con cuidado." id={v.yo?.id} />}
      <div className="tor-escena-caja">
        <Escena v={v} colocar={mio && !animando ? colocar : null} onAnimando={setAnimando} azimutRef={azimutRef} />
        {pieza && v.fase === 'turno' && <p className="tor-pieza">{mio && !local ? 'Tu pieza' : `Pieza de ${turno?.nombre}`}: <b>{pieza.nombre}</b> · {Math.round(v.proxima.escala * 100)}%</p>}
        <p className="tor-ayuda">Arrastra la escena para girar la cámara</p>
      </div>
      {v.fase === 'turno' && <Reloj v={v} />}
      {mio && <Mando colocar={colocar} setColocar={setColocar} azimutRef={azimutRef} onSoltar={soltar} deshabilitado={animando} />}
      {!mio && v.fase === 'turno' && <p className="pzp-esperando">⏳ {turno?.nombre} está colocando su pieza…</p>}
      {derribo && (
        <div className="pzp-tarjeta tor-derribo">
          <span>💥</span>
          <p><b>{nombreDe(v, v.perdedor)}</b> pierde la ronda. Los demás suman 1 punto.</p>
          {(local || admin) ? <button type="button" className="pzp-boton grande" onClick={() => enviar('seguir')}>{v.ronda >= v.rondas ? '🏆 Ver resultados' : '🏗️ Siguiente ronda'}</button>
            : <p className="pzp-esperando">Esperando al anfitrión…</p>}
        </div>
      )}
      {admin && !local && v.fase === 'turno' && !mio && <div className="pzp-barra estatica"><button type="button" className="pzp-enlace" onClick={() => enviar('forzar')}><Icon name="forward" size={15} /> Soltar la pieza de {turno?.nombre} en el centro</button></div>}
    </>
  );
}

function Fin(props) {
  return (
    <PantallaFin {...props}>
      {props.v.fin?.mejorAltura > 0 && <div className="pzp-tarjeta"><p className="pzp-etiqueta centrada">🏗️ Torre más alta de la partida: {String(Math.round(props.v.fin.mejorAltura * 10) / 10).replace('.', ',')} unidades</p></div>}
      {props.children}
    </PantallaFin>
  );
}

function Config({ config, onCambiar }) {
  return (
    <BloqueConfig titulo="Rondas">
      <Pildoras opciones={E.OPCIONES_RONDAS.map((n) => [n, `${n} ${n === 1 ? 'ronda' : 'rondas'}`])} valor={config.rondas} onCambiar={onCambiar && ((rondas) => onCambiar({ rondas }))} />
    </BloqueConfig>
  );
}

const JUEGO = {
  id: 'torre',
  api: '/api/torre',
  emoji: '🏗️',
  config: { rondas: 3 },
  Partida: (props) => <Partida {...props} admin={props.admin ?? props.sala?.esAdmin} />,
  Fin,
  Config,
  Local: (props) => <LocalPorTurnos {...props} E={E} />,
  textoEmpezar: '¡A construir!',
  notaSala: '🏗️ Cada uno coloca su pieza desde su móvil, por turnos. ¡Pulso firme!',
  ganador: (n) => (n.length > 1 ? `¡${n.join(' y ')} empatan con pulso de cirujano!` : `¡${n[0]} tiene el pulso más firme!`),
  detalleFin: (j) => `${j.derribos} ${j.derribos === 1 ? 'derribo' : 'derribos'} · ${j.colocadas} piezas`,
};

export default function Torre({ onExit }) {
  return <JuegoPulsador juego={JUEGO} onExit={onExit} />;
}
