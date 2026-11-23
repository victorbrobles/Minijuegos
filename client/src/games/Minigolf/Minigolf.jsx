// client/src/games/Minigolf/Minigolf.jsx
// «Minigolf» en 3D: cada móvil simula su bola (fisica.js) y avisa al servidor; se ven las bolas de los demás.
// Apuntar: arrastra el dedo hacia atrás desde cualquier punto de la escena (como un tirachinas) y suelta.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { mejorarEscena, crea } from '../Habilidad/tres.js';
import * as CANNON from 'cannon-es';
import JuegoPulsador from '../Pulsador/JuegoPulsador.jsx';
import LocalPorTurnos from '../comun/LocalPorTurnos.jsx';
import { Hero, Pildoras, PantallaFin, useLatido, colorDe } from '../Pulsador/Vistas.jsx';
import { BloqueConfig } from '../../components/MenuJuego.jsx';
import Icon from '../../components/Icon.jsx';
import { sonar } from '../../lib/sonido.js';
import * as E from './engine.js';
import { generarHoyo, elegirRecorrido, aMundo } from './hoyos.js';
import { crearSimulador, RADIO, RADIO_HOYO } from './fisica.js';
import SEMILLAS from './semillas.json';
import './Minigolf.css';

const DT = 1 / 120;
const COLORES = { suelo: 0x4ade80, puente: 0xb45309, rampita: 0xf97316, pared: 0xf5f5f4, muro: 0xb91c1c, eje: 0x64748b };

function construirCampo(scene, sim) {
  const grupo = new THREE.Group();
  const mats = {};
  const mat = (c, extra = {}) => (mats[c] ||= new THREE.MeshStandardMaterial({ color: c, roughness: 0.75, ...extra }));
  sim.piezas.forEach((pz, i) => {
    let m;
    if (pz.forma === 'caja') {
      const color = pz.clase === 'suelo' ? (i % 2 ? 0x4ade80 : 0x46d17a) : COLORES[pz.clase] ?? 0xf5f5f4;
      m = new THREE.Mesh(new THREE.BoxGeometry(pz.su, pz.sy, pz.sv), mat(color));
      m.position.set(pz.x, pz.y, pz.z); m.quaternion.set(...pz.q);
    } else {
      m = new THREE.Mesh(new THREE.CylinderGeometry(pz.r, pz.r, pz.h, 20), mat(pz.clase === 'eje' ? COLORES.eje : 0xef4444));
      m.position.set(pz.x, pz.y, pz.z);
      if (pz.clase !== 'eje') { const anillo = new THREE.Mesh(new THREE.CylinderGeometry(pz.r + 0.01, pz.r + 0.01, pz.h * 0.3, 20), mat(0xffffff)); m.add(anillo); }
    }
    m.castShadow = pz.clase !== 'suelo'; m.receiveShadow = true;
    grupo.add(m);
  });
  // Regiones: arena, agua, turbo
  sim.regiones.forEach((r) => {
    const t = r.t; const cu = (r.u0 + r.u1) / 2; const cv = (r.v0 + r.v1) / 2;
    const [x, z] = aMundo(t, cu, cv);
    const ancho = r.u1 - r.u0; const alto = r.v1 - r.v0;
    const color = r.tipo === 'arena' ? 0xfde68a : r.tipo === 'agua' ? 0x38bdf8 : 0xfb923c;
    const plano = new THREE.Mesh(new THREE.PlaneGeometry(ancho, alto), new THREE.MeshStandardMaterial({ color, transparent: r.tipo === 'agua', opacity: 0.85, roughness: r.tipo === 'agua' ? 0.1 : 0.9 }));
    plano.rotation.x = -Math.PI / 2;
    const [fx, fz] = [[0, -1], [1, 0], [0, 1], [-1, 0]][t.dir];
    plano.rotation.z = Math.atan2(-fz, fx);
    plano.position.set(x, t.h0 + 0.012, z);
    plano.receiveShadow = true;
    grupo.add(plano);
    if (r.tipo === 'turbo') {
      const flecha = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.6, 3), mat(0xffffff));
      flecha.rotation.set(0, 0, -Math.PI / 2); const g = new THREE.Group(); g.add(flecha); g.rotation.y = Math.atan2(-fz, fx);
      g.position.set(x, t.h0 + 0.06, z); flecha.scale.y = 0.2; grupo.add(g);
    }
  });
  // Hoyo, bandera y salida
  const [hx, hy, hz] = sim.hoyo.hoyo;
  const agujero = new THREE.Mesh(new THREE.CircleGeometry(RADIO_HOYO, 32), new THREE.MeshBasicMaterial({ color: 0x0b0f0c }));
  agujero.rotation.x = -Math.PI / 2; agujero.position.set(hx, hy + 0.013, hz); grupo.add(agujero);
  const mastil = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.6, 8), mat(0xe5e7eb)); mastil.position.set(hx, hy + 0.8, hz); grupo.add(mastil);
  const bandera = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.38), new THREE.MeshStandardMaterial({ color: 0xef4444, side: THREE.DoubleSide })); bandera.position.set(hx + 0.3, hy + 1.4, hz); grupo.add(bandera);
  const [sx, sy, sz] = sim.hoyo.salida;
  const salida = new THREE.Mesh(new THREE.CircleGeometry(0.32, 24), new THREE.MeshBasicMaterial({ color: 0x166534 })); salida.rotation.x = -Math.PI / 2; salida.position.set(sx, sy + 0.012, sz); grupo.add(salida);
  // Obstáculos que se mueven
  const moviles = sim.moviles.map((mv) => {
    const geo = mv.tipo === 'molino' ? new THREE.BoxGeometry(mv.largo, 0.32, 0.22) : new THREE.BoxGeometry(0.6, 0.4, mv.ancho);
    const m = new THREE.Mesh(geo, mat(mv.tipo === 'molino' ? 0x7c3aed : 0x2563eb)); m.castShadow = true; grupo.add(m);
    return { mv, m };
  });
  scene.add(grupo);
  return { grupo, moviles, bandera };
}

function Juego3D({ v, enviar, local, yoId }) {
  const caja = useRef(null);
  const g = useRef(null);
  const [aviso, setAviso] = useState(null);
  const [aerea, setAerea] = useState(false);
  const [potencia, setPotencia] = useState(0);
  const actual = v.actual;
  const hoyo = useMemo(() => (actual ? generarHoyo(actual.n, actual.semilla) : null), [actual?.n, actual?.semilla]); // eslint-disable-line react-hooks/exhaustive-deps
  const activoId = local ? v.turno : yoId;
  const yo = v.jugadores.find((j) => j.id === activoId);
  const vRef = useRef(v); vRef.current = v;
  const aereaRef = useRef(aerea); aereaRef.current = aerea;
  const mostrar = (t) => { setAviso(t); setTimeout(() => setAviso(null), 1800); };

  // Montaje del renderer (una vez)
  useEffect(() => {
    const el = caja.current;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.shadowMap.enabled = true;
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    mejorarEscena(renderer, scene, { cielo: [0x38bdf8, 0xe0f2fe], niebla: [40, 110], exposicion: 1.05 });
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 200);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x2f5d3a, 1.0));
    const sol = new THREE.DirectionalLight(0xffffff, 1.4); sol.position.set(10, 20, 6); sol.castShadow = true;
    sol.shadow.mapSize.set(1024, 1024); Object.assign(sol.shadow.camera, { left: -25, right: 25, top: 25, bottom: -25, near: 1, far: 80 });
    scene.add(sol, sol.target);
    const cesped = crea.suelo(400, 400, 0x166534, { celda: 3, contraste: 0.05, lineas: false }); cesped.position.y = -4; scene.add(cesped);
    // Parque alrededor del campo: árboles, rocas, flores y un lago
    { const azar = (a, b) => a + Math.random() * (b - a);
      for (let i = 0; i < 70; i++) { const ang = Math.random() * Math.PI * 2; const d = azar(28, 90); const x = Math.cos(ang) * d; const z = Math.sin(ang) * d;
        const tronco = crea.cilindro(0.35, 0.5, 3, 0x78350f, 8); tronco.position.set(x, -2.5, z); scene.add(tronco);
        const copa = new THREE.Mesh(new THREE.IcosahedronGeometry(azar(1.8, 3.2), 0), new THREE.MeshStandardMaterial({ color: [0x15803d, 0x16a34a, 0x4d7c0f][i % 3], roughness: 0.8, flatShading: true })); copa.position.set(x, azar(0.2, 1.4), z); copa.castShadow = true; scene.add(copa); }
      for (let i = 0; i < 30; i++) { const ang = Math.random() * Math.PI * 2; const d = azar(25, 70); const roca = new THREE.Mesh(new THREE.DodecahedronGeometry(azar(0.6, 1.6), 0), new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.9, flatShading: true })); roca.position.set(Math.cos(ang) * d, -3.6, Math.sin(ang) * d); scene.add(roca); }
      for (let i = 0; i < 120; i++) { const ang = Math.random() * Math.PI * 2; const d = azar(24, 60); const flor = new THREE.Mesh(new THREE.SphereGeometry(0.18, 6, 4), new THREE.MeshStandardMaterial({ color: [0xf472b6, 0xfacc15, 0xffffff, 0xa78bfa][i % 4] })); flor.position.set(Math.cos(ang) * d, -3.85, Math.sin(ang) * d); scene.add(flor); }
      const lago = new THREE.Mesh(new THREE.CircleGeometry(14, 40), new THREE.MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.05, metalness: 0.3, transparent: true, opacity: 0.85 })); lago.rotation.x = -Math.PI / 2; lago.position.set(-45, -3.95, 30); scene.add(lago); }
    const bola = new THREE.Mesh(new THREE.SphereGeometry(RADIO, 24, 16), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 }));
    bola.castShadow = true; scene.add(bola);
    const flecha = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), 1, 0x22c55e, 0.35, 0.22); flecha.visible = false; scene.add(flecha);
    const st = { renderer, scene, camera, bola, flecha, sol, campo: null, sim: null, fantasmas: new Map(), yaw: -Math.PI / 2, camPos: new THREE.Vector3(0, 6, 8), camMira: new THREE.Vector3(), apunte: null, golpes: 0, ultimoEnvio: 0, clave: '', activo: null, hundida: false };
    g.current = st;
    const ajustar = () => { renderer.setSize(el.clientWidth, el.clientHeight); camera.aspect = el.clientWidth / el.clientHeight; camera.updateProjectionMatrix(); };
    ajustar(); const ro = new ResizeObserver(ajustar); ro.observe(el);
    let raf; let ant = performance.now(); let acum = 0;
    const bucle = (ahora) => {
      raf = requestAnimationFrame(bucle);
      const s = st.sim; if (!s) { renderer.render(scene, camera); return; }
      acum += Math.min(0.1, (ahora - ant) / 1000); ant = ahora;
      while (acum >= DT) { acum -= DT; const ev = s.paso(DT); if (ev) alEvento(ev); }
      // Bola y obstáculos
      const p = s.bola.position;
      if (!st.hundida) { bola.position.set(p.x, p.y, p.z); const vel = s.bola.velocity; const vh = Math.hypot(vel.x, vel.z); if (vh > 0.01) bola.rotateOnWorldAxis(new THREE.Vector3(vel.z, 0, -vel.x).normalize(), (vh * (1 / 60)) / RADIO); }
      else bola.position.y += (s.hoyo.hoyo[1] - 0.3 - bola.position.y) * 0.15;
      st.campo?.moviles.forEach(({ mv, m }) => { m.position.copy(mv.body.position); m.quaternion.copy(mv.body.quaternion); });
      if (st.campo) st.campo.bandera.rotation.y = Math.sin(ahora / 400) * 0.25;
      // Bolas de los demás (se acercan suavemente a la última posición conocida)
      st.fantasmas.forEach((f) => { f.m.position.lerp(f.objetivo, 0.15); });
      // Envío de la posición mientras rueda (online)
      if (s.moviendo && !local && ahora - st.ultimoEnvio > 350) { st.ultimoEnvio = ahora; enviar('estado', { golpes: st.golpes, pos: [p.x, p.y - RADIO, p.z] }); }
      // Cámara
      const fw = new THREE.Vector3(Math.cos(st.yaw), 0, Math.sin(st.yaw));
      if (aereaRef.current) {
        const xs = s.hoyo.casillas.map((t) => t.cx); const zs = s.hoyo.casillas.map((t) => t.cz);
        const cx = (Math.min(...xs) + Math.max(...xs)) / 2; const cz = (Math.min(...zs) + Math.max(...zs)) / 2;
        const ext = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...zs) - Math.min(...zs)) + 6;
        st.camPos.lerp(new THREE.Vector3(cx + 0.01, ext * 1.15 + 4, cz + ext * 0.35), 0.08); st.camMira.lerp(new THREE.Vector3(cx, 0, cz), 0.1);
      } else {
        st.camPos.lerp(new THREE.Vector3(p.x - fw.x * 5.2, p.y + 3.4, p.z - fw.z * 5.2), 0.08);
        st.camMira.lerp(new THREE.Vector3(p.x + fw.x * 1.5, p.y, p.z + fw.z * 1.5), 0.12);
      }
      camera.position.copy(st.camPos); camera.lookAt(st.camMira);
      sol.position.set(p.x + 10, 20, p.z + 6); sol.target.position.set(p.x, 0, p.z);
      // Flecha de apuntar
      if (st.apunte?.pot > 0.04) {
        const d = st.apunte.dir; flecha.visible = true; flecha.position.set(p.x, p.y, p.z);
        flecha.setDirection(new THREE.Vector3(d[0], 0, d[1])); flecha.setLength(0.6 + st.apunte.pot * 3.2, 0.35, 0.22);
        flecha.setColor(new THREE.Color().setHSL(0.33 - st.apunte.pot * 0.33, 0.9, 0.5));
      } else flecha.visible = false;
      renderer.render(scene, camera);
    };
    const alEvento = (ev) => {
      const s = st.sim; const p = s.bola.position; const pos = [p.x, p.y - RADIO, p.z];
      if (ev === 'embocada') { st.hundida = true; sonar('acierto'); mostrar(st.golpes === 1 ? '⛳ ¡HOYO EN UNO!' : '⛳ ¡Dentro!'); enviar('estado', { golpes: st.golpes, pos: s.hoyo.hoyo, embocada: true }); return; }
      if (ev === 'agua' || ev === 'fuera') { st.golpes += 1; sonar('fallo'); mostrar(ev === 'agua' ? '💦 ¡Al agua! +1 golpe' : '🕳️ ¡Fuera! +1 golpe'); enviar('estado', { golpes: st.golpes, pos: s.ultimoReposo, parada: true }); apuntarAlObjetivo(); return; }
      if (ev === 'parada') { enviar('estado', { golpes: st.golpes, pos, parada: true }); apuntarAlObjetivo(); }
    };
    const apuntarAlObjetivo = () => {
      const s = st.sim; const p = s.bola.position; const ci = s.casillaDe(); const h = s.hoyo;
      const obj = ci >= h.casillas.length - 1 ? [h.hoyo[0], h.hoyo[2]] : h.paso[ci + 1];
      st.yaw = Math.atan2(obj[1] - p.z, obj[0] - p.x);
    };
    st.apuntarAlObjetivo = apuntarAlObjetivo;
    raf = requestAnimationFrame(bucle);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); renderer.dispose(); el.removeChild(renderer.domElement); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Hoyo nuevo (o cambio de turno en un solo móvil): se monta el campo y se coloca la bola
  useEffect(() => {
    const st = g.current; if (!st || !hoyo) return;
    const clave = `${v.hoyo}-${hoyo.n}`;
    if (st.clave !== clave) {
      if (st.campo) st.scene.remove(st.campo.grupo);
      st.sim = crearSimulador(hoyo, CANNON);
      st.campo = construirCampo(st.scene, st.sim);
      st.clave = clave; st.activo = null;
      st.fantasmas.forEach((f) => st.scene.remove(f.m)); st.fantasmas.clear();
    }
    if (st.activo !== activoId) {
      st.activo = activoId;
      st.hundida = Boolean(yo?.terminado);
      st.golpes = yo?.golpes || 0;
      st.sim.colocar(yo?.pos || hoyo.salida);
      st.bola.material.color.set(local ? colorDe(activoId) : 0xffffff);
      st.apuntarAlObjetivo();
    }
  }, [hoyo, v.hoyo, activoId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Bolas de los demás
  useEffect(() => {
    const st = g.current; if (!st?.sim) return;
    v.jugadores.forEach((j) => {
      if (j.id === activoId || j.fuera) { const f = st.fantasmas.get(j.id); if (f) { st.scene.remove(f.m); st.fantasmas.delete(j.id); } return; }
      let f = st.fantasmas.get(j.id);
      const pos = j.pos || hoyo.salida;
      const objetivo = new THREE.Vector3(pos[0], (j.terminado ? hoyo.hoyo[1] - 0.25 : pos[1]) + RADIO, pos[2]);
      if (!f) {
        const m = new THREE.Mesh(new THREE.SphereGeometry(RADIO, 16, 12), new THREE.MeshStandardMaterial({ color: colorDe(j.id), transparent: !local, opacity: local ? 1 : 0.7 }));
        m.position.copy(objetivo); st.scene.add(m); f = { m, objetivo }; st.fantasmas.set(j.id, f);
      }
      f.objetivo = objetivo; f.m.visible = !j.terminado;
    });
  }, [v.jugadores, activoId, hoyo]); // eslint-disable-line react-hooks/exhaustive-deps

  const puedo = v.fase === 'jugando' && yo && !yo.terminado && (!local || v.turno === activoId);
  // Apuntar: arrastrar hacia atrás y soltar
  const abajo = (e) => {
    const st = g.current; if (!puedo || st.sim.moviendo || aerea) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    st.apunte = { x0: e.clientX, y0: e.clientY, dir: [Math.cos(st.yaw), Math.sin(st.yaw)], pot: 0 };
  };
  const mover = (e) => {
    const st = g.current; if (!st.apunte) return;
    const dx = e.clientX - st.apunte.x0; const dy = e.clientY - st.apunte.y0;
    const f = [Math.cos(st.yaw), Math.sin(st.yaw)]; const r = [-f[1], f[0]];
    const arr = [r[0] * dx + f[0] * -dy, r[1] * dx + f[1] * -dy]; const l = Math.hypot(...arr);
    if (l > 2) st.apunte.dir = [-arr[0] / l, -arr[1] / l];
    st.apunte.pot = Math.min(1, Math.hypot(dx, dy) / 170);
    setPotencia(st.apunte.pot);
  };
  const arriba = () => {
    const st = g.current; const a = st.apunte; st.apunte = null; setPotencia(0);
    if (!a || a.pot < 0.06 || !puedo) return;
    st.golpes += 1;
    st.sim.golpear(a.dir[0], a.dir[1], a.pot);
    st.yaw = Math.atan2(a.dir[1], a.dir[0]);
    sonar('toque', { minimo: 0 });
    enviar('estado', { golpes: st.golpes, pos: st.sim.ultimoReposo });
  };
  const girar = (k) => { g.current.yaw += k * (Math.PI / 8); };

  return (
    <div className="mg-caja">
      <div ref={caja} className="mg-escena" onPointerDown={abajo} onPointerMove={mover} onPointerUp={arriba} onPointerCancel={arriba} />
      <div className="mg-info"><b>Hoyo {v.hoyo + 1}/{v.hoyos}</b> · Par {hoyo?.par} · Golpes {yo?.golpes ?? 0}{local && yo ? ` · ${yo.nombre}` : ''}</div>
      {potencia > 0 && <div className="mg-potencia"><i style={{ width: `${potencia * 100}%`, background: `hsl(${120 - potencia * 120} 85% 50%)` }} /></div>}
      {aviso && <div className="mg-aviso">{aviso}</div>}
      <div className="mg-camara">
        <button type="button" onClick={() => girar(-1)} aria-label="Girar cámara a la izquierda">⟲</button>
        <button type="button" onClick={() => setAerea(!aerea)} className={aerea ? 'sel' : ''} aria-label="Vista aérea">🗺️</button>
        <button type="button" onClick={() => girar(1)} aria-label="Girar cámara a la derecha">⟳</button>
      </div>
      {puedo && !aerea && <p className="mg-ayuda">Arrastra hacia atrás y suelta para golpear</p>}
    </div>
  );
}

function Tarjeta({ v, hasta }) {
  const pares = v.recorrido.slice(0, hasta).map((h) => generarHoyo(h.n, h.semilla).par);
  return (
    <div className="mg-tarjeta-caja">
      <table className="mg-tarjeta">
        <thead><tr><th>Hoyo</th>{pares.map((_, i) => <th key={i}>{i + 1}</th>)}<th>Total</th></tr><tr className="par"><td>Par</td>{pares.map((p, i) => <td key={i}>{p}</td>)}<td>{pares.reduce((a, b) => a + b, 0)}</td></tr></thead>
        <tbody>
          {v.jugadores.filter((j) => !j.fuera).map((j) => (
            <tr key={j.id}><td style={{ color: colorDe(j.id) }}>{j.nombre}</td>
              {pares.map((p, i) => { const gg = j.tarjeta[i]; return <td key={i} className={gg == null ? '' : gg === 1 ? 'uno' : gg < p ? 'bajo' : gg > p ? 'sobre' : 'par'}>{gg ?? '·'}</td>; })}
              <td><b>{j.tarjeta.slice(0, hasta).reduce((a, b) => a + b, 0)}</b></td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CuentaAtras({ v }) {
  useLatido(250);
  const base = useRef({ ahora: v.ahora, local: Date.now() });
  if (base.current.ahora !== v.ahora) base.current = { ahora: v.ahora, local: Date.now() };
  if (!v.limite) return null;
  return <span>{Math.max(0, Math.ceil((v.limite - (v.ahora + Date.now() - base.current.local)) / 1000))}s</span>;
}

function Partida({ v, enviar, onSalir, admin, local }) {
  const turno = v.jugadores.find((j) => j.id === v.turno);
  const titulo = v.fase === 'resumen' ? 'Tarjeta de puntuación' : local ? `Turno de ${turno?.nombre ?? '…'}` : '¡Todos a la vez!';
  const extra = (j) => (j.terminado ? <small className="mg-ok">✓</small> : null);
  return (
    <>
      <Hero v={v} juego={JUEGO} onSalir={onSalir} chip={`⛳ Hoyo ${v.hoyo + 1}/${v.hoyos}`} etiqueta={v.fase === 'resumen' ? 'Fin del hoyo' : 'Minigolf'} titulo={titulo} orden="asc" turno={local ? v.turno : null} extra={extra} />
      <Juego3D v={v} enviar={enviar} local={local} yoId={v.yo?.id} />
      {v.fase === 'jugando' && !local && v.limite && <p className="mg-tiempo">⏱️ Tiempo para el hoyo: <CuentaAtras v={v} /></p>}
      {v.fase === 'resumen' && (
        <div className="pzp-tarjeta">
          <Tarjeta v={v} hasta={v.hoyo + 1} />
          {(local || admin) ? <button type="button" className="pzp-boton grande" onClick={() => enviar('siguiente')}>{v.hoyo + 1 >= v.hoyos ? '🏆 Ver resultados' : `⛳ Hoyo ${v.hoyo + 2}`}</button>
            : <p className="pzp-esperando">Siguiente hoyo en <CuentaAtras v={v} /></p>}
        </div>
      )}
      {admin && !local && v.fase === 'jugando' && <div className="pzp-barra estatica"><button type="button" className="pzp-enlace" onClick={() => enviar('forzar')}><Icon name="forward" size={15} /> Terminar el hoyo para todos</button></div>}
    </>
  );
}

function Fin(props) {
  const v = props.v;
  const vista = { ...v, jugadores: v.fin.tabla.map((t) => ({ ...t, tarjeta: t.tarjeta })), recorrido: v.recorrido };
  return (
    <PantallaFin {...props}>
      <div className="pzp-tarjeta"><p className="pzp-etiqueta">Tarjeta final</p><Tarjeta v={vista} hasta={v.hoyos} /></div>
      {props.children}
    </PantallaFin>
  );
}

function Config({ config, onCambiar }) {
  return (
    <BloqueConfig titulo="Hoyos">
      <Pildoras opciones={E.OPCIONES_HOYOS.map((n) => [n, `${n} hoyos`])} valor={config.hoyos} onCambiar={onCambiar && ((hoyos) => onCambiar({ hoyos }))} />
    </BloqueConfig>
  );
}

const JUEGO = {
  id: 'minigolf',
  api: '/api/minigolf',
  emoji: '⛳',
  config: { hoyos: 9 },
  menosEsMejor: true,
  unidadPuntos: 'golpes',
  Partida: (props) => <Partida {...props} admin={props.admin ?? props.sala?.esAdmin} />,
  Fin,
  Config,
  Local: (props) => <LocalPorTurnos {...props} E={E} />,
  cargarItems: async () => elegirRecorrido(SEMILLAS),
  textoEmpezar: '¡Al tee!',
  notaSala: '⛳ Todos juegan el mismo hoyo a la vez, cada uno desde su móvil.',
  ganador: (n) => (n.length > 1 ? `¡${n.join(' y ')} empatan con los mismos golpes!` : `¡${n[0]} gana el recorrido!`),
  detalleFin: (j) => (j.vsPar === 0 ? 'al par' : j.vsPar > 0 ? `+${j.vsPar} sobre el par` : `${j.vsPar} bajo el par`),
};

export default function Minigolf({ onExit }) {
  return <JuegoPulsador juego={JUEGO} onExit={onExit} />;
}
