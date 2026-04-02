import { prisma } from "@/lib/prisma";
import { Role } from "@/generated/prisma/client";
import { SubscriptionStatus } from "@/generated/prisma/client";

async function sendAppEmail(to: string, subject: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "Digital Heroes <onboarding@resend.dev>";
  if (!key) {
    console.log("[email skipped — set RESEND_API_KEY]", { to, subject });
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [to], subject, html }),
  });
  if (!res.ok) {
    console.error("[email send failed]", await res.text());
  }
}

/** Notify active subscribers when a draw is published (PRD: draw results email). */
export async function notifyDrawPublished(month: number, year: number, winningNumbers: number[]) {
  const nums = winningNumbers.join(", ");
  const subject = `Draw results — ${month}/${year}`;
  const html = `
    <p>A new monthly draw has been published.</p>
    <p><strong>Period:</strong> ${month}/${year}</p>
    <p><strong>Winning numbers:</strong> ${nums}</p>
    <p>Log in to your dashboard to see if you have a match and to submit winner proof if applicable.</p>
  `;
  const now = new Date();
  const users = await prisma.user.findMany({
    where: {
      role: Role.USER,
      subscriptions: {
        some: { status: SubscriptionStatus.ACTIVE, renewalDate: { gte: now } },
      },
    },
    select: { email: true },
  });
  const seen = new Set<string>();
  for (const u of users) {
    if (seen.has(u.email)) continue;
    seen.add(u.email);
    await sendAppEmail(u.email, subject, html);
  }
}

/** Notify a winner when verification is approved (PRD: winner alerts). */
export async function notifyWinnerVerificationApproved(email: string, month: number, year: number, amountInr: string) {
  const subject = `Winner verification approved — ${month}/${year}`;
  const html = `
    <p>Your prize claim for the <strong>${month}/${year}</strong> draw has been <strong>approved</strong>.</p>
    <p>Indicative prize (before payout): <strong>${amountInr}</strong></p>
    <p>Our team will process payout according to platform rules. Check your dashboard for status.</p>
  `;
  await sendAppEmail(email, subject, html);
}
