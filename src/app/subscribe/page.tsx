import { redirect } from "next/navigation";
import { subscribeAction } from "@/app/actions";
import { getSession } from "@/lib/auth";
import { FormPendingButton } from "@/components/form-pending-button";
import { PageGlassBackdrop } from "@/components/page-glass-backdrop";
import { StickyJumpNav, type StickyJumpItem } from "@/components/sticky-jump-nav";
import { bentoSection, eyebrow, ghostButton, sectionSubtitle, sectionTitle } from "@/lib/glass-styles";
import { cn } from "@/lib/cn";
import { CHARITY_PERCENT, PRICING, REVENUE_SPLIT } from "@/lib/constants";

const SUBSCRIBE_JUMP: StickyJumpItem[] = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/charities", label: "Charities" },
];

export default async function SubscribePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  return (
    <main className="relative mx-auto w-full max-w-7xl flex-1 px-5 py-10 md:px-8">
      <PageGlassBackdrop />
      <div className="relative z-[1] flex flex-col">
        <StickyJumpNav ariaLabel="Site navigation" items={SUBSCRIBE_JUMP} />
        <div className="mx-auto w-full max-w-4xl">
        <p className={eyebrow}>Billing</p>
        <h1 className={cn(sectionTitle, "mt-3 text-[1.75rem] md:text-[2.125rem]")}>Subscription</h1>
        <p className={sectionSubtitle}>
          Stripe-hosted checkout. Card data never touches our servers.
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <form action={subscribeAction} className={cn(bentoSection, "flex flex-col")}>
            <input type="hidden" name="plan" value="MONTHLY" />
            <h2 className="text-base font-semibold text-brand-offwhite">Monthly</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-brand-offwhite/45">Price</p>
                <p className="mt-1 text-3xl font-semibold tabular-nums text-brand-offwhite">
                  INR {(PRICING.monthlyCents / 100).toFixed(0)}
                  <span className="text-base font-normal text-brand-offwhite/45">/mo</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-brand-offwhite/45">Billing</p>
                <p className="mt-1 text-sm font-medium text-brand-offwhite">Monthly renewal</p>
              </div>
            </div>
            <p className="mt-1 flex-1 text-sm text-brand-offwhite/55">Flexible billing each month.</p>
            <FormPendingButton
              pendingLabel="Redirecting to checkout…"
              className={cn(ghostButton, "mt-8 border-white/15 py-4")}
            >
              Subscribe monthly
            </FormPendingButton>
          </form>
          <form
            action={subscribeAction}
            className={cn(
              bentoSection,
              "relative flex flex-col border-violet-400/25 bg-gradient-to-b from-violet-500/[0.12] to-brand-charcoal/90 ring-1 ring-violet-400/20",
            )}
          >
            <input type="hidden" name="plan" value="YEARLY" />
            <span className="absolute right-6 top-6 rounded-full bg-violet-500/25 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-violet-200/95 ring-1 ring-violet-400/30">
              Best value
            </span>
            <h2 className="text-base font-semibold text-brand-offwhite">Yearly</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-brand-offwhite/45">Price</p>
                <p className="mt-1 text-3xl font-semibold tabular-nums text-brand-offwhite">
                  INR {(PRICING.yearlyCents / 100).toFixed(0)}
                  <span className="text-base font-normal text-brand-offwhite/45">/yr</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-brand-offwhite/45">Savings</p>
                <p className="mt-1 text-sm font-medium text-brand-offwhite">Best value</p>
              </div>
            </div>
            <p className="mt-1 flex-1 text-sm text-brand-offwhite/65">Discounted annual commitment.</p>
            <FormPendingButton
              pendingLabel="Redirecting to checkout…"
              className="mt-8 inline-flex w-full items-center justify-center rounded-lg border border-white/[0.14] bg-white/[0.08] px-4 py-4 text-sm font-medium text-zinc-100 backdrop-blur-sm transition hover:border-white/[0.2] hover:bg-white/[0.12] disabled:opacity-80"
            >
              Subscribe yearly
            </FormPendingButton>
          </form>
        </div>
        <p className="mt-8 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-center text-sm text-brand-offwhite/55">
          Each payment is split for accounting: {REVENUE_SPLIT.prizePoolPercent}% to the monthly prize pool; a charity
          share of {CHARITY_PERCENT.min}–{CHARITY_PERCENT.max}% (you choose in the dashboard) goes to your selected
          charity when set — otherwise folded into platform — and the remainder funds platform operations. Yearly plans
          spread the prize slice across twelve draw months.
        </p>
        <p className="mt-3 text-center text-xs text-brand-offwhite/40">
          Subscription activates after successful payment and webhook confirmation.
        </p>
        </div>
      </div>
    </main>
  );
}
