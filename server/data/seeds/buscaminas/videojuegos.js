// server/data/seeds/buscaminas/videojuegos.js

const plantillas = [
  // 1 - 10: Franquicias Legendarias y GOTY
  {
    c: 'Videojuegos desarrollados por Nintendo o sus estudios internos (1st party)',
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
    f: ['The Witcher 3: Wild Hunt', 'The Legend of Zelda: Breath of the Wild', 'God of War', 'Elden Ring'],
    m: ['Sekiro: Shadows Die Twice', 'The Last of Us Parte II', 'Overwatch'],
    d: ['Baldur\'s Gate 3', 'Dragon Age: Inquisition', 'It Takes Two'],
    t: ['Red Dead Redemption 2', 'Horizon Zero Dawn', 'Cyberpunk 2077', 'Marvel\'s Spider-Man', 'Dark Souls 3']
  },
  {
    c: 'Armas y herramientas emblemáticas de la historia de los videojuegos',
    f: ['Espada Maestra', 'Buster Sword', 'Portal Gun', 'Pico de diamante'],
    m: ['Hidden Blade', 'BFG 9000', 'Palanca (Crowbar)'],
    d: ['Espadas del Caos', 'Keyblade', 'Espada de Energía'],
    t: ['Varita de Saúco', 'Anillo Único', 'Mjolnir', 'Espada Láser', 'Excalibur']
  },
  {
    c: 'Subtítulos y entregas pertenecientes a la franquicia Grand Theft Auto',
    f: ['San Andreas', 'Vice City', 'Liberty City Stories', 'Chinatown Wars'],
    m: ['Vice City Stories', 'London 1969', 'The Ballad of Gay Tony'],
    d: ['The Lost and Damned', 'Advance', '2: Worldwide'],
    t: ['Rogue City', 'Payback', 'True Crime', 'Bad Blood', 'Saints Row']
  },
  {
    c: 'Consolas y dispositivos de videojuegos lanzados por Sony PlayStation',
    f: ['PlayStation 2', 'PlayStation 4', 'PlayStation Portable (PSP)', 'PlayStation Vita'],
    m: ['PlayStation 3', 'PlayStation 5', 'PS One'],
    d: ['PocketStation', 'PSX (grabador)', 'PlayStation Portal'],
    t: ['Dreamcast', 'GameCube', 'Gizmondo', 'Xbox 360', 'Game Gear']
  },
  {
    c: 'Shooters multijugador competitivos en primera o tercera persona (Esports)',
    f: ['Counter-Strike 2', 'Valorant', 'Call of Duty: Warzone', 'Overwatch 2'],
    m: ['Rainbow Six Siege', 'Apex Legends', 'Team Fortress 2'],
    d: ['PUBG: Battlegrounds', 'Halo Infinite', 'CrossFire'],
    t: ['League of Legends', 'Dota 2', 'Rocket League', 'EA Sports FC', 'Street Fighter 6']
  },
  {
    c: 'Pokémon pertenecientes a la Primera Generación (región de Kanto)',
    f: ['Charizard', 'Pikachu', 'Mewtwo', 'Bulbasaur'],
    m: ['Snorlax', 'Gengar', 'Eevee'],
    d: ['Dragonite', 'Gyarados', 'Lapras'],
    t: ['Lucario', 'Greninja', 'Gardevoir', 'Rayquaza', 'Mudkip']
  },
  {
    c: 'Franquicias de videojuegos creadas por la compañía japonesa Capcom',
    f: ['Resident Evil', 'Street Fighter', 'Monster Hunter', 'Mega Man'],
    m: ['Devil May Cry', 'Ace Attorney', 'Dead Rising'],
    d: ['Dragon\'s Dogma', 'Ghosts \'n Goblins', 'Okami'],
    t: ['Tekken', 'Final Fantasy', 'Mortal Kombat', 'Castlevania', 'Silent Hill']
  },
  {
    c: 'Consolas de sobremesa y portátiles fabricadas por Nintendo',
    f: ['Nintendo Switch', 'Game Boy', 'Nintendo 64', 'Super Nintendo'],
    m: ['Nintendo DS', 'Nintendo GameCube', 'Wii'],
    d: ['Game Boy Advance', 'Virtual Boy', 'Color TV-Game'],
    t: ['Sega Mega Drive', 'PlayStation Portable', 'Xbox One', 'Neo Geo', 'Atari Lynx']
  },

  // 11 - 20: RPGs, Lucha y Aventura
  {
    c: 'Títulos pertenecientes al género RPG occidental (WRPG)',
    f: ['The Elder Scrolls V: Skyrim', 'The Witcher 3: Wild Hunt', 'Baldur\'s Gate 3', 'Fallout: New Vegas'],
    m: ['Mass Effect 2', 'Dragon Age: Origins', 'Cyberpunk 2077'],
    d: ['Divinity: Original Sin 2', 'Pillars of Eternity', 'Starfield'],
    t: ['Final Fantasy VII', 'Persona 5', 'Dragon Quest XI', 'Kingdom Hearts', 'Chrono Trigger']
  },
  {
    c: 'Luchadores clásicos de la saga Street Fighter',
    f: ['Ryu', 'Ken Masters', 'Chun-Li', 'Guile'],
    m: ['Blanka', 'Zangief', 'Dhalsim'],
    d: ['M. Bison', 'Cammy White', 'Vega'],
    t: ['Sub-Zero', 'Scorpion', 'Jin Kazama', 'Kazuya Mishima', 'Raiden']
  },
  {
    c: 'Videojuegos centrados en mecánicas de supervivencia y crafteo',
    f: ['Minecraft', 'ARK: Survival Evolved', 'Rust', 'The Forest'],
    m: ['Subnautica', 'Valheim', 'Terraria'],
    d: ['Raft', 'Don\'t Starve', 'Green Hell'],
    t: ['Warzone', 'Super Mario Odyssey', 'God of War', 'Spider-Man', 'Uncharted 4']
  },
  {
    c: 'Subtítulos y nombres de entregas de la saga bélica Call of Duty',
    f: ['Modern Warfare', 'Black Ops', 'Warzone', 'World at War'],
    m: ['Ghosts', 'Advanced Warfare', 'Infinite Warfare'],
    d: ['Vanguard', 'Cold War', 'Big Red One'],
    t: ['Bad Company', 'Allied Assault', 'Hardline', 'Pacific Assault', 'Vietnam Warfare']
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
    d: ['Toad', 'Waluigi', 'Estela (Rosalina)'],
    t: ['Sonic the Hedgehog', 'Crash Bandicoot', 'Rayman', 'Pac-Man', 'Mega Man']
  },
  {
    c: 'Videojuegos que superan los 40 millones de copias vendidas en la historia',
    f: ['Minecraft', 'Grand Theft Auto V', 'Tetris', 'Wii Sports'],
    m: ['PUBG: Battlegrounds', 'Mario Kart 8 Deluxe', 'Red Dead Redemption 2'],
    d: ['Terraria', 'Super Mario Bros.', 'The Witcher 3: Wild Hunt'],
    t: ['God of War', 'The Last of Us', 'Cyberpunk 2077', 'Marvel\'s Spider-Man', 'Elden Ring']
  },
  {
    c: 'Subtítulos oficiales de entregas de la saga The Legend of Zelda',
    f: ['Breath of the Wild', 'Ocarina of Time', 'Majora\'s Mask', 'Tears of the Kingdom'],
    m: ['The Wind Waker', 'Twilight Princess', 'A Link to the Past'],
    d: ['Skyward Sword', 'The Minish Cap', 'Link\'s Awakening'],
    t: ['Shadow of the Colossus', 'Chronicles of Mana', 'Riddle of the Sphinx', 'Sword of Destiny', 'Echoes of Mana']
  },
  {
    c: 'Compañías editoras y distribuidoras mundiales de videojuegos',
    f: ['Electronic Arts', 'Ubisoft', 'Activision Blizzard', 'Square Enix'],
    m: ['Capcom', 'Bandai Namco', 'Konami'],
    d: ['Take-Two Interactive', 'Bethesda Softworks', 'Sega'],
    t: ['Netflix', 'Spotify', 'Amazon Studios', 'Warner Bros. Pictures', 'Pixar']
  },
  {
    c: 'Videojuegos pertenecientes al género Battle Royale',
    f: ['Fortnite', 'Call of Duty: Warzone', 'Apex Legends', 'PUBG: Battlegrounds'],
    m: ['Fall Guys', 'Free Fire', 'Realm Royale'],
    d: ['Naraka: Bladepoint', 'H1Z1', 'Cuisine Royale'],
    t: ['Valorant', 'Counter-Strike 2', 'Overwatch 2', 'Rainbow Six Siege', 'Rocket League']
  },

  // 21 - 30: PlayStation, Xbox y PC Gaming
  {
    c: 'Franquicias exclusivas o creadas por estudios de PlayStation (Sony)',
    f: ['God of War', 'The Last of Us', 'Uncharted', 'Gran Turismo'],
    m: ['Horizon', 'Ghost of Tsushima', 'Ratchet & Clank'],
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
    m: ['Max Payne 3', 'L.A. Noire', 'Red Dead Redemption'],
    d: ['Manhunt', 'The Warriors', 'Midnight Club: Los Angeles'],
    t: ['Mafia II', 'Saints Row', 'Sleeping Dogs', 'Watch Dogs', 'Just Cause']
  },
  {
    c: 'Títulos dirigidos o desarrollados por FromSoftware (género Soulsborne/action-RPG)',
    f: ['Dark Souls', 'Elden Ring', 'Bloodborne', 'Sekiro: Shadows Die Twice'],
    m: ['Demon\'s Souls', 'King\'s Field', 'Armored Core VI'],
    d: ['Otogi', 'Shadow Tower', 'Ninja Blade'],
    t: ['Nioh', 'Lies of P', 'Lords of the Fallen', 'Mortal Shell', 'The Surge']
  },
  {
    c: 'Videojuegos desarrollados o publicados directamente por Valve Corporation',
    f: ['Half-Life', 'Portal', 'Counter-Strike', 'Left 4 Dead'],
    m: ['Team Fortress 2', 'Dota 2', 'Portal 2'],
    d: ['Day of Defeat', 'Ricochet', 'Alien Swarm'],
    t: ['Overwatch', 'Valorant', 'Apex Legends', 'BioShock', 'Fallout 3']
  },
  {
    c: 'Personajes protagonistas de la saga Resident Evil',
    f: ['Leon S. Kennedy', 'Jill Valentine', 'Chris Redfield', 'Claire Redfield'],
    m: ['Ethan Winters', 'Ada Wong', 'Albert Wesker'],
    d: ['Rebecca Chambers', 'Barry Burton', 'Carlos Oliveira'],
    t: ['Harry Mason', 'James Sunderland', 'Isaac Clarke', 'Alan Wake', 'Joel Miller']
  },
  {
    c: 'Videojuegos aclamados de terror psicológico o Survival Horror',
    f: ['Resident Evil 2', 'Silent Hill 2', 'Dead Space', 'Outlast'],
    m: ['Amnesia: The Dark Descent', 'Alien: Isolation', 'The Evil Within'],
    d: ['Alan Wake 2', 'Fatal Frame', 'SOMA'],
    t: ['Doom Eternal', 'Left 4 Dead 2', 'BioShock Infinite', 'Borderlands 3', 'Dying Light']
  },
  {
    c: 'Protagonistas principales de diferentes entregas de Final Fantasy',
    f: ['Cloud Strife', 'Squall Leonhart', 'Tidus', 'Noctis Lucis Caelum'],
    m: ['Zidane Tribal', 'Lightning', 'Clive Rosfield'],
    d: ['Terra Branford', 'Cecil Harvey', 'Vaan'],
    t: ['Sora', 'Roxas', 'Neku Sakuraba', 'Chocobo', 'Sephiroth']
  },
  {
    c: 'Campeones del videojuego League of Legends (LoL)',
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
    c: 'Personajes arcade legendarios nacidos entre 1970 y 1989',
    f: ['Pac-Man', 'Mario', 'Donkey Kong', 'Frogger'],
    m: ['Mega Man', 'Q*bert', 'Dig Dug'],
    d: ['Galaga', 'Space Invader', 'Pitfall Harry'],
    t: ['Sonic the Hedgehog', 'Crash Bandicoot', 'Lara Croft', 'Spyro', 'Rayman']
  },
  {
    c: 'Subtítulos de entregas de plataformas de Sonic the Hedgehog',
    f: ['Mania', 'Frontiers', 'Generations', 'Colors'],
    m: ['Adventure', 'Unleashed', 'Lost World'],
    d: ['Forces', 'Black Knight', 'Secret Rings'],
    t: ['All-Stars', 'Riders', 'Dash', 'Shuffle', 'Boom']
  },
  {
    c: 'Personajes pertenecientes al universo de Crash Bandicoot',
    f: ['Crash Bandicoot', 'Dr. Neo Cortex', 'Coco Bandicoot', 'Aku Aku'],
    m: ['Tiny Tiger', 'Dingodile', 'Uka Uka'],
    d: ['N. Gin', 'Dr. Nefarious Tropy', 'Ripper Roo'],
    t: ['Spyro', 'Sparx', 'Ripto', 'Gnasty Gnorc', 'Rayman']
  },
  {
    c: 'Subtítulos oficiales de entregas principales de Assassin\'s Creed',
    f: ['Black Flag', 'Valhalla', 'Origins', 'Odyssey'],
    m: ['Brotherhood', 'Mirage', 'Revelations'],
    d: ['Unity', 'Syndicate', 'Rogue'],
    t: ['Crusader', 'Templar', 'Inquisition', 'Shadows of Rome', 'Legacy']
  },
  {
    c: 'Protagonistas asesinos de la saga Assassin\'s Creed',
    f: ['Ezio Auditore', 'Altaïr Ibn-La\'Ahad', 'Edward Kenway', 'Connor Kenway'],
    m: ['Bayek de Siwa', 'Kassandra', 'Eivor Varinsdottir'],
    d: ['Arno Dorian', 'Jacob Frye', 'Basim Ibn Ishaq'],
    t: ['Kratos', 'Geralt de Rivia', 'Arthur Morgan', 'Joel Miller', 'Nathan Drake']
  },
  {
    c: 'Videojuegos aclamados del género Metroidvania (en 2D)',
    f: ['Castlevania: Symphony of the Night', 'Super Metroid', 'Hollow Knight', 'Metroid Dread'],
    m: ['Ori and the Blind Forest', 'Blasphemous', 'Bloodstained: Ritual of the Night'],
    d: ['Axiom Verge', 'Guacamelee!', 'Ender Lilies'],
    t: ['Dark Souls', 'Celeste', 'Dead Cells', 'Shovel Knight', 'Cuphead']
  },
  {
    c: 'Videojuegos pertenecientes a los subgéneros Roguelike o Roguelite',
    f: ['Hades', 'The Binding of Isaac', 'Dead Cells', 'Enter the Gungeon'],
    m: ['Slay the Spire', 'Rogue Legacy', 'Spelunky'],
    d: ['Risk of Rain 2', 'Returnal', 'Noita'],
    t: ['Hollow Knight', 'Cuphead', 'Celeste', 'Undertale', 'Ori and the Blind Forest']
  },
  {
    c: 'Videojuegos independientes (Indies) de gran éxito de crítica y ventas',
    f: ['Hollow Knight', 'Undertale', 'Celeste', 'Cuphead'],
    m: ['Stardew Valley', 'Hades', 'Inside'],
    d: ['Limbo', 'Braid', 'Disco Elysium'],
    t: ['Elden Ring', 'God of War', 'The Last of Us', 'Cyberpunk 2077', 'Overwatch']
  },
  {
    c: 'Subtítulos y entregas derivadas de la franquicia Fallout',
    f: ['New Vegas', 'Shelter', 'Tactics', 'Brotherhood of Steel'],
    m: ['London', '76', 'BoS'],
    d: ['Van Buren', 'Far Harbor', 'Nuka-World'],
    t: ['Exodus', 'Last Light', 'Clear Sky', 'Rage', 'Riptide']
  },
  {
    c: 'Nombres de ubicaciones, expansiones y entregas del universo BioShock',
    f: ['Infinite', 'Rapture', 'Columbia', 'Minerva\'s Den'],
    m: ['Burial at Sea', 'System Shock', 'Fontaine'],
    d: ['Andrew Ryan', 'Big Daddy', 'Little Sister'],
    t: ['Black Mesa', 'City 17', 'Dunwall', 'Karnaca', 'Talos I']
  },

  // 41 - 50: RPGs Japoneses (JRPGs) y Estrategia
  {
    c: 'Sagas emblemáticas del género JRPG (Rol Japonés)',
    f: ['Final Fantasy', 'Dragon Quest', 'Persona', 'Pokémon'],
    m: ['Kingdom Hearts', 'Tales of', 'Xenoblade Chronicles'],
    d: ['Shin Megami Tensei', 'Chrono Trigger', 'Fire Emblem'],
    t: ['The Elder Scrolls', 'The Witcher', 'Baldur\'s Gate', 'Fallout', 'Mass Effect']
  },
  {
    c: 'Subtítulos y versiones de la saga Persona (Atlus)',
    f: ['Golden', 'Royal', 'Reload', 'Strikers'],
    m: ['Innocent Sin', 'Eternal Punishment', 'Portable'],
    d: ['Tactics', 'Dancing All Night', 'Arena'],
    t: ['Apocalypse', 'Overclocked', 'Record Breaker', 'Soul Hackers', 'Vengeance']
  },
  {
    c: 'Videojuegos de estrategia en tiempo real (RTS)',
    f: ['Age of Empires II', 'StarCraft II', 'Warcraft III', 'Command & Conquer: Red Alert'],
    m: ['Age of Mythology', 'Company of Heroes', 'Total War: Warhammer'],
    d: ['Empire Earth', 'Rise of Nations', 'Supreme Commander'],
    t: ['Civilization VI', 'Heroes of Might and Magic III', 'XCOM 2', 'SimCity 4', 'Cities: Skylines']
  },
  {
    c: 'Videojuegos de estrategia por turnos (Turn-Based Strategy / 4X)',
    f: ['Civilization VI', 'Heroes of Might and Magic III', 'XCOM 2', 'Civilization V'],
    m: ['Total War', 'Endless Legend', 'Stellaris'],
    d: ['Age of Wonders 4', 'Master of Orion', 'Warlock: Master of the Arcane'],
    t: ['StarCraft II', 'Age of Empires II', 'Warcraft III', 'Command & Conquer', 'Company of Heroes']
  },
  {
    c: 'Videojuegos de simulación de construcción y gestión (Tycoon / City Builders)',
    f: ['SimCity 4', 'Cities: Skylines', 'RollerCoaster Tycoon', 'Planet Coaster'],
    m: ['Tropico 6', 'Frostpunk', 'Anno 1800'],
    d: ['Theme Hospital', 'Prison Architect', 'Surviving Mars'],
    t: ['Los Sims 4', 'Civilization VI', 'Command & Conquer', 'Doom', 'Portal 2']
  },
  {
    c: 'Subtítulos oficiales de entregas de Monster Hunter',
    f: ['World', 'Rise', 'Wilds', 'Generations'],
    m: ['Freedom Unite', 'Tri', 'Stories'],
    d: ['Iceborne', 'Sunbreak', 'Ultimate'],
    t: ['Ragnarok', 'Valhalla', 'Shadows', 'Awakening', 'Ascension']
  },
  {
    c: 'Monstruos representativos de la saga Monster Hunter',
    f: ['Rathalos', 'Rathian', 'Nergigante', 'Zinogre'],
    m: ['Tigrex', 'Diablos', 'Gore Magala'],
    d: ['Fatalis', 'Brachydios', 'Kirin'],
    t: ['Bahamut', 'Alduin', 'Deathwing', 'Ender Dragon', 'Charizard']
  },
  {
    c: 'Circuitos y pistas reales que aparecen en la saga Gran Turismo',
    f: ['Nürburgring Nordschleife', 'Circuit de la Sarthe (Le Mans)', 'Spa-Francorchamps', 'Suzuka Circuit'],
    m: ['Mount Panorama (Bathurst)', 'Laguna Seca', 'Monza'],
    d: ['Tsukuba Circuit', 'Interlagos', 'Goodwood Motor Circuit'],
    t: ['Rainbow Road', 'Mushroom Gorge', 'Coconut Mall', 'Choco Mountain', 'Toad\'s Turnpike']
  },
  {
    c: 'Sagas y títulos de conducción y carreras (Racing)',
    f: ['Need for Speed', 'Gran Turismo', 'Forza Horizon', 'Mario Kart'],
    m: ['Burnout', 'F1', 'Dirt Rally'],
    d: ['Assetto Corsa', 'Midnight Club', 'Ridge Racer'],
    t: ['Grand Theft Auto V', 'Rocket League', 'Twisted Metal', 'Crazy Taxi', 'Carmageddon']
  },
  {
    c: 'Videojuegos basados en puzles, ingenio y lógica espacial',
    f: ['Tetris', 'Portal', 'The Talos Principle', 'The Witness'],
    m: ['Portal 2', 'Baba Is You', 'Braid'],
    d: ['Stephen\'s Sausage Roll', 'Return of the Obra Dinn', 'Antichamber'],
    t: ['Candy Crush Saga', 'Half-Life 2', 'Super Mario World', 'Doom', 'Minecraft']
  },

  // 51 - 60: Terror, Aventuras Gráficas y Narrativa
  {
    c: 'Aventuras gráficas de la era dorada (Point and Click)',
    f: ['The Secret of Monkey Island', 'Maniac Mansion', 'Day of the Tentacle', 'Grim Fandango'],
    m: ['Monkey Island 2: LeChuck\'s Revenge', 'Indiana Jones and the Fate of Atlantis', 'Sam & Max Hit the Road'],
    d: ['The Dig', 'Full Throttle', 'Broken Sword: La sombra de los templarios'],
    t: ['Myst', 'Doom', 'Quake', 'Half-Life', 'Diablo']
  },
  {
    c: 'Videojuegos de aventuras cinemáticas y narrativa interactiva',
    f: ['Heavy Rain', 'Detroit: Become Human', 'Life is Strange', 'Until Dawn'],
    m: ['Beyond: Two Souls', 'The Walking Dead', 'The Wolf Among Us'],
    d: ['The Quarry', 'As Dusk Falls', 'Fahrenheit'],
    t: ['God of War', 'Uncharted 4', 'The Last of Us', 'Tomb Raider', 'Horizon Zero Dawn']
  },
  {
    c: 'Subtítulos de las entregas de aventuras de Uncharted',
    f: ['El tesoro de Drake', 'El reino de los ladrones', 'La traición de Drake', 'El desenlace del ladrón'],
    m: ['El legado perdido', 'El abismo de oro', 'Lucha por el tesoro'],
    d: ['Ojo de Indra', 'Legacy of Thieves', 'The Nathan Drake Collection'],
    t: ['Las arenas del tiempo', 'El alma del guerrero', 'Las dos coronas', 'La sombra de la tumba', 'El camino del ladrón']
  },
  {
    c: 'Subtítulos oficiales de entregas de Tomb Raider protagonizadas por Lara Croft',
    f: ['Rise of the Tomb Raider', 'Shadow of the Tomb Raider', 'Legend', 'Underworld'],
    m: ['Anniversary', 'The Last Revelation', 'Chronicles'],
    d: ['The Angel of Darkness', 'Guardian of Light', 'Temple of Osiris'],
    t: ['Uncharted', 'Horizon Zero Dawn', 'Mirror\'s Edge', 'Primal Hunter', 'Arkham Asylum']
  },
  {
    c: 'Videojuegos centrados en mecánicas de sigilo táctico e infiltración',
    f: ['Metal Gear Solid', 'Splinter Cell', 'Hitman', 'Dishonored'],
    m: ['Thief: The Dark Project', 'Deus Ex: Human Revolution', 'Metal Gear Solid V'],
    d: ['Mark of the Ninja', 'Styx: Master of Shadows', 'Sniper Elite 4'],
    t: ['Call of Duty', 'Doom Eternal', 'Gears of War', 'Wolfenstein', 'Borderlands']
  },
  {
    c: 'Subtítulos oficiales de entregas de Metal Gear Solid',
    f: ['Sons of Liberty', 'Snake Eater', 'Guns of the Patriots', 'The Phantom Pain'],
    m: ['Peace Walker', 'Ground Zeroes', 'The Twin Snakes'],
    d: ['Portable Ops', 'Ghost Babel', 'VR Missions'],
    t: ['Splinter Cell', 'Chaos Theory', 'Pandora Tomorrow', 'Double Agent', 'Conviction']
  },
  {
    c: 'Personajes de la saga Metal Gear Solid',
    f: ['Solid Snake', 'Big Boss', 'Revolver Ocelot', 'Liquid Snake'],
    m: ['Raiden', 'Otacon', 'Meryl Silverburgh'],
    d: ['Gray Fox', 'The Boss', 'Psycho Mantis'],
    t: ['Sam Fisher', 'Agente 47', 'Gabriel Logan', 'Chris Redfield', 'Leon S. Kennedy']
  },
  {
    c: 'Personajes jugables del videojuego Genshin Impact',
    f: ['Zhongli', 'Raiden Shogun', 'Hu Tao', 'Diluc'],
    m: ['Venti', 'Nahida', 'Furina'],
    d: ['Kaedehara Kazuha', 'Kamisato Ayaka', 'Neuvillette'],
    t: ['Kafka', 'Dan Heng', 'March 7th', 'Acheron', 'Jing Yuan']
  },
  {
    c: 'Videojuegos de rol multijugador masivo en línea (MMORPG)',
    f: ['World of Warcraft', 'Final Fantasy XIV', 'The Elder Scrolls Online', 'Guild Wars 2'],
    m: ['RuneScape', 'Black Desert Online', 'Lost Ark'],
    d: ['EVE Online', 'Lineage II', 'Tibia'],
    t: ['League of Legends', 'Diablo IV', 'Path of Exile', 'Destiny 2', 'Overwatch']
  },
  {
    c: 'Expansiones oficiales de World of Warcraft',
    f: ['The Burning Crusade', 'Wrath of the Lich King', 'Cataclysm', 'Mists of Pandaria'],
    m: ['Warlords of Draenor', 'Legion', 'Battle for Azeroth'],
    d: ['Shadowlands', 'Dragonflight', 'The War Within'],
    t: ['Reaper of Souls', 'Lord of Destruction', 'Heart of the Swarm', 'Legacy of the Void', 'The Frozen Throne']
  },

  // 61 - 70: Mundos Abiertos y Juegos de Rol de Acción
  {
    c: 'Videojuegos ARPG de vista isométrica (hack and slash)',
    f: ['Diablo II', 'Diablo IV', 'Path of Exile', 'Titan Quest'],
    m: ['Grim Dawn', 'Torchlight II', 'The Incredible Adventures of Van Helsing'],
    d: ['Last Epoch', 'Victor Vran', 'Dungeon Siege'],
    t: ['Dark Souls', 'Skyrim', 'The Witcher 3', 'Baldur\'s Gate 3', 'World of Warcraft']
  },
  {
    c: 'Clases de personajes presentes en Diablo II',
    f: ['Bárbaro', 'Hechicera', 'Nigromante', 'Paladín'],
    m: ['Amazona', 'Druida', 'Asesina'],
    d: ['Mago invocador', 'Guerrero sagrado', 'Lanzaflechas'],
    t: ['Monje', 'Cazador de demonios', 'Médico brujo', 'Cruzado', 'Pícaro']
  },
  {
    c: 'Subtítulos de entregas derivadas o secuelas de God of War',
    f: ['Ragnarök', 'Chains of Olympus', 'Ghost of Sparta', 'Ascension'],
    m: ['Betrayal', 'Valhalla', 'Collection'],
    d: ['Origins', 'Saga', 'Blood & Metal'],
    t: ['Dante\'s Inferno', 'Lords of Shadow', 'Darksiders', 'Asura\'s Wrath', 'Shadow of Rome']
  },
  {
    c: 'Dioses y figuras mitológicas que aparecen en la saga God of War',
    f: ['Ares', 'Zeus', 'Poseidón', 'Hades'],
    m: ['Thor', 'Odín', 'Baldur'],
    d: ['Helios', 'Hermes', 'Crono'],
    t: ['Anubis', 'Ra', 'Gilgamesh', 'Quetzalcóatl', 'Osiris']
  },
  {
    c: 'Subtítulos o ediciones especiales de la saga Devil May Cry',
    f: ['Dante\'s Awakening', 'Special Edition', 'HD Collection', 'DmC'],
    m: ['Peak of Combat', 'Vergil\'s Downfall', 'Definitive Edition'],
    d: ['Demon City', 'Trinity of Fate', 'Bloody Palace'],
    t: ['Bayonetta', 'Ninja Gaiden', 'Metal Gear Rising', 'Castlevania', 'Chaos Legion']
  },
  {
    c: 'Videojuegos de acción en mundo abierto ambientados en ciudades contemporáneas',
    f: ['Grand Theft Auto V', 'Watch Dogs', 'Sleeping Dogs', 'Saints Row: The Third'],
    m: ['Marvel\'s Spider-Man', 'Batman: Arkham Knight', 'Yakuza 0'],
    d: ['Infamous Second Son', 'Crackdown', 'The Division'],
    t: ['Red Dead Redemption 2', 'Skyrim', 'The Witcher 3', 'Assassin\'s Creed Valhalla', 'Horizon Zero Dawn']
  },
  {
    c: 'Subtítulos y expansiones de la franquicia Mass Effect',
    f: ['Andromeda', 'Lair of the Shadow Broker', 'Citadel', 'Leviathan'],
    m: ['Omega', 'From Ashes', 'Overlord'],
    d: ['Arrival', 'Infiltrator', 'Kasumi - Stolen Memory'],
    t: ['Shadowkeeper', 'Heart of the Swarm', 'Dragonfall', 'Cold Harbor', 'Reckoning']
  },
  {
    c: 'Compañeros de escuadrón que viajan en la Normandía en Mass Effect',
    f: ['Garrus Vakarian', 'Tali\'Zorah', 'Liara T\'Soni', 'Urdnot Wrex'],
    m: ['Miranda Lawson', 'Mordin Solus', 'Thane Krios'],
    d: ['Legion', 'Javik', 'Kasumi Goto'],
    t: ['Master Chief', 'Cortana', 'Marcus Fenix', 'Isaac Clarke', 'Gordon Freeman']
  },
  {
    c: 'Subtítulos, expansiones y spin-offs del universo The Witcher',
    f: ['Assassins of Kings', 'Wild Hunt', 'Hearts of Stone', 'Blood and Wine'],
    m: ['Thronebreaker', 'Gwent', 'Monster Slayer'],
    d: ['The Price of Neutrality', 'Side Effects', 'Sirens of the Deep'],
    t: ['Tears of the Kingdom', 'Shadow of the Erdtree', 'Dark Souls', 'Elden Ring', 'Dragon Age']
  },
  {
    c: 'Personajes con protagonismo en la trama de The Witcher 3: Wild Hunt',
    f: ['Geralt de Rivia', 'Ciri', 'Yennefer de Vengerberg', 'Triss Merigold'],
    m: ['Jaskier (Dandelion)', 'Vesemir', 'Barón Sanguinario'],
    d: ['Gaunter O\'Dimm', 'Emhyr var Emreis', 'Eredin'],
    t: ['Alduin', 'Paarthurnax', 'Sylvanas Brisaveloz', 'Arthas Menethil', 'Illidan Tempestira']
  },

  // 71 - 80: Nintendo, Mascotas y Aventuras Clásicas
  {
    c: 'Subtítulos de entregas de plataformas 3D de Super Mario',
    f: ['Sunshine', 'Galaxy', 'Odyssey', '3D World'],
    m: ['Galaxy 2', '3D Land', 'Bowser\'s Fury'],
    d: ['64 DS', '3D All-Stars', 'Land 2'],
    t: ['World', 'Bros 3', 'Maker', 'Kart', 'Wonder']
  },
  {
    c: 'Subtítulos de entregas de la serie Mario Kart',
    f: ['Double Dash!!', 'Deluxe', 'Super Circuit', 'Home Circuit'],
    m: ['Super', 'Tour', 'Live'],
    d: ['Arcade GP', 'Arcade GP 2', 'Arcade GP DX'],
    t: ['Crash Team Racing', 'Sonic Racing', 'Diddy Kong Racing', 'F-Zero', 'Wave Race']
  },
  {
    c: 'Subtítulos de entregas de la saga Metroid',
    f: ['Prime', 'Dread', 'Fusion', 'Zero Mission'],
    m: ['Echoes', 'Corruption', 'Samus Returns'],
    d: ['Other M', 'Federation Force', 'Hunters'],
    t: ['Combat Evolved', 'Mega Man X', 'Dead Space', 'Symphony of the Night', 'Star Fox']
  },
  {
    c: 'Subtítulos de entregas de la franquicia Donkey Kong',
    f: ['Country', 'Returns', 'Tropical Freeze', 'Jungle Beat'],
    m: ['Diddy\'s Kong Quest', 'Dixie Kong\'s Double Trouble!', 'Land'],
    d: ['King of Clout', 'Barrel Blast', 'Freeze'],
    t: ['Crash Bandicoot', 'Rayman Legends', 'Sonic the Hedgehog', 'Banjo-Kazooie', 'Spyro']
  },
  {
    c: 'Juegos de plataformas y aventuras desarrollados por Rare para Nintendo 64',
    f: ['Banjo-Kazooie', 'Donkey Kong 64', 'Banjo-Tooie', 'Conker\'s Bad Fur Day'],
    m: ['GoldenEye 007', 'Perfect Dark', 'Diddy Kong Racing'],
    d: ['Blast Corps', 'Jet Force Gemini', 'Killer Instinct Gold'],
    t: ['Super Mario 64', 'Ocarina of Time', 'Rayman 2', 'Spyro the Dragon', 'Crash Bandicoot']
  },
  {
    c: 'Subtítulos oficiales de la saga Animal Crossing',
    f: ['New Horizons', 'New Leaf', 'Wild World', 'City Folk'],
    m: ['Happy Home Designer', 'Pocket Camp', 'Amiibo Festival'],
    d: ['Happy Home Paradise', 'Dōbutsu no Mori', 'Plaza'],
    t: ['Bustin\' Out', 'Castaway', 'Urbz', 'Stardew', 'Harvest']
  },
  {
    c: 'Subtítulos y ediciones de la saga musical Guitar Hero',
    f: ['Legends of Rock', 'World Tour', 'Metallica', 'Warriors of Rock'],
    m: ['Smash Hits', 'Aerosmith', 'Van Halen'],
    d: ['Rocks the 80s', 'Live', 'Encore'],
    t: ['Beat Saber', 'Dance Central', 'Rocksmith', 'SingStar', 'Bandfuse']
  },
  {
    c: 'Subtítulos de expansiones clásicas de Los Sims 2 y 3',
    f: ['Mascotas', 'Universitarios', 'Y las cuatro estaciones', 'Noctámbulos'],
    m: ['Abren negocios', 'Comparten piso', 'Movida en la facultad'],
    d: ['Hacia el futuro', 'Al caer la noche', 'Trotamundos'],
    t: ['Cataclysm', 'Warlords', 'Reaper of Souls', 'Blood & Wine', 'Dawnguard']
  },
  {
    c: 'Videojuegos de realidad virtual (VR) galardonados o superventas',
    f: ['Half-Life: Alyx', 'Beat Saber', 'Superhot VR', 'Resident Evil 7 VR'],
    m: ['The Walking Dead: Saints & Sinners', 'Gran Turismo 7 VR', 'Astro Bot Rescue Mission'],
    d: ['Boneworks', 'Asgard\'s Wrath', 'Pavlov VR'],
    t: ['Portal 2', 'Cyberpunk 2077', 'Overwatch', 'Valorant', 'Counter-Strike 2']
  },
  {
    c: 'Sagas de videojuegos de deportes y simulación con entregas anuales',
    f: ['EA Sports FC', 'NBA 2K', 'Madden NFL', 'eFootball'],
    m: ['WWE 2K', 'MLB The Show', 'F1'],
    d: ['NHL', 'PGA Tour 2K', 'Football Manager'],
    t: ['Rocket League', 'Mario Strikers', 'Wii Sports', 'Captain Tsubasa', 'NBA Jam']
  },

  // 81 - 90: Clásicos Inolvidables y Sagaces Narrativas
  {
    c: 'Subtítulos de entregas de la saga de terror Silent Hill',
    f: ['The Room', 'Origins', 'Homecoming', 'Shattered Memories'],
    m: ['Downpour', 'Book of Memories', 'The Short Message'],
    d: ['Play Novel', 'Arcade', 'Ascension'],
    t: ['Nemesis', 'Outbreak', 'Biohazard', 'Code Veronica', 'Village']
  },
  {
    c: 'Subtítulos y nombres de entregas de Gears of War',
    f: ['Judgment', 'Tactics', 'Ultimate Edition', 'E-Day'],
    m: ['Hivebusters', 'Relic', 'POP!'],
    d: ['Exile', 'Dark Corners', 'Road to Ruin'],
    t: ['Reach', 'ODST', 'Infinite', 'Guardians', 'Combat Evolved']
  },
  {
    c: 'Personajes miembros de los Gear en Gears of War',
    f: ['Marcus Fenix', 'Dominic Santiago', 'Damon Baird', 'Augustus Cole'],
    m: ['Anya Stroud', 'Kait Diaz', 'JD Fenix'],
    d: ['Tai Kaliso', 'Minh Young Kim', 'Benjamin Carmine'],
    t: ['Master Chief', 'Sargento Johnson', 'Noble Seis', 'Doom Slayer', 'Isaac Clarke']
  },
  {
    c: 'Subtítulos de entregas de la franquicia Halo',
    f: ['Combat Evolved', 'Infinite', 'Reach', 'Guardians'],
    m: ['Spartan Assault', 'Spartan Strike', 'Wars'],
    d: ['Fireteam Raven', 'Cryptum', 'Nightfall'],
    t: ['Judgment', 'Tactics', 'Titanfall', 'Shadow Fall', 'Destiny']
  },
  {
    c: 'Personajes y razas clave en el lore del universo Halo',
    f: ['Master Chief', 'Cortana', 'El Inquisidor (Arbiter)', 'Sargento Johnson'],
    m: ['Sangheili (Elites)', 'Unggoy (Grunts)', 'El Flood'],
    d: ['El Didacta', 'Jacob Keyes', 'Catherine Halsey'],
    t: ['Marcus Fenix', 'Locust', 'Doom Slayer', 'Garrus Vakarian', 'Samus Aran']
  },
  {
    c: 'Subtítulos de entregas y expansiones de la saga Horizon (Guerrilla Games)',
    f: ['Zero Dawn', 'Forbidden West', 'Call of the Mountain', 'The Frozen Wilds'],
    m: ['Burning Shores', 'Remastered', 'Adventures'],
    d: ['Aloy\'s Journey', 'Carja Hunter', 'Sunstone'],
    t: ['The Phantom Pain', 'Shadow of the Colossus', 'Days Gone', 'Death Stranding', 'Ragnarök']
  },
  {
    c: 'Elementos y personajes de la aventura de samuráis Ghost of Tsushima',
    f: ['Jin Sakai', 'Isla de Iki', 'Señor Shimura', 'Legends'],
    m: ['Khotun Kan', 'Yuna', 'Taka'],
    d: ['Masako Adachi', 'Sensei Ishikawa', 'Norio'],
    t: ['Sekiro', 'Wolf', 'Isshin', 'Kuro', 'Genichiro']
  },
  {
    c: 'Videojuegos desarrollados por el estudio finlandés Remedy Entertainment',
    f: ['Max Payne', 'Alan Wake', 'Control', 'Alan Wake 2'],
    m: ['Quantum Break', 'Max Payne 2', 'American Nightmare'],
    d: ['Death Rally', 'AWE', 'The Signal'],
    t: ['Heavy Rain', 'Silent Hill 2', 'BioShock', 'Dead Space', 'Dishonored']
  },
  {
    c: 'Videojuegos dirigidos por el creador japonés Hidetaka Miyazaki',
    f: ['Demon\'s Souls', 'Dark Souls', 'Bloodborne', 'Elden Ring'],
    m: ['Dark Souls III', 'Sekiro: Shadows Die Twice', 'Shadow of the Erdtree'],
    d: ['Armored Core 4', 'For Answer', 'Déraciné'],
    t: ['Dark Souls II', 'Nioh', 'Dragon\'s Dogma', 'Monster Hunter: World', 'Lies of P']
  },
  {
    c: 'Subtítulos de entregas de la saga Kingdom Hearts',
    f: ['Chain of Memories', 'Birth by Sleep', 'Dream Drop Distance', 'Melody of Memory'],
    m: ['358/2 Days', 'Union χ', 'Dark Road'],
    d: ['Re:coded', 'Fragmentary Passage', 'Missing-Link'],
    t: ['Advent Children', 'Dirge of Cerberus', 'Crisis Core', 'Ever Crisis', 'Rebirth']
  },

  // 91 - 100: Iconos Pop, E-Sports y Fenómenos Culturales
  {
    c: 'Mapas competitivos del videojuego Counter-Strike',
    f: ['Dust II', 'Inferno', 'Mirage', 'Nuke'],
    m: ['Train', 'Overpass', 'Vertigo'],
    d: ['Ancient', 'Cobblestone', 'Anubis'],
    t: ['Ascent', 'Bind', 'Haven', 'Split', 'Terminal']
  },
  {
    c: 'Mapas de juego del shooter táctico Valorant',
    f: ['Ascent', 'Bind', 'Haven', 'Split'],
    m: ['Icebox', 'Breeze', 'Fracture'],
    d: ['Pearl', 'Lotus', 'Sunset'],
    t: ['Dust II', 'Inferno', 'Mirage', 'Nuke', 'Overpass']
  },
  {
    c: 'Mapas y escenarios del shooter heroico Overwatch',
    f: ['King\'s Row', 'Hanamura', 'Templo de Anubis', 'Ruta 66'],
    m: ['Observatorio: Gibraltar', 'Ilios', 'Eichenwalde'],
    d: ['Dorado', 'Numbani', 'Colosseo'],
    t: ['Dust II', 'Ascent', 'Inferno', 'Verdansk', 'Haven']
  },
  {
    c: 'Videojuegos de supervivencia con zombis en mundo abierto',
    f: ['DayZ', 'Project Zomboid', 'State of Decay 2', 'Dying Light'],
    m: ['Dead Island 2', '7 Days to Die', 'Days Gone'],
    d: ['Unturned', 'Dead Rising 3', 'SCUM'],
    t: ['Resident Evil 4', 'Left 4 Dead 2', 'The Last of Us', 'Doom Eternal', 'Fallout 4']
  },
  {
    c: 'Vehículos o carrocerías populares en Rocket League',
    f: ['Octane', 'Fennec', 'Dominus', 'Breakout'],
    m: ['Batmobile', 'Dingo', 'Skyline'],
    d: ['Merc', 'Gizmo', 'Paladin'],
    t: ['Banshee', 'Infernus', 'Turismo', 'Comet', 'Coquette']
  },
  {
    c: 'Minerales y recursos extraíbles en bloques de Minecraft',
    f: ['Diamante', 'Hierro', 'Oro', 'Carbón'],
    m: ['Redstone', 'Lapislázuli', 'Cobre'],
    d: ['Netherite', 'Esmeralda', 'Cuarzo'],
    t: ['Kriptonita', 'Adamantium', 'Mithril', 'Vibranium', 'Beskar']
  },
  {
    c: 'Jefes y criaturas temibles del videojuego Minecraft',
    f: ['Ender Dragon', 'Wither', 'Warden', 'Elder Guardian'],
    m: ['Evocador (Evoker)', 'Devastador (Ravager)', 'Iron Golem'],
    d: ['Piglin Brute', 'Endermite', 'Wither Skeleton'],
    t: ['Bowser', 'Herobrine', 'Cthulhu', 'Sephiroth', 'Alduin']
  },
  {
    c: 'Videojuegos de exploración espacial abierta y navegación astronómica',
    f: ['No Man\'s Sky', 'Elite Dangerous', 'Starfield', 'Kerbal Space Program'],
    m: ['Outer Wilds', 'Astroneer', 'Star Citizen'],
    d: ['X4: Foundations', 'Space Engineers', 'EVE Online'],
    t: ['Dead Space', 'Mass Effect 2', 'Alien: Isolation', 'Star Wars Jedi: Fallen Order', 'Doom 3']
  },
  {
    c: 'Personajes que aparecen en la saga Star Wars Jedi (Respawn)',
    f: ['Cal Kestis', 'BD-1', 'Cere Junda', 'Greez Dritus'],
    m: ['Trilla Suduri (Segunda Hermana)', 'Merrin', 'Bode Akuna'],
    d: ['Taron Malicos', 'Rayvis', 'Dagan Gera'],
    t: ['Starkiller', 'Kyle Katarn', 'Darth Revan', 'Bastila Shan', 'Jaden Korr']
  },
  {
    c: 'Diseñadores y directores de renombre en la historia del videojuego',
    f: ['Shigeru Miyamoto', 'Hideo Kojima', 'Gabe Newell', 'Hidetaka Miyazaki'],
    m: ['Todd Howard', 'Sam Houser', 'Masahiro Sakurai'],
    d: ['Shinji Mikami', 'Yuji Naka', 'John Carmack'],
    t: ['Elon Musk', 'Steve Jobs', 'Bill Gates', 'Mark Zuckerberg', 'Jeff Bezos']
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