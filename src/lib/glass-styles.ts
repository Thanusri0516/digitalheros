/**
 * Shared surface styles — restrained contrast, inset hairlines, Outfit headings.
 */

export const interactiveLift =
  "transition-[border-color,background-color,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:hover:z-10 motion-safe:hover:shadow-[0_24px_48px_-16px_rgba(0,0,0,0.55)]";

export const interactiveLiftSubtle =
  "transition-[border-color,background-color,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:hover:z-10";

export const interactiveLiftZoom =
  "transform-gpu transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform motion-safe:hover:z-10 motion-safe:hover:scale-[1.02] motion-safe:hover:shadow-[0_32px_64px_-20px_rgba(0,0,0,0.5)] motion-safe:active:scale-[1.01]";

export const interactiveLiftSubtleZoom =
  "transform-gpu transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform motion-safe:hover:z-10 motion-safe:hover:scale-[1.015] motion-safe:active:scale-[0.995]";

export const glassPanel =
  "rounded-xl border border-white/[0.06] bg-white/[0.04] p-8 shadow-[0_32px_64px_-28px_rgba(0,0,0,0.55)] ring-1 ring-inset ring-white/[0.04] backdrop-blur-xl motion-safe:hover:border-white/[0.1] motion-safe:hover:bg-white/[0.05] " +
  interactiveLift;

export const glassHero =
  "relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.04] p-7 shadow-[0_40px_80px_-32px_rgba(0,0,0,0.6)] ring-1 ring-inset ring-white/[0.04] backdrop-blur-xl md:p-9 motion-safe:hover:border-white/[0.09] " +
  interactiveLift;

export const glassSection =
  "rounded-xl border border-white/[0.07] bg-gradient-to-b from-white/[0.055] to-white/[0.02] p-6 shadow-[0_32px_64px_-28px_rgba(0,0,0,0.55)] ring-1 ring-inset ring-white/[0.04] backdrop-blur-xl md:p-9 motion-safe:hover:border-white/[0.1] " +
  interactiveLiftZoom;

export const glassSectionLg =
  "rounded-2xl border border-white/[0.07] bg-gradient-to-b from-white/[0.06] to-white/[0.025] p-8 shadow-[0_48px_96px_-40px_rgba(0,0,0,0.65)] ring-1 ring-inset ring-white/[0.05] backdrop-blur-xl md:p-11 md:pl-12 md:pr-12 motion-safe:hover:border-white/[0.1] " +
  interactiveLiftZoom;

export const bentoCard =
  "rounded-xl border border-white/[0.06] bg-zinc-950/75 p-6 shadow-[0_28px_56px_-20px_rgba(0,0,0,0.65)] ring-1 ring-inset ring-white/[0.04] backdrop-blur-xl md:p-8 motion-safe:hover:border-white/[0.1] motion-safe:hover:bg-zinc-950/82 " +
  interactiveLift;

export const bentoSection =
  "rounded-xl border border-white/[0.06] bg-zinc-950/78 p-6 shadow-[0_28px_56px_-20px_rgba(0,0,0,0.62)] ring-1 ring-inset ring-white/[0.04] backdrop-blur-xl md:p-8 motion-safe:hover:border-white/[0.1] " +
  interactiveLift;

export const bentoHero =
  "relative overflow-hidden rounded-xl border border-white/[0.06] bg-gradient-to-b from-zinc-900/85 to-zinc-950/92 p-7 shadow-[0_36px_72px_-28px_rgba(0,0,0,0.72)] ring-1 ring-inset ring-white/[0.05] backdrop-blur-xl md:p-9 motion-safe:hover:border-white/[0.09] " +
  interactiveLift;

export const bentoInset =
  "rounded-lg border border-white/[0.06] bg-black/25 p-4 ring-1 ring-inset ring-white/[0.03] backdrop-blur-sm motion-safe:hover:border-white/[0.1] " +
  interactiveLiftSubtle;

export const bentoCardTitle =
  "font-heading text-[1.0625rem] font-medium tracking-[-0.015em] text-zinc-100";

export const bentoLabel = "text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500";

export const bentoValue = "text-sm font-medium tabular-nums text-zinc-200";

export const bentoMetricGrid = "grid gap-5 sm:grid-cols-2 lg:grid-cols-3";

export const glassInput =
  "w-full rounded-lg border border-white/[0.08] bg-black/30 px-4 py-3.5 text-sm text-zinc-100 placeholder:text-zinc-600 backdrop-blur-sm transition-[border-color,box-shadow] duration-200 focus:border-sky-500/40 focus:outline-none focus:ring-1 focus:ring-sky-500/20 motion-safe:hover:border-white/[0.12]";

export const glassInputCompact =
  "w-full rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2.5 text-sm text-zinc-100 backdrop-blur-sm transition-[border-color,box-shadow] duration-200 focus:border-sky-500/40 focus:outline-none focus:ring-1 focus:ring-sky-500/20 motion-safe:hover:border-white/[0.12]";

export const ghostButton =
  "inline-flex w-full items-center justify-center rounded-lg border border-white/[0.12] bg-white/[0.04] px-4 py-3.5 text-sm font-medium text-zinc-100 shadow-none backdrop-blur-sm transition-[border-color,background-color,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-white/[0.18] hover:bg-white/[0.08]";

export const glassInset =
  "rounded-lg border border-white/[0.06] bg-white/[0.03] ring-1 ring-inset ring-white/[0.03] backdrop-blur-sm motion-safe:hover:border-white/[0.1] " +
  interactiveLiftSubtleZoom;

export const glassNavLink =
  "block rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2.5 text-sm text-zinc-200 ring-1 ring-inset ring-white/[0.02] backdrop-blur-sm motion-safe:hover:border-white/[0.12] motion-safe:hover:bg-white/[0.05] " +
  interactiveLiftSubtle;

export const glassStatCard =
  "rounded-xl border border-white/[0.06] bg-zinc-950/80 p-6 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.55)] ring-1 ring-inset ring-white/[0.04] backdrop-blur-xl motion-safe:hover:border-white/[0.1] " +
  interactiveLift;

export const eyebrow =
  "text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500";

export const sectionTitle =
  "font-heading text-xl font-medium tracking-[-0.025em] text-zinc-50 md:text-2xl md:tracking-[-0.03em]";

export const sectionSubtitle = "mt-3 max-w-2xl text-[15px] leading-[1.65] text-zinc-500";
