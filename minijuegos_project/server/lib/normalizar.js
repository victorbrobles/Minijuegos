// Comparación tolerante de respuestas: ignora mayúsculas, tildes, signos de
// puntuación y palabras de relleno, y admite pequeñas erratas en respuestas largas.

const RELLENO = new Set([
  'de', 'del', 'la', 'las', 'el', 'los', 'lo', 'y', 'e', 'en', 'a', 'al', 'para', 'por',
  'un', 'una', 'of', 'the', 'and', 'for'
]);

export function normalizar(texto) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quita tildes
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')     // signos -> espacios
    .split(' ')
    .filter((p) => p && !RELLENO.has(p))
    .join(' ');
}

function distancia(a, b) {
  const prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = prev[j];
      prev[j] = Math.min(
        prev[j] + 1,
        prev[j - 1] + 1,
        diag + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
      diag = tmp;
    }
  }
  return prev[b.length];
}

export function esCorrecta(intento, validas) {
  const a = normalizar(intento);
  if (!a) return false;
  return validas.some((v) => {
    const b = normalizar(v);
    if (a === b) return true;
    const tolerancia = b.length >= 20 ? 2 : b.length >= 8 ? 1 : 0;
    return tolerancia > 0 && distancia(a, b) <= tolerancia;
  });
}
