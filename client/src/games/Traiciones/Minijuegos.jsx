// client/src/games/Traiciones/Minijuegos.jsx
// Una prueba distinta para la tarea de cada sala. Todas son cortas, sencillas, pero exigen un poco de pulso o de atención.
// Cada prueba recibe onExito() (se llama una sola vez) y se reinicia sola si fallas.
import React, { useEffect, useRef, useState } from 'react';
import Icon from './IconoT.jsx';

const azar = (a, b) => a + Math.random() * (b - a);
const entero = (a, b) => Math.floor(azar(a, b + 1));
const barajar = (arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

// Llama a onExito una única vez aunque el componente se vuelva a pintar
function useExito(onExito) {
  const ref = useRef(onExito); ref.current = onExito;
  const hecho = useRef(false);
  return () => { if (hecho.current) return; hecho.current = true; ref.current(); };
}

function Marco({ titulo, instruccion, progreso, mensaje, children }) {
  return (
    <div className="tr-mj">
      <div className="tr-mj-cab"><strong>{titulo}</strong>{progreso && <span>{progreso}</span>}</div>
      <p className="tr-mj-inst">{instruccion}</p>
      {mensaje && <div className="tr-mj-msg">{mensaje}</div>}
      {children}
    </div>
  );
}

// ---------------------------------------------------------------- 1) Hoguera: chispas (puntería)
function Chispas({ onExito }) {
  const exito = useExito(onExito);
  const [e, setE] = useState({ n: 0, hits: 0, miss: 0, t: null, msg: '' });
  useEffect(() => {
    if (e.msg) { const id = setTimeout(() => setE({ n: 0, hits: 0, miss: 0, t: null, msg: '' }), 1300); return () => clearTimeout(id); }
    if (e.miss >= 3) { setE((x) => ({ ...x, msg: 'Se apagó el fuego. ¡Otra vez!' })); return undefined; }
    if (e.t === null) {
      if (e.n >= 8) { exito(); return undefined; }
      const id = setTimeout(() => setE((x) => ({ ...x, n: x.n + 1, t: { x: azar(10, 82), y: azar(10, 78), k: x.n } })), 300);
      return () => clearTimeout(id);
    }
    const id = setTimeout(() => setE((x) => ({ ...x, miss: x.miss + 1, t: null })), 1250);
    return () => clearTimeout(id);
  }, [e]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Marco titulo="Avivar el fuego" instruccion="Saltarán 8 chispas: tócalas antes de que se apaguen. Si se te escapan 3, vuelta a empezar." progreso={`Chispa ${Math.min(e.n, 8)}/8 · ${e.hits} ✔`} mensaje={e.msg}>
      <div className="tr-mj-area chispas">
        {e.t && <button type="button" key={e.t.k} className="tr-chispa" style={{ left: `${e.t.x}%`, top: `${e.t.y}%` }}
          onPointerDown={(ev) => { ev.preventDefault(); setE((x) => ({ ...x, hits: x.hits + 1, t: null })); }}><Icon name="flame" size={26} /></button>}
        <div className="tr-mj-vidas">{[0, 1, 2].map((i) => <span key={i} className={i < 3 - e.miss ? 'on' : ''} />)}</div>
      </div>
    </Marco>
  );
}

// ---------------------------------------------------------------- 2) Pozo: subir el cubo (temporización)
function Cubo({ onExito }) {
  const exito = useExito(onExito);
  const [pos, setPos] = useState(0);
  const [zona, setZona] = useState(() => azar(0.3, 0.7));
  const [ok, setOk] = useState(0);
  const [msg, setMsg] = useState('');
  const st = useRef({ pos: 0, dir: 1, vel: 0.9 });
  useEffect(() => {
    let raf; let ult = performance.now();
    const f = (t) => {
      const dt = (t - ult) / 1000; ult = t;
      const s = st.current; s.pos += s.dir * s.vel * dt;
      if (s.pos >= 1) { s.pos = 1; s.dir = -1; } else if (s.pos <= 0) { s.pos = 0; s.dir = 1; }
      setPos(s.pos); raf = requestAnimationFrame(f);
    };
    raf = requestAnimationFrame(f);
    return () => cancelAnimationFrame(raf);
  }, []);
  const tirar = () => {
    const dentro = Math.abs(st.current.pos - zona) <= 0.11;
    if (dentro) {
      const n = ok + 1; setOk(n); setMsg('¡Bien!');
      st.current.vel *= 1.25; setZona(azar(0.2, 0.8));
      if (n >= 3) exito();
    } else { setOk(0); setMsg('¡Fallaste! Empieza de nuevo.'); st.current.vel = 0.9; }
  };
  return (
    <Marco titulo="Subir el cubo" instruccion="Pulsa el botón cuando el marcador esté en la zona verde. Aciertos seguidos: 3." progreso={`${ok} / 3`} mensaje={msg}>
      <div className="tr-barra-t"><div className="tr-zona" style={{ left: `${(zona - 0.11) * 100}%`, width: '22%' }} /><div className="tr-marca" style={{ left: `${pos * 100}%` }} /></div>
      <button type="button" className="trp-boton grande" onPointerDown={(e) => { e.preventDefault(); tirar(); }}><Icon name="well" size={22} /> ¡Ahora!</button>
    </Marco>
  );
}

// ---------------------------------------------------------------- 3) Establo: secuencia (memoria)
const PADS = [{ c: '#ef4444', n: 'Rojo' }, { c: '#3b82f6', n: 'Azul' }, { c: '#22c55e', n: 'Verde' }, { c: '#f59e0b', n: 'Ámbar' }];
function Secuencia({ onExito }) {
  const exito = useExito(onExito);
  const [seq, setSeq] = useState(() => Array.from({ length: 5 }, () => entero(0, 3)));
  const [fase, setFase] = useState('mirar');
  const [luz, setLuz] = useState(-1);
  const [i, setI] = useState(0);
  const [msg, setMsg] = useState('');
  useEffect(() => {
    if (fase !== 'mirar') return undefined;
    const ids = []; setLuz(-1); setI(0);
    seq.forEach((p, k) => { ids.push(setTimeout(() => setLuz(p), 700 + k * 750)); ids.push(setTimeout(() => setLuz(-1), 700 + k * 750 + 500)); });
    ids.push(setTimeout(() => { setFase('repetir'); setMsg(''); }, 700 + seq.length * 750));
    return () => ids.forEach(clearTimeout);
  }, [fase, seq]);
  const pulsar = (p) => {
    if (fase !== 'repetir') return;
    setLuz(p); setTimeout(() => setLuz(-1), 180);
    if (p === seq[i]) { if (i + 1 >= seq.length) exito(); else setI(i + 1); }
    else { setMsg('¡Esa no era! Mira otra vez.'); setSeq(Array.from({ length: 5 }, () => entero(0, 3))); setFase('mirar'); }
  };
  return (
    <Marco titulo="Calmar a los camellos" instruccion={fase === 'mirar' ? 'Memoriza el orden en que se iluminan…' : 'Repite la secuencia.'} progreso={fase === 'repetir' ? `${i} / ${seq.length}` : 'Mira'} mensaje={msg}>
      <div className="tr-pads">{PADS.map((p, k) => <button key={k} type="button" className={`tr-pad ${luz === k ? 'luz' : ''}`} style={{ '--c': p.c }} onPointerDown={(e) => { e.preventDefault(); pulsar(k); }}>{p.n}</button>)}</div>
    </Marco>
  );
}

// ---------------------------------------------------------------- 4) Carreta: tuercas en orden (rapidez)
function Tuercas({ onExito }) {
  const exito = useExito(onExito);
  const nuevo = () => barajar([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  const [orden, setOrden] = useState(nuevo);
  const [sig, setSig] = useState(1);
  const [ini, setIni] = useState(() => Date.now());
  const [, setT] = useState(0);
  const [msg, setMsg] = useState('');
  const LIMITE = 12000;
  useEffect(() => { const id = setInterval(() => setT((x) => x + 1), 150); return () => clearInterval(id); }, []);
  const resto = LIMITE - (Date.now() - ini);
  useEffect(() => { if (resto <= 0) { setOrden(nuevo()); setSig(1); setIni(Date.now()); setMsg('Se acabó el tiempo. ¡Otra vez!'); } }); // eslint-disable-line react-hooks/exhaustive-deps
  const tocar = (n) => {
    if (n !== sig) { setSig(1); setMsg('¡Orden equivocado! Vuelve al 1.'); return; }
    setMsg(''); if (n === 9) exito(); else setSig(n + 1);
  };
  return (
    <Marco titulo="Apretar las tuercas" instruccion="Toca las tuercas del 1 al 9 en orden, antes de que se acabe el tiempo." progreso={`Siguiente: ${Math.min(sig, 9)}`} mensaje={msg}>
      <div className="tr-timer-barra" style={{ marginBottom: '.6rem' }}><div className="tr-timer-fill" style={{ width: `${Math.max(0, (resto / LIMITE) * 100)}%` }} /></div>
      <div className="tr-tuercas">{orden.map((n) => <button key={n} type="button" className={n < sig ? 'hecha' : ''} onPointerDown={(e) => { e.preventDefault(); if (n >= sig) tocar(n); }}>{n}</button>)}</div>
    </Marco>
  );
}

// ---------------------------------------------------------------- 5) Bazar: regateo (cálculo mental)
function pregunta() {
  const t = entero(0, 2); let a; let b; let r; let txt;
  if (t === 0) { a = entero(12, 48); b = entero(7, 39); r = a + b; txt = `${a} + ${b}`; }
  else if (t === 1) { a = entero(30, 90); b = entero(7, 29); r = a - b; txt = `${a} − ${b}`; }
  else { a = entero(3, 9); b = entero(3, 9); r = a * b; txt = `${a} × ${b}`; }
  const op = new Set([r]); while (op.size < 4) { const d = entero(1, 6) * (Math.random() < 0.5 ? -1 : 1); if (r + d > 0) op.add(r + d); }
  return { txt, r, op: barajar([...op]) };
}
function Regateo({ onExito }) {
  const exito = useExito(onExito);
  const [q, setQ] = useState(pregunta);
  const [ok, setOk] = useState(0);
  const [ini, setIni] = useState(() => Date.now());
  const [, setT] = useState(0);
  const [msg, setMsg] = useState('');
  const LIMITE = 7000;
  useEffect(() => { const id = setInterval(() => setT((x) => x + 1), 150); return () => clearInterval(id); }, []);
  const resto = LIMITE - (Date.now() - ini);
  const fallo = (m) => { setOk(0); setQ(pregunta()); setIni(Date.now()); setMsg(m); };
  useEffect(() => { if (resto <= 0) fallo('Demasiado lento. Empieza de nuevo.'); }); // eslint-disable-line react-hooks/exhaustive-deps
  const elegir = (n) => {
    if (n !== q.r) return fallo('Cuenta mal hecha. Empieza de nuevo.');
    setMsg('¡Bien!'); const k = ok + 1; setOk(k); if (k >= 3) exito(); else { setQ(pregunta()); setIni(Date.now()); }
  };
  return (
    <Marco titulo="Regatear con el mercader" instruccion="Resuelve 3 cuentas seguidas, rápido." progreso={`${ok} / 3`} mensaje={msg}>
      <div className="tr-timer-barra" style={{ marginBottom: '.6rem' }}><div className="tr-timer-fill" style={{ width: `${Math.max(0, (resto / LIMITE) * 100)}%` }} /></div>
      <div className="tr-cuenta">{q.txt} = ?</div>
      <div className="tr-opciones-mj">{q.op.map((n) => <button key={n} type="button" onPointerDown={(e) => { e.preventDefault(); elegir(n); }}>{n}</button>)}</div>
    </Marco>
  );
}

// ---------------------------------------------------------------- 6) Tienda: contar monedas (observación)
function Monedas({ onExito }) {
  const exito = useExito(onExito);
  const crear = () => { const n = entero(7, 13); const op = new Set([n]); while (op.size < 4) { const d = entero(1, 3) * (Math.random() < 0.5 ? -1 : 1); if (n + d > 3) op.add(n + d); } return { n, op: barajar([...op]), pts: Array.from({ length: n }, () => ({ x: azar(6, 88), y: azar(8, 80) })) }; };
  const [r, setR] = useState(crear);
  const [fase, setFase] = useState('ver');
  const [ok, setOk] = useState(0);
  const [msg, setMsg] = useState('');
  useEffect(() => { if (fase !== 'ver') return undefined; const id = setTimeout(() => setFase('elegir'), 2300); return () => clearTimeout(id); }, [fase, r]);
  const elegir = (n) => {
    if (n === r.n) { const k = ok + 1; setOk(k); setMsg('¡Correcto!'); if (k >= 2) return exito(); setR(crear()); setFase('ver'); }
    else { setOk(0); setMsg(`Eran ${r.n}. Empieza de nuevo.`); setR(crear()); setFase('ver'); }
    return undefined;
  };
  return (
    <Marco titulo="Contar la caja" instruccion={fase === 'ver' ? 'Cuenta las monedas… ¡desaparecerán enseguida!' : '¿Cuántas había?'} progreso={`${ok} / 2`} mensaje={msg}>
      <div className="tr-mj-area monedas">
        {fase === 'ver' && r.pts.map((p, k) => <span key={k} className="tr-moneda" style={{ left: `${p.x}%`, top: `${p.y}%` }}><Icon name="target" size={22} /></span>)}
        {fase === 'elegir' && <div className="tr-opciones-mj grande">{r.op.map((n) => <button key={n} type="button" onPointerDown={(e) => { e.preventDefault(); elegir(n); }}>{n}</button>)}</div>}
      </div>
    </Marco>
  );
}

// ---------------------------------------------------------------- 7) Biblioteca: pares (memoria visual)
const ICONOS_PARES = ['book', 'star', 'key', 'leaf', 'moon', 'heart'];
function Pares({ onExito }) {
  const exito = useExito(onExito);
  const crear = () => barajar([...ICONOS_PARES.slice(0, 4), ...ICONOS_PARES.slice(0, 4)]);
  const [cartas, setCartas] = useState(crear);
  const [vol, setVol] = useState([]);
  const [fijas, setFijas] = useState([]);
  const [fallos, setFallos] = useState(0);
  const [msg, setMsg] = useState('');
  useEffect(() => {
    if (vol.length !== 2) return undefined;
    const [a, b] = vol;
    if (cartas[a] === cartas[b]) { const f = [...fijas, a, b]; setFijas(f); setVol([]); if (f.length === cartas.length) exito(); return undefined; }
    const id = setTimeout(() => {
      setVol([]);
      setFallos((x) => {
        if (x + 1 >= 6) { setCartas(crear()); setFijas([]); setMsg('Demasiados fallos: se barajan de nuevo.'); return 0; }
        return x + 1;
      });
    }, 750);
    return () => clearTimeout(id);
  }, [vol]); // eslint-disable-line react-hooks/exhaustive-deps
  const girar = (i) => { if (vol.length >= 2 || vol.includes(i) || fijas.includes(i)) return; setMsg(''); setVol([...vol, i]); };
  return (
    <Marco titulo="Ordenar los archivos" instruccion="Encuentra las 4 parejas. Al sexto fallo se barajan de nuevo." progreso={`Fallos ${fallos} / 6`} mensaje={msg}>
      <div className="tr-pares">{cartas.map((ic, i) => {
        const abierta = vol.includes(i) || fijas.includes(i);
        return <button key={i} data-ic={ic} type="button" className={`${abierta ? 'abierta' : ''} ${fijas.includes(i) ? 'fija' : ''}`} onPointerDown={(e) => { e.preventDefault(); girar(i); }}>{abierta ? <Icon name={ic} size={30} /> : <Icon name="moon" size={24} />}</button>;
      })}</div>
    </Marco>
  );
}

// ---------------------------------------------------------------- 8) Granero: báscula (mantener y soltar a tiempo)
function Bascula({ onExito }) {
  const exito = useExito(onExito);
  const [nivel, setNivel] = useState(0);
  const [meta, setMeta] = useState(() => azar(45, 85));
  const [ok, setOk] = useState(0);
  const [msg, setMsg] = useState('');
  const st = useRef({ nivel: 0, pulsando: false });
  useEffect(() => {
    let raf; let ult = performance.now();
    const f = (t) => { const dt = (t - ult) / 1000; ult = t; if (st.current.pulsando) { st.current.nivel = Math.min(100, st.current.nivel + 48 * dt); setNivel(st.current.nivel); } raf = requestAnimationFrame(f); };
    raf = requestAnimationFrame(f);
    return () => cancelAnimationFrame(raf);
  }, []);
  const soltar = () => {
    if (!st.current.pulsando) return;
    st.current.pulsando = false;
    const bien = Math.abs(st.current.nivel - meta) <= 6;
    if (bien) { const k = ok + 1; setOk(k); setMsg('¡Peso exacto!'); if (k >= 2) return exito(); setMeta(azar(35, 90)); }
    else { setOk(0); setMsg(st.current.nivel > meta ? 'Te pasaste. Empieza de nuevo.' : 'Te quedaste corto. Empieza de nuevo.'); setMeta(azar(35, 90)); }
    st.current.nivel = 0; setNivel(0);
    return undefined;
  };
  return (
    <Marco titulo="Pesar el grano" instruccion="Mantén pulsado para llenar el saco y suelta justo en la línea. Pesadas seguidas: 2." progreso={`${ok} / 2`} mensaje={msg}>
      <div className="tr-bascula"><div className="tr-bascula-nivel" style={{ height: `${nivel}%` }} /><div className="tr-bascula-meta" style={{ bottom: `${meta}%` }} /></div>
      <button type="button" className="trp-boton grande tr-mantener" onPointerDown={(e) => { e.preventDefault(); e.currentTarget.setPointerCapture?.(e.pointerId); st.current.pulsando = true; setMsg(''); }}
        onPointerUp={soltar} onPointerCancel={soltar} onContextMenu={(e) => e.preventDefault()}><Icon name="sack" size={22} /> Mantén pulsado</button>
    </Marco>
  );
}

const JUEGOS = { chispas: Chispas, cubo: Cubo, secuencia: Secuencia, tuercas: Tuercas, regateo: Regateo, monedas: Monedas, pares: Pares, bascula: Bascula };

// Muestra la prueba de una tarea. `clave` cambia al empezar una nueva (reinicia el estado).
export default function Minijuego({ id, clave, onExito, onCancelar }) {
  const J = JUEGOS[id];
  if (!J) return null;
  return (
    <div>
      <J key={clave} onExito={onExito} />
      <button type="button" className="trp-boton secundario" style={{ marginTop: '.7rem' }} onClick={onCancelar}>Dejar la tarea por ahora</button>
    </div>
  );
}
