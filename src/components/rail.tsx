import Link from "next/link";
import type { Trade, User } from "@/lib/db";
import { compact } from "@/lib/scoring";
import { Avatar, ClanPill } from "./ui";
import { XLogo } from "./nav";

type ClanWithPoints = { id: string; slug: string; name: string; color: string; points: number };

export function LiveTicker({ trades }: { trades: Trade[] }) {
  const items = [...trades, ...trades];
  return (
    <section aria-label="Live trades" className="ticker mb-4 flex items-center px-4 py-2.5">
      <div className="ticker-viewport min-w-0 flex-1 overflow-hidden">
        <div className="ticker-track">
          {items.map((t, i) => (
            <span key={`${t.id}_${i}`} className="inline-flex items-center gap-1.5 text-[13px]">
              <span className="font-semibold text-foreground">@{t.buyerHandle}</span>
              <span className="font-semibold text-gold">{t.action}</span>
              <span className="text-muted">key of</span>
              <span className="font-semibold text-foreground">@{t.keyOwnerHandle}</span>
              <span className="text-muted/50">·</span>
              <span className="font-mono text-gold-bright/90">${t.priceUsd.toFixed(2)}</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export function RightRail({
  trades,
  clans,
  newMembers,
  user,
}: {
  trades: Trade[];
  clans: ClanWithPoints[];
  newMembers: User[];
  user: User | null;
}) {
  return (
    <aside className="sticky top-0 hidden h-screen w-[380px] shrink-0 overflow-y-auto px-6 py-4 xl:block">
      <input
        readOnly
        placeholder="Search members or clans"
        className="mb-4 w-full rounded-md border border-edge bg-surface px-4 py-2.5 text-sm text-muted"
      />

      {!user && (
        <div className="card mb-4 p-4">
          <h2 className="display text-lg">New to Klan?</h2>
          <p className="mt-1 text-sm text-muted">Connect X to get your card, your points and your own keys.</p>
          <Link href="/signin" className="btn-primary mt-3 w-full">
            <span className="inline-flex items-center gap-[0.3em]">
              Connect <XLogo className="h-[0.9em] w-[0.9em]" />
            </span>
          </Link>
        </div>
      )}

      <div className="card mb-4 p-4">
        <h2 className="display mb-3 text-lg">Live trades</h2>
        <ul className="space-y-3">
          {trades.slice(0, 5).map((t) => (
            <li key={t.id} className="flex items-center justify-between gap-2 text-sm">
              <span className="min-w-0">
                <span className="block truncate font-semibold">@{t.keyOwnerHandle}</span>
                <span className="block truncate text-xs">
                  <span className={t.action === "bought" ? "text-lime" : "text-rose"}>{t.action === "bought" ? "Bought" : "Sold"}</span>{" "}
                  <span className="text-muted">by @{t.buyerHandle}</span>
                </span>
              </span>
              <span className="shrink-0 font-mono">${t.priceUsd.toFixed(2)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="card mb-4 p-4">
        <h2 className="display mb-3 text-lg">Trending clans</h2>
        <ul className="space-y-3">
          {clans.slice(0, 5).map((c) => (
            <li key={c.id}>
              <Link href={`/clans/${c.slug}`} className="flex items-center justify-between gap-2 text-sm hover:underline">
                <ClanPill name={c.name} color={c.color} />
                <span className="font-mono text-muted">{compact(c.points)} pts</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="card p-4">
        <h2 className="display mb-3 text-lg">New on Klan</h2>
        <ul className="space-y-3">
          {newMembers.map((m) => (
            <li key={m.id}>
              <Link href={`/u/${m.handle}`} className="flex items-center gap-2.5 hover:bg-surface-2 rounded-lg p-1 -m-1">
                <Avatar name={m.name} avatarUrl={m.avatarUrl} size={36} />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{m.name}</span>
                  <span className="block truncate text-xs text-muted">@{m.handle}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
