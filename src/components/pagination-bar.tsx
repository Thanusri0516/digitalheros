import Link from "next/link";
import { cn } from "@/lib/cn";

type Search = Record<string, string | string[] | undefined>;

function buildHref(pathname: string, current: Search, paramName: string, page: number): string {
  const q = new URLSearchParams();
  for (const [key, val] of Object.entries(current)) {
    if (key === paramName || val === undefined) continue;
    const v = Array.isArray(val) ? val[0] : val;
    if (v !== undefined && v !== "") q.set(key, v);
  }
  q.set(paramName, String(page));
  const qs = q.toString();
  return qs ? `${pathname}?${qs}` : `${pathname}?${paramName}=${page}`;
}

type Props = {
  pathname: string;
  /** Current URL search params (pass through from page) */
  searchParams: Search;
  paramName: string;
  page: number;
  totalPages: number;
  /** Optional anchor e.g. #admin-users */
  hash?: string;
  className?: string;
};

export function PaginationBar({ pathname, searchParams, paramName, page, totalPages, hash = "", className }: Props) {
  if (totalPages <= 1) return null;

  const prev = Math.max(1, page - 1);
  const next = Math.min(totalPages, page + 1);
  const suffix = hash || "";

  return (
    <nav
      className={cn("mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-4 text-sm", className)}
      aria-label="Pagination"
    >
      <p className="text-zinc-500">
        Page <span className="tabular-nums text-zinc-300">{page}</span> of{" "}
        <span className="tabular-nums text-zinc-300">{totalPages}</span>
      </p>
      <div className="flex items-center gap-2">
        <Link
          href={buildHref(pathname, searchParams, paramName, prev) + suffix}
          className={cn(
            "rounded-lg border border-white/[0.1] px-3 py-1.5 text-zinc-400 transition-colors hover:border-white/[0.16] hover:text-zinc-200",
            page <= 1 && "pointer-events-none opacity-35",
          )}
          aria-disabled={page <= 1}
        >
          Previous
        </Link>
        <Link
          href={buildHref(pathname, searchParams, paramName, next) + suffix}
          className={cn(
            "rounded-lg border border-white/[0.1] px-3 py-1.5 text-zinc-400 transition-colors hover:border-white/[0.16] hover:text-zinc-200",
            page >= totalPages && "pointer-events-none opacity-35",
          )}
          aria-disabled={page >= totalPages}
        >
          Next
        </Link>
      </div>
    </nav>
  );
}
