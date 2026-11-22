// client/src/components/GrupoGlobal.jsx
// Lo que pasa «por detrás» en toda la web con las salas online y el grupo activo:
//
//  · Cualquier sala: quien deja el juego (portada u otro juego) sale de la sala y la partida sigue
//    sin él; si era el anfitrión, el puesto pasa al siguiente jugador.
//  · Grupo activo con 2 o más miembros online:
//      - el administrador del grupo anuncia la sala online en la que está; si la cierra o sale del juego, se cierra;
//      - los demás entran solos en su sala de espera (si están jugando a otra cosa, les sale un aviso con «Entrar»);
//        si el grupo ya está jugando, esperan a la siguiente partida;
//      - quien no es el administrador no puede crear partidas online (sí unirse con código).
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGrupoActivo, grupoActivoAhora, grupoEnJuego, anunciarPartida, cerrarPartidaGrupo, entrarEnPartida, pilotoActivo, codigoEnPantalla, CREAR_PARTIDA } from '../lib/grupoActivo.js';
import { salaReciente, salirDeSala } from '../lib/salaViva.js';
import { cuentaActual } from '../lib/cuenta.js';
import { partirNombre } from '../lib/identidad.js';
import { metaDe } from '../games/meta.js';
import './GrupoGlobal.css';

const plano = (j) => partirNombre(String(j || '')).nombre;
const juegoDeRuta = (p) => /^\/juego\/([^/?#]+)/.exec(p)?.[1] || null;

export default function GrupoGlobal() {
  const g = useGrupoActivo();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [aviso, setAviso] = useState(null);     // { tipo, texto, partida? }
  const [bloqueo, setBloqueo] = useState(false); // ventana «solo el administrador…»
  const ruta = useRef(pathname); ruta.current = pathname;
  const mem = useRef({ estuve: new Set(), descartado: new Set(), intento: {}, previa: null, ultimoAnuncio: 0, vistaSala: 0, salaAnterior: null });

  // ── Cualquier sala: quien deja el juego sale de su sala (la partida sigue sin él y, si era el anfitrión, pasa el
  //    puesto al siguiente). Con grupo, si quien se va es el administrador del grupo, además se cierra para todos (abajo).
  const rutaAnterior = useRef(pathname);
  useEffect(() => {
    const antes = juegoDeRuta(rutaAnterior.current); const ahora = juegoDeRuta(pathname);
    rutaAnterior.current = pathname;
    if (antes && antes !== ahora) salirDeSala(antes);
  }, [pathname]);
  // (al recargar la página no se sale: muchos juegos te devuelven a tu sala)
  // ── Grupo activo: el administrador anuncia su sala y los demás le siguen
  useEffect(() => {
    const paso = () => {
      const e = grupoActivoAhora();
      const yo = cuentaActual()?.jugador;
      const m = mem.current;
      if (!grupoEnJuego(e) || !yo) { m.previa = null; return; }
      const enJuego = juegoDeRuta(ruta.current);
      const p = e.partida;
      const mia = p && p.por === yo;

      if (e.soyAdmin || mia) {
        const sala = salaReciente(12000);
        const enPantalla = enJuego && !sala ? codigoEnPantalla() : null;
        if (enJuego && sala && sala.juego === enJuego) {
          m.vistaSala = Date.now();
          const estado = sala.estado || 'lobby';
          if (e.soyAdmin && (!p || p.codigo !== sala.code || p.estado !== estado || Date.now() - m.ultimoAnuncio > 5000)) {
            m.ultimoAnuncio = Date.now(); anunciarPartida({ juego: enJuego, codigo: sala.code, api: sala.api, estado });
          }
        } else if (enJuego && enPantalla) {
          // Juegos por WebSocket: solo se ve el código en la sala de espera
          if (e.soyAdmin && (!p || p.codigo !== enPantalla || Date.now() - m.ultimoAnuncio > 5000)) {
            m.ultimoAnuncio = Date.now(); anunciarPartida({ juego: enJuego, codigo: enPantalla, estado: 'lobby' });
          }
        } else if (mia) {
          // Ha salido del juego, o lleva un rato sin sala (ha cerrado la sala de espera): se cierra para el grupo
          const fuera = enJuego !== p.juego;
          const sinSala = m.vistaSala && Date.now() - m.vistaSala > 12000;
          if (fuera || sinSala) { m.vistaSala = 0; cerrarPartidaGrupo(p.codigo); }
        }
        return;
      }

      // Miembros
      if (!p) {
        // El administrador ha cerrado la sala: si estabas en ella, vuelves a la portada
        if (m.previa && enJuego === m.previa.juego) {
          const previa = m.previa; m.previa = null;
          navigate('/');
          setAviso({ tipo: 'info', texto: `${plano(previa.por)} ha cerrado la sala del grupo.` });
        }
        m.previa = null;
        return;
      }
      const clave = `${p.codigo}:${p.ronda}`;
      const sala = salaReciente(12000);
      const dentro = enJuego === p.juego && ((sala && sala.code === p.codigo) || codigoEnPantalla() === p.codigo || pilotoActivo(p.juego));
      if (dentro) { m.estuve.add(clave); m.previa = p; return; }
      if (m.estuve.has(clave) || m.descartado.has(clave)) return; // se salió por su cuenta: entrará en la siguiente
      if (p.estado !== 'lobby') {
        // Llega tarde: el grupo ya está jugando
        setAviso((a) => (a?.clave === clave ? a : { tipo: 'tarde', clave, texto: `Tu grupo está jugando a «${metaDe(p.juego).titulo}». Entrarás en la siguiente partida.` }));
        return;
      }
      // Sala de espera abierta: si estás jugando a otra cosa, aviso; si no (o vienes de la partida anterior del grupo), entras
      const ocupado = enJuego && !(m.previa && enJuego === m.previa.juego);
      if (ocupado) {
        setAviso((a) => (a?.clave === clave && a.tipo === 'entrar' ? a : { tipo: 'entrar', clave, partida: p, texto: `${plano(p.por)} ha abierto «${metaDe(p.juego).titulo}» para el grupo.` }));
        return;
      }
      if (Date.now() - (m.intento[clave] || 0) < 30000) return;
      m.intento[clave] = Date.now();
      setAviso(null);
      entrarEnPartida(p.juego, p.codigo, navigate, p.api);
    };
    const t = setInterval(paso, 1200);
    return () => clearInterval(t);
  }, [navigate]);

  // ── Solo el administrador del grupo crea partidas online
  useEffect(() => {
    const clic = (ev) => {
      const e = grupoActivoAhora();
      if (!grupoEnJuego(e) || e.soyAdmin || !juegoDeRuta(ruta.current)) return;
      const b = ev.target.closest?.('button, [role="button"]');
      if (!b || !b.closest('.game-shell')) return;
      const texto = (b.innerText || b.textContent || '').replace(/\s+/g, ' ').trim();
      if (!CREAR_PARTIDA.test(texto)) return;
      ev.preventDefault(); ev.stopPropagation(); ev.stopImmediatePropagation();
      setBloqueo(true);
    };
    document.addEventListener('click', clic, true);
    return () => document.removeEventListener('click', clic, true);
  }, []);

  // Los avisos informativos se van solos
  useEffect(() => {
    if (!aviso || aviso.tipo === 'entrar') return undefined;
    const t = setTimeout(() => setAviso(null), aviso.tipo === 'tarde' ? 9000 : 6000);
    return () => clearTimeout(t);
  }, [aviso]);
  // Si deja de haber partida, el aviso de «Entrar» sobra
  useEffect(() => { if (aviso?.tipo === 'entrar' && (!g?.partida || `${g.partida.codigo}:${g.partida.ronda}` !== aviso.clave || g.partida.estado !== 'lobby')) setAviso(null); }, [g, aviso]);

  const descartar = () => { if (aviso?.clave) mem.current.descartado.add(aviso.clave); setAviso(null); };
  return (
    <>
      {aviso && createPortal(
        <div className={`gg-aviso gg-${aviso.tipo}`} role="status">
          <span className="gg-aviso-emoji" aria-hidden="true">{aviso.tipo === 'entrar' ? '🎮' : aviso.tipo === 'tarde' ? '⏳' : '👋'}</span>
          <p>{aviso.texto}</p>
          {aviso.tipo === 'entrar' && (
            <button type="button" className="gg-entrar" onClick={() => { const p = aviso.partida; mem.current.intento[aviso.clave] = Date.now(); setAviso(null); entrarEnPartida(p.juego, p.codigo, navigate, p.api); }}>Entrar</button>
          )}
          <button type="button" className="gg-cerrar" onClick={descartar} aria-label="Cerrar aviso">✕</button>
        </div>,
        document.body
      )}
      {bloqueo && createPortal(
        <div className="rg-modal-fondo aj-fondo" onClick={() => setBloqueo(false)}>
          <div className="aj-panel gg-bloqueo" role="alertdialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <span className="gg-bloqueo-ico" aria-hidden="true">👑</span>
            <h2>Solo el administrador del grupo puede iniciar un juego online</h2>
            <p>Estás con el grupo <b>«{g?.grupo?.nombre}»</b> activo{g?.admin ? <> y ahora lo dirige <b>{plano(g.admin)}</b></> : null}: cuando abra un juego, entrarás solo en su sala. Puedes unirte a otras partidas con un código.</p>
            <p className="gg-nota">Si no quieres jugar con este grupo, desactívalo en 👥 Grupos.</p>
            <div className="gg-bloqueo-botones">
              <button type="button" className="secondary" onClick={() => { setBloqueo(false); navigate(`/grupo/${g?.grupo?.codigo}`); }}>Ir al grupo</button>
              <button type="button" onClick={() => setBloqueo(false)}>Entendido</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
