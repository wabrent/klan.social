import Link from "next/link";
import { toggleLikeAction } from "@/lib/actions";
import type { Clan, Post, User } from "@/lib/db";
import { compact, timeAgo } from "@/lib/scoring";
import { Avatar, CheckBadge, ClanPill, TierBadge } from "./ui";

export function PostCard({
  post,
  author,
  clan,
  likes,
  likedByMe,
  canLike,
  pinned,
}: {
  post: Post;
  author: User;
  clan: Clan | null;
  likes: number;
  likedByMe: boolean;
  canLike: boolean;
  pinned?: boolean;
}) {
  return (
    <article className="row-card flex items-start gap-3 px-4 py-3">
      <Link href={`/u/${author.handle}`} className="shrink-0">
        <Avatar name={author.name} avatarUrl={author.avatarUrl} clanColor={clan?.color} />
      </Link>
      <div className="min-w-0 flex-1">
        {pinned && (
          <div className="mb-1 flex items-center gap-1 text-xs font-semibold text-muted">
            <svg viewBox="0 0 256 256" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
              <path d="M234.67,184.44a12,12,0,0,1-14.9,16.15L184,192.94,138.76,226a12,12,0,0,1-11.52,0L82,192.94l-35.77,7.61A12,12,0,0,1,30.4,188L44,142.94,25.79,98.75A12,12,0,0,1,43,86.83L88,74.94,118.76,28a12,12,0,0,1,21.48,0L170.76,74.94,215.76,88a12,12,0,0,1-3.2,23.5L170,142.94l13.6,45.05Z" />
            </svg>
            Pinned
          </div>
        )}
        <div className="flex min-w-0 flex-wrap items-center gap-x-1.5">
          <Link href={`/u/${author.handle}`} className="truncate text-[15px] font-bold hover:underline">
            {author.name}
          </Link>
          {author.verified && <CheckBadge />}
          {clan && <ClanPill name={clan.name} color={clan.color} />}
          <TierBadge points={author.points} />
          <span className="truncate text-sm text-muted">@{author.handle}</span>
          <span className="text-muted">·</span>
          <time suppressHydrationWarning className="text-sm text-muted" title={post.createdAt}>
            {timeAgo(post.createdAt)}
          </time>
        </div>
        <p className="mt-1 text-[15px] leading-6 whitespace-pre-wrap break-words">{post.text}</p>

        <div className="mt-2 flex items-center gap-6 text-muted">
          <span className="flex items-center gap-1.5 text-sm">
            <svg viewBox="0 0 256 256" className="h-4 w-4" fill="currentColor" aria-hidden>
              <path d="M216,48H40A16,16,0,0,0,24,64V224a8.84,8.84,0,0,0,3.34,7l40.36-32.29A16,16,0,0,1,80,184H216a16,16,0,0,0,16-16V64A16,16,0,0,0,216,48Z" />
            </svg>
          </span>
          <span className="flex items-center gap-1.5 text-sm">
            <svg viewBox="0 0 256 256" className="h-4 w-4" fill="currentColor" aria-hidden>
              <path d="M229.66,114.34l-80-80a8,8,0,0,0-11.32,11.32L204.69,120H40a8,8,0,0,0,0,16H204.69l-66.35,66.34a8,8,0,0,0,11.32,11.32l80-80A8,8,0,0,0,229.66,114.34Z" />
            </svg>
          </span>
          <form action={toggleLikeAction.bind(null, post.id)}>
            <button
              className={`flex items-center gap-1.5 text-sm transition-colors ${likedByMe ? "text-lime" : "hover:text-lime"}`}
              aria-label={likedByMe ? "Unlike" : "Like"}
              disabled={!canLike}
              title={canLike ? undefined : "Connect X to like posts"}
            >
              <svg viewBox="0 0 256 256" className="h-4 w-4" fill={likedByMe ? "currentColor" : "none"} stroke="currentColor" strokeWidth="16" aria-hidden>
                <path d="M178,32c-20.65,0-38.73,8.88-50,23.89C116.73,40.88,98.65,32,78,32A62.07,62.07,0,0,0,16,94c0,70,103.79,126.66,108.21,129.8a8,8,0,0,0,7.58,0C136.21,220.66,240,164,240,94A62.07,62.07,0,0,0,178,32Z" />
              </svg>
              {likes > 0 && compact(likes)}
            </button>
          </form>
          <span className="flex items-center gap-1.5 text-sm">
            <svg viewBox="0 0 256 256" className="h-4 w-4" fill="currentColor" aria-hidden>
              <path d="M213.66,86.34l-56-56A8,8,0,0,0,152,28H72A20,20,0,0,0,52,48V208a20,20,0,0,0,20,20H184a20,20,0,0,0,20-20V96A8,8,0,0,0,213.66,86.34ZM184,204H72V48h76V96a8,8,0,0,0,8,8h40Z" />
            </svg>
          </span>
        </div>
      </div>
    </article>
  );
}
