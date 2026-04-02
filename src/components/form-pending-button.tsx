"use client";

import { useFormStatus } from "react-dom";
import { cn } from "@/lib/cn";

type Props = {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
};

/** Submit button that reflects server action pending state (must be inside the same <form>). */
export function FormPendingButton({ children, pendingLabel = "Please wait…", className }: Props) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={cn(
        "transition-opacity duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        className,
        pending && "cursor-wait opacity-90",
      )}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
