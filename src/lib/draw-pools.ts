import type { Draw, Subscription, User } from "@/generated/prisma/client";
import { SubscriptionStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { computeMatchCount, parseWinningNumbers } from "@/lib/draw";
import { isPrismaMissingTableError } from "@/lib/prisma-missing-table";

export type DrawPublishPreview = {
  winningNumbers: number[];
  rolloverInCents: number;
  totalPoolCents: number;
  fiveMatchPoolCents: number;
  fourMatchPoolCents: number;
  threeMatchPoolCents: number;
  winnerCounts: { tier5: number; tier4: number; tier3: number };
  /** Rollover to the following month if no 5-match winners (full 5-match tier pot). */
  rolloverOutCents: number;
  activeSubscriberCount: number;
  winners: Array<{ userId: string; matchCount: number }>;
  payouts: Array<{ userId: string; matchCount: number; amountCents: number }>;
};

function previousCalendarMonth(month: number, year: number): { month: number; year: number } {
  if (month <= 1) return { month: 12, year: year - 1 };
  return { month: month - 1, year };
}

/** Jackpot carry from the prior month’s published ledger (5-match pool that rolled). */
export async function getRolloverInCentsForDraw(month: number, year: number): Promise<number> {
  const prev = previousCalendarMonth(month, year);
  const ledger = await prisma.prizePoolLedger.findFirst({
    where: { month: prev.month, year: prev.year },
    orderBy: { createdAt: "desc" },
  });
  return ledger?.rolloverCents ?? 0;
}

/** Sum of prize-pool slices attributed to this calendar month (from subscription revenue split). */
export async function getTotalPrizePoolCentsForMonth(month: number, year: number): Promise<number> {
  try {
    const agg = await prisma.prizePoolContribution.aggregate({
      where: { poolMonth: month, poolYear: year },
      _sum: { amountCents: true },
    });
    return agg._sum.amountCents ?? 0;
  } catch (e) {
    if (isPrismaMissingTableError(e)) return 0;
    throw e;
  }
}

type UserWithScores = User & { scores: { value: number; playedAt: Date }[] };

function buildWinnerPayouts(
  winners: Array<{ userId: string; matchCount: number }>,
  fivePool: number,
  fourPool: number,
  threePool: number,
): Array<{ userId: string; matchCount: number; amountCents: number }> {
  const byTier = (tier: number) => winners.filter((w) => w.matchCount === tier);
  const payoutFor = (tier: number, pool: number) => {
    const list = byTier(tier);
    if (!list.length) return [];
    const each = Math.floor(pool / list.length);
    return list.map((entry) => ({ ...entry, amountCents: each }));
  };
  return [...payoutFor(5, fivePool), ...payoutFor(4, fourPool), ...payoutFor(3, threePool)];
}

export function analyzeDrawPublish(
  draw: Draw,
  activeSubscriptions: Pick<Subscription, "userId">[],
  usersWithScores: UserWithScores[],
  rolloverInCents: number,
  /** Total prize pool for this draw month (sum of attributed prize slices from payments). */
  totalPoolCents: number,
): DrawPublishPreview {
  const winningNumbers = parseWinningNumbers(draw.winningNumbers);
  const fiveBase = Math.floor(totalPoolCents * 0.4);
  const fourPool = Math.floor(totalPoolCents * 0.35);
  const threePool = totalPoolCents - fiveBase - fourPool;
  const fiveMatchPoolCents = fiveBase + rolloverInCents;

  const winners: Array<{ userId: string; matchCount: number }> = [];
  usersWithScores.forEach((u) => {
    const userNumbers = u.scores.map((s) => s.value);
    const matchCount = computeMatchCount(userNumbers, winningNumbers);
    if (matchCount >= 3) winners.push({ userId: u.id, matchCount });
  });

  const byTier = (tier: number) => winners.filter((w) => w.matchCount === tier);
  const tier5 = byTier(5).length;
  const tier4 = byTier(4).length;
  const tier3 = byTier(3).length;

  const rolloverOutCents = tier5 === 0 ? fiveMatchPoolCents : 0;
  const payouts = buildWinnerPayouts(winners, fiveMatchPoolCents, fourPool, threePool);

  return {
    winningNumbers,
    rolloverInCents,
    totalPoolCents,
    fiveMatchPoolCents,
    fourMatchPoolCents: fourPool,
    threeMatchPoolCents: threePool,
    winnerCounts: { tier5, tier4, tier3 },
    rolloverOutCents,
    activeSubscriberCount: activeSubscriptions.length,
    winners,
    payouts,
  };
}

/** Loads subscribers + scores for publish/preview (same rules as publish). */
export async function loadPublishContext(drawMonth: number, drawYear: number) {
  const now = new Date();
  const activeSubscriptions = await prisma.subscription.findMany({
    where: {
      status: SubscriptionStatus.ACTIVE,
      renewalDate: { gte: now },
    },
    distinct: ["userId"],
  });
  const activeUserIds = activeSubscriptions.map((s) => s.userId);
  const usersWithScores = await prisma.user.findMany({
    where: { id: { in: activeUserIds } },
    include: { scores: { orderBy: { playedAt: "desc" }, take: 5 } },
  });
  const [rolloverInCents, totalPoolCents] = await Promise.all([
    getRolloverInCentsForDraw(drawMonth, drawYear),
    getTotalPrizePoolCentsForMonth(drawMonth, drawYear),
  ]);
  return { activeSubscriptions, usersWithScores, rolloverInCents, totalPoolCents };
}
