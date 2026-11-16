// client/src/lib/ocultos.js
// Juegos ocultos: solo los ve el administrador o quien está con él en la sala de un grupo en ese momento.
// El servidor decide (GET /api/ocultos); aquí se le dice quién pregunta y se ocultan los juegos en la web.
import { useEffect, useSyncExternalStore } from 'react';
import { adminHeaders, useAdmin } from './admin.js';
import { nombreCompleto } from './identidad.js';

export const JUEGOS_OCULTOS = new Set(['cancion', 'adivina', 'rasgos', 'logos']);
export const esOculto = (id) => JUEGOS_OCULTOS.has(id);

/** Añade a las peticiones a nuestra /api quién eres (X-Jugador) y, si lo eres, el token de administrador. */
export function conCabeceras(entrada, opciones) {
  try {
    if (typeof entrada !== 'string') return opciones;
    const url = new URL(entrada, window.location.origin);
    if (url.origin !== window.location.origin || !url.pathname.startsWith('/api/')) return opciones;
    const h = new Headers(opciones?.headers || {});
    const yo = nombreCompleto();
    if (yo && !h.has('X-Jugador')) h.set('X-Jugador', encodeURIComponent(yo));
    Object.entries(adminHeaders()).forEach(([k, v]) => { if (!h.has(k)) h.set(k, v); });
    return { ...(opciones || {}), headers: h };
  } catch { return opciones; }
}

// ---------------------------------------------------------------- ¿Tengo acceso por estar con el admin en un grupo?
const CADA_MS = 20000;
let permitido = false;
let comprobado = false; // ya se ha preguntado al servidor al menos una vez
let temporizador = null;
let usuarios = 0;
const oyentes = new Set();
const enSalaDeGrupo = () => { try { return Boolean(JSON.parse(localStorage.getItem('minijuegos_sala_grupo'))?.codigo); } catch { return false; } };
async function consultar() {
  let nuevo = false;
  if (enSalaDeGrupo()) try { const r = await fetch('/api/ocultos'); nuevo = r.ok && Boolean((await r.json()).permitido); } catch { nuevo = permitido; }
  if (nuevo !== permitido || !comprobado) { permitido = nuevo; comprobado = true; oyentes.forEach((f) => f()); }
}
function suscribir(f) {
  oyentes.add(f);
  if (++usuarios === 1) { consultar(); temporizador = setInterval(consultar, CADA_MS); }
  return () => { oyentes.delete(f); if (--usuarios === 0) { clearInterval(temporizador); temporizador = null; } };
}

/** true si puedes ver los juegos ocultos ahora mismo. */
export function useVerOcultos() {
  const admin = useAdmin();
  const porGrupo = useSyncExternalStore(suscribir, () => permitido);
  useEffect(() => { consultar(); }, [admin]);
  return admin || porGrupo;
}

/** Para la página del juego: si aún no se sabe (primera consulta en marcha), «comprobando». */
export function useAccesoOculto() {
  const ver = useVerOcultos();
  const listo = useSyncExternalStore(suscribir, () => comprobado);
  return ver ? 'si' : listo ? 'no' : 'comprobando';
}
