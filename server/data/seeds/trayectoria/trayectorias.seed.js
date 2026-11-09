// server/data/seeds/trayectoria/trayectorias.seed.js
import { COLORES_CLUB, siglasDe } from './escudos.js';
import { CLUBES_INFO } from '../cuatroclubes/cuatroclubes.js';

const LOGOS = {
  barca: "https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg",
  madrid: "https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg",
  atletico: "https://upload.wikimedia.org/wikipedia/en/f/f4/Atletico_Madrid_2017_logo.svg",
  manutd: "https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg",
  mancity: "https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg",
  liverpool: "https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg",
  chelsea: "https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg",
  arsenal: "https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg",
  tottenham: "https://upload.wikimedia.org/wikipedia/en/b/b4/Tottenham_Hotspur.svg",
  psg: "https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg",
  bayern: "https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg",
  dortmund: "https://upload.wikimedia.org/wikipedia/commons/6/67/Borussia_Dortmund_logo.svg",
  juventus: "https://upload.wikimedia.org/wikipedia/commons/1/15/Juventus_FC_2017_logo.svg",
  inter: "https://upload.wikimedia.org/wikipedia/commons/0/05/FC_Internazionale_Milano_2021.svg",
  milan: "https://upload.wikimedia.org/wikipedia/commons/d/d0/Logo_of_AC_Milan.svg",
  roma: "https://upload.wikimedia.org/wikipedia/en/f/f7/AS_Roma_logo_%282017%29.svg",
  napoli: "https://upload.wikimedia.org/wikipedia/commons/b/ba/SSC_Napoli_2024.svg",
  sevilla: "https://upload.wikimedia.org/wikipedia/en/3/3b/Sevilla_FC_logo.svg",
  valencia: "https://upload.wikimedia.org/wikipedia/en/c/ce/Valenciacf.svg",
  villarreal: "https://upload.wikimedia.org/wikipedia/en/7/70/Villarreal_CF_logo.svg",
  sociedad: "https://upload.wikimedia.org/wikipedia/en/f/f1/Real_Sociedad_logo.svg",
  betis: "https://upload.wikimedia.org/wikipedia/en/1/13/Real_betis_logo.svg",
  athletic: "https://upload.wikimedia.org/wikipedia/en/9/98/Club_Athletic_Bilbao_logo.svg",
  porto: "https://upload.wikimedia.org/wikipedia/en/f/f1/FC_Porto.svg",
  benfica: "https://upload.wikimedia.org/wikipedia/en/a/a2/SL_Benfica_logo.svg",
  sporting: "https://upload.wikimedia.org/wikipedia/en/e/e1/Sporting_Clube_de_Portugal_%28Logo%29.svg",
  ajax: "https://upload.wikimedia.org/wikipedia/en/7/79/Ajax_Amsterdam.svg",
  miami: "https://upload.wikimedia.org/wikipedia/en/5/5c/Inter_Miami_CF_logo.svg",
  monaco: "https://upload.wikimedia.org/wikipedia/en/b/ba/AS_Monaco_FC.svg",
  lyon: "https://upload.wikimedia.org/wikipedia/en/c/c6/Olympique_Lyonnais.svg",
  marseille: "https://upload.wikimedia.org/wikipedia/commons/d/d8/Olympique_Marseille_logo.svg",
  river: "https://upload.wikimedia.org/wikipedia/commons/a/ac/Escudo_del_C_A_River_Plate.svg",
  boca: "https://upload.wikimedia.org/wikipedia/commons/4/41/CABJ_escudo.svg",
  depor: "https://upload.wikimedia.org/wikipedia/en/4/4e/RC_Deportivo_La_Coru%C3%B1a_logo.svg",
  celta: "https://upload.wikimedia.org/wikipedia/en/1/12/RC_Celta_de_Vigo_logo.svg",
  espanyol: "https://upload.wikimedia.org/wikipedia/en/d/d6/Rcd_espanyol_logo.svg"
};

// Escudo de cada club: imagen conocida (LOGOS o «Cuatro clubes») y, siempre, colores y siglas para dibujar
// un escudo propio en el cliente si no hay imagen o no carga.
// Los SVG de Wikipedia se piden como miniatura PNG: algunos SVG (p. ej. el del Milan) no traen viewBox y se
// salen de su caja; la miniatura siempre escala bien y pesa menos.
const miniatura = (url) => {
  const m = /^https:\/\/upload\.wikimedia\.org\/wikipedia\/(commons|en)\/([0-9a-f])\/([0-9a-f]{2})\/([^/]+\.svg)$/i.exec(url || '');
  return m ? `https://upload.wikimedia.org/wikipedia/${m[1]}/thumb/${m[2]}/${m[3]}/${m[4]}/120px-${m[4]}.png` : url;
};

const c = (nombre, logoUrl, periodo) => ({
  nombre,
  logo: miniatura(logoUrl || CLUBES_INFO[nombre]?.escudo) || null,
  colores: COLORES_CLUB[nombre] || CLUBES_INFO[nombre]?.colores || ['#475569', '#ffffff'],
  siglas: siglasDe(nombre),
  periodo
});

export const RETOS_TRAYECTORIAS = [
  // --- 1 a 65: DIFICULTAD BAJA ---
  {
    id: 1,
    nombre: "Lionel Messi",
    dificultad: "baja",
    alias: ["messi", "leo messi"],
    nacionalidad: "Argentina",
    clubes: [
      c("FC Barcelona", LOGOS.barca, "2004 - 2021"),
      c("Paris Saint-Germain", LOGOS.psg, "2021 - 2023"),
      c("Inter Miami", LOGOS.miami, "2023 - Presente")
    ]
  },
  {
    id: 2,
    nombre: "Cristiano Ronaldo",
    dificultad: "baja",
    alias: ["cristiano", "ronaldo", "cr7"],
    nacionalidad: "Portugal",
    clubes: [
      c("Sporting CP", LOGOS.sporting, "2002 - 2003"),
      c("Manchester United", LOGOS.manutd, "2003 - 2009"),
      c("Real Madrid", LOGOS.madrid, "2009 - 2018"),
      c("Juventus", LOGOS.juventus, "2018 - 2021"),
      c("Manchester United", LOGOS.manutd, "2021 - 2022"),
      c("Al Nassr", null, "2023 - Presente")
    ]
  },
  {
    id: 3,
    nombre: "Kylian Mbappé",
    dificultad: "baja",
    alias: ["mbappe", "kylian mbappe"],
    nacionalidad: "Francia",
    clubes: [
      c("AS Mónaco", LOGOS.monaco, "2015 - 2017"),
      c("Paris Saint-Germain", LOGOS.psg, "2017 - 2024"),
      c("Real Madrid", LOGOS.madrid, "2024 - Presente")
    ]
  },
  {
    id: 4,
    nombre: "Erling Haaland",
    dificultad: "baja",
    alias: ["haaland", "haland"],
    nacionalidad: "Noruega",
    clubes: [
      c("Bryne FK", null, "2015 - 2016"),
      c("Molde FK", null, "2017 - 2018"),
      c("Red Bull Salzburg", null, "2019 - 2020"),
      c("Borussia Dortmund", LOGOS.dortmund, "2020 - 2022"),
      c("Manchester City", LOGOS.mancity, "2022 - Presente")
    ]
  },
  {
    id: 5,
    nombre: "Neymar Jr",
    dificultad: "baja",
    alias: ["neymar", "neymar jr"],
    nacionalidad: "Brasil",
    clubes: [
      c("Santos FC", null, "2009 - 2013"),
      c("FC Barcelona", LOGOS.barca, "2013 - 2017"),
      c("Paris Saint-Germain", LOGOS.psg, "2017 - 2023"),
      c("Al Hilal", null, "2023 - Presente")
    ]
  },
  {
    id: 6,
    nombre: "Karim Benzema",
    dificultad: "baja",
    alias: ["benzema"],
    nacionalidad: "Francia",
    clubes: [
      c("Olympique de Lyon", LOGOS.lyon, "2004 - 2009"),
      c("Real Madrid", LOGOS.madrid, "2009 - 2023"),
      c("Al Ittihad", null, "2023 - Presente")
    ]
  },
  {
    id: 7,
    nombre: "Luka Modric",
    dificultad: "baja",
    alias: ["modric"],
    nacionalidad: "Croacia",
    clubes: [
      c("Dinamo Zagreb", null, "2003 - 2008"),
      c("Tottenham Hotspur", LOGOS.tottenham, "2008 - 2012"),
      c("Real Madrid", LOGOS.madrid, "2012 - Presente")
    ]
  },
  {
    id: 8,
    nombre: "Robert Lewandowski",
    dificultad: "baja",
    alias: ["lewandowski"],
    nacionalidad: "Polonia",
    clubes: [
      c("Znicz Pruszków", null, "2006 - 2008"),
      c("Lech Poznan", null, "2008 - 2010"),
      c("Borussia Dortmund", LOGOS.dortmund, "2010 - 2014"),
      c("Bayern Múnich", LOGOS.bayern, "2014 - 2022"),
      c("FC Barcelona", LOGOS.barca, "2022 - Presente")
    ]
  },
  {
    id: 9,
    nombre: "Sergio Ramos",
    dificultad: "baja",
    alias: ["ramos", "sergio ramos"],
    nacionalidad: "España",
    clubes: [
      c("Sevilla FC", LOGOS.sevilla, "2003 - 2005"),
      c("Real Madrid", LOGOS.madrid, "2005 - 2021"),
      c("Paris Saint-Germain", LOGOS.psg, "2021 - 2023"),
      c("Sevilla FC", LOGOS.sevilla, "2023 - 2024")
    ]
  },
  {
    id: 10,
    nombre: "Kevin De Bruyne",
    dificultad: "baja",
    alias: ["de bruyne", "kdb"],
    nacionalidad: "Bélgica",
    clubes: [
      c("KRC Genk", null, "2008 - 2012"),
      c("Chelsea FC", LOGOS.chelsea, "2012 - 2014"),
      c("Werder Bremen", null, "2012 - 2013"),
      c("VfL Wolfsburg", null, "2014 - 2015"),
      c("Manchester City", LOGOS.mancity, "2015 - Presente")
    ]
  },
  {
    id: 11,
    nombre: "Mohamed Salah",
    dificultad: "baja",
    alias: ["salah", "mo salah"],
    nacionalidad: "Egipto",
    clubes: [
      c("Al Mokawloon", null, "2010 - 2012"),
      c("FC Basilea", null, "2012 - 2014"),
      c("Chelsea FC", LOGOS.chelsea, "2014 - 2016"),
      c("Fiorentina", null, "2015"),
      c("AS Roma", LOGOS.roma, "2015 - 2017"),
      c("Liverpool FC", LOGOS.liverpool, "2017 - Presente")
    ]
  },
  {
    id: 12,
    nombre: "Eden Hazard",
    dificultad: "baja",
    alias: ["hazard"],
    nacionalidad: "Bélgica",
    clubes: [
      c("Lille OSC", null, "2007 - 2012"),
      c("Chelsea FC", LOGOS.chelsea, "2012 - 2019"),
      c("Real Madrid", LOGOS.madrid, "2019 - 2023")
    ]
  },
  {
    id: 13,
    nombre: "Gareth Bale",
    dificultad: "baja",
    alias: ["bale"],
    nacionalidad: "Gales",
    clubes: [
      c("Southampton FC", null, "2006 - 2007"),
      c("Tottenham Hotspur", LOGOS.tottenham, "2007 - 2013"),
      c("Real Madrid", LOGOS.madrid, "2013 - 2022"),
      c("Tottenham Hotspur", LOGOS.tottenham, "2020 - 2021"),
      c("Los Angeles FC", null, "2022")
    ]
  },
  {
    id: 14,
    nombre: "Antoine Griezmann",
    dificultad: "baja",
    alias: ["griezmann"],
    nacionalidad: "Francia",
    clubes: [
      c("Real Sociedad", LOGOS.sociedad, "2009 - 2014"),
      c("Atlético de Madrid", LOGOS.atletico, "2014 - 2019"),
      c("FC Barcelona", LOGOS.barca, "2019 - 2021"),
      c("Atlético de Madrid", LOGOS.atletico, "2021 - Presente")
    ]
  },
  {
    id: 15,
    nombre: "Vinicius Jr",
    dificultad: "baja",
    alias: ["vinicius", "vini jr"],
    nacionalidad: "Brasil",
    clubes: [
      c("Flamengo", null, "2017 - 2018"),
      c("Real Madrid", LOGOS.madrid, "2018 - Presente")
    ]
  },
  {
    id: 16,
    nombre: "Harry Kane",
    dificultad: "baja",
    alias: ["kane", "harry kane"],
    nacionalidad: "Inglaterra",
    clubes: [
      c("Tottenham Hotspur", LOGOS.tottenham, "2009 - 2023"),
      c("Leicester City", null, "2013"),
      c("Bayern Múnich", LOGOS.bayern, "2023 - Presente")
    ]
  },
  {
    id: 17,
    nombre: "Andrés Iniesta",
    dificultad: "baja",
    alias: ["iniesta"],
    nacionalidad: "España",
    clubes: [
      c("FC Barcelona", LOGOS.barca, "2002 - 2018"),
      c("Vissel Kobe", null, "2018 - 2023"),
      c("Emirates Club", null, "2023 - 2024")
    ]
  },
  {
    id: 18,
    nombre: "Xavi Hernández",
    dificultad: "baja",
    alias: ["xavi"],
    nacionalidad: "España",
    clubes: [
      c("FC Barcelona", LOGOS.barca, "1998 - 2015"),
      c("Al Sadd SC", null, "2015 - 2019")
    ]
  },
  {
    id: 19,
    nombre: "Iker Casillas",
    dificultad: "baja",
    alias: ["casillas"],
    nacionalidad: "España",
    clubes: [
      c("Real Madrid", LOGOS.madrid, "1999 - 2015"),
      c("FC Porto", LOGOS.porto, "2015 - 2020")
    ]
  },
  {
    id: 20,
    nombre: "Angel Di María",
    dificultad: "baja",
    alias: ["di maria", "fideo"],
    nacionalidad: "Argentina",
    clubes: [
      c("Rosario Central", null, "2005 - 2007"),
      c("SL Benfica", LOGOS.benfica, "2007 - 2010"),
      c("Real Madrid", LOGOS.madrid, "2010 - 2014"),
      c("Manchester United", LOGOS.manutd, "2014 - 2015"),
      c("Paris Saint-Germain", LOGOS.psg, "2015 - 2022"),
      c("Juventus", LOGOS.juventus, "2022 - 2023"),
      c("SL Benfica", LOGOS.benfica, "2023 - Presente")
    ]
  },
  {
    id: 21,
    nombre: "Sergio Agüero",
    dificultad: "baja",
    alias: ["aguero", "kun"],
    nacionalidad: "Argentina",
    clubes: [
      c("Independiente", null, "2003 - 2006"),
      c("Atlético de Madrid", LOGOS.atletico, "2006 - 2011"),
      c("Manchester City", LOGOS.mancity, "2011 - 2021"),
      c("FC Barcelona", LOGOS.barca, "2021")
    ]
  },
  {
    id: 22,
    nombre: "Luis Figo",
    dificultad: "baja",
    alias: ["figo"],
    nacionalidad: "Portugal",
    clubes: [
      c("Sporting CP", LOGOS.sporting, "1989 - 1995"),
      c("FC Barcelona", LOGOS.barca, "1995 - 2000"),
      c("Real Madrid", LOGOS.madrid, "2000 - 2005"),
      c("Inter de Milán", LOGOS.inter, "2005 - 2009")
    ]
  },
  {
    id: 23,
    nombre: "Zinedine Zidane",
    dificultad: "baja",
    alias: ["zidane", "zizou"],
    nacionalidad: "Francia",
    clubes: [
      c("AS Cannes", null, "1989 - 1992"),
      c("Girondins de Burdeos", null, "1992 - 1996"),
      c("Juventus", LOGOS.juventus, "1996 - 2001"),
      c("Real Madrid", LOGOS.madrid, "2001 - 2006")
    ]
  },
  {
    id: 24,
    nombre: "Ronaldo Nazário",
    dificultad: "baja",
    alias: ["ronaldo", "el fenomeno"],
    nacionalidad: "Brasil",
    clubes: [
      c("Cruzeiro", null, "1993 - 1994"),
      c("PSV Eindhoven", null, "1994 - 1996"),
      c("FC Barcelona", LOGOS.barca, "1996 - 1997"),
      c("Inter de Milán", LOGOS.inter, "1997 - 2002"),
      c("Real Madrid", LOGOS.madrid, "2002 - 2007"),
      c("AC Milan", LOGOS.milan, "2007 - 2008"),
      c("Corinthians", null, "2009 - 2011")
    ]
  },
  {
    id: 25,
    nombre: "Ronaldinho",
    dificultad: "baja",
    alias: ["ronaldinho"],
    nacionalidad: "Brasil",
    clubes: [
      c("Grêmio", null, "1998 - 2001"),
      c("Paris Saint-Germain", LOGOS.psg, "2001 - 2003"),
      c("FC Barcelona", LOGOS.barca, "2003 - 2008"),
      c("AC Milan", LOGOS.milan, "2008 - 2011"),
      c("Flamengo", null, "2011 - 2012"),
      c("Atlético Mineiro", null, "2012 - 2014"),
      c("Querétaro FC", null, "2014 - 2015")
    ]
  },
  {
    id: 26,
    nombre: "Thierry Henry",
    dificultad: "baja",
    alias: ["henry"],
    nacionalidad: "Francia",
    clubes: [
      c("AS Mónaco", LOGOS.monaco, "1994 - 1999"),
      c("Juventus", LOGOS.juventus, "1999"),
      c("Arsenal FC", LOGOS.arsenal, "1999 - 2007"),
      c("FC Barcelona", LOGOS.barca, "2007 - 2010"),
      c("New York Red Bulls", null, "2010 - 2014")
    ]
  },
  {
    id: 27,
    nombre: "Gianluigi Buffon",
    dificultad: "baja",
    alias: ["buffon"],
    nacionalidad: "Italia",
    clubes: [
      c("Parma Calcio", null, "1995 - 2001"),
      c("Juventus", LOGOS.juventus, "2001 - 2018"),
      c("Paris Saint-Germain", LOGOS.psg, "2018 - 2019"),
      c("Juventus", LOGOS.juventus, "2019 - 2021"),
      c("Parma Calcio", null, "2021 - 2023")
    ]
  },
  {
    id: 28,
    nombre: "Andrea Pirlo",
    dificultad: "baja",
    alias: ["pirlo"],
    nacionalidad: "Italia",
    clubes: [
      c("Brescia", null, "1995 - 1998"),
      c("Inter de Milán", LOGOS.inter, "1998 - 2001"),
      c("AC Milan", LOGOS.milan, "2001 - 2011"),
      c("Juventus", LOGOS.juventus, "2011 - 2015"),
      c("New York City FC", null, "2015 - 2017")
    ]
  },
  {
    id: 29,
    nombre: "Kaká",
    dificultad: "baja",
    alias: ["kaka"],
    nacionalidad: "Brasil",
    clubes: [
      c("São Paulo FC", null, "2001 - 2003"),
      c("AC Milan", LOGOS.milan, "2003 - 2009"),
      c("Real Madrid", LOGOS.madrid, "2009 - 2013"),
      c("AC Milan", LOGOS.milan, "2013 - 2014"),
      c("Orlando City", null, "2014 - 2017")
    ]
  },
  {
    id: 30,
    nombre: "Luis Suárez",
    dificultad: "baja",
    alias: ["suarez", "luis suarez"],
    nacionalidad: "Uruguay",
    clubes: [
      c("Nacional", null, "2005 - 2006"),
      c("FC Groningen", null, "2006 - 2007"),
      c("AFC Ajax", LOGOS.ajax, "2007 - 2011"),
      c("Liverpool FC", LOGOS.liverpool, "2011 - 2014"),
      c("FC Barcelona", LOGOS.barca, "2014 - 2020"),
      c("Atlético de Madrid", LOGOS.atletico, "2020 - 2022"),
      c("Grêmio", null, "2023"),
      c("Inter Miami", LOGOS.miami, "2024 - Presente")
    ]
  },
  {
    id: 31,
    nombre: "Zlatan Ibrahimović",
    dificultad: "baja",
    alias: ["ibrahimovic", "zlatan"],
    nacionalidad: "Suecia",
    clubes: [
      c("Malmö FF", null, "1999 - 2001"),
      c("AFC Ajax", LOGOS.ajax, "2001 - 2004"),
      c("Juventus", LOGOS.juventus, "2004 - 2006"),
      c("Inter de Milán", LOGOS.inter, "2006 - 2009"),
      c("FC Barcelona", LOGOS.barca, "2009 - 2010"),
      c("AC Milan", LOGOS.milan, "2010 - 2012"),
      c("Paris Saint-Germain", LOGOS.psg, "2012 - 2016"),
      c("Manchester United", LOGOS.manutd, "2016 - 2018"),
      c("LA Galaxy", null, "2018 - 2019"),
      c("AC Milan", LOGOS.milan, "2020 - 2023")
    ]
  },
  {
    id: 32,
    nombre: "Toni Kroos",
    dificultad: "baja",
    alias: ["kroos"],
    nacionalidad: "Alemania",
    clubes: [
      c("Bayern Múnich", LOGOS.bayern, "2007 - 2009"),
      c("Bayer Leverkusen", null, "2009 - 2010"),
      c("Bayern Múnich", LOGOS.bayern, "2010 - 2014"),
      c("Real Madrid", LOGOS.madrid, "2014 - 2024")
    ]
  },
  {
    id: 33,
    nombre: "Carles Puyol",
    dificultad: "baja",
    alias: ["puyol"],
    nacionalidad: "España",
    clubes: [
      c("FC Barcelona", LOGOS.barca, "1999 - 2014")
    ]
  },
  {
    id: 34,
    nombre: "Raúl González",
    dificultad: "baja",
    alias: ["raul"],
    nacionalidad: "España",
    clubes: [
      c("Real Madrid", LOGOS.madrid, "1994 - 2010"),
      c("Schalke 04", null, "2010 - 2012"),
      c("Al Sadd SC", null, "2012 - 2014"),
      c("New York Cosmos", null, "2014 - 2015")
    ]
  },
  {
    id: 35,
    nombre: "Gerard Piqué",
    dificultad: "baja",
    alias: ["pique"],
    nacionalidad: "España",
    clubes: [
      c("Manchester United", LOGOS.manutd, "2004 - 2006"),
      c("Real Zaragoza", null, "2006 - 2007"),
      c("Manchester United", LOGOS.manutd, "2007 - 2008"),
      c("FC Barcelona", LOGOS.barca, "2008 - 2022")
    ]
  },
  {
    id: 36,
    nombre: "Sergio Busquets",
    dificultad: "baja",
    alias: ["busquets"],
    nacionalidad: "España",
    clubes: [
      c("FC Barcelona", LOGOS.barca, "2008 - 2023"),
      c("Inter Miami", LOGOS.miami, "2023 - Presente")
    ]
  },
  {
    id: 37,
    nombre: "Dani Alves",
    dificultad: "baja",
    alias: ["alves", "dani alves"],
    nacionalidad: "Brasil",
    clubes: [
      c("Bahia", null, "2001 - 2002"),
      c("Sevilla FC", LOGOS.sevilla, "2002 - 2008"),
      c("FC Barcelona", LOGOS.barca, "2008 - 2016"),
      c("Juventus", LOGOS.juventus, "2016 - 2017"),
      c("Paris Saint-Germain", LOGOS.psg, "2017 - 2019"),
      c("São Paulo FC", null, "2019 - 2021"),
      c("FC Barcelona", LOGOS.barca, "2021 - 2022"),
      c("Pumas UNAM", null, "2022 - 2023")
    ]
  },
  {
    id: 38,
    nombre: "Marcelo",
    dificultad: "baja",
    alias: ["marcelo"],
    nacionalidad: "Brasil",
    clubes: [
      c("Fluminense", null, "2005 - 2006"),
      c("Real Madrid", LOGOS.madrid, "2007 - 2022"),
      c("Olympiacos", null, "2022 - 2023"),
      c("Fluminense", null, "2023 - 2024")
    ]
  },
  {
    id: 39,
    nombre: "Manuel Neuer",
    dificultad: "baja",
    alias: ["neuer"],
    nacionalidad: "Alemania",
    clubes: [
      c("Schalke 04", null, "2006 - 2011"),
      c("Bayern Múnich", LOGOS.bayern, "2011 - Presente")
    ]
  },
  {
    id: 40,
    nombre: "Thomas Müller",
    dificultad: "baja",
    alias: ["muller"],
    nacionalidad: "Alemania",
    clubes: [
      c("Bayern Múnich", LOGOS.bayern, "2008 - Presente")
    ]
  },
  {
    id: 41,
    nombre: "Alisson Becker",
    dificultad: "baja",
    alias: ["alisson"],
    nacionalidad: "Brasil",
    clubes: [
      c("Internacional", null, "2013 - 2016"),
      c("AS Roma", LOGOS.roma, "2016 - 2018"),
      c("Liverpool FC", LOGOS.liverpool, "2018 - Presente")
    ]
  },
  {
    id: 42,
    nombre: "Thibaut Courtois",
    dificultad: "baja",
    alias: ["courtois"],
    nacionalidad: "Bélgica",
    clubes: [
      c("KRC Genk", null, "2009 - 2011"),
      c("Atlético de Madrid", LOGOS.atletico, "2011 - 2014"),
      c("Chelsea FC", LOGOS.chelsea, "2014 - 2018"),
      c("Real Madrid", LOGOS.madrid, "2018 - Presente")
    ]
  },
  {
    id: 43,
    nombre: "Son Heung-min",
    dificultad: "baja",
    alias: ["son"],
    nacionalidad: "Corea del Sur",
    clubes: [
      c("Hamburgo SV", null, "2010 - 2013"),
      c("Bayer Leverkusen", null, "2013 - 2015"),
      c("Tottenham Hotspur", LOGOS.tottenham, "2015 - Presente")
    ]
  },
  {
    id: 44,
    nombre: "Raheem Sterling",
    dificultad: "baja",
    alias: ["sterling"],
    nacionalidad: "Inglaterra",
    clubes: [
      c("Liverpool FC", LOGOS.liverpool, "2012 - 2015"),
      c("Manchester City", LOGOS.mancity, "2015 - 2022"),
      c("Chelsea FC", LOGOS.chelsea, "2022 - Presente"),
      c("Arsenal FC", LOGOS.arsenal, "2024 - Presente")
    ]
  },
  {
    id: 45,
    nombre: "Sadio Mané",
    dificultad: "baja",
    alias: ["mane"],
    nacionalidad: "Senegal",
    clubes: [
      c("FC Metz", null, "2011 - 2012"),
      c("Red Bull Salzburg", null, "2012 - 2014"),
      c("Southampton FC", null, "2014 - 2016"),
      c("Liverpool FC", LOGOS.liverpool, "2016 - 2022"),
      c("Bayern Múnich", LOGOS.bayern, "2022 - 2023"),
      c("Al Nassr", null, "2023 - Presente")
    ]
  },
  {
    id: 46,
    nombre: "Roberto Firmino",
    dificultad: "baja",
    alias: ["firmino"],
    nacionalidad: "Brasil",
    clubes: [
      c("Figueirense", null, "2009 - 2010"),
      c("TSG Hoffenheim", null, "2011 - 2015"),
      c("Liverpool FC", LOGOS.liverpool, "2015 - 2023"),
      c("Al Ahli", null, "2023 - Presente")
    ]
  },
  {
    id: 47,
    nombre: "Virgil van Dijk",
    dificultad: "baja",
    alias: ["van dijk"],
    nacionalidad: "Países Bajos",
    clubes: [
      c("FC Groningen", null, "2011 - 2013"),
      c("Celtic FC", null, "2013 - 2015"),
      c("Southampton FC", null, "2015 - 2018"),
      c("Liverpool FC", LOGOS.liverpool, "2018 - Presente")
    ]
  },
  {
    id: 48,
    nombre: "Bernardo Silva",
    dificultad: "baja",
    alias: ["bernardo silva"],
    nacionalidad: "Portugal",
    clubes: [
      c("SL Benfica", LOGOS.benfica, "2013 - 2014"),
      c("AS Mónaco", LOGOS.monaco, "2014 - 2017"),
      c("Manchester City", LOGOS.mancity, "2017 - Presente")
    ]
  },
  {
    id: 49,
    nombre: "Bruno Fernandes",
    dificultad: "baja",
    alias: ["bruno fernandes"],
    nacionalidad: "Portugal",
    clubes: [
      c("Novara", null, "2012 - 2013"),
      c("Udinese", null, "2013 - 2016"),
      c("Sampdoria", null, "2016 - 2017"),
      c("Sporting CP", LOGOS.sporting, "2017 - 2020"),
      c("Manchester United", LOGOS.manutd, "2020 - Presente")
    ]
  },
  {
    id: 50,
    nombre: "Casemiro",
    dificultad: "baja",
    alias: ["casemiro"],
    nacionalidad: "Brasil",
    clubes: [
      c("São Paulo FC", null, "2010 - 2013"),
      c("Real Madrid", LOGOS.madrid, "2013 - 2014"),
      c("FC Porto", LOGOS.porto, "2014 - 2015"),
      c("Real Madrid", LOGOS.madrid, "2015 - 2022"),
      c("Manchester United", LOGOS.manutd, "2022 - Presente")
    ]
  },
  {
    id: 51,
    nombre: "N'Golo Kanté",
    dificultad: "baja",
    alias: ["kante"],
    nacionalidad: "Francia",
    clubes: [
      c("US Boulogne", null, "2012 - 2013"),
      c("SM Caen", null, "2013 - 2015"),
      c("Leicester City", null, "2015 - 2016"),
      c("Chelsea FC", LOGOS.chelsea, "2016 - 2023"),
      c("Al Ittihad", null, "2023 - Presente")
    ]
  },
  {
    id: 52,
    nombre: "Paul Pogba",
    dificultad: "baja",
    alias: ["pogba"],
    nacionalidad: "Francia",
    clubes: [
      c("Manchester United", LOGOS.manutd, "2011 - 2012"),
      c("Juventus", LOGOS.juventus, "2012 - 2016"),
      c("Manchester United", LOGOS.manutd, "2016 - 2022"),
      c("Juventus", LOGOS.juventus, "2022 - 2024")
    ]
  },
  {
    id: 53,
    nombre: "Jude Bellingham",
    dificultad: "baja",
    alias: ["bellingham"],
    nacionalidad: "Inglaterra",
    clubes: [
      c("Birmingham City", null, "2019 - 2020"),
      c("Borussia Dortmund", LOGOS.dortmund, "2020 - 2023"),
      c("Real Madrid", LOGOS.madrid, "2023 - Presente")
    ]
  },
  {
    id: 54,
    nombre: "Federico Valverde",
    dificultad: "baja",
    alias: ["valverde", "fede valverde"],
    nacionalidad: "Uruguay",
    clubes: [
      c("Peñarol", null, "2015 - 2016"),
      c("Deportivo La Coruña", LOGOS.depor, "2017 - 2018"),
      c("Real Madrid", LOGOS.madrid, "2018 - Presente")
    ]
  },
  {
    id: 55,
    nombre: "Rodri Hernández",
    dificultad: "baja",
    alias: ["rodri"],
    nacionalidad: "España",
    clubes: [
      c("Villarreal CF", LOGOS.villarreal, "2015 - 2018"),
      c("Atlético de Madrid", LOGOS.atletico, "2018 - 2019"),
      c("Manchester City", LOGOS.mancity, "2019 - Presente")
    ]
  },
  {
    id: 56,
    nombre: "Bukayo Saka",
    dificultad: "baja",
    alias: ["saka"],
    nacionalidad: "Inglaterra",
    clubes: [
      c("Arsenal FC", LOGOS.arsenal, "2018 - Presente")
    ]
  },
  {
    id: 57,
    nombre: "Pedri",
    dificultad: "baja",
    alias: ["pedri"],
    nacionalidad: "España",
    clubes: [
      c("UD Las Palmas", null, "2019 - 2020"),
      c("FC Barcelona", LOGOS.barca, "2020 - Presente")
    ]
  },
  {
    id: 58,
    nombre: "Lamine Yamal",
    dificultad: "baja",
    alias: ["lamine", "lamine yamal"],
    nacionalidad: "España",
    clubes: [
      c("FC Barcelona", LOGOS.barca, "2023 - Presente")
    ]
  },
  {
    id: 59,
    nombre: "Lautaro Martínez",
    dificultad: "baja",
    alias: ["lautaro"],
    nacionalidad: "Argentina",
    clubes: [
      c("Racing Club", null, "2015 - 2018"),
      c("Inter de Milán", LOGOS.inter, "2018 - Presente")
    ]
  },
  {
    id: 60,
    nombre: "David Alaba",
    dificultad: "baja",
    alias: ["alaba"],
    nacionalidad: "Austria",
    clubes: [
      c("Austria Viena", null, "2008"),
      c("Bayern Múnich", LOGOS.bayern, "2009 - 2011"),
      c("TSG Hoffenheim", null, "2011"),
      c("Bayern Múnich", LOGOS.bayern, "2011 - 2021"),
      c("Real Madrid", LOGOS.madrid, "2021 - Presente")
    ]
  },
  {
    id: 61,
    nombre: "Joshua Kimmich",
    dificultad: "baja",
    alias: ["kimmich"],
    nacionalidad: "Alemania",
    clubes: [
      c("RB Leipzig", null, "2013 - 2015"),
      c("Bayern Múnich", LOGOS.bayern, "2015 - Presente")
    ]
  },
  {
    id: 62,
    nombre: "Marc-André ter Stegen",
    dificultad: "baja",
    alias: ["ter stegen"],
    nacionalidad: "Alemania",
    clubes: [
      c("Borussia Mönchengladbach", null, "2009 - 2014"),
      c("FC Barcelona", LOGOS.barca, "2014 - Presente")
    ]
  },
  {
    id: 63,
    nombre: "Jan Oblak",
    dificultad: "baja",
    alias: ["oblak"],
    nacionalidad: "Eslovenia",
    clubes: [
      c("Olimpija Ljubljana", null, "2009 - 2010"),
      c("SL Benfica", LOGOS.benfica, "2010 - 2014"),
      c("Rio Ave", null, "2012 - 2013"),
      c("Atlético de Madrid", LOGOS.atletico, "2014 - Presente")
    ]
  },
  {
    id: 64,
    nombre: "Ousmane Dembélé",
    dificultad: "baja",
    alias: ["dembele"],
    nacionalidad: "Francia",
    clubes: [
      c("Stade Rennais", null, "2015 - 2016"),
      c("Borussia Dortmund", LOGOS.dortmund, "2016 - 2017"),
      c("FC Barcelona", LOGOS.barca, "2017 - 2023"),
      c("Paris Saint-Germain", LOGOS.psg, "2023 - Presente")
    ]
  },
  {
    id: 65,
    nombre: "Frenkie de Jong",
    dificultad: "baja",
    alias: ["de jong", "frenkie de jong"],
    nacionalidad: "Países Bajos",
    clubes: [
      c("Willem II", null, "2014 - 2015"),
      c("AFC Ajax", LOGOS.ajax, "2015 - 2019"),
      c("FC Barcelona", LOGOS.barca, "2019 - Presente")
    ]
  },

  // --- 66 a 135: DIFICULTAD MEDIA ---
  {
    id: 66,
    nombre: "Cesc Fàbregas",
    dificultad: "media",
    alias: ["fabregas", "cesc"],
    nacionalidad: "España",
    clubes: [
      c("Arsenal FC", LOGOS.arsenal, "2003 - 2011"),
      c("FC Barcelona", LOGOS.barca, "2011 - 2014"),
      c("Chelsea FC", LOGOS.chelsea, "2014 - 2019"),
      c("AS Mónaco", LOGOS.monaco, "2019 - 2022"),
      c("Como 1907", null, "2022 - 2023")
    ]
  },
  {
    id: 67,
    nombre: "Alexis Sánchez",
    dificultad: "media",
    alias: ["alexis", "alexis sanchez"],
    nacionalidad: "Chile",
    clubes: [
      c("Cobreloa", null, "2005 - 2006"),
      c("Colo-Colo", null, "2006 - 2007"),
      c("River Plate", LOGOS.river, "2007 - 2008"),
      c("Udinese", null, "2008 - 2011"),
      c("FC Barcelona", LOGOS.barca, "2011 - 2014"),
      c("Arsenal FC", LOGOS.arsenal, "2014 - 2018"),
      c("Manchester United", LOGOS.manutd, "2018 - 2020"),
      c("Inter de Milán", LOGOS.inter, "2019 - 2022"),
      c("Olympique de Marsella", LOGOS.marseille, "2022 - 2023"),
      c("Inter de Milán", LOGOS.inter, "2023 - 2024"),
      c("Udinese", null, "2024 - Presente")
    ]
  },
  {
    id: 68,
    nombre: "Pierre-Emerick Aubameyang",
    dificultad: "media",
    alias: ["aubameyang"],
    nacionalidad: "Gabón",
    clubes: [
      c("AC Milan", LOGOS.milan, "2008 - 2011"),
      c("Saint-Étienne", null, "2011 - 2013"),
      c("Borussia Dortmund", LOGOS.dortmund, "2013 - 2018"),
      c("Arsenal FC", LOGOS.arsenal, "2018 - 2022"),
      c("FC Barcelona", LOGOS.barca, "2022"),
      c("Chelsea FC", LOGOS.chelsea, "2022 - 2023"),
      c("Olympique de Marsella", LOGOS.marseille, "2023 - 2024"),
      c("Al Qadsiah", null, "2024 - Presente")
    ]
  },
  {
    id: 69,
    nombre: "James Rodríguez",
    dificultad: "media",
    alias: ["james", "james rodriguez"],
    nacionalidad: "Colombia",
    clubes: [
      c("Envigado FC", null, "2006 - 2008"),
      c("Banfield", null, "2008 - 2010"),
      c("FC Porto", LOGOS.porto, "2010 - 2013"),
      c("AS Mónaco", LOGOS.monaco, "2013 - 2014"),
      c("Real Madrid", LOGOS.madrid, "2014 - 2020"),
      c("Bayern Múnich", LOGOS.bayern, "2017 - 2019"),
      c("Everton FC", null, "2020 - 2021"),
      c("Al Rayyan", null, "2021 - 2022"),
      c("Olympiacos", null, "2022 - 2023"),
      c("São Paulo FC", null, "2023 - 2024"),
      c("Rayo Vallecano", null, "2024 - Presente")
    ]
  },
  {
    id: 70,
    nombre: "Radamel Falcao",
    dificultad: "media",
    alias: ["falcao"],
    nacionalidad: "Colombia",
    clubes: [
      c("River Plate", LOGOS.river, "2005 - 2009"),
      c("FC Porto", LOGOS.porto, "2009 - 2011"),
      c("Atlético de Madrid", LOGOS.atletico, "2011 - 2013"),
      c("AS Mónaco", LOGOS.monaco, "2013 - 2019"),
      c("Manchester United", LOGOS.manutd, "2014 - 2015"),
      c("Chelsea FC", LOGOS.chelsea, "2015 - 2016"),
      c("Galatasaray", null, "2019 - 2021"),
      c("Rayo Vallecano", null, "2021 - 2024"),
      c("Millonarios FC", null, "2024 - Presente")
    ]
  },
  {
    id: 71,
    nombre: "Álvaro Morata",
    dificultad: "media",
    alias: ["morata"],
    nacionalidad: "España",
    clubes: [
      c("Real Madrid", LOGOS.madrid, "2010 - 2014"),
      c("Juventus", LOGOS.juventus, "2014 - 2016"),
      c("Real Madrid", LOGOS.madrid, "2016 - 2017"),
      c("Chelsea FC", LOGOS.chelsea, "2017 - 2019"),
      c("Atlético de Madrid", LOGOS.atletico, "2019 - 2020"),
      c("Juventus", LOGOS.juventus, "2020 - 2022"),
      c("Atlético de Madrid", LOGOS.atletico, "2022 - 2024"),
      c("AC Milan", LOGOS.milan, "2024 - Presente")
    ]
  },
  {
    id: 72,
    nombre: "Romelu Lukaku",
    dificultad: "media",
    alias: ["lukaku"],
    nacionalidad: "Bélgica",
    clubes: [
      c("Anderlecht", null, "2009 - 2011"),
      c("Chelsea FC", LOGOS.chelsea, "2011 - 2014"),
      c("West Bromwich Albion", null, "2012 - 2013"),
      c("Everton FC", null, "2013 - 2017"),
      c("Manchester United", LOGOS.manutd, "2017 - 2019"),
      c("Inter de Milán", LOGOS.inter, "2019 - 2021"),
      c("Chelsea FC", LOGOS.chelsea, "2021 - 2024"),
      c("AS Roma", LOGOS.roma, "2023 - 2024"),
      c("SSC Napoli", LOGOS.napoli, "2024 - Presente")
    ]
  },
  {
    id: 73,
    nombre: "Thiago Alcántara",
    dificultad: "media",
    alias: ["thiago"],
    nacionalidad: "España",
    clubes: [
      c("FC Barcelona", LOGOS.barca, "2009 - 2013"),
      c("Bayern Múnich", LOGOS.bayern, "2013 - 2020"),
      c("Liverpool FC", LOGOS.liverpool, "2020 - 2024")
    ]
  },
  {
    id: 74,
    nombre: "Edinson Cavani",
    dificultad: "media",
    alias: ["cavani"],
    nacionalidad: "Uruguay",
    clubes: [
      c("Danubio FC", null, "2005 - 2007"),
      c("Palermo", null, "2007 - 2010"),
      c("SSC Napoli", LOGOS.napoli, "2010 - 2013"),
      c("Paris Saint-Germain", LOGOS.psg, "2013 - 2020"),
      c("Manchester United", LOGOS.manutd, "2020 - 2022"),
      c("Valencia CF", LOGOS.valencia, "2022 - 2023"),
      c("Boca Juniors", LOGOS.boca, "2023 - Presente")
    ]
  },
  {
    id: 75,
    nombre: "David Silva",
    dificultad: "media",
    alias: ["david silva", "silva"],
    nacionalidad: "España",
    clubes: [
      c("SD Eibar", null, "2004 - 2005"),
      c("Celta de Vigo", LOGOS.celta, "2005 - 2006"),
      c("Valencia CF", LOGOS.valencia, "2006 - 2010"),
      c("Manchester City", LOGOS.mancity, "2010 - 2020"),
      c("Real Sociedad", LOGOS.sociedad, "2020 - 2023")
    ]
  },
  {
    id: 76,
    nombre: "Fernando Torres",
    dificultad: "media",
    alias: ["torres", "el nino"],
    nacionalidad: "España",
    clubes: [
      c("Atlético de Madrid", LOGOS.atletico, "2001 - 2007"),
      c("Liverpool FC", LOGOS.liverpool, "2007 - 2011"),
      c("Chelsea FC", LOGOS.chelsea, "2011 - 2014"),
      c("AC Milan", LOGOS.milan, "2014"),
      c("Atlético de Madrid", LOGOS.atletico, "2015 - 2018"),
      c("Sagan Tosu", null, "2018 - 2019")
    ]
  },
  {
    id: 77,
    nombre: "Gonzalo Higuaín",
    dificultad: "media",
    alias: ["higuain"],
    nacionalidad: "Argentina",
    clubes: [
      c("River Plate", LOGOS.river, "2005 - 2006"),
      c("Real Madrid", LOGOS.madrid, "2007 - 2013"),
      c("SSC Napoli", LOGOS.napoli, "2013 - 2016"),
      c("Juventus", LOGOS.juventus, "2016 - 2020"),
      c("AC Milan", LOGOS.milan, "2018 - 2019"),
      c("Chelsea FC", LOGOS.chelsea, "2019"),
      c("Inter Miami", LOGOS.miami, "2020 - 2022")
    ]
  },
  {
    id: 78,
    nombre: "Carlos Tévez",
    dificultad: "media",
    alias: ["tevez"],
    nacionalidad: "Argentina",
    clubes: [
      c("Boca Juniors", LOGOS.boca, "2001 - 2004"),
      c("Corinthians", null, "2005 - 2006"),
      c("West Ham United", null, "2006 - 2007"),
      c("Manchester United", LOGOS.manutd, "2007 - 2009"),
      c("Manchester City", LOGOS.mancity, "2009 - 2013"),
      c("Juventus", LOGOS.juventus, "2013 - 2015"),
      c("Boca Juniors", LOGOS.boca, "2015 - 2016"),
      c("Shanghai Shenhua", null, "2017"),
      c("Boca Juniors", LOGOS.boca, "2018 - 2021")
    ]
  },
  {
    id: 79,
    nombre: "Wesley Sneijder",
    dificultad: "media",
    alias: ["sneijder"],
    nacionalidad: "Países Bajos",
    clubes: [
      c("AFC Ajax", LOGOS.ajax, "2002 - 2007"),
      c("Real Madrid", LOGOS.madrid, "2007 - 2009"),
      c("Inter de Milán", LOGOS.inter, "2009 - 2013"),
      c("Galatasaray", null, "2013 - 2017"),
      c("OGC Niza", null, "2017"),
      c("Al Gharafa", null, "2018 - 2019")
    ]
  },
  {
    id: 80,
    nombre: "Robin van Persie",
    dificultad: "media",
    alias: ["van persie"],
    nacionalidad: "Países Bajos",
    clubes: [
      c("Feyenoord", null, "2001 - 2004"),
      c("Arsenal FC", LOGOS.arsenal, "2004 - 2012"),
      c("Manchester United", LOGOS.manutd, "2012 - 2015"),
      c("Fenerbahçe", null, "2015 - 2018"),
      c("Feyenoord", null, "2018 - 2019")
    ]
  },
  {
    id: 81,
    nombre: "Deco",
    dificultad: "media",
    alias: ["deco"],
    nacionalidad: "Portugal",
    clubes: [
      c("Corinthians", null, "1996 - 1997"),
      c("FC Porto", LOGOS.porto, "1999 - 2004"),
      c("FC Barcelona", LOGOS.barca, "2004 - 2008"),
      c("Chelsea FC", LOGOS.chelsea, "2008 - 2010"),
      c("Fluminense", null, "2010 - 2013")
    ]
  },
  {
    id: 82,
    nombre: "Claude Makélélé",
    dificultad: "media",
    alias: ["makelele"],
    nacionalidad: "Francia",
    clubes: [
      c("FC Nantes", null, "1992 - 1997"),
      c("Olympique de Marsella", LOGOS.marseille, "1997 - 1998"),
      c("Celta de Vigo", LOGOS.celta, "1998 - 2000"),
      c("Real Madrid", LOGOS.madrid, "2000 - 2003"),
      c("Chelsea FC", LOGOS.chelsea, "2003 - 2008"),
      c("Paris Saint-Germain", LOGOS.psg, "2008 - 2011")
    ]
  },
  {
    id: 83,
    nombre: "Xabi Alonso",
    dificultad: "media",
    alias: ["xabi alonso"],
    nacionalidad: "España",
    clubes: [
      c("Real Sociedad", LOGOS.sociedad, "1999 - 2004"),
      c("SD Eibar", null, "2000 - 2001"),
      c("Liverpool FC", LOGOS.liverpool, "2004 - 2009"),
      c("Real Madrid", LOGOS.madrid, "2009 - 2014"),
      c("Bayern Múnich", LOGOS.bayern, "2014 - 2017")
    ]
  },
  {
    id: 84,
    nombre: "Pepe",
    dificultad: "media",
    alias: ["pepe"],
    nacionalidad: "Portugal",
    clubes: [
      c("CS Marítimo", null, "2001 - 2004"),
      c("FC Porto", LOGOS.porto, "2004 - 2007"),
      c("Real Madrid", LOGOS.madrid, "2007 - 2017"),
      c("Besiktas", null, "2017 - 2018"),
      c("FC Porto", LOGOS.porto, "2019 - 2024")
    ]
  },
  {
    id: 85,
    nombre: "Diego Godín",
    dificultad: "media",
    alias: ["godin"],
    nacionalidad: "Uruguay",
    clubes: [
      c("Cerro", null, "2003 - 2006"),
      c("Nacional", null, "2006 - 2007"),
      c("Villarreal CF", LOGOS.villarreal, "2007 - 2010"),
      c("Atlético de Madrid", LOGOS.atletico, "2010 - 2019"),
      c("Inter de Milán", LOGOS.inter, "2019 - 2020"),
      c("Cagliari", null, "2020 - 2022"),
      c("Vélez Sarsfield", null, "2022 - 2023")
    ]
  },
  {
    id: 86,
    nombre: "Giorgio Chiellini",
    dificultad: "media",
    alias: ["chiellini"],
    nacionalidad: "Italia",
    clubes: [
      c("Livorno", null, "2000 - 2004"),
      c("Fiorentina", null, "2004 - 2005"),
      c("Juventus", LOGOS.juventus, "2005 - 2022"),
      c("Los Angeles FC", null, "2022 - 2023")
    ]
  },
  {
    id: 87,
    nombre: "Leonardo Bonucci",
    dificultad: "media",
    alias: ["bonucci"],
    nacionalidad: "Italia",
    clubes: [
      c("Inter de Milán", LOGOS.inter, "2005 - 2007"),
      c("Bari", null, "2009 - 2010"),
      c("Juventus", LOGOS.juventus, "2010 - 2017"),
      c("AC Milan", LOGOS.milan, "2017 - 2018"),
      c("Juventus", LOGOS.juventus, "2018 - 2023"),
      c("Union Berlín", null, "2023"),
      c("Fenerbahçe", null, "2024")
    ]
  },
  {
    id: 88,
    nombre: "Thiago Silva",
    dificultad: "media",
    alias: ["thiago silva"],
    nacionalidad: "Brasil",
    clubes: [
      c("Juventude", null, "2004"),
      c("Fluminense", null, "2006 - 2008"),
      c("AC Milan", LOGOS.milan, "2009 - 2012"),
      c("Paris Saint-Germain", LOGOS.psg, "2012 - 2020"),
      c("Chelsea FC", LOGOS.chelsea, "2020 - 2024"),
      c("Fluminense", null, "2024 - Presente")
    ]
  },
  {
    id: 89,
    nombre: "Keylor Navas",
    dificultad: "media",
    alias: ["keylor navas", "keylor"],
    nacionalidad: "Costa Rica",
    clubes: [
      c("Deportivo Saprissa", null, "2005 - 2010"),
      c("Albacete Balompié", null, "2010 - 2011"),
      c("Levante UD", null, "2011 - 2014"),
      c("Real Madrid", LOGOS.madrid, "2014 - 2019"),
      c("Paris Saint-Germain", LOGOS.psg, "2019 - 2024"),
      c("Nottingham Forest", null, "2023")
    ]
  },
  {
    id: 90,
    nombre: "David de Gea",
    dificultad: "media",
    alias: ["de gea"],
    nacionalidad: "España",
    clubes: [
      c("Atlético de Madrid", LOGOS.atletico, "2009 - 2011"),
      c("Manchester United", LOGOS.manutd, "2011 - 2023"),
      c("Fiorentina", null, "2024 - Presente")
    ]
  },
  {
    id: 91,
    nombre: "Hugo Lloris",
    dificultad: "media",
    alias: ["lloris"],
    nacionalidad: "Francia",
    clubes: [
      c("OGC Niza", null, "2005 - 2008"),
      c("Olympique de Lyon", LOGOS.lyon, "2008 - 2012"),
      c("Tottenham Hotspur", LOGOS.tottenham, "2012 - 2023"),
      c("Los Angeles FC", null, "2024 - Presente")
    ]
  },
  {
    id: 92,
    nombre: "Olivier Giroud",
    dificultad: "media",
    alias: ["giroud"],
    nacionalidad: "Francia",
    clubes: [
      c("Grenoble", null, "2005 - 2008"),
      c("Tours FC", null, "2008 - 2010"),
      c("Montpellier HSC", null, "2010 - 2012"),
      c("Arsenal FC", LOGOS.arsenal, "2012 - 2018"),
      c("Chelsea FC", LOGOS.chelsea, "2018 - 2021"),
      c("AC Milan", LOGOS.milan, "2021 - 2024"),
      c("Los Angeles FC", null, "2024 - Presente")
    ]
  },
  {
    id: 93,
    nombre: "Edin Džeko",
    dificultad: "media",
    alias: ["dzeko"],
    nacionalidad: "Bosnia y Herzegovina",
    clubes: [
      c("FK Teplice", null, "2005 - 2007"),
      c("VfL Wolfsburg", null, "2007 - 2011"),
      c("Manchester City", LOGOS.mancity, "2011 - 2015"),
      c("AS Roma", LOGOS.roma, "2015 - 2021"),
      c("Inter de Milán", LOGOS.inter, "2021 - 2023"),
      c("Fenerbahçe", null, "2023 - Presente")
    ]
  },
  {
    id: 94,
    nombre: "Ciro Immobile",
    dificultad: "media",
    alias: ["immobile"],
    nacionalidad: "Italia",
    clubes: [
      c("Pescara", null, "2011 - 2012"),
      c("Genoa", null, "2012 - 2013"),
      c("Torino", null, "2013 - 2014"),
      c("Borussia Dortmund", LOGOS.dortmund, "2014 - 2015"),
      c("Sevilla FC", LOGOS.sevilla, "2015 - 2016"),
      c("Lazio", null, "2016 - 2024"),
      c("Besiktas", null, "2024 - Presente")
    ]
  },
  {
    id: 95,
    nombre: "Jamie Vardy",
    dificultad: "media",
    alias: ["vardy"],
    nacionalidad: "Inglaterra",
    clubes: [
      c("Stocksbridge Park Steels", null, "2007 - 2010"),
      c("FC Halifax Town", null, "2010 - 2011"),
      c("Fleetwood Town", null, "2011 - 2012"),
      c("Leicester City", null, "2012 - Presente")
    ]
  },
  {
    id: 96,
    nombre: "Riyad Mahrez",
    dificultad: "media",
    alias: ["mahrez"],
    nacionalidad: "Argelia",
    clubes: [
      c("Le Havre", null, "2011 - 2014"),
      c("Leicester City", null, "2014 - 2018"),
      c("Manchester City", LOGOS.mancity, "2018 - 2023"),
      c("Al Ahli", null, "2023 - Presente")
    ]
  },
  {
    id: 97,
    nombre: "Georginio Wijnaldum",
    dificultad: "media",
    alias: ["wijnaldum"],
    nacionalidad: "Países Bajos",
    clubes: [
      c("Feyenoord", null, "2007 - 2011"),
      c("PSV Eindhoven", null, "2011 - 2015"),
      c("Newcastle United", null, "2015 - 2016"),
      c("Liverpool FC", LOGOS.liverpool, "2016 - 2021"),
      c("Paris Saint-Germain", LOGOS.psg, "2021 - 2023"),
      c("AS Roma", LOGOS.roma, "2022 - 2023"),
      c("Al Ettifaq", null, "2023 - Presente")
    ]
  },
  {
    id: 98,
    nombre: "Jordan Henderson",
    dificultad: "media",
    alias: ["henderson"],
    nacionalidad: "Inglaterra",
    clubes: [
      c("Sunderland", null, "2008 - 2011"),
      c("Coventry City", null, "2009"),
      c("Liverpool FC", LOGOS.liverpool, "2011 - 2023"),
      c("Al Ettifaq", null, "2023 - 2024"),
      c("AFC Ajax", LOGOS.ajax, "2024 - Presente")
    ]
  },
  {
    id: 99,
    nombre: "Ilkay Gündogan",
    dificultad: "media",
    alias: ["gundogan"],
    nacionalidad: "Alemania",
    clubes: [
      c("FC Nuremberg", null, "2009 - 2011"),
      c("Borussia Dortmund", LOGOS.dortmund, "2011 - 2016"),
      c("Manchester City", LOGOS.mancity, "2016 - 2023"),
      c("FC Barcelona", LOGOS.barca, "2023 - 2024"),
      c("Manchester City", LOGOS.mancity, "2024 - Presente")
    ]
  },
  {
    id: 100,
    nombre: "Marco Reus",
    dificultad: "media",
    alias: ["reus"],
    nacionalidad: "Alemania",
    clubes: [
      c("Rot Weiss Ahlen", null, "2006 - 2009"),
      c("Borussia Mönchengladbach", null, "2009 - 2012"),
      c("Borussia Dortmund", LOGOS.dortmund, "2012 - 2024"),
      c("LA Galaxy", null, "2024 - Presente")
    ]
  },
  {
    id: 101,
    nombre: "Mario Götze",
    dificultad: "media",
    alias: ["gotze"],
    nacionalidad: "Alemania",
    clubes: [
      c("Borussia Dortmund", LOGOS.dortmund, "2009 - 2013"),
      c("Bayern Múnich", LOGOS.bayern, "2013 - 2016"),
      c("Borussia Dortmund", LOGOS.dortmund, "2016 - 2020"),
      c("PSV Eindhoven", null, "2020 - 2022"),
      c("Eintracht Frankfurt", null, "2022 - Presente")
    ]
  },
  {
    id: 102,
    nombre: "Mats Hummels",
    dificultad: "media",
    alias: ["hummels"],
    nacionalidad: "Alemania",
    clubes: [
      c("Bayern Múnich", LOGOS.bayern, "2007 - 2008"),
      c("Borussia Dortmund", LOGOS.dortmund, "2008 - 2016"),
      c("Bayern Múnich", LOGOS.bayern, "2016 - 2019"),
      c("Borussia Dortmund", LOGOS.dortmund, "2019 - 2024"),
      c("AS Roma", LOGOS.roma, "2024 - Presente")
    ]
  },
  {
    id: 103,
    nombre: "Jérôme Boateng",
    dificultad: "media",
    alias: ["boateng", "jerome boateng"],
    nacionalidad: "Alemania",
    clubes: [
      c("Hertha Berlín", null, "2006 - 2007"),
      c("Hamburgo SV", null, "2007 - 2010"),
      c("Manchester City", LOGOS.mancity, "2010 - 2011"),
      c("Bayern Múnich", LOGOS.bayern, "2011 - 2021"),
      c("Olympique de Lyon", LOGOS.lyon, "2021 - 2023"),
      c("LASK Linz", null, "2024 - Presente")
    ]
  },
  {
    id: 104,
    nombre: "Sami Khedira",
    dificultad: "media",
    alias: ["khedira"],
    nacionalidad: "Alemania",
    clubes: [
      c("VfB Stuttgart", null, "2006 - 2010"),
      c("Real Madrid", LOGOS.madrid, "2010 - 2015"),
      c("Juventus", LOGOS.juventus, "2015 - 2021"),
      c("Hertha Berlín", null, "2021")
    ]
  },
  {
    id: 105,
    nombre: "Mesut Özil",
    dificultad: "media",
    alias: ["ozil"],
    nacionalidad: "Alemania",
    clubes: [
      c("Schalke 04", null, "2006 - 2008"),
      c("Werder Bremen", null, "2008 - 2010"),
      c("Real Madrid", LOGOS.madrid, "2010 - 2013"),
      c("Arsenal FC", LOGOS.arsenal, "2013 - 2021"),
      c("Fenerbahçe", null, "2021 - 2022"),
      c("Istanbul Basaksehir", null, "2022 - 2023")
    ]
  },
  {
    id: 106,
    nombre: "Isco Alarcón",
    dificultad: "media",
    alias: ["isco"],
    nacionalidad: "España",
    clubes: [
      c("Valencia CF", LOGOS.valencia, "2010 - 2011"),
      c("Málaga CF", null, "2011 - 2013"),
      c("Real Madrid", LOGOS.madrid, "2013 - 2022"),
      c("Sevilla FC", LOGOS.sevilla, "2022"),
      c("Real Betis", LOGOS.betis, "2023 - Presente")
    ]
  },
  {
    id: 107,
    nombre: "Marco Asensio",
    dificultad: "media",
    alias: ["asensio"],
    nacionalidad: "España",
    clubes: [
      c("RCD Mallorca", null, "2013 - 2014"),
      c("RCD Espanyol", LOGOS.espanyol, "2015 - 2016"),
      c("Real Madrid", LOGOS.madrid, "2016 - 2023"),
      c("Paris Saint-Germain", LOGOS.psg, "2023 - Presente")
    ]
  },
  {
    id: 108,
    nombre: "Dani Carvajal",
    dificultad: "media",
    alias: ["carvajal"],
    nacionalidad: "España",
    clubes: [
      c("Bayer Leverkusen", null, "2012 - 2013"),
      c("Real Madrid", LOGOS.madrid, "2013 - Presente")
    ]
  },
  {
    id: 109,
    nombre: "Jordi Alba",
    dificultad: "media",
    alias: ["jordi alba"],
    nacionalidad: "España",
    clubes: [
      c("Gimnàstic de Tarragona", null, "2008 - 2009"),
      c("Valencia CF", LOGOS.valencia, "2009 - 2012"),
      c("FC Barcelona", LOGOS.barca, "2012 - 2023"),
      c("Inter Miami", LOGOS.miami, "2023 - Presente")
    ]
  },
  {
    id: 110,
    nombre: "Jesús Navas",
    dificultad: "media",
    alias: ["jesus navas"],
    nacionalidad: "España",
    clubes: [
      c("Sevilla FC", LOGOS.sevilla, "2003 - 2013"),
      c("Manchester City", LOGOS.mancity, "2013 - 2017"),
      c("Sevilla FC", LOGOS.sevilla, "2017 - 2024")
    ]
  },
  {
    id: 111,
    nombre: "Ivan Rakitic",
    dificultad: "media",
    alias: ["rakitic"],
    nacionalidad: "Croacia",
    clubes: [
      c("FC Basilea", null, "2005 - 2007"),
      c("Schalke 04", null, "2007 - 2011"),
      c("Sevilla FC", LOGOS.sevilla, "2011 - 2014"),
      c("FC Barcelona", LOGOS.barca, "2014 - 2020"),
      c("Sevilla FC", LOGOS.sevilla, "2020 - 2024"),
      c("Al Shabab", null, "2024"),
      c("Hajduk Split", null, "2024 - Presente")
    ]
  },
  {
    id: 112,
    nombre: "Arturo Vidal",
    dificultad: "media",
    alias: ["vidal"],
    nacionalidad: "Chile",
    clubes: [
      c("Colo-Colo", null, "2005 - 2007"),
      c("Bayer Leverkusen", null, "2007 - 2011"),
      c("Juventus", LOGOS.juventus, "2011 - 2015"),
      c("Bayern Múnich", LOGOS.bayern, "2015 - 2018"),
      c("FC Barcelona", LOGOS.barca, "2018 - 2020"),
      c("Inter de Milán", LOGOS.inter, "2020 - 2022"),
      c("Flamengo", null, "2022 - 2023"),
      c("Colo-Colo", null, "2024 - Presente")
    ]
  },
  {
    id: 113,
    nombre: "Juan Cuadrado",
    dificultad: "media",
    alias: ["cuadrado"],
    nacionalidad: "Colombia",
    clubes: [
      c("Independiente Medellín", null, "2008 - 2009"),
      c("Udinese", null, "2009 - 2011"),
      c("Lecce", null, "2011 - 2012"),
      c("Fiorentina", null, "2012 - 2015"),
      c("Chelsea FC", LOGOS.chelsea, "2015"),
      c("Juventus", LOGOS.juventus, "2015 - 2023"),
      c("Inter de Milán", LOGOS.inter, "2023 - 2024"),
      c("Atalanta", null, "2024 - Presente")
    ]
  },
  {
    id: 114,
    nombre: "Paulo Dybala",
    dificultad: "media",
    alias: ["dybala"],
    nacionalidad: "Argentina",
    clubes: [
      c("Instituto de Córdoba", null, "2011 - 2012"),
      c("Palermo", null, "2012 - 2015"),
      c("Juventus", LOGOS.juventus, "2015 - 2022"),
      c("AS Roma", LOGOS.roma, "2022 - Presente")
    ]
  },
  {
    id: 115,
    nombre: "Duván Zapata",
    dificultad: "media",
    alias: ["zapata"],
    nacionalidad: "Colombia",
    clubes: [
      c("América de Cali", null, "2008 - 2011"),
      c("Estudiantes de La Plata", null, "2011 - 2013"),
      c("SSC Napoli", LOGOS.napoli, "2013 - 2015"),
      c("Udinese", null, "2015 - 2017"),
      c("Sampdoria", null, "2017 - 2018"),
      c("Atalanta", null, "2018 - 2023"),
      c("Torino", null, "2023 - Presente")
    ]
  },
  {
    id: 116,
    nombre: "Luis Muriel",
    dificultad: "media",
    alias: ["muriel"],
    nacionalidad: "Colombia",
    clubes: [
      c("Deportivo Cali", null, "2009 - 2010"),
      c("Granada CF", null, "2010 - 2011"),
      c("Lecce", null, "2011 - 2012"),
      c("Udinese", null, "2012 - 2015"),
      c("Sampdoria", null, "2015 - 2017"),
      c("Sevilla FC", LOGOS.sevilla, "2017 - 2019"),
      c("Fiorentina", null, "2019"),
      c("Atalanta", null, "2019 - 2024"),
      c("Orlando City", null, "2024 - Presente")
    ]
  },
  {
    id: 117,
    nombre: "Papu Gómez",
    dificultad: "media",
    alias: ["papu gomez", "papu"],
    nacionalidad: "Argentina",
    clubes: [
      c("Arsenal de Sarandí", null, "2006 - 2009"),
      c("San Lorenzo", null, "2009 - 2010"),
      c("Catania", null, "2010 - 2013"),
      c("Metalist Kharkiv", null, "2013 - 2014"),
      c("Atalanta", null, "2014 - 2021"),
      c("Sevilla FC", LOGOS.sevilla, "2021 - 2023"),
      c("AC Monza", null, "2023 - Presente")
    ]
  },
  {
    id: 118,
    nombre: "Éver Banega",
    dificultad: "media",
    alias: ["banega"],
    nacionalidad: "Argentina",
    clubes: [
      c("Boca Juniors", LOGOS.boca, "2007"),
      c("Valencia CF", LOGOS.valencia, "2008 - 2014"),
      c("Atlético de Madrid", LOGOS.atletico, "2008 - 2009"),
      c("Newell's Old Boys", null, "2014"),
      c("Sevilla FC", LOGOS.sevilla, "2014 - 2016"),
      c("Inter de Milán", LOGOS.inter, "2016 - 2017"),
      c("Sevilla FC", LOGOS.sevilla, "2017 - 2020"),
      c("Al Shabab", null, "2020 - 2024"),
      c("Newell's Old Boys", null, "2024 - Presente")
    ]
  },
  {
    id: 119,
    nombre: "Nicolás Otamendi",
    dificultad: "media",
    alias: ["otamendi"],
    nacionalidad: "Argentina",
    clubes: [
      c("Vélez Sarsfield", null, "2007 - 2010"),
      c("FC Porto", LOGOS.porto, "2010 - 2014"),
      c("Atlético Mineiro", null, "2014"),
      c("Valencia CF", LOGOS.valencia, "2014 - 2015"),
      c("Manchester City", LOGOS.mancity, "2015 - 2020"),
      c("SL Benfica", LOGOS.benfica, "2020 - Presente")
    ]
  },
  // REVISADO: Cristian Romero con Atlético de Madrid como destino
  {
    id: 120,
    nombre: "Cristian Romero",
    dificultad: "media",
    alias: ["cuti romero", "romero"],
    nacionalidad: "Argentina",
    clubes: [
      c("Belgrano", null, "2016 - 2018"),
      c("Genoa", null, "2018 - 2019"),
      c("Juventus", LOGOS.juventus, "2019 - 2021"),
      c("Atalanta", null, "2020 - 2021"),
      c("Tottenham Hotspur", LOGOS.tottenham, "2021 - 2024"),
      c("Atlético de Madrid", LOGOS.atletico, "2024 - Presente")
    ]
  },
  {
    id: 121,
    nombre: "Alexis Mac Allister",
    dificultad: "media",
    alias: ["mac allister"],
    nacionalidad: "Argentina",
    clubes: [
      c("Argentinos Juniors", null, "2016 - 2019"),
      c("Boca Juniors", LOGOS.boca, "2019"),
      c("Brighton & Hove Albion", null, "2020 - 2023"),
      c("Liverpool FC", LOGOS.liverpool, "2023 - Presente")
    ]
  },
  {
    id: 122,
    nombre: "Enzo Fernández",
    dificultad: "media",
    alias: ["enzo fernandez"],
    nacionalidad: "Argentina",
    clubes: [
      c("River Plate", LOGOS.river, "2019 - 2022"),
      c("Defensa y Justicia", null, "2020 - 2021"),
      c("SL Benfica", LOGOS.benfica, "2022 - 2023"),
      c("Chelsea FC", LOGOS.chelsea, "2023 - Presente")
    ]
  },
  {
    id: 123,
    nombre: "Julián Álvarez",
    dificultad: "media",
    alias: ["julian alvarez", "la arana"],
    nacionalidad: "Argentina",
    clubes: [
      c("River Plate", LOGOS.river, "2018 - 2022"),
      c("Manchester City", LOGOS.mancity, "2022 - 2024"),
      c("Atlético de Madrid", LOGOS.atletico, "2024 - Presente")
    ]
  },
  {
    id: 124,
    nombre: "Achraf Hakimi",
    dificultad: "media",
    alias: ["hakimi"],
    nacionalidad: "Marruecos",
    clubes: [
      c("Real Madrid", LOGOS.madrid, "2017 - 2018"),
      c("Borussia Dortmund", LOGOS.dortmund, "2018 - 2020"),
      c("Inter de Milán", LOGOS.inter, "2020 - 2021"),
      c("Paris Saint-Germain", LOGOS.psg, "2021 - Presente")
    ]
  },
  {
    id: 125,
    nombre: "Yassine Bounou",
    dificultad: "media",
    alias: ["bono", "bounou"],
    nacionalidad: "Marruecos",
    clubes: [
      c("Wydad Casablanca", null, "2010 - 2012"),
      c("Real Zaragoza", null, "2014 - 2016"),
      c("Girona FC", null, "2016 - 2019"),
      c("Sevilla FC", LOGOS.sevilla, "2019 - 2023"),
      c("Al Hilal", null, "2023 - Presente")
    ]
  },
  {
    id: 126,
    nombre: "Hakim Ziyech",
    dificultad: "media",
    alias: ["ziyech"],
    nacionalidad: "Marruecos",
    clubes: [
      c("SC Heerenveen", null, "2012 - 2014"),
      c("FC Twente", null, "2014 - 2016"),
      c("AFC Ajax", LOGOS.ajax, "2016 - 2020"),
      c("Chelsea FC", LOGOS.chelsea, "2020 - 2023"),
      c("Galatasaray", null, "2023 - Presente")
    ]
  },
  {
    id: 127,
    nombre: "Sofyan Amrabat",
    dificultad: "media",
    alias: ["amrabat"],
    nacionalidad: "Marruecos",
    clubes: [
      c("FC Utrecht", null, "2014 - 2017"),
      c("Feyenoord", null, "2017 - 2018"),
      c("Club Brujas", null, "2018 - 2019"),
      c("Hellas Verona", null, "2019 - 2020"),
      c("Fiorentina", null, "2020 - 2023"),
      c("Manchester United", LOGOS.manutd, "2023 - 2024"),
      c("Fenerbahçe", null, "2024 - Presente")
    ]
  },
  {
    id: 128,
    nombre: "Kalidou Koulibaly",
    dificultad: "media",
    alias: ["koulibaly"],
    nacionalidad: "Senegal",
    clubes: [
      c("FC Metz", null, "2010 - 2012"),
      c("KRC Genk", null, "2012 - 2014"),
      c("SSC Napoli", LOGOS.napoli, "2014 - 2022"),
      c("Chelsea FC", LOGOS.chelsea, "2022 - 2023"),
      c("Al Hilal", null, "2023 - Presente")
    ]
  },
  {
    id: 129,
    nombre: "Victor Osimhen",
    dificultad: "media",
    alias: ["osimhen"],
    nacionalidad: "Nigeria",
    clubes: [
      c("VfL Wolfsburg", null, "2017 - 2018"),
      c("Charleroi", null, "2018 - 2019"),
      c("Lille OSC", null, "2019 - 2020"),
      c("SSC Napoli", LOGOS.napoli, "2020 - Presente"),
      c("Galatasaray", null, "2024 - Presente")
    ]
  },
  // REVISADO: Gabriel Jesus con FC Barcelona como destino
  {
    id: 130,
    nombre: "Gabriel Jesus",
    dificultad: "media",
    alias: ["gabriel jesus"],
    nacionalidad: "Brasil",
    clubes: [
      c("Palmeiras", null, "2015 - 2016"),
      c("Manchester City", LOGOS.mancity, "2017 - 2022"),
      c("Arsenal FC", LOGOS.arsenal, "2022 - 2024"),
      c("FC Barcelona", LOGOS.barca, "2024 - Presente")
    ]
  },
  {
    id: 131,
    nombre: "Richarlison",
    dificultad: "media",
    alias: ["richarlison"],
    nacionalidad: "Brasil",
    clubes: [
      c("América Mineiro", null, "2015"),
      c("Fluminense", null, "2016 - 2017"),
      c("Watford FC", null, "2017 - 2018"),
      c("Everton FC", null, "2018 - 2022"),
      c("Tottenham Hotspur", LOGOS.tottenham, "2022 - Presente")
    ]
  },
  {
    id: 132,
    nombre: "Lucas Paquetá",
    dificultad: "media",
    alias: ["paqueta"],
    nacionalidad: "Brasil",
    clubes: [
      c("Flamengo", null, "2016 - 2018"),
      c("AC Milan", LOGOS.milan, "2019 - 2020"),
      c("Olympique de Lyon", LOGOS.lyon, "2020 - 2022"),
      c("West Ham United", null, "2022 - Presente")
    ]
  },
  {
    id: 133,
    nombre: "Bruno Guimarães",
    dificultad: "media",
    alias: ["bruno guimaraes"],
    nacionalidad: "Brasil",
    clubes: [
      c("Athletico Paranaense", null, "2017 - 2020"),
      c("Olympique de Lyon", LOGOS.lyon, "2020 - 2022"),
      c("Newcastle United", null, "2022 - Presente")
    ]
  },
  {
    id: 134,
    nombre: "Raphinha",
    dificultad: "media",
    alias: ["raphinha"],
    nacionalidad: "Brasil",
    clubes: [
      c("Vitória de Guimarães", null, "2016 - 2018"),
      c("Sporting CP", LOGOS.sporting, "2018 - 2019"),
      c("Stade Rennais", null, "2019 - 2020"),
      c("Leeds United", null, "2020 - 2022"),
      c("FC Barcelona", LOGOS.barca, "2022 - Presente")
    ]
  },
  {
    id: 135,
    nombre: "Rodrygo Goes",
    dificultad: "media",
    alias: ["rodrygo"],
    nacionalidad: "Brasil",
    clubes: [
      c("Santos FC", null, "2017 - 2019"),
      c("Real Madrid", LOGOS.madrid, "2019 - Presente")
    ]
  },

  // --- 136 a 200: DIFICULTAD ALTA CON PISTAS EXCLUSIVAS ---
  {
    id: 136,
    nombre: "Kevin-Prince Boateng",
    dificultad: "alta",
    pista: "Hermano de un central alemán de renombre. Famoso por su inesperada cesión al FC Barcelona en 2019 y por haber jugado en 4 de las 5 grandes ligas.",
    alias: ["prince boateng", "boateng"],
    nacionalidad: "Ghana",
    clubes: [
      c("Hertha Berlín", null, "2005 - 2007"),
      c("Tottenham Hotspur", LOGOS.tottenham, "2007 - 2009"),
      c("Borussia Dortmund", LOGOS.dortmund, "2009"),
      c("Portsmouth", null, "2009 - 2010"),
      c("AC Milan", LOGOS.milan, "2010 - 2013"),
      c("Schalke 04", null, "2013 - 2015"),
      c("UD Las Palmas", null, "2016 - 2017"),
      c("Eintracht Frankfurt", null, "2017 - 2018"),
      c("Sassuolo", null, "2018 - 2019"),
      c("FC Barcelona", LOGOS.barca, "2019"),
      c("Fiorentina", null, "2019 - 2020"),
      c("Besiktas", null, "2020"),
      c("AC Monza", null, "2020 - 2021"),
      c("Hertha Berlín", null, "2021 - 2023")
    ]
  },
  {
    id: 137,
    nombre: "Bojan Krkic",
    dificultad: "alta",
    pista: "Superó los récords goleadores de precocidad de Messi en las categorías inferiores de La Masía y jugó en 7 países diferentes.",
    alias: ["bojan", "bojan krkic"],
    nacionalidad: "España",
    clubes: [
      c("FC Barcelona", LOGOS.barca, "2007 - 2011"),
      c("AS Roma", LOGOS.roma, "2011 - 2012"),
      c("AC Milan", LOGOS.milan, "2012 - 2013"),
      c("AFC Ajax", LOGOS.ajax, "2013 - 2014"),
      c("Stoke City", null, "2014 - 2019"),
      c("Mainz 05", null, "2017"),
      c("Deportivo Alavés", null, "2017 - 2018"),
      c("Montreal Impact", null, "2019 - 2020"),
      c("Vissel Kobe", null, "2021 - 2022")
    ]
  },
  {
    id: 138,
    nombre: "Javier Hernández",
    dificultad: "alta",
    pista: "Máximo goleador histórico de la selección mexicana ('Chicharito'), anotó un gol icónico en cuartos de Champions al Atlético vistiendo de blanco.",
    alias: ["chicharito", "chicharito hernandez"],
    nacionalidad: "México",
    clubes: [
      c("Chivas de Guadalajara", null, "2006 - 2010"),
      c("Manchester United", LOGOS.manutd, "2010 - 2015"),
      c("Real Madrid", LOGOS.madrid, "2014 - 2015"),
      c("Bayer Leverkusen", null, "2015 - 2017"),
      c("West Ham United", null, "2017 - 2019"),
      c("Sevilla FC", LOGOS.sevilla, "2019 - 2020"),
      c("LA Galaxy", null, "2020 - 2023"),
      c("Chivas de Guadalajara", null, "2024 - Presente")
    ]
  },
  {
    id: 139,
    nombre: "Alexandre Pato",
    dificultad: "alta",
    pista: "Ganador del Golden Boy en 2009 con el Milan. Comenzó deslumbrando en San Siro antes de que las lesiones frenaran su meteórica carrera.",
    alias: ["pato"],
    nacionalidad: "Brasil",
    clubes: [
      c("Internacional", null, "2006 - 2007"),
      c("AC Milan", LOGOS.milan, "2007 - 2013"),
      c("Corinthians", null, "2013 - 2016"),
      c("São Paulo FC", null, "2014 - 2015"),
      c("Chelsea FC", LOGOS.chelsea, "2016"),
      c("Villarreal CF", LOGOS.villarreal, "2016 - 2017"),
      c("Tianjin Tianhai", null, "2017 - 2019"),
      c("Orlando City", null, "2021 - 2022")
    ]
  },
  {
    id: 140,
    nombre: "Mario Balotelli",
    dificultad: "alta",
    pista: "Famoso por su camiseta con el lema 'Why Always Me?' y por su doblete con Italia ante Alemania en las semifinales de la Eurocopa 2012.",
    alias: ["balotelli"],
    nacionalidad: "Italia",
    clubes: [
      c("Lumezzane", null, "2005 - 2006"),
      c("Inter de Milán", LOGOS.inter, "2007 - 2010"),
      c("Manchester City", LOGOS.mancity, "2010 - 2013"),
      c("AC Milan", LOGOS.milan, "2013 - 2014"),
      c("Liverpool FC", LOGOS.liverpool, "2014 - 2016"),
      c("OGC Niza", null, "2016 - 2019"),
      c("Olympique de Marsella", LOGOS.marseille, "2019"),
      c("Brescia", null, "2019 - 2020"),
      c("AC Monza", null, "2020 - 2021"),
      c("Adana Demirspor", null, "2021 - 2022"),
      c("FC Sion", null, "2022 - 2023"),
      c("Genoa", null, "2024 - Presente")
    ]
  },
  {
    id: 141,
    nombre: "Martin Braithwaite",
    dificultad: "alta",
    pista: "Delantero danés fichado fuera de mercado de emergencia por el Barça en febrero de 2020 tras pagar su cláusula de rescisión al CD Leganés.",
    alias: ["braithwaite"],
    nacionalidad: "Dinamarca",
    clubes: [
      c("Esbjerg fB", null, "2009 - 2013"),
      c("Toulouse FC", null, "2013 - 2017"),
      c("Middlesbrough FC", null, "2017 - 2019"),
      c("Girondins de Burdeos", null, "2018"),
      c("CD Leganés", null, "2019 - 2020"),
      c("FC Barcelona", LOGOS.barca, "2020 - 2022"),
      c("RCD Espanyol", LOGOS.espanyol, "2022 - 2024"),
      c("Grêmio", null, "2024 - Presente")
    ]
  },
  {
    id: 142,
    nombre: "Royston Drenthe",
    dificultad: "alta",
    pista: "Mejor jugador del Europeo Sub-21 de 2007. Fichó por el Madrid como gran promesa zurda pero destacó más por sus anécdotas extradeportivas.",
    alias: ["drenthe"],
    nacionalidad: "Países Bajos",
    clubes: [
      c("Feyenoord", null, "2005 - 2007"),
      c("Real Madrid", LOGOS.madrid, "2007 - 2012"),
      c("Hércules CF", null, "2010 - 2011"),
      c("Everton FC", null, "2011 - 2012"),
      c("Alania Vladikavkaz", null, "2013"),
      c("Reading FC", null, "2013 - 2015"),
      c("Racing Murcia", null, "2021")
    ]
  },
  {
    id: 143,
    nombre: "Thomas Gravesen",
    dificultad: "alta",
    pista: "Centrocampista de corte muy duro en la época de los Galácticos del Real Madrid, famoso popularmente por inventar la 'Gravesinha'.",
    alias: ["gravesen"],
    nacionalidad: "Dinamarca",
    clubes: [
      c("Vejle Boldklub", null, "1995 - 1997"),
      c("Hamburgo SV", null, "1997 - 2000"),
      c("Everton FC", null, "2000 - 2005"),
      c("Real Madrid", LOGOS.madrid, "2005 - 2006"),
      c("Celtic FC", null, "2006 - 2008")
    ]
  },
  {
    id: 144,
    nombre: "Julien Faubert",
    dificultad: "alta",
    pista: "Extremo recordado por una de las cesiones más extrañas del Real Madrid en 2009 y por ser captado durmiendo en el banquillo en un partido de Liga.",
    alias: ["faubert"],
    nacionalidad: "Francia",
    clubes: [
      c("AS Cannes", null, "2002 - 2004"),
      c("Girondins de Burdeos", null, "2004 - 2007"),
      c("West Ham United", null, "2007 - 2012"),
      c("Real Madrid", LOGOS.madrid, "2009"),
      c("Elazığspor", null, "2012 - 2013")
    ]
  },
  {
    id: 145,
    nombre: "Seydou Keita",
    dificultad: "alta",
    pista: "El revulsivo y suplente de oro favorito de Pep Guardiola en el FC Barcelona del Sextete, titular de la selección de Malí.",
    alias: ["keita", "seydou keita"],
    nacionalidad: "Malí",
    clubes: [
      c("Olympique de Marsella", LOGOS.marseille, "1999 - 2000"),
      c("FC Lorient", null, "2000 - 2002"),
      c("RC Lens", null, "2002 - 2007"),
      c("Sevilla FC", LOGOS.sevilla, "2007 - 2008"),
      c("FC Barcelona", LOGOS.barca, "2008 - 2012"),
      c("Dalian Aerbin", null, "2012 - 2013"),
      c("Valencia CF", LOGOS.valencia, "2014"),
      c("AS Roma", LOGOS.roma, "2014 - 2016")
    ]
  },
  {
    id: 146,
    nombre: "Hatem Ben Arfa",
    dificultad: "alta",
    pista: "Genio incomprendido del regate de la generación francesa de 1987 (junto a Benzema), con etapas brillantes en Niza y Newcastle.",
    alias: ["ben arfa"],
    nacionalidad: "Francia",
    clubes: [
      c("Olympique de Lyon", LOGOS.lyon, "2004 - 2008"),
      c("Olympique de Marsella", LOGOS.marseille, "2008 - 2010"),
      c("Newcastle United", null, "2010 - 2015"),
      c("OGC Niza", null, "2015 - 2016"),
      c("Paris Saint-Germain", LOGOS.psg, "2016 - 2018"),
      c("Stade Rennais", null, "2018 - 2019"),
      c("Real Valladolid", null, "2020")
    ]
  },
  {
    id: 147,
    nombre: "Adel Taarabt",
    dificultad: "alta",
    pista: "Especialista absoluto en caños y filigranas en la Championship inglesa con el QPR; luego se reconvirtió en mediocentro táctico en el Benfica.",
    alias: ["taarabt"],
    nacionalidad: "Marruecos",
    clubes: [
      c("RC Lens", null, "2006 - 2007"),
      c("Tottenham Hotspur", LOGOS.tottenham, "2007 - 2009"),
      c("Queens Park Rangers", null, "2009 - 2015"),
      c("AC Milan", LOGOS.milan, "2014"),
      c("SL Benfica", LOGOS.benfica, "2015 - 2022"),
      c("Genoa", null, "2017 - 2018")
    ]
  },
  {
    id: 148,
    nombre: "Ricardo Quaresma",
    dificultad: "alta",
    pista: "El indiscutible rey del disparo con el exterior ('la trivela'). Compartió camada con Cristiano Ronaldo en el Sporting.",
    alias: ["quaresma"],
    nacionalidad: "Portugal",
    clubes: [
      c("Sporting CP", LOGOS.sporting, "2001 - 2003"),
      c("FC Barcelona", LOGOS.barca, "2003 - 2004"),
      c("FC Porto", LOGOS.porto, "2004 - 2008"),
      c("Inter de Milán", LOGOS.inter, "2008 - 2010"),
      c("Chelsea FC", LOGOS.chelsea, "2009"),
      c("Besiktas", null, "2010 - 2012"),
      c("FC Porto", LOGOS.porto, "2014 - 2015"),
      c("Besiktas", null, "2015 - 2019")
    ]
  },
  {
    id: 149,
    nombre: "Carlos Vela",
    dificultad: "alta",
    pista: "Zurdo mexicano campeón del mundo Sub-17 en 2005; formó una delantera legendaria con Griezmann en Anoeta antes de ser MVP absoluto de la MLS.",
    alias: ["vela"],
    nacionalidad: "México",
    clubes: [
      c("Arsenal FC", LOGOS.arsenal, "2005 - 2012"),
      c("UD Salamanca", null, "2006 - 2007"),
      c("CA Osasuna", null, "2007 - 2008"),
      c("West Bromwich Albion", null, "2011"),
      c("Real Sociedad", LOGOS.sociedad, "2011 - 2018"),
      c("Los Angeles FC", null, "2018 - Presente")
    ]
  },
  {
    id: 150,
    nombre: "Giovani dos Santos",
    dificultad: "alta",
    pista: "Formado en La Masía y campeón mundial Sub-17 con México; célebre por su definición vaselina ante USA en la final de la Copa Oro 2011.",
    alias: ["giovani", "dos santos"],
    nacionalidad: "México",
    clubes: [
      c("FC Barcelona", LOGOS.barca, "2006 - 2008"),
      c("Tottenham Hotspur", LOGOS.tottenham, "2008 - 2012"),
      c("Galatasaray", null, "2010"),
      c("Racing de Santander", null, "2011"),
      c("RCD Mallorca", null, "2012 - 2013"),
      c("Villarreal CF", LOGOS.villarreal, "2013 - 2015"),
      c("LA Galaxy", null, "2015 - 2019"),
      c("Club América", null, "2019 - 2021")
    ]
  },
  {
    id: 151,
    nombre: "Alex Song",
    dificultad: "alta",
    pista: "Centrocampista camerunés recordado por el momento viral en que pensó que Puyol le ofrecía levantar el trofeo de Liga, cuando era para Abidal.",
    alias: ["song", "alex song"],
    nacionalidad: "Camerún",
    clubes: [
      c("SC Bastia", null, "2004 - 2005"),
      c("Arsenal FC", LOGOS.arsenal, "2005 - 2012"),
      c("FC Barcelona", LOGOS.barca, "2012 - 2016"),
      c("West Ham United", null, "2014 - 2016"),
      c("Rubin Kazán", null, "2016 - 2018")
    ]
  },
  {
    id: 152,
    nombre: "Emmanuel Adebayor",
    dificultad: "alta",
    pista: "Delantero togolés que enfureció al Emirates al correr de portería a portería para festejar un gol con el City en la cara de su exafición.",
    alias: ["adebayor"],
    nacionalidad: "Togo",
    clubes: [
      c("AS Mónaco", LOGOS.monaco, "2003 - 2006"),
      c("Arsenal FC", LOGOS.arsenal, "2006 - 2009"),
      c("Manchester City", LOGOS.mancity, "2009 - 2012"),
      c("Real Madrid", LOGOS.madrid, "2011"),
      c("Tottenham Hotspur", LOGOS.tottenham, "2011 - 2015")
    ]
  },
  {
    id: 153,
    nombre: "Lassana Diarra",
    dificultad: "alta",
    pista: "Llegó a portar el dorsal 10 en el Real Madrid jugando como mediocentro de contención destructor.",
    alias: ["lass", "diarra"],
    nacionalidad: "Francia",
    clubes: [
      c("Chelsea FC", LOGOS.chelsea, "2005 - 2007"),
      c("Arsenal FC", LOGOS.arsenal, "2007 - 2008"),
      c("Portsmouth", null, "2008 - 2009"),
      c("Real Madrid", LOGOS.madrid, "2009 - 2012"),
      c("Olympique de Marsella", LOGOS.marseille, "2015 - 2017"),
      c("Paris Saint-Germain", LOGOS.psg, "2018 - 2019")
    ]
  },
  {
    id: 154,
    nombre: "Jérémy Mathieu",
    dificultad: "alta",
    pista: "Defensa central y lateral galo que pasó del Valencia al Barça de Luis Enrique, marcando un cabezazo decisivo en un Clásico de 2015.",
    alias: ["mathieu"],
    nacionalidad: "Francia",
    clubes: [
      c("FC Sochaux", null, "2002 - 2005"),
      c("Toulouse FC", null, "2005 - 2009"),
      c("Valencia CF", LOGOS.valencia, "2009 - 2014"),
      c("FC Barcelona", LOGOS.barca, "2014 - 2017"),
      c("Sporting CP", LOGOS.sporting, "2017 - 2020")
    ]
  },
  {
    id: 155,
    nombre: "André Schürrle",
    dificultad: "alta",
    pista: "Dio la asistencia precisa por banda izquierda para el histórico gol de Götze en la prórroga de la final del Mundial 2014.",
    alias: ["schurrle"],
    nacionalidad: "Alemania",
    clubes: [
      c("Mainz 05", null, "2009 - 2011"),
      c("Bayer Leverkusen", null, "2011 - 2013"),
      c("Chelsea FC", LOGOS.chelsea, "2013 - 2015"),
      c("VfL Wolfsburg", null, "2015 - 2016"),
      c("Borussia Dortmund", LOGOS.dortmund, "2016 - 2020")
    ]
  },
  {
    id: 156,
    nombre: "Nicklas Bendtner",
    dificultad: "alta",
    pista: "Apodado cómicamente 'Lord' por los aficionados tras sus declaraciones asegurando que sería el mejor futbolista del mundo.",
    alias: ["bendtner", "lord bendtner"],
    nacionalidad: "Dinamarca",
    clubes: [
      c("Arsenal FC", LOGOS.arsenal, "2005 - 2014"),
      c("Juventus", LOGOS.juventus, "2012 - 2013"),
      c("VfL Wolfsburg", null, "2014 - 2016"),
      c("Rosenborg BK", null, "2017 - 2019")
    ]
  },
  {
    id: 157,
    nombre: "Dimitar Berbatov",
    dificultad: "alta",
    pista: "Delantero búlgaro con un primer toque estético y elegante; formó ataque con Rooney y Cristiano Ronaldo en el United.",
    alias: ["berbatov"],
    nacionalidad: "Bulgaria",
    clubes: [
      c("Bayer Leverkusen", null, "2001 - 2006"),
      c("Tottenham Hotspur", LOGOS.tottenham, "2006 - 2008"),
      c("Manchester United", LOGOS.manutd, "2008 - 2012"),
      c("Fulham FC", null, "2012 - 2014"),
      c("AS Mónaco", LOGOS.monaco, "2014 - 2015")
    ]
  },
  {
    id: 158,
    nombre: "Eiður Guðjohnsen",
    dificultad: "alta",
    pista: "El mejor futbolista de la historia de Islandia, parte del Chelsea de Mourinho y del Barça del Sextete de Guardiola.",
    alias: ["gudjohnsen"],
    nacionalidad: "Islandia",
    clubes: [
      c("Bolton Wanderers", null, "1998 - 2000"),
      c("Chelsea FC", LOGOS.chelsea, "2000 - 2006"),
      c("FC Barcelona", LOGOS.barca, "2006 - 2009"),
      c("AS Mónaco", LOGOS.monaco, "2009 - 2010"),
      c("Tottenham Hotspur", LOGOS.tottenham, "2010")
    ]
  },
  {
    id: 159,
    nombre: "Gheorghe Hagi",
    dificultad: "alta",
    pista: "Conocido como 'El Maradona de los Cárpatos', jugó en los dos grandes de España y lideró a Rumanía en Estados Unidos 94.",
    alias: ["hagi"],
    nacionalidad: "Rumania",
    clubes: [
      c("Steaua Bucarest", null, "1987 - 1990"),
      c("Real Madrid", LOGOS.madrid, "1990 - 1992"),
      c("Brescia", null, "1992 - 1994"),
      c("FC Barcelona", LOGOS.barca, "1994 - 1996"),
      c("Galatasaray", null, "1996 - 2001")
    ]
  },
  {
    id: 160,
    nombre: "Hristo Stoichkov",
    dificultad: "alta",
    pista: "Ganador del Balón de Oro en 1994 y figura estelar del mítico Dream Team del FC Barcelona dirigido por Johan Cruyff.",
    alias: ["stoichkov"],
    nacionalidad: "Bulgaria",
    clubes: [
      c("CSKA Sofia", null, "1984 - 1990"),
      c("FC Barcelona", LOGOS.barca, "1990 - 1995"),
      c("Parma", null, "1995 - 1996"),
      c("FC Barcelona", LOGOS.barca, "1996 - 1998"),
      c("Al Nassr", null, "1998")
    ]
  },
  {
    id: 161,
    nombre: "Jari Litmanen",
    dificultad: "alta",
    pista: "Considerado el mejor jugador finlandés de todos los tiempos, director de orquesta del Ajax que ganó la Champions en 1995.",
    alias: ["litmanen"],
    nacionalidad: "Finlandia",
    clubes: [
      c("AFC Ajax", LOGOS.ajax, "1992 - 1999"),
      c("FC Barcelona", LOGOS.barca, "1999 - 2001"),
      c("Liverpool FC", LOGOS.liverpool, "2001 - 2002"),
      c("AFC Ajax", LOGOS.ajax, "2002 - 2004")
    ]
  },
  {
    id: 162,
    nombre: "Michael Laudrup",
    dificultad: "alta",
    pista: "Genio danés del regate y del pase sin mirar; pasó directamente del Barça al Real Madrid ganando la Liga por 5-0 en ambos bandos.",
    alias: ["laudrup"],
    nacionalidad: "Dinamarca",
    clubes: [
      c("Juventus", LOGOS.juventus, "1985 - 1989"),
      c("FC Barcelona", LOGOS.barca, "1989 - 1994"),
      c("Real Madrid", LOGOS.madrid, "1994 - 1996"),
      c("AFC Ajax", LOGOS.ajax, "1997 - 1998")
    ]
  },
  {
    id: 163,
    nombre: "Edgar Davids",
    dificultad: "alta",
    pista: "Inconfundible mediocampista apodado 'Pitbull', famoso por sus rastas y sus gafas protectoras de colores en el terreno de juego.",
    alias: ["davids"],
    nacionalidad: "Países Bajos",
    clubes: [
      c("AFC Ajax", LOGOS.ajax, "1991 - 1996"),
      c("AC Milan", LOGOS.milan, "1996 - 1997"),
      c("Juventus", LOGOS.juventus, "1997 - 2004"),
      c("FC Barcelona", LOGOS.barca, "2004"),
      c("Inter de Milán", LOGOS.inter, "2004 - 2005"),
      c("Tottenham Hotspur", LOGOS.tottenham, "2005 - 2007")
    ]
  },
  {
    id: 164,
    nombre: "Christian Vieri",
    dificultad: "alta",
    pista: "Letal goleador italiano ('Bobo'); logró el Trofeo Pichichi con el Atlético de Madrid promediando casi un gol por partido en 1997-98.",
    alias: ["vieri"],
    nacionalidad: "Italia",
    clubes: [
      c("Juventus", LOGOS.juventus, "1996 - 1997"),
      c("Atlético de Madrid", LOGOS.atletico, "1997 - 1998"),
      c("Lazio", null, "1998 - 1999"),
      c("Inter de Milán", LOGOS.inter, "1999 - 2005"),
      c("AC Milan", LOGOS.milan, "2005")
    ]
  },
  {
    id: 165,
    nombre: "Hernán Crespo",
    dificultad: "alta",
    pista: "Delantero centro argentino ('Valdanito'), autor de un doblete estelar en la inolvidable final de Champions de Estambul 2005.",
    alias: ["crespo"],
    nacionalidad: "Argentina",
    clubes: [
      c("River Plate", LOGOS.river, "1993 - 1996"),
      c("Parma", null, "1996 - 2000"),
      c("Lazio", null, "2000 - 2002"),
      c("Inter de Milán", LOGOS.inter, "2002 - 2003"),
      c("Chelsea FC", LOGOS.chelsea, "2003 - 2008"),
      c("AC Milan", LOGOS.milan, "2004 - 2005")
    ]
  },
  {
    id: 166,
    nombre: "Juan Román Riquelme",
    dificultad: "alta",
    pista: "El icónico último '10' del fútbol sudamericano, prócer de Boca Juniors y líder del Villarreal que llegó a semifinales de Champions.",
    alias: ["riquelme", "roman"],
    nacionalidad: "Argentina",
    clubes: [
      c("Boca Juniors", LOGOS.boca, "1996 - 2002"),
      c("FC Barcelona", LOGOS.barca, "2002 - 2003"),
      c("Villarreal CF", LOGOS.villarreal, "2003 - 2007"),
      c("Boca Juniors", LOGOS.boca, "2007 - 2014")
    ]
  },
  {
    id: 167,
    nombre: "Pablo Aimar",
    dificultad: "alta",
    pista: "Ídolo de la infancia de Leo Messi; mediapunta fino y mágico del Valencia campeón de dos Ligas y una Copa de la UEFA.",
    alias: ["aimar"],
    nacionalidad: "Argentina",
    clubes: [
      c("River Plate", LOGOS.river, "1996 - 2000"),
      c("Valencia CF", LOGOS.valencia, "2001 - 2006"),
      c("Real Zaragoza", null, "2006 - 2008"),
      c("SL Benfica", LOGOS.benfica, "2008 - 2013")
    ]
  },
  {
    id: 168,
    nombre: "Javier Saviola",
    dificultad: "alta",
    pista: "'El Conejito', campeón y balón de oro del Mundial Sub-20 de 2001 que llegó al Barça muy joven como fichaje estrella.",
    alias: ["saviola"],
    nacionalidad: "Argentina",
    clubes: [
      c("River Plate", LOGOS.river, "1998 - 2001"),
      c("FC Barcelona", LOGOS.barca, "2001 - 2007"),
      c("Sevilla FC", LOGOS.sevilla, "2005 - 2006"),
      c("Real Madrid", LOGOS.madrid, "2007 - 2009"),
      c("SL Benfica", LOGOS.benfica, "2009 - 2012")
    ]
  },
  {
    id: 169,
    nombre: "Gaizka Mendieta",
    dificultad: "alta",
    pista: "Capitán del Valencia que alcanzó dos finales seguidas de Champions; célebre por tirar penaltis mirando al portero y no al balón.",
    alias: ["mendieta"],
    nacionalidad: "España",
    clubes: [
      c("Valencia CF", LOGOS.valencia, "1992 - 2001"),
      c("Lazio", null, "2001 - 2003"),
      c("FC Barcelona", LOGOS.barca, "2002 - 2003"),
      c("Middlesbrough FC", null, "2003 - 2008")
    ]
  },
  {
    id: 170,
    nombre: "Fernando Morientes",
    dificultad: "alta",
    pista: "Ganó tres Champions con el Real Madrid formando dupla con Raúl, y luego eliminó al propio Madrid jugando cedido en el Mónaco.",
    alias: ["morientes"],
    nacionalidad: "España",
    clubes: [
      c("Albacete Balompié", null, "1993 - 1995"),
      c("Real Zaragoza", null, "1995 - 1997"),
      c("Real Madrid", LOGOS.madrid, "1997 - 2005"),
      c("AS Mónaco", LOGOS.monaco, "2003 - 2004"),
      c("Liverpool FC", LOGOS.liverpool, "2005 - 2006"),
      c("Valencia CF", LOGOS.valencia, "2006 - 2009")
    ]
  },
  {
    id: 171,
    nombre: "Guti",
    dificultad: "alta",
    pista: "Canterano de oro del Real Madrid, recordado por sus asistencias de tacón inverosímiles en Riazor y el Sánchez-Pizjuán.",
    alias: ["guti"],
    nacionalidad: "España",
    clubes: [
      c("Real Madrid", LOGOS.madrid, "1995 - 2010"),
      c("Besiktas", null, "2010 - 2011")
    ]
  },
  {
    id: 172,
    nombre: "Santiago Cañizares",
    dificultad: "alta",
    pista: "Portero del gran Valencia con pelo teñido de platino; se perdió el Mundial 2002 por un desafortunado corte con un frasco de colonia.",
    alias: ["canizares"],
    nacionalidad: "España",
    clubes: [
      c("Celta de Vigo", LOGOS.celta, "1992 - 1994"),
      c("Real Madrid", LOGOS.madrid, "1994 - 1998"),
      c("Valencia CF", LOGOS.valencia, "1998 - 2008")
    ]
  },
  {
    id: 173,
    nombre: "Joaquín Sánchez",
    dificultad: "alta",
    pista: "Símbolo eterno del Real Betis, futbolista con más partidos jugados en la historia de LaLiga junto a Zubizarreta.",
    alias: ["joaquin"],
    nacionalidad: "España",
    clubes: [
      c("Real Betis", LOGOS.betis, "2000 - 2006"),
      c("Valencia CF", LOGOS.valencia, "2006 - 2011"),
      c("Málaga CF", null, "2011 - 2013"),
      c("Fiorentina", null, "2013 - 2015"),
      c("Real Betis", LOGOS.betis, "2015 - 2023")
    ]
  },
  {
    id: 174,
    nombre: "Aritz Aduriz",
    dificultad: "alta",
    pista: "Goleador histórico del Athletic Club; se despidió con una inolvidable chilena en el último minuto frente al Barça en San Mamés.",
    alias: ["aduriz"],
    nacionalidad: "España",
    clubes: [
      c("Athletic Club", LOGOS.athletic, "2002 - 2003"),
      c("Athletic Club", LOGOS.athletic, "2006 - 2008"),
      c("RCD Mallorca", null, "2008 - 2010"),
      c("Valencia CF", LOGOS.valencia, "2010 - 2012"),
      c("Athletic Club", LOGOS.athletic, "2012 - 2020")
    ]
  },
  {
    id: 175,
    nombre: "Iago Aspas",
    dificultad: "alta",
    pista: "El 'Príncipe de las Bateas', emblema absoluto del Celta de Vigo y múltiple ganador del Trofeo Zarra al máximo goleador nacional.",
    alias: ["aspas"],
    nacionalidad: "España",
    clubes: [
      c("Celta de Vigo", LOGOS.celta, "2008 - 2013"),
      c("Liverpool FC", LOGOS.liverpool, "2013 - 2015"),
      c("Sevilla FC", LOGOS.sevilla, "2014 - 2015"),
      c("Celta de Vigo", LOGOS.celta, "2015 - Presente")
    ]
  },
  {
    id: 176,
    nombre: "Michu",
    dificultad: "alta",
    pista: "Sensación goleadora de la Premier con el Swansea en 2012-13, declarado como el gran ídolo de infancia de Erling Haaland.",
    alias: ["michu"],
    nacionalidad: "España",
    clubes: [
      c("Real Oviedo", null, "2003 - 2007"),
      c("Celta de Vigo", LOGOS.celta, "2007 - 2011"),
      c("Rayo Vallecano", null, "2011 - 2012"),
      c("Swansea City", null, "2012 - 2015"),
      c("SSC Napoli", LOGOS.napoli, "2014 - 2015"),
      c("Real Oviedo", null, "2016 - 2017")
    ]
  },
  {
    id: 177,
    nombre: "Santi Cazorla",
    dificultad: "alta",
    pista: "Centrocampista ambidiestro virtuoso del Arsenal y Villarreal, superó una gravísima infección en el tobillo para volver a jugar.",
    alias: ["cazorla"],
    nacionalidad: "España",
    clubes: [
      c("Villarreal CF", LOGOS.villarreal, "2003 - 2006"),
      c("Recreativo de Huelva", null, "2006 - 2007"),
      c("Villarreal CF", LOGOS.villarreal, "2007 - 2011"),
      c("Málaga CF", null, "2011 - 2012"),
      c("Arsenal FC", LOGOS.arsenal, "2012 - 2018"),
      c("Villarreal CF", LOGOS.villarreal, "2018 - 2020"),
      c("Real Oviedo", null, "2023 - Presente")
    ]
  },
  {
    id: 178,
    nombre: "Marcos Senna",
    dificultad: "alta",
    pista: "Eje del centro del campo de España en la conquista de la Eurocopa 2008 y estandarte del Villarreal durante una década.",
    alias: ["senna", "marcos senna"],
    nacionalidad: "España",
    clubes: [
      c("Corinthians", null, "1999 - 2001"),
      c("São Caetano", null, "2002"),
      c("Villarreal CF", LOGOS.villarreal, "2002 - 2013"),
      c("New York Cosmos", null, "2013 - 2015")
    ]
  },
  {
    id: 179,
    nombre: "Joan Capdevila",
    dificultad: "alta",
    pista: "Lateral izquierdo indiscutible de España campeón del mundo en 2010 y de la Euro 2008; querido por su espontaneidad y sentido del humor.",
    alias: ["capdevila"],
    nacionalidad: "España",
    clubes: [
      c("RCD Espanyol", LOGOS.espanyol, "1998 - 1999"),
      c("Atlético de Madrid", LOGOS.atletico, "1999 - 2000"),
      c("Deportivo La Coruña", LOGOS.depor, "2000 - 2007"),
      c("Villarreal CF", LOGOS.villarreal, "2007 - 2011"),
      c("SL Benfica", LOGOS.benfica, "2011 - 2012")
    ]
  },
  {
    id: 180,
    nombre: "Walter Pandiani",
    dificultad: "alta",
    pista: "'El Rifle', delantero uruguayo famoso por acudir a los entrenamientos en un imponente camión rojo.",
    alias: ["pandiani"],
    nacionalidad: "Uruguay",
    clubes: [
      c("Peñarol", null, "1998 - 2000"),
      c("Deportivo La Coruña", LOGOS.depor, "2000 - 2005"),
      c("RCD Mallorca", null, "2002 - 2003"),
      c("Birmingham City", null, "2005 - 2006"),
      c("RCD Espanyol", LOGOS.espanyol, "2006 - 2007"),
      c("CA Osasuna", null, "2007 - 2011"),
      c("Villarreal CF", LOGOS.villarreal, "2012 - 2013")
    ]
  },
  {
    id: 181,
    nombre: "Roy Makaay",
    dificultad: "alta",
    pista: "Bota de Oro en 2003 con el Dépor y autor del gol más veloz en la historia de la Champions League (10,12 segundos con el Bayern).",
    alias: ["makaay"],
    nacionalidad: "Países Bajos",
    clubes: [
      c("Vitesse Arnhem", null, "1993 - 1997"),
      c("CD Tenerife", null, "1997 - 1999"),
      c("Deportivo La Coruña", LOGOS.depor, "1999 - 2003"),
      c("Bayern Múnich", LOGOS.bayern, "2003 - 2007"),
      c("Feyenoord", null, "2007 - 2010")
    ]
  },
  {
    id: 182,
    nombre: "Diego Tristán",
    dificultad: "alta",
    pista: "Delantero sevillano con clase exquisita; fue Pichichi con el Deportivo en la época dorada en que conquistaron el 'Centenariazo'.",
    alias: ["tristan", "diego tristan"],
    nacionalidad: "España",
    clubes: [
      c("RCD Mallorca", null, "1998 - 2000"),
      c("Deportivo La Coruña", LOGOS.depor, "2000 - 2006"),
      c("RCD Mallorca", null, "2006 - 2007"),
      c("Livorno", null, "2007 - 2008"),
      c("West Ham United", null, "2008 - 2009"),
      c("Cádiz CF", null, "2009 - 2010")
    ]
  },
  {
    id: 183,
    nombre: "Juan Carlos Valerón",
    dificultad: "alta",
    pista: "El 'Mago de Arguineguín', mediapunta de elegancia sublime en el EuroDépor, respetado y ovacionado de pie en todos los estadios.",
    alias: ["valeron"],
    nacionalidad: "España",
    clubes: [
      c("UD Las Palmas", null, "1994 - 1997"),
      c("RCD Mallorca", null, "1997 - 1998"),
      c("Atlético de Madrid", LOGOS.atletico, "1998 - 2000"),
      c("Deportivo La Coruña", LOGOS.depor, "2000 - 2013"),
      c("UD Las Palmas", null, "2013 - 2016")
    ]
  },
  {
    id: 184,
    nombre: "Djalminha",
    dificultad: "alta",
    pista: "Genio irreverente brasileño del Deportivo, famoso por inventar y realizar una 'lambretta' en vivo ante el Real Madrid.",
    alias: ["djalminha"],
    nacionalidad: "Brasil",
    clubes: [
      c("Flamengo", null, "1989 - 1993"),
      c("Guarani", null, "1993 - 1995"),
      c("Palmeiras", null, "1995 - 1997"),
      c("Deportivo La Coruña", LOGOS.depor, "1997 - 2004"),
      c("Austria Viena", null, "2002 - 2003"),
      c("Club América", null, "2004")
    ]
  },
  {
    id: 185,
    nombre: "Mauro Silva",
    dificultad: "alta",
    pista: "Campeón del mundo con Brasil en 1994 y capitán inamovible de contención del SuperDépor durante 13 temporadas.",
    alias: ["mauro silva"],
    nacionalidad: "Brasil",
    clubes: [
      c("Guarani", null, "1988 - 1989"),
      c("Bragantino", null, "1990 - 1992"),
      c("Deportivo La Coruña", LOGOS.depor, "1992 - 2005")
    ]
  },
  {
    id: 186,
    nombre: "Paulo Futre",
    dificultad: "alta",
    pista: "Balón de Plata en 1987 tras ganar la Copa de Europa con el Oporto, y uno de los mayores ídolos y extremos en la historia del Atlético.",
    alias: ["futre"],
    nacionalidad: "Portugal",
    clubes: [
      c("Sporting CP", LOGOS.sporting, "1983 - 1984"),
      c("FC Porto", LOGOS.porto, "1984 - 1987"),
      c("Atlético de Madrid", LOGOS.atletico, "1987 - 1993"),
      c("SL Benfica", LOGOS.benfica, "1993"),
      c("Olympique de Marsella", LOGOS.marseille, "1993"),
      c("AC Milan", LOGOS.milan, "1995 - 1996"),
      c("West Ham United", null, "1996 - 1997"),
      c("Atlético de Madrid", LOGOS.atletico, "1997 - 1998")
    ]
  },
  {
    "id": 187,
    "nombre": "David Villa",
    "dificultad": "baja",
    "pista": "Máximo goleador histórico de la selección española ('El Guaje'), campeón del mundo en 2010 y de la Champions con el Barça en Wembley.",
    "alias": ["villa", "el guaje", "david villa"],
    "nacionalidad": "España",
    "clubes": [
      c("Sporting de Gijón", null, "2000 - 2003"),
      c("Real Zaragoza", null, "2003 - 2005"),
      c("Valencia CF", LOGOS.valencia, "2005 - 2010"),
      c("FC Barcelona", LOGOS.barca, "2010 - 2013"),
      c("Atlético de Madrid", LOGOS.atletico, "2013 - 2014"),
      c("New York City FC", null, "2014 - 2018"),
      c("Melbourne City", null, "2014"),
      c("Vissel Kobe", null, "2019")
    ]
  },
  {
    "id": 188,
    "nombre": "David Beckham",
    "dificultad": "baja",
    "pista": "Icono mediático mundial y especialista en tiros libres; integró los Galácticos del Real Madrid y hoy es copropietario del Inter Miami.",
    "alias": ["beckham"],
    "nacionalidad": "Inglaterra",
    "clubes": [
      c("Manchester United", LOGOS.manutd, "1992 - 2003"),
      c("Preston North End", null, "1995"),
      c("Real Madrid", LOGOS.madrid, "2003 - 2007"),
      c("LA Galaxy", null, "2007 - 2012"),
      c("AC Milan", LOGOS.milan, "2009 - 2010"),
      c("Paris Saint-Germain", LOGOS.psg, "2013")
    ]
  },
  {
    "id": 189,
    "nombre": "Wayne Rooney",
    "dificultad": "baja",
    "pista": "Máximo goleador histórico del Manchester United ('El Niño Malcriado'), irrumpió como adolescente en el Everton antes de hacer época en Old Trafford.",
    "alias": ["rooney"],
    "nacionalidad": "Inglaterra",
    "clubes": [
      c("Everton FC", null, "2002 - 2004"),
      c("Manchester United", LOGOS.manutd, "2004 - 2017"),
      c("Everton FC", null, "2017 - 2018"),
      c("D.C. United", null, "2018 - 2019"),
      c("Derby County", null, "2020 - 2021")
    ]
  },
  {
    "id": 190,
    "nombre": "Didier Drogba",
    "dificultad": "baja",
    "pista": "Leyenda marfileña del Chelsea; empató en el minuto 88 y anotó el penalti definitivo para dar a los 'Blues' su primera Champions en Múnich.",
    "alias": ["drogba"],
    "nacionalidad": "Costa de Marfil",
    "clubes": [
      c("Le Mans", null, "1998 - 2002"),
      c("EA Guingamp", null, "2002 - 2003"),
      c("Olympique de Marsella", LOGOS.marseille, "2003 - 2004"),
      c("Chelsea FC", LOGOS.chelsea, "2004 - 2012"),
      c("Shanghai Shenhua", null, "2012"),
      c("Galatasaray", null, "2013 - 2014"),
      c("Chelsea FC", LOGOS.chelsea, "2014 - 2015"),
      c("Montreal Impact", null, "2015 - 2016")
    ]
  },
  {
    "id": 191,
    "nombre": "Samuel Eto'o",
    "dificultad": "baja",
    "pista": "Único futbolista capaz de ganar dos tripletes consecutivos en Europa con dos clubes distintos (Barça en 2009 e Inter en 2010).",
    "alias": ["etoo", "samuel etoo"],
    "nacionalidad": "Camerún",
    "clubes": [
      c("CD Leganés", null, "1997 - 1998"),
      c("Real Madrid", LOGOS.madrid, "1998 - 2000"),
      c("RCD Mallorca", null, "2000 - 2004"),
      c("FC Barcelona", LOGOS.barca, "2004 - 2009"),
      c("Inter de Milán", LOGOS.inter, "2009 - 2011"),
      c("Anzhi Makhachkala", null, "2011 - 2013"),
      c("Chelsea FC", LOGOS.chelsea, "2013 - 2014"),
      c("Everton FC", null, "2014 - 2015"),
      c("Sampdoria", null, "2015")
    ]
  },
  {
    "id": 192,
    "nombre": "Arjen Robben",
    "dificultad": "baja",
    "pista": "Extremo neerlandés famoso por su jugada patentada de recortar de derecha hacia el centro y clavar el balón al segundo palo con la zurda.",
    "alias": ["robben"],
    "nacionalidad": "Países Bajos",
    "clubes": [
      c("FC Groningen", null, "2000 - 2002"),
      c("PSV Eindhoven", null, "2002 - 2004"),
      c("Chelsea FC", LOGOS.chelsea, "2004 - 2007"),
      c("Real Madrid", LOGOS.madrid, "2007 - 2009"),
      c("Bayern Múnich", LOGOS.bayern, "2009 - 2019"),
      c("FC Groningen", null, "2020 - 2021")
    ]
  },
  {
    "id": 193,
    "nombre": "Franck Ribéry",
    "dificultad": "baja",
    "pista": "Extremo francés apodado 'Scarface', formó la mítica dupla 'Robbery' en el Bayern Múnich y fue tercero en el Balón de Oro 2013.",
    "alias": ["ribery"],
    "nacionalidad": "Francia",
    "clubes": [
      c("FC Metz", null, "2004 - 2005"),
      c("Galatasaray", null, "2005"),
      c("Olympique de Marsella", LOGOS.marseille, "2005 - 2007"),
      c("Bayern Múnich", LOGOS.bayern, "2007 - 2019"),
      c("Fiorentina", null, "2019 - 2021"),
      c("Salernitana", null, "2021 - 2022")
    ]
  },
  {
    "id": 194,
    "nombre": "Steven Gerrard",
    "dificultad": "baja",
    "pista": "Eterno capitán del Liverpool ('Stevie G'), lideró la remontada del Milagro de Estambul en la final de Champions de 2005.",
    "alias": ["gerrard"],
    "nacionalidad": "Inglaterra",
    "clubes": [
      c("Liverpool FC", LOGOS.liverpool, "1998 - 2015"),
      c("LA Galaxy", null, "2015 - 2016")
    ]
  },
  {
    "id": 195,
    "nombre": "Frank Lampard",
    "dificultad": "baja",
    "pista": "Máximo goleador de toda la historia del Chelsea pese a jugar como centrocampista llegador.",
    "alias": ["lampard"],
    "nacionalidad": "Inglaterra",
    "clubes": [
      c("West Ham United", null, "1995 - 2001"),
      c("Swansea City", null, "1995 - 1996"),
      c("Chelsea FC", LOGOS.chelsea, "2001 - 2014"),
      c("Manchester City", LOGOS.mancity, "2014 - 2015"),
      c("New York City FC", null, "2015 - 2016")
    ]
  },
  {
    "id": 196,
    "nombre": "Paolo Maldini",
    "dificultad": "baja",
    "pista": "'Il Capitano', mito de un solo club que disputó 25 temporadas en el AC Milan ganando 5 Copas de Europa.",
    "alias": ["maldini"],
    "nacionalidad": "Italia",
    "clubes": [
      c("AC Milan", LOGOS.milan, "1984 - 2009")
    ]
  },
  {
    "id": 197,
    "nombre": "Francesco Totti",
    "dificultad": "baja",
    "pista": "'Il Capitano' y emperador eterno de la Roma, rechazó al Real Madrid para vestir una única camiseta durante 25 temporadas.",
    "alias": ["totti"],
    "nacionalidad": "Italia",
    "clubes": [
      c("AS Roma", LOGOS.roma, "1992 - 2017")
    ]
  },
  {
    "id": 198,
    "nombre": "Alessandro Del Piero",
    "dificultad": "baja",
    "pista": "'Pinturicchio', máximo goleador e icono de la Juventus que permaneció fiel a la Vecchia Signora incluso cuando descendió a la Serie B.",
    "alias": ["del piero"],
    "nacionalidad": "Italia",
    "clubes": [
      c("Padova", null, "1991 - 1993"),
      c("Juventus", LOGOS.juventus, "1993 - 2012"),
      c("Sydney FC", null, "2012 - 2014"),
      c("Delhi Dynamos", null, "2014")
    ]
  },
  {
    "id": 199,
    "nombre": "Roberto Carlos",
    "dificultad": "baja",
    "pista": "Lateral izquierdo brasileño con muslos descomunales, famoso por su tiro libre imposible con efecto exterior ante Francia en 1997.",
    "alias": ["roberto carlos"],
    "nacionalidad": "Brasil",
    "clubes": [
      c("Palmeiras", null, "1993 - 1995"),
      c("Inter de Milán", LOGOS.inter, "1995 - 1996"),
      c("Real Madrid", LOGOS.madrid, "1996 - 2007"),
      c("Fenerbahçe", null, "2007 - 2009"),
      c("Corinthians", null, "2010 - 2011"),
      c("Anzhi Makhachkala", null, "2011 - 2012")
    ]
  },
  {
    "id": 200,
    "nombre": "Cafú",
    "dificultad": "baja",
    "pista": "Único futbolista en la historia que ha disputado tres finales de la Copa del Mundo consecutivas (1994, 1998 y 2002), ganando dos.",
    "alias": ["cafu"],
    "nacionalidad": "Brasil",
    "clubes": [
      c("São Paulo FC", null, "1989 - 1994"),
      c("Real Zaragoza", null, "1995"),
      c("Palmeiras", null, "1995 - 1997"),
      c("AS Roma", LOGOS.roma, "1997 - 2003"),
      c("AC Milan", LOGOS.milan, "2003 - 2008")
    ]
  },
  {
    "id": 201,
    "nombre": "Rivaldo",
    "dificultad": "baja",
    "pista": "Balón de Oro en 1999 con el Barça; firmó uno de los mejores hat-tricks de la historia cerrándolo de chilena desde fuera del área ante el Valencia.",
    "alias": ["rivaldo"],
    "nacionalidad": "Brasil",
    "clubes": [
      c("Palmeiras", null, "1994 - 1996"),
      c("Deportivo La Coruña", LOGOS.depor, "1996 - 1997"),
      c("FC Barcelona", LOGOS.barca, "1997 - 2002"),
      c("AC Milan", LOGOS.milan, "2002 - 2004"),
      c("Olympiacos", null, "2004 - 2007"),
      c("AEK Atenas", null, "2007 - 2008")
    ]
  },
  {
    "id": 202,
    "nombre": "Diego Maradona",
    "dificultad": "baja",
    "pista": "'El Pelusa', autor del Gol del Siglo y la Mano de Dios en México 86, e ídolo eterno del Nápoles.",
    "alias": ["maradona", "el pelusa"],
    "nacionalidad": "Argentina",
    "clubes": [
      c("Argentinos Juniors", null, "1976 - 1981"),
      c("Boca Juniors", LOGOS.boca, "1981 - 1982"),
      c("FC Barcelona", LOGOS.barca, "1982 - 1984"),
      c("SSC Napoli", LOGOS.napoli, "1984 - 1991"),
      c("Sevilla FC", LOGOS.sevilla, "1992 - 1993"),
      c("Newell's Old Boys", null, "1993 - 1994"),
      c("Boca Juniors", LOGOS.boca, "1995 - 1997")
    ]
  },
  {
    "id": 203,
    "nombre": "Pelé",
    "dificultad": "baja",
    "pista": "'O Rei', único futbolista de la historia en conquistar tres Copas del Mundo (1958, 1962 y 1970).",
    "alias": ["pele", "o rei"],
    "nacionalidad": "Brasil",
    "clubes": [
      c("Santos FC", null, "1956 - 1974"),
      c("New York Cosmos", null, "1975 - 1977")
    ]
  },
  {
    "id": 204,
    "nombre": "Johan Cruyff",
    "dificultad": "baja",
    "pista": "Líder de la 'Naranja Mecánica', ganador de tres Balones de Oro y padre de la filosofía moderna del Ajax y del FC Barcelona.",
    "alias": ["cruyff"],
    "nacionalidad": "Países Bajos",
    "clubes": [
      c("AFC Ajax", LOGOS.ajax, "1964 - 1973"),
      c("FC Barcelona", LOGOS.barca, "1973 - 1978"),
      c("Los Angeles Aztecs", null, "1979"),
      c("Levante UD", null, "1981"),
      c("AFC Ajax", LOGOS.ajax, "1981 - 1983"),
      c("Feyenoord", null, "1983 - 1984")
    ]
  },
  {
    "id": 205,
    "nombre": "Phil Foden",
    "dificultad": "baja",
    "pista": "Joya zurda de la cantera del Manchester City ('El Francotirador de Stockport'), elegido mejor jugador de la Premier League en 2024.",
    "alias": ["foden"],
    "nacionalidad": "Inglaterra",
    "clubes": [
      c("Manchester City", LOGOS.mancity, "2017 - Presente")
    ]
  },
  {
    "id": 206,
    "nombre": "Gavi",
    "dificultad": "baja",
    "pista": "Centrocampista andaluz de La Masía famoso por su garra, intensidad en los duelos y por jugar con los cordones desatados.",
    "alias": ["gavi", "pablo gavi"],
    "nacionalidad": "España",
    "clubes": [
      c("FC Barcelona", LOGOS.barca, "2021 - Presente")
    ]
  },
  {
    "id": 207,
    "nombre": "Nico Williams",
    "dificultad": "baja",
    "pista": "Extremo eléctrico del Athletic Club y socio inseparable de Lamine Yamal; marcó en la final de la Eurocopa 2024 ante Inglaterra.",
    "alias": ["nico williams"],
    "nacionalidad": "España",
    "clubes": [
      c("Athletic Club", LOGOS.athletic, "2021 - Presente")
    ]
  },
  {
    "id": 208,
    "nombre": "Dani Olmo",
    "dificultad": "baja",
    "pista": "Mediapunta egarense que dio el salto formándose en Croacia antes de brillar en Alemania, ser máximo goleador de la Euro 2024 y volver al Barça.",
    "alias": ["olmo", "dani olmo"],
    "nacionalidad": "España",
    "clubes": [
      c("Dinamo Zagreb", null, "2015 - 2020"),
      c("RB Leipzig", null, "2020 - 2024"),
      c("FC Barcelona", LOGOS.barca, "2024 - Presente")
    ]
  },
  {
    "id": 209,
    "nombre": "Cole Palmer",
    "dificultad": "baja",
    "pista": "'Cold Palmer', estrella zurda inglesa famosa por su celebración frotándose los brazos de frío tras salir de la cantera del City rumbo a Stamford Bridge.",
    "alias": ["palmer", "cole palmer"],
    "nacionalidad": "Inglaterra",
    "clubes": [
      c("Manchester City", LOGOS.mancity, "2020 - 2023"),
      c("Chelsea FC", LOGOS.chelsea, "2023 - Presente")
    ]
  },
  {
    "id": 210,
    "nombre": "Jamal Musiala",
    "dificultad": "baja",
    "pista": "Apodado 'Bambi' por su increíble conducción y regate en espacios reducidos; pasó por las inferiores del Chelsea antes de liderar al Bayern y Alemania.",
    "alias": ["musiala"],
    "nacionalidad": "Alemania",
    "clubes": [
      c("Bayern Múnich", LOGOS.bayern, "2020 - Presente")
    ]
  },
  {
    "id": 211,
    "nombre": "Florian Wirtz",
    "dificultad": "baja",
    "pista": "Cerebro y MVP del histórico Bayer Leverkusen de Xabi Alonso que conquistó la primera Bundesliga invicta de la historia.",
    "alias": ["wirtz"],
    "nacionalidad": "Alemania",
    "clubes": [
      c("Bayer Leverkusen", null, "2020 - Presente")
    ]
  },
  {
    "id": 212,
    "nombre": "Martin Ødegaard",
    "dificultad": "baja",
    "pista": "Fichó por el Real Madrid con 16 años, enamoró a LaLiga en la Real Sociedad y hoy es el capitán y director de orquesta del Arsenal.",
    "alias": ["odegaard"],
    "nacionalidad": "Noruega",
    "clubes": [
      c("Strømsgodset", null, "2014 - 2015"),
      c("Real Madrid", LOGOS.madrid, "2015 - 2021"),
      c("SC Heerenveen", null, "2017 - 2018"),
      c("Vitesse Arnhem", null, "2018 - 2019"),
      c("Real Sociedad", LOGOS.sociedad, "2019 - 2020"),
      c("Arsenal FC", LOGOS.arsenal, "2021 - Presente")
    ]
  },
  {
    "id": 213,
    "nombre": "Declan Rice",
    "dificultad": "baja",
    "pista": "Centrocampista inglés que levantó la Conference League como capitán del West Ham antes de protagonizar un traspaso récord al Arsenal.",
    "alias": ["rice", "declan rice"],
    "nacionalidad": "Inglaterra",
    "clubes": [
      c("West Ham United", null, "2017 - 2023"),
      c("Arsenal FC", LOGOS.arsenal, "2023 - Presente")
    ]
  },
  {
    "id": 214,
    "nombre": "Marcus Rashford",
    "dificultad": "baja",
    "pista": "Atacante inglés criado en Old Trafford que tras una década en el Manchester United salió cedido al Aston Villa en 2025.",
    "alias": ["rashford"],
    "nacionalidad": "Inglaterra",
    "clubes": [
      c("Manchester United", LOGOS.manutd, "2015 - Presente"),
      c("Aston Villa", null, "2025")
    ]
  },
  {
    "id": 215,
    "nombre": "Trent Alexander-Arnold",
    "dificultad": "baja",
    "pista": "Lateral derecho con guante de mediocentro; famoso por su córner rápido ante el Barça en Anfield antes de fichar por el Real Madrid en 2025.",
    "alias": ["alexander-arnold", "arnold", "taa"],
    "nacionalidad": "Inglaterra",
    "clubes": [
      c("Liverpool FC", LOGOS.liverpool, "2016 - 2025"),
      c("Real Madrid", LOGOS.madrid, "2025 - Presente")
    ]
  },
  {
    "id": 216,
    "nombre": "Jack Grealish",
    "dificultad": "baja",
    "pista": "Extremo inglés inconfundible por llevar las medias bajas, sus potentes gemelos y su traspaso de 100 millones de libras del Aston Villa al City.",
    "alias": ["grealish"],
    "nacionalidad": "Inglaterra",
    "clubes": [
      c("Notts County", null, "2013 - 2014"),
      c("Aston Villa", null, "2014 - 2021"),
      c("Manchester City", LOGOS.mancity, "2021 - Presente")
    ]
  },
  {
    "id": 217,
    "nombre": "Kyle Walker",
    "dificultad": "baja",
    "pista": "Lateral derecho velocísimo que fue el antídoto habitual contra los extremos más rápidos de Europa en el Manchester City antes de pasar al Milan en 2025.",
    "alias": ["walker", "kyle walker"],
    "nacionalidad": "Inglaterra",
    "clubes": [
      c("Sheffield United", null, "2008 - 2009"),
      c("Tottenham Hotspur", LOGOS.tottenham, "2009 - 2017"),
      c("Aston Villa", null, "2011"),
      c("Manchester City", LOGOS.mancity, "2017 - 2025"),
      c("AC Milan", LOGOS.milan, "2025 - Presente")
    ]
  },
  {
    "id": 218,
    "nombre": "John Stones",
    "dificultad": "baja",
    "pista": "Defensa central inglés elegante con el balón al que Guardiola reconvirtió en mediocentro híbrido para ganar el Triplete con el City.",
    "alias": ["stones"],
    "nacionalidad": "Inglaterra",
    "clubes": [
      c("Barnsley FC", null, "2011 - 2013"),
      c("Everton FC", null, "2013 - 2016"),
      c("Manchester City", LOGOS.mancity, "2016 - Presente")
    ]
  },
  {
    "id": 219,
    "nombre": "Rúben Dias",
    "dificultad": "baja",
    "pista": "Mariscal defensivo portugués formado en el Benfica que se convirtió en el líder de la zaga del Manchester City desde su llegada en 2020.",
    "alias": ["ruben dias"],
    "nacionalidad": "Portugal",
    "clubes": [
      c("SL Benfica", LOGOS.benfica, "2017 - 2020"),
      c("Manchester City", LOGOS.mancity, "2020 - Presente")
    ]
  },
  {
    "id": 220,
    "nombre": "Ederson Moraes",
    "dificultad": "baja",
    "pista": "Portero brasileño del Manchester City famoso por su tatuaje de una rosa en el cuello y por tener uno de los saques en largo más precisos y potentes del mundo.",
    "alias": ["ederson"],
    "nacionalidad": "Brasil",
    "clubes": [
      c("Rio Ave", null, "2012 - 2015"),
      c("SL Benfica", LOGOS.benfica, "2015 - 2017"),
      c("Manchester City", LOGOS.mancity, "2017 - Presente")
    ]
  },
  {
    "id": 221,
    "nombre": "Gianluigi Donnarumma",
    "dificultad": "baja",
    "pista": "Debutó en la portería del AC Milan con solo 16 años y fue elegido MVP de la Eurocopa 2020 tras ser héroe en la tanda de penaltis de Wembley.",
    "alias": ["donnarumma"],
    "nacionalidad": "Italia",
    "clubes": [
      c("AC Milan", LOGOS.milan, "2015 - 2021"),
      c("Paris Saint-Germain", LOGOS.psg, "2021 - Presente")
    ]
  },
  {
    "id": 222,
    "nombre": "Emiliano Martínez",
    "dificultad": "baja",
    "pista": "'El Dibu', protagonista de la parada del siglo a Kolo Muani en el minuto 123 de la final de Qatar 2022 y especialista en tandas de penaltis.",
    "alias": ["dibu martinez", "dibu", "emiliano martinez"],
    "nacionalidad": "Argentina",
    "clubes": [
      c("Arsenal FC", LOGOS.arsenal, "2012 - 2020"),
      c("Getafe CF", null, "2017 - 2018"),
      c("Reading FC", null, "2019"),
      c("Aston Villa", null, "2020 - Presente")
    ]
  },
  {
    "id": 223,
    "nombre": "Antonio Rüdiger",
    "dificultad": "baja",
    "pista": "'El Loco', central alemán famoso por su peculiar forma de correr levantando las rodillas y su férreo marcaje a Haaland en Champions.",
    "alias": ["rudiger"],
    "nacionalidad": "Alemania",
    "clubes": [
      c("VfB Stuttgart", null, "2012 - 2015"),
      c("AS Roma", LOGOS.roma, "2015 - 2017"),
      c("Chelsea FC", LOGOS.chelsea, "2017 - 2022"),
      c("Real Madrid", LOGOS.madrid, "2022 - Presente")
    ]
  },
  {
    "id": 224,
    "nombre": "Éder Militão",
    "dificultad": "baja",
    "pista": "Central brasileño rapidísimo al corte que llegó al Real Madrid procedente del Oporto y ganó dos Champions como merengue.",
    "alias": ["militao"],
    "nacionalidad": "Brasil",
    "clubes": [
      c("São Paulo FC", null, "2017 - 2018"),
      c("FC Porto", LOGOS.porto, "2018 - 2019"),
      c("Real Madrid", LOGOS.madrid, "2019 - Presente")
    ]
  },
  {
    "id": 225,
    "nombre": "Eduardo Camavinga",
    "dificultad": "baja",
    "pista": "Todocampista zurdo francés que explotó siendo adolescente en el Rennes y revolucionó las remontadas de la 14ª Champions del Real Madrid.",
    "alias": ["camavinga"],
    "nacionalidad": "Francia",
    "clubes": [
      c("Stade Rennais", null, "2019 - 2021"),
      c("Real Madrid", LOGOS.madrid, "2021 - Presente")
    ]
  },
  {
    "id": 226,
    "nombre": "Aurélien Tchouaméni",
    "dificultad": "baja",
    "pista": "Mediocentro defensivo y central ocasional francés fichado por el Real Madrid procedente del Mónaco como relevo generacional de Casemiro.",
    "alias": ["tchouameni"],
    "nacionalidad": "Francia",
    "clubes": [
      c("Girondins de Burdeos", null, "2018 - 2020"),
      c("AS Mónaco", LOGOS.monaco, "2020 - 2022"),
      c("Real Madrid", LOGOS.madrid, "2022 - Presente")
    ]
  },
  {
    "id": 227,
    "nombre": "Jules Koundé",
    "dificultad": "baja",
    "pista": "Defensa francés conocido por sus llamativos looks de moda al llegar a los estadios; brilló como central en el Sevilla y como lateral en el Barça.",
    "alias": ["kounde"],
    "nacionalidad": "Francia",
    "clubes": [
      c("Girondins de Burdeos", null, "2017 - 2019"),
      c("Sevilla FC", LOGOS.sevilla, "2019 - 2022"),
      c("FC Barcelona", LOGOS.barca, "2022 - Presente")
    ]
  },
  {
    "id": 228,
    "nombre": "Ronald Araújo",
    "dificultad": "baja",
    "pista": "Poderoso defensa central uruguayo y uno de los capitanes del FC Barcelona, solía ser ubicado en el lateral derecho para frenar a Vinicius en los Clásicos.",
    "alias": ["araujo"],
    "nacionalidad": "Uruguay",
    "clubes": [
      c("Rentistas", null, "2016 - 2017"),
      c("Boston River", null, "2017 - 2018"),
      c("FC Barcelona", LOGOS.barca, "2019 - Presente")
    ]
  },
  {
    "id": 229,
    "nombre": "Rafael Leão",
    "dificultad": "baja",
    "pista": "Extremo portugués de zancada imparable que juega siempre sonriendo; fue el MVP de la Serie A cuando el Milan reconquistó el Scudetto en 2022.",
    "alias": ["leao", "rafael leao"],
    "nacionalidad": "Portugal",
    "clubes": [
      c("Sporting CP", LOGOS.sporting, "2017 - 2018"),
      c("Lille OSC", null, "2018 - 2019"),
      c("AC Milan", LOGOS.milan, "2019 - Presente")
    ]
  },
  {
    "id": 230,
    "nombre": "Theo Hernández",
    "dificultad": "baja",
    "pista": "Lateral izquierdo de potencia descomunal; tras pasar por Atlético y Real Madrid se convirtió en ídolo y capitán del AC Milan.",
    "alias": ["theo hernandez", "theo"],
    "nacionalidad": "Francia",
    "clubes": [
      c("Deportivo Alavés", null, "2016 - 2017"),
      c("Real Madrid", LOGOS.madrid, "2017 - 2019"),
      c("Real Sociedad", LOGOS.sociedad, "2018 - 2019"),
      c("AC Milan", LOGOS.milan, "2019 - Presente")
    ]
  },
  {
    "id": 231,
    "nombre": "Khvicha Kvaratskhelia",
    "dificultad": "baja",
    "pista": "Apodado 'Kvaradona' en el sur de Italia tras devolver el Scudetto al Nápoles 33 años después, antes de fichar por el PSG en enero de 2025.",
    "alias": ["kvaratskhelia", "kvara"],
    "nacionalidad": "Georgia",
    "clubes": [
      c("Rubin Kazán", null, "2019 - 2022"),
      c("Dinamo Batumi", null, "2022"),
      c("SSC Napoli", LOGOS.napoli, "2022 - 2025"),
      c("Paris Saint-Germain", LOGOS.psg, "2025 - Presente")
    ]
  },
  {
    "id": 232,
    "nombre": "Nicolò Barella",
    "dificultad": "baja",
    "pista": "Motor incansable sardo del centro del campo del Inter de Milán y campeón de la Eurocopa 2020 con la selección italiana.",
    "alias": ["barella"],
    "nacionalidad": "Italia",
    "clubes": [
      c("Cagliari", null, "2014 - 2019"),
      c("Como 1907", null, "2016"),
      c("Inter de Milán", LOGOS.inter, "2019 - Presente")
    ]
  },
  {
    "id": 233,
    "nombre": "João Félix",
    "dificultad": "baja",
    "pista": "Golden Boy 2019 por el que el Atlético pagó 127 millones al Benfica; luego encadenó etapas en Chelsea, FC Barcelona y AC Milan.",
    "alias": ["joao felix"],
    "nacionalidad": "Portugal",
    "clubes": [
      c("SL Benfica", LOGOS.benfica, "2018 - 2019"),
      c("Atlético de Madrid", LOGOS.atletico, "2019 - 2024"),
      c("Chelsea FC", LOGOS.chelsea, "2023"),
      c("FC Barcelona", LOGOS.barca, "2023 - 2024"),
      c("Chelsea FC", LOGOS.chelsea, "2024 - 2025"),
      c("AC Milan", LOGOS.milan, "2025 - Presente")
    ]
  },
  {
    "id": 234,
    "nombre": "João Cancelo",
    "dificultad": "baja",
    "pista": "Lateral portugués de enorme talento ofensivo que ha vestido las camisetas de Valencia, Inter, Juventus, Man City, Bayern y Barça antes de ir a Arabia.",
    "alias": ["cancelo", "joao cancelo"],
    "nacionalidad": "Portugal",
    "clubes": [
      c("SL Benfica", LOGOS.benfica, "2014 - 2015"),
      c("Valencia CF", LOGOS.valencia, "2014 - 2018"),
      c("Inter de Milán", LOGOS.inter, "2017 - 2018"),
      c("Juventus", LOGOS.juventus, "2018 - 2019"),
      c("Manchester City", LOGOS.mancity, "2019 - 2024"),
      c("Bayern Múnich", LOGOS.bayern, "2023"),
      c("FC Barcelona", LOGOS.barca, "2023 - 2024"),
      c("Al Hilal", null, "2024 - Presente")
    ]
  },
  {
    "id": 235,
    "nombre": "Koke Resurrección",
    "dificultad": "baja",
    "pista": "Capitán y futbolista con más partidos disputados en toda la historia del Atlético de Madrid.",
    "alias": ["koke"],
    "nacionalidad": "España",
    "clubes": [
      c("Atlético de Madrid", LOGOS.atletico, "2009 - Presente")
    ]
  },
  {
    "id": 236,
    "nombre": "Iñaki Williams",
    "dificultad": "baja",
    "pista": "Delantero del Athletic Club que batió el récord histórico de LaLiga jugando 251 partidos consecutivos sin perderse ni uno solo por lesión.",
    "alias": ["inaki williams"],
    "nacionalidad": "Ghana",
    "clubes": [
      c("Athletic Club", LOGOS.athletic, "2014 - Presente")
    ]
  },
  {
    "id": 237,
    "nombre": "Mikel Oyarzabal",
    "dificultad": "baja",
    "pista": "Capitán de la Real Sociedad y héroe de España al marcar en el minuto 86 el gol de la victoria ante Inglaterra en la final de la Eurocopa 2024.",
    "alias": ["oyarzabal"],
    "nacionalidad": "España",
    "clubes": [
      c("Real Sociedad", LOGOS.sociedad, "2015 - Presente")
    ]
  },
  {
    "id": 238,
    "nombre": "Unai Simón",
    "dificultad": "baja",
    "pista": "Portero titular de la selección española campeona de la Euro 2024 y ganador del Trofeo Zamora con el Athletic Club.",
    "alias": ["unai simon"],
    "nacionalidad": "España",
    "clubes": [
      c("Athletic Club", LOGOS.athletic, "2018 - Presente")
    ]
  },
  {
    "id": 239,
    "nombre": "Marc Cucurella",
    "dificultad": "baja",
    "pista": "Lateral izquierdo de inconfundible melena rizada; dio la asistencia del gol del título en la Eurocopa 2024 y milita en el Chelsea.",
    "alias": ["cucurella"],
    "nacionalidad": "España",
    "clubes": [
      c("FC Barcelona", LOGOS.barca, "2017 - 2020"),
      c("SD Eibar", null, "2018 - 2019"),
      c("Getafe CF", null, "2019 - 2021"),
      c("Brighton & Hove Albion", null, "2021 - 2022"),
      c("Chelsea FC", LOGOS.chelsea, "2022 - Presente")
    ]
  },
  {
    "id": 240,
    "nombre": "Fabián Ruiz",
    "dificultad": "baja",
    "pista": "Centrocampista zurdo de Los Palacios criado en el Betis que brilló en el Nápoles, fichó por el PSG y fue pieza clave de España en la Euro 2024.",
    "alias": ["fabian", "fabian ruiz"],
    "nacionalidad": "España",
    "clubes": [
      c("Real Betis", LOGOS.betis, "2014 - 2018"),
      c("Elche CF", null, "2017"),
      c("SSC Napoli", LOGOS.napoli, "2018 - 2022"),
      c("Paris Saint-Germain", LOGOS.psg, "2022 - Presente")
    ]
  },
  {
    "id": 241,
    "nombre": "Pedro Rodríguez",
    "dificultad": "media",
    "pista": "Extremo tinerfeño que en 2009 se convirtió en el primer jugador de la historia en marcar en 6 competiciones oficiales distintas en un mismo año con el Barça.",
    "alias": ["pedro", "pedrito"],
    "nacionalidad": "España",
    "clubes": [
      c("FC Barcelona", LOGOS.barca, "2008 - 2015"),
      c("Chelsea FC", LOGOS.chelsea, "2015 - 2020"),
      c("AS Roma", LOGOS.roma, "2020 - 2021"),
      c("Lazio", null, "2021 - Presente")
    ]
  },
  {
    "id": 242,
    "nombre": "Juan Mata",
    "dificultad": "media",
    "pista": "Mediapunta zurdo burgalés criado en Oviedo y Real Madrid; fue elegido dos veces mejor jugador del año en el Chelsea antes de fichar por el Manchester United.",
    "alias": ["mata", "juan mata"],
    "nacionalidad": "España",
    "clubes": [
      c("Valencia CF", LOGOS.valencia, "2007 - 2011"),
      c("Chelsea FC", LOGOS.chelsea, "2011 - 2014"),
      c("Manchester United", LOGOS.manutd, "2014 - 2022"),
      c("Galatasaray", null, "2022 - 2023"),
      c("Vissel Kobe", null, "2023"),
      c("Western Sydney Wanderers", null, "2024 - Presente")
    ]
  },
  {
    "id": 243,
    "nombre": "César Azpilicueta",
    "dificultad": "media",
    "pista": "Apodado 'Dave' por la afición del Chelsea, donde fue capitán y levantó la Champions de 2021 antes de pasar por el Atlético y el Sevilla.",
    "alias": ["azpilicueta", "dave"],
    "nacionalidad": "España",
    "clubes": [
      c("CA Osasuna", null, "2007 - 2010"),
      c("Olympique de Marsella", LOGOS.marseille, "2010 - 2012"),
      c("Chelsea FC", LOGOS.chelsea, "2012 - 2023"),
      c("Atlético de Madrid", LOGOS.atletico, "2023 - 2025"),
      c("Sevilla FC", LOGOS.sevilla, "2025 - Presente")
    ]
  },
  {
    "id": 244,
    "nombre": "Marcos Alonso",
    "dificultad": "media",
    "pista": "Tercera generación de una dinastía de futbolistas internacionales españoles; carrilero zurdo con gran golpeo de falta que brilló en el Chelsea.",
    "alias": ["marcos alonso"],
    "nacionalidad": "España",
    "clubes": [
      c("Real Madrid", LOGOS.madrid, "2010"),
      c("Bolton Wanderers", null, "2010 - 2013"),
      c("Fiorentina", null, "2013 - 2016"),
      c("Sunderland", null, "2014"),
      c("Chelsea FC", LOGOS.chelsea, "2016 - 2022"),
      c("FC Barcelona", LOGOS.barca, "2022 - 2024"),
      c("Celta de Vigo", LOGOS.celta, "2024 - Presente")
    ]
  },
  {
    "id": 245,
    "nombre": "Saúl Ñíguez",
    "dificultad": "media",
    "pista": "Centrocampista ilicitano del Atlético de Madrid recordado por su golazo maradoniano slalomeando a toda la defensa del Bayern Múnich en semifinales de Champions.",
    "alias": ["saul", "saul niguez"],
    "nacionalidad": "España",
    "clubes": [
      c("Atlético de Madrid", LOGOS.atletico, "2012 - Presente"),
      c("Rayo Vallecano", null, "2013 - 2014"),
      c("Chelsea FC", LOGOS.chelsea, "2021 - 2022"),
      c("Sevilla FC", LOGOS.sevilla, "2024 - 2025")
    ]
  },
  {
    "id": 246,
    "nombre": "Marcos Llorente",
    "dificultad": "media",
    "pista": "Pasó de mediocentro defensivo en el Real Madrid a todocampista ofensivo en el Atlético tras su histórico doblete en Anfield en la prórroga de Champions.",
    "alias": ["marcos llorente", "llorente"],
    "nacionalidad": "España",
    "clubes": [
      c("Real Madrid", LOGOS.madrid, "2015 - 2019"),
      c("Deportivo Alavés", null, "2016 - 2017"),
      c("Atlético de Madrid", LOGOS.atletico, "2019 - Presente")
    ]
  },
  {
    "id": 247,
    "nombre": "Lucas Vázquez",
    "dificultad": "media",
    "pista": "'Cafucas', gallego reconvertido de extremo a lateral derecho que caminó hacia el punto de penalti dando toques con el dedo en la final de Milán 2016.",
    "alias": ["lucas vazquez"],
    "nacionalidad": "España",
    "clubes": [
      c("RCD Espanyol", LOGOS.espanyol, "2014 - 2015"),
      c("Real Madrid", LOGOS.madrid, "2015 - 2025")
    ]
  },
  {
    "id": 248,
    "nombre": "Nacho Fernández",
    "dificultad": "media",
    "pista": "Defensa comodín criado desde niño en Valdebebas que se despidió del Real Madrid levantando la 15ª Champions y LaLiga como primer capitán.",
    "alias": ["nacho"],
    "nacionalidad": "España",
    "clubes": [
      c("Real Madrid", LOGOS.madrid, "2011 - 2024"),
      c("Al Qadsiah", null, "2024 - Presente")
    ]
  },
  {
    "id": 249,
    "nombre": "Joselu Mato",
    "dificultad": "media",
    "pista": "Delantero que asistió como aficionado a la final de París 2022 y dos años después metió al Real Madrid en la final de Wembley con un doblete al Bayern en 3 minutos.",
    "alias": ["joselu"],
    "nacionalidad": "España",
    "clubes": [
      c("Celta de Vigo", LOGOS.celta, "2009 - 2010"),
      c("TSG Hoffenheim", null, "2012 - 2014"),
      c("Stoke City", null, "2015 - 2017"),
      c("Deportivo La Coruña", LOGOS.depor, "2016 - 2017"),
      c("Newcastle United", null, "2017 - 2019"),
      c("Deportivo Alavés", null, "2019 - 2022"),
      c("RCD Espanyol", LOGOS.espanyol, "2022 - 2023"),
      c("Real Madrid", LOGOS.madrid, "2023 - 2024"),
      c("Al Gharafa", null, "2024 - Presente")
    ]
  },
  {
    "id": 250,
    "nombre": "Gerard Moreno",
    "dificultad": "media",
    "pista": "Máximo goleador de la historia del Villarreal CF y autor del gol en la final de Gdańsk que dio al Submarino Amarillo su primera Europa League.",
    "alias": ["gerard moreno"],
    "nacionalidad": "España",
    "clubes": [
      c("Villarreal CF", LOGOS.villarreal, "2012 - 2015"),
      c("RCD Mallorca", null, "2013 - 2014"),
      c("RCD Espanyol", LOGOS.espanyol, "2015 - 2018"),
      c("Villarreal CF", LOGOS.villarreal, "2018 - Presente")
    ]
  },
  {
    "id": 251,
    "nombre": "Dani Parejo",
    "dificultad": "media",
    "pista": "Director de orquesta de Coslada; levantó la Copa del Rey de 2019 como capitán del Valencia antes de pasar a dirigir la medular del Villarreal.",
    "alias": ["parejo", "dani parejo"],
    "nacionalidad": "España",
    "clubes": [
      c("Real Madrid", LOGOS.madrid, "2008 - 2009"),
      c("Queens Park Rangers", null, "2008"),
      c("Getafe CF", null, "2009 - 2011"),
      c("Valencia CF", LOGOS.valencia, "2011 - 2020"),
      c("Villarreal CF", LOGOS.villarreal, "2020 - Presente")
    ]
  },
  {
    "id": 252,
    "nombre": "Raúl Albiol",
    "dificultad": "media",
    "pista": "'El Chori', central valenciano campeón del mundo y dos veces de Europa con España, con largas etapas en Valencia, Real Madrid, Nápoles y Villarreal.",
    "alias": ["albiol", "raul albiol"],
    "nacionalidad": "España",
    "clubes": [
      c("Getafe CF", null, "2004 - 2005"),
      c("Valencia CF", LOGOS.valencia, "2005 - 2009"),
      c("Real Madrid", LOGOS.madrid, "2009 - 2013"),
      c("SSC Napoli", LOGOS.napoli, "2013 - 2019"),
      c("Villarreal CF", LOGOS.villarreal, "2019 - 2025")
    ]
  },
  {
    "id": 253,
    "nombre": "José María Callejón",
    "dificultad": "media",
    "pista": "Extremo motrileño canterano del Real Madrid que hizo carrera histórica en el Nápoles siendo el español con más goles en la Serie A.",
    "alias": ["callejon"],
    "nacionalidad": "España",
    "clubes": [
      c("RCD Espanyol", LOGOS.espanyol, "2008 - 2011"),
      c("Real Madrid", LOGOS.madrid, "2011 - 2013"),
      c("SSC Napoli", LOGOS.napoli, "2013 - 2020"),
      c("Fiorentina", null, "2020 - 2022"),
      c("Granada CF", null, "2022 - 2024"),
      c("Marbella FC", null, "2024 - 2025")
    ]
  },
  {
    "id": 254,
    "nombre": "Pepe Reina",
    "dificultad": "media",
    "pista": "Carismático guardameta y alma del vestuario de la España campeona del mundo; superó los 1.000 partidos oficiales tras jugar en 4 grandes ligas.",
    "alias": ["reina", "pepe reina"],
    "nacionalidad": "España",
    "clubes": [
      c("FC Barcelona", LOGOS.barca, "2000 - 2002"),
      c("Villarreal CF", LOGOS.villarreal, "2002 - 2005"),
      c("Liverpool FC", LOGOS.liverpool, "2005 - 2014"),
      c("SSC Napoli", LOGOS.napoli, "2013 - 2014"),
      c("Bayern Múnich", LOGOS.bayern, "2014 - 2015"),
      c("SSC Napoli", LOGOS.napoli, "2015 - 2018"),
      c("AC Milan", LOGOS.milan, "2018 - 2020"),
      c("Lazio", null, "2020 - 2022"),
      c("Villarreal CF", LOGOS.villarreal, "2022 - 2024"),
      c("Como 1907", null, "2024 - 2025")
    ]
  },
  {
    "id": 255,
    "nombre": "Víctor Valdés",
    "dificultad": "media",
    "pista": "El portero más laureado de la historia del FC Barcelona, ganador de 5 Trofeos Zamora y clave con sus paradas ante Henry en la final de París 2006.",
    "alias": ["valdes", "victor valdes"],
    "nacionalidad": "España",
    "clubes": [
      c("FC Barcelona", LOGOS.barca, "2002 - 2014"),
      c("Manchester United", LOGOS.manutd, "2015 - 2016"),
      c("Standard de Lieja", null, "2016"),
      c("Middlesbrough FC", null, "2016 - 2017")
    ]
  },
  {
    "id": 256,
    "nombre": "Álvaro Arbeloa",
    "dificultad": "media",
    "pista": "'El Espartano', lateral defensivo campeón del mundo con España y de dos Champions con el Real Madrid tras curtirse en el Liverpool de Benítez.",
    "alias": ["arbeloa"],
    "nacionalidad": "España",
    "clubes": [
      c("Real Madrid", LOGOS.madrid, "2004 - 2006"),
      c("Deportivo La Coruña", LOGOS.depor, "2006 - 2007"),
      c("Liverpool FC", LOGOS.liverpool, "2007 - 2009"),
      c("Real Madrid", LOGOS.madrid, "2009 - 2016"),
      c("West Ham United", null, "2016 - 2017")
    ]
  },
  {
    "id": 257,
    "nombre": "Fernando Llorente",
    "dificultad": "media",
    "pista": "'El Rey León', imponente delantero centro riojano del Athletic Club que ganó títulos en la Juventus, conquistó la Europa League en el Sevilla y llevó al Tottenham a la final de Champions.",
    "alias": ["fernando llorente"],
    "nacionalidad": "España",
    "clubes": [
      c("Athletic Club", LOGOS.athletic, "2005 - 2013"),
      c("Juventus", LOGOS.juventus, "2013 - 2015"),
      c("Sevilla FC", LOGOS.sevilla, "2015 - 2016"),
      c("Swansea City", null, "2016 - 2017"),
      c("Tottenham Hotspur", LOGOS.tottenham, "2017 - 2019"),
      c("SSC Napoli", LOGOS.napoli, "2019 - 2021"),
      c("Udinese", null, "2021"),
      c("SD Eibar", null, "2021 - 2022")
    ]
  },
  {
    "id": 258,
    "nombre": "Javi Martínez",
    "dificultad": "media",
    "pista": "Mediocentro y central navarro por el que el Bayern Múnich pagó su cláusula récord al Athletic en 2012, ganando dos Tripletes en Baviera.",
    "alias": ["javi martinez"],
    "nacionalidad": "España",
    "clubes": [
      c("Athletic Club", LOGOS.athletic, "2006 - 2012"),
      c("Bayern Múnich", LOGOS.bayern, "2012 - 2021"),
      c("Qatar SC", null, "2021 - Presente")
    ]
  },
  {
    "id": 259,
    "nombre": "Ander Herrera",
    "dificultad": "media",
    "pista": "Centrocampista bilbaíno criado en el Real Zaragoza que brilló en el Athletic, Manchester United y PSG antes de cumplir su sueño de jugar en Boca Juniors.",
    "alias": ["ander herrera", "herrera"],
    "nacionalidad": "España",
    "clubes": [
      c("Real Zaragoza", null, "2009 - 2011"),
      c("Athletic Club", LOGOS.athletic, "2011 - 2014"),
      c("Manchester United", LOGOS.manutd, "2014 - 2019"),
      c("Paris Saint-Germain", LOGOS.psg, "2019 - 2022"),
      c("Athletic Club", LOGOS.athletic, "2022 - 2025"),
      c("Boca Juniors", LOGOS.boca, "2025 - Presente")
    ]
  },
  {
    "id": 260,
    "nombre": "Iker Muniain",
    "dificultad": "media",
    "pista": "histórico capitán del Athletic Club que tras levantar la ansiada Copa del Rey en la Gabarra después de 40 años puso rumbo a Argentina para jugar en San Lorenzo.",
    "alias": ["muniain"],
    "nacionalidad": "España",
    "clubes": [
      c("Athletic Club", LOGOS.athletic, "2009 - 2024"),
      c("San Lorenzo", null, "2024 - 2025")
    ]
  },
  {
    "id": 261,
    "nombre": "Álvaro Negredo",
    "dificultad": "media",
    "pista": "'La Bestia de Vallecas', potente delantero zurdo campeón de la Euro 2012 con España y de la Premier League con el Manchester City.",
    "alias": ["negredo"],
    "nacionalidad": "España",
    "clubes": [
      c("UD Almería", null, "2007 - 2009"),
      c("Sevilla FC", LOGOS.sevilla, "2009 - 2013"),
      c("Manchester City", LOGOS.mancity, "2013 - 2015"),
      c("Valencia CF", LOGOS.valencia, "2014 - 2017"),
      c("Middlesbrough FC", null, "2016 - 2017"),
      c("Besiktas", null, "2017 - 2018"),
      c("Cádiz CF", null, "2020 - 2024"),
      c("Real Valladolid", null, "2024")
    ]
  },
  {
    "id": 262,
    "nombre": "Roberto Soldado",
    "dificultad": "media",
    "pista": "Goleador valenciano formado en La Fábrica del Real Madrid que firmó grandes cifras realizadoras en Getafe, Valencia y Villarreal además de pasar por el Tottenham.",
    "alias": ["soldado"],
    "nacionalidad": "España",
    "clubes": [
      c("Real Madrid", LOGOS.madrid, "2005 - 2008"),
      c("CA Osasuna", null, "2006 - 2007"),
      c("Getafe CF", null, "2008 - 2010"),
      c("Valencia CF", LOGOS.valencia, "2010 - 2013"),
      c("Tottenham Hotspur", LOGOS.tottenham, "2013 - 2015"),
      c("Villarreal CF", LOGOS.villarreal, "2015 - 2017"),
      c("Fenerbahçe", null, "2017 - 2019"),
      c("Granada CF", null, "2019 - 2021"),
      c("Levante UD", null, "2021 - 2023")
    ]
  },
  {
    "id": 263,
    "nombre": "Sergio Canales",
    "dificultad": "media",
    "pista": "Talentoso mediapunta cántabro que superó tres roturas de ligamento cruzado para ser campeón de Copa con el Betis y de la Nations League con España.",
    "alias": ["canales"],
    "nacionalidad": "España",
    "clubes": [
      c("Racing de Santander", null, "2008 - 2010"),
      c("Real Madrid", LOGOS.madrid, "2010 - 2011"),
      c("Valencia CF", LOGOS.valencia, "2011 - 2014"),
      c("Real Sociedad", LOGOS.sociedad, "2014 - 2018"),
      c("Real Betis", LOGOS.betis, "2018 - 2023"),
      c("CF Monterrey", null, "2023 - Presente")
    ]
  },
  {
    "id": 264,
    "nombre": "Pablo Sarabia",
    "dificultad": "media",
    "pista": "Extremo zurdo madrileño que tras salirse en el Sevilla fichó por el PSG, brilló cedido en el Sporting de Portugal y recaló en la Premier con los Wolves.",
    "alias": ["sarabia"],
    "nacionalidad": "España",
    "clubes": [
      c("Getafe CF", null, "2011 - 2016"),
      c("Sevilla FC", LOGOS.sevilla, "2016 - 2019"),
      c("Paris Saint-Germain", LOGOS.psg, "2019 - 2023"),
      c("Sporting CP", LOGOS.sporting, "2021 - 2022"),
      c("Wolverhampton", null, "2023 - Presente")
    ]
  },
  {
    "id": 265,
    "nombre": "Ferran Torres",
    "dificultad": "media",
    "pista": "'El Tiburón', atacante valenciano que dio el salto al Manchester City de Guardiola con 20 años antes de fichar por el FC Barcelona.",
    "alias": ["ferran torres", "ferran"],
    "nacionalidad": "España",
    "clubes": [
      c("Valencia CF", LOGOS.valencia, "2017 - 2020"),
      c("Manchester City", LOGOS.mancity, "2020 - 2021"),
      c("FC Barcelona", LOGOS.barca, "2022 - Presente")
    ]
  },
  {
    "id": 266,
    "nombre": "Aymeric Laporte",
    "dificultad": "media",
    "pista": "Central zurdo nacido en Francia pero formado en Lezama y nacionalizado español, titular indiscutible en el título de la Eurocopa 2024.",
    "alias": ["laporte"],
    "nacionalidad": "España",
    "clubes": [
      c("Athletic Club", LOGOS.athletic, "2012 - 2018"),
      c("Manchester City", LOGOS.mancity, "2018 - 2023"),
      c("Al Nassr", null, "2023 - Presente")
    ]
  },
  {
    "id": 267,
    "nombre": "Robin Le Normand",
    "dificultad": "media",
    "pista": "Defensa central bretón nacionalizado español que se consolidó en la Real Sociedad, ganó la Euro 2024 con España y fichó por el Atlético de Madrid.",
    "alias": ["le normand"],
    "nacionalidad": "España",
    "clubes": [
      c("Stade Brestois", null, "2016"),
      c("Real Sociedad", LOGOS.sociedad, "2018 - 2024"),
      c("Atlético de Madrid", LOGOS.atletico, "2024 - Presente")
    ]
  },
  {
    "id": 268,
    "nombre": "Mikel Merino",
    "dificultad": "media",
    "pista": "Autor del histórico cabezazo en el minuto 119 ante Alemania en cuartos de la Euro 2024 emulando la celebración de su padre alrededor del banderín en Stuttgart.",
    "alias": ["mikel merino", "merino"],
    "nacionalidad": "España",
    "clubes": [
      c("CA Osasuna", null, "2014 - 2016"),
      c("Borussia Dortmund", LOGOS.dortmund, "2016 - 2017"),
      c("Newcastle United", null, "2017 - 2018"),
      c("Real Sociedad", LOGOS.sociedad, "2018 - 2024"),
      c("Arsenal FC", LOGOS.arsenal, "2024 - Presente")
    ]
  },
  {
    "id": 269,
    "nombre": "Martín Zubimendi",
    "dificultad": "media",
    "pista": "Mediocentro donostiarra que entró al descanso de la final de la Eurocopa 2024 por el lesionado Rodri y sostuvo con maestría a España hacia el título.",
    "alias": ["zubimendi"],
    "nacionalidad": "España",
    "clubes": [
      c("Real Sociedad", LOGOS.sociedad, "2019 - Presente")
    ]
  },
  {
    "id": 270,
    "nombre": "Álex Grimaldo",
    "dificultad": "media",
    "pista": "Carrilero izquierdo valenciano con guante a balón parado; tras formarse en La Masía y triunfar en el Benfica, explotó en el Leverkusen invicto de Xabi Alonso.",
    "alias": ["grimaldo"],
    "nacionalidad": "España",
    "clubes": [
      c("SL Benfica", LOGOS.benfica, "2016 - 2023"),
      c("Bayer Leverkusen", null, "2023 - Presente")
    ]
  },
  {
    "id": 271,
    "nombre": "Pedro Porro",
    "dificultad": "media",
    "pista": "Lateral derecho extremeño de gran vocación ofensiva que despuntó en el Girona y el Sporting de Portugal antes de afianzarse en el Tottenham.",
    "alias": ["pedro porro"],
    "nacionalidad": "España",
    "clubes": [
      c("Girona FC", null, "2017 - 2019"),
      c("Real Valladolid", null, "2019 - 2020"),
      c("Sporting CP", LOGOS.sporting, "2020 - 2023"),
      c("Tottenham Hotspur", LOGOS.tottenham, "2023 - Presente")
    ]
  },
  {
    "id": 272,
    "nombre": "David Raya",
    "dificultad": "media",
    "pista": "Portero catalán que emigró de adolescente al fútbol inglés en el Blackburn y se consagró como Guante de Oro de la Premier League con el Arsenal.",
    "alias": ["raya", "david raya"],
    "nacionalidad": "España",
    "clubes": [
      c("Blackburn Rovers", null, "2014 - 2019"),
      c("Brentford FC", null, "2019 - 2024"),
      c("Arsenal FC", LOGOS.arsenal, "2023 - Presente")
    ]
  },
  {
    "id": 273,
    "nombre": "Kepa Arrizabalaga",
    "dificultad": "media",
    "pista": "Se convirtió en el guardameta más caro de la historia del fútbol cuando el Chelsea abonó los 80 millones de euros de su cláusula al Athletic Club.",
    "alias": ["kepa"],
    "nacionalidad": "España",
    "clubes": [
      c("Real Valladolid", null, "2015 - 2016"),
      c("Athletic Club", LOGOS.athletic, "2016 - 2018"),
      c("Chelsea FC", LOGOS.chelsea, "2018 - Presente"),
      c("Real Madrid", LOGOS.madrid, "2023 - 2024"),
      c("AFC Bournemouth", null, "2024 - Presente")
    ]
  },
  {
    "id": 274,
    "nombre": "Pau Torres",
    "dificultad": "media",
    "pista": "'El Xiquet del Poble', central zurdo nacido en Vila-real que levantó la Europa League con el club de su vida antes de reencontrarse con Unai Emery en el Aston Villa.",
    "alias": ["pau torres"],
    "nacionalidad": "España",
    "clubes": [
      c("Villarreal CF", LOGOS.villarreal, "2017 - 2023"),
      c("Málaga CF", null, "2018 - 2019"),
      c("Aston Villa", null, "2023 - Presente")
    ]
  },
  {
    "id": 275,
    "nombre": "Dani Ceballos",
    "dificultad": "media",
    "pista": "Talentoso centrocampista utrerano elegido MVP del Europeo Sub-21 de 2017; dio el salto del Betis al Real Madrid con una cesión intermedia en el Arsenal.",
    "alias": ["ceballos"],
    "nacionalidad": "España",
    "clubes": [
      c("Real Betis", LOGOS.betis, "2014 - 2017"),
      c("Real Madrid", LOGOS.madrid, "2017 - Presente"),
      c("Arsenal FC", LOGOS.arsenal, "2019 - 2021")
    ]
  },
  {
    "id": 276,
    "nombre": "Brahim Díaz",
    "dificultad": "media",
    "pista": "Mediapunta malagueño ambidiestro que llevó el '10' del AC Milan durante tres años antes de volver al Real Madrid y decidir representar a Marruecos.",
    "alias": ["brahim", "brahim diaz"],
    "nacionalidad": "Marruecos",
    "clubes": [
      c("Manchester City", LOGOS.mancity, "2016 - 2019"),
      c("Real Madrid", LOGOS.madrid, "2019 - Presente"),
      c("AC Milan", LOGOS.milan, "2020 - 2023")
    ]
  },
  {
    "id": 277,
    "nombre": "Ansu Fati",
    "dificultad": "media",
    "pista": "Irrumpió con 16 años batiendo récords de precocidad goleadora en el Barça y en la Champions y heredó el dorsal 10 de Leo Messi.",
    "alias": ["ansu fati", "ansu"],
    "nacionalidad": "España",
    "clubes": [
      c("FC Barcelona", LOGOS.barca, "2019 - Presente"),
      c("Brighton & Hove Albion", null, "2023 - 2024")
    ]
  },
  {
    "id": 278,
    "nombre": "Bastian Schweinsteiger",
    "dificultad": "media",
    "pista": "Leyenda del mediocampo del Bayern Múnich y héroe ensangrentado de Alemania en la final del Mundial de Brasil 2014 en Maracaná.",
    "alias": ["schweinsteiger"],
    "nacionalidad": "Alemania",
    "clubes": [
      c("Bayern Múnich", LOGOS.bayern, "2002 - 2015"),
      c("Manchester United", LOGOS.manutd, "2015 - 2017"),
      c("Chicago Fire", null, "2017 - 2019")
    ]
  },
  {
    "id": 279,
    "nombre": "Philipp Lahm",
    "dificultad": "media",
    "pista": "Capitán de Alemania en el Mundial 2014 y del Bayern Múnich; se retiró sin haber recibido ni una sola tarjeta roja en toda su carrera profesional.",
    "alias": ["lahm"],
    "nacionalidad": "Alemania",
    "clubes": [
      c("Bayern Múnich", LOGOS.bayern, "2002 - 2017"),
      c("VfB Stuttgart", null, "2003 - 2005")
    ]
  },
  {
    "id": 280,
    "nombre": "Miroslav Klose",
    "dificultad": "media",
    "pista": "Máximo goleador histórico de las Copas del Mundo con 16 tantos, famoso por celebrar sus goles dando un salto mortal hacia adelante.",
    "alias": ["klose"],
    "nacionalidad": "Alemania",
    "clubes": [
      c("FC Kaiserslautern", null, "1999 - 2004"),
      c("Werder Bremen", null, "2004 - 2007"),
      c("Bayern Múnich", LOGOS.bayern, "2007 - 2011"),
      c("Lazio", null, "2011 - 2016")
    ]
  },
  {
    "id": 281,
    "nombre": "Michael Ballack",
    "dificultad": "media",
    "pista": "'El Káiser' alemán de los años 2000; vivió la maldición de 2002 perdiendo las finales de Champions, Mundial, Copa y la Bundesliga con el Leverkusen.",
    "alias": ["ballack"],
    "nacionalidad": "Alemania",
    "clubes": [
      c("FC Kaiserslautern", null, "1997 - 1999"),
      c("Bayer Leverkusen", null, "1999 - 2002"),
      c("Bayern Múnich", LOGOS.bayern, "2002 - 2006"),
      c("Chelsea FC", LOGOS.chelsea, "2006 - 2010"),
      c("Bayer Leverkusen", null, "2010 - 2012")
    ]
  },
  {
    "id": 282,
    "nombre": "Oliver Kahn",
    "dificultad": "media",
    "pista": "'El Titán', intimidante guardameta alemán del Bayern Múnich y único portero en la historia en ganar el Balón de Oro de un Mundial (2002).",
    "alias": ["kahn", "oliver kahn"],
    "nacionalidad": "Alemania",
    "clubes": [
      c("Karlsruher SC", null, "1987 - 1994"),
      c("Bayern Múnich", LOGOS.bayern, "1994 - 2008")
    ]
  },
  {
    "id": 283,
    "nombre": "Petr Čech",
    "dificultad": "media",
    "pista": "Legendario guardameta checo de la Premier League inconfundible por jugar con un casco protector de rugby desde 2006.",
    "alias": ["cech", "petr cech"],
    "nacionalidad": "República Checa",
    "clubes": [
      c("Sparta Praga", null, "2001 - 2002"),
      c("Stade Rennais", null, "2002 - 2004"),
      c("Chelsea FC", LOGOS.chelsea, "2004 - 2015"),
      c("Arsenal FC", LOGOS.arsenal, "2015 - 2019")
    ]
  },
  {
    "id": 284,
    "nombre": "John Terry",
    "dificultad": "media",
    "pista": "Eterno capitán y defensa central del Chelsea; resbaló en el penalti decisivo de Moscú 2008 pero levantó 5 títulos de Premier League en Stamford Bridge.",
    "alias": ["terry", "john terry"],
    "nacionalidad": "Inglaterra",
    "clubes": [
      c("Chelsea FC", LOGOS.chelsea, "1998 - 2017"),
      c("Nottingham Forest", null, "2000"),
      c("Aston Villa", null, "2017 - 2018")
    ]
  },
  {
    "id": 285,
    "nombre": "Rio Ferdinand",
    "dificultad": "media",
    "pista": "Elegante defensa central inglés que formó junto a Nemanja Vidić una de las parejas de centrales más dominantes de la historia en el Manchester United.",
    "alias": ["ferdinand"],
    "nacionalidad": "Inglaterra",
    "clubes": [
      c("West Ham United", null, "1995 - 2000"),
      c("Leeds United", null, "2000 - 2002"),
      c("Manchester United", LOGOS.manutd, "2002 - 2014"),
      c("Queens Park Rangers", null, "2014 - 2015")
    ]
  },
  {
    "id": 286,
    "nombre": "Paul Scholes",
    "dificultad": "media",
    "pista": "'El Colorado', cerebro pelirrojo de la Clase del 92 del Manchester United elogiado por Xavi y Zidane como el mejor centrocampista de su generación.",
    "alias": ["scholes"],
    "nacionalidad": "Inglaterra",
    "clubes": [
      c("Manchester United", LOGOS.manutd, "1993 - 2013")
    ]
  },
  {
    "id": 287,
    "nombre": "Ryan Giggs",
    "dificultad": "media",
    "pista": "Extremo zurdo galés y jugador con más partidos (963) y más títulos de Premier League (13) en toda la historia del Manchester United.",
    "alias": ["giggs"],
    "nacionalidad": "Gales",
    "clubes": [
      c("Manchester United", LOGOS.manutd, "1990 - 2014")
    ]
  },
  {
    "id": 288,
    "nombre": "Michael Owen",
    "dificultad": "media",
    "pista": "'El Niño Maravilla' inglés que ganó el Balón de Oro en 2001 con solo 22 años en el Liverpool antes de fichar por el Real Madrid de los Galácticos.",
    "alias": ["owen", "michael owen"],
    "nacionalidad": "Inglaterra",
    "clubes": [
      c("Liverpool FC", LOGOS.liverpool, "1996 - 2004"),
      c("Real Madrid", LOGOS.madrid, "2004 - 2005"),
      c("Newcastle United", null, "2005 - 2009"),
      c("Manchester United", LOGOS.manutd, "2009 - 2012"),
      c("Stoke City", null, "2012 - 2013")
    ]
  },
  {
    "id": 289,
    "nombre": "Alan Shearer",
    "dificultad": "media",
    "pista": "Máximo goleador histórico de la Premier League con 260 goles; ganó el título con el Blackburn Rovers antes de ser leyenda eterna de su amado Newcastle.",
    "alias": ["shearer"],
    "nacionalidad": "Inglaterra",
    "clubes": [
      c("Southampton FC", null, "1988 - 1992"),
      c("Blackburn Rovers", null, "1992 - 1996"),
      c("Newcastle United", null, "1996 - 2006")
    ]
  },
  {
    "id": 290,
    "nombre": "Patrick Vieira",
    "dificultad": "media",
    "pista": "Imponente mediocentro francés y capitán del histórico Arsenal de 'Los Invencibles' que ganó la Premier League 2003-04 sin perder un solo partido.",
    "alias": ["vieira"],
    "nacionalidad": "Francia",
    "clubes": [
      c("AS Cannes", null, "1993 - 1995"),
      c("AC Milan", LOGOS.milan, "1995 - 1996"),
      c("Arsenal FC", LOGOS.arsenal, "1996 - 2005"),
      c("Juventus", LOGOS.juventus, "2005 - 2006"),
      c("Inter de Milán", LOGOS.inter, "2006 - 2010"),
      c("Manchester City", LOGOS.mancity, "2010 - 2011")
    ]
  },
  {
    "id": 291,
    "nombre": "Dennis Bergkamp",
    "dificultad": "media",
    "pista": "Apodado 'The Non-Flying Dutchman' por su pánico a volar en avión; autor de controles orientados de otro planeta en el Arsenal y ante Argentina en 1998.",
    "alias": ["bergkamp"],
    "nacionalidad": "Países Bajos",
    "clubes": [
      c("AFC Ajax", LOGOS.ajax, "1986 - 1993"),
      c("Inter de Milán", LOGOS.inter, "1993 - 1995"),
      c("Arsenal FC", LOGOS.arsenal, "1995 - 2006")
    ]
  },
  {
    "id": 292,
    "nombre": "Ruud van Nistelrooy",
    "dificultad": "media",
    "pista": "'Van Gol', letal cazagoles neerlandés que logró ser máximo artillero de las ligas de Países Bajos, Inglaterra (Man Utd) y España (Real Madrid).",
    "alias": ["van nistelrooy"],
    "nacionalidad": "Países Bajos",
    "clubes": [
      c("SC Heerenveen", null, "1997 - 1998"),
      c("PSV Eindhoven", null, "1998 - 2001"),
      c("Manchester United", LOGOS.manutd, "2001 - 2006"),
      c("Real Madrid", LOGOS.madrid, "2006 - 2010"),
      c("Hamburgo SV", null, "2010 - 2011"),
      c("Málaga CF", null, "2011 - 2012")
    ]
  },
  {
    "id": 293,
    "nombre": "Clarence Seedorf",
    "dificultad": "media",
    "pista": "Único futbolista en toda la historia en ganar la Champions League con tres clubes diferentes: Ajax, Real Madrid y AC Milan (dos veces).",
    "alias": ["seedorf"],
    "nacionalidad": "Países Bajos",
    "clubes": [
      c("AFC Ajax", LOGOS.ajax, "1992 - 1995"),
      c("Sampdoria", null, "1995 - 1996"),
      c("Real Madrid", LOGOS.madrid, "1996 - 1999"),
      c("Inter de Milán", LOGOS.inter, "2000 - 2002"),
      c("AC Milan", LOGOS.milan, "2002 - 2012"),
      c("Botafogo", null, "2012 - 2014")
    ]
  },
  {
    "id": 294,
    "nombre": "Patrick Kluivert",
    "dificultad": "media",
    "pista": "Marcó con 18 años el gol que dio la Champions de 1995 al Ajax y luego fue durante seis temporadas el '9' de referencia del FC Barcelona.",
    "alias": ["kluivert"],
    "nacionalidad": "Países Bajos",
    "clubes": [
      c("AFC Ajax", LOGOS.ajax, "1994 - 1997"),
      c("AC Milan", LOGOS.milan, "1997 - 1998"),
      c("FC Barcelona", LOGOS.barca, "1998 - 2004"),
      c("Newcastle United", null, "2004 - 2005"),
      c("Valencia CF", LOGOS.valencia, "2005 - 2006"),
      c("PSV Eindhoven", null, "2006 - 2007"),
      c("Lille OSC", null, "2007 - 2008")
    ]
  },
  {
    "id": 295,
    "nombre": "Edwin van der Sar",
    "dificultad": "media",
    "pista": "Larguirucho portero neerlandés que ganó la Champions en 1995 con el Ajax y 13 años después detuvo a Anelka el penalti que dio la Champions de 2008 al Man Utd.",
    "alias": ["van der sar"],
    "nacionalidad": "Países Bajos",
    "clubes": [
      c("AFC Ajax", LOGOS.ajax, "1990 - 1999"),
      c("Juventus", LOGOS.juventus, "1999 - 2001"),
      c("Fulham FC", null, "2001 - 2005"),
      c("Manchester United", LOGOS.manutd, "2005 - 2011")
    ]
  },
  {
    "id": 296,
    "nombre": "Andriy Shevchenko",
    "dificultad": "media",
    "pista": "Delantero ucraniano ganador del Balón de Oro en 2004 y héroe del AC Milan antes de su multimillonario fichaje por el Chelsea de Abramóvich.",
    "alias": ["shevchenko"],
    "nacionalidad": "Ucrania",
    "clubes": [
      c("Dinamo de Kiev", null, "1994 - 1999"),
      c("AC Milan", LOGOS.milan, "1999 - 2006"),
      c("Chelsea FC", LOGOS.chelsea, "2006 - 2009"),
      c("AC Milan", LOGOS.milan, "2008 - 2009"),
      c("Dinamo de Kiev", null, "2009 - 2012")
    ]
  },
  {
    "id": 297,
    "nombre": "Pavel Nedvěd",
    "dificultad": "media",
    "pista": "'La Furia Checa', centrocampista de melena rubia y disparo demoledor con ambas piernas que ganó el Balón de Oro en 2003 con la Juventus.",
    "alias": ["nedved"],
    "nacionalidad": "República Checa",
    "clubes": [
      c("Sparta Praga", null, "1992 - 1996"),
      c("Lazio", null, "1996 - 2001"),
      c("Juventus", LOGOS.juventus, "2001 - 2009")
    ]
  },
  {
    "id": 298,
    "nombre": "Fabio Cannavaro",
    "dificultad": "media",
    "pista": "'Il Bello', último defensa en ganar el Balón de Oro (2006) tras levantar como capitán la Copa del Mundo en Berlín con Italia y fichar por el Real Madrid.",
    "alias": ["cannavaro"],
    "nacionalidad": "Italia",
    "clubes": [
      c("SSC Napoli", LOGOS.napoli, "1992 - 1995"),
      c("Parma Calcio", null, "1995 - 2002"),
      c("Inter de Milán", LOGOS.inter, "2002 - 2004"),
      c("Juventus", LOGOS.juventus, "2004 - 2006"),
      c("Real Madrid", LOGOS.madrid, "2006 - 2009"),
      c("Juventus", LOGOS.juventus, "2009 - 2010")
    ]
  },
  {
    "id": 299,
    "nombre": "Alessandro Nesta",
    "dificultad": "media",
    "pista": "Defensa central romano de elegancia inigualable; fue capitán de la Lazio campeona de Liga antes de formar una zaga histórica con Maldini en el AC Milan.",
    "alias": ["nesta"],
    "nacionalidad": "Italia",
    "clubes": [
      c("Lazio", null, "1993 - 2002"),
      c("AC Milan", LOGOS.milan, "2002 - 2012"),
      c("Montreal Impact", null, "2012 - 2013")
    ]
  },
  {
    "id": 300,
    "nombre": "Filippo Inzaghi",
    "dificultad": "media",
    "pista": "'Pippo', el hombre que vivía en la línea del fuera de juego; anotó los dos goles del AC Milan en la final de la Champions 2007 ante el Liverpool.",
    "alias": ["inzaghi", "pippo inzaghi"],
    "nacionalidad": "Italia",
    "clubes": [
      c("Parma Calcio", null, "1995 - 1996"),
      c("Atalanta", null, "1996 - 1997"),
      c("Juventus", LOGOS.juventus, "1997 - 2001"),
      c("AC Milan", LOGOS.milan, "2001 - 2012")
    ]
  },
  {
    "id": 301,
    "nombre": "Gennaro Gattuso",
    "dificultad": "media",
    "pista": "'Ringhio', el perro de presa incansable que escoltaba a Andrea Pirlo en el centro del campo del AC Milan y de la Italia campeona del mundo en 2006.",
    "alias": ["gattuso"],
    "nacionalidad": "Italia",
    "clubes": [
      c("Perugia", null, "1995 - 1997"),
      c("Rangers FC", null, "1997 - 1998"),
      c("Salernitana", null, "1998 - 1999"),
      c("AC Milan", LOGOS.milan, "1999 - 2012"),
      c("FC Sion", null, "2012 - 2013")
    ]
  },
  {
    "id": 302,
    "nombre": "Javier Zanetti",
    "dificultad": "media",
    "pista": "'El Pupi', incombustible capitán argentino del Inter de Milán que levantó la Champions en el Bernabéu en 2010 y disputó 858 partidos como nerazzurro.",
    "alias": ["zanetti", "pupi zanetti"],
    "nacionalidad": "Argentina",
    "clubes": [
      c("Talleres RE", null, "1992 - 1993"),
      c("Banfield", null, "1993 - 1995"),
      c("Inter de Milán", LOGOS.inter, "1995 - 2014")
    ]
  },
  {
    "id": 303,
    "nombre": "Gabriel Batistuta",
    "dificultad": "media",
    "pista": "'Batigol', el legendario 9 de melena al viento que fue rey de Florencia durante nueve años antes de ganar el Scudetto con la Roma.",
    "alias": ["batistuta", "batigol"],
    "nacionalidad": "Argentina",
    "clubes": [
      c("Newell's Old Boys", null, "1988 - 1989"),
      c("River Plate", LOGOS.river, "1989 - 1990"),
      c("Boca Juniors", LOGOS.boca, "1990 - 1991"),
      c("Fiorentina", null, "1991 - 2000"),
      c("AS Roma", LOGOS.roma, "2000 - 2003"),
      c("Inter de Milán", LOGOS.inter, "2003"),
      c("Al Arabi", null, "2003 - 2005")
    ]
  },
  {
    "id": 304,
    "nombre": "Diego Forlán",
    "dificultad": "media",
    "pista": "'Cachavacha', delantero uruguayo que ganó dos Botas de Oro en España (Villarreal y Atlético) y fue elegido Balón de Oro del Mundial de Sudáfrica 2010.",
    "alias": ["forlan"],
    "nacionalidad": "Uruguay",
    "clubes": [
      c("Independiente", null, "1997 - 2002"),
      c("Manchester United", LOGOS.manutd, "2002 - 2004"),
      c("Villarreal CF", LOGOS.villarreal, "2004 - 2007"),
      c("Atlético de Madrid", LOGOS.atletico, "2007 - 2011"),
      c("Inter de Milán", LOGOS.inter, "2011 - 2012"),
      c("Internacional", null, "2012 - 2013"),
      c("Peñarol", null, "2015 - 2016")
    ]
  },
  {
    "id": 305,
    "nombre": "Javier Mascherano",
    "dificultad": "media",
    "pista": "'El Jefecito', pasó de ser el mediocentro defensivo del Liverpool a central titular del Barça de Guardiola, donde solo marcó un gol (de penalti) en 334 partidos.",
    "alias": ["mascherano", "el jefecito"],
    "nacionalidad": "Argentina",
    "clubes": [
      c("River Plate", LOGOS.river, "2003 - 2005"),
      c("Corinthians", null, "2005 - 2006"),
      c("West Ham United", null, "2006 - 2007"),
      c("Liverpool FC", LOGOS.liverpool, "2007 - 2010"),
      c("FC Barcelona", LOGOS.barca, "2010 - 2018"),
      c("Hebei China Fortune", null, "2018 - 2019"),
      c("Estudiantes de La Plata", null, "2020")
    ]
  },
  {
    "id": 306,
    "nombre": "Yaya Touré",
    "dificultad": "media",
    "pista": "Todocampista marfileño que ganó el Sextete jugando hasta de central en la final de Roma con el Barça antes de convertirse en leyenda absoluta del Manchester City.",
    "alias": ["yaya toure", "toure"],
    "nacionalidad": "Costa de Marfil",
    "clubes": [
      c("Beveren", null, "2001 - 2003"),
      c("Metalurh Donetsk", null, "2003 - 2005"),
      c("Olympiacos", null, "2005 - 2006"),
      c("AS Mónaco", LOGOS.monaco, "2006 - 2007"),
      c("FC Barcelona", LOGOS.barca, "2007 - 2010"),
      c("Manchester City", LOGOS.mancity, "2010 - 2018")
    ]
  },
  {
    "id": 307,
    "nombre": "Vincent Kompany",
    "dificultad": "media",
    "pista": "Histórico capitán belga del Manchester City con estatua fuera del Etihad Stadium, hoy entrenador del Bayern Múnich.",
    "alias": ["kompany"],
    "nacionalidad": "Bélgica",
    "clubes": [
      c("Anderlecht", null, "2003 - 2006"),
      c("Hamburgo SV", null, "2006 - 2008"),
      c("Manchester City", LOGOS.mancity, "2008 - 2019"),
      c("Anderlecht", null, "2019 - 2020")
    ]
  },
  {
    "id": 308,
    "nombre": "Christian Eriksen",
    "dificultad": "media",
    "pista": "Talentoso mediapunta danés que volvió a la élite en la Premier League con un desfibrilador implantado tras sufrir un paro cardíaco en la Eurocopa 2020.",
    "alias": ["eriksen"],
    "nacionalidad": "Dinamarca",
    "clubes": [
      c("AFC Ajax", LOGOS.ajax, "2010 - 2013"),
      c("Tottenham Hotspur", LOGOS.tottenham, "2013 - 2020"),
      c("Inter de Milán", LOGOS.inter, "2020 - 2021"),
      c("Brentford FC", null, "2022"),
      c("Manchester United", LOGOS.manutd, "2022 - 2025")
    ]
  },
  {
    "id": 309,
    "nombre": "Philippe Coutinho",
    "dificultad": "media",
    "pista": "'El Pequeño Mago', protagonizó el fichaje más caro de la historia del FC Barcelona tras maravillar en el Liverpool, y luego le marcó un doblete al Barça estando cedido en el Bayern.",
    "alias": ["coutinho"],
    "nacionalidad": "Brasil",
    "clubes": [
      c("Vasco da Gama", null, "2009 - 2010"),
      c("Inter de Milán", LOGOS.inter, "2010 - 2013"),
      c("RCD Espanyol", LOGOS.espanyol, "2012"),
      c("Liverpool FC", LOGOS.liverpool, "2013 - 2018"),
      c("FC Barcelona", LOGOS.barca, "2018 - 2022"),
      c("Bayern Múnich", LOGOS.bayern, "2019 - 2020"),
      c("Aston Villa", null, "2022 - 2024"),
      c("Vasco da Gama", null, "2024 - Presente")
    ]
  },
  {
    "id": 310,
    "nombre": "Raphaël Varane",
    "dificultad": "media",
    "pista": "Elegante central francés que en 2018 conquistó la Champions League con el Real Madrid y el Mundial con Francia con apenas 25 años.",
    "alias": ["varane"],
    "nacionalidad": "Francia",
    "clubes": [
      c("RC Lens", null, "2010 - 2011"),
      c("Real Madrid", LOGOS.madrid, "2011 - 2021"),
      c("Manchester United", LOGOS.manutd, "2021 - 2024"),
      c("Como 1907", null, "2024")
    ]
  },
  {
    "id": 311,
    "nombre": "Kingsley Coman",
    "dificultad": "media",
    "pista": "Extremo francés que ganó ligas consecutivas desde su debut en PSG, Juventus y Bayern, y marcó de cabeza el gol que dio al Bayern la Champions de 2020 ante su exequipo.",
    "alias": ["coman"],
    "nacionalidad": "Francia",
    "clubes": [
      c("Paris Saint-Germain", LOGOS.psg, "2013 - 2014"),
      c("Juventus", LOGOS.juventus, "2014 - 2015"),
      c("Bayern Múnich", LOGOS.bayern, "2015 - Presente")
    ]
  },
  {
    "id": 312,
    "nombre": "Leroy Sané",
    "dificultad": "media",
    "pista": "Veloz extremo zurdo alemán que deslumbró al Bernabéu con el Schalke, brilló con Guardiola en el Manchester City y regresó a Alemania para jugar en el Bayern.",
    "alias": ["sane", "leroy sane"],
    "nacionalidad": "Alemania",
    "clubes": [
      c("Schalke 04", null, "2014 - 2016"),
      c("Manchester City", LOGOS.mancity, "2016 - 2020"),
      c("Bayern Múnich", LOGOS.bayern, "2020 - 2025"),
      c("Galatasaray", null, "2025 - Presente")
    ]
  },
  {
    "id": 313,
    "nombre": "Serge Gnabry",
    "dificultad": "media",
    "pista": "Atacante alemán famoso por su celebración 'removiendo la cazuela'; no cuajó de joven en Inglaterra pero volvió a Londres con el Bayern para endosarle 4 goles al Tottenham.",
    "alias": ["gnabry"],
    "nacionalidad": "Alemania",
    "clubes": [
      c("Arsenal FC", LOGOS.arsenal, "2012 - 2016"),
      c("West Bromwich Albion", null, "2015 - 2016"),
      c("Werder Bremen", null, "2016 - 2017"),
      c("TSG Hoffenheim", null, "2017 - 2018"),
      c("Bayern Múnich", LOGOS.bayern, "2018 - Presente")
    ]
  },
  {
    "id": 314,
    "nombre": "Kai Havertz",
    "dificultad": "media",
    "pista": "Mediapunta y falso 9 alemán que marcó el gol de la victoria del Chelsea ante el Manchester City en la final de la Champions 2021 antes de cambiar al Arsenal.",
    "alias": ["havertz"],
    "nacionalidad": "Alemania",
    "clubes": [
      c("Bayer Leverkusen", null, "2016 - 2020"),
      c("Chelsea FC", LOGOS.chelsea, "2020 - 2023"),
      c("Arsenal FC", LOGOS.arsenal, "2023 - Presente")
    ]
  },
  {
    "id": 315,
    "nombre": "Matthijs de Ligt",
    "dificultad": "media",
    "pista": "Fue el capitán más joven de la historia del Ajax llevando al club a semifinales de Champions en 2019 con 19 años antes de jugar en Juventus, Bayern y Man Utd.",
    "alias": ["de ligt"],
    "nacionalidad": "Países Bajos",
    "clubes": [
      c("AFC Ajax", LOGOS.ajax, "2016 - 2019"),
      c("Juventus", LOGOS.juventus, "2019 - 2022"),
      c("Bayern Múnich", LOGOS.bayern, "2022 - 2024"),
      c("Manchester United", LOGOS.manutd, "2024 - Presente")
    ]
  },
  {
    "id": 316,
    "nombre": "Marquinhos",
    "dificultad": "media",
    "pista": "Defensa central brasileño que tras un breve pero brillante paso por la Roma con 18 años se convirtió en el gran capitán y jugador con más partidos de la historia del PSG.",
    "alias": ["marquinhos"],
    "nacionalidad": "Brasil",
    "clubes": [
      c("Corinthians", null, "2011 - 2012"),
      c("AS Roma", LOGOS.roma, "2012 - 2013"),
      c("Paris Saint-Germain", LOGOS.psg, "2013 - Presente")
    ]
  },
  {
    "id": 317,
    "nombre": "Marco Verratti",
    "dificultad": "media",
    "pista": "'El Pequeño Búho', talentoso organizador italiano que pasó directamente de la Serie B con el Pescara a dominar la medular del PSG durante 11 temporadas sin debutar jamás en la Serie A.",
    "alias": ["verratti"],
    "nacionalidad": "Italia",
    "clubes": [
      c("Pescara", null, "2008 - 2012"),
      c("Paris Saint-Germain", LOGOS.psg, "2012 - 2023"),
      c("Al Arabi", null, "2023 - Presente")
    ]
  },
  {
    "id": 318,
    "nombre": "Jorginho",
    "dificultad": "media",
    "pista": "Mediocentro ítalo-brasileño famoso por su saltito antes de lanzar los penaltis; en 2021 ganó la Champions con el Chelsea y la Eurocopa con Italia siendo tercero en el Balón de Oro.",
    "alias": ["jorginho"],
    "nacionalidad": "Italia",
    "clubes": [
      c("Hellas Verona", null, "2010 - 2014"),
      c("SSC Napoli", LOGOS.napoli, "2014 - 2018"),
      c("Chelsea FC", LOGOS.chelsea, "2018 - 2023"),
      c("Arsenal FC", LOGOS.arsenal, "2023 - 2025"),
      c("Flamengo", null, "2025 - Presente")
    ]
  },
  {
    "id": 319,
    "nombre": "Federico Chiesa",
    "dificultad": "media",
    "pista": "Explosivo extremo italiano hijo de otro gran goleador de los 90; fue la gran estrella ofensiva de Italia en la Eurocopa 2020 antes de pasar por Juventus y Liverpool.",
    "alias": ["chiesa"],
    "nacionalidad": "Italia",
    "clubes": [
      c("Fiorentina", null, "2016 - 2020"),
      c("Juventus", LOGOS.juventus, "2020 - 2024"),
      c("Liverpool FC", LOGOS.liverpool, "2024 - Presente")
    ]
  },
  {
    "id": 320,
    "nombre": "Sandro Tonali",
    "dificultad": "media",
    "pista": "Centrocampista italiano comparado en sus inicios en el Brescia con Pirlo por su físico y estilo; ganó el Scudetto con el Milan antes de fichar por el Newcastle.",
    "alias": ["tonali"],
    "nacionalidad": "Italia",
    "clubes": [
      c("Brescia", null, "2017 - 2020"),
      c("AC Milan", LOGOS.milan, "2020 - 2023"),
      c("Newcastle United", null, "2023 - Presente")
    ]
  },
  {
    "id": 321,
    "nombre": "Alessandro Bastoni",
    "dificultad": "media",
    "pista": "Central zurdo italiano de exquisita salida de balón y centros precisos desde tres cuartos de campo en la defensa de tres del Inter de Milán.",
    "alias": ["bastoni"],
    "nacionalidad": "Italia",
    "clubes": [
      c("Atalanta", null, "2016 - 2017"),
      c("Parma Calcio", null, "2018 - 2019"),
      c("Inter de Milán", LOGOS.inter, "2019 - Presente")
    ]
  },
  {
    "id": 322,
    "nombre": "Hakan Çalhanoğlu",
    "dificultad": "media",
    "pista": "Especialista turco en golpeos a balón parado que protagonizó un polémico cambio directo del AC Milan al eterno rival, el Inter de Milán, donde se reconvirtió en pivote.",
    "alias": ["calhanoglu"],
    "nacionalidad": "Turquía",
    "clubes": [
      c("Karlsruher SC", null, "2011 - 2013"),
      c("Hamburgo SV", null, "2013 - 2014"),
      c("Bayer Leverkusen", null, "2014 - 2017"),
      c("AC Milan", LOGOS.milan, "2017 - 2021"),
      c("Inter de Milán", LOGOS.inter, "2021 - Presente")
    ]
  },
  {
    "id": 323,
    "nombre": "Henrikh Mkhitaryan",
    "dificultad": "media",
    "pista": "El mejor futbolista de la historia de Armenia; marcó un inolvidable gol de escorpión con el Manchester United y ha brillado en Alemania, Inglaterra e Italia.",
    "alias": ["mkhitaryan"],
    "nacionalidad": "Armenia",
    "clubes": [
      c("Shakhtar Donetsk", null, "2010 - 2013"),
      c("Borussia Dortmund", LOGOS.dortmund, "2013 - 2016"),
      c("Manchester United", LOGOS.manutd, "2016 - 2018"),
      c("Arsenal FC", LOGOS.arsenal, "2018 - 2019"),
      c("AS Roma", LOGOS.roma, "2019 - 2022"),
      c("Inter de Milán", LOGOS.inter, "2022 - Presente")
    ]
  },
  {
    "id": 324,
    "nombre": "Dušan Vlahović",
    "dificultad": "media",
    "pista": "Potente delantero centro zurdo serbio que explotó como goleador en la Fiorentina antes de fichar por la Juventus en mitad de temporada.",
    "alias": ["vlahovic"],
    "nacionalidad": "Serbia",
    "clubes": [
      c("Partizán de Belgrado", null, "2016 - 2018"),
      c("Fiorentina", null, "2018 - 2022"),
      c("Juventus", LOGOS.juventus, "2022 - Presente")
    ]
  },
  {
    "id": 325,
    "nombre": "Christian Pulisic",
    "dificultad": "media",
    "pista": "Apodado 'Capitán América', es la gran estrella de la selección de Estados Unidos tras formarse en el Dortmund, ganar la Champions en el Chelsea y brillar en el Milan.",
    "alias": ["pulisic"],
    "nacionalidad": "Estados Unidos",
    "clubes": [
      c("Borussia Dortmund", LOGOS.dortmund, "2016 - 2019"),
      c("Chelsea FC", LOGOS.chelsea, "2019 - 2023"),
      c("AC Milan", LOGOS.milan, "2023 - Presente")
    ]
  },
  {
    "id": 326,
    "nombre": "Mike Maignan",
    "dificultad": "media",
    "pista": "'Magic Mike', guardameta francés que arrebató la Ligue 1 al PSG con el Lille antes de relevar a Donnarumma en el AC Milan y a Lloris en la selección francesa.",
    "alias": ["maignan"],
    "nacionalidad": "Francia",
    "clubes": [
      c("Paris Saint-Germain", LOGOS.psg, "2013 - 2015"),
      c("Lille OSC", null, "2015 - 2021"),
      c("AC Milan", LOGOS.milan, "2021 - Presente")
    ]
  },
  {
    "id": 327,
    "nombre": "Yann Sommer",
    "dificultad": "media",
    "pista": "Guardameta suizo de grandes reflejos que detuvo el penalti a Mbappé en la Euro 2020 y batió récords de paradas ante el Bayern con el Gladbach antes de ganar el Scudetto con el Inter.",
    "alias": ["sommer"],
    "nacionalidad": "Suiza",
    "clubes": [
      c("FC Basilea", null, "2009 - 2014"),
      c("Borussia Mönchengladbach", null, "2014 - 2023"),
      c("Bayern Múnich", LOGOS.bayern, "2023"),
      c("Inter de Milán", LOGOS.inter, "2023 - Presente")
    ]
  },
  {
    "id": 328,
    "nombre": "Granit Xhaka",
    "dificultad": "media",
    "pista": "Centrocampista zurdo y capitán de Suiza que tras siete intensos años en el Arsenal lideró desde la medular al histórico Bayer Leverkusen campeón invicto.",
    "alias": ["xhaka"],
    "nacionalidad": "Suiza",
    "clubes": [
      c("FC Basilea", null, "2010 - 2012"),
      c("Borussia Mönchengladbach", null, "2012 - 2016"),
      c("Arsenal FC", LOGOS.arsenal, "2016 - 2023"),
      c("Bayer Leverkusen", null, "2023 - Presente")
    ]
  },
  {
    "id": 329,
    "nombre": "Xherdan Shaqiri",
    "dificultad": "media",
    "pista": "El 'Messi de los Alpes', bajito y musculoso zurdo suizo famoso por marcar golazos acrobáticos en casi todos los Mundiales y Eurocopas que disputó.",
    "alias": ["shaqiri"],
    "nacionalidad": "Suiza",
    "clubes": [
      c("FC Basilea", null, "2009 - 2012"),
      c("Bayern Múnich", LOGOS.bayern, "2012 - 2015"),
      c("Inter de Milán", LOGOS.inter, "2015"),
      c("Stoke City", null, "2015 - 2018"),
      c("Liverpool FC", LOGOS.liverpool, "2018 - 2021"),
      c("Olympique de Lyon", LOGOS.lyon, "2021 - 2022"),
      c("Chicago Fire", null, "2022 - 2024"),
      c("FC Basilea", null, "2024 - Presente")
    ]
  },
  {
    "id": 330,
    "nombre": "Ivan Perišić",
    "dificultad": "media",
    "pista": "Extremo y carrilero croata completamente ambidiestro que marcó en la final del Mundial 2018 y ganó el Triplete con el Bayern en 2020 antes de regresar al PSV.",
    "alias": ["perisic"],
    "nacionalidad": "Croacia",
    "clubes": [
      c("Club Brujas", null, "2009 - 2011"),
      c("Borussia Dortmund", LOGOS.dortmund, "2011 - 2013"),
      c("VfL Wolfsburg", null, "2013 - 2015"),
      c("Inter de Milán", LOGOS.inter, "2015 - 2022"),
      c("Bayern Múnich", LOGOS.bayern, "2019 - 2020"),
      c("Tottenham Hotspur", LOGOS.tottenham, "2022 - 2024"),
      c("Hajduk Split", null, "2024"),
      c("PSV Eindhoven", null, "2024 - Presente")
    ]
  },
  {
    "id": 331,
    "nombre": "Marcelo Brozović",
    "dificultad": "media",
    "pista": "'Epic Brozo', incansable mediocentro croata que popularizó tumbarse en el suelo detrás de la barrera como 'cocodrilo' para tapar tiros libres rasos.",
    "alias": ["brozovic"],
    "nacionalidad": "Croacia",
    "clubes": [
      c("Dinamo Zagreb", null, "2012 - 2015"),
      c("Inter de Milán", LOGOS.inter, "2015 - 2023"),
      c("Al Nassr", null, "2023 - Presente")
    ]
  },
  {
    "id": 332,
    "nombre": "Mateo Kovačić",
    "dificultad": "media",
    "pista": "Centrocampista croata de gran conducción en arrancada que ha ganado 4 Champions League repartidas entre el Real Madrid (3) y el Chelsea (1) antes de ir al City.",
    "alias": ["kovacic"],
    "nacionalidad": "Croacia",
    "clubes": [
      c("Dinamo Zagreb", null, "2010 - 2013"),
      c("Inter de Milán", LOGOS.inter, "2013 - 2015"),
      c("Real Madrid", LOGOS.madrid, "2015 - 2019"),
      c("Chelsea FC", LOGOS.chelsea, "2018 - 2023"),
      c("Manchester City", LOGOS.mancity, "2023 - Presente")
    ]
  },
  {
    "id": 333,
    "nombre": "Joško Gvardiol",
    "dificultad": "media",
    "pista": "Defensa croata que llamó la atención mundial jugando el Mundial de Qatar 2022 con una máscara negra antes de convertirse en el defensa más caro al fichar por el City.",
    "alias": ["gvardiol"],
    "nacionalidad": "Croacia",
    "clubes": [
      c("Dinamo Zagreb", null, "2019 - 2021"),
      c("RB Leipzig", null, "2021 - 2023"),
      c("Manchester City", LOGOS.mancity, "2023 - Presente")
    ]
  },
  {
    "id": 334,
    "nombre": "Mario Mandžukić",
    "dificultad": "media",
    "pista": "Guerrero croata del área que marcó en dos finales de Champions (con el Bayern en 2013 y de chilena con la Juve ante el Madrid en 2017) y en la final del Mundial 2018.",
    "alias": ["mandzukic"],
    "nacionalidad": "Croacia",
    "clubes": [
      c("Dinamo Zagreb", null, "2007 - 2010"),
      c("VfL Wolfsburg", null, "2010 - 2012"),
      c("Bayern Múnich", LOGOS.bayern, "2012 - 2014"),
      c("Atlético de Madrid", LOGOS.atletico, "2014 - 2015"),
      c("Juventus", LOGOS.juventus, "2015 - 2019"),
      c("Al Duhail", null, "2020"),
      c("AC Milan", LOGOS.milan, "2021")
    ]
  },
  {
    "id": 335,
    "nombre": "Davor Šuker",
    "dificultad": "media",
    "pista": "Zurdo de oro croata; brilló en el Sevilla, ganó la Séptima con el Real Madrid y fue Bota de Oro del Mundial de Francia 98.",
    "alias": ["suker", "davor suker"],
    "nacionalidad": "Croacia",
    "clubes": [
      c("Dinamo Zagreb", null, "1989 - 1991"),
      c("Sevilla FC", LOGOS.sevilla, "1991 - 1996"),
      c("Real Madrid", LOGOS.madrid, "1996 - 1999"),
      c("Arsenal FC", LOGOS.arsenal, "1999 - 2000"),
      c("West Ham United", null, "2000 - 2001"),
      c("1860 Múnich", null, "2001 - 2003")
    ]
  },
  {
    "id": 336,
    "nombre": "Predrag Mijatović",
    "dificultad": "alta",
    "pista": "'El Gomino', héroe montenegrino de la Séptima Copa de Europa del Real Madrid con su histórico gol a Peruzzi ante la Juventus en Ámsterdam 1998.",
    "alias": ["mijatovic", "pedja mijatovic"],
    "nacionalidad": "Montenegro",
    "clubes": [
      c("Partizán de Belgrado", null, "1989 - 1993"),
      c("Valencia CF", LOGOS.valencia, "1993 - 1996"),
      c("Real Madrid", LOGOS.madrid, "1996 - 1999"),
      c("Fiorentina", null, "1999 - 2002"),
      c("Levante UD", null, "2002 - 2003")
    ]
  },
  {
    "id": 337,
    "nombre": "Fernando Redondo",
    "dificultad": "alta",
    "pista": "'El Príncipe', mediocentro zurdo argentino inmortalizado por su taconazo de espaldas a Berg en Old Trafford en el año 2000.",
    "alias": ["redondo", "fernando redondo"],
    "nacionalidad": "Argentina",
    "clubes": [
      c("Argentinos Juniors", null, "1985 - 1990"),
      c("CD Tenerife", null, "1990 - 1994"),
      c("Real Madrid", LOGOS.madrid, "1994 - 2000"),
      c("AC Milan", LOGOS.milan, "2000 - 2004")
    ]
  },
  {
    "id": 338,
    "nombre": "Fernando Hierro",
    "dificultad": "alta",
    "pista": "Defensa central y mediocentro malagueño que llegó a anotar 21 goles en una sola Liga y levantó tres Champions con el Real Madrid.",
    "alias": ["hierro", "fernando hierro"],
    "nacionalidad": "España",
    "clubes": [
      c("Real Valladolid", null, "1987 - 1989"),
      c("Real Madrid", LOGOS.madrid, "1989 - 2003"),
      c("Al Rayyan", null, "2003 - 2004"),
      c("Bolton Wanderers", null, "2004 - 2005")
    ]
  },
  {
    "id": 339,
    "nombre": "Míchel González",
    "dificultad": "alta",
    "pista": "Interior derecho de la legendaria 'Quinta del Buitre' famoso por sus precisos centros desde la banda derecha y su '¡Me lo merezco!' con España en Italia 90.",
    "alias": ["michel"],
    "nacionalidad": "España",
    "clubes": [
      c("Real Madrid", LOGOS.madrid, "1982 - 1996"),
      c("Atlético Celaya", null, "1996 - 1997")
    ]
  },
  {
    "id": 340,
    "nombre": "Emilio Butragueño",
    "dificultad": "alta",
    "pista": "'El Buitre', líder de la mítica generación de canteranos del Real Madrid de los 80 y autor de cuatro goles a Dinamarca en el Mundial de Querétaro 86.",
    "alias": ["butragueno", "el buitre"],
    "nacionalidad": "España",
    "clubes": [
      c("Real Madrid", LOGOS.madrid, "1984 - 1995"),
      c("Atlético Celaya", null, "1995 - 1998")
    ]
  },
  {
    "id": 341,
    "nombre": "Hugo Sánchez",
    "dificultad": "alta",
    "pista": "'Pentapichichi' mexicano que celebraba con una voltereta cada uno de sus remates al primer toque y chilenas como 'Señor Gol' ante el Logroñés.",
    "alias": ["hugo sanchez"],
    "nacionalidad": "México",
    "clubes": [
      c("Pumas UNAM", null, "1976 - 1981"),
      c("Atlético de Madrid", LOGOS.atletico, "1981 - 1985"),
      c("Real Madrid", LOGOS.madrid, "1985 - 1992"),
      c("Club América", null, "1992 - 1993"),
      c("Rayo Vallecano", null, "1993 - 1994")
    ]
  },
  {
    "id": 342,
    "nombre": "Iván Zamorano",
    "dificultad": "alta",
    "pista": "'Bam Bam', rematador chileno de salto prodigioso que ganó el Pichichi en el Real Madrid de Valdano y lució el icónico dorsal '1+8' en el Inter de Milán.",
    "alias": ["zamorano", "bam bam zamorano"],
    "nacionalidad": "Chile",
    "clubes": [
      c("Cobresal", null, "1985 - 1988"),
      c("FC St. Gallen", null, "1988 - 1990"),
      c("Sevilla FC", LOGOS.sevilla, "1990 - 1992"),
      c("Real Madrid", LOGOS.madrid, "1992 - 1996"),
      c("Inter de Milán", LOGOS.inter, "1996 - 2001"),
      c("Club América", null, "2001 - 2002"),
      c("Colo-Colo", null, "2003")
    ]
  },
  {
    "id": 343,
    "nombre": "Pep Guardiola",
    "dificultad": "alta",
    "pista": "El mítico dorsal '4' y extensión de Johan Cruyff en el césped del Dream Team del Barça antes de revolucionar los banquillos como entrenador.",
    "alias": ["guardiola", "pep guardiola"],
    "nacionalidad": "España",
    "clubes": [
      c("FC Barcelona", LOGOS.barca, "1990 - 2001"),
      c("Brescia", null, "2001 - 2002"),
      c("AS Roma", LOGOS.roma, "2002 - 2003"),
      c("Brescia", null, "2003"),
      c("Al Ahli", null, "2003 - 2005"),
      c("Dorados de Sinaloa", null, "2005 - 2006")
    ]
  },
  {
    "id": 344,
    "nombre": "Luis Enrique",
    "dificultad": "alta",
    "pista": "Todocampista asturiano de carácter indomable que tras cinco años en el Real Madrid fichó libre por el FC Barcelona, donde acabó siendo capitán e ídolo.",
    "alias": ["luis enrique", "lucho"],
    "nacionalidad": "España",
    "clubes": [
      c("Sporting de Gijón", null, "1989 - 1991"),
      c("Real Madrid", LOGOS.madrid, "1991 - 1996"),
      c("FC Barcelona", LOGOS.barca, "1996 - 2004")
    ]
  },
  {
    "id": 345,
    "nombre": "Ronald Koeman",
    "dificultad": "alta",
    "pista": "'Tintín', defensa con más goles en la historia del fútbol mundial y autor del misil de falta en Wembley que dio al Barça su primera Copa de Europa en 1992.",
    "alias": ["koeman"],
    "nacionalidad": "Países Bajos",
    "clubes": [
      c("FC Groningen", null, "1980 - 1983"),
      c("AFC Ajax", LOGOS.ajax, "1983 - 1986"),
      c("PSV Eindhoven", null, "1986 - 1989"),
      c("FC Barcelona", LOGOS.barca, "1989 - 1995"),
      c("Feyenoord", null, "1995 - 1997")
    ]
  },
  {
    "id": 346,
    "nombre": "Romário",
    "dificultad": "alta",
    "pista": "'O Baixinho', genio brasileño de los 30 goles prometidos en el Dream Team de Cruyff, autor de la 'cola de vaca' a Alkorta y campeón del mundo en USA 94.",
    "alias": ["romario"],
    "nacionalidad": "Brasil",
    "clubes": [
      c("Vasco da Gama", null, "1985 - 1988"),
      c("PSV Eindhoven", null, "1988 - 1993"),
      c("FC Barcelona", LOGOS.barca, "1993 - 1995"),
      c("Flamengo", null, "1995 - 1996"),
      c("Valencia CF", LOGOS.valencia, "1996 - 1997"),
      c("Vasco da Gama", null, "2000 - 2002")
    ]
  },
  {
    "id": 347,
    "nombre": "Bebeto",
    "dificultad": "alta",
    "pista": "Ídolo eterno del SuperDépor que dio al club su primer título (Copa del Rey 1995) e inmortalizó la celebración meciendo la cuna junto a Romário en el Mundial 94.",
    "alias": ["bebeto"],
    "nacionalidad": "Brasil",
    "clubes": [
      c("Flamengo", null, "1983 - 1989"),
      c("Vasco da Gama", null, "1989 - 1992"),
      c("Deportivo La Coruña", LOGOS.depor, "1992 - 1996"),
      c("Sevilla FC", LOGOS.sevilla, "1996 - 1997"),
      c("Botafogo", null, "1998 - 1999")
    ]
  },
  {
    "id": 348,
    "nombre": "Kiko Narváez",
    "dificultad": "alta",
    "pista": "Delantero jerezano que celebraba sus goles haciendo 'el arquero', pieza fundamental del histórico Doblete del Atlético de Madrid en 1996 y oro olímpico en Barcelona 92.",
    "alias": ["kiko", "kiko narvaez"],
    "nacionalidad": "España",
    "clubes": [
      c("Cádiz CF", null, "1991 - 1993"),
      c("Atlético de Madrid", LOGOS.atletico, "1993 - 2001"),
      c("CF Extremadura", null, "2002")
    ]
  },
  {
    "id": 349,
    "nombre": "Diego Simeone",
    "dificultad": "alta",
    "pista": "'El Cholo', aguerrido mediocentro argentino del Doblete rojiblanco del 96 que décadas después transformó la historia del Atlético desde el banquillo.",
    "alias": ["simeone", "cholo simeone"],
    "nacionalidad": "Argentina",
    "clubes": [
      c("Vélez Sarsfield", null, "1987 - 1990"),
      c("Pisa", null, "1990 - 1992"),
      c("Sevilla FC", LOGOS.sevilla, "1992 - 1994"),
      c("Atlético de Madrid", LOGOS.atletico, "1994 - 1997"),
      c("Inter de Milán", LOGOS.inter, "1997 - 1999"),
      c("Lazio", null, "1999 - 2003"),
      c("Atlético de Madrid", LOGOS.atletico, "2003 - 2005"),
      c("Racing Club", null, "2005 - 2006")
    ]
  },
  {
    "id": 350,
    "nombre": "Julen Guerrero",
    "dificultad": "alta",
    "pista": "'La Perla de Portugalete', primer gran fenómeno mediático del fútbol español en los 90 y 'One Club Man' del Athletic Club pese a las ofertas multimillonarias.",
    "alias": ["julen guerrero", "guerrero"],
    "nacionalidad": "España",
    "clubes": [
      c("Athletic Club", LOGOS.athletic, "1992 - 2006")
    ]
  },
  {
    "id": 351,
    "nombre": "Joseba Etxeberria",
    "dificultad": "alta",
    "pista": "'El Gallo', extremo derecho guipuzcoano que protagonizó un sonado traspaso de la Real Sociedad al Athletic Club y jugó su última temporada gratis para los leones.",
    "alias": ["etxeberria"],
    "nacionalidad": "España",
    "clubes": [
      c("Real Sociedad", LOGOS.sociedad, "1994 - 1995"),
      c("Athletic Club", LOGOS.athletic, "1995 - 2010")
    ]
  },
  {
    "id": 352,
    "nombre": "Alfonso Pérez",
    "dificultad": "alta",
    "pista": "Delantero getafense que jugaba siempre con botas blancas; dio a España la Euro 2000 en fase de grupos con su volea a Yugoslavia y da nombre al estadio del Getafe.",
    "alias": ["alfonso", "alfonso perez"],
    "nacionalidad": "España",
    "clubes": [
      c("Real Madrid", LOGOS.madrid, "1991 - 1995"),
      c("Real Betis", LOGOS.betis, "1995 - 2000"),
      c("FC Barcelona", LOGOS.barca, "2000 - 2002"),
      c("Olympique de Marsella", LOGOS.marseille, "2002"),
      c("Real Betis", LOGOS.betis, "2002 - 2005")
    ]
  },
  {
    "id": 353,
    "nombre": "Finidi George",
    "dificultad": "alta",
    "pista": "Extremo nigeriano campeón de Europa con el Ajax en 1995 que se convirtió en ídolo del Real Betis celebrando sus goles colocándose un sombrero cordobés.",
    "alias": ["finidi"],
    "nacionalidad": "Nigeria",
    "clubes": [
      c("AFC Ajax", LOGOS.ajax, "1993 - 1996"),
      c("Real Betis", LOGOS.betis, "1996 - 2000"),
      c("RCD Mallorca", null, "2000 - 2001"),
      c("Ipswich Town", null, "2001 - 2003"),
      c("RCD Mallorca", null, "2003 - 2004")
    ]
  },
  {
    "id": 354,
    "nombre": "Denilson",
    "dificultad": "alta",
    "pista": "Malabarista brasileño de las bicicletas que en 1998 se convirtió en el fichaje más caro de la historia del fútbol mundial cuando Lopera lo trajo al Real Betis.",
    "alias": ["denilson"],
    "nacionalidad": "Brasil",
    "clubes": [
      c("São Paulo FC", null, "1994 - 1998"),
      c("Real Betis", LOGOS.betis, "1998 - 2005"),
      c("Flamengo", null, "2000"),
      c("Girondins de Burdeos", null, "2005 - 2006"),
      c("Al Nassr", null, "2006 - 2007"),
      c("Palmeiras", null, "2008")
    ]
  },
  {
    "id": 355,
    "nombre": "Marcos Assunção",
    "dificultad": "alta",
    "pista": "Mediocentro brasileño del Real Betis a principios de los 2000 cuyas faltas desde 30 metros eran prácticamente medios penaltis y golpeaban una y otra vez en los palos.",
    "alias": ["assuncao"],
    "nacionalidad": "Brasil",
    "clubes": [
      c("Santos FC", null, "1996 - 1997"),
      c("Flamengo", null, "1998"),
      c("AS Roma", LOGOS.roma, "1999 - 2002"),
      c("Real Betis", LOGOS.betis, "2002 - 2007"),
      c("Palmeiras", null, "2010 - 2012")
    ]
  },
  {
    "id": 356,
    "nombre": "Frédéric Kanouté",
    "dificultad": "alta",
    "pista": "Elegante espigado delantero franco-maliense que marcó en todas las finales del Sevilla de Juande Ramos convirtiéndose en el mejor extranjero de la historia nervionense.",
    "alias": ["kanoute"],
    "nacionalidad": "Malí",
    "clubes": [
      c("Olympique de Lyon", LOGOS.lyon, "1997 - 2000"),
      c("West Ham United", null, "2000 - 2003"),
      c("Tottenham Hotspur", LOGOS.tottenham, "2003 - 2005"),
      c("Sevilla FC", LOGOS.sevilla, "2005 - 2012"),
      c("Beijing Guoan", null, "2012 - 2013")
    ]
  },
  {
    "id": 357,
    "nombre": "Luís Fabiano",
    "dificultad": "alta",
    "pista": "'O Fabuloso', delantero centro brasileño de Brasil en el Mundial 2010 que formó junto a Kanouté la delantera más letal del Sevilla FC bicampeón de la UEFA.",
    "alias": ["luis fabiano"],
    "nacionalidad": "Brasil",
    "clubes": [
      c("São Paulo FC", null, "2001 - 2004"),
      c("FC Porto", LOGOS.porto, "2004 - 2005"),
      c("Sevilla FC", LOGOS.sevilla, "2005 - 2011"),
      c("São Paulo FC", null, "2011 - 2015"),
      c("Vasco da Gama", null, "2017")
    ]
  },
  {
    "id": 358,
    "nombre": "Andrés Palop",
    "dificultad": "alta",
    "pista": "Guardameta valenciano que vivió a la sombra de Cañizares en Mestalla y se hizo inmortal en el Sevilla marcando un gol de cabeza en el descuento en Donetsk en la UEFA 2007.",
    "alias": ["palop", "andres palop"],
    "nacionalidad": "España",
    "clubes": [
      c("Villarreal CF", LOGOS.villarreal, "1997 - 1999"),
      c("Valencia CF", LOGOS.valencia, "1999 - 2005"),
      c("Sevilla FC", LOGOS.sevilla, "2005 - 2013"),
      c("Bayer Leverkusen", null, "2013 - 2014")
    ]
  },
  {
    "id": 359,
    "nombre": "Carlos Marchena",
    "dificultad": "alta",
    "pista": "Defensa central y mediocentro sevillano del Valencia campeón del Doblete y pareja de Puyol en la Euro 2008; ostentó el récord mundial de partidos seguidos sin perder con España.",
    "alias": ["marchena"],
    "nacionalidad": "España",
    "clubes": [
      c("Sevilla FC", LOGOS.sevilla, "1997 - 2000"),
      c("SL Benfica", LOGOS.benfica, "2000 - 2001"),
      c("Valencia CF", LOGOS.valencia, "2001 - 2010"),
      c("Villarreal CF", LOGOS.villarreal, "2010 - 2012"),
      c("Deportivo La Coruña", LOGOS.depor, "2012 - 2014")
    ]
  },
  {
    "id": 360,
    "nombre": "David Albelda",
    "dificultad": "alta",
    "pista": "Eterno capitán y mediocentro de contención del Valencia CF de Rafa Benítez que conquistó dos Ligas y una Copa de la UEFA.",
    "alias": ["albelda"],
    "nacionalidad": "España",
    "clubes": [
      c("Villarreal CF", LOGOS.villarreal, "1996 - 1997"),
      c("Valencia CF", LOGOS.valencia, "1997 - 1998"),
      c("Villarreal CF", LOGOS.villarreal, "1998 - 1999"),
      c("Valencia CF", LOGOS.valencia, "1999 - 2013")
    ]
  },
  {
    "id": 361,
    "nombre": "Rubén Baraja",
    "dificultad": "alta",
    "pista": "'El Pipo', centrocampista todoterreno vallisoletano que formó con Albelda el mejor doble pivote de la historia del Valencia CF y luego entrenó al club che.",
    "alias": ["baraja", "pipo baraja"],
    "nacionalidad": "España",
    "clubes": [
      c("Real Valladolid", null, "1993 - 1996"),
      c("Atlético de Madrid", LOGOS.atletico, "1996 - 2000"),
      c("Valencia CF", LOGOS.valencia, "2000 - 2010")
    ]
  },
  {
    "id": 362,
    "nombre": "Vicente Rodríguez",
    "dificultad": "alta",
    "pista": "'El Puñal de Benicalap', considerado en 2004 el mejor extremo izquierdo del mundo tras guiar al Valencia al Doblete de Liga y UEFA.",
    "alias": ["vicente", "vicente rodriguez"],
    "nacionalidad": "España",
    "clubes": [
      c("Levante UD", null, "1997 - 2000"),
      c("Valencia CF", LOGOS.valencia, "2000 - 2011"),
      c("Brighton & Hove Albion", null, "2011 - 2013")
    ]
  },
  {
    "id": 363,
    "nombre": "Mista",
    "dificultad": "alta",
    "pista": "Delantero murciano que fue el máximo goleador del Valencia campeón de Liga y UEFA en 2004 y dio la famosa rueda de prensa del 'robo en el Bernabéu'.",
    "alias": ["mista"],
    "nacionalidad": "España",
    "clubes": [
      c("CD Tenerife", null, "1999 - 2001"),
      c("Valencia CF", LOGOS.valencia, "2001 - 2006"),
      c("Atlético de Madrid", LOGOS.atletico, "2006 - 2008"),
      c("Deportivo La Coruña", LOGOS.depor, "2008 - 2010"),
      c("Toronto FC", null, "2010")
    ]
  },
  {
    "id": 364,
    "nombre": "Claudio López",
    "dificultad": "alta",
    "pista": "'El Piojo', velocísimo delantero zurdo argentino que era la bestia negra absoluta del FC Barcelona de Van Gaal al contragolpe con el Valencia.",
    "alias": ["piojo lopez", "claudio lopez"],
    "nacionalidad": "Argentina",
    "clubes": [
      c("Racing Club", null, "1992 - 1996"),
      c("Valencia CF", LOGOS.valencia, "1996 - 2000"),
      c("Lazio", null, "2000 - 2004"),
      c("Club América", null, "2004 - 2006"),
      c("Racing Club", null, "2007")
    ]
  },
  {
    "id": 365,
    "nombre": "Roberto Ayala",
    "dificultad": "alta",
    "pista": "'El Ratón', central argentino de solo 1,77m pero con un salto de cabeza prodigioso, elegido mejor defensa de Europa con el Valencia CF.",
    "alias": ["ayala", "raton ayala"],
    "nacionalidad": "Argentina",
    "clubes": [
      c("River Plate", LOGOS.river, "1994 - 1995"),
      c("SSC Napoli", LOGOS.napoli, "1995 - 1998"),
      c("AC Milan", LOGOS.milan, "1998 - 2000"),
      c("Valencia CF", LOGOS.valencia, "2000 - 2007"),
      c("Real Zaragoza", null, "2007 - 2010"),
      c("Racing Club", null, "2010")
    ]
  },
  {
    "id": 366,
    "nombre": "Raúl Tamudo",
    "dificultad": "alta",
    "pista": "Máximo goleador de la historia del RCD Espanyol; dio una Copa del Rey arrebatándole el balón de saque a Toni Jiménez y protagonizó el famoso 'Tamudazo' en el Camp Nou.",
    "alias": ["tamudo", "raul tamudo"],
    "nacionalidad": "España",
    "clubes": [
      c("RCD Espanyol", LOGOS.espanyol, "1996 - 2010"),
      c("Real Sociedad", LOGOS.sociedad, "2010 - 2011"),
      c("Rayo Vallecano", null, "2011 - 2012"),
      c("CE Sabadell", null, "2013 - 2015")
    ]
  },
  {
    "id": 367,
    "nombre": "Iván de la Peña",
    "dificultad": "alta",
    "pista": "'Lo Pelat' ('Pequeño Buda'), genial mediapunta cántabro de cabeza rapada y pases imposibles al hueco que deslumbró con Ronaldo en el Barça y fue leyenda del Espanyol.",
    "alias": ["de la pena", "ivan de la pena", "lo pelat"],
    "nacionalidad": "España",
    "clubes": [
      c("FC Barcelona", LOGOS.barca, "1995 - 1998"),
      c("Lazio", null, "1998 - 2002"),
      c("Olympique de Marsella", LOGOS.marseille, "1999 - 2000"),
      c("FC Barcelona", LOGOS.barca, "2000 - 2001"),
      c("RCD Espanyol", LOGOS.espanyol, "2002 - 2011")
    ]
  },
  {
    "id": 368,
    "nombre": "Xabi Prieto",
    "dificultad": "alta",
    "pista": "'One Club Man' y eterno capitán de la Real Sociedad; marcó un hat-trick en el Bernabéu y se mantuvo fiel a los txuri-urdin incluso en Segunda División.",
    "alias": ["xabi prieto"],
    "nacionalidad": "España",
    "clubes": [
      c("Real Sociedad", LOGOS.sociedad, "2003 - 2018")
    ]
  },
  {
    "id": 369,
    "nombre": "Darko Kovačević",
    "dificultad": "alta",
    "pista": "Poderoso delantero centro serbio que formó junto al turco Nihat una pareja de ataque letal que dejó a la Real Sociedad a dos puntos de ganar LaLiga en 2003.",
    "alias": ["kovacevic"],
    "nacionalidad": "Serbia",
    "clubes": [
      c("Estrella Roja", null, "1994 - 1996"),
      c("Real Sociedad", LOGOS.sociedad, "1996 - 1999"),
      c("Juventus", LOGOS.juventus, "1999 - 2001"),
      c("Lazio", null, "2001"),
      c("Real Sociedad", LOGOS.sociedad, "2002 - 2007"),
      c("Olympiacos", null, "2007 - 2009")
    ]
  },
  {
    "id": 370,
    "nombre": "Nihat Kahveci",
    "dificultad": "alta",
    "pista": "Eléctrico delantero turco de potente disparo que fue subcampeón de Liga con la Real Sociedad en 2003 y luego también con el Villarreal CF en 2008.",
    "alias": ["nihat"],
    "nacionalidad": "Turquía",
    "clubes": [
      c("Besiktas", null, "1997 - 2002"),
      c("Real Sociedad", LOGOS.sociedad, "2002 - 2006"),
      c("Villarreal CF", LOGOS.villarreal, "2006 - 2009"),
      c("Besiktas", null, "2009 - 2011")
    ]
  },
  {
    "id": 371,
    "nombre": "Valeri Karpin",
    "dificultad": "alta",
    "pista": "Carismático interior derecho ruso de melena rubia que dejó huella imborrable en la Real Sociedad y formó parte del EuroCelta junto a Mostovoi.",
    "alias": ["karpin"],
    "nacionalidad": "Rusia",
    "clubes": [
      c("Spartak de Moscú", null, "1990 - 1994"),
      c("Real Sociedad", LOGOS.sociedad, "1994 - 1996"),
      c("Valencia CF", LOGOS.valencia, "1996 - 1997"),
      c("Celta de Vigo", LOGOS.celta, "1997 - 2002"),
      c("Real Sociedad", LOGOS.sociedad, "2002 - 2005")
    ]
  },
  {
    "id": 372,
    "nombre": "Aleksandr Mostovói",
    "dificultad": "alta",
    "pista": "Apodado 'El Zar de Balaídos', mediapunta ruso de temperamento volcánico y calidad suprema que lideró al mejor Celta de Vigo de finales de los 90.",
    "alias": ["mostovoi", "el zar"],
    "nacionalidad": "Rusia",
    "clubes": [
      c("Spartak de Moscú", null, "1987 - 1991"),
      c("SL Benfica", LOGOS.benfica, "1992 - 1993"),
      c("RC Estrasburgo", null, "1994 - 1996"),
      c("Celta de Vigo", LOGOS.celta, "1996 - 2004"),
      c("Deportivo Alavés", null, "2005")
    ]
  },
  {
    "id": 373,
    "nombre": "Bruno Soriano",
    "dificultad": "alta",
    "pista": "El eterno capitán de Artana y jugador con más partidos en la historia del Villarreal CF, zurdo de guante de seda que nunca vistió otra camiseta.",
    "alias": ["bruno soriano"],
    "nacionalidad": "España",
    "clubes": [
      c("Villarreal CF", LOGOS.villarreal, "2006 - 2020")
    ]
  },
  {
    "id": 374,
    "nombre": "Gabi Fernández",
    "dificultad": "alta",
    "pista": "El gran capitán del Atlético de Madrid de Diego Simeone; levantó la Liga de 2014 en el Camp Nou tras haberse curtido antes en el Getafe y en el Real Zaragoza.",
    "alias": ["gabi", "gabi fernandez"],
    "nacionalidad": "España",
    "clubes": [
      c("Atlético de Madrid", LOGOS.atletico, "2004 - 2007"),
      c("Getafe CF", null, "2004 - 2005"),
      c("Real Zaragoza", null, "2007 - 2011"),
      c("Atlético de Madrid", LOGOS.atletico, "2011 - 2018"),
      c("Al Sadd SC", null, "2018 - 2020")
    ]
  },
  {
    "id": 375,
    "nombre": "Juanfran Torres",
    "dificultad": "alta",
    "pista": "Canterano del Real Madrid como extremo derecho que salvó a Osasuna y se reconvirtió en el Atlético de Simeone en uno de los mejores laterales derechos de Europa.",
    "alias": ["juanfran", "juanfran torres"],
    "nacionalidad": "España",
    "clubes": [
      c("Real Madrid", LOGOS.madrid, "2004 - 2005"),
      c("RCD Espanyol", LOGOS.espanyol, "2005 - 2006"),
      c("CA Osasuna", null, "2006 - 2011"),
      c("Atlético de Madrid", LOGOS.atletico, "2011 - 2019"),
      c("São Paulo FC", null, "2019 - 2021")
    ]
  },
  {
    "id": 376,
    "nombre": "Filipe Luís",
    "dificultad": "alta",
    "pista": "Lateral izquierdo brasileño cerebral formado en el Deportivo que hizo época en el Atlético de Simeone y luego ganó dos Libertadores como jugador y otra como técnico en el Flamengo.",
    "alias": ["filipe luis"],
    "nacionalidad": "Brasil",
    "clubes": [
      c("Figueirense", null, "2003 - 2004"),
      c("Deportivo La Coruña", LOGOS.depor, "2006 - 2010"),
      c("Atlético de Madrid", LOGOS.atletico, "2010 - 2014"),
      c("Chelsea FC", LOGOS.chelsea, "2014 - 2015"),
      c("Atlético de Madrid", LOGOS.atletico, "2015 - 2019"),
      c("Flamengo", null, "2019 - 2023")
    ]
  },
  {
    "id": 377,
    "nombre": "Miranda",
    "dificultad": "alta",
    "pista": "Defensa central brasileño que formó pareja inexpugnable con Godín y marcó de cabeza en la prórroga del Bernabéu el gol que dio la Copa del Rey de 2013 al Atlético.",
    "alias": ["miranda", "joao miranda"],
    "nacionalidad": "Brasil",
    "clubes": [
      c("Coritiba", null, "2004 - 2005"),
      c("FC Sochaux", null, "2005 - 2006"),
      c("São Paulo FC", null, "2006 - 2011"),
      c("Atlético de Madrid", LOGOS.atletico, "2011 - 2015"),
      c("Inter de Milán", LOGOS.inter, "2015 - 2019"),
      c("São Paulo FC", null, "2021 - 2022")
    ]
  },
  {
    "id": 378,
    "nombre": "Arda Turan",
    "dificultad": "alta",
    "pista": "El mago turco de la barba frondosa; lanzó su bota a un juez de línea en Copa del Rey siendo ídolo del Calderón antes de fichar por el FC Barcelona.",
    "alias": ["arda turan", "arda"],
    "nacionalidad": "Turquía",
    "clubes": [
      c("Galatasaray", null, "2005 - 2011"),
      c("Atlético de Madrid", LOGOS.atletico, "2011 - 2015"),
      c("FC Barcelona", LOGOS.barca, "2015 - 2020"),
      c("Istanbul Basaksehir", null, "2018 - 2020"),
      c("Galatasaray", null, "2020 - 2022")
    ]
  },
  {
    "id": 379,
    "nombre": "Diego Costa",
    "dificultad": "alta",
    "pista": "'La Bestia de Lagarto', delantero hispano-brasileño de choque constante con los centrales que llevó al Atlético a ganar la Liga 2014 y al Chelsea dos Premier Leagues.",
    "alias": ["diego costa"],
    "nacionalidad": "España",
    "clubes": [
      c("Celta de Vigo", LOGOS.celta, "2007 - 2008"),
      c("Real Valladolid", null, "2009 - 2010"),
      c("Atlético de Madrid", LOGOS.atletico, "2010 - 2014"),
      c("Rayo Vallecano", null, "2012"),
      c("Chelsea FC", LOGOS.chelsea, "2014 - 2017"),
      c("Atlético de Madrid", LOGOS.atletico, "2018 - 2020"),
      c("Atlético Mineiro", null, "2021"),
      c("Wolverhampton", null, "2022 - 2023"),
      c("Grêmio", null, "2024")
    ]
  },
  {
    "id": 380,
    "nombre": "David Luiz",
    "dificultad": "alta",
    "pista": "Central brasileño de inconfundible melena rizada estilo 'Actor Secundario Bob', campeón de la Champions con el Chelsea y de la Libertadores con el Flamengo.",
    "alias": ["david luiz"],
    "nacionalidad": "Brasil",
    "clubes": [
      c("SL Benfica", LOGOS.benfica, "2007 - 2011"),
      c("Chelsea FC", LOGOS.chelsea, "2011 - 2014"),
      c("Paris Saint-Germain", LOGOS.psg, "2014 - 2016"),
      c("Chelsea FC", LOGOS.chelsea, "2016 - 2019"),
      c("Arsenal FC", LOGOS.arsenal, "2019 - 2021"),
      c("Flamengo", null, "2021 - 2024"),
      c("Fortaleza", null, "2025 - Presente")
    ]
  },
  {
    "id": 381,
    "nombre": "Willian",
    "dificultad": "alta",
    "pista": "Extremo brasileño de pelo afro y gran golpeo de falta que brilló durante siete temporadas en el Chelsea además de jugar en Arsenal, Fulham y Olympiacos.",
    "alias": ["willian"],
    "nacionalidad": "Brasil",
    "clubes": [
      c("Corinthians", null, "2006 - 2007"),
      c("Shakhtar Donetsk", null, "2007 - 2013"),
      c("Chelsea FC", LOGOS.chelsea, "2013 - 2020"),
      c("Arsenal FC", LOGOS.arsenal, "2020 - 2021"),
      c("Corinthians", null, "2021 - 2022"),
      c("Fulham FC", null, "2022 - 2024"),
      c("Olympiacos", null, "2024"),
      c("Fulham FC", null, "2025 - Presente")
    ]
  },
  {
    "id": 382,
    "nombre": "Oscar",
    "dificultad": "alta",
    "pista": "Talentoso mediapunta brasileño del Chelsea que marcó el único gol de Brasil en el 1-7 ante Alemania y sorprendió al mundo yéndose en plenitud a China durante ocho años.",
    "alias": ["oscar"],
    "nacionalidad": "Brasil",
    "clubes": [
      c("São Paulo FC", null, "2008 - 2010"),
      c("Internacional", null, "2010 - 2012"),
      c("Chelsea FC", LOGOS.chelsea, "2012 - 2016"),
      c("Shanghai Port", null, "2017 - 2024"),
      c("São Paulo FC", null, "2025 - Presente")
    ]
  },
  {
    "id": 383,
    "nombre": "Ramires",
    "dificultad": "alta",
    "pista": "Todocampista brasileño de pulmones infinitos que silenció el Camp Nou con una vaselina antológica a Valdés en las semifinales de la Champions 2012.",
    "alias": ["ramires"],
    "nacionalidad": "Brasil",
    "clubes": [
      c("Cruzeiro", null, "2007 - 2009"),
      c("SL Benfica", LOGOS.benfica, "2009 - 2010"),
      c("Chelsea FC", LOGOS.chelsea, "2010 - 2016"),
      c("Jiangsu Suning", null, "2016 - 2019"),
      c("Palmeiras", null, "2019 - 2020")
    ]
  },
  {
    "id": 384,
    "nombre": "Fernandinho",
    "dificultad": "alta",
    "pista": "Pivote táctico brasileño que tras ocho años en Ucrania fue durante casi una década el ancla indispensable y capitán del Manchester City de Pellegrini y Guardiola.",
    "alias": ["fernandinho"],
    "nacionalidad": "Brasil",
    "clubes": [
      c("Athletico Paranaense", null, "2002 - 2005"),
      c("Shakhtar Donetsk", null, "2005 - 2013"),
      c("Manchester City", LOGOS.mancity, "2013 - 2022"),
      c("Athletico Paranaense", null, "2022 - 2024")
    ]
  },
  {
    "id": 385,
    "nombre": "Fabinho",
    "dificultad": "alta",
    "pista": "Debutó un partido con el Real Madrid de Mourinho como lateral derecho, se reconvirtió en mediocentro en el Mónaco campeón y ganó todo en el Liverpool de Klopp.",
    "alias": ["fabinho"],
    "nacionalidad": "Brasil",
    "clubes": [
      c("Real Madrid", LOGOS.madrid, "2012 - 2013"),
      c("AS Mónaco", LOGOS.monaco, "2013 - 2018"),
      c("Liverpool FC", LOGOS.liverpool, "2018 - 2023"),
      c("Al Ittihad", null, "2023 - Presente")
    ]
  },
  {
    "id": 386,
    "nombre": "Ezequiel Lavezzi",
    "dificultad": "alta",
    "pista": "'El Pocho', eléctrico atacante argentino que enamoró al estadio San Paolo de Nápoles junto a Cavani y Hamsik antes de ser uno de los primeros fichajes estrella del PSG catarí.",
    "alias": ["lavezzi", "pocho lavezzi"],
    "nacionalidad": "Argentina",
    "clubes": [
      c("Estudiantes (BA)", null, "2003 - 2004"),
      c("San Lorenzo", null, "2004 - 2007"),
      c("SSC Napoli", LOGOS.napoli, "2007 - 2012"),
      c("Paris Saint-Germain", LOGOS.psg, "2012 - 2016"),
      c("Hebei China Fortune", null, "2016 - 2019")
    ]
  },
  {
    "id": 387,
    "nombre": "Javier Pastore",
    "dificultad": "alta",
    "pista": "'El Flaco', elegante mediapunta cordobés que deslumbró en el Palermo con Dybala y se convirtió en 2011 en el primer gran fichaje estrella de la era catarí del PSG.",
    "alias": ["pastore", "flaco pastore"],
    "nacionalidad": "Argentina",
    "clubes": [
      c("Huracán", null, "2007 - 2009"),
      c("Palermo", null, "2009 - 2011"),
      c("Paris Saint-Germain", LOGOS.psg, "2011 - 2018"),
      c("AS Roma", LOGOS.roma, "2018 - 2021"),
      c("Elche CF", null, "2021 - 2022")
    ]
  },
  {
    "id": 388,
    "nombre": "Marek Hamšík",
    "dificultad": "alta",
    "pista": "Leyenda eslovaca inconfundible por su cresta punky que superó a Maradona como jugador con más partidos y más goles (hasta Mertens) en la historia del Nápoles.",
    "alias": ["hamsik"],
    "nacionalidad": "Eslovaquia",
    "clubes": [
      c("Brescia", null, "2004 - 2007"),
      c("SSC Napoli", LOGOS.napoli, "2007 - 2019"),
      c("Dalian Pro", null, "2019 - 2021"),
      c("Trabzonspor", null, "2021 - 2023")
    ]
  },
  {
    "id": 389,
    "nombre": "Dries Mertens",
    "dificultad": "alta",
    "pista": "Apodado cariñosamente 'Ciro' por los napolitanos; extremo belga reconvertido por Sarri en falso 9 que acabó siendo el máximo goleador histórico absoluto del Nápoles.",
    "alias": ["mertens"],
    "nacionalidad": "Bélgica",
    "clubes": [
      c("FC Utrecht", null, "2009 - 2011"),
      c("PSV Eindhoven", null, "2011 - 2013"),
      c("SSC Napoli", LOGOS.napoli, "2013 - 2022"),
      c("Galatasaray", null, "2022 - Presente")
    ]
  },
  {
    "id": 390,
    "nombre": "Lorenzo Insigne",
    "dificultad": "alta",
    "pista": "Bajito extremo napolitano de nacimiento y ex capitán del Nápoles famoso por su golpeo con rosca al palo largo ('Tiraggiro') y campeón de la Euro 2020 con Italia.",
    "alias": ["insigne"],
    "nacionalidad": "Italia",
    "clubes": [
      c("Pescara", null, "2011 - 2012"),
      c("SSC Napoli", LOGOS.napoli, "2012 - 2022"),
      c("Toronto FC", null, "2022 - Presente")
    ]
  },
  {
    "id": 391,
    "nombre": "Radja Nainggolan",
    "dificultad": "alta",
    "pista": "'Il Ninja', todocampista belga lleno de tatuajes, cresta teñida y entradas al límite que fue ídolo de la Roma antes de pasar por el Inter de Milán.",
    "alias": ["nainggolan"],
    "nacionalidad": "Bélgica",
    "clubes": [
      c("Piacenza", null, "2005 - 2010"),
      c("Cagliari", null, "2010 - 2014"),
      c("AS Roma", LOGOS.roma, "2014 - 2018"),
      c("Inter de Milán", LOGOS.inter, "2018 - 2021"),
      c("Cagliari", null, "2019 - 2021"),
      c("Royal Antwerp", null, "2021 - 2022")
    ]
  },
  {
    "id": 392,
    "nombre": "Miralem Pjanić",
    "dificultad": "alta",
    "pista": "'Il Piccolo Principe', organizador bosnio especialista en faltas que brilló en Lyon, Roma y Juventus antes de protagonizar un trueque contable con Arthur Melo rumbo al Barça.",
    "alias": ["pjanic"],
    "nacionalidad": "Bosnia y Herzegovina",
    "clubes": [
      c("FC Metz", null, "2007 - 2008"),
      c("Olympique de Lyon", LOGOS.lyon, "2008 - 2011"),
      c("AS Roma", LOGOS.roma, "2011 - 2016"),
      c("Juventus", LOGOS.juventus, "2016 - 2020"),
      c("FC Barcelona", LOGOS.barca, "2020 - 2022"),
      c("Besiktas", null, "2021 - 2022"),
      c("CSKA Moscú", null, "2024 - 2025")
    ]
  },
  {
    "id": 393,
    "nombre": "Memphis Depay",
    "dificultad": "alta",
    "pista": "Atacante neerlandés que celebra tapándose los oídos con una cinta en la frente; tras brillar en Lyon y pasar por Barça y Atlético, fichó por el Corinthians brasileño.",
    "alias": ["depay", "memphis", "memphis depay"],
    "nacionalidad": "Países Bajos",
    "clubes": [
      c("PSV Eindhoven", null, "2011 - 2015"),
      c("Manchester United", LOGOS.manutd, "2015 - 2017"),
      c("Olympique de Lyon", LOGOS.lyon, "2017 - 2021"),
      c("FC Barcelona", LOGOS.barca, "2021 - 2023"),
      c("Atlético de Madrid", LOGOS.atletico, "2023 - 2024"),
      c("Corinthians", null, "2024 - Presente")
    ]
  },
  {
    "id": 394,
    "nombre": "Alexandre Lacazette",
    "dificultad": "alta",
    "pista": "'El General', prolífico goleador francés criado en la academia del Olympique de Lyon que tras cinco temporadas en el Arsenal regresó a casa para seguir marcando.",
    "alias": ["lacazette"],
    "nacionalidad": "Francia",
    "clubes": [
      c("Olympique de Lyon", LOGOS.lyon, "2010 - 2017"),
      c("Arsenal FC", LOGOS.arsenal, "2017 - 2022"),
      c("Olympique de Lyon", LOGOS.lyon, "2022 - 2025")
    ]
  },
  {
    "id": 395,
    "nombre": "Nabil Fekir",
    "dificultad": "alta",
    "pista": "Mago zurdo franco-argelino campeón del mundo en 2018 que sorprendió al cambiar el brazalete del Lyon por el Real Betis, donde dio una Copa del Rey.",
    "alias": ["fekir", "nabil fekir"],
    "nacionalidad": "Francia",
    "clubes": [
      c("Olympique de Lyon", LOGOS.lyon, "2013 - 2019"),
      c("Real Betis", LOGOS.betis, "2019 - 2024"),
      c("Al Jazira", null, "2024 - Presente")
    ]
  },
  {
    "id": 396,
    "nombre": "Dimitri Payet",
    "dificultad": "alta",
    "pista": "Virtuoso francés de los tiros libres y las rabonas que maravilló a la Premier en el West Ham antes de volver a su amado Olympique de Marsella y terminar en Brasil.",
    "alias": ["payet"],
    "nacionalidad": "Francia",
    "clubes": [
      c("FC Nantes", null, "2005 - 2007"),
      c("Saint-Étienne", null, "2007 - 2011"),
      c("Lille OSC", null, "2011 - 2013"),
      c("Olympique de Marsella", LOGOS.marseille, "2013 - 2015"),
      c("West Ham United", null, "2015 - 2017"),
      c("Olympique de Marsella", LOGOS.marseille, "2017 - 2023"),
      c("Vasco da Gama", null, "2023 - 2025")
    ]
  },
  {
    "id": 397,
    "nombre": "Wissam Ben Yedder",
    "dificultad": "alta",
    "pista": "Delantero ratonero francés procedente del fútbol sala que eliminó al Manchester United en Old Trafford con un doblete con el Sevilla antes de ser pichichi en el Mónaco.",
    "alias": ["ben yedder"],
    "nacionalidad": "Francia",
    "clubes": [
      c("Toulouse FC", null, "2010 - 2016"),
      c("Sevilla FC", LOGOS.sevilla, "2016 - 2019"),
      c("AS Mónaco", LOGOS.monaco, "2019 - 2024")
    ]
  },
  {
    "id": 398,
    "nombre": "Viktor Gyökeres",
    "dificultad": "alta",
    "pista": "Tanque goleador sueco famoso por celebrar sus goles entrelazando los dedos sobre la boca como la máscara de 'Bane' tras romper todos los registros en el Sporting CP.",
    "alias": ["gyokeres"],
    "nacionalidad": "Suecia",
    "clubes": [
      c("Brighton & Hove Albion", null, "2018 - 2021"),
      c("Coventry City", null, "2021 - 2023"),
      c("Sporting CP", LOGOS.sporting, "2023 - 2025"),
      c("Arsenal FC", LOGOS.arsenal, "2025 - Presente")
    ]
  },
  {
    "id": 399,
    "nombre": "Alexander Isak",
    "dificultad": "alta",
    "pista": "Espigado y elegante delantero sueco que destrozó al Real Madrid en Copa en el Bernabéu con la Real Sociedad antes de convertirse en el fichaje récord del Newcastle.",
    "alias": ["isak", "alexander isak"],
    "nacionalidad": "Suecia",
    "clubes": [
      c("AIK Estocolmo", null, "2016"),
      c("Borussia Dortmund", LOGOS.dortmund, "2017 - 2019"),
      c("Willem II", null, "2019"),
      c("Real Sociedad", LOGOS.sociedad, "2019 - 2022"),
      c("Newcastle United", null, "2022 - Presente")
    ]
  },
  {
    "id": 400,
    "nombre": "Omar Marmoush",
    "dificultad": "alta",
    "pista": "'El Nuevo Príncipe Egipcio', atacante que tras salirse en la Bundesliga con el Eintracht Frankfurt fichó en invierno de 2025 por el Manchester City de Guardiola.",
    "alias": ["marmoush"],
    "nacionalidad": "Egipto",
    "clubes": [
      c("VfL Wolfsburg", null, "2020 - 2023"),
      c("VfB Stuttgart", null, "2021 - 2022"),
      c("Eintracht Frankfurt", null, "2023 - 2025"),
      c("Manchester City", LOGOS.mancity, "2025 - Presente")
    ]
  }
];