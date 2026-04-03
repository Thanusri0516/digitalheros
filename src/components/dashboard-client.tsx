"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { memo, useMemo } from "react";
import { DashboardLowerSectionsSkeleton } from "@/components/dashboard-lower-sections-skeleton";
import { DashboardOverview, SubscriptionStatusPill } from "@/components/dashboard-overview";
import type { DashboardLowerSectionsProps } from "@/components/dashboard-lower-sections";
import { cn } from "@/lib/cn";
import { bentoHero, interactiveLiftSubtle } from "@/lib/glass-styles";

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
    loading: () => <DashboardLowerSectionsSkeleton />,
    ssr: true,
  },
);

const USER_FEATURE_LINKS = [
  { href: "#overview", label: "Overview" },
  { href: "#scores", label: "Scores" },
  { href: "#winnings", label: "Winnings" },
  { href: "#profile", label: "Profile" },
] as const;

const DashboardStickyNav = memo(function DashboardStickyNav({ subscriptionActive }: { subscriptionActive: boolean }) {
  return (
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
            {subscriptionActive ? "Manage Subscription" : "Subscribe"}
          </Link>
        </li>
      </ul>
    </nav>
  );
});

const DashboardHero = memo(function DashboardHero({
  firstName,
  subscriptionActive,
  subscriptionStatus,
}: {
  firstName: string;
  subscriptionActive: boolean;
  subscriptionStatus: string;
}) {
  return (
    <div className={cn(bentoHero, "mb-8")}>
      <div className="relative z-[1] flex flex-wrap items-start justify-between gap-8">
        <div className="min-w-0 space-y-2">
          <h1 className="font-heading text-2xl font-medium tracking-[-0.03em] text-zinc-50 md:text-[1.75rem]">
            {firstName}
          </h1>
          <p className="text-sm text-zinc-500">Scores, draws, charity preference, and claims.</p>
        </div>
        <div className="flex flex-col items-end gap-2 text-right">
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-600">Subscription</p>
          <SubscriptionStatusPill status={subscriptionStatus} active={subscriptionActive} />
        </div>
      </div>

      {subscriptionActive ? (
        <div className="relative z-[1] mt-6 rounded-lg border border-emerald-500/15 bg-emerald-950/20 px-6 py-4 backdrop-blur-md">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-200/75">✓ Active subscription</p>
          <p className="mt-1 text-sm text-zinc-500">
            You&apos;re entered into each monthly prize draw. Use the bar above to jump without leaving the page.
          </p>
        </div>
      ) : null}
    </div>
  );
});

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

  const overviewProps = useMemo(
    () => ({
      subscriptionActive: props.subscriptionActive,
      subscriptionStatus: props.subscriptionStatus,
      renewalLabel: props.renewalLabel,
      user: props.user,
      charities: props.charities,
      selectedCharityName,
      publishedDrawTotalCount: props.publishedDrawTotalCount,
      paymentAllocations: props.paymentAllocations,
      pagination: {
        extraQuery: props.pagination.extraQuery,
        payments: props.pagination.payments,
      },
      pageTokens,
    }),
    [
      props.charities,
      props.paymentAllocations,
      props.pagination.extraQuery,
      props.pagination.payments,
      props.publishedDrawTotalCount,
      props.renewalLabel,
      props.subscriptionActive,
      props.subscriptionStatus,
      props.user,
      selectedCharityName,
      pageTokens,
    ],
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

      <DashboardStickyNav subscriptionActive={props.subscriptionActive} />

      <DashboardHero
        firstName={props.firstName}
        subscriptionActive={props.subscriptionActive}
        subscriptionStatus={props.subscriptionStatus}
      />

      <div className="relative z-[1] space-y-6">
        <DashboardOverview {...overviewProps} />
        <DashboardLowerSections {...lowerSectionsProps} />
      </div>
    </main>
  );
}
