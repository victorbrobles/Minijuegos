import express from 'express';
import crypto from 'crypto';

const router = express.Router();

const salas = {};

const generarCodigo = () => Math.random().toString(36).substring(2, 6).toUpperCase();
const HABITACIONES = ['Laboratorio', 'Generador', 'Comunicaciones', 'Almacén', 'Enfermería', 'Seguridad'];

router.post('/crear', (req, res) => {
  const { nombre } = req.body;
  if (!nombre) return res.status(400).json({ error: 'Falta nombre' });

  const code = generarCodigo();
  const token = crypto.randomUUID();

  salas[code] = {
    code,
    estado: 'lobby', 
    progreso: 0,
    ronda: 1,
    historialReporte: [],
    ganador: null,
    numInfectados: 2, // Por defecto
    jugadores: [{ id: 1, nombre, token, esAdmin: true, vivo: true, rol: null, habitacion: null, accion: null, voto: null, bot: false }]
  };

  res.json({ success: true, code, token });
});

router.post('/unirse', (req, res) => {
  const { nombre, joinCode } = req.body;
  const sala = salas[joinCode];
  if (!sala) return res.status(404).json({ error: 'Sala no encontrada' });
  if (sala.estado !== 'lobby') return res.status(400).json({ error: 'Partida ya empezada' });
  if (sala.jugadores.length >= 15) return res.status(400).json({ error: 'Sala llena' });

  const token = crypto.randomUUID();
  const newId = sala.jugadores.length > 0 ? Math.max(...sala.jugadores.map(j => j.id)) + 1 : 1;
  sala.jugadores.push({ id: newId, nombre, token, esAdmin: false, vivo: true, rol: null, habitacion: null, accion: null, voto: null, bot: false });
  res.json({ success: true, code: joinCode, token });
});

router.post('/sala/:code/addBot', (req, res) => {
  const { code, token } = req.body;
  const sala = salas[code];
  if (!sala || !sala.jugadores.find(j => j.token === token)?.esAdmin) return res.status(403).json({ error: 'No autorizado' });
  if (sala.jugadores.length >= 15) return res.status(400).json({ error: 'Sala llena' });

  const newId = Math.max(...sala.jugadores.map(j => j.id)) + 1;
  sala.jugadores.push({ 
    id: newId, 
    nombre: `Bot ${newId}`, 
    token: `bot_${newId}`, 
    esAdmin: false, vivo: true, rol: null, habitacion: null, accion: null, voto: null, bot: true 
  });
  res.json({ success: true });
});

router.post('/sala/:code/expulsar', (req, res) => {
  const { code, token, id } = req.body;
  const sala = salas[code];
  if (!sala || !sala.jugadores.find(j => j.token === token)?.esAdmin) return res.status(403).json({ error: 'No autorizado' });
  sala.jugadores = sala.jugadores.filter(j => j.id !== id);
  res.json({ success: true });
});

router.post('/sala/:code/config', (req, res) => {
  const { code, token, numInfectados } = req.body;
  const sala = salas[code];
  if (!sala || !sala.jugadores.find(j => j.token === token)?.esAdmin) return res.status(403).json({ error: 'No autorizado' });
  if (numInfectados) sala.numInfectados = numInfectados;
  res.json({ success: true });
});

router.get('/sala/:code', (req, res) => {
  const { code } = req.params;
  const { token } = req.query;
  const sala = salas[code];
  if (!sala) return res.status(404).json({ error: 'Sala no encontrada' });

  const yo = sala.jugadores.find(j => j.token === token);
  if (!yo) return res.status(403).json({ error: 'No autorizado' });

  const dataLimpia = {
    code: sala.code,
    estado: sala.estado,
    progreso: sala.progreso,
    ronda: sala.ronda,
    numInfectados: sala.numInfectados,
    historialReporte: sala.historialReporte,
    esAdmin: yo.esAdmin,
    ganador: sala.ganador,
    jugadores: sala.jugadores.map(j => ({
      id: j.id,
      nombre: j.nombre,
      vivo: j.vivo,
      esTu: j.token === token,
      bot: j.bot,
      esAdmin: j.esAdmin,
      rol: (j.token === token || sala.estado === 'fin') ? j.rol : null,
      habitacion: (sala.estado === 'despliegue' && j.habitacion) ? 'seleccionada' : null,
      accion: (sala.estado === 'accion' && j.accion) ? 'lista' : null,
      voto: (sala.estado === 'votacion' && j.voto) ? 'votado' : null
    }))
  };

  if (sala.estado === 'accion' && yo.rol === 'Infectado' && yo.habitacion) {
    dataLimpia.enHabitacion = sala.jugadores
      .filter(j => j.vivo && j.habitacion === yo.habitacion)
      .map(j => ({ id: j.id, nombre: j.nombre }));
  }

  res.json({ success: true, ...dataLimpia });
});

router.post('/sala/:code/iniciar', (req, res) => {
  const { code, token } = req.body;
  const sala = salas[code];
  if (!sala || !sala.jugadores.find(j => j.token === token)?.esAdmin) return res.status(403).json({ error: 'No autorizado' });
  if (sala.jugadores.length < 7) return res.status(400).json({ error: 'Mínimo 7 jugadores' });

  const numInfectados = sala.numInfectados || 2;
  let roles = Array(sala.jugadores.length).fill('Investigador');
  for(let i=0; i<numInfectados; i++) roles[i] = 'Infectado';
  roles.sort(() => Math.random() - 0.5);

  sala.jugadores.forEach((j, i) => {
    j.rol = roles[i]; j.vivo = true; j.habitacion = null; j.accion = null; j.voto = null;
  });
  
  sala.progreso = 0; sala.ronda = 1; sala.historialReporte = []; sala.estado = 'despliegue';
  automatizarBots(sala);
  res.json({ success: true });
});

router.post('/sala/:code/mover', (req, res) => {
  const { code, token, habitacion } = req.body;
  const sala = salas[code];
  const yo = sala?.jugadores.find(j => j.token === token);
  if (!yo || sala.estado !== 'despliegue' || !yo.vivo) return res.status(400).json({ error: 'Acción no válida' });

  yo.habitacion = habitacion;
  comprobarTransicionDespliegue(sala);
  res.json({ success: true });
});

router.post('/sala/:code/accion', (req, res) => {
  const { code, token, accion } = req.body;
  const sala = salas[code];
  const yo = sala?.jugadores.find(j => j.token === token);
  if (!yo || sala.estado !== 'accion' || !yo.vivo) return res.status(400).json({ error: 'Acción no válida' });

  yo.accion = accion;
  comprobarTransicionAccion(sala);
  res.json({ success: true });
});

router.post('/sala/:code/votar', (req, res) => {
  const { code, token, voto } = req.body;
  const sala = salas[code];
  const yo = sala?.jugadores.find(j => j.token === token);
  if (!yo || sala.estado !== 'votacion' || !yo.vivo) return res.status(400).json({ error: 'Acción no válida' });

  yo.voto = voto;
  comprobarTransicionVotacion(sala);
  res.json({ success: true });
});

router.post('/sala/:code/continuar', (req, res) => {
  const { code, token } = req.body;
  const sala = salas[code];
  if (!sala || !sala.jugadores.find(j => j.token === token)?.esAdmin) return res.status(403).json({ error: 'No autorizado' });
  sala.estado = 'votacion';
  automatizarBots(sala);
  res.json({ success: true });
});

router.post('/sala/:code/siguiente', (req, res) => {
  const { code, token } = req.body;
  const sala = salas[code];
  if (!sala || !sala.jugadores.find(j => j.token === token)?.esAdmin) return res.status(403).json({ error: 'No autorizado' });
  
  sala.ronda += 1;
  sala.jugadores.forEach(j => { j.habitacion = null; j.accion = null; j.voto = null; });
  sala.estado = 'despliegue';
  automatizarBots(sala);
  res.json({ success: true });
});

router.post('/sala/:code/salir', (req, res) => {
  const { code, token } = req.body;
  const sala = salas[code];
  if (sala) {
    sala.jugadores = sala.jugadores.filter(j => j.token !== token);
    if (sala.jugadores.length === 0) delete salas[code];
  }
  res.json({ success: true });
});

// --- LÓGICA INTERNA DE LA MÁQUINA DE ESTADOS Y BOTS ---

const automatizarBots = (sala) => {
  setTimeout(() => {
    const vivosBots = sala.jugadores.filter(j => j.vivo && j.bot);
    
    if (sala.estado === 'despliegue') {
      vivosBots.forEach(b => { b.habitacion = HABITACIONES[Math.floor(Math.random() * HABITACIONES.length)]; });
      comprobarTransicionDespliegue(sala);
    } 
    else if (sala.estado === 'accion') {
      vivosBots.forEach(b => {
        if (b.rol === 'Infectado') {
          // El bot infectado decide al azar si matar, sabotear o trabajar
          const enMiHab = sala.jugadores.filter(j => j.vivo && j.habitacion === b.habitacion && j.id !== b.id);
          const opciones = ['trabajar', 'sabotear'];
          enMiHab.forEach(v => opciones.push(`matar_${v.id}`));
          b.accion = opciones[Math.floor(Math.random() * opciones.length)];
        }
      });
      comprobarTransicionAccion(sala);
    }
    else if (sala.estado === 'votacion') {
      const vivosTodos = sala.jugadores.filter(j => j.vivo);
      vivosBots.forEach(b => {
        // Votan al azar a un vivo o a nadie
        const opcionesVoto = ['nadie', ...vivosTodos.filter(v => v.id !== b.id).map(v => v.id)];
        b.voto = opcionesVoto[Math.floor(Math.random() * opcionesVoto.length)];
      });
      comprobarTransicionVotacion(sala);
    }
  }, 1000); // Simulamos 1 seg de "pensamiento" del bot
};

const comprobarTransicionDespliegue = (sala) => {
  const vivos = sala.jugadores.filter(j => j.vivo);
  if (vivos.every(j => j.habitacion)) {
    // Autocompletamos acciones de investigadores (solo trabajan)
    vivos.forEach(j => { if (j.rol === 'Investigador') j.accion = 'trabajar'; });
    sala.estado = 'accion';
    automatizarBots(sala);
  }
};

const comprobarTransicionAccion = (sala) => {
  const vivos = sala.jugadores.filter(j => j.vivo);
  if (vivos.every(j => j.accion)) {
    procesarRonda(sala);
  }
};

const comprobarTransicionVotacion = (sala) => {
  const vivos = sala.jugadores.filter(j => j.vivo);
  if (vivos.every(j => j.voto)) {
    procesarVotacion(sala);
  }
};

const procesarRonda = (sala) => {
  sala.historialReporte = [];
  const vivos = sala.jugadores.filter(j => j.vivo);
  let deltaProgreso = 0;
  const muertos = [];

  vivos.forEach(j => {
    if (j.accion === 'trabajar') deltaProgreso += 5;
    if (j.accion === 'sabotear') {
      deltaProgreso -= 15;
      sala.historialReporte.push("💥 ¡Alarma: Se han saboteado las instalaciones!");
    }
    if (j.accion?.startsWith('matar_')) {
      const targetId = parseInt(j.accion.split('_')[1]);
      const victima = sala.jugadores.find(x => x.id === targetId);
      if (victima && !muertos.includes(victima.id)) {
        muertos.push(victima.id);
        sala.historialReporte.push(`💀 ¡Se ha encontrado el cadáver de ${victima.nombre} en ${victima.habitacion}!`);
      }
    }
  });

  sala.progreso = Math.max(0, sala.progreso + deltaProgreso);
  muertos.forEach(mId => sala.jugadores.find(j => j.id === mId).vivo = false);
  
  if (sala.historialReporte.length === 0) sala.historialReporte.push("La ronda ha sido tranquila...");
  
  if (!verificarFin(sala)) {
    sala.estado = 'reporte';
  }
};

const procesarVotacion = (sala) => {
  const conteo = {};
  sala.jugadores.filter(j => j.vivo).forEach(j => {
    if (j.voto !== 'nadie') conteo[j.voto] = (conteo[j.voto] || 0) + 1;
  });

  let expulsadoId = null; let max = 0; let empate = false;
  for (const [id, votos] of Object.entries(conteo)) {
    if (votos > max) { max = votos; expulsadoId = parseInt(id); empate = false; }
    else if (votos === max) empate = true;
  }

  sala.historialReporte = [];
  if (expulsadoId && !empate) {
    const exp = sala.jugadores.find(j => j.id === expulsadoId);
    exp.vivo = false;
    sala.historialReporte.push(`❄️ Habéis expulsado a la nieve a ${exp.nombre}.`);
  } else {
    sala.historialReporte.push(`⚖️ Nadie fue expulsado debido a un empate o falta de votos.`);
  }

  if (!verificarFin(sala)) {
    sala.estado = 'resultado';
  }
};

const verificarFin = (sala) => {
  const vivos = sala.jugadores.filter(j => j.vivo);
  const inf = vivos.filter(j => j.rol === 'Infectado').length;
  const inv = vivos.length - inf;

  if (sala.progreso >= 100) { sala.estado = 'fin'; sala.ganador = 'Investigadores'; return true; }
  if (inf >= inv || inf === 0) { sala.estado = 'fin'; sala.ganador = inf >= inv ? 'Infectados' : 'Investigadores'; return true; }
  return false;
};

export default router;