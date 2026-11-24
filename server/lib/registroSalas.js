// server/lib/registroSalas.js
// Registro común de las salas online de TODOS los juegos, para el panel de administración («Salas en directo»).
// Cada juego guarda sus salas a su manera (objeto o Map, con un nombre u otro): aquí cada router expone su almacén
// con `exponerSalas(router, almacen, acciones)` y, al arrancar, `recogerSalas(app)` busca los routers montados en
// /api/<juego> que lo hayan hecho. Las acciones extra (forzar, terminar, jugador de prueba…) solo las tienen los
// juegos montados con lib/salasJuego.js, que conocen el motor de la partida.

const juegos = new Map(); // juego -> { almacen, acciones }

/** Llamar en cada router que tenga salas. `acciones`: { expulsar, forzar, terminar, prueba } opcionales. */
export function exponerSalas(router, almacen, acciones = {}) {
  router.__salas = { almacen, acciones };
}

/** Recorre los routers montados en /api/<juego> y apunta los que exponen salas. */
export function recogerSalas(app) {
  const pila = app?._router?.stack || [];
  pila.forEach((capa) => {
    const info = capa.handle?.__salas;
    if (!info) return;
    const m = /\^\\\/api\\\/([a-z0-9-]+)/i.exec(capa.regexp?.source || '');
    if (m) juegos.set(m[1], info);
  });
  return juegos.size;
}

const entradas = (almacen) => (almacen instanceof Map ? [...almacen.entries()] : Object.entries(almacen || {}));
const nombreDe = (j) => String(j?.nombre ?? j?.name ?? j?.jugador ?? '¿?');
const estadoDe = (s) => s?.partida?.fase || s?.estado || s?.fase || s?.status || (s?.partida ? 'jugando' : 'sala de espera');
const rondaDe = (s) => {
  const p = s?.partida || s;
  const r = p?.ronda ?? p?.round ?? p?.manga ?? null; const t = p?.rondas ?? p?.totalRondas ?? p?.mangas ?? null;
  return r != null ? (t != null ? `${r}/${t}` : String(r)) : null;
};
const instante = (s) => s?.ultimaActividad || s?.actividad || s?.lastActivity || s?.creada || s?.creado || s?.createdAt || null;

/** Resumen de todas las salas abiertas. */
export function listarSalas() {
  const lista = [];
  juegos.forEach(({ almacen, acciones }, juego) => {
    entradas(almacen).forEach(([code, s]) => {
      if (!s || typeof s !== 'object') return;
      const jugadores = Array.isArray(s.jugadores) ? s.jugadores : Array.isArray(s.players) ? s.players : [];
      lista.push({
        juego, code: String(s.code || code), estado: String(estadoDe(s)), ronda: rondaDe(s),
        jugadores: jugadores.map((j, i) => ({ id: j.id ?? i, nombre: nombreDe(j), anfitrion: Boolean(s.adminToken && j.token === s.adminToken), prueba: Boolean(j.prueba) })),
        actividad: instante(s),
        acciones: { cerrar: true, expulsar: true, forzar: Boolean(acciones.forzar), terminar: Boolean(acciones.terminar), prueba: Boolean(acciones.prueba) }
      });
    });
  });
  return lista.sort((a, b) => (b.actividad || 0) - (a.actividad || 0));
}
export const totalSalas = () => listarSalas().length;

function buscar(juego, code) {
  const info = juegos.get(juego);
  if (!info) return null;
  const k = String(code);
  const sala = info.almacen instanceof Map ? (info.almacen.get(k) ?? info.almacen.get(k.toUpperCase())) : (info.almacen[k] ?? info.almacen[k.toUpperCase()]);
  return sala ? { info, sala, clave: info.almacen instanceof Map ? (info.almacen.has(k) ? k : k.toUpperCase()) : (k in info.almacen ? k : k.toUpperCase()) } : null;
}

/** Acción del administrador sobre una sala: cerrar, expulsar { id }, forzar, terminar, prueba. */
export function accionSala(juego, code, tipo, datos = {}) {
  const b = buscar(juego, code);
  if (!b) return { ok: false, error: 'Esa sala ya no existe.' };
  const { info, sala, clave } = b;
  if (tipo === 'cerrar') {
    if (info.almacen instanceof Map) info.almacen.delete(clave); else delete info.almacen[clave];
    return { ok: true };
  }
  if (tipo === 'expulsar') {
    if (info.acciones.expulsar) return info.acciones.expulsar(sala, Number(datos.id));
    const lista = Array.isArray(sala.jugadores) ? sala.jugadores : null;
    if (!lista) return { ok: false, error: 'Esta sala no tiene lista de jugadores.' };
    const i = lista.findIndex((j, k) => (j.id ?? k) === Number(datos.id));
    if (i < 0) return { ok: false, error: 'Ese jugador ya no está.' };
    const [fuera] = lista.splice(i, 1);
    if (!lista.length) return accionSala(juego, code, 'cerrar');
    if (sala.adminToken && fuera.token === sala.adminToken) sala.adminToken = lista[0].token;
    return { ok: true };
  }
  const f = info.acciones[tipo];
  if (!f) return { ok: false, error: 'Este juego no permite esa acción desde el panel.' };
  return f(sala, datos);
}
