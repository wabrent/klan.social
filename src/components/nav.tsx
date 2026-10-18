"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { User } from "@/lib/db";
import { signOutAction } from "@/lib/actions";
import { Avatar, KlanEmblem, Wordmark } from "./ui";

const NAV = [
  {
    href: "/feed",
    label: "Home",
    icon: (
      <path d="M224,120v96a8,8,0,0,1-8,8H160a8,8,0,0,1-8-8V164a4,4,0,0,0-4-4H108a4,4,0,0,0-4,4v52a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V120a16,16,0,0,1,4.69-11.31l80-80a16,16,0,0,1,22.62,0l80,80A16,16,0,0,1,224,120Z" />
    ),
  },
  {
    href: "/leaderboard",
    label: "Leaderboard",
    icon: (
      <path d="M232,64H208V48a8,8,0,0,0-8-8H56a8,8,0,0,0-8,8V64H24A16,16,0,0,0,8,80V96a40,40,0,0,0,40,40h3.65A80.13,80.13,0,0,0,120,191.61V216H96a8,8,0,0,0,0,16h64a8,8,0,0,0,0-16H136V191.58c31.94-3.23,58.44-25.64,68.08-55.58H208a40,40,0,0,0,40-40V80A16,16,0,0,0,232,64ZM48,120A24,24,0,0,1,24,96V80H48v32q0,4,.39,8Zm144-8.9c0,35.52-29,64.64-64,64.9a64,64,0,0,1-64-64V56H192ZM232,96a24,24,0,0,1-24,24h-.5a81.81,81.81,0,0,0,.5-8.9V80h24Z" />
    ),
  },
  {
    href: "/clans",
    label: "Clans",
    icon: (
      <path d="M208,32H176a16,16,0,0,0-16,16v8a16,16,0,0,1-16,16H112A16,16,0,0,1,96,56V48A16,16,0,0,0,80,32H48A16,16,0,0,0,32,48V96a88.09,88.09,0,0,0,87.09,88h1.82A88.1,88.1,0,0,0,208,184V48A16,16,0,0,0,208,32ZM120,168H88a72.08,72.08,0,0,1-72-72V48h32v8a16,16,0,0,0,16,16h32a16,16,0,0,0,16-16V48h32v48A72.08,72.08,0,0,1,120,168Zm104-72a72.08,72.08,0,0,1-72,72h-8V64h32v8a16,16,0,0,0,16,16h32a16,16,0,0,0,16-16V48h32Z" />
    ),
  },
  {
    href: "/how-it-works",
    label: "How it works",
    icon: (
      <path d="M232,48H160a40,40,0,0,0-32,16A40,40,0,0,0,96,48H24a8,8,0,0,0-8,8V200a8,8,0,0,0,8,8H96a24,24,0,0,1,24,24,8,8,0,0,0,16,0,24,24,0,0,1,24-24h72a8,8,0,0,0,8-8V56A8,8,0,0,0,232,48ZM96,192H32V64H96a24,24,0,0,1,24,24V200A39.81,39.81,0,0,0,96,192Zm128,0H160a39.81,39.81,0,0,0-24,8V88a24,24,0,0,1,24-24h64Z" />
    ),
  },
] as const;

export function Sidebar({ user }: { user: User | null }) {
  const pathname = usePathname();
  const currentPath = pathname;
  return (
    <aside className="sticky top-0 hidden h-screen w-[76px] shrink-0 border-r border-edge px-2 py-4 md:block lg:w-[260px] lg:px-4">
      <div className="flex h-full min-h-0 flex-col">
        <Link href="/" className="flex h-12 items-center gap-2.5 px-2" aria-label="Klan home">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[4px] border-2 border-edge bg-surface shadow-[3px_3px_0_#141210]">
            <KlanEmblem className="h-6 w-6" />
          </span>
          <span className="hidden lg:block">
            <Wordmark size="text-[1.6rem]" />
          </span>
        </Link>

        <nav className="mt-5 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto" aria-label="Main">
          {NAV.map((item) => {
            const active = currentPath === item.href || currentPath.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex h-11 shrink-0 items-center gap-3.5 rounded-[4px] border-2 px-3.5 transition-all ${
                  active
                    ? "border-edge bg-surface font-extrabold text-foreground shadow-[3px_3px_0_#141210]"
                    : "border-transparent font-semibold text-muted hover:bg-surface-2 hover:text-foreground"
                }`}
              >
                <svg viewBox="0 0 256 256" fill="currentColor" aria-hidden className={`h-[22px] w-[22px] shrink-0 transition-colors ${active ? "text-clay" : ""}`}>
                  {item.icon}
                </svg>
                <span className="hidden truncate text-[15px] lg:block">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-4 border-t border-edge pt-3">
          {user ? (
            <div className="flex flex-col gap-2">
              <Link href={`/u/${user.handle}`} className="flex items-center gap-2.5 rounded-md px-2 py-2 hover:bg-surface-2">
                <Avatar name={user.name} avatarUrl={user.avatarUrl} size={36} />
                <span className="hidden min-w-0 lg:block">
                  <span className="block truncate text-sm font-semibold">{user.name}</span>
                  <span className="block truncate text-xs text-muted">@{user.handle}</span>
                </span>
              </Link>
              <form action={signOutAction}>
                <button className="hidden w-full rounded-md border border-edge px-3 py-2 text-sm font-medium text-muted hover:bg-surface-2 hover:text-foreground lg:block">
                  Sign out
                </button>
              </form>
            </div>
          ) : (
            <Link href="/signin" className="btn-primary h-11 w-full text-[15px]">
              <span className="inline-flex items-center gap-[0.3em]">
                <span>Connect</span>
                <XLogo className="h-[0.9em] w-[0.9em]" />
              </span>
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}

export function MobileBar({ user }: { user: User | null }) {
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-edge-soft bg-background/85 px-4 backdrop-blur-xl md:hidden">
        <Link href="/" aria-label="Klan home" className="flex items-center gap-2">
          <KlanEmblem className="h-6 w-6" />
          <Wordmark size="text-xl" />
        </Link>
        {user ? (
          <Link href={`/u/${user.handle}`}>
            <Avatar name={user.name} avatarUrl={user.avatarUrl} size={32} />
          </Link>
        ) : (
          <Link href="/signin" className="btn-primary h-9 px-4 text-[13px]">
            Join <XLogo className="h-3 w-3" />
          </Link>
        )}
      </header>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-edge-soft bg-background/85 backdrop-blur-xl md:hidden" aria-label="Main">
        <ul className="flex h-14 items-stretch">
          {NAV.map((item) => (
            <li key={item.href} className="min-w-0 flex-1">
              <Link href={item.href} aria-label={item.label} className="flex h-full w-full items-center justify-center text-muted active:text-clay">
                <svg viewBox="0 0 256 256" fill="currentColor" aria-hidden className="h-6 w-6">
                  {item.icon}
                </svg>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}

export function KlanHeadIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="currentColor" d="M12 2c-3 2-5 5-5 9 0 2 .6 3.7 1.7 5.2L7 21h3l1.4-2h1.2L14 21h3l-1.7-4.8C16.4 14.7 17 13 17 11c0-4-2-7-5-9z" />
      <circle cx="10" cy="10.5" r="1.2" fill="#f5f2ea" />
      <circle cx="14" cy="10.5" r="1.2" fill="#f5f2ea" />
    </svg>
  );
}

export function XLogo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M18.9 1.2h3.7l-8 9.2L24 22.8h-7.4l-5.8-7.6-6.6 7.6H.5l8.6-9.8L0 1.2h7.6l5.2 6.9 6.1-6.9Zm-1.3 19.4h2L6.5 3.3H4.3l13.3 17.3Z" />
    </svg>
  );
}
