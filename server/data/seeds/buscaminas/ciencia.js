// server/data/seeds/buscaminas/ciencia.js

const plantillas = [
  // 1 - 10: Astronomía y Sistema Solar
  {
    c: 'Planetas del Sistema Solar (reconocidos oficialmente por la UAI)',
    f: ['Marte', 'Júpiter', 'Saturno', 'Venus'],
    m: ['Mercurio', 'Urano', 'Neptuno'],
    d: ['Tierra', 'Júpiter (gaseoso)', 'Saturno (anillado)'],
    t: ['Plutón', 'Ceres', 'Eris', 'Makemake', 'Haumea']
  },
  {
    c: 'Planetas enanos reconocidos en el Sistema Solar',
    f: ['Plutón', 'Ceres', 'Eris', 'Makemake'],
    m: ['Haumea', 'Sedna (candidato)', 'Quaoar (candidato)'],
    d: ['Orcus (candidato)', 'Gonggong (candidato)', 'Salacia (candidato)'],
    t: ['Mercurio', 'Neptuno', 'Ganimedes', 'Titán', 'Caronte']
  },
  {
    c: 'Lunas o satélites naturales del planeta Júpiter',
    f: ['Europa', 'Ganimedes', 'Ío', 'Calisto'],
    m: ['Amaltea', 'Himalia', 'Pasífae'],
    d: ['Tebe', 'Metis', 'Adrastea'],
    t: ['Titán', 'Fobos', 'Deimos', 'Encélado', 'Tritón']
  },
  {
    c: 'Lunas o satélites naturales del planeta Saturno',
    f: ['Titán', 'Encélado', 'Mimas', 'Jápeto'],
    m: ['Rea', 'Dione', 'Tetis'],
    d: ['Hiperión', 'Febe', 'Pan'],
    t: ['Ganimedes', 'Europa', 'Ío', 'Caronte', 'Fobos']
  },
  {
    c: 'Misiones espaciales tripuladas del programa Apolo de la NASA',
    f: ['Apolo 11', 'Apolo 13', 'Apolo 8', 'Apolo 12'],
    m: ['Apolo 14', 'Apolo 15', 'Apolo 17'],
    d: ['Apolo 7', 'Apolo 9', 'Apolo 10'],
    t: ['Apolo 18', 'Apolo 19', 'Apolo 20', 'Challenger 1', 'Curiosity 1']
  },
  {
    c: 'Constelaciones astronómicas del Zodiaco',
    f: ['Tauro', 'Géminis', 'Leo', 'Escorpio'],
    m: ['Aries', 'Sagitario', 'Piscis'],
    d: ['Cáncer', 'Virgo', 'Capricornio'],
    t: ['Orión', 'Osa Mayor', 'Casiopea', 'Pegaso', 'Centauro']
  },
  {
    c: 'Tipos de estrellas según su clasificación espectral o evolutiva',
    f: ['Enana roja', 'Gigante roja', 'Supernova', 'Estrella de neutrones'],
    m: ['Enana blanca', 'Enana amarilla', 'Supergigante azul'],
    d: ['Enana marrón', 'Estrella Wolf-Rayet', 'Pulsar'],
    t: ['Asteroide metálico', 'Cometa periódico', 'Quásar', 'Agujero de gusano', 'Planemo']
  },
  {
    c: 'Telescopios e instrumentos espaciales en órbita',
    f: ['Hubble', 'James Webb', 'Kepler', 'Spitzer'],
    m: ['Chandra', 'Gaia', 'Euclid'],
    d: ['Herschel', 'Planck', 'TESS'],
    t: ['Arecibo (terrestre)', 'ALMA (terrestre)', 'Gran Telescopio Canarias (terrestre)', 'Very Large Telescope', 'Palomar']
  },
  {
    c: 'Cometas célebres observados en la historia astronómica',
    f: ['Cometa Halley', 'Hale-Bopp', 'Neowise', 'Shoemaker-Levy 9'],
    m: ['Encke', 'Hyakutake', 'Borrelly'],
    d: ['Churyumov-Gerasimenko', 'Wild 2', 'Tempel 1'],
    t: ['Ceres', 'Vesta', 'Pallas', 'Bennu', 'Oumuamua']
  },
  {
    c: 'Grandes estructuras y nebulosas del universo observable',
    f: ['Nebulosa de Orión', 'Nebulosa del Cangrejo', 'Nebulosa Cabeza de Caballo', 'Pilares de la Creación'],
    m: ['Nebulosa del Águila', 'Nebulosa del Anillo', 'Nebulosa Ojo de Gato'],
    d: ['Nebulosa de la Tarántula', 'Nebulosa de la Quilla', 'Nebulosa de la Hélice'],
    t: ['Cúmulo de Virgo', 'Cinturón de Kuiper', 'Nube de Oort', 'Sagitario A*', 'Brazo de Orión']
  },

  // 11 - 25: Química y Tabla Periódica
  {
    c: 'Elementos químicos de la Tabla Periódica que son Gases Nobles',
    f: ['Helio', 'Neón', 'Argón', 'Kriptón'],
    m: ['Xenón', 'Radón', 'Oganesón'],
    d: ['Helio (gas inerte)', 'Neón (emisión roja)', 'Argón (mayor presencia en aire)'],
    t: ['Oxígeno', 'Nitrógeno', 'Hidrógeno', 'Cloro', 'Flúor']
  },
  {
    c: 'Elementos químicos clasificados como Halógenos',
    f: ['Flúor', 'Cloro', 'Bromo', 'Yodo'],
    m: ['Ástato', 'Teneso', 'Cloro gaseoso'],
    d: ['Bromo líquido', 'Yodo sublimable', 'Flúor reactivo'],
    t: ['Azufre', 'Fósforo', 'Selenio', 'Telurio', 'Helio']
  },
  {
    c: 'Metales preciosos o de transición de alto valor',
    f: ['Oro', 'Plata', 'Platino', 'Cobre'],
    m: ['Paladio', 'Rodio', 'Iridio'],
    d: ['Rutenio', 'Osmio', 'Renio'],
    t: ['Hierro', 'Aluminio', 'Plomo', 'Zinc', 'Estaño']
  },
  {
    c: 'Elementos químicos presentes en las biomoléculas orgánicas (CHONPS)',
    f: ['Carbono', 'Hidrógeno', 'Oxígeno', 'Nitrógeno'],
    m: ['Fósforo', 'Azufre', 'Carbono tetravalente'],
    d: ['Oxígeno molecular', 'Nitrógeno amínico', 'Fósforo de ATP'],
    t: ['Mercurio', 'Plomo', 'Uranio', 'Arsénico', 'Cadmio']
  },
  {
    c: 'Metales alcalinos del Grupo 1 de la Tabla Periódica',
    f: ['Litio', 'Sodio', 'Potasio', 'Cesio'],
    m: ['Rubidio', 'Francio', 'Litio metálico'],
    d: ['Sodio reactivo', 'Potasio iónico', 'Cesio fotosensible'],
    t: ['Magnesio', 'Calcio', 'Bario', 'Aluminio', 'Zinc']
  },
  {
    c: 'Metales alcalinotérreos del Grupo 2 de la Tabla Periódica',
    f: ['Calcio', 'Magnesio', 'Bario', 'Berilio'],
    m: ['Estroncio', 'Radio', 'Calcio óseo'],
    d: ['Magnesio clorofílico', 'Bario denso', 'Estroncio pirotécnico'],
    t: ['Sodio', 'Potasio', 'Hierro', 'Cobre', 'Plomo']
  },
  {
    c: 'Ácidos inorgánicos u orgánicos comunes en química',
    f: ['Ácido sulfúrico', 'Ácido clorhídrico', 'Ácido nítrico', 'Ácido acético (vinagre)'],
    m: ['Ácido cítrico', 'Ácido carbónico', 'Ácido fosfórico'],
    d: ['Ácido fluorhídrico', 'Ácido fórmico', 'Ácido perclórico'],
    t: ['Hidróxido de sodio', 'Amoníaco', 'Bicarbonato de sodio', 'Cal viva', 'Lejía']
  },
  {
    c: 'Bases o compuestos químicos alcalinos',
    f: ['Hidróxido de sodio (sosa)', 'Hidróxido de potasio', 'Amoníaco', 'Hidróxido de calcio'],
    m: ['Bicarbonato de sodio', 'Hidróxido de magnesio', 'Carbonato de sodio'],
    d: ['Hidróxido de bario', 'Hidróxido de litio', 'Metóxido de sodio'],
    t: ['Ácido sulfúrico', 'Ácido clorhídrico', 'Vinagre', 'Ácido acetilsalicílico', 'Ácido láctico']
  },
  {
    c: 'Elementos químicos radiactivos naturales o sintéticos',
    f: ['Uranio', 'Plutonio', 'Radio', 'Polonio'],
    m: ['Torio', 'Cesio-137', 'Radón'],
    d: ['Americio', 'Curio', 'Tecnecio'],
    t: ['Oro', 'Plata', 'Hierro', 'Silicio', 'Carbono-12']
  },
  {
    c: 'Alótropos del carbono puro en estado sólido',
    f: ['Grafito', 'Diamante', 'Grafeno', 'Fulerenos'],
    m: ['Nanotubos de carbono', 'Carbono amorfo', 'Carbino'],
    d: ['Lonsdaleíta', 'Ciclocarbono', 'Carbono vítreo'],
    t: ['Dióxido de carbono', 'Metano', 'Hidrocarburo', 'Carburo de silicio', 'Caliza']
  },
  {
    c: 'Polímeros plásticos sintéticos industriales',
    f: ['Polietileno (PE)', 'Policloruro de vinilo (PVC)', 'Poliestireno (PS)', 'Polipropileno (PP)'],
    m: ['Poliuretano', 'Polietilentereftalato (PET)', 'Nylon'],
    d: ['Policarbonato', 'Teflón (PTFE)', 'Kevlar'],
    t: ['Celulosa natural', 'Látex natural', 'Seda natural', 'Queratina', 'Colágeno']
  },
  {
    c: 'Gases presentes de forma natural en el aire atmosférico limpio',
    f: ['Nitrógeno', 'Oxígeno', 'Dióxido de carbono', 'Argón'],
    m: ['Vapor de agua', 'Metano', 'Ozono'],
    d: ['Neón', 'Kriptón', 'Helio atmosférico'],
    t: ['Gas cloro', 'Cianuro de hidrógeno', 'Amoníaco concentrado', 'Fosgeno', 'Gas mostaza']
  },
  {
    c: 'Disolventes orgánicos comunes en laboratorios químicos',
    f: ['Etanol', 'Acetona', 'Metanol', 'Éter etílico'],
    m: ['Hexano', 'Cloroformo', 'Tolueno'],
    d: ['Tetrahidrofurano (THF)', 'Diclorometano', 'Dimetilsulfóxido (DMSO)'],
    t: ['Ácido sulfúrico concentrado', 'Agua regia', 'Mercurio', 'Sosa cáustica', 'Cloruro sódico']
  },
  {
    c: 'Elementos semiconductores o metaloides',
    f: ['Silicio', 'Germanio', 'Arsénico', 'Boro'],
    m: ['Antimonio', 'Telurio', 'Polonio'],
    d: ['Silicio dopado', 'Arseniuro de galio (compuesto)', 'Carburo de silicio'],
    t: ['Hierro', 'Cobre puro', 'Oro puro', 'Plomo', 'Aluminio']
  },
  {
    c: 'Reacciones químicas exotérmicas',
    f: ['Combustión de madera', 'Oxidación del hierro', 'Explosión de pólvora', 'Neutralización ácido-base'],
    m: ['Respiración celular', 'Fraguado del cemento', 'Reacción termita'],
    d: ['Adición de agua a cal viva', 'Polimerización de resinas', 'Disolución de ácido sulfúrico en agua'],
    t: ['Fotosíntesis', 'Electrólisis del agua', 'Cocción de pan', 'Evaporación de agua', 'Descomposición térmica']
  },

  // 26 - 40: Anatomía, Medicina y Fisiología Humana
  {
    c: 'Huesos individuales que forman parte del esqueleto humano',
    f: ['Fémur', 'Húmero', 'Tibia', 'Peroné'],
    m: ['Rótula', 'Clavícula', 'Esternón'],
    d: ['Estribo (oído)', 'Escafoides', 'Vómer'],
    t: ['Tendón de Aquiles', 'Menisco', 'Cartílago hialino', 'Médula espinal', 'Bíceps']
  },
  {
    c: 'Órganos internos del cuerpo humano con función endocrina o vital',
    f: ['Corazón', 'Hígado', 'Pulmones', 'Riñón'],
    m: ['Páncreas', 'Bazo', 'Glándula tiroides'],
    d: ['Glándula suprarrenal', 'Hipófisis (pituitaria)', 'Timo'],
    t: ['Tráquea', 'Fémur', 'Menisco', 'Cartílago cricoides', 'Esmalte dental']
  },
  {
    c: 'Enfermedades infecciosas causadas estrictamente por virus',
    f: ['Gripe (influenza)', 'COVID-19', 'Sarampión', 'Varicela'],
    m: ['VIH/SIDA', 'Hepatitis B', 'Rabia'],
    d: ['Ébola', 'Fiebre amarilla', 'Poliomielitis'],
    t: ['Tuberculosis (bacteria)', 'Cólera (bacteria)', 'Tétanos (bacteria)', 'Malaria (protozoo)', 'Pie de atleta (hongo)']
  },
  {
    c: 'Enfermedades infecciosas causadas por bacterias',
    f: ['Tuberculosis', 'Cólera', 'Tétanos', 'Faringitis estreptocócica'],
    m: ['Salmonelosis', 'Sífilis', 'Peste bubónica'],
    d: ['Lepra', 'Tos ferina', 'Botulismo'],
    t: ['Gripe', 'Varicela', 'COVID-19', 'Dengue', 'SIDA']
  },
  {
    c: 'Enfermedades causadas por parásitos protozoarios o helmintos',
    f: ['Malaria (paludismo)', 'Enfermedad de Chagas', 'Toxoplasmosis', 'Teniasis (solitaria)'],
    m: ['Leishmaniasis', 'Amebiasis', 'Giardiasis'],
    d: ['Esquistosomiasis', 'Triquinosis', 'Filariasis'],
    t: ['Tétanos', 'Rabia', 'Hepatitis C', 'Sarampión', 'Fiebre tifoidea']
  },
  {
    c: 'Hormonas producidas naturalmente por el organismo humano',
    f: ['Insulina', 'Adrenalina', 'Melatonina', 'Cortisol'],
    m: ['Tiroxina', 'Oxitocina', 'Testosterona'],
    d: ['Glucagón', 'Prolactina', 'Aldosterona'],
    t: ['Bilis', 'Pepsina', 'Hemoglobina', 'Histamina', 'Amilasa']
  },
  {
    c: 'Tipos de células que componen el tejido sanguíneo',
    f: ['Eritrocito (glóbulo rojo)', 'Linfocito', 'Plaqueta (trombocito)', 'Monocito'],
    m: ['Neutrófilo', 'Eosinófilo', 'Basófilo'],
    d: ['Macrófago', 'Célula plasmática', 'Reticulocito'],
    t: ['Neurona', 'Osteocito', 'Miocito', 'Condrocito', 'Hepatocito']
  },
  {
    c: 'Partes anatómicas del ojo humano',
    f: ['Córnea', 'Retina', 'Iris', 'Cristalino'],
    m: ['Pupila', 'Nervio óptico', 'Humor vítreo'],
    d: ['Fóvea', 'Esclerótica', 'Coroides'],
    t: ['Tímpano', 'Caracol', 'Pituitaria', 'Cartílago tiroides', 'Paladar blando']
  },
  {
    c: 'Partes anatómicas del oído humano (externo, medio e interno)',
    f: ['Tímpano', 'Martillo', 'Yunque', 'Estribo'],
    m: ['Cóclea (caracol)', 'Canales semicirculares', 'Pabellón auditivo'],
    d: ['Trompa de Eustaquio', 'Membrana basilar', 'Órgano de Corti'],
    t: ['Retina', 'Córnea', 'Iris', 'Glándula parótida', 'Úvula']
  },
  {
    c: 'Enzimas digestivas segregadas en el tracto gastrointestinal',
    f: ['Amilasa', 'Pepsina', 'Lipasa', 'Lactasa'],
    m: ['Tripsina', 'Quimotripsina', 'Maltasa'],
    d: ['Sacarasa', 'Peptidasa', 'Enteroquinasa'],
    t: ['Insulina', 'Bilis', 'Ácido clorhídrico', 'Glucagón', 'Adrenalina']
  },
  {
    c: 'Músculos esqueléticos principales del cuerpo humano',
    f: ['Bíceps braquial', 'Tríceps', 'Glúteo mayor', 'Pectoral mayor'],
    m: ['Cuádriceps femoral', 'Deltoides', 'Trapecio'],
    d: ['Sartorio', 'Esternocleidomastoideo', 'Gastrocnemio (gemelo)'],
    t: ['Fémur', 'Tibia', 'Tendón rotuliano', 'Ligamento cruzado', 'Menisco medial']
  },
  {
    c: 'Tipos o componentes principales de las articulaciones humanas',
    f: ['Cartílago articular', 'Líquido sinovial', 'Cápsula articular', 'Ligamentos'],
    m: ['Menisco', 'Bolsa sinovial (bursa)', 'Membrana sinovial'],
    d: ['Rodete articular (labrum)', 'Líquido hialurónico', 'Disco articular'],
    t: ['Médula ósea', 'Periostio', 'Placa motora', 'Esmalte dental', 'Fascia muscular']
  },
  {
    c: 'Vitaminas esenciales hidrosolubles o liposolubles reconocidas',
    f: ['Vitamina C', 'Vitamina D', 'Vitamina A', 'Vitamina B12'],
    m: ['Vitamina E', 'Vitamina K', 'Ácido fólico (B9)'],
    d: ['Tiamina (B1)', 'Riboflavina (B2)', 'Niacina (B3)'],
    t: ['Vitamina F', 'Calcio', 'Hierro', 'Glucosa', 'Colesterol']
  },
  {
    c: 'Antibióticos célebres utilizados en medicina clínica',
    f: ['Penicilina', 'Amoxicilina', 'Azitromicina', 'Ciprofloxacino'],
    m: ['Eritromicina', 'Tetraciclina', 'Doxiciclina'],
    d: ['Vancomicina', 'Gentamicina', 'Cefalosporina'],
    t: ['Paracetamol', 'Ibuprofeno', 'Aspirina', 'Omeprazol', 'Insulina']
  },
  {
    c: 'Vacunas históricas contra patógenos que salvaron millones de vidas',
    f: ['Vacuna contra la viruela', 'Vacuna contra la polio', 'Vacuna triple vírica (MMR)', 'Vacuna BCG (tuberculosis)'],
    m: ['Vacuna contra la rabia', 'Vacuna contra el tétanos', 'Vacuna de la hepatitis B'],
    d: ['Vacuna contra el cólera', 'Vacuna antineumocócica', 'Vacuna contra el meningococo'],
    t: ['Suero fisiológico', 'Antibiótico de amplio espectro', 'Penicilina inyectable', 'Morfina líquida', 'Cloroformo']
  },

  // 41 - 55: Biología celular, Genética y Evolución
  {
    c: 'Orgánulos presentes en células eucariotas animales',
    f: ['Núcleo celular', 'Mitocondria', 'Aparato de Golgi', 'Ribosoma'],
    m: ['Retículo endoplasmático rugoso', 'Lisosoma', 'Citoesqueleto'],
    d: ['Peroxisoma', 'Centriolo', 'Retículo endoplasmático liso'],
    t: ['Cloroplasto (vegetal)', 'Pared celular de celulosa', 'Cápside vírica', 'Plásmido bacteriano', 'Flagelo bacteriano']
  },
  {
    c: 'Bases nitrogenadas que componen los ácidos nucleicos (ADN y ARN)',
    f: ['Adenina', 'Timina', 'Citosina', 'Guanina'],
    m: ['Uracilo (ARN)', 'Adenina purina', 'Guanina purina'],
    d: ['Citosina pirimidina', 'Timina pirimidina', 'Uracilo pirimidina'],
    t: ['Glucosa', 'Ribosa', 'Desoxirribosa', 'Ácido fosfórico', 'Histona']
  },
  {
    c: 'Fases del ciclo de división celular por mitosis',
    f: ['Profase', 'Metafase', 'Anafase', 'Telofase'],
    m: ['Citocinesis', 'Prometafase', 'Interfase (fase previa)'],
    d: ['Fase G1', 'Fase S (síntesis)', 'Fase G2'],
    t: ['Meiosis II', 'Entrecruzamiento genético', 'Apopotosis', 'Necrosis', 'Lisis']
  },
  {
    c: 'Aminoácidos esenciales que el cuerpo humano no sintetiza y debe ingerir',
    f: ['Leucina', 'Lisina', 'Valina', 'Triptófano'],
    m: ['Isoleucina', 'Fenilalanina', 'Metionina'],
    d: ['Treonina', 'Histidina', 'Leucina ramificada'],
    t: ['Alanina', 'Glutamato', 'Aspartato', 'Glicina', 'Prolina']
  },
  {
    c: 'Científicos clave en el desarrollo de la genética y la teoría evolutiva',
    f: ['Charles Darwin', 'Gregor Mendel', 'James Watson', 'Francis Crick'],
    m: ['Alfred Russel Wallace', 'Rosalind Franklin', 'Thomas Hunt Morgan'],
    d: ['Theodosius Dobzhansky', 'Barbara McClintock', 'Ernst Mayr'],
    t: ['Sigmund Freud', 'Karl Marx', 'Isaac Newton', 'Galileo Galilei', 'Antoine Lavoisier']
  },
  {
    c: 'Tipos de ARN con funciones biológicas celulares concretas',
    f: ['ARN mensajero (ARNm)', 'ARN de transferencia (ARNt)', 'ARN ribosómico (ARNr)', 'MicroARN'],
    m: ['ARN interferente pequeño (siARN)', 'ARN nuclear pequeño (snARN)', 'ARN nucleolar pequeño'],
    d: ['ARN heterogéneo nuclear', 'ARN guía de CRISPR', 'ARN no codificante largo'],
    t: ['ADN mitocondrial', 'Plásmido', 'Cromosoma sexual', 'Genoma', 'Exoma']
  },
  {
    c: 'Especies de homínidos fósiles del linaje evolutivo humano',
    f: ['Homo erectus', 'Homo neanderthalensis', 'Homo habilis', 'Australopithecus afarensis'],
    m: ['Homo heidelbergensis', 'Homo floresiensis', 'Australopithecus africanus'],
    d: ['Homo naledi', 'Ardipithecus ramidus', 'Homo antecessor'],
    t: ['Chimpancé moderno', 'Gorila de montaña', 'Orangután de Borneo', 'Gibón plateado', 'Gigantopithecus']
  },
  {
    c: 'Estructuras y componentes exclusivos o típicos de células vegetales',
    f: ['Cloroplasto', 'Pared celular de celulosa', 'Vacuola central gigante', 'Plastidios'],
    m: ['Plasmodesmos', 'Tilacoides', 'Grana'],
    d: ['Amiloplastos', 'Cromoplastos', 'Glioxisomas'],
    t: ['Centriolos (animales)', 'Lisosomas primarios', 'Glucógeno citoplásmico', 'Colesterol de membrana', 'Mielina']
  },
  {
    c: 'Niveles de clasificación taxonómica biológica obligatorios',
    f: ['Reino', 'Familia', 'Género', 'Especie'],
    m: ['Filo (Phylum)', 'Clase', 'Orden'],
    d: ['Dominio', 'Subespecie', 'Superfamilia'],
    t: ['Población', 'Comunidad', 'Bioma', 'Ecosistema', 'Biosfera']
  },
  {
    c: 'Proteínas estructurales o funcionales del cuerpo humano',
    f: ['Colágeno', 'Queratina', 'Hemoglobina', 'Miosina'],
    m: ['Actina', 'Fibrinógeno', 'Albumina'],
    d: ['Elastina', 'Inmunoglobulina G', 'Citocromo C'],
    t: ['Colesterol', 'Glucógeno', 'Triglicéridos', 'Lactosa', 'Ácido úrico']
  },
  {
    c: 'Mecanismos de transporte a través de la membrana plasmática',
    f: ['Difusión simple', 'Ósmosis', 'Fagocitosis', 'Pinocitosis'],
    m: ['Difusión facilitada', 'Bomba de sodio-potasio', 'Endocitosis'],
    d: ['Exocitosis regulada', 'Transporte activo secundario', 'Acuaporinas'],
    t: ['Mitosis', 'Meiosis', 'Traducción de proteínas', 'Transcripción génica', 'Replicación']
  },
  {
    c: 'Procesos de respiración celular y metabolismo energético',
    f: ['Glucólisis', 'Ciclo de Krebs', 'Cadena de transporte de electrones', 'Fermentación láctica'],
    m: ['Fosforilación oxidativa', 'Fermentación alcohólica', 'Descarboxilación oxidativa'],
    d: ['Beta oxidación de ácidos grasos', 'Ciclo de las pentosas fosfato', 'Gluconeogénesis'],
    t: ['Fijación de carbono de Calvin', 'Fase luminosa de fotosíntesis', 'Fotorrespiración', 'Digestión enzimática', 'Transpiración estomática']
  },
  {
    c: 'Procesos fisiológicos regulados por el sistema nervioso autónomo',
    f: ['Frecuencia cardíaca', 'Digestión gástrica', 'Dilatación de pupilas', 'Sudoración'],
    m: ['Presión arterial', 'Peristaltismo intestinal', 'Salivación'],
    d: ['Broncodilatación', 'Micción vesical involuntaria', 'Vasoconstricción periférica'],
    t: ['Movimiento voluntario de brazos', 'Habla consciente', 'Escritura a mano', 'Salto atlético', 'Cálculo matemático']
  },
  {
    c: 'Tipos de enlaces químicos moleculares o intermoleculares',
    f: ['Enlace covalente', 'Enlace iónico', 'Enlace metálico', 'Puente de hidrógeno'],
    m: ['Fuerzas de Van der Waals', 'Enlace covalente polar', 'Enlace peptídico'],
    d: ['Interacciones dipolo-dipolo', 'Fuerzas de dispersión de London', 'Enlace fosfodiéster'],
    t: ['Gravedad newtoniana', 'Fuerza centrífuga', 'Inercia estática', 'Fricción de rozamiento', 'Tensión superficial neta']
  },
  {
    c: 'Factores que alteran la velocidad de una reacción química',
    f: ['Temperatura', 'Concentración de reactivos', 'Presencia de catalizador', 'Presión en gases'],
    m: ['Área de superficie de contacto', 'Agitación mecánica', 'Naturaleza química de reactivos'],
    d: ['Presencia de inhibidores enzimáticos', 'Energía de activación de Arrhenius', 'Radiación ultravioleta incidente'],
    t: ['Volumen del vaso de precipitados', 'Hora del día', 'Masa de los productos finales', 'Altitud sobre nivel del mar', 'Color del recipiente']
  },

  // 56 - 70: Zoología, Botánica y Ecología
  {
    c: 'Mamíferos marinos que habitan en los océanos',
    f: ['Delfín común', 'Ballena azul', 'Orca', 'Foca común'],
    m: ['León marino', 'Morsa', 'Beluga'],
    d: ['Narval', 'Manatí', 'Cachalote'],
    t: ['Tiburón blanco', 'Pez espada', 'Manta raya', 'Pulpo gigante', 'Barracuda']
  },
  {
    c: 'Aves incapaces de volar en estado natural',
    f: ['Pingüino emperador', 'Avestruz africano', 'Kiwi común', 'Emú australiano'],
    m: ['Ñandú', 'Casuario del sur', 'Kakapo de Nueva Zelanda'],
    d: ['Calamón takahe', 'Weka', 'Pingüino de Magallanes'],
    t: ['Pavo real', 'Pelícano común', 'Flamenco rosa', 'Gaviota argéntea', 'Cigüeña blanca']
  },
  {
    c: 'Reptiles vivientes pertenecientes al orden Crocodilia',
    f: ['Cocodrilo del Nilo', 'Aligátor americano', 'Caimán negro', 'Gavilán del Ganges'],
    m: ['Cocodrilo marino', 'Caimán de anteojos', 'Cocodrilo de pantano'],
    d: ['Cocodrilo enano africano', 'Falso gavial malayo', 'Caimán yacaré'],
    t: ['Dragón de Komodo', 'Iguana marina', 'Varano del desierto', 'Tuátara', 'Anaconda verde']
  },
  {
    c: 'Animales anfibios (clase Amphibia)',
    f: ['Rana común', 'Sapo corredor', 'Salamandra común', 'Tritón ibérico'],
    m: ['Axolote mexicano', 'Cecilia (ápodo)', 'Ranita de San Antonio'],
    d: ['Proteo de las cavernas', 'Tritón crestado', 'Sapo partero'],
    t: ['Lagartija común', 'Camaleón del Yemen', 'Tortuga mediterránea', 'Serpiente de escalera', 'Gecko diurno']
  },
  {
    c: 'Crustáceos decápodos comestibles o de vida marina/fluvial',
    f: ['Langosta marina', 'Cangrejo de río', 'Gamba roja', 'Bogavante europeo'],
    m: ['Centollo', 'Cigala', 'Nécora'],
    d: ['Percebe (cirrípedo)', 'Camarón pistola', 'Buey de mar'],
    t: ['Calamar común', 'Pulpo de roca', 'Sepia común', 'Almeja fina', 'Mejillón gallego']
  },
  {
    c: 'Insectos con metamorfosis completa (holometábolos)',
    f: ['Mariposa monarca', 'Escarabajo pelotero', 'Mosca común', 'Abeja melífera'],
    m: ['Mosquito trompetero', 'Hormiga negra', 'Avispa común'],
    d: ['Polilla de la seda', 'Pulga de perro', 'Mariquita de siete puntos'],
    t: ['Saltamontes verde', 'Cucaracha común', 'Libélula emperador', 'Grillo campestre', 'Mantina religiosa']
  },
  {
    c: 'Plantas carnívoras con trampas activas o pasivas',
    f: ['Venus atrapamoscas', 'Nepenthes (planta jarro)', 'Drosera (rocío del sol)', 'Sarracenia'],
    m: ['Pinguicula', 'Utricularia', 'Darlingtonia'],
    d: ['Heliamphora', 'Byblis', 'Cephalotus follicularis'],
    t: ['Cactus saguaro', 'Menta poleo', 'Orquídea phalaenopsis', 'Hiedra común', 'Helecho macho']
  },
  {
    c: 'Animales marsupiales originarios de Australasia o América',
    f: ['Canguro rojo', 'Koala', 'Zarigüeya común', 'Wombat común'],
    m: ['Demonio de Tasmania', 'Ualabí', 'Planeador del azúcar'],
    d: ['Bandicut rayado', 'Numbat', 'Uombat de nariz peluda'],
    t: ['Ornitorrinco (monotrema)', 'Equidna (monotrema)', 'Lemur de cola anillada', 'Suricata', 'Perezoso tridáctilo']
  },
  {
    c: 'Seres vivos pertenecientes al reino Fungi (Hongos)',
    f: ['Champiñón silvestre', 'Moho negro del pan', 'Levadura de cerveza', 'Seta boletus edulis'],
    m: ['Trufa negra de invierno', 'Amanita muscaria', 'Penicillium chrysogenum'],
    d: ['Níscalo común', 'Chanterelle amarilla', 'Hongo shiitake'],
    t: ['Alga espirulina (cianobacteria)', 'Musgo verde de roca', 'Helecho común', 'Anémona de mar', 'Amoeba proteus']
  },
  {
    c: 'Animales con veneno letal o de defensa biológica peligrosa',
    f: ['Medusa avispa de mar', 'Serpiente taipán de interior', 'Rana dardo dorada', 'Pez piedra'],
    m: ['Pulpo de anillos azules', 'Araña viuda negra', 'Caracol cono'],
    d: ['Mamba negra', 'Pez globo (tetrodotoxina)', 'Araña de embudo de Sídney'],
    t: ['Boa constrictor', 'Tiburón ballena', 'Piraña roja', 'Cocodrilo marino', 'Vampiro común']
  },
  {
    c: 'Grandes biomas terrestres del planeta Tierra',
    f: ['Tundra ártica', 'Taiga (bosque boreal)', 'Desierto cálido', 'Selva tropical'],
    m: ['Sabana africana', 'Bosque templado caducifolio', 'Estepa templada'],
    d: ['Matorral mediterráneo (chaparral)', 'Pradera alpina', 'Manglar costero'],
    t: ['Fosa abisal', 'Arrecife de coral', 'Zona pelágica', 'Estratosfera', 'Glaciar continental']
  },
  {
    c: 'Partes morfológicas de una flor de angiosperma',
    f: ['Pétalo', 'Sépalo', 'Estambre', 'Pistilo'],
    m: ['Antera', 'Ovario vegetal', 'Estigma'],
    d: ['Filamento estaminal', 'Estilo', 'Óvulo vegetal'],
    t: ['Raíz pivotante', 'Xilema', 'Floema', 'Estoma foliar', 'Corteza leñosa']
  },
  {
    c: 'Tejidos vegetales conductores o de soporte en plantas vasculares',
    f: ['Xilema', 'Floema', 'Epidermis vegetal', 'Parénquima'],
    m: ['Colénquima', 'Esclerénquima', 'Meristemo apical'],
    d: ['Cámbium vascular', 'Peridermis', 'Felógeno'],
    t: ['Tejido conjuntivo', 'Miosina muscular', 'Endotelio vascular', 'Glándula sebácea', 'Axón']
  },
  {
    c: 'Artrópodos pertenecientes a la clase Arachnida',
    f: ['Tarántula goliat', 'Escorpión dorado', 'Garrapata común', 'Ácaro del polvo'],
    m: ['Opilión (segador)', 'Uropigio (vinagrón)', 'Solífugo'],
    d: ['Pseudoescorpión', 'Araña de agua', 'Ricínulo'],
    t: ['Ciempiés común (quilópodo)', 'Milpiés gigante (diplópodo)', 'Cangrejo violinista', 'Mariquita', 'Cucaracha']
  },
  {
    c: 'Animales herbívoros rumiantes con estómagos multicamerales',
    f: ['Vaca doméstica', 'Oveja común', 'Cabra montés', 'Ciervo común'],
    m: ['Jirafa', 'Búfalo africano', 'Alce euroasiático'],
    d: ['Gacela de Thomson', 'Ñu azul', 'Bisonte americano'],
    t: ['Caballo percherón', 'Cerdo ibérico', 'Hipopótamo común', 'Rinoceronte blanco', 'Conejo de campo']
  },

  // 71 - 85: Geología, Meteorología y Ciencias de la Tierra
  {
    c: 'Capas estructurales del interior de la Tierra (modelo geoquímico)',
    f: ['Corteza continental', 'Corteza oceánica', 'Manto superior', 'Núcleo externo'],
    m: ['Manto inferior', 'Núcleo interno sólido', 'Litosfera'],
    d: ['Astenosfera dúctil', 'Mesosfera geológica', 'Discontinuidad de Mohorovičić'],
    t: ['Troposfera', 'Estratosfera', 'Hidrosfera líquida', 'Ionosfera', 'Magnetosfera']
  },
  {
    c: 'Capas estructurales de la atmósfera terrestre',
    f: ['Troposfera', 'Estratosfera', 'Mesosfera', 'Termosfera'],
    m: ['Exosfera', 'Ionosfera', 'Capa de ozono'],
    d: ['Homosfera', 'Heterosfera', 'Exobase'],
    t: ['Litosfera', 'Astenosfera', 'Corteza terrestre', 'Capa freática', 'Núcleo de hierro']
  },
  {
    c: 'Tipos de rocas clasificadas por su origen geológico',
    f: ['Roca ígnea', 'Roca sedimentaria', 'Roca metamórfica', 'Granito'],
    m: ['Basalto volcánico', 'Caliza marina', 'Mármol cristalino'],
    d: ['Pizarra foliada', 'Gneiss bandado', 'Obsidiana vítrea'],
    t: ['Mineral puro', 'Fósil carbonizado', 'Aleación metálica', 'Hulla bituminosa', 'Ámbar fosilífero']
  },
  {
    c: 'Minerales en la Escala de Dureza de Mohs',
    f: ['Talco (dureza 1)', 'Yeso (dureza 2)', 'Cuarzo (dureza 7)', 'Diamante (dureza 10)'],
    m: ['Calcita (dureza 3)', 'Fluorita (dureza 4)', 'Apatita (dureza 5)'],
    d: ['Ortoclasa / Feldespato (dureza 6)', 'Topacio (dureza 8)', 'Corindón (dureza 9)'],
    t: ['Granito macizo', 'Pirita de hierro', 'Ámbar amarillo', 'Mármol blanco', 'Acero templado']
  },
  {
    c: 'Fenómenos atmosféricos y meteorológicos severos',
    f: ['Huracán tropical', 'Tornado de embudo', 'Tormenta eléctrica con rayos', 'Granizada severa'],
    m: ['Ventisca de nieve', 'Manga de agua marina', 'Frente frío ocluido'],
    d: ['Derecho (tormenta en línea)', 'Habub (tormenta de polvo)', 'Capa de inversión térmica'],
    t: ['Terremoto tectónico', 'Tsunami costero', 'Erupción volcánica pliniana', 'Géiser hidrotermal', 'Marea viva de luna']
  },
  {
    c: 'Tipos de fallas geológicas tectónicas',
    f: ['Falla normal', 'Falla inversa', 'Falla de desgarre (transformante)', 'Falla de San Andrés'],
    m: ['Cabalgamiento tectónico', 'Falla oblicua', 'Fosa tectónica (graben)'],
    d: ['Pilar tectónico (horst)', 'Falla sinsedimentaria', 'Falla rotacional'],
    t: ['Anticlinal suave', 'Sinclinal profundo', 'Dorsal oceánica', 'Pluma mantélica', 'Volcán en escudo']
  },
  {
    c: 'Tipos de volcanes según su morfología eruptiva',
    f: ['Estratovolcán', 'Volcán en escudo', 'Caldera volcánica', 'Cono de ceniza'],
    m: ['Domo de lava', 'Fisura volcánica', 'Maar hidrovolcánico'],
    d: ['Cono de escoria', 'Guyot submarino', 'Tuya subglaciar'],
    t: ['Géiser termal', 'Fumarola de vapor', 'Atolón coralino', 'Tómbolo costero', 'Fiordo glacial']
  },
  {
    c: 'Eras geológicas del eón Fanerozoico',
    f: ['Era Paleozoica', 'Era Mesozoica', 'Era Cenozoica', 'Periodo Cretácico'],
    m: ['Periodo Jurásico', 'Periodo Triásico', 'Periodo Cámbrico'],
    d: ['Periodo Pérmico', 'Periodo Devónico', 'Periodo Carbonífero'],
    t: ['Eón Proterozoico', 'Eón Arcaico', 'Eón Hádico', 'Precámbrico informal', 'Época del Antropoceno']
  },
  {
    c: 'Formas de relieve creadas por la acción de los glaciares',
    f: ['Fiordo inundado', 'Morrena frontal', 'Valle en U', 'Circo glaciar'],
    m: ['Drumlin alargado', 'Kame arenoso', 'Esker fluvioglaciar'],
    d: ['Horns piramidales', 'Lagos tipo tarn', 'Rocas aborregadas'],
    t: ['Duna de desierto', 'Valle fluvial en V', 'Meandro serpenteante', 'Cañón cárstico', 'Acantilado marino']
  },
  {
    c: 'Minerales ricos en hierro extraídos en minería',
    f: ['Magnetita', 'Hematita', 'Pirita de hierro', 'Siderita'],
    m: ['Goethita', 'Limonita', 'Ilmenita'],
    d: ['Chamosita', 'Tacónita', 'Marcasita'],
    t: ['Malaquita (cobre)', 'Bauxita (aluminio)', 'Galena (plomo)', 'Cinabrio (mercurio)', 'Blenda (zinc)']
  },
  {
    c: 'Grandes placas tectónicas litosféricas de la Tierra',
    f: ['Placa del Pacífico', 'Placa Sudamericana', 'Placa Norteamericana', 'Placa Euroasiática'],
    m: ['Placa Africana', 'Placa Antártica', 'Placa Indoaustraliana'],
    d: ['Placa de Nazca', 'Placa del Caribe', 'Placa de Cocos'],
    t: ['Fosa de las Marianas', 'Cinturón de Fuego', 'Falla de San Andrés', 'Dorsal Mesoatlántica', 'Gran Valle del Rift']
  },
  {
    c: 'Formaciones geomorfológicas del relieve cárstico (disolución de calizas)',
    f: ['Estalactita', 'Estalagmita', 'Sima vertical', 'Dolina (torca)'],
    m: ['Poljé kárstico', 'Lapiaz (lenar)', 'Cueva subterránea'],
    d: ['Uvala compuesta', 'Ponor kárstico', 'Travertino'],
    t: ['Morrena glaciar', 'Duna barján', 'Meandro fluvial', 'Tómbolo arenoso', 'Playa de cantos']
  },
  {
    c: 'Tipos de nubes según su altitud y aspecto en meteorología',
    f: ['Cumulonimbos de tormenta', 'Cirros altos', 'Estratos bajos', 'Cúmulos de buen tiempo'],
    m: ['Altocúmulos', 'Nimbostratos de lluvia continua', 'Cirroestratos'],
    d: ['Estratocúmulos', 'Cirrocúmulos', 'Nubes lenticulares'],
    t: ['Niebla de radiación (no nube suspendida)', 'Arco iris', 'Aurora boreal', 'Rayo globular', 'Manga de viento']
  },
  {
    c: 'Corrientes oceánicas termohalinas y superficiales del planeta',
    f: ['Corriente del Golfo', 'Corriente de Humboldt', 'Corriente de California', 'Corriente de Benguela'],
    m: ['Corriente de las Canarias', 'Corriente de Kuroshio', 'Corriente Circumpolar Antártica'],
    d: ['Corriente de las Malvinas', 'Corriente de Oyashio', 'Corriente de Labrador'],
    t: ['Marea viva lunar', 'Onda de tsunami', 'Torbellino de Maelstrom', 'Río Amazonas', 'Canal de Panamá']
  },
  {
    c: 'Gases con efecto invernadero natural o antropogénico reconocido',
    f: ['Dióxido de carbono (CO2)', 'Metano (CH4)', 'Vapor de agua (H2O)', 'Óxido nitroso (N2O)'],
    m: ['Ozono troposférico (O3)', 'Clorofluorocarbonos (CFC)', 'Hexafluoruro de azufre (SF6)'],
    d: ['Hidrofluorocarbonos (HFC)', 'Trifluoruro de nitrógeno (NF3)', 'Perfluorocarbonos (PFC)'],
    t: ['Oxígeno diatómico (O2)', 'Nitrógeno molecular (N2)', 'Argón puro', 'Helio gaseoso', 'Hidrógeno molecular (H2)']
  },

  // 86 - 100: Física, Óptica, Ondas y Unidades Científicas
  {
    c: 'Unidades de medida fundamentales del Sistema Internacional (SI)',
    f: ['Metro (longitud)', 'Kilogramo (masa)', 'Segundo (tiempo)', 'Amperio (corriente)'],
    m: ['Kelvin (temperatura)', 'Mol (cantidad de sustancia)', 'Candela (intensidad luminosa)'],
    d: ['Segundo de cesio-133', 'Metro patrón luminoso', 'Kilogramo de constante de Planck'],
    t: ['Litro', 'Gramo', 'Grado Celsius', 'Voltio', 'Newton']
  },
  {
    c: 'Unidades derivadas con nombre especial en el Sistema Internacional (SI)',
    f: ['Newton (fuerza)', 'Julio (energía)', 'Vatio (potencia)', 'Pascal (presión)'],
    m: ['Voltio (tensión)', 'Ohmio (resistencia)', 'Hercio (frecuencia)'],
    d: ['Tesla (campo magnético)', 'Becquerel (radiactividad)', 'Faradio (capacitancia)'],
    t: ['Caloría (no SI)', 'Caballo de vapor (CV)', 'Atmósfera técnica', 'Milla por hora', 'Bar de presión']
  },
  {
    c: 'Regiones del Espectro Electromagnético según su frecuencia',
    f: ['Ondas de radio', 'Microondas', 'Luz visible', 'Rayos X'],
    m: ['Radiación infrarroja', 'Radiación ultravioleta', 'Rayos gamma'],
    d: ['Luz visible roja (700 nm)', 'Luz visible violeta (400 nm)', 'Rayos X duros'],
    t: ['Ondas sonoras audibles', 'Ultrasonidos médicos', 'Ondas sísmicas P', 'Ondas de choque en agua', 'Infrasonidos']
  },
  {
    c: 'Partículas subatómicas elementales del Modelo Estándar',
    f: ['Electrón', 'Fotón', 'Quark up', 'Quark down'],
    m: ['Neutrino electrónico', 'Bosón de Higgs', 'Muón'],
    d: ['Quark top', 'Bosón W', 'Gluón'],
    t: ['Protón (compuesto)', 'Neutrón (compuesto)', 'Pión (mesón)', 'Átomo de hidrógeno', 'Partícula alfa']
  },
  {
    c: 'Fenómenos físicos característicos del comportamiento de las ondas',
    f: ['Refracción', 'Reflexión', 'Difracción', 'Interferencia'],
    m: ['Polarización', 'Efecto Doppler', 'Dispersión'],
    d: ['Reflexión interna total', 'Resonancia acústica', 'Birefringencia óptica'],
    t: ['Fisión nuclear', 'Fusión nuclear', 'Decaimiento alfa', 'Ionización por impacto', 'Efecto termoeléctrico']
  },
  {
    c: 'Constantes físicas universales fundamentales de la naturaleza',
    f: ['Velocidad de la luz en el vacío (c)', 'Constante de gravitación universal (G)', 'Constante de Planck (h)', 'Carga elemental del electrón (e)'],
    m: ['Constante de Boltzmann (k)', 'Número de Avogadro (NA)', 'Constante de los gases ideales (R)'],
    d: ['Permeabilidad magnética del vacío (μ0)', 'Permitividad eléctrica del vacío (ε0)', 'Constante de Stefan-Boltzmann'],
    t: ['Aceleración de gravedad en la Tierra (g variable)', 'Densidad del agua pura', 'Presión atmosférica estándar', 'Punto de ebullición del agua', 'Índice de refracción del diamante']
  },
  {
    c: 'Científicos galardonados con el Premio Nobel de Física',
    f: ['Albert Einstein', 'Marie Curie', 'Niels Bohr', 'Wilhelm Röntgen'],
    m: ['Max Planck', 'Richard Feynman', 'Erwin Schrödinger'],
    d: ['Werner Heisenberg', 'Peter Higgs', 'Paul Dirac'],
    t: ['Stephen Hawking (nunca lo ganó)', 'Isaac Newton (pre-Nobel)', 'Galileo Galilei (pre-Nobel)', 'Nikola Tesla', 'Thomas Edison']
  },
  {
    c: 'Científicos galardonados con el Premio Nobel de Química',
    f: ['Marie Curie', 'Ernest Rutherford', 'Linus Pauling', 'Dmitri Mendeléyev (candidato histórico)'],
    m: ['Jacobus Henricus van \'t Hoff', 'Svante Arrhenius', 'Fritz Haber'],
    d: ['Dorothy Crowfoot Hodgkin', 'Ahmed Zewail', 'Jennifer Doudna'],
    t: ['Antoine Lavoisier (pre-Nobel)', 'John Dalton (pre-Nobel)', 'Robert Boyle (pre-Nobel)', 'Alfred Nobel', 'Louis Pasteur']
  },
  {
    c: 'Leyes o principios fundamentales de la Mecánica Clásica y Termodinámica',
    f: ['Primera Ley de Newton (Inercia)', 'Segunda Ley de Newton (F = m·a)', 'Principio de Conservación de la Energía', 'Tercera Ley de Newton (Acción-Reacción)'],
    m: ['Principio de Arquímedes', 'Ley de Gravitación Universal', 'Segunda Ley de la Termodinámica (Entropía)'],
    d: ['Ley de Boyle-Mariotte', 'Teorema de Bernoulli', 'Tercera Ley de la Termodinámica (Cero Absoluto)'],
    t: ['Teoría de la Relatividad General (relativista)', 'Principio de Incertidumbre de Heisenberg (cuántica)', 'Efecto Fotoeléctrico (cuántica)', 'Ecuación de Schrödinger (cuántica)', 'Teoría de Cuerdas']
  },
  {
    c: 'Instrumentos científicos de medición de magnitudes físicas',
    f: ['Termómetro (temperatura)', 'Barómetro (presión)', 'Báscula analítica (masa)', 'Cronómetro digital (tiempo)'],
    m: ['Higrómetro (humedad)', 'Anemómetro (velocidad del viento)', 'Voltímetro (diferencia de potencial)'],
    d: ['Espectrofotómetro (absorbancia)', 'Sismógrafo (ondas sísmicas)', 'Calorímetro (calor de reacción)'],
    t: ['Bisturí quirúrgico', 'Matraz Erlenmeyer', 'Tubo de ensayo', 'Pipeta de vidrio', 'Placa de Petri']
  },
  {
    c: 'Formas fundamentales de transmisión de calor o energía térmica',
    f: ['Conducción térmica en sólidos', 'Convección térmica en fluidos', 'Radiación térmica electromagnética', 'Convección forzada'],
    m: ['Radiación de cuerpo negro', 'Conducción en metales', 'Convección natural por flotabilidad'],
    d: ['Emisión infrarroja de Planck', 'Advección térmica', 'Difusión térmica molecular'],
    t: ['Fricción mecánica cinética', 'Inducción magnética estática', 'Presión hidrostática pura', 'Gravedad newtoniana', 'Resonancia armónica simple']
  },
  {
    c: 'Fuerzas o interacciones fundamentales del Universo físico',
    f: ['Fuerza gravitatoria', 'Fuerza electromagnética', 'Interacción nuclear fuerte', 'Interacción nuclear débil'],
    m: ['Atracción electrostática', 'Repulsión magnética', 'Fuerza residual nuclear'],
    d: ['Interacción de Yukawa', 'Fuerza electrodébil unificada', 'Confinamiento de color'],
    t: ['Fuerza centrífuga (fuerza ficticia)', 'Fuerza de Coriolis (fuerza ficticia)', 'Rozamiento aerodinámico', 'Tensión de una cuerda', 'Empuje hidrostático']
  },
  {
    c: 'Efectos y fenómenos explicados por la Teoría de la Relatividad de Einstein',
    f: ['Dilatación del tiempo a altas velocidades', 'Contracción espacial de Lorentz', 'Lentes gravitacionales (desvío de luz)', 'Equivalencia masa-energía (E=mc²)'],
    m: ['Ondas gravitacionales', 'Precesión del perihelio de Mercurio', 'Desplazamiento al rojo gravitatorio'],
    d: ['Límite del horizonte de sucesos en agujeros negros', 'Arrastre de marco de Lense-Thirring', 'Paradoja de los gemelos relativista'],
    t: ['Efecto fotoeléctrico (mecánica cuántica)', 'Dualidad onda-partícula', 'Efecto túnel cuántico', 'Principio de exclusión de Pauli', 'Fisión del núcleo de uranio']
  },
  {
    c: 'Fenómenos y principios explicados por la Mecánica Cuántica',
    f: ['Dualidad onda-partícula', 'Principio de Incertidumbre de Heisenberg', 'Superposición cuántica', 'Efecto túnel cuántico'],
    m: ['Entrelazamiento cuántico', 'Efecto fotoeléctrico', 'Salto cuántico entre orbitales'],
    d: ['Principio de exclusión de Pauli', 'Decadencia cuántica espontánea', 'Radiación de Hawking'],
    t: ['Dilatación temporal relativista', 'Ley de Gravitación Universal', 'Conservación del momento lineal clásico', 'Refracción de Snell en vidrio', 'Flotabilidad de barcos']
  },
  {
    c: 'Grandes científicas que revolucionaron la historia de la ciencia',
    f: ['Marie Curie (radiactividad)', 'Rosalind Franklin (estructura del ADN)', 'Ada Lovelace (computación)', 'Jane Goodall (primatología)'],
    m: ['Lise Meitner (fisión nuclear)', 'Barbara McClintock (transposones)', 'Chien-Shiung Wu (física de partículas)'],
    d: ['Jocelyn Bell Burnell (descubrimiento de púlsares)', 'Emmy Noether (teorema de simetrías)', 'Rachel Carson (ecología moderna)'],
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