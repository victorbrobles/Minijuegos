export const pt = (id, nombre, alias, pistas) => ({
  id,
  nombre,
  alias: Array.isArray(alias) ? alias : [alias],
  pistas // Array de 10 pistas de peor a mejor
});