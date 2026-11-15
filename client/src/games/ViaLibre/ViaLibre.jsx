// client/src/games/ViaLibre/ViaLibre.jsx
// «Vía libre» (1 jugador, 3D): gira las piezas de vía (toca una casilla) para unir la estación de salida con la de
// llegada antes de que salga el tren. Puedes darle salida antes y ganar puntos por el tiempo que sobre.
// Niveles sin fin: el tablero crece, aparecen cruces y piezas señuelo, y hay menos tiempo.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { THREE, useEscena, tocado, mat } from '../Habilidad/tres.js';
import Icon from '../../components/Icon.jsx';
import { PortadaUnJugador, FinUnJugador, ConfirmarSalida, useRecord } from '../../components/UnJugador.jsx';
import { sonar, vibrar } from '../../lib/sonido.js';
import { generarNivel, recorrer, trazo, conexiones, puntosNivel, DX, DZ } from './vias.js';
import './ViaLibre.css';
import { useAbrirAyuda } from '../../lib/ayuda.js';

const ID = 'vialibre';
const fmt = (n) => n.toLocaleString('es-ES');
const VEL_TREN = 2.6; // casillas por segundo

// ---------------------------------------------------------------- Piezas 3D
const MADERA = 0x92400e; const RAIL = 0x94a3b8; const RAIL_OK = 0xfbbf24;
function construirVia(celda, matRail) {
  const g = new THREE.Group();
  for (const [a, b] of conexiones({ ...celda, rot: 0 })) {
    const pts = trazo(a, b, 12);
    // Traviesas
    for (let i = 1; i < pts.length; i += 3) {
      const [x0, z0] = pts[i - 1]; const [x1, z1] = pts[Math.min(pts.length - 1, i + 1)];
      const t = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.04, 0.1), mat(MADERA));
      t.position.set(pts[i][0], 0.07, pts[i][1]); t.rotation.y = -Math.atan2(z1 - z0, x1 - x0) + Math.PI / 2; t.receiveShadow = true; g.add(t);
    }
    // Raíles: dos líneas paralelas al trazo
    for (const lado of [-0.17, 0.17]) {
      for (let i = 0; i < pts.length - 1; i++) {
        const [x0, z0] = pts[i]; const [x1, z1] = pts[i + 1];
        const ang = Math.atan2(z1 - z0, x1 - x0); const nx = -Math.sin(ang) * lado; const nz = Math.cos(ang) * lado;
        const largo = Math.hypot(x1 - x0, z1 - z0) * (1 + Math.abs(lado) * 0.9) + 0.01;
        const r = new THREE.Mesh(new THREE.BoxGeometry(largo, 0.05, 0.045), matRail);
        r.position.set((x0 + x1) / 2 + nx, 0.11, (z0 + z1) / 2 + nz); r.rotation.y = -ang; r.castShadow = true; g.add(r);
      }
    }
  }
  return g;
}
function decoracion(tipo) {
  const g = new THREE.Group();
  if (tipo === 'arbol') {
    for (let i = 0; i < 2; i++) {
      const x = (i ? 0.18 : -0.15); const z = (i ? -0.15 : 0.15); const s = i ? 0.8 : 1;
      const tronco = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.25 * s, 6), mat(0x78350f)); tronco.position.set(x, 0.18 * s, z); g.add(tronco);
      const copa = new THREE.Mesh(new THREE.ConeGeometry(0.22 * s, 0.5 * s, 8), mat(0x15803d)); copa.position.set(x, 0.5 * s, z); copa.castShadow = true; g.add(copa);
    }
  } else if (tipo === 'roca') {
    const r = new THREE.Mesh(new THREE.DodecahedronGeometry(0.26), mat(0x78716c)); r.position.y = 0.16; r.scale.y = 0.7; r.castShadow = true; g.add(r);
  } else if (tipo === 'casa') {
    const c = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.35, 0.4), mat(0xfef3c7)); c.position.y = 0.23; c.castShadow = true; g.add(c);
    const t = new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.28, 4), mat(0xdc2626)); t.position.y = 0.54; t.rotation.y = Math.PI / 4; t.castShadow = true; g.add(t);
  } else if (tipo === 'lago') {
    const l = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.02, 20), mat(0x38bdf8, { roughness: 0.1, metalness: 0.2 })); l.position.y = 0.07; l.scale.z = 0.75; g.add(l);
  } else {
    for (let i = 0; i < 6; i++) { const f = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 5), mat([0xf472b6, 0xfacc15, 0xffffff][i % 3])); f.position.set(Math.cos(i) * 0.25, 0.1, Math.sin(i * 1.7) * 0.25); g.add(f); }
  }
  return g;
}
function estacion(color) {
  const g = new THREE.Group();
  const anden = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.12, 0.9), mat(0xd6d3d1)); anden.position.y = 0.06; anden.receiveShadow = true; g.add(anden);
  const ed = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.45, 0.32), mat(0xfde68a)); ed.position.set(0, 0.34, -0.3); ed.castShadow = true; g.add(ed);
  const tejado = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.08, 0.46), mat(color)); tejado.position.set(0, 0.6, -0.27); tejado.castShadow = true; g.add(tejado);
  return g;
}
function tren() {
  const g = new THREE.Group();
  const loco = new THREE.Group();
  const cuerpo = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.5, 14), mat(0xdc2626)); cuerpo.rotation.z = Math.PI / 2; cuerpo.position.set(0.05, 0.27, 0); cuerpo.castShadow = true; loco.add(cuerpo);
  const cabina = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.3, 0.3), mat(0x1e3a8a)); cabina.position.set(-0.2, 0.32, 0); cabina.castShadow = true; loco.add(cabina);
  const chimenea = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.16, 8), mat(0x111827)); chimenea.position.set(0.2, 0.47, 0); loco.add(chimenea);
  for (const x of [-0.18, 0.15]) for (const z of [-0.14, 0.14]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.04, 12), mat(0x111827)); w.rotation.x = Math.PI / 2; w.position.set(x, 0.12, z); loco.add(w); }
  g.add(loco);
  const vagones = [0xf59e0b, 0x22c55e].map((c) => {
    const v = new THREE.Group();
    const caja = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.24, 0.28), mat(c)); caja.position.y = 0.28; caja.castShadow = true; v.add(caja);
    for (const x of [-0.13, 0.13]) for (const z of [-0.14, 0.14]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.04, 10), mat(0x111827)); w.rotation.x = Math.PI / 2; w.position.set(x, 0.1, z); v.add(w); }
    return v;
  });
  return { loco, vagones };
}

// ---------------------------------------------------------------- Escena de un nivel
function Tablero({ nivel, onCambio, onFinTren, salidaRef }) {
  const ref = useRef(null);
  useEscena(ref, (ctx) => {
    const { scene, camera, sol } = ctx;
    const { N, celdas } = nivel;
    const off = (N - 1) / 2;
    const pos = (c, f) => new THREE.Vector3(c - off, 0, f - off);
    const prado = new THREE.Mesh(new THREE.BoxGeometry(N + 3.4, 0.3, N + 1.6), mat(0x65a30d)); prado.position.y = -0.2; prado.receiveShadow = true; scene.add(prado);
    Object.assign(sol.shadow.camera, { left: -N, right: N, top: N, bottom: -N }); sol.shadow.camera.updateProjectionMatrix();
    const matRail = mat(RAIL, { metalness: 0.6, roughness: 0.35 });
    const matRailOk = mat(RAIL_OK, { metalness: 0.6, roughness: 0.3, emissive: 0x854d0e, emissiveIntensity: 0.35 });

    const fichas = []; // { celda, grupo, via, base, c, f, giro }
    for (let f = 0; f < N; f++) for (let c = 0; c < N; c++) {
      const celda = celdas[f][c];
      const grupo = new THREE.Group(); grupo.position.copy(pos(c, f)); scene.add(grupo);
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.1, 0.96), new THREE.MeshStandardMaterial({ color: celda.tipo ? 0xa3a35c : 0x84cc16, roughness: 0.9 }));
      base.receiveShadow = true; grupo.add(base);
      let via = null;
      if (celda.tipo) { via = construirVia(celda, matRail); via.rotation.y = -(celda.rot || 0) * Math.PI / 2; grupo.add(via); }
      else grupo.add(decoracion(celda.deco));
      fichas.push({ celda, grupo, via, base, c, f, giro: via ? via.rotation.y : 0 });
    }
    // Estaciones y vías de entrada/salida
    const eIni = estacion(0x16a34a); eIni.position.copy(pos(-1, nivel.entrada)); scene.add(eIni);
    const eFin = estacion(0xdc2626); eFin.position.copy(pos(N, nivel.salida)); eFin.rotation.y = Math.PI; scene.add(eFin);
    for (const [c, f] of [[-1, nivel.entrada], [N, nivel.salida]]) { const v = construirVia({ tipo: 'recta', rot: 1 }, matRailOk); v.position.copy(pos(c, f)); scene.add(v); }
    const bandera = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.3, 4), mat(0xfacc15, { emissive: 0xfacc15, emissiveIntensity: 0.4 })); bandera.position.copy(pos(N, nivel.salida)).add(new THREE.Vector3(0, 1, 0)); bandera.rotation.x = Math.PI; scene.add(bandera);

    const { loco, vagones } = tren(); scene.add(loco, ...vagones);
    const st = { recorrido: null, d: 0, fin: false, puntos: [], tiempoFin: 0, humo: [], bloqueado: false };

    // Colocar el tren parado en la estación de salida
    const inicio = pos(-1, nivel.entrada);
    loco.position.set(inicio.x + 0.25, 0, inicio.z); vagones.forEach((v, i) => v.position.set(inicio.x - 0.25 - i * 0.5, 0, inicio.z));

    const resaltar = () => {
      const r = recorrer(nivel);
      const enRuta = new Set(r.pasos.map((p) => `${p.c},${p.f}`));
      for (const t of fichas) {
        if (!t.via) continue;
        const ok = enRuta.has(`${t.c},${t.f}`);
        t.via.traverse((m) => { if (m.isMesh && m.geometry.parameters?.height === 0.05) m.material = ok ? matRailOk : matRail; });
        t.base.material.color.set(ok ? 0xd9f99d : 0xa3a35c);
      }
      onCambio({ completa: r.exito, unidas: r.pasos.length });
    };
    resaltar();
    if (import.meta.env.DEV) {
      // Solo en desarrollo: las pruebas automáticas pueden resolver el nivel
      window.__vialibre = { resolver: () => { for (const t of fichas) if (t.celda.bien != null) { t.celda.rot = t.celda.bien; t.giro = -t.celda.bien * Math.PI / 2; } resaltar(); } };
    }

    // Salida del tren: se calcula el recorrido completo como una línea de puntos
    const darSalida = () => {
      if (st.recorrido) return;
      st.bloqueado = true;
      const r = recorrer(nivel);
      const pts = [];
      for (let i = 0; i < 6; i++) pts.push(new THREE.Vector3(inicio.x - 0.5 + i * 0.1 + 0.25, 0, inicio.z));
      for (const p of r.pasos) { const cen = pos(p.c, p.f); for (const [x, z] of trazo(p.entrada, p.salida, 10).slice(1)) pts.push(new THREE.Vector3(cen.x + x, 0, cen.z + z)); }
      if (r.exito) { const fin = pos(N, nivel.salida); for (let i = 1; i <= 6; i++) pts.push(new THREE.Vector3(fin.x - 0.5 + i * 0.1, 0, fin.z)); }
      else {
        // Avanza un poco hacia el hueco y descarrila
        const ult = r.pasos.at(-1); let base; let s;
        if (ult) { base = pos(ult.c, ult.f); s = ult.salida; } else { base = pos(-1, nivel.entrada); s = 1; }
        for (let i = 1; i <= 4; i++) pts.push(new THREE.Vector3(base.x + DX[s] * (0.5 + i * 0.08), 0, base.z + DZ[s] * (0.5 + i * 0.08)));
      }
      // Longitudes acumuladas
      const acum = [0]; for (let i = 1; i < pts.length; i++) acum.push(acum[i - 1] + pts[i].distanceTo(pts[i - 1]));
      st.recorrido = { pts, acum, exito: r.exito, motivo: r.motivo, total: acum.at(-1) };
      st.d = 0.4; sonar('turno');
    };
    salidaRef.current = darSalida;
    const enPunto = (d) => {
      const { pts, acum } = st.recorrido; d = Math.max(0, Math.min(acum.at(-1), d));
      let i = 1; while (i < acum.length - 1 && acum[i] < d) i++;
      const t = (d - acum[i - 1]) / Math.max(1e-6, acum[i] - acum[i - 1]);
      const p = pts[i - 1].clone().lerp(pts[i], t);
      return { p, ang: Math.atan2(pts[i].z - pts[i - 1].z, pts[i].x - pts[i - 1].x) };
    };
    const humoGeo = new THREE.SphereGeometry(0.08, 6, 5);

    return {
      toque(e) {
        if (st.bloqueado) return;
        const hit = tocado(ctx, e, fichas.map((t) => t.grupo));
        if (!hit) return;
        const t = fichas.find((x) => x.grupo === hit.obj);
        if (!t?.via || t.celda.tipo === 'cruce') { vibrar(10); return; }
        t.celda.rot = ((t.celda.rot || 0) + 1) % 4; t.giro -= Math.PI / 2;
        sonar('toque', { minimo: 0, vibrar: false }); vibrar(8);
        resaltar();
      },
      frame(dt, tiempo) {
        // Cámara que encaja el tablero en pantalla (más lejos en vertical)
        const anchoVis = N + 2.6; const altoVis = N + 1.8;
        const tanV = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
        const dist = Math.max(altoVis / 2 / tanV, anchoVis / 2 / (tanV * camera.aspect)) * 1.02;
        camera.position.set(0, dist * 0.86, dist * 0.5); camera.lookAt(0, 0, 0.35);
        sol.position.set(4, 14, 6);
        for (const t of fichas) if (t.via) t.via.rotation.y += (t.giro - t.via.rotation.y) * Math.min(1, dt * 16);
        bandera.position.y = 1 + Math.sin(tiempo * 3) * 0.1; bandera.rotation.y += dt * 2;
        // Humo
        for (const h of st.humo) { h.position.y += dt * 0.6; h.scale.multiplyScalar(1 + dt * 1.2); h.material.opacity -= dt * 0.7; }
        st.humo = st.humo.filter((h) => { if (h.material.opacity <= 0) { scene.remove(h); return false; } return true; });
        if (!st.recorrido || st.fin) return;
        const R = st.recorrido;
        st.d += dt * VEL_TREN;
        const a = enPunto(st.d); loco.position.copy(a.p); loco.rotation.y = -a.ang;
        vagones.forEach((v, i) => { const b = enPunto(st.d - 0.52 * (i + 1)); v.position.copy(b.p); v.rotation.y = -b.ang; });
        if (Math.random() < dt * 12) {
          const h = new THREE.Mesh(humoGeo, new THREE.MeshBasicMaterial({ color: 0xe5e7eb, transparent: true, opacity: 0.8 }));
          h.position.copy(loco.localToWorld(new THREE.Vector3(0.2, 0.55, 0))); scene.add(h); st.humo.push(h);
        }
        if (st.d >= R.total) {
          st.fin = true;
          if (R.exito) { sonar('victoria'); vibrar([30, 30, 60]); }
          else { loco.rotation.z = 0.9; loco.position.y = 0.05; vagones[0].rotation.z = -0.5; sonar('fallo'); vibrar([80, 40, 120]); }
          setTimeout(() => onFinTren({ exito: R.exito, motivo: R.motivo }), 700);
        }
      }
    };
  }, { fondo: 0x7dd3fc });
  return <div ref={ref} className="vl-lienzo" />;
}

// ---------------------------------------------------------------- Partida
export default function ViaLibre() {
  const navigate = useNavigate();
  const [fase, setFase] = useState('portada');
  const abrirAyuda = useAbrirAyuda();
  const [salir, setSalir] = useState(false);
  const [record, registrar] = useRecord(ID);
  const [nuevoRecord, setNuevoRecord] = useState(false);
  const [nivelN, setNivelN] = useState(1);
  const [nivel, setNivel] = useState(null);
  const [puntos, setPuntos] = useState(0);
  const [restante, setRestante] = useState(0);
  const [estado, setEstado] = useState('jugando'); // jugando · viaje · superado · descarrilado
  const [info, setInfo] = useState({ completa: false, unidas: 0 });
  const [resultado, setResultado] = useState(null);
  const salidaRef = useRef(null);
  const finRef = useRef(0);
  const sobranteRef = useRef(0);

  const cargarNivel = (n) => {
    const nv = generarNivel(n);
    setNivel(nv); setNivelN(n); setEstado('jugando'); setResultado(null); setInfo({ completa: false, unidas: 0 });
    finRef.current = Date.now() + nv.tiempo * 1000; setRestante(nv.tiempo);
  };
  const empezar = () => { setPuntos(0); cargarNivel(1); setFase('jugando'); };

  const salida = useCallback(() => {
    setEstado((e) => {
      if (e !== 'jugando') return e;
      sobranteRef.current = Math.max(0, (finRef.current - Date.now()) / 1000);
      salidaRef.current?.();
      return 'viaje';
    });
  }, []);
  // Cuenta atrás: al llegar a 0, el tren sale solo
  useEffect(() => {
    if (fase !== 'jugando' || estado !== 'jugando') return undefined;
    const t = setInterval(() => {
      const r = Math.max(0, (finRef.current - Date.now()) / 1000);
      setRestante(r);
      if (r <= 5 && r > 0 && Math.abs(r - Math.round(r)) < 0.05) sonar('tic', { vibrar: false });
      if (r <= 0) { clearInterval(t); salida(); }
    }, 100);
    return () => clearInterval(t);
  }, [fase, estado, salida]);

  const onFinTren = useCallback(({ exito, motivo }) => {
    if (exito) {
      const p = puntosNivel(nivelN, sobranteRef.current);
      setPuntos((x) => x + p); setResultado({ exito, puntos: p, sobrante: Math.round(sobranteRef.current) }); setEstado('superado');
    } else { setResultado({ exito, motivo }); setEstado('descarrilado'); }
  }, [nivelN]);
  const terminar = () => {
    const superados = nivelN - 1;
    setNuevoRecord(puntos > 0 && registrar(puntos, { nivel: superados })); setFase('fin');
  };

  if (fase === 'portada') {
    return <><PortadaUnJugador juegoId={ID} onJugar={empezar} onAyuda={abrirAyuda} record={record}
      textoRecord={(r) => `${fmt(r.valor)} puntos${r.nivel != null ? ` · ${r.nivel} niveles` : ''}`} /></>;
  }
  if (fase === 'fin') {
    const sup = nivelN - 1;
    return (
      <FinUnJugador icono="trophy" etiqueta={resultado?.motivo === 'vía cortada' ? 'El tren se encontró la vía cortada' : resultado?.motivo === 'dando vueltas' ? 'El tren se quedó dando vueltas' : 'El tren se salió de la vía'}
        titulo={sup >= 15 ? '¡Jefe de estación!' : sup >= 8 ? '¡Gran maquinista!' : sup >= 3 ? 'Buen viaje' : 'Descarrilamiento'}
        puntos={fmt(puntos)} unidad="puntos" nuevoRecord={nuevoRecord} record={record} textoRecord={(r) => `${fmt(r.valor)} puntos`}
        exito={sup > 0} onRepetir={empezar} onMenu={() => setFase('portada')}>
        <p className="uj-mini">🚉 Superaste {sup} {sup === 1 ? 'nivel' : 'niveles'}.</p>
      </FinUnJugador>
    );
  }
  const urgente = restante <= 5 && estado === 'jugando';
  return (
    <div className="qq-en-partida">
      <section className="game vl-escena">
        <div className="vl-caja">
          {nivel && <Tablero key={`${nivelN}-${nivel.entrada}-${nivel.salida}`} nivel={nivel} onCambio={setInfo} onFinTren={onFinTren} salidaRef={salidaRef} />}
          <div className="vl-hud">
            <button type="button" onClick={() => setSalir(true)} aria-label="Salir"><Icon name="door" size={16} /></button>
            <span>🚉 Nivel {nivelN}</span>
            <span>⭐ {fmt(puntos)}</span>
            <span className={`vl-tiempo${urgente ? ' urgente' : ''}`}>⏱️ {estado === 'jugando' ? Math.ceil(restante) : '—'}</span>
          </div>
          {estado === 'jugando' && (
            <div className="vl-abajo">
              <p>{info.completa ? '✅ ¡Ruta completa!' : `Toca las casillas para girar las vías · ${info.unidas} unidas`}</p>
              <button type="button" className={info.completa ? 'lista' : ''} onClick={salida}>🚂 ¡Salida!{info.completa ? ` +${Math.round(restante) * 5}` : ''}</button>
            </div>
          )}
          {estado === 'viaje' && <div className="vl-abajo"><p>🚂 Chuuu chuuu…</p></div>}
          {(estado === 'superado' || estado === 'descarrilado') && (
            <div className={`vl-cartel ${estado}`}>
              {estado === 'superado' ? (
                <>
                  <h3>🎉 ¡Nivel {nivelN} superado!</h3>
                  <p>+{resultado.puntos} puntos{resultado.sobrante > 0 ? ` (sobraron ${resultado.sobrante} s)` : ''}</p>
                  <button type="button" className="uj-boton grande" onClick={() => cargarNivel(nivelN + 1)}><Icon name="forward" size={20} /> Nivel {nivelN + 1}</button>
                </>
              ) : (
                <>
                  <h3>💥 ¡Descarrilamiento!</h3>
                  <p>{resultado.motivo === 'vía cortada' ? 'La vía no estaba unida.' : resultado.motivo === 'dando vueltas' ? 'El tren se quedó dando vueltas.' : 'El tren se salió del tablero.'}</p>
                  <button type="button" className="uj-boton grande" onClick={terminar}>Ver resultado</button>
                </>
              )}
            </div>
          )}
        </div>
      </section>
      {salir && <ConfirmarSalida onSeguir={() => setSalir(false)} onSalir={() => navigate('/')} />}
      
    </div>
  );
}
