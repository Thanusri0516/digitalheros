import type { SubscriptionPlan } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { buildPrizePoolContributionsForPlan, splitSubscriptionPayment } from "@/lib/revenue-split";
import { createHash } from "crypto";

type DbTx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

type RecordPaymentAllocationInput = {
  userId: string;
  subscriptionId: string | null;
  totalCents: number;
  plan: SubscriptionPlan;
  stripePaymentRef: string;
  paidAt: Date;
  selectedCharityId: string | null;
  /** User preference (10–40%); defaults via split if omitted */
  charityPercent?: number;
};

/**
 * Persists revenue split + prize month rows + optional charity donation.
 * If no charity selected, charity slice is folded into platform for reporting.
 * Idempotent: skips if stripePaymentRef already exists.
 */
async function charityDonationHasStripePaymentRefColumn(tx: DbTx): Promise<boolean> {
  // Older DBs may not have the `stripePaymentRef` column yet.
  // We only use this to decide whether to use Prisma create or a fallback insert.
  const rows = await tx.$queryRaw<Array<{ exists: boolean }>>`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_name ILIKE 'CharityDonation'
        AND column_name ILIKE 'stripePaymentRef'
    ) AS "exists";
  `;
  return rows[0]?.exists ?? false;
}

export async function recordPaymentAllocationTx(tx: DbTx, input: RecordPaymentAllocationInput): Promise<void> {
  const existing = await tx.paymentAllocation.findUnique({
    where: { stripePaymentRef: input.stripePaymentRef },
  });
  if (existing) return;

  const split = splitSubscriptionPayment(input.totalCents, input.charityPercent);
  let charityCents = split.charityCents;
  let platformCents = split.platformCents;
  if (!input.selectedCharityId) {
    platformCents += charityCents;
    charityCents = 0;
  }

  const prizeRows = buildPrizePoolContributionsForPlan(split.prizePoolCents, input.plan, input.paidAt);

  const allocation = await tx.paymentAllocation.create({
    data: {
      userId: input.userId,
      subscriptionId: input.subscriptionId,
      stripePaymentRef: input.stripePaymentRef,
      totalCents: input.totalCents,
      prizePoolCents: split.prizePoolCents,
      charityCents,
      platformCents,
      plan: input.plan,
      paidAt: input.paidAt,
    },
  });

  await tx.prizePoolContribution.createMany({
    data: prizeRows.map((r) => ({
      paymentAllocationId: allocation.id,
      amountCents: r.amountCents,
      poolMonth: r.poolMonth,
      poolYear: r.poolYear,
    })),
  });

  if (input.selectedCharityId && charityCents > 0) {
    const donationId = `cd_${createHash("sha256").update(input.stripePaymentRef).digest("hex")}`;
    const hasStripePaymentRef = await charityDonationHasStripePaymentRefColumn(tx);

    if (hasStripePaymentRef) {
      const existingDonation = await tx.charityDonation.findUnique({ where: { id: donationId } });
      if (!existingDonation) {
        await tx.charityDonation.create({
          data: {
            id: donationId,
            userId: input.userId,
            charityId: input.selectedCharityId,
            amountCents: charityCents,
            contributionType: "subscription",
            stripePaymentRef: input.stripePaymentRef,
          },
        });
      }
    } else {
      // Fallback for older DBs without `stripePaymentRef` column.
      await tx.$executeRaw`
        INSERT INTO "CharityDonation"
          ("id", "userId", "charityId", "amountCents", "contributionType")
        VALUES
          (${donationId}, ${input.userId}, ${input.selectedCharityId}, ${charityCents}, ${"subscription"})
        ON CONFLICT ("id") DO NOTHING
      `;
    }
  }
}

export async function recordPaymentAllocation(input: RecordPaymentAllocationInput): Promise<void> {
  await prisma.$transaction((tx) => recordPaymentAllocationTx(tx, input));
}
