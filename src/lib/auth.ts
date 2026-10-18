import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { verifyMessage } from "viem";
import { CHAIN, shortAddress } from "./chain";
import { getDb, newId, updateDb, type User } from "./db";

/* ------------------------------------------------------------------ */
/*  Config                                                             */
/* ------------------------------------------------------------------ */

const SESSION_COOKIE = "klan_session";
const OAUTH_COOKIE = "klan_oauth";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

export const X_OAUTH = {
  clientId: process.env.X_OAUTH_CLIENT_ID ?? "",
  clientSecret: process.env.X_OAUTH_CLIENT_SECRET ?? "",
  scopes: ["tweet.read", "users.read", "offline.access", "like.read", "follow.read"].join(" "),
  redirectUri: () => `${siteUrl()}/api/auth/x/callback`,
};

export function xOAuthConfigured(): boolean {
  return Boolean(X_OAUTH.clientId && X_OAUTH.clientSecret);
}

export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

function secret(): string {
  return process.env.SESSION_SECRET ?? "klan-dev-secret-change-me-in-production";
}

/* ------------------------------------------------------------------ */
/*  Signed session cookie (no external deps)                           */
/* ------------------------------------------------------------------ */

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function sessionToken(userId: string): string {
  const expires = Date.now() + SESSION_TTL_MS;
  const payload = `${userId}.${expires}`;
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined): string | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [userId, expires, sig] = parts;
  const expected = sign(`${userId}.${expires}`);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  if (Number(expires) < Date.now()) return null;
  return userId;
}

/* ------------------------------------------------------------------ */
/*  Session helpers (server components & actions)                      */
/* ------------------------------------------------------------------ */

export async function getSessionUser(): Promise<User | null> {
  const store = await cookies();
  const userId = verifySessionToken(store.get(SESSION_COOKIE)?.value);
  if (!userId) return null;
  const db = await getDb();
  return db.users.find((u) => u.id === userId) ?? null;
}

export async function setSessionCookie(userId: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, sessionToken(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
}

/* ------------------------------------------------------------------ */
/*  X OAuth 2.0 (authorization code + PKCE)                            */
/* ------------------------------------------------------------------ */

export type PkceChallenge = {
  state: string;
  verifier: string;
  challenge: string;
};

export function base64url(buf: Buffer): string {
  return buf.toString("base64url");
}

export function createPkce(): PkceChallenge {
  const verifier = base64url(randomBytes(32));
  // S256: plain SHA-256 of the verifier, base64url-encoded (no padding)
  return {
    state: base64url(randomBytes(16)),
    verifier,
    challenge: createHash("sha256").update(verifier).digest("base64url"),
  };
}

export function authorizeUrl(pkce: PkceChallenge): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: X_OAUTH.clientId,
    redirect_uri: X_OAUTH.redirectUri(),
    scope: X_OAUTH.scopes,
    state: pkce.state,
    code_challenge: pkce.challenge,
    code_challenge_method: "S256",
  });
  return `https://x.com/i/oauth2/authorize?${params.toString()}`;
}

export async function storePkceCookie(pkce: PkceChallenge): Promise<void> {
  const store = await cookies();
  store.set(OAUTH_COOKIE, JSON.stringify(pkce), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });
}

export async function readPkceCookie(): Promise<PkceChallenge | null> {
  const store = await cookies();
  const raw = store.get(OAUTH_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PkceChallenge;
  } catch {
    return null;
  }
}

export async function clearPkceCookie(): Promise<void> {
  const store = await cookies();
  store.set(OAUTH_COOKIE, "", { path: "/", maxAge: 0 });
}

export type XUser = {
  id: string;
  name: string;
  username: string;
  description?: string;
  verified?: boolean;
  profile_image_url?: string;
  public_metrics?: {
    followers_count: number;
    following_count: number;
    tweet_count: number;
    listed_count: number;
  };
};

export async function exchangeCodeForXUser(code: string, verifier: string): Promise<XUser> {
  const tokenRes = await fetch("https://x.com/2/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: X_OAUTH.redirectUri(),
      client_id: X_OAUTH.clientId,
      code_verifier: verifier,
      ...(X_OAUTH.clientSecret ? { client_secret: X_OAUTH.clientSecret } : {}),
    }),
    cache: "no-store",
  });
  if (!tokenRes.ok) {
    throw new Error(`X token exchange failed: ${tokenRes.status} ${await tokenRes.text()}`);
  }
  const tokens = (await tokenRes.json()) as { access_token: string };

  const userRes = await fetch(
    "https://api.x.com/2/users/me?user.fields=public_metrics,profile_image_url,description,verified",
    { headers: { Authorization: `Bearer ${tokens.access_token}` }, cache: "no-store" },
  );
  if (!userRes.ok) {
    throw new Error(`X users/me failed: ${userRes.status} ${await userRes.text()}`);
  }
  const body = (await userRes.json()) as { data: XUser };
  return body.data;
}

/** Create or update a member from an X profile. */
export async function upsertUserFromX(x: XUser): Promise<User> {
  return updateDb((db) => {
    let user = db.users.find((u) => u.xId === x.id);
    const metrics = x.public_metrics;
    if (!user) {
      user = {
        id: newId("u"),
        xId: x.id,
        handle: x.username,
        name: x.name,
        bio: x.description ?? "",
        avatarUrl: x.profile_image_url ?? null,
        verified: Boolean(x.verified),
        followers: metrics?.followers_count ?? 0,
        following: metrics?.following_count ?? 0,
        clanId: null,
        points: 10_000, // welcome: your influence score starts working immediately
        createdAt: new Date().toISOString(),
        isDemo: false,
      };
      db.users.push(user);
    } else {
      user.name = x.name;
      user.handle = x.username;
      user.bio = x.description ?? user.bio;
      user.avatarUrl = x.profile_image_url ?? user.avatarUrl;
      user.verified = Boolean(x.verified);
      user.followers = metrics?.followers_count ?? user.followers;
      user.following = metrics?.following_count ?? user.following;
    }
    return user;
  });
}

/** Sign in as one of the seeded demo personas (used when X keys are absent). */
export async function signInDemo(handle: string): Promise<User | null> {
  const db = await getDb();
  const user = db.users.find((u) => u.handle.toLowerCase() === handle.toLowerCase());
  if (!user) return null;
  await setSessionCookie(user.id);
  return user;
}

/* ------------------------------------------------------------------ */
/*  Wallet sign-in (Robinhood Chain, SIWE-style)                       */
/* ------------------------------------------------------------------ */

const WALLET_COOKIE = "klan_wallet_login";
const WALLET_TTL_MS = 10 * 60 * 1000; // nonce живёт 10 минут

export function isValidAddress(address: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(address);
}

/** Выдаёт сообщение для подписи и запоминает nonce в httpOnly-cookie. */
export async function issueWalletLogin(address: string): Promise<string> {
  const nonce = randomBytes(16).toString("base64url");
  const message = [
    `${siteUrl()} wants you to sign in with your Robinhood Chain account:`,
    address,
    "",
    `Chain ID: ${CHAIN.id}`,
    `Nonce: ${nonce}`,
    `Issued At: ${new Date().toISOString()}`,
  ].join("\n");

  const payload = `${JSON.stringify({ address: address.toLowerCase(), nonce })}.${Date.now() + WALLET_TTL_MS}`;
  const store = await cookies();
  store.set(WALLET_COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: WALLET_TTL_MS / 1000,
  });
  return message;
}

/** Проверяет nonce из cookie и криптоподпись (viem, EOA). */
export async function verifyWalletLogin(address: string, message: string, signature: string): Promise<boolean> {
  const store = await cookies();
  const raw = store.get(WALLET_COOKIE)?.value;
  if (!raw) return false;
  const parts = raw.split(".");
  if (parts.length !== 3) return false;
  const [body, expires, sig] = parts;
  const expected = sign(`${body}.${expires}`);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  if (Number(expires) < Date.now()) return false;

  let stored: { address: string; nonce: string };
  try {
    stored = JSON.parse(body);
  } catch {
    return false;
  }
  if (stored.address !== address.toLowerCase()) return false;
  if (!message.includes(`Nonce: ${stored.nonce}`)) return false;
  if (!message.includes(`Chain ID: ${CHAIN.id}`)) return false;

  try {
    return await verifyMessage({ address: address as `0x${string}`, message, signature: signature as `0x${string}` });
  } catch {
    return false;
  }
}

/** Создаёт (или находит) участника по адресу кошелька. */
export async function upsertUserFromWallet(address: string): Promise<User> {
  return updateDb((db) => {
    let user = db.users.find((u) => u.walletAddress?.toLowerCase() === address.toLowerCase());
    if (!user) {
      let handle = `eth_${address.slice(2, 8).toLowerCase()}`;
      if (db.users.some((u) => u.handle === handle)) handle = `${handle}_${Math.floor(Math.random() * 900 + 100)}`;
      user = {
        id: newId("u"),
        xId: null,
        walletAddress: address,
        handle,
        name: shortAddress(address),
        bio: `Sworn on ${CHAIN.name}.`,
        avatarUrl: null,
        verified: false,
        followers: 0,
        following: 0,
        clanId: null,
        points: 10_000, // welcome
        createdAt: new Date().toISOString(),
        isDemo: false,
      };
      db.users.push(user);
    }
    return user;
  });
}
