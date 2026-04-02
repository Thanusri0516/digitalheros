import { cn } from "@/lib/cn";

export default function AdminLoading() {
  return (
    <main className="relative mx-auto w-full max-w-7xl flex-1 px-5 py-8 md:px-8 md:py-10">
      <div className="mb-8 space-y-3">
        <div className="h-3 w-20 animate-pulse rounded bg-white/[0.06]" />
        <div className="h-9 w-40 animate-pulse rounded-lg bg-white/[0.08]" />
        <div className="h-4 w-full max-w-lg animate-pulse rounded bg-white/[0.05]" />
      </div>
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={cn("h-24 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.03]")}
          />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.03]" />
    </main>
  );
}
