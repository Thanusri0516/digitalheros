import { cache } from "react";
import { redirect } from "next/navigation";
import { SubscriptionStatus } from "@/generated/prisma/client";
import type { Subscription, SubscriptionStatus as SubStatus, User } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

/** If ACTIVE but past renewal, persist LAPSED and return the updated row (shared by login + entitlement). */
export async function applySubscriptionLapseSync<T extends { id: string; status: SubStatus; renewalDate: Date }>(
  sub: T,
): Promise<T> {
  const now = new Date();
  if (sub.status === SubscriptionStatus.ACTIVE && sub.renewalDate < now) {
    await prisma.subscription.update({
      where: { id: sub.id },
      data: { status: SubscriptionStatus.LAPSED },
    });
    return { ...sub, status: SubscriptionStatus.LAPSED };
  }
  return sub;
}

/**
 * Latest subscription row + whether the user is entitled to subscriber-only features.
 * Runs a DB read on each call; use from React `cache()` so one request dedupes multiple reads.
 * Marks ACTIVE subscriptions past `renewalDate` as LAPSED (real-time lifecycle).
 */
export const getSubscriptionEntitlement = cache(
  async (
    userId: string,
  ): Promise<{
    subscription: Subscription | null;
    /** True only when status is ACTIVE and renewal is still in the future. */
    isActive: boolean;
    /** Status after lapse sync (for UI). */
    displayStatus: SubscriptionStatus | "NONE";
  }> => {
    let sub = await prisma.subscription.findFirst({
      where: { userId },
      orderBy: { startDate: "desc" },
    });

    if (!sub) {
      return { subscription: null, isActive: false, displayStatus: "NONE" };
    }

    sub = await applySubscriptionLapseSync(sub);
    const now = new Date();
    const isActive = sub.status === SubscriptionStatus.ACTIVE && sub.renewalDate >= now;

    return {
      subscription: sub,
      isActive,
      displayStatus: sub.status,
    };
  },
);

/** Subscriber-only server actions: redirects to /subscribe if not entitled. */
export async function requireSubscriptionOrRedirect(): Promise<User> {
  const user = await requireUser();
  const { isActive } = await getSubscriptionEntitlement(user.id);
  if (!isActive) {
    redirect("/subscribe");
  }
  return user;
}
