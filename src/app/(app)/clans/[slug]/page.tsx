import { notFound } from "next/navigation";
import { joinClanAction, leaveClanAction } from "@/lib/actions";
import { getSessionUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { compact, tierOf } from "@/lib/scoring";
import { Avatar, CheckBadge, TierBadge } from "@/components/ui";
import { OathButton } from "@/components/oath-button";
import Link from "next/link";

export default async function ClanPage({ params }: PageProps<"/clans/[slug]">) {
  const { slug } = await params;
  const db = await getDb();
  const user = await getSessionUser();

  const clan = db.clans.find((c) => c.slug === slug);
  if (!clan || clan.slug === "none") notFound();

  const members = db.users.filter((u) => u.clanId === clan.id).sort((a, b) => b.points - a.points);
  const totalPoints = members.reduce((s, m) => s + m.points, 0);
  const isMine = user?.clanId === clan.id;

  return (
    <div className="pb-10">
      <header className="relative border-b-2 border-edge px-5 py-8">
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-[4px] border-2 border-edge shadow-[4px_4px_0_#141210]" style={{ background: clan.color }}>
              <span className="h-5 w-5 rounded-full border-2" style={{ background: "#fffdf5", borderColor: "#fffdf5" }} />
            </span>
            <div>
              <h1 className="text-3xl font-black" style={{ color: clan.color }}>
                {clan.name}
              </h1>
              <p className="text-sm text-muted italic">“{clan.motto}”</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              isMine ? (
                <form action={leaveClanAction}>
                  <button className="btn-ghost text-sm">Leave the clan</button>
                </form>
              ) : (
                <form action={joinClanAction.bind(null, clan.id)}>
                  <button className="btn-primary text-sm">Swear the oath (+{compact(1000)} pts)</button>
                </form>
              )
            ) : (
              <Link href="/signin" className="btn-primary text-sm">
                Connect X to join
              </Link>
            )}
          </div>
          {user?.walletAddress && <OathButton clanSlug={clan.slug} clanName={clan.name} hasWallet />}
        </div>
        <p className="relative mt-5 max-w-[640px] text-sm leading-6 text-muted">{clan.description}</p>
        <dl className="relative mt-5 grid max-w-[420px] grid-cols-3 gap-3">
          {[
            { label: "Points", value: compact(totalPoints) },
            { label: "Members", value: String(members.length) },
            { label: "Founded", value: new Date(clan.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) },
          ].map((s) => (
            <div key={s.label} className="rounded-[4px] border-2 border-edge bg-surface p-3">
              <dt className="text-[11px] tracking-wider text-muted uppercase">{s.label}</dt>
              <dd className="font-mono text-lg font-bold">{s.value}</dd>
            </div>
          ))}
        </dl>
      </header>

      <h2 className="px-5 pt-6 pb-2 text-lg font-black">Members</h2>
      <ol>
        {members.map((m, i) => (
          <li key={m.id} className={`row-card flex items-center gap-3 px-5 py-3.5 ${m.id === user?.id ? "bg-lime/5" : ""}`}>
            <span className={`w-8 shrink-0 font-mono text-sm ${i < 3 ? "text-lime" : "text-muted"}`}>{i + 1}</span>
            <Link href={`/u/${m.handle}`}>
              <Avatar name={m.name} avatarUrl={m.avatarUrl} clanColor={clan.color} />
            </Link>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1.5">
                <Link href={`/u/${m.handle}`} className="truncate font-bold hover:underline">
                  {m.name}
                </Link>
                {m.verified && <CheckBadge />}
                <TierBadge points={m.points} />
              </span>
              <span className="block truncate text-xs text-muted">
                @{m.handle} · {tierOf(m.points).name} · {compact(m.followers)} followers
              </span>
            </span>
            <span className="shrink-0 font-mono font-bold">{compact(m.points)}</span>
          </li>
        ))}
        {members.length === 0 && <li className="px-5 py-8 text-center text-sm text-muted">No members yet. Be the first.</li>}
      </ol>
    </div>
  );
}
