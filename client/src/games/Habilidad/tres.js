// client/src/games/Habilidad/tres.js
// Base común de los minijuegos 3D de «Test de habilidad»: escena (three.js) con luces, cámara, bucle y toques,
// creadores de piezas, selección por rayo y un generador de números con semilla (la misma partida para todos).
import { useEffect } from 'react';
import * as THREE from 'three';
export { THREE };

export function rng(semilla) {
  let a = (semilla >>> 0) || 1;
  const r = () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  r.entre = (x, y) => x + r() * (y - x);
  r.entero = (x, y) => Math.floor(r.entre(x, y + 1));
  r.de = (l) => l[Math.floor(r() * l.length)];
  r.barajar = (l) => { const b = [...l]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  return r;
}

/**
 * Monta una escena en `ref`. `crear(ctx)` prepara la escena y devuelve { frame(dt, t), toque(e, ctx), mover(e), soltar(e), fin() }.
 * ctx: { THREE, scene, camera, renderer, el, sol }
 */
export function useEscena(ref, crear, { fondo = 0x1e293b, sombras = true } = {}) {
  useEffect(() => {
    const el = ref.current; if (!el) return undefined;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.shadowMap.enabled = sombras;
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene(); scene.background = new THREE.Color(fondo);
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 300);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x445566, 1.05));
    const sol = new THREE.DirectionalLight(0xffffff, 1.25); sol.position.set(5, 12, 7); sol.castShadow = sombras;
    sol.shadow.mapSize.set(1024, 1024); Object.assign(sol.shadow.camera, { left: -15, right: 15, top: 15, bottom: -15, near: 1, far: 60 });
    scene.add(sol, sol.target);
    const ctx = { THREE, scene, camera, renderer, el, sol, vivo: true };
    const api = crear(ctx) || {};
    const ajustar = () => { renderer.setSize(el.clientWidth, el.clientHeight); camera.aspect = el.clientWidth / Math.max(1, el.clientHeight); camera.updateProjectionMatrix(); };
    ajustar(); const ro = new ResizeObserver(ajustar); ro.observe(el);
    let raf; let ant = performance.now(); const t0 = ant;
    const bucle = (ahora) => {
      raf = requestAnimationFrame(bucle);
      const dt = Math.min(0.05, (ahora - ant) / 1000); ant = ahora;
      try { api.frame?.(dt, (ahora - t0) / 1000); } catch (e) { console.error(e); }
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(bucle);
    const abajo = (e) => { el.setPointerCapture?.(e.pointerId); api.toque?.(e, ctx); };
    const mover = (e) => api.mover?.(e, ctx);
    const arriba = (e) => api.soltar?.(e, ctx);
    el.addEventListener('pointerdown', abajo); el.addEventListener('pointermove', mover); el.addEventListener('pointerup', arriba); el.addEventListener('pointercancel', arriba);
    return () => {
      ctx.vivo = false; cancelAnimationFrame(raf); ro.disconnect(); api.fin?.();
      el.removeEventListener('pointerdown', abajo); el.removeEventListener('pointermove', mover); el.removeEventListener('pointerup', arriba); el.removeEventListener('pointercancel', arriba);
      renderer.dispose(); if (renderer.domElement.parentNode === el) el.removeChild(renderer.domElement);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}

const ray = new THREE.Raycaster(); const v2 = new THREE.Vector2();
/** Primer objeto (de la lista) bajo el dedo. Devuelve el objeto de la lista (aunque se toque un hijo). */
export function tocado(ctx, e, objetos) {
  const r = ctx.el.getBoundingClientRect();
  v2.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(v2, ctx.camera);
  const hits = ray.intersectObjects(objetos, true);
  if (!hits.length) return null;
  let o = hits[0].object; while (o && !objetos.includes(o)) o = o.parent;
  return o ? { obj: o, punto: hits[0].point } : null;
}
/** Punto del suelo (plano y = altura) bajo el dedo. */
export function enSuelo(ctx, e, altura = 0) {
  const r = ctx.el.getBoundingClientRect();
  v2.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(v2, ctx.camera);
  const p = new THREE.Vector3(); return ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), -altura), p) ? p : null;
}

const mats = new Map();
export const mat = (color, extra = {}) => { const k = `${color}|${JSON.stringify(extra)}`; if (!mats.has(k)) mats.set(k, new THREE.MeshStandardMaterial({ color, roughness: 0.55, ...extra })); return mats.get(k); };
const sombra = (m) => { m.castShadow = true; m.receiveShadow = true; return m; };
export const crea = {
  caja: (w, h, d, color, extra) => sombra(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), extra ? new THREE.MeshStandardMaterial({ color, roughness: 0.55, ...extra }) : mat(color))),
  esfera: (r, color, extra) => sombra(new THREE.Mesh(new THREE.SphereGeometry(r, 28, 18), extra ? new THREE.MeshStandardMaterial({ color, roughness: 0.4, ...extra }) : mat(color))),
  cilindro: (rt, rb, h, color, seg = 24, extra) => sombra(new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), extra ? new THREE.MeshStandardMaterial({ color, ...extra }) : mat(color))),
  plano: (w, h, color) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat(color)); m.rotation.x = -Math.PI / 2; m.receiveShadow = true; return m; },
  /** Texto o emoji en un cartel que siempre mira a la cámara. */
  texto: (str, { tam = 1, color = '#ffffff', fondo = null, fuente = 'bold 90px sans-serif', ancho = 256 } = {}) => {
    const c = document.createElement('canvas'); c.width = ancho; c.height = 128; const x = c.getContext('2d');
    if (fondo) { x.fillStyle = fondo; x.beginPath(); x.roundRect?.(4, 4, ancho - 8, 120, 28); x.fill(); }
    x.fillStyle = color; x.font = fuente; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(str, ancho / 2, 68);
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true }));
    s.scale.set(tam * (ancho / 128), tam, 1); return s;
  },
  /** Cara plana con texto/emoji (para fichas y carteles que no giran con la cámara). */
  cartel: (str, w, h, { color = '#0f172a', fondo = '#ffffff', fuente = 'bold 90px sans-serif' } = {}) => {
    const c = document.createElement('canvas'); c.width = 256; c.height = Math.round(256 * (h / w)); const x = c.getContext('2d');
    x.fillStyle = fondo; x.fillRect(0, 0, c.width, c.height); x.fillStyle = color; x.font = fuente; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(str, c.width / 2, c.height / 2 + 6);
    return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true }));
  }
};
/** Cartel de texto que se puede cambiar (marcadores dentro de la escena). */
export function marcador({ tam = 1.2, color = '#ffffff', fondo = 'rgba(15,23,42,0.85)', ancho = 512 } = {}) {
  const c = document.createElement('canvas'); c.width = ancho; c.height = 160; const x = c.getContext('2d');
  const tex = new THREE.CanvasTexture(c);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true })); s.scale.set(tam * (ancho / 160), tam, 1);
  let ult = null;
  s.poner = (str, col = color) => {
    if (str === ult) return; ult = str;
    x.clearRect(0, 0, ancho, 160); if (fondo) { x.fillStyle = fondo; x.beginPath(); x.roundRect?.(6, 6, ancho - 12, 148, 36); x.fill(); }
    x.fillStyle = col; x.font = 'bold 110px monospace'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(str, ancho / 2, 88); tex.needsUpdate = true;
  };
  return s;
}
export const fmtSeg = (s) => `${(Math.round(s * 10) / 10).toFixed(1).replace('.', ',')} s`;
