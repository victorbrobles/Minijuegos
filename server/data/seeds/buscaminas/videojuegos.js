// server/data/seeds/buscaminas/videojuegos.js

const plantillas = [
  // 1 - 10: Franquicias Legendarias y GOTY
  {
    c: 'Videojuegos desarrollados por Nintendo EPD o sus estudios internos',
    f: ['Super Mario Odyssey', 'The Legend of Zelda: Breath of the Wild', 'Super Smash Bros. Ultimate', 'Mario Kart 8'],
    m: ['Animal Crossing: New Horizons', 'Splatoon 3', 'Luigi\'s Mansion 3'],
    d: ['Pikmin 4', 'Metroid Prime', 'F-Zero GX'],
    t: ['Crash Bandicoot', 'Sonic the Hedgehog', 'Halo Infinite', 'God of War', 'The Last of Us']
  },
  {
    c: 'Personajes jugables en el primer Super Smash Bros. de Nintendo 64 (Original 12)',
    f: ['Mario', 'Link', 'Pikachu', 'Donkey Kong'],
    m: ['Kirby', 'Fox McCloud', 'Samus Aran'],
    d: ['Captain Falcon', 'Ness', 'Yoshi'],
    t: ['Sonic', 'Marth', 'Bowser', 'Mewtwo', 'Princess Peach']
  },
  {
    c: 'Videojuegos galardonados con el premio GOTY (Juego del Año en The Game Awards)',
    f: ['The Witcher 3: Wild Hunt', 'The Legend of Zelda: Breath of the Wild', 'God of War (2018)', 'Elden Ring'],
    m: ['Sekiro: Shadows Die Twice', 'The Last of Us Parte II', 'Overwatch'],
    d: ['Baldur\'s Gate 3', 'Dragon Age: Inquisition', 'It Takes Two'],
    t: ['Red Dead Redemption 2', 'Horizon Zero Dawn', 'Cyberpunk 2077', 'Marvel\'s Spider-Man', 'Dark Souls 3']
  },
  {
    c: 'Armas u objetos míticos de la historia de los videojuegos',
    f: ['Espada Maestra (Zelda)', 'Espada Mortal / Buster Sword (FF VII)', 'Portal Gun (Portal)', 'Pico de diamante (Minecraft)'],
    m: ['Hidden Blade (Assassin\'s Creed)', 'BFG 9000 (Doom)', 'Palanca / Crowbar (Half-Life)'],
    d: ['Espadas del Caos (God of War)', 'Keyblade (Kingdom Hearts)', 'Espada de Energía (Halo)'],
    t: ['Varita de Saúco', 'Anillo Único', 'Martillo Mjolnir (Marvel)', 'Espada Láser / Lightsaber', 'Excalibur mítica']
  },
  {
    c: 'Entregas canónicas de la saga Grand Theft Auto (GTA)',
    f: ['GTA V', 'GTA: San Andreas', 'GTA: Vice City', 'GTA IV'],
    m: ['GTA III', 'GTA: Liberty City Stories', 'GTA: Vice City Stories'],
    d: ['GTA: Chinatown Wars', 'GTA: London 1969', 'GTA 2'],
    t: ['Saints Row', 'Mafia II', 'Sleeping Dogs', 'Watch Dogs', 'Red Dead Redemption']
  },
  {
    c: 'Consolas de videojuegos producidas por Sony PlayStation',
    f: ['PlayStation 1 (PSX)', 'PlayStation 2', 'PlayStation 4', 'PlayStation 5'],
    m: ['PlayStation 3', 'PlayStation Portable (PSP)', 'PlayStation Vita'],
    d: ['PS One (Slim)', 'PS4 Pro', 'PlayStation Portal'],
    t: ['Xbox 360', 'Nintendo GameCube', 'Sega Dreamcast', 'Nintendo Switch', 'Atari 2600']
  },
  {
    c: 'Juegos de disparos competitivos en primera o tercera persona (Esports)',
    f: ['Counter-Strike 2', 'Valorant', 'Call of Duty: Warzone', 'Overwatch 2'],
    m: ['Rainbow Six Siege', 'Apex Legends', 'Team Fortress 2'],
    d: ['PUBG: Battlegrounds', 'Halo Infinite', 'CrossFire'],
    t: ['League of Legends', 'Dota 2', 'Rocket League', 'FIFA / EA FC', 'Street Fighter 6']
  },
  {
    c: 'Especies de Pokémon pertenecientes a la Primera Generación (Kanto)',
    f: ['Charizard', 'Pikachu', 'Mewtwo', 'Bulbasaur'],
    m: ['Snorlax', 'Gengar', 'Eevee'],
    d: ['Dragonite', 'Gyarados', 'Lapras'],
    t: ['Lucario (Gen 4)', 'Greninja (Gen 6)', 'Gardevoir (Gen 3)', 'Rayquaza (Gen 3)', 'Mudkip (Gen 3)']
  },
  {
    c: 'Franquicias de videojuegos creadas por la compañía japonesa Capcom',
    f: ['Resident Evil', 'Street Fighter', 'Monster Hunter', 'Mega Man'],
    m: ['Devil May Cry', 'Ace Attorney (Phoenix Wright)', 'Dead Rising'],
    d: ['Dragon\'s Dogma', 'Ghosts \'n Goblins', 'Okami'],
    t: ['Tekken (Bandai Namco)', 'Final Fantasy (Square Enix)', 'Mortal Kombat (NetherRealm)', 'Castlevania (Konami)', 'Silent Hill (Konami)']
  },
  {
    c: 'Consolas de sobremesa y portátiles fabricadas por Nintendo',
    f: ['Nintendo Switch', 'Game Boy', 'Nintendo 64', 'Super Nintendo (SNES)'],
    m: ['Nintendo DS', 'Nintendo GameCube', 'Wii'],
    d: ['Game Boy Advance', 'Nintendo 3DS', 'Virtual Boy'],
    t: ['Sega Mega Drive', 'PlayStation Portable', 'Xbox One', 'PlayStation 2', 'Neo Geo']
  },

  // 11 - 20: RPGs, Lucha y Aventura
  {
    c: 'Videojuegos de rol occidental (WRPG)',
    f: ['The Elder Scrolls V: Skyrim', 'The Witcher 3: Wild Hunt', 'Baldur\'s Gate 3', 'Fallout: New Vegas'],
    m: ['Mass Effect 2', 'Dragon Age: Origins', 'Cyberpunk 2077'],
    d: ['Divinity: Original Sin 2', 'Starfield', 'Pillars of Eternity'],
    t: ['Final Fantasy VII', 'Persona 5', 'Dragon Quest XI', 'Kingdom Hearts', 'Chrono Trigger']
  },
  {
    c: 'Luchadores clásicos de la saga Street Fighter',
    f: ['Ryu', 'Ken Masters', 'Chun-Li', 'Guile'],
    m: ['Blanka', 'Zangief', 'Dhalsim'],
    d: ['M. Bison', 'Cammy White', 'Vega (Balrog Japón)'],
    t: ['Sub-Zero', 'Scorpion', 'Jin Kazama', 'Kazuya Mishima', 'Heihachi Mishima']
  },
  {
    c: 'Videojuegos centrados en mecánicas de supervivencia y crafteo',
    f: ['Minecraft', 'ARK: Survival Evolved', 'Rust', 'The Forest'],
    m: ['Subnautica', 'Valheim', 'Terraria'],
    d: ['Raft', 'Don\'t Starve', 'Green Hell'],
    t: ['Call of Duty: Warzone', 'Super Mario Odyssey', 'God of War', 'Spider-Man', 'Uncharted 4']
  },
  {
    c: 'Entregas oficiales de la saga bélica Call of Duty',
    f: ['Call of Duty: Modern Warfare', 'Call of Duty: Black Ops', 'Call of Duty: Warzone', 'Call of Duty 4: Modern Warfare'],
    m: ['Call of Duty: World at War', 'Call of Duty: Ghosts', 'Call of Duty: Black Ops II'],
    d: ['Call of Duty: Advanced Warfare', 'Call of Duty: Infinite Warfare', 'Call of Duty 2'],
    t: ['Battlefield 1', 'Medal of Honor: Allied Assault', 'Halo 3', 'Titanfall 2', 'Destiny 2']
  },
  {
    c: 'Sagas y franquicias del género de lucha (Fighting Games)',
    f: ['Street Fighter', 'Mortal Kombat', 'Tekken', 'Super Smash Bros.'],
    m: ['Guilty Gear', 'The King of Fighters', 'Dragon Ball FighterZ'],
    d: ['Soulcalibur', 'BlazBlue', 'Injustice'],
    t: ['Overwatch', 'League of Legends', 'Rocket League', 'Genshin Impact', 'Dark Souls']
  },
  {
    c: 'Personajes pertenecientes al universo de Super Mario',
    f: ['Mario', 'Luigi', 'Princesa Peach', 'Bowser'],
    m: ['Yoshi', 'Wario', 'Donkey Kong'],
    d: ['Toad', 'Waluigi', 'Rosalina (Estela)'],
    t: ['Sonic the Hedgehog', 'Crash Bandicoot', 'Rayman', 'Pac-Man', 'Mega Man']
  },
  {
    c: 'Videojuegos que superan 40 millones de copias vendidas en la historia',
    f: ['Minecraft', 'Grand Theft Auto V', 'Tetris', 'Wii Sports'],
    m: ['PUBG: Battlegrounds', 'Mario Kart 8 Deluxe', 'Red Dead Redemption 2'],
    d: ['Terraria', 'Super Mario Bros. (1985)', 'The Witcher 3: Wild Hunt'],
    t: ['God of War (2018)', 'The Last of Us', 'Cyberpunk 2077', 'Marvel\'s Spider-Man', 'Elden Ring']
  },
  {
    c: 'Juegos de la saga The Legend of Zelda',
    f: ['Breath of the Wild', 'Tears of the Kingdom', 'Ocarina of Time', 'Majora\'s Mask'],
    m: ['The Wind Waker', 'Twilight Princess', 'A Link to the Past'],
    d: ['Skyward Sword', 'Link\'s Awakening', 'The Minish Cap'],
    t: ['Elden Ring', 'Dark Souls', 'Skyrim', 'Genshin Impact', 'Monster Hunter: World']
  },
  {
    c: 'Compañías editoras y distribuidoras mundiales de videojuegos',
    f: ['Electronic Arts (EA)', 'Ubisoft', 'Activision Blizzard', 'Square Enix'],
    m: ['Capcom', 'Bandai Namco', 'Konami'],
    d: ['Take-Two Interactive', 'Bethesda Softworks', 'Sega'],
    t: ['Netflix', 'Spotify', 'Amazon Studios', 'Warner Bros. Pictures', 'Pixar']
  },
  {
    c: 'Videojuegos pioneros o masivos del género Battle Royale',
    f: ['Fortnite', 'Call of Duty: Warzone', 'Apex Legends', 'PUBG: Battlegrounds'],
    m: ['Fall Guys', 'Free Fire', 'Realm Royale'],
    d: ['Naraka: Bladepoint', 'H1Z1 (King of the Kill)', 'Cuisine Royale'],
    t: ['Valorant', 'Counter-Strike 2', 'Overwatch 2', 'Rainbow Six Siege', 'Rocket League']
  },

  // 21 - 30: PlayStation, Xbox y PC Gaming
  {
    c: 'Franquicias exclusivas o creadas por PlayStation Studios (Sony)',
    f: ['God of War', 'The Last of Us', 'Uncharted', 'Gran Turismo'],
    m: ['Horizon (Zero Dawn/Forbidden West)', 'Ghost of Tsushima', 'Ratchet & Clank'],
    d: ['Bloodborne', 'Killzone', 'inFamous'],
    t: ['Halo', 'Gears of War', 'Forza Horizon', 'Super Mario', 'Starfield']
  },
  {
    c: 'Franquicias icónicas pertenecientes a Xbox Game Studios (Microsoft)',
    f: ['Halo', 'Gears of War', 'Forza Horizon', 'Forza Motorsport'],
    m: ['Fable', 'Sea of Thieves', 'State of Decay'],
    d: ['Age of Empires', 'Perfect Dark', 'Killer Instinct'],
    t: ['God of War', 'Uncharted', 'The Last of Us', 'Gran Turismo', 'Bloodborne']
  },
  {
    c: 'Videojuegos desarrollados por el estudio Rockstar Games',
    f: ['Grand Theft Auto V', 'Red Dead Redemption 2', 'GTA: San Andreas', 'Bully (Canis Canem Edit)'],
    m: ['Max Payne 3', 'L.A. Noire', 'Red Dead Redemption (2010)'],
    d: ['Manhunt', 'The Warriors', 'Midnight Club: Los Angeles'],
    t: ['Mafia: Definitive Edition', 'Saints Row', 'Sleeping Dogs', 'Watch Dogs', 'Just Cause']
  },
  {
    c: 'Videojuegos creados por el estudio FromSoftware (género Soulsborne)',
    f: ['Dark Souls', 'Elden Ring', 'Bloodborne', 'Sekiro: Shadows Die Twice'],
    m: ['Dark Souls III', 'Demon\'s Souls', 'Dark Souls II'],
    d: ['Armored Core VI: Fires of Rubicon', 'King\'s Field', 'Otogi'],
    t: ['Nioh', 'Lies of P', 'Lords of the Fallen', 'Mortal Shell', 'The Surge']
  },
  {
    c: 'Videojuegos desarrollados por Valve Corporation',
    f: ['Half-Life', 'Portal', 'Counter-Strike', 'Left 4 Dead'],
    m: ['Team Fortress 2', 'Dota 2', 'Portal 2'],
    d: ['Half-Life: Alyx', 'Day of Defeat', 'Ricochet'],
    t: ['Overwatch', 'Valorant', 'Apex Legends', 'BioShock', 'Fallout']
  },
  {
    c: 'Personajes jugables o protagonistas de la saga Resident Evil',
    f: ['Leon S. Kennedy', 'Jill Valentine', 'Chris Redfield', 'Claire Redfield'],
    m: ['Ethan Winters', 'Ada Wong', 'Albert Wesker'],
    d: ['Rebecca Chambers', 'Barry Burton', 'Carlos Oliveira'],
    t: ['Silent Hill protagonista Harry Mason', 'James Sunderland', 'Isaac Clarke', 'Alan Wake', 'Joel Miller']
  },
  {
    c: 'Videojuegos de terror psicológico o Survival Horror',
    f: ['Resident Evil 2', 'Silent Hill 2', 'Dead Space', 'Outlast'],
    m: ['Amnesia: The Dark Descent', 'Alien: Isolation', 'The Evil Within'],
    d: ['Alan Wake 2', 'Fatal Frame (Project Zero)', 'SOMA'],
    t: ['Doom Eternal', 'Left 4 Dead 2', 'BioShock Infinite', 'Borderlands 3', 'Dying Light']
  },
  {
    c: 'Juegos de la saga principal de Final Fantasy',
    f: ['Final Fantasy VII', 'Final Fantasy X', 'Final Fantasy XV', 'Final Fantasy XVI'],
    m: ['Final Fantasy VI', 'Final Fantasy VIII', 'Final Fantasy IX'],
    d: ['Final Fantasy IV', 'Final Fantasy XII', 'Final Fantasy XIV (Online)'],
    t: ['Dragon Quest XI', 'Kingdom Hearts II', 'Chrono Trigger', 'Nier: Automata', 'Persona 5']
  },
  {
    c: 'Campeones y personajes del universo de League of Legends (LoL)',
    f: ['Jinx', 'Yasuo', 'Ahri', 'Teemo'],
    m: ['Darius', 'Zed', 'Lux'],
    d: ['Thresh', 'Lee Sin', 'Katarina'],
    t: ['Pudge', 'Invoker', 'Drow Ranger', 'Juggernaut', 'Windranger']
  },
  {
    c: 'Héroes jugables del videojuego Dota 2',
    f: ['Pudge', 'Invoker', 'Juggernaut', 'Phantom Assassin'],
    m: ['Sniper', 'Crystal Maiden', 'Axe'],
    d: ['Drow Ranger', 'Shadow Fiend', 'Anti-Mage'],
    t: ['Yasuo', 'Teemo', 'Jinx', 'Ahri', 'Master Yi']
  },

  // 31 - 40: Clásicos Arcade, Retro y Plataformas
  {
    c: 'Personajes arcade legendarios de las décadas de 1970 y 1980',
    f: ['Pac-Man', 'Mario (Jumpman)', 'Donkey Kong', 'Frogger'],
    m: ['Mega Man', 'Q*bert', 'Dig Dug'],
    d: ['Galaga (nave)', 'Space Invaders (alien)', 'Pitfall Harry'],
    t: ['Sonic the Hedgehog (1991)', 'Crash Bandicoot (1996)', 'Lara Croft (1996)', 'Spyro (1998)', 'Rayman (1995)']
  },
  {
    c: 'Videojuegos de plataformas 2D y 3D protagonizados por Sonic the Hedgehog',
    f: ['Sonic the Hedgehog (1991)', 'Sonic the Hedgehog 2', 'Sonic Mania', 'Sonic Frontiers'],
    m: ['Sonic Adventure', 'Sonic CD', 'Sonic Generations'],
    d: ['Sonic & Knuckles', 'Sonic Colors', 'Sonic Unleashed'],
    t: ['Super Mario 64', 'Crash Bandicoot', 'Rayman Legends', 'Donkey Kong Country', 'Spyro the Dragon']
  },
  {
    c: 'Personajes que han protagonizado la saga Crash Bandicoot',
    f: ['Crash Bandicoot', 'Dr. Neo Cortex', 'Coco Bandicoot', 'Aku Aku (máscara)'],
    m: ['Tiny Tiger', 'Dingodile', 'Uka Uka'],
    d: ['N. Gin', 'Dr. Nefarious Tropy', 'Ripper Roo'],
    t: ['Spyro', 'Sparx', 'Ripto', 'Gnasty Gnorc', 'Rayman']
  },
  {
    c: 'Videojuegos de la franquicia Assassin\'s Creed',
    f: ['Assassin\'s Creed II', 'Assassin\'s Creed IV: Black Flag', 'Assassin\'s Creed Valhalla', 'Assassin\'s Creed Origins'],
    m: ['Assassin\'s Creed Odyssey', 'Assassin\'s Creed Brotherhood', 'Assassin\'s Creed Mirage'],
    d: ['Assassin\'s Creed Unity', 'Assassin\'s Creed Syndicate', 'Assassin\'s Creed III'],
    t: ['Prince of Persia: Las Arenas del Tiempo', 'Ghost of Tsushima', 'The Witcher 3', 'Dishonored', 'Shadow of Mordor']
  },
  {
    c: 'Protagonistas asesinos de la saga Assassin\'s Creed',
    f: ['Ezio Auditore', 'Altaïr Ibn-La\'Ahad', 'Edward Kenway', 'Connor Kenway'],
    m: ['Bayek de Siwa', 'Kassandra', 'Eivor Varinsdottir'],
    d: ['Arno Dorian', 'Jacob Frye', 'Basim Ibn Ishaq'],
    t: ['Kratos', 'Geralt de Rivia', 'Arthur Morgan', 'Joel Miller', 'Nathan Drake']
  },
  {
    c: 'Videojuegos del género Metroidvania aclamados',
    f: ['Castlevania: Symphony of the Night', 'Super Metroid', 'Hollow Knight', 'Metroid Dread'],
    m: ['Ori and the Blind Forest', 'Blasphemous', 'Bloodstained: Ritual of the Night'],
    d: ['Axiom Verge', 'Guacamelee!', 'Ori and the Will of the Wisps'],
    t: ['Dark Souls (3D)', 'Celeste (plataformas puro)', 'Dead Cells (roguelite)', 'Shovel Knight', 'Cuphead']
  },
  {
    c: 'Videojuegos del subgénero Roguelike y Roguelite',
    f: ['Hades', 'The Binding of Isaac', 'Dead Cells', 'Enter the Gungeon'],
    m: ['Slay the Spire', 'Rogue Legacy', 'Spelunky'],
    d: ['Risk of Rain 2', 'Returnal', 'Noita'],
    t: ['Hollow Knight', 'Cuphead', 'Celeste', 'Undertale', 'Ori and the Blind Forest']
  },
  {
    c: 'Videojuegos independientes (Indies) con gran éxito de crítica y ventas',
    f: ['Hollow Knight', 'Undertale', 'Celeste', 'Cuphead'],
    m: ['Stardew Valley', 'Hades', 'Inside'],
    d: ['Limbo', 'Braid', 'Disco Elysium'],
    t: ['Elden Ring', 'God of War', 'The Last of Us', 'Cyberpunk 2077', 'Overwatch']
  },
  {
    c: 'Videojuegos pertenecientes a la saga postapocalíptica Fallout',
    f: ['Fallout 3', 'Fallout: New Vegas', 'Fallout 4', 'Fallout 76'],
    m: ['Fallout 1 (1997)', 'Fallout 2', 'Fallout Shelter'],
    d: ['Fallout Tactics: Brotherhood of Steel', 'Fallout: Brotherhood of Steel (console)', 'Wasteland (precursor espiritual)'],
    t: ['S.T.A.L.K.E.R.', 'Metro 2033', 'BioShock', 'Borderlands', 'Rage']
  },
  {
    c: 'Videojuegos de la saga de ciencia ficción distópica BioShock',
    f: ['BioShock (2007)', 'BioShock 2', 'BioShock Infinite', 'BioShock: The Collection'],
    m: ['BioShock 2: Minerva\'s Den', 'BioShock Infinite: Burial at Sea (Episodio 1)', 'BioShock Infinite: Burial at Sea (Episodio 2)'],
    d: ['System Shock (precursor)', 'System Shock 2 (precursor)', 'BioShock Remastered'],
    t: ['Fallout 3', 'Dishonored', 'Prey', 'Half-Life 2', 'Atomic Heart']
  },

  // 41 - 50: RPGs Japoneses (JRPGs) y Estrategia
  {
    c: 'Sagas emblemáticas del género JRPG (Rol Japonés)',
    f: ['Final Fantasy', 'Dragon Quest', 'Persona', 'Pokémon'],
    m: ['Kingdom Hearts', 'Tales of', 'Xenoblade Chronicles'],
    d: ['Shin Megami Tensei', 'Chrono (Trigger/Cross)', 'Fire Emblem'],
    t: ['The Elder Scrolls', 'The Witcher', 'Baldur\'s Gate', 'Fallout', 'Mass Effect']
  },
  {
    c: 'Entregas principales de la saga Persona (Atlus)',
    f: ['Persona 5', 'Persona 4 Golden', 'Persona 3 Reload', 'Persona 5 Royal'],
    m: ['Persona 3 Portable', 'Persona 4', 'Persona 5 Strikers'],
    d: ['Persona 2: Innocent Sin', 'Persona 2: Eternal Punishment', 'Shin Megami Tensei: Persona (1)'],
    t: ['Shin Megami Tensei V', 'Dragon Quest XI', 'Final Fantasy VII Remake', 'Yakuza: Like a Dragon', 'Nier: Automata']
  },
  {
    c: 'Videojuegos de estrategia en tiempo real (RTS)',
    f: ['Age of Empires II', 'StarCraft II', 'Warcraft III: Reign of Chaos', 'Command & Conquer: Red Alert'],
    m: ['Age of Mythology', 'Company of Heroes', 'Total War: Warhammer'],
    d: ['Empire Earth', 'Rise of Nations', 'Supreme Commander'],
    t: ['Civilization VI (por turnos)', 'Heroes of Might and Magic (por turnos)', 'XCOM 2 (por turnos)', 'SimCity', 'Cities: Skylines']
  },
  {
    c: 'Videojuegos de estrategia por turnos (Turn-Based Strategy / 4X)',
    f: ['Sid Meier\'s Civilization VI', 'Heroes of Might and Magic III', 'XCOM 2', 'Civilization V'],
    m: ['Total War (fase de mapa de campaña)', 'Endless Legend', 'Stellaris (híbrido)'],
    d: ['Age of Wonders 4', 'Master of Orion', 'Warlock: Master of the Arcane'],
    t: ['StarCraft II (RTS)', 'Age of Empires II (RTS)', 'Warcraft III (RTS)', 'Command & Conquer', 'Company of Heroes']
  },
  {
    c: 'Videojuegos de construcción y gestión (Tycoon / City Builders)',
    f: ['SimCity 4', 'Cities: Skylines', 'RollerCoaster Tycoon', 'Planet Coaster'],
    m: ['Age of Empires (modo pacífico)', 'Tropico 6', 'Frostpunk'],
    d: ['Anno 1800', 'Theme Hospital / Two Point Hospital', 'Prison Architect'],
    t: ['The Sims (simulación de vida)', 'Civilization VI', 'Command & Conquer', 'Doom', 'Portal 2']
  },
  {
    c: 'Entregas principales de la saga Monster Hunter (Capcom)',
    f: ['Monster Hunter: World', 'Monster Hunter Rise', 'Monster Hunter Wilds', 'Monster Hunter 4 Ultimate'],
    m: ['Monster Hunter Generations Ultimate', 'Monster Hunter Tri', 'Monster Hunter: World - Iceborne'],
    d: ['Monster Hunter Freedom Unite', 'Monster Hunter (PS2 original)', 'Monster Hunter Portable 3rd'],
    t: ['Dark Souls', 'God Eater', 'Dauntless', 'Toukiden', 'Wild Hearts']
  },
  {
    c: 'Monstruos e iconos principales de la saga Monster Hunter',
    f: ['Rathalos', 'Rathian', 'Nergigante', 'Zinogre'],
    m: ['Tigrex', 'Diablos', 'Gore Magala'],
    d: ['Fatalis', 'Brachydios', 'Kirin'],
    t: ['Bahamut (Final Fantasy)', 'Alduin (Skyrim)', 'Deathwing (Warcraft)', 'Ender Dragon (Minecraft)', 'Charizard']
  },
  {
    c: 'Entregas principales de la saga de carreras arcade y simulación Gran Turismo',
    f: ['Gran Turismo 7', 'Gran Turismo 4', 'Gran Turismo Sport', 'Gran Turismo 3: A-Spec'],
    m: ['Gran Turismo 5', 'Gran Turismo 6', 'Gran Turismo (PS1 original)'],
    d: ['Gran Turismo 2', 'Gran Turismo PSP', 'Gran Turismo HD Concept'],
    t: ['Forza Motorsport', 'Forza Horizon 5', 'Need for Speed: Underground', 'Assetto Corsa', 'Project CARS']
  },
  {
    c: 'Sagas y títulos emblemáticos de conducción y carreras (Racing Games)',
    f: ['Need for Speed', 'Gran Turismo', 'Forza Horizon', 'Mario Kart'],
    m: ['Burnout', 'F1 (Codemasters)', 'Dirt Rally'],
    d: ['Assetto Corsa', 'Midnight Club', 'Ridge Racer'],
    t: ['Grand Theft Auto V', 'Rocket League', 'Twisted Metal', 'Crazy Taxi', 'Carmageddon']
  },
  {
    c: 'Videojuegos de puzles e ingenio aclamados',
    f: ['Tetris', 'Portal', 'The Talos Principle', 'The Witness'],
    m: ['Portal 2', 'Baba Is You', 'Braid'],
    d: ['Stephen\'s Sausage Roll', 'Return of the Obra Dinn', 'Antichamber'],
    t: ['Candy Crush (casual match-3)', 'Half-Life 2', 'Super Mario World', 'Doom', 'Minecraft']
  },

  // 51 - 60: Terror, Aventuras Gráficas y Narrativa
  {
    c: 'Aventuras gráficas clásicas de la era dorada (Point and Click)',
    f: ['The Secret of Monkey Island', 'Maniac Mansion', 'Day of the Tentacle', 'Grim Fandango'],
    m: ['Monkey Island 2: LeChuck\'s Revenge', 'Indiana Jones and the Fate of Atlantis', 'Sam & Max Hit the Road'],
    d: ['The Dig', 'Full Throttle', 'Broken Sword: La sombra de los templarios'],
    t: ['Myst (primera persona)', 'Doom', 'Quake', 'Half-Life', 'Diablo']
  },
  {
    c: 'Videojuegos con enfoque narrativo cinemático interactivo',
    f: ['Heavy Rain', 'Detroit: Become Human', 'Life is Strange', 'Until Dawn'],
    m: ['Beyond: Two Souls', 'The Walking Dead (Telltale)', 'The Wolf Among Us'],
    d: ['The Quarry', 'As Dusk Falls', 'Fahrenheit (Indigo Prophecy)'],
    t: ['God of War', 'Uncharted 4', 'The Last of Us', 'Tomb Raider', 'Horizon Zero Dawn']
  },
  {
    c: 'Videojuegos de la saga de aventuras Uncharted (Naughty Dog)',
    f: ['Uncharted: El tesoro de Drake', 'Uncharted 2: El reino de los ladrones', 'Uncharted 3: La traición de Drake', 'Uncharted 4: El desenlace del ladrón'],
    m: ['Uncharted: El legado perdido', 'Uncharted: El abismo de oro (PS Vita)', 'Uncharted: The Nathan Drake Collection'],
    d: ['Uncharted: Lucha por el tesoro (cartas)', 'Uncharted: Legacy of Thieves Collection', 'Uncharted: Eye of Indra (cómic animado)'],
    t: ['Tomb Raider (2013)', 'Rise of the Tomb Raider', 'Shadow of the Tomb Raider', 'The Last of Us', 'Indiana Jones and the Emperor\'s Tomb']
  },
  {
    c: 'Videojuegos protagonizados por la heroína Lara Croft (Tomb Raider)',
    f: ['Tomb Raider (1996 original)', 'Tomb Raider (reboot 2013)', 'Rise of the Tomb Raider', 'Shadow of the Tomb Raider'],
    m: ['Tomb Raider II', 'Tomb Raider: Legend', 'Tomb Raider: Anniversary'],
    d: ['Tomb Raider: The Last Revelation', 'Tomb Raider: Underworld', 'Tomb Raider: El ángel de la oscuridad'],
    t: ['Uncharted 2', 'Horizon Zero Dawn', 'Mirror\'s Edge', 'Enslaved', 'Bayonetta']
  },
  {
    c: 'Videojuegos de sigilo táctico e infiltración',
    f: ['Metal Gear Solid', 'Splinter Cell', 'Hitman (World of Assassination)', 'Dishonored'],
    m: ['Thief: The Dark Project', 'Deus Ex: Human Revolution', 'Metal Gear Solid V: The Phantom Pain'],
    d: ['Mark of the Ninja', 'Styx: Master of Shadows', 'Sniper Elite 4'],
    t: ['Call of Duty', 'Doom Eternal', 'Gears of War', 'Wolfenstein', 'Borderlands']
  },
  {
    c: 'Entregas canónicas de la saga Metal Gear dirigidas por Hideo Kojima',
    f: ['Metal Gear Solid (PS1)', 'Metal Gear Solid 2: Sons of Liberty', 'Metal Gear Solid 3: Snake Eater', 'Metal Gear Solid 4: Guns of the Patriots'],
    m: ['Metal Gear Solid V: The Phantom Pain', 'Metal Gear Solid: Peace Walker', 'Metal Gear (MSX2 1987)'],
    d: ['Metal Gear 2: Solid Snake (1990)', 'Metal Gear Solid V: Ground Zeroes', 'Metal Gear Solid: The Twin Snakes'],
    t: ['Metal Gear Survive (sin Kojima)', 'Metal Gear Rising: Revengeance (PlatinumGames)', 'Death Stranding (otra saga)', 'Splinter Cell', 'Syphon Filter']
  },
  {
    c: 'Personajes icónicos del universo Metal Gear Solid',
    f: ['Solid Snake', 'Big Boss (Naked Snake)', 'Revolver Ocelot', 'Liquid Snake'],
    m: ['Raiden', 'Otacon (Hal Emmerich)', 'Meryl Silverburgh'],
    d: ['Gray Fox (Cyborg Ninja)', 'The Boss', 'Psycho Mantis'],
    t: ['Sam Fisher', 'Agent 47', 'Gabriel Logan', 'Chris Redfield', 'Leon S. Kennedy']
  },
  {
    c: 'Personajes jugables en el juego de rol y acción Genshin Impact',
    f: ['Traveler (Viajero/a)', 'Zhongli', 'Raiden Shogun', 'Hu Tao'],
    m: ['Diluc', 'Venti', 'Nahida'],
    d: ['Furina', 'Kaedehara Kazuha', 'Kamisato Ayaka'],
    t: ['Trailblazer (Honkai: Star Rail)', 'Kafka (Honkai)', 'Dan Heng (Honkai)', '2B (Nier)', 'Cloud Strife']
  },
  {
    c: 'Videojuegos MMORPG (Rol Multijugador Masivo Online)',
    f: ['World of Warcraft', 'Final Fantasy XIV', 'The Elder Scrolls Online', 'Guild Wars 2'],
    m: ['RuneScape', 'Black Desert Online', 'Lost Ark'],
    d: ['EVE Online', 'Lineage II', 'Tibia'],
    t: ['League of Legends (MOBA)', 'Diablo IV (ARPG)', 'Path of Exile (ARPG)', 'Destiny 2 (Looter Shooter)', 'Overwatch']
  },
  {
    c: 'Expansiones oficiales del videojuego World of Warcraft (WoW)',
    f: ['The Burning Crusade', 'Wrath of the Lich King', 'Cataclysm', 'Mists of Pandaria'],
    m: ['Warlords of Draenor', 'Legion', 'Battle for Azeroth'],
    d: ['Shadowlands', 'Dragonflight', 'The War Within'],
    t: ['Reaper of Souls (Diablo)', 'Lord of Destruction (Diablo)', 'Heart of the Swarm (StarCraft)', 'Legacy of the Void (StarCraft)', 'Frozen Throne (Warcraft III)']
  },

  // 61 - 70: Mundos Abiertos y Juegos de Rol de Acción
  {
    c: 'Videojuegos de rol y acción (ARPG) estilo Diablo y hack and slash',
    f: ['Diablo II', 'Diablo IV', 'Path of Exile', 'Titan Quest'],
    m: ['Grim Dawn', 'Torchlight II', 'The Incredible Adventures of Van Helsing'],
    d: ['Last Epoch', 'Victor Vran', 'Dungeon Siege'],
    t: ['Dark Souls (Souls-like en tercera persona)', 'Skyrim', 'The Witcher 3', 'Baldur\'s Gate 3', 'World of Warcraft']
  },
  {
    c: 'Clases de personajes jugables tradicionales en Diablo II',
    f: ['Bárbaro', 'Hechicera (Sorceress)', 'Nigromante', 'Paladín'],
    m: ['Amazona', 'Druida (Lord of Destruction)', 'Asesina (Lord of Destruction)'],
    d: ['Bárbaro de torbellino', 'Nigromante de invocación', 'Paladín de martillos (Hammerdin)'],
    t: ['Monje (Diablo III)', 'Cazador de demonios (Diablo III)', 'Médico brujo (Diablo III)', 'Cruzado (Diablo III)', 'Pícaro (Diablo IV)']
  },
  {
    c: 'Videojuegos de la saga de acción y hack and slash God of War',
    f: ['God of War (2005)', 'God of War II', 'God of War III', 'God of War (2018)'],
    m: ['God of War Ragnarök', 'God of War: Chains of Olympus', 'God of War: Ghost of Sparta'],
    d: ['God of War: Ascension', 'God of War: Betrayal (móvil 2D)', 'God of War Ragnarök: Valhalla'],
    t: ['Devil May Cry 5', 'Dante\'s Inferno', 'Bayonetta', 'Ninja Gaiden', 'Castlevania: Lords of Shadow']
  },
  {
    c: 'Dioses y figuras mitológicas a las que se enfrenta Kratos en God of War',
    f: ['Ares', 'Zeus', 'Poseidón', 'Hades'],
    m: ['Thor (saga nórdica)', 'Odín (saga nórdica)', 'Baldur (saga nórdica)'],
    d: ['Helios', 'Hermes', 'Crono (titán)'],
    t: ['Anubis', 'Ra', 'Loki (es su hijo Atreus)', 'Gilgamesh', 'Quetzalcóatl']
  },
  {
    c: 'Entregas principales de la saga Devil May Cry (Capcom)',
    f: ['Devil May Cry (2001)', 'Devil May Cry 3: Dante\'s Awakening', 'Devil May Cry 4', 'Devil May Cry 5'],
    m: ['Devil May Cry 2', 'DmC: Devil May Cry (Ninja Theory)', 'Devil May Cry HD Collection'],
    d: ['DMC3 Special Edition', 'DMC4 Special Edition', 'DMC5 Special Edition (Vergil)'],
    t: ['Bayonetta', 'Ninja Gaiden', 'God of War III', 'Metal Gear Rising', 'Castlevania: Lords of Shadow']
  },
  {
    c: 'Videojuegos de acción en mundo abierto ambientados en ciudades modernas',
    f: ['Grand Theft Auto V', 'Watch Dogs', 'Sleeping Dogs', 'Saints Row: The Third'],
    m: ['Marvel\'s Spider-Man (PS4)', 'Batman: Arkham Knight', 'Yakuza 0'],
    d: ['Infamous Second Son', 'Crackdown', 'The Division (Nueva York)'],
    t: ['Red Dead Redemption 2 (Viejo Oeste)', 'Skyrim', 'The Witcher 3', 'Assassin\'s Creed Valhalla', 'Horizon Zero Dawn']
  },
  {
    c: 'Videojuegos de la saga de rol de ciencia ficción Mass Effect (BioWare)',
    f: ['Mass Effect (2007)', 'Mass Effect 2', 'Mass Effect 3', 'Mass Effect: Andromeda'],
    m: ['Mass Effect Legendary Edition', 'Mass Effect 2: Lair of the Shadow Broker', 'Mass Effect 3: Citadel'],
    d: ['Mass Effect Infiltrator (móvil)', 'Mass Effect Galaxy (iOS)', 'Mass Effect 3: Extended Cut'],
    t: ['Starfield', 'No Man\'s Sky', 'Halo 4', 'Destiny', 'Dead Space']
  },
  {
    c: 'Compañeros de tripulación icónicos de la nave Normandía en Mass Effect',
    f: ['Garrus Vakarian', 'Tali\'Zorah', 'Liara T\'Soni', 'Urdnot Wrex'],
    m: ['Miranda Lawson', 'Mordin Solus', 'Thane Krios'],
    d: ['Legion (Geth)', 'Joker (piloto Jeff Moreau)', 'Javik (proteano)'],
    t: ['Master Chief', 'Cortana', 'Marcus Fenix', 'Isaac Clarke', 'Gordon Freeman']
  },
  {
    c: 'Entregas principales de la saga The Witcher (CD Projekt RED)',
    f: ['The Witcher (2007)', 'The Witcher 2: Assassins of Kings', 'The Witcher 3: Wild Hunt', 'Gwent: The Witcher Card Game'],
    m: ['The Witcher 3: Hearts of Stone', 'The Witcher 3: Blood and Wine', 'Thronebreaker: The Witcher Tales'],
    d: ['The Witcher: Enhanced Edition', 'The Witcher: Monster Slayer (AR)', 'The Witcher Remake (anunciado)'],
    t: ['Skyrim', 'Dragon Age: Inquisition', 'Elden Ring', 'Dark Souls', 'Baldur\'s Gate 3']
  },
  {
    c: 'Personajes relevantes de la trama de The Witcher 3: Wild Hunt',
    f: ['Geralt de Rivia', 'Ciri (Cirilla)', 'Yennefer de Vengerberg', 'Triss Merigold'],
    m: ['Dandelion (Jaskier)', 'Vesemir', 'Barón Sanguinario (Phillip Strenger)'],
    d: ['Gaunter O\'Dimm', 'Emhyr var Emreis', 'Eredin Bréacc Glas'],
    t: ['Alduin', 'Paarthurnax', 'Sylvanas Brisaveloz', 'Arthas Menethil', 'Illidan Tempestira']
  },

  // 71 - 80: Nintendo, Mascotas y Aventuras Clásicas
  {
    c: 'Entregas canónicas de la saga Super Mario en 3D',
    f: ['Super Mario 64', 'Super Mario Sunshine', 'Super Mario Galaxy', 'Super Mario Odyssey'],
    m: ['Super Mario Galaxy 2', 'Super Mario 3D World', 'Super Mario 3D Land'],
    d: ['Bowser\'s Fury', 'Super Mario 64 DS', 'Super Mario 3D All-Stars'],
    t: ['Super Mario World (2D)', 'New Super Mario Bros. U (2D)', 'Super Mario Bros. 3 (2D)', 'Super Mario Maker', 'Mario Kart 8 Deluxe']
  },
  {
    c: 'Juegos de la serie Mario Kart de carreras',
    f: ['Super Mario Kart (SNES)', 'Mario Kart 64', 'Mario Kart Double Dash!!', 'Mario Kart 8 Deluxe'],
    m: ['Mario Kart Wii', 'Mario Kart DS', 'Mario Kart 7'],
    d: ['Mario Kart: Super Circuit (GBA)', 'Mario Kart Tour (móvil)', 'Mario Kart Live: Home Circuit'],
    t: ['Crash Team Racing', 'Sonic & SEGA All-Stars Racing', 'Diddy Kong Racing', 'F-Zero X', 'Wave Race 64']
  },
  {
    c: 'Juegos de la saga de acción y aventura espacial Metroid',
    f: ['Super Metroid', 'Metroid Prime', 'Metroid Dread', 'Metroid Fusion'],
    m: ['Metroid Prime 2: Echoes', 'Metroid Prime 3: Corruption', 'Metroid: Zero Mission'],
    d: ['Metroid: Samus Returns (3DS)', 'Metroid II: Return of Samus (GB)', 'Metroid: Other M'],
    t: ['Halo: Combat Evolved', 'Mega Man X', 'Dead Space', 'Castlevania: Symphony of the Night', 'Star Fox 64']
  },
  {
    c: 'Videojuegos de la franquicia Donkey Kong',
    f: ['Donkey Kong Country (SNES)', 'Donkey Kong 64', 'Donkey Kong Country Returns', 'Donkey Kong Country: Tropical Freeze'],
    m: ['Donkey Kong Country 2: Diddy\'s Kong Quest', 'Donkey Kong Country 3: Dixie Kong\'s Double Trouble!', 'Donkey Kong (Arcade 1981)'],
    d: ['Donkey Kong Jungle Beat (Bongos)', 'Donkey Kong Land (Game Boy)', 'Mario vs. Donkey Kong'],
    t: ['Super Mario World', 'Crash Bandicoot 3', 'Rayman Legends', 'Sonic the Hedgehog', 'Banjo-Kazooie']
  },
  {
    c: 'Videojuegos de plataformas 3D desarrollados por el estudio Rare (era Nintendo 64)',
    f: ['Banjo-Kazooie', 'Donkey Kong 64', 'Banjo-Tooie', 'Conker\'s Bad Fur Day'],
    m: ['GoldenEye 007 (FPS)', 'Perfect Dark (FPS)', 'Diddy Kong Racing'],
    d: ['Blast Corps', 'Jet Force Gemini', 'Killer Instinct Gold'],
    t: ['Super Mario 64', 'The Legend of Zelda: Ocarina of Time', 'Rayman 2', 'Spyro the Dragon', 'Crash Bandicoot']
  },
  {
    c: 'Entregas principales de la saga Animal Crossing de simulación de vida',
    f: ['Animal Crossing: New Horizons (Switch)', 'Animal Crossing: New Leaf (3DS)', 'Animal Crossing: Wild World (DS)', 'Animal Crossing: Población: ¡en aumento! (GameCube)'],
    m: ['Animal Crossing: Let\'s Go to the City / City Folk (Wii)', 'Animal Crossing: Happy Home Designer', 'Animal Crossing: Pocket Camp (móvil)'],
    d: ['Dōbutsu no Mori (N64 Japón)', 'Animal Crossing: amiibo Festival', 'New Horizons - Happy Home Paradise'],
    t: ['The Sims 4', 'Stardew Valley', 'Harvest Moon', 'Story of Seasons', 'My Time at Portia']
  },
  {
    c: 'Videojuegos de la franquicia musical y de ritmo Guitar Hero / Rock Band',
    f: ['Guitar Hero', 'Guitar Hero III: Legends of Rock', 'Guitar Hero World Tour', 'Rock Band'],
    m: ['Guitar Hero II', 'Rock Band 2', 'Guitar Hero: Metallica'],
    d: ['Guitar Hero: Aerosmith', 'The Beatles: Rock Band', 'Guitar Hero Live'],
    t: ['Just Dance 2024', 'Beat Saber (VR)', 'Dance Dance Revolution', 'SingStar', 'Osu!']
  },
  {
    c: 'Videojuegos de simulación de vida de la franquicia Los Sims (The Sims)',
    f: ['Los Sims (2000 original)', 'Los Sims 2', 'Los Sims 3', 'Los Sims 4'],
    m: ['Los Sims Toman la Calle (Bustin\' Out)', 'Los Sims 2: Mascotas', 'Los Sims 3: Hobbies'],
    d: ['Los Sims Medieval', 'Los Sims Naufragos (Castaway)', 'Los Sims Online'],
    t: ['SimCity 4', 'Animal Crossing: New Horizons', 'Second Life', 'Habbo Hotel', 'Stardew Valley']
  },
  {
    c: 'Videojuegos de realidad virtual (VR) galardonados o de gran éxito comercial',
    f: ['Half-Life: Alyx', 'Beat Saber', 'Superhot VR', 'Resident Evil 7: Biohazard (modo VR)'],
    m: ['The Walking Dead: Saints & Sinners', 'Gran Turismo 7 (modo PS VR2)', 'Astro Bot Rescue Mission'],
    d: ['Boneworks', 'Asgard\'s Wrath', 'Pavlov VR'],
    t: ['Portal 2', 'Cyberpunk 2077', 'Overwatch', 'Valorant', 'Counter-Strike 2']
  },
  {
    c: 'Videojuegos de deportes y simulación con entregas anuales masivas',
    f: ['EA Sports FC (antiguo FIFA)', 'NBA 2K', 'Madden NFL', 'eFootball (antiguo PES)'],
    m: ['WWE 2K', 'MLB The Show', 'F1 (EA Sports / Codemasters)'],
    d: ['NHL (Hockey EA)', 'PGA Tour 2K', 'Football Manager'],
    t: ['Rocket League', 'Mario Strikers', 'Wii Sports', 'Captain Tsubasa: Rise of New Champions', 'NBA Jam']
  },

  // 81 - 90: Clásicos Inolvidables y Sagaces Narrativas
  {
    c: 'Juegos de la saga de terror psicológico y supervivencia Silent Hill',
    f: ['Silent Hill (1999)', 'Silent Hill 2', 'Silent Hill 3', 'Silent Hill 4: The Room'],
    m: ['Silent Hill: Origins', 'Silent Hill: Homecoming', 'Silent Hill: Shattered Memories'],
    d: ['Silent Hill: Downpour', 'Silent Hill: Book of Memories', 'Silent Hills (P.T. demo cancelada)'],
    t: ['Resident Evil 3', 'Dead Space', 'The Evil Within', 'Alone in the Dark', 'Outlast']
  },
  {
    c: 'Videojuegos de acción en tercera persona de la saga Gears of War',
    f: ['Gears of War (2006)', 'Gears of War 2', 'Gears of War 3', 'Gears 5'],
    m: ['Gears of War 4', 'Gears of War: Judgment', 'Gears of War: Ultimate Edition'],
    d: ['Gears Tactics (estrategia)', 'Gears of War: E-Day (anunciado)', 'Gears POP!'],
    t: ['Halo 3', 'Killzone 2', 'Resistance: Fall of Man', 'Uncharted 2', 'Army of Two']
  },
  {
    c: 'Personajes miembros del pelotón Delta en Gears of War',
    f: ['Marcus Fenix', 'Dominic Santiago (Dom)', 'Damon Baird', 'Augustus Cole (Cole Train)'],
    m: ['Anya Stroud', 'Kait Diaz', 'JD Fenix'],
    d: ['Tai Kaliso', 'Minh Young Kim', 'Benjamin Carmine'],
    t: ['Master Chief (John-117)', 'Sargento Johnson', 'Noble Seis', 'Doom Slayer', 'Isaac Clarke']
  },
  {
    c: 'Videojuegos de la saga espacial en primera persona Halo',
    f: ['Halo: Combat Evolved', 'Halo 2', 'Halo 3', 'Halo Infinite'],
    m: ['Halo: Reach', 'Halo 4', 'Halo 3: ODST'],
    d: ['Halo 5: Guardians', 'Halo Wars (RTS)', 'Halo: Spartan Assault'],
    t: ['Destiny 2', 'Gears of War 3', 'Killzone Shadow Fall', 'Titanfall 2', 'DOOM (2016)']
  },
  {
    c: 'Personajes y razas clave en el lore del universo Halo',
    f: ['Master Chief (Jefe Maestro)', 'Cortana', 'El Inquisidor (Arbiter)', 'Sargento Avery Johnson'],
    m: ['Los Elites (Sangheili)', 'Los Grunts (Unggoy)', 'El Flood (parásito)'],
    d: ['El Didacta (Forerunner)', 'Capitán Jacob Keyes', 'Dra. Catherine Halsey'],
    t: ['Marcus Fenix', 'Locust', 'Doom Slayer', 'Garrus Vakarian', 'Samus Aran']
  },
  {
    c: 'Videojuegos de la saga épica postapocalíptica Horizon (Guerrilla Games)',
    f: ['Horizon Zero Dawn', 'Horizon Forbidden West', 'Horizon Call of the Mountain (PS VR2)', 'Horizon Zero Dawn: The Frozen Wilds'],
    m: ['Horizon Forbidden West: Burning Shores', 'Horizon Zero Dawn Remastered', 'LEGO Horizon Adventures'],
    d: ['Aloy (protagonista canónica)', 'Rost (mentor)', 'Sylens (aliado ambiguo)'],
    t: ['Ghost of Tsushima', 'The Last of Us Part II', 'Days Gone', 'God of War Ragnarök', 'Death Stranding']
  },
  {
    c: 'Juegos de la saga de acción y aventura medieval en Japón Ghost of Tsushima',
    f: ['Ghost of Tsushima', 'Ghost of Tsushima: Legends (multijugador)', 'Ghost of Tsushima Director\'s Cut', 'Ghost of Yōtei (secuela)'],
    m: ['Jin Sakai (protagonista)', 'Isla de Iki (expansión)', 'Señor Shimura (tío de Jin)'],
    d: ['Khotun Kan (líder invasor mongol)', 'Yuna (ladrona aliada)', 'Taka (herrero)'],
    t: ['Sekiro: Shadows Die Twice', 'Nioh 2', 'Rise of the Ronin', 'Wo Long: Fallen Dynasty', 'Way of the Samurai']
  },
  {
    c: 'Videojuegos desarrollados por el estudio Remedy Entertainment',
    f: ['Max Payne (2001)', 'Alan Wake', 'Control', 'Alan Wake 2'],
    m: ['Max Payne 2: The Fall of Max Payne', 'Quantum Break', 'Alan Wake\'s American Nightmare'],
    d: ['Death Rally (1996)', 'Control: AWE (expansión cruzada)', 'The Signal (DLC Alan Wake)'],
    t: ['Heavy Rain', 'Silent Hill 2 Remake', 'BioShock', 'Dead Space', 'Dishonored']
  },
  {
    c: 'Videojuegos creados por el diseñador japonés Hidetaka Miyazaki',
    f: ['Demon\'s Souls', 'Dark Souls', 'Bloodborne', 'Elden Ring'],
    m: ['Dark Souls III', 'Sekiro: Shadows Die Twice', 'Elden Ring: Shadow of the Erdtree'],
    d: ['Armored Core 4', 'Armored Core: For Answer', 'Déraciné (VR)'],
    t: ['Dark Souls II (supervisó, no dirigió)', 'Nioh', 'Dragon\'s Dogma', 'Monster Hunter World', 'Lies of P']
  },
  {
    c: 'Videojuegos de rol y mazmorras de la franquicia Kingdom Hearts',
    f: ['Kingdom Hearts (2002)', 'Kingdom Hearts II', 'Kingdom Hearts III', 'Kingdom Hearts: Chain of Memories'],
    m: ['Kingdom Hearts Birth by Sleep', 'Kingdom Hearts 3D: Dream Drop Distance', 'Kingdom Hearts 358/2 Days'],
    d: ['Kingdom Hearts coded', 'Kingdom Hearts Union χ', 'Kingdom Hearts Melody of Memory'],
    t: ['Final Fantasy X', 'Dragon Quest VIII', 'Super Smash Bros. Ultimate', 'NieR Replicant', 'Chrono Trigger']
  },

  // 91 - 100: Iconos Pop, E-Sports y Fenómenos Culturales
  {
    c: 'Mapas competitivos históricos del juego de disparos Counter-Strike',
    f: ['Dust II', 'Inferno', 'Mirage', 'Nuke'],
    m: ['Train', 'Overpass', 'Vertigo'],
    d: ['Ancient', 'Cobblestone', 'Anubis'],
    t: ['Ascent (Valorant)', 'Bind (Valorant)', 'Summoner\'s Rift (LoL)', 'Kings Row (Overwatch)', 'Terminal (Call of Duty)']
  },
  {
    c: 'Mapas de juego del shooter táctico Valorant',
    f: ['Ascent', 'Bind', 'Haven', 'Split'],
    m: ['Icebox', 'Breeze', 'Fracture'],
    d: ['Pearl', 'Lotus', 'Sunset'],
    t: ['Dust II', 'Inferno', 'Mirage', 'Nuke', 'Overpass']
  },
  {
    c: 'Mapas y escenarios del shooter heroico Overwatch / Overwatch 2',
    f: ['King\'s Row', 'Hanamura', 'Temple of Anubis', 'Route 66'],
    m: ['Gibraltar (Watchpoint: Gibraltar)', 'Ilios', 'Eichenwalde'],
    d: ['Dorado', 'Numbani', 'Colosseo'],
    t: ['Dust II', 'Summoner\'s Rift', 'Haven', 'Ascent', 'Verdansk']
  },
  {
    c: 'Videojuegos de supervivencia con temática zombi y mundo abierto',
    f: ['DayZ', 'Project Zomboid', 'State of Decay 2', 'Dying Light'],
    m: ['Dead Island 2', '7 Days to Die', 'Days Gone'],
    d: ['Unturned', 'Dead Rising 3', 'SCUM'],
    t: ['Resident Evil 4 (lineal)', 'Left 4 Dead 2 (pasillero)', 'The Last of Us (lineal)', 'Doom Eternal', 'Fallout 4']
  },
  {
    c: 'Videojuegos de la saga de carreras y acrobacias con coches Rocket League',
    f: ['Rocket League (2015)', 'Supersonic Acrobatic Rocket-Powered Battle-Cars (precursor)', 'Rocket League Sideswipe (móvil)', 'Octane (coche estándar)'],
    m: ['Fennec (coche competitivo)', 'Dominus (coche competitivo)', 'Batmobile (DLC oficial)'],
    d: ['Breakout (coche)', 'Estadio DFH Stadium', 'Modo Hoops (baloncesto)'],
    t: ['Mario Kart 8', 'Gran Turismo 7', 'Need for Speed Heat', 'Trackmania', 'Asphalt 9']
  },
  {
    c: 'Tipos de bloques y minerales de extracción en el juego Minecraft',
    f: ['Bloque de diamante', 'Bloque de hierro', 'Bloque de oro', 'Bloque de carbón'],
    m: ['Redstone (polvo y mena)', 'Lapislázuli', 'Obsidiana'],
    d: ['Netherite (escombros ancestrales)', 'Esmeralda', 'Cobre'],
    t: ['Kriptonita', 'Adamantium', 'Mithril', 'Vibranium', 'Beskar']
  },
  {
    c: 'Jefes principales y criaturas temidas del universo Minecraft',
    f: ['Ender Dragon (Dragón del Fin)', 'Wither (Jefe de tres cabezas)', 'Warden (Guardián de la Oscuridad)', 'Elder Guardian (Guardián Anciano)'],
    m: ['Evocador (Evoker con vexes)', 'Ravager (Devastador en asaltos)', 'Iron Golem (si se le provoca)'],
    d: ['Piglin Brute (bruto del Nether)', 'Endermite', 'Wither Skeleton'],
    t: ['Bowser', 'Herobrine (mito comunitario creepypasta)', 'Cthulhu', 'Sephiroth', 'Alduin']
  },
  {
    c: 'Videojuegos que exploran el espacio exterior mediante generación procedimental o exploración espacial',
    f: ['No Man\'s Sky', 'Elite Dangerous', 'Starfield', 'Kerbal Space Program'],
    m: ['Outer Wilds', 'Astroneer', 'Star Citizen'],
    d: ['X4: Foundations', 'Space Engineers', 'EVE Online'],
    t: ['Dead Space (terror pasillero)', 'Mass Effect 2 (RPG guiado)', 'Alien: Isolation', 'Star Wars Jedi: Fallen Order', 'Doom 3']
  },
  {
    c: 'Juegos de la saga de acción y aventuras Star Wars Jedi de Respawn Entertainment',
    f: ['Star Wars Jedi: Fallen Order', 'Star Wars Jedi: Survivor', 'Cal Kestis (protagonista)', 'BD-1 (droide compañero)'],
    m: ['Segunda Hermana (Trilla Suduri)', 'Cere Junda (mentora)', 'Greez Dritus (piloto)'],
    d: ['Planeta Bogano', 'Planeta Zeffo', 'Novena Hermana'],
    t: ['Star Wars: The Force Unleashed (Starkiller)', 'Star Wars: Battlefront II', 'Star Wars: Knights of the Old Republic', 'Star Wars: Squadrons', 'Star Wars: Outlaws']
  },
  {
    c: 'Grandes personalidades de la industria creadoras de sagas míticas de videojuegos',
    f: ['Shigeru Miyamoto (Mario, Zelda)', 'Hideo Kojima (Metal Gear)', 'Gabe Newell (Valve, Steam)', 'Hidetaka Miyazaki (Soulsborne)'],
    m: ['Todd Howard (The Elder Scrolls, Fallout)', 'Sam Houser (Rockstar/GTA)', 'Masahiro Sakurai (Super Smash Bros.)'],
    d: ['Shinji Mikami (Resident Evil)', 'Yuji Naka (Sonic)', 'John Carmack (Doom, Quake)'],
    t: ['Elon Musk', 'Steve Jobs', 'Bill Gates (ejecutivo, no diseñador)', 'Mark Zuckerberg', 'Jeff Bezos']
  }
];

export default Array.from({ length: 100 }, (_, idx) => {
  const p = plantillas[idx];
  return {
    id: `videojuegos_${idx + 1}`,
    consigna: p.c,
    correctos: { faciles: p.f, medios: p.m, dificiles: p.d },
    trampas: p.t
  };
});