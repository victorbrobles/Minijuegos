// server/data/seeds/escondite/index.js
// Todas las categorías de «El Escondite»: las de categorias.js más 36 onces titulares históricos (de Once Fantasma).
import { CATEGORIAS } from './categorias.js';
import { PARTIDOS } from '../oncefantasma/onces.js';

// [id del partido, índice del equipo]
const ONCES = [
  ['mundial2010', 0], ['mundial2010', 1], ['champions2011', 0], ['champions2014', 0], ['champions2014', 1], ['champions2005', 0],
  ['mundial1998', 0], ['mundial2022', 0], ['mundial2022', 1], ['mundial2002', 0], ['champions1999', 0], ['mundial2006', 0],
  ['mundial2014', 0], ['euro2008', 0], ['champions2009', 0], ['champions2016', 1], ['euro2016', 0], ['champions2015', 0],
  ['champions2019', 0], ['champions2017', 0], ['champions2022', 0], ['champions2024', 0], ['champions2021', 0], ['champions2023', 0],
  ['champions2013', 0], ['champions2012', 1], ['champions2010', 0], ['champions2008', 0], ['champions2025', 0], ['mundial2018', 0],
  ['mundial1986', 0], ['euro2012', 0], ['euro2024', 0], ['clasico2010', 0], ['anfield2019', 0], ['remontada2017', 0]
];

const DE_ONCES = ONCES.map(([id, i]) => {
  const p = PARTIDOS.find((x) => x.id === id);
  const o = p.onces[i];
  const partido = p.partido.split(' · ');
  return {
    titulo: `Once titular de ${o.equipo} · ${partido[0]} (${partido[1]})`,
    emoji: '⚽',
    // «Nombre|alias|alias»: el apellido o el alias por el que se le conoce también vale
    opciones: o.jugadores.map((j) => [j.nombre, ...j.alias].join('|')),
    once: true
  };
});

export const TODAS = [...CATEGORIAS, ...DE_ONCES].map((c, i) => ({ id: `c${i + 1}`, ...c }));
