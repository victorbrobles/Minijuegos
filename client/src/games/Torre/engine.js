// client/src/games/Torre/engine.js
// «Torre Inestable»: motor puro (salas online en server/routes/torre.js y modo un dispositivo).
// Por turnos, cada jugador recibe una pieza, elige dónde dejarla encima de la torre y cómo girarla, y la suelta.
// La física (cannon-es) decide: si alguna pieza cae de la plataforma, quien soltó ha derribado la torre y pierde
// la ronda (el resto suma 1). Las piezas son cada vez más pequeñas y raras. El servidor simula cada caída y los
// móviles la repiten con el mismo cálculo para animarla.
// La librería de física se inyecta con usarFisica(CANNON) (el servidor y el cliente la tienen en sitios distintos).
import { PIEZAS, PLATAFORMA, volumen, verticesCuna, CARAS_CUNA, puntosPieza } from './piezas.js';

export const OPCIONES_RONDAS = [1, 3, 5];
export const SEG_TURNO = 40;
const GRAVEDAD = -20;
const PASO = 1 / 60;
const MAX_PASOS = 330;
const LIMITE_MESA = 2.6;
export const MESA_Y = -1.3; // superficie de la mesa (la plataforma está a 0)
// Ha caído si alguna parte de la pieza baja de la plataforma
const caida = (b) => { b.updateAABB(); return b.aabb.lowerBound.y < -0.6; }; // hasta dónde se puede soltar (centro de la pieza)
let C = null;
export function usarFisica(cannon) { C = cannon; }

const jug = (p, id) => p.jugadores.find((j) => j.id === id);
const activos = (p) => p.jugadores.filter((j) => !j.fuera);
const actual = (p) => p.jugadores[p.turno];
const r4 = (x) => Math.round(x * 10000) / 10000;

/* ───────── Cuaterniones (sin librerías) ───────── */
const qMul = ([ax, ay, az, aw], [bx, by, bz, bw]) => [aw * bx + ax * bw + ay * bz - az * by, aw * by - ax * bz + ay * bw + az * bx, aw * bz + ax * by - ay * bx + az * bw, aw * bw - ax * bx - ay * by - az * bz];
const qEje = ([x, y, z], ang) => { const s = Math.sin(ang / 2); return [x * s, y * s, z * s, Math.cos(ang / 2)]; };
export function rotar([qx, qy, qz, qw], [vx, vy, vz]) {
  const ix = qw * vx + qy * vz - qz * vy; const iy = qw * vy + qz * vx - qx * vz; const iz = qw * vz + qx * vy - qy * vx; const iw = -qx * vx - qy * vy - qz * vz;
  return [ix * qw + iw * -qx + iy * -qz - iz * -qy, iy * qw + iw * -qy + iz * -qx - ix * -qz, iz * qw + iw * -qz + ix * -qy - iy * -qx];
}
/** Orientación elegida: giro sobre el eje vertical (grados) y, si se tumba, 90° sobre el eje X antes. */
export function orientacion(rotY = 0, tumbar = false) {
  const y = qEje([0, 1, 0], (rotY * Math.PI) / 180);
  return tumbar ? qMul(y, qEje([1, 0, 0], Math.PI / 2)) : y;
}
/** Caja (AABB) de una pieza colocada: [minX, minY, minZ, maxX, maxY, maxZ]. */
export function cajaDe(pieza, pose) {
  const q = pose.slice(3, 7);
  const pts = puntosPieza(PIEZAS[pieza.tipo], pieza.escala).map((v) => rotar(q, v));
  const caja = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
  pts.forEach(([x, y, z]) => { caja[0] = Math.min(caja[0], x); caja[1] = Math.min(caja[1], y); caja[2] = Math.min(caja[2], z); caja[3] = Math.max(caja[3], x); caja[4] = Math.max(caja[4], y); caja[5] = Math.max(caja[5], z); });
  return [caja[0] + pose[0], caja[1] + pose[1], caja[2] + pose[2], caja[3] + pose[0], caja[4] + pose[1], caja[5] + pose[2]];
}

/** Dónde empieza a caer la pieza nueva: justo encima de lo que tenga debajo. */
export function poseInicial(piezas, nueva, x, z, rotY, tumbar) {
  const q = orientacion(rotY, tumbar);
  const xx = Math.max(-LIMITE_MESA, Math.min(LIMITE_MESA, Number(x) || 0));
  const zz = Math.max(-LIMITE_MESA, Math.min(LIMITE_MESA, Number(z) || 0));
  const local = cajaDe(nueva, [0, 0, 0, ...q]);
  const huella = [xx + local[0], zz + local[2], xx + local[3], zz + local[5]];
  let techo = Math.abs(xx) <= PLATAFORMA / 2 + 1 && Math.abs(zz) <= PLATAFORMA / 2 + 1 ? 0 : -5;
  piezas.forEach((pz) => {
    const c = cajaDe(pz, pz.pose);
    if (c[0] < huella[2] + 0.05 && c[3] > huella[0] - 0.05 && c[2] < huella[3] + 0.05 && c[5] > huella[1] - 0.05) techo = Math.max(techo, c[4]);
  });
  return [xx, techo - local[1] + 0.2, zz, ...q].map(r4);
}

/* ───────── Física ───────── */
function cuerpo(pieza, pose) {
  const def = PIEZAS[pieza.tipo]; const k = pieza.escala;
  const b = new C.Body({ mass: Math.max(0.2, volumen(def, k)), allowSleep: true, sleepSpeedLimit: 0.12, sleepTimeLimit: 0.5, linearDamping: 0.04, angularDamping: 0.08 });
  def.partes.forEach((pt) => {
    const o = new C.Vec3(pt.o[0] * k, pt.o[1] * k, pt.o[2] * k);
    if (pt.forma === 'caja') b.addShape(new C.Box(new C.Vec3((pt.t[0] * k) / 2, (pt.t[1] * k) / 2, (pt.t[2] * k) / 2)), o);
    else if (pt.forma === 'cilindro') b.addShape(new C.Cylinder(pt.r * k, pt.r * k, pt.h * k, 14), o);
    else b.addShape(new C.ConvexPolyhedron({ vertices: verticesCuna(pt.t).map(([x, y, z]) => new C.Vec3(x * k, y * k, z * k)), faces: CARAS_CUNA }), o);
  });
  b.position.set(pose[0], pose[1], pose[2]);
  b.quaternion.set(pose[3], pose[4], pose[5], pose[6]);
  return b;
}

/**
 * Simula la caída de `nueva` sobre la torre `piezas`. Devuelve { poses (en el orden de piezas + nueva), derribo, frames? }.
 * Con conFrames, guarda la pose de cada paso (para animar en el móvil).
 */
export function simular(piezas, nueva, conFrames = false) {
  if (!C) throw new Error('Falta la librería de física (usarFisica).');
  const mundo = new C.World({ gravity: new C.Vec3(0, GRAVEDAD, 0), allowSleep: true });
  mundo.solver.iterations = 25;
  mundo.defaultContactMaterial.friction = 0.7;
  mundo.defaultContactMaterial.restitution = 0.02;
  const base = new C.Body({ mass: 0, type: C.Body.STATIC });
  base.addShape(new C.Box(new C.Vec3(PLATAFORMA / 2, 0.25, PLATAFORMA / 2)));
  base.position.set(0, -0.25, 0);
  mundo.addBody(base);
  // La mesa (las piezas que caen se quedan encima)
  const mesa = new C.Body({ mass: 0, type: C.Body.STATIC });
  mesa.addShape(new C.Box(new C.Vec3(7, 0.3, 7)));
  mesa.position.set(0, MESA_Y - 0.3, 0);
  mundo.addBody(mesa);
  const cuerpos = piezas.map((pz) => { const b = cuerpo(pz, pz.pose); mundo.addBody(b); b.sleep(); return b; });
  const nuevo = cuerpo(nueva, nueva.pose);
  mundo.addBody(nuevo);
  cuerpos.push(nuevo);
  const frames = [];
  let derribo = false;
  for (let i = 0; i < MAX_PASOS; i++) {
    mundo.step(PASO);
    if (conFrames && i % 2 === 0) frames.push(cuerpos.map((b) => [b.position.x, b.position.y, b.position.z, b.quaternion.x, b.quaternion.y, b.quaternion.z, b.quaternion.w]));
    if (!derribo && i % 3 === 0 && cuerpos.some(caida)) derribo = true;
    if (i > 40 && cuerpos.every((b) => b.sleepState === C.Body.SLEEPING)) break;
    if (derribo && i > 220) break;
  }
  const poses = cuerpos.map((b) => [b.position.x, b.position.y, b.position.z, b.quaternion.x, b.quaternion.y, b.quaternion.z, b.quaternion.w].map(r4));
  return { poses, derribo, frames };
}

/* ───────── Partida ───────── */
const barajar = (l) => { const a = [...l]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
function sortearPieza(n) {
  const nivel = n < 4 ? 0 : n < 10 ? 1 : 2;
  const pool = Object.keys(PIEZAS).filter((k) => PIEZAS[k].nivel <= nivel);
  // Las de su nivel salen más a menudo
  const pesos = pool.flatMap((k) => Array(PIEZAS[k].nivel === nivel ? 3 : 1).fill(k));
  const tipo = pesos[Math.floor(Math.random() * pesos.length)];
  const escala = Math.max(0.6, Math.round((1 - n * 0.022 + (Math.random() * 0.08 - 0.04)) * 100) / 100);
  return { tipo, escala };
}

export function crearPartida(jugadores, items = [], reglas = {}, ahora = Date.now()) {
  const p = {
    fase: 'turno', ronda: 1, rondas: OPCIONES_RONDAS.includes(reglas.rondas) ? reglas.rondas : 3, reglas: { online: Boolean(reglas.online) },
    jugadores: barajar(jugadores).map((j) => ({ id: j.id, nombre: j.nombre, puntos: 0, derribos: 0, colocadas: 0, fuera: false })),
    turno: 0, piezas: [], contador: 0, proxima: null, ultima: null, perdedor: null, altura: 0, mejorAltura: 0, limite: null, fin: null
  };
  nuevaRonda(p, ahora, 0);
  return p;
}

function nuevaRonda(p, ahora, turno) {
  p.piezas = []; p.colocadasRonda = 0; p.altura = 0; p.ultima = null; p.perdedor = null; p.fase = 'turno';
  p.turno = turno;
  if (actual(p).fuera) p.turno = siguiente(p, p.turno);
  empezarTurno(p, ahora);
}
function siguiente(p, i) { let n = i; do { n = (n + 1) % p.jugadores.length; } while (p.jugadores[n].fuera && n !== i); return n; }
function empezarTurno(p, ahora) {
  p.proxima = sortearPieza(p.colocadasRonda);
  p.limite = p.reglas.online ? ahora + SEG_TURNO * 1000 : null;
}

export function soltar(p, id, d = {}, ahora = Date.now()) {
  if (p.fase !== 'turno') return { ok: false, error: 'Ahora no se puede soltar.' };
  const a = actual(p);
  if (id !== a.id) return { ok: false, error: `Es el turno de ${a.nombre}.` };
  p.contador += 1;
  const nueva = { id: p.contador, tipo: p.proxima.tipo, escala: p.proxima.escala, por: a.id };
  nueva.pose = poseInicial(p.piezas, nueva, d.x, d.z, Number(d.rotY) || 0, Boolean(d.tumbar));
  const antes = p.piezas.map((pz) => ({ ...pz }));
  const r = simular(p.piezas, nueva);
  p.piezas = [...p.piezas, nueva].map((pz, i) => ({ ...pz, pose: r.poses[i] }));
  p.ultima = { n: p.contador, antes, nueva: { ...nueva }, derribo: r.derribo, por: a.id };
  a.colocadas += 1;
  if (r.derribo) {
    a.derribos += 1;
    activos(p).forEach((j) => { if (j.id !== a.id) j.puntos += 1; });
    p.perdedor = a.id;
    p.fase = 'derribo';
    p.limite = null;
    return { ok: true, derribo: true };
  }
  p.colocadasRonda += 1;
  p.altura = Math.max(0, ...p.piezas.map((pz) => cajaDe(pz, pz.pose)[4]));
  p.mejorAltura = Math.max(p.mejorAltura, p.altura);
  p.turno = siguiente(p, p.turno);
  empezarTurno(p, ahora);
  return { ok: true, derribo: false };
}

/** Tras un derribo: otra ronda (empieza el siguiente al que la tiró) o el final. */
export function seguir(p, ahora = Date.now()) {
  if (p.fase !== 'derribo') return { ok: false, error: 'Ahora no.' };
  if (p.ronda >= p.rondas) return terminar(p);
  p.ronda += 1;
  nuevaRonda(p, ahora, siguiente(p, p.jugadores.findIndex((j) => j.id === p.perdedor)));
  return { ok: true };
}

export function terminar(p) {
  const tabla = p.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: j.puntos, derribos: j.derribos, colocadas: j.colocadas, fuera: j.fuera }))
    .sort((a, b) => Number(a.fuera) - Number(b.fuera) || b.puntos - a.puntos || a.derribos - b.derribos || b.colocadas - a.colocadas);
  let puesto = 0; let previo = null;
  tabla.forEach((t, i) => { const k = `${t.puntos}|${t.derribos}`; if (k !== previo) { puesto = i + 1; previo = k; } t.puesto = puesto; });
  const max = Math.max(0, ...tabla.filter((t) => !t.fuera).map((t) => t.puntos));
  p.fase = 'fin'; p.limite = null;
  p.fin = { tabla, max, ganadores: tabla.filter((t) => !t.fuera && t.puntos === max && t.derribos === tabla[0].derribos).map((t) => t.id), mejorAltura: p.mejorAltura };
  return { ok: true };
}

/** Si se acaba el tiempo (o el anfitrión no espera), la pieza se suelta en el centro tal cual. */
export function forzar(p, ahora = Date.now()) {
  if (p.fase === 'turno') return soltar(p, actual(p).id, { x: 0, z: 0 }, ahora);
  if (p.fase === 'derribo') return seguir(p, ahora);
  return { ok: true };
}
export function tick(p, ahora = Date.now()) {
  if (p.fase === 'turno' && p.limite && ahora >= p.limite) forzar(p, ahora);
}
export function abandonar(p, id, ahora = Date.now()) {
  const j = jug(p, id);
  if (!j || p.fase === 'fin') return;
  const suyo = p.fase === 'turno' && actual(p).id === id;
  j.fuera = true;
  if (activos(p).length < 2) { terminar(p); return; }
  if (suyo) { p.turno = siguiente(p, p.turno); empezarTurno(p, ahora); }
}

export function accion(p, id, d, ahora = Date.now()) {
  const actor = id ?? (p.fase === 'turno' ? actual(p).id : null);
  switch (d.tipo) {
    case 'soltar': return soltar(p, actor, d, ahora);
    case 'seguir': return seguir(p, ahora);
    default: return null;
  }
}
/** Todo se juega a la vista: no hace falta pasar el móvil en secreto. */
export function turnoLocal() { return null; }

export function vistaDe(p, id, ahora = Date.now()) {
  const yo = jug(p, id);
  return {
    fase: p.fase, ronda: p.ronda, rondas: p.rondas, turno: p.fase === 'turno' ? actual(p).id : null, ahora, limite: p.limite,
    jugadores: p.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: j.puntos, derribos: j.derribos, fuera: j.fuera })),
    yo: yo ? { id: yo.id } : null, piezas: p.piezas, proxima: p.proxima, ultima: p.ultima, perdedor: p.perdedor,
    altura: Math.round(p.altura * 10) / 10, colocadas: p.colocadasRonda, fin: p.fin
  };
}
