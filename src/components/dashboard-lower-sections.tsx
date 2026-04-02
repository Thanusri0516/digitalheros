"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  addScoreAction,
  deleteScoreAction,
  submitWinnerProofAction,
  updateProfileActionState,
  updateScoreAction,
} from "@/app/actions";
import { DashboardPaginationControls } from "@/components/dashboard-pagination-controls";
import { cn } from "@/lib/cn";
import { bentoCard, bentoCardTitle, bentoInset, glassInput, interactiveLiftSubtle } from "@/lib/glass-styles";
import { PROFILE_ACTION_INITIAL_STATE } from "@/lib/profile-action-state";

type ScoreRow = { id: string; playedAt: string; value: number };
type ClaimRow = {
  id: string;
  matchCount: number;
  amountCents: number;
  verificationStatus: string;
  payoutStatus: string;
  proofUrl: string | null;
  draw: { month: number; year: number };
};
type PublishedDrawRow = {
  month: number;
  year: number;
  winningNumbers: number[];
  yourMatchCount: number;
  publishedAt: string | null;
};

export type DashboardLowerSectionsProps = {
  subscriptionActive: boolean;
  scores: ScoreRow[];
  claims: ClaimRow[];
  claimAnalytics: {
    totalAmountCents: number;
    approvedAmountCents: number;
    paidAmountCents: number;
    approvedCount: number;
    paidCount: number;
    pendingVerificationCount: number;
  };
  publishedDraws: PublishedDrawRow[];
  fullName: string;
  email: string;
  pagination: {
    extraQuery: Record<string, string>;
    draws: { page: number; totalPages: number };
    claims: { page: number; totalPages: number };
    payments: { page: number };
  };
};

function subscribeCtaClassName() {
  return cn(
    "mt-4 inline-flex items-center justify-center rounded-lg border border-white/[0.14] bg-white/[0.08] px-8 py-3 text-sm font-medium text-zinc-100 transition-colors hover:border-white/[0.2] hover:bg-white/[0.12]",
    interactiveLiftSubtle,
  );
}

export function DashboardLowerSections(props: DashboardLowerSectionsProps) {
  const [profileState, profileFormAction] = useActionState(updateProfileActionState, PROFILE_ACTION_INITIAL_STATE);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const pageTokens = {
    dp: props.pagination.draws.page,
    cp: props.pagination.claims.page,
    pap: props.pagination.payments.page,
  };

  return (
    <>
      <section id="scores" className="scroll-mt-28">
        {!props.subscriptionActive && (
          <section className={cn(bentoCard, "text-center")}>
            <h2 className={bentoCardTitle}>Score entry (last 5)</h2>
            <p className="mt-3 text-sm text-brand-offwhite/60">
              Stableford scores are used for monthly draws. Subscribe to add and manage your last five rounds.
            </p>
            <Link href="/subscribe" className={subscribeCtaClassName()}>
              View plans &amp; subscribe
            </Link>
          </section>
        )}

        {props.subscriptionActive && (
          <section className={bentoCard}>
            <h2 className={bentoCardTitle}>Score entry (last 5)</h2>
            <p className="mt-2 text-sm leading-relaxed text-brand-offwhite/55">
              Stableford points (1–45) with the date each round was played. Up to five rounds are kept; adding a sixth
              removes the oldest by date. Shown newest first.
            </p>
            <p className="mt-2 text-xs text-brand-offwhite/45">Rounds recorded: {props.scores.length} / 5</p>
            <form action={addScoreAction} className="mt-6 grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <div>
                <label className="mb-2 block text-xs text-brand-offwhite/45">Stableford (1–45)</label>
                <input name="score" type="number" min={1} max={45} step={1} inputMode="numeric" required className={glassInput} />
              </div>
              <div>
                <label className="mb-2 block text-xs text-brand-offwhite/45">Played on</label>
                <input name="playedAt" type="date" required className={glassInput} />
              </div>
              <button
                type="submit"
                className={cn(
                  "rounded-lg border border-white/[0.12] bg-white/[0.06] px-6 py-3.5 text-sm font-medium text-zinc-100 transition-colors hover:border-white/[0.18] hover:bg-white/[0.1] sm:mb-0",
                  interactiveLiftSubtle,
                )}
              >
                Add score
              </button>
            </form>
            <ul className="mt-8 space-y-4 border-t border-white/[0.08] pt-6 text-sm text-brand-offwhite/75">
              {props.scores.map((s) => (
                <li key={s.id} className={cn(bentoInset, "p-5")}>
                  <form action={updateScoreAction} className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                    <input type="hidden" name="scoreId" value={s.id} />
                    <div>
                      <label className="mb-2 block text-xs text-brand-offwhite/45">Stableford (1–45)</label>
                      <input
                        name="score"
                        type="number"
                        min={1}
                        max={45}
                        step={1}
                        inputMode="numeric"
                        required
                        defaultValue={s.value}
                        className={glassInput}
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs text-brand-offwhite/45">Played on</label>
                      <input name="playedAt" type="date" required defaultValue={s.playedAt.slice(0, 10)} className={glassInput} />
                    </div>
                    <div className="flex flex-wrap gap-2 sm:justify-end">
                      <button
                        type="submit"
                        className={cn(
                          "rounded-lg border border-white/[0.1] bg-white/[0.05] px-4 py-2 text-xs font-medium text-zinc-200 hover:bg-white/[0.08]",
                          interactiveLiftSubtle,
                        )}
                      >
                        Save
                      </button>
                    </div>
                  </form>
                  <form action={deleteScoreAction} className="mt-3 flex justify-end">
                    <input type="hidden" name="scoreId" value={s.id} />
                    <button type="submit" className="text-xs font-medium text-rose-300/85 underline-offset-4 hover:text-rose-200 hover:underline">
                      Remove score
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          </section>
        )}
      </section>

      <section id="winnings" className="scroll-mt-28">
        <div className="grid gap-6">
          <section id="draws" className={cn(bentoCard, "scroll-mt-28")}>
            <h2 className={bentoCardTitle}>Published draw results</h2>
            <p className="mt-2 text-sm text-brand-offwhite/50">Winning numbers for each month.</p>
            <ul className="mt-6 space-y-4">
              {props.publishedDraws.map((d) => (
                <li key={`${d.year}-${d.month}`} className={cn(bentoInset, "p-5 text-sm text-brand-offwhite/90")}>
                  <p className="font-medium text-brand-offwhite">
                    {d.month}/{d.year}
                    {d.publishedAt ? (
                      <span className="ml-2 font-normal text-brand-offwhite/45">· Published {new Date(d.publishedAt).toLocaleDateString()}</span>
                    ) : null}
                  </p>
                  <p className="mt-3 text-lg font-semibold tabular-nums tracking-wide text-sky-200/95">{d.winningNumbers.join(" · ")}</p>
                  <p className="mt-2 text-brand-offwhite/55">Your match (last 5 scores): {d.yourMatchCount}/5</p>
                </li>
              ))}
            </ul>
            {!props.publishedDraws.length ? (
              <p className="mt-6 text-brand-offwhite/50">No draws published yet. Results appear here after admin publish.</p>
            ) : (
              <DashboardPaginationControls
                which="dp"
                page={props.pagination.draws.page}
                totalPages={props.pagination.draws.totalPages}
                tokens={pageTokens}
                extra={props.pagination.extraQuery}
              />
            )}
          </section>

          <section id="wins" className={cn(bentoCard, "scroll-mt-28")}>
            <h2 className={bentoCardTitle}>Winning amount analysis</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <p className="text-sm">Total won: INR {(props.claimAnalytics.totalAmountCents / 100).toFixed(0)}</p>
              <p className="text-sm">Approved: INR {(props.claimAnalytics.approvedAmountCents / 100).toFixed(0)}</p>
              <p className="text-sm">Paid out: INR {(props.claimAnalytics.paidAmountCents / 100).toFixed(0)}</p>
              <p className="text-sm">Pending verification: {props.claimAnalytics.pendingVerificationCount}</p>
            </div>
          </section>

          <section className={bentoCard}>
            <h2 className={bentoCardTitle}>Your prize claims</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {props.claims.map((claim) => (
                <div key={claim.id} className={cn(bentoInset, "p-5 text-sm text-brand-offwhite/90")}>
                  <p>
                    Draw {claim.draw.month}/{claim.draw.year} · Match {claim.matchCount} · INR {(claim.amountCents / 100).toFixed(0)}
                  </p>
                  <p className="mt-1 text-brand-offwhite/55">
                    Verification: {claim.verificationStatus} · Payout: {claim.payoutStatus}
                  </p>
                  {props.subscriptionActive ? (
                    <form action={submitWinnerProofAction} className="mt-4 flex flex-wrap gap-2">
                      <input type="hidden" name="claimId" value={claim.id} />
                      <input name="proofUrl" placeholder="Proof URL" className={cn(glassInput, "min-w-0 flex-1 py-2.5")} />
                      <button
                        type="submit"
                        className={cn(
                          "rounded-lg border border-white/[0.12] bg-white/[0.05] px-4 py-2 text-xs font-medium text-zinc-200 backdrop-blur-sm hover:bg-white/[0.09]",
                          interactiveLiftSubtle,
                        )}
                      >
                        Submit
                      </button>
                    </form>
                  ) : null}
                </div>
              ))}
            </div>
            <DashboardPaginationControls
              which="cp"
              page={props.pagination.claims.page}
              totalPages={props.pagination.claims.totalPages}
              tokens={pageTokens}
              extra={props.pagination.extraQuery}
            />
          </section>
        </div>
      </section>

      <section id="profile" className="scroll-mt-28">
        <section className={bentoCard}>
          <h2 className={bentoCardTitle}>Profile &amp; security</h2>
          <p className="mt-2 text-sm text-brand-offwhite/50">Update your display name and security settings.</p>
          <form action={profileFormAction} className="mt-8 space-y-5">
            <div>
              <label htmlFor="profile-email" className="mb-2 block text-xs text-brand-offwhite/45">Email (sign-in)</label>
              <input
                id="profile-email"
                readOnly
                defaultValue={props.email}
                className="w-full cursor-not-allowed rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3.5 text-sm text-brand-offwhite/45 backdrop-blur-sm"
              />
              <p className="mt-1 text-xs text-brand-offwhite/40">Sign-in email is locked. Contact support/admin to change it.</p>
            </div>
            <div>
              <label htmlFor="profile-name" className="mb-2 block text-xs text-brand-offwhite/45">Display name</label>
              <input id="profile-name" name="name" required defaultValue={props.fullName} className={glassInput} />
            </div>
            <div className="border-t border-white/[0.08] pt-6">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-offwhite/40">Change password (optional)</p>
              <p className="mb-4 text-xs text-brand-offwhite/45">Use at least 6 characters. Adding a number/symbol is recommended.</p>
              <div>
                <label htmlFor="current-pw" className="mb-2 block text-xs text-brand-offwhite/45">Current password</label>
                <div className="flex gap-2">
                  <input
                    id="current-pw"
                    name="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    autoComplete="current-password"
                    className={cn(glassInput, "flex-1")}
                  />
                  <button type="button" onClick={() => setShowCurrentPassword((v) => !v)} className="rounded-md border border-white/[0.12] px-3 text-xs text-zinc-200">
                    {showCurrentPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
              <div className="mt-4">
                <label htmlFor="new-pw" className="mb-2 block text-xs text-brand-offwhite/45">New password</label>
                <div className="flex gap-2">
                  <input
                    id="new-pw"
                    name="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    minLength={6}
                    autoComplete="new-password"
                    className={cn(glassInput, "flex-1")}
                  />
                  <button type="button" onClick={() => setShowNewPassword((v) => !v)} className="rounded-md border border-white/[0.12] px-3 text-xs text-zinc-200">
                    {showNewPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
              <div className="mt-4">
                <label htmlFor="confirm-pw" className="mb-2 block text-xs text-brand-offwhite/45">Confirm new password</label>
                <div className="flex gap-2">
                  <input
                    id="confirm-pw"
                    name="confirmNewPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    minLength={6}
                    autoComplete="new-password"
                    className={cn(glassInput, "flex-1")}
                  />
                  <button type="button" onClick={() => setShowConfirmPassword((v) => !v)} className="rounded-md border border-white/[0.12] px-3 text-xs text-zinc-200">
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
              <p className="mt-3 text-xs text-brand-offwhite/40">After changing password, re-login may be required on other devices.</p>
            </div>
            {profileState.error ? <p className="text-sm text-rose-300/90">{profileState.error}</p> : null}
            {profileState.success ? <p className="text-sm text-emerald-300/90">{profileState.success}</p> : null}
            <button type="submit" className="rounded-md border border-white/[0.12] px-4 py-2 text-sm text-zinc-100">Save profile</button>
          </form>
        </section>
      </section>
    </>
  );
}
