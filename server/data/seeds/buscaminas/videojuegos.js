export default Array.from({ length: 20 }, (_, idx) => {
  const plantillas = [
    {
      c: 'Videojuegos desarrollados por Nintendo',
      f: ['Super Mario Odyssey', 'The Legend of Zelda: Breath of the Wild', 'Super Smash Bros. Ultimate', 'Mario Kart 8'],
      m: ['Animal Crossing: New Horizons', 'Splatoon 3', 'Metroid Dread'],
      d: ['Pikmin 4', 'Fire Emblem: Three Houses', 'Xenoblade Chronicles'],
      t: ['Crash Bandicoot', 'Sonic the Hedgehog', 'Halo Infinite', 'God of War', 'The Last of Us']
    },
    {
      c: 'Personajes jugables en Super Smash Bros.',
      f: ['Mario', 'Link', 'Pikachu', 'Donkey Kong'],
      m: ['Kirby', 'Fox McCloud', 'Samus Aran'],
      d: ['Captain Falcon', 'Ness', 'Marth'],
      t: ['Master Chief', 'Kratos', 'Geralt de Rivia', 'Crash Bandicoot', 'Spyro']
    },
    {
      c: 'Videojuegos galardonados con el premio GOTY (The Game Awards)',
      f: ['The Witcher 3: Wild Hunt', 'The Legend of Zelda: Breath of the Wild', 'God of War (2018)', 'Elden Ring'],
      m: ['Sekiro: Shadows Die Twice', 'The Last of Us Parte II', 'Overwatch'],
      d: ['Baldur\'s Gate 3', 'Dragon Age: Inquisition', 'It Takes Two'],
      t: ['Red Dead Redemption 2', 'Horizon Zero Dawn', 'Cyberpunk 2077', 'Spider-Man PS4', 'Dark Souls 3']
    },
    {
      c: 'Armas icónicas de videojuegos',
      f: ['Espada Maestra (Zelda)', 'Espada Mortal / Buster Sword (FF VII)', 'Portal Gun (Portal)', 'Pico de diamante (Minecraft)'],
      m: ['Hidden Blade (Assassin\'s Creed)', 'Lanza granadas BFG 9000 (Doom)', 'Palanca / Crowbar (Half-Life)'],
      d: ['Espadas del Caos (God of War)', 'Keyblade (Kingdom Hearts)', 'Energy Sword (Halo)'],
      t: ['Varita de Saúco', 'Anillo Único', 'Mjolnir (Marvel)', 'Lightsaber', 'Excalibur (Arturo)']
    },
    {
      c: 'Juegos de la saga Grand Theft Auto (GTA)',
      f: ['GTA V', 'GTA: San Andreas', 'GTA: Vice City', 'GTA IV'],
      m: ['GTA III', 'GTA: Liberty City Stories', 'GTA: Vice City Stories'],
      d: ['GTA: Chinatown Wars', 'GTA: London 1969', 'GTA 2'],
      t: ['Saints Row', 'Mafia II', 'Sleeping Dogs', 'Watch Dogs', 'Red Dead Redemption']
    },
    {
      c: 'Consolas lanzadas al mercado por Sony PlayStation',
      f: ['PlayStation 1 (PSX)', 'PlayStation 2', 'PlayStation 4', 'PlayStation 5'],
      m: ['PlayStation 3', 'PlayStation Portable (PSP)', 'PlayStation Vita'],
      d: ['PS One (Slim)', 'PS4 Pro', 'PlayStation VR'],
      t: ['Xbox 360', 'Nintendo GameCube', 'Sega Dreamcast', 'Nintendo Switch', 'Atari 2600']
    },
    {
      c: 'Juegos de disparos competitivos (Esports FPS / TPS)',
      f: ['Counter-Strike 2', 'Valorant', 'Call of Duty: Warzone', 'Overwatch 2'],
      m: ['Rainbow Six Siege', 'Apex Legends', 'Team Fortress 2'],
      d: ['PUBG: Battlegrounds', 'Halo Infinite', 'CrossFire'],
      t: ['League of Legends', 'Dota 2', 'Clash Royale', 'Rocket League', 'FIFA']
    },
    {
      c: 'Personajes de la saga Pokémon pertenecientes a la 1ª Generación (Kanto)',
      f: ['Charizard', 'Pikachu', 'Mewtwo', 'Bulbasaur'],
      m: ['Snorlax', 'Gengar', 'Eevee'],
      d: ['Dragonite', 'Gyarados', 'Lapras'],
      t: ['Lucario', 'Greninja', 'Gardevoir', 'Rayquaza', 'Mudkip']
    },
    {
      c: 'Sagas creadas por Capcom',
      f: ['Resident Evil', 'Street Fighter', 'Monster Hunter', 'Mega Man'],
      m: ['Devil May Cry', 'Ace Attorney', 'Dead Rising'],
      d: ['Dragon\'s Dogma', 'Ghosts \'n Goblins', 'Okami'],
      t: ['Tekken', 'Final Fantasy', 'Mortal Kombat', 'Castlevania', 'Silent Hill']
    },
    {
      c: 'Consolas de sobremesa y portátiles fabricadas por Nintendo',
      f: ['Nintendo Switch', 'Game Boy', 'Nintendo 64', 'Super Nintendo (SNES)'],
      m: ['Nintendo DS', 'GameCube', 'Wii'],
      d: ['Game Boy Advance', 'Nintendo 3DS', 'Virtual Boy'],
      t: ['Sega Mega Drive', 'PSP', 'Xbox One', 'PlayStation 2', 'Neo Geo']
    },
    {
      c: 'Videojuegos de rol occidental (WRPG)',
      f: ['Skyrim', 'The Witcher 3', 'Baldur\'s Gate 3', 'Fallout: New Vegas'],
      m: ['Mass Effect 2', 'Dragon Age: Origins', 'Cyberpunk 2077'],
      d: ['Divinity: Original Sin 2', 'Starfield', 'Pillars of Eternity'],
      t: ['Final Fantasy VII', 'Persona 5', 'Dragon Quest XI', 'Kingdom Hearts', 'Dark Souls']
    },
    {
      c: 'Personajes icónicos de la saga Street Fighter',
      f: ['Ryu', 'Ken Masters', 'Chun-Li', 'Guile'],
      m: ['Blanka', 'Zangief', 'Dhalsim'],
      d: ['M. Bison', 'Cammy', 'Vega'],
      t: ['Sub-Zero', 'Scorpion', 'Jin Kazama', 'Kazuya Mishima', 'Heihachi']
    },
    {
      c: 'Videojuegos de supervivencia y crafteo',
      f: ['Minecraft', 'ARK: Survival Evolved', 'Rust', 'The Forest'],
      m: ['Subnautica', 'Valheim', 'Terraria'],
      d: ['Raft', 'Don\'t Starve', 'Green Hell'],
      t: ['Call of Duty', 'Super Mario Odyssey', 'God of War', 'Spider-Man', 'FIFA']
    },
    {
      c: 'Juegos de la saga Call of Duty',
      f: ['Call of Duty: Modern Warfare', 'Call of Duty: Black Ops', 'Call of Duty: Warzone', 'Call of Duty 4: Modern Warfare'],
      m: ['Call of Duty: World at War', 'Call of Duty: Ghosts', 'Call of Duty: Black Ops II'],
      d: ['Call of Duty: Advanced Warfare', 'Call of Duty: Infinite Warfare', 'Call of Duty 2'],
      t: ['Battlefield 1', 'Medal of Honor', 'Halo 3', 'Titanfall 2', 'Destiny 2']
    },
    {
      c: 'Videojuegos de lucha (Fighting Games)',
      f: ['Street Fighter 6', 'Mortal Kombat 1', 'Tekken 8', 'Super Smash Bros. Ultimate'],
      m: ['Guilty Gear Strive', 'Dragon Ball FighterZ', 'King of Fighters XV'],
      d: ['Soulcalibur VI', 'BlazBlue', 'Injustice 2'],
      t: ['Overwatch', 'League of Legends', 'Rocket League', 'Genshin Impact', 'Dark Souls']
    },
    {
      c: 'Personajes pertenecientes al universo de Super Mario',
      f: ['Mario', 'Luigi', 'Princesa Peach', 'Bowser'],
      m: ['Yoshi', 'Wario', 'Donkey Kong'],
      d: ['Toad', 'Waluigi', 'Rosalina / Estela'],
      t: ['Sonic', 'Crash Bandicoot', 'Rayman', 'Pac-Man', 'Mega Man']
    },
    {
      c: 'Videojuegos con más de 50 millones de copias vendidas en la historia',
      f: ['Minecraft', 'Grand Theft Auto V', 'Tetris', 'Wii Sports'],
      m: ['PUBG: Battlegrounds', 'Mario Kart 8 Deluxe', 'Red Dead Redemption 2'],
      d: ['Terraria', 'Super Mario Bros. (1985)', 'The Witcher 3: Wild Hunt'],
      t: ['God of War (2018)', 'The Last of Us', 'Cyberpunk 2077', 'Spider-Man PS4', 'Elden Ring']
    },
    {
      c: 'Juegos de la saga The Legend of Zelda',
      f: ['Breath of the Wild', 'Tears of the Kingdom', 'Ocarina of Time', 'Majora\'s Mask'],
      m: ['The Wind Waker', 'Twilight Princess', 'A Link to the Past'],
      d: ['Skyward Sword', 'Link\'s Awakening', 'Minish Cap'],
      t: ['Elden Ring', 'Dark Souls', 'Skyrim', 'Genshin Impact', 'Monster Hunter']
    },
    {
      c: 'Compañías editoras y distribuidoras de videojuegos',
      f: ['Electronic Arts (EA)', 'Ubisoft', 'Activision Blizzard', 'Square Enix'],
      m: ['Capcom', 'Bandai Namco', 'Konami'],
      d: ['Take-Two Interactive', 'Bethesda Softworks', 'Sega'],
      t: ['Netflix', 'Spotify', 'Amazon Studios', 'Warner Bros. Pictures', 'Pixar']
    },
    {
      c: 'Videojuegos del género Battle Royale',
      f: ['Fortnite', 'Call of Duty: Warzone', 'Apex Legends', 'PUBG: Battlegrounds'],
      m: ['Fall Guys', 'Free Fire', 'Realm Royale'],
      d: ['Naraka: Bladepoint', 'H1Z1', 'Super People'],
      t: ['Valorant', 'Counter-Strike 2', 'Overwatch 2', 'Rainbow Six Siege', 'Rocket League']
    }
  ];

  const p = plantillas[idx];
  return {
    id: `videojuegos_${idx + 1}`,
    consigna: p.c,
    correctos: { faciles: p.f, medios: p.m, dificiles: p.d },
    trampas: p.t
  };
});