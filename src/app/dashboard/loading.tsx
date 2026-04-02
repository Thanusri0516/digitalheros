import { cn } from "@/lib/cn";

export default function DashboardLoading() {
  return (
    <main className="relative mx-auto w-full max-w-7xl flex-1 px-5 py-8 md:px-8 md:py-10">
      <div className="mb-8 space-y-3">
        <div className="h-3 w-24 animate-pulse rounded bg-white/[0.06]" />
        <div className="h-8 w-48 animate-pulse rounded-lg bg-white/[0.08]" />
        <div className="h-4 w-full max-w-md animate-pulse rounded bg-white/[0.05]" />
      </div>
      <div className="mb-6 h-12 animate-pulse rounded-lg bg-white/[0.05]" />
      <div className="grid gap-6 md:grid-cols-2">
        <div className={cn("min-h-[200px] animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.03]")} />
        <div className={cn("min-h-[200px] animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.03]")} />
      </div>
    </main>
  );
}
