"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo } from "react";
import { updateCharitySelectionAction } from "@/app/actions";
import { DashboardPaginationControls } from "@/components/dashboard-pagination-controls";
import type { DashboardLowerSectionsProps } from "@/components/dashboard-lower-sections";
import { CHARITY_PERCENT, REVENUE_SPLIT } from "@/lib/constants";
import { cn } from "@/lib/cn";
import {
  bentoCard,
  bentoCardTitle,
  bentoHero,
  bentoInset,
  bentoLabel,
  bentoMetricGrid,
  bentoValue,
  ghostButton,
  glassInput,
  interactiveLiftSubtle,
} from "@/lib/glass-styles";

type Charity = { id: string; name: string };

type ScoreRow = { id: string; playedAt: string; value: number };

type ClaimRow = {
  id: string;
  matchCount: number;
  amountCents: number;
  verificationStatus: string;
  payoutStatus: string;
  proofUrl: string | null;
  draw: { month: number; year: number };
};

type PublishedDrawRow = {
  month: number;
  year: number;
  winningNumbers: number[];
  yourMatchCount: number;
  publishedAt: string | null;
};

type PaymentAllocationRow = {
  id: string;
  paidAt: string;
  totalCents: number;
  prizePoolCents: number;
  charityCents: number;
  platformCents: number;
  plan: string;
};

type Props = {
  firstName: string;
  fullName: string;
  email: string;
  subscriptionActive: boolean;
  subscriptionStatus: string;
  renewalLabel: string;
  user: {
    selectedCharityId: string | null;
    charityPercent: number;
  };
  charities: Charity[];
  scores: ScoreRow[];
  claims: ClaimRow[];
  claimAnalytics: {
    totalAmountCents: number;
    approvedAmountCents: number;
    paidAmountCents: number;
    approvedCount: number;
    paidCount: number;
    pendingVerificationCount: number;
  };
  publishedDraws: PublishedDrawRow[];
  /** Total published draws (all pages), for overview copy */
  publishedDrawTotalCount: number;
  paymentAllocations: PaymentAllocationRow[];
  pagination: {
    extraQuery: Record<string, string>;
    draws: { page: number; totalPages: number };
    claims: { page: number; totalPages: number; totalCount: number };
    payments: { page: number; totalPages: number; totalCount: number };
  };
};

const DashboardLowerSections = dynamic(
  () => import("@/components/dashboard-lower-sections").then((m) => m.DashboardLowerSections),
  {
    loading: () => (
      <div className="grid gap-6">
        <div className="h-64 animate-pulse rounded-3xl border border-white/[0.08] bg-white/[0.03]" />
        <div className="h-72 animate-pulse rounded-3xl border border-white/[0.08] bg-white/[0.03]" />
        <div className="h-80 animate-pulse rounded-3xl border border-white/[0.08] bg-white/[0.03]" />
      </div>
    ),
  },
);


/** Single-scroll anchors: draws + win analysis stay under #winnings in lower sections. */
const USER_FEATURE_LINKS = [
  { href: "#overview", label: "Overview" },
  { href: "#scores", label: "Scores" },
  { href: "#winnings", label: "Winnings" },
  { href: "#profile", label: "Profile" },
];

function subscribeCtaClassName() {
  return cn(
    "mt-4 inline-flex items-center justify-center rounded-lg border border-white/[0.14] bg-white/[0.08] px-8 py-3 text-sm font-medium text-zinc-100 transition-colors hover:border-white/[0.2] hover:bg-white/[0.12]",
    interactiveLiftSubtle,
  );
}

function SubscriptionStatusPill({ status, active }: { status: string; active: boolean }) {
  if (active || status === "ACTIVE") {
    return (
      <span className="inline-flex items-center rounded-md border border-emerald-500/20 bg-emerald-500/[0.08] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-200/90">
        Active
      </span>
    );
  }
  if (status === "CANCELED" || status === "LAPSED") {
    return (
      <span className="inline-flex items-center rounded-md border border-rose-500/20 bg-rose-500/[0.08] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-rose-200/85">
        {status === "CANCELED" ? "Canceled" : "Lapsed"}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-md border border-white/[0.1] bg-white/[0.05] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-400">
      Inactive
    </span>
  );
}

export function DashboardClient(props: Props) {
  const selectedCharityName = useMemo(
    () =>
      props.user.selectedCharityId
        ? props.charities.find((c) => c.id === props.user.selectedCharityId)?.name ?? "—"
        : "—",
    [props.charities, props.user.selectedCharityId],
  );

  const pageTokens = useMemo(
    () => ({
      dp: props.pagination.draws.page,
      cp: props.pagination.claims.page,
      pap: props.pagination.payments.page,
    }),
    [props.pagination.claims.page, props.pagination.draws.page, props.pagination.payments.page],
  );


  const lowerSectionsProps: DashboardLowerSectionsProps = useMemo(
    () => ({
      subscriptionActive: props.subscriptionActive,
      scores: props.scores,
      claims: props.claims,
      claimAnalytics: props.claimAnalytics,
      publishedDraws: props.publishedDraws,
      fullName: props.fullName,
      email: props.email,
      pagination: {
        extraQuery: props.pagination.extraQuery,
        draws: props.pagination.draws,
        claims: { page: props.pagination.claims.page, totalPages: props.pagination.claims.totalPages },
        payments: { page: props.pagination.payments.page },
      },
    }),
    [
      props.claimAnalytics,
      props.claims,
      props.email,
      props.fullName,
      props.pagination.claims.page,
      props.pagination.claims.totalPages,
      props.pagination.draws,
      props.pagination.extraQuery,
      props.pagination.payments.page,
      props.publishedDraws,
      props.scores,
      props.subscriptionActive,
    ],
  );

  return (
    <main className="relative mx-auto w-full max-w-7xl flex-1 px-5 py-8 md:px-8 md:py-10">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[min(480px,65vh)] w-[min(880px,100%)] -translate-x-1/2 rounded-[100%] bg-[radial-gradient(ellipse_75%_55%_at_50%_0%,rgba(56,189,248,0.06),transparent_68%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.06),transparent_72%)] blur-3xl"
        aria-hidden
      />

      {/* ── Sticky user feature buttons, matching admin panel StickyJumpNav ── */}
      <nav
        aria-label="Dashboard sections"
        className="sticky top-0 z-40 -mx-5 border-b border-white/[0.05] bg-black/80 px-5 py-3 backdrop-blur-xl md:-mx-8 md:px-8"
        style={{ top: "var(--app-sticky-subnav-top, 4.5rem)" }}
      >
        <ul className="flex gap-2 overflow-x-auto pb-1 md:flex-wrap md:gap-2.5 md:overflow-x-visible md:pb-0">
          {USER_FEATURE_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "inline-flex min-h-[2.25rem] items-center rounded-lg border border-transparent bg-white/[0.03] px-3.5 py-1.5 text-[12px] font-medium text-zinc-400 ring-1 ring-inset ring-white/[0.04] backdrop-blur-sm hover:border-white/[0.06] hover:bg-white/[0.06] hover:text-zinc-200 md:text-[13px]",
                  interactiveLiftSubtle,
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/subscribe"
              className={cn(
                "inline-flex min-h-[2.25rem] items-center rounded-lg border border-transparent bg-white/[0.03] px-3.5 py-1.5 text-[12px] font-medium text-zinc-400 ring-1 ring-inset ring-white/[0.04] backdrop-blur-sm hover:border-white/[0.06] hover:bg-white/[0.06] hover:text-zinc-200 md:text-[13px]",
                interactiveLiftSubtle,
              )}
            >
              {props.subscriptionActive ? "Manage Subscription" : "Subscribe"}
            </Link>
          </li>
        </ul>
      </nav>

      <div className={cn(bentoHero, "mb-8")}>
        <div className="relative z-[1] flex flex-wrap items-start justify-between gap-8">
          <div className="min-w-0 space-y-2">
            <h1 className="font-heading text-2xl font-medium tracking-[-0.03em] text-zinc-50 md:text-[1.75rem]">
              {props.firstName}
            </h1>
            <p className="text-sm text-zinc-500">Scores, draws, charity preference, and claims.</p>
          </div>
          <div className="flex flex-col items-end gap-2 text-right">
            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-600">Subscription</p>
            <SubscriptionStatusPill status={props.subscriptionStatus} active={props.subscriptionActive} />
          </div>
        </div>

        {props.subscriptionActive ? (
          <div
            className="relative z-[1] mt-6 rounded-lg border border-emerald-500/15 bg-emerald-950/20 px-6 py-4 backdrop-blur-md"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-200/75">✓ Active subscription</p>
            <p className="mt-1 text-sm text-zinc-500">You&apos;re entered into each monthly prize draw. Use the bar above to jump without leaving the page.</p>
          </div>
        ) : null}
      </div>

      <div className="relative z-[1] space-y-6">
        <section id="overview" className="scroll-mt-28">
            <div className="grid gap-6 md:grid-cols-2">
            <section className={bentoCard}>
              <h2 className={bentoCardTitle}>Subscription</h2>
              <div className={cn(bentoMetricGrid, "mt-5")}>
                <div>
                  <p className={bentoLabel}>Status</p>
                  <div className="mt-2">
                    <SubscriptionStatusPill status={props.subscriptionStatus} active={props.subscriptionActive} />
                  </div>
                </div>
                <div>
                  <p className={bentoLabel}>Renewal</p>
                  <p className={cn(bentoValue, "mt-2 tabular-nums")}>{props.renewalLabel}</p>
                </div>
              </div>
            </section>

            <section className={bentoCard}>
              <h2 className={bentoCardTitle}>Charity preference</h2>
              <div className={cn(bentoMetricGrid, "mt-5")}>
                <div>
                  <p className={bentoLabel}>Selected charity</p>
                  <p className={cn(bentoValue, "mt-2")}>{selectedCharityName}</p>
                </div>
                <div>
                  <p className={bentoLabel}>Charity share</p>
                  <p className={cn(bentoValue, "mt-2 tabular-nums")}>{props.user.charityPercent}%</p>
                  <p className="mt-1 text-[11px] text-brand-offwhite/40">
                    Of each payment ({CHARITY_PERCENT.min}–{CHARITY_PERCENT.max}%); prize pool stays {REVENUE_SPLIT.prizePoolPercent}%.
                  </p>
                </div>
              </div>
              {props.subscriptionActive ? (
                <form action={updateCharitySelectionAction} className="mt-8 space-y-4 border-t border-white/[0.08] pt-6">
                  <div>
                    <label className="mb-2 block text-xs text-brand-offwhite/45">Charity</label>
                    <select
                      name="charityId"
                      defaultValue={props.user.selectedCharityId ?? ""}
                      className={cn(glassInput, "cursor-pointer py-3.5")}
                    >
                      <option value="">Select charity</option>
                      {props.charities.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-xs text-brand-offwhite/45">
                      Charity share of each payment ({CHARITY_PERCENT.min}–{CHARITY_PERCENT.max}%)
                    </label>
                    <input
                      type="number"
                      name="charityPercent"
                      min={CHARITY_PERCENT.min}
                      max={CHARITY_PERCENT.max}
                      step={1}
                      defaultValue={props.user.charityPercent}
                      className={glassInput}
                      required
                    />
                  </div>
                  <p className="text-xs text-brand-offwhite/45">
                    Without a selected charity, the charity slice is recorded as platform revenue in your statement below.
                  </p>
                  <button type="submit" className={ghostButton}>
                    Save preference
                  </button>
                </form>
              ) : (
                <div className="mt-8 border-t border-white/[0.08] pt-6">
                  <p className="text-sm text-brand-offwhite/55">
                    An active subscription is required to save charity preferences for donations.
                  </p>
                  <Link href="/subscribe" className={subscribeCtaClassName()}>
                    View plans &amp; subscribe
                  </Link>
                </div>
              )}
            </section>
            </div>

            <section className={cn(bentoCard, "mt-6")}>
              <h2 className={bentoCardTitle}>Draw participation</h2>
              <p className="mt-2 text-sm text-brand-offwhite/60">
                {props.subscriptionActive
                  ? "Your active subscription enters you into each monthly prize draw. Your five most recent Stableford scores (when recorded) are your entry numbers."
                  : "Subscribe to be entered into monthly draws after payment is confirmed."}
              </p>
              <p className="mt-3 text-sm text-brand-offwhite/55">
                <span className="font-medium text-brand-offwhite/70">Upcoming draws:</span> admins run and publish one draw
                per calendar month. Check the Winnings tab for your match history and the next published results.
              </p>
              <p className="mt-2 text-xs text-brand-offwhite/45">
                Recent published periods on record:{" "}
                <strong className="text-brand-offwhite/65">{props.publishedDrawTotalCount}</strong> — details appear under
                Winnings &amp; published results.
              </p>
            </section>

            {props.subscriptionActive && props.pagination.payments.totalCount > 0 ? (
              <section className={cn(bentoCard, "mt-6")}>
                <h2 className={bentoCardTitle}>How your subscription payments are split</h2>
                <p className="mt-2 text-sm text-brand-offwhite/50">
                  Each payment is allocated: {REVENUE_SPLIT.prizePoolPercent}% prize pool, then your chosen charity
                  percentage ({CHARITY_PERCENT.min}–{CHARITY_PERCENT.max}%, default {CHARITY_PERCENT.default}%) to your
                  selected charity when set — otherwise that slice stays with the platform — and the remainder is
                  platform revenue. Yearly plans spread the prize slice across twelve months for draws.
                </p>
                <ul className="mt-5 space-y-3 text-sm text-brand-offwhite/85">
                  {props.paymentAllocations.map((row) => (
                    <li key={row.id} className={cn(bentoInset, "p-4")}>
                      <p className="text-xs text-brand-offwhite/45">
                        {new Date(row.paidAt).toLocaleString()} · {row.plan}
                      </p>
                      <p className="mt-2 tabular-nums">
                        Paid INR {(row.totalCents / 100).toFixed(0)} → Prize pool INR{" "}
                        {(row.prizePoolCents / 100).toFixed(0)} · Charity INR {(row.charityCents / 100).toFixed(0)} ·
                        Platform INR {(row.platformCents / 100).toFixed(0)}
                      </p>
                    </li>
                  ))}
                </ul>
                <DashboardPaginationControls
                  which="pap"
                  page={props.pagination.payments.page}
                  totalPages={props.pagination.payments.totalPages}
                  tokens={pageTokens}
                  extra={props.pagination.extraQuery}
                />
              </section>
            ) : null}
        </section>
        <DashboardLowerSections
          {...lowerSectionsProps}
        />
      </div>
    </main>
  );
}
