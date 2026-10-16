// Pregunta tipo test con 4 opciones (correcta es el índice 0, 1, 2 o 3)
export const q = (id, pregunta, opciones, correcta) => ({
  id,
  pregunta,
  opciones,
  correcta
});

// Pregunta especial difícil sin opciones (con respuesta canónica y alias)
export const qEsp = (id, pregunta, respuesta, alias = []) => ({
  id,
  pregunta,
  respuesta,
  alias: Array.isArray(alias) ? [respuesta, ...alias] : [respuesta, alias]
});