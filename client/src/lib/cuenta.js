// client/src/lib/cuenta.js
// Cuenta de usuario (correo + contraseña + nick). La sesión la guarda el servidor en una cookie segura: aquí solo se
// pregunta quién eres, se entra, se sale y se sincronizan los datos del navegador (favoritos, récords, logros,
// ajustes…) para tenerlos en cualquier móvil.
import { useSyncExternalStore } from 'react';
import { guardarIdentidad, olvidarIdentidad, leerIdentidad, textoIdentidad } from './identidad.js';
import { aplicarDatos, recopilar } from './copiaPerfil.js';

let estado = { cargando: true, usuario: null };
const oyentes = new Set();
const poner = (n) => { estado = { ...estado, ...n }; oyentes.forEach((f) => f()); };

export const useCuenta = () => useSyncExternalStore((f) => { oyentes.add(f); return () => oyentes.delete(f); }, () => estado);
export const cuentaActual = () => estado.usuario;

async function pedir(url, opciones = {}) {
  const r = await fetch(url, { credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, ...opciones });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || 'No se pudo conectar. Inténtalo de nuevo.');
  return d;
}

/* ───────── Sincronización de los datos del navegador ───────── */
let ultimaSubida = '';
export async function subirDatos({ alSalir = false } = {}) {
  if (!estado.usuario) return;
  const datos = recopilar();
  const texto = JSON.stringify(datos);
  if (texto === ultimaSubida) return;
  try {
    await fetch('/api/usuarios/datos', { method: 'PUT', credentials: 'same-origin', keepalive: alSalir && texto.length < 60000,
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ datos }) });
    ultimaSubida = texto;
  } catch { /* se volverá a intentar */ }
}
/** Trae los datos de la cuenta y los junta con los de este navegador (lo de la cuenta manda). */
async function bajarDatos() {
  try {
    const { datos } = await pedir('/api/usuarios/datos');
    if (datos && Object.keys(datos).length) aplicarDatos(datos);
  } catch { /* sin datos */ }
}

let sincronizando = false;
function empezarSincronizacion() {
  if (sincronizando) return;
  sincronizando = true;
  setInterval(() => subirDatos(), 2 * 60 * 1000);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') subirDatos({ alSalir: true }); });
}

/* ───────── Inactividad: 15 minutos sin tocar la app cierran la sesión ───────── */
export const INACTIVIDAD_MS = 15 * 60 * 1000;
const ULTIMA = 'minijuegos_ultima_actividad';
const AVISO = 'minijuegos_aviso_entrada';
const leerUltima = () => { try { return Number(localStorage.getItem(ULTIMA)) || 0; } catch { return 0; } };
const guardarUltima = (t) => { try { localStorage.setItem(ULTIMA, String(t)); } catch { /* nada */ } };
let ultimoLatido = 0;
let vigilando = false;

/** Cierra la sesión por inactividad y vuelve a la pantalla de entrada (en «Iniciar sesión», con un aviso). */
async function cerrarPorInactividad() {
  if (!estado.usuario) return;
  try { sessionStorage.setItem('minijuegos_entrada_modo', 'entrar'); sessionStorage.setItem(AVISO, 'inactividad'); } catch { /* nada */ }
  await salir();
}
const caducada = () => estado.usuario && leerUltima() && Date.now() - leerUltima() > INACTIVIDAD_MS;
function actividad() {
  if (!estado.usuario) return;
  if (caducada()) { cerrarPorInactividad(); return; } // vuelves tras más de 15 minutos: hay que entrar otra vez
  const ahora = Date.now();
  guardarUltima(ahora);
  if (ahora - ultimoLatido > 60 * 1000) {
    ultimoLatido = ahora;
    fetch('/api/usuarios/latido', { method: 'POST', credentials: 'same-origin' })
      .then((r) => { if (r.status === 401) cerrarPorInactividad(); }).catch(() => {});
  }
}
function vigilarInactividad() {
  if (vigilando) return;
  vigilando = true;
  ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach((ev) => window.addEventListener(ev, actividad, { capture: true, passive: true }));
  setInterval(() => { if (caducada()) cerrarPorInactividad(); }, 20 * 1000);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && caducada()) cerrarPorInactividad(); });
}
/** Aviso para la pantalla de entrada («Tu sesión se cerró por inactividad»); se lee una sola vez. */
export function avisoEntrada() {
  try { const a = sessionStorage.getItem(AVISO); if (a) sessionStorage.removeItem(AVISO); return a; } catch { return null; }
}

const entrarComo = (u) => {
  guardarIdentidad(u.nick, u.tag);
  guardarUltima(Date.now()); ultimoLatido = Date.now();
  poner({ usuario: u, cargando: false });
  empezarSincronizacion();
  vigilarInactividad();
};

/** Al cargar la web: ¿hay sesión iniciada? Si la hay, entras directamente con tu nick. */
export async function iniciarCuenta() {
  try {
    const { usuario, caducada: cerradaPorServidor } = await pedir('/api/usuarios/yo');
    // Al volver a abrir la app tras más de 15 minutos sin usarla, la sesión ya no vale
    const inactiva = usuario && leerUltima() && Date.now() - leerUltima() > INACTIVIDAD_MS;
    if (cerradaPorServidor || inactiva) {
      try { sessionStorage.setItem(AVISO, 'inactividad'); } catch { /* nada */ }
      if (inactiva) { try { await pedir('/api/usuarios/salir', { method: 'POST' }); } catch { /* nada */ } }
    }
    if (usuario && !inactiva) {
      const primeraVez = !sessionStorage.getItem('minijuegos_cuenta_sync');
      if (primeraVez) { await bajarDatos(); try { sessionStorage.setItem('minijuegos_cuenta_sync', '1'); } catch { /* nada */ } }
      entrarComo(usuario);
      subirDatos();
      return;
    }
    // Sin sesión: si el nick con el que estabas jugando pertenece a una cuenta (p. ej. ha caducado la sesión o se
    // ha cambiado la contraseña), hay que volver a iniciar sesión para usarlo
    const yo = leerIdentidad();
    if (yo && !(await nombreLibre(textoIdentidad(yo)))) {
      try { sessionStorage.setItem('minijuegos_entrada_modo', 'entrar'); } catch { /* nada */ }
      olvidarIdentidad();
    }
  } catch { /* sin conexión: se sigue como invitado */ }
  poner({ cargando: false, usuario: null });
}

export async function registrar({ email, password, nick, tag }) {
  const { usuario } = await pedir('/api/usuarios/registro', { method: 'POST', body: JSON.stringify({ email, password, nick, tag }) });
  try { sessionStorage.setItem('minijuegos_cuenta_sync', '1'); } catch { /* nada */ }
  entrarComo(usuario);
  await subirDatos(); // lo que ya tenías en este móvil pasa a tu cuenta
  return usuario;
}

export async function entrar({ email, password }) {
  const { usuario } = await pedir('/api/usuarios/entrar', { method: 'POST', body: JSON.stringify({ email, password }) });
  await bajarDatos();
  try { sessionStorage.setItem('minijuegos_cuenta_sync', '1'); } catch { /* nada */ }
  entrarComo(usuario);
  await subirDatos();
  return usuario;
}

export async function salir() {
  await subirDatos();
  try { await pedir('/api/usuarios/salir', { method: 'POST' }); } catch { /* nada */ }
  try { sessionStorage.removeItem('minijuegos_cuenta_sync'); } catch { /* nada */ }
  poner({ usuario: null });
  olvidarIdentidad();
}

export const cambiarPassword = (actual, nueva) => pedir('/api/usuarios/password', { method: 'POST', body: JSON.stringify({ actual, nueva }) });

export async function borrarCuenta(password) {
  await pedir('/api/usuarios/borrar', { method: 'POST', body: JSON.stringify({ password }) });
  try { sessionStorage.removeItem('minijuegos_cuenta_sync'); } catch { /* nada */ }
  poner({ usuario: null });
  olvidarIdentidad();
}

/** ¿Está libre este Nick#número para jugar sin cuenta? */
export async function nombreLibre(jugador) {
  try { return (await pedir(`/api/usuarios/libre?jugador=${encodeURIComponent(jugador)}`)).libre !== false; } catch { return true; }
}
