import { DrawStatus, PayoutStatus, SubscriptionPlan, SubscriptionStatus, VerificationStatus } from "@/generated/prisma/client";
import type { Subscription } from "@/generated/prisma/client";
import { DASHBOARD_CHARITY_LIST_LIMIT } from "@/lib/dashboard-constants";
import { prisma } from "@/lib/prisma";
import { isPrismaMissingTableError } from "@/lib/prisma-missing-table";
import { PAGE_SIZE, clampPage, totalPages } from "@/lib/pagination";

export type DashboardPages = {
  drawPage?: number;
  claimPage?: number;
  paymentPage?: number;
};

/**
 * Single interactive transaction = one DB connection for the whole load.
 * Required when DATABASE_URL uses connection_limit=1 (e.g. Supabase pooler); separate
 * getSubscriptionEntitlement + $transaction calls can exhaust the pool under load.
 */
export async function loadDashboardPageData(userId: string, pages?: DashboardPages) {
  const now = new Date();
  const ps = PAGE_SIZE;
  const rawDraw = pages?.drawPage ?? 1;
  const rawClaim = pages?.claimPage ?? 1;
  const rawPay = pages?.paymentPage ?? 1;

  return prisma.$transaction(
    async (tx) => {
      let sub: Pick<Subscription, "id" | "status" | "renewalDate" | "startDate"> | null = await tx.subscription.findFirst({
        where: { userId },
        orderBy: { startDate: "desc" },
        select: { id: true, status: true, renewalDate: true, startDate: true },
      });

      if (sub?.status === SubscriptionStatus.ACTIVE && sub.renewalDate < now) {
        await tx.subscription.update({
          where: { id: sub.id },
          data: { status: SubscriptionStatus.LAPSED },
        });
        sub = { ...sub, status: SubscriptionStatus.LAPSED };
      }

      const profile = await tx.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true, selectedCharityId: true, charityPercent: true },
      });

      const scores = await tx.score.findMany({
        where: { userId },
        select: { id: true, value: true, playedAt: true },
        orderBy: [{ playedAt: "desc" }, { createdAt: "desc" }],
      });

      const charities = await tx.charity.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true },
        take: DASHBOARD_CHARITY_LIST_LIMIT,
      });

      const [publishedDrawCount, claimCount] = await Promise.all([
        tx.draw.count({ where: { status: DrawStatus.PUBLISHED } }),
        tx.winnerClaim.count({ where: { userId } }),
      ]);
      const drawTotalPages = totalPages(publishedDrawCount, ps);
      const claimTotalPages = totalPages(claimCount, ps);
      const drawPage = clampPage(rawDraw, drawTotalPages);
      const claimPage = clampPage(rawClaim, claimTotalPages);

      const publishedDrawRows = await tx.draw.findMany({
        where: { status: DrawStatus.PUBLISHED },
        orderBy: [{ year: "desc" }, { month: "desc" }],
        skip: (drawPage - 1) * ps,
        take: ps,
        select: { month: true, year: true, winningNumbers: true, publishedAt: true },
      });

      const claims = await tx.winnerClaim.findMany({
        where: { userId },
        select: {
          id: true,
          matchCount: true,
          amountCents: true,
          verificationStatus: true,
          payoutStatus: true,
          proofUrl: true,
          draw: { select: { month: true, year: true } },
        },
        orderBy: { id: "desc" },
        skip: (claimPage - 1) * ps,
        take: ps,
      });
      const [claimAmountAgg, approvedAgg, paidAgg, pendingVerificationAgg] = await Promise.all([
        tx.winnerClaim.aggregate({ where: { userId }, _sum: { amountCents: true } }),
        tx.winnerClaim.aggregate({
          where: { userId, verificationStatus: VerificationStatus.APPROVED },
          _sum: { amountCents: true },
          _count: { _all: true },
        }),
        tx.winnerClaim.aggregate({
          where: { userId, payoutStatus: PayoutStatus.PAID },
          _sum: { amountCents: true },
          _count: { _all: true },
        }),
        tx.winnerClaim.aggregate({
          where: { userId, verificationStatus: VerificationStatus.PENDING },
          _count: { _all: true },
        }),
      ]);

      let paymentCount = 0;
      let paymentPage = 1;
      let paymentTotalPages = 1;
      let paymentAllocRows: Array<{
        id: string;
        paidAt: Date;
        totalCents: number;
        prizePoolCents: number;
        charityCents: number;
        platformCents: number;
        plan: SubscriptionPlan;
      }> = [];

      try {
        paymentCount = await tx.paymentAllocation.count({ where: { userId } });
        paymentTotalPages = totalPages(paymentCount, ps);
        paymentPage = clampPage(rawPay, paymentTotalPages);
        paymentAllocRows = await tx.paymentAllocation.findMany({
          where: { userId },
          orderBy: { paidAt: "desc" },
          skip: (paymentPage - 1) * ps,
          take: ps,
          select: {
            id: true,
            paidAt: true,
            totalCents: true,
            prizePoolCents: true,
            charityCents: true,
            platformCents: true,
            plan: true,
          },
        });
      } catch (e) {
        if (!isPrismaMissingTableError(e)) throw e;
      }

      const isActive =
        sub !== null && sub.status === SubscriptionStatus.ACTIVE && sub.renewalDate >= now;
      const displayStatus: SubscriptionStatus | "NONE" = sub === null ? "NONE" : sub.status;

      return {
        profile,
        scores,
        charities,
        claims,
        claimAnalytics: {
          totalAmountCents: claimAmountAgg._sum.amountCents ?? 0,
          approvedAmountCents: approvedAgg._sum.amountCents ?? 0,
          paidAmountCents: paidAgg._sum.amountCents ?? 0,
          approvedCount: approvedAgg._count._all,
          paidCount: paidAgg._count._all,
          pendingVerificationCount: pendingVerificationAgg._count._all,
        },
        claimCount,
        claimPage,
        claimTotalPages,
        publishedDrawRows,
        publishedDrawCount,
        drawPage,
        drawTotalPages,
        paymentAllocRows,
        paymentCount,
        paymentPage,
        paymentTotalPages,
        subscription: sub,
        isActive,
        displayStatus,
      };
    },
    { maxWait: 15_000, timeout: 30_000 },
  );
}
