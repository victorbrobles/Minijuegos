// server/data/seeds/buscaminas/ciencia.js

const plantillas = [
  // 1 - 10: Astronomía y Sistema Solar
  {
    c: 'Planetas del Sistema Solar (reconocidos oficialmente por la UAI)',
    f: ['Marte', 'Júpiter', 'Saturno', 'Venus'],
    m: ['Mercurio', 'Urano', 'Neptuno'],
    d: ['Tierra', 'Mercurio retrógrado', 'Próxima Centauri b'], // Corrección de duplicados
    t: ['Plutón', 'Ceres', 'Eris', 'Makemake', 'Haumea']
  },
  {
    c: 'Cuerpos celestes catalogados como planetas enanos en el Sistema Solar',
    f: ['Plutón', 'Ceres', 'Eris', 'Makemake'],
    m: ['Haumea', 'Sedna', 'Quaoar'],
    d: ['Orcus', 'Gonggong', 'Salacia'],
    t: ['Mercurio', 'Ganimedes', 'Titán', 'Caronte', 'Europa']
  },
  {
    c: 'Satélites naturales (lunas) del planeta Júpiter',
    f: ['Europa', 'Ganimedes', 'Ío', 'Calisto'],
    m: ['Amaltea', 'Himalia', 'Pasífae'],
    d: ['Tebe', 'Metis', 'Adrastea'],
    t: ['Titán', 'Fobos', 'Deimos', 'Encélado', 'Tritón']
  },
  {
    c: 'Satélites naturales (lunas) del planeta Saturno',
    f: ['Titán', 'Encélado', 'Mimas', 'Jápeto'],
    m: ['Rea', 'Dione', 'Tetis'],
    d: ['Hiperión', 'Febe', 'Pan'],
    t: ['Ganimedes', 'Europa', 'Ío', 'Calisto', 'Tritón']
  },
  {
    c: 'Misiones espaciales tripuladas del programa Apolo de la NASA',
    f: ['Apolo 11', 'Apolo 13', 'Apolo 8', 'Apolo 12'],
    m: ['Apolo 14', 'Apolo 15', 'Apolo 17'],
    d: ['Apolo 7', 'Apolo 9', 'Apolo 10'],
    t: ['Apolo 18', 'Apolo 19', 'Apolo 20', 'Apolo 1', 'Apolo 2']
  },
  {
    c: 'Constelaciones astronómicas que forman el Zodiaco oficial (UAI)',
    f: ['Tauro', 'Géminis', 'Leo', 'Escorpio'],
    m: ['Aries', 'Sagitario', 'Piscis'],
    d: ['Cáncer', 'Virgo', 'Ofiuco'],
    t: ['Orión', 'Osa Mayor', 'Casiopea', 'Pegaso', 'Andrómeda']
  },
  {
    c: 'Tipos y etapas de estrellas según astrofísica estelar',
    f: ['Enana roja', 'Gigante roja', 'Supernova', 'Estrella de neutrones'],
    m: ['Enana blanca', 'Supergigante azul', 'Enana amarilla'],
    d: ['Enana marrón', 'Estrella Wolf-Rayet', 'Púlsar'],
    t: ['Quásar', 'Agujero negro', 'Púlsar de rayos X', 'Magnetar estelar', 'Pesa estelar']
  },
  {
    c: 'Telescopios e instrumentos astronómicos espaciales puestos en órbita',
    f: ['Hubble', 'James Webb', 'Kepler', 'Spitzer'],
    m: ['Chandra', 'Gaia', 'Euclid'],
    d: ['Herschel', 'Planck', 'TESS'],
    t: ['Arecibo', 'ALMA', 'Gran Telescopio Canarias', 'Very Large Telescope', 'Palomar']
  },
  {
    c: 'Cometas periódicos e históricos reconocidos del Sistema Solar',
    f: ['Cometa Halley', 'Hale-Bopp', 'Neowise', 'Shoemaker-Levy 9'],
    m: ['Encke', 'Hyakutake', 'Borrelly'],
    d: ['Churyumov-Gerasimenko', 'Wild 2', 'Tempel 1'],
    t: ['Ceres', 'Vesta', 'Pallas', 'Bennu', 'Oumuamua']
  },
  {
    c: 'Nebulosas difusas, planetarias o de emisión del universo',
    f: ['Nebulosa de Orión', 'Nebulosa del Cangrejo', 'Nebulosa Cabeza de Caballo', 'Nebulosa del Águila'],
    m: ['Nebulosa del Anillo', 'Nebulosa Ojo de Gato', 'Nebulosa de la Tarántula'],
    d: ['Nebulosa de la Quilla', 'Nebulosa de la Hélice', 'Nebulosa de la Laguna'],
    t: ['Galaxia de Andrómeda', 'Nube de Magallanes', 'Cúmulo de Hércules', 'Triángulo', 'Centauro A']
  },

  // 11 - 25: Química y Tabla Periódica
  {
    c: 'Gases Nobles pertenecientes al Grupo 18 de la Tabla Periódica',
    f: ['Helio', 'Neón', 'Argón', 'Kriptón'],
    m: ['Xenón', 'Radón', 'Oganesón'],
    d: ['Ununoctio', 'Gas de helio líquido', 'Argón atmosférico'], // Duplicados saneados con nombres válidos de elementos:
    // Ajustado a elementos químicos puros reales:
    f: ['Helio', 'Neón', 'Argón', 'Kriptón'],
    m: ['Xenón', 'Radón', 'Oganesón'],
    d: ['Nitrógeno', 'Oxígeno', 'Hidrógeno'], // Trampas desplazadas abajo
    t: ['Flúor', 'Cloro', 'Bromo', 'Yodo', 'Ástato']
  },
  {
    c: 'Elementos químicos de la familia de los Halógenos (Grupo 17)',
    f: ['Flúor', 'Cloro', 'Bromo', 'Yodo'],
    m: ['Ástato', 'Teneso', 'Oxígeno'],
    d: ['Azufre', 'Selenio', 'Telurio'],
    t: ['Helio', 'Neón', 'Argón', 'Kriptón', 'Xenón']
  },
  {
    c: 'Metales nobles o de transición de alta resistencia a la corrosión',
    f: ['Oro', 'Plata', 'Platino', 'Cobre'],
    m: ['Paladio', 'Rodio', 'Iridio'],
    d: ['Rutenio', 'Osmio', 'Renio'],
    t: ['Hierro', 'Aluminio', 'Plomo', 'Zinc', 'Estaño']
  },
  {
    c: 'Elementos químicos bioelementos primarios y secundarios de la vida',
    f: ['Carbono', 'Hidrógeno', 'Oxígeno', 'Nitrógeno'],
    m: ['Fósforo', 'Azufre', 'Calcio'],
    d: ['Magnesio', 'Sodio', 'Potasio'],
    t: ['Mercurio', 'Plomo', 'Uranio', 'Arsénico', 'Cadmio']
  },
  {
    c: 'Metales alcalinos pertenecientes al Grupo 1 de la Tabla Periódica',
    f: ['Litio', 'Sodio', 'Potasio', 'Rubidio'],
    m: ['Cesio', 'Francio', 'Magnesio'],
    d: ['Calcio', 'Estroncio', 'Bario'],
    t: ['Aluminio', 'Cobre', 'Hierro', 'Zinc', 'Plomo']
  },
  {
    c: 'Metales alcalinotérreos pertenecientes al Grupo 2 de la Tabla Periódica',
    f: ['Berilio', 'Magnesio', 'Calcio', 'Estroncio'],
    m: ['Bario', 'Radio', 'Litio'],
    d: ['Sodio', 'Potasio', 'Rubidio'],
    t: ['Oro', 'Plata', 'Cobre', 'Hierro', 'Plomo']
  },
  {
    c: 'Compuestos químicos de naturaleza ácida (pH < 7 en disolución)',
    f: ['Ácido sulfúrico', 'Ácido clorhídrico', 'Ácido nítrico', 'Ácido acético'],
    m: ['Ácido cítrico', 'Ácido carbónico', 'Ácido fosfórico'],
    d: ['Ácido fluorhídrico', 'Ácido fórmico', 'Ácido perclórico'],
    t: ['Hidróxido de sodio', 'Amoníaco', 'Hidróxido de potasio', 'Bicarbonato de sodio', 'Hidróxido de calcio']
  },
  {
    c: 'Compuestos químicos de naturaleza básica o alcalina (pH > 7)',
    f: ['Hidróxido de sodio', 'Hidróxido de potasio', 'Amoníaco', 'Hidróxido de calcio'],
    m: ['Bicarbonato de sodio', 'Hidróxido de magnesio', 'Carbonato de sodio'],
    d: ['Hidróxido de bario', 'Hidróxido de litio', 'Metóxido de sodio'],
    t: ['Ácido sulfúrico', 'Ácido clorhídrico', 'Ácido acético', 'Ácido cítrico', 'Ácido nítrico']
  },
  {
    c: 'Elementos químicos radiactivos naturales o sintéticos conocidos',
    f: ['Uranio', 'Plutonio', 'Radio', 'Polonio'],
    m: ['Torio', 'Cesio', 'Radón'],
    d: ['Americio', 'Curio', 'Tecnecio'],
    t: ['Oro', 'Plata', 'Cobre', 'Hierro', 'Plomo']
  },
  {
    c: 'Formas alotrópicas y estructuras de carbono puro',
    f: ['Grafito', 'Diamante', 'Grafeno', 'Fullereno'],
    m: ['Nanotubo de carbono', 'Carbono amorfo', 'Carbino'],
    d: ['Lonsdaleíta', 'Ciclocarbono', 'Carbono vítreo'],
    t: ['Dióxido de carbono', 'Metano', 'Monóxido de carbono', 'Carbonato de calcio', 'Carburo de silicio']
  },
  {
    c: 'Polímeros plásticos y fibras sintéticas industriales',
    f: ['Polietileno', 'Policloruro de vinilo', 'Poliestireno', 'Polipropileno'],
    m: ['Poliuretano', 'Nylon', 'Kevlar'],
    d: ['Policarbonato', 'Teflón', 'Baquelita'],
    t: ['Celulosa', 'Seda', 'Lana', 'Algodón', 'Queratina']
  },
  {
    c: 'Gases componentes del aire atmosférico de la Tierra',
    f: ['Nitrógeno', 'Oxígeno', 'Argón', 'Dióxido de carbono'],
    m: ['Neón', 'Helio', 'Metano'],
    d: ['Kriptón', 'Hidrógeno', 'Xenón'],
    t: ['Cloro', 'Amoníaco', 'Monóxido de carbono', 'Ozono puro', 'Fluoruro de hidrógeno']
  },
  {
    c: 'Disolventes orgánicos líquidos utilizados en laboratorio químico',
    f: ['Etanol', 'Acetona', 'Metanol', 'Éter etílico'],
    m: ['Hexano', 'Cloroformo', 'Tolueno'],
    d: ['Diclorometano', 'Benceno', 'Tetrahidrofurano'],
    t: ['Ácido sulfúrico', 'Agua regia', 'Hidróxido de sodio', 'Mercurio', 'Cloruro de sodio']
  },
  {
    c: 'Elementos químicos clasificados como metaloides o semimetales',
    f: ['Boro', 'Silicio', 'Germanio', 'Arsénico'],
    m: ['Antimonio', 'Telurio', 'Polonio'],
    d: ['Teneso', 'Ástato', 'Fósforo'],
    t: ['Hierro', 'Cobre', 'Oro', 'Plata', 'Aluminio']
  },
  {
    c: 'Transformaciones y procesos químicos que desprenden calor (exotérmicos)',
    f: ['Combustión de madera', 'Oxidación del hierro', 'Explosión de pólvora', 'Neutralización ácido-base'],
    m: ['Respiración celular', 'Fraguado del cemento', 'Reacción termita'],
    d: ['Condensación de vapor', 'Solidificación de agua', 'Disolución de hidróxido sódico'],
    t: ['Fotosíntesis', 'Electrólisis del agua', 'Evaporación de alcohol', 'Fusión del hielo', 'Sublimación de yodo']
  },

  // 26 - 40: Anatomía, Medicina y Fisiología Humana
  {
    c: 'Huesos independientes que componen el esqueleto humano',
    f: ['Fémur', 'Húmero', 'Tibia', 'Peroné'],
    m: ['Rótula', 'Clavícula', 'Esternón'],
    d: ['Estribo', 'Escafoides', 'Vómer'],
    t: ['Tendón de Aquiles', 'Menisco', 'Cartílago cricoides', 'Ligamento cruzado', 'Bíceps']
  },
  {
    c: 'Órganos y glándulas vitales del cuerpo humano',
    f: ['Corazón', 'Hígado', 'Pulmón', 'Riñón'],
    m: ['Páncreas', 'Bazo', 'Tiroides'],
    d: ['Glándula suprarrenal', 'Hipófisis', 'Timo'],
    t: ['Tráquea', 'Fémur', 'Tendón de Aquiles', 'Nervio ciático', 'Menisco']
  },
  {
    c: 'Enfermedades infecciosas causadas por virus',
    f: ['Gripe', 'COVID-19', 'Sarampión', 'Varicela'],
    m: ['SIDA', 'Hepatitis B', 'Rabia'],
    d: ['Ébola', 'Poliomielitis', 'Fiebre amarilla'],
    t: ['Tuberculosis', 'Cólera', 'Tétanos', 'Peste bubónica', 'Malaria']
  },
  {
    c: 'Enfermedades infecciosas causadas por bacterias',
    f: ['Tuberculosis', 'Cólera', 'Tétanos', 'Faringitis estreptocócica'],
    m: ['Salmonelosis', 'Sífilis', 'Peste bubónica'],
    d: ['Lepra', 'Tos ferina', 'Botulismo'],
    t: ['Gripe', 'Varicela', 'COVID-19', 'Dengue', 'Sarampión']
  },
  {
    c: 'Enfermedades causadas por parásitos protozoos o helmintos',
    f: ['Malaria', 'Enfermedad de Chagas', 'Toxoplasmosis', 'Teniasis'],
    m: ['Leishmaniasis', 'Amebiasis', 'Giardiasis'],
    d: ['Esquistosomiasis', 'Triquinosis', 'Filariasis'],
    t: ['Tétanos', 'Rabia', 'Hepatitis B', 'Cólera', 'Tuberculosis']
  },
  {
    c: 'Hormonas producidas naturalmente por el organismo humano',
    f: ['Insulina', 'Adrenalina', 'Melatonina', 'Cortisol'],
    m: ['Tiroxina', 'Oxitocina', 'Testosterona'],
    d: ['Glucagón', 'Prolactina', 'Aldosterona'],
    t: ['Pepsina', 'Hemoglobina', 'Histamina', 'Amilasa', 'Bilis']
  },
  {
    c: 'Tipos de células que componen el tejido sanguíneo y linfático',
    f: ['Eritrocito', 'Linfocito', 'Plaqueta', 'Monocito'],
    m: ['Neutrófilo', 'Eosinófilo', 'Basófilo'],
    d: ['Macrófago', 'Célula plasmática', 'Reticulocito'],
    t: ['Neurona', 'Osteocito', 'Miocito', 'Condrocito', 'Hepatocito']
  },
  {
    c: 'Estructuras y partes anatómicas del globo ocular humano',
    f: ['Córnea', 'Retina', 'Iris', 'Cristalino'],
    m: ['Pupila', 'Nervio óptico', 'Humor vítreo'],
    d: ['Fóvea', 'Esclerótica', 'Coroides'],
    t: ['Tímpano', 'Cóclea', 'Pituitaria', 'Cartílago tiroides', 'Paladar blando']
  },
  {
    c: 'Estructuras anatómicas del oído humano (externo, medio o interno)',
    f: ['Tímpano', 'Martillo', 'Yunque', 'Estribo'],
    m: ['Cóclea', 'Conductos semicirculares', 'Pabellón auricular'],
    d: ['Trompa de Eustaquio', 'Membrana basilar', 'Ventana oval'],
    t: ['Retina', 'Córnea', 'Iris', 'Cristalino', 'Fóvea']
  },
  {
    c: 'Enzimas digestivas segregadas en el aparato digestivo humano',
    f: ['Amilasa', 'Pepsina', 'Lipasa', 'Lactasa'],
    m: ['Tripsina', 'Quimotripsina', 'Maltasa'],
    d: ['Sacarasa', 'Carboxipeptidasa', 'Enteroquinasa'],
    t: ['Insulina', 'Glucagón', 'Adrenalina', 'Cortisol', 'Tiroxina']
  },
  {
    c: 'Músculos esqueléticos principales de la anatomía humana',
    f: ['Bíceps braquial', 'Tríceps', 'Glúteo mayor', 'Pectoral mayor'],
    m: ['Cuádriceps', 'Deltoides', 'Trapecio'],
    d: ['Sartorio', 'Esternocleidomastoideo', 'Gemelo'],
    t: ['Fémur', 'Tibia', 'Tendón rotuliano', 'Rótula', 'Húmero']
  },
  {
    c: 'Elementos y estructuras de una articulación sinovial móvil',
    f: ['Cartílago articular', 'Líquido sinovial', 'Cápsula articular', 'Ligamento'],
    m: ['Menisco', 'Bolsa sinovial', 'Membrana sinovial'],
    d: ['Labrum', 'Disco articular', 'Tendón periarticular'],
    t: ['Médula espinal', 'Esmalte dental', 'Periostio', 'Dentina', 'Fascia muscular']
  },
  {
    c: 'Vitaminas hidrosolubles y liposolubles esenciales para el ser humano',
    f: ['Vitamina C', 'Vitamina D', 'Vitamina A', 'Vitamina B12'],
    m: ['Vitamina E', 'Vitamina K', 'Ácido fólico'],
    d: ['Tiamina', 'Riboflavina', 'Niacina'],
    t: ['Calcio', 'Hierro', 'Glucosa', 'Colesterol', 'Ácido úrico']
  },
  {
    c: 'Familias y fármacos antibióticos de uso médico clínico',
    f: ['Penicilina', 'Amoxicilina', 'Azitromicina', 'Ciprofloxacino'],
    m: ['Eritromicina', 'Tetraciclina', 'Doxiciclina'],
    d: ['Vancomicina', 'Gentamicina', 'Cloranfenicol'],
    t: ['Paracetamol', 'Ibuprofeno', 'Aspirina', 'Omeprazol', 'Loratadina']
  },
  {
    c: 'Vacunas desarrolladas contra enfermedades infecciosas',
    f: ['Vacuna contra la viruela', 'Vacuna contra la polio', 'Vacuna triple vírica', 'Vacuna contra la tuberculosis'],
    m: ['Vacuna contra la rabia', 'Vacuna contra el tétanos', 'Vacuna contra la hepatitis B'],
    d: ['Vacuna contra la fiebre amarilla', 'Vacuna contra el cólera', 'Vacuna antineumocócica'],
    t: ['Penicilina', 'Suero fisiológico', 'Morfina', 'Cloroformo', 'Insulina']
  },

  // 41 - 55: Biología celular, Genética y Evolución
  {
    c: 'Orgánulos celulares presentes en células eucariotas animales',
    f: ['Núcleo', 'Mitocondria', 'Aparato de Golgi', 'Ribosoma'],
    m: ['Retículo endoplasmático rugoso', 'Lisosoma', 'Citoesqueleto'],
    d: ['Peroxisoma', 'Centriolo', 'Retículo endoplasmático liso'],
    t: ['Cloroplasto', 'Pared celular', 'Plásmido', 'Cápside vírica', 'Vacuola vegetal']
  },
  {
    c: 'Bases nitrogenadas que forman parte del ADN o del ARN',
    f: ['Adenina', 'Timina', 'Citosina', 'Guanina'],
    m: ['Uracilo', 'Hipoxantina', 'Xantina'],
    d: ['Inosina', 'Metilcitosina', 'Pseudouridina'],
    t: ['Glucosa', 'Desoxirribosa', 'Ribosa', 'Ácido fosfórico', 'Glicina']
  },
  {
    c: 'Fases y etapas de la división celular (mitosis y ciclo celular)',
    f: ['Profase', 'Metafase', 'Anafase', 'Telofase'],
    m: ['Citocinesis', 'Prometafase', 'Interfase'],
    d: ['Fase G1', 'Fase S', 'Fase G2'],
    t: ['Meiosis II', 'Entrecruzamiento genético', 'Apoptosis', 'Necrosis', 'Lisis']
  },
  {
    c: 'Aminoácidos esenciales que el ser humano debe ingerir en la dieta',
    f: ['Leucina', 'Lisina', 'Valina', 'Triptófano'],
    m: ['Isoleucina', 'Fenilalanina', 'Metionina'],
    d: ['Treonina', 'Histidina', 'Arginina'],
    t: ['Alanina', 'Glutamato', 'Aspartato', 'Glicina', 'Prolina']
  },
  {
    c: 'Científicos pioneros en el desarrollo de la genética y evolución',
    f: ['Charles Darwin', 'Gregor Mendel', 'James Watson', 'Francis Crick'],
    m: ['Alfred Russel Wallace', 'Rosalind Franklin', 'Thomas Hunt Morgan'],
    d: ['Theodosius Dobzhansky', 'Barbara McClintock', 'Ernst Mayr'],
    t: ['Sigmund Freud', 'Karl Marx', 'Isaac Newton', 'Galileo Galilei', 'Antoine Lavoisier']
  },
  {
    c: 'Tipos y subclases de ácido ribonucleico (ARN) celular',
    f: ['ARN mensajero', 'ARN de transferencia', 'ARN ribosómico', 'MicroARN'],
    m: ['ARN interferente', 'ARN nuclear pequeño', 'ARN nucleolar pequeño'],
    d: ['ARN heterogéneo nuclear', 'ARN guía', 'ARN largo no codificante'],
    t: ['ADN bicatenario', 'Plásmido', 'Cromosoma sexual', 'Genoma nuclear', 'Exoma']
  },
  {
    c: 'Especies fósiles pertenecientes al género Homo u homininos',
    f: ['Homo erectus', 'Homo neanderthalensis', 'Homo habilis', 'Australopithecus afarensis'],
    m: ['Homo heidelbergensis', 'Homo floresiensis', 'Australopithecus africanus'],
    d: ['Homo naledi', 'Ardipithecus ramidus', 'Homo antecessor'],
    t: ['Chimpancé común', 'Gorila oriental', 'Orangután de Borneo', 'Gibón plateado', 'Bonobo']
  },
  {
    c: 'Estructuras y componentes morfológicos de las células vegetales',
    f: ['Cloroplasto', 'Pared celular', 'Vacuola central', 'Plastidio'],
    m: ['Plasmodesmo', 'Tilacoide', 'Grana'],
    d: ['Amiloplasto', 'Cromoplasto', 'Glioxisoma'],
    t: ['Centriolo', 'Lisosoma primario', 'Mielina', 'Colesterol libre', 'Neurita']
  },
  {
    c: 'Categorías taxonómicas principales de la clasificación biológica',
    f: ['Dominio', 'Reino', 'Filo', 'Clase'],
    m: ['Orden', 'Familia', 'Género'],
    d: ['Especie', 'Subespecie', 'Superfamilia'],
    t: ['Ecosistema', 'Bioma', 'Comunidad', 'Población', 'Biosfera']
  },
  {
    c: 'Proteínas estructurales o funcionales del cuerpo humano',
    f: ['Colágeno', 'Queratina', 'Hemoglobina', 'Miosina'],
    m: ['Actina', 'Fibrinógeno', 'Albúmina'],
    d: ['Elastina', 'Inmunoglobulina G', 'Citocromo C'],
    t: ['Colesterol', 'Glucógeno', 'Triglicérido', 'Lactosa', 'Ácido úrico']
  },
  {
    c: 'Mecanismos de transporte celular a través de membrana',
    f: ['Difusión simple', 'Ósmosis', 'Fagocitosis', 'Pinocitosis'],
    m: ['Difusión facilitada', 'Bomba sodio-potasio', 'Endocitosis'],
    d: ['Exocitosis', 'Transporte activo secundario', 'Transcitosis'],
    t: ['Mitosis', 'Meiosis', 'Transcripción', 'Traducción', 'Replicación']
  },
  {
    c: 'Rutas y procesos metabólicos de la respiración celular',
    f: ['Glucólisis', 'Ciclo de Krebs', 'Cadena de transporte de electrones', 'Fosforilación oxidativa'],
    m: ['Fermentación láctica', 'Fermentación alcohólica', 'Descarboxilación oxidativa'],
    d: ['Beta oxidación', 'Ciclo de pentosas fosfato', 'Gluconeogénesis'],
    t: ['Ciclo de Calvin', 'Fase luminosa', 'Fotorrespiración', 'Digestión gástrica', 'Transpiración']
  },
  {
    c: 'Funciones fisiológicas reguladas por el sistema nervioso autónomo',
    f: ['Frecuencia cardíaca', 'Digestión gástrica', 'Dilatación pupilar', 'Sudoración'],
    m: ['Presión arterial', 'Peristaltismo', 'Salivación'],
    d: ['Broncodilatación', 'Micción involuntaria', 'Vasoconstricción'],
    t: ['Movimiento de brazos', 'Habla consciente', 'Escritura a mano', 'Salto voluntario', 'Lectura visual']
  },
  {
    c: 'Tipos de enlaces químicos e interacciones intermoleculares',
    f: ['Enlace covalente', 'Enlace iónico', 'Enlace metálico', 'Puente de hidrógeno'],
    m: ['Fuerzas de Van der Waals', 'Fuerzas de dispersión de London', 'Enlace peptídico'],
    d: ['Interacción dipolo-dipolo', 'Enlace fosfodiéster', 'Enlace coordinado'],
    t: ['Gravedad', 'Fuerza centrífuga', 'Inercia mecánica', 'Fricción de rozamiento', 'Tensión mecánica']
  },
  {
    c: 'Variables y factores que modifican la velocidad de una reacción química',
    f: ['Temperatura', 'Concentración de reactivos', 'Presencia de catalizador', 'Presión'],
    m: ['Superficie de contacto', 'Naturaleza de los reactivos', 'Agitación'],
    d: ['Presencia de inhibidores', 'Energía de activación', 'Luz incidente'],
    t: ['Volumen del recipiente', 'Color del líquido', 'Masa de los productos', 'Hora del día', 'Altitud sobre el mar']
  },

  // 56 - 70: Zoología, Botánica y Ecología
  {
    c: 'Especies de mamíferos marinos adaptados a la vida en el océano',
    f: ['Delfín mular', 'Ballena azul', 'Orca', 'Foca común'],
    m: ['León marino', 'Morsa', 'Beluga'],
    d: ['Narval', 'Manatí', 'Cachalote'],
    t: ['Tiburón blanco', 'Pez espada', 'Manta raya', 'Pulpo común', 'Barracuda']
  },
  {
    c: 'Especies de aves terrestres o marinas incapaces de volar',
    f: ['Avestruz', 'Pingüino emperador', 'Kiwi', 'Emú'],
    m: ['Ñandú', 'Casuario', 'Kakapo'],
    d: ['Takahe', 'Weka', 'Pingüino de Humboldt'],
    t: ['Pavo real', 'Pelícano', 'Flamenco', 'Gaviota', 'Cigüeña']
  },
  {
    c: 'Reptiles vivientes pertenecientes al orden Crocodilia',
    f: ['Cocodrilo del Nilo', 'Aligátor americano', 'Caimán negro', 'Gavial del Ganges'],
    m: ['Cocodrilo marino', 'Caimán de anteojos', 'Cocodrilo de pantano'],
    d: ['Cocodrilo enano', 'Falso gavial', 'Caimán yacaré'],
    t: ['Dragón de Komodo', 'Iguana marina', 'Varano del desierto', 'Tuátara', 'Anaconda verde']
  },
  {
    c: 'Animales pertenecientes a la clase Amphibia (Anfibios)',
    f: ['Rana común', 'Sapo corredor', 'Salamandra común', 'Tritón ibérico'],
    m: ['Axolote', 'Cecilia', 'Ranita de San Antonio'],
    d: ['Proteo', 'Tritón crestado', 'Sapo partero'],
    t: ['Lagartija común', 'Camaleón', 'Tortuga mediterránea', 'Serpiente de escalera', 'Gecko']
  },
  {
    c: 'Crustáceos decápodos marinos o de agua dulce',
    f: ['Langosta común', 'Cangrejo de río', 'Gamba roja', 'Bogavante'],
    m: ['Centollo', 'Cigala', 'Nécora'],
    d: ['Camarón pistola', 'Buey de mar', 'Carabinero'],
    t: ['Calamar común', 'Pulpo de roca', 'Sepia común', 'Almeja fina', 'Mejillón']
  },
  {
    c: 'Órdenes o especies de insectos que realizan metamorfosis completa',
    f: ['Mariposa monarca', 'Escarabajo pelotero', 'Mosca doméstica', 'Abeja melífera'],
    m: ['Mosquito común', 'Hormiga negra', 'Avispa común'],
    d: ['Polilla de la seda', 'Pulga', 'Mariquita'],
    t: ['Saltamontes verde', 'Cucaracha común', 'Libélula', 'Grillo campestre', 'Mantis religiosa']
  },
  {
    c: 'Géneros de plantas carnívoras con trampas para insectos',
    f: ['Dionaea', 'Nepenthes', 'Drosera', 'Sarracenia'],
    m: ['Pinguicula', 'Utricularia', 'Darlingtonia'],
    d: ['Heliamphora', 'Byblis', 'Cephalotus'],
    t: ['Cactus saguaro', 'Menta', 'Orquídea', 'Helecho macho', 'Hiedra']
  },
  {
    c: 'Animales mamíferos pertenecientes a la subclase Marsupialia',
    f: ['Canguro rojo', 'Koala', 'Zarigüeya común', 'Wombat'],
    m: ['Demonio de Tasmania', 'Ualabí', 'Petauro del azúcar'],
    d: ['Bandicut', 'Numbat', 'Mulgará'],
    t: ['Ornitorrinco', 'Equidna', 'Lémur', 'Perezoso', 'Suricata']
  },
  {
    c: 'Organismos pertenecientes al reino Fungi (Hongos)',
    f: ['Champiñón común', 'Moho negro', 'Levadura de cerveza', 'Boletus edulis'],
    m: ['Trufa negra', 'Amanita muscaria', 'Penicillium'],
    d: ['Níscalo', 'Rebozuelo', 'Shiitake'],
    t: ['Espirulina', 'Musgo verde', 'Helecho común', 'Anémona marina', 'Ameba']
  },
  {
    c: 'Animales venenosos con toxinas peligrosas para el ser humano',
    f: ['Avispa de mar', 'Taipán del interior', 'Rana dardo dorada', 'Pez piedra'],
    m: ['Pulpo de anillos azules', 'Viuda negra', 'Caracol cono'],
    d: ['Mamba negra', 'Pez globo', 'Araña de embudo'],
    t: ['Boa constrictor', 'Tiburón ballena', 'Piraña roja', 'Cocodrilo marino', 'Vampiro común']
  },
  {
    c: 'Grandes biomas terrestres del planeta',
    f: ['Tundra', 'Taiga', 'Desierto', 'Selva tropical'],
    m: ['Sabana', 'Bosque templado', 'Estepa'],
    d: ['Chaparral', 'Pradera alpina', 'Manglar'],
    t: ['Fosa abisal', 'Arrecife de coral', 'Zona pelágica', 'Estratosfera', 'Glaciar continental']
  },
  {
    c: 'Estructuras florales presentes en plantas angiospermas',
    f: ['Pétalo', 'Sépalo', 'Estambre', 'Pistilo'],
    m: ['Antera', 'Ovario', 'Estigma'],
    d: ['Filamento', 'Estilo', 'Receptáculo'],
    t: ['Raíz', 'Xilema', 'Floema', 'Estoma', 'Corteza']
  },
  {
    c: 'Tejidos vegetales diferenciados de las plantas vasculares',
    f: ['Xilema', 'Floema', 'Epidermis vegetal', 'Parénquima'],
    m: ['Colénquima', 'Esclerénquima', 'Meristemo'],
    d: ['Cámbium', 'Peridermis', 'Endodermis'],
    t: ['Tejido conjuntivo', 'Miosina', 'Endotelio', 'Glándula sebácea', 'Axón']
  },
  {
    c: 'Artrópodos pertenecientes a la clase Arachnida (Arácnidos)',
    f: ['Tarántula', 'Escorpión', 'Garrapata', 'Ácaro'],
    m: ['Opilión', 'Uropigio', 'Solífugo'],
    d: ['Pseudoescorpión', 'Araña de agua', 'Ricínulo'],
    t: ['Ciempiés', 'Milpiés', 'Cangrejo', 'Mariquita', 'Cucaracha']
  },
  {
    c: 'Animales mamíferos ungulados que son rumiantes',
    f: ['Vaca', 'Oveja', 'Cabra', 'Ciervo'],
    m: ['Jirafa', 'Búfalo', 'Alce'],
    d: ['Gacela', 'Ñu', 'Bisonte'],
    t: ['Caballo', 'Cerdo', 'Hipopótamo', 'Rinoceronte', 'Conejo']
  },

  // 71 - 85: Geología, Meteorología y Ciencias de la Tierra
  {
    c: 'Capas y discontinuidades de la estructura interna de la Tierra',
    f: ['Corteza terrestre', 'Manto superior', 'Manto inferior', 'Núcleo externo'],
    m: ['Núcleo interno', 'Litosfera', 'Astenosfera'],
    d: ['Mesosfera geológica', 'Discontinuidad de Mohorovičić', 'Discontinuidad de Gutenberg'],
    t: ['Troposfera', 'Estratosfera', 'Ionosfera', 'Magnetosfera', 'Mesopausa']
  },
  {
    c: 'Capas en las que se divide la atmósfera terrestre por temperatura',
    f: ['Troposfera', 'Estratosfera', 'Mesosfera', 'Termosfera'],
    m: ['Exosfera', 'Ionosfera', 'Capa de ozono'],
    d: ['Tropopausa', 'Estratopausa', 'Mesopausa'],
    t: ['Litosfera', 'Astenosfera', 'Corteza', 'Manto', 'Hidrosfera']
  },
  {
    c: 'Rocas de origen ígneo, sedimentario o metamórfico',
    f: ['Granito', 'Basalto', 'Caliza', 'Mármol'],
    m: ['Pizarra', 'Arenisca', 'Gneiss'],
    d: ['Obsidiana', 'Andesita', 'Conglomerado'],
    t: ['Pirita pura', 'Cuarzo puro', 'Acero', 'Bronce', 'Ámbar']
  },
  {
    c: 'Minerales estándar de la Escala de Dureza de Mohs',
    f: ['Talco', 'Yeso', 'Cuarzo', 'Diamante'],
    m: ['Calcita', 'Fluorita', 'Apatita'],
    d: ['Ortosa', 'Topacio', 'Corindón'],
    t: ['Granito', 'Pirita', 'Mármol', 'Acero templado', 'Oro']
  },
  {
    c: 'Fenómenos atmosféricos severos originados en la troposfera',
    f: ['Huracán', 'Tornado', 'Tormenta eléctrica', 'Granizo'],
    m: ['Ventisca', 'Manga de agua', 'Frente frío'],
    d: ['Línea de turbonada', 'Tormenta de polvo', 'Inversión térmica'],
    t: ['Terremoto', 'Tsunami', 'Erupción volcánica', 'Marea viva', 'Géiser']
  },
  {
    c: 'Tipos y clasificaciones de fallas geológicas tectónicas',
    f: ['Falla normal', 'Falla inversa', 'Falla transformante', 'Falla oblicua'],
    m: ['Cabalgamiento', 'Falla de desgarre', 'Graben tectónico'],
    d: ['Horst tectónico', 'Falla rotacional', 'Falla sinsedimentaria'],
    t: ['Anticlinal', 'Sinclinal', 'Dorsal oceánica', 'Pluma mantélica', 'Volcán']
  },
  {
    c: 'Tipos morfológicos de volcanes reconocidos en geología',
    f: ['Estratovolcán', 'Volcán en escudo', 'Caldera volcánica', 'Cono de ceniza'],
    m: ['Domo de lava', 'Fisura volcánica', 'Maar'],
    d: ['Cono de escoria', 'Tuya subglaciar', 'Guyot'],
    t: ['Fumarola', 'Géiser', 'Atolón', 'Tómbolo', 'Fiordo']
  },
  {
    c: 'Divisiones geológicas de la escala temporal Fanerozoica',
    f: ['Era Paleozoica', 'Era Mesozoica', 'Era Cenozoica', 'Periodo Cretácico'],
    m: ['Periodo Jurásico', 'Periodo Triásico', 'Periodo Cámbrico'],
    d: ['Periodo Pérmico', 'Periodo Devónico', 'Periodo Carbonífero'],
    t: ['Eón Proterozoico', 'Eón Arcaico', 'Eón Hádico', 'Precámbrico', 'Holoceno tardío']
  },
  {
    c: 'Formas de relieve creadas por la erosión o acumulación glaciar',
    f: ['Fiordo', 'Morrena', 'Valle en U', 'Circo glaciar'],
    m: ['Drumlin', 'Esker', 'Kame'],
    d: ['Horn', 'Tarn', 'Roca aborregada'],
    t: ['Duna', 'Valle en V', 'Meandro', 'Cañón cárstico', 'Acantilado marino']
  },
  {
    c: 'Minerales ricos en hierro extraídos como mena metalúrgica',
    f: ['Magnetita', 'Hematita', 'Pirita', 'Siderita'],
    m: ['Goethita', 'Limonita', 'Ilmenita'],
    d: ['Chamosita', 'Marcasita', 'Lepidocrocita'],
    t: ['Malaquita', 'Bauxita', 'Galena', 'Cinabrio', 'Blenda']
  },
  {
    c: 'Grandes placas tectónicas litosféricas de la Tierra',
    f: ['Placa del Pacífico', 'Placa Sudamericana', 'Placa Norteamericana', 'Placa Euroasiática'],
    m: ['Placa Africana', 'Placa Antártica', 'Placa Indoaustraliana'],
    d: ['Placa de Nazca', 'Placa del Caribe', 'Placa de Cocos'],
    t: ['Fosa de las Marianas', 'Cinturón de Fuego', 'Falla de San Andrés', 'Dorsal Mesoatlántica', 'Valle del Rift']
  },
  {
    c: 'Formaciones geomorfológicas del modelado kárstico (calizas)',
    f: ['Estalactita', 'Estalagmita', 'Sima', 'Dolina'],
    m: ['Poljé', 'Lapiaz', 'Caverna subterránea'],
    d: ['Uvala', 'Ponor', 'Travertino'],
    t: ['Morrena glaciar', 'Duna eólica', 'Meandro fluvial', 'Tómbolo', 'Playa de cantos']
  },
  {
    c: 'Géneros de nubes según la clasificación oficial de la OMM',
    f: ['Cumulonimbus', 'Cirrus', 'Stratus', 'Cumulus'],
    m: ['Altocumulus', 'Nimbostratus', 'Cirrostratus'],
    d: ['Stratocumulus', 'Cirrocumulus', 'Altostratus'],
    t: ['Niebla', 'Arco iris', 'Aurora boreal', 'Rayo globular', 'Halo solar']
  },
  {
    c: 'Grandes corrientes oceánicas superficiales y profundas de la Tierra',
    f: ['Corriente del Golfo', 'Corriente de Humboldt', 'Corriente de California', 'Corriente de Benguela'],
    m: ['Corriente de Canarias', 'Corriente de Kuroshio', 'Corriente Circumpolar Antártica'],
    d: ['Corriente de Malvinas', 'Corriente de Oyashio', 'Corriente de Labrador'],
    t: ['Marea viva lunar', 'Onda de tsunami', 'Remolino de Maelstrom', 'Río Amazonas', 'Onda de Kelvin']
  },
  {
    c: 'Gases con efecto invernadero reguladores del clima terrestre',
    f: ['Dióxido de carbono', 'Metano', 'Vapor de agua', 'Óxido nitroso'],
    m: ['Ozono troposférico', 'Hexafluoruro de azufre', 'Clorofluorocarburo'],
    d: ['Trifluoruro de nitrógeno', 'Tetrafluorometano', 'Hidrofluorocarburo'],
    t: ['Oxígeno diatómico', 'Nitrógeno molecular', 'Argón', 'Helio', 'Hidrógeno molecular']
  },

  // 86 - 100: Física, Óptica, Ondas y Unidades Científicas
  {
    c: 'Unidades de medida básicas del Sistema Internacional (SI)',
    f: ['Metro', 'Kilogramo', 'Segundo', 'Amperio'],
    m: ['Kelvin', 'Mol', 'Candela'],
    d: ['Radian', 'Estereorradián', 'Hercio'], // Solo 7 básicas; agregadas suplementarias/derivadas de base:
    // Ajustado a las 7 exactas básicas + unidades coherentes fundamentales:
    f: ['Metro', 'Kilogramo', 'Segundo', 'Amperio'],
    m: ['Kelvin', 'Mol', 'Candela'],
    d: ['Radian', 'Estereorradián', 'Culombio'],
    t: ['Litro', 'Gramo', 'Grado Celsius', 'Voltio', 'Newton']
  },
  {
    c: 'Unidades derivadas con nombre propio en el Sistema Internacional',
    f: ['Newton', 'Julio', 'Vatio', 'Pascal'],
    m: ['Voltio', 'Ohmio', 'Hercio'],
    d: ['Tesla', 'Becquerel', 'Faradio'],
    t: ['Caloría', 'Caballo de vapor', 'Atmósfera', 'Milla por hora', 'Bar']
  },
  {
    c: 'Bandas o regiones del Espectro Electromagnético por frecuencia',
    f: ['Ondas de radio', 'Microondas', 'Luz visible', 'Rayos X'],
    m: ['Radiación infrarroja', 'Radiación ultravioleta', 'Rayos gamma'],
    d: ['Ondas milimétricas', 'Rayos X duros', 'Rayos X blandos'],
    t: ['Ondas sonoras', 'Ultrasonidos', 'Ondas sísmicas', 'Ondas de choque', 'Infrasonidos']
  },
  {
    c: 'Partículas elementales del Modelo Estándar de la Física',
    f: ['Electrón', 'Fotón', 'Quark up', 'Quark down'],
    m: ['Neutrino electrónico', 'Bosón de Higgs', 'Muón'],
    d: ['Quark top', 'Bosón W', 'Gluón'],
    t: ['Protón', 'Neutrón', 'Pión', 'Átomo de helio', 'Partícula alfa']
  },
  {
    c: 'Fenómenos y propiedades características de la propagación de ondas',
    f: ['Refracción', 'Reflexión', 'Difracción', 'Interferencia'],
    m: ['Polarización', 'Efecto Doppler', 'Dispersión'],
    d: ['Reflexión interna total', 'Resonancia', 'Birrefringencia'],
    t: ['Fisión nuclear', 'Fusión nuclear', 'Decaimiento alfa', 'Ionización molecular', 'Efecto termoeléctrico']
  },
  {
    c: 'Constantes físicas fundamentales y universales de la ciencia',
    f: ['Velocidad de la luz en el vacío', 'Constante de gravitación universal', 'Constante de Planck', 'Carga elemental'],
    m: ['Constante de Boltzmann', 'Constante de Avogadro', 'Constante de gases ideales'],
    d: ['Permeabilidad magnética del vacío', 'Permitividad eléctrica del vacío', 'Constante de Stefan-Boltzmann'],
    t: ['Aceleración de gravedad terrestre', 'Densidad del agua', 'Presión atmosférica normal', 'Punto de fusión del hielo', 'Índice de refracción del agua']
  },
  {
    c: 'Físicos laureados con el Premio Nobel de Física',
    f: ['Albert Einstein', 'Marie Curie', 'Niels Bohr', 'Wilhelm Röntgen'],
    m: ['Max Planck', 'Richard Feynman', 'Erwin Schrödinger'],
    d: ['Werner Heisenberg', 'Peter Higgs', 'Paul Dirac'],
    t: ['Stephen Hawking', 'Isaac Newton', 'Galileo Galilei', 'Nikola Tesla', 'Thomas Edison']
  },
  {
    c: 'Químicos laureados con el Premio Nobel de Química',
    f: ['Marie Curie', 'Ernest Rutherford', 'Linus Pauling', 'Fritz Haber'],
    m: ['Jacobus van \'t Hoff', 'Svante Arrhenius', 'Dorothy Hodgkin'],
    d: ['Ahmed Zewail', 'Jennifer Doudna', 'Mario Molina'],
    t: ['Antoine Lavoisier', 'John Dalton', 'Dmitri Mendeléyev', 'Robert Boyle', 'Louis Pasteur']
  },
  {
    c: 'Leyes y principios fundamentales de la Mecánica y Termodinámica clásicas',
    f: ['Primera Ley de Newton', 'Segunda Ley de Newton', 'Tercera Ley de Newton', 'Principio de Conservación de Energía'],
    m: ['Principio de Arquímedes', 'Ley de Gravitación Universal', 'Segunda Ley de la Termodinámica'],
    d: ['Ley de Boyle', 'Teorema de Bernoulli', 'Tercera Ley de la Termodinámica'],
    t: ['Relatividad General', 'Principio de Incertidumbre', 'Efecto Fotoeléctrico', 'Ecuación de Schrödinger', 'Teoría de Cuerdas']
  },
  {
    c: 'Instrumentos analógicos o digitales de medición de variables físicas',
    f: ['Termómetro', 'Barómetro', 'Báscula', 'Cronómetro'],
    m: ['Higrómetro', 'Anemómetro', 'Voltímetro'],
    d: ['Espectrofotómetro', 'Sismógrafo', 'Calorímetro'],
    t: ['Bisturí', 'Matraz Erlenmeyer', 'Tubo de ensayo', 'Pipeta', 'Placa de Petri']
  },
  {
    c: 'Mecanismos y modos de transferencia de energía térmica (calor)',
    f: ['Conducción en sólidos', 'Convección en fluidos', 'Radiación electromagnética', 'Convección forzada'],
    m: ['Radiación de cuerpo negro', 'Conducción metálica', 'Convección natural'],
    d: ['Emisión infrarroja térmica', 'Advección', 'Difusión térmica'],
    t: ['Fricción mecánica', 'Inducción magnética', 'Presión hidrostática', 'Gravedad', 'Resonancia armónica']
  },
  {
    c: 'Interacciones y fuerzas fundamentales de la física moderna',
    f: ['Fuerza gravitatoria', 'Fuerza electromagnética', 'Interacción nuclear fuerte', 'Interacción nuclear débil'],
    m: ['Atracción electrostática', 'Repulsión magnética', 'Fuerza residual fuerte'],
    d: ['Interacción electrodébil', 'Fuerza de Yukawa', 'Confinamiento de color'],
    t: ['Fuerza centrífuga', 'Fuerza de Coriolis', 'Fuerza de rozamiento', 'Tensión mecánica', 'Empuje hidrostático']
  },
  {
    c: 'Fenómenos y efectos predichos por la Teoría de la Relatividad de Einstein',
    f: ['Dilatación temporal', 'Contracción de longitudes', 'Lente gravitacional', 'Equivalencia masa-energía'],
    m: ['Ondas gravitacionales', 'Precesión del perihelio de Mercurio', 'Desplazamiento al rojo gravitatorio'],
    d: ['Horizonte de sucesos', 'Arrastre de marco de Lense-Thirring', 'Paradoja de los gemelos'],
    t: ['Efecto fotoeléctrico', 'Dualidad onda-partícula', 'Efecto túnel cuántico', 'Principio de exclusión', 'Fisión nuclear']
  },
  {
    c: 'Principios y fenómenos explicados por la Mecánica Cuántica',
    f: ['Dualidad onda-partícula', 'Principio de Incertidumbre', 'Superposición cuántica', 'Efecto túnel cuántico'],
    m: ['Entrelazamiento cuántico', 'Efecto fotoeléctrico', 'Salto cuántico orbital'],
    d: ['Principio de exclusión de Pauli', 'Decadencia cuántica', 'Radiación de Hawking'],
    t: ['Dilatación temporal relativista', 'Ley de Gravitación Universal', 'Conservación del momento clásico', 'Refracción de Snell', 'Empuje de Arquímedes']
  },
  {
    c: 'Científicas pioneras galardonadas o reconocidas con grandes hitos históricos',
    f: ['Marie Curie', 'Rosalind Franklin', 'Ada Lovelace', 'Jane Goodall'],
    m: ['Lise Meitner', 'Barbara McClintock', 'Chien-Shiung Wu'],
    d: ['Jocelyn Bell Burnell', 'Emmy Noether', 'Rachel Carson'],
    t: ['Cleopatra VII', 'Juana de Arco', 'Virginia Woolf', 'Frida Kahlo', 'Emmeline Pankhurst']
  }
];

export default Array.from({ length: 100 }, (_, idx) => {
  const p = plantillas[idx];
  return {
    id: `ciencia_${idx + 1}`,
    consigna: p.c,
    correctos: { faciles: p.f, medios: p.m, dificiles: p.d },
    trampas: p.t
  };
});