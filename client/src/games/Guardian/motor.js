// client/src/games/Guardian/motor.js
// «El Guardián del Puente»: elige qué objetos cruzan para que el peso sea EXACTAMENTE el pedido,
// respetando las peculiaridades del día. Se comprueban las 64 combinaciones para que cada
// reto tenga una única solución válida.

const OBJETOS = [
  { id: 'mochila', nombre: 'Mochila', emoji: '🎒', art: 'la mochila' },
  { id: 'farol', nombre: 'Farol', emoji: '🏮', art: 'el farol' },
  { id: 'cubo', nombre: 'Cubo de agua', emoji: '🪣', art: 'el cubo de agua' },
  { id: 'esponja', nombre: 'Esponja', emoji: '🧽', art: 'la esponja' },
  { id: 'gato', nombre: 'Gato', emoji: '🐈', art: 'el gato' },
  { id: 'pez', nombre: 'Pez', emoji: '🐟', art: 'el pez' },
  { id: 'cuerda', nombre: 'Cuerda', emoji: '🪢', art: 'la cuerda' },
  { id: 'hacha', nombre: 'Hacha', emoji: '🪓', art: 'el hacha' },
  { id: 'calabaza', nombre: 'Calabaza', emoji: '🎃', art: 'la calabaza' },
  { id: 'libro', nombre: 'Libro', emoji: '📕', art: 'el libro' },
  { id: 'tarta', nombre: 'Tarta', emoji: '🎂', art: 'la tarta' },
  { id: 'paraguas', nombre: 'Paraguas', emoji: '☂️', art: 'el paraguas' },
  { id: 'queso', nombre: 'Queso', emoji: '🧀', art: 'el queso' },
  { id: 'raton', nombre: 'Ratón', emoji: '🐭', art: 'el ratón' },
  { id: 'sandia', nombre: 'Sandía', emoji: '🍉', art: 'la sandía' },
  { id: 'guitarra', nombre: 'Guitarra', emoji: '🎸', art: 'la guitarra' },
  { id: 'ancla', nombre: 'Ancla', emoji: '⚓', art: 'el ancla' },
  { id: 'pilas', nombre: 'Pilas', emoji: '🔋', art: 'las pilas' },
  { id: 'linterna', nombre: 'Linterna', emoji: '🔦', art: 'la linterna' },
  { id: 'gallina', nombre: 'Gallina', emoji: '🐔', art: 'la gallina' },
  { id: 'huevos', nombre: 'Huevos', emoji: '🥚', art: 'los huevos' },
  { id: 'tetera', nombre: 'Tetera', emoji: '🫖', art: 'la tetera' }
];

const GLOBO = { id: 'globo', nombre: 'Globo de helio', emoji: '🎈', art: 'el globo', globo: true };

// Parejas con historia: si aparecen juntas, se usa su regla temática
const TEMATICAS = [
  { a: 'gato', b: 'pez', tipo: 'excluye', texto: 'El gato y el pez no pueden cruzar juntos (ya sabes por qué).' },
  { a: 'gato', b: 'raton', tipo: 'excluye', texto: 'El gato y el ratón no pueden cruzar juntos.' },
  { a: 'raton', b: 'queso', tipo: 'anula', texto: 'Si el ratón cruza con el queso, se lo come: el queso no pesa nada.' },
  { a: 'linterna', b: 'pilas', tipo: 'requiere', texto: 'La linterna no sirve sin pilas: si llevas la linterna, lleva las pilas.' },
  { a: 'cubo', b: 'esponja', tipo: 'dobla', texto: 'Si la esponja va con el cubo de agua, se empapa y pesa el doble.' },
  { a: 'cubo', b: 'paraguas', tipo: 'dobla', texto: 'El paraguas se moja con el cubo de agua y pesa el doble.' },
  { a: 'gallina', b: 'huevos', tipo: 'requiere', texto: 'La gallina no se separa de sus huevos: si llevas la gallina, lleva los huevos.' },
  { a: 'hacha', b: 'cuerda', tipo: 'excluye', texto: 'El hacha cortaría la cuerda: no pueden ir juntas.' },
  { a: 'tetera', b: 'cubo', tipo: 'requiere', texto: 'La tetera necesita agua: si llevas la tetera, lleva el cubo.' }
];

const azar = (n) => Math.floor(Math.random() * n);
const barajar = (l) => {
  const a = [...l];
  for (let i = a.length - 1; i > 0; i--) { const j = azar(i + 1); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};

function textoGenerico(r, objetos) {
  const A = objetos[r.a]?.art;
  const B = objetos[r.b]?.art;
  const may = (t) => t.charAt(0).toUpperCase() + t.slice(1);
  switch (r.tipo) {
    case 'excluye': return `${may(A)} y ${B} no pueden cruzar juntos.`;
    case 'requiere': return `Si cruza ${A}, tiene que cruzar también ${B}.`;
    case 'dobla': return `Si ${A} cruza con ${B}, ${B} pesa el doble.`;
    case 'anula': return `Si ${A} cruza con ${B}, ${B} no pesa nada.`;
    case 'max': return `El puente está viejo: como mucho pueden cruzar ${r.n} objetos.`;
    case 'min': return `El barquero cobra por viaje: tienen que cruzar al menos ${r.n} objetos.`;
    default: return '';
  }
}

/** Comprueba una selección (array de booleanos). Devuelve { valida, peso, rota } */
export function evaluar(reto, sel) {
  const { objetos, reglas } = reto;
  const elegidos = sel.filter(Boolean).length;
  let rota = null;
  for (const r of reglas) {
    if (r.tipo === 'excluye' && sel[r.a] && sel[r.b]) rota = r;
    if (r.tipo === 'requiere' && sel[r.a] && !sel[r.b]) rota = r;
    if (r.tipo === 'max' && elegidos > r.n) rota = r;
    if (r.tipo === 'min' && elegidos < r.n) rota = r;
    if (rota) break;
  }
  let peso = 0;
  objetos.forEach((o, i) => {
    if (!sel[i]) return;
    let p = o.peso;
    for (const r of reglas) {
      if (r.b === i && sel[r.a]) {
        if (r.tipo === 'dobla') p *= 2;
        if (r.tipo === 'anula') p = 0;
      }
    }
    peso += p;
  });
  return { valida: !rota && elegidos > 0, peso, rota };
}

const pesoIngenuo = (objetos, sel) => objetos.reduce((s, o, i) => s + (sel[i] ? o.peso : 0), 0);

function reglaAlAzar(n, usadas) {
  const tipos = ['excluye', 'requiere', 'dobla', 'anula'];
  for (let k = 0; k < 30; k++) {
    const tipo = tipos[azar(tipos.length)];
    const a = azar(n); let b; do { b = azar(n); } while (b === a);
    const clave = [Math.min(a, b), Math.max(a, b)].join('-');
    if (usadas.has(clave)) continue;
    usadas.add(clave);
    return { tipo, a, b };
  }
  return null;
}

/** nivel 1.. : más nivel → más reglas, pesos más altos y alguna regla global */
export function generarReto(nivel = 1) {
  const numReglas = Math.min(1 + Math.floor((nivel - 1) / 2), 4);
  for (let intento = 0; intento < 4000; intento++) {
    let base = barajar(OBJETOS).slice(0, 6);
    if (nivel >= 3 && Math.random() < 0.3) base = [...base.slice(0, 5), GLOBO];
    base = barajar(base);
    const maxPeso = nivel < 3 ? 9 : 14;
    const objetos = base.map((o) => ({ ...o, peso: o.globo ? -(1 + azar(3)) : 1 + azar(maxPeso) }));
    const indice = Object.fromEntries(objetos.map((o, i) => [o.id, i]));

    const reglas = [];
    const usadas = new Set();
    // Primero, reglas temáticas que encajen con los objetos que han salido
    for (const t of barajar(TEMATICAS)) {
      if (reglas.length >= numReglas) break;
      if (indice[t.a] == null || indice[t.b] == null) continue;
      const clave = [Math.min(indice[t.a], indice[t.b]), Math.max(indice[t.a], indice[t.b])].join('-');
      if (usadas.has(clave)) continue;
      usadas.add(clave);
      reglas.push({ tipo: t.tipo, a: indice[t.a], b: indice[t.b], texto: t.texto });
    }
    while (reglas.length < numReglas) {
      const r = reglaAlAzar(6, usadas);
      if (!r) break;
      if (objetos[r.b].globo && (r.tipo === 'dobla' || r.tipo === 'anula')) continue;
      reglas.push(r);
    }
    if (nivel >= 4 && Math.random() < 0.45) {
      reglas.push(Math.random() < 0.5 ? { tipo: 'max', n: 3 } : { tipo: 'min', n: 4 });
    }
    reglas.forEach((r) => { if (!r.texto) r.texto = textoGenerico(r, objetos); });

    const reto = { objetos, reglas };
    // Recorre las 63 selecciones no vacías
    const porPeso = new Map();
    const trampas = new Map(); // peso ingenuo de selecciones inválidas o con reglas de peso
    for (let m = 1; m < 64; m++) {
      const sel = Array.from({ length: 6 }, (_, i) => Boolean(m & (1 << i)));
      const ev = evaluar(reto, sel);
      if (ev.valida) {
        if (!porPeso.has(ev.peso)) porPeso.set(ev.peso, []);
        porPeso.get(ev.peso).push(sel);
      }
      const ing = pesoIngenuo(objetos, sel);
      if (!ev.valida || ing !== ev.peso) trampas.set(ing, (trampas.get(ing) || 0) + 1);
    }
    const candidatos = [...porPeso.entries()]
      .filter(([peso, sels]) => sels.length === 1 && peso > 0)
      .map(([peso, sels]) => ({ peso, sel: sels[0], n: sels[0].filter(Boolean).length }))
      .filter((c) => c.n >= (nivel < 2 ? 2 : 3));
    if (!candidatos.length) continue;
    // Preferimos objetivos con trampa (una combinación que suma eso «a lo bruto» pero rompe una regla)
    const conTrampa = candidatos.filter((c) => trampas.has(c.peso));
    const pool = nivel >= 2 && conTrampa.length ? conTrampa : candidatos;
    const elegido = pool[azar(pool.length)];
    return { ...reto, objetivo: elegido.peso, solucion: elegido.sel, segundos: Math.max(40, 75 - nivel * 3) };
  }
  throw new Error('No se pudo generar el reto');
}
