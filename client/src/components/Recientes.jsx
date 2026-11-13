// client/src/components/Recientes.jsx
// Chips con los 10 últimos jugadores (de cualquier juego) para rellenar nombres sin escribirlos.
import React from 'react';
import Icon from './Icon.jsx';
import { useRecientes } from '../lib/registros.js';
import { NombreTag } from './Identidad.jsx';
import { partirNombre, recordarEtiqueta } from '../lib/identidad.js';

const texto = (x) => String(x && typeof x === 'object' ? x.nombre ?? '' : x ?? '').trim();

/** Pone `nombre` en el primer hueco vacío de la lista (de textos o de objetos con `nombre`). */
export function ponerReciente(lista, nombre) {
  const i = lista.findIndex((x) => !texto(x));
  if (i < 0) return lista;
  return lista.map((x, k) => (k !== i ? x : typeof x === 'object' && x !== null ? { ...x, nombre } : nombre));
}

/** usados: nombres ya escritos (no se repiten). onPoner(nombre). */
export function RecientesJugadores({ usados = [], onPoner }) {
  const recientes = useRecientes();
  const ya = new Set(usados.map((x) => texto(x).toLowerCase()));
  // En la partida se pone solo el nombre; la etiqueta se recuerda para guardar los resultados
  const lista = recientes.filter((n) => !ya.has(partirNombre(n).nombre.toLowerCase()));
  const poner = (n) => { recordarEtiqueta(n); onPoner(partirNombre(n).nombre); };
  const hayHueco = usados.some((x) => !texto(x));
  if (!lista.length) return null;
  return (
    <div className="qq-recientes">
      <span className="qq-label-destacado"><Icon name="clock" size={14} /> Jugadores recientes</span>
      <div className="qq-recientes-chips">
        {lista.map((n) => (
          <button key={n} type="button" className="qq-reciente" disabled={!hayHueco} onClick={() => poner(n)} title={hayHueco ? `Añadir a ${n}` : 'No quedan huecos: añade un jugador más'}>
            <NombreTag texto={n} />
          </button>
        ))}
      </div>
      {!hayHueco && <small className="qq-recientes-nota">Todos los huecos tienen nombre. Añade un jugador para poner a otro.</small>}
    </div>
  );
}
