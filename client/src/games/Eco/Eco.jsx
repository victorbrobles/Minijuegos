// client/src/games/Eco/Eco.jsx
// «Eco Cromático» (1 jugador): memoria de secuencias que se complica. Cada ronda la secuencia crece un paso y hay que
// repetirla. Con el nivel aparecen más botones (4 → 6 → 9), sube la velocidad y llegan rondas especiales:
//   ↩️ AL REVÉS: repítela de atrás hacia delante.
//   ⛔ TRAMPA: los pasos que se iluminan en rojo NO se repiten.
//   🔀 BARAJADO: los colores cambian de sitio justo antes de que te toque (recuerda colores, no posiciones).
// Tres vidas: si fallas, se repite la ronda; sin vidas, se acaba. Puntos: rondas superadas.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import { PortadaUnJugador, CabeceraPartida, FinUnJugador, AyudaUnJugador, ConfirmarSalida, useRecord, Aviso, barajar } from '../../components/UnJugador.jsx';
import './Eco.css';

const ID = 'eco';
const VIDAS = 3;
const COLORES = [
  { c: '#ef4444', n: 'rojo', f: 262 }, { c: '#3b82f6', n: 'azul', f: 330 }, { c: '#22c55e', n: 'verde', f: 392 }, { c: '#eab308', n: 'amarillo', f: 440 },
  { c: '#a855f7', n: 'morado', f: 523 }, { c: '#f97316', n: 'naranja', f: 587 }, { c: '#ec4899', n: 'rosa', f: 659 }, { c: '#14b8a6', n: 'turquesa', f: 698 },
  { c: '#64748b', n: 'gris', f: 784 }
];
const botonesPara = (nivel) => (nivel >= 11 ? 9 : nivel >= 6 ? 6 : 4);
const msPaso = (nivel) => Math.max(260, 620 - nivel * 25);
const MODOS = {
  normal: { e: '🔁', t: 'Repite la secuencia' },
  reves: { e: '↩️', t: 'AL REVÉS: repítela de atrás hacia delante' },
  trampa: { e: '⛔', t: 'TRAMPA: no repitas los pasos rojos' },
  barajado: { e: '🔀', t: 'BARAJADO: los colores cambian de sitio' }
};
function modoPara(nivel) {
  if (nivel < 4) return 'normal';
  const r = Math.random();
  if (nivel >= 8 && r < 0.2) return 'barajado';
  if (r < 0.45) return 'normal';
  if (r < 0.72) return 'reves';
  return 'trampa';
}

let audio = null;
function sonar(f, ms = 220, tipo = 'sine') {
  try {
    audio ||= new (window.AudioContext || window.webkitAudioContext)();
    const o = audio.createOscillator(); const g = audio.createGain();
    o.type = tipo; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, audio.currentTime);
    g.gain.exponentialRampToValueAtTime(0.18, audio.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + ms / 1000);
    o.connect(g).connect(audio.destination); o.start(); o.stop(audio.currentTime + ms / 1000 + 0.05);
  } catch { /* sin audio */ }
}

export default function Eco() {
  const navigate = useNavigate();
  const [fase, setFase] = useState('portada'); // portada | mostrando | turno | fin
  const [ayuda, setAyuda] = useState(false);
  const [salir, setSalir] = useState(false);
  const [record, registrar] = useRecord(ID);
  const [nuevoRecord, setNuevoRecord] = useState(false);
  const [sonido, setSonido] = useState(true);
  const [nivel, setNivel] = useState(1);
  const [vidas, setVidas] = useState(VIDAS);
  const [secuencia, setSecuencia] = useState([]); // [{ b, trampa }]
  const [modo, setModo] = useState('normal');
  const [orden, setOrden] = useState([0, 1, 2, 3]); // posición → color
  const [luz, setLuz] = useState(null); // { b, trampa }
  const [hecho, setHecho] = useState(0);
  const [aviso, setAviso] = useState({ t: '', k: 0, tipo: 'info' });
  const timers = useRef([]);
  const limpiar = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  useEffect(() => limpiar, []);
  const despues = (ms, f) => { timers.current.push(setTimeout(f, ms)); };

  const objetivo = useCallback((sec, m) => {
    const validos = m === 'trampa' ? sec.filter((x) => !x.trampa) : sec;
    const l = validos.map((x) => x.b);
    return m === 'reves' ? l.reverse() : l;
  }, []);

  const mostrar = useCallback((sec, niv, m) => {
    limpiar();
    setFase('mostrando'); setHecho(0); setLuz(null);
    const nb = botonesPara(niv);
    setOrden((o) => (o.length === nb ? o : Array.from({ length: nb }, (_, i) => i)));
    const paso = msPaso(niv);
    let t = 900;
    sec.forEach((x) => {
      despues(t, () => { setLuz(x); if (sonido) sonar(x.trampa ? 140 : COLORES[x.b].f, paso * 0.8, x.trampa ? 'sawtooth' : 'sine'); });
      despues(t + paso * 0.75, () => setLuz(null));
      t += paso;
    });
    despues(t + 150, () => {
      if (m === 'barajado') setOrden((o) => { let n; do { n = barajar(o); } while (n.every((x, i) => x === o[i])); return n; });
      setFase('turno');
    });
  }, [sonido]);

  const nuevaRonda = useCallback((sec, niv) => {
    const m = modoPara(niv);
    const nb = botonesPara(niv);
    let s = sec.map((x) => ({ b: x.b, trampa: false }));
    s.push({ b: Math.floor(Math.random() * nb), trampa: false });
    if (m === 'trampa') {
      const n = Math.max(1, Math.min(3, Math.floor(s.length / 3)));
      const idx = barajar(s.map((_, i) => i)).slice(0, n);
      // Los pasos trampa se insertan como pasos extra (la secuencia «buena» no cambia)
      const extra = idx.map(() => ({ b: Math.floor(Math.random() * nb), trampa: true }));
      const conTrampas = [...s];
      idx.sort((a, b) => b - a).forEach((i, k) => conTrampas.splice(i, 0, extra[k]));
      s = conTrampas;
    }
    setSecuencia(s); setModo(m);
    if (m !== 'normal') setAviso({ t: `${MODOS[m].e} ${MODOS[m].t}`, k: Math.random(), tipo: 'info' });
    mostrar(s, niv, m);
  }, [mostrar]);

  const empezar = () => {
    setNivel(1); setVidas(VIDAS); setNuevoRecord(false); setOrden([0, 1, 2, 3]);
    nuevaRonda([], 1);
  };

  const terminar = (niv) => {
    limpiar();
    const puntos = niv - 1;
    setNuevoRecord(puntos > 0 && registrar(puntos));
    setFase('fin');
  };

  const pulsar = (pos) => {
    if (fase !== 'turno') return;
    const b = orden[pos];
    const esperado = objetivo(secuencia, modo);
    setLuz({ b }); despues(180, () => setLuz(null));
    if (b === esperado[hecho]) {
      if (sonido) sonar(COLORES[b].f, 180);
      if (hecho + 1 === esperado.length) {
        setFase('mostrando');
        setAviso({ t: '✓ ¡Bien!', k: Math.random(), tipo: 'exito' });
        const sig = nivel + 1;
        despues(700, () => {
          setNivel(sig);
          // Al barajar, el orden vuelve a ser el normal para mostrar la siguiente
          setOrden(Array.from({ length: botonesPara(sig) }, (_, i) => i));
          nuevaRonda(secuencia.filter((x) => !x.trampa), sig);
        });
      } else setHecho(hecho + 1);
    } else {
      if (sonido) sonar(110, 400, 'square');
      const v = vidas - 1;
      setVidas(v);
      setFase('mostrando');
      if (v <= 0) { despues(700, () => terminar(nivel)); return; }
      setAviso({ t: '✗ Fallo: se repite la ronda', k: Math.random(), tipo: 'error' });
      despues(900, () => {
        setOrden(Array.from({ length: botonesPara(nivel) }, (_, i) => i));
        mostrar(secuencia, nivel, modo);
      });
    }
  };

  const ayudaModal = ayuda && (
    <AyudaUnJugador titulo="¿Cómo se juega?" onCerrar={() => setAyuda(false)}>
      <p>Mira la secuencia de luces y repítela tocando los botones en el mismo orden. Cada ronda tiene un paso más.</p>
      <ul>
        <li>Empiezas con 4 botones; desde la ronda 6 hay 6 y desde la 11, 9. Además, cada vez va más rápido.</li>
        <li><strong>↩️ Al revés:</strong> repite la secuencia de atrás hacia delante.</li>
        <li><strong>⛔ Trampa:</strong> algunos pasos se iluminan en rojo con un pitido grave: esos no se repiten.</li>
        <li><strong>🔀 Barajado:</strong> justo antes de tu turno los botones cambian de sitio. Recuerda los colores, no las posiciones.</li>
        <li>Tienes {VIDAS} vidas: si fallas, se repite la ronda. Tu puntuación son las rondas superadas.</li>
      </ul>
    </AyudaUnJugador>
  );

  if (fase === 'portada') {
    return (
      <div className="eco-contenedor">
        <PortadaUnJugador juegoId={ID} onJugar={empezar} onAyuda={() => setAyuda(true)} record={record} textoRecord={(r) => `${r.valor} rondas`}>
          <button type="button" className={`qq-chip${sonido ? ' activo' : ''}`} onClick={() => setSonido((s) => !s)}>{sonido ? '🔊 Con sonido' : '🔇 Sin sonido'}</button>
        </PortadaUnJugador>
        {ayudaModal}
      </div>
    );
  }
  if (fase === 'fin') {
    const puntos = nivel - 1;
    return (
      <div className="eco-contenedor">
        <FinUnJugador icono="orb" etiqueta="Te has quedado sin vidas" titulo={puntos >= 15 ? '¡Memoria de elefante!' : puntos >= 8 ? '¡Muy bien!' : 'Fin de la partida'}
          puntos={puntos} unidad={puntos === 1 ? 'ronda superada' : 'rondas superadas'} nuevoRecord={nuevoRecord} record={record}
          textoRecord={(r) => `${r.valor} rondas`} exito={puntos > 0} onRepetir={empezar} onMenu={() => setFase('portada')} />
      </div>
    );
  }

  const nb = orden.length;
  const esperado = objetivo(secuencia, modo);
  return (
    <div className="eco-contenedor qq-en-partida">
      <section className="game uj-escena">
        <CabeceraPartida onSalir={() => setSalir(true)} chips={[
          <><Icon name="star" size={14} /> Ronda {nivel}</>,
          <>{Array.from({ length: VIDAS }, (_, i) => (i < vidas ? '❤️' : '🖤')).join('')}</>
        ]}>
          <div className={`eco-estado ${modo}`}>
            <span>{MODOS[modo].e}</span>
            <b>{fase === 'mostrando' ? 'Mira con atención…' : MODOS[modo].t}</b>
            {fase === 'turno' && <small>{hecho}/{esperado.length}</small>}
          </div>
        </CabeceraPartida>
        <div className={`eco-tablero b${nb}${fase === 'turno' ? ' activo' : ''}`}>
          {orden.map((b, pos) => (
            <button key={pos} type="button" aria-label={COLORES[b].n}
              className={`eco-boton${luz && luz.b === b ? (luz.trampa ? ' trampa' : ' luz') : ''}`}
              style={{ '--c': COLORES[b].c }} disabled={fase !== 'turno'} onPointerDown={(e) => { e.preventDefault(); pulsar(pos); }} />
          ))}
        </div>
      </section>
      <Aviso texto={aviso.t} clave={aviso.k} tipo={aviso.tipo} />
      {salir && <ConfirmarSalida onSeguir={() => setSalir(false)} onSalir={() => navigate('/')} />}
    </div>
  );
}
