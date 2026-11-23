// client/src/games/comun/Lienzo3D.jsx
// Versión 3D del lienzo de los juegos de mesa de habilidad (Fútbol chapas, Curling, Estelas, Artillería): el juego
// sigue trabajando en sus coordenadas 2D (ancho × alto) y aquí se convierten a una escena 3D con luces, sombras,
// reflejos y efectos (la base de los minijuegos de «Test de habilidad»).
//   plano: 'suelo' → (x, y) del juego = (x, 0, y) en 3D (vista cenital inclinada)
//          'pared' → (x, y) del juego (y hacia abajo, como en el lienzo) = (x, alto - y, 0) en 3D (vista lateral)
//   montar(ctx, util) → objeto con lo que haga falta; dibujar(obj, t, util) se llama en cada fotograma.
//   onPuntero(tipo, x, y, e) recibe coordenadas del juego, igual que Lienzo2D.
import React, { useRef } from 'react';
import { useEscena, THREE } from '../Habilidad/tres.js';
import './Lienzo3D.css';

const ray = new THREE.Raycaster(); const v2 = new THREE.Vector2();

export default function Lienzo3D({ ancho, alto, plano = 'suelo', montar, dibujar, onPuntero, opciones = {}, proporcion, className = '' }) {
  const ref = useRef(null);
  const dib = useRef(dibujar); dib.current = dibujar;
  const pun = useRef(onPuntero); pun.current = onPuntero;
  useEscena(ref, (ctx) => {
    // Del juego a 3D y al revés
    const util = {
      a3: plano === 'suelo' ? (x, y, h = 0) => new THREE.Vector3(x - ancho / 2, h, y - alto / 2) : (x, y, z = 0) => new THREE.Vector3(x - ancho / 2, alto - y, z),
      ancho, alto
    };
    const plano3 = plano === 'suelo' ? new THREE.Plane(new THREE.Vector3(0, 1, 0), 0) : new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const aJuego = (e) => {
      const r = ctx.el.getBoundingClientRect();
      v2.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(v2, ctx.camera); const p = new THREE.Vector3();
      if (!ray.ray.intersectPlane(plano3, p)) return null;
      return plano === 'suelo' ? [p.x + ancho / 2, p.z + alto / 2] : [p.x + ancho / 2, alto - p.y];
    };
    util.aJuego = aJuego;
    const obj = montar(ctx, util) || {};
    const avisar = (tipo) => (e) => { const q = aJuego(e); if (q && pun.current) pun.current(tipo, q[0], q[1], e); };
    return { toque: avisar('down'), mover: avisar('move'), soltar: avisar('up'), frame: (dt, t) => dib.current?.(obj, t, util, dt), ajustar: obj.ajustar };
  }, { niebla: false, ...opciones });
  return <div ref={ref} className={`l3-caja ${className}`} style={proporcion ? { aspectRatio: proporcion } : undefined} />;
}
