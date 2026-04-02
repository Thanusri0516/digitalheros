import { redirect } from "next/navigation";
import { PageGlassBackdrop } from "@/components/page-glass-backdrop";
import {
  adminUpdateSubscriptionAction,
  createCharityAction,
  deleteCharityAction,
  markWinnerPayoutPaidAction,
  publishDrawAction,
  runDrawSimulationAction,
  updateCharityAction,
  verifyWinnerAction,
} from "@/app/actions";
import { getSession } from "@/lib/auth";
import { StickyJumpNav, type StickyJumpItem } from "@/components/sticky-jump-nav";
import {
  bentoInset,
  bentoLabel,
  bentoSection,
  bentoValue,
  eyebrow,
  glassInputCompact,
  glassStatCard,
  sectionSubtitle,
  sectionTitle,
} from "@/lib/glass-styles";
import { cn } from "@/lib/cn";
import { getCharityDonationReport, getCharityPayoutDiagnostics } from "@/lib/charity-donation-report";
import { PaginationBar } from "@/components/pagination-bar";
import { aggregatePaymentAllocationsTotals } from "@/lib/payment-allocation-queries";
import { loadAdminPaginatedData } from "@/lib/admin-load";
import { REVENUE_SPLIT } from "@/lib/constants";
import { PAGE_SIZE, clampPage, parsePositiveInt, totalPages } from "@/lib/pagination";
import { DrawStatus, PayoutStatus, SubscriptionStatus, VerificationStatus } from "@/generated/prisma/client";
import { analyzeDrawPublish, loadPublishContext } from "@/lib/draw-pools";

type AdminSearch = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminPage({ searchParams }: { searchParams?: AdminSearch }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "ADMIN") redirect("/dashboard");

  const sp = searchParams ? await searchParams : {};

  const {
    users,
    usersPage,
    usersTotalPages,
    userCount,
    activeSubCount,
    charities,
    charitiesPage,
    charitiesTotalPages,
    charityCount,
    draws,
    drawsPage,
    drawsTotalPages,
    publishedDrawCount,
    draftDrawCount,
    claims,
    claimsPage,
    claimsTotalPages,
    claimCount,
    ledgers,
    ledgerPage,
    ledgersTotalPages,
    ledgerCount,
    ledgerTotalPoolCents,
  } = await loadAdminPaginatedData({
    usersPage: parsePositiveInt(sp.up),
    charitiesPage: parsePositiveInt(sp.chp),
    drawsPage: parsePositiveInt(sp.dp),
    claimsPage: parsePositiveInt(sp.clp),
    ledgerPage: parsePositiveInt(sp.lp),
  });

  const revenueAgg = await aggregatePaymentAllocationsTotals();
  const charityDonationReport = await getCharityDonationReport();
  const charityDiag = await getCharityPayoutDiagnostics();

  const lrp = clampPage(parsePositiveInt(sp.lrp), totalPages(charityDonationReport.lifetime.length, PAGE_SIZE));
  const mdp = clampPage(parsePositiveInt(sp.mdp), totalPages(charityDonationReport.monthly.length, PAGE_SIZE));
  const lifetimePageRows = charityDonationReport.lifetime.slice((lrp - 1) * PAGE_SIZE, lrp * PAGE_SIZE);
  const monthlyPageRows = charityDonationReport.monthly.slice((mdp - 1) * PAGE_SIZE, mdp * PAGE_SIZE);

  const now = new Date();
  const subStatusValues = Object.values(SubscriptionStatus);

  const draftDraws = draws.filter((d) => d.status === DrawStatus.DRAFT);
  const draftPreviews = await Promise.all(
    draftDraws.map(async (d) => {
      const ctx = await loadPublishContext(d.month, d.year);
      const preview = analyzeDrawPublish(d, ctx.activeSubscriptions, ctx.usersWithScores, ctx.rolloverInCents, ctx.totalPoolCents);
      return [d.id, preview] as const;
    }),
  );
  const previewByDrawId = Object.fromEntries(draftPreviews);

  const rev = revenueAgg._sum;
  const payTotal = rev.totalCents ?? 0;
  const payPrize = rev.prizePoolCents ?? 0;
  const payCharity = rev.charityCents ?? 0;
  const payPlatform = rev.platformCents ?? 0;

  const adminJump: StickyJumpItem[] = [
    { href: "/admin#admin-reports", label: "Reports" },
    { href: "/admin#admin-charity-payouts", label: "Charity payouts" },
    { href: "/admin#admin-users", label: "Users" },
    { href: "/admin#admin-charities", label: "Charities" },
    { href: "/admin#admin-draws", label: "Draws" },
    { href: "/admin#admin-verification", label: "Verification" },
  ];

  return (
    <main className="relative mx-auto w-full max-w-7xl flex-1 px-5 py-8 md:px-8 md:py-10">
      <PageGlassBackdrop />
      <div className="relative z-[1]">
      <StickyJumpNav ariaLabel="Admin sections" items={adminJump} />

      <div className={cn(bentoSection, "mb-8")}>
        <p className={eyebrow}>Control</p>
        <h1 className="font-heading mt-3 text-3xl font-medium tracking-[-0.03em] text-zinc-50 md:text-[2.25rem]">
          Admin
        </h1>
        <p className={sectionSubtitle}>Users, subscriptions, charities, draws, verification &amp; payouts — use the bar above to jump without leaving the page.</p>
      </div>

      <div id="admin-reports" className="scroll-mt-[7.5rem] mb-8 space-y-8">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card label="Total users" value={String(userCount)} />
        <Card label="Active subs" value={String(activeSubCount)} />
        <Card label="Charities" value={String(charityCount)} />
        <Card
          label="Reported pool total (published draws)"
          value={`INR ${(ledgerTotalPoolCents / 100).toFixed(0)}`}
        />
      </section>

      <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card label="Stripe payments (gross)" value={`INR ${(payTotal / 100).toFixed(0)}`} />
        <Card label="→ Prize pool (allocated)" value={`INR ${(payPrize / 100).toFixed(0)}`} />
        <Card label="→ Charity (recorded)" value={`INR ${(payCharity / 100).toFixed(0)}`} />
        <Card label="→ Platform (recorded)" value={`INR ${(payPlatform / 100).toFixed(0)}`} />
      </section>
      <p className="mb-8 text-xs text-brand-offwhite/45">
        Split rule: {REVENUE_SPLIT.prizePoolPercent}% prize pool (fixed); charity share is user-configurable (typically
        10–40% when a charity is selected) / remainder platform. Monthly draws use the sum of prize slices attributed to
        that calendar month.
      </p>

      <section className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card label="Published draws" value={String(publishedDrawCount)} />
        <Card label="Draft draws" value={String(draftDrawCount)} />
        <Card label="Winner claims (all time)" value={String(claimCount)} />
      </section>

      <section id="admin-charity-payouts" className={cn(bentoSection, "mb-8 scroll-mt-[7.5rem]")}>
        <h2 className={sectionTitle}>Charity payouts (manual)</h2>
        <p className={cn(sectionSubtitle, "mt-1")}>
          Totals recorded when subscribers pay (charity slice of each payment). Stripe pays you; use these numbers to
          transfer to each charity by bank/UPI outside the app, then keep your own records.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-brand-offwhite/55">
          <strong className="font-medium text-brand-offwhite/75">Why you can have a subscriber but empty tables:</strong>{" "}
          these tables come from <strong className="text-brand-offwhite/80">CharityDonation</strong> rows. We only create
          those when a <strong className="text-brand-offwhite/80">paid checkout</strong> runs <em>and</em> that user had
          already <strong className="text-brand-offwhite/80">selected a charity</strong> on the dashboard. If they paid
          before choosing a charity, the charity share is counted as platform in the split — so no per-charity line
          here. Subscriptions created before the payment-split feature may have no payment records at all.
        </p>
        <div
          className={cn(
            bentoInset,
            "mt-4 grid gap-2 text-xs text-brand-offwhite/60 sm:grid-cols-3 sm:gap-4",
          )}
        >
          <p>
            <span className="text-brand-offwhite/40">Payment split rows</span>
            <span className="mt-1 block font-mono text-sm tabular-nums text-brand-offwhite/85">
              {charityDiag.paymentAllocationCount}
            </span>
          </p>
          <p>
            <span className="text-brand-offwhite/40">Charity donation rows</span>
            <span className="mt-1 block font-mono text-sm tabular-nums text-brand-offwhite/85">
              {charityDiag.charityDonationRowCount}
            </span>
          </p>
          <p>
            <span className="text-brand-offwhite/40">INR in “charity” column of splits</span>
            <span className="mt-1 block font-mono text-sm tabular-nums text-brand-offwhite/85">
              {(charityDiag.sumCharityCentsFromPayments / 100).toFixed(0)}
            </span>
          </p>
        </div>
        {charityDiag.paymentAllocationCount === 0 ? (
          <p className="mt-3 text-sm text-amber-200/85">
            No payment split rows yet — either no successful Stripe checkout since this feature shipped, or only test data
            without going through checkout.
          </p>
        ) : charityDiag.charityDonationRowCount === 0 && charityDiag.sumCharityCentsFromPayments === 0 ? (
          <p className="mt-3 text-sm text-amber-200/85">
            Payments exist, but the charity share went to <strong className="font-medium">platform</strong> because no
            charity was selected at payment time. Ask the user to pick a charity on the dashboard, then their{" "}
            <strong className="font-medium">next</strong> renewal or new payment will create donation rows.
          </p>
        ) : null}

        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold text-brand-offwhite/90">All-time by charity</h3>
            <div className="mt-3 overflow-x-auto text-sm">
              <table className="w-full min-w-[280px] text-left text-brand-offwhite/80">
                <thead className="border-b border-white/[0.08] text-xs uppercase tracking-wider text-brand-offwhite/45">
                  <tr>
                    <th className="pb-2 pr-4">Charity</th>
                    <th className="pb-2">Total (INR)</th>
                  </tr>
                </thead>
                <tbody>
                  {lifetimePageRows.map((row) => (
                    <tr key={row.charityId} className="border-b border-white/[0.04]">
                      <td className="py-2 pr-4">{row.charityName}</td>
                      <td className="py-2 tabular-nums">{(row.totalCents / 100).toFixed(0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!charityDonationReport.lifetime.length ? (
                <p className="mt-3 text-sm text-brand-offwhite/45">No charity donations recorded yet.</p>
              ) : null}
              <PaginationBar
                pathname="/admin"
                searchParams={sp}
                paramName="lrp"
                page={lrp}
                totalPages={totalPages(charityDonationReport.lifetime.length, PAGE_SIZE)}
                hash="#admin-charity-payouts"
              />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-brand-offwhite/90">By calendar month</h3>
            <div className="mt-3 overflow-x-auto text-sm">
              <table className="w-full min-w-[280px] text-left text-brand-offwhite/80">
                <thead className="border-b border-white/[0.08] text-xs uppercase tracking-wider text-brand-offwhite/45">
                  <tr>
                    <th className="pb-2 pr-4">Month</th>
                    <th className="pb-2 pr-4">Charity</th>
                    <th className="pb-2">INR</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyPageRows.map((row) => (
                    <tr key={`${row.year}-${row.month}-${row.charityId}`} className="border-b border-white/[0.04]">
                      <td className="py-2 pr-4 tabular-nums">
                        {row.month}/{row.year}
                      </td>
                      <td className="py-2 pr-4">{row.charityName}</td>
                      <td className="py-2 tabular-nums">{(row.totalCents / 100).toFixed(0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!charityDonationReport.monthly.length ? (
                <p className="mt-3 text-sm text-brand-offwhite/45">No rows yet.</p>
              ) : null}
              <PaginationBar
                pathname="/admin"
                searchParams={sp}
                paramName="mdp"
                page={mdp}
                totalPages={totalPages(charityDonationReport.monthly.length, PAGE_SIZE)}
                hash="#admin-charity-payouts"
              />
            </div>
          </div>
        </div>
      </section>

      <section className={cn(bentoSection, "mb-8")}>
        <h2 className={sectionTitle}>Reports · prize pool history</h2>
        <p className={cn(sectionSubtitle, "mt-1")}>Recent monthly ledgers from published draws</p>
        <div className="mt-4 overflow-x-auto text-sm">
          <table className="w-full min-w-[640px] text-left text-brand-offwhite/80">
            <thead className="border-b border-white/[0.08] text-xs uppercase tracking-wider text-brand-offwhite/45">
              <tr>
                <th className="pb-2 pr-4">Period</th>
                <th className="pb-2 pr-4">Active subs</th>
                <th className="pb-2 pr-4">Total pool</th>
                <th className="pb-2 pr-4">5-match</th>
                <th className="pb-2 pr-4">4-match</th>
                <th className="pb-2">3-match</th>
              </tr>
            </thead>
            <tbody>
              {ledgers.map((l) => (
                <tr key={l.id} className="border-b border-white/[0.04]">
                  <td className="py-2 pr-4">
                    {l.month}/{l.year}
                  </td>
                  <td className="py-2 pr-4">{l.activeSubscribers}</td>
                  <td className="py-2 pr-4">{(l.totalPoolCents / 100).toFixed(0)}</td>
                  <td className="py-2 pr-4">{(l.fiveMatchPoolCents / 100).toFixed(0)}</td>
                  <td className="py-2 pr-4">{(l.fourMatchPoolCents / 100).toFixed(0)}</td>
                  <td className="py-2">{(l.threeMatchPoolCents / 100).toFixed(0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!ledgers.length ? <p className="mt-4 text-brand-offwhite/45">No ledgers yet.</p> : null}
        </div>
        <PaginationBar
          pathname="/admin"
          searchParams={sp}
          paramName="lp"
          page={ledgerPage}
          totalPages={ledgersTotalPages}
          hash="#admin-reports"
        />
      </section>
      </div>

      <section id="admin-users" className={cn("scroll-mt-[7.5rem]", bentoSection, "mb-8")}>
        <h2 className={sectionTitle}>Users &amp; subscriptions</h2>
        <p className={cn(sectionSubtitle, "mt-1")}>Adjust subscription status (e.g. lapsed or canceled)</p>
        <div className="mt-6 space-y-4 text-sm">
          {users.map((u) => {
            const latest = u.subscriptions[0];
            return (
              <div
                key={u.id}
                className={cn(bentoInset, "p-4 md:grid md:grid-cols-[1fr_auto] md:items-center md:gap-4")}
              >
                <div>
                  <p className="font-medium text-brand-offwhite">
                    {u.name} · {u.email}
                  </p>
                  <p className="mt-1 text-brand-offwhite/45">
                    Role: {u.role}
                    {latest ? (
                      <>
                        {" "}
                        · Latest plan: {latest.plan} · {latest.status}
                      </>
                    ) : (
                      " · No subscription record"
                    )}
                  </p>
                </div>
                {latest ? (
                  <form action={adminUpdateSubscriptionAction} className="mt-3 flex flex-wrap items-center gap-2 md:mt-0 md:justify-end">
                    <input type="hidden" name="subscriptionId" value={latest.id} />
                    <select
                      name="status"
                      defaultValue={latest.status}
                      className={cn(glassInputCompact, "text-xs")}
                    >
                      {subStatusValues.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="rounded-full border border-sky-400/30 bg-sky-500/10 px-4 py-2 text-xs font-medium text-brand-offwhite backdrop-blur-sm transition hover:border-sky-400/45 hover:bg-sky-500/18"
                    >
                      Update
                    </button>
                  </form>
                ) : null}
              </div>
            );
          })}
        </div>
        <PaginationBar
          pathname="/admin"
          searchParams={sp}
          paramName="up"
          page={usersPage}
          totalPages={usersTotalPages}
          hash="#admin-users"
        />
      </section>

      <section id="admin-charities" className={cn("scroll-mt-[7.5rem]", bentoSection, "mb-8")}>
        <h2 className={sectionTitle}>Charity listings</h2>
        <p className={cn(sectionSubtitle, "mt-1")}>Create and edit organizations subscribers can choose</p>

        <form action={createCharityAction} className="mt-6 grid gap-3 border-b border-white/[0.06] pb-8 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs text-brand-offwhite/45">New charity · Name</label>
            <input
              name="name"
              required
              className={glassInputCompact}
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs text-brand-offwhite/45">Description</label>
            <textarea
              name="description"
              required
              rows={3}
              className={cn(glassInputCompact, "min-h-[5rem]")}
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs text-brand-offwhite/45">Events / notes (optional)</label>
            <input name="events" className={glassInputCompact} />
          </div>
          <label className="flex items-center gap-2 text-sm text-brand-offwhite/70">
            <input type="checkbox" name="featured" className="rounded border-white/20" />
            Featured
          </label>
          <div className="md:text-right">
            <button
              type="submit"
              className="rounded-full border border-violet-400/35 bg-violet-500/15 px-6 py-2.5 text-sm font-semibold text-brand-offwhite backdrop-blur-sm transition hover:border-violet-400/50 hover:bg-violet-500/25"
            >
              Add charity
            </button>
          </div>
        </form>

        <div className="mt-8 space-y-8">
          {charities.map((c) => (
            <form
              key={c.id}
              action={updateCharityAction}
              className={cn(bentoInset, "grid gap-3 p-4 md:grid-cols-2")}
            >
              <input type="hidden" name="id" value={c.id} />
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs text-brand-offwhite/45">Name</label>
                <input name="name" required defaultValue={c.name} className={glassInputCompact} />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs text-brand-offwhite/45">Description</label>
                <textarea
                  name="description"
                  required
                  rows={3}
                  defaultValue={c.description}
                  className={cn(glassInputCompact, "min-h-[5rem]")}
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs text-brand-offwhite/45">Events / notes</label>
                <input name="events" defaultValue={c.events ?? ""} className={glassInputCompact} />
              </div>
              <label className="flex items-center gap-2 text-sm text-brand-offwhite/70">
                <input type="checkbox" name="featured" defaultChecked={c.featured} className="rounded border-white/20" />
                Featured
              </label>
              <div className="flex flex-wrap items-center justify-end gap-2 md:col-span-2">
                <button
                  type="submit"
                  className="rounded-full border border-sky-400/30 bg-sky-500/10 px-5 py-2 text-xs font-semibold text-brand-offwhite backdrop-blur-sm transition hover:border-sky-400/45 hover:bg-sky-500/18"
                >
                  Save changes
                </button>
              </div>
            </form>
          ))}
        </div>
        <PaginationBar
          pathname="/admin"
          searchParams={sp}
          paramName="chp"
          page={charitiesPage}
          totalPages={charitiesTotalPages}
          hash="#admin-charities"
        />

        <div className="mt-8 space-y-2 border-t border-white/[0.06] pt-6">
          <p className="text-xs font-medium uppercase tracking-wider text-brand-offwhite/45">Remove charity</p>
          {charities.map((c) => (
            <form key={`del-${c.id}`} action={deleteCharityAction} className={cn(bentoInset, "flex flex-wrap items-center justify-between gap-2 px-4 py-2.5")}>
              <span className="text-sm text-brand-offwhite/80">{c.name}</span>
              <input type="hidden" name="id" value={c.id} />
              <button
                type="submit"
                className="text-xs font-medium text-rose-300 hover:text-rose-200"
                title="Clears subscriber selections for this charity"
              >
                Delete
              </button>
            </form>
          ))}
        </div>
      </section>

      <section id="admin-draws" className={cn("scroll-mt-[7.5rem]", bentoSection, "mb-8")}>
        <h2 className={sectionTitle}>Draw management</h2>
        <p className={cn(sectionSubtitle, "mt-1")}>
          One draw per calendar month. Prizes split across <strong className="text-brand-offwhite/90">5-number</strong>,{" "}
          <strong className="text-brand-offwhite/90">4-number</strong>, and <strong className="text-brand-offwhite/90">3-number</strong>{" "}
          match tiers. Run a simulation (draft) to preview numbers, review the analysis below, then publish when ready.
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-brand-offwhite/55">
          <li>
            <span className="text-brand-offwhite/75">Random</span> — five distinct winning numbers 1–45 (lottery-style).
          </li>
          <li>
            <span className="text-brand-offwhite/75">Algorithmic (most frequent)</span> — weighted toward commonly entered scores.
          </li>
          <li>
            <span className="text-brand-offwhite/75">Algorithmic (least frequent)</span> — weighted toward rare scores.
          </li>
          <li>
            If no 5-match winner, the entire 5-match tier (including any carry-in) rolls to the next month&apos;s 5-match pool.
          </li>
        </ul>
        <form action={runDrawSimulationAction} className="mt-6 grid gap-3 md:grid-cols-4">
          <input
            name="month"
            type="number"
            min={1}
            max={12}
            defaultValue={now.getMonth() + 1}
            className={cn(glassInputCompact, "rounded-2xl py-3")}
          />
          <input
            name="year"
            type="number"
            defaultValue={now.getFullYear()}
            className={cn(glassInputCompact, "rounded-2xl py-3")}
          />
          <select name="mode" className={cn(glassInputCompact, "rounded-2xl py-3 md:col-span-1")}>
            <option value="random">Random</option>
            <option value="algorithmic">Algorithmic — most frequent</option>
            <option value="algorithmic_least">Algorithmic — least frequent</option>
          </select>
          <button
            type="submit"
            className="rounded-full border border-violet-400/35 bg-violet-500/15 px-4 py-3 text-sm font-semibold text-brand-offwhite backdrop-blur-sm transition hover:border-violet-400/50 hover:bg-violet-500/25"
          >
            Run simulation
          </button>
        </form>
        <div className="mt-6 space-y-3 text-sm">
          {draws.map((draw) => {
            const preview = previewByDrawId[draw.id];
            return (
              <div key={draw.id} className={cn(bentoInset, "px-4 py-3 text-brand-offwhite/85")}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p>
                    <span className="font-medium text-brand-offwhite">{draw.month}/{draw.year}</span> · {draw.logicMode} · [
                    {draw.winningNumbers}] · {draw.status}
                  </p>
                  {draw.status === DrawStatus.DRAFT ? (
                    <form action={publishDrawAction}>
                      <input type="hidden" name="drawId" value={draw.id} />
                      <button
                        type="submit"
                        className="rounded-full border border-sky-400/30 bg-sky-500/10 px-4 py-1.5 text-xs font-medium text-brand-offwhite backdrop-blur-sm transition hover:border-sky-400/45 hover:bg-sky-500/18"
                      >
                        Publish results
                      </button>
                    </form>
                  ) : null}
                </div>
                {draw.status === DrawStatus.DRAFT && preview ? (
                  <div className="mt-3 border-t border-white/[0.06] pt-3 text-xs leading-relaxed text-brand-offwhite/55">
                    <p className="font-medium text-brand-offwhite/70">Pre-publish analysis (current subscribers &amp; scores)</p>
                    <p className="mt-1">
                      Active subscribers: {preview.activeSubscriberCount} · Rollover into 5-match pool: INR{" "}
                      {(preview.rolloverInCents / 100).toFixed(0)} · Total pool (sum of prize slices for {draw.month}/
                      {draw.year}): INR {(preview.totalPoolCents / 100).toFixed(0)}
                    </p>
                    {preview.totalPoolCents === 0 ? (
                      <p className="mt-1 text-amber-200/85">
                        No prize contributions for this month yet — subscribers need completed payments so allocations are
                        recorded.
                      </p>
                    ) : null}
                    <p className="mt-1">
                      Tier pools — 5-match: INR {(preview.fiveMatchPoolCents / 100).toFixed(0)} · 4-match: INR{" "}
                      {(preview.fourMatchPoolCents / 100).toFixed(0)} · 3-match: INR {(preview.threeMatchPoolCents / 100).toFixed(0)}
                    </p>
                    <p className="mt-1">
                      Projected winners — 5-number: {preview.winnerCounts.tier5} · 4-number: {preview.winnerCounts.tier4} · 3-number:{" "}
                      {preview.winnerCounts.tier3}
                    </p>
                    <p className="mt-1 text-amber-200/80">
                      If published now, rollover to next month: INR {(preview.rolloverOutCents / 100).toFixed(0)} (only if no 5-match
                      winner)
                    </p>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
        <PaginationBar
          pathname="/admin"
          searchParams={sp}
          paramName="dp"
          page={drawsPage}
          totalPages={drawsTotalPages}
          hash="#admin-draws"
        />
      </section>

      <section id="admin-verification" className={cn("scroll-mt-[7.5rem]", bentoSection)}>
        <h2 className={sectionTitle}>Winner verification &amp; payouts</h2>
        <p className={cn(sectionSubtitle, "mt-1")}>
          Approve or reject proof; mark payout once verification is complete
        </p>
        <div className="mt-6 space-y-3 text-sm">
          {claims.map((claim) => {
            const canMarkPaid =
              claim.verificationStatus === VerificationStatus.APPROVED && claim.payoutStatus !== PayoutStatus.PAID;
            return (
              <div
                key={claim.id}
                className={cn(bentoInset, "grid gap-3 p-4 lg:grid-cols-[1fr_auto] lg:items-start")}
              >
                <div className="text-brand-offwhite/85">
                  <p>
                    {claim.user.name} ({claim.user.email}) · {claim.draw.month}/{claim.draw.year} · match{" "}
                    {claim.matchCount} · INR {(claim.amountCents / 100).toFixed(0)}
                  </p>
                  <p className="mt-1 text-brand-offwhite/45">Proof: {claim.proofUrl ?? "—"}</p>
                  <p className="mt-1 text-xs text-brand-electric">
                    Verification: {claim.verificationStatus} · Payout: {claim.payoutStatus}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <form action={verifyWinnerAction}>
                    <input type="hidden" name="claimId" value={claim.id} />
                    <input type="hidden" name="approved" value="true" />
                    <button
                      type="submit"
                      className="rounded-full border border-emerald-400/35 bg-emerald-500/15 px-4 py-2 text-xs font-semibold text-brand-offwhite backdrop-blur-sm transition hover:border-emerald-400/50 hover:bg-emerald-500/25"
                    >
                      Approve
                    </button>
                  </form>
                  <form action={verifyWinnerAction}>
                    <input type="hidden" name="claimId" value={claim.id} />
                    <input type="hidden" name="approved" value="false" />
                    <button
                      type="submit"
                      className="rounded-full border border-rose-500/50 bg-rose-950/50 px-4 py-2 text-xs font-semibold text-rose-200 hover:bg-rose-950/80"
                    >
                      Reject
                    </button>
                  </form>
                  {canMarkPaid ? (
                    <form action={markWinnerPayoutPaidAction}>
                      <input type="hidden" name="claimId" value={claim.id} />
                      <button
                        type="submit"
                        className="rounded-full border border-emerald-500/50 bg-emerald-950/60 px-4 py-2 text-xs font-semibold text-emerald-100 hover:bg-emerald-950/90"
                      >
                        Mark paid
                      </button>
                    </form>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
        <PaginationBar
          pathname="/admin"
          searchParams={sp}
          paramName="clp"
          page={claimsPage}
          totalPages={claimsTotalPages}
          hash="#admin-verification"
        />
      </section>
      </div>
    </main>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <article className={glassStatCard}>
      <p className={bentoLabel}>{label}</p>
      <p className={cn(bentoValue, "mt-2 text-2xl font-semibold tabular-nums")}>{value}</p>
    </article>
  );
}
