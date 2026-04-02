import { SubscriptionPlan } from "@/generated/prisma/client";
import { CHARITY_PERCENT, REVENUE_SPLIT } from "@/lib/constants";

export type PaymentSplit = {
  prizePoolCents: number;
  charityCents: number;
  platformCents: number;
};

/** Clamp user charity % to PRD bounds (min 10%, voluntary increase capped). */
export function clampCharityPercent(raw: number): number {
  return Math.min(CHARITY_PERCENT.max, Math.max(CHARITY_PERCENT.min, Math.round(raw)));
}

/**
 * Split a subscription payment into prize / charity / platform (paise).
 * Prize pool % is fixed; charity % is user-configurable (remainder = platform).
 */
export function splitSubscriptionPayment(totalCents: number, charityPercentOpt?: number): PaymentSplit {
  const pct = clampCharityPercent(charityPercentOpt ?? CHARITY_PERCENT.default);
  const prizePoolCents = Math.floor((totalCents * REVENUE_SPLIT.prizePoolPercent) / 100);
  const charityCents = Math.floor((totalCents * pct) / 100);
  const platformCents = totalCents - prizePoolCents - charityCents;
  return { prizePoolCents, charityCents, platformCents };
}

export type PrizeContributionMonth = { poolMonth: number; poolYear: number; amountCents: number };

/**
 * Prize pool money is attributed to calendar months for draws.
 * Monthly: full prize slice to the month of payment.
 * Yearly: prize slice split evenly across 12 consecutive months from payment date (remainder on first month).
 */
export function buildPrizePoolContributionsForPlan(
  prizePoolTotalCents: number,
  plan: SubscriptionPlan,
  paidAt: Date,
): PrizeContributionMonth[] {
  if (plan === SubscriptionPlan.MONTHLY) {
    return [
      {
        poolMonth: paidAt.getMonth() + 1,
        poolYear: paidAt.getFullYear(),
        amountCents: prizePoolTotalCents,
      },
    ];
  }
  const base = Math.floor(prizePoolTotalCents / 12);
  const remainder = prizePoolTotalCents - base * 12;
  const rows: PrizeContributionMonth[] = [];
  const d = new Date(paidAt);
  for (let i = 0; i < 12; i++) {
    const amountCents = i === 0 ? base + remainder : base;
    rows.push({
      poolMonth: d.getMonth() + 1,
      poolYear: d.getFullYear(),
      amountCents,
    });
    d.setMonth(d.getMonth() + 1);
  }
  return rows;
}
