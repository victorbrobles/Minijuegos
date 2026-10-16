import { Router } from 'express';
import db from '../db.js';
import seed from '../data/seeds/siglas/siglas.seed.js';
import { esCorrecta } from '../lib/normalizar.js';

const router = Router();

// Orden del menú y siglas de ejemplo (las primeras de cada categoría en el seed)
const ordenCategorias = Object.keys(seed);
const ejemplos = Object.fromEntries(
  ordenCategorias.map((c) => [c, seed[c].slice(0, 4).map((e) => e[0])])
);

// Lista de categorías con cuántas siglas tiene cada una.
// GET /api/siglas/categorias
router.get('/categorias', (_req, res) => {
  const filas = db
    .prepare('SELECT categoria, COUNT(*) AS total FROM siglas GROUP BY categoria')
    .all();
  const totales = Object.fromEntries(filas.map((f) => [f.categoria, f.total]));
  const categorias = ordenCategorias
    .filter((c) => totales[c])
    .map((c) => ({ nombre: c, total: totales[c], ejemplos: ejemplos[c] }));
  res.json({ categorias, total: filas.reduce((suma, f) => suma + f.total, 0) });
});

// Devuelve una sigla al azar (de una categoría, o de todas si no se indica) que no
// esté en la lista `excluir` (ids ya vistos).
// GET /api/siglas/siguiente?categoria=Deportes&excluir=3,7,12
router.get('/siguiente', (req, res) => {
  const categoria = typeof req.query.categoria === 'string' ? req.query.categoria : '';
  const excluir = String(req.query.excluir ?? '')
    .split(',')
    .filter(Boolean)
    .map(Number)
    .filter(Number.isInteger);

  const condiciones = [];
  const params = [];
  if (categoria) {
    condiciones.push('categoria = ?');
    params.push(categoria);
  }
  const { total } = db
    .prepare(`SELECT COUNT(*) AS total FROM siglas ${condiciones.length ? 'WHERE ' + condiciones[0] : ''}`)
    .get(...params);
  if (categoria && total === 0) {
    return res.status(404).json({ error: 'Esa categoría no existe.' });
  }

  if (excluir.length) {
    condiciones.push(`id NOT IN (${excluir.map(() => '?').join(',')})`);
    params.push(...excluir);
  }
  const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';
  const fila = db
    .prepare(`SELECT id, sigla, categoria FROM siglas ${where} ORDER BY RANDOM() LIMIT 1`)
    .get(...params);

  if (!fila) return res.json({ fin: true, total });
  res.json({ ...fila, total });
});

// Comprueba la respuesta en el servidor, para que el cliente nunca tenga las soluciones.
// POST /api/siglas/comprobar  { id, respuesta }   (respuesta vacía = se acabó el tiempo)
router.post('/comprobar', (req, res) => {
  const { id, respuesta } = req.body ?? {};
  if (!Number.isInteger(id) || typeof respuesta !== 'string' || respuesta.length > 200) {
    return res.status(400).json({ error: 'Petición no válida.' });
  }
  const fila = db.prepare('SELECT respuesta, alternativas FROM siglas WHERE id = ?').get(id);
  if (!fila) return res.status(404).json({ error: 'Esa sigla no existe.' });

  const validas = [fila.respuesta, ...JSON.parse(fila.alternativas)];
  res.json({
    correcta: esCorrecta(respuesta, validas),
    respuestaCorrecta: fila.respuesta
  });
});

export default router;
