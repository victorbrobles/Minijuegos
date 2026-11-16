// client/src/components/Instalar.jsx
// Aviso para instalar la web como app (PWA). En Android/Chrome usa el diálogo del navegador;
// en iPhone explica el paso de «Añadir a pantalla de inicio». Se puede descartar.
import { useEffect, useState } from 'react';

let aviso = null; // el evento beforeinstallprompt llega una vez, quizá antes de montar la portada
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); aviso = e; window.dispatchEvent(new Event('minijuegos-instalable')); });
}
const CLAVE = 'minijuegos_instalar_descartado';
const instalada = () => window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone;
const esIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) && !/crios|fxios/i.test(navigator.userAgent);
const esIOSOtroNavegador = () => /iphone|ipad|ipod/i.test(navigator.userAgent) && /crios|fxios|edgios/i.test(navigator.userAgent);
const esAndroid = () => /android/i.test(navigator.userAgent);

/** Sección de ⚙️ Ajustes: instalar la app siempre está a mano (aunque se haya cerrado el aviso de la portada). */
export function SeccionInstalar() {
  const [puede, setPuede] = useState(Boolean(aviso));
  const [hecho, setHecho] = useState(false);
  useEffect(() => { const f = () => setPuede(true); window.addEventListener('minijuegos-instalable', f); return () => window.removeEventListener('minijuegos-instalable', f); }, []);
  const instalar = async () => {
    if (!aviso) return;
    aviso.prompt();
    try { const r = await aviso.userChoice; if (r?.outcome === 'accepted') setHecho(true); } catch { /* nada */ }
    aviso = null; setPuede(false);
  };
  let contenido;
  if (instalada() || hecho) contenido = <p className="aj-texto">✅ Ya la tienes instalada. Ábrela desde el icono de los dos dados de tu pantalla de inicio.</p>;
  else if (puede) contenido = <button type="button" className="aj-descargar aj-instalar" onClick={instalar}>📲 Instalar «Al juego, juego»</button>;
  else if (esIOS()) contenido = <ol className="aj-pasos"><li>Pulsa el botón <b>Compartir</b> ⬆️ de Safari (abajo).</li><li>Elige <b>«Añadir a pantalla de inicio»</b>.</li><li>Pulsa <b>Añadir</b>: saldrá el icono de los dos dados.</li></ol>;
  else if (esIOSOtroNavegador()) contenido = <p className="aj-texto">En iPhone solo se puede instalar desde <b>Safari</b>: abre esta web en Safari y pulsa Compartir ⬆️ → «Añadir a pantalla de inicio».</p>;
  else if (esAndroid()) contenido = <ol className="aj-pasos"><li>Abre el menú <b>⋮</b> del navegador (arriba a la derecha).</li><li>Pulsa <b>«Instalar aplicación»</b> o <b>«Añadir a pantalla de inicio»</b>.</li></ol>;
  else contenido = <ol className="aj-pasos"><li>En Chrome o Edge, pulsa el icono de <b>instalar</b> 🖥️⬇️ a la derecha de la barra de direcciones (o el menú ⋮ → «Instalar Al juego, juego»).</li><li>Se abrirá en su propia ventana, como un programa más.</li></ol>;
  return (
    <section>
      <h3>📲 Instalar la app</h3>
      <p className="aj-texto">Tenla en tu pantalla de inicio, a pantalla completa y más rápida (y con los juegos descargados para jugar sin conexión).</p>
      {contenido}
    </section>
  );
}

export default function Instalar() {
  const [puede, setPuede] = useState(Boolean(aviso));
  const [descartado, setDescartado] = useState(() => { try { return Boolean(localStorage.getItem(CLAVE)); } catch { return false; } });
  const [ayudaIOS, setAyudaIOS] = useState(false);
  useEffect(() => { const f = () => setPuede(true); window.addEventListener('minijuegos-instalable', f); return () => window.removeEventListener('minijuegos-instalable', f); }, []);
  if (descartado || instalada() || (!puede && !esIOS())) return null;
  const descartar = () => { try { localStorage.setItem(CLAVE, '1'); } catch { /* nada */ } setDescartado(true); };
  const instalar = async () => {
    if (!aviso) { setAyudaIOS(true); return; }
    aviso.prompt();
    try { await aviso.userChoice; } catch { /* nada */ }
    aviso = null; setPuede(false);
  };
  return (
    <div className="inst-aviso">
      <span className="inst-ico">📲</span>
      <div>
        <b>Instala la app</b>
        <small>{ayudaIOS ? 'Pulsa el botón Compartir ⬆️ de Safari y luego «Añadir a pantalla de inicio».' : 'Como una app, a pantalla completa.'}</small>
      </div>
      {!ayudaIOS && <button type="button" className="inst-si" onClick={instalar}>Instalar</button>}
      <button type="button" className="inst-no" onClick={descartar} aria-label="No mostrar más">✕</button>
    </div>
  );
}
