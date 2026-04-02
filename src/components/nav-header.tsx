import Link from "next/link";
import { NavHeaderActions } from "@/components/nav-header-actions";
import { interactiveLiftSubtle } from "@/lib/glass-styles";
import { cn } from "@/lib/cn";

type HeaderUser = {
  name: string;
  role: "USER" | "ADMIN";
};

function MarkIcon() {
  return (
    <span
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/[0.08] bg-white/[0.04] ring-1 ring-inset ring-white/[0.04]"
      aria-hidden
    >
      <span className="flex gap-0.5">
        <span className="h-3.5 w-px bg-gradient-to-b from-sky-400/90 to-violet-400/70" />
        <span className="h-3.5 w-px bg-gradient-to-b from-violet-400/70 to-sky-400/50" />
      </span>
    </span>
  );
}

/** Server-rendered shell + fixed <nav> classes; pathname/active state lives in NavHeaderActions (client). */
export function NavHeader({ user }: { user: HeaderUser | null }) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.05] bg-[#07080d]/85 backdrop-blur-2xl supports-[backdrop-filter]:bg-[#07080d]/72">
      <nav className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-3.5 md:px-8">
        <Link
          href="/"
          className={cn(
            "group flex shrink-0 items-center gap-3 text-zinc-100",
            interactiveLiftSubtle,
          )}
        >
          <MarkIcon />
          <span className="flex flex-col leading-none">
            <span className="font-heading text-[0.9375rem] font-medium tracking-[-0.02em]">Digital Heroes</span>
            <span className="mt-0.5 text-[10px] font-normal uppercase tracking-[0.18em] text-zinc-500">
              Charity platform
            </span>
          </span>
        </Link>
        <NavHeaderActions user={user} />
      </nav>
    </header>
  );
}
