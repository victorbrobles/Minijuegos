// client/src/games/Pecera/Pecera.jsx
// ¿Qué sobra en la pecera? — 6 elementos, 5 comparten un criterio oculto. Encuentra al intruso…
// y no caigas en la trampa: el que parece sobrar a simple vista casi nunca es.
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import {
  PortadaUnJugador, CabeceraPartida, FinUnJugador, AyudaUnJugador, ConfirmarSalida, Barra, useRecord, barajar
} from '../../components/UnJugador.jsx';
import RETOS from './retos.js';
import './Pecera.css';

const ID = 'pecera';
const VIDAS = 3;
const SEGUNDOS = 20;

function prepararReto(r) {
  const orden = barajar(r.items.map((_, i) => i));
  return { ...r, orden };
}

export default function Pecera() {
  const navigate = useNavigate();
  const [fase, setFase] = useState('portada'); // portada | juego | resultado | fin
  const [ayuda, setAyuda] = useState(false);
  const [salir, setSalir] = useState(false);
  const [record, registrar] = useRecord(ID);
  const [mazo, setMazo] = useState([]);
  const [indice, setIndice] = useState(0);
  const [vidas, setVidas] = useState(VIDAS);
  const [puntos, setPuntos] = useState(0);
  const [aciertos, setAciertos] = useState(0);
  const [elegido, setElegido] = useState(null); // índice original o -1 (tiempo)
  const [restante, setRestante] = useState(SEGUNDOS);
  const [ganados, setGanados] = useState(0);
  const [nuevoRecord, setNuevoRecord] = useState(false);
  const finRef = useRef(0);

  const reto = mazo[indice];

  const arrancarReloj = () => {
    finRef.current = Date.now() + SEGUNDOS * 1000;
    setRestante(SEGUNDOS);
  };

  const empezar = () => {
    setMazo(barajar(RETOS).map(prepararReto));
    setIndice(0);
    setVidas(VIDAS);
    setPuntos(0);
    setAciertos(0);
    setElegido(null);
    setNuevoRecord(false);
    arrancarReloj();
    setFase('juego');
  };

  const resolver = (i) => {
    if (fase !== 'juego') return;
    setElegido(i);
    if (i === reto.intruso) {
      const g = 100 + Math.round(((finRef.current - Date.now()) / 1000) * 10);
      setGanados(g);
      setPuntos((p) => p + g);
      setAciertos((a) => a + 1);
    } else {
      setGanados(0);
      setVidas((v) => v - 1);
      if (navigator.vibrate) navigator.vibrate([30, 40, 30]);
    }
    setFase('resultado');
  };

  useEffect(() => {
    if (fase !== 'juego') return undefined;
    const id = setInterval(() => {
      const r = (finRef.current - Date.now()) / 1000;
      if (r <= 0) { clearInterval(id); resolver(-1); } else setRestante(r);
    }, 100);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fase, indice]);

  const siguiente = () => {
    if (vidas <= 0 || indice + 1 >= mazo.length) {
      setNuevoRecord(puntos > 0 && registrar(puntos, { aciertos }));
      setFase('fin');
      return;
    }
    setIndice((i) => i + 1);
    setElegido(null);
    arrancarReloj();
    setFase('juego');
  };

  const ayudaModal = ayuda && (
    <AyudaUnJugador titulo="¿Cómo se juega?" onCerrar={() => setAyuda(false)}>
      <p>En la pecera hay <strong>6 cosas</strong>. Cinco tienen algo en común que no te decimos; una no. ¡Encuentra al intruso!</p>
      <ul>
        <li>Casi siempre hay una <strong>trampa</strong>: algo que parece sobrar a simple vista pero sí encaja. Piensa dos veces.</li>
        <li>Tienes {SEGUNDOS} segundos por pecera. Cuanto antes aciertes, más puntos.</li>
        <li>Si fallas o se acaba el tiempo pierdes una vida. Tienes 3.</li>
      </ul>
    </AyudaUnJugador>
  );

  if (fase === 'portada') {
    return (
      <div className="pc-contenedor">
        <PortadaUnJugador juegoId={ID} onJugar={empezar} onAyuda={() => setAyuda(true)} record={record}
          textoRecord={(r) => `${r.valor} puntos`} />
        {ayudaModal}
      </div>
    );
  }

  if (fase === 'fin') {
    const todo = indice + 1 >= mazo.length && vidas > 0;
    return (
      <div className="pc-contenedor">
        <FinUnJugador
          icono={todo ? 'trophy' : 'eye'}
          etiqueta={todo ? '¡Has vaciado todas las peceras!' : 'Te has quedado sin vidas'}
          titulo={aciertos >= 20 ? '¡Ojo de lince!' : aciertos >= 10 ? '¡Muy fino!' : 'Fin de la partida'}
          puntos={puntos}
          unidad="puntos"
          nuevoRecord={nuevoRecord}
          record={record}
          textoRecord={(r) => `${r.valor} puntos`}
          exito={aciertos > 0}
          onRepetir={empezar}
          onMenu={() => setFase('portada')}
        >
          <p className="uj-mini">{aciertos} {aciertos === 1 ? 'intruso encontrado' : 'intrusos encontrados'}</p>
        </FinUnJugador>
      </div>
    );
  }

  const resultado = fase === 'resultado';
  const ok = resultado && elegido === reto.intruso;
  const cayoTrampa = resultado && elegido === reto.trampa;

  return (
    <div className="pc-contenedor qq-en-partida">
      <section className="game uj-escena">
        <CabeceraPartida
          onSalir={() => setSalir(true)}
          chips={[
            <><Icon name="target" size={14} /> {puntos}</>,
            <>{Array.from({ length: VIDAS }, (_, i) => (i < vidas ? '❤️' : '🖤')).join('')}</>
          ]}
          titulo="¿Qué sobra en la pecera?"
        />

        {!resultado && <Barra valor={restante / SEGUNDOS} etiqueta={`${Math.ceil(restante)} s`} invertida />}

        <div className={`pc-pecera${resultado ? ' revelada' : ''}`}>
          {reto.orden.map((i, k) => {
            const [emoji, texto] = reto.items[i];
            let clase = '';
            if (resultado) {
              if (i === reto.intruso) clase = ' intruso';
              else if (i === elegido) clase = ' fallo';
              else clase = ' encaja';
            }
            return (
              <button key={i} type="button" className={`pc-pez${clase}`} style={{ animationDelay: `${k * -0.7}s` }} onClick={() => resolver(i)} disabled={resultado}>
                {emoji && <span className="pc-emoji">{emoji}</span>}
                <span className={`pc-texto${emoji ? '' : String(texto).length <= 4 ? ' grande' : String(texto).length <= 9 ? ' medio' : ' largo'}`}>{texto}</span>
              </button>
            );
          })}
        </div>

        {resultado && (
          <div className={`uj-tarjeta pc-explica ${ok ? 'ok' : 'mal'}`}>
            <p className="uj-etiqueta">
              {ok ? `¡Correcto! +${ganados} puntos` : elegido === -1 ? '¡Se acabó el tiempo!' : cayoTrampa ? '¡Has caído en la trampa!' : 'Ese no era'}
            </p>
            <p className="pc-criterio"><strong>El criterio:</strong> {reto.criterio}</p>
            <p className="pc-linea"><span>🚫</span> {reto.porQue}</p>
            {reto.trampa != null && reto.trampaTxt && <p className="pc-linea"><span>🪤</span> {reto.trampaTxt}</p>}
          </div>
        )}

        {resultado && (
          <div className="uj-acciones">
            <button type="button" className="uj-boton grande" onClick={siguiente}>
              {vidas <= 0 || indice + 1 >= mazo.length
                ? <><Icon name="flagFinish" size={20} /> Ver resultado</>
                : <><Icon name="forward" size={20} /> Siguiente pecera</>}
            </button>
          </div>
        )}
      </section>
      {salir && <ConfirmarSalida onSeguir={() => setSalir(false)} onSalir={() => navigate('/')} />}
    </div>
  );
}
