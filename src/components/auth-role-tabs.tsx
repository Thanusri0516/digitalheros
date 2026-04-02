"use client";

import { cn } from "@/lib/cn";

export type AuthRole = "USER" | "ADMIN";

type Props = {
  fieldName: "loginType" | "accountType";
  value: AuthRole;
  onValueChange: (role: AuthRole) => void;
};

export function AuthRoleTabs({ fieldName, value, onValueChange }: Props) {
  return (
    <div className="w-full">
      <input type="hidden" name={fieldName} value={value} readOnly />
      <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">Account type</p>
      <div className="grid grid-cols-2 gap-1 rounded-lg border border-white/[0.08] bg-black/30 p-1 ring-1 ring-inset ring-white/[0.04]">
        <button
          type="button"
          onClick={() => onValueChange("USER")}
          className={cn(
            "rounded-md px-3 py-2.5 text-center text-[13px] font-medium transition-[background-color,color,box-shadow] duration-200",
            value === "USER"
              ? "bg-white/[0.1] text-zinc-100 shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset]"
              : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300",
          )}
        >
          Member
        </button>
        <button
          type="button"
          onClick={() => onValueChange("ADMIN")}
          className={cn(
            "rounded-md px-3 py-2.5 text-center text-[13px] font-medium transition-[background-color,color,box-shadow] duration-200",
            value === "ADMIN"
              ? "bg-white/[0.1] text-zinc-100 shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset]"
              : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300",
          )}
        >
          Administrator
        </button>
      </div>
    </div>
  );
}
