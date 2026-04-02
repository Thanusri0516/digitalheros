import { prisma } from "@/lib/prisma";
import { DrawStatus, SubscriptionStatus } from "@/generated/prisma/client";
import { PAGE_SIZE, clampPage, totalPages } from "@/lib/pagination";

export type AdminListParams = {
  usersPage: number;
  charitiesPage: number;
  drawsPage: number;
  claimsPage: number;
  ledgerPage: number;
};

/** Remote poolers (e.g. Supabase) often need >5s for many parallel queries in one interactive tx. */
const ADMIN_TX_MS = 30_000;

/**
 * Paginated admin lists in one transaction (single DB connection for pooler limits).
 */
export async function loadAdminPaginatedData(params: AdminListParams) {
  const ps = PAGE_SIZE;

  return prisma.$transaction(
    async (tx) => {
      const [
        userCount,
        charityCount,
        drawCount,
        claimCount,
        ledgerCount,
        activeSubCount,
        publishedDrawCount,
        draftDrawCount,
        ledgerPoolAgg,
      ] = await Promise.all([
        tx.user.count(),
        tx.charity.count(),
        tx.draw.count(),
        tx.winnerClaim.count(),
        tx.prizePoolLedger.count(),
        tx.subscription.count({ where: { status: SubscriptionStatus.ACTIVE } }),
        tx.draw.count({ where: { status: DrawStatus.PUBLISHED } }),
        tx.draw.count({ where: { status: DrawStatus.DRAFT } }),
        tx.prizePoolLedger.aggregate({ _sum: { totalPoolCents: true } }),
      ]);

      const usersPage = clampPage(params.usersPage, totalPages(userCount, ps));
      const charitiesPage = clampPage(params.charitiesPage, totalPages(charityCount, ps));
      const drawsPage = clampPage(params.drawsPage, totalPages(drawCount, ps));
      const claimsPage = clampPage(params.claimsPage, totalPages(claimCount, ps));
      const ledgerPage = clampPage(params.ledgerPage, totalPages(ledgerCount, ps));

      const [users, charities, draws, claims, ledgers] = await Promise.all([
        tx.user.findMany({
          orderBy: { createdAt: "desc" },
          skip: (usersPage - 1) * ps,
          take: ps,
          include: { subscriptions: { orderBy: { startDate: "desc" }, take: 1 } },
        }),
        tx.charity.findMany({
          orderBy: { name: "asc" },
          skip: (charitiesPage - 1) * ps,
          take: ps,
        }),
        tx.draw.findMany({
          orderBy: [{ year: "desc" }, { month: "desc" }],
          skip: (drawsPage - 1) * ps,
          take: ps,
        }),
        tx.winnerClaim.findMany({
          include: { user: true, draw: true },
          orderBy: { id: "desc" },
          skip: (claimsPage - 1) * ps,
          take: ps,
        }),
        tx.prizePoolLedger.findMany({
          orderBy: [{ year: "desc" }, { month: "desc" }],
          skip: (ledgerPage - 1) * ps,
          take: ps,
        }),
      ]);

      return {
        pageSize: ps,
        userCount,
        users,
        usersPage,
        usersTotalPages: totalPages(userCount, ps),
        activeSubCount,
        charityCount,
        charities,
        charitiesPage,
        charitiesTotalPages: totalPages(charityCount, ps),
        drawCount,
        draws,
        drawsPage,
        drawsTotalPages: totalPages(drawCount, ps),
        publishedDrawCount,
        draftDrawCount,
        claimCount,
        claims,
        claimsPage,
        claimsTotalPages: totalPages(claimCount, ps),
        ledgerCount,
        ledgers,
        ledgerPage,
        ledgersTotalPages: totalPages(ledgerCount, ps),
        ledgerTotalPoolCents: ledgerPoolAgg._sum.totalPoolCents ?? 0,
      };
    },
    { maxWait: 15_000, timeout: ADMIN_TX_MS },
  );
}
