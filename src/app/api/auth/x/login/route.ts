import { NextResponse } from "next/server";
import { authorizeUrl, createPkce, storePkceCookie, xOAuthConfigured } from "@/lib/auth";

export async function GET(request: Request) {
  // Without X developer keys the app falls back to the demo sign-in page.
  if (!xOAuthConfigured()) {
    return NextResponse.redirect(new URL("/signin?mode=demo", request.url));
  }

  const pkce = createPkce();
  await storePkceCookie(pkce);
  return NextResponse.redirect(authorizeUrl(pkce));
}
