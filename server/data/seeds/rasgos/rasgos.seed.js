// server/data/seeds/rasgos/rasgos.seed.js

export const FAMOSOS = [
  {
    id: 'cristianoRonaldo',
    nombre: 'Cristiano Ronaldo',
    alias: [
      'Cristiano Ronaldo',
      'Cristiano',
      'Ronaldo',
      'CR7',
      'CR 7'
    ],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Cristiano_Ronaldo,_2023.jpg',
    rasgo: 'barbilla',
    recorte: { x: 0.25, y: 0.30, ancho: 0.50, alto: 0.15 }
  },
  {
    id: 'theRock',
    nombre: 'Dwayne Johnson',
    alias: [
      'The Rock',
      'TheRock',
      'La Roca',
      'LaRoca',
      'Dwayne Johnson',
      'Dwayne',
      'Johnson',
      'Dwayne The Rock Johnson'
    ],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/The_Rock_2023.jpg',
    rasgo: 'frente',
    recorte: { x: 0.25, y: 0.15, ancho: 0.50, alto: 0.15 }
  },
  {
    id: 'rosalia',
    nombre: 'Rosalía',
    alias: [
      'Rosalia',
      'Rosalía',
      'Rosalia Vila',
      'Rosalía Vila',
      'Rosalia Vila Tobella',
      'La Rosalia',
      'La Rosalía'
    ],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Rosalia_2019-portrait.jpg',
    rasgo: 'ojos',
    recorte: { x: 0.25, y: 0.25, ancho: 0.50, alto: 0.10 },
    attribution: {
      autor: 'Pedro J Pacheco',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Rosalia_2019-portrait.jpg',
      licencia: 'CC BY-SA 4.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by-sa/4.0/'
    }
  },
  {
    id: 'daniguiza',
    nombre: 'Dani Güiza',
    alias: [
      'Dani Güiza',
      'Dani Guiza',
      'Daniguiza',
      'Danigüiza',
      'Guiza',
      'Güiza',
      'Torrente'
    ],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Danig.jpg',
    rasgo: 'ojos',
    recorte: { x: 0.05, y: 0.30, ancho: 0.80, alto: 0.20 },
    attribution: {
      autor: 'Mikialbert',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Danig.jpg',
      licencia: 'CC BY-SA 4.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by-sa/4.0/'
    }
  },
  {
    id: 'duki',
    nombre: 'Duki',
    alias: [
      'Duki',
      'Duko'
    ],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/El_Duki.png',
    rasgo: 'pelo',
    recorte: { x: 0.00, y: 0.15, ancho: 0.80, alto: 0.20 },
    attribution: {
      autor: 'Municipalidad de Mendoza',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:El_Duki.png',
      licencia: 'CC BY-SA 4.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by-sa/4.0/'
    }
  },
  {
    id: 'zaynmalik',
    nombre: 'Zayn Malik',
    alias: [
      'Zayn Malik',
      'ZaynMalik',
      'Zayn'
    ],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Zayn_Wiki.jpg',
    rasgo: 'pelo',
    recorte: { x: 0.22, y: 0.00, ancho: 0.50, alto: 0.18 },
    attribution: {
      autor: 'First Access Entertainment',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Zayn_Wiki.jpg',
      licencia: 'CC BY-SA 3.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by-sa/3.0/'
    }
  },
  {
    id: 'robertoCarlos',
    nombre: 'Roberto Carlos',
    alias: [
      'Roberto Carlos',
      'Robertocarlos',
      'RC3'
    ],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/LS3_1288_(53332367864)_(cropped).jpg',
    rasgo: 'barbilla',
    recorte: { x: 0.25, y: 0.42, ancho: 0.60, alto: 0.25 },
    attribution: {
      autor: 'Web Summit',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:LS3_1288_(53332367864)_(cropped).jpg',
      licencia: 'CC BY-SA 2.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by-sa/2.0/'
    }
  },
  {
    id: 'mikeTyson',
    nombre: 'Mike Tyson',
    alias: [
      'Mike Tyson',
      'MikeTyson',
      'Tyson'
    ],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Mike_Tyson_2019_by_Glenn_Francis.jpg',
    rasgo: 'frente',
    recorte: { x: 0.21, y: 0.04, ancho: 0.70, alto: 0.25 },
    attribution: {
      autor: 'Toglenn',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Mike_Tyson_2019_by_Glenn_Francis.jpg',
      licencia: 'CC BY-SA 4.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by-sa/4.0/'
    }
  },
  {
    id: 'johnCena',
    nombre: 'John Cena',
    alias: [
      'John Cena',
      'Johncena',
      'Cena'
    ],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/John_Cena_(9401165868).jpg',
    rasgo: 'pecho',
    recorte: { x: 0.11, y: 0.40, ancho: 0.70, alto: 0.15 },
    attribution: {
      autor: 'Krystal Bogner from Adelaide, Australia',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:John_Cena_(9401165868).jpg',
      licencia: 'CC BY-SA 2.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by-sa/2.0/'
    }
  },
  {
    id: 'kendallJenner',
    nombre: 'Kendall Jenner',
    alias: [
      'Kendall jenner',
      'Kendalljenner',
      'Kendall'
    ],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Kendall_face_2016.jpg',
    rasgo: 'boca',
    recorte: { x: 0.11, y: 0.20, ancho: 0.80, alto: 0.15 },
    attribution: {
      autor: 'LOVE Magazine',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Kendall_face_2016.jpg',
      licencia: 'CC BY 3.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by/3.0'
    }
  },
  {
    id: 'pepeViyuela',
    nombre: 'Pepe Viyuela',
    alias: [
      'Pepe Viyuela',
      'Pepeviyuela',
      'Chema'
    ],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Pepe_Viyuela.jpg',
    rasgo: 'ojos',
    recorte: { x: 0.13, y: 0.25, ancho: 0.80, alto: 0.15 },
    attribution: {
      autor: 'BigSus',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Pepe_Viyuela.jpg',
      licencia: 'CC BY-SA 3.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by-sa/3.0'
    }
  },
  {
    id: 'rafaNadal',
    nombre: 'Rafael Nadal',
    alias: [
      'Rafa Nadal',
      'RafaNadal',
      'Rafael Nadal',
      'RafaelNadal',
      'Nadal'
    ],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Rafael_Nadal_by_toga.jpg',
    rasgo: 'brazos',
    recorte: { x: 0.08, y: 0.55, ancho: 0.80, alto: 0.25 },
    attribution: {
      autor: 'John Togasaki',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Rafael_Nadal_by_toga.jpg',
      licencia: 'CC BY-SA 2.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by-sa/2.0'
    }
  },
  {
    id: 'michaelPhelps',
    nombre: 'Michael Phelps',
    alias: [
      'Michael Phelps',
      'MichaelPhelps',
      'Phelps'
    ],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Michael_Phelps_(18952526936).jpg',
    rasgo: 'ojos',
    recorte: { x: 0.15, y: 0.15, ancho: 0.80, alto: 0.15 },
    attribution: {
      autor: 'JD Lasica from Pleasanton, CA, US',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Michael_Phelps_(18952526936).jpg',
      licencia: 'CC BY 2.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by/2.0'
    }
  },
  {
    id: 'juiceWrld',
    nombre: 'Juice WRLD',
    alias: [
      'Juice Wrld',
      'JuiceWRLD',
      'Juice World',
      'JuiceWorld'
    ],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Juice_WRLD_-_Les_Ardentes_2019_(cropped_2)_(cropped).jpg',
    rasgo: 'pelo',
    recorte: { x: 0.07, y: 0.05, ancho: 0.80, alto: 0.25 },
    attribution: {
      autor: 'Lexiou WesCudi',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Juice_WRLD_-_Les_Ardentes_2019_(cropped_2)_(cropped).jpg',
      licencia: 'CC BY-SA 2.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by-sa/2.0'
    }
  },
  {
    id: 'ibai',
    nombre: 'Ibai Llanos',
    alias: [
      'Ibai Llanos',
      'IbaiLlanos',
      'Ibai'
    ],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Ibai_Llanos_(2024)2.jpg',
    rasgo: 'barba',
    recorte: { x: 0.11, y: 0.50, ancho: 0.80, alto: 0.15 },
    attribution: {
      autor: 'Movistar KOI VODS',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Ibai_Llanos_(2024)2.jpg',
      licencia: 'CC BY 3.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by/3.0'
    }
  },
  {
    id: 'fernandoAlonso',
    nombre: 'Fernando Alonso',
    alias: [
      'Fernando Alonso',
      'FernandoAlonso',
      'Alonso'
    ],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/2019_Indianapolis_500,_Fernando_Alonso_-_02.jpg',
    rasgo: 'traje',
    recorte: { x: 0.11, y: 0.50, ancho: 0.80, alto: 0.25 },
    attribution: {
      autor: 'Zach Catanzareti Photo',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:2019_Indianapolis_500,_Fernando_Alonso_-_02.jpg',
      licencia: 'CC BY 2.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by/2.0'
    }
  },
  {
    id: 'pauloDybala',
    nombre: 'Paulo Dybala',
    alias: [
      'Paulo Dybala',
      'PauloDybala',
      'Dybala'
    ],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/%D0%9C%D0%B0%D1%82%D1%87_%C2%AB%D0%94%D0%B8%D0%BD%D0%B0%D0%BC%D0%BE%C2%BB_-_%C2%AB%D0%AE%D0%B2%D0%B5%D0%BD%D1%82%D1%83%D1%81%C2%BB_0-2._20_%D0%BE%D0%BA%D1%82%D1%8F%D0%B1%D1%80%D1%8F_2020_%D0%B3%D0%BE%D0%B4%D0%B0_%E2%80%94_1153905_(cropped).jpg',
    rasgo: 'ojos',
    recorte: { x: 0.11, y: 0.20, ancho: 0.80, alto: 0.10 },
    attribution: {
      autor: 'ТОВ "Динамоманія"',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:%D0%9C%D0%B0%D1%82%D1%87_%C2%AB%D0%94%D0%B8%D0%BD%D0%B0%D0%BC%D0%BE%C2%BB_-_%C2%AB%D0%AE%D0%B2%D0%B5%D0%BD%D1%82%D1%83%D1%81%C2%BB_0-2._20_%D0%BE%D0%BA%D1%82%D1%8F%D0%B1%D1%80%D1%8F_2020_%D0%B3%D0%BE%D0%B4%D0%B0_%E2%80%94_1153905_(cropped).jpg',
      licencia: 'CC BY-SA 4.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by-sa/4.0'
    }
  },
  {
    id: 'nikolaJokic',
    nombre: 'Nikola Jokić',
    alias: [
      'Nikola Jokic',
      'NikolaJokic',
      'Jokic'
    ],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Nikola_Jokic_free_throw_(cropped).jpg',
    rasgo: 'cuerpo',
    recorte: { x: 0.11, y: 0.55, ancho: 0.80, alto: 0.30 },
    attribution: {
      autor: 'All-Pro Reels',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Nikola_Jokic_free_throw_(cropped).jpg',
      licencia: 'CC BY-SA 2.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by-sa/2.0'
    }
  },
  {
    id: 'najwaNimri',
    nombre: 'Najwa Nimri',
    alias: [
      'Najwa Nimri',
      'NajwaNimri',
      'Zulema Zahir',
      'ZulemaZahir',
      'Zulema'
    ],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Zulema_Zahir.jpg',
    rasgo: 'ojos',
    recorte: { x: 0.11, y: 0.15, ancho: 0.80, alto: 0.15 },
    attribution: {
      autor: 'Mariana',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Zulema_Zahir.jpg',
      licencia: 'CC BY-SA 4.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by-sa/4.0'
    }
  },
  {
    id: 'karlosArguinano',
    nombre: 'Karlos Arguiñano',
    alias: [
      'Karlos Arguiñano',
      'Karlos Arguiñano',
      'Arguiñano'
    ],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Karlos_Argui%C3%B1ano_(enhanced).jpg',
    rasgo: 'traje',
    recorte: { x: 0.11, y: 0.55, ancho: 0.80, alto: 0.40 },
    attribution: {
      autor: 'infoLibre',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Karlos_Argui%C3%B1ano_(enhanced).jpg',
      licencia: 'CC BY 3.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by/3.0'
    }
  },
  {
    id: 'davidGuetta',
    nombre: 'David Guetta',
    alias: [
      'David Guetta',
      'DavidGuetta',
      'Guetta'
    ],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/David_Guetta_at_2011_MMVA.jpg',
    rasgo: 'ojos',
    recorte: { x: 0.07, y: 0.17, ancho: 0.80, alto: 0.10 },
    attribution: {
      autor: 'Vervegirl Canada',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:David_Guetta_at_2011_MMVA.jpg',
      licencia: 'CC BY-SA 2.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by-sa/2.0'
    }
  },
  {
    id: 'gerardButler',
    nombre: 'Gerard Butler',
    alias: [
      'Gerard Butler',
      'GerardButler',
      'Butler'
    ],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Gerard_Butler_(29681162176).jpg',
    rasgo: 'barbilla',
    recorte: { x: 0.07, y: 0.40, ancho: 0.80, alto: 0.25 },
    attribution: {
      autor: 'Gordon Correll',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Gerard_Butler_(29681162176).jpg',
      licencia: 'CC BY-SA 2.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by-sa/2.0'
    }
  },
  {
    id: 'markWahlberg',
    nombre: 'Mark Wahlberg',
    alias: [
      'Mark Wahlberg',
      'MarkWahlberg',
      'Wahlberg'
    ],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Mark_Wahlberg_2,_2012.jpg',
    rasgo: 'ojos',
    recorte: { x: 0.15, y: 0.30, ancho: 0.80, alto: 0.10 },
    attribution: {
      autor: 'Eva Rinaldi',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Mark_Wahlberg_2,_2012.jpg',
      licencia: 'CC BY-SA 2.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by-sa/2.0'
    }
  },
  {
    id: 'fernandoTorres',
    nombre: 'Fernando Torres',
    alias: [
      'fernando Torres',
      'fernandoTorres',
      'Torres'
    ],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Fernando_Torres_271809.JPG',
    rasgo: 'pelo',
    recorte: { x: 0.15, y: 0.21, ancho: 0.80, alto: 0.20 },
    attribution: {
      autor: 'Harald Bischoff',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Fernando_Torres_271809.JPG',
      licencia: 'CC BY-SA 3.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by-sa/3.0'
    }
  },
  {
    id: 'usainBolt',
    nombre: 'Usain Bolt',
    alias: [
      'usain Bolt',
      'usainBolt',
      'Bolt'
    ],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Usain_Bolt,_Anniversary_Games,_London_2013.jpg',
    rasgo: 'piernas',
    recorte: { x: 0.15, y: 0.45, ancho: 0.80, alto: 0.40 },
    attribution: {
      autor: 'J. Brichto',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Usain_Bolt,_Anniversary_Games,_London_2013.jpg',
      licencia: 'CC BY-SA 3.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by-sa/3.0'
    }
  },
  {
    id: 'davidLuiz',
    nombre: 'David Luiz',
    alias: [
      'davidLuiz',
      'david Luiz'
    ],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/David_Luiz_-_PSG.jpg',
    rasgo: 'pelo',
    recorte: { x: 0.03, y: 0.10, ancho: 0.80, alto: 0.20 },
    attribution: {
      autor: 'Football.ua',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:David_Luiz_-_PSG.jpg',
      licencia: 'CC BY 3.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by/3.0'
    }
  },
  {
    id: 'marioCasas',
    nombre: 'Mario Casas',
    alias: [
      'marioCasas',
      'mario Casas'
    ],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Premios_Goya_2026_-_Mario_Casas.jpg',
    rasgo: 'boca',
    recorte: { x: 0.08, y: 0.15, ancho: 0.80, alto: 0.10 },
    attribution: {
      autor: 'Pedro J Pacheco',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Premios_Goya_2026_-_Mario_Casas.jpg',
      licencia: 'CC BY-SA 4.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by-sa/4.0'
    }
  },
  {
    id: 'daddyYankee',
    nombre: 'Daddy Yankee',
    alias: [
      'daddyYankee',
      'daddy Yankee'
    ],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Daddy_Yankee_entrevista.png',
    rasgo: 'frente',
    recorte: { x: 0.08, y: 0.10, ancho: 0.80, alto: 0.20 },
    attribution: {
      autor: 'La Prensa Gráfica Noticias de El Salvador',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Daddy_Yankee_entrevista.png',
      licencia: 'CC BY 3.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by/3.0'
    }
  },
  {
    id: 'shaquilleOneal',
    nombre: 'Shaquille O\'Neal',
    alias: [
      'shaquille Oneal',
      'shaquilleOneal',
      'shaquille O\'neal',
      'shaquilleO\'neal',
      'shaq'
    ],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Shaquille_O%27Neal_Free_Throw.jpg',
    rasgo: 'cuerpo',
    recorte: { x: 0.12, y: 0.30, ancho: 0.80, alto: 0.50 },
    attribution: {
      autor: 'Keith Allison from Baltimore, USA',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Shaquille_O%27Neal_Free_Throw.jpg',
      licencia: 'CC BY-SA 2.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by-sa/2.0'
    }
  },
  {
    id: 'eduSoto',
    nombre: 'Edu Soto',
    alias: [
      'eduSoto',
      'edu Soto',
      'Soto',
      'neng'
    ],
    imagen: 'https://upload.wikimedia.org/wikipedia/commons/7/73/Edu_Soto_La_risa_cuando_est%C3%A1_prohibida_te_lleva_a_un_terreno_bastante_peligroso2.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original',
    rasgo: 'ojos',
    recorte: { x: 0.08, y: 0.30, ancho: 0.80, alto: 0.10 },
    attribution: {
      autor: 'infoLibre',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Edu_Soto_La_risa_cuando_est%C3%A1_prohibida_te_lleva_a_un_terreno_bastante_peligroso2.png',
      licencia: 'CC BY 3.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by/3.0'
    }
  },
  {
    id: 'marianoRajoy',
    nombre: 'Mariano Rajoy',
    alias: [
      'marianoRajoy',
      'mariano Rajoy',
      'Rajoy'
    ],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Mariano_Rajoy_2006_(cropped).jpg',
    rasgo: 'boca',
    recorte: { x: 0.08, y: 0.50, ancho: 0.80, alto: 0.25 },
    attribution: {
      autor: 'European People\'s Party',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Mariano_Rajoy_2006_(cropped).jpg',
      licencia: 'CC BY 2.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by/2.0'
    }
  },
  {
    id: 'anaPeleteiro',
    nombre: 'Ana Peleteiro',
    alias: [
      'anaPeleteiro',
      'ana Peleteiro',
      'Peleteiro'
    ],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Ana_Peleteiro_-_Triple_saut_Femmes_(48614755616).jpg',
    rasgo: 'hombros',
    recorte: { x: 0.25, y: 0.35, ancho: 0.80, alto: 0.25 },
    attribution: {
      autor: 'Yann Caradec from Paris, France',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Ana_Peleteiro_-_Triple_saut_Femmes_(48614755616).jpg',
      licencia: 'CC BY-SA 2.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by-sa/2.0'
    }
  },
  {
    id: 'pauCubarsi',
    nombre: 'Pau Cubarsí',
    alias: [
      'pauCubarsi',
      'pau Cubarsi',
      'Cubarsi'
    ],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Pau_Cubarsi_Argentina_v_Spain_19_July_2026-181_(cropped).jpg',
    rasgo: 'boca',
    recorte: { x: 0.10, y: 0.28, ancho: 0.80, alto: 0.10 },
    attribution: {
      autor: 'Bryan Berlin',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Pau_Cubarsi_Argentina_v_Spain_19_July_2026-181_(cropped).jpg',
      licencia: 'CC BY-SA 4.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by-sa/4.0'
    }
  },
  {
    id: 'justinBieber',
    nombre: 'Justin Bieber',
    alias: [
      'justinBieber',
      'justin Bieber',
      'justin'
    ],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Justin_Bieber_Q_%26_A_(26511724391)_(cropped).jpg',
    rasgo: 'cuerpo',
    recorte: { x: 0.10, y: 0.30, ancho: 0.80, alto: 0.60 },
    attribution: {
      autor: 'Lou Stejskal',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Justin_Bieber_Q_%26_A_(26511724391)_(cropped).jpg',
      licencia: 'CC BY 2.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by/2.0'
    }
  },
  {
    id: 'gabrielRufian',
    nombre: 'Gabriel Rufian',
    alias: [
      'gabrielRufian',
      'gabriel Rufian',
      'Rufian'
    ],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Gabriel_Rufi%C3%A1n_2022_(cropped).jpg',
    rasgo: 'ojos',
    recorte: { x: 0.10, y: 0.35, ancho: 0.80, alto: 0.20 },
    attribution: {
      autor: 'Marcpuigperez',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Gabriel_Rufi%C3%A1n_2022_(cropped).jpg',
      licencia: 'CC BY-SA 4.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by-sa/4.0'
    }
  },
  {
    id: 'jennaOrtega',
    nombre: 'Jenna Ortega',
    alias: [
      'jennaOrtega',
      'jenna Ortega',
      'miercoles'
    ],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Jenna_Ortega-63792.jpg',
    rasgo: 'pelo',
    recorte: { x: 0.05, y: 0.10, ancho: 0.80, alto: 0.20 },
    attribution: {
      autor: 'Harald Krichel',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Jenna_Ortega-63792.jpg',
      licencia: 'CC BY-SA 4.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by-sa/4.0'
    }
  },
  {
    id: 'vinDiesel',
    nombre: 'Vin Diesel',
    alias: [
      'vinDiesel',
      'vin Diesel',
      'Toreto'
    ],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/VinDieselMarch09.jpg',
    rasgo: 'pelo',
    recorte: { x: 0.05, y: 0.02, ancho: 0.80, alto: 0.20 },
    attribution: {
      autor: 'Andre Luis',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:VinDieselMarch09.jpg',
      licencia: 'CC BY-SA 3.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by-sa/3.0'
    }
  },
  {
    id: 'johnnyDepp',
    nombre: 'Johnny Depp',
    alias: [
      'johnnyDepp',
      'johnny Depp'
    ],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Johnny_Depp_(July_2009)_2_cropped.jpg',
    rasgo: 'boca',
    recorte: { x: 0.18, y: 0.47, ancho: 0.80, alto: 0.30 },
    attribution: {
      autor: 'nicogenin',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Johnny_Depp_(July_2009)_2_cropped.jpg',
      licencia: 'CC BY-SA 2.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by-sa/2.0'
    }
  },
  {
    id: 'tomHardy',
    nombre: 'Tom Hardy',
    alias: [
      'tomHardy',
      'tom Hardy'
    ],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Tom_Hardy_(42774738485).jpg',
    rasgo: 'boca',
    recorte: { x: 0.10, y: 0.38, ancho: 0.80, alto: 0.30 },
    attribution: {
      autor: 'Gage Skidmore from Peoria, AZ, United States of America',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Tom_Hardy_(42774738485).jpg',
      licencia: 'CC BY-SA 2.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by-sa/2.0'
    }
  },
  {
    id: 'margotRobbie',
    nombre: 'Margot Robbie',
    alias: [
      'margotRobbie',
      'margot Robbie',
      'barbie'
    ],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Robbie_at_2019_Cannes_(cropped).jpg',
    rasgo: 'ojos',
    recorte: { x: 0.05, y: 0.25, ancho: 0.80, alto: 0.20 },
    attribution: {
      autor: 'https://www.flickr.com/photos/146461623@N05',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Robbie_at_2019_Cannes_(cropped).jpg',
      licencia: 'CC BY 2.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by/2.0'
    }
  },
  {
    id: 'anaDeArmas',
    nombre: 'Ana de Armas',
    alias: [
      'anaDeArmas',
      'ana De Armas',
      'ana DeArmas'
    ],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Ana_de_Armas_by_Gage_Skidmore.jpg',
    rasgo: 'ojos',
    recorte: { x: 0.10, y: 0.18, ancho: 0.80, alto: 0.10 },
    attribution: {
      autor: 'Gage Skidmore',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Ana_de_Armas_by_Gage_Skidmore.jpg',
      licencia: 'CC BY-SA 3.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by-sa/3.0'
    }
  },
  {
    id: 'anuelAA',
    nombre: 'Anuel AA',
    alias: [
      'anuelAA',
      'anuel aa',
      'anuel'
    ],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Anuel_AA_in_2022_2.jpg',
    rasgo: 'barbilla',
    recorte: { x: 0.10, y: 0.40, ancho: 0.80, alto: 0.20 },
    attribution: {
      autor: 'Tony Dandrades',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Anuel_AA_in_2022_2.jpg',
      licencia: 'CC BY 3.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by/3.0'
    }
  },
  {
    id: 'johnLennon',
    nombre: 'John Lennon',
    alias: [
      'JohnLennon',
      'John Lennon',
      'Lennon'
    ],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/File:John_Lennon_1969_(cropped).jpg',
    rasgo: 'ojos',
    recorte: { x: 0.10, y: 0.30, ancho: 0.80, alto: 0.15 }
  },
  {
    id: 'macklemore',
    nombre: 'Macklemore',
    alias: [
      'macklemore'
    ],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Macklemore_Ryan_Lewis_Live_2016_(cropped)_(cropped).jpg',
    rasgo: 'pelo',
    recorte: { x: 0.10, y: 0.05, ancho: 0.80, alto: 0.20 },
    attribution: {
      autor: 'pitpony.photography',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Macklemore_Ryan_Lewis_Live_2016_(cropped)_(cropped).jpg',
      licencia: 'CC BY-SA 3.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by-sa/3.0'
    }
  },
  {
    id: 'tyga',
    nombre: 'Tyga',
    alias: [
      'tyga'
    ],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Tyga_-_Openair_Frauenfeld_2019_23.jpg',
    rasgo: 'cuerpo',
    recorte: { x: 0.00, y: 0.32, ancho: 0.80, alto: 0.60 },
    attribution: {
      autor: 'Frank Schwichtenberg',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Tyga_-_Openair_Frauenfeld_2019_23.jpg',
      licencia: 'CC BY-SA 4.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by-sa/4.0'
    }
  },
  {
    id: 'erlingHaaland',
    nombre: 'Erling Haaland',
    alias: [
      'erlingHaaland',
      'erling Haaland',
      'Haaland'
    ],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Erling_Haaland_Morocco_v_Norway_7_June_2026-51.jpg',
    rasgo: 'cuerpo',
    recorte: { x: 0.00, y: 0.32, ancho: 1.00, alto: 0.35 },
    attribution: {
      autor: 'Bryan Berlin',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Erling_Haaland_Morocco_v_Norway_7_June_2026-51.jpg',
      licencia: 'CC BY-SA 4.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by-sa/4.0'
    }
  },
  {
    id: 'lionelMessi',
    nombre: 'Lionel Messi',
    alias: ["Messi", "Leo Messi", "Lionel Messi", "La Pulga"],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Lionel_Messi_20180626.jpg',
    rasgo: 'barba',
    recorte: { x: 0.15, y: 0.40, ancho: 0.70, alto: 0.10 },
    attribution: {
      autor: 'Kirill Venediktov',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Lionel_Messi_20180626.jpg',
      licencia: 'CC BY-SA 3.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by-sa/3.0'
    }
  },
  {
    id: 'kylianMbappe',
    nombre: 'Kylian Mbappé',
    alias: ["Mbappe", "Kylian Mbappe", "Kylian Mbapp\u00e9", "Donatello"],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Kylian_Mbappé_2018.jpg',
    rasgo: 'ojos',
    recorte: { x: 0.10, y: 0.25, ancho: 0.80, alto: 0.05 },
    attribution: {
      autor: 'Кирилл Венедиктов',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Kylian_Mbappé_2018.jpg',
      licencia: 'CC BY-SA 3.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by-sa/3.0'
    }
  },
  {
    id: 'neymar',
    nombre: 'Neymar Jr',
    alias: ["Neymar", "Neymar Jr", "Ney", "Neymar Junior"],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Neymar_2018.jpg',
    rasgo: 'pelo',
    recorte: { x: 0.10, y: 0.10, ancho: 0.70, alto: 0.11 },
    attribution: {
      autor: 'Кирилл Венедиктов',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Neymar_2018.jpg',
      licencia: 'CC BY-SA 3.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by-sa/3.0'
    }
  },
  {
    id: 'lebronJames',
    nombre: 'LeBron James',
    alias: ["LeBron James", "LeBron", "King James"],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/LeBron_James,_Paris_2024.jpg',
    rasgo: 'barba',
    recorte: { x: 0.10, y: 0.07, ancho: 0.80, alto: 0.10 },
    attribution: {
      autor: 'Clément Bardot',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:LeBron_James,_Paris_2024.jpg',
      licencia: 'CC BY-SA 4.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by-sa/4.0'
    }
  },
  {
    id: 'stephenCurry',
    nombre: 'Stephen Curry',
    alias: ["Stephen Curry", "Steph Curry", "Curry"],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Stephen_Curry,_Olympic_Games_2024.jpg',
    rasgo: 'piernas',
    recorte: { x: 0.10, y: 0.45, ancho: 0.80, alto: 0.45 },
    attribution: {
      autor: 'Clément Bardot',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Stephen_Curry,_Olympic_Games_2024.jpg',
      licencia: 'CC BY-SA 4.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by-sa/4.0'
    }
  },
  {
    id: 'rogerFederer',
    nombre: 'Roger Federer',
    alias: ["Roger Federer", "Federer", "Suizo"],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Roger_Federer_(26_June_2009,_Wimbledon).jpg',
    rasgo: 'nariz',
    recorte: { x: 0.18, y: 0.10, ancho: 0.60, alto: 0.10 },
    attribution: {
      autor: 'Squeaky Knees',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Roger_Federer_(26_June_2009,_Wimbledon).jpg',
      licencia: 'CC BY 2.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by/2.0'
    }
  },
  {
    id: 'novakDjokovic',
    nombre: 'Novak Djokovic',
    alias: ["Novak Djokovic", "Djokovic", "Nole"],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Novak_Djokovic,_Indian_Wells_2024.jpg',
    rasgo: 'pelo',
    recorte: { x: 0.10, y: 0.50, ancho: 0.80, alto: 0.45 },
    attribution: {
      autor: 'RayaJogi',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Novak_Djokovic,_Indian_Wells_2024.jpg',
      licencia: 'CC0',
      licenciaUrl: 'https://creativecommons.org/licenses'
    }
  },
  {
    id: 'carlosAlcaraz',
    nombre: 'Carlos Alcaraz',
    alias: ["Carlos Alcaraz", "Alcaraz", "Carlitos"],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Carlos_Alcaraz_(2026_US_Open)_-_09.jpg',
    rasgo: 'brazos',
    recorte: { x: 0.05, y: 0.00, ancho: 0.90, alto: 0.10 },
    attribution: {
      autor: 'Oleg Yunakov',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Carlos_Alcaraz_(2026_US_Open)_-_09.jpg',
      licencia: 'CC BY-SA 4.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by-sa/4.0'
    }
  },
  {
    id: 'pauGasol',
    nombre: 'Pau Gasol',
    alias: ["Pau Gasol", "Gasol", "Pau"],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Pau_Gasol_Beijing_Olympic.jpg',
    rasgo: 'barba',
    recorte: { x: 0.25, y: 0.50, ancho: 0.70, alto: 0.45 },
    attribution: {
      autor: 'Richard Giles',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Pau_Gasol_Beijing_Olympic.jpg',
      licencia: 'CC BY-SA 2.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by-sa/2.0'
    }
  },
  {
    id: 'carlosSainz',
    nombre: 'Carlos Sainz',
    alias: ["Carlos Sainz", "Sainz", "Chili"],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Carlos_Sainz_2014_Dakar.jpg',
    rasgo: 'ojos',
    recorte: { x: 0.05, y: 0.40, ancho: 0.80, alto: 0.45 },
    attribution: {
      autor: 'Flavien Duhamel / Peugeot Sport',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Carlos_Sainz_2014_Dakar.jpg',
      licencia: 'CC BY-SA 3.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by-sa/3.0'
    }
  },
  {
    id: 'sergioRamos',
    nombre: 'Sergio Ramos',
    alias: ["Sergio Ramos", "Ramos", "SR4"],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Sergio_Ramos_Interview_2021.jpg',
    rasgo: 'barba',
    recorte: { x: 0.15, y: 0.35, ancho: 0.70, alto: 0.25 },
    attribution: {
      autor: 'Real Madrid',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Sergio_Ramos_Interview_2021.jpg',
      licencia: 'CC BY 3.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by/3.0'
    }
  },
  {
    id: 'ikerCasillas',
    nombre: 'Iker Casillas',
    alias: ["Iker Casillas", "Casillas", "Iker"],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Iker-Casillas-SportsTrade-2021-cropped.jpg',
    rasgo: 'ojos',
    recorte: { x: 0.15, y: 0.25, ancho: 0.70, alto: 0.15 },
    attribution: {
      autor: 'Web Summit',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Iker-Casillas-SportsTrade-2021-cropped.jpg',
      licencia: 'CC BY 2.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by/2.0'
    }
  },
  {
    id: 'andresIniesta',
    nombre: 'Andrés Iniesta',
    alias: ["Andres Iniesta", "Andrés Iniesta", "Iniesta"],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Andr%C3%A9s_Iniesta_(cropped).jpg',
    rasgo: 'ojos',
    recorte: { x: 0.15, y: 0.04, ancho: 0.70, alto: 0.10 },
    attribution: {
      autor: 'Кирилл Венедиктов',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Andr%C3%A9s_Iniesta_(cropped).jpg',
      licencia: 'CC BY-SA 3.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by-sa/3.0'
    }
  },
  {
    id: 'lamineYamal',
    nombre: 'Lamine Yamal',
    alias: ["Lamine Yamal", "Yamal", "Lamine"],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Lamine_Yamal_Argentina_v_Spain_19_July_2026-214.jpg',
    rasgo: 'boca',
    recorte: { x: 0.10, y: 0.20, ancho: 0.70, alto: 0.05 },
    attribution: {
      autor: 'Bryan Berlin',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Lamine_Yamal_Argentina_v_Spain_19_July_2026-214.jpg',
      licencia: 'CC BY-SA 4.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by-sa/4.0'
    }
  },
  {
    id: 'bradPitt',
    nombre: 'Brad Pitt',
    alias: ["Brad Pitt", "Pitt"],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Brad_Pitt_2019_by_Glenn_Francis.jpg',
    rasgo: 'ojos',
    recorte: { x: 0.12, y: 0.40, ancho: 0.80, alto: 0.10 },
    attribution: {
      autor: 'Glenn Francis',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Brad_Pitt_2019_by_Glenn_Francis.jpg',
      licencia: 'CC BY-SA 4.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by-sa/4.0'
    }
  },
  {
    id: 'angelinaJolie',
    nombre: 'Angelina Jolie',
    alias: ["Angelina Jolie", "Jolie"],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Angelina_Jolie_2_June_2014_(cropped).jpg',
    rasgo: 'labios',
    recorte: { x: 0.10, y: 0.30, ancho: 0.80, alto: 0.10 },
    attribution: {
      autor: 'Foreign and Commonwealth Office',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Angelina_Jolie_2_June_2014_(cropped).jpg',
      licencia: 'CC BY 2.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by/2.0'
    }
  },
  {
    id: 'tomCruise',
    nombre: 'Tom Cruise',
    alias: ["Tom Cruise", "Cruise"],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Tom_Cruise_by_Gage_Skidmore_2.jpg',
    rasgo: 'dientes',
    recorte: { x: 0.20, y: 0.40, ancho: 0.60, alto: 0.15 },
    attribution: {
      autor: 'Gage Skidmore',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Tom_Cruise_by_Gage_Skidmore_2.jpg',
      licencia: 'CC BY-SA 2.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by-sa/2.0'
    }
  },
  {
    id: 'scarlettJohansson',
    nombre: 'Scarlett Johansson',
    alias: ["Scarlett Johansson", "Scarlett"],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Scarlett_Johansson_by_Gage_Skidmore_2_(cropped,_2).jpg',
    rasgo: 'ojos',
    recorte: { x: 0.15, y: 0.25, ancho: 0.70, alto: 0.15 },
    attribution: {
      autor: 'Gage Skidmore',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Scarlett_Johansson_by_Gage_Skidmore_2_(cropped,_2).jpg',
      licencia: 'CC BY-SA 3.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by-sa/3.0'
    }
  },
  {
    id: 'chrisHemsworth',
    nombre: 'Chris Hemsworth',
    alias: ["Chris Hemsworth", "Thor", "Hemsworth"],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Chris_Hemsworth_by_Gage_Skidmore_2_(cropped).jpg',
    rasgo: 'ojos',
    recorte: { x: 0.15, y: 0.15, ancho: 0.70, alto: 0.15 },
    attribution: {
      autor: 'Gage Skidmore',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Chris_Hemsworth_by_Gage_Skidmore_2_(cropped).jpg',
      licencia: 'CC BY-SA 3.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by-sa/3.0'
    }
  },
  {
    id: 'robertDowney',
    nombre: 'Robert Downey Jr',
    alias: ["Robert Downey Jr", "Robert Downey Junior", "Iron Man", "RDJ"],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Robert_Downey_Jr_2014_Comic_Con_(cropped).jpg',
    rasgo: 'gafas',
    recorte: { x: 0.10, y: 0.43, ancho: 0.80, alto: 0.17 },
    attribution: {
      autor: 'Gage Skidmore',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Robert_Downey_Jr_2014_Comic_Con_(cropped).jpg',
      licencia: 'CC BY-SA 2.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by-sa/2.0'
    }
  },
  {
    id: 'leonardoDicaprio',
    nombre: 'Leonardo DiCaprio',
    alias: ["Leonardo DiCaprio", "DiCaprio", "Leo DiCaprio"],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Leonardo_DiCaprio_2014.jpg',
    rasgo: 'ojos',
    recorte: { x: 0.15, y: 0.10, ancho: 0.70, alto: 0.20 },
    attribution: {
      autor: 'Colin Chou',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Leonardo_DiCaprio_2014.jpg',
      licencia: 'CC BY-SA 2.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by-sa/2.0'
    }
  },
  {
    id: 'willSmith',
    nombre: 'Will Smith',
    alias: ["Will Smith", "Smith", "El principe de bel air"],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Will_Smith_by_Gage_Skidmore_2.jpg',
    rasgo: 'orejas',
    recorte: { x: 0.03, y: 0.30, ancho: 0.90, alto: 0.17 },
    attribution: {
      autor: 'Gage Skidmore',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Will_Smith_by_Gage_Skidmore_2.jpg',
      licencia: 'CC BY-SA 3.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by-sa/3.0'
    }
  },
  {
    id: 'javierBardem',
    nombre: 'Javier Bardem',
    alias: ["Javier Bardem", "Bardem"],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Javier_Bardem_Cannes_2018.jpg',
    rasgo: 'boca',
    recorte: { x: 0.13, y: 0.30, ancho: 0.80, alto: 0.07 },
    attribution: {
      autor: 'Georges Biard',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Javier_Bardem_Cannes_2018.jpg',
      licencia: 'CC BY-SA 3.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by-sa/3.0'
    }
  },
  {
    id: 'antonioBanderas',
    nombre: 'Antonio Banderas',
    alias: ["Antonio Banderas", "Banderas"],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Antonio_Banderas-66031_(cropped).jpg',
    rasgo: 'ojos',
    recorte: { x: 0.13, y: 0.05, ancho: 0.70, alto: 0.20 },
    attribution: {
      autor: 'Harald Krichel',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Antonio_Banderas_Cannes_2019.jpg',
      licencia: 'CC BY-SA 4.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by-sa/4.0'
    }
  },
  {
    id: 'elsaPataky',
    nombre: 'Elsa Pataky',
    alias: ["Elsa Pataky", "Pataky"],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Elsa_Pataky_Cannes.jpg',
    rasgo: 'pelo',
    recorte: { x: 0.10, y: 0.10, ancho: 0.80, alto: 0.10 },
    attribution: {
      autor: 'Georges Biard',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Elsa_Pataky_Cannes.jpg',
      licencia: 'CC BY-SA 3.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by-sa/3.0'
    }
  },
  {
    id: 'ursulaCorbero',
    nombre: 'Úrsula Corberó',
    alias: ["Ursula Corbero", "Úrsula Corberó", "Tokio"],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Premios_Goya_2018_-_%C3%9Arsula_Corber%C3%B3.jpg',
    rasgo: 'pelo',
    recorte: { x: 0.10, y: 0.05, ancho: 0.80, alto: 0.15 },
    attribution: {
      autor: 'Rubén Ortega',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Premios_Goya_2018_-_%C3%9Arsula_Corber%C3%B3.jpg',
      licencia: 'CC BY-SA 4.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by-sa/4.0'
    }
  },
  {
    id: 'pedroPascal',
    nombre: 'Pedro Pascal',
    alias: ["Pedro Pascal", "Pascal", "Mandalorian"],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Pedro_Pascal_by_Gage_Skidmore.jpg',
    rasgo: 'barba',
    recorte: { x: 0.07, y: 0.40, ancho: 0.80, alto: 0.15 },
    attribution: {
      autor: 'Gage Skidmore',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Pedro_Pascal_by_Gage_Skidmore.jpg',
      licencia: 'CC BY-SA 3.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by-sa/3.0'
    }
  },
  {
    id: 'salmaHayek',
    nombre: 'Salma Hayek',
    alias: ["Salma Hayek", "Hayek"],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Salma_Hayek_by_Gage_Skidmore.jpg',
    rasgo: 'ojos',
    recorte: { x: 0.10, y: 0.25, ancho: 0.80, alto: 0.15 },
    attribution: {
      autor: 'Gage Skidmore',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Salma_Hayek_by_Gage_Skidmore.jpg',
      licencia: 'CC BY-SA 3.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by-sa/3.0'
    }
  },
  {
    id: 'ryanGosling',
    nombre: 'Ryan Gosling',
    alias: ["Ryan Gosling", "Gosling", "Ken"],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Ryan_Gosling_in_2018.jpg',
    rasgo: 'ojos',
    recorte: { x: 0.15, y: 0.30, ancho: 0.70, alto: 0.10 },
    attribution: {
      autor: 'NASA / Bill Ingalls',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Ryan_Gosling_in_2018.jpg',
      licencia: 'Public domain',
      licenciaUrl: 'https://creativecommons.org/publicdomain/mark/1.0/'
    }
  },
  {
    id: 'taylorSwift',
    nombre: 'Taylor Swift',
    alias: ["Taylor Swift", "Taylor", "Swift"],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Taylor_Swift_at_the_2023_MTV_Video_Music_Awards_4.png',
    rasgo: 'labios',
    recorte: { x: 0.15, y: 0.40, ancho: 0.80, alto: 0.10 },
    attribution: {
      autor: 'Cosmopolitan UK',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Taylor_Swift_at_the_2023_MTV_Video_Music_Awards_4.png',
      licencia: 'CC BY 3.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by/3.0'
    }
  },
  {
    id: 'beyonce',
    nombre: 'Beyoncé',
    alias: ["Beyonce", "Beyoncé", "Queen B"],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Beyonc%C3%A9_-_Tottenham_Hotspur_Stadium_-_1st_June_2023_(10_of_118)_(52946364598)_(best_crop).jpg',
    rasgo: 'pelo',
    recorte: { x: 0.10, y: 0.25, ancho: 0.80, alto: 0.50 },
    attribution: {
      autor: 'Raph_PH',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Beyonc%C3%A9_-_Tottenham_Hotspur_Stadium_-_1st_June_2023_(10_of_118)_(52946364598)_(best_crop).jpg',
      licencia: 'CC BY 2.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by/2.0'
    }
  },
  {
    id: 'shakira',
    nombre: 'Shakira',
    alias: ["Shakira"],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Shakira_Rio_04.jpg',
    rasgo: 'pelo',
    recorte: { x: 0.10, y: 0.40, ancho: 0.80, alto: 0.60 },
    attribution: {
      autor: 'Andres Arranz',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Shakira_Rio_04.jpg',
      licencia: 'CC BY 2.5',
      licenciaUrl: 'https://creativecommons.org/licenses/by/2.5'
    }
  },
  {
    id: 'alejandroSanz',
    nombre: 'Alejandro Sanz',
    alias: ["Alejandro Sanz", "Sanz"],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Goyas_2025_-_Alejandro_Sanz_(cropped).jpg',
    rasgo: 'ojos',
    recorte: { x: 0.15, y: 0.35, ancho: 0.70, alto: 0.15 },
    attribution: {
      autor: 'Pedro J Pacheco',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Goyas_2025_-_Alejandro_Sanz_(cropped).jpg',
      licencia: 'CC BY-SA 4.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by-sa/4.0'
    }
  },
  {
    id: 'davidBisbal',
    nombre: 'David Bisbal',
    alias: ["David Bisbal", "Bisbal"],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/2023-11-16_Gala_de_los_Latin_Grammy,_39_(cropped).jpg',
    rasgo: 'rizos',
    recorte: { x: 0.08, y: 0.10, ancho: 0.80, alto: 0.20 },
    attribution: {
      autor: 'Junta de Andalucía',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:2023-11-16_Gala_de_los_Latin_Grammy,_39_(cropped).jpg',
      licencia: 'CC BY-SA 2.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by-sa/2.0'
    }
  },
  {
    id: 'enriqueIglesias',
    nombre: 'Enrique Iglesias',
    alias: ["Enrique Iglesias", "Iglesias", "Enrique"],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Enrique_Iglesias_2011,_2.jpg',
    rasgo: 'gorra',
    recorte: { x: 0.03, y: 0.05, ancho: 0.70, alto: 0.10 },
    attribution: {
      autor: 'Eva Rinaldi',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Enrique_Iglesias_2011,_2.jpg',
      licencia: 'CC BY-SA 2.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by-sa/2.0'
    }
  },
  {
    id: 'badBunny',
    nombre: 'Bad Bunny',
    alias: ["Bad Bunny", "Benito", "San Benito"],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Bad_Bunny_2019_by_Glenn_Francis_(cropped).jpg',
    rasgo: 'gafas',
    recorte: { x: 0.07, y: 0.50, ancho: 0.80, alto: 0.15 },
    attribution: {
      autor: 'Glenn Francis',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Bad_Bunny_2019_by_Glenn_Francis_(cropped).jpg',
      licencia: 'CC BY-SA 4.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by-sa/4.0'
    }
  },
  {
    id: 'jBalvin',
    nombre: 'J Balvin',
    alias: ["J Balvin", "Balvin", "Jose"],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/J_Balvin_-_Otra_Vez_-_Festival_de_Vi%C3%B1a_del_Mar_2017.jpg',
    rasgo: 'pelo',
    recorte: { x: 0.08, y: 0.05, ancho: 0.80, alto: 0.18 },
    attribution: {
      autor: 'festivaldevinachile',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:J_Balvin_-_Otra_Vez_-_Festival_de_Vi%C3%B1a_del_Mar_2017.jpg',
      licencia: 'CC BY 3.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by/3.0'
    }
  },
  {
    id: 'karolG',
    nombre: 'Karol G',
    alias: ["Karol G", "La Bichota", "Bichota"],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Karol_G_en_2018.jpg',
    rasgo: 'ojos',
    recorte: { x: 0.05, y: 0.20, ancho: 0.80, alto: 0.15 },
    attribution: {
      autor: 'Premios Nuestra Tierra',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Karol_G_en_2018.jpg',
      licencia: 'CC BY 3.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by/3.0'
    }
  },
  {
    id: 'duaLipa',
    nombre: 'Dua Lipa',
    alias: ["Dua Lipa", "Lipa"],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Dua_Lipa_See_in_Blue_5.png',
    rasgo: 'ojos',
    recorte: { x: 0.12, y: 0.23, ancho: 0.80, alto: 0.15 },
    attribution: {
      autor: 'sperry',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Dua_Lipa_See_in_Blue_5.png',
      licencia: 'CC BY 3.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by/3.0'
    }
  },
  {
    id: 'billieEilish',
    nombre: 'Billie Eilish',
    alias: ["Billie Eilish", "Billie", "Eilish"],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Billie_Eilish_2019_by_Glenn_Francis_(cropped)_2.jpg',
    rasgo: 'ojos',
    recorte: { x: 0.10, y: 0.30, ancho: 0.80, alto: 0.10 },
    attribution: {
      autor: 'Glenn Francis',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Billie_Eilish_2019_by_Glenn_Francis_(cropped)_2.jpg',
      licencia: 'CC BY-SA 4.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by-sa/4.0'
    }
  },
  {
    id: 'edSheeran',
    nombre: 'Ed Sheeran',
    alias: ["Ed Sheeran", "Sheeran"],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Ed_Sheeran-6886_(cropped).jpg',
    rasgo: 'pelo pelirrojo',
    recorte: { x: 0.10, y: 0.05, ancho: 0.80, alto: 0.20 },
    attribution: {
      autor: 'Harald Krichel',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Ed_Sheeran-6886_(cropped).jpg',
      licencia: 'CC BY-SA 4.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by-sa/4.0'
    }
  },
  {
    id: 'aitana',
    nombre: 'Aitana',
    alias: ["Aitana", "Aitana Ocaña"],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Aitana_Oca%C3%B1a_2024_(cropped).jpg',
    rasgo: 'flequillo',
    recorte: { x: 0.08, y: 0.05, ancho: 0.80, alto: 0.28 },
    attribution: {
      autor: 'Revista Lecturas',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Aitana_Oca%C3%B1a_2024_(cropped).jpg',
      licencia: 'CC0',
      licenciaUrl: 'https://creativecommons.org/licenses'
    }
  },
  {
    id: 'cTangana',
    nombre: 'C. Tangana',
    alias: ["C Tangana", "C. Tangana", "El Madrileño", "Pucho"],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Goyas_2025_-_C_Tangana_(cropped).jpg',
    rasgo: 'bigote',
    recorte: { x: 0.17, y: 0.00, ancho: 0.60, alto: 0.18 },
    attribution: {
      autor: 'Pedro J Pacheco',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Goyas_2025_-_C_Tangana_(cropped).jpg',
      licencia: 'CC BY-SA 4.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by-sa/4.0'
    }
  },
  {
    id: 'quevedo',
    nombre: 'Quevedo',
    alias: ["Quevedo", "Pedro Luis Domínguez Quevedo"],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Quevedo2023hh.jpg',
    rasgo: 'boca',
    recorte: { x: 0.15, y: 0.20, ancho: 0.70, alto: 0.60 },
    attribution: {
      autor: 'Helly',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Quevedo2023hh.jpg',
      licencia: 'CC BY-SA 4.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by-sa/4.0'
    }
  },
  {
    id: 'auronplay',
    nombre: 'AuronPlay',
    alias: ["AuronPlay", "Auron", "Raul Alvarez"],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/AuronPlay_(2014).jpg',
    rasgo: 'ojos',
    recorte: { x: 0.15, y: 0.25, ancho: 0.70, alto: 0.15 },
    attribution: {
      autor: 'vistolovistoTV',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:AuronPlay_(2014).jpg',
      licencia: 'CC BY 3.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by/3.0'
    }
  },
  {
    id: 'elrubius',
    nombre: 'El Rubius',
    alias: ["El Rubius", "Rubius", "Ruben Doblas"],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/El_Rubius_en_el_Festival_de_cinema_de_Sitges_2018_(recorte).jpg',
    rasgo: 'pelo',
    recorte: { x: 0.07, y: 0.45, ancho: 0.80, alto: 0.20 },
    attribution: {
      autor: 'Moritz Barcelona from Barcelona, Catalunya',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:El_Rubius_en_el_Festival_de_cinema_de_Sitges_2018_(recorte).jpg',
      licencia: 'CC BY 2.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by/2.0'
    }
  },
  {
    id: 'thegrefg',
    nombre: 'TheGrefg',
    alias: ["TheGrefg", "Grefg", "David Canovas"],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/As%C3%AD_fue_la_Presentaci%C3%B3n_de_la_Velada_del_A%C3%B1o_5_06.png',
    rasgo: 'ojos',
    recorte: { x: 0.06, y: 0.05, ancho: 0.80, alto: 0.20 },
    attribution: {
      autor: 'Suzyroxx',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:As%C3%AD_fue_la_Presentaci%C3%B3n_de_la_Velada_del_A%C3%B1o_5_06.png',
      licencia: 'CC BY 3.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by/3.0'
    }
  },
  {
    id: 'pabloMotos',
    nombre: 'Pablo Motos',
    alias: ["Pablo Motos", "Motos"],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Pablo_Motos.jpg',
    rasgo: 'pelo',
    recorte: { x: 0.10, y: 0.25, ancho: 0.80, alto: 0.15 },
    attribution: {
      autor: 'Juanjo',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Pablo_Motos.jpg',
      licencia: 'CC BY-SA 2.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by-sa/2.0'
    }
  },
  {
    id: 'davidBroncano',
    nombre: 'David Broncano',
    alias: ["David Broncano", "Broncano"],
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Premios_Goya_2019_-_David_Broncano.jpg',
    rasgo: 'nariz',
    recorte: { x: 0.22, y: 0.28, ancho: 0.60, alto: 0.05 },
    attribution: {
      autor: 'Pedro J Pacheco',
      fuenteUrl: 'https://commons.wikimedia.org/wiki/File:Premios_Goya_2019_-_David_Broncano.jpg',
      licencia: 'CC BY-SA 4.0',
      licenciaUrl: 'https://creativecommons.org/licenses/by-sa/4.0'
    }
  }
];