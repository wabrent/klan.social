import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { Composer } from "@/components/composer";
import { PostCard } from "@/components/post-card";
import { LiveTicker, RightRail } from "@/components/rail";
import { XLogo } from "@/components/nav";

const TABS = [
  { id: "for-you", label: "For You" },
  { id: "trending", label: "Trending" },
  { id: "latest", label: "Latest" },
] as const;

export default async function FeedPage({ searchParams }: PageProps<"/feed">) {
  const { tab = "for-you" } = await searchParams;
  const user = await getSessionUser();
  const db = await getDb();

  const usersById = new Map(db.users.map((u) => [u.id, u]));
  const clansById = new Map(db.clans.map((c) => [c.id, c]));
  const likeCount = (postId: string) => db.likes.filter((l) => l.postId === postId).length;
  const likedPosts = new Set(db.likes.filter((l) => l.userId === user?.id).map((l) => l.postId));

  let posts = [...db.posts];
  if (tab === "latest") {
    posts.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  } else if (tab === "trending") {
    posts.sort((a, b) => likeCount(b.id) - likeCount(a.id) || +new Date(b.createdAt) - +new Date(a.createdAt));
  } else {
    // For You: pinned first, then a blend of author weight and recency
    posts.sort((a, b) => {
      if (Boolean(a.pinned) !== Boolean(b.pinned)) return a.pinned ? -1 : 1;
      const weight = (p: (typeof posts)[number]) => {
        const author = usersById.get(p.authorId);
        const ageHours = (Date.now() - +new Date(p.createdAt)) / 3_600_000;
        return Math.log10(Math.max(author?.points ?? 10, 10)) * 2 + likeCount(p.id) - ageHours * 0.15;
      };
      return weight(b) - weight(a);
    });
  }

  const newMembers = [...db.users].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 4);
  const trendingClans = clanPoints(db).slice(0, 5);

  return (
    <div className="flex min-h-screen">
      <div className="min-w-0 flex-1">
        <div className="tab-strip sticky top-14 z-20 flex overflow-x-auto border-b border-edge bg-background/90 backdrop-blur-xl md:top-0" role="tablist" aria-label="Feed">
          {TABS.map((t) => (
            <Link
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              href={`/feed?tab=${t.id}`}
              className={`whitespace-nowrap border-b-2 px-5 py-3.5 text-sm font-semibold transition-colors ${
                tab === t.id ? "border-lime text-foreground" : "border-transparent text-muted hover:text-foreground"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>

        <LiveTicker trades={db.trades} />

        {user ? (
          <Composer userName={user.name.split(" ")[0]} />
        ) : (
          <div className="flex items-center justify-between gap-3 border-b border-edge px-4 py-3">
            <p className="text-[15px] text-muted">Connect X to post.</p>
            <Link href="/signin" className="btn-primary h-9 whitespace-nowrap px-4 text-sm">
              <span className="inline-flex items-center gap-[0.3em]">
                Connect <XLogo className="h-[0.9em] w-[0.9em]" />
              </span>
            </Link>
          </div>
        )}

        <div className="flex flex-col">
          {posts.map((post) => {
            const author = usersById.get(post.authorId);
            if (!author) return null;
            return (
              <PostCard
                key={post.id}
                post={post}
                author={author}
                clan={author.clanId ? clansById.get(author.clanId) ?? null : null}
                likes={likeCount(post.id)}
                likedByMe={likedPosts.has(post.id)}
                canLike={Boolean(user)}
                pinned={post.pinned}
              />
            );
          })}
        </div>
      </div>

      <RightRail trades={[...db.trades].reverse()} clans={trendingClans} newMembers={newMembers} user={user} />
    </div>
  );
}

function clanPoints(db: Awaited<ReturnType<typeof getDb>>) {
  const totals = new Map<string, number>();
  for (const u of db.users) {
    if (u.clanId) totals.set(u.clanId, (totals.get(u.clanId) ?? 0) + u.points);
  }
  return db.clans
    .map((c) => ({ ...c, points: totals.get(c.id) ?? 0 }))
    .filter((c) => c.slug !== "none")
    .sort((a, b) => b.points - a.points);
}
