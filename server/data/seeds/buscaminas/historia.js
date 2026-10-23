// server/data/seeds/buscaminas/historia.js

const plantillas = [
  // 1 - 10: Roma, Grecia y Mundo Antiguo
  {
    c: 'Emperadores que gobernaron el Imperio Romano',
    f: ['Augusto', 'Nerón', 'Calígula', 'Marco Aurelio'],
    m: ['Trajano', 'Tiberio', 'Adriano'],
    d: ['Claudio', 'Cómodo', 'Septimio Severo'],
    t: ['Alejandro Magno', 'Espartaco', 'Cicerón', 'Aníbal Barca', 'Cleopatra VII']
  },
  {
    c: 'Filósofos destacados de la Antigua Grecia',
    f: ['Sócrates', 'Platón', 'Aristóteles', 'Pitágoras'],
    m: ['Epicuro', 'Heráclito', 'Diógenes de Sínope'],
    d: ['Tales de Mileto', 'Zenón de Citio', 'Parménides'],
    t: ['Séneca', 'Marco Aurelio', 'Cicerón', 'Confucio', 'René Descartes']
  },
  {
    c: 'Dioses principales del panteón olímpico en la mitología griega',
    f: ['Zeus', 'Poseidón', 'Hades', 'Atenea'],
    m: ['Apolo', 'Ares', 'Afrodita'],
    d: ['Hermes', 'Dioniso', 'Hefesto'],
    t: ['Odín', 'Thor', 'Júpiter', 'Anubis', 'Ra']
  },
  {
    c: 'Faraones y gobernantes del Antiguo Egipto',
    f: ['Tutankamón', 'Cleopatra VII', 'Ramsés II', 'Keops'],
    m: ['Akenatón', 'Hatshepsut', 'Nefertiti'],
    d: ['Tutmosis III', 'Seti I', 'Zoser'],
    t: ['Anubis', 'Ra', 'Osiris', 'Imhotep', 'Horus']
  },
  {
    c: 'Monumentos que formaron parte de las Siete Maravillas del Mundo Antiguo',
    f: ['Gran Pirámide de Guiza', 'Jardines Colgantes de Babilonia', 'Estatua de Zeus en Olimpia', 'Coloso de Rodas'],
    m: ['Faro de Alejandría', 'Templo de Artemisa en Éfeso', 'Mausoleo de Halicarnaso'],
    d: ['Pirámide de Kefrén', 'Murallas de Babilonia', 'Faro de Ostia'],
    t: ['Coliseo de Roma', 'Gran Muralla China', 'Taj Mahal', 'Partenón de Atenas', 'Torre de Babel']
  },
  {
    c: 'Batallas y asedios célebres de la Antigüedad clásica',
    f: ['Batalla de las Termópilas', 'Batalla de Maratón', 'Batalla de Cannas', 'Batalla de Zama'],
    m: ['Batalla de Gaugamela', 'Batalla de Salamina', 'Batalla de Accio'],
    d: ['Asedio de Alesia', 'Batalla de Farsalia', 'Batalla de Queronea'],
    t: ['Batalla de Waterloo', 'Batalla de Hastings', 'Batalla de Stalingrado', 'Batalla de Poitiers', 'Batalla de Lepanto']
  },
  {
    c: 'Reyes y gobernantes del Imperio Persa Aqueménida',
    f: ['Ciro II el Grande', 'Darío I el Grande', 'Jerjes I', 'Artajerjes I'],
    m: ['Cambises II', 'Darío III', 'Bardiya'],
    d: ['Artajerjes II', 'Ciro el Joven', 'Histaspes'],
    t: ['Nabucodonosor II', 'Hammurabi', 'Asurbanipal', 'Saladino', 'Gengis Kan']
  },
  {
    c: 'Generales y estrategas militares de la Antigüedad clásica',
    f: ['Alejandro Magno', 'Julio César', 'Aníbal Barca', 'Escipión el Africano'],
    m: ['Pirro de Epiro', 'Leónidas I de Esparta', 'Epaminondas'],
    d: ['Milcíades', 'Temístocles', 'Filipo II de Macedonia'],
    t: ['Napoleón Bonaparte', 'Carlomagno', 'Saladino', 'Oliver Cromwell', 'Simón Bolívar']
  },
  {
    c: 'Instituciones y magistraturas políticas de la República Romana',
    f: ['Senado Romano', 'Cónsul', 'Tribuno de la plebe', 'Pretor'],
    m: ['Censor', 'Edil curul', 'Dictador romano'],
    d: ['Cuestor', 'Comicios centuriados', 'Pontifex Maximus'],
    t: ['Cortes Generales', 'Parlamento de Westminster', 'Dux de Venecia', 'Canciller del Reich', 'Inquisición']
  },
  {
    c: 'Pueblos y civilizaciones prerromanas que habitaron la península ibérica',
    f: ['Íberos', 'Celtas', 'Tartessos', 'Celtíberos'],
    m: ['Lusitanos', 'Cántabros', 'Astures'],
    d: ['Turdetanos', 'Vacceos', 'Vetones'],
    t: ['Visigodos', 'Vándalos', 'Alanos', 'Suevos', 'Francos']
  },

  // 11 - 20: Edad Media, Reinos y Cruzadas
  {
    c: 'Monarcas francos de las dinastías Merovingia o Carolingia',
    f: ['Carlomagno', 'Clodoveo I', 'Carlos Martel', 'Pipino el Breve'],
    m: ['Ludovico Pío', 'Carlos el Calvo', 'Lotario I'],
    d: ['Dagoberto I', 'Clotario I', 'Childeberto I'],
    t: ['Guillermo el Conquistador', 'Felipe II de Francia', 'Luis IX (San Luis)', 'Enrique IV de Francia', 'Luis XIV']
  },
  {
    c: 'Reyes medievales de Inglaterra pertenecientes a las casas de Normandía o Plantagenet',
    f: ['Guillermo el Conquistador', 'Ricardo Corazón de León', 'Juan sin Tierra', 'Enrique II'],
    m: ['Eduardo I', 'Eduardo III', 'Enrique III'],
    d: ['Enrique V', 'Ricardo II', 'Esteban de Blois'],
    t: ['Enrique VIII', 'Isabel I de Inglaterra', 'Carlos I de Inglaterra', 'Reina Victoria I', 'Jorge III']
  },
  {
    c: 'Líderes militares y religiosos vinculados a las Cruzadas medievales',
    f: ['Ricardo Corazón de León', 'Saladino', 'Godofredo de Bouillón', 'Papa Urbano II'],
    m: ['Federico I Barbarroja', 'Felipe II Augusto de Francia', 'Balduino IV de Jerusalén'],
    d: ['Bohemundo de Tarento', 'Raimundo IV de Tolosa', 'Reinaldo de Châtillon'],
    t: ['Juana de Arco', 'Carlomagno', 'Napoleón Bonaparte', 'Hernán Cortés', 'Guillermo Tell']
  },
  {
    c: 'Líderes, janes y estrategas del Imperio Mongol',
    f: ['Gengis Kan', 'Kublai Kan', 'Tamerlán', 'Subutai'],
    m: ['Ogodei Kan', 'Batu Kan', 'Hulagu Kan'],
    d: ['Jochi', 'Chagatai Kan', 'Möngke Kan'],
    t: ['Atila el Huno', 'Mao Zedong', 'Sun Tzu', 'Emperador Meiji', 'Tokugawa Ieyasu']
  },
  {
    c: 'Grandes batallas campales y asedios de la Edad Media',
    f: ['Batalla de Hastings', 'Batalla de las Navas de Tolosa', 'Batalla de Poitiers (732)', 'Batalla de Agincourt'],
    m: ['Batalla de Hattin', 'Batalla de Crécy', 'Batalla de Kulikovo'],
    d: ['Batalla de Bouvines', 'Batalla de Bannockburn', 'Batalla de Yarmuk'],
    t: ['Batalla de Waterloo', 'Batalla de Lepanto', 'Batalla de Trafalgar', 'Batalla de Stalingrado', 'Batalla de Austerlitz']
  },
  {
    c: 'Órdenes militares religiosas creadas durante la Edad Media',
    f: ['Caballeros Templarios', 'Caballeros Hospitalarios (Orden de Malta)', 'Orden Teutónica', 'Orden de Santiago'],
    m: ['Orden de Calatrava', 'Orden de Alcántara', 'Orden de Montesa'],
    d: ['Hermanos Livonios de la Espada', 'Orden de San Lázaro', 'Orden de Avis'],
    t: ['Compañía de Jesús (Jesuitas)', 'Francmasonería', 'Orden Rosacruz', 'Opus Dei', 'Legión Extranjera Francesa']
  },
  {
    c: 'Dinastías y califatos musulmanes que gobernaron en al-Ándalus o el Magreb',
    f: ['Omeyas', 'Abasíes', 'Almorávides', 'Almohades'],
    m: ['Nazaríes', 'Fatimíes', 'Benimerines'],
    d: ['Aftasíes', 'Abadíes', 'Hammadíes'],
    t: ['Imperio Otomano', 'Safávidas', 'Imperio Mogol', 'Mamelucos de Egipto', 'Sasánidas']
  },
  {
    c: 'Pueblos germánicos y tribus que penetraron en las fronteras del Imperio Romano',
    f: ['Visigodos', 'Vándalos', 'Ostrogodos', 'Francos'],
    m: ['Suevos', 'Alanos', 'Burgundios'],
    d: ['Lombardos', 'Anglos', 'Sajones'],
    t: ['Hunos', 'Mongoles', 'Vikingos', 'Sarracenos', 'Turcos selyúcidas']
  },
  {
    c: 'Líderes, guerreros y exploradores de la Era Vikinga',
    f: ['Ragnar Lodbrok', 'Erik el Rojo', 'Leif Erikson', 'Ivar el Deshuesado'],
    m: ['Harald Hardrada', 'Björn Ironside', 'Rollo de Normandía'],
    d: ['Canuto el Grande', 'Harald Cabellera Hermosa', 'Olaf Tryggvason'],
    t: ['Guillermo el Conquistador', 'Atila el Huno', 'Carlomagno', 'Boudica', 'Vercingétorix']
  },
  {
    c: 'Reinos y entidades cristianas de la península ibérica medieval',
    f: ['Reino de Castilla', 'Reino de Aragón', 'Reino de Navarra', 'Reino de León'],
    m: ['Reino de Portugal', 'Reino de Asturias', 'Condado de Barcelona'],
    d: ['Reino de Galicia', 'Reino de Mallorca', 'Reino de Valencia'],
    t: ['Reino Nazarí de Granada', 'Califato de Córdoba', 'Taifa de Zaragoza', 'Reino de Nápoles', 'Corona de Francia']
  },

  // 21 - 30: América Precolombina y Era de los Descubrimientos
  {
    c: 'Civilizaciones y culturas precolombinas del continente americano',
    f: ['Imperio Inca', 'Imperio Azteca (Mexica)', 'Civilización Maya', 'Cultura Tolteca'],
    m: ['Cultura Olmeca', 'Cultura Zapoteca', 'Confederación Muisca'],
    d: ['Cultura Nazca', 'Cultura Chimú', 'Cultura Tiahuanaco'],
    t: ['Sioux', 'Apaches', 'Comanches', 'Cherokees', 'Gauchos']
  },
  {
    c: 'Huey Tlatoanis o gobernantes supremos de México-Tenochtitlan',
    f: ['Moctezuma II', 'Cuauhtémoc', 'Moctezuma I', 'Cuitláhuac'],
    m: ['Itzcóatl', 'Axayácatl', 'Ahuitzotl'],
    d: ['Acamapichtli', 'Huitzilíhuitl', 'Chimalpopoca'],
    t: ['Atahualpa', 'Huáscar', 'Pachacútec', 'Túpac Amaru', 'Lautaro']
  },
  {
    c: 'Sapas Incas o soberanos del Imperio Inca (Tahuantinsuyo)',
    f: ['Atahualpa', 'Pachacútec', 'Huáscar', 'Manco Cápac'],
    m: ['Huayna Cápac', 'Túpac Yupanqui', 'Manco Inca'],
    d: ['Túpac Amaru I', 'Sinchi Roca', 'Mayta Cápac'],
    t: ['Moctezuma II', 'Cuauhtémoc', 'Nezahualcóyotl', 'Tecún Umán', 'Lautaro']
  },
  {
    c: 'Navegantes y exploradores de la Era de los Descubrimientos (siglos XV y XVI)',
    f: ['Cristóbal Colón', 'Juan Sebastián Elcano', 'Fernando de Magallanes', 'Vasco da Gama'],
    m: ['Américo Vespucio', 'Vasco Núñez de Balboa', 'Bartolomé Díaz'],
    d: ['Pedro Álvares Cabral', 'Juan Ponce de León', 'Francisco de Orellana'],
    t: ['James Cook', 'Marco Polo', 'David Livingstone', 'Roald Amundsen', 'Charles Darwin']
  },
  {
    c: 'Conquistadores y adelantados españoles en territorio americano (siglo XVI)',
    f: ['Hernán Cortés', 'Francisco Pizarro', 'Diego de Almagro', 'Pedro de Valdivia'],
    m: ['Álvar Núñez Cabeza de Vaca', 'Hernando de Soto', 'Francisco Vázquez de Coronado'],
    d: ['Gonzalo Jiménez de Quesada', 'Alonso de Ojeda', 'Pedro de Alvarado'],
    t: ['Cristóbal Colón', 'Fernando el Católico', 'Carlos I de España', 'Felipe II', 'Bartolomé de las Casas']
  },
  {
    c: 'Ciudades y asentamientos arqueológicos de la civilización Maya',
    f: ['Chichén Itzá', 'Tikal', 'Palenque', 'Tulum'],
    m: ['Copán', 'Calakmul', 'Uxmal'],
    d: ['Yaxchilán', 'Bonampak', 'Coba'],
    t: ['Tenochtitlan', 'Teotihuacán', 'Machu Picchu', 'Cuzco', 'Monte Albán']
  },
  {
    c: 'Tratados, bulas y acuerdos marítimo-territoriales de los siglos XV y XVI',
    f: ['Tratado de Tordesillas', 'Capitulaciones de Santa Fe', 'Bula Inter Caetera', 'Tratado de Zaragoza'],
    m: ['Tratado de Alcáçovas', 'Capitulación de Toledo', 'Leyes de Burgos'],
    d: ['Leyes Nuevas de Indias', 'Ordenanzas de Alfaro', 'Capitulación de Valladolid'],
    t: ['Tratado de Versalles', 'Paz de Westfalia', 'Pacto de Varsovia', 'Tratado de Utrecht', 'Conferencia de Yalta']
  },
  {
    c: 'Cultivos y plantas de origen americano introducidos en Europa tras 1492',
    f: ['Patata (papa)', 'Tomate', 'Maíz', 'Cacao'],
    m: ['Tabaco', 'Pimiento / Chile', 'Calabaza americana'],
    d: ['Vainilla', 'Mandioca (yuca)', 'Cacahuete (maní)'],
    t: ['Trigo', 'Arroz', 'Caña de azúcar', 'Café', 'Vid vinífera']
  },
  {
    c: 'Grandes divisiones virreinales del Imperio Español en América',
    f: ['Virreinato de Nueva España', 'Virreinato del Perú', 'Virreinato del Río de la Plata', 'Virreinato de Nueva Granada'],
    m: ['Capitanía General de Guatemala', 'Capitanía General de Venezuela', 'Capitanía General de Chile'],
    d: ['Capitanía General de Cuba', 'Capitanía General de Puerto Rico', 'Real Audiencia de Charcas'],
    t: ['Virreinato de Brasil', 'Trece Colonias', 'Luisiana francesa', 'Nueva Francia', 'Nueva Ámsterdam']
  },
  {
    c: 'Centros urbanos, fortalezas y yacimientos del Imperio Inca',
    f: ['Machu Picchu', 'Cuzco', 'Sacsayhuamán', 'Ollantaytambo'],
    m: ['Písac', 'Choquequirao', 'Coricancha'],
    d: ['Moray', 'Tambomachay', 'Vilcashuamán'],
    t: ['Teotihuacán', 'Chichén Itzá', 'Palenque', 'Tikal', 'Monte Albán']
  },

  // 31 - 40: Renacimiento, Monarquías y Siglo de Oro
  {
    c: 'Monarcas de la dinastía Tudor que reinaron en Inglaterra',
    f: ['Enrique VIII', 'Isabel I', 'María I Tudor', 'Enrique VII'],
    m: ['Eduardo VI', 'Lady Jane Grey', 'Margarita Tudor'],
    d: ['Arturo Tudor', 'Catalina Tudor', 'María Tudor (reina de Francia)'],
    t: ['Jacobo I', 'Carlos I de Inglaterra', 'Guillermo el Conquistador', 'Reina Victoria I', 'Jorge III']
  },
  {
    c: 'Monarcas de la Casa de Austria (Habsburgo) que reinaron en España',
    f: ['Carlos I (V del Sacro Imperio)', 'Felipe II', 'Felipe III', 'Felipe IV'],
    m: ['Carlos II', 'Felipe I el Hermoso', 'Juana I de Castilla'],
    d: ['Don Juan de Austria', 'Mariana de Austria', 'Margarita de Austria'],
    t: ['Felipe V', 'Carlos III', 'Fernando VII', 'Amadeo I de Saboya', 'Alfonso XII']
  },
  {
    c: 'Artistas, escultores y pintores universales del Renacimiento italiano',
    f: ['Leonardo da Vinci', 'Miguel Ángel Buonarroti', 'Rafael Sanzio', 'Sandro Botticelli'],
    m: ['Tiziano', 'Donatello', 'Fra Angelico'],
    d: ['Piero della Francesca', 'Andrea Mantegna', 'Tintoretto'],
    t: ['Pablo Picasso', 'Diego Velázquez', 'Salvador Dalí', 'Vincent van Gogh', 'Claude Monet']
  },
  {
    c: 'Pintores y escultores destacados del Siglo de Oro español',
    f: ['Diego Velázquez', 'El Greco', 'Bartolomé Esteban Murillo', 'Francisco de Zurbarán'],
    m: ['José de Ribera', 'Alonso Cano', 'Juan Martínez Montañés'],
    d: ['Pedro de Mena', 'Gregorio Fernández', 'Juan de Valdés Leal'],
    t: ['Francisco de Goya', 'Pablo Picasso', 'Salvador Dalí', 'Joan Miró', 'Joaquín Sorolla']
  },
  {
    c: 'Dramaturgos, poetas y escritores del Siglo de Oro español',
    f: ['Miguel de Cervantes', 'Lope de Vega', 'Francisco de Quevedo', 'Pedro Calderón de la Barca'],
    m: ['Luis de Góngora', 'Tirso de Molina', 'Garcilaso de la Vega'],
    d: ['Baltasar Gracián', 'Juan Ruiz de Alarcón', 'Fray Luis de León'],
    t: ['Federico García Lorca', 'Gustavo Adolfo Bécquer', 'Benito Pérez Galdós', 'Antonio Machado', 'Miguel de Unamuno']
  },
  {
    c: 'Científicos, matemáticos y astrónomos de la Revolución Científica (siglos XVI y XVII)',
    f: ['Galileo Galilei', 'Isaac Newton', 'Nicolás Copérnico', 'Johannes Kepler'],
    m: ['René Descartes', 'Francis Bacon', 'Robert Boyle'],
    d: ['Tycho Brahe', 'Christiaan Huygens', 'William Harvey'],
    t: ['Albert Einstein', 'Charles Darwin', 'Marie Curie', 'Thomas Edison', 'Stephen Hawking']
  },
  {
    c: 'Esposas legítimas del rey Enrique VIII de Inglaterra',
    f: ['Catalina de Aragón', 'Ana Bolena', 'Juana Seymour', 'Catalina Parr'],
    m: ['Ana de Cléveris', 'Catalina Howard', 'María Tudor'],
    d: ['Margarita de Navarra', 'María de Guisa', 'María de Módena'],
    t: ['María Estuardo', 'Isabel I de Inglaterra', 'María Antonieta', 'Leonor de Aquitania', 'Juana I de Castilla']
  },
  {
    c: 'Reyes de Francia pertenecientes a la dinastía de los Borbones',
    f: ['Luis XIV', 'Luis XVI', 'Luis XV', 'Enrique IV'],
    m: ['Luis XIII', 'Luis XVIII', 'Carlos X'],
    d: ['Felipe I de Orleans', 'Luis de Borbón (Gran Delfín)', 'Luis Felipe I'],
    t: ['Napoleón Bonaparte', 'Carlomagno', 'Felipe II Augusto', 'Francisco I', 'Carlos IX']
  },
  {
    c: 'Figuras históricas y reformadores de la Reforma Protestante (siglo XVI)',
    f: ['Martín Lutero', 'Juan Calvino', 'Enrique VIII', 'Ulrico Zuinglio'],
    m: ['Felipe Melanchthon', 'John Knox', 'Thomas Müntzer'],
    d: ['Erasmo de Róterdam', 'Jan Hus', 'William Tyndale'],
    t: ['Ignacio de Loyola', 'Santa Teresa de Jesús', 'Papa Paulo III', 'Tomás de Torquemada', 'Felipe II']
  },
  {
    c: 'Conflictos bélicos y tratados de paz europeos de los siglos XVI y XVII',
    f: ['Guerra de los Treinta Años', 'Paz de Westfalia', 'Batalla de Lepanto', 'Armada Invencible'],
    m: ['Guerra de los Ochenta Años', 'Paz de Augsburgo', 'Tratado de los Pirineos'],
    d: ['Paz de Cateau-Cambrésis', 'Guerra de las Comunidades de Castilla', 'Edicto de Nantes'],
    t: ['Guerra de los Cien Años', 'Tratado de Versalles', 'Batalla de Waterloo', 'Guerra de Secesión', 'Batalla de Trafalgar']
  },

  // 41 - 50: Revoluciones, Ilustración y Era Napoleónica
  {
    c: 'Filósofos pensadores del movimiento de la Ilustración (siglo XVIII)',
    f: ['Voltaire', 'Jean-Jacques Rousseau', 'Montesquieu', 'Denis Diderot'],
    m: ['John Locke', 'David Hume', 'Immanuel Kant'],
    d: ['Jean le Rond d\'Alembert', 'Marqués de Condorcet', 'Barón de Holbach'],
    t: ['Karl Marx', 'Friedrich Nietzsche', 'Santo Tomás de Aquino', 'Platón', 'Nicolás Maquiavelo']
  },
  {
    c: 'Figuras clave catalogadas como Padres Fundadores de los Estados Unidos',
    f: ['George Washington', 'Thomas Jefferson', 'Benjamin Franklin', 'John Adams'],
    m: ['Alexander Hamilton', 'James Madison', 'John Jay'],
    d: ['Thomas Paine', 'Samuel Adams', 'Patrick Henry'],
    t: ['Abraham Lincoln', 'Theodore Roosevelt', 'Franklin D. Roosevelt', 'John F. Kennedy', 'Martin Luther King']
  },
  {
    c: 'Líderes y figuras protagonistas de la Revolución Francesa (1789-1799)',
    f: ['Maximilien Robespierre', 'Luis XVI', 'María Antonieta', 'Jean-Paul Marat'],
    m: ['Georges Danton', 'Marqués de La Fayette', 'Louis de Saint-Just'],
    d: ['Jacques Necker', 'Camille Desmoulins', 'Emmanuel-Joseph Sieyès'],
    t: ['Napoleón III', 'Otto von Bismarck', 'Conde de Cavour', 'Oliver Cromwell', 'Giuseppe Garibaldi']
  },
  {
    c: 'Grandes batallas terrestres y navales de las Guerras Napoleónicas',
    f: ['Batalla de Waterloo', 'Batalla de Austerlitz', 'Batalla de Trafalgar', 'Batalla de Leipzig'],
    m: ['Batalla de Borodino', 'Batalla de Jena', 'Batalla de Bailén'],
    d: ['Batalla de Marengo', 'Batalla de Wagram', 'Batalla de Friedland'],
    t: ['Batalla de Stalingrado', 'Batalla de Gettysburg', 'Batalla de Verdún', 'Batalla de las Termópilas', 'Batalla de Hastings']
  },
  {
    c: 'Líderes militares y políticos durante las Guerras Napoleónicas',
    f: ['Napoleón Bonaparte', 'Duque de Wellington', 'Horatio Nelson', 'Zar Alejandro I'],
    m: ['Mariscal Michel Ney', 'Mariscal Joachim Murat', 'Gebhard von Blücher'],
    d: ['Mijaíl Kutúzov', 'Klemens von Metternich', 'Mariscal Louis-Nicolas Davout'],
    t: ['Otto von Bismarck', 'Winston Churchill', 'Abraham Lincoln', 'George Patton', 'Káiser Guillermo II']
  },
  {
    c: 'Libertadores y líderes de las guerras de independencia hispanoamericanas',
    f: ['Simón Bolívar', 'José de San Martín', 'Miguel Hidalgo', 'Bernardo O\'Higgins'],
    m: ['Antonio José de Sucre', 'José María Morelos', 'Francisco de Miranda'],
    d: ['Manuel Belgrano', 'José Gervasio Artigas', 'Andrés de Santa Cruz'],
    t: ['Ernesto Che Guevara', 'Fidel Castro', 'Hernán Cortés', 'Francisco Pizarro', 'Emiliano Zapata']
  },
  {
    c: 'Inventos y avances técnicos de la Primera Revolución Industrial',
    f: ['Máquina de vapor de James Watt', 'Hiladora Spinning Jenny', 'Locomotora de Stephenson', 'Telar mecánico de Cartwright'],
    m: ['Lanzadera volante de Kay', 'Barco de vapor de Fulton', 'Bomba de agua de Newcomen'],
    d: ['Pudelado de Henry Cort', 'Water frame de Arkwright', 'Desmotadora de algodón de Whitney'],
    t: ['Bombilla eléctrica de Edison', 'Teléfono de Bell', 'Internet', 'Motor de combustión interna', 'Computadora personal']
  },
  {
    c: 'Constituciones históricas promulgadas en España',
    f: ['Constitución de Cádiz de 1812', 'Constitución Española de 1978', 'Constitución de 1931', 'Constitución de 1876'],
    m: ['Constitución de 1845', 'Constitución de 1869', 'Constitución de 1837'],
    d: ['Estatuto Real de 1834', 'Estatuto de Bayona de 1808', 'Constitución non nata de 1856'],
    t: ['Constitución de los Estados Unidos', 'Declaración de Derechos de Virginia', 'Carta Magna inglesa', 'Constitución francesa de 1791', 'Código Napoleónico']
  },
  {
    c: 'Acontecimientos decisivos de la Guerra de la Independencia Española (1808-1814)',
    f: ['Levantamiento del 2 de Mayo', 'Batalla de Bailén', 'Sitio de Zaragoza', 'Promulgación de la Constitución de Cádiz'],
    m: ['Batalla de Vitoria', 'Sitio de Gerona', 'Batalla de los Arapiles'],
    d: ['Batalla de Somosierra', 'Batalla de Talavera', 'Tratado de Valençay'],
    t: ['Guerra Civil Española', 'Desastre del 98', 'Semana Trágica de Barcelona', 'Guerra de Sucesión Española', 'Guerra de la Oreja de Jenkins']
  },
  {
    c: 'Compositores musicales del Clasicismo y primer Romanticismo europeo',
    f: ['Wolfgang Amadeus Mozart', 'Ludwig van Beethoven', 'Franz Joseph Haydn', 'Franz Schubert'],
    m: ['Frédéric Chopin', 'Johann Sebastian Bach', 'Felix Mendelssohn'],
    d: ['Robert Schumann', 'Gioachino Rossini', 'Carl Maria von Weber'],
    t: ['Igor Stravinsky', 'John Williams', 'Miles Davis', 'Freddie Mercury', 'Bob Dylan']
  },

  // 51 - 60: Siglo XIX, Unificaciones y Expansión Imperial
  {
    c: 'Artífices y protagonistas de la Unificación de Italia (Risorgimento)',
    f: ['Giuseppe Garibaldi', 'Conde de Cavour', 'Víctor Manuel II', 'Giuseppe Mazzini'],
    m: ['Expedición de los Mil', 'Urbano Rattazzi', 'Massimo d\'Azeglio'],
    d: ['Bettino Ricasoli', 'Silvio Pellico', 'Vincenzo Gioberti'],
    t: ['Benito Mussolini', 'Julio César', 'Napoleón Bonaparte', 'Nicolás Maquiavelo', 'César Borgia']
  },
  {
    c: 'Artífices de la Unificación alemana y nacimiento del Segundo Imperio (1871)',
    f: ['Otto von Bismarck', 'Káiser Guillermo I', 'Helmuth von Moltke el Viejo', 'Albrecht von Roon'],
    m: ['Confederación Alemana del Norte', 'Guerra Franco-Prusiana', 'Guerra de las Siete Semanas'],
    d: ['Guerra de los Ducados', 'Káiser Federico III', 'Eduard Lasker'],
    t: ['Adolf Hitler', 'Káiser Guillermo II', 'Paul von Hindenburg', 'Karl Marx', 'Federico II el Grande']
  },
  {
    c: 'Líderes militares y figuras políticas de la Guerra de Secesión estadounidense (1861-1865)',
    f: ['Abraham Lincoln', 'General Ulysses S. Grant', 'General Robert E. Lee', 'General Stonewall Jackson'],
    m: ['Jefferson Davis', 'General William Tecumseh Sherman', 'General George Meade'],
    d: ['General J.E.B. Stuart', 'General George McClellan', 'General James Longstreet'],
    t: ['George Washington', 'Thomas Jefferson', 'Dwight D. Eisenhower', 'George Patton', 'Alexander Hamilton']
  },
  {
    c: 'Grandes batallas campales y asedios de la Guerra de Secesión Americana',
    f: ['Batalla de Gettysburg', 'Batalla de Fort Sumter', 'Batalla de Antietam', 'Batalla de Bull Run'],
    m: ['Batalla de Shiloh', 'Sitio de Vicksburg', 'Batalla de Chancellorsville'],
    d: ['Batalla de Fredericksburg', 'Batalla de Cold Harbor', 'Batalla de Appomattox'],
    t: ['Batalla de Bunker Hill', 'Batalla de Yorktown', 'Batalla de Midway', 'Batalla de Pearl Harbor', 'Batalla de Normandía']
  },
  {
    c: 'Monarcas que ocuparon el trono británico durante los siglos XIX y XX',
    f: ['Reina Victoria I', 'Reina Isabel II', 'Rey Jorge VI', 'Rey Jorge V'],
    m: ['Rey Eduardo VII', 'Rey Eduardo VIII', 'Rey Guillermo IV'],
    d: ['Príncipe Alberto de Sajonia-Coburgo', 'Reina María de Teck', 'Príncipe Felipe de Edimburgo'],
    t: ['Isabel I Tudor', 'María I Tudor', 'Ana Estuardo', 'María Antonieta', 'Juana de Arco']
  },
  {
    c: 'Presidentes de Estados Unidos que sufrieron un magnicidio (asesinados durante su mandato)',
    f: ['Abraham Lincoln', 'John F. Kennedy', 'James A. Garfield', 'William McKinley'],
    m: ['Teatro Ford', 'Plaza Dealey de Dallas', 'Templo de la Música de Búfalo'],
    d: ['John Wilkes Booth', 'Lee Harvey Oswald', 'Charles J. Guiteau'],
    t: ['Theodore Roosevelt', 'Ronald Reagan', 'Franklin D. Roosevelt', 'Richard Nixon', 'Dwight D. Eisenhower']
  },
  {
    c: 'Conflictos bélicos internacionales que tuvieron lugar en el siglo XIX',
    f: ['Guerras Napoleónicas', 'Guerra de Secesión estadounidense', 'Guerra Franco-Prusiana', 'Guerra de Crimea'],
    m: ['Guerras Carlistas en España', 'Guerra Hispano-Estadounidense', 'Guerra de la Triple Alianza'],
    d: ['Guerra del Pacífico (1879-1884)', 'Guerra de los Bóeres', 'Guerras del Opio'],
    t: ['Primera Guerra Mundial', 'Segunda Guerra Mundial', 'Guerra de Vietnam', 'Guerra de Corea', 'Guerra de los Treinta Años']
  },
  {
    c: 'Acontecimientos y elementos del Desastre del 98 en el Imperio Español',
    f: ['Hundimiento del acorazado Maine', 'Guerra de Independencia cubana', 'Batalla de Cavite', 'Firma del Tratado de París de 1898'],
    m: ['Batalla naval de Santiago de Cuba', 'Cesión de Puerto Rico', 'Sitio de Baler (Últimos de Filipinas)'],
    d: ['Almirante Pascual Cervera', 'Grito de Baire', 'General Valeriano Weyler'],
    t: ['Desastre de Annual (1921)', 'Incidente de la isla de Perejil', 'Pérdida de Gibraltar', 'Batalla de Lepanto', 'Guerra Civil Española']
  },
  {
    c: 'Pensadores, científicos y teóricos del siglo XIX',
    f: ['Charles Darwin', 'Karl Marx', 'Louis Pasteur', 'Gregor Mendel'],
    m: ['Friedrich Nietzsche', 'Michael Faraday', 'James Clerk Maxwell'],
    d: ['Dmitri Mendeléyev', 'Sigmund Freud', 'John Stuart Mill'],
    t: ['Albert Einstein', 'Isaac Newton', 'René Descartes', 'Galileo Galilei', 'Stephen Hawking']
  },
  {
    c: 'Zares y emperadores de la dinastía Románov en Rusia',
    f: ['Nicolás II', 'Pedro I el Grande', 'Catalina II la Grande', 'Alejandro II'],
    m: ['Alejandro I', 'Nicolás I', 'Alejandro III'],
    d: ['Pablo I', 'Iván VI', 'Pedro III'],
    t: ['Iván el Terrible', 'Vladimir Lenin', 'Iósif Stalin', 'León Trotski', 'Mijaíl Gorbachov']
  },

  // 61 - 70: Primera Guerra Mundial y Período de Entreguerras
  {
    c: 'Potencias aliadas (Triple Entente y asociados) en la Primera Guerra Mundial',
    f: ['Francia', 'Reino Unido', 'Imperio Ruso', 'Estados Unidos'],
    m: ['Reino de Italia (desde 1915)', 'Bélgica', 'Reino de Serbia'],
    d: ['Imperio del Japón', 'Rumanía', 'Reino de Grecia'],
    t: ['Imperio Alemán', 'Imperio Austrohúngaro', 'Imperio Otomano', 'Reino de Bulgaria', 'España']
  },
  {
    c: 'Estados y potencias pertenecientes a las Potencias Centrales en la Primera Guerra Mundial',
    f: ['Imperio Alemán', 'Imperio Austrohúngaro', 'Imperio Otomano', 'Reino de Bulgaria'],
    m: ['Káiser Guillermo II', 'Emperador Francisco José I', 'Sultán Mehmed V'],
    d: ['Káiser Carlos I de Austria', 'Enver Pachá', 'General Paul von Hindenburg'],
    t: ['Reino Unido', 'Francia', 'Imperio Ruso', 'Reino de Italia', 'Estados Unidos']
  },
  {
    c: 'Grandes batallas terrestres y navales de la Primera Guerra Mundial',
    f: ['Batalla de Verdún', 'Batalla del Somme', 'Batalla de Galípoli', 'Batalla de Jutlandia'],
    m: ['Primera Batalla del Marne', 'Batalla de Tannenberg', 'Batalla de Passchendaele'],
    d: ['Batalla de Caporetto', 'Batalla de Galitzia', 'Ofensiva Brusílov'],
    t: ['Batalla de Stalingrado', 'Batalla de Midway', 'Batalla de El Alamein', 'Batalla de Normandía', 'Batalla de Waterloo']
  },
  {
    c: 'Gobernantes y mandatarios en el poder durante la Primera Guerra Mundial (1914-1918)',
    f: ['Káiser Guillermo II', 'Zar Nicolás II', 'Woodrow Wilson', 'David Lloyd George'],
    m: ['Georges Clemenceau', 'Emperador Francisco José I', 'Mariscal Philippe Pétain'],
    d: ['Vittorio Emanuele Orlando', 'General Ferdinand Foch', 'Mariscal Douglas Haig'],
    t: ['Winston Churchill', 'Franklin D. Roosevelt', 'Adolf Hitler', 'Iósif Stalin', 'Harry S. Truman']
  },
  {
    c: 'Tratados de paz del sistema de Versalles al concluir la Primera Guerra Mundial',
    f: ['Tratado de Versalles', 'Tratado de Saint-Germain-en-Laye', 'Tratado de Trianón', 'Tratado de Sèvres'],
    m: ['Tratado de Neuilly-sur-Seine', 'Tratado de Lausana', 'Pacto de la Sociedad de Naciones'],
    d: ['Pacto de Londres (1915)', 'Tratado de Brest-Litovsk', 'Armisticio de Compiègne'],
    t: ['Paz de Westfalia', 'Tratado de Utrecht', 'Conferencia de Yalta', 'Pacto de Varsovia', 'Tratado de Tordesillas']
  },
  {
    c: 'Líderes y figuras protagonistas de la Revolución Rusa de 1917',
    f: ['Vladimir Lenin', 'León Trotski', 'Iósif Stalin', 'Zar Nicolás II'],
    m: ['Aleksandr Kérenski', 'Félix Dzerzhinski', 'Lev Kámenev'],
    d: ['Grigori Zinóviev', 'Nikolái Bujarin', 'Yákov Sverdlov'],
    t: ['Mijaíl Gorbachov', 'Nikita Jrushchov', 'Leonid Brézhnev', 'Boris Yeltsin', 'Dmitri Medvédev']
  },
  {
    c: 'Acontecimientos del Crack de 1929 y la Gran Depresión económica mundial',
    f: ['Jueves Negro en Wall Street', 'Martes Negro de la Bolsa', 'Desempleo masivo en EEUU', 'New Deal'],
    m: ['Quiebra bancaria generalizada', 'Dust Bowl (tormentas de polvo)', 'Abandono del patrón oro'],
    d: ['Herbert Hoover', 'Bolsa de Nueva York (NYSE)', 'Ley Glass-Steagall'],
    t: ['Plan Marshall', 'Creación del Euro', 'Crisis de las hipotecas subprime', 'Hiperinflación de Weimar', 'Acuerdos de Bretton Woods']
  },
  {
    c: 'Líderes y mandatarios políticos del período de entreguerras en Europa (1919-1939)',
    f: ['Benito Mussolini', 'Adolf Hitler', 'Francisco Franco', 'Mustafa Kemal Atatürk'],
    m: ['Neville Chamberlain', 'Paul von Hindenburg', 'Édouard Daladier'],
    d: ['Galeazzo Ciano', 'Engelbert Dollfuss', 'Józef Piłsudski'],
    t: ['Winston Churchill', 'Charles de Gaulle', 'Harry S. Truman', 'Dwight D. Eisenhower', 'Clement Attlee']
  },
  {
    c: 'Nuevas tecnologías bélicas empleadas a gran escala en la Primera Guerra Mundial',
    f: ['Gas mostaza', 'Carro de combate (tanque)', 'Aviación de caza militar', 'Submarinos militares (U-Boot)'],
    m: ['Ametralladora Maxim', 'Lanzallamas portátil', 'Trincheras con alambrada'],
    d: ['Bombardeos con dirigible Zepelín', 'Hidrófonos acústicos submarinos', 'Casco de acero reglamentario'],
    t: ['Bomba atómica', 'Misiles balísticos V2', 'Aviones a reacción supersónicos', 'Satélites de radar', 'Fusiles de asalto AK-47']
  },
  {
    c: 'Tratados y acontecimientos del revisionismo previo a la Segunda Guerra Mundial (1938-1939)',
    f: ['Pacto Ribbentrop-Mólotov', 'Acuerdos de Múnich', 'Anexión de Austria (Anschluss)', 'Invasión de Checoslovaquia'],
    m: ['Crisis de los Sudetes', 'Pacto de Acero', 'Reclamación del Corredor de Danzig'],
    d: ['Ocupación de Memel', 'Incidente de Gleiwitz', 'Conferencia de Stresa'],
    t: ['Conferencia de Yalta', 'Conferencia de Potsdam', 'Juicios de Núremberg', 'Operación Barbarroja', 'Ataque a Pearl Harbor']
  },

  // 71 - 80: Segunda Guerra Mundial y Holocausto
  {
    c: 'Estados y naciones alineadas en el bando de los Aliados en la Segunda Guerra Mundial',
    f: ['Estados Unidos', 'Reino Unido', 'Unión Soviética', 'Francia Libre'],
    m: ['Canadá', 'Australia', 'Polonia'],
    d: ['República de China', 'Brasil', 'Reino de Noruega'],
    t: ['Alemania nazi', 'Imperio del Japón', 'Reino de Italia', 'Reino de Hungría', 'Reino de Rumanía']
  },
  {
    c: 'Países que integraron la alianza del Eje durante la Segunda Guerra Mundial',
    f: ['Alemania nazi', 'Imperio del Japón', 'Reino de Italia', 'Reino de Hungría'],
    m: ['Reino de Rumanía', 'Reino de Bulgaria', 'Finlandia'],
    d: ['Reino de Tailandia', 'Estado Independiente de Croacia', 'República Eslovaca'],
    t: ['España', 'Turquía', 'Suecia', 'Suiza', 'Portugal']
  },
  {
    c: 'Grandes batallas campales y operaciones de la Segunda Guerra Mundial',
    f: ['Batalla de Stalingrado', 'Desembarco de Normandía (Día D)', 'Batalla de Midway', 'Batalla de El Alamein'],
    m: ['Batalla de Kursk', 'Batalla de las Ardenas', 'Batalla de Berlín'],
    d: ['Batalla de Guadalcanal', 'Batalla de Iwo Jima', 'Batalla de Montecassino'],
    t: ['Batalla de Verdún', 'Batalla de Waterloo', 'Batalla de Gettysburg', 'Batalla de Galípoli', 'Batalla de Trafalgar']
  },
  {
    c: 'Líderes políticos de las naciones en la Segunda Guerra Mundial (Aliados y Eje)',
    f: ['Winston Churchill', 'Franklin D. Roosevelt', 'Iósif Stalin', 'Adolf Hitler'],
    m: ['Benito Mussolini', 'Emperador Hirohito', 'Harry S. Truman'],
    d: ['Charles de Gaulle', 'Hideki Tojo', 'Chiang Kai-shek'],
    t: ['Woodrow Wilson', 'Káiser Guillermo II', 'Theodore Roosevelt', 'Vladimir Lenin', 'Neville Chamberlain']
  },
  {
    c: 'Generales y mariscales al mando durante la Segunda Guerra Mundial',
    f: ['Dwight D. Eisenhower', 'George Patton', 'Erwin Rommel', 'Bernard Montgomery'],
    m: ['Georgy Zhúkov', 'Douglas MacArthur', 'Chester W. Nimitz'],
    d: ['Heinz Guderian', 'Erich von Manstein', 'Vasili Chuikov'],
    t: ['General Robert E. Lee', 'Ulysses S. Grant', 'Duque de Wellington', 'Mariscal Michel Ney', 'General Custer']
  },
  {
    c: 'Campos de concentración y exterminio nacionalsocialistas',
    f: ['Auschwitz-Birkenau', 'Treblinka', 'Dachau', 'Sobibor'],
    m: ['Mauthausen-Gusen', 'Buchenwald', 'Chelmno'],
    d: ['Belzec', 'Majdanek', 'Bergen-Belsen'],
    t: ['Gulag de Kolimá', 'Prisión de Spandau', 'Bahía de Guantánamo', 'Prisión de Alcatraz', 'Torre de Londres']
  },
  {
    c: 'Conferencias cumbre entre los líderes de los Aliados en la Segunda Guerra Mundial',
    f: ['Conferencia de Yalta', 'Conferencia de Teherán', 'Conferencia de Potsdam', 'Conferencia de Casablanca'],
    m: ['Carta del Atlántico', 'Conferencia de El Cairo', 'Conferencia de Dumbarton Oaks'],
    d: ['Conferencia de San Francisco', 'Conferencia de Quebec', 'Conferencia de Moscú (1944)'],
    t: ['Tratado de Versalles', 'Pacto de Varsovia', 'Acuerdos de Camp David', 'Tratado de Tordesillas', 'Paz de Westfalia']
  },
  {
    c: 'Operaciones militares aeronavales y terrestres de la Segunda Guerra Mundial',
    f: ['Operación Overlord', 'Operación Barbarroja', 'Operación Market Garden', 'Ataque a Pearl Harbor'],
    m: ['Operación Torch (Antorcha)', 'Operación Ciudadela', 'Operación Bagration'],
    d: ['Operación Urano', 'Operación Dynamo (Dunkerque)', 'Operación Husky'],
    t: ['Operación Tormenta del Desierto', 'Operación Rolling Thunder', 'Operación Causa Justa', 'Crisis de los Misiles', 'Invasión de Bahía de Cochinos']
  },
  {
    c: 'Científicos e ingenieros que colaboraron en el Proyecto Manhattan',
    f: ['J. Robert Oppenheimer', 'Enrico Fermi', 'Richard Feynman', 'Niels Bohr'],
    m: ['Leo Szilard', 'Hans Bethe', 'Edward Teller'],
    d: ['Ernest Lawrence', 'Klaus Fuchs', 'Isidor Isaac Rabi'],
    t: ['Albert Einstein', 'Werner Heisenberg', 'Marie Curie', 'Max Planck', 'Nikola Tesla']
  },
  {
    c: 'Procesos judiciales y tribunales militares celebrados tras la Segunda Guerra Mundial',
    f: ['Juicios de Núremberg', 'Tribunal Militar de Tokio', 'Juicio de los médicos de Núremberg', 'Juicio a Hermann Göring'],
    m: ['Juicio a Rudolf Hess', 'Juicio a Joachim von Ribbentrop', 'Juicio de los jueces de Núremberg'],
    d: ['Juicio de Auschwitz en Cracovia', 'Juicio de Bergen-Belsen', 'Juicio de Jabárovsk'],
    t: ['Tribunal del Santo Oficio de la Inquisición', 'Juicio a Sócrates', 'Juicio a Galileo Galilei', 'Caso Dreyfus', 'Corte Penal Internacional']
  },

  // 81 - 90: Guerra Fría, Descolonización y Siglo XX Tardío
  {
    c: 'Conflictos bélicos y crisis militares enmarcadas en la Guerra Fría',
    f: ['Guerra de Vietnam', 'Guerra de Corea', 'Crisis de los Misiles en Cuba', 'Guerra de Afganistán (1979-1989)'],
    m: ['Bloqueo de Berlín', 'Construcción del Muro de Berlín', 'Invasión de Bahía de Cochinos'],
    d: ['Primavera de Praga', 'Revolución Húngara de 1956', 'Crisis del Canal de Suez'],
    t: ['Primera Guerra Mundial', 'Guerra de Secesión estadounidense', 'Guerra Franco-Prusiana', 'Guerra del Golfo (1991)', 'Guerra de las Malvinas']
  },
  {
    c: 'Secretarios Generales y líderes supremos de la Unión Soviética',
    f: ['Vladimir Lenin', 'Iósif Stalin', 'Nikita Jrushchov', 'Mijaíl Gorbachov'],
    m: ['Leonid Brézhnev', 'Yuri Andrópov', 'Konstantín Chernenko'],
    d: ['Gueorgui Malenkov', 'Alekséi Kosygin', 'Anastás Mikoyán'],
    t: ['Boris Yeltsin', 'Vladimir Putin', 'Dmitri Medvédev', 'León Trotski', 'Aleksandr Kérenski']
  },
  {
    c: 'Líderes y figuras de la descolonización y los derechos civiles del siglo XX',
    f: ['Nelson Mandela', 'Martin Luther King Jr.', 'Mahatma Gandhi', 'Malcolm X'],
    m: ['Rosa Parks', 'Patrice Lumumba', 'Jawaharlal Nehru'],
    d: ['Kwame Nkrumah', 'Jomo Kenyatta', 'Desmond Tutu'],
    t: ['Winston Churchill', 'Margaret Thatcher', 'Charles de Gaulle', 'Richard Nixon', 'Cecil Rhodes']
  },
  {
    c: 'Hitos espaciales alcanzados durante la Carrera Espacial entre EEUU y la URSS',
    f: ['Lanzamiento del Sputnik 1', 'Vuelo espacial de Yuri Gagarin', 'Alunizaje del Apolo 11', 'Vuelo orbital de la perra Laika'],
    m: ['Vuelo de Valentina Tereshkova', 'Paseo espacial de Alekséi Leónov', 'Misión Apolo-Soyuz'],
    d: ['Impacto lunar de Luna 2', 'Fotografías lunares de Luna 3', 'Puesta en órbita de la estación Mir'],
    t: ['Lanzamiento del Telescopio James Webb', 'Aterrizaje del Rover Curiosity', 'Estación Espacial Internacional', 'Vuelo comercial del Concorde', 'Proyecto Manhattan']
  },
  {
    c: 'Países miembros fundadores de la OTAN (Tratado de Washington de 1949)',
    f: ['Estados Unidos', 'Reino Unido', 'Francia', 'Canadá'],
    m: ['Italia', 'Bélgica', 'Países Bajos'],
    d: ['Noruega', 'Dinamarca', 'Islandia'],
    t: ['España', 'Alemania', 'Turquía', 'Polonia', 'Suecia']
  },
  {
    c: 'Estados firmantes del Pacto de Varsovia en 1955',
    f: ['Unión Soviética', 'República Popular de Polonia', 'República Democrática Alemana (RDA)', 'Checoslovaquia'],
    m: ['República Popular de Hungría', 'Rumanía socialista', 'Bulgaria socialista'],
    d: ['República Popular de Albania', 'Mongolia', 'Yemen del Sur'],
    t: ['Yugoslavia', 'China', 'Cuba', 'Corea del Norte', 'Vietnam']
  },
  {
    c: 'Conflictos bélicos librados entre Israel y los países árabes en el siglo XX',
    f: ['Guerra de los Seis Días', 'Guerra de Yom Kipur', 'Guerra árabe-israelí de 1948', 'Guerra del Líbano de 1982'],
    m: ['Guerra de Desgaste', 'Crisis del Canal de Suez (1956)', 'Operación Paz para Galilea'],
    d: ['Acuerdos de Camp David', 'Acuerdos de Oslo', 'Primera Intifada'],
    t: ['Guerra del Golfo (1991)', 'Guerra Irán-Irak', 'Guerra de Corea', 'Guerra de Vietnam', 'Guerra de las Malvinas']
  },
  {
    c: 'Presidentes de los Estados Unidos que gobernaron en la segunda mitad del siglo XX',
    f: ['John F. Kennedy', 'Richard Nixon', 'Ronald Reagan', 'Bill Clinton'],
    m: ['Dwight D. Eisenhower', 'Lyndon B. Johnson', 'Jimmy Carter'],
    d: ['Harry S. Truman', 'Gerald Ford', 'George H. W. Bush'],
    t: ['Franklin D. Roosevelt', 'Theodore Roosevelt', 'Woodrow Wilson', 'Abraham Lincoln', 'Barack Obama']
  },
  {
    c: 'Acontecimientos clave de la Transición Democrática en España (1975-1982)',
    f: ['Muerte de Francisco Franco', 'Aprobación de la Constitución de 1978', 'Intento de golpe de Estado del 23-F', 'Primeras elecciones generales de 1977'],
    m: ['Legalización del Partido Comunista (PCE)', 'Firma de los Pactos de la Moncloa', 'Victoria electoral del PSOE de 1982'],
    d: ['Proclamación de Juan Carlos I', 'Aprobación de la Ley para la Reforma Política', 'Dimisión de Adolfo Suárez'],
    t: ['Inicio de la Guerra Civil Española', 'Adhesión a la Unión Europea', 'Juegos Olímpicos de Barcelona 1992', 'Guerra de Marruecos', 'Huelga general de 1988']
  },
  {
    c: 'Acontecimientos del colapso del bloque del Este y la caída de la Unión Soviética (1989-1991)',
    f: ['Caída del Muro de Berlín', 'Disolución formal de la Unión Soviética', 'Reunificación alemana', 'Revolución de Terciopelo'],
    m: ['Implantación de la Glásnost y la Perestroika', 'Intento de golpe de Estado de agosto en Moscú', 'Ejecución de Nicolae Ceaușescu'],
    d: ['Firma del Tratado de Belavezha', 'Triunfo electoral de Solidaridad en Polonia', 'Pícnic Paneuropeo'],
    t: ['Construcción del Muro de Berlín (1961)', 'Crisis de los Misiles en Cuba', 'Primavera de Praga (1968)', 'Revolución Rusa de 1917', 'Guerra de Corea']
  },

  // 91 - 100: Patrimonio, Grandes Obras y Personajes Universales
  {
    c: 'Monumentos españoles catalogados como Patrimonio de la Humanidad por la UNESCO',
    f: ['La Alhambra de Granada', 'La Sagrada Familia de Barcelona', 'El Acueducto de Segovia', 'La Mezquita-Catedral de Córdoba'],
    m: ['Catedral de Santiago de Compostela', 'Monasterio de El Escorial', 'Murallas de Ávila'],
    d: ['Cueva de Altamira', 'Monasterio de Poblet', 'Torre de Hércules'],
    t: ['Coliseo de Roma', 'Torre Eiffel', 'Torre de Pisa', 'Big Ben de Londres', 'Partenón de Atenas']
  },
  {
    c: 'Obras maestras escultóricas o pictóricas realizadas por Miguel Ángel Buonarroti',
    f: ['Estatua del David', 'La Piedad del Vaticano', 'Bóveda de la Capilla Sixtina', 'El Juicio Final'],
    m: ['Estatua del Moisés', 'Tumba de los Médici', 'Baco con sátiro'],
    d: ['Piedad Rondanini', 'Tondo Doni', 'Esclavo moribundo'],
    t: ['La Gioconda (Mona Lisa)', 'El hombre de Vitruvio', 'La Última Cena', 'Venus de Milo', 'Victoria alada de Samotracia']
  },
  {
    c: 'Pinturas maestras conservadas en la colección del Museo del Prado de Madrid',
    f: ['Las Meninas', 'El jardín de las delicias', 'Los fusilamientos del 3 de mayo', 'Las tres Gracias'],
    m: ['El caballero de la mano en el pecho', 'Saturno devorando a su hijo', 'La maja desnuda'],
    d: ['La fragua de Vulcano', 'El triunfo de Baco (Los borrachos)', 'El descendimiento de la cruz'],
    t: ['Guernica', 'La persistencia de la memoria', 'La Gioconda', 'La noche estrellada', 'El grito']
  },
  {
    c: 'Edificaciones y obras arquitectónicas conservadas de la Antigua Roma',
    f: ['Coliseo de Roma', 'Panteón de Agripa', 'Acueducto de Segovia', 'Teatro romano de Mérida'],
    m: ['Pont du Gard', 'Termas de Caracalla', 'Maison Carrée'],
    d: ['Arena de Verona', 'Porta Nigra de Tréveris', 'Templo de Diana en Évora'],
    t: ['Partenón de Atenas', 'Santa Sofía de Constantinopla', 'Gran Pirámide de Guiza', 'Stonehenge', 'Catedral de Notre Dame']
  },
  {
    c: 'Obras cumbre de la literatura épica y universal de la Antigüedad o Medievo',
    f: ['La Ilíada', 'La Odisea', 'La Divina Comedia', 'Cantar de mio Cid'],
    m: ['La Eneida', 'El Decamerón', 'Cantar de Roldán'],
    d: ['Poema de Gilgamesh', 'Metamorfosis', 'Cuentos de Canterbury'],
    t: ['Don Quijote de la Mancha', 'Hamlet', 'La Celestina', 'Fausto', 'Guerra y Paz']
  },
  {
    c: 'Personalidades reconocidas con el Premio Nobel de la Paz por su labor humanitaria o política',
    f: ['Nelson Mandela', 'Martin Luther King Jr.', 'Madre Teresa de Calcuta', 'Barack Obama'],
    m: ['Malala Yousafzai', 'Dalái Lama (Tenzin Gyatso)', 'Kofi Annan'],
    d: ['Desmond Tutu', 'Rigoberta Menchú', 'Mijaíl Gorbachov'],
    t: ['Mahatma Gandhi', 'Albert Einstein', 'Winston Churchill', 'Abraham Lincoln', 'Eleanor Roosevelt']
  },
  {
    c: 'Obras de teatro y tragedias firmadas por William Shakespeare',
    f: ['Hamlet', 'Romeo y Julieta', 'Macbeth', 'Otelo'],
    m: ['El sueño de una noche de verano', 'El rey Lear', 'El mercader de Venecia'],
    d: ['Julio César', 'La tempestad', 'Mucho ruido y pocas nueces'],
    t: ['La vida es sueño', 'Fuenteovejuna', 'Fausto', 'El misántropo', 'Don Juan Tenorio']
  },
  {
    c: 'Grandes catedrales del estilo arquitectónico gótico en Europa',
    f: ['Catedral de Notre Dame de París', 'Catedral de Burgos', 'Catedral de Toledo', 'Catedral de Chartres'],
    m: ['Catedral de Colonia', 'Duomo de Milán', 'Catedral de León'],
    d: ['Sainte-Chapelle de París', 'Catedral de Sevilla', 'Catedral de Salisbury'],
    t: ['Basílica de San Pedro del Vaticano', 'Sagrada Familia', 'Santa Sofía de Estambul', 'Monasterio de El Escorial', 'Panteón de Agripa']
  },
  {
    c: 'Autores fundamentales de la filosofía moderna europea (siglos XVII a XIX)',
    f: ['René Descartes', 'Immanuel Kant', 'Karl Marx', 'Friedrich Nietzsche'],
    m: ['Baruch Spinoza', 'Thomas Hobbes', 'Arthur Schopenhauer'],
    d: ['Gottfried Leibniz', 'G.W.F. Hegel', 'John Locke'],
    t: ['Platón', 'Aristóteles', 'Sócrates', 'Santo Tomás de Aquino', 'San Agustín de Hipona']
  },
  {
    c: 'Personalidades históricas que fueron ejecutadas en la guillotina durante la Revolución Francesa',
    f: ['Rey Luis XVI', 'Reina María Antonieta', 'Maximilien Robespierre', 'Georges Danton'],
    m: ['Louis de Saint-Just', 'Madame Roland', 'Antoine Lavoisier'],
    d: ['Camille Desmoulins', 'Charlotte Corday', 'Jacques Pierre Brissot'],
    t: ['Jean-Paul Marat', 'Napoleón Bonaparte', 'Marqués de La Fayette', 'Cardenal Richelieu', 'Voltaire']
  }
];

export default Array.from({ length: 100 }, (_, idx) => {
  const p = plantillas[idx];
  return {
    id: `historia_${idx + 1}`,
    consigna: p.c,
    correctos: { faciles: p.f, medios: p.m, dificiles: p.d },
    trampas: p.t
  };
});