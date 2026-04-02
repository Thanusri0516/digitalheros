import Link from "next/link";
import { AuthSplitShell } from "@/components/auth-split-shell";
import { SignupForm } from "@/components/signup-form";

export default function SignupPage() {
  return (
    <AuthSplitShell
      title="Create account"
      subtitle="Subscriber accounts use the member path; administrators need the organization key supplied by your team."
      quickLinks={[
        { href: "/", label: "Home" },
        { href: "/charities", label: "Charities" },
        { href: "/login", label: "Log in" },
      ]}
      testimonialQuote="Thanks to this charity golf model, I finally have one place for Stableford history, monthly draws, and giving—without the spreadsheet chaos."
      testimonialName="Jordan Ellis"
      testimonialRole="Golfer · subscriber"
      footer={
        <>
          <p className="text-center text-sm text-zinc-500">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-zinc-300 underline-offset-4 hover:text-white">
              Log in
            </Link>
          </p>
          <p className="text-center text-xs leading-relaxed text-zinc-600">
            By signing up you agree to our{" "}
            <Link href="#" className="text-zinc-400 underline-offset-2 hover:text-zinc-200">
              Terms &amp; Conditions
            </Link>{" "}
            and{" "}
            <Link href="#" className="text-zinc-400 underline-offset-2 hover:text-zinc-200">
              Privacy Policy
            </Link>
            .
          </p>
        </>
      }
    >
      <SignupForm />
    </AuthSplitShell>
  );
}
