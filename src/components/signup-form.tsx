"use client";

import { useActionState, useState } from "react";
import { signupActionState } from "@/app/actions";
import { FormPendingButton } from "@/components/form-pending-button";
import { AuthPasswordField } from "@/components/auth-password-field";
import { glassInput } from "@/lib/glass-styles";
import { cn } from "@/lib/cn";
import { AuthRoleTabs, type AuthRole } from "@/components/auth-role-tabs";
import { AUTH_ACTION_INITIAL_STATE } from "@/lib/auth-action-state";

export function SignupForm() {
  const [role, setRole] = useState<AuthRole>("USER");
  const [localError, setLocalError] = useState("");
  const [state, formAction] = useActionState(signupActionState, AUTH_ACTION_INITIAL_STATE);

  return (
    <form
      action={formAction}
      className="flex flex-1 flex-col gap-5"
      onSubmit={(e) => {
        const form = e.currentTarget;
        const p = (form.querySelector('[name="password"]') as HTMLInputElement)?.value ?? "";
        const c = (form.querySelector('[name="confirmPassword"]') as HTMLInputElement)?.value ?? "";
        if (p !== c) {
          e.preventDefault();
          setLocalError("Passwords do not match");
          return;
        }
        setLocalError("");
      }}
    >
      <AuthRoleTabs fieldName="accountType" value={role} onValueChange={setRole} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="signup-name" className="mb-1.5 block text-sm font-medium text-brand-offwhite/80">
            Name
          </label>
          <input
            id="signup-name"
            name="name"
            required
            autoComplete="name"
            placeholder="Full name"
            className={cn(glassInput, "rounded-xl text-[15px]")}
          />
        </div>
        <div>
          <label htmlFor="signup-email" className="mb-1.5 block text-sm font-medium text-brand-offwhite/80">
            Email address
          </label>
          <input
            id="signup-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className={cn(glassInput, "rounded-xl text-[15px]")}
          />
        </div>
      </div>

      <AuthPasswordField name="password" label="Password" minLength={6} autoComplete="new-password" />
      <AuthPasswordField name="confirmPassword" label="Confirm password" minLength={6} autoComplete="new-password" />

      {role === "ADMIN" ? (
        <div>
          <label htmlFor="signup-admin-key" className="mb-1.5 block text-sm font-medium text-brand-offwhite/80">
            Admin signup key
          </label>
          <input
            id="signup-admin-key"
            name="adminKey"
            required
            autoComplete="off"
            placeholder="Required for admin accounts"
            className={cn(glassInput, "rounded-xl text-[15px]")}
          />
        </div>
      ) : (
        <input type="hidden" name="adminKey" value="" />
      )}

      {localError ? <p className="text-sm text-rose-300/90">{localError}</p> : null}
      {!localError && state.error ? <p className="text-sm text-rose-300/90">{state.error}</p> : null}

      <FormPendingButton
        pendingLabel="Creating account…"
        className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-100 py-3.5 text-base font-medium text-zinc-950 shadow-[0_1px_0_0_rgba(255,255,255,0.35)_inset] transition-[background-color,opacity] hover:bg-white disabled:opacity-60"
      >
        Create account
        <ArrowRt />
      </FormPendingButton>

      <div className="mt-2">
        <p className="text-center text-xs text-zinc-500">Or sign up with</p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled
            className="flex items-center justify-center gap-2 rounded-xl border border-zinc-600/80 bg-zinc-900/40 py-3 text-sm font-medium text-zinc-500"
          >
            <LinkedInIc />
            LinkedIn
          </button>
          <button
            type="button"
            disabled
            className="flex items-center justify-center gap-2 rounded-xl border border-zinc-600/80 bg-zinc-900/40 py-3 text-sm font-medium text-zinc-500"
          >
            <GoogleIc />
            Google
          </button>
        </div>
        <p className="mt-2 text-center text-[11px] text-zinc-600">Social sign-up coming soon</p>
      </div>
    </form>
  );
}

function ArrowRt() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LinkedInIc() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-[#0A66C2]" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function GoogleIc() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}
