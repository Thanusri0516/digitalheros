import type { SubscriptionPlan } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { isPrismaMissingTableError } from "@/lib/prisma-missing-table";

const paymentAllocationSelect = {
  id: true,
  paidAt: true,
  totalCents: true,
  prizePoolCents: true,
  charityCents: true,
  platformCents: true,
  plan: true,
} as const;

export type PaymentAllocationListRow = {
  id: string;
  paidAt: Date;
  totalCents: number;
  prizePoolCents: number;
  charityCents: number;
  platformCents: number;
  plan: SubscriptionPlan;
};

export async function findPaymentAllocationsForUser(userId: string): Promise<PaymentAllocationListRow[]> {
  try {
    return await prisma.paymentAllocation.findMany({
      where: { userId },
      orderBy: { paidAt: "desc" },
      take: 12,
      select: paymentAllocationSelect,
    });
  } catch (e) {
    if (isPrismaMissingTableError(e)) return [];
    throw e;
  }
}

export async function aggregatePaymentAllocationsTotals() {
  try {
    return await prisma.paymentAllocation.aggregate({
      _sum: { totalCents: true, prizePoolCents: true, charityCents: true, platformCents: true },
    });
  } catch (e) {
    if (isPrismaMissingTableError(e)) {
      return {
        _sum: { totalCents: null, prizePoolCents: null, charityCents: null, platformCents: null },
      };
    }
    throw e;
  }
}
