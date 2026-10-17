export default Array.from({ length: 20 }, (_, idx) => {
  const plantillas = [
    {
      c: 'Emperadores del Imperio Romano',
      f: ['Julio César (dictador)', 'Augusto', 'Nerón', 'Calígula'],
      m: ['Marco Aurelio', 'Trajano', 'Tiberio'],
      d: ['Adriano', 'Claudio', 'Cómodo'],
      t: ['Alejandro Magno', 'Espartaco', 'Cicerón', 'Aníbal Barca', 'Cleopatra']
    },
    {
      c: 'Países del bando de los Aliados en la Segunda Guerra Mundial',
      f: ['Estados Unidos', 'Reino Unido', 'Unión Soviética', 'Francia'],
      m: ['Canadá', 'Australia', 'Polonia'],
      d: ['China', 'Brasil', 'Noruega'],
      t: ['Alemania', 'Japón', 'Italia', 'España', 'Rumanía']
    },
    {
      c: 'Monarcas pertenecientes a la dinastía de los Reyes de España',
      f: ['Felipe II', 'Carlos I (V de Alemania)', 'Isabel I de Castilla', 'Fernando VII'],
      m: ['Felipe VI', 'Juan Carlos I', 'Alfonso XIII'],
      d: ['Carlos III', 'Felipe V', 'Carlos II (El Hechizado)'],
      t: ['Napoleón Bonaparte', 'Enrique VIII', 'Luis XIV', 'Victoria I', 'Guillermo el Conquistador']
    },
    {
      c: 'Presidentes de los Estados Unidos de América',
      f: ['George Washington', 'Abraham Lincoln', 'Barack Obama', 'John F. Kennedy'],
      m: ['Franklin D. Roosevelt', 'Thomas Jefferson', 'Theodore Roosevelt'],
      d: ['Harry S. Truman', 'Dwight D. Eisenhower', 'Woodrow Wilson'],
      t: ['Benjamin Franklin', 'Alexander Hamilton', 'Winston Churchill', 'Martin Luther King', 'John Adams (padre)']
    },
    {
      c: 'Dioses principales de la mitología griega',
      f: ['Zeus', 'Poseidón', 'Hades', 'Atenea'],
      m: ['Apolo', 'Ares', 'Afrodita'],
      d: ['Hermes', 'Dioniso', 'Hefesto'],
      t: ['Odín', 'Thor', 'Júpiter (romano)', 'Anubis', 'Ra']
    },
    {
      c: 'Figuras históricas de la Revolución Francesa (1789)',
      f: ['Maximilien Robespierre', 'Luis XVI', 'María Antonieta', 'Jean-Paul Marat'],
      m: ['Georges Danton', 'Marqués de La Fayette', 'Napoleón Bonaparte'],
      d: ['Louis de Saint-Just', 'Jacques Necker', 'Camille Desmoulins'],
      t: ['Voltaire', 'Jean-Jacques Rousseau', 'Guillermo Tell', 'Otto von Bismarck', 'Oliver Cromwell']
    },
    {
      c: 'Grandes pintores del Renacimiento italiano',
      f: ['Leonardo da Vinci', 'Miguel Ángel', 'Rafael Sanzio', 'Sandro Botticelli'],
      m: ['Tiziano', 'Donatello', 'Fra Angelico'],
      d: ['Tintoretto', 'Caravaggio (Barroco)', 'Piero della Francesca'],
      t: ['Pablo Picasso', 'Salvador Dalí', 'Diego Velázquez', 'Vincent van Gogh', 'Claude Monet']
    },
    {
      c: 'Batallas históricas famosas',
      f: ['Waterloo', 'Stalingrado', 'Termópilas', 'Normandía (Día D)'],
      m: ['Trafalgar', 'Gettysburg', 'Lepanto'],
      d: ['Midway', 'Austerlitz', 'Cannas'],
      t: ['Península de Crimea', 'Guerra Fría', 'Crisis de los Misiles', 'Tratado de Versalles', 'Caída de Constantinopla']
    },
    {
      c: 'Filósofos de la Antigua Grecia',
      f: ['Sócrates', 'Platón', 'Aristóteles', 'Pitágoras'],
      m: ['Epicuro', 'Heráclito', 'Diógenes de Sínope'],
      d: ['Tales de Mileto', 'Zenón de Citio', 'Parménides'],
      t: ['Séneca (romano)', 'Marco Aurelio', 'Cicerón', 'Confucio', 'Descartes']
    },
    {
      c: 'Civilizaciones de la América precolombina',
      f: ['Imperio Inca', 'Imperio Azteca', 'Civilización Maya', 'Toltecas'],
      m: ['Olmecas', 'Zapotecas', 'Chibchas (Muiscas)'],
      d: ['Cultura Nazca', 'Cultura Chimú', 'Tiahuanaco'],
      t: ['Gauchos', 'Sioux', 'Apaches', 'Cherokees', 'Comanches']
    },
    {
      c: 'Premios Nobel de la Paz reconocidos',
      f: ['Nelson Mandela', 'Martin Luther King Jr.', 'Madre Teresa de Calcuta', 'Barack Obama'],
      m: ['Malala Yousafzai', 'Dalai Lama', 'Kofi Annan'],
      d: ['Desmond Tutu', 'Rigoberta Menchú', 'Mijaíl Gorbachov'],
      t: ['Mahatma Gandhi (nunca lo ganó)', 'Albert Einstein', 'Winston Churchill', 'Abraham Lincoln', 'Eleanor Roosevelt']
    },
    {
      c: 'Faraones célebres del Antiguo Egipto',
      f: ['Tutankamón', 'Cleopatra VII', 'Ramsés II', 'Keops'],
      m: ['Nefertiti', 'Akenatón', 'Hatshepsut'],
      d: ['Tutmosis III', 'Seti I', 'Zoser'],
      t: ['Anubis', 'Ra', 'Osiris', 'Imhotep (arquitecto)', 'Horus']
    },
    {
      c: 'Países del bando del Eje en la Segunda Guerra Mundial',
      f: ['Alemania nazi', 'Imperio del Japón', 'Reino de Italia', 'Hungría'],
      m: ['Rumanía', 'Bulgaria', 'Finlandia (cobeligerante)'],
      d: ['Tailandia', 'Estado Independiente de Croacia', 'Eslovaquia'],
      t: ['España', 'Turquía', 'Suecia', 'Suiza', 'Portugal']
    },
    {
      c: 'Conquistadores y exploradores españoles de la Era de los Descubrimientos',
      f: ['Cristóbal Colón', 'Hernán Cortés', 'Francisco Pizarro', 'Juan Sebastián Elcano'],
      m: ['Fernando de Magallanes', 'Vasco Núñez de Balboa', 'Pedro de Valdivia'],
      d: ['Francisco de Orellana', 'Álvar Núñez Cabeza de Vaca', 'Juan Ponce de León'],
      t: ['Marco Polo', 'Vasco da Gama', 'James Cook', 'Américo Vespucio', 'Francis Drake']
    },
    {
      c: 'Guerras del siglo XX',
      f: ['Primera Guerra Mundial', 'Segunda Guerra Mundial', 'Guerra de Vietnam', 'Guerra de Corea'],
      m: ['Guerra Civil Española', 'Guerra del Golfo', 'Guerra de los Balcanes'],
      d: ['Guerra de los Seis Días', 'Guerra de las Malvinas', 'Guerra de Yom Kipur'],
      t: ['Guerra de Secesión', 'Guerra Franco-Prusiana', 'Guerras Napoleónicas', 'Guerra de los Cien Años', 'Guerra de Crimea']
    },
    {
      c: 'Monumentos y sitios declarados Patrimonio de la Humanidad en España',
      f: ['La Alhambra de Granada', 'La Sagrada Familia', 'El Acueducto de Segovia', 'La Mezquita de Córdoba'],
      m: ['Catedral de Santiago de Compostela', 'Monasterio de El Escorial', 'Muralla de Ávila'],
      d: ['Cueva de Altamira', 'Monasterio de Poblet', 'Torre de Hércules'],
      t: ['Coliseo de Roma', 'Torre Eiffel', 'Torre de Pisa', 'Big Ben', 'Partenón de Atenas']
    },
    {
      c: 'Esculturas y obras maestras de Miguel Ángel',
      f: ['David', 'La Piedad', 'Moisés', 'Bóveda de la Capilla Sixtina'],
      m: ['El Juicio Final', 'Tondo Doni', 'Esclavo moribundo'],
      d: ['Baco', 'Piedad Rondanini', 'Tumba de Julio II'],
      t: ['La Gioconda (Mona Lisa)', 'El hombre de Vitruvio', 'La Última Cena', 'Venus de Milo', 'Victoria alada de Samotracia']
    },
    {
      c: 'Reinas y monarcas británicas en la historia',
      f: ['Isabel II', 'Victoria I', 'Isabel I', 'María I (Bloody Mary)'],
      m: ['Ana de Gran Bretaña', 'María II', 'Lady Jane Grey'],
      d: ['Leonor de Aquitania', 'Catalina de Aragón', 'Ana Bolena'],
      t: ['María Antonieta', 'Catalina la Grande', 'Cleopatra', 'Juana la Loca', 'Diana de Gales']
    },
    {
      c: 'Tratados de paz históricos internacionales',
      f: ['Tratado de Versalles', 'Tratado de Tordesillas', 'Paz de Westfalia', 'Tratado de Utrecht'],
      m: ['Paz de Augsburgo', 'Tratado de Roma', 'Tratado de Maastricht'],
      d: ['Tratado de Fontainebleau', 'Tratado de San Germán', 'Paz de Basilea'],
      t: ['Plan Marshall', 'Conferencia de Yalta', 'Juicios de Núremberg', 'Pacto de Varsovia', 'Doctrina Monroe']
    },
    {
      c: 'Pinturas de la Colección del Museo del Prado (Madrid)',
      f: ['Las Meninas (Velázquez)', 'El jardín de las delicias (El Bosco)', 'Los fusilamientos del 3 de mayo (Goya)', 'Las tres Gracias (Rubens)'],
      m: ['El caballero de la mano en el pecho (El Greco)', 'Saturno devorando a su hijo (Goya)', 'La maja desnuda (Goya)'],
      d: ['La fragua de Vulcano (Velázquez)', 'El triunfo de Baco (Velázquez)', 'El descendimiento (Van der Weyden)'],
      t: ['Guernica (Picasso)', 'La persistencia de la memoria (Dalí)', 'La Gioconda (Louvre)', 'La noche estrellada (Van Gogh)', 'El grito (Munch)']
    }
  ];

  const p = plantillas[idx];
  return {
    id: `historia_${idx + 1}`,
    consigna: p.c,
    correctos: { faciles: p.f, medios: p.m, dificiles: p.d },
    trampas: p.t
  };
});