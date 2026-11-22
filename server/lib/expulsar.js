// server/lib/expulsar.js
// Ruta «expulsar» para los juegos con sala propia: el anfitrión quita a alguien desde la sala de espera (la ✕ de la tarjeta).
export function rutaExpulsar(router, ruta, { sala: obtenerSala, esAnfitrion }) {
  router.post(ruta, (req, res) => {
    const sala = obtenerSala(String(req.params.code || '').toUpperCase());
    if (!sala) return res.status(404).json({ error: 'La sala no existe.' });
    const token = req.body?.token;
    const yo = sala.jugadores.find((j) => j.token === token);
    if (!token || !yo || !esAnfitrion(sala, yo)) return res.status(403).json({ error: 'Solo el anfitrión.' });
    if (sala.estado !== 'lobby') return res.status(400).json({ error: 'Solo se puede quitar a alguien en la sala de espera.' });
    const id = Number(req.body?.id);
    if (id === yo.id) return res.status(400).json({ error: 'No puedes quitarte a ti mismo.' });
    const idx = sala.jugadores.findIndex((j) => j.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Ese jugador ya no está en la sala.' });
    sala.jugadores.splice(idx, 1);
    res.json({ success: true });
  });
}

/**
 * Ruta «salir» para los juegos con sala propia: quien se va deja la sala y la partida sigue sin él.
 * Si era el anfitrión, el puesto pasa al siguiente jugador; si no queda nadie, la sala se borra.
 *  · antes(sala, jugador): se llama con el jugador aún dentro (p. ej. para pasar su turno con la lógica del juego)
 *  · despues(sala, jugador, indice): se llama ya fuera (p. ej. para rehacer el orden de turnos)
 */
export function rutaSalir(router, ruta, { sala: obtenerSala, borrar, antes, despues }) {
  router.post(ruta, (req, res) => {
    const code = String(req.params.code || '').toUpperCase();
    const sala = obtenerSala(code);
    if (!sala) return res.json({ success: true });
    const token = req.body?.token;
    const idx = sala.jugadores.findIndex((j) => j.token === token);
    if (!token || idx === -1) return res.json({ success: true });
    const jugador = sala.jugadores[idx];
    try { antes?.(sala, jugador); } catch (e) { console.error('[salir]', e); }
    sala.jugadores.splice(idx, 1);
    if (!sala.jugadores.length) { borrar(code); return res.json({ success: true }); }
    if (sala.adminToken === token) sala.adminToken = sala.jugadores[0].token;
    try { despues?.(sala, jugador, idx); } catch (e) { console.error('[salir]', e); }
    res.json({ success: true });
  });
}

/** Quita a un jugador (por valor) de un orden de turnos y deja el índice del turno apuntando al que toca. */
export function quitarDeOrden(ronda, valor, campo = 'indiceTurno') {
  const k = ronda.ordenTurnos.indexOf(valor);
  if (k === -1) return false;
  ronda.ordenTurnos.splice(k, 1);
  if (k < ronda[campo]) ronda[campo] -= 1;
  if (ronda[campo] >= ronda.ordenTurnos.length) ronda[campo] = 0;
  return true;
}
