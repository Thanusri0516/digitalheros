import { redirect } from "next/navigation";
import { Role } from "@/generated/prisma/client";
import { getSession } from "@/lib/auth";
import { computeMatchCount, parseWinningNumbers } from "@/lib/draw";
import { loadDashboardPageData } from "@/lib/dashboard-load";
import { parsePositiveInt } from "@/lib/pagination";
import { syncSubscriptionFromCheckoutSessionId } from "@/lib/sync-subscription-from-checkout";
import { DashboardClient } from "@/components/dashboard-client";

export const dynamic = "force-dynamic";

type DashboardSearchParams = Promise<Record<string, string | string[] | undefined>>;

function dashboardExtraQuery(sp: Record<string, string | string[] | undefined>): Record<string, string> {
  const extra: Record<string, string> = {};
  for (const [k, v] of Object.entries(sp)) {
    if (k === "dp" || k === "cp" || k === "pap") continue;
    const val = Array.isArray(v) ? v[0] : v;
    if (val !== undefined && val !== "") extra[k] = val;
  }
  return extra;
}

export default async function DashboardPage({ searchParams }: { searchParams?: DashboardSearchParams }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === Role.ADMIN) redirect("/admin");

  const sp = searchParams ? await searchParams : {};
  const checkout = typeof sp.checkout === "string" ? sp.checkout : undefined;
  const rawSession = sp.session_id;
  const sessionId = typeof rawSession === "string" ? rawSession : Array.isArray(rawSession) ? rawSession[0] : undefined;
  if (checkout === "success" && sessionId?.startsWith("cs_")) {
    await syncSubscriptionFromCheckoutSessionId(sessionId, session.userId);
    redirect("/dashboard");
  }

  const {
    profile,
    scores,
    charities,
    claims,
    claimAnalytics,
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
    subscription: latestSubscription,
    isActive: subscriptionActive,
    displayStatus,
  } = await loadDashboardPageData(session.userId, {
    drawPage: parsePositiveInt(sp.dp),
    claimPage: parsePositiveInt(sp.cp),
    paymentPage: parsePositiveInt(sp.pap),
  });

  if (!profile) redirect("/login");

  const userScoreValuesForDraw = scores.slice(0, 5).map((s) => s.value);
  const publishedDraws = publishedDrawRows.map((d) => {
    const winning = parseWinningNumbers(d.winningNumbers);
    return {
      month: d.month,
      year: d.year,
      winningNumbers: winning,
      yourMatchCount: computeMatchCount(userScoreValuesForDraw, winning),
      publishedAt: d.publishedAt?.toISOString() ?? null,
    };
  });

  const paginationExtra = dashboardExtraQuery(sp);

  return (
    <DashboardClient
      firstName={profile.name.trim().split(/\s+/)[0] || "Player"}
      fullName={profile.name}
      email={profile.email}
      subscriptionActive={subscriptionActive}
      subscriptionStatus={displayStatus === "NONE" ? "INACTIVE" : displayStatus}
      renewalLabel={
        latestSubscription ? new Date(latestSubscription.renewalDate).toLocaleDateString() : "—"
      }
      user={{
        selectedCharityId: profile.selectedCharityId,
        charityPercent: profile.charityPercent,
      }}
      charities={charities.map((c) => ({ id: c.id, name: c.name }))}
      scores={scores.map((s) => ({
        id: s.id,
        playedAt: s.playedAt.toISOString(),
        value: s.value,
      }))}
      claims={claims.map((c) => ({
        id: c.id,
        matchCount: c.matchCount,
        amountCents: c.amountCents,
        verificationStatus: c.verificationStatus,
        payoutStatus: c.payoutStatus,
        proofUrl: c.proofUrl,
        draw: { month: c.draw.month, year: c.draw.year },
      }))}
      claimAnalytics={claimAnalytics}
      publishedDraws={publishedDraws}
      publishedDrawTotalCount={publishedDrawCount}
      paymentAllocations={paymentAllocRows.map((a) => ({
        id: a.id,
        paidAt: a.paidAt.toISOString(),
        totalCents: a.totalCents,
        prizePoolCents: a.prizePoolCents,
        charityCents: a.charityCents,
        platformCents: a.platformCents,
        plan: a.plan,
      }))}
      pagination={{
        extraQuery: paginationExtra,
        draws: { page: drawPage, totalPages: drawTotalPages },
        claims: { page: claimPage, totalPages: claimTotalPages, totalCount: claimCount },
        payments: { page: paymentPage, totalPages: paymentTotalPages, totalCount: paymentCount },
      }}
    />
  );
}
