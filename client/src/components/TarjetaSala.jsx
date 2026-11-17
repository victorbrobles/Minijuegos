// client/src/components/TarjetaSala.jsx
// Sala de espera online: cada jugador es una tarjeta con su avatar de cuerpo entero CALENTANDO antes del partido
// (5 ejercicios lentos que se encadenan al azar: estiramiento lateral, círculos de brazos, brazo cruzado y cuello, pierna fuera,
// zancada lateral), su nombre debajo y, para el anfitrión, la ✕ para quitarlo.
// Las animaciones son CSS (TarjetaSala.css) y solo mueven piezas ya dibujadas; con «menos animaciones», quietos.
import React, { useEffect, useState } from 'react';
import AvatarSVG from './AvatarSVG.jsx';
import { useJugadorCompleto } from '../lib/caras.js';
import { usePerfiles } from '../lib/perfil.js';
import { leerAvatar, avatarDeNombre } from '../lib/avatarPartes.js';
import './TarjetaSala.css';

const BAILES = 5;
const azar = (min, max) => min + Math.random() * (max - min);
/** Ejercicio y ritmo al azar; al acabar cada repetición (1 o 2 seguidas) pasa a otro ejercicio también al azar. */
function useCalentamiento() {
  const [paso, setPaso] = useState(() => ({ baile: Math.floor(Math.random() * BAILES), velocidad: azar(5.5, 7.5), retraso: 0, n: 0 }));
  useEffect(() => {
    // La primera vez empieza a mitad de la repetición para que no vayan todos a la vez
    if (paso.n === 0 && paso.retraso === 0) {
      const retraso = Math.random() * paso.velocidad;
      setPaso((p) => ({ ...p, retraso }));
      return undefined;
    }
    const restante = paso.velocidad * (paso.n === 0 ? 1 : 1 + Math.floor(Math.random() * 2)) - paso.retraso;
    const t = setTimeout(() => {
      setPaso((p) => {
        let baile = Math.floor(Math.random() * (BAILES - 1));
        if (baile >= p.baile) baile += 1; // siempre uno distinto al anterior
        return { baile, velocidad: azar(5.5, 7.5), retraso: 0.0001, n: p.n + 1 };
      });
    }, restante * 1000);
    return () => clearTimeout(t);
  }, [paso]);
  return paso;
}

export function TarjetaSala({ nombre, yo = false, anfitrion = false, indice = 0, children }) {
  const completo = useJugadorCompleto(nombre);
  const perfil = usePerfiles(completo ? [completo] : [])[completo];
  const propio = leerAvatar(perfil?.avatar);
  const inventado = avatarDeNombre(nombre);
  const a = propio || inventado.a;
  const fondo = propio ? perfil.color : inventado.color;
  const { baile, velocidad, retraso } = useCalentamiento();
  const estilo = { '--i': indice, '--retraso': `${-retraso}s`, '--velocidad': `${velocidad}s`, '--c': fondo };
  return (
    <div className={`ts-tarjeta${yo ? ' yo' : ''}`} style={estilo}>
      <div className="ts-escenario">
        <div className={`ts-personaje ts-baile-${baile}`}><AvatarSVG a={a} modo="cuerpo" tam={60} /></div>
      </div>
      <span className="ts-nombre">{anfitrion ? '👑 ' : ''}{nombre}{yo ? ' (tú)' : ''}</span>
      {children && <span className="ts-extra">{children}</span>}
    </div>
  );
}

/** Rejilla de tarjetas (con un hueco «esperando» si caben más).
 * `quitar` (solo para el anfitrión): { url, token } de la ruta «expulsar» del juego; pinta la ✕ en las tarjetas de los demás. */
export function RejillaSala({ jugadores, yoId, anfitrionId, max, renderExtra, quitar }) {
  const [quitados, setQuitados] = useState(() => new Set());
  const expulsar = async (j) => {
    setQuitados((q) => new Set(q).add(j.id));
    try {
      const res = await fetch(quitar.url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: quitar.token, id: j.id }) });
      if (!res.ok) throw new Error();
    } catch {
      setQuitados((q) => { const n = new Set(q); n.delete(j.id); return n; });
    }
  };
  return (
    <div className="ts-rejilla">
      {jugadores.filter((j) => !quitados.has(j.id)).map((j, i) => {
        const yo = j.id === yoId || Boolean(j.esTu);
        const anfitrion = j.id === anfitrionId || Boolean(j.esAdmin || j.admin);
        return (
          <TarjetaSala key={j.id} nombre={j.nombre} yo={yo} anfitrion={anfitrion} indice={i}>
            {renderExtra?.(j)}
            {quitar && !yo && !anfitrion && (
              <button type="button" className="ts-quitar" onClick={() => expulsar(j)} aria-label={`Quitar a ${j.nombre} de la sala`} title="Quitar de la sala">Quitar</button>
            )}
          </TarjetaSala>
        );
      })}
      {(!max || jugadores.length < max) && <div className="ts-hueco"><b>+</b>Esperando a más gente…</div>}
    </div>
  );
}
