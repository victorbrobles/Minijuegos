// client/src/components/Ajustes.jsx
// Botón ⚙️ de la portada y su panel: accesibilidad (letra, contraste, animaciones) y modo sin conexión.
// También el aviso global «Sin conexión».
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { LETRAS, leerAjustes, guardarAjustes } from '../lib/ajustes.js';
import { descargarTodo, descargadoEl, useEnLinea } from '../lib/sinConexion.js';
import './Ajustes.css';

function Opcion({ activo, onClick, children }) {
  return <button type="button" className={`aj-opcion${activo ? ' activo' : ''}`} aria-pressed={activo} onClick={onClick}>{children}</button>;
}

export function PanelAjustes({ onCerrar }) {
  const [a, setA] = useState(leerAjustes);
  const [desc, setDesc] = useState(null); // { hechos, total } | 'ok' | 'error'
  const enLinea = useEnLinea();
  const cambiar = (k, v) => { const n = { ...a, [k]: v }; setA(n); guardarAjustes(n); };
  useEffect(() => {
    const tecla = (e) => { if (e.key === 'Escape') onCerrar(); };
    window.addEventListener('keydown', tecla); return () => window.removeEventListener('keydown', tecla);
  }, [onCerrar]);
  const descargar = async () => {
    setDesc({ hechos: 0, total: 1 });
    const fallos = await descargarTodo((hechos, total) => setDesc({ hechos, total }));
    setDesc(fallos ? 'error' : 'ok');
  };
  const ultima = descargadoEl();
  return (
    <div className="rg-modal-fondo aj-fondo" onClick={onCerrar}>
      <div className="aj-panel" role="dialog" aria-modal="true" aria-label="Ajustes" onClick={(e) => e.stopPropagation()}>
        <header><h2>⚙️ Ajustes</h2><button type="button" className="aj-cerrar" onClick={onCerrar} aria-label="Cerrar">✕</button></header>

        <section>
          <h3>🔠 Tamaño de letra</h3>
          <div className="aj-opciones">
            {LETRAS.map(([id, texto, tam]) => <Opcion key={id} activo={a.letra === id} onClick={() => cambiar('letra', id)}><span style={{ fontSize: tam === '100%' ? '1rem' : tam === '112.5%' ? '1.15rem' : '1.3rem' }}>Aa</span> {texto}</Opcion>)}
          </div>
        </section>
        <section>
          <h3>🌓 Contraste</h3>
          <div className="aj-opciones">
            <Opcion activo={!a.contraste} onClick={() => cambiar('contraste', false)}>Normal</Opcion>
            <Opcion activo={a.contraste} onClick={() => cambiar('contraste', true)}>Alto contraste</Opcion>
          </div>
        </section>
        <section>
          <h3>✨ Animaciones</h3>
          <div className="aj-opciones">
            <Opcion activo={a.animaciones === 'sistema'} onClick={() => cambiar('animaciones', 'sistema')}>Como el sistema</Opcion>
            <Opcion activo={a.animaciones === 'menos'} onClick={() => cambiar('animaciones', 'menos')}>Reducir</Opcion>
            <Opcion activo={a.animaciones === 'todas'} onClick={() => cambiar('animaciones', 'todas')}>Todas</Opcion>
          </div>
        </section>
        <section>
          <h3>📴 Jugar sin conexión</h3>
          <p className="aj-texto">Descarga todos los juegos en este dispositivo (unos 3 MB). Después podrás abrir sin internet los juegos de un solo móvil. Lo online (salas, récords compartidos) sigue necesitando conexión.</p>
          {desc && typeof desc === 'object' ? (
            <div className="aj-progreso"><span style={{ width: `${Math.round((desc.hechos / desc.total) * 100)}%` }} /><b>{Math.round((desc.hechos / desc.total) * 100)} %</b></div>
          ) : (
            <button type="button" className="aj-descargar" onClick={descargar} disabled={!enLinea}>
              {desc === 'ok' ? '✅ Descargado · volver a descargar' : desc === 'error' ? '⚠️ Faltó algo · reintentar' : ultima ? '🔄 Actualizar la descarga' : '⬇️ Descargar todos los juegos'}
            </button>
          )}
          {ultima > 0 && desc !== 'ok' && <p className="aj-nota">Última descarga: {new Date(ultima).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}</p>}
          {!enLinea && <p className="aj-nota">Ahora no hay conexión.</p>}
        </section>
      </div>
    </div>
  );
}

export function BotonAjustes() {
  const [abierto, setAbierto] = useState(false);
  return (
    <>
      <button type="button" className="aj-boton" onClick={() => setAbierto(true)} aria-label="Ajustes y accesibilidad" title="Ajustes y accesibilidad">⚙️</button>
      {abierto && createPortal(<PanelAjustes onCerrar={() => setAbierto(false)} />, document.body)}
    </>
  );
}

/** Aviso fijo cuando se pierde la conexión. */
export function AvisoSinConexion() {
  const enLinea = useEnLinea();
  if (enLinea) return null;
  return <p className="aj-offline" role="status">📴 Sin conexión · puedes seguir con los juegos de un solo móvil que ya tengas descargados</p>;
}
