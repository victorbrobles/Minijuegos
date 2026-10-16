// Simulación Monte Carlo con bots para estimar el equilibrio de una composición.
// Usa exactamente el mismo motor que el juego real (engine.js). Los bots NO son humanos: modelan de forma
// simple la deducción del pueblo (pDeduccion) y la información del Vidente. No aprovechan la información
// indirecta (Cartógrafo, Notario, Eco, rumores, roles revelados), así que con esos roles el pueblo real rinde algo mejor.

import {
  crearPartida, iniciarNoche, registrarAccion, resolverNoche, fijarVictima, disparar, contarVotos, aplicarVotacion,
  gastarJuez, juezActivo, siguienteRonda, comprobarVictoria, vivos, esLobo, bandoVisible, barajar,
  generarModDia, convertirCamaleon, aplicarFicha, sortearObjeto, reclamarObjeto, OBJETOS
} from './engine.js';

const pick = (arr, rnd) => arr[Math.floor(rnd() * arr.length)];

export function simularPartida(roles, { pDeduccion = 0.3, mec = {}, rnd = Math.random } = {}) {
  const nombres = roles.map((_, i) => `J${i}`);
  let e = crearPartida(nombres, roles, { mec }, rnd);
  const conocidos = new Set();
  const investigados = new Set();
  const salida = (g) => ({ ganador: g.bando, rondas: e.ronda, heredero: e.victoriasPersonales.length > 0 });

  const vivosIds = () => vivos(e).map((j) => j.id);
  const otros = (id) => vivosIds().filter((x) => x !== id);

  const tirarCazadores = () => {
    let guard = 0;
    while (e.pendientes.length && guard++ < 10) {
      const c = e.pendientes[0];
      const cand = otros(c);
      const lc = cand.filter((x) => conocidos.has(x));
      const objetivo = cand.length ? (lc.length && rnd() < 0.6 ? pick(lc, rnd) : pick(cand, rnd)) : null;
      e = disparar(e, c, objetivo);
    }
  };

  for (let guard = 0; guard < 40; guard++) {
    // ───── Noche
    e = iniciarNoche(e, rnd);
    const niebla = e.noche.evento === 'niebla';
    for (const id of e.noche.orden) {
      const j = e.jugadores[id];
      const est = j.estado;
      let acc = null;
      const cand = otros(id);
      const noLobos = vivosIds().filter((x) => !esLobo(e.jugadores[x]));
      if (esLobo(j)) {
        const objetivos = noLobos.length ? noLobos : cand;
        acc = { objetivo: pick(objetivos, rnd) };
        if (j.rol === 'lobo_alfa' && !est.infeccionUsada && e.ronda >= 2 && rnd() < 0.5) acc.infectar = true;
        if (j.rol === 'falsificador' && !est.falsificacionUsada && e.ronda >= 2 && rnd() < 0.4) acc.falsificar = { objetivo: pick(cand, rnd), rol: 'aldeano' };
      } else {
        switch (j.rol) {
          case 'vidente': {
            const pos = cand.filter((x) => !investigados.has(x));
            if (pos.length) {
              const t = pick(pos, rnd);
              investigados.add(t);
              let b = bandoVisible(e.jugadores[t]);
              if (niebla && rnd() < 0.5) b = b === 'lobos' ? 'pueblo' : 'lobos';
              if (b === 'lobos') conocidos.add(t); else conocidos.delete(t);
              acc = { objetivo: t };
            }
            break;
          }
          case 'protector': acc = { objetivo: pick(vivosIds().filter((x) => x !== est.ultimoProtegido), rnd) }; break;
          case 'bruja': {
            e = fijarVictima(e, rnd);
            const v = e.noche.victima;
            acc = { salvar: v != null && est.pocionVida && rnd() < 0.6, veneno: null };
            if (est.pocionVeneno && e.ronda >= 3 && rnd() < 0.2) acc.veneno = pick(cand, rnd);
            break;
          }
          case 'cupido': if (e.ronda === 1) { const [a, b] = barajar(vivosIds(), rnd); acc = { a, b }; } break;
          case 'parasito': if (e.ronda === 1) acc = { objetivo: pick(cand, rnd) }; break;
          case 'ladron': acc = { objetivo: pick(cand, rnd) }; break;
          case 'hechicero': if (!est.hechizoUsado && e.ronda >= 2 && rnd() < 0.25) acc = { rebobinar: true }; break;
          case 'juez': if (!est.juezUsado && rnd() < 0.3) acc = { armar: true }; break;
          case 'banquero': if (est.fichasBanquero > 0) acc = { objetivo: pick(cand, rnd) }; break;
          case 'viuda': acc = { objetivo: pick(cand, rnd) }; break;
          case 'contagiado': acc = { objetivo: pick(cand, rnd) }; break;
          case 'notario': if (est.notarioCartas < 3) acc = { sobre: pick(cand, rnd), veredicto: 'pueblo' }; break;
          case 'piromano': {
            const vr = est.rociados.filter((x) => e.jugadores[x].vivo);
            if (!est.incendioUsado && vr.length >= 3) acc = { incendiar: true };
            else { const pos = cand.filter((x) => !est.rociados.includes(x)); if (pos.length) acc = { rociar: pick(pos, rnd) }; }
            break;
          }
          default: break;
        }
      }
      // Objetos: la daga se usa con probabilidad moderada contra un jugador al azar
      if (est.objeto === 'daga' && rnd() < 0.3) acc = { ...(acc || {}), objeto: { tipo: 'daga', objetivo: pick(cand, rnd) } };
      if (acc) e = registrarAccion(e, id, acc);
    }
    e = resolverNoche(e, rnd);
    tirarCazadores();
    let g = comprobarVictoria(e);
    if (g) return salida(g);

    // ───── Objeto del día
    const objeto = sortearObjeto(e, rnd);
    if (objeto) {
      const cl = vivos(e).filter((j) => !j.estado.objeto);
      if (cl.length) e = reclamarObjeto(e, pick(cl, rnd).id, objeto);
    }

    // ───── Día
    const modif = generarModDia(e, rnd);
    const votar = (conLadron) => {
      const votos = {};
      const vv = vivosIds();
      vv.forEach((id) => {
        const j = e.jugadores[id];
        const cand = vv.filter((x) => x !== id);
        let t;
        if (esLobo(j)) {
          const nl = cand.filter((x) => !esLobo(e.jugadores[x]));
          t = pick(nl.length ? nl : cand, rnd);
        } else {
          const cv = cand.filter((x) => conocidos.has(x));
          const lv = cand.filter((x) => esLobo(e.jugadores[x]));
          if (cv.length && rnd() < 0.7) t = pick(cv, rnd);
          else if (lv.length && rnd() < pDeduccion) t = pick(lv, rnd);
          else t = pick(cand, rnd);
        }
        votos[id] = t;
      });
      if (conLadron && e.flags.ladron) {
        const { ladron, objetivo } = e.flags.ladron;
        if (e.jugadores[ladron].vivo && e.jugadores[objetivo].vivo) votos[objetivo] = votos[ladron];
      }
      return votos;
    };
    const v1 = votar(true);
    e = convertirCamaleon(e, v1, rnd);
    let r = contarVotos(e, v1, modif);
    let victima = r.victima;
    let juezMuere = false;
    const f = aplicarFicha(e, victima);
    if (f.usada) { e = f.e; victima = null; }
    if (victima != null && juezActivo(e)) {
      const v2 = votar(false);
      const r2 = contarVotos(e, v2, modif);
      e = gastarJuez(e);
      if (r2.victima === victima) juezMuere = true;
      else victima = r2.victima;
    }
    e = aplicarVotacion(e, victima, { juezMuere });
    tirarCazadores();
    g = comprobarVictoria(e);
    if (g) return salida(g);
    e = siguienteRonda(e);
  }
  return { ganador: 'empate', rondas: e.ronda, heredero: e.victoriasPersonales.length > 0 };
}

export function simularComposicion(roles, partidas = 400, opciones = {}) {
  const cuenta = {};
  let rondas = 0;
  for (let i = 0; i < partidas; i++) {
    const r = simularPartida(roles, opciones);
    cuenta[r.ganador] = (cuenta[r.ganador] || 0) + 1;
    if (r.heredero) cuenta.heredero = (cuenta.heredero || 0) + 1;
    rondas += r.rondas;
  }
  const pct = (k) => (cuenta[k] || 0) / partidas;
  return {
    lobos: pct('lobos'), pueblo: pct('pueblo'),
    otros: Math.max(0, 1 - pct('lobos') - pct('pueblo')),
    epidemia: pct('epidemia'), rondas: rondas / partidas, cuenta
  };
}
