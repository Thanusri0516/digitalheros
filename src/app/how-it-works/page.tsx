import Link from "next/link";
import { PageGlassBackdrop } from "@/components/page-glass-backdrop";
import { StickyJumpNav, type StickyJumpItem } from "@/components/sticky-jump-nav";
import { cn } from "@/lib/cn";
import { eyebrow, glassSectionLg, sectionSubtitle, sectionTitle } from "@/lib/glass-styles";

const JUMP: StickyJumpItem[] = [
  { href: "/", label: "Home" },
  { href: "/charities", label: "Charities" },
  { href: "/signup", label: "Subscribe" },
  { href: "/login", label: "Login" },
];

export default function HowItWorksPage() {
  return (
    <main className="relative mx-auto w-full max-w-7xl flex-1 px-5 py-10 md:px-8">
      <PageGlassBackdrop />
      <div className="relative z-[1]">
        <StickyJumpNav ariaLabel="Site navigation" items={JUMP} />
        <p className={eyebrow}>Guide</p>
        <h1 className={cn(sectionTitle, "mt-3")}>How it works</h1>
        <p className={cn(sectionSubtitle, "max-w-3xl")}>
          Digital Heroes is a subscription-based charity golf platform: you play, monthly draws run transparently, and a
          fixed share of every payment is recorded for your chosen charity.
        </p>

        <section className={cn(glassSectionLg, "relative z-[1] mt-10")}>
          <h2 className={sectionTitle}>1) Subscription</h2>
          <p className="mt-3 text-[15px] leading-[1.7] text-zinc-500">
            Subscribe monthly or yearly using Stripe checkout. Subscription activates after a successful payment.
          </p>
          <p className="mt-4 text-sm text-zinc-500">
            <Link href="/subscribe" className="font-medium text-zinc-300 underline-offset-4 hover:text-white">
              View plans
            </Link>
            <span className="text-zinc-600"> — Stripe hosted checkout.</span>
          </p>
        </section>

        <section className={cn(glassSectionLg, "relative z-[1] mt-8")}>
          <h2 className={sectionTitle}>2) Score system</h2>
          <p className="mt-3 text-[15px] leading-[1.7] text-zinc-500">
            You record Stableford points (1–45). Only your last five rounds are kept. These five numbers are your draw
            entry numbers.
          </p>
        </section>

        <section className={cn(glassSectionLg, "relative z-[1] mt-8")}>
          <h2 className={sectionTitle}>3) Draw system</h2>
          <p className="mt-3 text-[15px] leading-[1.7] text-zinc-500">
            Admins generate winning numbers (random or weighted), review the draft, then publish results. Your match
            count determines the prize tier.
          </p>
        </section>

        <section className={cn(glassSectionLg, "relative z-[1] mt-8")}>
          <h2 className={sectionTitle}>4) Donate</h2>
          <p className="mt-3 text-[15px] leading-[1.7] text-zinc-500">
            In your dashboard you choose a charity and a contribution percentage. When you pay, the charity slice is
            recorded for manual payout (bank/UPI outside the app).
          </p>
          <p className="mt-4 text-sm text-zinc-500">
            <Link href="/charities" className="font-medium text-zinc-300 underline-offset-4 hover:text-white">
              Browse charities
            </Link>
            <span className="text-zinc-600"> — public directory.</span>
          </p>
        </section>
      </div>
    </main>
  );
}

