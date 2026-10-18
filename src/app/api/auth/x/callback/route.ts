import { NextResponse } from "next/server";
import { clearPkceCookie, exchangeCodeForXUser, readPkceCookie, setSessionCookie, upsertUserFromX } from "@/lib/auth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");

  if (oauthError) {
    return NextResponse.redirect(new URL(`/signin?error=${encodeURIComponent(oauthError)}`, request.url));
  }

  const pkce = await readPkceCookie();
  if (!pkce || !code || !state || state !== pkce.state) {
    return NextResponse.redirect(new URL("/signin?error=state_mismatch", request.url));
  }

  try {
    const xUser = await exchangeCodeForXUser(code, pkce.verifier);
    const user = await upsertUserFromX(xUser);
    await clearPkceCookie();
    await setSessionCookie(user.id);
    return NextResponse.redirect(new URL("/feed", request.url));
  } catch (err) {
    console.error("[auth] X OAuth failed:", err);
    return NextResponse.redirect(new URL("/signin?error=oauth_failed", request.url));
  }
}
