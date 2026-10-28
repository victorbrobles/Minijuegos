// server/routes/futbolgrid.routes.js
import express from 'express';
import crypto from 'crypto';
import GRIDS_VOL_1 from '../data/seeds/futbolgrid/categorias.js';
import GRIDS_VOL_2 from '../data/seeds/futbolgrid/categorias1.js';

const router = express.Router();

const TODOS_LOS_GRIDS = [...GRIDS_VOL_1, ...GRIDS_VOL_2];

const obtenerGridAleatorio = () => {
  const indice = Math.floor(Math.random() * TODOS_LOS_GRIDS.length);
  return TODOS_LOS_GRIDS[indice];
};

router.get('/grid', (req, res) => {
  try {
    res.json({ success: true, grid: obtenerGridAleatorio() });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error al obtener el grid' });
  }
});

const salas = new Map();

const generarCodigo = () => crypto.randomBytes(2).toString('hex').toUpperCase();
const generarToken = () => crypto.randomBytes(16).toString('hex');

const normalizar = (texto) => 
  typeof texto === 'string' ? texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim() : "";

router.post('/online/crear', (req, res) => {
  const { nombre } = req.body;
  if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' });

  const code = generarCodigo();
  const adminToken = generarToken();

  salas.set(code, {
    code,
    estado: 'lobby', 
    jugadores: [{ id: 1, nombre, token: adminToken, puntos: 0 }],
    adminId: 1,
    nextId: 2,
    gridActual: null,
    turno: 'X',
    tablero: Array(9).fill(null),
    equipos: { X: [], O: [] }
  });

  res.json({ success: true, code, token: adminToken });
});

router.post('/online/unirse', (req, res) => {
  const { code, nombre } = req.body;
  const sala = salas.get(code);
  
  if (!sala) return res.status(404).json({ error: 'Sala no encontrada o el código es incorrecto.' });
  if (sala.estado !== 'lobby') return res.status(400).json({ error: 'La partida ya ha empezado.' });
  if (sala.jugadores.length >= 6) return res.status(400).json({ error: 'La sala está llena (máximo 6 jugadores).' });

  const token = generarToken();
  sala.jugadores.push({ id: sala.nextId++, nombre, token, puntos: 0 });
  res.json({ success: true, code, token });
});

router.get('/online/sala/:code', (req, res) => {
  const { code } = req.params;
  const { token } = req.query;
  const sala = salas.get(code);

  if (!sala) return res.status(404).json({ error: 'Sala no encontrada' });
  
  const jugador = sala.jugadores.find(j => j.token === token);
  if (!jugador) return res.status(403).json({ error: 'No estás autorizado en esta sala' });

  const salaPublica = {
    ...sala,
    esAdmin: sala.adminId === jugador.id,
    yoId: jugador.id,
    jugadores: sala.jugadores.map(j => ({ id: j.id, nombre: j.nombre, puntos: j.puntos }))
  };

  res.json({ success: true, ...salaPublica });
});

router.post('/online/sala/:code/:accion', (req, res) => {
  const { code, accion } = req.params;
  const { token, celda, jugadorTexto, resultado } = req.body;
  const sala = salas.get(code);

  if (!sala) return res.status(404).json({ error: 'Sala no encontrada' });
  
  const usuario = sala.jugadores.find(j => j.token === token);
  if (!usuario) return res.status(403).json({ error: 'No estás en esta sala.' });

  switch (accion) {
    case 'iniciar':
      if (sala.adminId !== usuario.id) return res.status(403).json({ error: 'Sólo el anfitrión puede iniciar.' });
      sala.estado = 'jugando';
      sala.gridActual = obtenerGridAleatorio();
      sala.tablero = Array(9).fill(null);
      
      sala.equipos = { X: [], O: [] };
      sala.jugadores.forEach((j, i) => {
        if (i % 2 === 0) sala.equipos.X.push({ id: j.id, nombre: j.nombre });
        else sala.equipos.O.push({ id: j.id, nombre: j.nombre });
      });
      sala.turno = 'X';
      break;

    case 'validar':
      if (celda >= 0 && celda < 9) {
        if (resultado === 'fallo') {
          sala.turno = sala.turno === 'X' ? 'O' : 'X';
          return res.json({ success: true, correcto: false, mensaje: 'Tiempo agotado o fallo directo' });
        }

        const filaIndex = Math.floor(celda / 3);
        const colIndex = celda % 3;
        const respuestasValidas = sala.gridActual.respuestas[filaIndex][colIndex] || [];
        
        const inputNorm = normalizar(jugadorTexto);
        const esCorrecto = respuestasValidas.some(n => 
          normalizar(n) === inputNorm || 
          normalizar(n).includes(inputNorm) || 
          inputNorm.includes(normalizar(n))
        );

        if (esCorrecto) {
          sala.tablero[celda] = sala.turno;
          sala.turno = sala.turno === 'X' ? 'O' : 'X';
          return res.json({ success: true, correcto: true });
        } else {
          sala.turno = sala.turno === 'X' ? 'O' : 'X'; 
          return res.json({ success: true, correcto: false, mensaje: 'Respuesta incorrecta' });
        }
      }
      break;

    case 'terminar':
      if (sala.adminId !== usuario.id) return res.status(403).json({ error: 'Sólo el admin.' });
      sala.estado = 'final';
      break;

    case 'reset':
      if (sala.adminId !== usuario.id) return res.status(403).json({ error: 'Sólo el admin.' });
      sala.estado = 'lobby';
      sala.tablero = Array(9).fill(null);
      break;

    case 'abandonar':
      if (sala.adminId === usuario.id) {
        salas.delete(code);
      } else {
        sala.jugadores = sala.jugadores.filter(j => j.id !== usuario.id);
      }
      break;

    default:
      return res.status(400).json({ error: 'Acción no válida.' });
  }

  res.json({ success: true });
});

export default router;
