import Link from "next/link";
import { FeaturedCharities } from "@/components/featured-charities";
import { HeroGlow } from "@/components/hero-glow";
import { LandingHeroDots } from "@/components/landing-hero-dots";
import { PageGlassBackdrop } from "@/components/page-glass-backdrop";
import { StickyJumpNav, type StickyJumpItem } from "@/components/sticky-jump-nav";
import {
  eyebrow,
  glassInset,
  glassSectionLg,
  interactiveLiftSubtleZoom,
  sectionSubtitle,
  sectionTitle,
} from "@/lib/glass-styles";
import { cn } from "@/lib/cn";

const HOME_JUMP: StickyJumpItem[] = [
  { href: "/#explore-visitor", label: "Explore" },
  { href: "/#platform-concept", label: "Platform" },
  { href: "/#featured-charities", label: "Spotlight" },
  { href: "/#how-draws-work", label: "Draws" },
];

export default async function Home() {
  return (
    <main className="relative mx-auto flex min-h-[calc(100dvh-5rem)] w-full max-w-7xl flex-1 flex-col px-5 pb-10 pt-2 md:min-h-[calc(100dvh-4.5rem)] md:grid md:min-h-0 md:grid-cols-2 md:gap-10 md:px-8 md:py-12">
      <PageGlassBackdrop />

      <StickyJumpNav ariaLabel="On this page" items={HOME_JUMP} className="md:col-span-2" liftZoom />

      <div className="relative z-[1] flex min-h-[200px] flex-col md:min-h-[min(420px,50vh)]">
        <HeroGlow />
      </div>

      <div className="relative z-[1] flex flex-1 flex-col justify-center space-y-7 md:py-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-gradient-to-r from-zinc-600 to-transparent" aria-hidden />
            <p className={eyebrow}>Subscriptions · draws · giving</p>
          </div>
          <h1 className="font-heading max-w-[14ch] text-[2.35rem] font-medium leading-[1.05] tracking-[-0.035em] text-zinc-50 sm:text-5xl sm:leading-[1.02] md:text-[2.85rem]">
            Calm play.
            <span className="block text-zinc-400">Measured impact.</span>
          </h1>
          <p className="max-w-md text-[15px] leading-[1.7] text-zinc-500">
            Five Stableford scores, monthly draws, and a fixed share to the charity you name — one bill, clear rules, no
            noise.
          </p>
        </div>

        <LandingHeroDots />

        <div className="flex flex-col gap-2.5 pt-2 sm:flex-row sm:items-center sm:gap-3">
          <Link
            href="/signup"
            className={cn(
              "inline-flex w-full items-center justify-center rounded-lg bg-zinc-100 px-9 py-3.5 text-center text-sm font-medium text-zinc-950 shadow-[0_1px_0_0_rgba(255,255,255,0.4)_inset] transition-[background-color,transform] duration-200 hover:bg-white active:scale-[0.99] sm:w-auto",
              interactiveLiftSubtleZoom,
            )}
          >
            Start subscription
          </Link>
          <Link
            href="/signup"
            className={cn(
              "inline-flex w-full items-center justify-center rounded-lg border border-white/[0.12] bg-transparent px-7 py-3.5 text-center text-sm font-medium text-zinc-300 transition-[border-color,background-color,color] duration-200 hover:border-white/[0.2] hover:bg-white/[0.04] hover:text-zinc-100 sm:w-auto",
              interactiveLiftSubtleZoom,
            )}
          >
            Compare plans
          </Link>
        </div>
      </div>

      <section
        id="explore-visitor"
        className={cn(glassSectionLg, "relative z-[1] mt-10 scroll-mt-[7.5rem] md:col-span-2")}
      >
        <h2 className={sectionTitle}>Explore as a visitor</h2>
        <p className={sectionSubtitle}>
          Everything below is available without signing in—browse the concept, charities, and how draws work, then subscribe when you are ready.
        </p>
        <ul className="mt-8 space-y-0 divide-y divide-white/[0.06] border-t border-white/[0.06]">
          {[
            {
              href: "#platform-concept",
              t: "Platform concept",
              d: "Subscriptions, scores, and how giving is calculated.",
            },
            { href: "/charities", t: "Charity directory", d: "Every organization available for selection." },
            {
              href: "#how-draws-work",
              t: "Draw mechanics",
              d: "Entries, tiers, publication, and verification.",
            },
            { href: "/signup", t: "Subscribe", d: "Plans and account creation." },
          ].map((row) => (
            <li key={row.href} className="group flex py-4 first:pt-0">
              <Link
                href={row.href}
                className="flex flex-1 flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
              >
                <span className="font-heading text-[15px] font-medium text-zinc-200 transition-colors group-hover:text-white">
                  {row.t}
                </span>
                <span className="text-sm text-zinc-500 transition-colors group-hover:text-zinc-400">{row.d}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section
        id="platform-concept"
        className={cn(glassSectionLg, "relative z-[1] mt-10 scroll-mt-[7.5rem] md:col-span-2")}
      >
        <h2 className={sectionTitle}>Platform concept</h2>
        <p className="mt-3 text-[15px] leading-[1.7] text-zinc-500">
          One subscription covers your place in monthly prize draws. You record your last five Stableford rounds; those scores become your draw numbers. Part of every payment goes to the charity you pick (at least 10%). Admins run fair, transparent draws; winners can submit proof and receive payouts through the platform.
        </p>
        <ul className="mt-8 grid gap-2.5 text-sm text-zinc-400 sm:grid-cols-2 lg:grid-cols-3">
          <li className={cn(glassInset, "px-4 py-3.5")}>Monthly / yearly subscriptions</li>
          <li className={cn(glassInset, "px-4 py-3.5")}>Last 5 Stableford scores (1–45)</li>
          <li className={cn(glassInset, "px-4 py-3.5")}>Random or weighted monthly draws</li>
          <li className={cn(glassInset, "px-4 py-3.5")}>Charity share (min. 10%)</li>
          <li className={cn(glassInset, "px-4 py-3.5 sm:col-span-2 lg:col-span-3")}>
            Subscriber dashboard for scores, charity choice, winnings &amp; proof; admin tools for draws and verification
          </li>
        </ul>
        <p className="mt-8 text-sm text-zinc-500">
          <Link href="/charities" className="font-medium text-zinc-300 underline-offset-4 transition-colors hover:text-white">
            Open directory
          </Link>
          <span className="text-zinc-600"> — no account required.</span>
        </p>
      </section>

      <FeaturedCharities />

      <section
        id="how-draws-work"
        className={cn(glassSectionLg, "relative z-[1] mt-10 scroll-mt-[7.5rem] md:col-span-2")}
      >
        <h2 className={sectionTitle}>How monthly draws work</h2>
        <ol className="mt-6 list-decimal space-y-4 pl-5 text-[15px] leading-[1.7] text-zinc-500 marker:text-zinc-600">
          <li>
            Active subscribers are entered for each month once payment is confirmed. Your five most recent Stableford
            scores (1–45 each) form your entry numbers.
          </li>
          <li>
            Admins generate winning numbers (random or score-weighted), review the draft, then publish the draw.
          </li>
          <li>
            Matches on 3, 4, or 5 numbers split tier pools transparently. Winners submit proof in the dashboard; admins
            verify and record payouts.
          </li>
          <li>A share of every subscription (minimum 10%, configurable) routes to the charity you choose.</li>
        </ol>
      </section>
    </main>
  );
}
