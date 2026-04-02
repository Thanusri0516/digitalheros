"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/actions";
import { FormPendingButton } from "@/components/form-pending-button";
import { NavPillTabs } from "@/components/nav-pill-tabs";
import { interactiveLiftSubtle } from "@/lib/glass-styles";
import { cn } from "@/lib/cn";

type HeaderUser = {
  name: string;
  role: "USER" | "ADMIN";
};

export function NavHeaderActions({ user }: { user: HeaderUser | null }) {
  const pathname = usePathname();
  const onAdminPage = pathname.startsWith("/admin");
  const onDashboardPage = pathname.startsWith("/dashboard");
  const onHowItWorksPage = pathname === "/how-it-works";

  const navPill = (active: boolean) =>
    cn(
      "shrink-0 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3.5 py-2 text-[13px] font-medium text-zinc-400 ring-1 ring-inset ring-white/[0.03] backdrop-blur-sm transition-colors hover:border-white/[0.12] hover:bg-white/[0.06] hover:text-zinc-200",
      interactiveLiftSubtle,
      active && "border-white/[0.14] bg-white/[0.08] text-zinc-100",
    );

  const charitiesLink = (
    <Link href="/charities" className={navPill(pathname === "/charities")}>
      Charities
    </Link>
  );

  if (!user) {
    return (
      <div className="flex w-full min-w-0 flex-1 flex-wrap items-center justify-end gap-2 sm:gap-3">
        {charitiesLink}
        <Link href="/how-it-works" className={navPill(onHowItWorksPage)}>
          How it works
        </Link>
        <NavPillTabs />
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2">
      {charitiesLink}
      {user.role === "ADMIN" ? (
        <>
          {!onAdminPage && (
            <Link href="/admin" className={navPill(onAdminPage)}>
              Admin
            </Link>
          )}
          <Link href="/dashboard" className={navPill(onDashboardPage)}>
            Dashboard
          </Link>
        </>
      ) : (
        <>
          <Link href="/dashboard" className={navPill(onDashboardPage)}>
            Dashboard
          </Link>
          <Link href="/subscribe" className={navPill(pathname === "/subscribe")}>
            Subscribe
          </Link>
        </>
      )}
      <form action={logoutAction}>
        <FormPendingButton
          pendingLabel="Signing out…"
          className={cn(
            "cursor-pointer rounded-lg border border-white/[0.1] bg-white/[0.04] px-3.5 py-2 text-[12px] font-medium text-zinc-400 backdrop-blur-sm hover:border-white/[0.16] hover:bg-white/[0.08] hover:text-zinc-200 disabled:opacity-80",
            interactiveLiftSubtle,
          )}
        >
          Logout · {user.name}
        </FormPendingButton>
      </form>
    </div>
  );
}
