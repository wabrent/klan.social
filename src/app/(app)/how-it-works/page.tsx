import Link from "next/link";
import { POINT_RULES, TIERS } from "@/lib/scoring";

function H2({ children, id }: { children: React.ReactNode; id: string }) {
  return (
    <h2 id={id} className="mt-12 text-2xl font-black">
      {children}
    </h2>
  );
}

export default function HowItWorksPage() {
  return (
    <article className="mx-auto max-w-[720px] px-5 py-10 pb-24">
      <h1 className="text-4xl font-black">How Klan works</h1>
      <p className="mt-3 text-muted leading-7">
        Klan in plain words. Your X influence is scored, the score and your actions become points, your points feed your clan — and at
        the snapshot the points decide your share of the airdrop.
      </p>

      <H2 id="reward">The reward is the airdrop</H2>
      <p className="mt-3 text-muted leading-7">
        Everything you earn on Klan is Klan Points. At the snapshot the token airdrop is split among all registered accounts in
        proportion to their points: twice the points, twice the share. No whitelist, no private allocation, no manual adjustment.
        Separately, a Genesis pool goes to the top 500 by rank as soulbound passes. Season 2 pool: 10% of supply.
      </p>

      <H2 id="score">The score</H2>
      <p className="mt-3 text-muted leading-7">
        Klan reads only public X data and turns it into an Estimated Influence Value in dollars, a Klan Score out of 100 and a card.
        The formula is published and applied to every account the same way:
      </p>
      <ul className="mt-3 list-disc space-y-1 pl-6 text-muted leading-7">
        <li>Reach: logarithmic on followers — 1K ≈ 34, 10K ≈ 52, 100K ≈ 70, 1M ≈ 88.</li>
        <li>Checkmark: +14.</li>
        <li>Earned-points weight: up to +20, log scale.</li>
        <li>Value: followers × $0.035 + $18 for a checkmark + tenure bonus.</li>
      </ul>
      <p className="mt-3 text-muted leading-7">
        Sign-in is read-only through X&apos;s own screen. We never see your password and cannot post for you.
      </p>

      <H2 id="earning">Earning points</H2>
      <ul className="mt-3 list-disc space-y-1 pl-6 text-muted leading-7">
        <li>Score: up to 10 000 points from your influence score.</li>
        <li>Posts: {POINT_RULES.post} each, up to {POINT_RULES.maxPostsPerDay} per day.</li>
        <li>Likes: {POINT_RULES.like} each, up to {POINT_RULES.maxLikesPerDay} per day.</li>
        <li>Swearing the oath to a clan: +{POINT_RULES.joinClan.toLocaleString("en-US")} once.</li>
        <li>Referrals: +500 for an invite with an X checkmark; the newcomer gets +100.</li>
        <li>Keys: 500 000 points per 1 ETH of keys you hold, 100 000 per 1 ETH traded (coming to Klan).</li>
      </ul>
      <p className="mt-3 text-muted leading-7">Points are never edited by hand. The caps apply to everyone.</p>

      <H2 id="tiers">Tiers</H2>
      <ol className="mt-3 space-y-2 text-muted">
        {TIERS.map((t, i) => (
          <li key={t.name} className="flex items-center gap-3">
            <span className="w-6 font-mono text-sm">{i + 1}.</span>
            <span className="rounded-md border px-2 py-0.5 text-xs font-bold" style={{ color: t.color, borderColor: `${t.color}55`, background: `${t.color}14` }}>
              {t.name.toUpperCase()}
            </span>
            <span className="font-mono text-sm">{t.min.toLocaleString("en-US")}+ points</span>
          </li>
        ))}
      </ol>

      <H2 id="clans">Clans</H2>
      <p className="mt-3 text-muted leading-7">
        One member, one clan. Your points feed the clan total and the clan board. Leaving a clan is allowed once a day; the oath
        bonus is paid only for the first clan you ever join. Clan raids (coordinated engagement trains) and the weekly treasury split
        ship with the next release.
      </p>

      <H2 id="keys">Creator keys</H2>
      <p className="mt-3 text-muted leading-7">
        Planned: every member has keys from the moment they join. Holding a creator&apos;s key opens their room and holders-only posts.
        The price follows a bonding curve in ETH; fees split 7% creator / 2% protocol / 1% referrer. Keys are not an investment and
        can lose value.
      </p>

      <H2 id="fairplay">Fair play and privacy</H2>
      <ul className="mt-3 list-disc space-y-1 pl-6 text-muted leading-7">
        <li>One account per person.</li>
        <li>Only public X data is read.</li>
        <li>Session cookies are HMAC-signed; no access tokens are stored.</li>
        <li>Flagged accounts cannot enter battles or claim referral points.</li>
      </ul>

      <p className="mt-10 rounded-[4px] border-2 border-edge bg-surface p-4 text-xs text-muted">
        Disclaimer. Klan Score and Influence Value are in-app scores, not market values of any account. Klan Points have no monetary
        value. The airdrop, its size, timing and claim rules are not final until announced. Nothing here is financial advice.
      </p>

      <p className="mt-8">
        <Link href="/feed" className="btn-primary">
          Open the feed
        </Link>
      </p>
    </article>
  );
}
