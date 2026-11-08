// client/src/games/Segundero/Segundero.jsx
// El Segundero Interior — para el reloj en el tiempo exacto… sin verlo.
// El contador se oculta enseguida y en cada ronda hay distracciones nuevas.
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import {
  PortadaUnJugador, CabeceraPartida, FinUnJugador, AyudaUnJugador, ConfirmarSalida, useRecord
} from '../../components/UnJugador.jsx';
import './Segundero.css';

const ID = 'segundero';

// Cada ronda: cuánto se ve el contador y qué distracción hay
const RONDAS = [
  { visible: 2, distraccion: null, texto: 'Sin trucos: confía en tu reloj interno.' },
  { visible: 1.5, distraccion: null, texto: 'El contador desaparece antes.' },
  { visible: 1.5, distraccion: 'rapido', texto: 'Ojo: el pulso de fondo va más rápido que un segundo.' },
  { visible: 1, distraccion: 'lento', texto: 'Ahora el pulso de fondo va más lento.' },
  { visible: 1, distraccion: 'flash', texto: 'Habrá destellos para despistarte.' },
  { visible: 0.5, distraccion: 'falso', texto: 'Un contador falso aparecerá… y miente.' }
];

const puntosPorError = (error) => Math.max(0, Math.round(100 - Math.abs(error) * 120));

function veredicto(error) {
  const e = Math.abs(error);
  if (e <= 0.05) return '¡Perfecto! Eres un reloj suizo.';
  if (e <= 0.15) return '¡Casi exacto!';
  if (e <= 0.35) return 'Muy cerca.';
  if (e <= 0.7) return 'No está mal.';
  return error > 0 ? 'Te has pasado bastante.' : 'Te has quedado muy corto.';
}

export default function Segundero() {
  const navigate = useNavigate();
  const [fase, setFase] = useState('portada'); // portada | preparado | corriendo | resultado | fin
  const [ayuda, setAyuda] = useState(false);
  const [salir, setSalir] = useState(false);
  const [record, registrar] = useRecord(ID);
  const [ronda, setRonda] = useState(0);
  const [objetivo, setObjetivo] = useState(5);
  const [mostrado, setMostrado] = useState(0);
  const [visible, setVisible] = useState(true);
  const [falso, setFalso] = useState(null);
  const [destello, setDestello] = useState(0);
  const [medido, setMedido] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [nuevoRecord, setNuevoRecord] = useState(false);
  const inicioRef = useRef(0);

  const config = RONDAS[ronda];
  const total = historial.reduce((s, h) => s + h.puntos, 0);

  const preparar = (r) => {
    setRonda(r);
    setObjetivo(Math.round((3 + Math.random() * (5 + r * 1.2)) * 10) / 10);
    setMedido(null);
    setMostrado(0);
    setVisible(true);
    setFalso(null);
    setFase('preparado');
  };

  const empezar = () => {
    setHistorial([]);
    setNuevoRecord(false);
    preparar(0);
  };

  const arrancar = () => {
    inicioRef.current = performance.now();
    setFase('corriendo');
  };

  const parar = () => {
    if (fase !== 'corriendo') return;
    const t = (performance.now() - inicioRef.current) / 1000;
    const error = t - objetivo;
    setMedido(t);
    setHistorial((h) => [...h, { objetivo, medido: t, error, puntos: puntosPorError(error) }]);
    if (navigator.vibrate) navigator.vibrate(20);
    setFase('resultado');
  };

  // Contador visible al principio y distracciones
  useEffect(() => {
    if (fase !== 'corriendo') return undefined;
    let raf;
    const tick = () => {
      const t = (performance.now() - inicioRef.current) / 1000;
      if (t < config.visible) setMostrado(t);
      else setVisible(false);
      if (config.distraccion === 'falso' && t > 2) setFalso((t * 1.35).toFixed(1));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    let flashes;
    if (config.distraccion === 'flash') {
      flashes = setInterval(() => setDestello((d) => d + 1), 700 + Math.random() * 900);
    }
    return () => { cancelAnimationFrame(raf); clearInterval(flashes); };
  }, [fase, config]);

  // Espacio / Enter para empezar y parar
  useEffect(() => {
    const onKey = (e) => {
      if (e.code !== 'Space' && e.key !== 'Enter') return;
      e.preventDefault();
      if (fase === 'preparado') arrancar();
      else if (fase === 'corriendo') parar();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const siguiente = () => {
    if (ronda + 1 >= RONDAS.length) {
      setNuevoRecord(total > 0 && registrar(total));
      setFase('fin');
    } else preparar(ronda + 1);
  };

  const ayudaModal = ayuda && (
    <AyudaUnJugador titulo="¿Cómo se juega?" onCerrar={() => setAyuda(false)}>
      <p>Te diremos un tiempo, por ejemplo <strong>7,3 segundos</strong>. Pulsa para arrancar el reloj y vuelve a pulsar cuando creas que ha pasado justo ese tiempo.</p>
      <ul>
        <li>El contador <strong>se oculta</strong> al poco de empezar: tienes que sentir el tiempo.</li>
        <li>En cada ronda hay una distracción nueva: pulsos de fondo con otro ritmo, destellos, un contador mentiroso…</li>
        <li>Cuanto más cerca, más puntos (máximo 100 por ronda). Son {RONDAS.length} rondas.</li>
        <li>Con teclado puedes usar la barra espaciadora.</li>
      </ul>
    </AyudaUnJugador>
  );

  if (fase === 'portada') {
    return (
      <div className="sg-contenedor">
        <PortadaUnJugador juegoId={ID} onJugar={empezar} onAyuda={() => setAyuda(true)} record={record}
          textoRecord={(r) => `${r.valor} de ${RONDAS.length * 100} puntos`} />
        {ayudaModal}
      </div>
    );
  }

  if (fase === 'fin') {
    const media = historial.reduce((s, h) => s + Math.abs(h.error), 0) / historial.length;
    return (
      <div className="sg-contenedor">
        <FinUnJugador
          icono="stopwatch"
          etiqueta={`Error medio: ${media.toFixed(2)} s`}
          titulo={total >= 500 ? '¡Reloj atómico!' : total >= 380 ? '¡Gran sentido del tiempo!' : 'Fin de la partida'}
          puntos={total}
          unidad={`de ${RONDAS.length * 100} puntos`}
          nuevoRecord={nuevoRecord}
          record={record}
          textoRecord={(r) => `${r.valor} puntos`}
          onRepetir={empezar}
          onMenu={() => setFase('portada')}
        >
          <div className="sg-tabla">
            {historial.map((h, i) => (
              <div key={i}>
                <span>Ronda {i + 1}</span>
                <span>{h.objetivo.toFixed(1)} s → {h.medido.toFixed(2)} s</span>
                <strong>{h.puntos}</strong>
              </div>
            ))}
          </div>
        </FinUnJugador>
      </div>
    );
  }

  const ultimo = historial[historial.length - 1];
  const pulso = fase === 'corriendo' && (config.distraccion === 'rapido' || config.distraccion === 'lento') ? config.distraccion : '';

  return (
    <div className="sg-contenedor qq-en-partida">
      <section className="game uj-escena">
        <CabeceraPartida
          onSalir={() => setSalir(true)}
          chips={[<><Icon name="flag" size={14} /> Ronda {ronda + 1}/{RONDAS.length}</>, <><Icon name="star" size={14} /> {total}</>]}
        >
          <p className="sg-truco"><Icon name="bulb" size={15} /> {config.texto}</p>
        </CabeceraPartida>

        <button
          type="button"
          className={`sg-esfera ${fase}${pulso ? ` pulso-${pulso}` : ''}`}
          onClick={fase === 'preparado' ? arrancar : fase === 'corriendo' ? parar : undefined}
          disabled={fase === 'resultado'}
        >
          <span key={destello} className={`sg-destello${destello ? ' on' : ''}`} />
          <span className="sg-meta">Para en</span>
          <span className="sg-objetivo">{objetivo.toFixed(1).replace('.', ',')} s</span>
          <span className="sg-crono">
            {fase === 'preparado' && '0,00'}
            {fase === 'corriendo' && (visible ? mostrado.toFixed(2).replace('.', ',') : (falso ? falso.replace('.', ',') : '?,??'))}
            {fase === 'resultado' && medido.toFixed(2).replace('.', ',')}
          </span>
          <span className="sg-accion">
            {fase === 'preparado' && <><Icon name="play" size={20} /> Toca para empezar</>}
            {fase === 'corriendo' && <><Icon name="x" size={20} /> ¡Toca para parar!</>}
            {fase === 'resultado' && veredicto(ultimo.error)}
          </span>
        </button>

        {fase === 'resultado' && (
          <div className="uj-tarjeta sg-resultado">
            <div className="sg-regla">
              <span className="sg-marca objetivo" style={{ left: '50%' }} />
              <span className="sg-marca medido" style={{ left: `${50 + Math.max(-48, Math.min(48, ultimo.error * 40))}%` }} />
            </div>
            <p>
              {ultimo.error >= 0 ? 'Te has pasado' : 'Te has quedado corto'} <strong>{Math.abs(ultimo.error).toFixed(2).replace('.', ',')} s</strong>
            </p>
            <p className="sg-puntos">+{ultimo.puntos} puntos</p>
            <button type="button" className="uj-boton grande" onClick={siguiente}>
              {ronda + 1 >= RONDAS.length ? <><Icon name="flagFinish" size={20} /> Ver resultado</> : <><Icon name="forward" size={20} /> Siguiente ronda</>}
            </button>
          </div>
        )}
      </section>
      {salir && <ConfirmarSalida onSeguir={() => setSalir(false)} onSalir={() => navigate('/')} />}
    </div>
  );
}
