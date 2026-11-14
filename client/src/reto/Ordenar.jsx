// client/src/reto/Ordenar.jsx — reto diario: dos series de seis elementos para ordenar
import React, { useState } from 'react';
import Icon from '../components/Icon.jsx';

const solucion = (s) => s.elementos.map((e, i) => [e.valor, i]).sort((a, b) => (s.desc ? b[0] - a[0] : a[0] - b[0])).map(([, i]) => i);
const valorTexto = (s, v) => (/año/.test(s.unidad) ? (v < 0 ? `${-v} a. C.` : String(v)) : `${v.toLocaleString('es-ES')} ${s.unidad}`);

export default function Ordenar({ datos, onFin }) {
  const { series, umbral } = datos;
  const [k, setK] = useState(0);
  const [orden, setOrden] = useState([]);
  const [hechas, setHechas] = useState([]); // aciertos por serie
  const [corregida, setCorregida] = useState(false);
  const s = series[k];
  const sol = solucion(s);
  const tocar = (i) => { if (!corregida) setOrden((o) => (o.includes(i) ? o.filter((x) => x !== i) : [...o, i])); };
  const corregir = () => {
    const a = sol.filter((x, p) => orden[p] === x).length;
    setHechas((h) => [...h, a]); setCorregida(true);
  };
  const seguir = () => {
    if (k + 1 >= series.length) {
      const total = hechas.reduce((x, y) => x + y, 0);
      onFin(total >= umbral, total, `${total} de ${series.length * 6} posiciones`);
      return;
    }
    setK(k + 1); setOrden([]); setCorregida(false);
  };
  const total = hechas.reduce((x, y) => x + y, 0);
  return (
    <div className="rto-juego">
      <div className="rto-progreso"><span>Serie {k + 1} de {series.length}</span><span>✅ {total} posiciones · necesitas {umbral}</span></div>
      <div className="uj-tarjeta rto-pregunta">
        <span className="rto-etiqueta">{s.emoji} {s.titulo}</span>
        <h2>{s.criterio}</h2>
        <p className="rto-ayuda">Toca los elementos en orden: primero el que va arriba. Toca otra vez para quitarlo.</p>
        <div className="rto-opciones">
          {(corregida ? sol : s.elementos.map((_, i) => i)).map((i, p) => {
            const pos = orden.indexOf(i);
            const clase = corregida ? (orden[p] === i ? ' bien' : ' mal') : pos >= 0 ? ' puesta' : '';
            return (
              <button key={i} type="button" className={`rto-opcion${clase}`} onClick={() => tocar(i)} disabled={corregida}>
                <i>{corregida ? p + 1 : pos >= 0 ? pos + 1 : ''}</i>
                <span>{s.elementos[i].nombre}</span>
                {corregida && <small>{valorTexto(s, s.elementos[i].valor)}</small>}
              </button>
            );
          })}
        </div>
        {corregida && <p className="rto-veredicto">{hechas[k]} de 6 en su sitio. {orden.length ? '' : ''}</p>}
      </div>
      {!corregida ? (
        <div className="rto-fila">
          <button type="button" className="uj-boton secundario" disabled={!orden.length} onClick={() => setOrden([])}><Icon name="refresh" size={16} /> Borrar</button>
          <button type="button" className="uj-boton grande" disabled={orden.length !== 6} onClick={corregir}><Icon name="check" size={20} /> Corregir</button>
        </div>
      ) : (
        <button type="button" className="uj-boton grande" onClick={seguir}>
          {k + 1 >= series.length ? <><Icon name="flagFinish" size={20} /> Ver resultado</> : <><Icon name="forward" size={20} /> Siguiente serie</>}
        </button>
      )}
    </div>
  );
}
