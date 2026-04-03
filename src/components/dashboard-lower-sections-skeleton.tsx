import { cn } from "@/lib/cn";
import { bentoCard, bentoCardTitle } from "@/lib/glass-styles";

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-2xl border border-white/[0.08] bg-white/[0.04]", className)}
      aria-hidden
    />
  );
}

/** Matches lower dashboard layout: scores → winnings → profile. */
export function DashboardLowerSectionsSkeleton() {
  return (
    <div className="grid gap-6">
      <section className={cn(bentoCard, "space-y-4")}>
        <div className={cn(bentoCardTitle, "h-6 w-48 rounded-md bg-white/[0.06]")} aria-hidden />
        <SkeletonBlock className="h-4 w-full max-w-xl" />
        <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
          <SkeletonBlock className="h-12" />
          <SkeletonBlock className="h-12" />
          <SkeletonBlock className="h-12 sm:max-w-[8rem]" />
        </div>
        <div className="space-y-3 border-t border-white/[0.08] pt-6">
          <SkeletonBlock className="h-24" />
          <SkeletonBlock className="h-24" />
        </div>
      </section>

      <section className={cn(bentoCard, "space-y-4")}>
        <div className={cn(bentoCardTitle, "h-6 w-56 rounded-md bg-white/[0.06]")} aria-hidden />
        <SkeletonBlock className="h-20" />
        <SkeletonBlock className="h-10 w-40" />
      </section>

      <section className={cn(bentoCard, "space-y-4")}>
        <div className={cn(bentoCardTitle, "h-6 w-40 rounded-md bg-white/[0.06]")} aria-hidden />
        <SkeletonBlock className="h-32" />
        <SkeletonBlock className="h-10 w-36" />
      </section>

      <section className={cn(bentoCard, "space-y-4")}>
        <div className={cn(bentoCardTitle, "h-6 w-52 rounded-md bg-white/[0.06]")} aria-hidden />
        <SkeletonBlock className="h-48" />
      </section>
    </div>
  );
}
