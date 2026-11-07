// server/data/seeds/geoquiz/fisica.js — Geografía física y naturaleza
import { R, O, E, P } from './_tipos.js';

export default {
  id: 'fisica',
  nombre: 'Geografía física',
  icono: 'mountain',
  preguntas: [
    // Montañas
    R('Montañas', '¿Cuál es la montaña más alta de América?', 'Aconcagua'),
    R('Montañas', '¿Cuál es la montaña más alta de África?', 'Kilimanjaro'),
    R('Montañas', '¿Cuál es la segunda montaña más alta del mundo?', 'K2'),
    R('Montañas', '¿En qué cordillera está el Everest?', 'Himalaya'),
    R('Montañas', '¿Cuál es la montaña más alta de los Alpes?', 'Mont Blanc|Montblanc|Monte Blanco'),
    E('Montañas', 'Montañas de más de 8.000 metros', [
      'Everest', 'K2', 'Kangchenjunga|Kanchenjunga', 'Lhotse', 'Makalu', 'Cho Oyu', 'Dhaulagiri', 'Manaslu', 'Nanga Parbat',
      'Annapurna', 'Gasherbrum I|Gasherbrum', 'Broad Peak', 'Gasherbrum II', 'Shishapangma'
    ], 'Hay exactamente 14 «ochomiles», todos en Asia.'),
    E('Cordilleras', 'Cordilleras del mundo', [
      'Andes', 'Himalaya', 'Alpes', 'Pirineos', 'Montañas Rocosas|Rocosas', 'Urales', 'Atlas', 'Cáucaso', 'Apeninos', 'Cárpatos',
      'Apalaches', 'Karakórum|Karakoram', 'Hindu Kush', 'Sierra Madre', 'Alpes Escandinavos|Montes Escandinavos', 'Cordillera Cantábrica|Cantábrica',
      'Altái|Altai', 'Tian Shan', 'Zagros', 'Balcanes'
    ]),

    // Ríos
    P('Ríos', [
      'Es uno de los ríos más largos de Europa',
      'Nace en la Selva Negra',
      'Atraviesa o hace de frontera de diez países',
      'Pasa por Viena, Bratislava, Budapest y Belgrado',
      'Desemboca en el mar Negro'
    ], 'Danubio'),
    R('Ríos', '¿Qué río pasa por Londres?', 'Támesis'),
    R('Ríos', '¿Qué río hace de frontera entre Estados Unidos y México en Texas?', 'Río Bravo|Bravo|Río Grande|Grande'),
    R('Ríos', '¿Cuál es el río más largo de Europa?', 'Volga'),
    E('Ríos', 'Ríos de más de 4.000 km de longitud', [
      'Nilo', 'Amazonas', 'Yangtsé|Yangtze|Azul', 'Misisipi|Mississippi', 'Yeniséi', 'Amarillo|Huang He', 'Obi', 'Paraná', 'Congo',
      'Amur', 'Lena', 'Mekong', 'Mackenzie', 'Níger'
    ]),

    // Desiertos
    P('Desiertos', [
      'Es un desierto cálido',
      'Ocupa una gran parte del norte de un continente',
      'Se extiende por más de diez países',
      'Su superficie es parecida a la de Estados Unidos',
      'Es el mayor desierto cálido del mundo'
    ], 'Sahara|Sáhara'),
    R('Desiertos', '¿Cuál es el desierto no polar más árido del mundo, situado en Chile?', 'Atacama'),
    E('Desiertos', 'Desiertos del mundo', [
      'Sahara|Sáhara', 'Gobi', 'Kalahari', 'Atacama', 'Arábigo|Arabia', 'Namib', 'Sonora', 'Mojave', 'Taklamakán|Taklamakan',
      'Patagonia|Patagónico', 'Thar', 'Gran Desierto de Victoria|Victoria', 'Chihuahua', 'Siria|Sirio', 'Antártico|Antártida', 'Ártico'
    ]),

    // Mares y océanos
    E('Mares y océanos', 'Mares de Europa', [
      'Mediterráneo', 'Báltico', 'Mar del Norte|Norte', 'Negro', 'Adriático', 'Egeo', 'Tirreno', 'Jónico', 'Cantábrico', 'Ligur',
      'Barents', 'Blanco', 'Noruega', 'Azov', 'Mármara', 'Irlanda', 'Alborán', 'Balear', 'Celta'
    ]),
    E('Islas', 'Islas del mar Mediterráneo', [
      'Sicilia', 'Cerdeña', 'Chipre', 'Córcega', 'Creta', 'Mallorca', 'Menorca', 'Ibiza', 'Formentera', 'Malta', 'Gozo', 'Rodas',
      'Lesbos', 'Eubea', 'Elba', 'Corfú', 'Djerba|Yerba', 'Capri', 'Cabrera', 'Quíos', 'Naxos', 'Santorini', 'Míkonos|Mykonos',
      'Lampedusa', 'Ischia', 'Cefalonia', 'Zante|Zakynthos'
    ]),
    O('Estrechos y canales', '¿Qué dos mares une el canal de Suez?', 'Mediterráneo y mar Rojo', ['Mediterráneo y mar Negro', 'Mar Rojo y océano Índico', 'Mar Negro y mar Caspio']),

    // Lagos
    E('Lagos', '¿Entre qué países se reparte el lago Victoria?', ['Uganda', 'Kenia', 'Tanzania']),
    E('Lagos', '¿Entre qué países se reparte el lago Titicaca?', ['Perú', 'Bolivia']),
    R('Lagos', '¿En qué país está el lago Baikal, el más profundo del mundo?', 'Rusia'),

    // Volcanes
    R('Volcanes', '¿En qué país está el volcán Etna?', 'Italia'),
    R('Volcanes', '¿En qué país está el volcán Popocatépetl?', 'México'),
    R('Volcanes', '¿En qué país está el Teide?', 'España'),
    R('Volcanes', '¿En qué país está el monte Fuji?', 'Japón'),
    O('Volcanes', '¿Qué volcán sepultó Pompeya en el año 79?', 'Vesubio', ['Etna', 'Estrómboli', 'Krakatoa']),

    // Cascadas
    E('Cascadas', '¿Entre qué dos países están las cataratas del Iguazú?', ['Argentina', 'Brasil']),
    E('Cascadas', '¿Entre qué dos países están las cataratas Victoria?', ['Zambia', 'Zimbabue|Zimbabwe']),
    R('Cascadas', '¿En qué país está el Salto Ángel, la cascada más alta del mundo?', 'Venezuela'),

    // Climas y puntos extremos
    O('Climas', '¿Qué clima tiene la cuenca del Amazonas?', 'Ecuatorial', ['Mediterráneo', 'Desértico', 'Continental']),
    O('Climas', '¿Qué clima es típico de la costa sur de España, Grecia o California?', 'Mediterráneo', ['Tropical', 'Oceánico', 'Polar']),
    O('Placas tectónicas', '¿Qué país está atravesado por la frontera entre la placa norteamericana y la euroasiática, a la vista en la superficie?', 'Islandia', ['Irlanda', 'Noruega', 'Portugal'])
  ]
};
