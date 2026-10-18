"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  clearSessionCookie,
  getSessionUser,
  issueWalletLogin,
  isValidAddress,
  setSessionCookie,
  signInDemo,
  upsertUserFromWallet,
  verifyWalletLogin,
} from "./auth";
import { newId, updateDb, type Post } from "./db";
import { POINT_RULES } from "./scoring";

function revalidateAll() {
  revalidatePath("/", "layout");
}

const isToday = (iso: string) => new Date(iso).toDateString() === new Date().toDateString();

export async function demoSignInAction(formData: FormData): Promise<void> {
  const handle = String(formData.get("handle") ?? "");
  const user = await signInDemo(handle);
  if (!user) return;
  revalidateAll();
  redirect("/feed");
}

export async function createDemoUserAction(): Promise<void> {
  const handle = `newcomer_${Math.floor(Math.random() * 900 + 100)}`;
  const id = await updateDb((db) => {
    const user = {
      id: newId("u"),
      xId: null,
      handle,
      name: "Newcomer",
      bio: "Just swore the oath. Watching the board.",
      avatarUrl: null,
      verified: false,
      followers: 120,
      following: 340,
      clanId: null,
      points: 10_000,
      createdAt: new Date().toISOString(),
      isDemo: true,
    };
    db.users.push(user);
    return user.id;
  });
  await setSessionCookie(id);
  revalidateAll();
  redirect("/feed");
}

export async function signOutAction(): Promise<void> {
  await clearSessionCookie();
  revalidateAll();
  redirect("/");
}

/* ------------------------------------------------------------------ */
/*  Wallet sign-in (Robinhood Chain)                                   */
/* ------------------------------------------------------------------ */

/** Возвращает сообщение, которое нужно подписать кошельком. */
export async function requestWalletLoginAction(address: string): Promise<string> {
  if (!isValidAddress(address)) throw new Error("Invalid wallet address");
  return issueWalletLogin(address);
}

/** Проверяет подпись и создаёт сессию. true — успех. */
export async function confirmWalletLoginAction(address: string, message: string, signature: string): Promise<boolean> {
  if (!isValidAddress(address)) return false;
  const ok = await verifyWalletLogin(address, message, signature);
  if (!ok) return false;
  const user = await upsertUserFromWallet(address);
  await setSessionCookie(user.id);
  revalidateAll();
  return true;
}

export async function createPostAction(formData: FormData): Promise<void> {
  const text = String(formData.get("text") ?? "").trim().slice(0, 500);
  if (!text) return;
  const user = await getSessionUser();
  if (!user) redirect("/signin");

  await updateDb((db) => {
    const todays = db.posts.filter((p) => p.authorId === user.id && isToday(p.createdAt)).length;
    const me = db.users.find((u) => u.id === user.id)!;
    if (todays < POINT_RULES.maxPostsPerDay) {
      me.points += POINT_RULES.post;
    }
    const post: Post = { id: newId("p"), authorId: user.id, text, createdAt: new Date().toISOString() };
    db.posts.unshift(post);
  });
  revalidateAll();
}

export async function toggleLikeAction(postId: string): Promise<void> {
  const user = await getSessionUser();
  if (!user) redirect("/signin");

  await updateDb((db) => {
    const idx = db.likes.findIndex((l) => l.postId === postId && l.userId === user.id);
    if (idx >= 0) {
      db.likes.splice(idx, 1);
      return;
    }
    const todays = db.likes.filter((l) => l.userId === user.id && isToday(l.createdAt ?? "")).length;
    if (todays < POINT_RULES.maxLikesPerDay) {
      const me = db.users.find((u) => u.id === user.id);
      if (me) me.points += POINT_RULES.like;
    }
    db.likes.push({ postId, userId: user.id, createdAt: new Date().toISOString() });
  });
  revalidateAll();
}

export async function joinClanAction(clanId: string): Promise<void> {
  const user = await getSessionUser();
  if (!user) redirect("/signin");

  await updateDb((db) => {
    const me = db.users.find((u) => u.id === user.id);
    const clan = db.clans.find((c) => c.id === clanId);
    if (!me || !clan || me.clanId === clanId) return;
    const firstJoin = me.clanId === null;
    me.clanId = clanId;
    if (firstJoin) me.points += POINT_RULES.joinClan;
  });
  revalidateAll();
}

export async function leaveClanAction(): Promise<void> {
  const user = await getSessionUser();
  if (!user) redirect("/signin");

  await updateDb((db) => {
    const me = db.users.find((u) => u.id === user.id);
    if (me) me.clanId = null;
  });
  revalidateAll();
}
