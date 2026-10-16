export default Array.from({ length: 20 }, (_, idx) => {
  const plantillas = [
    {
      c: 'Planetas del Sistema Solar (reconocidos por la UAI)',
      f: ['Marte', 'Júpiter', 'Saturno', 'Venus'],
      m: ['Mercurio', 'Urano', 'Neptuno'],
      d: ['Tierra', 'Júpiter (mayor masa)', 'Mercurio (menor tamaño)'],
      t: ['Plutón', 'Ceres', 'Eris', 'Luna', 'Europa']
    },
    {
      c: 'Elementos químicos de la Tabla Periódica pertenecientes a los Gases Nobles',
      f: ['Helio', 'Neón', 'Argón', 'Kriptón'],
      m: ['Xenón', 'Radón', 'Oganesón'],
      d: ['Helio (He)', 'Neón (Ne)', 'Argón (Ar)'],
      t: ['Oxígeno', 'Nitrógeno', 'Hidrógeno', 'Cloro', 'Flúor']
    },
    {
      c: 'Científicos galardonados con el Premio Nobel de Física',
      f: ['Albert Einstein', 'Marie Curie', 'Niels Bohr', 'Wilhelm Röntgen'],
      m: ['Max Planck', 'Richard Feynman', 'Erwin Schrödinger'],
      d: ['Werner Heisenberg', 'Peter Higgs', 'Paul Dirac'],
      t: ['Stephen Hawking (nunca lo ganó)', 'Isaac Newton', 'Galileo Galilei', 'Nikola Tesla', 'Thomas Edison']
    },
    {
      c: 'Huesos que forman parte del esqueleto humano',
      f: ['Fémur', 'Húmero', 'Cráneo', 'Costilla'],
      m: ['Tibia', 'Peroné', 'Rótula'],
      d: ['Estribo', 'Clavícula', 'Omóplato (Escápula)'],
      t: ['Tendón de Aquiles', 'Menisco', 'Cartílago', 'Médula espinal', 'Bíceps']
    },
    {
      c: 'Mamíferos marinos que habitan los océanos',
      f: ['Delfín común', 'Ballena azul', 'Orca', 'Foca'],
      m: ['León marino', 'Morsa', 'Beluga'],
      d: ['Narval', 'Manatí', 'Cachalote'],
      t: ['Tiburón blanco', 'Pez espada', 'Manta raya', 'Pulpo gigante', 'Barracuda']
    },
    {
      c: 'Órganos vitales principales del cuerpo humano',
      f: ['Corazón', 'Cerebro', 'Pulmones', 'Hígado'],
      m: ['Riñón', 'Páncreas', 'Estómago'],
      d: ['Bazo', 'Intestino delgado', 'Vejiga'],
      t: ['Fémur', 'Tráquea', 'Laringe', 'Faringe', 'Glándula tiroides']
    },
    {
      c: 'Elementos químicos metálicos',
      f: ['Hierro', 'Oro', 'Plata', 'Cobre'],
      m: ['Aluminio', 'Plomo', 'Titanio'],
      d: ['Mercurio (líquido)', 'Platino', 'Wolframio'],
      t: ['Carbono', 'Azufre', 'Fósforo', 'Helio', 'Oxígeno']
    },
    {
      c: 'Dinosaurios fósiles del periodo Cretácico o Jurásico',
      f: ['Tyrannosaurus Rex', 'Velociraptor', 'Triceratops', 'Brachiosaurus'],
      m: ['Stegosaurus', 'Spinosaurus', 'Ankylosaurus'],
      d: ['Pteranodon (pterosaurio)', 'Allosaurus', 'Diplodocus'],
      t: ['Mamut lanudo', 'Tigre dientes de sable', 'Megalodón', 'Dodo', 'Plesiosaurio']
    },
    {
      c: 'Enfermedades infecciosas causadas por virus',
      f: ['Gripe', 'COVID-19', 'Sarampión', 'Varicela'],
      m: ['VIH/SIDA', 'Hepatitis B', 'Rabia'],
      d: ['Ébola', 'Fiebre amarilla', 'Polio'],
      t: ['Tuberculosis', 'Cólera', 'Tétanos', 'Salmonelosis', 'Malaria']
    },
    {
      c: 'Constelaciones astronómicas visibles en el cielo',
      f: ['Orión', 'Osa Mayor', 'Tauro', 'Escorpio'],
      m: ['Osa Menor', 'Casiopea', 'Centauro'],
      d: ['Pegaso', 'Andrómeda', 'Cruz del Sur'],
      t: ['Vía Láctea', 'Agujero negro', 'Estrella Polar', 'Cometa Halley', 'Sol']
    },
    {
      c: 'Aves que no pueden volar',
      f: ['Pingüino emperador', 'Avestruz', 'Kiwi', 'Emú'],
      m: ['Ñandú', 'Casuario', 'Kakapo'],
      d: ['Calamón takahe', 'Pingüino de Magallanes', 'Wea'],
      t: ['Pavo real', 'Pelícano', 'Flamenco', 'Gaviota', 'Cigüeña']
    },
    {
      c: 'Capas de la atmósfera terrestre',
      f: ['Troposfera', 'Estratosfera', 'Mesosfera', 'Termosfera'],
      m: ['Exosfera', 'Ionosfera', 'Capa de ozono (estratosfera)'],
      d: ['Magnetosfera', 'Tropopausa', 'Estratopausa'],
      t: ['Litosfera', 'Hidrosfera', 'Corteza', 'Manto', 'Núcleo']
    },
    {
      c: 'Grupos sanguíneos del sistema ABO y factor Rh',
      f: ['A positivo (A+)', 'O positivo (O+)', 'B positivo (B+)', 'AB positivo (AB+)'],
      m: ['A negativo (A-)', 'O negativo (O-)', 'B negativo (B-)'],
      d: ['AB negativo (AB-)', 'O negativo (donante universal)', 'AB positivo (receptor universal)'],
      t: ['C positivo (C+)', 'D positivo (D+)', 'E positivo (E+)', 'F negativo (F-)', 'Zero positivo']
    },
    {
      c: 'Instrumentos de medición científica',
      f: ['Termómetro', 'Barómetro', 'Báscula', 'Telescopio'],
      m: ['Microscopio', 'Higrómetro', 'Cronómetro'],
      d: ['Anemómetro', 'Espectrómetro', 'Sismógrafo'],
      t: ['Bisturí', 'Tubo de ensayo', 'Matraz', 'Pipeta', 'Placa de Petri']
    },
    {
      c: 'Seres vivos pertenecientes al reino Fungi (Hongos)',
      f: ['Champiñón común', 'Moho del pan', 'Levadura de cerveza', 'Seta boletus'],
      m: ['Trufa negra', 'Amanita muscaria', 'Penicillium'],
      d: ['Níscalo', 'Chanterelle', 'Hongo shiitake'],
      t: ['Alga espirulina', 'Musgo', 'Helecho', 'Líquenes', 'Amoeba']
    },
    {
      c: 'Fenómenos meteorológicos atmosféricos',
      f: ['Huracán / Ciclón', 'Tornado', 'Arcoíris', 'Granizo'],
      m: ['Aurora boreal', 'Niebla', 'Rayo / Relámpago'],
      d: ['Manga marina', 'Helada negra', 'Ventisca'],
      t: ['Terremoto (sismo)', 'Tsunami', 'Erupción volcánica', 'Marea roja', 'Eclipse solar']
    },
    {
      c: 'Gases presentes de forma natural en el aire de la Tierra',
      f: ['Nitrógeno', 'Oxígeno', 'Dióxido de carbono', 'Argón'],
      m: ['Vapor de agua', 'Metano', 'Ozono'],
      d: ['Neón', 'Kriptón', 'Monóxido de carbono (trazas)'],
      t: ['Cloro puro', 'Cianuro de hidrógeno', 'Amoníaco puro', 'Mercurio gaseoso', 'Plutonio']
    },
    {
      c: 'Fases del ciclo lunar',
      f: ['Luna nueva', 'Luna llena', 'Cuarto creciente', 'Cuarto menguante'],
      m: ['Gibosa creciente', 'Gibosa menguante', 'Luna creciente cóncava'],
      d: ['Superluna (fenómeno)', 'Novilunio', 'Plenilunio'],
      t: ['Eclipse solar', 'Solsticio de verano', 'Equinoccio de otoño', 'Luna roja', 'Marea viva']
    },
    {
      c: 'Unidades de medida del Sistema Internacional (SI) fundamentales',
      f: ['Metro (longitud)', 'Kilogramo (masa)', 'Segundo (tiempo)', 'Amperio (corriente)'],
      m: ['Kelvin (temperatura)', 'Mol (cantidad de sustancia)', 'Candela (intensidad luminosa)'],
      d: ['Segundo (s)', 'Metro (m)', 'Kilogramo (kg)'],
      t: ['Litro', 'Gramo', 'Grado Celsius', 'Voltio', 'Newton']
    },
    {
      c: 'Animales carnívoros depredadores de la sabana o selva',
      f: ['León africano', 'Tigre de Bengala', 'Leopardo', 'Guepardo'],
      m: ['Hiena manchada', 'Jaguar', 'Licaón (perro salvaje)'],
      d: ['Cocodrilo del Nilo', 'Caracal', 'Serval'],
      t: ['Cebra', 'Jirafa', 'Rinoceronte blanco', 'Hipopótamo', 'Gacela']
    }
  ];

  const p = plantillas[idx];
  return {
    id: `ciencia_${idx + 1}`,
    consigna: p.c,
    correctos: { faciles: p.f, medios: p.m, dificiles: p.d },
    trampas: p.t
  };
});