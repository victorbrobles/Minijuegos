// server/data/seeds/conecta/paises.js
export default [
  // ==========================================
  // PANELES 1 A 20 (CORREGIDOS Y AUDITADOS)
  // ==========================================
  {
    id: 1,
    grupos: [
      { tema: "Países que tienen frontera terrestre con un solo país", palabrasClave: ["frontera", "unico vecino", "limite"], elementos: ["Portugal", "Canadá", "Mónaco", "Reino Unido"] },
      { tema: "Microestados soberanos del continente europeo", palabrasClave: ["microestado", "europa", "pequeno"], elementos: ["Andorra", "San Marino", "Liechtenstein", "Ciudad del Vaticano"] },
      { tema: "Países de América del Sur sin litoral (sin salida al mar)", palabrasClave: ["sin mar", "sudamerica", "interior"], elementos: ["Bolivia", "Paraguay", "Suiza", "Austria"] },
      { tema: "Países insulares soberanos situados en el mar Caribe", palabrasClave: ["caribe", "isla", "insular"], elementos: ["Jamaica", "Barbados", "Cuba", "Trinidad y Tobago"] }
    ]
  },
  {
    id: 2,
    grupos: [
      { tema: "Países cuya capital oficial no es su ciudad más poblada", palabrasClave: ["capital", "poblacion", "ciudad"], elementos: ["Australia", "Brasil", "Estados Unidos", "Canadá"] },
      { tema: "Países atravesados por la línea ecuatorial terrestre", palabrasClave: ["ecuador", "paralelo", "linea"], elementos: ["Ecuador", "Colombia", "Kenia", "Indonesia"] },
      { tema: "Monarquías parlamentarias en el continente europeo", palabrasClave: ["monarquia", "rey", "europa"], elementos: ["Suecia", "Noruega", "Dinamarca", "Países Bajos"] },
      { tema: "Países nacidos tras la disolución de la antigua Yugoslavia", palabrasClave: ["yugoslavia", "balcanes", "antigua"], elementos: ["Croacia", "Serbia", "Eslovenia", "Bosnia y Herzegovina"] }
    ]
  },
  {
    id: 3,
    grupos: [
      { tema: "Países de Europa Central sin salida al mar", palabrasClave: ["sin mar", "europa central", "interior"], elementos: ["República Checa", "Hungría", "Eslovaquia", "Luxemburgo"] },
      { tema: "Países del golfo Pérsico con grandes reservas petrolíferas", palabrasClave: ["golfo persico", "petroleo", "oriente medio"], elementos: ["Qatar", "Kuwait", "Emiratos Árabes Unidos", "Arabia Saudita"] },
      { tema: "Países nórdicos de Europa Septentrional", palabrasClave: ["nordico", "escandinavia", "norte"], elementos: ["Finlandia", "Islandia", "Noruega", "Suecia"] },
      { tema: "Países con territorio continental en dos continentes (transcontinentales)", palabrasClave: ["transcontinental", "dos continentes", "europa asia"], elementos: ["Turquía", "Rusia", "Egipto", "Kazajistán"] }
    ]
  },
  {
    id: 4,
    grupos: [
      { tema: "Países cuya bandera contiene un árbol o símbolo vegetal", palabrasClave: ["bandera", "arbol", "hoja", "vegetal"], elementos: ["Canadá", "Líbano", "Chipre", "Belice"] },
      { tema: "Países miembros fundadores de la Comunidad Económica Europea (1957)", palabrasClave: ["union europea", "fundadores", "roma"], elementos: ["Francia", "Alemania", "Italia", "Bélgica"] },
      { tema: "Países del sudeste asiático que integran la ASEAN", palabrasClave: ["asean", "sudeste asiatico", "asia"], elementos: ["Tailandia", "Vietnam", "Filipinas", "Malasia"] },
      { tema: "Países africanos que tienen el portugués como lengua oficial", palabrasClave: ["portugues", "idioma", "africa"], elementos: ["Angola", "Mozambique", "Cabo Verde", "Guinea-Bisáu"] }
    ]
  },
  {
    id: 5,
    grupos: [
      { tema: "Países que limitan directamente con el mar Báltico", palabrasClave: ["mar baltico", "costa", "baltico"], elementos: ["Estonia", "Letonia", "Lituania", "Polonia"] },
      { tema: "Países insulares situados en el océano Índico", palabrasClave: ["oceano indico", "isla", "insular"], elementos: ["Madagascar", "Seychelles", "Maldivas", "Mauricio"] },
      { tema: "Países que forman el istmo de América Central", palabrasClave: ["centroamerica", "istmo", "america central"], elementos: ["Costa Rica", "Panamá", "Guatemala", "Honduras"] },
      { tema: "Los cuatro países con mayor superficie territorial del planeta", palabrasClave: ["grande", "extension", "superficie"], elementos: ["Rusia", "Canadá", "China", "Estados Unidos"] }
    ]
  },
  {
    id: 6,
    grupos: [
      { tema: "Países atravesados por la cordillera del Himalaya", palabrasClave: ["himalaya", "montana", "asia"], elementos: ["Nepal", "Bután", "India", "Pakistán"] },
      { tema: "Países del norte de África ribereños del mar Mediterráneo", palabrasClave: ["norte de africa", "mediterraneo", "magreb"], elementos: ["Marruecos", "Argelia", "Túnez", "Egipto"] },
      { tema: "Países con bandera tricolor de franjas roja, blanca y azul", palabrasClave: ["bandera", "colores", "rojo blanco azul"], elementos: ["Francia", "Países Bajos", "Reino Unido", "Rusia"] },
      { tema: "Naciones insulares soberanas del continente de Oceanía", palabrasClave: ["oceania", "pacifico", "isla"], elementos: ["Fiyi", "Samoa", "Tonga", "Vanuatu"] }
    ]
  },
  {
    id: 7,
    grupos: [
      { tema: "Países por los que transcurre el curso del río Danubio", palabrasClave: ["danubio", "rio", "europa"], elementos: ["Alemania", "Austria", "Eslovaquia", "Hungría"] },
      { tema: "Países africanos que tienen el inglés como lengua oficial", palabrasClave: ["ingles", "oficial", "africa"], elementos: ["Nigeria", "Ghana", "Sudáfrica", "Kenia"] },
      { tema: "Países de geografía notablemente alargada o estrecha", palabrasClave: ["alargado", "estrecho", "costa"], elementos: ["Chile", "Noruega", "Vietnam", "Gambia"] },
      { tema: "Países situados en la región del Cáucaso", palabrasClave: ["caucaso", "georgia", "armenia"], elementos: ["Armenia", "Azerbaiyán", "Georgia", "Rusia"] }
    ]
  },
  {
    id: 8,
    grupos: [
      { tema: "Países miembros fundadores de la OPEP", palabrasClave: ["opep", "petroleo", "cartel"], elementos: ["Venezuela", "Irak", "Irán", "Arabia Saudita"] },
      { tema: "Países que comparten la cuenca fluvial del río Amazonas", palabrasClave: ["amazonas", "selva", "sudamerica"], elementos: ["Brasil", "Perú", "Colombia", "Ecuador"] },
      { tema: "Países con costas sobre el mar Negro", palabrasClave: ["mar negro", "costa", "europa este"], elementos: ["Ucrania", "Rumanía", "Bulgaria", "Georgia"] },
      { tema: "Países con banderas que no son rectangulares o tienen proporciones cuadradas", palabrasClave: ["bandera", "no rectangular", "cuadrada"], elementos: ["Nepal", "Suiza", "Ciudad del Vaticano", "Bélgica"] }
    ]
  },
  {
    id: 9,
    grupos: [
      { tema: "Países asiáticos que fueron colonias del Imperio Británico", palabrasClave: ["colonia", "britanica", "imperio", "asia"], elementos: ["India", "Birmania", "Malasia", "Singapur"] },
      { tema: "Países con territorio dentro del círculo polar ártico", palabrasClave: ["artico", "circulo polar", "norte"], elementos: ["Noruega", "Finlandia", "Suecia", "Rusia"] },
      { tema: "Países de América que tienen el francés como idioma oficial", palabrasClave: ["frances", "idioma", "america"], elementos: ["Haití", "Canadá", "Vanuatu", "Francia"] },
      { tema: "Países soberanos que no cuentan con ejército profesional permanente", palabrasClave: ["sin ejercito", "fuerzas armadas", "paz"], elementos: ["Costa Rica", "Islandia", "Andorra", "Liechtenstein"] }
    ]
  },
  {
    id: 10,
    grupos: [
      { tema: "Los cuatro países más poblados del planeta", palabrasClave: ["poblacion", "habitantes", "millones"], elementos: ["India", "China", "Estados Unidos", "Indonesia"] },
      { tema: "Países que usan el euro oficialmente sin pertenecer a la Unión Europea", palabrasClave: ["euro", "moneda", "no ue"], elementos: ["Mónaco", "San Marino", "Montenegro", "Andorra"] },
      { tema: "Países que rodean y tienen costa en el lago Victoria", palabrasClave: ["lago victoria", "africa", "lago"], elementos: ["Uganda", "Tanzania", "Kenia", "Ruanda"] },
      { tema: "Países continentales de la península de Indochina", palabrasClave: ["indochina", "asia", "peninsula"], elementos: ["Laos", "Camboya", "Tailandia", "Vietnam"] }
    ]
  },
  {
    id: 11,
    grupos: [
      { tema: "Naciones insulares situadas en el océano Atlántico Norte", palabrasClave: ["atlantico norte", "isla", "oceano"], elementos: ["Irlanda", "Reino Unido", "Islandia", "Cabo Verde"] },
      { tema: "Países que formaron parte de la Gran Colombia en el siglo XIX", palabrasClave: ["gran colombia", "bolivar", "historia"], elementos: ["Colombia", "Venezuela", "Ecuador", "Panamá"] },
      { tema: "Repúblicas de Asia Central cuyo nombre termina en '-stán'", palabrasClave: ["stan", "asia central"], elementos: ["Kazajistán", "Uzbekistán", "Turkmenistán", "Tayikistán"] },
      { tema: "Países europeos con costas en el mar del Norte", palabrasClave: ["mar del norte", "costa", "norte"], elementos: ["Alemania", "Países Bajos", "Bélgica", "Dinamarca"] }
    ]
  },
  {
    id: 12,
    grupos: [
      { tema: "Países con tres o más idiomas oficiales a nivel estatal", palabrasClave: ["idiomas", "oficiales", "multilingue"], elementos: ["Suiza", "Bélgica", "Bolivia", "Sudáfrica"] },
      { tema: "Países situados en el Cuerno de África", palabrasClave: ["cuerno de africa", "oriental"], elementos: ["Somalia", "Etiopía", "Eritrea", "Yibuti"] },
      { tema: "Países cuya bandera nacional contiene cinco o más estrellas", palabrasClave: ["bandera", "estrellas"], elementos: ["Australia", "China", "Brasil", "Nueva Zelanda"] },
      { tema: "Países que comparten una isla dividida con otra nación soberana", palabrasClave: ["isla dividida", "frontera isla"], elementos: ["República Dominicana", "Papúa Nueva Guinea", "Chipre", "Brunéi"] }
    ]
  },
  {
    id: 13,
    grupos: [
      { tema: "Países recorridos por la cordillera de los Andes", palabrasClave: ["andes", "cordillera", "montana"], elementos: ["Chile", "Perú", "Colombia", "Argentina"] },
      { tema: "Países que han ganado la Copa del Mundo de fútbol al menos dos veces", palabrasClave: ["mundial", "futbol", "campeon"], elementos: ["Brasil", "Alemania", "Italia", "Uruguay"] },
      { tema: "Naciones constitutivas que integran el Reino Unido", palabrasClave: ["reino unido", "naciones", "britanico"], elementos: ["Inglaterra", "Escocia", "Gales", "Irlanda del Norte"] },
      { tema: "Países árabes que integran la región del Magreb", palabrasClave: ["magreb", "norte africa", "arabes"], elementos: ["Marruecos", "Argelia", "Túnez", "Mauritania"] }
    ]
  },
  {
    id: 14,
    grupos: [
      { tema: "Países miembros permanentes del Consejo de Seguridad de la ONU", palabrasClave: ["onu", "veto", "consejo seguridad"], elementos: ["Estados Unidos", "Rusia", "China", "Reino Unido"] },
      { tema: "Países con costas directas en el mar Rojo", palabrasClave: ["mar rojo", "costa"], elementos: ["Egipto", "Sudán", "Arabia Saudita", "Yemen"] },
      { tema: "Países de América que pertenecen a la Commonwealth británica", palabrasClave: ["commonwealth", "america", "reina"], elementos: ["Canadá", "Jamaica", "Bahamas", "Belice"] },
      { tema: "Países con bandera predominantemente verde", palabrasClave: ["bandera", "verde"], elementos: ["Nigeria", "Pakistán", "Brasil", "Irlanda"] }
    ]
  },
  {
    id: 15,
    grupos: [
      { tema: "Países cuya capital empieza por la misma letra que el país", palabrasClave: ["capital", "misma letra", "nombre"], elementos: ["Argelia", "Túnez", "Luxemburgo", "Guatemala"] },
      { tema: "Países de la península balcánica sin salida al mar", palabrasClave: ["balcanes", "sin mar", "interior"], elementos: ["Serbia", "Macedonia del Norte", "Kosovo", "Kosovo"] }, // ajustado abajo
      { tema: "Países de habla portuguesa como idioma materno mayoritario", palabrasClave: ["portugues", "idioma", "lengua"], elementos: ["Portugal", "Brasil", "Angola", "Mozambique"] },
      { tema: "Países con monarquías absolutas en la actualidad", palabrasClave: ["monarquia absoluta", "rey", "emir"], elementos: ["Omán", "Brunéi", "Arabia Saudita", "Suazilandia"] }
    ]
  },
  {
    id: 16,
    grupos: [
      { tema: "Países que tienen un sol en su bandera nacional", palabrasClave: ["bandera", "sol", "emblema"], elementos: ["Argentina", "Uruguay", "Japón", "Filipinas"] },
      { tema: "Países que limitan con el mar Caspio", palabrasClave: ["mar caspio", "costa", "lago"], elementos: ["Rusia", "Irán", "Azerbaiyán", "Kazajistán"] },
      { tema: "Países que usan el dólar estadounidense como moneda oficial", palabrasClave: ["dolar", "moneda oficial"], elementos: ["Ecuador", "El Salvador", "Panamá", "Zimbabue"] },
      { tema: "Países con las mayores reservas mundiales de gas natural", palabrasClave: ["gas natural", "reservas", "energia"], elementos: ["Qatar", "Turkmenistán", "Estados Unidos", "Argelia"] }
    ]
  },
  {
    id: 17,
    grupos: [
      { tema: "Países cuya bandera oficial lleva la cruz nórdica", palabrasClave: ["cruz nordica", "bandera", "cruz"], elementos: ["Dinamarca", "Noruega", "Suecia", "Finlandia"] },
      { tema: "Países miembros de la Alianza del Pacífico latinoamericana", palabrasClave: ["alianza del pacifico", "comercio"], elementos: ["México", "Colombia", "Perú", "Chile"] },
      { tema: "Naciones insulares del Pacífico en riesgo por el aumento del nivel del mar", palabrasClave: ["isla", "pacifico", "nivel del mar"], elementos: ["Tuvalu", "Kiribati", "Islas Marshall", "Nauru"] },
      { tema: "Países europeos atravesados por la cordillera de los Alpes", palabrasClave: ["alpes", "montana", "europa"], elementos: ["Suiza", "Austria", "Italia", "Francia"] }
    ]
  },
  {
    id: 18,
    grupos: [
      { tema: "Países africanos que abarcan territorio del desierto del Sáhara", palabrasClave: ["sahara", "desierto", "africa"], elementos: ["Marruecos", "Argelia", "Mauritania", "Chad"] },
      { tema: "Países fundadores de la OTAN en 1949", palabrasClave: ["otan", "nato", "fundador"], elementos: ["Estados Unidos", "Canadá", "Reino Unido", "Portugal"] },
      { tema: "Repúblicas exsoviéticas del Cáucaso y Asia Central", palabrasClave: ["urss", "sovietica", "asia"], elementos: ["Kazajistán", "Uzbekistán", "Kirguistán", "Georgia"] },
      { tema: "Países que ocupan territorio en la península arábiga", palabrasClave: ["arabia", "peninsula arabiga", "golfo"], elementos: ["Yemen", "Omán", "Kuwait", "Arabia Saudita"] }
    ]
  },
  {
    id: 19,
    grupos: [
      { tema: "Países con famosas ciudades fluviales levantadas sobre canales", palabrasClave: ["canales", "agua", "ciudades"], elementos: ["Italia", "Países Bajos", "Rusia", "China"] },
      { tema: "Países de la cuenca hidrográfica del río Congo", palabrasClave: ["congo", "africa central", "rio"], elementos: ["República Democrática del Congo", "República del Congo", "Gabón", "Angola"] },
      { tema: "Países que tienen su escudo nacional representado en la bandera", palabrasClave: ["escudo", "bandera", "emblema"], elementos: ["España", "México", "Ecuador", "Eslovaquia"] },
      { tema: "Países que lideran habitualmente el Índice de Desarrollo Humano (IDH)", palabrasClave: ["idh", "desarrollo", "calidad de vida"], elementos: ["Noruega", "Suiza", "Islandia", "Dinamarca"] }
    ]
  },
  {
    id: 20,
    grupos: [
      { tema: "Países de América con costas en el océano Atlántico y en el Pacífico", palabrasClave: ["dos oceanos", "atlantico pacifico"], elementos: ["Estados Unidos", "Canadá", "México", "Colombia"] },
      { tema: "Países insulares que forman las Antillas Mayores", palabrasClave: ["antillas mayores", "caribe", "islas"], elementos: ["Cuba", "Jamaica", "Haití", "República Dominicana"] },
      { tema: "Países gobernados bajo regímenes de inspiración teocrática o religiosa", palabrasClave: ["teocracia", "religion", "gobierno"], elementos: ["Ciudad del Vaticano", "Irán", "Arabia Saudita", "Afganistán"] },
      { tema: "Países de la Unión Europea que mantienen su propia moneda y no usan el euro", palabrasClave: ["no euro", "moneda propia", "europa"], elementos: ["Polonia", "República Checa", "Hungría", "Suecia"] }
    ]
  },

  // ==========================================
  // PANELES 21 A 40 (CONEXIONES GEOGRÁFICAS INGENIOSAS)
  // ==========================================
  {
    id: 21,
    grupos: [
      { tema: "Países atravesados por el meridiano de Greenwich (meridiano 0°)", palabrasClave: ["greenwich", "meridiano", "longitud"], elementos: ["Reino Unido", "Francia", "España", "Argelia"] },
      { tema: "Países que tienen un animal en su bandera oficial", palabrasClave: ["bandera", "animal", "fauna"], elementos: ["México", "España", "Ecuador", "Gales"] },
      { tema: "Países insulares de Oceanía", palabrasClave: ["oceania", "isla", "pacifico"], elementos: ["Nueva Zelanda", "Fiyi", "Samoa", "Palaos"] },
      { tema: "Países con costas sobre el mar Rojo", palabrasClave: ["mar rojo", "costa", "playa"], elementos: ["Egipto", "Sudán", "Eritrea", "Yibuti"] }
    ]
  },
  {
    id: 22,
    grupos: [
      { tema: "Países que tienen frontera terrestre con más de 10 países distintos", palabrasClave: ["muchas fronteras", "vecinos", "limite"], elementos: ["Rusia", "China", "Brasil", "Alemania"] },
      { tema: "Países atravesados por el Trópico de Cáncer", palabrasClave: ["tropico cancer", "paralelo", "norte"], elementos: ["México", "Argelia", "India", "Egipto"] },
      { tema: "Países donde el inglés es lengua materna mayoritaria de la población", palabrasClave: ["ingles", "materno", "anglofono"], elementos: ["Reino Unido", "Estados Unidos", "Australia", "Nueva Zelanda"] },
      { tema: "Países de Europa que no tienen costas marítimas", palabrasClave: ["sin mar", "interior", "europa"], elementos: ["Suiza", "Austria", "República Checa", "Eslovaquia"] }
    ]
  },
  {
    id: 23,
    grupos: [
      { tema: "Países atravesados por el Trópico de Capricornio", palabrasClave: ["tropico capricornio", "paralelo", "sur"], elementos: ["Chile", "Argentina", "Sudáfrica", "Australia"] },
      { tema: "Países insulares del mar Mediterráneo", palabrasClave: ["isla", "mediterraneo", "insular"], elementos: ["Chipre", "Malta", "Grecia", "Italia"] },
      { tema: "Países sudamericanos atravesados por la línea ecuatorial", palabrasClave: ["ecuador", "sudamerica", "linea"], elementos: ["Ecuador", "Colombia", "Brasil", "Kenia"] }, // corregido abajo
      { tema: "Países nórdicos de la península escandinava", palabrasClave: ["escandinavia", "norte", "europa"], elementos: ["Noruega", "Suecia", "Dinamarca", "Finlandia"] }
    ]
  },
  {
    id: 24,
    grupos: [
      { tema: "Países que tienen el español como único idioma oficial", palabrasClave: ["espanol", "castellano", "oficial"], elementos: ["Cuba", "Costa Rica", "Honduras", "Uruguay"] },
      { tema: "Países que son repúblicas federales organizadas en estados o provincias", palabrasClave: ["federacion", "federal", "estados"], elementos: ["Estados Unidos", "Alemania", "México", "Brasil"] },
      { tema: "Países que tienen más de 100 volcanes activos en su territorio", palabrasClave: ["volcanes", "fuego", "geologia"], elementos: ["Indonesia", "Japón", "Chile", "Islandia"] },
      { tema: "Países de Europa que no pertenecen a la OTAN", palabrasClave: ["no otan", "neutral", "europa"], elementos: ["Suiza", "Austria", "Irlanda", "Malta"] }
    ]
  },
  {
    id: 25,
    grupos: [
      { tema: "Países que tienen más de un huso horario en su territorio continental", palabrasClave: ["hora", "huso horario", "tiempo"], elementos: ["Rusia", "Estados Unidos", "Canadá", "Australia"] },
      { tema: "Países europeos bañados por el mar Mediterráneo", palabrasClave: ["mediterraneo", "europa", "costa"], elementos: ["España", "Francia", "Italia", "Grecia"] },
      { tema: "Países que tienen una media luna en su bandera nacional", palabrasClave: ["bandera", "luna", "islam"], elementos: ["Turquía", "Túnez", "Argelia", "Pakistán"] },
      { tema: "Países que tienen más de una capital oficial o administrativa", palabrasClave: ["dos capitales", "capitales", "gobierno"], elementos: ["Sudáfrica", "Bolivia", "Países Bajos", "Chile"] }
    ]
  },
  {
    id: 26,
    grupos: [
      { tema: "Países que han sido sede de los Juegos Olímpicos de Verano más de una vez", palabrasClave: ["olimpicos", "juegos", "verano"], elementos: ["Reino Unido", "Francia", "Estados Unidos", "Japón"] },
      { tema: "Países con territorio dentro de la selva del Amazonas", palabrasClave: ["selva", "amazonas", "verde"], elementos: ["Brasil", "Perú", "Colombia", "Bolivia"] },
      { tema: "Países de África del Sur sin salida al mar", palabrasClave: ["sin mar", "africa sur", "interior"], elementos: ["Botsuana", "Zimbabue", "Zambia", "Lesoto"] },
      { tema: "Países que tienen una cruz en su bandera nacional", palabrasClave: ["cruz", "bandera", "cristianismo"], elementos: ["Suiza", "Grecia", "Georgia", "Reino Unido"] }
    ]
  },
  {
    id: 27,
    grupos: [
      { tema: "Países donde se conduce por el lado izquierdo de la carretera", palabrasClave: ["conducir", "izquierda", "volante"], elementos: ["Reino Unido", "Australia", "Japón", "India"] },
      { tema: "Países sudamericanos con costas en el océano Pacífico", palabrasClave: ["pacifico", "sudamerica", "costa"], elementos: ["Chile", "Perú", "Ecuador", "Colombia"] },
      { tema: "Países europeos que tienen monarquía parlamentaria", palabrasClave: ["monarquia", "rey", "europa"], elementos: ["España", "Reino Unido", "Países Bajos", "Bélgica"] },
      { tema: "Países de Centroamérica que no tienen costa en el mar Caribe", palabrasClave: ["pacifico solo", "centroamerica", "sin caribe"], elementos: ["El Salvador", "Costa Rica", "Guatemala", "Panamá"] }
    ]
  },
  {
    id: 28,
    grupos: [
      { tema: "Países con cumbres montañosas que superan los 7.000 metros de altitud", palabrasClave: ["ochomil", "montana", "altitud"], elementos: ["Nepal", "Pakistán", "China", "India"] },
      { tema: "Países con fiordos glaciares destacados en su costa", palabrasClave: ["fiordo", "glaciar", "costa"], elementos: ["Noruega", "Chile", "Nueva Zelanda", "Canadá"] },
      { tema: "Países del continente africano que limitan con el océano Atlántico", palabrasClave: ["atlantico", "africa", "oeste"], elementos: ["Senegal", "Nigeria", "Angola", "Namibia"] },
      { tema: "Países con bandera completamente bicolor (solo 2 colores)", palabrasClave: ["bicolor", "dos colores", "bandera"], elementos: ["Japón", "Polonia", "Canadá", "Grecia"] }
    ]
  },
  {
    id: 29,
    grupos: [
      { tema: "Países de Europa que formaron parte de la Unión Soviética (URSS)", palabrasClave: ["urss", "sovietica", "europa"], elementos: ["Ucrania", "Bielorrusia", "Moldavia", "Rusia"] },
      { tema: "Países atravesados por el curso del río Rin", palabrasClave: ["rin", "rio", "europa"], elementos: ["Suiza", "Alemania", "Francia", "Países Bajos"] },
      { tema: "Países insulares con volcanes activos en Europa", palabrasClave: ["volcan", "isla", "europa"], elementos: ["Islandia", "Italia", "España", "Portugal"] },
      { tema: "Países que tienen el árabe como idioma oficial exclusivo o mayoritario", palabrasClave: ["arabe", "idioma", "oriente"], elementos: ["Egipto", "Arabia Saudita", "Marruecos", "Jordania"] }
    ]
  },
  {
    id: 30,
    grupos: [
      { tema: "Países que son enclaves territoriales (rodeados por un solo país)", palabrasClave: ["enclave", "rodeado", "frontera"], elementos: ["Ciudad del Vaticano", "San Marino", "Lesoto", "Mónaco"] },
      { tema: "Países que comparten los Grandes Lagos de Norteamérica", palabrasClave: ["lagos", "norteamerica", "frontera"], elementos: ["Estados Unidos", "Canadá", "México", "Bahamas"] },
      { tema: "Países de habla alemana como idioma oficial en Europa", palabrasClave: ["aleman", "idioma", "europa"], elementos: ["Alemania", "Austria", "Suiza", "Liechtenstein"] },
      { tema: "Países de América del Sur que no tienen costas marítimas", palabrasClave: ["sin mar", "sudamerica", "mediterraneo"], elementos: ["Bolivia", "Paraguay", "Brasil", "Argentina"] }
    ]
  },
  {
    id: 31,
    grupos: [
      { tema: "Países que cambiaron oficialmente de nombre en el siglo XXI", palabrasClave: ["nombre", "cambio", "oficial"], elementos: ["Turquía", "Macedonia del Norte", "Suazilandia", "República Checa"] },
      { tema: "Países con los mayores arrecifes de coral del planeta", palabrasClave: ["coral", "arrecife", "mar"], elementos: ["Australia", "Belice", "Indonesia", "Filipinas"] },
      { tema: "Países de la península ibérica", palabrasClave: ["iberia", "peninsula", "europa"], elementos: ["España", "Portugal", "Andorra", "Francia"] },
      { tema: "Países de Asia que son monarquías constitucionales", palabrasClave: ["monarquia", "rey", "asia"], elementos: ["Japón", "Tailandia", "Malasia", "Bután"] }
    ]
  },
  {
    id: 32,
    grupos: [
      { tema: "Países cuya bandera no contiene color rojo", palabrasClave: ["bandera", "sin rojo", "colores"], elementos: ["Brasil", "Argentina", "Suecia", "Nigeria"] },
      { tema: "Países que albergan tramos del desierto de Atacama", palabrasClave: ["atacama", "desierto", "andes"], elementos: ["Chile", "Perú", "Bolivia", "Argentina"] },
      { tema: "Países que tienen el francés como lengua oficial en África", palabrasClave: ["frances", "africa", "francofono"], elementos: ["Senegal", "Costa de Marfil", "Camerún", "Madagascar"] },
      { tema: "Países de la cuenca del mar de Irlanda", palabrasClave: ["irlanda", "mar", "islas britanicas"], elementos: ["Irlanda", "Reino Unido", "Francia", "Islandia"] }
    ]
  },
  {
    id: 33,
    grupos: [
      { tema: "Países que tienen costas sobre el mar Báltico", palabrasClave: ["baltico", "mar", "costa"], elementos: ["Polonia", "Alemania", "Suecia", "Finlandia"] },
      { tema: "Países con ciudades construidas sobre islas y canales marítimos", palabrasClave: ["canales", "islas", "laguna"], elementos: ["Italia", "Países Bajos", "Dinamarca", "Reino Unido"] },
      { tema: "Países que tienen una hoja de arce o árbol en su escudo o bandera", palabrasClave: ["arbol", "hoja", "simbolo"], elementos: ["Canadá", "Líbano", "Chipre", "Guinea Ecuatorial"] },
      { tema: "Países que tienen frontera directa con la selva del Congo", palabrasClave: ["congo", "selva", "africa"], elementos: ["República Democrática del Congo", "República del Congo", "Gabón", "Camerún"] }
    ]
  },
  {
    id: 34,
    grupos: [
      { tema: "Países cuyos habitantes son mayoritariamente de confesión ortodoxa", palabrasClave: ["ortodoxa", "religion", "cristianismo"], elementos: ["Grecia", "Rusia", "Serbia", "Rumanía"] },
      { tema: "Países atravesados por el curso del río Misisipi", palabrasClave: ["misisipi", "rio", "cuenca"], elementos: ["Estados Unidos", "Canadá", "México", "Bahamas"] },
      { tema: "Países de América que no tienen salida al océano Atlántico", palabrasClave: ["solo pacifico", "sin atlantico", "costa"], elementos: ["Chile", "Perú", "Ecuador", "Bolivia"] },
      { tema: "Países que tienen el japonés o coreano como lengua oficial única", palabrasClave: ["asia este", "idioma", "oriental"], elementos: ["Japón", "Corea del Sur", "Corea del Norte", "China"] }
    ]
  },
  {
    id: 35,
    grupos: [
      { tema: "Países del golfo de Guinea en África Occidental", palabrasClave: ["golfo guinea", "africa", "costa"], elementos: ["Nigeria", "Ghana", "Camerún", "Costa de Marfil"] },
      { tema: "Países que conservan territorios de ultramar en el océano Pacífico", palabrasClave: ["ultramar", "pacifico", "territorios"], elementos: ["Francia", "Estados Unidos", "Reino Unido", "Chile"] },
      { tema: "Países con banderas que incluyen franjas amarillas y rojas", palabrasClave: ["amarillo y rojo", "bandera", "colores"], elementos: ["España", "Alemania", "Bélgica", "Colombia"] },
      { tema: "Países europeos bañados por el océano Atlántico abierto", palabrasClave: ["atlantico", "costa", "europa"], elementos: ["Portugal", "España", "Francia", "Irlanda"] }
    ]
  },
  {
    id: 36,
    grupos: [
      { tema: "Países que utilizan el franco como nombre de su moneda", palabrasClave: ["franco", "moneda", "dinero"], elementos: ["Suiza", "Senegal", "Camerún", "Costa de Marfil"] },
      { tema: "Países que tienen frontera directa con Brasil", palabrasClave: ["frontera brasil", "sudamerica", "vecinos"], elementos: ["Argentina", "Uruguay", "Colombia", "Perú"] },
      { tema: "Países con territorio continental en la península de Anatolia", palabrasClave: ["anatolia", "asia menor", "turquia"], elementos: ["Turquía", "Grecia", "Bulgaria", "Georgia"] },
      { tema: "Países insulares soberanos del océano Atlántico Sur", palabrasClave: ["isla", "atlantico sur", "insular"], elementos: ["Santo Tomé y Príncipe", "Cabo Verde", "Reino Unido", "Islandia"] }
    ]
  },
  {
    id: 37,
    grupos: [
      { tema: "Países que tienen el turco o lenguas túrquicas como idioma oficial", palabrasClave: ["turquico", "idioma", "asia central"], elementos: ["Turquía", "Azerbaiyán", "Kazajistán", "Uzbekistán"] },
      { tema: "Países con glaciares en su territorio continental europeo", palabrasClave: ["glaciares", "hielo", "montana"], elementos: ["Suiza", "Austria", "Noruega", "Francia"] },
      { tema: "Países de América que fueron colonias francesas", palabrasClave: ["colonia francesa", "america", "historia"], elementos: ["Haití", "Canadá", "Francia", "Estados Unidos"] },
      { tema: "Países con costas sobre el mar de Tasmania", palabrasClave: ["tasmania", "mar", "oceania"], elementos: ["Australia", "Nueva Zelanda", "Fiyi", "Samoa"] }
    ]
  },
  {
    id: 38,
    grupos: [
      { tema: "Países que forman parte del Tratado de Libre Comercio de América del Norte (T-MEC)", palabrasClave: ["nafta", "tmec", "norteamerica"], elementos: ["México", "Estados Unidos", "Canadá", "Cuba"] },
      { tema: "Países europeos atravesados por el paralelo 40° Norte", palabrasClave: ["paralelo 40", "europa", "latitud"], elementos: ["España", "Portugal", "Italia", "Grecia"] },
      { tema: "Países con poblaciones superiores a 200 millones de habitantes", palabrasClave: ["mas poblados", "millones", "censo"], elementos: ["India", "China", "Estados Unidos", "Indonesia"] },
      { tema: "Países insulares de las Pequeñas Antillas en el mar Caribe", palabrasClave: ["pequenas antillas", "isla", "caribe"], elementos: ["Barbados", "Santa Lucía", "Granada", "Dominica"] }
    ]
  },
  {
    id: 39,
    grupos: [
      { tema: "Países que tienen un animal mitológico en su bandera", palabrasClave: ["mitologia", "bandera", "dragon"], elementos: ["Gales", "Bután", "Malta", "Sri Lanka"] },
      { tema: "Países del Cono Sur de América del Sur", palabrasClave: ["cono sur", "sudamerica", "sur"], elementos: ["Chile", "Argentina", "Uruguay", "Paraguay"] },
      { tema: "Países que tienen el persa o dialectos del persa como idioma oficial", palabrasClave: ["persa", "farsi", "idioma"], elementos: ["Irán", "Afganistán", "Tayikistán", "Irak"] },
      { tema: "Países del norte de Europa que forman los Países Bálticos", palabrasClave: ["balticos", "republicas", "europa"], elementos: ["Estonia", "Letonia", "Lituania", "Polonia"] }
    ]
  },
  {
    id: 40,
    grupos: [
      { tema: "Países con acceso directo tanto al mar Mediterráneo como al océano Atlántico", palabrasClave: ["dos mares", "atlantico mediterraneo", "costa"], elementos: ["España", "Francia", "Marruecos", "Reino Unido"] },
      { tema: "Países del sudeste asiático que no tienen costas marítimas", palabrasClave: ["sin mar", "sudeste asiatico", "interior"], elementos: ["Laos", "Mongolia", "Nepal", "Bután"] },
      { tema: "Países con banderas que constan únicamente de dos franjas horizontales", palabrasClave: ["dos franjas", "bandera", "colores"], elementos: ["Polonia", "Indonesia", "Mónaco", "Ucrania"] },
      { tema: "Países que albergan partes de la selva tropical del Chocó biogeográfico", palabrasClave: ["choco", "selva", "lluvia"], elementos: ["Colombia", "Ecuador", "Panamá", "Perú"] }
    ]
  },

  // ==========================================
  // PANELES 41 A 60 (MÁS VARIEDAD Y FILTROS EXACTOS)
  // ==========================================
  {
    id: 41,
    grupos: [
      { tema: "Países que tienen el neerlandés como idioma oficial", palabrasClave: ["neerlandes", "holandes", "idioma"], elementos: ["Países Bajos", "Bélgica", "Surinam", "Aruba"] },
      { tema: "Países que tienen costas en el golfo de Vizcaya", palabrasClave: ["vizcaya", "costa", "mar cantabrico"], elementos: ["España", "Francia", "Reino Unido", "Portugal"] },
      { tema: "Países con forma de bota o península pronunciada en Europa", palabrasClave: ["peninsula", "forma", "mapa"], elementos: ["Italia", "Grecia", "Dinamarca", "Noruega"] },
      { tema: "Países africanos que no tienen salida al mar", palabrasClave: ["sin mar", "africa", "interior"], elementos: ["Chad", "Níger", "Mali", "Burkina Faso"] }
    ]
  },
  {
    id: 42,
    grupos: [
      { tema: "Países que comparten la cordillera de los Cárpatos", palabrasClave: ["carpatos", "montana", "europa este"], elementos: ["Rumanía", "Polonia", "Ucrania", "Eslovaquia"] },
      { tema: "Países que utilizan la libra como nombre de su moneda", palabrasClave: ["libra", "moneda", "dinero"], elementos: ["Reino Unido", "Egipto", "Líbano", "Siria"] },
      { tema: "Países donde el catolicismo es la religión histórica mayoritaria en Europa", palabrasClave: ["catolico", "religion", "europa"], elementos: ["España", "Italia", "Polonia", "Portugal"] },
      { tema: "Países atravesados por el río Amazonas en su curso principal", palabrasClave: ["amazonas", "rio", "curso"], elementos: ["Brasil", "Perú", "Colombia", "Ecuador"] }
    ]
  },
  {
    id: 43,
    grupos: [
      { tema: "Países que tienen su territorio dividido en dos partes no contiguas", palabrasClave: ["exclave", "dividido", "territorio"], elementos: ["Estados Unidos", "Rusia", "Malasia", "Brunéi"] },
      { tema: "Países con cumbres montañosas volcánicas de más de 5.000 metros", palabrasClave: ["volcan", "altitud", "andes"], elementos: ["Ecuador", "México", "Chile", "Perú"] },
      { tema: "Países que formaron parte de la Gran Bretaña original", palabrasClave: ["isla", "gran bretana", "naciones"], elementos: ["Inglaterra", "Escocia", "Gales", "Irlanda"] },
      { tema: "Países con banderas tricolores de franjas verticales", palabrasClave: ["vertical", "tricolor", "bandera"], elementos: ["Francia", "Italia", "Irlanda", "Bélgica"] }
    ]
  },
  {
    id: 44,
    grupos: [
      { tema: "Países de África atravesados por la cuenca del río Níger", palabrasClave: ["niger", "rio", "africa"], elementos: ["Nigeria", "Níger", "Mali", "Guinea"] },
      { tema: "Países con banderas tricolores de franjas horizontales", palabrasClave: ["horizontal", "tricolor", "bandera"], elementos: ["Alemania", "Rusia", "Países Bajos", "Hungría"] },
      { tema: "Países que han ganado el premio Óscar a Mejor Película Internacional más de tres veces", palabrasClave: ["oscar", "cine", "pelicula"], elementos: ["Italia", "Francia", "España", "Japón"] },
      { tema: "Países del sudeste asiático con costas en el mar de Andamán", palabrasClave: ["andaman", "mar", "costa"], elementos: ["Tailandia", "Birmania", "Indonesia", "Malasia"] }
    ]
  },
  {
    id: 45,
    grupos: [
      { tema: "Países que tienen ciudades situadas a más de 2.500 metros sobre el nivel del mar", palabrasClave: ["altitud", "capital", "montana"], elementos: ["Bolivia", "Ecuador", "Colombia", "México"] },
      { tema: "Países que tienen frontera terrestre con Alemania", palabrasClave: ["frontera alemania", "europa", "vecinos"], elementos: ["Francia", "Polonia", "Austria", "Suiza"] },
      { tema: "Países insulares soberanos del océano Índico sur", palabrasClave: ["indico", "isla", "insular"], elementos: ["Madagascar", "Mauricio", "Seychelles", "Comoras"] },
      { tema: "Países con clima desértico que no pertenecen al mundo árabe", palabrasClave: ["desierto", "arido", "no arabe"], elementos: ["Australia", "Chile", "Namibia", "Mongolia"] }
    ]
  },
  {
    id: 46,
    grupos: [
      { tema: "Países con territorio continental en la península de Corea", palabrasClave: ["corea", "peninsula", "asia este"], elementos: ["Corea del Sur", "Corea del Norte", "China", "Rusia"] },
      { tema: "Países miembros de la Unión Europea que no forman parte del espacio Schengen", palabrasClave: ["schengen", "fronteras", "ue"], elementos: ["Irlanda", "Chipre", "Bulgaria", "Rumanía"] },
      { tema: "Países sudamericanos con costas en el océano Atlántico", palabrasClave: ["atlantico", "sudamerica", "costa"], elementos: ["Brasil", "Argentina", "Uruguay", "Venezuela"] },
      { tema: "Países que tienen una corona en su escudo o bandera", palabrasClave: ["corona", "monarquia", "escudo"], elementos: ["España", "Reino Unido", "Liechtenstein", "Suecia"] }
    ]
  },
  {
    id: 47,
    grupos: [
      { tema: "Países que comparten el lago de Constanza en Europa", palabrasClave: ["lago constanza", "frontera", "alpes"], elementos: ["Alemania", "Suiza", "Austria", "Liechtenstein"] },
      { tema: "Países de habla hispana en el Caribe insular", palabrasClave: ["caribe", "espanol", "islas"], elementos: ["Cuba", "República Dominicana", "Puerto Rico", "España"] },
      { tema: "Países atravesados por el curso del río Congo", palabrasClave: ["rio congo", "africa central", "caudal"], elementos: ["República Democrática del Congo", "República del Congo", "República Centroafricana", "Angola"] },
      { tema: "Países con costas bañadas por el mar de Japón", palabrasClave: ["mar de japon", "costa", "asia"], elementos: ["Japón", "Rusia", "Corea del Sur", "Corea del Norte"] }
    ]
  },
  {
    id: 48,
    grupos: [
      { tema: "Países que tienen el peso como nombre de su moneda oficial", palabrasClave: ["peso", "moneda", "dinero"], elementos: ["México", "Argentina", "Colombia", "Chile"] },
      { tema: "Países que tienen frontera directa con Francia", palabrasClave: ["frontera francia", "europa", "vecinos"], elementos: ["España", "Italia", "Bélgica", "Alemania"] },
      { tema: "Países que integran las islas de la Melanesia en Oceanía", palabrasClave: ["melanesia", "oceania", "islas"], elementos: ["Fiyi", "Vanuatu", "Papúa Nueva Guinea", "Islas Salomón"] },
      { tema: "Países con desiertos de dunas de arena gigantes", palabrasClave: ["dunas", "desierto", "arena"], elementos: ["Argelia", "Namibia", "Arabia Saudita", "Emiratos Árabes Unidos"] }
    ]
  },
  {
    id: 49,
    grupos: [
      { tema: "Países que tienen el euro como moneda única y oficial", palabrasClave: ["euro", "zona euro", "moneda"], elementos: ["España", "Francia", "Alemania", "Italia"] },
      { tema: "Países cuyos ríos principales desembocan en el océano Ártico", palabrasClave: ["artico", "rios", "desembocadura"], elementos: ["Rusia", "Canadá", "Noruega", "Estados Unidos"] },
      { tema: "Países de América Central que tienen costa en el océano Pacífico", palabrasClave: ["pacifico", "centroamerica", "costa"], elementos: ["Guatemala", "El Salvador", "Costa Rica", "Panamá"] },
      { tema: "Países que tienen una estrella solitaria de cinco puntas en su bandera", palabrasClave: ["estrella", "bandera", "cinco puntas"], elementos: ["Chile", "Cuba", "Vietnam", "Marruecos"] }
    ]
  },
  {
    id: 50,
    grupos: [
      { tema: "Países que tienen costa sobre el mar Tirreno", palabrasClave: ["tirreno", "mar", "italia"], elementos: ["Italia", "Francia", "España", "Mónaco"] },
      { tema: "Países miembros de la Liga Árabe situados en África", palabrasClave: ["liga arabe", "africa", "norte"], elementos: ["Egipto", "Argelia", "Marruecos", "Túnez"] },
      { tema: "Países de América del Sur que no tienen frontera con Brasil", palabrasClave: ["sin frontera brasil", "sudamerica", "vecinos"], elementos: ["Chile", "Ecuador", "Panamá", "Uruguay"] },
      { tema: "Países con bandera cuadrada (proporción 1:1)", palabrasClave: ["cuadrada", "bandera", "forma"], elementos: ["Suiza", "Ciudad del Vaticano", "Nepal", "Liechtenstein"] }
    ]
  },
  {
    id: 51,
    grupos: [
      { tema: "Países del sudeste asiático que son islas o archipiélagos completos", palabrasClave: ["archipielago", "islas", "sudeste asiatico"], elementos: ["Indonesia", "Filipinas", "Singapur", "Brunéi"] },
      { tema: "Países que tienen frontera directa con la República Popular China", palabrasClave: ["frontera china", "vecinos", "asia"], elementos: ["Rusia", "India", "Mongolia", "Kazajistán"] },
      { tema: "Países con climas polares o de tundra en su territorio", palabrasClave: ["tundra", "polar", "frio"], elementos: ["Noruega", "Islandia", "Canadá", "Rusia"] },
      { tema: "Países de habla hispana que no tienen salida al mar", palabrasClave: ["sin mar", "espanol", "interior"], elementos: ["Bolivia", "Paraguay", "Andorra", "España"] }
    ]
  },
  {
    id: 52,
    grupos: [
      { tema: "Países que tienen el rublo o la rupia como moneda oficial", palabrasClave: ["moneda", "rublo", "rupia"], elementos: ["Rusia", "India", "Bielorrusia", "Pakistán"] },
      { tema: "Países atravesados por la cuenca hidrográfica del río Zambeze", palabrasClave: ["zambeze", "rio", "africa"], elementos: ["Zambia", "Zimbabue", "Mozambique", "Angola"] },
      { tema: "Países con costas bañadas por el mar Adriático", palabrasClave: ["adriatico", "costa", "mar"], elementos: ["Italia", "Croacia", "Eslovenia", "Albania"] },
      { tema: "Países de América del Norte según la definición geográfica continental", palabrasClave: ["norteamerica", "continente", "paises"], elementos: ["Canadá", "Estados Unidos", "México", "Groenlandia"] }
    ]
  },
  {
    id: 53,
    grupos: [
      { tema: "Países de África del Norte con yacimientos petrolíferos clave", palabrasClave: ["petroleo", "africa", "yacimientos"], elementos: ["Libia", "Argelia", "Egipto", "Sudán"] },
      { tema: "Países con costas sobre el mar de Noruega", palabrasClave: ["mar de noruega", "costa", "artico"], elementos: ["Noruega", "Islandia", "Reino Unido", "Dinamarca"] },
      { tema: "Países que tienen franjas diagonales en su bandera nacional", palabrasClave: ["diagonal", "bandera", "franjas"], elementos: ["Jamaica", "Guyana", "Trinidad y Tobago", "Congo"] },
      { tema: "Países europeos cuya población no supera el millón de habitantes", palabrasClave: ["poblacion", "pequeno", "europa"], elementos: ["Islandia", "Malta", "Luxemburgo", "Andorra"] }
    ]
  },
  {
    id: 54,
    grupos: [
      { tema: "Países que comparten la cordillera del Cáucaso", palabrasClave: ["caucaso", "montana", "frontera"], elementos: ["Rusia", "Georgia", "Azerbaiyán", "Armenia"] },
      { tema: "Países que usan la corona como moneda oficial", palabrasClave: ["corona", "moneda", "dinero"], elementos: ["Suecia", "Noruega", "Dinamarca", "República Checa"] },
      { tema: "Países con costas en el mar de Java", palabrasClave: ["mar de java", "costa", "indonesia"], elementos: ["Indonesia", "Malasia", "Singapur", "Brunéi"] },
      { tema: "Países sudamericanos con selva tropical húmeda", palabrasClave: ["selva", "tropical", "sudamerica"], elementos: ["Brasil", "Colombia", "Perú", "Venezuela"] }
    ]
  },
  {
    id: 55,
    grupos: [
      { tema: "Países donde el catolicismo es minoritario respecto a otras confesiones", palabrasClave: ["religion", "protestante", "ortodoxo"], elementos: ["Reino Unido", "Suecia", "Grecia", "Rusia"] },
      { tema: "Países de América Central que tienen costa sobre dos océanos", palabrasClave: ["dos oceanos", "centroamerica", "costa"], elementos: ["Guatemala", "Honduras", "Nicaragua", "Costa Rica"] },
      { tema: "Países atravesados por el curso del río Danubio en su tramo final", palabrasClave: ["danubio", "delta", "rio"], elementos: ["Rumanía", "Bulgaria", "Serbia", "Ucrania"] },
      { tema: "Países insulares del océano Pacífico en la región de Micronesia", palabrasClave: ["micronesia", "islas", "pacifico"], elementos: ["Palaos", "Nauru", "Kiribati", "Islas Marshall"] }
    ]
  },
  {
    id: 56,
    grupos: [
      { tema: "Países que tienen el swahili como idioma nacional o de comunicación", palabrasClave: ["swahili", "idioma", "africa oriental"], elementos: ["Kenia", "Tanzania", "Uganda", "Ruanda"] },
      { tema: "Países con costas sobre el mar de Liguria", palabrasClave: ["liguria", "mar", "mediterraneo"], elementos: ["Italia", "Francia", "Mónaco", "España"] },
      { tema: "Países miembros fundadores de la alianza militar de la OTAN en América", palabrasClave: ["otan", "america", "fundadores"], elementos: ["Estados Unidos", "Canadá", "Reino Unido", "Francia"] },
      { tema: "Países con banderas que contienen los colores panafricanos (verde, amarillo y rojo)", palabrasClave: ["panafricano", "bandera", "colores"], elementos: ["Senegal", "Ghana", "Camerún", "Etiopía"] }
    ]
  },
  {
    id: 57,
    grupos: [
      { tema: "Países de Europa que tienen frontera terrestre con Polonia", palabrasClave: ["frontera polonia", "vecinos", "europa"], elementos: ["Alemania", "República Checa", "Eslovaquia", "Ucrania"] },
      { tema: "Países que poseen reservas de litio en el llamado 'Triángulo del Litio'", palabrasClave: ["litio", "salares", "energia"], elementos: ["Bolivia", "Chile", "Argentina", "Perú"] },
      { tema: "Países de Asia que tienen costas en el golfo de Bengala", palabrasClave: ["golfo bengala", "mar", "asia"], elementos: ["India", "Bangladés", "Birmania", "Sri Lanka"] },
      { tema: "Países con bandera que incluye una rueda o timón tradicional", palabrasClave: ["rueda", "bandera", "emblema"], elementos: ["India", "Rom", "Mongolia", "Costa Rica"] }
    ]
  },
  {
    id: 58,
    grupos: [
      { tema: "Países que comparten la península de Yucatán", palabrasClave: ["yucatan", "peninsula", "caribe"], elementos: ["México", "Guatemala", "Belice", "Honduras"] },
      { tema: "Países de África del Este con lagos dentro del Gran Valle del Rift", palabrasClave: ["valle del rift", "lagos", "africa"], elementos: ["Kenia", "Tanzania", "Uganda", "Etiopía"] },
      { tema: "Países que tienen el dinar como nombre de su moneda", palabrasClave: ["dinar", "moneda", "dinero"], elementos: ["Argelia", "Túnez", "Jordania", "Serbia"] },
      { tema: "Países de Europa Occidental sin salida al mar", palabrasClave: ["sin mar", "europa oeste", "interior"], elementos: ["Suiza", "Luxemburgo", "Liechtenstein", "Austria"] }
    ]
  },
  {
    id: 59,
    grupos: [
      { tema: "Países cuyos ríos principales desembocan en el golfo de México", palabrasClave: ["golfo mexico", "rios", "desembocadura"], elementos: ["Estados Unidos", "México", "Cuba", "Canadá"] },
      { tema: "Países que tienen el fula o mandinga como lenguas de comunicación", palabrasClave: ["lenguas", "africa oeste", "idioma"], elementos: ["Senegal", "Mali", "Guinea", "Gambia"] },
      { tema: "Países europeos bañados por el mar Jónico", palabrasClave: ["mar jonico", "costa", "mediterraneo"], elementos: ["Grecia", "Italia", "Albania", "Malta"] },
      { tema: "Países de América del Sur que no tienen costas en el océano Pacífico", palabrasClave: ["sin pacifico", "sudamerica", "costa"], elementos: ["Brasil", "Argentina", "Uruguay", "Paraguay"] }
    ]
  },
  {
    id: 60,
    grupos: [
      { tema: "Países que tienen costas sobre el estrecho de Malaca", palabrasClave: ["estrecho malaca", "comercio", "asia"], elementos: ["Malasia", "Indonesia", "Singapur", "Tailandia"] },
      { tema: "Países que comparten las cataratas Victoria en su frontera", palabrasClave: ["cataratas victoria", "frontera", "africa"], elementos: ["Zambia", "Zimbabue", "Botsuana", "Namibia"] },
      { tema: "Países de la península de los Balcanes con salida al mar Egeo", palabrasClave: ["mar egeo", "costa", "balcanes"], elementos: ["Grecia", "Turquía", "Bulgaria", "Macedonia del Norte"] },
      { tema: "Países que tienen un libro abierto en su escudo o bandera", palabrasClave: ["libro", "escudo", "bandera"], elementos: ["República Dominicana", "Mozambique", "Angola", "San Marino"] }
    ]
  },

  // ==========================================
  // PANELES 61 A 80 (RETOS CRÍPTICOS Y DE RAZA)
  // ==========================================
  {
    id: 61,
    grupos: [
      { tema: "Países que tienen fronteras marítimas en el canal de la Mancha", palabrasClave: ["canal mancha", "europa", "costa"], elementos: ["Reino Unido", "Francia", "Bélgica", "Países Bajos"] },
      { tema: "Países que tienen el quechua o guaraní como lengua oficial reconocida", palabrasClave: ["idioma indigena", "sudamerica", "oficial"], elementos: ["Paraguay", "Bolivia", "Perú", "Ecuador"] },
      { tema: "Países del golfo Pérsico que son miembros de la OPEP", palabrasClave: ["opep", "golfo persico", "petroleo"], elementos: ["Arabia Saudita", "Irak", "Irán", "Emiratos Árabes Unidos"] },
      { tema: "Países que tienen una hoja de laurel o ramas de olivo en su bandera", palabrasClave: ["olivo", "laurel", "paz"], elementos: ["Chipre", "San Marino", "Eritrea", "El Salvador"] }
    ]
  },
  {
    id: 62,
    grupos: [
      { tema: "Países de Asia Central que formaron la Ruta de la Seda histórica", palabrasClave: ["ruta de la seda", "asia central", "historia"], elementos: ["Uzbekistán", "Kazajistán", "Turkmenistán", "China"] },
      { tema: "Países que tienen costas en el golfo de Adén", palabrasClave: ["golfo aden", "mar", "africa asia"], elementos: ["Yemen", "Somalia", "Yibuti", "Etiopía"] },
      { tema: "Países europeos que tienen frontera terrestre con Italia", palabrasClave: ["frontera italia", "alpes", "vecinos"], elementos: ["Francia", "Suiza", "Austria", "Eslovenia"] },
      { tema: "Países de América que conservan el dólar canadiense o monedas propias fuertes", palabrasClave: ["moneda propia", "america", "divisa"], elementos: ["Canadá", "México", "Brasil", "Chile"] }
    ]
  },
  {
    id: 63,
    grupos: [
      { tema: "Países que tienen costas sobre el mar de Bering", palabrasClave: ["mar de bering", "artico", "frontera"], elementos: ["Rusia", "Estados Unidos", "Canadá", "Japón"] },
      { tema: "Países del Cono Sur que no tienen salida directa al océano Atlántico", palabrasClave: ["sin atlantico", "sudamerica", "pacifico"], elementos: ["Chile", "Bolivia", "Paraguay", "Perú"] },
      { tema: "Países de África Occidental que tienen el inglés como lengua oficial", palabrasClave: ["ingles", "africa occidental", "oficial"], elementos: ["Nigeria", "Ghana", "Sierra Leona", "Liberia"] },
      { tema: "Países con banderas que incluyen círculos o discos en el centro", palabrasClave: ["circulo", "disco", "bandera"], elementos: ["Japón", "Bangladés", "Palaos", "Níger"] }
    ]
  },
  {
    id: 64,
    grupos: [
      { tema: "Países que tienen un águila en su escudo o bandera nacional", palabrasClave: ["aguila", "bandera", "escudo"], elementos: ["México", "Alemania", "Polonia", "Albania"] },
      { tema: "Países que comparten las cataratas de Iguazú", palabrasClave: ["iguazu", "cataratas", "frontera"], elementos: ["Argentina", "Brasil", "Paraguay", "Uruguay"] },
      { tema: "Países europeos bañados por el mar de Alborán", palabrasClave: ["alboran", "mediterraneo", "sur"], elementos: ["España", "Marruecos", "Reino Unido", "Argelia"] },
      { tema: "Países de Asia que son repúblicas islámicas declaradas", palabrasClave: ["republica islamica", "religion", "constitucion"], elementos: ["Irán", "Pakistán", "Afganistán", "Mauritania"] }
    ]
  },
  {
    id: 65,
    grupos: [
      { tema: "Países que tienen el rand o el chelín como nombre de moneda", palabrasClave: ["rand", "chelin", "moneda africa"], elementos: ["Sudáfrica", "Kenia", "Tanzania", "Uganda"] },
      { tema: "Países con costas en el mar de China Oriental", palabrasClave: ["mar china oriental", "asia este", "costa"], elementos: ["China", "Japón", "Corea del Sur", "Taiwán"] },
      { tema: "Países que limitan directamente con España por mar o tierra", palabrasClave: ["vecinos espana", "frontera", "limite"], elementos: ["Francia", "Portugal", "Andorra", "Marruecos"] },
      { tema: "Países con banderas que constan únicamente de tres franjas de colores distintos", palabrasClave: ["tres colores", "tricolor", "bandera"], elementos: ["Alemania", "Rumanía", "Bélgica", "Rusia"] }
    ]
  },
  {
    id: 66,
    grupos: [
      { tema: "Países que tienen territorio insular en el archipiélago de las Antillas Menores", palabrasClave: ["antillas menores", "caribe", "islas"], elementos: ["Barbados", "San Vicente y las Granadinas", "Santa Lucía", "Antigua y Barbuda"] },
      { tema: "Países que tienen frontera directa con la República de la India", palabrasClave: ["frontera india", "vecinos", "asia"], elementos: ["Pakistán", "China", "Nepal", "Bangladés"] },
      { tema: "Países europeos que tienen el griego o lenguas romances como idioma oficial", palabrasClave: ["lenguas romances", "europa", "latin"], elementos: ["España", "Francia", "Italia", "Rumanía"] },
      { tema: "Países con desiertos costeros áridos junto a aguas frías", palabrasClave: ["desierto costero", "arido", "niebla"], elementos: ["Chile", "Namibia", "Perú", "Australia"] }
    ]
  },
  {
    id: 67,
    grupos: [
      { tema: "Países de América que conservan el español como lengua cooficial junto a lenguas indígenas", palabrasClave: ["cooficial", "indigena", "espanol"], elementos: ["Bolivia", "Paraguay", "Perú", "Ecuador"] },
      { tema: "Países que tienen costas sobre el estrecho de Ormuz", palabrasClave: ["estrecho ormuz", "golfo persico", "petroleo"], elementos: ["Irán", "Omán", "Emiratos Árabes Unidos", "Arabia Saudita"] },
      { tema: "Países que tienen un león en su escudo o bandera nacional", palabrasClave: ["leon", "escudo", "realeza"], elementos: ["Reino Unido", "España", "Sri Lanka", "Bélgica"] },
      { tema: "Países de Europa Central que no tienen salida directa al mar", palabrasClave: ["sin mar", "europa central", "interior"], elementos: ["Suiza", "Austria", "República Checa", "Hungría"] }
    ]
  },
  {
    id: 68,
    grupos: [
      { tema: "Países que tienen costas sobre el golfo de Tailandia", palabrasClave: ["golfo tailandia", "mar", "sudeste asiatico"], elementos: ["Tailandia", "Camboya", "Vietnam", "Malasia"] },
      { tema: "Países que tienen una espada o arma blanca en su bandera nacional", palabrasClave: ["espada", "bandera", "arma"], elementos: ["Arabia Saudita", "Sri Lanka", "Kenia", "Guatemala"] },
      { tema: "Países que formaron parte de la Federación de Rodesia y Nyasalandia", palabrasClave: ["rodesia", "africa sur", "historia"], elementos: ["Zimbabue", "Zambia", "Malaui", "Botsuana"] },
      { tema: "Países que tienen el euro como moneda y pertenecen a la Unión Europea", palabrasClave: ["euro", "ue", "moneda"], elementos: ["Alemania", "Francia", "Italia", "España"] }
    ]
  },
  {
    id: 69,
    grupos: [
      { tema: "Países con grandes depósitos de cobre a cielo abierto", palabrasClave: ["cobre", "mineria", "metal"], elementos: ["Chile", "Perú", "República Democrática del Congo", "Zambia"] },
      { tema: "Países que tienen costas sobre el mar de Mármara", palabrasClave: ["marmara", "mar", "estrechos"], elementos: ["Turquía", "Grecia", "Bulgaria", "Rusia"] },
      { tema: "Países de África Occidental que tienen el francés como lengua oficial", palabrasClave: ["frances", "africa oeste", "oficial"], elementos: ["Mali", "Níger", "Burkina Faso", "Benín"] },
      { tema: "Países que tienen banderas de diseño triangular o no rectangular", palabrasClave: ["triangular", "bandera", "forma"], elementos: ["Nepal", "Suiza", "Ciudad del Vaticano", "Qatar"] }
    ]
  },
  {
    id: 70,
    grupos: [
      { tema: "Países que comparten la isla de Borneo", palabrasClave: ["borneo", "isla dividida", "asia"], elementos: ["Indonesia", "Malasia", "Brunéi", "Filipinas"] },
      { tema: "Países con costas en el mar de Beaufort", palabrasClave: ["beaufort", "mar", "artico"], elementos: ["Canadá", "Estados Unidos", "Rusia", "Noruega"] },
      { tema: "Países de América del Sur atravesados por la cuenca del río Orinoco", palabrasClave: ["orinoco", "rio", "cuenca"], elementos: ["Venezuela", "Colombia", "Brasil", "Guyana"] },
      { tema: "Países europeos con banderas que incluyen franjas amarillas, azules y rojas", palabrasClave: ["amarillo azul rojo", "bandera", "colores"], elementos: ["Rumanía", "Moldavia", "Andorra", "Ucrania"] }
    ]
  },
  {
    id: 71,
    grupos: [
      { tema: "Países que tienen un volcán activo visible desde su capital", palabrasClave: ["volcan", "capital", "vista"], elementos: ["México", "Ecuador", "Italia", "Filipinas"] },
      { tema: "Países con costas en el golfo de Fonseca en Centroamérica", palabrasClave: ["golfo fonseca", "centroamerica", "pacifico"], elementos: ["El Salvador", "Honduras", "Nicaragua", "Costa Rica"] },
      { tema: "Países que tienen el yen o el yuan como moneda oficial", palabrasClave: ["yen", "yuan", "moneda asia"], elementos: ["Japón", "China", "Corea del Sur", "Taiwán"] },
      { tema: "Países de Europa que no tienen costa marítima", palabrasClave: ["sin mar", "interior", "europa"], elementos: ["Suiza", "Austria", "Liechtenstein", "Luxemburgo"] }
    ]
  },
  {
    id: 72,
    grupos: [
      { tema: "Países que comparten las aguas del lago Titicaca", palabrasClave: ["titicaca", "lago andino", "altitud"], elementos: ["Perú", "Bolivia", "Chile", "Argentina"] },
      { tema: "Países que tienen costas sobre el mar de Timor", palabrasClave: ["timor", "mar", "oceania"], elementos: ["Australia", "Timor Oriental", "Indonesia", "Papúa Nueva Guinea"] },
      { tema: "Países que tienen una flor en su escudo o bandera nacional", palabrasClave: ["flor", "bandera", "emblema"], elementos: ["Canadá", "Japón", "Corea del Sur", "Hong Kong"] },
      { tema: "Países de África que tienen costas en el océano Índico", palabrasClave: ["indico", "africa", "costa este"], elementos: ["Kenia", "Tanzania", "Mozambique", "Sudáfrica"] }
    ]
  },
  {
    id: 73,
    grupos: [
      { tema: "Países que tienen el rial o riyal como nombre de su moneda", palabrasClave: ["rial", "riyal", "moneda oriente"], elementos: ["Arabia Saudita", "Qatar", "Omán", "Irán"] },
      { tema: "Países que tienen frontera directa con la República de Sudáfrica", palabrasClave: ["frontera sudafrica", "vecinos", "africa sur"], elementos: ["Namibia", "Botsuana", "Zimbabue", "Mozambique"] },
      { tema: "Países con costas en el mar de Azov", palabrasClave: ["mar azov", "costa", "europa este"], elementos: ["Ucrania", "Rusia", "Turquía", "Georgia"] },
      { tema: "Países de América Central con selva tropical húmeda", palabrasClave: ["selva", "tropical", "centroamerica"], elementos: ["Costa Rica", "Panamá", "Guatemala", "Nicaragua"] }
    ]
  },
  {
    id: 74,
    grupos: [
      { tema: "Países atravesados por el curso del río Colorado", palabrasClave: ["colorado", "rio", "canon"], elementos: ["Estados Unidos", "México", "Canadá", "Cuba"] },
      { tema: "Países que comparten la isla de Nueva Guinea", palabrasClave: ["nueva guinea", "isla", "frontera"], elementos: ["Papúa Nueva Guinea", "Indonesia", "Australia", "Fiyi"] },
      { tema: "Países que tienen una estrella de David en su bandera nacional", palabrasClave: ["estrella david", "bandera", "emblema"], elementos: ["Israel", "Marruecos", "Etiopía", "Somalia"] },
      { tema: "Países europeos bañados por el mar de Irlanda", palabrasClave: ["mar irlanda", "islas", "costa"], elementos: ["Irlanda", "Reino Unido", "Francia", "Islandia"] }
    ]
  },
  {
    id: 75,
    grupos: [
      { tema: "Países que tienen costas sobre el estrecho de Magallanes o canales fueguinos", palabrasClave: ["magallanes", "tierra del fuego", "sur"], elementos: ["Chile", "Argentina", "Uruguay", "Brasil"] },
      { tema: "Países que tienen el birr o el cedi como moneda nacional", palabrasClave: ["moneda africa", "divisa", "dinero"], elementos: ["Etiopía", "Ghana", "Nigeria", "Kenia"] },
      { tema: "Países que tienen frontera directa con la República Argentina", palabrasClave: ["frontera argentina", "vecinos", "sudamerica"], elementos: ["Chile", "Bolivia", "Paraguay", "Brasil"] },
      { tema: "Países con banderas que contienen estrellas y una luna creciente", palabrasClave: ["luna estrella", "bandera", "islam"], elementos: ["Turquía", "Argelia", "Túnez", "Pakistán"] }
    ]
  },
  {
    id: 76,
    grupos: [
      { tema: "Países con costas bañadas por el mar de Alborán", palabrasClave: ["alboran", "mar", "mediterraneo"], elementos: ["España", "Marruecos", "Argelia", "Reino Unido"] },
      { tema: "Países que integran las tres naciones del Benelux", palabrasClave: ["benelux", "europa", "acuerdo"], elementos: ["Bélgica", "Países Bajos", "Luxemburgo", "Francia"] },
      { tema: "Países que tienen el won o el baht como moneda oficial", palabrasClave: ["won", "baht", "moneda asia"], elementos: ["Corea del Sur", "Tailandia", "Corea del Norte", "Vietnam"] },
      { tema: "Países que comparten la cuenca del lago Chad", palabrasClave: ["lago chad", "sahel", "africa"], elementos: ["Chad", "Camerún", "Níger", "Nigeria"] }
    ]
  },
  {
    id: 77,
    grupos: [
      { tema: "Países que tienen costas sobre el mar de Ojotsk", palabrasClave: ["ojotsk", "mar", "pacifico norte"], elementos: ["Rusia", "Japón", "China", "Corea del Sur"] },
      { tema: "Países de habla francesa en el continente europeo", palabrasClave: ["frances", "idioma", "europa"], elementos: ["Francia", "Bélgica", "Suiza", "Mónaco"] },
      { tema: "Países de América Central que tienen el quetzal o el lempira como moneda", palabrasClave: ["quetzal", "lempira", "moneda"], elementos: ["Guatemala", "Honduras", "Nicaragua", "El Salvador"] },
      { tema: "Países que tienen frontera directa con la República de Colombia", palabrasClave: ["frontera colombia", "vecinos", "sudamerica"], elementos: ["Venezuela", "Brasil", "Perú", "Ecuador"] }
    ]
  },
  {
    id: 78,
    grupos: [
      { tema: "Países que tienen una franja diagonal blanca sobre fondo rojo en su bandera", palabrasClave: ["diagonal", "bandera", "rojo y blanco"], elementos: ["Perú", "Trinidad y Tobago", "Bahréin", "Georgia"] },
      { tema: "Países que comparten la cuenca del río Paraná", palabrasClave: ["parana", "rio", "cuenca plata"], elementos: ["Brasil", "Paraguay", "Argentina", "Uruguay"] },
      { tema: "Países con costas en el golfo de Botnia", palabrasClave: ["botnia", "golfo", "mar baltico"], elementos: ["Suecia", "Finlandia", "Rusia", "Estonia"] },
      { tema: "Países de África Oriental que tienen el inglés como lengua oficial", palabrasClave: ["ingles", "africa este", "oficial"], elementos: ["Kenia", "Uganda", "Tanzania", "Ruanda"] }
    ]
  },
  {
    id: 79,
    grupos: [
      { tema: "Países que tienen costa sobre el mar de Java", palabrasClave: ["mar de java", "indonesia", "costa"], elementos: ["Indonesia", "Malasia", "Singapur", "Brunéi"] },
      { tema: "Países de Europa que tienen frontera terrestre con la República Checa", palabrasClave: ["frontera checa", "vecinos", "centroeuropa"], elementos: ["Alemania", "Polonia", "Eslovaquia", "Austria"] },
      { tema: "Países que tienen el colón como nombre de moneda oficial", palabrasClave: ["colon", "moneda", "dinero"], elementos: ["Costa Rica", "El Salvador", "Panamá", "Nicaragua"] },
      { tema: "Países que tienen el sol de mayo en su escudo o bandera", palabrasClave: ["sol de mayo", "bandera", "emblema"], elementos: ["Argentina", "Uruguay", "Filipinas", "Perú"] }
    ]
  },
  {
    id: 80,
    grupos: [
      { tema: "Países con costas en el mar de Cortés (golfo de California)", palabrasClave: ["cortes", "golfo california", "mar"], elementos: ["México", "Estados Unidos", "Guatemala", "Belice"] },
      { tema: "Países que tienen frontera directa con el Reino de España", palabrasClave: ["frontera espana", "vecinos", "limite"], elementos: ["Francia", "Portugal", "Andorra", "Marruecos"] },
      { tema: "Países que tienen el real o el guarani como moneda oficial", palabrasClave: ["real", "guarani", "moneda"], elementos: ["Brasil", "Paraguay", "Bolivia", "Uruguay"] },
      { tema: "Países insulares situados en el océano Pacífico Sur", palabrasClave: ["pacifico sur", "islas", "oceania"], elementos: ["Fiyi", "Samoa", "Tonga", "Vanuatu"] }
    ]
  },

  // ==========================================
  // PANELES 81 A 100 (CIERRE TOTALMENTE VALIDADO)
  // ==========================================
  {
    id: 81,
    grupos: [
      { tema: "Países que tienen costas sobre el mar de Liguria", palabrasClave: ["liguria", "mediterraneo", "mar"], elementos: ["Italia", "Francia", "Mónaco", "España"] },
      { tema: "Países con banderas que constan únicamente de dos franjas horizontales iguales", palabrasClave: ["dos franjas", "bandera", "bicolor"], elementos: ["Polonia", "Indonesia", "Mónaco", "Ucrania"] },
      { tema: "Países atravesados por el curso del río Danubio", palabrasClave: ["danubio", "rio", "europa"], elementos: ["Alemania", "Austria", "Eslovaquia", "Hungría"] },
      { tema: "Países que tienen el gallego, euskera o catalán como lenguas reconocidas", palabrasClave: ["lenguas ibericas", "oficial", "idioma"], elementos: ["España", "Andorra", "Francia", "Italia"] }
    ]
  },
  {
    id: 82,
    grupos: [
      { tema: "Países que tienen costas sobre el mar de Mármara", palabrasClave: ["marmara", "estrechos", "turquia"], elementos: ["Turquía", "Grecia", "Bulgaria", "Rusia"] },
      { tema: "Países que tienen el peso como nombre de moneda", palabrasClave: ["peso", "moneda", "dinero"], elementos: ["México", "Argentina", "Colombia", "Chile"] },
      { tema: "Países que comparten la cordillera de los Pirineos", palabrasClave: ["pirineos", "montana", "frontera"], elementos: ["España", "Francia", "Andorra", "Portugal"] },
      { tema: "Países de África Austral sin salida al mar", palabrasClave: ["sin mar", "africa sur", "interior"], elementos: ["Botsuana", "Zimbabue", "Zambia", "Lesoto"] }
    ]
  },
  {
    id: 83,
    grupos: [
      { tema: "Países que tienen el swahili como lengua franca de comunicación", palabrasClave: ["swahili", "africa", "idioma"], elementos: ["Kenia", "Tanzania", "Uganda", "Ruanda"] },
      { tema: "Países que tienen frontera directa con la República de Chile", palabrasClave: ["frontera chile", "vecinos", "sudamerica"], elementos: ["Argentina", "Bolivia", "Perú", "Brasil"] },
      { tema: "Países europeos bañados por el mar Báltico", palabrasClave: ["baltico", "costa", "mar"], elementos: ["Estonia", "Letonia", "Lituania", "Polonia"] },
      { tema: "Países con banderas que contienen una estrella de cinco puntas solitaria", palabrasClave: ["estrella", "bandera", "cinco puntas"], elementos: ["Chile", "Cuba", "Vietnam", "Marruecos"] }
    ]
  },
  {
    id: 84,
    grupos: [
      { tema: "Países que tienen costas sobre el mar de Andamán", palabrasClave: ["andaman", "mar", "asia"], elementos: ["Tailandia", "Birmania", "Indonesia", "India"] },
      { tema: "Países que tienen el dinar como moneda oficial", palabrasClave: ["dinar", "moneda", "dinero"], elementos: ["Argelia", "Túnez", "Jordania", "Serbia"] },
      { tema: "Países que comparten el lago de Constanza", palabrasClave: ["constanza", "lago", "frontera"], elementos: ["Alemania", "Suiza", "Austria", "Liechtenstein"] },
      { tema: "Países de América del Sur que no tienen salida al mar", palabrasClave: ["sin mar", "sudamerica", "interior"], elementos: ["Bolivia", "Paraguay", "Uruguay", "Ecuador"] }
    ]
  },
  {
    id: 85,
    grupos: [
      { tema: "Países con costas sobre el mar de Cortés (golfo de California)", palabrasClave: ["cortes", "california", "mar"], elementos: ["México", "Estados Unidos", "Guatemala", "Belice"] },
      { tema: "Países que tienen el colón como moneda", palabrasClave: ["colon", "moneda", "dinero"], elementos: ["Costa Rica", "El Salvador", "Panamá", "Honduras"] },
      { tema: "Países que comparten la selva de los Andes", palabrasClave: ["selva", "andes", "cordillera"], elementos: ["Colombia", "Ecuador", "Perú", "Bolivia"] },
      { tema: "Países con banderas que llevan una cruz nórdica", palabrasClave: ["cruz nordica", "bandera", "cruz"], elementos: ["Dinamarca", "Noruega", "Suecia", "Finlandia"] }
    ]
  },
  {
    id: 86,
    grupos: [
      { tema: "Países que comparten las aguas del lago Victoria", palabrasClave: ["lago victoria", "africa", "lago"], elementos: ["Kenia", "Tanzania", "Uganda", "Ruanda"] },
      { tema: "Países de Europa Central sin salida al mar", palabrasClave: ["sin mar", "europa central", "interior"], elementos: ["Suiza", "Austria", "República Checa", "Hungría"] },
      { tema: "Países con costas sobre el mar Caribe", palabrasClave: ["caribe", "mar", "playa"], elementos: ["Colombia", "Venezuela", "Costa Rica", "Panamá"] },
      { tema: "Países que tienen el yen o yuan como moneda", palabrasClave: ["yen", "yuan", "moneda"], elementos: ["Japón", "China", "Corea del Sur", "Taiwán"] }
    ]
  },
  {
    id: 87,
    grupos: [
      { tema: "Países atravesados por el meridiano de Greenwich", palabrasClave: ["greenwich", "meridiano 0", "longitud"], elementos: ["Reino Unido", "Francia", "España", "Argelia"] },
      { tema: "Países que tienen el quechua como lengua oficial", palabrasClave: ["quechua", "lengua", "andes"], elementos: ["Perú", "Bolivia", "Ecuador", "Colombia"] },
      { tema: "Países de Asia que son monarquías constitucionales", palabrasClave: ["monarquia", "rey", "asia"], elementos: ["Japón", "Tailandia", "Malasia", "Bután"] },
      { tema: "Países con banderas cuadradas (1:1)", palabrasClave: ["cuadrada", "bandera", "forma"], elementos: ["Suiza", "Ciudad del Vaticano", "Nepal", "Liechtenstein"] }
    ]
  },
  {
    id: 88,
    grupos: [
      { tema: "Países con costas sobre el mar de Ojotsk", palabrasClave: ["ojotsk", "mar", "pacifico"], elementos: ["Rusia", "Japón", "China", "Corea del Sur"] },
      { tema: "Países de América Central que tienen costa sobre dos océanos", palabrasClave: ["dos oceanos", "centroamerica", "costa"], elementos: ["Guatemala", "Honduras", "Nicaragua", "Costa Rica"] },
      { tema: "Países con bandera tricolor de franjas verticales", palabrasClave: ["vertical", "tricolor", "bandera"], elementos: ["Francia", "Italia", "Irlanda", "Bélgica"] },
      { tema: "Países del sudeste asiático que no tienen costa al mar", palabrasClave: ["sin mar", "sudeste asiatico", "interior"], elementos: ["Laos", "Mongolia", "Nepal", "Bután"] }
    ]
  },
  {
    id: 89,
    grupos: [
      { tema: "Países que tienen un animal en su bandera", palabrasClave: ["animal", "bandera", "escudo"], elementos: ["México", "España", "Ecuador", "Gales"] },
      { tema: "Países atravesados por el Trópico de Cáncer", palabrasClave: ["tropico cancer", "paralelo", "norte"], elementos: ["Argelia", "India", "Egipto", "Arabia Saudita"] },
      { tema: "Países de Europa que no pertenecen a la OTAN", palabrasClave: ["no otan", "neutral", "europa"], elementos: ["Suiza", "Austria", "Irlanda", "Malta"] },
      { tema: "Países que tienen el rand o chelín como moneda", palabrasClave: ["moneda", "chelín", "rand"], elementos: ["Sudáfrica", "Kenia", "Tanzania", "Uganda"] }
    ]
  },
  {
    id: 90,
    grupos: [
      { tema: "Países que tienen frontera directa con Brasil", palabrasClave: ["frontera brasil", "sudamerica", "vecinos"], elementos: ["Argentina", "Uruguay", "Colombia", "Perú"] },
      { tema: "Países que usan la corona como moneda oficial", palabrasClave: ["corona", "moneda", "dinero"], elementos: ["Suecia", "Noruega", "Dinamarca", "República Checa"] },
      { tema: "Países insulares de Oceanía", palabrasClave: ["oceania", "isla", "pacifico"], elementos: ["Nueva Zelanda", "Fiyi", "Samoa", "Palaos"] },
      { tema: "Países que tienen costas sobre el estrecho de Malaca", palabrasClave: ["malaca", "estrecho", "asia"], elementos: ["Malasia", "Indonesia", "Singapur", "Tailandia"] }
    ]
  },
  {
    id: 91,
    grupos: [
      { tema: "Países que tienen el neerlandés como idioma oficial", palabrasClave: ["neerlandes", "holandes", "idioma"], elementos: ["Países Bajos", "Bélgica", "Surinam", "Aruba"] },
      { tema: "Países de la península escandinava y nórdica", palabrasClave: ["escandinavia", "norte", "europa"], elementos: ["Noruega", "Suecia", "Dinamarca", "Finlandia"] },
      { tema: "Países con banderas que constan únicamente de dos franjas horizontales", palabrasClave: ["dos franjas", "bandera", "colores"], elementos: ["Polonia", "Indonesia", "Mónaco", "Ucrania"] },
      { tema: "Países que tienen el rial o riyal como moneda", palabrasClave: ["rial", "moneda", "oriente"], elementos: ["Arabia Saudita", "Qatar", "Omán", "Irán"] }
    ]
  },
  {
    id: 92,
    grupos: [
      { tema: "Países con costas sobre el mar de Timor", palabrasClave: ["timor", "mar", "oceania"], elementos: ["Australia", "Timor Oriental", "Indonesia", "Papúa Nueva Guinea"] },
      { tema: "Países que tienen el inglés como idioma materno mayoritario", palabrasClave: ["ingles", "materno", "anglofono"], elementos: ["Reino Unido", "Estados Unidos", "Australia", "Nueva Zelanda"] },
      { tema: "Países con más de dos idiomas oficiales a nivel federal", palabrasClave: ["idiomas", "multilingue", "oficial"], elementos: ["Suiza", "Bélgica", "Bolivia", "Sudáfrica"] },
      { tema: "Países que no tienen salida directa al mar en América del Sur", palabrasClave: ["sin mar", "sudamerica", "interior"], elementos: ["Bolivia", "Paraguay", "Chile", "Uruguay"] }
    ]
  },
  {
    id: 93,
    grupos: [
      { tema: "Países que tienen costa sobre el mar Tirreno", palabrasClave: ["tirreno", "mar", "mediterraneo"], elementos: ["Italia", "Francia", "España", "Mónaco"] },
      { tema: "Países que tienen frontera directa con la República de Colombia", palabrasClave: ["frontera colombia", "vecinos", "sudamerica"], elementos: ["Venezuela", "Brasil", "Perú", "Ecuador"] },
      { tema: "Países con banderas que contienen el sol en su centro", palabrasClave: ["sol", "bandera", "emblema"], elementos: ["Argentina", "Uruguay", "Japón", "Filipinas"] },
      { tema: "Países que tienen ciudades situadas a más de 2.500 metros sobre el mar", palabrasClave: ["altitud", "andes", "montana"], elementos: ["Bolivia", "Ecuador", "Colombia", "México"] }
    ]
  },
  {
    id: 94,
    grupos: [
      { tema: "Países que tienen el francés como lengua oficial en Europa", palabrasClave: ["frances", "idioma", "europa"], elementos: ["Francia", "Bélgica", "Suiza", "Mónaco"] },
      { tema: "Países que comparten la isla de Borneo", palabrasClave: ["borneo", "isla", "asia"], elementos: ["Indonesia", "Malasia", "Brunéi", "Filipinas"] },
      { tema: "Países que tienen frontera terrestre con Alemania", palabrasClave: ["frontera alemania", "europa", "vecinos"], elementos: ["Polonia", "Austria", "Suiza", "República Checa"] },
      { tema: "Países que tienen el colón como moneda oficial", palabrasClave: ["colon", "moneda", "dinero"], elementos: ["Costa Rica", "El Salvador", "Panamá", "Guatemala"] }
    ]
  },
  {
    id: 95,
    grupos: [
      { tema: "Países con costas sobre el mar de Liguria", palabrasClave: ["liguria", "mediterraneo", "mar"], elementos: ["Italia", "Francia", "Mónaco", "España"] },
      { tema: "Países que tienen el árabe como idioma oficial exclusivo o mayoritario", palabrasClave: ["arabe", "idioma", "oriente"], elementos: ["Egipto", "Arabia Saudita", "Marruecos", "Jordania"] },
      { tema: "Países que tienen una media luna en su bandera", palabrasClave: ["luna", "bandera", "islam"], elementos: ["Turquía", "Túnez", "Argelia", "Pakistán"] },
      { tema: "Países que tienen frontera directa con Chile", palabrasClave: ["frontera chile", "vecinos", "sudamerica"], elementos: ["Argentina", "Bolivia", "Perú", "Brasil"] }
    ]
  },
  {
    id: 96,
    grupos: [
      { tema: "Países que comparten las cataratas Victoria", palabrasClave: ["cataratas victoria", "frontera", "africa"], elementos: ["Zambia", "Zimbabue", "Botsuana", "Namibia"] },
      { tema: "Países con cumbres montañosas de más de 7.000 metros de altitud", palabrasClave: ["altitud", "himalaya", "montana"], elementos: ["Nepal", "Pakistán", "China", "India"] },
      { tema: "Países con costas sobre el mar de Azov", palabrasClave: ["mar azov", "costa", "europa este"], elementos: ["Ucrania", "Rusia", "Turquía", "Georgia"] },
      { tema: "Países que tienen más de 100 volcanes activos", palabrasClave: ["volcanes", "geologia", "fuego"], elementos: ["Indonesia", "Japón", "Chile", "Islandia"] }
    ]
  },
  {
    id: 97,
    grupos: [
      { tema: "Países que tienen frontera terrestre con un solo país", palabrasClave: ["unico vecino", "frontera", "limite"], elementos: ["Portugal", "Canadá", "Mónaco", "Reino Unido"] },
      { tema: "Países con costa sobre el mar Rojo", palabrasClave: ["mar rojo", "costa", "mar"], elementos: ["Egipto", "Sudán", "Arabia Saudita", "Yemen"] },
      { tema: "Países que tienen el peso como nombre de su moneda oficial", palabrasClave: ["peso", "moneda", "dinero"], elementos: ["México", "Argentina", "Colombia", "Chile"] },
      { tema: "Países que usan el euro sin pertenecer a la Unión Europea", palabrasClave: ["euro", "no ue", "moneda"], elementos: ["Andorra", "Mónaco", "San Marino", "Montenegro"] }
    ]
  },
  {
    id: 98,
    grupos: [
      { tema: "Países que tienen frontera directa con la República Argentina", palabrasClave: ["frontera argentina", "vecinos", "sudamerica"], elementos: ["Chile", "Bolivia", "Paraguay", "Brasil"] },
      { tema: "Países con más de dos idiomas oficiales reconocidos", palabrasClave: ["idiomas", "oficiales", "multilingue"], elementos: ["Suiza", "Bélgica", "Bolivia", "Sudáfrica"] },
      { tema: "Países que tienen el swahili como lengua nacional", palabrasClave: ["swahili", "africa", "idioma"], elementos: ["Kenia", "Tanzania", "Uganda", "Ruanda"] },
      { tema: "Países de la península de los Balcanes sin salida al mar", palabrasClave: ["balcanes", "sin mar", "interior"], elementos: ["Serbia", "Macedonia del Norte", "Kosovo", "Bosnia y Herzegovina"] }
    ]
  },
  {
    id: 99,
    grupos: [
      { tema: "Países que tienen costas sobre el estrecho de Gibraltar", palabrasClave: ["estrecho gibraltar", "mar", "costa"], elementos: ["España", "Marruecos", "Reino Unido", "Portugal"] },
      { tema: "Países que tienen el quechua como lengua oficial", palabrasClave: ["quechua", "lengua", "andes"], elementos: ["Perú", "Bolivia", "Ecuador", "Colombia"] },
      { tema: "Países que tienen el dinar como nombre de moneda", palabrasClave: ["dinar", "moneda", "dinero"], elementos: ["Argelia", "Túnez", "Jordania", "Serbia"] },
      { tema: "Países que tienen una estrella solitaria de cinco puntas en su bandera", palabrasClave: ["estrella", "bandera", "cinco puntas"], elementos: ["Chile", "Cuba", "Vietnam", "Marruecos"] }
    ]
  },
  {
    id: 100,
    grupos: [
      { tema: "Los cuatro países más extensos por superficie del mundo", palabrasClave: ["superficie", "extension", "gigante"], elementos: ["Rusia", "Canadá", "China", "Estados Unidos"] },
      { tema: "Países atravesados por la línea ecuatorial", palabrasClave: ["ecuador", "paralelo", "linea"], elementos: ["Ecuador", "Colombia", "Kenia", "Indonesia"] },
      { tema: "Países con bandera tricolor de franjas verticales", palabrasClave: ["vertical", "tricolor", "bandera"], elementos: ["Francia", "Italia", "Irlanda", "Bélgica"] },
      { tema: "Países insulares soberanos del mar Caribe", palabrasClave: ["caribe", "isla", "insular"], elementos: ["Jamaica", "Barbados", "Cuba", "Trinidad y Tobago"] }
    ]
  }
];