// Fisher-Yates: devuelve una copia barajada con todas las permutaciones equiprobables
// (a diferencia de `sort(() => Math.random() - 0.5)`, que da un orden sesgado).
export function barajar(lista) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}
