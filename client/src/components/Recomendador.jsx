// client/src/components/Recomendador.jsx
// «¿A qué jugamos hoy?»: botón de la portada que abre un recomendador de juegos.
// Dos formas de pedir: unas preguntas rápidas (cuántos sois, qué os apetece, algo nuevo o de siempre)
// o un texto libre («algo de fútbol para 4», «risas con amigos», «pensar solo»…).
// Puntúa cada juego con sus categorías, etiquetas, descripción y nº de jugadores, y con lo que ya has jugado.
import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';
import { metaDe } from '../games/meta.js';
import { LIMITES } from '../games/limites.js';
import { nombreCompleto } from '../lib/identidad.js';
import './Recomendador.css';

const norm = (t) => String(t ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9ñ\s]/g, ' ').replace(/\s+/g, ' ').trim();

const GRUPOS = [
  { id: '1', texto: 'Yo solo', emoji: '🙋', min: 1, max: 1 },
  { id: '2', texto: 'Dos', emoji: '👥', min: 2, max: 2 },
  { id: '3', texto: '3 o 4', emoji: '👨‍👩‍👦', min: 3, max: 4 },
  { id: '5', texto: '5 a 7', emoji: '🎉', min: 5, max: 7 },
  { id: '8', texto: '8 o más', emoji: '🏟️', min: 8, max: 99 }
];

// Lo que puede apetecer: categorías de la portada y palabras clave que lo delatan
const GANAS = [
  { id: 'pensar', texto: 'Pensar', emoji: '🧠', cats: ['estrategia'], kw: ['estrategia', 'deduccion', 'logica', 'puzle', 'tactica', 'deducir', 'pistas', 'planificar'], dice: ['pensar', 'cabeza', 'logica', 'estrategia', 'estrategico', 'deduccion', 'puzle', 'acertijo', 'ingenio', 'cerebro', 'tactica', 'misterio', 'detective'] },
  { id: 'reir', texto: 'Reírnos', emoji: '😂', cats: ['chill'], kw: ['risas', 'fiesta', 'humor', 'amigos', 'divertido', 'dibujar', 'inventar', 'absurdo'], dice: ['reir', 'risas', 'reirnos', 'risa', 'chill', 'tranquilo', 'relajado', 'fiesta', 'divertido', 'cachondeo', 'pasarlo', 'humor', 'gracioso'] },
  { id: 'futbol', texto: 'Fútbol', emoji: '⚽', cats: ['futbol'], kw: ['futbol', 'futbolista', 'clubes', 'equipos', 'champions', 'liga'], dice: ['futbol', 'futbolistas', 'deporte', 'deportes', 'balon', 'liga', 'champions', 'equipos', 'jugadores', 'madrid', 'barca', 'mundial'] },
  { id: 'saber', texto: 'Cultura', emoji: '📚', cats: ['prueba'], kw: ['preguntas', 'cultura', 'historia', 'geografia', 'trivia', 'saber', 'conocimiento', 'paises', 'ciencia'], dice: ['cultura', 'preguntas', 'saber', 'conocimiento', 'trivia', 'historia', 'geografia', 'ciencia', 'quiz', 'aprender', 'listo', 'paises', 'capitales'] },
  { id: 'rapido', texto: 'Velocidad', emoji: '⚡', cats: [], kw: ['rapido', 'velocidad', 'reflejos', 'tiempo', 'cronometro', 'pulsador', 'segundos', 'memoria'], dice: ['rapido', 'rapida', 'velocidad', 'reflejos', 'agilidad', 'corto', 'cortito', 'pulsador', 'contrarreloj', 'memoria', 'nervios', 'adrenalina'] },
  { id: 'enganar', texto: 'Engañar', emoji: '🕵️', cats: [], kw: ['engano', 'roles', 'traidor', 'traidores', 'impostor', 'mentir', 'farol', 'votar', 'ocultos', 'secreto', 'lobos'], dice: ['enganar', 'engano', 'mentir', 'mentiras', 'traidor', 'traicion', 'impostor', 'roles', 'farol', 'faroles', 'sospechar', 'lobo', 'lobos', 'mafia', 'bluff'] },
  { id: 'cartas', texto: 'Cartas', emoji: '🃏', cats: ['cartas'], kw: ['cartas', 'baraja', 'mano', 'apuestas'], dice: ['cartas', 'carta', 'baraja', 'naipes', 'mus', 'poker', 'apostar', 'apuestas'] },
  { id: 'famosos', texto: 'Famosos', emoji: '🌟', cats: ['famosos'], kw: ['famosos', 'cine', 'musica', 'television', 'celebridades', 'peliculas', 'series', 'cantantes'], dice: ['famosos', 'famoso', 'cine', 'peliculas', 'pelis', 'series', 'musica', 'canciones', 'cantantes', 'actores', 'tele', 'television', 'pop', 'celebridades'] }
];

const NOVEDAD = [
  { id: 'nuevo', texto: 'Sorpréndeme con algo que no haya jugado', emoji: '✨' },
  { id: 'fav', texto: 'Mis favoritos de siempre', emoji: '❤️' },
  { id: 'igual', texto: 'Me da igual', emoji: '🤷' }
];

const VACIAS = new Set('a al algo alguna alguno algun con de del el en es esta este hoy la las lo los me mi mis muy para pero por que quiero queremos jugar juego juegos tipo un una uno unos y o apetece apetecen nos nosotros somos estamos ser hacer tengo tenemos sea solo'.split(' '));
const NUMEROS = { uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10, once: 11, doce: 12 };

/** Lee un texto libre: nº de jugadores, ganas detectadas y palabras sueltas para buscar. */
export function leerTexto(texto) {
  const t = norm(texto);
  const pal = t.split(' ').filter(Boolean);
  let jugadores = null;
  const m = t.match(/(\d+|uno|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce)\s*(personas|jugadores|amigos|colegas|somos|de nosotros|gente)/) || t.match(/somos\s+(\d+|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce)/) || t.match(/para\s+(\d+|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce)\b/);
  if (m) jugadores = Number(m[1]) || NUMEROS[m[1]] || null;
  else if (/\b(solo|sola|yo solo|un jugador|1 jugador|solitario|individual)\b/.test(t)) jugadores = 1;
  else if (/\b(pareja|mi novi[ao]|los dos|las dos|nosotros dos|1 vs 1|uno contra uno|cara a cara)\b/.test(t)) jugadores = 2;
  else if (/\b(grupo grande|muchos|mucha gente|fiesta|familia)\b/.test(t)) jugadores = 6;
  const ganas = GANAS.filter((g) => g.dice.some((d) => pal.includes(d) || (d.length > 5 && pal.some((p) => p.length > 4 && (p.startsWith(d.slice(0, 5)) || d.startsWith(p.slice(0, 5))))))).map((g) => g.id);
  const sueltas = pal.filter((p) => p.length > 2 && !VACIAS.has(p) && !NUMEROS[p] && !/^\d+$/.test(p));
  return { jugadores, ganas, sueltas, nuevo: /\b(nuevo|nueva|nuevos|distinto|diferente|no he jugado|sorprendeme|probar|probado|descubrir)\b/.test(t) };
}

/** Puntúa y ordena los juegos según lo pedido. Devuelve [{ id, puntos, motivos }]. */
export function recomendar(ids, { grupo, ganas = [], novedad = 'igual', sueltas = [], jugadas = {} }, azar = Math.random) {
  const total = Object.values(jugadas).reduce((a, b) => a + b, 0) || 1;
  return ids.map((id) => {
    const m = metaDe(id); const l = LIMITES[id];
    if (!m || !l) return null;
    if (grupo && (l.min > grupo.max || l.max < grupo.min)) return null; // no caben
    const etq = norm(m.etiquetas); const desc = norm(m.descripcion); const tit = norm(m.titulo);
    const cats = m.categorias || [];
    let puntos = 0; const motivos = [];
    if (grupo) motivos.push(l.min === l.max ? `${l.min} ${l.min === 1 ? 'jugador' : 'jugadores'}` : `${l.min} a ${l.max} jugadores`);
    for (const gid of ganas) {
      const g = GANAS.find((x) => x.id === gid);
      let p = g.cats.some((c) => cats.includes(c)) ? 4 : 0;
      const hits = g.kw.filter((k) => etq.includes(k) || desc.includes(k)).length;
      p += g.cats.length ? Math.min(3, hits * 1.2) : Math.min(6, hits * 2); // sin categoría propia, las palabras pesan más
      if (p > 0) motivos.push(`${g.emoji} ${g.texto}`);
      puntos += p;
    }
    let textoOk = 0;
    for (const s of sueltas) {
      const raiz = s.length > 5 ? s.slice(0, s.length - 1) : s;
      if (tit.includes(raiz)) textoOk += 5; else if (etq.includes(raiz)) textoOk += 3; else if (desc.includes(raiz)) textoOk += 1.2;
    }
    if (textoOk) { puntos += textoOk; motivos.push('🔎 Encaja con lo que buscas'); }
    if (ganas.length && !puntos && !textoOk) return null; // no tiene nada de lo pedido
    if (!ganas.length && sueltas.length && !textoOk) puntos -= 3;
    const veces = jugadas[id] || 0;
    if (novedad === 'nuevo') { if (!veces) { puntos += 3; motivos.push('✨ Aún no lo has probado'); } else puntos -= 2; }
    if (novedad === 'fav' && veces) { puntos += 2 + 6 * (veces / total); motivos.push(`❤️ Lo has jugado ${veces} ${veces === 1 ? 'vez' : 'veces'}`); }
    if (cats.includes('favoritos')) puntos += 0.6;
    puntos += azar() * 1.5; // un poco de variedad entre tiradas
    return { id, puntos, motivos: motivos.slice(0, 3) };
  }).filter(Boolean).sort((a, b) => b.puntos - a.puntos);
}

function useJugadas(activo) {
  const [jugadas, setJugadas] = useState({});
  useEffect(() => {
    const yo = nombreCompleto();
    if (!activo || !yo) return undefined;
    let vivo = true;
    fetch(`/api/registros/jugador?nombre=${encodeURIComponent(yo)}`).then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (vivo && d?.juegos) setJugadas(Object.fromEntries(d.juegos.map((j) => [j.juego, j.partidas]))); }).catch(() => {});
    return () => { vivo = false; };
  }, [activo]);
  return jugadas;
}

const POR_TANDA = 6;

function Resultados({ lista, tanda, setTanda, onReiniciar, onCerrar }) {
  const vista = lista.slice(tanda * POR_TANDA, tanda * POR_TANDA + POR_TANDA);
  const hayMas = lista.length > (tanda + 1) * POR_TANDA;
  if (!lista.length) {
    return (
      <div className="rec-vacio">
        <span>🤔</span>
        <p>No he encontrado ningún juego que encaje con todo eso. Prueba a pedir menos cosas a la vez.</p>
        <button type="button" className="rec-secundario" onClick={onReiniciar}><Icon name="arrowLeft" size={18} /> Cambiar respuestas</button>
      </div>
    );
  }
  return (
    <>
      <p className="rec-intro">{tanda === 0 ? '¡Estos te van a gustar!' : 'Más ideas para hoy:'}</p>
      <ul className="rec-lista">
        {vista.map((r, i) => {
          const m = metaDe(r.id);
          return (
            <li key={r.id} style={{ '--i': i }}>
              <Link to={`/juego/${r.id}`} className="rec-juego" onClick={onCerrar}>
                <span className="rec-img" style={{ background: `linear-gradient(135deg, ${m.colores?.[0] || '#7c3aed'}, ${m.colores?.[1] || '#312e81'})` }}>
                  {m.imagen && <img src={m.imagen} alt="" loading="lazy" />}
                </span>
                <span className="rec-txt">
                  <b>{tanda === 0 && i === 0 ? '⭐ ' : ''}{m.titulo}</b>
                  <small>{m.descripcion}</small>
                  <span className="rec-motivos">{r.motivos.map((x) => <em key={x}>{x}</em>)}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="rec-acciones">
        <button type="button" className="rec-secundario" onClick={onReiniciar}><Icon name="arrowLeft" size={18} /> Empezar de nuevo</button>
        <button type="button" className="rec-principal" onClick={() => setTanda(hayMas ? tanda + 1 : 0)}>🎲 {hayMas ? 'Otras ideas' : 'Volver a las primeras'}</button>
      </div>
    </>
  );
}

function Ventana({ ids, onCerrar }) {
  const [modo, setModo] = useState('preguntas'); // preguntas | texto
  const [paso, setPaso] = useState(0); // 0 jugadores · 1 ganas · 2 novedad · 3 resultados
  const [grupo, setGrupo] = useState(null);
  const [ganas, setGanas] = useState([]);
  const [novedad, setNovedad] = useState('igual');
  const [texto, setTexto] = useState('');
  const [peticion, setPeticion] = useState(null);
  const [tanda, setTanda] = useState(0);
  const [semilla, setSemilla] = useState(0);
  const jugadas = useJugadas(true);

  useEffect(() => {
    const k = (e) => { if (e.key === 'Escape') onCerrar(); };
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  }, [onCerrar]);

  const lista = useMemo(() => (peticion ? recomendar(ids, { ...peticion, jugadas }) : []), [peticion, ids, jugadas, semilla]); // eslint-disable-line react-hooks/exhaustive-deps
  const ver = (p) => { setPeticion(p); setTanda(0); setSemilla((s) => s + 1); setPaso(3); };
  const reiniciar = () => { setPaso(0); setPeticion(null); setGrupo(null); setGanas([]); setNovedad('igual'); };
  const buscarTexto = (e) => {
    e.preventDefault();
    if (!texto.trim()) return;
    const l = leerTexto(texto);
    const g = l.jugadores ? GRUPOS.find((x) => l.jugadores >= x.min && l.jugadores <= x.max) : null;
    ver({ grupo: g, ganas: l.ganas, sueltas: l.ganas.length ? [] : l.sueltas, novedad: l.nuevo ? 'nuevo' : 'igual', leido: l });
  };
  const toggle = (id) => setGanas((g) => (g.includes(id) ? g.filter((x) => x !== id) : g.length < 3 ? [...g, id] : g));

  let cuerpo;
  if (paso === 3) {
    const l = peticion?.leido;
    cuerpo = (
      <>
        {l && (
          <p className="rec-entendido">
            He entendido: {[l.jugadores && `${l.jugadores} ${l.jugadores === 1 ? 'jugador' : 'jugadores'}`, ...l.ganas.map((g) => GANAS.find((x) => x.id === g).texto.toLowerCase()), !l.ganas.length && l.sueltas.length && `«${l.sueltas.join(' ')}»`, l.nuevo && 'algo nuevo'].filter(Boolean).join(' · ') || 'lo que sea'}
          </p>
        )}
        <Resultados lista={lista} tanda={tanda} setTanda={setTanda} onReiniciar={reiniciar} onCerrar={onCerrar} />
      </>
    );
  } else if (modo === 'texto') {
    cuerpo = (
      <form className="rec-paso" onSubmit={buscarTexto}>
        <h4>Cuéntame qué te apetece</h4>
        <p className="rec-ayuda">Por ejemplo: «algo de fútbol para 4», «reírnos con amigos», «pensar yo solo», «engañar a mis colegas», «algo rápido que no haya probado».</p>
        <textarea className="rec-texto" value={texto} onChange={(e) => setTexto(e.target.value)} rows={3} maxLength={200} placeholder="Hoy me apetece…" autoFocus
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) buscarTexto(e); }} />
        <button type="submit" className="rec-principal ancho" disabled={!texto.trim()}>🔮 Recomiéndame</button>
      </form>
    );
  } else if (paso === 0) {
    cuerpo = (
      <div className="rec-paso">
        <h4><span className="rec-num">1</span>¿Cuántos sois?</h4>
        <div className="rec-opciones cinco">
          {GRUPOS.map((g) => <button key={g.id} type="button" className={grupo?.id === g.id ? 'activa' : ''} onClick={() => { setGrupo(g); setPaso(1); }}><span>{g.emoji}</span>{g.texto}</button>)}
        </div>
      </div>
    );
  } else if (paso === 1) {
    cuerpo = (
      <div className="rec-paso">
        <h4><span className="rec-num">2</span>¿Qué os apetece? <small>hasta 3</small></h4>
        <div className="rec-opciones">
          {GANAS.map((g) => <button key={g.id} type="button" className={ganas.includes(g.id) ? 'activa' : ''} onClick={() => toggle(g.id)}><span>{g.emoji}</span>{g.texto}</button>)}
        </div>
        <div className="rec-acciones">
          <button type="button" className="rec-secundario" onClick={() => setPaso(0)}><Icon name="arrowLeft" size={18} /> Atrás</button>
          <button type="button" className="rec-principal" onClick={() => setPaso(2)}>{ganas.length ? 'Seguir' : 'Me vale cualquiera'} <Icon name="forward" size={18} /></button>
        </div>
      </div>
    );
  } else {
    cuerpo = (
      <div className="rec-paso">
        <h4><span className="rec-num">3</span>¿Algo nuevo o de siempre?</h4>
        <div className="rec-opciones lista">
          {NOVEDAD.map((n) => <button key={n.id} type="button" onClick={() => { setNovedad(n.id); ver({ grupo, ganas, novedad: n.id }); }}><span>{n.emoji}</span>{n.texto}</button>)}
        </div>
        <div className="rec-acciones">
          <button type="button" className="rec-secundario" onClick={() => setPaso(1)}><Icon name="arrowLeft" size={18} /> Atrás</button>
        </div>
      </div>
    );
  }

  return (
    <div className="rec-fondo" onClick={onCerrar}>
      <div className="rec-modal" role="dialog" aria-label="¿A qué jugamos hoy?" onClick={(e) => e.stopPropagation()}>
        <header className="rec-cab">
          <span className="rec-cab-ico">🎲</span>
          <div><p>Recomendador</p><h3>¿A qué jugamos hoy?</h3></div>
          <button type="button" className="rec-cerrar" onClick={onCerrar} aria-label="Cerrar"><Icon name="x" size={18} strokeWidth={2.6} /></button>
        </header>
        {paso !== 3 && (
          <div className="rec-pestanas" role="tablist">
            <button type="button" role="tab" aria-selected={modo === 'preguntas'} className={modo === 'preguntas' ? 'activa' : ''} onClick={() => setModo('preguntas')}>💬 Pregúntame</button>
            <button type="button" role="tab" aria-selected={modo === 'texto'} className={modo === 'texto' ? 'activa' : ''} onClick={() => setModo('texto')}>✍️ Lo escribo yo</button>
          </div>
        )}
        <div className="rec-cuerpo">{cuerpo}</div>
      </div>
    </div>
  );
}

export default function Recomendador({ ids }) {
  const [abierto, setAbierto] = useState(false);
  return (
    <>
      <button type="button" className="rec-boton" onClick={() => setAbierto(true)}><span>🎲</span>¿A qué jugamos hoy?</button>
      {abierto && createPortal(<Ventana ids={ids} onCerrar={() => setAbierto(false)} />, document.body)}
    </>
  );
}
