import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { SubscriptionStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { recordPaymentAllocation } from "@/lib/record-payment-allocation";
import { recordStandaloneDonationFromCheckout } from "@/lib/record-standalone-donation";
import { getStripe } from "@/lib/stripe";
import { syncSubscriptionFromCheckoutSession } from "@/lib/sync-subscription-from-checkout";

/**
 * Stripe Billing: renewals extend the period. First charge is allocated in checkout.session.completed;
 * recurring cycles get a new revenue split here (subscription_cycle).
 */
async function handleInvoicePaid(stripe: Stripe, invoice: Stripe.Invoice) {
  const inv = invoice as Stripe.Invoice & { subscription?: string | Stripe.Subscription | null };
  const raw = inv.subscription;
  const stripeSubId = typeof raw === "string" ? raw : raw?.id;
  if (!stripeSubId) return;

  const dbSub = await prisma.subscription.findFirst({
    where: { stripeSubId },
    include: { user: { select: { selectedCharityId: true, charityPercent: true } } },
  });
  if (!dbSub) return;

  const stripeSub = await stripe.subscriptions.retrieve(stripeSubId);
  const periodEnd =
    typeof stripeSub === "object" && stripeSub !== null && "current_period_end" in stripeSub
      ? (stripeSub as { current_period_end: number }).current_period_end
      : 0;
  const renewalDate = new Date(periodEnd * 1000);

  await prisma.subscription.update({
    where: { id: dbSub.id },
    data: {
      status: SubscriptionStatus.ACTIVE,
      renewalDate,
    },
  });

  // Avoid double-counting the first invoice (checkout already recorded allocation via session id).
  if (invoice.billing_reason !== "subscription_cycle") return;

  const amountCents = invoice.amount_paid ?? 0;
  if (!amountCents) return;

  const paidAt = new Date(
    (invoice.status_transitions?.paid_at ?? invoice.created) * 1000,
  );

  await recordPaymentAllocation({
    userId: dbSub.userId,
    subscriptionId: dbSub.id,
    totalCents: amountCents,
    plan: dbSub.plan,
    stripePaymentRef: `inv_${invoice.id}`,
    paidAt,
    selectedCharityId: dbSub.user.selectedCharityId,
    charityPercent: dbSub.user.charityPercent,
  });
}

async function handleSubscriptionDeleted(sub: Stripe.Subscription) {
  await prisma.subscription.updateMany({
    where: { stripeSubId: sub.id },
    data: {
      status: SubscriptionStatus.CANCELED,
      canceledAt: new Date(),
    },
  });
}

export async function POST(request: Request) {
  const stripe = getStripe();
  const signature = (await headers()).get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Webhook signature setup missing" }, { status: 400 });
  }

  const body = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.metadata?.checkoutKind === "donation") {
        await recordStandaloneDonationFromCheckout(session);
      } else {
        await syncSubscriptionFromCheckoutSession(session, { paymentRef: event.id });
      }
    } else if (event.type === "invoice.paid") {
      const invoice = event.data.object as Stripe.Invoice;
      await handleInvoicePaid(stripe, invoice);
    } else if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object as Stripe.Subscription;
      await handleSubscriptionDeleted(sub);
    }
  } catch (e) {
    console.error("[stripe webhook]", e);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
