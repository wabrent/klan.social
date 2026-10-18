import { tierOf } from "@/lib/scoring";

/** Контрастный текст поверх плоского цвета (для бруталистских плашек). */
function inkOn(hex: string) {
  const h = hex.replace("#", "");
  if (h.length !== 6) return "#fffdf5";
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6 ? "#141210" : "#fffdf5";
}

/** Display wordmark: heavy uppercase "Klan" with an orange dot. */
export function Wordmark({ size = "text-3xl" }: { size?: string }) {
  return <span className={`wordmark ${size}`}>Klan</span>;
}

export function CheckBadge() {
  return (
    <svg viewBox="0 0 24 24" aria-label="Verified" className="h-4 w-4 shrink-0 text-lime">
      <path fill="currentColor" d="M12 1.5l2.3 2.1 3.1-.4 1 3 2.8 1.4-.9 3 1.9 2.5-2.2 2.3.3 3.1-3.1.6-1.6 2.8-2.9-1.2-2.9 1.2-1.6-2.8-3.1-.6.3-3.1L1.9 14l1.9-2.5-.9-3 2.8-1.4 1-3 3.1.4L12 1.5z" />
      <path d="M8.4 12.2l2.4 2.4 4.8-4.9" stroke="#fffdf5" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function TierBadge({ points, className = "" }: { points: number; className?: string }) {
  const tier = tierOf(points);
  return (
    <span
      className={`inline-flex items-center rounded-[3px] border-2 border-edge px-1.5 py-px text-[10px] font-extrabold tracking-wider ${className}`}
      style={{ color: inkOn(tier.color), background: tier.color }}
    >
      {tier.name.toUpperCase()}
    </span>
  );
}

export function ClanPill({ name, color }: { name: string; color: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-[3px] border-2 border-edge px-1.5 py-0.5 text-[11px] font-extrabold"
      style={{ color: inkOn(color), background: color }}
    >
      <span className="h-1.5 w-1.5 rounded-full border" style={{ background: inkOn(color), borderColor: inkOn(color) === "#141210" ? "#141210" : "#fffdf5" }} />
      {name}
    </span>
  );
}

export function Avatar({
  name,
  avatarUrl,
  clanColor,
  size = 40,
}: {
  name: string;
  avatarUrl?: string | null;
  clanColor?: string;
  size?: number;
}) {
  const initials = name
    .replace(/[^\p{L}\p{N} ]/gu, "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => Array.from(w)[0]?.toUpperCase() ?? "")
    .join("");
  return (
    // eslint-disable-next-line @next/next/no-img-element -- remote X avatars + local initials fallback
    <img
      src={avatarUrl ?? `data:image/svg+xml;utf8,${encodeURIComponent(avatarSvg(initials || "K", clanColor ?? "#c9f24d"))}`}
      alt={name}
      width={size}
      height={size}
      className="shrink-0 rounded-full object-cover"
      style={{ width: size, height: size, border: clanColor ? `2px solid ${clanColor}` : undefined }}
      draggable={false}
    />
  );
}

function avatarSvg(initials: string, color: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" fill="#fffdf5"/><rect x="4" y="4" width="88" height="88" rx="10" fill="none" stroke="#141210" stroke-width="4"/><circle cx="48" cy="48" r="30" fill="${color}"/><text x="48" y="58" font-family="Arial" font-size="26" font-weight="900" fill="#fffdf5" text-anchor="middle">${initials}</text></svg>`;
}

export function ScoreBar({ score }: { score: number }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
      <div className="h-full rounded-full bg-lime transition-all" style={{ width: `${Math.max(0, Math.min(100, score))}%` }} />
    </div>
  );
}

/** Heraldic clan emblem: shield with a flame. Used as the app mark. */
export function KlanEmblem({ className = "", color = "var(--clay)" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path
        d="M24 3.5 41 9v14.2c0 10.6-6.9 18.6-17 21.3C13.9 41.8 7 33.8 7 23.2V9l17-5.5Z"
        fill={`${color}1a`}
        stroke={color}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path
        d="M24 12c1.8 3 5.4 5.6 5.4 10.2 0 3.6-2.4 6.4-5.4 6.4s-5.4-2.8-5.4-6.4c0-2 .9-3.6 2.1-5 .3 1.6 1.2 2.6 2.3 2.6 1.4 0 1.6-2.1 1-7.8Z"
        fill={color}
      />
      <path d="M24 34.5v-3.4" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}
