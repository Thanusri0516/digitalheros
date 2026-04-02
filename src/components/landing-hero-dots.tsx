"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

const DOT_COUNT = 4;
const PROXIMITY_RADIUS = 72;

/** Decorative “tab” dots with cursor-proximity scale and glow on the landing hero. */
export function LandingHeroDots() {
  const refs = useRef<(HTMLSpanElement | null)[]>([]);
  const rafRef = useRef<number>(0);
  const [weights, setWeights] = useState(() => Array.from({ length: DOT_COUNT }, () => 0));
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const applyProximity = useCallback(
    (clientX: number, clientY: number) => {
      if (reduceMotion) {
        setWeights(Array.from({ length: DOT_COUNT }, () => 0));
        return;
      }
      const next = Array.from({ length: DOT_COUNT }, (_, i) => {
        const el = refs.current[i];
        if (!el) return 0;
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const d = Math.hypot(clientX - cx, clientY - cy);
        const w = Math.max(0, 1 - d / PROXIMITY_RADIUS);
        return w * w;
      });
      setWeights(next);
    },
    [reduceMotion],
  );

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduceMotion) return;
    const x = e.clientX;
    const y = e.clientY;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      applyProximity(x, y);
    });
  };

  const onMouseLeave = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setWeights(Array.from({ length: DOT_COUNT }, () => 0));
  };

  useEffect(
    () => () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  return (
    <div
      className="flex gap-2 pt-1"
      aria-hidden
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {Array.from({ length: DOT_COUNT }, (_, i) => (
        <span
          key={i}
          className="landing-hero-tab-wrap inline-flex"
          style={{ animationDelay: `${i * 0.18}s` } as React.CSSProperties}
        >
          <span
            ref={(el) => {
              refs.current[i] = el;
            }}
            style={
              {
                "--dot-p": String(weights[i] ?? 0),
              } as React.CSSProperties
            }
            className={cn(
              "landing-hero-dot block h-2 rounded-full transition-[width,background-color] duration-300",
              i === 0 ? "w-8 bg-brand-offwhite" : "w-2 bg-brand-offwhite/25",
            )}
          />
        </span>
      ))}
    </div>
  );
}
