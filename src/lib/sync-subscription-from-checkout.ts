import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { SubscriptionPlan, SubscriptionStatus } from "@/generated/prisma/client";
import { recordPaymentAllocationTx } from "@/lib/record-payment-allocation";
import { getStripe } from "@/lib/stripe";

/**
 * Creates a subscription row from a completed Checkout Session (idempotent by stripeSessionId).
 * Used by the Stripe webhook and by the post-checkout redirect when webhooks are delayed or unavailable.
 */
export async function syncSubscriptionFromCheckoutSession(
  session: Stripe.Checkout.Session,
  options?: { paymentRef?: string },
): Promise<void> {
  if (session.payment_status !== "paid") return;

  const userId = session.client_reference_id;
  const plan =
    session.metadata?.plan === "YEARLY" ? SubscriptionPlan.YEARLY : SubscriptionPlan.MONTHLY;
  let amountCents = Number(session.metadata?.amountCents ?? 0);
  if (!amountCents && typeof session.amount_total === "number") {
    amountCents = session.amount_total;
  }
  if (!userId || !amountCents) return;

  const existing = await prisma.subscription.findFirst({
    where: { stripeSessionId: session.id },
  });
  if (existing) {
    if (existing.status !== SubscriptionStatus.ACTIVE) {
      await prisma.subscription.update({
        where: { id: existing.id },
        data: { status: SubscriptionStatus.ACTIVE },
      });
    }
    return;
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  const now = new Date();
  const renewalDate = new Date(now);
  renewalDate.setMonth(now.getMonth() + (plan === SubscriptionPlan.YEARLY ? 12 : 1));

  const paymentRef =
    options?.paymentRef ??
    (typeof session.payment_intent === "string" ? session.payment_intent : session.id);

  await prisma.$transaction(async (tx) => {
    const sub = await tx.subscription.create({
      data: {
        userId,
        plan,
        status: SubscriptionStatus.ACTIVE,
        amountCents,
        startDate: now,
        renewalDate,
        paymentRef,
        stripeSessionId: session.id,
        stripeSubId: typeof session.subscription === "string" ? session.subscription : null,
      },
    });

    await recordPaymentAllocationTx(tx, {
      userId,
      subscriptionId: sub.id,
      totalCents: amountCents,
      plan,
      stripePaymentRef: session.id,
      paidAt: now,
      selectedCharityId: user.selectedCharityId,
      charityPercent: user.charityPercent,
    });
  });
}

export async function syncSubscriptionFromCheckoutSessionId(
  sessionId: string,
  expectedUserId: string,
): Promise<void> {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.client_reference_id !== expectedUserId) return;
  await syncSubscriptionFromCheckoutSession(session);
}
