"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { interactiveLiftSubtle } from "@/lib/glass-styles";
import { cn } from "@/lib/cn";

const TABS = [
  { href: "/", label: "Home" },
  { href: "/login", label: "Sign in" },
  { href: "/signup", label: "Register" },
] as const;

export function NavPillTabs() {
  const pathname = usePathname();

  return (
    <div className="flex max-w-full items-center gap-0.5 overflow-x-auto rounded-lg border border-white/[0.08] bg-black/25 p-1 ring-1 ring-inset ring-white/[0.04] backdrop-blur-md">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "relative rounded-md px-3.5 py-2 text-[13px] font-medium outline-none transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500/50",
              interactiveLiftSubtle,
              active ? "bg-white/[0.08] text-zinc-100" : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
