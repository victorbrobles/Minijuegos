// server/data/seeds/geoquiz/simbolos.js — Banderas, símbolos y datos nacionales
import { R, O } from './_tipos.js';

export default {
  id: 'simbolos',
  nombre: 'Banderas y símbolos',
  icono: 'flag',
  preguntas: [
    // Banderas descritas
    O('Banderas', '¿Qué país tiene una bandera roja y blanca con una hoja de arce en el centro?', 'Canadá', ['Suiza', 'Perú', 'Austria']),
    O('Banderas', '¿Qué país tiene una bandera blanca con un círculo rojo en el centro?', 'Japón', ['Corea del Sur', 'Bangladés', 'Palaos']),
    O('Banderas', '¿Qué país tiene un cedro verde en el centro de su bandera?', 'Líbano', ['Chipre', 'Israel', 'Siria']),
    O('Banderas', '¿Qué país tiene una bandera cuadrada, roja, con una cruz blanca?', 'Suiza', ['Dinamarca', 'Inglaterra', 'Georgia']),
    O('Banderas', '¿Qué país tiene una bandera roja con una gran estrella amarilla?', 'Vietnam', ['China', 'Marruecos', 'Turquía']),
    O('Banderas parecidas', '¿Qué país tiene una bandera casi idéntica a la de Rumanía?', 'Chad', ['Moldavia', 'Andorra', 'Bélgica'], 'Solo se distinguen por un tono de azul ligeramente distinto.'),
    O('Banderas parecidas', '¿Qué país tiene una bandera casi idéntica a la de Indonesia?', 'Mónaco', ['Polonia', 'Singapur', 'Austria'], 'Las dos son roja arriba y blanca abajo; solo cambian las proporciones.'),
    O('Colores de una bandera', '¿Qué país tiene una bandera con tres franjas verticales verde, blanca y roja, sin escudo?', 'Italia', ['México', 'Irlanda', 'Hungría']),
    O('Colores de una bandera', '¿Qué país tiene una bandera azul con una cruz amarilla escandinava?', 'Suecia', ['Ucrania', 'Finlandia', 'Islandia']),

    // Monedas
    R('Monedas', '¿Cuál es la moneda de Japón?', 'Yen'),
    R('Monedas', '¿Cuál es la moneda de Suiza?', 'Franco suizo|Franco'),
    R('Monedas', '¿Cuál es la moneda de la India?', 'Rupia'),
    R('Monedas', '¿Cuál es la moneda de Rusia?', 'Rublo'),
    R('Monedas', '¿Cuál es la moneda de Brasil?', 'Real'),
    R('Monedas', '¿Cuál es la moneda de Sudáfrica?', 'Rand'),
    R('Monedas', '¿Cuál es la moneda de Corea del Sur?', 'Won'),
    R('Monedas', '¿Cuál es la moneda de Polonia?', 'Esloti|Zloty|Złoty'),
    R('Monedas', '¿Cuál es la moneda de Tailandia?', 'Baht'),

    // Gentilicios
    R('Gentilicios', '¿De qué país es alguien «malgache»?', 'Madagascar'),
    R('Gentilicios', '¿De qué país es alguien «monegasco»?', 'Mónaco'),
    R('Gentilicios', '¿De qué país es alguien «marfileño»?', 'Costa de Marfil'),
    R('Gentilicios', '¿De qué país es alguien «helvético»?', 'Suiza'),
    R('Gentilicios', '¿De qué país es alguien «nipón»?', 'Japón'),
    R('Gentilicios', '¿De qué país es alguien «costarricense»?', 'Costa Rica'),
    R('Gentilicios', '¿De qué país es alguien «chipriota»?', 'Chipre'),

    // Dominios de internet
    R('Dominios de Internet', '¿De qué país es el dominio de internet «.br»?', 'Brasil'),
    R('Dominios de Internet', '¿De qué país es el dominio de internet «.ch»?', 'Suiza', 'Viene del latín Confoederatio Helvetica.'),
    R('Dominios de Internet', '¿De qué país es el dominio de internet «.za»?', 'Sudáfrica', 'Viene del neerlandés Zuid-Afrika.'),
    R('Dominios de Internet', '¿De qué país es el dominio de internet «.de»?', 'Alemania', 'Viene de Deutschland.'),
    R('Dominios de Internet', '¿De qué país es el dominio de internet «.jp»?', 'Japón'),
    R('Dominios de Internet', '¿De qué país es el dominio de internet «.nl»?', 'Países Bajos|Holanda'),
    R('Dominios de Internet', '¿De qué país es el dominio de internet «.at»?', 'Austria'),

    // Prefijos telefónicos
    R('Prefijos telefónicos', '¿De qué país es el prefijo telefónico +55?', 'Brasil'),
    R('Prefijos telefónicos', '¿De qué país es el prefijo telefónico +81?', 'Japón'),
    R('Prefijos telefónicos', '¿De qué país es el prefijo telefónico +44?', 'Reino Unido|Inglaterra|Gran Bretaña'),
    R('Prefijos telefónicos', '¿De qué país es el prefijo telefónico +49?', 'Alemania'),
    R('Prefijos telefónicos', '¿De qué país es el prefijo telefónico +52?', 'México'),
    R('Prefijos telefónicos', '¿De qué país es el prefijo telefónico +351?', 'Portugal'),

    // Matrículas internacionales
    R('Matrículas internacionales', '¿De qué país es el distintivo internacional de coches «CH»?', 'Suiza'),
    R('Matrículas internacionales', '¿De qué país es el distintivo internacional de coches «D»?', 'Alemania'),
    R('Matrículas internacionales', '¿De qué país es el distintivo internacional de coches «A»?', 'Austria'),
    R('Matrículas internacionales', '¿De qué país es el distintivo internacional de coches «E»?', 'España')
  ]
};
