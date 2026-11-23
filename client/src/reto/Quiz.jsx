// client/src/reto/Quiz.jsx — reto diario de preguntas con opciones (cultura, fútbol, pareja, intruso) o de respuesta
// escrita (banderas: { escribir: true, correcta, alias }), con imagen opcional ({ imagen })
import React, { useEffect, useRef, useState } from 'react';
import Icon from '../components/Icon.jsx';
import { Barra } from '../components/UnJugador.jsx';

const LETRAS = ['A', 'B', 'C', 'D', 'E'];
const normal = (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
function distancia(a, b) {
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[b.length];
}
/** Respuesta escrita: vale el nombre o un alias, sin tildes ni mayúsculas, con una errata en nombres de 6 letras o más. */
function vale(escrito, q) {
  const u = normal(escrito); if (!u) return false;
  return [q.correcta, ...(q.alias || [])].map(normal).some((t) => t === u || (t.length >= 6 && u[0] === t[0] && distancia(u, t) <= 1));
}

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

  const [texto, setTexto] = useState('');
  const responder = (o) => {
    if (elegida !== null) return;
    setElegida(o);
    if (o === q.correcta) setAciertos((a) => a + 1);
  };
  // Escrita: si vale, cuenta como la respuesta correcta
  const comprobar = (e) => { e.preventDefault(); if (!texto.trim()) return; responder(vale(texto, q) ? q.correcta : texto.trim()); };
  const siguiente = () => {
    if (i + 1 >= preguntas.length) {
      onFin(aciertos >= umbral, aciertos, `${aciertos} de ${preguntas.length} aciertos`);
      return;
    }
    setI(i + 1); setElegida(null); setTexto('');
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
        {q.imagen && <img className="rto-imagen" src={q.imagen} alt="" draggable="false" />}
        <h2>{q.p}</h2>
        {q.escribir && (
          <form className="rto-escribir" onSubmit={comprobar}>
            <input value={texto} onChange={(e) => setTexto(e.target.value)} disabled={elegida !== null} placeholder="Escribe el país" autoComplete="off" autoCapitalize="words" autoFocus key={i} />
            <button type="submit" className="uj-boton" disabled={elegida !== null || !texto.trim()}>Comprobar</button>
          </form>
        )}
        {!q.escribir && <div className="rto-opciones">
          {q.opciones.map((o, k) => {
            const clase = elegida === null ? '' : o === q.correcta ? ' bien' : o === elegida ? ' mal' : ' apagada';
            return (
              <button key={o} type="button" className={`rto-opcion${clase}`} disabled={elegida !== null} onClick={() => responder(o)}>
                <i>{LETRAS[k]}</i><span>{o}</span>
              </button>
            );
          })}
        </div>}
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
