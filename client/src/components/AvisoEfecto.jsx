// client/src/components/AvisoEfecto.jsx
// Ventana con el efecto de una carta de acción sobre ti (Suma Cero, Lleva la cuenta, Colecciona con cabeza):
// quién te ha atacado, qué ha pasado y qué cartas ganas y pierdes. Se muestran de uno en uno.
import React from 'react';

/** avisos: [{ n, e, titulo, texto, gana?, pierde?, ataque? }] · onVisto(n) marca como leídos hasta n. */
export default function AvisoEfecto({ avisos, onVisto, nombre }) {
  const a = avisos?.[0];
  if (!a) return null;
  const quedan = avisos.length - 1;
  return (
    <div className="rg-modal-fondo afx-fondo" role="dialog" aria-modal="true">
      <div className={`rg-modal afx-modal${a.ataque ? ' ataque' : ''}`}>
        {nombre && <p className="afx-para">Para {nombre}</p>}
        <div className="afx-icono" aria-hidden="true">{a.e}</div>
        <h3>{a.titulo}</h3>
        {a.texto && <p className="afx-texto">{a.texto}</p>}
        {(a.gana?.length > 0 || a.pierde?.length > 0) && (
          <div className="afx-cambios">
            {a.gana?.length > 0 && (
              <div className="afx-col gana">
                <span>Ganas</span>
                <div>{a.gana.map((x, i) => <b key={i}>{x}</b>)}</div>
              </div>
            )}
            {a.pierde?.length > 0 && (
              <div className="afx-col pierde">
                <span>Pierdes</span>
                <div>{a.pierde.map((x, i) => <b key={i}>{x}</b>)}</div>
              </div>
            )}
          </div>
        )}
        <button type="button" className="big full afx-boton" onClick={() => onVisto(a.n)}>
          {quedan > 0 ? `Entendido (${quedan} más)` : 'Entendido'}
        </button>
      </div>
    </div>
  );
}
