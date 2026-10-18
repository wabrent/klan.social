import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { compact } from "@/lib/scoring";

export default async function ClansPage() {
  const user = await getSessionUser();
  const db = await getDb();

  const totals = new Map<string, number>();
  for (const u of db.users) if (u.clanId) totals.set(u.clanId, (totals.get(u.clanId) ?? 0) + u.points);

  const clans = db.clans
    .filter((c) => c.slug !== "none")
    .map((c) => ({
      ...c,
      points: totals.get(c.id) ?? 0,
      members: db.users.filter((u) => u.clanId === c.id).length,
    }))
    .sort((a, b) => b.points - a.points);

  return (
    <div className="pb-10">
      <header className="border-b border-edge px-5 py-6">
        <h1 className="text-2xl font-black">Clans</h1>
        <p className="mt-1 max-w-[560px] text-sm text-muted">
          Your points feed your clan. The oath costs nothing but decides the weekly board — the loudest clan takes the season pool
          together. One member, one clan.
        </p>
        {user && (
          <p className="mt-2 text-sm">
            You swore the oath to:{" "}
            {user.clanId ? (
              <Link href={`/clans/${db.clans.find((c) => c.id === user.clanId)?.slug}`} className="font-bold text-lime hover:underline">
                {db.clans.find((c) => c.id === user.clanId)?.name}
              </Link>
            ) : (
              <span className="text-muted">nobody yet — pick one below</span>
            )}
          </p>
        )}
      </header>

      <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
        {clans.map((c) => {
          const isMine = user?.clanId === c.id;
          return (
            <article key={c.id} className="card card-hover relative p-5">
              <div className="relative flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-[2px] border-2 border-edge" style={{ background: c.color }} />
                  <Link href={`/clans/${c.slug}`} className="text-lg font-black hover:underline">
                    {c.name}
                  </Link>
                </span>
                {isMine && (
                  <span className="rounded-[3px] border-2 border-edge bg-lime px-2 py-0.5 text-[11px] font-extrabold text-white">YOUR CLAN</span>
                )}
              </div>
              <p className="relative mt-2 text-sm text-muted italic">“{c.motto}”</p>
              <p className="relative mt-3 line-clamp-3 text-sm leading-6 text-muted">{c.description}</p>
              <dl className="relative mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-[4px] border-2 border-edge bg-surface-2 p-3">
                  <dt className="text-[11px] tracking-wider text-muted uppercase">Points</dt>
                  <dd className="font-mono font-bold" style={{ color: c.color }}>{compact(c.points)}</dd>
                </div>
                <div className="rounded-[4px] border-2 border-edge bg-surface-2 p-3">
                  <dt className="text-[11px] tracking-wider text-muted uppercase">Members</dt>
                  <dd className="font-mono font-bold">{c.members}</dd>
                </div>
              </dl>
              <Link href={`/clans/${c.slug}`} className="btn-ghost mt-4 w-full text-sm">
                Open clan
              </Link>
            </article>
          );
        })}
      </div>
    </div>
  );
}
