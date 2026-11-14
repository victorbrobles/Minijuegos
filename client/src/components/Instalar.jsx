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
