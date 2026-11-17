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
