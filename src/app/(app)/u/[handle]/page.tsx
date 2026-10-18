import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { compact, influenceValue, klanScore, tierOf, timeAgo } from "@/lib/scoring";
import { Avatar, CheckBadge, ClanPill, ScoreBar, TierBadge } from "@/components/ui";
import { CHAIN, explorerAddressUrl, shortAddress } from "@/lib/chain";
import Link from "next/link";

export default async function ProfilePage({ params }: PageProps<"/u/[handle]">) {
  const { handle } = await params;
  const db = await getDb();
  const user = db.users.find((u) => u.handle.toLowerCase() === handle.toLowerCase());
  if (!user) notFound();

  const clan = user.clanId ? db.clans.find((c) => c.id === user.clanId) ?? null : null;
  const tier = tierOf(user.points);
  const score = klanScore(user);
  const value = influenceValue(user);
  const posts = db.posts.filter((p) => p.authorId === user.id).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  const likes = new Set(db.likes.filter((l) => l.userId === user.id).map((l) => l.postId));
  const rank = [...db.users].sort((a, b) => b.points - a.points).findIndex((u) => u.id === user.id) + 1;

  return (
    <div className="pb-10">
      {/* ---------------- the card ---------------- */}
      <header className="border-b-2 border-edge">
        <div aria-hidden className="h-6 w-full border-b-2 border-edge" style={{ background: tier.color }} />
        <div className="px-5 pb-6">
          <div className="-mt-10 flex items-end justify-between gap-4">
            <span className="rounded-[6px] border-2 border-edge bg-background p-1 shadow-[4px_4px_0_#141210]">
              <Avatar name={user.name} avatarUrl={user.avatarUrl} clanColor={clan?.color} size={80} />
            </span>
            <TierBadge points={user.points} className="mb-2 text-xs" />
          </div>

          <div className="mt-3 flex items-center gap-2">
            <h1 className="text-2xl font-black">{user.name}</h1>
            {user.verified && <CheckBadge />}
          </div>
          <p className="text-sm text-muted">@{user.handle} · #{rank} on the board</p>
          {user.walletAddress && (
            <p className="mt-2">
              <a
                href={explorerAddressUrl(user.walletAddress)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-[3px] border-2 border-edge bg-surface-2 px-2 py-0.5 font-mono text-[11px] font-bold hover:bg-lime/10"
                title={`Адрес в ${CHAIN.name}`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-lime" />
                {shortAddress(user.walletAddress)}
              </a>
            </p>
          )}
          {user.bio && <p className="mt-3 max-w-[560px] text-[15px] leading-6">{user.bio}</p>}

          {clan && (
            <p className="mt-3">
              <Link href={`/clans/${clan.slug}`}>
                <ClanPill name={clan.name} color={clan.color} />
              </Link>
            </p>
          )}

          <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="card p-3">
              <dt className="text-[11px] tracking-wider text-muted uppercase">Klan Value</dt>
              <dd className="font-mono text-lg font-bold text-lime">${value.toLocaleString("en-US", { minimumFractionDigits: 2 })}</dd>
            </div>
            <div className="card p-3">
              <dt className="text-[11px] tracking-wider text-muted uppercase">Klan Score</dt>
              <dd className="font-mono text-lg font-bold">
                {score}
                <span className="text-sm text-muted">/100</span>
              </dd>
              <div className="mt-2">
                <ScoreBar score={score} />
              </div>
            </div>
            <div className="card p-3">
              <dt className="text-[11px] tracking-wider text-muted uppercase">Points</dt>
              <dd className="font-mono text-lg font-bold">{compact(user.points)}</dd>
            </div>
            <div className="card p-3">
              <dt className="text-[11px] tracking-wider text-muted uppercase">Followers</dt>
              <dd className="font-mono text-lg font-bold">{compact(user.followers)}</dd>
            </div>
          </dl>

          <p className="mt-4 text-xs text-muted">
            Tier {tier.name} · member since {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })} ·
            following {compact(user.following)}
          </p>
        </div>
      </header>

      {/* ---------------- posts ---------------- */}
      <h2 className="px-5 pt-6 pb-2 text-lg font-black">Posts</h2>
      <div className="flex flex-col">
        {posts.map((post) => (
          <article key={post.id} className="row-card px-5 py-4">
            <div className="flex items-center gap-1.5 text-sm text-muted">
              <time suppressHydrationWarning title={post.createdAt}>
                {timeAgo(post.createdAt)}
              </time>
              {post.pinned && <span className="rounded bg-surface-2 px-1.5 py-px text-[11px] font-semibold">Pinned</span>}
            </div>
            <p className="mt-1 text-[15px] leading-6 whitespace-pre-wrap break-words">{post.text}</p>
            <p className="mt-2 text-xs text-muted">
              {compact(db.likes.filter((l) => l.postId === post.id).length)} likes{likes.has(post.id) ? " · you liked this" : ""}
            </p>
          </article>
        ))}
        {posts.length === 0 && <p className="px-5 py-8 text-center text-sm text-muted">No posts yet.</p>}
      </div>
    </div>
  );
}
