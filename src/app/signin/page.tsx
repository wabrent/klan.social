import Link from "next/link";
import { redirect } from "next/navigation";
import { createDemoUserAction, demoSignInAction } from "@/lib/actions";
import { getSessionUser, xOAuthConfigured } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { compact, tierOf } from "@/lib/scoring";
import { KlanHeadIcon, XLogo } from "@/components/nav";
import { Avatar, TierBadge, Wordmark } from "@/components/ui";
import { WalletSignIn } from "@/components/wallet-signin";

export default async function SignInPage({ searchParams }: PageProps<"/signin">) {
  const { mode, error } = await searchParams;
  const user = await getSessionUser();
  if (user) redirect("/feed");

  const oauthReady = xOAuthConfigured();
  const db = await getDb();
  const demoUsers = [...db.users].sort((a, b) => b.followers - a.followers).slice(0, 8);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5 py-12">
      <Link href="/" className="mb-8 flex items-center gap-2.5">
        <span className="flex h-11 w-11 items-center justify-center rounded-[12px] border border-edge bg-surface text-gold shadow-soft">
          <KlanHeadIcon className="h-7 w-7" />
        </span>
        <Wordmark size="text-4xl" />
      </Link>

      <div className="card w-full max-w-[420px] p-7">
        <h1 className="display text-center text-3xl">Sign in</h1>
        <div className="rule-gold mx-auto mt-3 w-24" />
        <p className="mt-3 text-center text-sm text-muted">Your influence has value.</p>

        {error && (
          <p className="mt-4 rounded-[10px] border border-[#c65c47]/50 bg-[#c65c47]/12 px-3 py-2 text-sm font-semibold text-[#e8927d]">
            X sign-in failed ({error}). Try again.
          </p>
        )}

        <a href="/api/auth/x/login" className={`btn-primary mt-6 w-full ${oauthReady ? "" : "pointer-events-none opacity-50"}`}>
          <span className="inline-flex items-center gap-[0.3em]">
            <XLogo className="h-[0.9em] w-[0.9em]" /> Continue with X
          </span>
        </a>

        <div className="my-4 flex items-center gap-3 text-[10px] font-bold tracking-[0.2em] text-muted uppercase">
          <span className="h-px flex-1 bg-edge" /> or <span className="h-px flex-1 bg-edge" />
        </div>

        <WalletSignIn />
        <p className="mt-3 text-center text-xs text-muted">
          Only public X data is read.{" "}
          <Link href="/how-it-works" className="underline hover:text-foreground">
            How it works
          </Link>
        </p>

        {!oauthReady && (
          <div className="mt-5 rounded-[12px] border border-edge bg-black/25 p-3 text-xs leading-5 text-muted">
            <span className="font-semibold text-foreground">Demo mode.</span> X OAuth keys are not configured, so sign-in runs with demo
            personas. Set <code className="font-mono font-semibold text-gold">X_OAUTH_CLIENT_ID</code> /{" "}
            <code className="font-mono font-semibold text-gold">X_OAUTH_CLIENT_SECRET</code> in <code className="font-mono">.env.local</code> to
            enable real X sign-in.
          </div>
        )}
      </div>

      {!oauthReady && mode !== "x" && (
        <div className="card mt-5 w-full max-w-[420px] p-5">
          <h2 className="text-sm font-semibold">Pick a demo persona</h2>
          <ul className="mt-3 space-y-2">
            {demoUsers.map((d) => (
              <li key={d.id}>
                <form action={demoSignInAction} className="contents">
                  <input type="hidden" name="handle" value={d.handle} />
                  <button className="flex w-full items-center gap-3 rounded-[12px] border border-edge bg-surface-2 px-3 py-2 text-left transition-colors hover:border-gold/50 hover:bg-gold/[0.06]">
                    <Avatar name={d.name} avatarUrl={d.avatarUrl} size={34} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{d.name}</span>
                      <span className="block truncate text-xs text-muted">
                        @{d.handle} · {tierOf(d.points).name} · {compact(d.points)} pts
                      </span>
                    </span>
                    <TierBadge points={d.points} />
                  </button>
                </form>
              </li>
            ))}
          </ul>
          <form action={createDemoUserAction}>
            <button className="btn-ghost mt-4 w-full text-sm">Create a brand-new member</button>
          </form>
        </div>
      )}
    </div>
  );
}
