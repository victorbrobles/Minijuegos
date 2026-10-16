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
    nombre: 'Rosalia',
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
    nombre: 'Kendal Jenner',
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
    nombre: 'Nikola Jokic',
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
  }
];