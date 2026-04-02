import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";

/** One-time charity donation via Stripe Checkout (`metadata.checkoutKind === "donation"`). Idempotent by session id. */
export async function recordStandaloneDonationFromCheckout(session: Stripe.Checkout.Session): Promise<void> {
  if (session.payment_status !== "paid") return;
  if (session.metadata?.checkoutKind !== "donation") return;

  const userId = session.client_reference_id;
  const charityId = session.metadata?.charityId;
  const amountCents = typeof session.amount_total === "number" ? session.amount_total : 0;
  const ref = session.id;

  if (!userId || !charityId || !amountCents) return;

  const existing = await prisma.charityDonation.findUnique({ where: { stripePaymentRef: ref } });
  if (existing) return;

  await prisma.charityDonation.create({
    data: {
      userId,
      charityId,
      amountCents,
      contributionType: "standalone",
      stripePaymentRef: ref,
    },
  });
}
