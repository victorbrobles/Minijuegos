// client/src/games/Torre/Escena.jsx
// Escena 3D de «Torre Inestable» (three.js): mesa, plataforma, piezas, pieza fantasma para colocar y animación
// de la caída (se repite la misma simulación que hizo el servidor).
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as CANNON from 'cannon-es';
import * as E from './engine.js';
import { PIEZAS, PLATAFORMA, verticesCuna, CARAS_CUNA } from './piezas.js';
import { colorDe } from '../Pulsador/Vistas.jsx';
import { mejorarEscena, crea } from '../Habilidad/tres.js';
import { sonar } from '../../lib/sonido.js';

E.usarFisica(CANNON);

function geometriaCuna(t) {
  const v = verticesCuna(t);
  const pos = [];
  CARAS_CUNA.forEach((cara) => { for (let i = 1; i < cara.length - 1; i++) [cara[0], cara[i], cara[i + 1]].forEach((k) => pos.push(...v[k])); });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
}
function mallaDe(pieza, color, fantasma = false) {
  const def = PIEZAS[pieza.tipo];
  const grupo = new THREE.Group();
  const mat = fantasma
    ? new THREE.MeshStandardMaterial({ color, transparent: true, opacity: 0.45, roughness: 0.4, depthWrite: false })
    : new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.05 });
  def.partes.forEach((pt) => {
    const geo = pt.forma === 'caja' ? new THREE.BoxGeometry(...pt.t) : pt.forma === 'cilindro' ? new THREE.CylinderGeometry(pt.r, pt.r, pt.h, 28) : geometriaCuna(pt.t);
    const m = new THREE.Mesh(geo, mat);
    m.position.set(...pt.o);
    m.castShadow = !fantasma; m.receiveShadow = !fantasma;
    if (!fantasma) {
      const bordes = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 30), new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.25 }));
      m.add(bordes);
    }
    grupo.add(m);
  });
  grupo.scale.setScalar(pieza.escala);
  return grupo;
}
const aplicar = (obj, pose) => { obj.position.set(pose[0], pose[1], pose[2]); obj.quaternion.set(pose[3], pose[4], pose[5], pose[6]); };

/**
 * props: v (vista), colocar ({ x, z, rotY, tumbar } o null si no te toca), onAnimando(bool), orbitarRef (azimut de la cámara)
 */
export default function Escena({ v, colocar, onAnimando, azimutRef }) {
  const caja = useRef(null);
  const t = useRef(null);

  // Montaje: renderer, cámara, luces, mesa y plataforma
  useEffect(() => {
    const el = caja.current;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    mejorarEscena(renderer, scene, { cielo: [0x1e1b4b, 0x3b1d0f], niebla: [26, 60], exposicion: 1.1 });
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(7, 6, 9);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false; controls.enableDamping = true; controls.minDistance = 5; controls.maxDistance = 26; controls.maxPolarAngle = Math.PI * 0.48;
    controls.target.set(0, 1, 0);
    scene.add(new THREE.HemisphereLight(0xdbeafe, 0x3f2d20, 0.9));
    const sol = new THREE.DirectionalLight(0xffffff, 1.6);
    sol.position.set(6, 14, 5); sol.castShadow = true;
    sol.shadow.mapSize.set(1024, 1024);
    Object.assign(sol.shadow.camera, { left: -8, right: 8, top: 14, bottom: -4, near: 1, far: 40 });
    scene.add(sol);
    // Mesa de madera y plataforma
    // Salón: suelo de tablas, alfombra, paredes con cuadros y una lámpara cálida sobre la mesa
    const suelo = crea.suelo(80, 80, 0x7c4a1e, { celda: 1.2, contraste: 0.05 }); suelo.position.y = E.MESA_Y - 5; scene.add(suelo);
    const alfombra = new THREE.Mesh(new THREE.CircleGeometry(11, 48), new THREE.MeshStandardMaterial({ color: 0x7f1d1d, roughness: 0.95 })); alfombra.rotation.x = -Math.PI / 2; alfombra.position.y = E.MESA_Y - 4.98; alfombra.receiveShadow = true; scene.add(alfombra);
    const patas = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.6, 4.4, 24), new THREE.MeshStandardMaterial({ color: 0x5b3412, roughness: 0.6 })); patas.position.y = E.MESA_Y - 2.8; patas.castShadow = true; scene.add(patas);
    [[0, -28, 0], [-28, 0, Math.PI / 2], [28, 0, -Math.PI / 2]].forEach(([x, z, ry]) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(56, 30), new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 })); p.position.set(x, E.MESA_Y + 10, z); p.rotation.y = ry; scene.add(p); });
    [[-9, 0x0ea5e9], [0, 0xf59e0b], [9, 0xa855f7]].forEach(([x, c]) => { const marco = crea.caja(5, 3.6, 0.3, 0x78350f); marco.position.set(x, E.MESA_Y + 7, -27.7); scene.add(marco); const lienzo = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 2.8), new THREE.MeshStandardMaterial({ color: c, roughness: 0.6 })); lienzo.position.set(x, E.MESA_Y + 7, -27.5); scene.add(lienzo); });
    const lampara = new THREE.Mesh(new THREE.ConeGeometry(1.6, 1.4, 32, 1, true), new THREE.MeshStandardMaterial({ color: 0xfde68a, emissive: 0xf59e0b, emissiveIntensity: 0.8, side: THREE.DoubleSide })); lampara.position.set(0, 16, 0); scene.add(lampara);
    const calida = new THREE.PointLight(0xffd7a0, 60, 40, 1.6); calida.position.set(0, 15, 0); scene.add(calida);
    const mesa = new THREE.Mesh(new THREE.CylinderGeometry(7, 7, 0.6, 48), new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.45, metalness: 0.05 }));
    mesa.position.y = E.MESA_Y - 0.3; mesa.receiveShadow = true; scene.add(mesa);
    const base = new THREE.Mesh(new THREE.BoxGeometry(PLATAFORMA, 0.5, PLATAFORMA), new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.6 }));
    base.position.y = -0.25; base.receiveShadow = true; base.castShadow = true; scene.add(base);
    const pata = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.7, 1, 24), new THREE.MeshStandardMaterial({ color: 0x94a3b8 }));
    pata.position.y = -1; scene.add(pata);
    // Guía de caída de la pieza fantasma
    const guia = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1, 8), new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.8 }));
    const marca = new THREE.Mesh(new THREE.RingGeometry(0.18, 0.28, 24), new THREE.MeshBasicMaterial({ color: 0xfacc15, side: THREE.DoubleSide }));
    marca.rotation.x = -Math.PI / 2;
    guia.visible = false; marca.visible = false; scene.add(guia, marca);

    const estado = { renderer, scene, camera, controls, mallas: new Map(), fantasma: null, fantasmaClave: '', guia, marca, anim: null, ultimaN: null, alturaObjetivo: 1, vivo: true };
    t.current = estado;
    const ajustar = () => { const w = el.clientWidth; const h = el.clientHeight; renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); };
    ajustar();
    const ro = new ResizeObserver(ajustar); ro.observe(el);
    let raf;
    const bucle = () => {
      raf = requestAnimationFrame(bucle);
      // Animación de la caída
      const a = estado.anim;
      if (a) {
        a.i = Math.min(a.frames.length - 1, a.i + 1);
        const f = a.frames[a.i];
        a.piezas.forEach((pz, k) => { const m = estado.mallas.get(pz.id); if (m) aplicar(m, f[k]); });
        if (a.i >= a.frames.length - 1) { estado.anim = null; a.alAcabar(); }
      }
      // La cámara sigue la altura de la torre
      controls.target.y += (estado.alturaObjetivo - controls.target.y) * 0.05;
      controls.update();
      if (azimutRef) azimutRef.current = controls.getAzimuthalAngle();
      renderer.render(scene, camera);
    };
    bucle();
    return () => { estado.vivo = false; cancelAnimationFrame(raf); ro.disconnect(); controls.dispose(); renderer.dispose(); el.removeChild(renderer.domElement); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Piezas: crear las nuevas, quitar las que ya no están y animar la última caída
  useEffect(() => {
    const s = t.current; if (!s) return;
    const ids = new Set(v.piezas.map((pz) => pz.id));
    s.mallas.forEach((m, id) => { if (!ids.has(id)) { s.scene.remove(m); s.mallas.delete(id); } });
    const pon = (pz) => { if (!s.mallas.has(pz.id)) { const m = mallaDe(pz, colorDe(pz.por)); s.scene.add(m); s.mallas.set(pz.id, m); } };
    const u = v.ultima;
    const nuevaCaida = u && s.ultimaN !== null && u.n !== s.ultimaN && u.antes.length === v.piezas.length - 1;
    s.alturaObjetivo = Math.max(1, v.altura * 0.6 + 0.5);
    if (nuevaCaida) {
      // Se repite la simulación del servidor desde el estado anterior
      const piezasAnim = [...u.antes, u.nueva];
      piezasAnim.forEach(pon);
      const { frames } = E.simular(u.antes, u.nueva, true);
      onAnimando?.(true);
      s.anim = {
        frames, i: 0, piezas: piezasAnim,
        alAcabar: () => {
          v.piezas.forEach((pz) => { pon(pz); aplicar(s.mallas.get(pz.id), pz.pose); });
          sonar(u.derribo ? 'fallo' : 'carta');
          onAnimando?.(false);
        }
      };
    } else if (!s.anim) {
      v.piezas.forEach((pz) => { pon(pz); aplicar(s.mallas.get(pz.id), pz.pose); });
    }
    s.ultimaN = u?.n ?? 0;
  }, [v.ultima?.n, v.piezas.length, v.ronda]); // eslint-disable-line react-hooks/exhaustive-deps

  // Pieza fantasma (solo a quien le toca)
  useEffect(() => {
    const s = t.current; if (!s) return;
    const clave = colocar && v.proxima ? `${v.proxima.tipo}|${v.proxima.escala}|${v.turno}|${v.ultima?.n}` : '';
    if (clave !== s.fantasmaClave) {
      if (s.fantasma) { s.scene.remove(s.fantasma); s.fantasma = null; }
      if (clave) { s.fantasma = mallaDe({ ...v.proxima }, colorDe(v.turno), true); s.scene.add(s.fantasma); }
      s.fantasmaClave = clave;
    }
    if (!s.fantasma || !colocar) { s.guia.visible = false; s.marca.visible = false; return; }
    const nueva = { ...v.proxima };
    const pose = E.poseInicial(v.piezas, nueva, colocar.x, colocar.z, colocar.rotY, colocar.tumbar);
    aplicar(s.fantasma, pose);
    // Línea y marca hasta lo que hay debajo
    const caja2 = E.cajaDe(nueva, pose);
    const suelo = pose[1] - (pose[1] - caja2[1]) - 0.2;
    s.guia.visible = true; s.marca.visible = true;
    s.guia.scale.y = Math.max(0.01, caja2[1] - suelo);
    s.guia.position.set(pose[0], (caja2[1] + suelo) / 2, pose[2]);
    s.marca.position.set(pose[0], suelo + 0.02, pose[2]);
  }, [colocar?.x, colocar?.z, colocar?.rotY, colocar?.tumbar, Boolean(colocar), v.proxima?.tipo, v.proxima?.escala, v.turno, v.ultima?.n, v.piezas.length]); // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={caja} className="tor-escena" />;
}
