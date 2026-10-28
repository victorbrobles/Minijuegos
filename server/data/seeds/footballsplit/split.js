// server/data/seeds/footballsplit/split.seed.js

const SPLIT_RETO = [
  {
    id: "split_1",
    dificultad: "Medio",
    partes: {
      top: { 
        jugador: "Dwayne Johnson", 
        pista: "Conocido como 'La Roca' o 'The Rock'", 
        img: "https://commons.wikimedia.org/wiki/Special:FilePath/The_Rock_2023.jpg",
        recorte: { x: 0.25, y: 0.15, ancho: 0.50, alto: 0.15 } // frente
      },
      middle: { 
        jugador: "Michael Phelps", 
        pista: "Nadador estadounidense, el atleta olímpico más condecorado", 
        img: "https://commons.wikimedia.org/wiki/Special:FilePath/Michael_Phelps_(18952526936).jpg",
        recorte: { x: 0.15, y: 0.15, ancho: 0.80, alto: 0.15 } // ojos
      },
      bottom: { 
        jugador: "Cristiano Ronaldo", 
        pista: "Futbolista portugués, máximo goleador histórico", 
        img: "https://commons.wikimedia.org/wiki/Special:FilePath/Cristiano_Ronaldo,_2023.jpg",
        recorte: { x: 0.25, y: 0.30, ancho: 0.50, alto: 0.15 } // barbilla
      }
    }
  },
  {
    id: "split_2",
    dificultad: "Difícil",
    partes: {
      top: { 
        jugador: "Duki", 
        pista: "Rapero y trapero argentino (Mauro Ezequiel Lombardo)", 
        img: "https://commons.wikimedia.org/wiki/Special:FilePath/El_Duki.png",
        recorte: { x: 0.00, y: 0.15, ancho: 0.80, alto: 0.20 } // pelo
      },
      middle: { 
        jugador: "Rosalia", 
        pista: "Cantante española, famosa por el álbum 'El Mal Querer' y 'Motomami'", 
        img: "https://commons.wikimedia.org/wiki/Special:FilePath/Rosalia_2019-portrait.jpg",
        recorte: { x: 0.25, y: 0.25, ancho: 0.50, alto: 0.10 } // ojos
      },
      bottom: { 
        jugador: "Ibai Llanos", 
        pista: "Streamer español y creador de La Velada del Año", 
        img: "https://commons.wikimedia.org/wiki/Special:FilePath/Ibai_Llanos_(2024)2.jpg",
        recorte: { x: 0.11, y: 0.50, ancho: 0.80, alto: 0.15 } // barba
      }
    }
  },
  {
    id: "split_3",
    dificultad: "Difícil",
    partes: {
      top: { 
        jugador: "Vin Diesel", 
        pista: "Actor famoso por interpretar a Dominic Toretto", 
        img: "https://commons.wikimedia.org/wiki/Special:FilePath/VinDieselMarch09.jpg",
        recorte: { x: 0.05, y: 0.02, ancho: 0.80, alto: 0.20 } // pelo
      },
      middle: { 
        jugador: "Ana De Armas", 
        pista: "Actriz cubano-española nominada al Óscar por Blonde", 
        img: "https://commons.wikimedia.org/wiki/Special:FilePath/Ana_de_Armas_by_Gage_Skidmore.jpg",
        recorte: { x: 0.10, y: 0.18, ancho: 0.80, alto: 0.10 } // ojos
      },
      bottom: { 
        jugador: "Roberto Carlos", 
        pista: "Futbolista brasileño famoso por su tiro libre contra Francia", 
        img: "https://commons.wikimedia.org/wiki/Special:FilePath/LS3_1288_(53332367864)_(cropped).jpg",
        recorte: { x: 0.25, y: 0.42, ancho: 0.60, alto: 0.25 } // barbilla
      }
    }
  }
];

export default SPLIT_RETO;
