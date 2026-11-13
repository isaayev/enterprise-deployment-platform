import fs from 'fs';
import path from 'path';
import { User, Game, Review, AuditLog } from '@/types';
import bcrypt from 'bcryptjs';
import { ADMIN_ACCOUNT } from './admin-config';

interface DatabaseSchema {
  users: User[];
  games: Game[];
  reviews: Review[];
  auditLogs: AuditLog[];
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'nexus-db.json');

const INITIAL_GAMES: Game[] = [
  {
    id: 'game-cyberpunk-2077',
    title: 'Cyberpunk 2077: Phantom Liberty',
    slug: 'cyberpunk-2077',
    tagline: 'An open-world action-adventure RPG set in the deadly megalopolis of Night City',
    description: 'Cyberpunk 2077 is an open-world, action-adventure RPG set in the megalopolis of Night City, where you play as a cyberpunk mercenary wrapped up in a do-or-die fight for survival. Phantom Liberty is an espionage-thriller expansion that introduces a high-stakes mission in the dangerous district of Dogtown with Idris Elba.',
    coverImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2778580/header.jpg',
    bannerImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2778580/library_hero.jpg',
    category: 'Action RPG',
    playerModes: ['Singleplayer'],
    developer: 'CD PROJEKT RED',
    publisher: 'CD PROJEKT RED',
    releaseDate: 'Dec 10, 2020 (v2.1 Update: 2024)',
    price: 59.99,
    tags: ['Open World', 'Cyberpunk', 'RPG', 'Rich Story', 'Sci-Fi'],
    systemRequirements: {
      minimum: {
        os: 'Windows 10 64-bit',
        processor: 'Intel Core i7-6700 or AMD Ryzen 5 1600',
        memory: '12 GB RAM',
        graphics: 'NVIDIA GeForce GTX 1060 6GB or AMD Radeon RX 580',
        storage: '70 GB SSD',
      },
      recommended: {
        os: 'Windows 10/11 64-bit',
        processor: 'Intel Core i7-12700 or AMD Ryzen 7 7800X3D',
        memory: '16 GB RAM',
        graphics: 'NVIDIA GeForce RTX 3070 or AMD Radeon RX 6800 XT',
        storage: '70 GB NVMe SSD',
      },
    },
    ratingStats: {
      averageRating: 4.8,
      totalReviews: 4,
      positivePercentage: 92,
      starDistribution: { 1: 0, 2: 0, 3: 0, 4: 1, 5: 3 },
    },
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z',
  },
  {
    id: 'game-elden-ring',
    title: 'Elden Ring: Shadow of the Erdtree',
    slug: 'elden-ring',
    tagline: 'Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring',
    description: 'A masterpiece created by Hidetaka Miyazaki and George R. R. Martin. Journey through the Lands Between, a vast fantasy world filled with towering castles, treacherous dungeons, mythical demigods, and epic boss fights with complete build freedom.',
    coverImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2138330/header.jpg',
    bannerImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2138330/library_hero.jpg',
    category: 'Dark Fantasy RPG',
    playerModes: ['Singleplayer', 'Co-op', 'Multiplayer'],
    developer: 'FromSoftware Inc.',
    publisher: 'Bandai Namco Entertainment',
    releaseDate: 'Feb 25, 2022',
    price: 59.99,
    tags: ['Souls-like', 'Dark Fantasy', 'Challenging', 'Open World', 'Boss Battles'],
    systemRequirements: {
      minimum: {
        os: 'Windows 10',
        processor: 'Intel Core i5-8400 or AMD Ryzen 3 3300X',
        memory: '12 GB RAM',
        graphics: 'NVIDIA GeForce GTX 1060 3GB or AMD Radeon RX 580 4GB',
        storage: '60 GB available space',
      },
      recommended: {
        os: 'Windows 11/10',
        processor: 'Intel Core i7-8700K or AMD Ryzen 5 3600X',
        memory: '16 GB RAM',
        graphics: 'NVIDIA GeForce GTX 1070 8GB or AMD Radeon RX Vega 56',
        storage: '60 GB SSD',
      },
    },
    ratingStats: {
      averageRating: 4.9,
      totalReviews: 3,
      positivePercentage: 96,
      starDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 3 },
    },
    createdAt: '2024-01-12T10:00:00Z',
    updatedAt: '2024-01-12T10:00:00Z',
  },
  {
    id: 'game-baldurs-gate-3',
    title: "Baldur's Gate 3",
    slug: 'baldurs-gate-3',
    tagline: 'An unprecedented next-generation RPG set in the realm of Dungeons & Dragons',
    description: 'Gather your party and return to the Forgotten Realms in a tale of fellowship and betrayal, sacrifice and survival, and the lure of absolute power. Mysterious abilities are awakening inside you, drawn from a mind flayer parasite planted in your brain. Play solo or with up to 4 players in seamless co-op.',
    coverImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1086940/header.jpg',
    bannerImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1086940/library_hero.jpg',
    category: 'Tactical RPG',
    playerModes: ['Singleplayer', 'Co-op', 'Multiplayer'],
    developer: 'Larian Studios',
    publisher: 'Larian Studios',
    releaseDate: 'Aug 3, 2023',
    price: 59.99,
    tags: ['D&D', 'Turn-Based Combat', 'Choices Matter', 'Co-op', 'Masterpiece Story'],
    systemRequirements: {
      minimum: {
        os: 'Windows 10 64-bit',
        processor: 'Intel I5 4690 or AMD FX 8350',
        memory: '8 GB RAM',
        graphics: 'NVIDIA GTX 970 or RX 480',
        storage: '150 GB SSD',
      },
      recommended: {
        os: 'Windows 10/11 64-bit',
        processor: 'Intel i7 8700K or AMD r5 3600',
        memory: '16 GB RAM',
        graphics: 'NVIDIA 2060 Super or RX 5700 XT',
        storage: '150 GB SSD',
      },
    },
    ratingStats: {
      averageRating: 5.0,
      totalReviews: 3,
      positivePercentage: 100,
      starDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 3 },
    },
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'game-red-dead-redemption-2',
    title: 'Red Dead Redemption 2',
    slug: 'red-dead-redemption-2',
    tagline: 'An epic tale of life in Americas unforgiving heartland at the dawn of the modern age',
    description: 'America, 1899. Arthur Morgan and the Van der Linde gang are outlaws on the run. With federal agents and the best bounty hunters in the nation massing on their heels, the gang must rob, steal and fight their way across the rugged heartland of America in order to survive.',
    coverImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1174180/header.jpg',
    bannerImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1174180/library_hero.jpg',
    category: 'Open World Adventure',
    playerModes: ['Singleplayer', 'Multiplayer'],
    developer: 'Rockstar Games',
    publisher: 'Rockstar Games',
    releaseDate: 'Nov 5, 2019',
    price: 59.99,
    tags: ['Wild West', 'Open World', 'Rich Narrative', 'Realistic', 'Masterpiece'],
    systemRequirements: {
      minimum: {
        os: 'Windows 10',
        processor: 'Intel Core i5-2500K or AMD FX-6300',
        memory: '8 GB RAM',
        graphics: 'Nvidia GeForce GTX 770 2GB or AMD Radeon R9 280 3GB',
        storage: '150 GB available space',
      },
      recommended: {
        os: 'Windows 10/11',
        processor: 'Intel Core i7-4770K or AMD Ryzen 5 1500X',
        memory: '12 GB RAM',
        graphics: 'Nvidia GeForce GTX 1060 6GB or AMD Radeon RX 480 4GB',
        storage: '150 GB SSD',
      },
    },
    ratingStats: {
      averageRating: 4.7,
      totalReviews: 3,
      positivePercentage: 90,
      starDistribution: { 1: 0, 2: 0, 3: 0, 4: 1, 5: 2 },
    },
    createdAt: '2024-01-16T10:00:00Z',
    updatedAt: '2024-01-16T10:00:00Z',
  },
  {
    id: 'game-counter-strike-2',
    title: 'Counter-Strike 2',
    slug: 'counter-strike-2',
    tagline: 'The next era of the worlds greatest tactical team-based first-person shooter',
    description: 'Counter-Strike 2 is the largest technical leap forward in Counter-Strike history. Built on the Source 2 engine, it features dynamic responsive smoke grenades, sub-tick updates, overhauled audio, and redesigned maps for pure competitive tactical gameplay.',
    coverImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/730/header.jpg',
    bannerImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/730/library_hero.jpg',
    category: 'Competitive FPS',
    playerModes: ['Multiplayer', 'Co-op'],
    developer: 'Valve Corporation',
    publisher: 'Valve Corporation',
    releaseDate: 'Sep 27, 2023',
    price: 0,
    tags: ['FPS', 'Esports', 'Tactical', 'Team-Based', 'Free to Play'],
    systemRequirements: {
      minimum: {
        os: 'Windows 10 64-bit',
        processor: '4 hardware CPU threads - Intel Core i5 750 or better',
        memory: '8 GB RAM',
        graphics: 'DirectX 11-compatible GPU with 1GB VRAM',
        storage: '85 GB available space',
      },
      recommended: {
        os: 'Windows 11 64-bit',
        processor: 'Intel Core i7 or AMD Ryzen 7',
        memory: '16 GB RAM',
        graphics: 'NVIDIA GeForce RTX 3060 or better',
        storage: '85 GB SSD',
      },
    },
    ratingStats: {
      averageRating: 4.2,
      totalReviews: 3,
      positivePercentage: 78,
      starDistribution: { 1: 0, 2: 0, 3: 1, 4: 1, 5: 1 },
    },
    createdAt: '2024-01-18T10:00:00Z',
    updatedAt: '2024-01-18T10:00:00Z',
  },
  {
    id: 'game-helldivers-2',
    title: 'Helldivers 2',
    slug: 'helldivers-2',
    tagline: 'Join the Helldivers and fight for Freedom across a hostile galaxy in intense third-person co-op',
    description: 'Enlist in the Helldivers and join the fight for freedom across a hostile galaxy in a fast, frantic, and ferocious third-person shooter. Team up with up to four friends and wreak havoc on alien scourges using devastating orbital stratagems and chaotic firepower.',
    coverImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/553850/header.jpg',
    bannerImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/553850/library_hero.jpg',
    category: 'Co-op Shooter',
    playerModes: ['Co-op', 'Multiplayer'],
    developer: 'Arrowhead Game Studios',
    publisher: 'PlayStation Publishing LLC',
    releaseDate: 'Feb 8, 2024',
    price: 39.99,
    tags: ['Co-op', 'Sci-Fi', 'Third-Person Shooter', 'Teamwork', 'Chaotic Action'],
    systemRequirements: {
      minimum: {
        os: 'Windows 10 64-bit',
        processor: 'Intel Core i7-4790K or AMD Ryzen 5 1500X',
        memory: '8 GB RAM',
        graphics: 'NVIDIA GeForce GTX 1050 Ti or AMD Radeon RX 470',
        storage: '100 GB available space',
      },
      recommended: {
        os: 'Windows 10/11 64-bit',
        processor: 'Intel Core i7-9700K or AMD Ryzen 7 3700X',
        memory: '16 GB RAM',
        graphics: 'NVIDIA GeForce RTX 2060 or AMD Radeon RX 6600XT',
        storage: '100 GB SSD',
      },
    },
    ratingStats: {
      averageRating: 4.6,
      totalReviews: 2,
      positivePercentage: 88,
      starDistribution: { 1: 0, 2: 0, 3: 0, 4: 1, 5: 1 },
    },
    createdAt: '2024-02-10T10:00:00Z',
    updatedAt: '2024-02-10T10:00:00Z',
  },
];

const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-cp-1',
    gameId: 'game-cyberpunk-2077',
    userId: 'user-critic-1',
    authorName: 'GameMasterReviewer',
    authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    isAnonymous: false,
    rating: 5,
    isRecommended: true,
    title: 'With Phantom Liberty, this has become a true masterpiece!',
    content: 'CD PROJEKT RED elevated Cyberpunk 2077 to the highest standard with update 2.0 and Phantom Liberty. The atmosphere in Night City, the visual fidelity with path tracing, and Idris Elbas stellar performance make this an unforgettable RPG.',
    hoursPlayed: 142.5,
    helpfulVotes: 38,
    unhelpfulVotes: 2,
    votedUserIds: [],
    createdAt: '2024-02-01T14:20:00Z',
    updatedAt: '2024-02-01T14:20:00Z',
    verifiedPurchase: true,
  },
  {
    id: 'rev-cp-2',
    gameId: 'game-cyberpunk-2077',
    userId: 'user-gamer-1',
    authorName: 'CyberGamer99',
    authorAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
    isAnonymous: false,
    rating: 5,
    isRecommended: true,
    title: 'Exceeded all my expectations! Phenomenal soundtrack.',
    content: 'Cruising through the neon-lit streets while listening to the in-game radio is pure bliss. The quest branching and combat build variety make replaying extremely rewarding.',
    hoursPlayed: 86.0,
    helpfulVotes: 19,
    unhelpfulVotes: 1,
    votedUserIds: [],
    createdAt: '2024-02-10T18:00:00Z',
    updatedAt: '2024-02-10T18:00:00Z',
    verifiedPurchase: true,
  },
  {
    id: 'rev-cp-3',
    gameId: 'game-cyberpunk-2077',
    userId: 'user-gamer-anon-1',
    authorName: 'Anonymous Gamer',
    authorAvatar: '',
    isAnonymous: true, // Demonstrates the requested anonymous review feature in English!
    rating: 5,
    isRecommended: true,
    title: 'Anonymous Review: Optimization is rock solid now',
    content: 'Earlier patches had performance hiccups, but on DLSS 3.5 it runs buttery smooth at 60+ FPS. The world design and depth of character writing are unmatched in modern gaming.',
    hoursPlayed: 54.0,
    helpfulVotes: 12,
    unhelpfulVotes: 0,
    votedUserIds: [],
    createdAt: '2024-02-15T09:30:00Z',
    updatedAt: '2024-02-15T09:30:00Z',
    verifiedPurchase: true,
  },
  {
    id: 'rev-cp-4',
    gameId: 'game-cyberpunk-2077',
    userId: 'user-gamer-2',
    authorName: 'PixelKnight',
    isAnonymous: false,
    rating: 4,
    isRecommended: true,
    title: 'Outstanding game, though crowd AI occasionally glitches',
    content: 'The narrative and gunplay are 10/10. Some minor AI eccentricities in busy plazas, but nothing that detracts from the thrilling story and emotional payoff.',
    hoursPlayed: 45.2,
    helpfulVotes: 7,
    unhelpfulVotes: 1,
    votedUserIds: [],
    createdAt: '2024-02-20T11:15:00Z',
    updatedAt: '2024-02-20T11:15:00Z',
    verifiedPurchase: true,
  },
  {
    id: 'rev-er-1',
    gameId: 'game-elden-ring',
    userId: 'user-critic-1',
    authorName: 'GameMasterReviewer',
    authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    isAnonymous: false,
    rating: 5,
    isRecommended: true,
    title: 'One of the greatest achievements in gaming history',
    content: 'FromSoftware reinvented the open-world genre. Exploring without mandatory objective markers purely driven by curiosity is a rare, intoxicating thrill. Bosses are brutal yet fair.',
    hoursPlayed: 210.0,
    helpfulVotes: 64,
    unhelpfulVotes: 3,
    votedUserIds: [],
    createdAt: '2024-01-20T16:00:00Z',
    updatedAt: '2024-01-20T16:00:00Z',
    verifiedPurchase: true,
  },
  {
    id: 'rev-er-2',
    gameId: 'game-elden-ring',
    userId: 'user-gamer-anon-2',
    authorName: 'Anonymous Gamer',
    isAnonymous: true,
    rating: 5,
    isRecommended: true,
    title: 'Challenging and punishing, yet impossible to put down!',
    content: 'Spent 4 days trying to defeat Malenia, but the sheer adrenaline and triumph upon winning is something no other game has ever delivered. Pure perfection.',
    hoursPlayed: 115.0,
    helpfulVotes: 29,
    unhelpfulVotes: 1,
    votedUserIds: [],
    createdAt: '2024-01-28T21:40:00Z',
    updatedAt: '2024-01-28T21:40:00Z',
    verifiedPurchase: true,
  },
  {
    id: 'rev-er-3',
    gameId: 'game-elden-ring',
    userId: 'user-gamer-1',
    authorName: 'CyberGamer99',
    isAnonymous: false,
    rating: 5,
    isRecommended: true,
    title: 'Infinite weapon, spell, and build combinations',
    content: 'Every playthrough feels completely different depending on your character build. Absolute 10 out of 10 masterpiece.',
    hoursPlayed: 98.4,
    helpfulVotes: 15,
    unhelpfulVotes: 0,
    votedUserIds: [],
    createdAt: '2024-02-05T19:00:00Z',
    updatedAt: '2024-02-05T19:00:00Z',
    verifiedPurchase: true,
  },
  {
    id: 'rev-bg3-1',
    gameId: 'game-baldurs-gate-3',
    userId: 'user-critic-1',
    authorName: 'GameMasterReviewer',
    authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    isAnonymous: false,
    rating: 5,
    isRecommended: true,
    title: 'The best RPG of the last decade',
    content: 'Larian Studios set a benchmark that will inspire developers for years. The sheer depth of consequence, companion voice acting, and creative tactical freedom are peerless.',
    hoursPlayed: 160.0,
    helpfulVotes: 51,
    unhelpfulVotes: 0,
    votedUserIds: [],
    createdAt: '2024-01-25T13:10:00Z',
    updatedAt: '2024-01-25T13:10:00Z',
    verifiedPurchase: true,
  },
  {
    id: 'rev-bg3-2',
    gameId: 'game-baldurs-gate-3',
    userId: 'user-gamer-anon-3',
    authorName: 'Anonymous Gamer',
    isAnonymous: true,
    rating: 5,
    isRecommended: true,
    title: 'Playing co-op with friends is pure hilarity and joy',
    content: 'Gathering four friends for an evening of chaotic dice rolls brings the genuine spirit of tabletop Dungeons & Dragons straight to your PC.',
    hoursPlayed: 75.0,
    helpfulVotes: 23,
    unhelpfulVotes: 1,
    votedUserIds: [],
    createdAt: '2024-02-02T22:30:00Z',
    updatedAt: '2024-02-02T22:30:00Z',
    verifiedPurchase: true,
  },
  {
    id: 'rev-bg3-3',
    gameId: 'game-baldurs-gate-3',
    userId: 'user-gamer-1',
    authorName: 'CyberGamer99',
    isAnonymous: false,
    rating: 5,
    isRecommended: true,
    title: 'You completely lose track of time',
    content: 'Every corner holds a secret, a mystery, or an unexpected dialogue branch. The orchestral soundtrack is also phenomenal.',
    hoursPlayed: 130.0,
    helpfulVotes: 18,
    unhelpfulVotes: 0,
    votedUserIds: [],
    createdAt: '2024-02-12T17:15:00Z',
    updatedAt: '2024-02-12T17:15:00Z',
    verifiedPurchase: true,
  },
  {
    id: 'rev-rdr2-1',
    gameId: 'game-red-dead-redemption-2',
    userId: 'user-critic-1',
    authorName: 'GameMasterReviewer',
    isAnonymous: false,
    rating: 5,
    isRecommended: true,
    title: 'Arthur Morgan: Video games finest protagonist',
    content: 'Red Dead Redemption 2 transcends ordinary video games to become a work of cinematic narrative art. The staggering environmental realism and poignant ending are unforgettable.',
    hoursPlayed: 180.0,
    helpfulVotes: 44,
    unhelpfulVotes: 1,
    votedUserIds: [],
    createdAt: '2024-01-30T15:20:00Z',
    updatedAt: '2024-01-30T15:20:00Z',
    verifiedPurchase: true,
  },
  {
    id: 'rev-rdr2-2',
    gameId: 'game-red-dead-redemption-2',
    userId: 'user-gamer-anon-4',
    authorName: 'Anonymous Gamer',
    isAnonymous: true,
    rating: 5,
    isRecommended: true,
    title: 'Hunting, fishing, and atmosphere: unmatched immersion',
    content: 'Sometimes you just forget the main quests and spend hours riding through the forests watching wildlife. Visual benchmark of the generation.',
    hoursPlayed: 92.0,
    helpfulVotes: 14,
    unhelpfulVotes: 0,
    votedUserIds: [],
    createdAt: '2024-02-08T18:45:00Z',
    updatedAt: '2024-02-08T18:45:00Z',
    verifiedPurchase: true,
  },
  {
    id: 'rev-rdr2-3',
    gameId: 'game-red-dead-redemption-2',
    userId: 'user-gamer-1',
    authorName: 'CyberGamer99',
    isAnonymous: false,
    rating: 4,
    isRecommended: true,
    title: 'Starts slowly in the snow, but becomes impossible to leave',
    content: 'The snowy prologue is a bit methodical, but once you arrive in Valentine and the open world breathes, the magic takes over.',
    hoursPlayed: 70.0,
    helpfulVotes: 11,
    unhelpfulVotes: 2,
    votedUserIds: [],
    createdAt: '2024-02-14T20:10:00Z',
    updatedAt: '2024-02-14T20:10:00Z',
    verifiedPurchase: true,
  },
  {
    id: 'rev-cs2-1',
    gameId: 'game-counter-strike-2',
    userId: 'user-gamer-1',
    authorName: 'CyberGamer99',
    isAnonymous: false,
    rating: 4,
    isRecommended: true,
    title: 'Sub-tick system and volumetric smokes changed the meta',
    content: 'Took some time to adapt from CS:GO, but the Source 2 lighting and responsive grenade physics make it feel much crisper.',
    hoursPlayed: 320.0,
    helpfulVotes: 22,
    unhelpfulVotes: 5,
    votedUserIds: [],
    createdAt: '2024-02-04T12:00:00Z',
    updatedAt: '2024-02-04T12:00:00Z',
    verifiedPurchase: true,
  },
  {
    id: 'rev-cs2-2',
    gameId: 'game-counter-strike-2',
    userId: 'user-gamer-anon-5',
    authorName: 'Anonymous Gamer',
    isAnonymous: true,
    rating: 3,
    isRecommended: false,
    title: 'Anti-cheat detection needs continuous reinforcement',
    content: 'In Premier matches at higher ranks, you still encounter suspicious profiles. The core shooting mechanics are pristine, but anti-cheat vigilance is paramount.',
    hoursPlayed: 210.0,
    helpfulVotes: 37,
    unhelpfulVotes: 4,
    votedUserIds: [],
    createdAt: '2024-02-11T16:45:00Z',
    updatedAt: '2024-02-11T16:45:00Z',
    verifiedPurchase: true,
  },
  {
    id: 'rev-cs2-3',
    gameId: 'game-counter-strike-2',
    userId: 'user-critic-1',
    authorName: 'GameMasterReviewer',
    isAnonymous: false,
    rating: 5,
    isRecommended: true,
    title: 'The timeless tactical shooter enters its next era',
    content: 'No competitive FPS matches Counter-Strikes tactical pedigree. The new visual feedback and lighting overhaul bring it up to modern standards.',
    hoursPlayed: 190.0,
    helpfulVotes: 16,
    unhelpfulVotes: 2,
    votedUserIds: [],
    createdAt: '2024-02-16T14:30:00Z',
    updatedAt: '2024-02-16T14:30:00Z',
    verifiedPurchase: true,
  },
  {
    id: 'rev-hd2-1',
    gameId: 'game-helldivers-2',
    userId: 'user-critic-1',
    authorName: 'GameMasterReviewer',
    isAnonymous: false,
    rating: 5,
    isRecommended: true,
    title: 'The biggest and most hilarious co-op surprise of the year!',
    content: 'Spreading Managed Democracy while calling down 500kg bombs on bug swarms has never been more fun. An absolute must-play with friends.',
    hoursPlayed: 85.0,
    helpfulVotes: 27,
    unhelpfulVotes: 1,
    votedUserIds: [],
    createdAt: '2024-02-18T20:00:00Z',
    updatedAt: '2024-02-18T20:00:00Z',
    verifiedPurchase: true,
  },
  {
    id: 'rev-hd2-2',
    gameId: 'game-helldivers-2',
    userId: 'user-gamer-anon-6',
    authorName: 'Anonymous Gamer',
    isAnonymous: true,
    rating: 4,
    isRecommended: true,
    title: 'Pure chaos, friendly fire hilarity, and heroic extractions',
    content: 'Accidentally dropping an orbital strike directly on your teammate creates memories you will laugh about for weeks. Terrific shooter.',
    hoursPlayed: 60.0,
    helpfulVotes: 19,
    unhelpfulVotes: 0,
    votedUserIds: [],
    createdAt: '2024-02-22T21:10:00Z',
    updatedAt: '2024-02-22T21:10:00Z',
    verifiedPurchase: true,
  },
];

class EnterpriseDatabase {
  private memoryCache: DatabaseSchema | null = null;

  private ensureDir() {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
    } catch (e) {
      // Read-only fayl sistemi (məs. serverless hosting) - baza yalnız yaddaşda işləyəcək
      console.error('Could not create data directory:', e);
    }
  }

  private initDatabase(): DatabaseSchema {
    this.ensureDir();
    // Admin hesabı - giriş məlumatları src/lib/admin-config.ts faylından gəlir
    const initialUsers: User[] = [
      {
        id: 'user-admin-1',
        username: ADMIN_ACCOUNT.username,
        email: ADMIN_ACCOUNT.email,
        passwordHash: bcrypt.hashSync(ADMIN_ACCOUNT.password, 10),
        role: 'ADMIN',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        createdAt: '2024-01-01T00:00:00Z',
        bio: 'Nexus Gaming Platform Administrator & Security Lead',
        badges: ['Platform Admin', 'Verified Staff', 'Security Lead'],
      },
    ];

    // Demo hesablar (məlum parollu) YALNIZ development rejimində yaradılır.
    // Production-da (deploy) bu hesablar mövcud olmur.
    if (process.env.NODE_ENV !== 'production') {
      const demoPasswordHash = bcrypt.hashSync('password123', 10);
      initialUsers.push(
        {
          id: 'user-critic-1',
          username: 'GameMasterReviewer',
          email: 'critic@enterprise.gg',
          passwordHash: demoPasswordHash,
          role: 'CRITIC',
          avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
          createdAt: '2024-01-05T00:00:00Z',
          bio: 'Senior Gaming Journalist & Verified Critic',
          badges: ['Official Critic', 'Hall of Fame', 'Top Reviewer'],
        },
        {
          id: 'user-gamer-1',
          username: 'CyberGamer99',
          email: 'gamer@enterprise.gg',
          passwordHash: demoPasswordHash,
          role: 'GAMER',
          avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
          createdAt: '2024-01-10T00:00:00Z',
          bio: 'Hardcore RPG and Competitive FPS enthusiast',
          badges: ['Early Adopter', 'Achievement Hunter'],
        }
      );
    }

    const initialAuditLogs: AuditLog[] = [
      {
        id: 'audit-seed-1',
        action: 'SYSTEM_INITIALIZATION',
        ipAddress: '127.0.0.1',
        resource: 'DATABASE',
        status: 'SUCCESS',
        details: 'Nexus Enterprise Gaming Platform initialized with seed games and security accounts',
        timestamp: new Date().toISOString(),
      },
    ];

    const initialData: DatabaseSchema = {
      users: initialUsers,
      games: INITIAL_GAMES,
      reviews: INITIAL_REVIEWS,
      auditLogs: initialAuditLogs,
    };

    // Calculate initial ratings
    for (const game of initialData.games) {
      const gameReviews = initialData.reviews.filter((r) => r.gameId === game.id);
      if (gameReviews.length > 0) {
        const total = gameReviews.length;
        const sum = gameReviews.reduce((acc, r) => acc + r.rating, 0);
        const avg = parseFloat((sum / total).toFixed(1));
        const positiveCount = gameReviews.filter((r) => r.isRecommended || r.rating >= 4).length;
        const positivePercentage = Math.round((positiveCount / total) * 100);

        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        for (const r of gameReviews) {
          const star = Math.max(1, Math.min(5, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
          distribution[star] = (distribution[star] || 0) + 1;
        }

        game.ratingStats = {
          averageRating: avg,
          totalReviews: total,
          positivePercentage,
          starDistribution: distribution,
        };
      }
    }

    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed writing initial DB file:', e);
    }
    return initialData;
  }

  private getData(): DatabaseSchema {
    if (this.memoryCache) {
      return this.memoryCache;
    }

    this.ensureDir();
    if (fs.existsSync(DB_FILE)) {
      try {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent) as DatabaseSchema;
        if (parsed && Array.isArray(parsed.users) && Array.isArray(parsed.games)) {
          this.memoryCache = parsed;
          return this.memoryCache;
        }
      } catch (err) {
        console.error('[DB] Failed to parse existing DB file, falling back to init:', err);
      }
    }

    this.memoryCache = this.initDatabase();
    return this.memoryCache;
  }

  private persist(data: DatabaseSchema) {
    this.ensureDir();
    this.memoryCache = data;
    try {
      // Atomic write pattern: write to temporary file, then rename/copy to avoid corruption
      const tempFile = `${DB_FILE}.${Date.now()}.${Math.random().toString(36).substring(2, 7)}.tmp`;
      fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
      try {
        fs.renameSync(tempFile, DB_FILE);
      } catch {
        // Fallback for Windows where atomic rename over an existing file triggers EPERM
        fs.copyFileSync(tempFile, DB_FILE);
        try {
          fs.unlinkSync(tempFile);
        } catch {}
      }
    } catch (e) {
      // Serverless environments (e.g. Vercel lambda) have read-only root filesystems.
      // Data remains intact in memory during the lambda invocation.
      console.warn('[DB] Persistent storage write failed (expected on read-only serverless lambdas):', e);
    }
  }

  public recalculateGameStats(gameId: string) {
    const data = this.getData();
    const game = data.games.find((g) => g.id === gameId);
    if (!game) return;

    const gameReviews = data.reviews.filter((r) => r.gameId === gameId);
    const total = gameReviews.length;

    if (total === 0) {
      game.ratingStats = {
        averageRating: 0,
        totalReviews: 0,
        positivePercentage: 0,
        starDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    } else {
      const sum = gameReviews.reduce((acc, r) => acc + r.rating, 0);
      const avg = parseFloat((sum / total).toFixed(1));
      const positiveCount = gameReviews.filter((r) => r.isRecommended || r.rating >= 4).length;
      const positivePercentage = Math.round((positiveCount / total) * 100);

      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      for (const r of gameReviews) {
        const star = Math.max(1, Math.min(5, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
        distribution[star] = (distribution[star] || 0) + 1;
      }

      game.ratingStats = {
        averageRating: avg,
        totalReviews: total,
        positivePercentage,
        starDistribution: distribution,
      };
    }
    game.updatedAt = new Date().toISOString();
    this.persist(data);
  }

  // Collection accessors
  public users = {
    getAll: async (): Promise<User[]> => {
      return [...this.getData().users];
    },
    findById: async (id: string): Promise<User | null> => {
      const user = this.getData().users.find((u) => u.id === id);
      return user ? { ...user } : null;
    },
    findByEmail: async (email: string): Promise<User | null> => {
      const user = this.getData().users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      return user ? { ...user } : null;
    },
    findByUsername: async (username: string): Promise<User | null> => {
      const user = this.getData().users.find((u) => u.username.toLowerCase() === username.toLowerCase());
      return user ? { ...user } : null;
    },
    create: async (user: User): Promise<User> => {
      const data = this.getData();
      data.users.push(user);
      this.persist(data);
      return user;
    },
  };

  public games = {
    getAll: async (): Promise<Game[]> => {
      return [...this.getData().games];
    },
    findById: async (id: string): Promise<Game | null> => {
      const game = this.getData().games.find((g) => g.id === id || g.slug === id);
      return game ? { ...game } : null;
    },
    create: async (game: Game): Promise<Game> => {
      const data = this.getData();
      data.games.unshift(game);
      this.persist(data);
      return game;
    },
    update: async (id: string, updates: Partial<Game>): Promise<Game | null> => {
      const data = this.getData();
      const index = data.games.findIndex((g) => g.id === id);
      if (index === -1) return null;
      data.games[index] = {
        ...data.games[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      this.persist(data);
      return data.games[index];
    },
    delete: async (id: string): Promise<boolean> => {
      const data = this.getData();
      const initialLength = data.games.length;
      data.games = data.games.filter((g) => g.id !== id);
      if (data.games.length < initialLength) {
        data.reviews = data.reviews.filter((r) => r.gameId !== id);
        this.persist(data);
        return true;
      }
      return false;
    },
  };

  public reviews = {
    getAll: async (): Promise<Review[]> => {
      return [...this.getData().reviews];
    },
    getByGameId: async (gameId: string): Promise<Review[]> => {
      return this.getData()
        .reviews.filter((r) => r.gameId === gameId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    findById: async (id: string): Promise<Review | null> => {
      const review = this.getData().reviews.find((r) => r.id === id);
      return review ? { ...review } : null;
    },
    create: async (review: Review): Promise<Review> => {
      const data = this.getData();
      data.reviews.unshift(review);
      this.persist(data);
      this.recalculateGameStats(review.gameId);
      return review;
    },
    delete: async (id: string): Promise<boolean> => {
      const data = this.getData();
      const review = data.reviews.find((r) => r.id === id);
      if (!review) return false;

      const gameId = review.gameId;
      data.reviews = data.reviews.filter((r) => r.id !== id);
      this.persist(data);
      this.recalculateGameStats(gameId);
      return true;
    },
    voteHelpful: async (reviewId: string, userId: string, isHelpful: boolean): Promise<Review | null> => {
      const data = this.getData();
      const review = data.reviews.find((r) => r.id === reviewId);
      if (!review) return null;

      if (!review.votedUserIds) {
        review.votedUserIds = [];
      }

      if (review.votedUserIds.includes(userId)) {
        return review;
      }

      review.votedUserIds.push(userId);
      if (isHelpful) {
        review.helpfulVotes = (review.helpfulVotes || 0) + 1;
      } else {
        review.unhelpfulVotes = (review.unhelpfulVotes || 0) + 1;
      }

      this.persist(data);
      return review;
    },
  };

  public auditLogs = {
    getAll: async (limit = 100): Promise<AuditLog[]> => {
      return this.getData()
        .auditLogs.slice()
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
    },
    create: async (log: AuditLog): Promise<AuditLog> => {
      const data = this.getData();
      data.auditLogs.unshift(log);
      if (data.auditLogs.length > 500) {
        data.auditLogs = data.auditLogs.slice(0, 500);
      }
      this.persist(data);
      return log;
    },
  };
}

export const db = new EnterpriseDatabase();
