-- AlterTable
ALTER TABLE "CharityDonation" ADD COLUMN IF NOT EXISTS "stripePaymentRef" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "CharityDonation_stripePaymentRef_key" ON "CharityDonation"("stripePaymentRef");
