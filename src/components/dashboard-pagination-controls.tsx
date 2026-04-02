"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";

type Which = "dp" | "cp" | "pap";

type Props = {
  which: Which;
  page: number;
  totalPages: number;
  tokens: { dp: number; cp: number; pap: number };
  /** Query keys to preserve (omit dp/cp/pap — those are set from tokens + which) */
  extra: Record<string, string>;
  className?: string;
};

function href(extra: Record<string, string>, tokens: Props["tokens"], which: Which, targetPage: number) {
  const q = new URLSearchParams(extra);
  q.set("dp", String(which === "dp" ? targetPage : tokens.dp));
  q.set("cp", String(which === "cp" ? targetPage : tokens.cp));
  q.set("pap", String(which === "pap" ? targetPage : tokens.pap));
  return `/dashboard?${q.toString()}`;
}

export function DashboardPaginationControls({ which, page, totalPages: tp, tokens, extra, className }: Props) {
  if (tp <= 1) return null;

  const prev = Math.max(1, page - 1);
  const next = Math.min(tp, page + 1);

  return (
    <nav
      className={cn(
        "mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-4 text-sm",
        className,
      )}
      aria-label="Pagination"
    >
      <p className="text-zinc-500">
        Page <span className="tabular-nums text-zinc-300">{page}</span> of{" "}
        <span className="tabular-nums text-zinc-300">{tp}</span>
      </p>
      <div className="flex items-center gap-2">
        <Link
          href={href(extra, tokens, which, prev)}
          className={cn(
            "rounded-lg border border-white/[0.1] px-3 py-1.5 text-zinc-400 transition-colors hover:border-white/[0.16] hover:text-zinc-200",
            page <= 1 && "pointer-events-none opacity-35",
          )}
          aria-disabled={page <= 1}
        >
          Previous
        </Link>
        <Link
          href={href(extra, tokens, which, next)}
          className={cn(
            "rounded-lg border border-white/[0.1] px-3 py-1.5 text-zinc-400 transition-colors hover:border-white/[0.16] hover:text-zinc-200",
            page >= tp && "pointer-events-none opacity-35",
          )}
          aria-disabled={page >= tp}
        >
          Next
        </Link>
      </div>
    </nav>
  );
}
