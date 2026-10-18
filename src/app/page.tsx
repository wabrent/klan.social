import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { compact, influenceValue, klanScore, TIERS } from "@/lib/scoring";
import { KlanEmblem, Wordmark } from "@/components/ui";
import { XLogo } from "@/components/nav";

export default async function LandingPage() {
  const user = await getSessionUser();
  const db = await getDb();
  const members = db.users.length;
  const points = db.users.reduce((s, u) => s + u.points, 0);

  return (
    <div className="min-h-screen">
      {/* ---------------- nav ---------------- */}
      <nav className="mx-auto flex max-w-[1160px] items-center justify-between px-5 py-5">
        <span className="flex items-center gap-2.5">
          <KlanEmblem className="h-8 w-8" />
          <Wordmark size="text-2xl" />
        </span>
        <span className="flex items-center gap-2">
          <Link href="/feed" className="btn-ghost text-sm">
            Open feed
          </Link>
          <Link href="/signin" className="btn-primary text-sm">
            <span className="inline-flex items-center gap-[0.3em]">
              Join <XLogo className="h-[0.85em] w-[0.85em]" />
            </span>
          </Link>
        </span>
      </nav>

      {/* ---------------- hero ---------------- */}
      <header className="relative overflow-hidden">
        <div className="relative mx-auto max-w-[900px] px-5 pt-14 pb-16 text-center">
          <p className="fade-up badge-chip mb-7">
            <span className="h-2 w-2 rounded-full bg-lime" /> Season 2 · the clan board is live
          </p>

          <div className="fade-up mb-6 flex justify-center">
            <KlanEmblem className="h-20 w-20" />
          </div>

          <h1 className="fade-up display text-[3.2rem] leading-[0.98] sm:text-7xl md:text-[5.2rem]">
            Your influence
            <br />
            <span className="text-clay">builds the clan.</span>
          </h1>

          <svg viewBox="0 0 300 26" preserveAspectRatio="none" aria-hidden className="intro-underline mx-auto mt-1 h-5 w-[240px] opacity-80">
            <path
              pathLength={1}
              strokeWidth="2.6"
              d="M4 17 C 48 7, 108 5, 168 10 S 262 17, 296 6 C 268 15, 214 21, 150 20 S 72 20, 38 24"
            />
          </svg>

          <p className="fade-up mx-auto mt-7 max-w-[580px] text-lg leading-8 text-muted">
            Klan reads only your public X data and turns it into a score, a card and points. Then you swear the oath — because solo
            ranks, but clans rule the board.
          </p>

          <div className="fade-up mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link href={user ? "/feed" : "/signin"} className="btn-primary h-13 px-8 py-4 text-base">
              {user ? "Open my card" : "Continue with X"}
            </Link>
            <Link href="/how-it-works" className="btn-ghost h-13 px-8 py-4 text-base">
              How it works
            </Link>
          </div>

          <dl className="fade-up mx-auto mt-14 grid max-w-[560px] grid-cols-3 divide-x-2 divide-edge rounded-[4px] border-2 border-edge bg-surface px-2 py-5 shadow-[6px_6px_0_#141210]">
            {[
              { label: "Members", value: compact(members * 137) },
              { label: "Points earned", value: compact(points) },
              { label: "Clans", value: String(db.clans.length - 1) },
            ].map((s) => (
              <div key={s.label} className="px-4">
                <dt className="text-[11px] font-bold tracking-[0.14em] text-muted uppercase">{s.label}</dt>
                <dd className="display mt-1 text-3xl text-clay">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      {/* ---------------- steps ---------------- */}
      <section className="mx-auto max-w-[1160px] px-5 py-20">
        <p className="eyebrow text-center">Three steps</p>
        <h2 className="display mt-2 text-center text-4xl sm:text-5xl">One oath.</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            {
              n: "01",
              title: "Connect X",
              body: "Get your Estimated Influence Value, your Klan Score out of 100 and a card to share. Read-only, public data only.",
            },
            {
              n: "02",
              title: "Earn points",
              body: "Daily tasks, invites, holding and trading keys, battles and staking. Same caps for everyone, no manual edits.",
            },
            {
              n: "03",
              title: "Swear the oath",
              body: "Join a clan. Your points feed the clan board, and the loudest clan takes the season pool together.",
            },
          ].map((s) => (
            <div key={s.n} className="card card-hover relative overflow-hidden p-7">
              <span aria-hidden className="display pointer-events-none absolute -top-3 -right-1 text-[6rem] leading-none text-clay">
                {s.n}
              </span>
              <h3 className="display relative text-2xl">{s.title}</h3>
              <p className="relative mt-3 text-[15px] leading-7 text-muted">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- card preview ---------------- */}
      <section className="border-y border-edge-soft bg-surface/50">
        <div className="mx-auto grid max-w-[1160px] items-center gap-14 px-5 py-20 md:grid-cols-2">
          <div>
            <p className="eyebrow">The card</p>
            <h2 className="display mt-2 text-4xl leading-tight sm:text-5xl">
              A value for your voice,
              <br />
              and a card to show it.
            </h2>
            <p className="mt-5 text-[17px] leading-8 text-muted">
              Attention on X is worth money, but the people who create it rarely see a number for it. Klan publishes the formula and
              scores every account the same way: reach on a logarithmic scale, a checkmark bonus and your earned-points weight.
            </p>
            <ul className="mt-7 space-y-3 text-[15px] text-muted">
              {[
                "Read-only sign-in — we never see your password or store your token.",
                "One identity: your X account is you, one member one card.",
                "Tiers: Initiate, Member, Elder, Chieftain, Legend.",
              ].map((t) => (
                <li key={t} className="flex gap-3">
                  <KlanEmblem className="mt-0.5 h-5 w-5 shrink-0" color="var(--moss)" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <Link href="/how-it-works" className="btn-ghost mt-8">
              See the full formula
            </Link>
          </div>

          <div className="card relative mx-auto w-full max-w-[380px] p-7">
            <div className="relative flex items-center gap-4">
              <span className="flex h-16 w-16 items-center justify-center rounded-[4px] border-2 border-edge bg-surface shadow-[4px_4px_0_#141210]">
                <KlanEmblem className="h-10 w-10" />
              </span>
              <div>
                <p className="display text-2xl">wahab.eth</p>
                <p className="text-sm text-muted">@wahab</p>
              </div>
            </div>
            <div className="relative mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-[4px] border-2 border-edge bg-surface-2 p-4">
                <p className="text-[11px] font-extrabold tracking-[0.14em] text-muted uppercase">Klan Value</p>
                <p className="font-mono text-2xl font-bold text-clay">
                  ${influenceValue({ followers: 12400, verified: true, points: 240_000 }).toFixed(2)}
                </p>
              </div>
              <div className="rounded-[4px] border-2 border-edge bg-surface-2 p-4">
                <p className="text-[11px] font-extrabold tracking-[0.14em] text-muted uppercase">Klan Score</p>
                <p className="font-mono text-2xl font-bold">
                  {klanScore({ followers: 12400, verified: true, points: 240_000 })}
                  <span className="text-muted">/100</span>
                </p>
              </div>
            </div>
            <div className="relative mt-3 flex items-center justify-between rounded-[4px] border-2 border-edge bg-surface-2 p-4">
              <span className="text-[11px] font-extrabold tracking-[0.14em] text-muted uppercase">Tier</span>
              <span className="rounded-[3px] border-2 border-edge bg-lime px-3 py-1 text-xs font-extrabold text-white">
                CHIEFTAIN
              </span>
            </div>
            <div className="relative mt-3 flex items-center justify-between rounded-[4px] border-2 border-edge bg-surface-2 p-4">
              <span className="text-[11px] font-extrabold tracking-[0.14em] text-muted uppercase">Clan</span>
              <span className="rounded-[3px] border-2 border-edge bg-[#1d4ed8] px-3 py-1 text-xs font-extrabold text-white">
                Bears of North
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- tiers ---------------- */}
      <section className="mx-auto max-w-[1160px] px-5 py-20">
        <p className="eyebrow text-center">The climb</p>
        <h2 className="display mt-2 text-center text-4xl sm:text-5xl">Five tiers. Long by design.</h2>
        <p className="mx-auto mt-4 max-w-[540px] text-center text-muted">
          The influence score alone tops out at 10 000 points, so every tier above Initiate has to be earned by showing up every day.
        </p>
        <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {TIERS.map((t, i) => (
            <li key={t.name} className="card card-hover p-5">
              <span className="flex items-center justify-between">
                <span
                  className="rounded-[3px] border-2 border-edge px-2.5 py-0.5 text-[11px] font-extrabold tracking-wider"
                  style={{ color: t.color === "#141210" ? "#fffdf5" : t.color, background: t.color === "#141210" ? "#fffdf5" : "transparent" }}
                >
                  {t.name.toUpperCase()}
                </span>
                <span className="font-mono text-xs text-muted">{String(i + 1).padStart(2, "0")}</span>
              </span>
              <p className="mt-4 font-mono text-sm text-muted">{compact(t.min)}+ points</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------------- clans ---------------- */}
      <section className="border-t border-edge-soft bg-surface/50">
        <div className="mx-auto max-w-[1160px] px-5 py-20">
          <p className="eyebrow text-center">The packs</p>
          <h2 className="display mt-2 text-center text-4xl sm:text-5xl">Join a clan, rank together.</h2>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {db.clans
              .filter((c) => c.slug !== "none")
              .map((c) => (
                <Link key={c.id} href={`/clans/${c.slug}`} className="card card-hover p-6">
                  <span className="flex items-center gap-2.5">
                    <KlanEmblem className="h-8 w-8" color={c.color} />
                    <span className="display text-lg">{c.name}</span>
                  </span>
                  <p className="mt-3 text-sm text-muted italic">“{c.motto}”</p>
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* ---------------- footer ---------------- */}
      <footer className="mx-auto flex max-w-[1160px] flex-col items-center gap-4 px-5 py-12 text-sm text-muted">
        <span className="flex items-center gap-2">
          <KlanEmblem className="h-5 w-5" />
          <span>© {new Date().getFullYear()} klan.social</span>
        </span>
        <p className="max-w-[560px] text-center text-xs leading-5">
          Klan Score and Influence Value are in-app scores, not market values. Klan Points have no monetary value. Nothing here is
          financial advice.
        </p>
        <span className="flex gap-5">
          <Link href="/feed" className="hover:text-foreground">
            Feed
          </Link>
          <Link href="/leaderboard" className="hover:text-foreground">
            Leaderboard
          </Link>
          <Link href="/clans" className="hover:text-foreground">
            Clans
          </Link>
          <Link href="/how-it-works" className="hover:text-foreground">
            Docs
          </Link>
        </span>
      </footer>
    </div>
  );
}
