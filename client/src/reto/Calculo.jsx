// client/src/reto/Calculo.jsx — reto diario: operaciones de cálculo mental contra el reloj
import React, { useEffect, useRef, useState } from 'react';
import Icon from '../components/Icon.jsx';
import { Barra } from '../components/UnJugador.jsx';

export default function Calculo({ datos, onFin }) {
  const { operaciones, segundos, umbral } = datos;
  const [i, setI] = useState(0);
  const [aciertos, setAciertos] = useState(0);
  const [texto, setTexto] = useState('');
  const [flash, setFlash] = useState(null);
  const [restante, setRestante] = useState(segundos);
  const fin = useRef(Date.now() + segundos * 1000);
  const acabado = useRef(false);
  const ref = useRef(null);
  const terminar = (a) => {
    if (acabado.current) return;
    acabado.current = true;
    onFin(a >= umbral, a, `${a} de ${operaciones.length} operaciones`);
  };
  useEffect(() => {
    const t = setInterval(() => {
      const r = Math.max(0, (fin.current - Date.now()) / 1000);
      setRestante(r);
      if (r <= 0) terminar(aciertosRef.current);
    }, 100);
    return () => clearInterval(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const aciertosRef = useRef(0);
  const enviar = (e) => {
    e.preventDefault();
    if (texto.trim() === '') return;
    const bien = Number(texto) === operaciones[i].res;
    const a = aciertos + (bien ? 1 : 0);
    aciertosRef.current = a;
    setAciertos(a); setFlash({ bien, k: Math.random(), res: operaciones[i].res }); setTexto('');
    if (i + 1 >= operaciones.length) terminar(a);
    else setI(i + 1);
    ref.current?.focus();
  };
  return (
    <div className="rto-juego">
      <div className="rto-progreso"><span>Operación {Math.min(i + 1, operaciones.length)} de {operaciones.length}</span><span>✅ {aciertos} · necesitas {umbral}</span></div>
      <Barra valor={restante / segundos} etiqueta={`${Math.ceil(restante)} s`} invertida />
      <form className="uj-tarjeta rto-calculo" onSubmit={enviar}>
        <p className="rto-operacion">{operaciones[i].texto} =</p>
        <input ref={ref} className="rto-input" inputMode="numeric" value={texto} onChange={(e) => setTexto(e.target.value.replace(/[^\d-]/g, '').slice(0, 5))} autoFocus placeholder="?" />
        <button type="submit" className="uj-boton grande" disabled={!texto}><Icon name="check" size={20} /> Responder</button>
        {flash && <p key={flash.k} className={`rto-veredicto ${flash.bien ? 'bien' : 'mal'}`}>{flash.bien ? '¡Bien!' : `No: era ${flash.res}`}</p>}
      </form>
    </div>
  );
}
