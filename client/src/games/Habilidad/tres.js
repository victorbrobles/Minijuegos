// client/src/games/Habilidad/tres.js
// Base común de los minijuegos 3D de «Test de habilidad»: escena (three.js) con aspecto de juego moderno (iluminación
// con reflejos de entorno, tonos cinematográficos, cielo en degradado, niebla, sombras suaves, piezas redondeadas),
// encuadre automático para que todo quepa en el móvil, efectos (chispas, ondas, temblor de cámara), creadores de
// piezas, selección por rayo y un generador de números con semilla (la misma partida para todos).
import { useEffect } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
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

/* ───────── Cielo en degradado ───────── */
function texturaCielo(arriba, abajo) {
  const c = document.createElement('canvas'); c.width = 4; c.height = 256; const x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, `#${arriba.getHexString()}`); g.addColorStop(1, `#${abajo.getHexString()}`);
  x.fillStyle = g; x.fillRect(0, 0, 4, 256);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
// Un color base da un cielo: más claro y algo desaturado arriba, más profundo abajo
function coloresCielo(fondo) {
  const base = new THREE.Color(fondo); const hsl = {}; base.getHSL(hsl);
  const arriba = new THREE.Color().setHSL(hsl.h, Math.min(1, hsl.s * 0.9), Math.min(0.92, hsl.l + (hsl.l < 0.5 ? 0.16 : 0.1)));
  const abajo = new THREE.Color().setHSL(hsl.h, Math.min(1, hsl.s * 1.05), Math.max(0.04, hsl.l - (hsl.l < 0.5 ? 0.06 : 0.16)));
  return [arriba, abajo];
}

let entorno = null; // mapa de reflejos compartido (se genera una vez)
function mapaEntorno(renderer) {
  if (entorno) return entorno;
  const pm = new THREE.PMREMGenerator(renderer);
  entorno = pm.fromScene(new RoomEnvironment(), 0.04).texture; pm.dispose();
  return entorno;
}

/**
 * Aplica el aspecto de los minijuegos (tonos cinematográficos, color correcto, sombras suaves, reflejos de entorno,
 * cielo en degradado y niebla a juego) a una escena ya creada por otro juego (Torre, Minigolf, Canicas…).
 */
export function mejorarEscena(renderer, scene, { cielo, niebla = null, exposicion = 1.05, reflejos = true } = {}) {
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = exposicion;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  if (cielo) {
    const [arriba, abajo] = cielo.map((c) => new THREE.Color(c));
    scene.background = texturaCielo(arriba, abajo);
    if (niebla) scene.fog = new THREE.Fog(abajo, niebla[0], niebla[1]);
  }
  if (reflejos) { try { scene.environment = mapaEntorno(renderer); } catch { /* sin reflejos */ } }
}

/**
 * Monta una escena en `ref`. `crear(ctx)` prepara la escena y devuelve { frame(dt, t), toque(e, ctx), mover(e), soltar(e), fin() }.
 * ctx: { THREE, scene, camera, renderer, el, sol, encuadrar, aspecto, ancho, chispas, onda, temblor }
 * Opciones: fondo (color base del cielo), cielo: [arriba, abajo], niebla (distancia o false), sombras, exposicion.
 */
export function useEscena(ref, crear, { fondo = 0x1e293b, cielo = null, niebla = 60, sombras = true, exposicion = 1.05 } = {}) {
  useEffect(() => {
    const el = ref.current; if (!el) return undefined;
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = exposicion;
    renderer.shadowMap.enabled = sombras; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const [arriba, abajo] = cielo ? cielo.map((c) => new THREE.Color(c)) : coloresCielo(fondo);
    scene.background = texturaCielo(arriba, abajo);
    if (niebla) scene.fog = new THREE.Fog(abajo, niebla * 0.45, niebla * 1.6);
    try { scene.environment = mapaEntorno(renderer); } catch { /* sin reflejos */ }
    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 400);
    // Luces: cielo/suelo, sol con sombras suaves y un contraluz que recorta las siluetas
    scene.add(new THREE.HemisphereLight(arriba.clone().lerp(new THREE.Color(0xffffff), 0.6), abajo.clone().lerp(new THREE.Color(0x334155), 0.5), 0.75));
    const sol = new THREE.DirectionalLight(0xfff4e0, 2.1); sol.position.set(6, 14, 8); sol.castShadow = sombras;
    sol.shadow.mapSize.set(2048, 2048); sol.shadow.bias = -0.0004; sol.shadow.normalBias = 0.02; sol.shadow.radius = 4;
    Object.assign(sol.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 70 });
    const contra = new THREE.DirectionalLight(arriba.clone().lerp(new THREE.Color(0x93c5fd), 0.5), 0.9); contra.position.set(-8, 6, -10);
    scene.add(sol, sol.target, contra);

    // Efectos: chispas, ondas y temblor de cámara (se actualizan solos en el bucle)
    const efectos = [];
    const geoChispa = new THREE.SphereGeometry(1, 8, 6);
    const chispas = (pos, color = 0xfacc15, n = 22, { fuerza = 4, tam = 0.09, gravedad = 9 } = {}) => {
      const m = new THREE.MeshBasicMaterial({ color, transparent: true });
      for (let i = 0; i < n; i++) {
        const s = new THREE.Mesh(geoChispa, m); s.scale.setScalar(tam * (0.6 + Math.random() * 0.8)); s.position.copy(pos); scene.add(s);
        const v = new THREE.Vector3(Math.random() - 0.5, Math.random() * 0.9 + 0.2, Math.random() - 0.5).normalize().multiplyScalar(fuerza * (0.5 + Math.random()));
        efectos.push({ tipo: 'chispa', m: s, v, vida: 0.55 + Math.random() * 0.35, edad: 0, gravedad });
      }
      efectos.push({ tipo: 'mat', mat: m, vida: 1, edad: 0 });
    };
    const onda = (pos, color = 0xffffff, { radio = 1.6, eje = 'y' } = {}) => {
      const m = new THREE.Mesh(new THREE.RingGeometry(0.7, 1, 40), new THREE.MeshBasicMaterial({ color, transparent: true, side: THREE.DoubleSide, depthWrite: false }));
      if (eje === 'y') m.rotation.x = -Math.PI / 2; m.position.copy(pos); m.scale.setScalar(0.1); scene.add(m);
      efectos.push({ tipo: 'onda', m, radio, vida: 0.45, edad: 0 });
    };
    const sacudida = { f: 0 };
    const temblor = (f = 0.25) => { sacudida.f = Math.max(sacudida.f, f); };

    // Encuadre: que una zona del mundo quepa entera (en vertical o apaisado)
    let encuadre = null;
    const aplicarEncuadre = () => {
      if (!encuadre) return;
      const { centro, ancho, alto, desde, margen = 1.08 } = encuadre;
      const v = THREE.MathUtils.degToRad(camera.fov) / 2; const h = Math.atan(Math.tan(v) * camera.aspect);
      const d = Math.max((alto / 2) / Math.tan(v), (ancho / 2) / Math.tan(h)) * margen;
      const dir = new THREE.Vector3(...desde).normalize();
      camera.position.copy(new THREE.Vector3(...centro)).addScaledVector(dir, d);
      camera.lookAt(...centro);
    };
    const ctx = {
      THREE, scene, camera, renderer, el, sol, vivo: true, chispas, onda, temblor,
      /** Encuadra una zona: centro [x,y,z], ancho y alto visibles (en unidades del mundo), dirección desde la que se mira. */
      encuadrar: (o) => { encuadre = o; aplicarEncuadre(); },
      aspecto: () => camera.aspect,
      /** Cuánto hay que alejar una cámara pensada para una pantalla de proporción `ref` (1 = cuadrada). */
      ancho: (ref = 1) => Math.max(1, ref / camera.aspect),
      /** Sol que sigue a un punto (escenas que avanzan). */
      seguirSol: (x, z) => { sol.position.set(x + 6, 14, z + 8); sol.target.position.set(x, 0, z); }
    };
    const api = crear(ctx) || {};
    const ajustar = () => {
      renderer.setSize(el.clientWidth, el.clientHeight); camera.aspect = el.clientWidth / Math.max(1, el.clientHeight); camera.updateProjectionMatrix();
      aplicarEncuadre(); api.ajustar?.(camera.aspect);
    };
    ajustar(); const ro = new ResizeObserver(ajustar); ro.observe(el);
    let raf; let ant = performance.now(); const t0 = ant; const off = new THREE.Vector3();
    const bucle = (ahora) => {
      raf = requestAnimationFrame(bucle);
      const dt = Math.min(0.05, (ahora - ant) / 1000); ant = ahora;
      try { api.frame?.(dt, (ahora - t0) / 1000); } catch (e) { console.error(e); }
      for (let i = efectos.length - 1; i >= 0; i--) {
        const f = efectos[i]; f.edad += dt; const k = f.edad / f.vida;
        if (f.tipo === 'chispa') { f.v.y -= f.gravedad * dt; f.m.position.addScaledVector(f.v, dt); f.m.scale.multiplyScalar(1 - dt * 1.6); }
        if (f.tipo === 'onda') { f.m.scale.setScalar(0.1 + k * f.radio); f.m.material.opacity = 1 - k; }
        if (k >= 1) { if (f.m) { scene.remove(f.m); if (f.tipo === 'onda') { f.m.geometry.dispose(); f.m.material.dispose(); } } if (f.mat) f.mat.dispose(); efectos.splice(i, 1); }
      }
      if (sacudida.f > 0.002) { off.set((Math.random() - 0.5) * sacudida.f, (Math.random() - 0.5) * sacudida.f, 0); camera.position.add(off); sacudida.f *= Math.pow(0.02, dt); } else off.set(0, 0, 0);
      renderer.render(scene, camera);
      camera.position.sub(off);
    };
    raf = requestAnimationFrame(bucle);
    const abajo2 = (e) => { el.setPointerCapture?.(e.pointerId); api.toque?.(e, ctx); };
    const mover = (e) => api.mover?.(e, ctx);
    const arriba2 = (e) => api.soltar?.(e, ctx);
    el.addEventListener('pointerdown', abajo2); el.addEventListener('pointermove', mover); el.addEventListener('pointerup', arriba2); el.addEventListener('pointercancel', arriba2);
    return () => {
      ctx.vivo = false; cancelAnimationFrame(raf); ro.disconnect(); api.fin?.();
      el.removeEventListener('pointerdown', abajo2); el.removeEventListener('pointermove', mover); el.removeEventListener('pointerup', arriba2); el.removeEventListener('pointercancel', arriba2);
      scene.traverse((o) => { if (o.geometry && !compartidas.has(o.geometry)) o.geometry.dispose(); });
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

/* ───────── Materiales y piezas ───────── */
const mats = new Map();
const compartidas = new Set();
/** Material «de juguete»: color con algo de brillo y reflejos suaves del entorno. */
export const mat = (color, extra = {}) => {
  const k = `${color}|${JSON.stringify(extra)}`;
  if (!mats.has(k)) mats.set(k, new THREE.MeshStandardMaterial({ color, roughness: 0.38, metalness: 0.04, envMapIntensity: 0.7, ...extra }));
  return mats.get(k);
};
const sombra = (m) => { m.castShadow = true; m.receiveShadow = true; return m; };
const geoCaja = (w, h, d) => {
  const min = Math.min(w, h, d);
  if (min < 0.06) return new THREE.BoxGeometry(w, h, d);
  return new RoundedBoxGeometry(w, h, d, 3, Math.min(0.14, min * 0.16));
};
/** Textura de suelo con cuadrícula suave. */
function texturaSuelo(color, { cuadros = 8, contraste = 0.08, lineas = true } = {}) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256; const x = c.getContext('2d');
  const base = new THREE.Color(color); const claro = base.clone().offsetHSL(0, 0, contraste); const oscuro = base.clone().offsetHSL(0, 0, -contraste * 0.6);
  const t = 256 / cuadros;
  for (let i = 0; i < cuadros; i++) for (let j = 0; j < cuadros; j++) { x.fillStyle = `#${((i + j) % 2 ? claro : base).getHexString()}`; x.fillRect(i * t, j * t, t, t); }
  if (lineas) { x.strokeStyle = `#${oscuro.getHexString()}`; x.lineWidth = 2; for (let i = 0; i <= cuadros; i++) { x.beginPath(); x.moveTo(i * t, 0); x.lineTo(i * t, 256); x.stroke(); x.beginPath(); x.moveTo(0, i * t); x.lineTo(256, i * t); x.stroke(); } }
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.anisotropy = 4;
  return tex;
}
export const crea = {
  caja: (w, h, d, color, extra) => sombra(new THREE.Mesh(geoCaja(w, h, d), extra ? new THREE.MeshStandardMaterial({ color, roughness: 0.38, metalness: 0.04, envMapIntensity: 0.7, ...extra }) : mat(color))),
  esfera: (r, color, extra) => sombra(new THREE.Mesh(new THREE.SphereGeometry(r, 36, 24), extra ? new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.04, envMapIntensity: 0.8, ...extra }) : mat(color))),
  cilindro: (rt, rb, h, color, seg = 32, extra) => sombra(new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), extra ? new THREE.MeshStandardMaterial({ color, roughness: 0.38, envMapIntensity: 0.7, ...extra }) : mat(color))),
  plano: (w, h, color) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat(color)); m.rotation.x = -Math.PI / 2; m.receiveShadow = true; return m; },
  /** Suelo grande con cuadrícula (repetida cada `celda` unidades). */
  suelo: (w, d, color, { celda = 2, contraste = 0.06, lineas = true, rugosidad = 0.8 } = {}) => {
    const tex = texturaSuelo(color, { contraste, lineas }); tex.repeat.set(w / (celda * 8), d / (celda * 8));
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshStandardMaterial({ map: tex, roughness: rugosidad, metalness: 0, envMapIntensity: 0.4 }));
    m.rotation.x = -Math.PI / 2; m.receiveShadow = true; return m;
  },
  /** Marco de neón (cuatro barras finas) alrededor de un rectángulo w × d, a la altura y. */
  marco: (w, d, color, { grosor = 0.07, alto = 0.06, intensidad = 1.4 } = {}) => {
    const g = new THREE.Group(); const m = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: intensidad, roughness: 0.3 });
    [[w + grosor, alto, grosor, 0, d / 2], [w + grosor, alto, grosor, 0, -d / 2], [grosor, alto, d, w / 2, 0], [grosor, alto, d, -w / 2, 0]].forEach(([a, b, c, x, z]) => { const bar = new THREE.Mesh(new THREE.BoxGeometry(a, b, c), m); bar.position.set(x, 0, z); g.add(bar); });
    return g;
  },
  /** Material que brilla (neón). */
  neon: (color, intensidad = 1.4) => new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: intensidad, roughness: 0.3 }),
  /** Texto o emoji en un cartel que siempre mira a la cámara. */
  texto: (str, { tam = 1, color = '#ffffff', fondo = null, fuente = 'bold 90px sans-serif', ancho = 256 } = {}) => {
    const c = document.createElement('canvas'); c.width = ancho; c.height = 128; const x = c.getContext('2d');
    if (fondo) { x.fillStyle = fondo; x.beginPath(); x.roundRect?.(4, 4, ancho - 8, 120, 28); x.fill(); }
    x.fillStyle = color; x.font = fuente; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(str, ancho / 2, 68);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true }));
    s.scale.set(tam * (ancho / 128), tam, 1); return s;
  },
  /** Cara plana con texto/emoji (para fichas y carteles que no giran con la cámara). */
  cartel: (str, w, h, { color = '#0f172a', fondo = '#ffffff', fuente = 'bold 90px sans-serif', radio = 0 } = {}) => {
    const c = document.createElement('canvas'); c.width = 256; c.height = Math.round(256 * (h / w)); const x = c.getContext('2d');
    if (fondo) { x.fillStyle = fondo; if (radio) { x.beginPath(); x.roundRect?.(0, 0, c.width, c.height, radio); x.fill(); } else x.fillRect(0, 0, c.width, c.height); }
    x.fillStyle = color; x.font = fuente; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(str, c.width / 2, c.height / 2 + 6);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, transparent: true }));
  },
  /** Sombra suave redonda (para objetos que vuelan o flotan). */
  sombraSuave: (r = 0.6, opacidad = 0.35) => {
    const c = document.createElement('canvas'); c.width = 64; c.height = 64; const x = c.getContext('2d');
    const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, `rgba(0,0,0,${opacidad})`); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(r * 2, r * 2), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; return m;
  }
};
/** Cartel de texto que se puede cambiar (marcadores dentro de la escena). */
export function marcador({ tam = 1.2, color = '#ffffff', fondo = 'rgba(15,23,42,0.85)', ancho = 512 } = {}) {
  const c = document.createElement('canvas'); c.width = ancho; c.height = 160; const x = c.getContext('2d');
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true })); s.scale.set(tam * (ancho / 160), tam, 1);
  let ult = null;
  s.poner = (str, col = color) => {
    const clave = `${str}|${col}`; if (clave === ult) return; ult = clave; // (misma palabra con otro color también se repinta)
    x.clearRect(0, 0, ancho, 160); if (fondo) { x.fillStyle = fondo; x.beginPath(); x.roundRect?.(6, 6, ancho - 12, 148, 36); x.fill(); }
    x.fillStyle = col; x.font = 'bold 110px monospace'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(str, ancho / 2, 88); tex.needsUpdate = true;
  };
  return s;
}
export const fmtSeg = (s) => `${(Math.round(s * 10) / 10).toFixed(1).replace('.', ',')} s`;
