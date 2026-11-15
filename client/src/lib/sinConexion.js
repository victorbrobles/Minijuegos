// client/src/lib/sinConexion.js
// Modo sin conexión: descarga de una vez el código de todos los juegos (y sus miniaturas) para que el service
// worker los guarde. Así los juegos de un solo móvil se pueden abrir sin internet. Las partidas online, las salas
// y los récords compartidos siguen necesitando conexión.
import { useEffect, useState } from 'react';
import registry from '../games/registry.js';
import { metaDe } from '../games/meta.js';
import { miniatura } from './portadas.js';

const CLAVE = 'minijuegos_sin_conexion'; // fecha de la última descarga completa
export const descargadoEl = () => { try { return Number(localStorage.getItem(CLAVE)) || 0; } catch { return 0; } };

/** Descarga todo; llama a onProgreso(hechos, total). Devuelve cuántos fallaron. */
export async function descargarTodo(onProgreso = () => {}) {
  const ids = Object.keys(registry);
  const tareas = [
    ...ids.map((id) => () => registry[id].precargar?.()),
    ...ids.map((id) => metaDe(id).imagen).filter(Boolean).map((img) => () => fetch(miniatura(img)).then((r) => { if (!r.ok) throw new Error(); }))
  ];
  let hechos = 0; let fallos = 0;
  const trabajar = async () => {
    while (tareas.length) {
      const t = tareas.shift();
      try { await t(); } catch { fallos++; }
      onProgreso(++hechos, hechos + tareas.length);
    }
  };
  await Promise.all([trabajar(), trabajar(), trabajar(), trabajar()]);
  if (!fallos) { try { localStorage.setItem(CLAVE, String(Date.now())); } catch { /* nada */ } }
  return fallos;
}

/** ¿Hay conexión ahora? (se actualiza al perderla o recuperarla) */
export function useEnLinea() {
  const [en, setEn] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));
  useEffect(() => {
    const on = () => setEn(true); const off = () => setEn(false);
    window.addEventListener('online', on); window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);
  return en;
}

/** Si la web está instalada como app, descarga los juegos sola (una vez por semana, con wifi o sin ahorro de datos). */
export function autodescargarSiApp() {
  try {
    const app = window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone;
    const ahorro = navigator.connection?.saveData;
    if (!app || ahorro || !navigator.onLine) return;
    if (Date.now() - descargadoEl() < 7 * 24 * 3600 * 1000) return;
    const lanzar = () => descargarTodo();
    if ('requestIdleCallback' in window) window.requestIdleCallback(lanzar, { timeout: 15000 }); else setTimeout(lanzar, 8000);
  } catch { /* nada */ }
}
