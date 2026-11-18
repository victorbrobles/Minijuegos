// client/src/games/Emojis/banco.js
// «Biografía en emojis»: cada famoso con 5 emojis, de la pista más vaga a la más clara. Solo personas reales.
export const CATEGORIAS = {
  deporte: { nombre: 'Deporte', emoji: '🏅' },
  cine: { nombre: 'Cine y tele', emoji: '🎬' },
  musica: { nombre: 'Música', emoji: '🎤' },
  historia: { nombre: 'Historia, arte y ciencia', emoji: '📜' },
  otros: { nombre: 'Tecnología y otros', emoji: '💡' }
};

const L = (c, lista) => lista.map(([n, e]) => ({ n, c, e: e.split(' ') }));

export const BANCO = [
  ...L('deporte', [
    ['Lionel Messi', '🇦🇷 ⚽ 🐐 🏆 🔟'], ['Cristiano Ronaldo', '🇵🇹 ⚽ 💪 🏆 7️⃣'], ['Rafael Nadal', '🇪🇸 🎾 💪 🧱 🏆'],
    ['Usain Bolt', '🇯🇲 🏃 ⚡ 🥇 💨'], ['Michael Jordan', '🇺🇸 🏀 🐂 👟 2️⃣'], ['Fernando Alonso', '🇪🇸 🏎️ 🏁 3️⃣3️⃣ 🔵'],
    ['Pau Gasol', '🇪🇸 🏀 🗼 🇺🇸 💜'], ['Roger Federer', '🇨🇭 🎾 🧀 🎩 🏆'], ['Serena Williams', '🇺🇸 🎾 👭 💪 🏆'],
    ['Michael Phelps', '🇺🇸 🏊 🥇 🥇 🐬'], ['Simone Biles', '🇺🇸 🤸 🐐 🥇 ✨'], ['Muhammad Ali', '🇺🇸 🥊 🦋 🐝 🗣️'],
    ['Mike Tyson', '🇺🇸 🥊 👂 🦷 💥'], ['Diego Maradona', '🇦🇷 ⚽ ✋ 🔟 🇮🇹'], ['Pelé', '🇧🇷 ⚽ 👑 🔟 🏆'],
    ['Zinedine Zidane', '🇫🇷 ⚽ 🧑‍🦲 🐏 🏆'], ['Andrés Iniesta', '🇪🇸 ⚽ 🧑‍🦲 🥅 ⭐'], ['Iker Casillas', '🇪🇸 🧤 😇 🏆 ⚪'],
    ['Kylian Mbappé', '🇫🇷 ⚽ 🐢 💨 🙅'], ['Erling Haaland', '🇳🇴 ⚽ 🤖 🧘 ⚽'], ['Lamine Yamal', '🇪🇸 ⚽ 👦 🔵 🔴'],
    ['Carlos Alcaraz', '🇪🇸 🎾 👦 😁 🍑'], ['Marc Márquez', '🇪🇸 🏍️ 🐜 9️⃣3️⃣ 🏆'], ['Valentino Rossi', '🇮🇹 🏍️ 🐢 4️⃣6️⃣ 💛'],
    ['Lewis Hamilton', '🇬🇧 🏎️ 🐶 7️⃣ 🏆'], ['LeBron James', '🇺🇸 🏀 👑 2️⃣3️⃣ 🔥'], ['Tiger Woods', '🇺🇸 ⛳ 🐯 🔴 🏆'],
    ['David Beckham', '🇬🇧 ⚽ 🎯 💇 👰'], ['Ronaldinho', '🇧🇷 ⚽ 😁 🦷 🪄'], ['Novak Djokovic', '🇷🇸 🎾 🧘 🥇 🏆']
  ]),
  ...L('cine', [
    ['Leonardo DiCaprio', '🇺🇸 🎬 🚢 🧊 🐻'], ['Tom Cruise', '🇺🇸 🎬 ✈️ 🕶️ 🏃'], ['Penélope Cruz', '🇪🇸 🎬 🏆 💃 🍷'],
    ['Antonio Banderas', '🇪🇸 🎬 🗡️ 🐱 🥾'], ['Javier Bardem', '🇪🇸 🎬 💀 🪙 🏆'], ['Arnold Schwarzenegger', '🇦🇹 💪 🤖 🔫 🏛️'],
    ['Will Smith', '🇺🇸 🎬 👽 🕶️ 👋'], ['Keanu Reeves', '🇨🇦 🎬 💊 🐶 🔫'], ['Dwayne Johnson', '🇺🇸 🤼 🪨 💪 🤨'],
    ['Jackie Chan', '🇭🇰 🥋 🎬 🤸 😂'], ['Charles Chaplin', '🇬🇧 🎬 🎩 🦯 🤐'], ['Marilyn Monroe', '🇺🇸 🎬 👱‍♀️ 👗 💨'],
    ['Daniel Radcliffe', '🇬🇧 🎬 👓 ⚡ 🧹'], ['Emma Watson', '🇬🇧 🎬 📚 🪄 🌹'], ['Johnny Depp', '🇺🇸 🎬 🏴‍☠️ 🍫 ✂️'],
    ['Zendaya', '🇺🇸 🎬 🕷️ 🏜️ 👗'], ['Brad Pitt', '🇺🇸 🎬 🥊 🧼 🍷'], ['Tom Hanks', '🇺🇸 🎬 🏃 🍫 🏐'],
    ['Meryl Streep', '🇺🇸 🎬 👠 🏆 🏆'], ['Margot Robbie', '🇦🇺 🎬 💗 👱‍♀️ 🃏'], ['Morgan Freeman', '🇺🇸 🎬 🗣️ 🙏 🐧'],
    ['Pedro Almodóvar', '🇪🇸 🎬 🎥 🌈 🔴'], ['Steven Spielberg', '🇺🇸 🎥 🦖 🦈 👽'], ['Jim Carrey', '🇨🇦 🎬 🤪 🎭 💚'],
    ['Robin Williams', '🇺🇸 🎬 🧞 👵 😂']
  ]),
  ...L('musica', [
    ['Shakira', '🇨🇴 🎤 💃 🐺 🍑'], ['Rosalía', '🇪🇸 🎤 💅 🏍️ 🌹'], ['Bad Bunny', '🇵🇷 🎤 🐰 😎 🌴'],
    ['Taylor Swift', '🇺🇸 🎤 🎸 💔 🐍'], ['Beyoncé', '🇺🇸 🎤 🐝 👑 💍'], ['Lady Gaga', '🇺🇸 🎤 🥩 👗 ⭐'],
    ['Michael Jackson', '🇺🇸 🎤 🕺 🧤 🌕'], ['Madonna', '🇺🇸 🎤 👑 ✝️ 💃'], ['Elvis Presley', '🇺🇸 🎤 👑 🕺 🎸'],
    ['Freddie Mercury', '🇬🇧 🎤 👑 🎹 🥁'], ['Ed Sheeran', '🇬🇧 🎤 🎸 🦊 ➗'], ['Justin Bieber', '🇨🇦 🎤 👦 💜 😢'],
    ['Billie Eilish', '🇺🇸 🎤 💚 🖤 🕷️'], ['Ariana Grande', '🇺🇸 🎤 🐴 🎀 🙏'], ['Adele', '🇬🇧 🎤 🔥 💔 👋'],
    ['Eminem', '🇺🇸 🎤 🧢 🍝 ✈️'], ['Julio Iglesias', '🇪🇸 🎤 💃 🧔 😏'], ['Alejandro Sanz', '🇪🇸 🎤 🎸 💔 🧭'],
    ['Enrique Iglesias', '🇪🇸 🎤 🦸 💏 👨‍👦'], ['Bruno Mars', '🇺🇸 🎤 🕺 🎩 🌕'], ['Dua Lipa', '🇬🇧 🎤 🌙 💃 🍊'],
    ['Rihanna', '🇧🇧 🎤 ☂️ 💄 💎'], ['Bob Marley', '🇯🇲 🎤 🎸 🦁 🌿'], ['Mozart', '🇦🇹 🎹 👶 🎼 🎭'],
    ['Ludwig van Beethoven', '🇩🇪 🎹 🦻 🎼 5️⃣'], ['Paul McCartney', '🇬🇧 🎸 🪲 🎤 ❤️']
  ]),
  ...L('historia', [
    ['Albert Einstein', '🇩🇪 🧠 💡 ⏳ 👅'], ['Isaac Newton', '🇬🇧 🌳 🍎 ⬇️ 🔭'], ['Leonardo da Vinci', '🇮🇹 🎨 👩 😏 🚁'],
    ['Napoleón Bonaparte', '🇫🇷 👑 ⚔️ 🎩 🏝️'], ['Cristóbal Colón', '⛵ ⛵ ⛵ 🌎 🥚'], ['Marie Curie', '🇵🇱 🧪 ☢️ 🏆 🏆'],
    ['Charles Darwin', '🇬🇧 🐢 🏝️ 🐒 🧬'], ['Galileo Galilei', '🇮🇹 🔭 🌍 ☀️ 🔄'], ['William Shakespeare', '🇬🇧 ✍️ 🎭 💀 💑'],
    ['Miguel de Cervantes', '🇪🇸 ✍️ 🐴 🛡️ 🌬️'], ['Pablo Picasso', '🇪🇸 🎨 🟦 🔺 🐂'], ['Salvador Dalí', '🇪🇸 🎨 🥸 ⏰ 🫠'],
    ['Frida Kahlo', '🇲🇽 🎨 🌺 🤨 🪞'], ['Vincent van Gogh', '🇳🇱 🎨 🌻 ✨ 👂'], ['Cleopatra', '🇪🇬 👑 🐍 🏛️ 💄'],
    ['Julio César', '🏛️ ⚔️ 👑 🗡️ 🥗'], ['Nelson Mandela', '🇿🇦 ⛓️ 🕊️ ✊ 🏉'], ['Mahatma Gandhi', '🇮🇳 🕊️ 👓 🚶 🧂'],
    ['Martin Luther King', '🇺🇸 🗣️ 💭 ✊ 🕊️'], ['Nikola Tesla', '🇷🇸 ⚡ 💡 🗼 🕊️'], ['Neil Armstrong', '🇺🇸 🚀 🌕 👣 🧑‍🚀'],
    ['Stephen Hawking', '🇬🇧 🧠 🌌 ⚫ ♿'], ['Federico García Lorca', '🇪🇸 ✍️ 🌙 🐎 💚'], ['Francisco de Goya', '🇪🇸 🎨 👑 🦇 ⚫'],
    ['Isabel la Católica', '🇪🇸 👑 💑 ⛵ 🏰'], ['Abraham Lincoln', '🇺🇸 🎩 🧔 ⛓️ 💵']
  ]),
  ...L('otros', [
    ['Steve Jobs', '🇺🇸 💻 🍎 📱 👕'], ['Bill Gates', '🇺🇸 💻 🪟 💰 🦠'], ['Elon Musk', '🇿🇦 🚗 🚀 🐦 ❌'],
    ['Mark Zuckerberg', '🇺🇸 💻 👍 🎓 🥽'], ['Jeff Bezos', '🇺🇸 📦 💰 🚀 📚'], ['Amancio Ortega', '🇪🇸 👗 🏬 💰 🤫'],
    ['Walt Disney', '🇺🇸 ✏️ 🐭 🏰 🎬'], ['Coco Chanel', '🇫🇷 👗 👜 🌹 5️⃣'], ['Ferran Adrià', '🇪🇸 👨‍🍳 🧪 🫧 ⭐'],
    ['Oprah Winfrey', '🇺🇸 📺 🛋️ 🗣️ 🚗'], ['Greta Thunberg', '🇸🇪 🌍 🪧 🏫 😠'], ['Ibai Llanos', '🇪🇸 🎮 📹 ⚽ 🥊']
  ])
];
