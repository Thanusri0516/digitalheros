/** Abstract electric streak + orb glow (onboarding reference). */
export function HeroGlow() {
  return (
    <div className="relative flex min-h-[220px] w-full flex-1 items-center justify-center overflow-hidden md:min-h-[300px]">
      <div className="absolute inset-0 bg-gradient-to-b from-brand-indigo/20 via-transparent to-transparent" />
      <div
        className="absolute -top-4 left-1/2 h-24 w-[140%] max-w-4xl -translate-x-1/2 rotate-[-8deg] bg-gradient-to-r from-transparent via-sky-400/50 to-transparent blur-3xl"
        aria-hidden
      />
      <div
        className="absolute top-1/2 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-500/25 blur-[100px]"
        aria-hidden
      />
      <div
        className="absolute bottom-0 left-1/4 h-40 w-40 rounded-full bg-brand-accent/20 blur-[80px]"
        aria-hidden
      />
      <svg
        viewBox="0 0 200 48"
        className="relative z-[1] h-14 w-full max-w-xs opacity-95 drop-shadow-[0_0_14px_rgba(56,189,248,0.75)] md:max-w-md"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          d="M0,40 Q40,38 50,28 T100,20 T150,12 T200,8"
          fill="none"
          stroke="rgb(56, 189, 248)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
