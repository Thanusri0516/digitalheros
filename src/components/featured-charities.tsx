import Link from "next/link";
import { getHomeFeaturedCharities } from "@/lib/cached-charities";
import {
  glassSectionLg,
  interactiveLiftSubtleZoom,
  sectionSubtitle,
  sectionTitle,
} from "@/lib/glass-styles";
import { cn } from "@/lib/cn";

/** PRD: featured / spotlight charity section on homepage */
export async function FeaturedCharities() {
  const items = await getHomeFeaturedCharities();
  if (!items.length) return null;

  return (
    <section
      id="featured-charities"
      className={cn(glassSectionLg, "relative z-[1] mt-10 scroll-mt-[7.5rem] md:col-span-2")}
    >
      <h2 className={sectionTitle}>Spotlight charities</h2>
      <p className={cn(sectionSubtitle, "text-zinc-500")}>
        Organizations highlighted by our team. Subscribers can choose any listed charity — explore the full directory for
        search and filters.
      </p>
      <ul className="mt-8 grid gap-5 sm:grid-cols-2">
        {items.map((c) => (
          <li key={c.id}>
            <Link
              href={`/charities/${c.id}`}
              className={cn(
                "flex gap-4 rounded-2xl border border-white/[0.1] bg-white/[0.04] p-4 backdrop-blur-sm transition-[border-color,background-color] hover:border-white/[0.16] hover:bg-white/[0.06] md:p-5",
                interactiveLiftSubtleZoom,
              )}
            >
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-white/[0.08] bg-brand-charcoal/50">
                {c.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- admin-provided URLs
                  <img src={c.imageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-2xl text-brand-offwhite/25" aria-hidden>
                    ◆
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">Featured</p>
                <p className="mt-1 font-semibold text-brand-offwhite">{c.name}</p>
                <p className="mt-1 line-clamp-2 text-sm text-brand-offwhite/60">{c.description}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-8 text-sm text-zinc-500">
        <Link href="/charities" className="font-medium text-zinc-300 underline-offset-4 transition-colors hover:text-white">
          View all charities
        </Link>
        <span className="text-zinc-600"> — search, filter, full profiles.</span>
      </p>
    </section>
  );
}
