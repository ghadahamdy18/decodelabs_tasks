/* ============================================================
   PickForMe — Recommendation Engine
   ============================================================
   Architecture:
     1. DATA LAYER   – 150+ items across 5 categories, each
                       tagged with genres, moods, and keywords.
     2. PREFERENCE   – Multi-step wizard collects user choices.
     3. MATCHING     – Weighted cosine-like similarity score
                       between user prefs and item tag vectors.
     4. DISPLAY      – Animated card grid with live filtering.
   ============================================================ */

"use strict";

// ── DATA ────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "movies",  emoji: "🎬", label: "Movies",       sub: "Blockbusters & Indies" },
  { id: "shows",   emoji: "📺", label: "TV Shows",     sub: "Binge-worthy series" },
  { id: "books",   emoji: "📚", label: "Books",         sub: "Fiction & Non-fiction" },
  { id: "games",   emoji: "🎮", label: "Video Games",   sub: "All platforms" },
  { id: "music",   emoji: "🎵", label: "Music Albums",  sub: "All genres & eras" },
];

const GENRES_MAP = {
  movies: [
    { id:"action",    emoji:"💥", label:"Action" },
    { id:"comedy",    emoji:"😂", label:"Comedy" },
    { id:"drama",     emoji:"🎭", label:"Drama" },
    { id:"scifi",     emoji:"🚀", label:"Sci-Fi" },
    { id:"horror",    emoji:"👻", label:"Horror" },
    { id:"romance",   emoji:"💕", label:"Romance" },
    { id:"thriller",  emoji:"🔪", label:"Thriller" },
    { id:"animation", emoji:"🖍️", label:"Animation" },
    { id:"fantasy",   emoji:"🧙", label:"Fantasy" },
    { id:"documentary",emoji:"🎥",label:"Documentary" },
  ],
  shows: [
    { id:"action",    emoji:"💥", label:"Action" },
    { id:"comedy",    emoji:"😂", label:"Comedy" },
    { id:"drama",     emoji:"🎭", label:"Drama" },
    { id:"scifi",     emoji:"🚀", label:"Sci-Fi" },
    { id:"horror",    emoji:"👻", label:"Horror" },
    { id:"crime",     emoji:"🕵️", label:"Crime" },
    { id:"fantasy",   emoji:"🧙", label:"Fantasy" },
    { id:"animation", emoji:"🖍️", label:"Animation" },
    { id:"reality",   emoji:"📡", label:"Reality" },
    { id:"documentary",emoji:"🎥",label:"Documentary" },
  ],
  books: [
    { id:"fiction",    emoji:"📖", label:"Fiction" },
    { id:"scifi",     emoji:"🚀", label:"Sci-Fi" },
    { id:"fantasy",   emoji:"🧙", label:"Fantasy" },
    { id:"mystery",   emoji:"🔍", label:"Mystery" },
    { id:"romance",   emoji:"💕", label:"Romance" },
    { id:"nonfiction",emoji:"📰", label:"Non-Fiction" },
    { id:"selfhelp",  emoji:"💡", label:"Self-Help" },
    { id:"horror",    emoji:"👻", label:"Horror" },
    { id:"biography", emoji:"👤", label:"Biography" },
    { id:"history",   emoji:"🏛️", label:"History" },
  ],
  games: [
    { id:"action",    emoji:"💥", label:"Action" },
    { id:"rpg",       emoji:"⚔️", label:"RPG" },
    { id:"strategy",  emoji:"🧠", label:"Strategy" },
    { id:"puzzle",    emoji:"🧩", label:"Puzzle" },
    { id:"adventure", emoji:"🗺️", label:"Adventure" },
    { id:"horror",    emoji:"👻", label:"Horror" },
    { id:"simulation",emoji:"🏗️", label:"Simulation" },
    { id:"sports",    emoji:"⚽", label:"Sports" },
    { id:"indie",     emoji:"🎨", label:"Indie" },
    { id:"multiplayer",emoji:"👥",label:"Multiplayer" },
  ],
  music: [
    { id:"pop",       emoji:"🎤", label:"Pop" },
    { id:"rock",      emoji:"🎸", label:"Rock" },
    { id:"hiphop",    emoji:"🎧", label:"Hip-Hop" },
    { id:"electronic",emoji:"🎛️", label:"Electronic" },
    { id:"jazz",      emoji:"🎷", label:"Jazz" },
    { id:"classical", emoji:"🎻", label:"Classical" },
    { id:"rnb",       emoji:"💜", label:"R&B" },
    { id:"indie",     emoji:"🎨", label:"Indie" },
    { id:"metal",     emoji:"🤘", label:"Metal" },
    { id:"country",   emoji:"🤠", label:"Country" },
  ],
};

const MOODS = [
  { id:"excited",    emoji:"⚡", label:"Excited & Thrilled" },
  { id:"relaxed",    emoji:"☁️",  label:"Relaxed & Chill" },
  { id:"thoughtful", emoji:"🤔", label:"Thoughtful & Deep" },
  { id:"happy",      emoji:"😊", label:"Happy & Uplifting" },
  { id:"dark",       emoji:"🌑", label:"Dark & Intense" },
  { id:"nostalgic",  emoji:"✨", label:"Nostalgic & Warm" },
  { id:"adventurous",emoji:"🧭", label:"Adventurous" },
  { id:"inspired",   emoji:"🔥", label:"Inspired & Motivated" },
];

const KEYWORDS = [
  { id:"critically_acclaimed", emoji:"⭐", label:"Critically Acclaimed" },
  { id:"hidden_gem",   emoji:"💎", label:"Hidden Gem" },
  { id:"classic",      emoji:"🏆", label:"Classic / Timeless" },
  { id:"recent",       emoji:"🆕", label:"Recent Release" },
  { id:"mind_bending", emoji:"🌀", label:"Mind-Bending" },
  { id:"feel_good",    emoji:"🌈", label:"Feel-Good" },
  { id:"epic",         emoji:"🏔️", label:"Epic & Grand" },
  { id:"short",        emoji:"⏱️", label:"Short & Sweet" },
  { id:"emotional",    emoji:"😢", label:"Emotional" },
  { id:"funny",        emoji:"🤣", label:"Laugh-Out-Loud" },
  { id:"visually_stunning",emoji:"🎨",label:"Visually Stunning" },
  { id:"great_story",  emoji:"📜", label:"Great Story" },
];

// ── ITEM DATABASE  (150+ items) ─────────────────────────────
const ITEMS = [
  // ───── MOVIES ─────
  { id:1,   cat:"movies", title:"Inception",               emoji:"🌀",  desc:"A thief enters dreams to plant ideas. Layers within layers.", genres:["scifi","action","thriller"], moods:["excited","thoughtful","dark"], keywords:["critically_acclaimed","mind_bending","epic","visually_stunning","great_story"] },
  { id:2,   cat:"movies", title:"The Grand Budapest Hotel", emoji:"🏨", desc:"A quirky concierge solves a murder in a pastel-colored world.", genres:["comedy","drama"], moods:["happy","nostalgic"], keywords:["critically_acclaimed","visually_stunning","funny"] },
  { id:3,   cat:"movies", title:"Interstellar",            emoji:"🪐",  desc:"A team journeys through a wormhole to save humanity.", genres:["scifi","drama"], moods:["thoughtful","adventurous","excited"], keywords:["critically_acclaimed","epic","visually_stunning","emotional","great_story"] },
  { id:4,   cat:"movies", title:"Spirited Away",           emoji:"🐉",  desc:"A girl enters a spirit world and must find her way back.", genres:["animation","fantasy"], moods:["adventurous","nostalgic","happy"], keywords:["critically_acclaimed","classic","visually_stunning","great_story"] },
  { id:5,   cat:"movies", title:"Get Out",                 emoji:"🧠",  desc:"A young man uncovers a disturbing secret at his girlfriend's family home.", genres:["horror","thriller"], moods:["dark","excited","thoughtful"], keywords:["critically_acclaimed","mind_bending","recent"] },
  { id:6,   cat:"movies", title:"La La Land",              emoji:"🌃",  desc:"Jazz and ambition collide in a bittersweet LA love story.", genres:["romance","drama","comedy"], moods:["happy","nostalgic","inspired"], keywords:["critically_acclaimed","visually_stunning","emotional","great_story"] },
  { id:7,   cat:"movies", title:"Mad Max: Fury Road",      emoji:"🔥",  desc:"A high-octane chase across a post-apocalyptic wasteland.", genres:["action","scifi"], moods:["excited","adventurous"], keywords:["critically_acclaimed","epic","visually_stunning"] },
  { id:8,   cat:"movies", title:"Parasite",                emoji:"🏠",  desc:"Two families from different classes become entangled.", genres:["drama","thriller","comedy"], moods:["dark","thoughtful"], keywords:["critically_acclaimed","mind_bending","great_story"] },
  { id:9,   cat:"movies", title:"The Shawshank Redemption",emoji:"⛓️",  desc:"Hope and friendship endure inside prison walls.", genres:["drama"], moods:["thoughtful","inspired","nostalgic"], keywords:["critically_acclaimed","classic","emotional","great_story"] },
  { id:10,  cat:"movies", title:"Spider-Man: Into the Spider-Verse",emoji:"🕷️", desc:"Miles Morales discovers the multiverse of Spider-People.", genres:["animation","action","comedy"], moods:["excited","happy","adventurous"], keywords:["critically_acclaimed","visually_stunning","feel_good","recent"] },
  { id:11,  cat:"movies", title:"Hereditary",              emoji:"😱",  desc:"A family unravels after a devastating loss reveals dark secrets.", genres:["horror","drama"], moods:["dark","thoughtful"], keywords:["critically_acclaimed","mind_bending","emotional"] },
  { id:12,  cat:"movies", title:"The Social Network",      emoji:"💻",  desc:"The founding of Facebook and the betrayals behind it.", genres:["drama","thriller"], moods:["thoughtful","inspired"], keywords:["critically_acclaimed","great_story"] },
  { id:13,  cat:"movies", title:"WALL-E",                  emoji:"🤖",  desc:"A lonely robot discovers love and reignites hope for Earth.", genres:["animation","scifi","romance"], moods:["happy","nostalgic","relaxed"], keywords:["critically_acclaimed","classic","feel_good","emotional","visually_stunning"] },
  { id:14,  cat:"movies", title:"The Dark Knight",         emoji:"🦇",  desc:"Batman faces the Joker in a battle for Gotham's soul.", genres:["action","drama","thriller"], moods:["dark","excited","thoughtful"], keywords:["critically_acclaimed","classic","epic","great_story"] },
  { id:15,  cat:"movies", title:"Everything Everywhere All At Once",emoji:"🥯",desc:"A laundromat owner discovers she's the key to the multiverse.", genres:["action","comedy","scifi","drama"], moods:["excited","happy","thoughtful"], keywords:["critically_acclaimed","mind_bending","emotional","funny","recent"] },
  { id:16,  cat:"movies", title:"Coco",                    emoji:"🎸",  desc:"A boy journeys to the Land of the Dead to find his musician ancestor.", genres:["animation","fantasy","drama"], moods:["happy","emotional","nostalgic"], keywords:["critically_acclaimed","visually_stunning","emotional","feel_good","great_story"] },
  { id:17,  cat:"movies", title:"Arrival",                 emoji:"👽",  desc:"A linguist must decode alien messages before time runs out.", genres:["scifi","drama"], moods:["thoughtful","dark","relaxed"], keywords:["critically_acclaimed","mind_bending","emotional","great_story"] },
  { id:18,  cat:"movies", title:"The Truman Show",         emoji:"📺",  desc:"A man discovers his entire life is a TV show.", genres:["drama","comedy"], moods:["thoughtful","nostalgic"], keywords:["critically_acclaimed","classic","mind_bending","great_story"] },
  { id:19,  cat:"movies", title:"John Wick",               emoji:"🐕",  desc:"A retired hitman goes on a vengeful rampage.", genres:["action","thriller"], moods:["excited","dark"], keywords:["epic","visually_stunning"] },
  { id:20,  cat:"movies", title:"Moonlight",               emoji:"🌙",  desc:"Three chapters in the life of a young man growing up in Miami.", genres:["drama"], moods:["thoughtful","dark","emotional"], keywords:["critically_acclaimed","emotional","visually_stunning","great_story"] },
  { id:21,  cat:"movies", title:"The Princess Bride",      emoji:"👸",  desc:"A fairy tale of fencing, giants, and true love.", genres:["comedy","fantasy","romance"], moods:["happy","nostalgic","adventurous"], keywords:["classic","feel_good","funny","great_story"] },
  { id:22,  cat:"movies", title:"Whiplash",                emoji:"🥁",  desc:"A drummer is pushed to the edge by a ruthless instructor.", genres:["drama"], moods:["excited","dark","inspired"], keywords:["critically_acclaimed","emotional","great_story"] },
  { id:23,  cat:"movies", title:"Your Name",               emoji:"☄️", desc:"Two strangers swap bodies across time and space.", genres:["animation","romance","fantasy"], moods:["happy","emotional","nostalgic"], keywords:["visually_stunning","emotional","great_story","feel_good"] },
  { id:24,  cat:"movies", title:"Dune (2021)",             emoji:"🏜️", desc:"A noble heir must navigate politics and war on a desert planet.", genres:["scifi","action","drama"], moods:["adventurous","excited","thoughtful"], keywords:["critically_acclaimed","epic","visually_stunning","recent","great_story"] },
  { id:25,  cat:"movies", title:"Amélie",                  emoji:"🍓",  desc:"A whimsical Parisian sets out to bring joy to others.", genres:["comedy","romance"], moods:["happy","nostalgic","relaxed"], keywords:["critically_acclaimed","classic","feel_good","visually_stunning"] },
  { id:26,  cat:"movies", title:"Knives Out",              emoji:"🔪",  desc:"A detective investigates a wealthy family after a suspicious death.", genres:["comedy","thriller"], moods:["excited","happy","thoughtful"], keywords:["critically_acclaimed","funny","great_story","recent"] },
  { id:27,  cat:"movies", title:"The Matrix",              emoji:"💊",  desc:"A hacker discovers reality is a simulation.", genres:["scifi","action"], moods:["excited","thoughtful","adventurous"], keywords:["critically_acclaimed","classic","mind_bending","epic"] },
  { id:28,  cat:"movies", title:"Jojo Rabbit",             emoji:"🐇",  desc:"A boy in WWII has an imaginary friend — Adolf Hitler.", genres:["comedy","drama"], moods:["happy","thoughtful","emotional"], keywords:["critically_acclaimed","funny","emotional","great_story","recent"] },
  { id:29,  cat:"movies", title:"Planet Earth (Film)",     emoji:"🌍",  desc:"Breathtaking visuals of our planet's wild places.", genres:["documentary"], moods:["relaxed","adventurous","inspired"], keywords:["critically_acclaimed","visually_stunning","epic"] },
  { id:30,  cat:"movies", title:"A Quiet Place",           emoji:"🤫",  desc:"A family survives in silence to hide from creatures that hunt by sound.", genres:["horror","thriller","scifi"], moods:["dark","excited"], keywords:["mind_bending","recent","great_story"] },

  // ───── TV SHOWS ─────
  { id:31,  cat:"shows", title:"Breaking Bad",            emoji:"🧪",  desc:"A chemistry teacher turns drug lord.", genres:["drama","crime"], moods:["dark","excited","thoughtful"], keywords:["critically_acclaimed","classic","great_story","epic"] },
  { id:32,  cat:"shows", title:"Stranger Things",         emoji:"🔦",  desc:"Kids in the '80s battle creatures from an alternate dimension.", genres:["scifi","horror","drama"], moods:["excited","nostalgic","adventurous"], keywords:["critically_acclaimed","feel_good","great_story"] },
  { id:33,  cat:"shows", title:"The Office (US)",         emoji:"🏢",  desc:"A mockumentary about everyday office life.", genres:["comedy"], moods:["happy","relaxed","nostalgic"], keywords:["classic","funny","feel_good"] },
  { id:34,  cat:"shows", title:"Game of Thrones",         emoji:"🐲",  desc:"Noble families fight for control of a mythical kingdom.", genres:["fantasy","drama","action"], moods:["excited","dark","adventurous"], keywords:["critically_acclaimed","epic","great_story","visually_stunning"] },
  { id:35,  cat:"shows", title:"Ted Lasso",               emoji:"⚽",  desc:"An American football coach leads a British soccer team.", genres:["comedy","drama"], moods:["happy","inspired","relaxed"], keywords:["critically_acclaimed","feel_good","funny","recent"] },
  { id:36,  cat:"shows", title:"Black Mirror",            emoji:"📱",  desc:"Anthology exploring technology's dark side.", genres:["scifi","drama","horror"], moods:["dark","thoughtful"], keywords:["critically_acclaimed","mind_bending","great_story"] },
  { id:37,  cat:"shows", title:"Arcane",                  emoji:"⚙️", desc:"Two sisters clash in a steampunk city fueled by magic.", genres:["animation","action","fantasy"], moods:["excited","dark","emotional"], keywords:["critically_acclaimed","visually_stunning","great_story","recent","epic"] },
  { id:38,  cat:"shows", title:"The Bear",                emoji:"🍳",  desc:"A fine-dining chef takes over his family's sandwich shop.", genres:["drama","comedy"], moods:["excited","thoughtful","inspired"], keywords:["critically_acclaimed","emotional","recent","great_story"] },
  { id:39,  cat:"shows", title:"True Detective S1",       emoji:"🕵️", desc:"Two detectives track a serial killer across decades.", genres:["crime","drama"], moods:["dark","thoughtful"], keywords:["critically_acclaimed","classic","mind_bending","great_story"] },
  { id:40,  cat:"shows", title:"Fleabag",                 emoji:"💔",  desc:"A woman navigates grief, love, and family chaos in London.", genres:["comedy","drama"], moods:["happy","thoughtful","emotional"], keywords:["critically_acclaimed","funny","emotional","short","great_story"] },
  { id:41,  cat:"shows", title:"Avatar: The Last Airbender",emoji:"🌊",desc:"A young monk must master all four elements to save the world.", genres:["animation","fantasy","action"], moods:["adventurous","happy","inspired"], keywords:["critically_acclaimed","classic","epic","feel_good","great_story"] },
  { id:42,  cat:"shows", title:"Succession",              emoji:"💰",  desc:"A media dynasty's children vie for control of their father's empire.", genres:["drama"], moods:["dark","thoughtful","excited"], keywords:["critically_acclaimed","great_story","recent"] },
  { id:43,  cat:"shows", title:"The Mandalorian",         emoji:"🪖",  desc:"A lone bounty hunter protects a mysterious child across the galaxy.", genres:["scifi","action","fantasy"], moods:["adventurous","excited","nostalgic"], keywords:["visually_stunning","epic","feel_good","recent"] },
  { id:44,  cat:"shows", title:"Chernobyl",               emoji:"☢️",  desc:"The true story of the 1986 nuclear disaster.", genres:["drama","documentary"], moods:["dark","thoughtful"], keywords:["critically_acclaimed","emotional","great_story","short"] },
  { id:45,  cat:"shows", title:"Brooklyn Nine-Nine",      emoji:"🚔",  desc:"Detectives solve crimes — and crack jokes — in NYC.", genres:["comedy","crime"], moods:["happy","relaxed"], keywords:["funny","feel_good"] },
  { id:46,  cat:"shows", title:"Squid Game",              emoji:"🦑",  desc:"Desperate players compete in deadly children's games.", genres:["drama","action"], moods:["dark","excited"], keywords:["mind_bending","recent","great_story"] },
  { id:47,  cat:"shows", title:"Our Planet",              emoji:"🦁",  desc:"David Attenborough narrates Earth's natural wonders.", genres:["documentary"], moods:["relaxed","adventurous","inspired"], keywords:["critically_acclaimed","visually_stunning","epic"] },
  { id:48,  cat:"shows", title:"The Haunting of Hill House",emoji:"🏚️",desc:"A family confronts the ghosts of their old home.", genres:["horror","drama"], moods:["dark","emotional","thoughtful"], keywords:["critically_acclaimed","emotional","great_story"] },
  { id:49,  cat:"shows", title:"Severance",               emoji:"🧠",  desc:"Workers' memories are surgically split between work and home.", genres:["scifi","drama"], moods:["dark","thoughtful","excited"], keywords:["critically_acclaimed","mind_bending","recent","great_story"] },
  { id:50,  cat:"shows", title:"Schitt's Creek",          emoji:"🌹",  desc:"A wealthy family loses everything and moves to a small town.", genres:["comedy"], moods:["happy","relaxed","nostalgic"], keywords:["feel_good","funny","emotional","great_story"] },
  { id:51,  cat:"shows", title:"The Last of Us",          emoji:"🍄",  desc:"A hardened survivor escorts a teenager across a fungal wasteland.", genres:["drama","action","horror"], moods:["dark","emotional","adventurous"], keywords:["critically_acclaimed","recent","great_story","emotional","epic"] },
  { id:52,  cat:"shows", title:"Bojack Horseman",         emoji:"🐴",  desc:"A washed-up sitcom star navigates fame, addiction, and existential dread.", genres:["animation","comedy","drama"], moods:["dark","thoughtful","emotional"], keywords:["critically_acclaimed","great_story","funny","emotional"] },
  { id:53,  cat:"shows", title:"Peaky Blinders",          emoji:"🎩",  desc:"A gangster family rises to power in post-WWI Birmingham.", genres:["crime","drama","action"], moods:["dark","excited","nostalgic"], keywords:["critically_acclaimed","epic","visually_stunning","great_story"] },
  { id:54,  cat:"shows", title:"The Great British Bake Off",emoji:"🧁",desc:"Amateur bakers compete in the friendliest contest on TV.", genres:["reality","comedy"], moods:["relaxed","happy"], keywords:["feel_good","funny"] },
  { id:55,  cat:"shows", title:"Dark",                    emoji:"⏳",  desc:"A German town unravels time-travel mysteries across generations.", genres:["scifi","drama"], moods:["dark","thoughtful"], keywords:["critically_acclaimed","mind_bending","great_story","hidden_gem"] },

  // ───── BOOKS ─────
  { id:56,  cat:"books", title:"Dune",                    emoji:"🏜️", desc:"Political intrigue and survival on a harsh desert world.", genres:["scifi","fiction"], moods:["adventurous","thoughtful","excited"], keywords:["critically_acclaimed","classic","epic","great_story"] },
  { id:57,  cat:"books", title:"The Hobbit",              emoji:"🧙",  desc:"A homebody hobbit goes on an unexpected adventure.", genres:["fantasy","fiction"], moods:["adventurous","happy","nostalgic"], keywords:["classic","feel_good","great_story","epic"] },
  { id:58,  cat:"books", title:"1984",                    emoji:"👁️",  desc:"A dystopian world where Big Brother watches everything.", genres:["fiction","scifi"], moods:["dark","thoughtful"], keywords:["critically_acclaimed","classic","mind_bending","great_story"] },
  { id:59,  cat:"books", title:"Atomic Habits",           emoji:"⚛️", desc:"Tiny changes, remarkable results — build better habits.", genres:["selfhelp","nonfiction"], moods:["inspired","thoughtful","relaxed"], keywords:["critically_acclaimed","recent","short"] },
  { id:60,  cat:"books", title:"Project Hail Mary",       emoji:"🚀",  desc:"A lone astronaut must save Earth — if he can remember how.", genres:["scifi","fiction"], moods:["excited","adventurous","happy"], keywords:["critically_acclaimed","recent","great_story","funny"] },
  { id:61,  cat:"books", title:"Gone Girl",               emoji:"💍",  desc:"A wife disappears. Her husband is suspect #1.", genres:["mystery","fiction"], moods:["dark","excited","thoughtful"], keywords:["critically_acclaimed","mind_bending","great_story"] },
  { id:62,  cat:"books", title:"Sapiens",                 emoji:"🧬",  desc:"A brief history of humankind, from fire to AI.", genres:["nonfiction","history"], moods:["thoughtful","inspired"], keywords:["critically_acclaimed","great_story","epic"] },
  { id:63,  cat:"books", title:"The Night Circus",        emoji:"🎪",  desc:"Two young magicians compete in an enchanted circus.", genres:["fantasy","fiction","romance"], moods:["nostalgic","relaxed","happy"], keywords:["visually_stunning","great_story","hidden_gem"] },
  { id:64,  cat:"books", title:"Educated",                emoji:"🎓",  desc:"A woman escapes a survivalist family to earn a PhD.", genres:["biography","nonfiction"], moods:["inspired","thoughtful","dark"], keywords:["critically_acclaimed","emotional","great_story","recent"] },
  { id:65,  cat:"books", title:"The Hitchhiker's Guide",  emoji:"🐬",  desc:"Earth is destroyed; luckily, Arthur Dent hitchhikes through space.", genres:["scifi","fiction"], moods:["happy","relaxed","adventurous"], keywords:["classic","funny","great_story"] },
  { id:66,  cat:"books", title:"Mexican Gothic",          emoji:"🏚️", desc:"A socialite investigates a haunted estate in 1950s Mexico.", genres:["horror","fiction","mystery"], moods:["dark","excited"], keywords:["hidden_gem","recent","visually_stunning","great_story"] },
  { id:67,  cat:"books", title:"Klara and the Sun",       emoji:"☀️", desc:"An artificial friend observes humanity from a store window.", genres:["scifi","fiction"], moods:["thoughtful","relaxed","emotional"], keywords:["critically_acclaimed","recent","emotional","great_story"] },
  { id:68,  cat:"books", title:"The Alchemist",           emoji:"✨",  desc:"A shepherd follows his Personal Legend across the desert.", genres:["fiction","fantasy"], moods:["inspired","adventurous","happy"], keywords:["classic","great_story","feel_good","short"] },
  { id:69,  cat:"books", title:"Becoming",                emoji:"📝",  desc:"Michelle Obama's intimate memoir of growth and purpose.", genres:["biography","nonfiction"], moods:["inspired","thoughtful","nostalgic"], keywords:["critically_acclaimed","emotional","great_story","recent"] },
  { id:70,  cat:"books", title:"The Name of the Wind",    emoji:"🍃",  desc:"A legendary figure tells his own story from the beginning.", genres:["fantasy","fiction"], moods:["adventurous","nostalgic","excited"], keywords:["great_story","epic","hidden_gem"] },
  { id:71,  cat:"books", title:"Piranesi",                emoji:"🏛️", desc:"A man lives alone in an endless labyrinth of halls and statues.", genres:["fantasy","fiction","mystery"], moods:["thoughtful","relaxed","adventurous"], keywords:["critically_acclaimed","hidden_gem","mind_bending","short","recent"] },
  { id:72,  cat:"books", title:"A Man Called Ove",         emoji:"🧓",  desc:"A grumpy old man's life is changed by lively new neighbors.", genres:["fiction"], moods:["happy","nostalgic","emotional"], keywords:["feel_good","emotional","funny","great_story","hidden_gem"] },
  { id:73,  cat:"books", title:"The Silent Patient",      emoji:"🤐",  desc:"A woman shoots her husband and never speaks again.", genres:["mystery","fiction"], moods:["dark","excited","thoughtful"], keywords:["mind_bending","recent","great_story"] },
  { id:74,  cat:"books", title:"Thinking, Fast and Slow", emoji:"🧠",  desc:"Nobel laureate reveals how our minds make decisions.", genres:["nonfiction","selfhelp"], moods:["thoughtful","inspired"], keywords:["critically_acclaimed","classic","great_story"] },
  { id:75,  cat:"books", title:"The Seven Husbands of Evelyn Hugo",emoji:"💃",desc:"A reclusive movie star finally tells her scandalous true story.", genres:["fiction","romance"], moods:["emotional","nostalgic","excited"], keywords:["great_story","emotional","hidden_gem","recent"] },
  { id:76,  cat:"books", title:"Circe",                   emoji:"🏺",  desc:"The witch of Greek mythology tells her own epic story.", genres:["fantasy","fiction"], moods:["adventurous","thoughtful","inspired"], keywords:["critically_acclaimed","great_story","epic","recent"] },
  { id:77,  cat:"books", title:"The Martian",             emoji:"🔴",  desc:"An astronaut stranded on Mars must science his way home.", genres:["scifi","fiction"], moods:["excited","happy","adventurous"], keywords:["great_story","funny","recent"] },
  { id:78,  cat:"books", title:"Frankenstein",            emoji:"⚡",  desc:"A scientist creates life — and faces the consequences.", genres:["horror","fiction","scifi"], moods:["dark","thoughtful"], keywords:["classic","great_story","emotional"] },
  { id:79,  cat:"books", title:"Where the Crawdads Sing", emoji:"🦞",  desc:"A reclusive marsh girl becomes a murder suspect.", genres:["fiction","mystery"], moods:["nostalgic","thoughtful","emotional"], keywords:["great_story","emotional","recent","visually_stunning"] },
  { id:80,  cat:"books", title:"Meditations",             emoji:"🏛️", desc:"Marcus Aurelius' timeless reflections on life and duty.", genres:["nonfiction","selfhelp","history"], moods:["thoughtful","inspired","relaxed"], keywords:["classic","short","great_story"] },

  // ───── GAMES ─────
  { id:81,  cat:"games", title:"The Witcher 3",           emoji:"⚔️", desc:"A monster hunter searches for his adopted daughter.", genres:["rpg","action","adventure"], moods:["adventurous","excited","dark"], keywords:["critically_acclaimed","epic","great_story","visually_stunning"] },
  { id:82,  cat:"games", title:"Stardew Valley",          emoji:"🌾",  desc:"Inherit a farm and build a new life in a charming town.", genres:["simulation","indie","rpg"], moods:["relaxed","happy","nostalgic"], keywords:["hidden_gem","feel_good","classic"] },
  { id:83,  cat:"games", title:"The Legend of Zelda: TOTK",emoji:"🗡️",desc:"Explore a vast sky-and-surface world with creative building.", genres:["adventure","action","puzzle"], moods:["adventurous","excited","happy"], keywords:["critically_acclaimed","epic","visually_stunning","recent"] },
  { id:84,  cat:"games", title:"Hades",                   emoji:"🔥",  desc:"Defy the god of death in a rogue-like dungeon escape.", genres:["action","rpg","indie"], moods:["excited","adventurous"], keywords:["critically_acclaimed","great_story","visually_stunning","recent"] },
  { id:85,  cat:"games", title:"Red Dead Redemption 2",   emoji:"🤠",  desc:"An outlaw gang's last stand in a changing America.", genres:["action","adventure","rpg"], moods:["adventurous","dark","nostalgic"], keywords:["critically_acclaimed","epic","great_story","visually_stunning","emotional"] },
  { id:86,  cat:"games", title:"Portal 2",                emoji:"🟠",  desc:"Solve physics puzzles with a portal gun and a sarcastic AI.", genres:["puzzle","adventure"], moods:["happy","thoughtful"], keywords:["critically_acclaimed","classic","funny","mind_bending","great_story"] },
  { id:87,  cat:"games", title:"Hollow Knight",           emoji:"🪲",  desc:"Explore a vast, haunted underground insect kingdom.", genres:["action","adventure","indie"], moods:["adventurous","dark","thoughtful"], keywords:["critically_acclaimed","hidden_gem","visually_stunning","epic"] },
  { id:88,  cat:"games", title:"Celeste",                 emoji:"⛰️", desc:"Climb a mountain — and face your inner demons.", genres:["indie","puzzle","action"], moods:["inspired","excited","emotional"], keywords:["critically_acclaimed","hidden_gem","emotional","great_story","short"] },
  { id:89,  cat:"games", title:"Civilization VI",         emoji:"🏛️", desc:"Build a civilization from the Stone Age to the Space Age.", genres:["strategy","simulation"], moods:["thoughtful","adventurous"], keywords:["critically_acclaimed","epic","classic"] },
  { id:90,  cat:"games", title:"Elden Ring",              emoji:"🌳",  desc:"Explore a shattered fantasy world designed by Miyazaki & GRRM.", genres:["rpg","action","adventure"], moods:["adventurous","dark","excited"], keywords:["critically_acclaimed","epic","visually_stunning","recent","great_story"] },
  { id:91,  cat:"games", title:"Undertale",               emoji:"💛",  desc:"A child falls into a world of monsters — fight or befriend.", genres:["rpg","indie","puzzle"], moods:["happy","thoughtful","emotional"], keywords:["hidden_gem","funny","emotional","great_story","short"] },
  { id:92,  cat:"games", title:"Animal Crossing: New Horizons",emoji:"🏝️",desc:"Build your island paradise at your own pace.", genres:["simulation","indie"], moods:["relaxed","happy","nostalgic"], keywords:["feel_good","recent"] },
  { id:93,  cat:"games", title:"Resident Evil Village",   emoji:"🧛",  desc:"Survive horrors in a mysterious European village.", genres:["horror","action"], moods:["dark","excited"], keywords:["visually_stunning","recent"] },
  { id:94,  cat:"games", title:"It Takes Two",            emoji:"💑",  desc:"A co-op adventure about a couple trying to save their marriage.", genres:["adventure","puzzle"], moods:["happy","excited","emotional"], keywords:["critically_acclaimed","feel_good","funny","recent","great_story"] },
  { id:95,  cat:"games", title:"Disco Elysium",           emoji:"🕵️", desc:"Solve a murder as a detective with amnesia in a surreal city.", genres:["rpg","adventure","indie"], moods:["dark","thoughtful","adventurous"], keywords:["critically_acclaimed","great_story","mind_bending","hidden_gem"] },
  { id:96,  cat:"games", title:"FIFA / EA FC",            emoji:"⚽",  desc:"The world's most popular football simulation.", genres:["sports","simulation","multiplayer"], moods:["excited","happy"], keywords:["classic","recent"] },
  { id:97,  cat:"games", title:"Minecraft",               emoji:"⛏️", desc:"Build anything you can imagine in an infinite blocky world.", genres:["adventure","simulation","multiplayer"], moods:["relaxed","happy","adventurous"], keywords:["classic","feel_good","epic"] },
  { id:98,  cat:"games", title:"Ghost of Tsushima",       emoji:"⛩️", desc:"A samurai fights to liberate his homeland from invaders.", genres:["action","adventure","rpg"], moods:["adventurous","excited","nostalgic"], keywords:["visually_stunning","epic","great_story","emotional"] },
  { id:99,  cat:"games", title:"Outer Wilds",             emoji:"🌌",  desc:"Explore a solar system stuck in a 22-minute time loop.", genres:["adventure","puzzle","indie"], moods:["adventurous","thoughtful","relaxed"], keywords:["critically_acclaimed","hidden_gem","mind_bending","great_story"] },
  { id:100, cat:"games", title:"Baldur's Gate 3",         emoji:"🐙",  desc:"A deep RPG with branching stories and turn-based combat.", genres:["rpg","strategy","adventure"], moods:["adventurous","excited","thoughtful"], keywords:["critically_acclaimed","epic","great_story","recent"] },
  { id:101, cat:"games", title:"Ori and the Will of the Wisps",emoji:"🌿",desc:"A heartfelt platformer in a hand-painted forest.", genres:["adventure","indie","action"], moods:["emotional","adventurous","relaxed"], keywords:["critically_acclaimed","visually_stunning","emotional","great_story"] },
  { id:102, cat:"games", title:"Among Us",                emoji:"🚀",  desc:"Find the impostor before they eliminate everyone.", genres:["multiplayer","puzzle","indie"], moods:["excited","happy"], keywords:["funny","short","recent"] },
  { id:103, cat:"games", title:"Death Stranding",         emoji:"📦",  desc:"Reconnect a fractured America by delivering packages.", genres:["action","adventure"], moods:["thoughtful","dark","adventurous"], keywords:["mind_bending","visually_stunning","epic","great_story"] },
  { id:104, cat:"games", title:"Factorio",                emoji:"🏭",  desc:"Automate a factory on an alien planet.", genres:["strategy","simulation","indie"], moods:["thoughtful","relaxed"], keywords:["hidden_gem","epic","classic"] },
  { id:105, cat:"games", title:"Horizon Forbidden West",  emoji:"🦕",  desc:"A hunter explores a lush post-apocalyptic world of machine beasts.", genres:["action","adventure","rpg"], moods:["adventurous","excited"], keywords:["visually_stunning","epic","recent","great_story"] },

  // ───── MUSIC ALBUMS ─────
  { id:106, cat:"music", title:"OK Computer — Radiohead",           emoji:"💻",  desc:"Art-rock masterpiece about technology and alienation.", genres:["rock","indie"], moods:["thoughtful","dark"], keywords:["critically_acclaimed","classic","mind_bending","great_story"] },
  { id:107, cat:"music", title:"To Pimp a Butterfly — Kendrick Lamar",emoji:"🦋",desc:"A jazz-infused hip-hop epic about identity and race.", genres:["hiphop","jazz"], moods:["thoughtful","inspired","dark"], keywords:["critically_acclaimed","great_story","epic"] },
  { id:108, cat:"music", title:"Random Access Memories — Daft Punk",emoji:"🤖",desc:"A lush tribute to disco and funk by electronic pioneers.", genres:["electronic","pop"], moods:["happy","nostalgic","relaxed"], keywords:["critically_acclaimed","classic","visually_stunning","feel_good"] },
  { id:109, cat:"music", title:"Blonde — Frank Ocean",              emoji:"🌊",  desc:"Intimate, dreamy R&B exploring love and loss.", genres:["rnb","pop","indie"], moods:["thoughtful","relaxed","emotional"], keywords:["critically_acclaimed","emotional","hidden_gem","great_story"] },
  { id:110, cat:"music", title:"Rumours — Fleetwood Mac",           emoji:"🎶",  desc:"Heartbreak and harmony forged in the studio.", genres:["rock","pop"], moods:["nostalgic","emotional","happy"], keywords:["critically_acclaimed","classic","great_story","emotional"] },
  { id:111, cat:"music", title:"good kid, m.A.A.d city — Kendrick", emoji:"🏙️", desc:"A coming-of-age story set in Compton.", genres:["hiphop"], moods:["thoughtful","dark","inspired"], keywords:["critically_acclaimed","great_story","classic","emotional"] },
  { id:112, cat:"music", title:"Future Nostalgia — Dua Lipa",       emoji:"💃",  desc:"Retro-futuristic pop built for dancing.", genres:["pop","electronic"], moods:["happy","excited","nostalgic"], keywords:["feel_good","recent","funny"] },
  { id:113, cat:"music", title:"Abbey Road — The Beatles",          emoji:"🎸",  desc:"The final masterpiece from the Fab Four.", genres:["rock","pop"], moods:["nostalgic","happy","relaxed"], keywords:["critically_acclaimed","classic","great_story"] },
  { id:114, cat:"music", title:"In Rainbows — Radiohead",           emoji:"🌈",  desc:"Warm, textured art-rock at its most accessible.", genres:["rock","indie","electronic"], moods:["relaxed","thoughtful","emotional"], keywords:["critically_acclaimed","hidden_gem","emotional"] },
  { id:115, cat:"music", title:"Lemonade — Beyoncé",                emoji:"🍋",  desc:"A visual album exploring infidelity, heritage, and power.", genres:["pop","rnb","hiphop"], moods:["inspired","excited","emotional"], keywords:["critically_acclaimed","visually_stunning","epic","emotional","great_story"] },
  { id:116, cat:"music", title:"The Dark Side of the Moon — Pink Floyd",emoji:"🌗",desc:"A concept album about life, death, and madness.", genres:["rock"], moods:["dark","thoughtful","relaxed"], keywords:["critically_acclaimed","classic","mind_bending","epic","great_story"] },
  { id:117, cat:"music", title:"Thriller — Michael Jackson",        emoji:"🕺",  desc:"The best-selling album of all time.", genres:["pop","rnb"], moods:["happy","excited","nostalgic"], keywords:["critically_acclaimed","classic","feel_good","epic"] },
  { id:118, cat:"music", title:"Currents — Tame Impala",            emoji:"🌀",  desc:"Psychedelic pop about change and letting go.", genres:["indie","electronic","rock"], moods:["relaxed","thoughtful","nostalgic"], keywords:["critically_acclaimed","visually_stunning","mind_bending"] },
  { id:119, cat:"music", title:"After Hours — The Weeknd",          emoji:"🌃",  desc:"Dark synth-pop journey through heartbreak and excess.", genres:["pop","rnb","electronic"], moods:["dark","excited","emotional"], keywords:["visually_stunning","recent","great_story","emotional"] },
  { id:120, cat:"music", title:"Kind of Blue — Miles Davis",        emoji:"🎺",  desc:"The definitive jazz album — cool, meditative, timeless.", genres:["jazz"], moods:["relaxed","thoughtful","nostalgic"], keywords:["critically_acclaimed","classic","great_story","short"] },
  { id:121, cat:"music", title:"Melodrama — Lorde",                 emoji:"💔",  desc:"A house party as a metaphor for growing up.", genres:["pop","indie"], moods:["emotional","thoughtful","nostalgic"], keywords:["critically_acclaimed","emotional","great_story","hidden_gem"] },
  { id:122, cat:"music", title:"DAMN. — Kendrick Lamar",            emoji:"🔥",  desc:"Pulitzer Prize-winning exploration of faith and fear.", genres:["hiphop"], moods:["thoughtful","excited","dark"], keywords:["critically_acclaimed","great_story","epic","recent"] },
  { id:123, cat:"music", title:"Folklore — Taylor Swift",           emoji:"🍂",  desc:"Indie-folk storytelling born in quarantine.", genres:["indie","pop"], moods:["relaxed","nostalgic","emotional"], keywords:["critically_acclaimed","recent","emotional","great_story","feel_good"] },
  { id:124, cat:"music", title:"Master of Puppets — Metallica",     emoji:"🤘",  desc:"Thrash metal perfection — fast, heavy, and precise.", genres:["metal","rock"], moods:["excited","dark"], keywords:["critically_acclaimed","classic","epic"] },
  { id:125, cat:"music", title:"Channel Orange — Frank Ocean",      emoji:"🍊",  desc:"Lush neo-soul exploring identity, love, and luxury.", genres:["rnb","pop","hiphop"], moods:["relaxed","thoughtful","nostalgic"], keywords:["critically_acclaimed","hidden_gem","great_story","emotional"] },
  { id:126, cat:"music", title:"Igor — Tyler, the Creator",         emoji:"🎀",  desc:"A synth-pop love story wrapped in chaos.", genres:["hiphop","pop","indie"], moods:["happy","excited","emotional"], keywords:["critically_acclaimed","mind_bending","recent","visually_stunning"] },
  { id:127, cat:"music", title:"Back to Black — Amy Winehouse",     emoji:"🖤",  desc:"Soul-drenched heartbreak from an unmatched voice.", genres:["jazz","rnb","pop"], moods:["dark","emotional","nostalgic"], keywords:["critically_acclaimed","classic","emotional","great_story"] },
  { id:128, cat:"music", title:"Discovery — Daft Punk",             emoji:"🌟",  desc:"French house at its most euphoric and inventive.", genres:["electronic","pop"], moods:["happy","excited","nostalgic"], keywords:["classic","feel_good","visually_stunning"] },
  { id:129, cat:"music", title:"Lovers Rock — Sade",                emoji:"🌹",  desc:"Smooth, romantic, and effortlessly cool.", genres:["rnb","jazz","pop"], moods:["relaxed","nostalgic","happy"], keywords:["classic","feel_good","hidden_gem","short"] },
  { id:130, cat:"music", title:"A Love Supreme — John Coltrane",    emoji:"🙏",  desc:"Spiritual jazz that transcends genre.", genres:["jazz"], moods:["thoughtful","inspired","relaxed"], keywords:["critically_acclaimed","classic","great_story","epic"] },
  { id:131, cat:"music", title:"Anti — Rihanna",                    emoji:"💎",  desc:"A shapeshifting pop album that defies expectation.", genres:["pop","rnb"], moods:["excited","happy","dark"], keywords:["hidden_gem","recent","great_story"] },
  { id:132, cat:"music", title:"Ride the Lightning — Metallica",    emoji:"⚡",  desc:"Thrash metal at its most ambitious and melodic.", genres:["metal","rock"], moods:["excited","dark","adventurous"], keywords:["classic","epic","great_story"] },
  { id:133, cat:"music", title:"Hozier — Hozier",                   emoji:"🌿",  desc:"Soulful folk-rock debut with anthemic highs.", genres:["rock","indie"], moods:["inspired","emotional","relaxed"], keywords:["feel_good","emotional","hidden_gem"] },
  { id:134, cat:"music", title:"SOS — SZA",                         emoji:"💫",  desc:"Sprawling R&B confessional on love and self-worth.", genres:["rnb","pop","hiphop"], moods:["emotional","thoughtful","excited"], keywords:["critically_acclaimed","recent","emotional","great_story"] },
  { id:135, cat:"music", title:"Nevermind — Nirvana",               emoji:"👶",  desc:"Grunge breaks into the mainstream.", genres:["rock"], moods:["excited","dark","nostalgic"], keywords:["critically_acclaimed","classic","epic"] },
  { id:136, cat:"music", title:"Red (Taylor's Version) — Taylor Swift",emoji:"🧣",desc:"Heartbreak anthems re-recorded and reclaimed.", genres:["pop","country","rock"], moods:["emotional","nostalgic","happy"], keywords:["recent","emotional","great_story","feel_good"] },
  { id:137, cat:"music", title:"My Beautiful Dark Twisted Fantasy — Kanye",emoji:"👑",desc:"Maximalist hip-hop at its most grandiose.", genres:["hiphop","pop"], moods:["excited","dark","inspired"], keywords:["critically_acclaimed","classic","epic","visually_stunning","great_story"] },
  { id:138, cat:"music", title:"Blue — Joni Mitchell",              emoji:"💙",  desc:"Bare, poetic folk about love and freedom.", genres:["indie","country"], moods:["emotional","nostalgic","thoughtful"], keywords:["critically_acclaimed","classic","emotional","great_story","short"] },
  { id:139, cat:"music", title:"Punisher — Phoebe Bridgers",        emoji:"🛸",  desc:"Quiet, devastating indie-rock about grief and wonder.", genres:["indie","rock"], moods:["thoughtful","emotional","relaxed"], keywords:["critically_acclaimed","hidden_gem","emotional","recent"] },
  { id:140, cat:"music", title:"The Miseducation of Lauryn Hill",   emoji:"📚",  desc:"Hip-hop, soul, and reggae woven into a personal manifesto.", genres:["hiphop","rnb"], moods:["inspired","thoughtful","happy"], keywords:["critically_acclaimed","classic","great_story","epic","emotional"] },

  // ── Extra items to push past 150 ──
  { id:141, cat:"movies", title:"The Prestige",           emoji:"🎩",  desc:"Two rival magicians escalate a dangerous feud.", genres:["thriller","drama","scifi"], moods:["dark","thoughtful","excited"], keywords:["critically_acclaimed","mind_bending","great_story"] },
  { id:142, cat:"movies", title:"Eternal Sunshine of the Spotless Mind",emoji:"🧠",desc:"A couple erases each other from memory.", genres:["romance","scifi","drama"], moods:["emotional","thoughtful","nostalgic"], keywords:["critically_acclaimed","classic","mind_bending","emotional","great_story"] },
  { id:143, cat:"shows",  title:"Mr. Robot",              emoji:"🖥️", desc:"A hacker with mental illness takes on corporate America.", genres:["drama","crime","scifi"], moods:["dark","thoughtful","excited"], keywords:["critically_acclaimed","mind_bending","great_story","visually_stunning"] },
  { id:144, cat:"shows",  title:"The Wire",               emoji:"📡",  desc:"A sprawling portrait of Baltimore's institutions and streets.", genres:["crime","drama"], moods:["dark","thoughtful"], keywords:["critically_acclaimed","classic","great_story","epic"] },
  { id:145, cat:"books",  title:"Slaughterhouse-Five",    emoji:"🕰️", desc:"Billy Pilgrim becomes unstuck in time.", genres:["fiction","scifi"], moods:["thoughtful","dark","nostalgic"], keywords:["critically_acclaimed","classic","mind_bending","great_story","short"] },
  { id:146, cat:"books",  title:"The Song of Achilles",   emoji:"🛡️", desc:"A retelling of the Iliad through Patroclus' eyes.", genres:["fiction","fantasy","romance"], moods:["emotional","adventurous","nostalgic"], keywords:["great_story","emotional","epic","hidden_gem"] },
  { id:147, cat:"games",  title:"Sekiro: Shadows Die Twice",emoji:"⚔️",desc:"A shinobi fights to rescue his lord in Sengoku-era Japan.", genres:["action","rpg","adventure"], moods:["excited","dark","adventurous"], keywords:["critically_acclaimed","visually_stunning","epic"] },
  { id:148, cat:"games",  title:"Cuphead",                emoji:"🫖",  desc:"A run-and-gun game styled as a 1930s cartoon.", genres:["action","indie"], moods:["excited","happy","nostalgic"], keywords:["visually_stunning","hidden_gem","classic","short"] },
  { id:149, cat:"music",  title:"Wish You Were Here — Pink Floyd",  emoji:"🤝", desc:"Meditation on absence, industry, and Syd Barrett.", genres:["rock"], moods:["nostalgic","thoughtful","emotional"], keywords:["critically_acclaimed","classic","emotional","great_story"] },
  { id:150, cat:"music",  title:"Ctrl — SZA",             emoji:"🎤",  desc:"A raw R&B debut exploring insecurity and desire.", genres:["rnb","hiphop","pop"], moods:["emotional","relaxed","thoughtful"], keywords:["critically_acclaimed","hidden_gem","emotional","great_story"] },
  { id:151, cat:"movies", title:"Inside Out",             emoji:"😊",  desc:"Personified emotions navigate a girl's mind during a move.", genres:["animation","comedy","drama"], moods:["happy","emotional","nostalgic"], keywords:["critically_acclaimed","feel_good","emotional","visually_stunning","great_story"] },
  { id:152, cat:"shows",  title:"Mindhunter",             emoji:"🧩",  desc:"FBI agents pioneer criminal profiling by interviewing serial killers.", genres:["crime","drama"], moods:["dark","thoughtful"], keywords:["critically_acclaimed","great_story","mind_bending"] },
  { id:153, cat:"books",  title:"Normal People",          emoji:"💑",  desc:"Two Irish teenagers navigate love, class, and growing up.", genres:["fiction","romance"], moods:["emotional","nostalgic","thoughtful"], keywords:["critically_acclaimed","emotional","great_story","recent","short"] },
  { id:154, cat:"games",  title:"Journey",                emoji:"🏔️", desc:"A robed figure travels toward a distant mountain.", genres:["adventure","indie"], moods:["relaxed","inspired","emotional"], keywords:["critically_acclaimed","visually_stunning","emotional","short","hidden_gem"] },
  { id:155, cat:"music",  title:"In the Aeroplane Over the Sea — NMH",emoji:"✈️",desc:"Lo-fi folk-rock fever dream — surreal and unforgettable.", genres:["indie","rock"], moods:["emotional","nostalgic","thoughtful"], keywords:["critically_acclaimed","classic","hidden_gem","great_story","emotional"] },
];

// ── STATE ───────────────────────────────────────────────────
const state = {
  category: null,     // string id
  genres: [],         // array of string ids
  moods: [],          // array of string ids
  keywords: [],       // array of string ids
  results: [],        // sorted results
  filterTag: "all",   // current results filter
};

// ── DOM REFS ────────────────────────────────────────────────
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const screens = {
  welcome:   $("#screenWelcome"),
  category:  $("#screenCategory"),
  genres:    $("#screenGenres"),
  mood:      $("#screenMood"),
  keywords:  $("#screenKeywords"),
  loading:   $("#screenLoading"),
  results:   $("#screenResults"),
};

// ── NAVIGATION ──────────────────────────────────────────────
function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove("screen--active"));
  screens[name].classList.add("screen--active");
  // re-trigger animation
  screens[name].style.animation = "none";
  void screens[name].offsetHeight;               // force reflow
  screens[name].style.animation = "";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ── RENDER OPTION CHIPS ─────────────────────────────────────
function renderChips(container, items, multiSelect, stateKey) {
  container.innerHTML = "";
  items.forEach((item) => {
    const chip = document.createElement("button");
    chip.className = "option-chip";
    chip.dataset.id = item.id;
    chip.innerHTML = `
      <span class="chip-emoji">${item.emoji}</span>
      <span class="chip-label">${item.label}</span>
      ${item.sub ? `<span class="chip-sublabel">${item.sub}</span>` : ""}
    `;
    chip.addEventListener("click", () => {
      if (multiSelect) {
        chip.classList.toggle("option-chip--selected");
        const sel = Array.from(container.querySelectorAll(".option-chip--selected"))
                         .map(c => c.dataset.id);
        state[stateKey] = sel;
      } else {
        container.querySelectorAll(".option-chip").forEach(c => c.classList.remove("option-chip--selected"));
        chip.classList.add("option-chip--selected");
        state[stateKey] = chip.dataset.id;
      }
      updateNavButtons();
    });
    container.appendChild(chip);
  });
}

function updateNavButtons() {
  $("#btnCatNext").disabled  = !state.category;
  $("#btnGenNext").disabled  = state.genres.length === 0;
  $("#btnMoodNext").disabled = state.moods.length === 0;
}

// ── RECOMMENDATION ENGINE ───────────────────────────────────
/**
 * Scoring: for each item we compute a weighted tag-overlap score.
 *   - Genre match:   weight 3
 *   - Mood match:    weight 2
 *   - Keyword match: weight 1.5
 * Score = weighted_matches / max_possible  →  0..1  →  displayed as %
 *
 * We also add a small bonus for items with more total tag hits (breadth bonus).
 */
function computeRecommendations() {
  const pool = ITEMS.filter(i => i.cat === state.category);

  const W_GENRE   = 3;
  const W_MOOD    = 2;
  const W_KEYWORD = 1.5;

  const maxPossible =
    state.genres.length  * W_GENRE +
    state.moods.length   * W_MOOD  +
    (state.keywords.length || 1) * W_KEYWORD;   // avoid 0

  const scored = pool.map(item => {
    let genreHits   = item.genres.filter(g  => state.genres.includes(g)).length;
    let moodHits    = item.moods.filter(m   => state.moods.includes(m)).length;
    let keywordHits = item.keywords.filter(k => state.keywords.includes(k)).length;

    let raw = genreHits * W_GENRE + moodHits * W_MOOD + keywordHits * W_KEYWORD;

    // Breadth bonus (up to 10%)
    let totalHits = genreHits + moodHits + keywordHits;
    let breadth   = totalHits / (item.genres.length + item.moods.length + item.keywords.length);
    raw += breadth * 0.1 * maxPossible;

    let score = Math.min(raw / maxPossible, 1);
    // Map to a more satisfying 55–99 range for top items
    let pct = Math.round(score * 100);
    if (pct > 0 && pct < 55) pct = 50 + Math.round(score * 45);

    return { ...item, score, pct };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.filter(s => s.pct > 0).slice(0, 20);
}

// ── RENDER RESULTS ──────────────────────────────────────────
function renderResults(items) {
  const grid = $("#resultsGrid");
  grid.innerHTML = "";

  const catLabel = CATEGORIES.find(c => c.id === state.category)?.label || "";
  $("#resultsSubtitle").textContent = `${items.length} ${catLabel} matched your taste`;

  items.forEach((item, idx) => {
    const pctClass = item.pct >= 80 ? "high" : item.pct >= 55 ? "mid" : "low";
    const card = document.createElement("div");
    card.className = "result-card";
    card.style.animationDelay = `${idx * .06}s`;
    card.innerHTML = `
      <span class="card-rank ${idx < 3 ? 'card-rank--top' : ''}">#${idx + 1}</span>
      <span class="card-emoji">${item.emoji}</span>
      <h3 class="card-title">${item.title}</h3>
      <p class="card-category">${item.cat}</p>
      <p class="card-desc">${item.desc}</p>
      <div class="card-match">
        <div class="match-bar">
          <div class="match-fill match-fill--${pctClass}" style="width:0%"></div>
        </div>
        <span class="match-pct match-pct--${pctClass}">${item.pct}%</span>
      </div>
      <div class="card-tags">
        ${[...item.genres, ...item.moods.slice(0,2)].map(t =>
          `<span class="card-tag">${t.replace(/_/g,' ')}</span>`).join("")}
      </div>
    `;
    grid.appendChild(card);

    // animate match bar after paint
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        card.querySelector(".match-fill").style.width = item.pct + "%";
      });
    });
  });
}

// filter chips
function renderFilterChips() {
  const container = $("#resultsFilters");
  container.innerHTML = "";

  const tags = ["all", ...new Set(state.results.flatMap(r => r.genres))];
  tags.forEach(tag => {
    const chip = document.createElement("button");
    chip.className = `filter-chip ${tag === state.filterTag ? "filter-chip--active" : ""}`;
    chip.textContent = tag === "all" ? "All" : tag.charAt(0).toUpperCase() + tag.slice(1);
    chip.addEventListener("click", () => {
      state.filterTag = tag;
      container.querySelectorAll(".filter-chip").forEach(c => c.classList.remove("filter-chip--active"));
      chip.classList.add("filter-chip--active");

      const filtered = tag === "all"
        ? state.results
        : state.results.filter(r => r.genres.includes(tag));
      renderResults(filtered);
    });
    container.appendChild(chip);
  });
}

// ── LOADING SEQUENCE ────────────────────────────────────────
function showLoadingThenResults() {
  showScreen("loading");
  const phrases = [
    "Matching preferences against 150+ items",
    "Scoring genre compatibility…",
    "Analyzing mood alignment…",
    "Weighing keyword relevance…",
    "Ranking your top picks…",
  ];
  let i = 0;
  const loadText = $("#loadingText");
  const interval = setInterval(() => {
    i++;
    if (i < phrases.length) loadText.textContent = phrases[i];
  }, 400);

  setTimeout(() => {
    clearInterval(interval);
    state.results = computeRecommendations();
    state.filterTag = "all";
    renderFilterChips();
    renderResults(state.results);
    showScreen("results");
  }, 2000);
}

// ── RESET ───────────────────────────────────────────────────
function resetAll() {
  state.category = null;
  state.genres   = [];
  state.moods    = [];
  state.keywords = [];
  state.results  = [];
  state.filterTag = "all";
  $$(".option-chip--selected").forEach(c => c.classList.remove("option-chip--selected"));
  updateNavButtons();
  showScreen("welcome");
}

// ── BACKGROUND PARTICLES ───────────────────────────────────
function spawnParticles() {
  const container = $("#bgParticles");
  const colors = ["#6c5ce7","#00cec9","#fd79a8","#fdcb6e"];
  for (let i = 0; i < 28; i++) {
    const p = document.createElement("div");
    p.className = "particle";
    const size = Math.random() * 6 + 3;
    p.style.width  = size + "px";
    p.style.height = size + "px";
    p.style.left   = Math.random() * 100 + "%";
    p.style.top    = (60 + Math.random() * 50) + "%";
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    p.style.animationDuration = (12 + Math.random() * 20) + "s";
    p.style.animationDelay    = (Math.random() * 15) + "s";
    container.appendChild(p);
  }
}

// ── INIT ────────────────────────────────────────────────────
function init() {
  spawnParticles();

  // Render categories
  renderChips($("#categoryOptions"), CATEGORIES, false, "category");

  // Render moods
  renderChips($("#moodOptions"), MOODS, true, "moods");

  // Render keywords
  renderChips($("#keywordOptions"), KEYWORDS, true, "keywords");

  // ── Wiring ──
  $("#btnStart").addEventListener("click", () => showScreen("category"));

  // Category → Genres (populate genres on next)
  $("#btnCatNext").addEventListener("click", () => {
    const genreList = GENRES_MAP[state.category] || [];
    renderChips($("#genreOptions"), genreList, true, "genres");
    showScreen("genres");
  });
  $("#btnCatBack").addEventListener("click", () => showScreen("welcome"));

  // Genres → Mood
  $("#btnGenNext").addEventListener("click", () => showScreen("mood"));
  $("#btnGenBack").addEventListener("click", () => showScreen("category"));

  // Mood → Keywords
  $("#btnMoodNext").addEventListener("click", () => showScreen("keywords"));
  $("#btnMoodBack").addEventListener("click", () => showScreen("genres"));

  // Keywords → Results
  $("#btnKwNext").addEventListener("click",  () => showLoadingThenResults());
  $("#btnKwBack").addEventListener("click",  () => showScreen("mood"));

  // Restart
  $("#btnRestart").addEventListener("click", resetAll);
  $("#btnTryAgain").addEventListener("click", resetAll);
}

document.addEventListener("DOMContentLoaded", init);
