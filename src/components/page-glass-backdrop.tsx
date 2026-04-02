/** Soft radial depth behind main content — pair with `<main className="relative ...">`. */
export function PageGlassBackdrop() {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 h-[min(560px,75vh)] bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(56,189,248,0.06),transparent_70%),radial-gradient(ellipse_55%_40%_at_80%_20%,rgba(99,102,241,0.05),transparent_65%)]"
      aria-hidden
    />
  );
}
