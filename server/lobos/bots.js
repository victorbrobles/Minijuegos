// Un bot decide usando SOLO su vista privada (la misma que recibiría un jugador humano).
// Se usa para los bots que añade el anfitrión y para la prueba de extremo a extremo (scripts/lobos-e2e.mjs).

const elige = (arr) => (arr.length ? arr[Math.floor(Math.random() * arr.length)] : null);

export function decidirDesdeVista(v) {
  const yo = v.yo;
  const vivos = v.jugadores.filter((p) => p.vivo).map((p) => p.id);
  const otros = vivos.filter((x) => x !== yo);

  switch (v.fase) {
    case 'reparto': return { tipo: 'listo' };
    case 'noche': return v.listo ? null : { tipo: 'noche', acc: accionNoche(v, vivos, otros) };
    case 'anuncio':
      if (v.cazador && v.cazador.id === yo) return { tipo: 'disparar', objetivo: elige(otros) };
      if (v.puedoEco) return { tipo: 'eco', texto: 'Cuidado con quien calla demasiado…' };
      return null;
    case 'objeto': return v.puedoReclamar && Math.random() < 0.6 ? { tipo: 'reclamar' } : null;
    case 'debate':
      if (v.puedoEco) return { tipo: 'eco', texto: 'Cuidado con quien calla demasiado…' };
      return !v.mi.vivo || v.debate?.yoListo ? null : { tipo: 'listoVotar' };
    case 'votacion': {
      if (v.listo) return null;
      const aliados = new Set(v.mi.companeros.map((c) => c.id));
      const pool = otros.filter((x) => !aliados.has(x));
      const voto = elige(pool.length ? pool : otros);
      const msg = { tipo: 'votar', voto };
      if (v.votacion.robadoDe != null) msg.robado = elige(vivos.filter((x) => x !== v.votacion.robadoDe));
      return msg;
    }
    default: return null;
  }
}

function accionNoche(v, vivos, otros) {
  const { rol, estado: est } = v.mi;
  const aliados = new Set(v.mi.companeros.map((c) => c.id));
  const esLobo = v.mi.bando === 'lobos';
  let acc = null;

  if (esLobo) {
    const objetivos = otros.filter((x) => !aliados.has(x));
    acc = v.noche.turno.sinAtaque ? {} : { objetivo: elige(objetivos) };
    if (rol === 'lobo_alfa' && !est.infeccionUsada && v.ronda >= 2 && Math.random() < 0.5) acc.infectar = true;
    if (rol === 'falsificador' && !est.falsificacionUsada && v.ronda >= 2 && Math.random() < 0.4) acc.falsificar = { objetivo: elige(otros), rol: 'aldeano' };
  } else {
    switch (rol) {
      case 'vidente': acc = { objetivo: elige(otros) }; break;
      case 'cartografo': { const a = elige(vivos); acc = { a, b: elige(vivos.filter((x) => x !== a)) }; break; }
      case 'protector': acc = { objetivo: elige(vivos.filter((x) => x !== est.ultimoProtegido)) }; break;
      case 'bruja': {
        const vic = v.noche.turno.victima;
        acc = { salvar: vic != null && est.pocionVida && Math.random() < 0.6, veneno: null };
        if (est.pocionVeneno && v.ronda >= 3 && Math.random() < 0.2) acc.veneno = elige(otros);
        break;
      }
      case 'cupido': if (v.ronda === 1) { const a = elige(vivos); acc = { a, b: elige(vivos.filter((x) => x !== a)) }; } break;
      case 'parasito': if (v.ronda === 1 && est.huesped == null) acc = { objetivo: elige(otros) }; break;
      case 'ladron': case 'viuda': case 'contagiado': acc = { objetivo: elige(otros) }; break;
      case 'juez': if (!est.juezUsado && !v.mi.juezArmado && Math.random() < 0.3) acc = { armar: true }; break;
      case 'hechicero': if (!est.hechizoUsado && v.ronda >= 2 && Math.random() < 0.25) acc = { rebobinar: true }; break;
      case 'banquero': if (est.fichasBanquero > 0) acc = { objetivo: elige(otros) }; break;
      case 'notario': if (est.notarioCartas < 3) acc = { sobre: elige(otros), veredicto: Math.random() < 0.5 ? 'pueblo' : 'nopueblo' }; break;
      case 'piromano': {
        const vivosRoc = est.rociados.filter((x) => vivos.includes(x));
        if (!est.incendioUsado && vivosRoc.length >= 3) acc = { incendiar: true };
        else { const pos = otros.filter((x) => !est.rociados.includes(x)); if (pos.length) acc = { rociar: elige(pos) }; }
        break;
      }
      default: break;
    }
  }
  // Objetos: usa la daga o el pergamino con cierta probabilidad
  if (est.objeto === 'daga' && Math.random() < 0.3) acc = { ...(acc || {}), objeto: { tipo: 'daga', objetivo: elige(otros) } };
  if (est.objeto === 'pergamino' && Math.random() < 0.5) acc = { ...(acc || {}), objeto: { tipo: 'pergamino', objetivo: elige(otros) } };
  return acc;
}
