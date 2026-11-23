// client/src/games/comun/verJugadaFinal.js
// Cuando una jugada termina la partida (el gol de la victoria, el disparo que acaba con el último tanque, la piedra
// que decide, la pieza que tumba la torre…), la pantalla final esperaba a nadie: salía al instante y no se veía la
// jugada. Este hook mantiene la partida en pantalla lo que dura la animación de esa última jugada (más un respiro).
import { useEffect, useRef, useState } from 'react';

/** Milisegundos que hay que seguir enseñando la partida tras llegar a 'fin' (0 si no hace falta). */
export function duracionJugadaFinal(v) {
  if (!v) return 0;
  if (v.ultimo && !v.ultimo.salto && Number(v.ultimo.ms) > 0) return Number(v.ultimo.ms) + 1800;
  if (v.ultima?.derribo) return 4500; // Torre: la pieza que la tumba
  return 0;
}

export function useVerJugadaFinal(v) {
  const [, setN] = useState(0);
  const hasta = useRef(0); const visto = useRef(false);
  const fin = v?.fase === 'fin';
  useEffect(() => {
    if (!fin) { visto.current = false; hasta.current = 0; return undefined; }
    if (!visto.current) { visto.current = true; const ms = duracionJugadaFinal(v); hasta.current = ms ? Date.now() + ms : 0; }
    const queda = hasta.current - Date.now();
    if (queda <= 0) return undefined;
    const t = setTimeout(() => setN((x) => x + 1), queda + 30);
    return () => clearTimeout(t);
  }, [fin]); // eslint-disable-line react-hooks/exhaustive-deps
  return fin && (Date.now() < hasta.current || (!visto.current && duracionJugadaFinal(v) > 0));
}
