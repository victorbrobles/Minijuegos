// client/src/lib/metricas.js
// Estadísticas de uso anónimas para el panel del administrador: visitas, juegos abiertos y terminados e instalaciones.
// Solo se manda un identificador aleatorio de este navegador (sin nombre ni datos personales). Si falla, no pasa nada.
const CLAVE = 'minijuegos_visitante';

export function visitante() {
  try {
    let v = localStorage.getItem(CLAVE);
    if (!v) { v = Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => b.toString(16).padStart(2, '0')).join(''); localStorage.setItem(CLAVE, v); }
    return v;
  } catch { return null; }
}

const enApp = () => { try { return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true; } catch { return false; } };

export function anotar(tipo, juego) {
  const v = visitante();
  if (!v || import.meta.env.MODE === 'test') return;
  try {
    fetch('/api/metricas', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, keepalive: true,
      body: JSON.stringify({ tipo, juego: juego || undefined, visitante: v, app: enApp() })
    }).catch(() => {});
  } catch { /* sin red */ }
}

/** Al cargar la web: una visita (el servidor la cuenta una vez al día) y aviso si se instala como app. */
export function iniciarMetricas() {
  anotar('visita');
  window.addEventListener('appinstalled', () => anotar('instalada'));
}
