import type { User } from "./db";

/* ------------------------------------------------------------------ */
/*  Klan Score: a single 0-100 number for the card                     */
/*  The formula is published and applied to every account the same.   */
/* ------------------------------------------------------------------ */

export function klanScore(user: Pick<User, "followers" | "verified" | "points">): number {
  const f = user.followers;
  // logarithmic reach: 1k followers ~ 34, 10k ~ 52, 100k ~ 70, 1M ~ 88
  let score = 12 + 15 * Math.log10(Math.max(f, 10));
  if (user.verified) score += 14;
  // activity/tenure weight from earned points (log scale, capped)
  score += Math.min(20, Math.log10(Math.max(user.points, 10) / 100) * 4);
  return Math.max(1, Math.min(100, Math.round(score)));
}

/* ------------------------------------------------------------------ */
/*  Influence Value: the dollar figure on the card                     */
/* ------------------------------------------------------------------ */

export function influenceValue(user: Pick<User, "followers" | "verified" | "points">): number {
  const reach = user.followers * 0.035;
  const check = user.verified ? 18 : 0;
  const tenure = Math.min(60, Math.log10(Math.max(user.points, 10) / 100) * 6);
  return Math.round((reach + check + tenure) * 100) / 100;
}

/* ------------------------------------------------------------------ */
/*  Tiers                                                              */
/* ------------------------------------------------------------------ */

export type Tier = {
  name: string;
  min: number;
  color: string;
  frame: string;
};

export const TIERS: Tier[] = [
  { name: "Initiate", min: 0, color: "#9c938a", frame: "linear-gradient(135deg,#9c938a,#6f6a61)" },
  { name: "Member", min: 50_000, color: "#b8a06a", frame: "linear-gradient(135deg,#b8a06a,#8a7448)" },
  { name: "Elder", min: 100_000, color: "#cfa85e", frame: "linear-gradient(135deg,#cfa85e,#a97e2f)" },
  { name: "Chieftain", min: 500_000, color: "#d4a44c", frame: "linear-gradient(135deg,#f0c674,#d4a44c)" },
  { name: "Legend", min: 2_000_000, color: "#f0c674", frame: "linear-gradient(135deg,#ffe4a8,#f0c674)" },
];

export function tierOf(points: number): Tier {
  let tier = TIERS[0];
  for (const t of TIERS) if (points >= t.min) tier = t;
  return tier;
}

/* ------------------------------------------------------------------ */
/*  Points economy (published numbers)                                 */
/* ------------------------------------------------------------------ */

export const POINT_RULES = {
  post: 400,
  postDailyCap: 750, // simplified: capped by MAX_POSTS_PER_DAY below
  like: 25,
  likeDailyCap: 100,
  joinClan: 1_000,
  signInDay: 50,
  maxPostsPerDay: 6,
  maxLikesPerDay: 80,
} as const;

/* ------------------------------------------------------------------ */
/*  Formatting                                                         */
/* ------------------------------------------------------------------ */

export function compact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1).replace(/\.0$/, "")}K`;
  return String(n);
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}
