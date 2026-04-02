function Sparkles() {
  const spots = [
    { t: "12%", l: "8%", s: 3, o: 0.9 },
    { t: "22%", l: "88%", s: 2, o: 0.7 },
    { t: "8%", l: "48%", s: 2, o: 0.5 },
    { t: "76%", l: "12%", s: 2, o: 0.6 },
    { t: "68%", l: "78%", s: 3, o: 0.85 },
    { t: "48%", l: "50%", s: 2, o: 0.4 },
    { t: "56%", l: "92%", s: 2, o: 0.55 },
    { t: "36%", l: "20%", s: 2, o: 0.5 },
  ];
  return (
    <>
      {spots.map((p, i) => (
        <span
          key={i}
          className="pointer-events-none absolute rounded-full bg-white"
          style={{
            top: p.t,
            left: p.l,
            width: p.s,
            height: p.s,
            opacity: p.o,
            boxShadow: "0 0 12px rgba(147,197,253,0.75)",
          }}
          aria-hidden
        />
      ))}
    </>
  );
}

function PortalGraphic() {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center px-8 pt-12 pb-6">
      <div className="relative h-64 w-64 md:h-72 md:w-72">
        <div
          className="absolute inset-0 rounded-full border border-sky-400/25 shadow-[0_0_80px_rgba(56,189,248,0.2),inset_0_0_60px_rgba(59,130,246,0.06)] backdrop-blur-[2px]"
          aria-hidden
        />
        <div className="absolute inset-6 rounded-full border border-white/[0.08]" aria-hidden />
        <div className="absolute inset-[22%] rounded-full bg-gradient-to-br from-sky-500/10 via-transparent to-violet-500/10 blur-md" aria-hidden />
        <Sparkles />
      </div>
    </div>
  );
}

type Props = {
  testimonialQuote: string;
  testimonialName: string;
  testimonialRole: string;
};

/** Desktop hero column — server-rendered with the rest of the auth shell. */
export function AuthSplitHero({ testimonialQuote, testimonialName, testimonialRole }: Props) {
  return (
    <div className="relative hidden min-w-0 flex-[1.05] flex-col overflow-hidden bg-brand-charcoal/85 md:flex">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_35%,rgba(59,130,246,0.12),transparent_60%)]" />
      <PortalGraphic />
      <div className="relative z-[1] mt-auto border-t border-white/[0.08] bg-brand-charcoal/90 p-8 backdrop-blur-md">
        <p className="text-[15px] leading-relaxed text-brand-offwhite/92">&ldquo;{testimonialQuote}&rdquo;</p>
        <p className="mt-4 text-sm font-semibold text-brand-offwhite">{testimonialName}</p>
        <p className="text-xs text-brand-offwhite/45">{testimonialRole}</p>
      </div>
    </div>
  );
}
