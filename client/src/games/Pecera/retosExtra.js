// Ampliación de retos de «¿Qué sobra en la pecera?».
// X(criterio, 'emoji:texto · emoji:texto · …' (6), índice del intruso, índice de la trampa o null, por qué sobra, por qué la trampa sí vale)
const X = (criterio, lista, intruso, trampa, porQue, trampaTxt = '') => ({
  items: lista.split(' · ').map((x) => { const i = x.indexOf(':'); return [x.slice(0, i), x.slice(i + 1)]; }),
  intruso, trampa, criterio, porQue, trampaTxt
});

export default [
  // ---- Animales
  X('Son reptiles.', '🐊:Cocodrilo · 🐢:Tortuga · 🦎:Lagarto · 🐍:Serpiente · 🐸:Rana · 🦖:Iguana', 4, 1, 'La rana es un anfibio.', 'La tortuga tiene caparazón, pero es un reptil.'),
  X('Son insectos.', '🐝:Abeja · 🐜:Hormiga · 🦗:Saltamontes · 🕷️:Araña · 🦋:Mariposa · 🪲:Escarabajo', 3, 4, 'La araña es un arácnido: tiene ocho patas.', 'La mariposa parece delicada, pero es un insecto con seis patas.'),
  X('Son mamíferos marinos.', '🐋:Ballena · 🐬:Delfín · 🦭:Foca · 🐙:Pulpo · 🦦:Nutria marina · 🐻‍❄️:Morsa', 3, 4, 'El pulpo es un molusco.', 'La nutria marina también es un mamífero marino.'),
  X('Son animales que hibernan.', '🐻:Oso · 🦔:Erizo · 🦇:Murciélago · 🐿️:Lirón · 🐸:Rana · 🦒:Jirafa', 5, 4, 'La jirafa vive en la sabana y no hiberna.', 'Muchas ranas pasan el invierno aletargadas.'),
  X('Son aves que no vuelan.', '🐧:Pingüino · 🦤:Dodo · 🦩:Flamenco · 🥝:Kiwi · 🐦:Avestruz · 🦚:Ñandú', 2, null, 'El flamenco sí vuela.'),
  X('Son animales nocturnos.', '🦉:Búho · 🦇:Murciélago · 🦝:Mapache · 🐓:Gallo · 🦊:Zorro · 🐈:Gato montés', 3, null, 'El gallo es diurno: canta al amanecer.'),
  X('Son herbívoros.', '🐘:Elefante · 🦒:Jirafa · 🐄:Vaca · 🦓:Cebra · 🐼:Panda · 🦁:León', 5, 4, 'El león es carnívoro.', 'El panda es un oso, pero come casi solo bambú.'),
  X('Tienen ocho patas.', '🕷️:Araña · 🦂:Escorpión · 🐙:Pulpo · 🦀:Cangrejo · 🕸️:Tarántula · 🐜:Hormiga', 5, 2, 'La hormiga tiene seis patas.', 'El pulpo tiene ocho brazos.'),
  X('Son animales de Australia.', '🦘:Canguro · 🐨:Koala · 🦫:Ornitorrinco · 🐼:Panda · 🐦:Emú · 🦜:Cacatúa', 3, 2, 'El panda es de China.', 'El ornitorrinco parece un invento, pero es australiano.'),
  X('Son felinos.', '🐅:Tigre · 🐆:Guepardo · 🦁:León · 🐈:Gato · 🦊:Zorro · 🐆:Lince', 4, 3, 'El zorro es un cánido, pariente del perro.', 'El gato doméstico también es un felino.'),
  X('Son peces.', '🦈:Tiburón · 🐟:Atún · 🐠:Pez payaso · 🐡:Pez globo · 🐬:Delfín · 🎏:Carpa', 4, 0, 'El delfín es un mamífero.', 'El tiburón es un pez, aunque sea cartilaginoso.'),
  X('Son animales que ponen huevos.', '🐔:Gallina · 🐢:Tortuga · 🐍:Serpiente · 🦫:Ornitorrinco · 🐊:Cocodrilo · 🦇:Murciélago', 5, 3, 'El murciélago es un mamífero vivíparo.', 'El ornitorrinco es un mamífero, pero pone huevos.'),
  // ---- Comida
  X('Son frutas.', '🍎:Manzana · 🍐:Pera · 🍅:Tomate · 🥕:Zanahoria · 🍇:Uva · 🍓:Fresa', 3, 2, 'La zanahoria es una raíz.', 'El tomate, botánicamente, es una fruta.'),
  X('Son legumbres.', '🫘:Lenteja · 🫛:Guisante · 🥜:Cacahuete · 🌰:Garbanzo · 🌽:Maíz · 🫘:Judía', 4, 2, 'El maíz es un cereal.', 'El cacahuete parece un fruto seco, pero es una legumbre.'),
  X('Son cereales.', '🌾:Trigo · 🍚:Arroz · 🌽:Maíz · 🌾:Cebada · 🌾:Avena · 🫘:Soja', 5, null, 'La soja es una legumbre.'),
  X('Son quesos.', '🧀:Manchego · 🧀:Roquefort · 🧀:Parmesano · 🧀:Cabrales · 🥩:Jamón ibérico · 🧀:Idiazábal', 4, null, 'El jamón ibérico es un embutido curado.'),
  X('Son platos típicos de Italia.', '🍕:Pizza · 🍝:Lasaña · 🍚:Risotto · 🥟:Raviolis · 🥘:Paella · 🍰:Tiramisú', 4, 5, 'La paella es española.', 'El tiramisú es un postre, pero también es italiano.'),
  X('Son platos típicos de España.', '🥘:Paella · 🥔:Tortilla de patatas · 🍅:Gazpacho · 🫓:Fabada · 🌮:Tacos · 🦐:Gambas al ajillo', 4, null, 'Los tacos son mexicanos.'),
  X('Son cítricos.', '🍊:Naranja · 🍋:Limón · 🍈:Pomelo · 🍊:Mandarina · 🍑:Melocotón · 🍋:Lima', 4, null, 'El melocotón no es un cítrico.'),
  X('Son frutos secos.', '🌰:Castaña · 🥜:Almendra · 🌰:Nuez · 🌰:Avellana · 🍇:Uva · 🥥:Pistacho', 4, null, 'La uva es una fruta fresca (la pasa sí sería seca).'),
  X('Son bebidas calientes típicas.', '☕:Café · 🍵:Té · 🫖:Infusión · 🍫:Chocolate a la taza · 🥛:Horchata · 🧉:Mate', 4, 5, 'La horchata se toma fría.', 'El mate se bebe caliente.'),
  X('Son verduras de hoja.', '🥬:Lechuga · 🥬:Espinaca · 🥬:Acelga · 🥦:Rúcula · 🥕:Zanahoria · 🥬:Col', 4, null, 'La zanahoria es una raíz.'),
  // ---- Geografía
  X('Son países de Europa.', '🇫🇷:Francia · 🇵🇹:Portugal · 🇹🇷:Turquía · 🇲🇦:Marruecos · 🇮🇸:Islandia · 🇬🇷:Grecia', 3, 2, 'Marruecos está en África.', 'Turquía tiene parte de su territorio en Europa.'),
  X('Son países de América del Sur.', '🇨🇴:Colombia · 🇧🇷:Brasil · 🇵🇪:Perú · 🇲🇽:México · 🇨🇱:Chile · 🇸🇷:Surinam', 3, 5, 'México está en América del Norte.', 'Surinam habla neerlandés, pero está en América del Sur.'),
  X('Son capitales europeas.', '🇳🇴:Oslo · 🇵🇱:Varsovia · 🇮🇪:Dublín · 🇨🇦:Ottawa · 🇭🇺:Budapest · 🇨🇭:Berna', 3, 5, 'Ottawa es la capital de Canadá.', 'Berna es la capital de Suiza, aunque no es su ciudad más grande.'),
  X('Son ríos de España.', ':Ebro · :Tajo · :Duero · :Sena · :Guadalquivir · :Miño', 3, 1, 'El Sena es un río de Francia.', 'El Tajo acaba en Lisboa, pero es un río español.'),
  X('Son islas de Canarias.', ':Tenerife · :Lanzarote · :La Gomera · :Menorca · :El Hierro · :La Graciosa', 3, 5, 'Menorca es una de las Baleares.', 'La Graciosa también es una isla canaria habitada.'),
  X('Son países sin costa.', '🇨🇭:Suiza · 🇦🇹:Austria · 🇧🇴:Bolivia · 🇵🇾:Paraguay · 🇵🇹:Portugal · 🇲🇳:Mongolia', 4, null, 'Portugal tiene mucha costa en el Atlántico.'),
  X('Son países que usan el euro.', '🇪🇸:España · 🇮🇹:Italia · 🇩🇪:Alemania · 🇬🇧:Reino Unido · 🇫🇮:Finlandia · 🇭🇷:Croacia', 3, 5, 'Reino Unido usa la libra esterlina.', 'Croacia adoptó el euro en 2023.'),
  X('Son montañas de más de 8000 metros.', ':Everest · :K2 · :Lhotse · :Mont Blanc · :Makalu · :Annapurna', 3, null, 'El Mont Blanc mide unos 4800 metros.'),
  X('Son mares.', ':Mediterráneo · :Cantábrico · :Báltico · :Caribe · :Titicaca · :Mar Negro', 4, null, 'El Titicaca es un lago.'),
  X('Son desiertos.', ':Sáhara · :Gobi · :Atacama · :Kalahari · :Amazonas · :Antártida', 4, 5, 'El Amazonas es una selva y un río.', 'La Antártida es el mayor desierto del mundo.'),
  X('Son comunidades autónomas españolas.', ':Galicia · :Aragón · :Murcia · :Navarra · :Toledo · :La Rioja', 4, 2, 'Toledo es una provincia y una ciudad de Castilla-La Mancha.', 'Murcia es ciudad, pero también comunidad autónoma.'),
  // ---- Palabras y lenguaje
  X('Son palabras esdrújulas.', ':Música · :Pájaro · :Teléfono · :Lámpara · :Árbol · :Brújula', 4, null, 'Árbol es llana: el acento va en la penúltima sílaba.'),
  X('Son palabras agudas.', ':Canción · :Reloj · :Café · :Pared · :Lápiz · :Sofá', 4, 1, 'Lápiz es llana.', 'Reloj no lleva tilde, pero es aguda.'),
  X('Son palíndromos (se leen igual al revés).', ':Ana · :Oso · :Radar · :Reconocer · :Sala · :Anilina', 4, 3, 'Sala al revés es «alas».', 'Reconocer es larga, pero se lee igual al revés.'),
  X('Son sinónimos de «feliz».', ':Contento · :Alegre · :Dichoso · :Jovial · :Triste · :Radiante', 4, null, 'Triste es lo contrario.'),
  X('Son verbos.', ':Correr · :Saltar · :Leer · :Mesa · :Escribir · :Ir', 3, 5, 'Mesa es un sustantivo.', '«Ir» es muy corto, pero es un verbo.'),
  X('Son colores primarios (en pintura tradicional).', '🔴:Rojo · 🔵:Azul · 🟡:Amarillo · 🟢:Verde · 🔴:Rojo carmín · 🔵:Azul ultramar', 3, null, 'El verde se obtiene mezclando azul y amarillo.'),
  X('Son palabras que empiezan por vocal.', ':Elefante · :Isla · :Uva · :Oreja · :Hormiga · :Árbol', 4, 5, 'Hormiga empieza por hache, aunque suene a vocal.', 'Árbol empieza por vocal, aunque lleve tilde.'),
  // ---- Números
  X('Son múltiplos de 3.', ':12 · :21 · :33 · :45 · :52 · :60', 4, 2, '52 entre 3 no da exacto.', '33 parece raro, pero es 3 × 11.'),
  X('Son números pares.', ':14 · :28 · :36 · :50 · :73 · :0', 4, 5, '73 es impar.', 'El 0 también es par.'),
  X('Son múltiplos de 7.', ':14 · :21 · :35 · :49 · :56 · :64', 5, 3, '64 no se divide entre 7.', '49 es 7 × 7.'),
  X('Sus cifras suman 10.', ':19 · :28 · :37 · :46 · :55 · :63', 5, 4, '6 + 3 = 9.', '55 tiene dos cifras iguales, pero 5 + 5 = 10.'),
  X('Son números romanos válidos.', ':XII · :XIV · :MMXX · :XL · :IIII · :CD', 4, 3, 'El 4 se escribe IV, no IIII (aunque se vea en algunos relojes).', 'XL es 40.'),
  // ---- Cultura y ocio
  X('Son instrumentos de cuerda.', '🎻:Violín · 🎸:Guitarra · 🪕:Banjo · 🎺:Trompeta · 🎹:Arpa · 🎻:Violonchelo', 3, 4, 'La trompeta es de viento.', 'El arpa también es de cuerda.'),
  X('Son instrumentos de viento.', '🎷:Saxofón · 🎺:Trompeta · 🪈:Flauta · 🥁:Tambor · 🪗:Acordeón · 📯:Trombón', 3, 4, 'El tambor es de percusión.', 'El acordeón funciona con aire: es de viento.'),
  X('Son deportes que se juegan con balón.', '⚽:Fútbol · 🏀:Baloncesto · 🏐:Voleibol · 🏉:Rugby · 🎾:Tenis · 🤾:Balonmano', 4, null, 'El tenis se juega con pelota y raqueta.'),
  X('Son deportes olímpicos de invierno.', '⛷️:Esquí · ⛸️:Patinaje · 🏒:Hockey sobre hielo · 🥌:Curling · 🏄:Surf · 🛷:Bobsleigh', 4, 3, 'El surf es olímpico, pero de verano.', 'El curling sí es olímpico de invierno.'),
  X('Son personajes de Disney.', ':Mickey · :Simba · :Elsa · :Shrek · :Moana · :Stitch', 3, 5, 'Shrek es de DreamWorks.', 'Stitch es un extraterrestre, pero es de Disney.'),
  X('Son superhéroes de Marvel.', ':Spider-Man · :Iron Man · :Thor · :Batman · :Hulk · :Lobezno', 3, 5, 'Batman es de DC Comics.', 'Lobezno también es de Marvel (X-Men).'),
  X('Son obras de Shakespeare.', ':Hamlet · :Otelo · :Macbeth · :Don Quijote · :Romeo y Julieta · :El rey Lear', 3, null, 'Don Quijote es de Cervantes.'),
  X('Son pintores españoles.', ':Velázquez · :Goya · :Picasso · :Dalí · :Monet · :Sorolla', 4, null, 'Monet era francés.'),
  X('Son planetas del sistema solar.', '🪐:Saturno · 🔴:Marte · 🌍:Tierra · 🌙:Luna · 🔵:Neptuno · 🟠:Mercurio', 3, null, 'La Luna es un satélite.'),
  X('Son piezas de ajedrez.', '♚:Rey · ♛:Dama · ♜:Torre · ♞:Caballo · ♝:Alfil · 🃏:Comodín', 5, null, 'El comodín es de la baraja de cartas.'),
  X('Son cosas de la baraja española.', '🪙:Oros · 🏆:Copas · 🗡️:Espadas · 🪵:Bastos · 🤴:Sota · ♥️:Corazones', 5, 4, 'Los corazones son de la baraja francesa.', 'La sota es una figura de la baraja española.'),
  X('Son elementos químicos.', ':Oxígeno · :Hierro · :Oro · :Agua · :Carbono · :Neón', 3, 5, 'El agua es un compuesto (H₂O).', 'El neón es un gas noble, y también un elemento.'),
  X('Son gases a temperatura ambiente.', ':Oxígeno · :Nitrógeno · :Helio · :Mercurio · :Hidrógeno · :Argón', 3, null, 'El mercurio es un metal líquido.'),
  X('Son metales.', ':Hierro · :Cobre · :Aluminio · :Mercurio · :Azufre · :Plata', 4, 3, 'El azufre no es un metal.', 'El mercurio es líquido, pero es un metal.')
];
