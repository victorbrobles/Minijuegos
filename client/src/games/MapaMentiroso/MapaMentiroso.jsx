// client/src/games/MapaMentiroso/MapaMentiroso.jsx
// El Mapa Mentiroso — memoriza las indicaciones y señala en el mapa dónde acabas.
// En niveles altos la brújula está girada y alguna indicación viene al revés.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import {
  PortadaUnJugador, CabeceraPartida, FinUnJugador, AyudaUnJugador, ConfirmarSalida, Barra, useRecord
} from '../../components/UnJugador.jsx';
import { LADO, DIRECCIONES, girar, generarRuta, textoPaso } from './motor.js';
import './MapaMentiroso.css';

const ID = 'mapamentiroso';
const VIDAS = 3;
const SEGUNDOS_RESPUESTA = 15;
const OPUESTA = { N: 'S', S: 'N', E: 'O', O: 'E' };

function recorrido(ruta) {
  const salida = ruta.pueblos.find((p) => p.salida);
  const puntos = [[salida.x, salida.y]];
  let [x, y] = puntos[0];
  ruta.pasos.forEach((p, i) => {
    const real = i === ruta.invertida ? OPUESTA[p.dir] : p.dir;
    const [dx, dy] = girar(DIRECCIONES[real].v, ruta.giro);
    for (let k = 0; k < p.n; k++) { x += dx; y += dy; puntos.push([x, y]); }
  });
  return puntos;
}

function Rosa({ giro }) {
  return (
    <div className="mm-rosa" style={{ transform: `rotate(${giro * 90}deg)` }} aria-label="Brújula">
      <span className="n">N</span><span className="e">E</span><span className="s">S</span><span className="o">O</span>
      <i />
    </div>
  );
}

export default function MapaMentiroso() {
  const navigate = useNavigate();
  const [fase, setFase] = useState('portada'); // portada | memorizar | responder | resultado | fin
  const [ayuda, setAyuda] = useState(false);
  const [salir, setSalir] = useState(false);
  const [record, registrar] = useRecord(ID);
  const [nivel, setNivel] = useState(1);
  const [ruta, setRuta] = useState(null);
  const [vidas, setVidas] = useState(VIDAS);
  const [aciertos, setAciertos] = useState(0);
  const [elegida, setElegida] = useState(null);
  const [restante, setRestante] = useState(1);
  const [nuevoRecord, setNuevoRecord] = useState(false);
  const finRef = useRef(0);
  const durRef = useRef(1);

  const reloj = (s) => { durRef.current = s; finRef.current = Date.now() + s * 1000; setRestante(s); };

  const preparar = (n) => {
    const r = generarRuta(n);
    setRuta(r);
    setElegida(null);
    reloj(r.memorizar);
    setFase('memorizar');
  };

  const empezar = () => {
    setNivel(1);
    setVidas(VIDAS);
    setAciertos(0);
    setNuevoRecord(false);
    preparar(1);
  };

  const responder = (x, y) => {
    if (fase !== 'responder') return;
    const ok = x === ruta.destino[0] && y === ruta.destino[1];
    setElegida([x, y]);
    if (ok) setAciertos((a) => a + 1); else setVidas((v) => v - 1);
    if (navigator.vibrate) navigator.vibrate(ok ? 15 : [30, 40, 30]);
    setFase('resultado');
  };

  useEffect(() => {
    if (fase !== 'memorizar' && fase !== 'responder') return undefined;
    const id = setInterval(() => {
      const r = (finRef.current - Date.now()) / 1000;
      if (r > 0) { setRestante(r); return; }
      clearInterval(id);
      if (fase === 'memorizar') { reloj(SEGUNDOS_RESPUESTA); setFase('responder'); } else {
        setElegida(null);
        setVidas((v) => v - 1);
        setFase('resultado');
      }
    }, 100);
    return () => clearInterval(id);
  }, [fase]);

  const siguiente = () => {
    if (vidas <= 0) {
      setNuevoRecord(aciertos > 0 && registrar(aciertos));
      setFase('fin');
      return;
    }
    const acerto = elegida && elegida[0] === ruta.destino[0] && elegida[1] === ruta.destino[1];
    const n = acerto ? nivel + 1 : nivel;
    setNivel(n);
    preparar(n);
  };

  const camino = useMemo(() => (ruta ? recorrido(ruta) : []), [ruta]);

  const ayudaModal = ayuda && (
    <AyudaUnJugador titulo="¿Cómo se juega?" onCerrar={() => setAyuda(false)}>
      <p>Empiezas en el lugar marcado con <strong>📍</strong>. Lee las indicaciones (por ejemplo «2 casillas al Norte») y <strong>memorízalas</strong>: desaparecerán.</p>
      <ul>
        <li>Después toca la casilla del mapa donde terminas. Tienes {SEGUNDOS_RESPUESTA} segundos.</li>
        <li>Desde el nivel 3 la <strong>brújula está girada</strong>: el Norte es hacia donde apunte la aguja roja, no hacia arriba.</li>
        <li>Desde el nivel 5 una indicación está <strong>invertida</strong> (te diremos cuál): haz justo lo contrario.</li>
        <li>Si fallas pierdes una vida. Tienes 3.</li>
      </ul>
    </AyudaUnJugador>
  );

  if (fase === 'portada') {
    return (
      <div className="mm-contenedor">
        <PortadaUnJugador juegoId={ID} onJugar={empezar} onAyuda={() => setAyuda(true)} record={record}
          textoRecord={(r) => `${r.valor} ${r.valor === 1 ? 'ruta' : 'rutas'}`} />
        {ayudaModal}
      </div>
    );
  }

  if (fase === 'fin') {
    return (
      <div className="mm-contenedor">
        <FinUnJugador
          icono="pin"
          etiqueta="Te has quedado sin vidas"
          titulo={aciertos >= 10 ? '¡Brújula humana!' : aciertos >= 5 ? '¡Buen sentido de la orientación!' : 'Te has perdido'}
          puntos={aciertos}
          unidad={aciertos === 1 ? 'ruta acertada' : 'rutas acertadas'}
          nuevoRecord={nuevoRecord}
          record={record}
          textoRecord={(r) => `${r.valor} rutas`}
          exito={aciertos > 0}
          onRepetir={empezar}
          onMenu={() => setFase('portada')}
        />
      </div>
    );
  }

  const resultado = fase === 'resultado';
  const acerto = resultado && elegida && elegida[0] === ruta.destino[0] && elegida[1] === ruta.destino[1];
  const enCamino = new Map(camino.map(([x, y], i) => [`${x},${y}`, i]));

  return (
    <div className="mm-contenedor qq-en-partida">
      <section className="game uj-escena">
        <CabeceraPartida
          onSalir={() => setSalir(true)}
          chips={[
            <><Icon name="flag" size={14} /> Nivel {nivel}</>,
            <>{Array.from({ length: VIDAS }, (_, i) => (i < vidas ? '❤️' : '🖤')).join('')}</>
          ]}
          titulo={fase === 'memorizar' ? 'Memoriza la ruta' : fase === 'responder' ? '¿Dónde acabas? ¡Toca la casilla!' : acerto ? '¡Has llegado!' : 'Te has perdido…'}
        />

        {(fase === 'memorizar' || fase === 'responder') && (
          <Barra valor={restante / durRef.current} etiqueta={`${Math.ceil(restante)} s`} invertida icono={fase === 'memorizar' ? 'eye' : 'clock'} />
        )}

        <div className="uj-tarjeta mm-indicaciones">
          {fase === 'memorizar' || resultado ? (
            <ol>
              {ruta.pasos.map((p, i) => (
                <li key={i} className={i === ruta.invertida ? 'invertida' : ''}>
                  {textoPaso(p)}
                  {i === ruta.invertida && <em> ⚠️ ¡al revés!</em>}
                </li>
              ))}
            </ol>
          ) : (
            <p className="mm-oculto">🙈 Indicaciones ocultas · {ruta.pasos.length} pasos{ruta.invertida >= 0 ? ` · la ${ruta.invertida + 1}.ª va al revés` : ''}</p>
          )}
          {ruta.giro > 0 && <p className="mm-aviso">🧭 ¡Cuidado! La brújula está girada.</p>}
        </div>

        <div className="mm-mapa" style={{ '--lado': LADO }}>
          {Array.from({ length: LADO * LADO }, (_, k) => {
            const x = k % LADO; const y = Math.floor(k / LADO);
            const pueblo = ruta.pueblos.find((p) => p.x === x && p.y === y);
            const paso = enCamino.get(`${x},${y}`);
            let clase = '';
            if (resultado && paso != null) clase += ' camino';
            if (resultado && x === ruta.destino[0] && y === ruta.destino[1]) clase += ' destino';
            if (resultado && elegida && elegida[0] === x && elegida[1] === y && !acerto) clase += ' fallo';
            return (
              <button key={k} type="button" className={`mm-celda${clase}`} onClick={() => responder(x, y)} disabled={fase !== 'responder'}>
                {pueblo && (
                  <span className="mm-pueblo">
                    <b>{pueblo.emoji}</b>
                    <small>{pueblo.nombre}</small>
                    {pueblo.salida && <i className="mm-salida">📍</i>}
                  </span>
                )}
                {resultado && paso != null && paso > 0 && !pueblo && <span className="mm-huella">{paso}</span>}
              </button>
            );
          })}
          <Rosa giro={ruta.giro} />
        </div>

        {resultado && (
          <div className="uj-acciones">
            <button type="button" className="uj-boton grande" onClick={siguiente}>
              {vidas <= 0 ? <><Icon name="flagFinish" size={20} /> Ver resultado</> : <><Icon name="forward" size={20} /> {acerto ? 'Siguiente ruta' : 'Otra ruta'}</>}
            </button>
          </div>
        )}
      </section>
      {salir && <ConfirmarSalida onSeguir={() => setSalir(false)} onSalir={() => navigate('/')} />}
    </div>
  );
}
