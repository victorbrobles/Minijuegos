// client/src/reto/Varios.jsx — retos «Afina el número» (estimación) y «El once» (marcar a los titulares)
import React, { useState } from 'react';
import Icon from '../components/Icon.jsx';

const fmt = (n) => Number(n).toLocaleString('es-ES');

export function Aproximar({ datos, onFin }) {
  const { preguntas, margen, umbral } = datos;
  const [k, setK] = useState(0);
  const [texto, setTexto] = useState('');
  const [res, setRes] = useState(null); // { valor, ok }
  const [bien, setBien] = useState(0);
  const q = preguntas[k];
  const responder = (e) => {
    e.preventDefault();
    const v = Number(String(texto).replace(/\./g, '').replace(',', '.'));
    if (!Number.isFinite(v)) return;
    const ok = Math.abs(v - q.respuesta) <= Math.abs(q.respuesta) * margen;
    setRes({ valor: v, ok }); if (ok) setBien((b) => b + 1);
  };
  const seguir = () => {
    if (k + 1 >= preguntas.length) { onFin(bien >= umbral, bien, `${bien} de ${preguntas.length} afinadas`); return; }
    setK(k + 1); setTexto(''); setRes(null);
  };
  return (
    <div className="rto-juego">
      <div className="rto-progreso"><span>Pregunta {k + 1} de {preguntas.length}</span><span>✅ {bien} · necesitas {umbral}</span></div>
      <form className="uj-tarjeta rto-pregunta" onSubmit={responder}>
        <span className="rto-etiqueta">🎯 Vale a menos de un {Math.round(margen * 100)} %</span>
        <h2>{q.p}</h2>
        {!res ? (
          <>
            <input className="rto-input" inputMode="decimal" value={texto} onChange={(e) => setTexto(e.target.value.replace(/[^\d.,-]/g, ''))} placeholder="Tu número" autoFocus />
            <button type="submit" className="uj-boton grande" style={{ marginTop: '0.6rem', width: '100%' }} disabled={!texto}><Icon name="check" size={20} /> Responder</button>
          </>
        ) : (
          <p className={`rto-veredicto ${res.ok ? 'bien' : 'mal'}`}>{res.ok ? '¡Afinado!' : 'Demasiado lejos.'} La respuesta era <b>{fmt(q.respuesta)}</b> (dijiste {fmt(res.valor)}).</p>
        )}
      </form>
      {res && <button type="button" className="uj-boton grande" onClick={seguir}>{k + 1 >= preguntas.length ? <><Icon name="flagFinish" size={20} /> Ver resultado</> : <><Icon name="forward" size={20} /> Siguiente</>}</button>}
    </div>
  );
}

export function Seleccionar({ datos, onFin }) {
  const { titulo, nombres, correctos, umbral } = datos;
  const [marcados, setMarcados] = useState([]);
  const [corregido, setCorregido] = useState(false);
  const tocar = (n) => { if (!corregido) setMarcados((m) => (m.includes(n) ? m.filter((x) => x !== n) : m.length < correctos.length ? [...m, n] : m)); };
  const aciertos = marcados.filter((n) => correctos.includes(n)).length;
  const corregir = () => { setCorregido(true); setTimeout(() => onFin(aciertos >= umbral, aciertos, `${aciertos} de ${correctos.length} titulares`), 2200); };
  return (
    <div className="rto-juego">
      <div className="rto-progreso"><span>Marcados: {marcados.length} de {correctos.length}</span><span>Necesitas {umbral} bien</span></div>
      <div className="uj-tarjeta rto-pregunta">
        <span className="rto-etiqueta">📝 Marca a los 11 titulares</span>
        <h2>{titulo}</h2>
        <div className="rto-chips">
          {nombres.map((n) => {
            const m = marcados.includes(n);
            const clase = corregido ? (correctos.includes(n) ? (m ? ' si' : ' falta') : m ? ' no' : '') : m ? ' marcado' : '';
            return <button key={n} type="button" className={`rto-chip${clase}`} onClick={() => tocar(n)} disabled={corregido}>{n}</button>;
          })}
        </div>
        {corregido && <p className={`rto-veredicto ${aciertos >= umbral ? 'bien' : 'mal'}`}>{aciertos} de {correctos.length} titulares bien.</p>}
      </div>
      {!corregido && <button type="button" className="uj-boton grande" disabled={marcados.length !== correctos.length} onClick={corregir}><Icon name="check" size={20} /> Corregir</button>}
    </div>
  );
}
