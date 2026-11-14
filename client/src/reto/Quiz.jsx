// client/src/reto/Quiz.jsx — reto diario de preguntas con opciones (cultura, fútbol, pareja, intruso)
import React, { useEffect, useRef, useState } from 'react';
import Icon from '../components/Icon.jsx';
import { Barra } from '../components/UnJugador.jsx';

const LETRAS = ['A', 'B', 'C', 'D', 'E'];

export default function Quiz({ datos, onFin }) {
  const { preguntas, segundos, umbral } = datos;
  const [i, setI] = useState(0);
  const [aciertos, setAciertos] = useState(0);
  const [elegida, setElegida] = useState(null); // texto elegido o '' si se acabó el tiempo
  const [restante, setRestante] = useState(segundos);
  const fin = useRef(Date.now() + segundos * 1000);
  const q = preguntas[i];

  useEffect(() => {
    fin.current = Date.now() + segundos * 1000;
    setRestante(segundos);
  }, [i, segundos]);
  useEffect(() => {
    if (elegida !== null) return undefined;
    const t = setInterval(() => {
      const r = Math.max(0, (fin.current - Date.now()) / 1000);
      setRestante(r);
      if (r <= 0) setElegida('');
    }, 100);
    return () => clearInterval(t);
  }, [elegida, i]);

  const responder = (o) => {
    if (elegida !== null) return;
    setElegida(o);
    if (o === q.correcta) setAciertos((a) => a + 1);
  };
  const siguiente = () => {
    if (i + 1 >= preguntas.length) {
      onFin(aciertos >= umbral, aciertos, `${aciertos} de ${preguntas.length} aciertos`);
      return;
    }
    setI(i + 1); setElegida(null);
  };
  const quedanPorFallar = preguntas.length - umbral - (i + (elegida !== null ? 1 : 0) - aciertos);

  return (
    <div className="rto-juego">
      <div className="rto-progreso">
        <span>Pregunta {i + 1} de {preguntas.length}</span>
        <span>✅ {aciertos} · necesitas {umbral}</span>
      </div>
      {elegida === null && <Barra valor={restante / segundos} etiqueta={`${Math.ceil(restante)} s`} invertida />}
      <div className="uj-tarjeta rto-pregunta">
        {q.etiqueta && <span className="rto-etiqueta">{q.etiqueta}</span>}
        {q.grande && <div className="rto-grande">{q.grande}</div>}
        <h2>{q.p}</h2>
        <div className="rto-opciones">
          {q.opciones.map((o, k) => {
            const clase = elegida === null ? '' : o === q.correcta ? ' bien' : o === elegida ? ' mal' : ' apagada';
            return (
              <button key={o} type="button" className={`rto-opcion${clase}`} disabled={elegida !== null} onClick={() => responder(o)}>
                <i>{LETRAS[k]}</i><span>{o}</span>
              </button>
            );
          })}
        </div>
        {elegida !== null && (
          <p className={`rto-veredicto ${elegida === q.correcta ? 'bien' : 'mal'}`}>
            {elegida === q.correcta ? '¡Correcto!' : elegida === '' ? `Se acabó el tiempo. Era «${q.correcta}».` : `No. Era «${q.correcta}».`}
            {q.explicacion && <small>{q.explicacion}</small>}
          </p>
        )}
      </div>
      {elegida !== null && (
        <button type="button" className="uj-boton grande" onClick={siguiente}>
          {i + 1 >= preguntas.length ? <><Icon name="flagFinish" size={20} /> Ver resultado</> : <><Icon name="forward" size={20} /> Siguiente</>}
        </button>
      )}
      {elegida !== null && quedanPorFallar < 0 && i + 1 < preguntas.length && <p className="rto-aviso">Ya no llegas al mínimo, pero puedes terminar.</p>}
    </div>
  );
}
