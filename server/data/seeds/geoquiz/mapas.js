// server/data/seeds/geoquiz/mapas.js — Mapas y ubicación
import { R, O, E, ORD } from './_tipos.js';

export default {
  id: 'mapas',
  nombre: 'Mapas y ubicación',
  icono: 'pin',
  preguntas: [
    // Continente correcto
    O('Continente correcto', '¿En qué continente está Kazajistán?', 'Asia', ['Europa', 'África', 'Oceanía'], 'Una pequeña parte de su territorio está en Europa.'),
    O('Continente correcto', '¿En qué continente está Papúa Nueva Guinea?', 'Oceanía', ['Asia', 'África', 'América']),
    O('Continente correcto', '¿En qué continente está Cabo Verde?', 'África', ['América', 'Europa', 'Oceanía']),
    O('Continente correcto', '¿En qué continente está Guyana?', 'América', ['África', 'Asia', 'Oceanía']),

    // Países transcontinentales
    E('Países transcontinentales', 'Países con territorio a la vez en Europa y en Asia', [
      'Rusia', 'Turquía', 'Kazajistán', 'Azerbaiyán', 'Georgia'
    ]),
    R('Países transcontinentales', '¿Qué país africano tiene una parte de su territorio, la península del Sinaí, en Asia?', 'Egipto'),

    // Enclaves
    R('Enclaves', '¿Qué país está completamente rodeado por Sudáfrica?', 'Lesoto'),
    R('Enclaves', 'Nombra un país completamente rodeado por Italia', 'San Marino|Ciudad del Vaticano|Vaticano'),
    O('Enclaves', '¿Cuántos países en el mundo están completamente rodeados por un único país?', '3', ['1', '5', '7'], 'Lesoto, San Marino y la Ciudad del Vaticano.'),

    // Territorios
    R('Territorios', '¿A qué país pertenece Groenlandia?', 'Dinamarca'),
    R('Territorios', '¿A qué país pertenece Puerto Rico?', 'Estados Unidos|EEUU|EE UU|USA'),
    R('Territorios', '¿A qué país pertenece la isla de Martinica?', 'Francia'),
    R('Territorios', '¿A qué país pertenecen las islas Feroe?', 'Dinamarca'),
    R('Territorios', '¿A qué país pertenece Nueva Caledonia?', 'Francia'),
    R('Territorios', '¿A qué reino pertenece la isla de Aruba?', 'Países Bajos|Holanda'),

    // Estrechos y canales
    O('Estrechos y canales', '¿Qué dos océanos une el canal de Panamá?', 'Atlántico y Pacífico', ['Atlántico e Índico', 'Pacífico e Índico', 'Ártico y Atlántico']),
    O('Estrechos y canales', '¿Qué dos países separa el estrecho de Bering?', 'Rusia y Estados Unidos', ['Rusia y Japón', 'Canadá y Estados Unidos', 'Japón y Corea']),
    O('Estrechos y canales', '¿En qué ciudad está el estrecho del Bósforo?', 'Estambul', ['Atenas', 'El Cairo', 'Odesa']),
    R('Estrechos y canales', '¿Qué país controla casi todo el estrecho de Magallanes?', 'Chile'),
    O('Estrechos y canales', '¿Qué separa el estrecho de Gibraltar?', 'Europa y África', ['Europa y Asia', 'África y Asia', 'España y Portugal']),

    // Orden geográfico
    ORD('Orden geográfico', 'Ordena estas capitales de oeste a este', ['Lisboa', 'Madrid', 'París', 'Berlín', 'Moscú'], 'de oeste a este'),
    ORD('Orden geográfico', 'Ordena estas ciudades de oeste a este', ['Ciudad de México', 'Bogotá', 'Buenos Aires', 'Río de Janeiro', 'Dakar'], 'de oeste a este'),
    ORD('Orden geográfico', 'Ordena estas capitales de norte a sur', ['Oslo', 'Londres', 'Roma', 'El Cairo', 'Nairobi'], 'de norte a sur'),
    ORD('Orden geográfico', 'Ordena estas ciudades de norte a sur', ['Ciudad de Panamá', 'Bogotá', 'Lima', 'Santiago', 'Ushuaia'], 'de norte a sur'),

    // ¿Dónde está?
    O('¿Dónde está?', '¿Entre qué dos países está Andorra?', 'España y Francia', ['Francia e Italia', 'España y Portugal', 'Francia y Suiza']),
    O('¿Dónde está?', '¿Qué país ocupa la mayor parte de la península Escandinava junto con Suecia?', 'Noruega', ['Finlandia', 'Dinamarca', 'Islandia']),
    O('¿Dónde está?', '¿Por qué país pasan a la vez el ecuador y el trópico de Capricornio?', 'Brasil', ['Argentina', 'Perú', 'Colombia'])
  ]
};
