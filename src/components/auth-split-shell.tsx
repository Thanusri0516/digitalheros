import Link from "next/link";
import type { ReactNode } from "react";
import { AuthSplitHero } from "@/components/auth-split-hero";
import { bentoInset, glassNavLink, interactiveLift } from "@/lib/glass-styles";
import { cn } from "@/lib/cn";

function BrandMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="shrink-0 text-sky-400/90" aria-hidden>
      <path
        d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7-6.3-4.6-6.3 4.6 2.3-7-6-4.6h7.6L12 2z"
        fill="currentColor"
        opacity="0.95"
      />
    </svg>
  );
}

type QuickLink = { href: string; label: string };

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  testimonialQuote: string;
  testimonialName: string;
  testimonialRole: string;
  footer: ReactNode;
  /** In-app links (Next.js client navigation, no full reload) */
  quickLinks?: QuickLink[];
};

export function AuthSplitShell({
  title,
  subtitle,
  children,
  testimonialQuote,
  testimonialName,
  testimonialRole,
  footer,
  quickLinks,
}: Props) {
  return (
    <main className="relative flex min-h-[calc(100dvh-5rem)] flex-1 items-center justify-center px-4 py-8 md:min-h-[calc(100dvh-4.5rem)] md:px-6 md:py-10">
      <div
        className={cn(
          "w-full max-w-5xl overflow-hidden rounded-2xl border border-white/[0.06] bg-zinc-950/90 shadow-[0_48px_100px_-40px_rgba(0,0,0,0.75)] ring-1 ring-inset ring-white/[0.04] backdrop-blur-xl motion-safe:hover:border-white/[0.1]",
          interactiveLift,
        )}
      >
        <div className="flex min-h-[560px] w-full flex-col md:flex-row md:min-h-[620px]">
          <div className="flex min-h-0 flex-1 flex-col border-b border-white/[0.06] bg-zinc-950/80 px-6 py-9 sm:px-10 md:border-b-0 md:border-r md:border-white/[0.06] md:py-12 lg:pl-12 lg:pr-10">
            <Link
              href="/"
              className="mb-8 flex w-fit items-center gap-2.5 font-heading text-[0.9375rem] font-medium tracking-[-0.02em] text-zinc-100"
            >
              <BrandMark />
              <span className="hidden sm:inline">Digital Heroes</span>
              <span className="sm:hidden">DH</span>
            </Link>

            {quickLinks?.length ? (
              <nav aria-label="Quick navigation" className="mb-8 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {quickLinks.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    prefetch={false}
                    className={cn(glassNavLink, "text-center text-xs sm:text-[13px]")}
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>
            ) : null}

            <h1 className="font-heading text-2xl font-medium tracking-[-0.03em] text-zinc-50 md:text-[1.85rem] md:leading-snug">
              {title}
            </h1>
            {subtitle ? <p className="mt-3 text-[15px] leading-relaxed text-zinc-500">{subtitle}</p> : null}

            <div className="mt-8 flex flex-1 flex-col">{children}</div>

            <div className={cn(bentoInset, "mt-8 p-4 md:hidden")}>
              <p className="text-sm leading-relaxed text-brand-offwhite/90">&ldquo;{testimonialQuote}&rdquo;</p>
              <p className="mt-3 text-sm font-semibold text-brand-offwhite">{testimonialName}</p>
              <p className="text-xs text-brand-offwhite/45">{testimonialRole}</p>
            </div>

            <div className="mt-8 space-y-4 border-t border-white/[0.08] pt-6">{footer}</div>
          </div>

          <AuthSplitHero
            testimonialQuote={testimonialQuote}
            testimonialName={testimonialName}
            testimonialRole={testimonialRole}
          />
        </div>
      </div>
    </main>
  );
}
