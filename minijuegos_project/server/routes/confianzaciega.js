// server/routes/confianzaciega.js
import express from 'express';
import CATEGORIAS_NORMALES from '../data/seeds/confianzaciega/categorias.js';
import CATEGORIAS_PICANTES from '../data/seeds/confianzaciega/personalizadas.js';

const router = express.Router();

function seleccionarDosAleatorias(lista) {
  if (lista.length < 2) return [...lista];
  const idx1 = Math.floor(Math.random() * lista.length);
  let idx2 = Math.floor(Math.random() * lista.length);
  while (idx2 === idx1) {
    idx2 = Math.floor(Math.random() * lista.length);
  }
  return [lista[idx1], lista[idx2]];
}

// ==========================================
// ENDPOINTS OFFLINE / LOCAL (INTACTOS)
// ==========================================
router.get('/consignas', (req, res) => {
  try {
    const includePicantes = req.query.includePicantes === 'true';
    const soloPicantes = req.query.soloPicantes === 'true';

    let bolsa = [...CATEGORIAS_NORMALES];

    if (soloPicantes) {
      bolsa = [...CATEGORIAS_PICANTES];
    } else if (includePicantes) {
      bolsa = [...CATEGORIAS_NORMALES, ...CATEGORIAS_PICANTES];
    }

    const consignas = seleccionarDosAleatorias(bolsa);
    res.json({
      success: true,
      consignas,
      totalDisponibles: bolsa.length
    });
  } catch (error) {
    console.error('Error al obtener consignas de Confianza Ciega:', error);
    res.status(500).json({ success: false, error: 'Error del servidor al obtener consignas' });
  }
});

router.get('/stats', (req, res) => {
  res.json({
    success: true,
    normales: CATEGORIAS_NORMALES.length,
    picantes: CATEGORIAS_PICANTES.length,
    total: CATEGORIAS_NORMALES.length + CATEGORIAS_PICANTES.length
  });
});

// ==========================================
// SALAS ONLINE (MULTIDISPOSITIVO CON APUESTAS)
// ==========================================
const salasOnline = {};

function generarCodigoSala() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let c = '';
  for (let i = 0; i < 4; i++) {
    c += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return c;
}

function generarToken() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function obtenerDosConsignasSala(sala) {
  let bolsa = [...CATEGORIAS_NORMALES];
  if (sala.usarPicantes) {
    bolsa = [...CATEGORIAS_NORMALES, ...CATEGORIAS_PICANTES];
  }
  return seleccionarDosAleatorias(bolsa);
}

function prepararTurnoOnline(sala) {
  const activo = sala.jugadores[sala.ordenTurnos[sala.indiceTurno]];
  sala.jugadorActivoId = activo.id;
  sala.opcionesConsignas = obtenerDosConsignasSala(sala);
  sala.consignaElegida = null;
  sala.apuestas = {};
  sala.contadorAciertos = 0;
  sala.prepFinTs = null;
  sala.turnoFinTs = null;
  sala.resultadoRonda = null;
  sala.estado = 'eleccion_consigna';
}

function calcularPuntuacionesOnline(sala, aciertosFinales) {
  const N = sala.jugadores.length;
  const scoresRonda = {};
  sala.jugadores.forEach((j) => { scoresRonda[j.id] = 0; });
  const detalles = [];

  const apostadores = sala.jugadores.filter((j) => j.id !== sala.jugadorActivoId);

  apostadores.forEach((j) => {
    const ap = sala.apuestas[j.id] || { numero: 5, condicion: 'mas' };
    const esExacto = ap.numero === aciertosFinales;
    let acerto = false;

    if (ap.condicion === 'mas' && aciertosFinales > ap.numero) acerto = true;
    if (ap.condicion === 'menos' && aciertosFinales < ap.numero) acerto = true;

    const diff = Math.abs(ap.numero - aciertosFinales);

    detalles.push({
      jugadorId: j.id,
      nombre: j.nombre,
      numero: ap.numero,
      condicion: ap.condicion,
      esExacto,
      acerto,
      diff,
      puntosGanados: 0,
      estadoColor: esExacto ? 'azul' : (acerto ? 'verde' : 'rojo')
    });
  });

  // 1. Clavado exacto: N + 5 pts
  detalles.forEach((d) => {
    if (d.esExacto) {
      d.puntosGanados = N + 5;
      scoresRonda[d.jugadorId] = d.puntosGanados;
    }
  });

  // 2. Acertantes (no exactos): N - 1 decreciente por cercanía
  const acertantes = detalles
    .filter((d) => !d.esExacto && d.acerto)
    .sort((a, b) => a.diff - b.diff);

  acertantes.forEach((d, idx) => {
    const pts = Math.max(1, (N - 1) - idx);
    d.puntosGanados = pts;
    scoresRonda[d.jugadorId] = pts;
  });

  // 3. Fallados: penalización decreciente según error
  const fallados = detalles
    .filter((d) => !d.esExacto && !d.acerto)
    .sort((a, b) => b.diff - a.diff);

  fallados.forEach((d, idx) => {
    const pen = -Math.max(1, (N - 1) - idx);
    d.puntosGanados = pen;
    scoresRonda[d.jugadorId] = pen;
  });

  // El jugador activo suma 0 pts en su propio turno
  scoresRonda[sala.jugadorActivoId] = 0;

  // Actualizar acumulados
  sala.jugadores.forEach((j) => {
    j.puntos = (j.puntos || 0) + (scoresRonda[j.id] || 0);
  });

  sala.resultadoRonda = {
    detalles,
    scoresRonda,
    aciertosFinales,
    consignaElegida: sala.consignaElegida
  };
  sala.estado = 'resultados';
}

// 1. Crear sala online
router.post('/online/crear', (req, res) => {
  const nombre = (req.body?.nombre || '').trim();
  if (!nombre) return res.status(400).json({ error: 'Debes indicar un nombre.' });

  let code = generarCodigoSala();
  while (salasOnline[code]) code = generarCodigoSala();

  const tokenAdmin = generarToken();

  salasOnline[code] = {
    code,
    adminToken: tokenAdmin,
    estado: 'lobby', // 'lobby' | 'eleccion_consigna' | 'apuestas' | 'turno_accion' | 'validacion_final' | 'resultados' | 'final'
    usarPicantes: false,
    rondaActual: 1,
    ordenTurnos: [],
    indiceTurno: 0,
    jugadorActivoId: null,
    opcionesConsignas: [],
    consignaElegida: null,
    apuestas: {},
    contadorAciertos: 0,
    prepFinTs: null,
    turnoFinTs: null,
    resultadoRonda: null,
    jugadores: [{ id: 1, token: tokenAdmin, nombre, puntos: 0, conectado: true }]
  };

  res.json({ success: true, code, token: tokenAdmin, jugadorId: 1 });
});

// 2. Unirse a sala online
router.post('/online/unirse', (req, res) => {
  const code = (req.body?.code || '').trim().toUpperCase();
  const nombre = (req.body?.nombre || '').trim();

  const sala = salasOnline[code];
  if (!sala) return res.status(404).json({ error: 'La sala no existe o el código es incorrecto.' });
  if (sala.estado !== 'lobby') return res.status(400).json({ error: 'La partida ya ha comenzado.' });
  if (sala.jugadores.length >= 15) return res.status(400).json({ error: 'La sala está completa.' });
  if (sala.jugadores.some((j) => j.nombre.toLowerCase() === nombre.toLowerCase())) {
    return res.status(400).json({ error: 'Ya hay un jugador con ese nombre en la sala.' });
  }

  const token = generarToken();
  const nuevoId = sala.jugadores.length + 1;
  sala.jugadores.push({ id: nuevoId, token, nombre, puntos: 0, conectado: true });

  res.json({ success: true, code, token, jugadorId: nuevoId });
});

// 3. Configurar picantes en lobby
router.post('/online/sala/:code/picantes', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token, usarPicantes } = req.body || {};

  const sala = salasOnline[code];
  if (!sala || sala.adminToken !== token) return res.status(403).json({ error: 'No autorizado.' });

  sala.usarPicantes = Boolean(usarPicantes);
  res.json({ success: true, usarPicantes: sala.usarPicantes });
});

// 4. Iniciar partida desde el lobby
router.post('/online/sala/:code/iniciar', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token } = req.body || {};

  const sala = salasOnline[code];
  if (!sala) return res.status(404).json({ error: 'La sala no existe.' });
  if (sala.adminToken !== token) return res.status(403).json({ error: 'Solo el anfitrión puede iniciar.' });
  if (sala.jugadores.length < 3) return res.status(400).json({ error: 'Se necesitan al menos 3 jugadores.' });

  sala.jugadores.forEach((j) => { j.puntos = 0; });
  const primerIndex = Math.floor(Math.random() * sala.jugadores.length);
  const orden = [];
  for (let i = 0; i < sala.jugadores.length; i++) {
    orden.push((primerIndex + i) % sala.jugadores.length);
  }
  sala.ordenTurnos = orden;
  sala.indiceTurno = 0;
  sala.rondaActual = 1;

  prepararTurnoOnline(sala);
  res.json({ success: true });
});

// 5. Estado sincronizado de la sala
router.get('/online/sala/:code', (req, res) => {
  const code = req.params.code.toUpperCase();
  const token = req.query.token;

  const sala = salasOnline[code];
  if (!sala) return res.status(404).json({ error: 'La sala no existe o ha caducado.' });

  const jugadorActual = sala.jugadores.find((j) => j.token === token);
  if (!jugadorActual) return res.status(403).json({ error: 'No perteneces a esta sala.' });

  const esAdmin = sala.adminToken === token;
  const esActivo = sala.jugadorActivoId === jugadorActual.id;
  const activoJug = sala.jugadores.find((j) => j.id === sala.jugadorActivoId);

  // Avance del cronómetro durante el turno de acción
  let prepRestante = 0;
  let accionRestante = 120;

  if (sala.estado === 'turno_accion' && sala.prepFinTs && sala.turnoFinTs) {
    const ahora = Date.now();
    if (ahora < sala.prepFinTs) {
      prepRestante = Math.ceil((sala.prepFinTs - ahora) / 1000);
      accionRestante = 120;
    } else {
      prepRestante = 0;
      accionRestante = Math.max(0, Math.ceil((sala.turnoFinTs - ahora) / 1000));
      if (accionRestante <= 0 && sala.estado === 'turno_accion') {
        sala.estado = 'validacion_final';
      }
    }
  }

  // Filtrado de seguridad: solo el activo ve cuál eligió antes del turno de acción
  const consignaSecreta = (sala.estado === 'eleccion_consigna' || sala.estado === 'apuestas')
    ? (esActivo ? sala.consignaElegida : null)
    : sala.consignaElegida;

  const apostadores = sala.jugadores.filter((j) => j.id !== sala.jugadorActivoId);
  const yaAposto = Boolean(sala.apuestas[jugadorActual.id]);

  res.json({
    success: true,
    code: sala.code,
    estado: sala.estado,
    rondaActual: sala.rondaActual,
    usarPicantes: sala.usarPicantes,
    esAdmin,
    yoId: jugadorActual.id,
    esActivo,
    jugadorActivoNombre: activoJug ? activoJug.nombre : null,
    opcionesConsignas: sala.opcionesConsignas,
    consignaElegida: consignaSecreta,
    prepRestante,
    accionRestante,
    contadorAciertos: sala.contadorAciertos,
    yaAposto,
    miApuesta: sala.apuestas[jugadorActual.id] || null,
    totalApostaron: Object.keys(sala.apuestas).length,
    totalApostadores: apostadores.length,
    resultadoRonda: sala.resultadoRonda,
    jugadores: sala.jugadores.map((j) => ({
      id: j.id,
      nombre: j.nombre,
      puntos: j.puntos,
      haApostado: Boolean(sala.apuestas[j.id])
    }))
  });
});

// 6. El jugador activo elige consigna
router.post('/online/sala/:code/elegir-consigna', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token, consigna } = req.body || {};

  const sala = salasOnline[code];
  if (!sala || sala.estado !== 'eleccion_consigna') return res.status(400).json({ error: 'Fase no activa.' });

  const jugador = sala.jugadores.find((j) => j.token === token);
  if (!jugador || jugador.id !== sala.jugadorActivoId) return res.status(403).json({ error: 'Solo el jugador activo puede elegir.' });

  sala.consignaElegida = consigna;
  sala.apuestas = {};
  sala.estado = 'apuestas';

  res.json({ success: true, consigna });
});

// 7. Los demás jugadores apuestan en secreto
router.post('/online/sala/:code/apostar', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token, numero, condicion } = req.body || {};

  const sala = salasOnline[code];
  if (!sala || sala.estado !== 'apuestas') return res.status(400).json({ error: 'Fase de apuestas no activa.' });

  const jugador = sala.jugadores.find((j) => j.token === token);
  if (!jugador || jugador.id === sala.jugadorActivoId) return res.status(403).json({ error: 'El jugador activo no apuesta en su turno.' });

  sala.apuestas[jugador.id] = {
    numero: parseInt(numero, 10),
    condicion: condicion === 'menos' ? 'menos' : 'mas'
  };

  const apostadores = sala.jugadores.filter((j) => j.id !== sala.jugadorActivoId);
  if (Object.keys(sala.apuestas).length >= apostadores.length) {
    // Todos han apostado: arranca la acción con 10s prep + 120s acción
    const ahora = Date.now();
    sala.prepFinTs = ahora + 10 * 1000;
    sala.turnoFinTs = ahora + 130 * 1000;
    sala.contadorAciertos = 0;
    sala.estado = 'turno_accion';
  }

  res.json({ success: true });
});

// 8. Modificar contador de aciertos (+1 / -1) durante el turno
router.post('/online/sala/:code/ajustar-contador', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { delta } = req.body || {};

  const sala = salasOnline[code];
  if (!sala || (sala.estado !== 'turno_accion' && sala.estado !== 'validacion_final')) {
    return res.status(400).json({ error: 'No es momento de conteo.' });
  }

  const d = parseInt(delta, 10) || 0;
  sala.contadorAciertos = Math.max(0, sala.contadorAciertos + d);

  res.json({ success: true, contadorAciertos: sala.contadorAciertos });
});

// 9. Parar tiempo manualmente
router.post('/online/sala/:code/parar-tiempo', (req, res) => {
  const code = req.params.code.toUpperCase();
  const sala = salasOnline[code];
  if (!sala || sala.estado !== 'turno_accion') return res.status(400).json({ error: 'No está en acción.' });

  sala.estado = 'validacion_final';
  res.json({ success: true });
});

// 10. Confirmar aciertos y calcular resultados
router.post('/online/sala/:code/confirmar-resultados', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token, aciertosFinales } = req.body || {};

  const sala = salasOnline[code];
  if (!sala) return res.status(404).json({ error: 'La sala no existe.' });
  if (sala.adminToken !== token) return res.status(403).json({ error: 'Solo el anfitrión puede confirmar.' });

  const finales = parseInt(aciertosFinales, 10) || sala.contadorAciertos;
  calcularPuntuacionesOnline(sala, finales);

  res.json({ success: true });
});

// 11. Siguiente ronda online
router.post('/online/sala/:code/siguiente-ronda', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token } = req.body || {};

  const sala = salasOnline[code];
  if (!sala) return res.status(404).json({ error: 'La sala no existe.' });
  if (sala.adminToken !== token) return res.status(403).json({ error: 'Solo el anfitrión puede avanzar.' });

  sala.indiceTurno = (sala.indiceTurno + 1) % sala.ordenTurnos.length;
  sala.rondaActual += 1;
  prepararTurnoOnline(sala);

  res.json({ success: true });
});

// 12. Finalizar partida y ver podio
router.post('/online/sala/:code/finalizar', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token } = req.body || {};

  const sala = salasOnline[code];
  if (!sala || sala.adminToken !== token) return res.status(403).json({ error: 'No autorizado.' });

  sala.estado = 'final';
  res.json({ success: true });
});

// 13. Reiniciar partida
router.post('/online/sala/:code/reiniciar', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token } = req.body || {};

  const sala = salasOnline[code];
  if (!sala || sala.adminToken !== token) return res.status(403).json({ error: 'No autorizado.' });

  sala.estado = 'lobby';
  sala.rondaActual = 1;
  sala.indiceTurno = 0;
  sala.resultadoRonda = null;
  sala.jugadores.forEach((j) => { j.puntos = 0; });

  res.json({ success: true });
});

// 14. Salir
router.post('/online/sala/:code/salir', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token } = req.body || {};

  const sala = salasOnline[code];
  if (!sala) return res.json({ success: true });

  const idx = sala.jugadores.findIndex((j) => j.token === token);
  if (idx !== -1) {
    const saliente = sala.jugadores.splice(idx, 1)[0];
    delete sala.apuestas[saliente.id];

    if (sala.jugadores.length === 0) {
      delete salasOnline[code];
    } else if (sala.adminToken === token) {
      sala.adminToken = sala.jugadores[0].token;
    }
  }

  res.json({ success: true });
});

export default router;