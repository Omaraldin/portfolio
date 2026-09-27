"use client";

import { useEffect, useRef } from "react";

/**
 * A thin gradient bar pinned to the top of the viewport that fills as the
 * article is read. Written straight to the element's transform on scroll —
 * no React state, so scrolling never re-renders anything.
 */
export function ReadingProgress() {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      const progress = max > 0 ? Math.min(1, el.scrollTop / max) : 0;
      if (bar.current) bar.current.style.transform = `scaleX(${progress})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="no-print fixed inset-x-0 top-0 z-[60] h-1.5"
    >
      <div
        ref={bar}
        className="h-full origin-left scale-x-0 bg-[linear-gradient(90deg,var(--accent),var(--pop-yellow))]"
      />
    </div>
  );
}
