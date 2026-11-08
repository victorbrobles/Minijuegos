// client/src/games/Trinchera/motor.js
// Reglas de «Trinchera 1914»: del 25 de noviembre al 25 de diciembre de 1914.
import CARTAS, { NAVIDAD } from './cartas.js';

export const DIAS = 30; // días hasta Nochebuena; el 31 es Navidad
export const MAXIMO = 10;
export const INICIAL = 6;
export const CADA_RACION = 4; // cada 4 días se consume una ración extra de comida

const barajar = (l) => {
  const a = [...l];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};

export function nuevoEstado() {
  return {
    dia: 1,
    rec: { m: INICIAL, c: INICIAL, u: INICIAL, s: INICIAL },
    mazo: barajar(CARTAS.filter((c) => !c.requiere)),
    pendientes: [], // { carta, dia }
    marcas: [],
    carta: null,
    fin: null, // { tipo: 'derrota', recurso } | { tipo: 'navidad' }
    racion: false
  };
}

/** Saca la carta del día (pendientes encadenadas primero si toca). */
export function robar(estado) {
  if (estado.dia > DIAS) return { ...estado, carta: NAVIDAD };
  const idx = estado.pendientes.findIndex((p) => p.dia <= estado.dia);
  if (idx >= 0) {
    const pendientes = [...estado.pendientes];
    const [p] = pendientes.splice(idx, 1);
    return { ...estado, pendientes, carta: p.carta };
  }
  let mazo = estado.mazo;
  if (!mazo.length) mazo = barajar(CARTAS.filter((c) => !c.requiere));
  return { ...estado, mazo: mazo.slice(1), carta: mazo[0] };
}

export const fechaDe = (dia) => {
  const d = new Date(1914, 10, 24 + dia);
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
};

/** Aplica la opción 'a' o 'b' de la carta actual y avanza un día. */
export function decidir(estado, opcion) {
  const carta = estado.carta;
  if (carta === NAVIDAD) return { ...estado, fin: { tipo: 'navidad', opcion } };
  const op = carta[opcion];
  const rec = { ...estado.rec };
  Object.entries(op.ef).forEach(([k, v]) => { rec[k] = Math.max(0, Math.min(MAXIMO, rec[k] + v)); });
  let { marcas, pendientes } = estado;
  if (op.activa && !marcas.includes(op.activa)) {
    marcas = [...marcas, op.activa];
    const sigue = CARTAS.find((c) => c.requiere === op.activa);
    if (sigue) pendientes = [...pendientes, { carta: sigue, dia: estado.dia + 2 + Math.floor(Math.random() * 3) }];
  }
  const dia = estado.dia + 1;
  const racion = dia % CADA_RACION === 0;
  if (racion) rec.c = Math.max(0, rec.c - 1);
  const agotado = Object.keys(rec).find((k) => rec[k] <= 0);
  const siguiente = { ...estado, rec, marcas, pendientes, dia, racion, carta: null };
  if (agotado) return { ...siguiente, fin: { tipo: 'derrota', recurso: agotado } };
  return robar(siguiente);
}
