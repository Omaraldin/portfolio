"use client";

import { useEffect, useRef } from "react";

/**
 * Hover or keyboard-focus a project on the board and everything it connects to
 * stays lit while the rest fades back. Plain DOM work on the server-rendered
 * SVG: no state, so tracing never re-renders the board.
 */
export function BoardTracer({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const edges = [...root.querySelectorAll<SVGGElement>("[data-edge]")];
    const nodes = [...root.querySelectorAll<SVGElement>("[data-node]")];

    const trace = (id: string) => {
      root.dataset.tracing = "true";
      const lit = new Set([id]);
      for (const e of edges) {
        const ends = (e.dataset.links ?? "").split(" ");
        const on = ends.includes(id);
        e.toggleAttribute("data-lit", on);
        if (on) ends.forEach((n) => lit.add(n));
      }
      root.querySelectorAll<SVGGElement>(".wb-item").forEach((item) => {
        item.toggleAttribute("data-lit", lit.has(item.dataset.item ?? ""));
      });
    };
    const clear = () => {
      delete root.dataset.tracing;
      root.querySelectorAll("[data-lit]").forEach((el) => el.removeAttribute("data-lit"));
    };

    const handlers = nodes.map((n) => {
      const id = n.dataset.node ?? "";
      const on = () => trace(id);
      n.addEventListener("mouseenter", on);
      n.addEventListener("focus", on);
      n.addEventListener("mouseleave", clear);
      n.addEventListener("blur", clear);
      return () => {
        n.removeEventListener("mouseenter", on);
        n.removeEventListener("focus", on);
        n.removeEventListener("mouseleave", clear);
        n.removeEventListener("blur", clear);
      };
    });
    return () => handlers.forEach((off) => off());
  }, []);

  return (
    <div ref={ref} className="wb-board">
      {children}
    </div>
  );
}
