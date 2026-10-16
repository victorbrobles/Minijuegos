// server/data/rankings/helper.js
export const rk = (titulo, descripcion, items) => ({
  titulo,
  descripcion,
  elementos: items.map(([posicion, valor, alias, pista]) => ({
    posicion,
    valor,
    alias: Array.isArray(alias) ? alias : [alias],
    pista
  }))
});