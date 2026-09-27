"use client";

import { useEffect, useState } from "react";

type Sparkle = { id: number; size: number; top: string; left: string; color: string };

const COLORS = ["#ffd966", "#dfe7cf", "#f5f0e4", "#9cc28a"];

function makeSparkle(id: number): Sparkle {
  return {
    id,
    size: 10 + Math.random() * 12,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  };
}

/**
 * Wraps a word in little four-point stars that pop in and out. Pure garnish:
 * the stars are aria-hidden, start only after mount (so nothing differs between
 * server and client), and never start for reduced-motion visitors.
 */
export function Sparkles({ children }: { children: React.ReactNode }) {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let id = 0;
    const timer = window.setInterval(() => {
      id += 1;
      const now = id;
      setSparkles((current) =>
        // Keep the last few; each one's animation has finished by then.
        [...current.slice(-3), makeSparkle(now)],
      );
    }, 450);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <span className="relative inline-block">
      {sparkles.map((sparkle) => (
        <svg
          key={sparkle.id}
          aria-hidden
          width={sparkle.size}
          height={sparkle.size}
          viewBox="0 0 68 68"
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2 animate-sparkle"
          style={{ top: sparkle.top, left: sparkle.left }}
        >
          <path
            fill={sparkle.color}
            stroke="#1a1a14"
            strokeWidth="4"
            d="M26.5 25.5C19 33.4 0 34 0 34s19.1.8 26.5 8.5C34 50.3 34 68 34 68s0-17.7 7.5-25.5C49.1 34.8 68 34 68 34s-19-.6-26.5-8.5C34 17.6 34 0 34 0s0 17.6-7.5 25.5z"
          />
        </svg>
      ))}
      <span className="relative">{children}</span>
    </span>
  );
}
