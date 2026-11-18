// client/src/games/comun/Lienzo2D.jsx
// Lienzo 2D común (Fútbol chapas, Artillería, Curling, Estelas): ocupa el ancho disponible manteniendo la proporción
// del mundo (`ancho` × `alto` en unidades del juego) y solo se redibuja cuando cambia `version` o mientras
// `dibujar` devuelva true (animaciones): así no gasta batería con la pantalla quieta.
// dibujar(ctx, k, t): k = píxeles por unidad. onPuntero(tipo, x, y, evento) recibe coordenadas del mundo.
import React, { useEffect, useRef, useState } from 'react';
import './Lienzo2D.css';

export default function Lienzo2D({ ancho, alto, dibujar, version, onPuntero, className = '', altoMax }) {
  const caja = useRef(null); const lienzo = useRef(null);
  const [tam, setTam] = useState({ w: 300, h: 300 });
  const dib = useRef(dibujar); dib.current = dibujar;
  const raf = useRef(0);

  useEffect(() => {
    const ajustar = () => {
      const disponible = caja.current?.clientWidth || 300;
      let w = disponible; let h = (w * alto) / ancho;
      const max = altoMax ?? window.innerHeight * 0.68;
      if (h > max) { h = max; w = (h * ancho) / alto; }
      setTam({ w: Math.floor(w), h: Math.floor(h) });
    };
    ajustar();
    const ro = new ResizeObserver(ajustar); ro.observe(caja.current);
    return () => ro.disconnect();
  }, [ancho, alto, altoMax]);

  useEffect(() => {
    const c = lienzo.current; const dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = tam.w * dpr; c.height = tam.h * dpr;
    const ctx = c.getContext('2d');
    const k = tam.w / ancho;
    const pintar = (t) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, tam.w, tam.h);
      const seguir = dib.current(ctx, k, t);
      raf.current = seguir ? requestAnimationFrame(pintar) : 0;
    };
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(pintar);
    return () => cancelAnimationFrame(raf.current);
  }, [tam, version, ancho]);

  const aMundo = (e) => {
    const r = lienzo.current.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * ancho, ((e.clientY - r.top) / r.height) * alto];
  };
  const manejar = (tipo) => (e) => {
    if (!onPuntero) return;
    if (tipo === 'down') { try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* nada */ } }
    const [x, y] = aMundo(e);
    onPuntero(tipo, x, y, e);
  };
  return (
    <div ref={caja} className={`lz-caja ${className}`}>
      <canvas ref={lienzo} style={{ width: tam.w, height: tam.h, touchAction: 'none' }}
        onPointerDown={manejar('down')} onPointerMove={manejar('move')} onPointerUp={manejar('up')} onPointerCancel={manejar('up')} />
    </div>
  );
}

/** Hora del servidor (aprox.) a partir de la última vista recibida. */
export function useReloj(v) {
  const base = useRef({ ahora: v?.ahora || Date.now(), local: Date.now() });
  if (v?.ahora && base.current.ahora !== v.ahora) base.current = { ahora: v.ahora, local: Date.now() };
  return () => base.current.ahora + (Date.now() - base.current.local);
}

/** Reproduce una animación de `frames` fotogramas a `fps`: devuelve el fotograma actual (o null si no hay). */
export function useAnimacion(clave, total, fps = 30) {
  const [, setT] = useState(0);
  const inicio = useRef({ clave: null, t: 0 });
  if (clave != null && inicio.current.clave !== clave) inicio.current = { clave, t: performance.now() };
  useEffect(() => {
    if (clave == null || !total) return undefined;
    let r; const paso = () => { setT((x) => x + 1); if ((performance.now() - inicio.current.t) / 1000 * fps < total + 8) r = requestAnimationFrame(paso); };
    r = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(r);
  }, [clave, total, fps]);
  if (clave == null || !total) return null;
  const f = Math.floor(((performance.now() - inicio.current.t) / 1000) * fps);
  return f >= total ? null : f;
}
