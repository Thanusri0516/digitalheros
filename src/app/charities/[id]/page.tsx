import Link from "next/link";
import { notFound } from "next/navigation";
import { createDonationCheckoutAction } from "@/app/actions";
import { PageGlassBackdrop } from "@/components/page-glass-backdrop";
import { StickyJumpNav, type StickyJumpItem } from "@/components/sticky-jump-nav";
import { FormPendingButton } from "@/components/form-pending-button";
import { bentoSection, eyebrow, ghostButton, sectionSubtitle, sectionTitle } from "@/lib/glass-styles";
import { cn } from "@/lib/cn";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const CHARITIES_JUMP: StickyJumpItem[] = [
  { href: "/", label: "Home" },
  { href: "/charities", label: "All charities" },
  { href: "/signup", label: "Subscribe" },
];

type PageProps = { params: Promise<{ id: string }>; searchParams?: Promise<Record<string, string | string[] | undefined>> };

/** PRD: individual charity profile — description, images, upcoming events; optional one-time donation */
export default async function CharityDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const sp = searchParams ? await searchParams : {};
  const donationMsg =
    typeof sp.donation === "string" ? sp.donation : Array.isArray(sp.donation) ? sp.donation[0] : undefined;

  const charity = await prisma.charity.findUnique({ where: { id } });
  if (!charity) notFound();

  const session = await getSession();

  return (
    <main className="relative mx-auto w-full max-w-7xl flex-1 px-5 py-10 md:px-8">
      <PageGlassBackdrop />
      <div className="relative z-[1]">
        <StickyJumpNav ariaLabel="Site navigation" items={CHARITIES_JUMP} />
        <p className={eyebrow}>Charity profile</p>
        <h1 className="font-heading mt-3 text-3xl font-medium tracking-[-0.03em] text-zinc-50 md:text-[2.25rem]">
          {charity.name}
        </h1>
        {charity.featured ? (
          <span className="mt-3 inline-flex rounded-md border border-white/[0.1] bg-white/[0.05] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-400">
            Featured partner
          </span>
        ) : null}

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            {charity.imageUrl ? (
              <div className="overflow-hidden rounded-2xl border border-white/[0.1] bg-brand-charcoal/40">
                {/* eslint-disable-next-line @next/next/no-img-element -- admin URL */}
                <img src={charity.imageUrl} alt="" className="max-h-[min(420px,50vh)] w-full object-cover" />
              </div>
            ) : null}
            <p className={cn(sectionSubtitle, "mt-6 max-w-3xl")}>{charity.description}</p>
            {charity.events ? (
              <section className="mt-8">
                <h2 className="text-lg font-semibold text-brand-offwhite">Upcoming events</h2>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-brand-offwhite/70">{charity.events}</p>
              </section>
            ) : (
              <p className="mt-6 text-sm text-brand-offwhite/45">Event listings will appear here when provided by admins.</p>
            )}
          </div>

          <aside className="space-y-6">
            {donationMsg === "success" ? (
              <p className="rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100/95">
                Thank you — your one-time donation payment was received.
              </p>
            ) : null}
            {donationMsg === "cancelled" ? (
              <p className="rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-3 text-sm text-brand-offwhite/70">
                Donation checkout was cancelled.
              </p>
            ) : null}

            <div className={cn(bentoSection, "flex flex-col gap-4")}>
              <h2 className={sectionTitle}>One-time donation</h2>
              <p className="text-sm text-brand-offwhite/55">
                Independent contribution (PRD) — not tied to prize draws. Processed securely via Stripe.
              </p>
              {session ? (
                <form action={createDonationCheckoutAction} className="flex flex-col gap-4">
                  <input type="hidden" name="charityId" value={charity.id} />
                  <div>
                    <label className="mb-1.5 block text-xs text-brand-offwhite/45">Amount (INR)</label>
                    <input
                      name="amountInr"
                      type="number"
                      min={100}
                      step={50}
                      defaultValue={500}
                      required
                      className="w-full rounded-xl border border-white/[0.1] bg-white/[0.04] px-3 py-2.5 text-sm text-brand-offwhite"
                    />
                    <p className="mt-1 text-[11px] text-brand-offwhite/40">Minimum ₹100</p>
                  </div>
                  <FormPendingButton pendingLabel="Redirecting to Stripe…" className={cn(ghostButton, "border-white/15")}>
                    Pay with Stripe
                  </FormPendingButton>
                </form>
              ) : (
                <p className="text-sm text-brand-offwhite/60">
                  <Link href="/login" className="font-semibold text-sky-300/95 hover:underline">
                    Sign in
                  </Link>{" "}
                  to make a one-time donation.
                </p>
              )}
            </div>

            <div className={cn(bentoSection, "text-sm text-brand-offwhite/60")}>
              <p>
                Subscribers can also route a share of every subscription payment to this charity from the{" "}
                <Link href="/dashboard" className="font-medium text-sky-300/95 hover:underline">
                  dashboard
                </Link>
                .
              </p>
            </div>
          </aside>
        </div>

        <p className="mt-12 text-center text-sm text-brand-offwhite/45">
          <Link href="/charities" className="font-semibold text-sky-300/95 hover:underline">
            ← Back to directory
          </Link>
        </p>
      </div>
    </main>
  );
}
