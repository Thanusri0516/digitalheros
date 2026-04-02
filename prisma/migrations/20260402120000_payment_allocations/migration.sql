-- Payment revenue split + prize pool contributions per calendar month

CREATE TABLE "PaymentAllocation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "stripePaymentRef" TEXT NOT NULL,
    "totalCents" INTEGER NOT NULL,
    "prizePoolCents" INTEGER NOT NULL,
    "charityCents" INTEGER NOT NULL,
    "platformCents" INTEGER NOT NULL,
    "plan" "SubscriptionPlan" NOT NULL,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentAllocation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PaymentAllocation_stripePaymentRef_key" ON "PaymentAllocation"("stripePaymentRef");

CREATE TABLE "PrizePoolContribution" (
    "id" TEXT NOT NULL,
    "paymentAllocationId" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "poolMonth" INTEGER NOT NULL,
    "poolYear" INTEGER NOT NULL,

    CONSTRAINT "PrizePoolContribution_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PrizePoolContribution_poolMonth_poolYear_idx" ON "PrizePoolContribution"("poolMonth", "poolYear");

ALTER TABLE "PaymentAllocation" ADD CONSTRAINT "PaymentAllocation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PaymentAllocation" ADD CONSTRAINT "PaymentAllocation_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PrizePoolContribution" ADD CONSTRAINT "PrizePoolContribution_paymentAllocationId_fkey" FOREIGN KEY ("paymentAllocationId") REFERENCES "PaymentAllocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
