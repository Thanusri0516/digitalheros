import { cn } from "@/lib/cn";

/** Shown during route transitions; keep paint cheap (no heavy glass card styles). */
export default function Loading() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-5 py-24">
      <div
        className={cn(
          "flex flex-col items-center rounded-2xl border border-white/[0.06] bg-white/[0.03] px-10 py-8 backdrop-blur-sm",
        )}
      >
        <div
          className="h-9 w-9 animate-spin rounded-full border-2 border-sky-400/20 border-t-sky-400/80"
          role="status"
          aria-label="Loading"
        />
        <p className="mt-4 text-sm text-zinc-500">Loading…</p>
      </div>
    </div>
  );
}

