// client/src/components/InfoCarta.jsx
// Botón «i» que va dentro de una carta (Suma Cero, Colecciona con cabeza) y abre una ventana con lo que hace.
// La ventana se pinta en <body> para no quedar dentro del botón de la carta, y no deja pasar el toque a la carta.
import React, { useState } from 'react';
import { createPortal } from 'react-dom';

export default function InfoCarta({ e, nombre, desc, nota }) {
  const [abierta, setAbierta] = useState(false);
  const parar = (ev) => ev.stopPropagation();
  const abrir = (ev) => { ev.stopPropagation(); ev.preventDefault(); setAbierta(true); };
  return (
    <>
      <span className="icx-boton" role="button" tabIndex={0} aria-label={`Qué hace ${nombre}`}
        onClick={abrir} onKeyDown={(ev) => { if (ev.key === 'Enter' || ev.key === ' ') abrir(ev); }}>i</span>
      {abierta && createPortal(
        <div className="rg-modal-fondo icx-fondo" onClick={(ev) => { parar(ev); setAbierta(false); }}>
          <div className="rg-modal icx-modal" onClick={parar} role="dialog" aria-modal="true">
            <div className="icx-icono" aria-hidden="true">{e}</div>
            <h3>{nombre}</h3>
            <p className="icx-texto">{desc}</p>
            {nota && <p className="icx-nota">{nota}</p>}
            <button type="button" className="big full" onClick={(ev) => { parar(ev); setAbierta(false); }}>Entendido</button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
