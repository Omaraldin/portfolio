"use client";

import { useEffect, useState } from "react";
import { Chibi } from "./chibi";

/**
 * The chibi hanging upside down from under the header bar. At rest only his
 * hair and eyes show below the bar's edge; every so often — and whenever he is
 * hovered — he drops the rest of the way to show his whole face, then
 * retreats.
 *
 * The clip box starts at the bar's bottom edge, so whatever is above it is
 * simply cut off: he reads as tucked behind the bar, not as layered over it.
 */
export function ChibiPeek({ className = "" }: { className?: string }) {
  const [out, setOut] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timers: number[] = [];
    const cycle = () => {
      setOut(true);
      timers.push(window.setTimeout(() => setOut(false), 2200));
      timers.push(window.setTimeout(cycle, 9000 + Math.random() * 7000));
    };
    timers.push(window.setTimeout(cycle, 4000));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);

  const shown = out || hovered;

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute top-full h-[68px] w-[72px] overflow-hidden ${className}`}
    >
      <div
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        className={`pointer-events-auto absolute bottom-0 left-1/2 w-[72px] -translate-x-1/2 rotate-180 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          shown ? "translate-y-0" : "translate-y-[-16px]"
        }`}
      >
        <Chibi decorative className="w-full" sizes="72px" />
      </div>
    </div>
  );
}
