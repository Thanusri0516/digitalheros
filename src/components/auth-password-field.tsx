"use client";

import { useId, useState } from "react";
import { glassInput } from "@/lib/glass-styles";
import { cn } from "@/lib/cn";

type Props = {
  name: string;
  label: string;
  id?: string;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
};

export function AuthPasswordField({
  name,
  label,
  id,
  required = true,
  minLength = 6,
  autoComplete,
}: Props) {
  const genId = useId();
  const inputId = id ?? genId;
  const [show, setShow] = useState(false);

  return (
    <div className="w-full">
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-brand-offwhite/80">
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          name={name}
          type={show ? "text" : "password"}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
          className={cn(glassInput, "rounded-xl pr-12 text-[15px]")}
          placeholder="••••••••"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-brand-offwhite/45 transition hover:bg-white/5 hover:text-brand-offwhite/90"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M3 3l18 18M10.58 10.58a3 3 0 1 0 4.24 4.24M9.9 4.24A9.94 9.94 0 0 1 12 5c6 0 10 7 10 7a18.16 18.16 0 0 1-2.16 3.19M6.6 6.6A18.1 18.1 0 0 0 2 12s4 7 10 7a9.74 9.74 0 0 0 4.52-1" />
    </svg>
  );
}
