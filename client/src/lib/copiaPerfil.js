// client/src/lib/copiaPerfil.js
// «Pasar a otro móvil»: copia en el servidor lo que este navegador guarda (tu nombre, favoritos, récords, logros,
// ajustes…) con un código de 6 letras. En el otro móvil se teclea el código y se recupera todo.
const MI_COPIA = 'minijuegos_copia'; // { codigo, clave, fecha } de la copia de este móvil

// Qué se copia: lo de la app y los récords. Lo que es de este móvil o de una partida en curso, no.
const SE_COPIA = (k) => /^(minijuegos|minigames)[-_]/.test(k) || /^siglas-mejor-/.test(k) || k === 'test_velocidad_record';
const NO_SE_COPIA = new Set(['minigames-admin-token', 'minijuegos_visitante', MI_COPIA, 'minijuegos_piloto', 'minijuegos_partida_grupo',
  'minijuegos_sala_grupo', 'minijuegos-sala-viva', 'minijuegos_invitacion', 'minijuegos_sin_conexion']);

export const miCopia = () => { try { return JSON.parse(localStorage.getItem(MI_COPIA) || 'null'); } catch { return null; } };

/** Lo que guarda este navegador y viaja con el perfil (copia o cuenta). */
export function recopilar() {
  const datos = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && SE_COPIA(k) && !NO_SE_COPIA.has(k)) datos[k] = localStorage.getItem(k);
  }
  return datos;
}

/** Pone en este navegador unos datos guardados (de una copia o de la cuenta). */
export function aplicarDatos(datos) {
  const entradas = Object.entries(datos || {}).filter(([k, v]) => SE_COPIA(k) && !NO_SE_COPIA.has(k) && typeof v === 'string');
  entradas.forEach(([k, v]) => { try { localStorage.setItem(k, v); } catch { /* nada */ } });
  return entradas.length;
}

/** Crea (o actualiza) la copia de este móvil y devuelve su código. */
export async function crearCopia() {
  const previa = miCopia();
  const r = await fetch('/api/perfil/copia', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ datos: recopilar(), codigo: previa?.codigo, clave: previa?.clave }) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || !d.codigo) throw new Error(d.error || 'No se pudo guardar la copia. Inténtalo de nuevo.');
  const nueva = { codigo: d.codigo, clave: d.clave, fecha: Date.now() };
  try { localStorage.setItem(MI_COPIA, JSON.stringify(nueva)); } catch { /* nada */ }
  return nueva;
}

/** Trae la copia del código y la pone en este navegador (sustituye lo que hubiera). Devuelve cuántos datos se han recuperado. */
export async function recuperarCopia(codigo) {
  const c = String(codigo || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (c.length !== 6) throw new Error('El código tiene 6 letras o números.');
  const r = await fetch(`/api/perfil/copia/${c}`);
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || 'No se pudo recuperar la copia.');
  return aplicarDatos(d.datos);
}
