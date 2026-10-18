import { promises as fs } from "node:fs";
import path from "node:path";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type User = {
  id: string;
  xId: string | null;
  /** Адрес кошелька в Robinhood Chain (вход по кошельку), если есть. */
  walletAddress?: string | null;
  handle: string;
  name: string;
  bio: string;
  avatarUrl: string | null;
  verified: boolean;
  followers: number;
  following: number;
  clanId: string | null;
  points: number;
  createdAt: string;
  isDemo: boolean;
};

export type Clan = {
  id: string;
  slug: string;
  name: string;
  motto: string;
  description: string;
  color: string;
  createdAt: string;
};

export type Post = {
  id: string;
  authorId: string;
  text: string;
  createdAt: string;
  pinned?: boolean;
};

export type Like = {
  postId: string;
  userId: string;
  createdAt?: string;
};

export type Trade = {
  id: string;
  keyOwnerHandle: string;
  buyerHandle: string;
  action: "bought" | "sold";
  priceUsd: number;
  createdAt: string;
};

export type Db = {
  users: User[];
  clans: Clan[];
  posts: Post[];
  likes: Like[];
  trades: Trade[];
};

/* ------------------------------------------------------------------ */
/*  Seed                                                               */
/* ------------------------------------------------------------------ */

const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();
const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();
const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString();

const SEED_CLANS: Clan[] = [
  {
    id: "clan_wolves",
    slug: "wolves",
    name: "Wolves of X",
    motto: "The pack hunts together.",
    description:
      "The oldest clan on Klan. Wolves run the daily raids: engagement trains, quote storms and the loudest GM on the timeline.",
    color: "#d4a44c",
    createdAt: daysAgo(210),
  },
  {
    id: "clan_crows",
    slug: "crows",
    name: "Crow Clan",
    motto: "We collect what glitters.",
    description:
      "Key traders and airdrop hunters. Crows watch every curve, every launchpad and every new season pool.",
    color: "#7a9e9f",
    createdAt: daysAgo(190),
  },
  {
    id: "clan_lions",
    slug: "lions",
    name: "Lion Order",
    motto: "Loud, proud, ranked.",
    description:
      "Battle specialists. The Lion Order has the most wins in Klan Battles and the highest weekly treasury payouts.",
    color: "#e0b060",
    createdAt: daysAgo(175),
  },
  {
    id: "clan_foxes",
    slug: "foxes",
    name: "Silent Foxes",
    motto: "Post less, rank higher.",
    description:
      "Builders and lurkers who let engagement rate do the talking. Home of the smallest-and-deadliest battle records.",
    color: "#c65c47",
    createdAt: daysAgo(160),
  },
  {
    id: "clan_bears",
    slug: "bears",
    name: "Bronze Bears",
    motto: "Slow weight, heavy hits.",
    description:
      "Long-horizon holders. Bears stake, hold keys through the dips and farm every daily task since season one.",
    color: "#8a9a6b",
    createdAt: daysAgo(150),
  },
  {
    id: "clan_snakes",
    slug: "snakes",
    name: "Green Snakes",
    motto: "Two thousand characters.",
    description: "Writers and threads-maxis. Snakes turn the Spark post length into an art form.",
    color: "#9d8bb5",
    createdAt: daysAgo(130),
  },
  {
    id: "clan_hawks",
    slug: "hawks",
    name: "Night Hawks",
    motto: "Online when you sleep.",
    description: "The 3 AM shift. Hawks keep the ticker moving across every timezone on the board.",
    color: "#b58f6a",
    createdAt: daysAgo(120),
  },
  {
    id: "clan_none",
    slug: "none",
    name: "Clanless",
    motto: "Riding solo.",
    description: "Members who have not sworn the oath to any clan yet.",
    color: "#9c938a",
    createdAt: daysAgo(300),
  },
];

const SEED_USERS: Array<Omit<User, "createdAt">> = [
  {
    id: "u_influence",
    xId: null,
    handle: "klanofficial",
    name: "Klan",
    bio: "The official Klan account. Your influence builds the clan.",
    avatarUrl: null,
    verified: true,
    followers: 128_400,
    following: 12,
    clanId: "clan_wolves",
    points: 3_950_000,
    isDemo: false,
  },
  {
    id: "u_mayhem",
    xId: null,
    handle: "seal7team7",
    name: "π|Mayhem|π🐐",
    bio: "Clan treasurer. Staking, sniping, shipping.",
    avatarUrl: null,
    verified: true,
    followers: 42_300,
    following: 310,
    clanId: "clan_lions",
    points: 2_640_000,
    isDemo: false,
  },
  {
    id: "u_cryptking",
    xId: null,
    handle: "cryptking_1",
    name: "Cryptking.eth 👑🦍",
    bio: "Call me the Key Sniper.💎",
    avatarUrl: null,
    verified: true,
    followers: 31_200,
    following: 289,
    clanId: "clan_crows",
    points: 1_870_000,
    isDemo: false,
  },
  {
    id: "u_quinn",
    xId: null,
    handle: "muquinn5",
    name: "Quinn🛡️",
    bio: "Farming the pack daily.",
    avatarUrl: null,
    verified: true,
    followers: 18_900,
    following: 402,
    clanId: "clan_bears",
    points: 1_240_000,
    isDemo: false,
  },
  {
    id: "u_tone",
    xId: null,
    handle: "toneweb3",
    name: "TONE ☕️",
    bio: "Good morning is a strategy.",
    avatarUrl: null,
    verified: true,
    followers: 9_800,
    following: 512,
    clanId: "clan_hawks",
    points: 890_000,
    isDemo: false,
  },
  {
    id: "u_roger",
    xId: null,
    handle: "rogershen123",
    name: "roger shen🌊RIVER",
    bio: "Ride the river, farm the season.",
    avatarUrl: null,
    verified: true,
    followers: 7_400,
    following: 640,
    clanId: "clan_snakes",
    points: 640_000,
    isDemo: false,
  },
  {
    id: "u_nifemii",
    xId: null,
    handle: "nifemii",
    name: "𝐍𝐢𝐟𝐞𝐦𝐢𝐢' 🫧",
    bio: "Threads and quiet ranks.",
    avatarUrl: null,
    verified: true,
    followers: 5_100,
    following: 388,
    clanId: "clan_foxes",
    points: 470_000,
    isDemo: false,
  },
  {
    id: "u_fizz",
    xId: null,
    handle: "fizz_fx",
    name: "𝙵𝚒𝚣𝚣𝚢",
    bio: "Day 12 on Klan. Liking it.",
    avatarUrl: null,
    verified: false,
    followers: 2_300,
    following: 701,
    clanId: "clan_foxes",
    points: 210_000,
    isDemo: false,
  },
  {
    id: "u_heyrdzy",
    xId: null,
    handle: "heyrdzy",
    name: "heyrdzy",
    bio: "gm. that's the post.",
    avatarUrl: null,
    verified: false,
    followers: 1_450,
    following: 890,
    clanId: "clan_hawks",
    points: 96_500,
    isDemo: false,
  },
  {
    id: "u_zel",
    xId: null,
    handle: "zelweb3",
    name: "Zel",
    bio: "Happy sunday, green charts.",
    avatarUrl: null,
    verified: false,
    followers: 980,
    following: 640,
    clanId: "clan_snakes",
    points: 72_400,
    isDemo: false,
  },
  {
    id: "u_dio",
    xId: null,
    handle: "tebogaduit95",
    name: "DioJambu",
    bio: "Next week I can make money.",
    avatarUrl: null,
    verified: false,
    followers: 540,
    following: 1_100,
    clanId: null,
    points: 24_800,
    isDemo: false,
  },
  {
    id: "u_shabu",
    xId: null,
    handle: "boddashabu",
    name: "Shabu 🛡🔺️",
    bio: "GOOD MORNING Klan FAMILY 👀☕️",
    avatarUrl: null,
    verified: false,
    followers: 1_120,
    following: 760,
    clanId: "clan_wolves",
    points: 41_200,
    isDemo: false,
  },
];

const SEED_POSTS: Array<Omit<Post, "createdAt"> & { age: number }> = [
  {
    id: "p_1",
    authorId: "u_influence",
    text: "Season 2 is live: everyone starts from zero. Trade keys, hold keys, complete daily tasks and bring your people in. The clan that moves together, ranks together. 🐺",
    pinned: true,
    age: 18,
  },
  {
    id: "p_2",
    authorId: "u_influence",
    text: "HOW TO RANK UP FASTER\n\n1. Hold keys: 500,000 points per 1 ETH of keys, recounted every minute.\n2. Trade keys: 100,000 points per 1 ETH bought or sold.\n3. Daily tasks: theme post 750, comment 1 000, follow 2 000.\n4. Invite friends with a checkmark: +500 each.\n5. Join a clan: your points feed the clan board.",
    age: 49,
  },
  {
    id: "p_3",
    authorId: "u_mayhem",
    text: "Alright I've staked. Now send it baby 😎 Let's see some more people staking 🔥",
    age: 2,
  },
  {
    id: "p_4",
    authorId: "u_cryptking",
    text: "Call me the Key Sniper 💎 bought 0.4 keys of @klanofficial at 0.0009 ETH and the room is already full",
    age: 15,
  },
  {
    id: "p_5",
    authorId: "u_tone",
    text: "Good morning ☕️",
    age: 1,
  },
  {
    id: "p_6",
    authorId: "u_quinn",
    text: "🐸🪶",
    age: 1,
  },
  {
    id: "p_7",
    authorId: "u_fizz",
    text: "GM guys it's my first day on Klan and I'm liking it",
    age: 3,
  },
  {
    id: "p_8",
    authorId: "u_roger",
    text: "Don't forget to pledge the clan before the weekly board resets. Every point counts for the pack 🌊",
    age: 7,
  },
  {
    id: "p_9",
    authorId: "u_nifemii",
    text: "silent foxes climbing quietly again 🦊 nobody noticed until the leaderboard refreshed",
    age: 5,
  },
  {
    id: "p_10",
    authorId: "u_shabu",
    text: "GOOD MORNING Klan FAMILY 👀☕️ wolves are awake",
    age: 1,
  },
  {
    id: "p_11",
    authorId: "u_heyrdzy",
    text: "gm",
    age: 0.5,
  },
  {
    id: "p_12",
    authorId: "u_zel",
    text: "Happy sunday 💜 purple clanless no more — just joined the snakes",
    age: 2,
  },
  {
    id: "p_13",
    authorId: "u_dio",
    text: "Hopefully next week I can make money",
    age: 1,
  },
  {
    id: "p_14",
    authorId: "u_mayhem",
    text: "Battles reminder: engagement rate beats follower count. A 2k account that gets its people talking beats a 200k account that gets a shrug.",
    age: 26,
  },
];

const SEED_TRADES: Array<Omit<Trade, "id" | "createdAt"> & { minutes: number }> = [
  { keyOwnerHandle: "klanofficial", buyerHandle: "cryptking_1", action: "bought", priceUsd: 32.54, minutes: 6 },
  { keyOwnerHandle: "nifemii", buyerHandle: "crow_clan_bot", action: "sold", priceUsd: 0.18, minutes: 8 },
  { keyOwnerHandle: "koyuki_k", buyerHandle: "kamran_m", action: "bought", priceUsd: 0.18, minutes: 11 },
  { keyOwnerHandle: "cryptosia", buyerHandle: "musicheals", action: "sold", priceUsd: 0.78, minutes: 14 },
  { keyOwnerHandle: "mac_henry", buyerHandle: "evilgeniuses", action: "bought", priceUsd: 0.18, minutes: 17 },
  { keyOwnerHandle: "toneweb3", buyerHandle: "muquinn5", action: "bought", priceUsd: 4.12, minutes: 21 },
  { keyOwnerHandle: "zelweb3", buyerHandle: "heyrdzy", action: "bought", priceUsd: 0.07, minutes: 26 },
];

function buildSeed(): Db {
  const users: User[] = SEED_USERS.map((u) => ({ ...u, createdAt: daysAgo(60) }));
  const posts: Post[] = SEED_POSTS.map((p) => {
    const { age, ...rest } = p;
    return { ...rest, createdAt: hoursAgo(age) };
  });
  const likes: Like[] = [];
  // deterministic pseudo-likes
  posts.forEach((post, i) => {
    users.forEach((user, j) => {
      if ((i * 7 + j * 13) % 5 === 0 && user.id !== post.authorId) {
        likes.push({ postId: post.id, userId: user.id });
      }
    });
  });
  const trades: Trade[] = SEED_TRADES.map((t, i) => {
    const { minutes, ...rest } = t;
    return { id: `tr_${i}`, ...rest, createdAt: minutesAgo(minutes) };
  });
  return { users, clans: SEED_CLANS, posts, likes, trades };
}

/* ------------------------------------------------------------------ */
/*  Store (JSON file; swap for SQLite/Postgres later)                  */
/* ------------------------------------------------------------------ */

const DB_FILE = path.join(process.cwd(), "data", "db.json");

let cache: Db | null = null;

async function persist(db: Db): Promise<void> {
  await fs.mkdir(path.dirname(DB_FILE), { recursive: true });
  await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2), "utf8");
}

export async function getDb(): Promise<Db> {
  if (cache) return cache;
  try {
    const raw = await fs.readFile(DB_FILE, "utf8");
    cache = JSON.parse(raw) as Db;
  } catch {
    cache = buildSeed();
    await persist(cache);
  }
  return cache;
}

export async function saveDb(db: Db): Promise<void> {
  cache = db;
  await persist(db);
}

/** Mutate the DB safely (single-process dev server). */
export async function updateDb<T>(fn: (db: Db) => T): Promise<T> {
  const db = await getDb();
  const copy: Db = structuredClone(db);
  const result = fn(copy);
  await saveDb(copy);
  return result;
}

export const newId = (prefix: string) =>
  `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
