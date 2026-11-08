// client/src/games/CronoCourier/CronoCourier.jsx
// Crono-Courier — programa cuándo sale cada vehículo y cómo funcionan los semáforos,
// pulsa Play y mira cómo se mueve la ciudad. Sin choques y todos a tiempo = entrega hecha.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import {
  PortadaUnJugador, CabeceraPartida, FinUnJugador, AyudaUnJugador, ConfirmarSalida, Aviso, useRecord
} from '../../components/UnJugador.jsx';
import { COLS, FILAS, MAX_ESPERA, esCalle, esCruce, generarNivel, simular, exito } from './motor.js';
import './CronoCourier.css';

const ID = 'cronocourier';
const VIDAS = 3;
const MS_TIC = 480;

export default function CronoCourier() {
  const navigate = useNavigate();
  const [fase, setFase] = useState('portada'); // portada | cargando | plan | play | resultado | fin
  const [ayuda, setAyuda] = useState(false);
  const [salir, setSalir] = useState(false);
  const [record, registrar] = useRecord(ID);
  const [numero, setNumero] = useState(1);
  const [nivel, setNivel] = useState(null);
  const [esperas, setEsperas] = useState([]);
  const [semaforos, setSemaforos] = useState({});
  const [sim, setSim] = useState(null);
  const [tic, setTic] = useState(0);
  const [vidas, setVidas] = useState(VIDAS);
  const [entregas, setEntregas] = useState(0);
  const [resaltado, setResaltado] = useState(null);
  const [aviso, setAviso] = useState({ texto: '', tipo: 'info', clave: 0 });
  const [nuevoRecord, setNuevoRecord] = useState(false);
  const animRef = useRef(null);

  const cargar = (num) => {
    setFase('cargando');
    setTimeout(() => {
      let l = null;
      for (let k = 0; k < 5 && !l; k++) l = generarNivel(num);
      setNivel(l);
      setEsperas(l.vehiculos.map(() => 0));
      setSemaforos(Object.fromEntries(l.semaforos.map((s) => [s, 0])));
      setSim(null);
      setTic(0);
      setResaltado(null);
      setFase('plan');
    }, 30);
  };

  const empezar = () => {
    setNumero(1);
    setVidas(VIDAS);
    setEntregas(0);
    setNuevoRecord(false);
    cargar(1);
  };

  useEffect(() => () => clearInterval(animRef.current), []);

  const play = () => {
    const r = simular(nivel, { esperas, semaforos });
    setSim(r);
    setTic(0);
    setFase('play');
    let t = 0;
    clearInterval(animRef.current);
    animRef.current = setInterval(() => {
      t += 1;
      if (t >= r.pasos.length) {
        clearInterval(animRef.current);
        const ok = exito(r);
        if (ok) {
          setEntregas((e) => e + 1);
          setAviso((a) => ({ texto: '📦 ¡Entrega a tiempo y sin choques!', tipo: 'bueno', clave: a.clave + 1 }));
        } else {
          setVidas((v) => v - 1);
          if (navigator.vibrate) navigator.vibrate([40, 40, 40]);
        }
        setFase('resultado');
        return;
      }
      setTic(t);
    }, MS_TIC);
  };

  const saltar = () => {
    if (fase !== 'play' || !sim) return;
    clearInterval(animRef.current);
    setTic(sim.pasos.length - 1);
    const ok = exito(sim);
    if (ok) setEntregas((e) => e + 1); else setVidas((v) => v - 1);
    setFase('resultado');
  };

  const siguiente = () => {
    const ok = sim && exito(sim);
    if (!ok && vidas <= 0) {
      setNuevoRecord(entregas > 0 && registrar(entregas));
      setFase('fin');
      return;
    }
    if (ok) {
      setNumero(numero + 1);
      cargar(numero + 1);
    } else {
      setSim(null);
      setTic(0);
      setFase('plan');
    }
  };

  const cambiarEspera = (i, d) => setEsperas((es) => es.map((v, k) => (k === i ? Math.max(0, Math.min(MAX_ESPERA, v + d)) : v)));
  const cambiarSemaforo = (k) => fase === 'plan' && setSemaforos((s) => ({ ...s, [k]: s[k] ? 0 : 1 }));

  // Marcas de las rutas en cada casilla
  const marcas = useMemo(() => {
    if (!nivel) return {};
    const m = {};
    nivel.vehiculos.forEach((v, i) => v.ruta.forEach(([c, f], k) => {
      const clave = `${c},${f}`;
      if (!m[clave]) m[clave] = [];
      m[clave].push({ i, color: v.color, inicio: k === 0, fin: k === v.ruta.length - 1 });
    }));
    return m;
  }, [nivel]);

  const ayudaModal = ayuda && (
    <AyudaUnJugador titulo="¿Cómo se juega?" onCerrar={() => setAyuda(false)}>
      <p>Eres el controlador de tráfico de la ciudad y tu furgoneta 🚐 tiene que hacer una entrega.</p>
      <ul>
        <li>Cada vehículo sigue su <strong>ruta fija</strong> (los puntos de su color), una casilla por tic.</li>
        <li>Programa cuántos tics <strong>espera cada vehículo</strong> antes de salir (de 0 a {MAX_ESPERA}).</li>
        <li>Toca los <strong>semáforos 🚦</strong> para elegir qué dirección tiene verde primero (↔ o ↕). Cambian cada 2 tics.</li>
        <li>Pulsa <strong>Play</strong>: si dos vehículos acaban en la misma casilla o se cruzan de frente, chocan.</li>
        <li>Todos tienen una <strong>hora límite</strong>: no vale con dejar a los demás parados para siempre.</li>
        <li>Cada intento fallido cuesta una vida. Tienes 3.</li>
      </ul>
    </AyudaUnJugador>
  );

  if (fase === 'portada') {
    return (
      <div className="ko-contenedor">
        <PortadaUnJugador juegoId={ID} onJugar={empezar} onAyuda={() => setAyuda(true)} record={record}
          textoRecord={(r) => `${r.valor} ${r.valor === 1 ? 'entrega' : 'entregas'}`} />
        {ayudaModal}
      </div>
    );
  }

  if (fase === 'fin') {
    return (
      <div className="ko-contenedor">
        <FinUnJugador
          icono="flagFinish"
          etiqueta="Fin del turno"
          titulo={entregas >= 10 ? '¡Rey del tráfico!' : entregas >= 5 ? '¡Gran repartidor!' : 'Turno terminado'}
          puntos={entregas}
          unidad={entregas === 1 ? 'entrega a tiempo' : 'entregas a tiempo'}
          nuevoRecord={nuevoRecord}
          record={record}
          textoRecord={(r) => `${r.valor} entregas`}
          exito={entregas > 0}
          onRepetir={empezar}
          onMenu={() => setFase('portada')}
        />
      </div>
    );
  }

  if (fase === 'cargando' || !nivel) {
    return (
      <div className="ko-contenedor">
        <section className="game uj-escena"><p className="uj-texto-claro">Preparando la ciudad…</p></section>
      </div>
    );
  }

  const posiciones = sim ? sim.pasos[Math.min(tic, sim.pasos.length - 1)] : null;
  const anteriores = sim && tic > 0 ? sim.pasos[tic - 1] : null;
  const choque = fase === 'resultado' && sim?.choque;
  const ok = fase === 'resultado' && exito(sim);
  const fasePlan = fase === 'plan';

  let mensaje = '';
  if (fase === 'resultado') {
    if (sim.choque) {
      const [a, b] = sim.choque.ids;
      mensaje = `💥 ¡Choque en el tic ${sim.choque.tic} entre ${nivel.vehiculos[a].nombre} y ${nivel.vehiculos[b].nombre}!`;
    } else if (sim.retrasos.length) {
      const i = sim.retrasos[0];
      const v = nivel.vehiculos[i];
      mensaje = `⏰ ${v.nombre} ha llegado tarde${sim.llegadas[i] ? ` (tic ${sim.llegadas[i]}, límite ${v.limite})` : ''}.`;
    } else {
      mensaje = '📦 ¡Entrega a tiempo! Nadie ha chocado.';
    }
  }

  return (
    <div className="ko-contenedor qq-en-partida">
      <Aviso {...aviso} />
      <section className="game uj-escena">
        <CabeceraPartida
          onSalir={() => setSalir(true)}
          chips={[
            <><Icon name="flag" size={14} /> Nivel {numero}</>,
            <>{Array.from({ length: VIDAS }, (_, i) => (i < vidas ? '❤️' : '🖤')).join('')}</>
          ]}
        >
          <div className="ko-info">
            <span><Icon name="clock" size={15} /> Tic {fasePlan ? 0 : Math.max(0, tic)}</span>
            <span>🚐 Entrega antes del tic {nivel.vehiculos[0].limite}</span>
          </div>
        </CabeceraPartida>

        <div className="ko-ciudad" style={{ '--cols': COLS, '--filas': FILAS }}>
          {Array.from({ length: FILAS }, (_, f) => Array.from({ length: COLS }, (_, c) => {
            const clave = `${c},${f}`;
            const calle = esCalle(c, f);
            const sem = nivel.semaforos.includes(clave);
            const ms = marcas[clave] || [];
            return (
              <div key={clave} className={`ko-celda ${calle ? 'calle' : 'edificio'}${esCruce(c, f) ? ' cruce' : ''}`}>
                {!calle && <span className="ko-edif" style={{ '--h': ((c * 7 + f * 3) % 5) }} />}
                {ms.map((m, k) => (
                  <span
                    key={k}
                    className={`ko-marca${m.inicio ? ' inicio' : ''}${m.fin ? ' fin' : ''}${resaltado != null && resaltado !== m.i ? ' tenue' : ''}`}
                    style={{ '--c': m.color, '--k': k }}
                  >
                    {m.fin ? '🏁' : ''}
                  </span>
                ))}
                {sem && (
                  <button type="button" className={`ko-semaforo${fasePlan ? '' : ' fijo'}`} onClick={() => cambiarSemaforo(clave)} aria-label="Cambiar semáforo">
                    🚦<small>{semaforos[clave] ? '↕' : '↔'}</small>
                  </button>
                )}
                {choque && choque.c === c && choque.f === f && <span className="ko-boom">💥</span>}
              </div>
            );
          }))}

          {nivel.vehiculos.map((v, i) => {
            const p = posiciones ? posiciones[i] : { c: v.ruta[0][0], f: v.ruta[0][1], activo: false, llegado: false };
            const q = anteriores ? anteriores[i] : null;
            const derecha = q ? p.c > q.c : v.ruta[1][0] > v.ruta[0][0];
            const visible = !p.llegado || (fase === 'resultado' && sim?.choque?.ids.includes(i));
            return (
              <span
                key={i}
                className={`ko-vehiculo${p.activo || p.llegado ? '' : ' esperando'}${v.courier ? ' courier' : ''}${visible ? '' : ' llegado'}`}
                style={{ left: `${((p.c + 0.5) / COLS) * 100}%`, top: `${((p.f + 0.5) / FILAS) * 100}%`, '--c': v.color }}
              >
                <span style={{ transform: derecha ? 'scaleX(-1)' : undefined }}>{v.emoji}</span>
              </span>
            );
          })}
        </div>

        {fase === 'resultado' && (
          <div className={`uj-tarjeta ko-resultado ${ok ? 'ok' : 'mal'}`}>
            <p className="ko-mensaje">{mensaje}</p>
            <button type="button" className={`uj-boton grande${ok ? ' exito' : ''}`} onClick={siguiente}>
              {ok ? <><Icon name="forward" size={20} /> Siguiente nivel</>
                : vidas <= 0 ? <><Icon name="flagFinish" size={20} /> Ver resultado</>
                  : <><Icon name="refresh" size={20} /> Reprogramar</>}
            </button>
          </div>
        )}

        {fase !== 'resultado' && (
          <div className="uj-tarjeta ko-panel">
            <p className="uj-etiqueta"><Icon name="settings" size={14} /> Programación de salidas</p>
            {nivel.vehiculos.map((v, i) => (
              <div
                key={i}
                className={`ko-fila${resaltado === i ? ' activa' : ''}`}
                style={{ '--c': v.color }}
                onPointerEnter={() => setResaltado(i)}
                onPointerLeave={() => setResaltado(null)}
              >
                <button type="button" className="ko-quien" onClick={() => setResaltado(resaltado === i ? null : i)}>
                  <span className="ko-emoji">{v.emoji}</span>
                  <span className="ko-nombre">{v.nombre}<small>Límite: tic {v.limite}</small></span>
                </button>
                <div className="ko-stepper">
                  <button type="button" disabled={!fasePlan || esperas[i] <= 0} onClick={() => cambiarEspera(i, -1)} aria-label="Menos espera">−</button>
                  <span><b>{esperas[i]}</b><small>espera</small></span>
                  <button type="button" disabled={!fasePlan || esperas[i] >= MAX_ESPERA} onClick={() => cambiarEspera(i, 1)} aria-label="Más espera">+</button>
                </div>
              </div>
            ))}
            {nivel.semaforos.length > 0 && <p className="uj-mini">🚦 Toca un semáforo en el mapa para cambiar qué dirección tiene verde primero.</p>}
            {fasePlan ? (
              <button type="button" className="uj-boton grande" onClick={play}><Icon name="play" size={20} /> Play</button>
            ) : (
              <button type="button" className="uj-boton secundario" onClick={saltar}><Icon name="forward" size={18} /> Ver el final</button>
            )}
          </div>
        )}
      </section>
      {salir && <ConfirmarSalida onSeguir={() => setSalir(false)} onSalir={() => navigate('/')} />}
    </div>
  );
}
