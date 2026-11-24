// client/src/games/Escondite/engine.js
// «El Escondite»: sale una categoría con pocas respuestas posibles (de 5 a 11). Cada ronda un jugador es el
// ESCONDIDO: primero elige en secreto dónde se esconde (puede cambiar la categoría hasta 3 veces antes de
// responder) y su respuesta se da por buena tal cual. Después los demás intentan adivinar dónde se ha escondido.
//  · Si su respuesta está entre las posibles: si alguien la adivina, suman los que la adivinan; si nadie, suma él.
//  · Si su respuesta NO está entre las posibles: él no suma y todos los demás suman 1 (premia conocer la categoría).
// No se enseñan las respuestas posibles hasta el final de la ronda.
// Motor puro: lo usan el servidor (server/routes/escondite.js) y el modo un dispositivo.
import { crearMotor, buscarOpcion, nombreOpcion, compacto, distancia } from '../comun/simultaneo.js';

export const SEGUNDOS = 60;
export const CAMBIOS = 3;

/** Mínimo de respuestas posibles de la categoría según los jugadores (con muchos, nada de categorías de 5). */
export const minimoOpciones = (n) => (n >= 11 ? 9 : n >= 9 ? 8 : n >= 7 ? 7 : n >= 5 ? 6 : 5);

const escondidoDe = (p) => {
  const lista = p.jugadores;
  for (let k = 0; k < lista.length; k++) {
    const j = lista[(p.ronda - 1 + k) % lista.length];
    if (!j.fuera) return j.id;
  }
  return lista[0].id;
};
/** La categoría de la ronda (la original o la que haya elegido al cambiar). */
const catDe = (p, item) => p.ext.cat || item;
const sinAlternativas = ({ titulo, emoji, opciones }) => ({ titulo, emoji, opciones });

/** ¿Dicen lo mismo? Misma respuesta de la lista, o el mismo texto (con una errata pequeña) si no está en la lista. */
export function coinciden(a, b) {
  if (!a || !b) return false;
  if (a.i >= 0 && b.i >= 0) return a.i === b.i;
  const x = compacto(a.t); const y = compacto(b.t);
  if (!x || !y) return false;
  return x === y || (Math.min(x.length, y.length) >= 6 && distancia(x, y) <= 1);
}

const M0 = crearMotor({
  segundos: () => SEGUNDOS,
  alEmpezar(p, item) { p.ext.escondido = escondidoDe(p); p.ext.cat = sinAlternativas(item); p.ext.cambios = 0; },
  validar(p, item, id, texto) {
    const esc = p.ext.escondido;
    if (id !== esc && !(esc in p.respuestas)) {
      const n = p.jugadores.find((j) => j.id === esc)?.nombre ?? 'El escondido';
      return { ok: false, error: `Espera: ${n} todavía se está escondiendo.` };
    }
    const t = String(texto ?? '').trim().slice(0, 80);
    if (!t) return { ok: false, error: 'Escribe una respuesta.' };
    return { ok: true, valor: { t, i: buscarOpcion(t, catDe(p, item).opciones) } };
  },
  puntuar(p, item, r) {
    const cat = catDe(p, item);
    const esc = p.ext.escondido;
    const elegida = r[esc];
    const buscadores = p.jugadores.filter((j) => !j.fuera && j.id !== esc).map((j) => j.id);
    const puntos = {}; const aciertos = {};
    let pillado = false; let fueraDeLista = false;
    if (elegida != null) {
      if (elegida.i < 0) {
        // No era una respuesta posible: el escondido no suma y los demás suman todos
        fueraDeLista = true;
        buscadores.forEach((id) => { puntos[id] = 1; aciertos[id] = true; });
      } else {
        buscadores.forEach((id) => { if (coinciden(r[id], elegida)) { puntos[id] = 1; aciertos[id] = true; pillado = true; } });
        if (!pillado) { puntos[esc] = 1; aciertos[esc] = true; }
      }
    }
    const texto = (v) => (v == null ? null : v.i >= 0 ? nombreOpcion(cat.opciones[v.i]) : v.t);
    return {
      puntos, aciertos,
      detalle: {
        escondido: esc, elegida: texto(elegida), fueraDeLista, pillado, sinRespuesta: elegida == null,
        respuestas: Object.fromEntries(Object.entries(r).map(([id, v]) => [id, texto(v)])),
        acertantes: buscadores.filter((id) => elegida && coinciden(r[id], elegida))
      }
    };
  },
  vistaItem(p, item, id, fase) {
    const cat = catDe(p, item);
    const esc = p.ext.escondido;
    const r = p.respuestas[id];
    const quedan = Math.min(CAMBIOS - (p.ext.cambios || 0), (item.alternativas || []).length - (p.ext.cambios || 0));
    return {
      titulo: cat.titulo, emoji: cat.emoji, nOpciones: cat.opciones.length, escondido: esc,
      soyEscondido: id === esc,
      escondidoListo: esc in p.respuestas,
      cambiosQuedan: id === esc && !(esc in p.respuestas) ? Math.max(0, quedan) : 0,
      mia: r == null ? null : r.i >= 0 ? nombreOpcion(cat.opciones[r.i]) : r.t,
      opciones: fase === 'resuelta' ? cat.opciones.map(nombreOpcion) : null
    };
  }
});

/** El escondido cambia la categoría (antes de responder, hasta CAMBIOS veces). */
function cambiar(p, id, ahora = Date.now()) {
  if (p.fase !== 'jugando') return { ok: false, error: 'Ahora no se puede cambiar.' };
  if (id !== p.ext.escondido) return { ok: false, error: 'Solo quien se esconde puede cambiar la categoría.' };
  if (id in p.respuestas) return { ok: false, error: 'Ya te has escondido.' };
  const alt = p.items[p.ronda - 1].alternativas || [];
  const n = p.ext.cambios || 0;
  if (n >= CAMBIOS || n >= alt.length) return { ok: false, error: 'Ya no puedes cambiar más la categoría.' };
  p.ext.cat = sinAlternativas(alt[n]);
  p.ext.cambios = n + 1;
  if (p.hasta) p.hasta = ahora + SEGUNDOS * 1000;
  return { ok: true };
}

export const M = {
  ...M0,
  /** Cuando el escondido responde, los demás tienen su tiempo entero para buscarlo. */
  responder(p, id, valor, ahora = Date.now()) {
    const r = M0.responder(p, id, valor, ahora);
    if (r.ok && id === p.ext.escondido && p.fase === 'jugando' && p.hasta) p.hasta = ahora + SEGUNDOS * 1000;
    return r;
  },
  cambiar,
  /** Acciones propias del juego (además de las comunes): { tipo: 'cambiar' }. */
  accion(p, id, d, ahora = Date.now()) {
    if (d.tipo === 'cambiar') return cambiar(p, id, ahora);
    return null;
  }
};
