import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { isPrismaMissingTableError } from "@/lib/prisma-missing-table";

export type CharityLifetimeRow = {
  charityId: string;
  charityName: string;
  totalCents: number;
};

export type CharityMonthRow = {
  charityId: string;
  charityName: string;
  year: number;
  month: number;
  totalCents: number;
};

export type CharityDonationReport = {
  lifetime: CharityLifetimeRow[];
  monthly: CharityMonthRow[];
};

/** Helps explain empty charity tables vs existing subscriptions. */
export type CharityPayoutDiagnostics = {
  paymentAllocationCount: number;
  charityDonationRowCount: number;
  /** Sum of `charityCents` on payment rows (0 if subscriber had no charity at payment time). */
  sumCharityCentsFromPayments: number;
};

export async function getCharityPayoutDiagnostics(): Promise<CharityPayoutDiagnostics> {
  try {
    // One interactive transaction = one DB connection. Do not use Promise.all here:
    // with connection_limit=1, parallel queries exhaust the pool (P2024 timeout).
    return await prisma.$transaction(async (tx) => {
      const paymentAllocationCount = await tx.paymentAllocation.count();
      const charityDonationRowCount = await tx.charityDonation.count();
      const agg = await tx.paymentAllocation.aggregate({ _sum: { charityCents: true } });
      return {
        paymentAllocationCount,
        charityDonationRowCount,
        sumCharityCentsFromPayments: agg._sum.charityCents ?? 0,
      };
    });
  } catch (e) {
    if (isPrismaMissingTableError(e)) {
      return { paymentAllocationCount: 0, charityDonationRowCount: 0, sumCharityCentsFromPayments: 0 };
    }
    throw e;
  }
}

/** Aggregates `CharityDonation` for manual bank payouts to charities. */
export async function getCharityDonationReport(): Promise<CharityDonationReport> {
  try {
    const charities = await prisma.charity.findMany({ select: { id: true, name: true } });
    const nameById = Object.fromEntries(charities.map((c) => [c.id, c.name]));

    const grouped = await prisma.charityDonation.groupBy({
      by: ["charityId"],
      _sum: { amountCents: true },
    });

    const lifetime: CharityLifetimeRow[] = grouped
      .map((g) => ({
        charityId: g.charityId,
        charityName: nameById[g.charityId] ?? g.charityId,
        totalCents: g._sum.amountCents ?? 0,
      }))
      .sort((a, b) => b.totalCents - a.totalCents);

    const rawMonthly = await prisma.$queryRaw<Array<{ year: number; month: number; charityId: string; total: bigint }>>(
      Prisma.sql`
        SELECT EXTRACT(YEAR FROM "createdAt")::int AS year,
               EXTRACT(MONTH FROM "createdAt")::int AS month,
               "charityId",
               SUM("amountCents")::bigint AS total
        FROM "CharityDonation"
        GROUP BY 1, 2, 3
        ORDER BY year DESC, month DESC, "charityId" ASC
      `,
    );

    const monthly: CharityMonthRow[] = rawMonthly.map((r) => ({
      charityId: r.charityId,
      charityName: nameById[r.charityId] ?? r.charityId,
      year: r.year,
      month: r.month,
      totalCents: Number(r.total),
    }));

    return { lifetime, monthly };
  } catch (e) {
    if (isPrismaMissingTableError(e)) {
      return { lifetime: [], monthly: [] };
    }
    throw e;
  }
}
