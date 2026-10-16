// server/data/trayectorias.seed.js

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

const c = (nombre, logoUrl, periodo) => ({
  nombre,
  logo: logoUrl || `https://images.fotmob.com/image_resources/logo/teamlogo/${encodeURIComponent(nombre.toLowerCase().replace(/ /g, '_'))}.png`,
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
  }
];