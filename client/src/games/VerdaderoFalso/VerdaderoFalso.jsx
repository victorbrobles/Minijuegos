// client/src/games/VerdaderoFalso/VerdaderoFalso.jsx
// ¿Verdadero o falso? Exprés — 3 segundos por afirmación, el reloj nunca se detiene.
// Un fallo o quedarse sin tiempo termina la partida. Solo frontend.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import {
  PortadaUnJugador, CabeceraPartida, FinUnJugador, AyudaUnJugador, ConfirmarSalida, useRecord, barajar
} from '../../components/UnJugador.jsx';
import AFIRMACIONES from './afirmaciones.js';
import './VerdaderoFalso.css';

const ID = 'verdaderofalso';
const SEGUNDOS = 3;

export default function VerdaderoFalso() {
  const navigate = useNavigate();
  const [fase, setFase] = useState('portada'); // portada | cuenta | juego | fin
  const [ayuda, setAyuda] = useState(false);
  const [salir, setSalir] = useState(false);
  const [record, registrar] = useRecord(ID);
  const [cuenta, setCuenta] = useState(3);
  const [mazo, setMazo] = useState([]);
  const [indice, setIndice] = useState(0);
  const [aciertos, setAciertos] = useState(0);
  const [restante, setRestante] = useState(SEGUNDOS);
  const [final, setFinal] = useState(null); // { afirmacion, motivo, respuesta }
  const [nuevoRecord, setNuevoRecord] = useState(false);
  const [destello, setDestello] = useState(0);
  const finRef = useRef(0);

  const actual = mazo[indice];

  const empezar = () => {
    setMazo(barajar(AFIRMACIONES));
    setIndice(0);
    setAciertos(0);
    setFinal(null);
    setNuevoRecord(false);
    setCuenta(3);
    setFase('cuenta');
  };

  // Cuenta atrás 3-2-1
  useEffect(() => {
    if (fase !== 'cuenta') return undefined;
    if (cuenta === 0) {
      finRef.current = Date.now() + SEGUNDOS * 1000;
      setRestante(SEGUNDOS);
      setFase('juego');
      return undefined;
    }
    const id = setTimeout(() => setCuenta((c) => c - 1), 650);
    return () => clearTimeout(id);
  }, [fase, cuenta]);

  const terminar = useCallback((motivo, respuesta) => {
    setFase('fin');
    setFinal({ afirmacion: mazo[indice], motivo, respuesta });
    setNuevoRecord(aciertos > 0 && registrar(aciertos));
  }, [mazo, indice, aciertos, registrar]);

  // Reloj de cada afirmación
  useEffect(() => {
    if (fase !== 'juego') return undefined;
    const id = setInterval(() => {
      const r = (finRef.current - Date.now()) / 1000;
      if (r <= 0) {
        clearInterval(id);
        terminar('tiempo');
      } else {
        setRestante(r);
      }
    }, 50);
    return () => clearInterval(id);
  }, [fase, indice, terminar]);

  const responder = useCallback((valor) => {
    if (fase !== 'juego' || !actual) return;
    if (valor !== actual[1]) {
      terminar('fallo', valor);
      return;
    }
    setAciertos((a) => a + 1);
    setDestello((d) => d + 1);
    if (navigator.vibrate) navigator.vibrate(8);
    if (indice + 1 >= mazo.length) {
      setMazo(barajar(AFIRMACIONES));
      setIndice(0);
    } else {
      setIndice((i) => i + 1);
    }
    finRef.current = Date.now() + SEGUNDOS * 1000;
    setRestante(SEGUNDOS);
  }, [fase, actual, indice, mazo.length, terminar]);

  // Teclado: ← / V = verdadero · → / F = falso
  useEffect(() => {
    if (fase !== 'juego') return undefined;
    const onKey = (e) => {
      const k = e.key.toLowerCase();
      if (k === 'arrowleft' || k === 'v') responder(true);
      if (k === 'arrowright' || k === 'f') responder(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [fase, responder]);

  const ayudaModal = ayuda && (
    <AyudaUnJugador titulo="¿Cómo se juega?" onCerrar={() => setAyuda(false)}>
      <p>Aparecen afirmaciones de cultura general, una tras otra. Solo tienes que decir si son <strong>verdaderas</strong> o <strong>falsas</strong>.</p>
      <ul>
        <li>Tienes <strong>3 segundos</strong> para cada una y el reloj nunca se detiene.</li>
        <li>Un solo fallo, o quedarte sin tiempo, termina la partida.</li>
        <li>Muchas son mitos populares que casi todo el mundo cree… ¡cuidado!</li>
        <li>Con teclado: <strong>←</strong> o <strong>V</strong> para verdadero, <strong>→</strong> o <strong>F</strong> para falso.</li>
      </ul>
    </AyudaUnJugador>
  );

  if (fase === 'portada') {
    return (
      <div className="vf-contenedor">
        <PortadaUnJugador juegoId={ID} onJugar={empezar} onAyuda={() => setAyuda(true)} record={record} textoRecord={(r) => `${r.valor} seguidas`} />
        {ayudaModal}
      </div>
    );
  }

  if (fase === 'fin' && final) {
    const a = final.afirmacion;
    return (
      <div className="vf-contenedor">
        <FinUnJugador
          icono={final.motivo === 'tiempo' ? 'clock' : 'x'}
          etiqueta={final.motivo === 'tiempo' ? '¡Se acabó el tiempo!' : '¡Fallo!'}
          titulo={aciertos === 0 ? 'A la primera…' : aciertos >= 20 ? '¡Impresionante!' : aciertos >= 10 ? '¡Muy bien!' : '¡Buen intento!'}
          puntos={aciertos}
          unidad={aciertos === 1 ? 'acierto seguido' : 'aciertos seguidos'}
          nuevoRecord={nuevoRecord}
          record={record}
          textoRecord={(r) => `${r.valor} seguidas`}
          exito={aciertos > 0}
          onRepetir={empezar}
          onMenu={() => setFase('portada')}
        >
          {a && (
            <div className="vf-repaso">
              <p className="vf-repaso-frase">«{a[0]}»</p>
              <p className={`vf-repaso-veredicto ${a[1] ? 'v' : 'f'}`}>Es {a[1] ? 'VERDADERO' : 'FALSO'}</p>
              <p className="uj-mini">{a[2]}</p>
            </div>
          )}
        </FinUnJugador>
      </div>
    );
  }

  return (
    <div className="vf-contenedor qq-en-partida">
      <section className="game uj-escena">
        <CabeceraPartida onSalir={() => setSalir(true)} chips={[<><Icon name="check" size={14} /> {aciertos}</>, record ? <><Icon name="trophy" size={14} /> {record.valor}</> : null]} />

        {fase === 'cuenta' ? (
          <div className="uj-tarjeta vf-cuenta">
            <p className="uj-etiqueta">Prepárate</p>
            <span key={cuenta} className="vf-cuenta-num">{cuenta || '¡Ya!'}</span>
          </div>
        ) : (
          <>
            <div className={`vf-reloj ${restante <= 1 ? 'critico' : restante <= 2 ? 'aviso' : ''}`}>
              <span style={{ width: `${(restante / SEGUNDOS) * 100}%` }} />
            </div>
            <div key={`${indice}-${destello}`} className="uj-tarjeta vf-tarjeta">
              <p className="uj-etiqueta">¿Verdadero o falso?</p>
              <p className="vf-frase">{actual?.[0]}</p>
            </div>
            <div className="vf-botones">
              <button type="button" className="vf-boton v" onClick={() => responder(true)}>
                <Icon name="check" size={28} strokeWidth={3} /> Verdadero
              </button>
              <button type="button" className="vf-boton f" onClick={() => responder(false)}>
                <Icon name="x" size={28} strokeWidth={3} /> Falso
              </button>
            </div>
          </>
        )}
      </section>
      {salir && <ConfirmarSalida onSeguir={() => setSalir(false)} onSalir={() => navigate('/')} />}
    </div>
  );
}
