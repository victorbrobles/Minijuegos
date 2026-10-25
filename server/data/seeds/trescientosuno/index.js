// server/data/seeds/301/index.js

import { ALEMANIA } from './alemania.js';
import { ARGENTINA } from './argentina.js';
import { ARSENAL } from './arsenal.js';
import { ATHLETIC_BILBAO } from './athletic_bilbao.js';
import { ATLETICO_MADRID } from './atletico_madrid.js';
import { BARCELONA } from './barcelona.js';
import { BAYERN } from './bayern.js';
import { BETIS } from './betis.js';
import { BRASIL } from './brasil.js';
import { CELTA } from './celta.js';
import { CHELSEA } from './chelsea.js';
import { DEPORTIVO_CORUNA } from './depor.js';
import { DORTMUND } from './dortmund.js';
import { ESPANA } from './espana.js';
import { ESPANYOL } from './espanyol.js';
import { FRANCIA } from './francia.js';
import { GETAFE } from './getafe.js';
import { HOLANDA } from './holanda.js';
import { INGLATERRA } from './inglaterra.js';
import { INTER } from './inter.js';
import { ITALIA } from './italia.js';
import { JUVENTUS } from './juventus.js';
import { LIVERPOOL } from './liverpool.js';
import { MAN_CITY } from './man_city.js';
import { MAN_UNITED } from './man_united.js';
import { MILAN } from './milan.js';
import { NAPOLI } from './napoli.js';
import { OSASUNA } from './osasuna.js';
import { PORTUGAL } from './portugal.js';
import { PSG } from './psg.js';
import { REAL_MADRID } from './real_madrid.js';
import { REAL_SOCIEDAD } from './real_sociedad.js';
import { SEVILLA } from './sevilla.js';
import { SPURS } from './spurs.js';
import { VALENCIA } from './valencia.js';
import { VILLARREAL } from './villarreal.js';
import { ZARAGOZA } from './zaragoza.js';

export const SEEDS_301 = [
  ALEMANIA,
  ARGENTINA,
  ARSENAL,
  ATHLETIC_BILBAO,
  ATLETICO_MADRID,
  BARCELONA,
  BAYERN,
  BETIS,
  BRASIL,
  CELTA,
  CHELSEA,
  DEPORTIVO_CORUNA,
  DORTMUND,
  ESPANA,
  ESPANYOL,
  FRANCIA,
  GETAFE,
  HOLANDA,
  INGLATERRA,
  INTER,
  ITALIA,
  JUVENTUS,
  LIVERPOOL,
  MAN_CITY,
  MAN_UNITED,
  MILAN,
  NAPOLI,
  OSASUNA,
  PORTUGAL,
  PSG,
  REAL_MADRID,
  REAL_SOCIEDAD,
  SEVILLA,
  SPURS,
  VALENCIA,
  VILLARREAL,
  ZARAGOZA
];

// Extrae solo los metadatos para pasarlos de forma ligera al Frontend
export const EQUIPOS_301 = SEEDS_301.map(({ id, tipo, nombre, escudo }) => ({ 
  id, 
  tipo, 
  nombre, 
  escudo 
}));

// Genera un objeto estructurado para que el Backend (routes/301.js) 
// pueda buscar eficientemente por equipoId
export const equiposData = SEEDS_301.reduce((acc, equipo) => {
  acc[equipo.id] = equipo;
  return acc;
}, {});