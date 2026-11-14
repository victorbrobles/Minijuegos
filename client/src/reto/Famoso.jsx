// client/src/reto/Famoso.jsx — reto «¿Quién es?»: preguntas de sí o no para llegar al famoso elegido
import React, { useState } from 'react';
import Icon from '../components/Icon.jsx';

const CAMPO = { deporte: '🏅', musica: '🎵', cine: '🎬', ciencia: '🔬', literatura: '📚', arte: '🎨', historia: '📜' };

export default function Famoso({ datos, onFin }) {
  const { candidatos, preguntas, maxPreguntas, objetivo } = datos;
  const [hechas, setHechas] = useState([]); // [{ id, texto, si }]
  const [vivos, setVivos] = useState(() => candidatos.map((_, i) => i));
  const [elegido, setElegido] = useState(null);
  const quedan = maxPreguntas - hechas.length;
  const preguntar = (q) => {
    if (quedan <= 0 || hechas.some((h) => h.id === q.id)) return;
    const si = q.si.includes(objetivo);
    setHechas((h) => [...h, { id: q.id, texto: q.texto, si }]);
    setVivos((v) => v.filter((i) => q.si.includes(i) === si));
  };
  const señalar = (i) => {
    if (elegido != null) return;
    setElegido(i);
    setTimeout(() => onFin(i === objetivo, hechas.length, i === objetivo ? `Acertado con ${hechas.length} preguntas` : `Era ${candidatos[objetivo].nombre}`), 1200);
  };
  return (
    <div className="rto-juego">
      <div className="rto-progreso"><span>Preguntas: {hechas.length} de {maxPreguntas}</span><span>Quedan {vivos.length} posibles</span></div>
      <div className="uj-tarjeta rto-famoso-preguntas">
        <p className="uj-etiqueta">{quedan > 0 ? 'Pregunta (sí o no)' : 'Ya no quedan preguntas: señala al famoso'}</p>
        <div className="rto-chips">
          {preguntas.map((q) => {
            const h = hechas.find((x) => x.id === q.id);
            return (
              <button key={q.id} type="button" className={`rto-chip${h ? (h.si ? ' si' : ' no') : ''}`} disabled={Boolean(h) || quedan <= 0 || elegido != null} onClick={() => preguntar(q)}>
                {q.texto}{h && <b>{h.si ? ' Sí' : ' No'}</b>}
              </button>
            );
          })}
        </div>
      </div>
      <div className="uj-tarjeta">
        <p className="uj-etiqueta">Famosos · toca uno para señalarlo (solo una vez)</p>
        <div className="rto-famosos">
          {candidatos.map((c, i) => [c, i]).sort((a, b) => (vivos.includes(a[1]) ? 0 : 1) - (vivos.includes(b[1]) ? 0 : 1) || a[1] - b[1]).map(([c, i]) => {
            const fuera = !vivos.includes(i);
            const clase = elegido == null ? (fuera ? ' fuera' : '') : i === objetivo ? ' bien' : i === elegido ? ' mal' : ' fuera';
            return (
              <button key={c.nombre} type="button" className={`rto-famoso${clase}`} disabled={elegido != null || fuera} onClick={() => señalar(i)}>
                <span>{CAMPO[c.campo]}</span>{c.nombre}
              </button>
            );
          })}
        </div>
      </div>
      {elegido != null && <p className={`rto-estado`}>{elegido === objetivo ? '🎉 ¡Era esa persona!' : `❌ Era ${candidatos[objetivo].nombre}`}</p>}
      {elegido == null && vivos.length === 1 && <button type="button" className="uj-boton grande" onClick={() => señalar(vivos[0])}><Icon name="check" size={20} /> ¡Es {candidatos[vivos[0]].nombre}!</button>}
    </div>
  );
}
