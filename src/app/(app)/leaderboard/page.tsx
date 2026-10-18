import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { compact, tierOf } from "@/lib/scoring";
import { Avatar, CheckBadge, ClanPill, TierBadge } from "@/components/ui";

export default async function LeaderboardPage({ searchParams }: PageProps<"/leaderboard">) {
  const { tab = "members" } = await searchParams;
  const user = await getSessionUser();
  const db = await getDb();
  const clansById = new Map(db.clans.map((c) => [c.id, c]));

  const members = [...db.users].sort((a, b) => b.points - a.points);
  const totals = new Map<string, number>();
  for (const u of db.users) if (u.clanId) totals.set(u.clanId, (totals.get(u.clanId) ?? 0) + u.points);
  const clans = db.clans
    .filter((c) => c.slug !== "none")
    .map((c) => ({ ...c, points: totals.get(c.id) ?? 0, members: db.users.filter((u) => u.clanId === c.id).length }))
    .sort((a, b) => b.points - a.points);

  return (
    <div className="pb-10">
      <header className="border-b border-edge px-5 py-6">
        <h1 className="text-2xl font-black">Leaderboard</h1>
        <p className="mt-1 text-sm text-muted">
          Points move every minute: keys, tasks and clan raids all count. Same rules, same caps, for everyone.
        </p>
      </header>

      <div className="tab-strip flex overflow-x-auto border-b border-edge" role="tablist">
        {[
          { id: "members", label: "Members" },
          { id: "clans", label: "Clans" },
        ].map((t) => (
          <Link
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            href={`/leaderboard?tab=${t.id}`}
            className={`whitespace-nowrap border-b-2 px-5 py-3.5 text-sm font-semibold ${
              tab === t.id ? "border-lime text-foreground" : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {tab === "clans" ? (
        <ol>
          {clans.map((c, i) => (
            <li key={c.id} className="row-card flex items-center gap-3 px-5 py-3.5">
              <span className={`w-8 shrink-0 font-mono text-sm ${i < 3 ? "text-lime" : "text-muted"}`}>{i + 1}</span>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[4px] border-2 border-edge" style={{ background: c.color }}>
                <span className="h-3 w-3 rounded-full" style={{ background: "#fffdf5" }} />
              </span>
              <span className="min-w-0 flex-1">
                <Link href={`/clans/${c.slug}`} className="block truncate font-bold hover:underline">
                  {c.name}
                </Link>
                <span className="block truncate text-xs text-muted">{c.members} members · “{c.motto}”</span>
              </span>
              <span className="shrink-0 text-right">
                <span className="block font-mono font-bold">{compact(c.points)}</span>
                <span className="block text-xs text-muted">points</span>
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <ol>
          {members.map((m, i) => {
            const clan = m.clanId ? clansById.get(m.clanId) : null;
            const mine = m.id === user?.id;
            return (
              <li key={m.id} className={`row-card flex items-center gap-3 px-5 py-3.5 ${mine ? "bg-lime/5" : ""}`}>
                <span className={`w-8 shrink-0 font-mono text-sm ${i < 3 ? "text-lime" : "text-muted"}`}>{i + 1}</span>
                <Link href={`/u/${m.handle}`}>
                  <Avatar name={m.name} avatarUrl={m.avatarUrl} clanColor={clan?.color} />
                </Link>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <Link href={`/u/${m.handle}`} className="truncate font-bold hover:underline">
                      {m.name}
                    </Link>
                    {m.verified && <CheckBadge />}
                    <TierBadge points={m.points} />
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-muted">
                    <span className="truncate">@{m.handle}</span>
                    {clan && (
                      <>
                        <span>·</span>
                        <ClanPill name={clan.name} color={clan.color} />
                      </>
                    )}
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block font-mono font-bold">{compact(m.points)}</span>
                  <span className="block text-xs text-muted">{tierOf(m.points).name}</span>
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
