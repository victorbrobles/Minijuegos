// client/src/lib/soporte.js
// Lo que conecta la web con el panel de administración:
//  · captura automática de errores de JavaScript (se envían agrupados al servidor, sin datos personales);
//  · enviar un aviso de fallo o una sugerencia desde un juego;
//  · datos de la portada que el administrador cambia sin tocar código (anuncio, Top del Creador, juegos en mantenimiento).
import { useEffect, useState } from 'react';
import { nombreCompleto } from './identidad.js';

const juegoActual = () => (/^\/juego\/([^/?#]+)/.exec(location.pathname) || [])[1] || '';

/* ───────── Errores automáticos ───────── */
let enviados = 0;
const vistos = new Set();
function mandarError(mensaje, pila) {
  const m = String(mensaje || '').slice(0, 500);
  if (!m || enviados >= 15) return; // como mucho 15 por visita
  // Ruido que no es nuestro: extensiones del navegador, scripts de terceros y avisos sin información
  if (/^Script error\.?$|ResizeObserver loop|extension:\/\/|Non-Error promise rejection/i.test(m + String(pila))) return;
  const clave = `${juegoActual()}|${m}`;
  if (vistos.has(clave)) return; // el mismo error en la misma visita solo una vez
  vistos.add(clave); enviados += 1;
  const datos = JSON.stringify({ mensaje: m, pila: String(pila || '').slice(0, 3000), juego: juegoActual(), ruta: location.pathname });
  try {
    if (navigator.sendBeacon) navigator.sendBeacon('/api/soporte/error', new Blob([datos], { type: 'application/json' }));
    else fetch('/api/soporte/error', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: datos, keepalive: true }).catch(() => {});
  } catch { /* nada */ }
}
export function instalarCapturaErrores() {
  if (typeof window === 'undefined' || !import.meta.env.PROD) return;
  window.addEventListener('error', (e) => {
    if (e.target && e.target !== window) return; // una imagen que no carga no es un error de código
    mandarError(e.message || e.error?.message, e.error?.stack);
  });
  window.addEventListener('unhandledrejection', (e) => {
    const r = e.reason;
    if (r?.name === 'AbortError' || /Failed to fetch|NetworkError|Load failed/i.test(String(r?.message || r))) return; // sin red
    mandarError(r?.message || String(r), r?.stack);
  });
}
/** Para errores capturados a mano (p. ej. en un límite de errores de React). */
export const anotarError = (error) => mandarError(error?.message || String(error), error?.stack);

/* ───────── Avisos de fallos y sugerencias ───────── */
export async function enviarReporte({ juego, tipo, mensaje }) {
  const r = await fetch('/api/soporte/reporte', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ juego: juego || juegoActual(), tipo, mensaje, ruta: location.pathname, quien: nombreCompleto() })
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || 'No se pudo enviar. Inténtalo de nuevo.');
  return true;
}

/* ───────── Datos de la portada ───────── */
let portada = null; let pidiendo = null;
const oyentes = new Set();
export function recargarPortada() {
  pidiendo = fetch('/api/soporte/portada').then((r) => (r.ok ? r.json() : null)).then((d) => {
    if (d?.success) { portada = d; oyentes.forEach((f) => f(d)); }
    return portada;
  }).catch(() => portada).finally(() => { pidiendo = null; });
  return pidiendo;
}
/** { anuncio, top, mantenimiento, nuevos } (null mientras carga o sin servidor). */
export function usePortada() {
  const [d, setD] = useState(portada);
  useEffect(() => {
    oyentes.add(setD);
    if (!portada && !pidiendo) recargarPortada();
    return () => oyentes.delete(setD);
  }, []);
  return d;
}

/* ───────── Modo pruebas: abrir un «jugador de prueba» del panel en esta pestaña ───────── */
/** Si la dirección trae ?probar=CODIGO.TOKEN, entra en esa sala como el jugador de prueba (antes de montar el juego). */
export function capturarPrueba(juego) {
  try {
    const p = new URLSearchParams(location.search).get('probar');
    if (!p) return false;
    const [code, token] = p.split('.');
    if (!code || !token) return false;
    sessionStorage.setItem(`${juego}_online_session`, JSON.stringify({ code, token }));
    const u = new URL(location.href); u.searchParams.delete('probar');
    history.replaceState(history.state, '', u.pathname + u.search + u.hash);
    return true;
  } catch { return false; }
}
