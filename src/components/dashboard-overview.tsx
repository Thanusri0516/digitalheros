"use client";

import Link from "next/link";
import { memo } from "react";
import { updateCharitySelectionAction } from "@/app/actions";
import { DashboardPaginationControls } from "@/components/dashboard-pagination-controls";
import { CHARITY_PERCENT, REVENUE_SPLIT } from "@/lib/constants";
import { cn } from "@/lib/cn";
import {
  bentoCard,
  bentoCardTitle,
  bentoInset,
  bentoLabel,
  bentoMetricGrid,
  bentoValue,
  ghostButton,
  glassInput,
  interactiveLiftSubtle,
} from "@/lib/glass-styles";

function subscribeCtaClassName() {
  return cn(
    "mt-4 inline-flex items-center justify-center rounded-lg border border-white/[0.14] bg-white/[0.08] px-8 py-3 text-sm font-medium text-zinc-100 transition-colors hover:border-white/[0.2] hover:bg-white/[0.12]",
    interactiveLiftSubtle,
  );
}

export const SubscriptionStatusPill = memo(function SubscriptionStatusPill({
  status,
  active,
}: {
  status: string;
  active: boolean;
}) {
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
});

export type DashboardOverviewProps = {
  subscriptionActive: boolean;
  subscriptionStatus: string;
  renewalLabel: string;
  user: { selectedCharityId: string | null; charityPercent: number };
  charities: { id: string; name: string }[];
  selectedCharityName: string;
  publishedDrawTotalCount: number;
  paymentAllocations: Array<{
    id: string;
    paidAt: string;
    totalCents: number;
    prizePoolCents: number;
    charityCents: number;
    platformCents: number;
    plan: string;
  }>;
  pagination: {
    extraQuery: Record<string, string>;
    payments: { page: number; totalPages: number; totalCount: number };
  };
  pageTokens: { dp: number; cp: number; pap: number };
};

export const DashboardOverview = memo(function DashboardOverview(props: DashboardOverviewProps) {
  return (
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
              <p className={cn(bentoValue, "mt-2")}>{props.selectedCharityName}</p>
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
          <span className="font-medium text-brand-offwhite/70">Upcoming draws:</span> admins run and publish one draw per
          calendar month. Check the Winnings tab for your match history and the next published results.
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
            Each payment is allocated: {REVENUE_SPLIT.prizePoolPercent}% prize pool, then your chosen charity percentage (
            {CHARITY_PERCENT.min}–{CHARITY_PERCENT.max}%, default {CHARITY_PERCENT.default}%) to your selected charity when
            set — otherwise that slice stays with the platform — and the remainder is platform revenue. Yearly plans
            spread the prize slice across twelve months for draws.
          </p>
          <ul className="mt-5 space-y-3 text-sm text-brand-offwhite/85">
            {props.paymentAllocations.map((row) => (
              <li key={row.id} className={cn(bentoInset, "p-4")}>
                <p className="text-xs text-brand-offwhite/45">
                  {new Date(row.paidAt).toLocaleString()} · {row.plan}
                </p>
                <p className="mt-2 tabular-nums">
                  Paid INR {(row.totalCents / 100).toFixed(0)} → Prize pool INR {(row.prizePoolCents / 100).toFixed(0)} ·
                  Charity INR {(row.charityCents / 100).toFixed(0)} · Platform INR {(row.platformCents / 100).toFixed(0)}
                </p>
              </li>
            ))}
          </ul>
          <DashboardPaginationControls
            which="pap"
            page={props.pagination.payments.page}
            totalPages={props.pagination.payments.totalPages}
            tokens={props.pageTokens}
            extra={props.pagination.extraQuery}
          />
        </section>
      ) : null}
    </section>
  );
});
