// client/src/games/Ovejas/motor.js
// Genera la manada de cada ronda: qué animales pasan, por qué carril, a qué velocidad y cuándo.
export const ANIMALES = {
  oveja: { cuantos: 'Cuántas', emoji: '🐑', nombre: 'ovejas' },
  cerdo: { cuantos: 'Cuántos', emoji: '🐖', nombre: 'cerdos' },
  cabra: { cuantos: 'Cuántas', emoji: '🐐', nombre: 'cabras' },
  vaca: { cuantos: 'Cuántas', emoji: '🐄', nombre: 'vacas' },
  gallina: { cuantos: 'Cuántas', emoji: '🐓', nombre: 'gallinas' },
  pato: { cuantos: 'Cuántos', emoji: '🦆', nombre: 'patos' }
};

const azar = (a, b) => a + Math.random() * (b - a);
const entero = (a, b) => Math.floor(azar(a, b + 1));
const barajar = (l) => [...l].sort(() => Math.random() - 0.5);

/** Configuración del nivel n (1, 2, 3…) */
export function nivel(n) {
  return {
    tipos: n <= 1 ? ['oveja'] : n <= 3 ? ['oveja', 'cerdo'] : n <= 5 ? ['oveja', 'cerdo', 'cabra'] : ['oveja', 'cerdo', 'cabra', 'vaca', 'gallina', 'pato'].slice(0, Math.min(6, 3 + Math.floor((n - 4) / 2))),
    total: Math.min(5 + n * 2, 26),
    velocidad: Math.max(1.3, 3.2 - n * 0.15), // segundos en cruzar la pantalla
    ventana: Math.min(2.2 + n * 0.25, 4.5), // segundos durante los que van saliendo
    arbustos: n >= 3 ? Math.min(1 + Math.floor((n - 3) / 2), 3) : 0,
    ambosSentidos: n >= 5
  };
}

/** Devuelve { animales:[{tipo, carril, retraso, duracion, sentido}], pregunta, respuesta, opciones, duracionTotal, arbustos } */
export function generarRonda(n) {
  const c = nivel(n);
  const animales = [];
  for (let i = 0; i < c.total; i++) {
    const tipo = i < 2 ? 'oveja' : c.tipos[entero(0, c.tipos.length - 1)];
    animales.push({
      id: i,
      tipo,
      carril: entero(0, 4),
      retraso: azar(0, c.ventana),
      duracion: c.velocidad * azar(0.8, 1.35),
      sentido: c.ambosSentidos && Math.random() < 0.4 ? -1 : 1
    });
  }
  const presentes = [...new Set(animales.map((a) => a.tipo))];
  const pregunta = n <= 1 ? 'oveja' : presentes[entero(0, presentes.length - 1)];
  const respuesta = animales.filter((a) => a.tipo === pregunta).length;
  const opciones = new Set([respuesta]);
  while (opciones.size < 4) {
    const o = respuesta + entero(-3, 3);
    if (o >= 0) opciones.add(o);
  }
  const arbustos = Array.from({ length: c.arbustos }, (_, i) => ({ x: 18 + i * 30 + azar(-6, 6), carril: entero(0, 4) }));
  const duracionTotal = Math.max(...animales.map((a) => a.retraso + a.duracion)) + 0.2;
  return { animales: barajar(animales), pregunta, respuesta, opciones: [...opciones].sort((a, b) => a - b), duracionTotal, arbustos };
}
