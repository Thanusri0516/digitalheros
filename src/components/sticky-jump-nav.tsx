import Link from "next/link";
import { interactiveLiftSubtle, interactiveLiftSubtleZoom } from "@/lib/glass-styles";
import { cn } from "@/lib/cn";

export type StickyJumpItem = { href: string; label: string };

type Props = {
  items: StickyJumpItem[];
  ariaLabel: string;
  className?: string;
  /** Landing home only — subtle hover scale on section links. */
  liftZoom?: boolean;
};

/**
 * Sticky secondary nav below the main header. Uses Next.js Link for client-side route transitions
 * (no full document reload). Pair section targets with scroll-margin in globals or per-section classes.
 */
export function StickyJumpNav({ items, ariaLabel, className, liftZoom }: Props) {
  const lift = liftZoom ? interactiveLiftSubtleZoom : interactiveLiftSubtle;
  return (
    <nav
      aria-label={ariaLabel}
      className={cn(
        "sticky z-40 -mx-5 border-b border-white/[0.05] bg-black/20 px-5 py-3 backdrop-blur-xl md:-mx-8 md:px-8",
        className,
      )}
      style={{ top: "var(--app-sticky-subnav-top, 4.5rem)" }}
    >
      <ul className="flex flex-wrap gap-1.5 md:gap-2">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              prefetch
              className={cn(
                "inline-flex min-h-[2.25rem] items-center rounded-lg border border-transparent bg-white/[0.03] px-3.5 py-1.5 text-[12px] font-medium text-zinc-400 ring-1 ring-inset ring-white/[0.04] backdrop-blur-sm hover:border-white/[0.06] hover:bg-white/[0.06] hover:text-zinc-200 md:text-[13px]",
                lift,
              )}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
