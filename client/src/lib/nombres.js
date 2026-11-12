// client/src/lib/nombres.js
// Nombres de los jugadores en los modos de un dispositivo: todos obligatorios y sin repetir.

const texto = (x) => String(x && typeof x === 'object' ? x.nombre ?? '' : x ?? '').trim();

/** Mensaje de error si falta algún nombre o hay repetidos; null si están bien. */
export function errorNombres(lista = []) {
  const n = lista.map(texto);
  if (n.some((x) => !x)) return 'Escribe el nombre de todos los jugadores.';
  if (new Set(n.map((x) => x.toLowerCase())).size !== n.length) return 'Hay nombres repetidos.';
  return null;
}

/** Igual que errorNombres, pero además muestra el aviso en pantalla. Devuelve true si NO se puede empezar. */
export function avisarNombres(lista = []) {
  const e = errorNombres(lista);
  if (!e || typeof document === 'undefined') return Boolean(e);
  document.querySelectorAll('.qq-aviso-nombres').forEach((x) => x.remove());
  const div = document.createElement('div');
  div.className = 'qq-aviso-nombres';
  div.setAttribute('role', 'alert');
  div.textContent = `✍️ ${e}`;
  Object.assign(div.style, {
    position: 'fixed', left: '50%', bottom: '24px', transform: 'translateX(-50%)', zIndex: 9999,
    maxWidth: 'calc(100% - 32px)', padding: '0.8rem 1.1rem', borderRadius: '14px', background: '#b91c1c',
    color: '#fff', fontWeight: '800', fontSize: '0.95rem', boxShadow: '0 10px 30px rgba(0,0,0,0.35)', textAlign: 'center'
  });
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 2800);
  return true;
}
