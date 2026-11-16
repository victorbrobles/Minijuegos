// client/src/lib/metricas.js
// Estadísticas de uso anónimas para el panel del administrador: visitas, juegos abiertos y terminados e instalaciones.
// No se guarda NADA en el móvil (ni cookies ni almacenamiento): el servidor cuenta a cada visitante con una huella que
// cambia cada día y no permite saber quién es. Si falla, no pasa nada.

const enApp = () => { try { return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true; } catch { return false; } };

export function anotar(tipo, juego) {
  if (import.meta.env.MODE === 'test') return;
  try {
    fetch('/api/metricas', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, keepalive: true,
      body: JSON.stringify({ tipo, juego: juego || undefined, app: enApp() })
    }).catch(() => {});
  } catch { /* sin red */ }
}

/** Al cargar la web: una visita (el servidor la cuenta una vez al día) y aviso si se instala como app. */
export function iniciarMetricas() {
  // Versiones anteriores guardaban un identificador en el navegador: se borra
  try { localStorage.removeItem('minijuegos_visitante'); } catch { /* nada */ }
  anotar('visita');
  window.addEventListener('appinstalled', () => anotar('instalada'));
}
