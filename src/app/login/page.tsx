import Link from "next/link";
import { AuthSplitShell } from "@/components/auth-split-shell";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <AuthSplitShell
      title="Welcome back"
      subtitle="Sign in to track scores, join draws, and support your chosen charity."
      quickLinks={[
        { href: "/", label: "Home" },
        { href: "/charities", label: "Charities" },
        { href: "/signup", label: "Sign up" },
      ]}
      testimonialQuote="This platform made it simple to play monthly and know our charity share is real. Clear draws, fair scores, and a dashboard that just works."
      testimonialName="Alex Mercer"
      testimonialRole="Subscriber · Digital Heroes Golf"
      footer={
        <>
          <p className="text-center text-sm text-zinc-500">
            New here?{" "}
            <Link href="/signup" className="font-medium text-zinc-300 underline-offset-4 hover:text-white">
              Create account
            </Link>
          </p>
          <p className="text-center text-xs leading-relaxed text-zinc-600">
            By continuing you agree to our{" "}
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
      <LoginForm />
    </AuthSplitShell>
  );
}
