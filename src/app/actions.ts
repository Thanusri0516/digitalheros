"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { Role, SubscriptionPlan, SubscriptionStatus, DrawStatus, VerificationStatus, PayoutStatus } from "@/generated/prisma/client";
import {
  clearSessionCookie,
  hashPassword,
  requireAdmin,
  requireUser,
  setSessionCookie,
  verifyPassword,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rethrowUnlessDbConnection } from "@/lib/prisma-connection-error";
import { applySubscriptionLapseSync, requireSubscriptionOrRedirect } from "@/lib/subscription-access";
import { randomNumbers, weightedNumbers, weightedNumbersLeastFrequent } from "@/lib/draw";
import { analyzeDrawPublish, loadPublishContext } from "@/lib/draw-pools";
import { parseRequiredPlayedAt, parseStablefordScoreFromForm } from "@/lib/score-entry";
import { PRICING } from "@/lib/constants";
import { notifyDrawPublished, notifyWinnerVerificationApproved } from "@/lib/email";
import { clampCharityPercent } from "@/lib/revenue-split";
import { getStripe } from "@/lib/stripe";
import { AUTH_ACTION_INITIAL_STATE } from "@/lib/auth-action-state";
import type { AuthActionState } from "@/lib/auth-action-state";
import { PROFILE_ACTION_INITIAL_STATE } from "@/lib/profile-action-state";
import type { ProfileActionState } from "@/lib/profile-action-state";

function isNextRedirectError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const digest = (error as { digest?: unknown }).digest;
  return typeof digest === "string" && digest.startsWith("NEXT_REDIRECT");
}

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return "Something went wrong. Please try again.";
}

export async function signupAction(formData: FormData) {
  const name = String(formData.get("name") ?? "");
  const email = String(formData.get("email") ?? "").toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const accountType = String(formData.get("accountType") ?? "USER");
  if (!name || !email || password.length < 6) throw new Error("Invalid signup data");
  if (confirmPassword !== password) throw new Error("Passwords do not match");
  const passwordHash = await hashPassword(password);
  const isAdminSignup = accountType === "ADMIN";
  if (isAdminSignup) {
    const enteredAdminKey = String(formData.get("adminKey") ?? "");
    const expectedAdminKey = process.env.ADMIN_SIGNUP_KEY ?? "";
    if (!expectedAdminKey || enteredAdminKey !== expectedAdminKey) {
      throw new Error("Invalid admin signup key");
    }
  }
  const role = isAdminSignup ? Role.ADMIN : Role.USER;
  let user;
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new Error("Email already in use");
    user = await prisma.user.create({ data: { name, email, passwordHash, role } });
  } catch (e) {
    rethrowUnlessDbConnection(e);
  }
  await setSessionCookie({
    userId: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
  });
  redirect(user.role === Role.ADMIN ? "/admin" : "/subscribe");
}

export async function signupActionState(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  try {
    await signupAction(formData);
    return AUTH_ACTION_INITIAL_STATE;
  } catch (error) {
    if (isNextRedirectError(error)) throw error;
    return { error: errorMessage(error) };
  }
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").toLowerCase();
  const password = String(formData.get("password") ?? "");
  const loginType = String(formData.get("loginType") ?? "USER");
  let user;
  try {
    user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        passwordHash: true,
        subscriptions: { orderBy: { startDate: "desc" }, take: 1, select: { id: true, status: true, renewalDate: true } },
      },
    });
  } catch (e) {
    rethrowUnlessDbConnection(e);
  }
  if (!user || !(await verifyPassword(password, user.passwordHash))) throw new Error("Invalid credentials");
  /** "Admin" tab: reject non-admins who are trying to use the admin login path. */
  if (loginType === "ADMIN" && user.role !== Role.ADMIN) throw new Error("This account is not an admin account");
  /** Role always comes from the database; admins can sign in with either tab and are redirected to /admin. */
  await setSessionCookie({
    userId: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
  });
  if (user.role === Role.ADMIN) {
    redirect("/admin");
  }
  let isActive = false;
  try {
    const latest = user.subscriptions[0];
    if (latest) {
      const sub = await applySubscriptionLapseSync(latest);
      const now = new Date();
      isActive = sub.status === SubscriptionStatus.ACTIVE && sub.renewalDate >= now;
    }
  } catch (e) {
    rethrowUnlessDbConnection(e);
  }
  redirect(isActive ? "/dashboard" : "/subscribe");
}

export async function loginActionState(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  try {
    await loginAction(formData);
    return AUTH_ACTION_INITIAL_STATE;
  } catch (error) {
    if (isNextRedirectError(error)) throw error;
    return { error: errorMessage(error) };
  }
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/");
}

export async function subscribeAction(formData: FormData) {
  const user = await requireUser();
  const plan = String(formData.get("plan") ?? "MONTHLY") as SubscriptionPlan;
  const validPlan = plan === SubscriptionPlan.YEARLY ? SubscriptionPlan.YEARLY : SubscriptionPlan.MONTHLY;
  const amountCents = validPlan === SubscriptionPlan.YEARLY ? PRICING.yearlyCents : PRICING.monthlyCents;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) throw new Error("NEXT_PUBLIC_APP_URL is missing");

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${appUrl}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/subscribe?checkout=cancelled`,
    client_reference_id: user.id,
    metadata: {
      plan: validPlan,
      amountCents: String(amountCents),
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "inr",
          unit_amount: amountCents,
          product_data: {
            name: validPlan === SubscriptionPlan.YEARLY ? "Yearly Subscription" : "Monthly Subscription",
          },
        },
      },
    ],
  });
  if (!session.url) throw new Error("Stripe session URL not generated");
  redirect(session.url);
}

export async function updateProfileAction(formData: FormData) {
  const user = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Name required");
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmNewPassword") ?? "");
  let passwordHash = user.passwordHash;
  if (newPassword || currentPassword || confirmPassword) {
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      throw new Error("Enter current password and a new password (min 6 characters)");
    }
    if (newPassword !== confirmPassword) throw new Error("New passwords do not match");
    if (!(await verifyPassword(currentPassword, user.passwordHash))) throw new Error("Current password is incorrect");
    passwordHash = await hashPassword(newPassword);
  }
  await prisma.user.update({
    where: { id: user.id },
    data: { name, passwordHash },
  });
  await setSessionCookie({
    userId: user.id,
    role: user.role,
    name,
    email: user.email,
  });
  revalidatePath("/dashboard");
}

export async function updateProfileActionState(
  _prevState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  try {
    await updateProfileAction(formData);
    return { error: "", success: "Profile updated successfully." };
  } catch (error) {
    if (isNextRedirectError(error)) throw error;
    return { ...PROFILE_ACTION_INITIAL_STATE, error: errorMessage(error) };
  }
}

export async function updateScoreAction(formData: FormData) {
  const user = await requireSubscriptionOrRedirect();
  const scoreId = String(formData.get("scoreId") ?? "");
  const value = parseStablefordScoreFromForm(formData);
  const playedAt = parseRequiredPlayedAt(formData);
  const existing = await prisma.score.findFirst({ where: { id: scoreId, userId: user.id } });
  if (!existing) throw new Error("Score not found");
  await prisma.score.update({
    where: { id: scoreId },
    data: { value, playedAt },
  });
  revalidatePath("/dashboard");
}

export async function deleteScoreAction(formData: FormData) {
  const user = await requireSubscriptionOrRedirect();
  const scoreId = String(formData.get("scoreId") ?? "");
  const existing = await prisma.score.findFirst({ where: { id: scoreId, userId: user.id } });
  if (!existing) throw new Error("Score not found");
  await prisma.score.delete({ where: { id: scoreId } });
  revalidatePath("/dashboard");
}

export async function addScoreAction(formData: FormData) {
  const user = await requireSubscriptionOrRedirect();
  const value = parseStablefordScoreFromForm(formData);
  const playedAt = parseRequiredPlayedAt(formData);
  await prisma.$transaction(async (tx) => {
    await tx.score.create({ data: { userId: user.id, value, playedAt } });
    const scores = await tx.score.findMany({
      where: { userId: user.id },
      orderBy: [{ playedAt: "desc" }, { createdAt: "desc" }],
    });
    if (scores.length > 5) {
      const overflow = scores.slice(5);
      await tx.score.deleteMany({ where: { id: { in: overflow.map((s) => s.id) } } });
    }
  });
  revalidatePath("/dashboard");
}

export async function updateCharitySelectionAction(formData: FormData) {
  const user = await requireSubscriptionOrRedirect();
  const charityId = String(formData.get("charityId") ?? "");
  const rawPct = Number(formData.get("charityPercent"));
  const charityPercent = clampCharityPercent(
    Number.isFinite(rawPct) ? rawPct : user.charityPercent,
  );
  await prisma.user.update({
    where: { id: user.id },
    data: { selectedCharityId: charityId || null, charityPercent },
  });
  revalidatePath("/dashboard");
}

export async function createDonationCheckoutAction(formData: FormData) {
  const user = await requireUser();
  const charityId = String(formData.get("charityId") ?? "").trim();
  const amountInr = Number(formData.get("amountInr") ?? 500);
  if (!charityId) throw new Error("Choose a charity");
  const charity = await prisma.charity.findUnique({ where: { id: charityId } });
  if (!charity) throw new Error("Charity not found");
  const amountCents = Math.round(amountInr * 100);
  if (!Number.isFinite(amountCents) || amountCents < 10_000) {
    throw new Error("Minimum one-time donation is ₹100");
  }
  if (amountCents > 50_000_000) throw new Error("Amount exceeds maximum for this flow");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) throw new Error("NEXT_PUBLIC_APP_URL is missing");

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    client_reference_id: user.id,
    metadata: {
      checkoutKind: "donation",
      charityId,
    },
    success_url: `${appUrl}/charities/${charityId}?donation=success`,
    cancel_url: `${appUrl}/charities/${charityId}?donation=cancelled`,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "inr",
          unit_amount: amountCents,
          product_data: {
            name: `One-time donation — ${charity.name}`,
            description: "Independent contribution (not tied to prize draws)",
          },
        },
      },
    ],
  });
  if (!session.url) throw new Error("Stripe session URL not generated");
  redirect(session.url);
}

export async function runDrawSimulationAction(formData: FormData) {
  await requireAdmin();
  const mode = String(formData.get("mode") ?? "random");
  const month = Number(formData.get("month"));
  const year = Number(formData.get("year"));
  const allScores = await prisma.score.findMany();
  const numbers =
    mode === "algorithmic"
      ? weightedNumbers(allScores, 5)
      : mode === "algorithmic_least"
        ? weightedNumbersLeastFrequent(allScores, 5)
        : randomNumbers(5);
  const payload = numbers.join(",");
  await prisma.draw.upsert({
    where: { month_year: { month, year } },
    create: { month, year, winningNumbers: payload, logicMode: mode, status: DrawStatus.DRAFT },
    update: { winningNumbers: payload, logicMode: mode, status: DrawStatus.DRAFT },
  });
  revalidatePath("/admin");
}

export async function publishDrawAction(formData: FormData) {
  await requireAdmin();
  const drawId = String(formData.get("drawId") ?? "");
  const draw = await prisma.draw.findUnique({ where: { id: drawId } });
  if (!draw) throw new Error("Draw not found");
  if (draw.status !== DrawStatus.DRAFT) throw new Error("Draw is already published");

  const { activeSubscriptions, usersWithScores, rolloverInCents, totalPoolCents } = await loadPublishContext(
    draw.month,
    draw.year,
  );
  const preview = analyzeDrawPublish(draw, activeSubscriptions, usersWithScores, rolloverInCents, totalPoolCents);
  const { payouts, fiveMatchPoolCents, fourMatchPoolCents, threeMatchPoolCents, rolloverOutCents } = preview;

  await prisma.$transaction(async (tx) => {
    await tx.draw.update({
      where: { id: draw.id },
      data: { status: DrawStatus.PUBLISHED, publishedAt: new Date() },
    });
    if (payouts.length) {
      await tx.winnerClaim.createMany({
        data: payouts.map((p) => ({
          userId: p.userId,
          drawId: draw.id,
          matchCount: p.matchCount,
          amountCents: p.amountCents,
        })),
      });
    }
    await tx.prizePoolLedger.create({
      data: {
        month: draw.month,
        year: draw.year,
        activeSubscribers: activeSubscriptions.length,
        totalPoolCents,
        fiveMatchPoolCents,
        fourMatchPoolCents,
        threeMatchPoolCents,
        rolloverCents: rolloverOutCents,
      },
    });
  });

  revalidatePath("/admin");
  revalidatePath("/dashboard");

  void notifyDrawPublished(draw.month, draw.year, preview.winningNumbers).catch((err) =>
    console.error("[notifyDrawPublished]", err),
  );
}

export async function submitWinnerProofAction(formData: FormData) {
  const user = await requireSubscriptionOrRedirect();
  const claimId = String(formData.get("claimId") ?? "");
  const proofUrl = String(formData.get("proofUrl") ?? "");
  const claim = await prisma.winnerClaim.findFirst({ where: { id: claimId, userId: user.id } });
  if (!claim) throw new Error("Claim not found");
  await prisma.winnerClaim.update({ where: { id: claimId }, data: { proofUrl, verificationStatus: VerificationStatus.PENDING } });
  revalidatePath("/dashboard");
}

export async function verifyWinnerAction(formData: FormData) {
  await requireAdmin();
  const claimId = String(formData.get("claimId") ?? "");
  const approved = String(formData.get("approved") ?? "false") === "true";
  const before = await prisma.winnerClaim.findUnique({
    where: { id: claimId },
    include: { user: { select: { email: true } }, draw: { select: { month: true, year: true } } },
  });
  await prisma.winnerClaim.update({
    where: { id: claimId },
    data: {
      verificationStatus: approved ? VerificationStatus.APPROVED : VerificationStatus.REJECTED,
      /** Payout is recorded separately after verification (admin marks paid). */
      payoutStatus: PayoutStatus.PENDING,
    },
  });
  revalidatePath("/admin");
  revalidatePath("/dashboard");

  if (approved && before?.user?.email && before.draw) {
    const amountInr = `INR ${(before.amountCents / 100).toFixed(0)}`;
    void notifyWinnerVerificationApproved(
      before.user.email,
      before.draw.month,
      before.draw.year,
      amountInr,
    ).catch((err) => console.error("[notifyWinnerVerificationApproved]", err));
  }
}

export async function markWinnerPayoutPaidAction(formData: FormData) {
  await requireAdmin();
  const claimId = String(formData.get("claimId") ?? "");
  const claim = await prisma.winnerClaim.findUnique({ where: { id: claimId } });
  if (!claim || claim.verificationStatus !== VerificationStatus.APPROVED) {
    throw new Error("Only approved claims can be marked paid");
  }
  await prisma.winnerClaim.update({
    where: { id: claimId },
    data: { payoutStatus: PayoutStatus.PAID },
  });
  revalidatePath("/admin");
  revalidatePath("/dashboard");
}

export async function adminUpdateSubscriptionAction(formData: FormData) {
  await requireAdmin();
  const subscriptionId = String(formData.get("subscriptionId") ?? "");
  const status = String(formData.get("status") ?? "") as SubscriptionStatus;
  if (!Object.values(SubscriptionStatus).includes(status)) throw new Error("Invalid status");
  await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      status,
      ...(status === SubscriptionStatus.CANCELED ? { canceledAt: new Date() } : {}),
    },
  });
  revalidatePath("/admin");
  revalidatePath("/dashboard");
}

export async function createCharityAction(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const events = String(formData.get("events") ?? "").trim();
  const featured = String(formData.get("featured") ?? "") === "on";
  if (!name || !description) throw new Error("Name and description required");
  await prisma.charity.create({
    data: { name, description, events: events || undefined, featured },
  });
  revalidatePath("/admin");
  revalidatePath("/charities");
  revalidatePath("/dashboard");
  revalidatePath("/");
}

export async function updateCharityAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const events = String(formData.get("events") ?? "").trim();
  const featured = String(formData.get("featured") ?? "") === "on";
  if (!id || !name || !description) throw new Error("Invalid charity data");
  await prisma.charity.update({
    where: { id },
    data: { name, description, events: events || null, featured },
  });
  revalidateTag("charities", "max");
  revalidatePath("/admin");
  revalidatePath("/charities");
  revalidatePath(`/charities/${id}`);
  revalidatePath("/dashboard");
  revalidatePath("/");
}

export async function deleteCharityAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await prisma.user.updateMany({ where: { selectedCharityId: id }, data: { selectedCharityId: null } });
  await prisma.charity.delete({ where: { id } });
  revalidateTag("charities", "max");
  revalidatePath("/admin");
  revalidatePath("/charities");
  revalidatePath(`/charities/${id}`);
  revalidatePath("/dashboard");
  revalidatePath("/");
}
