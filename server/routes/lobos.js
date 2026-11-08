import { Router } from 'express';
import { ErrorSala, crearSala, unirse, obtener, idDe, latido, accion, vista, esperarCambio, salaExiste } from '../lobos/sala.js';

// API de «Luna de Sangre» (partida en red). El estado vive en memoria: si se reinicia el servidor, las salas se pierden.
const router = Router();

const seguro = (fn) => async (req, res) => {
  try {
    await fn(req, res);
  } catch (err) {
    if (err instanceof ErrorSala) return res.status(err.estado).json({ error: err.message });
    console.error('[lobos]', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

router.post('/crear', seguro((req, res) => {
  res.json(crearSala(req.body?.nombre));
}));

router.post('/:code/unirse', seguro((req, res) => {
  res.json(unirse(req.params.code, req.body?.nombre));
}));

// Long-polling: responde en cuanto cambia la versión (o a los ~25 s con {sinCambios:true})
router.get('/:code/estado', seguro(async (req, res) => {
  const sala = obtener(req.params.code);
  const id = idDe(sala, String(req.query.token ?? ''));
  latido(sala, id);
  const ver = Number(req.query.ver) || 0;
  await esperarCambio(sala, ver);
  const salaActual = obtener(req.params.code);
  const idActual = idDe(salaActual, String(req.query.token ?? ''));
  latido(salaActual, idActual);
  if (salaActual.ver <= ver) return res.json({ sinCambios: true, ver: salaActual.ver });
  return res.json({ vista: vista(salaActual, idActual) });
}));

router.post('/:code/accion', seguro((req, res) => {
  const sala = obtener(req.params.code);
  const id = idDe(sala, String(req.body?.token ?? ''));
  latido(sala, id);
  accion(sala, id, req.body);
  if (['abandonar', 'expulsar'].includes(req.body?.tipo) || !salaExiste(sala.code)) return res.json({ ok: true });
  return res.json({ ok: true, vista: vista(sala, id) });
}));

export default router;
