// client/src/reto/hoy.js
// Reto de hoy (aparte de la página del reto para que el banner de la portada no la cargue entera).
import { useEffect, useState } from 'react';
import { nombreCompleto } from '../lib/identidad.js';

/** Reto de hoy y el intento del jugador (para la portada y la página). */
export function useRetoHoy() {
  const [reto, setReto] = useState(null);
  const [error, setError] = useState('');
  const cargar = () => fetch(`/api/reto/hoy?jugador=${encodeURIComponent(nombreCompleto())}`)
    .then((r) => r.json()).then((d) => (d.success ? setReto(d) : setError(d.error || 'No se ha podido cargar el reto.')))
    .catch(() => setError('No se ha podido cargar el reto.'));
  useEffect(() => { cargar(); }, []);
  return [reto, setReto, error, cargar];
}
