// client/src/games/Semaforo/Semaforo.jsx
// Semáforo Invertido — aparecen palabras de colores pintadas en otro color. La regla cambia
// cada pocos segundos: toca solo cuando se cumpla. Tocar cuando no toca o dejar pasar uno bueno resta vida.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import {
  PortadaUnJugador, CabeceraPartida, FinUnJugador, AyudaUnJugador, ConfirmarSalida, useRecord
} from '../../components/UnJugador.jsx';
import './Semaforo.css';

const ID = 'semaforo';
const VIDAS = 3;
const SEGUNDOS_REGLA = 10;
const COLORES = [
  { id: 'rojo', palabra: 'ROJO', hex: '#ef4444' },
  { id: 'verde', palabra: 'VERDE', hex: '#22c55e' },
  { id: 'azul', palabra: 'AZUL', hex: '#3b82f6' },
  { id: 'amarillo', palabra: 'AMARILLO', hex: '#eab308' }
];
const azar = (l) => l[Math.floor(Math.random() * l.length)];

function nuevaRegla(anterior) {
  const tipos = ['color', 'palabra', 'coinciden', 'distintos', 'noColor'];
  let tipo;
  do { tipo = azar(tipos); } while (anterior && tipo === anterior.tipo && Math.random() < 0.7);
  const c = azar(COLORES);
  const textos = {
    color: <>Toca si el <u>COLOR</u> es <b style={{ color: c.hex }}>{c.palabra.toLowerCase()}</b></>,
    palabra: <>Toca si la <u>PALABRA</u> dice <b>{c.palabra}</b></>,
    coinciden: <>Toca si palabra y color <u>COINCIDEN</u></>,
    distintos: <>Toca si palabra y color <u>NO coinciden</u></>,
    noColor: <>Toca si el color <u>NO</u> es <b style={{ color: c.hex }}>{c.palabra.toLowerCase()}</b></>
  };
  return { tipo, color: c.id, texto: textos[tipo], id: Math.random() };
}

const cumple = (regla, est) => {
  switch (regla.tipo) {
    case 'color': return est.color === regla.color;
    case 'palabra': return est.palabra === regla.color;
    case 'coinciden': return est.color === est.palabra;
    case 'distintos': return est.color !== est.palabra;
    case 'noColor': return est.color !== regla.color;
    default: return false;
  }
};

/** Estímulo: ~45 % de las veces cumple la regla para que haya ritmo */
function nuevoEstimulo(regla) {
  for (let k = 0; k < 30; k++) {
    const est = { palabra: azar(COLORES).id, color: azar(COLORES).id, id: Math.random() };
    if (Math.random() < 0.3) est.color = est.palabra;
    const quiero = Math.random() < 0.45;
    if (cumple(regla, est) === quiero) return est;
  }
  return { palabra: azar(COLORES).id, color: azar(COLORES).id, id: Math.random() };
}

export default function Semaforo() {
  const navigate = useNavigate();
  const [fase, setFase] = useState('portada'); // portada | cuenta | juego | fin
  const [ayuda, setAyuda] = useState(false);
  const [salir, setSalir] = useState(false);
  const [record, registrar] = useRecord(ID);
  const [regla, setRegla] = useState(null);
  const [estimulo, setEstimulo] = useState(null);
  const [vidas, setVidas] = useState(VIDAS);
  const [puntos, setPuntos] = useState(0);
  const [racha, setRacha] = useState(0);
  const [feedback, setFeedback] = useState(null); // { tipo, id }
  const [cuenta, setCuenta] = useState(3);
  const [restanteRegla, setRestanteRegla] = useState(SEGUNDOS_REGLA);
  const [nuevoRecord, setNuevoRecord] = useState(false);
  const s = useRef({});

  // Estado mutable para los temporizadores
  Object.assign(s.current, { regla, estimulo, vidas, puntos, racha, fase });

  const duracionEstimulo = () => Math.max(0.65, 1.5 - s.current.puntos * 0.012);

  const terminar = useCallback(() => {
    setFase('fin');
    setNuevoRecord(s.current.puntos > 0 && registrar(s.current.puntos));
  }, [registrar]);

  const fallo = useCallback((tipo) => {
    setFeedback({ tipo, id: Math.random() });
    setRacha(0);
    if (navigator.vibrate) navigator.vibrate([30, 40, 30]);
    setVidas((v) => {
      if (v - 1 <= 0) setTimeout(terminar, 400);
      return v - 1;
    });
  }, [terminar]);

  const empezar = () => {
    setVidas(VIDAS);
    setPuntos(0);
    setRacha(0);
    setNuevoRecord(false);
    setFeedback(null);
    const r = nuevaRegla();
    setRegla(r);
    setEstimulo(null);
    setCuenta(3);
    setFase('cuenta');
  };

  // Cuenta atrás leyendo la primera regla
  useEffect(() => {
    if (fase !== 'cuenta') return undefined;
    if (cuenta === 0) {
      s.current.reglaHasta = Date.now() + SEGUNDOS_REGLA * 1000;
      setFase('juego');
      return undefined;
    }
    const id = setTimeout(() => setCuenta((c) => c - 1), 800);
    return () => clearTimeout(id);
  }, [fase, cuenta]);

  // Bucle de estímulos
  useEffect(() => {
    if (fase !== 'juego') return undefined;
    let timer;
    const siguienteEstimulo = () => {
      const st = s.current;
      if (st.fase !== 'juego') return;
      // ¿Se dejó pasar uno que había que tocar?
      if (st.estimulo && !st.estimulo.tocado && cumple(st.regla, st.estimulo)) fallo('perdido');
      // ¿Toca cambiar de regla?
      if (Date.now() >= st.reglaHasta) {
        const r = nuevaRegla(st.regla);
        setRegla(r);
        s.current.regla = r;
        s.current.reglaHasta = Date.now() + SEGUNDOS_REGLA * 1000;
        setEstimulo(null);
        s.current.estimulo = null;
        timer = setTimeout(siguienteEstimulo, 1300); // pausa para leer la nueva regla
        return;
      }
      const e = nuevoEstimulo(s.current.regla);
      setEstimulo(e);
      s.current.estimulo = e;
      timer = setTimeout(siguienteEstimulo, duracionEstimulo() * 1000);
    };
    timer = setTimeout(siguienteEstimulo, 400);
    const reloj = setInterval(() => setRestanteRegla(Math.max(0, (s.current.reglaHasta - Date.now()) / 1000)), 100);
    return () => { clearTimeout(timer); clearInterval(reloj); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fase]);

  const tocar = useCallback(() => {
    const st = s.current;
    if (st.fase !== 'juego' || !st.estimulo || st.estimulo.tocado) return;
    st.estimulo.tocado = true;
    setEstimulo({ ...st.estimulo });
    if (cumple(st.regla, st.estimulo)) {
      setPuntos((p) => p + 1 + Math.floor(st.racha / 5));
      setRacha((r) => r + 1);
      setFeedback({ tipo: 'bien', id: Math.random() });
      if (navigator.vibrate) navigator.vibrate(10);
    } else {
      fallo('mal');
    }
  }, [fallo]);

  useEffect(() => {
    if (fase !== 'juego') return undefined;
    const onKey = (e) => { if (e.code === 'Space') { e.preventDefault(); tocar(); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [fase, tocar]);

  const ayudaModal = ayuda && (
    <AyudaUnJugador titulo="¿Cómo se juega?" onCerrar={() => setAyuda(false)}>
      <p>Irán apareciendo palabras de colores… pintadas de otro color. Por ejemplo, <b style={{ color: '#ef4444' }}>VERDE</b>.</p>
      <ul>
        <li>Arriba tienes la <strong>regla</strong>: «toca si el COLOR es rojo», «toca si la PALABRA dice AZUL», «toca si NO coinciden»…</li>
        <li>Toca la pantalla solo cuando se cumpla. Si no se cumple, no hagas nada.</li>
        <li>La regla <strong>cambia cada {SEGUNDOS_REGLA} segundos</strong>. ¡Léela bien!</li>
        <li>Tocar cuando no toca o dejar escapar uno bueno cuesta una vida. Tienes 3. Cada vez va más rápido.</li>
        <li>Con teclado: barra espaciadora.</li>
      </ul>
    </AyudaUnJugador>
  );

  if (fase === 'portada') {
    return (
      <div className="sm-contenedor">
        <PortadaUnJugador juegoId={ID} onJugar={empezar} onAyuda={() => setAyuda(true)} record={record} textoRecord={(r) => `${r.valor} puntos`} />
        {ayudaModal}
      </div>
    );
  }

  if (fase === 'fin') {
    return (
      <div className="sm-contenedor">
        <FinUnJugador
          icono="zap"
          etiqueta="Te has quedado sin vidas"
          titulo={puntos >= 60 ? '¡Cerebro a prueba de trampas!' : puntos >= 30 ? '¡Muy rápido!' : 'Fin de la partida'}
          puntos={puntos}
          unidad="puntos"
          nuevoRecord={nuevoRecord}
          record={record}
          textoRecord={(r) => `${r.valor} puntos`}
          exito={puntos > 0}
          onRepetir={empezar}
          onMenu={() => setFase('portada')}
        />
      </div>
    );
  }

  const est = estimulo;
  const colorEst = est && COLORES.find((c) => c.id === est.color);
  const palabraEst = est && COLORES.find((c) => c.id === est.palabra);

  return (
    <div className="sm-contenedor qq-en-partida">
      <section className="game uj-escena">
        <CabeceraPartida
          onSalir={() => setSalir(true)}
          chips={[
            <><Icon name="star" size={14} /> {puntos}</>,
            racha >= 5 ? <>🔥 x{1 + Math.floor(racha / 5)}</> : null,
            <>{Array.from({ length: VIDAS }, (_, i) => (i < vidas ? '❤️' : '🖤')).join('')}</>
          ]}
        >
          <div key={regla.id} className="sm-regla">
            <span className="sm-regla-texto">{regla.texto}</span>
            {fase === 'juego' && <span className="sm-regla-reloj" style={{ width: `${(restanteRegla / SEGUNDOS_REGLA) * 100}%` }} />}
          </div>
        </CabeceraPartida>

        <button
          type="button"
          className={`sm-zona${feedback ? ` ${feedback.tipo}` : ''}`}
          key={feedback?.id}
          onPointerDown={(e) => { e.preventDefault(); tocar(); }}
        >
          {fase === 'cuenta' ? (
            <span className="sm-cuenta" key={cuenta}>{cuenta || '¡Ya!'}</span>
          ) : est ? (
            <span key={est.id} className={`sm-palabra${est.tocado ? ' tocada' : ''}`} style={{ color: colorEst.hex }}>{palabraEst.palabra}</span>
          ) : (
            <span className="sm-nueva">🚦 ¡Nueva regla!</span>
          )}
          <span className="sm-pista">Toca aquí</span>
        </button>
      </section>
      {salir && <ConfirmarSalida onSeguir={() => setSalir(false)} onSalir={() => navigate('/')} />}
    </div>
  );
}
