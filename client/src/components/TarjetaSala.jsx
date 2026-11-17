// client/src/components/TarjetaSala.jsx
// Sala de espera online: cada jugador es una tarjeta con su avatar de cuerpo entero CALENTANDO antes del partido
// (5 ejercicios lentos: estiramiento lateral, círculos de brazos, brazo cruzado y cuello, pierna fuera, zancada lateral), su nombre debajo y, para el anfitrión, la ✕ para quitarlo.
// Las animaciones son CSS (TarjetaSala.css) y solo mueven piezas ya dibujadas; con «menos animaciones», quietos.
import React, { useMemo, useState } from 'react';
import AvatarSVG from './AvatarSVG.jsx';
import { useJugadorCompleto } from '../lib/caras.js';
import { usePerfiles } from '../lib/perfil.js';
import { leerAvatar, avatarDeNombre } from '../lib/avatarPartes.js';
import './TarjetaSala.css';

const BAILES = 5;
function semilla(texto) {
  let h = 2166136261;
  for (const ch of String(texto)) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

export function TarjetaSala({ nombre, yo = false, anfitrion = false, indice = 0, children }) {
  const completo = useJugadorCompleto(nombre);
  const perfil = usePerfiles(completo ? [completo] : [])[completo];
  const propio = leerAvatar(perfil?.avatar);
  const inventado = avatarDeNombre(nombre);
  const a = propio || inventado.a;
  const fondo = propio ? perfil.color : inventado.color;
  const estilo = useMemo(() => {
    const h = semilla(nombre);
    return { '--i': indice, '--retraso': `${-((h % 1000) / 1000) * 6}s`, '--velocidad': `${5.5 + ((h >> 10) % 7) / 4}s`, '--c': fondo };
  }, [nombre, indice, fondo]);
  const baile = semilla(`${nombre}*`) % BAILES;
  return (
    <div className={`ts-tarjeta${yo ? ' yo' : ''}`} style={estilo}>
      <div className="ts-escenario">
        <div className={`ts-personaje ts-baile-${baile}`}><AvatarSVG a={a} modo="cuerpo" tam={48} /></div>
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
      {(!max || jugadores.length < max) && <div className="ts-hueco"><b>+</b>Esperando…</div>}
    </div>
  );
}
